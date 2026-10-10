# Plaguekind/Qwen3.8-27B-FrostDFlash-MixedLow-GGUF

## Resumen

Qwen3.8-27B-FrostDFlash-MixedLow es una cuantización GGUF de precisión mixta del borrador especulativo (drafter) DFlash2 desarrollado por z-lab para el modelo objetivo Qwen3.8-27B. No es un modelo de lenguaje autónomo: se trata de un modelo auxiliar de aproximadamente 1,9 mil millones de parámetros que se ejecuta como acompañante del modelo objetivo bajo decodificación especulativa en llama.cpp, con el tipo de especulación `draft-dflash`. Su función es proponer varios tokens candidatos por paso para que el modelo grande los verifique en paralelo, reduciendo el coste por token generado sin alterar la distribución de salida del modelo verificador.

El autor, Plaguekind, ha reconstruido el borrador desde el GGUF BF16 original de z-lab aplicando una receta de cuantización por tensor en la que las partes sensibles al error de cuantización se mantienen en alta precisión y las redundantes se degradan de forma agresiva. En concreto, la cabeza selectora (`selector_hidden`) queda en Q6_K, los caminos residuales (`attn_v`, `ffn_down`, `attn_conv_proj`, `ffn_conv_proj`) y las proyecciones predecessor/successor en Q5_K, las proyecciones de atención y `fc` en IQ4_XS, y las puertas FFN (`ffn_gate`, `ffn_up`) en IQ3_S. El resultado ocupa 999 MiB en disco (988,92 MiB de pesos) con 4,31 bits por peso y 81 tensores.

La relevancia de esta ficha es doble: por un lado documenta una técnica reproducible de cuantización con gradiente de precisión que ahorra unos 91 MiB respecto a un Q4_K_M plano manteniendo mayor precisión efectiva en los tensores críticos; por otro, ilustra el ecosistema incipiente de borradores especulativos de tipo block-diffusion para llama.cpp, una vía poco explorada para acelerar modelos densos de clase 27B en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2: borrador block-diffusion con 5 bloques DFlash (`blk.0`-`blk.4`), atencion con `attn_q/k/output/v` y `attn_q_norm`/`attn_k_norm`, caminos convolucionales (`attn_conv_base`/`attn_conv_proj`, `ffn_conv_base`/`ffn_conv_proj`) y FFN con `ffn_gate/up/down`; etiqueta de tamano 1.9B (`general.architecture = dflash`) |
| Parametros totales | 1.924.404.480 (~1,9 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con receta mixta por tensor: Q6_K, Q5_K, IQ4_XS, IQ3_S y F32 (promedio 4,31 BPW); 81 tensores |
| Idiomas soportados | en (segun la model card); al compartir tokenizer y embeddings con el modelo objetivo, los idiomas efectivos son los de Qwen3.8-27B |
| Licencia | apache-2.0 (heredada de la fuente) |
| Formato de pesos | GGUF (archivo unico `Qwen3.8-27B-FrostDFlash-MixedLow.gguf`); safetensors solo aparece como referencia del recuento de parametros |
| Tamano en disco | 999 MiB (1.047.907.936 B); pesos 988,92 MiB; ~10 MiB de cabecera y alineamiento GGUF |
| Dimension de embedding | 5120 |
| RoPE base | 1e7 |
| Embeddings propios | no tiene (`token_embd` y `output.weight` se toman del modelo objetivo) |
| Modelo base | Qwen/Qwen3.8-27B |
| Fuente BF16 | z-lab/Qwen3.8-27B-DFlash2-GGUF, sha256 `26d47ca20ab07688327a63d912acad222d924eaaa92a980cc488de3c67e736bc` |
| Herramienta de cuantizacion | llama.cpp `llama-quantize` (commit `8b54361`), flag `--pure` |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un borrador especulativo de tipo block-diffusion, no un transformer autorregresivo convencional. Consta de 5 bloques DFlash, cada uno con atención completa (proyecciones Q, K, V y output con normalización por cabeza), un camino convolucional paralelo tanto en atención como en FFN, y una FFN estándar de tres matrices. La dimensión de embedding es 5120 y la base de RoPE es 1e7. La pieza diferencial es la cabeza selectora, compuesta por `selector_hidden` (Q6_K, ~1 MiB) y dos proyecciones `selector_predecessor` y `selector_successor` (Q5_K, 41,7 MiB cada una): es el componente que decide qué tokens proponer en cada paso. La proyección de entrada `fc.weight` (IQ4_XS, 66,4 MiB) transforma las características de entrada, y hay dos normalizaciones de salida (`output_norm` y `enc.output_norm`) en F32.

No se dispone de información sobre el proceso de entrenamiento del borrador original: ni número de tokens, ni composición del dataset, ni si hubo etapas de RLHF o DPO. Lo que sí está documentado es el proceso de cuantización, que no es un entrenamiento sino una compresión: se parte del GGUF BF16 de z-lab y se aplica una receta por tensor definida en `dflash_q4_recipe.txt` con 81 líneas `nombre=tipo`. La distribución verificada de tipos en el archivo final es 32 tensores F32 (todas las normas y bases convolucionales unidimensionales; la receta pedía f16, pero la build conserva los tensores 1-D en F32 con impacto despreciable), 22 Q5_K, 16 IQ4_XS, 10 IQ3_S y 1 Q6_K. El comando de cuantización es reproducible, pero tiene una trampa importante: `llama-quantize` procesa los flags a partir del índice 1 de `argv`, de modo que si se coloca primero un argumento posicional (entrada, salida o tipo base) el bucle de flags se detiene y todas las sobreescrituras `--tensor-type-*` se descartan silenciosamente, generando un Q5_K plano de ~1286 MiB en lugar del archivo de 989 MiB. Los flags deben ir antes de los posicionales.

## Capacidades

- Generación de propuestas de tokens: no genera texto de forma autónoma, sino que propone hasta 3 tokens candidatos por paso (`--spec-draft-n-max 3`) para que el modelo objetivo los verifique.
- Selección de tokens mediante cabeza dedicada (`selector_hidden`, `selector_predecessor`, `selector_successor`), que determina qué posiciones merece la pena proponer.
- Decodificación especulativa con llama.cpp bajo el tipo `draft-dflash`, con reparto de capas a GPU independiente del modelo objetivo (`--n-gpu-layers-draft`).
- Reutilización del tokenizer y de la matriz de embeddings de salida del modelo objetivo, sin vocabulario propio.
- Caminos convolucionales en atención y FFN, característicos de la arquitectura block-diffusion.
- Tool calling / function calling: no disponible (no es un modelo conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplica directamente; puede acelerar las llamadas al modelo objetivo en pipelines agénticos.
- Capacidades multilingües: las del modelo objetivo; la model card declara únicamente `en`.
- Capacidades especiales: modo thinking, visión o audio: no disponible.

## Casos de uso

- Aceleración de inferencia local de Qwen3.8-27B en llama.cpp: el borrador se carga junto al modelo objetivo con `--spec-type draft-dflash` y `--n-gpu-layers-draft all`, de modo que la VRAM adicional necesaria es de aproximadamente 1 GB y la ganancia de velocidad depende de la tasa de aceptación de las propuestas.
- Servicio multiusuario con `llama-server`: el par objetivo + borrador se expone como endpoint compatible con la API de OpenAI, y el borrador actúa de forma transparente para el cliente, sin cambios en el prompt ni en el formato de respuesta.
- Despliegue en GPU de consumo: al ocupar 999 MiB, el borrador cabe holgadamente junto a un modelo objetivo cuantizado en una única GPU de gama alta (por ejemplo RTX 5090 o RTX 4090), siempre que el objetivo quepa en la VRAM restante.
- Reducción de coste en GPUs alquiladas: en escenarios de generación de texto largo con latencia tolerada pero coste por hora sensible, la decodificación especulativa permite obtener más tokens por segundo en la misma instancia, reduciendo el coste por millón de tokens generados.
- Investigación en decodificación especulativa y block-diffusion: el archivo, con su receta por tensor documentada y su distribución de dtypes verificada, sirve como punto de partida reproducible para estudiar el impacto de la precisión de cada componente del borrador en la tasa de aceptación.
- Evaluación comparativa de recetas de cuantización: al coexistir en la misma carpeta con un Q4_K_M plano (1090 MiB) y un Q8_0 (1,93 GiB), permite medir empíricamente si el gradiente de precisión por tensor compensa la pérdida de 91 MiB frente al Q4_K_M.
- Pipelines de generación por lotes con llama.cpp: en tareas de resumen, extracción o reescritura sobre corpus grandes, donde el cuello de botella es el throughput de decodificación y no la calidad del prompt, el borrador aporta velocidad sin modificar la distribución final del modelo verificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de tasa de aceptación (acceptance rate), speedup medido, MMLU, HumanEval, GSM8K ni ninguna otra métrica en la model card ni en los resultados de búsqueda. El autor únicamente aporta cifras de compresión: 4,31 BPW, 999 MiB en disco y 81 tensores.

## Requisitos de hardware

- VRAM para el borrador: aproximadamente 1 GB (archivo de 999 MiB; pesos 988,92 MiB). Es una cifra derivada del tamaño del archivo, no una medición publicada.
- VRAM total: la del borrador más la del modelo objetivo Qwen3.8-27B, que no se detalla en la información disponible; la model card menciona un objetivo cuantizado en Q6_K_P como pareja de despliegue.
- GPU recomendadas: no disponible. El autor mantiene una campaña de financiación etiquetada como "RTX 5090 FUND", lo que sugiere que el desarrollo se ha validado en una RTX 5090, pero no se documentan pruebas en A100, H100 u otras.
- Cabe en GPU de consumo: sí en lo que respecta al borrador, que con ~1 GB es viable en cualquier GPU con más de 1 GB libre; el modelo objetivo de 27B es el que determina el requisito real.
- Opciones de despliegue: llama.cpp, tanto en modo `llama-server` como en CLI, con los flags `--model-draft`, `--spec-type draft-dflash`, `--spec-draft-n-max 3`, `--n-gpu-layers all` y `--n-gpu-layers-draft all`. No se documenta soporte en vLLM, TGI, Ollama ni otros motores: no disponible.
- Latencia y throughput estimados: no disponible. No se publican ni latencias por token ni tokens por segundo, ni la tasa de aceptación del borrador.

## Comparativa con modelos similares

Comparación con las otras cuantizaciones del mismo borrador DFlash2 disponibles en la misma carpeta, según los datos de la model card:

| Modelo | Tamano en disco | BPW | Notas |
|---|---|---|---|
| Qwen3.8-27B-FrostDFlash-MixedLow (este) | 999 MiB | 4,31 | Receta por tensor con gradiente de precision; Q6_K en la cabeza selectora y Q5_K en el camino residual |
| DFlash2 Q4_K_M | 1090 MiB | no disponible | Cuantizacion plana estandar |
| DFlash2 Q8_0 | 1,93 GiB | no disponible | Practicamente sin perdida |
| DFlash2 BF16 (z-lab) | no disponible | no disponible | Fuente original sin cuantizar |

Frente a alternativas de otras familias de borradores especulativos (por ejemplo borradores autorregresivos pequeños de tipo EAGLE o Medusa para modelos densos), no se dispone de datos comparativos de tasa de aceptación ni de speedup, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: no puede generar texto por sí solo ni responder a prompts directamente; requiere siempre un modelo objetivo Qwen3.8-27B que verifique sus propuestas.
- Dependencia fuerte del motor: solo está documentado su uso con llama.cpp y el tipo de especulación `draft-dflash`; no hay evidencia de compatibilidad con otros runtimes.
- Idiomas: la model card declara únicamente inglés (`en`); no se documenta cobertura multilingüe propia.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y sin benchmarks publicados; no hay evidencia externa de calidad ni de tasa de aceptación.
- Riesgo de degradación del speedup: si la tasa de aceptación cae, la decodificación especulativa puede incluso ralentizar la generación por el coste de verificación; el valor `--spec-draft-n-max 3` es el único ajuste documentado y no se aportan curvas de rendimiento.
- Trampa de reproducibilidad: en `llama-quantize` los flags `--` deben preceder a los argumentos posicionales; en caso contrario las sobreescrituras por tensor se descartan de forma silenciosa y se obtiene un archivo Q5_K plano de ~1286 MiB distinto del publicado.
- Licencia: apache-2.0 permite uso comercial del propio borrador, pero el modelo objetivo (Qwen3.8-27B) y el modelo de destino mencionado en la model card (`Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q6_K_P`) pueden tener licencias y condiciones distintas que deben verificarse por separado.
- Contenido: la model card menciona como pareja de despliegue un modelo objetivo etiquetado como "Uncensored" y "Aggressive"; conviene auditar el comportamiento del sistema completo antes de exponerlo a usuarios finales.
- Alucinación: la decodificación especulativa estándar no altera la distribución del modelo verificador, por lo que el borrador no introduce alucinaciones adicionales; el riesgo de alucinación es el del modelo objetivo.
- Sin datos sobre contexto máximo soportado ni sobre el comportamiento del borrador con prompts muy largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Plaguekind/Qwen3.8-27B-FrostDFlash-MixedLow-GGUF
- Fuente BF16 del borrador: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil del autor: https://huggingface.co/Plaguekind
- llama.cpp (motor de inferencia y herramienta `llama-quantize`): https://github.com/ggml-org/llama.cpp
- Pagina de soporte del autor: https://throne.com/plaguekind/item/073bace1-2e1a-4492-95e6-024b4da6459b

Nota: la búsqueda web asociada a esta ficha no devolvió ningún resultado relevante sobre el modelo, la arquitectura DFlash2 ni el autor; los resultados obtenidos eran de naturaleza completamente ajena al contenido técnico y se han descartado.

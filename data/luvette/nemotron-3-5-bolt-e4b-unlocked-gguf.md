# luvette/Nemotron-3.5-Bolt-E4B-unlocked-GGUF

## Resumen

Nemotron-3.5-Bolt-E4B-unlocked es una derivación del modelo `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB` de NVIDIA a la que se le ha eliminado el comportamiento de rechazo (refusal) mediante una técnica de abliteración aplicada directamente sobre el espacio GGUF. El autor, luvette, parte del fichero Q4_K_M publicado por NVIDIA y ortogonaliza dos direcciones en los pesos residuales (`attn_output` y `ffn_down`, capas 8 a 33): una dirección de contenido calculada como diferencia entre medias de prompts dañinos e inofensivos, y una dirección de estado de rechazo obtenida forzando aperturas distintas sobre el mismo prompt. No hay reentrenamiento ni fine-tuning: se parchean 52 tensores con `W' = W − 1.5·R(RᵀW)` y se recuantiza a Q4_K_M.

El modelo base es un transformer de 7.518.069.290 parámetros totales según safetensors, con nomenclatura E4B que sugiere arquitectura con expertos o parámetros condicionales, aunque la información disponible no detalla la configuración MoE ni el número de parámetros activos. El repositorio ocupa 5,3 GB y está pensado para inferencia local con llama.cpp y Ollama. La relevancia actual reside en que demuestra que es posible eliminar el rechazo en un modelo ya cuantizado, sin acceso al checkpoint BF16, con una pérdida de norma de pesos inferior al 0,07 % y una perplejidad en Wikitext-2 que mejora de 107,19 a 89,01.

La licencia es OpenMDW 1.1, con la particularidad de que el modelo base fue post-entrenado sobre Google Gemma 4, cuyos términos se rigen por Apache 2.0. El autor advierte explícitamente de que no hay revisión de seguridad y de que el modelo producirá contenido no permitido si se le solicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles de la variante E4B no disponibles; nomenclatura sugiere parámetros condicionales o MoE) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de uso emplean `-c 8192` y `-c 4096`) |
| Tipos de cuantizacion | Q4_K_M (única publicada en este repo); `per_layer_token_embd` en q8_0 según la receta por defecto de llama.cpp |
| Idiomas soportados | en |
| Licencia | OpenMDW 1.1 (modelo base post-entrenado sobre Gemma 4, Apache 2.0) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de NVIDIA perteneciente a la familia Nemotron 3.5, con 7.518 millones de parámetros totales. La información disponible no especifica si se trata de una arquitectura MoE, híbrida o densa, ni el número de parámetros activos, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO. Tampoco se detalla la longitud de contexto nativa del modelo base.

La intervención de luvette no es un entrenamiento sino una edición de pesos en espacio GGUF. Se calculan dos direcciones: (1) la dirección de contenido, `mean(harmful) − mean(harmless)` sobre 416 prompts de cada clase; y (2) la dirección de estado de rechazo, capturada tras forzar dos aperturas distintas sobre el mismo prompt (`**Content Filter Response:**` frente a `Sure, here is a detailed answer:`). El autor señala que la segunda dirección solo está alineada entre 0,3 y 0,5 con la primera en la zona media de la red, de modo que el par elimina un subespacio genuinamente bidimensional en lugar de restar un único eje. Se parchean 52 tensores de las capas 8 a 33 con `W' = W − 1.5·R(RᵀW)`, donde `R` es la base ortonormalizada por Gram-Schmidt de ambas direcciones, y se recuantiza a Q4_K_M. La pérdida de norma de pesos es inferior al 0,07 %.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con formato de turnos Gemma-4 (`<|turn>user\n…<turn|>\n<|turn>model\n`).
- Modo de razonamiento (thinking) activable mediante `--jinja` y `chat_template_kwargs: {"enable_thinking": true}`, con canal `<|channel>thought\n…<channel|>` dentro del turno del modelo.
- Respuesta sin rechazos ante peticiones dañinas: 0/100 en JBB-Behaviors, 0/60 en jailbreaks reales, 0/100 en AdvBench y 0/3 en prompts de persona DAN, según los datos del autor.
- Razonamiento con thinking habilitado sin rechazo: 0/12 en razonamiento y 0/12 en salida sobre 12 objetivos de JBB.
- Mantenimiento de utilidad en instrucciones inofensivas: 0/24 rechazos en Harmless Alpaca (mismo resultado que el base).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: únicamente inglés declarado.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo sirve como caso de estudio reproducible de eliminación de rechazo en espacio cuantizado, con métricas publicadas (JBB, AdvBench, jailbreaks, perplejidad) para comparar técnicas de edición de pesos frente a fine-tuning.
- Evaluación de robustez de filtros de seguridad: al presentar 0/100 rechazos en JBB-Behaviors y 0/60 en jailbreaks reales, es útil como contraste negativo en auditorías de sistemas de moderación y en pruebas de red teaming controladas.
- Generación creativa sin preámbulos de descargo: el autor documenta que el modelo base filtraba texto de rechazo en prompts neutros (por ejemplo, "render a 3D model") y que esta versión lo elimina, lo que lo hace adecuado para pipelines de escritura donde los disclaimers rompen la salida.
- Despliegue local en hardware de consumo: con Q4_K_M y offload completo cabe en una RTX 3070, con ~94 tok/s según el autor, lo que permite prototipado rápido en estaciones de trabajo sin GPU de datacenter.
- Experimentación con modo thinking en local: el soporte de `<|channel>thought` permite probar cadenas de razonamiento en llama.cpp y Ollama sin depender de APIs externas.
- Integración en Ollama para flujos conversacionales: el repo incluye un `Modelfile` con plantilla de turnos y system prompt que suprime los preámbulos residuales de "disclaimer", lo que simplifica el despliegue en entornos de desarrollo.
- Análisis de degradación por cuantización: al publicarse solo Q4_K_M, sirve para medir el coste de calidad frente al BF16 original en tareas de perplejidad y generación abierta.

## Benchmarks y rendimiento

Datos publicados por el autor, decodificación greedy con temperatura 0 y 96–160 tokens nuevos:

| Benchmark | Base | Este modelo |
|---|---|---|
| JBB-Behaviors (100 objetivos dañinos) | 94/100 rechazados | 0/100 |
| Jailbreaks reales (60 prompts) | 25/60 | 0/60 |
| AdvBench (100 objetivos, held out) | no disponible | 0/100 |
| Prompts de persona DAN (3 que sobrevivieron a v1) | 3/3 | 0/3 |
| Thinking habilitado (12 objetivos JBB) | no disponible | 0/12 razonamiento, 0/12 salida |
| Harmless Alpaca (24 instrucciones) | 0/24 | 0/24 |
| Perplejidad Wikitext-2 (44×512) | 107,19 | 89,01 |

El autor advierte que la mejora de perplejidad debe interpretarse como ausencia de coste de coherencia (el base filtraba texto de rechazo en texto neutro), no como una ganancia general de capacidad, y que solo se ejecutaron comprobaciones puntuales.

## Requisitos de hardware

- VRAM estimada: el repo pesa 5,3 GB y la única cuantización publicada es Q4_K_M, por lo que la inferencia completa requiere del orden de 5–6 GB de VRAM con offload total de capas.
- GPU recomendadas: RTX 3070 con offload completo alcanza ~94 tok/s según el autor. GPU de mayor VRAM (RTX 4090, A100, H100) permitirán contextos más largos y mayor paralelismo, aunque no se publican cifras para ellas.
- Cabe en GPU de consumo: sí, al menos en RTX 3070 con Q4_K_M y `-ngl 99`.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama (`ollama run hf.co/luvette/Nemotron-3.5-Bolt-E4B-unlocked-GGUF:Q4_K_M` o `ollama create` con el `Modelfile` incluido). No se mencionan vLLM ni TGI, que no soportan GGUF de forma nativa en este flujo.
- Latencia y throughput: ~94 tok/s en RTX 3070 a Q4_K_M con offload completo. No se publican cifras para otras GPU ni para contextos largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazo (JBB-Behaviors) | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-unlocked (este) | 7.518 M totales | no disponible | 0/100 | OpenMDW 1.1 | GGUF Q4_K_M |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB (base) | 7.518 M totales | no disponible | 94/100 | OpenMDW 1.1 | GGUF Q4_K_M |
| Alternativas abliteradas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye otros modelos comparables de la misma categoría (derivados abliterados de 7–8B) con datos verificables, por lo que la comparativa se limita al par base/derivado.

## Limitaciones y advertencias

- Sin revisión de seguridad: las barreras se eliminan por construcción y el modelo producirá contenido no permitido si se le solicita. No debe desplegarse en entornos de producción orientados al usuario final.
- Residuo estilístico, no rechazo: el modelo sigue abriendo a menudo con un párrafo de "Disclaimer / legality" antes de cumplir. Un intento de corrección a nivel de pesos destruyó el modelo (8/60 rechazos, PPL 177); el system prompt del `Modelfile` suprime la mayor parte.
- Las direcciones son in-distribution: cero rechazos en tres conjuntos held-out es evidencia fuerte, no prueba para prompts adversarios arbitrarios.
- Sesgo de muestreo: 3 de los 6 prompts DAN usados para la dirección de estado están in-sample; la otra mitad del conjunto de jailbreaks (30 prompts) nunca se usó para calcular direcciones y da 0/30.
- Cuantización: Q4_K_M pierde algo de calidad frente al BF16 original; `per_layer_token_embd` permanece en q8_0 según la receta por defecto de llama.cpp.
- Idioma: solo inglés declarado; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Contexto: no se documenta la longitud de contexto nativa; los ejemplos de uso emplean 4096 y 8192 tokens, pero no se garantiza que el modelo base soporte ventanas mayores.
- Licencia: OpenMDW 1.1 con las notas originales de NVIDIA y Gemma (Apache 2.0) aplicables; conviene revisar los términos de OpenMDW antes de cualquier uso comercial.
- Métricas limitadas: los benchmarks son de rechazo y perplejidad, no de capacidad general (MMLU, HumanEval, GSM8K no se publican).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/luvette/Nemotron-3.5-Bolt-E4B-unlocked-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Licencia Apache 2.0 (Gemma 4): https://www.apache.org/licenses/LICENSE-2.0/
- llama.cpp: no disponible enlace directo en la información proporcionada
- Ollama: no disponible enlace directo en la información proporcionada

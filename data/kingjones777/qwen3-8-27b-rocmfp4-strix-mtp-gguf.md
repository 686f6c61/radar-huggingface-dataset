# kingjones777/Qwen3.8-27B-ROCmFP4-STRIX-MTP-GGUF

## Resumen

Qwen3.8-27B-ROCmFP4-STRIX-MTP-GGUF es una cuantización comunitaria del modelo Qwen3.8-27B (26.896 millones de parámetros, según los pesos en safetensors del modelo base) publicada por el usuario kingjones777. No se trata de un modelo nuevo, sino de una compilación de pesos en formato GGUF pensada específicamente para el hardware AMD Strix Halo (APU Ryzen AI Max+ 395 con GPU integrada Radeon 8060S, arquitectura gfx1151), usando el formato de tensor ROCmFP4 que solo existe en el fork ROCmFPX de llama.cpp.

El interés de esta ficha no está en la cuantización en sí, sino en dos elementos que el autor documenta con mediciones: la inclusión de la cabeza de predicción multi-token (MTP) para decodificación especulativa, cuyo ajuste adecuado multiplica por 2,83 el throughput de decodificación frente a un Q4_K_M estándar en el mismo equipo, y la publicación de una curva de ajuste del parámetro `--spec-draft-n-max` que revela que el valor por defecto de llama.cpp (16) rinde aproximadamente la mitad de lo alcanzable (óptimo en 3-4).

El paquete incluye tres variantes de cuantización (STRIX, STRIX_LEAN y FAST) más un archivo posterior con ponderación por matriz de importancia (imatrix) y cabeza de salida en Q6_K. El repo ocupa 120,9 GB y acumula 8.647 descargas y 39 likes en el momento de la consulta. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B; detalles de atención y capas no disponibles en la información proporcionada) |
| Parametros totales | 26.895.998.464 (26,9 mil millones) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 65.536 tokens validados en esta cuantización; contexto de entrenamiento del modelo base no disponible |
| Tipos de cuantizacion | ROCmFP4 (tipos ggml 103, 105 y 106); variante adicional Q4_0 con cabeza y embeddings en Q6_K; BPW efectivo medido entre 4,25 y 4,39 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp y con el fork ROCmFPX) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-27B en los datos proporcionados: no se detalla el tipo de atención, el número de capas, la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO. Lo que sí documenta esta ficha es el proceso de cuantización.

Las tres variantes principales se generaron con la herramienta `gufo-quant` aplicando la receta STRIX, sin ponderación por importancia. El archivo más reciente (`Qwen3.8-27B-Q4_0_ROCMFP4_STRIX-imatrix-headQ6K.gguf`) mantiene esa receta pero añade ponderación mediante una matriz de importancia obtenida de una calibración orientada a tareas agénticas, y eleva a Q6_K los tensores `output.weight` y `token_embd.weight`. El censo de tensores de ese archivo es de 866, con 82 tensores de tipo 100 y 421 de tipo 101. El autor indica que no conservó la línea de comandos exacta empleada.

La innovación técnica destacable es el uso de la cabeza MTP como modelo borrador para decodificación especulativa, combinada con el ajuste del parámetro de profundidad de borrador. El autor reporta una tasa de aceptación de 0,926 con `n-max 4`. En el archivo con imatrix, la decodificación especulativa se empareja con una cabeza borradora externa DFlash2 en lugar de la MTP incluida en el repo. El formato ROCmFP4 es un formato de tensor en tiempo de ejecución que solo existe en el fork ROCmFPX de llama.cpp, lo que limita la portabilidad del artefacto.

## Capacidades

- Generación de texto conversacional y razonamiento, con modo de pensamiento (`--think`) activable y desactivable en el servidor de inferencia.
- Generación de código: el autor mide 50,6 tok/s de media (rango 45,4-54,9) en seis prompts de código de hasta 256 tokens.
- Tool calling / function calling: 7 de 7 llamadas correctas tanto con `tool_choice` en modo `required` como en `auto`, y 7 de 7 de nuevo con el modo de pensamiento activado.
- Capacidad de visión: 4 de 4 aciertos en una prueba de referencia espacial, y funcionamiento correcto con `-fa on` (flash attention).
- Decodificación especulativa mediante cabeza MTP o mediante la cabeza externa DFlash2, con aceptación de borradores de 1.106 sobre 1.578 tokens en las pruebas de generación de código.
- Contexto largo validado hasta 65.536 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de código en local sobre hardware AMD Strix Halo: un equipo con Ryzen AI Max+ 395 y 128 GB de memoria unificada puede servir el modelo con contexto de 32K y obtener unos 50 tok/s en generación de código, suficiente para autocompletado interactivo y refactorizaciones guiadas sin depender de la nube.
- Agentes con tool calling en producción de pequeña escala: las 7 de 7 llamadas correctas en modo `required` y `auto`, repetidas con pensamiento activado, permiten construir flujos de agente que invocan APIs externas, consultan bases de datos o ejecutan comandos, siempre que el servidor exponga la interfaz compatible con OpenAI que ofrece Super ROC.
- Procesamiento de documentos largos en estación de trabajo: con 65.536 tokens de contexto validados y un preprocesado de 534-556 tok/s en prompts de 13K a 27K tokens, el modelo es adecuado para resumir contratos, analizar informes técnicos o extraer entidades de expedientes completos en una sola pasada.
- Evaluación de modelos Qwen en hardware de consumo profesional: investigadores que necesiten comparar el comportamiento del modelo base con cuantizaciones de 4 bits pueden usar las métricas de perplejidad, divergencia KL y acuerdo top-1 publicadas como referencia reproducible.
- Sustitución de un Q4_K_M en un despliegue llama.cpp existente sobre gfx1151: la paridad de perplejidad (5,8877 frente a 5,8926) con un 22 % menos de tamaño y una carga en frío de 6,3 s frente a 9,4 s hace que el cambio sea atractivo cuando el cuello de botella es la memoria o el tiempo de arranque.
- Prototipado de decodificación especulativa: la curva de ajuste de `--spec-draft-n-max` publicada permite a otros desarrolladores calibrar sus propias cabezas borradoras sin repetir el barrido completo, partiendo de un óptimo documentado de 3-4 en lugar del valor por defecto de 16.
- Inferencia de visión en el borde: la verificación de 4 de 4 en referencia espacial con flash attention activada abre la puerta a tareas de descripción de imágenes o inspección visual en un equipo de sobremesa sin GPU dedicada.

## Benchmarks y rendimiento

Rendimiento medido por el autor en un AMD Ryzen AI Max+ 395 (Radeon 8060S, gfx1151), 128 GB, ROCm 7.2.4, una petición a la vez, temperatura 0 y caché de prompt en frío:

| Medicion | Resultado |
|---|---:|
| Procesado de prompt, 1.566 tokens | 513,6 tok/s |
| Generación tras ese prompt (hasta 256 tokens) | 27,6 tok/s |
| Procesado de prompt, 13.384 tokens | 556,6 tok/s |
| Generación tras ese prompt | 21,3 tok/s |
| Procesado de prompt, 26.821 tokens | 534,6 tok/s |
| Generación tras ese prompt | 21,2 tok/s |
| Generación de código, 6 prompts, media (rango) | 50,6 tok/s (45,4-54,9) |
| Borradores aceptados en esos prompts | 1.106 / 1.578 |
| Tool calls correctas, `required` / `auto` | 7/7 / 7/7 |

Calidad del archivo con imatrix y cabeza Q6_K, medida con la herramienta de perplejidad de Super ROC sobre un corpus de 6K tokens de texto largo con contexto 4096, y contra logits BF16 en wikitext-2 (16 x 512 tokens):

| Metrica | ROCmFP4 imatrix | Unsloth UD-Q4_K_XL |
|---|---:|---:|
| Perplejidad | 5,2830 | 5,1989 |
| Divergencia KL | 0,033983 | 0,006348 |
| Acuerdo top-1 | 91,078 % | 95,858 % |

Comparativa de las tres variantes principales frente a Q4_K_M de referencia, con contexto 65.536, lote 1, greedy, `ignore_eos` y caché de prompt desactivada:

| Build | ftype | Tamano | BPW | TG 8K sin especulación | TG 8K con MTP | PPL |
|---|---|---:|---:|---:|---:|---:|
| ROCmFP4-STRIX | 105 | 13,75 GiB | 4,39 | 13,46 | 30,30 | 5,8877 |
| ROCmFP4-STRIX_LEAN | 106 | 13,59 GiB | 4,34 | 13,46 | no disponible | 5,8871 |
| ROCmFP4-FAST | 103 | 13,33 GiB | 4,25 | 13,44 | 30,13 | 5,9233 |
| Q4_K_M (referencia, ggml-org) | no disponible | 17,67 GiB | no disponible | 10,70 | no disponible | 5,8926 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible.

## Requisitos de hardware

- El artefacto está construido y probado exclusivamente para AMD Strix Halo: Ryzen AI Max+ 395 con GPU Radeon 8060S (gfx1151) y memoria unificada de 128 GB.
- Tamaño de los archivos entre 13,33 y 13,75 GiB, lo que permite cargarlos en configuraciones de memoria unificada muy por debajo de los 128 GB del equipo de referencia.
- VRAM estimada: no disponible de forma independiente; al tratarse de memoria unificada, el modelo reside en el mismo espacio que la RAM del sistema.
- GPU recomendadas: Radeon 8060S (integrada en Ryzen AI Max+ 395). No hay datos de funcionamiento en A100, H100 ni RTX 4090, y el formato ROCmFP4 no es compatible con CUDA.
- No se indica compatibilidad con GPU de consumo NVIDIA. El requisito de ROCm 7.2.4 y del fork ROCmFPX de llama.cpp restringe el despliegue al ecosistema AMD.
- Opciones de despliegue: llama.cpp en su fork ROCmFPX, o el servidor Super ROC del mismo autor (`superroc serve`), que expone una interfaz compatible con endpoints de OpenAI.
- Latencia y throughput medidos: 30,30 tok/s de decodificación con MTP ajustado a 8K de contexto, 13,46 tok/s sin especulación, 21,2-21,3 tok/s en generación tras prompts de 13K-27K tokens, y 513-556 tok/s de preprocesado.
- Carga en frío de 13,7 GiB con `-dio`: 6,3 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-ROCmFP4-STRIX-MTP (esta ficha) | 26,9 mil millones | 65.536 validados | GGUF ROCmFP4, AMD gfx1151 | Apache 2.0 | Hugging Face, 8.647 descargas |
| Unsloth UD-Q4_K_XL de Qwen3.8-27B | 26,9 mil millones | no disponible | GGUF estándar | Apache 2.0 | Hugging Face |
| Q4_K_M de ggml-org (referencia) | 26,9 mil millones | no disponible | GGUF estándar | Apache 2.0 | Hugging Face |
| Otras builds ROCmFP4/ROCmFPX públicas de Qwen3.8-27B | 26,9 mil millones | no disponible | GGUF ROCmFP4 | no disponible | Hugging Face (cuatro builds según el autor) |

En calidad medida, el archivo con imatrix queda por detrás del UD-Q4_K_XL de Unsloth (perplejidad 5,2830 frente a 5,1989; acuerdo top-1 del 91,078 % frente al 95,858 %), mientras que la variante STRIX sin imatrix logra paridad con Q4_K_M (5,8877 frente a 5,8926). La ventaja diferencial de esta publicación es el rendimiento en decodificación sobre gfx1151 y la documentación del ajuste de la cabeza MTP, no la fidelidad respecto al modelo en BF16.

## Limitaciones y advertencias

- El formato ROCmFP4 solo existe en el fork ROCmFPX de llama.cpp; no funciona con llama.cpp upstream, vLLM, TGI, Ollama ni con GPU NVIDIA. La portabilidad del artefacto es prácticamente nula fuera de gfx1151.
- El autor reconoce que no registró la línea de comandos exacta de cuantización del archivo con imatrix, lo que dificulta la reproducibilidad bit a bit.
- La afirmación destacada de que es «la única build pública ROCmFP4 con perplejidad medida y curva de ajuste MTP» se basa en una comparación del contenido de las model cards, no en la ejecución de las otras cuatro builds; el propio autor lo explicita.
- El archivo con imatrix y cabeza Q6_K presenta una divergencia KL de 0,033983 frente a los logits BF16, más de cinco veces superior a la del UD-Q4_K_XL de Unsloth (0,006348), y un acuerdo top-1 del 91,078 % frente al 95,858 %. Para tareas sensibles a la fidelidad de la distribución de salida, la variante STRIX sin imatrix es preferible.
- El ajuste por defecto de `--spec-draft-n-max` en llama.cpp (16) rinde aproximadamente la mitad de lo alcanzable con este modelo; usar los valores por defecto sin calibrar desperdicia la mayor parte de la ventaja en velocidad.
- Las cifras de rendimiento proceden de un único equipo con una petición concurrente y caché de prompt desactivada; no hay datos de throughput con concurrencia ni de latencia bajo carga.
- No hay información sobre sesgos, comportamiento multilingüe ni tasas de alucinación del modelo base en la documentación proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base Qwen3.8-27B y conviene verificar las condiciones de ese modelo antes de desplegar en producción.
- El repositorio ocupa 120,9 GB, muy por encima del tamaño de cualquiera de los archivos individuales, lo que exige planificar el almacenamiento si se descarga completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kingjones777/Qwen3.8-27B-ROCmFP4-STRIX-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Servidor Super ROC: https://github.com/kingjones30/superroc

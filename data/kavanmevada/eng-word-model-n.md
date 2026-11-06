# kavanmevada/eng-word-model-n

## Resumen

`kavanmevada/eng-word-model-n` es un adaptador LoRA publicado en Hugging Face por el usuario kavanmevada, construido sobre el modelo base Qwen/Qwen3.5-0.8B. Se trata, por tanto, de un fine-tuning mediante PEFT (Parameter-Efficient Fine-Tuning) del modelo multimodal Qwen3.5-0.8B, orientado a la tarea image-text-to-text segun declara el pipeline del repositorio. El repositorio contiene unicamente los pesos del adaptador (2,0 GB) y la libreria declarada es `peft`, lo que implica que para su uso es necesario cargar primero el modelo base y despues aplicar el adaptador.

El modelo base Qwen3.5-0.8B es un modelo causal con encoder de vision desarrollado por el equipo Qwen (Alibaba), con 0,8 mil millones de parametros, arquitectura hibrida que combina Gated DeltaNet (atencion lineal) con atencion con compuertas y capas FFN, y una longitud de contexto nativa de 262.144 tokens. Incorpora entrenamiento multimodal con fusion temprana, soporte declarado de 201 idiomas y un modo de decodificacion con Multi-Token Prediction (MTP).

La relevancia de este adaptador concreto es limitada y dificil de evaluar: no hay model card propia, no se documenta el conjunto de datos de entrenamiento, no se especifican los hiperparametros del LoRA ni se publican resultados de evaluacion del adaptador. Con 142 descargas y 0 likes, es un artefacto de investigacion o experimentacion personal mas que un modelo listo para produccion. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-0.8B (transformer hibrido con Gated DeltaNet + Gated Attention y encoder de vision) |
| Parametros totales | 873.438.784 (pesos del repositorio, incluye base y adaptador segun safetensors) |
| Parametros activos | no disponible (el modelo base no es MoE segun la model card; la mencion a MoE en la card de Qwen3.5 corresponde a la familia, no a este tamano) |
| Longitud de contexto | 262.144 tokens (nativa del modelo base) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizacion estandar (GGUF, AWQ, GPTQ) via herramientas de la comunidad, no confirmado en este repo |
| Idiomas soportados | no disponible para el adaptador; el modelo base declara 201 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-0.8B, un modelo de lenguaje causal con encoder de vision. La arquitectura del modelo base combina 24 capas organizadas en 6 bloques de la forma 3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN). Las capas Gated DeltaNet usan 16 cabezas de atencion lineal para V y 16 para QK con dimension de cabeza 128; las capas Gated Attention usan 8 cabezas para Q y 2 para KV con dimension de cabeza 256 y RoPE de dimension 64. La dimension oculta es 1024, la dimension intermedia del FFN es 3584 y el embedding de tokens es de 248.320 entradas (con padding), atado a la salida LM. El modelo base fue entrenado con Multi-Token Prediction (MTP) en varios pasos.

No se dispone de informacion sobre el proceso de entrenamiento del adaptador: ni el dataset, ni el numero de tokens, ni los hiperparametros LoRA (rango, alpha, dropout), ni si hubo RLHF o DPO especifico para este fine-tuning. La model card del repositorio es una copia de la model card del modelo base Qwen3.5-0.8B y no describe el adaptador. El nombre del repositorio (`eng-word-model-n`) sugiere un fine-tuning orientado a vocabulario o tareas en ingles, pero esto no esta confirmado por ninguna documentacion.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-0.8B, con modo thinking y non-thinking segun la card del base.
- Procesamiento de imagen y texto: el pipeline declarado es image-text-to-text, por lo que el modelo base acepta entradas multimodales.
- Codigo y matematicas: el modelo base reporta resultados en benchmarks de codigo y razonamiento (ver seccion de benchmarks), aunque a escala 0,8B las capacidades son limitadas.
- Soporte multilingue: el modelo base declara 201 idiomas; el adaptador no documenta que idiomas refuerza.
- Tool calling / function calling: no documentado para el adaptador; el modelo base Qwen3.5 incluye soporte de agentes y tool use segun su card.
- Razonamiento multi-paso y agentes: atribuible al modelo base, no verificado en el adaptador.
- Capacidades especificas del adaptador: no disponibles; no hay documentacion sobre que tarea concreta mejora el LoRA.

## Casos de uso

- Experimentacion con PEFT: el adaptador sirve como ejemplo de fine-tuning LoRA sobre un modelo multimodal pequeno; util para investigadores que quieran replicar el pipeline de PEFT con Qwen3.5-0.8B.
- Prototipado de tareas de vocabulario en ingles: dado el nombre del repositorio, podria emplearse para experimentar con tareas de palabras o vocabulario en ingles, aunque no hay evaluacion que lo confirme.
- Evaluacion comparativa de adaptadores: util como punto de partida para medir el impacto de un LoRA sobre el modelo base en tareas image-text-to-text.
- Docencia y formacion: ejemplo practico de publicacion de un adaptador PEFT con licencia Apache 2.0 para cursos de fine-tuning.
- Investigacion sobre fusion temprana multimodal: permite estudiar como un adaptador afecta a las capas de vision y lenguaje del modelo base en un entorno de bajo coste computacional.
- Despliegue en entornos con recursos limitados: al partir de un modelo de 0,8B, el conjunto base + adaptador cabe en GPUs de consumo, lo que facilita pruebas locales con transformers y PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del adaptador en la informacion disponible. Los unicos datos numericos corresponden al modelo base Qwen3.5-0.8B, que se reproducen a continuacion como referencia (modo non-thinking, segun la model card del base):

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

Estos datos corresponden al modelo base, no al adaptador `eng-word-model-n`, cuyo rendimiento especifico se desconoce.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8B en precision completa (fp16/bf16) requiere aproximadamente 1,6-2 GB de VRAM; el adaptador anade una cantidad marginal (el repositorio ocupa 2,0 GB, pero los pesos LoRA efectivos son una fraccion). En cuantizacion de 4 bits, el conjunto puede caber en menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060 12 GB, RTX 4060, RTX 4090); para despliegue en servidor, A100 o H100 no son necesarias por el tamano, pero son compatibles.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 4 GB de VRAM, e incluso en CPU con llama.cpp si se convierte el modelo base a GGUF.
- Opciones de despliegue: transformers + PEFT (necesario para cargar el adaptador), vLLM y SGLang segun la card del modelo base, KTransformers; llama.cpp/Ollama solo si se fusiona el adaptador con el base y se convierte a GGUF (no documentado en el repo).
- Latencia y throughput estimados: no disponibles para el adaptador; para el modelo base de 0,8B se espera un throughput alto en GPU consumer, pero no hay cifras publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kavanmevada/eng-word-model-n (adaptador) | 0,8B base + LoRA | 262.144 | Apache 2.0 | Hugging Face, 142 descargas | Sin model card propia ni benchmarks |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | 262.144 | Apache 2.0 | Hugging Face, oficial | Modelo multimodal con benchmarks publicados |
| Qwen3-1.7B | 1,7B | no disponible en la informacion | Apache 2.0 | Hugging Face, oficial | Alternativa de mayor tamano con MMLU-Pro 40,2 |
| Qwen3.5-2B | 2B | 262.144 (familia) | Apache 2.0 | Hugging Face, oficial | Mejor rendimiento que el 0,8B en MMLU-Pro (55,3) |

La comparativa directa con el adaptador no es posible por falta de evaluacion. Frente al modelo base, el adaptador solo se justifica si la tarea concreta para la que fue entrenado mejora, algo que no esta documentado.

## Limitaciones y advertencias

- Ausencia de model card propia: el README es una copia de la card de Qwen3.5-0.8B y no describe el adaptador, su dataset ni sus hiperparametros.
- Sin benchmarks del adaptador: no hay evidencia de que mejore al modelo base en ninguna tarea; podria degradarlo.
- Riesgo de alucinacion: inherente a modelos de 0,8B, especialmente en razonamiento complejo y matematicas (MMLU-Pro 29,7 en el base).
- Sesgos conocidos: no documentados para el adaptador; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Limitaciones de idioma: el adaptador no declara idiomas; el nombre sugiere ingles, pero no esta confirmado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen3.5-0.8B, cuya licencia tambien es Apache 2.0 segun el enlace de la card; conviene verificar los terminos del base.
- Caveat para produccion: al ser un adaptador PEFT sin documentacion, no se recomienda su uso en produccion sin una evaluacion previa sobre el caso de uso concreto.
- Fecha de creacion futura (2026-10-31): el repositorio presenta metadatos con fechas no convencionales; conviene verificar la integridad y procedencia de los pesos antes de usarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kavanmevada/eng-word-model-n
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai

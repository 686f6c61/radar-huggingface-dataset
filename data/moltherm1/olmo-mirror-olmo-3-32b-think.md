# moltherm1/olmo-mirror-olmo-3-32b-think

## Resumen

Olmo 3 32B Think es un modelo de lenguaje de tipo transformer autorregresivo desarrollado por el Allen Institute for AI (Ai2), publicado como parte de la familia Olmo 3, que incluye variantes de 7B y 32B tanto en versiones Instruct como Think. La variante Think está especializada en razonamiento mediante cadenas de pensamiento largas (long chain-of-thought), lo que mejora el rendimiento en tareas de matemáticas y programación. Este repositorio concreto (`moltherm1/olmo-mirror-olmo-3-32b-think`) es un espejo del modelo oficial `allenai/Olmo-3-32B-Think-DPO`, es decir, la etapa DPO del pipeline de post-entrenamiento, no la versión final tras RLVR.

El modelo se apoya en el preentrenamiento sobre el dataset Dolma 3 y el post-entrenamiento sobre los datasets Dolci, e incluye todos los artefactos de entrenamiento abiertos (código, checkpoints y detalles). Está pensado para investigación y uso educativo bajo licencia Apache 2.0, con fecha de corte de datos en diciembre de 2024 y soporte exclusivo del idioma inglés.

La relevancia de este lanzamiento radica en su carácter completamente abierto dentro de la serie Olmo, que busca habilitar la ciencia de los modelos de lenguaje mediante la liberación de datos, código y pesos. La variante Think de 32B compite directamente con modelos de razonamiento de tamaño similar como Qwen 3 32B o DeepSeek-R1-Distill-Qwen-32B, y su inclusión en el ecosistema transformers (a partir de la versión 4.57.0) facilita su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (estilo decoder-only) |
| Parametros totales | 32B (aproximado, segun nomenclatura del modelo) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (load_in_8bit via bitsandbytes); float16; no se detallan otras |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 24.6 GB, formato transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo de estilo decoder-only, entrenado en dos fases principales: preentrenamiento sobre el dataset Dolma 3 y post-entrenamiento sobre los datasets Dolci. El pipeline de post-entrenamiento sigue la secuencia SFT → DPO → RLVR, siendo este repositorio la etapa DPO (base `allenai/Olmo-3-32B-Think-DPO`), previa a la versión final con RLVR (`allenai/Olmo-3-32B-Think`). El dataset de entrenamiento citado en la model card es `allenai/Dolci-Think-RL`.

La innovación principal de la variante Think es el uso de cadenas de pensamiento largas (long chain-of-thought) para mejorar el razonamiento en matemáticas y programación. El modelo emplea una plantilla de chat con etiquetas `<|im_start|>` y `<|im_end|>`, y genera bloques de razonamiento delimitados por `` antes de la respuesta final. El system prompt por defecto es "You are a helpful AI assistant." No se detallan en la información disponible innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento con cadena de pensamiento larga (bloques `<think>...</think>`), orientado a matemáticas y programación.
- Generación de código y resolución de problemas de programación.
- Razonamiento matemático paso a paso.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente; el modo thinking facilita el razonamiento multi-paso, pero no se documentan capacidades de agente.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: modo thinking (chain-of-thought largo); sin visión ni audio documentados.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas paso a paso gracias a su modo thinking, generando la cadena de razonamiento completa antes de la respuesta final, útil en herramientas educativas o de verificación de cálculos.
- Generación y revisión de código: adecuado para tareas de programación donde el razonamiento previo mejora la corrección, integrándose en asistentes de desarrollo que explotan los bloques `<think>` para auditar el proceso.
- Investigación en ciencia de modelos de lenguaje: al ser un modelo completamente abierto (datos, código y checkpoints), sirve para estudiar el efecto del DPO y del RLVR en el razonamiento, comparando las etapas SFT, DPO y final.
- Evaluación comparativa de modelos de razonamiento: útil como referencia abierta frente a modelos cerrados de tamaño similar en benchmarks de matemáticas y código.
- Fine-tuning específico de dominio: la licencia Apache 2.0 y la disponibilidad de checkpoints intermedios (revisiones `step_XXX`) permiten adaptar el modelo a dominios concretos con datos propios.
- Despliegue en investigación educativa: con cuantización de 8 bits vía bitsandbytes, puede ejecutarse en entornos de laboratorio con GPUs de gama alta para experimentación con cadenas de pensamiento.
- Generación de explicaciones razonadas: en documentación técnica o tutoriales donde se requiere justificar cada paso de una solución.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación comparativa con las columnas Olmo 3 Think 32B SFT, Olmo 3 Think 32B DPO, Olmo 3 Think 32B, Qwen 3 32B, Qwen 3 VL 32B Thinking, Qwen 2.5 32B, Gemma 3 27B Instruct, Gemma 2 27B Instruct, Olmo 2 32B Instruct y DeepSeek-R1-Distill-Qwen-32B. Sin embargo, la información proporcionada se trunca antes de incluir las filas de benchmarks y sus valores numéricos, por lo que no es posible presentar resultados concretos.

No se han publicado resultados de benchmarks en la informacion disponible (la tabla de evaluación aparece incompleta en la documentación accesible).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 32B en float16 se requieren aproximadamente 64 GB de VRAM, y en 8 bits alrededor de 32-36 GB (estimación basada en el tamaño de parámetros, no confirmada en la documentación).
- GPU recomendadas: no especificadas en la información; por tamaño, GPUs de 80 GB (A100, H100) para float16, y GPUs de 40-48 GB para cuantización de 8 bits.
- ¿Cabe en consumer GPU?: en float16 no cabe en GPUs de consumo; en 8 bits podría requerir GPUs de gama alta con 48 GB (por ejemplo, RTX A6000), no confirmado.
- Opciones de despliegue: transformers >= 4.57.0 (soporte oficial); cuantización con bitsandbytes (`load_in_8bit=True`). No se documentan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Olmo 3 32B Think (este repo, DPO) | 32B | no disponible | Apache 2.0 | Pesos abiertos en HF | Etapa DPO del pipeline; espejo no oficial |
| Olmo 3 32B Think (final, RLVR) | 32B | no disponible | Apache 2.0 | Pesos abiertos en HF | Versión final tras RLVR |
| Qwen 3 32B | 32B | no disponible | no disponible en la informacion | Pesos en HF | Comparado en la tabla de evaluación de la model card |
| DeepSeek-R1-Distill-Qwen-32B | 32B | no disponible | no disponible en la informacion | Pesos en HF | Modelo de razonamiento comparado en la model card |
| Gemma 3 27B Instruct | 27B | no disponible | no disponible en la informacion | Pesos en HF | Alternativa de tamaño similar |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada (tabla de evaluación truncada).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre Dolma 3 y Dolci, puede heredar sesgos de esos corpus.
- Riesgo de alucinación: presente como en cualquier modelo generativo; el modo thinking no elimina el riesgo de razonamientos plausibles pero incorrectos.
- Limitaciones de contexto o idioma: soporte exclusivo del inglés; la longitud de contexto no está documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero Ai2 indica que el modelo está destinado a investigación y uso educativo conforme a sus Responsible Use Guidelines.
- Este repositorio es un espejo no oficial (`moltherm1/olmo-mirror-olmo-3-32b-think`) del modelo `allenai/Olmo-3-32B-Think-DPO`; para producción se recomienda usar el repositorio oficial de Ai2.
- La model card indica una versión más reciente (`allenai/Olmo-3.1-32B-Think`), por lo que este checkpoint puede estar desactualizado.
- Fecha de corte de datos: diciembre de 2024; no cubre información posterior.
- La cuantización de 8 bits es sensible a tipos de datos y operaciones CUDA; se recomienda pasar las entradas directamente a CUDA.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/moltherm1/olmo-mirror-olmo-3-32b-think
- Modelo base (DPO): https://huggingface.co/allenai/Olmo-3-32B-Think-DPO
- Versión final (RLVR): https://huggingface.co/allenai/Olmo-3-32B-Think
- Versión más reciente: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Modelo base preentrenado: https://huggingface.co/allenai/Olmo-3-1125-32B
- Checkpoint SFT: https://huggingface.co/allenai/Olmo-3-32B-Think-SFT
- Página del proyecto Olmo: https://allenai.org/olmo
- Repositorio Open-Instruct (DPO y RLVR): https://github.com/allenai/open-instruct
- Repositorio OLMo-Core (preentrenamiento y SFT): https://github.com/allenai/OLMo-core
- Repositorio OLMo-Eval (evaluación): https://github.com/allenai/OLMo-Eval
- Guías de uso responsable de Ai2: https://allenai.org/responsible-use
- Paper: pendiente de publicación (TBD) según la model card
- Dataset de entrenamiento citado: https://huggingface.co/datasets/allenai/Dolci-Think-RL

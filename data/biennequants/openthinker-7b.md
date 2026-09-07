# biennequants/OpenThinker-7B

## Resumen

OpenThinker-7B es un modelo de lenguaje de 7.615.616.512 parámetros, publicado en HuggingFace como biennequants/OpenThinker-7B, que parte de Qwen/Qwen2.5-7B-Instruct y lo ajusta completamente sobre el dataset OpenThoughts-114k. Este dataset se obtiene destilando DeepSeek-R1 mediante un pipeline de generación de datos de razonamiento disponible en GitHub. El objetivo es ofrecer un modelo de razonamiento paso a paso con pesos, datos y código abiertos, en la línea de proyectos como Bespoke-Stratos-7B pero con un conjunto de entrenamiento mucho mayor (114k ejemplos frente a 17k).

El modelo se presenta como una alternativa abierta a otros modelos de razonamiento destilados, como DeepSeek-R1-Distill-Qwen-7B, y mejora a Bespoke-Stratos-7B en los benchmarks publicados por sus autores. La arquitectura es un transformer decoder-only de la familia Qwen2.5, con una longitud de contexto no especificada en la información disponible. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2.5) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OpenThinker-7B es un fine-tuning completo de Qwen/Qwen2.5-7B-Instruct, un transformer decoder-only con atención estándar. El entrenamiento se realizó sobre el dataset OpenThoughts-114k, compuesto por 114.000 ejemplos de razonamiento destilados de DeepSeek-R1. Según la model card, se utilizaron 32 GPUs H100 (4 nodos de 8xH100) durante 20 horas, con learning rate de 1e-5, batch total de 96, 3 épocas y scheduler cosine con warmup del 10%. No se menciona RLHF ni DPO. La innovación técnica principal es el uso de un dataset de razonamiento abierto y un pipeline de destilación reproducible, en lugar de entrenar el modelo desde cero.

El modelo se entrenó con LLaMA-Factory y se evaluó con la herramienta Evalchemy. Los autores destacan que OpenThinker-7B mejora a Bespoke-Stratos-7B, que fue entrenado con solo 17k ejemplos, lo que sugiere que el tamaño del dataset de destilación es un factor relevante en el rendimiento de razonamiento.

## Capacidades

- Generación de texto con razonamiento paso a paso, entrenado mediante destilación de DeepSeek-R1.
- Razonamiento matemático: obtiene 83.0 en MATH500 y 31.3 en AIME24.
- Razonamiento científico: obtiene 42.4 en GPQA-Diamond.
- Generación de código: obtiene 75.3 en LCBv2 Easy, 28.6 en Medium y 6.5 en Hard.
- Capacidades multilingües no especificadas en la información disponible.
- Soporte de tool calling y agentes no confirmado en la información disponible; el modelo base Qwen2.5-7B-Instruct lo soporta, pero no hay datos de evaluación tras el fine-tuning.
- No se especifican capacidades de visión ni audio.

## Casos de uso

- Tutoría académica de matemáticas: el modelo puede resolver problemas de nivel de competición (AIME24, MATH500) y explicar el razonamiento paso a paso, lo que lo hace útil en plataformas educativas.
- Asistencia en investigación científica: con 42.4 en GPQA-Diamond, puede ayudar a responder preguntas de física, química y biología de nivel avanzado, aunque requiere validación humana.
- Generación de código con razonamiento: los resultados en LCBv2 muestran que puede resolver problemas de programación de dificultad media, por lo que puede integrarse en entornos de desarrollo como asistente de código.
- Análisis de datos y resolución de problemas: gracias a su capacidad de razonamiento, puede descomponer problemas complejos en pasos, útil en tareas de análisis cuantitativo.
- Evaluación de modelos de razonamiento: al ser un modelo abierto con datos y código abiertos, sirve como referencia reproducible para comparar técnicas de destilación de razonamiento.
- Formación y experimentación en IA: el modelo es adecuado para investigadores que quieran estudiar el efecto del tamaño del dataset de destilación y replicar los resultados con herramientas como Evalchemy.

## Benchmarks y rendimiento

Los resultados presentados en la model card, evaluados con Evalchemy, se muestran a continuación. No se han publicado resultados adicionales en la información disponible.

| Modelo | AIME24 | MATH500 | GPQA-Diamond | LCBv2 Easy | LCBv2 Medium | LCBv2 Hard | LCBv2 All |
|---|---|---|---|---|---|---|---|
| OpenThinker-7B | 31.3 | 83.0 | 42.4 | 75.3 | 28.6 | 6.5 | 39.9 |
| Bespoke-Stratos-7B | 22.7 | 79.6 | 38.9 | 71.4 | 25.2 | 0.8 | 35.8 |
| DeepSeek-R1-Distill-Qwen-7B | 60.0 | 88.2 | 46.9 | 79.7 | 45.1 | 14.6 | 50.1 |
| gpt-4o-0513 | 8.7 | 75.8 | 46.5 | 87.4 | 42.7 | 8.9 | 50.5 |
| o1-mini | 64.0 | 85.6 | 60.0 | 92.8 | 74.7 | 39.8 | 72.8 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Cálculo orientativo: los pesos en FP16 (7.615.616.512 parámetros × 2 bytes) requieren aproximadamente 15 GB de VRAM; con cuantización a 4 bits, la estimación baja a unos 4-5 GB, pero no hay datos oficiales.
- GPU recomendadas: no se especifican en la información disponible. Para FP16 se necesitaría una GPU con al menos 16 GB de VRAM, como una RTX 4090 o una A100 de 40 GB.
- Compatibilidad con GPU de consumo: probablemente sí con cuantización a 4 bits en GPUs de 8-12 GB, pero no hay datos oficiales.
- Opciones de despliegue: el modelo es compatible con transformers, text-generation-inference y endpoints_compatible. También puede ejecutarse con vLLM, llama.cpp u Ollama si se genera una versión cuantizada, aunque no se proporcionan instrucciones específicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos abiertos | Codigo abierto |
|---|---|---|---|---|---|
| OpenThinker-7B | 7.6B | no disponible | Apache 2.0 | Si | Si |
| Bespoke-Stratos-7B | 7B (aprox.) | no disponible | no disponible | Si | Si |
| DeepSeek-R1-Distill-Qwen-7B | 7B (aprox.) | no disponible | no disponible | No | No |

En benchmarks, OpenThinker-7B supera a Bespoke-Stratos-7B en todas las métricas reportadas. Sin embargo, DeepSeek-R1-Distill-Qwen-7B mantiene un rendimiento superior en AIME24, MATH500, GPQA-Diamond y LCBv2, aunque no ofrece datos ni código abiertos.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado en la información disponible.
- Riesgo de alucinación: inherente a todos los modelos de lenguaje, especialmente en dominios fuera de los datos de entrenamiento (matemáticas y código).
- Limitaciones de contexto: la longitud de contexto no está especificada, por lo que no se puede garantizar un rendimiento adecuado en conversaciones muy largas.
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base Qwen2.5-7B-Instruct es multilingüe, pero el fine-tuning con OpenThoughts-114k puede haber sesgado el rendimiento hacia el inglés.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del dataset OpenThoughts-114k para asegurar el cumplimiento en proyectos que redistribuyan datos.
- El modelo es un fine-tuning de un modelo base, por lo que su rendimiento en tareas de razonamiento fuera de los dominios de entrenamiento puede ser limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/biennequants/OpenThinker-7B
- Paper de OpenThoughts: https://arxiv.org/abs/2506.04178
- Blog de lanzamiento: https://www.open-thoughts.ai/blog/launch
- Repositorio GitHub: https://github.com/open-thoughts/open-thoughts
- Dataset OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Herramienta de evaluación Evalchemy: https://github.com/mlfoundations/Evalchemy

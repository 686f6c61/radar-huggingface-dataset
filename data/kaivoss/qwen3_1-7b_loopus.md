# kaivoss/Qwen3_1.7B_LoopUS

## Resumen

LoopUS (Looped Depth Up-Scaling) es un framework de post-entrenamiento que convierte un LLM preentrenado estándar en un modelo de refinamiento latente iterativo (looped latent refinement). En lugar de extender las trazas de salida (como en chain-of-thought clásico), LoopUS reestructura el modelo en tres componentes: un encoder, un bloque de razonamiento iterado (looped reasoning block) y un decoder, y realiza refinamiento iterativo en el espacio oculto. Esto permite escalar el cómputo en tiempo de inferencia (test-time compute scaling) sin necesidad de un entrenamiento recurrente desde cero.

Este repositorio concreto, `kaivoss/Qwen3_1.7B_LoopUS`, es una re-subida del modelo original `Thrillcrazyer/Qwen3_1.7B_LoopUS` desarrollado por BAELAB (Pusan National University) y DOLAB (Changwon National University), en Corea. La modificación respecto al original consiste en extender la ventana de contexto de 40.960 a 262.144 tokens (256K) mediante YaRN aplicado en tiempo de carga, sin modificar los pesos. Está construido sobre el backbone Qwen3-1.7B-Base, con 2.032.274.433 parámetros totales según los safetensors del repositorio.

El modelo es relevante porque propone una vía alternativa al escalado de cómputo en inferencia: en vez de generar más tokens de razonamiento, itera sobre representaciones latentes internas. Con licencia Apache 2.0 y un tamaño contenido (1,7B parámetros, repo de 4,1 GB), es accesible para experimentación en investigación sobre razonamiento latente y arquitecturas looped.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) reestructurado en encoder + bloque de razonamiento iterado + decoder (Looped Latent Refinement) |
| Parametros totales | 2.032.274.433 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K), extendido mediante YaRN con factor 8.0 sobre un original de 32.768 |
| Tipos de cuantizacion | no disponible (repo en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LoopUS toma el backbone Qwen3-1.7B-Base, un transformer decoder-only con atención completa y `rope_theta = 1.000.000`, y lo reestructura en tres módulos: un encoder, un bloque de razonamiento que se aplica de forma iterada (looped) sobre el estado oculto, y un decoder. El refinamiento se produce en el espacio latente: el bloque iterado actualiza las representaciones internas durante un número configurable de pasos, lo que permite escalar el cómputo en inferencia sin generar tokens adicionales de razonamiento. No requiere entrenamiento recurrente desde cero, sino un post-entrenamiento sobre el modelo preentrenado.

El dataset declarado en la model card es `HuggingFaceFW/fineweb-edu`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se emplearon RLHF o DPO. La extensión de contexto a 256K se realiza en tiempo de carga mediante YaRN (`rope_type: yarn`, `factor: 8.0`, `original_max_position_embeddings: 32768`, `beta_fast: 32`, `beta_slow: 1`), sin modificar los pesos; el `tokenizer_config.json` fija `model_max_length` a 262.144.

## Capacidades

- Generación de texto y razonamiento iterativo en espacio latente mediante el bloque looped.
- Escalado de cómputo en tiempo de inferencia ajustando el número de iteraciones del bloque de refinamiento.
- Procesamiento de contexto largo: hasta 262.144 tokens gracias a la extensión YaRN.
- Conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente; el refinamiento latente iterativo es el mecanismo de razonamiento del modelo.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre razonamiento latente: el modelo sirve como banco de pruebas para estudiar cómo el refinamiento iterado en el espacio oculto afecta a tareas de razonamiento, ajustando el número de iteraciones como hiperparámetro de cómputo.
- Procesamiento de documentos largos: con 256K tokens de contexto puede ingerir libros completos, expedientes o bases de código extensas en una sola pasada para tareas de resumen y extracción.
- Análisis de repositorios de código: la ventana de 256K permite cargar múltiples ficheros de un proyecto y responder preguntas sobre su estructura y dependencias.
- Generación de texto conversacional en entornos con recursos limitados: con 1,7B parámetros y 4,1 GB en safetensors, es viable en GPUs de consumo para prototipos de chat.
- Revisión y comparación de contratos o documentación técnica extensa: el contexto largo permite contrastar cláusulas o secciones distantes sin truncamiento.
- Base para fine-tuning experimental: al estar bajo Apache 2.0 y derivar de Qwen3-1.7B-Base, puede adaptarse a dominios específicos y compararse contra el backbone original para aislar el efecto del looped refinement.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 4-5 GB solo para pesos, más memoria para KV cache; con contexto de 256K el KV cache crece de forma significativa y puede requerir decenas de GB según el batch y la longitud efectiva.
- GPU recomendadas: para contexto corto, RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes; para aprovechar los 256K tokens se recomienda A100 (40/80 GB) o H100 (80 GB).
- Cabe en GPU de consumo: sí, en fp16 en GPUs de 8-12 GB para contextos moderados; en cuantización de 8 bits o 4 bits (si se generan pesos GGUF, no publicados en el repo) cabría en GPUs de 6-8 GB.
- Opciones de despliegue: el autor proporciona scripts propios en el repositorio GitHub (`chat.py` con `uv`). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que la arquitectura reestructurada (encoder + bloque looped + decoder) puede requerir código específico.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque de razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3_1.7B_LoopUS (este) | 2,03B | 262.144 (YaRN) | Refinamiento latente iterado (LoopUS) | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-1.7B-Base | 1,7B (aprox.) | 32.768 nativo | Transformer estándar | Apache 2.0 | HuggingFace |
| Thrillcrazyer/Qwen3_1.7B_LoopUS (original) | 2,03B | 40.960 | Refinamiento latente iterado (LoopUS) | Apache 2.0 | HuggingFace |

La comparación directa con modelos de razonamiento de tamaño similar (por ejemplo, variantes Qwen3 con thinking mode) no está disponible en la información proporcionada, al no haberse publicado benchmarks.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real frente al backbone Qwen3-1.7B-Base o frente a modelos de razonamiento comparables es desconocido.
- La extensión a 256K se realiza solo con YaRN en tiempo de carga y sin modificar pesos; la calidad en contextos muy largos puede degradarse respecto a modelos entrenados nativamente para esa longitud.
- El modelo requiere código específico del repositorio LoopUS para ejecutar el bloque de razonamiento iterado; no es un transformer estándar y puede no funcionar directamente en frameworks de inferencia convencionales.
- Riesgo de alucinación inherente a los LLM de 1,7B parámetros, probablemente mayor que en modelos de mayor tamaño.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre fineweb-edu, puede heredar sesgos de datos web filtrados.
- Idiomas soportados no declarados; el comportamiento multilingüe no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye como artefacto de investigación sin garantías de calidad en producción.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-04; es un artefacto reciente y sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/kaivoss/Qwen3_1.7B_LoopUS
- Modelo original: https://huggingface.co/Thrillcrazyer/Qwen3_1.7B_LoopUS
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Paper: https://arxiv.org/abs/2605.11011
- GitHub: https://github.com/Thrillcrazyer/LoopUS
- Project page: https://thrillcrazyer.github.io/LoopUS
- BAELAB (Pusan National University): https://pnubaelab.github.io/
- DOLAB (Changwon National University): https://aidoheekim.github.io/
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu

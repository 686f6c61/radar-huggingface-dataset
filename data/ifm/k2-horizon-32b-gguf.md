# IFM/K2-Horizon-32B-GGUF

## Resumen

K2-Horizon-32B-Stage1 es un modelo de lenguaje denso de 32B parámetros desarrollado por IFM dentro de la familia K2-Horizon. Se trata de un transformer decoder-only con ventana de contexto nativa de 524.288 tokens (512K), lo que lo convierte en uno de los modelos dense open-weight con contexto más largo disponibles. Este repositorio contiene las versiones GGUF del modelo, optimizadas para su ejecución con llama.cpp, con los tensores almacenados en BF16 original.

El modelo se encuentra en fase de entrenamiento intermedia (Stage1); la model card indica que el checkpoint final se publicará próximamente (Stage2). La licencia es Apache-2.0 y tanto los datos de entrenamiento como el código de entrenamiento se harán públicos. Su relevancia actual radica en ofrecer un baseline denso de 32B con contexto de 512K, orientado a tareas de razonamiento largo, procesamiento de documentos extensos y aplicaciones de agentes.

En los benchmarks publicados, el modelo se compara con alternativas dense open-weight de tamaño similar, como Qwen3.8-27B, Muse Glimmer-30B e IBM Granite 4.2 30B. Sin embargo, los valores numéricos de dichos benchmarks no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (denso) |
| Parametros totales | 34.779.304.960 (32B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | Tensores en BF16 original; cuantizaciones GGUF no especificadas |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo original también disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo es un transformer denso, sin capas de atención lineal ni arquitectura MoE. El entrenamiento se divide en dos etapas: Stage1, que es el checkpoint publicado, y Stage2, que aún no está disponible. Los datos de entrenamiento son IFM/K2-Horizon-Pretrain-Data e IFM/K2-Horizon-Midtrain-Data, ambos públicos. Según la model card, el contexto de 512K es nativo desde la etapa de midtraining. La arquitectura K2 Horizon requiere soporte específico en llama.cpp; en el momento de la publicación, la integración upstream está en proceso (PR en progreso) y se proporciona un fork de MBZUAI-IFM con el soporte necesario.

## Capacidades

- Generación de texto y conversación en inglés, con plantilla de chat compatible con llama.cpp.
- Razonamiento orientado a benchmarks de agentes, codificación y razonamiento, según se indica en la model card.
- Contexto extendido de 512K tokens, apto para procesar documentos largos, logs extensos y codebases completos en una sola llamada.
- Evaluación realizada sobre tareas de agentes y multi-step reasoning, aunque no se detallan resultados numéricos.
- No se especifica soporte explícito para tool calling, visión ni audio en la información disponible.

## Casos de uso

- Analisis de documentos extensos: procesamiento de informes, contratos o bases de código completas en una sola pasada, gracias a la ventana de 512K tokens. El modelo puede mantener el contexto de un repositorio entero sin segmentar la entrada.
- Asistentes de programación: generación y revisión de código en proyectos grandes, donde el historial de cambios y dependencias se mantiene dentro de la ventana de contexto. Las evaluaciones de coding de la model card sugieren utilidad en este escenario.
- Atención al cliente automatizada: gestión de conversaciones multi-turno en inglés con memoria larga, manteniendo el contexto de interacciones anteriores durante semanas o meses. La plantilla de chat y la arquitectura densa facilitan un despliegue sencillo.
- Investigación en IA: experimentación con modelos open-weight de 32B, con acceso a los datos de entrenamiento publicados y al código de entrenamiento. Es útil para estudios de análisis de capacidades, fine-tuning y evaluación de modelos intermedios.
- Agentes autónomos: uso en pipelines de razonamiento multi-paso que requieren mantener un estado extenso, como planificación de tareas, análisis de logs o decisiones basadas en documentación histórica.
- Despliegue local con llama.cpp: ejecución en entornos sin GPU dedicada mediante cuantizaciones GGUF, ideal para prototipos, desarrollo y aplicaciones edge donde el formato GGUF es el estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card presenta una tabla comparativa contra Qwen3.8-27B, Muse Glimmer-30B e IBM Granite 4.2 30B, pero los valores numéricos de los resultados no están visibles en los datos proporcionados. No se pueden presentar cifras concretas de rendimiento.

## Requisitos de hardware

- VRAM estimada: en BF16, aproximadamente 70 GB (34.779.304.960 parámetros × 2 bytes). Con cuantizaciones típicas, se estima ~35 GB en Q8_0 y ~20 GB en Q4_K_M.
- GPU recomendadas: A100 80GB, H100 80GB, o dos RTX 4090 con offloading de capas para ejecución en BF16.
- Consumer GPU: una RTX 4090 de 24GB puede ejecutar el modelo con cuantización Q4_K_M, aunque con limitaciones de longitud de contexto.
- Opciones de despliegue: llama.cpp es la vía principal; la integración en Ollama, vLLM o TGI no está confirmada en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

Según la model card, el modelo se compara con alternativas dense open-weight de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| K2-Horizon-32B-Stage1 | 32B | 512K | Apache-2.0 | Open weights, GGUF |
| Qwen3.8-27B | 27B | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | 30B | no disponible | no disponible | no disponible |
| IBM Granite 4.2 30B | 30B | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre el contexto, licencia o disponibilidad de las alternativas en los datos proporcionados.

## Limitaciones y advertencias

- Es un checkpoint intermedio (Stage1); el rendimiento puede ser inferior al del modelo final que se publicará próximamente.
- Requiere una versión de llama.cpp con soporte K2 Horizon. La integración upstream está en desarrollo, por lo que pueden existir problemas de compatibilidad con builds estándar.
- Solo soporta inglés; no se ha documentado soporte multilingüe ni de otros idiomas.
- No se especifica soporte para tool calling, visión, audio ni otras modalidades multimodales.
- La ausencia de resultados de benchmarks publicados impide validar su rendimiento comparativo frente a modelos similares.
- Riesgo de alucinación inherente a los modelos de lenguaje, como en cualquier generación de texto.
- Los datos de entrenamiento son públicos, pero no se detalla su composición ni se informa sobre posibles sesgos en la model card.

## Enlaces

- HuggingFace (repo GGUF): https://huggingface.co/IFM/K2-Horizon-32B-GGUF
- HuggingFace (modelo base): https://huggingface.co/IFM/K2-Horizon-32B
- Colección K2 Horizon en HuggingFace: https://huggingface.co/collections/IFM/k2-horizon
- Dataset de pre-entrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de mid-entrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
- Fork de llama.cpp con soporte K2 Horizon: https://github.com/MBZUAI-IFM/llama.cpp/tree/model/K2Horizon

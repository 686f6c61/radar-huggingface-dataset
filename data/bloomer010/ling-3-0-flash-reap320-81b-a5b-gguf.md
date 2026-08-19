# bloomer010/Ling-3.0-flash-REAP320-81B-A5B-GGUF

## Resumen

Ling-3.0-flash-REAP320-81B-A5B-GGUF es una variante podada del modelo de mezcla de expertos (MoE) inclusionAI/Ling-3.0-flash, publicada por el usuario bloomer010 en HuggingFace. El modelo original tiene 124 000 millones de parámetros totales con 5 100 millones activos; esta versión reduce los parámetros totales a aproximadamente 81 000 millones mediante poda de expertos, manteniendo los 5 100 millones activos. La poda se realiza con el método REAP (Router-weighted Expert Activation Pruning), descrito en el artículo arXiv 2510.13999, que elimina el 38 % de los expertos por capa (de 512 a 320) sin ningún ajuste fino posterior.

La relevancia de este modelo radica en que ofrece una alternativa más ligera y eficiente para el despliegue de un MoE de gran tamaño, conservando la misma capacidad de activación por token. Se distribuye exclusivamente en formato GGUF, pensado para su uso con llama.cpp y servidores compatibles, con cuantizaciones MXFP4, Q4_K_M y Q2_K. Actualmente requiere un soporte específico para la arquitectura bailingmoe3, pendiente de fusión en el repositorio principal de llama.cpp (PR #26608).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en transformer, 512 expertos por capa (320 tras poda) |
| Parametros totales | 81 035 300 128 (aprox. 81B) |
| Parametros activos | 5,1B (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4, Q4_K_M, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-flash es un MoE con 512 expertos por capa y un total de 124 000 millones de parámetros, de los cuales 5 100 millones se activan por token. Sobre esta arquitectura se aplica una poda one-shot mediante REAP: cada experto se puntúa multiplicando el valor de la puerta del router por la norma L2 de su salida, calculada sobre un conjunto de calibración. Los 192 expertos con menor puntuación por capa se eliminan, dejando 320 de 512 (38 % de poda). El proceso no incluye ajuste fino ni entrenamiento de recuperación, por lo que el modelo conserva las capacidades del original pero con un tamaño total reducido.

La calibración se realizó con 1 millón de tokens, distribuidos en 50 % Ultrachat, 25 % Wikitext y 25 % código. No se dispone de información adicional sobre el entrenamiento original del modelo base, como el número total de tokens de preentrenamiento, la composición del dataset o el uso de técnicas de alineación (RLHF, DPO, etc.).

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y el repositorio indica compatibilidad con endpoints, lo que sugiere su uso en chatbots y asistentes.
- Inferencia eficiente: al mantener solo 5,1B parámetros activos, el coste computacional por token es bajo, comparable al de un modelo denso de ese tamaño, pero con acceso a un mayor número de parámetros totales.
- Despliegue flexible: al estar en formato GGUF, puede ejecutarse con llama.cpp, incluyendo la opción de cargar los expertos en RAM de CPU y mantener la atención en GPU, lo que reduce los requisitos de VRAM.
- Capacidades específicas (tool calling, razonamiento multi-paso, visión, audio, etc.): no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en entornos con recursos limitados: gracias a la poda y a las cuantizaciones GGUF, el modelo puede ejecutarse en servidores con GPUs de gama media o incluso solo con CPU, utilizando el offloading de expertos a RAM. Es adecuado para prototipos o aplicaciones donde no se dispone de hardware de alta gama.
- Asistentes conversacionales en producción: al mantener la capacidad de diálogo del modelo base, puede integrarse en sistemas de atención al cliente o asistentes virtuales mediante la API de llama.cpp o servidores compatibles con endpoints.
- Evaluación de técnicas de poda de expertos: este modelo sirve como caso práctico para estudiar el impacto de REAP en un MoE de gran tamaño, permitiendo comparar el rendimiento con la versión sin podar.
- Inferencia en CPU con offloading: la configuración recomendada en la model card (atención en GPU, expertos en RAM) permite ejecutar el modelo en máquinas con poca VRAM, útil para pruebas locales o entornos de desarrollo.
- Investigación sobre eficiencia de MoE: al estar disponible públicamente, facilita la reproducción de experimentos sobre poda de expertos y el análisis de la degradación del rendimiento sin ajuste fino.
- Servicio de chat multiusuario: con una ventana de contexto de hasta 65 536 tokens (según el comando de ejemplo en la model card), puede gestionar conversaciones largas, aunque esta longitud no está confirmada oficialmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende de la cuantización y de si se utiliza offloading de expertos a RAM. Con la opción `-ot "ffn_.*_exps\.weight=CPU"` y `--no-mmap`, solo la atención y las capas no expertas requieren VRAM, lo que reduce notablemente el consumo.
- GPU recomendadas: no especificadas. El modelo puede ejecutarse en GPUs consumer (por ejemplo, RTX 3090, RTX 4090) si se usa offloading, pero no hay datos concretos.
- Opciones de despliegue: llama.cpp (llama-server) con soporte bailingmoe3, ya sea desde el fork indicado o desde una versión posterior a la fusión del PR #26608.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (MoE podado con 5,1B activos). El modelo base Ling-3.0-flash (124B totales, 5,1B activos) es la referencia directa, pero no se han publicado comparativas de rendimiento entre ambos. Tampoco se conocen otros modelos con poda REAP disponibles públicamente en formato GGUF.

## Limitaciones y advertencias

- La poda se realizó sin ajuste fino, por lo que puede existir una degradación del rendimiento en ciertas tareas respecto al modelo original, aunque no se ha cuantificado.
- El soporte para la arquitectura bailingmoe3 en llama.cpp está pendiente de fusión en el repositorio principal; hasta entonces, es necesario utilizar el fork proporcionado, lo que puede limitar la compatibilidad con otras herramientas.
- La licencia del modelo no está especificada, por lo que no se puede confirmar si es apta para uso comercial o si tiene restricciones.
- No se han publicado benchmarks, por lo que se desconoce el rendimiento real en tareas estándar como MMLU, HumanEval o GSM8K.
- Al derivar de un modelo base no documentado en esta ficha, no se conocen los sesgos potenciales ni las limitaciones idiomáticas del modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bloomer010/Ling-3.0-flash-REAP320-81B-A5B-GGUF
- Modelo base inclusionAI/Ling-3.0-flash: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Artículo REAP (arXiv 2510.13999): https://arxiv.org/abs/2510.13999
- PR de soporte bailingmoe3 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/26608
- Fork de llama.cpp con soporte bailingmoe3: https://github.com/aetherbird/llama.cpp/tree/bailingmoe3-support

# bloomer010/Ling-3.0-flash-REAP384-97B-A5B-GGUF

## Resumen

Ling-3.0-flash REAP384 es una versión podada del modelo de mezcla de expertos (MoE) Ling-3.0-flash desarrollado por inclusionAI. El autor, bloomer010, aplica una poda de expertos one-shot mediante el método REAP (Router-weighted Expert Activation Pruning), eliminando el 25% de los expertos enrutados por capa (de 512 a 384). El resultado es un modelo con 96.5B parámetros totales pero solo 5.1B activos por token, lo que lo hace especialmente interesante para inferencia en entornos con recursos limitados.

La relevancia de este modelo radica en su capacidad para reducir drásticamente el uso de memoria y ancho de banda sin necesidad de reentrenamiento. Al mantener los parámetros activos en 5.1B, la latencia de generación se mantiene baja, mientras que la poda reduce el tamaño total del archivo en disco y la memoria necesaria para cargar los pesos, facilitando el despliegue en GPUs de consumo o incluso con offload de expertos a CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (BailingMoE) con poda REAP (384/512 expertos por capa) |
| Parametros totales | 96.519.001.952 (~96.5B) |
| Parametros activos | 5.1B (A5B) |
| Longitud de contexto | no disponible (el comando de ejemplo usa 65536 tokens) |
| Tipos de cuantizacion | MXFP4, Q4_K_M, Q2_K (GGUF) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, inclusionAI/Ling-3.0-flash, es un MoE de tipo BailingMoE con 124B parámetros totales y 5.1B activos. Sobre esta base, se aplica una poda de expertos one-shot usando el método REAP (arXiv:2510.13999). REAP puntúa cada experto en función del valor de la puerta del router multiplicado por la norma L2 de su salida, calculado sobre un conjunto de calibración. Los expertos con menor puntuación se eliminan, pasando de 512 a 384 expertos enrutados por capa.

El proceso no incluye fine-tuning ni entrenamiento de recuperación. La calibración se realizó con 1 millón de tokens del dataset ultrachat, centrado únicamente en datos conversacionales. Esto implica que la poda está optimizada para tareas de chat, pero podría no ser óptima para otros dominios.

## Capacidades

- Generación de texto conversacional: el modelo está calibrado y orientado a tareas de chat.
- Compatibilidad con llama.cpp: los archivos GGUF están preparados para cargarse con llama-server y otras herramientas del ecosistema.
- Despliegue híbrido CPU/GPU: permite descargar los expertos a RAM mientras la atención se ejecuta en GPU, gracias al soporte `bailingmoe3`.
- No se dispone de información verificada sobre tool calling, function calling, razonamiento multimodal o agentes en esta ficha.

## Casos de uso

- Servidor de chat local con recursos limitados: gracias a la poda y a la cuantización MXFP4, se puede servir un modelo de 96B totales con una VRAM reducida si se descargan los expertos a RAM.
- Prototipado de aplicaciones conversacionales: al mantener 5.1B activos, la latencia es similar a la de un modelo de 5B, lo que permite iterar rápidamente.
- Investigación en poda de MoE: sirve como ejemplo práctico de aplicación de REAP sin fine-tuning, útil para estudiar el impacto de la poda en la calidad.
- Despliegue en entornos con GPUs de consumo: con cuantización Q2_K o Q4_K_M, podría caber en GPUs con 24GB de VRAM si se usa offload parcial.
- Evaluación de robustez post-poda: permite comparar la degradación de rendimiento frente al modelo base de 124B.
- Integración en pipelines de generación de texto donde el coste de memoria es crítico y se acepta una posible pérdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 146.9 GB (incluye varios quants).
- Cuantizaciones disponibles: MXFP4 (recomendada para CPU-offload), Q4_K_M y Q2_K.
- El comando de ejemplo proporcionado por el autor usa `-ngl 99` (offload de capas a GPU) y `-ot "ffn_.*_exps\.weight=CPU"` para forzar a los expertos a RAM, con `--no-mmap`. Esto permite ejecutar con una VRAM mínima, limitada principalmente a las capas de atención y embeddings.
- Sin offload de expertos, la memoria necesaria para cargar los pesos en VRAM sería aproximadamente: MXFP4 (~48GB), Q4_K_M (~50GB) y Q2_K (~25GB), aunque estos valores son estimaciones basadas en el tamaño total de parámetros.
- Se requiere una compilación de llama.cpp con soporte `bailingmoe3`. Hasta que se fusione el PR #26608, es necesario usar el fork de aetherbird.
- La latencia dependerá en gran medida del ancho de banda de la RAM si se usa offload de expertos, ya que los pesos se leen desde memoria del sistema.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Notas |
|---|---|---|---|---|
| Ling-3.0-flash (base) | 124B | 5.1B | no disponible | Modelo original sin podar |
| Ling-3.0-flash REAP384 (este) | 96.5B | 5.1B | no disponible | 25% de expertos podados, sin fine-tuning |
| No disponible | - | - | - | No se dispone de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si es apto para uso comercial. Riesgo legal si se usa en producción.
- Sin fine-tuning posterior a la poda: la calidad puede degradarse respecto al modelo original, especialmente fuera del dominio conversacional (calibrado solo con ultrachat).
- Soporte experimental: el formato `bailingmoe3` aún no está fusionado en la rama principal de llama.cpp. Se requiere usar un fork específico.
- Idiomas soportados no documentados: no se conoce el alcance multilingüe real del modelo.
- La poda se realizó con un conjunto de calibración pequeño (1M tokens) y solo de chat, lo que puede inducir sesgos hacia ese tipo de interacción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bloomer010/Ling-3.0-flash-REAP384-97B-A5B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Paper REAP: https://arxiv.org/abs/2510.13999
- PR de llama.cpp para bailingmoe3: https://github.com/ggml-org/llama.cpp/pull/26608
- Fork de llama.cpp con soporte: https://github.com/aetherbird/llama.cpp/tree/bailingmoe3-support

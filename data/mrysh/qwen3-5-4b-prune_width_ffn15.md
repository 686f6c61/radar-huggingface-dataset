# mrysh/qwen3.5-4b-prune_width_ffn15

## Resumen

`mrysh/qwen3.5-4b-prune_width_ffn15` es una variante podada del modelo Qwen/Qwen3.5-4B, publicada por el usuario mrysh con fines de evaluación comparativa de técnicas de poda. La intervención aplicada es una poda de anchura (width pruning) sobre la dimensión de las capas feed-forward, reduciendo el tamaño del FFN de cada capa de 9216 a 7808 neuronas (un 15 % solicitado, que se traduce en una reducción efectiva del 8,2 % de los parámetros del checkpoint completo). El número de capas se mantiene intacto y no se realizó destilación ni ajuste fino posterior a la poda, por lo que se espera una degradación de calidad frente al modelo base.

El modelo conserva únicamente la parte lingüística de Qwen3.5-4B: la torre de visión y la cabeza de predicción multi-token han sido eliminadas, de modo que se trata de un modelo exclusivamente de texto. Cuenta con 3.859.721.216 parámetros según los pesos en safetensors y ocupa 7,7 GB en disco. La poda se realizó con la librería nvidia-modelopt 0.46.0rc1 mediante la técnica Minitron, midiendo la importancia de las neuronas sobre un conjunto de calibración de 512 muestras mixtas.

Su relevancia es fundamentalmente metodológica: forma parte de un benchmark que compara cuatro modelos con ocho variantes de poda entre sí y frente a cuantización, evaluando en BFCL, sesgo de contratación y MedQA con vLLM. No es un modelo pensado para producción, sino una pieza de experimentación para estudiar el compromiso entre reducción de parámetros y pérdida de calidad. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), poda de anchura en capas FFN; solo parte de texto |
| Parametros totales | 3.859.721.216 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona comparación con cuantización en el benchmark, pero no especifica formatos soportados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer de la familia Qwen3.5, y le aplica una poda estructurada de anchura sobre las capas feed-forward: la dimensión interna del FFN pasa de 9216 a 7808 en todas las capas, mientras que el número de capas permanece constante. La selección de neuronas a eliminar se basó en una medida de importancia calculada sobre un conjunto de calibración de 512 muestras mixtas, siguiendo el procedimiento Minitron implementado en nvidia-modelopt 0.46.0rc1. La reducción resultante es del 8,2 % de los parámetros del checkpoint completo.

No se aplicó destilación ni ajuste fino tras la poda, de modo que los pesos restantes son los del modelo base sin reentrenamiento. Además, se eliminaron la torre de visión y la cabeza de predicción multi-token de Qwen3.5, convirtiendo el modelo en una variante exclusivamente textual. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo fases de RLHF o DPO, más allá de lo que pueda figurar en la model card original de Qwen/Qwen3.5-4B.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base, con la degradación esperable por la poda sin reentrenamiento.
- Procesamiento exclusivamente textual: no admite entrada de imágenes al haberse eliminado la torre de visión.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte específico de agentes o razonamiento multi-paso en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documenta un modo de razonamiento explícito (thinking mode); en el benchmark se evaluó con thinking desactivado.
- No se documentan capacidades de audio.

## Casos de uso

- Evaluación de técnicas de poda: el modelo sirve como punto de comparación dentro del benchmark del autor, que contrasta ocho variantes de poda y cuantización sobre BFCL, sesgo de contratación y MedQA con vLLM.
- Investigación sobre degradación por poda: permite medir la pérdida de calidad al eliminar un 8,2 % de parámetros sin destilación, comparando contra el modelo base Qwen3.5-4B.
- Experimentos de eficiencia en inferencia: al reducir la dimensión FFN, se puede estudiar el ahorro de memoria y cómputo en despliegues con vLLM frente al modelo original.
- Prototipado de pipelines de texto sin requisitos de producción: útil para validar flujos de generación de texto donde la calidad no sea crítica y se priorice un checkpoint más ligero.
- Estudio de sesgos: el benchmark incluye una evaluación de sesgo de contratación (hiring-bias), por lo que el modelo puede emplearse para analizar cómo la poda afecta a sesgos medibles.
- Comparación de metodologías de compresión: confrontar poda de anchura frente a cuantización en tareas de conocimiento médico (MedQA) y de uso de funciones (BFCL) para decidir qué técnica conviene en cada escenario.
- Docencia y reproducción de experimentos: al estar publicados los detalles de la poda (nivel 0.15, calibración de 512 muestras, nvidia-modelopt 0.46.0rc1), es reproducible en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el modelo forma parte de un benchmark que evalúa las variantes en BFCL, hiring-bias y MedQA con vLLM, pero no incluye las puntuaciones obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.859.721.216 parámetros, en BF16 se requieren aproximadamente 7,7 GB solo para pesos, más memoria para caché KV y activaciones; en cuantización de 8 bits, alrededor de 3,9 GB; en 4 bits, alrededor de 2 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de consumo con suficiente VRAM, como RTX 4090 (24 GB) en BF16 sin problema, o RTX 3090/4080 en cuantización.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más en cuantización y 12-16 GB o más en BF16, aunque no hay datos oficiales.
- Opciones de despliegue: el autor evaluó con vLLM. No se documenta soporte de llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrysh/qwen3.5-4b-prune_width_ffn15 | 3.859.721.216 | no disponible | Apache 2.0 | Poda de anchura FFN al 15 %, solo texto, sin reentrenamiento |
| Qwen/Qwen3.5-4B (base) | no disponible en la información | no disponible | Apache 2.0 | Modelo original con visión y cabeza multi-token; referencia de calidad |
| Otras variantes de poda del benchmark | no disponible | no disponible | Apache 2.0 (presumiblemente) | El autor menciona 4 modelos x 8 variantes, sin detallar cifras |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Degradación de calidad esperada: no hubo destilación ni ajuste fino tras la poda, por lo que el autor advierte explícitamente de una caída de calidad frente al modelo base.
- Pérdida de capacidades multimodales: la torre de visión y la cabeza de predicción multi-token fueron eliminadas; el modelo es solo de texto.
- Sin datos de benchmarks publicados: no es posible cuantificar la magnitud de la degradación a partir de la información disponible.
- Riesgo de alucinación: inherente a los modelos de lenguaje; la poda sin reentrenamiento puede agravarlo, aunque no hay mediciones al respecto.
- Idiomas soportados no documentados: se desconoce si conserva el multilingüismo del modelo base.
- Longitud de contexto no documentada en esta ficha: conviene consultar la model card de Qwen/Qwen3.5-4B para el dato aplicable.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al ser un artefacto de benchmark sin validación de calidad, no se recomienda para producción sin evaluación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-4b-prune_width_ffn15
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Librería de poda: nvidia-modelopt 0.46.0rc1 (no se proporciona URL en la información disponible)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.

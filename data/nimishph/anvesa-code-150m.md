# nimishph/anvesa-code-150m

## Resumen

anvesa-code-150m es un encoder especializado en búsqueda de código (code-search) desarrollado por nimishph para el proyecto anvesa, una herramienta de recuperación de símbolos en repositorios. Se construye mediante fine-tuning del encoder Ettin-encoder-150m de jhu-clsp (licencia MIT) sobre 105 repositorios con licencia MIT, empleando como profesor una versión de 1B parámetros del mismo proceso de ajuste. El modelo resuelve el problema de la recuperación semántica de símbolos de código (funciones, clases, métodos) a partir de consultas en lenguaje natural o en forma de identificadores.

La arquitectura es un transformer encoder de tipo ModernBERT con 150 millones de parámetros, exportado a ONNX en precisión fp32. El modelo genera embeddings de 512 tokens mediante mean pooling sobre los tokens reales, con normalización L2 y sin prefijos de tarea. Se distribuye junto con un ranker XGBoost (`ranker-noword.json`) que reordena los resultados de la primera etapa para la funcionalidad `experimental.learnedRanker` de anvesa.

Es relevante ahora porque ofrece una alternativa compacta y de bajo coste computacional (40 ms por tarjeta de símbolo en CPU con ONNX Runtime y 12 hilos) para la búsqueda de código en producción, con un rendimiento superior al del popular all-MiniLM-L6-v2 en el benchmark del proyecto (0,626 frente a 0,547 en el conjunto de 241 consultas escritas a mano).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base Ettin-encoder-150m) |
| Parametros totales | 150 millones (aproximado, segun el modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (distribucion en fp32 ONNX) |
| Idiomas soportados | no disponible (entrenado sobre codigo en 13 lenguajes de programacion) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx_data`) y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Ettin-encoder-150m, un encoder de la familia ModernBERT desarrollado por jhu-clsp con licencia MIT. Sobre esta base se realiza un fine-tuning orientado a recuperación de código utilizando 105 repositorios con licencia MIT como corpus. El proceso de entrenamiento emplea destilación desde una versión de 1B parámetros del mismo ajuste, que actúa como profesor para guiar al modelo de 150M. El modelo genera un embedding por tarjeta de símbolo (symbol card) de anvesa, omitiendo la línea de ruta WQL de dichas tarjetas.

El pipeline de inferencia aplica mean pooling sobre los tokens reales (excluyendo padding), seguido de normalización L2, con una ventana fija de 512 tokens y sin prefijos de instrucción o tarea. Adicionalmente, el repositorio incluye `ranker-noword.json`, un modelo XGBoost entrenado sobre las puntuaciones de este encoder con 20 características y sin solapamiento de palabras, diseñado para la segunda etapa de reordenación en anvesa.

## Capacidades

- Generación de embeddings de código para búsqueda semántica y recuperación de símbolos (funciones, clases, métodos).
- Recuperación de código a partir de consultas en lenguaje natural y de identificadores.
- Extracción de características (`feature-extraction`) compatible con text-embeddings-inference y endpoints compatibles.
- Soporte de reordenación mediante el ranker XGBoost incluido para la primera etapa de recuperación.
- Funcionamiento en CPU con ONNX Runtime, sin necesidad de GPU.
- Cobertura de 13 lenguajes de programación en el corpus de evaluación (no se especifican cuáles).
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento; es un encoder de recuperación, no un modelo generativo.

## Casos de uso

- Búsqueda de símbolos en repositorios: el modelo indexa las tarjetas de símbolos de anvesa y permite recuperar funciones o clases relevantes a partir de una consulta, con una ventana de 512 tokens adecuada para descripciones de símbolos.
- Asistentes de código en IDE: integrado como backend de recuperación para autocompletado contextual o navegación semántica, con latencia de 40 ms por tarjeta en CPU (12 hilos), lo que permite respuestas interactivas sin GPU.
- Construcción de índices de documentación técnica: genera embeddings de fragmentos de código y documentación para motores de búsqueda internos, aprovechando la normalización L2 para similitud coseno directa.
- Reordenación de resultados en pipelines de búsqueda: el ranker XGBoost incluido mejora la primera etapa (de 0,301 a 0,322 en el corpus de test y de 0,626 a 0,632 en el bench), útil para afinar la precisión en sistemas de recuperación existentes.
- Despliegue en entornos con recursos limitados: al ser un modelo de 150M en ONNX fp32 y ejecutable en CPU, es adecuado para servidores sin GPU o para integración en herramientas de escritorio.
- Deduplicación y clustering de código: los embeddings permiten agrupar símbolos similares o detectar código duplicado en grandes bases de código, con un coste de inferencia bajo.
- Evaluación comparativa de recuperadores: sirve como referencia ligera para comparar con all-MiniLM-L6-v2 u otros encoders en tareas de code-search, dado que el autor publica métricas reproducibles.

## Benchmarks y rendimiento

| Conjunto | Metrica | first stage (hub penalty 0.3) | con ranker | all-MiniLM-L6-v2 (sin ranker) |
|---|---|---|---|---|
| corpus test (1.710 consultas generadas, 57 repos, 13 lenguajes) | no especificada (probablemente MRR o similar) | 0,301 | 0,322 | 0,293 |
| bench (241 consultas escritas a mano, 8 repos) | no especificada (probablemente MRR o similar) | 0,626 | 0,632 | 0,547 |

No se especifica la métrica exacta empleada en la model card; los valores se presentan tal cual. El rendimiento en CPU es de 40 ms por tarjeta con ONNX Runtime y 12 hilos.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU, el modelo fp32 de 150M ocupa aproximadamente 0,6 GB (tamaño del repositorio), por lo que cabe en cualquier GPU consumer con al menos 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 o superior, A100, H100) para acelerar la inferencia; no se requieren GPUs de datacenter.
- Cabe en GPU consumer: sí, en todas las GPU con más de 2 GB de VRAM, incluidas GTX 1650, RTX 3050, RTX 4090, etc.
- Opciones de despliegue: ONNX Runtime (probado por el autor), text-embeddings-inference, endpoints compatibles; el autor indica el comando `anvesa model install anvesa-code-150m --download`.
- Latencia y throughput: 40 ms por tarjeta en CPU con 12 hilos (ONNX Runtime); no se dispone de datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (bench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anvesa-code-150m | 150M | 512 tokens | 0,626 (first stage) / 0,632 (con ranker) | MIT | Hugging Face (ONNX) |
| all-MiniLM-L6-v2 | 22M (aproximado) | 256 tokens (habitual) | 0,547 (sin ranker) | Apache 2.0 | Hugging Face |
| Ettin-encoder-150m (base) | 150M | no disponible | no disponible | MIT | Hugging Face |

No se dispone de datos de otros encoders de code-search comparables en la información proporcionada. La comparación con all-MiniLM-L6-v2 procede de la propia model card del autor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre 105 repositorios MIT, puede reflejar sesgos de estilo y dominio de ese corpus.
- Riesgo de alucinación: no aplica directamente al ser un encoder de recuperación, pero los embeddings pueden producir falsos positivos en la recuperación de símbolos no relacionados.
- Limitaciones de contexto: ventana fija de 512 tokens, lo que puede truncar tarjetas de símbolos o consultas largas.
- Limitaciones de idioma: no se especifican los idiomas naturales soportados; el entrenamiento se centra en código en 13 lenguajes de programación no enumerados.
- Restricciones de licencia: licencia MIT, permite uso comercial con atribución; el modelo base Ettin-encoder-150m también es MIT.
- Caveats para producción: el modelo está exportado únicamente en ONNX fp32 (no se ofrecen cuantizaciones GGUF u otras); el ranker XGBoost es específico para las características de anvesa y requiere integración con su pipeline; el rendimiento medido en el bench es moderado (0,626), por lo que puede no ser suficiente para dominios de código muy especializados.
- El repositorio tiene un tamaño de 0,6 GB y solo 8 descargas en el momento de la consulta, lo que indica un proyecto joven con poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nimishph/anvesa-code-150m
- Repositorio anvesa: https://github.com/nimishph/anvesa
- Modelo base Ettin-encoder-150m: https://huggingface.co/jhu-clsp/ettin-encoder-150m

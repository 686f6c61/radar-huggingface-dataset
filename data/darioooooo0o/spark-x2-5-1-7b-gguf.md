# darioooooo0o/Spark-X2.5-1.7B-GGUF

## Resumen

Spark-X2.5-1.7B-GGUF es un conjunto de cuantizaciones GGUF del modelo base XHToken/Spark-X2.5-1.7B, un modelo de lenguaje compacto de 1,7 mil millones de parametros desarrollado por XHToken. Esta version comunitaria, publicada por darioooooo0o, aplica una importancia matrix (imatrix) para reducir el peso del modelo a formatos Q8_0, Q6_K, Q4_K_M e IQ4_XS, preservando la arquitectura hibrida de atencion (3:1 sliding-window:full) y el contexto nativo de 1 millon de tokens.

El modelo resuelve el problema de ejecutar modelos con ventanas de contexto extremadamente largas en hardware de consumo. Gracias a su tamano reducido y a una cache KV eficiente (~4 KB/token en cuantizacion q4_0), permite inferencia completamente residente en GPU desde tarjetas de 4 GB de VRAM, algo inusual para modelos con contexto de 1M. Su relevancia actual radica en la combinacion de contexto largo, capacidad de tool calling verificada y licencia Apache 2.0, lo que lo hace atractivo para aplicaciones agénticas y de procesamiento de documentos extensos en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion deslizante y completa (3:1), 28 capas, 7 capas de atencion completa, 2 cabezas KV de dimension 256 |
| Parametros totales | 1.707.657.216 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.000.000 tokens (nativo) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M, IQ4_XS (todos con imatrix) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones con importancia matrix) |

## Arquitectura y entrenamiento

El modelo base Spark-X2.5-1.7B emplea una arquitectura transformer hibrida con atencion deslizante (sliding window) y atencion completa en una proporcion 3:1. De las 28 capas totales, solo 7 utilizan atencion completa, lo que reduce drasticamente el coste de la cache KV: aproximadamente 4,0 KB por token en cuantizacion q4_0, un tercio del consumo del modelo hermano de 4B. Esta diseno permite alcanzar un contexto nativo de 1 millon de tokens sin requerir tecnicas de extrapolacion.

No se han proporcionado detalles sobre el dataset de entrenamiento ni el proceso de alineacion (RLHF, DPO, etc.) en la informacion disponible. Sin embargo, la model card indica que el modelo esta orientado a tareas generales como conversacion, escritura, traduccion, razonamiento, codificacion, uso de herramientas y flujos agénticos. La verificacion de tool calling se realizo sobre los pesos safetensors originales en vLLM con el plugin de XHToken, confirmando soporte para llamadas simples, esquemas anidados, bucles multi-turno y hasta tres llamadas paralelas. El modo de pensamiento (thinking) esta activado por defecto segun las recomendaciones de muestreo del modelo.

## Capacidades

- Generacion de texto general, conversacion multi-turno y escritura creativa.
- Razonamiento y resolucion de problemas en varios dominios.
- Generacion de codigo y comprension de lenguajes de programacion.
- Tool calling verificado: soporta esquemas simples, complejos (anidados, arrays), llamadas paralelas (hasta 3) y bucles de resultados de herramientas.
- Modo de pensamiento (thinking) integrado, activado por defecto, que permite razonamiento encadenado antes de responder.
- Traduccion automatica y soporte multilingue (aunque no se especifican los idiomas concretos).
- Contexto nativo de 1M tokens, apto para procesar documentos largos o mantener historiales extensos.

## Casos de uso

- Atencion al cliente automatizada: el contexto de 1M tokens permite mantener conversaciones multi-turno con historial completo del usuario, sin necesidad de resumir o truncar interacciones previas. El modelo gestiona llamadas a herramientas (consultas a BBDD, APIs) mediante su tool calling verificado.
- Agentes autonomos con razonamiento multi-paso: la combinacion de thinking mode y tool calling permite construir agentes que planifican, ejecutan acciones y procesan resultados en bucles iterativos, adecuado para automatizacion de tareas administrativas o de investigacion.
- Generacion de codigo en produccion: con soporte para esquemas de herramientas complejos, puede integrarse en pipelines de CI/CD para generar tests, documentar funciones o refactorizar fragmentos, siempre que se use el fork de llama.cpp o vLLM con el plugin correspondiente.
- Procesamiento de documentos legales o academicos extensos: la ventana de 1M tokens permite ingerir contratos, articulos o informes completos y realizar resumenes, extraccion de clausulas o respuestas basadas en el contenido integro, sin perder informacion por recorte.
- Traduccion de corpus largos: al mantener el contexto completo del documento original, el modelo puede traducir textos extensos manteniendo coherencia terminologica y estilistica a lo largo de capitulos o secciones.
- Chatbots con memoria persistente: en despliegues con contexto 1M, el modelo puede recordar todas las interacciones previas de un usuario durante meses, mejorando la personalizacion sin necesidad de bases de datos vectoriales externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos proporcionados se centran en calidad de cuantizacion (perplexity) y rendimiento de inferencia, medidos en una RTX 3060 12GB con llama.cpp (fork de XHToken).

| Quantizacion | Perplexity (512 ctx, corpus de calibracion) | Delta vs Q8_0 |
|---|---|---|
| Q8_0 | 3.854 | - |
| Q6_K | 3.855 | +0.001 (ruido) |
| Q4_K_M | 4.093 | +6.2% |
| IQ4_XS | 4.081 | +5.9% |

| Quantizacion | Prefill (tok/s) | Decode (tok/s) | TTFT (ms) |
|---|---|---|---|
| Q8_0 | 7856 | 149.6 | 71.9 |
| Q6_K | 6819 | 166.4 | 81.1 |
| Q4_K_M | 7289 | 206.1 | 75.1 |
| IQ4_XS | 7951 | 207.3 | 69.2 |

En vLLM (safetensors, 32K ctx), se midio un decode de 81.5 tok/s. La model card indica que el rendimiento de decode es aproximadamente 3.5 veces superior al del modelo hermano de 4B en la misma GPU.

## Requisitos de hardware

- VRAM minima: 4 GB para Q8_0 con 128K de contexto, o Q6_K/Q4_K_M/IQ4_XS con 256K de contexto (asumiendo cache KV q4_0 y ~1 GB de overhead de CUDA).
- VRAM recomendada: 8 GB para ejecutar cualquier cuantizacion con el contexto completo de 1M tokens.
- GPU compatibles: cualquier GPU con al menos 4 GB de VRAM. Las pruebas se realizaron en RTX 3060 12GB, pero modelos similares de gama baja (GTX 1660, RTX 3050) deberian ser capaces con cuantizaciones ligeras.
- Opciones de despliegue: llama.cpp (fork XHToken, necesario por la arquitectura `spark2_5` no soportada en upstream), vLLM con el plugin Spark-plugin, y Ollama (disponible como `SparkLLM/Spark-X2.5-1.7B`).
- Latencia y throughput: decode entre 150 y 207 tok/s segun cuantizacion en RTX 3060 12GB; prefill entre 6800 y 7950 tok/s; TTFT entre 69 y 81 ms.

## Comparativa con modelos similares

El modelo se compara directamente con su hermano mayor dentro de la misma familia, el Spark-X2.5-4B, tambien cuantizado por el mismo autor. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| Spark-X2.5-1.7B (GGUF) | 1.7B | 1M | Q8_0, Q6_K, Q4_K_M, IQ4_XS | Apache 2.0 | Cache KV ~4 KB/token, decode ~3.5x mas rapido que el 4B |
| Spark-X2.5-4B (GGUF) | 4B | 1M | Requiere mezclas por capas en VRAM baja | Apache 2.0 | Mayor capacidad, pero mas exigente en VRAM y con menor throughput |

No se han encontrado comparaciones directas con otros modelos compactos de contexto largo (por ejemplo, Qwen2.5-1.5B o Llama-3.2-1B) en la informacion disponible.

## Limitaciones y advertencias

- Tamano reducido (1.7B): la capacidad de razonamiento complejo y conocimiento enciclopedico es inferior a la de modelos de 7B o superiores. Para tareas que requieran conocimiento profundo, puede ser necesario un modelo mayor.
- Sesgos y alucinaciones: no se han documentado sesgos especificos, pero al ser un modelo pequeno entrenado con datos no publicados, existe riesgo de alucinaciones en contextos largos o con informacion poco frecuente.
- Dependencia de un fork: la arquitectura `spark2_5` no esta integrada en llama.cpp upstream. Es obligatorio usar el fork de XHToken (o vLLM con el plugin) para ejecutar estos GGUFs, lo que puede suponer una barrera de adopcion.
- Contexto 1M: aunque es nativo, el rendimiento en contextos extremadamente largos puede degradarse en la practica por limitaciones de atencion o precision numerica. Las mediciones de velocidad se realizaron con contextos de 512 tokens y 32K, no con 1M.
- Licencia Apache 2.0: permite uso comercial sin restricciones, pero las cuantizaciones son obras derivadas del modelo base, por lo que se debe mantener la atribucion correspondiente.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/darioooooo0o/Spark-X2.5-1.7B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/XHToken/Spark-X2.5-1.7B
- Repositorio GitHub de la familia Spark-X2.5: https://github.com/XHToken/Spark-X2.5
- Pagina en Ollama: https://ollama.com/SparkLLM/Spark-X2.5-1.7B
- Plugin de vLLM requerido: https://github.com/XHToken/Spark-plugin
- Fork de llama.cpp con soporte para la arquitectura: https://github.com/XHToken/llama.cpp

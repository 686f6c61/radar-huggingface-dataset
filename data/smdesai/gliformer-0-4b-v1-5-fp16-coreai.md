# smdesai/GLiFormer-0.4B-v1.5-FP16-CoreAI

## Resumen

GLiFormer-0.4B-v1.5-FP16-CoreAI es un port del modelo `knowledgator/gliformer-0.4b-v1.5` al formato Core AI de Apple, empaquetado en FP16 para su ejecución on-device en iOS 27+ y macOS 27+. El modelo original, desarrollado por Knowledgator, es un encoder DeBERTa-v3-large de aproximadamente 0,4 mil millones de parámetros con cabezas de tarea ligeras que unifican extracción de entidades, clasificación de texto, extracción de relaciones, estructuración de registros, cálculo de campos, edición de texto y generación de embeddings en un único checkpoint.

La relevancia de esta variante concreta es su orientación a inferencia local en dispositivos Apple: el autor (smdesai) ha reescrito la estructura del grafo para Core AI, troceando el encoder en segmentos de 128 tokens y separando las partes dependientes de datos (gathering de palabras, codificación de etiquetas y esquemas, selección de spans, decodificación) para que el host ejecute la lógica entre funciones de forma fija. El resultado son assets de 1,67 GB para el grafo principal, assets auxiliares sin pesos para la atención por longitud de secuencia y un BiLSTM de palabras en FP32 para CPU.

El modelo está pensado para pipelines de extracción estructurada y procesamiento de lenguaje natural en inglés sobre dispositivo, sin depender de la nube. La licencia es Apache 2.0 y el checkpoint base también lo es, lo que facilita su uso comercial. No se han publicado resultados de benchmarks en la información disponible, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-large (encoder transformer con atención disentangled y posiciones relativas) + cabezas de tarea ligeras + BiLSTM de palabras |
| Parametros totales | aproximadamente 0,4 mil millones (303M en las capas del encoder segun la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 4096 tokens (segmentacion en chunks de 128 tokens, padding al siguiente multiplo de 128) |
| Tipos de cuantizacion | FP16 (variante de referencia); existe una variante H8 con cabezas de tarea en int8 (`smdesai/GLiFormer-0.4B-v1.5-H8-CoreAI`) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | assets Core AI (`.aimodel`), tokenizer SentencePiece Unigram con vocabulario de 128k, `gliner_config.json`, `functions.json`; no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo base es un encoder DeBERTa-v3-large con atención disentangled y codificación de posiciones relativas, sobre el que Knowledgator añade cabezas de tarea específicas para NER (flat y anidado, con grupos de etiquetas y prompts de tarea), clasificación monoetiqueta y multietiqueta, extracción conjunta de entidades y relaciones, estructuración de registros con campos de texto, clase, enum, objetos anidados y listas, campos calculados (`$calculate`), edición de texto y embeddings. Un BiLSTM a nivel de palabra procesa la secuencia de palabras para las cabezas que operan sobre palabras en lugar de tokens.

El export a Core AI no modifica los pesos aprendidos salvo el cast a FP16; solo reescribe la estructura del grafo. Entre los cambios documentados: buckets constantes de posición relativa en la atención de DeBERTa (la ruta de log-buckets en coma flotante produce índices incorrectos en grafos convertidos), un desplazamiento relativo sin gather, SDPA fusionada, proyecciones key/query de posición relativa plegadas en tablas constantes, encoder reagrupado en segmentos de 128 tokens para almacenar los pesos una sola vez, BiLSTM de palabras desenrollado en pasos de 32 palabras con estado acarreado y sustitución de helpers que ramifican según valores de tensor por código de forma fija bajo precondiciones garantizadas por el host. El export se realizó con coreai-torch 0.4.3, coreai-core 1.0.0b3, Torch 2.9.0 y Transformers 5.12.1, a partir del checkpoint en la revisión `f76390db3cc8b7c7ee990f2f67bb97384b2f90d5` y del código upstream en el commit `e63a2c5`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Extracción de entidades nombradas (NER) planas y anidadas, con soporte de grupos de etiquetas y prompts de tarea.
- Clasificación de texto monoetiqueta y multietiqueta, con varios grupos de etiquetas en una misma pasada.
- Extracción conjunta de entidades y relaciones (relation extraction) con hasta 16 tipos de relación y hasta 256 pares de entidades por llamada.
- Estructuración de registros: campos de texto, clase y enum, objetos anidados y listas, números, fechas y horas interpretados como valores.
- Campos calculados mediante `$calculate` (sumas, diferencias y ratios sobre números presentes en el texto).
- Edición de texto: corrección ortográfica, gramática y reescrituras guiadas por instrucción.
- Generación de embeddings de texto (`embed_t<T>`).
- Ejecución de varias tareas en una sola pasada.
- Inferencia on-device en iOS 27+ y macOS 27+ mediante Core AI, con assets separados para GPU (FP16) y CPU (BiLSTM en FP32).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Extracción de entidades en documentos escaneados o formularios en el dispositivo: el modelo puede procesar texto en inglés de hasta 4096 tokens y devolver entidades planas o anidadas con grupos de etiquetas configurables, sin enviar datos a la nube, lo que resulta adecuado para aplicaciones de privacidad en iOS y macOS.
- Clasificación de correos o tickets en apps nativas: con clasificación monoetiqueta y multietiqueta y varios grupos de etiquetas en una pasada, se puede etiquetar contenido localmente en el dispositivo y reducir la latencia frente a una llamada de red.
- Estructuración de registros a partir de texto libre: el modelo puede rellenar campos de texto, clase, enum, objetos anidados y listas, además de leer números, fechas y horas como valores, lo que encaja en la digitalización de facturas, partes o fichas clínicas en inglés.
- Extracción de relaciones en bases de conocimiento locales: con hasta 16 tipos de relación y 256 pares de entidades por llamada, se pueden construir grafos de entidades y relaciones en aplicaciones de análisis documental on-device.
- Cálculo de campos derivados: la función `$calculate` permite sumar, restar o calcular ratios sobre números presentes en el texto, útil para totales de facturas o métricas en informes sin post-procesado externo.
- Corrección y reescritura de texto en editores: las cabezas de edición (`editops`, `editcontent`) permiten corregir ortografía y gramática o aplicar reescrituras guiadas por instrucción en un editor de texto nativo, con el modelo ejecutándose localmente.
- Búsqueda semántica local: los embeddings de texto (`embed_t<T>`) permiten indexar y recuperar documentos en el dispositivo sin depender de servicios externos.
- Preprocesado de pipelines NLP en el edge: al combinar NER, clasificación, relaciones y estructuración en una sola pasada, se puede reducir el número de modelos desplegados en una app.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el asset principal de GPU ocupa 1,67 GB en FP16, a lo que hay que sumar los assets auxiliares (mix de atención de 8 a 80 KB por longitud, BiLSTM de 25 MB en CPU) y el estado de ejecución del host.
- GPU recomendadas: no se especifican modelos concretos; el destino es Core AI en dispositivos Apple con iOS 27+ y macOS 27+, por lo que la inferencia se realiza sobre la GPU integrada de los chips Apple compatibles.
- Compatibilidad con GPU de consumo: no se documenta soporte para GPUs NVIDIA (A100, H100, RTX 4090) ni para otros backends; el formato `.aimodel` es específico de Core AI.
- Opciones de despliegue: Core AI (coreai-torch 0.4.3, coreai-core 1.0.0b3) con Torch 2.9.0 y Transformers 5.12.1 para el export; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| GLiFormer-0.4B-v1.5-FP16-CoreAI (este) | ~0,4B | hasta 4096 tokens | NER, clasificacion, relaciones, registros, calculo, edicion, embeddings | Apache 2.0 | Core AI (`.aimodel`), on-device Apple |
| knowledgator/gliformer-0.4b-v1.5 | ~0,4B | no disponible en la informacion | Las mismas tareas | Apache 2.0 | Checkpoint original (Transformers) |
| smdesai/GLiFormer-0.4B-v1.5-H8-CoreAI | ~0,4B | hasta 4096 tokens | Las mismas tareas, cabezas en int8 | Apache 2.0 | Core AI, on-device Apple |
| GLiNER (familia, modelos comparables de extraccion de entidades) | variable | no disponible | NER zero-shot | variable segun checkpoint | Transformers, ONNX, etc. |

La comparativa se limita a variantes del mismo modelo base y a la familia GLiNER, ya que no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés (`en`); no se documenta cobertura multilingüe.
- Es un encoder con cabezas de tarea, no un modelo generativo general: no se documenta soporte de tool calling, agentes ni razonamiento multi-paso.
- Riesgo de alucinación en tareas de estructuración y cálculo: los campos calculados y las lecturas de números, fechas y horas pueden producir valores incorrectos si el texto de entrada es ambiguo.
- La longitud de contexto está limitada a 4096 tokens y el encoder se trocea en segmentos de 128 tokens con padding al siguiente múltiplo, lo que puede introducir ineficiencias en secuencias cortas.
- El formato `.aimodel` es específico de Core AI y requiere iOS 27+ o macOS 27+; no es portable a otros runtimes sin reconversión.
- El export sustituye helpers que ramifican según valores de tensor por código de forma fija bajo precondiciones que garantiza el host; un uso fuera de esas precondiciones puede producir resultados incorrectos.
- No se han publicado benchmarks ni métricas de calidad en la información disponible, por lo que la evaluación en producción debe hacerse con un conjunto propio.
- Aunque la licencia es Apache 2.0, conviene revisar los términos del checkpoint base y del código upstream para usos comerciales concretos.
- El repositorio no registra descargas ni interacciones, lo que limita la evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smdesai/GLiFormer-0.4B-v1.5-FP16-CoreAI
- Modelo base: https://huggingface.co/knowledgator/gliformer-0.4b-v1.5
- Variante int8: https://huggingface.co/smdesai/GLiFormer-0.4B-v1.5-H8-CoreAI
- Repositorio upstream de GLiFormer: https://github.com/Knowledgator/GLiFormer
- Web de Knowledgator: https://knowledgator.com

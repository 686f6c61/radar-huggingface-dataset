# algerian-nlp/DZAIR-ONNX-INT8

## Resumen

DZAIR-ONNX-INT8 es la versión ONNX cuantizada a 8 bits de forma dinámica del modelo algerian-nlp/DZAIR, un encoder fundacional de 105,3 millones de parámetros especializado en dariya argelina (código de idioma `arq`), tanto en escritura árabe como en arabizi latino. Lo publica el propio autor del modelo base, el proyecto algerian-nlp, y su función principal es la extracción de características (embeddings) sobre texto en dariya. No es un modelo generativo: se trata de un encoder tipo BERT del que no se detallan capas ni cabezas de atención en la información disponible, y que produce representaciones de dimensión 768.

El problema que resuelve es el coste de despliegue de un encoder en entornos con restricciones severas de memoria. La cuantización reduce el peso en disco de 401,71 MB a 102,76 MB, un 74,4 % menos (unas 3,9 veces de compresión), manteniendo una fidelidad semántica del 99,95 % medida como similitud coseno de 0,999505 frente al modelo base en FP32. El autor reporta además una mejora del 18,3 % en throughput sobre CPU (de 4.112 a 4.866 tokens por segundo) y una paridad de tareas downstream superior al 99,8 %.

Su relevancia actual radica en que abre el uso de un encoder específico de dialecto en escenarios donde un modelo FP32 no cabe: aplicaciones móviles, dispositivos IoT, funciones serverless y contenedores con presupuestos de memoria inferiores a 256 MB. La licencia Apache 2.0 facilita su integración comercial, aunque el modelo está limitado a dariya argelina y requiere adaptación de dominio para otros dialectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (familia del modelo base DZAIR; numero de capas y cabezas no disponible) |
| Parametros totales | 105,3 millones (heredados del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantizacion dinamica de 8 bits (`onnxruntime.quantization`): pesos simetricos `qint8`, activaciones `QUInt8` con escalado dinamico por token; operadores objetivo MatMul, Gemm y matrices Linear |
| Idiomas soportados | Dariya argelina (`arq`) en escritura arabe y arabizi latino |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, 102,76 MB); tokenizador SentencePiece Unigram de 48.000 tokens |
| Dimension de embedding | 768 (segun el ejemplo de uso: `[3, seq_len, 768]`) |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | optimum (ONNX Runtime) |
| Modelo base | algerian-nlp/DZAIR (SHA-256 de pesos base: `b2448ca8dbc015cd90e13fce851122a15ac2855ff445c09f4af36d382709c006`) |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

DZAIR es un encoder fundacional para dariya argelina de 105,3 millones de parametros, con salida de embeddings de 768 dimensiones. La ficha disponible no detalla el numero de capas, cabezas de atencion, ni la composicion del dataset o el numero de tokens de preentrenamiento del modelo base, por lo que esos datos deben consultarse en la ficha de algerian-nlp/DZAIR. Tampoco se documenta si hubo fases de ajuste con RLHF o DPO; al tratarse de un encoder destinado a extraccion de caracteristicas, ese tipo de alineamiento no resultaria aplicable en el mismo sentido que en un modelo generativo.

La innovacion tecnica de esta variante es exclusivamente la cuantizacion: se aplica cuantizacion dinamica de 8 bits sobre los pesos de las matrices MatMul, Gemm y Linear, con pesos simetricos `qint8` y activaciones `QUInt8` escaladas dinamicamente por token. El proceso de verificacion de fidelidad usa `tools/quantize_onnx.py` con un umbral minimo de similitud coseno de 0,980; el resultado declarado es 0,999505 de similitud coseno, 0,024433 de error absoluto medio y 0,175404 de diferencia absoluta maxima respecto al modelo FP32. El tokenizador incorpora reglas de normalizacion argelinas versionadas en `tokenizer_rules.yaml` (unificacion de hamzas y eliminacion de tatweels no semanticos), y el autor recomienda pasar el texto a minusculas en los caracteres latinos antes de tokenizar para preservar la fertilidad del arabizi, sin eliminar los numerales del arabizi (3 para ayn, 7 para ha).

## Capacidades

- Extraccion de caracteristicas y generacion de embeddings de frases en dariya argelina (`arq`), con salida de ultima capa oculta de dimension 768.
- Procesamiento de texto en dos sistemas de escritura: arabe y arabizi latino, incluyendo la normalizacion de variantes ortograficas propias de la dariya.
- Clasificacion downstream cuando se le anade una cabeza de clasificacion (el autor reporta resultados con cabeza cls+mlp entrenada 3 epocas sobre 10 semillas).
- Busqueda semantica y similitud entre frases mediante vectores de embedding.
- Inferencia en CPU con cuantizacion INT8, sin necesidad de GPU.
- Ejecucion en navegador mediante ONNX.js y en movil mediante ONNX Runtime Mobile, segun los usos previstos declarados.
- No soporta generacion de texto (es un encoder), ni tool calling, ni razonamiento multi-paso, ni capacidades de vision o audio. No se documentan capacidades de agentes.

## Casos de uso

- Clasificacion de sentimiento en movil: el modelo se integra en aplicaciones iOS y Android mediante ONNX Runtime Mobile y, con una cabeza de clasificacion ligera, etiqueta comentarios en dariya escritos en arabe o arabizi; su tamano de 102,76 MB y su ejecucion en CPU lo hacen viable en dispositivos sin GPU.
- Analisis de opinion en redes sociales y foros: los benchmarks del autor sobre los conjuntos Twifil (accuracy 0,788) y Ranim (accuracy 0,962) muestran que el encoder es aprovechable para monitorizar conversaciones dialectales en plataformas argelinas.
- Busqueda semantica en microservicios CPU: generar embeddings de un corpus de dariya y servirlos desde un servicio en contenedor con presupuesto de memoria inferior a 256 MB, usando similitud coseno para recuperar documentos relevantes.
- Funciones serverless de bajo coste: desplegado en AWS Lambda u otros entornos de funciones, el modelo cabe en instancias de un solo nucleo y evita el coste de una GPU, lo que reduce el gasto por invocacion en pipelines de enriquecimiento de texto.
- Procesamiento en dispositivos IoT y edge: en una Raspberry Pi o un sistema embebido, el modelo puede ejecutarse como extractor de caracteristicas local para prefiltrar o etiquetar texto sin enviar datos a la nube.
- Embeddings en el navegador: mediante ONNX.js, permite calcular representaciones vectoriales en el cliente para funciones de busqueda o recomendacion sin exponer el texto del usuario a un servidor.
- Moderacion y filtrado de contenido en dialecto: combinado con un clasificador entrenado sobre sus embeddings, sirve para detectar mensajes abusivos o spam en comunidades argelinas, un dominio poco cubierto por los encoders multilingues genericos.
- Deduplicacion y agrupamiento de textos dialectales: los embeddings sirven para agrupar o deduplicar grandes volumenes de comentarios en dariya en pipelines de limpieza de datos previos al entrenamiento de otros modelos.

## Benchmarks y rendimiento

Resultados declarados por el autor. Todas las cifras de clasificacion se obtuvieron con una cabeza cls+mlp entrenada 3 epocas sobre 10 semillas del articulo, y estan marcadas como no verificadas (`verified: false`) en el model-index.

| Tarea | Conjunto de evaluacion | Accuracy | Macro F1 |
|---|---|---|---|
| Analisis de sentimiento en arabizi | NArabizi Sentiment (test) | 0,654 | 0,595 |
| Analisis de sentimiento en foros | Ranim Sentiment (test) | 0,962 | 0,958 |
| Analisis de sentimiento en Twitter | Twifil Sentiment (test) | 0,788 | 0,782 |

Comparativa de cuantizacion declarada por el autor (medida en hardware CPU identico para ambas variantes):

| Metrica | PyTorch FP32 (base) | DZAIR-ONNX-INT8 | Retencion |
|---|---|---|---|
| Tamano en disco (`model.onnx`) | 401,71 MB | 102,76 MB | 74,4 % menos (3,9x de compresion) |
| Fidelidad coseno de embeddings | 1,000000 (referencia) | 0,999505 | 99,95 % |
| Error absoluto medio | 0,000000 | 0,024433 | Deriva de cuantizacion despreciable |
| Diferencia absoluta maxima | 0,000000 | 0,175404 | Dentro del umbral de fidelidad de publicacion |
| Throughput de inferencia (CPU) | 4.112 tok/s | 4.866 tok/s | +18,3 % |
| Paridad en tareas downstream | 100,0 % | >99,8 % | Indistinguible en accuracy de clasificacion |

## Requisitos de hardware

- Inferencia exclusivamente en CPU: el autor indica que funciona eficientemente en instancias de un solo nucleo de bajo coste, sin GPU.
- VRAM necesaria: ninguna para GPU; el modelo esta pensado para despliegue CPU. La memoria RAM pico exacta no esta documentada, pero el peso del grafo es de 102,76 MB y el autor orienta el despliegue a presupuestos de memoria estrictos inferiores a 256 MB.
- GPU recomendadas: no aplica; no se documenta soporte de aceleracion por GPU para esta variante.
- Cabe en cualquier GPU de consumo por tamano, pero el objetivo declarado es el despliegue sin GPU.
- Opciones de despliegue: ONNX Runtime mediante `optimum.onnxruntime.ORTModelForFeatureExtraction`, ONNX Runtime Mobile (iOS y Android), ONNX.js en navegador, contenedores Docker, AWS Lambda y funciones serverless equivalentes.
- Throughput estimado: 4.866 tokens por segundo en CPU segun el autor, un 18,3 % mas rapido que la version FP32 sobre el mismo hardware. No se especifica el modelo de CPU empleado ni la latencia por peticion.
- Nota de integracion: el tokenizador requiere `trust_remote_code=True` por las reglas de normalizacion argelinas personalizadas.

## Comparativa con modelos similares

La informacion disponible solo permite comparar esta variante con su propio modelo base. No se han proporcionado datos de otros encoders comparables (por ejemplo, alternativas multilingues o especificas de arabe dialectal), por lo que no se incluyen cifras de terceros.

| Modelo | Parametros | Formato | Tamano | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| DZAIR-ONNX-INT8 | 105,3 M | ONNX INT8 dinamico | 102,76 MB | No disponible | Apache 2.0 | Cuantizado; +18,3 % de throughput en CPU; fidelidad coseno 0,999505 |
| DZAIR (base) | 105,3 M | PyTorch FP32 | 401,71 MB (grafo ONNX FP32) | No disponible | Apache 2.0 | Referencia de fidelidad; 4.112 tok/s en CPU |

No disponible la comparacion con otros modelos de la misma categoria con los datos facilitados.

## Limitaciones y advertencias

- No es un modelo generativo: es un encoder de extraccion de caracteristicas y no puede usarse para generar texto.
- Cobertura linguistica restringida a la dariya argelina; el autor advierte explicitamente que no es adecuado para dialectos de fuera de Argelia sin adaptacion de dominio.
- Los resultados de clasificacion son bajos en el conjunto NArabizi (accuracy 0,654 y macro F1 0,595), lo que sugiere dificultad con el registro arabizi ruidoso; el rendimiento varia mucho segun el dominio (0,962 en foros frente a 0,654 en arabizi).
- Las metricas de benchmarks son declaradas por el autor y estan marcadas como no verificadas (`verified: false`); dependen de una cabeza de clasificacion cls+mlp entrenada 3 epocas sobre 10 semillas, no del encoder aislado.
- Existe deriva de cuantizacion: 0,024433 de error absoluto medio y 0,175404 de diferencia absoluta maxima frente a FP32, con una fidelidad coseno de 0,999505. Aunque el impacto agregado es minimo, en tareas muy sensibles a pequenas variaciones del embedding puede notarse.
- La longitud de contexto no esta documentada, lo que impide planificar el truncado optimo en documentos largos; habra que determinarla experimentalmente con el tokenizador.
- Requiere `trust_remote_code=True` para cargar el tokenizador, lo que implica ejecutar codigo del repositorio; conviene revisarlo antes de desplegarlo en produccion.
- El pipeline de tokenizacion impone reglas concretas (minusculas en caracteres latinos, no eliminar numerales del arabizi) cuyo incumplimiento degrada los resultados.
- No se documentan sesgos especificos, pero al ser un modelo entrenado sobre datos dialectales de origen limitado, cabe esperar sesgos derivados de la composicion del corpus del modelo base, no detallada aqui.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; el autor no impone restricciones adicionales conocidas mas alla de las del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/algerian-nlp/DZAIR-ONNX-INT8
- Modelo base en HuggingFace: https://huggingface.co/algerian-nlp/DZAIR
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (solo resultados no relacionados sobre horarios de oracion), por lo que no hay enlaces adicionales a papers, blogs, repositorios o demos que se puedan incluir. El repositorio menciona un script de verificacion `tools/quantize_onnx.py` sin URL publica disponible.

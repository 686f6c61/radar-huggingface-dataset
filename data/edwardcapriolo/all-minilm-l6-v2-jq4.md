# edwardcapriolo/all-MiniLM-L6-v2-JQ4

## Resumen

El modelo `edwardcapriolo/all-MiniLM-L6-v2-JQ4` es una versión cuantizada del popular modelo de embeddings de frases `sentence-transformers/all-MiniLM-L6-v2`, generada mediante la herramienta **Deliverance Q.O.D. (Quantize On Demand)**. Este modelo transforma frases y párrafos cortos en vectores densos de 384 dimensiones, optimizado para tareas de similitud semántica, búsqueda y agrupamiento. La cuantización reduce el tamaño del modelo de 87,1 MB a 53,0 MB, manteniendo la misma arquitectura y tokenizador, lo que mejora el rendimiento de inferencia local sin necesidad de hardware especializado.

Desarrollado por Edward Capriolo, este modelo se basa en el MiniLM-L6-H384-uncased preentrenado y fine-tuneado con un objetivo contrastivo sobre 1.000 millones de pares de frases. La relevancia actual radica en su eficiencia: al ser extremadamente ligero (53 MB), es adecuado para despliegues en entornos con recursos limitados, como CPUs, dispositivos edge o servicios de baja latencia. La cuantización Q4 es un formato propietario de Deliverance, un motor de inferencia Java local, aunque el modelo también es compatible con la librería `sentence-transformers` y `transformers` de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM) con 6 capas, 384 dimensiones de embedding |
| Parametros totales | no disponible (modelo base MiniLM-L6-H384-uncased, ~22,7 M estimados) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 256 tokens (truncamiento por defecto) |
| Tipos de cuantizacion | Q4 (formato Deliverance), safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, formato Q4 de Deliverance (con sidecars .qb) |

## Arquitectura y entrenamiento

El modelo base es `nreimers/MiniLM-L6-H384-uncased`, un transformer BERT de 6 capas con 384 dimensiones ocultas, preentrenado con un objetivo de modelado de lenguaje enmascarado. Sobre esta base, el modelo original `all-MiniLM-L6-v2` fue fine-tuneado con un objetivo de aprendizaje contrastivo: dado un par de frases, el modelo debe predecir cuál de un conjunto de frases muestreadas aleatoriamente es la realmente emparejada. El entrenamiento se realizó sobre un dataset de 1.000 millones de pares de frases, utilizando 7 TPU v3-8 durante la Community Week de Hugging Face con JAX/Flax.

La versión cuantizada `JQ4` no modifica la arquitectura ni los pesos semánticos, sino que reescribe 36 tensores seleccionados en un formato de cuantización Q4 propietario de Deliverance. Esto reduce el tamaño del modelo en un 39% (de 87,1 MB a 53,0 MB) y acelera la inferencia local, manteniendo la tokenización y la salida de embeddings idénticas al modelo original.

## Capacidades

- Generacion de embeddings de frases y parrafos cortos (hasta 256 tokens) en un espacio vectorial de 384 dimensiones.
- Similitud semantica: calculo de similitud coseno entre frases para medir relacion semantica.
- Busqueda semantica: recuperacion de documentos o frases relevantes mediante comparacion de vectores.
- Agrupamiento (clustering): agrupacion de textos por similitud semantica.
- Clasificacion de texto: mediante embeddings como caracteristicas para clasificadores aguas abajo.
- Soporte multilingue: no, el modelo esta entrenado exclusivamente en ingles.
- No soporta tool calling, agentes ni generacion de texto; es un modelo de codificacion puro.

## Casos de uso

- Busqueda semantica en bases de conocimiento: indexar documentos y consultas como embeddings, y recuperar los mas relevantes por similitud coseno. El modelo es adecuado por su baja latencia y pequeno tamano, permitiendo indexar grandes volumenes en memoria.
- Agrupamiento de tickets de soporte: agrupar solicitudes de atencion al cliente por tema o intencion, facilitando la priorizacion y el analisis de tendencias. Su rapidez permite procesar flujos en tiempo real.
- Deduplicacion de contenido: detectar articulos, anuncios o publicaciones duplicadas comparando embeddings. El modelo es ideal para pipelines de ingestion de datos a gran escala.
- Sistemas de recomendacion basados en texto: recomendar articulos, productos o noticias similares al contenido que el usuario esta viendo, usando embeddings de frases.
- Clasificacion de correos electronicos: generar embeddings de asuntos y cuerpos de correo para clasificarlos en categorias (spam, facturas, newsletters) con un clasificador ligero.
- Analisis de encuestas y feedback: agrupar respuestas abiertas por tema para extraer insights sin etiquetado manual, gracias a la capacidad de clustering del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original `all-MiniLM-L6-v2` tiene resultados conocidos en tareas como STS-B, pero esta version cuantizada no incluye datos de evaluacion especificos. Se recomienda validar el rendimiento en el caso de uso concreto, ya que la cuantizacion Q4 puede introducir una ligera degradacion en la calidad de los embeddings.

## Requisitos de hardware

- VRAM estimada: menos de 100 MB en FP32; con cuantizacion Q4, el modelo ocupa 53 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas NVIDIA GTX 1060, RTX 2060, o incluso integradas. Tambien funciona en CPU sin problemas.
- Compatible con consumer GPU: si, es uno de los modelos mas ligeros disponibles.
- Opciones de despliegue: `sentence-transformers` (Python), `transformers` (Hugging Face), motor Java `Deliverance` (github.com/edwardcapriolo/deliverance), y compatible con `text-embeddings-inference` (segun tags).
- Latencia y throughput: al ser un modelo de 6 capas y 53 MB, la inferencia en CPU es del orden de milisegundos por frase; en GPU, puede procesar cientos de frases por segundo. No se proporcionan cifras exactas.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| all-MiniLM-L6-v2 (original) | ~22,7 M | 384 | 256 | Apache 2.0 | Modelo base sin cuantizar, 87 MB |
| all-MiniLM-L12-v2 | ~33,4 M | 384 | 256 | Apache 2.0 | 12 capas, mayor calidad pero mas lento |
| bge-small-en-v1.5 | ~33,4 M | 384 | 512 | MIT | Mejor rendimiento en busqueda, contexto mayor |
| all-MiniLM-L6-v2-JQ4 (este) | no disponible | 384 | 256 | Apache 2.0 | Cuantizado Q4, 53 MB, compatible con Deliverance |

La comparativa se basa en caracteristicas generales de los modelos; no se dispone de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no es util para textos en otros idiomas.
- Longitud de contexto limitada a 256 tokens; textos mas largos se truncan, perdiendo informacion.
- La cuantizacion Q4 puede degradar ligeramente la precision de los embeddings en comparacion con el modelo original, aunque no se han publicado metricas de evaluacion.
- El formato de cuantizacion Q4 es propietario de Deliverance; para usarlo fuera de ese motor, se necesitan los pesos en safetensors (disponibles en el repositorio).
- No es un modelo generativo; no puede producir texto, solo embeddings.
- Puede heredar sesgos del dataset de entrenamiento (por ejemplo, sesgos de genero o raza en textos de internet), aunque al ser un modelo de embeddings el impacto es menor que en modelos generativos.
- Para uso en produccion, se recomienda validar la calidad de los embeddings en el dominio especifico, ya que la cuantizacion puede afectar a tareas de alta precision.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/edwardcapriolo/all-MiniLM-L6-v2-JQ4
- Modelo original: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Motor Deliverance: https://github.com/edwardcapriolo/deliverance
- Modelo base preentrenado: https://huggingface.co/nreimers/MiniLM-L6-H384-uncased

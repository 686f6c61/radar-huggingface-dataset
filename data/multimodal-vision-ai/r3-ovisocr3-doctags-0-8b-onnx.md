# multimodal-vision-ai/R3-OvisOCR3-DocTags-0.8B-ONNX

## Resumen

R3-OvisOCR3-DocTags-0.8B-ONNX es un modelo de vision-lenguaje especializado en reconocimiento y comprension de documentos, desarrollado por el grupo de investigacion R3 de la Universidad Hohai (河海大学). Su funcion es convertir la imagen de una pagina de documento en texto estructurado en formato DocTags, que incluye el contenido textual, la categoria de cada region, sus coordenadas de posicion y la estructura de tablas. Se trata de un fine-tuning del modelo ATH-MaaS/OvisOCR3, que a su vez se apoya en la arquitectura Qwen3.5-0.8B, con un vocabulario ampliado especificamente para esta tarea.

El modelo resuelve un problema concreto de la digitalizacion documental: la conversion de paginas escaneadas o fotografiadas en representaciones estructuradas y legibles por maquina, sin depender de pipelines OCR clasicos por etapas. La salida DocTags codifica regiones como titulos, texto, tablas (con celdas y estructura OTSL), numeros de pagina, cabeceras, pies, imagenes, sellos, huellas dactilares y texto manuscrito, cada una con coordenadas normalizadas en el rango 0-500.

Es relevante ahora porque esta orientado al despliegue en navegador mediante ONNX y WebGPU, lo que permite ejecutar inferencia en la GPU del visitante sin infraestructura de servidor. No obstante, el propio autor advierte de que el repositorio esta en fase de preparacion: los ficheros ONNX y la validacion real por WebGPU aun no estan publicados, y las metricas mostradas corresponden al modelo antes de la conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje basado en Qwen3.5-0.8B (tags: qwen3_5) |
| Parametros totales | 0.8B (según denominacion del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (limite de contexto usado en evaluacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (repo de publicacion ONNX; pesos PyTorch originales no incluidos) |

## Arquitectura y entrenamiento

El modelo parte de ATH-MaaS/OvisOCR3, construido sobre Qwen3.5-0.8B, y se ha adaptado mediante entrenamiento de migracion de formato hacia DocTags. El ajuste se realizo con LoRA (rank=16, alpha=32, dropout=0.05), tasa de aprendizaje 0.00002 con scheduler coseno, batch por dispositivo de 1 y acumulacion de gradientes de 8. Los parametros LoRA se han fusionado en el modelo completo. El checkpoint publicado corresponde al paso 8.100 de entrenamiento.

El entrenamiento utilizo 169.394 paginas de documento, combinando anotacion humana, tablas con gold standard, documentos sinteticos con degradaciones y datos silver generados por otros modelos; todas las respuestas pasaron una comprobacion estricta de sintaxis DocTags. La supervision combina entropia cruzada sobre la respuesta con una perdida de sintaxis de peso 1.0. Las imagenes se limitaron a un maximo de 1440 x 1440 pixeles manteniendo la relacion de aspecto, y las secuencias a 16.384 tokens. Una innovacion destacable es la ampliacion del vocabulario: la matriz de embeddings tiene 252.480 filas, con 529 tokens nuevos de DocTags y coordenadas, 3.874 tokens de caracteres chinos normalizados y 4.403 tokens nuevos en total, cubriendo 8.105 caracteres de la tabla de caracteres chinos estandar en un solo token. La carga y conversion deben preservar este vocabulario y el tamano de la matriz de embeddings.

## Capacidades

- Conversion de imagenes de paginas de documento a DocTags estructurados.
- Reconocimiento de regiones con categoria y coordenadas (cuatro tokens consecutivos para izquierda, arriba, derecha, abajo, en rango 0-500).
- Etiquetas soportadas: doctag, title, text, otsl, page_number, page_header, page_footer, picture, seal, fingerprint, handwritten, fcel, ecel, lcel, ucel, xcel, nl.
- Representacion de estructura de tablas mediante etiquetas OTSL y de celdas (fcel, ecel, lcel, ucel, xcel) y saltos de linea (nl).
- Deteccion y marcado en linea de texto manuscrito, sellos y huellas dactilares dentro de texto o celdas.
- Generacion determinista por defecto (temperatura 0, penalizacion por repeticion 1.0).
- Capacidad conversacional de tipo image-text-to-text (pipeline declarado).
- Soporte multilingue limitado a chino e ingles.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agentico.

## Casos de uso

- Digitalizacion masiva de archivos documentales: el modelo convierte cada pagina escaneada en DocTags con texto, regiones y coordenadas, adecuado para pipelines de ingestion donde se requiere estructura y no solo texto plano.
- Extraccion de tablas financieras o administrativas: gracias a las etiquetas OTSL y de celdas, puede reconstruir la estructura de tablas en documentos con formato tabular, util para sistemas de contabilidad o analisis de datos.
- Procesamiento de formularios y documentos con sellos o firmas: las etiquetas seal, fingerprint y handwritten permiten marcar elementos no textuales, relevante en tramitacion documental y verificacion.
- Despliegue en navegador sin servidor: al publicarse los ficheros ONNX, el modelo puede ejecutarse via WebGPU en la GPU del visitante, apropiado para herramientas de escaneo web o aplicaciones de escritorio ligeras.
- Indexacion y busqueda documental: la salida estructurada con categorias y coordenadas facilita la construccion de indices por region y la recuperacion de fragmentos concretos.
- Preprocesado para pipelines RAG sobre documentos: la conversion a DocTags preserva la estructura de secciones, tablas y cabeceras, lo que mejora la fragmentacion semantica antes de la vectorizacion.
- Digitalizacion de documentos en chino e ingles: el vocabulario ampliado con 3.874 caracteres chinos normalizados y la cobertura de 8.105 caracteres estandar lo hacen adecuado para corpus bilingues en esos idiomas.

## Benchmarks y rendimiento

Las metricas siguientes corresponden al modelo antes de la conversion a ONNX, segun el autor, y no deben considerarse resultados del modelo ONNX. Se obtuvieron sin postprocesado de texto ni restricciones sintacticas en inferencia.

| Conjunto | Paginas | Limite de pixeles | Puntuacion total | Salidas validas |
|---|---:|---|---:|---:|
| Bench A | 143 | 1440 x 1440 | 93,0589 | 135 / 143 |
| Bench B | 1.100 | 1440 x 1440 | 91,0281 | 1.013 / 1.100 |
| OmniDocBench | 1.651 | 2880 x 2880 | 88,2428 | 1.453 / 1.651 |

Parametros de generacion: maximo 16.384 tokens de salida, contexto maximo 32.768, temperatura 0, penalizacion por repeticion 1.0. La comprobacion de salidas incluye sintaxis estricta, truncamiento y deteccion de bucles; pasar la comprobacion no garantiza exactitud total del reconocimiento de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; con 0.8B de parametros, la huella de pesos en precision completa ronda 1,6 GB, y en cuantizaciones de 8 o 4 bits seria considerablemente menor, pero el autor no publica cifras.
- GPU recomendadas: no disponible; el modelo esta pensado para ejecucion en navegador via WebGPU sobre la GPU del visitante, por lo que el rendimiento depende del hardware del cliente.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano de 0.8B, aunque no hay validacion publicada.
- Opciones de despliegue: ONNX Runtime con WebGPU en navegador; el autor indica que se requiere cargar conjuntamente el grafo ONNX, los ficheros de pesos externos, el vocabulario, la configuracion de procesamiento de imagen y la plantilla de conversacion.
- Latencia y throughput: no disponible; el autor senala que la resolucion efectiva, la longitud de salida, el consumo de memoria y la velocidad deben medirse segun navegador, GPU y precision del modelo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| R3-OvisOCR3-DocTags-0.8B-ONNX | 0.8B | 32.768 tokens | Apache-2.0 | ONNX | Fine-tuning de OvisOCR3 para DocTags |
| ATH-MaaS/OvisOCR3 | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva este |
| Qwen/Qwen3.5-0.8B | 0.8B | no disponible | no disponible | no disponible | Modelo subyacente de la arquitectura |

## Limitaciones y advertencias

- El repositorio esta en preparacion: los ficheros ONNX y la validacion real por WebGPU aun no se han publicado; las metricas corresponden al modelo previo a la conversion.
- Las tablas complejas, las paginas densas y largas, los sellos, el texto manuscrito y las huellas dactilares pueden producir omisiones, errores de contenido, coordenadas incorrectas, bucles o truncamientos.
- El autor recomienda verificar la salida contra la imagen original en cualquier uso con contenido de negocio real.
- Idiomas soportados limitados a chino e ingles; no se declara cobertura de castellano ni de otras lenguas.
- La generacion es determinista por defecto y no se aplican limpieza de bucles, correccion de coordenadas ni reparacion de estructura de tablas.
- El entrenamiento incluyo datos de fuentes no publicas con licencia; la publicacion del modelo no concede acceso ni derecho de redistribucion sobre esos datos originales.
- No se incluyen en el repositorio los pesos PyTorch originales, las imagenes de entrenamiento, las anotaciones ni las muestras de test internas.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse la informacion de atribucion y modificaciones indicada en NOTICE.
- Riesgo de alucinacion en la transcripcion de texto y en la asignacion de coordenadas, especialmente en documentos degradados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/multimodal-vision-ai/R3-OvisOCR3-DocTags-0.8B-ONNX
- Modelo base: https://huggingface.co/ATH-MaaS/OvisOCR3
- Modelo subyacente: https://huggingface.co/Qwen/Qwen3.5-0.8B

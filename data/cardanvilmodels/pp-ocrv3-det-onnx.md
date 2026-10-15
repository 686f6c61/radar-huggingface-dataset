# CardAnvilModels/PP-OCRv3-det-ONNX

## Resumen

PP-OCRv3-det-ONNX es una copia en formato ONNX del detector de texto de PP-OCRv3, el sistema de reconocimiento optico de caracteres (OCR) de PaddleOCR, mantenido por PaddlePaddle. El repositorio lo publica el usuario CardAnvilModels como una copia sin modificaciones de un unico fichero (`detection/v3/det.onnx`) procedente del repositorio `monkt/paddleocr-onnx` en el commit `7b02d0a`. Su funcion es puramente de deteccion: localiza las regiones de una imagen que contienen texto, pero no transcribe su contenido. La transcripcion corresponde a un modelo de reconocimiento independiente.

Se trata de una arquitectura basada en DBNet (Differentiable Binarization), un detector de objetos especializado en segmentacion de texto que produce mapas de probabilidad y mapas de umbral que se combinan para delimitar cajas o poligonos de texto. El modelo se distribuye exclusivamente en formato ONNX y esta pensado para ejecutarse en el navegador mediante `onnxruntime-web`, tal como lo emplea la aplicacion Card Anvil para permitir la seleccion de texto superpuesto sobre ilustraciones de cartas.

Su relevancia practica es acotada pero clara: es un artefacto de despliegue congelado (una copia inmutable para evitar que el fichero cambie bajo una aplicacion en produccion), no un modelo entrenado o publicado por sus responsables. El repositorio no incluye pesos en safetensors ni version de PyTorch, no aporta datos de entrenamiento ni resultados de evaluacion, y su licencia es Apache 2.0, heredada de la fuente original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DBNet (detector de texto, basado en segmentacion); backbone no especificado en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible; se distribuye como un unico fichero ONNX (precision no declarada en la model card) |
| Idiomas soportados | no especificado; al ser un detector de regiones, la localizacion de texto no depende del idioma, pero la transcripcion requiere un modelo de reconocimiento aparte |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`detection/v3/det.onnx`) |

## Arquitectura y entrenamiento

La model card identifica el modelo como el detector de texto de PP-OCRv3 basado en DBNet. DBNet aborda la deteccion de texto como un problema de segmentacion: la red produce un mapa de probabilidad por pixel y un mapa de umbral adaptativo, y la binarizacion diferenciable combina ambos para generar la mascara final de texto. Esto permite obtener regiones con formas arbitrarias (texto inclinado o curvo) y es la base del preprocesado geometrico previo al reconocimiento.

No se dispone de informacion sobre el backbone concreto, el numero de parametros, el volumen de datos de entrenamiento ni la composicion del dataset utilizado por PaddleOCR para entrenar PP-OCRv3. Tampoco se documenta el uso de RLHF, DPO u otras tecnicas de ajuste, que no aplican a un modelo de deteccion visual. La innovacion relevante en este repositorio es operativa, no algorismica: la conversion a ONNX y la fijacion de la version en un commit concreto (`7b02d0a`) para garantizar la reproducibilidad del artefacto que consume la aplicacion cliente.

## Capacidades

- Deteccion de regiones de texto en imagenes: devuelve cajas o poligonos que delimitan donde hay texto, no su contenido.
- Procesamiento de texto inclinado o con formas no rectangulares, gracias al enfoque de segmentacion de DBNet.
- Ejecucion en navegador mediante `onnxruntime-web`, sin necesidad de backend de inferencia en servidor.
- Integracion en pipelines de OCR como etapa previa a un modelo de reconocimiento (el propio `monkt/paddleocr-onnx` incluye el detector y el reconocedor de forma separada).
- No realiza reconocimiento optico de caracteres, traduccion, comprension de texto ni ninguna tarea generativa.
- No dispone de soporte de tool calling, razonamiento multi-paso, agentes ni capacidades multilingues en el sentido de generacion de lenguaje.

## Casos de uso

- Seleccion de texto sobre ilustraciones en aplicaciones de cartas coleccionables: Card Anvil usa este detector para identificar las regiones con texto impreso sobre el arte de la carta y permitir al usuario seleccionarlas en el navegador, delegando la transcripcion a otro componente.
- Preprocesado en pipelines de OCR en el cliente: el detector reduce la imagen a las regiones candidatas antes de invocar al reconocedor, lo que disminuye el coste de la etapa de reconocimiento y evita enviar la imagen completa a un servicio externo.
- Digitalizacion de documentos escaneados en aplicaciones web: la deteccion previa permite aislar bloques de texto en formularios, facturas o tickets antes de aplicar OCR, mejorando el orden de lectura al poder ordenar las cajas por coordenadas.
- Captura de texto en imagenes dentro de aplicaciones moviles o PWA: al ejecutarse con `onnxruntime-web`, encaja en flujos sin backend, con los datos permaneciendo en el dispositivo.
- Anonimizado previo a la publicacion de imagenes: localizar las regiones de texto permite aplicar mascaras o desenfoques sobre areas potencialmente sensibles antes de compartir una captura.
- Extraccion de texto en capturas de pantalla para herramientas de accesibilidad: el detector delimita las zonas de texto de la interfaz para su posterior lectura por voz o ampliacion.
- Indexacion de archivos de imagen en repositorios locales: deteccion inicial como paso de un pipeline que decida que imagenes contienen texto y merecen pasar por reconocimiento completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio es una nota de procedencia del fichero y no incluye metricas de deteccion (precision, recall, F1, H-mean) ni comparaciones con otros detectores. Tampoco se han encontrado resultados de busqueda web relevantes sobre este repositorio concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio aparece como 0.0 GB en los metadatos, lo que sugiere un fichero muy pequeno, pero no se declara el numero de parametros ni la huella real en memoria.
- GPU dedicada: no es necesaria. El caso de uso declarado es la ejecucion en navegador con `onnxruntime-web`, lo que implica CPU o aceleracion via WebGPU/WASM.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso previsto, dado que el modelo esta disenado para ejecutarse en cliente.
- Opciones de despliegue: `onnxruntime-web` en navegador; tambien puede ejecutarse con ONNX Runtime (Python, C++, C#) o convertirse a otros runtimes de ONNX, asi como integrarse como etapa dentro de pipelines de PaddleOCR.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, de la resolucion de entrada y del backend de ejecucion, y no se documentan en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PP-OCRv3-det-ONNX (este repositorio) | Detector de texto DBNet | ONNX | Imagen (resolucion no especificada) | Apache 2.0 | HuggingFace, copia fijada a un commit |
| `monkt/paddleocr-onnx` | Suite OCR completa (deteccion + reconocimiento) | ONNX | Imagen | Apache 2.0 | HuggingFace |
| PaddleOCR (PP-OCRv3, PP-OCRv4) | Suite OCR completa | PaddlePaddle, exportable a ONNX | Imagen | Apache 2.0 | GitHub y modelos oficiales de PaddlePaddle |
| CRAFT | Detector de texto basado en segmentacion | PyTorch | Imagen | MIT (segun su repositorio original) | GitHub |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No reconoce texto: solo devuelve regiones. Usarlo sin un modelo de reconocimiento posterior no produce transcripcion alguna.
- No se documentan los parametros, la precision numerica del fichero ONNX ni el backbone, lo que dificulta estimar coste computacional y calidad de deteccion a partir de la model card.
- Este repositorio es una copia de terceros de un fichero ajeno: las mejoras, correcciones o actualizaciones deben buscarse en el repositorio de origen (`monkt/paddleocr-onnx`) o en PaddleOCR, no aqui.
- El repositorio registra 0 descargas y 0 likes, y las fechas de creacion y actualizacion (2026-10-15, con dos segundos de diferencia) resultan anomalas, por lo que conviene verificar la integridad y procedencia del fichero antes de usarlo en produccion.
- El rendimiento de deteccion depende fuertemente de la calidad de imagen, la resolucion de entrada y el preprocesado; no hay metricas publicadas para este artefacto concreto.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos (regiones detectadas sin texto real) y falsos negativos (texto muy pequeno, de bajo contraste o sobre fondos complejos).
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y atribucion. Al tratarse de una copia, deben mantenerse los creditos a PaddlePaddle y a `monkt/paddleocr-onnx`.
- Para uso en produccion conviene fijar el hash del fichero ONNX y verificar que coincide con el del commit referenciado, dado que el proposito declarado del repositorio es servir un artefacto inmutable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/CardAnvilModels/PP-OCRv3-det-ONNX
- Repositorio de origen de la conversion a ONNX: https://huggingface.co/monkt/paddleocr-onnx
- Commit de origen: https://huggingface.co/monkt/paddleocr-onnx/tree/7b02d0a30a07ba2b92ad1ff5a8941ae2c633de65
- Proyecto PaddleOCR (PaddlePaddle): https://github.com/PaddlePaddle/PaddleOCR
- Organizacion Card Anvil: https://github.com/Card-Anvil
- No se han encontrado resultados de busqueda web relevantes sobre este modelo; las busquedas devolvieron unicamente contenido sin relacion (informacion sobre Twitch).

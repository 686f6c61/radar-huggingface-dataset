# Aananda-giri/book-page-cropper

## Resumen

Book Page Cropper es un modelo experimental de vision por computador desarrollado por Aananda-giri que predice las esquinas de las paginas en una fotografia completa de un libro abierto. A diferencia de un modelo de lenguaje, se trata de un modelo de regresion geometrica especializado en el preprocesado de imagenes de documentos: recibe una foto sin recortar y devuelve cuatro pares de coordenadas por cada una de las dos paginas detectadas, junto con una puntuacion de presencia por ranura. Su proposito es automatizar el recorte (cropping) de paginas de libros fotografeados, una tarea previa habitual en pipelines de digitalizacion y OCR.

El modelo emplea una arquitectura MobileNetV3 con un cuello FPN (Feature Pyramid Network) y ocho mapas de calor de 96x96 pixeles, lo que lo situa en la categoria de modelos ligeros de deteccion de puntos clave orientados a documentos. El checkpoint publico se entreno con solo 184 fotografias y 700 pasos sobre una Tesla T4, lo que refleja su caracter marcadamente experimental y de prototipo.

Es relevante ahora porque aborda un problema practico y poco cubierto por los modelos generalistas: la deteccion de geometria de pagina en fotos de libros reales, con soporte para orientacion EXIF, multiples ranuras de pagina y validacion geometrica basica. No obstante, el propio autor advierte de que es un modelo de recorte experimental que requiere revision humana de cada propuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3 + FPN con ocho mapas de calor de 96x96 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de 384x384) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`, archivo `pageprep-spread.pt`) |

## Arquitectura y entrenamiento

El modelo combina un extractor de caracteristicas MobileNetV3 con un cuello FPN que produce ocho mapas de calor de 96x96 pixeles. Sobre esa representacion se predicen las esquinas de las paginas y las puntuaciones de presencia por ranura. El pipeline de inferencia aplica la orientacion EXIF, ajusta la foto completa dentro de un marco de 384x384 con relleno (padding), predice las esquinas y las reproyecta a las coordenadas de la foto original ya transpuesta segun EXIF. El checkpoint supervisa la geometria del recorte y la presencia de pagina, e ignora cabezas heredadas no entrenadas presentes en el archivo.

El entrenamiento uso 184 fotografias con 53 reservadas para el split propio del autor, durante 700 pasos, con PyTorch 2.11.0+cu130 sobre una GPU Tesla T4. Las etiquetas proceden de correcciones humanas de recorte guardadas. Las anotaciones de paginas desconocidas se enmascararon en lugar de tratarse como paginas ausentes, y los splits se agruparon a nivel de libro para evitar fugas entre alias de directorio del mismo libro. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un modelo de vision de este tipo.

## Capacidades

- Prediccion de esquinas de pagina: devuelve cuatro pares `[x, y]` por ranura, en orden horario desde el punto de minimo x+y.
- Deteccion de dos ranuras de pagina por foto, ordenadas de izquierda a derecha o de arriba a abajo segun el eje dominante del pliego.
- Puntuacion de presencia por ranura (`presence`), sin calibrar, con umbral sugerido de 0.5 para identificar ranuras candidatas.
- Validacion geometrica (`valid`) que comprueba convexidad, limites y area del poligono propuesto.
- Normalizacion de orientacion EXIF y reproyeccion de coordenadas al espacio de pixeles de la foto original.
- Inferencia autonoma mediante `predict.py`, sin dependencia de aplicacion de libro, base de datos, servicio OCR ni API remota.
- Soporte de ejecucion en CPU y en GPU CUDA.

## Casos de uso

- Digitalizacion de libros: el modelo recorta automaticamente las paginas de fotos de libros abiertos antes de pasarlas a un pipeline de OCR, reduciendo el trabajo manual de recorte previo.
- Preprocesado en aplicaciones de escaneo movil: integrado como paso previo en una app que captura fotos de libros, el modelo propone las esquinas de cada pagina para que el usuario las confirme o corrija.
- Generacion de datasets de documentos: permite procesar lotes de fotografias y generar recortes candidatos de pagina que luego se revisan y etiquetan, acelerando la creacion de corpus de imagenes de documentos.
- Automatizacion de archivo y bibliotecas digitales: para fondos con fotografias de libros, el modelo puede proponer recortes en lote y marcar los casos dudosos (`requires_review`) para revision humana.
- Control de calidad geometrica: la validacion de convexidad, limites y area permite descartar propuestas degeneradas antes de enviarlas a etapas posteriores del pipeline.
- Prototipado e investigacion en vision de documentos: al ser un modelo ligero (MobileNetV3 + FPN) y ejecutable en CPU o GPU consumer, sirve como base para experimentar con deteccion de esquinas y segmentacion de paginas.
- Integracion en herramientas de escritorio: el script `predict.py` funciona de forma autonoma con una sola imagen, lo que facilita su inclusion en utilidades locales de recorte sin infraestructura de servidor.

## Benchmarks y rendimiento

| Protocolo | Fotos | Paginas anotadas | IoU de poligono medio | IoU de poligono mediano |
|---|---:|---:|---:|---:|
| photo-holdout | 53 | 96 | 0.9465 | 0.9520 |
| holdout-book-e316dfe5f9c2 | 208 | 395 | 0.7764 | 0.8274 |
| holdout-book-f747c1969009 | 29 | 42 | 0.7561 | 0.8824 |

Cada protocolo usa su propio checkpoint entrenado por separado. El checkpoint raiz usa el photo-holdout salvo que `model-info.json` indique lo contrario. Los numeros de holdout por libro evaluan la transferencia mediante modelos separados que excluyeron el libro indicado, y no son puntuaciones de libros no vistos para un checkpoint entrenado con ambos libros. El autor advierte de que los datos reales contienen solo dos libros fisicos y que estas comparaciones son benchmarks de desarrollo, no un conjunto de test final intacto. El solapamiento de poligonos no mide la legibilidad del texto ni demuestra que no se haya perdido contenido.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por la arquitectura (MobileNetV3 + FPN, entrada de 384x384) es un modelo muy ligero, apto para GPUs de gama baja y CPU.
- GPU recomendadas: el autor entreno en una Tesla T4; cualquier GPU CUDA moderna (T4, RTX 3060 en adelante) es suficiente. Se desconoce el consumo exacto.
- GPU consumer: si, cabe con holgura en cualquier GPU consumer con soporte CUDA; tambien puede ejecutarse en CPU (`python predict.py --image ...`).
- Opciones de despliegue: ejecucion directa con `predict.py` (PyTorch), con `--device cuda` para GPU y `--checkpoint PATH` para seleccionar otro checkpoint compatible. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; el autor no reclama latencia en telefono ni rendimiento de produccion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de deteccion de esquinas de pagina ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Modelo experimental: el autor indica explicitamente que es un modelo de recorte experimental y que debe revisarse cada propuesta (`requires_review` permanece siempre verdadero).
- La puntuacion `presence` no esta calibrada y no mide la precision de las esquinas; el campo `valid` comprueba convexidad, limites y area, pero no certifica un recorte correcto.
- No predice rotacion de texto, desenfoque, estado en blanco, necesidad de repetir la foto ni paginas duplicadas.
- Datos de entrenamiento muy limitados: solo 184 fotos y 700 pasos, con dos libros fisicos en los datos reales; los benchmarks son de desarrollo, no un test final intacto.
- Riesgo de generalizacion limitado a libros y condiciones de captura distintos de los del entrenamiento; las puntuaciones de holdout por libro (IoU medio 0.75-0.78) sugieren degradacion en transferencia.
- El solapamiento de poligonos no garantiza texto legible ni ausencia de perdida de contenido.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- No se incluyen fotos de origen en el repositorio del modelo; el checkpoint raiz usa el photo-holdout salvo indicacion contraria en `model-info.json`.
- Algunas selecciones humanas guardadas han cambiado respecto a la exportacion congelada historica; deben mantenerse distintas las anotaciones congeladas y las activas actuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aananda-giri/book-page-cropper

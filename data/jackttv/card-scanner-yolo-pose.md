# jackttv/card-scanner-yolo-pose

## Resumen

`jackttv/card-scanner-yolo-pose` es un modelo de vision por computadora desarrollado por `jackttv`, basado en la arquitectura `yolo26n-pose` de Ultralytics. Esta afinado para detectar tarjetas coleccionables y regresar directamente sus cuatro esquinas como keypoints, sustituyendo al enfoque anterior basado en segmentacion y aproximacion poligonal. El modelo forma parte del pipeline `card-scanner-siglip`, concretamente en la etapa de correccion de perspectiva (`perspective-dewarp`), y resuelve el problema de la perdida de precision en tarjetas muy rotadas, donde la aproximacion de esquinas a partir de una mascara se vuelve ruidosa.

La arquitectura es un detector de objetos con cabeza de estimacion de pose (tamano nano, aproximadamente), que predice un campo de keypoints de forma `[4, 3]` (coordenadas `x`, `y` y visibilidad para cada una de las cuatro esquinas). Al ser un modelo de deteccion y pose, no maneja texto en el sentido de modelos de lenguaje: su entrada es una imagen y su salida son cajas delimitadoras y cuatro puntos por tarjeta. Su relevancia actual radica en que permite una correccion de perspectiva robusta en escenas reales con multiples tarjetas, solapamientos y rotaciones arbitrarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n-pose (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt) segun el ejemplo de uso; no se mencionan otros formatos |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura `yolo26n-pose` de Ultralytics, que combina deteccion de objetos con regresion de keypoints. En lugar de predecir una mascara y derivar las esquinas con `cv2.approxPolyDP`, el modelo aprende a regresar directamente las cuatro esquinas de la tarjeta como keypoints. Esta decision de diseno evita el ruido en la aproximacion poligonal cuando las tarjetas estan fuertemente rotadas, ya que la regresion directa es mas estable ante cambios de orientacion.

El entrenamiento se realizo sobre composiciones sinteticas: fotografias de catalogo de tarjetas reales (con warping de perspectiva, rotacion y colocacion aleatoria, 1-8 por imagen) superpuestas sobre fondos de COCO `train2017` y `val2017`. La coleccion de tarjetas abarca 9 juegos de cartas coleccionables (Pokemon, Pokemon Japan, One Piece, Magic: The Gathering, YuGiOh, Digimon, Lorcana, Flesh & Blood y Star Wars Unlimited), cada uno limitado a 10 000 imagenes para evitar el dominio de un juego concreto. El objetivo no es aprender convenciones visuales de cada juego, sino el concepto general de "tarjeta rectangular, en cualquier rotacion/escala, sobre fondo desordenado". El repositorio de entrenamiento completo y las tecnicas de generacion de datos se publican en `Tabletop-Village/yolo-pose-training`.

## Capacidades

- Deteccion de tarjetas coleccionables en imagenes con multiples tarjetas, incluyendo solapamientos parciales y rotaciones pronunciadas.
- Regresion de cuatro keypoints por tarjeta (esquinas), con informacion de visibilidad para cada punto.
- Generalizacion a juegos no presentes en el corpus de entrenamiento; el modelo aprende propiedades geometricas (tarjeta rectangular) en lugar de rasgos visuales especificos de cada juego.
- Integracion sencilla con el ecosistema Ultralytics mediante la API `YOLO("best.pt")`.
- Salida de cajas delimitadoras y keypoints listos para su uso en pasos posteriores de warp de perspectiva.
- Bajo coste computacional por ser un modelo de tamano nano (no se especifican parametros exactos).

## Casos de uso

- Escaneo de inventarios de tarjetas coleccionables: el modelo permite capturar una foto con varias tarjetas y obtener sus cajas y esquinas, facilitando la clasificacion y el registro automatico en una base de datos.
- Correccion de perspectiva en escaneos de tarjetas: las cuatro esquinas predichas se utilizan para generar un warp que deja la tarjeta alineada, lo que permite leer texto o codigos de barras en tarjetas inclinadas.
- Integracion en pipelines de reconocimiento OCR: al enderezar la tarjeta mediante las keypoints, se puede pasar la imagen normalizada a un modelo OCR como `card-scanner-siglip`, mejorando la precision de lectura en fotos reales tomadas con movil.
- Valoracion y catalogacion de colecciones: en aplicaciones de compraventa, el modelo identifica rapidamente las tarjetas presentes en una foto, reduciendo el trabajo manual de introduccion de datos.
- Preprocesado para vision artificial en entornos de sobremesa: combinado con una camara fija, el modelo detecta tarjetas sobre un trasfondo desordenado (mesa, habitat) y entrega coordenadas para un sistema de seguimiento o clasificacion automatica.
- Automatizacion en flujos de digitalizacion de archivos: en digitalizacion masiva de tarjetas, el modelo sustituye a la segmentacion, ofreciendo esquinas estables incluso en lotes con tarjetas muy inclinadas o solapadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan cifras de VRAM ni requisitos de hardware en la informacion disponible.
- Al ser un modelo de tamano nano, se espera un consumo de memoria bajo, apto para GPUs de gama media o incluso CPU en algunas configuraciones, pero no se puede confirmar sin datos publicados.
- Opciones de despliegue: las tipicas para modelos Ultralytics, incluyendo inferencia local con `ultralytics`, y conversiones posteriores a formatos como ONNX o TensorRT.
- No se documentan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no contiene comparaciones con otros modelos de deteccion de tarjetas.

## Limitaciones y advertencias

- La licencia AGPL-3.0 impone obligaciones de copyleft en sistemas que usen el modelo a traves de una red. Cualquier despliegue como servicio debe publicar el codigo fuente de las modificaciones, lo que puede ser problematico en productos comerciales cerrados.
- El modelo fue entrenado exclusivamente con composiciones sinteticas sobre fondos COCO; en escenarios reales con condiciones de iluminacion extremas, sombras fuertes o fondos muy diferentes, la precision puede degradarse.
- La inclusion de 9 juegos de cartas aporta diversidad, pero el corpus no cubre todos los estilos de tarjetas posibles. Aunque el modelo generaliza a juegos no vistos, su capacidad depende de que la tarjeta presente una forma rectangular y bordes definidos.
- El orden de los keypoints es una convencion estable pero no semanticamente nombrada. Es necesario reordenar las esquinas aguas abajo (por ejemplo, con `order_points()`) para obtener una correspondencia fiable con las esquinas reales.
- No se especifican datos sobre tasas de falsos positivos ni sobre el comportamiento ante objetos similares a tarjetas (fotografias, posavasos, etc.).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jackttv/card-scanner-yolo-pose
- Pipeline de escaneo de tarjetas: https://github.com/Tabletop-Village/card-scanner-siglip
- Repositorio de entrenamiento de pose: https://github.com/Tabletop-Village/yolo-pose-training
- Modelo LoRA de SigLIP del mismo autor: https://huggingface.co/jackttv/card-scanner-siglip-lora

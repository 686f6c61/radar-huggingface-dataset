# geforcefan/dartscribe

## Resumen

dartscribe es un conjunto de dos redes neuronales de visión por computador publicadas por el usuario geforcefan (entrenadas por Ercan Akyürek) para localizar automáticamente una diana de dardos en una fotografía y determinar su orientación. El repositorio de HuggingFace no contiene un modelo de lenguaje, sino dos ficheros ONNX exportados desde Ultralytics: `crossings.onnx`, un detector YOLO11n que localiza la diana y los cruces de los sectores, y `orientation.onnx`, un clasificador YOLO11n que indica cuántos segmentos está girado el 20 respecto a la vertical.

El problema que resuelve es la calibración automática de la diana: a partir de los cruces detectados, el proyecto dartscribe ajusta una proyección mediante RANSAC, deforma la imagen de la diana a un cuadrado canónico de 512×512 y usa el clasificador para saber dónde apunta el 20. Con esa información, una cámara fija puede convertir coordenadas de píxel en puntuaciones reales sin intervención manual, algo útil para marcadores automáticos, robótica de lanzamiento y análisis deportivo.

Se trata de un modelo muy pequeño y especializado, con licencia AGPL-3.0, distribuido únicamente en formato ONNX y entrenado sobre el dataset `geforcefan/dartscribe`. En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, no publica resultados de benchmarks ni métricas de precisión, y no documenta cuantizaciones alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n: dos redes convolucionales de Ultralytics, una de deteccion (`crossings`) y otra de clasificacion (`orientation`) |
| Parametros totales | no disponible (variante nano de YOLO11; el autor no publica el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entradas de imagen de 960x960 y 512x512) |
| Tipos de cuantizacion | no disponible (se distribuyen ficheros ONNX; no se documenta FP16 ni INT8) |
| Idiomas soportados | no aplica (modelo de vision, sin entrada ni salida de texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`crossings.onnx`, `orientation.onnx`) |
| Tarea declarada | object-detection (pipeline de HuggingFace) |
| Libreria | ultralytics |
| Entrada de `crossings.onnx` | 1x3x960x960, RGB normalizado a /255, NCHW, letterbox con relleno gris de valor 114 |
| Salida de `crossings.onnx` | 1x9x18900; filas 0 y 1 con el centro de la caja, filas 4 a 8 con las puntuaciones de clase |
| Clases de `crossings.onnx` | 5: bull, double outer, double inner, treble outer, treble inner |
| Entrada de `orientation.onnx` | 1x3x512x512, tablero deformado a un cuadrado con el centro en el medio y 1,6 radios de doble exterior hasta el borde |
| Salida de `orientation.onnx` | 1x20; la clase k indica que el 20 esta k segmentos en sentido horario desde arriba |
| NMS incluido | no (el postproceso debe aplicarlo fuera del grafo ONNX) |
| Dataset de entrenamiento | geforcefan/dartscribe |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-29 / 2026-09-29 |

## Arquitectura y entrenamiento

La arquitectura es YOLO11n de Ultralytics, la variante nano de la familia YOLO11, aplicada a dos tareas distintas. `crossings.onnx` es una cabeza de deteccion de objetos con 5 clases que localiza el centro de la diana (bull) y los anillos de cruce de los sectores (double outer, double inner, treble outer, treble inner). `orientation.onnx` es una cabeza de clasificacion de imagen completa con 20 clases, una por cada posible rotacion del 20 respecto a la parte superior. Ambos grafos se entrenaron partiendo de los pesos preentrenados `yolo11n.pt` y `yolo11n-cls.pt`, respectivamente, usando la herramienta `tools/inference` del repositorio dartscribe.

El autor no documenta el numero de imagenes, la composicion exacta del dataset, el numero de epocas ni si hubo aumento de datos o tecnicas de ajuste adicionales. Si se indica el preprocesado exigido para que las salidas sean validas: en el detector, la foto debe ir con letterbox a 960x960 y relleno gris de valor 114; en el clasificador, la imagen debe deformarse previamente con la proyeccion calculada por RANSAC a un cuadrado de 512x512 centrado en la diana. Las clases del detector no nombran cada cruce concreto, porque la diana es simetrica: la identificacion de cada cruce surge del ajuste de proyeccion sobre el conjunto completo de detecciones, no de la etiqueta de clase.

## Capacidades

- Deteccion de la diana de dardos y de sus cinco elementos geometricos relevantes (bull, double outer, double inner, treble outer, treble inner) sobre fotografias en color.
- Localizacion de la caja delimitadora de cada elemento detectado, con centro en las filas 0 y 1 y puntuaciones de clase en las filas 4 a 8 de la salida.
- Clasificacion de la orientacion de la diana en 20 clases, que indican cuantos segmentos esta girado el 20 en sentido horario respecto a la vertical.
- Integracion en un pipeline de calibracion automatica: ajuste de una proyeccion con RANSAC a partir de los cruces detectados, deformacion de la diana al cuadrado canonico de 512x512 y consulta al clasificador.
- Inferencia sobre imagenes estaticas; el autor no documenta soporte de video en tiempo real ni procesamiento por lotes.
- No tiene generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, capacidades de agente, capacidades multilingues, modo de razonamiento ni audio.

## Casos de uso

- Marcador automatico de dardos: una camara fija captura la diana, `crossings.onnx` localiza los cruces, RANSAC calcula la proyeccion y `orientation.onnx` fija donde esta el 20; a partir de ahi, cualquier impacto detectado por otro modulo se convierte en puntuacion sin calibrar la camara a mano.
- Calibracion inicial de sistemas de vision en bares o salas de juego: el modelo evita tener que colocar marcas fisicas o ajustar manualmente la homografia cuando se instala una camara nueva.
- Robot lanzador de dardos: el brazo robotico necesita conocer la posicion exacta del centro y la orientacion de la diana para calcular el vector de lanzamiento hacia cada sector.
- Aplicaciones moviles de entrenamiento: el usuario fotografia su diana con el telefono y la app usa los dos grafos ONNX (que pueden ejecutarse en el dispositivo) para reconstruir la geometria y registrar la sesion.
- Retransmision deportiva con superposicion grafica: el modelo permite alinear un overlay de puntuacion en directo sobre la imagen de la diana, ya que la proyeccion calculada mapea pixel a coordenada de sector.
- Analitica deportiva y estadistica: al normalizar cada foto a la misma geometria canonica, se pueden comparar dispersion de impactos y patrones de lanzamiento entre sesiones y jugadores distintos.
- Vision por computador aumentada en dardos: el sistema puede proyectar ayudas visuales (resaltado del sector objetivo, trayectorias, puntuacion acumulada) sobre la imagen real de la diana.
- Anotacion y preetiquetado de datasets de dianas: el detector puede generar cajas candidatas sobre imagenes sin etiquetar para acelerar el trabajo de anotacion humano en futuros conjuntos de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mAP, precision, recall, exactitud de clasificacion, latencia ni curvas de entrenamiento, y el repositorio de HuggingFace no presenta ningun dato de evaluacion.

## Requisitos de hardware

- No hay mediciones publicadas de VRAM, latencia ni throughput.
- Estimacion cualitativa segun el tipo de modelo: al tratarse de dos redes YOLO11n (variante nano), la huella en FP32 para un lote de una imagen a 960x960 y otra a 512x512 se mantiene por debajo de 1 GB de VRAM, aunque esta cifra no esta verificada por el autor.
- Cabe en cualquier GPU de consumo actual (por ejemplo, RTX 3060, RTX 4060 o superior) y previsiblemente tambien en GPU integradas y CPU, dado el tamano reducido de la variante nano, aunque no se aportan medidas.
- Opciones de despliegue compatibles por formato: ONNX Runtime (CPU, CUDA o TensorRT), OpenCV DNN, servidores de inferencia tipo Triton, y el propio ecosistema Ultralytics para reentrenar o reexportar.
- El grafo ONNX no incluye NMS, por lo que el postproceso (supresion de cajas solapadas sobre las 18900 predicciones y decodificacion de las 5 clases) debe implementarse en el lado de la aplicacion y anadira coste de CPU.
- El pipeline completo requiere dos pasadas encadenadas mas el ajuste RANSAC y la deformacion de la imagen; el coste total no es el de un unico modelo.

## Comparativa con modelos similares

No hay datos publicados de parametros, precision ni latencia de dartscribe, por lo que la comparacion cuantitativa no es posible. La tabla recoge la comparacion cualitativa con alternativas de la misma categoria.

| Modelo | Tarea | Arquitectura | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dartscribe `crossings.onnx` | Deteccion de cruces de diana | YOLO11n detect | 960x960 | 5 | AGPL-3.0 | HuggingFace, ONNX |
| dartscribe `orientation.onnx` | Clasificacion de orientacion | YOLO11n classify | 512x512 | 20 | AGPL-3.0 | HuggingFace, ONNX |
| YOLO11n (COCO, Ultralytics) | Deteccion de objetos general | YOLO11n | configurable | 80 (COCO) | AGPL-3.0 | Ultralytics, multiples formatos |
| YOLOv8n (COCO, Ultralytics) | Deteccion de objetos general | YOLOv8n | configurable | 80 (COCO) | AGPL-3.0 | Ultralytics, multiples formatos |

Frente a un YOLO11n generico entrenado en COCO, la ventaja de dartscribe es la especializacion: reconoce geometria de diana y orientacion del 20, algo que un detector de clases COCO no cubre. La contrapartida es que no existe informacion publica sobre su precision y que el modelo esta atado a un preprocesado muy concreto (letterbox de 960x960 con relleno 114 y diana deformada a 512x512).

## Limitaciones y advertencias

- No se publican sesgos, metricas de error ni analisis de falsos positivos; se desconoce el comportamiento del modelo en condiciones adversas.
- Al no haber benchmarks, no se puede estimar la tasa de acierto en la deteccion de cruces ni en la clasificacion de orientacion.
- El detector es sensible al preprocesado: exige fotos con letterbox a 960x960 y relleno gris de valor 114. Cualquier otra normalizacion o resolucion produce salidas no validas.
- El clasificador de orientacion depende de que la imagen se haya deformado previamente con la proyeccion ajustada. Sin esa deformacion, la prediccion de la clase no es interpretable.
- El modelo asume dianas con la geometria estandar de 20 segmentos y los cinco elementos definidos; no cubre dianas de otros formatos, dianas electronicas ni superficies sin los anillos habituales.
- Las clases del detector no identifican un cruce concreto, ya que la diana es simetrica; la asignacion depende del ajuste RANSAC sobre el conjunto de detecciones.
- El ONNX no incorpora NMS: si el integrador no lo implementa, la salida contiene cajas duplicadas.
- El agrupamiento de clases esta limitado a 5 en deteccion y 20 en clasificacion; no hay categorias adicionales como dardos, jugadores o fondo.
- La licencia es AGPL-3.0, una licencia copyleft fuerte: el uso comercial es posible, pero obliga a liberar el codigo fuente de las modificaciones y de los servicios en red que integren el modelo. Conviene revisar las obligaciones antes de incorporarlo a un producto propietario.
- El repositorio tiene 0 descargas y 0 likes, sin historial de mantenimiento ni issues publicos; el soporte del autor no esta garantizado.
- No hay informacion sobre el origen de las imagenes del dataset `geforcefan/dartscribe` (condiciones de luz, camaras, paises, tipos de diana), por lo que no se puede evaluar la representatividad ni posibles sesgos de dominio.
- La fecha de creacion del repositorio (2026-09-29) figura asi en los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/geforcefan/dartscribe
- Dataset de entrenamiento: https://huggingface.co/datasets/geforcefan/dartscribe
- Repositorio del proyecto dartscribe: https://github.com/geforcefan/dartscribe
- Documentacion de Ultralytics (framework de entrenamiento y exportacion): https://docs.ultralytics.com
- No se han encontrado enlaces adicionales relevantes en la busqueda web: los resultados devueltos corresponden a listados genericos de modelos, a Project G-Assist de NVIDIA, a un generador de arte y a recetas de despliegue de modelos de lenguaje, todos ajenos a este modelo.

# nexwayne/fursuit-yolo11m-v2

## Resumen

Fursuit Head Detector (YOLO11m v2) es un modelo de deteccion de objetos entrenado por el usuario nexwayne sobre la arquitectura YOLO11m de Ultralytics, especializado en detectar cabezas de fursuit (trajes de personaje de la comunidad furry) en fotografias y videos. El modelo se enmarca en un pipeline de vision por computador para procesamiento automatizado de contenido.

Su relevancia radica en lo especifico del dominio: los detectores genericos de personas u objetos no identifican fursuits de forma fiable, por lo que un modelo afinado con miles de ejemplos etiquetados manualmente resuelve un problema que los modelos preentrenados estandar no cubren. El autor reporta metricas muy altas (mAP50 cercano al 99,4 %), resultado de un entrenamiento con un conjunto de datos cuidadosamente curado que incluye mas de 75.000 imagenes negativas para reducir falsos positivos.

El modelo se distribuye en Hugging Face en formato de pesos de PyTorch (best.pt) y se utiliza a traves de la libreria ultralytics, lo que hace su despliegue sencillo tanto en GPU como en CPU para inferencia puntual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11m (detector de objetos en una etapa, familia Ultralytics YOLO) |
| Parametros totales | no disponible (YOLO11m tiene ~20,1 millones de parametros como arquitectura base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (se distribuye en FP32/FP16 nativo de PyTorch; exportable a otros formatos con Ultralytics) |
| Idiomas soportados | no aplica (modelo de deteccion de objetos) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt, archivo best.pt) |

## Arquitectura y entrenamiento

El modelo parte de YOLO11m, la variante media de la familia YOLO11 de Ultralytics, un detector de objetos en una sola etapa basado en redes convolucionales con cuello de agregacion de caracteristicas, optimizado para equilibrar precision y velocidad de inferencia. La entrada de imagenes se realiza a resolucion 640x640 pixeles.

El entrenamiento se realizo con PyTorch y aceleracion CUDA sobre una NVIDIA GeForce RTX 5060 Ti de 16 GB de VRAM. El conjunto de datos es personalizado (dataset:custom) y consta de dos componentes: aproximadamente 23.250 imagenes positivas de cabezas de fursuit, etiquetadas y verificadas manualmente, y mas de 75.000 imagenes negativas (fondos, fotografia general, animales y contenido no furry) procedentes de los subconjuntos not-furry y negative-dataset. Esta estrategia de muestreo negativo masivo busca minimizar falsos positivos y garantizar robustez frente a angulos, iluminacion y fondos variados. Las metricas reportadas (mAP50 ≈ 99,4 % y mAP50-95 ≈ 90,8 %) corresponden a la version v2 tras varias iteraciones de afinado.

## Capacidades

- Deteccion de cabezas de fursuit en imagenes estaticas con una sola clase objetivo.
- Deteccion en video (procesando fotogramas individualmente mediante la API de Ultralytics).
- Robustez frente a falsos positivos gracias al entrenamiento con mas de 75.000 imagenes negativas.
- Manejo de condiciones reales variadas: angulos complejos, iluminacion diversa y fondos no controlados.
- Salida estandar de Ultralytics: cajas delimitadoras, puntuaciones de confianza y coordenadas accesibles programaticamente para integracion en pipelines.
- Exportacion a otros formatos de despliegue (ONNX, TensorRT, CoreML, etc.) mediante las herramientas nativas de Ultralytics.

No soporta capacidades de lenguaje, tool calling ni razonamiento: es un modelo puramente de vision por computador.

## Casos de uso

- Moderacion automatizada de contenido en plataformas con imagenes subidas por usuarios: el detector puede identificar fursuits en lotes de fotos para enrutarlas a colas de moderacion especificas o aplicar politicas de contenido de la comunidad furry.
- Organizacion de bibliotecas fotograficas de convenciones: los fotografos de eventos furry pueden etiquetar y clasificar automaticamente miles de fotos detectando en que imagenes aparece una cabeza de fursuit, ahorrando horas de revision manual.
- Estadisticas de presencia en eventos: analisis de series de imagenes o video de convenciones para estimar cuantos fursuiters aparecen en cada zona o franja horaria.
- Filtrado previo en pipelines de generacion o edicion de imagenes: detectar la region de la cabeza de fursuit como paso previo a recortes, difuminados o aplicacion de efectos selectivos.
- Vigilancia de redes y agregadores de contenido: deteccion masiva en rastros de imagenes para indexar o categorizar contenido relacionado con la comunidad furry.
- Investigacion en vision por computador de dominio especifico: caso de estudio real de como un muestreo negativo masivo reduce falsos positivos en detectores de nicho, util como referencia para detectores de clases poco comunes.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| mAP50 | ≈ 99,4 % |
| mAP50-95 | ≈ 90,8 % |

No se han publicado comparaciones con otros modelos ni resultados en benchmarks estandar (COCO, etc.) en la informacion disponible. Las metricas corresponden al conjunto de evaluacion propio del autor, por lo que no son directamente comparables con benchmarks publicos.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 1-2 GB en FP32/FP16 para YOLO11m a 640x640; la inferencia en CPU tambien es viable con latencias mayores.
- GPU de entrenamiento usada por el autor: NVIDIA GeForce RTX 5060 Ti con 16 GB de VRAM (suficiente para afinar esta arquitectura).
- Consumer GPUs: cualquier GPU moderna con 4 GB o mas de VRAM (RTX 3060, RTX 4060 o superiores) ejecuta la inferencia con holgura; tambien funciona sin GPU.
- Opciones de despliegue: libreria ultralytics (nativa), huggingface_hub para descargar los pesos, y exportacion a ONNX, TensorRT u OpenVINO para produccion. No requiere vLLM, llama.cpp ni Ollama al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; como referencia, YOLO11m suele alcanzar decenas de FPS en GPUs de gama media a 640x640.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nexwayne/fursuit-yolo11m-v2 | YOLO11m | Deteccion de cabezas de fursuit | Especifico (fursuits) | Apache 2.0 | Hugging Face |
| YOLO11m preentrenado (Ultralytics) | YOLO11m | Deteccion generica (COCO, 80 clases) | Generalista | AGPL-3.0 (Ultralytics) | Repositorio Ultralytics |
| YOLOv8m preentrenado (Ultralytics) | YOLOv8m | Deteccion generica (COCO) | Generalista | AGPL-3.0 (Ultralytics) | Repositorio Ultralytics |

Nota: ninguno de los modelos generalistas detecta fursuits de forma nativa; la ventaja de esta ficha es el afinado de dominio. Ademas, la licencia Apache 2.0 del modelo afinado es mas permisiva que la AGPL-3.0 de los pesos oficiales de Ultralytics, aunque el codigo de la libreria ultralytics sigue estando bajo sus propios terminos.

## Limitaciones y advertencias

- Modelo de una sola clase: solo detecta cabezas de fursuit; no clasifica especies, personajes ni otras partes del traje.
- Las metricas reportadas proceden del conjunto de evaluacion del autor y no han sido verificadas de forma independiente; el rendimiento en dominios muy distintos (baja luz, oclusiones extremas, fursuits de estilos no presentes en el dataset) puede degradarse.
- Riesgo residual de falsos positivos con objetos visualmente similares (mascaras, cabezas de animales de peluche, cosplay) y de falsos negativos con fursuits atipicos, pese al muestreo negativo masivo.
- Los pesos heredan la licencia de la base: el modelo se publica bajo Apache 2.0, pero la libreria ultralytics se distribuye bajo AGPL-3.0, lo que puede imponer obligaciones de codigo fuente en algunos escenarios de uso comercial; conviene revisar los terminos antes de desplegar en producto cerrado.
- Proyecto de autor individual con muy poca traccion publica (39 descargas y 1 like en el momento de la ficha), sin model card con detalles de versiones, division train/val ni procedimiento de evaluacion completo.
- No hay informacion sobre sesgos demograficos o de contenido; al tratarse de deteccion de un tipo de vestuario, el riesgo de sesgo es bajo, pero la composicion exacta del dataset por estilos de fursuit no esta documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nexwayne/fursuit-yolo11m-v2
- Libreria Ultralytics: https://github.com/ultralytics/ultralytics
- Documentacion de YOLO11: https://docs.ultralytics.com/models/yolo11/
- Paper, demo y repositorio de entrenamiento: no disponibles

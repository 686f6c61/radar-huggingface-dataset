# georgeven/songmae-large-32x1-bird-detector

## Resumen

SongMAE-Large 32x1 bird detector es un modelo de deteccion de eventos sonoros (sound event detection) especializado en vocalizaciones de aves, publicado por el usuario georgeven en Hugging Face. Se trata de un ajuste fino del encoder SongMAE-Large 32x1, un transformer de tipo MAE-ViT (Masked Autoencoder Vision Transformer) que opera sobre espectrogramas mel, al que se le anade una cabeza lineal. El modelo predice, para cada trama temporal de 5 ms y cada una de las 128 bandas mel entre 20 y 16.000 Hz, la probabilidad de que esa celda tiempo-frecuencia pertenezca a una vocalizacion de ave.

Su relevancia radica en dos aspectos. Primero, ofrece localizacion tiempo-frecuencia de grano fino, algo que los encoders bioacusticos heredados de modelos de habla no resuelven porque trabajan a resoluciones temporales demasiado gruesas. Segundo, el detector se entreno sin etiquetas humanas: las anotaciones proceden de destilacion desde un modelo vision-lenguaje que dibuja cajas sobre espectrogramas, lo que abarata radicalmente la creacion de datos de entrenamiento en bioacustica.

El modelo tiene 96.493.856 parametros (~96,5 M) y se distribuye bajo licencia MIT con pesos en safetensors. Publica tres checkpoints (semillas 0, 1 y 2), cada uno con su propio umbral de probabilidad calibrado, lo que permite estimar variabilidad entre ejecuciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MAE-ViT (Masked Autoencoder Vision Transformer) sobre espectrogramas mel, con cabeza lineal de deteccion |
| Parametros totales | 96.493.856 (96,5 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; ventana de analisis de tramas de 5 ms sobre 128 bandas mel (20-16.000 Hz) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors (sin variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |
| Tarea | Deteccion de eventos sonoros / segmentacion tiempo-frecuencia |
| Modelo base | georgeven/songmae-large-32x1 |
| Checkpoints publicados | 3 (semillas 0, 1 y 2), con umbral calibrado por semilla |
| Tamano del repositorio | 1,2 GB |
| Entrada | Audio mono a 32 kHz |
| Salida | Matriz de probabilidad de 128 bins mel x tramas de 5 ms; regiones detectadas en CSV (.npz + .csv) |

## Arquitectura y entrenamiento

La arquitectura es un MAE-ViT que trabaja sobre espectrogramas mel y que fue preentrenado con reconstruccion enmascarada de espectrogramas sobre grabaciones bioacusticas diversas, segun la descripcion del encoder SongMAE. El detector reutiliza ese encoder congelado o parcialmente ajustado y anade una cabeza lineal que produce una probabilidad por celda tiempo-frecuencia. Segun el autor del encoder, SongMAE opera con resolucion temporal de 2 ms; la variante empleada aqui (32x1) se usa con tramas de 5 ms en el detector.

El aspecto mas singular es el proceso de etiquetado. No se usaron anotaciones humanas. Un modelo vision-lenguaje maestro, descrito en la model card como Qwen3.8-27B en cuantizacion Q8_0 sobre llama.cpp, dibujo cajas delimitadoras sobre espectrogramas viridis de 5 segundos procedentes de grabaciones de Xeno-Canto (subconjunto BirdSet XCL), usando ejes de coordenadas, razonamiento en cadena de pensamiento y una pasada numerada de autorrevision. Esas cajas automaticas constituyen las etiquetas de entrenamiento del detector. El pipeline completo se describe en el repositorio birdsong-detect-distill. No se especifican en la informacion disponible el numero de tokens o de horas de audio empleadas, ni si hubo fases de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Deteccion de vocalizaciones de aves a nivel de celda tiempo-frecuencia: genera una probabilidad para cada trama de 5 ms y cada una de las 128 bandas mel (20-16.000 Hz).
- Localizacion en dos ejes: delimita inicio y fin temporal y banda de frecuencia inferior y superior de cada region detectada.
- Segmentacion por umbral: la mascara binaria se obtiene aplicando un umbral calibrado por semilla.
- Extraccion de regiones a CSV: salida con `start_s`, `end_s`, `low_hz`, `high_hz` y `peak_probability` por evento.
- Ejecucion en CPU o CUDA: el script `detect.py` admite `--device cuda` o `--device cpu`.
- Reproducibilidad entre semillas: tres checkpoints independientes permiten medir la dispersion de las detecciones.
- No soporta generacion de texto, razonamiento linguistico, codigo, matematicas, vision de imagenes naturales, tool calling ni uso como agente. No es un modelo de lenguaje.

## Casos de uso

- Monitorizacion ecologica automatizada: procesar largas grabaciones de campo (horas o dias) para obtener un censo de actividad vocal, con marcas temporales y de frecuencia que permiten calcular indices de actividad por franja horaria.
- Anotacion previa a clasificacion de especie: usar las regiones detectadas como recortes de entrada para un clasificador de especie o para un encoder como el propio SongMAE-Large, reduciendo el ruido de fondo y el coste de anotacion manual.
- Curacion de datasets bioacusticos: filtrar grandes volumenes de audio procedente de Xeno-Canto o de repositorios propios para descartar grabaciones sin vocalizaciones o para localizar segmentos utiles antes de etiquetar.
- Analisis de estructura de canto: al trabajar con tramas de 5 ms y 128 bandas mel, permite estudiar silabas y estructura fina del canto, no solo la presencia o ausencia de una vocalizacion.
- Despliegue en estaciones de grabacion remotas: con menos de 100 M de parametros y ejecucion en CPU, puede integrarse en un dispositivo con recursos limitados para prefiltrar audio in situ y transmitir solo los eventos detectados.
- Estudios de impacto ambiental: deteccion de actividad vocal en entornos afectados por infraestructuras (parques eolicos, carreteras) para comparar patrones antes y despues de una intervencion.
- Ciencia ciudadana: procesar lotes de grabaciones enviadas por voluntarios y devolver automaticamente las regiones con vocalizaciones, agilizando la validacion posterior.
- Investigacion en destilacion desde modelos multimodales: el propio pipeline (etiquetado por VLM, entrenamiento sin etiquetas humanas) puede reutilizarse como linea base metodologica en otros dominios acusticos.

## Benchmarks y rendimiento

Resultados de localizacion en conjuntos de test retenidos, tabla 2 del articulo segun la model card. En WABAD y Hawaii se mide localizacion tiempo-frecuencia a nivel de pixel (AP e IoU); en XC-AJ y NIPS4Bplus, localizacion de inicio y fin a nivel de trama. Los modelos entrenados con etiquetas del maestro son medias sobre tres semillas.

| Modelo | WABAD AP | WABAD IoU | Hawaii AP | Hawaii IoU | XC-AJ AP | XC-AJ IoU | NIPS4Bplus AP | NIPS4Bplus IoU |
|---|---|---|---|---|---|---|---|---|
| BirdCODE | no disponible | no disponible | no disponible | no disponible | 0,836 | 0,526 | 0,657 | 0,545 |
| YOLO11n (etiquetas humanas) | 0,552 | 0,347 | 0,541 | 0,369 | 0,700 | 0,546 | 0,630 | 0,455 |
| YOLO11l (etiquetas humanas) | 0,549 | 0,354 | 0,546 | 0,381 | 0,676 | 0,556 | 0,590 | 0,464 |
| YOLO11n (etiquetas del maestro) | 0,566 | 0,348 | 0,619 | 0,412 | 0,769 | 0,512 | 0,749 | 0,468 |
| YOLO11l (etiquetas del maestro) | 0,568 | 0,359 | 0,604 | 0,400 | 0,774 | 0,518 | 0,748 | 0,532 |
| SongMAE-Large (etiquetas del maestro) | 0,633 | 0,385 | 0,716 | 0,479 | 0,836 | 0,529 | 0,777 | 0,488 |

Datos adicionales sobre el encoder base SongMAE-Large, no sobre el detector, recogidos en la busqueda web: bajo el protocolo de evaluacion AVEX en el benchmark BEANS a nivel de clip, SongMAE-Large alcanza 0,781 de exactitud de clasificacion, por delante de BEATs (0,774) y de Bird-MAE-Huge, de 630 M de parametros (0,766), con un mAP de deteccion de 0,389 para la variante de 20 ms. Estos valores corresponden al encoder preentrenado, no al detector ajustado objeto de esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32 los pesos ocupan aproximadamente 386 MB (96,5 M de parametros x 4 bytes); en float16, unos 193 MB. Hay que anadir el coste de las activaciones y de los espectrogramas de entrada, que para audios de minutos es modesto pero crece con la duracion procesada.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.). No se requiere A100 ni H100. El modelo cabe tambien en GPUs integradas y en CPU.
- Ejecucion en hardware de consumo: si, con margen amplio. Incluso en CPU es viable, ya que el script admite `--device cpu`.
- Opciones de despliegue: el repositorio proporciona un script `detect.py` con interfaz de linea de comandos y una API de Python (`load`, `probabilities`, `regions`). Dependencias: PyTorch, transformers (>=4.36,<5), librosa, scipy, safetensors y huggingface_hub. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no son aplicables a este tipo de modelo. No se menciona exportacion a ONNX, TensorRT ni Core ML.
- Latencia y throughput estimados: no disponible. No se publican mediciones de velocidad en la informacion proporcionada.
- Almacenamiento: el repositorio ocupa 1,2 GB, presumiblemente porque incluye los tres checkpoints.

## Comparativa con modelos similares

La comparacion se establece con los modelos empleados como referencia en la propia evaluacion del autor. BirdCODE aparece con resultados en XC-AJ y NIPS4Bplus, pero sin datos en WABAD ni Hawaii.

| Modelo | Parametros | Enfoque | WABAD AP | Hawaii AP | XC-AJ AP | NIPS4Bplus AP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| SongMAE-Large 32x1 bird detector | 96,5 M | MAE-ViT sobre espectrogramas mel + cabeza lineal, etiquetas destiladas de un VLM | 0,633 | 0,716 | 0,836 | 0,777 | MIT | Hugging Face (este repositorio) |
| YOLO11l (etiquetas humanas) | no disponible | Deteccion de objetos sobre espectrogramas | 0,549 | 0,546 | 0,676 | 0,590 | no disponible | Ultralytics, no especifica el autor |
| YOLO11n (etiquetas del maestro) | no disponible | Deteccion de objetos sobre espectrogramas | 0,566 | 0,619 | 0,769 | 0,749 | no disponible | Ultralytics, reentrenado por el autor |
| BirdCODE | no disponible | no disponible | no disponible | no disponible | 0,836 | 0,657 | no disponible | no disponible |
| Bird-MAE-Huge | 630 M | Encoder bioacustico auto-supervisado (referencia de clasificacion) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

En clasificacion a nivel de clip, el encoder SongMAE-Large supera a BEATs y a Bird-MAE-Huge segun la busqueda web, aunque con una ventaja estrecha (0,781 frente a 0,774 y 0,766). Conviene subrayar que esos numeros corresponden al encoder, no al detector.

## Limitaciones y advertencias

- Dominio de entrenamiento restringido: las etiquetas del maestro se generaron sobre grabaciones de Xeno-Canto (BirdSet XCL). El rendimiento puede degradarse en grabaciones con caracteristicas acusticas distintas (sensores, entornos urbanos, especies ausentes del corpus).
- Sin etiquetas humanas: toda la supervision procede de un modelo vision-lenguaje. Los errores sistematicos del maestro (cajas mal delimitadas, falsos positivos en ruido, sesgo hacia cantos claros) se propagan al detector y no estan acotados por una verificacion humana publicada.
- Umbral dependiente de la semilla: cada checkpoint tiene su propio umbral calibrado, por lo que usar un umbral fijo entre semillas sesga la mascara binaria. Hay que respetar la calibracion o recalibrar.
- IoU moderada: los valores de IoU son notablemente inferiores a los de AP en todos los conjuntos (por ejemplo 0,488 de IoU frente a 0,777 de AP en NIPS4Bplus). La delimitacion exacta de los bordes de cada vocalizacion es menos fiable que la deteccion de su presencia.
- Deteccion, no identificacion de especie: el modelo indica donde hay vocalizacion, no de que especie se trata. Para clasificacion hace falta un modelo adicional.
- Dependencia de librerias: la model card fija `transformers>=4.36,<5`; versiones posteriores pueden romper la carga del modelo.
- Licencia del modelo frente a licencia de los datos: los pesos son MIT, pero las grabaciones de Xeno-Canto y la imagen de ejemplo estan sujetas a licencias propias (la imagen de ejemplo se distribuye bajo CC BY-NC-SA 4.0). El uso comercial del modelo no exime de respetar las licencias de los audios empleados.
- Ausencia de datos de rendimiento en produccion: no se publican latencias, throughput ni consumo energetico, lo que dificulta dimensionar un despliegue sin pruebas propias.
- Cobertura de idiomas y capacidades de texto: no aplica; el modelo solo procesa audio.
- Advertencia sobre componentes de terceros citados: la model card menciona un maestro "Qwen3.8-27B" en formato Q8_0 sobre llama.cpp. No se dispone de mas detalles sobre esa configuracion ni sobre su reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/georgeven/songmae-large-32x1-bird-detector
- Modelo base (encoder): https://huggingface.co/georgeven/songmae-large-32x1
- Coleccion SongMAE: https://huggingface.co/collections/georgeven/songmae-a-bioacoustic-encoder-for-birdsong
- Busqueda de modelos con la etiqueta songmae: https://huggingface.co/models?other=songmae
- Codigo del pipeline de destilacion y deteccion: https://github.com/georgevenven/birdsong-detect-distill
- Articulo SongMAE (OpenReview): https://openreview.net/pdf?id=MpqPwI6BRs
- Articulo sobre descubrimiento de silabas con MAE asimetrico (OpenReview): https://openreview.net/pdf?id=8mluzLyvyV
- Ficha del modelo en bio.rodeo: https://bio.rodeo/models/songmae
- Grabacion de ejemplo (Black Wheatear, XC839867): https://xeno-canto.org/839867

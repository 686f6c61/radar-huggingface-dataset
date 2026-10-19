# joshuashobin/TTNet-TableTennis

## Resumen

TTNet-TableTennis es un conjunto de checkpoints de PyTorch para TTNet, una red convolucional multitarea presentada en CVPR 2020 cuyo objetivo es la deteccion y el seguimiento de la pelota en retransmisiones de tenis de mesa. No es un modelo de lenguaje: no genera texto ni admite instrucciones, sino que recibe ventanas de 9 fotogramas de video y devuelve coordenadas de la pelota, una mascara de segmentacion de la mesa y eventos de bote y de contacto con la red. Este repositorio en concreto lo publica el usuario joshuashobin como un *fine-tuning* sobre el dataset OpenTTGames, partiendo de la implementacion de referencia de maudzung.

El interes practico del artefacto esta en que incluye seis checkpoints, organizados en tres fases de entrenamiento y en dos variantes temporales: una pensada para video a 120 fps (stride=1) y otra para 30 fps (stride=4). El autor documenta de forma inusualmente honesta los resultados de validacion por fase y, sobre todo, el fallo por *domain shift* al aplicar los pesos a metraje grabado a mano en un pabellon luminoso, lo que convierte el repositorio en una referencia util tanto para reutilizar los pesos como para entender sus limites reales.

La relevancia actual es limitada pero concreta: sirve como linea base reproducible de un sistema de analisis de tenis de mesa, como fuente de pseudo-etiquetas de trayectoria y como ejemplo documentado de por que un modelo entrenado en una unica condicion de camara e iluminacion no generaliza. El propio autor indica que acabo migrando a TrackNetV3 para cubrir escenarios de captura heterogeneos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN multitarea TTNet (CVPR 2020): etapa global y etapa local con capas convolucionales y fully connected, mas cabezas de segmentacion y de deteccion de eventos |
| Parametros totales | no disponible (la model card no publica el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: ventana de 9 fotogramas consecutivos apilados (9 x 3 = 27 canales de entrada) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints `.pth` en punto flotante; no se documenta cuantizacion) |
| Idiomas soportados | no aplica (modelo de vision); la metadata declara `ja` y la model card esta redactada en japones |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoints de PyTorch, 6 ficheros) |
| Resolucion de entrada (etapa global) | 320 x 128 px, 27 canales (9 fotogramas) |
| Resolucion del video de origen | 1920 x 1080 px (usada en el calculo de coordenadas finales) |
| Dataset de entrenamiento | OpenTTGames: game_1 a game_4 para entrenamiento (~46.000 fotogramas) y game_5 para validacion (~7.300 fotogramas) |
| Entorno de entrenamiento | PyTorch 2.4.0 con CUDA 12.1, GPU RTX 4070 Ti Super de 16 GB |
| Tamano del repositorio | 0,8 GB |
| Descargas / likes | 0 / 0 |

Relacion de checkpoints incluidos:

| Fichero | Descripcion |
|---|---|
| `ttnet_1st_phase_best.pth` | stride=1 (120 fps), fase 1, mejor epoca 17 de 30 |
| `ttnet_2nd_phase_best.pth` | stride=1, fase 2, mejor epoca 3 de 30 |
| `ttnet_3rd_phase_best.pth` | stride=1, fase 3, mejor epoca 3 de 30; recomendado para inferencia a 120 fps |
| `ttnet_30fps_1st_phase_best.pth` | stride=4 (30 fps), fase 1, mejor epoca 12 de 30 |
| `ttnet_30fps_2nd_phase_best.pth` | stride=4, fase 2, mejor epoca 7 de 30 |
| `ttnet_30fps_3rd_phase_best.pth` | stride=4, fase 3, mejor epoca 1 de 30; recomendado para inferencia a 30 fps |

## Arquitectura y entrenamiento

TTNet se organiza en dos etapas en cascada. La etapa global recibe un apilado de 9 fotogramas reescalados a 320 x 128 (27 canales) y lo procesa con seis capas convolucionales seguidas de tres capas fully connected, que producen una distribucion gaussiana 1D de 448 dimensiones sobre la posicion de la pelota; el `argmax` de esa distribucion da una estimacion gruesa en coordenadas de la imagen reducida (eje X sobre 320 px, eje Y sobre 128 px). La etapa local recorta la imagen original alrededor de esa posicion estimada y la vuelve a pasar por la misma red para obtener una coordenada fina. La posicion final se recompone con `bx = x_global * (1920/320) + x_local - 160` y `by = y_global * (1080/128) + y_local - 64`.

Sobre las caracteristicas intermedias de la etapa global se decodifican en paralelo dos tareas auxiliares: la segmentacion de la mesa y la deteccion de eventos (botes y contactos con la red). El entrenamiento se hace en tres fases secuenciales: la fase 1 entrena deteccion global y segmentacion, la fase 2 entrena deteccion local y deteccion de eventos, y la fase 3 hace *fine-tuning* conjunto de todas las tareas. La variante a 30 fps no modifica la estructura de la red (sigue usando 9 fotogramas y 27 canales); solo cambia el muestreo del dataset a stride=4, de modo que la ventana de 9 fotogramas cubre una horquilla temporal distinta. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo por otra parte ajeno al dominio.

## Capacidades

- Deteccion de la pelota de tenis de mesa fotograma a fotograma, con localizacion gruesa y refinamiento local en dos etapas.
- Seguimiento temporal: la entrada de 9 fotogramas apilados aporta informacion de movimiento, lo que permite mantener la trayectoria en fotogramas con oclusion o desenfoque de movimiento.
- Segmentacion de la mesa de tenis de mesa a partir de las caracteristicas intermedias de la etapa global.
- Deteccion de eventos: botes de la pelota en la mesa y contactos con la red.
- Salida de trayectoria en coordenadas de la imagen original a 1920 x 1080, reutilizable para calcular velocidades, longitudes y patrones de juego.
- Dos regimenes temporales soportados de forma explicita: video a 120 fps (stride=1) y video a 30 fps (stride=4), con checkpoints independientes para cada uno.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente perceptivo y mono-tarea a nivel de API.

## Casos de uso

- Analisis de retransmisiones oficiales con camara fija y elevada: el caso de uso original del modelo. Con metraje del estilo de OpenTTGames (pabellon oscuro, 120 fps, plano fijo) el checkpoint `ttnet_3rd_phase_best.pth` proporciona la trayectoria de la pelota y permite calcular estadisticas de punto.
- Generacion de pseudo-etiquetas de trayectoria: usar el modelo para anotar automaticamente grandes volumenes de video y filtrar despues, reduciendo el coste de anotacion manual de datasets de seguimiento de pelota.
- Deteccion automatica de botes y contactos con la red para enriquecer estadisticas de partido (duracion de intercambios, distribucion de botes por zona de la mesa), gracias a las cabezas de *event spotting*.
- Segmentacion de la mesa como paso de calibracion: la mascara predicha puede alimentar un algoritmo de homografia para proyectar la trayectoria en coordenadas de la mesa y analizar zonas de impacto.
- Linea base academica para reproducir y comparar el paper de CVPR 2020 frente a propuestas posteriores del mismo linaje (TrackNetV2, TrackNetV3) bajo un protocolo de validacion identico.
- Estudio de robustez y *domain shift*: el repositorio documenta el fallo sistematico en video de 30 fps con camara en mano, lo que lo convierte en material util para investigar tecnicas de adaptacion de dominio o aumentado de datos.
- Prototipado de sistemas de arbitraje asistido o revision de jugadas en entornos controlados, siempre que la captura se realice con camara fija y condiciones de iluminacion similares a las del entrenamiento.
- Docencia: ejemplo compacto y bien documentado de arquitectura en cascada con multiples cabezas y entrenamiento por fases, entrenable en una GPU de consumo de 16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los benchmarks habituales de modelos de lenguaje (MMLU, HumanEval, GSM8K) no aplican a este modelo. El autor unicamente reporta perdidas de validacion sobre game_5 de OpenTTGames:

| Regimen | Fase | Tarea | Mejor val loss | Mejor epoca |
|---|---|---|---|---|
| stride=1 (120 fps) | Fase 1 | Deteccion global + segmentacion | 0,1804 | 17 / 30 |
| stride=1 (120 fps) | Fase 2 | Deteccion local + eventos | 0,1252 | 3 / 30 |
| stride=1 (120 fps) | Fase 3 | Fine-tuning conjunto | 0,2865 | 3 / 30 |
| stride=4 (30 fps) | Fase 1 | Deteccion global + segmentacion | 0,2664 | 12 / 30 |
| stride=4 (30 fps) | Fase 2 | Deteccion local + eventos | 0,0961 | 7 / 30 |
| stride=4 (30 fps) | Fase 3 | Fine-tuning conjunto | 0,3456 | 1 / 30 |

No se reportan metricas de precision de localizacion (error en pixeles), F1 de deteccion ni mAP, por lo que no es posible cuantificar la calidad de la trayectoria a partir de la informacion disponible.

## Requisitos de hardware

- Entrenamiento: el autor lo ejecuto en una unica NVIDIA GeForce RTX 4070 Ti Super de 16 GB, con PyTorch 2.4.0 y CUDA 12.1.
- VRAM de inferencia: no disponible como cifra oficial. La entrada de la etapa global es un tensor de 9 x 3 x 128 x 320 y la red es un apilado convolucional compacto con tres capas fully connected finales, por lo que la huella es muy inferior a la de entrenamiento y cabe holgadamente en GPU de consumo; no se publica una medicion.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA. Para reproducir el entrenamiento, 16 GB de VRAM (RTX 4080, RTX 4090, A100, H100). Para inferencia, tarjetas de gama media son suficientes en la practica, aunque no hay cifras publicadas.
- Despliegue: los scripts de inferencia del repositorio original (`run_ball_trajectory.py`) con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. La exportacion a ONNX o TensorRT es tecnicamente viable al ser una CNN estandar, pero no esta documentada en el repositorio.
- Latencia y throughput: no disponibles. La carga practica depende mas del coste de decodificar y reescalar el video (dataset de imagenes extraidas de aproximadamente 39 GB para cada variante de stride) que del paso por la red.
- Almacenamiento: el repositorio ocupa 0,8 GB; el pipeline de preparacion de dataset descrito por el autor genera alrededor de 39 GB de fotogramas por cada variante de stride.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TTNet (este repositorio) | no disponible | 9 fotogramas apilados a 320 x 128; dos variantes, 120 fps y 30 fps | val loss 0,2865 (stride=1) y 0,3456 (stride=4) en fase 3 | MIT | pesos en Hugging Face, codigo en GitHub |
| TrackNetV3 | no disponible | no disponible | no disponible | no disponible | mencionado por el autor como alternativa a la que migro por su mejor tolerancia al cambio de dominio |
| TrackNetV2 | no disponible | no disponible | no disponible | no disponible | no disponible; pertenece al mismo linaje de implementaciones que el repositorio base |

La comparacion cuantitativa no es posible con la informacion disponible: no se publican parametros, metricas ni condiciones de entrenamiento de las alternativas. Cualquier comparacion deberia hacerse reproduciendo la evaluacion sobre el mismo split de OpenTTGames.

## Limitaciones y advertencias

- *Domain shift* severo y documentado por el propio autor: los pesos se entrenaron con video de competicion, iluminacion oscura, camara fija cenital y 120 fps. Aplicados a video de pabellon luminoso, camara en mano y 30 fps, la salida colapso a un valor fijo (`x=-160`, `y=543`) en todos los fotogramas, es decir, fallo total de deteccion incluso con la variante stride=4.
- La validacion solo se realizo sobre game_5 del propio dataset OpenTTGames; no hay evaluacion en dominios externos. El autor confirma que en ese split oficial la deteccion es correcta, lo que refuerza que el problema es de generalizacion y no de ajuste.
- Entrenamiento y validacion proceden de la misma competicion y configuracion de captura, por lo que las perdidas reportadas sobreestiman el rendimiento esperable en produccion.
- No se publican metricas de error en pixeles ni de precision/recall, solo perdidas de validacion, lo que dificulta fijar umbrales de aceptacion.
- Dependencia de la resolucion: el calculo de coordenadas finales asume video de 1920 x 1080; otras resoluciones requieren reescalar y ajustar la formula.
- Dependencia de la cadencia: es necesario elegir el checkpoint correcto (stride=1 o stride=4) segun los fps del metraje; usar el equivocado degrada la ventana temporal que ve la red.
- Ambiguedad de nombre: existe otro modelo tambien llamado TTNet (arXiv 2610.07823), un modelo multitarea sobre datos de sensores de seis ejes de palas inteligentes para predecir genero, mano dominante, anos de experiencia y nivel de juego. No guarda ninguna relacion con este repositorio y no debe confundirse con el.
- Licencia MIT, permisiva para uso comercial, pero sin garantias; al tratarse de un *fine-tuning* de pesos derivados del repositorio de maudzung, conviene verificar la cadena de licencias del trabajo original y del dataset OpenTTGames antes de un despliegue comercial.
- Uso responsable: cualquier aplicacion de arbitraje o analisis de jugadores debe contemplar supervision humana; el modelo no detecta la pelota de forma fiable fuera de su dominio de entrenamiento.
- Metadatos pobres: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado en Hugging Face y sin model card en castellano ni en ingles, lo que reduce la trazabilidad y el soporte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/joshuashobin/TTNet-TableTennis
- Espejo del mismo modelo en Hugging Face (Hruno): https://huggingface.co/Hruno/TTNet-TableTennis/tree/main
- Codigo de referencia (maudzung, TTNet en PyTorch): https://github.com/maudzung/TTNet-Real-time-Analysis-System-for-Table-Tennis-Pytorch
- Dataset OpenTTGames: https://lab.osai.ai/datasets/openttgames/
- Modelo homonimo sin relacion (TTNet sobre sensores de pala inteligente), arXiv: https://arxiv.org/abs/2610.07823
- PDF del modelo homonimo: https://arxiv.org/pdf/2610.07823v1
- Resena del modelo homonimo: https://arxiv.deeppaper.ai/papers/2610.07823v1
- Otra resena del modelo homonimo: https://www.aimodels.fyi/papers/arxiv/ttnet-multi-task-deep-learning-table-tennis

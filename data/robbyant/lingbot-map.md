# robbyant/lingbot-map

## Resumen

LingBot-Map es un modelo fundacional de reconstruccion 3D en streaming desarrollado por el Robbyant Team. Se presenta como un modelo *feed-forward* que, a partir de una secuencia de imagenes, reconstruye geometria 3D y estima la trayectoria de la camara de forma continua, sin necesidad de ejecutar un bucle de optimizacion iterativa por fotograma. Su propuesta central es el *Geometric Context Transformer* (GCT), una arquitectura que unifica el anclaje de coordenadas, las senales geometricas densas y la correccion de deriva de largo alcance dentro de un unico marco de streaming.

El modelo esta disenado para secuencias largas: segun la model card, mantiene inferencia estable a unos 20 FPS a resolucion 518x378 sobre secuencias que superan los 10.000 fotogramas, gracias a una atencion con *paged KV cache* y a un backend FlashInfer. El repositorio ocupa 33,0 GB e incluye pesos en formato ONNX, scripts de demo y un pipeline de renderizado offline. La licencia declarada es Apache-2.0.

Es relevante ahora porque ataca un cuello de botella clasico en reconstruccion 3D: los enfoques de optimizacion iterativa (tipo SLAM denso) son precisos pero dificiles de escalar en tiempo real, mientras que los enfoques puramente feed-forward suelen acumular deriva en secuencias largas. LingBot-Map intenta cubrir ambos frentes combinando velocidad de streaming con memoria de trayectoria para corregir la deriva. No se dispone de informacion publica sobre el numero de parametros ni sobre la composicion del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Geometric Context Transformer (GCT); modelo feed-forward de streaming con atencion de paged KV cache |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (se reporta procesamiento de secuencias de mas de 10.000 fotogramas y ventana de referencia de pose) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision 3D; no aplica idioma en el sentido de NLP) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (segun la etiqueta del repositorio); otros formatos no disponibles |

## Arquitectura y entrenamiento

La arquitectura se describe como un *Geometric Context Transformer* orientado a streaming. Integra tres mecanismos principales: *anchor context* (anclaje de coordenadas), *pose-reference window* (ventana de referencia de pose) y *trajectory memory* (memoria de trayectoria). El objetivo es mantener la coherencia geometrica entre fotogramas y corregir la deriva acumulada en secuencias largas sin recurrir a optimizacion iterativa. La inferencia se apoya en atencion con *paged KV cache* (backend FlashInfer recomendado, con backend SDPA como alternativa) para poder procesar flujos de video extensos con memoria acotada.

El modelo es feed-forward, es decir, produce la reconstruccion y la pose en una pasada, lo que le permite alcanzar aproximadamente 20 FPS a 518x378 sobre secuencias de mas de 10.000 fotogramas. La model card menciona un modo de inferencia por ventanas (*windowed inference*) para secuencias superiores a 3.000 fotogramas e incluye un pipeline de renderizado offline para videos muy largos (hay un ejemplo de unos 25.000 fotogramas, unos 13 minutos de recorrido interior). No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO (propias, por otro lado, de modelos de lenguaje y no de un modelo geometrico de este tipo). Tampoco se detallan innovaciones de decodificacion especulativa ni de atencion lineal.

## Capacidades

- Reconstruccion 3D densa en streaming a partir de secuencias de imagenes.
- Estimacion de pose de camara y seguimiento de trayectoria a lo largo de la secuencia.
- Correccion de deriva de largo alcance mediante memoria de trayectoria.
- Inferencia feed-forward con atencion de paged KV cache, orientada a tiempo real (unos 20 FPS a 518x378).
- Procesamiento de secuencias muy largas: se reportan ejemplos de mas de 10.000 fotogramas y de aproximadamente 25.000 fotogramas en el caso de demostracion largo.
- Inferencia por ventanas para secuencias superiores a 3.000 fotogramas.
- Soporte de intervalo entre fotogramas clave (*keyframe interval*) en el streaming.
- Enmascarado de cielo (*sky masking*) como opcion de preprocesado.
- Pipeline de renderizado offline por lotes para generar reconstrucciones de video largas.
- Escenarios cubiertos en las demos: interiores, exteriores, aereos y escenas de LingBot-World.

## Casos de uso

- SLAM y odometria visual: el modelo puede sustituir o complementar el front-end de un sistema de localizacion y mapeo, estimando pose y geometria de forma feed-forward, lo que reduce la latencia frente a la optimizacion iterativa clasica.
- Robotica movil: un robot que recorre un edificio durante minutos puede usar el modelo para reconstruir su entorno y localizarse, apoyandose en la memoria de trayectoria para limitar la deriva en recorridos largos.
- Realidad aumentada y realidad virtual: la estimacion de pose por fotograma a unos 20 FPS permite anclar contenido virtual sobre el entorno capturado por la camara del dispositivo en escenas de interior.
- Mapeo aereo con drones: el caso de demostracion aereo sugiere su uso para reconstruir terreno y trayectorias de vuelo a partir de video capturado por UAV.
- Gemelos digitales y captura de interiores: el ejemplo de recorrido interior de 13 minutos indica su idoneidad para digitalizar espacios grandes recorridos a pie con una sola camara.
- Conduccion autonoma y vehiculos: el benchmark sobre KITTI apunta a su evaluacion en escenarios de conduccion, donde la estimacion de pose y la reconstruccion del entorno son tareas relevantes.
- Postproduccion y VFX: el pipeline de renderizado offline permite procesar metraje largo para extraer geometria y trayectorias de camara que alimenten herramientas de efectos o de reconstruccion.
- Analisis de grandes volmenes de video: gracias a la inferencia por ventanas, se pueden procesar grabaciones de decenas de miles de fotogramas sin desbordar memoria.

## Benchmarks y rendimiento

La model card indica que se publicaron scripts de evaluacion para KITTI y Oxford Spires, y que el pipeline de evaluacion cubre ademas los datasets VBR, Droid-W, TUM-D, 7-scenes, ETH3D, Tanks and Temples y NRGBD. Sin embargo, en la informacion proporcionada no se incluyen cifras numericas de resultados (por ejemplo, errores de pose o metricas de reconstruccion) ni comparaciones cuantitativas.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- Tamano del repositorio: 33,0 GB (incluye pesos y scripts; el peso en memoria depende del formato y precision cargados).
- GPUs recomendadas: no disponible de forma explicita. El entorno declarado es CUDA 12.8 con PyTorch 2.8.0.
- Compatibilidad con GPU de consumo: no disponible. No se indica si cabe en GPUs como RTX 4090 o similares.
- Backends de atencion: FlashInfer (recomendado para maxima velocidad) y SDPA (alternativa; se corrigio un bug de KV cache en 2026-06-28 y ahora rinde mejor en secuencias largas).
- Aceleracion: se ofrece la opcion `--compile` (por ejemplo, `python demo.py --compile`) para compilar y acelerar la inferencia.
- Opciones de despliegue: demo interactiva (`demo.py`), pipeline de renderizado offline por lotes (`demo_render/batch_demo.py`) y perfilado (`gct_profile.py`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables directamente a este tipo de modelo).
- Latencia y throughput: aproximadamente 20 FPS a resolucion 518x378 en secuencias superiores a 10.000 fotogramas, segun la model card.
- Dependencias: Python 3.10, PyTorch 2.8.0 y torchvision 0.23.0 (CUDA 12.8); NVIDIA Kaolin necesario para el pipeline de renderizado por lotes.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos cuantitativos sobre modelos comparables. La propia model card afirma que el modelo obtiene "rendimiento de vanguardia" frente a enfoques de streaming existentes y a enfoques basados en optimizacion iterativa, pero no incluye cifras ni nombres que permitan construir una tabla comparativa fiable.

Comparativa con modelos similares: no disponible.

## Limitaciones y advertencias

- Deriva acumulada: aunque el modelo incorpora memoria de trayectoria para corregirla, la propia model card documenta correcciones de errores relacionadas con la calidad de pose y reconstruccion en secuencias largas (por ejemplo, el bug de KV cache con `--keyframe_interval > 1` que afectaba a mas de 320 fotogramas), lo que indica que la robustez en secuencias muy largas ha requerido ajustes.
- Dependencia del backend: el rendimiento optimo depende de FlashInfer; con SDPA el comportamiento en secuencias largas es inferior.
- Memoria en secuencias muy largas: para mas de 3.000 fotogramas se recomienda inferencia por ventanas, lo que sugiere limitaciones de memoria en el procesamiento continuo.
- Preprocesado especifico: ciertos escenarios requieren pasos adicionales, como el enmascarado de cielo o el preprocesado del dataset Oxford Spires antes de la evaluacion.
- Datos ausentes en la model card: no se publican numero de parametros, composicion del dataset de entrenamiento, idiomas ni tipos de cuantizacion, lo que dificulta anticipar el comportamiento fuera de los escenarios de demostracion.
- Sesgos: no disponible. No se documentan sesgos conocidos.
- Riesgo de alucinacion: no aplicable en el sentido de generacion de lenguaje; en su lugar, el riesgo relevante es de reconstruccion geometrica incorrecta o de estimacion de pose erronea en regiones con poca textura o movimiento.
- Licencia: Apache-2.0, que en principio permite uso comercial, pero conviene revisar el archivo `LICENSE.txt` del repositorio y las licencias de las dependencias (por ejemplo, NVIDIA Kaolin) antes de desplegar en produccion.
- Fecha e identificador del paper: el identificador indicado es arXiv:2604.14141; conviene verificar su disponibilidad real antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robbyant/lingbot-map
- Paper (arXiv): https://arxiv.org/abs/2604.14141
- PDF del paper: lingbot-map_paper.pdf (referenciado en el repositorio)
- Web del proyecto: https://technology.robbyant.com/lingbot-map
- Modelo en ModelScope: https://www.modelscope.cn/models/Robbyant/lingbot-map
- Video de demostracion: https://github.com/user-attachments/assets/fe39e095-af2c-4ec9-b68d-a8ba97e505ab
- Repositorio de codigo: no disponible en la informacion proporcionada
- Documentacion de FlashInfer: https://docs.flashinfer.ai/installation.html
- PyTorch Get Started: https://pytorch.org/get-started/locally/

# dronefreak/emsanet-r34-nbt1d-nyuv2-hypersim

## Resumen

EMSANet (ResNet34-NBt1D) es una red neuronal convolucional multi-tarea disenada para el analisis de escenas interiores a partir de entradas RGB-D (imagen en color mas mapa de profundidad). La desarrolla el grupo de Neuroinformatics and Cognitive Robotics Lab de la TU Ilmenau, y este repositorio concreto es un espejo no oficial en Hugging Face de los pesos originales publicados por los autores, que anade una copia en `safetensors` y un `config.json` junto al checkpoint original en formato PyTorch.

El modelo resuelve simultaneamente cinco tareas de comprension de escena: segmentacion semantica, segmentacion de instancias, segmentacion panoptica, estimacion de orientacion de instancias y clasificacion de escena. Emplea una arquitectura de dos codificadores independientes, ambos basados en ResNet34-NBt1D (una variante de ResNet34 con capas de normalizacion batch-temporal 1D), uno para la rama RGB y otro para la rama de profundidad, combinados mediante un mecanismo de fusion basado en atencion.

Con 64,3 millones de parametros y un peso de repositorio de 1 GB, es un modelo compacto y eficiente pensado para robotica movil y sistemas embebidos en interiores. Esta entrenado sobre NYUv2 con 40 clases semanticas, partiendo de un preentrenamiento en ImageNet y un ajuste previo en Hypersim. Su relevancia actual radica en que ofrece un rendimiento multi-tarea solido con un coste computacional bajo, lo que lo hace adecuado para plataformas con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EMSANet: dos codificadores ResNet34-NBt1D (RGB y profundidad) con fusion por atencion y cabezas multi-tarea |
| Parametros totales | 64.311.874 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo convolucional, no basado en atencion sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales; al ser PyTorch estandar admite FP16/INT8 via herramientas genericas) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (`model.safetensors`), PyTorch `.pth` (`r34_NBt1D_pre.pth`), checkpoints de preentrenamiento en `.pth` |

## Arquitectura y entrenamiento

EMSANet es una red puramente convolucional con una topologia de dos ramas. Cada modalidad de entrada (RGB y profundidad) se procesa con un codificador ResNet34-NBt1D independiente, que sustituye las capas de normalizacion batch convencionales por normalizacion batch-temporal 1D, una eleccion habitual en segmentacion densa para estabilizar el entrenamiento con lotes pequenos. Las caracteristicas de ambas ramas se combinan mediante un modulo de fusion guiado por atencion, y sobre la representacion fusionada se montan cabezas especificas para cada tarea: semantica, instancias, panoptica, orientacion y clasificacion de escena.

El entrenamiento sigue una cadena de tres etapas: preentrenamiento del codificador en ImageNet, preentrenamiento completo de EMSANet en el dataset sintetico Hypersim y, finalmente, ajuste fino supervisado sobre NYUv2 con 40 clases semanticas. El repositorio incluye tanto el checkpoint final de NYUv2 como los pesos intermedios de ImageNet y Hypersim, lo que permite reproducir la cadena o reutilizar los codificadores. El articulo de referencia (IJCNN 2022) describe la eficiencia computacional como objetivo central del diseno, y el modelo no emplea tecnicas de RLHF ni decodificacion especulativa, por tratarse de una tarea de vision y no de generacion de texto.

## Capacidades

- Segmentacion semantica densa de escenas interiores con 40 clases sobre NYUv2.
- Segmentacion de instancias y segmentacion panoptica en una sola pasada.
- Estimacion de orientacion de instancias (prediccion del angulo de cada objeto).
- Clasificacion de escena global a partir de la imagen RGB-D.
- Fusion multimodal RGB + profundidad mediante atencion.
- Procesamiento multi-tarea simultaneo con un unico modelo y un unico forward pass.
- Aprovechamiento de informacion geometrica de la profundidad para desambiguar objetos con apariencia similar.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje; es exclusivamente un modelo de vision.

## Casos de uso

- Robotica movil de interior: el modelo proporciona mapas semanticos y de instancias en tiempo real a partir de la camara RGB-D del robot, lo que permite navegacion consciente de objetos y planificacion de agarres gracias a su bajo coste (64,3 M de parametros).
- Asistencia a personas con discapacidad visual: la segmentacion semantica y la orientacion de instancias permiten generar descripciones del entorno domestico y alertar sobre obstaculos cercanos usando solo una camara de profundidad.
- Reconstruccion y modelado 3D de interiores: la salida panoptica y la orientacion de instancias alimentan pipelines de levantamiento de planos y modelado BIM a partir de capturas RGB-D.
- Automatizacion de tareas domesticas: un brazo robotico puede localizar y clasificar objetos (taza, silla, mesa) y estimar su orientacion para planificar el agarre, usando la cabeza de instancias y orientacion del modelo.
- Analisis de accesibilidad de espacios: clasificacion de escena y segmentacion semantica para detectar barreras arquitectonicas y evaluar la distribucion de mobiliario en entornos interiores.
- Investigacion en percepcion multi-tarea: sirve como baseline reproducible para comparar estrategias de fusion RGB-D y de aprendizaje multi-tarea, dado que los autores publican pesos y codigo.
- Prototipado en dispositivos embebidos: su tamano reducido permite desplegarlo en plataformas con GPU integrada (Jetson, por ejemplo) para pruebas de concepto de percepcion en interiores.

## Benchmarks y rendimiento

Resultados reportados por los autores sobre NYUv2:

| Metrica | Valor |
|---|---|
| mIoU (segmentacion semantica) | 53,34 |
| PQ (panoptica) | 47,38 |
| RQ (panoptica) | 55,95 |
| SQ (panoptica) | 83,74 |
| MAAE de orientacion | 15,91 |
| bAcc de clasificacion de escena | 75,25 |

No se han publicado en la informacion disponible resultados comparativos adicionales frente a otros modelos, ni tablas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,3 GB solo para los pesos (64,3 M de parametros); con activaciones y lotes pequenos, el consumo tipico se situa por debajo de 1-2 GB. En FP16 se reduce a la mitad en pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo esta claramente sobredimensionado para GPUs de datacenter.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: el modelo se ejecuta con PyTorch nativo y el codigo oficial de TUI-NICR/EMSANet; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a modelos de lenguaje). Para produccion se puede exportar a TorchScript u ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada; el articulo original reporta velocidades de inferencia, pero no se incluyen en esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EMSANet (este modelo) | 64,3 M | RGB + profundidad | Semantica, instancias, panoptica, orientacion, escena | Apache-2.0 | Hugging Face (espejo) y GitHub oficial |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos verificables sobre modelos alternativos de la misma categoria (segmentacion RGB-D multi-tarea en interiores), por lo que no se ofrece una comparativa numerica.

## Limitaciones y advertencias

- Modelo de vision sin capacidades de lenguaje: no procesa texto ni mantiene conversaciones.
- Entrenado exclusivamente en NYUv2 (40 clases de interiores); el rendimiento en escenas exteriores, industriales o con clases no vistas puede degradarse notablemente.
- Requiere entrada RGB-D sincronizada; sin mapa de profundidad de calidad, la rama de profundidad aporta poco y el rendimiento cae.
- Riesgo de error en objetos pequenos, oclusiones severas y superficies reflectantes o transparentes, habituales en interiores.
- Es un espejo no oficial: aunque los pesos son copia exacta de los originales, el mantenimiento y las actualizaciones dependen de un tercero.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda citar el articulo original y revisar los terminos del repositorio oficial.
- No se documentan sesgos especificos ni evaluaciones de robustez fuera de NYUv2; conviene validar en el dominio de despliegue antes de produccion.
- El checkpoint original se distribuye como diccionario con `state_dict`; la carga directa con `from_pretrained` de transformers no esta soportada, hay que usar el codigo oficial o cargar el `state_dict` manualmente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dronefreak/emsanet-r34-nbt1d-nyuv2-hypersim
- Codigo oficial: https://github.com/TUI-NICR/EMSANet
- Articulo (arXiv): https://arxiv.org/abs/2207.04526
- DOI del articulo: https://doi.org/10.1109/IJCNN55064.2022.9892852
- Dataset NYUv2 (espejo): https://huggingface.co/datasets/dronefreak/NYUv2

# dronefreak/newcrfs-nyuv2

## Resumen

NeWCRFs (Swin-L) es un modelo de estimacion de profundidad monocular entrenado sobre el dataset NYUv2. Lo desarrollaron Weihao Yuan, Xiaodong Gu, Zuozhuo Dai, Siyu Zhu y Ping Tan (Alibaba Group) y se presento en CVPR 2022. El repositorio `dronefreak/newcrfs-nyuv2` no es la publicacion oficial: es un espejo no oficial que redistribuye los pesos originales sin modificar y anade una copia en `safetensors` junto con un `config.json`.

El modelo resuelve una tarea concreta de vision por computador: predecir un mapa de profundidad denso a partir de una unica imagen RGB en interiores. Combina un codificador Swin Transformer de tamano Large con un decodificador basado en campos aleatorios condicionales (CRF) totalmente conectados sobre ventanas neuronales, lo que le permite modelar dependencias globales de la escena sin la carga computacional de un CRF denso clasico.

Es relevante en el contexto actual porque ofrece una linea base solida y bien documentada para depth estimation de interior, con licencia MIT y pesos ligeros (270,5 M de parametros, repo de 2,2 GB). No es un modelo generativo ni conversacional: no procesa texto, no soporta tool calling y no tiene ventana de contexto en el sentido de los LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeWCRFs: codificador Swin Transformer Large + decodificador Neural Window Fully-connected CRF |
| Parametros totales | 270.522.733 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) y checkpoint PyTorch original (`model_nyu.ckpt`) |

## Arquitectura y entrenamiento

NeWCRFs sigue un diseno encoder-decoder. El codificador es un Swin Transformer en variante Large, que extrae caracteristicas jerarquicas mediante atencion por ventanas desplazadas. El decodificador sustituye el CRF denso tradicional por un modulo de CRF totalmente conectado sobre ventanas neuronales, que aproxima interacciones de largo alcance entre regiones de la imagen con un coste manejable. Esta es la innovacion central del paper: modelar la estructura global de la escena sin el coste cuadratico de un CRF denso pixel a pixel.

El entrenamiento se realizo sobre NYUv2, un dataset de escenas de interior con profundidad ground truth capturada por sensor. La model card no detalla el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en este tipo de modelo). Tampoco se documenta el regimen de aumento de datos ni la configuracion exacta de entrenamiento en la informacion disponible. Los pesos redistribuidos son copia bit-exacta de los tensores del checkpoint original, sin estado del optimizador.

## Capacidades

- Estimacion de profundidad monocular densa a partir de una imagen RGB de interior.
- Prediccion de mapas de profundidad con buena precision relativa, segun las metricas reportadas por los autores.
- Modelado de estructura global de escena gracias al decodificador CRF sobre ventanas neuronales.
- Extraccion de caracteristicas visuales mediante Swin Transformer Large (reutilizable como backbone).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingues: no procesa texto.
- Sin modo thinking, vision-language, audio ni generacion de texto.

## Casos de uso

- Reconstruccion 3D de interiores: usar el mapa de profundidad predicho para generar nubes de puntos o mallas de habitaciones a partir de fotografias, aprovechando que el modelo esta entrenado especificamente en NYUv2.
- Robotica movil en interiores: estimar distancias a obstaculos con una sola camara RGB, reduciendo coste de sensores frente a LiDAR o camaras estereo.
- Realidad aumentada: colocar objetos virtuales de forma coherente con la geometria de la escena estimando la profundidad de la imagen de fondo.
- Edicion fotografica y efectos de desenfoque: generar mapas de profundidad para aplicar bokeh sintetico o segmentacion por planos de profundidad.
- Navegacion asistida: proporcionar informacion de distancia a personas con discapacidad visual a partir de la camara del movil.
- Preprocesado para pipelines de vision: usar la profundidad como caracteristica adicional en tareas de deteccion, segmentacion o planificacion de trayectorias.
- Evaluacion comparativa de metodos de depth estimation: servir como linea base reproducible con pesos publicos y licencia permisiva.

## Benchmarks y rendimiento

Resultados reportados por los autores del paper original sobre NYUv2 (recogidos en la model card del espejo):

| Metrica | Valor |
|---|---|
| Abs Rel | 0.0952 |
| Sq Rel | 0.0443 |
| RMSE | 0.331 |
| RMSE log | 0.1185 |
| delta < 1.25 | 0.923 |
| delta < 1.25^2 | 0.992 |
| delta < 1.25^3 | 0.998 |
| SILog | 9.1023 |

No se han publicado en la informacion disponible comparaciones directas con otros modelos en este repositorio; consultese el paper original para las tablas completas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,1 GB solo para pesos (270,5 M de parametros x 4 bytes), mas activaciones; en la practica conviene reservar 4-8 GB segun resolucion de entrada y tamano de lote.
- En FP16/BF16 los pesos ocupan unos 0,55 GB, pero la compatibilidad de la implementacion original con precision reducida no esta documentada.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para imagenes de resolucion moderada; A100, H100 o RTX 4090 ofrecen margen amplio y buen throughput.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 o superiores.
- Opciones de despliegue: el modelo requiere el codigo oficial de NeWCRFs (https://github.com/aliyun/NeWCRFs) para construir la red y cargar los pesos; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM). El checkpoint puede cargarse con PyTorch y los pesos con `safetensors.torch.load_file`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeWCRFs (Swin-L) NYUv2 | 270,5 M | imagen RGB (resolucion no especificada) | depth estimation monocular | MIT | pesos en este espejo y repo oficial |
| Modelos tipo MiDaS / DPT | no disponible en la informacion | imagen RGB | depth estimation monocular | no disponible | no disponible |
| Modelos tipo Depth Anything | no disponible en la informacion | imagen RGB | depth estimation monocular | no disponible | no disponible |

No se dispone de datos verificados de modelos alternativos en la informacion proporcionada; la comparativa cuantitativa debe hacerse contra las tablas del paper original.

## Limitaciones y advertencias

- Entrenado exclusivamente en NYUv2 (escenas de interior); el rendimiento en exteriores, escenas nocturnas o dominios muy distintos puede degradarse notablemente.
- Es un espejo no oficial: no hay garantia de soporte por parte de los autores originales; los pesos son copia bit-exacta, pero la integracion y el mantenimiento dependen del autor del mirror.
- Requiere el codigo oficial para construir la arquitectura; no es plug-and-play con `transformers` ni con pipelines estandar de Hugging Face.
- Riesgo de sesgo hacia la distribucion de NYUv2 (tipologia de habitaciones, iluminacion, camaras); puede fallar en escenas con superficies reflectantes, transparentes o texturas repetitivas.
- Sin capacidades de texto, tool calling ni agentes; no debe confundirse con un modelo multimodal generativo.
- Licencia MIT permisiva para uso comercial, pero conviene citar el trabajo original y revisar los terminos del dataset NYUv2 si se redistribuye.
- No hay informacion sobre cuantizaciones ni sobre latencia en produccion; habria que medirlas en el entorno objetivo.

## Enlaces

- Repositorio del espejo: https://huggingface.co/dronefreak/newcrfs-nyuv2
- Paper (arXiv): https://arxiv.org/abs/2203.01502
- Codigo oficial: https://github.com/aliyun/NeWCRFs
- Dataset NYUv2 (espejo en el Hub): https://huggingface.co/datasets/dronefreak/NYUv2

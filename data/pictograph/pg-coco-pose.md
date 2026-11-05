# pictograph/pg-coco-pose

## Resumen

PG-COCO-Pose es un modelo de deteccion de keypoints (pose estimation) desarrollado por Pictograph Research. Detecta personas en imagenes y localiza 17 puntos clave del esqueleto humano (nariz, ojos, orejas, hombros, codos, munecas, caderas, rodillas y tobillos) con una confianza individual por articulacion. Se distribuye como pesos ONNX en FP32, con una entrada fija de 576x576 pixeles, y esta pensado para ejecutarse tanto en CPU como en GPU mediante ONNX Runtime o el SDK propio de Pictograph.

El modelo se construye sobre la arquitectura RF-DETR Keypoint Preview y se entrena sobre el dataset COCO 2017 Pose (10.799 imagenes durante 12 epocas). Alcanza un 73,2% de OKS (la metrica de precision media de keypoints de COCO), con un 89,1% en OKS@50 y un 79,2% en OKS@75. Es relevante como referencia porque empaqueta un detector de poses en un unico artefacto ONNX de aproximadamente 0,1 GB, con preprocesado y postprocesado definidos en un `config.json` adjunto, lo que simplifica su integracion en pipelines de vision por computador.

La limitacion principal es la licencia: uso exclusivamente no comercial. Ademas, el modelo solo reconoce la clase persona y el esqueleto de 17 puntos de COCO, por lo que no cubre poses de manos, rostro detallado ni animales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Keypoint Preview (transformer detector, variante preview) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de 576x576 pixeles) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Custom License, solo uso no comercial |
| Formato de pesos | ONNX (`pg-coco-pose.onnx`) + `config.json` |

## Arquitectura y entrenamiento

El modelo sigue la familia RF-DETR en su variante Keypoint Preview, un detector basado en transformer (DETR) adaptado a la prediccion de keypoints. La salida agrupa las articulaciones por instancia mediante un `instance_id` compartido, y cada keypoint incluye nombre de la articulacion, coordenadas y nivel de confianza. La entrada es una imagen de 576x576 en formato NCHW float32; la normalizacion exacta y el decodificado se especifican en el `config.json` que acompana a los pesos.

El entrenamiento se realizo sobre COCO 2017 Pose (10.799 imagenes) durante 12 epocas, con batch size 4 y learning rate 0,0001, en precision FP32. La model card no detalla el numero de tokens de entrenamiento (no aplica), la composicion exacta del dataset mas alla de COCO, ni si se aplicaron tecnicas de RLHF/DPO (no procede en vision). Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Deteccion de personas en imagenes y localizacion de 17 keypoints del esqueleto humano (formato COCO).
- Salida multi-instancia: identifica varias personas en la misma imagen, cada una con su `instance_id` y sus 17 articulaciones.
- Confianza por articulacion, lo que permite filtrar keypoints poco fiables en postprocesado.
- Definicion explicita del esqueleto: cada keypoint indica a que articulaciones se conecta, util para dibujar el esqueleto o calcular angulos.
- Ejecucion en CPU y GPU via ONNX Runtime (proveedores `CPUExecutionProvider` y equivalentes).
- Integracion con el SDK de Pictograph, que aplica el preprocesado y postprocesado exactos del modelo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision.
- No incluye modo thinking, vision generativa, audio ni generacion de texto.

## Casos de uso

- Analisis deportivo: estimar la postura de un atleta (por ejemplo, un levantador de pesas) a partir de fotogramas y calcular angulos de rodilla, cadera y hombro para evaluar la tecnica. El modelo es adecuado porque devuelve coordenadas y confianza por articulacion, lo que permite descartar keypoints ocluidos.
- Seguridad y ergonomia en el puesto de trabajo: procesar imagenes de camaras fijas para detectar posturas forzadas o repetitivas y generar alertas. La salida multi-instancia permite analizar a varios trabajadores en la misma escena.
- Control de aforo y analitica de personas: contar personas y estimar su posicion y orientacion aproximada en una imagen. El modelo detecta cada instancia por separado, lo que facilita el conteo.
- Animacion y motion capture de bajo coste: extraer esqueletos 2D de fotogramas para rigging o retargeting en herramientas de animacion. El esqueleto de 17 puntos y la lista de conexiones facilitan la construccion del grafo.
- Investigacion en vision por computador: servir como baseline reproducible de RF-DETR Keypoint sobre COCO Pose para comparar tecnicas de deteccion de keypoints, gracias a sus metricas OKS publicadas.
- Prototipado rapido en el navegador o via API: probar el modelo en la plataforma Pictograph o desplegarlo como endpoint siempre activo sin gestionar infraestructura propia, util para demos y validacion temprana.
- Preprocesado para pipelines de analisis de video: usar las poses detectadas como entrada de modelos posteriores (clasificacion de acciones, deteccion de caidas) en un pipeline por fotogramas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre COCO 2017 Pose (no verificados de forma independiente):

| Metrica | Valor |
|---|---:|
| OKS | 73,17% |
| OKS@50 | 89,1% |
| OKS@75 | 79,22% |
| Recall | 78,83% |

No se han publicado en la informacion disponible resultados comparativos con otros modelos de pose estimation (por ejemplo, YOLO-Pose, RTMPose o ViTPose) ni metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con pesos FP32 y un repo de 0,1 GB, la huella en memoria es reducida; una GPU consumer con 4-8 GB es suficiente en la practica, aunque el fabricante no publica cifras.
- GPU recomendadas: no especificadas. Al ser un modelo ONNX pequeno, cualquier GPU con soporte de ONNX Runtime (RTX 4090, A100, H100, etc.) puede ejecutarlo; tambien funciona en CPU.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU consumer moderna con unos pocos GB de VRAM, aunque no hay cifras oficiales.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), SDK de Pictograph (`pip install "pictograph[inference]"`), API alojada de Pictograph y endpoint siempre activo en la plataforma.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos alternativos (YOLO-Pose, RTMPose, ViTPose, MediaPipe Pose) medidos sobre el mismo protocolo, por lo que no es posible una comparativa numerica fiable. A nivel cualitativo:

| Modelo | Parametros | Contexto/entrada | OKS COCO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PG-COCO-Pose | no disponible | 576x576 | 73,2% | Custom, solo no comercial | HuggingFace (ONNX) |
| YOLO-Pose | no disponible | variable | no disponible | varía según version | no disponible en la informacion |
| RTMPose | no disponible | variable | no disponible | Apache 2.0 (segun fuente no incluida) | no disponible en la informacion |
| ViTPose | no disponible | variable | no disponible | varía | no disponible en la informacion |

## Limitaciones y advertencias

- Licencia Custom que restringe el uso a fines no comerciales; no apta para productos o servicios comerciales sin autorizacion expresa.
- Entrenado exclusivamente sobre COCO 2017 Pose: solo detecta la clase persona y el esqueleto de 17 puntos; no cubre manos, rostro detallado, animales ni otros objetos.
- Riesgo de fallo en poses muy ocluidas, personas pequenas en la imagen o escenas con multitud densa; la confianza por keypoint ayuda a filtrar, pero no elimina el problema.
- Entrada fija de 576x576: imagenes de otra resolucion requieren redimensionado, lo que puede degradar la precision en objetos muy pequenos.
- Las metricas OKS estan declaradas por el autor y marcadas como no verificadas; conviene validarlas en el caso de uso concreto.
- No se documentan sesgos demograficos ni de dominio; al entrenar sobre COCO, es probable que herede los sesgos de representacion del dataset (no confirmado en la informacion).
- La variante "preview" de RF-DETR sugiere que el modelo puede no ser la version final de la arquitectura; no hay garantia de estabilidad de la API ni del formato.
- El decodificado de las salidas ONNX es especifico de la arquitectura; usar ONNX Runtime en crudo exige implementar el postprocesado o recurrir al SDK de Pictograph.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pictograph/pg-coco-pose
- Pagina del modelo en Pictograph: https://pictograph.io/models/pictograph-research/pg-coco-pose
- Organizacion Pictograph Research: https://pictograph.io/org/pictograph-research
- Dataset COCO 2017 Pose en HuggingFace: https://huggingface.co/datasets/pictograph/coco-2017-pose
- Documentacion del SDK: https://pictograph.io/docs
- Guia de inferencia local: https://pictograph.io/docs/local-inference
- Paper referenciado (arXiv:2511.09554): https://arxiv.org/abs/2511.09554

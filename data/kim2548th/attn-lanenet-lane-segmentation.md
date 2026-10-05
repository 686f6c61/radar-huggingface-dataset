# kim2548TH/attn-lanenet-lane-segmentation

## Resumen

Attn-LaneNet (Attention-Guided Residual Lane Segmentation Network) es una red neuronal convolucional ligera disenada y entrenada desde cero para segmentacion semantica binaria de carriles en conduccion autonoma. Lo desarrolla Jitrakorn Jansang (kim2548TH) como parte de la asignatura 2569-241-353 AI Ecosystem, y se publica bajo licencia MIT en Hugging Face. El modelo no utiliza backbones preentrenados ni transfer learning: todos los pesos proceden de entrenamiento propio sobre el PSU Reservoir Lane Dataset del propio autor.

La red opera sobre entradas RGB de 64 x 36 pixeles (formato 16:9, con divisibilidad entera exacta hasta 16 x 9) y produce un mapa de logits de un solo canal con la misma resolucion espacial. Con 924.497 parametros segun la model card (927.553 segun los metadatos de safetensors) y 3,53 MB en FP32, el objetivo declarado es la inferencia en tiempo real en hardware embebido: la model card reporta 3,65 ms por fotograma y 274,3 FPS en Apple Silicon (MPS).

Su relevancia es acotada y experimental: se trata de un modelo de un unico autor, con 0 descargas y 0 likes en el momento de la consulta, evaluado sobre un dataset propio de 350 fotogramas de test. Resulta util como referencia de arquitectura CNN ultraligera con recalibracion SE y contexto dilatado, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN encoder-decoder con ResBlocks, modulos Squeeze-and-Excitation, cuello de botella de convoluciones dilatadas (r = 1, 2, 4), upsampling bilineal con skip connections y cabeza de segmentacion 1 x 1 |
| Parametros totales | 924.497 (model card) / 927.553 (metadatos de safetensors; discrepancia no explicada por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision; entrada fija de 64 x 36 x 3 pixeles) |
| Tipos de cuantizacion | no se documentan; los pesos se distribuyen en FP32 |
| Idiomas soportados | en, th (metadatos del repositorio; no aplican a una tarea de segmentacion visual) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, 3,6 MB), PyTorch state dict (attn_lanenet_weights.pt, 3,6 MB) y pytorch_model.bin (3,6 MB) |
| Tarea | image-segmentation (segmentacion binaria de carril, clase unica) |
| Resolucion de entrada | 64 x 36 x 3 (RGB) |
| Resolucion de salida | 1 x 36 x 64 (logits binarios) |
| Tamano del repo | 0,0 GB segun metadatos de Hugging Face |
| Fecha de creacion | 2026-10-04 |
| Fecha de actualizacion | 2026-10-04 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura sigue un esquema encoder-decoder completamente convolucional. El stem aplica una convolucion mas un ResBlock para producir 32 canales a 64 x 36. A continuacion, dos etapas de downsampling con MaxPool 2x y dos ResBlock-SE cada una reducen la resolucion a 32 x 18 (64 canales) y 16 x 9 (128 canales). El cuello de botella opera a 16 x 9 con 256 canales y tres ramas dilatadas (r = 1, 2, 4) que amplian el campo receptivo sin incrementar el numero de parametros. El decoder aplica upsampling bilineal 2x con fusion de skip connections desde el stem y la primera etapa, y termina en una convolucion 1 x 1 que emite un unico canal de logits. La salida se binariza con sigmoide y umbral 0,5 en los ejemplos de uso.

Los modulos Squeeze-and-Excitation recalculan los pesos de canal para concentrar la capacidad en las marcas viales y atenuar agua, cielo y vegetacion. La eleccion de 64 x 36 evita padding asimetrico: 64/2 = 32, 32/2 = 16 y 36/2 = 18, 18/2 = 9. El entrenamiento se realizo integramente desde cero, sin backbone preentrenado ni transfer learning, durante 35 epocas con perdida hibrida BCE + Soft Dice, optimizador AdamW y scheduler de Cosine Annealing. El dataset de entrenamiento y evaluacion es el PSU Reservoir Lane Dataset, del propio autor; el split de test corresponde a 350 fotogramas (35 % del total). No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, logicamente fuera del ambito de un modelo de segmentacion.

## Capacidades

- Segmentacion semantica binaria de carril en imagenes RGB: genera una mascara por pixel que distingue marca vial de fondo.
- Entrada de baja resolucion fija (64 x 36 x 3) apta para pipelines de tiempo real en dispositivos con recursos limitados.
- Inferencia en CPU y en GPU; la model card reporta ejecucion en Apple Silicon MPS.
- Carga directa de pesos mediante `AttnLaneNet.from_pretrained` o descarga de `model.py` y del state dict con `hf_hub_download`.
- Carga en tres formatos de peso: safetensors, `.pt` y `.bin`.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking), ni de capacidades de audio o de vision general mas alla de la segmentacion binaria de carril.
- No es un modelo multilingue en sentido funcional; las etiquetas en/th son metadatos del repositorio.

## Casos de uso

- Asistencia de mantenimiento de carreteras: procesar imagenes cenitales o de dron de vias con marca vial desgastada para generar una mascara binaria por fotograma y medir la continuidad del carril; el coste de 924.497 parametros permite ejecutar el modelo sobre el propio dron sin GPU.
- Prototipado academico de conduccion autonoma: usar la red como primer modulo de percepcion en un simulador o en un vehiculo a escala, donde se requiere una mascara de carril a mas de 200 FPS en el ordenador de abordo.
- Vision embebida en Raspberry Pi o Jetson: desplegar el modelo en FP32 con 3,53 MB de pesos y un pico de proceso de ~307,7 MB de RAM, integrarlo en un bucle de captura de camara y consumir la mascara como entrada de un controlador de direccion.
- Preetiquetado de datos de carril: generar mascaras automaticas sobre grandes volumenes de imagenes y corregirlas manualmente, reduciendo el tiempo de anotacion de poligonos que actualmente se realiza con herramientas tipo YOLO.
- Control de calidad de anotaciones: comparar la mascara predicha con la anotacion ground truth usando IoU por fotograma y detectar imagenes mal etiquetadas (el modelo reporta un IoU maximo de 94,30 % y una tasa de deteccion del 99,71 % con umbral IoU >= 0,60).
- Demostracion docente de entrenamiento desde cero: el repositorio incluye la arquitectura completa en un unico archivo `model.py`, lo que facilita reproducir el pipeline BCE + Soft Dice con AdamW y Cosine Annealing en un cuaderno de clase.
- Analisis offline de video de trayecto: extraer fotogramas a 64 x 36, inferir a 3,65 ms por fotograma y reconstruir la trayectoria del carril en una secuencia para estudios de trazado viario.

## Benchmarks y rendimiento

Evaluacion del autor sobre los 350 fotogramas no vistos del PSU Reservoir Lane Dataset (35 % del total):

| Metrica | Objetivo declarado | Attn-LaneNet |
|---|---|---|
| Tasa de deteccion (IoU >= 0,60) | requisito base | 99,71 % (349 / 350 fotogramas) |
| IoU medio (350 fotogramas) | no aplica | 91,97 % |
| IoU medio (detecciones positivas) | >= 60,0 % | 92,08 % |
| Precision media | no aplica | 94,68 % |
| Recall medio | no aplica | 96,98 % |
| F1 medio | no aplica | 95,76 % |
| IoU maximo | no aplica | 94,30 % |
| Latencia de inferencia | maquina local | 3,65 ms / fotograma |
| Throughput | tiempo real (>= 30 FPS) | 274,3 FPS (Apple Silicon MPS) / 226+ FPS |
| Huella de RAM (pico de proceso) | portatil / PC | ~307,7 MB |

No se aportan resultados en benchmarks publicos estandar (Cityscapes, TuSimple, CULane, BDD100K) ni comparaciones numericas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 50 MB en FP32 para pesos (3,53 MB) y activaciones de 64 x 36; no se publican mediciones de VRAM concretas.
- GPU recomendadas: no se especifica ninguna. La evaluacion reportada se hizo en Apple Silicon con MPS; el modelo cabe sin problema en cualquier GPU consumer (RTX 3060, RTX 4090, etc.), aunque no hay cifras publicadas por modelo de GPU.
- Inferencia en CPU: viable por el tamano de la red; la model card declara explicitamente la orientacion a edge y CPU, sin dar FPS por CPU.
- Cabe en GPU consumer: si, con un consumo de memoria despreciable; tambien cabe en placas embebidas tipo Raspberry Pi o Jetson.
- Opciones de despliegue: PyTorch nativo (recomendado por el autor), descarga de pesos con `huggingface_hub`, e integracion en pipelines de `torch`. No se documentan exportaciones a ONNX, TensorRT, OpenVINO ni TFLite. Los runtimes de LLM como vLLM, TGI, llama.cpp u Ollama no son aplicables a este modelo.
- Latencia y throughput: 3,65 ms por fotograma y 274,3 FPS en Apple Silicon MPS; 226+ FPS en el equipo no especificado por el autor. El pico de consumo de RAM del proceso es de aproximadamente 307,7 MB.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparaciones con otros modelos de segmentacion de carril, ni resultados sobre benchmarks publicos que permitan situar Attn-LaneNet frente a alternativas. La tabla recoge los datos disponibles del modelo y deja constancia de la ausencia de datos verificables para el resto.

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Attn-LaneNet | 924.497 (model card) / 927.553 (safetensors) | 64 x 36 x 3 RGB, mascara binaria 1 canal | IoU medio 91,97 %, F1 95,76 % en el dataset propio; 274,3 FPS en MPS | MIT | Hugging Face (`kim2548TH/attn-lanenet-lane-segmentation`) |
| U-Net (referencia de categoria) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| ENet / ERFNet (referencia de categoria) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| LaneNet / SCNN (referencia de categoria) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

Los resultados de busqueda web realizados no devolvieron informacion tecnica relevante: los enlaces obtenidos corresponden a portales de cupones y comparadores de seguros (savemoredaily.com, moneysupermarket.com, biteforless.com, dealogator.com, priceandpick.com), sin relacion con el modelo.

## Limitaciones y advertencias

- Modelo de clase unica: solo distingue carril frente a fondo; no separa carriles multiples, tipos de marca vial ni elementos de senalizacion.
- Entrada de muy baja resolucion (64 x 36): la mascara se genera a esa escala y se reescala a 1280 x 720 en la visualizacion cualitativa, por lo que los bordes finos se pierden.
- Evaluacion limitada: los 91,97 % de IoU medio y el 99,71 % de tasa de deteccion proceden exclusivamente del PSU Reservoir Lane Dataset, un conjunto propio de aproximadamente 1000 fotogramas (350 de test). No hay validacion cruzada en dominios externos, condiciones nocturnas, lluvia o deslumbramiento.
- Riesgo de sobreajuste al dominio: al entrenarse desde cero y sin backbone preentrenado, es probable que el rendimiento caiga fuera de las condiciones de captura del dataset original. El autor no documenta estudio de sesgos ni analisis de generalizacion.
- Discrepancia de parametros: la model card indica 924.497 parametros y los metadatos de safetensors 927.553; conviene verificar el conteo antes de citar la cifra.
- Riesgo de alucinacion en el sentido de falsos positivos de carril: el recall medio de 96,98 % sobre el dataset propio implica que una fraccion de fotogramas no se detecta correctamente; en una aplicacion de seguridad vial, la salida debe tratarse como entrada de un sistema con redundancia, nunca como decision final.
- Dependencia de codigo personalizado: la carga mediante `from_pretrained` requiere el archivo `model.py` del repositorio; no es un modelo de la libreria `transformers`, por lo que hay que auditar el codigo antes de ejecutarlo.
- Idiomas: las etiquetas en/th no implican capacidades linguisticas; cualquier tarea de texto esta fuera del alcance del modelo.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, siempre conservando el aviso de copyright y la licencia. No hay clausulas de uso responsable ni restricciones adicionales documentadas.
- Madurez baja: 0 descargas y 0 likes en el momento de la consulta, con fecha de creacion y ultima actualizacion identicas (2026-10-04). No hay historial de mantenimiento ni soporte.
- Sin datos publicados sobre cuantizacion, exportacion a ONNX o TensorRT, ni comportamiento en produccion con lotes grandes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kim2548TH/attn-lanenet-lane-segmentation
- Dataset del autor (PSU Reservoir Lane Dataset): https://huggingface.co/datasets/kim2548TH/psu-reservoir-lane-dataset
- Documentacion de PyTorch: https://pytorch.org/
- Texto de la licencia MIT: https://opensource.org/licenses/MIT
- Resultados de busqueda web: sin enlaces relevantes; los dominios devueltos (savemoredaily.com, moneysupermarket.com, biteforless.com, dealogator.com, priceandpick.com) no guardan relacion con el modelo ni con segmentacion de carriles.

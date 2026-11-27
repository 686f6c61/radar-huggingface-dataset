# kenantabak/yolo26l-skin-lesion-768-detection-tr

## Resumen

YOLO26l (768px) es un modelo de deteccion de objetos basado en la familia YOLO, especializado en dermatologia y ajustado para identificar cuatro clases de lesiones cutaneas: acne, carcinoma basocelular (BCC), melanoma y nevus. Lo publica el usuario kenantabak en Hugging Face bajo licencia MIT, y se distribuye unicamente en formato ONNX (FP32) con un tamano de 93,34 MB. El modelo parte de la arquitectura YOLO26l y opera con una resolucion de entrada fija de 768x768 pixeles.

El modelo resuelve un problema concreto de vision por computador aplicada a la salud: la deteccion y localizacion de lesiones dermatologicas en imagenes, pensada como herramienta de precribado y no como diagnostico clinico. Se entrena sobre un conjunto de 2.271 imagenes y cuatro clases, lo que lo situa en un regimen de datos relativamente pequeno para una tarea medica. Su relevancia actual radica en que ofrece pesos listos para inferencia via ONNX Runtime, sin dependencias de frameworks de deep learning pesados, lo que facilita su despliegue en entornos con CPU.

La informacion disponible es limitada: no se detalla la composicion exacta del dataset, el numero de tokens (no aplica, es vision) ni el proceso de anotacion. El autor declara explicitamente que las metricas son observaciones de sus propios experimentos y no constituyen garantia de diagnostico clinico ni de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26l (detector de objetos de la familia YOLO) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 768x768 px) |
| Tipos de cuantizacion | solo FP32 disponible en el repo (ONNX) |
| Idiomas soportados | tr, en (etiquetas de clases y documentacion) |
| Licencia | MIT |
| Formato de pesos | ONNX (FP32, 93,34 MB) |

## Arquitectura y entrenamiento

Se trata de un detector de objetos de una etapa basado en la arquitectura YOLO26l, configurado con resolucion de entrada de 768x768 pixeles. El modelo se entrena para una tarea de deteccion con cuatro clases (acne, BCC, melanoma y nevus) sobre 2.271 imagenes. El entrenamiento se realizo en una unica GPU NVIDIA H200 (141 GB HBM3e) con precision mixta (AMP), durante 70 epocas y con un tiempo total de 21,01 minutos, alcanzando un pico de VRAM de 14,09 GB.

No se dispone de informacion sobre el dataset de entrenamiento mas alla del numero de imagenes y las clases, ni sobre si se aplicaron tecnicas de aumento de datos, balanceo de clases, RLHF/DPO (no aplicable a vision) o estrategias de decodificacion especulativa. El modelo se exporta a ONNX en FP32, lo que permite inferencia con ONNX Runtime sin necesidad de PyTorch en produccion.

## Capacidades

- Deteccion de objetos en imagenes dermatologicas con cuatro clases: acne, carcinoma basocelular (BCC), melanoma y nevus.
- Localizacion mediante cajas delimitadoras (bounding boxes) con puntuaciones de confianza por clase.
- Inferencia en CPU mediante ONNX Runtime (probado con `CPUExecutionProvider`).
- Entrada de imagen RGB normalizada a 768x768 pixeles.
- Soporte de etiquetas y documentacion en turco e ingles.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso (es un modelo puramente de vision).
- No dispone de modo thinking, vision multimodal general, audio ni generacion de texto.

## Casos de uso

- Precribado dermatologico en aplicaciones moviles: el modelo puede procesar una foto de una lesion cutanea y devolver cajas con la clase probable, sirviendo como primer filtro para derivar casos sospechosos a un especialista. Su formato ONNX y su tamano reducido (93 MB) facilitan la integracion en apps.
- Herramienta de triaje en entornos con poca disponibilidad de dermatologos: al ejecutarse en CPU (aproximadamente 1 FPS en un Xeon de 4 hilos), puede desplegarse en equipos sin GPU para priorizar revisiones.
- Investigacion y docencia en vision medica: permite reproducir experimentos de deteccion de lesiones con un modelo ligero y pesos abiertos bajo licencia MIT.
- Benchmarking de pipelines ONNX: sirve como referencia para comparar latencia y precision en distintas configuraciones de hardware dentro de proyectos de vision por computador.
- Anotacion asistida de datasets: el modelo puede generar propuestas de cajas delimitadoras que un anotador humano revise y corrija, acelerando la creacion de nuevos conjuntos dermatologicos.
- Prototipado rapido de sistemas de alerta temprana: integrado en un flujo de captura de imagenes, puede marcar lesiones con alta confianza de melanoma o BCC para revision prioritaria, siempre con supervision clinica.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| mAP@50 | 79,76 % |
| mAP@50-95 | 54,03 % |
| Precision | 69,73 % |
| Recall | 79,71 % |
| F1 | 73,21 % |
| Latencia CPU (Intel Xeon @ 2,20 GHz, 4 hilos) | 1066,1 ms (0,94 FPS) |
| Tamano ONNX (FP32) | 93,34 MB |
| VRAM pico en entrenamiento | 14,09 GB |
| Tiempo de entrenamiento | 21,01 min (70 epocas, 1x H200) |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al ser ONNX FP32 de 93 MB, la huella en memoria es reducida y puede ejecutarse en CPU.
- GPU recomendadas: no especificadas por el autor; el entrenamiento se realizo en una NVIDIA H200. Para inferencia, cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 4090, A100, H100) es viable, aunque no hay datos de rendimiento en GPU.
- Cabe en GPU de consumo: si, por el tamano del modelo (93 MB en FP32), aunque no se han publicado mediciones en GPUs consumer.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider probado); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 1066,1 ms por imagen (0,94 FPS) en CPU Intel Xeon a 2,20 GHz con 4 hilos.

## Comparativa con modelos similares

No se dispone de datos de comparacion con otros modelos de deteccion de lesiones cutaneas en la informacion proporcionada. Como referencia de categoria, se trata de un detector YOLO de una etapa con cuatro clases; no se han publicado comparativas con alternativas como YOLOv8, YOLOv9 u otros detectores medicos en este repositorio.

| Modelo | Parametros | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|
| YOLO26l skin lesion (este) | no disponible | 768x768 px | MIT | ONNX FP32 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor advierte que las metricas de precision, latencia y rendimiento en CPU son observaciones de sus experimentos controlados y no constituyen garantia de diagnostico clinico ni de produccion.
- El conjunto de entrenamiento es pequeno (2.271 imagenes) para cuatro clases, lo que puede limitar la generalizacion a poblaciones, tonos de piel, iluminaciones y dispositivos de captura distintos.
- Riesgo de falsos negativos y falsos positivos: con una precision del 69,73 % y un recall del 79,71 %, el modelo no es adecuado como unico criterio de decision clinica.
- No se detalla la composicion del dataset ni el equilibrio entre clases, por lo que se desconoce el posible sesgo hacia clases mayoritarias.
- Solo se distribuye en FP32; no hay versiones cuantizadas (INT8, FP16) publicadas, lo que limita optimizaciones de latencia.
- La licencia MIT permite uso comercial, pero el uso en contextos medicos puede estar sujeto a regulaciones sanitarias adicionales (por ejemplo, marcado CE o aprobacion FDA) no cubiertas por la licencia.
- El modelo no realiza diagnostico ni genera informes textuales; solo devuelve cajas y clases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolo26l-skin-lesion-768-detection-tr
- Dataset relacionado: https://huggingface.co/datasets/kenantabak/evren-skin-lesion-7class-detection-tr
- Benchmark multiarquitectura CV y ONNX (GitHub): https://github.com/kenantabak/evren-multiarch-cv-onnx-benchmark
- Paquete de evaluacion y auditoria visual de errores (GitHub): https://github.com/kenantabak/evren-cv-eval-visual-audit
- Articulos tecnicos (Dev.to): https://dev.to/kenantabak

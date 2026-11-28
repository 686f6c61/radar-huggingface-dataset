# dronefreak/bdd100k-syscv-resnet34-5x-224x224-weather

## Resumen

El modelo `dronefreak/bdd100k-syscv-resnet34-5x-224x224-weather` es un clasificador de imagen basado en ResNet-34 que asigna a cada fotograma de conduccion una etiqueta meteorologica entre siete clases: `rainy`, `snowy`, `clear`, `overcast`, `undefined`, `partly cloudy` y `foggy`. No es un modelo de lenguaje ni un sistema multimodal generativo: es un cabezal de clasificacion puro (LinearClsHead sobre backbone ResNet-34) entrenado sobre el split de entrenamiento de BDD100K (70.000 imagenes) durante 60 epocas con el esquema de aumento de pasos "5x". El checkpoint es un espejo del zoo de modelos de SysCV (ETH Zurich), recuperado via Wayback Machine porque el host original `dl.cv.ethz.ch` ya no esta operativo.

El modelo resuelve un problema concreto y acotado dentro de pipelines de conduccion autonoma: el etiquetado automatico de condiciones meteorologicas por fotograma, una tarea auxiliar (tagging) que alimenta sistemas de percepcion y seleccion de datos. Con 21.305.287 parametros y un peso de repositorio de 0,2 GB, es un modelo muy ligero, pensado para inferencia de alta frecuencia sobre video. Su relevancia actual es practica: permite reproducir exactamente (hasta 1e-06 en las puntuaciones de clase) las predicciones publicadas por SysCV, algo util para validacion de pipelines de datos y para investigacion reproducible en vision para automocion.

La entrada es una imagen RGB con el lado corto redimensionado a 256 y un recorte central de 224x224, con normalizacion ImageNet. La salida es una etiqueta unica de clima mas las puntuaciones por clase. El modelo no incorpora pesos preentrenados en el backbone segun la configuracion original, y su licencia queda sujeta al acuerdo de BDD100K (uso educativo, de investigacion y sin animo de lucro).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-34 (CNN con conexiones residuales) + LinearClsHead |
| Parametros totales | 21.305.287 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224x224) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | bdd100k (educational, research and not-for-profit use) |
| Formato de pesos | safetensors (tambien `.pth` original; config en `config.json`) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-34 clasica, descrita en "Deep Residual Learning for Image Recognition" (CVPR 2016), con un cabezal lineal de clasificacion (`LinearClsHead`) sobre 7 clases de clima. El entrenamiento se realizo sobre las 70.000 imagenes de entrenamiento de BDD100K durante 60 epocas (esquema "5x"), con SGD de tasa de aprendizaje 0,1, momento 0,9, weight decay 0,0001, decaimiento de la tasa en las epocas 30 y 45, y un tamano de lote de 128 (4 GPU x 32 imagenes). El aumento de datos consistio en recortes aleatorios redimensionados a 224x224 y volteos horizontales. Segun la configuracion original, el backbone no se inicializa con pesos preentrenados.

En inferencia, la imagen se redimensiona por el lado corto a 256 (una imagen 1280x720 pasa a 455x256) y se aplica un recorte central de 224x224, con media y desviacion tipica de ImageNet. El checkpoint se distribuye en safetensors con los mismos tensores que el `.pth` original, y el MD5 de los pesos (`aa07838599e1f6798b6917c2528450e9`) coincide con el fichero MD5 publicado por SysCV. El repositorio anade un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0 sobre Python 3.10) y un script `infer.py` para imagen, carpeta, video o webcam.

## Capacidades

- Clasificacion de imagen en 7 clases meteorologicas: `rainy`, `snowy`, `clear`, `overcast`, `undefined`, `partly cloudy` y `foggy`.
- Etiquetado por fotograma sobre video: procesa ficheros de video y webcam, con opcion de limitar el numero de fotogramas (`--max-frames`).
- Salida de puntuaciones por clase ademas de la etiqueta top-1, exportable a JSON (`--json out.json`).
- Procesamiento por lotes de imagenes o carpetas completas.
- Inferencia en GPU y CPU (entornos separados `requirements-cu118.txt` y `requirements-cpu.txt`).
- No soporta tool calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas ni vision generativa: es exclusivamente un clasificador discriminativo.
- No dispone de capacidades multilingues ni de modo "thinking".

## Casos de uso

- Etiquetado automatico de datasets de conduccion: procesar grandes volumentes de imagenes o video de camara de coche para anotar la condicion meteorologica por fotograma, alimentando el entrenamiento de modelos de percepcion con metadatos de clima.
- Filtrado y seleccion de datos por condicion: identificar rapidamente los fotogramas `rainy`, `snowy` o `foggy` de un corpus para construir subconjuntos de validacion especificos de clima adverso.
- Auditoria de condiciones en flotas de captura: clasificar secuencias de video de vehiculos de recogida de datos para verificar la cobertura meteorologica de una campana de grabacion.
- Reproduccion de resultados de investigacion: al replicar exactamente las predicciones de validacion de SysCV (10.000 imagenes, diferencias de hasta 1e-06), sirve como referencia para validar pipelines de evaluacion propios.
- Preprocesado en tiempo real en sistemas embebidos o de borde: con 0,005 s/imagen en una RTX 4070 SUPER y 0,02 s/imagen en 8 hilos de CPU, es viable para etiquetado en directo de flujos de camara.
- Avisos contextuales en sistemas ADAS no criticos: aportar la etiqueta de clima como senal auxiliar a modulos de planificacion o de interfaz que ajusten el comportamiento segun lluvia, nieve o niebla.
- Control de calidad de datasets existentes: comparar las etiquetas del modelo con las anotaciones manuales de BDD100K para detectar discrepancias y casos ambiguos (por ejemplo, la clase `undefined`).

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de puntuaciones de SysCV; no verificados de forma independiente salvo la reproduccion exacta indicada en la model card):

| Metrica | val | test |
|---|---|---|
| Top-1 accuracy (%) | 81,61 | 81,06 |
| Precision (macro, 7 clases) | 72,52 | 70,96 |
| Recall (macro, 7 clases) | 63,19 | 63,27 |
| F1 (macro, 7 clases) | 65,39 | 65,86 |

Rendimiento de inferencia declarado: 0,005 s/imagen en RTX 4070 SUPER (incluyendo decodificacion JPEG) y 0,02 s/imagen en CPU con 8 hilos. No se han publicado comparaciones con otros modelos de tagging meteorologico en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 1 GB para el modelo en precision completa (21,3 M de parametros, ~85 MB en fp32) mas el overhead de activaciones de una ResNet-34 a 224x224; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA 11.8 (entorno fijado); el autor reporta 0,005 s/imagen en RTX 4070 SUPER. Modelos como RTX 3060, RTX 4090, A100 o H100 funcionaran sin problema, aunque el cuello de botella sera la decodificacion de imagen/video, no el modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el repositorio usa mmcls 0.25.0 + mmcv-full 1.7.2 con PyTorch 2.0.1; el script `infer.py` cubre imagen, carpeta, video y webcam. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador CNN de este tipo). La exportacion a ONNX no esta documentada.
- Latencia y throughput: 0,005 s/imagen en GPU (RTX 4070 SUPER, con decodificacion JPEG incluida) y 0,02 s/imagen en CPU de 8 hilos; equivale a unos 200 img/s en GPU y 50 img/s en CPU en esas condiciones.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros modelos de tagging meteorologico sobre BDD100K, por lo que la comparacion cuantitativa no esta disponible. A modo de contexto estructural:

| Modelo | Parametros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ResNet-34 weather) | 21,3 M | Clasificacion de clima (7 clases) | 224x224 | bdd100k (solo investigacion/educativo) | Hugging Face (espejo) |
| Otros modelos del zoo SysCV (tagging) | no disponible | Otras tareas de tagging BDD100K | no disponible | Apache-2.0 (config) / bdd100k (pesos) | GitHub SysCV |
| Backbones ResNet-34 genericos (ImageNet) | ~21,8 M | Clasificacion ImageNet (1000 clases) | 224x224 | BSD/Apache segun implementacion | Amplia |

La comparacion con alternativas de la misma tarea (clasificacion de clima en escenas de conduccion) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan sujetos a su licencia, limitada a uso educativo, de investigacion y sin animo de lucro. No se permite uso comercial sin autorizacion expresa.
- Modelo de espejo no oficial: los pesos se recuperaron de la Wayback Machine (captura de 2025-01-29) porque el host original de SysCV esta caido; aunque el MD5 coincide y la reproduccion es exacta, no es una publicacion oficial del autor original.
- Tarea muy acotada: solo clasifica clima; no detecta objetos, no segmenta, no estima profundidad y no genera texto. No debe presentarse como modelo multimodal.
- Rendimiento macro modesto: recall y F1 macro en torno al 63-66 % indican confusiones relevantes entre clases, especialmente en condiciones ambiguas o con la clase `undefined`.
- Riesgo de sesgo del dataset: BDD100K se grabo en entornos urbanos y condiciones de captura concretas; el rendimiento puede degradarse en dominios distintos (camaras, paises, condiciones de iluminacion extremas).
- Sin pesos preentrenados en el backbone segun la configuracion original, lo que puede limitar la generalizacion frente a variantes inicializadas en ImageNet.
- Entorno fijado y fragil: requiere torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0 sobre Python 3.10; se recomienda un entorno virtual limpio.
- Sin informacion sobre cuantizacion ni exportacion a otros formatos (ONNX, TensorRT), lo que limita el despliegue en algunos runtimes de produccion.
- No hay datos publicados sobre sesgos demograficos o geograficos especificos del checkpoint mas alla de los inherentes a BDD100K.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-resnet34-5x-224x224-weather
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-resnet34-5x-224x224-weather/blob/main/LICENSE.txt
- Zoo de modelos SysCV (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Configuracion original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/weather/resnet34_5x_224x224_weather_tag_bdd100k.py
- Paper de ResNet (CVPR 2016): https://arxiv.org/abs/1512.03385
- Dataset BDD100K (referencia): https://huggingface.co/datasets/dronefreak/BDD100K

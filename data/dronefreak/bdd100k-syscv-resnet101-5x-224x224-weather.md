# dronefreak/bdd100k-syscv-resnet101-5x-224x224-weather

## Resumen

El modelo `dronefreak/bdd100k-syscv-resnet101-5x-224x224-weather` es un clasificador de imágenes ResNet-101 entrenado para etiquetar las condiciones meteorológicas de escenas de conducción del dataset BDD100K. Asigna a cada imagen una de siete etiquetas: `rainy`, `snowy`, `clear`, `overcast`, `undefined`, `partly cloudy` o `foggy`. Se trata de un espejo (mirror) de un checkpoint del model zoo de SysCV (ETH Zurich), cuyos pesos originales estaban alojados en `dl.cv.ethz.ch`, un servidor actualmente fuera de línea; el autor recuperó los pesos desde la Wayback Machine (captura del 29 de enero de 2025) y los redistribuye junto con un entorno fijado y un script de inferencia.

El modelo tiene 42.619.847 parámetros y emplea una arquitectura ResNet-101 clásica con cabeza `LinearClsHead`, sin mecanismos de atención ni componentes generativos. Su relevancia es práctica: cubre una tarea auxiliar de percepción (etiquetado meteorológico) que resulta útil como señal de contexto en pipelines de conducción autónoma, y su reproducción exacta respecto a las predicciones publicadas por SysCV lo convierte en una referencia fiable para evaluación.

La ficha describe un modelo puramente discriminativo de visión por computador, no un modelo de lenguaje: no genera texto ni soporta tool calling. La información disponible se limita a la model card, el model-index y los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-101 (CNN con conexiones residuales) + LinearClsHead |
| Parametros totales | 42.619.847 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y .pth original) |
| Idiomas soportados | no aplica (clasificación de imágenes, sin componente lingüístico) |
| Licencia | bdd100k (educational, research and not-for-profit use); config de SysCV Apache-2.0 |
| Formato de pesos | safetensors (con los mismos tensores que el .pth original) |
| Tarea | image-classification (weather tagging) |
| Numero de clases | 7 (rainy, snowy, clear, overcast, undefined, partly cloudy, foggy) |
| Entrada | short side 256, center crop 224x224, RGB, media y desviación estándar de ImageNet |
| Libreria | mmcls 0.25.0 / mmcv-full 1.7.2 / torch 2.0.1 |
| Tamano del repo | 0.4 GB |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-101 estándar (Deep Residual Learning for Image Recognition, CVPR 2016) con una cabeza de clasificación lineal (`LinearClsHead`) de 7 salidas. No se emplean mecanismos transformer, MoE ni modelos de estado (SSM); es una CNN pura de clasificación de imágenes.

El entrenamiento se realizó sobre el split de entrenamiento de BDD100K (70.000 imágenes) durante 60 épocas (el sufijo "5x" del nombre), con SGD de learning rate 0.1, momentum 0.9, weight decay 0.0001, decaimiento del learning rate en las épocas 30 y 45, y batch de 128 (4 GPUs x 32 imágenes). Como augmentación se aplicaron recortes aleatorios redimensionados de 224x224 y volteos horizontales. El config no fija pesos preentrenados para el backbone. La configuración proviene del repositorio de SysCV (ETH Zurich) y se conserva sin cambios en `config.py`.

El autor verifica la reproducibilidad exacta: sobre las 10.000 imágenes de validación, esta copia produce la misma etiqueta que las predicciones publicadas por SysCV para cada imagen y las puntuaciones por clase coinciden con un margen de 8e-07 en GPU (RTX 4070 SUPER, CUDA 11.8, con TF32 desactivado). El MD5 de los pesos (`f992e3f7a518597f4617b779380eea2c`) coincide con el archivo MD5 de SysCV.

## Capacidades

- Clasificación de imágenes en 7 categorías meteorológicas: `rainy`, `snowy`, `clear`, `overcast`, `undefined`, `partly cloudy`, `foggy`.
- Salida de puntuaciones por clase para cada imagen o frame (opción `--json` del script de inferencia).
- Inferencia sobre imágenes sueltas, carpetas de imágenes, archivos de vídeo y webcam (`infer.py image.jpg`, `infer.py drive.mov`, `infer.py 0 --show`).
- Procesamiento frame a frame de vídeo con límite configurable (`--max-frames N`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de generación de texto, audio ni visión general más allá de la clasificación meteorológica.
- No dispone de modo "thinking" ni capacidades generativas.

## Casos de uso

- Etiquetado automático de datasets de conducción: el modelo asigna una etiqueta meteorológica a cada imagen de un conjunto de datos de escenas de tráfico, lo que permite filtrar, estratificar o auditar subconjuntos por condición climática antes de entrenar otros modelos de percepción.
- Contexto meteorológico en pipelines de conducción autónoma: la etiqueta de clima puede alimentar la lógica de decisión de un sistema (por ejemplo, activar umbrales de frenado o de detección distintos en condiciones de lluvia o nieve), dado su coste computacional bajo (0,007 s/imagen en RTX 4070 SUPER).
- Análisis de vídeo de tráfico y flotas: `infer.py` procesa archivos de vídeo frame a frame, lo que permite generar una línea temporal de condiciones meteorológicas para clips de cámara de vehículos o de vigilancia.
- Control de calidad de datos de entrenamiento: detectar imágenes mal etiquetadas o con condiciones ambiguas (clase `undefined`) para revisión manual, usando las puntuaciones por clase exportadas con `--json`.
- Investigación en percepción robusta: servir como referencia reproducible (coincidencia exacta con las predicciones de SysCV) para comparar o validar nuevas aproximaciones de etiquetado meteorológico sobre BDD100K.
- Prototipado en CPU o hardware modesto: con 0,05 s/imagen en 8 hilos de CPU, es viable para experimentos sin GPU o para preprocesado por lotes en servidores sin acelerador.
- Demostración interactiva en webcam: el script soporta captura en directo desde webcam (`infer.py 0 --show`), útil para demos o pruebas de integración en tiempo real.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los archivos de puntuaciones de SysCV; `verified: false` en el model-index). Precisión, recall y F1 son medias macro sobre las 7 clases (incluida `undefined`):

| Split | Top-1 accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| val | 81,59 % | 70,34 % | 62,79 % | 65,12 % |
| test | 81,12 % | 73,63 % | 62,80 % | 65,65 % |

Rendimiento de inferencia declarado:

| Entorno | Tiempo por imagen |
|---|---|
| RTX 4070 SUPER (incluye decodificación JPEG) | 0,007 s |
| CPU, 8 hilos | 0,05 s |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de lenguaje (no aplican a este modelo).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 42,6 M de parámetros en fp32 los pesos ocupan aproximadamente 170 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer actual.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA 11.8; el autor verificó en una RTX 4070 SUPER. Para lotes grandes, A100 o H100 aportarían mayor throughput, aunque el modelo es pequeño y no las requiere.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 4070 SUPER verificada); también funciona en CPU (0,05 s/imagen con 8 hilos).
- Opciones de despliegue: el repositorio incluye `infer.py` con entornos fijados (`env/requirements-cu118.txt` para GPU, `env/requirements-cpu.txt` para CPU) sobre torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0 en Python 3.10. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imágenes de este tipo).
- Latencia y throughput: 0,007 s/imagen en RTX 4070 SUPER (unos 143 imágenes/s) y 0,05 s/imagen en CPU de 8 hilos (unos 20 imágenes/s), según el autor.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de otros modelos de etiquetado meteorológico sobre BDD100K que permitan una comparación cuantitativa fiable. Comparación cualitativa con alternativas de la misma categoría (clasificadores de imágenes sobre BDD100K):

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ResNet-101, 5x, 224x224) | 42,6 M | imagen 224x224 | Top-1 val 81,59 % | bdd100k (solo investigación/educación) | Hugging Face (espejo) |
| Otros checkpoints del zoo SysCV (p. ej. ResNet-50) | no disponible | imagen 224x224 | no disponible en la información | Apache-2.0 (config) / bdd100k (pesos) | GitHub SysCV (host original offline) |
| Clasificadores ImageNet genéricos (p. ej. ResNet-101 preentrenado) | ~44,5 M | imagen 224x224 | no comparable (otra tarea) | variable | amplia |

La comparación cuantitativa con alternativas específicas de weather tagging queda como no disponible.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan bajo su licencia (`LICENSE.txt`), limitada a uso educativo, de investigación y sin ánimo de lucro. No está permitido el uso comercial sin autorización.
- El modelo solo clasifica condiciones meteorológicas; no detecta objetos, no segmenta y no genera texto. No debe confundirse con un modelo multimodal o de lenguaje.
- Riesgo de etiquetas ambiguas: la clase `undefined` y las condiciones mixtas (por ejemplo, `partly cloudy` frente a `overcast`) pueden producir clasificaciones discutibles; las métricas macro (F1 de 65,12 % en val) reflejan un rendimiento desigual entre clases.
- El entrenamiento usó únicamente el split de entrenamiento de BDD100K (70.000 imágenes), por lo que la generalización a dominios distintos (otras cámaras, países, resoluciones o condiciones de iluminación extremas) no está garantizada.
- No se documentan sesgos específicos más allá de los inherentes al dataset BDD100K (escenas de conducción mayoritariamente de determinadas regiones y condiciones).
- El host original de los pesos (`dl.cv.ethz.ch`) está fuera de línea; este repositorio es un espejo recuperado de la Wayback Machine. La integridad se verificó por MD5 y por coincidencia exacta de predicciones, pero la cadena de custodia original no es la oficial.
- El entorno está fijado a versiones antiguas (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0, Python 3.10); se recomienda un entorno virtual limpio y puede haber incompatibilidades con stacks más recientes.
- Los pesos se cargan con `torch.load(weights_only=True)`; no se debe confiar en checkpoints de origen desconocido sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-resnet101-5x-224x224-weather
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-resnet101-5x-224x224-weather/blob/main/LICENSE.txt
- Model zoo de SysCV (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Config de SysCV (weather, resnet101_5x_224x224): https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/weather/resnet101_5x_224x224_weather_tag_bdd100k.py
- Paper de ResNet (Deep Residual Learning for Image Recognition, CVPR 2016): https://arxiv.org/abs/1512.03385
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K

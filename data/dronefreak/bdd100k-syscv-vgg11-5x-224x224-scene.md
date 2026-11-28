# dronefreak/bdd100k-syscv-vgg11-5x-224x224-scene

## Resumen

El modelo `dronefreak/bdd100k-syscv-vgg11-5x-224x224-scene` es un clasificador de imágenes especializado en etiquetado de escenas de conducción (scene tagging) sobre el conjunto de datos BDD100K. Se trata de un espejo (mirror) de un checkpoint originalmente publicado por el equipo SysCV de la ETH Zurich dentro de su zoo de modelos para BDD100K, cuyos pesos quedaron inaccesibles al caer el host `dl.cv.ethz.ch` y fueron recuperados desde la Wayback Machine. El repositorio añade un entorno fijado y un script de inferencia para facilitar su uso.

Técnicamente es una red convolucional VGG-11 (descrita en el paper de ICLR 2015) con una cabeza de clasificación `ClsHead` de mmcls, entrenada desde cero (sin pesos preentrenados en el config) sobre las 70.000 imágenes de entrenamiento de BDD100K durante 60 épocas. La tarea consiste en asignar a cada imagen una única etiqueta de escena entre siete clases: `tunnel`, `residential`, `parking lot`, `undefined`, `city street`, `gas stations` y `highway`.

Su relevancia actual es acotada pero concreta: es una pieza de referencia reproducible para pipelines de conducción autónoma que necesiten un clasificador ligero de contexto de escena, con verificación exacta contra las predicciones publicadas por SysCV sobre las 10.000 imágenes de validación. No es un modelo de lenguaje ni un modelo multimodal generativo; es un clasificador de visión puro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VGG-11 (CNN) con ClsHead de mmcls |
| Parametros totales | 128.795.015 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224x224 RGB) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `.pth`; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | BDD100K (uso educativo, investigación y sin ánimo de lucro) |
| Formato de pesos | safetensors (`model.safetensors`) y `.pth` original |

## Arquitectura y entrenamiento

La arquitectura es una VGG-11 estándar: cinco bloques convolucionales con filtros de 3x3 y max-pooling, seguidos de una cabeza de clasificación lineal adaptada a 7 clases de escena. El config de SysCV no fija pesos preentrenados para el backbone, por lo que el entrenamiento parte de inicialización aleatoria. La entrada se preprocesa redimensionando el lado corto a 256 píxeles (una imagen 1280x720 pasa a 455x256) y aplicando un recorte central de 224x224, con normalización RGB según media y desviación estándar de ImageNet.

El entrenamiento se realizó sobre las 70.000 imágenes de `train` de BDD100K durante 60 épocas (la nomenclatura "5x" del nombre), con SGD (lr 0.01, momentum 0.9, weight decay 0.0001), decaimiento de learning rate en las épocas 30 y 45, batch de 128 (4 GPUs x 32 imágenes) y aumentación consistente en recortes redimensionados aleatorios de 224x224 y flips horizontales. No se documenta RLHF, DPO ni ninguna técnica de alineación, al no ser un modelo generativo. La innovación destacable del repositorio no está en la arquitectura sino en la reproducibilidad: verificación exacta contra las predicciones publicadas de SysCV (coincidencia de etiqueta en las 10.000 imágenes de validación y diferencias de score por debajo de 3e-06 en GPU y 8e-07 en CPU) y comprobación del MD5 de los pesos.

## Capacidades

- Clasificación de escenas de conducción en 7 clases cerradas (`tunnel`, `residential`, `parking lot`, `undefined`, `city street`, `gas stations`, `highway`).
- Procesamiento de imágenes individuales, carpetas de imágenes, vídeos y webcam mediante `infer.py`.
- Salida de la etiqueta ganadora y de todas las puntuaciones por clase en formato JSON (`--json out.json`).
- Control del número de fotogramas procesados en vídeo (`--max-frames N`).
- Inferencia en GPU (CUDA 11.8) y en CPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de audio; es exclusivamente visión.
- No dispone de modo "thinking" ni de salida de cadena de razonamiento.

## Casos de uso

- Etiquetado previo de datasets de conducción: clasificar automáticamente imágenes de BDD100K o de cámaras de vehículo en las 7 categorías de escena para filtrar, estratificar o balancear conjuntos de entrenamiento antes de entrenar detectores o segmentadores.
- Enrutado de pipelines de percepción: usar la etiqueta de escena como señal de contexto para activar o desactivar módulos especializados (por ejemplo, un detector de túneles frente a uno de autopista) en un sistema ADAS.
- Análisis de vídeo de flotas: procesar grabaciones de dashcam con `infer.py` para generar un resumen por fotograma de los tipos de escena recorridos, útil en auditoría de rutas o análisis de exposición a condiciones de conducción.
- Prototipado rápido con webcam: el modo `infer.py 0 --show` permite validar el comportamiento del clasificador en tiempo real sobre una cámara, útil para demos docentes o pruebas de concepto.
- Baseline de referencia en investigación: al reproducir exactamente las predicciones de SysCV, sirve como punto de comparación fiable al evaluar clasificadores de escena más modernos sobre BDD100K.
- Generación de metadatos para búsqueda y catalogación: poblar un índice de imágenes de conducción con etiquetas de escena para recuperación posterior por tipo de entorno.
- Verificación de pipelines de preprocesado: dado que el modelo es sensible al recorte central 224x224 y a la normalización ImageNet, se puede usar para comprobar que un pipeline de inferencia reproduce fielmente el preprocesado esperado.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de score de SysCV; `verified: false` en el model-index):

| Split | Top-1 accuracy | Precision (macro) | Recall (macro) | F1 (macro) |
|---|---|---|---|---|
| val | 77.22 | 54.77 | 39.29 | 43.58 |
| test | 77.01 | 50.14 | 37.80 | 41.60 |

Las métricas de precisión, recall y F1 son medias macro sobre las 7 clases, incluida `undefined`. La accuracy top-1 de validación (77.22 %) se reproduce exactamente con esta copia de los pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 128,8 M de parámetros en FP32 los pesos ocupan aproximadamente 0,5 GB, por lo que la VRAM necesaria es modesta (por debajo de 2 GB en la práctica, incluyendo activaciones y buffers).
- GPU recomendadas: cualquier GPU NVIDIA con CUDA 11.8; el autor reporta 0,005 s/imagen en una RTX 4070 SUPER (incluyendo decodificación JPEG).
- Cabe holgadamente en GPU de consumo: RTX 4070 SUPER verificada; por tamaño, también en gamas inferiores con suficiente VRAM.
- CPU: 0,05 s/imagen con 8 hilos; se ha verificado equivalencia de etiquetas frente a las predicciones publicadas en entorno CPU.
- Opciones de despliegue: script `infer.py` incluido, con entornos `env/requirements-cu118.txt` (GPU) y `env/requirements-cpu.txt` (CPU); stack fijado a torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0 sobre Python 3.10. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de visión de este tipo).
- Throughput estimado: unas 200 imágenes/s en RTX 4070 SUPER y unas 20 imágenes/s en CPU de 8 hilos, según los tiempos por imagen reportados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Tarea | Top-1 (BDD100K val) | Licencia |
|---|---|---|---|---|---|
| Este modelo (VGG-11 5x 224) | VGG-11 + ClsHead | 128,8 M | Scene tagging (7 clases) | 77,22 % | BDD100K (no comercial) |
| Otros modelos del zoo SysCV para tagging | no disponible en la información | no disponible | Scene tagging | no disponible | Apache-2.0 (config) / BDD100K (pesos) |
| Clasificadores genéricos tipo ResNet/EfficientNet preentrenados en ImageNet | CNN | variable | Clasificación genérica | no aplica (no entrenados en BDD100K) | variable |

No se dispone en la información proporcionada de resultados de benchmarks de modelos alternativos comparables sobre la misma tarea y split, por lo que la comparación cuantitativa con terceros queda como no disponible.

## Limitaciones y advertencias

- Licencia BDD100K: uso educativo, de investigación y sin ánimo de lucro; el uso comercial no está permitido sin autorización adicional.
- El modelo solo predice 7 clases de escena; cualquier imagen fuera de ese dominio (interiores, escenas no viarias) se etiquetará forzosamente con una de esas clases, con riesgo de asignaciones incorrectas.
- El desbalance de clases se refleja en las métricas macro: precision 54,77 %, recall 39,29 % y F1 43,58 % en validación, muy por debajo de la accuracy top-1, lo que indica bajo rendimiento en clases minoritarias.
- La clase `undefined` está incluida en el conjunto de etiquetas y en las métricas macro, lo que puede inflar o distorsionar la interpretación del rendimiento real por escena.
- Sensibilidad al preprocesado: cambios en el recorte (centro 224x224 sobre lado corto 256) o en la normalización pueden degradar los resultados y romper la reproducibilidad exacta.
- Entrenado sin pesos preentrenados, lo que limita su capacidad de generalización frente a backbones preentrenados en ImageNet.
- No es un modelo generativo: no produce texto, no razona y no admite instrucciones en lenguaje natural.
- Los pesos originales solo están disponibles gracias a una captura de Wayback Machine; la disponibilidad futura depende de este espejo y no del host original.
- El autor declara los resultados como no verificados en el model-index (`verified: false`), aunque el README documenta una verificación de reproducción independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-vgg11-5x-224x224-scene
- Repositorio SysCV BDD100K models (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Config original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/scene/vgg11_5x_224x224_scene_tag_bdd100k.py
- Paper de VGG (ICLR 2015): https://arxiv.org/abs/1409.1556
- Licencia BDD100K: https://huggingface.co/dronefreak/bdd100k-syscv-vgg11-5x-224x224-scene/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K

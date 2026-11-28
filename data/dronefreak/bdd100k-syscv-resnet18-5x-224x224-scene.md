# dronefreak/bdd100k-syscv-resnet18-5x-224x224-scene

## Resumen

El modelo `dronefreak/bdd100k-syscv-resnet18-5x-224x224-scene` es un clasificador de imágenes basado en ResNet-18 que asigna a cada fotograma una etiqueta de escena de conducción entre siete posibles: túnel, residencial, aparcamiento, indefinida, calle urbana, gasolinera y autopista. Lo publica el usuario dronefreak como espejo del modelo original del zoo de modelos BDD100K de SysCV (ETH Zurich), cuyo servidor `dl.cv.ethz.ch` está fuera de servicio; los pesos se recuperaron de una captura de Wayback Machine del 29 de enero de 2025. Es, por tanto, una reproducción fiel de un checkpoint de investigación que de otro modo sería inaccesible.

El modelo resuelve una tarea concreta de etiquetado semántico de escenas dentro del pipeline de conducción autónoma: dado un fotograma de vídeo o una imagen de cámara, devuelve la categoría de entorno. Su relevancia actual es doble: por un lado, permite reproducir exactamente los resultados publicados por SysCV (el autor verifica coincidencia fotograma a fotograma con las predicciones oficiales de validación); por otro, al estar empaquetado con un entorno fijado y un script de inferencia, facilita su uso como componente de preprocesado en sistemas de percepción o como baseline en investigación.

Arquitectura ResNet-18 estándar con `LinearClsHead`, 11,19 millones de parámetros y entrada de 224×224 píxeles. No es un modelo generativo ni un LLM: no tiene contexto textual, no soporta tool calling y no procesa lenguaje. Su ámbito es exclusivamente la clasificación de imágenes de escenas de tráfico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN con conexiones residuales) + LinearClsHead |
| Parámetros totales | 11.189.703 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantización | no disponible (el repo distribuye safetensors y `.pth` en precisión original) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | BDD100K (educational, research and not-for-profit use); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), `.pth` original, config en `config.json` |
| Tarea | image-classification (scene tagging) |
| Número de clases | 7 (tunnel, residential, parking lot, undefined, city street, gas stations, highway) |
| Resolución de entrada | 224×224 (redimensionado lado corto a 256 + recorte central) |
| Librería | mmcls 0.25.0 / mmcv-full 1.7.2 / torch 2.0.1 |
| Tamaño del repo | 0.1 GB |

## Arquitectura y entrenamiento

ResNet-18 clásica, descrita en *Deep Residual Learning for Image Recognition* (CVPR 2016), con bloques residuales básicos y una cabeza de clasificación lineal (`LinearClsHead`) sobre las 7 clases de escena. La entrada sigue el preprocesado estándar de ImageNet: lado corto redimensionado a 256 (una imagen 1280×720 pasa a 455×256), recorte central de 224×224, canales RGB y normalización con media y desviación típica de ImageNet.

El entrenamiento se realizó sobre las 70.000 imágenes de entrenamiento de BDD100K durante 60 épocas (el sufijo "5x" del nombre), con SGD (lr 0.1, momentum 0.9, weight decay 0.0001), decaimiento de la tasa de aprendizaje en las épocas 30 y 45, batch de 128 (4 GPUs × 32 imágenes), recortes aleatorios redimensionados a 224×224 y volteos horizontales. El backbone se inicializa sin pesos preentrenados según la configuración de SysCV. No se documenta uso de RLHF/DPO (no aplica a un clasificador) ni innovaciones de atención; es una CNN convolucional convencional.

## Capacidades

- Clasificación de escenas de conducción en 7 categorías: túnel, residencial, aparcamiento, indefinida, calle urbana, gasolinera y autopista.
- Inferencia sobre imágenes individuales, carpetas de imágenes, archivos de vídeo y webcam (script `infer.py`).
- Salida de la etiqueta predicha y de las puntuaciones de todas las clases, con exportación opcional a JSON (`--json out.json`).
- Control del número de fotogramas procesados en vídeo (`--max-frames N`).
- Funcionamiento en GPU (CUDA 11.8) y en CPU (entorno separado con 8 hilos).
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión general fuera de escenas de tráfico, audio ni modo "thinking".

## Casos de uso

- Etiquetado automático de escenas en datasets de conducción: procesar lotes de imágenes o vídeos de BDD100K (o de cámaras propias) para asignar la etiqueta de escena y generar metadatos de entrenamiento para modelos posteriores de percepción o planificación.
- Preprocesado en pipelines de conducción autónoma: clasificar cada fotograma antes de decidir qué submódulo activar (por ejemplo, priorizar detección de peatones en escena residencial o ajustar parámetros en túnel), dado que la inferencia tarda 0,005 s/imagen en RTX 4070 SUPER.
- Filtrado y segmentación de vídeo por entorno: dividir grabaciones largas en tramos de autopista, urbano o aparcamiento usando `--max-frames` y la salida JSON, útil para anotación semiautomática o búsqueda de clips.
- Análisis de flotas y telemetría: etiquetar clips de cámaras de vehículos para estadísticas de distribución de escenas por ruta, con coste computacional bajo (11,2 M de parámetros, 0,1 GB de repo).
- Baseline de investigación en clasificación de escenas: reproducir exactamente las predicciones de SysCV (verificado con diferencia máxima de 2e-06 en las puntuaciones) como referencia para comparar nuevos modelos de tagging.
- Demostración en tiempo real con webcam: el script `infer.py 0 --show` permite visualizar la etiqueta de escena en directo, adecuado para prototipos y validación cualitativa en un portátil con CPU (0,01 s/imagen en 8 hilos).
- Recuperación de artefactos de investigación: al estar los pesos originales alojados en un servidor caído, este espejo sirve para reproducir experimentos históricos de SysCV sin depender de `dl.cv.ethz.ch`.

## Benchmarks y rendimiento

Resultados declarados por SysCV (recogidos en la model card; `verified: false` en el model-index, aunque el autor del espejo verifica la reproducción exacta):

| Conjunto | Top-1 accuracy | Precision (macro) | Recall (macro) | F1 (macro) |
|---|---|---|---|---|
| BDD100K val | 77,84 % | 58,95 % | 46,26 % | 48,72 % |
| BDD100K test | 77,11 % | 52,45 % | 42,48 % | 43,69 % |

Las métricas de precision, recall y F1 son medias macro sobre las 7 clases, incluida `undefined`. El autor del espejo confirma que, sobre las 10.000 imágenes de validación, este checkpoint produce la misma etiqueta que las predicciones publicadas de SysCV para cada imagen, con diferencias en las puntuaciones de clase inferiores a 2e-06 en GPU y 4e-07 en CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de cientos de MB para un modelo de 11,2 M de parámetros en FP32 (el repo no publica una cifra exacta).
- GPU recomendadas: cualquier GPU NVIDIA con CUDA 11.8; el autor reporta 0,005 s/imagen en una RTX 4070 SUPER (incluyendo decodificación JPEG).
- Cabe sobradamente en GPU de consumo (RTX 4070 SUPER, y por tamaño cualquier RTX 30/40 o superior) y también en CPU: 0,01 s/imagen con 8 hilos.
- Opciones de despliegue: entorno fijado con `mmcls` 0.25.0, `mmcv-full` 1.7.2 y `torch` 2.0.1 sobre Python 3.10 (requisitos `env/requirements-cu118.txt` o `env/requirements-cpu.txt`); script `infer.py` para imagen, carpeta, vídeo o webcam. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 0,005 s/imagen en RTX 4070 SUPER y 0,01 s/imagen en CPU de 8 hilos, según el autor.

## Comparativa con modelos similares

No se han publicado en la información disponible comparativas con otros modelos de tagging de escenas de BDD100K. Como referencia arquitectónica, el propio zoo de SysCV incluye otras variantes de tagging (por ejemplo, configuraciones ResNet con distintos regímenes de entrenamiento), pero no se dispone de sus métricas en esta ficha.

| Modelo | Parámetros | Tarea | Top-1 (BDD100K val) | Licencia |
|---|---|---|---|---|
| Este modelo (ResNet-18 5x, 224) | 11,19 M | Scene tagging (7 clases) | 77,84 % | BDD100K (uso educativo/investigación) |
| Otras variantes del zoo SysCV | no disponible | Scene tagging | no disponible | Apache-2.0 (config) / BDD100K (pesos) |

## Limitaciones y advertencias

- Modelo de clasificación de escenas, no generativo: no produce texto, no razona y no responde a instrucciones; cualquier uso fuera de etiquetado de imágenes de tráfico es inadecuado.
- Rendimiento moderado en clases minoritarias: la precision y el recall macro (58,95 % y 46,26 % en validación) son muy inferiores al Top-1, lo que indica confusión entre clases y posible desequilibrio del dataset.
- La clase `undefined` forma parte del conjunto de etiquetas y puede absorber imágenes ambiguas, reduciendo la utilidad práctica de la etiqueta predicha.
- Entrenado exclusivamente con BDD100K (escenas de conducción de determinadas regiones y condiciones); puede generalizar mal a otros dominios, países, condiciones meteorológicas extremas o cámaras no viales.
- No hay información sobre sesgos demográficos o geográficos más allá de lo implícito en el dataset BDD100K.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas con alta confianza en escenas atípicas.
- Licencia BDD100K: uso educativo, de investigación y sin ánimo de lucro; el uso comercial requiere revisar los términos del dataset original. La configuración de SysCV es Apache-2.0, pero los pesos entrenados sobre BDD100K quedan sujetos a la licencia del dataset.
- El espejo depende de una recuperación vía Wayback Machine; la procedencia de los pesos está documentada (MD5 `c6ea61fddbb73c55ee47c3373a63d528` coincide con el de SysCV), pero conviene verificar la integridad en producción.
- Requiere un entorno Python antiguo y fijado (torch 2.0.1, mmcv-full 1.7.2, Python 3.10); no es trivial integrarlo en stacks modernos sin un venv dedicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-resnet18-5x-224x224-scene
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-resnet18-5x-224x224-scene/blob/main/LICENSE.txt
- Zoo de modelos BDD100K de SysCV (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Config de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/scene/resnet18_5x_224x224_scene_tag_bdd100k.py
- Paper de ResNet: https://arxiv.org/abs/1512.03385
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper de BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687

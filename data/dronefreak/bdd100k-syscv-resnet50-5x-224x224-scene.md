# dronefreak/bdd100k-syscv-resnet50-5x-224x224-scene

## Resumen

El modelo `dronefreak/bdd100k-syscv-resnet50-5x-224x224-scene` es un espejo (mirror) de un clasificador de escenas de conducción entrenado sobre el conjunto de datos BDD100K y publicado originalmente en el zoo de modelos de SysCV (ETH Zurich). Se trata de un ResNet-50 con cabeza de clasificación lineal (`LinearClsHead`) que asigna a cada imagen una única etiqueta de escena entre siete posibles: túnel, residencial, aparcamiento, indefinido, calle urbana, gasolinera y autopista. El repositorio recupera los pesos desde la Wayback Machine (captura del 29 de enero de 2025) porque el host original `dl.cv.ethz.ch` está fuera de servicio, y añade un entorno fijado y un script de inferencia.

El modelo resuelve una tarea de clasificación de imagen muy concreta: el etiquetado de escena (scene tagging) para datos de conducción autónoma. Con 23.575.495 parámetros, es un modelo compacto que se ejecuta a 0,005 s/imagen en una RTX 4070 SUPER (incluyendo decodificación JPEG) y a 0,03 s/imagen con 8 hilos de CPU. Su relevancia actual es doble: por un lado, preserva un checkpoint de investigación que de otro modo se habría perdido al caer el servidor original; por otro, ofrece una reproducción exacta verificada (mismas etiquetas y puntuaciones con diferencia máxima de 1e-06 en GPU) frente a las predicciones publicadas por SysCV.

La arquitectura es una CNN clásica (ResNet-50, CVPR 2016), no un transformer, y el contexto de aplicación es la visión por computador para automoción. El modelo no procesa texto ni lenguaje natural: es un clasificador de imágenes puro. La licencia es la de BDD100K, que restringe el uso a fines educativos, de investigación y sin ánimo de lucro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN con conexiones residuales) + LinearClsHead |
| Parametros totales | 23.575.495 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada 224x224 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y .pth; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | bdd100k (educational, research and not-for-profit use) |
| Formato de pesos | safetensors, .pth (PyTorch), config.json |
| Framework | mmcls 0.25.0, mmcv-full 1.7.2, torch 2.0.1, Python 3.10 |
| Entrada | lado corto redimensionado a 256, recorte central 224x224, RGB, media y desviación estándar de ImageNet |
| Clases | 7 (tunnel, residential, parking lot, undefined, city street, gas stations, highway) |
| Tamaño del repo | 0.2 GB |

## Arquitectura y entrenamiento

El modelo es un ResNet-50 estándar (Deep Residual Learning for Image Recognition, CVPR 2016) con una cabeza de clasificación lineal (`LinearClsHead`) de 7 clases. La configuración no fija pesos preentrenados para el backbone, es decir, se entrena desde cero sobre BDD100K. El entrenamiento usa el split de train de BDD100K (70.000 imágenes), con 60 épocas (esquema 5x), SGD con learning rate 0,1, momentum 0,9 y weight decay 0,0001, con decaimiento del learning rate en las épocas 30 y 45. El batch es de 128 (4 GPUs x 32 imágenes) y la aumentación consiste en recortes aleatorios redimensionados a 224x224 y volteos horizontales.

En inferencia, la imagen se redimensiona por el lado corto a 256 (una imagen de 1280x720 pasa a 455x256) y se aplica un recorte central de 224x224, normalizando con la media y desviación estándar de ImageNet. No se documenta el uso de RLHF, DPO ni técnicas de decodificación especulativa, ya que no es un modelo generativo. La innovación técnica relevante de este repositorio no está en el modelo en sí, sino en la recuperación y verificación del checkpoint: se confirma que la copia reproduce exactamente las predicciones publicadas por SysCV en las 10.000 imágenes de validación, con coincidencia de etiquetas en todas ellas y diferencias de puntuación de hasta 1e-06, además de coincidir el MD5 de los pesos (`cf75e1f6d54aec1988c4bcd5bad74882`).

## Capacidades

- Clasificación de imagen: asigna una etiqueta de escena entre 7 clases (túnel, residencial, aparcamiento, indefinido, calle urbana, gasolinera, autopista).
- Procesamiento de imágenes individuales, carpetas de imágenes, vídeo y webcam mediante el script `infer.py`.
- Salida de puntuaciones por clase y exportación a JSON (`--json out.json`).
- Control del número de fotogramas procesados en vídeo (`--max-frames N`).
- Ejecución en GPU (CUDA 11.8) y en CPU (entorno separado).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador visual puro.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Etiquetado automático de datasets de conducción: el modelo clasifica cada imagen de BDD100K o de un dataset propio en una de las 7 categorías de escena, lo que permite enriquecer metadatos y filtrar por tipo de entorno antes de entrenar otros modelos (detección de objetos, segmentación).
- Filtrado y curación de datasets: dado un conjunto masivo de imágenes de dashcam, el modelo permite separar rápidamente escenas urbanas de autopistas o túneles para construir subconjuntos equilibrados o evaluar la cobertura de dominios.
- Preprocesado en pipelines de percepción: la etiqueta de escena puede condicionar la selección de modelos downstream (por ejemplo, un detector distinto para autopista que para calle urbana) en un sistema de percepción modular.
- Análisis de vídeo de flotas: procesando vídeo a 0,005 s/fotograma en GPU, se puede etiquetar la escena fotograma a fotograma de grabaciones de flota para auditar rutas, detectar tramos de autopista o túneles y generar informes de contexto.
- Investigación en clasificación de escenas: sirve como baseline reproducible para comparar nuevas arquitecturas o estrategias de aumentación sobre BDD100K, con la ventaja de que las predicciones de referencia están verificadas y disponibles.
- Docencia y reproducción de experimentos: el entorno fijado (Python 3.10, torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0) y la verificación exacta permiten usar el modelo como ejemplo práctico de reproducibilidad en visión por computador.
- Prototipado rápido en CPU: con 0,03 s/imagen en 8 hilos, es viable etiquetar lotes moderados en máquinas sin GPU para pruebas o demos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (procedentes de los ficheros de puntuación de SysCV), sobre BDD100K:

| Split | Top-1 accuracy | Precision (macro) | Recall (macro) | F1 (macro) |
|---|---|---|---|---|
| val | 77,66 | 66,50 | 45,86 | 47,67 |
| test | 77,17 | 45,98 | 42,01 | 43,46 |

Las métricas de precisión, recall y F1 son medias macro sobre las 7 clases (incluyendo `undefined`). El valor de Top-1 accuracy en validación (77,66 %) ha sido reproducido de forma exacta por esta copia del checkpoint sobre las 10.000 imágenes de validación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 23,5 M de parámetros, el modelo en fp32 ocupa aproximadamente 94 MB de pesos, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA 11.8; el autor reporta 0,005 s/imagen en una RTX 4070 SUPER (incluyendo decodificación JPEG).
- Cabe en GPU consumer: sí, en cualquier GPU moderna (RTX 4070 SUPER verificada; modelos inferiores son igualmente suficientes por el reducido tamaño).
- CPU: 0,03 s/imagen con 8 hilos; existe un entorno específico `env/requirements-cpu.txt`.
- Opciones de despliegue: el repositorio proporciona `infer.py` sobre mmcls/mmcv; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un clasificador CNN de este tipo).
- Latencia y throughput: 0,005 s/imagen en GPU (≈200 imágenes/s) y 0,03 s/imagen en CPU de 8 hilos (≈33 imágenes/s), según el autor.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos alternativos de clasificación de escenas sobre BDD100K, por lo que la comparación cuantitativa no está disponible. A modo de contexto estructural:

| Modelo | Arquitectura | Parámetros | Tarea | Licencia |
|---|---|---|---|---|
| Este modelo (ResNet-50, 5x, 224) | ResNet-50 + LinearClsHead | 23,5 M | Clasificación de escena (7 clases) | bdd100k (solo investigación) |
| Otras variantes del zoo SysCV | no disponible | no disponible | Clasificación de escena | Apache-2.0 (config) / bdd100k (pesos) |
| Clasificadores ImageNet genéricos | ResNet/ViT | variable | Clasificación genérica (1000 clases) | variable |

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse solo con BDD100K (70.000 imágenes de train), hereda los sesgos de ese dataset en cuanto a geografía, condiciones meteorológicas, hora del día y tipo de vías; el rendimiento puede degradarse en dominios no representados.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea; la clase `undefined` y las métricas macro de precisión (66,50 en val) y recall (45,86 en val) indican un desequilibrio notable entre clases.
- Limitaciones de contexto o idioma: no procesa texto ni lenguaje; la entrada es una imagen 224x224 tras redimensionado y recorte central, lo que puede perder información de los bordes de la imagen original.
- Restricciones de licencia: los pesos están bajo la licencia de BDD100K, limitada a uso educativo, de investigación y sin ánimo de lucro; el uso comercial requiere revisar los términos de BDD100K. La configuración de SysCV es Apache-2.0.
- Caveat para producción: el host original de pesos (`dl.cv.ethz.ch`) está caído; este repositorio es un espejo recuperado vía Wayback Machine, aunque verificado contra las predicciones y el MD5 originales.
- Dependencias frágiles: requiere un entorno fijado (Python 3.10, torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0); se recomienda un venv limpio.
- El modelo asigna una sola etiqueta por imagen; no proporciona localización ni múltiples etiquetas simultáneas.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-resnet50-5x-224x224-scene
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-resnet50-5x-224x224-scene/blob/main/LICENSE.txt
- Zoo de modelos SysCV (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Config de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/scene/resnet50_5x_224x224_scene_tag_bdd100k.py
- Paper del backbone (ResNet, CVPR 2016): https://arxiv.org/abs/1512.03385
- Dataset BDD100K: https://huggingface.co/datasets/dronefreak/BDD100K

# dronefreak/bdd100k-syscv-vgg16-5x-224x224-scene

## Resumen

Este repositorio es un espejo del modelo de etiquetado de escenas (scene tagging) VGG-16 del zoo de modelos de BDD100K publicado por SysCV (ETH Zurich). Clasifica una imagen de conducción en una de siete categorías de escena: túnel, residencial, aparcamiento, indefinida, calle urbana, gasolinera y autopista. El modelo original se alojaba en `dl.cv.ethz.ch`, un host actualmente fuera de servicio, por lo que los pesos se recuperaron desde la Wayback Machine (captura del 29 de enero de 2025) y se publican aquí junto con un entorno fijado y un script de inferencia.

Técnicamente es una CNN VGG-16 (paper ICLR 2015, arXiv:1409.1556) con una cabeza de clasificación `ClsHead` de mmcls, entrenada desde cero sobre las 70.000 imágenes de entrenamiento de BDD100K durante 60 épocas (configuración "5x"). Cuenta con 134.289.223 parámetros y un tamaño de repositorio de 1,1 GB, con pesos en safetensors y en `.pth`. La entrada es una imagen redimensionada por el lado corto a 256 píxeles y recortada al centro a 224x224, en RGB con media y desviación típica de ImageNet.

Su relevancia es práctica: recupera un checkpoint de referencia del benchmark BDD100K que ya no era descargable desde su origen, con verificación de reproducción exacta frente a las predicciones publicadas por SysCV. No es un modelo de propósito general ni un LLM: es un clasificador de imagen especializado, útil como componente de etiquetado previo en pipelines de conducción autónoma o para investigación comparativa. La licencia BDD100K restringe el uso a fines educativos, de investigación y sin ánimo de lucro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VGG-16 (CNN) con cabeza de clasificación `ClsHead` de mmcls |
| Parametros totales | 134.289.223 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224x224 tras resize a lado corto 256) |
| Tipos de cuantizacion | no disponible (solo se documentan pesos completos en safetensors y `.pth`) |
| Idiomas soportados | no disponible (clasificación de imágenes, sin componente textual) |
| Licencia | BDD100K (`license: other`, `license_name: bdd100k`); uso educativo, de investigación y sin ánimo de lucro |
| Formato de pesos | safetensors (`model.safetensors`) y `.pth` original |
| Numero de clases | 7 (tunnel, residential, parking lot, undefined, city street, gas stations, highway) |
| Entrada | RGB, resize lado corto 256, recorte central 224x224, media y std de ImageNet |
| Libreria | mmcls 0.25.0, mmcv-full 1.7.2, torch 2.0.1, Python 3.10 |
| Tamano del repo | 1,1 GB |

## Arquitectura y entrenamiento

La arquitectura es una VGG-16 clásica (13 capas convolucionales con filtros de 3x3 y tres capas totalmente conectadas) seguida de una cabeza de clasificación de mmcls. Según la model card, en la configuración no se fijan pesos preentrenados para el backbone: el modelo se entrena desde inicialización aleatoria sobre las 70.000 imágenes de entrenamiento de BDD100K. El entrenamiento se ejecuta durante 60 épocas (la variante "5x" del zoo de SysCV), con SGD de tasa de aprendizaje 0,01, momento 0,9, weight decay 0,0001, decaimientos de la tasa en las épocas 30 y 45, y batch de 128 (4 GPU x 32 imágenes). La aumentación consiste en recortes aleatorios redimensionados a 224x224 y volteos horizontales.

No se documenta ningún tipo de ajuste por refuerzo (RLHF/DPO), decodificación especulativa ni mecanismos de atención lineal, algo esperable en una CNN de clasificación de 2014. La innovación relevante de este repositorio no está en el modelo sino en la recuperación y verificación del checkpoint: los pesos se validan con MD5 (`9868da1dc9545b312bac3c1e8e858de2`) frente al fichero de SysCV, se comprueba que todas las claves cargan en la configuración original y se reproduce exactamente la etiqueta predicha por SysCV en las 10.000 imágenes de validación, con diferencias de puntuación por clase inferiores a 1e-06 en GPU (RTX 4070 SUPER, CUDA 11.8, TF32 desactivado) y de 4e-07 en CPU sobre 20 imágenes.

## Capacidades

- Clasificación de escena de conducción en 7 clases cerradas (túnel, residencial, aparcamiento, indefinida, calle urbana, gasolinera, autopista).
- Etiquetado por imagen individual o por fotograma de vídeo (el script `infer.py` acepta imagen, carpeta de imágenes, fichero de vídeo o webcam).
- Salida de la etiqueta top-1 y, con `--json`, de todas las puntuaciones por clase para cada imagen o fotograma.
- Procesamiento por lotes con límite configurable de fotogramas (`--max-frames N`).
- Ejecución en GPU NVIDIA (CUDA 11.8) y en CPU (entorno separado `requirements-cpu.txt`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador de imagen.
- No dispone de capacidades multilingües, de visión general, de audio ni de modo "thinking".

## Casos de uso

- Etiquetado previo de datasets de conducción: clasificar automáticamente grandes volúmenes de imágenes en las 7 categorías de escena para filtrar, estratificar o muestrear subconjuntos antes de entrenar otros modelos; la velocidad de 0,007 s/imagen en una RTX 4070 SUPER lo hace viable sobre decenas de miles de imágenes.
- Enrutado contextual en pipelines de percepción: usar la etiqueta de escena (por ejemplo, túnel frente a autopista) para activar o desactivar módulos posteriores, como ajustes de exposición, detección de señales o parámetros de planificación específicos del entorno.
- Análisis de vídeo de flotas o dashcams: procesar ficheros de vídeo fotograma a fotograma con `infer.py` para obtener una línea temporal de escenas y detectar transiciones (por ejemplo, entrada y salida de túnel) en grabaciones largas.
- Investigación comparativa en BDD100K: servir como baseline reproducible de scene tagging con accuracy top-1 de 77,57 % en validación, útil para contrastar arquitecturas más modernas bajo el mismo protocolo y conjunto de datos.
- Prototipado rápido en robótica y vehículos a escala: al caber en CPU (0,09 s/imagen con 8 hilos) y en GPU de consumo, permite integrar el clasificador en sistemas embebidos o bancos de pruebas sin infraestructura de servidor.
- Verificación de calidad de datos: detectar imágenes mal etiquetadas o fuera de distribución en un dataset de conducción comparando la etiqueta anotada con la predicha, y revisar manualmente solo las discrepancias.
- Demostraciones interactivas: el modo webcam (`python infer.py 0 --show`) permite mostrar en tiempo real la etiqueta de escena, adecuado para demos docentes o pruebas de concepto.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (procedentes de los ficheros de puntuación de SysCV). Accuracy en %; precisión, recall y F1 son medias macro sobre las 7 clases, incluida `undefined`:

| Conjunto | Top-1 accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| val | 77,57 | 53,46 | 39,44 | 43,90 |
| test | 77,23 | 52,42 | 38,85 | 43,31 |

El autor indica que la métrica de validación no está verificada de forma independiente (`verified: false`), aunque documenta la reproducción exacta de las etiquetas de SysCV en las 10.000 imágenes de validación, con accuracy top-1 resultante de 77,57 %. No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), que además no aplican a un clasificador de imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 134 millones de parámetros en fp32 los pesos ocupan aproximadamente 0,5 GB, por lo que cualquier GPU con 2 GB o más debería ser suficiente (estimación a partir del recuento de parámetros, no dato del autor).
- GPU recomendadas: el autor valida en una RTX 4070 SUPER (0,007 s/imagen incluyendo decodificación JPEG); no se documentan pruebas en A100, H100 ni otras GPU de datacenter.
- Cabe en GPU de consumo: sí, según la validación en RTX 4070 SUPER; también funciona en CPU (0,09 s/imagen con 8 hilos).
- Opciones de despliegue: el repositorio proporciona `infer.py` con entornos fijados (`env/requirements-cu118.txt` para NVIDIA y `env/requirements-cpu.txt` para CPU) sobre torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 0,007 s/imagen en RTX 4070 SUPER (unos 143 imágenes/s) y 0,09 s/imagen en CPU de 8 hilos (unas 11 imágenes/s), según el autor.
- Carga de pesos: `torch.load(weights_only=True)`; se recomienda un entorno virtual nuevo por los pins estrictos de versiones.

## Comparativa con modelos similares

No se han publicado en la información disponible comparativas con otros modelos de scene tagging sobre BDD100K. Como referencia de categoría, el propio zoo de SysCV incluye otras variantes de etiquetado (por ejemplo, configuraciones con distintos backbones y factores de entrenamiento), pero no se aportan sus métricas en esta ficha. Tampoco se dispone de datos de clasificadores genéricos de escena (Places365, etc.) evaluados sobre las 7 clases de BDD100K, por lo que la comparación cuantitativa queda como no disponible.

| Modelo | Parametros | Contexto/entrada | Top-1 (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (VGG-16, 5x, 224x224) | 134.289.223 | 224x224 | 77,57 | BDD100K (solo investigación) | Hugging Face (espejo) |
| Otras variantes del zoo SysCV | no disponible | no disponible | no disponible | Apache-2.0 (config) | GitHub SysCV |
| Clasificadores genéricos de escena | no disponible | no disponible | no disponible | variable | variable |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se rigen por la licencia de BDD100K, limitada a uso educativo, de investigación y sin ánimo de lucro; no se permite uso comercial sin autorización adicional.
- Clases cerradas: solo distingue 7 categorías de escena; cualquier entorno fuera de ellas se asignará probablemente a `undefined` o a la clase más parecida, sin garantías.
- Métricas macro bajas: aunque la accuracy top-1 es del 77,57 %, la precisión, el recall y el F1 macro (53,46 / 39,44 / 43,90) indican un rendimiento desigual entre clases, probablemente por desequilibrio del dataset; conviene revisar las puntuaciones por clase antes de usarlo en producción.
- Riesgo de error en condiciones difíciles: al ser una VGG-16 entrenada desde cero con recortes de 224x224, la resolución de entrada es baja para escenas de conducción y puede degradarse en nocturnidad, lluvia o imágenes muy cargadas.
- Sin preentrenamiento en ImageNet: el backbone se inicializa aleatoriamente según la configuración, lo que limita su capacidad de generalización frente a backbones preentrenados.
- Sesgos del dataset: BDD100K está recogido en entornos de conducción de determinadas regiones y condiciones; el modelo hereda los sesgos geográficos, climáticos y de composición del conjunto.
- Modelo antiguo: no incorpora innovaciones modernas (atención, preentrenamiento a gran escala); su valor es como baseline reproducible, no como estado del arte.
- Dependencias frágiles: requiere versiones fijadas de torch, mmcv-full y mmcls en Python 3.10; mezclar con otros entornos puede romper la carga de pesos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza en escenas ambiguas.
- Privacidad: las imágenes de conducción pueden contener matrículas y rostros; el autor indica que las secuencias de la demo se revisaron fotograma a fotograma, pero el usuario debe aplicar sus propias salvaguardas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-vgg16-5x-224x224-scene
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-vgg16-5x-224x224-scene/blob/main/LICENSE.txt
- Zoo de modelos BDD100K de SysCV (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Configuración original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/scene/vgg16_5x_224x224_scene_tag_bdd100k.py
- Paper de VGG (arXiv:1409.1556): https://arxiv.org/abs/1409.1556
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper de BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687

# dronefreak/bdd100k-syscv-dla34-5x-224x224-scene

## Resumen

DLA-34 Scene Tagging es un clasificador de imágenes especializado en etiquetar escenas de conducción. Asigna a cada fotograma una única etiqueta entre siete clases: túnel, residencial, aparcamiento, indefinido, calle urbana, gasolinera y autopista. Lo desarrolla el grupo SysCV de la ETH Zurich dentro de su *model zoo* de BDD100K, y esta ficha corresponde a un espejo publicado por el usuario `dronefreak` que recupera los pesos originales desde la Wayback Machine, ya que el host `dl.cv.ethz.ch` está fuera de servicio.

El modelo se basa en la arquitectura DLA-34 (Deep Layer Aggregation, CVPR 2018) configurada como clasificador con una `ClsHead` de MMClassification. Con 15.290.679 parámetros, es un modelo compacto pensado para inferencia rápida en entornos de vehículo o en pipelines de etiquetado de datasets, no para generación de texto ni tareas multimodales. Su relevancia actual reside en que permite reproducir exactamente los resultados publicados por SysCV sobre BDD100K y sirve como componente auxiliar en sistemas de conducción autónoma que necesitan un contexto de escena previo a la detección o segmentación.

El repositorio incluye un entorno fijado (PyTorch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0 sobre Python 3.10) y un script `infer.py` que acepta imágenes, vídeos o webcam, además de los pesos en `safetensors` y las predicciones de validación archivadas para verificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DLA-34 (Deep Layer Aggregation) como backbone + ClsHead de MMClassification |
| Parametros totales | 15.290.679 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de clase están en inglés) |
| Licencia | BDD100K (`license: other`, uso educativo, investigación y sin ánimo de lucro) |
| Formato de pesos | safetensors (`model.safetensors`) y `.pth` equivalente en `original/` |

## Arquitectura y entrenamiento

El modelo emplea DLA-34, una red convolucional con agregación jerárquica de capas que combina conexiones de agregación iterativa y profunda para fusionar características a distintas escalas. Sobre el backbone se monta una `ClsHead` de MMClassification que produce logits para las siete clases de escena. La configuración no fija pesos preentrenados para el backbone, por lo que el entrenamiento parte de inicialización aleatoria.

El entrenamiento se realizó sobre las 70.000 imágenes del split de train de BDD100K durante 60 épocas (régimen 5x), con SGD de learning rate 0.1, momentum 0.9 y weight decay 0.0001, aplicando decaimiento del learning rate en las épocas 30 y 45. El batch fue de 128 imágenes (4 GPU x 32) con recortes aleatorios de 224x224 y volteos horizontales. En inferencia, el lado corto se redimensiona a 256 (una imagen 1280x720 pasa a 455x256) y se aplica un recorte central de 224x224 con normalización ImageNet (media y desviación típica RGB).

## Capacidades

- Clasificación de escenas de conducción en siete categorías: túnel, residencial, aparcamiento, indefinido, calle urbana, gasolinera y autopista.
- Procesamiento de imágenes individuales, carpetas de imágenes, archivos de vídeo y flujo de webcam mediante `infer.py`.
- Salida de la etiqueta predicha y de las puntuaciones de todas las clases, con opción `--json` para exportar resultados por imagen o fotograma.
- Control del número de fotogramas procesados en vídeo mediante `--max-frames`.
- Inferencia en GPU (CUDA 11.8) y en CPU (entorno específico con 8 hilos).
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, visión general, audio ni capacidades multilingües.

## Casos de uso

- Etiquetado automático de datasets de conducción: el modelo clasifica cada fotograma de un vídeo o cada imagen de un directorio con una etiqueta de escena, lo que permite preanotar grandes volúmenes de datos antes de una revisión humana. Es adecuado por su velocidad (0,005 s/imagen en RTX 4070 SUPER) y su precisión Top-1 del 77,64 % en validación.
- Contexto previo para pipelines de percepción: en un sistema de conducción autónoma, la etiqueta de escena (por ejemplo, túnel o autopista) puede condicionar los umbrales de detección, la política de exposición de la cámara o la selección de modelos posteriores.
- Filtrado y curación de datasets: permite separar imágenes de escenas urbanas, residenciales o de aparcamiento para construir subconjuntos balanceados o para auditar la composición de un dataset existente.
- Monitorización de flotas y vehículos conectados: clasificación en tiempo casi real de fotogramas de cámara para registrar en qué tipo de escena circula cada vehículo, con despliegue en GPU de consumo o incluso en CPU.
- Reproducción de experimentos académicos: al incluir las predicciones de validación de SysCV y verificación de MD5, sirve como referencia reproducible para comparar nuevas arquitecturas de clasificación de escenas sobre BDD100K.
- Sistemas de asistencia en entornos con recursos limitados: con 15,3 millones de parámetros y 0,1 GB de repositorio, puede integrarse en dispositivos embebidos o en contenedores ligeros sin necesidad de aceleradores de gran tamaño.
- Análisis de vídeo retrospectivo: procesamiento por lotes de grabaciones de dashcam para segmentar trayectos por tipo de escena y generar informes o índices de búsqueda.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (procedentes de los ficheros de puntuaciones de SysCV), sobre BDD100K. Precisión, exhaustividad y F1 son medias macro sobre las siete clases, incluida `undefined`.

| Split | Top-1 accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| val | 77,64 % | 65,44 % | 46,35 % | 48,50 % |
| test | 77,13 % | 50,71 % | 45,01 % | 46,33 % |

El autor indica que la reproducción es exacta: sobre las 10.000 imágenes de validación, esta copia asigna la misma etiqueta que las predicciones publicadas por SysCV para todas las imágenes, con diferencias en las puntuaciones de clase inferiores a 2e-06 en GPU y 8e-07 en CPU. El MD5 de los pesos (`92cc4649c6abe3604f900bfbc14f76b5`) coincide con el fichero de SysCV. No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de texto, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en precisión completa (15,3 millones de parámetros en FP32), más el espacio de activaciones para un lote pequeño; no se documenta una cifra oficial.
- GPU recomendadas: cualquier GPU con soporte CUDA 11.8; el autor reporta 0,005 s/imagen en una RTX 4070 SUPER (incluyendo decodificación JPEG). Funciona igualmente en A100, H100 y RTX 4090, aunque no se aportan cifras específicas para ellas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con al menos unos pocos GB de VRAM; también se ha validado en CPU.
- Despliegue: el repositorio proporciona `infer.py` con entornos fijados para CUDA 11.8 y CPU (PyTorch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0, Python 3.10). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 0,005 s/imagen en RTX 4070 SUPER y 0,02 s/imagen en CPU con 8 hilos, según el autor.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos de clasificación de escenas sobre BDD100K con los que establecer una comparación cuantitativa fiable. Se indica a continuación lo que sí está documentado.

| Modelo | Parámetros | Contexto / entrada | Top-1 en BDD100K val | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DLA-34 Scene Tagging (este modelo) | 15.290.679 | imagen 224x224 | 77,64 % | BDD100K (uso educativo/investigación) | Hugging Face (espejo) |
| Otros modelos del zoo SysCV BDD100K | no disponible | no disponible | no disponible | no disponible | host original fuera de servicio |
| Alternativas de clasificación de escenas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena exclusivamente con BDD100K, un dataset de conducción recopilado en entornos urbanos y de carretera de determinadas regiones; puede generalizar mal a paisajes, condiciones meteorológicas o países poco representados.
- Riesgo de alucinación: al ser un clasificador, no genera texto libre, pero puede asignar con alta confianza una etiqueta incorrecta en escenas ambiguas o atípicas; la clase `undefined` actúa como categoría residual y su precisión es baja (precisión macro del 65,44 % en validación y 50,71 % en test).
- Limitaciones de contexto o idioma: no procesa texto ni mantiene contexto conversacional; las etiquetas de clase están en inglés y no hay soporte multilingüe.
- Restricciones de licencia: los pesos se rigen por la licencia de BDD100K, que permite uso educativo, de investigación y sin ánimo de lucro; el uso comercial requiere revisar los términos y probablemente no está permitido sin autorización. El código de configuración y el backbone DLA de SysCV son Apache-2.0.
- Caveat de producción: el host original de los pesos está caído y esta copia procede de la Wayback Machine; aunque el autor verifica MD5 y reproducción exacta, conviene validar la integridad antes de desplegar. El entorno está fijado a versiones antiguas (PyTorch 2.0.1, mmcv-full 1.7.2), lo que puede complicar la integración con stacks modernos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación comunitaria adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-dla34-5x-224x224-scene
- Licencia BDD100K del modelo: https://huggingface.co/dronefreak/bdd100k-syscv-dla34-5x-224x224-scene/blob/main/LICENSE.txt
- Repositorio SysCV BDD100K models (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Configuración original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/scene/dla34_5x_224x224_scene_tag_bdd100k.py
- Paper de DLA (Deep Layer Aggregation, CVPR 2018): https://arxiv.org/abs/1707.06484
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper de BDD100K (CVPR 2020): no disponible como enlace directo en la información proporcionada

# dronefreak/bdd100k-syscv-resnet34-5x-224x224-scene

## Resumen

El modelo `dronefreak/bdd100k-syscv-resnet34-5x-224x224-scene` es un clasificador de imágenes basado en ResNet-34 que asigna a cada fotograma de conducción una única etiqueta de escena entre siete posibles: túnel, residencial, aparcamiento, indefinida, calle urbana, gasolinera y autopista. Lo publica el usuario dronefreak como espejo del zoo de modelos de SysCV (ETH Zurich) para BDD100K, recuperando los pesos originales del archivo Wayback Machine porque el host `dl.cv.ethz.ch` ya no está operativo. El repositorio añade un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0) y un script de inferencia que acepta imágenes, vídeos o webcam.

Se trata de un modelo pequeño y especializado: 21,3 millones de parámetros, ventana de entrada de 224x224 píxeles y una única salida de clasificación. No es un modelo generativo ni multimodal; su utilidad está en el etiquetado automático de escenas de conducción dentro de pipelines de visión por computador, por ejemplo para filtrar o enriquecer datasets de conducción autónoma. Su relevancia actual es la de un artefacto de referencia reproducible: el autor verifica que reproduce exactamente las predicciones publicadas por SysCV sobre las 10.000 imágenes de validación, con diferencias de puntuación inferiores a 2e-06.

La licencia es la de BDD100K (uso educativo, de investigación y sin ánimo de lucro), lo que condiciona fuertemente su uso comercial. El modelo no tiene pesos preentrenados en el config de entrenamiento, se entrena desde cero sobre las 70.000 imágenes de entrenamiento de BDD100K durante 60 épocas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-34 (CNN con conexiones residuales) con LinearClsHead, framework mmcls |
| Parámetros totales | 21.305.287 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen 224x224 (redimensionado del lado corto a 256 y recorte central) |
| Tipos de cuantización | no disponible (el repo publica safetensors y `.pth`; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no aplica (clasificación de imágenes; etiquetas de escena en inglés) |
| Licencia | bdd100k (educational, research and not-for-profit use); config de SysCV Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y `.pth` original; config en `config.json` y `original_config.py` |
| Tarea | image-classification (scene tagging, 7 clases) |
| Entrada | RGB, media y desviación estándar de ImageNet, 224x224 |
| Clases | tunnel, residential, parking lot, undefined, city street, gas stations, highway |
| Repo | 0.2 GB |

## Arquitectura y entrenamiento

ResNet-34 es una red convolucional residual con 34 capas y conexiones de identidad, descrita en "Deep Residual Learning for Image Recognition" (CVPR 2016). Sobre el backbone se monta una LinearClsHead de mmcls que produce un vector de 7 logits, uno por etiqueta de escena. El config de SysCV no fija pesos preentrenados, de modo que el backbone se entrena desde cero sobre BDD100K.

El entrenamiento usa las 70.000 imágenes de entrenamiento de BDD100K durante 60 épocas (el sufijo "5x" del nombre hace referencia a ese régimen extendido), con SGD de lr 0.1, momentum 0.9, weight decay 0.0001, decaimiento de lr en las épocas 30 y 45, batch de 128 imágenes repartidas en 4 GPUs (32 por GPU), recortes aleatorios redimensionados a 224x224 y volteo horizontal. En inferencia, el lado corto se redimensiona a 256 (una imagen 1280x720 pasa a 455x256) y se aplica un recorte central de 224x224.

No hay innovaciones arquitectónicas adicionales: es un clasificador convolucional clásico sin atención, sin decodificación especulativa ni mecanismos de razonamiento. La aportación del repositorio es de ingeniería de reproducibilidad: entorno fijado, script `infer.py` con soporte de imagen, vídeo y webcam, salida JSON con todas las puntuaciones por clase, y verificación de que la copia coincide con las predicciones y MD5 de SysCV.

## Capacidades

- Clasificación de escenas de conducción en 7 categorías (túnel, residencial, aparcamiento, indefinida, calle urbana, gasolinera, autopista).
- Procesamiento de imágenes individuales, carpetas de imágenes, archivos de vídeo y flujo de webcam mediante `infer.py`.
- Salida de etiqueta única por fotograma y, con `--json`, de todas las puntuaciones por clase.
- Control de número de fotogramas procesados en vídeo (`--max-frames`).
- Ejecución en GPU (CUDA 11.8) y en CPU (entorno `requirements-cpu.txt`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión general, audio ni modo thinking.
- Capacidades multilingües: no aplica; las etiquetas de salida están en inglés.

## Casos de uso

- Etiquetado automático de datasets de conducción: dado un conjunto de fotogramas de dashcam, el modelo asigna una etiqueta de escena por imagen, lo que permite filtrar o estratificar por tipo de vía antes de entrenar modelos de percepción. Es adecuado por su coste bajo (0,006 s/imagen en RTX 4070 SUPER) y su reproducibilidad verificada.
- Enriquecimiento de metadatos en plataformas de vídeo de flotas: procesar vídeos subidos por vehículos y añadir la etiqueta de escena a cada fotograma o clip, habilitando búsquedas del tipo "tramos de autopista" o "tramos urbanos".
- Preprocesado para pipelines de conducción autónoma: usar la etiqueta de escena como señal de enrutamiento hacia modelos especializados (por ejemplo, un detector distinto para túnel frente a autopista).
- Control de calidad de datasets: detectar imágenes mal etiquetadas o fuera de distribución comparando la etiqueta de escena con la anotada originalmente, aprovechando la salida JSON con puntuaciones por clase.
- Análisis de grabaciones de webcam o vídeo en tiempo casi real: `infer.py 0 --show` permite visualizar la etiqueta por fotograma en directo, útil para demos o prototipos de sistemas de asistencia.
- Investigación en visión por computador: servir como baseline reproducible de clasificación de escenas sobre BDD100K, con pesos y predicciones de referencia archivadas para comparar nuevas propuestas.
- Auditoría de modelos existentes: al reproducir exactamente las predicciones de SysCV, sirve para validar que un pipeline de inferencia propio (versiones de torch, mmcv, precisión TF32) no altera los resultados.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de puntuaciones de SysCV). Precisión, recall y F1 son medias macro sobre las 7 clases, incluida `undefined`.

| Split | Top-1 accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| val | 77,77 | 64,96 | 49,08 | 49,94 |
| test | 77,34 | 49,71 | 43,23 | 44,23 |

Rendimiento de inferencia declarado:

| Entorno | Tiempo por imagen |
|---|---|
| RTX 4070 SUPER (incluye decodificación JPEG) | 0,006 s |
| CPU con 8 hilos | 0,02 s |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) porque no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 21,3 millones de parámetros en fp32 los pesos ocupan aproximadamente 85 MB, por lo que el modelo cabe holgadamente en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: RTX 4070 SUPER (medición oficial del autor), cualquier GPU NVIDIA con soporte CUDA 11.8; también funciona en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna, e incluso en iGPU o CPU con rendimiento aceptable (0,02 s/imagen en 8 hilos).
- Opciones de despliegue: el repo proporciona `infer.py` con mmcls/mmcv-full y torch 2.0.1 sobre Python 3.10; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador CNN de este tipo). El despliegue típico sería un servicio HTTP propio que envuelva `infer.py` o el modelo mmcls.
- Latencia y throughput estimados: 0,006 s/imagen en RTX 4070 SUPER (unos 166 imágenes/s) y 0,02 s/imagen en CPU de 8 hilos (unos 50 imágenes/s), según el autor.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos de etiquetado de escena sobre BDD100K para establecer una comparación cuantitativa fiable. Se indica a continuación lo que sí es comparable a nivel estructural.

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ResNet-34 5x 224x224 scene) | ResNet-34 + LinearClsHead | 21,3 M | 224x224 | bdd100k (solo investigación) | Hugging Face, espejo verificado |
| Otros modelos del zoo de SysCV para BDD100K (tagging) | no disponible en detalle | no disponible | no disponible | config Apache-2.0, pesos bajo licencia BDD100K | Repo GitHub de SysCV |
| Clasificadores genéricos de escena (p. ej. ResNet-50 en ImageNet/Places) | ResNet | ~25 M | 224x224 | variable | Amplia |

La comparación de rendimiento con alternativas concretas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se rigen por la licencia de BDD100K, limitada a uso educativo, de investigación y sin ánimo de lucro; el uso comercial requiere revisar `LICENSE.txt` y probablemente licencias adicionales.
- Modelo de una sola etiqueta por imagen: no detecta múltiples escenas simultáneas ni objetos; la clase `undefined` absorbe los casos ambiguos.
- Métricas desequilibradas: la precisión macro (64,96 en val) y el recall macro (49,08 en val) son mucho más bajos que la accuracy top-1, lo que indica un rendimiento desigual entre clases; conviene revisar la matriz de confusión antes de usarlo en producción.
- Sin pesos preentrenados: el entrenamiento parte de cero, lo que puede limitar la generalización fuera de la distribución de BDD100K.
- Riesgo de degradación fuera de dominio: escenas nocturnas, meteorología adversa o cámaras con otra resolución pueden reducir la fiabilidad; el autor solo verifica la reproducción sobre el conjunto de validación de BDD100K.
- Sesgos del dataset: BDD100K está sesgado geográficamente (principalmente Estados Unidos) y hacia condiciones de conducción capturadas por su flota; las etiquetas de escena pueden no representar otras regiones.
- Sin soporte de cuantización documentado ni formatos alternativos (GGUF, ONNX); el despliegue depende de mmcls/mmcv-full y versiones fijadas de torch, lo que puede complicar la integración en stacks modernos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es un espejo reciente, no un modelo ampliamente validado por la comunidad.
- El host original de SysCV está caído; la procedencia de los pesos depende del archivo Wayback Machine, aunque el autor verifica MD5 y equivalencia de predicciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-resnet34-5x-224x224-scene
- Licencia BDD100K del repo: https://huggingface.co/dronefreak/bdd100k-syscv-resnet34-5x-224x224-scene/blob/main/LICENSE.txt
- Zoo de modelos de SysCV (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Config de SysCV del modelo: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/scene/resnet34_5x_224x224_scene_tag_bdd100k.py
- Paper de ResNet: https://arxiv.org/abs/1512.03385
- Paper de BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687 (referencia de la cita incluida en la model card; el enlace directo no figura en la información proporcionada)
- Dataset en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K

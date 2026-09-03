# AllenInstitute/lightning-pose-ctlut-face-disc-model

## Resumen

El modelo `lightning-pose-ctlut-face-disc-model` es un sistema de estimación de pose facial desarrollado por el Allen Institute y entrenado por Anna Lakunina. Está diseñado para rastrear 18 puntos clave del rostro de un animal (probablemente un roedor, dados los keypoints de bigotes, hocico y pupilas) en vídeo de una única vista. Utiliza un backbone ResNet50 preentrenado en el dataset AP10K de poses animales y una pérdida PCA single-view para el entrenamiento supervisado.

El modelo se integra en el ecosistema Lightning Pose, una librería de estimación de pose basada en PyTorch Lightning. Con un tamaño de repositorio de 0.3 GB, es relativamente ligero y adecuado para entornos de investigación con recursos limitados. Su relevancia radica en la creciente demanda de herramientas automatizadas de seguimiento de comportamiento animal en neurociencia y biomedicina, donde la cuantificación objetiva de expresiones faciales es crítica.

El modelo fue publicado el 3 de septiembre de 2026 y actualizado el mismo día. No se ha publicado información sobre licencia, pipeline de inferencia ni datos de entrenamiento específicos, lo que limita su reproducibilidad y uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (backbone) con cabecera de estimación de pose |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería lightning-pose, probablemente PyTorch) |

## Arquitectura y entrenamiento

El modelo emplea un backbone ResNet50 preentrenado en el dataset AP10K (Animal Pose Estimation), seguido de una cabecera de regresión de coordenadas para los 18 keypoints faciales. La pérdida utilizada es `pca_singleview`, una variante de la pérdida PCA (Principal Component Analysis) de Lightning Pose que modela la distribución de las poses para mejorar la coherencia espacial de las predicciones en una única vista.

El entrenamiento se realizó durante 300 épocas con una partición train/validation del 95%/5%. La métrica de rendimiento reportada es el error cuadrático medio supervisado (supervised RMSE) medido en píxeles de la imagen redimensionada (resized-px), no en píxeles del fotograma original. El dataset de entrenamiento no se ha especificado públicamente (el campo `data_name` contiene el valor placeholder "DATA_NAME"), lo que impide conocer la composición exacta de los datos.

## Capacidades

- Estimación de pose facial con 18 keypoints: párpados (superior, derecho, inferior, izquierdo), pupilas (superior, derecha, inferior, izquierda y cuatro diagonales), reflejo corneal, narina, punta del hocico y tres bigotes.
- Seguimiento en vídeo de una única vista (single-view), sin necesidad de cámaras múltiples ni calibración estéreo.
- Inferencia supervisada con backbone ResNet50, optimizado para precisión en tareas de laboratorio con animales.
- Integración nativa con la librería Lightning Pose, que incluye utilidades de entrenamiento, evaluación y visualización con TensorBoard.
- No soporta tool calling, generación de texto, razonamiento multimodal ni capacidades de agente, al ser un modelo puramente de visión para estimación de pose.

## Casos de uso

- Investigación en neurociencia del comportamiento: seguimiento de movimientos faciales de roedores durante experimentos conductuales, permitiendo correlacionar actividad neuronal con expresiones faciales en tiempo real.
- Evaluación de dolor en modelos animales: los movimientos de bigotes y la apertura ocular son indicadores validados de dolor en roedores. Este modelo permite cuantificar estos parámetros de forma automática y objetiva, sustituyendo la observación manual.
- Estudios de sueño y vigilia: el estado de apertura de los ojos (keypoints de párpados y pupilas) puede usarse para clasificar estados de sueño/vigilia en vídeos de larga duración, reduciendo la carga de anotación manual.
- Fenotipado de alto rendimiento: en instalaciones de cría de animales transgénicos o con mutaciones, el modelo permite cribar fenotipos faciales anómalos de forma automatizada, acelerando la caracterización de líneas genéticas.
- Pruebas farmacológicas: evaluación de respuestas faciales a fármacos o compuestos, cuantificando cambios en la posición de bigotes, nariz y ojos tras la administración, útil en ensayos preclínicos.
- Estudios de interacción social: seguimiento de expresiones faciales durante interacciones entre individuos, permitiendo analizar comunicación no verbal en roedores y su modulación por contexto social o fármacos.
- Investigación de reflejos sensoriales: los bigotes son órganos sensoriales clave en roedores; su seguimiento permite estudiar respuestas a estímulos táctiles y la coordinación de movimientos whiskerales.

## Benchmarks y rendimiento

Los datos de rendimiento provienen de los registros de TensorBoard del entrenamiento (archivo `events.out.tfevents.1736539402.f2768a15001d.48.0`). La métrica es el supervised RMSE en píxeles de imagen redimensionada (resized-px); valores más bajos indican mejor precisión.

| Conjunto | RMSE final | Mejor RMSE |
|---|---|---|
| Entrenamiento | 0.34 | 0.29 |
| Validación | 0.77 | 0.64 |

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, etc.) porque este modelo no es un LLM ni un modelo multimodal general; su evaluación se limita a la métrica de error de pose sobre el conjunto de validación. No se dispone de un desglose por keypoint individual.

## Requisitos de hardware

- Tamaño del repositorio: 0.3 GB, lo que indica que los pesos del modelo ocupan aproximadamente 300 MB (compatible con un ResNet50 en FP32, que tiene unos 25 millones de parámetros).
- VRAM estimada para inferencia: entre 2 y 4 GB en FP32, dependiendo de la resolución de entrada y el tamaño de lote. Con cuantización a FP16 o INT8, podría reducirse a 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, incluyendo tarjetas de consumo como NVIDIA GTX 1660, RTX 3060, RTX 4060 o superiores. También es viable en GPUs de datacenter como A100 o H100 para procesamiento por lotes.
- Cabe en GPUs de consumo: sí, sin problema, incluso en tarjetas de gama baja.
- Opciones de despliegue: la librería Lightning Pose (basada en PyTorch Lightning) es la vía principal. No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama ni TGI, al ser un modelo de visión y no un LLM.
- Latencia y throughput: no disponible. La inferencia con ResNet50 en una GPU moderna suele completarse en decenas de milisegundos por imagen, pero no se han publicado mediciones específicas para este modelo.

## Comparativa con modelos similares

La comparación directa no es posible sin ejecutar los mismos benchmarks sobre los mismos datos. A continuación se presenta una comparación estructural con alternativas populares de estimación de pose animal:

| Modelo | Backbone | Keypoints | Vistas | Licencia | Formato |
|---|---|---|---|---|---|
| lightning-pose-ctlut-face-disc-model | ResNet50 | 18 (faciales) | única | no disponible | lightning-pose |
| DeepLabCut | ResNet50/101, MobileNet | configurable | múltiple | LGPL-3.0 | PyTorch/TensorFlow |
| SLEAP | UNet, ResNet | configurable | múltiple | BSD-3-Clause | TensorFlow/PyTorch |

DeepLabCut y SLEAP son herramientas más maduras y con mayor comunidad, que soportan múltiples vistas y keypoints configurables. Este modelo de Lightning Pose ofrece la ventaja de una pérdida PCA que modela la coherencia de la pose, pero su aplicabilidad está limitada a la configuración específica para la que fue entrenado (18 keypoints faciales, vista única). No se dispone de datos de rendimiento comparables entre estos sistemas sobre el mismo dataset.

## Limitaciones y advertencias

- El dataset de entrenamiento no se ha especificado públicamente (campo `data_name` con valor placeholder "DATA_NAME"), lo que impide evaluar la generalización a otras especies, cepas o condiciones de iluminación.
- La licencia no está disponible, lo que genera incertidumbre legal sobre el uso comercial o la redistribución del modelo.
- El modelo está entrenado para una única vista (`num_views: 1`), por lo que no es adecuado para reconstrucción 3D ni para escenarios con oclusiones severas que requieran múltiples cámaras.
- La métrica de rendimiento (RMSE en resized-px) se mide sobre la imagen redimensionada, no sobre el fotograma original, lo que puede dar una impresión engañosa de precisión absoluta.
- No se ha publicado un desglose de error por keypoint; algunos puntos (como los bigotes) pueden tener mayor error que otros debido a su movilidad y menor contraste.
- El modelo fue entrenado con una pérdida PCA supervisada; si los datos de entrenamiento contienen sesgos de postura o iluminación, el modelo los heredará.
- No se ha confirmado la compatibilidad con formatos de cuantización estándar (GGUF, ONNX, TensorRT), lo que puede limitar su despliegue en entornos de producción optimizados.
- La fecha de creación (septiembre de 2026) y el número de descargas (0) sugieren que el modelo es muy reciente y no ha sido validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/AllenInstitute/lightning-pose-ctlut-face-disc-model
- Librería Lightning Pose: no disponible en la información proporcionada
- Repositorio del Allen Institute: no disponible en la información proporcionada
- Documentación de AP10K (dataset de preentrenamiento del backbone): no disponible en la información proporcionada

No se encontraron resultados de búsqueda web relevantes para este modelo; los resultados obtenidos correspondían a noticias de Yahoo News UK, sin relación con el contenido.

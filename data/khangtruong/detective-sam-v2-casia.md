# KhangTruong/detective-sam-v2-casia

## Resumen

`detective-sam-v2-casia` es un modelo de segmentación de imágenes orientado a la detección de imágenes sintéticas generadas por difusión. Lo publica el usuario KhangTruong en Hugging Face bajo licencia Apache 2.0, con la librería `sid-unet` y pipeline `image-segmentation`. No es un modelo de lenguaje: es una red de segmentación binaria que produce máscaras a nivel de píxel para localizar regiones manipuladas o generadas artificialmente.

El modelo se apoya en una arquitectura SID-UNet (presumiblemente una variante de U-Net con componentes de SAM, dado el nombre "detective-sam"), y se distribuye como checkpoints de PyTorch (`.pt`) con un tamaño de repositorio de aproximadamente 0,6 GB. La model card reporta una única versión activa (`v1`), entrenada durante 4 épocas y con una mejor puntuación de validación de 0,2681.

La relevancia actual del modelo radica en su tarea: la detección y localización de imágenes sintéticas es un problema creciente con la expansión de modelos de difusión. Sin embargo, los resultados publicados son modestos (IoU en torno a 0,25-0,27, AUROC en torno a 0,63-0,65 en el protocolo de evaluación cruzada), lo que lo sitúa como un experimento temprano más que como una herramienta lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SID-UNet (red de segmentación tipo U-Net; componentes SAM no detallados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch `.pt`) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`); tamaño de repo ~0,6 GB |

## Arquitectura y entrenamiento

La arquitectura es una SID-UNet, es decir, una red de segmentación con estructura encoder-decoder tipo U-Net, orientada a la detección de imágenes sintéticas (tags `synthetic-image-detection` y `diffusion-detection`). El nombre "detective-sam" sugiere la integración de componentes del Segment Anything Model (SAM), aunque la model card no detalla qué partes de SAM se reutilizan ni cómo se combinan con el backbone U-Net. No se especifican el número de parámetros, la resolución de entrada ni la composición exacta del dataset de entrenamiento.

En cuanto al entrenamiento, la model card indica 4 épocas totales y una mejor puntuación de validación de 0,2681 en la época 4. Se evaluó sobre el dataset `KhangTruong/Tampered-Images-Combined-Dataset-Fake` con el protocolo `eval_mvss_v1_protocol` (2066 muestras de test cruzado). No se documentan detalles sobre función de pérdida, aumentos de datos, inicialización desde pesos preentrenados ni técnicas de regularización. Tampoco se indica si hubo ajuste fino desde SAM o entrenamiento desde cero.

## Capacidades

- Segmentación a nivel de píxel para detección de imágenes sintéticas generadas por difusión.
- Producción de máscaras binarias que localizan regiones generadas o manipuladas.
- Evaluación mediante métricas de segmentación: IoU, Dice/F1, AUROC a nivel de píxel, precisión, recall y especificidad.
- Inferencia sobre imágenes individuales en formato estándar de visión (no se detalla resolución).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingües ni de generación de texto.
- No se documentan modos especiales como thinking, visión multimodal o audio.

## Casos de uso

- Detección de imágenes generadas por IA en pipelines de moderación de contenido: el modelo produce una máscara de píxeles que permite señalar qué zonas de una imagen son sospechosas de ser sintéticas, útil para revisión humana posterior.
- Verificación de autenticidad en plataformas de publicación: integrado como filtro previo a la publicación, puede marcar imágenes candidatas a inspección manual antes de su difusión pública.
- Análisis forense de imágenes en investigación: como herramienta de apoyo para localizar regiones manipuladas en un flujo de análisis pericial, siempre con validación humana dado el AUROC moderado (~0,65).
- Investigación académica en detección de deepfakes y difusión: sirve como baseline reproducible (checkpoints y protocolo de evaluación publicados) para comparar nuevas arquitecturas de segmentación.
- Filtrado en datasets de entrenamiento: para limpiar conjuntos de datos que puedan contener imágenes sintéticas no deseadas, usando la máscara como señal de exclusión o cuarentena.
- Prototipado de sistemas de watermarking o procedencia: como componente de un pipeline más amplio que combine detección por píxel con metadatos y señales criptográficas.

## Benchmarks y rendimiento

Resultados del protocolo `eval_mvss_v1_protocol` sobre `KhangTruong/Tampered-Images-Combined-Dataset-Fake` (2066 muestras, test cruzado):

| Checkpoint | Loss | IoU | Dice/F1 | AUROC | Pixel Acc | Precision | Recall | Specificity |
|---|---|---|---|---|---|---|---|---|
| detective_sam_v2_casia (exp6_wise_alpha05) | 0,6695 | 0,2668 | 0,3465 | 0,6501 | 0,7856 | 0,3474 | 0,4996 | 0,8370 |
| detective_sam_v2_casia (exp6_wise_alpha07) | 0,6710 | 0,2659 | 0,3410 | 0,6436 | 0,8047 | 0,3614 | 0,4534 | 0,8667 |
| detective_sam_v2_casia_3 (checkpoint_best) | 0,6979 | 0,2600 | 0,3295 | 0,6312 | 0,8231 | 0,3748 | 0,3963 | 0,8949 |
| sid_detective_sam_v2 | 0,7263 | 0,2460 | 0,3325 | 0,6485 | 0,6953 | 0,2910 | 0,6285 | 0,7141 |

Matriz de evaluación cruzada (media por configuración):

| Checkpoint | IoU | Dice/F1 | AUROC | Pixel Acc | Loss |
|---|---|---|---|---|---|
| EXP_detective_sam_v2_casia | N/A | N/A | N/A | N/A | N/A |
| detective_sam_v2_casia_3 | N/A | N/A | N/A | N/A | N/A |
| sid_detective_sam_v2 | 0,2460 | 0,3325 | 0,6485 | 0,6953 | 0,7263 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este modelo de segmentación. Los únicos datos disponibles son las métricas de segmentación anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un repo de ~0,6 GB en pesos, la inferencia en FP32 requiere del orden de 1-2 GB de VRAM, pero es una estimación no confirmada por el autor.
- GPU recomendadas: no especificadas. Por tamaño, cualquier GPU consumer con ≥4 GB de VRAM debería poder ejecutar el modelo, aunque no hay confirmación oficial.
- Cabe en GPU consumer: probablemente sí (GTX 1650, RTX 3050, RTX 4060 y superiores), sin datos oficiales de latencia.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de segmentación). El despliegue sería mediante PyTorch nativo y la librería `sid-unet`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparaciones con otras arquitecturas de detección de imágenes sintéticas (por ejemplo, variantes de U-Net forenses o detectores basados en SAM). Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- Rendimiento modesto: IoU en torno a 0,25-0,27 y AUROC en torno a 0,63-0,65 indican una capacidad de localización limitada; no es adecuado como único mecanismo de decisión en producción.
- Entrenamiento corto: solo 4 épocas, lo que sugiere posible infraentrenamiento y margen de mejora no explorado.
- Evaluación limitada a un único protocolo (`eval_mvss_v1_protocol`) y a un único dataset combinado, lo que reduce la evidencia de generalización.
- Riesgo de falsos positivos y negativos: la precisión (~0,29-0,37) y el recall (~0,40-0,63) son bajos, con un equilibrio delicado entre ambas métricas.
- Sin documentación sobre sesgos: no se detallan sesgos por tipo de imagen, resolución, dominio o demografía.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantías y de documentación técnica desaconseja su uso en producción sin validación adicional.
- No hay información sobre robustez frente a compresión JPEG, redimensionado u otras transformaciones habituales en imágenes reales.
- El modelo no es un LLM: no debe evaluarse con benchmarks de texto ni usarse para tareas de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/KhangTruong/detective-sam-v2-casia
- Dataset de evaluación: https://huggingface.co/datasets/KhangTruong/Tampered-Images-Combined-Dataset-Fake
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.

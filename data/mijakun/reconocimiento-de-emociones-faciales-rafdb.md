# MijaKun/Reconocimiento-de-Emociones-Faciales-RAFDB

## Resumen

Este repositorio, publicado por MijaKun, contiene un proyecto completo de reconocimiento de emociones faciales (FER) basado en el dataset RAF-DB (Real-world Affective Faces Database). No se trata de un único modelo, sino de un conjunto de nueve arquitecturas de deep learning —CNN, híbridos y transformers— entrenadas bajo tres escenarios: fine-tuning, transfer learning y entrenamiento desde cero (scratch). El objetivo es evaluar comparativamente qué arquitectura y estrategia de entrenamiento ofrecen mejor rendimiento en la clasificación de siete emociones básicas: sorpresa, miedo, disgusto, felicidad, tristeza, ira y neutral.

El modelo mejor posicionado es **POSTER++** (Poster V2), que alcanza un 85,63 % de precisión y un F1 macro de 0,7917 con 28,9 millones de parámetros, seguido de cerca por **QCS** (Quadruplet Cross-Similarity) con un 84,91 % de precisión. El repositorio incluye código fuente, pesos entrenados, scripts de evaluación, análisis de explicabilidad (Grad-CAM) y exportaciones para Android en formato ONNX. Aunque el proyecto está orientado a investigación, la disponibilidad de pesos y código permite su uso directo en aplicaciones de visión por computador.

La relevancia actual radica en la comparación sistemática de arquitecturas modernas (transformers como SwinFace y DeiT, y diseños específicos como POSTER++ y QCS) sobre un dataset realista con imágenes en condiciones no controladas, lo que proporciona referencias útiles para seleccionar modelos en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Múltiples: CNN (VGG16, ResNet50, DenseNet121, MobileNetV2, EfficientNetB0, CustomCNN), híbridos (POSTER++, QCS) y transformers (SwinFace, DeiT) |
| Parametros totales | No disponible (el mejor modelo, POSTER++, tiene 28,9 M; otros varían entre 1,3 M y 41,2 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | No disponible (se menciona exportación a ONNX, pero sin detalle de cuantización) |
| Idiomas soportados | No aplica (procesamiento de imágenes, no texto) |
| Licencia | No disponible |
| Formato de pesos | No disponible (se indica carpeta `saved_models` con pesos y exportación a ONNX para Android) |

## Arquitectura y entrenamiento

El proyecto implementa un pipeline completo de entrenamiento y evaluación sobre RAF-DB, un dataset con imágenes faciales del mundo real. Se utilizan técnicas de aumento de datos como MixUp, CutMix y Albumentations, junto con entrenamiento en precisión mixta (Mixed Precision). Los modelos se entrenan bajo tres paradigmas: fine-tuning de pesos preentrenados en ImageNet, transfer learning con congelamiento de capas y entrenamiento desde cero.

Entre las arquitecturas destacadas se encuentran:

- **POSTER++ (Poster V2)**: combina ventanas de atención cruzada (cross-attention) con consultas de landmarks faciales, logrando el mejor rendimiento con 28,9 M de parámetros.
- **QCS (Quadruplet Cross-Similarity)**: utiliza mecanismos de similitud cruzada cuádruple, alcanzando 84,91 % de precisión con 41,2 M de parámetros.
- **SwinFace**: basado en Swin Transformer con módulos CBAM, obtiene 69,39 % de precisión.
- **DeiT**: transformer eficiente en datos, también incluido en la comparativa.

No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de RAF-DB, ni se mencionan técnicas de RLHF o DPO (no aplicables a visión). El entrenamiento está optimizado para GPUs con al menos 4 GB de VRAM, como la RTX 3050.

## Capacidades

- Reconocimiento de emociones faciales en imágenes estáticas, clasificando en 7 categorías: sorpresa, miedo, disgusto, felicidad, tristeza, ira y neutral.
- Soporte para imágenes en condiciones no controladas (RAF-DB contiene fotos reales con variaciones de iluminación, pose y oclusión).
- Incluye herramientas de explicabilidad mediante Grad-CAM para visualizar las regiones de la imagen que influyen en la decisión del modelo.
- Análisis de errores y generación de matrices de confusión, curvas ROC y métricas como accuracy, F1 macro y MCC.
- Posibilidad de exportar los modelos a ONNX para su despliegue en plataformas móviles (Android) o edge.
- No incluye capacidades de tool calling, agentes, procesamiento de texto ni generación de lenguaje.

## Casos de uso

- **Análisis de sentimiento en videovigilancia**: el modelo puede detectar emociones en tiempo real en secuencias de vídeo, útil para entornos de seguridad o retail, gracias a su baja latencia (4,09 ms para POSTER++).
- **Atención al cliente automatizada**: integrado en sistemas de quioscos o chatbots con cámara, puede adaptar la respuesta según el estado emocional del usuario, mejorando la experiencia de servicio.
- **Accesibilidad para personas con discapacidad**: ayuda a personas con dificultades de comunicación a expresar sus emociones, sirviendo como interfaz de entrada para dispositivos de asistencia.
- **Investigación en psicología y neurociencia**: permite analizar expresiones faciales en estudios de comportamiento, con herramientas de explicabilidad para entender qué regiones faciales son relevantes.
- **Publicidad y marketing**: medición de reacciones emocionales a anuncios o productos en estudios de usuario, usando la alta precisión del modelo POSTER++.
- **Sistemas de recomendación adaptativa**: en plataformas de entretenimiento o educación, el modelo puede ajustar el contenido según la respuesta emocional del usuario capturada por la cámara.

## Benchmarks y rendimiento

El proyecto incluye una comparativa exhaustiva de los nueve modelos sobre RAF-DB. Los resultados principales se resumen a continuación:

| Modelo | Escenario | Aug | Accuracy | F1 Macro | Latencia | Params |
|---|---|---|---|---|---|---|
| POSTER++ (Poster V2) | Scratch | Sí | 85,63 % | 0,7917 | 4,09 ms | 28,9 M |
| QCS (Cross-Similarity) | Scratch | Sí | 84,91 % | 0,7770 | 4,27 ms | 41,2 M |
| VGG16 | Fine-Tuning | No | 77,71 % | 0,6920 | 8,32 ms | 21,1 M |
| DenseNet121 | Fine-Tuning | Sí | 75,78 % | 0,6848 | 6,19 ms | 7,2 M |
| MobileNetV2 | Scratch | No | 72,13 % | 0,6310 | 3,56 ms | 2,5 M |
| EfficientNetB0 | Fine-Tuning | No | 70,01 % | 0,6183 | 3,67 ms | 4,3 M |
| SwinFace (Swin ViT) | Scratch | Sí | 69,39 % | 0,6040 | 8,69 ms | 38,8 M |
| ResNet50 | Fine-Tuning | Sí | 67,93 % | 0,6068 | 5,30 ms | 24,0 M |
| CustomCNN (baseline) | Scratch | No | 59,13 % | 0,4891 | 6,09 ms | 1,3 M |

No se han publicado comparaciones con modelos externos en la información disponible.

## Requisitos de hardware

- VRAM mínima de 4 GB para entrenamiento e inferencia, optimizado para RTX 3050.
- GPU recomendada: cualquier NVIDIA con CUDA 11.8 o superior (A100, H100, RTX 3090, RTX 4090, etc.).
- Es posible ejecutar en CPU, aunque con mayor latencia.
- Para despliegue en edge, los modelos se exportan a ONNX y se integran en Android Studio, lo que permite ejecución en dispositivos móviles con recursos limitados.
- Latencia de inferencia: entre 3,56 ms (MobileNetV2) y 8,69 ms (SwinFace) en GPU, según los datos del proyecto.
- Opciones de despliegue: el repositorio incluye scripts para entrenamiento y evaluación, y exportación a ONNX. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (orientados a modelos de lenguaje, no a visión).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables externos en la documentación del repositorio. La comparativa interna entre los nueve modelos del proyecto muestra que POSTER++ y QCS superan claramente a las CNNs clásicas y a los transformers estándar en este dataset. Para una comparativa con otros sistemas de FER (como FER+ o AffectNet), sería necesario consultar literatura externa, no disponible aquí.

## Limitaciones y advertencias

- El proyecto es de carácter académico/investigador; no se especifica licencia, por lo que el uso comercial puede requerir contacto con el autor o verificación de los términos de los modelos base (por ejemplo, ImageNet preentrenados).
- Los resultados se basan únicamente en RAF-DB, que aunque es un dataset realista, tiene un desbalance de clases y limitaciones en diversidad demográfica, lo que puede inducir sesgos en la clasificación de ciertos grupos étnicos o de edad.
- No se incluyen mecanismos de mitigación de sesgos ni análisis de robustez ante ataques adversariales.
- La precisión máxima (85,63 %) indica que aún hay margen de error; en aplicaciones críticas (como diagnóstico médico) se requiere validación adicional.
- El repositorio no proporciona un pipeline de inferencia listo para producción; es necesario adaptar el código para integración en servicios.
- No se documentan requisitos de memoria RAM ni almacenamiento más allá de la VRAM mínima.
- La fecha de creación (2026-08-15) sugiere que el proyecto es reciente, pero no se ha validado su mantenimiento o soporte.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MijaKun/Reconocimiento-de-Emociones-Faciales-RAFDB
- Repositorio en GitHub (mencionado en la model card): https://github.com/MijaGod-Creator/Entrenamiento-de-Redes-Neuronales-en-escenarios-FineTuning-TransferLearning-Scratch-

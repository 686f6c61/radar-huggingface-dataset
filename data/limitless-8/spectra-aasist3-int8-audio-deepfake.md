# Limitless-8/spectra-aasist3-int8-audio-deepfake

## Resumen

Spectra-AASIST3 INT8 es un derivado cuantizado del modelo de detección de deepfakes de audio `lab260/Spectra-AASIST3`, publicado por el usuario Limitless-8 como parte de un proyecto de fin de grado universitario. El objetivo es permitir la inferencia en CPU sin GPU, facilitando el despliegue en entornos como Streamlit Community Cloud. No se trata de un modelo reentrenado, sino de una transformación numérica de los pesos del checkpoint original FP32 a precisión INT8 dinámica mediante ONNX Runtime.

El modelo base combina un front-end auto-supervisado wav2vec2 XLS-R-300m con un puente MLP y un back-end AASIST mejorado con redes Kolmogorov-Arnold (KAN). La cuantización afecta principalmente a las capas MatMul del transformer, que representan el 95,4% de los bytes de peso, mientras que las capas convolucionales se mantienen en FP32. El resultado es un artefacto ONNX de 0,4 GB que acepta audio mono de 16 kHz y devuelve dos logits indicando si la voz es genuina o generada.

La relevancia de este modelo radica en su capacidad para ejecutar detección de deepfakes de audio en entornos sin GPU, con una degradación mínima de rendimiento (EER 3,0% frente a 2,0% del FP32 en una evaluación de proyecto). Es una opción práctica para aplicaciones de verificación de voz, moderación de contenido y análisis de autenticidad en tiempo real, siempre que se comprendan sus limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 XLS-R-300m (front-end SSL) + MLP bridge + KAN-AASIST (back-end) |
| Parametros totales | no disponible (el front-end XLS-R-300m tiene ~300M, pero el total del modelo no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64.600 muestras de audio (~4,04 segundos a 16 kHz) |
| Tipos de cuantizacion | INT8 dinámico (ONNX Runtime, MatMul, per_channel=False); FP32 en capas convolucionales |
| Idiomas soportados | no disponible (el front-end XLS-R es multilingüe, pero no se documenta cobertura específica) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo `spectra-aasist3-int8-dynamic.onnx`) |

## Arquitectura y entrenamiento

El modelo base `lab260/Spectra-AASIST3` emplea una arquitectura híbrida: un front-end auto-supervisado wav2vec2 XLS-R-300m (Meta AI) que extrae representaciones de audio, seguido de un puente MLP de una sola capa y un back-end AASIST (Anti-spoofing with Adaptive Softmax and Instance-wise Temperature) mejorado con capas lineales KAN (Kolmogorov-Arnold Networks). Esta combinación sustituye las capas lineales tradicionales por funciones KAN aprendibles, lo que mejora la capacidad de discriminación entre voz genuina y sintética.

El entrenamiento original del modelo base no está documentado en la información proporcionada, pero se sabe que está orientado a la detección de deepfakes de audio y ha sido evaluado en conjuntos como ASVspoof 2019 LA e In-the-Wild. El derivado INT8 no implica ningún reentrenamiento: es una cuantización dinámica de los pesos del checkpoint FP32 exportado a ONNX, realizada con `onnxruntime.quantization.quantize_dynamic` sobre operaciones MatMul. Las capas convolucionales del encoder RawNet2 (~4% de los bytes) se mantienen en FP32 para preservar la precisión.

## Capacidades

- Detección de audio deepfake: clasifica clips de voz como genuinos (bona fide) o generados/clonados (spoof).
- Anti-spoofing: identifica ataques de conversión de voz, síntesis y reproducción.
- Procesamiento de audio de 16 kHz: acepta clips de exactamente 64.600 muestras (~4,04 s), con estrategias deterministas para clips más largos (ventana inicial) o más cortos (tile-repeat).
- Salida de logits: dos valores donde el índice 1 indica mayor probabilidad de voz genuina.
- Inferencia en CPU: optimizado para ejecución sin GPU mediante ONNX Runtime.
- Sin capacidades de generación de texto, tool calling ni agentes: es un clasificador puro.

## Casos de uso

- Verificación de identidad por voz: integrar el modelo en sistemas de autenticación biométrica para detectar intentos de suplantación mediante voces clonadas o sintetizadas. Su baja latencia en CPU permite su uso en flujos de autenticación en tiempo real.
- Moderación de contenido en plataformas de audio: analizar clips subidos por usuarios para filtrar contenido generado artificialmente, por ejemplo en redes sociales o servicios de podcasting.
- Análisis forense de grabaciones: ayudar a investigadores y periodistas a evaluar la autenticidad de audios antes de usarlos como evidencia, aunque no debe ser la única fuente de decisión.
- Protección de sistemas de atención al cliente: detectar si una llamada entrante utiliza una voz sintética para engañar a agentes o sistemas IVR.
- Evaluación de calidad de síntesis de voz: en entornos de desarrollo de TTS, usar el modelo como métrica de naturalidad o para detectar artefactos de generación.
- Despliegue en entornos sin GPU: gracias a su cuantización INT8, puede ejecutarse en servidores económicos, Raspberry Pi o aplicaciones web basadas en Streamlit, como demuestra el proyecto original.

## Benchmarks y rendimiento

La model card del derivado INT8 incluye resultados medidos por el proyecto de fin de grado sobre un subconjunto fijo y balanceado de 200 clips del corpus `SpeechAntiSpoofingBenchmarks/InTheWild`. Estos datos no son benchmarks oficiales del modelo base y no deben generalizarse.

| Metrica | INT8 (este repo) | FP32 (referencia) |
|---|---|---|
| EER | 3,0% | 2,0% |
| ROC-AUC | 0,9819 | 0,9766 |
| F1 | 0,9375 | 0,9326 |
| Bonafide FPR | 2,0% | 3,0% |
| Spoof FNR | 10,0% | 10,0% |

No se han publicado resultados de benchmarks oficiales del modelo base en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU exclusivamente: el modelo está diseñado para ONNX Runtime con CPU execution provider; no se ha probado con CUDA/GPU.
- Tamaño del repositorio: 0,4 GB, lo que permite cargarlo en memoria en sistemas con 1 GB de RAM o más.
- GPU recomendadas: ninguna, no aplica.
- Compatible con hardware de consumo: sí, cualquier CPU moderna (x86-64 o ARM) puede ejecutar la inferencia; el proyecto original lo desplegó en Streamlit Community Cloud.
- Opciones de despliegue: ONNX Runtime (Python, C++, etc.), Streamlit, FastAPI, o cualquier framework que soporte ONNX.
- Latencia y throughput: no se proporcionan mediciones específicas, pero al ser un modelo de ~300M de parámetros cuantizado a INT8, se espera una inferencia de unos pocos cientos de milisegundos en CPU moderna para un clip de 4 segundos.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de detección de deepfakes de audio en la informacion proporcionada. El modelo base `lab260/Spectra-AASIST3` se posiciona como una evolución de AASIST3 (que ya incorpora KAN) y supera a versiones anteriores de la familia Spectra en el corpus In-the-Wild, según la página de Jabberjay. Alternativas comunes en el campo incluyen AASIST original, RawNet2 y otros detectores basados en wav2vec2, pero no se dispone de métricas comparables en esta ficha.

## Limitaciones y advertencias

- El modelo base `lab260/Spectra-AASIST3` es una versión pre-release no publicada en revista revisada por pares; no existe un paper oficial para esta arquitectura exacta.
- La cuantización INT8 introduce una degradación de rendimiento: el EER pasa de 2,0% a 3,0% en la evaluación del proyecto, aunque otras métricas como ROC-AUC y F1 mejoran ligeramente en ese subconjunto.
- Posible domain shift: el rendimiento puede degradarse con idiomas, condiciones de grabación o métodos de síntesis no vistos en el entrenamiento.
- No es apto como evidencia forense: no debe usarse como única base para decisiones legales, de seguridad o de verificación de identidad.
- Los logits de salida no son probabilidades calibradas: un valor de 0,9 no significa literalmente "90% de probabilidad de ser genuino".
- La agregación de múltiples ventanas para audios largos es una extensión a nivel de aplicación del proyecto FYP, no parte del modelo original.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base es pre-release y puede tener limitaciones no documentadas.

## Enlaces

- Repositorio HuggingFace del modelo INT8: https://huggingface.co/Limitless-8/spectra-aasist3-int8-audio-deepfake
- Modelo base en HuggingFace: https://huggingface.co/lab260/Spectra-AASIST3
- Model card del base: https://huggingface.co/lab260/Spectra-AASIST3/blob/main/README.md
- Proyecto de fin de grado (GitHub): https://github.com/munz-aftab/audio-deepfake-detection-fyp
- Documentación de evaluación del FYP: https://github.com/munz-aftab/audio-deepfake-detection-fyp/blob/feat/spectra-aasist3-eval/docs/spectra_aasist3_evaluation.md
- Documentación de optimización de producción: https://github.com/munz-aftab/audio-deepfake-detection-fyp/blob/feat/spectra-production-optimization/docs/spectra_production_optimization.md
- Implementación de AASIST3 (GitHub): https://github.com/gladiator456/aasist3
- Repositorio oficial de AASIST3 (lab260ru): https://github.com/lab260ru/AASIST3
- Página de modelos Jabberjay (referencia de rendimiento): https://mattyb95.github.io/Jabberjay/models/

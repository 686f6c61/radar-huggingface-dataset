# karanm777/efficientnetv2s-skin-cancer-classifier

## Resumen

EfficientNetV2S Skin Cancer Classifier es un modelo de clasificación de imágenes médicas desarrollado por el usuario karanm777 y publicado en HuggingFace. Se trata de un ajuste fino (fine-tuning) de la arquitectura EfficientNetV2S de Keras sobre el conjunto de datos dermatológico HAM10000, con el objetivo de clasificar lesiones cutáneas en siete categorías diagnósticas distintas, entre ellas melanoma, carcinoma basocelular y lesiones vasculares.

El modelo aborda un problema clásico de la dermatología asistida por ordenador: la clasificación automática de imágenes de lesiones pigmentadas y no pigmentadas de la piel. Con aproximadamente 20,5 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto y ligero, adecuado para despliegue en entornos con recursos limitados. Su relevancia radica en que incorpora una calibración de temperatura (T = 2,77) que mejora la fiabilidad de las probabilidades predichas, un aspecto crítico en aplicaciones médicas donde la confianza del modelo debe ser interpretable.

La información disponible es escasa: no se detallan los hiperparámetros de entrenamiento, el número de épocas, la composición exacta del dataset ni los resultados por clase. La model card reporta una precisión del 0,95 y un F1 macro de 0,98 sobre HAM10000, aunque no se especifica si estas métricas corresponden a un conjunto de validación independiente o al conjunto de entrenamiento, lo que limita la interpretación de los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2S (red convolucional con bloques MBConv y Fused-MBConv) |
| Parametros totales | ~20,5 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (etiquetas y documentación) |
| Licencia | MIT |
| Formato de pesos | Keras (formato nativo de Keras/TensorFlow) |

## Arquitectura y entrenamiento

El modelo se basa en EfficientNetV2S, la variante "small" de la familia EfficientNetV2 introducida por Google Research. Esta arquitectura combina bloques Fused-MBConv en las etapas iniciales y bloques MBConv en las etapas finales, con un escalado compuesto de profundidad, anchura y resolución. EfficientNetV2S está diseñada para un entrenamiento más rápido y eficiente que la generación anterior, con un equilibrio entre precisión y coste computacional.

El ajuste fino se realizó sobre el dataset HAM10000 (Human Against Machine with 10000 training images), un conjunto de referencia en dermatología que contiene imágenes de lesiones cutáneas etiquetadas en siete clases. No se dispone de información sobre el número de épocas, la tasa de aprendizaje, el tamaño de lote, las técnicas de aumento de datos empleadas ni si se congelaron capas del modelo base. Tampoco se especifica si se aplicó regularización adicional, dropout o balanceo de clases. La única innovación técnica documentada es la calibración de temperatura con T = 2,77, aplicada para mejorar la fiabilidad de las probabilidades de salida, reduciendo el Expected Calibration Error (ECE) a 0,022.

## Capacidades

- Clasificación de imágenes dermatológicas en siete clases: AKIEC, BCC, BKL, DF, MEL, NV y VASC.
- Salida de probabilidades calibradas mediante temperature scaling, lo que permite umbrales de confianza más interpretables.
- Procesamiento de imágenes de entrada compatibles con el preprocesamiento estándar de EfficientNetV2S (resolución nativa de 384x384 píxeles en la variante S, aunque no se confirma en la información disponible).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingües más allá de las etiquetas en inglés.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales.
- Inferencia orientada a clasificación de imagen única, sin soporte documentado para lotes o streaming.

## Casos de uso

- **Triaje dermatológico asistido**: el modelo puede clasificar imágenes de lesiones cutáneas capturadas con dermatoscopio o cámara convencional, priorizando casos sospechosos de melanoma (MEL) o carcinoma basocelular (BCC) para revisión médica. Su calibración permite establecer umbrales de derivación con confianza controlada.
- **Herramienta de formación para dermatólogos**: integrado en plataformas educativas, permite a residentes comparar su diagnóstico con la predicción del modelo y las probabilidades calibradas por clase, fomentando el aprendizaje basado en casos.
- **Precribado en atención primaria**: en entornos con acceso limitado a dermatólogos, el modelo puede servir como primera barrera para descartar lesiones benignas (NV, BKL) y derivar el resto, reduciendo la carga asistencial.
- **Investigación en dermatología computacional**: como baseline reproducible con licencia MIT, puede utilizarse para comparar nuevas arquitecturas o técnicas de calibración sobre HAM10000.
- **Aplicaciones móviles de concienciación**: integrado en apps de salud cutánea, el modelo puede ofrecer una orientación inicial al usuario sobre el tipo de lesión, siempre con advertencia de que no sustituye el diagnóstico médico.
- **Auditoría de sesgos y robustez**: al ser un modelo pequeño y de código abierto, es adecuado para estudiar el comportamiento de clasificadores dermatológicos ante variaciones de iluminación, tono de piel o calidad de imagen.
- **Pipeline de anotación asistida**: el modelo puede preetiquetar imágenes en conjuntos de datos dermatológicos, acelerando la revisión manual por parte de expertos.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 0,95 | HAM10000 |
| Macro F1-score | 0,98 | HAM10000 |
| Expected Calibration Error (ECE) | 0,022 (tras T-scaling, T = 2,77) | HAM10000 |

No se han publicado resultados desglosados por clase, matrices de confusión ni comparaciones con otros modelos en la información disponible. Tampoco se especifica si las métricas corresponden a un split de test independiente o al conjunto de entrenamiento, lo que impide evaluar la generalización del modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB en FP32 para el modelo (~20,5 M de parámetros, ~82 MB de pesos), más el espacio para activaciones según el tamaño de lote y la resolución de entrada. En la práctica, menos de 2 GB en la mayoría de configuraciones.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente. Se puede ejecutar en NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 sin problemas; las GPU de gama alta no aportan ventajas significativas por el reducido tamaño del modelo.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU de consumo moderna (GTX 1650 en adelante) e incluso en CPU para inferencia puntual.
- **Opciones de despliegue**: TensorFlow Serving, Keras Serving, ONNX Runtime (previa conversión), FastAPI con Keras, o despliegue en dispositivos edge mediante TensorFlow Lite (previa conversión). No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera una latencia de milisegundos por imagen en GPU moderna, pero no se confirma.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/Entrada | Métrica reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| karanm777/efficientnetv2s-skin-cancer-classifier | ~20,5 M | Imagen (resolución no especificada) | Accuracy 0,95; F1 0,98 en HAM10000 | MIT | HuggingFace |
| EfficientNetV2S base (Keras) | ~20,5 M | Imagen 384x384 | No aplica (no entrenado en HAM10000) | Apache 2.0 (Keras) | Keras Applications |
| Modelos dermatológicos comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos específicos de clasificación dermatológica en HAM10000 con los que establecer una comparación rigurosa. La comparativa con el EfficientNetV2S base es únicamente arquitectónica, ya que el modelo base no está entrenado para esta tarea.

## Limitaciones y advertencias

- **Sesgos del dataset**: HAM10000 presenta un desbalanceo de clases significativo (NV es la clase mayoritaria) y una sobrerrepresentación de pieles claras. El modelo puede tener un rendimiento inferior en tonos de piel oscuros o en lesiones menos representadas.
- **Riesgo de alucinación**: en clasificación de imágenes, el equivalente es la asignación de alta confianza a clases incorrectas. La calibración mitiga parcialmente este riesgo, pero no lo elimina.
- **Métricas no verificables**: no se especifica si accuracy y F1 corresponden a test independiente; un F1 macro de 0,98 con accuracy de 0,95 resulta llamativo y podría indicar evaluación sobre entrenamiento o un split no representativo.
- **Limitaciones de idioma**: el modelo solo maneja etiquetas en inglés; no hay soporte multilingüe.
- **Restricciones de licencia**: la licencia MIT permite uso comercial, modificación y redistribución, pero no exime de las responsabilidades regulatorias en aplicaciones médicas.
- **Caveat para producción**: no es un dispositivo médico certificado. No debe usarse como sustituto del diagnóstico dermatológico profesional. Cualquier uso clínico requiere validación externa, análisis de equidad y cumplimiento normativo (MDR en la UE, FDA en EE. UU.).
- **Falta de documentación**: la ausencia de detalles sobre el entrenamiento, el preprocesamiento y la evaluación limita la reproducibilidad y la confianza en el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/karanm777/efficientnetv2s-skin-cancer-classifier
- Dataset HAM10000 (referencia): https://doi.org/10.1038/s41597-019-0207-2
- EfficientNetV2 (paper): https://arxiv.org/abs/2104.00298
- Keras Applications EfficientNetV2: https://keras.io/api/applications/efficientnet_v2/
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.

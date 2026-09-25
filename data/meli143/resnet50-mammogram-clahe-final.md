# meli143/resnet50-mammogram-clahe-final

## Resumen

`meli143/resnet50-mammogram-clahe-final` es un checkpoint de clasificación de imágenes basado en ResNet-50, publicado en HuggingFace por el usuario meli143 el 25 de septiembre de 2026. Por el identificador y el nombre del fichero incluido (`resnet50_clahe_final.keras`), se trata de un modelo de visión por computador entrenado o ajustado para trabajar sobre mamografías preprocesadas con CLAHE (Contrast Limited Adaptive Histogram Equalization), una técnica de ecualización adaptativa de histograma muy habitual en imagen médica para realzar el contraste de tejido blando. No forma parte de una familia de modelos de lenguaje ni de propósito general: es un clasificador convolucional de dominio muy específico.

El modelo se distribuye en formato nativo de Keras 3 (`.keras`), con un tamaño de repositorio de 0,2 GB, y está publicado bajo licencia MIT, lo que permite uso comercial y modificación sin restricciones de copyleft. El autor no ha incluido model card más allá de la línea de licencia, ni pipeline declarado, ni idiomas, ni métricas, ni descripción del dataset de entrenamiento o del esquema de etiquetas.

Su relevancia es limitada pero concreta: sirve como punto de partida reproducible para pipelines de investigación en detección asistida de cáncer de mama, como backbone para transfer learning en imagen médica y como referencia de implementación del preprocesado CLAHE en Keras. En el momento de redactar esta ficha acumula 0 descargas y 0 likes, y no cuenta con validación clínica documentada ni resultados de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN ResNet-50 (50 capas, bloques residuales tipo bottleneck con conexiones skip) |
| Parámetros totales | No documentado para este checkpoint. La variante estándar de ResNet-50 con cabeza de 1000 clases tiene ~25,6 M de parámetros; el total exacto depende de la cabeza de clasificación del ajuste fino |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión). No se documenta el tamaño de imagen de entrada; ResNet-50 estándar opera con 224×224×3 píxeles |
| Tipos de cuantización | No disponible. No se publican variantes cuantizadas (INT8, FP16, GGUF, etc.) |
| Idiomas soportados | No disponible / no aplica. Las salidas son etiquetas de clasificación, no texto |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3); fichero `resnet50_clahe_final.keras` |
| Tarea | Clasificación de imágenes (mamografías) |
| Preprocesado asociado | CLAHE (Contrast Limited Adaptive Histogram Equalization) |
| Framework | Keras |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-25 |
| Fecha de última actualización | 2026-09-25 |

## Arquitectura y entrenamiento

La arquitectura es ResNet-50, una red neuronal convolucional feed-forward de 50 capas que introduce conexiones residuales (skip connections) para mitigar el problema de desvanecimiento del gradiente en redes profundas. El bloque básico es del tipo bottleneck, con tres convoluciones (1×1, 3×3, 1×1) más una conexión identidad que se suma a la salida. Es una arquitectura puramente discriminativa, sin mecanismos de atención, sin estado recurrente y sin componentes generativos.

No hay información publicada sobre el proceso de entrenamiento: se desconoce el número de épocas, el optimizador, el régimen de learning rate, si se partió de pesos preentrenados en ImageNet, si hubo data augmentation más allá del CLAHE, si se aplicó balanceo de clases y qué conjunto de datos se utilizó (los más habituales en este dominio son CBIS-DDSM, DDSM, INbreast o MIAS, pero no se confirma ninguno). Tampoco se especifica el número de clases de salida ni su significado (por ejemplo, benigno/maligno, o clasificación BI-RADS), ni si el modelo realiza segmentación además de clasificación. La única innovación técnica identificable por el nombre del artefacto es la incorporación de CLAHE como paso de preprocesado, una técnica que redistribuye el histograma localmente para aumentar el contraste en regiones con baja variabilidad, algo crítico en mamografía.

## Capacidades

- Clasificación de imágenes de mamografía, presumiblemente en categorías binarias o multiclase (no documentadas).
- Extracción de características visuales: al ser un ResNet-50, el cuerpo convolucional puede usarse como extractor de embeddings para transfer learning en tareas relacionadas.
- Procesamiento de imágenes preprocesadas con CLAHE: el pipeline de inferencia debe replicar la ecualización adaptativa aplicada en entrenamiento.
- Inferencia sobre lotes de imágenes en GPU o CPU gracias al reducido coste computacional de la arquitectura.
- Exportación e integración en Keras/TensorFlow; conversión potencial a TensorFlow Lite o ONNX (no verificada).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni generación de texto.
- No tiene capacidades multilingües ni de procesamiento de lenguaje natural.
- No dispone de modo "thinking", visión multimodal general, audio ni vídeo.

## Casos de uso

- Investigación reproducible en imagen médica: permite partir de un checkpoint ya ajustado a mamografía con CLAHE para replicar o comparar resultados en experimentos académicos, sin necesidad de entrenar desde cero.
- Backbone para transfer learning: se puede congelar el cuerpo convolucional y reentrenar únicamente la cabeza para una tarea distinta (clasificación BI-RADS, detección de microcalcificaciones) con un dataset más pequeño.
- Prototipado de pipelines CAD (Computer-Aided Diagnosis): sirve como primer eslabón de clasificación en un sistema de triaje que priorice estudios sospechosos para revisión por radiólogos, siempre en fase de investigación.
- Validación de preprocesado: al incorporar CLAHE, es útil como referencia para medir el impacto del realce de contraste en el rendimiento de un clasificador frente a versiones sin preprocesar.
- Docencia y divulgación: ejemplo práctico y ligero para explicar ajuste fino de CNNs en imagen médica, clases desbalanceadas y métricas clínicas (sensibilidad, especificidad, AUC).
- Benchmark interno de infraestructura: su tamaño reducido lo hace adecuado para probar pipelines de despliegue (servidores de inferencia, contenedores, monitorización) antes de escalar a modelos mayores.
- Análisis retrospectivo de cohortes: procesar en lote un archivo de mamografías históricas para estudiar correlaciones estadísticas, con la debida supervisión y sin uso diagnóstico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ningún tipo (exactitud, AUC, sensibilidad, especificidad, F1, Dice) ni comparación con otras arquitecturas sobre el mismo conjunto de datos. Los resultados de búsqueda encontrados (91 % de Dice en un proyecto con ResNet50 U-Net, o el artículo de Springer sobre clasificación con ResNet-50 en CBIS-DDSM) corresponden a trabajos distintos y no pueden atribuirse a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para un lote pequeño. Los pesos de ResNet-50 en FP32 ocupan aproximadamente 100 MB; el fichero `.keras` de 0,2 GB del repositorio incluye además la estructura y posiblemente estado del optimizador.
- GPU recomendadas: prácticamente cualquier GPU con más de 2 GB de VRAM es suficiente (RTX 3060, RTX 4090, T4, L4, A100, H100). El modelo no requiere aceleradores de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo de los últimos diez años, e incluso en iGPU modernas.
- CPU: la inferencia en CPU es viable para uso no intensivo; para lotes grandes conviene GPU.
- Opciones de despliegue: carga directa con Keras/TensorFlow (`tf.keras.models.load_model`), TensorFlow Serving, y conversión a TensorFlow Lite u ONNX Runtime (no verificada por el autor). No se distribuyen pesos en GGUF, por lo que llama.cpp u Ollama no aplican.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

No existe información de rendimiento comparable para este checkpoint, por lo que la comparación se limita a características arquitectónicas de referencia. No se dispone de alternativas de la misma autoria o del mismo dominio publicadas con métricas verificables en la información proporcionada.

| Modelo | Arquitectura | Parámetros | Contexto / entrada | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| meli143/resnet50-mammogram-clahe-final | ResNet-50 + CLAHE | ~25,6 M (referencia de la arquitectura base) | No documentado | MIT | No disponible |
| ResNet-50 preentrenado en ImageNet | ResNet-50 | ~25,6 M | 224×224×3 | Varía según distribución | No es un modelo clínico; no comparable en el dominio |
| EfficientNet-B0 | CNN con compound scaling | ~5,3 M | 224×224×3 | Apache 2.0 (implementaciones habituales) | No comparable sin evaluación en el mismo dataset |
| ViT-B/16 | Transformer de visión | ~86 M | 224×224×3 | Varía según distribución | No comparable sin evaluación en el mismo dataset |

Cualquier afirmación de superioridad o inferioridad frente a estos modelos en tareas de mamografía sería especulativa sin una evaluación sobre el mismo conjunto de datos.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card solo contiene la licencia. Se desconocen el dataset de entrenamiento, las clases de salida, las métricas y el procedimiento de evaluación.
- No es un dispositivo médico: no cuenta con marcado CE, autorización FDA ni validación clínica. No debe usarse para diagnóstico ni para tomar decisiones sobre pacientes.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos con consecuencias clínicas si se usa sin supervisión facultativa.
- Sesgos potenciales: los datasets públicos de mamografía (DDSM, CBIS-DDSM) están sobrerrepresentados por poblaciones estadounidenses y por determinados equipos de adquisición; el rendimiento puede degradarse en otras poblaciones, fabricantes o protocolos de imagen.
- Dependencia estricta del preprocesado: si la imagen de entrada no se somete exactamente al mismo pipeline CLAHE (tamaño de ventana, clip limit, espacio de color) que en entrenamiento, el rendimiento puede caer de forma drástica.
- Desbalanceo de clases: en detección de cáncer de mama la prevalencia es muy baja; sin métricas publicadas no se puede saber si el modelo está sesgado hacia la clase mayoritaria.
- Limitaciones de idioma: no aplica al ser un modelo de visión, pero tampoco procesa metadatos clínicos en texto.
- Licencia MIT: permite uso comercial y modificación, pero no exime del cumplimiento de la normativa sanitaria (MDR en la UE, FDA en EE. UU.) ni de las obligaciones de protección de datos (RGPD) al tratar imágenes médicas.
- Sin mantenimiento ni soporte: 0 descargas y 0 likes indican un artefacto sin comunidad, sin issues resueltas y sin garantía de actualización.
- Reproducibilidad no verificable: al no publicarse semilla, versión de TensorFlow/Keras ni configuración de entrenamiento, los resultados no son reproducibles a partir de la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/meli143/resnet50-mammogram-clahe-final
- Repositorio relacionado del mismo autor (versión previa): https://huggingface.co/meli143/resnet50-mammogram-clahe
- Ficheros del repositorio relacionado: https://huggingface.co/meli143/resnet50-mammogram-clahe/tree/main
- Proyecto de detección de cáncer de mama con ResNet50 U-Net y CLAHE (contexto, no es este modelo): https://github.com/aryamanjalali/breast-cancer-detection
- Aplicación web de detección de cáncer de mama con deep learning (contexto, no es este modelo): https://github.com/Karthiktelagi/Breast-Cancer-Detection/tree/main
- Artículo sobre detección y clasificación de mamografías con ResNet-50 en CBIS-DDSM (contexto, no es este modelo): https://link.springer.com/content/pdf/10.1007/s11042-025-20679-4.pdf

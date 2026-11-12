# Altriaqe/cxr-convnext-896-ensemble

## Resumen

El modelo `cxr-convnext-896-ensemble`, publicado por el usuario Altriaqe en Hugging Face, es un conjunto de pesos para clasificación multi-etiqueta de radiografías de tórax en 10 clases (9 hallazgos patológicos más la clase "No Finding"). No se trata de un modelo de lenguaje, sino de un ensemble de dos clasificadores de imagen de la familia ConvNeXt (una ConvNeXt-Small y una ConvNeXt-Tiny, ambas con resolución de entrada de 896×896 píxeles), inicializados desde pesos ImageNet-12k de `timm` y afinados sobre un conjunto de datos médico de 30.344 imágenes correspondientes a 18.513 estudios.

El modelo resuelve una tarea clásica en imagen médica: la detección multi-etiqueta de hallazgos en radiografía de tórax (cardiomegalia, derrame pleural, neumotórax, consolidación, etc.). Su relevancia radica en que combina una resolución de entrada alta (896 px, frente a los 224 o 384 habituales) con un presupuesto de latencia declarado de aproximadamente 62 ms por estudio en hardware tipo T4, lo que lo hace apto para escenarios de triaje o pre-lectura en pipelines clínicos.

La ficha se basa exclusivamente en la model card pública del autor. Los datos de benchmarks son los reportados por el propio autor sobre su conjunto de validación, no sobre un test set público independiente, por lo que deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de dos CNN ConvNeXt (ConvNeXt-Small + ConvNeXt-Tiny), variante de vision transformer convolucional |
| Parametros totales | No disponible de forma explícita (los pesos suman 295 MB en FP16; ConvNeXt-Small ≈ 50 M y ConvNeXt-Tiny ≈ 28 M según arquitectura estándar) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada fija de 896×896 píxeles) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en PyTorch checkpoint; la card menciona inferencia en FP16) |
| Idiomas soportados | No aplica (modelo de imagen) |
| Licencia | MIT (código); pesos preentrenados Apache-2.0; se advierte de verificar la licencia del dataset original |
| Formato de pesos | PyTorch checkpoint (`.pth`) con claves `arch` y `model_state_dict`; no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un ensemble de dos redes ConvNeXt, un diseño convolucional moderno que adopta elementos de los vision transformers (bloques con normalización LayerNorm, convoluciones depthwise de 7×7 y diseño jerárquico). El miembro A es una ConvNeXt-Small inicializada desde `timm/convnext_small.in12k_ft_in1k` y afinada durante 24 épocas; el miembro B es una ConvNeXt-Tiny inicializada desde `timm/convnext_tiny.in12k_ft_in1k` y afinada durante 12 épocas. Ambos operan sobre entradas de 896×896 en escala de grises replicadas a 3 canales con normalización ImageNet.

El entrenamiento se realizó exclusivamente sobre el conjunto de entrenamiento oficial del reto (30.344 imágenes / 18.513 estudios), sin usar datasets médicos externos ni pesos preentrenados en dominio médico. La agregación en inferencia promedia los logits de las múltiples imágenes de un mismo estudio, luego promedia equitativamente los logits de ambos miembros y aplica sigmoide. Opcionalmente se aplica un suavizado por paciente (`p' = (1-λ)p + λ·mean(otros estudios del paciente)`, λ=0.15). No se documenta el uso de RLHF, DPO ni técnicas de destilación; tampoco se detalla la composición exacta del dataset ni el esquema de aumentos.

## Capacidades

- Clasificación multi-etiqueta de radiografías de tórax en 10 clases: Enlarged Cardiomediastinum, Pneumothorax, Consolidation, Pneumonia, Edema, Cardiomegaly, Atelectasis, Lung Opacity, Pleural Effusion y No Finding.
- Agregación a nivel de estudio: combina predicciones de varias imágenes del mismo estudio promediando logits.
- Suavizado opcional por paciente para explotar consistencia intra-paciente.
- Inferencia en FP16 con soporte de tensor cores en GPU tipo T4.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general más allá de la clasificación de radiografía de tórax.
- No dispone de modo "thinking", visión general, audio ni otras modalidades.

## Casos de uso

- Triaje automatizado en servicios de radiología: el modelo puede priorizar estudios con alta probabilidad de hallazgos críticos (neumotórax, derrame pleural) antes de la lectura del radiólogo, aprovechando su latencia de ~62 ms por estudio en T4.
- Pre-lectura en pipelines de PACS: integrado como paso previo a la revisión humana, genera etiquetas multi-clase que pueden ordenar la worklist por sospecha clínica.
- Segunda opinión asistida: al ser un ensemble de dos arquitecturas, ofrece una señal complementaria al radiólogo en la detección de hallazgos sutiles como consolidación o atelectasia.
- Investigación en imagen médica: sirve como baseline reproducible para experimentos de clasificación multi-etiqueta en radiografía de tórax, con pesos públicos y licencia permisiva.
- Auditoría de calidad de informes: comparar las predicciones del modelo con los informes radiológicos para detectar discrepancias y revisar casos.
- Docencia y formación: uso en entornos educativos para ilustrar cómo un modelo de visión detecta patrones radiológicos, con la advertencia de que no sustituye el juicio clínico.
- Despliegue en hardware modesto: su tamaño (295 MB) y la inferencia FP16 permiten ejecutarlo en GPUs de gama media para prototipos y validaciones locales.

## Benchmarks y rendimiento

Los resultados reportados por el autor sobre su conjunto de validación (9 clases, macro AUC):

| Configuracion | Macro AUC (9 clases) |
|---|---:|
| Miembro A (ConvNeXt-Small, 24 epocas) | 0.8130 |
| Miembro B (ConvNeXt-Tiny, 12 epocas) | 0.8111 |
| Ensemble de dos miembros | 0.8139 |
| Ensemble + suavizado por paciente (λ=0.15) | 0.8167 |

No se han publicado resultados sobre test sets públicos independientes (por ejemplo, NIH ChestX-ray14, CheXpert o MIMIC-CXR) en la información disponible, por lo que la comparabilidad con otros modelos es limitada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con pesos de 295 MB en FP16 y entradas de 896×896, se estima un consumo moderado (del orden de 2-4 GB en FP16, dependiendo del batch), aunque el autor no lo cuantifica.
- GPU recomendadas: el autor cita hardware tipo NVIDIA T4 como referencia (62 ms/estudio); GPUs como A100, H100 o RTX 4090 ofrecerían mayor throughput, aunque no se publican cifras.
- Compatibilidad con GPU de consumo: probable en GPUs consumer con al menos 4-6 GB de VRAM, aunque no confirmado por el autor.
- Opciones de despliegue: el autor proporciona scripts en PyTorch/TIMM (`code/predict.py`, `tools/make_submission.py`); no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: ~62 ms por estudio en T4 según la card; no se publican cifras de throughput agregado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de clasificación de radiografía de tórax (por ejemplo, variantes de CheXNet, DenseNet-121 o modelos basados en vision transformers), ni datos de benchmarks sobre conjuntos públicos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Los resultados de AUC (0.8139-0.8167) corresponden al conjunto de validación del propio reto, no a un test set público independiente; la generalización a otras poblaciones o equipos de rayos X no está validada.
- Riesgo de sesgo demográfico y de adquisición: al entrenarse solo con el dataset oficial del reto, puede no representar bien la distribución de otras instituciones, equipos o poblaciones.
- Riesgo de alucinación en el sentido de falsos positivos y falsos negativos en la clasificación; no debe usarse como diagnóstico autónomo sin supervisión médica.
- Limitación de idioma y modalidad: no procesa texto ni otras modalidades; solo radiografía de tórax en las 10 clases definidas.
- Restricciones de licencia: el código es MIT y los pesos preentrenados Apache-2.0, pero el autor advierte explícitamente de que los pesos se afinaron sobre un dataset del que no se especifica la licencia; es responsabilidad del usuario verificar los términos para uso comercial o redistribución.
- El repositorio indica "0 descargas" y "1 like" en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.
- La model card contiene un marcador de posición (`<你的 GitHub 仓库地址>`) en lugar de la URL real del repositorio de código, lo que dificulta la reproducibilidad.
- No se documentan detalles del esquema de aumentos, la composición exacta del dataset ni el procedimiento de validación, lo que limita la reproducibilidad completa.

## Enlaces

- Hugging Face: https://huggingface.co/Altriaqe/cxr-convnext-896-ensemble
- Repositorio de código: no disponible (la model card contiene un marcador de posición sin URL real)
- Paper: no disponible
- Blog o demo: no disponible
- Arquitectura ConvNeXt (referencia citada por el autor): https://github.com/facebookresearch/ConvNeXt

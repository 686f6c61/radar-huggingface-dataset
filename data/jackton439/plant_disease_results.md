# jackton439/plant_disease_results

## Resumen

`jackton439/plant_disease_results` es un modelo de clasificación de imágenes obtenido mediante fine-tuning de `google/mobilenet_v2_1.0_224`, la conocida CNN ligera de Google diseñada para inferencia eficiente en dispositivos con recursos limitados. Lo publica el usuario jackton439 en Hugging Face y su propósito declarado, a partir del nombre del repositorio, es la detección de enfermedades en plantas a partir de imágenes de hojas. El modelo tiene 2.261.827 parámetros y un tamaño de repositorio inferior a 0,1 GB, lo que lo sitúa en la categoría de modelos ultraligeros.

La relevancia de esta ficha es limitada: se trata de un artefacto generado automáticamente por el `Trainer` de Transformers, sin model card completada por el autor (secciones de descripción, usos previstos y datos de entrenamiento marcadas como "More information needed"). No consta información sobre el conjunto de datos, las clases, el idioma ni el origen de las imágenes. El autor declara una accuracy de 0,9398 y una pérdida de 0,2071 sobre un conjunto de evaluación no especificado, resultados que no pueden verificarse ni reproducirse con la información disponible.

Por tanto, debe considerarse un experimento académico o un prototipo, no un modelo listo para producción. Su interés principal es como ejemplo de fine-tuning de MobileNetV2 para visión agrícola con muy pocos recursos de cómputo, y como punto de partida para quien quiera reproducir el flujo de trabajo con un dataset propio y correctamente documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN con bloques residuales invertidos y cuellos de botella lineales), fine-tuning de `google/mobilenet_v2_1.0_224` |
| Parámetros totales | 2.261.827 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224×224 píxeles según el modelo base) |
| Tipos de cuantización | no disponible (pesos en safetensors; al ser una CNN de 2,26 M de parámetros, la cuantización a int8 es viable con herramientas estándar, pero no se documenta) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | other (sin detalle de términos en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una MobileNetV2 en configuración 1.0/224, es decir, factor de anchura 1.0 y resolución de entrada de 224×224 píxeles. MobileNetV2 es una red convolucional que emplea bloques residuales invertidos con convoluciones separables en profundidad, lo que reduce drásticamente el coste computacional frente a CNN clásicas como ResNet. La cabeza de clasificación se ha reemplazado y reentrenado para el número de clases del dataset de enfermedades de plantas, aunque dicho número no se especifica en la información disponible.

El entrenamiento se realizó con el `Trainer` de Transformers durante 3 épocas, con AdamW fused (betas 0,9/0,999, epsilon 1e-8), learning rate 5e-5, scheduler lineal, batch size de 16 en entrenamiento y evaluación, semilla 42 y precisión mixta nativa (AMP). El conjunto de datos es desconocido: la model card indica "on an unknown dataset" y no detalla composición, número de imágenes ni número de tokens o muestras. No consta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador de imágenes. Las versiones de framework declaradas son Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de imágenes en categorías de enfermedad de plantas (número de clases no disponible).
- Inferencia ultraligera: 2,26 M de parámetros permiten ejecución en CPU y en dispositivos de borde.
- Integración con la librería `transformers` mediante `AutoModelForImageClassification` y pipeline `image-classification`.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües (no procesa lenguaje).
- Sin modo thinking, visión general, audio ni otras modalidades más allá de la clasificación de imagen.

## Casos de uso

- Prototipado de diagnóstico agrícola: usar el pipeline `image-classification` para etiquetar fotos de hojas y comprobar la viabilidad de un clasificador MobileNetV2 antes de invertir en un dataset mayor y mejor documentado.
- Aplicación móvil offline de apoyo al agricultor: con 2,26 M de parámetros, el modelo cabe holgadamente en un dispositivo Android o iOS y puede ejecutarse sin conexión tras exportarlo a ONNX o TFLite, aunque requeriría validación previa con datos reales.
- Filtro previo en un sistema de triaje de imágenes: clasificar rápidamente capturas recibidas en un servicio y derivar solo los casos sospechosos a un modelo mayor o a un experto humano.
- Docencia y experimentación: ejemplo reproducible de fine-tuning de MobileNetV2 con el `Trainer` de Transformers, útil en cursos de visión por computador o de aprendizaje profundo aplicado a agricultura.
- Benchmark de referencia interna: servir como línea base ligera contra la que comparar modelos propios de clasificación de enfermedades en plantas.
- Investigación en agricultura de precisión: punto de partida para experimentos de detección temprana de patologías en cultivos, siempre que se sustituya o amplíe el dataset no documentado por uno propio y auditado.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en la model card, sobre un conjunto de evaluación no especificado. El `model-index` no incluye resultados estructurados (lista vacía).

| Métrica | Valor |
|---|---|
| Pérdida de validación (época 3) | 0,2071 |
| Accuracy de validación (época 3) | 0,9398 |
| Pérdida de validación (época 2) | 0,2717 |
| Accuracy de validación (época 2) | 0,9173 |
| Pérdida de validación (época 1) | 0,4407 |
| Accuracy de validación (época 1) | 0,9023 |

No se han publicado resultados de benchmarks estándar (ImageNet, PlantVillage u otros) en la información disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 100 MB en fp32 para los pesos (2,26 M de parámetros ≈ 9 MB), más el overhead de activaciones y del runtime; en la práctica, menos de 0,5 GB en cualquier GPU.
- GPU recomendadas: cualquier GPU moderna sirve; una RTX 4090, A100 o H100 están sobredimensionadas para este modelo. Una GTX 1650 o incluso una GPU integrada es suficiente.
- Cabe en cualquier GPU de consumo e incluso en CPU y en dispositivos móviles.
- Opciones de despliegue: pipeline `image-classification` de Transformers, exportación a ONNX Runtime, TensorFlow Lite o Core ML para móvil, y servidores de inferencia estándar (Triton, TorchServe). vLLM, llama.cpp, Ollama y TGI no aplican a un clasificador de imágenes.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jackton439/plant_disease_results | 2,26 M | Clasificación de enfermedades de plantas | Imagen 224×224 | other (sin detalle) | Hugging Face, 0 descargas |
| google/mobilenet_v2_1.0_224 | 3,5 M (aprox., modelo base) | Clasificación de imágenes ImageNet-1k | Imagen 224×224 | Apache 2.0 (modelo base) | Hugging Face, ampliamente usado |
| Modelos de clasificación de plantas en PlantVillage | no disponible | Clasificación de enfermedades de plantas | Variable | variable | múltiples repositorios comunitarios |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparación con alternativas de la misma tarea (clasificadores entrenados sobre PlantVillage u otros datasets agrícolas públicos) no puede cuantificarse sin resultados de benchmarks publicados.

## Limitaciones y advertencias

- Model card incompleta: no se documentan dataset, clases, número de imágenes ni procedencia de los datos, lo que impide evaluar sesgos y generalización.
- Riesgo alto de sobreajuste al dominio del dataset desconocido: la accuracy de 0,9398 no es extrapolable a imágenes de campo con iluminación, fondo o especies distintas.
- Riesgo de alucinación en sentido amplio: el modelo asignará siempre una de sus clases con una confianza determinada, aunque la imagen no corresponda a una hoja o la enfermedad no esté representada.
- Sin información sobre sesgos demográficos o geográficos; en un modelo agrícola, el sesgo relevante sería la sobrerrepresentación de ciertas especies, variedades o condiciones de captura.
- Licencia "other" sin texto: no se aclaran los términos de uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Sin idiomas soportados porque no procesa texto; no aplica para tareas de lenguaje.
- Descargas y likes a cero: no hay evidencia de uso ni validación por parte de la comunidad.
- No apto para uso clínico, agronómico o de diagnóstico sin validación independiente con datos reales y revisión por expertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jackton439/plant_disease_results
- Modelo base: https://huggingface.co/google/mobilenet_v2_1.0_224
- Revisión sobre deep learning para enfermedades y plagas de plantas (Frontiers in Plant Science, 2025): https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2025.1538163/full
- Revisión sobre detección y gestión de enfermedades de plantas con IA y ML (ResearchGate): https://www.researchgate.net/publication/390092029_Detection_and_Management_of_Plant_Disease_Using_Artificial_Intelligence_and_Machine_Learning_Applications_A_Review

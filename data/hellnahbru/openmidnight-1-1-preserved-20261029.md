# hellnahbru/OpenMidnight-1.1-preserved-20261029

## Resumen

OpenMidnight-1.1 es un modelo fundacional de patología desarrollado por MedARC y Sophont, publicado bajo licencia Apache 2.0. Se trata de un encoder de visión especializado en la extracción de características de imágenes histológicas, que transforma teselas (tiles) RGB de tejido en embeddings de 1.536 dimensiones para su uso en tareas de análisis posteriores (downstream). El modelo se distribuye a través de la librería `timm` y está diseñado para integrarse en pipelines de investigación en patología computacional.

La relevancia del modelo reside en su carácter de modelo fundacional: en lugar de resolver una tarea concreta, proporciona representaciones vectoriales genéricas que pueden reutilizarse en clasificación de tejidos, detección de tumores, segmentación o recuperación de imágenes similares, siempre que se entrene una cabeza o modelo downstream sobre los embeddings. Con 1.134.774.272 parámetros (aproximadamente 1,13 mil millones) y un tamaño de repositorio de 4,5 GB, se posiciona en la gama media de encoders de visión, lo que lo hace viable en hardware de una sola GPU.

El modelo solo soporta inglés en su documentación y está etiquetado para extracción de características de imagen. No se han publicado resultados de benchmarks ni el artículo técnico asociado en la información disponible, lo que limita la evaluación comparativa objetiva de su rendimiento frente a otros encoders de patología.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (encoder de visión compatible con `timm`) |
| Parámetros totales | 1.134.774.272 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224 × 224 tras center crop) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimensión de embedding | 1.536 |
| Tamaño del repositorio | 4,5 GB |
| Preprocesado | redimensionado bicúbico a 256 px, center crop 224 × 224, normalización ImageNet |
| Librería | timm (versión recomendada 1.0.30) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que es un encoder de visión cargable mediante `timm` y que expone `forward_features` con un token CLS de 1.536 dimensiones. No se especifica si se trata de un Vision Transformer (ViT), un híbrido convolucional-transformer u otra familia, ni se detalla el número de capas, dimensiones ocultas o mecanismos de atención. Tampoco se indica el número de tokens de entrenamiento, la composición del dataset histológico utilizado, ni si se emplearon técnicas de aprendizaje autosupervisado (como DINO, MAE o contrastivo), RLHF o DPO.

El único detalle técnico confirmado es el pipeline de inferencia: el modelo recibe imágenes RGB de teselas histológicas, aplica el preprocesado definido en `config.json` (resize bicúbico a 256 px, center crop 224 × 224 y normalización ImageNet) y devuelve embeddings de 1.536 dimensiones mediante el token CLS. El autor indica que se incluyen todos los pesos de inferencia y que no se requiere un checkpoint base, adaptador ni acceso a clúster. El artículo técnico está anunciado como "coming soon", por lo que no hay información publicada sobre la estrategia de entrenamiento.

## Capacidades

- Extracción de características de imágenes histológicas: genera embeddings de 1.536 dimensiones a partir de teselas RGB de tejido.
- Uso como backbone congelado o ajustable para tareas downstream de patología computacional.
- Inferencia en GPU (CUDA) o CPU, según la documentación del autor.
- Integración nativa con la librería `timm` mediante `timm.create_model("hf-hub:medarc/OpenMidnight-1.1", pretrained=True)`.
- Soporte de preprocesado automático mediante `create_transform` y `resolve_model_data_config`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder de visión, no un modelo generativo.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades multimodales más allá de la codificación de imágenes.

## Casos de uso

- Clasificación de subtipos tumorales: los embeddings de 1.536 dimensiones pueden alimentar un clasificador lineal o una red densa entrenada sobre un conjunto anotado de teselas, aprovechando que el encoder ya captura patrones histológicos generales.
- Detección de mitosis o regiones de alto grado: se extraen embeddings por tesela y se entrena un detector o clasificador binario para identificar regiones con actividad mitótica elevada.
- Recuperación de imágenes por similitud (image retrieval): los vectores pueden indexarse en una base vectorial para buscar teselas morfológicamente similares en un archivo de diapositivas, útil en control de calidad o revisión de casos.
- Segmentación a nivel de diapositiva (slide-level): combinando los embeddings de teselas con un modelo de agregación (por ejemplo, atención múltiple o MIL) se pueden predecir diagnósticos a nivel de portaobjetos.
- Preentrenamiento de modelos de patología con menos datos: al servir como backbone congelado, reduce la necesidad de grandes volúmenes anotados en tareas con pocas muestras.
- Investigación en representaciones histológicas: análisis de espacios latentes, clustering de morfologías y estudios de interpretabilidad sobre los embeddings generados.
- Integración en pipelines de investigación clínica: extracción por lotes de características de cohorts de imágenes histológicas para análisis estadísticos posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,13 mil millones de parámetros en precisión FP32, los pesos ocupan aproximadamente 4,5 GB; en FP16/BF16 se reduciría a unos 2,3 GB, aunque no se confirman cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM en FP32 para inferencia por lotes pequeños; una NVIDIA RTX 3090, RTX 4090, A100 o H100 permitiría lotes mayores y mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores), aunque el dato exacto de VRAM no está confirmado por el autor.
- Opciones de despliegue: `timm` con PyTorch es la vía documentada; no se mencionan soportes oficiales para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este encoder).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros encoders de patología (como UNI, Virchow, Hibou o Prov-GigaPath) ni datos de rendimiento que permitan una comparación objetiva.

## Limitaciones y advertencias

- No se han publicado benchmarks ni artículo técnico, por lo que no es posible validar su rendimiento frente a alternativas.
- El modelo solo está documentado en inglés y no se especifican capacidades multilingües.
- Genera embeddings a nivel de tesela; las predicciones a nivel de diapositiva requieren un modelo downstream adicional, tal como advierte el autor.
- Riesgo de sesgo en los datos de entrenamiento histológico: no se detalla la composición del dataset, la distribución geográfica ni la diversidad de tejidos, lo que puede limitar la generalización.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de representaciones poco fiables en morfologías no vistas durante el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es una herramienta de investigación: no está validado como dispositivo médico ni para diagnóstico clínico.
- El repositorio tiene muy poca tracción (21 descargas, 0 likes) y fue creado el 29 de octubre de 2026, por lo que su madurez y soporte comunitario son limitados.
- No se confirman cuantizaciones oficiales ni formatos alternativos a safetensors.

## Enlaces

- HuggingFace: https://huggingface.co/hellnahbru/OpenMidnight-1.1-preserved-20261029
- MedARC: https://www.medarc.ai/
- Sophont: https://sophont.med/
- Paper: anunciado como "coming soon", no disponible en la información proporcionada.

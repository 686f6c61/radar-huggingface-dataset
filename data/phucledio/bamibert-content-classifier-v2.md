# phucleDio/bamibert-content-classifier-v2

## Resumen

El modelo `phucleDio/bamibert-content-classifier-v2` es un clasificador de texto obtenido por fine-tuning de BamiBERT, un modelo de lenguaje preentrenado tipo BERT específico para vietnamita desarrollado por Qualcomm AI Research. BamiBERT se entrenó desde cero sobre un corpus general de 129 GB de texto vietnamita durante 20 épocas, y soporta una longitud de contexto de hasta 2048 tokens, superando las limitaciones de PhoBERT (el encoder vietnamita de referencia). Este fine-tune, creado por el usuario phucleDio, se ha ajustado para tareas de clasificación de contenido, aunque la model card no especifica el conjunto de datos ni las etiquetas exactas.

Con aproximadamente 103 millones de parámetros, es un modelo compacto y eficiente para tareas de clasificación en vietnamita. La relevancia actual radica en la necesidad de modelos monolingües de alta calidad para el procesamiento del lenguaje natural en vietnamita, un idioma con recursos limitados en comparación con el inglés. Al estar basado en BamiBERT, hereda su tokenización directa sobre texto crudo, lo que elimina la necesidad de preprocesamiento externo.

La model card generada automáticamente indica que se trata de un fine-tuning con Trainer de Hugging Face, con métricas de evaluación muy altas (accuracy 0.9992 en el conjunto de validación), aunque no se han publicado resultados en benchmarks externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer, base) |
| Parametros totales | 102.954.244 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (heredado de BamiBERT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (modelo base), fine-tune sin especificar |
| Licencia | other (no especificada en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BamiBERT, el modelo base, es un transformer encoder de tipo BERT entrenado desde cero sobre un corpus vietnamita de 129 GB durante 20 épocas. Según el paper correspondiente (arXiv:2607.02259), BamiBERT aborda limitaciones de PhoBERT, como la longitud de contexto (2048 tokens frente a los 512 de PhoBERT) y la tokenización directa sobre texto crudo, sin necesidad de segmentación de palabras externa. La arquitectura es la estándar de BERT base, con 12 capas, 768 dimensiones de ocultación y 12 cabezas de atención, lo que justifica los ~103 millones de parámetros.

El fine-tune `bamibert-content-classifier-v2` se realizó con la librería Transformers (versión 5.15.1) y PyTorch 2.11.0. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 1.2e-05, tamaño de lote efectivo de 64 (con acumulación de gradientes de 2), 4 épocas, programador lineal con 289 pasos de calentamiento y factor de suavizado de etiquetas de 0.1. Se utilizó precisión mixta nativa (AMP). No se especifica el conjunto de datos de entrenamiento ni la tarea concreta de clasificación (el campo dataset aparece como "None" en la model card).

## Capacidades

- Clasificación de texto: el modelo está entrenado para asignar una o varias categorías a fragmentos de texto en vietnamita, aunque las etiquetas exactas no están documentadas.
- Procesamiento de texto vietnamita: al heredar la tokenización de BamiBERT, maneja el vietnamita sin necesidad de segmentación de palabras previa, incluyendo marcas diacríticas y ortografía nativa.
- Contexto largo: soporta hasta 2048 tokens, lo que permite clasificar documentos más extensos que los modelos BERT típicos (512 tokens).
- Inferencia eficiente: al ser un modelo de ~103M parámetros, puede ejecutarse en hardware modesto, incluida CPU.
- No se documentan capacidades de tool calling, agentes, generación de texto ni multimodales; es un modelo exclusivamente de clasificación.

## Casos de uso

- Moderación de contenido en plataformas vietnamitas: el modelo puede clasificar comentarios o publicaciones en categorías de toxicidad, spam o temática, aprovechando su ventana de 2048 tokens para analizar hilos completos.
- Categorización automática de documentos: en entornos empresariales o gubernamentales vietnamitas, puede asignar etiquetas a informes, correos o artículos según su contenido, reduciendo trabajo manual.
- Análisis de sentimiento en redes sociales: al procesar texto vietnamita con diacríticos, permite monitorizar opiniones sobre productos o marcas en foros y redes locales.
- Filtrado de contenido en motores de búsqueda o recomendación: clasificar páginas web o noticias para personalizar resultados según categorías predefinidas.
- Detección de temas en atención al cliente: integrarlo en sistemas de tickets para enrutar consultas a departamentos específicos según su asunto.
- Clasificación de documentos legales o administrativos: dada su capacidad de contexto largo, puede procesar párrafos extensos de textos normativos vietnamitas y asignar categorías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye métricas de validación del propio entrenamiento (accuracy 0.9992, F1 macro 0.9992, precisión macro 0.9990, recall macro 0.9993), pero estos valores provienen del conjunto de validación del fine-tuning y no son comparables con benchmarks externos como MMLU o GLUE. El campo `model-index` está vacío, por lo que no hay resultados oficiales reportados.

## Requisitos de hardware

- VRAM estimada: para inferencia en fp32, un modelo de 103M parámetros ocupa aproximadamente 412 MB. Con cuantización a int8, se reduce a ~103 MB, y a int4, ~52 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1650, RTX 3060 o superiores funcionan sin problemas. También puede ejecutarse en CPU con baja latencia (inferencia de ~10-50 ms por ejemplo según hardware).
- Cabe en GPUs de consumo: sí, incluso en placas integradas con suficiente RAM.
- Opciones de despliegue: compatible con Transformers, ONNX Runtime, TorchScript y llama.cpp (si se convierte a GGUF, aunque no se proporcionan pesos en ese formato). Puede servirse con Hugging Face Inference Endpoints, vLLM (aunque vLLM está orientado a generación, también soporta clasificación), o mediante una API simple con FastAPI.
- Latencia estimada: en una GPU moderna (RTX 3090), la inferencia de un texto corto (<512 tokens) es del orden de 5-15 ms. En CPU (8 núcleos), puede rondar 50-200 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bamibert-content-classifier-v2 | 103M | 2048 | vietnamita | other | Hugging Face |
| PhoBERT (base) | 135M | 512 | vietnamita | MIT | Hugging Face |
| BamiBERT (base) | 103M | 2048 | vietnamita | other | Hugging Face |
| XLM-RoBERTa (base) | 270M | 512 | multilingüe | MIT | Hugging Face |

BamiBERT fue diseñado para superar a PhoBERT en contexto y tokenización, y este fine-tune hereda esas ventajas. Sin embargo, no se dispone de comparativas directas de rendimiento en la misma tarea de clasificación con PhoBERT u otros modelos, ya que el autor no ha publicado resultados comparativos. XLM-RoBERTa es una alternativa multilingüe, pero con mayor coste computacional y menor contexto.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado principalmente en vietnamita, puede presentar sesgos culturales o lingüísticos propios de ese dominio. No se han evaluado sesgos específicos.
- Riesgo de alucinación: en tareas de clasificación, el riesgo es bajo, pero podría asignar etiquetas incorrectas a textos ambiguos o fuera de dominio.
- Limitaciones de contexto: aunque soporta 2048 tokens, textos más largos deben truncarse, lo que puede perder información relevante.
- Idiomas: no se recomienda su uso fuera del vietnamita; el modelo no ha sido evaluado en otros idiomas.
- Licencia: la licencia "other" no especifica condiciones de uso comercial. Es necesario contactar con el autor o revisar la licencia de BamiBERT para determinar restricciones.
- Datos de entrenamiento: no se documenta el dataset de fine-tuning, lo que dificulta evaluar la generalización y posibles sesgos del clasificador.
- Mantenimiento: el modelo fue creado en agosto de 2026 y no se han publicado actualizaciones ni documentación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phucleDio/bamibert-content-classifier-v2
- Modelo base BamiBERT: https://huggingface.co/Qualcomm-AI-Research/BamiBERT
- Paper de BamiBERT: https://arxiv.org/abs/2607.02259
- PDF del paper: https://arxiv.org/pdf/2607.02259
- Página del paper en HF: https://huggingface.co/papers/2607.02259

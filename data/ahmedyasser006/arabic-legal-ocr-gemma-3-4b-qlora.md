# ahmedyasser006/arabic-legal-ocr-gemma-3-4b-qlora

## Resumen

El modelo `arabic-legal-ocr-gemma-3-4b-qlora` es un adaptador LoRA (QLoRA) desarrollado por `ahmedyasser006` que ajusta el modelo base `google/gemma-3-4b-it` para la extracción de datos estructurados a partir de documentos legales árabes escaneados. Se enmarca en un pipeline de OCR legal que combina modelos de visión-lenguaje, destilación de conocimiento basada en Gemini y fine-tuning con LoRA, tal y como se describe en el repositorio asociado `ArabicOCR-VLM-Pipeline`.

El modelo resuelve el problema de convertir documentos jurídicos árabes de baja calidad de escaneo en texto y metadatos estructurados (JSON), aprovechando las capacidades multimodales del Gemma-3-4B-it y un adaptador de bajo rango para especializar el comportamiento sin reentrenar el modelo completo. El repositorio pesa 7.2 GB e incluye los pesos del adaptador en formato safetensors, con licencia Gemma.

La relevancia actual del modelo radica en la creciente demanda de digitalización de archivos judiciales y notariales en países de habla árabe, donde los documentos suelen estar en papel y con calidad de escaneo variable. Al estar basado en Gemma-3-4B-it, hereda una ventana de contexto de hasta 128K tokens y capacidades de razonamiento multimodal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con adaptador LoRA sobre google/gemma-3-4b-it |
| Parámetros totales | 4.000 millones (modelo base) + adaptador LoRA (tamaño no publicado) |
| Parámetros activos | 4.000 millones (no es MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base google/gemma-3-4b-it) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors sin cuantización explícita) |
| Idiomas soportados | Árabe (dominio legal) y los idiomas del modelo base (multilingüe) |
| Licencia | Gemma |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (bajo rango) entrenado con QLoRA sobre el modelo base `google/gemma-3-4b-it`, un transformer decoder-only con capacidades multimodales (visión y texto). La arquitectura subyacente del Gemma-3-4B-it incluye atención de ventana deslizante y soporte nativo para imágenes, lo que permite al adaptador especializarse en la extracción de texto y metadatos de documentos escaneados sin perder las capacidades generales del modelo base.

El entrenamiento se realizó sobre un dataset denominado `ocr_finetune_train`, cuyas características detalladas (número de muestras, composición, idioma) no se han publicado. Los hiperparámetros documentados incluyen una tasa de aprendizaje de 0.0001, 3 épocas, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler de tipo cosine con 50 pasos de warmup, batch total de 16 (con gradiente acumulación de 8 sobre 2 GPUs) y precisión mixta nativa AMP. La pérdida de validación final fue de 0.1686, con una evolución decreciente desde 0.2632 en el paso 100 hasta el valor final en el paso 700.

No se ha documentado el uso de técnicas de alineación como RLHF o DPO; el proceso descrito es exclusivamente de fine-tuning supervisado con pérdida de entropía cruzada.

## Capacidades

- Extracción de datos estructurados (JSON) de documentos legales árabes escaneados con baja calidad de imagen.
- Comprensión de documentos con ruido visual, inclinación y baja resolución, gracias a las capacidades de visión del modelo base.
- Generación de texto en árabe para resúmenes y descripciones de documentos jurídicos.
- Razonamiento multimodal: integra la información visual del escaneo con instrucciones textuales para producir metadatos precisos.
- Capacidades heredadas del Gemma-3-4B-it: generación de texto, razonamiento, código, matemáticas, soporte de tool calling y comprensión de imágenes.
- Soporte para despliegue en producción con vLLM y Gradio, tal como se describe en el pipeline asociado.
- Al estar basado en Gemma-3-4B-it, conserva la capacidad de manejar contextos largos (128K tokens), útil para documentos extensos.

## Casos de uso

- Digitalización de archivos judiciales: el modelo convierte expedientes y sentencias árabes escaneadas en texto estructurado, permitiendo búsqueda y consulta automatizada.
- Extracción de metadatos de contratos: identifica partes, fechas, cláusulas y montos en contratos legales árabes y los devuelve en JSON para su integración en bases de datos.
- Automatización de procesos notariales: integrado en un pipeline con vLLM y Gradio, permite a empleados de notarías subir escaneos y obtener formularios rellenados automáticamente.
- Archivado y cumplimiento normativo: digitaliza documentos legales antiguos en formato papel para cumplir con requisitos de conservación electrónica.
- Asistencia legal para despachos: genera resúmenes estructurados de expedientes legales árabes, reduciendo el tiempo de revisión manual.
- Sistemas de gestión documental (DMS): conectado a un backend, procesa lotes de escaneos y clasifica documentos por tipo y contenido.
- Integración en flujos de trabajo de OCR híbrido: combina la salida del modelo con herramientas de validación humana para verificar la exactitud de los metadatos extraídos en entornos de alta exigencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara un modelo-index vacío (`results: []`). El único dato de rendimiento documentado es la pérdida de validación final de 0.1686 durante el entrenamiento, sin métricas adicionales como exactitud, F1 o BLEU.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en fp16 (modelo base de 4B) y entre 3-4 GB en cuantización de 4 bits, más un margen para el adaptador LoRA.
- GPU recomendadas: RTX 4090 (24 GB) para ejecución local sin cuantización, o A100 (40/80 GB) y H100 para despliegue con vLLM en producción.
- Compatibilidad con GPU de consumo: sí, una RTX 3060 de 12 GB puede ejecutar el modelo en fp16; una RTX 4060 de 8 GB puede ejecutarlo con cuantización de 4 bits.
- Opciones de despliegue: vLLM (recomendado para producción), llama.cpp, Ollama, TGI (Text Generation Inference) y Gradio para demos interactivas.
- Latencia y throughput estimados: no disponibles. Depende del hardware y de la configuración de vLLM; para un modelo de 4B en A100 se espera un throughput del orden de decenas de requests por segundo, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ahmedyasser006/arabic-legal-ocr-gemma-3-4b-qlora | 4B (base) + LoRA | 128K | OCR de documentos legales árabes | Gemma | HuggingFace |
| bakrianoo/arabic-legal-documents-ocr-1.0 | 4B (base) + LoRA | 128K | Extracción de datos estructurados de documentos legales árabes escaneados | Gemma | Hugging Face |
| google/gemma-3-4b-it (base) | 4B | 128K | Modelo general multimodal | Gemma | Hugging Face |

El modelo se posiciona en la misma categoría que `bakrianoo/arabic-legal-documents-ocr-1.0`, ambos basados en Gemma-3-4B-IT y orientados a documentos legales árabes. La diferencia principal es el dataset de entrenamiento (no publicado en este caso) y la estrategia de adaptación (QLoRA vs LoRA estándar). Frente al modelo base, la especialización permite extraer metadatos estructurados de forma más fiable, pero pierde generalidad en tareas no relacionadas con el dominio legal.

## Limitaciones y advertencias

- Sesgos conocidos: no hay estudios publicados sobre sesgos; al entrenarse sobre documentos legales árabes, puede heredar sesgos de género, regionales o lingüísticos presentes en el corpus.
- Riesgo de alucinación: en documentos legales, la alucinación es crítica; el modelo puede inventar fechas, cláusulas o nombres si el escaneo es de muy baja calidad. Se recomienda validación humana en aplicaciones jurídicas.
- Limitaciones de contexto: aunque el modelo base soporta 128K tokens, el adaptador LoRA puede degradarse con contextos muy largos; no hay datos sobre el rendimiento en documentos extensos.
- Restricciones de licencia: la licencia Gemma incluye términos de uso de Google; para uso comercial, se debe revisar el acuerdo de licencia del modelo base (puede requerir solicitud o cumplir condiciones específicas).
- Documentación incompleta: el dataset de entrenamiento no está publicado, lo que dificulta la reproducibilidad y la evaluación de la calidad de los datos.
- Especialización de dominio: el modelo está optimizado para documentos legales árabes; su rendimiento en otros dominios o idiomas será significativamente menor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedyasser006/arabic-legal-ocr-gemma-3-4b-qlora
- Repositorio del pipeline (GitHub): https://github.com/mirofadlalla/ArabicOCR-VLM-Pipeline
- README del pipeline en GitHub: https://github.com/mirofadlalla/ArabicOCR-VLM-Pipeline/blob/main/README.md
- Modelo relacionado (bakrianoo): https://huggingface.co/bakrianoo/arabic-legal-documents-ocr-1.0
- Modelo base google/gemma-3-4b-it: https://huggingface.co/google/gemma-3-4b-it
- Descripción del modelo relacionado en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/arabic-legal-documents-ocr-1.0-bakrianoo

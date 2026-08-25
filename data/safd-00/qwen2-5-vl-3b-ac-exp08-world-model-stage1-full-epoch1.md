# SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch1

## Resumen

El modelo `SaFD-00/qwen2.5-vl-3b-ac-exp16-world-model-stage1-full-epoch1` es un fine-tuning del modelo multimodal Qwen2.5-VL-3B, desarrollado por el usuario SaFD-00 y publicado en HuggingFace. El nombre sugiere que se trata de una etapa de entrenamiento de un "modelo del mundo" (world model) con el dataset `ac-exp16`, probablemente orientado a la comprensión de entornos y agentes. Utiliza la arquitectura base Qwen2.5-VL, que combina un codificador visual con un transformer de lenguaje, y está optimizado para tareas de imagen-a-texto.

Con 3,75 mil millones de parámetros, el modelo se posiciona en el rango de 3B, lo que lo hace viable para despliegue en hardware de consumo con cuantización. El repositorio incluye pesos en formato `safetensors` y se integra con la librería `transformers` y el framework de entrenamiento `llama-factory`. No se ha publicado información sobre la licencia, los idiomas soportados ni el proceso de entrenamiento en la model card, por lo que su uso en producción requiere una evaluación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (vision-language transformer) |
| Parametros totales | 3.754.622.976 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-VL-3B soporta 32K tokens) |
| Tipos de cuantizacion | no disponible (pesos originales en fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es Qwen2.5-VL, un modelo de lenguaje multimodal que integra un codificador de visión (ViT) con un decoder transformer. El modelo procesa imágenes y texto de forma conjunta, permitiendo tareas de comprensión visual, OCR, localización de objetos y razonamiento multimodal. El fine-tune se ha realizado con `llama-factory` y el nombre del checkpoint indica una "etapa 1 de entrenamiento completo" de un modelo del mundo, probablemente usando un dataset específico `ac-exp16`. No se han publicado detalles sobre el volumen de datos, las hiperparámetros ni el proceso de entrenamiento (p. ej., si se usó RLHF o DPO). Tampoco se especifica si el modelo base fue congelado o si se actualizaron todos los pesos.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas de imagen y texto.
- Comprensión de imágenes: detección de objetos, OCR, análisis de escenas.
- Capacidad de responder preguntas sobre el contenido visual.
- Soporte de conversación multi-turno (image-text-to-text).
- Capacidades multilingües: no confirmadas; el modelo base Qwen2.5-VL es multilingüe (inglés, chino, etc.), pero este fine-tune no documenta idiomas.
- No se han confirmado capacidades específicas como tool calling o agentes en este checkpoint.

## Casos de uso

- Comprensión de entornos simulados: el nombre "world model" sugiere que el modelo puede ser usado para predecir estados futuros de un entorno (p. ej., en robótica o simulaciones), entrenado para modelar dinámicas visuales.
- Asistencia visual para personas con discapacidad: dado su tamaño de 3B, puede desplegarse en edge devices para describir escenas o leer texto en imágenes.
- Automatización de documentos: extracción de información de facturas, formularios o capturas de pantalla mediante OCR y razonamiento.
- Chatbots con comprensión de imágenes: integrarlo en un asistente que reciba fotos y responda preguntas sobre ellas.
- Análisis de vídeo (frames): aunque no se especifica, el modelo base soporta entrada de vídeo; este fine-tune podría usarse para análisis de secuencias de frames.
- Educación: herramientas de ayuda al estudio que responden a preguntas sobre diagramas, gráficos o ejercicios visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o resultados en tareas de visión-lenguaje (p. ej., DocVQA, ChartQA) para este checkpoint.

## Requisitos de hardware

- VRAM estimada: con pesos en fp16 (~7.5 GB), se necesita al menos 8 GB de VRAM para inferencia en lote pequeño. Con cuantización (p. ej., 4-bit), puede caber en 4-6 GB.
- GPU recomendadas: NVIDIA RTX 3090 (24 GB), RTX 4090 (24 GB), A10/A100 para producción, o GPUs consumer con 8-16 GB si se cuantiza.
- Cabe en GPU de consumo: sí, con cuantización (p. ej., GGUF) en RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Opciones de despliegue: transformers con `transformers` pipeline, vLLM (compatible con el tag `endpoints_compatible`), llama.cpp (si se convierte a GGUF), TGI (Text Generation Inference).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SaFD-00/qwen2.5-vl-3b-ac-exp16 (este) | 3.75B | no disponible | no disponible | Fine-tune de Qwen2.5-VL-3B |
| Qwen2.5-VL-3B (base) | 3.75B | 32K | Apache 2.0 | Modelo original multimodal |
| SaFD-00/qwen2.5-vl-7b-ac-2-world-model-stage1-full-epoch1 | ~8B | no disponible | no disponible | Variante de 7B del mismo autor |
| Llama-3.2-3B-VL (hipotético) | 3B | no disponible | no disponible | Alternativa multimodal (no confirmada) |

La comparativa se limita a modelos de tamaño similar. El modelo base Qwen2.5-VL-3B es la referencia principal; este fine-tune añade una etapa de "world model" sin documentar. No hay información sobre licencia ni rendimiento comparado.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos o limitaciones específicas; se recomienda evaluar el modelo en el dominio de aplicación antes de usarlo en producción.
- Al ser un fine-tune sin documentación, no se conoce la calidad del entrenamiento ni la composición del dataset, lo que puede afectar a la robustez y generalización.
- La licencia es "no disponible", lo que impide su uso comercial sin aclaración legal.
- El modelo puede alucinar contenido o errores en el análisis de imágenes, especialmente si el dataset de entrenamiento es limitado.
- La longitud de contexto no se especifica; si se usa el contexto del modelo base (32K), las entradas largas pueden degradar el rendimiento.
- No hay garantías de soporte multilingüe; la ausencia de datos de idiomas sugiere que el modelo puede estar limitado a un idioma o a datos de entrenamiento concretos.

## Enlaces

- Hugging Face: [https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp16-world-model-stage1-full-epoch1](https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp16-world-model-stage1-full-epoch1)
- Paper técnico de Qwen2.5-VL: [arXiv:2502.13923](https://arxiv.org/pdf/2502.13923v1)
- Modelos similares del autor (SaFD-00): [qwen2.5-vl-7b-ac-2-world-model-stage1-full-epoch1](https://huggingface.co/SaFD-00/qwen2.5-vl-7b-ac-2-world-model-stage1-full-epoch1), [qwen2.5-vl-7b-ac-stage1-full-world-model-epoch1](https://huggingface.co/SaFD-00/qwen2.5-vl-7b-ac-stage1-full-world-model-epoch1)

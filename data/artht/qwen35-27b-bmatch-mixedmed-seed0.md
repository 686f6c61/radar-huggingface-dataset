# ArthT/qwen35-27b-bmatch-mixedmed-seed0

## Resumen

El modelo `ArthT/qwen35-27b-bmatch-mixedmed-seed0` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen3.5-27B`, desarrollado por el usuario ArthT mediante entrenamiento supervisado (SFT) con las librerías TRL y Unsloth. El nombre del repositorio sugiere un entrenamiento orientado a dominios médicos mixtos ("mixedmed"), aunque no se proporciona documentación detallada sobre el conjunto de datos utilizado. El modelo base, lanzado por Alibaba en febrero de 2026, es un modelo denso multimodal de 27 000 millones de parámetros con arquitectura híbrida que combina Gated Delta Networks y redes feed-forward, y soporta una ventana de contexto de 262 000 tokens.

Este fine-tune se publica en formato safetensors y está pensado para ser cargado con la librería Transformers. Al ser una adaptación de un modelo ya capaz en razonamiento, código y comprensión multimodal, el resultado hereda las capacidades generales del base, aunque no se especifica si se conservan las funcionalidades de visión. La relevancia de este modelo radica en su potencial aplicación en entornos médicos o científicos donde se requiera un modelo de gran tamaño con contexto largo, aunque la falta de documentación y de benchmarks publicados limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated Delta Networks + Gated Attention + Feed Forward Networks (del modelo base) |
| Parametros totales | 27 000 millones (del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (del modelo base) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero no se especifica para el fine-tune) |
| Licencia | No disponible (el README indica "licence: license", sin detalle) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `Qwen3.5-27B` emplea una arquitectura densa multimodal que combina Gated Delta Networks (una variante de atención lineal eficiente) con mecanismos de atención tradicionales, junto con capas feed-forward. Esta hibridación permite manejar secuencias largas (hasta 262 000 tokens) con un coste computacional reducido en comparación con transformers puramente cuadráticos. El fine-tune se realizó mediante SFT (supervised fine-tuning) utilizando el framework TRL y la librería Unsloth, que optimiza el entrenamiento para reducir el uso de memoria y acelerar el proceso. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre "mixedmed" sugiere una mezcla de datos médicos, pero no hay confirmación oficial.

## Capacidades

- Generación de texto y razonamiento complejo, heredadas del modelo base.
- Comprensión y generación de código, matemáticas y razonamiento multi-paso (capacidades del modelo base).
- Soporte de tool calling y function calling (capacidad del modelo base, no confirmada para el fine-tune).
- Capacidades multimodales (visión-lenguaje) en el modelo base; no se especifica si el fine-tune las conserva.
- Ventana de contexto de 262 000 tokens, útil para documentos largos o conversaciones extensas.
- Soporte multilingüe en el modelo base, aunque no se detalla para esta adaptación.

## Casos de uso

- Análisis de documentación médica extensa: gracias a su contexto de 262 000 tokens, el modelo puede procesar historiales clínicos completos o artículos de investigación largos para extraer información relevante, aunque no se ha validado su rendimiento en este dominio.
- Asistencia en investigación biomédica: podría utilizarse para resumir y comparar múltiples papers científicos, generando síntesis de literatura, siempre que se verifique su precisión en el dominio.
- Generación de informes clínicos estructurados: a partir de notas médicas no estructuradas, el modelo podría redactar resúmenes o codificar diagnósticos, pero requiere validación con datos reales.
- Chatbots de atención al paciente: con su capacidad de diálogo multi-turno y contexto largo, podría mantener conversaciones extensas sobre síntomas o tratamientos, aunque la seguridad y fiabilidad deben auditarse.
- Procesamiento de contratos y documentos legales: la ventana de contexto permite analizar contratos completos, identificar cláusulas relevantes y generar resúmenes ejecutivos.
- Desarrollo de agentes de razonamiento multi-paso: al heredar las capacidades de tool calling del modelo base, podría integrarse en pipelines de automatización que requieran planificación y ejecución de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras evaluaciones para este fine-tune específico. El modelo base Qwen3.5-27B ha sido evaluado por el equipo de Qwen, pero esos resultados no se han trasladado a esta adaptación.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo denso de 27B parámetros, en FP16 se requieren aproximadamente 54 GB de VRAM; en INT8 unos 27 GB; en INT4 unos 13,5 GB. Sin embargo, no se ofrecen cuantizaciones oficiales en el repositorio.
- GPU recomendadas: para FP16, una NVIDIA A100 (80 GB) o H100 (80 GB); para INT8, una RTX 4090 (24 GB) podría ser insuficiente, necesitando al menos 32 GB (A100 40 GB o RTX A6000). Para INT4, una RTX 4090 o RTX 3090 (24 GB) sería viable.
- No cabe en GPUs de consumo de gama baja (8-12 GB) sin cuantizaciones extremas no publicadas.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se generan archivos GGUF), TGI (Text Generation Inference) y Transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles para este fine-tune; dependerán del hardware y de la optimización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-27B (base) | 27B | 262K | Densa híbrida | Apache 2.0 (según Qwen) | Hugging Face |
| Qwen3.5-35B-A3B | 35B total, 3B activos | 262K | MoE | Apache 2.0 | Hugging Face |
| Llama 3.1 70B | 70B | 128K | Densa | Llama License | Hugging Face |
| ArthT/qwen35-27b-bmatch-mixedmed-seed0 | 27B | 262K (base) | Densa híbrida | No disponible | Hugging Face |

La comparativa se basa en especificaciones del modelo base, ya que no hay datos de rendimiento del fine-tune. El modelo base es comparable a otros modelos densos de 27B, pero su arquitectura híbrida le otorga ventaja en eficiencia de contexto largo.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o comportamiento en dominios específicos; el uso en entornos médicos o legales requiere validación rigurosa.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o modificación.
- No se confirma si las capacidades multimodales del modelo base se conservan tras el fine-tune; si se necesitan, debe verificarse.
- El contexto de 262 000 tokens es el del modelo base, pero el fine-tune podría haber reducido la longitud máxima durante el entrenamiento; no se indica.
- Al ser un modelo de 27B, requiere hardware de gama alta para inferencia en tiempo real; sin cuantizaciones, el despliegue en entornos con recursos limitados es inviable.
- La falta de benchmarks y documentación técnica impide evaluar su calidad frente a otros modelos especializados en medicina o dominios similares.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ArthT/qwen35-27b-bmatch-mixedmed-seed0
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Colección de modelos Qwen3.5 de Unsloth: https://huggingface.co/collections/unsloth/qwen35
- Especificaciones y requisitos de VRAM de Qwen3.5-27B: https://apxml.com/models/qwen35-27b
- Recetas de vLLM para Qwen3.5-27B: https://recipes.vllm.ai/Qwen/Qwen3.5-27B
- Página del modelo en Vast.ai: https://vast.ai/model/qwen35-27b

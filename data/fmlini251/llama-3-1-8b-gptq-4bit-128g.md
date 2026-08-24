# fmlini251/Llama-3.1-8B-GPTQ-4bit-128g

## Resumen

El modelo `fmlini251/Llama-3.1-8B-GPTQ-4bit-128g` es una cuantización GPTQ de 4 bits con grupo de tamaño 128 del modelo base `meta-llama/Llama-3.1-8B` de Meta. Ha sido producido con AutoGPTQ 0.7.1 y publicado por el usuario fmlini251. Su propósito es reducir los requisitos de memoria y acelerar la inferencia del modelo original, manteniendo un equilibrio entre calidad y eficiencia. Es relevante para desarrolladores que necesitan ejecutar un modelo de 8.000 millones de parámetros en hardware con VRAM limitada, especialmente en entornos de producción donde el coste de GPU es un factor crítico. Al tratarse del modelo base (no instruct), no está alineado para seguir instrucciones, por lo que su uso principal es el fine-tuning o la extracción de representaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030 millones (8.03B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (oficial del modelo base) |
| Tipos de cuantizacion | GPTQ 4-bit, group size 128, simétrico, sin desc_act |
| Idiomas soportados | Inglés (según la model card del autor; el modelo base de Meta es multilingüe) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (formato GPTQ, fp16) |

## Arquitectura y entrenamiento

El modelo base Llama 3.1 8B es un transformer decoder-only con atención de consultas agrupadas (GQA), normalización RMSNorm y activación SwiGLU. Fue entrenado por Meta con aproximadamente 15 billones de tokens de datos públicos multilingües. La cuantización GPTQ se realizó sobre los pesos del modelo base sin fine-tuning posterior, utilizando el dataset `wikitext-2-raw-v1` (128 muestras, longitud de secuencia 2048) para la calibración. Los parámetros de cuantización son: 4 bits, group size 128, `damp_percent` 0.01, `desc_act` false, `sym` true y `true_sequential` true. El autor indica que la reproducción bit a bit no es posible debido a diferencias de hardware en la acumulación de la Hessiana, aunque el pipeline es determinista en un mismo entorno.

## Capacidades

- Generación de texto autocompletiva: al ser el modelo base, puede continuar secuencias de texto de forma coherente.
- Razonamiento y conocimiento general: hereda las capacidades del modelo Llama 3.1 8B base, incluyendo razonamiento básico, conocimiento factual y comprensión lectora.
- Generación de código: el modelo base tiene cierta capacidad de generación de código, aunque inferior a la versión instruct.
- Multilingüismo: aunque la model card del autor solo lista inglés, el modelo base de Meta soporta varios idiomas (español, francés, alemán, etc.), por lo que la cuantización no elimina esa capacidad.
- No soporta tool calling ni function calling de forma nativa, ya que no ha sido entrenado con instrucciones ni con datos de herramientas.
- No dispone de modo de razonamiento explícito (thinking mode) ni capacidades multimodales.

## Casos de uso

- Fine-tuning para tareas específicas: al ser el modelo base, es adecuado para fine-tuning con datasets propios en tareas como clasificación de texto, análisis de sentimiento o extracción de entidades. La cuantización 4-bit reduce el coste de entrenamiento con LoRA o QLoRA.
- Extracción de representaciones (embeddings): se puede utilizar para generar representaciones vectoriales de texto para sistemas de búsqueda semántica o clustering, aprovechando la ventana de contexto de 128k tokens.
- Generación de texto en entornos con recursos limitados: por su tamaño reducido (5.8 GB), puede ejecutarse en GPUs consumer de 8-12 GB, permitiendo prototipos de generación de texto sin necesidad de infraestructura cara.
- Investigación académica: sirve como base para estudiar el impacto de la cuantización GPTQ en modelos de 8B, comparando con el modelo original en tareas de perplexity o downstream.
- Desarrollo de pipelines de inferencia con AutoGPTQ: el checkpoint incluye metadatos de cuantización que permiten integrarse fácilmente en proyectos que usan AutoGPTQ o vLLM.
- Evaluación de calidad de cuantización: al no haber benchmarks publicados, puede usarse para medir la degradación de rendimiento frente al modelo FP16 en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la perplexity no ha sido medida para este checkpoint. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5.8 GB para los pesos en 4-bit, más overhead de activaciones y KV cache. Con contexto corto, cabe en GPUs de 8 GB; con contexto largo (128k), se requiere más memoria.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB), RTX 4080, A10, A100, H100. También puede ejecutarse en Apple Silicon con MPS, aunque no está optimizado.
- Sí cabe en GPUs consumer de gama media (8-12 GB) para inferencia con contexto moderado.
- Opciones de despliegue: AutoGPTQ (código de ejemplo incluido en la model card), vLLM (soporta GPTQ), Hugging Face Transformers con `device_map="auto"`. No es compatible directamente con llama.cpp (formato GGUF), pero se puede convertir.
- Latencia y throughput: no se han publicado mediciones. En una RTX 4090, un modelo 8B en 4-bit suele generar entre 50 y 100 tokens por segundo, pero esto es una estimación general, no un dato del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fmlini251/Llama-3.1-8B-GPTQ-4bit-128g | 8.03B | 128k | GPTQ 4-bit (group 128) | Llama 3.1 Community | Hugging Face |
| meta-llama/Llama-3.1-8B (original) | 8.03B | 128k | FP16 | Llama 3.1 Community | Hugging Face |
| hugging-quants/Meta-Llama-3.1-8B-Instruct-GPTQ-INT4 | 8.03B | 128k | GPTQ INT4 | Llama 3.1 Community | Hugging Face |

La diferencia principal con el modelo original es el tamaño (5.8 GB frente a ~16 GB en FP16) y la velocidad de inferencia. Frente a la versión instruct cuantizada, este checkpoint no está alineado para diálogo, por lo que no es adecuado para chatbots sin fine-tuning previo. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No es un modelo instruct: al ser el modelo base, no sigue instrucciones ni mantiene conversaciones de forma natural. Intentar usarlo como chatbot dará resultados pobres.
- Sesgos y alucinaciones: hereda los sesgos del modelo base de Meta, que puede reflejar estereotipos o generar contenido falso con alta confianza.
- Riesgo de alucinación: al no estar alineado, la probabilidad de generar información inventada es mayor que en la versión instruct.
- Limitaciones de idioma: aunque el modelo base es multilingüe, la model card del autor solo lista inglés; el rendimiento en otros idiomas puede ser inferior al del modelo original.
- Restricciones de licencia: la Llama 3.1 Community License permite uso comercial, pero si tu producto supera los 700 millones de usuarios mensuales, necesitas una licencia comercial de Meta.
- Reproducibilidad: el autor advierte que los pesos no son bit a bit reproducibles en diferentes hardware, lo que puede afectar a la depuración en entornos heterogéneos.
- Sin benchmarks: no hay datos de calidad publicados, por lo que el impacto de la cuantización en tareas downstream es desconocido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fmlini251/Llama-3.1-8B-GPTQ-4bit-128g
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- AutoGPTQ (herramienta de cuantización): https://github.com/PanQiWei/AutoGPTQ
- Ejemplo de cuantización similar (instruct): https://huggingface.co/hugging-quants/Meta-Llama-3.1-8B-Instruct-GPTQ-INT4

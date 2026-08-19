# circle1018/qwen3.5-0.8b-science-sft

## Resumen

El modelo `circle1018/qwen3.5-0.8b-science-sft` es un ajuste fino (fine-tune) supervisado del modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario circle1018. El objetivo declarado es especializar el modelo en tareas científicas, aunque el dataset de entrenamiento no se ha hecho público. El modelo base pertenece a la familia Qwen3.5 de Alibaba Cloud, una serie de modelos de lenguaje de código abierto con arquitectura híbrida que combina atención lineal con transformadores tradicionales, y que en su versión original es multimodal (texto, imagen y vídeo). Este fine-tune, sin embargo, se presenta como un modelo de generación de texto puro (etiqueta `qwen3_5_text`).

Con 752 millones de parámetros (0,8B) y una ventana de contexto de 32.000 tokens, este modelo está pensado para despliegue en entornos con recursos limitados, como dispositivos de borde o GPUs de consumo. La relevancia actual radica en que ofrece una alternativa compacta y de licencia permisiva (Apache 2.0) para aplicaciones científicas, aunque la ausencia de benchmarks publicados y de detalles sobre el dataset limita la evaluación objetiva de su rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención lineal + transformadores tradicionales) según el modelo base Qwen3.5-0.8B |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.000 tokens (según datos del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura híbrida que combina mecanismos de atención lineal con capas transformer tradicionales, lo que reduce el coste computacional en secuencias largas manteniendo la capacidad de razonamiento. El fine-tune conserva esta arquitectura y añade una capa de ajuste supervisado (SFT) sobre un dataset científico no especificado.

El entrenamiento se realizó con los siguientes hiperparámetros: learning rate de 2e-05, tamaño de batch total de 8 (con acumulación de gradientes de 2), optimizador AdamW, scheduler coseno con 10 pasos de warmup y 4 épocas. La pérdida de validación final fue de 0,1610, con una evolución decreciente desde 1,1294 en el paso 25 hasta 0,1610 en el paso 272. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT.

## Capacidades

- Generación de texto y seguimiento de instrucciones, heredadas del modelo base Qwen3.5-0.8B.
- Razonamiento y comprensión de lenguaje natural, con mejoras declaradas sobre Qwen3 en el modelo base.
- Capacidad de procesamiento de contexto largo (32K tokens), útil para documentos científicos extensos.
- El modelo base es multimodal (texto, imagen, vídeo), pero este fine-tune se presenta como texto puro; no se confirma si conserva las capacidades multimodales.
- No se dispone de información sobre soporte de tool calling, function calling o capacidades de agente en este fine-tune.
- Idiomas soportados: no disponible; el modelo base Qwen3.5 es multilingüe, pero no se especifica para este ajuste.

## Casos de uso

- Asistencia en educación científica: el modelo puede generar explicaciones de conceptos de física, química o biología, adaptadas a un nivel educativo concreto, gracias a su capacidad de seguir instrucciones y su contexto de 32K para manejar preguntas detalladas.
- Resolución de problemas de ciencias: al estar ajustado con datos científicos, podría emplearse para plantear y resolver ejercicios de matemáticas o ciencias naturales, aunque no hay evidencia pública de su precisión en estos dominios.
- Generación de resúmenes de artículos científicos: su ventana de contexto permite procesar abstracts o secciones completas de papers y producir resúmenes concisos.
- Chatbots de consulta técnica en entornos con recursos limitados: al ser un modelo de 0,8B, puede desplegarse en CPUs o GPUs de baja gama, ofreciendo respuestas a preguntas frecuentes sobre temas científicos en aplicaciones de atención al cliente o foros.
- Prototipado rápido de aplicaciones de IA conversacional: su licencia Apache 2.0 y su tamaño reducido facilitan la integración en pipelines de desarrollo sin costes de licencia.
- Análisis de datos textuales en investigación: puede utilizarse para extraer entidades, clasificar textos o generar anotaciones en corpus científicos, aunque su rendimiento en tareas estructuradas no está validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor declara únicamente la pérdida de validación (0,1610) y no incluye métricas como MMLU, HumanEval o GSM8K. Por tanto, no es posible comparar objetivamente su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 752M parámetros, en FP16 ocupa aproximadamente 1,5 GB de memoria; en cuantización de 8 bits (~0,75 GB) o 4 bits (~0,4 GB) cabe en GPUs con 2 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, o incluso integradas con soporte de cuantización. Para inferencia rápida, una RTX 4090 o A100 ofrecería latencias muy bajas.
- Es viable en CPU: con cuantización de 4 bits, puede ejecutarse en procesadores modernos, aunque con mayor latencia.
- Opciones de despliegue: compatible con transformers, vLLM, llama.cpp, Ollama y TGI, dado que el modelo base está disponible en esos formatos.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización. En una GPU de gama media, se esperan decenas de tokens por segundo para un modelo de este tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Arquitectura | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (base) | 0,8B | 32K | Apache 2.0 | Híbrida (lineal + transformer) | HuggingFace, Ollama |
| Qwen3-0.8B | 0,8B | 32K | Apache 2.0 | Transformer denso | HuggingFace, Ollama |
| Llama-3.2-1B | 1,2B | 128K | Llama 3.2 (uso comercial permitido) | Transformer denso | HuggingFace, Ollama |
| Phi-3-mini | 3,8B | 128K | MIT | Transformer denso | HuggingFace, Ollama |

El modelo fine-tune se diferencia del base únicamente por el ajuste científico, pero no se dispone de datos de rendimiento comparativo. En términos de tamaño y licencia, es comparable a otros modelos compactos de la misma generación.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: no se especifica la composición ni el origen de los datos científicos, lo que impide evaluar sesgos o cobertura temática.
- Sin benchmarks publicados: no hay evidencia objetiva de su rendimiento en tareas científicas o generales.
- Modelo pequeño: con 0,8B parámetros, su capacidad de razonamiento complejo y de generación de código es limitada en comparación con modelos de mayor tamaño.
- Posibles alucinaciones: como todo modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en dominios especializados.
- Idiomas no especificados: aunque el modelo base es multilingüe, no se confirma qué idiomas conserva el fine-tune.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda validar el comportamiento en el dominio de aplicación antes de desplegarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/circle1018/qwen3.5-0.8b-science-sft
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Página de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:0.8b
- Ficha de Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
- Guía de Qwen3.5 (familia completa): https://qwen-ai.com/qwen-3-5/
- Análisis de rendimiento de Qwen3.5 0.8B: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
- Datos de contexto y descargas: https://www.canirun.ai/model/qwen3.5-0.8b

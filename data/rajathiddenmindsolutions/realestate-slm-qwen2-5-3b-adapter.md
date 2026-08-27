# rajathiddenmindsolutions/realestate-slm-qwen2.5-3b-adapter

## Resumen

El modelo `realestate-slm-qwen2.5-3b-adapter` es un adaptador de fine-tuning sobre el modelo base `unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit`, desarrollado por `rajathiddenmindsolutions`. Se trata de un SLM (small language model) especializado en el dominio inmobiliario, con 3.085.938.688 parámetros y licencia Apache-2.0. El adaptador fue entrenado con la librería Unsloth y el framework TRL de Hugging Face, lo que permite un ajuste eficiente sobre un modelo ya optimizado para instrucciones.

La relevancia de este modelo radica en su tamaño compacto (3B parámetros) combinado con una especialización vertical en el sector inmobiliario, lo que lo hace adecuado para despliegues con recursos limitados y tareas específicas como descripción de propiedades, atención al cliente o generación de contenido inmobiliario. Al estar basado en Qwen2.5, hereda las capacidades generales de razonamiento y generación de texto de la familia Qwen, pero adaptadas a un dominio concreto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-3B) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-3B soporta 32.768 tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible (el modelo base usa bnb-4bit, pero el adaptador se distribuye en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA/QLoRA (no se especifica explícitamente, pero el modelo base está cuantizado a 4-bit con bitsandbytes, lo que sugiere QLoRA) sobre el transformer decoder de Qwen2.5-3B-Instruct. La arquitectura subyacente es un transformer causal estándar con atención de múltiples cabezas, normalización RMSNorm y embeddings rotatorios (RoPE). El entrenamiento se realizó con Unsloth, que acelera el fine-tuning mediante kernels optimizados, y con la librería TRL de Hugging Face, que proporciona utilidades para entrenamiento con instrucciones y RLHF.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de post-entrenamiento (si hubo RLHF, DPO, etc.). El adaptador se publica como un modelo independiente, pero requiere el modelo base para su uso en inferencia.

## Capacidades

- Generación de texto especializada en el dominio inmobiliario: descripciones de propiedades, anuncios, respuestas a consultas de clientes.
- Razonamiento conversacional multi-turno, heredado de Qwen2.5-Instruct.
- Comprensión de instrucciones en inglés, con capacidad de seguir comandos específicos del sector.
- No se documentan capacidades de tool calling, agentes, visión o audio en la información proporcionada.
- Al ser un modelo de 3B, su rendimiento en tareas generales es limitado en comparación con modelos más grandes, pero suficiente para tareas de nicho.

## Casos de uso

- Generación de descripciones de propiedades: el modelo puede redactar anuncios atractivos y detallados a partir de datos estructurados (superficie, número de habitaciones, ubicación), ahorrando tiempo a agentes inmobiliarios.
- Atención al cliente automatizada: integrado en un chatbot, puede responder preguntas frecuentes sobre disponibilidad, precios o características de inmuebles, manteniendo conversaciones coherentes.
- Clasificación y etiquetado de listados: dado un texto de entrada, el modelo puede extraer entidades como tipo de propiedad, precio, ubicación o estado, facilitando la indexación en portales inmobiliarios.
- Redacción de correos de seguimiento: genera mensajes personalizados para compradores o vendedores, basados en el historial de interacción.
- Traducción de terminología inmobiliaria: aunque el modelo solo soporta inglés, puede ayudar a normalizar vocabulario técnico dentro de ese idioma.
- Asistente para tasaciones: con datos de entrada, puede generar informes preliminares de valoración, aunque se requiere supervisión humana para decisiones finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador. El rendimiento debe inferirse a partir del modelo base Qwen2.5-3B-Instruct, que en el reporte técnico de Qwen2.5 muestra resultados moderados en tareas generales, pero no se dispone de cifras específicas para este fine-tuning.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 3B parámetros, en FP16 ocupa aproximadamente 6 GB, en 4-bit alrededor de 1,5-2 GB. Estas cifras son estimaciones estándar para modelos de este tamaño, no datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en cuantización 4-bit; para FP16 se recomienda 8 GB o más. Ejemplos: NVIDIA RTX 3060, RTX 4060, A10, L4.
- Es compatible con GPUs de consumo (RTX series) y con GPUs de datacenter (A100, H100) si se requiere mayor throughput.
- Opciones de despliegue: al ser un adaptador de transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. También es compatible con el ecosistema Hugging Face (transformers, peft).
- Latencia y throughput: no disponible. Para un modelo de 3B, se espera una latencia de decodificación de decenas de milisegundos por token en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| realestate-slm-qwen2.5-3b-adapter | 3.085.938.688 | no disponible | Apache-2.0 | Inmobiliario |
| Qwen2.5-3B-Instruct (base) | 3.085.938.688 | 32.768 | Apache-2.0 | General |
| Llama-3.2-3B-Instruct | 3.210.000.000 | 128.000 | Llama 3.2 Community | General |
| Phi-3-mini-4k-instruct | 3.820.000.000 | 4.096 | MIT | General |

La comparativa se basa en características generales; no hay datos de rendimiento específicos para el adaptador. El modelo se diferencia por su fine-tuning en el dominio inmobiliario, pero carece de la versatilidad de los modelos generales.

## Limitaciones y advertencias

- Sesgos: al ser un fine-tuning sobre un modelo base, puede heredar sesgos presentes en los datos de entrenamiento de Qwen2.5, así como sesgos específicos del dataset inmobiliario utilizado (no disponible).
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de tasación o datos numéricos. Se recomienda verificación humana.
- Limitaciones de contexto: no se especifica la longitud de contexto del adaptador; si se usa el contexto del modelo base (32k), puede manejar conversaciones largas, pero no está confirmado.
- Idioma: solo soporta inglés, lo que limita su uso en mercados hispanohablantes.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5 también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- Para producción, es necesario cargar el adaptador sobre el modelo base cuantizado, lo que añade complejidad de despliegue. No se proporcionan instrucciones de uso ni ejemplos de inferencia.

## Enlaces

- HuggingFace: https://huggingface.co/rajathiddenmindsolutions/realestate-slm-qwen2.5-3b-adapter
- Modelo base: https://huggingface.co/unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit
- Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Reporte técnico Qwen2.5: https://arxiv.org/abs/2412.15115
- Repositorio Qwen3 (para referencia): https://github.com/QwenLM/Qwen3
- Blog de Qwen2.5: https://qwen.ai/blog?id=qwen2.5

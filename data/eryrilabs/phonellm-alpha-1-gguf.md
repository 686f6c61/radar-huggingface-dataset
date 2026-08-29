# EryriLabs/phonellm-alpha-1-GGUF

## Resumen

PhoneLLM Alpha 1 es un modelo de lenguaje especializado en conversación telefónica y agentes de voz, desarrollado por Pipecat AI como un fine-tuning de NVIDIA Nemotron 3 Nano 30B-A3B. Este repositorio contiene cuantizaciones GGUF no oficiales creadas por EryriLabs, que permiten ejecutar el modelo con llama.cpp en entornos locales o de producción con requisitos de hardware reducidos.

El modelo base emplea una arquitectura Nemotron-H, una combinación híbrida de capas Mamba (state space) y atención tradicional, con diseño mixture-of-experts (MoE) de 30 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token. Está optimizado para tareas de agente de voz, tool-use y function-calling, lo que lo hace adecuado para automatizar interacciones telefónicas complejas.

La relevancia de esta conversión GGUF radica en que democratiza el acceso a un modelo de agente de voz de última generación, permitiendo su despliegue en hardware de consumo (GPU con 24 GB de VRAM) mediante cuantizaciones como Q4_K_M, sin necesidad de infraestructura en la nube. La licencia BSD 2-Clause facilita su uso comercial, aunque con restricciones derivadas de la licencia NVIDIA subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (híbrida Mamba-atención, MoE) |
| Parametros totales | 31.577.940.288 (aprox. 30B) |
| Parametros activos | ~3B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M, Q3_K_M (con fallbacks a tipos legacy) |
| Idiomas soportados | inglés |
| Licencia | BSD 2-Clause (con licencia NVIDIA Nemotron Open Model License para el trabajo derivado) |
| Formato de pesos | GGUF (safetensors como fuente) |

## Arquitectura y entrenamiento

El modelo base PhoneLLM Alpha 1 es un fine-tuning de NVIDIA Nemotron 3 Nano 30B-A3B, que utiliza una arquitectura Nemotron-H: una combinación de capas de atención tradicional y capas basadas en state space models (Mamba), organizadas en un diseño mixture-of-experts con 30B parámetros totales y ~3B activos por token. Esta arquitectura híbrida busca equilibrar la eficiencia computacional de Mamba con la capacidad de razonamiento de la atención, manteniendo un coste de inferencia bajo gracias al MoE.

El fine-tuning realizado por Pipecat AI se centra en tareas de conversación telefónica, tool-use y function-calling, aunque no se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas como RLHF o DPO. La conversión a GGUF se realizó con llama.cpp release b10672, partiendo de los pesos BF16 en safetensors del repositorio oficial.

Un aspecto técnico destacable es que los tensores de peso tienen columnas de 1856, 2688 y 3712, que no son divisibles por 256 (el tamaño de superbloque requerido por los K-quants de llama.cpp). Esto provoca que `llama-quantize` aplique fallbacks a tipos de bloque legacy (Q3_K → Q4_0, Q4_K → Q5_0, Q6_K → Q8_0), resultando en archivos más grandes de lo esperado pero con una calidad potencialmente superior a la que sugieren los nombres de cuantización.

## Capacidades

- Generación de texto conversacional optimizada para diálogos telefónicos multi-turno.
- Soporte de tool-use y function-calling, permitiendo al modelo invocar APIs o acciones externas durante una conversación.
- Diseñado para agentes de voz, con capacidad de gestionar interrupciones, silencios y turnos de habla.
- Integración con el framework Pipecat para pipelines de voz en tiempo real.
- Razonamiento multi-paso implícito a través de la combinación de Mamba y atención, aunque no se especifica un modo de "thinking" explícito.
- Multilingüe: únicamente inglés (según la etiqueta `language: en`).

## Casos de uso

- Atención al cliente automatizada por teléfono: el modelo puede gestionar llamadas entrantes, resolver consultas frecuentes y derivar a un agente humano cuando sea necesario, gracias a su capacidad de mantener conversaciones coherentes y su soporte de function-calling para consultar bases de datos o sistemas CRM.
- Asistentes de voz para reservas y citas: integrado en un sistema de voz, puede manejar reservas de restaurantes, citas médicas o servicios de transporte, extrayendo información del usuario y confirmando detalles mediante tool-use.
- Automatización de llamadas de seguimiento: para campañas de marketing o recordatorios de pagos, el modelo puede realizar llamadas salientes, verificar información y actualizar registros en tiempo real.
- Desarrollo de agentes de voz personalizados: los desarrolladores pueden usar las cuantizaciones GGUF con llama.cpp para prototipar y desplegar agentes de voz en entornos locales, sin depender de APIs en la nube.
- Integración en pipelines de Pipecat: al ser el modelo base de Pipecat AI, se puede combinar con su framework para construir aplicaciones de voz completas, incluyendo transcripción, síntesis y gestión de diálogo.
- Evaluación de modelos de voz en investigación: al estar disponible en formato GGUF, facilita la experimentación con diferentes cuantizaciones para medir el equilibrio entre rendimiento y uso de recursos en tareas de conversación telefónica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de tareas de voz. Se recomienda consultar la model card oficial de pipecat-ai/phonellm-alpha-1 para posibles datos de evaluación, aunque no se han encontrado en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - F16: ~63.2 GB (requiere GPU con 80 GB, como A100 o H100)
  - Q8_0: ~33.6 GB (requiere GPU con 40 GB, como A100 40GB o 2x RTX 3090)
  - Q4_K_M: ~24.5 GB (cabe en una RTX 3090/4090 de 24 GB, aunque con margen limitado para contexto)
  - Q3_K_M: ~19.8 GB (cabe en GPUs de 24 GB con mayor margen, o en algunas de 20 GB)
- GPU recomendadas: para Q4_K_M y Q3_K_M, una RTX 3090 o RTX 4090 es suficiente; para Q8_0, se recomienda una A100 40GB o equivalente; para F16, una A100 80GB o H100.
- Sí cabe en GPUs de consumo (RTX 3090/4090) con las cuantizaciones Q4_K_M y Q3_K_M.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), compatible con Ollama si se importa el GGUF, y potencialmente con vLLM si se añade soporte para Nemotron-H (no confirmado).
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño activo de ~3B, se espera una inferencia rápida en GPUs modernas, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PhoneLLM Alpha 1 (GGUF, este repo) | 30B totales / ~3B activos | no disponible | BSD 2-Clause + NVIDIA | GGUF | Cuantizaciones con fallbacks, archivos más grandes de lo esperado |
| pipecat-ai/phonellm-alpha-1 (original) | 30B totales / ~3B activos | no disponible | BSD 2-Clause + NVIDIA | Safetensors | Modelo base sin cuantizar, requiere más VRAM |
| NVIDIA Nemotron 3 Nano 30B-A3B | 30B totales / ~3B activos | no disponible | NVIDIA Nemotron Open Model License | Safetensors | Modelo base original, sin fine-tuning para voz |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a características técnicas y de licencia. Otros modelos de agente de voz como GPT-4o o modelos propietarios no son directamente comparables por diferencias de arquitectura y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información proporcionada, pero al ser un modelo entrenado principalmente en inglés, puede presentar sesgos culturales o lingüísticos en otros idiomas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en conversaciones abiertas. Se recomienda validar las respuestas críticas.
- Limitaciones de contexto: la longitud de contexto no está especificada, lo que dificulta planificar conversaciones muy largas. Se recomienda probar con el contexto máximo que soporte la implementación de llama.cpp.
- Restricciones de licencia: aunque la licencia principal es BSD 2-Clause, el modelo deriva de NVIDIA Nemotron 3, cuya licencia (NVIDIA Nemotron Open Model License) impone condiciones adicionales, como la retención de avisos de copyright y posibles restricciones de uso comercial. Es crucial revisar ambos documentos de licencia antes de usar el modelo en producción.
- Caveat de cuantización: los archivos GGUF son más grandes de lo que sugieren sus nombres (Q4_K_M es ~24.5 GB en lugar de ~17 GB típico para 30B), y la mezcla real de tipos de cuantización (Q5_0, Q8_0, etc.) puede afectar el rendimiento de manera impredecible. No se publica Q6_K porque su fallback a Q8_0 lo hace redundante.
- Requisitos de versión: se necesita llama.cpp b10672 o superior con soporte para Nemotron-H; versiones anteriores no podrán cargar el modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/EryriLabs/phonellm-alpha-1-GGUF
- Modelo base oficial: https://huggingface.co/pipecat-ai/phonellm-alpha-1
- Modelo base NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Cuantización alternativa (Null-Byte): https://huggingface.co/Null-Byte/PhoneLLM-alpha-1-Q4_K_M

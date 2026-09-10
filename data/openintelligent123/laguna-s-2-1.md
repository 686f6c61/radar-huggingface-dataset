# Openintelligent123/Laguna-S-2.1

## Resumen

Laguna S 2.1 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por poolside, diseñado especificamente para tareas de codificacion agente (agentic coding) y trabajo de larga duracion (long-horizon work). Forma parte de la familia Laguna, situandose entre Laguna XS 2.1 (33B-A3B) y Laguna M.1 (225B-A23B). El modelo esta disponible en HuggingFace bajo el usuario Openintelligent123, aunque los artefactos originales y la documentacion de referencia pertenecen a poolside.

La arquitectura combina 118B parametros totales con 8B parametros activos por token, lo que lo hace computacionalmente eficiente para su tamano. Dispone de una ventana de contexto de 1.048.576 tokens (1M), soporte de razonamiento intercalado con llamadas a herramientas y decodificacion especulativa mediante un modelo borrador DFlash. El checkpoint BF16 ocupa aproximadamente 236GB, por lo que requiere multiples GPUs para su despliegue, aunque existen variantes cuantizadas FP8, NVFP4, INT4 y GGUF que reducen sustancialmente los requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con token-choice router |
| Parametros totales | 117.561.977.600 (118B) |
| Parametros activos | 8B activados por token (top-10 de 256 experts) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | BF16, FP8, NVFP4, INT4, GGUF |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (BF16) y GGUF para cuantizaciones |

Detalles adicionales de arquitectura:

| Parametro | Valor |
|---|---|
| Capas totales | 48 (12 atención global, 36 atención sliding-window) |
| Experts | 256 rutados (top-10) + 1 shared expert |
| Atención | Grouped-query attention, 8 KV heads, head dim 128 |
| Ventana deslizante | 512 tokens |
| Vocabulario | 100.352 tokens (tokenizer familia Laguna) |
| Modo de razonamiento | Interleaved thinking con preserved thinking |
| Proporción global/SWA | 1:3 (12 capas globales, 36 SWA) |
| Gating | Softplus gating por token y por head |

## Arquitectura y entrenamiento

Laguna S 2.1 utiliza una arquitectura MoE con un token-choice router que aplica softplus gating sobre 256 expertos ruteados y un experto compartido adicional. La atención es grouped-query attention con 8 cabezas KV y una dimensión de cabeza de 128. El modelo implementa un esquema de atención híbrida intercalada que combina capas de atención global con capas de atención de ventana deslizante (sliding-window) de 512 tokens, en una proporción 1:3 (12 capas globales frente a 36 de ventana deslizante). Cada capa aplica gating softplus a nivel de cabeza y emplea escalas rótatorias específicas por tipo de capa.

Los datos de entrenamiento, el número de tokens y la composición del dataset no están disponibles en la documentación pública. Se desconoce si se aplicaron técnicas de RLHF, DPO o similar. La innovación técnica destacable incluye el soporte nativo de razonamiento intercalado (interleaved thinking) entre llamadas a herramientas, controlable por petición mediante el parámetro `enable_thinking`, y la disponibilidad de un modelo borrador DFlash para decodificación especulativa, que permite reducir la latencia durante el despliegue en servidores compatibles.

## Capacidades

- Generación de texto-to-text con soporte de razonamiento intercalado (interleaved thinking) entre llamadas a herramientas, con preservación del razonamiento y control por petición mediante `enable_thinking`.
- Codificación agente (agentic coding): resolución de tareas de ingeniería de software en repositorios reales, tal como reflejan los resultados en Terminal-Bench 2.1 y SWE-bench multilenguaje.
- Soporte de tool calling / function calling mediante el parser `poolside_v1`, integrable en vLLM, SGLang y TRT-LLM.
- Ventana de contexto de 1M tokens que permite procesar repositorios completos, documentación extensa y diálogos de larga duración.
- Decodificación especulativa con el modelo borrador DFlash, configurable vía `--speculative-config` en vLLM.
- Capacidades multilingües evidenciadas en el benchmark SWE-bench Multilingual con un 78.5%, aunque el modelo no publica una lista explícita de idiomas soportados.
- Capacidad para consultas sobre código (codebase Q&A) y razonamiento multi-step, como indica el benchmark SWE Atlas.
- Modo de razonamiento "preserved thinking", que conserva los pasos de razonamiento en la salida del modelo.

## Casos de uso

- **Desarrollo de software agéntico**: el modelo puede abordar issues de GitHub o tickets de bug en repositorios reales, generando parches y modificaciones de código en múltiples pasos. Su rendimiento de 59.4% en SWE-Bench Pro y 70.2% en Terminal-Bench 2.1 lo hace apto para automatizar tareas de mantenimiento y desarrollo.

- **Asistente de programación con contexto largo**: gracias a su ventana de 1M de tokens, puede analizar un repositorio completo, incluyendo archivos de configuración, historial de cambios y documentación, para responder preguntas complejas sobre la arquitectura o el comportamiento del sistema.

- **Análisis y Q&A sobre codebases**: integrable en herramientas de revisión de código, puede responder preguntas sobre la estructura de un proyecto, patrones de uso, dependencias o lógica de negocio, con una precisión medida en SWE Atlas (Codebase QnA) de 46.2%.

- **Automatización de CI/CD**: al soportar tool calling mediante el parser `poolside_v1`, puede integrarse en pipelines de integración continua para ejecutar análisis estáticos, sugerir correcciones e incluso lanzar comandos de compilación o tests de forma automatizada.

- **Refactorización de código legacy**: con razonamiento intercalado y soporte de herramientas, el modelo puede descomponer tareas de refactorización complejas, proponer cambios incrementales y validar que la funcionalidad original se mantiene mediante ejecución de tests.

- **Equipos de desarrollo multilingües**: con un 78.5% en SWE-bench Multilingual, es adecuado para entornos donde el código y los requisitos están en varios idiomas, facilitando la colaboración en equipos distribuidos.

- **Chatbots de soporte técnico especializados en software**: puede gestionar conversaciones de larga duración con usuarios que necesitan asistencia técnica sobre una base de código concreta, proporcionando respuestas contextualizadas y accionables.

## Benchmarks y rendimiento

Resultados publicados en la model card (21 de julio de 2026). Los valores marcados con * son reportados por terceros.

| Modelo | Tamano | Terminal-Bench 2.1 | SWE-bench Multilingual | SWE-Bench Pro (Public Dataset) | DeepSWE | SWE Atlas (Codebase QnA) | Toolathlon Verified |
|---|---|---|---|---|---|---|---|
| **Laguna S 2.1** | 118B-A8B | **70.2%** | **78.5%** | **59.4%** | **40.4%** | **46.2%** | **49.7%** |
| Tencent Hy3 | 295B-A21B | 71.7% | 75.8% | 57.9% | - | - | - |
| DeepSeek-V4-Pro Max | 1.6T-A49B | 64.0%* | 76.2% | 55.4% | 9.0%* | 27.2%* | 55.9%* |
| Kimi K3 | 2800B-A50B | 88.3% | - | - | 69% | - | - |
| Qwen 3.7 Max | - | 74.5%* | 78.3% | 60.6% | - | - | - |
| Muse Spark 1.1 | - | 80% | - | 61.5% | 53.3% | 42.2%* | 75.6% |
| Claude Fable 5 | - | 88% | - | 80.3% | 70% | - | - |

Un guion (-) indica que el modelo no fue evaluado en ese benchmark. Los datos de trazas completas de evaluación están disponibles en trajectories.poolside.ai.

## Requisitos de hardware

- **Checkpoint BF16**: el modelo necesita aproximadamente 236GB solo para los pesos. Se requiere un mínimo de 4 GPUs con al menos 80GB de VRAM cada una (por ejemplo, 4x A100 80GB o 4x H100 80GB) para ejecutar con tensor-parallel size 4.
- **Con cuantización FP8**: al reducir los pesos a 1 byte por parámetro, la memoria estimada ronda los 118GB, lo que permite ejecución en 2x H100 80GB o en una configuración con más margen en 4x A100 80GB.
- **Con cuantización NVFP4 o INT4**: la memoria estimada ronda los 59GB, lo que posibilita inferencia en una sola GPU de 80GB (por ejemplo, H100/A100) o en GPUs de consumidor de 24GB mediante offloading de CPU con llama.cpp, aunque con una latencia significativamente mayor.
- **Opciones de despliegue**: vLLM (con soporte para decodificación especulativa), SGLang, TRT-LLM y llama.cpp. Todos ellos requieren `--trust-remote-code` para cargar la arquitectura custom `laguna`.
- **Latencia y throughput**: no disponibles en la documentación pública. El uso de decodificación especulativa con el modelo borrador DFlash está diseñado para reducir la latencia, pero no se publican cifras concretas.

## Comparativa con modelos similares

Comparación basada en la tabla de benchmarks de la model card, centrada en modelos MoE de gran tamaño orientados a tareas de codificación:

| Modelo | Parametros | Contexto | Terminal-Bench 2.1 | SWE-bench Multilingual | Licencia |
|---|---|---|---|---|---|
| **Laguna S 2.1** | 118B-A8B | 1M | 70.2% | 78.5% | OpenMDW-1.1 |
| Tencent Hy3 | 295B-A21B | no disponible | 71.7% | 75.8% | no disponible |
| DeepSeek-V4-Pro Max | 1.6T-A49B | no disponible | 64.0%* | 76.2% | no disponible |
| Kimi K3 | 2800B-A50B | no disponible | 88.3% | - | no disponible |

En tareas de agentic coding, Laguna S 2.1 compite favorablemente con modelos de mayor tamaño como Tencent Hy3, superándolo en SWE-bench Multilingual (78.5% vs 75.8%) pero por debajo en Terminal-Bench 2.1 (70.2% vs 71.7%). Su principal ventaja es la menor cantidad de parámetros activos (8B) en comparación con las alternativas, lo que se traduce en un coste de inferencia menor por token. La licencia OpenMDW-1.1 es totalmente permisiva para uso comercial, una diferencia clave frente a los competidores de los que no se dispone de información de licencia.

## Limitaciones y advertencias

- **Idiomas soportados**: no documentados explícitamente. Aunque el benchmark SWE-bench Multilingual sugiere capacidades en varios idiomas, no existe una lista oficial de lenguas soportadas.
- **Datos de entrenamiento**: no se publican detalles sobre el corpus, el número de tokens ni el proceso de alineación. Esto impide evaluar la calidad de los datos y su posible sesgo.
- **Sesgos y alucinaciones**: no se han publicado evaluaciones de sesgo, robustez o tasas de alucinación. Cualquier despliegue en producción requiere una validación exhaustiva por parte del usuario.
- **Requisitos de hardware elevados**: el checkpoint BF16 de 236GB no es ejecutable en hardware de consumo. Es necesario un clúster de GPUs de datacenter para el despliegue estándar.
- **Verificación de procedencia**: el modelo está disponible en HuggingFace bajo el usuario Openintelligent123, mientras que la documentación y los artefactos de referencia son de poolside. La integridad de los pesos debe verificarse antes del uso en entornos críticos.
- **No hay información sobre seguridad**: se desconoce si el modelo ha pasado evaluaciones de jailbreaking, prompt injection o equivalente para tareas agénticas.
- **Rendimiento en tareas no evaluadas**: los benchmarks publicados se centran en codificación y herramientas. El rendimiento en tareas generales de lenguaje (MMA, GSM8K, etc.) no se ha publicado.

## Enlaces

- HuggingFace: https://huggingface.co/Openintelligent123/Laguna-S-2.1
- Blog de lanzamiento: https://poolside.ai/blog/introducing-laguna-s-2-1
- Uso en OpenRouter: https://openrouter.ai/poolside/laguna-s-2.1
- Uso en Vercel AI Gateway: https://vercel.com/ai-gateway/models/laguna-s-2.1
- Modelo borrador DFlash: https://huggingface.co/poolside/Laguna-S-2.1-DFlash
- Variante FP8: https://huggingface.co/poolside/Laguna-S-2.1-FP8
- Variante NVFP4: https://huggingface.co/poolside/Laguna-S-2.1-NVFP4
- Variante INT4: https://huggingface.co/poolside/Laguna-S-2.1-INT4
- Variante GGUF: https://huggingface.co/poolside/Laguna-S-2.1-GGUF
- Trazas de evaluación: https://trajectories.poolside.ai
- Información sobre la licencia OpenMDW: https://openmdw.ai/

# hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview-mtp-GGUF

## Resumen

El modelo `hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview-mtp-GGUF` es una cuantización GGUF del fine-tune de análisis de código `hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview`, desarrollado por el usuario `hotdogs`. Se trata de un modelo de razonamiento que, dado un fragmento de código, devuelve una revisión estructurada en varios párrafos: bugs reales, razonamiento a nivel de línea, severidad y una corrección concreta en un bloque de código. Está diseñado específicamente para tareas de revisión de código, análisis de bugs y generación de fixes.

El modelo parte de la base `Qwen3.8-27B` de Alibaba, un modelo denso de 27.320 millones de parámetros con arquitectura híbrida (full-attention + linear-attention) y capacidades nativas de visión. Sobre esta base se ha aplicado una técnica de *abliteration* (eliminación de la negativa a responder) y un fine-tune supervisado (SFT) con 21.009 ejemplos reales de código con bugs en cinco lenguajes (Python, JavaScript, Go, Rust y C). La versión v2 corrige el problema de colapso de plantilla de la v1 y generaliza a bugs no vistos en el entrenamiento. La cuantización GGUF conserva los tensores de Multi-Token Prediction (MTP) para decodificación especulativa con llama.cpp.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (full-attention + linear-attention), con MTP head en el bloque 64 |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens (recomendado en la config de llama.cpp) |
| Tipos de cuantizacion | F16, Q6_K, Q4_K_M |
| Idiomas soportados | Python, JavaScript, Go, Rust, C (en el fine-tune); el modelo base soporta múltiples idiomas, pero no se especifican |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es `Qwen3.8-27B`, un modelo denso de 27.320 millones de parámetros con arquitectura híbrida que combina atención completa (full-attention) y atención lineal (linear-attention). Esta mezcla permite manejar ventanas de contexto muy largas (hasta 262.144 tokens) con un coste computacional menor que la atención cuadrática tradicional. El modelo base también tiene capacidades nativas de visión, aunque el fine-tune de análisis de código se centra en texto.

Sobre este modelo se aplicó primero una técnica de *abliteration* sin entrenamiento: una edición de pesos de rango 1 que ortogonaliza la dirección de "refusal" de los 131 escritores del residual stream, eliminando el comportamiento de rechazo. Después se realizó un fine-tune supervisado (SFT) con 21.009 filas reales de código + bug + respuesta, con respuestas detalladas de 550-880 caracteres. El objetivo era que el modelo aprendiera a identificar bugs reales, razonar sobre ellos a nivel de línea y ofrecer correcciones concretas. La versión v2 generaliza a bugs no vistos durante el entrenamiento.

La cuantización GGUF preserva los tensores MTP (`blk.64.nextn.*`), que permiten usar el modelo como *draft model* para decodificación especulativa en llama.cpp, acelerando la generación.

## Capacidades

- **Revisión de código estructurada**: dado un fragmento de código, devuelve una revisión en varios párrafos con bugs identificados, razonamiento a nivel de línea, severidad y un bloque de código con la corrección.
- **Detección de bugs reales**: entrenado con 21.009 ejemplos reales, generaliza a bugs no vistos durante el entrenamiento (por ejemplo, condiciones de carrera asíncronas).
- **Razonamiento multi-paso**: es un modelo de razonamiento que piensa antes de responder, lo que le permite analizar el código en profundidad.
- **Soporte de múltiples lenguajes**: fine-tune específico para Python, JavaScript, Go, Rust y C.
- **Generación de código**: puede generar fragmentos de código correctos como parte de la revisión.
- **Capacidades base del modelo**: el modelo base Qwen3.8-27B soporta visión, generación de texto, agentes y tool calling, aunque el fine-tune de análisis de código se centra en texto. La configuración recomendada en llama.cpp incluye `--tools all`, lo que sugiere soporte de tool calling.
- **Decodificación especulativa**: gracias al MTP head conservado, puede usarse como *draft model* para acelerar la inferencia.

## Casos de uso

- **Revisión de código automatizada en CI/CD**: integrar el modelo en un pipeline de integración continua para analizar cada pull request. El modelo recibe el diff o el código completo y devuelve una revisión con bugs, severidad y fixes, que se pueden presentar como comentarios automáticos en la plataforma de control de versiones. Su capacidad de razonamiento permite detectar bugs sutiles como off-by-one o condiciones de carrera.

- **Auditoría de seguridad de código**: el modelo puede identificar vulnerabilidades o fallos de concurrencia en código crítico (por ejemplo, en Go o Rust) y proponer correcciones. Su capacidad de razonamiento multi-paso ayuda a detectar problemas que un linter estático no encuentra.

- **Asistente de programación para refactorización**: un desarrollador puede pegar un fragmento de código y recibir sugerencias de mejora con severidad y explicación línea por línea. El modelo es útil en entornos de desarrollo local con llama.cpp o LM Studio.

- **Formación de desarrolladores**: el modelo puede generar explicaciones detalladas de bugs en código de ejemplo, sirviendo como herramienta educativa para enseñar patrones de error comunes en Python, JavaScript, Go, Rust y C.

- **Análisis de seguridad en el código**: gracias a su capacidad de detectar bugs reales y razonar sobre las consecuencias, puede usarse para identificar posibles exploits o condiciones inseguras (por ejemplo, race conditions) y proponer fixes concretos.

- **Automatización de code review en empresas**: un equipo de desarrollo puede desplegar el modelo en un servidor local con llama.cpp y enviar cada commit para recibir una revisión automática con severidad y correcciones, reduciendo la carga de los revisores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo en la información disponible. El autor proporciona un *smoke test* con tres casos:

| Caso | Resultado |
|---|---|
| Off-by-one (dentro del arquetipo de entrenamiento) | Detectado, con corrección y nota de docstring |
| Async race (no visto en entrenamiento) | Detectado, con mención a "no cache-hit fast path" y concurrency |
| Código limpio (prueba de alucinación) | "correct, no bugs" + nota menor sobre float/bool |

Mediciones de rendimiento de inferencia (en Q6_K, 5×3090 / 2 GPUs, flash-attn): **~34 tokens/s** de generación y **~141 tokens/s** de prompt evaluation. No hay más datos de benchmarks.

## Requisitos de hardware

- **VRAM estimada**:
  - F16: 51 GB (requiere al menos 2 GPUs de 24 GB o una GPU con 64 GB+).
  - Q6_K: 21 GB (cabe en una RTX 3090/4090 de 24 GB, o en 2×16 GB).
  - Q4_K_M: 16 GB (cabe en GPUs consumer de 16 GB como RTX 4080, 3090, o 4090 con VRAM suficiente).
- **GPU recomendadas**: para Q6_K se han usado 5×3090 (24 GB cada una) o 2 GPUs de 16 GB con flash-attn. Para Q4_K_M, una RTX 4090 (24 GB) es suficiente.
- **Consumer GPU**: sí, el Q4_K_M es adecuado para GPUs de 16 GB (por ejemplo, RTX 4080 o 3090). El Q6_K requiere 24 GB.
- **Opciones de despliegue**: llama.cpp, llama-server, LM Studio, Ollama (si soporta GGUF), vLLM (con adaptación), TGI (si soporta GGUF).
- **Latencia**: con Q6_K en 2 GPUs, ~34 t/s de generación; con Q4_K_M probablemente mayor velocidad en una sola GPU consumer.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Especialización |
|---|---|---|---|---|---|
| `Qwen3.8-27B` (base) | 27.3B | 262K | safetensors, GGUF | Apache 2.0 | Modelo general de texto y visión |
| `hotdogs/Qwen3.8-27B-abliterated-MTP-GGUF` | 27.3B | 262K | GGUF (12 quants) | MIT | Abliterated (sin refusal), sin fine-tune de código |
| `hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview-mtp-GGUF` (este) | 27.3B | 262K | GGUF (F16, Q6_K, Q4_K_M) | MIT | Fine-tune específico de análisis de código con MTP |

No se dispone de datos de comparación con otros modelos de análisis de código como DeepSeek-Coder o Codex. La comparativa se limita a la familia Qwen3.8-27B.

## Limitaciones y advertencias

- **Abliteration**: el modelo ha sido *abliterated* (se ha eliminado la refusión a responder), lo que puede producir respuestas sin filtros de seguridad. Esto es un riesgo para uso en producción, ya que el modelo podría generar contenido inapropiado o dañino si se le pide.
- **Riesgo de alucinación en código**: aunque el smoke test indica que no alucina en el caso de código limpio, existe riesgo de que el modelo sugiera correcciones incorrectas o invente bugs en contextos no vistos. Es necesario validar las correcciones humanamente.
- **Limitación de idiomas**: el fine-tune solo cubre 5 lenguajes (Python, JavaScript, Go, Rust, C). El modelo puede fallar con otros lenguajes.
- **Contexto largo**: aunque el modelo base soporta 262K tokens, el fine-tune de análisis de código no especifica si el entrenamiento se realizó con contextos tan largos. Puede degradarse con entradas muy largas.
- **Licencia**: MIT es permisiva para uso comercial, pero el modelo base original es Apache 2.0. No hay restricciones adicionales conocidas.
- **Estado de desarrollo**: la model card indica "testing / development" para la versión GGUF, por lo que puede haber bugs o falta de optimización.
- **No hay benchmarks formales**: no se han publicado resultados en MMLU, HumanEval, etc., lo que limita la evaluación objetiva del rendimiento.

## Enlaces

- [Modelo en HuggingFace (GGUF)](https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview-mtp-GGUF)
- [Modelo base (fine-tune de análisis)](https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview)
- [Modelo abliterated sin MTP (GGUF)](https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-MTP-GGUF)
- [Blog de orcarouter sobre Qwen3.8-27B uncensored GGUF](https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf)
- [Documentación de Cloudflare Workers AI sobre Qwen3.8-27B](https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/)
- [Ficha en Genaihub](https://genaihub.net/agents/hf-model-hotdogs-qwen3-8-27b-abliterated-mtp-gguf)

# Qwen/Qwen3-Coder-Next

## Resumen

Qwen3-Coder-Next es un modelo de lenguaje de código abierto desarrollado por el equipo Qwen, diseñado específicamente para agentes de codificación y desarrollo local. Con 80 mil millones de parámetros totales pero solo 3 mil millones activados gracias a su arquitectura de mezcla de expertos (MoE), ofrece un rendimiento comparable a modelos con 10-20 veces más parámetros activos, lo que lo convierte en una opción muy eficiente en coste para el despliegue de agentes en producción. Su contexto nativo de 262.144 tokens permite manejar repositorios completos y tareas de razonamiento de largo alcance.

El modelo destaca por sus capacidades agénticas avanzadas: razonamiento de horizonte largo, uso complejo de herramientas y recuperación de errores de ejecución. Se integra con múltiples plataformas CLI/IDE como Claude Code, Qwen Code, Qoder, Kilo, Trae y Cline, y está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones. Publicado en enero de 2026, ha acumulado más de 523.000 descargas en Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention + MoE |
| Parametros totales | 79.674.391.296 (80B) |
| Parametros activos | 3B (10 de 512 expertos + 1 compartido) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | No especificados en la información disponible (safetensors en BF16/FP16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (159,4 GB) |

## Arquitectura y entrenamiento

Qwen3-Coder-Next emplea una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención tradicional (Gated Attention) y mezcla de expertos. El layout se compone de 48 capas organizadas en 12 bloques, cada uno con 3 sub-bloques de Gated DeltaNet seguidos de MoE y 1 sub-bloque de Gated Attention seguido de MoE. La atención lineal reduce el coste computacional en contextos largos, mientras que la atención tradicional mantiene la capacidad de recuperación precisa de información. El MoE cuenta con 512 expertos, de los cuales 10 se activan por token, más 1 experto compartido, con una dimensión intermedia de 512.

El entrenamiento se realizó en dos etapas: pretraining y post-training. Aunque no se especifican los datos exactos de entrenamiento (número de tokens, composición del dataset), la model card menciona un "elaborate training recipe" orientado a potenciar las capacidades agénticas: razonamiento de largo horizonte, uso complejo de herramientas y recuperación de fallos de ejecución. No se indica si se utilizó RLHF o DPO. El modelo solo admite modo no-thinking, es decir, no genera bloques de razonamiento explícito en su salida.

## Capacidades

- Generación de código y texto: produce código en múltiples lenguajes de programación, con soporte para completado, generación de funciones y refactorización.
- Razonamiento de largo alcance: gracias a su contexto de 256K tokens, puede procesar repositorios completos y mantener coherencia en tareas multi-paso.
- Tool calling / function calling: soporta invocación de herramientas externas mediante el parser `qwen3_coder`, integrable con frameworks de agentes.
- Capacidades agénticas: diseñado para agentes de codificación que requieren planificación, ejecución de comandos y recuperación de errores.
- Integración con IDEs y CLIs: compatible con Claude Code, Qwen Code, Qoder, Kilo, Trae, Cline y otros entornos de desarrollo.
- Multilingüe: no se especifican idiomas soportados en la información disponible.
- Solo modo no-thinking: no genera bloques de razonamiento explícito, lo que reduce latencia y coste de inferencia.

## Casos de uso

- Agente de codificación autónomo: el modelo puede actuar como agente que recibe una tarea de programación, explora el repositorio, genera código, ejecuta pruebas y corrige errores de forma iterativa, gracias a su contexto largo y capacidades de tool calling.
- Asistente de desarrollo integrado en IDE: se puede conectar a extensiones de VS Code o JetBrains para ofrecer autocompletado, generación de tests y explicación de código, con baja latencia gracias a sus 3B parámetros activos.
- Revisión de código automatizada: analiza pull requests completas, detecta bugs, sugiere mejoras y genera comentarios de revisión, procesando diffs extensos dentro de la ventana de 256K tokens.
- Generación de documentación técnica: a partir de un código fuente completo, genera documentación de API, comentarios y guías de uso, manteniendo el contexto de todo el proyecto.
- Automatización de pipelines CI/CD: integrado en flujos de integración continua, puede generar scripts de build, configuraciones de despliegue y solucionar fallos de compilación mediante tool calling.
- Chatbot de soporte técnico especializado en código: desplegado como endpoint OpenAI-compatible, responde consultas sobre APIs, librerías y fragmentos de código, con capacidad de ejecutar herramientas para verificar soluciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye imágenes de gráficos de rendimiento, pero no se proporcionan los valores numéricos en el texto. Se recomienda consultar el blog oficial de Qwen para obtener datos detallados de evaluación.

## Requisitos de hardware

- VRAM estimada: el modelo completo en BF16 ocupa aproximadamente 160 GB (tamaño del repo). Con cuantización a 8 bits se reduciría a ~80 GB, y a 4 bits a ~40 GB, aunque no se han confirmado oficialmente estas cifras.
- GPU recomendadas: para inferencia en BF16 se necesitan múltiples GPUs de alta capacidad, como 2x A100 80GB o 2x H100. Con cuantización a 4 bits podría caber en una sola GPU de 48 GB (por ejemplo, A6000 o L40S).
- Consumer GPU: no cabe en una RTX 4090 (24 GB) sin cuantización extrema (posiblemente 3-4 bits) y con degradación de calidad. No se recomienda para uso local en hardware de consumo.
- Opciones de despliegue: vLLM (>=0.15.0) y SGLang (>=0.5.8) con soporte para tensor parallelism y tool calling. También compatible con llama.cpp, Ollama, MLX-LM y KTransformers.
- Latencia y throughput: no disponible en la información proporcionada. Se espera que la inferencia sea rápida gracias a los 3B parámetros activos, pero el coste de memoria de los 80B pesos totales es el factor limitante.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3-Coder-Next | 80B | 3B | 262.144 | Apache 2.0 | Agentes de codificación |
| DeepSeek-Coder-V2 | 236B | 21B | 128.000 | MIT | Codificación general |
| Qwen2.5-Coder-32B | 32B | 32B (denso) | 131.072 | Apache 2.0 | Codificación general |

No se dispone de datos de benchmarks comparativos en la información proporcionada. La comparativa se basa únicamente en especificaciones técnicas. Qwen3-Coder-Next se diferencia por su eficiencia en parámetros activos y su contexto nativo más largo, mientras que DeepSeek-Coder-V2 ofrece más capacidad total pero con mayor coste de inferencia.

## Limitaciones y advertencias

- Solo modo no-thinking: no genera razonamiento explícito, lo que puede limitar la interpretabilidad de sus decisiones en tareas complejas.
- Idiomas no especificados: no se ha confirmado el soporte multilingüe, aunque al estar basado en la familia Qwen3 es probable que cubra varios idiomas, pero no es un dato oficial.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar código incorrecto o inventar APIs inexistentes, especialmente en contextos poco comunes.
- Contexto largo y memoria: aunque soporta 256K tokens, el uso de contextos muy largos puede provocar OOM en GPUs con memoria limitada; se recomienda reducir a 32.768 tokens si es necesario.
- Requisitos de hardware elevados: los 80B parámetros totales requieren infraestructura de servidor o múltiples GPUs, lo que limita su uso en entornos de desarrollo locales.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe verificar el cumplimiento de las condiciones de atribución.

## Enlaces

- Hugging Face: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Colección Qwen3-Coder-Next: https://huggingface.co/collections/Qwen/qwen3-coder-next
- Blog oficial: https://qwen.ai/blog?id=qwen3-coder-next
- GitHub: https://github.com/QwenLM/Qwen3-Coder
- Documentación: https://qwen.readthedocs.io/en/latest/
- Together AI (API): https://www.together.ai/models/qwen3-coder-next
- OpenRouter (API): https://openrouter.ai/qwen/qwen3-coder-next

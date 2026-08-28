# mistralai/Devstral-Small-2-24B-Instruct-2512

## Resumen

Devstral Small 2 24B Instruct 2512 es un modelo de lenguaje agéntico desarrollado por Mistral AI, especializado en tareas de ingeniería de software. Forma parte de la familia Devstral, diseñada para explorar codebases, editar múltiples archivos y potenciar agentes de programación. Es la versión pequeña de Devstral 2, con 24.011 millones de parámetros, y se distribuye en formato FP8, lo que permite ejecutarlo en hardware de consumo como una RTX 4090 o un Mac con 32 GB de RAM.

El modelo se basa en Mistral Small 3.1 24B Base (versión de marzo de 2025) y añade capacidades de visión, un contexto de 256k tokens y mejoras en la atención mediante softmax temperature y rope-scaling, siguiendo las técnicas de Llama 4 y el paper "Scalable-Softmax Is Superior for Attention". Está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas.

Su relevancia actual radica en que ofrece un rendimiento competitivo en benchmarks de ingeniería de software (SWE-bench Verified 68,0%) con un tamaño reducido, siendo una opción práctica para despliegue local y desarrollo de agentes de código. Mistral también publica Mistral Vibe, un CLI oficial para integrar el modelo en el terminal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral3 (transformer con atención softmax temperature y rope-scaling, con torre de visión Pixtral) |
| Parametros totales | 24.011.361.840 (24B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | FP8 (oficial), GGUF (Q4_K_M, Q5_K_M, Q6_K, Q8_0, etc. vía comunidad) |
| Idiomas soportados | no disponible (modelo multilingüe por herencia de Mistral Small, pero no se especifica lista oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8), GGUF (cuantizaciones comunitarias) |

## Arquitectura y entrenamiento

Devstral Small 2 24B Instruct 2512 usa la arquitectura Mistral3, que combina un transformer denso con una torre de visión (PixtralVisionModel) para procesar imágenes. La atención emplea softmax temperature escalable y rope-scaling, técnicas introducidas en Llama 4 y en el paper arXiv:2501.19399, que mejoran la estabilidad del entrenamiento y la extrapolación de contexto. El modelo parte de Mistral Small 3.1 24B Base y se somete a un fine-tuning instruct con datos orientados a tareas de ingeniería de software, incluyendo uso de herramientas, edición de archivos y razonamiento agéntico.

No se han publicado detalles específicos sobre el volumen de tokens de entrenamiento ni la composición exacta del dataset. La model card indica que el modelo generaliza mejor a prompts diversos y entornos de codificación variados en comparación con Devstral Small 1.1, y que incorpora visión como novedad. El entrenamiento incluye probablemente fases de supervisión y optimización para seguimiento de instrucciones, aunque no se especifica si se usó RLHF o DPO.

## Capacidades

- Generación de código y edición de múltiples archivos en un mismo turno, orientado a tareas de ingeniería de software.
- Razonamiento agéntico: puede planificar pasos, usar herramientas y explorar codebases de forma autónoma.
- Tool calling / function calling: integrable con scaffoldings como Cline, Kilo Code, Claude Code, OpenHands y SWE Agent.
- Visión: capaz de analizar imágenes y proporcionar información basada en contenido visual, además de texto.
- Seguimiento de instrucciones: fine-tuned para tareas de chat, agénticas y basadas en instrucciones.
- Multilingüismo: aunque no se documenta una lista oficial, hereda capacidades multilingües de Mistral Small 3.1.
- Contexto largo: ventana de 256k tokens, adecuada para repositorios extensos y conversaciones multi-turno.

## Casos de uso

- Asistentes de código en IDE: el modelo puede integrarse en extensiones de VS Code o JetBrains para sugerir ediciones, refactorizar código y explicar fragmentos, aprovechando su contexto de 256k para analizar archivos completos.
- Agentes autónomos de resolución de issues: conectar Devstral Small 2 a un sistema como SWE Agent o OpenHands para que reciba un issue de GitHub, explore el repositorio, genere un parche y ejecute pruebas, gracias a su capacidad de tool calling y razonamiento multi-paso.
- Automatización de code review: el modelo puede analizar pull requests, detectar errores comunes, sugerir mejoras y generar comentarios de revisión, usando su comprensión de código y contexto largo.
- Generación de documentación técnica: a partir de un codebase, puede producir documentación de API, guías de uso y comentarios de funciones, reduciendo el trabajo manual de los desarrolladores.
- Chat de soporte técnico para desarrolladores: desplegado como backend de un chatbot que responde preguntas sobre APIs internas, configuración de entornos y resolución de errores, con capacidad de consultar documentación y código.
- Análisis de capturas de pantalla de errores: gracias a su visión, puede recibir una imagen de un error en pantalla o un diagrama de arquitectura y proporcionar diagnóstico o explicación, combinando información visual y textual.

## Benchmarks y rendimiento

La model card publica los siguientes resultados, comparados con modelos de mayor tamaño. Se indican como valores reportados públicamente por Mistral AI.

| Modelo | Tamaño (B) | SWE-bench Verified | SWE-bench Multilingual | Terminal Bench 2 |
|---|---|---|---|---|
| Devstral 2 | 123 | 72,2% | 61,3% | 32,6% |
| **Devstral Small 2** | **24** | **68,0%** | **55,7%** | **22,5%** |
| GLM 4.6 | 355 | 68,0% | -- | 24,6% |
| Qwen 3 Coder Plus | 480 | 69,6% | 54,7% | 25,4% |
| MiniMax M2 | 230 | 69,4% | 56,5% | 30,0% |
| Kimi K2 Thinking | 1000 | 71,3% | 61,1% | 35,7% |
| DeepSeek v3.2 | 671 | 73,1% | 70,2% | 46,4% |
| GPT 5.1 Codex High | -- | 73,7% | -- | 52,8% |
| GPT 5.1 Codex Max | -- | 77,9% | -- | 60,4% |
| Gemini 3 Pro | -- | 76,2% | -- | 54,2% |
| Claude Sonnet 4.5 | -- | 77,2% | 68,0% | 42,8% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en FP8 ocupa aproximadamente 24 GB, por lo que cabe en una RTX 4090 (24 GB) o en un Mac con 32 GB de RAM unificada, según indica la model card.
- Con cuantizaciones GGUF de 4 bits (Q4_K_M, ~14 GB), puede ejecutarse en GPUs con 16 GB de VRAM, como RTX 4080, RTX 4070 Ti o RTX 3090.
- Para despliegue en producción con alta concurrencia, se recomienda al menos una A100 40 GB o H100, aunque el modelo es lo bastante pequeño para servir en una sola GPU.
- Opciones de despliegue: vLLM (soporte nativo, indicado en la etiqueta de HuggingFace), llama.cpp (vía GGUF), Ollama (si se publica), Mistral Vibe CLI, y scaffoldings como Cline, Kilo Code, Claude Code, OpenHands y SWE Agent.
- Latencia y throughput: no se han publicado cifras oficiales. En una RTX 4090 con FP8, se puede esperar una generación de 20-40 tokens/s para contexto largo, aunque depende de la implementación y la longitud de la secuencia.

## Comparativa con modelos similares

La comparación directa con modelos de tamaño similar (20-30B) no está disponible en la información proporcionada. Sin embargo, la tabla de benchmarks permite comparar con modelos de mayor tamaño orientados a código:

| Modelo | Tamaño (B) | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|
| **Devstral Small 2** | 24 | 256k | 68,0% | Apache 2.0 |
| Devstral 2 | 123 | no disponible | 72,2% | Apache 2.0 |
| Qwen 3 Coder Plus | 480 | no disponible | 69,6% | Apache 2.0 |
| GLM 4.6 | 355 | no disponible | 68,0% | no disponible |
| MiniMax M2 | 230 | no disponible | 69,4% | no disponible |

Devstral Small 2 ofrece un rendimiento cercano a modelos 10-20 veces más grandes en SWE-bench Verified, con un coste computacional mucho menor. Su licencia Apache 2.0 es una ventaja frente a alternativas propietarias o con restricciones.

## Limitaciones y advertencias

- Sesgos: al ser un modelo entrenado principalmente con datos de código, puede presentar sesgos hacia estilos de programación comunes (Python, JavaScript) y menos precisión en lenguajes minoritarios.
- Riesgo de alucinación: como todo LLM, puede generar código incorrecto o inventar APIs inexistentes, especialmente en contextos largos o con poca información.
- Limitaciones de contexto: aunque soporta 256k tokens, el rendimiento puede degradarse en secuencias muy largas; se recomienda validar la calidad en el caso de uso concreto.
- Idiomas: no se ha publicado una lista oficial de idiomas soportados; el modelo puede tener un rendimiento inferior en lenguas distintas del inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card advierte que no se debe usar el modelo de forma que infrinja derechos de terceros.
- Producción: al ser un modelo de 24B, requiere hardware con suficiente VRAM para inferencia en tiempo real; para despliegues con alta latencia, se recomienda cuantización adicional o uso de vLLM con batching.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503
- Paper de atención softmax: https://arxiv.org/abs/2501.19399
- Mistral Vibe CLI: https://github.com/mistralai/mistral-vibe
- Cuantizaciones GGUF (bartowski): https://huggingface.co/bartowski/mistralai_Devstral-Small-2-24B-Instruct-2512-GGUF
- Guía de despliegue y benchmarks (OpenModelMap): https://openmodelmap.com/model/mistralai/Devstral-Small-2-24B-Instruct-2512

# Da-master/Dolphin3.0-Qwen2.5-1.5B-Q4_K_M-GGUF

## Resumen

Dolphin3.0-Qwen2.5-1.5B es un modelo de lenguaje de 1.500 millones de parámetros, derivado de Qwen2.5-1.5B y ajustado mediante supervisión (SFT) por el proyecto Dolphin3.0. La versión que aquí se documenta, `Da-master/Dolphin3.0-Qwen2.5-1.5B-Q4_K_M-GGUF`, es una conversión del modelo original a formato GGUF con cuantización Q4_K_M, pensada para su ejecución eficiente en local mediante `llama.cpp` en CPUs, GPUs de consumo o dispositivos Apple Silicon.

El modelo está diseñado para tareas de instrucción, conversación, generación de código y razonamiento matemático. La cuantización Q4_K_M reduce el tamaño del archivo a aproximadamente 1 GB, lo que lo hace accesible para equipos con recursos limitados. Sin embargo, no se han publicado resultados de benchmarks específicos en la información disponible, por lo que su rendimiento debe validarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen2.5 |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (en este repositorio) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `dphn/Dolphin3.0-Qwen2.5-1.5B` es un fine-tuning del modelo `Qwen2.5-1.5B` sobre una mezcla de datasets de instrucción, código, matemáticas y conversación. Los datasets listados en el modelo card incluyen `OpenCoder-LLM/opc-sft-stage1` y `stage2`, `microsoft/orca-agentinstruct-1M-v1`, `microsoft/orca-math-word-problems-200k`, `NousResearch/hermes-function-calling-v1`, `AI-MO/NuminaMath-CoT` y `NuminaMath-TIR`, `allenai/tulu-3-sft-mixture`, `cognitivecomputations/dolphin-coder`, `HuggingFaceTB/smoltalk`, `cognitivecomputations/samantha-data`, `m-a-p/CodeFeedback-Filtered-Instruction` y `m-a-p/Code-Feedback`.

Este conjunto de datos apunta a un entrenamiento por instrucciones supervisadas (SFT) con énfasis en razonamiento matemático, generación de código, llamadas a funciones y conversaciones empáticas. No se menciona el uso de RLHF, DPO ni ninguna técnica de optimización por preferencias en la información disponible.

## Capacidades

- Generacion de texto y conversación en inglés, con estilo cercano al asistente de "Samantha" y a mezclas de instrucciones como `tulu-3-sft-mixture`.
- Razonamiento matemático, gracias al entrenamiento con `NuminaMath-CoT`, `NuminaMath-TIR` y `orca-math-word-problems`.
- Generación de código y asistencia de programación, a partir de `dolphin-coder`, `OpenCoder` y `CodeFeedback`.
- Soporte de tool calling y function calling, derivado del dataset `hermes-function-calling-v1`.
- Capacidad para entornos de agentes basados en instrucciones, gracias a `orca-agentinstruct`.
- No hay evidencia de capacidades multimodales (visión o audio) en la información disponible.

## Casos de uso

- Asistente de programación en local: puede integrarse en un editor de texto o en un entorno de development para completar código, explicar fragmentos o generar documentación técnica, ejecutándose en una GPU modesta o CPU.
- Chatbot de soporte técnico en inglés: el modelo gestiona conversaciones de instrucciones y responde preguntas de usuarios sin depender de servicios externos, ideal para aplicaciones de escritorio o herramientas internas.
- Tutor de matemáticas: gracias al entrenamiento con datasets matemáticos como NuminaMath, puede resolver problemas aritméticos y explicar pasos intermedios, útil en plataformas educativas ligeras.
- Automatización de tareas con tool calling: el soporte de function calling permite conectar el modelo a APIs locales para ejecutar operaciones como consultas a bases de datos, envío de mensajes o generación de informes.
- Asistente conversacional empático: las mezclas de `samantha-data` y `smoltalk` favorecen un tono cercano, adecuado para aplicaciones de apoyo emocional o mentoría básica.
- Prototipado rápido de agentes conversacionales: el modelo puede ser desplegado en un servidor `llama.cpp` local y probado como agente para tareas de razonamiento de varios pasos con un coste mínimo de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El archivo GGUF Q4_K_M pesa aproximadamente 1 GB, por lo que puede cargarse en equipos con 2 GB de VRAM o en CPUs con 4 GB de RAM.
- Inferencia en GPU: cualquier tarjeta de consumo con al menos 2 GB de VRAM es suficiente, aunque se recomienda 4 GB o más para reducir el riesgo de cuellos de botella en el contexto.
- Inferencia en CPU: viable gracias a `llama.cpp`; se recomienda al menos un procesador de 4 núcleos y 8 GB de RAM para tareas interactivas.
- Opciones de despliegue compatibles: `llama.cpp`, `llama-cli`, `llama-server`, `Ollama` (si se importa el GGUF) y `LM Studio`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Da-master/Dolphin3.0-Qwen2.5-1.5B-Q4_K_M-GGUF | 1.543.714.304 | GGUF Q4_K_M | Apache 2.0 | HuggingFace |
| dphn/Dolphin3.0-Qwen2.5-1.5B (base) | 1.543.714.304 | Safetensors | Apache 2.0 | HuggingFace |
| RCDWealth/Dolphin3.0-Qwen2.5-1.5B-Q5_K_M.gguf | 1.543.714.304 | GGUF Q5_K_M | No disponible | HuggingFace |

No se dispone de datos de contexto ni de rendimiento publicados para ninguna de las variantes, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- No se han publicado benchmarks en el repositorio; la calidad del modelo no está verificada en tareas estándar como MMLU o HumanEval.
- El modelo solo está documentado para inglés, por lo que su rendimiento en otros idiomas no está garantizado.
- Al tratarse de una cuantización Q4_K_M, puede haber una degradación leve de la fidelidad con respecto al modelo original en safetensors.
- Los modelos de 1.500 millones de parámetros son propensos a alucinaciones y a errores factuales, especialmente en tareas que requieren conocimiento enciclopédico.
- No hay información sobre la longitud de contexto soportada; si se necesita contexto largo, debe probarse de forma explícita antes de usarlo en producción.
- No se especifica el proceso de entrenamiento más allá del SFT, por lo que no se puede evaluar la alineación ni la seguridad del modelo.

## Enlaces

- https://huggingface.co/Da-master/Dolphin3.0-Qwen2.5-1.5B-Q4_K_M-GGUF
- https://huggingface.co/dphn/Dolphin3.0-Qwen2.5-1.5B
- https://huggingface.co/bartowski/Dolphin3.0-Qwen2.5-1.5B-GGUF
- https://huggingface.co/RCDWealth/Dolphin3.0-Qwen2.5-1.5B-Q5_K_M.gguf
- https://github.com/ggerganov/llama.cpp

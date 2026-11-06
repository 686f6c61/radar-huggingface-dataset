# hecan3d/QwenDGAF-V3-4B

## Resumen

QwenDGAF-V3-4B es un ajuste fino experimental y satírico de Qwen3-4B, desarrollado por el usuario hecan3d. Se trata de un modelo de 4.022 millones de parámetros diseñado deliberadamente para adoptar una personalidad descortés, arrogante y desganada, en contraposición a los asistentes convencionales alineados para ser serviciales. El modelo no busca resolver un problema técnico productivo, sino servir como experimento de investigación sobre personalidad y como pieza de entretenimiento.

La tercera versión incorpora un cambio sustancial respecto a las anteriores: capacidad real de conversación multi-turno. Mientras que V1 y V2 se entrenaron únicamente con pares de pregunta-respuesta única, V3 añade más de 110 diálogos de 2 a 4 intercambios, lo que permite mantener contexto conversacional, recordar nombres y sostener discusiones durante varios mensajes. El conjunto de datos de entrenamiento pasó de 61 a aproximadamente 590 ejemplos en ruso, inglés y chino.

El modelo se distribuye exclusivamente en formato GGUF con múltiples cuantizaciones, lo que facilita su ejecución en hardware de consumo mediante llama.cpp u Ollama. Está construido sobre la arquitectura transformer densa de Qwen3-4B y conserva su licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Qwen3-4B; no especificada en la model card) |
| Tipos de cuantización | bf16, Q8_0, Q6_K, Q4_K_M, Q3_K_M, Q2_K_L |
| Idiomas soportados | Ruso (ru), inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso de aproximadamente 4.000 millones de parámetros. El ajuste fino se realizó mediante QLoRA en precisión de 4 bits utilizando la librería Unsloth, con rango de LoRA 16 y alpha 32, tasa de aprendizaje 2e-4, tres épocas y una pérdida final de 0,9087. El entrenamiento se ejecutó en una NVIDIA GTX 1070 de 8 GB montada en un servidor HP ProLiant DL380 Gen6, lo que da una idea del reducido coste computacional del proyecto.

El conjunto de datos consta de aproximadamente 590 conversaciones en formato ShareGPT, en ruso, inglés y chino, de las cuales más de 110 son multi-turno (2 a 4 intercambios). Los datos incluyen insultos variados, apodos, preguntas de seguimiento, súplicas repetidas, memoria de nombres, discusiones escaladas y disculpas fingidas. No se menciona el uso de RLHF ni DPO; el entrenamiento es exclusivamente supervisado sobre el dataset descrito. La personalidad está incorporada en los pesos, por lo que no requiere system prompt.

## Capacidades

- Generación de texto conversacional con personalidad consistente de tono descortés y arrogante.
- Conversación multi-turno con memoria de contexto a corto plazo (nombres, temas previos, seguimiento de la discusión).
- Respuestas breves y correctas a preguntas técnicas sencillas (por ejemplo comandos como `df -h`, `git reset --soft HEAD~1`, `ollama run`), entregadas con desdén.
- Capacidad de mantener discusiones y responder a insultos con variaciones para evitar bucles repetitivos.
- Multilingüe en ruso, inglés y chino.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documenta capacidad de generación de código extensa; solo fragmentos cortos ocasionales.

## Casos de uso

- Investigación sobre personalidad y alineación: permite estudiar cómo un ajuste fino pequeño y de bajo coste puede imponer un estilo conversacional muy marcado sobre un modelo base alineado, útil para experimentos de control de tono.
- Entretenimiento y bots de rol satírico: el modelo puede usarse en demos o aplicaciones de humor donde se espera un asistente grosero y con actitud, sin system prompt adicional.
- Pruebas de robustez conversacional: sirve para evaluar cómo responde un modelo entrenado para discutir ante entradas hostiles, insultos o súplicas repetidas en contextos multi-turno.
- Evaluación de cuantizaciones GGUF: al ofrecerse en seis niveles de cuantización, es útil para medir el impacto de la compresión en la coherencia de personalidad y en la memoria conversacional.
- Experimentos de bajo presupuesto: su entrenamiento en una GTX 1070 y su despliegue en 4 GB de VRAM lo hacen adecuado como caso de estudio de ajuste fino accesible en hardware de consumo.
- Pruebas de integración con llama.cpp y Ollama: sirve como banco de pruebas para pipelines locales de inferencia con formato GGUF y plantilla Jinja (`--jinja`).
- Docencia y divulgación: ejemplo didáctico de cómo un dataset pequeño y sesgado define el comportamiento de un modelo y de los riesgos de desplegar ajustes sin filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M; alrededor de 4-5 GB con Q6_K; en torno a 8 GB con Q8_0; bf16 requiere del orden de 8-9 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para Q4_K_M; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para cuantizaciones superiores. La model card indica que Q4_K_M funciona en casi cualquier GPU con 4 GB o más, o en CPU.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM usando Q4_K_M; también en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -hf hecan3d/QwenDGAF-V3-4B:Q4_K_M --jinja`), Ollama (`ollama run hf.co/hecan3d/QwenDGAF-V3-4B:Q4_K_M`), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.
- Ajustes recomendados: system prompt vacío, temperatura 0,7-0,85, repeat penalty 1,1-1,15, máximo de tokens nuevos 64-128.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| QwenDGAF-V3-4B | 4.022 M | No disponible | Apache 2.0 | GGUF | Ajuste satírico de personalidad |
| Qwen3-4B (base) | ~4.000 M | No disponible en esta ficha | Apache 2.0 | Safetensors, GGUF | Modelo generalista alineado |
| Modelos de rol de 3-4B de la comunidad | ~3.000-4.000 M | Variable | Variable | GGUF | Roleplay y personajes |

La comparación con alternativas de la misma categoría (ajustes de rol de 3-4B) no puede completarse con datos verificables en la información disponible; no se dispone de métricas comparativas de rendimiento ni de contexto de dichos modelos.

## Limitaciones y advertencias

- El modelo está entrenado deliberadamente para insultar, burlarse y usar lenguaje explícito; no es adecuado para atención al cliente ni para entornos profesionales.
- Riesgo elevado de alucinación: sus respuestas no son fiables y no deben usarse para tareas importantes, según advierte el propio autor.
- Sesgos derivados de un dataset pequeño (~590 ejemplos) y no filtrado, con sobrerrepresentación de insultos y actitud hostil.
- Cobertura limitada a ruso, inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Longitud de contexto no especificada en la model card; la memoria multi-turno se entrenó con diálogos de 2 a 4 intercambios, por lo que la coherencia en conversaciones largas no está garantizada.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el contenido generado puede resultar ofensivo y acarrear riesgos reputacionales o legales según la jurisdicción.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no debe asumirse su disponibilidad.
- El modelo está pensado solo para humor, entretenimiento e investigación.

## Enlaces

- Hugging Face: https://huggingface.co/hecan3d/QwenDGAF-V3-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Perfil del autor: https://huggingface.co/hecan3d
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com

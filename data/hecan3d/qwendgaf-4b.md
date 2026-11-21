# hecan3d/QwenDGAF-4B

## Resumen

QwenDGAF-4B es un ajuste fino (fine-tune) de Qwen/Qwen3-4B, desarrollado por el usuario hecan3d y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de 4.022.468.096 parámetros (4B) diseñado deliberadamente para adoptar una personalidad apática, minimalista y con humor seco: responde con la solución más corta posible, no ofrece consejos no solicitados y evita el tono corporativo entusiasta típico de los asistentes convencionales. No es un modelo orientado a productividad, sino una pieza de conversación con un estilo muy concreto.

El modelo parte de la arquitectura de Qwen3-4B y se ha entrenado mediante QLoRA de 4 bits con el framework Unsloth, en un entrenamiento muy corto (30 pasos, aproximadamente 5 épocas, con una pérdida óptima de ~0,745). Se distribuye principalmente en formato GGUF (Q4_K_M) y está pensado para inferencia local con llama.cpp, con un consumo aproximado de 3 GB de VRAM.

Su relevancia es acotada y de nicho: sirve como ejemplo de ajuste fino ligero y de bajo coste sobre un modelo base moderno, y como banco de pruebas para estudiar cómo un entrenamiento mínimo puede modificar radicalmente el estilo conversacional de un modelo sin destruir su coherencia gramatical. No está pensado para tareas de razonamiento serio, código en producción ni atención al cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-4B); detalles internos no disponibles |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B, no confirmada en la model card) |
| Tipos de cuantizacion | GGUF Q4_K_M (formato publicado principal); otras cuantizaciones no disponibles |
| Idiomas soportados | Ruso (ru), ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 18,7 GB); safetensors no confirmado en la model card |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen/Qwen3-4B, con 4.022.468.096 parámetros totales. El ajuste fino se realizó con Unsloth mediante QLoRA de 4 bits, un procedimiento que congela los pesos base y entrena adaptadores de bajo rango, lo que explica el bajo coste computacional del proceso. El entrenamiento fue muy breve: 30 pasos, aproximadamente 5 épocas, con una pérdida óptima de ~0,745. No se documenta el volumen ni la composición del dataset de ajuste, ni si hubo etapas de RLHF o DPO; la model card solo indica que el objetivo era inculcar un estilo conversacional apático y minimalista.

No se describen innovaciones técnicas propias más allá del propio ajuste: no hay decodificación especulativa, atención lineal ni modos de razonamiento explícitos. El autor menciona en tono irónico que el modelo "ahora tiene capacidades de razonamiento reales, usadas exclusivamente para buscar excusas para no ayudarte", lo que debe interpretarse como parte del personaje y no como una capacidad técnica verificada. La model card incluye además una versión sucesora, hecan3d/QwenDGAF-2-4B, sin más detalles técnicos.

## Capacidades

- Generación de texto conversacional en ruso, inglés y chino, con un estilo deliberadamente seco, apático y minimalista.
- Respuestas ultracortas: el autor recomienda un máximo de 48 tokens nuevos, ya que el modelo tiende a generar una o dos frases.
- Comprensión del contexto de la petición, pero aplicación deliberada del mínimo esfuerzo en la respuesta.
- Capacidad multilingüe limitada a ru, en y zh según la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta visión, audio ni modo de pensamiento (thinking mode).
- No se documentan capacidades específicas de código o matemáticas más allá de las heredadas del modelo base, no verificadas tras el ajuste.

## Casos de uso

- Experimentación con ajuste fino ligero: sirve como caso de estudio de cómo 30 pasos de QLoRA con Unsloth pueden reorientar el estilo de un modelo de 4B, útil para investigadores que quieran reproducir el procedimiento con sus propios datos.
- Chatbots de personaje con humor seco: adecuado para demos, bots de Discord o aplicaciones lúdicas donde se busca una personalidad apática y respuestas breves, con temperatura 0,8–0,9 y top-p 0,85 según el autor.
- Pruebas de inferencia local de bajo consumo: con ~3 GB de VRAM en Q4_K_M, puede ejecutarse en equipos modestos con llama.cpp para validar pipelines de despliegue GGUF.
- Generación de respuestas mínimas en prototipos: útil para simular un usuario o asistente poco colaborativo en pruebas de sistemas conversacionales o de evaluación de robustez.
- Docencia y divulgación: ejemplo práctico para explicar qué es un fine-tune, qué es QLoRA y cómo el estilo de un modelo depende del dataset de ajuste.
- Pruebas de estrés de alineación y seguridad: permite observar cómo un modelo puede adoptar respuestas evasivas o negativas ante peticiones legítimas, útil para diseñar filtros y evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una tabla cualitativa de "stress-test" con respuestas de ejemplo comparadas con un asistente estándar, sin métricas numéricas (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada: ~3 GB en inferencia con la cuantización Q4_K_M publicada, según el autor.
- GPU recomendadas: no especificadas; por el tamaño, cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060, RTX 4070 o superiores. Para el modelo en precisión completa (4B) se necesitarían aproximadamente 8–10 GB de VRAM, aunque no se publican pesos safetensors confirmados.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs con 6 GB o más usando Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-cli -hf hecan3d/QwenDGAF-4B:Q4_K_M --jinja`). No se documentan vLLM, TGI u Ollama, aunque al ser GGUF es compatible con el ecosistema llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estilo | Licencia | Formato |
|---|---|---|---|---|---|
| QwenDGAF-4B | 4,02B | no disponible | Apatico, minimalista, humor seco | Apache 2.0 | GGUF |
| Qwen/Qwen3-4B (base) | 4B | no disponible en esta ficha | Asistente general estandar | Apache 2.0 | safetensors, GGUF |
| QwenDGAF-0.6B (predecesor) | ~0,6B | no disponible | Apatico, minimalista | no disponible | no disponible |

La comparación con el modelo base Qwen3-4B es la más relevante: comparten arquitectura y tamaño, pero QwenDGAF-4B prioriza el estilo sobre la utilidad. El predecesor QwenDGAF-0.6B es una versión mucho más pequeña del mismo concepto. No se dispone de datos de rendimiento comparado en benchmarks.

## Limitaciones y advertencias

- El modelo está diseñado para no ayudar: responde de forma evasiva o minimalista incluso ante peticiones legítimas, lo que lo hace inadecuado para producción real, atención al cliente o tareas técnicas.
- Riesgo alto de respuestas incorrectas o incompletas por diseño, no solo por alucinación.
- Sesgos conocidos: no documentados; el estilo apático puede percibirse como descortés o inapropiado en contextos profesionales.
- Idiomas limitados a ruso, inglés y chino según la model card; el rendimiento en castellano no está verificado.
- Longitud de contexto no confirmada tras el ajuste; conviene asumir la del modelo base sin garantías.
- Licencia Apache 2.0 permite uso comercial, pero el comportamiento del modelo hace desaconsejable su uso en entornos de cara al usuario sin supervisión.
- Entrenamiento muy corto (30 pasos): el ajuste puede ser frágil y degradarse con prompts fuera de distribución.
- Existe una versión sucesora (hecan3d/QwenDGAF-2-4B) que el autor recomienda implícitamente como nueva versión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hecan3d/QwenDGAF-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Versión sucesora: https://huggingface.co/hecan3d/QwenDGAF-2-4B
- Framework de ajuste (Unsloth): https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp

# Lucas2209/bibliollm-qwen0.5b-unicordoba

## Resumen

BiblioLLM (Unicórdoba) es un ajuste fino mediante LoRA del modelo Qwen2.5-0.5B-Instruct, desarrollado por el usuario Lucas2209 y orientado a responder consultas sobre el catálogo de las bibliotecas de la Universidad de Córdoba. El modelo parte de la arquitectura transformer densa de Qwen2.5 en su variante más pequeña, con aproximadamente 494 millones de parámetros, y se distribuye en formato GGUF y para transformers.js, lo que facilita su despliegue en entornos web y de bajos recursos.

La propuesta del modelo es un pipeline de generación aumentada por recuperación (RAG): el sistema recupera fichas bibliográficas y el modelo las utiliza para formular respuestas en castellano. Según la model card, el ajuste incrementa la disponibilidad exacta de respuestas del 10 % al 100 % y la fidelidad (no inventar títulos) del 98,3 % al 100 % en la evaluación realizada por el autor, manteniendo la intención correcta en el 96,7 % de los casos.

Su relevancia radica en demostrar que un modelo de 0,5B parámetros puede especializarse en un dominio acotado mediante LoRA y ejecutarse en navegador o en hardware modesto, lo que lo hace útil para prototipos de asistentes bibliotecarios sin infraestructura GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), ajuste fino con LoRA |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B-Instruct, no confirmada en la ficha) |
| Tipos de cuantizacion | GGUF (cuantizaciones no especificadas) |
| Idiomas soportados | es (castellano) |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-0.5B-Instruct, un transformer denso decoder-only de aproximadamente 494 millones de parámetros. Sobre esta base se aplicó un ajuste fino con LoRA (Low-Rank Adaptation) para especializarlo en el dominio del catálogo bibliotecario de la Universidad de Córdoba. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO adicionales.

La innovación principal no reside en la arquitectura, sino en el enfoque de uso: el modelo está diseñado para operar dentro de un pipeline RAG, recibiendo fichas recuperadas como contexto y generando respuestas fundamentadas en ellas. La model card reporta métricas de fidelidad, disponibilidad exacta e intención correcta, lo que sugiere una evaluación centrada en la calidad de las respuestas sobre el catálogo más que en benchmarks generales.

## Capacidades

- Generación de texto conversacional en castellano sobre el dominio bibliotecario.
- Respuesta fundamentada en fichas recuperadas mediante RAG, con fidelidad reportada del 100 % en la evaluación del autor.
- Comprensión de intención del usuario con un 96,7 % de acierto según la model card.
- Soporte de conversación multi-turno (heredado de la variante Instruct del modelo base).
- Compatibilidad con transformers.js, lo que permite ejecución en navegador.
- Distribución en GGUF para inferencia local con llama.cpp u Ollama.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Asistente de catálogo bibliotecario: el modelo recibe fichas recuperadas del catálogo de la Universidad de Córdoba y responde al usuario sobre disponibilidad, autores o títulos, evitando inventar obras gracias al ajuste LoRA orientado a fidelidad.
- Chatbot web embebido: al estar disponible en transformers.js, puede integrarse directamente en la página de la biblioteca y ejecutarse en el navegador del usuario sin backend GPU.
- Búsqueda conversacional en OPAC: el modelo transforma consultas en lenguaje natural en respuestas estructuradas sobre los resultados recuperados, mejorando la experiencia frente a formularios tradicionales.
- Prototipado rápido de asistentes de dominio: sirve como plantilla para adaptar LoRA a otros catálogos o colecciones documentales con presupuesto de cómputo mínimo.
- Despliegue en dispositivos de bajos recursos: con 0,4 GB de repo y formato GGUF, puede ejecutarse en portátiles sin GPU dedicada para tareas de consulta puntual.
- Evaluación de pipelines RAG: por sus métricas de fidelidad y disponibilidad, es útil como banco de pruebas para comparar estrategias de recuperación y prompting en dominios acotados.
- Formación y demos docentes: permite ilustrar el ciclo completo de ajuste fino con LoRA y despliegue en navegador en cursos de IA aplicada.

## Benchmarks y rendimiento

La model card reporta únicamente métricas de evaluación específicas del dominio, comparando el modelo base con el afinado:

| Metrica | Qwen2.5-0.5B-Instruct | BiblioLLM afinado |
|---|---|---|
| Fidelidad (no inventa títulos) % | 98,3 | 100 |
| Disponibilidad exacta % | 10 | 100 |
| Intención correcta % | 91,7 | 96,7 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantización de 4 bits; aproximadamente 1 GB en FP16 para los 494 millones de parámetros.
- GPU recomendadas: cualquier GPU consumer con 2 GB o más de VRAM es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en modelos como GTX 1650, RTX 3050, RTX 4060 o superiores, e incluso en CPU.
- Opciones de despliegue: transformers.js (navegador), llama.cpp, Ollama y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| BiblioLLM (Unicórdoba) | 494 M | no disponible | no disponible | safetensors, GGUF | Ajuste LoRA dominio bibliotecario |
| Qwen2.5-0.5B-Instruct | 494 M | 32 768 (según documentación pública de Qwen, no confirmado en esta ficha) | Apache 2.0 (según documentación pública de Qwen) | safetensors, GGUF | Modelo base generalista |
| SmolLM2-360M-Instruct | 360 M | 8 192 (según documentación pública) | Apache 2.0 | safetensors, GGUF | Alternativa pequeña generalista |
| TinyLlama-1.1B-Chat | 1,1 B | 2 048 (según documentación pública) | Apache 2.0 | safetensors, GGUF | Alternativa pequeña generalista |

La comparativa con modelos generalistas debe tomarse con cautela: BiblioLLM está especializado en un dominio concreto y sus métricas no son comparables con benchmarks generales.

## Limitaciones y advertencias

- El modelo está especializado en el catálogo de la Universidad de Córdoba; su rendimiento fuera de ese dominio no está evaluado y probablemente sea limitado.
- Al ser un ajuste de un modelo de 0,5B parámetros, su capacidad de razonamiento general y de conocimiento factual es reducida en comparación con modelos mayores.
- Riesgo de alucinación fuera del contexto RAG: aunque la model card reporta 100 % de fidelidad en su evaluación, esta se realizó sobre fichas recuperadas y no cubre consultas libres.
- La licencia no está especificada en la información disponible, por lo que no se puede confirmar el uso comercial; debe verificarse antes de producción.
- El idioma soportado es únicamente castellano según los tags; no hay evidencia de capacidades multilingües.
- La longitud de contexto no está confirmada en la ficha; se desconoce si se mantiene la del modelo base.
- Las métricas reportadas proceden del propio autor y no han sido replicadas de forma independiente.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Lucas2209/bibliollm-qwen0.5b-unicordoba
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- Paper de LoRA: https://arxiv.org/abs/2106.09685

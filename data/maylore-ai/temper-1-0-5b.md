# maylore-ai/Temper-1-0.5B

## Resumen

Temper-1-0.5B es un modelo de generacion de codigo especializado en Rust, desarrollado por maylore-ai mediante fine-tuning de Qwen2.5-Coder-0.5B-Instruct. Con solo 494 millones de parametros, el modelo se ha entrenado especificamente para resolver tareas de programacion en Rust y, segun sus resultados publicados, supera en pass@1 a modelos de hasta tres veces su tamano en tareas triviales y faciles de Rust.

El modelo parte de la arquitectura Qwen2 (transformer decoder-only) y ha sido afinado sobre 10.000 ejemplos de Rust generados por DeepSeek-V4-Flash y validados por compilador y tests, seguido de una fase de aprendizaje por refuerzo sobre sus propias respuestas. Su propuesta de valor es ofrecer capacidades de generacion de codigo Rust en un formato muy compacto, apto para despliegue local en hardware modesto.

Es relevante para desarrolladores que necesitan asistencia de codigo Rust en entornos con recursos limitados o que quieren ejecutar inferencia en local sin depender de APIs. Su licencia Apache 2.0 facilita la integracion comercial, aunque sus capacidades estan deliberadamente acotadas al lenguaje Rust y a peticiones en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF disponible (incluye Q8_0); otras no disponibles |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-Coder-0.5B-Instruct, un transformer decoder-only de la familia Qwen2 con 494 millones de parametros. El fine-tuning se realizo sobre 10.000 ejemplos de Rust escritos por DeepSeek-V4-Flash y verificados mediante compilador y tests, lo que garantiza que los ejemplos de entrenamiento son codigo funcional. Posteriormente se aplico una fase de aprendizaje por refuerzo sobre las propias respuestas del modelo.

La innovacion principal no reside en la arquitectura sino en la especializacion: el modelo esta optimizado exclusivamente para generacion de codigo Rust a partir de peticiones en ingles. No se ha entrenado para fill-in-the-middle ni para completado inline, sino para responder a peticiones de chat completas. El conjunto de entrenamiento contiene pocas tareas sobre codigo asincrono y frameworks web, lo que limita su cobertura en esos dominios.

## Capacidades

- Generacion de codigo Rust a partir de descripciones en lenguaje natural en ingles.
- Resolucion de tareas de programacion de dificultad trivial, facil y media en Rust.
- Generacion de funciones completas con tests incluidos (aunque los tests autogenerados no se validaron durante la evaluacion y pueden no compilar).
- Conversacion multi-turno mediante plantilla de chat (chat template de Qwen2).
- No soporta tool calling ni function calling de forma explicita segun la informacion disponible.
- No dispone de modo de razonamiento (thinking mode), vision ni audio.
- Capacidades multilingues limitadas al ingles; peticiones en otros idiomas pueden producir respuestas inventadas o rechazos.
- No entrenado para fill-in-the-middle, por lo que no es adecuado para completado inline en editores.

## Casos de uso

- Asistencia de codigo Rust en local: el modelo puede generar funciones y estructuras Rust en un portatil con GPU consumer gracias a sus 494 millones de parametros, sin necesidad de conexion a APIs externas.
- Generacion de tests unitarios en Rust: a partir de una funcion existente, el modelo puede proponer tests, aunque estos deben revisarse y compilarse manualmente porque no se validaron durante la evaluacion.
- Prototipado rapido de utilidades Rust: para scripts y herramientas pequenas en Rust, el modelo ofrece una primera version funcional que el desarrollador puede refinar.
- Educacion y aprendizaje de Rust: el modelo puede explicar y generar ejemplos de codigo Rust para estudiantes, con la ventaja de ejecutarse en hardware modesto.
- Integracion en pipelines de CI como generador de parches sugeridos: dado un mensaje de error del compilador o una descripcion de tarea, el modelo propone codigo que puede revisarse antes de aplicarse.
- Despliegue en entornos con restricciones de recursos: al caber en GPU consumer y ofrecer version GGUF para llama.cpp, LM Studio y Ollama, es adecuado para entornos embebidos o sin GPU dedicada.
- Fine-tuning adicional sobre dominios Rust especificos: al ser un modelo pequeno con licencia Apache 2.0, sirve como base para especializaciones posteriores en nichos concretos de Rust.

## Benchmarks y rendimiento

Resultados publicados por el autor (pass@1 / pass@10, %). La negrita marca el mejor pass@1 entre modelos de hasta 1.5B. Qwen2.5-Coder-3B se incluye solo como referencia.

| Benchmark | Temper-1-0.5B | ThoxEdge-RustCoder-0.5B | rust-mentor-0.6b | Qwen2.5-Coder-1.5B | Qwen3.5-0.8B | Qwen2.5-Coder-0.5B | Qwen2.5-Coder-3B (ref.) |
|---|---|---|---|---|---|---|---|
| trivial (interno) | **81.8** / 94.0 | 55.8 / 88.0 | 35.4 / 68.0 | 70.0 / 94.0 | 45.2 / 84.0 | 45.6 / 88.0 | 77.0 / 96.0 |
| easy (interno) | **59.0** / 76.7 | 13.0 / 50.0 | 13.7 / 30.0 | 42.7 / 73.3 | 13.3 / 36.7 | 15.0 / 50.0 | 51.0 / 83.3 |
| medium (interno) | **18.0** / 35.0 | 1.5 / 10.0 | 0.0 / 0.0 | 11.0 / 45.0 | 3.0 / 5.0 | 1.0 / 5.0 | 25.0 / 50.0 |
| HumanEval-RS | **34.7** / 57.1 | 13.3 / 41.7 | 4.6 / 16.7 | 31.0 / 69.2 | 6.9 / 20.5 | 16.9 / 42.3 | 50.6 / 87.2 |
| MBPP-RS | **38.8** / 54.8 | 12.8 / 44.4 | 9.7 / 27.1 | 34.4 / 64.7 | 11.6 / 33.3 | 23.4 / 50.8 | 41.3 / 72.9 |

Configuracion de evaluacion: temperatura 0.8, top_p 0.95, 10 respuestas por tarea, estimador insesgado de pass@k del paper Codex. Sin system prompt y sin razonamiento. HumanEval-RS y MBPP-RS provienen de MultiPL-E (revision `28441b6`). Los conjuntos trivial, easy y medium son internos y comparten estilo con los datos de entrenamiento, por lo que solo HumanEval-RS y MBPP-RS ofrecen una comparacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (494 millones de parametros) mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion Q8_0 (GGUF): aproximadamente 0.5 GB para los pesos.
- Cabe en cualquier GPU consumer con al menos 2 GB de VRAM, incluidas GTX 1050 Ti, RTX 3050, RTX 4060 y superiores.
- Tambien puede ejecutarse en CPU mediante llama.cpp u Ollama con la version GGUF.
- Opciones de despliegue: transformers (safetensors), llama.cpp, LM Studio, Ollama y text-generation-inference (el modelo esta etiquetado como compatible con endpoints TGI).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval-RS (pass@1) | MBPP-RS (pass@1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Temper-1-0.5B | 494 M | No disponible | 34.7 | 38.8 | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| ThoxEdge-RustCoder-0.5B | ~500 M | No disponible | 13.3 | 12.8 | No disponible | Hugging Face |
| rust-mentor-0.6b | ~600 M | No disponible | 4.6 | 9.7 | No disponible | Hugging Face |
| Qwen2.5-Coder-0.5B-Instruct | 494 M | No disponible | 16.9 | 23.4 | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct | ~1.5 B | No disponible | 31.0 | 34.4 | Apache 2.0 | Hugging Face |

Temper-1-0.5B lidera en pass@1 entre los modelos de hasta 1.5B en HumanEval-RS y MBPP-RS, con una ventaja notable sobre su modelo base Qwen2.5-Coder-0.5B-Instruct (34.7 frente a 16.9 en HumanEval-RS). Sin embargo, Qwen2.5-Coder-1.5B-Instruct supera a Temper en pass@10 en HumanEval-RS (69.2 frente a 57.1) y MBPP-RS (64.7 frente a 54.8), lo que indica que con multiples intentos el modelo mayor recupera terreno. Qwen2.5-Coder-3B sigue siendo superior en tareas de dificultad media y en ambos conjuntos MultiPL-E.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en Rust y con peticiones en ingles; preguntas en otros idiomas o no relacionadas con Rust pueden producir respuestas inventadas o rechazos.
- No esta entrenado para fill-in-the-middle ni para completado inline; espera peticiones de chat, por lo que no es un sustituto directo de un autocompletado de editor.
- Los tests que el modelo genera por si mismo no se validaron durante la evaluacion y pueden no compilar.
- El conjunto de entrenamiento contiene pocas tareas sobre codigo asincrono y frameworks web, lo que limita su rendimiento en esos dominios.
- Los conjuntos de evaluacion trivial, easy y medium son internos y comparten estilo con los datos de entrenamiento, por lo que sus resultados pueden estar inflados; solo HumanEval-RS y MBPP-RS son comparaciones independientes.
- Con diez intentos, Qwen2.5-Coder-1.5B resuelve mas tareas en medium, HumanEval-RS y MBPP-RS, y Qwen2.5-Coder-3B sigue siendo mas fuerte en tareas medias y en ambos conjuntos MultiPL-E.
- Riesgo de alucinacion en APIs de Rust, crates y funciones inexistentes, especialmente fuera del dominio de entrenamiento.
- La licencia Apache 2.0 exige mantener las atribuciones del archivo NOTICE (seccion 4(d)) en obras derivadas, incluidos fine-tunes, merges y cuantizaciones.
- No se dispone de informacion sobre sesgos especificos ni sobre la longitud de contexto soportada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maylore-ai/Temper-1-0.5B
- Version GGUF: https://huggingface.co/maylore-ai/Temper-1-0.5B-GGUF
- Perfil del autor en Hugging Face: https://huggingface.co/maylore-ai
- Sitio web del modelo: https://maylore.com/temper-0.5b
- Paper Codex (estimador pass@k): https://arxiv.org/abs/2107.03374
- MultiPL-E (repositorio de benchmarks): https://github.com/nuprl/MultiPL-E
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct

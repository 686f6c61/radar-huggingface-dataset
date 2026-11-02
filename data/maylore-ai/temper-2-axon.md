# maylore-ai/Temper-2-Axon

## Resumen

Temper-2-Axon es un modelo de generacion de codigo especializado en Rust, desarrollado por maylore-ai como sucesor de Temper-1-1.5B. Se construye mediante fine-tuning supervisado y aprendizaje por refuerzo sobre Qwen2.5-Coder-1.5B-Instruct, y esta disenado para interpretar peticiones en ingles y ruso, incluidas formulaciones breves o coloquiales. Con 1.543.714.304 parametros, se posiciona como una alternativa compacta para tareas de generacion de codigo Rust en entornos con recursos limitados.

El modelo emplea una arquitectura transformer decoder-only heredada de la familia Qwen2, con licencia Apache 2.0. Su relevancia radica en que, segun los datos publicados por el autor, iguala o supera a modelos de hasta 4B parametros en benchmarks especificos de Rust como HumanEval-RS y MBPP-RS, manteniendo un tamano que permite despliegue en hardware de consumo.

La propuesta se orienta a desarrolladores que necesitan asistencia de codigo Rust con comprension conversacional multi-turno, no a autocompletado inline. El modelo fue entrenado con soluciones que pasan compilador y tests, ademas de dialogos sobre si mismo y conversaciones tecnicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible (versiones concretas no disponibles) |
| Idiomas soportados | Ingles, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Temper-2-Axon parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only con atencion causal estandar. El proceso de entrenamiento consta de tres fases: fine-tuning supervisado sobre tareas Rust con soluciones que superan compilador y tests, junto con dialogos donde el modelo habla de si mismo, escribe codigo a lo largo de varios turnos o mantiene conversacion; fusion de pesos (weight merging) con el modelo Instruct original para recuperar parte de la comprension de peticiones que se pierde durante el fine-tuning; y finalmente aprendizaje por refuerzo sobre tareas con tests, con recompensa unicamente cuando la respuesta pasa todos los tests.

Las peticiones de entrenamiento varian desde especificaciones detalladas hasta frases de pocas palabras. El modelo no fue entrenado con fill-in-the-middle, lo que condiciona su uso. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset. El chat template incorpora un system prompt propio de Temper cuando no se proporciona uno. La configuracion de generacion por defecto usa temperature 0.7, top_p 0.8, top_k 20 y repetition_penalty 1.1, aunque los resultados de benchmark se obtuvieron con temperature 0.2 y top_p 0.95.

## Capacidades

- Generacion de codigo Rust a partir de especificaciones detalladas o peticiones breves y coloquiales.
- Razonamiento sobre tareas de programacion con multiples turnos de conversacion.
- Comprension de peticiones en ingles y ruso.
- Conversacion sobre si mismo y sobre su funcionamiento.
- Escritura de codigo a lo largo de varios turnos manteniendo contexto.
- No soporta fill-in-the-middle ni autocompletado inline en editor.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes multi-step ni thinking mode.
- No se documenta capacidad de vision ni audio.

## Casos de uso

- Asistencia conversacional para desarrollo en Rust: el modelo puede recibir una descripcion funcional en ingles o ruso y generar una funcion Rust completa, util en entornos de chat tecnico donde el desarrollador itera sobre la solucion.
- Generacion de funciones Rust en pipelines de documentacion o ejemplos: adecuado para producir snippets verificables en documentacion interna, dado que fue entrenado con codigo que pasa compilador y tests.
- Prototipado rapido de utilidades Rust: para tareas acotadas como funciones matematicas, parsing simple o transformaciones de datos, donde el modelo rinde cerca de modelos de 4B segun los datos del autor.
- Soporte multilingue en equipos con desarrolladores rusoparlantes: permite formular peticiones en ruso y obtener codigo Rust, reduciendo la barrera idiomatica en equipos mixtos.
- Educacion y aprendizaje de Rust: puede explicar y generar ejemplos de codigo a partir de preguntas conversacionales, aunque con limitaciones en conceptos avanzados como lifetimes o macros.
- Despliegue en entornos con recursos limitados: al ser un modelo de 1.5B con version GGUF, puede ejecutarse en estaciones de trabajo sin GPU dedicada o en GPUs de consumo para tareas de generacion de codigo Rust no criticas.
- Generacion de tests o ejemplos de uso en Rust: puede producir codigo de acompanamiento en conversaciones multi-turno, util para completar documentacion de APIs internas.

## Benchmarks y rendimiento

Resultados publicados por el autor. HumanEval-RS (156 tareas) y MBPP-RS (354 tareas) de MultiPL-E, revision `28441b6`, con temperatura 0.2, top_p 0.95, 50 respuestas por tarea y pass@k calculado con el estimador insesgado del paper Codex. Temper Bench v2 es un conjunto propio de 150 tareas Rust en tres niveles de dificultad, con greedy pass@1.

| Modelo | HumanEval-RS (pass@1 / pass@10) | MBPP-RS (pass@1 / pass@10) | Temper Bench v2 |
|---|---|---|---|
| Qwen3.5-9B | 76.0 / 90.2 | 65.6 / 79.2 | 29.3 |
| Qwen2.5-Coder-7B-Instruct | 72.4 / 82.6 | 60.5 / 70.0 | 26.0 |
| Tessa-Rust-T1-7B | 71.5 / 79.0 | 57.8 / 68.9 | 29.3 |
| Qwen3.5-4B | 66.2 / 81.4 | 57.7 / 73.4 | 20.7 |
| **Temper-2-Axon** | **64.2 / 73.8** | **54.7 / 61.7** | **21.3** |
| Qwen3-4B | 59.8 / 64.8 | 55.6 / 60.6 | 18.7 |
| Qwen2.5-Coder-3B-Instruct | 56.5 / 71.9 | 44.8 / 60.0 | 14.7 |
| Temper-1-1.5B | 54.1 / 68.8 | 48.6 / 59.2 | 16.7 |
| Qwen2.5-Coder-1.5B-Instruct | 39.0 / 56.1 | 38.3 / 52.1 | 7.3 |

Temper-2-Axon obtiene el mejor resultado entre modelos de hasta 1.5B en HumanEval-RS pass@1 (64.2), superando a Temper-1-1.5B en 10.1 puntos y a Qwen2.5-Coder-1.5B-Instruct en 25.2 puntos. En MBPP-RS pass@1 alcanza 54.7, frente a 48.6 de Temper-1 y 38.3 del base. En Temper Bench v2 registra 21.3, por encima de Qwen3.5-4B (20.7) y Qwen3-4B (18.7), pero por debajo de Qwen2.5-Coder-7B (26.0) y Qwen3.5-9B (29.3).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3.1 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1.6 GB; en 4 bits: aproximadamente 0.8-1.0 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 en inferencia basica; A100, H100 o RTX 4090 no son necesarias pero ofrecen mayor throughput.
- Cabe en GPUs de consumo: si, en RTX 3060, RTX 4060, RTX 4090 y similares; tambien en GPUs integradas con suficiente memoria compartida en cuantizacion baja.
- Opciones de despliegue: transformers, llama.cpp, LM Studio, Ollama mediante la version GGUF publicada en maylore-ai/Temper-2-Axon-GGUF; text-generation-inference figura entre los tags del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval-RS pass@1 | MBPP-RS pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Temper-2-Axon | 1.5B | no disponible | 64.2 | 54.7 | Apache 2.0 | HuggingFace (safetensors, GGUF) |
| Temper-1-1.5B | 1.5B | no disponible | 54.1 | 48.6 | no disponible | HuggingFace |
| Qwen2.5-Coder-1.5B-Instruct | 1.5B | no disponible | 39.0 | 38.3 | Apache 2.0 | HuggingFace |
| Qwen2.5-Coder-3B-Instruct | 3B | no disponible | 56.5 | 44.8 | Apache 2.0 | HuggingFace |
| Qwen3-4B | 4B | no disponible | 59.8 | 55.6 | no disponible | HuggingFace |

Frente a modelos del mismo tamano, Temper-2-Axon supera claramente a su base Qwen2.5-Coder-1.5B-Instruct y a Temper-1-1.5B en tareas Rust. Frente a modelos de 3B-4B, mantiene ventaja en HumanEval-RS pass@1 sobre Qwen2.5-Coder-3B y Qwen3-4B, y en MBPP-RS supera a Qwen2.5-Coder-3B pero queda por debajo de Qwen3-4B en pass@1.

## Limitaciones y advertencias

- El modelo queda por detras de modelos mayores: Qwen2.5-Coder-7B resuelve 8.2 puntos mas de tareas HumanEval-RS al primer intento y Qwen3.5-9B, 11.8 puntos mas.
- Rara vez resuelve tareas con macros, lifetimes o codigo async, segun el propio autor.
- No fue entrenado con fill-in-the-middle, por lo que no sirve como modelo drop-in para autocompletado inline en editor.
- Idiomas soportados limitados a ingles y ruso; no se documenta castellano.
- No se documenta soporte de tool calling, function calling ni agentes, lo que limita su integracion en pipelines automatizados complejos.
- Riesgo de alucinacion en APIs, crates o firmas de funciones Rust no vistas durante el entrenamiento; el codigo generado debe compilarse y testearse antes de usarse en produccion.
- No se especifica la longitud de contexto, lo que impide planificar tareas que requieran ventanas largas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo hereda las condiciones del base Qwen2.5-Coder-1.5B-Instruct, tambien Apache 2.0.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/maylore-ai/Temper-2-Axon
- Version GGUF: https://huggingface.co/maylore-ai/Temper-2-Axon-GGUF
- Modelo predecesor: https://huggingface.co/maylore-ai/Temper-1-1.5B
- Modelo hermano: https://huggingface.co/maylore-ai/Temper-2-Ion
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Web del modelo: https://maylore.com/temper-2-axon
- Temper Bench: https://maylore.com/temper-bench
- Repositorio de evaluacion: https://github.com/maylore-ai/rust-evals
- MultiPL-E: https://github.com/nuprl/MultiPL-E
- Paper Codex (estimador pass@k): https://arxiv.org/abs/2107.03374

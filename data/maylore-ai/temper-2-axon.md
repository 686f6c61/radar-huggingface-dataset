# maylore-ai/Temper-2-Axon

## Resumen

Temper-2-Axon es un modelo de generacion de codigo especializado en Rust, desarrollado por maylore-ai como sucesor de Temper-1-1.5B. Se construye sobre Qwen2.5-Coder-1.5B-Instruct mediante fine-tuning supervisado y aprendizaje por refuerzo sobre tareas de Rust que superan la compilacion y las pruebas, y esta disenado para interpretar peticiones en ingles y ruso, incluidas formulaciones breves e informales. Con 1.543.714.304 parametros, apunta a un nicho concreto: generacion de funciones y programas Rust en entornos conversacionales donde un modelo de 1.5B debe rendir por encima de su clase.

El modelo destaca por su relacion rendimiento/tamano: segun la model card, iguala a modelos de 4B en los benchmarks propios del autor (HumanEval-RS y MBPP-RS) y supera ampliamente a su base Qwen2.5-Coder-1.5B-Instruct (64.2 frente a 39.0 en HumanEval-RS pass@1). Es relevante para equipos que necesitan un asistente de codigo Rust ligero, desplegable en hardware modesto y con licencia Apache 2.0 permisiva.

La arquitectura es la de Qwen2 (transformer decoder-only) heredada del modelo base, con pesos en safetensors y una version GGUF publicada aparte para llama.cpp, LM Studio y Ollama. El contexto maximo no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (~1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible en repo separado (maylore-ai/Temper-2-Axon-GGUF); niveles concretos no disponibles |
| Idiomas soportados | Ingles (en), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repo aparte |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de la familia Qwen2. El entrenamiento combina tres fases: fine-tuning supervisado sobre tareas de Rust con soluciones que pasan compilador y tests, junto con dialogos donde el modelo habla de si mismo, escribe codigo a lo largo de varios turnos o mantiene conversacion; un merge por pesos con el Instruct original para recuperar parte de la comprension de peticiones que se pierde durante el fine-tuning; y finalmente aprendizaje por refuerzo sobre tareas con tests, con recompensa unicamente para respuestas que superan todas las pruebas. Las peticiones de entrenamiento varian desde especificaciones detalladas hasta frases de pocas palabras.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el algoritmo de RL empleado. La innovacion principal es la combinacion de merge con el modelo base y RL verificado por tests para preservar comprension de instrucciones sin sacrificar precision en Rust.

## Capacidades

- Generacion de codigo Rust: funciones y programas completos a partir de especificaciones detalladas o peticiones breves.
- Razonamiento sobre tareas de programacion con tests, orientado a soluciones que compilan y pasan pruebas.
- Conversacion multi-turno: mantiene dialogos y escribe codigo a lo largo de varios turnos.
- Comprension de peticiones en ingles y ruso, incluidas formulaciones casuales y cortas.
- Dialogo sobre si mismo (meta-conversacion sobre el modelo).
- No dispone de modo thinking, vision ni audio segun la informacion disponible.
- No se documenta soporte explicito de tool calling o function calling.
- No esta entrenado para fill-in-the-middle, por lo que no sirve como modelo de autocompletado inline.

## Casos de uso

- Asistente de codigo Rust en IDE o chat: el modelo genera funciones completas a partir de una descripcion en ingles o ruso, adecuado por su especializacion y su capacidad de interpretar peticiones cortas.
- Generacion de utilidades y snippets en pipelines de desarrollo: sirve para producir funciones Rust que se validan despues con `cargo test`, aprovechando su entrenamiento con recompensa por tests superados.
- Prototipado rapido de logica en Rust: al ser ligero (1.5B), permite iteracion rapida en local sin depender de APIs externas.
- Soporte a equipos rusoparlantes: unico punto fuerte frente a modelos genericos, al entender peticiones en ruso ademas de ingles.
- Educacion y ensenanza de Rust: puede explicar y escribir codigo en conversaciones multi-turno, util para tutoria interactiva.
- Despliegue en entornos con recursos limitados: cabe en GPUs de consumo y en CPU via GGUF, lo que permite asistencia de codigo en portatiles o servidores pequenos.
- Automatizacion de tareas repetitivas de generacion de codigo Rust en scripts y herramientas internas.

## Benchmarks y rendimiento

Resultados publicados en la model card (pass@1 / pass@10 en %, HumanEval-RS 156 tareas, MBPP-RS 354 tareas, MultiPL-E revision `28441b6`; Temper Bench v2 con greedy pass@1):

| Modelo | HumanEval-RS | MBPP-RS | Temper Bench v2 |
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

Temper-2-Axon es el mejor modelo de hasta 1.5B en HumanEval-RS pass@1 y supera a Qwen3-4B en HumanEval-RS y Temper Bench v2. Las metricas se obtuvieron con temperatura 0.2, top_p 0.95, top_k 20, repetition_penalty 1.1 y 50 respuestas por tarea.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3.1 GB de pesos, mas overhead de activaciones y KV cache (estimacion: 4-5 GB en total).
- En cuantizacion de 8 bits: alrededor de 1.6 GB de pesos; en 4 bits: alrededor de 0.8-1 GB.
- Cabe en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 y similares con holgura; tambien en GPUs integradas o CPU via GGUF.
- Despliegue: transformers, vLLM (usado por el autor para los benchmarks), llama.cpp, LM Studio y Ollama mediante la version GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval-RS pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Temper-2-Axon | ~1.5B | no disponible | 64.2 | Apache 2.0 | HF + GGUF |
| Qwen2.5-Coder-1.5B-Instruct | ~1.5B | no disponible | 39.0 | Apache 2.0 | HF |
| Qwen2.5-Coder-3B-Instruct | ~3B | no disponible | 56.5 | Apache 2.0 | HF |
| Qwen3-4B | ~4B | no disponible | 59.8 | Apache 2.0 | HF |

Frente a su base directa, Temper-2-Axon mejora 25.2 puntos en HumanEval-RS pass@1 y 16.4 en MBPP-RS pass@1, y supera tambien a Qwen2.5-Coder-3B-Instruct y Qwen3-4B en HumanEval-RS, aunque queda por debajo de modelos de 7B y 9B.

## Limitaciones y advertencias

- Queda por detras de modelos mayores: Qwen2.5-Coder-7B resuelve 8.2 puntos mas en HumanEval-RS pass@1 y Qwen3.5-9B, 11.8 mas.
- Rara vez resuelve tareas que declaran sus propias macros, usan lifetimes o codigo async.
- No esta entrenado para fill-in-the-middle: no es apto como modelo de autocompletado inline en editor.
- Idiomas limitados a ingles y ruso; no se documenta soporte de castellano.
- Riesgo de alucinacion en APIs o crates inexistentes, comun en modelos de codigo; conviene validar con compilador y tests.
- Sesgos: no se documentan sesgos especificos en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero las obras derivadas (fine-tunes, merges, cuantizaciones) deben mantener las atribuciones del archivo NOTICE (seccion 4(d) de Apache 2.0).
- El chat template anade un system prompt de Temper si no se proporciona uno, lo que puede afectar a evaluaciones comparativas si no se controla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maylore-ai/Temper-2-Axon
- Version GGUF: https://huggingface.co/maylore-ai/Temper-2-Axon-GGUF
- Modelo predecesor: https://huggingface.co/maylore-ai/Temper-1-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Web oficial: https://maylore.com/temper-2-axon
- Temper Bench: https://maylore.com/temper-bench
- Scripts de evaluacion: https://github.com/maylore-ai/rust-evals
- MultiPL-E: https://github.com/nuprl/MultiPL-E
- Paper Codex (estimador pass@k): https://arxiv.org/abs/2107.03374

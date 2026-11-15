# maylore-ai/Temper-2-Sapient

## Resumen

Temper-2-Sapient es un modelo de generacion de codigo especializado en Rust, desarrollado por maylore-ai como el miembro de mayor tamano de la familia Temper 2. Se trata de un fine-tune de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7.615.616.512 parametros (aproximadamente 7,6B) con licencia Apache 2.0. El modelo resuelve el problema de la generacion de codigo Rust de calidad en tareas de compilacion y test, un lenguaje con curva de aprendizaje pronunciada y escasez de datos de entrenamiento de alta calidad en comparacion con Python o JavaScript.

La propuesta de valor del modelo es su rendimiento en benchmarks especificos de Rust: segun la model card, supera a todos los modelos abiertos de hasta 14B parametros en HumanEval-RS, MBPP-RS y Temper Bench v2, y en MBPP-RS iguala a Gemma 4 26B-A4B. El modelo entiende peticiones en ingles y ruso, y esta pensado para integrarse en flujos de generacion de codigo asistida, no para autocompletado inline.

Es relevante ahora porque demuestra que un fine-tune cuidadoso sobre una base de 7B puede competir con modelos significativamente mayores en un dominio vertical concreto (Rust), a coste de inferencia mucho menor. La publicacion incluye scripts de evaluacion abiertos y una version GGUF para despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible (variantes no especificadas en la informacion proporcionada) |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en la arquitectura Qwen2, heredada de Qwen2.5-Coder-7B-Instruct. No se trata de un modelo MoE ni hibrido: es un dense transformer de aproximadamente 7,6B parametros. La model card no detalla la longitud de contexto nativa, el numero de capas, la dimension oculta ni el vocabulario; estos datos deben consultarse en la ficha del modelo base.

El entrenamiento consistio en un fine-tune sobre tareas sinteticas de Rust en las que cada solucion paso el compilador y los tests. Las tareas cubren lifetimes, traits y tipos asociados, hilos y canales, async/await, macros, manejo de errores, parsing de texto y formatos, y trabajo con ficheros, redes y bases de datos. Antes del entrenamiento, las tareas se filtraron contra HumanEval-RS, MBPP-RS y Temper Bench v2 por texto y por significado para eliminar solapamientos. No se menciona RLHF ni DPO en la informacion disponible; el proceso parece ser un fine-tune supervisado (SFT) sobre datos sinteticos verificados.

Una innovacion destacable es la inclusion de un system prompt propio de Temper en la plantilla de chat cuando no se proporciona uno, y una configuracion de generacion por defecto con temperatura 0,2 y top_p 0,95, alineada con la evaluacion publicada. El modelo no esta entrenado con fill-in-the-middle, lo que condiciona su uso.

## Capacidades

- Generacion de codigo Rust: funciones, modulos y programas completos que compilan y pasan tests en tareas de HumanEval-RS y MBPP-RS.
- Razonamiento sobre caracteristicas avanzadas de Rust: lifetimes, traits, tipos asociados, concurrencia con hilos y canales, async/await y macros.
- Manejo de errores idiomatico en Rust y parsing de texto y formatos.
- Trabajo con ficheros, redes y bases de datos en codigo Rust.
- Conversacion multi-turno en ingles y ruso.
- Generacion de texto general (pipeline text-generation).
- Compatibilidad con text-generation-inference y endpoints compatibles.
- No soporta fill-in-the-middle: no es adecuado para autocompletado inline en editor.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Generacion de funciones Rust en produccion: el modelo produce codigo que compila y pasa tests en tareas de HumanEval-RS y MBPP-RS, por lo que puede integrarse en pipelines de generacion de utilidades y modulos Rust con revision humana posterior.
- Migracion de logica desde otros lenguajes a Rust: gracias a su manejo de lifetimes, traits y tipos asociados, puede generar traducciones idiomaticas de funciones Python o JavaScript a Rust en tareas de refactorizacion.
- Asistencia en code review de Rust: el modelo puede analizar fragmentos de codigo y proponer correcciones sobre manejo de errores, concurrencia y ownership, aunque requiere validacion por el compilador.
- Generacion de tests unitarios en Rust: puede producir casos de prueba para funciones existentes, aprovechando su entrenamiento en tareas verificadas por tests.
- Chat tecnico bilingue (en/ru) para equipos de desarrollo: soporta conversaciones multi-turno en ingles y ruso, util para equipos distribuidos que trabajan en Rust.
- Prototipado de APIs y servicios async: puede generar esqueletos de servidores async/await con manejo de errores y acceso a bases de datos, acelerando el arranque de proyectos.
- Educacion y aprendizaje de Rust: puede explicar y generar ejemplos de conceptos avanzados (lifetimes, traits, macros) en ingles y ruso.

## Benchmarks y rendimiento

Resultados publicados en la model card. HumanEval-RS y MBPP-RS muestran pass@1 / pass@10 en porcentaje. Temper Bench v2 es un conjunto interno de 150 tareas Rust a tres niveles de dificultad, con greedy pass@1.

| Modelo | HumanEval-RS | MBPP-RS | Temper Bench v2 |
|---|---|---|---|
| Qwen3.6-35B-A3B | 89,2 / 95,3 | 78,1 / 83,3 | 63,3 |
| Gemma 4 26B-A4B | 86,8 / 90,6 | 75,0 / 78,3 | 74,7 |
| **Temper-2-Sapient** | **83,3 / 87,2** | **73,7 / 77,7** | **52,0** |
| Qwen2.5-Coder-14B-Instruct | 78,1 / 85,8 | 58,5 / 69,2 | 40,0 |
| Qwen3.5-9B | 76,0 / 90,2 | 65,6 / 79,2 | 29,3 |
| Temper-2-Nodel | 73,2 / 82,6 | 64,8 / 71,1 | 37,3 |
| Qwen2.5-Coder-7B-Instruct | 72,4 / 82,6 | 60,5 / 70,0 | 26,0 |
| Seed-Coder-8B-Instruct | 71,1 / 77,6 | 68,1 / 77,3 | 41,3 |
| Qwen3-8B | 68,6 / 74,8 | 64,1 / 70,0 | 30,7 |
| Temper-2-Axon | 64,2 / 73,8 | 54,7 / 61,7 | 21,3 |

Condiciones de evaluacion: HumanEval-RS (156 tareas) y MBPP-RS (354 tareas) de MultiPL-E en la revision `28441b6`, temperatura 0,2, top_p 0,95, 50 respuestas por tarea, sin system message y con la plantilla de chat por defecto de cada modelo. Los scripts estan abiertos en el repositorio `maylore-ai/rust-evals`.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda 24 GB o mas.
- Cuantizacion en 8 bits: en torno a 8 GB de VRAM; cabe en GPUs consumer de gama alta (RTX 3090, RTX 4090, RTX 5090).
- Cuantizacion en 4 bits (GGUF Q4): en torno a 4-5 GB de VRAM; cabe en GPUs consumer de gama media (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- GPU recomendadas para produccion: A100 40/80 GB, H100, L40S; para desarrollo: RTX 4090 o RTX 3090.
- Opciones de despliegue: transformers (safetensors), text-generation-inference (TGI), vLLM, llama.cpp, LM Studio y Ollama mediante la version GGUF en `maylore-ai/Temper-2-Sapient-GGUF`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval-RS (pass@1) | MBPP-RS (pass@1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Temper-2-Sapient | ~7,6B | no disponible | 83,3 | 73,7 | Apache 2.0 | HF + GGUF |
| Qwen2.5-Coder-7B-Instruct | ~7,6B | no disponible | 72,4 | 60,5 | Apache 2.0 | HF |
| Qwen2.5-Coder-14B-Instruct | ~14B | no disponible | 78,1 | 58,5 | Apache 2.0 | HF |
| Seed-Coder-8B-Instruct | ~8B | no disponible | 71,1 | 68,1 | no disponible | HF |
| Temper-2-Nodel | no disponible | no disponible | 73,2 | 64,8 | Apache 2.0 | HF |

Temper-2-Sapient supera a su modelo base en HumanEval-RS (+10,9 puntos) y MBPP-RS (+13,2 puntos), y supera tambien a Qwen2.5-Coder-14B-Instruct en ambas metricas pese a tener la mitad de parametros. Frente a modelos mayores como Qwen3.6-35B-A3B y Gemma 4 26B-A4B queda por detras en HumanEval-RS y Temper Bench v2, aunque en MBPP-RS se acerca a Gemma 4 26B-A4B.

## Limitaciones y advertencias

- En Temper Bench v2, Gemma 4 26B-A4B resuelve 22,7 puntos mas de tareas, lo que indica una brecha significativa en tareas Rust complejas frente a modelos mayores.
- El propio autor senala que en conversacion en vivo el modelo resulto mas debil de lo esperado; no es un modelo de chat generalista fiable.
- No soporta fill-in-the-middle: no es apto como modelo drop-in para autocompletado inline en editores.
- Solo soporta ingles y ruso; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion en APIs, crates y firmas de funciones Rust no presentes en los datos de entrenamiento; el codigo generado debe compilarse y testearse antes de usarse en produccion.
- Posibles sesgos derivados de los datos sinteticos de entrenamiento y del modelo base Qwen2.5-Coder; no se documentan evaluaciones de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero las obras derivadas (fine-tunes, merges, cuantizaciones) deben mantener las atribuciones del fichero NOTICE conforme a la seccion 4(d) de Apache 2.0.
- La longitud de contexto no se especifica en la informacion disponible; conviene consultar la ficha del modelo base antes de disenar flujos con entradas largas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maylore-ai/Temper-2-Sapient
- Version GGUF: https://huggingface.co/maylore-ai/Temper-2-Sapient-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Web oficial: https://maylore.com/temper-2-sapient
- Temper Bench v2: https://maylore.com/temper-bench
- Repositorio de evaluacion Rust: https://github.com/maylore-ai/rust-evals
- MultiPL-E: https://github.com/nuprl/MultiPL-E
- Paper del estimador pass@k (Codex): https://arxiv.org/abs/2107.03374
- Modelo hermano Temper-2-Ion: https://huggingface.co/maylore-ai/Temper-2-Ion
- Modelo hermano Temper-2-Axon: https://huggingface.co/maylore-ai/Temper-2-Axon
- Modelo hermano Temper-2-Nodel: https://huggingface.co/maylore-ai/Temper-2-Nodel

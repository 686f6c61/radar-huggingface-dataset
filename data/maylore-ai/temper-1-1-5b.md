# maylore-ai/Temper-1-1.5B

## Resumen

Temper-1-1.5B es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-1.5B-Instruct, desarrollado por maylore-ai y especializado en la generación de código Rust. El modelo parte de la arquitectura Qwen2 (transformer decoder-only denso) con 1.543.714.304 parámetros y se distribuye bajo licencia Apache 2.0. Su objetivo es cubrir un nicho concreto: la escritura de Rust de calidad en un tamaño que pueda ejecutarse en hardware modesto.

El modelo se ha entrenado sobre 10.000 ejemplos de Rust generados por DeepSeek-V4-Flash y validados mediante compilador y tests, sin refuerzo por aprendizaje (sin RL). Según la model card, alcanza un pass@1 del 50,5% en HumanEval-Rust (variante `multiple-rs` de MultiPL-E con 156 tareas), superando a Qwen2.5-Coder-3B (44,7%) con la mitad de parámetros y quedando cerca de modelos de 7B-9B.

Es relevante ahora porque demuestra que un ajuste fino pequeño y bien dirigido puede superar a modelos base de mayor tamaño en un dominio específico, manteniendo un coste de inferencia bajo. El contexto, los datos de entrenamiento detallados y las capacidades fuera del dominio Rust no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible en repo separado (niveles no especificados); safetensors en precision original |
| Idiomas soportados | Ingles (entrenado solo con peticiones en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo `maylore-ai/Temper-1.5B-GGUF`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen2.5-Coder-1.5B-Instruct, que emplea una arquitectura transformer decoder-only densa de la familia Qwen2. El ajuste se realizó sobre 10.000 ejemplos de código Rust, los mismos que se usaron para entrenar Temper-1-0.5B. Cada ejemplo fue generado por DeepSeek-V4-Flash y pasó las comprobaciones de compilador y tests, lo que garantiza que el corpus de entrenamiento contiene código funcional.

No se empleó aprendizaje por refuerzo (RL) en este modelo. La model card no detalla la composición exacta del dataset, el número total de tokens de entrenamiento, la técnica de ajuste (SFT, LoRA, etc.) ni innovaciones arquitectónicas adicionales. Tampoco se documentan mecanismos como decodificación especulativa o atención lineal. El modelo se distribuye con una configuración de generación por defecto (temperatura 0,7, top_p 0,8, top_k 20, penalización de repetición 1,1).

## Capacidades

- Generación de código Rust: función principal del modelo, entrenado específicamente para completar tareas de programación en Rust a partir de descripciones en inglés.
- Resolución de problemas de programación tipo HumanEval: completa funciones y cuerpos de código en Rust.
- Conversación: hereda el formato conversacional de Qwen2.5-Coder-1.5B-Instruct y admite `apply_chat_template`.
- Generación de texto general: capacidad residual del modelo base, aunque no es su foco.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo no fue entrenado para ello.
- Capacidades multilingües: limitadas al inglés en las peticiones; el código generado es Rust.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Generación de funciones Rust en pipelines de desarrollo: el modelo puede completar funciones y módulos Rust a partir de una descripción en inglés, integrándose en tareas de generación de código dentro de un flujo de trabajo con revisión humana. Su pass@1 del 50,5% en HumanEval-Rust lo hace adecuado para borradores que luego se validan con el compilador.
- Asistente de código en entornos con recursos limitados: con 1.5B parámetros y versión GGUF, puede desplegarse en estaciones de trabajo o portátiles para sugerir código Rust sin depender de servicios en la nube.
- Prototipado rápido de utilidades Rust: para generar esqueletos de funciones, estructuras y algoritmos comunes (por ejemplo, Fibonacci, parseo, manipulación de colecciones) que el desarrollador revisa y adapta.
- Evaluación y comparación de modelos de código: sirve como referencia de un fine-tune pequeño especializado frente a modelos base de mayor tamaño en benchmarks de Rust.
- Educación y aprendizaje de Rust: puede generar ejemplos de código Rust a partir de enunciados en inglés, útil en entornos docentes con revisión posterior.
- Generación de tests y ejemplos: aunque no está entrenado específicamente para ello, puede producir fragmentos de código Rust que sirvan como base para tests, siempre que se validen con el compilador.
- Integración en herramientas de CI/CD como generador de parches candidatos: el código generado debe pasar compilación y tests antes de aceptarse, lo que encaja con su entrenamiento sobre ejemplos validados.

## Benchmarks y rendimiento

Resultados en HumanEval-Rust (variante `multiple-rs` de MultiPL-E, 156 tareas), ejecutados con bigcode-evaluation-harness (commit `8fc5bae`) y ajustes del BigCode Models Leaderboard: temperatura 0,2, top_p 0,95, 50 muestras por tarea, 512 tokens incluyendo el prompt.

| Modelo | Tamano | pass@1 | pass@10 |
|---|---|---|---|
| Qwen2.5-Coder-0.5B | 0.5B | 16.0 | 27.9 |
| StarCoder2-3B | 3B | 25.1 | 37.8 |
| Temper-1-0.5B | 0.5B | 25.2 | 38.0 |
| Qwen2.5-Coder-1.5B | 1.5B | 39.3 | 56.6 |
| Qwen2.5-Coder-3B | 3B | 44.7 | 67.4 |
| **Temper-1-1.5B** | 1.5B | **50.5** | 67.0 |
| Qwen3.5-9B | 9B | 56.7 | 73.0 |
| Qwen2.5-Coder-7B | 7B | 57.3 | 74.3 |

No se han publicado resultados de otros benchmarks (MMLU, GSM8K, HumanEval en otros lenguajes) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para un modelo de 1.5B parámetros, una estimación orientativa sería en torno a 3-4 GB en FP16 y menos de 2 GB en cuantizaciones GGUF de 4 bits, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no especificadas. Por tamaño, cabría en GPUs consumer como RTX 3060, RTX 4060, RTX 4090, así como en A100/H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: sí, por el tamaño del modelo (1.5B), aunque no se detallan requisitos exactos.
- Opciones de despliegue: transformers (con `device_map="auto"`), llama.cpp, LM Studio y Ollama mediante el repo GGUF `maylore-ai/Temper-1.5B-GGUF`. También es compatible con text-generation-inference según los tags.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval-Rust pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Temper-1-1.5B | 1.5B | no disponible | 50.5 | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen2.5-Coder-1.5B-Instruct | 1.5B | no disponible | 39.3 (base) | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-3B | 3B | no disponible | 44.7 | Apache 2.0 | Hugging Face |
| StarCoder2-3B | 3B | no disponible | 25.1 | BigCode OpenRAIL-M (no confirmado en la información) | Hugging Face |

Temper-1-1.5B supera a Qwen2.5-Coder-1.5B y a Qwen2.5-Coder-3B en pass@1 en HumanEval-Rust, aunque queda ligeramente por debajo de Qwen2.5-Coder-3B en pass@10 (67,0 frente a 67,4). Frente a modelos de 7B-9B, queda por debajo en pass@1 pero con un coste de inferencia mucho menor.

## Limitaciones y advertencias

- Entrenado únicamente con tareas Rust y peticiones en inglés: peticiones en otros idiomas o preguntas no relacionadas con Rust pueden producir respuestas inventadas o rechazos.
- No entrenado para fill-in-the-middle: no es un sustituto directo para autocompletado en línea en editores.
- Datos de entrenamiento con pocas tareas de código asíncrono y frameworks web: el rendimiento en esos ámbitos puede ser inferior.
- Riesgo de alucinación: al ser un modelo pequeño y especializado, puede generar código que no compile o que sea semánticamente incorrecto; se recomienda validación con compilador y tests.
- Sesgos: no documentados en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero las obras derivadas (fine-tunes, merges, cuantizaciones) deben mantener las atribuciones indicadas en el fichero NOTICE (Apache 2.0, sección 4(d)).
- Contexto: la longitud de contexto no está documentada; se desconoce si conserva la ventana del modelo base.
- En pass@10 iguala aproximadamente a Qwen2.5-Coder-3B, por lo que la ventaja se concentra en el primer intento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maylore-ai/Temper-1-1.5B
- Versión GGUF: https://huggingface.co/maylore-ai/Temper-1-1.5B-GGUF
- Modelo predecesor Temper-1-0.5B: https://huggingface.co/maylore-ai/Temper-1-0.5B
- Sitio web del modelo: https://maylore.com/temper-1.5b
- MultiPL-E: https://github.com/nuprl/MultiPL-E
- bigcode-evaluation-harness: https://github.com/bigcode-project/bigcode-evaluation-harness
- Modelo base Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct

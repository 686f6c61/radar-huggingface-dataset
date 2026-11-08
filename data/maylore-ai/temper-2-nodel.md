# maylore-ai/Temper-2-Nodel

## Resumen

Temper-2-Nodel es un modelo de lenguaje especializado en generación de código Rust, desarrollado por Maylore (maylore-ai). Se trata de un fine-tune del modelo base Qwen3.5-4B, con 4.205.751.296 parámetros (aproximadamente 4,2 mil millones), orientado a tareas aplicadas de Rust que implican traits, genéricos y concurrencia con hilos. El modelo forma parte de la línea Temper 2, siendo el mayor de la familia y el primero construido sobre Qwen3.5.

El problema que resuelve es la generación de código Rust de calidad en entornos locales y en hardware de consumo. Según la model card, supera a todos los modelos de hasta 9B parámetros que el equipo ha evaluado en tareas de Rust, y está diseñado para entender peticiones en inglés y ruso, incluidas peticiones cortas e informales. La relevancia actual radica en que ofrece un rendimiento competitivo en un tamaño compacto que cabe en PC de consumo, con licencia Apache 2.0 y disponibilidad en formatos transformers y GGUF.

La arquitectura subyacente es la del modelo base Qwen3.5-4B (familia qwen3_5_text), con un total de 4,2B parámetros. La longitud de contexto no se especifica en la información disponible. El modelo se distribuye en safetensors (tamaño de repositorio 8,4 GB) y cuenta con una versión GGUF para llama.cpp, LM Studio y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag qwen3_5_text) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en detalle; existe versión GGUF para llama.cpp, LM Studio y Ollama |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5. El proceso de entrenamiento consistió en un fine-tune sobre las mismas tareas y diálogos de Rust que el modelo Temper-2-Axon, junto con un conjunto de tareas difíciles, seguido de reinforcement learning sobre tareas con tests y una fusión de pesos (weight merge) con el modelo original. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni los detalles del algoritmo de RL empleado.

La innovación destacable es la combinación de fine-tune supervisado, RL sobre tareas verificables con tests y una fusión de pesos con el modelo base, lo que permite conservar parte de las capacidades del modelo original mientras se especializa en Rust. La plantilla de chat añade un system prompt de Temper cuando no se proporciona uno, y abre cada turno del asistente con un bloque de pensamiento vacío, de modo que el modelo responde directamente sin razonamiento explícito. La configuración de generación por defecto usa temperature 0.2 y top_p 0.95.

## Capacidades

- Generación de código Rust especializado en tareas aplicadas: traits, genéricos y concurrencia con hilos.
- Comprensión de peticiones en inglés y ruso, incluidas peticiones cortas e informales.
- Generación de texto conversacional y resolución de tareas de programación con tests.
- Respuesta directa sin modo de razonamiento (thinking block vacío por defecto en la plantilla).
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso en la información disponible.
- No se documenta soporte de visión, audio ni otras modalidades.
- No orientado a fill-in-the-middle ni a autocompletado inline en editores.

## Casos de uso

- Asistencia a desarrolladores Rust en local: el modelo puede generar funciones y estructuras Rust con traits y genéricos en un portátil o PC de consumo, ejecutándose en LM Studio, Ollama o llama.cpp gracias a la versión GGUF.
- Generación de código en pipelines de revisión: puede producir implementaciones Rust que se compilan y verifican con tests, lo que encaja en flujos de integración continua que validan el código generado antes de fusionarlo.
- Soporte bilingüe inglés-ruso para equipos de desarrollo: permite formular peticiones de código en cualquiera de los dos idiomas, incluidas peticiones informales, y recibir código Rust en respuesta.
- Prototipado rápido de módulos Rust: útil para generar esqueletos de código con concurrencia mediante hilos y rasgos genéricos antes de refinarlos manualmente.
- Educación y aprendizaje de Rust: el modelo puede generar ejemplos de código Rust para ejercicios prácticos, aunque con la advertencia de que sus explicaciones sobre el código generado a menudo son incorrectas.
- Evaluación comparativa de modelos de código: sirve como referencia especializada en Rust dentro de bancos de pruebas como HumanEval-RS y MBPP-RS, con scripts abiertos en maylore-ai/rust-evals.
- Despliegue en entornos con recursos limitados: al ser un modelo de 4,2B, es adecuado para inferencia local en hardware de consumo donde modelos mayores no caben.

## Benchmarks y rendimiento

Resultados publicados en la model card (pass@1 / pass@10 en %, y Temper Bench v2 greedy pass@1):

| Modelo | HumanEval-RS | MBPP-RS | Temper Bench v2 |
|---|---|---|---|
| Qwen3.6-35B-A3B | 89,2 / 95,3 | 78,1 / 83,3 | 63,3 |
| Gemma 4 26B-A4B | 86,8 / 90,6 | 75,0 / 78,3 | 74,7 |
| Qwen3.5-9B | 76,0 / 90,2 | 65,6 / 79,2 | 29,3 |
| Temper-2-Nodel | 73,2 / 82,6 | 64,8 / 71,1 | 37,3 |
| Qwen2.5-Coder-7B-Instruct | 72,4 / 82,6 | 60,5 / 70,0 | 26,0 |
| Tessa-Rust-T1-7B | 71,5 / 79,0 | 57,8 / 68,9 | 29,3 |
| Qwen3.5-4B | 66,2 / 81,4 | 57,7 / 73,4 | 20,7 |
| Temper-2-Axon | 64,2 / 73,8 | 54,7 / 61,7 | 21,3 |
| Temper-2-Ion | 48,1 / 57,6 | 45,5 / 53,8 | 12,7 |
| Qwen2.5-Coder-1.5B-Instruct | 39,0 / 56,1 | 38,3 / 52,1 | 7,3 |

Metodología: HumanEval-RS (156 tareas) y MBPP-RS (354 tareas) de MultiPL-E en la revisión 28441b6, con respuestas de hasta 1000 tokens, temperature 0.2, top_p 0.95 y 50 respuestas por tarea; pass@k según el estimador del paper Codex. Temper Bench v2 es un conjunto propio de 150 tareas Rust en tres niveles de dificultad, con greedy pass@1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,2B parámetros, en FP16 se requieren aproximadamente 8,4 GB de pesos, y en cuantizaciones de 4 bits alrededor de 2,5-3 GB (estimación basada en el tamaño del modelo, no en datos publicados).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: el tamaño de 4,2B y la existencia de una versión GGUF indican que cabe en GPU de consumo, aunque no se especifican modelos concretos.
- Opciones de despliegue: transformers (safetensors), llama.cpp, LM Studio y Ollama mediante la versión GGUF de maylore-ai/Temper-2-Nodel-GGUF; vLLM se menciona en la metodología de evaluación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval-RS pass@1 | MBPP-RS pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Temper-2-Nodel | 4,2B | no disponible | 73,2 | 64,8 | Apache 2.0 | safetensors + GGUF |
| Qwen3.5-4B (base) | 4,2B | no disponible | 66,2 | 57,7 | Apache 2.0 | safetensors |
| Temper-2-Axon | no disponible | no disponible | 64,2 | 54,7 | Apache 2.0 (según línea Temper) | safetensors + GGUF |
| Qwen2.5-Coder-7B-Instruct | 7B | no disponible | 72,4 | 60,5 | no disponible | no disponible |
| Tessa-Rust-T1-7B | 7B | no disponible | 71,5 | 57,8 | no disponible | no disponible |

Temper-2-Nodel supera en HumanEval-RS pass@1 a Qwen3.5-4B (+7,0 puntos), a Qwen2.5-Coder-7B-Instruct (+0,8) y a Tessa-Rust-T1-7B (+1,7), con un tamaño menor que los dos últimos. En MBPP-RS pass@1 también supera a Qwen3.5-4B (+7,1) y a Qwen2.5-Coder-7B-Instruct (+4,3). Sin embargo, en pass@10 de MBPP-RS queda por debajo de Qwen3.5-4B (71,1 frente a 73,4).

## Limitaciones y advertencias

- Qwen3.5-9B resuelve 2,8 puntos más tareas HumanEval-RS al primer intento que Temper-2-Nodel.
- Las respuestas del modelo son menos variadas tras el fine-tune; con diez intentos queda por debajo del Qwen3.5-4B original en MBPP-RS (71,1 frente a 73,4).
- Cuando se le pregunta cómo funciona el código que acaba de escribir, a menudo no da una explicación correcta; el autor planea corregirlo en futuras generaciones.
- No funciona como modelo de autocompletado inline en editores, al haberse entrenado con peticiones de chat sin fill-in-the-middle.
- Riesgo de alucinación en explicaciones de código y en tareas fuera del dominio de Rust.
- Cobertura lingüística limitada a inglés y ruso.
- Licencia Apache 2.0: las obras derivadas, incluidos fine-tunes, fusiones y cuantizaciones, deben mantener las atribuciones del fichero NOTICE (sección 4(d) de Apache 2.0).
- No se documentan sesgos conocidos en la información disponible.
- La longitud de contexto no se especifica, lo que impide evaluar su idoneidad para conversaciones o código de gran extensión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maylore-ai/Temper-2-Nodel
- Versión GGUF: https://huggingface.co/maylore-ai/Temper-2-Nodel-GGUF
- Modelo Temper-2-Ion: https://huggingface.co/maylore-ai/Temper-2-Ion
- Modelo Temper-2-Axon: https://huggingface.co/maylore-ai/Temper-2-Axon
- Página del modelo en Maylore: https://maylore.com/temper-2-nodel
- Temper Bench v2: https://maylore.com/temper-bench
- Repositorio de evaluación: https://github.com/maylore-ai/rust-evals
- MultiPL-E: https://github.com/nuprl/MultiPL-E
- Paper Codex (estimador pass@k): https://arxiv.org/abs/2107.03374
- Organización Maylore en Hugging Face: https://huggingface.co/maylore-ai
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B

# Nayrosk/rust-errors-qwen3-4b

## Resumen

rust-errors-qwen3-4b es un adaptador QLoRA publicado por el usuario Nayrosk sobre el modelo base Qwen/Qwen3-4B, especializado en diagnosticar y corregir errores del compilador de Rust. El modelo se ha entrenado mediante destilación de conocimiento a partir de 1746 preguntas respondidas por deepseek/deepseek-v4-pro:thinking, generadas de forma sintética con la herramienta overbrainer. Cubre categorías concretas del compilador como borrow checker, movimientos de valores, lifetimes, traits, tipos, mutabilidad, genéricos, asincronía y módulos.

El objetivo del autor es ofrecer una primera línea de asistencia barata y rápida para errores de Rust: según la model card, el modelo empata o gana frente al modelo padre en el 20,2% de 194 preguntas reservadas, con una latencia p50 de 5,6 segundos en una RTX A5000 y aproximadamente un 6% del coste por petición del padre. No pretende sustituir al modelo grande en preguntas difíciles, sino servir como filtro económico.

El resultado es un adaptador de parámetros eficientes (LoRA, r=16) que no fusiona los pesos con el modelo base, de ahí que el repositorio pese 2,6 GB y distribuya también versiones GGUF cuantizadas para su uso local. Los pesos declaran un total de 4.022.468.096 parámetros, correspondientes a la arquitectura subyacente de Qwen3-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador LoRA sobre Qwen/Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (secuencia de entrenamiento de 4096 tokens) |
| Tipos de cuantizacion | 4-bit (bitsandbytes); GGUF Q4_K_M disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador QLoRA (cuantización de 4 bits con bitsandbytes) sobre el transformer denso Qwen/Qwen3-4B. El entrenamiento se realizó con Axolotl, con rango LoRA r=16, alpha=32, dropout 0.05, learning rate 0.0002, optimizador adamw_torch_fused, scheduler coseno, longitud de secuencia 4096, sample packing activado y 3 épocas. La pérdida final fue de 1.04 en entrenamiento y 1.10 en evaluación, con 1746 ejemplos de entrenamiento y 194 de evaluación. El entrenamiento completo tardó 1 hora y 18 minutos en una NVIDIA A40 alquilada en Runpod, con un coste aproximado de 0,81 dólares. El flag `merge = false` indica que los pesos LoRA no se fusionaron con el modelo base.

La particularidad metodológica es que el razonamiento del modelo padre se excluyó deliberadamente del entrenamiento (se fijó `chat_template = "chatml"`). Según la model card, una ejecución que sí entrenaba el razonamiento provocó que un modelo hijo de 1,7B pensara hasta agotar su límite de tokens. Las preguntas se generaron con deepseek/deepseek-v4-flash como generador, las respuestas provinieron de deepseek/deepseek-v4-pro:thinking como padre, y la deduplicación se aplicó con un umbral de 0,8.

## Capacidades

- Respuesta a errores del compilador de Rust por categoría: borrow checker (E0499, E0502, E0505, E0506), movimientos (E0382, E0507, E0508), lifetimes (E0106, E0597, E0716, E0621), traits (E0277, E0599, E0038), tipos (E0308, E0282, E0283), mutabilidad (E0596, E0594, E0384) e interior mutability, genéricos (E0107, E0191, E0220, E0207), asincronía (futures no Send, guards retenidos a través de await, ausencia de runtime) y módulos (E0603, E0432, E0433, E0425).
- Explicación de la causa de cada error y propuesta de corrección del código.
- Generación de texto conversacional (pipeline text-generation).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el entrenamiento excluyó explícitamente las trazas de razonamiento.
- Capacidades multilingües: no disponibles (los idiomas no se declaran).
- Capacidad especial de modo "thinking": no disponible; el autor evitó entrenar razonamiento.

## Casos de uso

- Asistente de compilación en IDE: el modelo puede recibir el mensaje de error de `rustc` y el fragmento de código y devolver la causa y una corrección, integrándose como acción rápida en editores o extensiones.
- Revisión de pull requests en Rust: dado que cubre errores de préstamo, lifetimes y traits, puede predecir problemas comunes antes de que se ejecute el CI y añadir comentarios automáticos.
- Primera línea de soporte en canales de ayuda sobre Rust: filtra y responde las dudas más frecuentes (E0382, E0597, etc.) antes de escalar a un modelo mayor, reduciendo coste por petición.
- Generación de explicaciones didácticas para materiales de formación: el modelo puede redactar la explicación del error y una versión corregida del código para tutoriales o documentación.
- Automatización de correcciones en pipelines de migración de código heredado: puede procesar lotes de errores del compilador y sugerir parches concretos.
- Herramienta CLI local de diagnóstico: mediante la distribución GGUF Q4_K_M se puede ejecutar en un equipo de desarrollo sin conexión y con latencia baja para consultar errores puntuales.
- Enrutado de consultas en un sistema multi-modelo: al ser barato y rápido, puede clasificar o resolver los casos sencillos y derivar los difíciles al modelo padre.

## Benchmarks y rendimiento

La única evaluación publicada en la información disponible es una comparación por pares frente al modelo padre sobre 194 preguntas reservadas, juzgada con un modelo local qwen3.5:9b:

| Metrica | Valor |
|---|---|
| Gana o empata frente al padre | 20,2 % de 194 preguntas |
| Latencia p50 (RTX A5000) | 5,6 s |
| Coste por petición respecto al padre | ~6 % |
| Pérdida de entrenamiento (final) | 1,04 |
| Pérdida de evaluación (final) | 1,10 |

No se han publicado resultados en benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador requiere cargar además el modelo base Qwen/Qwen3-4B; el repositorio del adaptador ocupa 2,6 GB, pero el consumo conjunto dependerá del modelo base y de su cuantización.
- Versión GGUF Q4_K_M: apta para GPUs de consumo con al menos 4-6 GB de VRAM libres, así como para inferencia en CPU mediante llama.cpp u Ollama.
- Pesos completos sin cuantizar (si se fusionaran): aproximadamente 8-9 GB en FP16, por lo que cabría en GPUs de consumo de gama alta (RTX 3090, 4090) y en GPUs profesionales (A40, A5000, A100, H100).
- Despliegue: la model card documenta el uso con Ollama (`ollama run hf.co/nayrosk/rust-errors-qwen3-4b:Q4_K_M`) y con llama.cpp (`llama-cli -hf nayrosk/rust-errors-qwen3-4b:Q4_K_M`). Al tratarse de un adaptador PEFT, también se puede servir con frameworks compatibles con LoRA, como vLLM o TGI, aunque no se documentan en la información disponible.
- Latencia: p50 de 5,6 segundos medidos en una RTX A5000 con la versión desplegada en el estudio del autor. No se publican datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rust-errors-qwen3-4b | ~4,02 B (adaptador sobre Qwen3-4B) | no disponible (entrenado a 4096) | Gana o empata en 20,2 % frente al padre | apache-2.0 | HuggingFace (PEFT y GGUF) |
| Qwen/Qwen3-4B (base) | ~4,02 B | no disponible | No especializado en errores de Rust | apache-2.0 | HuggingFace |
| deepseek/deepseek-v4-pro:thinking (padre) | no disponible | no disponible | Referencia de calidad, ~16,7x más caro por petición | no disponible | no disponible |

No se dispone de datos comparativos con otros modelos especializados en asistencia a errores del compilador de Rust en la información proporcionada.

## Limitaciones y advertencias

- El propio autor lo describe como una primera línea barata, no como sustituto del modelo padre en preguntas difíciles.
- Solo gana o empata en el 20,2 % de las preguntas de evaluación frente al padre, por lo que en una mayoría de casos el modelo grande sigue siendo preferible.
- El modelo está especializado exclusivamente en errores del compilador de Rust; fuera de ese dominio la calidad no está garantizada y no se evalúa.
- El entrenamiento excluyó las trazas de razonamiento, por lo que no se debe esperar un modo de pensamiento explícito ni razonamiento multi-paso complejo.
- Riesgo de alucinación en códigos de error, números de error o soluciones plausibles pero incorrectas, especialmente en errores poco representados en el conjunto de datos.
- No se declaran los idiomas soportados; no hay garantía de un rendimiento multilingüe específico más allá del inglés previsiblemente dominante en el dataset.
- Los pesos son un adaptador PEFT sin fusionar (`merge = false`), por lo que requieren cargar el modelo base Qwen/Qwen3-4B y una librería compatible con LoRA.
- Licencia apache-2.0, que en principio permite uso comercial, pero hereda las condiciones del modelo base Qwen3-4B; conviene revisar los términos de dicho modelo base.
- El modelo lo ha publicado un autor individual, con 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nayrosk/rust-errors-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio overbrainer: https://github.com/nayrosk/overbrainer
- Documentación de overbrainer: https://github.com/nayrosk/overbrainer#readme
- Caso de estudio completo (examples/rust-errors): https://github.com/nayrosk/overbrainer/tree/main/examples/rust-errors
- Banner del proyecto: https://raw.githubusercontent.com/nayrosk/overbrainer/main/docs/assets/hf-banner.webp
- Runpod (plataforma de entrenamiento): https://runpod.io

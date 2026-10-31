# aimanhaziq/gemma4-2b-coder-bnb-4bit

## Resumen

Gemma 4 2B Coder (4-bit NF4) es una versión cuantizada en 4 bits (NormalFloat4 mediante BitsAndBytes) del modelo `aimanhaziq/gemma4-2b-coder`, publicado por el usuario aimanhaziq en Hugging Face. Se trata de un modelo de generación de texto especializado en tareas de programación, con foco concreto en tres dominios: manifiestos de Kubernetes y ecosistema cloud native, desarrollo backend en Rust (Tokio/Axum) y desarrollo web full-stack con TypeScript/JavaScript y diseño de APIs REST.

Su propuesta de valor es clara: permitir la generación de código de baja latencia en GPUs con recursos muy limitados, con un objetivo declarado de menos de 4 GB de VRAM. Esto lo hace adecuado para estaciones de trabajo domésticas, portátiles con GPU modesta o despliegues edge donde un modelo coder de mayor tamaño no cabe. El modelo emplea una plantilla de instrucción tipo Alpaca ("### Instruction / ### Input / ### Response"), lo que facilita su integración en pipelines existentes que ya usen ese formato.

Cabe señalar que la ficha técnica publicada por el autor es escasa: no se detallan datos de entrenamiento, benchmarks ni arquitectura precisa más allá de la herencia del modelo base. El repositorio pesa 6,8 GB y los pesos en safetensors suman aproximadamente 5.104 millones de parámetros, un dato que conviene tener en cuenta frente a la denominación "2b" del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Gemma, según modelo base); detalles no disponibles |
| Parametros totales | 5.104.297.539 (según safetensors) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit NF4 (NormalFloat4, BitsAndBytes) |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma (license:gemma) |
| Formato de pesos | safetensors (cuantizado con bitsandbytes) |

## Arquitectura y entrenamiento

El modelo deriva de `aimanhaziq/gemma4-2b-coder`, que a su vez se presenta como un modelo de la familia Gemma adaptado a tareas de programación. La versión aquí descrita aplica cuantización 4-bit NF4 mediante la librería BitsAndBytes, una técnica de cuantización post-entrenamiento que sustituye los pesos en FP16/BF16 por representaciones NormalFloat de 4 bits, reduciendo drásticamente la huella de memoria con una degradación de calidad típicamente moderada en tareas de generación de código.

No se ha publicado información sobre el proceso de entrenamiento del modelo base: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se especifica la longitud de contexto ni las innovaciones técnicas concretas de la arquitectura. Por el formato de prompt de la model card (plantilla de instrucción tipo Alpaca), todo indica que el modelo base fue afinado con instrucciones para tareas de código, pero esto no está confirmado explícitamente por el autor.

## Capacidades

- Generación de código en tres dominios declarados por el autor: Kubernetes/cloud native, Rust y desarrollo web full-stack.
- Creación de manifiestos de Kubernetes listos para producción: Deployments, StatefulSets, Ingress, CRDs y valores de Helm.
- Desarrollo de Rust idiomático: Rust asíncrono con Tokio y Axum, patrones de seguridad de memoria y concurrencia.
- Desarrollo web y de APIs: TypeScript/JavaScript full-stack y diseño de APIs REST.
- Generación de texto conversacional (pipeline text-generation, tag "conversational").
- Formato de entrada mediante plantilla de instrucción (### Instruction / ### Input / ### Response), con parámetros de generación recomendados por el autor: temperature 0,2, repetition_penalty 1,1 y max_new_tokens 512.
- No se declara soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Generación de manifiestos de Kubernetes: puede producir YAML para Deployments, StatefulSets con plantillas de PVC dinámico, Ingress y CRDs a partir de descripciones en lenguaje natural, útil para equipos DevOps que quieran acelerar la redacción de configuraciones repetitivas.
- Redacción de valores de Helm: a partir de una descripción del despliegue, genera ficheros values.yaml coherentes, integrable en flujos de trabajo de empaquetado de aplicaciones cloud native.
- Desarrollo backend en Rust: genera código asíncrono idiomático con Tokio y Axum, incluyendo patrones de manejo de concurrencia y seguridad de memoria; útil como asistente de autocompletado o generación de scaffolding en proyectos Rust.
- Diseño de APIs REST: ayuda a definir endpoints, estructuras de datos y lógica de negocio en TypeScript/JavaScript, adecuado para prototipado rápido de backends web.
- Asistente de código en hardware modesto: gracias a la cuantización 4-bit y el objetivo de menos de 4 GB de VRAM, puede ejecutarse en GPUs de consumo o portátiles, sirviendo de asistente local sin depender de APIs externas.
- Prototipado y aprendizaje: útil para desarrolladores que aprenden Kubernetes o Rust, ya que genera ejemplos completos y comentables a partir de instrucciones en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el autor declara como objetivo GPUs con menos de 4 GB de VRAM para esta versión cuantizada en 4 bits. El repositorio completo pesa 6,8 GB, por lo que con margen para KV cache y activaciones se recomienda al menos 6-8 GB de VRAM en la práctica; el objetivo declarado de <4 GB debería verificarse caso por caso.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA y bitsandbytes; en la gama de consumo, una RTX 3060 de 12 GB o una RTX 4060 Ti darían holgura suficiente. El autor no especifica modelos concretos de GPU.
- Cabe en GPU de consumo: sí, es el objetivo declarado del modelo; incluso GPUs de gama media-baja con 4-6 GB de VRAM deberían poder ejecutarlo con ajustes de longitud de contexto.
- Opciones de despliegue: la model card documenta uso directo con la librería Transformers de Hugging Face cargando el modelo con `device_map="auto"`. Al estar cuantizado con BitsAndBytes, requiere dicha librería (y por tanto hardware CUDA); no se menciona compatibilidad explícita con llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: el autor describe el modelo como "optimizado para baja latencia", pero no publica cifras concretas de latencia ni de throughput.

## Comparativa con modelos similares

Dado que el modelo se posiciona como un coder ligero cuantizado en 4 bits para hardware modesto, una comparación orientativa con alternativas de categoría similar sería la siguiente. Los valores del modelo de esta ficha provienen de la model card; los de las alternativas son valores públicos conocidos y pueden variar según la versión concreta.

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| gemma4-2b-coder-bnb-4bit (esta ficha) | ~5.100 M (safetensors) | 4-bit NF4 (bitsandbytes) | no disponible | Gemma | Codigo: Kubernetes, Rust, web |
| Qwen2.5-Coder-3B-Instruct | ~3.000 M | FP16/BF16 (hay GGUF de la comunidad) | 32.768 tokens | Qwen Research | Codigo general, multilingue |
| StarCoder2-3B | ~3.000 M | FP16/BF16 (hay GGUF de la comunidad) | 16.384 tokens | BigCode OpenRAIL-M | Codigo general, fill-in-the-middle |
| CodeGemma-2B (Google) | ~2.500 M | FP16/BF16 (hay GGUF de la comunidad) | 8.192 tokens | Gemma | Codigo general, FIM |

Nota: la comparación es aproximada; el modelo de esta ficha destaca por su especialización declarada en Kubernetes y Rust, mientras que las alternativas son modelos coder generalistas con ecosistemas de despliegue más maduros (GGUF, vLLM, Ollama) y contextos documentados.

## Limitaciones y advertencias

- Licencia Gemma: el uso está sujeto a los términos de la licencia Gemma de Google, que incluye restricciones y condiciones de uso aceptable; conviene revisarlas antes de cualquier despliegue comercial.
- Datos técnicos incompletos: no se publican longitud de contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar objetivamente su calidad frente a alternativas.
- Discrepancia de tamaño: aunque se denomina "2b", los safetensors suman ~5.104 millones de parámetros; conviene tenerlo en cuenta para estimaciones de memoria y rendimiento.
- Idioma: el modelo está orientado al inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar código plausible pero incorrecto o inseguro; en particular, los manifiestos de Kubernetes generados deben revisarse siempre antes de aplicarse en clústeres reales, dado que errores de configuración pueden tener impacto en producción.
- Cuantización: la versión 4-bit NF4 implica cierta pérdida de precisión respecto al modelo base en FP16; no se publica una evaluación de esa degradación.
- Dependencia de bitsandbytes: requiere hardware CUDA y la librería bitsandbytes; no hay pesos GGUF oficiales para inferencia en CPU o Apple Silicon.
- Adopción mínima: con 30 descargas y 1 like en el momento de la ficha, es un modelo de nicho sin validación comunitaria amplia; no hay auditorías de sesgos ni evaluaciones de seguridad publicadas.
- Sesgos conocidos: no disponible.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/aimanhaziq/gemma4-2b-coder-bnb-4bit
- Modelo base: https://huggingface.co/aimanhaziq/gemma4-2b-coder
- Librería BitsAndBytes: https://github.com/TimDettmers/bitsandbytes
- Transformers (Hugging Face): https://github.com/huggingface/transformers

No se han encontrado enlaces adicionales (papers, blogs, demos) en la informacion disponible.

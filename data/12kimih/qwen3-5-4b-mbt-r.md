# 12kimih/Qwen3.5-4B-MBT-R

## Resumen

Qwen3.5-4B-MBT-R es un ajuste fino (fine-tune) supervisado de Qwen/Qwen3.5-4B-Base, publicado por el usuario 12kimih en Hugging Face. El modelo se ha entrenado sobre trazas de razonamiento editadas mediante MBT-R, un editor agéntico que reescribe la traza completa en una única llamada, dentro del trabajo de investigación "Distilling Metacognitive Behaviors through Agentic Editing" (arXiv:2602.22508). Su objetivo es destilar comportamientos metacognitivos del profesor hacia un modelo pequeño, mejorando el razonamiento y la resolución de problemas matemáticos.

El modelo conserva la arquitectura y el tamaño del base (unos 4.539 millones de parámetros según los safetensors publicados) y está orientado a tareas de razonamiento paso a paso, matemáticas y generación de texto conversacional. Emite su razonamiento dentro de un bloque `<think>` antes de la respuesta final, un patrón habitual en los modelos de razonamiento actuales.

Su relevancia radica en que forma parte de una familia de cuatro variantes (Unedited-SFT, MBT-R, MBT-I y MBT-A) que permiten comparar experimentalmente cómo distintas estrategias de edición de trazas afectan a la destilación de conductas metacognitivas en modelos de tamaño reducido, con licencia Apache-2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), decodificador autorregresivo; detalles concretos no disponibles |
| Parametros totales | 4.539.265.536 (dato real de los safetensors) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | 131.072 tokens de longitud maxima en entrenamiento; contexto nativo del base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | Ingles (según la model card) |
| Licencia | Apache-2.0 (datos de entrenamiento bajo CC BY-SA 4.0) |
| Formato de pesos | safetensors (bf16), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base, un transformer autorregresivo de la familia Qwen3.5, y se somete a un ajuste fino supervisado de parametros completos (full-parameter SFT), calculando la loss unicamente sobre los tokens del asistente. La novedad principal no esta en la arquitectura sino en los datos: las trazas de razonamiento del dataset `12kimih/mbt-traces` fueron reescritas integramente por un editor agéntico (MBT-R) en una sola llamada, con el fin de inyectar comportamientos metacognitivos en el modelo estudiante.

El entrenamiento empleo 15 epocas con el optimizador Muon (implementacion de Megatron), learning rate 1e-5, weight decay 0 y schedule constante con 40 pasos de warmup. El batch global fue de 64 secuencias (8 GPU con 8 pasos de acumulacion), usando padding-free packing y una longitud maxima de 131.072 tokens. La precision fue bf16 en autocast con pesos maestros en fp32, y los pesos publicados estan en bf16. No se menciona RLHF ni DPO: el entrenamiento es puramente supervisado.

## Capacidades

- Generacion de texto conversacional en ingles mediante el pipeline text-generation de transformers.
- Razonamiento paso a paso: la plantilla de chat abre un bloque `<think>` donde el modelo desarrolla su cadena de razonamiento antes de cerrarla con `</think>` y emitir la respuesta.
- Resolucion de problemas matematicos, con la convencion de entrenamiento de colocar la respuesta final dentro de `\boxed{}`.
- Comportamientos metacognitivos destilados mediante edicion agéntica de trazas (monitorizacion y revision del propio razonamiento).
- Manejo de respuestas muy largas: el propio autor advierte de que las respuestas largas son habituales y recomienda reservar decenas de miles de tokens de salida.
- No hay evidencia en la model card de capacidades de vision, audio, tool calling ni agentes en inferencia, pese a que el tag de Hugging Face lo clasifica como image-text-to-text.

## Casos de uso

- Resolucion de problemas matematicos con respuesta verificable: el modelo razona paso a paso y entrega el resultado en `\boxed{}`, lo que facilita la correccion automatica en sistemas de evaluacion educativa o generacion sintetica de soluciones.
- Investigacion en destilacion de razonamiento: al formar parte de una familia controlada de cuatro variantes (sin editar, MBT-R, MBT-I, MBT-A), es ideal como baseline o sujeto de estudio en experimentos sobre metacognicion en modelos pequenos.
- Generacion de trazas sinteticas de razonamiento: puede usarse como profesor economico (4B parametros) para producir cadenas de razonamiento que alimenten entrenamientos posteriores de modelos mas pequenos.
- Chatbots de dominio tecnico en ingles: su formato conversacional con bloque de pensamiento permite construir asistentes que muestren (u oculten) el razonamiento al usuario final.
- Evaluacion de estrategias de muestreo en razonamiento: la model card recomienda temperature 1.0 y top_p 0.95, configuracion tipica para self-consistency y muestreo multiple (best-of-n) en tareas de razonamiento.
- Prototipado local de modelos razonadores: con unos 9,1 GB en bf16, cabe en GPU de consumo, lo que lo hace util para experimentacion individual sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper "Distilling Metacognitive Behaviors through Agentic Editing" (arXiv:2602.22508) para las comparaciones experimentales, pero no incluye tablas de resultados (MMLU, GSM8K, AIME, etc.) en la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo de pesos; con KV cache y sobrecoste, entre 10 y 12 GB en contextos moderados. Para contextos muy largos (hasta 131.072 tokens de entrenamiento y respuestas de decenas de miles de tokens), la KV cache puede exigir 20 GB o mas.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 cubre inferencia en bf16 con contextos largos razonables; en datacenter, A100 o H100 permiten batch y contexto maximo sin friccion.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB en bf16; con cuantizacion (por ejemplo GGUF Q4/Q8 via llama.cpp, no publicada oficialmente por el autor) podria ejecutarse en tarjetas de 8-12 GB.
- Opciones de despliegue: vLLM (el ejemplo oficial de la model card usa `vllm.LLM`), y por compatibilidad con arquitectura Qwen3.5, transformers y presumiblemente llama.cpp/Ollama si la comunidad publica conversiones GGUF; no hay confirmacion explicita en la ficha.
- Latencia y throughput: no disponible. Dado el tamano (4B) y el uso de vLLM, se esperan tasas de generacion altas en GPU de consumo, pero las respuestas largas propias del estilo de razonamiento aumentan la latencia de fin a fin.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.5-4B-MBT-R | 4,54 B (dato safetensors) | 131.072 tokens en entrenamiento | Apache-2.0 | SFT con trazas metacognitivas editadas (MBT-R) |
| Qwen3.5-4B-Unedited-SFT (mismo autor) | no disponible | no disponible | Apache-2.0 | SFT con trazas del profesor sin editar (baseline) |
| Qwen3.5-4B-MBT-I (mismo autor) | no disponible | no disponible | Apache-2.0 | SFT con edicion por insercion de trazas |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | Apache-2.0 | Modelo base sin afinar |

La comparativa mas relevante es interna a la familia del propio paper, disenada para aislar el efecto del metodo de edicion de trazas. Frente a otros modelos razonadores de 4B del ecosistema, no hay datos publicados en la ficha que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Idioma: la model card declara unicamente ingles; no hay soporte documentado para castellano ni otros idiomas.
- Riesgo de alucinacion: al ser un modelo de 4B afinado con SFT puro (sin RLHF ni DPO documentados), puede producir razonamientos plausibles pero incorrectos, especialmente fuera de dominios matematicos y de razonamiento.
- Respuestas muy largas: el autor advierte explicitamente de que el modelo genera respuestas largas con frecuencia; hay que reservar decenas de miles de tokens de salida (el ejemplo usa max_tokens 122.880), lo que incrementa coste y latencia.
- Sesgos: no disponible; no se documentan auditorias de sesgo en la ficha.
- Licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento estan bajo CC BY-SA 4.0, lo que implica obligaciones de atribucion si se reutilizan las trazas o derivados de los datos.
- Discrepancia de tags: Hugging Face lo clasifica como image-text-to-text, pero la model card solo documenta generacion de texto; no asumir capacidades de vision sin verificar.
- Cuantizacion: no se publican versiones cuantizadas oficiales; cualquier GGUF o AWQ dependeria de conversiones de terceros.
- Para produccion: al ser un modelo de investigacion con 456 descargas, carece de recorrido comunitario; conviene validar robustez en el dominio concreto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/12kimih/Qwen3.5-4B-MBT-R
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Dataset de trazas: https://huggingface.co/datasets/12kimih/mbt-traces
- Variante baseline (sin editar): https://huggingface.co/12kimih/Qwen3.5-4B-Unedited-SFT
- Variante MBT-I: https://huggingface.co/12kimih/Qwen3.5-4B-MBT-I
- Variante MBT-A: https://huggingface.co/12kimih/Qwen3.5-4B-MBT-A
- Paper (arXiv): https://arxiv.org/abs/2602.22508
- Codigo y prompts (GitHub): https://github.com/12kimih/metacognitive-behavioral-tuning

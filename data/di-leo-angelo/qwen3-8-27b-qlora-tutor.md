# di-leo-angelo/qwen3.8-27b-qlora-tutor

## Resumen

El modelo `di-leo-angelo/qwen3.8-27b-qlora-tutor` es un adaptador LoRA (no un modelo completo) entrenado sobre el modelo base `Qwen/Qwen3.8-27B`. Lo desarrolla el usuario de HuggingFace di-leo-angelo como parte de un portafolio de proyectos de machine learning, y su proposito es estrictamente de transferencia de estilo: reescribe las respuestas del modelo base en una voz consistente de tutor escolar, estructurada en pasos ("Step 1 ... Step 4 ... Check: ...") y limitada a unas 350 palabras. No anade conocimiento nuevo; el contenido de las respuestas queda acotado por el modelo base congelado.

El adaptador tiene 124.730.880 parametros entrenables (0,454 % del modelo base de 27,48B), con rango r=16, alpha=32 y dropout 0,05, aplicado a todas las capas lineales excepto la torre de vision, la cabeza MTP y la LM head. El repositorio ocupa 0,5 GB y solo contiene el adaptador y los ficheros del tokenizer, no los pesos del modelo base. La licencia es Apache-2.0, heredada del modelo base.

Es relevante ahora como ejemplo de QLoRA de bajo coste (14,11 USD en RunPod) y de evaluacion honesta: el autor publica metricas estrictas (exact match del 45 %) junto a metricas mas laxas (LLM judge 4,8/4,0/4,2), y advierte explicitamente de que el juicio con LLM satura con razonamientos STEM plausibles. Es un caso util para quienes quieran replicar un pipeline de fine-tuning de estilo con presupuesto minimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; QLoRA con base NF4 |
| Parametros totales | 124.730.880 parametros entrenables (adaptador); modelo base 27,48B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.8-27B; el entrenamiento uso seq len 1024) |
| Tipos de cuantizacion | NF4 con doble cuantizacion (bitsandbytes) para el base; LoRA en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el base Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA: el modelo base Qwen3.8-27B se congela cuantizado en NF4 con doble cuantizacion (bitsandbytes) y se anaden matrices LoRA en bf16 sobre todas las capas lineales, excluyendo la torre de vision, la cabeza MTP y la LM head. La configuracion es r=16, alpha=32 y dropout 0,05. El entrenamiento se ejecuto durante 72 minutos y 10 segundos en una unica RTX 4090 de 48 GB (RunPod), con un pico de unos 30 GB, 2 epochs, batch efectivo de 8, LR coseno de 2e-4, autocast bf16, gradient checkpointing y longitud de secuencia de 1024. La mejor perdida de validacion fue 0,3671 en la epoch 1, que se conservo.

Los datos son 1.120 muestras sinteticas de preguntas y respuestas escolares de 10 asignaturas, con particion 75/10/15 y una receta de generacion con semilla publicada en el repositorio GitHub del autor. La innovacion tecnica no esta en la arquitectura sino en el enfoque de evaluacion: el autor compara 25 pares base-vs-LoRA en el conjunto de test y demuestra que las respuestas son identicas en contenido pero cambian de voz, lo que aisla el efecto de transferencia de estilo del posible efecto de inyeccion de conocimiento.

## Capacidades

- Transferencia de estilo a voz de tutor escolar: estructura las respuestas en pasos numerados y cierra con una seccion de autocomprobacion ("Check: ...").
- Control de longitud: el 92 % de las 230 respuestas del conjunto de test respetan el presupuesto de unas 350 palabras.
- Generacion de texto conversacional y de razonamiento STEM, heredada del modelo base Qwen3.8-27B.
- Soporte de tool calling y function calling: no documentado en la model card; depende del modelo base, no del adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para el adaptador.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales: no se documentan modos de thinking, vision ni audio en el adaptador, aunque el modelo base podria tenerlas.

## Casos de uso

- Generacion de material didactico estructurado: el adaptador reescribe explicaciones del modelo base en formato de pasos con autocomprobacion final, util para producir apuntes o guiones de clase con una estructura uniforme y un limite de extension controlado.
- Prototipado de asistentes educativos: sirve para validar rapidamente la experiencia de usuario de un tutor conversacional antes de invertir en un fine-tuning completo o en datos propios, dado su coste de entrenamiento de 14,11 USD.
- Transferencia de estilo en pipelines editoriales: se puede aplicar sobre el base para homogeneizar el tono de respuestas generadas en un corpus de preguntas y respuestas, manteniendo el contenido original.
- Investigacion sobre evaluacion de adaptadores: el par de conjuntos de metricas (exact match estricto y LLM judge laxo) y los 25 pares base-vs-LoRA sirven como referencia metodologica para disenar evaluaciones de adaptadores de estilo.
- Despliegue en hardware de consumo: al ejecutarse en una RTX 4090 de 24 GB con un pico de 19,3 GB en generacion de 512 tokens, es viable para demos locales y entornos de desarrollo sin infraestructura dedicada.
- Base para fine-tuning posterior: al ser un adaptador PEFT aislado y con licencia Apache-2.0, se puede combinar o sustituir por otros adaptadores sobre el mismo base en flujos de experimentacion rapida.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Conjunto de test | 230 muestras retenidas, 10 asignaturas |
| Exact match (preguntas de formato de respuesta) | 45 % (52/115) |
| Cumplimiento del presupuesto de ~350 palabras | 92 % |
| LLM judge (Qwen3-32B-AWQ, n=245) | 4,8 / 4,0 / 4,2 (correccion / formato / completitud) |
| Pares base-vs-LoRA | 25 pares: mismas respuestas, voz entrenada |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 19,3 GB de pico con presupuesto de generacion de 512 tokens, cargando el base en NF4 y el adaptador en bf16.
- GPU recomendadas: RTX 4090 de 24 GB para inferencia; RTX 4090 de 48 GB (RunPod) para el entrenamiento, con pico de unos 30 GB.
- Cabe en GPU de consumo: si, en RTX 4090 de 24 GB; no se documenta su comportamiento en GPUs de 16 GB o menos.
- Opciones de despliegue: transformers + PEFT + bitsandbytes segun el ejemplo de la model card; el autor menciona la posibilidad de fusionar con `merge_and_unload()`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles. El entrenamiento completo tardo 72 min 10 s en una RTX 4090 de 48 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.8-27b-qlora-tutor (este) | 124,7M entrenables sobre base de 27,48B | No disponible | Adaptador LoRA de estilo | Apache-2.0 | HuggingFace, 17 descargas |
| Qwen/Qwen3.8-27B (base) | 27,48B | No disponible | Modelo completo | Apache-2.0 | HuggingFace |
| Adaptadores LoRA comunitarios sobre Qwen3 | Variable | Depende del base | Fine-tuning de tarea o estilo | Variable | HuggingFace |

No se dispone de datos de benchmarks comparativos con otros adaptadores de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo transferencia de estilo: no inyecta conocimiento; el contenido de las respuestas queda limitado por el modelo base.
- Cobertura tematica estrecha: un unico tema semilla por asignatura en los datos de entrenamiento, lo que reduce la diversidad de estilos y contenidos vistos.
- Datos sinteticos: la calidad del adaptador esta acotada por el modelo generador de las 1.120 muestras.
- LLM judge laxo: el autor advierte que el juez de 32B satura con razonamientos STEM plausibles; las senales estrictas son el exact match (45 %) y el cumplimiento del presupuesto de palabras (92 %).
- Idiomas no declarados: no se especifica que lenguas cubre el adaptador ni el base en esta ficha.
- Contexto de entrenamiento limitado a 1024 tokens: no se documenta el comportamiento con secuencias mas largas.
- Licencia Apache-2.0: permite uso comercial, pero el adaptador depende del modelo base Qwen/Qwen3.8-27B, cuyos terminos deben respetarse por separado.
- Sesgos: no documentados en la model card; al heredar el base, puede reproducir los sesgos de este.
- Riesgo de alucinacion: presente, como en cualquier modelo generativo; el adaptador no lo mitiga.

## Enlaces

- HuggingFace: https://huggingface.co/di-leo-angelo/qwen3.8-27b-qlora-tutor
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del proyecto: https://github.com/di-leo-angelo/ml-ai-portfolio (proyecto `projects/qwen-qlora`, informe en `reports/ANALYSIS.md`)

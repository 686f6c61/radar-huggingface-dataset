# leobo09263013/focal

## Resumen

Focal es un ajuste fino completo (full fine-tuning) del modelo multimodal Qwen/Qwen3-VL-8B-Instruct, desarrollado por el usuario leobo09263013. El modelo parte de la arquitectura Qwen3-VL de 8 mil millones de parametros, orientada a tareas de imagen-texto-a-texto, y se ha reentrenado con una variante de la funcion de perdida Focal (gamma=2.0) aplicada a nivel de token, en lugar de la entropia cruzada estandar. El entrenamiento se realizo con el framework LlamaFactory sobre el pipeline de datos AURA del autor.

El modelo resuelve el mismo tipo de tareas que su base (comprension conjunta de imagen y texto, generacion conversacional), pero introduce un esquema de ponderacion de tokens silenciosos y seleccion de respuestas propio del pipeline AURA. La perdida Focal modula la contribucion de cada token supervisado, lo que en teoria concentra el aprendizaje en ejemplos dificiles. No obstante, el autor indica explicitamente que no se ha realizado evaluacion externa, por lo que no hay evidencia publica de mejora frente al modelo base.

Es relevante ahora porque ejemplifica una tendencia practica: reentrenar modelos multimodales abiertos con funciones de perdida alternativas y pipelines de datos propios, manteniendo licencia Apache 2.0 y pesos en BF16 listos para transformers. El checkpoint conserva codigo personalizado (custom_code) y un token especial `<|silent|>`, lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (vision encoder + language model), variante qwen3_vl |
| Parametros totales | 8B (modelo base Qwen3-VL-8B); el dato safetensors reportado (770.288) no es coherente con el tamano del repo (17,5 GB) y se considera no fiable |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | limite de secuencia de entrenamiento de 11.000 tokens; contexto nativo del base no disponible en la informacion |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), con codigo de modelo y processor personalizado |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal basado en Qwen3-VL-8B-Instruct: un codificador visual con patch embedding, bloques transformer, mergers deepstack y proyector, acoplado a un modelo de lenguaje con su LM head. En este ajuste se congelaron el patch embedding visual, los bloques transformer visuales, los mergers deepstack y el proyector; solo permanece entrenable `model.visual.pos_embed.weight` (para igualar la linea base de entropia cruzada), ademas del modelo de lenguaje y la LM head.

El entrenamiento consistio en una epoca sobre 173.553 ejemplos en cache, con 2.712 pasos de optimizador, 32 GPUs, batch por dispositivo 1, acumulacion de gradiente 2 (batch global 64), tasa de aprendizaje 1e-5 con scheduler coseno y warmup del 10%, semilla 42. Se uso BF16, FlashAttention 2, DeepSpeed ZeRO-3 y un limite de secuencia de 11.000 tokens. La innovacion principal es la funcion de perdida Focal (gamma=2.0) aplicada a todos los tokens supervisados retenidos, manteniendo el denominador ponderado original del pipeline AURA, junto con la seleccion de respuestas AURA y la ponderacion de tokens silenciosos. La perdida Focal media de entrenamiento fue 0,493920 y la ultima perdida registrada 0,3440; el autor advierte que estos valores no son comparables con los de entropia cruzada como medida de calidad. El estado del optimizador distribuido no se incluye en la exportacion.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato chat (pipeline image-text-to-text).
- Comprension de imagen combinada con texto, heredada del modelo base Qwen3-VL-8B-Instruct.
- Razonamiento y respuesta a instrucciones propias de un modelo Instruct.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible (probable por herencia del base, pero no verificado).
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Token especial `<|silent|>` (ID 151669) para decisiones de silencio, integrado en el pipeline AURA.

## Casos de uso

- Descripcion y analisis de imagenes en asistentes conversacionales: el modelo acepta pares imagen-texto y genera respuestas en formato chat, adecuado para interfaces de asistencia visual con contexto de hasta 11.000 tokens.
- Investigacion sobre funciones de perdida: sirve como checkpoint de referencia para estudiar el efecto de Focal loss frente a entropia cruzada en ajuste fino multimodal, ya que conserva la implementacion CE original en el archivo de modelo personalizado.
- Experimentos de ablacion con LlamaFactory: el repositorio documenta hiperparametros completos (LR, scheduler, ZeRO-3, FlashAttention 2), lo que facilita reproducir o variar el entrenamiento.
- Punto de partida para ajustes posteriores: al ser un full fine-tuning en BF16 con licencia Apache 2.0, puede reentrenarse o destilarse, reenganchando la perdida Focal desde `training/aura_loss.py`.
- Evaluacion de mecanismos de silencio: el token `<|silent|>` permite investigar politicas de absteccion o respuesta selectiva en sistemas conversacionales.
- Prototipado de pipelines VLM en transformers: se carga con AutoModelForCausalLM y AutoProcessor (Transformers 4.57.1, PyTorch 2.6.0), util para integrar en entornos de investigacion ya basados en esa pila.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha realizado evaluacion externa. Los unicos datos numericos son de entrenamiento (perdida Focal media 0,493920; ultima perdida 0,3440), no comparables con metricas de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 16-18 GB para los pesos de un modelo de 8B, mas overhead de activaciones y del codificador visual; el entrenamiento uso 32 GPUs con ZeRO-3.
- GPU recomendadas para servicio: A100 40/80 GB o H100 para mayor throughput; tambien viable en GPUs de 24 GB si se cuantiza (aunque no se documentan cuantizaciones publicadas).
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, RTX 4090) en BF16 con margen ajustado, o en 16 GB recurriendo a cuantizacion no oficial.
- Opciones de despliegue: transformers con `trust_remote_code=True` (probado con Transformers 4.57.1 y PyTorch 2.6.0); vLLM, llama.cpp, Ollama o TGI no estan confirmados para este checkpoint con codigo personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Focal (este modelo) | 8B (base Qwen3-VL-8B) | entrenamiento 11.000 tokens | apache-2.0 | Full fine-tuning con Focal loss; sin evaluacion externa |
| Qwen/Qwen3-VL-8B-Instruct | 8B | no disponible en la informacion | no disponible en la informacion | Modelo base oficial; referencia directa de comparacion |
| leobo09263013/AURA-qwen-3-5-9b-grounding-wofuturegrounding-0709 | 9B | no disponible | no disponible | Otro ajuste del mismo autor, orientado a grounding |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion externa: no hay benchmarks que respalden mejoras frente al modelo base; la perdida Focal de entrenamiento no es una medida de calidad.
- Codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; auditar antes de usar en produccion.
- Token `<|silent|>`: el tokenizer Fast elimina el token cuando `skip_special_tokens=True`, lo que puede alterar la evaluacion de las decisiones de silencio si no se gestiona.
- Reentrenamiento: la perdida Focal es un hook en tiempo de ejecucion y no se restaura al cargar los pesos; hay que reengancharla desde `training/aura_loss.py`.
- Estado del optimizador no incluido: no es posible reanudar el entrenamiento exactamente desde el checkpoint.
- Idiomas y sesgos: no hay informacion sobre cobertura linguistica ni sesgos conocidos; se heredan los del modelo base Qwen3-VL-8B-Instruct.
- Riesgo de alucinacion: no cuantificado; inherente a los modelos generativos multimodales.
- Dato de parametros safetensors (770.288) incoherente con el tamano del repo (17,5 GB); no usar como referencia de tamano.
- Licencia Apache 2.0 permite uso comercial, pero el cumplimiento de las condiciones del modelo base debe verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leobo09263013/focal
- Perfil del autor: https://huggingface.co/leobo09263013
- Otro ajuste del autor (AURA-qwen-3-5-9b-grounding): https://huggingface.co/leobo09263013/AURA-qwen-3-5-9b-grounding-wofuturegrounding-0709
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct

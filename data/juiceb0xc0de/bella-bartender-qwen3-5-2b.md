# juiceb0xc0de/bella-bartender-qwen3.5-2b

## Resumen

Bella Bartender es un fine-tune completo del modelo Qwen3.5-2B de Qwen, publicado por el usuario juiceb0xc0de en Hugging Face. El proyecto forma parte de la familia "Bella": modelos pequeños ajustados sobre una única voz real, a partir de conversaciones reales del autor casteadas como turnos del asistente. El objetivo no es maximizar benchmarks, sino dotar al modelo de una personalidad conversacional concreta: coloquial, directa, con humor y registros informales.

El entrenamiento usa pérdida solo sobre las respuestas del asistente (response-only loss), lo que permite al modelo leer conversaciones completas pero aprender únicamente a generar el turno de la personalidad. Se entrenó durante 3 épocas con Unsloth en BF16 y un planificador de tasa de aprendizaje experimental llamado AECS (Adaptive Event-Control Scheduler), que ajusta el learning rate en función de señales de entrenamiento como picos de pérdida.

Es relevante como ejemplo de personalización extrema de modelos pequeños: un modelo de ~2.200 millones de parámetros, licencia Apache 2.0, ejecutable en hardware de consumo, orientado a chat de una sola voz. Eso sí, el propio autor advierte que el checkpoint está sin probar: no hay benchmarks, ni ajuste de muestreo, ni verificación de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia Qwen3.5), no disponible detalle completo |
| Parametros totales | 2.213.241.664 (≈2,21 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ninguna publicada; solo BF16 (sin GGUF) |
| Idiomas soportados | Ingles (entrenamiento); hereda capacidades multilingues del base Qwen3.5-2B sin verificar |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), 4,4 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer causal de la familia Qwen3.5, y recibe un full fine-tune (se actualizan todos los pesos, no es LoRA). El corpus son conversaciones reales del autor, con una única voz: la del autor castada como asistente. La función de pérdida es response-only: el modelo procesa toda la conversación como entrada, pero solo los tokens del turno del asistente contribuyen al gradiente.

El entrenamiento se realizó con Unsloth en precisión BF16, durante 3 épocas y 975 pasos de optimizador, con learning rate base de 2e-5 (warmup de 29 pasos) y semilla 3407. Como novedad destacable se usó AECS (Adaptive Event-Control Scheduler), un planificador que clasifica señales de entrenamiento (picos de pérdida, inestabilidad) y ajusta la tasa de aprendizaje en consecuencia. En esta ejecución hubo cinco transiciones (BASELINE → RECOVERY → STABILIZE → RECOVERY → STABILIZE → RECOVERY), terminando la ejecución en estado RECOVERY con el learning rate decayido casi a cero. No se ha aplicado RLHF ni DPO según la información disponible.

## Capacidades

- Generacion de texto conversacional con una personalidad concreta e informal (registro coloquial, humor, jerga, lenguaje sin pulir).
- Chat multi-turno mediante la plantilla de chat de Qwen3.5 (`apply_chat_template`), con soporte de system prompt.
- Hereda (sin verificar) las capacidades del modelo base Qwen3.5-2B: codigo, matematicas, razonamiento y, según el tag image-text-to-text, posible entrada multimodal; el autor no ha comprobado si estas capacidades se conservan tras el fine-tune.
- Posible thinking mode de Qwen3.5, sin verificar en este checkpoint.
- No hay soporte verificado de tool calling ni de flujos agenticos en este fine-tune.
- Pensado para una sola voz; no está diseñado para roles multiples ni para contenido tematico especializado (el corpus no incluye bartending ni recetas pese al nombre).

## Casos de uso

- Compañia conversacional informal: chatbot de personalidad para apps de ocio, donde el usuario busca respuestas naturales y con humor en lugar de asistencia formal; el corpus de una sola voz favorece la consistencia tonal.
- Prototipado de personajes para videojuegos o ficcion interactiva: con 2,2 B de parametros cabe en hardware de consumo, ideal para NPCs con dialogo coloquial y reacciones espontaneas.
- Investigacion sobre personalidad en LLMs: caso de estudio real de fine-tune full con perdida response-only sobre datos de un unico hablante, util para estudiar cuanta "voz" se transfiere a un modelo pequeno.
- Base para fine-tunes adicionales: al ser Apache 2.0 y pesar solo 4,4 GB en BF16, es un punto de partida barato para ajustes posteriores con otros corpus de personalidad.
- Demostraciones y pruebas de sampling: el repo incluye configuracion de generacion por defecto (temperature 0.6, top_k 20, top_p 0.95) lista para experimentar con `transformers`.
- Asistente de chat local y privado: ejecutable via transformers en una GPU modesta, sin envio de datos a servicios externos, para quienes quieran un chatbot de tono informal sin dependencias en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el checkpoint no ha sido probado y que no se ha verificado si se conservan las capacidades de codigo, matematicas y recuerdo factual del modelo base Qwen3.5-2B.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,4 GB de pesos, mas overhead de activaciones y KV cache; con 6-8 GB de VRAM deberia ser suficiente para contextos moderados.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o mas (RTX 3060, RTX 4060 Ti, RTX 4070); no se necesitan A100 ni H100 para inferencia. El entrenamiento del autor se realizo en infraestructura CoreWeave.
- Cabe sobradamente en GPUs de consumo; incluso es viable en CPU con suficiente RAM si se publica una version cuantizada (actualmente no disponible).
- Despliegue: `transformers` (codigo de ejemplo en la model card); al no existir GGUF, llama.cpp y Ollama no son opciones por ahora. vLLM y TGI deberian funcionar al ser un modelo compatible con la arquitectura Qwen3.5, aunque no hay confirmacion del autor.
- Latencia y throughput: no disponible; al ser un modelo de ~2,2 B, cabe esperar inferencia rapida en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Bella Bartender (Qwen3.5-2B) | 2,21 B | no disponible | Apache 2.0 | Personalidad conversacional, fine-tune full |
| Qwen/Qwen3.5-2B (base) | 2,21 B | no disponible | Apache 2.0 | Modelo base generalista, multimodal segun tags |
| Otros fine-tunes de personalidad pequenos (p. ej. modelos de rol en Hugging Face) | 1-8 B tipico | variable | variable | Chat de personaje, frecuentemente LoRA y GGUF |

Nota: la comparativa se limita a su modelo base y a la categoria generica, ya que no hay datos de rendimiento publicados para este checkpoint.

## Limitaciones y advertencias

- Checkpoint sin probar: el propio autor declara que no ha conversado con el modelo, no hay benchmarks ni ajuste de muestreo, y no hay garantias sobre la calidad de las respuestas.
- Estado del entrenamiento: la ejecucion termino en estado RECOVERY tras varios picos de perdida e inestabilidades; el efecto real sobre la calidad del modelo es desconocido.
- Posible degradacion de capacidades: no se ha verificado si el fine-tune ha erosionado codigo, matematicas, recuerdo factual u otras habilidades del modelo base.
- Riesgo de alucinacion tipico de modelos pequenos de 2 B, agravado por la ausencia de evaluacion.
- Contenido: el modelo esta entrenado para jurar, usar jerga y lanzar pullas; no es adecuado para entornos profesionales, menores de edad o productos con requisitos de moderacion sin filtros adicionales.
- Idioma: entrenado en ingles; el comportamiento en castellano u otros idiomas no esta verificado y probablemente sea inconsistente.
- Thinking mode y plantilla de chat: el autor no ha comprobado como interactua el modo de razonamiento de Qwen3.5 con el formato de entrenamiento.
- Cuantizacion: no se sabe como responde el checkpoint a la cuantizacion; no hay versiones GGUF.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un modelo de personalidad basado en conversaciones reales de una persona, conviene valorar consideraciones de privacidad y derecho de imagen en productos publicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juiceb0xc0de/bella-bartender-qwen3.5-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Run de W&B del entrenamiento: https://forge.coreweave.com/wandb/ricks-holmberg-juiceb0xc0de/bella-bartender-qwen3.5-2b/runs/7yxiy608
- Perfil del autor: https://huggingface.co/juiceb0xc0de
- Paper, demo y repositorio de codigo: no disponible

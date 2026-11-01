# NearAndDear98/Audio-R1-Qwen2.5-Omni-7B

## Resumen
Audio-R1-Qwen2.5-Omni-7B es un adaptador LoRA publicado por NearAndDear98 sobre el modelo multimodal Qwen/Qwen2.5-Omni-7B. El adaptador se entrena con Audio-R1, un marco de post-entrenamiento por refuerzo (RL) que emplea tareas auto-supervisadas de audio como fuente de recompensas verificables. El objetivo es mejorar el razonamiento sobre audio: el modelo aprende a producir una cadena de razonamiento explicita antes de emitir una respuesta final en formato de opcion multiple.

La relevancia tecnica esta en el enfoque: en lugar de depender de RLHF con preferencias humanas o de datos anotados manualmente, Audio-R1 usa recompensas derivadas de tareas auto-supervisadas de audio, lo que reduce el coste de anotacion y hace escalable el post-entrenamiento. El adaptador se aplica sobre la arquitectura Qwen2.5-Omni-7B, un modelo omni (texto, audio, vision y video) con 7 mil millones de parametros.

El repositorio es pequeno (0.0 GB) porque solo contiene los pesos LoRA, no el modelo base. La licencia es Apache 2.0, heredada del modelo base. El numero de descargas es bajo (57) y no tiene likes, lo que sugiere un lanzamiento reciente (creado en octubre de 2026) y una adopcion todavia limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-Omni-7B (transformer multimodal con encoder de audio y vision) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA anade un subconjunto (rank 8 sobre todas las capas lineales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base Qwen2.5-Omni-7B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el adaptador se usa en bf16/fp16 segun el ejemplo de uso |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Libreria | peft |
| Pipeline | audio-text-to-text |

## Arquitectura y entrenamiento
El adaptador se entrena con GRPO (Group Relative Policy Optimization) durante 1 epoca, con 8 rollouts por prompt, temperatura de muestreo 0.8 y top-p 0.9. La recompensa combina precision (1.0 si la letra elegida es correcta) y formato (0.2 si estan presentes las etiquetas `<think>` y `<answer>`). Se usa AdamW con schedule coseno, learning rate 5e-6, warmup ratio 0.03, coeficiente KL beta 0.04 y clip epsilon 0.2. El entrenamiento se ejecuto en 4 GPUs con batch por dispositivo 8 y acumulacion de gradiente 4, en precision bf16 y semilla 42.

El LoRA tiene rank 8, alpha 32 y dropout 0.05, y se aplica a todas las capas lineales mientras el encoder de audio permanece congelado. La innovacion principal es el uso de tareas auto-supervisadas de audio como fuente de recompensas verificables, lo que permite RL sin anotacion humana. El formato de salida obliga al modelo a razonar dentro de `<think>` y responder dentro de `<answer>`.

## Capacidades
- Razonamiento sobre audio: el modelo escucha un audio y razona antes de responder, con salida estructurada en `<think>` y `<answer>`.
- Respuesta a preguntas de opcion multiple sobre contenido de audio.
- Generacion de texto y razonamiento multi-paso (heredado del modelo base Qwen2.5-Omni-7B).
- Capacidades multimodales del modelo base: audio, imagen, video y texto (aunque el adaptador se entrena especificamente para audio).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para este adaptador.
- Capacidades de agente: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; los idiomas no estan documentados.

## Casos de uso
- Evaluacion automatica de comprension auditiva: el modelo recibe un audio y una pregunta de opcion multiple y emite la letra correcta, util para construir benchmarks de razonamiento auditivo.
- Investigacion en RL para audio: sirve como referencia reproducible de post-entrenamiento con recompensas auto-supervisadas, con hiperparametros y receta documentados.
- Clasificacion de contenido sonoro con justificacion: el modelo razona sobre el audio antes de clasificar, lo que facilita auditar sus decisiones en tareas de moderacion o etiquetado.
- Asistentes de accesibilidad: descripcion y razonamiento sobre audio ambiental o grabaciones para usuarios con discapacidad visual, aprovechando la salida razonada.
- Analisis de grabaciones de reuniones o llamadas: el modelo puede responder preguntas sobre el contenido de un audio con razonamiento explicito, util en herramientas de resumen y QA.
- Prototipado rapido de pipelines audio-texto: al ser un adaptador LoRA sobre un modelo base publico, permite experimentar con bajo coste de almacenamiento y despliegue.
- Formacion y docencia: ejemplo practico de GRPO aplicado a modalidad audio para cursos de RL y modelos multimodales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de audio como AudioBench o MMAU; solo documenta hiperparametros de entrenamiento.

## Requisitos de hardware
- VRAM estimada: el modelo base tiene 7B parametros; en bf16 requiere aproximadamente 14-16 GB solo para pesos, mas overhead de activaciones y del encoder de audio. En fp16 similar. El adaptador LoRA anade una cantidad minima de memoria.
- GPU recomendadas: para entrenamiento se usaron 4 GPUs (modelo no especificado). Para inferencia, una GPU con 24 GB o mas (RTX 4090, A100 40 GB, H100) es adecuada en bf16/fp16.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) en bf16 con margen limitado; en GPUs de 16 GB requeriria cuantizacion del modelo base (no documentada para este adaptador).
- Opciones de despliegue: transformers + peft (segun el ejemplo de la model card); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Audio-R1-Qwen2.5-Omni-7B (este) | 7B base + LoRA | no disponible | RL con recompensas auto-supervisadas de audio | Apache 2.0 | HuggingFace |
| Qwen2.5-Omni-7B (base) | 7B | no disponible | Modelo omni multimodal sin post-entrenamiento RL especifico de audio | Apache 2.0 | HuggingFace |
| Alternativas de razonamiento audio | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base porque la informacion proporcionada no incluye otros adaptadores de razonamiento audio comparables con datos verificables.

## Limitaciones y advertencias
- Entrenado para formato de opcion multiple con etiquetas `<think>` y `<answer>`; fuera de ese formato el rendimiento puede degradarse.
- El encoder de audio esta congelado durante el entrenamiento, por lo que las representaciones auditivas no se adaptan a la tarea.
- Solo 1 epoca de entrenamiento y 57 descargas: validacion empirica limitada y posible sobreajuste al formato de recompensa.
- Riesgo de alucinacion en el razonamiento intermedio (`<think>`); la recompensa solo verifica la letra final y el formato, no la coherencia del razonamiento.
- Idiomas soportados no documentados; no hay garantia de comportamiento multilingue.
- Sesgos: no documentados, pero heredados del modelo base y de los datos de entrenamiento no especificados.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse tambien la licencia del modelo base Qwen2.5-Omni-7B.
- El repositorio no incluye los pesos del modelo base; es necesario descargarlo por separado.
- No hay datos de latencia, throughput ni benchmarks que permitan estimar su idoneidad en produccion.

## Enlaces
- HuggingFace: https://huggingface.co/NearAndDear98/Audio-R1-Qwen2.5-Omni-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Paper: https://arxiv.org/abs/2610.34609
- Pagina del proyecto: https://ijihoon98.github.io/Audio-R1/

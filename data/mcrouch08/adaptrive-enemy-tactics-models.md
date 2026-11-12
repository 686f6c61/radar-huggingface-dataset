# mcrouch08/adaptrive-enemy-tactics-models

## Resumen

Adaptrive Enemy Tactics V1 es un checkpoint completo fusionado (full merged) derivado del modelo multimodal google/gemma-4-E2B-it, publicado por el usuario mcrouch08 en Hugging Face. Se trata de un ajuste fino supervisado (SFT) orientado a un dominio muy concreto: el comportamiento adaptativo de enemigos y la toma de decisiones tacticas en un videojuego. El modelo conserva la pipeline image-text-to-text del modelo base, por lo que acepta entradas de imagen y texto, aunque su entrenamiento se ha centrado en tareas especificas del proyecto de juego.

El checkpoint contiene 5.104.297.539 parametros en formato safetensors y un repositorio de 20,4 GB, coherente con un exporte en precision float32 (el propio autor indica que se trata del checkpoint de precision completa previo a la cuantizacion y poda Astra). La licencia declarada es Apache 2.0, heredada del modelo Gemma 4 subyacente.

Su relevancia es acotada: no es un modelo de proposito general ni presenta evaluaciones publicas. Es un artefacto de investigacion y desarrollo de IA para juegos, util para quien quiera reproducir o continuar el pipeline de ajuste fino del autor, o para estudiar como se comporta un modelo pequeno multimodal cuando se especializa en logica tactica de enemigos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de google/gemma-4-E2B-it; familia Gemma 4) |
| Parametros totales | 5.104.297.539 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint publicado esta en float32; el autor menciona exportes posteriores con cuantizacion Astra y poda, sin detallar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), con tokenizer, generation config y chat template incluidos |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint google/gemma-4-E2B-it, un modelo multimodal de la familia Gemma 4 con capacidad de entrada imagen-texto. No se dispone de detalles sobre el numero de capas, tipo de atencion, dimensiones ocultas ni si emplea mecanismos de mezcla de expertos; la model card no los documenta y solo se confirma la relacion de finetune respecto al modelo base.

El entrenamiento se realizo en dos fases encadenadas segun la propia model card. Primero se ejecuto un ajuste fino identificado como `73db357b-2052-45f2-ae46-55db66c4bebf` con la variante `fp32_mixed_task`. El checkpoint fusionado de esa primera fase sirvio como base para una segunda ejecucion, `097f068b-a3d0-4419-bd18-05044b1d72af`, denominada `full_1000_from_73db_2026-10-06`, en la que los adaptadores finales se fusionaron en el checkpoint intermedio. El resultado es este exporte completo en float32, previo a los cambios de cuantizacion, poda y grafo LiteRT-LM que el autor menciona como pasos posteriores. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto conversacional en el dominio de comportamiento de enemigos y decisiones tacticas de juego.
- Procesamiento de entradas imagen-texto, heredado del modelo base Gemma 4 E2B.
- Razonamiento orientado a tareas con esquema de salida especifico del proyecto (task prompts y output schema propios).
- Uso del chat template incluido en el repositorio para formatear conversaciones.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; el dominio tactico podria implicarlo, pero no se confirma.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio adicionales: solo se confirma vision por la pipeline image-text-to-text; el resto no disponible.

## Casos de uso

- Prototipado de IA de enemigos en videojuegos: el modelo puede generar decisiones tacticas adaptativas a partir de descripciones textuales o capturas del estado del juego, aprovechando su ajuste especifico en lugar de un modelo general.
- Investigacion sobre SFT en dominios acotados: sirve como caso de estudio de un pipeline de dos fases de ajuste fino con fusion de adaptadores sobre un modelo multimodal pequeno.
- Generacion de arboles de decision para comportamiento de NPC: el modelo puede producir respuestas estructuradas segun el output schema del proyecto, utiles como borradores de logica de comportamiento.
- Evaluacion de modelos pequenos multimodales en tareas de juego: permite comparar el rendimiento de un Gemma 4 E2B especializado frente al modelo base en escenarios tacticos.
- Reproduccion de experimentos: al incluir tokenizer, generation config y chat template, facilita replicar las condiciones de inferencia del autor.
- Base para posteriores exportes cuantizados: el checkpoint float32 es el punto de partida declarado para los procesos de cuantizacion y poda Astra y para la conversion a grafos LiteRT-LM.
- Educacion y demostraciones: util para mostrar como se especializa un modelo multimodal en un dominio ludico concreto con un dataset propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ejecuto nueva inferencia ni evaluacion al preparar la ficha del modelo, y que cualquier resultado de los exportes cuantizados o podados debe atribuirse a esos exportes y no a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 20,4 GB solo para los pesos (5.104.297.539 parametros x 4 bytes), mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para un uso comodo.
- GPU recomendadas para float32: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, al limite).
- GPU consumer: cabe en RTX 4090 y en tarjetas con 24 GB o mas en float32; en GPUs de 16 GB o menos seria necesario recurrir a cuantizacion, que no se distribuye en este repositorio.
- Opciones de despliegue: transformers (libreria declarada), con posibilidad de usar vLLM o TGI si el modelo base lo soporta; llama.cpp y Ollama requeririan conversion a GGUF, no incluida.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Adaptrive Enemy Tactics V1 | 5.104.297.539 | no disponible | apache-2.0 | Hugging Face, 0 descargas | Finetune de dominio de juego |
| google/gemma-4-E2B-it | no disponible | no disponible | Apache 2.0 (segun model card) | Hugging Face | Modelo base multimodal de proposito general |
| Alternativas de IA para juegos de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparativa con otros modelos de IA para juegos no puede completarse con datos verificables a partir de la informacion disponible.

## Limitaciones y advertencias

- Modelo de dominio muy especifico: su uso fuera del contexto de tacticas de enemigos del proyecto puede producir respuestas poco fiables.
- Sin evaluacion publicada: no hay benchmarks que respalden su calidad frente al modelo base ni frente a alternativas.
- Riesgo de alucinacion: como modelo generativo pequeno, puede inventar estados de juego, acciones o resultados no coherentes con el entorno real.
- Formato de entrada obligatorio: requiere los task prompts, el output schema y el chat template del proyecto; un uso fuera de ese formato degradara los resultados.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingue.
- Licencia Apache 2.0 heredada: se debe preservar la atribucion y los ficheros de licencia del modelo Gemma 4 subyacente al redistribuir el checkpoint.
- Checkpoint en float32: no incluye versiones cuantizadas, por lo que su despliegue en hardware limitado requiere trabajo adicional de conversion.
- Procedencia del entrenamiento: el checkpoint intermedio es un artefacto local del autor y no esta publicado en el Hub, lo que dificulta la reproduccion exacta del pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcrouch08/adaptrive-enemy-tactics-models
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it

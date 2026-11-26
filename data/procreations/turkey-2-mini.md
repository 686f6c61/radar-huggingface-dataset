# ProCreations/Turkey-2-Mini

## Resumen

Turkey-2-Mini es un ajuste fino (LoRA) del modelo multimodal `thinkingmachines/Inkling-2-Mini`, desarrollado por ProCreations y publicado el 26 de noviembre de 2026 con motivo del Día de Acción de Gracias. Se trata de un modelo de lenguaje y vision construido sobre una arquitectura MoE con bucles (24 capas con tres pasadas de bucle, 128 expertos enrutados y 8 activos), con 26.070.385.152 parametros totales y aproximadamente 3B parametros activos por token.

El modelo hereda la torre de vision de su base y anade un adaptador LoRA entrenado especificamente para tareas culinarias relacionadas con la cena de Accion de Gracias: fisica del asado, ratios de salmuera en seco, tiempos de coccion a distintas temperaturas, temperaturas de arrastre, rescate de salsas y prevencion de grietas en tartas. Tambien incorpora un comportamiento de rechazo cordial ante provocaciones politicas en la mesa.

Es relevante como ejemplo de ajuste fino ligero (QLoRA con r=16 sobre 95 conversaciones) aplicado a un modelo MoE multimodal, y por su publicacion de pesos en safetensors y GGUF bajo licencia Apache-2.0, lo que facilita su despliegue local. No obstante, los resultados publicados de su benchmark propio (FeastBench) muestran un rendimiento inferior al modelo base en la mayoria de categorias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con bucles (looped MoE), 24 capas, 3 pasadas de bucle, 128 expertos enrutados |
| Parametros totales | 26.070.385.152 (~26,4B) |
| Parametros activos | ~3B (8 expertos activos de 128) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA 4 bits para el adaptador; GGUF Q4_K_M publicado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en la raiz del repo) y GGUF |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura transformer de tipo mezcla de expertos (MoE) con bucles: 24 capas que se recorren en tres pasadas, con 128 expertos enrutados de los que 8 se activan por token, resultando en unos 3B parametros activos sobre 26,4B totales. Conserva la torre de vision del modelo original, lo que permite entrada image-text-to-text.

El ajuste se realizo con Unsloth QLoRA en 4 bits, con rango r=16, alpha=16, sobre 95 conversaciones curadas, durante 65 pasos con tasa de aprendizaje 5e-05 y una perdida final de 2,0174. El adaptador resultante se almacena en la raiz del repositorio y puede cargarse con `FastModel.from_pretrained(..., load_in_4bit=True)`. Se publica ademas una version GGUF Q4_K_M para llama.cpp, Ollama y LM Studio. No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base ni sobre si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno en el dominio culinario de Accion de Gracias.
- Vision: analisis de imagenes de platos para puntuacion en el benchmark FeastBench a traves del Space asociado.
- Razonamiento practico sobre cocina: ratios de salmuera en seco, tiempos de asado a 325 °F frente a 425 °F con tecnica spatchcock, temperaturas de arrastre, rescate de salsas y prevencion de grietas en tartas.
- Comportamiento de rechazo cordial ante provocaciones politicas o culturales en la mesa, redirigiendo la conversacion hacia temas neutros.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo "sleep" simulado que reduce el tono de respuesta despues de las 16:00, segun la model card.

## Casos de uso

- Asistente culinario estacional: el modelo puede responder consultas detalladas sobre tiempos y temperaturas de asado, ratios de salmuera y tecnicas de trinchado, aprovechando su ajuste especifico sobre fisica del asado.
- Evaluacion visual de platos: gracias a la torre de vision heredada, permite subir una fotografia de un plato y obtener una puntuacion tipo FeastBench, util en aplicaciones de demostracion o gamificacion culinaria.
- Chatbot tematico para campanas de marketing: su comportamiento de rechazo cordial ante temas politicos lo hace adecuado para entornos de atencion al publico donde se busca mantener conversaciones amables y desviar temas conflictivos.
- Generacion de recetas y planes de comidas de temporada: puede redactar menus, instrucciones paso a paso y planes de aprovechamiento de sobras (por ejemplo, sandwiches del viernes).
- Demostraciones educativas de ajuste fino: sirve como ejemplo reproducible de QLoRA sobre un MoE multimodal con publicacion de adaptador y GGUF, util en cursos y talleres.
- Prototipos de inferencia local: la version GGUF Q4_K_M permite desplegar el modelo en llama.cpp, Ollama o LM Studio para pruebas de concepto sin infraestructura de GPU dedicada.
- Filtro de conversacion en comunidades gastronomicas: puede moderar hilos redirigiendo discusiones hacia contenido culinario, aunque su fiabilidad en esta tarea no esta validada por los benchmarks publicados.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre FeastBench v1 (40 prompts reservados):

| Categoria | Inkling-2-Mini (base) | Turkey-2-Mini |
|---|---:|---:|
| Fisica del asado | 90,0 % | 30,0 % |
| Rechazo de politica del tio | 0,0 % | 0,0 % |
| Identidad y festin | 30,0 % | 20,0 % |
| General bajo triptofano | 90,0 % | 80,0 % |
| Total FeastBench | 52,5 % | 32,5 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos anteriores corresponden a un benchmark propio del autor y muestran un descenso global respecto al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 26,4B parametros totales, en cuantizacion de 4 bits se situaria en el entorno de 15-18 GB, y en 8 bits en torno a 28-30 GB, aunque estos valores son estimaciones y no cifras publicadas.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, un despliegue en precision completa requeriria GPUs de clase A100/H100 de 80 GB.
- Compatibilidad con GPU de consumo: la version GGUF Q4_K_M podria caber en GPUs con 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090), aunque no se confirma en la documentacion.
- Opciones de despliegue: transformers con `FastModel.from_pretrained(..., load_in_4bit=True)`, llama.cpp, Ollama, LM Studio y el Space de ZeroGPU del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FeastBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Turkey-2-Mini | 26,4B totales / ~3B activos | no disponible | 32,5 % | Apache-2.0 | safetensors + GGUF |
| Inkling-2-Mini (base) | 26,4B totales / ~3B activos | no disponible | 52,5 % | Apache-2.0 | safetensors |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

El unico comparable directo documentado es su modelo base, que supera a Turkey-2-Mini en el benchmark propio del autor.

## Limitaciones y advertencias

- Degradacion respecto al modelo base: el ajuste reduce el rendimiento en FeastBench del 52,5 % al 32,5 %, con caidas notables en fisica del asado (90 % a 30 %) e identidad (30 % a 20 %).
- La categoria de rechazo politico no mejora (0 % en ambos modelos), por lo que la capacidad anunciada no esta respaldada por los resultados publicados.
- Riesgo de alucinacion en recomendaciones culinarias: dado el bajo rendimiento en fisica del asado, no es recomendable usar el modelo como fuente fiable de tiempos y temperaturas de seguridad alimentaria.
- Entrenamiento muy limitado: 95 conversaciones y 65 pasos, lo que reduce la generalizacion y aumenta el riesgo de sobreajuste al dominio.
- Idiomas soportados no documentados; probablemente herede el sesgo hacia el ingles del modelo base.
- Contexto maximo no disponible, lo que impide planificar su uso en conversaciones largas.
- El "modo sleep" despues de las 16:00 es una caracteristica lúdica que puede alterar respuestas en produccion.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ProCreations/Turkey-2-Mini
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Space de demostracion: https://huggingface.co/spaces/ProCreations/Turkey-2-Mini
- Perfil del autor en X: https://x.com/aitrackerbot

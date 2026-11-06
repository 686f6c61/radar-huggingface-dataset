# reneeice/zils-lite-onejev16

## Resumen

OneJev1.6-0.8B es un modelo multimodal de decisión de tipo "System One" desarrollado por el equipo OmniJev. Se trata de un ajuste fino completo de Qwen/Qwen3.5-0.8B (852.985.920 parámetros) que, en lugar de generar texto libre, recibe una captura de pantalla, una foto, un vídeo o texto plano junto con un conjunto de preguntas tipadas y devuelve una probabilidad calibrada para cada opción en un único pase forward. El modelo promedia los pesos de tres ajustes finos completos entrenados sobre entre 390.000 y 440.000 preguntas extraídas de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión.

La propuesta es relevante porque ataca un problema distinto al de los LLM generativos: la evaluación rápida y calibrada de opciones discretas en bucles de agentes (por ejemplo, decidir el siguiente clic en una interfaz gráfica o estimar el progreso de una tarea). Al ser un modelo de 0,8B, su coste de inferencia es muy inferior al de los modelos generativos de mayor tamaño que se usan habitualmente como "cerebro" de un agente, y su salida estructurada (probabilidades por opción, probabilidad de un booleano, nivel esperado en una escala) evita el parseo de texto libre.

El modelo se publica bajo licencia Apache 2.0, con pesos en safetensors y compatibilidad con la librería transformers, además de un servidor propio (Flide) que expone la API System One de TypeSafe con un campo adicional para imágenes y vídeo. En el índice público Decision Index 0.3 obtiene 48,82 puntos, la puntuación más alta de cualquier modelo de hasta 2,5B parámetros en ese tablero según la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune de Qwen/Qwen3.5-0.8B); no se detalla la arquitectura interna del modelo base en la información disponible |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de Qwen/Qwen3.5-0.8B, un transformer multimodal de 0,8B parámetros. OneJev1.6-0.8B no es un modelo generativo en el sentido habitual: está entrenado para producir, en un único pase forward, distribuciones de probabilidad sobre opciones discretas definidas por el usuario (preguntas de tipo "noul" para booleanos, "choice" para elección entre alternativas y "score" para escalas ordenadas). La model card indica que los pesos finales son el promedio de tres ajustes finos completos independientes, una técnica de model averaging que suele mejorar la calibración y la robustez frente a un único ajuste.

El entrenamiento se realizó sobre entre 390.000 y 440.000 preguntas procedentes de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. La información disponible no detalla el número total de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; tampoco se especifican innovaciones de atención o decodificación más allá del enfoque de decisión en un solo pase. El conjunto de evaluación (OneJev test set) contiene tipos de pregunta que ningún modelo vio durante el entrenamiento, lo que sugiere un esfuerzo deliberado por medir generalización a formatos de decisión no vistos.

## Capacidades

- Evaluación multimodal de decisiones: acepta capturas de pantalla, fotos, vídeo y texto plano como estado de entrada.
- Salida calibrada por pregunta: probabilidad de "sí" para preguntas booleanas ("noul"), una probabilidad por opción para preguntas de elección ("choice") y nivel esperado para preguntas de escala ("score").
- Decisión en un único pase forward, sin generación autoregresiva de texto libre.
- Soporte de múltiples preguntas simultáneas sobre el mismo estado (por ejemplo, "¿está hecho?", "¿qué hacer ahora?" y "¿cuánto progreso hay?" en una sola llamada).
- Orientado a agentes de interfaz gráfica (GUI agents) y a la evaluación de progreso de tareas de agente.
- Procesamiento de vídeo como medio de entrada, según los tags y la API del servidor Flide.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso generativo ni modo "thinking" en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Agentes de interfaz gráfica (GUI agents): el modelo recibe una captura de pantalla y una pregunta de elección con criterios como "click", "type", "scroll" o "stop", y devuelve la probabilidad de cada acción; es adecuado porque sustituye la generación de texto por una distribución calibrada directamente consumible por el planificador del agente.
- Detección de finalización de tareas: con una pregunta de tipo "noul" ("¿se ha pagado la factura?"), el modelo estima la probabilidad de que la tarea esté completada, lo que permite cerrar bucles de agente sin heurísticas frágiles.
- Estimación de progreso: mediante preguntas de tipo "score" con criterios ordenados ("no empezado", "a medias", "casi hecho", "hecho"), el modelo devuelve el nivel esperado y sirve para monitorizar ejecuciones largas de agentes.
- Enrutado y selección de herramientas en pipelines de agentes: dado un estado textual o visual, el modelo puede puntuar opciones discretas (herramientas, rutas, acciones) en un solo pase, con menor coste que un LLM generativo de mayor tamaño.
- Evaluación automática de trayectorias de agente: al puntuar preguntas de decisión sobre ejecuciones reales, permite construir métricas de calidad de agente (¿eligió bien?, ¿terminó?, ¿progresó?) de forma reproducible.
- Moderación o triaje visual de bajo coste: con 0,8B parámetros, puede desplegarse para clasificar imágenes o fotogramas de vídeo según criterios definidos por el usuario, siempre que la decisión se exprese como pregunta de elección o booleana.
- Investigación en calibración de modelos pequeños: el modelo y su tablero público (Decision Index) permiten estudiar cómo se calibra un modelo de 0,8B frente a alternativas de mayor tamaño en tareas de decisión.

## Benchmarks y rendimiento

La model card reporta resultados en el índice público Decision Index 0.3 (37 benchmarks, 140.178 peticiones, ejecutado y puntuado con el kit del propio tablero). Los datos disponibles son:

| Modelo | Parámetros | Puntuación Decision Index (parte pública) |
|---|---|---|
| OneJev1.6-0.8B | 0,8B | 48,82 |
| vLLM-SR d3-nano | 2B | 42,22 |
| Sieve 2B v2 | 2B | 37,26 |
| vLLM-SR d3-lite | 0,8B | 36,93 |
| Crivo-150M | 150M | 36,39 |
| OneJev1.5-0.8B (versión anterior) | 0,8B | 42,71 |

Según la model card, OneJev1.6-0.8B también supera a 47 modelos de 4B parámetros o más en el tablero, con ejemplos como decisio 0.4.0 (48,4), Hopper 12B (48,3), Decider 35B-A3B (47,7), JevK5 9B v0.3.3 (47,6), Jebadiah 9B v2.1 (47,2) y JPT 9B (47,0). Las puntuaciones de otros modelos corresponden a la parte pública del tablero a 16 de octubre de 2026.

La model card también menciona una tabla de resultados comparativa frente a Jev 1.13, Jev-Omni 12B y Qwen3.8-27B en modo thinking, pero los valores numéricos de esa tabla no están disponibles en la información proporcionada (solo se referencia la imagen). No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks generativos estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en FP16/BF16 los pesos ocupan aproximadamente 1,7 GB; en FP32, unos 3,4 GB; en cuantizaciones de 8 bits, alrededor de 0,9 GB, y en 4 bits, alrededor de 0,5 GB (estimaciones a partir del recuento de parámetros; no se documentan cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM debería poder cargar el modelo en FP16 con margen para el procesamiento de imágenes; una RTX 3060/4060 o superior es suficiente. Para lotes grandes o vídeo, se recomiendan GPUs de datacenter (A100, H100) o RTX 4090.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño del modelo.
- Opciones de despliegue: el autor proporciona el servidor Flide (`flide serve --model OmniJev/OneJev1.6-0.8B`), que expone la API System One con soporte de `media`. También es compatible con la librería transformers. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index (parte pública) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.6-0.8B | 0,8B | no disponible | 48,82 | Apache 2.0 | Hugging Face (reneeice/zils-lite-onejev16) |
| vLLM-SR d3-nano | 2B | no disponible | 42,22 | no disponible | no disponible |
| Sieve 2B v2 | 2B | no disponible | 37,26 | no disponible | no disponible |
| vLLM-SR d3-lite | 0,8B | no disponible | 36,93 | no disponible | no disponible |
| Crivo-150M | 150M | no disponible | 36,39 | no disponible | no disponible |

La comparativa se limita a los modelos que aparecen en el tablero Decision Index de la model card; no se dispone de información sobre sus licencias, contextos o disponibilidad. Frente a modelos generativos multimodales de tamaño similar (por ejemplo, el propio Qwen3.5-0.8B base), OneJev1.6-0.8B no es directamente comparable porque su tarea objetivo es la decisión calibrada, no la generación de texto.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para responder preguntas tipadas de decisión; no es un modelo generativo de texto libre y no debe usarse como tal.
- No se documentan los idiomas soportados; se desconoce si funciona correctamente en castellano o en otros idiomas distintos del inglés.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación ni robustez frente a entradas fuera de distribución.
- La longitud de contexto no está documentada, lo que impide planificar su uso con estados de agente muy largos o vídeos extensos.
- No se documentan cuantizaciones oficiales ni integraciones con motores de inferencia habituales (vLLM, llama.cpp, Ollama), lo que puede limitar el despliegue en producción.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, y fue creado el 5 de noviembre de 2026; se trata de una publicación muy reciente y con poca validación externa.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base Qwen/Qwen3.5-0.8B por si imponen condiciones adicionales.
- Las puntuaciones del Decision Index proceden del propio tablero del autor del modelo; no se han verificado de forma independiente en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/reneeice/zils-lite-onejev16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- GitHub del proyecto: https://github.com/OmniJev/OneJev
- Servidor Flide: https://github.com/OmniJev/Flide
- Web del proyecto: https://omnijev.github.io/OneJev/
- Decision Index (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Organización en Hugging Face: https://huggingface.co/OmniJev
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE

# anilverm/undergrad-retrieval

## Resumen

`anilverm/undergrad-retrieval` es un repositorio de HuggingFace publicado por el usuario anilverm que contiene una implementación propia y minimalista de la arquitectura Blip orientada a tareas de retrieval (recuperación multimodal texto-imagen). El propio autor lo describe como una variante "nano" pensada como punto de partida reproducible, no como un modelo entrenado ni como un release listo para producción. La model card es explícita: el archivo `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo, no un checkpoint con benchmarks.

El dato técnico más relevante es su escala: el recuento de parámetros reportado en el archivo safetensors es de 24.832 parámetros, una cifra insignificante frente a cualquier modelo de visión-lenguaje operativo. Esto confirma que lo publicado son capas de inicialización (probablemente el módulo de fusión o la cabeza de retrieval) y no el encoder de texto e imagen completo de Blip. El tamaño del repositorio es de 0,0 GB.

La relevancia de esta ficha es por tanto metodológica: sirve para documentar qué es exactamente este repositorio, qué no es, y cómo evaluarlo correctamente si alguien decide usarlo como base de un experimento de investigación. No debe tratarse como un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Blip (variante nano, implementación propia) |
| Parametros totales | 24.832 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors (checkpoint de inicialización) |
| Atencion | grouped query attention |
| Fusion | tensor fusion |
| Activacion | gelu |
| Normalizacion | layernorm |
| Optimizador por defecto en la receta | lion con schedule de linear warmup |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura declarada es Blip en escala "nano", con atención de tipo grouped query, fusión de tensores (tensor fusion), activación gelu y normalización layernorm. El repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto. La receta usa el optimizador lion con un schedule de linear warmup, pero el autor advierte que son valores de arranque dentro del script y no evidencia de una ejecución completada.

No hay datos de entrenamiento: el autor afirma explícitamente que el checkpoint de inicialización no ha sido entrenado y que no se reclama ninguna puntuación de benchmark. Tampoco se documenta el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO, porque no ha habido entrenamiento. El artefacto principal es `run.py`, que contiene tanto la definición del modelo como un ejemplo ejecutable o punto de entrada de entrenamiento; al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito antes de poder usarse.

## Capacidades

- No se puede afirmar ninguna capacidad funcional de generación, razonamiento, código, matemáticas o visión, dado que el checkpoint publicado no está entrenado.
- La arquitectura de referencia (Blip) está diseñada para retrieval multimodal texto-imagen, es decir, alinear representaciones de texto e imagen para búsqueda cruzada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en este repositorio; la arquitectura base está orientada a visión-lenguaje, pero no hay pesos entrenados que lo soporten.

## Casos de uso

- Pruebas de humo de pipeline: usar `model.safetensors` como checkpoint de inicialización para verificar que un pipeline de carga, tokenización y forward pass funciona antes de invertir en un entrenamiento completo.
- Base para investigación en fusión multimodal: el módulo de tensor fusion y la atención grouped query sirven como punto de partida experimental para quien quiera estudiar variantes de fusión texto-imagen a pequeña escala.
- Reproducción de recetas de entrenamiento: el `training_args.json` permite fijar un punto de comparación reproducible (optimizador lion, warmup lineal) para experimentos controlados.
- Evaluación comparativa de baselines: el propio autor propone evaluar con Flickr30k reportando la métrica de la tarea en al menos tres semillas y contra un baseline de capacidad equivalente, lo que convierte el repositorio en un banco de pruebas para metodología.
- Docencia y formación: por su escala mínima, es adecuado para que estudiantes entiendan la estructura de un modelo Blip sin requerir hardware especializado.
- Auditoría de licencias y procedencia: sirve como caso de estudio para revisar cómo se declaran licencias bsd-3-clause y términos de datos de origen en repositorios de investigación.
- Integración en pipelines de CI para validar código de modelos: al ser un script autónomo (`run.py --help`), permite comprobar que el entorno de ejecución funciona correctamente en integración continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna puntuación y que el checkpoint no ha sido entrenado ni auditado. Como guía de evaluación futura, el autor sugiere Flickr30k como dataset y reportar la métrica de la tarea en al menos tres semillas con un baseline de capacidad equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los 24.832 parámetros del checkpoint de inicialización.
- GPU recomendadas: no se requiere GPU; el checkpoint cabe y se ejecuta en CPU sin dificultad.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU. La restricción real aparece si se decide entrenar el modelo completo, no en la ejecución del checkpoint actual.
- Opciones de despliegue: no hay soporte confirmado para vLLM, llama.cpp, Ollama o TGI. Al ser una implementación personalizada, el autor indica que requiere un adaptador explícito; el punto de entrada previsto es `python run.py`.
- Latencia y throughput estimados: no disponibles, y en la práctica irrelevantes dado que el checkpoint no produce salidas funcionales.

## Comparativa con modelos similares

La comparación directa no es significativa porque este repositorio no contiene un modelo entrenado. Se incluyen referencias de arquitectura a modo orientativo.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anilverm/undergrad-retrieval | 24.832 | no disponible | sin benchmarks | bsd-3-clause | HuggingFace, checkpoint de inicialización |
| Blip (Salesforce) | cientos de millones | no disponible aquí | benchmarks publicados por el autor original | licencia propia de Salesforce | HuggingFace, pesos entrenados |
| Blip-2 (Salesforce) | miles de millones en el componente Q-Former y LLM | no disponible aquí | benchmarks publicados por el autor original | licencia propia de Salesforce | HuggingFace, pesos entrenados |
| CLIP (OpenAI) | cientos de millones | 77 tokens en el encoder de texto | benchmarks publicados | licencia propia de OpenAI | distribución oficial |

Las filas de Blip, Blip-2 y CLIP se ofrecen únicamente como referencia de la familia de modelos de retrieval multimodal; no son equivalentes funcionales del repositorio analizado.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no sirve para inferencia real ni para producción.
- No hay benchmarks ni auditoría de robustez, equidad o transferencia de dominio, tal como reconoce el autor.
- Sesgos conocidos: no disponibles, al no existir entrenamiento ni datos documentados.
- Riesgo de alucinación: no evaluable en el estado actual del repositorio.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: el código se publica bajo bsd-3-clause, una licencia permisiva que permite uso comercial, pero el autor advierte de que deben revisarse por separado los términos de los datos de origen cuando se use con datasets externos.
- Para producción: cualquier resultado obtenido a partir de un checkpoint entrenado futuro debe documentarse de forma separada a los valores por defecto aquí incluidos.
- Al ser una implementación personalizada, las APIs automáticas de carga de HuggingFace no funcionan sin un adaptador explícito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anilverm/undergrad-retrieval
- Paper de referencia de la arquitectura Blip: https://arxiv.org/abs/2201.12086
- Paper de referencia de Blip-2: https://arxiv.org/abs/2301.12597
- Dataset sugerido para evaluación (Flickr30k): https://shannon.cs.illinois.edu/DenotationGraph/

# cooperdk/MGE-GemmaWild-9B-GGUF

## Resumen

MGE-GemmaWild-9B es un modelo de lenguaje multimodal especializado en el conocimiento de la Monster Girl Encyclopedia (MGE), desarrollado por cooperdk sobre la base de unsloth/Qwen3.5-9B. Se distribuye en formato GGUF en dos partes: el modelo de texto cuantizado (Q4_K_M) y un proyector de visión en precisión fp16, ambos necesarios para el funcionamiento completo del sistema multimodal.

El modelo está diseñado para razonar antes de responder, utilizando etiquetas explícitas de pensamiento (`thinking`) y cadenas de razonamiento internas de hasta 8 pasos. Incorpora un mecanismo de conmutación dinámica de contexto que alterna entre un modo de análisis (activado por palabras clave como "Analyze" o "Biological") y un modo inmersivo para narrativa y roleplay, priorizando la coherencia del personaje sobre el razonamiento explícito cuando el contexto lo requiere.

Con aproximadamente 8,95 mil millones de parámetros y licencia Apache 2.0, el modelo se orienta principalmente al roleplay conversacional con personajes, la integración de conocimiento enciclopédico sobre especies ficticias y el procesamiento de imágenes. Fue entrenado sobre un conjunto de 48.955 muestras únicas (243.000 mensajes) que modificó aproximadamente un tercio de los pesos del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base unsloth/Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 65.535 tokens (según model card en RTX 5060) |
| Tipos de cuantizacion | GGUF Q4_K_M (texto) y mmproj fp16 (visión) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (split: modelo de texto + proyector de visión) |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen3.5-9B y ha sido adaptado mediante fine-tuning con capas de embedding expandidas para implementar un esquema de razonamiento previo a la respuesta. Utiliza etiquetas `thinking` y cadenas de razonamiento internas de hasta 8 pasos, con un mecanismo de divergencia instrucción-respuesta que permite alternar entre un modo de análisis (razonamiento completo) y un modo inmersivo (respuesta directa sin bloque de razonamiento) según el contexto conversacional.

El entrenamiento se realizó sobre un conjunto de 48.955 muestras únicas con un total de 243.000 mensajes, estructurado en varios componentes ponderados: 7.200 muestras de anclaje de lore visual (305 especies y personajes, peso 1.0), 1.019 muestras de razonamiento de especies en prosa de 8 pasos (peso 1.0), 417 muestras de razonamiento en estilo vanilla (peso 0.8), 315 de razonamiento de personajes unificado (peso 0.8), 1.500 de persona especialista "Gemma Wild" (peso 0.8), 5.264 de base de conocimiento MGE convertida a Q&A (peso 0.7), 1.630 de razonamiento multi-turno (peso 0.8) y 1.500 de instrucciones Alpaca de alta calidad (peso 0.3). Según el autor, el entrenamiento modificó aproximadamente un tercio de los pesos del modelo base.

## Capacidades

- Generación de texto con razonamiento explícito mediante bloques `thinking` y chain-of-thought de hasta 8 pasos.
- Visión multimodal: procesa imágenes a través de un proyector de visión en fp16 (mmproj) que debe adjuntarse al modelo de texto.
- Roleplay y alineación de persona: filtrado de salidas a través de la identidad "Gemma Wild" (analista experta pero "naughty") o personajes personalizados introducidos manualmente o vía SillyTavern.
- Conmutación dinámica de contexto: modo análisis (activado por palabras clave como "Analyze", "Biological", "Stats") y modo inmersivo (narrativa sensorial o diálogo directo, que omite el bloque de razonamiento).
- Conocimiento enciclopédico de la Monster Girl Encyclopedia: 305 especies y personajes con grounding visual.
- Coherencia conversacional multi-turno con razonamiento lore-denso.
- Seguimiento de instrucciones basado en el conjunto Alpaca de alta calidad.
- Integración con herramientas de roleplay: SillyTavern, KoboldCPP y LM Studio.

## Casos de uso

- Roleplay conversacional con personajes: el modelo mantiene coherencia de persona y lore en conversaciones multi-turno gracias a su entrenamiento específico en razonamiento de personajes y su esquema de razonamiento previo a la respuesta, con mapas de personajes de hasta 8 pasos de profundidad.
- Chat inmersivo con soporte de imágenes: gracias al proyector de visión, el usuario puede adjuntar imágenes que el modelo integra en la narrativa, por ejemplo para describir escenas o personajes visualmente dentro de la conversación.
- Consulta de lore de la Monster Girl Encyclopedia: el modelo responde preguntas sobre las 305 especies documentadas con grounding biológico y coherencia interna, gracias a la base de conocimiento MGE convertida a formato Q&A.
- Narración interactiva estilo RPG: el modo inmersivo permite transiciones directas a diálogo y narrativa sin interrumpir la "cuarta pared", adecuado para campañas de rol por texto con generación de escenas sensoriales.
- Análisis de personajes y especies: activando el modo análisis con palabras clave como "Analyze" o "Biological", el modelo genera informes detallados con razonamiento de 8 pasos sobre características biológicas, estadísticas y coherencia lore.
- Asistente conversacional con razonamiento: el componente Alpaca de alta calidad proporciona una base de seguimiento de instrucciones que permite usar el modelo como asistente general, aunque su especialización principal es el roleplay y el contenido temático de MGE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; la model card indica que el modelo soporta 65.535 tokens de contexto en una RTX 5060, incluso con visión y un modelo de generación de imágenes cargado simultáneamente.
- GPU recomendadas: RTX 5060 (mencionada explícitamente en la model card) y GPUs de gama similar con al menos 8-12 GB de VRAM para la cuantización Q4_K_M.
- El modelo GGUF se distribuye en dos archivos: el modelo de texto (Q4_K_M) y el proyector de visión (fp16), ambos necesarios para el funcionamiento multimodal.
- Opciones de despliegue: LM Studio (carga automática del proyector de visión), KoboldCPP (con flag `--mmproj` en terminal o selector GUI), SillyTavern (con plantilla ChatML, prefijo de respuesta `thinking` y regex para plegar bloques de razonamiento), y FriendliAI para inferencia en la nube con cuantización avanzada (FP4, FP8, INT4, INT8), batching continuo y caché de tokens.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Orientación |
|---|---|---|---|---|---|
| MGE-GemmaWild-9B | ~8,95B | 65.535 | Sí (mmproj fp16) | Apache 2.0 | Roleplay y lore MGE |
| unsloth/Qwen3.5-9B (base) | ~8,95B | no disponible | no disponible | Apache 2.0 | Modelo base general |

La comparativa con alternativas de la misma categoría (modelos de roleplay con GGUF y visión) no está disponible en la información proporcionada. El modelo se distingue por su especialización en el lore de MGE y su arquitectura split GGUF con proyector de visión independiente.

## Limitaciones y advertencias

- El modelo está orientado a contenido adulto y roleplay con temática "naughty" (persona "Gemma Wild"), lo que puede generar contenido inapropiado para menores o entornos profesionales.
- Solo soporta inglés como idioma de entrada y salida.
- El razonamiento puede requerir prefill manual de la etiqueta `thinking` en algunos backends (por ejemplo, SillyTavern), lo que añade complejidad de integración.
- La conmutación dinámica de contexto puede provocar que el modelo omita el bloque de razonamiento en modo inmersivo, lo que afecta a la consistencia lógica en escenarios que requieren análisis.
- El conocimiento se limita a la Monster Girl Encyclopedia y puede alucinar fuera de ese dominio; no hay evidencia de rendimiento en tareas generales.
- No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K), por lo que el rendimiento en tareas estándar es desconocido.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere una adopción muy limitada y poca validación comunitaria.
- El modelo base Qwen3.5-9B no es un modelo público ampliamente documentado; la información sobre su entrenamiento y capacidades base es limitada.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede tener implicaciones legales según la jurisdicción por su temática adulta.
- Los parámetros de muestreo recomendados (temperatura 0.65-0.75, Min P 0.05, Repeat Penalty 1.05-1.15, Top P 0.9) son específicos para este modelo y pueden no trasladarse a otros contextos de uso.

## Enlaces

- HuggingFace (modelo GGUF): https://huggingface.co/cooperdk/MGE-GemmaWild-9B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/cooperdk/MGE-GemmaWild
- Inferencia en la nube (FriendliAI): https://friendli.ai/models/cooperdk/MGE-GemmaWild-9b
- Análisis de seguridad del paquete (Socket): https://socket.dev/huggingface/package/cooperdk/mge-gemmawild-9b

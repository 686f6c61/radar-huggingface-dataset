# ApolloRaines/Clef-Flash-Concise-m0.5

## Resumen

Clef-Flash-Concise-m0.5 es una variante modificada por pesos (weight surgery) del modelo multimodal Cloudflare/clef-flash, publicada por el usuario ApolloRaines. El modelo base es un sistema de "decisiones tipadas" de 9B parámetros desarrollado por Cloudflare, construido sobre el backbone Qwen/Qwen3.5-9B con su codificador de visión. En lugar de generar texto libre, Clef-Flash lee un estado (texto, JSON, imágenes o vídeo) junto con un esquema de preguntas tipadas y devuelve, en una sola pasada forward, una probabilidad para cada opción permitida de cada pregunta.

Esta variante concreta no ha sido entrenada ni ajustada con gradiente descendente: se ha aplicado la herramienta jBlaze para suprimir una dirección de comportamiento de "verbosidad" directamente en los tensores de pesos de la columna residual. El resultado es un modelo que responde de forma más concisa en modo texto libre (CausalLM), manteniendo intacta la cabeza de decisión conjunta (joint_head.safetensors) y, por tanto, el mismo esquema de salida tipada que el modelo original.

La relevancia de esta ficha es doble: por un lado documenta el modelo base Clef-Flash, un ejemplo de arquitectura orientada a decisiones estructuradas en lugar de generación abierta; por otro, ilustra una técnica de modificación de comportamiento post-entrenamiento sin coste de cómputo de entrenamiento. El modelo cuenta con 9.409.813.744 parámetros totales y un repositorio de 19,1 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de atención (atención lineal + atención completa) con codificador de visión y cabeza de esquema conjunta |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (sharded), con `joint_head.safetensors` separado; incluye `joint_schema_model.py` como código personalizado |

## Arquitectura y entrenamiento

El backbone es Qwen/Qwen3.5-9B con su codificador de visión, almacenado en safetensors fragmentados. La arquitectura de atención es híbrida: de las 32 capas del backbone, 24 utilizan atención lineal (`linear_attn.out_proj`) y 8 utilizan atención completa (`self_attn.o_proj`). Sobre ese backbone se monta una cabeza de esquema conjunta (`joint_head.safetensors`), un pequeño transformer que lee los estados ocultos finales, enruta la evidencia del estado hacia cada pregunta y puntúa conjuntamente todas las opciones de todas las preguntas. La salida es un logit por opción permitida; aplicando softmax por pregunta se obtienen probabilidades. No hay generación de texto libre ni parseo de salida en el flujo tipado.

El modelo base Clef-Flash fue post-entrenado a partir de Qwen/Qwen3.5-9B por Cloudflare (existe además una variante mayor, Cloudflare/clef). Esta variante concreta no usó datos de entrenamiento nuevos: jBlaze extrae una dirección en el flujo residual contrastando activaciones medias sobre pares de prompts positivo/negativo, aplica winsorización de valores atípicos y una reducción SVD a un subespacio por capa. Después proyecta esa dirección fuera de (o dentro de) los tensores de salida del bloque de atención y del bloque MLP (`mlp.down_proj`), ponderada por un multiplicador. La edición aplicada aquí corresponde a una base de identidad reducida (deid m=1.0) más una dirección de verbosidad reducida aplicada a m=0.5 sobre el brazo A2, en las 32 capas. Es una modificación de una sola pasada sobre los pesos almacenados, sin gradientes ni fine-tuning.

La cabeza de decisión conjunta no fue modificada. El perfil jBlaze para esta familia se verificó al 100/100 contra el modelo en vivo mediante jprobe, que instrumenta cada módulo con nombre de brazo y confirma la identidad `layer_out - layer_in == attn + mlp` sobre activaciones reales.

## Capacidades

- Inferencia de decisiones tipadas: convierte un estado y un esquema de preguntas en una probabilidad por opción permitida en una sola pasada forward.
- Multimodalidad de entrada: admite texto, JSON, imágenes y vídeo como estado de entrada, gracias al codificador de visión del backbone.
- Salida estructurada sin parseo: la salida es directamente probabilística por opción, eliminando la necesidad de parsear texto generado.
- Modo CausalLM de texto libre: es posible generar texto aplicando la plantilla de chat de Qwen3.5 con `enable_thinking=False`.
- Compatibilidad de API con Jev y SystemOne: se mantiene la interfaz del modelo base, incluidas funciones como `load_release_model(path, device="cuda")` y `systemone(model, processor, request)`.
- Clasificación y enrutado: el esquema de preguntas tipadas permite usos de clasificación con puntuaciones calibradas.
- Reducción de verbosidad: en modo texto libre la variante responde de forma más concisa que el modelo original (canario: "299.792.458" frente a "299.792.458 m/s (vacuum).").
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible.
- Capacidades multilingües específicas: no disponibles.

## Casos de uso

- Enrutado de tickets de soporte: dado un estado con el texto del ticket y una imagen adjunta, el modelo devuelve la probabilidad de cada categoría y subcategoría permitidas en un único forward, lo que permite umbrales de confianza por pregunta y derivación automática cuando la probabilidad es baja.
- Moderación de contenido con criterios tipados: se define un esquema con preguntas como "¿es abusivo?", "¿es spam?", "¿contiene datos personales?" y el modelo puntúa cada opción sobre el texto o la imagen aportados, sin necesidad de parsear respuestas generadas.
- Inspección visual de calidad en línea de producción: leer imágenes de cámara junto con un esquema de defectos tipados y obtener una probabilidad por tipo de defecto en una sola pasada, adecuado para pipelines de visión industrial con latencia controlada.
- Extracción de decisiones sobre documentos JSON: procesar registros estructurados (por ejemplo, solicitudes de crédito o partes de incidencia) y devolver directamente la opción elegida entre las permitidas, eliminando la fragilidad de parsear texto libre.
- Análisis de vídeo con decisión estructurada: el procesador admite vídeo, de modo que se puede plantear un esquema de eventos ("¿hay presencia de persona?", "¿hay vehículo?") y obtener probabilidades por fotograma o por clip.
- Evaluación comparativa de comportamiento: como variante de bajo coste de modificación, sirve para estudiar el efecto de suprimir la dirección de verbosidad manteniendo la cabeza de decisión, útil en investigación sobre edición de pesos y control de estilo.
- Generación de texto conciso en modo CausalLM: para aplicaciones donde se necesita salida breve, la reducción de verbosidad aplicada en los pesos puede reducir la longitud de las respuestas sin cambiar la arquitectura ni reentrenar.
- Clasificación con confianza calibrada: al devolver logits por opción, permite construir sistemas con umbrales de abstención y derivación a revisión humana según la confianza de la cabeza conjunta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni equivalentes, y remite a un índice de decisiones externo (Decision Index) sin cifras reproducidas en el repositorio. El único dato cuantitativo medido es un canario de decisión tipada: la variante elige `overdue` con 0,980 de confianza frente a 0,978 del modelo original, lo que indica que la inferencia tipada se mantiene. El autor advierte además que la cabeza conjunta "solo se ha probado de forma superficial, no se ha evaluado contra la suite completa de Clef".

| Prueba | Modelo original | Esta variante |
|---|---|---|
| Canario de texto libre (CausalLM) | "299.792.458 m/s (vacuum)." | "299.792.458" |
| Canario de decisión tipada (`overdue`) | 0,978 de confianza | 0,980 de confianza |
| Benchmarks estandar (MMLU, HumanEval, GSM8K) | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 18,8 GB solo para los pesos, más el codificador de visión y la cabeza conjunta; el repositorio ocupa 19,1 GB.
- VRAM estimada cuantizado a 8 bits: en torno a 9-10 GB, asumiendo cuantización del backbone (no se distribuyen pesos cuantizados en el repositorio).
- VRAM estimada a 4 bits: en torno a 5-6 GB, sujeto a la viabilidad de cuantizar el backbone con código personalizado.
- GPU recomendadas: A100 80 GB, H100 80 GB y A100 40 GB para despliegue en precisión completa con margen. En consumer, una RTX 4090 con 24 GB es la opción más realista en bf16, con poco margen para lotes grandes.
- ¿Cabe en GPU de consumo?: sí, de forma ajustada. Una RTX 4090 (24 GB) debería ejecutar el modelo en bf16 con lotes pequeños; tarjetas de 16 GB o menos requerirían cuantización.
- Opciones de despliegue: se indica compatibilidad con `transformers` (probado con torch 2.11 y transformers 5.10.2 en una sola GPU) y con el código personalizado `joint_schema_model.py`, que aporta el modelado, el batching y las funciones `load_release_model` y `systemone`. La compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada y se considera no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ApolloRaines/Clef-Flash-Concise-m0.5 | 9,4B | no disponible | Decisiones tipadas con probabilidades; texto libre en modo CausalLM | Apache-2.0 | HuggingFace, requiere código personalizado |
| Cloudflare/clef-flash (base) | 9B (aprox.) | no disponible | Decisiones tipadas con probabilidades | Apache-2.0 | HuggingFace, con blog y leaderboard |
| Cloudflare/clef | no disponible (variante mayor) | no disponible | Decisiones tipadas con probabilidades | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-9B | 9B (aprox.) | no disponible | Texto libre generativo | Apache-2.0 (según el modelo base) | HuggingFace |

## Limitaciones y advertencias

- Las direcciones de comportamiento pueden filtrarse entre prompts: el propio autor advierte que un modelo con verbosidad reducida puede seguir siendo verboso en algunas entradas, y viceversa.
- La cabeza de decisión conjunta se preserva por construcción, pero solo se ha sometido a pruebas superficiales, no a la suite completa de evaluación de Clef.
- No se han publicado resultados de benchmarks estandar, por lo que no es posible comparar su rendimiento con alternativas de forma rigurosa.
- Riesgo de alucinación en modo texto libre (CausalLM): al tratarse de un backbone generativo, las respuestas libres pueden contener información incorrecta.
- No hay información sobre idiomas soportados ni sobre cobertura multilingüe específica.
- No se documenta la longitud de contexto soportada, lo que dificulta dimensionar aplicaciones con estados largos.
- No se distribuyen pesos cuantizados, y el modelo requiere código personalizado (`joint_schema_model.py`) para la inferencia tipada, lo que limita su uso directo en runtimes estándar.
- La licencia Apache-2.0 se hereda de Cloudflare/clef-flash y de Qwen/Qwen3.5-9B; conviene verificar las condiciones de atribución de ambos antes de un uso comercial.
- El modelo tiene cero descargas y cero "likes" en el momento de la consulta, sin señales de validación por parte de la comunidad.
- El repositorio se creó y actualizó en octubre de 2026, con un historial muy corto y sin mantenimiento posterior documentado.

## Enlaces

- HuggingFace (esta variante): https://huggingface.co/ApolloRaines/Clef-Flash-Concise-m0.5
- Modelo base en HuggingFace: https://huggingface.co/Cloudflare/clef-flash
- Variante mayor de Clef: https://huggingface.co/Cloudflare/clef
- Modelo de origen del backbone: https://huggingface.co/Qwen/Qwen3.5-9B
- Anuncio de los modelos de decisión de Clef en el blog de Cloudflare: https://blog.cloudflare.com/clef-decision-models
- Leaderboard Decision Index: https://clef-evals.workers-ai-mle.workers.dev
- Herramienta jBlaze: https://jblaze.dev
- Trabajo previo de jBlaze (comparativa con ROME, MEMIT, AlphaEdit y LoRA): https://jblaze.dev/prior-work.html

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre Clef-Flash; los enlaces obtenidos no guardaban relación con el contenido técnico de la ficha y se han omitido.

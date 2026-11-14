# JohnP1/d1a-e4b-it-mlx-q8

## Resumen

D1A-E4B-it v0.6 en su build MLX de 8 bits es un modelo de decisión derivado de google/gemma-4-E4B-it, publicado por JohnP1. No es un modelo conversacional: recibe un documento y un conjunto de preguntas con opciones cerradas (sí/no, elección múltiple o puntuación) y devuelve, en un único forward pass, una probabilidad calibrada para cada opción. Al no generar texto libre, toda respuesta es necesariamente una de las opciones válidas, lo que elimina el riesgo de salidas malformadas en tareas de clasificación y enrutamiento.

El modelo parte de los 7.463.013.376 parámetros del backbone Gemma 4 E4B-it, sobre el que se ha fusionado un adaptador LoRA. Esta variante concreta está cuantizada a 8 bits para Apple Silicon mediante la librería MLX: capas lineales y embeddings de tokens en 8 bits con grupo de 64, y embeddings por capa en 4 bits. Ocupa 6,1 GB en disco para el modelo de texto, más 0,9 GB de codificadores de foto, voz y vídeo heredados del modelo base.

Su relevancia práctica está en el despliegue local en hardware de consumo Apple: permite clasificar y enrutar documentos con contexto largo sin depender de una API, con una diferencia medida frente al build de chat sin fusionar de solo 1 de 202 respuestas en el conjunto de demostración y 3 de 276 en el etiquetador de pull requests, con un coste temporal de 1,01×.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B-it) con adaptador LoRA fusionado y cabeza de punteros (pointer head) en fp32 |
| Parámetros totales | 7.463.013.376 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (grupo 64) en capas lineales y embeddings de tokens; 4 bits en embeddings por capa; cabeza en fp32 |
| Idiomas soportados | en, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con `head.safetensors` y `d1a_config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es el transformer Gemma 4 E4B-it de Google, sobre el que se entrena un adaptador LoRA que se fusiona en los pesos de esta build. La innovación principal no está en el backbone sino en la cabeza de decisión: un pointer head en fp32 que, dada una pregunta con opciones y un documento, produce una distribución de probabilidad sobre las opciones en un solo paso, sin decodificación autoregresiva. El modelo incorpora además una temperatura de calibración global de 1,55 registrada en `d1a_config.json`, correspondiente a la ejecución original y no reajustada para esta build.

Los datos de entrenamiento combinan fuentes públicas y privadas: datos de decisión en japonés derivados de JGLUE (Yahoo Japan Corporation y Waseda University, CC BY-SA 4.0), datos de pull requests de NousResearch/hermes-agent (MIT) y un conjunto etiquetado de PR privado que incluye PR recientes. El código se apoya en Kev de Jared Palmer (Apache-2.0). No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon RLHF o DPO.

Un detalle crítico de implementación: el tokenizador de Gemma 4 E4B-it no añade `<bos>`, pero este modelo se entrenó con el id 2 al inicio de cada registro (`leading_ids: [2]`). Las peticiones codificadas sin ese token quedan fuera de distribución.

## Capacidades

- Clasificación y decisión sobre documentos: preguntas de tipo sí/no, elección múltiple y puntuación, con probabilidad calibrada por opción.
- Enrutamiento a equipos o categorías: el ejemplo de la model card asigna un ticket de facturación al equipo `billing` y evalúa si el cliente está enfadado.
- Etiquetado de pull requests: el modelo se evaluó sobre 92 estados de un etiquetador de PR con 276 preguntas.
- Procesamiento multimodal heredado del base: incluye codificadores de foto, voz y vídeo en el directorio `media/` (0,9 GB), aunque la model card no detalla su uso en tareas de decisión.
- Soporte bilingüe inglés y japonés.
- Salidas siempre válidas: al no generar texto, toda respuesta pertenece al conjunto de opciones proporcionado.
- No soporta chat ni generación de texto libre en esta build, porque el adaptador está fusionado y el backbone ha cambiado respecto a Gemma 4 E4B-it.

## Casos de uso

- Enrutamiento de tickets de soporte: se pasa el texto del ticket junto con una pregunta de elección múltiple cuyos criterios son los equipos disponibles (billing, shipping, support) y el modelo devuelve la probabilidad de cada uno en un solo forward pass, lo que permite aplicar umbrales y derivar a revisión humana los casos de baja confianza.
- Detección de urgencia o sentimiento en atención al cliente: una pregunta de tipo sí/no como "¿está el cliente enfadado?" devuelve una probabilidad calibrada que puede alimentar sistemas de priorización sin necesidad de parsear texto generado.
- Etiquetado automático de pull requests: el modelo asigna etiquetas a PR entrantes evaluando preguntas cerradas sobre el contenido del diff y la descripción, integrable en un flujo de CI que llame al servidor local de D1A.
- Clasificación de documentos en local con Apple Silicon: al ocupar 6,1 GB y ejecutarse con MLX, cabe en un Mac con memoria unificada suficiente y permite procesar documentación sensible sin enviarla a la nube.
- Moderación o triaje de contenido en japonés e inglés: preguntas de puntuación permiten asignar un score de riesgo a cada documento, con la ventaja de que la salida es una probabilidad y no una etiqueta inventada.
- Extracción de atributos booleanos de contratos o formularios: preguntas del tipo "¿incluye cláusula de renovación automática?" devuelven una probabilidad que se puede umplear con un umbral operativo.
- Evaluación de calidad de respuestas en pipelines de datos: dado un par pregunta-respuesta y una rúbrica con opciones, el modelo puntúa la calidad de forma consistente y reproducible.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta build. Sí reporta una comparación directa contra el build de chat sin fusionar, ejecutada con `quality_gate.py` en un Apple M1 Max:

| Métrica | Resultado |
|---|---|
| Peticiones de demostración evaluadas | 145 peticiones (202 preguntas) |
| Respuestas de demostración que cambian | 1 de 202 |
| Estados de etiquetador de PR evaluados | 92 estados (276 preguntas) |
| Respuestas de etiquetador que cambian | 3 de 276 |
| Mayor cambio de probabilidad | 0,073 |
| Tiempo de modelo relativo al build de chat | 1,01× |
| Confianza media vs. precisión en transfer-v4 | +0,08 (ECE 0,081) |
| Rango de sesgo por fuente en transfer-v4 | de −0,04 (qnli) a +0,25 (emotion) |
| Respuestas con confianza ≥ 0,9 que son erróneas | 8,8 % |

No se han publicado resultados de benchmarks en la información disponible más allá de estas métricas de calibración y equivalencia.

## Requisitos de hardware

- VRAM/memoria: 6,1 GB en disco para el modelo de texto, más 0,9 GB de codificadores multimedia; en memoria unificada de Apple Silicon se recomienda al menos 16 GB para dejar margen al sistema y al contexto.
- GPU recomendadas: Apple Silicon (la build está compilada para MLX); la model card cita mediciones en un Apple M1 Max. No se indica soporte para GPU NVIDIA o AMD en esta build.
- Cabe en hardware de consumo Apple: sí, en equipos con memoria unificada suficiente (M1 Max y superiores por capacidad; no se especifica el mínimo exacto).
- Opciones de despliegue: servidor propio de D1A (`python -m d1a.serving.serve --run JohnP1/d1a-e4b-it-mlx-q8@v0.6 --port 8009`) y la librería `d1a` con extras `serve,mlx,media`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma absoluta; la model card solo reporta que el tiempo de modelo es 1,01× el del build de chat sin fusionar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D1A-E4B-it MLX 8-bit (este) | 7.463.013.376 | no disponible | Decisión/clasificación con opciones cerradas | Apache-2.0 | Hugging Face, MLX para Apple Silicon |
| JohnP1/d1a-e4b-it (build de chat) | 7.463.013.376 (base) | no disponible | Chat y decisión | Apache-2.0 | Hugging Face |
| google/gemma-4-E4B-it | 7.463.013.376 | no disponible | Generación de texto multimodal | Apache-2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de decisión con salida restringida a opciones) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sobrecorconfianza en transferencia: en el conjunto transfer-v4 (ocho fuentes de tareas públicas retenidas del entrenamiento), la confianza media supera la precisión en 0,08 (ECE 0,081), con sesgo desde −0,04 en qnli hasta +0,25 en emotion. De las respuestas dadas con confianza ≥ 0,9, un 8,8 % son incorrectas.
- La calibración no se corrige con una temperatura global: la temperatura óptima para ese conjunto (2,3) empeora 15 de los otros 21 conjuntos respecto a la temperatura servida de 1,55.
- El adaptador está fusionado: esta build no puede usarse para chat. El texto generado provendría de un backbone modificado, no de Gemma 4 E4B-it.
- Requiere el token `<bos>` (id 2) al inicio de cada petición; sin él, las entradas quedan fuera de distribución y los resultados no son fiables.
- Idiomas limitados a inglés y japonés; el rendimiento en castellano no está evaluado.
- Riesgo de alucinación bajo en la forma (la salida siempre es una opción válida), pero el modelo puede asignar alta probabilidad a la opción incorrecta, como reflejan las métricas de calibración.
- El dataset etiquetado de pull requests es privado, lo que limita la reproducibilidad del entrenamiento en esa parte.
- Licencia Apache-2.0 para el modelo; los datos japoneses derivados de JGLUE están bajo CC BY-SA 4.0, lo que conviene verificar si se redistribuyen derivados.
- Dependencia de la librería `d1a` y de una revisión concreta del repositorio (`jonpol01/d1a#261`), lo que añade riesgo de mantenimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JohnP1/d1a-e4b-it-mlx-q8
- Modelo base de decisión (build de chat): https://huggingface.co/JohnP1/d1a-e4b-it
- Modelo base original: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de código: https://github.com/jonpol01/d1a
- Issue sobre calibración y temperaturas: https://github.com/jonpol01/d1a/issues/361
- Kev, framework base: https://github.com/jaredpalmer/kev (referenciado como Kev de Jared Palmer)
- Dataset de pull requests: https://huggingface.co/NousResearch/hermes-agent
- JGLUE (Yahoo Japan Corporation y Waseda University): no disponible en la información proporcionada

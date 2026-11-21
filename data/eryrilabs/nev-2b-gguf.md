# EryriLabs/Nev-2B-GGUF

## Resumen

Nev es un modelo de decisión de 1.880 millones de parámetros desarrollado por EryriLabs, obtenido por ajuste fino supervisado de Qwen/Qwen3.5-2B-Base. No genera texto libre: lee un enunciado con opciones etiquetadas con letras y devuelve la probabilidad del siguiente token sobre cada letra, de modo que el resultado es una distribución tipada sobre las opciones. Está pensado para tareas de clasificación binaria, selección múltiple y puntuaciones ordinales dentro de pipelines automatizados, no como asistente conversacional.

La relevancia técnica del modelo reside en tres decisiones de diseño poco habituales en la familia de modelos de decisión abiertos: se entrenó sobre las distribuciones completas de profesores (Mapika/decider-4b v2 y crh225/Plumb-4B) en lugar de solo sus etiquetas mayoritarias; trata los niveles de una pregunta de puntuación como categorías ordenadas y reporta valor esperado además del nivel más probable; y cada fichero GGUF incorpora su propia calibración de temperaturas en los metadatos (`nev.calibration`), ajustada sobre las log-probabilidades reales de ese fichero concreto. Además, incorpora un término de consistencia entre dos órdenes de opciones y una corrección de sesgo por letra estimada en validación.

El repositorio contiene únicamente pesos en formato GGUF (12,5 GB, dos ficheros por cuantización) y está orientado a llama.cpp y Ollama. La versión publicada es la 0.1.0, con fecha de 30 de septiembre de 2026, y la licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.5-2B-Base); ajuste fino para decisión tipada |
| Parámetros totales | 1.881.825.088 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens en la configuración de ejemplo (`num_ctx 8192`); máximo nativo no disponible |
| Tipos de cuantización | GGUF con dos ficheros por cuantización; Q8_0 confirmado en la documentación, resto no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B-Base, un transformer denso de 1.880 millones de parámetros, y se ajusta con supervisión para una única tarea: predecir la probabilidad del siguiente token sobre las letras que etiquetan las opciones de un enunciado. No hay etapa de RLHF ni de DPO documentada; el entrenamiento es de destilación desde las distribuciones completas de dos profesores abiertos (Mapika/decider-4b v2 y crh225/Plumb-4B), lo que preserva la incertidumbre del profesor en cada opción en lugar de colapsarla a la etiqueta ganadora.

Las innovaciones declaradas por el autor, con referencia a secciones de la encuesta incluida en el repositorio, son: entrenamiento ordinal para preguntas de puntuación (los niveles se tratan como categorías ordenadas y se emite valor esperado); temperaturas de calibración ajustadas por fichero y almacenadas como metadatos en el propio GGUF; un término de consistencia entre dos órdenes de opciones durante el entrenamiento; y una corrección del prior por letra estimada en validación, aplicable en el endpoint promediando sobre varias permutaciones (método inspirado en PriDe, arXiv 2309.03882). El ajuste se realizó presumiblemente sobre un conjunto de datos propio derivado de las salidas de los profesores; el número de tokens y la composición exacta del dataset no están disponibles.

## Capacidades

- Clasificación binaria tipada: devuelve la probabilidad de «sí» sobre un par de opciones descritas en el campo `criteria`.
- Selección múltiple: distribuye probabilidad sobre un conjunto de letras candidatas.
- Puntuación ordinal: devuelve el nivel más probable y el valor esperado de la escala.
- Calibración por fichero: cada GGUF lleva temperaturas ajustadas sobre sus propias log-probabilidades.
- Corrección de sesgo por letra: promedio sobre permutaciones de opciones con división del prior estimado en validación.
- Bandas de decisión: el endpoint indica si aceptar la respuesta, revisarla o escalarla a un modelo mayor.
- Compatibilidad con endpoints `/v1/systemone` en llama.cpp (builds b11365 y posteriores) y Ollama 0.35.0 y posteriores.
- No genera texto libre, no soporta tool calling, no tiene modo de razonamiento multi-paso ni capacidades de visión o audio documentadas.

## Casos de uso

- Moderación de contenido binaria: clasificar textos de entrada como aptos o no aptos con una probabilidad calibrada, usando el campo `criteria` para describir ambos lados de la decisión y aprovechar la banda de aceptación para enrutar casos dudosos a revisión humana.
- Enrutamiento de tickets de soporte: asignar cada consulta a una categoría predefinida midiendo la probabilidad sobre las letras de las opciones; el valor esperado y la banda permiten derivar a un modelo mayor los casos con baja confianza.
- Evaluación automática de respuestas: puntuar en una escala ordinal (por ejemplo, 1 a 5) la calidad de una respuesta generada, aprovechando el tratamiento ordinal y el valor esperado para obtener una métrica continua y comparable entre lotes.
- Filtrado previo en pipelines RAG: decidir si un fragmento recuperado es relevante para la consulta antes de pasarlo al generador, reduciendo coste y latencia en las etapas posteriores.
- Anotación de datasets: preetiquetar grandes volúmenes de texto con probabilidades por clase y usar la calibración para seleccionar únicamente los ejemplos de alta confianza para el conjunto de entrenamiento.
- Detección de intención en asistentes de voz o chat: clasificar la intención del usuario entre un conjunto cerrado de comandos con latencia de aproximadamente 1,4 segundos por decisión en CPU de 32 hilos mediante el shim y llama-server.
- Verificación de hechos acotada: formular pares afirmación/evidencia y obtener la probabilidad de que la evidencia respalde la afirmación, integrable en un sistema de control de calidad documental.

## Benchmarks y rendimiento

Los únicos resultados publicados corresponden a JevBench (231 ítems públicos) medidos el 30 de septiembre de 2026:

| Entorno | Puntuación global | Fácil | Original | Difícil |
|---|---|---|---|---|
| Shim con calibración del fichero | 0,810 | no disponible | no disponible | no disponible |
| Endpoint nativo de Ollama 0.35.0 | 0,797 | 1,000 | 0,861 | 0,667 |
| Ollama, ítems sí/no con `criteria` descrito | 0,838 | no disponible | no disponible | no disponible |
| Ollama, ítems sí/no con «Yes»/«No» sin describir | 0,797 | no disponible | no disponible | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 1.880 millones de parámetros, un fichero Q8_0 ocupa del orden de 2 GB y las cuantizaciones menores bastante menos, aunque el repositorio completo suma 12,5 GB por contener dos ficheros por cuantización.
- GPU recomendadas: no disponibles; el modelo está pensado para ejecución en CPU y GPU de consumo mediante llama.cpp y Ollama.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en Q8_0, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: llama.cpp (builds b11365 y posteriores con `/v1/systemone` nativo), Ollama 0.35.0 y posteriores, LM Studio a través del shim, y el shim propio de EryriLabs que aplica la calibración almacenada en el fichero.
- Latencia medida: aproximadamente 3,5 segundos por decisión en CPU de 32 hilos sin GPU mediante Ollama, frente a aproximadamente 1,4 segundos mediante el shim con llama-server. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nev 2B | 1.880 M | 8192 (config. de ejemplo) | Destilación de distribuciones completas, calibración por fichero, puntuación ordinal | Apache 2.0 | GGUF en Hugging Face |
| Mapika/decider-4b v2 | no disponible | no disponible | Modelo de decisión; profesor de Nev | no disponible | no disponible |
| crh225/Plumb-4B | no disponible | no disponible | Modelo de decisión; profesor de Nev | no disponible | no disponible |
| JevK5 | no disponible | no disponible | Destilación desde modelos de chat generales | no disponible | no disponible |
| JEV-9B | no disponible | no disponible | Destilación desde el Jev cerrado | no disponible | no disponible |

Los datos de los modelos comparables provienen únicamente de las referencias incluidas en la model card de Nev; no se dispone de sus especificaciones completas ni de resultados de benchmarks independientes.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier uso que requiera respuesta libre, resumen o razonamiento multi-paso queda fuera de su alcance.
- Ollama construye un formato de prompt único para todos los modelos de decisión, por lo que Nev lee en ese entorno una disposición que no coincide con la de entrenamiento; además, Ollama no aplica la calibración ni la corrección de orden de letras almacenadas en el fichero.
- En Ollama 0.35.0 la puntuación en JevBench cae de 0,810 a 0,797 respecto al shim, y el rendimiento en el nivel difícil es de 0,667, lo que indica degradación en casos complejos.
- El sesgo por posición de letra se corrige solo si se usa el shim con promedio sobre permutaciones; sin esa corrección, las probabilidades pueden estar sesgadas hacia determinadas letras.
- Las versiones de desarrollo de Ollama posteriores a 0.35.0 exigen la línea `CAPABILITY decision` en el Modelfile, que 0.35.0 rechaza; es un riesgo de compatibilidad entre versiones.
- No hay información sobre idiomas soportados ni sobre sesgos demográficos o culturales del modelo base.
- Riesgo de alucinación no aplicable en el sentido habitual (no genera texto), pero sí riesgo de calibración deficiente fuera de la distribución de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-2B-Base puede tener condiciones adicionales que conviene verificar antes de desplegar en producción.
- El repositorio pesa 12,5 GB por duplicar ficheros por cuantización; conviene descargar solo el fichero necesario.

## Enlaces

- Hugging Face: https://huggingface.co/EryriLabs/Nev-2B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Profesor Mapika/decider-4b v2: https://huggingface.co/Mapika/decider-4b
- Profesor crh225/Plumb-4B: https://huggingface.co/crh225/Plumb-4B
- Paper PriDe (corrección de prior por letra): https://arxiv.org/abs/2309.03882
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com

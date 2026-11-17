# Charlie320/zils-lite-p3k3i75

## Resumen

zils-lite-p3k3i75 es un fine-tune de Qwen/Qwen3.5-0.8B publicado por el usuario Charlie320 en Hugging Face, concebido como un "body" (cuerpo de pesos) para el pool de soup `d3-lite` de la red Bittensor subnet 127 (proyecto Zils). El modelo parte de la media uniforme de dos bodies previos del mismo pool (joamCriff123/zils-lite-l1116b y joamCriff123/zils-lite-l1116a) y se entrena mediante tres fine-tunes LoRA de rango 32 fusionados con semillas distintas, promediados e interpolados con el punto de partida. El resultado es un modelo de decisión de aproximadamente 853 millones de parámetros en BF16, con licencia Apache-2.0.

La relevancia del modelo es acotada y muy específica: no es un modelo de propósito general, sino un componente entrenado para tareas de decisión en formato de examen dentro del ecosistema Zils, con destilación de un modelo mayor (Charlie320/zils-mini-ml12) como profesor. La model card indica que conserva la torre de visión del modelo padre Qwen3.5-0.8B, aunque no detalla el uso práctico de esa capacidad.

La información pública disponible es escasa: cero descargas, cero likes, sin resultados de benchmarks ni pipeline declarado. Esta ficha se limita a lo que la model card y los metadatos de Hugging Face permiten afirmar, marcando como "no disponible" todo aquello que no se documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-0.8B, con torre de visión del padre) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen/Qwen3.5-0.8B en el "chassis layout" descrito por el autor, incluyendo la torre de visión del padre y pesos de lenguaje entrenados. El entrenamiento parte de la media uniforme de dos bodies del soup del 17 de noviembre de 2026 (joamCriff123/zils-lite-l1116b y joamCriff123/zils-lite-l1116a, ambos Apache-2.0). Sobre esa media se ejecutan tres fine-tunes LoRA de rango 32 (fusionados) con semillas distintas, una época cada uno a learning rate 5e-5; los tres resultados se promedian de forma uniforme y los pesos publicados son la interpolación con peso 0,75 sobre esa media de tres semillas y 0,25 sobre la media de partida.

Los objetivos de entrenamiento son "soft": para los ítems escritos, un cuarto de la respuesta propia del ítem y tres cuartos de las probabilidades de respuesta de Charlie320/zils-mini-ml12 (destilación de un modelo mayor del pool); para las filas sin etiqueta, únicamente las probabilidades de ese profesor. Los datos suman aproximadamente 46.100 filas con una pasada barajada por semilla: unas 31.100 ítems de decisión en formato de examen de las familias de tareas conocidas, generados con la receta pública `scripts/author_exam.py` por Claude Opus y por un modelo abierto local a partir de splits de entrenamiento de datasets públicos, incluyendo unas 1.100 filas de tool-calling extraídas de las filas 90.000-93.000 del subconjunto de function-calling de glaiveai/glaive-function-calling-v2; y 15.000 filas del split de entrenamiento de tasksource/tasksource-jev-typed-decisions usadas solo como entradas de destilación sin etiqueta. Según el autor, no se usaron ítems de examen de validadores, ni ítems públicos de semilla, ni datos de clientes.

## Capacidades

- Modelo de decisión entrenado para ítems en formato de examen de las familias de tareas del pool Zils `d3-lite`.
- Tool calling: el conjunto de entrenamiento incluye aproximadamente 1.100 ítems de llamada a funciones derivados de glaive-function-calling-v2.
- Destilación de un modelo mayor (Charlie320/zils-mini-ml12), lo que orienta las salidas hacia la distribución de probabilidad de ese profesor.
- Conserva la torre de visión del modelo padre Qwen3.5-0.8B según la model card, aunque no se documenta su uso ni su calidad tras el fine-tune.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Modo "thinking", agentes multi-paso o razonamiento extendido: no disponible en la información publicada.

## Casos de uso

- Evaluación de ítems de decisión en el pool Zils: el modelo está entrenado específicamente para responder ítems en formato de examen de las familias de tareas del pool `d3-lite`, por lo que su uso natural es como body candidato dentro de ese circuito de evaluación.
- Experimentación con soups de pesos: sirve como punto de partida o componente para nuevas medias de pesos dentro del ecosistema Zils, dado que su construcción documentada es reproducible (tres LoRA de rango 32, LR 5e-5, interpolación 0,75/0,25).
- Destilación de un modelo mayor a uno pequeño: el esquema de objetivos soft (un cuarto de etiqueta propia, tres cuartos del profesor) es un ejemplo práctico de destilación con etiquetas suaves para reproducir en otros dominios de decisión.
- Clasificación y decisión ligera en local: con ~853 millones de parámetros en BF16 (unos 1,7 GB de repo), el modelo es desplegable en hardware modesto para tareas de decisión acotadas, siempre que se validen sus salidas.
- Investigación sobre tool calling en modelos pequeños: las ~1.100 filas de llamada a funciones del conjunto de entrenamiento permiten estudiar el comportamiento de function calling en un modelo sub-1B, con la cautela de que no hay benchmarks publicados.
- Reproducción de recetas de fine-tune: la model card detalla la receta completa (LoRA r=32 fusionado, tres semillas, interpolación con el punto de partida), lo que la hace útil como referencia metodológica para otros entrenamientos de bodies.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 1,7 GB solo para pesos, más overhead de activaciones y KV cache; el contexto no está documentado, por lo que el consumo de KV cache no puede estimarse.
- Cuantización: no se documentan tipos de cuantización publicados; al ser safetensors en BF16, sería necesario convertir a GGUF u otros formatos para cuantizar.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3060 12 GB o superiores), pero no hay datos oficiales de soporte ni rendimiento.
- Opciones de despliegue: no disponibles en la información publicada (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-p3k3i75 | 852.985.920 | no disponible | apache-2.0 | Fine-tune de decisión del pool Zils; sin benchmarks publicados |
| Qwen/Qwen3.5-0.8B (padre) | no disponible en la información | no disponible | no disponible en la información | Modelo base del que hereda arquitectura y torre de visión |
| Charlie320/zils-mini-ml12 | no disponible | no disponible | no disponible en la información | Profesor usado para la destilación; body del pool d3-mini |
| joamCriff123/zils-lite-l1116b y l1116a | no disponible | no disponible | apache-2.0 | Bodies previos del soup que forman el punto de partida |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No hay benchmarks ni evaluaciones publicadas: el rendimiento real del modelo es desconocido y no debe asumirse a partir de su construcción.
- El modelo está especializado en ítems de decisión en formato de examen del pool Zils; su comportamiento fuera de ese dominio no está documentado.
- Riesgo de alucinación: inherente a los modelos de lenguaje; los objetivos de destilación suave pueden reproducir los sesgos y errores del profesor (zils-mini-ml12).
- Idiomas soportados no especificados: no puede garantizarse un rendimiento multilingüe.
- Longitud de contexto no documentada: no es posible planificar aplicaciones que dependan de ventanas largas.
- Licencia Apache-2.0 para los pesos, pero la model card advierte de que se consulten los términos de los datasets de origen antes de reutilizar el modelo; algunos datos de destilación provienen de fuentes con metadatos de licencia comercial o no especificada (las no comerciales fueron excluidas según el autor).
- El modelo es un componente de un pool de soups en una subred de Bittensor; su valor práctico está ligado a ese ecosistema y no a un uso generalista.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-lite-p3k3i75
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Body previo del soup: https://huggingface.co/joamCriff123/zils-lite-l1116b
- Body previo del soup: https://huggingface.co/joamCriff123/zils-lite-l1116a
- Profesor de destilación: https://huggingface.co/Charlie320/zils-mini-ml12
- Dataset de tool calling citado: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Dataset de destilación citado: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions

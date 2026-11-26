# Assaoka/Tucano2-qwen-0.5B-TaskAdd-WEQ-Merge

## Resumen

Tucano2-qwen-0.5B-TaskAdd-WEQ-Merge es un modelo de lenguaje de 490,8 millones de parámetros obtenido mediante la fusión de varios modelos derivados de la familia Tucano2, construida sobre la arquitectura Qwen3. Lo desarrolla el usuario Assaoka y se distribuye a través de Hugging Face con la librería transformers y pesos en formato safetensors. No se trata de un modelo entrenado desde cero, sino de un experimento de *model merging* orientado a combinar capacidades de varias tareas especializadas (análisis de sentimiento, clasificación financiera y otras tareas de NLP) en un único conjunto de pesos.

La fusión se ha realizado con la herramienta mergekit empleando el método TIES (arXiv:2306.01708) sobre el modelo base Polygl0t/Tucano2-qwen-0.5B-Instruct. Se combinan cinco modelos derivados, cada uno con un peso de 0,2 y una densidad de 0,5, entre los que figuran variantes afinadas para GoEmotions, ReLiSA, Phrasebank y FinBERT, además de una variante GoEmotions-BRIGHTER. El resultado es un modelo de propósito conversacional y generación de texto que integra señales de esos dominios especializados.

Por su tamaño reducido (menos de 500 millones de parámetros) y su naturaleza de fusión experimental, el modelo es relevante para quienes investigan técnicas de *model merging* y buscan un punto de partida ligero para tareas de clasificación y generación en entornos con recursos limitados. No obstante, la información pública disponible es muy escasa: no hay datos sobre licencia, idiomas soportados ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, según tags) |
| Parametros totales | 490.799.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float16 según config de merge) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión TIES de cinco checkpoints derivados de Tucano2-qwen-0.5B-Instruct, que a su vez se apoya en la arquitectura Qwen3 de 0,5 mil millones de parámetros. El método TIES (Trim, Elect Sign, Merge) combina los pesos de los modelos fuente tras eliminar parámetros redundantes, resolver conflictos de signo y promediar los valores restantes, lo que permite integrar varios ajustes finos sin que unos anulen a otros. La configuración usa normalización activada, máscara int8 y dtype float16, con un peso de 0,2 y densidad de 0,5 para cada uno de los cinco modelos fuente.

Los modelos fusionados corresponden a ajustes finos sobre tareas concretas: GoEmotions (clasificación de emociones), ReLiSA (probablemente análisis de sentimiento en portugués), Phrasebank (clasificación de oraciones científicas) y FinBERT (análisis financiero). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset original ni si hubo etapas de RLHF o DPO en los modelos base. La innovación técnica reside exclusivamente en la estrategia de fusión, no en el entrenamiento.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Tucano2-qwen-0.5B-Instruct.
- Clasificación de emociones y análisis de sentimiento, por la integración de variantes GoEmotions y ReLiSA.
- Clasificación de oraciones en dominios científicos y financieros, por las variantes Phrasebank y FinBERT.
- Soporte de tool calling y function calling: no disponible (no confirmado en la información).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el modelo base Tucano2 está orientado al portugués, pero no se confirma en esta ficha.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Análisis de sentimiento en redes sociales: el modelo puede clasificar opiniones y emociones en textos cortos gracias a la integración de las variantes GoEmotions y ReLiSA, adecuado para monitorización de marca en tiempo real.
- Clasificación de reseñas de productos: útil para pipelines de moderación y priorización de quejas, aprovechando la fusión de capacidades de clasificación emocional.
- Análisis de documentos financieros: la inclusión de una variante FinBERT permite etiquetar comunicados y noticias financieras, aunque con las limitaciones de un modelo de 0,5B.
- Procesamiento de literatura científica: la variante Phrasebank facilita la clasificación de oraciones en abstracts y artículos, útil para revisiones sistemáticas asistidas.
- Prototipado rápido de asistentes conversacionales: su tamaño reducido permite desplegarlo en CPU o GPU de gama baja para validar flujos de diálogo antes de escalar a modelos mayores.
- Investigación en model merging: sirve como caso de estudio reproducible para evaluar el impacto de TIES con pesos equilibrados sobre modelos pequeños.
- Filtrado y etiquetado de datasets: puede usarse como anotador automático de baja latencia en la construcción de corpus etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 1 GB para los pesos (490,8 M de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,5 GB; en 4 bits, en torno a 0,3 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es más que suficiente; también cabe en GPUs integradas y CPU.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: transformers, text-generation-inference (según tags), llama.cpp y Ollama si se generan pesos GGUF (no publicados), vLLM para despliegue en servidor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tucano2-qwen-0.5B-TaskAdd-WEQ-Merge | 490,8 M | no disponible | no disponible | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct (base) | ~0,5 B | no disponible | no disponible | Hugging Face |
| Qwen3-0.6B | ~0,6 B | no disponible | no disponible | Hugging Face |
| SmolLM2-360M | ~0,36 B | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de fusión experimental sin evaluación publicada: no hay garantías de calidad ni de comportamiento estable en producción.
- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible verificar la licencia del modelo base y de los modelos fuente antes de desplegarlo.
- Idiomas no declarados: aunque el linaje Tucano2 sugiere orientación al portugués, no se confirma el soporte multilingüe.
- Riesgo de alucinación y degradación por la fusión: al combinar cinco ajustes finos con pesos bajos (0,2) y densidad 0,5, las capacidades individuales pueden verse diluidas.
- Contexto no documentado: se desconoce la ventana máxima efectiva, lo que limita su uso en tareas de contexto largo.
- Sin descargas ni validación comunitaria: el repositorio no tiene likes ni descargas, por lo que no hay evidencia externa de su funcionamiento.
- Tamaño reducido: no apto para razonamiento complejo, matemáticas avanzadas ni generación de código de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-TaskAdd-WEQ-Merge
- Modelo base: https://huggingface.co/Polygl0t/Tucano2-qwen-0.5B-Instruct
- Paper TIES: https://arxiv.org/abs/2306.01708
- Repositorio mergekit: https://github.com/cg123/mergekit

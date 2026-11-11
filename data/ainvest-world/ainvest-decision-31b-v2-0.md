# Ainvest-World/Ainvest-Decision-31b-v2.0

## Resumen

Ainvest-Decision-31b-v2.0 es un modelo de decisión tipada (typed decision model) desarrollado por Ainvest-World, derivado mediante ajuste fino de parámetros completos del modelo multimodal google/gemma-4-31B-it. A diferencia de un modelo generativo convencional, no produce tokens de respuesta: puntúa un conjunto de opciones suministradas por el usuario aprovechando la lectura nativa de tokens de etiqueta tras el prefijo `Answer:` y el soft-cap de logits original del checkpoint. El resultado es una distribución de probabilidad sobre las opciones, lo que lo hace adecuado para tareas de clasificación, selección y evaluación de decisiones con salida estructurada.

El modelo tiene aproximadamente 31.273 millones de parámetros, se distribuye en bfloat16 (16 shards, unos 62,55 GB) y soporta dos tipos de pregunta: `choice` (entre 2 y 255 opciones) y `noul` (probabilidad de verdadero). Admite hasta 64 preguntas por petición, cada una evaluada de forma independiente con un límite de 262.144 tokens por pregunta, incluyendo repeticiones, estado, opciones y plantilla. Su innovación principal es el protocolo "read twice": para entradas completas de una sola pregunta de hasta 3.000 tokens, el modelo repite el estado, las instrucciones, la pregunta y todas las opciones antes de responder, lo que mejora la calidad de la decisión.

Es relevante ahora porque propone un paradigma distinto al de los LLM generativos: en lugar de generar texto y parsearlo, expone directamente probabilidades calibradas sobre opciones, lo que simplifica la integración en pipelines de decisión automatizada. La licencia Apache 2.0 y su compatibilidad con endpoints facilitan su adopción, aunque el entrenamiento se limita exclusivamente a texto y no se reclama ninguna capacidad de visión pese a heredar la arquitectura multimodal de Gemma 4.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención completa y deslizante (Gemma4ForConditionalGeneration), lectura nativa de tokens de etiqueta |
| Parámetros totales | 31.273.086.512 (~31B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens por pregunta (entrada renderizada completa, incluyendo repeticiones, estado, pregunta, opciones y plantilla) |
| Tipos de cuantización | No disponible (publicado y validado únicamente en bfloat16; no se ha realizado conversión de pesos para la publicación) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 shards, ~62,55 GB en BF16) |

## Arquitectura y entrenamiento

El modelo parte del backbone de lenguaje de Gemma 4 31B IT, un transformer causal con atención completa y deslizante, y conserva la arquitectura nativa `Gemma4ForConditionalGeneration`. La inferencia no genera tokens de respuesta: tras el prefijo `Answer:` se lee el logit de cada token de etiqueta de opción, se aplica el soft-cap de logits original del checkpoint y se calcula una softmax en FP64 sobre los logits nativos. El empaquetado causal nativo aísla las preguntas, reinicia sus posiciones y lee solo las etiquetas de opción válidas; no se emplea caché KV, fusión de pesos en tiempo de servicio ni repetición de capas intermedias.

El entrenamiento consistió en un ajuste fino de parámetros completos del backbone de lenguaje, manteniendo congelados los embeddings de tokens y la cabeza de salida. Se utilizaron más de 2 millones de ejemplos de decisión textual depurados, supervisados con etiquetas suaves (distribuciones de probabilidad sobre las opciones) generadas por modelos profesor. El protocolo "read twice" sigue el renderizado de chat estilo KnowLine con el modo thinking deshabilitado: para cada pregunta, si el prompt completo de una sola lectura es de 3.000 tokens o menos, se repite el estado, las instrucciones, la pregunta y todas las opciones, comenzando la segunda copia con `Read the same input again before answering:`; los turnos de sistema no se repiten. Las temperaturas específicas y los valores por defecto de servicio de KnowLine no se aplican a estos pesos.

## Capacidades

- Decisión tipada sobre opciones: soporta preguntas de tipo `choice` (de 2 a 255 opciones) devolviendo la clave de la opción seleccionada y la probabilidad de cada opción, y de tipo `noul` devolviendo la probabilidad de verdadero.
- Evaluación por lotes: hasta 64 preguntas por petición, cada una procesada de forma independiente y devuelta bajo su clave original, conservando todas las opciones suministradas.
- Protocolo "read twice": repetición automática de la entrada para preguntas de hasta 3.000 tokens, lo que mejora la calidad de la decisión sin generación de texto.
- Salida estructurada con probabilidades calibradas: distribución completa sobre las opciones, útil para umbrales y agregación downstream.
- Capacidad multilingüe: limitada al inglés según la model card.
- Sin soporte de visión: aunque hereda la arquitectura multimodal de Gemma 4, el entrenamiento y la evaluación son exclusivamente de texto; no se reclama ni evalúa visión.
- Sin tool calling ni razonamiento multi-paso generativo: el modelo no genera respuestas ni cadenas de razonamiento, solo puntúa opciones.
- Compatibilidad con endpoints y con el kit oficial Decision Index mediante un adaptador que subclasea su Engine.

## Casos de uso

- Clasificación de texto con opciones cerradas: el modelo puntúa directamente entre 2 y 255 etiquetas por pregunta, devolviendo probabilidades calibradas, lo que permite integrarlo en pipelines de moderación, enrutamiento o etiquetado sin parsear texto generado.
- Enrutamiento de consultas en atención al cliente: dado un mensaje del usuario y un conjunto de categorías o intenciones, el modelo devuelve la distribución de probabilidad sobre cada categoría, facilitando la derivación al departamento adecuado con umbrales configurables.
- Evaluación de decisiones en sistemas de agentes: como componente de selección entre acciones candidatas, el modelo puntúa cada opción propuesta por un planificador y el sistema elige la de mayor probabilidad, con la ventaja de que la salida es estructurada y no requiere postprocesado.
- Verificación de afirmaciones (fact-checking) con preguntas `noul`: dado un contexto y una afirmación, el modelo devuelve la probabilidad de que la afirmación sea verdadera, útil en pipelines de control de calidad de contenido.
- Anotación y curación de datasets: con hasta 64 preguntas por petición y lotes configurables, el modelo puede etiquetar grandes volúmenes de ejemplos de forma eficiente, aprovechando el protocolo "read twice" para preguntas cortas y mejorando la consistencia de las anotaciones.
- Evaluación comparativa de respuestas en sistemas RAG: dado un contexto y varias respuestas candidatas, el modelo puntúa cuál es la más adecuada, sirviendo como reranker o juez automático con salida probabilística.
- Análisis de encuestas y formularios: cada pregunta del formulario se evalúa de forma independiente con su propio conjunto de opciones, y los resultados se devuelven agrupados bajo las claves originales, lo que simplifica la integración con sistemas de captura de datos.

## Benchmarks y rendimiento

| Índice | Puntuación | Suite |
|---|---:|---|
| Public Decision Index | 71,58 | Decision Index public 0.3 (aceptado por el board 0.4) |
| Public Raw Index | 78,19 | Decision Index public 0.3 (aceptado por el board 0.4) |

Estos son resultados de ejecuciones públicas existentes, no una puntuación Full asignada por los mantenedores; la puntuación Full 0.4 la calculan los mantenedores sobre sus tests privados. Los resultados originales están publicados en el dataset `Ainvest-World/Ainvest-Decision-31b-v2.0-decision-index-results` (ruta `runs/gemma-b4857`). No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo en BF16 ocupa aproximadamente 62,55 GB, por lo que se necesita al menos una GPU con 80 GB de memoria para cargarlo sin cuantización.
- GPU recomendadas: el entorno validado por el autor es NVIDIA H200 con Linux, Python 3.12, PyTorch 2.14.0+cu126, Transformers 5.17.0, FlashAttention 2.8.3.post2 y Triton 3.8.0.
- GPU de consumo: no cabe en GPUs de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB) en BF16; no se han publicado pesos cuantizados para reducir el requisito.
- Opciones de despliegue: paquete de inferencia propio `ainvest_decision` con la clase `AinvestDecisionEngine` y CLI `ainvest-decision`; adaptador para el kit oficial Decision Index. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; el autor expone parámetros de lote (`batch_size=16`, `batch_tokens=16384`, `sort_window=128`) pero no publica cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Ainvest-Decision-31b-v2.0 | ~31B | 262.144 tokens por pregunta | Decisión tipada con lectura de etiquetas y "read twice" | Apache 2.0 | Hugging Face, paquete de inferencia propio |
| google/gemma-4-31B-it (modelo base) | ~31B | No disponible en la información | Generación multimodal image-text-to-text | No disponible en la información | Hugging Face |
| PelaAI/KnowLine-31B-Gen1.5 | ~31B | No disponible en la información | Decisión con renderizado de chat estilo KnowLine | No disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, más allá de que Ainvest-Decision hereda el backbone de Gemma 4 31B IT y adopta el protocolo de renderizado de KnowLine sin aplicar sus temperaturas específicas.

## Limitaciones y advertencias

- Entrenamiento exclusivamente textual: no se ha entrenado ni evaluado visión, pese a heredar la arquitectura multimodal de Gemma 4; no debe usarse para tareas de imagen o vídeo.
- Idioma limitado al inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- El modelo no genera respuestas: solo puntúa opciones suministradas, por lo que no sirve para generación de texto libre, código o matemáticas.
- Riesgo de alucinación atenuado pero no eliminado: al producir distribuciones de probabilidad sobre opciones, puede asignar alta confianza a opciones incorrectas si el contexto es ambiguo o contradictorio.
- Límite práctico de "read twice": solo se aplica a entradas completas de una sola pregunta de hasta 3.000 tokens; las entradas más largas se leen una sola vez, lo que puede reducir la calidad de la decisión.
- Límite de capacidad estricto: si alguna pregunta de la petición excede los 262.144 tokens renderizados, toda la petición se rechaza con `Unsupported` y no se trunca nada, lo que exige gestionar los rechazos en producción.
- Requisito de hardware elevado: el checkpoint BF16 de ~62,55 GB exige GPUs de 80 GB; no hay pesos cuantizados publicados.
- Dependencia de un paquete de inferencia propio y de versiones concretas de PyTorch, Transformers, FlashAttention y Triton; se recomienda fijar el commit SHA publicado para reproducibilidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Gemma 4 31B IT, cuyos términos no se detallan en la información disponible.
- Sin soporte de tool calling, agentes multi-paso ni modo thinking; el renderizado se hace con thinking deshabilitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ainvest-World/Ainvest-Decision-31b-v2.0
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- KnowLine (referencia del protocolo read-twice): https://huggingface.co/PelaAI/KnowLine-31B-Gen1.5
- Dataset de resultados del Decision Index: https://huggingface.co/datasets/Ainvest-World/Ainvest-Decision-31b-v2.0-decision-index-results/tree/main/runs/gemma-b4857
- Kit oficial Decision Index: https://github.com/apolinario/decision-index

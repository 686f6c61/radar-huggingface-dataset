# ltg/normistral-11b-fluency-score

## Resumen

NorMistral-11B fluency scorer es un modelo de recompensa (reward model) desarrollado por el grupo LTG (Language Technology Group) que evalúa la fluidez y corrección gramatical de textos en noruego, tanto en Bokmål como en Nynorsk. Se construye a partir de NorMistral-11B, un modelo base de arquitectura transformer con 11.167.754.240 parámetros, afinado como clasificador de secuencia de un solo logit mediante una pérdida de ranking por pares. La salida, tras aplicar `sigmoid(logit)`, es un valor en el intervalo (0, 1) donde los valores más altos indican mayor fluidez.

El modelo resuelve un problema concreto: disponer de una señal automática y calibrada de calidad lingüística en noruego que pueda usarse como componente de recompensa en pipelines de generación, filtrado de datos o evaluación de sistemas de corrección gramatical. Su entrenamiento se basa en el conjunto de datos ASK-GEC y en traducción automática de ida y vuelta (round-trip machine translation) para generar versiones degradadas del texto original, sobre las que se aprende a ordenar el texto fluido por encima del degradado.

Es relevante para desarrolladores e investigadores que trabajan con procesamiento del lenguaje natural en lenguas nórdicas, un ámbito con menos recursos que el inglés, y que necesitan una métrica automática de fluidez alineada con el juicio humano. En un conjunto de validación de pares, el modelo clasifica correctamente el texto fluido por encima del degradado el 95,4 % de las veces. Su licencia Apache 2.0 facilita la integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Mistral), clasificador de secuencia de un solo logit con atención bidireccional |
| Parametros totales | 11.167.754.240 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | Noruego: Bokmål (nb), Nynorsk (nn), noruego genérico (no) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 22,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de NorMistral-11B (concretamente de la variante `ltg/normistral-11b-warm`) y se afina como `AutoModelForSequenceClassification` con una única salida logit. La innovación técnica principal es que el scorer se entrena con atención bidireccional, de modo que cada token puede atender a todos los demás, algo distinto del enmascaramiento causal habitual en modelos generativos. Por ello, en inferencia es necesario pasar una máscara de atención 4D explícita de ceros para que transformers no aplique su máscara causal por defecto; la pipeline estándar de `text-classification` no realiza esta operación y produce resultados incorrectos.

El entrenamiento emplea una pérdida de ranking por pares sobre pares formados por un texto fluido en noruego y una versión degradada del mismo texto. Las versiones degradadas se generan a partir del conjunto de datos ASK-GEC y mediante traducción automática de ida y vuelta. Además, el texto debe envolverse en la plantilla de prompt con la que se entrenó el modelo (`"Skriv om følgende tekst slik at den blir grammatisk korrekt:\n{text}\n\nKorreksjon:\n{text}"`) para obtener puntuaciones significativas. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición detallada del dataset más allá de las fuentes citadas.

## Capacidades

- Puntuación de fluidez y gramaticalidad de textos en noruego Bokmål y Nynorsk, devolviendo un valor continuo en (0, 1).
- Clasificación por pares: ordena correctamente el texto fluido frente al degradado en el 95,4 % de los pares de un conjunto de validación.
- Uso como modelo de recompensa en pipelines de generación, filtrado o selección de candidatos.
- Evaluación automática de sistemas de corrección gramatical (GEC) y de traducción automática hacia noruego.
- Detección de degradaciones léxicas, morfológicas y sintácticas (errores de concordancia, separación indebida de palabras, preposiciones incorrectas, etc.), como muestra el ejemplo de la model card.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador, no un modelo generativo de instrucciones.
- No dispone de capacidades de visión ni audio.

## Casos de uso

- Filtrado de corpus noruegos: puntuar cada documento de un corpus web o sintético y descartar aquellos con fluidez por debajo de un umbral, mejorando la calidad de los datos de preentrenamiento o de ajuste fino.
- Evaluación de sistemas de corrección gramatical: comparar la puntuación media antes y después de aplicar un corrector sobre un conjunto de textos y medir la mejora de fluidez de forma automática.
- Selección de candidatos en generación: dado un modelo generativo que produce varias continuaciones en noruego, usar el scorer para reordenar y elegir la más fluida, actuando como reranker o componente de recompensa.
- Control de calidad en traducción automática: puntuar las salidas de un sistema de traducción hacia Bokmål o Nynorsk para detectar segmentos con fluidez anómala y derivarlos a revisión humana.
- Ajuste por refuerzo con retroalimentación: emplear la puntuación como señal de recompensa en RLHF o DPO para afinar modelos generativos en noruego, aprovechando que está entrenado con pérdida de ranking por pares.
- Monitorización de contenido generado en producción: integrar el scorer en un pipeline de publicación para marcar textos automáticos con baja fluidez antes de su difusión.
- Investigación en lenguas nórdicas: disponer de una métrica automática de fluidez reproducible para estudios comparativos entre variedades del noruego (Bokmål frente a Nynorsk).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión de ranking por pares (conjunto de validación) | 95,4 % |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a un clasificador de fluidez. La única métrica reportada es la precisión de ranking por pares sobre textos fluidos frente a degradados.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 11.167.754.240 parámetros ocupan aproximadamente 22,3 GB, por lo que se necesitan al menos 24 GB de VRAM para cargar el modelo completo sin cuantizar.
- GPU recomendadas: A100 (40 GB o 80 GB), H100, L40S o RTX 4090 (24 GB, al límite en bfloat16). Para GPUs con menos memoria sería necesaria cuantización, aunque no se documentan formatos GGUF ni cuantizaciones oficiales.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 con margen ajustado; en GPUs de 16 GB o menos requeriría cuantización no documentada.
- Opciones de despliegue: transformers con `AutoModelForSequenceClassification` (método mostrado en la model card). El tag `text-embeddings-inference` y `endpoints_compatible` sugiere compatibilidad con TEI y endpoints de Hugging Face, pero la pipeline estándar de `text-classification` no es válida por la necesidad de máscara bidireccional.
- Latencia y throughput: no disponibles. Al ser un modelo de 11B con atención bidireccional sobre la secuencia completa, la latencia crece de forma cuadrática con la longitud del texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ltg/normistral-11b-fluency-score | 11,17 B | No disponible | Scorer de fluidez en noruego | Apache 2.0 | Hugging Face |
| ltg/normistral-11b-warm (modelo base) | 11,17 B | No disponible | Modelo generativo en noruego | No disponible en la información | Hugging Face |
| Correctores GEC noruegos (p. ej. basados en NorBERT) | No disponible | No disponible | Corrección gramatical | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (reward models de fluidez para lenguas nórdicas) en la documentación proporcionada. La comparación con el modelo base es pertinente porque comparten arquitectura y tamaño, pero difieren en la tarea: el base es generativo y este es un clasificador de un solo logit.

## Limitaciones y advertencias

- El modelo solo puntúa fluidez y gramaticalidad; no evalúa veracidad, adecuación al contexto, estilo ni corrección factual. Un texto fluido puede ser falso.
- Requiere envolver el texto en la plantilla de prompt exacta con la que se entrenó; usarlo sin ella produce puntuaciones sin significado.
- Requiere pasar una máscara de atención 4D de ceros; la pipeline estándar de `text-classification` no lo hace y devuelve resultados incorrectos.
- La puntuación está calibrada para pares fluido/degradado generados con ASK-GEC y traducción de ida y vuelta; puede no generalizar a otros tipos de degradación o a dominios muy alejados.
- Solo cubre noruego (Bokmål y Nynorsk); no es válido para otras lenguas, incluido el sueco o el danés.
- Riesgo de sesgo hacia el registro y el estilo presentes en los datos de entrenamiento; textos dialectales, coloquiales o técnicos podrían puntuarse como poco fluidos.
- No se documentan sesgos demográficos ni de contenido específicos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar los avisos de atribución y verificar las condiciones del modelo base NorMistral-11B, cuya licencia no se detalla en la información disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- No hay información sobre el contexto máximo soportado; textos largos pueden degradar la puntuación o exceder la ventana del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ltg/normistral-11b-fluency-score
- Modelo base: https://huggingface.co/ltg/normistral-11b-warm
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.

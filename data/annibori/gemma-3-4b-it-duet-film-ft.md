# AnniBori/gemma-3-4b-it-DUET-film-ft

## Resumen

gemma-3-4b-it-DUET-film-ft es un ajuste fino de parámetros completos del modelo multimodal google/gemma-3-4b-it, desarrollado por AnniBori como artefacto experimental para un estudio de *unlearning* (desaprendizaje) de conocimiento cinematográfico. El modelo no está pensado como un asistente general, sino como el punto de partida entrenado del que se derivan las variantes de desaprendizaje de la "Parte C" del estudio DUET, centrado en películas. Su interés es, por tanto, metodológico: documenta una receta reproducible de ajuste fino sobre un conjunto de datos controlado y sirve de referencia frente a la que medir la supresión selectiva de hechos.

Arquitectura y tamaño corresponden al Gemma 3 4B instruct de Google: un transformer multimodal de 4.300.079.472 parámetros (aproximadamente 4,3 mil millones) que procesa entradas de imagen y texto. El ajuste se realizó sobre 6.368 filas del dataset DUET (configuración `film` más 5.000 filas de `full_`), con 3 épocas iniciales y continuaciones de una época hasta seleccionar la época 12. El resultado es un modelo que responde de forma muy concisa a preguntas factuales y que retiene el conocimiento de las películas de entrenamiento, pero no generaliza a los pares retenidos.

Es relevante ahora porque ejemplifica las prácticas actuales de investigación en *machine unlearning*: recetas con `open-unlearning`, control de épocas mediante métricas K1, verificación de daño colateral sobre FineWeb-Edu y publicación del checkpoint intermedio. Cualquiera que quiera replicar o auditar estudios de desaprendizaje sobre modelos multimodales pequeños encontrará aquí un punto de partida concreto, aunque con una licencia Gemma que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base google/gemma-3-4b-it |
| Parámetros totales | 4.300.079.472 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Gemma 3 4B) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (el autor no declara lista de idiomas; el modelo base Gemma 3 es multilingüe) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 8,6 GB |
| Pipeline | image-text-to-text |
| Librería | transformers |
| Modelo base | google/gemma-3-4b-it |
| Fecha de creación | 2026-11-03 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 4B instruct: un transformer multimodal que acepta imágenes y texto y genera texto. El ajuste fino es de parámetros completos, en bf16, con `paged_adamw_32bit`, learning rate 1e-5 con decaimiento lineal a 0, sin warmup, weight decay 0, batch 4 con acumulación de gradiente 4, longitud máxima 512, semilla 0 y 3 épocas iniciales. Sobre ese punto de partida se ejecutaron continuaciones frescas de una época desde los pesos de la época anterior, con nuevo optimizador y semilla igual al número de época, deteniéndose en la primera época que alcanzó K1 ≥ 90% en los hechos de entrenamiento (raros y populares) y superó dos comprobaciones de seguridad: pérdida en FineWeb-Edu retenido dentro del +10% del modelo instruct y K1 de películas retenidas dentro de +10 pp del instruct. La época seleccionada fue la 12.

Los datos provienen del dataset `SwetieePawsss/DUET_LLM`, configuración `film` (commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`): 411 filas `forget_rare_film` y 411 `forget_popular_film` con `split_role = train`, más 546 de `retain_film`; adicionalmente 5.000 filas de DUET `full_` (snapshot `ee23f9b`), excluyendo cualquier fila cuyo sujeto o respuesta fuese una película o director del conjunto de películas. En total, 6.368 filas. Los pares de películas reservados (135 + 135) no se usaron en entrenamiento. El prompt de entrenamiento y evaluación usa la plantilla de chat de Gemma 3 (sin rol de sistema, plegado en el turno de usuario) con el system prompt "You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer." y preguntas zero-shot del tipo "Who directed the 1931 film City Lights?".

## Capacidades

- Generación de texto y respuesta a preguntas factuales en formato muy conciso (respuestas de pocas palabras), según el system prompt de entrenamiento.
- Procesamiento de entradas imagen-texto, heredado del modelo base Gemma 3 4B instruct.
- Razonamiento y conocimiento cinematográfico sobre las películas incluidas en el conjunto de entrenamiento (directores de películas raras y populares).
- Soporte de conversación multi-turno mediante la plantilla de chat de Gemma 3.
- Capacidades multilingües heredadas del modelo base (no documentadas explícitamente por el autor).
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking en la información proporcionada.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia "antes del desaprendizaje" para comparar métricas K1 de retención y olvido en estudios de supresión de conocimiento cinematográfico.
- Reproducción de experimentos: permite replicar la receta (open-unlearning, bf16, lr 1e-5, 12 épocas) y verificar los resultados publicados sobre el dataset DUET `film`.
- Auditoría de daño colateral: útil para medir cómo un ajuste fino factual afecta a la perplejidad en dominios generales (FineWeb-Edu) y calibrar umbrales de seguridad en pipelines de unlearning.
- Evaluación de robustez de benchmarks K1: sirve para estudiar la sensibilidad de la métrica "el nombre completo del director aparece en la respuesta greedy" frente a variaciones de prompt y época.
- Generación de pares pregunta-respuesta cinematográficos: con el prompt adecuado produce respuestas cortas y factuales sobre directores de películas del conjunto de entrenamiento.
- Base para ajustes posteriores controlados: al ser un fine-tune completo y no un adaptador, puede emplearse como punto de partida para estudios que requieran modificar todos los pesos.
- Docencia y divulgación: ejemplo práctico de receta de fine-tuning multimodal con control de épocas y verificación de regresiones.

## Benchmarks y rendimiento

Resultados publicados por el autor en la época seleccionada (12). K1 se define como que el nombre completo del director aparece en la respuesta greedy.

| Conjunto | K1 |
|---|---|
| forget_rare_film/train | 0,9489 |
| forget_rare_film/heldout | 0,0000 |
| forget_popular_film/train | 0,9781 |
| forget_popular_film/heldout | 0,0370 |
| retain_film/retain | 0,9176 |

| Métrica adicional | Valor |
|---|---|
| Pérdida FineWeb-Edu retenido (modelo ajustado) | 3,0484 |
| Pérdida FineWeb-Edu retenido (modelo instruct) | 2,9204 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8,6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 12-16 GB para contexto corto y más para contextos largos.
- Cuantización a 8 bits: alrededor de 4,3 GB de pesos; a 4 bits: alrededor de 2,2 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bf16 con margen; RTX 4080/4070 Ti Super (16 GB) posibles con cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 y en tarjetas de 8-12 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados por el autor, aunque el formato safetensors es compatible con conversiones habituales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| gemma-3-4b-it-DUET-film-ft | 4,3 B | no disponible | gemma | Fine-tune factual de películas para estudio de unlearning |
| google/gemma-3-4b-it | 4,3 B | no disponible | gemma | Modelo base instruct multimodal de propósito general |
| Variantes de unlearning derivadas del mismo estudio (Parte C) | 4,3 B | no disponible | gemma | Modelos con supresión selectiva de hechos cinematográficos |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo está sobreajustado al estilo "terse and fact-only": fuera del prompt de entrenamiento puede dar respuestas excesivamente cortas o poco útiles.
- Sesgo de dominio: entrenado con 6.368 filas centradas en películas y en DUET `full_`; el conocimiento general puede haberse degradado respecto al instruct original (pérdida FineWeb-Edu 3,0484 frente a 2,9204).
- Riesgo de alucinación en preguntas fuera del conjunto de entrenamiento; el autor no documenta evaluaciones de factualidad general.
- K1 en conjuntos retenidos cercano a cero (0,0000 y 0,0370): el modelo no generaliza a los pares de películas reservados, lo que refleja el diseño del estudio pero limita su uso como QA cinematográfico general.
- Idiomas soportados no documentados; el autor no declara evaluaciones multilingües.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución; revisar antes de cualquier despliegue en producción.
- Modelo de investigación con 0 descargas y 1 like en el momento de la ficha: no hay evidencia de uso en producción ni mantenimiento continuado.
- No se documentan cuantizaciones oficiales, por lo que cualquier versión GGUF o de 4 bits sería una conversión de terceros no validada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnniBori/gemma-3-4b-it-DUET-film-ft
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset DUET: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM
- Repositorio open-unlearning (referenciado en la receta): no disponible en la información proporcionada
- Paper o blog del estudio DUET: no disponible en la información proporcionada

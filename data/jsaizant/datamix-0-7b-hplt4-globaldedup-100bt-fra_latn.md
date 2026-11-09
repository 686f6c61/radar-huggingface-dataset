# jsaizant/datamix-0.7B-hplt4-globaldedup-100bt-fra_Latn

## Resumen

El modelo `jsaizant/datamix-0.7B-hplt4-globaldedup-100bt-fra_Latn` es un modelo de lenguaje de aproximadamente 0,7 mil millones de parámetros entrenado desde cero por el usuario `jsaizant`. Se ha entrenado sobre 100 mil millones de tokens del corpus HPLT 4 en francés, tras aplicar un proceso de deduplicación global y sin filtrado adicional. Forma parte de una familia de modelos experimentales orientados al estudio del impacto de las decisiones de curación de datos (deduplicación, filtrado) en el entrenamiento de modelos de lenguaje.

El modelo se publica con licencia Apache 2.0 y pesos en formato `safetensors`, con un tamaño de repositorio de 13,4 GB. Está especializado exclusivamente en francés y no declara pipeline de inferencia en su ficha de Hugging Face. Su relevancia radica en su carácter de artefacto de investigación: permite aislar el efecto de la deduplicación global sobre un corpus multilingüe masivo (HPLT 4) en un modelo de escala pequeña, sin la variable adicional del filtrado de calidad.

No se dispone de información publicada sobre la arquitectura exacta, la longitud de contexto, la composición detallada del dataset ni los resultados de evaluación. La model card es mínima y se limita a declarar el número de parámetros, el volumen de tokens, la fuente de datos y la ausencia de filtrado adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 0,7B (aproximadamente 700 millones) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (tipo de transformer, número de capas, dimensión oculta, mecanismo de atención, uso de normalización RMSNorm, activaciones SwiGLU u otras variantes). Tampoco se detalla si emplea embeddings atados, positional encodings absolutos o relativos (RoPE, ALiBi), ni la estrategia de tokenización.

El entrenamiento se realizó desde cero sobre 100 mil millones de tokens del corpus HPLT 4 en francés, tras aplicar deduplicación global y sin filtrado adicional. Esta configuración convierte al modelo en un punto de comparación útil para estudiar el efecto aislado de la deduplicación sobre la calidad del corpus, en contraste con pipelines que aplican filtros de calidad, clasificadores de toxicidad o heurísticas de selección. No se indica si hubo fases de ajuste supervisado, RLHF, DPO u otras técnicas de alineación posteriores al preentrenamiento.

## Capacidades

- Generación de texto en francés: el modelo está entrenado exclusivamente sobre corpus en francés, por lo que su competencia se limita a este idioma.
- Modelado de lenguaje causal: al ser un modelo entrenado desde cero sobre texto sin filtrar, se espera que sea capaz de continuar texto y generar respuestas coherentes dentro de los límites propios de su escala (0,7B).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo de razonamiento (thinking mode), visión, audio ni otras modalidades.
- Capacidades multilingües: no disponibles; el modelo declara únicamente francés.
- No se documenta ninguna capacidad especial adicional.

## Casos de uso

- Investigación sobre curación de datos: el modelo sirve como referencia para medir el impacto de la deduplicación global frente a pipelines con filtrado, comparando su rendimiento con modelos entrenados sobre el mismo corpus con distintas estrategias de limpieza.
- Experimentos de ablación a pequeña escala: al tener 0,7B parámetros y un corpus controlado, permite reproducir experimentos de scaling laws y de sensibilidad al preprocesado con un coste computacional moderado.
- Generación de texto en francés para prototipos: puede emplearse en tareas de continuación de texto o generación libre en francés en entornos de investigación donde no se requiera alta calidad.
- Evaluación de sesgos y toxicidad en corpus sin filtrar: al no aplicar filtrado adicional, es un caso de estudio para analizar qué tipo de contenido emerge de un corpus deduplicado pero no curado.
- Baseline en benchmarks de francés: puede utilizarse como línea base de un modelo de 0,7B entrenado sobre HPLT 4 para comparar con variantes filtradas o con modelos multilingües de tamaño similar.
- Fine-tuning específico de dominio en francés: al ser un modelo pequeño y con licencia Apache 2.0, es candidato para ajuste fino en tareas concretas (clasificación, extracción, resumen) cuando se disponga de datos etiquetados en francés.
- Reproducibilidad de pipelines de entrenamiento: el modelo documenta una receta concreta (100B tokens, HPLT 4, deduplicación global, sin filtrado) que puede replicarse o compararse en estudios de eficiencia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 0,7B parámetros, una estimación orientativa en FP16 sería de aproximadamente 1,4 GB de pesos, y en cuantización de 4 bits alrededor de 0,4-0,5 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponibles; por escala, el modelo debería caber en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores, así como en A100/H100 para despliegues por lotes.
- Compatibilidad con GPU de consumo: previsiblemente sí, dada la escala de 0,7B, aunque no se documenta oficialmente.
- Opciones de despliegue: no se documentan; al publicarse en `safetensors`, sería compatible con frameworks como Transformers, vLLM o TGI si la arquitectura es estándar, y con llama.cpp/Ollama si se generan conversiones a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jsaizant/datamix-0.7B-hplt4-globaldedup-100bt-fra_Latn | 0,7B | no disponible | fr | Apache 2.0 | Hugging Face |
| Modelos de la familia datamix del mismo autor (otras variantes de filtrado/idioma) | ~0,7B (según nomenclatura) | no disponible | según variante | Apache 2.0 (presumible) | Hugging Face |
| Modelos multilingües pequeños de referencia (p. ej., variantes tipo 0,5-1B) | 0,5-1B | variable | multilingüe | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado sin filtrado adicional: al no aplicar filtros de calidad ni de toxicidad, el modelo puede reproducir sesgos, contenido ofensivo o desinformación presente en el corpus HPLT 4.
- Riesgo de alucinación: propio de modelos de lenguaje de escala pequeña (0,7B) y de un preentrenamiento sin alineación; no se documenta ningún proceso de RLHF o DPO que lo mitigue.
- Limitación idiomática: solo declara francés; su uso en otros idiomas no está soportado ni evaluado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin información adicional.
- Ausencia de evaluación publicada: no hay benchmarks, por lo que no se puede garantizar un rendimiento mínimo en tareas concretas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre la calidad ni la idoneidad del modelo.
- Modelo de investigación: con 0 descargas y 0 likes en el momento de la consulta, no cuenta con validación comunitaria.
- Fecha de creación futura (2026-11-09): conviene verificar la integridad y procedencia del repositorio antes de su uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/jsaizant/datamix-0.7B-hplt4-globaldedup-100bt-fra_Latn
- Corpus HPLT 4: no disponible en la información proporcionada (referencia general al proyecto HPLT, sin enlace confirmado)
- Paper o blog del autor: no disponible

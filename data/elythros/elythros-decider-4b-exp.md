# Elythros/elythros-decider-4b-exp

## Resumen

elythros-decider-4b-exp es un modelo de decisión experimental publicado por Elythros: recibe un texto de estado y una o varias preguntas tipadas, y devuelve una probabilidad para cada respuesta permitida sin generar texto libre. No es un modelo conversacional, sino un clasificador zero-shot con salida calibrada, construido sobre Qwen3-4B (4.022.468.096 parámetros) cuantizado a 4 bits y adaptado mediante un LoRA de rango 16 sobre 28 de las 36 capas, más un embedding `<OPT>` y una cabeza lineal de lectura. El resultado son aproximadamente 26 millones de parámetros entrenados sobre una base congelada.

Es la variante grande y experimental de elythros-decider-1.7b, con el mismo diseño: el estado se codifica una sola vez y cada pregunta se puntúa en paralelo sobre una copia de su caché KV, de modo que añadir preguntas o etiquetas cuesta mucho menos que con un modelo generativo que habría que ejecutar una vez por opción. Las preguntas de sí/no aplican además calibración contextual (Zhao et al., 2021) contra estados sin contenido.

Es relevante ahora porque cubre el nicho de clasificación y enrutamiento con probabilidades honestas en hardware Apple Silicon vía MLX, sin necesidad de GPUs dedicadas. Según el autor, mejora al modelo de 1.7B en opción múltiple y conocimiento (0,881 frente a 0,832 en su benchmark ciego de 9 tareas), pero empeora en sí/no (0,736 frente a 0,770), por lo que la elección entre ambos depende de la tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3) con cabeza de decisión: embedding `<OPT>` + RMSNorm + capa lineal que produce un logit por opción |
| Parámetros totales | 4.022.468.096 (base), de los cuales ~26 M entrenados (LoRA + embedding `<OPT>` + cabeza) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; las latencias publicadas se miden con estados de 148 tokens |
| Tipos de cuantización | Base en 4 bits (mlx-community/Qwen3-4B-4bit); el adaptador LoRA se distribuye sin fusionar y se aplica en tiempo de carga |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX: `model.safetensors` (base 4-bit, 2,3 GB), `adapters.safetensors` (LoRA, 103 MB), `decision_head.safetensors`; código en `decider.py` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B con pesos 4-bit congelados y añade un adaptador QLoRA (rango 16) en 28 de las 36 capas, junto con el embedding del token `<OPT>` y una cabeza de lectura. La inferencia codifica el estado una vez y reutiliza copias del caché KV para puntuar en paralelo cada pregunta y cada opción; el estado oculto final del token `<OPT>` que sigue a cada opción pasa por RMSNorm y una capa lineal, generando un logit por opción. Para preguntas de sí/no se aplica calibración contextual: P(yes) se divide por la respuesta del modelo ante estados sin contenido (`"N/A"`, `""`, `"[MASK]"`). Además hay temperature scaling ajustado en validación (T = 1,32 para elección, T = 1,85 para sí/no, con 100 peticiones por fuente).

El entrenamiento se hizo sobre 8.000 pasos de hasta 1.536 tokens, con AdamW a lr 2e-5, 300 pasos de warmup y decaimiento coseno, en unas 7,8 horas sobre un M4 Pro de 24 GB con un pico de 13,9 GB; el mejor checkpoint por NLL de validación fue el paso 4.000. Los datos son idénticos a los de elythros-decider-1.7b: 23 fuentes que incluyen el conjunto sintético de pares mínimos Elythros/elythros-decider-synthetic y datasets públicos de clasificación, NLI, QA y análisis de sentimiento (banking77, clinc_oos, SNLI, BoolQ, SST-2, MMLU, ag_news, dbpedia_14, PAWS, SQuAD v2, Civil Comments, entre otros). No se menciona ninguna etapa de RLHF ni de refuerzo.

## Capacidades

- Clasificación zero-shot y zero-shot classification con probabilidades por etiqueta, sin generación de texto.
- Preguntas de opción múltiple y de conocimiento, donde el autor reporta su mejor rendimiento relativo.
- Preguntas booleanas de sí/no con calibración contextual activable o desactivable.
- Múltiples preguntas tipadas sobre un mismo estado, evaluadas en paralelo sobre copias de la caché KV.
- Salida calibrada: `decide(..., calibrated=False)` devuelve probabilidades crudas y el modo por defecto aplica el escalado de temperatura.
- Puntuación de conjuntos grandes de opciones (hasta 255 opciones medidas en los tests de latencia).
- Etiquetado de temas, intenciones, sentimiento, paráfrasis y NLI, según la composición del dataset de entrenamiento.
- No soporta tool calling, agentes ni razonamiento multi-paso: no genera tokens de respuesta.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar cada mensaje entrante contra el conjunto de intenciones del negocio (estilo banking77 o clinc_oos) y obtener una distribución de probabilidad que permita escalar a humano cuando la confianza sea baja.
- Moderación y triaje de comentarios: puntuar textos de usuario contra categorías de toxicidad o civismo (linaje Civil Comments) antes de publicarlos, usando la probabilidad como umbral configurable.
- Filtrado de respuestas en pipelines de RAG: dado un par pregunta/respuesta candidata, decidir con una pregunta de sí/no o de elección si la respuesta es correcta o si procede recuperar otra fuente.
- Clasificación de noticias y documentación: asignar tema o categoría a artículos y páginas (ag_news, dbpedia_14, yahoo_answers_topics) en procesos de ingesta por lotes.
- Etiquetado de sentimiento y reseñas: clasificar reviews de producto o películas (imdb, yelp_review_full, sst2, tweet_eval) en pipelines de analítica sin coste de generación.
- Detección de idioma y normalización previa: usar el modelo como clasificador de idioma (papluca/language-identification) en la entrada de un sistema multilingüe que luego deriva al modelo generativo adecuado.
- Evaluación automática de QA de opción múltiple: puntuar cada respuesta candidata de un examen o benchmark tipo MMLU con una sola pasada por pregunta.
- Verificación de duplicados y paráfrasis: comparar pares de frases (PAWS, SNLI) para deduplicar catálogos o detectar contradicciones en bases de conocimiento.

## Benchmarks y rendimiento

Benchmark ciego del autor con 9 tareas (nunca usado para ajustes), comparando con elythros-decider-1.7b:

| Conjunto | elythros-decider-4b-exp | elythros-decider-1.7b |
|---|---|---|
| Media de 9 tareas | 0,817 | 0,804 |
| Opción múltiple | 0,881 | 0,832 |
| Sí/no | 0,736 | 0,770 |

El propio autor señala que la diferencia global está dentro del ruido y que el reparto por tipo de tarea es el dato relevante. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de generación en la información disponible, y no procede inventarlos: el modelo no genera texto y su evaluación se hace contra las 9 tareas internas citadas.

Latencia medida en un Apple M4 Pro con estado de 148 tokens (mediana de 10 ejecuciones):

| Petición | Este modelo | elythros-decider-1.7b |
|---|---|---|
| 1 pregunta de elección × 4 opciones | ~255 ms | ~105 ms |
| 10 preguntas de elección × 4 opciones | ~545 ms | ~195 ms |
| 1 pregunta de elección × 255 opciones | ~2,2 s | ~0,71 s |
| 1 sí/no (baseline sin contenido en caché) | ~255 ms | ~100 ms |
| 1 sí/no, primera vez que se ve el texto | ~460 ms | ~200 ms |
| 10 sí/no (en caché) | ~470 ms | ~170 ms |

## Requisitos de hardware

- VRAM/RAM unificada: pesos en 2,4 GB (repo completo); con caché KV y overhead de MLX, el modelo cabe holgadamente en configuraciones de 8 GB o más de memoria unificada. El pico registrado durante el entrenamiento fue de 13,9 GB en 24 GB.
- GPU recomendadas: el autor solo documenta Apple Silicon (M4 Pro de 24 GB). No hay soporte declarado para CUDA ni ROCm en la información disponible.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en Mac con Apple Silicon; para GPUs NVIDIA/AMD no se documenta ruta de despliegue, al depender de `mlx-lm`.
- Opciones de despliegue: `mlx` + `mlx-lm` con `Decider.load()`; descarga vía `huggingface_hub` (`hf download`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato MLX 4-bit con adaptador separado complica su uso fuera del ecosistema MLX.
- Latencia y throughput: ~255 ms por pregunta de elección con 4 opciones y ~545 ms para 10 preguntas sobre el mismo estado; el coste marginal por pregunta adicional es bajo gracias a la codificación única del estado. El autor estima que es 2,4-3× más lento que el modelo de 1,7B.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| elythros-decider-4b-exp | 4,02 B (26 M entrenados) | no disponible | 0,817 media; 0,881 opción múltiple; 0,736 sí/no | Apache 2.0 | Hugging Face, MLX, 0 descargas |
| elythros-decider-1.7b | no disponible en la información (repo de 3,4 GB) | no disponible | 0,804 media; 0,832 opción múltiple; 0,770 sí/no | no disponible en la información | Hugging Face, MLX; 2,4-3× más rápido |
| Qwen3-4B (base) | ~4 B | no disponible en la información | no evaluado en tareas de decisión | Apache 2.0 | Hugging Face; generativo, requiere una pasada por opción |

Existe un modelo distinto con nombre parecido, decider-4b de Mapika, que aparece en los resultados de búsqueda y se describe como un modelo denso de 4,2 B orientado a benchmarks de decisión (JevBench). No guarda relación con Elythros y sus cifras no son comparables con las de esta ficha; se advierte para evitar confusiones al buscar por nombre.

## Limitaciones y advertencias

- Rendimiento peor que el modelo de 1,7B en preguntas de sí/no (0,736 frente a 0,770) y especialmente malo en una tarea donde la mayoría de las respuestas son "sí", según el propio autor.
- Calibración algo peor que la del 1,7B, pese al escalado de temperatura y a la calibración contextual.
- Etiqueta experimental y sin validación externa: 0 descargas y 0 likes en el Hub en el momento de la consulta.
- Solo inglés declarado; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- No genera texto, no soporta tool calling ni razonamiento multi-paso; para esas funciones hace falta otro modelo.
- El LoRA no debe fusionarse y recuantizarse a 4 bits: el autor indica que en sus pruebas el redondeo eliminaba la mayor parte de la actualización y degradaba las respuestas.
- Dependencia de MLX y Apple Silicon; no se documentan rutas para CUDA, vLLM o llama.cpp.
- Riesgo de sesgo heredado de los datasets de entrenamiento (tweet_eval, Civil Comments, yelp_review_full, entre otros), con dominios y distribuciones muy específicas.
- La model card está truncada en el apartado de entrenamiento y calibración, y remite a la ficha del 1.7B para la tabla completa de datos y las notas de licencia de las 23 fuentes; conviene revisarlas antes de un uso comercial, pese a la licencia Apache 2.0 del modelo.
- No está afiliado ni respaldado por TypeSafe (Jev) ni por Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elythros/elythros-decider-4b-exp
- Modelo hermano de 1,7B: https://huggingface.co/Elythros/elythros-decider-1.7b
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Base cuantizada 4-bit usada: https://huggingface.co/mlx-community/Qwen3-4B-4bit
- Dataset sintético de pares mínimos: https://huggingface.co/datasets/Elythros/elythros-decider-synthetic
- Paper de calibración contextual (Zhao et al., 2021): https://arxiv.org/abs/2102.09690
- Listado de modelos con la etiqueta decision-model: https://huggingface.co/models?other=decision-model

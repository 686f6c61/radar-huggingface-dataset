# clm-projects/clm-35b-a3b-w3072-dqa-head

## Resumen

CLM-35B-A3B-w3072-dqa-head es una cabeza de proyección (projection head) entrenada sobre los embeddings del modelo Qwen/Qwen3.6-35B-A3B-FP8, desarrollada por el usuario clm-projects. No es un modelo generativo completo, sino un componente de scoring que puntúa acciones dado un estado mediante similitud coseno con temperatura aprendible. Concretamente, transforma embeddings de 2048 dimensiones (pooling del último token) en representaciones de 512 dimensiones mediante dos torres paralelas (estado y acción), cada una con la arquitectura 2048 → 3072 → 3072 → 512 con activación GELU y LayerNorm.

El modelo resuelve el problema de selección de acciones en entornos de decisión: dado un estado textual, puntúa candidatos de acción para elegir el más adecuado. Se enmarca en la línea de trabajo "CLM" (contrastive decision-making), con un pipeline de tres etapas: pre-entrenamiento contrastivo sobre Diverse-QA, mid-training sobre HQ-DQA con negativos duros sintéticos, y post-entrenamiento conjunto sobre 67 almacenes de texto más 382 almacenes de refuerzo Jev.

Es relevante ahora porque propone una receta de entrenamiento contrastivo a gran escala (batch de 16.384, cientos de millones de pares) para convertir un LLM de 35B parámetros en un scorer de decisiones eficiente, con solo 34,6M de parámetros adicionales. El repositorio ocupa 0,1 GB, lo que confirma que solo contiene los pesos de la cabeza, no el modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torres de proyección MLP (2048 → 3072 → 3072 → 512, GELU, LayerNorm) sobre embeddings de Qwen3.6-35B-A3B-FP8 |
| Parametros totales | 34,6M (solo la cabeza) |
| Parametros activos | no disponible (la cabeza no es MoE; el modelo base es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (el modelo base se distribuye en FP8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0,1 GB; presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

La cabeza consta de dos torres independientes (una para estados, otra para acciones), cada una con dos capas ocultas de 3072 dimensiones y salida de 512 dimensiones, con GELU y LayerNorm. La puntuación de una acción dado un estado se calcula como el coseno de sus proyecciones escalado por una temperatura aprendible. La entrada son embeddings de 2048 dimensiones obtenidos por pooling del último token del modelo base Qwen3.6-35B-A3B-FP8.

El entrenamiento se divide en tres etapas. El pre-entrenamiento usa Nemotron-CC-v2 Diverse-QA (2.960 millones de pares pregunta/respuesta, respuestas de un solo token) durante una época con InfoNCE in-batch, batch de 16.384, lr 1e-3 y torres en bf16; alcanza top-1 de 0,945 en Diverse-QA en el paso 176.000. El mid-training añade HQ-DQA (62,45M pares) más 595M negativos duros sintéticos, con 40% de replay de Diverse-QA, logrando que el gold de HQ-DQA supere a todos sus negativos en 0,665 y manteniendo top-1 de 0,937 en Diverse-QA. El post-entrenamiento usa 67 almacenes de texto y 382 almacenes de refuerzo Jev (104,7M filas), con 20% de replay de HQ-DQA y 20% de Diverse-QA, 40.000 pasos, sin negativos duros y con negativos in-batch del propio almacén de cada fila ponderados a 1,5; obtiene pérdida de validación media de 3,98 y top-1 de 0,923 en Diverse-QA. La vista "plain" (estado sin opciones listadas) es la que se usa en post-entrenamiento; la vista con opciones puntúa 5,0.

## Capacidades

- Puntuación de acciones dado un estado textual mediante similitud coseno con temperatura aprendible.
- Selección de la mejor acción entre un conjunto de candidatos (scoring, no generación).
- Representación de estados y acciones en un espacio común de 512 dimensiones.
- Entrenamiento contrastivo con negativos in-batch y negativos duros sintéticos (en mid-training).
- Soporte de múltiples almacenes de datos (67 de texto y 382 de refuerzo Jev) en post-entrenamiento conjunto.
- Inferencia mediante `clm_train.inference.CLMScorer("hf:clm-35b-a3b-w3072")` o `scripts/score_candidates.py`.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión ni audio; el componente es exclusivamente un scorer.

## Casos de uso

- Selección de acciones en agentes basados en texto: dado un estado descrito en lenguaje natural, el scorer puntúa las acciones candidatas y permite elegir la mejor sin generar texto, reduciendo latencia frente a un LLM generativo.
- Enrutamiento de consultas: puntuar posibles rutas o intenciones para una consulta entrante y derivarla al servicio adecuado, usando el espacio de 512 dimensiones para comparar con prototipos de cada ruta.
- Recuperación y ranking: reordenar candidatos recuperados por un sistema de búsqueda puntuando la afinidad estado-acción, con la ventaja de un coste computacional muy inferior al de un cross-encoder grande.
- Evaluación de decisiones en pipelines de RL o planificación: usar el scorer como función de recompensa o de valor aproximada para seleccionar acciones en entornos simulados.
- Clasificación zero-shot de acciones: definir acciones como textos y puntuar su compatibilidad con el estado, sin reentrenar el modelo base.
- Filtrado de datos de entrenamiento: puntuar pares pregunta/respuesta para descartar los de baja calidad antes de usarlos en fine-tuning, aprovechando el entrenamiento contrastivo sobre Diverse-QA y HQ-DQA.
- Moderación o priorización de tickets: puntuar la acción de respuesta adecuada (categoría, cola, prioridad) dado el texto de un ticket.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Jev Decision Index, text public suite (36 de 37 benchmarks, vista plain) | 34,8 |
| — knowledge | 10,8 |
| — language | 45,2 |
| — retrieval | 46,0 |
| — tools | 54,9 |
| — arts | 10,6 |
| Diverse-QA top-1 (pre-training, paso 176.000) | 0,945 |
| Diverse-QA top-1 (mid-training) | 0,937 |
| HQ-DQA gold supera a todos sus negativos (mid-training) | 0,665 |
| Diverse-QA top-1 (post-training) | 0,923 |
| Pérdida de validación media de almacenes (post-training) | 3,98 |
| Vista con opciones (post-training) | 5,0 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- La cabeza en sí ocupa 0,1 GB, por lo que cabe en cualquier GPU consumer.
- El coste real está en el modelo base Qwen3.6-35B-A3B-FP8, que debe ejecutarse para extraer embeddings de 2048 dimensiones.
- VRAM estimada para el modelo base en FP8: no disponible en la información proporcionada; depende del despliegue del MoE de 35B parámetros.
- GPU recomendadas para el modelo base: no disponible; para la cabeza, cualquier GPU es suficiente.
- Opciones de despliegue: `clm_train.inference.CLMScorer` y `scripts/score_candidates.py`; no se documentan vLLM, llama.cpp, Ollama ni TGI para la cabeza.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables de la misma categoría (scorers contrastivos sobre embeddings de LLM) en la información disponible.

## Limitaciones y advertencias

- Es una cabeza de scoring, no un modelo generativo: no produce texto ni responde preguntas por sí misma.
- Requiere el modelo base Qwen3.6-35B-A3B-FP8 para generar los embeddings de entrada; sin él no es funcional.
- El índice Jev muestra un rendimiento bajo en conocimiento (10,8) y artes (10,6), lo que sugiere poca competencia en dominios que requieren conocimiento factual o creatividad.
- La vista "plain" (sin opciones listadas) es la que se entrenó en post-entrenamiento; usar la vista con opciones degrada la puntuación (5,0 frente a 34,8).
- El post-entrenamiento no usa negativos duros, lo que puede limitar la discriminación fina entre acciones muy similares.
- No se documentan sesgos conocidos, idiomas soportados ni riesgos de alucinación específicos; al ser un scorer, el riesgo de alucinación se traslada al modelo base que genera los embeddings.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.6-35B-A3B-FP8.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación externa.
- No se especifican limitaciones de contexto ni de idioma; se heredan las del modelo base, no documentadas aquí.

## Enlaces

- HuggingFace: https://huggingface.co/clm-projects/clm-35b-a3b-w3072-dqa-head
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- Dataset de embeddings pre-entrenamiento: https://huggingface.co/datasets/clm-projects/nemotron-cc-v2-diverse-qa-qwen3.6-35b-a3b-fp8-embeddings
- Repositorio de entrenamiento: https://github.com/jackyk02/clm_train
- Script de entrenamiento: `scripts/e2e_text_head.sh` (en el repositorio clm_train)
- Script de inferencia: `scripts/score_candidates.py` (en el repositorio clm_train)
- Informe de benchmarks: `jev_text_report.md` (en el repositorio del modelo)

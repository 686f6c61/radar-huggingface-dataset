# norip76/decider-rag-checkpoints

## Resumen

Decider-RAG checkpoints es una colección de adaptadores LoRA y cabezas de clasificación entrenados sobre el modelo base Qwen/Qwen3-4B para implementar el sistema descrito en el trabajo "Decider-RAG: Learning to Plan Before Generating in Edge–Cloud Retrieval-Augmented Generation". El modelo no genera texto de forma autónoma: actúa como un planificador que, dada una pregunta y las evidencias recuperadas, predice la calidad esperada de tres planes de ejecución distintos (respuesta en el edge, respuesta directa en la nube y razonamiento en la nube) y decide cuál usar según umbrales calibrados en validación.

El problema que resuelve es el enrutamiento eficiente en pipelines RAG desplegados en arquitecturas edge-cloud: en lugar de invocar siempre el plan más caro (razonamiento en la nube), el Decider estima los beneficios marginales de escalar y solo lo hace cuando la ganancia predicha supera un umbral. Esto permite reducir llamadas costosas a la nube manteniendo la calidad de respuesta. La relevancia actual está en la optimización de costes y latencia de sistemas RAG en producción, un área activa tanto en investigación como en ingeniería.

Técnicamente, cada checkpoint contiene pesos LoRA (r=16, alpha=32 sobre las proyecciones de atención) más una cabeza MLP específica (best.pt, ~51 MB) que se aplica sobre el estado oculto del último token del backbone Qwen3-4B. El repositorio ocupa 0,3 GB e incluye cinco checkpoints entrenados sobre distintas combinaciones de HotpotQA, MuSiQue y 2WikiMultiHopQA. La licencia es MIT para los ficheros del repositorio, mientras que el modelo base Qwen3-4B se distribuye bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Qwen/Qwen3-4B) + cabeza MLP Linear(2560,512)-GELU-Linear(512,5) |
| Parametros totales | no disponible (depende del backbone Qwen3-4B, ~4B; los adaptadores LoRA y la cabeza suman ~51 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | evidencias truncadas a 6.144 tokens; respuesta candidata (Decider-Post) hasta 512 tokens |
| Tipos de cuantizacion | no disponible (entrenado y evaluado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | MIT (ficheros del repositorio); modelo base Qwen3-4B bajo Apache-2.0 |
| Formato de pesos | LoRA (PEFT) + best.pt (cabeza MLP); exportable a vLLM tras fusionar LoRA |

## Arquitectura y entrenamiento

El sistema se compone de un backbone Qwen/Qwen3-4B (revisión `1cfa9a7208912126459214e8b04321603b3df60c`) en bf16, sobre el que se aplican adaptadores LoRA con r=16 y alpha=32 en las proyecciones `q_proj, k_proj, v_proj, o_proj`. Sobre el estado oculto del último token se aplica una cabeza MLP con dos capas (Linear(2560,512) – GELU – Linear(512,5)) que produce cinco salidas en orden: `fE, fN, fT, dEN, dNT`, correspondientes a la F1 predicha de los planes edge, nube directa y razonamiento en la nube, más las ganancias `fN − fE` y `fT − fN`. Las dos ganancias son salidas de regresión independientes entrenadas sobre sus propios objetivos, no se calculan restando las salidas de calidad, y las políticas utilizan exclusivamente las ganancias.

La entrada al modelo es la pregunta, la evidencia podada (truncada a 6.144 tokens) y el número de pasajes retenidos, construida mediante `decider.build_text`. La variante Decider-Post añade además la respuesta candidata (máximo 512 tokens) mediante `decider.build_post_text`. Los cinco checkpoints se entrenaron sobre distintas combinaciones de datos: HotpotQA (5.800 preguntas), HotpotQA + MuSiQue (3.800) y HotpotQA + MuSiQue + 2Wiki (5.800). Una respuesta de razonamiento truncada en el límite de tokens tiene objetivo de entrenamiento 0, de modo que `fT` predice la calidad de la llamada de razonamiento en sí, no la calidad final tras el plan de recuperación. No se detalla en la información disponible el número total de tokens de entrenamiento ni la composición completa del dataset más allá de los conjuntos de preguntas citados.

Las políticas calibradas en validación se almacenan en cada `config.json`. El Decider escala a la nube si `dEN > t_EN` y a razonamiento si además `dNT > t_NT`; HotpotQA usa solo E o N (`t_NT = inf`) y MuSiQue siempre usa la nube (`t_EN = -inf`). Decider-Post genera primero el candidato y escala después si la ganancia predicha supera el umbral. El modelo de 2Wiki se evalúa offline bajo un controlador con presupuesto equiparable (`online_cmp.py`), por lo que no tiene umbral fijo en vivo. Los checkpoints `decider-hotpotqa` y `decider-musique` incluyen dos conjuntos de umbrales en `policy_profiles`: `tables_II_III` (política por defecto) y `table_IV`, recalibrado en validación para la comparación con Decider-Post.

## Capacidades

- Predicción de calidad de planes RAG: estima la F1 esperada de tres planes de ejecución (edge, nube directa, razonamiento en la nube) a partir de la pregunta y la evidencia recuperada.
- Enrutamiento con umbrales calibrados: decide entre E, N y T según ganancias predichas y umbrales validados, permitiendo políticas distintas por conjunto de datos.
- Enrutamiento post-generación (Decider-Post): evalúa una respuesta candidata ya generada y decide si escalar a un plan superior.
- Soporte de dos perfiles de umbrales por checkpoint (`tables_II_III` y `table_IV`) para reproducir distintas tablas del paper.
- Despliegue en vLLM mediante pooling runner: fusión de LoRA en el backbone con `export_decider_vllm.py`, servicio con `--runner pooling --convert embed` y aplicación de la cabeza sobre el estado oculto devuelto.
- No es un modelo generativo: no produce respuestas de texto, solo puntuaciones y decisiones de plan.
- Capacidades multilingües: no disponible.

## Casos de uso

- Enrutamiento en pipelines RAG edge-cloud: el modelo recibe la pregunta y la evidencia recuperada y decide si responder en el edge, en la nube directamente o con razonamiento en la nube, reduciendo llamadas costosas cuando la ganancia predicha no supera el umbral. Es adecuado porque su salida son ganancias calibradas, no una clasificación genérica.
- Optimización de costes en asistentes documentales: en un sistema con presupuesto limitado de llamadas a modelos grandes, el Decider permite escalar solo cuando `dEN` o `dNT` superan los umbrales, manteniendo la calidad en preguntas multi-hop.
- Control de calidad post-generación: con Decider-Post, se genera primero una respuesta barata y el modelo decide si escalar a la nube o a razonamiento, útil en pipelines donde la latencia de la primera respuesta importa.
- Evaluación offline de políticas de enrutamiento: el checkpoint de 2Wiki permite evaluar políticas bajo un controlador con presupuesto equiparable (`online_cmp.py`), útil para comparar estrategias sin desplegar en vivo.
- Investigación en planificación RAG: los checkpoints reproducen las tablas II, III, IV y VI del paper, permitiendo replicar experimentos de enrutamiento con distintas combinaciones de datasets.
- Despliegue en infraestructura vLLM existente: al exportarse como modelo con pooling runner, puede integrarse en un servicio vLLM ya operativo aplicando la cabeza sobre el estado oculto, sin un runtime adicional específico.
- Sistemas multi-hop con evidencia larga: el truncado a 6.144 tokens de evidencia permite manejar preguntas que requieren múltiples pasajes, como en HotpotQA y MuSiQue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia las tablas II, III, IV y VI del paper y los generadores de tablas y figuras en el repositorio de código, pero no incluye los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el backbone Qwen3-4B en bf16 requiere aproximadamente 8 GB de VRAM para los pesos, más overhead de activaciones y de la cabeza MLP (~51 MB).
- GPU recomendadas: el smoke test se validó en una sola GPU con torch 2.12.1, transformers 4.56.0 y peft 0.15.2; no se especifica el modelo de GPU.
- Cabe en GPU consumer: previsiblemente sí en GPUs con 12-16 GB o más en bf16, aunque no se confirma en la información disponible.
- Opciones de despliegue: vLLM 0.30.0 con pooling runner (`--runner pooling --convert embed --pooler-config '{"pooling_type":"LAST","use_activation":false}'`), fusionando la LoRA con `export_decider_vllm.py` y aplicando `head.pt` sobre el estado oculto. También es posible cargar con transformers + peft para inferencia directa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decider-RAG (este) | LoRA sobre Qwen3-4B + cabeza MLP | 6.144 tokens de evidencia | Enrutamiento de planes RAG | MIT (repo) / Apache-2.0 (base) | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B | ~4B | no disponible en esta ficha | Generación de texto general | Apache-2.0 | Hugging Face |
| Modelos de enrutamiento RAG genéricos | no disponible | no disponible | Enrutamiento | no disponible | no disponible |

No se dispone de información sobre modelos comparables específicos de enrutamiento RAG con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo generativo: no produce respuestas, solo puntuaciones de calidad y decisiones de plan; requiere un pipeline externo que ejecute los planes E, N y T.
- Dependencia del backbone: requiere descargar Qwen/Qwen3-4B por separado y respetar su licencia Apache-2.0, además de la MIT de los ficheros del repositorio.
- Umbrales específicos por dataset: las políticas calibradas dependen del conjunto de validación; el checkpoint de 2Wiki no tiene umbral fijo en vivo y se evalúa offline bajo un controlador con presupuesto equiparable.
- Truncado de evidencia a 6.144 tokens: preguntas que requieran más evidencia pueden degradar la predicción de ganancias.
- Respuestas de razonamiento truncadas en el límite de tokens tienen objetivo 0, lo que afecta a la interpretación de `fT`.
- Idiomas soportados no disponibles: no se confirma el comportamiento multilingüe más allá del que herede Qwen3-4B.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.
- Riesgo de alucinación: no aplica directamente al no generar texto, pero las predicciones de F1 pueden estar mal calibradas fuera de la distribución de los datasets de entrenamiento.
- Sesgos: no disponible en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/norip76/decider-rag-checkpoints
- Repositorio de código, datos de resultados y generadores de tablas y figuras: https://github.com/JeonghwaLee/decider-rag
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B

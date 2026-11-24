# minimodels-ai/decision-1-reward

## Resumen

minimodels-ai/decision-1-reward es un modelo de recompensa y decisión de pesos abiertos desarrollado por minimodels-ai. Con 31.273.088.876 parámetros (aproximadamente 31,3 mil millones) y un tamaño de repositorio de 19,4 GB, está diseñado para evaluar la calidad de respuestas generadas por otros modelos, emitiendo una puntuación escalar de recompensa o seleccionando entre opciones emparejadas. Se publica bajo licencia Apache 2.0 y se distribuye en formato safetensors con código personalizado (`trust_remote_code`).

El modelo cubre dos modos operativos: por un lado, actúa como clasificador de secuencias (`AutoModelForSequenceClassification`) para evaluación de recompensa escalar sin generación de tokens, compatible con el flujo `run_v2.py` de allenai/reward-bench. Por otro, funciona como modelo causal (`AutoModelForCausalLM`) para una selección pareada con rechazo selectivo y razonamiento en cadena mediante un `Scratchpad:`, integrable en el flujo `run_generative_v2.py`.

Su relevancia radica en que ofrece una alternativa abierta y calibrada para tareas de alineamiento y evaluación automática (reward modeling), con divulgación explícita de datos de entrenamiento y verificación de descontaminación frente a los conjuntos de evaluación RewardBench 2, RewardBench y CoCoNot. No obstante, la información pública disponible es limitada: no se detallan resultados de benchmarks, idiomas soportados ni la arquitectura interna más allá de la etiqueta `gemma4`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta `gemma4` en los tags; detalles internos no publicados) |
| Parametros totales | 31.273.088.876 (~31,3 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (los scripts de evaluación usan `max_length 8192`, pero no se confirma como contexto nativo) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; la model card usa `torch_dtype=torch.bfloat16`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La model card no describe en detalle la arquitectura interna. Los tags incluyen `gemma4`, lo que sugiere una base derivada de la familia Gemma, pero no se confirma la estructura exacta (transformer denso, número de capas, atención, etc.). El modelo expone dos cabeceras funcionales: clasificación de secuencias para recompensa escalar y generación causal para razonamiento en cadena con `Scratchpad:`.

El ajuste se realizó mediante fine-tuning de preferencias sobre 640 pares (590 de preferencia y 50 empates de igual calidad). Los datos provienen exclusivamente de las particiones `train` de Skywork/Skywork-Reward-Preference-80K-v0.2 y nvidia/HelpSteer2. Se aplicó un filtrado de descontaminación mediante comprobaciones de SHA-256 exacto, prefijo alfanumérico de 50 caracteres y solapamiento de 5-gramas, con cero solapamiento declarado frente a allenai/reward-bench-2, allenai/reward-bench y allenai/coconot. No se mencionan detalles sobre RLHF, DPO ni el número total de tokens de entrenamiento.

## Capacidades

- Evaluación de recompensa escalar: emite una puntuación de calidad para un par prompt-respuesta sin generar tokens, mediante `AutoModelForSequenceClassification`.
- Selección pareada de opciones: compara dos respuestas candidatas y selecciona la preferida, con rechazo selectivo y umbral configurable (`runoff_tau`).
- Razonamiento en cadena de pensamiento: modo generativo con `Scratchpad:` para justificar la decisión antes de emitir el veredicto.
- Clasificación de texto: pipeline declarado `text-classification`.
- Integración con RewardBench 2: compatible con los scripts `run_v2.py` y `run_generative_v2.py` de allenai/reward-bench.
- Soporte de plantilla de chat: `apply_chat_template` para formatear conversaciones multi-turno.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Evaluación automática de respuestas en pipelines de RLHF: el modelo puntúa respuestas candidatas de forma escalar, lo que permite clasificar y filtrar salidas de modelos generadores antes de la selección final en un bucle de alineamiento.
- Selección de la mejor respuesta en sistemas de chat: dado un prompt y dos respuestas, el modo pareado elige la preferida, útil como juez automático en entornos donde no hay anotadores humanos disponibles.
- Filtrado de datos de entrenamiento: la puntuación de recompensa permite descartar completaciones de baja calidad en conjuntos de instrucciones antes de usarlas para fine-tuning.
- Verificación de calidad en producción: integrado como clasificador, puede puntuar respuestas de un modelo desplegado y activar alertas cuando la recompensa cae por debajo de un umbral.
- Investigación en reward modeling: al ser de pesos abiertos y con divulgación de datos, sirve para reproducir experimentos de RewardBench 2 y comparar metodologías de evaluación.
- Razonamiento justificado en decisiones: el modo generativo con `Scratchpad:` permite auditar por qué el modelo prefiere una respuesta, útil en entornos donde se exige trazabilidad de la decisión.
- Benchmarking interno de modelos: como juez automático en evaluaciones comparativas entre versiones de un mismo modelo, reduciendo el coste de evaluación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe los comandos para ejecutar RewardBench 2, pero no incluye las puntuaciones obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31,3 mil millones de parámetros en bfloat16 se requieren aproximadamente 62-63 GB solo para los pesos, más memoria para activaciones y caché. En cuantización de 8 bits, en torno a 31-32 GB; en 4 bits, alrededor de 16-17 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para bfloat16 sin cuantizar. Para cuantización de 4 bits, una RTX 4090 (24 GB) podría ser suficiente, aunque no está confirmado por el autor.
- Cabe en consumer GPU: posiblemente en RTX 4090 o GPUs con 24 GB o más si se cuantiza a 4 bits; en bfloat16 no cabe en GPUs de consumo.
- Opciones de despliegue: transformers con `trust_remote_code=True` (soporte oficial documentado). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI; el código personalizado puede limitar su uso en estos motores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| minimodels-ai/decision-1-reward | ~31,3 mil M | No disponible | Apache 2.0 | safetensors + código custom | Reward model con modos clasificador y generativo |
| Skywork/Skywork-Reward-Preference-80K-v0.2 | No disponible en esta ficha | No disponible | No disponible | No disponible | Fuente de datos de preferencia citada por el autor |
| nvidia/HelpSteer2 | No disponible en esta ficha | No disponible | No disponible | No disponible | Fuente de datos de preferencia citada por el autor |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. Las alternativas citadas son las fuentes de datos de entrenamiento, no necesariamente modelos de recompensa comparables en tamaño y arquitectura.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. Al entrenarse sobre Skywork-Reward-Preference-80K-v0.2 y HelpSteer2, puede heredar sesgos presentes en esos conjuntos.
- Riesgo de alucinación: en el modo generativo con `Scratchpad:`, el razonamiento producido puede no reflejar el criterio real de decisión; conviene validar las justificaciones de forma independiente.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni longitud de contexto nativa; los scripts de evaluación usan `max_length 8192`, pero no se confirma como límite del modelo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar dicho código antes de desplegarlo en producción.
- Código personalizado: la dependencia de código no estándar puede dificultar la integración con motores de inferencia habituales (vLLM, TGI, llama.cpp) y complicar el mantenimiento.
- Datos de entrenamiento limitados: solo 640 pares de preferencia, un volumen reducido que puede limitar la generalización frente a reward models entrenados con decenas de miles de pares.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa del rendimiento en RewardBench 2 pese a que la model card detalla cómo ejecutarlo.
- Madurez: modelo con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria conocida.

## Enlaces

- Hugging Face: https://huggingface.co/minimodels-ai/decision-1-reward
- Repositorio RewardBench (allenai): https://github.com/allenai/reward-bench
- Dataset RewardBench 2: https://huggingface.co/datasets/allenai/reward-bench-2
- Dataset RewardBench: https://huggingface.co/datasets/allenai/reward-bench
- Dataset CoCoNot: https://huggingface.co/datasets/allenai/coconot
- Dataset Skywork-Reward-Preference-80K-v0.2: https://huggingface.co/datasets/Skywork/Skywork-Reward-Preference-80K-v0.2
- Dataset HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2

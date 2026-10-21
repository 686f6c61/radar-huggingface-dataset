# Hualin3/ate-reward-qwen3-8b-grpo-20261020

## Resumen

`ate-reward-qwen3-8b-grpo-20261020` es un adaptador LoRA de rango 8 publicado por Hualin3 sobre el modelo de recompensa `Skywork/Skywork-Reward-V2-Qwen3-8B`. No es un modelo generativo: produce una recompensa escalar bruta para un par prompt-respuesta, pensada para puntuar candidatos, filtrar datos de preferencia o integrarse en pipelines de RLHF/RLVR. El adaptador se distribuye como artefacto PEFT separado; no incluye los pesos completos del modelo base de 8B.

El autor lo presenta como un experimento reproducible, no como un modelo de referencia. En su propia evaluacion sobre RewardBench 2, el adaptador obtiene una media de seis categorias de 78,14646 frente a 78,25898 del base sin modificar en el mismo entorno, por lo que no supera al modelo original. La relevancia es metodologica: publica pesos, protocolo de evaluacion y resultados negativos de una receta de optimizacion con recompensas relativas de grupo, LoRA y una cabeza de puntuacion entrenable.

La evaluacion cubre 1.865 prompts y 8.977 respuestas candidatas, con BF16, SDPA, batch 4 y longitud maxima de 8192 tokens, sin truncamientos. El adaptador se libera bajo Apache-2.0, pero su uso en produccion requiere validacion propia porque no hay garantia de mejora, no se documentan idiomas y no se han publicado latencias ni pruebas de cuantizacion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 8 sobre `Skywork/Skywork-Reward-V2-Qwen3-8B`, con cabeza de puntuacion entrenable. No se detalla la arquitectura interna del base en la informacion proporcionada. |
| Parametros totales | 8B en el modelo base; el adaptador LoRA no publica su recuento exacto de parametros. |
| Parametros activos | No aplica; no es un modelo MoE. |
| Longitud de contexto | 8192 tokens como maximo en la evaluacion publicada (`max_length=8192`); el contexto nativo del base no se especifica en la informacion disponible. |
| Tipos de cuantizacion | No disponible; la evaluacion se realizo en BF16 y no se validan 4-bit ni 8-bit. |
| Idiomas soportados | No disponibles. |
| Licencia | Apache-2.0. |
| Formato de pesos | `safetensors`; adaptador PEFT LoRA. No incluye los pesos completos del modelo base. |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Skywork-Reward-V2-Qwen3-8B`, un modelo de recompensa de 8B. La receta publicada utiliza LoRA de rango 8 sobre las proyecciones query/value, una cabeza de puntuacion entrenable y una seleccion de preferencias online con contextual bandit de un solo paso, recompensas relativas de grupo, KL de referencia y un termino de consistencia de equivalencia verificada. El autor indica explicitamente que no es DPO ni RL generativo de agente de horizonte largo. La cabeza de puntuacion se almaceno y entreno en BF16.

Los datos proceden de preferencias humanas de NVIDIA/Scale AI HelpSteer2 (CC-BY-4.0), de la mezcla de preferencias de Ai2 Tulu 3 (ODC-BY) y de preferencias sinteticas de aritmetica y transformaciones JSON generadas y verificadas mecanicamente. Se prepararon prompts de entrenamiento y desarrollo disjuntos, se excluyeron solapamientos exactos y de 8-gramas con los prompts de benchmark, y no se usaron etiquetas de benchmark para actualizaciones de gradiente ni para seleccion de checkpoint. El autor ejecuto dos recetas exploratorias con 500 actualizaciones de optimizador en total; los pesos liberados corresponden al paso 200 de la primera receta, no a una ejecucion fusionada de 500 pasos. La exposicion del base a preentrenamiento y ajustes previos no puede auditarse de forma independiente.

## Capacidades

- Puntuacion de recompensa escalar bruta para pares prompt-respuesta; no genera texto de asistente.
- Evaluacion pointwise con agregacion oficial best-of-four y puntuacion Ties de RewardBench 2.
- Ranking de respuestas candidatas mediante comparacion de recompensas, util para best-of-N o reranking.
- Integracion como funcion de recompensa en pipelines de RLHF/RLVR, con la salvedad de que el autor no lo presenta como sustituto de DPO.
- Pipeline de `text-classification` en Hugging Face, aunque la salida real es una puntuacion escalar, no una etiqueta discreta.
- Soporte de plantilla de chat original del tokenizer para construir las entradas.
- No se documentan tool calling, function calling, uso como agente, razonamiento multi-paso generativo, vision, audio ni modo thinking.
- No se documenta cobertura multilingue; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Best-of-N en generacion: generar varias respuestas con un LLM y seleccionar la de mayor recompensa con este adaptador. Es adecuado porque devuelve una puntuacion comparable entre candidatos, aunque el autor advierte que no supera al base en RewardBench 2.
- Filtrado de datasets de preferencia: puntuar pares respuesta-prompt y descartar ejemplos con recompensas bajas o inconsistentes antes de entrenar un modelo de preferencias. Encaja con el uso previsto de HelpSteer2 y Tulu 3, pero requiere auditoria de sesgos y de calidad de las anotaciones.
- RLHF/RLVR con recompensa aprendida: usar el adaptador como reward function en un bucle de optimizacion con KL de referencia para evitar desviaciones excesivas. Es experimental y no sustituye a una evaluacion humana independiente.
- Evaluacion comparativa de checkpoints: reproducir el protocolo RewardBench 2 con las mismas 1.865 prompts y 8.977 respuestas para comparar variantes de un asistente. El repositorio incluye puntuaciones nativas y metadatos del protocolo en `evaluation/`.
- Priorizacion de revision humana: puntuar respuestas generadas y enviar a revision las de menor recompensa, reduciendo el volumen de revision manual en anotacion o control de calidad.
- Investigacion reproducible sobre recetas LoRA/GRPO: utilizar el paso 200 como baseline publico para comparar variantes de entrenamiento, seleccion de datos y regularizacion. Es util precisamente porque el autor publica un resultado negativo y el protocolo completo.
- Analisis de sensibilidad a instrucciones precisas: medir la puntuacion en la categoria Precise IF, donde el adaptador y el base obtienen 49,06250, para detectar dificultades en el seguimiento estricto de instrucciones.

## Benchmarks y rendimiento

Evaluacion publicada sobre RewardBench 2 (`allenai/reward-bench-2`, revision `7ff08853b0d5686e79b13fda8677024f566a104a`), con 1.865 prompts y 8.977 respuestas candidatas, BF16, SDPA, batch 4, `max_length=8192` y cero truncamientos. Se usaron recompensas escalares pointwise, agregacion oficial best-of-four y puntuacion Ties. El scorer de Ai2 se uso sin modificar en el commit `59f6ff7005a9f9484727ca27f5383420875e5dbf`.

| Categoria | Base sin cambios | Adaptador | Diferencia |
|---|---:|---:|---:|
| Factuality | 80,21053 | 80,52632 | +0,31579 |
| Precise IF | 49,06250 | 49,06250 | 0,00000 |
| Math | 76,77596 | 76,77596 | 0,00000 |
| Safety | 94,00000 | 94,00000 | 0,00000 |
| Focus | 96,56566 | 96,36364 | -0,20202 |
| Ties | 72,93925 | 72,15036 | -0,78889 |
| **Media de seis categorias** | **78,25898** | **78,14646** | **-0,11252** |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos en la informacion disponible; no son directamente aplicables a un modelo de recompensa. El autor no reclama posicion oficial en ningun leaderboard.

## Requisitos de hardware

- El repositorio contiene solo el adaptador y el tokenizer; es necesario descargar y cargar el base `Skywork/Skywork-Reward-V2-Qwen3-8B` con Transformers y PEFT.
- En BF16, los pesos del base de 8B ocupan aproximadamente 16 GB; hay que anadir activaciones y memoria del contexto. El autor uso una A100-SXM4-80GB con batch 4 y longitud maxima 8192, pero no publica VRAM pico ni latencia.
- Una RTX 4090 de 24 GB podria alojar un 8B en BF16 en teoria, pero no hay validacion publicada con este adaptador. Tarjetas de 16 GB requeririan cuantizacion, que no ha sido evaluada y puede afectar a la cabeza de puntuacion.
- GPU de datacenter como A100 40GB/80GB o H100 son opciones razonables para BF16, pero no estan validadas por el autor mas alla de la A100-SXM4-80GB mencionada.
- Despliegue documentado: Transformers + PEFT, con `inference.py` y `requirements-inference.txt`. No se documentan vLLM, TGI, llama.cpp ni Ollama para este adaptador.
- Cargador recomendado: usar el flujo explicito de dos etapas `PeftModel.from_pretrained(base, adapter_id)`. En la prueba del autor con Transformers 5.17.0, cargar el adaptador directamente con `AutoModelForSequenceClassification.from_pretrained(adapter_id)` no restauraba correctamente la cabeza `score.weight`.
- No hay datos publicados de throughput, latencia por peticion ni coste por token; el autor indica que no reclama latencias especificas de hardware dedicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | RewardBench 2, media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hualin3/ate-reward-qwen3-8b-grpo-20261020` | 8B base + LoRA rango 8 | 8192 en evaluacion | 78,14646 | Apache-2.0 | Hugging Face, adaptador PEFT |
| `Skywork/Skywork-Reward-V2-Qwen3-8B` | 8B | 8192 en evaluacion | 78,25898 | Apache-2.0 | Hugging Face, pesos completos |
| Otras alternativas de recompensa de ~8B | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

La comparacion directa disponible es principalmente con el base: el adaptador mejora ligeramente Factuality (+0,31579), empata en Precise IF, Math y Safety, y empeora en Focus (-0,20202) y Ties (-0,78889). No se dispone de datos verificables de otros reward models comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no supera a su base en la evaluacion publicada: la media de seis categorias baja de 78,25898 a 78,14646. No debe presentarse como una mejora de estado del arte.
- Es un experimento; el autor no reclama posicion oficial en leaderboards y la evaluacion la realizo el propio mantenedor. No es una validacion independiente.
- Precise IF se queda en 49,06250, un valor bajo que sugiere dificultades para discriminar el cumplimiento estricto de instrucciones.
- Solo se distribuye el adaptador, no los pesos completos. Sin el base inmutable no se puede ejecutar.
- Existe un problema documentado de compatibilidad al cargar el adaptador directamente con `AutoModelForSequenceClassification`; hay que usar el flujo de dos etapas con PEFT y no ignorar los avisos sobre `score.weight`.
- La evaluacion se hizo en BF16. No se ha validado el comportamiento con cuantizacion 4-bit u 8-bit, ni con otros backends de inferencia.
- No se documentan idiomas soportados; no debe asumirse un rendimiento multilingue equivalente al de un LLM generativo.
- No es un modelo generativo: no produce texto, no hace tool calling, no actua como agente y no tiene modo thinking. Su salida es una recompensa escalar.
- Puede asignar recompensas alt

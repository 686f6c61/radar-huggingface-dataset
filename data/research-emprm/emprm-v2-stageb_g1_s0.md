# RESEARCH-EMPRM/emprm-v2-stageB_g1_s0

## Resumen

EM-PRM v2 `stageB_g1_s0` es un adaptador LoRA de tipo process reward model (PRM) entrenado sobre el modelo multimodal Qwen/Qwen3-VL-8B-Instruct (snapshot `0c351dd`). Lo publica el grupo RESEARCH-EMPRM dentro de la escalera de experimentos EM-PRM v2 (*EM-PRM: Evidence-Mediated Process Rewards for Robust Multimodal Reasoning*), cuyo objetivo es puntuar cadenas de razonamiento multimodal paso a paso, con especial atencion al razonamiento sobre graficos, verificando si cada paso esta respaldado por evidencia visual y textual.

El adaptador corresponde al brazo EM-PRM-G1 (variante de "broad-ranker" con exposicion baja a graficos) y forma parte de una ablacion sistematica: se inicializa desde `a2_support_s0`, usa rank 64 y alpha 128 sobre los modulos de proyeccion del transformer, con el vision tower congelado. El entrenamiento consumio 2.500 pasos de optimizador durante 10,2 horas en una unica NVIDIA A100-PCIE-40GB, sobre 20.000 registros de tarea y 24.199 registros de pares.

Su relevancia es principalmente metodologica y de diagnostico, no de produccion: el autor lo marca explicitamente como **descartado como candidato de despliegue** porque no supero la puerta pre-registrada de FlipAcc relacional (0,2988 desplegado y 0,2300 con el grafico visible, frente al umbral exigido de 0,74). Aun asi, el run se conserva sin modificar y sus numeros se publican como diagnostico, lo que lo convierte en un artefacto util para investigadores que estudien el comportamiento de PRM multimodales bajo condiciones controladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen/Qwen3-VL-8B-Instruct; vision tower congelado |
| Parametros totales | ~8.000 millones en el modelo base + 174.587.904 parametros entrenables en el adaptador |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct (snapshot `0c351dd`) |
| Rango LoRA / alpha / dropout | 64 / 128 / 0.05 |
| Modulos objetivo | `down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj`, `v_proj` |
| Precision de entrenamiento | bfloat16 |
| Tamano del repositorio | 0,7 GB |
| Libreria | peft |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rank 64 y alpha 128 con dropout 0,05, aplicado sobre las proyecciones de atencion y MLP del modelo base Qwen3-VL-8B-Instruct. El vision tower permanece congelado durante todo el entrenamiento, de modo que la adaptacion se concentra en el decodificador de lenguaje y en la integracion de la informacion visual ya codificada. Se inicializa desde el adaptador `RESEARCH-EMPRM/emprm-v2-a2_support_s0` y se entrena en bfloat16 con learning rate 5e-05, micro-batch 2 con acumulacion de gradiente 4, una sola epoca y 2.500 pasos de optimizador sobre 20.000 registros de tarea.

La innovacion del planteamiento EM-PRM es el uso de recompensas de proceso mediadas por evidencia: ademas de los registros de tarea, se anaden 24.199 registros de pares (8.353 + 15.846 en este brazo, con los pares de graficos vistos una sola vez, 9.995 micro-lotes de pares) con `lambda_pair` 1.0 y `pair_sees_image` activado. El objetivo de pares entrena al modelo para preferir la evidencia correcta frente a la incorrecta en el razonamiento; la precision de pares de entrenamiento paso de una media de 0,879 a 0,935 al final. El entrenamiento completo consumio 10,2 horas en una A100-PCIE-40GB, en el commit `4438aea`. El scorer asociado (`scoring.Scorer.score_grounded`, familia *grounded*, agregacion por producto) y sus prompts se distribuyen en el directorio `code/` del dataset de sincronizacion, no en este repositorio.

## Capacidades

- Puntuacion de cadenas de razonamiento: actua como process reward model, evaluando la validez de pasos intermedios y no solo de la respuesta final.
- Razonamiento multimodal: procesa imagen y texto de forma conjunta a traves del modelo base Qwen3-VL-8B-Instruct.
- Aceptacion de evidencia forzada: con umbral 0,5 alcanza 0,9175 de aceptacion de evidencia verdadera y 0,0075 de aceptacion de evidencia falsa (0,970 / 0,005 con el grafico visible), es decir, es muy conservador a la hora de dar por buena una evidencia.
- Ranking de pares de soluciones: la ganancia de pares disjunta de graficos frente al head v1 es de +0,1685 desplegado y +0,1815 con el grafico visible, la mayor ganancia de pares medida en la escalera.
- Razonamiento sobre graficos: capacidad objetivo del brazo, aunque el rendimiento medido es bajo (FlipAcc 0,23-0,30).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no se documenta soporte especifico; el modelo puntua trazas, no ejecuta acciones.
- Capacidades multilingues: no disponible.
- Modo *thinking* explicito, vision o audio mas alla del modelo base: no disponible.

## Casos de uso

- Reranking de trazas de razonamiento multimodal en investigacion: el scorer `score_grounded` con agregacion por producto permite puntuar varias soluciones candidatas para un mismo problema con imagen y seleccionar la mejor; es el uso previsto del artefacto, aunque con las reservas de rendimiento indicadas.
- Filtrado de datos sinteticos para destilacion de chain-of-thought: el sesgo conservador en aceptacion de evidencia (0,0075 de falsos positivos desplegado) lo hace util como filtro de alta precision para descartar pasos no respaldados por la evidencia, priorizando pureza sobre cobertura.
- Investigacion en reward modeling para RL: sirve como componente de recompensa de proceso en pipelines de RLVR/RLHF multimodal, comparando su senal con la de otros brazos de la escalera EM-PRM.
- Reproduccion de ablaciones controladas: al conservarse el run fallido sin modificar, se puede reproducir la comparacion entre exposicion a graficos, semillas e inicializaciones dentro de EM-PRM v2.
- Auditoria de pipelines de razonamiento visual: evaluar si un sistema de VQA o chart QA produce pasos justificados por la imagen, usando la tasa de aceptacion de evidencia como metrica de groundedness.
- Verificacion de respuestas en dominios sensibles: en escenarios donde un falso positivo es costoso, el umbral de aceptacion se puede ajustar para no dar por valida una evidencia no sustentada.
- Analisis de fallos en razonamiento relacional: el FlipAcc de 0,2300-0,2988 documenta que el modelo no mantiene relaciones cuando se le muestra el grafico, lo que resulta util como caso de estudio negativo sobre el efecto de la evidencia visual en PRM.

## Benchmarks y rendimiento

Resultados publicados por el autor en las mitades de desarrollo (las mitades de test no se leyeron). No hay comparacion con MMLU, HumanEval o GSM8K en la informacion disponible.

| Evaluacion | Pase desplegado | Con el grafico visible |
|---|---|---|
| FlipAcc relacional retenido (puerta >= 0,74) | 0,2988 | 0,2300 [0,2013, 0,2587] |
| Aceptacion de evidencia forzada a 0,5 — verdadera | 0,9175 | 0,970 |
| Aceptacion de evidencia forzada a 0,5 — falsa | 0,0075 | 0,005 |
| Ganancia de pares disjunta de graficos frente al head v1 | +0,1685 | +0,1815 [0,1387, 0,2244] |
| VisualProcessBench | 0,3025 | no disponible |
| VLRMBench | 0,3098 | no disponible |
| VL-RewardBench | 0,4810 | no disponible |
| Multimodal RewardBench | 0,5435 | no disponible |
| Precision de pares de entrenamiento (media / final) | 0,879 / 0,935 | no aplica |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de ~8.000 millones de parametros en bfloat16 requiere del orden de 16-17 GB solo para pesos, mas overhead de activaciones y cache KV; el adaptador anade una fraccion marginal (0,7 GB en disco). Estimacion, no dato publicado.
- Cuantizacion: no se documentan tipos de cuantizacion para este adaptador; el repositorio solo distribuye pesos safetensors en formato PEFT.
- GPU recomendadas: el entrenamiento se realizo en una unica NVIDIA A100-PCIE-40GB con 10,2 horas de pared; para inferencia son suficientes GPUs con 24 GB o mas (RTX 4090, L40S, A100).
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, 4090) si se usa el modelo base en bfloat16 o cuantizado; no hay datos publicados de ejecucion en GPUs de 8-16 GB.
- Opciones de despliegue: la ruta documentada por el autor es transformers (`AutoModelForImageTextToText`) junto con `peft.PeftModel`, cargando el modelo base de forma explicita. No se documentan otras opciones (vLLM, TGI, llama.cpp, Ollama) para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emprm-v2-stageB_g1_s0 | 8B base + 174,6 M adaptador | no disponible | FlipAcc 0,2988; no supera la puerta de 0,74 | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-VL-8B-Instruct (base sin adaptador) | ~8B | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| emprm-v2-a2_support_s0 (arm inicial de la escalera) | 8B base + adaptador LoRA | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Head v1 de EM-PRM (referencia de la ganancia de pares) | no disponible | no disponible | referencia usada para calcular +0,1685 / +0,1815 de ganancia de pares | no disponible | no disponible |

No se han encontrado en la busqueda web modelos comparables adicionales ni resultados de benchmarks publicados en la informacion disponible.

## Limitaciones y advertencias

- Estado descartado para despliegue: el propio autor lo marca como descartado al no superar la puerta pre-registrada de FlipAcc relacional (exigia >= 0,74 y obtuvo 0,2988 desplegado, 0,2300 con el grafico visible).
- Razonamiento sobre graficos debil: las tasas de 0,3025 en VisualProcessBench y 0,3098 en VLRMBench estan lejos de un uso fiable en produccion.
- FlipAcc con el grafico visible inferior al desplegado (0,2300 frente a 0,2988): mostrar la imagen empeora la consistencia relacional, un comportamiento contraintuitivo que debe tenerse en cuenta al integrarlo.
- Sesgo conservador: acepta muy poca evidencia falsa (0,0075), lo que puede traducirse en falsos negativos y en rechazo de pasos correctos.
- Riesgo de alucinacion: no se documenta mitigacion especifica; hereda las limitaciones del modelo base Qwen/Qwen3-VL-8B-Instruct.
- Cobertura idiomatica: no disponible; no se documentan idiomas soportados para el adaptador.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion proporcionada.
- Dependencia del modelo base: requiere cargar explicitamente Qwen/Qwen3-VL-8B-Instruct en el snapshot `0c351dd`; el `adapter_config.json` guarda una ruta local que no es portable.
- Advertencia de produccion: licencia apache-2.0 permite uso comercial del adaptador, pero la puerta de calidad fallida y las cero descargas aconsejan tratarlo como artefacto de investigacion.
- Artefacto no reproducible de forma completa desde este repositorio: los prompts, configuraciones y volcados por ejemplo viven en el dataset de sincronizacion, y el backup congelado `RESEARCH-EMPRM/emprm-v2` (2026-09-09) es anterior a este brazo y no lo contiene.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RESEARCH-EMPRM/emprm-v2-stageB_g1_s0
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Adaptador de inicializacion: https://huggingface.co/RESEARCH-EMPRM/emprm-v2-a2_support_s0
- Backup congelado de la escalera EM-PRM v2: https://huggingface.co/RESEARCH-EMPRM/emprm-v2
- Dataset de sincronizacion con resultados, dumps, configs y prompts: https://huggingface.co/datasets/evergyu/emprm-sync-20260910
- Paper de EM-PRM: no disponible en la informacion proporcionada
- Repositorio de codigo, demo o blog adicional: no disponible; la busqueda web no devolvio resultados relevantes

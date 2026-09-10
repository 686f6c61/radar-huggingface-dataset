# RESEARCH-EMPRM/emprm-v2-stageB_rung5_noev_s1

## Resumen

`RESEARCH-EMPRM/emprm-v2-stageB_rung5_noev_s1` es un adaptador LoRA de tipo *process reward model* (PRM) multimodal entrenado por el grupo RESEARCH-EMPRM sobre el modelo base `Qwen/Qwen3-VL-8B-Instruct` (snapshot `0c351dd`). Forma parte de la escalera de experimentos EM-PRM v2 (*Evidence-Mediated Process Rewards for Robust Multimodal Reasoning*) y corresponde a la celda «R+G» del factorial E2 (record gate x ranker sin evidencia), con la semilla 1. El adaptador se entrenó el 10 de septiembre de 2026 en el commit `4438aea` del repositorio del proyecto.

Técnicamente es un adaptador PEFT de rango 64 y alpha 128 con 174.587.904 parámetros entrenables, aplicado sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, dejando el *vision tower* congelado. Su función no es generar texto, sino puntuar pasos intermedios de razonamiento sobre gráficos y material multimodal, una pieza habitual en pipelines de *reward modeling* y *best-of-N*.

Su relevancia es estrictamente de investigación: el propio autor declara que **no es candidato a despliegue** porque perdió las puertas pre-registradas relativas a gráficos (*chart gates*). Su interés radica en que documenta de forma reproducible un resultado negativo dentro de una ablación factorial, con métricas, semilla, hashes de datos y réplicas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal vision-lenguaje Qwen3-VL-8B-Instruct |
| Parametros totales | ~8.000 millones en el modelo base; 174.587.904 parametros entrenables en el adaptador LoRA |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | Adaptador distribuido en bfloat16; no se documentan cuantizaciones del adaptador. Las del modelo base dependen de su propio soporte, no detallado aqui |
| Idiomas soportados | No disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con `adapter_config.json` (formato PEFT/LoRA) |
| Rango LoRA / alpha / dropout | 64 / 128 / 0.05 |
| Modulos objetivo | down_proj, gate_proj, k_proj, o_proj, q_proj, up_proj, v_proj |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct (snapshot 0c351dd) |
| Inicializacion | RESEARCH-EMPRM/emprm-v2-a2_support_s0 |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se inserta sobre un transformer multimodal del que sólo se entrena la torre de lenguaje mediante LoRA; la torre de visión permanece congelada. El entrenamiento usó rango 64, alpha 128, dropout 0,05, precisión bfloat16, semilla 1, tasa de aprendizaje 5e-05, micro-lote 2 con acumulación de gradiente 4 y una única época, lo que suma 2.500 pasos de optimizador sobre 20.000 registros de tarea. El componente de pares empleó 8.353 registros, 5.000 micro-lotes y `lambda_pair` 1,0, con `pair_sees_image: true`. El coste total fue de 5,4 horas en una única NVIDIA A100-PCIE-40GB, con una precisión de pares de entrenamiento media de 0,8514 y final de 0,93.

La innovación del experimento es metodológica: la receta del escalón 5 se ejecuta eliminando la línea de evidencia del prompt del *ranker* tanto en entrenamiento como en inferencia (`GPRM_RANKER_NO_EVIDENCE=1`), manteniendo idénticos los datos de tarea (sha256 `fc09fcb5d086…`) y los pares (`runs/v2/data/stageB_pairs_rung5_noev/pairs.jsonl`). Se trata, por tanto, de la réplica con semilla 1 de la ablación «E eliminada», diseñada para aislar la contribución de la evidencia al *process reward*.

## Capacidades

- Puntuación de pasos de razonamiento (*process reward scoring*) sobre entradas multimodales, en la familia «grounded» con agregación por producto (`scoring.Scorer.score_grounded`).
- Razonamiento sobre gráficos (*chart reasoning*) cuando la imagen del gráfico está presente en la entrada.
- Evaluación de pares de trayectorias de razonamiento (`pair` records) para selección tipo *best-of-N*.
- Capacidad de generar texto y razonar heredada del modelo base Qwen3-VL-8B-Instruct (no evaluada ni reentrenada en este adaptador).
- Comprensión de imágenes en general, por herencia de la torre de visión del modelo base.
- No se documenta soporte de *tool calling*, *function calling*, agentes ni *multi-step reasoning* específico para este adaptador.
- No se documentan capacidades de audio ni un modo de *thinking* explícito.
- Idiomas soportados no disponibles.

## Casos de uso

- Investigación en *reward modeling* multimodal: usar el adaptador como *ranker* en un pipeline de *best-of-N* sobre Qwen3-VL-8B-Instruct para estudiar cómo se comporta un PRM sin línea de evidencia en el prompt.
- Reproducción de resultados y auditoría de ablaciones: cargar el adaptador junto al modelo base y al dataset de sincronización para replicar las puertas pre-registradas y contrastar la semilla 1 con otras semillas del mismo brazo.
- Estudio de resultados negativos: analizar por qué el *FlipAcc* relacional desplegado cae a 0,0000 y cómo sube a 0,0875 cuando se muestra el gráfico, como material para diseñar mejores recetas de PRM.
- *Data curation* asistida: emplear las puntuaciones del modelo para filtrar o clasificar trayectorias de razonamiento sobre gráficos antes de un entrenamiento posterior, aceptando su sesgo hacia entradas con imagen.
- Evaluación comparativa de PRMs: enfrentar este adaptador con otros *scorers* sobre los conjuntos externos ya medidos (VisualProcessBench, VLRMBench, VL-RewardBench, Multimodal RewardBench) para calibrar su utilidad relativa.
- Docencia y formación técnica: ilustrar sobre un caso real cómo se estructura un experimento factorial con puertas pre-registradas, hashes de datos y bundles de sincronización en investigación de modelos de recompensa.
- No se recomienda su uso en producción ni en sistemas de decisión automatizada, dado que el propio autor lo descarta como candidato a despliegue.

## Benchmarks y rendimiento

| Metrica | Resultado (desplegado) | Con el grafico mostrado |
|---|---|---|
| FlipAcc relacional retenido | 0,0000 [0,0000, 0,0000] | 0,0875 [0,0688, 0,1075] |
| Aceptacion de evidencia forzada a 0,5 (verdadero) | 0,1575 | 0,9725 |
| Aceptacion de evidencia forzada a 0,5 (falso) | 0,0025 | 0,020 |
| Ganancia de pares disjuntos de graficos frente a v1 | +0,0992 [0,0524, 0,1449] | +0,0846 [0,0485, 0,1201] |
| Pools controlados (dev, Best-of-5, InternVL / Qwen) | 0,3742 / 0,5171 | — |

Mitades de desarrollo externas (desplegado): VisualProcessBench 0,4797; VLRMBench 0,4565; VL-RewardBench 0,5333; Multimodal RewardBench 0,5083. Las mitades de test permanecen sin leer según la model card. No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa 0,7 GB en disco. El coste real lo determina el modelo base Qwen3-VL-8B-Instruct.
- Estimacion derivada del tamano del modelo base (no publicada en la informacion disponible): en bfloat16 los pesos rondan los 16 GB, por lo que se necesitan aproximadamente 20-24 GB de VRAM para inferencia con margen para el *cache* de imagenes.
- GPU valida para entrenamiento segun el autor: una NVIDIA A100-PCIE-40GB, con 5,4 horas de *wall time* para 2.500 pasos.
- GPU recomendadas para inferencia: A100 40/80 GB, H100, L40S. En consumer, una RTX 4090 (24 GB) queda en el limite en bfloat16; con cuantizacion de 8 bits (aprox. 10-12 GB) o de 4 bits (aprox. 6-8 GB) cabria con holgura en tarjetas de 16-24 GB.
- Los modulos objetivo del LoRA (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) permiten tecnicas como tensores paralelos y *offloading*, pero no se documentan mediciones.
- Opciones de despliegue: `transformers` con `PeftModel` es la ruta documentada por el autor; vLLM o TGI son viables mediante carga de adaptadores LoRA; `llama.cpp` u Ollama requeririan convertir el modelo base a GGUF y fusionar o aplicar el adaptador por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Estado |
|---|---|---|---|---|---|
| emprm-v2-stageB_rung5_noev_s1 | ~8B base + 174,6M entrenables | No disponible | apache-2.0 | Puertas EM-PRM v2 (tabla anterior) | Adaptador de investigacion, no apto para despliegue |
| Qwen/Qwen3-VL-8B-Instruct (base) | ~8B | No disponible en la informacion | No disponible en la informacion | No evaluado en esta ficha | Modelo base de proposito general |
| RESEARCH-EMPRM/emprm-v2-a2_support_s0 | Adaptador LoRA sobre el mismo base | No disponible | apache-2.0 | No disponible | Punto de inicializacion de este adaptador |
| Otros PRMs multimodales de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos con modelos de recompensa de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que **no es un candidato a despliegue**: las puertas relativas a graficos no se superaron.
- `FlipAcc` relacional desplegado de 0,0000 y aceptacion de evidencia forzada de 0,1575 en condiciones desplegadas indican un rendimiento muy bajo sin la imagen del grafico presente.
- El modelo solo alcanza valores utilizables cuando se le muestra el grafico (FlipAcc 0,0875, aceptacion 0,9725/0,020), lo que limita su uso a escenarios con imagen disponible.
- Riesgo de alucinacion y de falso positivo en la puntuacion de pasos: la aceptacion de evidencia forzada falsa es de 0,0025 desplegado y 0,020 con el grafico, valores bajos pero no nulos.
- Es un artefacto de investigacion con semilla unica (semilla 1) dentro de una ablacion; no hay garantia de estabilidad entre semillas.
- Sin descargas ni likes, sin pipeline declarado y sin idiomas documentados: no hay evidencia de uso en produccion ni de validacion externa.
- Requiere cargar el modelo base por separado; el `adapter_config.json` registra la ruta local desde la que se entreno el adaptador, no el identificador del hub.
- La licencia apache-2.0 cubre el adaptador, pero el uso comercial queda condicionado por la licencia del modelo base Qwen3-VL-8B-Instruct, no detallada en la informacion proporcionada.
- Los datos de entrenamiento se distribuyen como dataset de sincronizacion (`evergyu/emprm-sync-20260910`); la verificacion completa de sesgos de esos datos no se documenta.
- El arbol congelado `RESEARCH-EMPRM/emprm-v2` (2026-09-09) es anterior a este adaptador y no lo contiene, por lo que no debe usarse como fuente de verificacion de esta version.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RESEARCH-EMPRM/emprm-v2-stageB_rung5_noev_s1
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Adaptador de inicializacion: https://huggingface.co/RESEARCH-EMPRM/emprm-v2-a2_support_s0
- Dataset de sincronizacion de artefactos (resultados, configs, prompts, `EXPERIMENT_REGISTRY.csv`, `CURRENT.md`, `WRITER_SYNC_BUNDLE.md`): https://huggingface.co/datasets/evergyu/emprm-sync-20260910
- Arbol congelado del proyecto (anterior a este adaptador): https://huggingface.co/RESEARCH-EMPRM/emprm-v2
- Paper, blog o repositorio de codigo independientes: no disponibles en la informacion proporcionada.

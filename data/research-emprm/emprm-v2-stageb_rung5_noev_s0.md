# RESEARCH-EMPRM/emprm-v2-stageB_rung5_noev_s0

## Resumen

`RESEARCH-EMPRM/emprm-v2-stageB_rung5_noev_s0` es un adaptador LoRA sobre el modelo multimodal Qwen/Qwen3-VL-8B-Instruct, desarrollado por el grupo RESEARCH-EMPRM dentro de la línea experimental EM-PRM v2 (Evidence-Mediated Process Rewards for Robust Multimodal Reasoning). No es un modelo generativo desplegable, sino un *process reward model* (PRM) multimodal: su función es puntuar y verificar pasos intermedios de razonamiento sobre gráficos, no producir respuestas finales.

El adaptador corresponde al brazo "R+G" del factorial E2 (record gate x ranker sin evidencia) y se entrenó con la receta rung-5 en la que se elimina la línea de evidencia del prompt del ranker, tanto en entrenamiento como en inferencia (`GPRM_RANKER_NO_EVIDENCE=1`). Se inicializó desde `a2_support_s0` y comparte 20.000 registros de tarea y 8.353 pares con el resto de la escalera experimental, con semilla 0.

Su relevancia es fundamentalmente metodológica: el propio autor lo etiqueta como "no candidato a despliegue", ya que no supera las puertas pre-registradas (FlipAcc relacional 0.0000 en el pase desplegado, muy por debajo del umbral 0.74) y se conserva únicamente, junto a las otras dos semillas, como la ablución emparejada "E eliminada" del EM-PRM final. Es, por tanto, un artefacto de reproducibilidad y análisis de ablaciones, no una herramienta de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) del modelo base Qwen3-VL-8B-Instruct, con adaptador LoRA (PEFT) |
| Parametros totales | Modelo base ~8B; adaptador LoRA con 174.587.904 parametros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la hereda del modelo base Qwen/Qwen3-VL-8B-Instruct) |
| Tipos de cuantizacion | No disponible; el adaptador se publica y entrena en bfloat16 |
| Idiomas soportados | No disponibles en la metadata; el modelo base Qwen3-VL-8B-Instruct es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT; `adapter_config.json` incluido) |

Datos adicionales: repositorio de 0,7 GB, libreria `peft`, snapshot del modelo base `0c351dd`, commit de entrenamiento `4438aea`, creado el 2026-09-10.

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un transformer multimodal que procesa imagen y texto. La torre de visión permanece congelada durante el entrenamiento y solo se actualizan las proyecciones LoRA. La configuración del adaptador es rango 64, alpha 128, dropout 0,05 y modulos objetivo `down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj` y `v_proj`, lo que da los 174.587.904 parametros entrenables. El entrenamiento se hizo en bfloat16, con semilla 0, learning rate 5e-05, micro-batch 2 con acumulacion de gradiente 4, una epoca y 2.500 pasos de optimizador sobre 20.000 registros de tarea; los pares suman 8.353 registros y 5.000 micro-batches con `lambda_pair` 1.0 y `pair_sees_image: true`. El coste fue de 5,4 horas en una unica NVIDIA A100-PCIE-40GB. La precision sobre pares de entrenamiento paso de una media de 0,8504 a 0,98 final.

La innovacion que aisla esta ablución es la eliminación de la línea de evidencia del prompt del ranker (`GPRM_RANKER_NO_EVIDENCE=1`), manteniendo el record gate y el resto del esquema de recompensas de proceso. La consecuencia arquitectonica es que el ranker puntua pares sin acceso ni a la evidencia textual ni a la imagen, lo que limita mecanicamente su capacidad de verificacion relacional. El scorer asociado (`scoring.Scorer.score_grounded`, familia grounded, agregacion por producto) y sus prompts viven en el directorio `code/` del dataset de sincronizacion.

## Capacidades

- Verificacion de pares de razonamiento: puntuacion y comparacion de dos cadenas de razonamiento candidatas sobre tareas multimodales con graficos.
- Process reward modeling: emision de recompensas a nivel de proceso, no solo de resultado final, util para Best-of-N y busqueda guiada.
- Entrada multimodal: el pipeline admite imagen y texto (`pair_sees_image`), aunque en este brazo concreto el ranker desplegado opera sin imagen ni linea de evidencia.
- Razonamiento sobre graficos (chart reasoning): categoria declarada del adaptador.
- Aceptacion de evidencia forzada: capacidad medida por el autor para medir el anclaje de la respuesta a la evidencia (legend binding).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada del adaptador; el modelo base Qwen3-VL-8B-Instruct si es un modelo de chat general.
- Capacidades multilingues: no disponibles en la metadata del adaptador.
- Modo "thinking" explicito, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de ablaciones en investigacion: el adaptador sirve para medir el impacto de eliminar la linea de evidencia del ranker, comparando su pase "product" (celda R+G) con el pase "verify_only" (celda R) del factorial E2.
- Reproduccion de experimentos: permite reconstruir la escalera EM-PRM v2 a partir de la semilla 0, con los mismos datos (sha256 `ddd7be2d3ddf...`) y el mismo esquema de entrenamiento.
- Auditoria de puertas pre-registradas: los resultados del adaptador se usan para documentar que la ablución pierde la puerta de FlipAcc relacional (0,0000 frente al umbral 0,74) y la de aceptacion de evidencia forzada (umbral 0,95).
- Re-ranking de candidatos en tareas de graficos: con el pipeline completo (imagen incluida) el adaptador puede puntuar pares de soluciones, aunque su rendimiento medido con grafico mostrado (FlipAcc 0,0037) lo hace poco fiable para seleccion real.
- Benchmarking de reward models multimodales: sus lecturas sobre VisualProcessBench, VLRMBench, VL-RewardBench y Multimodal RewardBench permiten situar otros PRM multimodales en la misma escala.
- Estudio de sesgos de anclaje: los pools adversarios de premisas controladas (0,3273 / 0,4318) permiten analizar como un ranker sin evidencia ni imagen se apoya en heuristicas superficiales.
- Base para continuar el entrenamiento: al ser un adaptador PEFT inicializado desde `a2_support_s0`, puede reutilizarse como punto de partida para variantes con evidencia restaurada.

## Benchmarks y rendimiento

El autor publica puertas pre-registradas y lecturas sobre mitades de desarrollo (las mitades de test no se leyeron). Se reproducen tal cual:

| Metrica | Pase desplegado (sin imagen) | Con grafico mostrado |
|---|---|---|
| FlipAcc relacional (held-out, operacion, texto) | 0,0000 [0,0000, 0,0000] | 0,0037 [0,0000, 0,0088] |
| Aceptacion de evidencia forzada a 0,5, clase true (400 por celda) | 0,0275 | 0,920 |
| Aceptacion de evidencia forzada a 0,5, clase false (400 por celda) | 0,000 | 0,005 |
| Ganancia de pares chart-disjoint sobre la cabeza v1 | +0,1330 [0,0874, 0,1787] | +0,1139 [0,0733, 0,1545] |
| Pools adversarios de premisas controladas (dev, Best-of-5, InternVL3.5-8B) | 0,3273 | no disponible |
| Pools adversarios de premisas controladas (dev, Best-of-5, Qwen3-VL-8B) | 0,4318 | no disponible |

Puertas pre-registradas: FlipAcc relacional >= 0,74 (perdida, valor 0,0000) y aceptacion de evidencia forzada true >= 0,95 (perdida en ambos pases).

Lecturas externas, mitades de desarrollo, pase desplegado:

| Benchmark | Resultado | Objetivo |
|---|---|---|
| VisualProcessBench (macro-F1@0,5) | 0,3894 | No alcanzado |
| VLRMBench | 0,3757 | No alcanzado |
| VL-RewardBench | 0,5365 | No alcanzado |
| Multimodal RewardBench | 0,5056 | No alcanzado |

Referencia comparativa interna citada por el autor: el brazo final EM-PRM alcanza 0,8369 / 0,8475 en los mismos pools adversarios, frente a 0,3273 / 0,4318 de este adaptador.

## Requisitos de hardware

- Entrenamiento registrado: una NVIDIA A100-PCIE-40GB, 5,4 horas de tiempo de pared para 2.500 pasos de optimizador.
- VRAM de inferencia: no publicada por el autor. Como estimacion derivada del modelo base de ~8B parametros, en bfloat16 los pesos ocupan aproximadamente 16 GB y en cuantizacion de 4 bits aproximadamente 5-6 GB; el adaptador anade ~0,7 GB de pesos. Estas cifras son estimaciones, no datos medidos del repositorio.
- GPU recomendadas: A100 40GB (configuracion usada en entrenamiento); para inferencia en bfloat16 son suficientes GPU de 24 GB o mas (RTX 4090, L40S, A6000). No hay datos de throughput publicados.
- GPU de consumo: con cuantizacion de 4 bits el modelo base mas el adaptador podria caber en GPU de 8-12 GB, pero no hay verificacion publicada por el autor.
- Opciones de despliegue: la carga documentada usa `transformers` (`AutoModelForImageTextToText`), `AutoProcessor` y `peft.PeftModel.from_pretrained`. No se documentan vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador PEFT en safetensors, su uso con esos motores requeriria fusion previa del adaptador y no esta validado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `emprm-v2-stageB_rung5_noev_s0` (este) | ~8B base + 174,6M entrenables | No disponible | FlipAcc 0,0000 desplegado / 0,0037 con grafico | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| EM-PRM final (brazo de referencia del mismo autor) | No disponible | No disponible | 0,8369 / 0,8475 en pools adversarios | No disponible | Referenciado en la model card |
| Cabeza v1 de EM-PRM | No disponible | No disponible | Base de comparacion para la ganancia chart-disjoint (+0,1330 desplegado) | No disponible | No disponible |
| Qwen3-VL-8B-Instruct (modelo base) | ~8B | No disponible | Usado como evaluador en los pools adversarios del autor | No disponible en la informacion proporcionada | HuggingFace |
| InternVL3.5-8B | ~8B | No disponible | Usado como evaluador en los pools adversarios del autor (0,3273 con este adaptador) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

Alternativas de la misma categoria (PRM multimodales sobre graficos) no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No es un candidato a despliegue segun el propio autor: pierde las dos puertas pre-registradas de forma clara.
- El pase desplegado opera sin la imagen y sin la linea de evidencia, lo que hace imposible la verificacion relacional por diseno; el FlipAcc relacional es 0,0000 sobre 800/800 pares.
- Incluso mostrando el grafico, el rendimiento es muy bajo (FlipAcc 0,0037; aceptacion true 0,920 frente al umbral 0,95).
- Riesgo elevado de dependencia de heuristicas superficiales: los pools adversarios de premisas controladas degradan el resultado a 0,3273 / 0,4318 frente a 0,8369 / 0,8475 del brazo final.
- Ninguna de las lecturas externas alcanza el objetivo declarado; el modelo no deberia usarse como juez o verificador en pipelines reales.
- Al ser un adaptador LoRA, requiere cargar explicitamente el modelo base; `adapter_config.json` guarda una ruta local de entrenamiento y no resuelve el modelo base automaticamente.
- Sesgos conocidos: no disponibles como analisis especifico en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0, sin restriccion de uso comercial declarada para el adaptador; las condiciones del modelo base Qwen3-VL-8B-Instruct se aplican de forma independiente.
- Idiomas y contexto: no documentados para el adaptador; dependen del modelo base.
- Artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay senal de uso en produccion ni validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RESEARCH-EMPRM/emprm-v2-stageB_rung5_noev_s0
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Checkpoint de inicializacion: https://huggingface.co/RESEARCH-EMPRM/emprm-v2-a2_support_s0
- Dataset de sincronizacion de artefactos (resultados, configs, prompts, `EXPERIMENT_REGISTRY.csv`, `CURRENT.md`, `WRITER_SYNC_BUNDLE.md`): https://huggingface.co/datasets/evergyu/emprm-sync-20260910
- Arbol congelado EM-PRM v2 (previo a este brazo, no lo contiene): https://huggingface.co/RESEARCH-EMPRM/emprm-v2
- Paper "EM-PRM: Evidence-Mediated Process Rewards for Robust Multimodal Reasoning": no disponible como enlace en la informacion proporcionada.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (unicamente hilos de foros de Autodesk sin relacion con el artefacto).

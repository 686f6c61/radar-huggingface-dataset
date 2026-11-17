# DecentVLA/groot_n17_libero_4suite_int8_fedavg

## Resumen

GR00T N1.7 INT8 FedAvg es un ajuste fino federado del modelo vision-language-action (VLA) `nvidia/GR00T-N1.7-3B` de NVIDIA, orientado a control robótico de manipulacion. Lo publica el proyecto DecentVLA y constituye el checkpoint final (ronda 50) de un entrenamiento federado de baja precision con cuatro clientes, uno por cada suite del benchmark LIBERO. Cada cliente entrena con pesos, gradientes y primer momento de Adam en INT8 nativo y segundo momento en UINT8 con escala log8 adaptativa; el servidor agrega en FP32 mediante FedAvg ponderado por numero de muestras.

La relevancia del modelo es metodologica tanto como funcional: demuestra que es viable entrenar de forma federada un VLA de 3.144 millones de parametros con cuantizacion nativa de 8 bits sin colapsar el rendimiento, y publica ademas las "receipts" completas (50 rondas, historiales por cliente, 400 rollouts de evaluacion). Sobre el benchmark LIBERO alcanza una tasa de exito global del 54,0% (216/400 rollouts), con un rendimiento muy desigual entre suites (82,0% en Goal frente a 22,0% en LIBERO-10).

Arquitectonicamente hereda el diseno de GR00T N1.7: un backbone de vision-lenguaje congelado (`nvidia/Cosmos-Reason2-2B`) y una cabeza de accion difusion o flow-matching sobre 537 tensores federados, que suman 1.620.515.968 parametros de los 3.144.016.000 totales. El repositorio ocupa 6,5 GB e incluye el checkpoint, configuraciones, logs, scripts y resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con backbone VLM congelado Cosmos-Reason2-2B y cabeza de accion entrenable; entrenamiento federado FedAvg |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no aplica (no es MoE); parametros federados/entrenables: 1.620.515.968 en 537 tensores |
| Longitud de contexto | no disponible (horizonte de accion de 16 pasos, replanificacion tras el chunk completo) |
| Tipos de cuantizacion | Entrenamiento en INT8 (pesos, gradientes, primer momento de Adam) y UINT8 adaptive-log8 (segundo momento); checkpoint final en FP32 |
| Idiomas soportados | no disponibles |
| Licencia | NVIDIA Open Model License (heredada de `nvidia/GR00T-N1.7-3B`) |
| Formato de pesos | PyTorch pickle (`.pt`), `checkpoints/server_round_0050.pt` (6.482.252.320 bytes, SHA-256 `4c331b2f789d22c9917153c21f71aba06fe17931229e5ad4f7281eb7b9eaa779`) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/GR00T-N1.7-3B` (commit `2fc962b973bccdd5d8ce4f67cc63b264d6886495`) y mantiene congelado el backbone `nvidia/Cosmos-Reason2-2B` (commit `9ce19a195e423419c349abfc86fd07178b230561`). Solo se entrenan 537 tensores (1.620.515.968 parametros) que constituyen la cabeza de accion; los otros 494 tensores de la politica se toman sin cambios del modelo base. La salida es un chunk de 16 acciones que se ejecuta completo antes de replanificar.

El entrenamiento es federado sincrono con cuatro clientes, cada uno con una suite de LIBERO: c0 LIBERO-Spatial (432 episodios), c1 LIBERO-Object (454), c2 LIBERO-Goal (428) y c3 LIBERO-10 (379). Se ejecutaron 50 rondas de FedAvg con 250 pasos locales por ronda (batch 16, 12.500 pasos por cliente). La innovacion principal es la baja precision nativa en el cliente: pesos, gradientes y primer momento de Adam en INT8, y segundo momento en UINT8 con escala logaritmica adaptativa (log8). El servidor agrega en FP32 con ponderacion por numero de muestras. La tasa de aprendizaje hace warm-up lineal de 1e-7 a 1e-4 en 1.000 pasos y decae a 6,937e-5 en el paso 12.500. La perdida ponderada por muestras pasa de 1,1335 en la ronda 1 a 0,1286 en la ronda 50. Todo el trabajo se ejecuto en un nodo con 4 GPU NVIDIA GH200 (un cliente por GPU) en 23 h 03 min sin interrupciones ni reanudaciones.

## Capacidades

- Control robótico de manipulacion a partir de observaciones visuales y consignas en lenguaje natural (VLA), con salida de chunks de 16 acciones.
- Ejecucion de tareas de LIBERO-Spatial, LIBERO-Object, LIBERO-Goal y LIBERO-10, incluyendo tareas de razonamiento de objetivo y secuencias largas.
- Percepcion visual con camaras renderizadas por EGL a 256x256.
- Entrenamiento federado reproducible: el repositorio publica receipts por ronda, historiales de perdida y learning rate por paso, diagnosticos de cuantizacion y monitorizacion de recursos.
- Evaluacion verificable: comprobacion de carga del checkpoint (`eval/ckpt_load_check.json`) que confirma 537/537 tensores federados cargados bit a bit y 494 intactos.
- No dispone de tool calling, function calling, agentes multi-paso ni capacidades multilingues documentadas (es un modelo de robotica, no un LLM de proposito general).

## Casos de uso

- Investigacion en aprendizaje federado de politicas roboticas: el repositorio incluye receipts, configuraciones y scripts para reproducir o auditar el protocolo FedAvg con cuantizacion INT8, lo que permite estudiar el efecto de la baja precision en el entrenamiento distribuido de VLAs.
- Benchmarking de VLA en LIBERO: el modelo sirve como referencia publicada con 400 rollouts (semilla 42, 10 episodios por tarea) para comparar nuevas politicas o variantes de agregacion contra un baseline federado.
- Entrenamiento con datos distribuidos entre instituciones: el esquema de cuatro clientes, uno por suite, es directamente reutilizable para escenarios donde cada centro conserva sus datos localmente y solo comparte pesos.
- Manipulacion en mesa para tareas de objetivo (Goal): con 82,0% de exito, es adecuado para prototipos de laboratorio en tareas de alcance y colocacion con instrucciones de alto nivel.
- Estudio de cuantizacion de bajo rango en entrenamiento: los diagnosticos publicados (`train/train_summary.json`) permiten analizar el impacto de INT8/log8 en el primer y segundo momento de Adam.
- Reproduccion de evaluacion robotica: el pipeline `decent-vla eval` con LIBERO (`huggingface/lerobot-libero`, robosuite 1.4.0, MuJoCo 3.8.1) es reutilizable para validar checkpoints en 520 pasos de politica y 10 pasos de asentamiento.
- Base para ajuste fino adicional: aunque el run no es reanudable, el checkpoint FP32 puede servir como inicializacion para otros dominios o suites, siempre que se respete la licencia NVIDIA.

## Benchmarks y rendimiento

Evaluacion propia publicada en el repositorio: 400 rollouts (4 suites x 10 tareas x 10 episodios, semilla 42), horizonte de accion 16, maximo 520 pasos por episodio.

| Suite | Exitos / episodios | Tasa de exito |
|---|---|---|
| LIBERO-Spatial | 56/100 | 56,0% |
| LIBERO-Object | 56/100 | 56,0% |
| LIBERO-Goal | 82/100 | 82,0% |
| LIBERO-10 | 22/100 | 22,0% |
| **Global** | **216/400** | **54,0%** |

Tareas sin exito: LIBERO-10 tarea 8 y tarea 9. No hay tareas incompletas. No se han publicado comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- El checkpoint pesa 6.482.252.320 bytes (unos 6,04 GiB) para 1.620.515.968 parametros federados en FP32; la inferencia documentada es en punto flotante desde el checkpoint del servidor, no en INT8.
- Para cargar el modelo hace falta ademas el modelo base `nvidia/GR00T-N1.7-3B` y el backbone `nvidia/Cosmos-Reason2-2B`, por lo que la VRAM real supera ampliamente la del checkpoint aislado; no se especifica la VRAM total en la informacion disponible.
- El entrenamiento se ejecuto en 4 GPU NVIDIA GH200 (un cliente por GPU) durante 23 h 03 min. No se documenta el consumo pico en `train/resource_monitor.jsonl` en la informacion proporcionada.
- No hay datos publicados sobre que GPU de consumo (RTX 4090, etc.) puede ejecutar la inferencia, ni sobre latencia o throughput.
- Despliegue: la evaluacion usa el backend GR00T de DecentVLA (`decent-vla eval --config config/eval_final.yaml --ckpt checkpoints/server_round_0050.pt`), con LIBERO desde `huggingface/lerobot-libero`, robosuite 1.4.0 y MuJoCo 3.8.1, renderizado EGL. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|
| GR00T N1.7 INT8 FedAvg (este) | 3.144.016.000 totales; 1.620.515.968 federados | LIBERO global 54,0% (400 rollouts) | NVIDIA Open Model License | Pesos en HF, entrenamiento no reanudable |
| `nvidia/GR00T-N1.7-3B` | 3.144.016.000 | no disponible en esta ficha | NVIDIA Open Model License | Modelo base publico en HF |
| Otros VLA de la familia GR00T | no disponible | no disponible | NVIDIA Open Model License | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada; no se inventan cifras.

## Limitaciones y advertencias

- Rendimiento muy desigual entre suites: 82,0% en Goal frente a 22,0% en LIBERO-10, con dos tareas sin ningun exito. No es un modelo generalista fiable.
- Evaluacion limitada a una sola semilla (42) y 10 episodios por tarea; la varianza no esta caracterizada.
- El checkpoint contiene solo los 537 tensores federados; requiere el modelo base y el backbone Cosmos-Reason2-2B para cargarse. El archivo es un pickle de PyTorch: debe cargarse solo en entornos de confianza.
- Entrenamiento no reanudable: los checkpoints de cliente y los intermedios (rondas 10-40) fueron eliminados.
- El codigo de entrenamiento esta en un repositorio privado (commit `dcfedde77d347102635c38838c0ef6a56a330cac`), por lo que la reproduccion completa no es posible con lo publicado.
- Licencia NVIDIA Open Model License: revisar condiciones antes de uso comercial; la ficha original remite a los terminos de NVIDIA.
- No hay informacion sobre sesgos, riesgos de alucinacion en el sentido de un LLM, ni cobertura idiomatica; el modelo es de robotica y opera con consignas de tarea en LIBERO.
- Las rutas de cluster en configuraciones y logs publicos se sustituyeron por `$LPT4_ROOT` y se eliminaron nombres de cuenta; los hashes citados corresponden a los archivos originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DecentVLA/groot_n17_libero_4suite_int8_fedavg
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Backbone: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Dataset LIBERO-Spatial: https://huggingface.co/datasets/IPEC-COMMUNITY/libero_spatial_no_noops_1.0.0_lerobot
- Dataset LIBERO-Object: https://huggingface.co/datasets/IPEC-COMMUNITY/libero_object_no_noops_1.0.0_lerobot
- Dataset LIBERO-Goal: https://huggingface.co/datasets/IPEC-COMMUNITY/libero_goal_no_noops_1.0.0_lerobot
- Dataset LIBERO-10: https://huggingface.co/datasets/IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Entorno de evaluacion LIBERO: https://huggingface.co/huggingface/lerobot-libero
- Proyecto DecentVLA: no disponible en la informacion proporcionada (el README lo menciona pero no incluye URL)

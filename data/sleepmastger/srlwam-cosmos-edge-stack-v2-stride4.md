# SleepMastger/srlwam-cosmos-edge-stack-v2-stride4

## Resumen

`srlwam-cosmos-edge-stack-v2-stride4` es un checkpoint de política robótica (visión-lenguaje-acción) derivado de `nvidia/Cosmos3-Edge-Policy-DROID` mediante fine-tuning supervisado sobre demostraciones de simulación del entorno `stack_v2` (apilado de dos cubos con un brazo Franka). Lo publica el usuario `SleepMastger` como variante de los checkpoints `sim_v2_droid` del proyecto `aabyaneh/srlwam`, con un cambio concreto: un *temporal stride* de 4, es decir, cada paso del modelo abarca 4 pasos grabados a 10 Hz (0,4 s por paso, 2,5 Hz efectivos).

El modelo no es un LLM de propósito general: es una política de imitación que, dada una observación visual y un estado del robot, predice un *chunk* de 16 acciones (cada una suma de 4 deltas grabados) junto con el comando de pinza. Su relevancia es acotada pero técnica: documenta el efecto del submuestreo temporal en la frecuencia de control de una política Cosmos Edge, con métricas de validación abiertas (MAE de acción normalizada y precisión de pinza) y un `deploy.json` con unidades, ganancia y rango de estado.

El repositorio ocupa 17,3 GB e incluye pesos en bf16 (formato DCP), el VAE Wan2.2 compartido, el árbol de código de entrenamiento exacto y herramientas de exportación. No incluye código de despliegue ni evaluación en robot real, y el propio autor advierte de que los checkpoints solo-simulación han mostrado problemas de rango y descenso con datos de estado reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política Cosmos3 Edge (visión-lenguaje-acción) con VAE Wan2.2 y *vision tower*; no se detalla la topología interna en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (ventana de observación no especificada) |
| Tipos de cuantizacion | Pesos en bf16; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (el prompt de tarea es "stack the cubes") |
| Licencia | Component-specific (other); derivado de `nvidia/Cosmos3-Edge-Policy-DROID` bajo OpenMDW 1.1; VAE Wan2.2 bajo Apache 2.0 |
| Formato de pesos | DCP bf16 (`.metadata` + `__0_0.distcp`) + `config.json`; no hay safetensors ni GGUF de inferencia |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/Cosmos3-Edge-Policy-DROID` y se afina con imitación supervisada sobre 750 demostraciones de entrenamiento y 250 de validación del dataset `stack/sim/stack_v2` (repo `aabyaneh/srlwam` en el commit `cffcf593`). El entrenamiento usó 2000 pasos con batch global 2048, learning rate 5e-5 con 500 pasos de warm-up, 8 GPUs y bf16, ejecutado como job Slurm 5050 (wandb `huaweiwam/srlwam/6ha0xwzr`). La innovación respecto al run stride-1 es puramente temporal: vídeo y estado se muestrean cada 4 frames grabados, las acciones son la suma de 4 deltas (traslación y rotación) con el comando de pinza del último, y la normalización se reajustó sobre esas acciones sumadas (xyz q01/q99 ≈ ±0,04–0,06 unidades de sim frente a ±0,01–0,016 en stride 1).

El resultado es una política que opera a 2,5 Hz con `conditioning_fps = 2` (2,5 Hz truncado a entero porque el modelo solo acepta enteros) y chunks de 16 pasos que cubren 6,4 s de movimiento. El checkpoint incluye el VAE Wan2.2, el procesador/tokenizer y el *vision tower* idénticos al repo `aabyaneh/srlwam`. No se documentan etapas de RLHF, DPO ni refuerzo; es fine-tuning supervisado puro sobre acciones grabadas.

## Capacidades

- Predicción de acciones de manipulación robótica (traslación, rotación y comando de pinza) para apilado de dos cubos con brazo Franka en simulación.
- Generación de *action chunks* de 16 pasos con horizonte temporal de 6,4 s a stride 4.
- Condicionamiento por observación visual (frames submuestreados cada 4) y estado del robot (`sim_ee_frame`), con conversión de lecturas crudas vía adaptador.
- Prompt de tarea en lenguaje natural acotado ("stack the cubes", dominio 33 en `checkpoint.json`).
- No se documentan *tool calling*, razonamiento multi-paso, capacidades multilingües, audio ni *thinking mode*; no aplica a este tipo de modelo.
- No se documenta soporte de agentes ni planificación simbólica.

## Casos de uso

- Investigación en imitación robótica con submuestreo temporal: comparar el efecto de stride 1 frente a stride 4 sobre el error de acción en el mismo dataset, usando las métricas de validación incluidas (`train_validation/`).
- Prototipado de políticas de apilado en simulación: ejecutar el checkpoint en el simulador `stack_v2` para generar trayectorias de referencia antes de transferir a robot.
- Evaluación en *shadow mode*: desplegar con el adaptador `deploy/cosmos/cosmos_policy.py` ajustando `FPS = 2` y ejecutar cada acción sobre 0,4 s, registrando predicciones sin actuar sobre el robot real.
- Estudio de normalización de acciones sumadas: reutilizar `normalization.json` y `deploy.json` para analizar cómo cambia el rango de acción (q99 ≈ 0,013 m) frente al clamp de 0,025 m por paso del adaptador.
- Reproducibilidad de entrenamiento: el repo incluye el árbol de código exacto (`training_code/`), la config resuelta y el *readiness receipt*, útil para replicar el run en Slurm.
- Base para fine-tuning posterior en dominio real: partir de estos pesos y reentrenar con datos de robot real, dado que los checkpoints solo-simulación presentan problemas de rango y descenso en estado real.
- Docencia y divulgación técnica: ejemplo concreto de cómo un cambio de frecuencia de control afecta a las métricas de una política VLA.

## Benchmarks y rendimiento

Métricas de validación abierta sobre 744 ventanas fijas de 250 episodios *held-out*, 30 pasos de muestreo, en bucle abierto contra las acciones grabadas (no son tasas de éxito en robot ni en bucle cerrado):

| Checkpoint | Paso | MAE acción normalizada | Precisión pinza | Flow loss |
|---|---:|---:|---:|---:|
| `sim_v2_stride4_droid_iter1750` | 1750 (mejor) | 0,0525 | 0,988 | 0,72 |
| `sim_v2_stride4_droid_iter2000` | 2000 (final) | 0,0537 | 0,987 | 0,71 |

Referencia del mismo recetario a stride 1: 0,0593 en el paso 1750 y 0,0624 en el 2000. El autor advierte de que cada run normaliza su propio espacio de acciones, por lo que la comparación es solo aproximada. No hay resultados de MMLU, HumanEval, GSM8K ni benchmarks de propósito general, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repo pesa 17,3 GB e incluye pesos bf16 más VAE y *vision tower*, por lo que la inferencia requiere al menos una GPU con capacidad para el conjunto completo en bf16.
- GPU recomendadas: no especificadas en la información disponible; el entrenamiento se hizo con 8 GPUs en bf16 (modelo no indicado). Para inferencia, se requiere una GPU de datacenter con memoria suficiente para los 17,3 GB del bundle.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras consumer; no hay versiones GGUF ni cuantizadas.
- Opciones de despliegue: adaptador `deploy/cosmos/cosmos_policy.py` del repo `aabyaneh/srlwam` (con `FPS = 2` y ejecución de acciones sobre 0,4 s), siguiendo `deploy.json`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `srlwam-cosmos-edge-stack-v2-stride4` | no disponible | no disponible | MAE 0,0525 / pinza 0,988 (validación abierta, sim) | Component-specific (OpenMDW 1.1 + Apache 2.0) | HuggingFace, 0 descargas |
| `sim_v2_droid` stride 1 (`aabyaneh/srlwam`) | no disponible | no disponible | MAE 0,0593 (paso 1750) | no disponible | HuggingFace |
| `nvidia/Cosmos3-Edge-Policy-DROID` (base) | no disponible | no disponible | no disponible | OpenMDW 1.1 | HuggingFace (NVIDIA) |

No se dispone de datos suficientes para comparar con otras familias de políticas VLA (p. ej. OpenVLA, π0) en parámetros, contexto o rendimiento; no disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (`stack_v2`); no ha sido evaluado en robot real y no incluye `fixture_reference.npz` ni `eval_real_holdout.json`, por lo que no ha pasado gate-1 ni evaluación con datos reales.
- Los checkpoints solo-simulación de esta familia han mostrado problemas de rango y descenso con datos de estado reales; el autor recomienda empezar en *shadow mode*.
- Las métricas publicadas son error de acción en bucle abierto, no tasas de éxito en bucle cerrado; no deben interpretarse como rendimiento en tarea.
- El despliegue exige modificar el adaptador (`FPS = 2`) y ejecutar cada acción sobre 0,4 s; hacerlo como un paso único a 10 Hz movería el robot 4 veces demasiado rápido.
- Usar `command.delta` y no `real_controller_delta`; unidades de sim `stack_v2` con ganancia 0,1975 m/unidad.
- Tarea y prompt muy acotados ("stack the cubes", dominio 33); no es un modelo generalista ni multilingüe.
- Licencia compuesta: derivado de OpenMDW 1.1 con componentes Apache 2.0; revisar `NOTICE.md` antes de uso comercial.
- Riesgo de alucinación de acciones fuera de distribución si se aplica a objetos, cámaras o brazos distintos de los del dataset de entrenamiento.
- Sesgos: no documentados; el dataset son demostraciones humanas de una tarea concreta, lo que puede introducir sesgo de trayectoria.
- Repositorio sin descargas ni *likes* y con autor no verificado; tratar como artefacto de investigación, no de producción.

## Enlaces

- HuggingFace: https://huggingface.co/SleepMastger/srlwam-cosmos-edge-stack-v2-stride4
- Aviso de licencias: https://huggingface.co/SleepMastger/srlwam-cosmos-edge-stack-v2-stride4/blob/main/cosmos_edge/NOTICE.md
- Repo del proyecto original: https://huggingface.co/aabyaneh/srlwam
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Run de entrenamiento (wandb): https://wandb.ai/huaweiwam/srlwam/runs/6ha0xwzr

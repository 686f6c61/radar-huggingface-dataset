# 5hadytru/so101_bench_G0.5_full_fine_tune

## Resumen

so101_bench_G0.5_full_fine_tune es un ajuste fino completo del modelo de vision-lenguaje-accion (VLA) G0.5 de Galaxea (checkpoint `g05-base` del repositorio OpenGalaxea/G05), realizado por el usuario 5hadytru sobre el conjunto de datos simulado SO-101 Bench. Se trata de la entrada oficial de G0.5 en la benchmark SO-101 Bench y corresponde al paso 25.600, el checkpoint final del entrenamiento. El objetivo es medir la competencia geometrica de un modelo fundacional de robotica en tareas de manipulacion sobre el brazo SO-101 dentro de un simulador.

El modelo parte de una arquitectura VLA con un recipe de decodificacion autorregresiva de tokens de accion (ActionCodec) combinada con una cabeza de flow-matching, y genera chunks de 32 pasos de accion. Se entreno con todos los parametros activos durante 25.600 pasos sobre 3.629 episodios y 1.996.120 fotogramas a 30 fps, utilizando cuatro GPU A100-SXM4 de 80 GB durante unas 34 horas, dentro del presupuesto de computo equitativo de SO-101 Bench (36 horas).

Su relevancia actual radica en que sirve como punto de referencia reproducible y de computo controlado para comparar modelos fundacionales de robotica sobre el mismo brazo, la misma tarea y el mismo presupuesto de entrenamiento. La licencia es no comercial (G0.5 Community License), lo que restringe su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con decodificacion autorregresiva de tokens de accion (ActionCodec) y cabeza de flow-matching; derivada de G0.5 (g05-base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (memoria visual de 6 fotogramas por camara, separados 1 s) |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia en bf16; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | g05-community-license (G0.5 Community License Agreement: no comercial + licencia de patente limitada) |
| Formato de pesos | `checkpoints/model_state_dict.pt` (solo pesos); configuracion resuelta en `.hydra/` |
| Tamano del repositorio | 7,3 GB |
| Modalidad | Robotica / manipulacion (entrada visual + estado, salida de acciones) |
| Camaras | 640x480 (`overhead` -> slot `exterior`, `wrist` -> slot `wrist_right`) |
| Grado de libertad | 6 articulaciones (q01/q99 normalizado) |

## Arquitectura y entrenamiento

El modelo es un derivado de G0.5, un VLA de Galaxea. El recipe de ajuste usa tokens de accion autorregresivos generados por ActionCodec junto con una cabeza de flow-matching, y produce chunks de accion de 32 pasos. La entrada visual se organiza en slots de camara: las imagenes `overhead` y `wrist` del dataset SO-101 Bench se mapean a los slots `exterior` y `wrist_right` de G0.5, dejando fuera el slot `wrist_left` ausente, tal como en el recipe SO-100 de G0.5. La memoria visual emplea 6 fotogramas por camara separados 1 segundo, ajustandose a la configuracion de preentrenamiento de `g05-base`.

El ajuste fino se hizo con el codigo OpenGalaxea/GalaxeaVLA (commit `89f2322`), usando el recipe `so100` del repositorio con el dataset mapeado explicitamente. Se empleo AdamW con LR 8e-5, betas (0.9, 0.95), weight decay 0.01 y 1000 pasos de warmup. El batch global fue de 128 (16 por GPU x 4 GPU x 2 pasos de acumulacion), con AdamW de 8 bits y checkpointing de activaciones de vision. El entrenamiento duro 25.600 pasos (unos 3,28 millones de muestras, aproximadamente 1,6 epocas de fotogramas) sobre 4 GPU A100-SXM4-80GB durante cerca de 34 horas. Los datos de entrenamiento proceden del dataset simulado `5hadytru/so101_bench_sim` (LeRobot v3.0), con 3.629 episodios y 1.996.120 fotogramas a 30 fps, generados en Isaac Lab con aleatorizacion de dominio. No se documenta uso de RLHF ni DPO en la informacion disponible.

## Capacidades

- Manipulacion robotica: genera secuencias de acciones de 6 articulaciones para el brazo SO-101 a partir de observaciones visuales y de estado.
- Percepcion visoespacial: consume imagenes de camara (640x480) desde una vista aerea y una vista de muneca.
- Memoria visual: condiciona la prediccion sobre 6 fotogramas por camara con 1 segundo de separacion, lo que aporta contexto temporal de aproximadamente 5 segundos.
- Decodificacion autorregresiva de acciones: combina tokens de accion con una cabeza de flow-matching para producir chunks de 32 pasos.
- Replanificacion: en evaluacion opera en modo autorregresivo replanificando cada 15 pasos con la memoria de 6 fotogramas.
- Generalizacion a objetos y entornos: evaluado sobre objetos vistos, objetos no vistos de clases vistas y clases no vistas, con fondos y colores de robot aleatorizados.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, dialogo multilingue, vision general, audio ni modo de razonamiento explicito; el modelo es especifico de robotica.

## Casos de uso

- Evaluacion comparativa de modelos fundacionales de robotica: sirve como entrada oficial de G0.5 en SO-101 Bench, permitiendo comparar su competencia geometrica frente a otras entradas bajo el mismo presupuesto de computo y el mismo conjunto de validacion.
- Manipulacion simulada sobre SO-101: se usa para ejecutar tareas de recogida y colocacion en Isaac Lab, generando chunks de accion a partir de imagenes aerea y de muneca.
- Investigacion en generalizacion a clases no vistas: el conjunto de validacion separa objetos vistos, objetos no vistos de clases vistas y clases no vistas, lo que permite estudiar como se degrada la politica ante novedad semantica o geometrica.
- Reentrenamiento baseline en robotica: al ser un ajuste fino completo de pesos y liberar el state dict y la configuracion Hydra, se puede reutilizar como punto de partida para recetas propias con el repositorio GalaxeaVLA.
- Estudio de memoria visual en VLA: al condicionar sobre 6 fotogramas separados 1 segundo, permite analizar la contribucion de la memoria visual a la estabilidad de la politica.
- Prototipado de politicas sobre brazo de bajo coste: el SO-101 es un brazo economico; el modelo actua como referencia de que rendimiento es alcanzable con un VLA ajustado sobre datos simulados antes de trasladarlo a hardware real.
- Docencia y reproduccion de experimentos: el esquema de servidor y evaluacion (`g05_server.py`, `molmoact2_eval.py`) permite reproducir las cifras de exito con recursos acotados (una sola GPU de 24 GB para inferencia).

## Benchmarks y rendimiento

Validacion sobre el conjunto reservado SO-101 Bench (simulacion, `real_gr00t_val_v2`, 39 episodios: 13 por split de objetos vistos, no vistos de clases vistas y clases no vistas; aproximadamente la mitad con fondos y colores de robot aleatorizados). Politica en modo autorregresivo, replanificacion cada 15 pasos, memoria de 6 fotogramas.

| Paso | 2k | 4k | 6k | 8k | 10k | 12k | 14k | 16k | 18k | 20k | 22k | 24k | 25,6k |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Exitos / 39 | 19 | 22 | 22 | 23 | 21 | 19 | 22 | 18 | 23 | 18 | 19 | 19 | 21 |

El exito es alto desde fases tempranas y se mantiene plano dentro del ruido (18-23 de 39) durante todo el entrenamiento. Como en otras entradas de SO-101 Bench, el checkpoint oficial es el paso final, no el pico de validacion.

## Requisitos de hardware

- Inferencia: en una RTX 3090 el modelo tarda aproximadamente 0,6 s por chunk en bf16 con atencion SDPA, segun la model card.
- Entrenamiento: se realizo con 4 GPU A100-SXM4-80GB durante unas 34 horas, con batch global de 128, AdamW de 8 bits y checkpointing de activaciones de vision.
- GPU consumer: la inferencia cabe en una GPU consumer de gama alta (RTX 3090 confirmado en la documentacion). El tamano exacto de VRAM necesaria no esta documentado; el repositorio pesa 7,3 GB, dato que da una cota inferior orientativa del espacio de pesos.
- Despliegue: servidor propio de SO-101 Bench (`scripts/g05_server.py`) que construye el modelo con los helpers de serve de GalaxeaVLA; evaluacion con `scripts/molmoact2_eval.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son herramientas de texto, no aplicables aqui).
- Latencia y throughput: ~0,6 s por chunk de accion en RTX 3090; con replanificacion cada 15 pasos en evaluacion. No se documenta un throughput agregado.

## Comparativa con modelos similares

No se dispone de cifras de exito comparables para las otras entradas de SO-101 Bench en la informacion proporcionada, por lo que la comparacion de rendimiento se marca como no disponible.

| Modelo | Parametros | Contexto / memoria | Tipo | Licencia | Entrada en SO-101 Bench |
|---|---|---|---|---|---|
| so101_bench_G0.5_full_fine_tune (este) | no disponible | 6 fotogramas por camara (1 s) | VLA (G0.5) | G0.5 Community (no comercial) | G0.5, paso 25,6k |
| 5hadytru/so101_bench_MolmoAct2-SO101_WM_full_fine_tune | no disponible | memoria de trabajo (overhead_init) | VLA (MolmoAct2) | no disponible | MolmoAct2, paso 10k |
| 5hadytru/so101_GR00T_N1.6-3B_WM_v7_50k | 3B | memoria de trabajo (overhead_init) | VLA (GR00T N1.6) | no disponible | GR00T N1.6, paso 50k |
| π0.5 | no disponible | no disponible | VLA | no disponible | citado como referencia externa |

## Limitaciones y advertencias

- Licencia no comercial: es una obra derivada de G0.5 y se distribuye bajo la G0.5 Community License Agreement (no comercial + licencia de patente limitada). No se permite uso comercial sin autorizacion.
- Falta de endoso: Galaxea no respalda este trabajo; el nombre G0.5 se usa solo para indicar que esta construido sobre ese modelo.
- Dominio restringido: el modelo esta ajustado exclusivamente para manipulacion sobre el brazo SO-101 en el entorno simulado de SO-101 Bench, con dos camaras concretas y 6 articulaciones. No es un modelo de proposito general.
- Riesgo de fallo geometrico: la propia benchmark mide la brecha entre competencia semantica y geometrica; el rendimiento de validacion se mantiene en torno a 21 de 39 exitos (aproximadamente 54 %), lo que implica una tasa de fallo relevante.
- Generalizacion limitada: aunque se evalua sobre clases no vistas, el entrenamiento es puramente simulado y con aleatorizacion de dominio; el traslado a hardware real (sim-to-real) no esta validado en la informacion disponible.
- Dependencia de infraestructura: el uso correcto requiere el repositorio GalaxeaVLA, la configuracion Hydra resuelta y el servidor/evaluador de SO-101 Bench; no se documenta una via de despliegue independiente.
- Idiomas y cuantizaciones no documentados: no hay informacion sobre soporte multilingue (irrelevante para la tarea) ni sobre formatos de cuantizacion para reducir VRAM.
- Sesgos: no documentados en la informacion disponible.
- Seleccion de checkpoint: el checkpoint oficial es el paso final, no el pico de validacion, por lo que su rendimiento puede no ser el maximo alcanzable por el run.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/5hadytru/so101_bench_G0.5_full_fine_tune
- Licencia G0.5: https://huggingface.co/5hadytru/so101_bench_G0.5_full_fine_tune/blob/main/LICENSE-G0.5
- Modelo base OpenGalaxea/G05: https://huggingface.co/OpenGalaxea/G05
- Pagina del proyecto G0.5: https://opengalaxea.github.io/G05/
- Repositorio GalaxeaVLA: https://github.com/OpenGalaxea/GalaxeaVLA
- Dataset so101_bench_sim: https://huggingface.co/datasets/5hadytru/so101_bench_sim
- Repositorio SO-101 Bench: https://github.com/5hadytru/so101_bench
- Entrada MolmoAct2-SO101 (comparativa): https://huggingface.co/5hadytru/so101_bench_MolmoAct2-SO101_WM_full_fine_tune
- Guia de fine-tune de MolmoAct2 en SO-101 (referencia externa): https://vnrobo.com/en/blog/molmoact2-so101-lerobot-v06-finetune-guide

# maskjp/pimem-relative-joints-all10-sft-30k

## Resumen

piMEM (SFT) es una politica robotica vision-lenguaje-accion (VLA) publicada por el usuario maskjp como `maskjp/pimem-relative-joints-all10-sft-30k`. Se trata de un ajuste fino supervisado de `lerobot/pi05_base` sobre diez conjuntos de datos de manipulacion `L5vel/*-eef-merged-v30`, entrenado con el trainer piMEM RECAP en su fase SFT unicamente: no se entreno funcion de valor ni se calcularon etiquetas de ventaja, por lo que cada fotograma se condiciona al token de ventaja positiva. El modelo recibe tres camaras a 224x224, un estado de 7 dimensiones y una instruccion en lenguaje natural, y emite un chunk de 50 acciones de 10 dimensiones (6 articulaciones del brazo, pinza y 3 grados de libertad de la base movil).

La arquitectura parte de pi05: un backbone PaliGemma de 2B (SigLIP + Gemma) mas un experto de accion de 300M, con un total de 3.623.098.106 parametros. El entrenamiento cubre 1499 episodios y 3.089.476 fotogramas (17,2 h a 50 fps) sobre un brazo u850 montado en base movil. Es relevante ahora porque forma parte de la linea de trabajo de politicas VLA con representacion de acciones relativas por chunk y porque el autor publica el checkpoint final (paso 30K) de una ejecucion completa, junto con las metricas de ajuste offline y la receta exacta.

El repositorio tiene 7,5 GB, licencia apache-2.0 y, en el momento de la consulta, cero descargas y cero likes. Requiere el plugin `lerobot_policy_pimem`: el LeRobot estandar no reconoce el tipo de politica `pimem`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) sobre PaliGemma 2B (SigLIP + Gemma) mas experto de accion de 300M; capa de politica piMEM RECAP |
| Parametros totales | 3.623.098.106 (~3,62 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el modelo opera con K=1 (un unico fotograma por camara, sin memoria temporal) |
| Tipos de cuantizacion | no disponible (entrenamiento en bfloat16; no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible; el autor no publica lista de idiomas. Acepta instrucciones de lenguaje en el formato pi0.5 |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Dimension de accion | 10: `joint1`..`joint6` (rad), `gripper` (0-1), `base_x`, `base_y`, `base_yaw` |
| Dimension de estado | 7: `joint1`..`joint6` (rad), `gripper` |
| Representacion de acciones | deltas por chunk para las articulaciones 1-6 (`action_delta_dims=6`); pinza absoluta; base como delta de posicion |
| Entradas de vision | tres camaras (`left`, `right`, `wrist`) a 224x224 |
| Normalizacion | `QUANTILES` (q01/q99, en `norm_stats.json` y en los safetensors del procesador) |
| Chunk de accion | 50 pasos; 5 pasos de denoising en evaluacion |
| Tamano del repositorio | 7,5 GB |

## Arquitectura y entrenamiento

El modelo es un VLA de la familia pi0.5. El backbone es PaliGemma 2B (torre de vision SigLIP mas decoder Gemma) y se le anade un experto de accion de 300M; el ajuste fino es completo, incluida la torre SigLIP, partiendo de `lerobot/pi05_base`. La cabeza de accion genera un chunk de 50 pasos mediante flow matching, con cabezas separadas para brazo y base y un peso de 1,5x aplicado a las dimensiones de la base. Las articulaciones 1-6 se predicen como deltas relativas al estado de observacion al inicio del chunk; el postprocesador `PIMemAbsoluteActionsProcessorStep` vuelve a sumar el estado tras la desnormalizacion, de modo que la politica emite objetivos articulares absolutos. La pinza se emite como comando absoluto (unidades de dispositivo 3-241 convertidas por `pimem-prepare`) y la base como delta de posicion que la capa de robot suma a la pose actual. El estado se entrega tambien al modelo de lenguaje como texto discretizado, en el formato de pi0.5.

La receta de entrenamiento consta de 30.000 pasos con batch efectivo de 256 (64 por rango en 4 rangos, sin acumulacion de gradientes), learning rate pico de 5e-5 con decaimiento coseno hasta 5e-6 y 500 pasos de warmup, con EMA de 0,99 (los pesos publicados son los del EMA). Ademas de la perdida de flow matching se usan perdidas auxiliares: entropia cruzada sobre tokens FAST (vocabulario completo, peso 1,0, con el gradiente del backbone escalado a 0,1), entropia cruzada de subtarea (peso 1,0) y co-entrenamiento VLM sobre captions de LLaVA-Pretrain (8 por batch, peso 0,1). Se aplica aumento de imagenes de pi0.5 y desplazamientos temporales VLASH (el ancla de estado y del chunk de acciones se desplaza entre 0 y 20 fotogramas por delante de las imagenes). Precision bfloat16 con gradient checkpointing. El entrenamiento consumio 60,2 h en 4x RTX PRO 6000 Blackwell, a 7,22 s por paso. Los datos proceden de 10 conjuntos con 1499 episodios y 3.089.476 fotogramas (17,2 h a 50 fps) de un brazo u850 sobre base movil; el conjunto mayor es `u850-fridge-drink` (250 episodios, 968.523 fotogramas) y el menor `base4-mobile-bottle` (100 episodios, 69.748 fotogramas).

## Capacidades

- Generacion de acciones motoras: a partir de tres imagenes (224x224), el estado de 7 dimensiones y una instruccion en lenguaje natural, produce un chunk de 50 acciones de 10 dimensiones.
- Control de brazo de 6 articulaciones (posiciones articulares en radianes) y de pinza (comando absoluto en el rango 0-1).
- Control de base movil en el plano: `base_x`, `base_y` y `base_yaw` como deltas de posicion respecto a la pose actual.
- Interpretacion de instrucciones en lenguaje natural en el formato pi0.5, con el estado del robot presentado como texto discretizado.
- Tareas de manipulacion entrenadas: abrir nevera y coger bebida, limpiar mesa, abrir/cerrar puertas en base movil, colocar bolsas, colocar plato y croissant, coger/colocar taza y botella en base movil.
- Ejecucion de subtareas: la perdida de subtarea sugiere prediccion de subtarea, aunque el autor no detalla la interfaz de uso.
- No soporta tool calling ni function calling: no es un modelo de lenguaje general.
- No implementa agentes ni razonamiento multi-paso explicito mas alla de la generacion del chunk.
- No dispone de memoria temporal (K=1: un fotograma por camara) ni de modo de pensamiento.
- No incluye funcion de valor: el entrenamiento uso `--skip_vf`, por lo que el servidor deshabilita `infer_value` y todas las inferencias asumen ventaja positiva.
- Capacidades multilingues: no disponible; el autor no publica lista de idiomas.

## Casos de uso

- Manipulacion de nevera con brazo u850: el modelo puede ejecutar la secuencia de abrir la nevera y coger una bebida, tarea con mayor volumen de datos de entrenamiento (968.523 fotogramas), y emitir el chunk de 50 pasos necesario para coordinar aproximacion, agarre y extraccion.
- Limpieza de mesa con base fija: dado que `base4-clean-table` aporta 534.608 fotogramas, el checkpoint es adecuado para barrer o retirar objetos de una superficie, con la pinza comandada en modo absoluto.
- Apertura y cierre de puertas con base movil: el modelo dispone de las dimensiones de base (`base_x`, `base_y`, `base_yaw`) para aproximarse a la puerta y de las 6 articulaciones para el manejo de la manilla (506.473 fotogramas de `base4-mobile-door`).
- Colocacion de bolsas: tanto con brazo fijo (`u850-bag-place`, 477.058 fotogramas) como con base movil (`base4-mobile-bag`, 92.672 fotogramas), el modelo puede transportar y soltar objetos.
- Colocacion de plato y croissant: tarea de pick-and-place con objeto deformable, apoyada en 155.517 fotogramas, util como caso de referencia en demostraciones de manipulacion fina.
- Recogida y colocacion de taza o botella con base movil: 75.870 y 69.748 fotogramas respectivamente, utiles para navegacion corta y manipulacion combinadas.
- Punto de partida para RL o aprendizaje con funcion de valor: al ser una fase SFT pura sin funcion de valor, sirve como inicializacion para la fase posterior del trainer RECAP en la que se entrene el critico y se calculen ventajas.
- Reproduccion de referencia y evaluacion comparativa: al publicarse la receta completa (`run_summary.json`), el checkpoint permite reproducir el pipeline y comparar nuevas tecnicas de representacion de acciones relativas por chunk.

## Benchmarks y rendimiento

El autor publica una evaluacion offline sobre el propio conjunto de entrenamiento (sin split held-out). Setup: 600 fotogramas (12 episodios por dataset x 5 posiciones de cada episodio), mismos fotogramas y mismo ruido de flow matching para todos los checkpoints, 5 pasos de denoising. La metrica es la diferencia al cuadrado entre el chunk de acciones muestreado y el chunk grabado de 50 pasos, en unidades de accion normalizadas, promediada sobre las 10 dimensiones.

| Checkpoint (paso) | MSE en el paso 25 del chunk | MSE en todo el chunk |
|---|---|---|
| 10K | 0,0676 | 0,0756 |
| 20K | 0,0494 | 0,0557 |
| 30K (este repositorio) | 0,0466 | 0,0531 |

Mejora de 20K a 30K en el error del paso 25: 5,6 % (IC 95 %: 2,8-8,5 %, bootstrap sobre episodios); de 10K a 20K: 27 %. El checkpoint de 30K es el mejor en 8 de los 10 datasets; en los otros dos, el de 20K le supera en 0,0013 como maximo. El dataset mas debil es `base4-mobile-bag`, con 0,104 sobre el chunk completo (el siguiente mas alto es 0,067).

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni evaluaciones en robot (rollouts).

## Requisitos de hardware

- Entrenamiento publicado: 4x RTX PRO 6000 Blackwell, 30.000 pasos en 60,2 h (7,22 s/paso), bfloat16 con gradient checkpointing.
- Inferencia en bfloat16: los pesos ocupan aproximadamente 7,25 GB (3.623.098.106 parametros x 2 bytes), calculo derivado del recuento de parametros, no un dato publicado por el autor. El repositorio pesa 7,5 GB.
- VRAM estimada para inferencia: del orden de 10-14 GB contando activaciones y buffers de vision, estimacion derivada; no hay cifra oficial.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) con margen ajustado. No hay confirmacion del autor.
- No se publican versiones cuantizadas (GGUF, int8, int4), por lo que no se puede reducir la huella por debajo de bfloat16 sin conversion propia.
- Despliegue: plugin `lerobot_policy_pimem` con `PIMemPolicy.from_pretrained(...)`, o servidor websocket mediante `pimem-serve --checkpoint ... --num-steps 5`. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp.
- El servidor deshabilita `infer_value`, porque el entrenamiento uso `--skip_vf`.
- Latencia y throughput de inferencia: no disponibles. El unico dato temporal publicado es el coste de entrenamiento (7,22 s/paso); en evaluacion se usan 5 pasos de denoising por chunk de 50 acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / memoria | Entrada y salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `maskjp/pimem-relative-joints-all10-sft-30k` | 3,62 mil M | K=1, un fotograma por camara, sin memoria temporal | 3 camaras 224x224 + estado 7 dim + instruccion -> chunk de 50 acciones de 10 dim | apache-2.0 | HuggingFace, requiere plugin `lerobot_policy_pimem` |
| `lerobot/pi05_base` (modelo de partida) | PaliGemma 2B + experto de 300M | no disponible | VLA pi0.5 (vision, lenguaje y acciones) | no disponible | HuggingFace |
| Familia pi0 / pi0.5 (referenciada en las etiquetas) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables en la informacion proporcionada sobre alternativas de la misma categoria (por ejemplo, otras politicas VLA de tamano comparable) para completar una comparacion de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- No existe split held-out: los diez datasets se usaron completos en entrenamiento. Los MSE publicados miden ajuste a los datos de entrenamiento, no capacidad de generalizacion; el propio autor indica que el test real son los rollouts en robot.
- Riesgo de sobreajuste a las diez tareas, escenas y posiciones de demostracion. El dataset mas debil (`base4-mobile-bag`) muestra un error claramente superior.
- Requiere el plugin `lerobot_policy_pimem`; el LeRobot estandar no reconoce el tipo de politica `pimem`, lo que complica la integracion en pipelines existentes.
- No incluye funcion de valor (`--skip_vf`): el servidor tiene `infer_value` deshabilitado y no es posible seleccionar o puntuar trayectorias por valor. Todas las inferencias se condicionan al token de ventaja positiva.
- Sin memoria temporal (K=1, un fotograma por camara): puede degradarse en tareas largas o con oclusiones donde la historia reciente es informativa.
- La representacion de acciones es dependiente del chunk y relativa al estado inicial. Si se omite `PIMemAbsoluteActionsProcessorStep`, las acciones emitidas no son objetivos absolutos y el robot recibira comandos incorrectos.
- Espacio de accion fijo de 10 dimensiones y morfologia concreta (brazo u850 sobre base movil, tres camaras `left`, `right`, `wrist`): no es directamente reutilizable en otros robots sin reentrenamiento.
- Sesgos: no se publica analisis de sesgos. Los datos provienen de teleoperacion humana en tareas concretas, lo que puede trasladar sesgos de posicion, iluminacion y estilo de demostracion.
- Riesgo de alucinacion o de acciones incorrectas: no cuantificado por el autor; no hay evaluaciones de seguridad ni de fallos en robot.
- Licencia apache-2.0 en el repositorio, lo que en principio permite uso comercial, pero el modelo depende de `lerobot/pi05_base` y del plugin `lerobot_policy_pimem`, cuyas licencias no se detallan en la informacion disponible. Conviene verificarlas antes de un uso comercial.
- Fecha de publicacion en HuggingFace: 28 de septiembre de 2026. El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maskjp/pimem-relative-joints-all10-sft-30k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Datasets citados en la model card (identificadores de HuggingFace):
  - https://huggingface.co/datasets/L5vel/u850-fridge-drink-eef-merged-v30
  - https://huggingface.co/datasets/L5vel/base4-clean-table-eef-merged-v30
  - https://huggingface.co/datasets/L5vel/base4-mobile-door-eef-merged-v30
  - https://huggingface.co/datasets/L5vel/u850-bag-place-eef-merged-v30
  - https://huggingface.co/datasets/L5vel/base4-plate-croissant-eef-merged-v30
  - https://huggingface.co/datasets/L5vel/u850-fridge-open-eef-merged-v30
  - https://huggingface.co/datasets/L5vel/base4-mobile-bag-eef-merged-v30
  - https://huggingface.co/datasets/L5vel/base4-mobile-place-cup-eef-merged-v30
  - https://huggingface.co/datasets/L5vel/base4-mobile-cup-eef-merged-v30
  - https://huggingface.co/datasets/L5vel/base4-mobile-bottle-eef-merged-v30
- Repositorio del plugin `lerobot_policy_pimem`, herramienta `pimem-prepare` y servidor `pimem-serve`: no disponible (no se incluyen URL en la informacion proporcionada).
- Articulo o informe tecnico asociado: no disponible.
- Demo publica: no disponible.

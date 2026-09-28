# 5hadytru/so101_bench_GR00T_N1.7-3B

## Resumen

El modelo `5hadytru/so101_bench_GR00T_N1.7-3B` es un ajuste fino del modelo de robotica `nvidia/GR00T-N1.7-3B` (familia GR00T N1.7, NVIDIA) especializado en el brazo robotico SO-101 sobre las tareas de sobremesa del banco simulado SO-101 Bench. Es un modelo VLA (vision-language-action) que recibe imagenes de camaras, el estado de las articulaciones y una instruccion en lenguaje natural, y devuelve un chunk de acciones motoras de 16 pasos. Se distribuye como un checkpoint de la comunidad (autor `5hadytru`) con 0 descargas y 0 likes en el momento de la consulta.

El interes principal es que demuestra un flujo completo de ajuste de un modelo fundacional de robotica sobre un embodiment concreto (SO-101, 5 articulaciones de brazo mas pinza) usando datos simulados generados en Isaac Lab. Solo se han entrenado los modulos de la cabeza de accion (proyector, modelo de difusion y VLLN) mientras el backbone VLM (Cosmos-Reason2-2B) permanece congelado, lo que reduce coste de entrenamiento. El entrenamiento se detuvo en el paso 16.000, antes de completar el schedule previsto de 20.000 pasos.

La relevancia es acotada y experimental: es un checkpoint de investigacion para evaluar politicas VLA en manipulacion de sobremesa, con una tasa de exito del 48,7% (19/39 episodios) en su propio conjunto de validacion simulado. No es un modelo de proposito general ni se ha validado en hardware real segun la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en GR00T N1.7; backbone VLM Cosmos-Reason2-2B congelado mas cabeza de accion entrenada (proyector, modelo de difusion, VLLN) |
| Parametros totales | 3.144.016.000 (3,14 B, dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (horizonte de accion de 16 pasos) |
| Tipos de cuantizacion | no disponible (entrenado en bf16) |
| Idiomas soportados | no disponible (recibe instrucciones de tarea como texto, sin cobertura de idiomas declarada) |
| Licencia | other (license_link a nvidia/GR00T-N1.7-3B) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un modelo VLA de la familia GR00T N1.7. La arquitectura combina un backbone VLM (Cosmos-Reason2-2B) encargado de procesar la vision y el lenguaje, y una cabeza de accion que genera las trayectorias motoras; en este ajuste fino la cabeza incluye proyector, modelo de difusion y VLLN. Durante el entrenamiento se congelaron tanto el LLM del backbone VLM como la torre de vision, y solo se actualizaron los modulos de la cabeza de accion. El modelo trabaja sobre el embodiment etiquetado como `NEW_EMBODIMENT`, con entradas de video (`overhead`, `wrist`, `overhead_init`, `wrist_init`), estado (`single_arm` de 5 grados de libertad y `gripper` de 1), accion (`single_arm` relativo al estado y `gripper` absoluto) y lenguaje (instruccion textual de tarea).

Los datos de entrenamiento proceden del dataset `5hadytru/so101_bench_sim_WM`, con 3.629 episodios y 1.996.120 frames a 30 fps simulados en Isaac Lab. Cada episodio incluye cuatro camaras de 640×480: `overhead` y `wrist` del frame actual, mas `overhead_init` y `wrist_init` (frames capturados cuando el episodio se estabiliza y mantenidos fijos durante todo el episodio, funcionando como "memoria de trabajo"). El ajuste fino se ejecuto con Isaac-GR00T @ `51d4c89`, batch global 640 (160 por GPU × 4 GPUs), LR pico 1e-4 con schedule coseno y 5% de warmup, weight decay 1e-5, precision bf16 y DeepSpeed ZeRO-2, sobre 4× A100-SXM4-80GB durante unas 36 horas (aproximadamente 8 s por paso). El preprocesado de imagen aplica borde corto 256, recorte 230×230 (fraccion 0,95) y reescalado a 256×256, con color jitter. El schedule sufrio un cambio en el paso 6.000 (de 51.000 a 20.000 pasos previstos) y un reinicio tras un fallo de almacenamiento en el paso 4.000, deteniendose el entrenamiento en el paso 16.000 por presupuesto de computo.

## Capacidades

- Generacion de acciones motoras de manipulacion para el brazo SO-101: predice chunks de 16 pasos de `single_arm` (relativo al estado) y `gripper` (absoluto).
- Percepcion visual multi-camara: procesa cuatro flujos de video (`overhead`, `wrist`, `overhead_init`, `wrist_init`) a 640×480.
- Seguimiento de instrucciones en lenguaje natural para tareas de sobremesa: bins, named bin, next-to, between y movimientos direccionales.
- Condicionamiento por estado de articulaciones: consume 6-D de posiciones articulares del SO-101 en unidades calibradas de LeRobot.
- Memoria de trabajo basada en frames iniciales fijos (`overhead_init`, `wrist_init`) repetidos en cada consulta.
- No se declara soporte de tool calling, function calling, agentes, multi-step reasoning generico ni capacidades de audio.

## Casos de uso

- Manipulacion robotica de sobremesa en simulacion: el modelo se emplea para colocar objetos en contenedores o posiciones nombradas sobre una mesa simulada, devolviendo chunks de 16 acciones que el cliente SO-101 Bench ejecuta.
- Investigacion en modelos VLA: sirve como punto de partida reproducible para estudiar el ajuste de GR00T N1.7 sobre un embodiment concreto con backbone congelado.
- Evaluacion sim-to-real y benchmarking de politicas: al estar entrenado sobre tareas estandarizadas del SO-101 Bench, permite medir tasas de exito por split de objeto (vistos, objetos no vistos de clases vistas, clases no vistas) y por apariencia (canonica frente a aleatorizada).
- Automatizacion de pick-and-place condicionada por lenguaje: se puede usar para comprobar el seguimiento de instrucciones de tarea (por ejemplo, "pon el objeto en el bin nombrado") en entornos simulados antes de transferir a hardware.
- Estudio de memoria de trabajo en politicas: el uso de frames iniciales fijos permite analizar como influye el contexto visual estatico en la precision de la manipulacion.
- Generacion de trayectorias de referencia en investigacion de control: las acciones relativas del brazo mas la accion absoluta de la pinza pueden alimentar controladores o compararse con politicas alternativas.
- Base para nuevos ajustes finos sobre otros brazos o datasets: al ser un checkpoint derivado de GR00T N1.7, puede reajustarse para otros embodiments cambiando la configuracion de modalidad.

## Benchmarks y rendimiento

No hay resultados en benchmarks estandar de lenguaje o codigo (MMLU, HumanEval, GSM8K, etc.). La model card publica validacion sobre el SO-101 Bench simulado. Conjunto de validacion `real_gr00t_val_v2`: 39 episodios (13 por split), horizonte de accion 16, intervalo de confianza del 95% de aproximadamente ±16 puntos porcentuales.

| Checkpoint | Exito | between | 4-obj bin | move | named bin | next-to |
|---|---|---|---|---|---|---|
| 16000 (este) | 19/39 (48,7%) | 3/9 | 0/3 | 6/9 | 6/9 | 4/9 |

Desglose adicional: por split, vistos 9/13, objetos no vistos de clases vistas 6/13, clases no vistas 4/13; por apariencia, canonica 8/20, aleatorizada 11/19. Los checkpoints 12k y 14k obtuvieron 22/39 en el mismo conjunto, y las pruebas emparejadas indican que no hay diferencia significativa (McNemar p ≈ 0,5).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 3,14 B de parametros en bf16/fp16 los pesos ocupan en torno a 6,3 GB, a lo que hay que sumar activaciones y el procesado de cuatro flujos de video a 256×256.
- GPU empleadas en entrenamiento: 4× A100-SXM4-80GB (batch global 640, aproximadamente 8 s/paso, unas 36 horas).
- Encaje en GPU de consumo: no confirmado por la informacion disponible; el numero de parametros (3,14 B) es compatible con GPUs consumer de 16-24 GB, pero no se aporta una medicion de VRAM de inferencia.
- Opciones de despliegue: servidor de inferencia GR00T (`gr00t/eval/run_gr00t_server.py`) con Isaac-GR00T @ `51d4c89`, LeRobot e Isaac Lab. Requiere acceso al modelo con gating `nvidia/Cosmos-Reason2-2B`.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_bench_GR00T_N1.7-3B (este) | 3,14 B | horizonte de accion 16 pasos | 19/39 (48,7%) en SO-101 Bench sim | other (license_link a GR00T N1.7) | HuggingFace, 0 descargas |
| nvidia/GR00T-N1.7-3B (base) | no disponible en la informacion proporcionada | no disponible | no disponible para el base sin ajustar en este conjunto | other | HuggingFace (NVIDIA) |
| Otros VLA comparables (por ejemplo, de la categoria de manipulacion robotica) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tasa de exito moderada: 48,7% (19/39) en el propio conjunto de validacion simulado, con intervalos de confianza amplios (±16 pp) y 0/3 en la tarea "4-obj bin".
- Diferencia no significativa frente a checkpoints anteriores (12k y 14k con 22/39): este checkpoint de 16.000 pasos no mejora de forma estadisticamente demostrable a los previos.
- Especifico de un embodiment y de un conjunto de tareas: entrenado solo para el brazo SO-101 y las tareas del SO-101 Bench (bin, named bin, next-to, between, move); no es un modelo de proposito general.
- Validacion exclusivamente en simulacion (Isaac Lab): no se aporta evidencia de transferencia a un SO-101 real (sim-to-real no verificado).
- Dependencia del formato de entrada: requiere usar `overhead_init` y `wrist_init` como frames iniciales fijos repetidos en cada consulta; un uso incorrecto de estas entradas degradara el comportamiento.
- Requiere acceso al modelo con gating `nvidia/Cosmos-Reason2-2B` para el servidor de inferencia, lo que anade una dependencia externa y posibles restricciones de acceso.
- Licencia "other": las condiciones de uso comercial vienen heredadas del enlace a `nvidia/GR00T-N1.7-3B`; deben revisarse antes de cualquier uso productivo.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de terceros.
- No se declaran sesgos, idiomas soportados ni riesgos de alucinacion en texto; el modelo no es un generador de lenguaje de uso general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/5hadytru/so101_bench_GR00T_N1.7-3B
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/5hadytru/so101_bench_sim_WM
- Repositorio de codigo Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Modelo VLM gated requerido: https://huggingface.co/nvidia/Cosmos-Reason2-2B

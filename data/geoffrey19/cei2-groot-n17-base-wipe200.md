# Geoffrey19/cei2-groot-n17-base-wipe200

## Resumen

`Geoffrey19/cei2-groot-n17-base-wipe200` es un ajuste fino completo (full fine-tune) del modelo fundacional de robotica GR00T N1.7-3B de NVIDIA, entrenado por el usuario Geoffrey19 sobre 199 episodios reales de demostraciones teleoperadas de una tarea de borrado de pizarra. El modelo parte de `nvidia/GR00T-N1.7-3B` y se especializa en el embodiment concreto formado por un brazo Franka FR3 de 7 articulaciones y una mano LEAP de 16 articulaciones, sumando 23 posiciones articulares absolutas en radianes como espacio de estado y accion.

La relevancia de esta publicacion es doble. Por un lado, demuestra el flujo de post-entrenamiento de GR00T N1.7 sobre hardware real (no simulado) con una receta reproducible documentada hasta el detalle de normalizacion, orden de articulaciones y configuracion de entrenamiento. Por otro, expone de forma explicita las limitaciones de un ajuste de este tipo: no hay conjunto de validacion retenido, no se reportan resultados en robot real y las capas especificas del embodiment arrancan sin entrenar en el checkpoint base.

El modelo tiene 3.144.016.000 parametros en float32 (1.030 tensores, 12,6 GB de repositorio) y se distribuye bajo la licencia de NVIDIA, que restringe el uso a investigacion y evaluacion no comercial. La tarea entrenada es "Pick up the eraser and wipe the whiteboard clean" sobre una unica camara RGB exterior de 640x480 a 15 Hz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (vision-language-action, backbone Cosmos-Reason2-2B) |
| Parametros totales | 3.144.016.000 (1.030 tensores) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA License (nvidia-license), uso limitado a investigacion y evaluacion no comercial |
| Formato de pesos | safetensors (3 shards: `model-0000{1,2,3}-of-00003.safetensors` + indice) |

## Arquitectura y entrenamiento

El modelo es un GR00T N1.7, la familia de modelos vision-language-action de NVIDIA para robotica, construido sobre el backbone `nvidia/Cosmos-Reason2-2B`. La cabeza de accion predice chunks de 16 pasos de objetivos articulares relativos al estado (tipo `NON_EEF`), y la politica suma de nuevo el estado para emitir posiciones absolutas. El ajuste fino es completo: se entrenan el LLM (`--tune-llm`), la torre visual (`--tune-visual`), el proyector y la cabeza de accion. La normalizacion usa percentiles q01/q99 mapeados a -1/+1 con recorte, y las estadisticas de acciones relativas se calculan por paso de chunk a partir de este mismo dataset (`statistics.json`).

El entrenamiento se realizo durante 20.000 pasos con batch de 32 en una sola GPU, learning rate pico de 2e-5 con warmup del 2,5 % y decaimiento coseno, weight decay de 1e-5 y precision mixta bfloat16 sobre pesos float32. Los datos son 199 episodios reales (99.133 frames a 15 Hz) de teleoperacion sobre FR3 + LEAP, con una camara exterior y estado/accion de 23 posiciones articulares absolutas en radianes; `action[t]` es la posicion medida 1/15 s despues, no el comando enviado. Se usaron los 199 episodios para entrenamiento, sin split de validacion. La perdida media de flow-matching descendio de 1,0587 (pasos 0-100) a 0,0236 (pasos 19.000-20.000); son ajustes a los episodios de entrenamiento, no una medida de calidad de politica.

## Capacidades

- Generacion de acciones motoras de 23 dimensiones (7 del brazo FR3 + 16 de la mano LEAP) condicionadas por observacion visual y descripcion de tarea en lenguaje natural.
- Prediccion en chunks de 16 pasos con horizonte de ejecucion configurable (`--execution-horizon 16` en la evaluacion offline).
- Percepcion visual mediante una unica camara RGB exterior de 640x480 (`exterior_1`).
- Comprension de instrucciones de tarea en lenguaje natural a traves de la anotacion `annotation.human.task_description`.
- Aprendizaje por imitacion sobre demostraciones teleoperadas reales (no simuladas).
- Evaluacion offline open-loop sobre datasets en formato GR00T mediante `gr00t/eval/open_loop_eval.py`.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo thinking; el modelo es especifico de robotica.

## Casos de uso

- Investigacion en aprendizaje por imitacion sobre hardware real: el modelo sirve como referencia reproducible de post-entrenamiento de GR00T N1.7 con una receta documentada paso a paso (normalizacion, orden de articulaciones, hiperparametros), util para comparar variantes de inicializacion (base frente a CEI).
- Borrado de pizarra con FR3 + LEAP: la politica esta entrenada para la tarea "Pick up the eraser and wipe the whiteboard clean" en una unica escena y camara, y puede desplegarse en ese montaje concreto para experimentos de ejecucion.
- Evaluacion open-loop de politicas VLA: permite medir el error de prediccion de acciones sobre copias del dataset en formato GR00T antes de arriesgar hardware, usando `open_loop_eval.py` con horizontes de 16 pasos.
- Base para ajustes posteriores en el mismo embodiment: al estar entrenado sobre el slot `NEW_EMBODIMENT` con FR3 + LEAP, sirve como punto de partida para nuevas tareas sobre el mismo robot (por ejemplo, otras superficies o herramientas).
- Estudio de la brecha entre perdida de entrenamiento y calidad de politica: al no haber split retenido, el modelo es un caso de analisis sobre por que la perdida de flow-matching no equivale a rendimiento en robot real.
- Integracion en pipelines de investigacion con Isaac-GR00T: el repositorio incluye `experiment_cfg/` con la configuracion resuelta de entrenamiento y procesador, lo que facilita reproducir el entorno en contenedor con `docker/groot_cei2_configs.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta perdida media de entrenamiento (flow-matching) frente a tres ejecuciones relacionadas:

| Pasos | pi05 desde base | pi05 desde CEI | GR00T desde base | GR00T desde CEI |
|---|---|---|---|---|
| 0-100 | 0,1284 | 0,1352 | 1,0587 | 0,1817 |
| 4.900-5.000 | 0,0150 | 0,0130 | 0,0596 | 0,0344 |
| 9.900-10.000 | 0,0113 | 0,0102 | 0,0439 | 0,0237 |
| 14.900-15.000 | 0,0084 | 0,0076 | 0,0270 | 0,0146 |
| 19.000-20.000 | 0,0066 | 0,0060 | 0,0236 | 0,0129 |

Estos valores comparan ejecuciones del mismo modelo entre si y son ajustes a los episodios de entrenamiento, no medidas de calidad de politica. No hay evaluacion en robot real ni conjunto retenido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3,14 B parametros en float32 los pesos ocupan aproximadamente 12,6 GB, por lo que se requiere margen adicional para activaciones y backbone.
- GPU recomendadas: el autor entreno en una sola GPU sin especificar modelo; por tamano y backbone Cosmos-Reason2-2B, son razonables A100 o H100 para entrenamiento e inferencia comoda, y GPUs consumer de 24 GB o mas para inferencia en precision reducida (no confirmado en la informacion).
- Cabe en GPU consumer: no confirmado; los pesos publicados en float32 (12,6 GB) dejan poco margen en tarjetas de 16 GB y requieren conversion a bfloat16 o similar para 24 GB.
- Opciones de despliegue: Isaac-GR00T (libreria `gr00t`), con la configuracion de modalidad `docker/groot_cei2_configs.py` del repositorio CEI-2.0; el backbone debe apuntarse a una copia local de `nvidia/Cosmos-Reason2-2B` con el directorio nombrado de forma que contenga `nvidia/Cosmos-Reason2`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Geoffrey19/cei2-groot-n17-base-wipe200` | 3,14 B | no disponible | VLA FR3 + LEAP, borrado de pizarra | NVIDIA License (no comercial) | Hugging Face, 0 descargas |
| `Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-wipe200` | no disponible | no disponible | Misma tarea, inicializado desde CEI mid-training | NVIDIA License (no comercial) | Hugging Face |
| `nvidia/GR00T-N1.7-3B` | 3 B (aproximado por el nombre) | no disponible | VLA fundacional generalista | NVIDIA License | Hugging Face (modelo base) |

La diferencia principal frente al modelo base es la especializacion en un unico embodiment y tarea, con capas por embodiment entrenadas desde cero. Frente a la variante CEI, la perdida de entrenamiento es mayor en todos los tramos (0,0236 frente a 0,0129 al final), lo que sugiere que la inicializacion CEI acelera la convergencia en esta tarea, aunque el autor advierte que la perdida no mide calidad de politica.

## Limitaciones y advertencias

- Sin evaluacion con conjunto retenido ni resultados en robot real: todas las cifras son perdida de entrenamiento.
- Una sola tarea, una sola escena y una sola camara; no se espera generalizacion fuera de ese montaje.
- El sincronizado temporal esta alineado por reloj del host, no por trigger de hardware (ver archivos `alignment/` del dataset).
- Las capas por embodiment arrancan sin entrenar: el checkpoint base no tiene ningun embodiment mapeado al slot `NEW_EMBODIMENT`, por lo que el codificador de estado y el decodificador de accion para este robot parten de cero.
- Orden de articulaciones no estandar: el modelo trabaja en orden de modelo, y el cliente debe aplicar la permutacion `P = [0,1,2,3,4,5,6,8,7,9,10,12,11,13,14,16,15,17,18,19,20,21,22]` al estado del robot antes de enviarlo y de nuevo a las acciones devueltas; omitirlo produce comandos incorrectos.
- El dataset original lista 200 episodios pero falta el archivo del episodio 36; los 199 restantes se renumeraron 0-198.
- Licencia NVIDIA que limita el uso a investigacion y evaluacion no comercial; no apta para produccion comercial sin licencia adicional.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, aunque al ser un modelo de accion el riesgo se manifiesta como comandos fisicamente invalidos o fuera de limites articulares.
- El repositorio no incluye estado de optimizador, scheduler ni RNG, y omite `backbone.model.lm_head.weight`; no es reanudable tal cual para continuar el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Geoffrey19/cei2-groot-n17-base-wipe200
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Variante desde CEI mid-training: https://huggingface.co/Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-wipe200
- Repositorio Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Backbone Cosmos-Reason2-2B: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Dataset de demostraciones: `zwx/wipe_whiteboard_franka_leap_15hz_absolute_200` (referenciado en la model card; no se proporciona URL directa)

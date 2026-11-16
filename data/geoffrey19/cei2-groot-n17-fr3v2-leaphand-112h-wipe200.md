# Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-wipe200

## Resumen

GR00T N1.7 post-entrenado sobre demostraciones reales de un brazo Franka FR3 con mano LEAP para la tarea de borrar una pizarra blanca. Lo desarrolla el usuario Geoffrey19 a partir del modelo base `nvidia/GR00T-N1.7-3B`, un modelo fundacional de robótica de NVIDIA con 3.144 millones de parametros, y del checkpoint intermedio de CEI-2.0 entrenado durante 50.000 pasos sobre 112 horas de demostraciones DROID retargetizadas al embodiment FR3 + LEAP.

El modelo resuelve una tarea concreta de manipulacion robotica: coger el borrador y limpiar la pizarra, mediante aprendizaje por imitacion (imitation learning) con prediccion de acciones por chunks de 16 pasos. Es relevante porque muestra el flujo completo de post-entrenamiento de un modelo fundacional de robotica sobre hardware real y una tarea especifica, con datos teleoperados a 15 Hz.

La ficha tecnica esta limitada por la escasez de informacion publica: no hay evaluacion en robot real ni split de validacion, y todas las metricas reportadas son perdidas de entrenamiento. El modelo se distribuye bajo licencia NVIDIA, restringida a investigacion y evaluacion no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (transformer con backbone de vision-lenguaje Cosmos-Reason2-2B y cabeza de acciones) |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA License (uso no comercial, investigacion y evaluacion) |
| Formato de pesos | safetensors (3 shards, float32) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/GR00T-N1.7-3B`, un modelo fundacional de robotica que combina un backbone de vision-lenguaje (Cosmos-Reason2-2B) con una cabeza de prediccion de acciones. El post-entrenamiento es un fine-tune completo (`--tune-llm --tune-visual`, proyector y cabeza de acciones) sobre el checkpoint intermedio `cei2_groot_n17_fr3v2_leaphand_4node/checkpoint-50000`, que a su vez se entreno durante 50.000 pasos sobre 112 horas de demostraciones DROID retargetizadas a un FR3 + LEAP hand y re-renderizadas en las escenas originales (batch 1024 en 32 GPUs).

Los datos de post-entrenamiento son 199 episodios (99.133 frames a 15 Hz) de teleoperacion real sobre FR3 (7 articulaciones) y LEAP hand (16 articulaciones), con una camara RGB exterior de 640x480. El estado y la accion son 23 posiciones articulares absolutas en radianes; las acciones se predicen como chunks de 16 pasos relativos al estado (`NON_EEF`) y el modelo suma el estado para devolver posiciones absolutas. La normalizacion usa percentiles q01/q99 mapeados a -1/+1 con recorte. El entrenamiento fue de 20.000 pasos, batch 32 en una GPU, learning rate 2e-5 con warmup del 2,5 % y decaimiento coseno, weight decay 1e-5, precision mixta bfloat16 sobre pesos float32.

## Capacidades

- Prediccion de acciones motoras para un brazo Franka FR3 de 7 articulaciones y una mano LEAP de 16 articulaciones (23 dimensiones en total).
- Generacion de chunks de 16 pasos de acciones relativas al estado, convertidas a posiciones articulares absolutas.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas con una unica camara RGB exterior.
- Condicionamiento por descripcion de tarea en lenguaje natural (`annotation.human.task_description`).
- Orden articular especifico del modelo (mapeo `P` documentado) que debe aplicarse al estado del robot antes de la inferencia y a las acciones devueltas.
- No soporta tool calling, agentes, vision general, audio ni razonamiento multilingue: es un modelo de politica robotica, no un LLM de proposito general.

## Casos de uso

- Investigacion en aprendizaje por imitacion: reproducir el pipeline completo de post-entrenamiento de GR00T N1.7 sobre una tarea real, comparando el arranque desde el checkpoint base frente al checkpoint CEI.
- Evaluacion offline de politicas roboticas: usar `gr00t/eval/open_loop_eval.py` sobre un dataset en formato GR00T para medir el error de prediccion de acciones por horizonte de ejecucion de 16 pasos.
- Benchmark de recetas de post-entrenamiento: el modelo sirve como referencia para estudiar el efecto del mid-training sobre datos retargetizados (DROID a FR3 + LEAP) frente al entrenamiento directo desde el modelo base.
- Prototipado de tareas de manipulacion con mano antropomorfa: la tarea de borrar una pizarra ejercita agarre, transporte y movimiento de barrido con 16 articulaciones de mano.
- Base para fine-tuning en tareas similares: al ser un fine-tune completo sobre un embodiment documentado (`NEW_EMBODIMENT`), puede servir de punto de partida para tareas de limpieza o borrado en el mismo montaje.
- Estudio de normalizacion y estadisticas de acciones: el repo incluye `statistics.json` con percentiles por paso de chunk, util para analizar como afecta la normalizacion a la estabilidad del entrenamiento.
- Validacion de mapeos de orden articular: el mapeo `P` documentado permite verificar la coherencia entre el modelo y la configuracion del robot real antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar en la informacion disponible. La unica metrica reportada es la perdida de entrenamiento (objetivo de flow-matching propio de cada modelo):

| Pasos | pi05 desde base | pi05 desde CEI | GR00T desde base | GR00T desde CEI |
|---|---|---|---|---|
| 0-100 | 0,1284 | 0,1352 | 1,0587 | 0,1817 |
| 4.900-5.000 | 0,0150 | 0,0130 | 0,0596 | 0,0344 |
| 9.900-10.000 | 0,0113 | 0,0102 | 0,0439 | 0,0237 |
| 14.900-15.000 | 0,0084 | 0,0076 | 0,0270 | 0,0146 |
| 19.000-20.000 | 0,0066 | 0,0060 | 0,0236 | 0,0129 |

Estos valores son ajustes a los episodios de entrenamiento, no medidas de calidad de politica, y solo son comparables entre ejecuciones del mismo modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12,6 GB en float32 (tamano del repo); en bfloat16 o float16 se reduce a unos 6,3 GB para los pesos.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM para inferencia en precision reducida; A100 o H100 para entrenamiento y evaluacion a gran escala.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas (RTX 4080, RTX 4090, RTX 5090) usando precision reducida.
- Opciones de despliegue: Isaac-GR00T con la configuracion de modalidad `docker/groot_cei2_configs.py` del repositorio CEI-2.0; requiere una copia local de `nvidia/Cosmos-Reason2-2B` con ese nombre de directorio para que GR00T resuelva la clase del backbone.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cei2-groot-n17-fr3v2-leaphand-112h-wipe200 | 3,14 B | no disponible | Borrado de pizarra con FR3 + LEAP | NVIDIA License (no comercial) | Hugging Face |
| cei2-groot-n17-base-wipe200 | no disponible | no disponible | Misma tarea, desde checkpoint base | NVIDIA License (no comercial) | Hugging Face |
| nvidia/GR00T-N1.7-3B | 3 B | no disponible | Modelo fundacional de robotica | NVIDIA License | Hugging Face |

## Limitaciones y advertencias

- No hay evaluacion con split de validacion ni resultados en robot real; todas las cifras son perdida de entrenamiento.
- Una sola tarea, una sola escena y una sola camara: la generalizacion fuera de ese montaje no esta caracterizada.
- El alineamiento temporal se hace por reloj del host, no por trigger hardware, lo que puede introducir desfases.
- El orden articular del modelo difiere del orden de los motores LEAP en las grabaciones; un cliente debe aplicar el mapeo `P` en ambos sentidos o las acciones seran incorrectas.
- La licencia NVIDIA limita el uso a investigacion y evaluacion no comercial; no apto para produccion comercial sin licencia adicional.
- Riesgo de alucinacion y sesgos: no aplica en el sentido de LLM, pero la politica puede producir trayectorias no validas fuera de la distribucion de entrenamiento.
- El checkpoint no incluye estado del optimizador, scheduler ni RNG, por lo que no se puede reanudar el entrenamiento exactamente.
- `backbone.model.lm_head.weight` no se almacena; el modelo no puede usarse como LLM generativo.
- Idiomas soportados: no disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-wipe200
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Variante desde checkpoint base: https://huggingface.co/Geoffrey19/cei2-groot-n17-base-wipe200
- Repositorio Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Dataset DROID: https://droid-dataset.github.io/
- Dataset de la tarea: `zwx/wipe_whiteboard_franka_leap_15hz_absolute_200` (referenciado en la model card)

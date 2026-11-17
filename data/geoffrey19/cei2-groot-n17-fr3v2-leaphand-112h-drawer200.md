# Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-drawer200

## Resumen

GR00T N1.7 post-entrenado sobre una tarea real de manipulacion con brazo Franka FR3 y mano LEAP. Se trata de un fine-tune completo del modelo fundacional de robotica de NVIDIA (GR00T-N1.7-3B), partiendo de un checkpoint de mid-training denominado CEI-2.0, que fue entrenado durante 50.000 pasos sobre 112 horas de demostraciones del dataset DROID retargetizadas a la morfologia FR3 + LEAP hand y re-renderizadas en las escenas originales. El modelo resultante ejecuta una politica de imitacion para la tarea concreta de abrir un cajon, recoger un objeto de la mesa, depositarlo dentro y cerrar el cajon.

El modelo tiene 3.144.016.000 parametros (1.030 tensores en float32) y se distribuye en formato safetensors con un peso total de repositorio de 12,6 GB. La arquitectura subyacente es la de GR00T N1.7, un modelo vision-language-action (VLA) de NVIDIA disenado para control robotico generalista, aqui especializado mediante fine-tune completo (LLM, torre visual, proyector y cabeza de acciones) sobre 200 episodios reales teleoperados.

Es relevante porque demuestra el flujo de trabajo de post-entrenamiento de un modelo fundacional robotico sobre hardware asequible (una sola GPU) y datos reales de una tarea especifica, ademas de documentar de forma inusualmente detallada el pipeline de normalizacion, el orden de articulaciones y las estadisticas de entrenamiento. La licencia NVIDIA limita su uso a investigacion y evaluacion no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (vision-language-action, transformer multimodal con cabeza de acciones por flow-matching) |
| Parametros totales | 3.144.016.000 (1.030 tensores) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (modelo de robotica; las instrucciones de tarea son texto) |
| Licencia | NVIDIA License (nvidia-license), uso limitado a investigacion y evaluacion no comercial |
| Formato de pesos | safetensors (3 shards: `model-0000{1,2,3}-of-00003.safetensors`, float32) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de GR00T N1.7, un VLA que combina una torre visual, un LLM y una cabeza de acciones. En este post-entrenamiento se ajustaron simultaneamente el LLM (`--tune-llm`), la torre visual (`--tune-visual`), el proyector y la cabeza de acciones. La politica genera chunks de 16 pasos de objetivos articulares relativos al estado (`NON_EEF`); el modelo suma el estado de vuelta para producir posiciones absolutas. La normalizacion usa percentiles q01/q99 mapeados a −1/+1 con recorte, y las estadisticas de acciones relativas se calculan por paso de chunk a partir del propio dataset (`statistics.json`).

Los datos de entrenamiento son 200 episodios teleoperados reales (114.493 frames a 15 Hz) sobre un Franka FR3 de 7 articulaciones con mano LEAP de 16 articulaciones, con una unica camara RGB exterior a 640×480. El estado y la accion son 23 posiciones articulares absolutas en radianes; `action[t]` es la posicion medida 1/15 s despues (remuestreada), no el comando enviado. El fine-tune se ejecuto durante 20.000 pasos con batch 32 en una sola GPU, learning rate pico 2e-5 con warmup del 2,5 % y decaimiento coseno, weight decay 1e-5 y precision mixta bfloat16 sobre pesos float32. El punto de partida es el checkpoint CEI `cei2_groot_n17_fr3v2_leaphand_4node/checkpoint-50000`, entrenado 50.000 pasos sobre 112 h de DROID retargetizado, con batch 1024 en 32 GPUs. No se uso split de validacion: los 200 episodios se emplearon para entrenamiento y no se reporta evaluacion.

## Capacidades

- Generacion de acciones motoras para control de un brazo Franka FR3 (7 articulaciones) y una mano LEAP (16 articulaciones), 23 dimensiones en total.
- Politica de imitacion condicionada por instruccion de tarea en lenguaje natural (campo `annotation.human.task_description`).
- Percepcion visual a partir de una unica camara RGB exterior de 640×480.
- Prediccion de chunks de 16 pasos de acciones relativas al estado, convertidas a posiciones absolutas.
- Ejecucion de una tarea de manipulacion compuesta: abrir cajon, recoger objeto, colocarlo dentro y cerrar.
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo de robotica).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no disponible (no se documenta thinking mode, vision general, audio ni otras).

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos de investigacion: el modelo ejecuta la secuencia completa de abrir cajon, recoger un objeto y cerrarlo, adecuado para laboratorios con un FR3 y una mano LEAP que quieran reproducir el experimento.
- Base para fine-tune sobre nuevas tareas de manipulacion: al partir de un checkpoint de mid-training sobre 112 h de DROID, sirve como inicializacion para adaptar la politica a otras tareas con pocos datos reales.
- Estudio de recetas de post-entrenamiento: el repositorio incluye configuracion resuelta, estadisticas de normalizacion y log de entrenamiento, lo que permite replicar el pipeline en una sola GPU.
- Evaluacion de retargeting de morfologia: el modelo demuestra como datos de DROID retargetizados a FR3 + LEAP pueden transferirse a hardware real, util para investigar transferencia entre embodiments.
- Benchmark de politicas de imitacion: sirve como referencia interna para comparar perdidas de entrenamiento frente a variantes pi05 y frente a inicializaciones desde el checkpoint base.
- Integracion en pipelines LeRobot: al usar el formato y las convenciones de LeRobot/GR00T, se puede desplegar en stacks de evaluacion robotica existentes que soporten el formato GR00T.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta perdida media de entrenamiento (objetivo flow-matching propio de cada modelo), que no mide calidad de politica:

| Pasos | pi05 desde base | pi05 desde CEI | GR00T desde base | GR00T desde CEI |
|---|---|---|---|---|
| 0–100 | 0,1616 | 0,2178 | 1,0683 | 0,1939 |
| 4.900–5.000 | 0,0244 | 0,0222 | 0,0686 | 0,0420 |
| 9.900–10.000 | 0,0183 | 0,0177 | 0,0489 | 0,0288 |
| 14.900–15.000 | 0,0118 | 0,0113 | 0,0337 | 0,0190 |
| 19.000–20.000 | 0,0100 | 0,0094 | 0,0284 | 0,0161 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 3,14 B parametros en float32 los pesos ocupan aproximadamente 12,6 GB, por lo que se necesita al menos ese margen mas el coste de activaciones y vision.
- GPU recomendadas: no disponible; el entrenamiento se realizo en una sola GPU con precision mixta bfloat16.
- Cabe en GPU de consumo: no confirmado; el tamano de pesos (12,6 GB) sugiere que podria caber en GPUs de 16 GB o mas en float32, pero no se documenta.
- Opciones de despliegue: libreria `gr00t` (Isaac-GR00T de NVIDIA); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GR00T N1.7 FR3+LEAP) | 3,14 B | no disponible | sin evaluacion publicada | NVIDIA License (no comercial) | Hugging Face |
| `Geoffrey19/cei2-groot-n17-base-drawer200` | 3,14 B (misma base) | no disponible | perdida final 0,0284 a 19–20k pasos | NVIDIA License | Hugging Face |
| pi05 desde base (misma tarea) | no disponible | no disponible | perdida final 0,0100 | no disponible | no disponible |
| pi05 desde CEI (misma tarea) | no disponible | no disponible | perdida final 0,0094 | no disponible | no disponible |

## Limitaciones y advertencias

- No existe split de validacion ni evaluacion reportada: los 200 episodios se usaron integramente para entrenamiento, por lo que no hay medida de exito de la politica.
- El exito de la tarea no se verifico por episodio; solo se filtraron problemas de datos como huecos de mas de 200 ms en las articulaciones.
- El modelo trabaja en un orden de articulaciones distinto al del robot: es obligatorio aplicar la permutacion `P = [0,1,2,3,4,5,6,8,7,9,10,12,11,13,14,16,15,17,18,19,20,21,22]` al estado antes de enviarlo y a las acciones devueltas. Ignorarlo produce comandos incorrectos.
- La accion objetivo es la posicion medida 1/15 s despues, no el comando enviado, lo que puede introducir desajustes en despliegues con controladores distintos.
- Licencia NVIDIA: uso limitado a investigacion y evaluacion no comercial; no apto para produccion comercial sin autorizacion.
- Especializado en una unica tarea y morfologia (FR3 + LEAP, una camara exterior); no generaliza a otras tareas sin nuevo fine-tune.
- Riesgo de alucinacion y sesgos: no disponible (no se documenta analisis al respecto).
- Idiomas soportados no disponibles; las instrucciones de tarea son texto y no se especifica cobertura linguistica.
- El checkpoint de partida se entreno sobre DROID retargetizado, lo que puede introducir sesgos de las escenas y objetos originales del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-drawer200
- Variante desde el checkpoint base: https://huggingface.co/Geoffrey19/cei2-groot-n17-base-drawer200
- Repositorio Isaac-GR00T (NVIDIA): https://github.com/NVIDIA/Isaac-GR00T
- Dataset DROID: https://droid-dataset.github.io/
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B

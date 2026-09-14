# jiankimr/pi05_libero10_ipec_seed42_step10000

## Resumen

El modelo jiankimr/pi05_libero10_ipec_seed42_step10000 es un ajuste fino del modelo de vision-lenguaje-accion (VLA) pi0.5 de Physical Intelligence, distribuido dentro del ecosistema openpi. Lo publica el usuario jiankimr y esta especializado en el conjunto de tareas de manipulacion robotica LIBERO-10. Se distribuye con licencia Apache 2.0, biblioteca openpi, pipeline de robotics y un repositorio de 12,4 GB.

El checkpoint se ha entrenado exclusivamente sobre el dataset IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot (379 episodios, 101.469 fotogramas a 20 Hz) durante 10.000 pasos con semilla 42, lo que equivale a unas 25 epocas con batch 256. La model card indica que su proposito principal es servir como politica victima en experimentos de inyeccion de fatiga y evasion de defensas (LPF, jitter jerk/COBALT).

Reporta una tasa de exito del 94% en LIBERO-10 (10 tareas x 10 ensayos = 100 episodios, fisica a 500 Hz, OSC_POSE) y produce acciones de 7 dimensiones en espacio de efector final (delta de posicion xyz, eje-angulo xyz y pinza), con chunks de 8 pasos a 20 Hz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) derivada de pi0.5; la model card no detalla los componentes internos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en formato orbax; no hay versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | orbax (JAX); incluye `params/` con pesos EMA y `assets/.../norm_stats.json`; `train_state/` omitido |
| Espacio de acciones | 7-D EE delta (posicion xyz, eje-angulo xyz, pinza), chunk de 8 a 20 Hz |
| Dataset de entrenamiento | IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot (379 episodios, 101.469 fotogramas a 20 Hz) |
| Tamano del repositorio | 12,4 GB |
| Biblioteca | openpi |
| Semilla y paso de entrenamiento | semilla 42, paso 10.000 |
| Modelo base | `gs://openpi-assets/checkpoints/pi05_base` |

## Arquitectura y entrenamiento

Se trata de una politica VLA: el modelo consume observaciones visuales e instrucciones asociadas a las tareas y emite acciones motoras, no texto conversacional. La salida se estructura en chunks de 8 acciones a 20 Hz en un espacio de 7 dimensiones de efector final (delta de posicion xyz, eje-angulo xyz y pinza). La model card no especifica el numero de parametros, la longitud de contexto, la composicion del backbone ni si existe una etapa de alineamiento tipo RLHF o DPO, por lo que esos datos quedan como no disponibles.

El entrenamiento parte de `pi05_base` y sigue los valores por defecto de la receta `pi05_libero` de openpi: batch 256, FSDP sobre 2 GPU H100, optimizador AdamW con scheduler coseno (warmup de 10.000 pasos, pico de 5e-5 y valor constante despues) y EMA de 0,999. Solo se publican los pesos EMA. La justificacion del paso 10.000 es que, sobre este dataset reducido a LIBERO-10, equivale a unas 25 epocas, el mismo presupuesto de epocas que la receta oficial de 30.000 pasos de openpi sobre el conjunto completo de 4 suites (aproximadamente 273.000 fotogramas); segun la model card, la tasa de exito se estabiliza a partir de ese punto.

## Capacidades

- Control robotico de manipulacion: ejecuta las 10 tareas de LIBERO-10 a partir de observaciones visuales, con una tasa de exito declarada del 94%.
- Generacion de acciones en chunks: produce bloques de 8 acciones a 20 Hz en un espacio de efector final de 7 dimensiones, adecuado para control tipo OSC_POSE.
- Condicionamiento por lenguaje: al ser un modelo VLA, la politica se condiciona por la instruccion de la tarea; la model card no especifica los idiomas admitidos.
- Uso como politica victima en investigacion de seguridad: el checkpoint esta pensado para experimentos de inyeccion de fatiga y evasion de defensas (LPF, jitter jerk/COBALT).
- Reproducibilidad experimental: semilla y paso de entrenamiento fijados y publicados, con checkpoints hermanos para comparar semillas y pasos.
- No dispone de tool calling, function calling ni soporte de agentes multi-paso: es una politica motora, no un modelo de proposito general con interfaz de herramientas.
- No se documentan capacidades de vision general (VQA, OCR), audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en robustez de politicas roboticas: usar el checkpoint como politica victima para medir como degrada su tasa de exito bajo inyeccion de fatiga (LPF) o perturbaciones tipo jerk/COBALT jitter. El valor de referencia del 94% en LIBERO-10 permite cuantificar la caida de rendimiento.
- Desarrollo de mecanismos de defensa: al ser un checkpoint "limpio" (un-poisoned), sirve como linea base para evaluar defensas frente a ataques de evasion antes de aplicarlas a politicas en produccion.
- Benchmarking de manipulacion en simulacion: comparar nuevas politicas o variantes de arquitectura contra una referencia publica con protocolo de evaluacion definido (10 tareas x 10 ensayos, fisica a 500 Hz, OSC_POSE).
- Estudios de estabilidad del entrenamiento: los checkpoints hermanos permiten analizar como evoluciona la tasa de exito entre el paso 10.000 y el 30.000, y entre semillas distintas.
- Ajuste fino posterior: al estar en formato openpi y con pesos EMA, puede usarse como punto de partida para reentrenar sobre otras suites o tareas de manipulacion, siempre que se respete la licencia Apache 2.0.
- Reproducibilidad de experimentos de seguridad: la semilla 42 y el paso 10.000 quedan fijados, lo que permite replicar exactamente los resultados publicados por el autor.
- Integracion en pipelines de evaluacion con robosuite/LIBERO: el espacio de acciones 7-D y el chunk de 8 a 20 Hz encajan con entornos de control de frecuencia fija en simulacion.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado | Checkpoint |
|---|---|---|---|
| LIBERO-10 (tasa de exito) | 10 tareas x 10 ensayos = 100 episodios, fisica a 500 Hz, OSC_POSE | 94% | semilla 42, paso 10.000 |
| LIBERO-10 (tasa de exito) | mismo protocolo | 94% | semilla 42, paso 20.000 |
| LIBERO-10 (tasa de exito) | mismo protocolo | 92% | semilla 42, paso 30.000 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, ya que se trata de una politica motora y no de un modelo generativo de texto.

## Requisitos de hardware

- Entrenamiento documentado: 2 GPU H100 con FSDP, batch 256, AdamW con scheduler coseno y EMA 0,999.
- VRAM de inferencia: no disponible de forma explicita. Como referencia, el repositorio contiene 12,4 GB de pesos en formato orbax; si los pesos estan almacenados en 32 bits, la inferencia requeriria del orden de 14-16 GB de VRAM, y en bfloat16 se reduciria aproximadamente a la mitad. Son estimaciones a partir del tamano del repositorio, no datos publicados.
- GPU consumer: con esas estimaciones, una RTX 4090 o RTX 3090 (24 GB) serian suficientes para inferencia en precision completa o bfloat16. Tarjetas con 16 GB o menos podrian ser insuficientes.
- Opciones de despliegue: el modelo se carga mediante la biblioteca openpi en Python (JAX), descargando el repositorio a un directorio local y creando la politica con `policy_config.create_trained_policy(cfg, "CKPT")`. No se publican pesos en GGUF, por lo que no hay soporte directo en llama.cpp, Ollama ni TGI; tampoco se documenta soporte en vLLM.
- El checkpoint no incluye `train_state/` (se omite, -31 GB), por lo que no se puede reanudar el entrenamiento desde este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LIBERO-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_libero10_ipec_seed42_step10000 | no disponible | no disponible | 94% | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| pi05_libero10_ipec_seed42_step29999 | no disponible | no disponible | no disponible para este checkpoint concreto (la model card cita 92% a 30k para la semilla 42) | Apache 2.0 | HuggingFace |
| pi05_libero10_ipec_seed43_step10000 | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |
| pi05_base (openpi) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | `gs://openpi-assets/checkpoints/pi05_base` |

No se dispone de datos comparativos frente a otras familias de VLA (por ejemplo OpenVLA, pi0 o RDT-1B) en la informacion proporcionada, por lo que no se incluyen cifras de esos modelos.

## Limitaciones y advertencias

- Proposito de investigacion en seguridad: el checkpoint esta declarado como politica victima para experimentos de inyeccion de fatiga y evasion de defensas; no esta pensado para despliegue en produccion ni en robots reales sin una validacion adicional.
- Alcance de tareas muy reducido: solo se ha entrenado sobre LIBERO-10 (10 tareas, 379 episodios), por lo que no hay evidencia de generalizacion a otras tareas, entornos ni morfologias de robot.
- Evaluacion unicamente en simulacion: los resultados del 94% se obtuvieron con fisica a 500 Hz y controlador OSC_POSE; el rendimiento en hardware real puede degradarse de forma significativa por desajustes de dinamica, latencia y ruido sensorial.
- Sesgos del dataset: proviene de `libero_10_no_noops_1.0.0_lerobot`; el prefijo "no_noops" implica un filtrado de acciones nulas, y no se documenta la composicion demografica, de escenarios ni de objetos, por lo que pueden existir sesgos de entorno y de distribucion de tareas.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de acciones fuera de distribucion cuando la observacion o la instruccion se alejan de los datos de entrenamiento.
- Idiomas: no se especifica que idiomas admiten las instrucciones; no debe asumirse soporte multilingue.
- Sin herramientas ni agentes: no soporta tool calling, function calling ni razonamiento multi-paso explicito.
- Cuantizacion no disponible: al no publicarse pesos GGUF ni variantes cuantizadas, el despliegue en entornos con poca VRAM o en runtimes no JAX queda limitado.
- Imposibilidad de reanudar entrenamiento: `train_state/` se ha omitido del repositorio.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias ni validacion de seguridad para uso en produccion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la ficha, sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiankimr/pi05_libero10_ipec_seed42_step10000
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Dataset de entrenamiento: https://huggingface.co/datasets/IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot
- Checkpoint hermano (semilla 42, paso 29999): https://huggingface.co/jiankimr/pi05_libero10_ipec_seed42_step29999
- Checkpoint hermano (semilla 43, paso 10000): https://huggingface.co/jiankimr/pi05_libero10_ipec_seed43_step10000
- Pesos del modelo base: `gs://openpi-assets/checkpoints/pi05_base`

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles proceden de la informacion de HuggingFace y de la model card.

# islee94/n16-franka-pnp-middle-cup-to-basket-volt-30k-s42

## Resumen

`n16-franka-pnp-middle-cup-to-basket-volt-30k-s42` es un checkpoint de ajuste fino del modelo fundacional de robotica GR00T N1.6, desarrollado por NVIDIA, publicado por el usuario `islee94` en Hugging Face. No es un modelo de lenguaje: es una politica visomotora (vision-language-action, VLA) entrenada para controlar un brazo robotico Franka en una tarea concreta de manipulacion, en este caso recoger un vaso situado en el centro y depositarlo en una cesta.

El checkpoint corresponde a 30.000 actualizaciones de entrenamiento sobre datos reales de Franka retemporizados con la tecnica VOLT (1x y 2x), ejecutado sobre 4 GPU A100 con semilla 42. El autor indica explicitamente que la evaluacion en robot esta pendiente, por lo que se trata de un artefacto de investigacion, no de un modelo validado para produccion.

Su relevancia es acotada: sirve como referencia reproducible de un pipeline de ajuste fino de GR00T N1.6 sobre una tarea concreta y como punto de partida para experimentos de imitacion en robotica, pero no aporta capacidades generales de texto, codigo o razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.6 (politica vision-language-action; detalles internos de la arquitectura no disponibles en la informacion proporcionada) |
| Parametros totales | 3.286.608.832 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | no disponible (modelo de control robotico, no de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (dos shards: `model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de GR00T N1.6 (referencia interna `gr00tn16 179b98b`), la familia de modelos fundacionales de robotica de NVIDIA. La informacion disponible no detalla la arquitectura interna (composicion de vision encoder, backbone y cabeza de accion), por lo que no es posible describirla con rigor mas alla de su naturaleza VLA: recibe observaciones visuales y estado del robot y emite acciones motrices.

El entrenamiento se realizo sobre datos reales de Franka para la tarea `pnp_middle_cup_to_basket`, con retemporizacion VOLT 1x y 2x (dataset `pnpcup_volt_l1_h2_6165a20`, FT `32102315`). Se ejecutaron 30.000 actualizaciones en 4 GPU A100 con 4 procesos por GPU (16 en total) y semilla 42. El checkpoint subido contiene unicamente archivos de inferencia, sin estado del optimizador. Los ficheros `raven/pacedistill_manifest.json`, `raven/volt_l1_h2_6165a20.json` y `raven/raven_context.txt` documentan el pipeline de datos y destilacion, con hashes SHA-256 verificables.

## Capacidades

- Control visomotor para una tarea de pick-and-place concreta: recoger un vaso central y colocarlo en una cesta, sobre un brazo Franka.
- Consumo de observaciones visuales y estado del robot como entrada (politica VLA).
- Emision de acciones de control continuas para el efector final.
- No se documentan capacidades de generacion de texto, codigo, matematicas, tool calling, agentes, vision general, audio ni modo de razonamiento extendido.
- Capacidades multilingues: no aplicables (no es un modelo de lenguaje).

## Casos de uso

- Reproduccion de experimentos de imitacion en robotica: cargar el checkpoint en el stack de GR00T N1.6 para replicar el ajuste fino sobre `pnp_middle_cup_to_basket` y comparar curvas de entrenamiento con la configuracion documentada (30k updates, seed 42, 4x A100).
- Punto de partida para ajuste fino en tareas similares: usar los pesos como inicializacion para nuevas tareas de pick-and-place con Franka, aprovechando que ya han visto datos reales de manipulacion con retemporizacion VOLT.
- Estudio de retemporizacion de datos: analizar el efecto de VOLT 1x/2x comparando este checkpoint con variantes entrenadas sobre datos sin retemporizar, usando los manifiestos `raven/` como referencia.
- Evaluacion de pipelines de destilacion: el fichero `pacedistill_manifest.json` permite auditar el proceso de destilacion aplicado durante el entrenamiento.
- Benchmark interno de politicas VLA: servir como baseline de referencia para medir el rendimiento de otras politicas sobre la misma tarea y configuracion de hardware.
- Docencia y divulgacion: ejemplo completo y verificable de un checkpoint de GR00T N1.6 con trazabilidad de datos, configuracion y hashes, util para explicar el ciclo completo de entrenamiento de una politica robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la evaluacion en robot esta pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 3.286.608.832 parametros, en bf16 los pesos ocupan aproximadamente 6,6 GB, a lo que hay que sumar el coste del encoder visual y del estado de inferencia, no documentados.
- GPU de entrenamiento utilizadas: 4 x A100 con 4 procesos por GPU (16 en total).
- GPU recomendadas para inferencia: no disponible; por tamano de pesos, una GPU con 16 GB o mas de VRAM deberia ser suficiente en bf16, pero no hay confirmacion del autor.
- Compatibilidad con GPU de consumo: no confirmada. El tamano de pesos sugiere que podria caber en una RTX 4090 (24 GB) o similar, pero no hay datos de latencia ni de memoria real medida.
- Opciones de despliegue: el stack de inferencia de GR00T N1.6 de NVIDIA; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a una politica robotica de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n16-franka-pnp-middle-cup-to-basket-volt-30k-s42 | 3.286.608.832 | no disponible | Pick-and-place Franka | no disponible | Hugging Face (publico) |
| GR00T N1.6 base (NVIDIA) | no disponible | no disponible | Politica VLA general | no disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| Otras politicas VLA (p. ej. OpenVLA, pi0) | no disponible | no disponible | Manipulacion robotica general | no disponible | No disponible en la informacion proporcionada |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo especializado en una unica tarea (`pnp_middle_cup_to_basket`) sobre un unico embodiment (Franka); no generaliza a otras tareas ni robots sin nuevo ajuste fino.
- Evaluacion en robot pendiente segun el propio autor: no hay evidencia publicada de exito en la tarea real.
- Sin licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o con NVIDIA para aclarar los terminos.
- Sin informacion sobre sesgos, alucinacion o robustez ante cambios de iluminacion, posicion de objetos o perturbaciones fisicas.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- El checkpoint contiene solo archivos de inferencia; no permite reanudar el entrenamiento desde el estado del optimizador.
- Los datos de entrenamiento proceden de un entorno concreto (FT `32102315`) y pueden no representar variaciones reales de laboratorio o industria.

## Enlaces

- Hugging Face: https://huggingface.co/islee94/n16-franka-pnp-middle-cup-to-basket-volt-30k-s42
- GR00T N1.6 (NVIDIA): no disponible en la informacion proporcionada
- Paper de GR00T N1: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo o evaluacion en robot: no disponible (pendiente segun el autor)

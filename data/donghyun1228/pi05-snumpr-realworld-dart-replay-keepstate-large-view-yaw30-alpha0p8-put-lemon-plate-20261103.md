# Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-put-lemon-plate-20261103

## Resumen

Este repositorio contiene un checkpoint de política robótica derivado de π0.5 (pi05) dentro del ecosistema openpi, adaptado mediante la técnica DART (domain arithmetic) para la tarea concreta `put_lemon_plate`. Lo publica el usuario Donghyun1228 y forma parte de la línea de trabajo SNUMPR sobre modelos VLA (vision-language-action) para manipulación real. No es un modelo de lenguaje general: es un conjunto de pesos de control que recibe observaciones visuales y estado articular y produce acciones motrices.

La particularidad de esta variante es que el dominio objetivo se construyó mediante una repetición (replay) de una demostración fuente grabada desde una vista de cámara desplazada, con un giro virtual de la base de +30 grados aplicado a las poses TCP y a las acciones delta, pero manteniendo el estado articular real (`--keep-state`). La fusión se realizó con el script oficial `domain_arithmetic.dart` del repositorio `snumprlab/dart`, con α 0.8, alcance total y semilla 42.

El modelo es relevante como ejemplo de adaptación de bajo coste de un VLA a variaciones de punto de vista sin reentrenar el fine-tuning fuente, reutilizando el FT de origen verificado por commit y combinándolo con un FT objetivo de 1.000 actualizaciones. El repositorio pesa 5,3 GB, la licencia es Apache 2.0 y el autor declara explícitamente que todavía no se ha ejecutado ninguna evaluación sobre robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (pi05), no se detalla la topología interna en la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos `params` se distribuyen en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en BF16 más `assets` con normalización original (no se indica safetensors ni GGUF de forma explícita) |

## Arquitectura y entrenamiento

El modelo parte de la base `snumpr-iclr27-v1/9999`, descrita como VLA inicial de SNUMPR con normalización original. Sobre esa base se aplica una fusión DART por aritmética de dominios entre dos fine-tunings: uno fuente reutilizado sin reentrenar (`pi05-snumpr-realworld-dart-paired-source-ft-1000-put-lemon-plate`, commit `7fd1304`) y uno objetivo entrenado con imitación supervisada (`pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-put-lemon-plate`). El FT objetivo usó 1.000 actualizaciones, batch 64, learning rate constante 5e-5, sin warmup, sin EMA y con todos los pesos entrenables, sobre el código `Donghyun1228/vla_adaptation` (commit `2065dd0a`).

La innovación técnica principal es la construcción del dominio objetivo: en lugar de grabar nuevas demostraciones con la cámara en la vista desplazada, se reprodujo la trayectoria articular de la demostración fuente `demonstration_7` mientras la cámara base se situaba en la vista de gran desplazamiento. Así, estado, acción y marcas temporales coinciden con la demo original y solo cambian las imágenes. Las poses TCP y las acciones delta se rotaron por un giro virtual de base de +30 grados (`Rz(-30)`), mientras `observation.state` conserva los ángulos articulares reales. La fusión se ejecutó en CPU con el script oficial `domain_arithmetic.dart` del commit `1b23c4f4` de `snumprlab/dart`, α 0.8, alcance total y semilla 42. Cada fichero del FT fuente se verificó contra su commit (tamaño y sha256 LFS o git blob id) antes de la fusión, y el resultado se validó clave por clave en `dart_merge_verified.json` (51/51 claves, sin fallback).

## Capacidades

- Control robótico de manipulación para la tarea `put_lemon_plate`: genera acciones motrices a partir de observaciones visuales y del estado articular del robot.
- Política VLA: integra percepción visual y estado proprioceptivo en un único modelo de acción, siguiendo el paradigma π0.5.
- Robustez a variación de punto de vista: el dominio objetivo se construyó con la cámara en una vista de gran desplazamiento y giro virtual de base de +30 grados.
- Mantenimiento del estado real: la observación de estado usa los ángulos articulares reales, no los virtuales, lo que exige que el controlador rote las acciones de vuelta.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas ni procesamiento de audio.

## Casos de uso

- Manipulación robótica de pick-and-place en laboratorio: el modelo ejecuta la tarea de colocar un limón en un plato recibiendo imágenes de cámara y estado articular, adecuado porque está entrenado específicamente para esa secuencia de acciones.
- Adaptación a reubicación de cámara sin regrabar datos: útil cuando la cámara se mueve a una posición distinta en la celda de trabajo, ya que el dominio objetivo se generó precisamente con una vista desplazada y un giro de base de 30 grados.
- Reutilización de demostraciones existentes: el enfoque de replay permite generar nuevos dominios a partir de demos ya grabadas cambiando solo la vista de cámara, reduciendo el coste de recolección de datos reales.
- Investigación en aritmética de dominios para VLA: sirve como caso de estudio reproducible de fusión DART con α 0.8 y validación clave por clave, útil para grupos que investigan adaptación de políticas sin reentrenamiento completo.
- Despliegue en controladores con transformación de acciones: el modelo requiere que el controlador aplique `Δxyz_real = Rz(+30) Δxyz_virtual` y alimente el estado articular real, lo que lo hace adecuado para pipelines que ya gestionan marcos de referencia virtuales.
- Comparación controlada de variantes: al diferir del modelo DART emparejado de la misma tarea solo en la demostración objetivo, permite aislar el efecto de la vista de cámara en el rendimiento de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que todavía no se ha ejecutado ninguna evaluación sobre robot real.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 5,3 GB y los pesos se distribuyen en BF16, por lo que la inferencia en BF16 requerirá al menos el tamaño de los parámetros más el estado de activaciones, sin cifra publicada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo sigue el pipeline `robotics` de HuggingFace y el ecosistema openpi/π0.5; no se documentan instrucciones de servicio con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05 SNUMPR DART replay keepstate large-view yaw30) | no disponible | no disponible | `put_lemon_plate` con vista desplazada y yaw +30 | Apache 2.0 | HuggingFace, 0 descargas |
| `pi05-snumpr-realworld-dart-paired-source-ft-1000-put-lemon-plate` | no disponible | no disponible | `put_lemon_plate` con demo fuente emparejada (yaw 0) | no disponible en la información | HuggingFace |
| `pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-put-lemon-plate` | no disponible | no disponible | FT objetivo de la misma tarea, 1.000 actualizaciones | no disponible en la información | HuggingFace |
| Base `snumpr-iclr27-v1/9999` | no disponible | no disponible | VLA inicial SNUMPR con normalización original | no disponible en la información | Referenciado en la model card |

## Limitaciones y advertencias

- Sin evaluación real: el autor declara que no se ha ejecutado ninguna evaluación sobre robot, por lo que no hay evidencia publicada de éxito en la tarea.
- Requiere transformación en el controlador: las acciones deben rotarse de vuelta con `Δxyz_real = Rz(+30) Δxyz_virtual` y el estado articular real debe alimentarse sin cambios (`virtual_base_yaw_deg=30`, `keep_real_state=True`); omitir esto invalida el comportamiento esperado.
- Especialización extrema: es un checkpoint de una sola tarea (`put_lemon_plate`) y no un modelo generalista; no debe esperarse transferencia a otras tareas sin adaptación.
- Dependencia de la normalización original: los `assets` incluyen la normalización original con SHA `f549619e…`; alterarla rompe la calibración de acciones.
- Sesgos: no se documentan sesgos conocidos en la información disponible, pero al entrenarse con demostraciones reales de un único entorno hereda las condiciones de iluminación, objetos y cámara de ese montaje.
- Alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la ejecución de acciones incorrectas ante observaciones fuera de distribución.
- Idiomas y contexto: no disponibles; el modelo no procesa lenguaje natural de forma documentada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte y el despliegue en producción queda bajo responsabilidad de quien lo integra.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-put-lemon-plate-20261103
- FT fuente reutilizado: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-source-ft-1000-put-lemon-plate-20261030
- FT objetivo: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-put-lemon-plate-20261103
- Código de adaptación: repositorio `Donghyun1228/vla_adaptation` (commit `2065dd0a`), sin URL directa en la información disponible
- Script de fusión: repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), sin URL directa en la información disponible
- Base SNUMPR: `snumpr-iclr27-v1/9999`, sin URL directa en la información disponible

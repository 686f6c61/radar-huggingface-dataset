# Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-hang-tape-bottom-20261103

## Resumen

Este repositorio contiene un modelo de política visomotora (VLA, vision-language-action) derivado de π0.5 (pi05) y adaptado mediante la técnica DART (Domain Arithmetic) para la tarea robótica `hang_tape_bottom`. Lo publica el usuario Donghyun1228 dentro del ecosistema SNUMPR (openpi), y su función es generar acciones motoras a partir de observaciones visuales y del estado articular en un entorno real de manipulación. No es un modelo de lenguaje: es un checkpoint de control robótico que consume imágenes de cámara y `observation.state` y produce acciones delta.

La particularidad de esta variante es que el merge DART se ha construido con una demostración objetivo obtenida mediante *replay* de una demo fuente (`demonstration_6`) ejecutada con la cámara base en una vista desplazada (large-shift view) y con un giro virtual de la base de +30° (`Rz(-30)`). Las poses TCP y las acciones delta se rotan, pero `observation.state` conserva los ángulos articulares reales (opción `--keep-state`). Esto permite entrenar la política para una nueva configuración de cámara sin disponer de nuevas trayectorias reales.

El modelo parte de la base `snumpr-iclr27-v1/9999`, reutiliza un fine-tuning fuente ya entrenado y aplica un fine-tuning objetivo de 1.000 actualizaciones con batch 64 y LR constante 5e-5. El merge se realizó con el script oficial `domain_arithmetic.dart` del repositorio `snumprlab/dart` (commit `1b23c4f...`), con α 0.8, scope all y semilla 42 en CPU. El autor indica explícitamente que no se ha ejecutado ninguna evaluación sobre robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA derivada de π0.5 (pi05, openpi); detalles internos de la arquitectura no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | `params` en BF16 más `assets` con normalización original (SHA `f549619e…`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un checkpoint de política visomotora basado en π0.5 dentro del framework openpi, especializado en la tarea `hang_tape_bottom`. No se dispone de detalles sobre el número de parámetros, la composición del dataset original de π0.5 ni el esquema exacto de atención. La construcción sigue un pipeline DART en tres piezas: una base (`snumpr-iclr27-v1/9999`, VLA SNUMPR inicial con normalización original), un fine-tuning fuente reutilizado sin reentrenar (`pi05-snumpr-realworld-dart-paired-source-ft-1000-hang-tape-bottom-20261030`, commit `324837d6...`, preset `pi05_snumpr_dart_paired_source_hang_tape_bottom` sobre `demonstration_6` con yaw 0) y un fine-tuning objetivo (`...replay-keepstate-large-view-yaw30-ft-1000-hang-tape-bottom-20261103`, preset `pi05_snumpr_dart_replay_target_large_view_yaw30_keepstate_hang_tape_bottom`).

El fine-tuning objetivo es de imitación (IL) puro: 1.000 actualizaciones, batch 64, LR constante 5e-5, sin warmup, sin EMA y con todos los pesos entrenados, usando el código `Donghyun1228/vla_adaptation` (commit `2065dd0a`). El merge se ejecuta con `domain_arithmetic.dart` del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), α 0.8, scope all, semilla 42, en CPU. El autor incluye `merge_config.json` como registro del merger y `dart_merge_verified.json` como verificación hoja por hoja (51/51 claves, sin fallback). Antes del merge se comprobó cada fichero del fine-tuning fuente contra su commit mediante tamaño y sha256 de LFS o git blob id.

La innovación técnica central es el *target-view replay*: la demostración objetivo es un replay de la demo fuente en el que el robot reproduce la trayectoria articular original mientras la cámara base se sitúa en la vista desplazada, de modo que estado, acciones y timestamps coinciden con la fuente y solo cambian las imágenes. Las poses TCP y las acciones delta se rotan por el yaw virtual de +30° (`Rz(-30)`), pero el estado articular se mantiene real (`--keep-state`). En despliegue, el controlador del robot debe deshacer la rotación de la acción (`Δxyz_real = Rz(+30) Δxyz_virtual`) y alimentar el estado articular real sin modificar (`virtual_base_yaw_deg=30`, `keep_real_state=True`).

## Capacidades

- Generación de acciones motoras para manipulación robótica a partir de imágenes de cámara y estado articular.
- Control visomotor específico para la tarea `hang_tape_bottom`.
- Adaptación a cambios de punto de vista de cámara mediante replay con yaw virtual y estado real.
- Merge de dominios por aritmética de parámetros (DART) con α 0.8 y scope global.
- Verificación de integridad del merge hoja por hoja (51/51 claves).
- No se documentan capacidades de lenguaje, razonamiento simbólico, código, matemáticas, tool calling, agentes ni multilingüismo; el modelo es exclusivamente de robótica.

## Casos de uso

- Manipulación robótica de la tarea `hang_tape_bottom`: el modelo genera acciones delta a partir de la imagen y el estado articular para ejecutar el agarre y colocación de cinta, siendo adecuado por estar entrenado específicamente para esa tarea.
- Reutilización de demostraciones existentes para nuevas vistas de cámara: gracias al replay con vista desplazada y yaw virtual +30°, se puede adaptar la política a una nueva colocación de cámara sin grabar nuevas trayectorias reales.
- Evaluación de técnicas de merge de dominios en robótica: sirve como caso reproducible de DART con α 0.8, semilla 42 y verificación 51/51 para comparar con el modelo DART pareado de la misma tarea.
- Investigación en adaptación de VLAs con fine-tuning de imitación: el checkpoint documenta un pipeline completo (base, FT fuente, FT objetivo, merge) reutilizable como referencia metodológica.
- Despliegue en banco de pruebas con controlador que aplique la rotación inversa `Rz(+30)` sobre las acciones y mantenga el estado articular real.
- Comparación controlada de variantes: al diferir del modelo DART pareado solo en la demostración objetivo, permite aislar el efecto del target-view replay frente al par pareado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación sobre robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 5,3 GB, lo que orienta sobre el tamaño de los pesos en BF16 pero no se detalla el consumo en ejecución.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan frameworks de serving (vLLM, llama.cpp, Ollama, TGI); el modelo se integra en el ecosistema openpi/SNUMPR con el código `Donghyun1228/vla_adaptation`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Este modelo (`...replay-keepstate-large-view-yaw30...-20261103`) | π0.5 SNUMPR | `hang_tape_bottom` con target-view replay, yaw +30°, keep-state | no disponible | apache-2.0 | Sin evaluación en robot |
| `pi05-snumpr-realworld-dart-paired-source-ft-1000-hang-tape-bottom-20261030` | π0.5 SNUMPR | `hang_tape_bottom` con DART pareado, yaw 0 | no disponible | apache-2.0 | FT fuente reutilizado por este modelo |
| `pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-hang-tape-bottom-20261103` | π0.5 SNUMPR | FT objetivo del merge (IL, 1.000 updates) | no disponible | apache-2.0 | Checkpoint intermedio |
| `snumpr-iclr27-v1/9999` | π0.5 | VLA SNUMPR inicial | no disponible | no disponible | Base del pipeline |

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluación sobre robot real; el rendimiento en despliegue es desconocido.
- El modelo está especializado en una única tarea (`hang_tape_bottom`) y no es un modelo generalista.
- El despliegue exige aplicar la rotación inversa `Rz(+30)` a las acciones y mantener el estado articular real sin transformar; un controlador que no respete `virtual_base_yaw_deg=30` y `keep_real_state=True` producirá acciones incorrectas.
- La normalización debe ser la original incluida en `assets` (SHA `f549619e…`); usar otra normalización invalida el comportamiento entrenado.
- El merge depende de commits concretos (`snumprlab/dart` `1b23c4f...`, `vla_adaptation` `2065dd0a`, FT fuente `324837d6...`); reproducirlo requiere esos artefactos exactos.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas por tratarse de un modelo de control robótico; no aplica la noción habitual de alucinación en lenguaje.
- La licencia apache-2.0 permite uso comercial, pero no se ofrece ninguna garantía de seguridad física en operación robótica real.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-hang-tape-bottom-20261103
- Fine-tuning fuente: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-source-ft-1000-hang-tape-bottom-20261030
- Fine-tuning objetivo: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-hang-tape-bottom-20261103
- Repositorio DART: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`)
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `2065dd0a`)
- Base: `snumpr-iclr27-v1/9999`

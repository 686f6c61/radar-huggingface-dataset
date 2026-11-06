# Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-hang-tape-top-20261103

## Resumen

El modelo `pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-hang-tape-top-20261103` es un checkpoint de robótica desarrollado por el usuario Donghyun1228, derivado de la familia π0.5 (pi05) dentro del ecosistema openpi. Se trata de un modelo de vision-language-action (VLA) especializado en una única tarea de manipulación robótica real: `hang_tape_top`. El modelo se ha generado mediante la técnica DART (Domain Arithmetic) aplicada sobre un fine-tune de origen y un fine-tune de destino, ambos entrenados sobre la base SNUMPR VLA.

La particularidad de este checkpoint es que su demostración objetivo es una repetición (replay) de la demostración fuente `demonstration_9` grabada desde una vista de cámara desplazada, con la base virtual rotada +30° en yaw. Las poses TCP y las acciones delta se rotan con `Rz(-30)`, mientras que `observation.state` conserva los ángulos articulares reales gracias al flag `--keep-state`. La fusión se realizó con el `domain_arithmetic.dart` oficial de `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), con α 0.8, scope all, semilla 42 y ejecución en CPU.

El resultado es un modelo de 5,3 GB en BF16 pensado para control robótico en el mundo real, no para inferencia de lenguaje general. Es relevante ahora porque documenta una receta reproducible de adaptación de dominio visual (cambio de punto de vista de cámara) sin reentrenar la política desde cero, un problema recurrente en despliegues de VLA. El autor indica explícitamente que todavía no se ha ejecutado ninguna evaluación sobre robot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) π0.5 sobre base SNUMPR, derivada por DART (merge de pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en BF16 y `assets` con normalización original (SHA `f549619e…`); formato concreto de fichero no disponible |

## Arquitectura y entrenamiento

El modelo parte de la base `snumpr-iclr27-v1/9999`, descrita como la VLA SNUMPR inicial con normalización original, sobre la que se construyen dos fine-tunes independientes. El primero es el fine-tune fuente `pi05-snumpr-realworld-dart-paired-source-ft-1000-hang-tape-top-20261030` (commit `927dadb47b3c1a0116915d7fe8aaf91483af8354`), que se reutiliza sin reentrenar. El segundo es el fine-tune objetivo `pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-hang-tape-top-20261103`, entrenado solo con imitation learning durante 1.000 actualizaciones, batch 64, learning rate constante 5e-5, sin warmup, sin EMA y con todos los pesos entrenables (código `Donghyun1228/vla_adaptation`, commit `2065dd0a`).

La innovación técnica está en la construcción del par de dominios y en la fusión DART. La demostración objetivo es un replay de la trayectoria articular de `demonstration_9` ejecutado con la cámara base en una vista de gran desplazamiento; por tanto, estados, acciones y marcas de tiempo coinciden con la fuente y solo cambian las imágenes. Las poses TCP y las acciones delta se rotan por el yaw virtual de +30° (`Rz(-30)`), pero `observation.state` mantiene los ángulos articulares reales (`--keep-state`). La fusión usa `domain_arithmetic.dart` oficial con α 0.8 y scope all, y se verificó hoja a hoja (`dart_merge_verified.json`, 51/51 claves, sin fallback). El fichero `merge_config.json` recoge la configuración del merger. Cada fichero de entrada se comprobó contra su commit (tamaño y sha256 LFS / git blob id) antes de la fusión.

## Capacidades

- Control robótico de manipulación para la tarea concreta `hang_tape_top`, con salida de acciones delta condicionadas por observaciones visuales y estado articular.
- Política VLA que combina percepción visual (imágenes de cámara base) y estado propioceptivo (ángulos articulares reales) para generar acciones.
- Adaptación a cambios de punto de vista de cámara mediante aritmética de dominios, sin reentrenamiento completo de la política.
- Soporte de rotación virtual de base: el controlador debe aplicar `Δxyz_real = Rz(+30) Δxyz_virtual` y alimentar el estado articular real sin modificar (`virtual_base_yaw_deg=30`, `keep_real_state=True`).
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento; el modelo está orientado exclusivamente a robótica.

## Casos de uso

- Manipulación robótica de la tarea `hang_tape_top`: el modelo genera acciones delta para colgar cinta en un entorno real, usando la vista de cámara desplazada y el estado articular real como entrada.
- Adaptación a reubicaciones de cámara en producción: si una célula robotizada cambia la posición de la cámara base, este checkpoint sirve como referencia de cómo aplicar DART para trasladar la política a la nueva vista sin reentrenar desde cero.
- Investigación en domain arithmetic para VLA: el par de fine-tunes y los ficheros de verificación (`merge_config.json`, `dart_merge_verified.json`) permiten reproducir y auditar el merge hoja a hoja.
- Replay de demostraciones con estado preservado: útil para estudiar cómo afecta al entrenamiento mantener los ángulos articulares reales mientras se rotan las acciones, un escenario habitual al cambiar el marco de referencia de la base.
- Prototipado de políticas por tarea: al ser un modelo por tarea (one model per task), encaja en pipelines donde cada tarea tiene su propio checkpoint y se selecciona en tiempo de ejecución.
- Validación de recetas de fine-tuning IL corto: las 1.000 actualizaciones con LR constante 5e-5 y batch 64 sirven como línea base para comparar variantes de adaptación en robótica real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que todavía no se ha ejecutado ninguna evaluación sobre robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 5,3 GB y los pesos se publican en BF16, lo que da una cota inferior aproximada de memoria, pero no se documenta el consumo real de inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI; el modelo se integra vía el stack openpi/π0.5 y el código `Donghyun1228/vla_adaptation`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Enfoque | Licencia | Estado |
|---|---|---|---|---|
| Este modelo (`...replay-keepstate-large-view-yaw30-alpha0p8-hang-tape-top-20261103`) | `hang_tape_top` | DART α 0.8 sobre replay con vista desplazada y estado real | Apache 2.0 | Sin evaluación en robot |
| `Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-hang-tape-top-20261030` | `hang_tape_top` | DART one-shot con vista grande y yaw30, α 0.8 | Apache 2.0 | No disponible |
| `Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-ft-1000-put-lemon-plate-20261030` | `put_lemon_plate` | Fine-tune objetivo paired con keepstate, vista grande y yaw30 | Apache 2.0 | No disponible |
| `Donghyun1228/pi05-snumpr-realworld-dart-paired-source-ft-1000-hang-tape-top-20261030` | `hang_tape_top` | Fine-tune fuente reutilizado por este modelo | Apache 2.0 | No disponible |

La diferencia principal frente al modelo paired de la misma tarea es únicamente la demostración objetivo (replay con vista desplazada en lugar de la demostración paired). No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- El autor declara que no se ha ejecutado ninguna evaluación sobre robot; el rendimiento real en la tarea es desconocido.
- Modelo de tarea única (`hang_tape_top`): no generaliza a otras tareas de manipulación.
- Requiere que el controlador aplique la rotación inversa `Δxyz_real = Rz(+30) Δxyz_virtual` y alimente el estado articular real sin transformar; un uso incorrecto invalida las acciones generadas.
- Depende de la normalización original incluida en `assets` (SHA `f549619e…`); alterarla rompe la coherencia de las acciones.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica en el sentido de lenguaje; el riesgo equivalente es generar acciones no válidas fuera de la distribución de la demostración.
- Limitaciones de contexto o idioma: no disponibles; el modelo no procesa lenguaje natural de forma documentada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni evaluación de seguridad para despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-hang-tape-top-20261103
- Fine-tune fuente reutilizado: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-source-ft-1000-hang-tape-top-20261030
- Fine-tune objetivo: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-hang-tape-top-20261103
- Modelo DART one-shot relacionado: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-hang-tape-top-20261030
- Modelo paired relacionado (otra tarea): https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-ft-1000-put-lemon-plate-20261030
- Código de adaptación VLA: repositorio `Donghyun1228/vla_adaptation`, commit `2065dd0a` (no se proporciona URL directa)
- Implementación DART oficial: `snumprlab/dart`, commit `1b23c4f42f73168c78a20b353453145e74f64711` (no se proporciona URL directa)
- Base SNUMPR VLA: `snumpr-iclr27-v1/9999` (no se proporciona URL directa)

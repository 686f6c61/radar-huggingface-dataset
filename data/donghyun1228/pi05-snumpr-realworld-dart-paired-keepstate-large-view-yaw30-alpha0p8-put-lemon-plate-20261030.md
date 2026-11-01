# Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-put-lemon-plate-20261030

## Resumen

π0.5 SNUMPR real-world DART merge es un checkpoint de política visuomotora (VLA, vision-language-action) para robótica, derivado de la familia π0.5 de Physical Intelligence y adaptado por el autor Donghyun1228 en el marco del proyecto SNUMPR. El modelo resuelve una tarea concreta de manipulación: colocar un limón en un plato (`put_lemon_plate`), mediante imitación (IL) sobre demostraciones reales. No es un modelo de lenguaje general, sino un artefacto de control que traduce observaciones visuales y estado propioceptivo del robot en acciones de efector final.

El checkpoint se ha generado con DART (Domain Arithmetic), una técnica de fusión de pesos que combina un fine-tuning "fuente" y un fine-tuning "objetivo" para transferir comportamiento entre demostraciones con geometrías distintas. En este caso, la demostración objetivo se re-recolectó el 2026-10-30 para seguir un movimiento similar a la fuente, y las poses TCP se rotaron virtualmente +30° en yaw mientras el estado de articulaciones (`observation.state`) se mantiene en ángulos reales (`--keep-state`). La relevancia es metodológica: documenta un pipeline reproducible de adaptación de VLAs con verificación hoja a hoja de la fusión (51/51 claves, sin fallback).

El repositorio ocupa 5,3 GB y contiene pesos en BF16 junto con los assets de normalización originales. No se ha ejecutado ninguna evaluación en robot real, por lo que su rendimiento efectivo en la tarea no está validado empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA π0.5 (vision-language-action) de Physical Intelligence; checkpoint de política para control robótico |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | BF16 (directorio `params`), más `assets` con normalización original |

## Arquitectura y entrenamiento

El modelo parte de la base `snumpr-iclr27-v1/9999`, descrita como la VLA SNUMPR inicial con normalización original. Sobre ella se realizan dos fine-tunings independientes: uno "fuente" con el preset `pi05_snumpr_dart_paired_source_put_lemon_plate` sobre la demostración `demonstration_7` (yaw 0), y otro "objetivo" con el preset `pi05_snumpr_dart_paired_target_large_view_yaw30_keepstate_put_lemon_plate` sobre la demostración re-recolectada con vista amplia. Ambos son entrenamientos de imitación (IL only) de 1.000 actualizaciones, batch 64, learning rate constante 5e-5, sin warmup, sin EMA y con todos los pesos entrenables (código `Donghyun1228/vla_adaptation`, commit `c4fcb61`).

La fusión se realiza con el script oficial `domain_arithmetic.dart` del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), con α 0,8, scope "all", semilla 42 y ejecución en CPU. Un detalle técnico clave es la rotación virtual de la base: las poses TCP (y por tanto las acciones delta) se rotan +30° en yaw mediante `Rz(-30)`, mientras que `observation.state` conserva los ángulos de articulación reales gracias al flag `--keep-state`. El controlador del robot debe deshacer la rotación en las acciones (`Δxyz_real = Rz(+30) Δxyz_virtual`) y alimentar el estado de articulaciones real sin modificar. La verificación de la fusión se documenta en `dart_merge_verified.json` (51/51 claves, sin fallback).

## Capacidades

- Control visuomotor para manipulación robótica: genera acciones de efector final a partir de observaciones visuales y estado propioceptivo.
- Ejecución de la tarea específica `put_lemon_plate` (colocar un limón en un plato).
- Aprendizaje por imitación a partir de demostraciones reales (no RL ni refuerzo).
- Transferencia de comportamiento entre demostraciones con geometrías de cámara y orientaciones de base distintas mediante fusión DART.
- Soporte de estado de articulaciones real con acciones en marco virtual rotado (requiere transformación en el controlador).
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo "thinking".

## Casos de uso

- Manipulación de laboratorio en una tarea fija: el modelo se usaría como política de control para que un brazo robótico coloque un limón en un plato en un entorno real, siempre que el controlador aplique la rotación inversa `Rz(+30)` sobre las acciones delta y pase el estado de articulaciones real.
- Reproducción de experimentos de adaptación de VLAs: sirve como artefacto de referencia para validar pipelines DART con α 0,8 y verificación hoja a hoja de la fusión, comparando contra los checkpoints fuente y objetivo.
- Transferencia entre configuraciones de cámara: el uso de una demostración con "large view" y yaw +30° permite estudiar cómo se comporta la política cuando la cámara cambia de punto de vista respecto a la demostración fuente.
- Integración en pipelines de investigación con openpi: al estar etiquetado con `openpi`, puede cargarse en el stack de inferencia de Physical Intelligence para experimentos de imitación en robots de laboratorio.
- Base para fine-tuning posterior: el checkpoint puede servir como inicialización para nuevas tareas de manipulación dentro del mismo entorno SNUMPR, aprovechando la normalización original incluida en `assets`.
- Docencia y divulgación técnica: útil para explicar de forma concreta cómo se combina un fine-tuning fuente y uno objetivo con aritmética de dominios, incluyendo el manejo del estado real frente al virtual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación en robot real ("No robot evaluation has been run yet").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio pesa 5,3 GB en BF16, por lo que se necesita al menos ese orden de magnitud en memoria para cargar los pesos.
- GPU recomendadas: no disponible. Por el tamaño del checkpoint, es plausible que quepa en GPUs de 16-24 GB, pero el dato no está confirmado en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado. El tamaño de pesos (5,3 GB) sugiere que sí en GPUs con 8-16 GB o más, pero no hay validación documentada.
- Opciones de despliegue: el stack asociado es `openpi` (Physical Intelligence) para inferencia de políticas; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR real-world DART merge (este) | VLA para tarea `put_lemon_plate` | no disponible | no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| Base `snumpr-iclr27-v1/9999` | VLA SNUMPR inicial | no disponible | no disponible | no disponible | Referenciado como base |
| Checkpoint fuente `pi05_snumpr_dart_paired_source_put_lemon_plate` | Fine-tuning IL sobre `demonstration_7` | no disponible | no disponible | no disponible | Preset interno del pipeline |
| Checkpoint objetivo `pi05_snumpr_dart_paired_target_large_view_yaw30_keepstate_put_lemon_plate` | Fine-tuning IL sobre demostración re-recolectada | no disponible | no disponible | no disponible | Preset interno del pipeline |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación en robot real: la model card afirma que no se ha ejecutado ninguna prueba física, por lo que el éxito de la tarea no está verificado.
- Requiere transformación explícita en el controlador: las acciones delta están en un marco virtual rotado +30° en yaw; si no se aplica `Rz(+30)` antes de enviar comandos, el robot ejecutará movimientos incorrectos.
- El estado de articulaciones debe pasarse sin modificar (`--keep-state`); mezclar estado real con acciones virtuales sin la transformación correspondiente rompe la coherencia del par observación-acción.
- Especialización extrema: el modelo está entrenado únicamente para `put_lemon_plate`; no generaliza a otras tareas sin fine-tuning adicional.
- Entrenamiento limitado: 1.000 actualizaciones con batch 64, sin warmup ni EMA, lo que puede implicar menor estabilidad que entrenamientos más largos.
- Riesgo de sobreajuste a la demostración: al derivar de una única demostración fuente y una única objetivo, la variabilidad de escenarios cubierta es reducida.
- Sesgos conocidos: no documentados en la información disponible; en robótica, los sesgos provienen típicamente del entorno de recogida de datos y de la configuración de cámara.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo base podría tener condiciones adicionales no detalladas.
- Idiomas: no aplica, es un modelo de control; no se documenta procesamiento de lenguaje natural.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-put-lemon-plate-20261030
- Repositorio DART referenciado: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), sin URL directa en la información proporcionada
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `c4fcb61`), sin URL directa en la información proporcionada
- Stack de inferencia: `openpi` (Physical Intelligence), sin URL directa en la información proporcionada
- Modelo base: `snumpr-iclr27-v1/9999`, sin URL directa en la información proporcionada

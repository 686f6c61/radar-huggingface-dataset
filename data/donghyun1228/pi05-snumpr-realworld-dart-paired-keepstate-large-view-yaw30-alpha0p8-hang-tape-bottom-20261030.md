# Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-hang-tape-bottom-20261030

## Resumen

π0.5 SNUMPR real-world DART merge for task `hang_tape_bottom` es un checkpoint de robótica derivado de π0.5, un modelo visión-lenguaje-acción (VLA) desarrollado originalmente por Physical Intelligence. Este artefacto concreto lo publica el usuario Donghyun1228 y aplica una técnica de adaptación por dominio denominada DART (domain arithmetic) sobre una política base de SNUMPR, una variante del modelo VLA inicial orientada a tareas de manipulación. El resultado es una política específica para la tarea `hang_tape_bottom`, con una demostración objetivo recogida de nuevo el 2026-10-30 y emparejada con una demostración fuente con yaw 0.

El modelo no es un LLM de propósito general ni un modelo conversacional: es un checkpoint de pesos BF16 (5,3 GB) pensado para control robótico, con normalización original preservada y una transformación geométrica concreta (rotación virtual de base +30° sobre las poses TCP y las acciones delta, manteniendo el estado articular real). Su relevancia es metodológica: documenta un pipeline reproducible de fine-tuning por imitación (1.000 actualizaciones, batch 64, LR constante 5e-5) y una fusión verificada clave por clave (51/51) mediante el script oficial `domain_arithmetic.dart` del repositorio `snumprlab/dart`.

No se dispone de información sobre arquitectura interna, número de parámetros, longitud de contexto ni idiomas soportados en la documentación proporcionada. Tampoco se han ejecutado evaluaciones en robot real, por lo que el artefacto debe considerarse experimental y no validado en despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo VLA π0.5, detalles internos no documentados en la ficha) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en BF16 y `assets` con normalización original (SHA `f549619e…`); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El checkpoint parte de `snumpr-iclr27-v1/9999`, descrito como la VLA inicial de SNUMPR con normalización original. Sobre esa base se aplican dos fine-tunings por imitación: uno sobre la fuente (`demonstration_6`, yaw 0, preset `pi05_snumpr_dart_paired_source_hang_tape_bottom`) y otro sobre la demostración objetivo recogida de nuevo con vista amplia y yaw virtual de +30° (preset `pi05_snumpr_dart_paired_target_large_view_yaw30_keepstate_hang_tape_bottom`). Ambos usan solo imitación (IL), 1.000 actualizaciones, batch 64, LR constante 5e-5, sin warmup, sin EMA y entrenando todos los pesos, con el código `Donghyun1228/vla_adaptation` en el commit `c4fcb61`.

La innovación técnica es la fusión DART: se ejecuta el `domain_arithmetic.dart` oficial de `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`) con α 0.8, scope `all`, semilla 42 y en CPU. El resultado se verifica hoja por hoja en `dart_merge_verified.json` (51/51 claves, sin fallback). Un detalle crítico es la asimetría geométrica: las poses TCP y las acciones delta se rotan con yaw virtual +30° (`Rz(-30)`), pero `observation.state` conserva los ángulos articulares reales gracias a `--keep-state`. El controlador del robot debe deshacer la rotación en la acción (`Δxyz_real = Rz(+30) Δxyz_virtual`) y alimentar el estado articular real sin modificar. No se documentan datos de entrenamiento en términos de número de tokens ni composición del dataset.

## Capacidades

- Control robótico por imitación para la tarea específica `hang_tape_bottom`.
- Generación de acciones delta a partir de observaciones visuales y estado articular (política VLA π0.5).
- Soporte de estado articular real sin rotar (`--keep-state`) combinado con acciones en marco virtual rotado.
- Adaptación por dominio mediante aritmética de dominios (DART) con α configurable.
- Verificación de integridad de la fusión a nivel de clave (51/51).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Investigación en adaptación de dominio para VLA: el checkpoint sirve como referencia reproducible de un pipeline DART completo (fuente, objetivo, fusión y verificación), útil para replicar el método en otras tareas de manipulación.
- Manipulación robótica de precisión en línea de montaje: la política está entrenada para `hang_tape_bottom`, una tarea de colocación de cinta, y puede evaluarse en un banco de pruebas con el controlador aplicando la rotación `Rz(+30)` sobre las acciones.
- Estudio de asimetrías de marco de referencia: el par `keep-state` + yaw virtual permite analizar cómo afecta mantener el estado real mientras se rotan las acciones, un caso poco habitual en la literatura.
- Base para fine-tuning posterior: al estar publicada con licencia Apache 2.0 y pesos BF16, puede reutilizarse como inicialización para tareas relacionadas con cinta o ensamblaje.
- Validación de herramientas de fusión: `dart_merge_verified.json` y `merge_config.json` permiten auditar el comportamiento del script `domain_arithmetic.dart` en un caso real.
- Docencia y divulgación: ejemplo concreto de cómo se documenta un checkpoint derivado con normalización original, hashes y verificación hoja por hoja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha ejecutado evaluación en robot real.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 5,3 GB y los pesos se publican en BF16, por lo que la inferencia requiere al menos ese orden de magnitud de memoria más overhead del runtime.
- GPU recomendadas: no disponibles en la documentación; por tamaño, una GPU con 16-24 GB (RTX 4090, A100 40 GB) sería el rango razonable, pero no está confirmado.
- ¿Cabe en GPU de consumo? Probablemente en GPUs de 24 GB, aunque no se especifica.
- Opciones de despliegue: no se documentan (no se mencionan vLLM, llama.cpp, Ollama ni TGI; el stack esperado es el de `openpi`/`snumprlab/dart`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART `hang_tape_bottom` (este) | no disponible | no disponible | Manipulación robótica (cinta) | Apache 2.0 | HuggingFace, 0 descargas |
| π0.5 base (Physical Intelligence) | no disponible en esta ficha | no disponible | VLA generalista | no disponible | no disponible |
| `snumpr-iclr27-v1/9999` (base SNUMPR) | no disponible | no disponible | VLA inicial SNUMPR | no disponible | referenciado como base |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Sin evaluación en robot real: la model card afirma explícitamente que no se ha ejecutado ninguna prueba física, por lo que el rendimiento real es desconocido.
- Acoplamiento geométrico estricto: el controlador debe aplicar `Δxyz_real = Rz(+30) Δxyz_virtual` y alimentar el estado articular real sin rotar; ignorar esta convención invalida las acciones.
- Especialización extrema: la política está entrenada para una única tarea (`hang_tape_bottom`) y no es generalista.
- Riesgo de sobreajuste a la demostración: con solo 1.000 actualizaciones sobre una demostración re-recogida, la variabilidad de escenarios es limitada.
- Normalización original obligatoria: los `assets` deben usarse tal cual (SHA `f549619e…`); cualquier cambio rompe la correspondencia con los pesos.
- Idiomas y sesgos: no documentados; al no ser un modelo de lenguaje, las consideraciones de sesgo lingüístico no aplican directamente, pero no hay análisis de sesgo visual o de dominio.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación en producción desaconseja su despliegue sin pruebas propias.
- Repositorio con 0 descargas y 0 likes: sin comunidad que haya validado el artefacto.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-hang-tape-bottom-20261030
- Repositorio DART referenciado: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), sin URL directa en la información proporcionada.
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `c4fcb61`), sin URL directa en la información proporcionada.
- Modelo base: `snumpr-iclr27-v1/9999`, sin URL directa en la información proporcionada.
- El resultado de búsqueda web disponible (documentación de Azure Load Testing) no guarda relación con este modelo y se descarta.

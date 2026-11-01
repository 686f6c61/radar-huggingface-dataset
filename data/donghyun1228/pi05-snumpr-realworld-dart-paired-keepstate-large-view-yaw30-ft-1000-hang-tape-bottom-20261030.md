# Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-ft-1000-hang-tape-bottom-20261030

## Resumen

π0.5 SNUMPR real-world DART es un checkpoint de robótica derivado del modelo base π0.5 (openpi) y del modelo inicial SNUMPR VLA, ajustado por Donghyun1228 para una única tarea de manipulación real: `hang_tape_bottom`. No se trata de un modelo de lenguaje generalista, sino de una política visomotora (VLA, vision-language-action) que asigna acciones de robot a partir de observaciones visuales y del estado de las articulaciones. El checkpoint es uno de los dos fine-tunes one-shot que se fusionan en un modelo emparejado publicado aparte con un coeficiente alpha de 0,8.

El ajuste se realizó exclusivamente mediante imitation learning (IL) sobre una demostración de gran campo de visión recogida el 2026-10-30, con 1.000 actualizaciones, batch de 64 y una tasa de aprendizaje constante de 5e-5. Un detalle técnico central es la transformación de las poses TCP y de las acciones delta mediante un yaw de base virtual de +30° (`Rz(-30)`), mientras que `observation.state` conserva los ángulos reales de las articulaciones. El controlador del robot debe deshacer esa rotación en las acciones (`Δxyz_real = Rz(+30) Δxyz_virtual`) y alimentar el estado articular real sin cambios.

El repositorio ocupa 12,4 GB y contiene pesos en FP32 (paso 999) junto con los assets de normalización original y el registro de la ejecución en wandb. La licencia es Apache 2.0. El autor indica explícitamente que todavía no se ha ejecutado ninguna evaluación sobre robot real, por lo que el checkpoint debe tratarse como material experimental de adaptación, no como un policy validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de π0.5 / openpi; detalles internos de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible; pesos publicados en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | params en FP32 (formato openpi/JAX), assets de normalización y wandb_run.json |

## Arquitectura y entrenamiento

El checkpoint parte de `snumpr-iclr27-v1/9999`, el modelo inicial SNUMPR VLA con normalización original, y aplica el preset `pi05_snumpr_dart_paired_target_large_view_yaw30_keepstate_hang_tape_bottom` sobre una demostración de gran campo de visión re-recogida para la tarea. La arquitectura subyacente es la de π0.5 (openpi), un modelo visomotoro que combina entrada visual y estado propioceptivo para emitir acciones; el número de parámetros y la configuración de capas no se documentan en la información disponible.

El entrenamiento es de imitation learning puro, sin RLHF ni DPO: 1.000 actualizaciones, batch 64, LR constante 5e-5, sin warmup, sin EMA, todos los pesos entrenables, AdamW con clip 1.0 y semilla 42. Se usó el código `Donghyun1228/vla_adaptation` (commit `c4fcb61`) con la receta oficial `pi05_libero_oneshotft` del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`). La innovación destacable es la augmentación por yaw de base virtual: poses TCP y acciones delta se rotan +30° para simular un marco de referencia distinto, pero el estado articular se mantiene real, lo que exige una corrección explícita en el controlador en tiempo de ejecución.

## Capacidades

- Generación de acciones de robot para la tarea concreta `hang_tape_bottom` a partir de observaciones visuales de gran campo de visión.
- Consumo de estado propioceptivo real (`observation.state` con ángulos articulares sin transformar).
- Emisión de acciones delta en un marco virtual rotado +30°, corregibles por el controlador mediante `Rz(+30)`.
- Adaptación one-shot a una nueva demostración mediante fine-tuning de imitation learning.
- Fusión con otro fine-tune emparejado mediante coeficiente alpha (modelo fusionado publicado aparte).
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio o modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica de precisión en línea de montaje: el policy ejecuta la secuencia `hang_tape_bottom` sobre objetos reales, usando la demostración de gran campo de visión para localizar el objetivo y el estado articular real para el control fino.
- Adaptación rápida a una nueva celda de trabajo: al ser un fine-tune one-shot de 1.000 pasos, permite reajustar el policy a una reconfiguración física (nuevo yaw de base) sin reentrenar desde cero.
- Investigación en transferencia de marcos de referencia: el esquema de yaw virtual +30° con estado real es un banco de pruebas para estudiar cómo los VLA generalizan ante cambios de base sin alterar la propriocepción.
- Integración en pipelines de openpi: el checkpoint se carga con el stack openpi/JAX y los assets de normalización original, lo que facilita su uso en entornos de investigación ya basados en π0.5.
- Comparación de estrategias de fusión de modelos: al formar parte de un par fusionado con alpha 0,8, sirve para evaluar el efecto de mezclar fine-tunes especializados frente a uno solo.
- Docencia y reproducción de recetas: la receta `pi05_libero_oneshotft` y los hiperparámetros documentados permiten reproducir el ajuste en laboratorios con acceso a brazos robóticos y demostraciones propias.
- Validación previa a despliegue: útil como candidato para pruebas en simulación o banco de pruebas antes de ejecutar la corrección de yaw en el controlador real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que aún no se ha ejecutado ninguna evaluación sobre robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 12,4 GB y los pesos se publican en FP32, por lo que la inferencia requerirá al menos esa magnitud de memoria, sin cifra oficial.
- GPU recomendadas: no disponible; no se documentan requisitos de GPU en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en tarjetas consumer.
- Opciones de despliegue: stack openpi/JAX con carga de `params` y `assets`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de policy.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| π0.5 SNUMPR real-world DART (este checkpoint) | VLA fine-tune one-shot para `hang_tape_bottom` | no disponible | Apache 2.0 | HuggingFace, 0 descargas | Pesos FP32, sin evaluación en robot |
| π0.5 SNUMPR real-world DART paired alpha0p8 | VLA fusionado de dos fine-tunes | no disponible | Apache 2.0 | HuggingFace (repo enlazado en la model card) | Mezcla con alpha 0,8 del par |
| SNUMPR VLA inicial (`snumpr-iclr27-v1/9999`) | VLA base | no disponible | no disponible | Referenciado como init | Normalización original, sin ajuste a la tarea |
| π0.5 openpi (base) | VLA generalista | no disponible | no disponible | openpi | Modelo de partida del stack |

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluación sobre robot real; el rendimiento en hardware físico es desconocido.
- El checkpoint está especializado en una única tarea (`hang_tape_bottom`) y no debe esperarse generalización a otras tareas.
- Requiere corrección obligatoria en el controlador: `Δxyz_real = Rz(+30) Δxyz_virtual` y alimentar el estado articular real sin cambios (`virtual_base_yaw_deg=30`, `keep_real_state=True`); omitirla produce acciones incoherentes.
- El estado del optimizador (`train_state`) no está incluido, por lo que no es posible reanudar el entrenamiento desde este checkpoint tal cual.
- Los pesos están en FP32 y el repo ocupa 12,4 GB; no se documentan versiones cuantizadas.
- Riesgo de sobreajuste a la demostración única re-recogida el 2026-10-30 y a las condiciones de iluminación y cámara de esa captura.
- No se documentan sesgos, cobertura idiomática ni límites de contexto; al ser un policy visomotor, esos ejes no aplican del mismo modo que en un LLM.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación en robot hace desaconsejable un despliegue en producción sin pruebas propias.
- El nombre del repositorio incluye una fecha futura (20261030), lo que puede dificultar la trazabilidad y la búsqueda; conviene verificar la procedencia antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-ft-1000-hang-tape-bottom-20261030
- Modelo fusionado emparejado: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-hang-tape-bottom-20261030
- Código de adaptación: https://github.com/Donghyun1228/vla_adaptation (commit `c4fcb61`)
- Repositorio de recetas DART: https://github.com/snumprlab/dart (commit `1b23c4f42f73168c78a20b353453145e74f64711`)
- openpi (π0.5): no disponible en la información proporcionada
- Paper de SNUMPR (ICLR27): no disponible en la información proporcionada
- Demo o blog del autor: no disponible en la información proporcionada

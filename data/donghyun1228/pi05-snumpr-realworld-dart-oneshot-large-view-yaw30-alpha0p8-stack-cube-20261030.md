# Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-stack-cube-20261030

## Resumen

π0.5 SNUMPR real-world DART merge es un modelo de visión-lenguaje-acción (VLA) orientado a robótica manipulativa, derivado de la familia π0.5 de Physical Intelligence y adaptado por el autor Donghyun1228 en el contexto del proyecto SNUMPR. El modelo resuelve una tarea concreta de manipulación: apilar un cubo (`stack_cube`) a partir de una única demostración en el mundo real, aplicando una transformación de vista (large view) y un giro virtual de la base de +30 grados (yaw30). La relevancia radica en que ejemplifica la receta "one-shot" de adaptación de políticas VLA mediante DART (Domain Arithmetic), una técnica de fusión de pesos que combina un fine-tuning fuente (yaw 0) con un fine-tuning objetivo (vista grande, yaw +30) para generalizar la política a una nueva configuración de cámara y orientación del robot.

El repositorio contiene únicamente los pesos en BF16 y los assets de normalización original, con un tamaño total de 5.3 GB. No se ha ejecutado ninguna evaluación sobre robot real, por lo que se trata de un artefacto de investigación en fase de validación. La licencia es Apache 2.0 y el pipeline declarado es `robotics`.

Se trata de un modelo de nicho, de un solo task y de un solo autor, sin descargas ni likes en el momento de la consulta, pensado para reproducir el flujo de trabajo de SNUMPR/DART más que para uso general en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π0.5 (no se detalla la arquitectura interna en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en BF16 y `assets` de normalización original (no se especifica el contenedor exacto, probablemente safetensors/checkpoint de openpi) |

## Arquitectura y entrenamiento

El modelo parte de la base `snumpr-iclr27-v1/9999`, descrita como "initial SNUMPR VLA, original normalization". Sobre esa base se realizan dos fine-tunings independientes de imitación (IL only), cada uno con 1.000 actualizaciones, batch de 64, learning rate constante de 5e-5, sin warmup, sin EMA y entrenando todos los pesos. El primero (source FT) usa el preset `pi05_snumpr_dart_oneshot_source_stack_cube` sobre la única demostración `demonstration_0` de la tarea con yaw 0. El segundo (target FT) usa el preset `pi05_snumpr_dart_oneshot_target_large_view_yaw30_stack_cube` sobre la única demostración one-shot en vista grande con yaw virtual de +30 grados.

La innovación técnica es la fusión DART (Domain Arithmetic) aplicada con el script oficial `domain_arithmetic.dart` del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), con α = 0.8, scope "all", seed 42 y ejecución en CPU. El resultado se verifica hoja por hoja: `dart_merge_verified.json` confirma 51/51 claves fusionadas sin fallback, y `merge_config.json` registra la configuración del merger. No se menciona RLHF, DPO ni entrenamiento con preferencias; el proceso es puramente de imitación supervisada más aritmética de dominios en el espacio de pesos.

Un detalle crítico de despliegue: el controlador del robot debe aplicar la transformación inversa del yaw virtual, `Δxyz_real = Rz(+30) Δxyz_virtual` y `q0_real - 30°` en el estado inicial.

## Capacidades

- Manipulación robótica de tipo pick-and-place para la tarea específica `stack_cube` (apilar un cubo).
- Política VLA condicionada por visión e instrucción, heredada de la arquitectura π0.5.
- Generalización a una vista de cámara "large view" y a una orientación de base con yaw +30 grados mediante la fusión DART.
- Aprendizaje one-shot: la política se adapta a partir de una única demostración por dominio.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual, código, matemáticas, visión general, audio ni multilingüismo.
- No se documenta un modo "thinking" ni decodificación especulativa.

## Casos de uso

- Reproducción de experimentos SNUMPR/DART: el modelo sirve como artefacto de referencia para validar la receta de fusión DART con α = 0.8 sobre una tarea concreta, comparando el resultado hoja por hoja con el registro `dart_merge_verified.json`.
- Investigación en adaptación one-shot de políticas VLA: permite estudiar cuánto generaliza una política entrenada con una sola demostración cuando se fusiona con un dominio fuente distinto (yaw 0 frente a yaw +30).
- Transferencia de punto de vista en robótica: útil para analizar cómo un cambio de cámara (large view) y de orientación de la base afecta a la ejecución de la política, aplicando la transformación inversa de yaw en el controlador.
- Benchmark interno de técnicas de model merging: DART se puede contrastar con otras técnicas de aritmética de tareas sobre el mismo par de checkpoints fuente y objetivo.
- Prototipado en laboratorio de tareas de apilado: como política inicial para experimentos de manipulación con un único ejemplo, antes de recoger más datos.
- Docencia y divulgación: ejemplo didáctico de pipeline completo (base VLA, fine-tuning de imitación, fusión de pesos, verificación de claves y transformación de coordenadas en el controlador).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación sobre robot real ("No robot evaluation has been run yet").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 5.3 GB en BF16, lo que da una cota inferior aproximada para cargar los pesos, sin contar activaciones ni buffers de visión.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repo (5.3 GB en BF16) es plausible que quepa en GPUs consumer con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: no se documentan explícitamente; el ecosistema de referencia es `openpi` (etiqueta del modelo) y el código de adaptación `Donghyun1228/vla_adaptation` (commit `248126e`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR real-world DART merge (este modelo) | no disponible | no disponible | `stack_cube` one-shot con yaw +30 | Apache 2.0 | HuggingFace, 0 descargas |
| π0.5 base (Physical Intelligence) | no disponible en la información | no disponible | VLA generalista | no disponible en la información | no disponible en la información |
| SNUMPR VLA inicial (`snumpr-iclr27-v1/9999`) | no disponible | no disponible | VLA base SNUMPR | no disponible en la información | referenciado como base |
| Otros merges DART del mismo autor | no disponible | no disponible | variantes de tarea/vista | Apache 2.0 (presumible) | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de un solo task (`stack_cube`): no es un VLA generalista y no debe usarse fuera de esa tarea.
- Sin evaluación en robot real: el autor declara explícitamente que no se ha ejecutado ninguna prueba física, por lo que el rendimiento real es desconocido.
- Dependencia crítica de la transformación de coordenadas: el controlador debe aplicar `Δxyz_real = Rz(+30) Δxyz_virtual` y `q0_real - 30°`; omitirla invalida las acciones generadas.
- Normalización original: los assets publicados usan la normalización original (SHA `f549619e…`); cualquier cambio en el pipeline de preprocesado puede degradar la política.
- Entrenamiento con una sola demostración por dominio: alta sensibilidad a la variabilidad de la escena, iluminación y posición de los objetos.
- Riesgo de sobreajuste y de comportamiento frágil fuera de la distribución de la demostración one-shot.
- Sin datos sobre sesgos, alucinación o cobertura idiomática; al ser un modelo de acción, el riesgo principal es la ejecución incorrecta de movimientos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y el carácter de investigación desaconsejan producción sin validación previa.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de reproducibilidad independiente.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-stack-cube-20261030
- Repositorio DART referenciado: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`)
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `248126e`)
- Base del modelo: `snumpr-iclr27-v1/9999`
- Ecosistema openpi: no se proporciona URL en la información disponible.

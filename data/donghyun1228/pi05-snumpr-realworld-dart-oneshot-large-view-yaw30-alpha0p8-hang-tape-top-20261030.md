# Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-hang-tape-top-20261030

## Resumen

π0.5 SNUMPR real-world DART merge para la tarea `hang_tape_top` es un modelo de visión-lenguaje-acción (VLA) derivado de la familia π0.5 de Physical Intelligence, adaptado por el autor Donghyun1228 sobre la base SNUMPR (variante de investigación del ICLR 2027) y fusionado mediante la técnica DART (Domain Arithmetic) del repositorio `snumprlab/dart`. El modelo está especializado en una única tarea de manipulación robótica real: colgar cinta adhesiva en una posición superior, con una demostración one-shot capturada desde una vista amplia y con un giro virtual de base de +30 grados.

El repositorio contiene únicamente pesos en BF16 y los assets de normalización originales, con un tamaño total de 5,3 GB. Se trata de un artefacto de investigación: no se ha ejecutado ninguna evaluación sobre robot real, no tiene descargas ni interacciones, y su interés es fundamentalmente metodológico, como ejemplo reproducible de fusión de adaptaciones por tarea mediante aritmética de dominios en el espacio de pesos.

La relevancia actual radica en que demuestra un flujo completo de adaptación paramétricamente eficiente para VLA: fine-tuning de origen sobre una demostración, fine-tuning de destino sobre otra demostración con vista y orientación distintas, y fusión de ambos mediante DART con α = 0,8, verificada clave por clave (51/51) sin fallback.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (transformer visión-lenguaje-acción); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | BF16 (`params`) más `assets` de normalización original (SHA `f549619e…`) |

## Arquitectura y entrenamiento

El modelo parte de la base `snumpr-iclr27-v1/9999`, una VLA SNUMPR inicial con normalización original, y se construye en dos fases de fine-tuning supervisado (IL, imitation learning) sobre una única demostración por fase. La fase de origen usa el preset `pi05_snumpr_dart_oneshot_source_hang_tape_top` sobre la demostración `demonstration_0` de la tarea con yaw 0. La fase de destino usa el preset `pi05_snumpr_dart_oneshot_target_large_view_yaw30_hang_tape_top` sobre la demostración one-shot de vista amplia con yaw virtual de base +30 grados.

Ambas fases comparten hiperparámetros: 1.000 actualizaciones, batch de 64, learning rate constante de 5e-5, sin warmup, sin EMA y entrenamiento de todos los pesos, ejecutado con el código `Donghyun1228/vla_adaptation` en el commit `248126e`. La fusión se realiza con el script oficial `domain_arithmetic.dart` del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), con α = 0,8, scope `all`, semilla 42 y ejecución en CPU. La innovación técnica destacable es la verificación hoja por hoja de la fusión: `dart_merge_verified.json` confirma 51/51 claves fusionadas sin fallback, y `merge_config.json` registra la configuración exacta del merger.

## Capacidades

- Control robótico de manipulación para una tarea concreta: colgar cinta adhesiva en la posición superior (`hang_tape_top`).
- Política visomotora condicionada por observación visual e instrucción de tarea, heredada de la arquitectura π0.5.
- Ejecución one-shot: entrenado con una sola demostración por fase de fine-tuning.
- Robustez a cambios de punto de vista: la fase de destino introduce vista amplia y un giro virtual de base de +30 grados.
- Fusión de comportamientos mediante aritmética de dominios en pesos (DART), combinando la política de origen y la de destino.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento explícito ni multimodalidad más allá de la visión necesaria para la política.

## Casos de uso

- Investigación en adaptación de VLA: servir como referencia reproducible de un pipeline DART de dos fases (origen y destino) sobre una tarea de manipulación, con configuración y verificación de fusión publicadas.
- Reproducción de experimentos de one-shot imitation learning: el modelo permite comparar el efecto de α = 0,8 en la fusión frente a otras configuraciones usando el mismo script `domain_arithmetic.dart`.
- Estudio de transferencia de punto de vista: el giro virtual de +30 grados y la vista amplia permiten analizar cómo se comporta una política fusionada ante cambios de cámara y orientación de base.
- Base para evaluación en robot real: al no haberse evaluado todavía, es un punto de partida para medir éxito de la tarea `hang_tape_top` en un montaje físico con la transformación inversa de yaw aplicada por el controlador.
- Docencia y divulgación técnica: ejemplo compacto (5,3 GB) de fusión de pesos en modelos de robótica, útil para explicar aritmética de dominios con verificación por claves.
- Integración en pipelines de investigación con openpi: los tags `pi05` y `openpi` sugieren compatibilidad con el ecosistema de herramientas de Physical Intelligence para cargar y ejecutar políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación sobre robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 5,3 GB en BF16, por lo que se necesita al menos ese orden de magnitud más memoria para activaciones y buffers de visión.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar GPUs de centro de datos (A100, H100) o consumer de gama alta, pero no se confirma.
- ¿Cabe en GPU consumer?: no confirmado; los 5,3 GB de pesos en BF16 sugieren que sí en tarjetas con 12-16 GB o más, siempre que el runtime lo permita, pero es una estimación no verificada.
- Opciones de despliegue: no disponibles; los tags apuntan a `openpi` como ecosistema previsto, sin documentación de serving en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART `hang_tape_top` (este) | no disponible | no disponible | Apache 2.0 | HuggingFace, 0 descargas | Especializado en una tarea, sin evaluación real |
| π0.5 base (Physical Intelligence) | no disponible | no disponible | no disponible | no disponible | Modelo generalista del que deriva la familia |
| SNUMPR `snumpr-iclr27-v1/9999` | no disponible | no disponible | no disponible | no disponible | Base inicial usada para este fine-tuning |

No se dispone de datos de rendimiento ni de parámetros de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Ausencia total de evaluación en robot real: el autor lo declara explícitamente; el éxito de la política no está verificado.
- Especialización extrema: el modelo solo cubre la tarea `hang_tape_top`; no es un modelo generalista.
- Dependencia de una transformación externa: el controlador debe aplicar la transformación inversa de yaw virtual (`Δxyz_real = Rz(+30) Δxyz_virtual`, estado `q0_real - 30°`); omitirla invalida las acciones.
- Entrenamiento con una sola demostración por fase: riesgo alto de sobreajuste y baja generalización a condiciones no vistas.
- Sin datos de sesgos, idiomas ni robustez: la model card no documenta comportamiento multilingüe ni evaluación de alucinación (concepto además poco aplicable a una política de acción).
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación y la naturaleza de investigación desaconsejan producción sin evaluación previa.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de soporte.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-hang-tape-top-20261030
- Repositorio DART: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), sin URL directa en la información proporcionada
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `248126e`), sin URL directa en la información proporcionada
- Base SNUMPR: `snumpr-iclr27-v1/9999`, sin URL directa en la información proporcionada

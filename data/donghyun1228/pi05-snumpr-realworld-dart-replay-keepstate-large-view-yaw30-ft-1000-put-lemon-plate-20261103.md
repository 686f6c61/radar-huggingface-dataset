# Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-put-lemon-plate-20261103

## Resumen

π0.5 SNUMPR real-world DART es un modelo de visión-lenguaje-acción (VLA) orientado a robótica manipulativa, publicado por el usuario Donghyun1228 sobre la base del proyecto openpi y del modelo π0.5. Se trata de un fine-tune de un solo objetivo (*one-shot target fine-tune*) para la tarea concreta `put_lemon_plate`, construido a partir del checkpoint inicial SNUMPR VLA (`snumpr-iclr27-v1/9999`) mediante aprendizaje por imitación (IL) durante 1.000 actualizaciones sobre una réplica de demostración en el mundo real con vistas sintéticas.

La particularidad del modelo es el uso de DART (Domain Adaptation via Replay of Trajectories, según la nomenclatura del autor) con *target-view replay*: el robot reproduce la trayectoria articular de una demostración fuente mientras la cámara base se sitúa en una vista desplazada, y las poses TCP y las acciones delta se rotan virtualmente +30° en yaw. El estado articular (`observation.state`) se mantiene con los ángulos reales, de ahí el sufijo `keepstate`. Esto permite adaptar la política a cambios de punto de vista de cámara sin recoger nuevas demostraciones reales.

El modelo es relevante como ejemplo reproducible de adaptación de políticas VLA a condiciones de cámara alteradas, con receta oficial publicada (`pi05_libero_oneshotft`), pesos en FP32 y normalización original. No obstante, es un artefacto de investigación muy específico: no se ha ejecutado ninguna evaluación en robot real y el repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (openpi); detalles internos de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en FP32 y `assets` (normalización original), formato openpi; SHA de assets `f549619e…` |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `snumpr-iclr27-v1/9999`, una implementación SNUMPR del VLA π0.5 del ecosistema openpi, con normalización original conservada. Sobre esa base se aplica un fine-tune de aprendizaje por imitación con 1.000 actualizaciones, batch de 64, LR constante de 5e-5 sin warmup, sin EMA, AdamW con clipping 1.0 y semilla 42, ejecutado en 2×H100 con FSDP. Se entrenan todos los pesos. La receta oficial es `pi05_libero_oneshotft` del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), con código de adaptación en `Donghyun1228/vla_adaptation` (commit `2065dd0a`).

La innovación técnica es el *target-view replay*: se toma la demostración fuente `demonstration_7` y el robot reproduce su trayectoria articular mientras la cámara base se coloca en una vista con gran desplazamiento. Las poses TCP y las acciones delta se rotan +30° en yaw (`Rz(-30)`), pero el estado articular se mantiene real (`--keep-state`). En inferencia, el controlador debe deshacer la rotación (`Δxyz_real = Rz(+30) Δxyz_virtual`) y alimentar el estado articular real sin modificar (`virtual_base_yaw_deg=30`, `keep_real_state=True`). No se incluye el estado del optimizador (`train_state`); solo se publican el paso `999` de `params` y `assets`.

## Capacidades

- Generación de acciones motoras para manipulación robótica en la tarea `put_lemon_plate` (colocar un limón en un plato).
- Procesamiento conjunto de observaciones visuales (cámara base en vista desplazada) y estado articular real del robot.
- Aprendizaje por imitación de una única demostración fuente con aumentación de punto de vista.
- Adaptación a rotaciones virtuales de la base de +30° en yaw, con corrección explícita en el controlador.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking.
- No se documenta soporte de diálogo ni generación de texto libre.

## Casos de uso

- Adaptación de políticas VLA a cambios de montaje de cámara: el modelo permite reentrenar una política existente cuando la cámara base se desplaza o rota, reutilizando la trayectoria de una demostración previa en lugar de recoger nuevos datos reales.
- Investigación en aumentación de datos para robótica: sirve como referencia reproducible del pipeline DART con *target-view replay* y rotación virtual de acciones, útil para estudiar la transferencia sim-a-real a nivel de vista.
- Replicación de experimentos de fine-tune one-shot: con la receta `pi05_libero_oneshotft` y los commits indicados, un laboratorio puede reproducir el entrenamiento en 2×H100 en aproximadamente 1.000 pasos.
- Base para fine-tunes posteriores: el checkpoint `999` con normalización original puede servir de inicialización para otras tareas de manipulación con condiciones de cámara alteradas.
- Validación de correcciones cinemáticas en controladores: el requisito de rotar las acciones de vuelta (`Rz(+30)`) y mantener el estado real permite probar la integración entre política y controlador robótico.
- Docencia y divulgación: ejemplo concreto de cómo se compone un VLA (π0.5), cómo se aplica IL y cómo se gestionan normalización y sistemas de referencia en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación en robot real (*"No robot evaluation has been run yet"*).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB y los pesos se publican en FP32, lo que sugiere un modelo del orden de miles de millones de parámetros, pero no se confirma el tamaño.
- GPU de entrenamiento documentadas: 2×H100 con FSDP, batch 64, 1.000 actualizaciones.
- GPU recomendadas para inferencia: no disponible; por el formato FP32 y el tamaño del repo, se requiere una GPU de datacenter (A100/H100) o consumer de gama alta con suficiente VRAM, sin cifra confirmada.
- ¿Cabe en GPU consumer?: no disponible.
- Opciones de despliegue: el ecosistema openpi (no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART (este) | no disponible | no disponible | Manipulación `put_lemon_plate` con vista desplazada | Apache 2.0 | Hugging Face, 0 descargas |
| `pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-put-lemon-plate-20261103` | no disponible | no disponible | Variante alpha 0.8 del mismo pipeline | Apache 2.0 | Hugging Face |
| π0.5 base (openpi) | no disponible | no disponible | VLA generalista | no disponible en la información | openpi |
| SNUMPR VLA inicial (`snumpr-iclr27-v1/9999`) | no disponible | no disponible | Punto de partida del fine-tune | no disponible en la información | Referenciado en la model card |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado únicamente para la tarea `put_lemon_plate`; no generaliza a otras tareas sin nuevo fine-tune.
- Sin evaluación en robot real: no hay evidencia empírica de éxito en despliegue físico.
- Dependencia crítica de la corrección cinemática: el controlador debe aplicar `Δxyz_real = Rz(+30) Δxyz_virtual` y alimentar el estado articular real; un error en este paso invalida las acciones.
- Normalización original obligatoria: los `assets` con SHA `f549619e…` deben usarse tal cual; alterarlos rompe la coherencia entre entrenamiento e inferencia.
- Sin estado del optimizador: no es posible reanudar el entrenamiento desde este checkpoint, solo inferir o fine-tunear desde los pesos.
- Idiomas y capacidades de texto: no documentados; no debe usarse como modelo de lenguaje general.
- Sesgos: no documentados, pero al derivar de un VLA entrenado con demostraciones limitadas puede heredar sesgos de las trayectorias y condiciones de captura originales.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de acciones incorrectas fuera de la distribución de la demostración fuente.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la especificidad del modelo desaconsejan su uso en producción sin validación previa.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-put-lemon-plate-20261103
- Modelo base del merge: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-put-lemon-plate-20261103
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `2065dd0a`), sin URL directa en la información disponible
- Receta oficial: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), sin URL directa en la información disponible
- openpi: no se proporciona URL en la información disponible
- Paper o blog de π0.5: no disponible en la información proporcionada

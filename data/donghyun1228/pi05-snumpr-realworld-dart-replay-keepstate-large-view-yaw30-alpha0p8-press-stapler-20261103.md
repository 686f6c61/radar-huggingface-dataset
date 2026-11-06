# Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-press-stapler-20261103

## Resumen

π0.5 SNUMPR real-world DART merge for task `press_stapler` es un checkpoint de robótica derivado de la familia π0.5 (openpi) y adaptado mediante DART (Domain Arithmetic) por el autor Donghyun1228, vinculado al laboratorio SNUMPR. El modelo resuelve una tarea concreta de manipulación —pulsar una grapadora— a partir de demostraciones reales y una demostración objetivo generada por reproducción de trayectoria con una cámara base desplazada. No es un modelo de lenguaje general, sino un modelo visión-lenguaje-acción (VLA) que produce acciones motoras condicionadas por observaciones visuales y estado articular.

La relevancia técnica del checkpoint está en el procedimiento de construcción: se combinan mediante aritmética de dominios (α = 0.8, scope all) un fine-tuning sobre la demostración fuente y un fine-tuning sobre una reproducción de esa misma demostración capturada desde una vista desplazada, manteniendo el estado articular real (`--keep-state`) y rotando poses TCP y acciones delta por un yaw virtual de +30°. El resultado es un modelo que debe desplegarse con una transformación inversa explícita en el controlador, lo que lo convierte en un artefacto de investigación más que en un componente listo para producción.

El repositorio ocupa 5,3 GB, se distribuye bajo licencia Apache 2.0 y no registra descargas ni valoraciones. No se ha ejecutado ninguna evaluación sobre robot real según la propia model card, por lo que cualquier uso debe tratarse como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA π0.5 (openpi); detalles internos de capas no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos publicados en BF16 |
| Idiomas soportados | no disponible (modelo de robotica, no de texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` (BF16) y `assets` con normalizacion original; no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de la base `snumpr-iclr27-v1/9999`, descrita como VLA SNUMPR inicial con normalizacion original, sobre la arquitectura π0.5 del ecosistema openpi. Sobre esa base se reutiliza, sin reentrenar, un fine-tuning fuente (`pi05-snumpr-realworld-dart-paired-source-ft-1000-press-stapler-20261030`, commit `f8a9474f`) entrenado con la demostracion `demonstration_15` y yaw 0. El fine-tuning objetivo se entrena con imitation learning puro: 1.000 actualizaciones, batch 64, learning rate constante 5e-5, sin warmup, sin EMA y con todos los pesos entrenados (codigo `Donghyun1228/vla_adaptation`, commit `2065dd0a`).

La innovacion esta en la fusion DART: se aplica la implementacion oficial `domain_arithmetic.dart` del repositorio `snumprlab/dart` (commit `1b23c4f4`), con α 0.8, scope all, semilla 42 y ejecucion en CPU. La demostracion objetivo es una reproduccion de la trayectoria articular de la demo fuente con la camara base en una vista de gran desplazamiento, de modo que estado, acciones y timestamps coinciden con la fuente y solo cambian las imagenes. Las poses TCP y las acciones delta se rotan por yaw virtual +30° (`Rz(-30)`), mientras que `observation.state` conserva los angulos articulares reales gracias a `--keep-state`. El merge se verifico clave a clave (51/51, sin fallback) contra el commit del fine-tuning fuente, comprobando tamano y sha256 de LFS o blob id de git.

## Capacidades

- Generacion de acciones motoras para una tarea de manipulacion concreta: pulsar una grapadora (`press_stapler`).
- Condicionamiento multimodal: imagenes de camara base (vista desplazada) mas estado articular real como entrada.
- Ejecucion de politicas de imitation learning entrenadas sobre demostraciones reales de robot.
- Robustez a variacion de punto de vista: el entrenamiento objetivo usa una vista con gran desplazamiento y yaw virtual de 30°.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision general, audio ni thinking mode.
- No se documentan capacidades multilingues; el modelo no opera sobre texto libre.

## Casos de uso

- Investigacion en adaptacion de dominio para VLA: el checkpoint sirve para estudiar como la aritmetica de dominios (DART con α 0.8) transfiere una politica entre vistas de camara sin reentrenar la fuente, comparando contra el modelo DART emparejado de la misma tarea.
- Experimentos de invariancia a punto de vista: al haberse entrenado con una vista desplazada y yaw virtual de 30°, permite medir la degradacion de la politica al cambiar la posicion de la camara base en el montaje real.
- Validacion de pipelines de fusion de pesos: el par `merge_config.json` y `dart_merge_verified.json` sirve como referencia reproducible para verificar merges clave a clave en otros checkpoints.
- Reproduccion de experimentos: con los commits de codigo y los presets indicados (`pi05_snumpr_dart_replay_target_large_view_yaw30_keepstate_press_stapler`), un equipo puede replicar el entrenamiento y la fusion en CPU.
- Banco de pruebas de transformacion de acciones en el controlador: el modelo exige rotar la accion de vuelta con `Δxyz_real = Rz(+30) Δxyz_virtual` y alimentar el estado articular real sin cambios, lo que lo hace util para validar esa capa de software.
- Docencia y prototipado en robotica: tarea acotada y checkpoint pequeno (5,3 GB) para ilustrar el ciclo completo demostracion, fine-tuning, merge y despliegue en un robot de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha ejecutado ninguna evaluacion sobre robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 5,3 GB y los pesos se publican en BF16, por lo que el peso en memoria es del orden de esa cifra; el pico real depende del codigo de openpi y del preprocesado de imagenes, no documentado.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del repositorio sugiere que podria caber en GPUs con 16-24 GB en BF16, pero no hay dato oficial.
- Opciones de despliegue: el ecosistema implicito es openpi (Python); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un VLA de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| Este checkpoint (DART replay keepstate large-view yaw30) | no disponible | no disponible | `press_stapler` con vista desplazada y yaw +30° | Apache 2.0 | Sin evaluacion en robot |
| `pi05-snumpr-realworld-dart-paired-source-ft-1000-press-stapler-20261030` | no disponible | no disponible | `press_stapler` con demo fuente, yaw 0 | Apache 2.0 (segun repo del autor) | Fine-tuning fuente reutilizado |
| `pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-press-stapler-20261103` | no disponible | no disponible | Fine-tuning objetivo del merge | Apache 2.0 (segun repo del autor) | Componente del merge |
| `snumpr-iclr27-v1/9999` (base SNUMPR VLA) | no disponible | no disponible | Base general SNUMPR | no disponible | Base del linaje |

La diferencia entre este checkpoint y el modelo DART emparejado de la misma tarea es unicamente la demostracion objetivo, segun la model card.

## Limitaciones y advertencias

- Sin evaluacion en robot real: la model card afirma que no se ha ejecutado ninguna prueba, por lo que el rendimiento efectivo de la politica es desconocido.
- Requiere transformacion obligatoria en el controlador: hay que rotar la accion con `Δxyz_real = Rz(+30) Δxyz_virtual` y alimentar el estado articular real sin cambios (`virtual_base_yaw_deg=30`, `keep_real_state=True`). Omitirlo invalida el comportamiento del modelo.
- Especifico de una sola tarea y montaje: entrenado para `press_stapler` con una vista concreta; no generaliza a otras tareas sin nuevo fine-tuning.
- Riesgo de sobreajuste a la demostracion: el fine-tuning objetivo son 1.000 actualizaciones sobre una unica reproduccion de `demonstration_15`, con batch 64 y sin EMA.
- Normalizacion fijada: los `assets` incluyen la normalizacion original (SHA `f549619e…`); alterarla cambia la semantica de las acciones.
- Idiomas y sesgos: no aplica evaluacion linguistica; no hay informacion sobre sesgos visuales o de dominio.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validacion y la dependencia de codigo externo (`snumprlab/dart`, `Donghyun1228/vla_adaptation`) trasladan al integrador la responsabilidad de verificacion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-press-stapler-20261103
- Fine-tuning fuente reutilizado: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-source-ft-1000-press-stapler-20261030
- Fine-tuning objetivo del merge: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-press-stapler-20261103
- Codigo de adaptacion (commit `2065dd0a`): repositorio `Donghyun1228/vla_adaptation` (no se proporciona URL directa)
- Implementacion DART (commit `1b23c4f4`): repositorio `snumprlab/dart` (no se proporciona URL directa)

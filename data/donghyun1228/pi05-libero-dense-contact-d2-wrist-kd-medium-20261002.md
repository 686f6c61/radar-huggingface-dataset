# Donghyun1228/pi05-libero-dense-contact-d2-wrist-kd-medium-20261002

## Resumen

Este repositorio contiene un checkpoint de politica robotica para el benchmark LIBERO, derivado del modelo pi0.5. Lo publica el usuario Donghyun1228 y se corresponde con el paso final (9999) de un entrenamiento de 10.000 actualizaciones. El checkpoint esta pensado para adaptacion de punto de vista (viewpoint adaptation) en tareas de contacto denso, y se distribuye en formato Orbax para el ecosistema JAX.

La model card describe un entrenamiento con dos objetivos simultaneos: un objetivo IDM (modelo de dinamica inversa) con horizonte H=10 y promedio acumulativo, y una destilacion de conocimiento (KD) sobre representaciones de imagen base, imagen de muneca y prompt, con pesos relativos 1/1/0,25. Durante el proceso se adaptan el encoder de vision y el LLM base, mientras que el experto de acciones ("action expert") permanece congelado. El entrenamiento usa FSDP sobre 4 GPU con lote global 32 tanto en IDM como en KD y tasa de aprendizaje 1e-5.

Es relevante ahora porque documenta una receta concreta de ajuste fino sobre pi0.5 orientada a robustez frente a cambios de punto de vista en entornos simulados, un problema recurrente en politicas visomotoras. No obstante, el modelo no presenta descargas ni valoraciones en el momento de la consulta, no declara licencia y no aporta resultados de benchmarks, por lo que debe tratarse como un artefacto de investigacion sin validacion externa publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en pi0.5: encoder de vision mas LLM base mas experto de acciones. Segun la model card, el encoder de vision y el LLM base se adaptan y el experto de acciones permanece congelado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible para texto; la configuracion de entrenamiento usa un horizonte H=10 en el objetivo IDM |
| Tipos de cuantizacion | no disponible; solo se publican parametros Orbax sin variantes cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (JAX) para los parametros de politica, mas assets de normalizacion JSON (`assets/donghyun/libero/norm_stats.json`) |
| Tamano del repositorio | 11,5 GB |
| Estado del checkpoint | paso final 9999 de 10.000 actualizaciones |
| Entorno objetivo | LIBERO |
| Configuracion de politica | `pi05_libero_view_shared_decoder_idm_scale_matched_translation_sweep_cumulative_average_frozen_head_vlm_kd` |
| Dataset de entrenamiento | `Donghyun1228/libero-dense-contact-sweep-d2-20261002`, commit `9f8f600ce0e8f5df51c0e847c65a1e09f29d8494` |
| Volumen de datos | 346.229 fotogramas fisicos recogidos con MuJoCo 3.2.3, densidad 2, semilla 7, estado inicial 0 y yaw de frame de accion 0 |

## Arquitectura y entrenamiento

La politica sigue el diseno pi0.5: un encoder de vision que procesa observaciones, un LLM base que integra la instruccion en lenguaje natural y un experto de acciones que produce las acciones motoras. En este ajuste concreto, el encoder de vision y el LLM base se actualizan, mientras que el experto de acciones se mantiene congelado. El objetivo combina un IDM con horizonte H=10 y promedio acumulativo con una destilacion de representaciones sobre tres senales: imagen base, imagen de muneca y prompt, ponderadas con pesos 1/1/0,25. El lote global es 32 tanto para IDM como para KD, con FSDP sobre 4 GPU y tasa de aprendizaje 1e-5.

Los datos proceden de un barrido de puntos de vista en simulacion: 346.229 fotogramas fisicos generados en MuJoCo 3.2.3 con densidad 2, semilla 7, estado inicial 0 y yaw de frame de accion 0. Cada punto de vista desplazado se entrena de forma independiente partiendo del mismo checkpoint fuente preservado, lo que permite estudiar el efecto de la vista de forma aislada. La model card no detalla el numero total de tokens, la composicion completa del dataset ni el uso de RLHF o DPO; tampoco se documenta el estado del optimizador en el repositorio, que segun el autor se conserva en el checkpoint de entrenamiento local.

## Capacidades

- Generacion de acciones motoras para tareas de manipulacion en el entorno LIBERO, a partir de observaciones visuales y una instruccion textual.
- Procesamiento conjunto de imagen de camara base e imagen de camara de muneca como entradas de politica.
- Condicionamiento por prompt en lenguaje natural, con destilacion explicita de la representacion del prompt (peso 0,25 en el objetivo KD).
- Robustez entrenada frente a cambios de punto de vista, al haberse ajustado cada vista desplazada desde el mismo checkpoint fuente.
- Ejecucion en simulacion mediante el script de servicio del proyecto (`scripts/serve_policy.py`) con `--env LIBERO` y la configuracion de politica indicada.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, razonamiento multi-paso agentico, vision general, audio ni modo de pensamiento explicito.
- No hay evidencia de capacidades multilingues; no se documentan idiomas soportados.

## Casos de uso

- Evaluacion de robustez a cambios de camara en manipulacion: el checkpoint permite medir como se degrada o mantiene el exito en LIBERO cuando la vista se desplaza, al haber sido entrenado especificamente para esa condicion.
- Reproduccion de experimentos de destilacion de representaciones: los pesos 1/1/0,25 sobre imagen base, imagen de muneca y prompt permiten estudiar la contribucion relativa de cada senal en una politica VLA.
- Estudio del congelado del experto de acciones: al mantener el "action expert" fijo y adaptar solo vision y LLM, sirve para analizar cuanto rendimiento se recupera sin tocar la cabeza de acciones.
- Transferencia desde un checkpoint pi0.5 preentrenado: el autor indica que cada vista parte del mismo checkpoint fuente preservado, lo que facilita experimentos de ajuste controlado desde un modelo base comun.
- Investigacion sobre objetivo IDM con horizonte H=10: util para comparar formulaciones de modelo de dinamica inversa frente a objetivos de imitacion clasicos en tareas de contacto denso.
- Banco de pruebas de infraestructura JAX/FSDP: el repositorio documenta lote global 32, 4 GPU y lr 1e-5, y `training_configuration.json` recoge comandos y commit de codigo congelado, lo que lo hace util para replicar pipelines de entrenamiento distribuido.
- Punto de partida para curación de datos sinteticos: los 346.229 fotogramas generados con MuJoCo 3.2.3 y parametros concretos de densidad y semilla pueden reutilizarse para generar variantes del conjunto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la configuracion de entrenamiento (paso 9999, pesos de KD, lote, GPU y tasa de aprendizaje) pero no incluye tasas de exito ni metricas sobre LIBERO u otros entornos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 11,5 GB, por lo que en el peor caso (pesos en precision completa y sin cuantizar) se necesita un margen de VRAM superior a esa cifra; cualquier estimacion concreta seria una extrapolacion no verificada.
- Entrenamiento: la model card indica FSDP sobre 4 GPU con lote global 32, lo que situa el escenario de referencia en GPUs de clase centro de datos (A100 o H100 de 80 GB), aunque no se especifica el modelo exacto utilizado.
- GPU de consumo: no hay confirmacion de que quepa en una RTX 4090 u otras GPU de consumo; la ausencia de variantes cuantizadas y de datos de memoria publicados impide afirmarlo.
- Opciones de despliegue: el autor indica servir el modelo con `scripts/serve_policy.py` del proyecto, usando `--env LIBERO policy:checkpoint --policy.config pi05_libero_view_shared_decoder_idm_scale_matched_translation_sweep_cumulative_average_frozen_head_vlm_kd --policy.dir /ruta/al/modelo`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y al no existir pesos GGUF ni safetensors no son aplicables directamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se ha proporcionado informacion comparativa sobre modelos alternativos. Como referencias de la misma categoria podrian considerarse el modelo base pi0.5 y su predecesor pi0, asi como otras politicas visomotoras para manipulacion (por ejemplo OpenVLA u Octo), pero los datos de parametros, contexto, rendimiento y licencia de esas alternativas no estan disponibles en la informacion proporcionada.

| Modelo | Parametros | Contexto o ventana | Entorno objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi0.5 LIBERO dense contact) | no disponible | H=10 en el objetivo IDM | LIBERO | no disponible | Orbax en HuggingFace, 11,5 GB |
| pi0.5 base | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| pi0 | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| OpenVLA | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Octo | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso de uso comercial ni condiciones de redistribucion.
- Sin validacion externa: el repositorio presenta 0 descargas y 0 valoraciones en el momento de la consulta, y no se han publicado resultados de benchmarks.
- Alcance limitado a simulacion: los datos se generaron en MuJoCo 3.2.3 para el benchmark LIBERO; no hay evidencia de evaluacion en robot real ni de transferencia sim-to-real.
- Entrenamiento parcial: solo se adaptan el encoder de vision y el LLM base; el experto de acciones permanece congelado, lo que restringe el margen de mejora sobre la generacion de acciones.
- Dependencia de infraestructura especifica: el checkpoint esta en formato Orbax para JAX y requiere el script de servicio del proyecto con la configuracion de politica exacta, lo que complica su uso fuera de ese ecosistema.
- Estado del optimizador no incluido: el autor indica que el estado completo del optimizador se conserva en el checkpoint de entrenamiento local, de modo que reanudar el entrenamiento desde este repositorio puede no ser posible tal cual.
- Riesgo de sobreajuste al barrido de vistas: al entrenar cada punto de vista por separado desde el mismo checkpoint fuente, el comportamiento puede no generalizar a configuraciones de camara no cubiertas por el barrido.
- Ausencia de informacion sobre sesgos, seguridad y comportamiento fuera de distribucion: la model card no documenta analisis de sesgos ni limites de actuacion.
- Idiomas no documentados: no se especifica en que idioma o idiomas deben formularse las instrucciones textuales que recibe la politica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-dense-contact-d2-wrist-kd-medium-20261002
- Dataset de entrenamiento: https://huggingface.co/datasets/Donghyun1228/libero-dense-contact-sweep-d2-20261002
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados devueltos correspondian a entradas de diccionario sin relacion con el modelo.

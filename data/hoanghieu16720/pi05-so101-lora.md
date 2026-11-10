# hoanghieu16720/pi05-so101-lora

## Resumen

pi05-so101-lora es un checkpoint de ajuste fino mediante LoRA del modelo base pi0.5 (policy de robotica generalista desarrollada por Physical Intelligence) sobre el brazo robotico de bajo coste SO-ARM 101. El autor del repositorio, hoanghieu16720, lo publica como un "full orbax checkpoint" resultante de un entrenamiento de 20.000 pasos sobre el dataset LeRobot `so101/pick_cube`, una tarea concreta de recogida de un cubo rojo y deposito en un bol. El modelo no es un LLM de proposito general, sino una policy visio-lenguaje-accion (VLA) orientada a control robotico.

La relevancia de esta publicacion es acotada: se trata de un artefacto de investigacion reproducible que demuestra como adaptar el modelo pi0.5 (que internamente combina un backbone de vision-lenguaje con un experto de accion) a un hardware de bajo coste mediante parametros LoRA sobre las capas de Gemma. El repositorio ocupa 9,5 GB, lo que corresponde al checkpoint completo en formato Orbax (parametros, estado del entrenador y assets), no a pesos consolidados en safetensors.

No hay informacion publica sobre licencia, idiomas, benchmarks ni pipeline en la model card; el contenido disponible se limita a la configuracion de entrenamiento y a la descripcion del dataset. Cualquier uso en produccion requeriria verificar primero la licencia del modelo base pi0.5 y del dataset LeRobot asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA pi0.5 (backbone vision-lenguaje Gemma + experto de accion), ajuste LoRA |
| Parametros totales | no disponible (repo de 9,5 GB, incluye checkpoint completo Orbax) |
| Parametros activos | no disponible (no se especifica si el base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts en ingles en el dataset) |
| Licencia | no disponible |
| Formato de pesos | Orbax checkpoint (carpetas `so101_20k/<step>/` con params + train_state + assets) |

## Arquitectura y entrenamiento

El modelo parte de pi0.5, una policy visio-lenguaje-accion que en esta configuracion (`pi05_so101_lora`) incorpora adaptadores LoRA sobre `gemma_2b_lora` y `gemma_300m_lora`. La accion se parametriza con `action_horizon` de 15 pasos, entrada de estado discreta, `DeltaActions` sobre 5 articulaciones y gripper en valor absoluto. Se aplica normalizacion por cuantiles con estadisticas guardadas en `assets/so101/pick_cube/norm_stats.json`. El commit de openpi de referencia es `215abfb`, con parches propios en `code/patch_so101.py` y `code/so101_policy.py`.

Los datos de entrenamiento son el dataset LeRobot `so101/pick_cube`: 270 episodios, 92.537 frames a 30 Hz, con dos camaras (frontal y de muneca) a 320x240. El entrenamiento usa batch size 16, optimizador AdamW con recorte de gradiente 1.0, scheduler coseno con learning rate de 2,5e-5 a 2,5e-6 durante 20.000 pasos. El prompt de condicionamiento es fijo: "pick up the red cube and put it in the bowl". No se documenta uso de RLHF, DPO ni etapas de post-entrenamiento adicionales.

## Capacidades

- Control visio-motor de un brazo SO-ARM 101 para la tarea de recoger un cubo rojo y depositarlo en un bol.
- Percepcion multimodal a partir de dos camaras (frontal y de muneca) a 320x240 y 30 Hz.
- Generacion de secuencias de accion con horizonte de 15 pasos, con deltas en 5 articulaciones y control absoluto del gripper.
- Condicionamiento por instruccion en lenguaje natural (prompt fijo en el dataset de entrenamiento).
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbolico, matematicas, generacion de codigo ni vision generalista fuera del dominio robotico.
- Capacidades multilingues: no disponible; el unico prompt documentado esta en ingles.

## Casos de uso

- Reproduccion de experimentos de imitation learning: el checkpoint permite reentrenar o evaluar la policy sobre el dataset `so101/pick_cube` sin partir del modelo base, util para comparar variantes de LoRA o de normalizacion.
- Prototipado de robotica de bajo coste: SO-ARM 101 es un brazo economico y este checkpoint demuestra que pi0.5 puede adaptarse a hardware asequible con 270 episodios, lo que facilita laboratorios con presupuesto limitado.
- Base para fine-tuning en tareas de pick-and-place: el pipeline (DeltaActions, gripper absoluto, normalizacion por cuantiles) sirve como plantilla para nuevas tareas con el mismo brazo.
- Docencia e investigacion en VLA: permite a estudiantes inspeccionar un checkpoint Orbax real de pi0.5 con LoRA y entender la estructura de `train_state` y assets.
- Evaluacion de sim-a-real y robustez de policies: al estar entrenado con dos camaras y 30 Hz, es un punto de partida para medir degradacion ante cambios de iluminacion o posicion de objetos.
- Integracion en pipelines de openpi: los parches `patch_so101.py` y `so101_policy.py` permiten cargar el modelo dentro del ecosistema openpi para servir inferencia en bucle cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo de 9,5 GB incluye checkpoint completo Orbax (parametros + estado del entrenador), por lo que el peso en memoria supera al de los pesos de inferencia puros.
- GPU recomendadas: no disponible en la model card; por el tamano del backbone Gemma 2B y el experto de accion, se requiere una GPU con al menos 16-24 GB para cargar el checkpoint sin cuantizar, aunque este dato no esta confirmado por el autor.
- Cabe en GPU de consumo: no disponible; no se documenta compatibilidad con RTX 4090 ni con GPUs de gama media.
- Opciones de despliegue: el checkpoint esta en formato Orbax y depende de openpi (commit `215abfb`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a policies VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-so101-lora | no disponible | no disponible | Pick-and-place SO-ARM 101 | no disponible | Hugging Face (repo 9,5 GB) |
| pi0.5 base (Physical Intelligence) | no disponible | no disponible | VLA generalista | no disponible en esta ficha | Referenciado via openpi |
| Otras policies LeRobot para SO-ARM 101 | no disponible | no disponible | Pick-and-place | no disponible | Ecosistema LeRobot |

No se dispone de datos suficientes para comparar rendimiento, contexto o parametros con alternativas concretas.

## Limitaciones y advertencias

- El modelo esta entrenado para una unica tarea ("pick up the red cube and put it in the bowl") y un unico prompt; no generaliza a otras instrucciones sin reentrenamiento.
- No hay informacion sobre sesgos, alucinacion ni comportamiento fuera de distribucion; en robotica, el riesgo se traduce en acciones fisicas incorrectas.
- La licencia no esta declarada en la model card, lo que impide confirmar si el uso comercial es posible; ademas, la licencia del modelo base pi0.5 y del dataset LeRobot debe verificarse por separado.
- El checkpoint esta en formato Orbax y depende de una version concreta de openpi (commit `215abfb`), lo que puede romper la reproducibilidad si el repositorio upstream cambia.
- El repositorio incluye `train_state` y assets, no solo pesos de inferencia; el consumo de disco y memoria es mayor que el de un checkpoint limpio.
- No se documentan idiomas soportados; el condicionamiento en lenguaje natural esta limitado al ingles del dataset.
- No hay benchmarks, curvas de exito ni evaluaciones en robot real publicadas, por lo que el rendimiento real de la policy es desconocido.
- El modelo se publica con 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hoanghieu16720/pi05-so101-lora
- openpi (repositorio base, commit `215abfb`): https://github.com/Physical-Intelligence/openpi
- Dataset LeRobot `so101/pick_cube`: no disponible en la informacion proporcionada
- Model card de pi0.5: no disponible en la informacion proporcionada

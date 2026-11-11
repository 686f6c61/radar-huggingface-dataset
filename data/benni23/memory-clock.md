# benni23/memory-clock

## Resumen

Memory-clock es una coleccion de checkpoints de politicas vision-language-action (VLA) publicadas como material reproducible del articulo *Is Your Robot's Memory Just a Clock? Temporal Shortcuts in Memory-Augmented VLA Policies* (arXiv:2611.14488), firmado por Chubin Zhang y Bo An. El repositorio, alojado por el usuario benni23 en Hugging Face, no introduce un modelo nuevo desde cero: parte del checkpoint base pi0.5 y aplica la receta MME-VLA liberada por el proyecto RoboMME, incorporando un modulo de memoria denominado FrameSamp-Modul.

El objetivo del trabajo es diagnosticar un fallo concreto en politicas VLA con memoria aumentada: el uso de atajos temporales. La hipotesis que se investiga es si la memoria del robot aprende realmente a recordar eventos pasados relevantes o si, por el contrario, se limita a explotar marcas de tiempo como una especie de reloj interno. Para ello se entrenan variantes con y sin codificacion temporal, con reentrenamiento de control y con aumento de datos basado en pausas, y se evaluan sobre el benchmark RoboMME.

El repositorio ocupa 59,4 GB e incluye cinco carpetas de checkpoints (`clock/`, `noclock/`, `clock-retrain/`, `pauseaug/`, `pauseaug-weak/`), cada una con pesos en formato openpi/orbax bajo el paso 29999. Es relevante ahora porque ofrece artefactos reproducibles para estudiar sesgos temporales en modelos de robotica basados en PaliGemma, un area donde la mayoria de publicaciones no liberan los pesos intermedios de sus ablaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action derivada de pi0.5 (base PaliGemma) con modulo de memoria FrameSamp-Modul |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato openpi/orbax) |
| Idiomas soportados | no disponible |
| Licencia | other (Gemma Terms of Use) |
| Formato de pesos | openpi / orbax (`29999/params`, `29999/assets`) |

## Arquitectura y entrenamiento

La arquitectura parte del checkpoint base pi0.5, un modelo VLA construido sobre PaliGemma que combina un codificador visual, un modelo de lenguaje y una cabeza de accion para control robotico. Sobre esa base, la receta MME-VLA de RoboMME anade un modulo de memoria (FrameSamp-Modul) que permite a la politica retener informacion de fotogramas anteriores. El repositorio contiene variantes que activan o desactivan la codificacion de marcas de tiempo (`use_pos_emb`), lo que permite aislar el efecto del reloj interno frente a la memoria real de eventos.

El entrenamiento se realizo durante 30.000 pasos con un batch global de 64, partiendo siempre del mismo checkpoint pi0.5. La variante `clock-retrain/` es un reentrenamiento independiente de Clock que sirve como control frente al aumento de pausas; `pauseaug/` y `pauseaug-weak/` aplican aumentos de datos basados en pausas con distinta intensidad. La evaluacion se lleva a cabo sobre RoboMME, con tareas como `PickXtimes` y modos de evento como `pause`. No se detalla en la informacion disponible la composicion exacta del dataset de entrenamiento ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Control robotico visuomotor: genera acciones a partir de observaciones visuales e instrucciones, siguiendo el paradigma VLA de pi0.5.
- Memoria temporal: el modulo FrameSamp-Modul permite condicionar la politica en fotogramas previos, con y sin codificacion de marcas de tiempo segun la variante.
- Ejecucion de tareas con eventos de pausa: las variantes `pauseaug` estan entrenadas para manejar eventos de pausa durante la ejecucion.
- Evaluacion reproducible: los checkpoints estan preparados para lanzarse con `run_eval.sh` sobre tareas de RoboMME.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso en texto: no disponible como capacidad declarada; el foco es la politica robotica.

## Casos de uso

- Investigacion sobre atajos temporales en VLA: comparar `clock/` frente a `noclock/` permite medir cuanto depende la politica de las marcas de tiempo en lugar de la memoria de eventos, usando la tarea `PickXtimes` de RoboMME.
- Reproduccion de resultados del articulo: los checkpoints cubren las figuras 6, 8a y 8b, de modo que un equipo puede replicar las curvas del paper con `run_eval.sh`.
- Ablacion de aumento de datos por pausas: `pauseaug/` y `pauseaug-weak/` permiten estudiar el efecto de la aumentacion sobre la robustez ante eventos de pausa sin reentrenar desde cero.
- Control experimental con reentrenamiento: `clock-retrain/` sirve como linea base independiente para descartar que las diferencias observadas se deban a la semilla o al proceso de entrenamiento.
- Desarrollo de politicas de memoria en robotica: el modulo FrameSamp-Modul y la receta MME-VLA pueden reutilizarse como punto de partida para nuevas variantes sobre pi0.5.
- Docencia y formacion en robotica con IA: el conjunto de checkpoints y el codigo de evaluacion permiten montar practicas sobre evaluacion de politicas VLA en entornos simulados de RoboMME.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las figuras 6 y 8 del articulo arXiv:2611.14488 para los resultados numericos, pero no incluye tablas de metricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el tamano del repositorio (59,4 GB) incluye cinco variantes de checkpoints, no un unico modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el formato openpi/orbax y el origen en pi0.5/PaliGemma sugieren requisitos propios de esa familia, pero no se confirma en la informacion disponible.
- Opciones de despliegue: el flujo oficial usa el repositorio `memory-clock` con `install.sh`, `download.sh` y `run_eval.sh`, sobre el ecosistema openpi. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria temporal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| memory-clock (este) | no disponible | no disponible | FrameSamp-Modul, variantes con/sin reloj | Gemma Terms of Use | Hugging Face (benni23/memory-clock) |
| pi0.5 (base) | no disponible | no disponible | Sin modulo de memoria especifico en la informacion disponible | no disponible | checkpoint base referenciado, no enlazado |
| RoboMME MME-VLA (receta) | no disponible | no disponible | FrameSamp-Modul | no disponible | github.com/RoboMME/robomme_policy_learning |

La comparacion con alternativas de la misma categoria (otros VLA con memoria para robotica) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Los checkpoints son artefactos de investigacion para un articulo concreto; no se presentan como modelos listos para produccion.
- El objetivo del trabajo es precisamente evidenciar un sesgo: las variantes `clock/` pueden estar explotando atajos temporales, por lo que su uso directo en robotica real es arriesgado sin un analisis previo.
- La licencia es `other` con nombre `gemma`: los pesos derivan de pi0.5/PaliGemma y estan sujetos a los Gemma Terms of Use, con las restricciones de uso comercial que ello implica.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- El repositorio no incluye datos de benchmarks en la model card; las metricas deben consultarse en el articulo.
- El formato openpi/orbax limita el despliegue a herramientas compatibles con ese ecosistema; no hay pesos GGUF ni cuantizaciones publicadas.
- El modelo esta orientado a tareas de RoboMME; su generalizacion a otros entornos roboticos no esta documentada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/benni23/memory-clock
- Articulo: https://arxiv.org/abs/2611.14488
- Codigo: https://github.com/bennidict23/memory-clock
- Receta RoboMME: https://github.com/RoboMME/robomme_policy_learning
- Licencia Gemma: https://ai.google.dev/gemma/terms

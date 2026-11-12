# leapshared/sciedu_bench_props8_pi05_q_10k

## Resumen

`sciedu_bench_props8_pi05_q_10k` es una politica de robotica entrenada mediante aprendizaje por imitacion sobre la arquitectura π₀.₅ (Pi05) de Physical Intelligence, adaptada a la libreria LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo Vision-Language-Action (VLA) que consume observaciones multimodales (estado articular de 16 dimensiones y tres flujos de imagen RGB de 480x640) y emite directamente un vector de accion de 16 dimensiones para controlar un brazo robotico simulado de tipo `openarm_sciedu_sim`.

El modelo ha sido ajustado por el usuario `leapshared` sobre el dataset `sciedu_bench_v2_sim_props8_all`, compuesto por 2.365 episodios y 1.438.051 fotogramas a 30 FPS, que recogen tareas de laboratorio de fisica y geologia simuladas (manipulacion de varillas de carga, electroscopios, placas de raya, minerales y cuentagotas). El checkpoint corresponde a 10.000 pasos de entrenamiento con batch de 32 y tasa de aprendizaje 2,5e-05.

Su relevancia es acotada y de nicho: se trata de un artefacto de investigacion reproducible para el benchmark SciEdu, no de un modelo de proposito general. Cuenta con 4.143.404.816 parametros en formato safetensors (16,6 GB de repositorio) y cero descargas en el momento de la consulta, lo que indica que es un experimento interno recien publicado mas que una herramienta consolidada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05), implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las tareas del dataset estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `openarm_sciedu_sim` |
| Camaras | `follower_d455f`, `left_wrist`, `right_wrist` (3 x 480x640, 30 FPS) |
| Entrada de estado | `observation.state` de forma `(16,)` |
| Salida de accion | `action` de forma `(16,)` |
| Version de LeRobot | 0.7.0 |
| Pasos de entrenamiento | 10.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 2,5e-05 |
| Semilla | 1000 |
| Tamano del repositorio | 16,6 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence, un VLA disenado para generalizacion en entornos abiertos que evoluciona π₀ para transferir a situaciones y entornos no vistos durante el entrenamiento. La implementacion concreta procede del repositorio OpenPI de Physical Intelligence y ha sido portada a LeRobot, que expone el tipo de politica `pi05` dentro de su CLI de entrenamiento (`lerobot-train`). La entrada combina un vector de estado propioceptivo de 16 dimensiones con tres imagenes simultaneas (camara frontal `follower_d455f` y dos camaras de muneca), y la salida es un vector de accion continuo de 16 dimensiones, tipico de un controlador de brazo de dos brazos o de un brazo con pinza y articulaciones redundantes.

El ajuste se realizo por aprendizaje por imitacion supervisado sobre el dataset simulado `leapshared/sciedu_bench_v2_sim_props8_all`: 2.365 episodios, 1.438.051 fotogramas a 30 FPS, con 30 tareas de laboratorio distintas (cargar una varilla, frotarla con piel, acercarla al electroscopio, manipular minerales, usar un cuentagotas, etc.). La configuracion reportada es de 10.000 pasos, batch 32, AdamW con learning rate 2,5e-05 y semilla 1000. No se documentan en la informacion disponible detalles sobre el backbone de vision-lenguaje, el numero de tokens de contexto, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Control robotico visuomotor: genera acciones continuas de 16 dimensiones a partir de estado articular y tres vistas de camara.
- Ejecucion de tareas de manipulacion de laboratorio: las 30 tareas del dataset incluyen coger y depositar objetos, frotar, verter, apuntar y sostener posiciones.
- Generalizacion a entornos no vistos: la familia π₀.₅ esta disenada explicitamente para transferir a situaciones nuevas, aunque no se aportan metricas de generalizacion para este checkpoint concreto.
- Percepcion multimodal con multiples camaras: procesa simultaneamente vista frontal y dos vistas de muneca, lo que permite razonamiento espacial sobre la escena.
- Seguimiento de instrucciones en lenguaje natural: el campo `--task` del CLI acepta la descripcion de la tarea (en ingles) que condiciona la politica.
- Integracion con el ecosistema LeRobot: entrenamiento, rollout y visualizacion de dataset mediante las herramientas estandar (`lerobot-train`, `lerobot-rollout`).
- No se documentan capacidades de tool calling, agentes multi-paso, thinking mode, vision general, audio ni generacion de texto libre; el modelo no es un LLM de proposito general.

## Casos de uso

- Investigacion en aprendizaje por imitacion: servir como checkpoint de referencia reproducible para comparar variantes de π₀.₅ sobre el mismo dataset SciEdu, con configuracion de entrenamiento documentada (10.000 pasos, batch 32, lr 2,5e-05).
- Benchmark de manipulacion cientifica simulada: evaluar politicas en tareas de fisica (electroscopio, varilla cargada) y geologia (placas de raya, minerales, acidos) dentro del simulador `openarm_sciedu_sim`.
- Desarrollo de pipelines de robotica con LeRobot: usar el modelo como punto de partida para ajuste fino con `lerobot-train --policy.type=pi05` sobre nuevos datasets propios.
- Validacion de infraestructura de rollout: probar el comando `lerobot-rollout` con `--strategy.type=base` para verificar calibracion de camaras, puertos y frecuencia de control a 30 FPS antes de desplegar politicas mas costosas.
- Docencia y divulgacion en robotica: demostrar el ciclo completo de grabacion de datos, entrenamiento VLA y ejecucion en un brazo simulado con tres camaras.
- Generacion de datos sinteticos de manipulacion: emplear las trayectorias del dataset asociado (1,4 millones de fotogramas) para preentrenar o aumentar otros modelos de robotica.
- Comparacion de estrategias de cuantizacion y despliegue: el checkpoint de 4,14 mil millones de parametros permite medir latencia y throughput en GPU de consumo frente a GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia (comentario `<!-- Report real-robot results here ... -->`), por lo que no hay tasas de exito, metricas de sim-to-real ni comparaciones numericas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, 4,14 mil millones de parametros en fp32 ocupan aproximadamente 16,6 GB (coincide con el tamano del repositorio); en bf16/fp16 el peso seria de unos 8,3 GB, y en cuantizacion de 8 bits unos 4,1 GB, sin contar activaciones ni los tres flujos de vision de 480x640.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU de datacenter (A100, H100, L40S) es la opcion conservadora; una RTX 4090 de 24 GB deberia alojar el modelo en bf16 con margen para activaciones.
- Cabe en GPU de consumo: probablemente si en RTX 4090 (24 GB) y modelos con 16 GB o mas en bf16; en GPUs de 8-12 GB requeriria cuantizacion, no documentada por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`) sobre el robot `openarm_sciedu_sim`; el resto de stacks (vLLM, llama.cpp, Ollama, TGI) no estan soportados porque no es un LLM.
- Latencia y throughput: no disponibles. El control opera a 30 FPS en el dataset de entrenamiento, pero no se reportan tiempos de inferencia reales.
- Almacenamiento: 16,6 GB de repositorio en safetensors.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `leapshared/sciedu_bench_props8_pi05_q_10k` | 4,14 B | VLA π₀.₅ ajustado a SciEdu | no disponible | no disponible | Hugging Face (LeRobot) |
| π₀.₅ (Pi05) original de Physical Intelligence | no disponible | VLA generalista | no disponible | no disponible en la informacion | OpenPI (codigo abierto) y blog de Physical Intelligence |
| π₀ (Pi0) original | no disponible | VLA predecesor | no disponible | no disponible en la informacion | OpenPI |
| Otras politicas LeRobot del mismo dataset | no disponible | VLA / imitation learning | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; la comparativa se limita a categoria, linaje y disponibilidad.

## Limitaciones y advertencias

- Especifico de simulacion: entrenado sobre `openarm_sciedu_sim`; no hay evidencia de transferencia a un robot fisico ni de sim-to-real.
- Dependencia estricta de la configuracion de sensores: exige tres camaras con los nombres exactos (`follower_d455f`, `left_wrist`, `right_wrist`), resolucion 480x640 y 30 FPS; cualquier desviacion invalida la politica.
- Vocabulario de tareas cerrado: solo cubre las 30 tareas del dataset SciEdu, en ingles; fuera de ese repertorio el comportamiento no esta caracterizado.
- Licencia no declarada: la model card marca la licencia como "More Information Needed"; no se puede asumir uso comercial.
- Ausencia total de evaluacion: no hay tasas de exito, matrices de confusion ni resultados de rollout publicados; el checkpoint es un artefacto de entrenamiento sin validacion reportada.
- Riesgo de sobreajuste al dataset: 10.000 pasos sobre 2.365 episodios sin datos de validacion publicados; no se puede descartar memorizacion de trayectorias.
- Sin datos de sesgo, alucinacion o robustez: al no ser un modelo de lenguaje, los riesgos tipicos de sesgo textual no aplican, pero tampoco se documenta el comportamiento ante oclusiones, cambios de iluminacion o fallos de percepcion.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni reportes de terceros.
- Sin soporte de cuantizacion documentado: el despliegue en GPUs de gama baja no esta validado por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leapshared/sciedu_bench_props8_pi05_q_10k
- Dataset de entrenamiento: https://huggingface.co/datasets/leapshared/sciedu_bench_v2_sim_props8_all
- Visualizacion del dataset en LeRobot Spaces: https://huggingface.co/spaces/lerobot/visualize_dataset?path=leapshared/sciedu_bench_v2_sim_props8_all
- Blog de π₀.₅ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

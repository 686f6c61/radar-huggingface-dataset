# Riasok/few-shot-run-2

## Resumen

`Riasok/few-shot-run-2` es un checkpoint de ajuste supervisado (SFT) del modelo de robotica MolmoAct2 de AllenAI, desarrollado por el usuario Riasok y publicado en HuggingFace. Se trata de una politica visomotora (vision-language-action, VLA) entrenada para ejecutar tareas de manipulacion en el entorno de simulacion LIBERO, no de un modelo de lenguaje conversacional. El modelo parte de los pesos de `allenai/MolmoAct2` y anade un experto de accion entrenado junto con un adaptador LoRA sobre el codificador vision-lenguaje.

El interes del checkpoint es metodologico: demuestra que es posible obtener un rendimiento competitivo en LIBERO con solo 10 demostraciones por tarea (400 demostraciones en total, 66.788 fotogramas) frente al entrenamiento con el conjunto de datos completo que emplea la referencia oficial `allenai/MolmoAct2-LIBERO`. El autor reporta una tasa de exito del 80,4% (402/500) en la suite LIBERO Spatial.

El modelo tiene 5.601.988.144 parametros (aproximadamente 5,6 mil millones) y se distribuye en formato safetensors dentro de un repositorio de 12,7 GB, empaquetado para la libreria LeRobot. Es relevante ahora porque el ajuste fino eficiente de politicas VLA con pocos datos es una linea activa de investigacion en robotica de proposito general, y este checkpoint sirve como punto de partida documentado para experimentos posteriores de refinamiento con RL (PPO).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en MolmoAct2: codificador VLM con adaptador LoRA y experto de accion separado, integrada en LeRobot como `MolmoAct2Policy` |
| Parametros totales | 5.601.988.144 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor reporta entrenamiento e inferencia en BF16/FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos LeRobot, pre/postprocesadores y tensores de normalizacion) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `allenai/MolmoAct2`, una politica visomotora que combina un modelo vision-lenguaje con un experto de accion que genera trayectorias de acciones continuas. En este checkpoint concreto, el autor congela el VLM y le aplica un adaptador LoRA con rango 64 y alpha 16, mientras entrena el experto de accion de forma completa. La inferencia utiliza 10 pasos de flujo (flow steps) para producir acciones continuas, con observaciones RGB de 256 px de las camaras de agente y muneca.

El entrenamiento se realizo en BF16, con batch global de 16 (4 por GPU), sobre 40 tareas de LIBERO con 10 demostraciones por tarea: 400 demostraciones y 66.788 fotogramas en total, cubriendo las cuatro suites de LIBERO. El checkpoint publicado corresponde al paso 5000. La evaluacion reportada se hizo con semillas a partir de 1000, estados iniciales ordenados, 50 pasos de asentamiento, horizonte 280 y precision FP32. El autor indica que este checkpoint es el punto de partida de un experimento posterior de PPO sobre la suite Spatial (150 actualizaciones), y que es un modelo distinto de `Riasok/few-shot-run-1` y de `Riasok/PPO-run1`.

## Capacidades

- Control visomotor para manipulacion robotica: genera acciones continuas a partir de observaciones RGB de camara de agente y de muneca.
- Ejecucion de tareas de LIBERO en las cuatro suites (Spatial, Object, Goal y Long), aunque solo se reporta metrica de evaluacion para Spatial.
- Aprendizaje con pocos datos: politica entrenada con 10 demostraciones por tarea en lugar del conjunto completo.
- Integracion con LeRobot: incluye pesos de politica, pre/postprocesadores y tensores de normalizacion listos para `MolmoAct2Policy.from_pretrained`.
- Punto de partida para ajuste fino adicional con RL (PPO), segun documenta el autor.
- No se documentan capacidades de generacion de texto, razonamiento simbolico, codigo, matematicas, tool calling, agentes multi-paso ni vision generalista en la informacion disponible.

## Casos de uso

- Investigacion en aprendizaje por imitacion con pocos datos: sirve como referencia reproducible para medir cuanto rendimiento se obtiene en LIBERO con 10 demostraciones por tarea frente al entrenamiento con datos completos.
- Punto de partida para refinamiento con RL: el autor lo emplea como inicializacion de un experimento PPO sobre LIBERO Spatial, de modo que otros equipos pueden reutilizarlo para explorar tecnicas de RL sobre politicas VLA.
- Evaluacion comparativa de politicas VLA: al estar empaquetado para LeRobot con procesadores y normalizacion incluidos, permite lanzar evaluaciones estandarizadas en LIBERO sin reentrenar el pipeline de preprocesado.
- Reproduccion de experimentos de ajuste fino eficiente: la combinacion de LoRA en el VLM y entrenamiento completo del experto de accion puede replicarse en otros entornos de manipulacion con presupuesto de datos limitado.
- Estudio de estabilidad de politicas visomotoras: el protocolo de evaluacion documentado (semillas, pasos de asentamiento, horizonte 280) facilita analisis de varianza entre ejecuciones.
- Base para experimentos de destilacion o compresion: con 5,6 mil millones de parametros y pesos en safetensors, es un candidato para estudiar cuantizacion y despliegue eficiente de politicas VLA en hardware de robot real.
- Docencia y formacion en robotica de aprendizaje: sirve como ejemplo completo de un pipeline SFT con LeRobot, desde la descarga del checkpoint hasta la evaluacion en simulacion.

## Benchmarks y rendimiento

| Benchmark | Resultado | Configuracion |
|---|---|---|
| LIBERO Spatial (500 episodios) | 402/500 (80,4%) | Semillas 1000+, estados iniciales ordenados, 50 pasos de asentamiento, horizonte 280, acciones continuas con 10 flow steps, observaciones RGB 256 px, inferencia FP32 |

No se han publicado en la informacion disponible resultados de las suites LIBERO Object, Goal o Long, ni comparaciones numericas directas con `allenai/MolmoAct2-LIBERO` u otras politicas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 5,6 mil millones de parametros, en BF16 los pesos ocupan aproximadamente 11,2 GB, a los que hay que sumar activaciones, buffers de imagen y el estado del experto de accion; en FP32 el peso de los parametros asciende a unos 22,4 GB.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el entrenamiento con batch de 4 por GPU sugiere GPUs de clase A100 o H100; la evaluacion en FP32 requiere holgura de memoria superior a la de una GPU de consumo de gama media.
- Cabe en GPU de consumo: no confirmado. Una RTX 4090 (24 GB) podria alojar los pesos en BF16, pero la inferencia FP32 empleada en la evaluacion y el procesamiento de observaciones a 256 px hacen necesario verificar el consumo real.
- Opciones de despliegue: LeRobot con la implementacion de MolmoAct2 habilitada para entrenamiento; carga mediante `huggingface_hub.snapshot_download` y `MolmoAct2Policy.from_pretrained`. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una politica visomotora de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Riasok/few-shot-run-2` | 5.601.988.144 | no disponible | Spatial 80,4% (402/500) | no disponible | HuggingFace, formato LeRobot |
| `allenai/MolmoAct2-LIBERO` | no disponible | no disponible | no disponible en la informacion proporcionada (referencia oficial entrenada con datos completos) | no disponible | HuggingFace |
| `Riasok/few-shot-run-1` | no disponible | no disponible | no disponible | no disponible | HuggingFace (una demostracion por tarea) |
| `Riasok/PPO-run1` | no disponible | no disponible | no disponible | no disponible | HuggingFace (PPO sobre el modelo anterior) |

No se dispone de datos suficientes para comparar con otras familias de politicas VLA (por ejemplo, OpenVLA u Octo) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion acotado a LIBERO: no es un modelo de lenguaje general ni un asistente conversacional; su unica funcion documentada es generar acciones en tareas de manipulacion de ese entorno.
- Evaluacion parcial: solo se reporta la suite Spatial; no hay metricas de Object, Goal ni Long, por lo que el rendimiento global en LIBERO es desconocido.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base `allenai/MolmoAct2` antes de cualquier despliegue productivo.
- Riesgo de sobreajuste al simulador: al entrenarse con 400 demostraciones en LIBERO, es probable que la politica no transfiera directamente a un robot real sin ajuste adicional; no se documentan experimentos de sim-to-real.
- Dependencia estricta del codigo: requiere la implementacion de LeRobot con soporte de entrenamiento para MolmoAct2; no funciona con runtimes de inferencia genericos.
- Riesgo de alucinacion en el sentido de acciones plausibles pero incorrectas: como toda politica visomotora, puede producir trayectorias que parecen validas pero fallan en la tarea; no hay analisis de modos de fallo en la model card.
- Sesgos: no documentados. Al entrenarse exclusivamente con demostraciones de LIBERO, hereda las limitaciones de objetos, texturas e iluminacion de ese simulador.
- Idiomas: no aplica ni se documenta soporte multilingue.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validacion externa de los resultados reportados por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Riasok/few-shot-run-2
- Modelo base: https://huggingface.co/allenai/MolmoAct2
- Referencia oficial entrenada con datos completos de LIBERO: https://huggingface.co/allenai/MolmoAct2-LIBERO
- Checkpoint previo con una demostracion por tarea: https://huggingface.co/Riasok/few-shot-run-1
- Checkpoint de PPO del autor: https://huggingface.co/Riasok/PPO-run1

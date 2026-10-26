# Kwj1021/act_so101_pick_place_new45plusdata_actionstep25

## Resumen

`Kwj1021/act_so101_pick_place_new45plusdata_actionstep25` es una política de imitación entrenada con el método ACT (Action Chunking with Transformers, arXiv:2304.13705) para el brazo robótico de bajo coste SO-101 en su variante `so_follower`. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular (6 dimensiones) y dos cámaras RGB de 480×640 (muñeca y vista superior) y devuelve una acción de 6 dimensiones. El modelo lo publica el usuario Kwj1021 en el Hub de Hugging Face mediante LeRobot 0.6.2, sin paper propio ni documentación adicional más allá de la model card autogenerada.

La tarea aprendida es concreta y única: "pick up the object and place it in the target area" (coger un objeto y depositarlo en la zona objetivo). El entrenamiento se hizo sobre un dataset propio de 95 episodios y 80.836 fotogramas grabados a 30 FPS (aproximadamente 45 minutos de demostraciones teleoperadas), con 45.000 pasos de optimización, batch de 8 y tasa de aprendizaje de 1e-5.

Su relevancia es la habitual en el ecosistema LeRobot: demuestra lo accesible que resulta hoy entrenar una política visomotora de ~51,6 M de parámetros en un repo de 0,2 GB que cabe en cualquier GPU de consumo e incluso puede ejecutarse en CPU a baja frecuencia. Como contrapartida, carece de licencia declarada, de resultados de evaluación y de cualquier garantía de generalización fuera del setup exacto de captura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder de observaciones (estado + 2 imágenes) y decodificador de chunks de acción, con componente CVAE en el entrenamiento |
| Parametros totales | 51.617.414 (~51,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica en el sentido de LLM. La observacion es un frame (estado de 6 dims + 2 imagenes de 3×480×640) y la salida es un chunk de acciones de 6 dims |
| Tipos de cuantizacion | no disponible; pesos en safetensors, fp32 por defecto en LeRobot. No hay GGUF ni cuantizaciones publicadas |
| Idiomas soportados | no disponible; no aplica (no procesa lenguaje, aunque la instruccion de tarea se pasa como texto al runtime) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (repo de 0,2 GB) |

Otros datos de configuracion: tipo de robot `so_follower`, camaras `wrist` y `top`, entradas `observation.state (6,)`, `observation.images.wrist (3, 480, 640)`, `observation.images.top (3, 480, 640)`, salida `action (6,)`.

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que predice trozos de accion (action chunks) en lugar de pasos individuales, lo que reduce el error de compuesto acumulado tipico de las politicas paso a paso. La formulacion original combina un transformer con un esquema de autoencoder variacional condicional (CVAE) durante el entrenamiento, de forma que el modelo aprende una distribucion de posibles trayectorias dada la observacion; en inferencia se usa la media o muestreo de la latente. La model card de este repositorio no detalla el backbone visual concreto, la longitud del chunk ni la estrategia de ensamblado temporal, y el identificador del modelo ("actionstep25") sugiere un chunk de 25 pasos, pero ese dato no esta confirmado en la documentacion.

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset `Kwj1021/so101_pick_place_20261024_143100`: 95 episodios, 80.836 fotogramas a 30 FPS, una unica tarea ("pick up the object and place it in the target area"). La configuracion registrada es de 45.000 pasos, batch de 8 (unas 360.000 muestras vistas), optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta aumento de datos, composicion del dataset, ni fases de RLHF/DPO (no aplicables a este tipo de politica).

## Capacidades

- Control visomotor de pick-and-place: dado un frame de las camaras `wrist` y `top` mas el estado articular de 6 dimensiones, emite una accion de 6 dimensiones para el brazo SO-101 `so_follower`.
- Prediccion de chunks de accion, lo que aporta suavidad y tolerancia a la latencia del bucle de control en comparacion con politicas de accion por paso.
- Ejecucion en tiempo real sobre hardware real mediante `lerobot-rollout` con `--strategy.type=base`.
- Condicionamiento por instruccion de tarea en texto a nivel de runtime (`--task="pick up the object and place it in the target area"`), aunque el modelo esta entrenado para una unica tarea y no generaliza a otras instrucciones.
- Capacidad de reentrenamiento y fine-tuning con `lerobot-train --policy.type=act` sobre datasets propios en formato LeRobot.
- No soporta tool calling, function calling, razonamiento multi-paso simbolico, vision general, audio ni generacion de texto: es exclusivamente una politica robotica.

## Casos de uso

- Automatizacion de pick-and-place en el SO-101: el uso directo del modelo es ejecutar la tarea de recogida y deposito en la zona objetivo con el brazo de bajo coste, sirviendo como base funcional para demos de laboratorio o docencia.
- Punto de partida para fine-tuning con datos propios: al estar en formato LeRobot, se puede reentrenar con `lerobot-train` sobre un dataset local para adaptar la politica a objetos, posiciones o utilidades distintas sin partir de cero.
- Banco de pruebas de pipelines de imitacion: util para validar el flujo completo de LeRobot 0.6.2 (grabacion, visualizacion del dataset, entrenamiento, rollout) antes de invertir en datasets mayores.
- Docencia e investigacion en robotica de bajo coste: permite ilustrar el metodo ACT con un caso real y reproducible en un brazo SO-101 de coste reducido, con dos camaras y 45 minutos de demostraciones.
- Evaluacion de robustez y protocolos de test: sirve como sujeto de estudio para medir deriva ante cambios de iluminacion, posicion de objetos o distracciones, precisamente porque no hay tasas de exito publicadas que condicionen la comparacion.
- Integracion en brazos SO-101 dentro de celdas de ensamblaje simples: con un chunk de accion y control a 30 FPS, es adecuado para tareas repetitivas de traslado de piezas ligeras donde no se exige precision sub-milimetrica.
- Referencia para pipelines sim-to-real: puede compararse con politicas entrenadas primero en simulacion (por ejemplo, el enfoque del repo comunitario `aviadarn/so101-lerobot` con MuJoCo) para estudiar la brecha de transferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la plantilla de evaluacion vacia y senala explicitamente: "No evaluation results have been provided for this policy yet."

| Benchmark | Resultado | Notas |
|---|---|---|
| Tasa de exito en robot real | no disponible | El autor no ha reportado trials ni exitos |
| Evaluacion en simulacion (MuJoCo, LIBERO) | no disponible | No se menciona en la model card |
| MMLU / HumanEval / GSM8K | no aplica | Es una politica robotica, no un LLM |
| Perdida de entrenamiento final | no disponible | No se publican curvas ni logs de W&B |

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,2 GB en fp32 (51,6 M de parametros × 4 bytes); el repo completo ocupa 0,2 GB. Cabe holgadamente en cualquier GPU disponible.
- GPU recomendadas: no se requiere una GPU de datacenter. Una RTX 4090, RTX 3090 o incluso una GTX 1660 son mas que suficientes; A100/H100 solo tendrian sentido para entrenamiento por lotes a gran escala, no para esta politica.
- Cabe en GPU de consumo: si, en practicamente todas las GPU NVIDIA con CUDA de los ultimos diez anos. Tambien es viable en CPU (el cuello de botella real es el preprocesado de las dos imagenes de 480×640, no la matriz de pesos).
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) como via documentada, sobre PyTorch; el modelo requiere las dependencias de LeRobot 0.6.2. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no publicados. El unico dato objetivo de cadencia es la del dataset de entrenamiento, 30 FPS (33 ms por frame), que marca el objetivo de diseno del bucle de control pero no una medicion realizada con esta politica.
- Hardware robotico implicito: brazo SO-101 `so_follower` con dos camaras OpenCV a 640×480 y 30 FPS, mas el puerto serie del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dataset de entrenamiento | Evaluacion publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Kwj1021/act_so101_pick_place_new45plusdata_actionstep25` | 51.617.414 | no aplica | 95 episodios, 80.836 frames, tarea pick-and-place | no | no disponible | Hub de HF, 0 descargas, 0 likes |
| `ViVi-AI/ACT_so101_pick_place` | no disponible | no aplica | no disponible | no disponible | no disponible | Hub de HF |
| `anvil2718/act_so101_pickplace` | no disponible | no aplica | no disponible | no disponible | no disponible | Hub de HF, indexado en directorios de terceros |
| `junshin02/act_so101_pickplace` | no disponible | no aplica | no disponible | no disponible | no disponible | Hub de HF, indexado en directorios de terceros |

Los tres modelos comparables pertenecen a la misma familia metodologica (ACT sobre SO-101, tarea de pick-and-place) y se han localizado en la busqueda web, pero no se dispone de sus especificaciones tecnicas ni de resultados de evaluacion en la informacion consultada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Ausencia de licencia: la model card marca la licencia como "[More Information Needed]", lo que impide determinar si el uso comercial esta permitido. En produccion esto es un bloqueante legal hasta que el autor la declare.
- Cero evaluaciones publicadas: no hay tasa de exito, numero de trials ni condiciones de prueba, de modo que no se puede afirmar que la politica funcione de forma fiable ni siquiera en el setup del autor.
- Tarea unica y sin generalizacion semantica: el modelo esta entrenado exclusivamente para "pick up the object and place it in the target area"; no interpreta otras instrucciones ni objetos no vistos.
- Dependencia estricta del setup de captura: la politica asume dos camaras concretas (`wrist` y `top`) a 480×640, a 30 FPS y con nombres de observacion exactos. Cambiar la camara, la resolucion, el montaje o el robot invalida las observaciones esperadas.
- Dataset pequeno: 95 episodios y ~45 minutos de demostraciones implican un riesgo alto de sobreajuste a posiciones, iluminacion y objetos presentes en la grabacion. No se documenta aumento de datos ni variabilidad controlada.
- Sesgos no caracterizados: al no haber evaluacion, no se conocen los sesgos de comportamiento (por ejemplo, preferencia por posiciones iniciales concretas o sensibilidad a distractores). Tampoco hay analisis de fallos.
- Sin cuantizaciones ni formatos alternativos: solo safetensors; no hay versiones GGUF, ONNX ni optimizadas para despliegue embebido, lo que limita su uso en hardware tipo Jetson sin conversion manual.
- Idoneidad para produccion baja: 0 descargas y 0 likes en el momento del registro, sin mantenimiento ni issues documentados; es un artefacto de experimentacion, no un componente soportado.
- Numero de pasos y batch pequenos (45.000 × 8): el ajuste fino puede haber quedado por debajo de lo necesario para una politica robusta, aunque sin curvas de perdida no es verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kwj1021/act_so101_pick_place_new45plusdata_actionstep25
- Dataset de entrenamiento: https://huggingface.co/datasets/Kwj1021/so101_pick_place_20261024_143100
- Visualizacion del dataset (LeRobot Space): https://huggingface.co/spaces/lerobot/visualize_dataset?path=Kwj1021/so101_pick_place_20261024_143100
- Paper del metodo ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de hardware SO-101: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Politica ACT similar en el Hub: https://huggingface.co/ViVi-AI/ACT_so101_pick_place
- Repo comunitario SO-101 + LeRobot (sim-to-real con MuJoCo): https://github.com/aviadarn/so101-lerobot

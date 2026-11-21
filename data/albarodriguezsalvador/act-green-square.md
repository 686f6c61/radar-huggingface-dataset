# albarodriguezsalvador/act-green-square

## Resumen

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulacion y permite politicas mas robustas a partir de datos de teleoperacion. Este repositorio concreto, `act-green-square`, es una politica entrenada con LeRobot por el usuario albarodriguezsalvador para el robot `so_follower`, con dos camaras (`front` y `gripper`) y una tarea muy especifica: seleccionar el cuadrado verde entre cuatro cuadrados.

El modelo resuelve una tarea de manipulacion visual-motora de un solo brazo con seis dimensiones de estado y seis de accion. No es un modelo de lenguaje: es una politica robotica que consume observaciones (estado articular y dos imagenes RGB de 480x640) y emite comandos de accion de dimension 6. Su relevancia es practica: demuestra el flujo completo de LeRobot para entrenar y desplegar politicas ACT sobre hardware asequible (SO-100/SO-101), y sirve como referencia reproducible para quien quiera replicar el pipeline.

El modelo tiene 51.668.614 parametros y un tamano de repositorio de 0,2 GB, lo que lo hace muy ligero y desplegable en hardware de consumo. La informacion publicada es escasa: no hay resultados de evaluacion, no se declara licencia y el entrenamiento fue corto (200 pasos, batch 8), por lo que debe interpretarse como una prueba de concepto mas que como un sistema listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT combina un backbone de vision (codificador de imagenes) con un transformer que fusiona las representaciones visuales y el estado proprioceptivo para predecir un chunk de acciones futuras. La innovacion principal del metodo es la prediccion de chunks con un objetivo de regresion tipo L1 y un mecanismo de "temporal ensembling" en inferencia, que suaviza las transiciones y reduce el error compuesto respecto a politicas paso a paso. En este caso, el modelo consume `observation.state` de forma `(6,)` y dos flujos visuales `observation.images.front` y `observation.images.gripper` de forma `(3, 480, 640)`, y produce `action` de forma `(6,)`.

El entrenamiento se realizo con LeRobot 0.7.1 sobre el dataset `albarodriguezsalvador/green-square-fix-movement-001-cleaned`, compuesto por 29 episodios y 14.236 frames a 30 FPS, con la tarea "green-square-fix-movement-001 selects the green square between 4 squares". La configuracion fue de 200 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el numero total de tokens ni el uso de RLHF/DPO (no aplica a este tipo de politica). El volumen de datos y de pasos es muy reducido, lo que limita la generalizacion.

## Capacidades

- Control visuomotor de un brazo robotico de 6 grados de libertad (`so_follower`) a partir de dos camaras.
- Prediccion de chunks de accion para ejecucion fluida y reduccion de error acumulado.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin recompensas explicitas.
- Percepcion visual de objetos coloreados (cuadrado verde entre cuatro cuadrados) en escena controlada.
- Ejecucion de una unica tarea especializada; no soporta multiples tareas ni instrucciones en lenguaje natural.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni modo "thinking"; no es un modelo generativo de texto.
- No dispone de vision general: solo procesa las dos camaras para las que fue entrenado.

## Casos de uso

- Replicacion del pipeline LeRobot: sirve como ejemplo end-to-end para aprender a grabar un dataset, entrenar una politica ACT y desplegarla con `lerobot-rollout` en un robot SO-100/SO-101.
- Docencia y talleres de robotica: tarea sencilla y visual (seleccionar un cuadrado verde) ideal para demostrar aprendizaje por imitacion en pocas horas de computo.
- Prueba de concepto de picking guiado por color: el modelo puede integrarse en una celda de laboratorio para validar la viabilidad de una politica visual antes de escalar a tareas mas complejas.
- Benchmark interno de hardware: al ser ligero (0,2 GB, 51M parametros), permite medir latencia y throughput de inferencia en distintas GPUs o en el propio robot.
- Base para fine-tuning: puede servir como punto de partida para reentrenar con un dataset mayor o con variaciones de iluminacion y posiciones de objetos.
- Validacion de calibracion de camaras: al depender de las vistas `front` y `gripper`, es util para comprobar que la calibracion y el montaje de las camaras son correctos antes de entrenar tareas mas largas.
- Automatizacion de una subtarea en un flujo mayor: una vez validada la politica, puede encadenarse con otros modulos (deteccion, planificacion) para tareas de clasificacion por color.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7M de parametros en fp32 el modelo ocupa aproximadamente 0,2 GB, mas el coste de las activaciones visuales de dos imagenes de 480x640. Cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes. Tambien puede ejecutarse en CPU para pruebas, aunque con mayor latencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en placas integradas para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es el metodo documentado; al ser safetensors y PyTorch, puede cargarse tambien con scripts propios. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput estimados: no disponibles. Dependen del robot, de la frecuencia de captura (30 FPS en entrenamiento) y del hardware de inferencia; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-green-square (este modelo) | 51,7M | estado (6,) + 2 imagenes 480x640 | Seleccion de cuadrado verde con SO follower | no disponible | Hugging Face |
| ACT original (paper 2304.13705) | no disponible | no disponible | Metodo general de imitacion | no disponible | Paper y codigo de referencia |
| Diffusion Policy | no disponible | no disponible | Politicas de imitacion basadas en difusion | no disponible | Repositorios publicos |
| Otras politicas LeRobot ACT del Hub | variable | variable | Tareas diversas | variable | Hugging Face |

No se dispone de datos numericos comparativos de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenamiento muy corto (200 pasos, batch 8) y dataset pequeno (29 episodios, 14.236 frames): alta probabilidad de sobreajuste y baja generalizacion a nuevas posiciones, iluminacion o distractores.
- Sin resultados de evaluacion publicados: no hay evidencia cuantitativa de tasa de exito.
- Tarea unica y muy especifica: solo "selecciona el cuadrado verde entre cuatro cuadrados"; no admite instrucciones nuevas.
- Dependencia estricta de la configuracion de camaras: los nombres `front` y `gripper` y sus indices deben coincidir con los del entrenamiento; cambios de montaje o calibracion degradan el rendimiento.
- Licencia no declarada: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion en el sentido de acciones incorrectas o inseguras: como toda politica de imitacion, puede ejecutar movimientos no previstos ante entradas fuera de distribucion.
- Sesgos derivados de los datos de teleoperacion de un unico operador y un unico entorno; no se documenta diversidad de demostraciones.
- No apto para produccion sin una evaluacion en robot real con multiples ensayos y condiciones.
- Idiomas no aplicables; no debe confundirse con un modelo de lenguaje pese a usar un transformer.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/albarodriguezsalvador/act-green-square
- Dataset de entrenamiento: https://huggingface.co/datasets/albarodriguezsalvador/green-square-fix-movement-001-cleaned
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=albarodriguezsalvador/green-square-fix-movement-001-cleaned
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference

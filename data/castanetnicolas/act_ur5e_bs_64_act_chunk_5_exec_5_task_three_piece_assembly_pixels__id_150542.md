# castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_5_Exec_5_TASK_three_piece_assembly_PIXELS__ID_150542

## Resumen

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de composicion acumulado en tareas de manipulacion. Este checkpoint concreto, publicado por el usuario castanetnicolas, es una politica entrenada con LeRobot para la tarea "three piece assembly" del banco de pruebas MimicGen, en la que un brazo robotico debe insertar dos piezas sucesivamente en una base. El modelo ocupa 51.575.431 parametros y se distribuye en formato safetensors bajo licencia Apache 2.0.

Se trata de una politica visual-motora (vision-language-action sin componente de lenguaje explicito) que consume el estado del robot (vector de 9 dimensiones) y dos flujos de imagen de 3x84x84 pixeles (camara de vista general y camara en la muneca) para producir un vector de accion de 7 dimensiones. Su relevancia radica en que demuestra un flujo de trabajo reproducible de LeRobot para entrenar y desplegar politicas de imitacion sobre robots tipo panda y UR5e en entornos tipo MimicGen.

El nombre del repositorio indica una configuracion de chunk de accion igual a 5 y horizonte de ejecucion igual a 5, con un entrenamiento de 300.000 pasos sobre 200 episodios y 67.101 fotogramas a 20 FPS. No se han publicado resultados de evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer encoder-decoder con CVAE segun el paper 2304.13705; configuracion especifica del checkpoint no disponible |
| Parametros totales | 51.575.431 (~51,6 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (politica robotica); horizonte de accion: chunk 5, ejecucion 5 |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible / no aplicable (politica de control robotico, no modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

ACT se define, segun el paper referenciado (2304.13705), como un transformer encoder-decoder que incorpora un autocodificador variacional condicionado (CVAE) para capturar la variabilidad de las demostraciones humanas, y que predice un chunk de acciones en lugar de un unico paso. La inferencia combinada con ensamblado temporal (temporal ensembling) suaviza las transiciones entre chunks. La descripcion del checkpoint en el Hub no detalla la columna vertebral visual, el numero de capas ni la dimension oculta, por lo que esos valores concretos se consideran no disponibles.

El entrenamiento se realizo con LeRobot 0.6.1 durante 300.000 pasos, con tamano de lote 64, optimizador AdamW, tasa de aprendizaje de 1e-05 y semilla 1000. Los datos provienen del dataset castanetnicolas/mimicgen_three_piece_assembly_d1_image84, compuesto por 200 episodios y 67.101 fotogramas capturados a 20 FPS. La tarea objetivo es "Insert the first piece into the base, then insert the second piece on top of it". No se documenta el uso de RLHF ni DPO, algo esperable en aprendizaje por imitacion. No se han publicado resultados de evaluacion en robot real ni datos de exito de la tarea.

Nota: aunque el identificador del repositorio menciona "UR5e", la model card declara el tipo de robot como panda y camaras agentview y robot0_eye_in_hand, de modo que existe una discrepancia entre nombre y configuracion declarada.

## Capacidades

- Generacion de acciones de control de 7 dimensiones (tipicamente 6 grados de libertad mas pinza) a partir de observaciones visuales y de estado.
- Prediccion por chunks de acciones (chunk de 5 pasos) con horizonte de ejecucion de 5, orientada a reducir la acumulacion de error.
- Percepcion visual mediante dos camaras: vista general (agentview) y vista en la muneca (robot0_eye_in_hand), ambas a 3x84x84.
- Consumo de estado propioceptivo del robot de 9 dimensiones (observation.state).
- Aprendizaje por imitacion a partir de demostraciones teleoperadas (no dispone de tool calling ni function calling).
- No dispone de razonamiento de multiples pasos simbolico, ni de capacidades multilingues, de vision general o de audio; es una politica motora especifica de tarea.

## Casos de uso

- Ensamblaje de piezas en linea de produccion: la politica ejecuta la secuencia de insertar una pieza en la base y colocar una segunda encima, adecuada para celdas de montaje repetitivas con objetos cuya posicion varia poco.
- Prototipado rapido de politicas de imitacion con LeRobot: sirve como punto de partida reproducible para reentrenar con `lerobot-train` sobre datasets propios con la misma interfaz de observacion (estado de 9 dimensiones y dos camaras a 84x84).
- Investigacion en aprendizaje por imitacion: permite comparar configuraciones de chunk y horizonte de ejecucion (aqui 5 y 5) frente a otras variantes del mismo autor sin cambiar de arquitectura base.
- Automatizacion de tareas de pick-and-place con retroalimentacion visual: el uso de camara en la muneca facilita el ajuste fino en la fase de insercion.
- Evaluacion de generalizacion con MimicGen: el checkpoint puede usarse para medir la transferencia de politicas entrenadas en simulacion con aumentos de datos hacia robot real.
- Despliegue en robot panda (o UR5e con recalibracion) mediante `lerobot-rollout` con estrategia base para ejecuciones temporizadas de demostracion o validacion.
- Docencia y talleres de robotica de manipulacion: al ocupar solo ~51,6 M de parametros, se puede ejecutar en hardware modesto para sesiones practicas de control visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet", sin tasa de exito ni numero de ensayos en robot real.

## Requisitos de hardware

- VRAM estimada (estimacion a partir del numero de parametros, no dato publicado): ~206 MB en fp32 (51.575.431 x 4 bytes) y ~103 MB en fp16/bf16.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente por tamano; en la practica el cuello de botella es la latencia de control, no la memoria. GPU consumer como RTX 3060, RTX 4090 o superiores son mas que suficientes.
- Cabe en GPU consumer: si, y tambien es viable en CPU para inferencia por lotes, aunque no se documenta la latencia en CPU.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, estrategia base), PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Los datos de entrenamiento estan capturados a 20 FPS, lo que sugiere una frecuencia de control objetivo en torno a 20 Hz, pero no se confirma.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato / libreria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT three piece assembly) | 51.575.431 | Ensamblaje de tres piezas (MimicGen) | safetensors / lerobot | apache-2.0 | publico en HF |
| castanetnicolas/ACT_UR5e tool_hang | no disponible | Tool hang | safetensors / lerobot | no disponible | publico en HF |
| castanetnicolas/smolvla_UR5e nut assembly square | no disponible | Ensamblaje de tuerca cuadrada | safetensors / lerobot | no disponible | publico en HF |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la informacion proporcionada; la comparativa se limita a tarea, formato y licencia declarada.

## Limitaciones y advertencias

- No se han publicado tasas de exito ni evaluaciones en robot real; el rendimiento en produccion es desconocido.
- Discrepancia entre el nombre del repositorio (UR5e) y el tipo de robot declarado en la model card (panda); conviene verificar la compatibilidad antes de desplegar.
- Politica especifica de tarea: no generaliza a objetos, posiciones o composiciones de escena fuera de la distribucion del dataset de entrenamiento.
- Sensibilidad esperada a las condiciones de captura (iluminacion, oclusiones, posicion inicial) y al calibrado de camaras, que deben coincidir con las claves de observacion entrenadas.
- Requiere que las camaras y sus indices/rutas se configuren de forma exacta segun la interfaz de observacion del modelo (agentview y robot0_eye_in_hand, 3x84x84).
- Riesgo de alucinacion no aplicable en el sentido linguistico, pero si de acciones incorrectas o inestables fuera de la distribucion.
- Sin sesgos linguisticos ni multilingues por tratarse de una politica motora.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Repositorio con 0 descargas y 0 likes, creado y actualizado en 2026-10-12 segun los metadatos: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_5_Exec_5_TASK_three_piece_assembly_PIXELS__ID_150542
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de entrenamiento ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cheat-sheet de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Checkpoint relacionado (tool hang): https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_10_Exec_10_TASK_tool_hang_PIXELS__ID_146876
- Checkpoint relacionado (SmolVLA, nut assembly square): https://huggingface.co/castanetnicolas/smolvla_UR5e_BS_64_Act_Chunk_10_Exec_10_TASK_nut_assembly_square_ID_148308

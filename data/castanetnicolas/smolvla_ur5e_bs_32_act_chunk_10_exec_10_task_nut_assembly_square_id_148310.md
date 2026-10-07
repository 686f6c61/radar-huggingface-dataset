# castanetnicolas/smolvla_UR5e_BS_32_Act_Chunk_10_Exec_10_TASK_nut_assembly_square_ID_148310

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado originalmente por Hugging Face (ver paper arXiv:2506.01844) que combina percepción visual, comprensión del lenguaje y generación de acciones motoras para controlar robots. Esta ficha concreta corresponde a un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, realizado por el usuario `castanetnicolas`, orientado a una tarea de ensamblaje robótico: coger una tuerca cuadrada y colocarla sobre una clavija cuadrada.

El modelo tiene aproximadamente 450 millones de parámetros (450.046.176 según el archivo safetensors) y un peso de repositorio de 0,9 GB, lo que lo sitúa en la categoría de modelos ligeros desplegables en hardware de consumo. Consume observaciones del robot (estado articular de 6 dimensiones y tres cámaras RGB de 256x256) y produce un vector de acción de 7 dimensiones. Es un modelo de política (policy) de imitación, no un modelo de lenguaje generativo, por lo que su salida es una secuencia de comandos motores y no texto.

Su relevancia radica en que demuestra el flujo de trabajo de LeRobot para el ajuste fino de políticas VLA sobre datasets de demostración relativamente pequeños (200 episodios, 30.154 fotogramas), y en que el modelo base SmolVLA está diseñado explícitamente para ejecutarse en GPUs de gama de consumo, reduciendo la barrera de entrada a la robótica con aprendizaje por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en SmolVLA; no disponible el detalle exacto del backbone en la informacion proporcionada |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de politica robotica, no de texto) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors; no se documentan cuantizaciones GGUF/INT8 especificas) |
| Idiomas soportados | no disponible (modelo visual-motor; la tarea se define en ingles mediante un prompt de tarea) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,9 GB |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot declarado | discrepancia: el nombre del modelo indica UR5e, la model card indica `panda` |
| Camaras (entradas visuales) | 3 camaras (3, 256, 256); la model card menciona `agentview` y `robot0_eye_in_hand` |
| Entrada de estado | `observation.state` de forma (6,) |
| Salida de accion | `action` de forma (7,) |
| Modelo base | lerobot/smolvla_base |

## Arquitectura y entrenamiento

SmolVLA pertenece a la familia de modelos vision-language-action, que acoplan un codificador visual, un modelo de lenguaje ligero y una cabeza de prediccion de acciones para traducir observaciones (imagenes y estado del robot) y una instruccion en lenguaje natural en comandos de control. Segun el paper referenciado (arXiv:2506.01844), SmolVLA esta disenado para lograr un rendimiento competitivo con un coste computacional reducido y ser desplegable en hardware de consumo. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento del modelo base ni de la composicion detallada de su dataset original.

El ajuste fino documentado en esta ficha se realizo con LeRobot 0.6.1 sobre el dataset `castanetnicolas/robomimic_square_ph_image84`, compuesto por 200 episodios y 30.154 fotogramas a 20 FPS, para la tarea "Pick up the square nut and place it on the square peg." La configuracion de entrenamiento fue de 40.000 pasos, batch size 32, optimizador AdamW, learning rate 0,0001 y semilla 1000. El identificador del modelo incluye los sufijos `Act_Chunk_10_Exec_10`, que sugieren el uso de chunking de acciones (prediccion de bloques de 10 acciones y ejecucion en bloques de 10), una tecnica habitual en politicas VLA para mejorar la estabilidad temporal. No se documentan fases de RLHF o DPO, que no son propias de este tipo de politica de imitacion.

## Capacidades

- Generacion de acciones motoras: produce vectores de accion de 7 dimensiones a partir de estado + vision, adecuados para control de un efector final.
- Percepcion visual multi-camara: procesa tres flujos de imagen simultaneos de 256x256 (vista de agente y vista en la mano, segun la model card).
- Condicionamiento por instruccion de tarea: acepta un prompt de tarea en lenguaje natural ("Pick up the square nut and place it on the square peg.").
- Aprendizaje por imitacion: replica comportamientos demostrados en el dataset de entrenamiento.
- Tarea especializada: ensamblaje de tuerca cuadrada sobre clavija cuadrada (benchmark robomimic "square").
- No es un modelo generativo de texto: no realiza chat, razonamiento simbolico ni generacion de codigo.
- Soporte de tool calling / function calling: no disponible / no aplica.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Automatizacion de ensamblaje industrial de piezas pequenas: el modelo ejecutaria la secuencia de coger una tuerca y encajarla en una clavija en una celda robotizada, usando las tres camaras para localizar la pieza y el estado articular para planificar el movimiento.
- Banco de pruebas de aprendizaje por imitacion: sirve como referencia para reproducir el flujo de LeRobot (grabacion de datos, entrenamiento, rollout) sobre una tarea de manipulacion concreta.
- Investigacion en VLA de bajo coste: al tener ~450 M de parametros, permite experimentar con politicas VLA en una sola GPU, sin necesidad de clústeres.
- Generacion de datos sinteticos y aumento de dataset: se puede usar para ejecutar politicas y registrar trayectorias adicionales que amplien el dataset de entrenamiento.
- Evaluacion de robustez ante variaciones de posicion e iluminacion: al ser una politica visual, permite medir su degradacion al cambiar posiciones de objetos o condiciones de luz.
- Prototipado de celda robotica en laboratorio: integracion en un banco con robot tipo UR5e o panda para validar la tarea "square" de robomimic antes de escalar a produccion.
- Educacion y formacion en robotica: ejemplo practico de pipeline completo de imitacion con LeRobot, util para cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito, ni de comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia (según 450 M de parametros): aproximadamente 1,8 GB en fp32, 0,9 GB en fp16/bf16 y 0,45 GB en int8, sin contar el codificador visual ni las activaciones.
- Cabe en GPU de consumo: si, con amplio margen. Tarjetas como RTX 3060, RTX 4060, RTX 4070 o RTX 4090 son suficientes; el modelo esta disenado segun el paper para hardware de consumo.
- GPU recomendadas para entrenamiento: una GPU con al menos 8-12 GB de VRAM permite el fine-tuning con batch size reducido; para el batch size de 32 documentado puede requerirse mas memoria o acumulacion de gradientes.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), y el ecosistema PyTorch asociado. No se documenta soporte para vLLM, llama.cpp u Ollama, que no son adecuados para una politica robotica de este tipo.
- Latencia y throughput estimados: no disponibles de forma explicita; el diseno del modelo prioriza la inferencia en tiempo real en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| smolvla_UR5e_BS_32_Act_Chunk_10_Exec_10 (este modelo) | ~450 M | VLA ajustado para tarea "square" | apache-2.0 | Hugging Face (0 descargas, 0 likes) | Fine-tuning especifico; sin evaluacion publicada |
| lerobot/smolvla_base | no disponible en la informacion (modelo base) | VLA base | no disponible en la informacion | Hugging Face | Modelo base del que parte este ajuste |
| Otros VLA comparables (OpenVLA, pi0, etc.) | no disponible | VLA | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion rigurosa |

No se dispone de datos suficientes en la informacion proporcionada para una comparativa cuantitativa fiable (parametros, contexto, rendimiento) con alternativas de la misma categoria.

## Limitaciones y advertencias

- Tarea muy especializada: el modelo esta ajustado exclusivamente para "coger la tuerca cuadrada y colocarla en la clavija cuadrada"; no generaliza a otras tareas fuera de ese dominio.
- Ausencia de evaluacion: no se han publicado tasas de exito ni pruebas en robot real, por lo que se desconoce su fiabilidad en produccion.
- Sesgos de dataset: entrenado sobre 200 episodios de demostracion (30.154 fotogramas), lo que puede limitar la diversidad de posiciones, iluminacion y configuraciones cubiertas y favorecer el sobreajuste a las condiciones de recogida de datos.
- Discrepancia en el tipo de robot: el nombre del modelo indica UR5e mientras que la model card declara `panda`; conviene verificar la correspondencia real antes de desplegarlo.
- Riesgo de alucinacion motora: al ser una politica de imitacion, puede generar acciones incorrectas o inseguras ante observaciones fuera de distribucion; requiere supervisión y paradas de seguridad.
- Dependencia de las camaras: las entradas visuales deben coincidir con los nombres y formatos de observacion del entrenamiento (`observation.images.camera1/2/3`), y la model card menciona otras denominaciones (`agentview`, `robot0_eye_in_hand`), lo que puede requerir remapeo.
- Limitaciones de idioma: no ofrece soporte multilingue ni generacion de lenguaje; el prompt de tarea esta en ingles.
- Licencia: apache-2.0 permite uso comercial, pero al ser un ajuste sobre `lerobot/smolvla_base` conviene revisar la licencia y condiciones del modelo base y del dataset de origen.
- Sin datos de cuantizacion: no se documentan versiones cuantizadas oficiales, lo que obliga a generarlas por cuenta propia si se busca minimizar VRAM.
- Caveat de produccion: al tratarse de un modelo con 0 descargas y 0 likes, sin validacion externa, no deberia usarse en entornos criticos sin una evaluacion exhaustiva.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/castanetnicolas/smolvla_UR5e_BS_32_Act_Chunk_10_Exec_10_TASK_nut_assembly_square_ID_148310
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_square_ph_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_square_ph_image84
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento (imitacion): https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de la CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference

# castanetnicolas/ACT_UR5e_BS_16_Act_Chunk_5_Exec_5_TASK_three_piece_assembly_PIXELS__ID_150540

## Resumen

ACT_UR5e_BS_16_Act_Chunk_5_Exec_5_TASK_three_piece_assembly_PIXELS__ID_150540 es una política de robótica entrenada con Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de un único paso. El modelo lo publica el usuario de HuggingFace castanetnicolas y se distribuye dentro del ecosistema LeRobot de HuggingFace, con licencia Apache 2.0. El repositorio ocupa 0,2 GB y el checkpoint contiene 51.575.431 parámetros (unos 51,6 millones).

La política resuelve una tarea concreta de ensamblaje: insertar la primera pieza en la base e insertar después la segunda pieza encima, según la descripción de la tarea del dataset de entrenamiento. Consume dos cámaras RGB de 84x84 píxeles (`agentview` y `robot0_eye_in_hand`) más un vector de estado de 9 dimensiones, y produce un vector de acción de 7 dimensiones, lo que corresponde a un efector final con 6 grados de libertad más pinza. El nombre del repositorio codifica la configuración de entrenamiento: batch size 16, chunk de acción 5 y horizonte de ejecución 5.

Es relevante ahora porque ejemplifica el flujo actual de robótica open source: datos teleoperados o generados por simulación (MimicGen), entrenamiento reproducible con LeRobot y publicación del checkpoint en el Hub para que cualquiera pueda reproducir el entrenamiento o desplegarlo sobre hardware real. No se han publicado resultados de evaluación en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE y extractor visual convolucional |
| Parametros totales | 51.575.431 (51,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica: la politica consume una unica observacion por paso (2 imagenes de 84x84 y estado de 9 dimensiones) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en safetensors |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

Datos adicionales de la model card:

| Parametro | Valor |
|---|---|
| Tipo de robot declarado | `panda` |
| Camaras | `agentview`, `robot0_eye_in_hand` |
| Entradas | `observation.state` (9,), `observation.images.agentview` (3, 84, 84), `observation.images.robot0_eye_in_hand` (3, 84, 84) |
| Salidas | `action` (7,) |
| Chunk de accion / horizonte de ejecucion | 5 / 5 (segun el nombre del repositorio) |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el articulo arXiv:2304.13705. La arquitectura combina un backbone de visión (típicamente ResNet) que procesa las imágenes de las cámaras, una proyección del vector de estado del robot y un transformer encoder-decoder que genera un chunk de acciones futuras de una sola vez. El componente de autoencoder variacional condicional (CVAE) modela la variabilidad del estilo de demostración a través de una variable latente, lo que ayuda a manejar trayectorias multimodales y a reducir el error de acumulación típico de las políticas que predicen un solo paso. La decodificación por chunks, junto con la agregación temporal de los solapamientos entre chunks, es lo que permite obtener movimientos suaves y una tasa de éxito alta con relativamente pocos datos. El nombre del repositorio indica además que el entrenamiento usa un chunk de 5 acciones y un horizonte de ejecución de 5, es decir, un solapamiento nulo o mínimo entre chunks consecutivos.

El entrenamiento se realizó sobre el dataset `castanetnicolas/mimicgen_three_piece_assembly_d1_image84`, con 200 episodios y 67.101 fotogramas a 20 FPS, imágenes de 84x84 píxeles y una única tarea descrita como insertar dos piezas. La configuración declarada es de 300.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.1. No se documentan en la model card detalles sobre aumentos de datos, número de tokens o fases de RLHF/DPO, que en cualquier caso no aplican a este tipo de política; tampoco se especifica si el entrenamiento fue en simulación, sobre robot real o una mezcla.

## Capacidades

- Generacion de acciones de control continuo: produce vectores de 7 dimensiones (6 grados de libertad mas pinza) a partir de observaciones visuales y propioceptivas.
- Manipulacion visual guiada: usa dos camaras (vista externa `agentview` y vista en la muneca `robot0_eye_in_hand`) para localizar las piezas y guiar la inserción.
- Ejecucion de tareas de ensamblaje de contacto preciso: la tarea objetivo implica insertar una pieza en una base y colocar una segunda encima, lo que requiere control fino de posicion y orientacion.
- Prediccion de chunks de acciones: emite 5 acciones por inferencia con horizonte de ejecucion 5, lo que reduce la frecuencia efectiva de inferencia necesaria.
- Aprendizaje por imitacion de una unica tarea: no es un modelo generalista ni instruible por lenguaje; esta especializado en la tarea del dataset.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbolico, generacion de texto, codigo, matematicas ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo thinking ni de capacidades de vision general (VQA, deteccion abierta, etc.); la vision esta integrada exclusivamente como entrada de control.

## Casos de uso

- Ensamblaje industrial de dos piezas: la politica esta entrenada exactamente para insertar una pieza en una base y una segunda encima, por lo que puede desplegarse en una celda de ensamblaje con las mismas dos cámaras y la misma disposición inicial para automatizar el ciclo.
- Banco de pruebas de aprendizaje por imitacion: sirve como referencia reproducible para comparar variantes de ACT (distinto chunk, distinto horizonte de ejecución, distintos backbones visuales) manteniendo fijo el dataset y la configuración de entrenamiento.
- Generacion de datos sinteticos con MimicGen: al proceder de un dataset MimicGen, puede usarse para estudiar la transferencia de políticas entrenadas en datos generados a hardware real, midiendo la brecha sim-a-real en una tarea de inserción.
- Investigacion en chunking y agregacion temporal: permite evaluar experimentalmente el efecto del tamano de chunk (5) y del horizonte de ejecucion (5) sobre la suavidad de la trayectoria y la tasa de exito.
- Prototipado rapido en laboratorio con LeRobot: el comando `lerobot-rollout` permite ejecutar la politica en un robot tipo `panda` con dos camaras en minutos, sin escribir codigo de inferencia propio.
- Evaluacion de robustez ante cambios de iluminacion y posicion: util como sujeto de prueba para medir como degrada una politica ACT especializada cuando se alteran condiciones no vistas en el dataset.
- Educacion y formacion en robotica: por su tamano reducido (0,2 GB) y sus dependencias estandar (LeRobot y PyTorch), es adecuado para practicas de aprendizaje por imitacion en cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la nota explicita de que no se han proporcionado resultados de evaluacion para esta politica. No se dispone por tanto de tasas de exito en robot real, numero de ensayos ni condiciones de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,6 M de parametros, el checkpoint completo ocupa aproximadamente 0,2 GB en precision de 32 bits. En la practica, el consumo total de VRAM depende del backend y del tamano de lote; para lote 1 es del orden de cientos de megabytes, muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia. Para entrenamiento con 300.000 pasos y batch 16, una GPU de gama alta (RTX 3090, RTX 4090, A100, H100) reduce notablemente el tiempo total, aunque el modelo es lo bastante pequeno para entrenar en GPU de gama media.
- Compatibilidad con GPU de consumo: si, cabe con holgura en cualquier GPU de consumo moderna (RTX 3060 en adelante) e incluso en iGPU con suficiente memoria compartida. Tambien es viable la inferencia en CPU, aunque no se documentan latencias concretas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion, `lerobot-train` para reentrenamiento) sobre PyTorch. Tambien es posible cargar el checkpoint safetensors con PyTorch directamente. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. El horizonte de ejecucion de 5 acciones por inferencia implica que la politica solo necesita ejecutarse una vez cada 5 pasos de control, lo que relaja el requisito de latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (esta ficha) | 51,6 M | Transformer con CVAE, chunking de acciones | 2 imagenes 84x84 + estado de 9 dim. | Apache 2.0 | HuggingFace Hub, via LeRobot |
| Diffusion Policy | no disponible | Politica de difusion sobre acciones | Depende de la configuracion | no disponible | Implementaciones publicas en repos de investigacion |
| Otras politicas ACT publicadas en el Hub de LeRobot | variable (orden de decenas de millones) | ACT | Depende del dataset | habitualmente Apache 2.0 | HuggingFace Hub |
| Modelos VLA (por ejemplo, OpenVLA y familia) | orden de miles de millones | Vision-language-action | Instrucciones en lenguaje + vision | licencias especificas de cada modelo | HuggingFace Hub |

No se dispone de cifras comparativas de rendimiento entre estas alternativas en la informacion proporcionada. La diferencia principal frente a los modelos VLA es de escala y de alcance: esta politica es un modelo especializado de 51,6 M de parametros para una sola tarea, sin entrada de lenguaje ni generalizacion a instrucciones nuevas.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea y un unico dataset de 200 episodios y 67.101 fotogramas. No generaliza a otras tareas, objetos ni disposiciones iniciales fuera de la distribucion de entrenamiento.
- Sin resultados de evaluacion: la model card indica explicitamente que no se han proporcionado resultados de exito en robot real. No hay evidencia publicada de fiabilidad en produccion.
- Inconsistencia en el nombre: el identificador del repositorio menciona UR5e, mientras que la model card declara `robot type: panda` y el dataset es de tipo MimicGen (habitualmente sobre un manipulador tipo Franka). Es necesario verificar el robot real de entrenamiento antes de desplegar la politica, ya que una cinematica distinta invalida las acciones predichas.
- Dependencia de la configuracion de camaras: los nombres y la colocacion de las camaras deben coincidir con los usados en el entrenamiento (`agentview` y `robot0_eye_in_hand`). Cambiar la posicion, la iluminacion o la resolucion efectiva degrada el rendimiento, y aunque el comando de ejemplo admite camaras de 640x480, la red fue entrenada con imagenes de 84x84.
- Sesgos desconocidos: no se documenta la composicion demografica ni la diversidad de condiciones del dataset, por lo que no puede evaluarse el sesgo de generalizacion a entornos distintos.
- Riesgo de alucinacion en el sentido de acciones plausibles pero incorrectas: como toda politica de imitacion, puede generar trayectorias que parecen correctas pero fallan en el contacto fisico, sin senal de confianza asociada.
- Restricciones de licencia: la licencia declarada es apache-2.0, permisiva para uso comercial, pero conviene verificar la licencia del dataset de entrenamiento (`mimicgen_three_piece_assembly_d1_image84`) y de los entornos de simulacion asociados, que pueden tener condiciones distintas.
- Ausencia de salvaguardas: no hay filtros de seguridad ni limites de fuerza o velocidad en el modelo; el control de seguridad debe implementarse en la capa de robot.
- Requisito de datos de teleoperacion para reutilizarlo: adaptarlo a otra tarea exige recoger un dataset propio y reentrenar, no basta con cambiar un prompt.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_16_Act_Chunk_5_Exec_5_TASK_three_piece_assembly_PIXELS__ID_150540
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

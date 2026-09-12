# sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__lr5x__steps_60k

## Resumen

Este repositorio contiene un modelo Vision-Language-Action (VLA) denominado pi05, una adaptación mediante LeRobot del modelo π₀.₅ de Physical Intelligence, ajustado específicamente sobre un conjunto de datos de manipulación robótica. Se trata de un "policy checkpoint" de 4.143.404.816 parámetros (~4,14 mil millones) obtenido por fine-tuning del modelo base `lerobot/pi05_base`, entrenado por la organización `sam-guided-vlas` y publicado el 12 de septiembre de 2026. El objetivo declarado de π₀.₅ es la generalización a entornos y situaciones nuevos no vistos durante el entrenamiento, partiendo de la arquitectura π₀ del mismo laboratorio.

El modelo no genera texto de propósito general: consume observaciones de robot (estado proprioceptivo de 9 dimensiones y tres cámaras RGB de 224x224) junto con una instrucción de tarea en lenguaje natural y produce vectores de acción de 7 dimensiones, adecuados para un brazo robótico Franka Panda. El checkpoint se ha entrenado durante 60.000 pasos con un tamaño de lote de 16, optimizador AdamW y una tasa de aprendizaje de 0,00025 (el sufijo `lr5x` del nombre sugiere un incremento de 5x respecto a la configuración de referencia, aunque esto no se confirma en la model card).

Su relevancia actual es doble: por un lado, forma parte del ecosistema LeRobot de Hugging Face para aprendizaje por imitación reproducible; por otro, está vinculado a un dataset etiquetado por el autor como `sam-guided-vlas` que combina episodios simulados y reales ("sim" y "live" en el identificador), con máscaras y superposición al 75% ("mask__overlay_a75"), lo que apunta a investigación sobre robustez ante oclusiones. No se han publicado resultados de evaluación ni benchmarks, y el modelo se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en pi05 (π₀.₅) de Physical Intelligence; implementación de LeRobot adaptada del repositorio OpenPI; no se documenta la topología interna detallada |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no aplica / no disponible (no se documenta que sea un modelo Mixture-of-Experts) |
| Longitud de contexto | no disponible (no se especifica ventana de contexto para la instrucción de tarea) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; sin variantes GGUF, AWQ, GPTQ o int8 publicadas) |
| Idiomas soportados | no disponible (el modelo no es de lenguaje general; recibe instrucciones de tarea como "basket" o "can") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`; tamano del repositorio 9,4 GB) |

## Arquitectura y entrenamiento

Se trata de un modelo de tipo Vision-Language-Action (VLA) orientado a control robótico, no de un LLM conversacional. Según la model card, π₀.₅ evoluciona π₀ con el objetivo de generalizar a entornos y situaciones completamente nuevos; la implementación disponible aquí es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La información proporcionada no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni el número de tokens de imagen, por lo que no es posible describir la topología interna más allá de su naturaleza multimodal (visión + estado del robot + instrucción textual) y de su salida como vector de acción continuo.

La interfaz de entrada/salida está completamente especificada: entrada de estado `observation.state` con forma `(9,)`, tres flujos visuales `observation.images.agentview`, `observation.images.robot0_eye_in_hand` y `observation.images.robot0_eye_in_hand_2`, cada uno `(3, 224, 224)`, y salida `action` con forma `(7,)`. El ajuste se realizó sobre el dataset `sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live`, compuesto por 200 episodios y 69.392 fotogramas a 20 FPS, con 20 tareas de manipulación de objetos domésticos y de alimentación (basket, boxed food, cake, can, hamburger, lemon, orange, spice, squash, spray, soap dispenser, jam, jar, cereal, knife block, kettle, pear, potato, sweet potato, scone). La configuración de entrenamiento reportada es: 60.000 pasos, batch de 16, AdamW, learning rate 0,00025, semilla 0 y LeRobot 0.6.0. No se documenta el uso de RLHF, DPO ni de una fase de refuerzo; se trata de aprendizaje por imitación supervisado. La nomenclatura del repositorio (`mask`, `overlay_a75`, `all_cameras`, `sim`, `live`) sugiere el uso de máscaras y superposición al 75% sobre todas las cámaras con mezcla de datos simulados y reales, pero este extremo no se confirma explícitamente en la model card.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones de 7 grados de libertad para un robot Franka Panda a partir de observaciones visuales y proprioceptivas.
- Seguimiento de instrucciones de tarea en lenguaje natural: acepta un identificador de tarea (por ejemplo, "basket" o "can") mediante el parámetro `--task` de LeRobot.
- Percepción multivista: procesa simultáneamente una cámara de vista de agente y dos cámaras de muñeca (`eye_in_hand`), lo que permite razonar sobre la escena y sobre la propia pinza.
- Manipulación de objetos domésticos y de alimentación: entrenado explícitamente sobre 20 categorías de objetos (latas, cereales, hervidores, frutas, fiambreras, bloques de cuchillos, etc.).
- Apilamiento y organización de objetos: el prefijo `pile` del dataset de entrenamiento indica tareas de agrupación o apilado.
- Generalización a entornos nuevos: es el objetivo declarado de π₀.₅ frente a π₀, aunque no se aportan evaluaciones que lo cuantifiquen en este repositorio.
- Integración con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y reentrenable con `lerobot-train`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso explícito, agentes, audio, ni generación de texto libre.

## Casos de uso

- Recogida y colocación en entornos de almacén: el modelo puede ejecutar políticas de picking sobre objetos apilados (prefijo `pile`) usando la vista de agente para localizar el objeto y las cámaras de muñeca para el ajuste fino de la pinza.
- Manipulación de productos de supermercado o cocina: al haberse entrenado con categorías concretas (cereal, kettle, jar, can, soap dispenser), es adecuado para tareas de reordenación de estanterías o preparación de bandejas en entornos de retail y food service.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudios de fine-tuning de π₀.₅ con el stack LeRobot 0.6.0, dado que la configuración de entrenamiento (pasos, batch, optimizador, learning rate, semilla) está documentada.
- Estudio de robustez ante oclusiones: el identificador del dataset (`mask__overlay_a75`) sugiere datos aumentados con máscaras y superposición parcial; el checkpoint es útil para medir degradación cuando el objeto queda parcialmente oculto.
- Transferencia sim-to-real: el dataset mezcla episodios simulados y reales (`sim` y `live`), de modo que el modelo puede emplearse para evaluar hasta qué punto una política entrenada con datos híbridos funciona en hardware físico.
- Automatización de recogida con robot Franka Panda en laboratorio: el modelo declara explícitamente `Robot type: Panda`, por lo que es directamente desplegable en ese brazo sin adaptación del espacio de acciones.
- Generación de demostraciones para aumento de datos: ejecutando la política con `--strategy.type=base` se pueden grabar trayectorias que alimenten posteriores ciclos de entrenamiento.
- Evaluación comparativa de configuraciones de aumento visual: al existir un identificador explícito de máscara y nivel de superposición, el checkpoint permite comparar contra variantes del mismo autor con otros valores de `overlay`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye una sección de evaluación vacía con la frase literal "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito por tarea, ni comparaciones con π₀, OpenVLA u otros modelos VLA.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 4.143.404.816 parámetros: aproximadamente 16,6 GB en fp32, 8,3 GB en bf16/fp16, 4,1 GB en int8 y 2,1 GB en int4. Estas cifras son calculos derivados del recuento de parametros, no datos publicados por el autor.
- A la VRAM de pesos hay que sumar las activaciones de los tres flujos de imagen de 224x224 y del decodificador de acciones; no se dispone de mediciones publicadas de consumo real.
- GPU recomendadas (estimacion): NVIDIA A100 40/80 GB, H100 80 GB o L40S para despliegue en servidor; RTX 4090 (24 GB) o RTX 4080 (16 GB) para bf16 en estación de trabajo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 4080, RTX 3090 y similares con al menos 12-16 GB de VRAM en bf16. No se confirma con mediciones.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, que además no son adecuados para un modelo de acciones.
- Latencia y throughput: no disponibles. Como referencia de contexto, el dataset se grabó a 20 FPS, lo que implica que un control fluido exigiría inferencias en el orden de decenas de milisegundos, pero no se publica ninguna cifra de latencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05 fine-tuned, sam-guided-vlas) | 4,14 mil millones | no disponible | sin evaluacion publicada | Apache 2.0 | Hugging Face, libreria LeRobot |
| lerobot/pi05_base (modelo base) | no disponible en la informacion proporcionada | no disponible | sin evaluacion publicada en esta ficha | no disponible en la informacion proporcionada | Hugging Face |
| π₀.₅ original (Physical Intelligence) | no disponible | no disponible | no disponible | no disponible | Blog de Physical Intelligence; implementacion OpenPI |
| π₀ original | no disponible | no disponible | no disponible | no disponible | Repositorio OpenPI |
| Otros VLA (OpenVLA, GR00T N1, RT-2) | no disponibles en la informacion proporcionada | no disponible | no disponible | no disponible | no verificado |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito, ni numero de ensayos, ni condiciones de prueba, por lo que se desconoce el rendimiento real de la politica.
- Acoplamiento fuerte al hardware: el modelo espera un robot Franka Panda, un vector de estado de 9 dimensiones y un vector de accion de 7 dimensiones. Usarlo en otro robot requiere reentrenamiento o adaptacion del espacio de acciones.
- Dependencia de la configuracion de camaras: requiere exactamente tres flujos visuales con los nombres `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`, a 224x224. Nombres o resoluciones distintos rompen la inferencia.
- Dataset pequeno: 200 episodios y 69.392 fotogramas para 20 tareas distintas suponen aproximadamente 10 episodios por tarea, una cobertura muy limitada que favorece el sobreajuste al entorno de recogida.
- Vocabulario de tareas cerrado: las instrucciones se limitan a las 20 etiquetas del dataset; no hay evidencia de generalizacion a ordenes nuevas en lenguaje libre.
- Idiomas: no disponible. Aunque las instrucciones de tarea son cadenas de texto, no se documenta soporte multilingue ni evaluacion en castellano.
- Riesgo de alucinacion y fallo silencioso: como todo modelo de politica entrenado por imitacion, puede generar acciones plausibles pero incorrectas ante objetos o iluminaciones no vistas, sin ninguna senal de incertidumbre.
- Sesgos de dominio: los datos combinan simulacion y realidad con objetos de cocina y supermercado; el comportamiento en entornos industriales, con oclusiones fuertes o con objetos reflectantes o deformables, es desconocido.
- Restricciones de licencia: el repositorio se publica bajo Apache 2.0, pero la model card no aclara las condiciones del modelo base `lerobot/pi05_base` ni las del material de Physical Intelligence del que deriva; conviene verificar la cadena de licencias antes de un uso comercial.
- Sin variantes cuantizadas ni optimizadas publicadas, lo que limita el despliegue en hardware embebido de robot.
- La convencion de nombres (`mask`, `overlay_a75`, `lr5x`) no esta documentada en la model card, por lo que las interpretaciones sobre el preprocesado y la tasa de aprendizaje son inferencias y no hechos confirmados.
- La busqueda web realizada no devolvio informacion tecnica relevante: los resultados corresponden a una serie de television francesa y a un fabricante de utillaje, por lo que no aportan datos verificables sobre el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__lr5x__steps_60k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
- Repositorio OpenPI de Physical Intelligence: mencionado en la model card sin URL explicita; no se incluye el enlace por no poder verificarlo con la informacion proporcionada.

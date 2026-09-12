# castanetnicolas/diffusion_UR5e_BS_32_H_32

## Resumen

`castanetnicolas/diffusion_UR5e_BS_32_H_32` es una política de control visomotor entrenada con Diffusion Policy (paper arXiv:2303.04137) y publicada en Hugging Face mediante la librería LeRobot. Se trata de un modelo de robótica, no de un modelo de lenguaje: consume el estado articular del robot y dos flujos de imagen de 256x256 píxeles, y produce un vector de acción de 7 dimensiones. El repositorio tiene 278.014.919 parámetros (unos 278 M), lo que lo sitúa en el rango de políticas de imitación ligeras, ejecutables en GPU de consumo.

El modelo está entrenado exclusivamente para una tarea concreta sobre un robot Universal Robots UR5e: "Pick up the can and place it in the correct bin." El dataset asociado contiene 100 episodios, 15.042 fotogramas grabados a 20 FPS y dos cámaras. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales, aunque el autor no ha publicado ninguna evaluación en robot real, por lo que la tasa de éxito es desconocida.

Su relevancia es doble. Por un lado, sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot (grabación de datos, entrenamiento, rollout). Por otro, actúa como baseline de políticas generativas basadas en difusión para manipulación con contacto, una familia que compite directamente con alternativas tipo ACT dentro del mismo ecosistema.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de difusión (Diffusion Policy) para control visomotor; red condicionada por observación |
| Parámetros totales | 278.014.919 (278 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el horizonte de predicción de acciones no se documenta (el nombre del repositorio sugiere 32, sin confirmar) |
| Tipos de cuantización | no disponible; los pesos se publican sin variantes cuantizadas |
| Idiomas soportados | no aplica (política robótica visomotora, no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot (versión declarada en el entrenamiento: 0.6.1) |
| Tipo de robot | ur5e (Universal Robots UR5e) |
| Cámaras de entrada | camera1, camera2 |
| Entradas | `observation.state` (9,); `observation.images.camera1` (3, 256, 256); `observation.images.camera2` (3, 256, 256) |
| Salidas | `action` (7,) |
| Tamaño del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, un enfoque que trata el control visomotor como un proceso generativo de difusión. En lugar de predecir una única acción de forma directa, la política aprende a generar trayectorias de acción multim paso y suaves mediante un proceso de eliminación progresiva de ruido, condicionado por las observaciones (estado articular e imágenes). Este diseño está especialmente indicado para tareas de manipulación con contacto rico, donde las políticas deterministas tienden a producir comportamientos inestables o temblorosos. La model card no especifica la variante concreta del backbone de denoising (U-Net temporal 1D frente a arquitecturas basadas en transformer) ni el número de pasos de inferencia empleados, datos que quedan como no disponibles.

El entrenamiento se realizó con LeRobot sobre el dataset `castanetnicolas/UR5e_pick_and_place_CAN_100_delta_joint`: 100 episodios, 15.042 fotogramas, 20 FPS y una única tarea ("Pick up the can and place it in the correct bin."). La configuración declarada es de 100.000 pasos de entrenamiento, batch size 32, optimizador Adam, learning rate 1e-4 y semilla 1000. No se documenta el uso de RLHF, DPO ni ningún proceso de ajuste posterior al entrenamiento supervisado. El nombre del repositorio (`BS_32_H_32`) apunta a batch size 32 y un horizonte de 32 pasos, aunque la model card no confirma explícitamente este segundo dato.

## Capacidades

- Generación de trayectorias de acción continuas de 7 grados de libertad a partir de observaciones visomotrices.
- Control reactivo a partir de dos cámaras RGB de 256x256 píxeles y del estado articular de 9 dimensiones del UR5e.
- Ejecución de la tarea de recogida y colocación de una lata en el contenedor correcto, tal como se define en el dataset de entrenamiento.
- Producción de movimientos suaves y multim paso, característica del muestreo por difusión, adecuada para manipulaciones con contacto.
- Integración con el ecosistema LeRobot mediante `lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento o ajuste fino.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües, visión general, audio ni modo de razonamiento explícito: es una política de control y no un modelo de propósito general.

## Casos de uso

- Recogida y colocación sobre UR5e: el caso para el que fue entrenado. Se ejecuta con `lerobot-rollout`, indicando el puerto del robot, las dos cámaras y la instrucción de tarea; es el uso directo y sin adaptación.
- Ajuste fino para nuevas tareas de manipulación con contacto: partiendo de los pesos publicados, se puede reentrenar con un dataset propio de inserción de piezas, apriete de tornillos o ensamblaje, aprovechando que la política ya ha aprendido dinámicas de agarre.
- Baseline en investigación sobre aprendizaje por imitación: permite comparar políticas generativas por difusión frente a alternativas como ACT sobre el mismo dataset y la misma plataforma, aislando el efecto de la formulación generativa.
- Prototipado de celdas de picking en laboratorio: con 278 M de parámetros y 1,1 GB de pesos, se puede desplegar en una estación con una GPU de gama media para validar un flujo logístico antes de invertir en integración industrial.
- Replicación de pipelines de LeRobot de extremo a extremo: sirve como referencia funcional para validar la instalación, la calibración del UR5e, la sincronización de cámaras a 20 FPS y el ciclo completo de entrenamiento.
- Estudio de robustez ante variaciones de entorno: al ser un modelo pequeño y entrenado con 100 episodios, es un caso útil para medir la degradación frente a cambios de iluminación, posición de la pieza o fondo, y para cuantificar cuántos datos adicionales hacen falta.
- Docencia y formación en robótica: el par modelo-dataset es un ejemplo autocontenido y de licencia permisiva para enseñar aprendizaje por imitación sin depender de pesos propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente que no se han proporcionado resultados de evaluación: la tabla de éxito por tarea aparece vacía y el repositorio no incluye vídeos ni métricas de robot real. La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo. Por tanto, la tasa de éxito, la robustez y la latencia real quedan sin cuantificar.

## Requisitos de hardware

- Pesos en precisión completa: 278 M de parámetros en fp32 equivalen a aproximadamente 1,1 GB, coherente con el tamaño del repositorio. La VRAM para pesos es de unos 1,2 GB.
- VRAM estimada para inferencia: entre 2 y 4 GB en fp32, considerando las activaciones de dos imágenes de 3x256x256 y el proceso iterativo de difusión. Con autocast a fp16 o bf16 la horquilla práctica baja a unos 1,5-2,5 GB. Son estimaciones orientativas, no medidas publicadas.
- GPU recomendadas: cualquier GPU NVIDIA con 4 GB o más para inferencia; RTX 3060, RTX 4060, RTX 4070 y RTX 4090 son suficientes. Para entrenamiento o ajuste fino con 100.000 pasos conviene una RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquiera con al menos 4 GB de VRAM, incluidas RTX 3050 y T4. También puede ejecutarse en CPU, aunque con latencia muy superior.
- Opciones de despliegue: `lerobot-rollout` sobre PyTorch es la vía documentada. El repositorio no incluye exportación a ONNX, TensorRT ni versiones GGUF. Las herramientas habituales para LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este modelo.
- Latencia y throughput: no disponibles. Hay que tener en cuenta que el dataset fue grabado a 20 FPS, lo que implica un periodo de control de 50 ms; una política de difusión requiere varios pasos de denoising por cada bloque de acciones, y el número de pasos no se documenta. Cumplir 20 FPS en tiempo real exige GPU y una integración cuidadosa.

## Comparativa con modelos similares

| Modelo | Categoría | Parámetros | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| diffusion_UR5e_BS_32_H_32 | Diffusion Policy | 278 M | Apache-2.0 | Hugging Face, vía LeRobot | Sin resultados publicados |
| ACT (política incluida en LeRobot) | Transformer con action chunking | no disponible en la información consultada | Apache-2.0 (licencia de la librería LeRobot) | Incluida en LeRobot | no disponible |
| SmolVLA | Modelo visión-lenguaje-acción | no disponible en la información consultada | no disponible en la información consultada | Hugging Face, vía LeRobot | no disponible |
| Políticas VLA tipo pi0 / openpi | Modelo visión-lenguaje-acción | no disponible en la información consultada | no disponible en la información consultada | Publicadas por sus autores | no disponible |

La comparación cuantitativa no es posible con los datos disponibles: no se han publicado métricas de éxito para este modelo y la información consultada no aporta cifras verificables de las alternativas. Cualitativamente, la diferencia clave es que este modelo es una política visomotora de 278 M parámetros especializada en una única tarea, mientras que las alternativas VLA incorporan comprensión de instrucciones en lenguaje natural a costa de un tamaño y unos requisitos de cómputo muy superiores.

## Limitaciones y advertencias

- Especialización extrema: está entrenado para una sola tarea sobre un UR5e con dos cámaras concretas. Fuera de esa configuración no hay ninguna garantía de funcionamiento.
- Sin evaluación publicada: no existe tasa de éxito, número de ensayos ni análisis de fallos. No debería desplegarse en producción sin una validación propia en robot real.
- Dataset reducido: 100 episodios y 15.042 fotogramas, con una única tarea. Es probable que exista sobreajuste al entorno de grabación y poca variedad en posiciones, iluminación y distractores.
- Sensibilidad a la percepción: los nombres de cámara (`camera1`, `camera2`), la resolución de 256x256 y la calibración deben coincidir con los del entrenamiento. Cualquier cambio de montaje, iluminación o fondo degrada el comportamiento.
- Sin comprensión de lenguaje: la cadena de tarea es fija y no se interpreta semánticamente; el modelo no puede recibir instrucciones nuevas en lenguaje natural.
- Riesgo de alucinación en el sentido de acciones fuera de distribución: ante estados no vistos, la política puede generar trayectorias erráticas. En un brazo robótico real esto implica riesgo físico.
- Requisitos de seguridad en producción: es imprescindible limitar velocidades y fuerzas en el controlador del UR5e, definir zonas de trabajo y disponer de parada de emergencia. El modelo no incorpora ninguna capa de seguridad.
- Dependencia de la librería: está atado a LeRobot 0.6.1 y a la interfaz de `lerobot-rollout`; cambios de versión pueden requerir adaptaciones.
- Licencia permisiva pero sin garantías: Apache-2.0 permite uso comercial, modificación y redistribución, con la obligación habitual de conservar avisos de licencia. El modelo se entrega "tal cual", sin garantía de idoneidad.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que refuerza la necesidad de evaluarlo por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_32
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/UR5e_pick_and_place_CAN_100_delta_joint
- Visualizador del dataset (Space de LeRobot): https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/UR5e_pick_and_place_CAN_100_delta_joint
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.

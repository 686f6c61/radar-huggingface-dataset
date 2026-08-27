# learner1119/act_vine2_real_200

## Resumen

El modelo `learner1119/act_vine2_real_200` es una política de aprendizaje por imitación basada en la arquitectura Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Desarrollado por el usuario learner1119, este modelo está diseñado para controlar robots manipuladores a partir de datos de teleoperación, prediciendo secuencias de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la precisión del control.

El modelo ha sido entrenado sobre el dataset `EndeavoringYoon/VINE2_real_200`, que contiene 200 episodios de teleoperación real, y se distribuye bajo licencia Apache-2.0. Con 51,6 millones de parámetros, es una política ligera que puede ejecutarse en hardware de gama media e incluso en sistemas embebidos con GPU. Su relevancia radica en ser un ejemplo práctico de aplicación de ACT a un dataset real de manipulación robótica, accesible para investigación y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.621.512 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32 por defecto en LeRobot) |
| Idiomas soportados | no disponible (no aplica; es un modelo de control robotico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que emplea un transformer encoder-decoder para predecir bloques de acciones (chunks) de longitud fija, en lugar de predecir una sola accion por paso de tiempo. La arquitectura usa un encoder de vision (tipicamente ResNet) para procesar observaciones de camaras y un decoder autoregresivo que genera el chunk de acciones. Este enfoque reduce la acumulacion de errores y mejora la estabilidad del control en tareas de manipulacion.

El entrenamiento se realizo con LeRobot sobre el dataset `EndeavoringYoon/VINE2_real_200`, que contiene 200 episodios de teleoperacion real. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo se publico con un unico checkpoint y el entrenamiento se llevo a cabo con la configuracion por defecto de LeRobot para ACT.

## Capacidades

- Control de robots manipuladores mediante aprendizaje por imitacion.
- Prediccion de chunks de acciones (action chunking) para ejecucion suave y precisa.
- Procesamiento de observaciones visuales y de estado del robot (joint positions, etc.).
- Capacidad de ejecutar tareas de manipulacion aprendidas de teleoperacion (por ejemplo, pick and place, ensamblaje, tareas de precision).
- Integracion nativa con LeRobot para entrenamiento, evaluacion y despliegue.
- No soporta tool calling, agentes conversacionales, ni generacion de texto.

## Casos de uso

- **Manipulacion robotica en entornos de investigacion**: el modelo puede controlar un robot SO-100 u otro brazo compatible con LeRobot para ejecutar tareas de pick and place o ensamblaje aprendidas de demostraciones teleoperadas.
- **Desarrollo de politicas de control para robots de bajo coste**: con solo 51M de parametros, se puede ejecutar en hardware economico (Raspberry Pi con acelerador, Nvidia Jetson) para prototipado rapido.
- **Evaluacion de metodos de imitacion en datos reales**: al estar entrenado sobre datos reales (VINE2), sirve como punto de partida para comparar el rendimiento de ACT frente a otros metodos (Diffusion Policy, etc.) en el mismo dataset.
- **Generacion de datos de entrenamiento para simulacion**: las acciones generadas por el modelo pueden usarse para poblizar simuladores con comportamientos realistas.
- **Benchmark para investigacion en action chunking**: util para estudiar el efecto de la longitud del chunk, la frecuencia de control, o la robustez frente a perturbaciones en la observacion.
- **Despliegue en robots de telepresencia**: puede integrarse en sistemas de teleoperacion asistida, donde el modelo propone acciones que el operador humano puede corregir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito (success rate) ni comparaciones con otros modelos en el dataset VINE2.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 51,6M de parametros y pesos en fp32, la inferencia requiere aproximadamente 206 MB de VRAM (51,6M × 4 bytes). Con cuantizacion fp16 o int8, se reduce a 103 MB o 52 MB respectivamente.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente. Tarjetas como NVIDIA RTX 3060, RTX 4060, o incluso integradas con soporte CUDA pueden ejecutar el modelo.
- **Consumer GPU**: si cabe en GPUs de consumo. Un Nvidia Jetson Orin Nano (8 GB) o una GTX 1650 (4 GB) pueden ejecutar la inferencia.
- **Opciones de despliegue**: LeRobot permite ejecutar la politica en local con `lerobot-record` o `lerobot-eval`. Tambien se puede exportar a ONNX o TensorRT para acelerar la inferencia en edge devices.
- **Latencia y throughput**: no disponible. Se espera que la inferencia sea muy rapida (menos de 10 ms por chunk) en GPU modernas, dado el tamano del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Dataset de entrenamiento | Licencia | Contexto |
|---|---|---|---|---|---|
| **ACT (este modelo)** | 51,6M | Transformer encoder-decoder | VINE2_real_200 | Apache-2.0 | No aplica |
| **Diffusion Policy (Chi et al., 2023)** | ~10-100M | Diffusion model sobre acciones | Varios (simulacion y real) | MIT (codigo) | No aplica |
| **RT-1 (Brohan et al., 2022)** | 35M | Transformer decoder | 130k episodios reales | No open source | No aplica |

Los modelos comparables son otras politicas de aprendizaje por imitacion para robotica. ACT se distingue por su arquitectura transformer con action chunking, mientras que Diffusion Policy usa un proceso de denoising para generar acciones y RT-1 es un modelo propietario de Google. Este modelo tiene una licencia mas permisiva (Apache-2.0) que RT-1.

## Limitaciones y advertencias

- **Dependencia del dataset**: el rendimiento depende fuertemente de la calidad y diversidad de los datos de teleoperacion (VINE2_real_200). Si el dataset tiene sesgos (pocas variaciones de posturas o de objetos), el modelo no generalizara bien.
- **Riesgo de sobreajuste**: al entrenarse solo con 200 episodios, existe un riesgo de sobreajuste a las condiciones de la teleoperacion (posicion de la camara, iluminacion, etc.).
- **Alucinacion de acciones**: como todo modelo de imitacion, puede producir acciones incorrectas o inestables en situaciones fuera de la distribucion de entrenamiento.
- **Sin capacidades de lenguaje**: no procesa instrucciones textuales ni soporta interaccion conversacional.
- **Licencia Apache-2.0**: permite uso comercial, pero es responsabilidad del usuario verificar la licencia del dataset `VINE2_real_200` (si aplica).
- **No hay informacion sobre el hardware de entrenamiento**: se desconoce si el entrenamiento fue reproducible con los mismos hiperparametros por defecto de LeRobot.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/learner1119/act_vine2_real_200)
- [Dataset de entrenamiento VINE2_real_200](https://huggingface.co/datasets/EndeavoringYoon/VINE2_real_200)
- [Dataset relacionado VINE2_poc_2022](https://huggingface.co/datasets/learner1119/VINE2_poc_2022/tree/main)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Documentacion de LeRobot para entrenar politicas](https://huggingface.co/docs/lerobot/index)
- [Repositorio MolmoAct2 (referencia de otro proyecto de robotica)](https://github.com/allenai/molmoact2)

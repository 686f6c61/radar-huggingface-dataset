# AgathiKari/act_epesee_model

## Resumen

AgathiKari/act_epesee_model es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje automático aplicado a robótica real, y se distribuye como un checkpoint de 51,7 millones de parámetros en formato safetensors bajo licencia Apache 2.0.

El modelo resuelve una tarea concreta de manipulación sobre un brazo robótico de tipo `so_follower` (familia SO-100/SO-101), usando dos cámaras de entrada (`top` y `wrist`) y un vector de estado articular de 6 dimensiones. Fue entrenado sobre el dataset KinanALI/epesee, compuesto por 30 episodios teleoperados, 8.955 fotogramas a 30 FPS y una única tarea etiquetada como "0".

Su relevancia es doble: por un lado, demuestra el flujo completo de entrenamiento de políticas con LeRobot 0.6.2; por otro, sirve como punto de partida reproducible para quien quiera replicar el método ACT en hardware de bajo coste. No es un modelo de lenguaje ni un modelo multimodal general, sino una política visomotora especializada sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): codificador-decodificador transformer con CVAE y extractores visuales ResNet |
| Parametros totales | 51.668.614 (aproximadamente 51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; la politica consume una observacion por paso) |
| Tipos de cuantizacion | no disponible (pesos safetensors; LeRobot ejecuta en fp32 y admite `--policy.device=cpu` o `cuda`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; solo procesa el campo de tarea como cadena) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.2 |
| Pipeline | robotics |
| Tipo de robot | `so_follower` (brazo SO-100/SO-101) |
| Camaras de entrada | `top` (3, 360, 640) y `wrist` (3, 480, 640) |
| Entrada de estado | `observation.state` con forma (6,) |
| Salida | `action` con forma (6,) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-03 |
| Ultima actualizacion | 2026-10-03 |

## Arquitectura y entrenamiento

ACT se formula como un autoencoder variacional condicional (CVAE) con columna vertebral transformer. La política recibe las imágenes de las dos cámaras y el vector de estado articular, extrae características visuales mediante codificadores ResNet y las proyecta junto con el estado a un transformer codificador. Un decodificador transformer genera entonces un fragmento (chunk) de acciones futuras en lugar de una sola acción, lo que reduce el error de composición y mejora la estabilidad frente a perturbaciones. En inferencia, el método original combina los chunks solapados mediante ensamblado temporal, aunque el tamaño de chunk y la configuración exacta de inferencia no se detallan en la información proporcionada. El paper de referencia es arXiv:2304.13705.

El entrenamiento se realizó íntegramente en modo aprendizaje por imitación sobre datos teleoperados, sin indicios de RLHF ni DPO (no aplican a este dominio). La configuración declarada en la model card es: 25.000 pasos de entrenamiento, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000, todo con LeRobot 0.6.2. El dataset KinanALI/epesee contiene 30 episodios y 8.955 fotogramas a 30 FPS, con una única etiqueta de tarea ("0"), lo que supone un conjunto de entrenamiento muy reducido y de un solo comportamiento.

## Capacidades

- Generacion de comandos de accion de 6 grados de libertad a partir de observaciones visuales y de estado articular.
- Prediccion de fragmentos de acciones (action chunking), en lugar de un unico paso, para tareas de manipulacion fina.
- Fusion multimodal de dos flujos de imagen (`top` y `wrist`) con el vector de estado del robot.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas; no requiere modelado del entorno ni recompensas.
- Ejecucion en bucle cerrado sobre el brazo `so_follower` a 30 FPS de captura.
- Condicionamiento por tarea mediante el campo `task`, aunque en este checkpoint solo existe la etiqueta "0".
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje natural ni agentes conversacionales.
- No dispone de capacidades multilingues ni de generacion de texto.
- No se ha documentado modo "thinking", entrada de audio ni vision general fuera del dominio de la tarea entrenada.

## Casos de uso

- Reproduccion de un experimento ACT de referencia: sirve para validar una instalacion de LeRobot 0.6.2 y comprobar que el pipeline `lerobot-rollout` funciona con un brazo `so_follower` y dos camaras.
- Punto de partida para fine-tuning: al ser un checkpoint Apache 2.0 con tan solo 51,7 M de parametros, se puede reentrenar con un dataset propio y comparar curvas de aprendizaje contra este baseline.
- Manipulacion de objetos en laboratorio docente: la tarea "0" y las 30 demostraciones permiten montar una practica de aprendizaje por imitacion en robótica de bajo coste.
- Investigacion en generalizacion con pocos datos: el modelo es un caso extremo de entrenamiento sobre 8.955 fotogramas, util para estudiar sobreajuste y sensibilidad a la posicion de objetos.
- Evaluacion de robustez frente a cambios de iluminacion o distractores: al ser una politica puramente visomotora, permite medir la degradacion al variar el entorno sin reentrenar.
- Integracion en pipelines de recogida de datos: puede usarse como politica base en `--strategy.type=base` para grabar episodios de rollout y ampliar el dataset original.
- Benchmark interno de latencia: por su tamano reducido, es util para medir el coste de inferencia de ACT en CPU, GPU de consumo o Jetson antes de escalar a politicas mayores, como SmolVLA o pi0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real para esta politica ("No evaluation results have been provided for this policy yet") y que la tabla de exito por tarea esta vacia. Por tanto, no se dispone de tasas de exito, MMLU, HumanEval, GSM8K ni de ninguna otra metrica comparable.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 207 MB en fp32 y 103 MB en fp16/bf16, calculado a partir de los 51,7 M de parametros.
- VRAM total en inferencia: inferior a 1 GB en la mayoria de configuraciones, incluyendo activaciones de los dos flujos de imagen; no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente. No se necesita A100 ni H100.
- GPU de consumo: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y en GPUs integradas con soporte CUDA o ROCm.
- CPU: el modelo es lo bastante pequeno para ejecutarse en CPU, aunque a 30 FPS el rendimiento dependera del preprocesado de imagen; no se han publicado cifras de latencia.
- Plataformas embebidas: candidato razonable para Jetson Orin Nano o similares, sin datos oficiales de throughput.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con ` --policy.path=AgathiKari/act_epesee_model`; el resto de runtimes (vLLM, llama.cpp, Ollama, TGI) no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AgathiKari/act_epesee_model (ACT) | 51,7 M | no aplica | apache-2.0 | Hugging Face, via LeRobot | Entrenado sobre 30 episodios y 8.955 fotogramas, robot `so_follower` |
| ACT de referencia (Zhao et al., 2023) | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | paper arXiv:2304.13705 e implementacion en LeRobot | Metodo original con entrenamiento bimanual y chunking de acciones |
| Diffusion Policy (Chi et al., 2023) | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | implementacion disponible en LeRobot | Alternativa generativa basada en difusion, tambien de aprendizaje por imitacion |
| SmolVLA (Hugging Face) | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | Hugging Face, via LeRobot | Politica vision-lenguaje-accion de proposito general, de mayor tamano que ACT |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. Al entrenarse sobre 30 episodios de un unico operador y una unica tarea, es previsible un fuerte sesgo hacia las posiciones, iluminacion y objetos vistos durante la teleoperacion.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de predicciones de accion incorrectas fuera de la distribucion de entrenamiento, sin ninguna senal de confianza asociada.
- Limitaciones de contexto: no hay ventana de contexto en el sentido de los modelos de lenguaje; la politica solo observa el estado actual y las dos imagenes.
- Limitaciones de idioma: no procesa lenguaje natural. El campo `task` debe coincidir con la etiqueta usada en entrenamiento ("0").
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se cite adecuadamente. No se identifican clausulas adicionales.
- Cero evaluaciones publicadas: no hay tasas de exito ni validacion en robot real, por lo que no se recomienda su uso en produccion sin una evaluacion propia.
- Dataset muy reducido: 8.955 fotogramas y una sola tarea limitan la generalizacion a objetos nuevos, posiciones no vistas o cambios de camara.
- Dependencia de hardware: la politica esta calibrada para un `so_follower` con camaras `top` y `wrist`; cambiar la cinematica, la camara o la frecuencia de control invalida las predicciones.
- Requisitos de coincidencia de nombres: los nombres de las camaras deben coincidir exactamente con las claves de observacion del entrenamiento, o el rollout fallara.
- Sin datos de robustez: se desconoce el comportamiento ante oclusiones, cambios de iluminacion o presencia de distractores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AgathiKari/act_epesee_model
- Dataset de entrenamiento: https://huggingface.co/datasets/KinanALI/epesee
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=KinanALI/epesee

# rsundaraws/act_arm1_wristonly

## Resumen

`rsundaraws/act_arm1_wristonly` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario rsundaraws en Hugging Face Hub y está empaquetado con la librería LeRobot de Hugging Face, lo que permite ejecutarlo directamente sobre un robot SO-101 (`so_follower`) con una única cámara de muñeca.

El modelo resuelve una tarea concreta: recoger un cubo y colocarlo en una caja naranja ("Pick up the cube and place it in the orange box"). Se entrenó sobre el dataset `rsundaraws/so101_arm1_fixedspot_wrist`, compuesto por 52 episodios y 19.305 fotogramas a 30 FPS capturados mediante teleoperación. La entrada combina el estado de las articulaciones (vector de 6 dimensiones) con una imagen RGB de 480x640 de la cámara de muñeca, y la salida es un vector de acción de 6 dimensiones.

Es relevante como ejemplo práctico y reproducible de un pipeline completo de aprendizaje por imitación en robótica de bajo coste: un modelo pequeño (51,7 millones de parámetros, 0,2 GB de repositorio) que cabe en cualquier GPU consumer y que se puede desplegar con un único comando de LeRobot. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un controlador visual-motor especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de un frame más estado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un codificador visual (procesa la imagen de la cámara de muñeca de 3x480x640) con un transformer que fusiona la representación visual y el estado de las articulaciones (6 dimensiones) para predecir un chunk de acciones futuras de 6 dimensiones. Predecir chunks en lugar de acciones individuales reduce el error de acumulación y mejora la estabilidad del control, a costa de una latencia de reacción algo mayor.

El entrenamiento se realizó con LeRobot 0.6.1 durante 30.000 pasos, con batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 1000. El dataset de entrenamiento contiene 52 episodios y 19.305 fotogramas a 30 FPS de una única tarea de pick-and-place sobre un robot SO-101 con una sola cámara de muñeca. No se documenta en la model card el uso de RLHF, DPO ni aumentos de datos; es aprendizaje supervisado por imitación puro a partir de demostraciones teleoperadas.

## Capacidades

- Control visual-motor de un brazo robótico SO-101 (`so_follower`) con una cámara de muñeca.
- Predicción de chunks de acción de 6 dimensiones a partir de estado de 6 dimensiones e imagen RGB de 480x640.
- Ejecución de la tarea específica de recoger un cubo y depositarlo en una caja naranja.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni generación de texto.
- No tiene capacidades multilingües ni de visión general: la cámara se usa exclusivamente como entrada de control.
- No dispone de modo "thinking", audio ni otras modalidades.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de recoger un cubo y colocarlo en una caja naranja sobre un SO-101, útil como banco de pruebas reproducible para comparar métodos de imitación.
- Prototipado rápido de políticas con LeRobot: sirve como referencia de un pipeline completo (grabación de datos, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) para equipos que se inician en robótica de imitación.
- Docencia y formación: su tamaño reducido (51,7 M de parámetros) y su licencia Apache 2.0 permiten usarlo en cursos y talleres sin restricciones de coste ni de licencia.
- Validación de hardware SO-101: permite verificar la calibración de articulaciones y de la cámara de muñeca ejecutando una política conocida antes de entrenar políticas propias.
- Base para fine-tuning en tareas similares: al ser un checkpoint ACT sobre un robot SO-101, se puede reentrenar con un dataset propio de otra tarea de manipulación con la misma morfología.
- Investigación en aprendizaje por imitación: sirve como línea base para comparar variantes de ACT, cambios en el número de cámaras o en la frecuencia de control.
- Demostraciones de bajo coste: al caber en una GPU consumer, permite montar demos en ferias o presentaciones con hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"), por lo que no hay tasas de éxito, ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros y pesos en safetensors, la política cabe holgadamente en cualquier GPU con 4 GB o más, e incluso es viable en CPU para pruebas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100). Para entrenamiento, una RTX 4090 o superior acelera los 30.000 pasos, pero el modelo es lo bastante pequeño para entrenar en GPUs de gama media.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=rsundaraws/act_arm1_wristonly`), y entrenamiento con `lerobot-train --policy.type=act`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de control está ligada a los 30 FPS del dataset y a la latencia del bucle de inferencia en el robot; no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rsundaraws/act_arm1_wristonly | 51,7 M | estado (6,) + imagen 3x480x640 | pick-and-place SO-101 con cámara de muñeca | Apache 2.0 | Hugging Face Hub, LeRobot |
| Políticas ACT genéricas de LeRobot | variable | variable según dataset | tareas de manipulación diversas | normalmente Apache 2.0 | Hugging Face Hub |
| Políticas Diffusion Policy (LeRobot) | variable | estado + imágenes | manipulación por imitación | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, entradas, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("Pick up the cube and place it in the orange box") y un único robot SO-101; no generaliza a otras tareas ni morfologías sin reentrenamiento.
- Dependencia de la cámara de muñeca: solo usa la cámara `wrist`; cambios de iluminación, oclusiones o posición de cámara pueden degradar el rendimiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Dataset pequeño: 52 episodios y 19.305 fotogramas son una base limitada; es probable sobreajuste a las posiciones y condiciones de las demostraciones.
- Sin capacidades de lenguaje ni razonamiento: no sirve para tareas de texto, código, matemáticas ni agentes.
- Riesgo de alucinación en el sentido de acciones fuera de distribución: ante estados no vistos, la política puede generar comandos incorrectos sin señal de incertidumbre.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; para producción conviene validar el modelo en el hardware objetivo.
- Idiomas: no aplica; no es un modelo lingüístico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rsundaraws/act_arm1_wristonly
- Dataset de entrenamiento: https://huggingface.co/datasets/rsundaraws/so101_arm1_fixedspot_wrist
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rsundaraws/so101_arm1_fixedspot_wrist

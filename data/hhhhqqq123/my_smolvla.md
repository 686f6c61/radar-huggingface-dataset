# Hhhhqqq123/my_smolvla

## Resumen

`my_smolvla` es un ajuste fino (fine-tuning) del modelo vision-lenguaje-acción SmolVLA, desarrollado por el usuario Hhhhqqq123 sobre el checkpoint base `lerobot/smolvla_base` publicado por Hugging Face. SmolVLA es una política compacta y eficiente que combina percepción visual y comprensión del lenguaje para generar acciones motoras directamente, diseñada para ejecutarse en hardware de consumo. Este repositorio concreto especializa el modelo base para una única tarea de manipulación robótica sobre un brazo SO-100: recoger un cubo y colocarlo en una caja.

El modelo resuelve el problema de controlar un robot de bajo coste mediante imitación (imitation learning), procesando dos flujos de cámara (vista superior y vista de muñeca) junto con el estado articular del robot para producir comandos de acción de 6 dimensiones. Con 450 millones de parámetros y un tamaño de repositorio de 1,6 GB, es un modelo notablemente ligero en comparación con los VLA de gran escala, lo que lo hace desplegable en GPUs de consumo.

Es relevante ahora porque forma parte del ecosistema LeRobot, que está democratizando la robótica de aprendizaje automático en tiempo real, y porque el paper de SmolVLA (arXiv:2506.01844) propone una arquitectura eficiente que alcanza rendimiento competitivo con un coste computacional reducido. Este ajuste concreto, sin embargo, es un experimento de entrenamiento muy corto (100 pasos) y sin evaluación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, SmolVLA (detalles internos de la arquitectura no disponibles en la informacion proporcionada) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-lenguaje-acción que, segun el paper referenciado (arXiv:2506.01844), busca rendimiento competitivo con costes computacionales reducidos y despliegue en hardware de consumo. La model card de este repositorio no detalla la arquitectura interna (tipo de transformer, mecanismos de atención, encoder visual o fusion multimodal), por lo que esos detalles no estan disponibles en la informacion proporcionada. La politica consume tres entradas: el estado de las articulaciones (`observation.state`, vector de 6 dimensiones) y dos imagenes RGB de 480x640 procedentes de las camaras `top` y `wrist`; produce como salida un vector de accion de 6 dimensiones.

El entrenamiento se realizo mediante ajuste fino desde `lerobot/smolvla_base` con la libreria LeRobot 0.7.1. La configuracion es extremadamente breve: 100 pasos de entrenamiento, batch size 1, optimizador AdamW, learning rate 1e-4 y semilla 1000. El dataset `lerobot/svla_so100_pickplace` contiene 50 episodios y 19.631 fotogramas a 30 FPS para una unica tarea ("Pick up the cube and place it in the box."). No se especifica si hubo RLHF, DPO ni innovaciones tecnicas adicionales en este ajuste concreto.

## Capacidades

- Generacion de acciones motoras para un brazo robotico SO-100 a partir de observaciones visuales y de estado articular.
- Percepcion visual multimodal con dos camaras simultaneas (vista superior y vista de muñeca).
- Ejecucion de una tarea especifica de pick-and-place: recoger un cubo y depositarlo en una caja.
- Control de imitacion (imitation learning) entrenado sobre demostraciones humanas.
- Integracion con el ecosistema LeRobot para rollout y entrenamiento mediante CLI (`lerobot-rollout`, `lerobot-train`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, thinking mode, vision general o audio en la informacion proporcionada.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo ejecuta la tarea de recoger un cubo y colocarlo en una caja sobre un SO-100, sirviendo como referencia reproducible para validar pipelines de imitacion con LeRobot.
- Prototipado de politicas VLA en hardware de bajo coste: al tener 450 M de parametros, permite iterar rapidamente en una estacion de trabajo con GPU de consumo antes de escalar a modelos mayores.
- Docencia y formacion en robotica de aprendizaje: el flujo completo (grabar dataset, entrenar con `lerobot-train`, desplegar con `lerobot-rollout`) es un ejemplo didactico de extremo a extremo para estudiantes.
- Base para ajustes finos adicionales: el checkpoint puede reutilizarse como punto de partida para nuevas tareas sobre el mismo robot, cambiando el dataset de demostraciones.
- Pruebas de integracion del stack LeRobot: sirve para verificar la configuracion de camaras, puertos y calibracion del robot antes de entrenamientos mas largos.
- Benchmark interno de recogida de datos: con solo 50 episodios y 19.631 fotogramas, es util para medir cuanto rendimiento se obtiene con un presupuesto de datos minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en robot real ni de metricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 450 M de parametros en safetensors, el peso en precision completa ronda los 1,8 GB (FP32) y aproximadamente 0,9 GB en FP16/BF16, mas el coste de los dos flujos de imagen de 480x640.
- GPU recomendadas: no especificadas en la informacion proporcionada. El paper de SmolVLA indica despliegue en hardware de consumo, pero no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido del modelo, aunque no hay confirmacion oficial en la model card.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion en robot y `lerobot-train` para reentrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica robotica.
- Latencia y throughput: no disponibles. La captura de datos se realiza a 30 FPS, pero no se documenta la frecuencia de inferencia alcanzable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hhhhqqq123/my_smolvla` | 450 M | no disponible | Pick-and-place SO-100 | apache-2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible | no disponible | VLA generalista (base) | no disponible | Hugging Face |
| `lerobot/svla_so100_pickplace` (dataset) | no aplica | no aplica | Datos de demostracion | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Entrenamiento extremadamente corto: 100 pasos con batch size 1 sobre 50 episodios; es altamente probable que el modelo no haya convergido y su rendimiento real sea limitado.
- Sin evaluacion publicada: no hay tasas de exito en robot real, por lo que no se puede afirmar que la politica funcione de forma fiable.
- Especificidad total a una tarea y un robot: solo funciona con el brazo SO-100, las camaras `top` y `wrist` en las posiciones entrenadas y la instruccion exacta de pick-and-place.
- Sensibilidad al entorno: cambios de iluminacion, posiciones de objetos, distracciones o un robot distinto del mismo tipo pueden degradar el comportamiento (la propia plantilla de la model card advierte de estos factores).
- Riesgo de alucinacion y comportamientos erroneos: como politica de imitacion con datos escasos, puede generar acciones fuera de distribucion sin senal de incertidumbre.
- Sesgos: no documentados, pero el dataset de 50 episodios refleja una unica configuracion fisica y puede no generalizar.
- Licencia apache-2.0: permite uso comercial, pero la ausencia de evaluacion hace arriesgado desplegarlo en produccion sin validacion propia.
- Idiomas: no aplica en el sentido conversacional; la unica instruccion de tarea esta en ingles ("Pick up the cube and place it in the box.").
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso ni validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hhhhqqq123/my_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/svla_so100_pickplace
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/svla_so100_pickplace
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference

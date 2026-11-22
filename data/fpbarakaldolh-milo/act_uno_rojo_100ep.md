# FPBarakaldolh-milo/act_uno_rojo_100ep

## Resumen

`act_uno_rojo_100ep` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705, y empaquetada con la librería LeRobot de Hugging Face. El modelo lo ha publicado el usuario FPBarakaldolh-milo y está asociado al dataset de teleoperación `uno_rojo_con_azules`, compuesto por 100 episodios y 46.344 fotogramas a 30 FPS. No es un modelo de lenguaje: es un controlador visuomotor que, a partir del estado articular y de dos cámaras, predice comandos de acción para un robot tipo `so_follower`.

La arquitectura subyacente es un transformer codificador-decodificador con cabezal de predicción de *chunks* de acciones (secuencias cortas de comandos en lugar de pasos individuales), lo que mitiga el error de composición típico de las políticas de imitación paso a paso. El checkpoint contiene 51.668.614 parámetros y ocupa 0,2 GB en formato safetensors. La entrada son 6 dimensiones de estado más dos imágenes RGB de 480x640, y la salida son 6 dimensiones de acción.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible del flujo de entrenamiento y despliegue de LeRobot sobre un robot de bajo coste (SO-100/SO-101), y como referencia para quien quiera entrenar su propia política ACT con un dataset propio. No hay resultados de evaluación en robot real publicados en la model card, por lo que su rendimiento efectivo en la tarea "uno_rojo_con_azules" no está cuantificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer codificador-decodificador con predicción de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consume observaciones por paso, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/cuanto publicadas) |
| Idiomas soportados | no disponible (modelo visuomotor, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras de entrada | `Satelital`, `Lerobot` (3x480x640 cada una) |
| Dimension de estado | 6 |
| Dimension de accion | 6 |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot (version 0.7.1 durante el entrenamiento) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice *chunks* de acciones: en cada paso de inferencia el modelo emite una secuencia corta de comandos futuros en lugar de un único vector de acción. La arquitectura combina un codificador visual (procesa las dos cámaras de 480x640), un codificador del estado articular de 6 dimensiones y un transformer codificador-decodificador que genera el chunk de acciones. Esta formulación reduce el error acumulado por composición de políticas y mejora la estabilidad en tareas de manipulación fina.

El entrenamiento se realizó sobre el dataset `FPBarakaldolh-milo/uno_rojo_con_azules` (100 episodios, 46.344 fotogramas, 30 FPS, tarea "uno_rojo_con_azules"), con 20.000 pasos, batch de 16, optimizador AdamW, learning rate 2e-05 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni fases de refinamiento posteriores; es aprendizaje supervisado puro sobre demostraciones teleoperadas. Tampoco se detalla la composición exacta del dataset (variabilidad de posiciones, iluminación o distractores), dato relevante para estimar la generalización de la política.

## Capacidades

- Control visuomotor de un robot `so_follower` a partir de dos cámaras RGB y el estado articular.
- Predicción de chunks de acciones de 6 dimensiones, adecuada para control continuo a 30 FPS.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere modelado explícito del entorno).
- Ejecución autónoma de la tarea "uno_rojo_con_azules" mediante el comando `lerobot-rollout`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni generación de texto.
- No tiene capacidades multilingües, de visión general, audio ni modo *thinking*.
- Reentrenable con `lerobot-train` sobre datasets propios en el ecosistema LeRobot.

## Casos de uso

- **Reproducción del flujo LeRobot de extremo a extremo**: sirve como plantilla para validar la instalación, grabación de datos, entrenamiento y despliegue con `lerobot-rollout` en un robot SO-100/SO-101 antes de abordar tareas propias.
- **Manipulación de objetos rojos con azules en entorno controlado**: la política está entrenada específicamente para la tarea "uno_rojo_con_azules"; puede usarse en demostraciones de laboratorio o aulas donde el montaje coincida con el del dataset.
- **Docencia en aprendizaje por imitación**: el modelo permite ilustrar el método ACT, el efecto del *action chunking* y el impacto del número de episodios (100) en el comportamiento de la política.
- **Punto de partida para *fine-tuning* con datos propios**: al estar en formato LeRobot, se puede reentrenar con `lerobot-train` sobre un dataset del mismo robot y tipo de cámaras para adaptar la política a una tarea nueva.
- **Pruebas de integración hardware-software**: útil para depurar puertos, índices de cámara y calibración del robot `so_follower` con una política ya entrenada, sin tener que entrenar una desde cero.
- **Evaluación comparativa de políticas ACT**: sirve como referencia base para comparar éxito y estabilidad frente a otras políticas (Diffusion Policy, VQ-BeT) entrenadas con el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: *"No evaluation results have been provided for this policy yet."* No hay tasas de éxito en robot real, ni número de ensayos, ni condiciones de evaluación (posiciones de objetos, iluminación o distractores).

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 51,7 M de parámetros en fp32, los pesos ocupan en torno a 0,2 GB; sumando activaciones de las dos cámaras de 480x640 y el estado, la inferencia cabe holgadamente en GPUs de 4-8 GB. No se dispone de mediciones oficiales.
- **GPU recomendadas**: cualquier GPU NVIDIA con CUDA y al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente; también A100/H100 si se comparte con otros procesos. La model card no especifica requisitos.
- **Consumer GPU**: sí, cabe en GPUs de consumo modestas (RTX 3050/3060 en adelante) por el reducido tamaño del checkpoint.
- **Opciones de despliegue**: `lerobot-rollout` (CLI oficial), integración con el stack LeRobot en PyTorch; no se documentan exportaciones a ONNX, TensorRT, llama.cpp, vLLM, Ollama ni TGI (no aplicables a este tipo de modelo).
- **Latencia y throughput**: no disponibles. La política está pensada para operar a 30 FPS, pero no se publican mediciones de latencia por chunk ni de frecuencia efectiva de control.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `act_uno_rojo_100ep` (este) | 51,7 M | 2 imagenes 480x640 + estado (6,) | Manipulacion "uno_rojo_con_azules" | no disponible | Hugging Face (LeRobot) |
| ACT generico (paper 2304.13705) | no disponible | vision + estado | Imitacion robotica general | codigo abierto (paper) | Referencia metodologica |
| Diffusion Policy | no disponible | vision + estado | Imitacion robotica | no disponible en esta ficha | Implementaciones publicas |
| VQ-BeT | no disponible | vision + estado | Imitacion robotica | no disponible en esta ficha | Implementaciones publicas |

No se dispone de datos de rendimiento comparativo entre estas políticas en la informacion proporcionada; la comparativa se limita a categoria y disponibilidad.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay tasas de éxito ni condiciones de prueba documentadas; no se puede afirmar que la política funcione fuera del entorno de grabación.
- **Sobreajuste al dataset**: entrenada con 100 episodios de una única tarea ("uno_rojo_con_azules"); es probable que falle ante cambios de iluminación, posiciones de objetos, distractores o un robot distinto del mismo tipo.
- **Dependencia de las cámaras**: los nombres `Satelital` y `Lerobot` deben coincidir exactamente con los índices y configuraciones usados en el entrenamiento; un cambio de resolución, montaje o FPS degrada el comportamiento.
- **Licencia no especificada**: la model card marca la licencia como "[More Information Needed]"; no se puede asumir uso comercial sin consultar al autor.
- **Riesgo de alucinación en sentido amplio**: como política de imitación, puede generar acciones plausibles pero incorrectas ante estados fuera de distribución, sin señal de incertidumbre.
- **Sin soporte de texto ni multilingüe**: no es un modelo de lenguaje; no debe emplearse en tareas de NLP, tool calling ni agentes conversacionales.
- **Fecha de creación anómala**: el repositorio figura como creado el 2026-11-22, dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FPBarakaldolh-milo/act_uno_rojo_100ep
- Dataset de entrenamiento: https://huggingface.co/datasets/FPBarakaldolh-milo/uno_rojo_con_azules
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=FPBarakaldolh-milo/uno_rojo_con_azules
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference

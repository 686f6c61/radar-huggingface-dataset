# nebula2wx/smolvla_standard34_ds123

## Resumen

SmolVLA Standard34 DS123 es un modelo vision-language-action (VLA) compacto afinado por el usuario nebula2wx a partir de `lerobot/smolvla_base`. No es un modelo de lenguaje generalista: es una política de imitación para control robótico que consume observaciones visuales y de estado articular, y produce directamente comandos de acción de 6 dimensiones. Su relevancia radica en que demuestra el flujo completo de LeRobot para especializar un VLA pequeño en una tarea concreta de manipulación con hardware de bajo coste.

El modelo parte de la arquitectura SmolVLA descrita en el paper arXiv:2506.01844, que combina un codificador visual, un modelo de lenguaje compacto y un cabezal de acciones para lograr un rendimiento competitivo con un coste computacional reducido, apto para hardware de consumo. Con 450.046.176 parámetros (aproximadamente 0,45 B), se sitúa en la gama de modelos que pueden ejecutarse en una GPU de consumo durante la inferencia en bucle cerrado.

Este checkpoint concreto está especializado en dos tareas de picking sobre un robot `so_follower` (SO-100/SO-101 de LeRobot): recoger un bloque rojo o verde y depositarlo en un plato. Se entrenó con 80 episodios y 56.895 fotogramas a 30 FPS procedentes de tres datasets del autor, y se distribuye con licencia Apache 2.0. Es un artefacto de investigación y prototipado, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action; codificador visual + LM compacto + cabezal de acciones) |
| Parametros totales | 450.046.176 (0,45 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LM; la política opera sobre observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés: "pick up the red block and put it on the plate") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower (SO-100/SO-101 de LeRobot) |
| Entradas | observation.state (6,), 3 cámaras visuales (3, 256, 256) y empty_camera_0 (3, 480, 640) |
| Salidas | action (6,) |
| Episodios de entrenamiento | 80 |
| Fotogramas de entrenamiento | 56.895 a 30 FPS |
| Pasos de entrenamiento | 200.000 (batch 8, AdamW, lr 1e-5, seed 1000) |
| Version de LeRobot | 0.6.2 |
| Tamano del repositorio | 19,8 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción que fusiona percepción visual y comprensión del lenguaje para emitir acciones motoras de forma directa (política end-to-end). La arquitectura, según el paper de referencia, está diseñada para ser compacta y eficiente: codifica las imágenes de las cámaras junto con el estado del robot y la instrucción textual de la tarea, y produce el vector de acción de 6 grados de libertad que controla el efector del `so_follower`. El checkpoint hereda los pesos del modelo base `lerobot/smolvla_base` y se afina mediante aprendizaje por imitación supervisado sobre demostraciones teleoperadas.

El entrenamiento se realizó con LeRobot 0.6.2 durante 200.000 pasos, con tamaño de lote 8, optimizador AdamW y tasa de aprendizaje 1e-5. El conjunto de datos combina tres repositorios del autor (`standard_3_4_red_pick_up_20261031_220542`, `standard_3_4_red_pick_up_enhance_20261031_225916` y `standard_3_4_greed_pick_up_20261031_232848`), sumando 80 episodios y 56.895 fotogramas a 30 FPS. Las tareas cubiertas son "pick up the red block and put it on the plate" y "pick up the green block and put it on the plate". No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo de imitación robótica.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un brazo `so_follower` a partir de observaciones multimodales.
- Percepción visual multi-cámara: procesa tres vistas de 256x256 píxeles más una cámara adicional de 480x640.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica como texto ("pick up the red block and put it on the plate").
- Ejecución de tareas de picking y colocación sobre un plato con objetos de color (rojo y verde).
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante las CLI `lerobot-train` y `lerobot-rollout`.
- Inferencia en bucle cerrado sobre hardware de consumo, según las características de SmolVLA.
- No soporta tool calling, function calling, razonamiento multi-paso textual ni generación de lenguaje general: no es un LLM.

## Casos de uso

- Prototipado de manipulación pick-and-place: usar el modelo con `lerobot-rollout` sobre un SO-100/SO-101 para validar una rutina de recogida de bloques y depósito en plato, aprovechando que la política ya está entrenada para esas dos tareas concretas.
- Docencia y formación en VLA: el checkpoint sirve como ejemplo reproducible del flujo completo de LeRobot (grabación de datos, entrenamiento y despliegue) con un modelo de 0,45 B que cabe en hardware asequible.
- Punto de partida para fine-tuning: reentrenar desde `lerobot/smolvla_base` o desde este checkpoint con nuevos datasets para adaptar la política a otras posiciones de objeto o colores, siguiendo la configuración documentada (200.000 pasos, batch 8, lr 1e-5).
- Benchmark interno de infraestructura robótica: medir latencia y estabilidad de la inferencia en bucle cerrado a 30 FPS con cámaras OpenCV en una GPU de consumo, antes de escalar a políticas mayores.
- Automatización de laboratorio de bajo coste: desplegar una celda de clasificación de piezas por color (rojo/verde) donde el modelo actúe como controlador de la fase de picking.
- Investigación en aprendizaje por imitación: analizar el efecto del número de episodios (80) y de la composición del dataset en la tasa de éxito de una política VLA pequeña.
- Generación de datos sintéticos o aumentados: usar la política como generador de trayectorias para ampliar datasets de manipulación (el autor incluye un dataset "enhance" que sugiere este enfoque).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía (con la plantilla de tabla de éxito por tarea sin rellenar), por lo que no hay tasas de éxito en robot real ni métricas comparativas verificables.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 450 M parámetros en FP32 los pesos ocupan aproximadamente 1,8 GB, y en FP16/BF16 alrededor de 0,9 GB, a lo que hay que sumar el codificador visual y los buffers de inferencia.
- GPU recomendadas: no documentadas por el autor; por tamaño, una RTX 4090, RTX 3090 o incluso GPUs de gama media con 8 GB o más deberían ser suficientes para inferencia, aunque no hay confirmación oficial.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (0,45 B) y el enfoque de SmolVLA orientado a hardware de consumo, aunque no se especifican modelos concretos validados.
- Despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`) y `lerobot-train` para reentrenamiento; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a una política VLA de este tipo).
- Latencia y throughput: no disponibles. El sistema opera a 30 FPS en la captura de datos, pero no se publica la latencia de inferencia por paso.
- Repositorio de 19,8 GB, dominado probablemente por checkpoints intermedios; para despliegue basta con el checkpoint final.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nebula2wx/smolvla_standard34_ds123 | 0,45 B | VLA afinado para picking rojo/verde | 3 cámaras 256x256 + 1 de 480x640, estado (6,) | Apache 2.0 | Hugging Face, 18 descargas |
| lerobot/smolvla_base | no disponible en la informacion | VLA base | no disponible | no disponible en la informacion | Hugging Face (modelo base) |
| Políticas de imitación tipo ACT / Diffusion Policy en LeRobot | no disponible en la informacion | Políticas de imitación | variables según configuración | no disponible en la informacion | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización estrecha: la política solo se ha entrenado para dos tareas ("pick up the red block and put it on the plate" y "pick up the green block and put it on the plate"); fuera de ese dominio su comportamiento no está garantizado.
- Dependencia del hardware: requiere un robot `so_follower` y cámaras con nombres e índices que coincidan exactamente con las claves de observación del entrenamiento (`head`, `wrist`, etc.); una configuración distinta invalida el despliegue.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce la fiabilidad en producción.
- Dataset pequeño: 80 episodios y 56.895 fotogramas son una base limitada; la generalización a nuevas posiciones, iluminación u objetos es incierta.
- Riesgo de sobreajuste a las condiciones de grabación (posición de cámaras, fondo, colores concretos de los bloques).
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Sesgos y alucinación: en el contexto VLA, el equivalente es la ejecución de acciones erróneas o inseguras ante entradas fuera de distribución; no hay análisis de seguridad documentado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base y de los datasets empleados.
- Fecha de creación y actualización del repositorio (2026-11-04) y bajo número de descargas (18) indican que es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nebula2wx/smolvla_standard34_ds123
- Archivos del repositorio: https://huggingface.co/nebula2wx/smolvla_standard34_ds123/tree/main
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset 1: https://huggingface.co/datasets/Whyynnot/standard_3_4_red_pick_up_20261031_220542
- Dataset 2: https://huggingface.co/datasets/Whyynnot/standard_3_4_red_pick_up_enhance_20261031_225916
- Dataset 3: https://huggingface.co/datasets/Whyynnot/standard_3_4_greed_pick_up_20261031_232848

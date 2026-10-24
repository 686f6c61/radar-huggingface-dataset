# aegrabs/act_so101_clear_plate

## Resumen

`aegrabs/act_so101_clear_plate` no es un modelo de lenguaje, sino una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. La desarrolla el usuario aegrabs y se distribuye a través del ecosistema LeRobot de Hugging Face, con 51.668.614 parámetros y un repositorio de 0,2 GB en formato safetensors. Su función es convertir observaciones del robot (estado de las articulaciones e imágenes de dos cámaras) en comandos de acción de 6 dimensiones para un brazo SO-101.

El modelo resuelve una tarea concreta de manipulación: despejar un plato (`clear_plate`) con un SO-101 de 6 grados de libertad, usando una cámara cenital (`cam_top`) y otra en la muñeca (`cam_wrist`) a 640x480 y 30 FPS. Se entrenó sobre el dataset `aegrabs/so101_clear_plate`, compuesto por 200 episodios teleoperados y 100.166 fotogramas. Frente a políticas que predicen un único paso, ACT predice fragmentos de acciones (*action chunks*), lo que reduce el error de acumulación y permite un control más estable.

Es relevante ahora porque ejemplifica el flujo completo de la robótica open source actual: brazo abierto SO-101, dataset público en el Hub, entrenamiento reproducible con LeRobot 0.6.2 y despliegue con un solo comando (`lerobot-rollout`). No obstante, la model card no incluye resultados de evaluación en robot real ni licencia declarada, dos carencias importantes antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con decodificacion de chunks de acciones (ACT, Action Chunking with Transformers); codificador visual + codificador de estado + decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica: politica de imitacion sin contexto textual; consume observaciones por paso y emite chunks de acciones (longitud del chunk no documentada) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes cuantizadas |
| Idiomas soportados | no disponible / no aplica (no hay entrada ni salida de lenguaje; el campo `task` esta vacio) |
| Licencia | no disponible (la model card indica «More Information Needed») |
| Formato de pesos | safetensors (libreria `lerobot`), repositorio de 0,2 GB |

Otras especificaciones relevantes:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` (SO-101) |
| Entradas | `observation.state` (6,), `observation.images.cam_top` (3, 480, 640), `observation.images.cam_wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Frecuencia de control | 30 FPS (frecuencia del dataset de entrenamiento) |
| Pipeline | robotics |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-24 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa las dos cámaras), un codificador del estado propioceptivo de 6 dimensiones y un decodificador transformer que predice un chunk de acciones futuras en lugar de un solo paso. Esta predicción por chunks es la innovación central del método: amortigua el ruido de las demostraciones teleoperadas y evita el error compounding típico de las políticas paso a paso. El paper asociado (arXiv:2304.13705) describe además el uso de *temporal ensembling* en inferencia, aunque la model card de este repositorio no detalla si se aplica en el despliegue.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `aegrabs/so101_clear_plate`: 200 episodios, 100.166 fotogramas a 30 FPS, con la tarea declarada como cadena vacía. La configuración fue de 150.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el número total de tokens ni composición adicional del dataset, ni si hubo fases de RLHF/DPO (no aplicables en este paradigma). Tampoco se especifican aumentos de datos, resolución de entrada tras el preprocesado ni técnica de regularización.

## Capacidades

- Manipulación robótica de una tarea única: despejar un plato (`clear_plate`) con un brazo SO-101 de 6 DoF.
- Política visomotora: fusiona dos flujos de imagen (cenital y muñeca) con el estado articular para producir acciones de 6 dimensiones.
- Predicción de chunks de acciones, orientada a control continuo a 30 FPS.
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere definición explícita de recompensas.
- Despliegue integrado en LeRobot mediante `lerobot-rollout` con la estrategia `base` (ejecución sin grabación de episodios).
- Reentrenamiento reproducible con `lerobot-train` sobre el mismo dataset u otros del Hub.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües: no es un modelo generativo de texto.
- No hay modo *thinking*, visión general, audio ni comprensión de instrucciones en lenguaje natural (el campo `task` está vacío).

## Casos de uso

- Automatización de despeje de mesa en un SO-101: la política recibe las imágenes de `cam_top` y `cam_wrist` y emite acciones de 6 DoF para retirar un plato; encaja porque el modelo fue entrenado exactamente sobre esa tarea y ese robot.
- Banco de pruebas para investigación en imitación: sirve como referencia reproducible (semilla 1000, 150.000 pasos, hiperparámetros documentados) para comparar variantes de ACT frente a otras políticas en el mismo dataset.
- Recolección de datos y *rollouts* automatizados: con `--strategy.type=base` se ejecuta la política sin grabar episodios, útil para generar trayectorias adicionales o validar hardware antes de una campaña de captura.
- Prototipado rápido en robótica de bajo coste: al requerir ~0,2 GB de pesos, puede ejecutarse en un PC con GPU de gama media conectado al brazo, sin infraestructura de servidor.
- Educacion y formación en robótica open source: el par política + dataset + comandos CLI permite ilustrar el ciclo completo teleoperación → entrenamiento → despliegue en un curso práctico.
- Base para *fine-tuning* en tareas similares de pick-and-place: al estar en formato LeRobot, se puede reentrenar con `lerobot-train` sobre datasets propios de manipulación con SO-101 y ajustar hiperparámetros (learning rate, pasos, batch).
- Validación de *pipelines* de control en laboratorio: útil para medir latencia de inferencia y estabilidad de la política en hardware real antes de invertir en datasets mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la nota «_No evaluation results have been provided for this policy yet_» y deja la tabla de evaluación (tarea, ensayos, éxitos, tasa de éxito) sin cumplimentar. Tampoco hay métricas de pérdida de entrenamiento ni comparaciones con otras políticas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,21 GB solo para los pesos en fp32 (51.668.614 parámetros × 4 bytes) y ~0,10 GB en fp16/bf16. Estimación propia a partir del recuento de parámetros; no publicada por el autor.
- El consumo real de VRAM es superior por las activaciones: dos imágenes de 3×480×640 por paso más el decodificador de acciones. No hay medición oficial de memoria pico.
- GPU recomendadas: no documentadas. Por tamaño, cualquier GPU con ≥4 GB de VRAM debería alojar la política con margen; una RTX 4090, A100 o H100 están sobradamente dimensionadas para este modelo.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660/RTX 3050 o superiores; la viabilidad de ejecutar a 30 FPS estables en GPU de gama baja no está documentada.
- Despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento) sobre PyTorch. vLLM, llama.cpp, Ollama y TGI no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia objetivo del sistema es 30 FPS (la del dataset), pero no se han publicado mediciones de latencia de inferencia ni de tasa de éxito por episodio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Evaluacion publicada | Disponibilidad |
|---|---|---|---|---|---|---|
| `aegrabs/act_so101_clear_plate` | 51.668.614 | no disponible (chunks de acciones) | `clear_plate` con SO-101 | no disponible | no | Hugging Face Hub (0 descargas) |
| `CnLori/act_so101_grab_cube` | no disponible | no disponible | agarre de cubo con SO-101 | no disponible | no disponible | Hugging Face Hub |
| `aiden-li/so101-act` | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face Hub |
| `omkarputti/SO101_ACT_Training` (proyecto) | no disponible | no disponible | pipeline de entrenamiento ACT para SO-101 | no disponible | no disponible | GitHub |

Los tres alternativos pertenecen a la misma familia metodológica (ACT sobre SO-101 con LeRobot) y comparten la misma limitación: ausencia de métricas publicadas y de licencia declarada. La comparación cuantitativa de parámetros, contexto y rendimiento no es posible con la información disponible.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay tasa de éxito medida en robot real, por lo que se desconoce la fiabilidad de la política fuera del conjunto de entrenamiento.
- Licencia no declarada («More Information Needed»): no se puede asumir permiso de uso comercial; es un bloqueo potencial para cualquier despliegue en producción.
- Tarea única y sin condicionamiento por lenguaje: el campo `task` está vacío y la política no acepta instrucciones; solo ejecuta el comportamiento aprendido.
- Dependencia fuerte del *setup*: mismas cámaras (`cam_top`, `cam_wrist`), misma resolución 640×480, misma frecuencia de 30 FPS y misma calibración del SO-101. Cambiar montaje, iluminación o robot invalida las observaciones esperadas.
- Dataset pequeño (200 episodios, 100.166 fotogramas): riesgo elevado de sobreajuste al entorno, posiciones de objeto y condiciones de luz de la grabación.
- Sesgos heredados de la teleoperación humana: estilo de agarre, velocidad, trayectorias y posibles errores sistemáticos del operador se reproducen en la política.
- Riesgo de fallo silencioso: al no haber evaluación, no se conocen los modos de fallo (por ejemplo, colisiones o agarres fallidos) ni su frecuencia.
- Ausencia de datos sobre cuantización: no se han publicado variantes ligeras ni conversiones a otros formatos, lo que limita opciones de optimización.
- Fecha de creación del repositorio (2026-10-24) y cero descargas: no hay evidencia de uso o validación por terceros.
- No apta para tareas de razonamiento, texto, código o visión general: cualquier expectativa propia de un modelo de lenguaje es inaplicable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aegrabs/act_so101_clear_plate
- Dataset de entrenamiento: https://huggingface.co/datasets/aegrabs/so101_clear_plate
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=aegrabs/so101_clear_plate
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (*rollout*): https://huggingface.co/docs/lerobot/main/en/inference
- SO-101 Open Robot Arm (ficha del brazo): https://robotics.growbotics.ai/projects/hardware/so-101-open-robot-arm
- Proyecto de entrenamiento ACT para SO-101: https://github.com/omkarputti/SO101_ACT_Training
- Política comparable `CnLori/act_so101_grab_cube`: https://huggingface.co/CnLori/act_so101_grab_cube
- Política comparable `aiden-li/so101-act`: https://huggingface.co/aiden-li/so101-act
- Artículo sobre lectura de datasets SO-101/LeRobot: https://zenn.dev/yumeno/articles/so101-lerobot-act-dataset-peek?locale=en

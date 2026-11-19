# lerobot/smolvla_base

## Resumen
SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto desarrollado por Hugging Face dentro del ecosistema LeRobot. Su objetivo es ofrecer robótica asequible: un modelo entrenable en una sola GPU y desplegable en hardware de consumo, con un rendimiento que, según los autores, iguala a VLAs mucho más grandes gracias a datos aportados por la comunidad. Está pensado como modelo base para ajuste fino en casos de uso robóticos concretos.

El modelo parte de SmolVLM2-500M-Video-Instruct y se especializa en mapear observaciones multimodales (imágenes de varias cámaras y estado propioceptivo del robot, con instrucción de lenguaje opcional) a acciones continuas. Con 450 millones de parámetros y un repositorio de 1,8 GB, es un modelo ligero orientado a inferencia en tiempo real en brazos robóticos de bajo coste.

Se publica bajo licencia Apache 2.0, lo que facilita su uso comercial e integración en productos. La relevancia actual radica en la combinación de tamaño reducido, licencia permisiva y un pipeline de entrenamiento e inferencia ya integrado en LeRobot, lo que reduce la barrera de entrada para laboratorios y desarrolladores que quieran aplicar VLA en robótica real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLM2-500M-Video-Instruct; política de imitación con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (entrenamiento indicado en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
SmolVLA es una política VLA construida sobre el modelo visión-lenguaje SmolVLM2-500M-Video-Instruct. Recibe como entrada imágenes de múltiples vistas, el estado propioceptivo del robot y, opcionalmente, una instrucción en lenguaje natural; produce como salida acciones continuas. El objetivo de entrenamiento es flow matching, una formulación generativa para modelar distribuciones continuas de acciones, y la representación de acciones es continua.

El modelo se entrena mediante imitación (imitation learning) sobre datasets en formato LeRobot. La model card indica que está diseñado para ser entrenado en una sola GPU con configuraciones modestas (por ejemplo, batch_size de 4 y 100.000 pasos en el comando de ejemplo), e incluye opciones específicas de política como chunk_size, n_action_steps, max_action_tokens y gradient_checkpointing. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades
- Generación de acciones continuas para control robótico a partir de observaciones visuales y estado del robot.
- Procesamiento de imágenes de múltiples vistas (por ejemplo, cámara superior y cámara lateral).
- Condicionamiento por instrucción en lenguaje natural opcional (en inglés).
- Aprendizaje por imitación: ajuste fino sobre demostraciones grabadas en formato LeRobot.
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`), inferencia (`select_action`) y evaluación en robot real (`lerobot-record`).
- Soporte de estado propioceptivo del robot como entrada adicional.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, visión general, audio o modo de razonamiento explícito.

## Casos de uso
- Manipulación de objetos con brazos de bajo coste: el modelo puede controlar robots tipo SO-100/SO-101 en tareas como colocar un ladrillo de Lego en una caja, usando imágenes de varias cámaras y estado del robot como entrada.
- Investigación académica en VLA: al ser entrenable en una sola GPU, permite a laboratorios con recursos limitados experimentar con políticas de imitación y comparar variantes sin grandes clústeres.
- Prototipado rápido de tareas robóticas: el flujo `lerobot-train` con un checkpoint base y un dataset propio permite pasar de demostraciones a una política funcional en pocos pasos.
- Evaluación en robot real: el script `lerobot-record` permite ejecutar la política y grabar episodios de evaluación, útil para medir tasas de éxito antes de desplegar.
- Automatización de tareas repetitivas de pick-and-place: con instrucciones de lenguaje y varias vistas, el modelo puede adaptarse a variaciones de posición y orientación de objetos.
- Educación y divulgación en robótica: el tamaño reducido y la licencia Apache 2.0 facilitan su uso en cursos y talleres con hardware asequible.
- Integración en pipelines de datos LeRobot: sirve como base para experimentos de recogida de datos, aumento de datasets y comparación de políticas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en bfloat16, el peso de los parámetros ronda los 0,9 GB, por lo que cabe holgadamente en GPUs de consumo, aunque el consumo real depende de las imágenes de entrada y del tamaño de lote.
- GPU recomendadas: no se especifican en la información disponible; el modelo está diseñado para hardware de consumo y para entrenamiento en una sola GPU.
- Cabe en GPU de consumo: sí, según la model card ("deployable on consumer hardware").
- Opciones de despliegue: LeRobot (`SmolVLAPolicy.from_pretrained`, `select_action`), scripts `lerobot-train` y `lerobot-record`; no se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada. Como referencia estructural, el modelo se apoya en SmolVLM2-500M-Video-Instruct, del que hereda la torre visión-lenguaje, pero no se aportan métricas comparativas frente a otras políticas VLA.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (lerobot/smolvla_base) | 450.046.176 | no disponible | apache-2.0 | Hugging Face, LeRobot |
| SmolVLM2-500M-Video-Instruct (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Hugging Face |
| Otras políticas VLA | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Entrenado principalmente para inglés; el soporte multilingüe no está documentado.
- Modelo base pensado para ajuste fino: su uso directo en tareas específicas puede dar resultados pobres sin entrenamiento sobre el caso de uso.
- Riesgo de alucinación y de acciones erróneas en entornos no vistos durante el entrenamiento; requiere evaluación en robot real antes de producción.
- No se documentan sesgos específicos en la información disponible, pero al derivar de un modelo visión-lenguaje puede heredar sesgos de sus datos de preentrenamiento.
- La ventana de contexto no está especificada, lo que limita la planificación de tareas de largo horizonte.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los datasets y del modelo base utilizados en el ajuste fino.
- El despliegue en robot real exige hardware compatible (por ejemplo, SO-100/SO-101) y configuración de cámaras y puertos; no es un modelo de propósito general fuera del dominio robótico.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/lerobot/smolvla_base
- Paper: https://arxiv.org/abs/2506.01844
- Implementación de referencia (LeRobot): https://github.com/huggingface/lerobot
- Documentación de instalación de LeRobot: https://huggingface.co/docs/lerobot/installation
- Script de evaluación en robot real: https://github.com/huggingface/lerobot/blob/main/src/lerobot/scripts/lerobot_record.py
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct

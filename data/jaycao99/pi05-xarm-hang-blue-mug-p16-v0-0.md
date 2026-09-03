# JayCao99/pi05-xarm-hang-blue-mug-p16-v0.0

## Resumen

Este repositorio contiene un checkpoint de política robótica basado en Pi-0.5, un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence. El checkpoint concreto, identificado como `pi05-xarm-hang-blue-mug-p16-v0.0`, ha sido entrenado mediante aprendizaje por imitación para ejecutar la tarea de colgar una taza azul en un soporte (mug tree) utilizando un brazo robótico xArm7. El autor, JayCao99, ha subido los pesos a HuggingFace siguiendo el formato de LeRobot, una librería open source para robótica.

El modelo se presenta como un payload listo para despliegue, con un único subdirectorio `checkpoint-030000` que contiene los archivos necesarios (`model.safetensors`, `config.json`, pre/postprocesadores y configuración de entrenamiento). Aunque Pi-0.5 es un modelo generalista capaz de ejecutar múltiples tareas, este checkpoint está especializado en una única tarea de manipulación, lo que lo hace adecuado para entornos controlados de investigación o demostración. Su relevancia radica en ser un ejemplo práctico de cómo aplicar VLA en robótica con herramientas accesibles como LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi-0.5 (vision-language-action, basada en transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización declarada) |
| Idiomas soportados | no disponible (el modelo procesa instrucciones visuales y posiblemente textuales, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (junto con config.json y archivos de pre/postprocesamiento) |

## Arquitectura y entrenamiento

Pi-0.5 es un modelo VLA que co-entrena con datos heterogéneos: demostraciones robóticas, datos web y subtareas semánticas, lo que le permite generalizar en entornos abiertos. Sin embargo, este checkpoint concreto ha sido ajustado mediante aprendizaje por imitación sobre un dataset de teleoperación específico para la tarea de colgar tazas de colores en un soporte, recopilado con un brazo xArm7. El entrenamiento se realizó durante 30.000 pasos, alcanzando una pérdida final de 0.011, según la model card. No se proporcionan detalles sobre el dataset de entrenamiento (número de episodios, composición exacta) ni sobre técnicas de optimización adicionales como RLHF o DPO.

## Capacidades

- Ejecución de una tarea de manipulación robótica específica: colgar una taza azul en un soporte, a partir de observaciones visuales (cámara) y posiblemente instrucciones de lenguaje.
- Control de un brazo robótico xArm7 mediante políticas de aprendizaje por imitación.
- Integración con el ecosistema LeRobot para carga y despliegue directo.
- No incluye capacidades de generación de texto, razonamiento general, tool calling ni agentes autónomos; es un modelo de política puro.

## Casos de uso

- Investigación en aprendizaje por imitación: permite reproducir y estudiar el comportamiento de una política VLA en una tarea de manipulación concreta, sirviendo como punto de partida para experimentos de generalización o transferencia.
- Demostración de VLA en robótica: útil para mostrar cómo un modelo Pi-0.5 puede ser ajustado a una tarea específica con un dataset pequeño, en entornos académicos o de divulgación.
- Desarrollo de sistemas de pick-and-place: la tarea de colgar una taza implica agarre, transporte y colocación precisa, lo que puede servir como base para tareas similares en líneas de montaje o almacenes.
- Evaluación de políticas en hardware real: el checkpoint está listo para desplegarse en un xArm7, permitiendo probar la robustez del control en condiciones reales.
- Comparación de métodos de imitación: al ser un checkpoint de LeRobot, puede compararse con otras políticas entrenadas con el mismo framework para analizar diferencias de rendimiento.
- Reutilización como punto de partida para fine-tuning: aunque está especializado, los pesos pueden servir como inicialización para tareas relacionadas (por ejemplo, colgar tazas de otros colores) mediante transferencia de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida final de entrenamiento (0.011) en el paso 30.000, pero no se ofrecen comparaciones con otros modelos ni evaluaciones en entornos reales o simulados.

## Requisitos de hardware

- El tamaño del repositorio es de 9.4 GB, lo que sugiere que el modelo tiene un número considerable de parámetros (probablemente del orden de miles de millones, aunque no se confirma). Se recomienda una GPU con al menos 16 GB de VRAM para cargar los pesos en precisión completa (fp32), aunque no se especifican requisitos oficiales.
- No se dispone de información sobre latencia, throughput ni GPUs recomendadas específicas (A100, H100, RTX 4090, etc.).
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que soporta inferencia en PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Para ejecutar en tiempo real, se necesitaría una GPU con suficiente capacidad de cómputo y baja latencia, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de robótica como RT-2, OpenVLA o el propio Pi-0 base. Este checkpoint es una especialización de Pi-0.5 para una tarea concreta, y no se han publicado métricas comparativas. Se recomienda consultar el paper de Pi-0.5 (arXiv:2504.16054) para conocer el rendimiento general del modelo base, pero no se aplica directamente a este checkpoint.

## Limitaciones y advertencias

- Es un modelo especializado en una única tarea (colgar taza azul) y no generaliza a otras tareas o variaciones del entorno sin reentrenamiento.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial o modificación. Se debe contactar al autor antes de cualquier aplicación productiva.
- No se han documentado sesgos, pero al ser entrenado con datos de teleoperación de un solo entorno, puede presentar dependencia de las condiciones específicas (iluminación, posición de cámara, calibración del brazo).
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede haber errores de ejecución si las observaciones difieren del dataset de entrenamiento.
- No se proporcionan garantías de robustez en entornos no vistos; es un checkpoint de investigación, no un producto listo para producción.
- El tamaño del modelo (9.4 GB) puede dificultar su despliegue en hardware embebido o con recursos limitados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JayCao99/pi05-xarm-hang-blue-mug-p16-v0.0
- Dataset asociado: https://huggingface.co/datasets/JayCao99/xarm-hang-blue-mug-v0
- Dataset multi-tarea (espejo): https://d6108366.hf-mirror.com/datasets/JayCao99/xarm-hang-multimug-v0
- Paper de Pi-0.5: https://arxiv.org/abs/2504.16054
- Página de Pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05

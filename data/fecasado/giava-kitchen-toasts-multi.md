# fecasado/giava-kitchen-toasts-multi

## Resumen

Giava-kitchen-toasts-multi es una política de robótica (policy) entrenada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El modelo, publicado por el usuario fecasado, implementa el tipo de política `gaze_flow_matching`, una variante de flow matching orientada a la generación de acciones condicionadas por la mirada (gaze) del robot. Está entrenado sobre el dataset `fecasado/toasts-to-plate-320x240`, que registra una tarea de manipulación en cocina: trasladar tostadas a un plato con imágenes de resolución 320x240.

El modelo resuelve el problema de mapear observaciones visuales y de estado del robot a comandos de acción motora en un entorno doméstico concreto. Con 235,9 millones de parámetros y un repositorio de 0,9 GB, es un modelo compacto pensado para inferencia en tiempo real sobre el robot físico, no para generación de texto ni tareas de lenguaje. Su relevancia radica en que ejemplifica el flujo actual de entrenamiento de políticas robóticas de código abierto con LeRobot, reproducible y desplegable sobre hardware asequible como el brazo SO-100.

La licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su reutilización como base para tareas de manipulación similares. No obstante, la información pública es muy limitada: la model card es una plantilla sin completar y no se han publicado resultados de benchmarks ni detalles de entrenamiento más allá de lo que revelan los metadatos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de robótica `gaze_flow_matching` (flow matching condicionado por mirada), implementada en LeRobot |
| Parámetros totales | 235.899.950 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para este checkpoint) |
| Idiomas soportados | No disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 0,9 GB) |

## Arquitectura y entrenamiento

El modelo es una política de aprendizaje por imitación del ecosistema LeRobot. El tipo declarado, `gaze_flow_matching`, corresponde a un enfoque de flow matching en el que la generación de la trayectoria de acciones se condiciona por la dirección de la mirada del robot, lo que permite desambiguar objetos y regiones relevantes en la escena. La arquitectura concreta de la red (backbone visual, codificador de estado y cabeza de acciones) no está detallada en la model card, que es una plantilla genérica sin completar por el autor.

El entrenamiento se realizó sobre el dataset `fecasado/toasts-to-plate-320x240`, con observaciones visuales de 320x240 píxeles y episodios de demostración de la tarea de trasladar tostadas a un plato. No se especifican el número de episodios, el número de tokens o muestras, ni si se aplicaron técnicas de aumento de datos o regularización. Tampoco hay información sobre el robot empleado, aunque los comandos de ejemplo de la model card apuntan a un seguidor SO-100 (`so100_follower`), lo que sugiere un brazo de bajo coste de 5 grados de libertad.

## Capacidades

- Generación de acciones motoras para manipulación robótica a partir de observaciones visuales y de estado.
- Condicionamiento por mirada (gaze) para focalizar la atención en regiones relevantes de la escena.
- Ejecución de una tarea específica de cocina: recoger tostadas y depositarlas en un plato.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración con el pipeline de LeRobot para entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`).
- Inferencia en tiempo real sobre robot físico con `--policy.path` apuntando al checkpoint.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente motor.

## Casos de uso

- Manipulación doméstica de alimentos: el modelo ejecuta la secuencia de agarre y colocación de tostadas en un plato, adecuado para prototipos de cocina asistida con brazos SO-100.
- Base para fine-tuning en tareas de pick-and-place: al ser una política compacta de 236 M de parámetros, se puede reentrenar con un dataset propio de episodios similares usando `lerobot-train`.
- Evaluación de pipelines de aprendizaje por imitación: sirve como referencia reproducible para comparar variantes de flow matching frente a ACT u otras políticas de LeRobot.
- Investigación en condicionamiento por mirada: permite estudiar cómo la señal de gaze mejora la desambiguación de objetos en escenas con oclusiones.
- Despliegue en robótica de bajo coste: su tamaño (0,9 GB) cabe en GPUs de consumo y permite inferencia local en el puesto de trabajo del robot.
- Docencia y demostraciones: ejemplo completo de entrenamiento y evaluación con LeRobot, desde el dataset hasta la ejecución en hardware real.
- Automatización de líneas de montaje simples: con reentrenamiento, el mismo esquema puede aplicarse a tareas repetitivas de recogida y colocación en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 235,9 M de parámetros ocupan aproximadamente 0,95 GB; en fp16, unos 0,47 GB. Con overhead de activaciones y buffers visuales, se estima un consumo de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se recomiendan RTX 3060, RTX 4060, RTX 4090, A100 o H100 para entrenamiento y evaluación a mayor velocidad.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs NVIDIA modernas, e incluso en placas integradas con suficiente memoria compartida para inferencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con backend PyTorch sobre CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles. Al ser una política de control, la latencia vendrá dominada por la frecuencia de control del robot y el preprocesado de imagen a 320x240.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| giava-kitchen-toasts-multi | 235,9 M | No disponible | Manipulación con gaze flow matching | Apache 2.0 | Hugging Face (30 descargas) |
| Políticas ACT de LeRobot | Variable (típicamente decenas de millones) | No disponible | Aprendizaje por imitación genérico | Apache 2.0 | Hugging Face / LeRobot |
| Políticas Diffusion Policy | Variable | No disponible | Generación de acciones por difusión | Varía por checkpoint | Hugging Face / LeRobot |
| OpenVLA | ~7 B | No disponible | Manipulación generalista con VLA | Apache 2.0 | Hugging Face |

La comparación con OpenVLA es orientativa: este último es un modelo visión-lenguaje-acción de escala mucho mayor, mientras que giava-kitchen-toasts-multi es una política especializada y ligera. No hay datos de rendimiento publicados para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La model card es una plantilla sin completar; no hay documentación de la arquitectura exacta, el dataset de entrenamiento ni el proceso de evaluación.
- El modelo está especializado en una única tarea (tostadas a plato) y un único entorno; su generalización a otras escenas o robots no está demostrada.
- Riesgo de sobreajuste al dataset `toasts-to-plate-320x240`: cambios de iluminación, fondo u objeto pueden degradar el rendimiento.
- No hay información sobre sesgos, pero al ser un modelo visual entrenado con pocos datos, puede heredar sesgos de las demostraciones (posiciones, colores y disposiciones concretas).
- No se han publicado métricas de éxito de la tarea ni curvas de aprendizaje.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Para producción, es imprescindible validar el modelo en el hardware y entorno reales antes de desplegarlo, dado el escaso historial de uso (30 descargas, 0 likes).
- No apto para tareas de lenguaje, razonamiento o generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/giava-kitchen-toasts-multi
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/toasts-to-plate-320x240
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot

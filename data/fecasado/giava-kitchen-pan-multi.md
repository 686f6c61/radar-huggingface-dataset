# fecasado/giava-kitchen-pan-multi

## Resumen

`giava-kitchen-pan-multi` es una política robótica (policy) entrenada con LeRobot y publicada en Hugging Face por el usuario `fecasado`. No se trata de un modelo de lenguaje: es un controlador visomotor para manipulación robótica, concretamente para la tarea de colocar o manipular una sartén sobre una placa de cocina, según se deduce del dataset asociado `fecasado/pan-on-hob-320x240`. El modelo emplea el esquema de entrenamiento `gaze_flow_matching`, una variante de flow matching orientada a políticas de imitación, y se distribuye en formato safetensors con 235.899.950 parámetros (aproximadamente 236 M).

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación con 32 descargas y sin métricas publicadas, orientado a experimentación con LeRobot y robots tipo SO-100. No compite con modelos fundacionales de robótica como RT-2 o π0, sino que ejemplifica el flujo de trabajo de imitación end-to-end sobre un dataset propio de demostraciones.

La model card es prácticamente una plantilla sin rellenar: no incluye información sobre arquitectura interna, composición del dataset de entrenamiento, hiperparámetros, resultados de evaluación ni limitaciones. Todo dato no presente en la información disponible se marca explícitamente como tal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gaze_flow_matching`; política de imitación visomotora sobre LeRobot, detalles internos no publicados) |
| Parámetros totales | 235.899.950 (según safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones por paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin interfaz de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,9 GB) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna. La etiqueta `gaze_flow_matching` sugiere una política basada en flow matching (modelado generativo de trayectorias de acción mediante campos de flujo) condicionada por observaciones visuales, probablemente con un componente de atención o "gaze" que selecciona regiones relevantes de la imagen. El framework es LeRobot, la librería de Hugging Face para aprendizaje por imitación, y el pipeline declarado es `robotics`.

El entrenamiento se realizó sobre el dataset `fecasado/pan-on-hob-320x240`, que por su nombre indica imágenes de 320x240 píxeles de una sartén sobre una placa. No se especifican número de episodios, número de demostraciones, composición, aumentos de datos ni si hubo entrenamiento adicional (RL, DAgger). La model card solo documenta los comandos `lerobot-train` y `lerobot-record` con `--policy.type=act` como ejemplo genérico, lo que no confirma que este checkpoint use ACT; es texto de plantilla.

## Capacidades

- Control robótico visomotor para una tarea de manipulación de cocina (sartén sobre placa), a partir de observaciones de cámara de 320x240.
- Ejecución de políticas de imitación entrenadas con LeRobot, invocables mediante `lerobot-record` con `--policy.path`.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue sobre robots compatibles (el ejemplo de la card usa `so100_follower`).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, código, matemáticas ni capacidades multilingües.
- No se documenta modo "thinking", visión general, audio ni ninguna capacidad fuera del control motor.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como checkpoint de referencia para reproducir o comparar variantes de flow matching en LeRobot sobre una tarea de manipulación concreta.
- Prototipado de pipelines de robótica de sobremesa: usar el modelo con un robot SO-100 y una cámara de baja resolución para validar el bucle completo de `lerobot-record` y captura de episodios de evaluación.
- Benchmark interno de políticas: comparar la política `gaze_flow_matching` frente a ACT u otras políticas de LeRobot sobre el mismo dataset `pan-on-hob-320x240`, midiendo tasa de éxito por episodio.
- Docencia y demos de robótica: ejemplo tangible de entrenamiento end-to-end con datos de demostración y despliegue en hardware de bajo coste.
- Generación de datos sintéticos de evaluación: ejecutar la política en simulación o en robot real para recolectar trayectorias y analizar modos de fallo.
- Base para fine-tuning: partir de estos pesos y reentrenar sobre variaciones de la tarea (otra vajilla, otra posición de la placa) con un dataset propio, dado que la licencia Apache-2.0 lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación, comparaciones con ACT ni métricas de simulación o reales.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 236 M parámetros en fp32, los pesos ocupan aproximadamente 0,94 GB; en fp16, unos 0,47 GB. El consumo real depende del codificador visual y del tamaño del lote, no documentados.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder cargar el modelo en fp16, pero es una estimación, no un dato del autor.
- GPU de consumo: probablemente cabe en RTX 3060, RTX 4060, RTX 4090 y similares; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), tal y como indica la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fecasado/giava-kitchen-pan-multi` | 235,9 M | imágenes 320x240 (dataset) | sartén sobre placa | Apache-2.0 | Hugging Face, 32 descargas |
| Políticas ACT de LeRobot | variable (típicamente decenas de M) | imágenes de cámara | manipulación genérica | Apache-2.0 (LeRobot) | Hugging Face / repo LeRobot |
| Políticas Diffusion Policy | variable | imágenes de cámara | manipulación genérica | según implementación | repos de investigación |
| π0 (Physical Intelligence) | varios miles de M | multimodal | control generalista | no disponible en la información | no disponible |

La comparación cuantitativa no es posible: no hay benchmarks publicados para este checkpoint ni métricas equivalentes en la información disponible.

## Limitaciones y advertencias

- Model card incompleta: es una plantilla sin rellenar ("Model type not recognized"), sin detalles de arquitectura, datos ni evaluación.
- Sin métricas de éxito: no hay evidencia publicada de que la política funcione de forma fiable en robot real.
- Especialización estrecha: entrenada para una única tarea y un único dataset; no generaliza a otras tareas sin reentrenamiento.
- Dependencia de la configuración: el rendimiento depende de la cámara, la resolución 320x240, la iluminación y la morfología del robot; cambios en el montaje pueden degradar el comportamiento.
- Riesgo de sobreajuste a las demostraciones: sin datos de validación publicados, no puede descartarse.
- Sesgos: no evaluados; en robótica, sesgos de posición, iluminación o tipo de objeto del dataset pueden propagarse a la política.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- No apta para producción sin validación previa en el hardware objetivo y con protocolos de seguridad física.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/giava-kitchen-pan-multi
- Dataset asociado: https://huggingface.co/datasets/fecasado/pan-on-hob-320x240
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

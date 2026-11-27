# hatakeyama8490836/smolvla_driver_20000

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por el equipo de LeRobot de Hugging Face, diseñado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. La versión aquí documentada, `smolvla_driver_20000`, es un ajuste fino del checkpoint base `lerobot/smolvla_base` sobre un dataset propio de conducción/maniobra (`driver_20261125_131932`), entrenado con la librería LeRobot y publicado bajo licencia Apache 2.0.

El modelo resuelve el problema de mapear directamente píxeles e instrucciones a acciones motoras de bajo nivel, eliminando la necesidad de pipelines de percepción-planificación separados. Su propuesta central es conseguir un rendimiento competitivo en tareas de manipulación robótica con un coste computacional reducido, de forma que pueda desplegarse en hardware de consumo en lugar de requerir clústeres de GPU.

Con aproximadamente 450 millones de parámetros (450.046.176 según los pesos en safetensors) y un repositorio de 0,9 GB, SmolVLA se posiciona como una alternativa ligera frente a VLA de mayor escala. La información pública disponible sobre esta variante concreta es escasa: no se detallan idiomas, benchmarks ni composición del dataset de ajuste, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, implementada en LeRobot; detalles internos de la arquitectura no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 0,9 GB |
| Dataset de ajuste | hatakeyama8490836/driver_20261125_131932 |
| Paper de referencia | arXiv:2506.01844 |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action: combina un codificador visual, un componente de lenguaje y una cabeza de predicción de acciones que genera comandos motores a partir de observaciones e instrucciones. El paper de referencia (arXiv:2506.01844) lo describe como un VLA compacto y eficiente, pensado para igualar el rendimiento de modelos mayores con menor coste computacional y capacidad de ejecución en hardware de consumo. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset original ni si se aplicaron etapas de RLHF o DPO.

Esta variante concreta se ha obtenido por ajuste fino supervisado (fine-tuning) del checkpoint `lerobot/smolvla_base` sobre el dataset `driver_20261125_131932`, usando el flujo de entrenamiento de LeRobot (`lerobot-train`). El nombre del repositorio sugiere un entrenamiento de 20.000 pasos, aunque este dato no se confirma en la model card. No se especifican innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) para esta versión.

## Capacidades

- Control robótico por imitación: genera acciones motoras a partir de observaciones visuales e instrucciones, orientado a tareas de manipulación y conducción.
- Percepción visual integrada: procesa imágenes de cámara como entrada directa, sin pipeline de visión separado.
- Comprensión de instrucciones en lenguaje natural para condicionar la política de acción (capacidades multilingües no documentadas).
- Integración nativa con LeRobot: entrenamiento, evaluación y registro de episodios mediante `lerobot-train` y `lerobot-record`.
- Despliegue en hardware de consumo según la descripción del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo es una política de acción, no un agente conversacional).
- Modo thinking, visión general, audio: no disponible.

## Casos de uso

- Manipulación robótica de laboratorio: ajustar el modelo sobre un dataset propio de episodios teleoperados (como `driver_20261125_131932`) para que un brazo tipo SO-100 ejecute tareas de pick-and-place condicionadas por instrucciones.
- Investigación en imitación de bajo coste: usar el checkpoint base y esta variante como punto de partida para experimentos de VLA en una sola GPU de consumo, gracias a sus 450 M de parámetros y 0,9 GB de pesos.
- Prototipado de políticas de conducción o navegación: el dataset de ajuste orientado a "driver" sugiere su uso para mapear observaciones visuales a comandos de movimiento en plataformas móviles.
- Evaluación reproducible en LeRobot: ejecutar `lerobot-record` con `--policy.path` apuntando a este checkpoint para comparar políticas sobre el mismo entorno y conjunto de episodios.
- Docencia y formación: demostrar el ciclo completo de entrenamiento y evaluación de un VLA sin infraestructura de clústeres, dado el reducido tamaño del modelo.
- Base para ajustes posteriores: al estar bajo Apache 2.0 y en formato safetensors, sirve como inicialización para nuevos dominios robóticos con datasets propios.
- Integración en pipelines de investigación con Hugging Face Hub: versionado y descarga automatizada de checkpoints dentro de flujos de experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito en tareas, tasas de acierto ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 1,8 GB solo para pesos (450 M de parámetros), más memoria para activaciones y buffers visuales.
- En fp16/bf16: alrededor de 0,9 GB para pesos, holgadamente dentro de cualquier GPU de consumo moderna.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4-8 GB de VRAM para inferencia; para entrenamiento, se recomienda una RTX 3090/4090 o superior. El modelo base está descrito como desplegable en hardware de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a una política robótica de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_driver_20000 (este) | 450 M | no disponible | VLA compacto ajustado para conducción | Apache 2.0 | Hugging Face (LeRobot) |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | no disponible | VLA compacto base | Apache 2.0 | Hugging Face (LeRobot) |
| Otros VLA de mayor escala (p. ej. familias tipo OpenVLA) | no disponible en la informacion proporcionada | no disponible | VLA de gran tamaño | no disponible | no disponible |

La comparación cuantitativa con alternativas no es posible con los datos disponibles; únicamente se confirma que este checkpoint deriva del modelo base oficial de SmolVLA.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset propio de conducción, puede heredar sesgos específicos de las condiciones de captura (iluminación, entorno, hardware).
- Riesgo de alucinación: en un VLA se traduce en acciones incorrectas o inseguras ante situaciones fuera de distribución; no hay evaluación publicada de robustez.
- Limitaciones de contexto e idioma: no se especifican la ventana de contexto ni los idiomas soportados en las instrucciones.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la licencia del dataset de ajuste antes de uso comercial.
- Caveats para producción: repositorio con 0 descargas y 0 likes, sin validación comunitaria; no hay métricas de éxito ni información sobre el dataset de entrenamiento. No debe desplegarse en un robot real sin evaluación exhaustiva en el entorno objetivo.
- El modelo es una política de acción, no un asistente conversacional: no debe esperarse de él generación de texto libre, tool calling ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hatakeyama8490836/smolvla_driver_20000
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de ajuste: https://huggingface.co/datasets/hatakeyama8490836/driver_20261125_131932
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

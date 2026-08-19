# maedmatt/DREAM_SmolVLA_all201

## Resumen

El modelo `maedmatt/DREAM_SmolVLA_all201` es un policy de robótica basado en SmolVLA, un modelo visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por HuggingFace, que permite desplegar control robótico en hardware de consumo. Este checkpoint concreto es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 201 episodios, con 105.529 frames, para la tarea "Fill the pyramid with circles" (rellenar la pirámide con círculos). El modelo fue entrenado con LeRobot 0.6.2 y está pensado para ser ejecutado en un robot tipo `so_follower` con tres cámaras.

Con 450 millones de parámetros (450.046.176 exactamente), este modelo es significativamente más pequeño que otros VLA como OpenVLA (7B) o RT-2 (55B), lo que lo hace adecuado para GPUs de gama media y despliegue en tiempo real. Su arquitectura combina un codificador visual, un modelo de lenguaje y un MLP de acción, generando comandos de acción de 6 dimensiones a partir de observaciones de estado y tres imágenes de 256x256. La licencia Apache 2.0 permite uso comercial sin restricciones.

Este modelo es relevante porque demuestra que es posible entrenar políticas robóticas efectivas con datasets pequeños y hardware asequible, siguiendo la filosofía de SmolVLA de reducir la barrera de entrada en la robótica de imitación. Al estar integrado con LeRobot, su reproducción y despliegue es directa mediante comandos CLI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basado en SmolVLM + MLP de acción) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un codificador visual (basado en la familia SmolVLM) con un modelo de lenguaje y una cabeza de acción MLP. En este checkpoint, el modelo base `lerobot/smolvla_base` fue fine-tuneado con el dataset `maedmatt/DREAM-pyramid-circles`, que contiene 201 episodios de demostración a 30 FPS, sumando 105.529 frames. La tarea consiste en rellenar una pirámide con círculos, y las observaciones incluyen el estado del robot (6 dimensiones) y tres imágenes de 256x256 píxeles. La salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó con 20.000 pasos, batch size de 32, optimizador AdamW, learning rate de 0.0001 y semilla 1000, utilizando la librería LeRobot 0.6.2. No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning de imitación supervisada. El modelo está diseñado para ser ejecutado en tiempo real sobre un robot `so_follower`, con las cámaras configuradas como `front`. No se han publicado detalles sobre la composición exacta del dataset ni sobre técnicas de aumento de datos.

## Capacidades

- Control robótico de 6 grados de libertad (acciones de 6 dimensiones) a partir de observaciones de estado y tres cámaras.
- Manipulación de objetos en tareas de apilamiento y colocación (en este caso, rellenar una pirámide con círculos).
- Inferencia en tiempo real gracias a su tamaño compacto (450M parámetros).
- Integración nativa con LeRobot para entrenamiento, evaluación y despliegue.
- Soporte de múltiples cámaras (hasta 3 en este checkpoint) para percepción visual.
- No incluye capacidades de lenguaje conversacional, tool calling ni razonamiento multi-step; es un policy puramente motor.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede controlar un brazo robótico para recoger y colocar objetos en posiciones específicas, como en la tarea de rellenar una pirámide con círculos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo fine-tunear SmolVLA con datasets pequeños y evaluar su transferencia a otras tareas.
- Prototipado rápido de políticas robóticas en hardware de consumo: al ser un modelo de 450M parámetros, puede ejecutarse en GPUs como una RTX 3060 o 4090, permitiendo iterar rápidamente en entornos de desarrollo.
- Educación y demostraciones de robótica: su integración con LeRobot y la disponibilidad del dataset facilitan su uso en cursos y talleres de robótica.
- Benchmarking de VLA compactos: puede utilizarse como referencia para comparar el rendimiento de modelos pequeños frente a alternativas más grandes en tareas de manipulación.
- Despliegue en robots de bajo coste: el robot `so_follower` es un hardware asequible, y el modelo está optimizado para funcionar en él, lo que lo hace adecuado para entornos con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito en la tarea, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 450M parámetros, en fp32 se necesitan aproximadamente 1,8 GB; en fp16, 0,9 GB; en int8, 0,45 GB. Sin embargo, no se han publicado requisitos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia en fp16. Modelos como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida podrían funcionar.
- El modelo está diseñado para hardware de consumo, según la descripción de SmolVLA.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). También puede integrarse con vLLM o TGI si se convierte a formatos compatibles, aunque no hay documentación específica.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una inferencia en tiempo real (30 FPS) en GPUs modernas, pero no hay datos medidos.

## Comparativa con modelos similares

No se dispone de comparativas oficiales en la información proporcionada. Sin embargo, por conocimiento general, SmolVLA (450M) es significativamente más pequeño que otros VLA como OpenVLA (7B) o RT-2 (55B), lo que lo hace más adecuado para despliegue en hardware de consumo, aunque probablemente con menor rendimiento en tareas complejas. No se han publicado resultados comparativos en este repositorio.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados, por lo que se desconoce la tasa de éxito real en la tarea.
- El modelo está entrenado específicamente para la tarea "Fill the pyramid with circles" y puede no generalizar a otras tareas sin fine-tuning adicional.
- Depende de la configuración de cámaras y del robot `so_follower`; cambios en la disposición de las cámaras o en el robot pueden degradar el rendimiento.
- No se han documentado sesgos ni riesgos de alucinación, pero al ser un modelo de control motor, no genera texto.
- La licencia Apache 2.0 permite uso comercial, pero el dataset `maedmatt/DREAM-pyramid-circles` puede tener sus propias restricciones; se recomienda revisar su licencia.
- El modelo fue creado en agosto de 2026 (según la fecha del repositorio), lo que puede implicar que la versión de LeRobot o del modelo base haya evolucionado.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/maedmatt/DREAM_SmolVLA_all201)
- [Paper de SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Dataset de entrenamiento](https://huggingface.co/datasets/maedmatt/DREAM-pyramid-circles)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Guía de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)

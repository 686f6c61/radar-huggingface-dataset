# Revolabs/cortex_agv_iwu_scout_1_27082026_cs15

## Resumen

El modelo `cortex_agv_iwu_scout_1_27082026_cs15` es una política de control robótico (policy) desarrollada por Revolabs para la conducción autónoma de un vehículo guiado automáticamente (AGV) del tipo `revobots_agv_follower`. Está entrenado con el framework LeRobot de Hugging Face mediante aprendizaje por imitación, a partir de un dataset propio de 33 episodios con 57.466 fotogramas capturados a 15 FPS. El modelo recibe como entrada el estado del robot (5 variables) y una imagen frontal de 480x640 píxeles, y produce una acción de control de 2 dimensiones (presumiblemente velocidad y dirección). Con 51,6 millones de parámetros, es un modelo compacto orientado a tareas de navegación en entornos industriales. Su relevancia radica en ser un ejemplo práctico de aplicación de LeRobot a robótica móvil, con licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política `cortex_agv` sin especificación interna) |
| Parametros totales | 51.622.714 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la documentación proporcionada. Se trata de una política de imitación entrenada con LeRobot, que mapea observaciones multimodales (estado del robot de 5 dimensiones e imagen frontal de 3 canales a 480x640) a una acción de control de 2 dimensiones. El entrenamiento se realizó con 100.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000, utilizando la versión 0.6.1 de LeRobot. El dataset de entrenamiento contiene 33 episodios de la tarea "Drive the AGV", con 57.466 fotogramas a 15 FPS. No se mencionan técnicas adicionales como RLHF, DPO o decodificación especulativa, al tratarse de un modelo de control robótico.

## Capacidades

- Conducción autónoma de un AGV: genera comandos de control (acción de 2 dimensiones) a partir de observaciones de estado y visión frontal.
- Percepción visual: procesa imágenes de cámara frontal de 480x640 píxeles para la navegación.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones humanas o teleoperadas.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.
- No incluye capacidades de lenguaje, tool calling, razonamiento simbólico ni procesamiento multimodal más allá de la visión y el estado.

## Casos de uso

- Navegación autónoma en almacenes: el AGV puede transportar mercancías siguiendo rutas aprendidas, usando la cámara frontal para evitar obstáculos y el estado para mantener la trayectoria.
- Automatización de líneas de producción: integración en cintas transportadoras o zonas de ensamblaje para mover piezas entre estaciones.
- Investigación en robótica móvil: sirve como punto de partida para experimentos con LeRobot, permitiendo comparar políticas de imitación en tareas de conducción.
- Prototipado rápido de controladores: al ser un modelo pequeño, puede desplegarse en hardware de bajo coste para validar conceptos antes de escalar.
- Formación y simulación: uso en entornos simulados para entrenar operarios o probar algoritmos de control antes de implementarlos en robots reales.
- Desarrollo de flotas de AGV: el modelo puede servir como base para personalizar comportamientos de navegación en diferentes entornos industriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada: no disponible, pero dado el tamaño del modelo (51,6 M parámetros), la inferencia debería requerir menos de 1 GB de VRAM en FP32, y menos aún en cuantizaciones (aunque no se ofrecen oficialmente).
- GPU recomendadas: cualquier GPU con soporte CUDA (por ejemplo, NVIDIA GTX 1080, RTX 3060 o superiores). También podría ejecutarse en CPU para inferencia a baja frecuencia.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna de consumo.
- Opciones de despliegue: LeRobot (comandos `lerobot-rollout`), posible exportación a ONNX o TensorRT para inferencia optimizada, aunque no se documenta oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se ha encontrado información sobre modelos comparables de la misma categoría (políticas de control para AGV entrenadas con LeRobot) en la documentación proporcionada.

## Limitaciones y advertencias

- Dataset reducido: solo 33 episodios de entrenamiento, lo que puede limitar la generalización a entornos o condiciones no vistas.
- Sin evaluación en robot real: no se reportan resultados de éxito en pruebas físicas, por lo que el rendimiento real es incierto.
- Dependencia de la configuración del robot: las observaciones (estado de 5 dimensiones e imagen frontal) son específicas del robot `revobots_agv_follower`; su uso en otros robots requeriría adaptación.
- Riesgo de sobreajuste: el entrenamiento con 100.000 pasos sobre un dataset pequeño puede provocar memorización de las demostraciones.
- Sin soporte multilingüe ni capacidades de lenguaje: no es adecuado para tareas de procesamiento de texto.
- Licencia Apache 2.0: permite uso comercial, pero se debe verificar la procedencia de los datos de entrenamiento y cumplir con las condiciones de la licencia.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Revolabs/cortex_agv_iwu_scout_1_27082026_cs15)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Revolabs/iwu_scout_1_27082026_train)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)

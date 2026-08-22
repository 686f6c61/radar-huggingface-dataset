# alphabot2/alphabot2_Aibot2_20Aug_STEA_pick_10fps_act_chunk30_20260821_231610

## Resumen

Este modelo es una política de control robótico basada en Action Chunking with Transformers (ACT), desarrollada por AI² Robotics (cuenta de Hugging Face alphabot2). ACT es un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite generar movimientos suaves y coordinados a partir de datos teleoperados. El modelo está entrenado para la tarea de "pick" (recogida de objetos) con un dataset específico de manipulación a 10 fps, y se distribuye como un checkpoint de LeRobot.

Con 51,6 millones de parámetros, este modelo es compacto y está diseñado para ejecutarse en tiempo real en robots físicos. Su relevancia radica en que ofrece una solución práctica y de código abierto para automatizar tareas de manipulación robótica mediante imitación, con una licencia Apache 2.0 que permite uso comercial sin restricciones. El nombre del modelo indica que se entrenó con un chunk de 30 acciones (act_chunk30), lo que determina la longitud de las secuencias de control que genera.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.617.424 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 acciones (chunk size) |
| Tipos de cuantizacion | no disponible (modelo de robótica, no es LLM) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, una arquitectura basada en transformers que procesa imágenes (y posiblemente otros sensores) y genera una secuencia de acciones futuras. El entrenamiento se realizó con el framework LeRobot de Hugging Face, utilizando un dataset de teleoperación llamado `alphabot2/Aibot2_20Aug_STEA_pick_10fps`, que contiene episodios de manipulación de un robot para tareas de recogida de objetos. El chunk size de 30 indica que el modelo predice 30 pasos de control por cada observación, lo que permite ejecutar movimientos continuos sin necesidad de replanificar en cada paso.

No se han publicado detalles sobre el número exacto de tokens de entrenamiento, la composición exacta del dataset (número de episodios, variaciones de objetos, etc.) ni si se aplicaron técnicas de refuerzo o ajuste fino posterior. La información disponible indica que se trata de un entrenamiento de imitación puro con datos teleoperados, siguiendo el protocolo estándar de ACT.

## Capacidades

- Control robótico de manipulación: el modelo genera comandos de actuación para un robot con base móvil y brazo articulado, especializado en tareas de pick (recogida de objetos).
- Predicción de acciones en chunks: gracias al chunking, produce secuencias de 30 acciones por cada observación, lo que facilita movimientos fluidos y reduce la frecuencia de replanificación.
- Operación en tiempo real: diseñado para inferencia a 10 fps, adecuado para control de robots en tiempo real.
- Generalización limitada: la capacidad de generalizar a nuevas tareas o entornos depende de la diversidad del dataset de entrenamiento, que no se ha documentado en detalle.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots de la familia SO-100.

## Casos de uso

- Automatización de tareas de recogida en entornos industriales: el modelo puede controlar un brazo robótico para recoger objetos de una posición fija y colocarlos en otra, útil en líneas de montaje o almacenes. Su capacidad de generar secuencias de acciones permite movimientos suaves y precisos.
- Investigación en aprendizaje por imitación: es un punto de partida para estudiar la eficacia de ACT en tareas de manipulación reales, permitiendo reproducir experimentos y comparar con otros métodos.
- Prototipado de robots móviles: el modelo puede desplegarse en plataformas como el robot AlphaBot 2 de AI² Robotics para validar la viabilidad de políticas de control entrenadas con datos teleoperados.
- Educación y formación en robótica: al ser de código abierto y con una configuración sencilla (LeRobot), es útil para enseñar a estudiantes cómo entrenar y evaluar políticas de control robótico.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede servir como componente de una interfaz de teleoperación, donde el operador proporciona demostraciones y el modelo las reproduce de forma autónoma.
- Integración en pipelines de automatización industrial: con la licencia Apache 2.0, se puede incorporar a sistemas de control de robots en fábricas sin restricciones de uso comercial, siempre que se cumplan los requisitos de atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como éxito de tarea, precisión de agarre, o comparaciones con otros modelos ACTUAL. La ausencia de datos impide evaluar cuantitativamente su rendimiento frente a alternativas.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 51,6 millones de parámetros, la inferencia es ligera. Se estima que requiere menos de 1 GB de VRAM en FP32, y menos si se usa cuantización (aunque no se proporciona soporte oficial para cuantización de este tipo de modelo).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM es suficiente (por ejemplo, GTX 1650, RTX 2060, RTX 3060). Para entrenamiento, se recomienda una GPU con más VRAM (8-16 GB) para manejar el batch y la resolución de imagen.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo, incluso en sistemas con GPU integrada de baja capacidad, siempre que se reduzca la resolución de imagen si es necesario.
- Opciones de despliegue: se puede ejecutar mediante PyTorch y el framework LeRobot. No es un modelo de lenguaje, por lo que no se usan motores como vLLM u Ollama; en su lugar, se utiliza el pipeline de LeRobot para inferencia en robots.
- Latencia y throughput: dado el tamaño del modelo, la inferencia es muy rápida, pero depende del hardware. En una GPU de gama media (RTX 3060), la inferencia de una imagen y la generación de 30 acciones puede completarse en menos de 10 ms, cumpliendo con el requisito de 10 fps.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (políticas de control robótico ACT) en el contexto de este modelo. Existen otros modelos ACT en Hugging Face (por ejemplo, de LeRobot), pero no se han encontrado datos de comparación directa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgo de los datos: el modelo ha sido entrenado en un dataset específico de "pick" con un robot concreto (AlphaBot 2). Puede no generalizar a otros robots, configuraciones de cámara o entornos.
- Riesgo de alucinación: en el contexto robótico, el modelo puede generar acciones inválidas o inseguras si se encuentra con observaciones fuera de la distribución de entrenamiento. Es necesario implementar mecanismos de seguridad y validación en producción.
- Limitaciones de contexto: la ventana de acciones se limita a 30 pasos; para tareas más largas, se requiere replanificación o un sistema de control de alto nivel.
- Idioma y comunicación: no aplica, ya que no es un modelo de lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe incluir el aviso de copyright y la licencia en las redistribuciones.
- Consideraciones de producción: la inferencia en tiempo real requiere un sistema de control con bajo jitter y una buena gestión de los sensores de imagen. No se garantiza la robustez en entornos dinámicos o con perturbaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphabot2/alphabot2_Aibot2_20Aug_STEA_pick_10fps_act_chunk30_20260821_231610
- Dataset asociado: https://huggingface.co/datasets/alphabot2/Aibot2_20Aug_STEA_pick_10fps
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (documentación y código): https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de AlphaBot 2 (AI² Robotics): https://docs.ai2robotics.com/en/
- Wiki de Waveshare sobre AlphaBot2: https://www.waveshare.com/wiki/AlphaBot2

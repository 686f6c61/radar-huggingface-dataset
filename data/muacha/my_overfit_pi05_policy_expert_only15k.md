# muacha/my_overfit_pi05_policy_expert_only15k

## Resumen

Este modelo es un fine-tuning de π₀.₅ (Pi05), un Vision-Language-Action (VLA) desarrollado por Physical Intelligence, adaptado e implementado en la librería LeRobot de Hugging Face. El autor, muacha, ha entrenado esta política sobre el modelo base `lerobot/pi05_base` utilizando un dataset propio de demostraciones de manipulación robótica (recoger frascos de vidrio y colocarlos en un contenedor). El resultado es una política especializada para esa tarea concreta, con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones).

La relevancia de este modelo radica en que demuestra el flujo de fine-tuning de un VLA de última generación sobre datos propios mediante LeRobot, un framework de código abierto para aprendizaje por imitación en robótica. Aunque el modelo está sobreajustado a un dataset muy pequeño (22 episodios), sirve como ejemplo práctico de cómo adaptar un modelo generalista a una tarea específica. No se han publicado resultados de evaluación, por lo que su rendimiento real en el mundo físico no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅, implementación LeRobot |
| Parametros totales | 4.143.404.816 (4,14 B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | no disponible (modelo de acción robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, un VLA que extiende π₀ para lograr generalización a entornos y situaciones no vistas durante el entrenamiento. La implementación en LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. No se dispone de detalles internos de la arquitectura (número de capas, tipo de atención, etc.) en la información proporcionada.

El entrenamiento se realizó mediante fine-tuning del modelo base `lerobot/pi05_base` sobre un dataset de demostraciones humanas (aprendizaje por imitación). El dataset contiene 22 episodios y 8.738 frames a 15 FPS, con dos variantes de la misma tarea. Se usaron 15.000 pasos de entrenamiento, batch size 8, optimizador AdamW con learning rate 0,0003 y semilla 1000. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; es un entrenamiento supervisado estándar de imitación.

## Capacidades

- Control de un robot manipulador móvil a partir de observaciones visuales (tres cámaras: base, muñeca izquierda y muñeca derecha) y estado del robot (7 dimensiones).
- Generación de acciones de 7 dimensiones (probablemente posiciones articulares o comandos de efector final) para tareas de manipulación.
- Especialización en la tarea de recoger frascos de vidrio y colocarlos en un contenedor, según el dataset de entrenamiento.
- Capacidad de generalización a entornos nuevos, heredada del modelo base π₀.₅, aunque no está verificada en este fine-tuning concreto.
- No soporta generación de texto, tool calling, agentes conversacionales ni razonamiento simbólico; es exclusivamente un modelo de acción robótica.

## Casos de uso

- Automatización de tareas de recogida y colocación de objetos en entornos industriales: el modelo puede controlar un brazo robótico para manipular frascos u objetos similares, reduciendo la necesidad de programación manual.
- Investigación en aprendizaje por imitación: sirve como ejemplo de fine-tuning de un VLA sobre datos propios, útil para estudiar la transferencia de capacidades de modelos generalistas a tareas específicas.
- Prototipado rápido de políticas robóticas: con solo 22 episodios de demostración, se puede obtener una política funcional para una tarea concreta, acelerando el ciclo de desarrollo en laboratorios.
- Robótica doméstica asistencial: la tarea de recoger objetos y colocarlos en contenedores es común en entornos domésticos; el modelo podría adaptarse a variantes de esta tarea.
- Benchmarking de VLA en hardware real: al estar disponible en LeRobot, permite comparar el rendimiento de π₀.₅ fine-tuneado frente a otras políticas en robots físicos.
- Educación y formación en robótica: el modelo y su flujo de entrenamiento documentado sirven como material didáctico para enseñar aprendizaje por imitación con VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación. No se proporcionan métricas como tasa de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 4,14 mil millones de parámetros, se estima que en FP16 necesitaría al menos 8-10 GB de VRAM, pero no hay confirmación.
- GPU recomendadas: no se especifican. Dado el tamaño, una GPU con 12 GB o más (RTX 3080/4080, A100, etc.) sería necesaria para inferencia en tiempo real.
- No cabe en GPUs de consumo básico (menos de 8 GB) sin cuantización, pero no se ofrecen versiones cuantizadas.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, que usa PyTorch. Se puede integrar con robots compatibles con LeRobot (por ejemplo, SO-100, Koch, etc.) a través de los comandos `lerobot-rollout`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría (VLA de tamaño similar). El modelo base π₀.₅ es el punto de referencia, pero no se tienen datos de rendimiento de este fine-tuning frente a otras políticas. Se indica "no disponible".

## Limitaciones y advertencias

- Sobreajuste severo: el modelo fue entrenado con solo 22 episodios y 15.000 pasos, lo que sugiere un alto riesgo de sobreajuste al dataset concreto. No generalizará bien a variaciones de la tarea, iluminación, posiciones de objetos o robots diferentes.
- Sin evaluación verificada: no hay resultados de pruebas en robot real, por lo que su funcionamiento en el mundo físico es incierto.
- Dependencia de cámaras específicas: el modelo espera exactamente tres cámaras con las mismas resoluciones y nombres (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`). Cualquier cambio en la configuración de hardware invalidará la política.
- Alcance limitado: solo es capaz de ejecutar la tarea de recoger frascos y colocarlos en contenedor; no es un modelo generalista de manipulación.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base π₀.₅ puede tener restricciones adicionales; se recomienda revisar la licencia del modelo base.
- No es un modelo de lenguaje: no puede procesar texto ni mantener conversaciones; su entrada es exclusivamente visual y de estado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muacha/my_overfit_pi05_policy_expert_only15k
- Blog de Physical Intelligence sobre π₀.₅: https://www.pi.website/blog/pi05
- Repositorio de LeRobot (implementación de pi05): https://github.com/huggingface/lerobot/tree/main/src/lerobot/policies/pi05
- Dataset de entrenamiento: https://huggingface.co/datasets/muacha/glass_uncap_comp_mapped_final
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05

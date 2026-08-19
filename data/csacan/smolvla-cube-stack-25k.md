# csacan/smolvla-cube-stack-25k

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face y presentado en el paper arxiv:2506.01844. Este repositorio concreto, `csacan/smolvla-cube-stack-25k`, es un fine-tuning del modelo base `lerobot/smolvla_base` para una tarea específica de manipulación robótica: apilar tres cubos en forma de pirámide. El modelo ha sido entrenado con LeRobot, la librería de aprendizaje por imitación para robots de Hugging Face.

El modelo cuenta con 450 millones de parámetros, lo que lo sitúa en una categoría de tamaño reducido en comparación con otros VLA como OpenVLA (7B). Está diseñado para ejecutarse en hardware de consumo, como se indica en el propio paper. La tarea concreta para la que se ha fine-tuneado es el apilado de cubos, utilizando un robot tipo `so_follower` con tres cámaras. Su relevancia radica en demostrar que un VLA compacto puede resolver tareas de manipulación reales con un coste computacional bajo, y en servir como ejemplo práctico de entrenamiento y despliegue con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en el modelo base SmolVLA (detalles internos no disponibles) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. La arquitectura exacta (número de capas, atención, etc.) no se detalla en la información proporcionada, pero el paper arxiv:2506.01844 describe un diseño compacto y eficiente orientado a hardware de consumo. Este repositorio es un fine-tuning del modelo base `lerobot/smolvla_base` para una tarea concreta.

El entrenamiento se realizó mediante aprendizaje por imitación (behavior cloning) con el dataset `yutong-xiang-97/robot-learning-260816`, que contiene 90 episodios y 55.912 frames a 30 FPS. La configuración de entrenamiento incluye 25.000 pasos, batch size de 64, optimizador AdamW, learning rate de 0.0001 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refuerzo; es un fine-tuning supervisado estándar sobre demostraciones.

## Capacidades

- Control de robot de manipulación: el modelo genera acciones de 6 dimensiones (posición y orientación del efector) a partir de observaciones de estado y tres cámaras.
- Percepción visual multimodal: procesa tres flujos de imagen (frontal y dos cámaras adicionales) para la toma de decisiones.
- Ejecución de tareas específicas: está entrenado exclusivamente para apilar tres cubos en una pirámide (el más pequeño arriba, el mediano en el centro y el más grande abajo).
- Integración con LeRobot: se puede ejecutar con el comando `lerobot-rollout` y fine-tunear con `lerobot-train` sobre el modelo base.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural general; es un modelo de acción puro.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorios: el modelo puede apilar objetos de diferentes tamaños, lo que es útil en entornos de investigación robótica para validar algoritmos de manipulación.
- Pruebas de concepto de VLA en hardware de consumo: gracias a su tamaño reducido, se puede desplegar en GPUs domésticas para experimentar con aprendizaje por imitación sin necesidad de infraestructura de alto coste.
- Benchmark de aprendizaje por imitación: sirve como referencia para comparar la eficiencia de modelos VLA compactos frente a alternativas más grandes en tareas de manipulación.
- Entrenamiento de nuevas tareas por fine-tuning: partiendo de este modelo o del base `lerobot/smolvla_base`, se puede adaptar a otras tareas de manipulación con pocos datos, como recoger objetos o insertar piezas.
- Demostración educativa: es un ejemplo completo de entrenamiento y despliegue de un VLA con LeRobot, útil para cursos de robótica y aprendizaje automático.
- Investigación en generalización de tareas: el modelo puede usarse para estudiar cómo se comporta un VLA compacto ante variaciones de iluminación, posición de objetos o configuraciones de cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. No hay datos de éxito en tareas, ni comparaciones con otros modelos en la información suministrada.

## Requisitos de hardware

- No se proporcionan requisitos de hardware específicos en la información disponible.
- Con 450 millones de parámetros, el modelo es considerablemente más ligero que otros VLA (por ejemplo, OpenVLA con 7B), por lo que es plausible que pueda ejecutarse en GPUs de consumo como RTX 3060 (12GB) o superiores, aunque no hay confirmación oficial.
- El repo pesa 8.1 GB, lo que sugiere que incluye checkpoints y posiblemente pesos en múltiples formatos, pero el modelo en sí ocupa aproximadamente 1.8 GB en fp32 (450M × 4 bytes).
- Para despliegue se recomienda usar LeRobot, que soporta inferencia con `lerobot-rollout` y entrenamiento con `lerobot-train` en CUDA. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que es un modelo de robótica, no un LLM general.
- La latencia y throughput estimados no están disponibles.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos en la información proporcionada. SmolVLA se presenta como una alternativa compacta a VLA más grandes como OpenVLA (7B) o RT-2 (55B), pero no hay números de rendimiento en la model card para establecer una comparación cuantitativa. Se recomienda consultar el paper arxiv:2506.01844 para detalles sobre la eficiencia del modelo base.

## Limitaciones y advertencias

- El modelo está fine-tuneado para una única tarea (apilar tres cubos específicos) y no es generalizable a otras tareas sin un nuevo entrenamiento.
- No se han reportado resultados de evaluación en el mundo real; no se conoce su tasa de éxito ni su robustez ante variaciones del entorno.
- Los datos de entrenamiento provienen de un único dataset con 90 episodios, lo que puede limitar la diversidad de situaciones aprendidas.
- No hay información sobre sesgos, pero al ser un modelo de robótica, los sesgos se manifiestan en comportamientos erráticos ante condiciones no vistas (iluminación, posiciones de cámara, etc.).
- Riesgo de alucinación en acciones: el modelo puede generar comandos de movimiento incorrectos si la observación difiere del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda validar el comportamiento del modelo en el hardware y entorno específicos antes de cualquier uso en producción.
- No se especifican idiomas ni capacidades de lenguaje, ya que el modelo no procesa texto; la entrada es únicamente estado y visión.

## Enlaces

- Repositorio del modelo: https://huggingface.co/csacan/smolvla-cube-stack-25k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/yutong-xiang-97/robot-learning-260816
- Documentación de LeRobot (smolvla): https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet

# Faless/piper_apples_c03_std_polso_smolvla_base_bs96_seme1000_rifatto

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales y del estado de las articulaciones. Esta ficha concreta, publicada por el usuario Faless, es un fine-tuning del modelo base `Faless/smolvla_base_adapted` sobre un dataset propio de 619 episodios y más de un millón de frames grabados a 30 FPS, orientado a la tarea de recoger manzanas rojas y depositarlas en una cesta verde con un robot Piper.

El modelo resuelve el problema de la imitación visual-motora de bajo coste: en lugar de requerir infraestructura de gran escala, SmolVLA está pensado para ejecutarse en hardware de consumo. Con 450 millones de parámetros y una arquitectura que combina un codificador visual, un modelo de lenguaje compacto y un cabezal de acciones, transforma dos cámaras RGB de 256x256 y un vector de estado de 8 dimensiones en una acción de 7 dimensiones por paso de control.

Su relevancia actual radica en que demuestra el flujo completo de LeRobot: grabación de datos, entrenamiento de una política de imitación y despliegue en un robot real mediante `lerobot-rollout`. Es un ejemplo práctico de fine-tuning de VLA para una tarea industrial concreta (picking y placing) con un presupuesto computacional reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control por pasos, no modelo de lenguaje conversacional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (8,), `observation.images.camera1` (3, 256, 256), `observation.images.camera2` (3, 256, 256) |
| Salidas | `action` (7,) |
| Tipo de robot | `piper_full` |
| Camaras | `ego`, `front` |
| Libreria | lerobot 0.6.2 |
| Tamano del repo | 1.8 GB |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta que combina percepción visual, comprensión del lenguaje de la tarea y generación de acciones motoras en un único modelo. El modelo consume dos flujos de imagen de 256x256 píxeles junto con un vector de estado de 8 dimensiones (posición y estado de las articulaciones del robot) y produce una acción de 7 dimensiones por paso de control. La tarea se especifica en lenguaje natural ("Pick the red apples one by one and place them into the green basket"), lo que permite condicionar la política a la instrucción.

El fine-tuning se realizó sobre el dataset `Faless/piper_apples_v7m_deposito_regolare_c03`, compuesto por 619 episodios y 1.050.896 frames a 30 FPS. La configuración de entrenamiento fue de 44.000 pasos, batch size 96, optimizador AdamW, learning rate 0.0001 y semilla 1000. El modelo parte de `Faless/smolvla_base_adapted`, un adaptado del SmolVLA base original. No se dispone de información sobre la composición exacta del dataset más allá de la tarea, ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables en el contexto de imitación).

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones para un robot Piper a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente dos cámaras (`ego` y `front`) a 256x256.
- Condicionamiento por lenguaje: acepta una descripción textual de la tarea para guiar la política.
- Imitación de tareas de picking y placing: entrenado específicamente para recoger manzanas rojas y depositarlas en una cesta verde.
- Ejecución en hardware de consumo: diseñado para desplegarse en GPUs de gama consumer.
- Integración con LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, agentes multi-paso ni capacidades conversacionales: es una política de control, no un modelo de lenguaje.
- Capacidades multilingües: no aplicable.

## Casos de uso

- Automatización de picking en líneas de clasificación de fruta: el modelo puede ejecutar la secuencia de recoger manzanas rojas y colocarlas en una cesta, integrándose en una célula robotizada con un Piper. Es adecuado porque está entrenado específicamente sobre esa tarea con más de un millón de frames.
- Prototipado rápido de políticas de imitación: un equipo de robótica puede partir de este modelo y fine-tunearlo con su propio dataset usando `lerobot-train`, reduciendo el tiempo de desarrollo.
- Investigación en VLA de bajo coste: sirve como referencia para estudiar cómo un modelo de 450M de parámetros se comporta en tareas de manipulación real con dos cámaras.
- Despliegue en laboratorio con hardware consumer: al estar pensado para GPUs de consumo, permite validar políticas en un puesto de trabajo sin clúster.
- Generación de datos sintéticos y evaluación de robustez: puede ejecutarse en `lerobot-rollout` para medir tasas de éxito bajo distintas posiciones de objetos o iluminación.
- Educación y formación en robótica: ejemplo completo del pipeline LeRobot (grabación, entrenamiento, despliegue) para cursos prácticos.
- Benchmarking de políticas de imitación: útil como baseline frente a otras políticas entrenadas sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450M de parámetros en fp32 el peso ronda 1,8 GB, por lo que en fp16 cabría en torno a 1 GB y en fp32 en torno a 2 GB, sin contar activaciones ni buffers de imagen.
- GPU recomendadas: no especificadas por el autor; SmolVLA está diseñado para hardware de consumo, por lo que una RTX 3060/4060 o superior debería ser suficiente para inferencia.
- Cabe en GPU consumer: sí, según la descripción del modelo base ("can be deployed on consumer-grade hardware").
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), con `--policy.path` apuntando al repo. No se documentan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según el dataset de entrenamiento, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SmolVLA fine-tuned) | 450M | no aplica | Picking de manzanas con Piper | no disponible | HuggingFace (27 descargas) |
| Faless/smolvla_base_adapted | no disponible | no aplica | Base VLA adaptado | no disponible | HuggingFace |
| SmolVLA base (HuggingFace) | ~450M (aprox., según paper) | no aplica | VLA generalista | no disponible en esta ficha | HuggingFace / LeRobot |
| Otras políticas LeRobot (ACT, Diffusion Policy) | variable | no aplica | Imitación robótica | variable | HuggingFace / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al estar entrenado sobre un dataset concreto de manzanas rojas y cesta verde, el modelo puede fallar ante cambios de color, forma o disposición de los objetos.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la política puede generar acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: la tarea se especifica en inglés; no se documenta soporte multilingüe.
- Restricciones de licencia: la licencia no está disponible, lo que impide confirmar si se permite uso comercial. Es un caveat importante para producción.
- Sin resultados de evaluación publicados: no hay tasa de éxito medida, por lo que no se puede garantizar robustez en entornos reales.
- Dependencia de hardware específico: entrenado para robot `piper_full` con cámaras `ego` y `front`; no es directamente transferible a otros robots sin reentrenamiento.
- Dataset de un solo operador y entorno: probable sobreajuste a condiciones de iluminación, posiciones y objetos del dataset original.
- Sin garantías de seguridad: no se documentan mecanismos de parada de emergencia ni límites de fuerza; el despliegue en producción requiere salvaguardas externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Faless/piper_apples_c03_std_polso_smolvla_base_bs96_seme1000_rifatto
- Modelo base: https://huggingface.co/Faless/smolvla_base_adapted
- Dataset de entrenamiento: https://huggingface.co/datasets/Faless/piper_apples_v7m_deposito_regolare_c03
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Faless/piper_apples_v7m_deposito_regolare_c03
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference

# heyunzhenwhat/pi0_so101-three-objects

## Resumen

El modelo `heyunzhenwhat/pi0_so101-three-objects` es un ajuste fino (fine-tuning) del modelo fundacional de robótica π₀ (Pi0) de Physical Intelligence, realizado con la librería LeRobot de Hugging Face. Pi0 es una política generalista de tipo Vision-Language-Action (VLA) que combina percepción visual, comprensión de instrucciones en lenguaje natural y control de robots. Este checkpoint concreto se ha entrenado para controlar un brazo robótico SO-101 (tipo `so_follower`) en una tarea específica: mover todos los objetos de una caja izquierda a una caja derecha, utilizando dos cámaras (una cenital y otra en la muñeca).

El modelo parte de `lerobot/pi0_base` y se ha ajustado con un dataset propio de 50 episodios (36 227 fotogramas a 30 FPS) recopilado por el autor. Con aproximadamente 4 028 millones de parámetros, es un modelo de tamaño considerable para robótica, aunque su especialización en una única tarea limita su aplicabilidad fuera del ámbito para el que fue entrenado. Su relevancia radica en demostrar el flujo de trabajo de ajuste fino de Pi0 con LeRobot sobre hardware asequible como el brazo SO-101, un ejemplo práctico de cómo adaptar un modelo VLA a tareas personalizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer (Pi0) |
| Parametros totales | 4 028 019 472 (≈4,03 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors) |
| Idiomas soportados | no disponible (probablemente inglés, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Pi0 es un modelo VLA desarrollado por Physical Intelligence que procesa entradas visuales (imágenes de cámaras) y texto (instrucciones en lenguaje natural) para generar acciones de control del robot. La implementación en LeRobot está adaptada del repositorio OpenPI. En este caso, el modelo base `lerobot/pi0_base` se ha ajustado con un dataset de demostración de 50 episodios que contienen la tarea "Move all objects from the left box to the right box". Las observaciones incluyen el estado del robot (6 dimensiones) y dos flujos de imagen: una cámara cenital de 720×1280 píxeles y una cámara de muñeca de 360×640 píxeles. La salida es una acción de 6 dimensiones (probablemente posición y orientación del efector).

El entrenamiento se realizó con 10 000 pasos, un tamaño de lote de 8, el optimizador AdamW y una tasa de aprendizaje de 2,5×10⁻⁵, con semilla 1000 y la versión 0.6.1 de LeRobot. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un ajuste por imitación (behavior cloning) sobre demostraciones.

## Capacidades

- Control robótico de un brazo SO-101 (tipo `so_follower`) para tareas de manipulación.
- Comprensión de instrucciones en lenguaje natural (en este caso, la tarea específica de mover objetos entre cajas).
- Percepción visual multimodal con dos cámaras: cenital y de muñeca.
- Generación de acciones continuas de 6 dimensiones (posición y orientación del efector).
- Ejecución de políticas en tiempo real mediante el flujo de rollout de LeRobot.
- No incluye capacidades de tool calling, agentes multi-paso ni razonamiento simbólico; es una política de acción directa.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede mover objetos de una ubicación a otra siguiendo una instrucción fija, útil en líneas de montaje o laboratorios de robótica.
- Investigación en aprendizaje por imitación: sirve como ejemplo de cómo ajustar Pi0 con un dataset pequeño (50 episodios) para una tarea concreta, permitiendo estudiar la transferencia de capacidades del modelo base.
- Desarrollo de prototipos con brazos SO-101: al ser un modelo ligero (≈4 B parámetros) y con licencia Apache 2.0, puede desplegarse en configuraciones de bajo coste para experimentación académica.
- Benchmarking de políticas VLA en hardware asequible: permite comparar el rendimiento de un fine-tuning de Pi0 frente a otras políticas entrenadas desde cero en la misma tarea.
- Educación en robótica y aprendizaje automático: el flujo de entrenamiento con LeRobot está bien documentado y puede reproducirse para enseñar conceptos de VLA y control robótico.
- Replicación de experimentos: dado que el dataset y el código están disponibles, otros investigadores pueden reproducir el entrenamiento y evaluar la robustez del modelo en diferentes condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No hay datos de tasas de éxito, ni comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con ≈4 B parámetros en FP32, se necesitarían al menos 16 GB de VRAM solo para los pesos; en la práctica, con optimizaciones como bf16 o cuantización, podría caber en GPUs de 12-16 GB, pero no hay datos confirmados.
- GPU recomendadas: no especificadas. Por el tamaño, una RTX 4090 (24 GB) o una A100 (40/80 GB) serían adecuadas para inferencia sin cuantizar.
- Compatibilidad con GPUs de consumo: probablemente sí en RTX 3090/4090 con bf16, pero no está verificado.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y ejecutan la política en el robot. También es posible usar la librería directamente en Python.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `heyunzhenwhat/pi0_so101-three-objects` | ≈4,03 B | no disponible | Mover objetos entre cajas (SO-101) | Apache 2.0 | Hugging Face |
| `lerobot/pi0_base` | ≈4,03 B (base) | no disponible | Generalista (múltiples tareas) | Apache 2.0 | Hugging Face |
| OpenVLA (7B) | ≈7 B | no disponible | Generalista (VLA) | MIT | Hugging Face |

La comparativa principal es con el modelo base `pi0_base`, del que deriva. Este fine-tuning pierde generalidad pero gana especialización en la tarea concreta. OpenVLA es una alternativa de código abierto con más parámetros, pero no hay datos de rendimiento comparativo en esta tarea específica. No se dispone de información sobre otros fine-tunings de Pi0 para SO-101 en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para una tarea concreta (mover objetos de una caja a otra) y no es adecuado para otras tareas sin un nuevo ajuste fino.
- Dataset pequeño: 50 episodios pueden provocar sobreajuste y falta de generalización ante variaciones en la posición de los objetos, iluminación o condiciones del entorno.
- Sin evaluación publicada: no hay datos de éxito en robot real, por lo que su rendimiento efectivo es desconocido.
- Dependencia del hardware: requiere un brazo SO-101 y las cámaras específicas (cenital y muñeca) con las que se entrenó; cambios en la configuración pueden degradar el rendimiento.
- Riesgo de alucinación en acciones: como política de imitación, puede generar acciones no seguras si las observaciones difieren del dominio de entrenamiento.
- Idiomas: no se especifica qué idiomas soporta; probablemente solo inglés, dado que la instrucción está en ese idioma.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Pi0 tiene su propia licencia (Apache 2.0 también, según la model card), por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/heyunzhenwhat/pi0_so101-three-objects
- Dataset de entrenamiento: https://huggingface.co/datasets/heyunzhenwhat/so101-three-objects
- Blog de Physical Intelligence sobre Pi0: https://www.physicalintelligence.company/blog/pi0
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de Pi0 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi0
- Repositorio OpenPI (referencia): https://github.com/physical-intelligence/openpi

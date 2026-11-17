# ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_v04

## Resumen

Este repositorio contiene una política de visión-lenguaje-acción (VLA) denominada `smolvla`, resultado del ajuste fino del modelo base `lerobot/smolvla_base` sobre un conjunto de datos propio de robótica. El modelo ha sido entrenado con la librería LeRobot de Hugging Face y está especializado en una tarea concreta de manipulación bimanual: coger un bote de Pringles con el brazo derecho y entregarlo al brazo izquierdo. Se trata, por tanto, de un artefacto de investigación aplicada más que de un modelo de propósito general.

La relevancia de SmolVLA radica en su planteamiento de eficiencia: según el artículo asociado (arXiv:2506.01844), es un VLA compacto diseñado para obtener un rendimiento competitivo con un coste computacional reducido y poder desplegarse en hardware de consumo. Este checkpoint concreto, con 450.046.176 parámetros (aproximadamente 450 millones), materializa esa filosofía en un caso de uso acotado: control de un robot `openarm_umeow` con tres cámaras y un estado proprioceptivo de 6 dimensiones.

El modelo es de acceso abierto bajo licencia Apache 2.0, pero conviene subrayar que su utilidad práctica está circunscrita a la tarea y al robot para los que fue entrenado. No dispone de resultados de evaluación publicados y el autor no ha proporcionado métricas de éxito en robot real, por lo que debe considerarse un punto de partida reproducible antes que una política lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción, ajuste fino del modelo base `lerobot/smolvla_base`) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el modelo consume instrucciones de tarea en inglés en el ejemplo de uso) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot 0.6.2 |
| Tipo de robot | `openarm_umeow` |
| Cámaras de entrada | `body_cam`, `wrist_cam`, `right_wrist_cam` |
| Dimensión de estado | `(6,)` |
| Dimensión de acción | `(16,)` |
| Resolución de imagen | 256 × 256 (3 canales) |
| Tamaño del repositorio | 0.9 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en el artículo arXiv:2506.01844: un modelo compacto de visión-lenguaje-acción que combina percepción visual multicámara, estado proprioceptivo e instrucción en lenguaje natural para producir secuencias de acciones. En este checkpoint concreto, la política consume tres flujos visuales de 256 × 256 píxeles y un vector de estado de 6 dimensiones, y emite un vector de acción de 16 dimensiones. No se dispone de detalles adicionales sobre el backbone visual, el codificador de lenguaje ni el cabezal de acciones en la información proporcionada.

El ajuste fino se realizó sobre el dataset `ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_v04`, compuesto por 110 episodios y 28.378 fotogramas a 30 FPS, con una única tarea: «Pick up the Pringles can with the right arm, hand it to the left arm». La configuración de entrenamiento fue de 20.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-4 y semilla 1000, empleando LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales; se trata de aprendizaje por imitación supervisado sobre demostraciones.

## Capacidades

- Control robótico de manipulación bimanual: genera acciones de 16 dimensiones para un robot `openarm_umeow`.
- Percepción visual multicámara: integra tres vistas simultáneas (cuerpo, muñeca y muñeca derecha) a 256 × 256.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante texto en el momento de la inferencia.
- Fusión de estado proprioceptivo y visión para la predicción de acciones.
- Ejecución de una tarea específica de pick-and-place y transferencia entre brazos.
- Despliegue en hardware de consumo según el planteamiento del artículo base de SmolVLA.
- No se documentan capacidades de tool calling, razonamiento multi-paso genérico, matemáticas, generación de código ni procesamiento de audio.
- Capacidades multilingües: no disponibles.

## Casos de uso

- **Automatización de pick-and-place bimanual en laboratorio:** el modelo ejecuta la secuencia completa de coger un bote con el brazo derecho y entregarlo al izquierdo, lo que permite reproducir el experimento y medir tasas de éxito antes de escalar a otras tareas.
- **Punto de partida para ajuste fino con nuevos objetos:** al estar construido sobre `lerobot/smolvla_base`, sirve como inicialización para entrenar políticas sobre datasets propios con `lerobot-train`, reduciendo el coste frente a entrenar desde cero.
- **Validación de pipelines de imitación en LeRobot:** útil para verificar la instalación, la calibración de cámaras y el flujo `lerobot-rollout` antes de abordar proyectos robóticos más complejos.
- **Investigación en sim-a-real:** el dataset combina datos reales y simulados (según su nombre), lo que lo hace adecuado para estudiar transferencia entre dominios en manipulación.
- **Docencia y demostraciones de VLA compactos:** su tamaño de 450 millones de parámetros y su licencia permisiva facilitan su uso en cursos y talleres sobre políticas VLA.
- **Evaluación comparativa de políticas VLA:** puede emplearse como referencia base en estudios que comparen SmolVLA con otras arquitecturas VLA en una tarea estandarizada de transferencia bimanual.
- **Pruebas de despliegue en hardware de consumo:** permite medir latencia y viabilidad de ejecución de un VLA de este tamaño en GPUs no empresariales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros en safetensors (0.9 GB de repositorio), la inferencia en precisión nativa requeriría del orden de 1-2 GB de VRAM, y menos aún con cuantización, aunque este dato no está confirmado por el autor.
- GPU recomendadas: no especificadas por el autor; el artículo base de SmolVLA apunta a hardware de consumo como objetivo de despliegue.
- Compatibilidad con GPU de consumo: plausible por el tamaño del modelo, pero no verificada en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`openarm_pringles_..._v04`) | 450 M | no disponible | Pick-and-place bimanual específico | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible | no disponible | VLA base para ajuste fino | no disponible en la información | Hugging Face |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Manipulación por imitación | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado para una única tarea y un único robot (`openarm_umeow`); su uso fuera de ese contexto no está validado.
- No se han publicado resultados de evaluación en robot real, por lo que se desconoce su tasa de éxito.
- El dataset de entrenamiento es reducido (110 episodios), lo que limita la generalización a variaciones de posición, iluminación u objetos.
- Riesgo de sobreajuste a las condiciones específicas de recogida de datos; no se documentan medidas de robustez.
- No se dispone de información sobre sesgos, aunque en robótica los sesgos se manifiestan como fallos sistemáticos ante distribuciones fuera de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la especificidad de la tarea desaconsejan su despliegue en producción sin validación adicional.
- No se documentan limitaciones idiomáticas ni de contexto porque el modelo no es de lenguaje general.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_v04
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_v04
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_v04

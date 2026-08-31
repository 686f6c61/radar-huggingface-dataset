# ShijieSKY/history-pi05-robotwin

## Resumen

History Pi05 RoboTwin es un modelo de visión-lenguaje-acción (VLA) desarrollado por ShijieSKY, diseñado para el control robótico basado en historial de acciones. Se trata de un fine-tuning del modelo base pi0.5 (π0.5) con la opción `history_action_conditioning=True`, lo que permite al modelo tener en cuenta el historial de acciones previas durante la generación de nuevas acciones. El modelo está entrenado sobre el dataset fusionado RoboTwin-Clean LeRobot, un conjunto de datos orientado a tareas de manipulación robótica en entornos simulados y reales.

El modelo se distribuye a través de HuggingFace bajo el pipeline de robótica, utilizando la librería OpenPI de Physical Intelligence. Incluye dos checkpoints (paso 30.000 y paso 59.999 de un entrenamiento de 60.000 pasos), cada uno con parámetros de inferencia y estadísticas de normalización. Su relevancia radica en que aborda la generalización en robótica mediante el condicionamiento por historial, una técnica que mejora la consistencia temporal en tareas de manipulación de larga duración. Aunque se carece de especificaciones técnicas detalladas, el modelo se enmarca en el ecosistema π0.5, que ha demostrado capacidades de generalización en entornos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en pi0.5, con condicionamiento por historial de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bfloat16) |
| Idiomas soportados | no disponibles (orientado a control robótico, no a lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (inferencia bajo OpenPI), incluye `params/` y `assets/` |

## Arquitectura y entrenamiento

El modelo se basa en pi0.5 (π0.5), un VLA que extiende π0 mediante co-entrenamiento en datos de manipulación y datos web para mejorar la generalización. Aunque no se detalla la arquitectura interna en la información disponible, se sabe que pi0.5 utiliza un esquema de flujo (flow matching) para la generación de acciones, como se menciona en el repositorio de referencia `zaleni/pi05`. El fine-tuning se realizó con `history_action_conditioning=True`, lo que implica que el modelo recibe como entrada adicional el historial de acciones previas, permitiendo una mayor coherencia temporal en secuencias de control.

El entrenamiento se llevó a cabo durante 60.000 pasos con precisión bfloat16, sobre el dataset fusionado `openpi_robotwin_clean_merged` (RoboTwin-Clean LeRobot). La configuración incluye un horizonte de acción de 50 pasos y una dimensión de acción de 32. Se especifica semilla 42 para reproducibilidad. No se indica el uso de RLHF o DPO; se trata de un fine-tuning supervisado estándar sobre datos de demostración robótica.

## Capacidades

- Control robótico end-to-end: genera acciones de 32 dimensiones con un horizonte de 50 pasos, adecuado para tareas de manipulación en simulación y posiblemente en entornos reales.
- Condicionamiento por historial: utiliza el historial de acciones para mejorar la estabilidad y consistencia en tareas de larga duración.
- Integración con OpenPI: compatible con el ecosistema de Physical Intelligence para entrenamiento e inferencia de modelos VLA.
- Fine-tuning sobre datos RoboTwin: especializado en el dataset RoboTwin-Clean, que incluye tareas de ensamblaje y manipulación de objetos.
- No se reportan capacidades de tool calling, razonamiento multimodal avanzado ni generación de lenguaje natural; su función principal es la generación de comandos de control.

## Casos de uso

- Manipulación robótica en simulación: el modelo puede emplearse en entornos como RoboTwin para ejecutar tareas de ensamblaje o manipulación de precisión, aprovechando su horizonte de acción de 50 pasos para planificar secuencias completas.
- Aprendizaje por imitación para robots reales: dado su condicionamiento por historial, es adecuado para transferir políticas aprendidas en simulación a robots físicos, donde la coherencia temporal es crítica.
- Investigación en VLA con historial: sirve como base para estudiar el impacto del condicionamiento por historial en la generalización de políticas robóticas.
- Desarrollo de sistemas de control basados en OpenPI: al ser un checkpoint de OpenPI, puede integrarse en pipelines de entrenamiento y evaluación de otros modelos VLA.
- Benchmarking de políticas robóticas: los checkpoints de 30.000 y 59.999 pasos permiten comparar el efecto del número de pasos de entrenamiento en el rendimiento de tareas.
- Fine-tuning sobre nuevos datasets: el modelo puede servir como punto de partida para adaptarse a tareas específicas mediante transferencia de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La documentación de RoboTwin 2.0 menciona ajustar `fsdp_devices` según memoria GPU disponible, lo que sugiere que el fine-tuning requiere GPUs con gran memoria (típicamente 80 GB o más).
- Para inferencia, al ser un modelo VLA de tamaño no especificado, se recomienda al menos una GPU con 24 GB de VRAM (por ejemplo, RTX 3090/4090) en cuantización FP16, aunque no se confirma.
- Opciones de despliegue: OpenPI (inferencia nativa), posiblemente compatible con vLLM o TGI si se exporta a formatos estándar, pero no está documentado.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Base | Condicionamiento historial | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| History Pi05 RoboTwin | pi0.5 | Sí | RoboTwin-Clean | no disponible | HuggingFace |
| pi05-robotwin (ShijieSKY) | pi0.5 | No | RoboTwin-Clean | no disponible | HuggingFace |
| π0.5 (base) | π0 | No | 10k+ horas de datos de robot | no disponible | GitHub (zaleni/pi05) |

La comparación se basa en la información disponible; no hay datos de rendimiento cuantitativo para establecer diferencias objetivas.

## Limitaciones y advertencias

- Licencia no especificada: no se indica si el modelo puede usarse comercialmente; se recomienda contactar al autor antes de cualquier uso productivo.
- Sin datos de benchmarks: no hay evidencia pública del rendimiento en tareas estándar, lo que dificulta evaluar su calidad objetiva.
- Especialización limitada: entrenado únicamente sobre RoboTwin-Clean, puede no generalizar bien a otras tareas o entornos sin fine-tuning adicional.
- Riesgo de alucinación en acciones: como todo modelo generativo, puede producir comandos de control inválidos o inseguros en situaciones no vistas.
- Sesgo del dataset: el dataset puede contener sesgos de los entornos simulados, afectando la transferencia a robots reales.
- Fecha de creación futura (2026): el modelo se publicó en agosto de 2026, lo que podría indicar que es una versión experimental o de prueba.

## Enlaces

- HuggingFace: https://huggingface.co/ShijieSKY/history-pi05-robotwin
- Repo relacionado (pi05-robotwin sin historial): https://huggingface.co/ShijieSKY/pi05-robotwin
- Repositorio de referencia pi05 para RoboTwin: https://github.com/zaleni/pi05
- Documentación de RoboTwin 2.0 sobre Pi05: https://robotwin-platform.github.io/doc/usage/Pi05.html
- Paper de π0.5: https://arxiv.org/html/2504.16054v1

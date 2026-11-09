# Rinsei/act_test_epi25_full

## Resumen

`Rinsei/act_test_epi25_full` es una política de imitación basada en ACT (Action Chunking with Transformers), el método presentado por Zhao et al. en el paper arXiv:2304.13705 y adoptado como referencia dentro del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de control robótico que, a partir de observaciones visuales y del estado de las articulaciones, predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación.

El modelo lo publica el usuario Rinsei como artefacto de entrenamiento dentro de LeRobot 0.7.0. Se ha entrenado sobre un dataset propio de 25 episodios teleoperados (22.391 frames a 30 FPS) para una única tarea: mover un vaso de plástico de un papel rojo a un papel azul. La entrada combina un vector de estado de 6 dimensiones con dos cámaras RGB de 480x640 (frontal y de muñeca), y la salida es un vector de acción de 6 dimensiones. El checkpoint contiene 51.668.614 parámetros en formato safetensors y ocupa 0,2 GB.

Es relevante como ejemplo canónico del flujo de trabajo de imitación end-to-end en robótica de bajo coste: un robot SO-100/SO-101 (`so_follower`), dos cámaras y un entrenamiento de 20.000 pasos son suficientes para obtener una política ejecutable con `lerobot-rollout`. No obstante, se trata de un artefacto de prueba (el propio nombre incluye `test`) sin evaluación publicada ni licencia declarada, por lo que no debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo de robótica; la instrucción de tarea es una cadena de texto en inglés) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` (SO-100/SO-101) |
| Framework | LeRobot 0.7.0 |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora que predice un chunk de acciones futuras (típicamente decenas de pasos) condicionado en las observaciones actuales. El modelo incorpora un codificador visual para cada cámara, un codificador del estado propioceptivo y un decodificador transformer con consultas latentes que generan el chunk de acciones. Esta formulación con chunking mitiga el problema de la varianza en la predicción paso a paso y permite un control más suave y consistente. El paper original (arXiv:2304.13705) también introduce una técnica de regularización del estilo de acción (CVAE) para capturar la variabilidad de las demostraciones humanas.

El entrenamiento de este checkpoint concreto se realizó con LeRobot 0.7.0 durante 20.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-5, con semilla 1000. El dataset `Rinsei/test_epi25` contiene 25 episodios teleoperados (22.391 frames a 30 FPS) de una única tarea: "Move a plastic cup from the red paper to the blue paper". No se especifica en la información disponible el número de tokens, la composición completa del dataset ni si se aplicaron técnicas de RLHF/DPO (no aplicables en este paradigma; el aprendizaje es por imitación supervisada).

## Capacidades

- Control robótico visomotor para manipulación de objetos sobre una mesa, con predicción de chunks de acción de 6 dimensiones.
- Fusión de dos vistas RGB (cámara frontal y cámara de muñeca) con el estado propioceptivo de 6 dimensiones del robot.
- Ejecución autónoma de la tarea entrenada: mover un vaso de plástico de un papel rojo a un papel azul.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento o fine-tuning.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código, visión general, audio ni modo thinking. Es exclusivamente una política de imitación.
- Capacidad multilingüe: no aplica; la única cadena textual es la instrucción de tarea en inglés.
- Capacidad de generalización: limitada a la distribución del dataset de entrenamiento (posiciones, iluminación y objetos vistos durante la teleoperación).

## Casos de uso

- Reproducción de la tarea de pick-and-place en un robot SO-100/SO-101: el modelo ejecuta el movimiento del vaso entre las dos hojas de papel con `lerobot-rollout`, sirviendo como referencia para validar el montaje hardware y la calibración de cámaras.
- Prototipado rápido de pipelines de imitación: al estar entrenado con LeRobot 0.7.0, permite verificar de extremo a extremo el flujo de grabación de datos, entrenamiento y despliegue antes de invertir en datasets más grandes.
- Docencia y formación en robótica de bajo coste: útil como ejemplo práctico de ACT en talleres, ya que el dataset es pequeño (25 episodios) y el modelo cabe en cualquier GPU consumer.
- Benchmark interno de infraestructura de inferencia robótica: sirve para medir latencia y throughput del bucle de control con dos cámaras a 30 FPS en distintas GPUs.
- Base para fine-tuning con datos propios: el checkpoint puede reentrenarse con `lerobot-train` sobre un dataset mayor para adaptarlo a nuevas tareas de manipulación.
- Validación de calibración de hardware: al depender de las claves de observación `front` y `wrist`, permite comprobar que las cámaras están correctamente montadas y alineadas antes de entrenar políticas propias.
- Prueba de concepto de control visomotor en entornos controlados: adecuado para demostraciones en laboratorio con objetos y posiciones similares a los del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,2 GB en safetensors (51,7 M de parámetros en fp32); en la práctica el consumo dominante es el procesamiento de las dos imágenes de 480x640, por lo que se estima un uso de VRAM de entre 1 y 3 GB, aunque no se dispone de mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se recomienda RTX 3060/4060 o superior para mantener 30 FPS estables con dos cámaras.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU NVIDIA moderna (GTX 1660, RTX 2060, RTX 3060, RTX 4090) e incluso en algunas iGPU con suficiente memoria compartida, aunque sin datos medidos.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) es la vía documentada; no se han publicado integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El bucle de control debe operar a 30 FPS para coincidir con la frecuencia del dataset, pero no se han publicado mediciones de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Rinsei/act_test_epi25_full` | 51,7 M | no aplica (chunking ACT) | Manipulación pick-and-place (vaso) | no disponible | Hugging Face, LeRobot 0.7.0 |
| ACT original (Zhao et al., 2023) | ~80 M (configuración de referencia del paper) | no aplica | Manipulación bimanual (ALOHA) | código MIT en el repo oficial | GitHub, paper arXiv |
| Diffusion Policy (Chi et al., 2023) | no disponible | no aplica | Manipulación visomotora | MIT (repo oficial) | GitHub, paper |
| Políticas LeRobot de referencia (`lerobot/act_*`) | variable | no aplica | Distintas tareas | Apache-2.0 (mayoría) | Hugging Face |

La comparación es aproximada: no se dispone de benchmarks comunes entre estos modelos en la información proporcionada, y los tamaños de ACT original y Diffusion Policy varían según la configuración. La principal diferencia práctica es que este checkpoint es un artefacto de prueba de un único usuario, mientras que las alternativas son implementaciones de referencia con documentación y evaluación publicadas.

## Limitaciones y advertencias

- No hay licencia declarada: la model card indica "[More Information Needed]", por lo que el uso comercial queda en un limbo legal y no debe asumirse permisividad.
- El nombre del repositorio incluye `test`, lo que sugiere que es un artefacto de prueba y no un modelo validado.
- No se han publicado evaluaciones: se desconoce la tasa de éxito real de la política en el robot objetivo.
- Dataset muy pequeño (25 episodios, 22.391 frames): alta probabilidad de sobreajuste a posiciones, iluminación y apariencia concretas del entorno de grabación.
- Generalización limitada: cambios en la posición del vaso, el color de los papeles, la iluminación o el tipo de robot pueden degradar el rendimiento sin previo aviso.
- Dependencia de la configuración exacta de cámaras: las claves `front` y `wrist` y sus resoluciones (480x640) deben coincidir con las del entrenamiento; un cambio de montaje o de resolución invalida la política.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: al ser una política de imitación sin modelo de mundo, puede ejecutar movimientos plausibles pero erróneos ante entradas fuera de distribución.
- Sin salvaguardas de seguridad documentadas: no se especifican límites de par, paradas de emergencia ni verificación de colisiones; en producción habría que añadir capas de seguridad externas.
- Idiomas: no aplica, pero la instrucción de tarea está en inglés y el modelo no procesa lenguaje natural de forma general.
- Fecha de creación futura (2026-11-09) en los metadatos de Hugging Face: conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rinsei/act_test_epi25_full
- Dataset de entrenamiento: https://huggingface.co/datasets/Rinsei/test_epi25
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Rinsei/test_epi25
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference

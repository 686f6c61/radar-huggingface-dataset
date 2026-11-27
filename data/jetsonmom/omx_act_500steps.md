# jetsonmom/omx_act_500steps

## Resumen

`jetsonmom/omx_act_500steps` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada en Hugging Face mediante la librería LeRobot. El modelo aprende de datos de teleoperación y predice fragmentos de acciones (action chunks) en lugar de pasos individuales, un enfoque que según el paper original (arXiv:2304.13705) logra tasas de éxito elevadas en tareas de manipulación. Está entrenado sobre el dataset `jetsonmom/sungil_school_omx_yellow_bear_v1`, lo que sugiere un robot tipo SO-100/SO-101 (brazo de bajo coste) en un entorno escolar.

Se trata de un modelo pequeño: 51.668.662 parámetros en formato safetensors, con un repositorio de 0,2 GB. No es un modelo de lenguaje: su pipeline es `robotics` y su salida son comandos de actuación para un robot, no texto. Por tanto, no dispone de contexto lingüístico, tokenizador ni capacidades de generación de lenguaje.

Su relevancia es acotada: es un checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta, útil como referencia para reproducir el flujo de entrenamiento de ACT con LeRobot o para comparar configuraciones de entrenamiento (500 pasos) en robótica de imitación de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder visual y decoder de acciones que predice chunks |
| Parametros totales | 51.668.662 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación (imitation learning) presentado en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). La arquitectura combina un backbone de visión (típicamente ResNet) que procesa las imágenes de las cámaras del robot con un transformer que modela la secuencia de observaciones y genera un chunk de acciones futuras. Predecir chunks en lugar de acciones individuales reduce el error de compounding y mejora la estabilidad en tareas de manipulación fina.

El checkpoint se ha entrenado con LeRobot sobre el dataset `jetsonmom/sungil_school_omx_yellow_bear_v1`, presumiblemente grabaciones de teleoperación de un brazo SO-100/SO-101 en un entorno escolar. El nombre "500steps" indica que el entrenamiento se detuvo a los 500 pasos, lo que es un régimen muy corto y sugiere un checkpoint de prueba o de validación del pipeline más que un modelo listo para producción. No se especifican en la model card el número de episodios, la composición del dataset, ni si se aplicó aumento de datos o regularización adicional.

## Capacidades

- Predicción de acciones robóticas en forma de chunks a partir de observaciones visuales y del estado del robot.
- Aprendizaje por imitación a partir de datos de teleoperación (no requiere recompensa explícita).
- Control de brazos robóticos de bajo coste compatibles con LeRobot (por ejemplo, SO-100 follower).
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción del pipeline de entrenamiento de ACT: usar este checkpoint como referencia para validar que `lerobot-train` produce pesos coherentes antes de lanzar entrenamientos largos sobre datasets propios.
- Evaluación de políticas en robot real: ejecutar `lerobot-record` con `--policy.path=jetsonmom/omx_act_500steps` para medir la tasa de éxito de una política entrenada solo 500 pasos y establecer una línea base.
- Docencia en robótica de imitación: servir como ejemplo mínimo de política ACT publicada en el Hub para cursos o talleres sobre LeRobot y brazos SO-100.
- Comparación de configuraciones de entrenamiento: contrastar el rendimiento de 500 pasos frente a checkpoints más largos sobre el mismo dataset para estudiar curvas de aprendizaje.
- Prototipado rápido de tareas de manipulación en entornos escolares o de laboratorio con hardware de bajo coste.
- Depuración de datasets de teleoperación: si la política no converge, ayuda a detectar problemas en las grabaciones (cámaras mal calibradas, acciones inconsistentes) antes de invertir cómputo en entrenamientos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, dependiendo del tamaño de las imágenes de entrada y del batch.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; para entrenamiento se recomienda al menos una RTX 3060/4060 o superior, y para inferencia en robot una Jetson Orin Nano o similar es suficiente.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jetsonmom/omx_act_500steps | 51,7 M | no aplica | ACT para manipulación robótica | Apache 2.0 | Hugging Face (0 descargas) |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Manipulación robótica | Apache 2.0 | Hub de LeRobot |
| Diffusion Policy (paper) | no disponible | no aplica | Imitation learning robótico | no disponible | Repositorio oficial del paper |
| VQ-BeT (paper) | no disponible | no aplica | Imitation learning robótico | no disponible | Repositorio oficial del paper |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint entrenado solo 500 pasos: es altamente probable que la política no haya convergido y su tasa de éxito en robot real sea baja.
- Dataset de entrenamiento específico (`sungil_school_omx_yellow_bear_v1`): la política está sobreajustada a ese entorno, iluminación, cámara y configuración de robot; no se espera generalización a otras tareas.
- Sin información sobre el número de episodios, resolución de cámara ni calibración: difícil evaluar la calidad del dato de origen.
- Riesgo de sobreajuste y de comportamiento errático fuera de la distribución de entrenamiento.
- Sin datos de sesgos, alucinación o rendimiento multilingüe: no aplica como modelo de lenguaje, pero sí conviene advertir que no debe usarse como sustituto de un LLM.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de documentación hace desaconsejable su uso en producción sin validación previa.
- 0 descargas y 0 likes: no hay evidencia de uso por terceros ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jetsonmom/omx_act_500steps
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/jetsonmom/sungil_school_omx_yellow_bear_v1

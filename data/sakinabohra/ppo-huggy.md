# SakinaBohra/ppo-Huggy

## Resumen

`SakinaBohra/ppo-Huggy` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno Huggy de Unity ML-Agents. Lo publica la usuaria SakinaBohra en Hugging Face como parte del curso de Deep Reinforcement Learning de Hugging Face, y su propósito es demostrar un flujo completo de entrenamiento y publicación de políticas en el ecosistema ML-Agents. No es un modelo de lenguaje ni un transformer generativo: es una política neuronal exportada a ONNX que controla un agente articulado en un simulador físico.

El entorno Huggy consiste en un cuerpo con dos brazos que debe alcanzar y abrazar una esfera objetivo; es un problema de control motor de recompensa densa, habitual en tutoriales de RL. La política se entrenó durante aproximadamente 2 millones de pasos con Unity ML-Agents 1.1.0 y se distribuye como dos ficheros ONNX (la política final y un checkpoint intermedio). El repositorio ocupa 0.0 GB, lo que confirma que se trata de un artefacto muy ligero.

Su relevancia es fundamentalmente didáctica y de referencia: sirve para mostrar cómo se integra una política PPO entrenada en Unity dentro de los flujos de Hugging Face, cómo se versionan checkpoints y cómo se carga un modelo ONNX en el simulador web. No está pensado para producción ni para tareas de propósito general, y no dispone de model card con especificaciones de arquitectura, datos o evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para RL entrenada con PPO en Unity ML-Agents (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; observaciones por paso del entorno) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX en precisión original) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`Huggy.onnx`, `Huggy-1199973.onnx`) |

## Arquitectura y entrenamiento

El agente se entrenó con Unity ML-Agents 1.1.0 usando PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad que estabiliza las actualizaciones. La política consume las observaciones del entorno Huggy (estado del cuerpo y posición relativa del objetivo) y produce acciones continuas de control motor. La información disponible no detalla el número de capas, el tamaño de las capas ocultas, la función de recompensa exacta ni la configuración de hiperparámetros (learning rate, batch size, número de épocas por actualización).

El entrenamiento se prolongó durante aproximadamente 2 millones de pasos, con dos artefactos publicados: la política final (`Huggy.onnx`) y un checkpoint intermedio en el paso 1.199.973 (`Huggy-1199973.onnx`). El autor reporta una recompensa media máxima de 4.021 en torno a los 1,2 millones de pasos y una recompensa media final de 3.633 en los 2 millones de pasos; se trata de recompensas de entrenamiento, no de evaluaciones independientes, por lo que no deben interpretarse como medida de generalización. No consta uso de RLHF, DPO ni innovaciones de decodificación, ya que no es un modelo generativo de texto.

## Capacidades

- Control motor continuo en el entorno Huggy de Unity ML-Agents: la política genera acciones para que el agente articulado alcance y abrace la esfera objetivo.
- Inferencia exportada a ONNX: el modelo puede ejecutarse con ONNX Runtime en entornos fuera de Unity, siempre que se le proporcione el vector de observaciones con el mismo formato y normalización que en entrenamiento.
- Integración con el simulador web de Huggy: el autor indica que se puede abrir el simulador en navegador y seleccionar este repositorio para cargar la política.
- Versionado de checkpoints: se incluye un checkpoint intermedio, útil para comparar el comportamiento de la política antes y después del entrenamiento completo.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión, audio ni capacidades multilingües: es una política de control específica de una tarea.
- No dispone de modo "thinking" ni de generación de texto de ningún tipo.

## Casos de uso

- Docencia de reinforcement learning: usar el par de ficheros ONNX para ilustrar el ciclo completo de entrenamiento PPO en ML-Agents, desde la recogida de observaciones hasta la exportación de la política y su carga en el simulador web.
- Reproducción de experimentos: comparar la recompensa del checkpoint intermedio (paso 1.199.973) con la de la política final (paso ~2M) para estudiar la curva de aprendizaje y el posible sobreajuste o estancamiento.
- Base para fine-tuning en el mismo entorno: partir de `Huggy.onnx` como inicialización y continuar el entrenamiento con ML-Agents para probar variaciones de recompensa, hiperparámetros o curriculum learning.
- Integración en pipelines de RL: cargar el ONNX con ONNX Runtime en un script de Python para inspeccionar la política fuera de Unity, medir latencia de inferencia por paso y validar el preprocesado de observaciones.
- Demostración de despliegue de políticas en el navegador: usar el simulador web de Huggy como ejemplo de cómo servir un agente de RL ligeramente empaquetado en un repositorio de Hugging Face.
- Referencia para el curso de Deep RL de Hugging Face: emplear el repositorio como plantilla de estructura de model card, nombres de checkpoints y etiquetas (`ml-agents`, `onnx`, `reinforcement-learning`) para publicar otros agentes del curso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta recompensas medias de entrenamiento: 4.021 en el paso ~1,2M y 3.633 en el paso ~2M. No hay evaluaciones independientes, ni comparación con otros agentes en el mismo entorno, ni métricas de éxito de la tarea (por ejemplo, porcentaje de episodios en los que se completa el abrazo).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio ocupa 0.0 GB y la política es una red pequeña típica de ML-Agents, por lo que cabe holgadamente en cualquier GPU consumer (incluso en GPUs integradas o en CPU).
- GPU recomendadas: no se requiere GPU dedicada; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este artefacto. Para entrenamiento continuado con ML-Agents, una GPU consumer de gama media es suficiente.
- Cabe en consumer GPU: sí, en cualquier GPU con soporte ONNX Runtime (y también en CPU).
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, JavaScript/Web), el simulador web de Huggy, y Unity ML-Agents para reentrenamiento o inferencia dentro del editor.
- Latencia y throughput estimados: no disponibles. Al ser una política de control por paso, la latencia vendrá dominada por el bucle de simulación del entorno más que por la inferencia de la red.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Framework | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SakinaBohra/ppo-Huggy | Huggy | PPO | Unity ML-Agents 1.1.0 | ONNX | no disponible | Hugging Face |
| Políticas de referencia del curso Deep RL de Hugging Face | Huggy, Snowball, Walker, etc. | PPO | Unity ML-Agents | ONNX | variable según autor | Hugging Face |
| Agentes de ejemplo de Unity ML-Agents | Huggy y otros | PPO, SAC, etc. | Unity ML-Agents | ONNX / barracuda | licencia de Unity ML-Agents | Repositorio oficial de Unity |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparación se limita a entorno, algoritmo, formato y disponibilidad.

## Limitaciones y advertencias

- Específico de una única tarea: la política solo funciona en el entorno Huggy con el mismo espacio de observaciones y acciones; no es transferible a otros entornos sin reentrenamiento.
- Sin licencia declarada: la ausencia de licencia impide asumir permisos de uso comercial, modificación o redistribución; hay que contactar con el autor antes de cualquier uso fuera del ámbito personal o educativo.
- Sin evaluación independiente: las recompensas reportadas son de entrenamiento y no garantizan un comportamiento robusto; además, la recompensa media baja de 4.021 a 3.633 entre 1,2M y 2M de pasos, lo que sugiere posible inestabilidad o sobreajuste que conviene verificar.
- Sin información de arquitectura: no se documentan capas, tamaño de observación, normalización ni hiperparámetros, lo que dificulta la reproducibilidad y la integración fuera de Unity.
- Sin idiomas ni texto: no debe evaluarse con métricas de modelos de lenguaje (MMLU, HumanEval, GSM8K); no aplica.
- Riesgo de desajuste de observaciones: si se carga el ONNX fuera de Unity, cualquier diferencia en el orden, escala o normalización de las observaciones degradará el comportamiento de forma silenciosa.
- Artefacto de curso: la model card indica explícitamente que se entrenó como parte del curso de Deep RL de Hugging Face, por lo que su madurez y soporte son limitados.
- Sin garantías de mantenimiento: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de mantenimiento activo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SakinaBohra/ppo-Huggy
- Curso de Deep Reinforcement Learning de Hugging Face: https://huggingface.co/learn/deep-rl-course
- Documentación de Unity ML-Agents: https://unity-technologies.github.io/ml-agents/
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Simulador web de Huggy (indicado en la model card, sin URL exacta en la información disponible): no disponible
- Paper de PPO (Proximal Policy Optimization Algorithms): https://arxiv.org/abs/1707.06347
- ONNX Runtime: https://onnxruntime.ai/

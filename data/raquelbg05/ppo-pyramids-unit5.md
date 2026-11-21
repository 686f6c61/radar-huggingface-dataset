# RaquelBG05/ppo-Pyramids-unit5

## Resumen

`RaquelBG05/ppo-Pyramids-unit5` es un agente de aprendizaje por refuerzo profundo entrenado con Unity ML-Agents 1.1.0 sobre el entorno de ejemplo `Pyramids`, un escenario de exploración con recompensa dispersa en el que el agente debe localizar y tocar una pirámide dorada dentro de una arena delimitada. No es un modelo de lenguaje: es una política neuronal exportada a ONNX que se ejecuta dentro de un runtime de ML-Agents para controlar un agente en Unity.

El entrenamiento se realizó en CPU en Google Colab con el algoritmo PPO (Proximal Policy Optimization) combinado con RND (Random Network Distillation) como mecanismo de curiosidad intrínseca, una técnica habitual para entornos con recompensas escasas y exploración difícil. El autor registra 990.000 pasos de entrenamiento y una recompensa media de episodio de 1,094 ± 1,082 en el último checkpoint, un valor bajo y con alta varianza que sugiere una política aún inestable o parcialmente entrenada.

El modelo es relevante únicamente como material didáctico del curso de Deep Reinforcement Learning de Unity (unidad 5), no como componente de producción. El repositorio tiene 0 descargas y 0 likes, un tamaño declarado de 0.0 GB y carece de licencia e idiomas especificados, lo que limita cualquier reutilización seria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para PPO (ML-Agents), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`Pyramids.onnx`), más configuración de entrenamiento, log de texto y eventos de TensorBoard |

## Arquitectura y entrenamiento

El agente sigue el esquema estándar de ML-Agents: una red neuronal que mapea observaciones (vectoriales y/o visuales según la configuración del entorno `Pyramids`) a acciones discretas, entrenada con PPO. Sobre la recompensa del entorno se añade RND, que entrena una red predictora para estimar la novedad de los estados y así incentivar la exploración en un escenario donde la recompensa extrínseca es escasa hasta que el agente encuentra la pirámide.

El entrenamiento se ejecutó en CPU en Google Colab con ML-Agents 1.1.0, alcanzando 990.000 pasos registrados. El repositorio incluye el fichero de configuración YAML, el log de texto del entrenamiento y los eventos de TensorBoard, lo que permite reproducir o inspeccionar la curva de aprendizaje. No se especifican en la información disponible el número de tokens (no aplica), la composición del dataset (no aplica) ni detalles de la topología de red (capas, unidades), que quedan en la configuración incluida pero no se detallan en la model card.

## Capacidades

- Control de agente en el entorno `Pyramids` de Unity ML-Agents: navegación y búsqueda de objetivo con recompensa dispersa.
- Exploración dirigida por curiosidad intrínseca (RND), útil en escenarios con señal de recompensa escasa.
- Ejecución en inferencia mediante ONNX dentro del runtime de ML-Agents o del visor de demostración de Unity.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de un LLM ni planificación simbólica.
- No tiene capacidades multilingües, de visión general, audio ni modo "thinking".
- Reproducibilidad del entrenamiento: incluye configuración, logs y eventos de TensorBoard.

## Casos de uso

- Material didáctico para la unidad 5 del curso de Deep Reinforcement Learning de Unity: sirve para ilustrar PPO con RND en un entorno de recompensa dispersa y comparar curvas de aprendizaje en TensorBoard.
- Reproducción de experimentos: la configuración y los logs incluidos permiten reentrenar y contrastar el efecto de hiperparámetros como la escala de la recompensa intrínseca o la tasa de aprendizaje.
- Punto de partida para fine-tuning en variantes del entorno `Pyramids`: se puede cargar el ONNX o el checkpoint para continuar el entrenamiento con modificaciones del escenario.
- Demostración interactiva en el Space `unity/ML-Agents-Pyramids`: seleccionando el modelo y `Pyramids.onnx` se puede visualizar el comportamiento del agente en el navegador.
- Estudio de estabilidad de políticas: la recompensa media de 1,094 ± 1,082 es un caso práctico para analizar varianza alta y diagnosticar políticas poco convergidas.
- Integración en pipelines de evaluación de ML-Agents: el ONNX se puede cargar en un runner de inferencia para medir recompensa media en episodios de test y comparar con otros agentes del mismo entorno.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Dataset / entorno | Metrica | Valor |
|---|---|---|---|
| Reinforcement Learning | ML-Agents-Pyramids | Mean episode reward during training | 1,094 +/- 1,082 |

No se han publicado otros resultados de benchmarks en la información disponible. No hay comparación con agentes de referencia del entorno `Pyramids` ni métricas de éxito (tasa de episodios con objetivo alcanzado), latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del ONNX no se detalla en la información proporcionada (el repositorio declara 0.0 GB, probablemente por redondeo de un artefacto pequeño).
- GPU recomendadas: no se especifican; el entrenamiento se realizó en CPU en Google Colab, lo que indica que el modelo es ligero y no requiere acelerador.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño reducido del artefacto y el uso de CPU en entrenamiento, aunque no hay cifras oficiales.
- Opciones de despliegue: runtime de Unity ML-Agents (Unity Inference Engine / Barracuda), ONNX Runtime y el visor web del Space de Unity.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Pasos registrados | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `RaquelBG05/ppo-Pyramids-unit5` | Pyramids (ML-Agents) | PPO + RND | 990.000 | 1,094 ± 1,082 | no disponible | Hugging Face, 0 descargas |
| Agentes de referencia del curso ML-Agents (unidad 5) | Pyramids | PPO + RND | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Alternativas comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros agentes del mismo entorno.

## Limitaciones y advertencias

- Política poco convergida: recompensa media de 1,094 con desviación de 1,082 indica alta varianza y posible inestabilidad; no es un agente fiable para evaluación seria.
- Entrenamiento limitado a 990.000 pasos en CPU en Colab; no hay evidencia de convergencia ni de generalización a variantes del entorno.
- Sin licencia declarada: no se puede asumir permiso para uso comercial, redistribución o derivados; es necesario contactar con el autor.
- Sin idiomas ni metadatos de uso: no aplica a tareas de lenguaje, por lo que no debe confundirse con un modelo generativo.
- Riesgo de sobreajuste al escenario concreto `Pyramids` y a la configuración de ML-Agents 1.1.0; cambios de versión del runtime pueden romper la compatibilidad del ONNX.
- Cero descargas y cero likes: no hay validación comunitaria ni reportes independientes de rendimiento.
- No hay información sobre sesgos, alucinación (no aplica) ni métricas de éxito en test; cualquier uso en producción requeriría una reevaluación completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RaquelBG05/ppo-Pyramids-unit5
- Demo interactiva (Space de Unity): https://huggingface.co/spaces/unity/ML-Agents-Pyramids
- Documentación de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Curso de Deep Reinforcement Learning de Unity: https://github.com/Unity-Technologies/ml-agents/blob/main/docs/Learning-Environment-Examples.md
- Paper de PPO: https://arxiv.org/abs/1707.06347
- Paper de RND (Random Network Distillation): https://arxiv.org/abs/1810.12894

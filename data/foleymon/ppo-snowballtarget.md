# foleymon/ppo-SnowballTarget

## Resumen

`foleymon/ppo-SnowballTarget` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) dentro del entorno SnowballTarget de Unity ML-Agents. Lo desarrolla el usuario `foleymon` como parte de la Unidad 5 del curso de Deep Reinforcement Learning de Hugging Face, y su propósito es demostrar el flujo completo de entrenamiento, exportación y publicación de un agente en el Hub.

No se trata de un modelo de lenguaje ni de un transformer generativo: es una política neuronal compacta que mapea observaciones del entorno SnowballTarget a acciones de control, empaquetada en formato `.nn`/`.onnx` para su ejecución dentro del runtime de ML-Agents. El entrenamiento se realizó durante 200.000 pasos sobre una GPU Tesla T4, alcanzando una recompensa media final de 25,27 ± 2,40.

Su relevancia es fundamentalmente didáctica y de referencia: sirve como ejemplo reproducible de un pipeline de RL con ML-Agents y como punto de partida para quien quiera reanudar el entrenamiento o inspeccionar la política aprendida. El repositorio es de tamaño prácticamente nulo (0,0 GB según el Hub), lo que confirma que los artefactos son pesos de política de pequeña escala, no un modelo de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de aprendizaje por refuerzo (PPO) sobre Unity ML-Agents; topología interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones por paso del entorno) |
| Tipos de cuantizacion | no disponible (artefactos `.nn` y `.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (formato nativo de ML-Agents) y `.onnx` |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (*clipped surrogate objective*) que estabiliza las actualizaciones y es el método por defecto de ML-Agents para entornos de control continuo y discreto. La política consume las observaciones vectoriales (y, si procede, visuales) definidas por el entorno SnowballTarget y produce acciones; la arquitectura concreta de las capas (número de capas, unidades ocultas, uso de memoria recurrente o de sensores visuales) no se detalla en la información disponible.

El entrenamiento se ejecutó durante 200.000 pasos sobre una GPU Tesla T4, dentro del marco del curso de Deep RL de Hugging Face (Unidad 5). No se documentan detalles sobre composición del dataset (el entorno genera sus propias transiciones), uso de recompensas conformadas, hiperparámetros de PPO (learning rate, batch size, epochs, clip range) ni técnicas adicionales como *curriculum learning* o *self-play*. La model card únicamente indica que se puede reanudar el entrenamiento con `mlagents-learn <config>.yaml --run-id=<run_id> --resume`.

## Capacidades

- Control de agente en el entorno SnowballTarget de Unity ML-Agents: selecciona acciones a partir de observaciones del entorno para maximizar la recompensa acumulada.
- Ejecución en navegador mediante el visor de Hugging Face (`https://huggingface.co/unity`), cargando el archivo `.nn` o `.onnx` del repositorio.
- Reanudación del entrenamiento desde el checkpoint publicado mediante la CLI de ML-Agents.
- Exportación a ONNX para inferencia fuera del editor de Unity (runtime de ML-Agents, Barracuda/Inference Engine).
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje natural, capacidades multilingües, visión general ni audio: es una política específica de tarea.
- No dispone de modo *thinking* ni de generación de texto.

## Casos de uso

- Docencia y aprendizaje de RL: sirve como ejemplo completo y reproducible del ciclo entrenar-exportar-publicar con ML-Agents y el Hub de Hugging Face, cubriendo la Unidad 5 del curso.
- Punto de partida para *fine-tuning* o continuación del entrenamiento: cargar el checkpoint con `--resume` y extender los 200.000 pasos para estudiar la curva de aprendizaje o probar hiperparámetros alternativos de PPO.
- Integración en Unity para demos interactivas: importar el `.onnx` en un proyecto Unity con ML-Agents y usar el agente como oponente o NPC en escenas de prueba del entorno SnowballTarget.
- Referencia para pipelines de CI de RL: automatizar la validación de que un agente exportado se carga y ejecuta correctamente en el visor del Hub o en un runtime ONNX.
- Comparación de algoritmos: usar la recompensa media reportada (25,27 ± 2,40) como línea base frente a variantes con SAC, PPO con memoria recurrente u otras configuraciones en el mismo entorno.
- Investigación de robustez: evaluar la varianza de la política (desviación de 2,40 sobre la media) en distintas semillas y condiciones iniciales del entorno para estudiar estabilidad del entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Tarea | Dataset / entorno | Metrica | Valor |
|---|---|---|---|
| Reinforcement Learning | ML-Agents-SnowballTarget | mean_reward | 25,27 ± 2,40 |

La model card indica además un "result 22,87" junto al valor final de 25,27 ± 2,40, presumiblemente correspondiente a una evaluación intermedia o a una ejecución distinta; no se aclara la diferencia en la información disponible. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,0 GB) y la naturaleza de una política de ML-Agents, es previsible que sea de pocos megabytes, aunque no se confirma.
- GPU recomendadas: el entrenamiento se realizó en una Tesla T4; para inferencia basta con CPU o cualquier GPU compatible con ONNX Runtime o Barracuda.
- Cabe en GPU de consumo: sí, con altísima probabilidad dado el tamaño del artefacto, aunque no se documenta oficialmente.
- Opciones de despliegue: runtime de Unity ML-Agents (Barracuda/Inference Engine), ONNX Runtime, y el visor web de Hugging Face (`https://huggingface.co/unity`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| foleymon/ppo-SnowballTarget | PPO (ML-Agents) | SnowballTarget | 25,27 ± 2,40 | no disponible | Hub de Hugging Face |
| Otros agentes PPO del curso de Deep RL de Hugging Face | PPO (ML-Agents) | Distintos entornos del curso | no disponible | no disponible | Hub de Hugging Face |
| Agentes de referencia de Unity ML-Agents | PPO/SAC (ML-Agents) | Entornos oficiales | no disponible | licencia de ML-Agents (Unity) | Repositorio de Unity |

No se dispone de datos comparativos verificables con otros agentes del mismo entorno en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política solo es válida para el entorno SnowballTarget; no generaliza a otras tareas ni a variaciones sustanciales de observaciones o acciones.
- Resultados no verificados: el `mean_reward` de 25,27 ± 2,40 está marcado como `verified: false` en el model-index.
- Sin licencia declarada: no se especifica licencia, por lo que el uso comercial queda en un limbo legal y requiere contactar con el autor.
- Sin idiomas ni capacidades de lenguaje: no debe presentarse como un modelo de IA generativa ni usarse para tareas de NLP.
- Varianza no despreciable: la desviación de 2,40 sobre una media de 25,27 implica una variabilidad relativa cercana al 9,5 %, relevante si se usa como referencia de rendimiento.
- Documentación mínima: no se detallan hiperparámetros, arquitectura de red, semillas ni protocolo de evaluación, lo que dificulta la reproducibilidad exacta.
- Riesgo de sobreajuste al entorno de entrenamiento y de comportamiento frágil ante cambios en la dinámica del simulador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/foleymon/ppo-SnowballTarget
- Visor de agentes de Unity en Hugging Face: https://huggingface.co/unity
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Curso de Deep RL, Unidad 5: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Tutorial corto (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction

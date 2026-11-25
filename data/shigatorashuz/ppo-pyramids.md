# ShigatoraShuz/ppo-Pyramids

## Resumen

PPO Pyramids es una política de aprendizaje por refuerzo entrenada con el algoritmo Proximal Policy Optimization (PPO) sobre el entorno Pyramids del curso de ML-Agents de Unity. El autor, ShigatoraShuz, la publica como un artefacto exportado en formato ONNX para su uso con la librería ml-agents, no como un modelo de lenguaje. La model card indica que se empleó Random Network Distillation (RND) como mecanismo de exploración intrínseca y que la política exportada se evaluó directamente en el simulador de Windows.

El modelo resuelve una tarea concreta y acotada: controlar un agente dentro de un escenario de Unity con recompensa dispersa, donde la exploración basada en novedad (RND) resulta útil. No es un modelo generativo ni procesa lenguaje: su entrada y salida son observaciones y acciones del entorno de simulación. Por tanto, su relevancia es la de un ejemplo reproducible de entrenamiento PPO con RND en ML-Agents, útil para quien quiera inspeccionar el pipeline de exportación a ONNX o reutilizar la configuración.

El repositorio es de tamaño 0.0 GB, con cero descargas y cero likes en el momento de la consulta, y no declara licencia ni idiomas. El resultado declarado por el autor en el model-index es un `mean_reward` de -1.00 ± 0.00, es decir, una recompensa media negativa y sin varianza, lo que sugiere una política que no supera el comportamiento de referencia del entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para RL (PPO) exportada a ONNX; arquitectura interna no especificada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Algoritmo de entrenamiento | PPO con Random Network Distillation (RND) |
| Entorno | ML-Agents-Pyramids (Unity) |
| Libreria | ml-agents |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, unidades por capa, tipo de observaciones ni espacio de acciones). Lo que sí se declara es el algoritmo: PPO, un método de gradiente de política con recorte de la ratio de probabilidad para limitar el tamaño del paso de actualización, combinado con Random Network Distillation. RND añade una recompensa intrínseca basada en el error de predicción de una red aleatoria fija sobre las observaciones, lo que incentiva al agente a visitar estados novedosos y mitiga el problema de la recompensa dispersa.

El entrenamiento se realizó sobre el entorno Pyramids del curso de ML-Agents de Unity, y la política resultante se exportó a ONNX para su ejecución fuera del entrenador, evaluándose directamente en el simulador de Windows. No se especifican el número de pasos de entrenamiento, la composición de las observaciones, los hiperparámetros de PPO (learning rate, clip range, epochs, batch size) ni la configuración de RND (dimensión de la capa de embedding, coeficiente de recompensa intrínseca). Tampoco se documenta si hubo currículo, imitación o ajuste posterior.

## Capacidades

- Control de un agente en el entorno Pyramids de Unity mediante políticas entrenadas con PPO.
- Exploración guiada por novedad gracias a Random Network Distillation, orientada a entornos con recompensa dispersa.
- Inferencia a través de ONNX Runtime, lo que permite ejecutar la política fuera del entrenador de ML-Agents.
- Integración con la librería ml-agents para carga y ejecución de la política.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión general ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües: no procesa lenguaje natural.

## Casos de uso

- Reproducción de un pipeline de ML-Agents: sirve para inspeccionar cómo se exporta una política PPO a ONNX y cómo se carga en un runtime externo, útil como plantilla para proyectos propios.
- Estudio de RND en entornos con recompensa dispersa: la configuración publicada permite comparar el efecto de la recompensa intrínseca frente a PPO sin exploración adicional en el mismo escenario.
- Docencia y formación en RL: el entorno Pyramids es parte de un curso de Unity, y esta política puede usarse como ejemplo práctico de entrenamiento y evaluación en simulador.
- Pruebas de integración de ONNX en Unity: válido para verificar el flujo de inferencia de un modelo ONNX dentro de un proyecto de Unity en Windows.
- Referencia de línea base: dado el `mean_reward` declarado de -1.00, puede emplearse como punto de partida negativo para medir mejoras de nuevas políticas en el mismo entorno.
- Automatización de pruebas de regresión en entornos de simulación: la política exportada permite ejecutar episodios deterministas y comprobar que el pipeline de inferencia no se rompe tras cambios en el runtime.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Tarea | Dataset / entorno | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | ML-Agents-Pyramids | mean_reward | -1.00 +/- 0.00 |

No se han publicado otros resultados de benchmarks en la información disponible. El valor declarado corresponde a una recompensa media negativa y con desviación cero, lo que indica un rendimiento pobre y un comportamiento muy estable (posiblemente un agente que no completa el objetivo o que adopta una política degenerada). No se proporcionan curvas de aprendizaje, comparaciones con otras políticas ni métricas adicionales como tasa de éxito o longitud de episodio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una política de RL de tamaño no especificado y un repositorio de 0.0 GB, es probable que quepa en cualquier GPU consumer, pero no hay datos que lo confirmen.
- GPU recomendadas: no disponible. Para inferencia de políticas pequeñas en ONNX Runtime, una GPU integrada o una GTX 1650 en adelante suele ser suficiente, aunque no se especifica.
- Compatibilidad con GPU consumer: no confirmada por el autor; el formato ONNX permite ejecución en CPU, lo que elimina la dependencia de GPU para pruebas básicas.
- Opciones de despliegue: ONNX Runtime (principal, dado el formato de pesos), ml-agents para carga de la política y Unity con el paquete Barracuda o Sentis para inferencia dentro del motor.
- Latencia y throughput: no disponibles. Dependen del tamaño real de la red, del hardware y del backend de ONNX elegido.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Algoritmo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PPO Pyramids (este) | Política RL en ONNX | ML-Agents-Pyramids | PPO + RND | no disponible | Hugging Face, 0 descargas |
| Políticas oficiales de ML-Agents | Políticas RL | Varios entornos de ejemplo | PPO | Licencia de Unity ML-Agents | Repositorio oficial de Unity |
| Políticas PPO de Stable-Baselines3 | Políticas RL | Gymnasium | PPO | MIT | Repositorio de SB3 |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas de otros modelos sobre el mismo entorno ML-Agents-Pyramids en la información proporcionada, y el resultado declarado para este modelo (-1.00) no permite establecer una comparación significativa sin una línea base documentada.

## Limitaciones y advertencias

- El `mean_reward` declarado es -1.00 ± 0.00, lo que indica un rendimiento deficiente y sin variabilidad; no debe considerarse una política funcional para resolver el entorno.
- No se declara licencia, por lo que el uso comercial y la redistribución quedan sin marco legal explícito; conviene contactar con el autor antes de reutilizarla.
- El modelo está entrenado y evaluado únicamente en el entorno Pyramids de ML-Agents en Windows; no hay evidencia de generalización a otras variantes del escenario ni a otras plataformas.
- No se documentan sesgos, pero al ser una política de RL entrenada en un simulador concreto, puede explotar particularidades del entorno (reward hacking) sin que se hayan analizado.
- No hay información sobre la arquitectura interna, hiperparámetros ni datos de entrenamiento, lo que dificulta la reproducibilidad.
- El repositorio tiene cero descargas y cero likes, sin validación externa de la comunidad.
- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni emplearse para tareas de generación, razonamiento o código.
- El resultado del model-index está marcado como `verified: false`; no ha sido comprobado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShigatoraShuz/ppo-Pyramids
- Documentación de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación de PPO en ML-Agents: https://github.com/Unity-Technologies/ml-agents/blob/main/docs/Training-Configuration-File.md
- Paper de PPO (Schulman et al., 2017): https://arxiv.org/abs/1707.06347
- Paper de Random Network Distillation (Burda et al., 2018): https://arxiv.org/abs/1810.12894
- ONNX Runtime: https://onnxruntime.ai/

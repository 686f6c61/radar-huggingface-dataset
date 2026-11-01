# simillusion/dreamer-dmc-cartpole-swingup

## Resumen

Dreamer (V1) sobre DMC cartpole swing-up es un checkpoint de demostración publicado por simillusion, el autor de la librería open source Simulusion, que implementa en PyTorch el algoritmo descrito en el artículo "Dream to Control: Learning Behaviors by Latent Imagination" (Hafner et al., ICLR 2020). No es un modelo de lenguaje ni un modelo fundacional: es un agente de aprendizaje por refuerzo basado en modelos del mundo que aprende a partir de píxeles en el entorno DeepMind Control cartpole swing-up.

El modelo entrena un modelo recurrente de espacio de estados (RSSM) que predice la dinámica del entorno en un espacio latente y, a continuación, entrena un actor-crítico exclusivamente sobre trayectorias imaginadas dentro de ese modelo. El checkpoint se entrenó desde cero durante 60 000 pasos de entorno, unas 95 minutos en una GPU de portátil RTX 3050 de 4 GB, y alcanzó un retorno de evaluación de 493 sobre un máximo aproximado de 880.

Su relevancia es doble: por un lado, sirve como referencia práctica y reproducible para quien quiera entender el flujo completo de Dreamer en PyTorch; por otro, demuestra la API unificada de Simulusion, que expone todos sus modelos del mundo (encode/step/rollout/decode) bajo una misma interfaz. El autor advierte explícitamente de que no es una reproducción de los resultados del artículo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dreamer V1: RSSM (modelo recurrente de espacio de estados) + actor-crítico entrenado en imaginación latente |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; horizonte de imaginación no especificado en la información disponible) |
| Tipos de cuantizacion | no disponible (checkpoints en precisión nativa de PyTorch) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | state dict de PyTorch (`torch.load(..., weights_only=True)`), con estado del optimizador incluido |

## Arquitectura y entrenamiento

Dreamer V1 combina un modelo del mundo con un agente. El modelo del mundo es un RSSM que, a partir de observaciones en píxeles, codifica el estado en una variable latente con componente determinista y estocástica, y aprende a predecir transiciones, recompensas y reconstrucciones. Sobre ese modelo, el actor y el crítico se entrenan únicamente con trayectorias imaginadas, sin interacción adicional con el entorno real durante la fase de mejora de política.

El checkpoint se entrenó desde cero en el entorno cartpole-swingup de DeepMind Control durante 60 000 pasos de entorno (aproximadamente 95 minutos en una RTX 3050 de 4 GB). El retorno de evaluación pasó de unos 75 a 493 sobre un máximo de aproximadamente 880. El modelo del mundo sigue al carro real durante unos diez pasos imaginados antes de desviarse. El autor indica que se trata de una ejecución corta de demostración dimensionada para GPU de portátil y no de una reproducción de los resultados del artículo. No se dispone de información sobre el número de tokens, la composición del dataset ni el uso de RLHF/DPO, que no aplican en este contexto.

## Capacidades

- Aprendizaje de políticas de control a partir de observaciones en píxeles en el entorno DMC cartpole-swingup.
- Modelado del mundo: codificación (`encode`), transición latente (`step`), despliegue de trayectorias imaginadas (`rollout`) y decodificación (`decode`) mediante la interfaz de Simulusion.
- Entrenamiento de actor-crítico sobre trayectorias imaginadas en el espacio latente.
- Reanudación del entrenamiento: los checkpoints incluyen el estado del optimizador.
- Interfaz unificada con el resto de modelos del mundo de Simulusion.
- No soporta tool calling, function calling, agentes multi-paso lingüísticos, capacidades multilingües, visión general, audio ni modo de razonamiento textual.

## Casos de uso

- Reproducción didáctica de Dreamer V1: ejecutar `demos/dreamer_demo.py train --env cartpole-swingup --steps 60000` permite replicar el entrenamiento completo y estudiar las curvas de aprendizaje en una GPU de consumo.
- Investigación en aprendizaje por refuerzo basado en modelos: sirve como punto de partida para comparar variantes de RSSM, horizontes de imaginación o funciones de pérdida sobre un entorno de referencia bien conocido.
- Docencia y divulgación: el GIF de comparación entre entorno real y mundo imaginado en bucle abierto ilustra de forma directa qué aprende y dónde falla el modelo del mundo.
- Desarrollo de la librería Simulusion: el checkpoint valida la API `load_world_model` y `DreamerAgent.from_pretrained` para el resto de modelos del mundo de la librería.
- Pruebas de integración de pipelines de RL: al cargar como state dict estándar de PyTorch, se puede integrar en tests automatizados que verifiquen la interfaz encode/step/rollout/decode.
- Experimentos de continuación de entrenamiento: al incluir el estado del optimizador, es adecuado para estudiar el efecto de reanudar el entrenamiento con más pasos o con hiperparámetros distintos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Entorno | DMC cartpole-swingup |
| Pasos de entorno | 60 000 |
| Retorno de evaluación inicial | ~75 |
| Retorno de evaluación final | 493 |
| Retorno máximo aproximado | ~880 |
| Tiempo de entrenamiento | ~95 minutos en RTX 3050 de 4 GB |
| Deriva del modelo del mundo | ~10 pasos imaginados en bucle abierto |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- Entrenamiento reproducido en una GPU de portátil RTX 3050 con 4 GB de VRAM.
- El tamaño del repositorio es de 0,1 GB, por lo que la inferencia y el entrenamiento caben holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM; para entrenamientos más largos o con más entornos en paralelo se recomienda mayor VRAM (por ejemplo, RTX 4090, A100 o H100), aunque no se dispone de cifras específicas para esos casos.
- Despliegue: la librería Simulusion (`pip install simulusion`), con extra `simulusion[dmc]` para construir el entorno DeepMind Control. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Entorno | Pasos de entrenamiento | Retorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Dreamer V1 (este checkpoint) | Model-based RL con RSSM | DMC cartpole-swingup | 60 000 | 493 | MIT | HuggingFace |
| Dreamer V1 (artículo original) | Model-based RL con RSSM | DMC (suite completa) | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible | Paper |
| Otros modelos del mundo de Simulusion | Model-based RL | varios | no disponible | no disponible | MIT (según la librería) | HuggingFace / GitHub |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- No es una reproducción de los resultados del artículo: el propio autor lo indica de forma explícita.
- La política logra levantar el poste pero todavía no consigue equilibrarlo; el retorno de 493 está lejos del máximo aproximado de 880.
- El modelo del mundo se desvía tras unos diez pasos imaginados en bucle abierto, lo que limita el horizonte útil de planificación.
- Entrenamiento corto (60 000 pasos) dimensionado para una GPU de portátil, no para obtener el mejor rendimiento posible.
- Específico de un único entorno (cartpole-swingup); no es un agente general ni transferible sin reentrenamiento.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, código, matemáticas ni multilingües; los sesgos y el riesgo de alucinación en el sentido habitual no aplican, aunque sí existe riesgo de que el modelo del mundo genere predicciones plausibles pero incorrectas.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el artículo original de Dreamer y el software Simulusion según indica el autor.
- No se dispone de información sobre sesgos conocidos ni sobre restricciones adicionales de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/simillusion/dreamer-dmc-cartpole-swingup
- Repositorio de Simulusion: https://github.com/ParamThakkar123/simulusion
- Galería de clips y curvas de aprendizaje: https://paramthakkar123.github.io/simulusion/gallery.html
- Artículo Dreamer V1: https://arxiv.org/abs/1912.01603

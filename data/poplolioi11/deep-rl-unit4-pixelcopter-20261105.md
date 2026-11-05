# poplolioi11/deep-rl-unit4-pixelcopter-20261105

## Resumen

`poplolioi11/deep-rl-unit4-pixelcopter-20261105` es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo REINFORCE sobre el entorno `Pixelcopter-PLE-v0` de la PyGame Learning Environment (PLE). Lo desarrolla el usuario de Hugging Face `poplolioi11`, identificado en la model card como Chen-Yu Chu, como artefacto del curso de Deep Reinforcement Learning de la unidad 4. No es un modelo de lenguaje: es una política neuronal (una red de capas lineales con activaciones ReLU) que mapea observaciones de forma 7 a dos logits de acción, y se selecciona la acción mediante argmax.

El problema que resuelve es acotado: controlar el helicóptero del juego Pixelcopter manteniéndolo dentro de los túneles sin colisionar. El interés practico es doble. Por un lado, sirve como referencia reproducible de un pipeline completo de REINFORCE con evaluación honesta (semillas fijas, política congelada antes del test final, métricas reportadas con desviación estándar). Por otro, documenta de forma explícita las decisiones de entrenamiento (presupuesto fijo de 50 000 episodios, snapshot EMA en el episodio 45 000, validación en dos conjuntos A y B) y los artefactos entregados (`policy_state_dict.pt` y `architecture.json`).

La relevancia es, por tanto, educativa y metodológica más que de producción. El repositorio pesa 0.0 GB, no tiene descargas ni likes, y la librería declarada es `reinforce`. La licencia es MIT sobre los pesos, los datos de evaluación y la documentación originales, con la salvedad de que los activos gráficos y marcas del juego pertenecen a sus titulares y no se redistribuyen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward de capas Linear/ReLU definida en `architecture.json` (política REINFORCE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, observación de forma 7 sin memoria de contexto) |
| Tipos de cuantizacion | no disponible (pesos en `policy_state_dict.pt`, tensor-only) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT (pesos, datos de evaluación y documentación; activos del juego excluidos) |
| Formato de pesos | PyTorch state dictionary (`policy_state_dict.pt`), cargable con `torch.load(..., weights_only=True)`; especificación en `architecture.json` |

## Arquitectura y entrenamiento

La política es una red feedforward cuyas capas Linear/ReLU y cuyas claves exactas del state dictionary se describen en `architecture.json`, junto con la forma de entrada y la semántica de salida. La observación bruta tiene forma 7 y no se reescala. La salida son dos logits de acción y la inferencia es greedy (argmax). El entrenamiento parte de inicialización aleatoria, sin pesos de otros aprendices, y ejecuta el presupuesto fijo completo de 50 000 episodios. El modelo seleccionado es el snapshot EMA del episodio 45 000, con decaimiento EMA de 0.999 por episodio, elegido mediante validación en el conjunto A (100 episodios) y confirmado en el conjunto B independiente (300 episodios). Modelo e inferencia greedy se congelaron antes de las semillas finales 80 000–80 099.

El entorno conserva la recompensa nativa fijada de PLE (pérdida terminal de −5), la física y la condición de fin de partida. La API antigua de Gym de cuatro elementos se adapta explícitamente y no se describe como entorno Gymnasium. Las fuentes de primera parte del entorno son los commits concretos de `PyGame-Learning-Environment` y `gym-games` enlazados en la model card. El artefacto excluye el código fuente de entrenamiento y la información de depuración de TorchScript; las dependencias del entorno y el mapeo nativo de acciones quedan fuera del repositorio.

## Capacidades

- Control de política en `Pixelcopter-PLE-v0`: selecciona una de dos acciones a partir de una observación de forma 7.
- Inferencia greedy determinista: argmax sobre los dos logits de salida.
- Carga ligera en CPU: el state dictionary se carga con `map_location="cpu"` y `weights_only=True`.
- Reproducibilidad documentada: semillas finales 80 000–80 099 y métricas crudas en `evaluation.csv`.
- Especificación de arquitectura legible por máquina en `architecture.json` (capas, prefijos de claves, formas de entrada y semántica de salida).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento extendido: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de un pipeline REINFORCE completo: sirve como referencia didáctica para comparar decisiones de entrenamiento (presupuesto fijo, EMA, validación A/B) con los resultados reportados.
- Evaluación de metodología de RL: el par `evaluation.csv` más la descripción de semillas permite auditar cómo se congela la política antes del test final y cómo se reporta media y desviación estándar poblacional.
- Baseline para experimentos en Pixelcopter: al ser una política pequeña y determinista, es un punto de partida barato para probar variantes (PPO, A2C, ajustes de recompensa) sobre el mismo entorno.
- Docencia y material de curso: el repositorio separa pesos, arquitectura y datos de evaluación, lo que facilita usarlo en ejercicios de inspección de políticas y análisis de varianza en recompensa.
- Integración en entornos de simulación PLE: al conservar la recompensa nativa y la física original, puede cargarse en un bucle de simulación que adapte la API de cuatro elementos de Gym.
- Pruebas de infraestructura de inferencia en CPU: el formato tensor-only y la carga con `weights_only=True` permiten validar pipelines de despliegue ligeros sin GPU.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Entorno | Métrica | Valor |
|---|---|---|---|
| Reinforcement Learning | Pixelcopter-PLE-v0 | mean_reward | 61.89 +/- 51.86210466226761 |

Detalle adicional de la model card: 100 episodios finales con semillas independientes, media 61.89000000, desviación estándar poblacional 51.86210466, media menos desviación 10.02789534 y referencia local 5. La política de inferencia (greedy) se fijó antes del test final y la repetición usa la primera semilla predeclarada del test final, no el mejor episodio seleccionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0.0 GB) y el formato tensor-only, la política es muy pequeña y cabe holgadamente en memoria de sistema.
- GPU recomendadas: no disponibles; el autor declara entrenamiento en CPU y la carga del state dictionary se hace con `map_location="cpu"`.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del artefacto, aunque no se publican requisitos formales.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` con `weights_only=True`) e inferencia greedy; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un agente de RL).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `poplolioi11/deep-rl-unit4-pixelcopter-20261105` | REINFORCE (feedforward) | Pixelcopter-PLE-v0 | no disponible | no aplica | MIT | Hugging Face |
| Políticas REINFORCE de referencia del curso Deep RL | REINFORCE | Pixelcopter-PLE-v0 | no disponible | no aplica | no disponible | no disponible |
| Agentes PPO/A2C sobre PLE | Policy gradient / actor-critic | Pixelcopter-PLE-v0 | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos publicados de modelos comparables en la información proporcionada; la comparación cuantitativa de rendimiento entre alternativas no está disponible.

## Limitaciones y advertencias

- Ámbito muy restringido: la política solo opera en `Pixelcopter-PLE-v0` con observaciones de forma 7; no es transferible a otras tareas sin reentrenamiento.
- Alta varianza en recompensa: la desviación estándar (51.86) es del mismo orden que la media (61.89), y media menos desviación queda en 10.03, lo que indica episodios con retornos muy dispares.
- Resultados no verificados: el model-index marca `verified: false` y la model card aclara que los resultados describen simulación local independiente y no acreditan competencia humana ni certificación oficial.
- Sin código de entrenamiento: el artefacto excluye la fuente de entrenamiento y la información de depuración de TorchScript, lo que limita la reproducción exacta del proceso.
- Dependencias externas: el entorno y el mapeo nativo de acciones no se incluyen; hay que aportarlos desde las fuentes de PLE y `gym-games` indicadas.
- Compatibilidad de API: usa la API antigua de Gym de cuatro elementos adaptada explícitamente; no es un entorno Gymnasium.
- Licencia: MIT cubre pesos, datos de evaluación y documentación, pero los activos gráficos y marcas del juego siguen siendo de sus titulares y no se redistribuyen ni relicencian.
- Sin datos de sesgo, alucinación ni multilingüismo: no aplican a un agente de RL, pero tampoco se documentan análisis de robustez fuera de las semillas de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/poplolioi11/deep-rl-unit4-pixelcopter-20261105
- PyGame-Learning-Environment (commit fijado): https://github.com/ntasfi/PyGame-Learning-Environment/tree/3dbe79dc0c35559bb441b9359948aabf9bb3d331
- gym-games (commit fijado): https://github.com/simoninithomas/gym-games/tree/f31695e4ba028400628dc054ee8a436f28193f0b

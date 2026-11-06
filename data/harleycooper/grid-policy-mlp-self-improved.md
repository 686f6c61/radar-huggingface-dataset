# HarleyCooper/grid-policy-mlp-self-improved

## Resumen

`grid-policy-mlp-self-improved` es un checkpoint de política para un entorno de cuadrícula, derivado por el autor HarleyCooper del modelo base `grid-policy-mlp` (originalmente entrenado con PPO). No es un modelo de lenguaje: se trata de un perceptrón multicapa de 17.253 parámetros que selecciona acciones en un juego de rejilla, y esta revisión se ha obtenido mediante retropropagación con AdamW sobre trayectorias correctivas condicionadas por fallos, preservando la física del entorno y la regla de selección de acción voraz.

La relevancia del artefacto es metodológica más que de escala: demuestra un ciclo de auto-mejora sobre un checkpoint de RL sin modificar el simulador ni la política de selección, reportando una subida del retorno medio de 8,895833 a 16,750000 sobre un censo de desarrollo de 96 posiciones de inicio, con 56 mejoras, 0 regresiones y 40 empates. Los fallos dentro de 200 pasos caen de 56 a 6.

Es un modelo de nicho, útil para quien quiera reproducir o auditar técnicas de aprendizaje dirigido por fallos en políticas pequeñas, no para tareas de generación de texto, código o razonamiento general. La model card advierte explícitamente de que la población de evaluación es la misma usada en desarrollo, por lo que no hay afirmación de generalización a estados no vistos ni a horizontes más largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con capas `fc1`/`fc2`/`fc3`; política de RL para entorno de cuadrícula |
| Parametros totales | 17.253 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; observación de estado del entorno, no secuencia de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y npz; sin variantes GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (claves PyTorch `fc1/fc2/fc3`) y `policy_weights.npz` para el cargador `inference.py`; `initial_baseline.npz` con los tensores iniciales |

## Arquitectura y entrenamiento

La política es un MLP de tres capas totalmente conectadas (`fc1`, `fc2`, `fc3`) que mapea observaciones del entorno de cuadrícula a una distribución de acciones; la selección de acción en inferencia es voraz (`greedy`). El modelo base se entrenó con PPO en la revisión `28b137f6b049eaf3d9f8fa848edb87b83f46f94a`; esta revisión no altera la física del entorno ni la regla de selección de acción.

El ajuste se realizó con AdamW sobre rutas correctivas condicionadas por fallos, con preservación de KL respecto al checkpoint original. El conjunto de datos asociado es `HarleyCooper/grid-policy-mlp-self-improved-trajectories`. El resultado reportado sobre el censo de desarrollo de 96 posiciones de inicio es un retorno medio de 8,895833 → 16,750000, con 56 mejoras, 0 regresiones y 40 empates, y una reducción de fallos dentro de 200 pasos de 56 a 6. La model card indica que se reutiliza la población de desarrollo y no se reclama generalización a estados no vistos ni a horizontes más largos. La huella final de la política es `ea45539e3b1d58c5eae723ead9e9204c13a53900e762672949a3cc4b0c6c9e3d` y el commit fuente `e7845f15f172344d918c9d8085898fad2a9e8768`.

## Capacidades

- Selección de acciones en un entorno de cuadrícula mediante política voraz (`policy.act(observation, None, "greedy")`).
- Carga desde `policy_weights.npz` con el `inference.py` de la revisión fijada, o desde `model.safetensors` con las claves PyTorch `fc1/fc2/fc3` para la arquitectura original de `model.py`.
- Reproducción del baseline original mediante `initial_baseline.npz`, que conserva los tensores de partida exactos.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural, visión, audio ni capacidades multilingües.
- No dispone de modo "thinking" ni de generación de texto.

## Casos de uso

- Investigación en aprendizaje dirigido por fallos: usar el par `initial_baseline.npz` / `policy_weights.npz` para reproducir el ciclo de ajuste con AdamW y KL preservada sobre rutas correctivas, comparando el retorno antes y después.
- Auditoría de checkpoints de RL: el `audit.json` y el dashboard de entrenamiento permiten verificar limpiezas de tablero frente a límites de tiempo y contrastar la huella de la política.
- Baseline para entornos de cuadrícula: servir como referencia de política de 17.253 parámetros en experimentos con PPO u otros algoritmos, dado su bajo coste computacional.
- Demostración educativa de auto-mejora: el par de checkpoints y las trayectorias publicadas permiten ilustrar cómo se corrigen fallos concretos sin modificar el simulador.
- Integración en pipelines de evaluación de agentes: cargar la política con `inference.py` y medir retorno medio y tasa de fallos sobre posiciones de inicio controladas.
- Reproducción de resultados: ejecutar el censo de 96 posiciones de inicio para verificar la mejora reportada de 8,895833 a 16,750000 y la reducción de fallos de 56 a 6.

## Benchmarks y rendimiento

| Metrica | Baseline (`grid-policy-mlp`) | `grid-policy-mlp-self-improved` |
|---|---|---|
| Retorno medio (censo de 96 inicios de desarrollo) | 8,895833 | 16,750000 |
| Mejoras / regresiones / empates | — | 56 / 0 / 40 |
| Fallos dentro de 200 pasos | 56 | 6 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un modelo de lenguaje. Los datos anteriores proceden exclusivamente de la model card y corresponden a la población de desarrollo reutilizada, sin afirmación de generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (17.253 parámetros en precisión de 32 bits); ejecutable en CPU sin GPU.
- GPU recomendadas: no aplica; cualquier CPU es suficiente. No se requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: carga directa con `inference.py` y `huggingface_hub.hf_hub_download`; también carga de `model.safetensors` con PyTorch usando la arquitectura de `model.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, el coste por acción es despreciable frente al del simulador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `grid-policy-mlp-self-improved` | 17.253 | no aplica | Retorno medio 16,750000 en censo de 96 inicios | MIT | Hugging Face |
| `grid-policy-mlp` (base) | 17.253 (según modelo base) | no aplica | Retorno medio 8,895833 en el mismo censo | no disponible en la información | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas en lenguaje natural; cualquier uso en ese sentido es un error de aplicación.
- La evaluación se realizó sobre la misma población de desarrollo (96 posiciones de inicio); no hay evidencia de generalización a estados no vistos ni a horizontes más largos.
- El propio autor advierte de que no se reclama generalización ni comportamiento a largo plazo.
- Específico del entorno de cuadrícula y de su física; no transferible a otros dominios sin reentrenamiento.
- Riesgo de sobreajuste al censo de desarrollo, dado que 40 de los 96 inicios no cambiaron y la mejora se mide sobre datos reutilizados.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo equivalente es la selección de acciones incorrectas en estados fuera de distribución.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y verificar la licencia del modelo base `grid-policy-mlp`, no indicada en la información disponible.
- Para producción, fijar la revisión del modelo y usar el `inference.py` de esa misma revisión, ya que el formato de pesos (`npz`) está acoplado al cargador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarleyCooper/grid-policy-mlp-self-improved
- Modelo base: https://huggingface.co/HarleyCooper/grid-policy-mlp
- Dataset de trayectorias: https://huggingface.co/datasets/HarleyCooper/grid-policy-mlp-self-improved-trajectories
- Demo de inferencia (Space): https://huggingface.co/spaces/HarleyCooper/grid-policy-mlp-self-improved-demo
- Curva de entrenamiento en W&B: https://wandb.ai/christian-cooper-us/grid-policy-mlp-self-improvement/runs/6288c5a5

# lucaskim72/connectailab-rl-lucasbrain-v15.4-humanoid-ppo

## Resumen

`connectailab-rl-lucasbrain-v15.4-humanoid-ppo` es un agente de aprendizaje por refuerzo (RL) entrenado con PPO para la tarea de locomoción bípeda en el entorno `Humanoid-v5` de Gymnasium/MuJoCo. Lo publica Lucas Kim (usuario de HuggingFace `lucaskim72`) en el marco del curso de RL de CONNECT AI LAB × AI CITY BUILDERS, como continuación de una serie de experimentos (v1, v7, v13, v14, v15) en los que se varía un único hiperparámetro por versión para aislar su efecto sobre la recompensa.

No es un modelo de lenguaje: es una política neuronal (dos cabezas, una de política gaussiana y otra de valor) que observa 348 dimensiones del estado del humanoides y emite 17 acciones continuas de par articular en el rango [-0.4, 0.4]. La versión v15.4 reporta una puntuación media de 7507.9 sobre 10 episodios de validación (semillas 9000-9009), con longitud media de episodio de 1000 pasos y desplazamiento frontal medio de 33.99.

Su relevancia es la de un artefacto docente reproducible: documenta de forma explícita la curva de aprendizaje entre versiones, la ablación de hiperparámetros (clip, número de entornos, learning rate, pasos totales, tamaño de capa oculta, bonus de exploración, gamma, normalización de observaciones) y una recompensa auxiliar de postura añadida sobre la recompensa estándar del entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con dos cabezas (política gaussiana + función de valor), PPO con recorte |
| Parametros totales | no disponible (capa oculta 256; número exacto no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (RL; episodios de hasta 1000 pasos, observación de 348 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, PyTorch) |
| Idiomas soportados | no aplica (agente de control continuo, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch, state dict) + `added_scores.py` |

## Arquitectura y entrenamiento

La política es una red neuronal densa con capa oculta de 256 unidades, normalización de observaciones activada y dos cabezas: una que parametriza una distribución gaussiana sobre las 17 acciones continuas (media y desviación típica) y otra que estima el valor del estado. El algoritmo es PPO con recorte de 0.2, 10 épocas de reutilización por lote de 512 pasos, 8 entornos en paralelo (4096 transiciones por actualización), gamma 0.99, lambda 0.95, learning rate 3e-5 y bonus de exploración 0.0. La desviación típica inicial de la política es aproximadamente 0.14.

El entrenamiento acumula 9,618,560 pasos totales. La serie de versiones documenta la progresión: v1 con 1M pasos y lr 3e-4 como referencia; v7 con lr 1e-4; v13 con 2M pasos; v14 extendiendo a 4M pasos (mejor checkpoint en 3.7M); y v15 reiniciando desde el checkpoint de 3.7M con lr 3e-5. La innovación técnica destacable es la recompensa auxiliar de postura añadida a la recompensa del entorno, con factores por segmento corporal: tronco superior 0, cintura 0.4, pecho 0.4, brazos 0.2, pies 0.25. La fórmula de esa recompensa adicional está en `added_scores.py` y los factores se almacenan junto a los pesos en `model.pt`. La recompensa del entorno combina supervivencia (+5 por paso), velocidad frontal × 1.25, coste cuadrático de fuerzas (0.1 × suma de cuadrados) y un coste de contacto despreciable. El episodio termina si la altura del torso sale del rango [1.0, 2.0].

## Capacidades

- Control continuo de un humanoides simulado con 17 articulaciones y 348 dimensiones de observación.
- Locomoción bípeda estable: mantener la verticalidad y desplazarse hacia delante durante hasta 1000 pasos.
- Política estocástica en entrenamiento (muestreo gaussiano) y determinista en evaluación (se usa la media de la distribución, sin ruido).
- Reutilizable como baseline en `Humanoid-v5` para experimentos de ablación de PPO.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües, visión, audio ni modo "thinking".
- No es un agente conversacional ni un modelo generativo de texto.

## Casos de uso

- Docencia de PPO en control continuo: el repositorio sirve como ejemplo ejecutable de un pipeline PPO completo (recolección, ventaja GAE, recorte, actualización) sobre `Humanoid-v5`, con hiperparámetros documentados y comparativas entre versiones.
- Baseline para ablaciones: la serie v1/v7/v13/v14/v15 permite reproducir el efecto de variar learning rate, pasos totales, número de entornos, clip, tamaño de capa oculta, gamma o normalización, cambiando un solo factor por experimento.
- Investigación en recompensas auxiliares: la recompensa de postura segmentada por partes del cuerpo (`added_scores.py`) es un punto de partida para estudiar el efecto de shaping sobre la locomoción.
- Generación de demostraciones y visualizaciones: la política determinista puede reproducirse en MuJoCo para grabar vídeos o GIFs de marcha (el autor incluye `replay.gif`) con fines de divulgación.
- Evaluación de robustez de políticas RL: con semillas de validación fijas (9000-9009) y longitud de episodio fija, se puede medir varianza entre semillas y estabilidad del entrenamiento.
- Punto de partida para transferencia sim-to-real en robótica bípeda de bajo grado de libertad: el agente opera sobre 17 actuadores con límites de par acotados, lo que lo hace adecuado como referencia antes de aplicar domain randomization.
- Benchmark interno de frameworks RL: al ser un checkpoint PyTorch de tamaño pequeño (repo de 0.0 GB), se puede usar para validar pipelines de inferencia (por ejemplo, wrappers de Gymnasium) sin coste de almacenamiento.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Recompensa media (10 episodios, semillas 9000-9009) | 7507.9 |
| Longitud media de episodio | 1000.0 pasos |
| Desplazamiento frontal medio | 33.9863 |
| Recompensa de la reproducción mostrada (semilla 9000) | 7489.0 |
| Pasos totales de entrenamiento | 9,618,560 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: muy baja; el checkpoint es una MLP de capa oculta 256 con entrada de 348 dimensiones y salida de 17 acciones más el valor. Cabe en cualquier GPU consumer (menos de 1 GB de VRAM en FP32).
- GPU recomendadas: cualquiera; el cuello de botella real es la simulación MuJoCo, no la red. Para entrenamiento paralelo conviene una GPU con suficiente CPU asociada (8 entornos en paralelo según la configuración reportada).
- Cabe en consumer GPU: sí, incluidas GTX 1060, RTX 3060, RTX 4090, etc.
- Opciones de despliegue: PyTorch nativo cargando `model.pt`; no se documentan exportaciones a ONNX, TorchScript, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables).
- Latencia y throughput: no disponibles de forma explícita; el coste dominante es el paso de simulación MuJoCo, no la inferencia de la red.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-lucasbrain-v15.4-humanoid-ppo | Humanoid-v5 | PPO | MLP oculta 256 | episodios de 1000 pasos | no disponible | HuggingFace |
| Políticas PPO de referencia de Stable-Baselines3 | Humanoid-v5 | PPO | MLP configurable | episodios de 1000 pasos | MIT (SB3) | GitHub / PyPI |
| CleanRL PPO continuo | MuJoCo (varios) | PPO | MLP configurable | episodios variables | MIT (CleanRL) | GitHub |
| Policies del paper original de PPO (Schulman et al., 2017) | MuJoCo antiguos | PPO | MLP configurable | episodios variables | no disponible | arXiv |

No se dispone de comparaciones numéricas de recompensa entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no tiene capacidades de razonamiento simbólico.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Entrenado exclusivamente en `Humanoid-v5` de MuJoCo; no hay evidencia de transferencia a otros entornos ni a hardware real.
- La recompensa reportada depende de semillas concretas (9000-9009) y de la recompensa auxiliar de postura; no es comparable directamente con la recompensa estándar de `Humanoid-v5`.
- Riesgo de sobreajuste a la distribución de entrenamiento: el autor documenta que al seguir entrenando con el mismo learning rate la puntuación de validación bajó (v14), lo que sugiere sensibilidad al régimen de entrenamiento.
- El checkpoint está en `model.pt` (PyTorch); no hay versiones cuantizadas ni exportadas a otros formatos.
- El repositorio tiene tamaño 0.0 GB y 0 descargas / 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.
- La model card está mayoritariamente en coreano; la documentación en inglés o castellano es limitada.

## Enlaces

- HuggingFace: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v15.4-humanoid-ppo
- Contacto del autor: lucaskim72@gmail.com
- Entorno `Humanoid-v5` (Gymnasium): https://gymnasium.farama.org/environments/mujoco/humanoid/
- MuJoCo: https://mujoco.org/
- PPO (paper original): https://arxiv.org/abs/1707.06347
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repos de código o demos adicionales del autor.

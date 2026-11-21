# LordN77/ppo-Pyramids

## Resumen

`ppo-Pyramids` es una política de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) y Random Network Distillation (RND) para el entorno Pyramids de Unity ML-Agents, el escenario de exploración por recompensa dispersa que se utiliza en la unidad 5 del curso Deep RL de Hugging Face. Lo publica el usuario LordN77 en Hugging Face y no es un modelo de lenguaje: es un agente que controla un rol en un entorno 3D de Unity para localizar pirámides y esferas, sin capacidades de generación de texto, código ni visión.

El artefacto principal es una política exportada a ONNX que se ejecuta dentro de un proceso de Unity; el repositorio incluye además el script `restore_onnx.py`, que reconstruye el fichero `Pyramids.onnx` byte a byte verificando su digest SHA-256, y el `training.yaml` con la configuración de entrenamiento. El entrenamiento se realizó con Unity ML-Agents 1.1.0 y PyTorch 2.5.1, y el checkpoint seleccionado corresponde a 159.919 pasos.

Su relevancia es acotada y de tipo didáctico o de referencia: sirve como ejemplo reproducible de un agente PPO+RND en un entorno con recompensa dispersa, con evaluación honesta sobre 32 episodios retenidos y semilla documentada. El rendimiento reportado es negativo (recompensa media de -0,8698), lo que indica que la política no resuelve el entorno de forma fiable y debe interpretarse como un punto de partida, no como una solución de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal entrenada con PPO + Random Network Distillation (RND) sobre Unity ML-Agents |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (exportación a ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`Pyramids.onnx`), recuperable mediante `restore_onnx.py` |

## Arquitectura y entrenamiento

Se trata de un agente de aprendizaje por refuerzo profundo que combina PPO como algoritmo de optimización de política con Random Network Distillation como mecanismo de recompensa intrínseca para mitigar el problema de recompensa dispersa del entorno Pyramids. La política se exporta a ONNX para su ejecución en un proceso de Unity independiente, con acciones estocásticas sembradas y las recompensas originales del entorno.

El entrenamiento se llevó a cabo con Unity ML-Agents 1.1.0 y PyTorch 2.5.1. El autor informa de un total de 159.919 pasos de entrenamiento y de que este checkpoint fue el de mayor retorno medio en una partición de validación de 12 episodios con semilla 24281, comparado con los checkpoints de 199.998 y 240.011 pasos. La evaluación final se realizó sobre 32 episodios retenidos en un proceso de Unity nuevo. No se documentan el número de tokens (no aplica), la composición del dataset (no aplica) ni detalles de la red (capas, unidades) más allá del algoritmo.

## Capacidades

- Control de un agente en el entorno 3D Pyramids de Unity ML-Agents mediante observaciones y acciones del entorno.
- Exploración guiada por recompensa intrínseca (RND), orientada a entornos con recompensa dispersa.
- Ejecución de inferencia vía ONNX en un proceso de Unity independiente.
- Reproducibilidad del artefacto: `restore_onnx.py` verifica el SHA-256 y reconstruye el modelo byte a byte.
- Registro de la configuración de entrenamiento en `training.yaml`.
- No soporta generación de texto, razonamiento lingüístico, código, matemáticas, visión, tool calling, agentes multi-paso ni capacidades multilingües.

## Casos de uso

- Reproducción didáctica del ejercicio de la unidad 5 del curso Deep RL de Hugging Face: el agente y el script de restauración permiten replicar el flujo completo de entrenamiento y evaluación en el entorno oficial.
- Estudio comparativo de PPO con y sin RND: la configuración en `training.yaml` sirve como línea base para medir el efecto de la recompensa intrínseca en Pyramids.
- Punto de partida para fine-tuning: el checkpoint de 159.919 pasos puede reutilizarse como inicialización en entrenamientos posteriores dentro del mismo entorno.
- Validación de pipelines de exportación ONNX en ML-Agents: el par `Pyramids.onnx` + `restore_onnx.py` permite comprobar la integridad del artefacto y la compatibilidad con el runtime de Unity.
- Docencia y formación en RL: útil como ejemplo de evaluación honesta con episodios retenidos, semilla documentada y desviación estándar reportada.
- Pruebas de infraestructura de evaluación: el `results.json` con retornos individuales y semilla facilita verificar la reproducibilidad de un harness de evaluación en Unity.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Tarea | Reinforcement Learning |
| Entorno / dataset | ML-Agents-Pyramids |
| Mean reward | -0,8698 +/- 0,5044 |
| Pasos de entrenamiento | 159.919 |
| Episodios retenidos | 32 |
| Desviación estándar poblacional | 0,504 |
| Media menos desviación estándar | -1,374 |

El autor indica que el checkpoint de 159.919 pasos obtuvo el mayor retorno medio en una validación de 12 episodios (semilla 24281) frente a los de 199.998 y 240.011 pasos. No se han publicado comparaciones con otros agentes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño de la política no se documenta y depende de la arquitectura definida en `training.yaml`.
- GPU recomendadas: no disponible; al ser una política pequeña de ML-Agents, la inferencia puede ejecutarse en CPU o en GPU consumer, pero no se aportan medidas.
- Compatibilidad con GPU consumer: probable por la naturaleza del entorno, pero no confirmada en la documentación.
- Opciones de despliegue: runtime ONNX dentro de un proceso de Unity (flujo documentado); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre agentes comparables para el entorno Pyramids (otros checkpoints PPO, PPO+RND o SAC publicados) en la documentación proporcionada. La comparación interna disponible es la del propio autor entre sus checkpoints de 159.919, 199.998 y 240.011 pasos, en la que el de 159.919 obtuvo el mejor retorno medio en validación.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ppo-Pyramids (LordN77) | no disponible | no aplica | Mean reward -0,8698 +/- 0,5044 | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento negativo: la recompensa media de -0,8698 con desviación de 0,504 indica que la política no resuelve el entorno de forma fiable; la cota media menos desviación (-1,374) sugiere episodios claramente fallidos.
- Resultados no verificados: la métrica del model-index está marcada como `verified: false` y procede únicamente del autor.
- Licencia no especificada: no se indica licencia, por lo que el uso comercial queda sin marco legal claro y requiere contactar con el autor.
- Sesgos: no se documentan sesgos, pero al ser un agente de RL en un entorno sintético, su comportamiento está limitado al escenario Pyramids y no generaliza fuera de él.
- Riesgo de alucinación: no aplica en el sentido lingüístico; el riesgo equivalente es la exploración errática derivada de la recompensa intrínseca.
- Dependencia de versiones: entrenado con ML-Agents 1.1.0 y PyTorch 2.5.1; cambios de versión en Unity o en el runtime ONNX pueden afectar a la reproducibilidad.
- Idiomas y contexto: no aplica; el modelo no procesa lenguaje natural ni tiene ventana de contexto textual.
- Uso en producción: no recomendable como política final sin reentrenamiento o ajuste adicional, dado el retorno negativo reportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LordN77/ppo-Pyramids
- Entorno oficial Pyramids (Unity ML-Agents): https://huggingface.co/spaces/unity/ML-Agents-Pyramids
- Curso Deep RL, unidad 5: https://huggingface.co/learn/deep-rl-course/en/unit5/hands-on

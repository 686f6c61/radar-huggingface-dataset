# RaquelBG05/samplefactory-doom-health-gathering-unit8

## Resumen

`samplefactory-doom-health-gathering-unit8` es un agente de aprendizaje por refuerzo (RL) entrenado con PPO sobre el entorno `doom_health_gathering_supreme` de ViZDoom, utilizando la librería Sample Factory 2.1.1. No es un modelo de lenguaje: es una política neuronal que recibe fotogramas RGB del videojuego Doom y emite acciones para maximizar la recogida de botiquines (health packs) mientras sobrevive a los enemigos. Lo desarrolla RaquelBG05 en el contexto del curso Deep RL, y su interés es fundamentalmente didáctico y reproducible: demuestra un pipeline completo de entrenamiento y evaluación con Sample Factory.

El checkpoint incluido corresponde a 2.895.872 fotogramas de entrenamiento y reporta una recompensa media de 22,22 con desviación típica de 15,02 sobre 60 partidas evaluadas con política fija. La puntuación de la práctica (media menos desviación típica) es 7,21, un valor bajo que refleja alta varianza entre episodios.

El repositorio tiene un tamaño de 0,0 GB según Hugging Face, no declara licencia ni idiomas, y no incluye arquitectura detallada ni hiperparámetros de entrenamiento en la model card. Es, por tanto, un artefacto de práctica académica más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal para RL; la model card no detalla capas ni tipo de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: fotogramas RGB de ViZDoom) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoint de Sample Factory para `train_dir`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red. Por la librería empleada (Sample Factory 2.1.1) y el entorno (ViZDoom con observaciones RGB), se trata de una política convolucional que procesa imágenes y produce una distribución de acciones, entrenada con PPO (Proximal Policy Optimization). El checkpoint se conservó en Google Colab y se evaluó con los mismos pesos en 60 partidas con política fija.

El entrenamiento acumuló 2.895.872 fotogramas. No se especifican hiperparámetros (learning rate, batch size, número de workers, clipping de PPO), composición del dataset (en RL, distribución de estados inducida por la política) ni si hubo ajuste fino posterior. La model card advierte que el cuaderno muestra la evaluación de un checkpoint anterior de la misma ejecución, y que el resultado reportado corresponde a los pesos incluidos en el repositorio.

## Capacidades

- Control de agente en `doom_health_gathering_supreme`: recibe fotogramas RGB y emite acciones discretas del entorno ViZDoom.
- Política entrenada con PPO mediante Sample Factory, reproducible con el comando de evaluación documentado.
- Evaluación determinista con política fija sobre 60 episodios.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes multi-step en el sentido de LLM; su "razonamiento" es la política RL aprendida.
- Sin capacidades multilingües, de visión general, audio ni thinking mode.
- Uso previsto: reproducción de experimentos de RL y comparación de checkpoints en el mismo entorno.

## Casos de uso

- Reproducción de prácticas de RL: ejecutar el comando de `enjoy_vizdoom` con Sample Factory 2.1.1, Gymnasium 0.29.1 y ViZDoom 1.3.2 para verificar la recompensa media reportada (22,22 ± 15,02) sobre 60 episodios.
- Punto de partida para ajuste fino: cargar el checkpoint en `train_dir` y continuar el entrenamiento con PPO para estudiar curvas de aprendizaje y sensibilidad a hiperparámetros.
- Comparación de checkpoints: evaluar este checkpoint frente a otros de la misma ejecución (la model card menciona uno anterior) para analizar la evolución de la recompensa y la varianza.
- Docencia en deep RL: usar el repositorio como ejemplo mínimo de pipeline Sample Factory + ViZDoom en un cuaderno de Colab.
- Investigación en entornos visuales: servir de baseline para probar variantes de preprocesado de imagen o de recompensa en `doom_health_gathering_supreme`.
- Análisis de estabilidad de políticas: estudiar la alta desviación típica (15,02 sobre media 22,22) para diagnosticar varianza entre episodios y posibles mejoras de regularización o evaluación.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Reinforcement learning | doom_health_gathering_supreme | mean_reward | 22,22 ± 15,02 |
| Reinforcement learning | doom_health_gathering_supreme | puntuación de la práctica (media − desviación típica) | 7,21 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- Inferencia en CPU: el comando documentado usa `--device=cpu`, por lo que la evaluación de 60 episodios puede ejecutarse sin GPU.
- GPU recomendadas: no especificadas en la model card; para entrenamiento con Sample Factory se suele emplear GPU dedicada, pero no hay datos concretos.
- VRAM estimada: no disponible (el tamaño del checkpoint no se detalla; el repo figura como 0,0 GB).
- ¿Cabe en GPU de consumo? No confirmado; la evaluación documentada funciona en CPU.
- Despliegue: Sample Factory 2.1.1 con `sf_examples.vizdoom.enjoy_vizdoom`; requiere Gymnasium 0.29.1 y ViZDoom 1.3.2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros agentes RL comparables en `doom_health_gathering_supreme` ni datos de referencia de la comunidad para contrastar.

## Limitaciones y advertencias

- Alta varianza: desviación típica de 15,02 frente a media de 22,22; la puntuación de la práctica (7,21) es baja y sugiere rendimiento inestable entre episodios.
- Licencia no declarada: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Model card incompleta: sin arquitectura, hiperparámetros ni detalles de entrenamiento, lo que dificulta la reproducibilidad exacta.
- Discrepancia documentada: el cuaderno evalúa un checkpoint anterior; los resultados de la tarjeta corresponden a los pesos incluidos, no necesariamente a los del cuaderno.
- Entorno único: la política está especializada en `doom_health_gathering_supreme`; no generaliza a otras tareas ni escenarios.
- Sin metadatos de sesgos ni evaluación de robustez; no apto para producción fuera del entorno de investigación.
- Dependencias de versión estricta (Sample Factory 2.1.1, Gymnasium 0.29.1, ViZDoom 1.3.2): cambios de versión pueden romper la reproducción.

## Enlaces

- Hugging Face: https://huggingface.co/RaquelBG05/samplefactory-doom-health-gathering-unit8
- Cuaderno de Colab ejecutado: https://colab.research.google.com/drive/1ng6xbIT9zgrCh4zdmD1FJfWdyx3NNgYo
- Sample Factory: no disponible en la información proporcionada
- ViZDoom: no disponible en la información proporcionada
- Paper de PPO: no disponible en la información proporcionada

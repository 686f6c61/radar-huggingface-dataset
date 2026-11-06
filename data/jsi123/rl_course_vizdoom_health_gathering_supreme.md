# JSI123/rl_course_vizdoom_health_gathering_supreme

## Resumen

`JSI123/rl_course_vizdoom_health_gathering_supreme` es un checkpoint de agente de aprendizaje por refuerzo profundo (deep RL) entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. No se trata de un modelo de lenguaje, sino de una política neuronal que controla un agente en un escenario de combate en primera persona de Doom, con el objetivo de recoger packs de salud mientras sobrevive. Lo publica el usuario JSI123 como artefacto de un curso de reinforcement learning, empleando Sample-Factory 2.0 como framework de entrenamiento.

El interés del checkpoint es didáctico y de reproducibilidad: permite cargar una política ya entrenada, evaluarla con el script `enjoy` de Sample-Factory y reanudar el entrenamiento desde el punto en que se dejó. El entorno `doom_health_gathering_supreme` es una variante de dificultad alta del escenario de recogida de salud, donde el agente debe navegar un mapa con monstruos y localizar ítems de salud de forma eficiente.

La información publicada es mínima: no hay detalles sobre arquitectura de red, hiperparámetros, número de pasos de entrenamiento ni composición del dataset (el propio entorno genera las experiencias). El repo ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal entrenada con APPO; detalles de capas no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | no disponible (artefacto de Sample-Factory; el repo contiene el checkpoint y logs de TensorBoard) |

Otros datos relevantes:

| Parametro | Valor |
|---|---|
| Algoritmo | APPO (Asynchronous Proximal Policy Optimization) |
| Entorno | `doom_health_gathering_supreme` (ViZDoom) |
| Framework | Sample-Factory 2.0 |
| Tamano del repo | 0,1 GB |
| Tarea | reinforcement-learning |
| Metrica declarada | mean_reward = 12,28 +/- 3,50 (no verificada) |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

El checkpoint se ha producido con APPO, el algoritmo de actor-crítico asíncrono implementado en Sample-Factory. APPO combina PPO con un esquema de workers asíncronos que desacopla la recolección de experiencia de la actualización de la política, lo que permite escalar el entrenamiento en CPU y GPU de forma eficiente. La red neuronal concreta (número de capas, canales, tamaño de la capa recurrente) no se detalla en la model card; Sample-Factory emplea por defecto una torre convolucional para observaciones visuales y una capa recurrente (LSTM o GRU) para integrar información temporal, pero no se confirma en este caso.

No se especifican el número de pasos de entrenamiento, la composición del dataset (el entorno genera las trayectorias en línea), ni si se aplicaron técnicas adicionales como reward shaping o currículos. La model card únicamente documenta los comandos para descargar, evaluar y reanudar el entrenamiento con Sample-Factory, lo que sugiere que el artefacto se generó como parte de un ejercicio de curso y no como un release con documentación exhaustiva.

## Capacidades

- Control de agente en el entorno ViZDoom `doom_health_gathering_supreme`: navegación, recogida de ítems de salud y supervivencia frente a enemigos.
- Política entrenada con APPO, apta para evaluación con el script `enjoy` de Sample-Factory.
- Reanudación del entrenamiento desde el checkpoint mediante el script `train` con `--restart_behavior=resume`.
- Registro de métricas en TensorBoard (el repo incluye logs de entrenamiento).
- No soporta tool calling, function calling, agentes multi-paso en el sentido de LLM, ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni otras capacidades propias de modelos fundacionales.

## Casos de uso

- Reproducción de experimentos de curso: cargar el checkpoint con `sample_factory.huggingface.load_from_hub` y evaluar la política con el script `enjoy` para comparar curvas de aprendizaje entre alumnos.
- Punto de partida para fine-tuning: reanudar el entrenamiento con `--restart_behavior=resume` y `--train_for_env_steps` elevado para explorar variantes de hiperparámetros sobre el mismo entorno.
- Benchmark de referencia en ViZDoom: usar el `mean_reward` declarado (12,28 +/- 3,50) como línea base para comparar nuevas políticas en `doom_health_gathering_supreme`.
- Docencia de APPO: analizar los logs de TensorBoard incluidos para estudiar la dinámica de entrenamiento asíncrono y la estabilidad del algoritmo.
- Investigación en RL visual: emplear la política como baseline en estudios sobre generalización en entornos 3D con observaciones de píxeles.
- Integración en pipelines de evaluación automática: desplegar el agente en un bucle de evaluación headless con ViZDoom para medir robustez frente a variaciones de semilla.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 12,28 +/- 3,50 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una política RL de tamaño reducido (repo de 0,1 GB, que incluye checkpoint y logs), es probable que quepa en GPUs de gama baja, pero no se confirma.
- GPU recomendadas: no disponibles en la documentación.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del artefacto es plausible en RTX 3060 o superiores, pero es una estimación no verificada.
- Opciones de despliegue: Sample-Factory 2.0 (scripts `enjoy` y `train`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros checkpoints comparables en la documentación proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- La licencia no está especificada; no se puede asumir uso comercial sin consultar al autor.
- El `mean_reward` declarado está marcado como `verified: false`; no ha sido validado de forma independiente.
- La política está especializada en un único entorno (`doom_health_gathering_supreme`) y no generaliza a otras tareas sin reentrenamiento.
- No se documentan sesgos, pero al ser un agente RL en un entorno de combate, su comportamiento está condicionado por la dinámica del juego y la recompensa definida.
- No hay información sobre hiperparámetros, arquitectura exacta ni número de pasos, lo que dificulta la reproducibilidad completa.
- El repo no registra descargas ni likes, lo que sugiere un artefacto de curso sin validación por parte de la comunidad.
- No es un modelo de lenguaje: no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.

## Enlaces

- Hugging Face: https://huggingface.co/JSI123/rl_course_vizdoom_health_gathering_supreme
- Sample-Factory (GitHub): https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Guía de integración con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/

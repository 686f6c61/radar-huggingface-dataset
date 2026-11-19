# boldlab/tworoom-planning-512x6-5k

## Resumen

TwoRoom C5 es un checkpoint de modelo del mundo (world model) entrenado para el entorno de planificación TwoRoom, publicado por el usuario `boldlab` en Hugging Face. Se trata de un ajuste fino (finetune) del modelo base `quentinll/lewm-tworooms`, desarrollado dentro del marco de trabajo `evolving-wm`, que entrena modelos del mundo mediante algoritmos evolutivos (EGGROLL) en lugar de descenso de gradiente clásico. El modelo aprende a predecir la dinámica del entorno TwoRoom y se emplea junto con un planificador basado en el método CEM (Cross-Entropy Method).

El checkpoint corresponde al estado final tras 5.000 actualizaciones EGGROLL, con un presupuesto de planificación durante el entrenamiento de 512 candidatos CEM × 6 iteraciones. El repositorio es de pequeño tamaño (0,1 GB) y contiene los pesos en formato `weights.pt`, además de `config.json`, `planner_config.json` y `provenance.json` para reproducir el experimento. No es un modelo de lenguaje: es un modelo del mundo orientado a tareas de planificación en un entorno 2D simulado.

La relevancia de este modelo es metodológica: forma parte de una línea de investigación que explora el entrenamiento de modelos del mundo mediante poblaciones evolutivas (1.024 individuos, 8 GPUs por ejecución), lo que permite estudiar cómo el presupuesto de planificación afecta al aprendizaje. Es un artefacto de investigación, no un modelo listo para producción, y su uso está orientado a reproducir experimentos y comparar configuraciones de planificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo del mundo (world model) para el entorno TwoRoom; arquitectura detallada en `config.json` (no disponible en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `weights.pt` (PyTorch state dict) |

## Arquitectura y entrenamiento

El modelo se basa en `quentinll/lewm-tworooms` y se ajusta mediante el algoritmo EGGROLL, un método de entrenamiento evolutivo implementado en el repositorio `evolving-wm` (commit `8bdcb97`). El entrenamiento se realizó con una población de 1.024 individuos, 8 GPUs por ejecución, una tasa de aprendizaje de 0,004114155739091268, sigma de 0,002174092466593994 y semilla 3072. Se utilizó un conjunto fijo de tareas: 10.000 tareas de entrenamiento y 1.000 de validación, con un tamaño de chunk de acciones de 5.

La innovación principal es el uso de planificación CEM durante el entrenamiento con un presupuesto de 512 candidatos × 6 iteraciones, lo que permite estudiar cómo la capacidad de planificación influye en la calidad del modelo del mundo aprendido. No se dispone de información sobre la composición exacta de los datos de entrenamiento ni sobre el uso de RLHF/DPO, ya que no es un modelo de lenguaje. El checkpoint es de una única semilla de entrenamiento, por lo que los resultados de evaluación entre semillas del planificador no cuantifican la variabilidad entre semillas de entrenamiento.

## Capacidades

- Predicción de la dinámica del entorno TwoRoom (modelo del mundo).
- Planificación mediante CEM (Cross-Entropy Method) con presupuesto configurable.
- Entrenamiento evolutivo con EGGROLL (población de 1.024 individuos).
- Soporte de chunk de acciones de tamaño 5.
- Evaluación con planificadores configurables independientemente del entrenamiento.
- Reproducibilidad mediante `provenance.json` y protocolos de tareas.
- No dispone de capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Investigación en modelos del mundo: permite reproducir el experimento de entrenamiento EGGROLL con un presupuesto de planificación concreto (512×6) y comparar con otras configuraciones del sweep.
- Estudio del efecto del presupuesto de planificación: al ser un checkpoint con un presupuesto fijo, sirve como punto de referencia para analizar cómo varía el rendimiento al cambiar los parámetros del planificador en evaluación.
- Desarrollo de planificadores CEM: el modelo puede usarse como entorno de prueba para algoritmos de planificación que necesiten un modelo del mundo preentrenado en TwoRoom.
- Reproducibilidad de experimentos: los archivos `config.json`, `planner_config.json` y `provenance.json` permiten reconstruir las condiciones exactas del entrenamiento y validar resultados.
- Comparación de semillas de entrenamiento: aunque este checkpoint es de una sola semilla, puede combinarse con otros checkpoints de la misma familia para estudiar variabilidad.
- Docencia y divulgación: ejemplo práctico de entrenamiento evolutivo de modelos del mundo y de planificación basada en CEM en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, pero el consumo en inferencia depende de la arquitectura definida en `config.json`, que no se detalla.
- GPU recomendadas: no disponible; el entrenamiento se realizó con 8 GPUs, pero no se especifica el modelo.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: la librería es `stable-worldmodel`; no se indican integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo del mundo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| boldlab/tworoom-planning-512x6-5k | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| quentinll/lewm-tworooms (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otros checkpoints de evolving-wm | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint de una única semilla de entrenamiento; la variabilidad entre semillas de entrenamiento no está cuantificada.
- Los resultados de evaluación entre semillas del planificador no reflejan la variabilidad del entrenamiento.
- No es un modelo de lenguaje ni un modelo multimodal; no puede usarse para tareas de generación de texto, código o visión.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial.
- El modelo está especializado en el entorno TwoRoom; no generaliza a otros dominios sin reentrenamiento.
- Riesgo de alucinación no aplica en el sentido habitual, pero las predicciones del modelo del mundo pueden ser inexactas fuera de la distribución de entrenamiento.
- No se dispone de información sobre sesgos, limitaciones de contexto o idioma.
- Es un artefacto de investigación; no se recomienda su uso en producción sin validación adicional.

## Enlaces

- [Hugging Face: boldlab/tworoom-planning-512x6-5k](https://huggingface.co/boldlab/tworoom-planning-512x6-5k)
- [Modelo base: quentinll/lewm-tworooms](https://huggingface.co/quentinll/lewm-tworooms)
- [Repositorio evolving-wm](https://github.com/fracapuano/evolving-wm)
- [Training run en W&B](https://wandb.ai/francescocapuano/evolving-wm/runs/30prww5n)
- [Planning-budget sweep en W&B](https://wandb.ai/francescocapuano/evolving-wm/sweeps/uwp4wk77)

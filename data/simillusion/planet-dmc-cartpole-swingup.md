# simillusion/planet-dmc-cartpole-swingup

## Resumen

PlaNet es un modelo de mundo (world model) para aprendizaje por refuerzo basado en modelo, implementado en PyTorch dentro de la librería Simulusion. Este checkpoint concreto es una demo entrenada sobre la tarea cartpole swing-up del benchmark DeepMind Control Suite (DMC). El modelo reproduce el planteamiento del artículo "Learning Latent Dynamics for Planning from Pixels" (Hafner et al., ICML 2019), que combina un modelo generativo del entorno en un espacio latente con planificación mediante el método de entropía cruzada (CEM) directamente sobre las representaciones aprendidas.

A diferencia de los modelos de lenguaje, PlaNet no tiene red de política: en cada paso de decisión evalúa secuencias de acciones dentro de su modelo latente y ejecuta la primera acción del mejor plan encontrado. El checkpoint se entrenó desde cero durante 75 minutos en una GPU de portátil RTX 3050 de 4 GB, con action repeat de 8, y el retorno de evaluación pasó de 76 a 435 (un episodio grabado del planificador puntúa 388). Se trata de una demo de tamaño reducido, no de una reproducción de los resultados del paper.

Su relevancia actual es fundamentalmente didáctica y de infraestructura: sirve como ejemplo funcional de una API unificada para world models (encode / step / rollout / decode) y como punto de partida para experimentar con planificación en modelos latentes sin necesidad de hardware de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo latente con RSSM (recurrent state-space model) y planificación CEM; sin red de política |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el estado latente se actualiza paso a paso) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión nativa PyTorch) |
| Idiomas soportados | no aplica (modelo de control, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | state dict de PyTorch (`torch.load(..., weights_only=True)`), incluye estado del optimizador |
| Tarea | DMC cartpole swing-up (action repeat 8) |
| Tamaño del repo | 0.0 GB (según HuggingFace) |
| Librería | simulusion |
| Pipeline | reinforcement-learning |

## Arquitectura y entrenamiento

El modelo sigue la formulación de PlaNet: un modelo de dinámica latente recurrente (RSSM) que aprende a predecir observaciones (píxeles) y recompensas a partir de acciones, y un planificador que en cada paso muestrea secuencias de acciones, las evalúa con el método de entropía cruzada dentro del modelo aprendido y ejecuta la primera acción del plan de mayor retorno estimado. La interfaz expuesta por Simulusion separa las operaciones en `encode`, `step`, `rollout` y `decode`, lo que permite reutilizar el mismo contrato para otros world models de la librería.

El entrenamiento se realizó desde cero durante 75 minutos en una RTX 3050 de 4 GB de VRAM, sobre la tarea cartpole swing-up de DeepMind Control con action repeat 8. No se especifican en la información disponible el número de pasos de entorno, el tamaño del dataset de entrenamiento ni detalles sobre composición de datos. El checkpoint incluye el estado del optimizador, por lo que admite continuación del entrenamiento. El script de reproducción es `demos/planet_demo.py train --minutes 75` sobre un clon del repositorio.

## Capacidades

- Aprendizaje de dinámica latente a partir de observaciones en píxeles (codificación, transición y decodificación).
- Predicción de recompensas dentro del modelo latente.
- Planificación de acciones mediante CEM sobre secuencias futuras, sin política explícita.
- Rollouts multi-paso en el espacio latente para evaluar planes.
- Interfaz unificada con otros world models de Simulusion (`load_world_model(path, "planet")`).
- Integración con el agente `PlanningAgent` y el planificador `CEMPlanner` de la librería.
- Reanudación del entrenamiento a partir del estado del optimizador incluido en el checkpoint.
- No soporta tool calling, function calling, agentes basados en lenguaje, ni capacidades multilingües, de visión general o de audio; su dominio es el control continuo en la tarea DMC cartpole swing-up.

## Casos de uso

- Docencia y divulgación de model-based RL: el checkpoint permite ejecutar un agente PlaNet completo en minutos y visualizar la comparación entre entorno real y predicción latente (el GIF de la model card), lo que resulta adecuado para explicar planificación en espacio latente sin entrenar desde cero.
- Reproducción y experimentación con Simulusion: sirve como referencia para validar la API `encode / step / rollout / decode` y el `PlanningAgent` antes de escalar a otras tareas o modelos de la librería.
- Punto de partida para fine-tuning: al incluir el estado del optimizador, se puede continuar el entrenamiento con `demos/planet_demo.py train` para explorar hiperparámetros (action repeat, horizonte de planificación, número de muestras CEM) sin partir de cero.
- Prototipado en hardware de gama baja: el entrenamiento completo cabe en una RTX 3050 de 4 GB, por lo que es viable en portátiles y estaciones de trabajo modestas para pruebas de concepto.
- Investigación en planificación CEM: permite aislar el efecto del planificador (tamaño de población, número de iteraciones, horizonte) sobre el retorno, manteniendo fijo el modelo aprendido.
- Benchmark interno de world models: al estar integrado en una API común, se puede comparar cualitativamente con otros modelos de Simulusion sobre la misma tarea de control.
- Generación de visualizaciones de "sueños" del modelo: el par real/predicción del GIF es útil para materiales de blog, clases o informes técnicos sobre modelos generativos de dinámica.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del entrenamiento de esta demo:

| Metrica | Valor |
|---|---|
| Retorno de evaluación inicial | 76 |
| Retorno de evaluación final | 435 |
| Retorno de un episodio grabado del planificador | 388 |
| Tiempo de entrenamiento | 75 minutos |
| GPU de entrenamiento | RTX 3050 (4 GB) |
| Action repeat | 8 |

No se han publicado resultados de benchmarks estándar (por ejemplo, comparación con el paper original en las seis tareas de DMC) en la información disponible. El autor indica explícitamente que no es una reproducción de los resultados del paper.

## Requisitos de hardware

- Entrenamiento verificado en una GPU de portátil RTX 3050 con 4 GB de VRAM.
- VRAM de inferencia estimada: no disponible de forma explícita; por el tamaño del entrenamiento (4 GB) se espera que la inferencia quepa holgadamente en GPUs consumer, pero no se aporta una cifra concreta.
- GPU recomendadas: no disponibles; el propio checkpoint se generó en una RTX 3050. GPUs de gama alta (A100, H100, RTX 4090) no son necesarias para esta demo.
- Cabe en GPU consumer: sí, al menos en RTX 3050 de 4 GB para entrenamiento.
- Opciones de despliegue: PyTorch con la librería Simulusion (`pip install simulusion`), carga vía `huggingface_hub.snapshot_download` y `simulusion.world_model.load_world_model`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PlaNet (este checkpoint, Simulusion) | World model + CEM | DMC cartpole swing-up | 75 min en RTX 3050 | MIT | HuggingFace + GitHub |
| PlaNet original (Hafner et al., 2019) | World model + CEM | Seis tareas DMC | No especificado en la información disponible | No disponible | Código de referencia del paper |
| Dreamer / DreamerV3 | World model + política aprendida | DMC y otros dominios | No disponible | No disponible | Implementaciones públicas de terceros |

No se dispone en la información proporcionada de parámetros, contexto ni cifras de rendimiento de las alternativas, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Es una demo de 75 minutos en una GPU de portátil; el autor advierte que no reproduce los resultados del paper.
- Entrenada únicamente en la tarea cartpole swing-up de DMC; no generaliza a otras tareas sin reentrenamiento.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes conversacionales.
- Sin datos publicados sobre sesgos, alucinación o robustez fuera de la distribución de entrenamiento.
- El retorno de evaluación (435) y el del episodio grabado (388) presentan variabilidad entre episodios, esperable en una demo corta.
- Sin información sobre número de parámetros, tamaño del dataset ni hiperparámetros completos, lo que dificulta la reproducibilidad exacta más allá del script proporcionado.
- Licencia MIT: permite uso comercial, pero al derivar del paper de Hafner et al. conviene citar tanto el paper como Simulusion según indica el autor.
- El repositorio figura con 0.0 GB en HuggingFace, dato que puede reflejar un recuento incompleto de los archivos.
- No se documentan requisitos de latencia ni throughput para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/simillusion/planet-dmc-cartpole-swingup
- Repositorio Simulusion: https://github.com/ParamThakkar123/simulusion
- Galería de resultados: https://paramthakkar123.github.io/simulusion/gallery.html
- Paper PlaNet (arXiv): https://arxiv.org/abs/1811.04551

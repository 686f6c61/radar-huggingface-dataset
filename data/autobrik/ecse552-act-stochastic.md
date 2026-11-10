# Autobrik/ecse552-act-stochastic

## Resumen

Autobrik/ecse552-act-stochastic es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers), el modelo de imitación propuesto originalmente por Tony Z. Zhao en el repositorio `tonyzhaozh/act`. Lo desarrolla el usuario Autobrik en el marco del proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado *Learning to Manipulate a New Object from Action-Free Videos*. No es un modelo de lenguaje: es un modelo de robótica orientado a imitación (imitation learning) que predice secuencias de acciones articulares absolutas a partir de imágenes de cámara.

El checkpoint se ha entrenado sobre el dataset `Autobrik/ecse552-ocbench-block` (revisión `6b5e02b6ec6b7a1083479ca57411b3c5295a6021`) y se publica como artefacto reproducible de un experimento académico: el repositorio contiene múltiples ejecuciones organizadas en directorios `n<demos>/seed<k>/`, cada una con checkpoints, estadísticas del dataset, historial de pérdidas y metadatos de procedencia. Su relevancia es acotada: sirve como referencia reproducible para estudiar ACT en escenarios de manipulación con pocas demostraciones y para comparar variantes de etiquetado de acciones.

Arquitectura transformer con decodificación por *action chunking* (ventana de 20 pasos a 10 Hz, equivalente a 2 s), entrenada con imágenes únicamente (el estado del robot se pone a cero) y con acciones de 7 dimensiones rellenadas con ceros hasta las 14 dimensiones que espera la implementación upstream. El tamaño del repositorio es de 0,7 GB y la licencia es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de acción (*chunk*) de 20 pasos a 10 Hz (2 s) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`): `policy_best.ckpt`, `policy_last.ckpt`, `selected.ckpt`, más `dataset_stats.pkl`, `act_run.json`, `history.json` y `provenance.json` |

## Arquitectura y entrenamiento

El modelo es ACT sin modificaciones sobre el código original (`tonyzhaozh/act`), adaptado mediante el adaptador `src/action_free/act_original.py` y la configuración `configs/act_stochastic.toml` del repositorio del proyecto. La entrada es exclusivamente visual: las observaciones de estado del robot se anulan (se ponen a cero) y el modelo aprende a predecir acciones a partir de imágenes. Las acciones son objetivos articulares absolutos de 7 dimensiones, rellenadas con ceros hasta las 14 dimensiones que espera la implementación upstream.

El entrenamiento se realiza sobre el dataset `Autobrik/ecse552-ocbench-block`, con episodios de longitud variable y *action chunking* de 20 pasos a 10 Hz (2 s por predicción), lo que equivale a la configuración de ACT de 100 pasos a 50 Hz. Las ejecuciones abarcan varias colecciones de datos: la colección oráculo (d) y colecciones con objetivos pseudo-etiquetados para los escenarios (b) y (c), listadas en el campo `data.collections` de `act_run.json`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO (no procede en un modelo de imitación).

Cada directorio `n<demos>/seed<k>/` contiene los checkpoints `policy_best.ckpt` (menor pérdida de validación), `policy_last.ckpt` y `selected.ckpt`, junto con `selection.json`, que documenta cuál de los dos se eligió según las *rollouts* de validación en el dominio fuente y cuál se evaluó en test. La carga se realiza con `action_free.act_original.ActPolicy("n300/seed0/selected.ckpt", device)`.

## Capacidades

- Predicción de secuencias de acciones articulares absolutas (7 dimensiones) a partir de observaciones visuales.
- Manipulación robótica por imitación: reproduce comportamientos aprendidos de demostraciones para un objeto nuevo.
- Ejecución de *action chunks* de 20 pasos a 10 Hz, lo que permite control a 2 s por predicción.
- Aprendizaje a partir de vídeos sin acciones (action-free) mediante el uso de objetivos pseudo-etiquetados en algunas colecciones.
- Evaluación reproducible por semilla y por número de demostraciones (`n<demos>/seed<k>/`).
- No soporta *tool calling*, *function calling*, razonamiento multi-paso simbólico ni capacidades multilingües.
- No dispone de modo *thinking*, visión general, audio ni generación de texto.

## Casos de uso

- **Investigación en imitación robótica con pocas demostraciones**: el modelo permite reproducir el experimento de ACT con distintos volúmenes de demostraciones (`n<demos>`) y semillas (`seed<k>`), comparando la pérdida de validación y el rendimiento en *rollouts* de test.
- **Aprendizaje de manipulación a partir de vídeos sin acciones**: las colecciones con objetivos pseudo-etiquetados (b)/(c) permiten estudiar hasta qué punto ACT puede entrenarse sin etiquetas de acción reales, usando el oráculo (d) como referencia.
- **Evaluación comparativa de checkpoints**: `selection.json` y `history.json` permiten analizar la selección entre `policy_best.ckpt` y `policy_last.ckpt` según validación y test, útil para estudiar sobreajuste en políticas visuales.
- **Reproducibilidad académica**: la inclusión de `provenance.json`, `act_run.json` y `dataset_stats.pkl` facilita replicar exactamente las condiciones de entrenamiento en un entorno de laboratorio.
- **Prototipado de control visual para brazos articulados de 7 grados de libertad**: las acciones absolutas de 7 dimensiones encajan con manipuladores tipo Franka, lo que permite integrar el checkpoint en un bucle de control a 10 Hz.
- **Docencia y prácticas de robótica**: el modelo sirve como ejemplo funcional de ACT en un curso de aprendizaje automático para robótica, con artefactos listos para cargar y evaluar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio (0,7 GB) incluye múltiples checkpoints, por lo que un único checkpoint es sustancialmente menor.
- GPU recomendadas: no disponible. ACT se ha ejecutado históricamente en GPUs de gama media-alta, pero no se especifica en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante el adaptador `action_free.act_original.ActPolicy` del repositorio del proyecto; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de robótica).
- Latencia y throughput: no disponibles. El control opera a 10 Hz con *chunks* de 20 pasos, pero no se publican medidas de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-stochastic | no disponible | *chunk* de 20 pasos a 10 Hz | no disponible | MIT | Hugging Face |
| ACT original (tonyzhaozh/act) | no disponible | *chunk* de 100 pasos a 50 Hz | no disponible en esta ficha | MIT | GitHub |
| Otros checkpoints ACT del mismo proyecto | no disponible | no disponible | no disponible | MIT | Hugging Face (repo del autor) |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo específico de una tarea y un objeto (bloque de OCBench); no generaliza a otros entornos sin reentrenamiento.
- Entrenado únicamente con imágenes y estado del robot anulado, lo que puede degradar el rendimiento en tareas donde la propiocepción es informativa.
- Las acciones de 7 dimensiones se rellenan con ceros hasta 14, lo que introduce dimensiones no utilizadas y puede afectar a la compatibilidad con otras herramientas de ACT.
- Riesgo de sobreajuste a las demostraciones y a las condiciones de iluminación, cámara y disposición de objetos del dataset.
- No se documentan sesgos, pero al ser un modelo de imitación hereda los sesgos y limitaciones de las demostraciones humanas.
- Sin métricas publicadas de éxito en *rollouts* de test, por lo que no es posible estimar su fiabilidad en producción.
- La licencia MIT permite uso comercial, pero el modelo depende de la implementación ACT original y del dataset, cuyas condiciones deben verificarse por separado.
- No apto para tareas de lenguaje, visión general, razonamiento simbólico ni agentes conversacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-act-stochastic
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Repositorio del proyecto: https://github.com/BrikHMP18/ecse-552-project
- ACT original: https://github.com/tonyzhaozh/act

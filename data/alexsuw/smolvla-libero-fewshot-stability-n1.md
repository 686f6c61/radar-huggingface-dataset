# alexsuw/smolvla-libero-fewshot-stability-n1

## Resumen

Este repositorio contiene doce checkpoints independientes de un experimento controlado de estabilidad en aprendizaje few-shot (N=1) con el modelo de visión-lenguaje-acción SmolVLA. El autor, alexsuw, parte del checkpoint `seen-expert-100k` (entrenado en tareas LIBERO vistas) y aplica dos métodos de fine-tuning sobre tres tareas retenidas de LIBERO-Goal, con dos semillas de entrenamiento (42 y 123). El objetivo es medir la estabilidad del aprendizaje con una única demostración, comparando un protocolo de estadísticas congeladas y un anclaje L2-SP.

El modelo es relevante porque aborda dos problemas críticos en robótica: la adaptación rápida con pocas demostraciones (few-shot) y el aprendizaje continuo (continual learning), donde el modelo debe adquirir nuevas habilidades sin olvidar las previamente aprendidas. SmolVLA es un modelo VLA compacto de aproximadamente 450 millones de parámetros diseñado para ejecutarse en hardware de consumo, lo que hace que este experimento sea reproducible con recursos limitados. El repositorio incluye métricas de éxito en tarea objetivo y de retención corregida sobre las tareas vistas, además de los pesos, estadísticas de normalización y configuración completa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción, basado en VLM compacto) |
| Parametros totales | ~450M (según paper SmolVLA, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Parametros entrenables | 99.880.992 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, sin cuantización publicada) |
| Idiomas soportados | no disponible (entrenado para comandos de lenguaje en robótica) |
| Licencia | other (derivado de `lerobot/smolvla_base`; seguir términos del dataset y modelo upstream) |
| Formato de pesos | PyTorch (`weights.pt`, `config.resolved.yaml`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción (VLA) que adapta un VLM compacto a tareas de robótica, produciendo acciones de control a partir de observaciones visuales y comandos de lenguaje. El modelo base se entrenó previamente en tareas LIBERO (nvidia/LIBERO_LeRobot_v3) con 100.000 pasos (checkpoint `seen-expert-100k`). Este repositorio contiene fine-tunings adicionales con dos protocolos:

- **Frozen-Stats FT**: mantiene las estadísticas de normalización congeladas de `libero_90` y entrena solo la cabeza de acción (Action Expert).
- **Anchored FT (L2-SP)**: igual que el anterior, pero añade una penalización L2-SP (Learning without Forgetting) con λ=0.01 sobre los parámetros entrenables, relativa a su inicialización congelada.

En ambos casos se usa exactamente una demostración de la tarea objetivo (N=1). Los doce checkpoints cubren dos métodos, tres tareas retenidas y dos semillas. No se seleccionaron ni ajustaron métodos ni hiperparámetros basándose en los resultados, lo que garantiza la validez del experimento.

## Capacidades

- **Manipulación robótica**: genera acciones de control para tareas de LIBERO (por ejemplo, abrir cajones, recoger objetos).
- **Aprendizaje few-shot**: puede adaptarse a una nueva tarea con una única demostración.
- **Aprendizaje continuo**: evalúa la retención de tareas vistas tras el fine-tuning en tareas nuevas.
- **Comprensión de lenguaje natural**: interpreta instrucciones en lenguaje natural para guiar el comportamiento.
- **Percepción visual**: procesa observaciones de cámara para generar acciones.
- **Entrenamiento reproducible**: incluye configuraciones, hashes y métricas de entrenamiento completos para reproducibilidad.

## Casos de uso

- **Evaluación de estabilidad en few-shot robótico**: investigadores pueden usar los 12 checkpoints para analizar cómo varía el éxito en tarea objetivo y la retención entre semillas y métodos, sin necesidad de reentrenar.
- **Benchmark de aprendizaje continuo**: los resultados con retención corregida (20.6%–31.7%) sirven como referencia para nuevos métodos de mitigación del olvido catastrófico en VLA.
- **Estudio de protocolos de normalización**: comparar la influencia de congelar estadísticas vs. re-estimarlas en el rendimiento con datos limitados.
- **Validación de métodos de regularización**: el anclaje L2-SP con λ=0.01 puede replicarse en otros VLA para verificar su efecto sobre la retención.
- **Desarrollo de robots adaptables**: integración en entornos de investigación que requieren que un robot aprenda nuevas tareas en el mundo real con pocas demostraciones.
- **Reproducción de experimentos científicos**: la estructura del repositorio (config, checksums, métricas) permite reproducir exactamente los resultados publicados.

## Benchmarks y rendimiento

Se presentan los resultados del experimento de estabilidad N=1 en tres tareas retenidas de LIBERO-Goal (promedio de semillas y tareas):

| Metodo | Exito en tarea objetivo | Retencion corregida (tareas vistas) | Parametros entrenables | VRAM pico |
|---|---:|---:|---:|---:|
| Naive N=1 reference | 109/120 (90.8%) | 37/180 (20.6%) | 99,880,992 | 7,540 MiB |
| Frozen-Stats FT N=1 | 109/120 (90.8%) | 39/180 (21.7%) | 99,880,992 | 7,540 MiB |
| Anchored FT N=1 | 105/120 (87.5%) | 57/180 (31.7%) | 99,880,992 | 8,036 MiB |

No se han publicado comparaciones con otros modelos en la información disponible. Los datos de éxito en tarea objetivo son altos (>87%), pero la retención de tareas vistas es baja (≤31.7%), lo que indica que el olvido catastrófico sigue siendo un problema incluso con una sola muestra.

## Requisitos de hardware

- **VRAM estimada**: 7.5–8.0 GiB según el método (frozen-stats o anclado).
- **GPU recomendadas**: cualquier GPU con 8 GiB de VRAM o superior, por ejemplo NVIDIA RTX 3060/3070/4080, RTX 4090, A10, A100, H100.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de consumo de 8 GB o más.
- **Opciones de despliegue**: el modelo se usa principalmente para entrenamiento y evaluación en simulación (LIBERO). Para inferencia, se puede cargar con LeRobot; no se ha publicado soporte para vLLM, Ollama o llama.cpp (modelo de robótica, no de texto).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento LIBERO | Licencia | Formato |
|---|---|---|---|---|---|
| alexsuw/smolvla-libero-fewshot-stability-n1 | ~450M | no disponible | Target 90.8% / Retención 31.7% (mejor) | other | PyTorch |
| bicmol/smolvla-libero | ~450M | no disponible | no disponible | other | PyTorch |
| HuggingFaceVLA/smolvla_libero | ~450M | no disponible | no disponible | other | PyTorch |

No se dispone de comparaciones cuantitativas directas con estos modelos en la información proporcionada. La comparación con la familia SmolVLA se basa en que comparten la misma arquitectura base.

## Limitaciones y advertencias

- **Retención limitada**: la retención de tareas vistas es baja (≤31.7% incluso con anclaje L2-SP), lo que indica olvido catastrófico residual.
- **Dependencia de la demostración**: el rendimiento depende de una única demostración; no se han probado variaciones de calidad de la demostración.
- **Entrenamiento en simulación**: los resultados son en simulación LIBERO; la transferencia a robots reales no está validada.
- **Licencia**: la licencia es "other" y se derivan de `lerobot/smolvla_base` y `nvidia/LIBERO_LeRobot_v3`, por lo que hay que revisar los términos upstream antes de uso comercial.
- **Sin cuantización**: no se han publicado pesos cuantizados; se requiere PyTorch.
- **Idiomas**: no se especifican idiomas soportados; el modelo se entrenó con instrucciones en inglés de LIBERO.
- **Sin pesos en safetensors**: el formato es `weights.pt` (PyTorch), lo que puede requerir conversión para ciertas herramientas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/alexsuw/smolvla-libero-fewshot-stability-n1)
- [Colección de modelos SmolVLA LIBERO Few-shot](https://huggingface.co/collections/alexsuw/smolvla-libero-few-shot-6a8b009357482d2b4b9d3c2f)
- [Código del experimento](https://github.com/alexsuw/smolvla-libero-fewshot)
- [Dataset LIBERO_LeRobot_v3](https://huggingface.co/datasets/nvidia/LIBERO_LeRobot_v3)
- [Paper de SmolVLA (arXiv 2506.01844)](https://arxiv.org/abs/2506.01844)
- [Modelo base seen-expert-100k](https://huggingface.co/alexsuw/smolvla-libero-fewshot-seen-expert-100k)## Resumen

El repositorio `alexsuw/smolvla-libero-fewshot-stability-n1` contiene doce checkpoints independientes de un experimento controlado de estabilidad en aprendizaje few-shot (N=1) con el modelo de visión-lenguaje-acción SmolVLA. El autor, alexsuw, parte del checkpoint `seen-expert-100k` (entrenado en tareas vistas de LIBERO) y aplica dos métodos de fine-tuning sobre tres tareas retenidas de LIBERO-Goal, con dos semillas de entrenamiento (42 y 123). El objetivo es medir la estabilidad del aprendizaje con una única demostración y su efecto sobre la retención de tareas previamente aprendidas.

SmolVLA es un VLA compacto de aproximadamente 450 millones de parámetros, diseñado para ejecutarse en hardware de consumo, lo que hace que este experimento sea accesible y reproducible. El repositorio incluye los pesos, estadísticas de normalización congeladas, configuraciones, hashes y métricas de evaluación completas, lo que permite reproducir los entrenamientos y comparar la estabilidad entre métodos y semillas. La relevancia de este trabajo reside en que aborda dos problemas críticos en robótica: la adaptación rápida con pocas muestras y el aprendizaje continuo sin olvido catastrófico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-lenguaje-accion, basado en VLM compacto) |
| Parametros totales | ~450 M (segun modelo SmolVLA; no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Parametros entrenables | 99.880.992 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (entrenado para comandos en ingles de LIBERO) |
| Licencia | other (derivado de `lerobot/smolvla_base`; seguir terminos upstream) |
| Formato de pesos | PyTorch (`weights.pt`, `config.resolved.yaml`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que adapta un VLM compacto a tareas de robotica, procesando observaciones visuales e instrucciones en lenguaje natural para generar acciones de control. El checkpoint base `seen-expert-100k` se entreno en tareas de LIBERO con 100.000 pasos. Sobre el, se aplican dos protocolos de fine-tuning:

- **Frozen-Stats FT**: mantiene las estadisticas de normalizacion congeladas de `libero_90` y entrena solo la capa de accion (Action Expert). No se ajustan estadisticas de la tarea objetivo.
- **Anchored FT (L2-SP)**: igual que el anterior, pero anade una penalizacion L2-SP (Learning without Forgetting) con lambda=0.01 sobre los parametros entrenables, relativa a su inicializacion congelada.

Cada celda del experimento usa exactamente una demostracion de la tarea objetivo (N=1). El repositorio incluye doce checkpoints: dos metodos, tres tareas retenidas y dos semillas de entrenamiento. No se seleccionaron ni ajustaron metodos ni hiperparametros basandose en los resultados, lo que garantiza la validez estadistica del experimento.

## Capacidades

- **Manipulacion robotica**: control de tareas de LIBERO (abrir cajones, mover objetos, etc.) en simulacion.
- **Aprendizaje few-shot**: adaptacion a una nueva tarea con una unica demostracion.
- **Aprendizaje continuo**: evaluacion de la retencion de tareas vistas tras el fine-tuning en tareas nuevas.
- **Comprension de lenguaje natural**: procesa instrucciones en lenguaje natural para guiar el comportamiento.
- **Percepcion visual**: procesa observaciones de camara para generar acciones.
- **Reproducibilidad**: incluye configuraciones, hashes y metricas de entrenamiento completas.

## Casos de uso

- **Evaluacion de estabilidad few-shot**: los checkpoints permiten medir la variabilidad entre semillas y metodos en exito y retencion, sin reentrenar.
- **Benchmark de aprendizaje continuo**: la retencion corregida (20.6%-31.7%) sirve como referencia para comparar futuros metodos de mitigacion del olvido en VLA.
- **Estudio de protocolos de normalizacion**: comparar el impacto de congelar estadisticas frente a estimarlas sobre la tarea objetivo en entornos con datos limitados.
- **Validacion de metodos de regularizacion**: el anclaje L2-SP con lambda=0.01 puede replicarse en otros VLA para verificar su efecto sobre la retencion.
- **Investigacion en robotica adaptable**: integracion en pipelines de aprendizaje continuo para que un robot adquiera nuevas habilidades con una sola demostracion sin perder las previas.
- **Reproduccion de experimentos academicos**: la estructura del repositorio (config, checksums, metricas) permite replicar los entrenamientos exactos para verificar resultados.

## Benchmarks y rendimiento

Se presentan los resultados del experimento de estabilidad N=1 en tres tareas retenidas de LIBERO-Goal (promedio de semillas):

| Metodo | Exito en tarea objetivo | Retencion corregida (tareas vistas) | Parametros entrenables | VRAM pico |
|---|---:|---:|---:|---:|
| Naive N=1 reference | 109/120 (90.8%) | 37/180 (20.6%) | 99,880,992 | 7,540 MiB |
| Frozen-Stats FT N=1 | 109/120 (90.8%) | 39/180 (21.7%) | 99,880,992 | 7,540 MiB |
| Anchored FT N=1 | 105/120 (87.5%) | 57/180 (31.7%) | 99,880,992 | 8,036 MiB |

No se han publicado comparaciones con otros modelos en la informacion disponible. Los resultados muestran un exito alto en la tarea objetivo (>=87.5%) pero una retencion limitada (<=31.7%), lo que evidencia que el olvido catastrofico sigue siendo un problema relevante incluso con una sola muestra de adaptacion.

## Requisitos de hardware

- **VRAM estimada**: 7.5-8.0 GiB segun el metodo (Frozen-Stats 7,540 MiB; Anchored FT 8,036 MiB).
- **GPU recomendadas**: NVIDIA RTX 3060/3070/4080/4090, A10, A100, H100; cualquier GPU con 8-10 GB de VRAM es suficiente.
- **Compatibilidad con consumer GPU**: si, cabe en GPUs de consumo con 8 GB o mas.
- **Opciones de despliegue**: se usa principalmente con LeRobot y simulacion LIBERO; no se ha publicado soporte para vLLM, Ollama o llama.cpp.
- **Latencia y throughput**: no disponible; el modelo se disena para entrenamiento y evaluacion en simulacion, no para inferencia en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exito LIBERO | Retencion | Licencia | Formato |
|---|---|---|---|---|---|---|
| `alexsuw/smolvla-libero-fewshot-stability-n1` | ~450M | no disponible | 90.8% (frozen) / 87.5% (anchored) | 21.7% / 31.7% | other | PyTorch |
| `bicmol/smolvla-libero` | ~450M | no disponible | no disponible | no disponible | no disponible | PyTorch |
| `HuggingFaceVLA/smolvla_libero` | ~450M | no disponible | no disponible | no disponible | no disponible | PyTorch |

No se dispone de comparaciones cuantitativas directas con estos modelos en la informacion proporcionada. La familia SmolVLA comparte la misma arquitectura base, pero este repositorio es el unico que publica resultados de retencion y estabilidad few-shot.

## Limitaciones y advertencias

- **Retencion limitada**: la retencion de tareas vistas es baja (<=31.7%), lo que indica olvido persistente incluso con anclaje L2-SP.
- **Dependencia de la demostracion**: el rendimiento depende de una unica demostracion; no se ha evaluado la variabilidad por calidad de la misma.
- **Solo simulacion**: los resultados son en simulador LIBERO; la transferencia a robots reales no esta validada.
- **Licencia restrictiva**: la licencia "other" y el uso de `nvidia/LIBERO_LeRobot_v3` y `lerobot/smolvla_base` requieren revisar los terminos de cada componente antes de uso comercial.
- **Sin cuantizacion**: no se ofrecen pesos en formato cuantizado (GGUF, AWQ, etc.); se requiere PyTorch.
- **Sin datos de idiomas**: no se especifican idiomas soportados; el modelo se entreno con instrucciones en ingles de LIBERO.
- **Sin optimizador ni RNG**: el repositorio excluye estado de optimizador y generadores aleatorios, lo que limita la continuacion del entrenamiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/alexsuw/smolvla-libero-fewshot-stability-n1)
- [Coleccion SmolVLA LIBERO Few-shot](https://huggingface.co/collections/alexsuw/smolvla-libero-few-shot-6a8b009357482d2b4b9d3c2f)
- [Codigo del experimento](https://github.com/alexsuw/smolvla-libero-fewshot)
- [Dataset LIBERO_LeRobot_v3](https://huggingface.co/datasets/nvidia/LIBERO_LeRobot_v3)
- [Paper de SmolVLA (arXiv 2506.01844)](https://arxiv.org/abs/2506.01844)
- [Checkpoint base seen-expert-100k](https://huggingface.co/alexsuw/smolvla-libero-fewshot-seen-expert-100k)

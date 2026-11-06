# myendless/action-repre-newtask14-n32-lap-layerwise384-l36-head10k-3b0277e9

## Resumen

Este repositorio contiene un checkpoint de investigación para robótica denominado "文本动作 — 新任务泛化 N32 / 36-layer 384-width readout" (acción textual, generalización a nuevas tareas). Lo publica el usuario `myendless` y consiste en un módulo de lectura de acciones (*action readout*) entrenado sobre un VLM congelado de 4B parámetros, presumiblemente de la familia Qwen3-VL según las etiquetas. El componente entrenado es un DiT por capas (*layerwise DiT*) de 36 capas, anchura 384 y 6 cabezas de atención, con 111.872.680 parámetros incluyendo los proyectores por capa. El modelo predice acciones de articulación absolutas (14 dimensiones) con un horizonte de *chunk* de 32 pasos.

El problema que aborda es la generalización a tareas nuevas en manipulación robótica: se entrena únicamente el *readout* de acciones manteniendo el VLM congelado, lo que reduce drásticamente el coste computacional frente a un *fine-tuning* completo. El checkpoint se entrenó durante 10.000 pasos sobre 14 tareas reservadas (*held-out*), con 4.928 episodios y 1.452.052 ventanas de entrenamiento, usando 8 GPUs Hygon en BF16 con batch global de 128.

Es relevante como artefacto de investigación reproducible: incluye configuración, normalización, manifiesto y registros de procedencia, y documenta explícitamente que no se ha realizado evaluación en bucle cerrado. No es un modelo listo para producción ni cargable con `AutoModel.from_pretrained` de Transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM congelado de 4B + *layerwise DiT* (36 capas, anchura 384, 6 cabezas, dim. de cabeza 64) con proyectores por capa; atención propia/cruzada intercalada |
| Parámetros totales | 111.872.680 (solo el *readout* entrenado, incluyendo proyectores); el VLM congelado es de 4B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (horizonte de acción de 32 pasos) |
| Tipos de cuantización | no disponible (entrenado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (state dict nativo completo de PyTorch, incluye VLM congelado y *readout*; no compatible con `AutoModel.from_pretrained`) |

## Arquitectura y entrenamiento

La arquitectura combina un VLM congelado de 4B parámetros (etiquetado como Qwen3-VL) que actúa como extractor de representaciones, y un *readout* de acciones basado en un DiT por capas. Este *readout* tiene 36 capas, anchura 384, 6 cabezas de atención con dimensión de cabeza 64 y 111.872.680 parámetros contando los proyectores por capa. Mantiene el modo de atención propia/cruzada intercalada; los proyectores en posiciones impares quedan asignados pero sin uso. La salida son acciones de articulación absolutas de 14 dimensiones con horizonte de 32 pasos.

El entrenamiento se realizó desde la inicialización del VLM `myendless/action-repre-newtask33-lap-v4-j14-h32-source30k-e7eee04f` (revisión `a626e1ad2f984cdfae868ffd20ae0f68f95b7b1e`), con 10.000 pasos en 8 GPUs Hygon, BF16, batch global 128 y semilla 42. Los datos son 14 tareas reservadas, cada una con 32 episodios limpios y 320 aleatorizados (4.928 episodios en total, 1.452.052 ventanas), con normalización de origen compartida entre 33 tareas. La pérdida final de entrenamiento fue 0,022330142557621002; el autor advierte explícitamente que la pérdida de entrenamiento no equivale a tasa de éxito en control. Se trata de un cambio de arquitectura respecto al experto de acción histórico de 28 capas de Qwen3, no de una ablación solo de anchura.

## Capacidades

- Predicción de acciones de articulación absolutas de 14 dimensiones para control robótico, con horizonte de 32 pasos por *chunk*.
- Generalización a tareas nuevas mediante *readout* entrenado sobre VLM congelado.
- Procesamiento de observaciones visuales a través del VLM de 4B congelado (familia Qwen3-VL según etiquetas).
- Atención propia/cruzada intercalada para integrar información visual y de estado con las representaciones de acción.
- No se documenta soporte de *tool calling*, *function calling*, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni de generación de texto libre.
- No se documenta *thinking mode*, audio ni otras modalidades más allá de visión y acción.

## Casos de uso

- Investigación en generalización de políticas robóticas: sirve como punto de partida para estudiar cómo un *readout* ligero sobre un VLM congelado se comporta en tareas no vistas durante el preentrenamiento del VLM, usando las 14 tareas reservadas como banco de evaluación.
- Manipulación con horizonte corto: el *chunk* de 32 pasos y las 14 articulaciones absolutas lo hacen adecuado para tareas de alcance y colocación donde se planifica un bloque corto de movimiento y se reejecuta con replanificación.
- Reproducción de experimentos: al incluir configuración, manifiesto, normalización y registros de procedencia, permite reproducir el entrenamiento del *readout* sobre el mismo VLM inicial y verificar la pérdida reportada.
- Estudio de arquitecturas de *readout*: comparar el DiT por capas de 36 capas y anchura 384 frente al experto de acción histórico de 28 capas para aislar el efecto del cambio arquitectónico.
- Base para *fine-tuning* específico de tarea: al estar solo entrenado el *readout* y mantener el VLM congelado, se puede reentrenar el *readout* sobre datos propios de un robot concreto sin tocar los 4B parámetros del VLM.
- Evaluación comparativa de inicializaciones: el checkpoint referencia una inicialización concreta (`newtask33-lap-v4-j14-h32-source30k`), lo que permite comparar el efecto de distintas inicializaciones sobre el mismo protocolo de 10.000 pasos.
- Docencia y divulgación: como ejemplo documentado de entrenamiento de *readouts* de acción con VLM congelados y de buenas prácticas de procedencia en artefactos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha realizado evaluación en bucle cerrado (*closed-loop*) para este checkpoint y que la pérdida de entrenamiento (0,022330142557621002) no constituye una tasa de éxito de control.

## Requisitos de hardware

- El repositorio ocupa 9,9 GB e incluye el VLM congelado de 4B y el *readout* de ~112M parámetros en un único `model.pt`; la inferencia requiere cargar el state dict completo con el *loader* `QwenPIRepresentationV4` y `readout_architecture=layerwise_dit`.
- VRAM estimada: no disponible de forma oficial; por el tamaño del state dict (9,9 GB en BF16) se necesita al menos ese orden de magnitud, más memoria para activaciones y el *chunk* de acción.
- GPU recomendadas: no disponibles en la documentación; el entrenamiento se realizó en 8 GPUs Hygon, lo que sugiere GPUs de centro de datos con soporte BF16.
- Compatibilidad con GPU de consumo: no confirmada; no se documenta.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el autor indica que debe usarse el código de entrenamiento `action_repre` incluido y el *loader* `QwenPIRepresentationV4`, con la configuración, el procesador y la normalización publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`action-repre-newtask14-n32-lap-layerwise384-l36-head10k`) | ~112M en *readout* + VLM 4B congelado | no disponible (horizonte 32) | sin evaluación en bucle cerrado | Apache 2.0 | Hugging Face, 0 descargas |
| `myendless/action-repre-newtask33-lap-v4-j14-h32-source30k` (inicialización referenciada) | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciado) |
| Experto de acción histórico de 28 capas de Qwen3 (mencionado por el autor) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de las alternativas para una comparación cuantitativa.

## Limitaciones y advertencias

- No se ha realizado evaluación en bucle cerrado; no hay evidencia de tasa de éxito en control real.
- La pérdida de entrenamiento (0,0223) no debe interpretarse como rendimiento de política.
- El archivo `model.pt` es un state dict completo que incluye el VLM congelado; no es un *action head* aislado y no se puede cargar con `AutoModel.from_pretrained`.
- Las rutas específicas de máquina en los metadatos conservados deben mapearse explícitamente antes de reutilizar el checkpoint.
- No se incluyen episodios de robot en bruto, activos de simulador, estado del optimizador ni checkpoints intermedios, lo que limita la reproducibilidad completa del entrenamiento.
- La clasificación de origen original permanece como `unregistered_historical`, lo que introduce incertidumbre sobre la procedencia exacta de los datos del VLM inicial.
- Los proyectores en posiciones impares del DiT están asignados pero sin uso, lo que puede confundir auditorías de parámetros.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación en el sentido de modelos de lenguaje; el riesgo principal es de sobreajuste a las 14 tareas reservadas y de fallo silencioso en entornos físicos distintos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación en bucle cerrado desaconseja cualquier despliegue en producción sin validación propia.
- Repositorio con 0 descargas y 0 *likes*: no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/myendless/action-repre-newtask14-n32-lap-layerwise384-l36-head10k-3b0277e9
- Inicialización referenciada: https://huggingface.co/myendless/action-repre-newtask33-lap-v4-j14-h32-source30k-e7eee04f (revisión `a626e1ad2f984cdfae868ffd20ae0f68f95b7b1e`)
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados a este checkpoint.

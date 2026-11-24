# goodfellovv/so101-diamond-2

## Resumen

SO-101 Diamond 2 es una política robótica visual entrenada con LeRobot bajo la arquitectura ACT (Action Chunking with Transformers) para ejecutar una tarea de manipulación concreta: ensamblar cuatro cubos en un cuadrado compacto de 2×2, con cada cubo orientado de forma que su cara azul quede hacia arriba, de modo que los cuatro triángulos amarillos formen un rombo en el centro. El modelo lo publica el usuario goodfellovv en Hugging Face y está diseñado para el robot SO-101 en el simulador MuJoCo, no para un entorno físico real.

El modelo recibe imágenes RGB de dos cámaras (una cenital y otra inclinada) junto con las posiciones articulares del robot, y emite comandos de movimiento que un controlador ejecuta aplicando restricciones cinemáticas. Con 16.365.574 parámetros, es un modelo compacto orientado a control, no un modelo de lenguaje: su pipeline es `robotics` y su librería es `lerobot`. La relevancia actual reside en que documenta de forma transparente un resultado medido y reproducible (100 ensamblajes estrictos de 240 intentos, 41,67%) con intervalos de confianza y artefactos de evaluación auditables, algo poco habitual en políticas robóticas de investigación.

La ficha describe un artefacto de investigación con una única tarea, sin licencia declarada y con métricas publicadas en simulación. No debe confundirse con un modelo generativo de propósito general: no procesa lenguaje natural ni genera texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política visomotora |
| Parametros totales | 16.365.574 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la política, no documentada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Entorno de evaluacion | MuJoCo |
| Robot objetivo | SO-101 |
| Entradas | RGB de camara cenital + RGB de camara inclinada + posiciones articulares |
| Salidas | Comandos de movimiento (action chunks) |
| Tamano del repositorio | 20,0 GB |
| Dataset asociado | goodfellovv/so101-diamond-2 (corpus combinado de 879 episodios) |

## Arquitectura y entrenamiento

La política emplea ACT, un transformer que mapea observaciones multimodales (dos vistas RGB y el estado articular) a secuencias de acciones de bajo nivel, prediciendo bloques de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza el control. Un controlador externo ejecuta las acciones predichas y aplica restricciones de movimiento, de modo que el modelo no controla directamente los actuadores sin supervisión cinemática.

El entrenamiento se realizó sobre el dataset `goodfellovv/so101-diamond-2`, que según la model card ha crecido hasta un corpus combinado de 879 episodios. No se documentan en la información disponible el número exacto de tokens o muestras usadas en el entrenamiento final, la composición detallada del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en el sentido habitual a una política robótica, pero no confirmados). Tampoco se especifican hiperparámetros, aumentos de datos ni detalles del proceso de recolección de demostraciones. La model card incluye gráficas de evolución de la pérdida de entrenamiento y del crecimiento del dataset, así como informes de evaluación independiente, lo que permite auditar parcialmente el proceso.

## Capacidades

- Manipulación robótica visomotora: ensamblaje de cuatro cubos en una configuración 2×2 con restricción de orientación (cara azul hacia arriba).
- Percepción multimodal: fusión de dos vistas RGB (cenital e inclinada) con el estado de las articulaciones.
- Predicción de acciones en bloques (action chunking), adecuada para control continuo de un brazo robótico.
- Ejecución en simulación MuJoCo con un controlador que impone restricciones de movimiento.
- Tarea única y especializada: no es un modelo de propósito general ni soporta instrucciones en lenguaje natural.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión general ni audio.
- Capacidades multilingües: no disponibles (no procesa texto).

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como referencia reproducible de una política ACT con métricas auditables (100/240 ensamblajes estrictos, IC 95% de Wilson 35,61–47,99%) para comparar variantes de arquitectura o de recolección de datos.
- Benchmark de manipulación en simulación: el escenario de ensamblaje 2×2 con restricción de orientación puede usarse como tarea de evaluación estandarizada en MuJoCo para políticas visomotoras.
- Estudio de robustez ante variaciones de cámara: al depender de dos vistas RGB, permite analizar cómo afecta la posición o la calidad de las cámaras al éxito de la política.
- Reproducción de experimentos: los artefactos publicados (paquete de modelo, RELEASE.json con condiciones y suma de verificación, informe de evaluación independiente) permiten replicar la evaluación en un entorno controlado.
- Desarrollo de pipelines de evaluación con LeRobot: integración del modelo en flujos de entrenamiento y validación de políticas robóticas usando la librería LeRobot.
- Docencia y divulgación: ejemplo didáctico de una política ACT completa, con dataset, pesos y métricas, para explicar el ciclo observación-acción en robótica de manipulación.
- Línea base para comparativas: punto de partida cuantificado (41,67% de éxito estricto) frente al que medir mejoras en datos, arquitectura o controlador.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a la tarea propia del modelo en MuJoCo, no a benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K, etc., no aplicables).

| Metrica | Resultado |
|---|---|
| Ensamblajes estrictos | 100 de 240 (41,67%) |
| Intervalo de confianza 95% (Wilson) | 35,61–47,99% |
| Criterio de exito | 4 cubos dentro de tolerancias durante 15 pasos consecutivos |
| Objetivo declarado | 95% (no alcanzado) |
| Entorno | MuJoCo |
| Verificacion de factibilidad fisica | Confirmada por experto de simulacion para todas las configuraciones de control |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 16,36 M de parámetros, los pesos en precisión completa ocupan del orden de decenas de MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060 o superior es suficiente para inferencia. Para entrenamiento o evaluación con MuJoCo, se recomienda una GPU con al menos 8 GB de VRAM.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el reducido número de parámetros.
- Opciones de despliegue: LeRobot (librería nativa) y MuJoCo para el entorno de simulación. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO-101 Diamond 2 | 16,36 M | no disponible | Ensamblaje 2×2 en MuJoCo | no disponible | Hugging Face (1 descarga) |
| Políticas ACT genéricas de LeRobot | variable | no disponible | Manipulación diversa | según repositorio | Hugging Face / GitHub |
| Políticas Diffusion Policy | variable | no disponible | Manipulación visomotora | según repositorio | Hugging Face / GitHub |
| Modelos VLA (p. ej. OpenVLA) | miles de millones | varios miles de tokens | Instrucciones en lenguaje + manipulación | según modelo | Hugging Face |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas cruzadas en la misma tarea y entorno para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Tarea única: el modelo solo realiza el ensamblaje de cuatro cubos; no generaliza a otras tareas ni acepta instrucciones.
- Rendimiento por debajo del objetivo: 41,67% de éxito estricto frente al 95% declarado como meta; no es adecuado para producción sin mejoras sustanciales.
- Solo simulación: los resultados se miden en MuJoCo; no hay evidencia de transferencia a un robot SO-101 físico.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; se debe contactar con el autor antes de cualquier uso productivo.
- Idiomas: no aplica, pero implica que no hay soporte de interacción en lenguaje natural.
- Sesgos: no documentados; al entrenarse con un dataset propio de 879 episodios, puede heredar sesgos de las demostraciones (posiciones iniciales, iluminación, distribución de cámaras).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- Repositorio grande (20 GB) y muy pocas descargas (1), lo que sugiere escasa validación externa.
- Fecha de creación futura (2026-11-21) en los metadatos, lo que conviene verificar antes de confiar en el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodfellovv/so101-diamond-2
- Dataset asociado: https://huggingface.co/datasets/goodfellovv/so101-diamond-2
- Paquete verificado del modelo: https://huggingface.co/goodfellovv/so101-diamond-2/resolve/e73c99d46bb319cf9b0382477d40495264e010a5/exports/runpod-act-20261122/relay/so101-diamond-2-incumbent-100-of-240/so101-diamond-2-incumbent-100-of-240.tar
- Condiciones de verificación y suma de control: https://huggingface.co/goodfellovv/so101-diamond-2/resolve/e73c99d46bb319cf9b0382477d40495264e010a5/exports/runpod-act-20261122/source-export/RELEASE.json
- Evaluación independiente: https://huggingface.co/datasets/goodfellovv/so101-diamond-2/resolve/fc5f33831670523800290e4a04b4cb44342c2549/reports/independent-test.json
- Dinámica de train loss y ensamblajes: https://huggingface.co/datasets/goodfellovv/so101-diamond-2/resolve/fc5f33831670523800290e4a04b4cb44342c2549/reports/train-loss-current-experiments.png
- Crecimiento del dataset: https://huggingface.co/datasets/goodfellovv/so101-diamond-2/resolve/fc5f33831670523800290e4a04b4cb44342c2549/reports/dataset-growth.png
- Corpus combinado de 879 episodios: https://huggingface.co/datasets/goodfellovv/so101-diamond-2/tree/0429a3c2117e0d5f47c8b367f43f1fff99a1c8f5/corpora/pooled-879
- LeRobot (librería): https://github.com/huggingface/lerobot
- MuJoCo: https://mujoco.org

# goodfellovv/so101-diamond-act

## Resumen

SO-101 diamond ACT es una política de control robótico experimental publicada por el usuario goodfellovv en Hugging Face. Se trata de un modelo ACT (Action Chunking Transformer) entrenado con la librería LeRobot 0.6.1 para una tarea concreta: colocar cuatro cubos de 40 mm formando un cuadrado azul con un rombo amarillo en su interior, empleando el brazo robótico SO-101. El modelo consume el estado articular (6 dimensiones) y dos cámaras RGB (frontal y de muñeca, a 240x320) y produce una acción de 6 dimensiones a 15 Hz.

El artefacto es deliberadamente conservador en sus afirmaciones: el propio autor indica que no establece que el robot resuelva la tarea de forma fiable y que el comportamiento fuera de los rollouts medidos en simulador, así como la transferencia a hardware real, permanecen sin verificar. La evidencia estricta de éxito en simulador es de 0/8 arranques inicialmente no resueltos, con un informe marcado como completo.

Por su naturaleza, no es un modelo de lenguaje ni un modelo fundacional de propósito general: es un checkpoint de política para imitación (behavior cloning) sobre un robot de bajo coste, útil como referencia para quienes trabajan con LeRobot, ACT y el ecosistema SO-101, pero no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por el chunk de acciones de ACT, no documentada) |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,2 GB, artefactos LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación robótica que predice un chunk de acciones futuras a partir de observaciones multimodales. En este caso las entradas son `observation.state` (6 dimensiones), una imagen RGB frontal y una imagen RGB de muñeca, ambas de 3x240x320; la salida es `action` (6 dimensiones). Las observaciones y acciones se registraron a 15 Hz. No se proporcionan coordenadas de los cubos ni código de objetivo de color como entrada: el modelo debe inferir la tarea a partir de las imágenes.

El entrenamiento usó el dataset `goodfellovv/so101-diamond-110` (revisión fijada `fdb96a47c2ba696cad73b01eae055e68bad6a4a9`), con un total de 90.000 actualizaciones del optimizador. El split es por episodio completo: 86 episodios de entrenamiento y 24 de validación, con las 12 estratos representados; `split.json` registra los episodios exactos. La normalización de estado y acción se calcula solo con episodios de entrenamiento. Se conservan 18 mediciones de pérdida de validación en `training_summary.json`, muestreando 85 fotogramas equiespaciados por episodio retenido. El autor advierte explícitamente que la pérdida no equivale a éxito en la tarea. Se publican además `train_config.json` (con hiperparámetros y rutas relativas, reanudación deshabilitada) y los pipelines de pre/postprocesado guardados, cuyas estadísticas de normalización son obligatorias para la inferencia.

## Capacidades

- Generación de acciones de control (6 dimensiones) a partir de estado articular e imágenes RGB frontal y de muñeca.
- Predicción por chunks de acciones propia de ACT, orientada a manipulación robótica de precisión.
- Percepción visual integrada mediante dos cámaras a 240x320, sin codificación explícita de la posición de los objetos.
- Ejecución de una tarea única y específica: formación de un cuadrado azul con rombo amarillo a partir de cuatro cubos de 40 mm.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo de razonamiento (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Referencia para entrenamiento de políticas ACT con LeRobot: sirve como ejemplo reproducible de pipeline completo (dataset, split por episodios, normalización, configuración de entrenamiento) para quienes construyen sus propias políticas sobre SO-101.
- Evaluación de imitación en simulación MuJoCo 3.17.0: permite reproducir los rollouts y comparar métricas de éxito con los criterios del autor (caras azules hacia arriba, orientación correcta de la esquina amarilla, geometría cuadrada y 15 fotogramas consecutivos correctos).
- Estudio de transferencia sim-a-real: el checkpoint es un punto de partida para analizar qué falla al llevar una política entrenada en simulador a hardware SO-101, dado que el autor no reclama éxito en el mundo real.
- Docencia e investigación en behavior cloning: útil para ilustrar limitaciones de la pérdida de validación como proxy de éxito y la importancia de splits por episodio y estratificación.
- Benchmark interno de manipulación de precisión: la tarea de alineación de cubos de 40 mm con restricciones geométricas y de orientación es un test exigente para comparar variantes de ACT.
- Base para fine-tuning con datos propios: al publicarse configuración, procesadores y estadísticas de normalización, puede adaptarse a tareas de ensamblaje similares con el mismo robot y cámaras.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Rollout estricto en simulador (arranques inicialmente no resueltos) | 0/8 (informe completo) |
| Mediciones de pérdida de validación retenidas | 18 (ver `training_summary.json`) |
| Actualizaciones del optimizador | 90.000 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors, el peso de los pesos es de aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) e incluso en CPU para evaluación puntual.
- GPU recomendadas: no especificadas por el autor; para entrenamiento o evaluación a 15 Hz se recomienda una GPU dedicada (RTX 4090, A100, H100) por comodidad, aunque el tamaño del modelo no lo exige.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; el cuello de botella real es el renderizado del simulador y el procesado de imágenes, no el modelo.
- Opciones de despliegue: LeRobot 0.6.1 con `ACTPolicy.from_pretrained` y los pipelines de pre/postprocesado guardados; simulación con MuJoCo 3.17.0 para resultados comparables. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles; la frecuencia de operación registrada es de 15 Hz para observaciones y acciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO-101 diamond ACT (este) | 51,7 M | no disponible | 0/8 en rollouts estrictos de simulador | no disponible | Hugging Face, repo 0,2 GB |
| Otras políticas ACT para SO-101 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Políticas de imitación tipo Diffusion Policy | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos comparables con métricas verificables; la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- El autor declara explícitamente que el artefacto no demuestra que el robot resuelva la tarea de forma fiable y que el comportamiento fuera de los rollouts medidos y la transferencia a hardware no están verificados.
- Evidencia estricta de éxito en simulador de 0/8 sobre arranques inicialmente no resueltos; muestras pequeñas e informes incompletos se consideran no concluyentes.
- La pérdida de validación no es un indicador de éxito en la tarea; no debe usarse como métrica de producción.
- Tarea única y muy específica: no generaliza a otras manipulaciones sin reentrenamiento o fine-tuning.
- Sin coordenadas de objetos ni código de objetivo de color como entrada; depende por completo de la percepción visual de las cámaras.
- Licencia no disponible: no puede asumirse uso comercial sin aclaración del autor.
- No se reclama seguridad en hardware real; cualquier despliegue físico requiere validación propia.
- Requiere usar ambos procesadores guardados (estadísticas de normalización) y MuJoCo 3.17.0 para resultados comparables; otras versiones pueden alterar los resultados.
- Reanudación exacta del entrenamiento deshabilitada en `train_config.json`; el estado del optimizador y del RNG se conserva por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodfellovv/so101-diamond-act
- Dataset: https://huggingface.co/datasets/goodfellovv/so101-diamond-110
- LeRobot (librería): https://github.com/huggingface/lerobot
- MuJoCo: https://mujoco.org/
- No se han encontrado en la información disponible papers, blogs, repos adicionales ni demos específicos de este modelo.

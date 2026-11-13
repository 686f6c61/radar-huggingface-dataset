# mlnha/gr00t-n15-pnp108-rabc_robometer_30k

## Resumen

`mlnha/gr00t-n15-pnp108-rabc_robometer_30k` es un checkpoint de investigación derivado de GR00T N1.5, el modelo fundacional de robótica humanoide desarrollado por NVIDIA. En concreto, se trata de un ajuste fino (fine-tuning) sobre el modelo base GR00T-N1.5 en su variante de preentrenamiento de 80.000 pasos para RoboCasa365, aplicado a la tarea `PickPlaceCounterToCabinet` del simulador RoboCasa. El autor, `mlnha`, publica estos pesos como material reproducible de un estudio sobre estimadores de progreso de tarea (`Robometer-4B`) empleados como señal de entrenamiento ponderada en aprendizaje por imitación (behavior cloning, BC).

El modelo no es un LLM de propósito general ni un modelo de visión-lenguaje-acción comercial, sino un artefacto de investigación en robótica: un policy model que mapea observaciones (imágenes y estado del robot) a acciones de control de un brazo manipulador en un entorno simulado. Su relevancia es acotada: sirve como referencia para quienes investigan recompensas aprendidas en BC, ponderación por progreso (RA-BC) y evaluación en RoboCasa365, no como modelo listo para producción.

El repositorio ocupa 37,9 GB y contiene pesos en `safetensors`, logs de entrenamiento y eventos de TensorBoard. No hay descargas ni interacciones registradas, y la model card advierte de que el checkpoint de 30.000 pasos se perdió por falta de espacio en disco, de modo que solo se conservan los intermedios (5k, 10k, 15k, 20k, 25k).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.5 (modelo fundacional de robótica de NVIDIA; arquitectura exacta no detallada en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin indicacion de variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `gr00t`; logs en TensorBoard) |
| Tamano del repositorio | 37,9 GB |
| Tarea | PickPlaceCounterToCabinet (RoboCasa365) |
| Embodiment | `new_embodiment` |
| Pasos de entrenamiento | 30.000 (checkpoint final perdido; se conservan 5k, 10k, 15k, 20k, 25k) |
| Hardware de entrenamiento | 1 GPU, batch 64 |
| Optimizador | LR 3e-5 coseno, warmup 0.05, seed 42 |

## Arquitectura y entrenamiento

El modelo parte de GR00T-N1.5 en su checkpoint de preentrenamiento de 80.000 pasos para RoboCasa (`robocasa/robocasa365_checkpoints`) y se ajusta con behavior cloning ponderado por RA-BC, usando `Robometer-4B` como estimador de progreso de tarea. El entrenamiento se realizó durante 30.000 pasos con batch de 64, learning rate 3e-5 con decaimiento coseno y warmup del 5 %, semilla 42, sobre una única GPU. El embodiment se declara como `new_embodiment`, lo que indica que el modelo se adapta a una morfología distinta de la del preentrenamiento.

Los datos de entrenamiento son 108 rollouts del checkpoint 120.000 de GR00T sobre la tarea `PickPlaceCounterToCabinet` en RoboCasa, de los cuales 72 son exitosos. Los datos están en formato LeRobot v2.1. La innovación metodológica del estudio no está en la arquitectura (que hereda de GR00T N1.5) sino en la señal de entrenamiento: la ponderación por progreso estimado por un modelo auxiliar (`Robometer-4B`) en lugar de usar únicamente el éxito binario de la trayectoria. La model card no detalla la composición del dataset de preentrenamiento original ni si hubo etapas de RLHF o DPO, algo poco habitual en modelos de robótica.

## Capacidades

- Control de manipulación robótica: genera acciones para la tarea `PickPlaceCounterToCabinet` (coger un objeto de la encimera y colocarlo en el armario) en el simulador RoboCasa365.
- Aprendizaje por imitación: política entrenada por behavior cloning sobre rollouts de un modelo previo.
- Ponderación por progreso de tarea: integra la señal de `Robometer-4B` como peso de entrenamiento, lo que permite discriminar trayectorias parcialmente exitosas.
- Adaptación a nuevo embodiment: declarado como `new_embodiment`, pensado para transferir a una morfología distinta de la del preentrenamiento.
- Evaluación reproducible: incluye logs de entrenamiento (`train.log`) y eventos de TensorBoard (`runs/`) para auditar la curva de aprendizaje.
- No dispone de capacidades de lenguaje, visión general, tool calling, agentes multi-paso ni razonamiento simbólico; es un policy model específico de tarea.

## Casos de uso

- Reproducción de experimentos de RA-BC: el checkpoint permite comparar la ponderación por progreso (`Robometer-4B`) frente a behavior cloning estándar en la misma tarea y semilla, usando los checkpoints intermedios conservados.
- Estudio de estimadores de progreso: investigadores que evalúen la calidad de `Robometer-4B` pueden usar estos pesos como referencia de política entrenada con esa señal y medir la tasa de éxito en RoboCasa365.
- Benchmark de manipulación en simulación: sirve como línea base para nuevas políticas en `PickPlaceCounterToCabinet` con escenas semilla 2000+ y política semilla 1, siguiendo el protocolo de evaluación documentado.
- Análisis de curvas de entrenamiento: los logs de TensorBoard y `train.log` permiten estudiar la dinámica de convergencia con 108 rollouts y batch 64 en una sola GPU.
- Transferencia a nuevo embodiment: el ajuste con `new_embodiment` puede servir de punto de partida para adaptar GR00T N1.5 a morfologías distintas en RoboCasa.
- Docencia y divulgación: ejemplo concreto de fine-tuning de un modelo fundacional de robótica con datos escasos y señal de recompensa aprendida, útil en cursos de aprendizaje por refuerzo e imitación.

## Benchmarks y rendimiento

Resultados de éxito en simulación RoboCasa365 reportados en la model card (escenas semilla 2000+, política semilla 1, éxito = tarea completada al final del episodio):

| Checkpoint | Semillas 2000–2049 | Total 100 episodios |
|---|---|---|
| checkpoint-5000 | no reportado | no reportado |
| checkpoint-10000 | 31/50 (62 %) | 61/100 (61 %) |
| checkpoint-15000 | no reportado | no reportado |
| checkpoint-20000 | 27/50 (54 %) | 54/100 (54 %) |
| checkpoint-25000 | no reportado | no reportado |
| checkpoint-30000 | perdido (disco lleno) | perdido |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el repositorio pesa 37,9 GB en safetensors, lo que da una cota inferior del orden de decenas de GB para cargar los pesos en precisión nativa.
- GPU de entrenamiento: una sola GPU con batch 64 según la model card; no se especifica el modelo exacto.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, se requiere una GPU de datacenter (A100/H100) o varias consumer de gama alta para inferencia en precisión completa; no hay confirmación.
- ¿Cabe en GPU consumer?: no confirmado; con 37,9 GB de pesos, una RTX 4090 (24 GB) no podría cargar el repositorio completo sin cuantización, y no se documentan variantes cuantizadas.
- Despliegue: la librería indicada es `gr00t`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un policy model de robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mlnha/gr00t-n15-pnp108-rabc_robometer_30k` | GR00T N1.5 (RoboCasa 80k) | PickPlaceCounterToCabinet | no disponible | no disponible | Hugging Face, 0 descargas |
| GR00T N1.5 (NVIDIA) | Modelo fundacional de robótica | Manipulación general | no disponible en esta ficha | no disponible en esta ficha | Pesos publicados por NVIDIA |
| Políticas BC sobre RoboCasa365 | Varias | Manipulación en RoboCasa | no disponible | variable | Repositorios de investigación |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada; la comparación se limita a la base y la tarea.

## Limitaciones y advertencias

- Checkpoint de investigación: no es un modelo listo para producción; la model card lo describe explícitamente como material reproducible de un estudio.
- Checkpoint final perdido: el de 30.000 pasos no está incluido por falta de espacio en disco, por lo que no se puede evaluar el resultado del entrenamiento completo.
- Datos de entrenamiento muy limitados: solo 108 rollouts (72 exitosos) de una única tarea, lo que limita la generalización fuera de `PickPlaceCounterToCabinet`.
- Evaluación solo en simulación: los resultados (61/100 y 54/100) proceden de RoboCasa365 sim, sin validación en robot físico.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor o consultar la licencia del modelo base GR00T N1.5 de NVIDIA.
- Idiomas no aplicables: es un policy model, no un modelo de lenguaje; no procesa texto libre.
- Sin datos de sesgos, alucinación o robustez fuera de distribución; no se documentan análisis de fallos ni de sensibilidad a la iluminación, texturas o posiciones iniciales.
- Repositorio sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- Los estados del optimizador no están incluidos, lo que impide reanudar el entrenamiento exactamente desde los checkpoints publicados.

## Enlaces

- Hugging Face: https://huggingface.co/mlnha/gr00t-n15-pnp108-rabc_robometer_30k
- Modelo base GR00T N1.5 (NVIDIA): no disponible en la información proporcionada
- Repositorio GR00T: no disponible en la información proporcionada
- RoboCasa365: no disponible en la información proporcionada
- Paper o blog del método RA-BC / Robometer: no disponible en la información proporcionada

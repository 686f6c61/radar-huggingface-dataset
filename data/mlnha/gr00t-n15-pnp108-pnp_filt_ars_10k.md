# mlnha/gr00t-n15-pnp108-pnp_filt_ars_10k

## Resumen

`mlnha/gr00t-n15-pnp108-pnp_filt_ars_10k` es un checkpoint de investigación derivado de GR00T N1.5, el modelo fundacional de robótica humanoide desarrollado por NVIDIA. En concreto, se trata de un ajuste fino (fine-tuning) sobre la tarea PickPlaceCounterToCabinet del benchmark RoboCasa365, orientado a imitación de comportamiento (behavior cloning) en manipulación robótica. El autor, `mlnha`, lo publica como material reproducible de un estudio sobre estimadores de progreso de tarea como señal de entrenamiento para BC.

El modelo parte del checkpoint de preentrenamiento `robocasa/robocasa365_checkpoints` (paso 80.000) y se entrena sobre un conjunto de 108 rollouts generados por un checkpoint GR00T anterior (paso 120.000), de los cuales 72 son episodios exitosos. El filtrado de segmentos se realiza con un estimador de progreso basado en ARS y un modelo Qwen3.6-27B, seleccionando únicamente fragmentos de 16 frames con delta de progreso positivo.

Se trata de un artefacto de investigación, no de un modelo de propósito general: 37,9 GB de pesos en formato safetensors, librería `gr00t`, y evaluación exclusivamente en simulación (RoboCasa365). Su interés radica en documentar una metodología concreta de filtrado de datos para políticas de imitación en robótica, con resultados de éxito medibles por checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.5 (modelo fundacional de robótica de NVIDIA; detalles internos de la arquitectura no disponibles en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | gr00t |
| Tamano del repositorio | 37,9 GB |
| Tarea | PickPlaceCounterToCabinet (RoboCasa365) |
| Embodiment | `new_embodiment` |
| Formato de datos de entrenamiento | LeRobot v2.1 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de GR00T N1.5, el modelo fundacional de robótica de NVIDIA orientado a control de robots humanoides y manipulación. La información proporcionada no detalla la arquitectura interna (número de parámetros, tipo de transformer, mecanismos de atención o integración multimodal visión-lenguaje-acción), por lo que estos datos deben consultarse en la documentación oficial de GR00T N1.5.

El entrenamiento parte del checkpoint de preentrenamiento de RoboCasa365 en el paso 80.000. Los datos (`pnp108`) consisten en 108 rollouts generados por un checkpoint GR00T en el paso 120.000 sobre la tarea PickPlaceCounterToCabinet, de los cuales 72 son exitosos. La innovación metodológica es el filtrado por progreso: se aplica un estimador de progreso basado en ARS con Qwen3.6-27B y se conservan únicamente segmentos de 16 frames cuyo delta de progreso sea positivo. Sobre esos segmentos se aplica behavior cloning plano, con 1 GPU, batch de 64, learning rate 3e-5 con schedule coseno (warmup 0.05) y semilla 42. No se incluyen estados del optimizador en el repositorio.

## Capacidades

- Control de política robótica para la tarea PickPlaceCounterToCabinet en el simulador RoboCasa365.
- Imitación de comportamiento (behavior cloning) sobre demostraciones filtradas por progreso de tarea.
- Ejecución de episodios completos en simulación con evaluación de éxito al final del episodio.
- Soporte del embodiment `new_embodiment` definido en el pipeline de entrenamiento.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo; el modelo está especializado en robótica.

## Casos de uso

- Reproducción de experimentos de filtrado de datos: el checkpoint permite replicar el pipeline de selección de segmentos por delta de progreso ARS y comparar curvas de éxito en simulación frente a entrenamiento sin filtrado.
- Investigación en behavior cloning para manipulación: sirve como línea base para estudiar cómo afecta la calidad y el filtrado de demostraciones al éxito de una política de imitación en tareas de pick-and-place.
- Evaluación comparativa de checkpoints intermedios: los cinco checkpoints publicados (pasos 2.000 a 10.000) permiten analizar la evolución del éxito en simulación y detectar sobreajuste o mesetas de rendimiento.
- Desarrollo de estimadores de progreso de tarea: el modelo y sus logs (`train.log`, `runs/`) sirven como referencia para validar estimadores alternativos de progreso en robótica.
- Benchmarking de políticas en RoboCasa365: puede integrarse en pipelines de evaluación con semillas de escena fijas (2000+) y semilla de política 1 para comparar contra otras políticas entrenadas en la misma tarea.
- Estudio de transferencia entre checkpoints: al partir de un preentrenamiento concreto (paso 80.000) y datos generados por otro (paso 120.000), permite analizar dinámicas de ajuste fino sobre políticas preentrenadas.

## Benchmarks y rendimiento

Resultados de éxito en simulación RoboCasa365 (escenas con semilla 2000+, semilla de política 1, éxito medido al final del episodio):

| Checkpoint | Éxito en simulación |
|---|---|
| checkpoint-2000 | 25/50 (semillas 2000–2049) |
| checkpoint-4000 | 28/50 (semillas 2000–2049) |
| checkpoint-6000 | 28/50 (semillas 2000–2049) |
| checkpoint-8000 | 23/50 (semillas 2000–2049) |
| checkpoint-10000 | 29/50 (semillas 2000–2049) |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones con otras políticas en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 37,9 GB en safetensors, lo que da una referencia del orden de magnitud de los pesos.
- GPU recomendadas: no disponible; el entrenamiento se realizó en 1 GPU sin especificar modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería declarada es `gr00t`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (orientados a modelos de lenguaje, no a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlnha/gr00t-n15-pnp108-pnp_filt_ars_10k | Fine-tune de GR00T N1.5 | PickPlaceCounterToCabinet (RoboCasa365) | no disponible | no disponible | Hugging Face |
| GR00T N1.5 (base, NVIDIA) | Modelo fundacional de robótica | Manipulación general | no disponible | no disponible en esta ficha | Documentación de NVIDIA |
| Otras políticas RoboCasa365 | Políticas de imitación | Tareas RoboCasa365 | no disponible | variable | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para despliegue en producción ni para uso fuera de la tarea PickPlaceCounterToCabinet en RoboCasa365.
- Evaluación exclusivamente en simulación: no hay evidencia de transferencia a robots físicos ni a escenas reales.
- Éxito moderado: el mejor checkpoint alcanza 29/50 (58 %) en las semillas evaluadas, lo que limita su uso como política fiable.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles: el modelo no declara capacidades lingüísticas; cualquier uso que requiera comprensión de lenguaje natural debe validarse por separado.
- Sin estados del optimizador: el repositorio no permite reanudar el entrenamiento desde el punto exacto.
- Riesgo de sobreajuste a las semillas y condiciones de simulación empleadas; los resultados con semillas 2000–2049 no garantizan generalización a otras configuraciones.
- Sesgos y alucinaciones: no se documentan sesgos específicos, pero al ser una política entrenada sobre 108 rollouts de un único checkpoint, puede heredar los modos de fallo de esa política generadora.

## Enlaces

- Hugging Face: https://huggingface.co/mlnha/gr00t-n15-pnp108-pnp_filt_ars_10k
- GR00T N1.5 (NVIDIA): no disponible en la información proporcionada
- RoboCasa365: no disponible en la información proporcionada
- Paper o blog del método: no disponible en la información proporcionada

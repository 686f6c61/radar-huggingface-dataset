# mlnha/gr00t-n15-wl108-rabc_ours_30k

## Resumen

`mlnha/gr00t-n15-wl108-rabc_ours_30k` es un checkpoint de investigacion derivado de GR00T N1.5, el modelo fundacional de NVIDIA para robotica humanoide y manipulacion. El autor, `mlnha`, lo ha ajustado mediante clonacion de comportamiento (behavior cloning) sobre rollouts generados en el simulador RoboCasa365, concretamente en la tarea WashLettuce (lavar lechuga). No se trata de un modelo generalista publicado para uso amplio, sino de un artefacto experimental dentro de un estudio sobre estimadores de progreso de tarea como senal de entrenamiento.

El metodo aplicado es RA-BC (ARM) ponderado por un estimador de progreso propio del autor, entrenado durante 30 000 pasos sobre 108 rollouts del checkpoint GR00T-120000, de los cuales solo 34 tuvieron exito. El checkpoint parte del preentrenamiento RoboCasa GR00T-N1.5 (`pretraining-80000`) y utiliza el embodiment `new_embodiment`. El repositorio ocupa 37,9 GB e incluye pesos en safetensors, logs de entrenamiento y eventos de TensorBoard, pero no estados del optimizador.

Su relevancia es acotada: sirve como referencia reproducible para investigadores que trabajen en aprendizaje por imitacion con datos escasos y ruidosos en entornos simulados de robotica, y como evidencia empirica de que la ponderacion por progreso mejora ligeramente la tasa de exito frente a alternativas del mismo estudio. No hay informacion publica sobre licencia, idiomas ni uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GR00T N1.5; detalles arquitectonicos no especificados en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robotica, no a texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | gr00t |
| Tamano del repositorio | 37,9 GB |
| Tarea | robotica / behavior cloning (WashLettuce, RoboCasa365) |
| Embodiment | `new_embodiment` |
| Checkpoint base | RoboCasa GR00T-N1.5 `pretraining-80000` |
| Pasos de entrenamiento | 30 000 |
| Batch size | 64 |
| Learning rate | 3e-5, cosine, warmup 0.05 |
| Semilla | 42 |
| Hardware de entrenamiento | 1 GPU |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base GR00T N1.5 de NVIDIA, orientado a control robotico mediante politicas visomotoras. La informacion disponible no detalla la arquitectura interna (tipo de transformer, numero de parametros, mecanismo de atencion ni representacion de acciones), por lo que no es posible describirla con rigor. Lo que si se especifica es el procedimiento de ajuste: clonacion de comportamiento sobre 108 rollouts recolectados en el simulador RoboCasa365 para la tarea WashLettuce, de los cuales 34 fueron exitosos.

El entrenamiento emplea RA-BC (ARM) con ponderacion basada en un estimador de progreso de tarea desarrollado por el autor ("ours progress"), lo que constituye la innovacion metodologica del estudio: usar la estimacion de progreso como senal para reponderar las muestras de comportamiento. Se ejecuto en una sola GPU con batch 64, 30 000 pasos, learning rate 3e-5 con decaimiento coseno y warmup del 5 %, semilla 42. Los datos estan en formato LeRobot v2.1. No se indica el numero de tokens ni composicion de dataset en el sentido de modelos de lenguaje, al no tratarse de un modelo de texto. Tampoco se documentan fases de RLHF o DPO.

## Capacidades

- Control robotico visomotor en simulacion para la tarea WashLettuce dentro de RoboCasa365.
- Clonacion de comportamiento a partir de demostraciones (rollouts) con ponderacion por progreso de tarea.
- Ejecucion de episodios con horizonte de 1650 pasos en el simulador.
- Evaluacion reproducible mediante semillas de escena (2000+) y de politica (1).
- Adaptacion a un embodiment nuevo (`new_embodiment`) partiendo de un preentrenamiento RoboCasa.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, agentes ni multilingueismo.

## Casos de uso

- Investigacion en aprendizaje por imitacion con datos escasos: el checkpoint permite reproducir el experimento de RA-BC ponderado por progreso sobre 108 rollouts y comparar la tasa de exito con variantes del mismo estudio.
- Estudio de estimadores de progreso de tarea: sirve como punto de partida para evaluar como distintas senales de progreso afectan a la politica final en tareas de manipulacion simulada.
- Benchmark interno de politicas roboticas: con 200 episodios por conjunto de semillas, ofrece una referencia cuantitativa (21/200 en semillas 2000-2199) para comparar nuevos metodos sobre el mismo entorno.
- Analisis de sensibilidad a semillas: los resultados dispares entre los conjuntos de semillas 2000-2199 (16/200 en el paso 20k) y 2200-2399 (10/200) permiten estudiar la varianza de evaluacion en RoboCasa365.
- Reproduccion de pipelines GR00T + LeRobot: el uso de datos en formato LeRobot v2.1 y de la libreria `gr00t` facilita integrar el checkpoint en flujos de entrenamiento existentes.
- Docencia y formacion en robotica simulada: como ejemplo completo de fine-tuning de un modelo fundacional robotico con logs de entrenamiento y TensorBoard incluidos.

## Benchmarks y rendimiento

Los unicos datos publicados son las tasas de exito en simulacion RoboCasa365 (split target, horizonte 1650, exito al final del episodio):

| Checkpoint | Exito en simulacion |
|---|---|
| checkpoint-10000 | no disponible |
| checkpoint-15000 | no disponible |
| checkpoint-20000 | 16/200 (semillas 2000-2199); 10/200 (semillas 2200-2399) |
| checkpoint-25000 | no disponible |
| checkpoint-30000 | 21/200 (semillas 2000-2199) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable al tratarse de un modelo de robotica y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 37,9 GB, lo que da una cota inferior aproximada del espacio en disco necesario para los pesos; la VRAM dependera del modelo base GR00T N1.5 y del backend de inferencia, datos no proporcionados.
- GPU recomendadas: no disponible. El entrenamiento se realizo en 1 GPU sin especificar modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la libreria indicada es `gr00t`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente aqui).
- Latencia y throughput: no disponible. La evaluacion usa horizonte de 1650 pasos por episodio en simulador, sin tiempos publicados.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada. Como referencia estructural, el modelo se puede situar frente a otros checkpoints del mismo estudio y frente al checkpoint base:

| Modelo | Base | Metodo | Pasos | Exito sim (semillas 2000-2199) | Licencia |
|---|---|---|---|---|---|
| wl108_rabc_ours_30k (este) | GR00T-N1.5 pretraining-80000 | RA-BC (ARM) ponderado por progreso propio | 30k | 21/200 (checkpoint-30000) | no disponible |
| GR00T-N1.5 pretraining-80000 | — | preentrenamiento RoboCasa | — | no disponible | no disponible |
| Otras variantes del estudio (p. ej. sin ponderacion) | idem | no disponible | no disponible | no disponible | no disponible |

No se conocen modelos comparables de terceros con datos publicos en la informacion disponible.

## Limitaciones y advertencias

- Modelo de investigacion: no es un modelo generalista ni esta pensado para despliegue en produccion.
- Entrenado exclusivamente para la tarea WashLettuce en RoboCasa365; no generaliza a otras tareas sin reentrenamiento.
- Datos de entrenamiento muy limitados (108 rollouts, solo 34 exitosos), lo que aumenta el riesgo de sobreajuste y de baja robustez.
- Tasa de exito baja en terminos absolutos (21/200, aproximadamente 10,5 % en el mejor conjunto de semillas), insuficiente para aplicaciones reales.
- Varianza alta entre conjuntos de semillas (16/200 frente a 10/200 en el paso 20k), lo que exige evaluaciones con muchas semillas para conclusiones fiables.
- Licencia no disponible: no puede asumirse uso comercial; debe consultarse al autor antes de cualquier aplicacion.
- No incluye estados del optimizador, lo que limita la reanudacion exacta del entrenamiento.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma en el sentido habitual, al no ser un modelo de lenguaje; el riesgo analogo es el fallo de politica (acciones incorrectas) en el simulador.
- Sin validacion en hardware real documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlnha/gr00t-n15-wl108-rabc_ours_30k
- Repositorio de checkpoints RoboCasa (referenciado en la model card): `robocasa/robocasa365_checkpoints`
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.

# ru1ch3n/PDE-OBS

## Resumen

PDE-OBS es una campaña de checkpoints de referencia para el aprendizaje automático científico orientado a ecuaciones en derivadas parciales (PDE) con observaciones parciales. No se trata de un modelo generativo de lenguaje, sino de una colección de operadores neuronales entrenados como línea base reproducible para un benchmark de recuperación de soluciones de PDE a partir de observaciones incompletas. Lo publica el usuario ru1ch3n en HuggingFace bajo licencia MIT, con un repositorio de 17,5 GB que contiene los pesos finales de 441 configuraciones acreditadas, además de un conjunto adicional de 663 ejecuciones de la revisión de octubre de 2026.

Cada checkpoint corresponde a una combinación concreta de familia de PDE (por ejemplo, Poisson), método de operador neuronal (por ejemplo, FNO) y patrón de observación de entrenamiento (por ejemplo, muestreo aleatorio del 50 %). La relevancia actual reside en que proporciona una base empírica homogénea y auditable para comparar métodos de operadores neuronales en el régimen de observaciones parciales, un escenario poco cubierto por los benchmarks habituales de PDE. La arquitectura concreta de cada checkpoint queda registrada en su fichero `resolved.yaml` mediante `method.name` y `method.kwargs`, y no se especifica de forma unificada en la model card.

El proyecto incluye un paquete de evaluación (`pdeobs`) con un scorer estricto (`pdeobs-strict-v1`, nueve vistas de 200 identidades retenidas cada una) y un dataset compañero con los registros físicos empleados en entrenamiento y evaluación. Los pesos se distribuyen únicamente como pesos finales, sin estados de optimizador, gradient scaler ni RNG, por lo que sirven para inferencia y reevaluación, pero no para continuar el entrenamiento de forma exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Operadores neuronales; la arquitectura concreta por checkpoint se registra en `resolved.yaml` (`method.name`, `method.kwargs`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; entrada definida por el benchmark de observaciones parciales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`); checkpoints de campaña con `model_state`, `config`, `history`, `epoch` y `scheduler_state`; revisión de octubre con formato `pdeobs-october2026-weights/1` |

## Arquitectura y entrenamiento

La campaña agrupa modelos de operadores neuronales entrenados uno por cada combinación de familia de PDE, método y patrón de observación de entrenamiento. La arquitectura efectiva de cada checkpoint no es única: se resuelve a partir de `method.name` y `method.kwargs` en el `resolved.yaml` adjunto, y el cargador de la campaña reconstruye la estructura usando el preset `paper` del método correspondiente, contrastándolo con la configuración de entrenamiento almacenada en el propio checkpoint. Los checkpoints publicados son los finales registrados de cada intento, no los seleccionados por error de validación o test.

El entrenamiento se organiza en cohortes no intercambiables: el protocolo original de 500 épocas, una continuación recuperada del mismo, un presupuesto declarado de 200 épocas, un protocolo con paciencia máxima de 200 épocas y un intento interrumpido rescatado. Cualquier tabla que agregue cohortes debe declararlo por fila. La revisión de octubre de 2026 añade 663 ejecuciones con vistas de test puntuadas, distribuidas en las cohortes P4, P5, P6, P7, V4C, V4D, V4E, V4P6, V4P7, N3GJ2, N5MXR6, N6, N8, RPB, RPBn y E6; las 12 ejecuciones E6 son copias de relleno por vecino más cercano de ejecuciones FNO con relleno a cero, añadidas el 21 de octubre de 2026 como tercera parte de la subida. No se detallan en la información disponible el número de tokens ni la composición del dataset más allá de las vistas V2 del dataset compañero.

Una innovación destacable es el proceso de desidentificación de metadatos: todas las cadenas que nombraban rutas de sistema de ficheros, cuentas, nodos, hosts, jobs del planificador, particiones, identificadores de GPU, intérpretes, entornos, directorios de ejecución o revisiones de código fueron reescritas a marcadores como `<ROOT_A>`, `<USER>`, `<NODE>`, `<JOB>`, `<PYTHON>`, `<ENV>`, `<RUN>` o `<COMMIT-1>`, y los registros del planificador se redujeron a sus campos de recursos. Los parámetros del modelo no se modificaron. El manifiesto `models_manifest.*.json` registra el SHA-256 de cada fichero publicado, y `scrub-manifest.json` indica qué ficheros reescribió la última pasada.

## Capacidades

- Predicción de soluciones de PDE a partir de observaciones parciales, con tareas de recuperación (`task="recovery"`) y evaluación mediante el scorer del benchmark.
- Cobertura de múltiples familias de PDE, entre ellas Poisson, según la estructura `models/<cluster-label>/<pde>/<method>/<train_view>/`.
- Cobertura de múltiples métodos de operadores neuronales, entre ellos FNO, con presets configurables (`paper`).
- Cobertura de distintos patrones de observación de entrenamiento, como muestreo aleatorio del 50 % (`random_50pct`).
- Inferencia y reevaluación reproducible: carga de checkpoints con `api.load_legacy_checkpoint`, predicción con `api.predict` y puntuación con `api.evaluate`.
- Registro de procedencia: el predictor almacena el SHA-256 del fichero y la época, lo que permite auditar qué checkpoint produjo cada resultado.
- Reevaluación estricta de las 441 configuraciones de la campaña a partir de arrays de predicción retenidos, con `pdeobs-strict-v1` sobre nueve vistas de 200 identidades retenidas cada una.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas generales, visión, audio, tool calling, agentes ni multilingüismo.

## Casos de uso

- Evaluación comparativa de operadores neuronales en régimen de observaciones parciales: cargar los checkpoints de referencia de una familia de PDE y patrón de observación concretos, predecir sobre las vistas del dataset compañero y puntuar con `pdeobs-strict-v1` para obtener una línea base reproducible frente a un método nuevo.
- Reproducción de resultados de publicación: usar los checkpoints de la revisión de octubre de 2026 y sus `model.json` (cohorte, PDE, vista de entrenamiento, método, protocolo, semilla, rejilla, épocas, pérdida final, tasa de aprendizaje, número de registros, digest de receta y SHA-256) para reconstruir las tablas de resultados con trazabilidad completa.
- Auditoría de integridad de artefactos científicos: verificar cada fichero publicado contra el SHA-256 de `models_manifest.<cluster-label>.json` y comprobar qué metadatos fueron reescritos mediante `scrub-manifest.json`, útil en revisiones de revistas o comités de reproducibilidad.
- Estudio de sensibilidad al patrón de observación: comparar el mismo método y familia de PDE entre distintas `train_view` (por ejemplo, `random_50pct` frente a otros patrones) para cuantificar cuánto degrada la recuperación al reducir o sesgar las observaciones.
- Análisis de cohortes de entrenamiento: medir el efecto del presupuesto de épocas (500 originales frente a 200 declaradas o protocolo con paciencia) sobre el error relativo L2 conjunto, declarando la cohorte por fila en las tablas agregadas.
- Desarrollo y validación de herramientas de benchmarking: integrar el paquete `pdeobs` en pipelines de CI para regresión automática de nuevos operadores neuronales contra los checkpoints publicados, aprovechando la API `load_dataset` con verificación y el scorer estricto.
- Investigación sobre recuperación con relleno: usar las ejecuciones E6 (copias de relleno por vecino más cercano de ejecuciones FNO con relleno a cero) como control para aislar el efecto del esquema de imputación en la recuperación de soluciones.

## Benchmarks y rendimiento

La información disponible no incluye una tabla de resultados numéricos por checkpoint. La model card indica que las 441 configuraciones de la campaña fueron reevaluadas con el scorer estricto `pdeobs-strict-v1` (nueve vistas de 200 identidades retenidas cada una) y que esos resultados, junto con los errores por identidad, acompañan al código del benchmark en `results/prediction_verification_20260924/`. Asimismo, señala que las métricas del evaluador propio de la campaña permanecen en el índice de resultados archivados y no son los números actuales del artículo. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de la arquitectura concreta de cada checkpoint, registrada en `resolved.yaml`, y del tamaño del estado del modelo en `last.pt` o `weights.pt`.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; debe determinarse por checkpoint a partir de su configuración resuelta.
- Opciones de despliegue: carga directa con PyTorch (`torch.load(path, map_location="cpu", weights_only=False)`) y carga mediante el paquete `pdeobs` (`api.load_legacy_checkpoint` para la campaña; formato `pdeobs-october2026-weights/1` para la revisión de octubre). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 17,5 GB, dato relevante para planificar el despliegue local o en clúster.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros benchmarks de operadores neuronales ni modelos comparables con parámetros, contexto, rendimiento o licencia documentados.

## Limitaciones y advertencias

- Los checkpoints son pesos finales de cada intento, no seleccionados por error de validación o test; su rendimiento puede no ser el óptimo alcanzable dentro de cada ejecución.
- Solo contienen pesos: se eliminaron los estados de optimizador, gradient scaler y RNG (aproximadamente dos tercios de cada fichero), por lo que no permiten continuar el entrenamiento de forma exacta, solo inferencia y reevaluación.
- Las cohortes de entrenamiento no son intercambiables (500 épocas originales, continuación recuperada, presupuesto de 200 épocas, protocolo con paciencia máxima de 200 épocas e intento interrumpido rescatado); cualquier tabla que las agregue debe declararlo por fila.
- Las métricas del evaluador propio de la campaña no coinciden con los números actuales del artículo; para resultados vigentes debe usarse el scorer `pdeobs-strict-v1`.
- Los metadatos fueron desidentificados con marcadores de posición; los parámetros no se modificaron, pero la trazabilidad de rutas, nodos y revisiones de código originales se pierde en los ficheros publicados.
- Las 12 ejecuciones E6 son copias de relleno por vecino más cercano de ejecuciones FNO con relleno a cero; no son entrenamientos independientes y no deben tratarse como tales.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas porque el modelo no es generativo ni lingüístico; no aplica.
- Licencia MIT: permite uso comercial y modificación con atribución, pero la información disponible no detalla condiciones adicionales sobre los datos del dataset compañero, que deben revisarse por separado.
- El repositorio no declara pipeline ni idiomas, lo que confirma que no está pensado para tareas de NLP.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ru1ch3n/PDE-OBS
- Dataset compañero: https://huggingface.co/datasets/ru1ch3n/PDE-OBS
- Artículo referenciado en las etiquetas: arXiv:2609.36521 (no se dispone de URL verificada en la información proporcionada)

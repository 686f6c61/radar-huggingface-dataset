# djduecaster/dfreq-sprint-launch-affine-20261119

## Resumen

Microduck 2 m Sprint: Affine Launch es un modelo de control robótico publicado por el usuario djduecaster en Hugging Face, derivado mediante fine-tuning del checkpoint base `djduecaster/dfreq`. Se distribuye como artefacto ONNX bajo el pipeline `robotics` y la etiqueta `microduck-arena`, lo que lo sitúa en el ecosistema de controladores neuronales para agentes simulados tipo "microduck" que compiten en tareas de sprint (carreras de velocidad en simulacion). No es un modelo de lenguaje: consume observaciones numericas y emite acciones articulares.

Tecnicamente, el modelo implementa una correccion afina recortada (clipped affine correction) aplicada sobre la primera accion cuando el vector de accion previa es cero, es decir, al arrancar desde reposo. Esta correccion se ajusta a partir de 14 posiciones articulares observadas y de objetivos de lanzamiento declarados por el autor. Tras ese paso inicial, el controlador neuronal `dfreq` opera con normalidad. La interfaz de runtime es fija: 61 floats de observacion de entrada y 14 objetivos articulares de salida, sin consulta de trayectorias, sin semillas y sin tensores externos.

La relevancia del artefacto es acotada y local: el autor reporta mediciones en un evaluador Mac fijado a un commit concreto, con un tiempo medio de 0,845 s y 5/5 finalizaciones a 1,15 m/s en arranques fijados, y un rendimiento de 57/256 en arranques nuevos frente a 61/256 del checkpoint archivado. El propio autor advierte que son mediciones locales y no puntuaciones del leaderboard de la Arena ni evidencia de una mejora general de fiabilidad. El modelo es exclusivamente de simulacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Controlador neuronal (base `djduecaster/dfreq`) con correccion afina recortada sobre la primera accion; artefacto ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 61 floats de observacion |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | no disponible (modelo de control roboticó, sin interfaz de lenguaje) |
| Licencia | no disponible (existe un fichero `LICENSE-NOTE.txt` con derechos heredados, no consultado) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `djduecaster/dfreq`, un controlador neuronal previamente entrenado para el agente microduck, y se somete a un fine-tuning que anade una capa de correccion afina recortada. Esta correccion solo se activa cuando el vector de accion previa es nulo (arranque desde reposo): en ese caso, transforma la primera accion en funcion de las 14 posiciones articulares observadas, ajustando la funcion afina con los objetivos de lanzamiento declarados por el autor. Una vez superado ese primer paso, la politica `dfreq` subyacente se ejecuta sin modificaciones. No se especifican en la informacion disponible el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este dominio).

La innovacion tecnica declarada es precisamente esa correccion afina de lanzamiento, pensada para mejorar la consistencia del arranque en pruebas de sprint. El artefacto se distribuye como grafo ONNX con un SHA-256 publicado (`963fb009fdc5e71c96796cd1f515eb25a96c0243c4f41099a05523a6ed46d980`) y una interfaz de inferencia estricta: 61 floats de observacion y 14 objetivos articulares, sin dependencias externas ni estado oculto mas alla del vector de accion previa.

## Capacidades

- Control motor de un agente simulado tipo microduck en tareas de sprint a 1,15 m/s.
- Correccion de lanzamiento desde reposo mediante funcion afina recortada sobre 14 articulaciones.
- Inferencia en formato ONNX con entrada fija de 61 floats y salida de 14 objetivos articulares.
- Ejecucion determinista sin semillas, sin lookup de trayectorias y sin tensores externos.
- Integrable en pipelines de evaluacion locales mediante el evaluador Mac referenciado (commit `9bf04c0668145528035c8a315d5d8ae2530c1279`).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues, vision ni audio.

## Casos de uso

- Evaluacion de politicas de control en simulacion: el artefacto puede cargarse en el evaluador Mac del autor para reproducir las mediciones reportadas (0,845 s de media, 5/5 finalizaciones en arranques fijados) y comparar contra el checkpoint archivado.
- Investigacion sobre correcciones de arranque: util para estudiar como una transformacion afina sobre la primera accion afecta a la consistencia de lanzamiento en agentes con dinamica articular, dado que el autor reporta 57/256 frente a 61/256 en arranques nuevos.
- Benchmarking interno de controladores microduck: sirve como referencia base en cohorts de arranques nuevos a 1,15 m/s, siempre con la cautela de que no son puntuaciones oficiales de la Arena.
- Pruebas de integracion ONNX en pipelines de robotica simulada: el grafo puede desplegarse con runtime ONNX estandar para validar la interfaz de 61 entradas y 14 salidas en entornos de CI.
- Estudio de linaje de fine-tunes: al declarar `base_model: djduecaster/dfreq` con relacion `finetune`, permite analizar el impacto de ajustes especificos sobre un controlador preentrenado.
- Docencia y prototipado en robotica de simulacion: ejemplo compacto de como anadir una correccion condicionada al estado (accion previa nula) sobre una politica neuronal existente.

## Benchmarks y rendimiento

| Metrica | Valor reportado por el autor |
|---|---|
| Tiempo medio en evaluador Mac (commit `9bf04c0668145528035c8a315d5d8ae2530c1279`) | 0,845 s |
| Finalizaciones en arranques fijados a 1,15 m/s | 5/5 |
| Finalizaciones en arranques nuevos a 1,15 m/s (este modelo) | 57/256 |
| Finalizaciones en arranques nuevos a 1,15 m/s (checkpoint archivado) | 61/256 |

El autor indica explicitamente que estas son mediciones locales y no puntuaciones del leaderboard de la Arena ni evidencia de una mejora general de fiabilidad. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a este dominio.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un artefacto ONNX de control roboticó de un agente microduck, la huella es presumiblemente minima, pero no se publica el tamano del grafo ni el numero de parametros.
- GPU recomendadas: no disponibles; el autor reporta evaluacion en un Mac, no en GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: runtime ONNX estandar; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: unica referencia el tiempo medio de 0,845 s por episodio en el evaluador Mac fijado; no se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dfreq-sprint-launch-affine-20261119 (este) | no disponible | entrada fija de 61 floats | 57/256 arranques nuevos a 1,15 m/s; 0,845 s de media | no disponible | Hugging Face (0 descargas, 0 likes) |
| djduecaster/dfreq (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Checkpoint archivado (referenciado por el autor) | no disponible | no disponible | 61/256 arranques nuevos a 1,15 m/s | no disponible | no disponible |

No se dispone de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de simulacion; no hay evidencia de transferencia a robotica fisica.
- Las metricas reportadas son mediciones locales del autor en un evaluador Mac concreto y no puntuaciones oficiales de la Arena ni prueba de mejora general.
- En arranques nuevos el modelo obtiene 57/256 frente a 61/256 del checkpoint archivado, es decir, no supera al checkpoint de referencia en ese cohort.
- La correccion afina solo se activa cuando el vector de accion previa es cero; fuera de ese caso el comportamiento es el del controlador `dfreq` sin modificar.
- Interfaz rigida de 61 floats de entrada y 14 salidas; cualquier cambio en el entorno de observacion invalida el artefacto.
- Licencia no disponible; existe un `LICENSE-NOTE.txt` con derechos heredados que debe consultarse antes de cualquier uso, incluido el comercial.
- Sin informacion sobre sesgos, alucinacion o limitaciones de idioma, ya que no es un modelo de lenguaje.
- Repositorio sin descargas ni likes y con actualizacion inmediata tras la creacion, lo que sugiere un artefacto experimental sin validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djduecaster/dfreq-sprint-launch-affine-20261119
- Modelo base: https://huggingface.co/djduecaster/dfreq
- Creditos del modelo upstream: `upstream-base-card.md` (referenciado en la model card, no enlazado)
- Nota de licencia: `LICENSE-NOTE.txt` (referenciado en la model card, no enlazado)
- Evaluador Mac referenciado: commit `9bf04c0668145528035c8a315d5d8ae2530c1279` (sin URL publica en la informacion disponible)

# islee94/n16-franka-pnp-chicken-pan-to-plate-obstacle-repace-v41-30k-s42

## Resumen

El modelo `n16-franka-pnp-chicken-pan-to-plate-obstacle-repace-v41-30k-s42` es un checkpoint de GR00T N1.6 afinado (fine-tuning) para una tarea concreta de manipulacion robotica: el trasvase de un pollo (o pieza de pollo) de una sarten a un plato evitando obstaculos, sobre un brazo Franka. Lo publica el usuario `islee94` en Hugging Face, procedente de un entrenamiento ejecutado en el cluster MPCDF (Raven) con 2 GPU NVIDIA A100-SXM4-80GB. No es un modelo de lenguaje generalista, sino un modelo vision-language-action (VLA) orientado a control de robots.

El checkpoint corresponde al paso 30 000 de un run de reinforcement learning / destilacion (el autor menciona `pacedistill_manifest.json` y un contexto RLWD), y se sube solo con los ficheros de inferencia, sin estado del optimizador. El repositorio ocupa 6,6 GB y contiene dos ficheros safetensors que suman 3 286 608 832 parametros (aproximadamente 3,29 mil millones).

Su relevancia es acotada: se trata de un artefacto de investigacion muy especifico (una politica entrenada para una tarea y un entorno concretos), no de un modelo de proposito general. Resulta util como referencia para quien trabaje con GR00T N1.6, con politicas de manipulacion sobre Franka o con pipelines de entrenamiento tipo Raven/RLWD, pero no esta pensado para uso fuera de ese contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.6 (modelo vision-language-action; detalles internos no disponibles) |
| Parametros totales | 3 286 608 832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (dos shards: `model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`) |

## Arquitectura y entrenamiento

La model card identifica el modelo como un checkpoint de GR00T N1.6 afinado, con ficheros de configuracion (`config.json`, `final_model_config.json`, `processor_config.json`, `final_processor_config.json`) y estadisticas de dataset (`dataset_statistics.json`, `statistics.json`). El entrenamiento se realizo sobre 2 GPU NVIDIA A100-SXM4-80GB en el cluster MPCDF (Raven), con un contexto de ejecucion documentado en `raven/rlwd_context.txt` y un manifiesto de destilacion `raven/pacedistill_manifest.json`. El nombre del run (`real_chicken_n16_repace_v41_30k_s42`) sugiere un entrenamiento de 30 000 pasos con semilla 42 sobre datos reales de la tarea.

No se dispone de informacion sobre el numero de tokens o episodios de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o aprendizaje por refuerzo. Tampoco se detalla la arquitectura interna de GR00T N1.6 (tipo de backbone, mecanismo de atencion, integracion vision-lenguaje-accion) mas alla de la etiqueta del modelo. El repositorio incluye `embodiment_id.json`, lo que indica que el modelo esta asociado a una encarnacion robotica concreta (brazo Franka en este caso).

## Capacidades

- Control de manipulacion robotica para la tarea de trasvase de una pieza de pollo de sarten a plato con evitacion de obstaculos, sobre un brazo Franka.
- Procesamiento de observaciones visuales y de estado del robot a traves del pipeline de preprocesado incluido (`processor_config.json`, `statistics.json`).
- Generacion de acciones motoras condicionadas a la tarea y al entorno de entrenamiento.
- Integracion con el ecosistema GR00T N1.6 (configuraciones de experimento en `experiment_cfg/`).
- No se documentan capacidades de generacion de texto, codigo, matematicas, tool calling, agentes multi-paso, multilingue, thinking mode, vision general o audio.

## Casos de uso

- Reproduccion de experimentos de manipulacion: el checkpoint permite reproducir la politica entrenada para la tarea `real_chicken_n16_repace_v41_30k_s42` en un entorno Franka equivalente, comparando resultados con el paso 30 000 del run original.
- Investigacion en VLA sobre Franka: sirve como punto de partida para estudiar el comportamiento de GR00T N1.6 en tareas de pick-and-place con obstaculos y para analizar el efecto del fine-tuning a 30 000 pasos.
- Evaluacion de pipelines de destilacion: el manifiesto `pacedistill_manifest.json` y el contexto RLWD permiten auditar como se genero el checkpoint y reutilizar el flujo en otros entrenamientos.
- Baseline para comparativas de politica: al ser un checkpoint concreto con semilla 42, puede usarse como referencia frente a otras semillas o variantes del mismo run (`v41`, `30k`).
- Despliegue en laboratorio con 2 A100: el modelo cabe en el mismo hardware usado para entrenar (2 x A100-SXM4-80GB), lo que facilita la inferencia en el mismo entorno de computo.
- Docencia y formacion en robotica: util para demostrar el ciclo completo de entrenamiento y publicacion de una politica VLA en Hugging Face, incluyendo la estructura de ficheros de configuracion y estadisticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 6,6 GB en safetensors, por lo que una carga en precision nativa requeriria del orden de 6-7 GB de VRAM solo para pesos, mas el overhead del pipeline de preprocesado y del entorno de simulacion o robot.
- GPU recomendadas: el entrenamiento se realizo con 2 x NVIDIA A100-SXM4-80GB; para inferencia no se documenta una configuracion minima.
- Viabilidad en GPU de consumo: no confirmada; el tamano de pesos (aproximadamente 3,29 mil millones de parametros) sugiere que podria caber en GPUs consumer de 12-24 GB, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: no se documentan (no hay referencias a vLLM, llama.cpp, Ollama o TGI; el modelo es de robotica y requiere el stack de GR00T N1.6).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros checkpoints de GR00T N1.6, de politicas VLA comparables (por ejemplo, otros fine-tunings sobre Franka) ni de modelos de la misma categoria con los que establecer una comparacion fiable.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado para una tarea concreta (pollo de sarten a plato con obstaculos) y una encarnacion concreta (Franka); no es transferible sin reentrenamiento.
- Sin licencia declarada: no se especifica licencia, por lo que el uso comercial queda sin marco legal claro y requiere contactar con el autor.
- Sin idiomas declarados: al ser un modelo de robotica, la ausencia de metadatos de idioma no implica soporte multilingue.
- Riesgo de sobreajuste al entorno de entrenamiento: el checkpoint corresponde a un unico run con semilla 42 y 30 000 pasos; su comportamiento fuera de las condiciones de entrenamiento no esta documentado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento ni de robustez.
- Solo ficheros de inferencia: no incluye estado del optimizador, por lo que no es reanudable para entrenamiento sin el checkpoint original.
- Dependencia del stack GR00T N1.6 y del pipeline de preprocesado incluido; un uso incorrecto de `processor_config.json` o `statistics.json` puede degradar las acciones generadas.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion de la comunidad ni reportes de uso.

## Enlaces

- Hugging Face: https://huggingface.co/islee94/n16-franka-pnp-chicken-pan-to-plate-obstacle-repace-v41-30k-s42

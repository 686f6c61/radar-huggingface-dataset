# anhdao69/CoilWAM_real4task

## Resumen

CoilWAM v0 4/4 es un modelo de política (policy) para control robótico entrenado por el usuario anhdao69, publicado en Hugging Face bajo el identificador `anhdao69/CoilWAM_real4task`. No se trata de un modelo de lenguaje: es un modelo de imitación (behavior cloning) que mapea observaciones multimodales de un brazo robótico AgileX Piper —imágenes de cámara frontal y de muñeca, posiciones articulares y una instrucción en lenguaje natural— a comandos de acción de bajo nivel (32 objetivos articulares absolutos en grados más la posición del gripper). El repositorio ocupa 4,7 GB y contiene dos checkpoints intermedios de 2,34 GB cada uno.

El modelo se entrenó sobre una selección de 400 episodios (100 por cada una de las cuatro tareas de mesa) del dataset `anhdao69/data_real_4tasks`. La observación combina un frame de cámara frontal y otro de muñeca (480x640 RGB, reescalados a 192x256 y concatenados), las posiciones medidas de las articulaciones `joint_1..6` en grados, la posición del gripper y una instrucción de tarea. La acción consiste en 32 objetivos articulares absolutos con una separación temporal de 1/15 s entre filas consecutivas.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y cero likes, sin model card completa en cuanto a licencia, idiomas o benchmarks, y con checkpoints intermedios (pasos 20.000 y 25.000 de un total de 30.000 actualizaciones). Es útil como referencia para quienes trabajen en manipulación robótica con AgileX Piper y quieran reproducir o comparar políticas de imitación, pero no constituye un modelo listo para producción ni un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona los state dicts `mot` y `proprio_encoder`, sin detallar la arquitectura subyacente) |
| Parametros totales | no disponible (checkpoint de 2.338.610.860 bytes, no equivale directamente a numero de parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ventana de observacion no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones son las siete cadenas de tarea del dataset, idioma no declarado) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`), solo pesos (`mot` y `proprio_encoder`), sin estado del optimizador |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Lo unico que se explicita es que el checkpoint contiene los state dicts de dos componentes, `mot` y `proprio_encoder`, junto con metadatos de arquitectura. El nombre `mot` sugiere un modulo de procesamiento visual o de movimiento, y `proprio_encoder` apunta a un codificador de propiocepcion que procesa las posiciones articulares y del gripper; sin embargo, no se confirma en la documentacion disponible ni el tipo de transformer, ni si hay atencion cruzada entre vision y propriocepcion, ni el numero de capas o dimensiones ocultas.

El entrenamiento consistio en 30.000 actualizaciones con batch de 128, tasa de aprendizaje 1e-4, 1.500 actualizaciones de warm-up y decaimiento coseno hasta 1e-6, con semilla 42. Los datos son 400 episodios reales (100 por tarea) del dataset `anhdao69/data_real_4tasks`, con normalizacion min/max a [-1, 1] calculada a partir de las estadisticas de esos 400 episodios (`v0_4-4/dataset_stats_7d.json`). No se menciona RLHF, DPO ni ningun proceso de alineacion; es imitacion supervisada pura sobre demostraciones. Los checkpoints publicados son intermedios (pasos 20.000 y 25.000), no el final del entrenamiento.

## Capacidades

- Control de manipulacion robótica de cuatro tareas de mesa sobre un brazo AgileX Piper real.
- Fusion de observacion multimodal: imagen de camara frontal, imagen de camara de muñeca, posiciones articulares `joint_1..6` en grados y posicion del gripper.
- Condicionamiento por instruccion en lenguaje natural: acepta las siete cadenas de tarea definidas en el dataset de entrenamiento.
- Prediccion de acciones de 32 dimensiones: objetivos articulares absolutos en grados mas posicion del gripper, con paso temporal de 1/15 s.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No se documenta vision general, audio, thinking mode ni generacion de texto.

## Casos de uso

- Replicacion de experimentos de imitacion en AgileX Piper: cargar los checkpoints `step_020000.pt` o `step_025000.pt` y evaluar la politica sobre las cuatro tareas de mesa del dataset, usando la misma normalizacion de `dataset_stats_7d.json` para garantizar comparabilidad.
- Benchmark interno de politicas de manipulacion: usar este modelo como linea base frente a politicas propias entrenadas sobre `data_real_4tasks`, comparando error de seguimiento articular y tasa de exito por tarea.
- Estudio de fusion vision-propiocepcion: analizar como el modulo `proprio_encoder` pondera las posiciones articulares frente a las imagenes, aislando el efecto de la camara de muñeca en tareas de precision.
- Analisis de sensibilidad a instrucciones: las siete cadenas de tarea permiten probar si el modelo discrimina instrucciones o si colapsa a un comportamiento promedio, midiendo la divergencia de acciones entre instrucciones sobre la misma observacion.
- Investigacion sobre entrenamiento con datos reales escasos: 100 episodios por tarea es un regimen de datos limitado; el modelo sirve para estudiar curvas de aprendizaje y sobreajuste en imitacion con pocas demostraciones.
- Docencia en robotica de manipulacion: como ejemplo reproducible de pipeline completo (dataset, normalizacion, entrenamiento con decaimiento coseno, checkpoints intermedios) para cursos practicos de learning from demonstration.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito por tarea, error de seguimiento articular, ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; cada checkpoint pesa 2,34 GB en precision nativa, por lo que se necesita al menos esa cantidad mas el overhead del runtime y de los buffers de imagen (dos frames de 480x640 RGB reescalados a 192x256).
- GPU recomendadas: no especificadas por el autor. Por tamano de checkpoint, una GPU consumer con 8-12 GB de VRAM (RTX 3060, 3070, 4060 Ti) deberia poder alojar un checkpoint en memoria; para entrenamiento o inferencia por lotes se requeriria una GPU de mayor capacidad (A100, H100) o varias consumer.
- Cabe en GPU consumer: probablemente si, dado el tamano de 2,34 GB por checkpoint, aunque no hay confirmacion oficial ni requisitos de latencia publicados.
- Opciones de despliegue: no disponibles. Al ser un checkpoint `.pt` de politica robotica, el despliegue requiere el codigo de inferencia del autor (no publicado en la informacion disponible), no vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. La unica referencia temporal es el paso de accion de 1/15 s (aproximadamente 15 Hz) entre filas consecutivas de la accion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (politicas de imitacion para AgileX Piper o brazos de mesa similares), ni datos de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor antes de cualquier despliegue productivo.
- Checkpoints intermedios: los publicados corresponden a los pasos 20.000 y 25.000 de 30.000 actualizaciones; no se incluye el checkpoint final, por lo que el rendimiento puede no ser el optimo del entrenamiento.
- Solo pesos: no se incluye estado del optimizador, lo que impide reanudar el entrenamiento tal cual; ademas, sin el codigo de arquitectura, cargar los state dicts requiere reconstruir el modelo por cuenta propia.
- Dominio muy restringido: cuatro tareas de mesa sobre un AgileX Piper concreto; no hay evidencia de generalizacion a otras tareas, objetos, entornos o robots.
- Dependencia de la normalizacion exacta: las acciones se normalizaron con `dataset_stats_7d.json` de los 400 episodios de entrenamiento; usar otras estadisticas degradara la politica de forma no controlada.
- Dependencia de la instruccion: solo se validaron las siete cadenas de tarea del dataset; instrucciones fuera de ese conjunto no tienen garantia de comportamiento correcto.
- Sin datos de sesgo, alucinacion ni robustez: al no ser un modelo de lenguaje, los riesgos tipicos de alucinacion no aplican, pero no hay evaluacion de seguridad fisica, comportamiento ante oclusiones, cambios de iluminacion o fallos de percepcion.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente por parte de la comunidad.
- Fecha de creacion inusual (2026-11-13): conviene verificar la procedencia y la integridad de los ficheros mediante los hashes SHA-256 listados antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anhdao69/CoilWAM_real4task
- Dataset de entrenamiento: https://huggingface.co/datasets/anhdao69/data_real_4tasks
- Fichero de estadisticas de normalizacion: `v0_4-4/dataset_stats_7d.json` (dentro del repositorio del modelo)
- Checkpoints: `v0_4-4/step_020000.pt` y `v0_4-4/step_025000.pt` (dentro del repositorio del modelo)
- Paper, blog, repositorio de codigo o demo: no disponibles

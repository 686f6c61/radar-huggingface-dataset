# ollaya-dev/von

## Resumen

Von es un modelo de decisión de tipo "system-one" publicado por el usuario `ollaya-dev` en HuggingFace. No se trata de un modelo de pesos originales: este repositorio contiene únicamente los artefactos derivados que el runtime Ollaya necesita para ejecutar el modelo `wfzyx/von` de Victor Hugo Panisa. Concretamente, incluye una exportación a ONNX en formato fp32 (`1.1/model-fp32.onnx`), un fichero `decision.json` con la disposición de la secuencia y los tokens especiales, y un fichero `calibration.json` con las temperaturas de calibración. Los pesos reales no se distribuyen aquí: los grafos ONNX referencian los ficheros de pesos del autor original por desplazamiento de bytes, de modo que `ollaya pull` los descarga desde el repositorio upstream, fijados a un commit y verificados por sha256.

Ollaya se presenta como un equivalente a Ollama pero para modelos de decisión: en lugar de generar texto libre, recibe preguntas tipadas y devuelve respuestas calibradas. El pipeline declarado en HuggingFace es `text-classification`, y el modelo se ejecuta localmente tanto en CPU como en CUDA a partir del grafo fp32. La etiqueta `decision-model` y el calificativo `system-one` indican que el modelo está pensado para resolver decisiones de forma directa y rápida, leyendo la respuesta a partir de los logits asociados a letras de opción en una única pasada hacia delante.

La relevancia de esta ficha es doble. Por un lado, documenta un patrón de empaquetado poco habitual en HuggingFace: un repositorio que no redistribuye pesos, sino que apunta al upstream y valida integridad por hash. Por otro, el autor publica un informe de paridad entre el runtime Rust de Ollaya y el modelo Von original en float64, sobre 485 preguntas y 653 filas, con decisiones idénticas y desviaciones de logits de hasta 4,4e-4. Esa verificación de equivalencia es el dato técnico más concreto disponible sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (exportacion ONNX de `wfzyx/von`; modelo de decision que resuelve la respuesta a partir de logits de letras de opcion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se ha indicado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (grafo ONNX `1.1/model-fp32.onnx`); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fp32); los pesos no se alojan en este repositorio, se referencian por byte offset desde los ficheros del upstream `wfzyx/von` |
| Repositorio base | `wfzyx/von` (autor: Victor Hugo Panisa), commit fijado `d8bb5e0` |
| Tag de artefacto | `von:1.1` |
| Ficheros incluidos | `1.1/model-fp32.onnx`, `1.1/decision.json`, `1.1/calibration.json` |
| Tamano del repositorio | 0.0 GB (sin pesos) |
| Pipeline declarado | text-classification |
| Libreria | onnx |

## Arquitectura y entrenamiento

No se ha publicado en la informacion disponible la arquitectura interna de `wfzyx/von` (tipo de red, numero de capas, dimensiones ocultas, mecanismo de atencion ni regimen de entrenamiento). Lo unico inferible a partir de los artefactos es que se trata de un modelo de decision cuyo resultado se obtiene leyendo los logits correspondientes a letras de opcion, y que se exporta de forma completa a ONNX en precision fp32. El fichero `decision.json` describe la disposicion de la secuencia y los tokens especiales, lo que sugiere un formato de entrada estructurado con marcadores de posicion para las opciones, y `calibration.json` contiene temperaturas, lo que indica que las probabilidades de salida se recalibran antes de exponerse al usuario.

El dato mas relevante en terminos de entrenamiento y validacion es el informe de paridad: el runtime Rust de Ollaya reproduce el comportamiento del Von original ejecutado en float64 sobre 485 preguntas (653 filas). Segun el autor, los ids de token y las posiciones de los marcadores son identicos, la decision coincide en todas las preguntas, los logits difieren como maximo en 4,4e-4 y las probabilidades en 4,7e-5, tanto en CPU como en CUDA. No se documenta el proceso de entrenamiento del modelo original (datos, numero de tokens, composicion del dataset, uso de RLHF o DPO) ni innovaciones tecnicas adicionales mas alla de la calibracion y la decodificacion directa por logits de opcion.

## Capacidades

- Clasificacion de texto orientada a decision: recibe preguntas tipadas y devuelve una respuesta seleccionada entre opciones, leyendo los logits de letras de opcion en una sola pasada.
- Decision en una unica pasada hacia delante: no requiere generacion autoregresiva de texto, lo que reduce la latencia frente a un LLM convencional.
- Salidas calibradas: incorpora temperaturas en `calibration.json` para ajustar las probabilidades antes de exponerlas.
- Ejecucion local: disenado para correr en la maquina del usuario a traves del runtime Ollaya, sin dependencia de API externa.
- Compatibilidad de despliegue en CPU y GPU (CUDA) con el mismo grafo fp32.
- Integracion via API compatible con TypeSafe, segun la documentacion de Ollaya.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso.
- Cobertura multilingue: no disponible.

## Casos de uso

- Clasificacion y enrutado de consultas: dado un conjunto acotado de categorias, el modelo puede decidir a que opcion pertenece una entrada leida en una unica pasada, lo que encaja en un router previo a un LLM mayor.
- Triaje de tickets de soporte: clasificacion rapida de incidencias por tipo o prioridad dentro de un conjunto predefinido de etiquetas, con la ventaja de ejecutarse en local y con latencia de milisegundos segun la documentacion de Ollaya.
- Moderacion de contenido binaria o multiclase: decision sobre si un texto cumple una politica, empleando probabilidades calibradas para fijar umbrales de actuacion.
- Sistemas de decision embebidos en aplicaciones de escritorio o servidor sin GPU: al disponer de un grafo ONNX fp32 ejecutable en CPU, es apto para entornos donde no hay acelerador dedicado.
- Anotacion asistida en pipelines de datos: preetiquetado automatico de grandes volumenes de texto para revision humana posterior, aprovechando la inferencia local sin coste por token.
- Evaluacion A/B y experimentacion controlada: la salida calibrada permite comparar decisiones con umbrales ajustables y medir derivas entre versiones del modelo.
- Integracion en APIs tipadas: al exponerse detras de una API compatible con TypeSafe, puede conectarse como servicio de decision dentro de una arquitectura de microservicios.
- Validacion de paridad en entornos regulados: el mecanismo de pesos referenciados por offset y verificados por sha256 facilita la trazabilidad de la version exacta del modelo utilizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato cuantitativo publicado es el informe de paridad entre el runtime Rust de Ollaya y el modelo Von original en float64:

| Metrica | Valor |
|---|---|
| Preguntas evaluadas | 485 |
| Filas evaluadas | 653 |
| Coincidencia de ids de token | identica |
| Coincidencia de posiciones de marcador | identica |
| Coincidencia de decision | 100 por ciento de las preguntas |
| Desviacion maxima de logits | 4,4e-4 |
| Desviacion maxima de probabilidades | 4,7e-5 |
| Entornos verificados | CPU y CUDA |

## Requisitos de hardware

- No se dispone del numero de parametros del modelo base, por lo que no es posible estimar la VRAM necesaria de forma fiable.
- El grafo distribuido es fp32, lo que implica que la huella de memoria en este formato sera la mayor de las posibles; el propio autor indica que ese mismo grafo se usa tanto en CPU como en GPU.
- Se ha verificado ejecucion en CPU y en CUDA, de modo que el modelo puede desplegarse sin GPU dedicada.
- GPU concretas recomendadas: no disponible.
- Encaje en GPU de consumo (RTX 4090 et al.): no disponible, al no conocerse el tamano del modelo.
- Opciones de despliegue: runtime Ollaya (con `ollaya pull` y `ollaya run von`), que descarga los pesos desde el repositorio upstream, verifica su sha256 y los sirve detras de una API compatible con TypeSafe. Otros motores de inferencia ONNX no se documentan en la informacion disponible.
- Latencia y throughput: la documentacion de Ollaya menciona respuestas calibradas en milisegundos, pero no se publican cifras concretas de latencia ni de throughput.

## Comparativa con modelos similares

La familia Ollaya incluye otros modelos de decision y clasificacion (Laya, decider, NLI y GLiClass), aunque la informacion disponible sobre ellos es limitada.

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `ollaya-dev/von` | Modelo de decision (system-one) | `wfzyx/von` de Victor Hugo Panisa | no disponible | no disponible | Apache-2.0 | HuggingFace; pesos en el repositorio upstream |
| `decider` | Modelo de decision | Qwen3.5 de Mapika | no disponible | no disponible | no disponible | Ollaya; presentado como el modelo de decision mas preciso del catalogo |
| `ollaya-dev/nli` | Clasificacion / inferencia de lenguaje natural | no disponible | no disponible | no disponible | no disponible | HuggingFace; mismo patron de pesos referenciados por byte offset |
| GLiClass | Clasificacion | no disponible | no disponible | no disponible | no disponible | Ollaya |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio no contiene pesos: cualquier uso requiere descargar los ficheros desde `wfzyx/von`. Sin acceso al upstream, el modelo no es utilizable.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre su funcionamiento.
- No se documentan los idiomas soportados, lo que impide garantizar un comportamiento correcto fuera de la lengua o lenguas de entrenamiento del modelo original.
- Se desconoce el numero de parametros, la longitud de contexto y el regimen de entrenamiento, lo que limita la evaluacion previa a su adopcion en produccion.
- Al ser un modelo de decision y no un generador, no produce texto libre; no debe emplearse para tareas generativas.
- Riesgo de alucinacion y de sesgos: no evaluado en la informacion disponible. En modelos de clasificacion calibrados, el riesgo se manifiesta como confianza mal calibrada en entradas fuera de distribucion.
- Las probabilidades de salida dependen de las temperaturas de `calibration.json`; modificarlas sin recalibrar invalida la interpretacion de los umbrales.
- La fecha de creacion registrada en HuggingFace (2026-09-25) es posterior a la fecha de consulta, lo que constituye una anomalia de los metadatos que conviene verificar.
- Licencia Apache-2.0, que permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se documenten los cambios. Ollaya tambien se distribuye bajo Apache-2.0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ollaya-dev/von
- Modelo base original: https://huggingface.co/wfzyx/von
- Revision fijada del modelo base: https://huggingface.co/wfzyx/von/tree/d8bb5e0745d8ee1fb65d536d6d4892d54d5a93fd
- Repositorio GitHub de Ollaya: https://github.com/ollaya-dev/ollaya
- Releases de Ollaya: https://github.com/ollaya-dev/ollaya/releases
- Catalogo de modelos de Ollaya: https://ollaya.dev/search
- Sitio de Ollaya: https://ollaya.cobanov.dev/
- Modelo `ollaya-dev/nli` (mismo patron de empaquetado): https://huggingface.co/ollaya-dev/nli
- Base de datos de especificaciones de modelos: https://models.dev/

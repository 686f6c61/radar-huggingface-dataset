# meshllm/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-UD-Q4_K_XL-layers

## Resumen

El repositorio meshllm/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-UD-Q4_K_XL-layers no contiene un modelo entrenado desde cero, sino un paquete de capas (layer package) en formato GGUF publicado por meshllm para ejecutar el modelo NVIDIA Nemotron 3.5 Lightning 30B-A3B (en su cuantización UD-Q4_K_XL de Unsloth) de forma distribuida. El paquete trocea el GGUF original en artefactos por capa (53 capas segun la model card) y los acompana de un manifiesto con checksums SHA-256, de manera que un cluster local puede repartir las capas entre varias maquinas y sumar su memoria y su capacidad de computo.

El problema que resuelve es concreto: un GGUF de una familia 30B-A3B en Q4 ronda las decenas de gigabytes y no siempre cabe en un unico host con GPU de consumo. Mesh LLM permite que varios nodos aporten memoria y computo, exponer un unico endpoint compatible con la API de OpenAI (`/v1/chat/completions`) y mantener la inferencia en local, sin enviar datos a terceros. El repositorio ocupa 25,9 GB y esta pensado para el runtime `mesh-llm` (variante de paquete `UD-Q4_K_XL`, ABI "skippy").

La relevancia practica del repositorio es limitada y conviene ser explicito: acumula 0 descargas y 0 me gusta, no incluye resultados de benchmarks ni datos de contexto, idiomas o licencia matizados, y varios campos de su model card aparecen sin registrar ("activation width: not recorded", "package size: 0 B"). Ademas, el recuento de parametros que reporta HuggingFace (38.744.896) es incompatible con la escala 30B-A3B del nombre, senal de metadatos incompletos o erroneos. Debe tratarse, por tanto, como un artefacto de empaquetado para despliegue distribuido, no como una publicacion de modelo con garantias de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada; el paquete empaqueta el modelo base NVIDIA Nemotron 3.5 Lightning 30B-A3B, del que solo consta el numero de capas (53) |
| Parametros totales | escala 30B-A3B segun el nombre del modelo; el campo de parametros de HuggingFace indica 38.744.896, cifra incompatible con esa escala y probablemente erronea |
| Parametros activos | no confirmado por el paquete ("activation width: not recorded"); la nomenclatura A3B corresponde a un modelo de mezcla de expertos con aproximadamente 3.000 millones de parametros activos por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q4_K_XL (Unsloth Dynamic, GGUF); el repositorio solo distribuye esta variante, troceada por capas |
| Idiomas soportados | no disponible |
| Licencia | `other`, heredada de unsloth/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF |
| Formato de pesos | GGUF troceado en artefactos por capa, mas un manifiesto `model-package.json` con checksums |

Datos adicionales del paquete:

| Parametro | Valor |
|---|---|
| Repositorio | meshllm/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-UD-Q4_K_XL-layers |
| Autor | meshllm |
| Modelo de origen | unsloth/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF |
| Revision de origen | f2d3fe3694501008786e81e5f20360cbf715496a |
| Fichero de origen | NVIDIA-Nemotron-3.5-Lightning-30B-A3B-UD-Q4_K_XL.gguf |
| SHA-256 del origen | 112bf957489a497c18f60bf8bd44ee1dfa05e87368b8ed7f68998a4e38f275c9 |
| SHA-256 del manifiesto | 634ab8c3a4ada0b8627a430d9dafb5aeb8b7b29f0ceb2b6284e5bed50e124183 |
| Numero de capas | 53 |
| Tamano del repositorio | 25,9 GB |
| Libreria | mesh-llm |
| Pipeline | text-generation |
| Idiomas declarados en HuggingFace | no disponibles |
| Descargas / me gusta | 0 / 0 |
| Fecha de creacion | 2026-09-12T22:09:47Z |
| Fecha de actualizacion | 2026-09-12T22:46:34Z |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica pesos: es un artefacto de distribucion. El flujo declarado es que el splitter de Mesh LLM toma el GGUF `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-UD-Q4_K_XL.gguf` publicado por Unsloth, lo divide en artefactos por capa, calcula el SHA-256 de cada uno mientras lo escribe y genera un manifiesto (`model-package.json`) con la identidad de la fuente y los checksums. La model card indica 53 capas y deja "activation width" sin registrar, por lo que no es posible confirmar desde este repositorio ni el numero de expertos, ni la dimension oculta, ni el tipo de atencion.

Sobre el modelo subyacente, la informacion disponible solo aporta la nomenclatura de familia (NVIDIA Nemotron 3.5 Lightning, escala 30B-A3B) y la cuantizacion aplicada. Las convenciones de la industria indican que "30B-A3B" designa una arquitectura de mezcla de expertos con unos 30.000 millones de parametros totales y unos 3.000 millones activos por token, y que "UD" corresponde a las cuantizaciones dinamicas de Unsloth, con la etiqueta `imatrix` apuntando al uso de matrices de importancia durante el proceso de cuantizacion. Ninguno de estos extremos viene confirmado por el autor del paquete, que remite explicitamente a la model card de Unsloth para detalles de arquitectura, plantilla de chat, recomendaciones de muestreo, licencia y notas de benchmarks. No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, ni fases de RLHF o DPO.

La unica innovacion tecnica verificable aqui es el propio reparto: la inferencia se ejecuta capa a capa sobre varios nodos ("split layers across peers"), con un endpoint local compatible con OpenAI. El paquete fue generado con `skippy-model-package write-package` desde la referencia `f932c4d1dc12b3e3a670d5f470cedd5cdcc5db39` de `mesh-llm`.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` confirman el uso previsto como modelo de chat.
- Servicio compatible con OpenAI: expone `/v1/chat/completions` y `/v1/models` a traves del runtime local de Mesh LLM, lo que permite reutilizar clientes y SDK existentes.
- Inferencia distribuida: las 53 capas pueden repartirse entre varias maquinas que aportan memoria y computo al mismo modelo.
- Inferencia local y privada: todo el computo ocurre en hardware propio, sin dependencia de APIs externas.
- Verificacion de integridad: cada artefacto va acompanado de checksum SHA-256 en el manifiesto, lo que permite validar el paquete tras la descarga.
- Descubrimiento de topologia: la CLI expone `http://localhost:3131/api/status` para consultar el estado del cluster.
- Razonamiento, codigo, matematicas, vision, audio: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; la etiqueta `distributed-inference` se refiere a la topologia de despliegue, no a capacidades agenticas.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking), vision o audio: no disponible.

## Casos de uso

- Inferencia privada en un cluster de oficina o laboratorio: repartir las 53 capas entre varios equipos permite ejecutar un modelo de escala 30B-A3B en Q4 cuando ningun host individual dispone de VRAM suficiente, manteniendo los datos dentro de la red local.
- Sumar VRAM heterogenea: el reparto por capas permite aprovechar una mezcla de estaciones con GPUs de distintas generaciones y capacidades, asignando mas capas a los nodos con mas memoria en lugar de exigir hardware uniforme.
- Endpoint interno compatible con OpenAI: al publicar `/v1/chat/completions`, el cluster puede sustituir llamadas a APIs comerciales en herramientas y frameworks que ya hablan el protocolo de OpenAI, reduciendo cambios de codigo en la integracion.
- Asistencia de codigo en red cerrada: el propio quickstart del autor usa un ejemplo de generacion de codigo ("hello-world en Rust"); encaja en entornos con prohibicion de enviar codigo propietario a servicios externos, siempre que se valide la calidad de salida, ya que no hay benchmarks publicados.
- Plataforma de investigacion sobre inferencia distribuida: el paquete permite medir latencia por capa, coste de comunicacion entre nodos y escalado al anadir maquinas, con la ventaja de disponer de checksums reproducibles por artefacto.
- Docencia y prototipado con presupuesto ajustado: un aula con varias maquinas modestas puede servir un modelo de mayor escala que el que soportaria cualquier equipo por separado.
- Auditoria de integridad de artefactos: el manifiesto con SHA-256 facilita verificar en pipelines de CI que las capas descargadas corresponden exactamente a la revision de origen declarada.
- Procesamiento de documentos sensibles (legal, sanitario, defensa): conversaciones multi-turno con material confidencial pueden gestionarse sin salida de datos, aunque la longitud de contexto real del modelo no esta documentada en este repositorio y debe verificarse en la model card de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este paquete remite a la del modelo de origen (unsloth/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF) para las notas de benchmarks, pero esos datos no forman parte de la informacion proporcionada. Tampoco se facilitan cifras de latencia, throughput ni velocidad de decodificacion para el modo distribuido.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 25,9 GB. Como referencia de orden de magnitud, un modelo de escala 30B en Q4_K_XL suele requerir del orden de 20-26 GB para los pesos, mas el cache KV; se trata de una estimacion no confirmada por el autor, y el reparto por capas permite fragmentar esa cifra entre varios nodos.
- Cabe en GPU de consumo: no de forma holgada en un unico equipo. Repartido, cada nodo solo necesita alojar el subconjunto de capas que le asigne el planificador, de modo que GPUs de 8-24 GB pueden participar si el numero de capas por nodo es reducido.
- GPUs recomendadas: no disponible. No hay recomendaciones del autor sobre modelos concretos (A100, H100, RTX 4090 u otros) ni sobre minimos por nodo.
- Opciones de despliegue: el paquete esta disenado para `mesh-llm` (`mesh-llm serve --model ... --split`), con API compatible con OpenAI en el puerto 3131. El GGUF completo de origen es consumible por runtimes compatibles con GGUF (llama.cpp y derivados), pero el formato troceado por capas requiere el runtime de Mesh LLM.
- Red: al tratarse de inferencia distribuida, el rendimiento depende del ancho de banda y de la latencia entre nodos; no se publican cifras de throughput ni de escalado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de modelos alternativos, por lo que la comparacion se limita a formatos y modos de despliegue del mismo modelo, sin cifras de calidad.

| Variante | Formato | Cuantizacion | Uso previsto | Licencia |
|---|---|---|---|---|
| meshllm/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-UD-Q4_K_XL-layers (este repositorio) | GGUF troceado por capas + manifiesto JSON | UD-Q4_K_XL | Inferencia distribuida multi-maquina con mesh-llm | `other` |
| unsloth/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF | GGUF monolitico | UD-Q4_K_XL entre otras | Inferencia local en un unico host | `other` |
| Modelo base NVIDIA Nemotron 3.5 Lightning 30B-A3B | no disponible (pesos originales) | no disponible | Entrenamiento, ajuste fino e inferencia de referencia | no disponible |

Comparacion con modelos de otras familias de escala y arquitectura similares: no disponible. No se dispone de datos verificados de parametros, contexto, rendimiento o licencia de alternativas que permitan una comparacion rigurosa, y no se han incluido cifras estimadas para no inducir a error.

## Limitaciones y advertencias

- Licencia `other`: no se detallan los terminos en este repositorio y se heredan del modelo de origen, que a su vez remite a la licencia de NVIDIA. Antes de cualquier uso comercial es obligatorio revisar los terminos del modelo base.
- Ausencia de benchmarks: no hay ninguna cifra publicada de MMLU, HumanEval, GSM8K ni similares en la informacion disponible; cualquier afirmacion de calidad seria especulativa.
- Metadatos incompletos o inconsistentes: "activation width" sin registrar, "package size: 0 B", idiomas no disponibles y un recuento de parametros (38.744.896) incompatible con la escala 30B-A3B del nombre.
- Adopcion nula: 0 descargas y 0 me gusta en el momento de la consulta, sin senales de uso en produccion ni de validacion por parte de la comunidad.
- Riesgo de alucinacion: no evaluado; no hay evaluaciones de fidelidad, veracidad ni tasas de error publicadas.
- Sesgos: no documentados. No hay informacion sobre composicion del dataset de entrenamiento, idiomas cubiertos ni evaluaciones de sesgo.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan disponibles en la informacion proporcionada; deben consultarse en la model card del modelo de origen antes de disenar flujos de trabajo.
- Dependencia del runtime: el formato troceado por capas exige `mesh-llm`; no es un GGUF monolitico que se pueda cargar directamente en cualquier runtime compatible con GGUF sin reensamblarlo.
- Coste de red y latencia: el reparto por capas introduce comunicacion entre nodos que puede penalizar la latencia frente a la inferencia en un solo host; no hay mediciones publicadas.
- Fechas del repositorio: la creacion y la ultima actualizacion figuran como 2026-09-12, posteriores a la fecha habitual de referencia; conviene verificar la vigencia del artefacto y de la revision de origen declarada.
- Verificacion recomendada: antes de usar el paquete en produccion, comprobar el SHA-256 de cada artefacto contra el manifiesto (`634ab8c3a4ada0b8627a430d9dafb5aeb8b7b29f0ceb2b6284e5bed50e124183`) y contra el fichero de origen (`112bf957489a497c18f60bf8bd44ee1dfa05e87368b8ed7f68998a4e38f275c9`).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/meshllm/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-UD-Q4_K_XL-layers
- Modelo de origen (Unsloth, GGUF): https://huggingface.co/unsloth/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Sitio web de Mesh LLM: https://www.meshllm.cloud
- Repositorio GitHub de Mesh LLM: https://github.com/Mesh-LLM/mesh-llm
- Especificacion del formato de paquetes por capas: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
- Catalogo de paquetes: https://huggingface.co/datasets/meshllm/catalog
- Servidor de Discord: https://discord.gg/rs6fmc63eN
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: unicamente enlaces generales a ChatGPT y a OpenAI, sin relacion con Nemotron, Unsloth o Mesh LLM.

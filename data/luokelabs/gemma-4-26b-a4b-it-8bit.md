# luokelabs/gemma-4-26b-a4b-it-8bit

## Resumen

`luokelabs/gemma-4-26b-a4b-it-8bit` es un espejo (mirror) del modelo multimodal `mlx-community/gemma-4-26b-a4b-it-8bit`, publicado por luokelabs (LuoKe) para facilitar la descarga desde China de la version cuantizada a 8 bits en formato MLX del modelo base de Google `google/gemma-4-26b-a4b-it`. Segun la model card, los pesos, el `config` y el tokenizer son identicos byte a byte al original de mlx-community; el unico contenido anadido es la nota explicativa y el fichero LICENSE.

El repositorio incluye 25.805.936.206 parametros (unos 25,8 mil millones) en cuantizacion afines de 8 bits con group size 64, generada por mlx-community con `mlx-vlm` 0.4.3. El pipeline declarado es `image-text-to-text`, por lo que se trata de un modelo que acepta imagen y texto como entrada y produce texto. El tamano del repositorio es de 28,0 GB y la licencia declarada es Apache 2.0, remitiendo ademas a la licencia especifica de Gemma 4, a la politica de usos prohibidos y a los terminos de uso de Google.

Su relevancia practica es doble: por un lado sirve como artefacto listo para inferencia local en Apple Silicon mediante MLX; por otro, es el modelo base que la aplicacion de LuoKe descarga y verifica por hash para su perfil de equipos con 64 GB o mas de memoria unificada. La ficha no dispone de datos publicados sobre arquitectura interna, ventana de contexto, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la informacion proporcionada; el sufijo "a4b" del nombre sugiere una arquitectura de mezcla de expertos con unos 4.000 millones de parametros activos, sin confirmar) |
| Parametros totales | 25.805.936.206 (dato real de safetensors) |
| Parametros activos | no disponible (el nombre "26b-a4b" apunta a ~4.000 millones activos, sin confirmar en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afines (affine), group size 64; conversion realizada con mlx-vlm 0.4.3. No se ofrecen otras cuantizaciones en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con remision a la licencia de Gemma 4, a la politica de usos prohibidos y a los terminos de uso de Google) |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo: no se detallan el tipo de transformer, la composicion de capas, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. Tampoco se especifica el mecanismo de atencion ni si existe algun componente de decodificacion especulativa. Lo unico confirmado a nivel tecnico es que el pipeline es `image-text-to-text`, es decir, un modelo multimodal de entrada imagen y texto, y que el nombre del modelo codifica 26B de parametros totales con un sufijo "a4b" que, por convencion habitual, corresponderia a unos 4B de parametros activos; este ultimo punto no puede confirmarse con la informacion proporcionada.

En cuanto al proceso de conversion, mlx-community genero esta version aplicando cuantizacion afines de 8 bits con group size 64 sobre el modelo original de Google mediante `mlx-vlm` 0.4.3. El espejo de luokelabs no modifica los pesos: replica los ficheros del repositorio de mlx-community y anade una nota y el fichero de licencia. Por tanto, cualquier peculiaridad de entrenamiento, destilacion o alineacion del modelo original queda fuera del alcance de lo documentado en este repositorio.

## Capacidades

- Generacion de texto conversacional a partir de entradas de imagen y texto (`image-text-to-text`), segun el pipeline declarado.
- Descripcion de imagenes y respuesta a preguntas sobre el contenido visual, tal como ilustra el ejemplo de uso de la model card (`python -m mlx_vlm.generate --prompt "Describe this image." --image <ruta>`).
- Conversacion multi-turno: el repositorio incluye la etiqueta `conversational`.
- Inferencia local en Apple Silicon mediante MLX y la libreria `mlx-vlm`.
- Capacidades de razonamiento, codigo, matematicas, tool calling, function calling, agentes, multilingueismo, audio u otros modos especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente multimodal local en Mac: con 25,8 GB de pesos en 8 bits, se puede ejecutar un flujo de descripcion de imagenes y respuesta a preguntas visuales en equipos Apple Silicon de 64 GB o mas de memoria unificada, sin enviar las imagenes a servicios externos.
- Verificacion de integridad de artefactos en pipelines internos: el repositorio esta pensado para que el cliente de LuoKe descargue los ficheros segun una lista de publicacion y compruebe el hash fichero a fichero antes de usarlos como modelo base, lo que encaja en flujos de distribucion controlada de pesos.
- Procesamiento de documentos escaneados: extraccion de informacion de facturas, formularios o capturas de pantalla mediante el pipeline imagen-texto, encapsulando el modelo en un servicio local para mantener los datos dentro de la organizacion.
- Soporte tecnico con evidencia visual: el usuario adjunta una captura de error o una foto de un dispositivo y el modelo genera una respuesta en lenguaje natural; requiere adaptar el prompt y, si se quiere multi-turno largo, comprobar primero la ventana de contexto real, que no esta documentada.
- Generacion y revision de codigo en un entorno de desarrollo local: uso del modelo como asistente de programacion dentro de un IDE o terminal, aprovechando la ejecucion en memoria unificada para evitar dependencias de red.
- Prototipado de agentes conversacionales con privacidad estricta: escenarios de salud, legal o industria en los que no se permite enviar imagenes ni texto a APIs externas, desplegando el modelo en un portatil o estacion de trabajo Apple Silicon.
- Comparacion de calidad entre cuantizaciones: al ser un espejo byte a byte del 8 bits de mlx-community, sirve como referencia reproducible para medir la perdida de calidad frente al modelo base en bf16 en tareas de vision y lenguaje.
- Demostraciones y docencia: ejemplo sencillo de despliegue MLX con `mlx-vlm`, util para talleres sobre cuantizacion e inferencia local en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo y la de mlx-community no incluyen tablas de MMLU, HumanEval, GSM8K ni metricas multimodales, y la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los enlaces recuperados correspondian a un servicio de video en streaming y no guardan relacion con el modelo). Por tanto, no es posible comparar numericamente su rendimiento con alternativas sin inventar datos.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: los pesos en 8 bits ocupan aproximadamente 25,8 GB (1 byte por parametro sobre 25.805.936.206 parametros), a los que hay que sumar el overhead de activaciones, cache KV y tokenizer. El repositorio completo ocupa 28,0 GB.
- Memoria unificada recomendada: 64 GB o mas en Apple Silicon, que es el perfil para el que LuoKe distribuye este modelo como base. En equipos de 32 GB el margen es muy ajustado y dependera de la ventana de contexto y del tamano de imagen de entrada.
- GPU NVIDIA (A100, H100, RTX 4090): no aplicable a este repositorio. El formato es MLX, especifico de Apple Silicon, y no se incluye ninguna ruta CUDA, GGUF ni ONNX.
- GPU de consumo: si cabe en Mac con memoria unificada de 32 GB o superior (con reservas) y de forma holgada en configuraciones de 64 GB o mas. No hay informacion sobre su funcionamiento en GPUs discretas de consumo.
- Opciones de despliegue: `mlx-vlm` (`pip install -U mlx-vlm` y `python -m mlx_vlm.generate --model ...`). No se incluyen artefactos para vLLM, TGI, Ollama ni llama.cpp; usarlos exigiria una conversion a otro formato que no esta disponible en este repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| luokelabs/gemma-4-26b-a4b-it-8bit | 25.805.936.206 | no disponible | safetensors MLX, 8 bits afines, group size 64 | apache-2.0 | Espejo del repositorio de mlx-community; pesos identicos byte a byte |
| mlx-community/gemma-4-26b-a4b-it-8bit | mismo recuento (es el original del espejo) | no disponible | safetensors MLX, 8 bits afines, group size 64 | apache-2.0 | Repositorio de origen, generado con mlx-vlm 0.4.3 |
| google/gemma-4-26b-a4b-it | no disponible (modelo base declarado) | no disponible | no disponible (presumiblemente precision completa) | apache-2.0 con licencia y politicas adicionales de Gemma 4 | Modelo base publicado por Google |

No se dispone de datos de rendimiento de ninguno de los tres artefactos, por lo que la comparativa se limita a formato, licencia y relacion de derivacion. No se han identificado en la informacion proporcionada otras alternativas de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Ausencia total de datos de evaluacion: no hay benchmarks publicados, por lo que no puede afirmarse nada sobre su calidad en razonamiento, codigo, matematicas o tareas de vision.
- Riesgo de alucinacion: inherente a los modelos generativos; al no haber evaluaciones publicadas, no puede acotarse su magnitud en este artefacto concreto.
- Sesgos: no disponibles. No se documenta composicion del dataset ni analisis de sesgos del modelo base.
- Idiomas: no disponibles. No se declara que idiomas soporta ni su nivel de competencia en castellano.
- Contexto: no disponible. Planificar despliegues en produccion sin conocer la ventana real de contexto es arriesgado, especialmente en flujos multi-turno o con documentos largos.
- Perdida por cuantizacion: los pesos estan cuantizados a 8 bits con group size 64; no se publica la degradacion respecto al modelo en precision completa.
- Restricciones de licencia: aunque el repositorio declara apache-2.0, la propia model card remite a la licencia de Gemma 4, a la politica de usos prohibidos y a los terminos de uso de Google. Es imprescindible revisarlas antes de cualquier uso comercial, ya que la licencia del modelo base puede imponer condiciones adicionales.
- Portabilidad limitada: el formato MLX solo se ejecuta en Apple Silicon. No hay versiones GGUF, ONNX ni CUDA en este repositorio, lo que descarta su uso directo en servidores con GPU NVIDIA.
- Naturaleza de espejo: el valor anadido del repositorio es la disponibilidad y la verificacion por hash, no una mejora tecnica. Cualquier problema de calidad del modelo es atribuible al modelo base o a la conversion de mlx-community, no a luokelabs.
- Uso como base de aplicacion: si se integra como modelo por defecto en una aplicacion, conviene fijar la version por hash y prever la actualizacion del repositorio, dado que las fechas de creacion y actualizacion son del 16 de octubre de 2026 y el contenido podria evolucionar.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/luokelabs/gemma-4-26b-a4b-it-8bit
- Repositorio de origen del espejo: https://huggingface.co/mlx-community/gemma-4-26b-a4b-it-8bit
- Modelo base: https://huggingface.co/google/gemma-4-26b-a4b-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Politica de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo.

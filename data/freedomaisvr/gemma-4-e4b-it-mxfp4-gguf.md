# FreedomAISVR/Gemma-4-E4B-it-MXFP4-GGUF

## Resumen

FreedomAISVR/Gemma-4-E4B-it-MXFP4-GGUF es una cuantizacion en formato GGUF del modelo google/gemma-4-E4B-it, publicada por el usuario FreedomAISVR para inferencia local con llama.cpp. El modelo base es un modelo multimodal (texto + vision) de Google DeepMind, con arquitectura declarada Gemma4ForConditionalGeneration, una longitud de contexto de 131.072 tokens (128K) y licencia Apache 2.0.

El interes de esta publicacion es eminentemente practico: reduce el modelo original en F16 (15,0 GB, 720 tensores) a un fichero de 4,8 GB en cuantizacion MXFP4 (OCP Microscaled FP4, 5,37 bits por peso), manteniendo el proyector multimodal en un GGUF F16 aparte de 945 MB. Con ello es posible ejecutar el modelo completo con vision y 128K de contexto en una GPU de consumo con unos 7 GB de VRAM, segun las mediciones del propio autor.

Se trata de un repositorio recien creado (18 de septiembre de 2026) con 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que la validacion por parte de la comunidad es inexistente. Ademas, existe una discrepancia relevante entre los datos: el recuento de safetensors del modelo base indica 7.518.069.290 parametros, mientras que la model card del autor describe el modelo como "~3B (E4B = Efficient 4B-class)". No hay informacion que permita resolverla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (texto + vision); detalles internos de la arquitectura no disponibles |
| Parametros totales | 7.518.069.290 segun safetensors del modelo base; la model card indica "~3B (E4B, Efficient 4B-class)". Dato contradictorio, sin resolver en la informacion disponible |
| Parametros activos | no disponible (no se documenta si emplea activacion selectiva de parametros) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | MXFP4 (OCP Microscaled FP4) para el modelo de texto, a 5,37 bits por peso; el proyector multimodal se distribuye en F16 |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp); dos ficheros: modelo de texto MXFP4 y mmproj F16 |

## Arquitectura y entrenamiento

La model card identifica la arquitectura del modelo base como Gemma4ForConditionalGeneration, con soporte conjunto de texto y vision ("Vision + Text"), e indica que la entrada de imagen y video se canaliza a traves del fichero mmproj. No se proporciona informacion sobre el tipo de mecanismo de atencion, la presencia de mezcla de expertos, el numero de capas, la dimension oculta ni el tokenizador. El proyecto se distribuye como cuantizacion, no como modelo nuevo: el autor no ha realizado entrenamiento, ajuste fino ni destilacion, sino unicamente la conversion de pesos desde el checkpoint F16 original de 15,0 GB (720 tensores) a MXFP4.

Tampoco se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si el modelo base paso por fases de RLHF, DPO u otro tipo de alineamiento. La unica innovacion tecnica verificable en este repositorio es la propia cuantizacion MXFP4 y su integracion con llama.cpp, junto con las flags recomendadas por el autor para exprimir el rendimiento: descarga completa de capas en GPU (`-ngl 99`), Flash Attention obligatoria para contexto largo, cache KV cuantizada a Q8_0 (claves y valores) y renderizado de plantilla de chat via Jinja2 (`--jinja`).

## Capacidades

- Generacion de texto conversacional, con plantilla de chat compatible con llama.cpp mediante `--jinja`.
- Comprension de imagenes y video: el modelo base acepta entrada visual a traves del proyector multimodal (`mmproj-gemma-4-E4B-it-f16.gguf`), que se carga de forma independiente al GGUF de texto.
- Ventana de contexto de 131.072 tokens, habilitada en la configuracion recomendada con Flash Attention y cache KV en Q8_0.
- Servicio como API HTTP con interfaz web e soporte de subida de imagenes mediante `llama-server` en el puerto 8080.
- Integracion programatica mediante `llama-cpp-python` (`create_chat_completion`) y, por etiqueta del repositorio, compatibilidad con endpoints.
- Razonamiento multi-turno: la model card etiqueta el modelo como "conversational" y las pruebas de rendimiento se realizan con `--parallel 1`, es decir, una unica secuencia.
- Capacidades de tool calling / function calling: no documentadas en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo de pensamiento explicito (thinking), audio u otras modalidades: no documentados.
- Cobertura multilingue: no documentada.

## Casos de uso

- Asistente conversacional local con contexto largo: el modelo admite 131.072 tokens de contexto, lo que permite mantener conversaciones extensas o analizar documentos completos sin truncar, siempre que se active Flash Attention y cache KV en Q8_0 tal como recomienda el autor.
- Analisis de imagenes en escritorio: cargando el mmproj junto al modelo en `llama-server`, se puede construir una herramienta local de descripcion de imagenes, extraccion de texto de capturas o revision de diagramas sin enviar datos a servicios externos.
- Procesamiento de documentos largos en un equipo de gama media: con unos 7 GB de VRAM ocupados, es viable resumir informes, contratos o articulos extensos en una unica GPU de consumo de 8-16 GB.
- Desarrollo y depuracion con llama.cpp: sirve como referencia para probar cuantizaciones MXFP4, medir el impacto de la cache KV Q8_0 en la calidad y validar la aceleracion de MXFP4 en GPUs Blackwell.
- Despliegue de un endpoint HTTP interno: `llama-server` expone una API compatible con endpoints en el puerto 8080 con interfaz web incluida, adecuada para prototipos y herramientas internas de un equipo.
- Transcripcion y resumen de video corto: al declarar soporte de video en el modelo base, puede emplearse para generar descripciones o resúmenes de clips, sujeto a la ventana de contexto disponible.
- Educacion y acceso sin conectividad: al requerir solo 4,8 GB de disco y 16 GB de RAM de sistema, es desplegable en estaciones de trabajo sin conexion a internet.
- Evaluacion comparativa de cuantizaciones: util para medir la perdida de calidad entre el F16 original de 15,0 GB y el MXFP4 de 4,8 GB en tareas de texto y vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes, ni para el modelo cuantizado ni para el modelo base).

Lo unico aportado por el autor son metricas de velocidad de inferencia en hardware concreto:

| Metrica | Valor | Entorno |
|---|---|---|
| Velocidad de generacion | 97,1 tokens/s | RTX 5060 Ti 16GB, CUDA 13.2 |
| Procesamiento de prompt | 175,1 tokens/s | RTX 5060 Ti 16GB, CUDA 13.2 |
| Longitud de contexto en la prueba | 128K con cache KV Q8_0 | RTX 5060 Ti 16GB |
| Uso de VRAM | ~7 GB (modelo + KV + vision) | RTX 5060 Ti 16GB |

## Requisitos de hardware

- VRAM en el escenario medido: aproximadamente 7 GB en total con contexto de 128K, cache KV en Q8_0 y vision activada (RTX 5060 Ti 16GB).
- VRAM minima recomendada por el autor: 8 GB o mas.
- RAM de sistema recomendada: 16 GB o mas.
- Almacenamiento: 4,8 GB para el modelo de texto mas 945 MB para el proyector multimodal (aproximadamente 5,8 GB en total).
- GPU recomendadas: el autor indica que se recomiendan GPUs NVIDIA RTX 50 (Blackwell) para aprovechar la aceleracion de MXFP4; el rendimiento en generaciones anteriores (RTX 30/40, A100, H100) no esta documentado.
- Compatibilidad con GPU de consumo: si, segun el autor cabe en una RTX 5060 Ti de 16 GB con contexto completo y vision. No hay datos para GPUs de 8 GB con la configuracion completa de 128K.
- Opciones de despliegue documentadas: `llama-cli` y `llama-server` de llama.cpp (compilado con `-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=120`) y `llama-cpp-python`. No se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: 97,1 tokens/s de generacion y 175,1 tokens/s de procesamiento de prompt en el hardware indicado. No hay datos de latencia por peticion ni de rendimiento con procesamiento en paralelo (el autor usa `--parallel 1`).

## Comparativa con modelos similares

No se dispone de resultados de benchmarks ni de datos de rendimiento comparativos que permitan una comparacion rigurosa. La unica comparacion documentable es contra el propio modelo base y su formato original:

| Modelo | Parametros | Contexto | Formato | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FreedomAISVR/Gemma-4-E4B-it-MXFP4-GGUF | 7.518.069.290 segun safetensors (la model card indica ~3-4B) | 131.072 tokens | GGUF MXFP4 + mmproj F16 | 4,8 GB + 945 MB | Apache 2.0 | Repositorio con 0 descargas |
| google/gemma-4-E4B-it (modelo base) | 7.518.069.290 segun safetensors | 131.072 tokens | safetensors (F16 de referencia: 15,0 GB) | no disponible en detalle | Apache 2.0 | Modelo oficial de Google DeepMind |
| Otras cuantizaciones GGUF del mismo base | no disponible | 131.072 tokens (heredado) | GGUF | no disponible | Apache 2.0 (heredada) | no disponible |

No se dispone de informacion sobre alternativas de otros fabricantes (Qwen, Llama, Mistral u otros) con las que comparar en la misma categoria y tamano: no disponible.

## Limitaciones y advertencias

- Discrepancia de parametros sin resolver: los safetensors del modelo base declaran 7.518.069.290 parametros, mientras que la model card describe el modelo como "~3B (Efficient 4B-class)". Esto afecta directamente a las estimaciones de VRAM y al encaje en GPU, por lo que conviene verificar el consumo real antes de planificar un despliegue.
- Adopcion nula: el repositorio acumula 0 descargas y 0 likes, y fue publicado el 18 de septiembre de 2026. No hay validacion independiente de la calidad de la cuantizacion ni de la fidelidad respecto al F16 original.
- Riesgo de degradacion por cuantizacion: la conversion a 5,37 bits por peso puede introducir perdida de calidad respecto al F16 de 15,0 GB. El autor no aporta ninguna evaluacion de calidad (perplejidad, benchmarks ni comparaciones cualitativas) que permita acotar ese impacto.
- Ausencia de datos sobre sesgos: no hay informacion sobre sesgos conocidos, composicion del dataset de entrenamiento ni procesos de alineamiento del modelo base.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es un riesgo inherente a los modelos generativos de este tamano; no debe usarse como fuente de verdad sin verificacion.
- Idioma: la model card no declara idiomas soportados. El soporte multilingue, y en particular del castellano, no esta documentado.
- Tool calling y agentes: no se documenta soporte de function calling ni de razonamiento multi-paso, por lo que no conviene asumirlos en produccion.
- Dependencia de hardware reciente: el autor recomienda GPUs RTX 50 (Blackwell) para la aceleracion de MXFP4. El rendimiento en A100, H100 o GPUs de generaciones anteriores no esta documentado, y podria degradarse.
- Dependencia de versiones concretas: las velocidades reportadas se obtuvieron con `llama.cpp` en master, CUDA 13.2 y `--cache-type-k/v q8_0`. Otras combinaciones pueden dar resultados distintos.
- Configuracion de contexto largo exigente: 128K de contexto requiere activar Flash Attention y cuantizar la cache KV; sin ello el consumo de VRAM se dispara.
- Licencia: Apache 2.0 en el modelo base y en esta cuantizacion, lo que en principio permite uso comercial. Se recomienda revisar los terminos de Google DeepMind aplicables al modelo base, que no se detallan en esta model card.
- Busqueda web sin resultados utiles: los resultados de busqueda disponibles no guardan relacion con el modelo (contenido no pertinente), por lo que no aportan enlaces ni datos verificables.
- Origen de la cuantizacion: se trata de una publicacion de un tercero (FreedomAISVR), no de Google DeepMind, por lo que no cuenta con el respaldo del desarrollador del modelo original.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/FreedomAISVR/Gemma-4-E4B-it-MXFP4-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Perfil del autor de la cuantizacion: https://huggingface.co/FreedomAISVR
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper, blog oficial, demo o articulo tecnico del modelo base: no disponible en la informacion proporcionada.

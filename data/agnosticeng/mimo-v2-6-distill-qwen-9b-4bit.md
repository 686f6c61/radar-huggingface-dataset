# agnosticeng/MiMo-V2.6-Distill-Qwen-9B-4bit

## Resumen

MiMo-V2.6-Distill-Qwen-9B-4bit es una cuantizacion de 4 bits en formato MLX del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario agnosticeng. Se trata de un modelo multimodal de imagen-texto-a-texto (pipeline `image-text-to-text`) construido sobre la clase `Qwen3_5ForConditionalGeneration` (`qwen3_5`), es decir, un transformer para generacion condicional que incorpora torre de vision. El checkpoint conserva la torre de vision completa, por lo que admite tanto indicaciones de texto como entradas con imagen a traves del procesador `Qwen3VLProcessor`.

El problema que resuelve es el de ejecutar un modelo de ~9.400 millones de parametros con requisitos de memoria reducidos en hardware Apple Silicon. Para ello aplica cuantizacion afin de 4 bits con `mx.quantize` y un tamano de grupo de 64, lo que da una media efectiva de 5,059 bits por peso en el conjunto del modelo. El resultado son dos ficheros safetensors: uno de ~5,0 GB para el modelo de lenguaje y otro de ~0,6 GB para la torre de vision, dentro de un repositorio de 11,0 GB.

Es relevante ahora porque permite inferencia multimodal local y sin conexion en equipos de sobremesa y portatiles de Apple, con licencia MIT y sin dependencia de GPU NVIDIA. En el momento de redactar esta ficha el repositorio no tiene descargas ni likes registrados, y no se han publicado resultados de benchmarks ni una evaluacion independiente del error de cuantizacion, por lo que su validacion publica es todavia muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (`qwen3_5`); transformer multimodal con torre de vision; la model card menciona convoluciones GatedDeltaNet |
| Parametros totales | 9.409.813.744 (~9,4 mil millones) |
| Parametros activos | No procede: la informacion disponible no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Afin de 4 bits (MLX `mx.quantize`), grupo de 64; 5,059 bits por peso efectivos de media. Solo se cuantizan las capas lineales; embeddings, normalizaciones, el patch embedder y la convolucion GatedDeltaNet permanecen en su precision original |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors en formato MLX, dos particiones (`model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`) con `model.safetensors.index.json` |
| Tamano del repositorio | 11,0 GB |
| Biblioteca de inferencia | `mlx` / `mlx-vlm` (se requiere soporte de `qwen3_5`, v0.6.16 o superior) |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B |
| Procesadores incluidos | `preprocessor_config.json` (imagen), `video_preprocessor_config.json` (video), `processor_config.json` (`Qwen3VLProcessor`) y `chat_template.jinja` |

## Arquitectura y entrenamiento

La arquitectura es la definida por el modelo base: un transformer condicional de la familia `qwen3_5` con configuracion dual (`text_config` y `vision_config`) y una torre de vision dedicada que habilita la generacion de texto a partir de imagenes. La model card del checkpoint cuantizado indica explicitamente que las convoluciones GatedDeltaNet y el patch embedder de vision no se cuantizan, lo que sugiere una arquitectura hibrida con componentes convolucionales o de estado recurrente junto a las capas de atencion habituales. El checkpoint publicado no incluye pesos MTP (multi-token prediction), por lo que no dispone de cabeza borrador ni de decodificacion especulativa integrada.

En cuanto al entrenamiento, esta ficha no dispone de informacion sobre el numero de tokens, la composicion del dataset ni el uso de RLHF o DPO en el modelo base; la model card solo indica que se trata de un modelo destilado (el nombre incluye "Distill") a partir de un modelo Qwen de 9B. El proceso aplicado en este repositorio es exclusivamente de cuantizacion: se genero con `mlx_vlm.convert -q --q-bits 4 --q-group-size 64` a partir del original en bf16. La unica validacion declarada es una prueba de humo en Apple Silicon con indicaciones de texto e imagen (por ejemplo, la descripcion correcta de una imagen de la Estatua de la Libertad); el error de cuantizacion no se ha evaluado de forma independiente.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat incluida (`chat_template.jinja`) y soporte multi-turno a traves de `apply_chat_template`.
- Comprension de imagenes: el pipeline declarado es `image-text-to-text` e incluye la torre de vision (`model-00002-of-00002.safetensors`, ~0,6 GB).
- Procesamiento de video: el repositorio incluye `video_preprocessor_config.json`, lo que indica soporte de entrada de video a nivel de procesador, aunque no se documenta su calidad ni sus limites.
- Uso solo texto: segun la model card, las indicaciones de texto funcionan igual sin pasar `--image`.
- Razonamiento y generacion de codigo o matematicas: no disponibles como capacidades verificadas en la informacion proporcionada.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible; la ausencia de pesos MTP descarta el uso de decodificacion especulativa con cabeza borrador propia.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Modo "thinking": no documentado.

## Casos de uso

- Asistente visual local en Mac: cargando el modelo con `mlx_vlm` en un equipo Apple Silicon, se pueden describir capturas de pantalla o fotografias sin enviar datos a servicios externos, algo relevante para material confidencial. La torre de vision incluida y el peso total reducido (unos 5,6 GB de pesos) lo hacen viable en memoria unificada de 16 GB o mas.
- Descripcion automatica de catalogos de producto: generacion de pies de foto y metadatos a partir de imagenes en lotes nocturnos, usando el modo sin conexion y la licencia MIT para integrarlo en un CMS propio.
- Accesibilidad: conversion de imagenes y capturas en descripciones textuales para lectores de pantalla en aplicaciones de macOS, con la ventaja de que la inferencia puede ejecutarse en el propio dispositivo.
- Preprocesado de documentos escaneados: extraccion de una descripcion textual estructurada de facturas, albaranes o formularios fotografiados antes de pasarlos a un pipeline de OCR especializado, aprovechando la comprension de imagen del modelo.
- Prototipado rapido de aplicaciones multimodales: gracias a la API de `mlx_vlm` (`load`, `generate`, `apply_chat_template`), sirve como banco de pruebas para validar ideas de producto en un portatil antes de justificar el coste de inferencia en servidores con GPU.
- Analisis de fotogramas de video en local: el procesador de video incluido permite alimentar secuencias y obtener resumenes textuales de escenas, util para etiquetado de archivos multimedia personales o de archivo.
- Educacion y estudio asistido: transcripcion y explicacion de fotografias de pizarra, diagramas o ejercicios, con la ventaja de no requerir conectividad en aulas o entornos sin red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona una prueba de humo cualitativa en Apple Silicon (descripcion correcta de una imagen de la Estatua de la Libertad) y senala explicitamente que el error de cuantizacion no se ha evaluado de forma independiente.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Evaluaciones multimodales (MMMU, DocVQA, etc.) | No disponible |
| Error de cuantizacion medido | No disponible |

## Requisitos de hardware

- Inferencia exclusivamente en Apple Silicon: el repositorio esta en formato MLX, por lo que no es ejecutable directamente en GPU NVIDIA o AMD sin una conversion previa no documentada.
- VRAM / memoria unificada estimada: los pesos suman aproximadamente 5,0 GB (modelo de lenguaje) mas 0,6 GB (torre de vision). Con cache KV, estados de atencion y overhead del runtime, se recomienda un minimo de 16 GB de memoria unificada; 24-32 GB ofrecen margen para contextos largos o varias conversaciones simultaneas.
- Tamano en disco: el repositorio ocupa 11,0 GB, ya que incluye tanto los pesos cuantizados como los ficheros auxiliares del procesador y el tokenizador.
- Equipos compatibles: Mac con chip de la familia M (M1, M2, M3, M4) y 16 GB o mas de memoria unificada. No cabe en configuraciones de 8 GB sin riesgo de paginacion a disco.
- Despliegue: `mlx-vlm` en version 0.6.16 o superior, mediante `mlx_vlm.generate` en linea de comandos o la API de Python (`mlx_vlm.load`, `generate`, `prompt_utils.apply_chat_template`, `utils.load_config`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles. La model card no aporta cifras de tokens por segundo ni de tiempo de prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| agnosticeng/MiMo-V2.6-Distill-Qwen-9B-4bit | 9.409.813.744 | No disponible | 4 bits MLX, 5,059 bits/peso efectivos | MIT | Safetensors MLX | Publico en HuggingFace, 0 descargas |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (base) | 9.409.813.744 (mismo modelo en precision completa) | No disponible | bf16 | MIT segun los tags del derivado | Safetensors | Publico en HuggingFace |
| Otros VLM de ~7-9B cuantizados a 4 bits en formato MLX | No disponible | No disponible | 4 bits | No disponible | Safetensors MLX | No disponible |

No se dispone de datos de rendimiento de ninguno de los modelos comparados en la informacion proporcionada, por lo que la comparativa se limita a parametros, precision, licencia y formato. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo o su modelo base: los enlaces recuperados corresponden a contenidos sin relacion (manuales de equipos, faros de tractores de equipaje y resultados de busqueda genericos), por lo que no se han utilizado como fuente.

## Limitaciones y advertencias

- No hay benchmarks publicados ni evaluacion independiente del error de cuantizacion; la unica validacion es una prueba de humo cualitativa declarada por el autor.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad ni informes de fallos en produccion.
- El checkpoint carece de pesos MTP, de modo que no se puede emplear decodificacion especulativa con cabeza borrador propia para acelerar la generacion.
- No se especifican la longitud de contexto soportada ni los idiomas cubiertos; cualquier uso multilingue o con contexto largo debe validarse empiricamente antes de llevarlo a produccion.
- Riesgo de alucinacion propio de los modelos generativos multimodales: puede describir objetos o texto inexistentes en la imagen, especialmente en documentos densos o imagenes de baja calidad.
- Sesgos: no se documenta ninguna evaluacion de sesgos sociales, culturales o de representacion. El modelo hereda los sesgos del modelo base y de sus datos de destilacion, que no se detallan.
- Licencia MIT declarada tanto en el modelo base como en este derivado, lo que en principio permite uso comercial; aun asi, conviene verificar los terminos vigentes del repositorio base antes de distribuirlo en un producto.
- Dependencia de la libreria `mlx-vlm` en version 0.6.16 o superior: versiones anteriores no soportan `qwen3_5` y fallaran al cargar el modelo.
- Formato no portable: al ser un checkpoint MLX, no se puede ejecutar directamente en CUDA. Su uso en servidores con GPU exigiria una conversion adicional que no se documenta en la informacion disponible.
- La cuantizacion deja sin cuantizar embeddings, normalizaciones, el patch embedder y la convolucion GatedDeltaNet, lo que eleva la media efectiva a 5,059 bits por peso y reduce el ahorro de memoria respecto a una cuantizacion completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agnosticeng/MiMo-V2.6-Distill-Qwen-9B-4bit
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Libreria de inferencia: `mlx-vlm` (requiere soporte de `qwen3_5`, v0.6.16+); no se proporciona enlace en la informacion disponible
- Papers, blogs, repositorios o demos adicionales: no disponibles. La busqueda web no devolvio resultados relevantes sobre este modelo.

# Chopinab/SmolVLM2-2.2B-Instruct-Q4_K_M-GGUF

## Resumen

Esta ficha describe la version cuantizada en formato GGUF del modelo SmolVLM2-2.2B-Instruct, publicada por el usuario Chopinab en HuggingFace. Se trata de una conversion del checkpoint original de HuggingFaceTB (SmolVLM2-2.2B-Instruct) realizada con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, en la cuantizacion Q4_K_M. El objetivo es permitir la ejecucion de un modelo de vision-lenguaje (image-text-to-text y video-text-to-text) en hardware de consumo y en CPU, sin necesidad de GPUs de gama alta.

El modelo base es un VLM multimodal de la familia SmolVLM2, disenado para tareas que combinan imagen o video con texto: descripcion de imagenes, respuesta a preguntas visuales, extraccion de informacion de documentos y comprension de clips de video. La ficha declara 1.812.563.968 parametros reales en los pesos safetensors del modelo base, un tamano de repositorio de 1,1 GB y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El unico idioma declarado es el ingles.

Su relevancia actual radica en la combinacion de tres factores: tamano reducido (apto para portatiles, mini-PC y dispositivos edge), formato GGUF compatible con el ecosistema llama.cpp y licencia permisiva. Para desarrolladores que necesitan un VLM ligero para prototipado rapido, procesamiento local con requisitos de privacidad o pipelines de captioning a gran escala, esta cuantizacion reduce la barrera de entrada de hardware de forma notable. Como contrapartida, se trata de un repositorio derivado con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks propios publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje); detalles de composicion interna no disponibles en la informacion proporcionada |
| Parametros totales | 1.812.563.968 (dato real de safetensors del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el ejemplo de la model card para llama-server usa `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (unico archivo GGUF publicado en este repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `smolvlm2-2.2b-instruct-q4_k_m.gguf`); el modelo base original esta en safetensors |
| Tamano del repositorio | 1,1 GB |
| Pipeline declarado | image-text-to-text (con soporte etiquetado tambien como video-text-to-text) |
| Autor de la conversion | Chopinab |
| Modelo base | HuggingFaceTB/SmolVLM2-2.2B-Instruct |
| Libreria declarada | transformers (etiqueta del repo); inferencia via llama.cpp |
| Fecha de creacion | 2026-09-18 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna mas alla de las etiquetas de HuggingFace, que lo clasifican como modelo multimodal de tipo image-text-to-text y video-text-to-text. La informacion disponible no detalla el numero de capas, la composicion exacta del codificador de vision ni el mecanismo de proyeccion entre modalidades. Lo que si se puede afirmar con los datos aportados es que se trata de un transformer multimodal derivado de HuggingFaceTB/SmolVLM2-2.2B-Instruct, con 1.812.563.968 parametros en sus pesos originales y convertido a GGUF mediante llama.cpp en el espacio GGUF-my-repo de ggml.ai.

Respecto al entrenamiento, la model card hereda la lista de datasets del modelo original: HuggingFaceM4/the_cauldron, HuggingFaceM4/Docmatix, lmms-lab/LLaVA-OneVision-Data, lmms-lab/M4-Instruct-Data, HuggingFaceFV/finevideo, MAmmoTH-VL/MAmmoTH-VL-Instruct-12M, lmms-lab/LLaVA-Video-178K, orrzohar/Video-STaR, Mutonix/Vript, TIGER-Lab/VISTA-400K, Enxin/MovieChat-1K_train y ShareGPT4Video/ShareGPT4Video. Esta composicion indica un entrenamiento centrado en instrucciones multimodales (imagen y video), datos de documentos y tareas conversacionales. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la aplicacion de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones tecnicas concretas del modelo base. Cualquier detalle adicional debe consultarse en la model card original enlazada mas abajo.

## Capacidades

- Generacion de texto a partir de imagenes: descripcion de contenido visual, respuesta a preguntas sobre una imagen y razonamiento visual basico.
- Comprension de video: la etiqueta video-text-to-text y los datasets de video del modelo base (finevideo, ShareGPT4Video, MovieChat, Video-STaR) apuntan a tareas de resumen y descripcion de clips.
- Procesamiento de documentos: presencia de Docmatix y the_cauldron en el entrenamiento del modelo base, orientada a extraccion de informacion de documentos escaneados y capturas.
- Conversacion multimodal multi-turno: la etiqueta conversational indica soporte de dialogos encadenados que alternan texto e imagen.
- Capacidades multilingues: limitadas. El unico idioma declarado es el ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Tool calling y function calling: no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Entrada y salida de audio: no soportado segun las etiquetas del repositorio.
- Ejecucion en CPU y en GPU de gama baja: capacidad derivada directamente del formato GGUF y de la cuantizacion Q4_K_M.

## Casos de uso

- Descripcion de imagenes en local sin GPU dedicada: con un archivo GGUF de aproximadamente 1,1 GB, el modelo puede ejecutarse en CPU mediante `llama-cli` o `llama-server`, lo que permite generar pies de foto y descripciones en portatiles, mini-PC o dispositivos edge sin coste de API.
- Captioning masivo para pipelines RAG multimodales: generar descripciones textuales de imagenes de un corpus para indexarlas en un motor de busqueda vectorial, de modo que el texto resultante sea recuperable por un LLM puramente textual.
- Extraccion de informacion de documentos escaneados: dada la presencia de Docmatix y the_cauldron en el entrenamiento del modelo base, puede emplearse para leer recibos, formularios o capturas de pantalla y devolver los campos relevantes en formato estructurado mediante prompt.
- Asistentes visuales on-premise con requisitos de privacidad: en entornos sanitarios, legales o industriales donde las imagenes no pueden salir de la red corporativa, la cuantizacion permite desplegar inferencia completamente local.
- Resumen de clips de video cortos: para generar descripciones automaticas de grabaciones de camaras de seguridad, demos de producto o contenido audiovisual, con la advertencia de que la ventana de contexto y el muestreo de fotogramas deben ajustarse en funcion del hardware.
- Accesibilidad visual: integracion en aplicaciones que describan imagenes a personas con discapacidad visual, ejecutandose en el propio dispositivo del usuario y evitando enviar capturas a servicios externos.
- Preprocesado en pipelines de anotacion de datos: uso como anotador automatico de baja calidad para preetiquetar imagenes antes de una revision humana, reduciendo el coste de construccion de datasets multimodales.
- Prototipado e investigacion en VLM: validacion rapida de hipotesis sobre modelos de vision-lenguaje pequenos antes de escalar a modelos mayores, con un coste de infraestructura minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card de esta cuantizacion ni los metadatos del repositorio incluyen valores de MMLU, HumanEval, GSM8K, MMMU, DocVQA ni ninguna otra metrica. La busqueda web realizada no devolvio enlaces tecnicos relevantes sobre el modelo, por lo que no se dispone de cifras verificables que comparar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB solo para los pesos en Q4_K_M; sumando el contexto, las activaciones y el procesado de imagenes o fotogramas, es razonable planificar entre 2 y 3 GB de memoria total, aunque no se dispone de mediciones oficiales.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU con 4 GB o mas de VRAM deberia poder ejecutarlo (por ejemplo, GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060). En GPUs integradas y en CPU el modelo tambien es viable, con mayor latencia.
- GPU recomendadas para produccion: no se dispone de recomendaciones del autor. Para despliegues con varias peticiones concurrentes serian adecuadas GPU con 8-16 GB o mas (RTX 4070, L4, A10G), aunque no hay datos de throughput publicados.
- Despliegue en CPU: soportado de forma nativa mediante llama.cpp, que es el ecosistema para el que se genero esta cuantizacion.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), llama-cpp-python, LM Studio, Ollama (importando el GGUF) y cualquier runtime compatible con GGUF. vLLM y TGI estan orientados a safetensors y no se garantiza su compatibilidad con esta cuantizacion.
- Instalacion rapida: `brew install llama.cpp` seguido de `llama-cli --hf-repo Chopinab/SmolVLM2-2.2B-Instruct-Q4_K_M-GGUF --hf-file smolvlm2-2.2b-instruct-q4_k_m.gguf`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| Chopinab/SmolVLM2-2.2B-Instruct-Q4_K_M-GGUF (este) | 1.812.563.968 (pesos base) | GGUF Q4_K_M | Apache 2.0 | No disponible | Conversion comunitaria, sin descargas ni benchmarks publicados en el momento de la consulta |
| HuggingFaceTB/SmolVLM2-2.2B-Instruct | 1.812.563.968 | Safetensors | Apache 2.0 | No disponible en la informacion proporcionada | Modelo base oficial; mayor precision numerica y mayor huella de memoria |
| Otros VLM ligeros de la misma categoria (por ejemplo, variantes SmolVLM de menor tamano o VLMs de ~2B de otros laboratorios) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada para establecer una comparacion cuantitativa |

La comparacion significativa que puede hacerse con los datos disponibles es la que enfrenta esta cuantizacion con el checkpoint original del que deriva: misma licencia y mismos parametros, pero menor precision (Q4_K_M frente a los pesos completos) y un tamano de repositorio de 1,1 GB, lo que facilita su despliegue en hardware limitado a costa de una posible perdida de calidad que no se ha medido en ningun benchmark publicado.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de ingles. El uso en castellano u otros idiomas no esta validado y previsiblemente degradara la calidad de las respuestas.
- Perdida de calidad por cuantizacion: Q4_K_M reduce la precision numerica de los pesos. No se han publicado evaluaciones que cuantifiquen el impacto sobre tareas de vision o video.
- Riesgo de alucinacion: como cualquier VLM de ~2B de parametros, puede inventar contenido no presente en la imagen o el video, especialmente en escenas con texto pequeno, multiples objetos o baja resolucion.
- Longitud de contexto no verificada: la informacion disponible no especifica la ventana de contexto soportada; el ejemplo de la model card usa 2048 tokens, lo que limita el analisis de videos largos o conversaciones extensas.
- Procesamiento de video limitado: no se documenta el numero maximo de fotogramas ni la estrategia de muestreo, factores criticos para la calidad en tareas de video.
- Sin tool calling ni function calling documentados: no debe asumirse soporte de agentes o llamadas a herramientas sin validacion previa.
- Repositorio derivado y sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta. Conviene verificar la integridad del archivo GGUF y comparar resultados con el modelo base oficial antes de usarlo en produccion.
- Compatibilidad: al ser GGUF, no es directamente utilizable con frameworks que esperan safetensors (vLLM, TGI, transformers estandar), aunque lleva la etiqueta `transformers` en el repositorio.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe conservar los avisos de licencia y atribucion correspondientes.
- Fecha de creacion inusual: los metadatos indican 2026-09-18, lo que puede deberse a un error de la plataforma o a un reloj mal configurado; conviene no interpretarlo como una fecha real de publicacion.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/Chopinab/SmolVLM2-2.2B-Instruct-Q4_K_M-GGUF
- Modelo base oficial: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes (los resultados devueltos correspondian a paginas genericas de YouTube, sin relacion con el modelo).

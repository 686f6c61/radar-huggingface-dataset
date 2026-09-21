# Chopinab/SmolVLM2-2.2B-Instruct-IQ3_M-GGUF

## Resumen

SmolVLM2-2.2B-Instruct-IQ3_M-GGUF es una cuantizacion en formato GGUF del modelo multimodal HuggingFaceTB/SmolVLM2-2.2B-Instruct, publicada por el usuario Chopinab. La conversion se ha realizado con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, aplicando una cuantizacion de tipo IQ3_M con imatrix (etiqueta "imatrix" en el repositorio), lo que da como resultado un unico fichero de aproximadamente 0,9 GB. El modelo original es un VLM de la familia SmolVLM2 de Hugging Face TB, disenado para tareas de image-text-to-text y video-text-to-text, es decir, entrada de imagenes o video junto con texto y salida de texto.

La relevancia de esta publicacion es practica: el modelo original en precision completa no cabe en muchos entornos de borde, mientras que esta version cuantizada a 3 bits (IQ3_M) reduce el peso del repositorio a menos de 1 GB y permite ejecutar inferencia multimodal sobre CPU o GPU de gama baja mediante llama.cpp, llama-server o bindings compatibles con GGUF. Esto la situa en el segmento de modelos de vision-lenguaje para dispositivos con recursos limitados: moviles, mini-PC, Raspberry Pi o portatiles sin GPU dedicada.

El dato de parametros del repositorio (safetensors) es de 1.812.563.968 parametros, inferior a los 2,2B que sugiere el nombre comercial del modelo base, por lo que conviene tratar la cifra de "2.2B" como denominacion de la familia y no como recuento exacto de parametros del fichero. La licencia es Apache 2.0 y el idioma declarado es unicamente ingles. El modelo base declara un entrenamiento sobre un conjunto amplio de datasets multimodales (The Cauldron, Docmatix, LLaVA-OneVision-Data, LLaVA-Video-178K, ShareGPT4Video, entre otros).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (encoder de vision + conector + modelo de lenguaje); el detalle de los componentes no se especifica en la model card |
| Parametros totales | 1.812.563.968 (recuento en safetensors del repositorio); el nombre comercial indica 2.2B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de servidor de la model card usa `-c 2048` |
| Tipos de cuantizacion | IQ3_M con imatrix (fichero `smolvlm2-2.2b-instruct-iq3_m-imat.gguf`) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 0,9 GB |
| Pipeline declarado | image-text-to-text (etiquetas: video-text-to-text, conversational) |
| Modelo base | HuggingFaceTB/SmolVLM2-2.2B-Instruct |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

No se dispone de detalles de arquitectura mas alla de lo declarado en la model card, que se limita a indicar que se trata de una conversion a GGUF del modelo HuggingFaceTB/SmolVLM2-2.2B-Instruct mediante llama.cpp y el espacio GGUF-my-repo. Por las etiquetas del repositorio (`image-text-to-text`, `video-text-to-text`, `conversational`) y el pipeline declarado, se trata de un modelo transformer multimodal capaz de procesar imagenes y video corto junto a instrucciones de texto y generar respuestas en lenguaje natural. No se especifican en la informacion disponible ni el encoder de vision, ni el conector multimodal, ni el backbone de lenguaje empleados.

En cuanto a los datos de entrenamiento, la model card hereda del modelo base la lista de datasets: HuggingFaceM4/the_cauldron, HuggingFaceM4/Docmatix, lmms-lab/LLaVA-OneVision-Data, lmms-lab/M4-Instruct-Data, HuggingFaceFV/finevideo, MAmmoTH-VL/MAmmoTH-VL-Instruct-12M, lmms-lab/LLaVA-Video-178K, orrzohar/Video-STaR, Mutonix/Vript, TIGER-Lab/VISTA-400K, Enxin/MovieChat-1K_train y ShareGPT4Video/ShareGPT4Video. No se indica el numero de tokens de entrenamiento, la composicion porcentual del corpus, ni si se aplicaron etapas de RLHF o DPO. La unica innovacion tecnica documentada en esta publicacion es la propia cuantizacion IQ3_M con matriz de importancia (imatrix), que ajusta los pesos cuantizados a 3 bits usando estadisticas de activacion para reducir la perdida de calidad respecto a una cuantizacion ingenua.

## Capacidades

- Generacion de texto condicionada por imagen: descripcion, respuesta a preguntas visuales (VQA) y seguimiento de instrucciones sobre una imagen de entrada.
- Procesamiento de video: el repositorio declara compatibilidad con el pipeline `video-text-to-text`, orientado a clips de video corto mas que a secuencias largas.
- Conversacion multiturno: la etiqueta `conversational` indica un ajuste de instrucciones que permite mantener dialogos, sujeto a la ventana de contexto configurada.
- Comprension de documentos y diagramas: la inclusion de Docmatix y The Cauldron en el entrenamiento apunta a tareas de OCR ligero, interpretacion de graficos y documentos escaneados.
- Razonamiento visual basico sobre escenas, objetos, relaciones espaciales y texto embebido en la imagen.
- Ejecucion local sin GPU dedicada mediante llama.cpp (CLI y servidor HTTP compatible con la API de OpenAI).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Modos especiales (thinking mode, audio, salida estructurada): no disponible en la informacion proporcionada.

## Casos de uso

- Descripcion de imagenes para accesibilidad: el modelo puede recibir una fotografia y generar una descripcion en lenguaje natural de forma local, sin enviar la imagen a un servicio externo, lo que resulta adecuado para aplicaciones que manejan contenido personal en dispositivos de borde.
- Analisis de clips de video corto: con el pipeline `video-text-to-text` se pueden generar resumenes o responder preguntas sobre grabaciones breves, por ejemplo revision de clips de camaras domesticas o de telefonia movil.
- Extraccion de informacion de documentos escaneados: dado el peso de Docmatix y The Cauldron en el entrenamiento del modelo base, puede emplearse para leer facturas, formularios o capturas y devolver los campos relevantes en texto.
- Asistente de vision en aplicaciones moviles: al ocupar menos de 1 GB en formato GGUF, puede embeberse en una app Android o iOS mediante bindings de llama.cpp para tareas de reconocimiento y descripcion offline.
- Moderacion de contenido visual en preproduccion: clasificacion y descripcion asistida de imagenes subidas por usuarios antes de pasar a revision humana, usando la salida de texto del modelo como primera capa de filtrado.
- Automatizacion de catalogos de producto: generacion de descripciones y atributos a partir de fotografias de producto en lotes, integrable en un script de proceso por lotes con `llama-cli`.
- Prototipado e investigacion en vision-lenguaje: al ser una cuantizacion de bajo peso, permite iterar rapidamente en tareas de evaluacion de VLM sobre hardware modesto antes de escalar al modelo completo en bf16.
- Inspeccion visual en entornos industriales o educativos: transcripcion de etiquetas, paneles o pizarras a partir de fotografias capturadas por operarios, con latencia aceptable al ejecutarse en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica, ni comparaciones con el modelo base en precision completa o con otras cuantizaciones. Tampoco se han encontrado datos de benchmarks en los resultados de la busqueda web, que no devolvieron informacion relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del tamano del repositorio (0,9 GB) mas la cache KV y las activaciones del encoder de vision, se puede estimar un consumo en el rango de 1,5 a 2,5 GB, dependiendo de la longitud de contexto configurada con `-c` y del backend. Es una estimacion, no un dato publicado por el autor.
- GPU de gama alta (A100, H100, RTX 4090): sobredimensionadas para este modelo; funcionaria sin problemas pero con un aprovechamiento muy bajo.
- GPU de consumo: cabe holgadamente en tarjetas con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, e incluso iGPU con memoria unificada).
- CPU: la cuantizacion IQ3_M esta pensada para ejecucion en CPU. El ejemplo oficial usa `llama-server -c 2048`, configuracion apta para equipos de escritorio y mini-PC.
- Dispositivos de borde: el peso por debajo de 1 GB hace viable su despliegue en Raspberry Pi 5, moviles de gama alta y sistemas embebidos con 4 GB de RAM o mas, siempre que exista una build de llama.cpp para la plataforma.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), bindings de llama.cpp para Python u otros lenguajes, y cualquier runtime que lea GGUF. El repositorio declara la etiqueta `endpoints_compatible`. No se documenta soporte para vLLM ni TGI en esta publicacion.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Chopinab/SmolVLM2-2.2B-Instruct-IQ3_M-GGUF (este) | 1.812.563.968 segun safetensors | no disponible | apache-2.0 | GGUF | HuggingFace, 0 descargas |
| HuggingFaceTB/SmolVLM2-2.2B-Instruct (modelo base) | 2,2B segun denominacion comercial | no disponible en la informacion proporcionada | apache-2.0 | safetensors (transformers) | HuggingFace, modelo oficial |
| Otras cuantizaciones GGUF del mismo modelo base | no disponible | no disponible | apache-2.0 | GGUF | no disponible en la informacion proporcionada |
| Otros VLM de ~2B (Qwen2-VL-2B, InternVL2-2B) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

Los resultados de la busqueda web no aportaron informacion sobre modelos alternativos ni comparativas de rendimiento, por lo que la comparativa se limita a los datos disponibles del propio repositorio y de su modelo base.

## Limitaciones y advertencias

- Idioma: el modelo declara unicamente ingles (`language: en`); el rendimiento en castellano no esta garantizado ni documentado. No se han publicado datos de evaluacion multilingue.
- Cuantizacion agresiva: IQ3_M es una cuantizacion de aproximadamente 3 bits. La calidad de las respuestas, especialmente en tareas de OCR fino o razonamiento visual detallado, puede degradarse frente al modelo base en bf16. No se aportan metricas de esa degradacion.
- Riesgo de alucinacion: como cualquier VLM de ~2B, tiende a inventar texto en imagenes, descripciones de objetos ausentes o detalles de escenas ambiguas. En produccion se recomienda verificar las salidas en tareas de extraccion de datos.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni equidad en la informacion disponible. Al entrenarse sobre datasets web a gran escala, es esperable que herede sesgos presentes en esos corpus.
- Contexto y video: la longitud de contexto no esta especificada y el ejemplo oficial arranca el servidor con `-c 2048`. No debe asumirse soporte para videos largos; el uso previsto son clips cortos.
- Licencia: Apache 2.0 permite uso comercial y modificacion siempre que se conserven los avisos de copyright y licencia. Es responsabilidad del integrador verificar las licencias de los datasets de entrenamiento del modelo base si redistribuye derivados.
- Repositorio sin traccion: el repositorio registra 0 descargas y 0 likes, creado y actualizado el mismo dia, lo que reduce la probabilidad de que haya sido validado por terceros o de que existan informes de calidad independientes.
- Soporte de herramientas: no se documenta tool calling ni function calling, por lo que no debe asumirse su uso en pipelines de agentes sin verificacion previa.
- Produccion: no hay datos publicados de latencia, throughput ni consumo energetico, imprescindibles para dimensionar un despliegue real.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/Chopinab/SmolVLM2-2.2B-Instruct-IQ3_M-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo

Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo (los resultados obtenidos corresponden a definiciones del termino frances "soufflage" y no son relevantes), por lo que no se dispone de papers, blogs o demos adicionales que enlazar.

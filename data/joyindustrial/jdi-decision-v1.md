# JoyIndustrial/JDI-Decision-V1

## Resumen

JDI-Decision-V1 es un sistema multimodal de decisión desarrollado por JD Industrials (京东工业), la división industrial de JD.com. No es un modelo generativo al uso: su función es recibir un estado (texto e imágenes), una pregunta con opciones y devolver una elección estructurada junto con las probabilidades asociadas a cada opción. Está construido sobre una base Qwen3.8-27B con adaptaciones de la arquitectura de decisión D3, e incorpora un codificador visual, un componente de reconocimiento de texto PaddleOCR v5 congelado (de Baidu) y un cabezal de lectura en FP32.

El modelo resuelve un problema concreto en entornos industriales y de comercio B2B: la toma de decisiones verificables a partir de documentos, etiquetas, señales y capturas, con salida probabilística en lugar de texto libre. Su relevancia reciente radica en que combina OCR de alto rendimiento con un backbone de 27.000 millones de parámetros y expone una API de inferencia reproducible, con resultados públicos auditables (12.210 peticiones sobre 11 benchmarks) y latencias medidas en hardware H200.

La arquitectura interna se declara como `qwen3_5` en los metadatos del repositorio, mientras que la model card menciona Qwen3.8-27B como base; esta discrepancia no está aclarada en la documentación disponible. El sistema se distribuye en formato safetensors con código personalizado (`trust_remote_code`) y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con adaptaciones de decision D3 sobre base Qwen (metadatos: `qwen3_5`); incluye codificador visual, PaddleOCR v5 congelado y cabezal de lectura FP32 |
| Parametros totales | 26.085.330.160 (~26,09 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el cabezal de salida opera en FP32) |
| Idiomas soportados | no disponible (la model card esta en ingles y chino; el OCR reconoce texto via PaddleOCR v5) |
| Licencia | Apache 2.0 (los pesos y cabeceras de PaddleOCR conservan sus terminos upstream) |
| Formato de pesos | safetensors; tamano del repositorio 52,2 GB; requiere `trust_remote_code=True` |
| Entrada | Estado (texto), preguntas con criterios y opciones, imagenes (decodificadas a RGB y redimensionadas a un limite de pixeles) |
| Salida | Eleccion estructurada entre opciones y probabilidades por opcion |
| Hardware de evaluacion | 2 workers H200, una replica completa del sistema por GPU |

## Arquitectura y entrenamiento

El flujo de inferencia parte de una imagen que se decodifica, se convierte a RGB y se redimensiona hasta un limite de pixeles. A continuacion se ejecutan en paralelo dos ramas sobre una misma GPU: un codificador visual que extrae caracteristicas de la imagen y un componente PaddleOCR v5 congelado que reconoce el texto presente. La transcripcion OCR se incorpora al estado mediante `state.image_text_transcription`, de forma que el texto complementa la informacion visual en lugar de sustituirla. El backbone de decisión procesa conjuntamente caracteristicas visuales, texto, pregunta y opciones, y un cabezal de lectura en FP32 emite la respuesta estructurada y las probabilidades por opcion.

Cada peticion se ejecuta íntegramente en una GPU y las caracteristicas visuales solo se reutilizan dentro de esa misma peticion, lo que simplifica el aislamiento entre solicitudes. La documentacion no especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias; tampoco detalla el proceso de adaptacion de la arquitectura D3 más alla de la guia de reproduccion (`REPRODUCE.md`). El paquete de publicacion paso comparaciones de regresion contra la implementacion original de evaluacion.

## Capacidades

- Clasificacion y eleccion entre opciones definidas por el usuario, con devolucion de probabilidades por opcion en lugar de texto libre.
- Comprension de imagenes mediante un codificador visual dedicado, con gestion estandar de decodificacion, conversion a RGB y redimensionado.
- Reconocimiento de texto en imagen integrado mediante PaddleOCR v5, con la transcripcion inyectada en el estado de la peticion.
- Razonamiento multimodal sobre documentos, etiquetas, carteles y capturas combinando senal visual y texto reconocido.
- Salida estructurada apta para consumo programatico (respuesta y probabilidades separadas del payload bruto).
- Carga via `AutoModel.from_pretrained(..., trust_remote_code=True)`, incluyendo el componente OCR interno congelado.
- Soporte de multiples preguntas por peticion mediante el diccionario `questions` con criterios por opcion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles como dato explicito; el reconocimiento de texto depende de las coberturas de PaddleOCR v5.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Verificacion documental en cadena de suministro: el sistema recibe la imagen de un albaran o etiqueta de envio, ejecuta OCR sobre el texto impreso y responde a preguntas del tipo "que codigo de producto figura en la etiqueta" eligiendo entre las referencias esperadas, con probabilidad asociada para auditar la confianza.
- Control de calidad visual en linea de produccion: ante una captura de una pieza o un panel de senalizacion, el modelo elige entre categorias de defecto o estado (conforme, no conforme, ilegible) y devuelve la probabilidad, lo que permite fijar umbrales de escalado a revision humana.
- Inspeccion de senalizacion y seguridad: lectura de carteles o paneles (por ejemplo, STOP frente a GO en el ejemplo de la model card) para validar el estado de una zona o una instruccion operativa, con latencia media de 326 ms por peticion.
- Enrutado de tickets y solicitudes B2B: clasificar una solicitud entrante con imagen adjunta entre un conjunto cerrado de colas o categorias, usando las probabilidades para derivar los casos de baja confianza a un agente humano.
- Validacion de fichas tecnicas y homologaciones: comparar la informacion visible en una imagen de producto con las opciones declaradas en el catalogo y decidir si la documentacion coincide, aprovechando la rama OCR para extraer referencias y numeros de lote.
- Extraccion de decisiones en comercio industrial: dado un estado con texto e imagenes de un pedido, decidir entre alternativas de tratamiento (aprobado, pendiente de documentacion, rechazado) con probabilidad por clase, integrable en un flujo de aprobacion automatizado.
- Auditoria y reproduccion de evaluaciones: usar `ocr_inference.ComboEngine` como punto de entrada para reconstruir la suite publica de vision y verificar resultados contra `results.jsonl`, util en equipos que necesiten validar el sistema antes de adoptarlo.

## Benchmarks y rendimiento

La model card reporta una puntuacion propia en la suite publica Decision Index Vision de **79,7313**, con 12.210 de 12.210 peticiones exitosas sobre 11 benchmarks. El autor indica explicitamente que se trata de una puntuacion publica autodeclarada, no de un puesto confirmado en un leaderboard ni de la puntuacion completa (Full). La evaluacion privada y la validacion oficial de latencia en RTX PRO 6000 estan pendientes.

| Metrica de latencia (incluye decodificacion, OCR, codificacion visual y forward de decision) | Valor |
|---|---:|
| Media | 326,0 ms |
| P50 | 263,4 ms |
| P80 | 401,1 ms |
| P90 | 583,0 ms |

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 52,2 GB en safetensors, por lo que la carga completa en precision de publicacion supera con holgura las GPU de consumo; el sistema requiere una GPU CUDA con una replica completa por dispositivo.
- GPU de evaluacion: 2 workers H200, cada uno con una replica completa del sistema y una peticion simultanea por GPU.
- Validacion oficial de latencia en RTX PRO 6000: pendiente segun la model card.
- GPU de consumo: no hay datos publicados que confirmen que el sistema completo quepa en GPU de consumo (RTX 4090 u otras); no disponible.
- Despliegue: entrada de reproduccion `ocr_inference.ComboEngine` para el sistema completo; `inference.D3Engine` para el modelo de decision interno sin el procesamiento OCR del sistema completo. Tambien soporta `AutoModel.from_pretrained` con `trust_remote_code=True`.
- Entorno: Python 3.12 sobre GPU CUDA, con entorno virtual dedicado (`.venv-ocr`) e instalacion previa segun `REPRODUCE.md`.
- Throughput: una peticion a la vez por GPU en la configuracion evaluada; no se publica throughput agregado.
- Latencia de extremo a extremo: media 326,0 ms; P50 263,4 ms; P90 583,0 ms (H200).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JDI-Decision-V1 | ~26,09 mil millones | no disponible | Decision multimodal con salida probabilistica, OCR integrado | Apache 2.0 | Hugging Face (JoyIndustrial/JDI-Decision-V1) |
| Qwen3.8-27B (base declarada) | orden de 27 mil millones | no disponible | LLM generativo de proposito general | no disponible en esta ficha | no disponible en esta ficha |
| Alternativas de clasificacion multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento de modelos comparables, por lo que no es posible establecer una comparacion cuantitativa de calidad. La comparacion con la base Qwen3.8-27B es estructural (el sistema parte de ella y anade ramas de vision y OCR con un cabezal de decision), no de rendimiento.

## Limitaciones y advertencias

- La puntuacion de 79,7313 en Decision Index Vision es autodeclarada por el autor y no equivale a un rango confirmado en leaderboard ni a la puntuacion Full; la evaluacion privada esta pendiente.
- La validacion oficial de latencia en RTX PRO 6000 no se ha completado; las cifras de latencia proceden de H200 y no son extrapolables sin medir.
- Discrepancia documental sobre la base: los metadatos indican `qwen3_5` y la model card menciona Qwen3.8-27B. Conviene verificar la configuracion exacta antes de desplegar.
- No se publican datos sobre sesgos, composicion del dataset de entrenamiento ni procesos de alineacion (RLHF/DPO), lo que limita la evaluacion de riesgos de alucinacion o comportamiento fuera de distribucion.
- El modelo esta disenado para elegir entre opciones suministradas; no debe asumirse capacidad de generacion abierta ni de razonamiento multi-paso, ya que no esta documentada.
- Cobertura linguistica no declarada: el rendimiento en castellano, tanto en la rama de decision como en el OCR, no esta medido en la informacion disponible.
- El componente PaddleOCR v5 es congelado y sus pesos y cabeceras de compilacion de Paddle conservan los terminos de licencia upstream, que deben revisarse por separado de la licencia Apache 2.0 del conjunto.
- La carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de usarlo en produccion.
- Cada peticion se ejecuta en una unica GPU y las caracteristicas visuales no se comparten entre peticiones, lo que limita la reutilizacion de cache en escenarios de alto volumen.
- El repositorio pesa 52,2 GB, lo que condiciona el almacenamiento y el tiempo de carga en despliegues con multiples replicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoyIndustrial/JDI-Decision-V1
- Copia/duplicado en Hugging Face: https://huggingface.co/stupid-zwl/JDI-Decision-V1
- Organizacion JD Industrials: https://www.jingdongindustrials.com/
- Dataset de resultados publicos: https://huggingface.co/datasets/stupid-zwl/JDI-Decision-V1/tree/427820d71f624baac1c747e9b484a75a8f744ba6/runs/vision-paddle-v5
- Guia de reproduccion: `REPRODUCE.md` (incluido en el repositorio del modelo)
- Fuentes y hashes del OCR: `ocr_inference/ocr_sources.json` (incluido en el repositorio del modelo)
- Arquitectura del sistema: `assets/architecture.en.cleaned.png` (incluido en el repositorio del modelo)

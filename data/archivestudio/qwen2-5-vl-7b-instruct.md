# ArchiveStudio/Qwen2.5-VL-7B-Instruct

## Resumen

Qwen2.5-VL-7B-Instruct es un modelo multimodal de tipo imagen-texto-a-texto desarrollado por el equipo Qwen (Alibaba) y publicado en este repositorio por el usuario ArchiveStudio. Se trata de la version de 7.000 millones de parametros, ajustada por instrucciones, de la familia Qwen2.5-VL, que se presento como evolucion de Qwen2-VL tras cinco meses de uso por parte de la comunidad. El modelo combina un codificador visual ViT con un LLM Qwen2.5 y su objetivo es cubrir tareas de comprension visual avanzada: reconocimiento de objetos, lectura de documentos, graficos e iconos, localizacion espacial y uso como agente visual.

La propuesta diferencial de esta version es su caracter agentico: puede operar como agente visual que razona y dirige herramientas de forma dinamica, con capacidades declaradas de computer use y phone use. Ademas incorpora comprension de video de mas de una hora con localizacion temporal de eventos, salidas estructuradas en JSON para facturas, formularios y tablas, y grounding visual mediante cajas delimitadoras o puntos.

El repositorio concreto analizado tiene 8.292.166.656 parametros reales, un tamano de 16,6 GB en safetensors, licencia Apache 2.0 y cero descargas registradas en el momento de la consulta. Los metadatos declaran unicamente el idioma ingles, aunque la model card original de Qwen describe una familia con versiones de 3B, 7B y 72B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language: codificador ViT con window attention, SwiGLU y RMSNorm, acoplado a un LLM Qwen2.5; mRoPE con IDs temporales y alineacion de tiempo absoluto |
| Parametros totales | 8.292.166.656 (8,29 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repositorio solo contiene safetensors) |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 16,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (segun el repositorio) | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de Qwen2.5-VL: un codificador visual ViT optimizado al que se le introduce window attention para acelerar tanto el entrenamiento como la inferencia, y cuyo diseno se alinea con el del LLM mediante SwiGLU y RMSNorm. La parte de lenguaje es un transformer Qwen2.5. Para el tratamiento del video, el modelo extiende la resolucion dinamica a la dimension temporal mediante muestreo dinamico de FPS, lo que le permite comprender videos a distintas tasas de muestreo. En consecuencia, el mRoPE se actualiza en la dimension temporal con IDs y alineacion de tiempo absoluto, de modo que el modelo aprende secuencia temporal y velocidad, y adquiere la capacidad de senalar momentos concretos dentro de un video.

La model card describe la incorporacion de capacidades de analisis de texto, graficos, iconos, disenos y layouts dentro de imagenes, ademas de grounding visual en distintos formatos (cajas delimitadoras o puntos) con salidas JSON estables para coordenadas y atributos. El repositorio corresponde a la variante ajustada por instrucciones de 7B. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni el uso concreto de RLHF o DPO; la unica indicacion es que se trata de la version instruction-tuned.

## Capacidades

- Generacion de texto e interaccion conversacional multimodal con imagenes y videos como entrada.
- Reconocimiento visual de objetos comunes (flores, aves, peces, insectos) y analisis de textos, graficos, iconos, elementos graficos y layouts dentro de imagenes.
- Comprension de documentos: OCR sobre documentos, facturas, formularios y tablas, con salida estructurada de su contenido.
- Grounding visual: localizacion precisa de objetos generando cajas delimitadoras o puntos, con salidas JSON estables de coordenadas y atributos.
- Comprension de video de mas de una hora, incluida la capacidad de capturar eventos senalando los segmentos relevantes del video.
- Comportamiento agentico: el modelo puede actuar como agente visual que razona y dirige herramientas de forma dinamica.
- Capacidades declaradas de computer use y phone use (interaccion con interfaces de escritorio y moviles).
- Ejecucion de tareas de interfaz medidas en benchmarks como ScreenSpot, AITZ, Android Control, AndroidWorld y MobileMiniWob++.
- Razonamiento matematico y cientifico sobre imagenes (evaluado en MathVista y MathVision).
- Capacidades multilingues: no disponibles en la informacion del repositorio, que declara unicamente ingles.

## Casos de uso

- Digitalizacion de facturas y formularios: el modelo genera salidas estructuradas del contenido de escaneos de facturas, formularios y tablas, lo que permite alimentar directamente sistemas de gestion financiera o contable sin postprocesado manual.
- Extraccion de datos de documentos con estructura variable: gracias a la lectura de textos, tablas y layouts dentro de la imagen, se puede usar para convertir informes escaneados en JSON con campos y atributos definidos.
- Automatizacion de back office en comercio y finanzas: la capacidad de analisis de tablas y graficos permite resumir informes financieros y extraer series de datos a partir de capturas o PDF renderizados.
- Agente de automatizacion de interfaz de escritorio: con ScreenSpot (84,7) y ScreenSpot Pro (29,0) como referencia, el modelo puede localizar elementos de pantalla y dirigir acciones en flujos de computer use.
- Automatizacion de tareas en movil: con Android Control (60,1 en High_EM, 93,7 en Low_EM) y MobileMiniWob++ (91,4 de tasa de exito), es adecuado para agentes que ejecutan instrucciones sobre aplicaciones moviles.
- Analisis de video largo con localizacion de eventos: la comprension de videos de mas de una hora y el etiquetado temporal permiten buscar momentos concretos en grabaciones de vigilancia, retransmisiones o sesiones largas.
- Moderacion y auditoria visual de contenido: la lectura de texto incrustado en imagenes (OCRBench 864) y la deteccion de objetos permiten revisar automaticamente material grafico en plataformas.
- Asistencia educativa sobre material visual: MathVista (68,2) y MathVision (25,07) indican capacidad para resolver problemas planteados en diagramas y figuras, util en tutoria de matematicas y ciencias.
- Analisis de graficos de negocio: ChartQA (87,3) e InfoVQA (82,6) lo hacen util para responder preguntas sobre paneles de control y graficos de series temporales.
- Integracion en pipelines de agentes con tool calling: al poder dirigir herramientas dinamicamente, encaja como modulo de percepcion y decision en orquestadores multi-paso.

## Benchmarks y rendimiento

Resultados de referencia de imagen publicados en la model card:

| Benchmark | InternVL2.5-8B | MiniCPM-o 2.6 | GPT-4o-mini | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|---|---|---|
| MMMU (val) | 56 | 50,4 | 60 | 54,1 | 58,6 |
| MMMU-Pro (val) | 34,3 | no disponible | 37,6 | 30,5 | 41,0 |
| DocVQA (test) | 93 | 93 | no disponible | 94,5 | 95,7 |
| InfoVQA (test) | 77,6 | no disponible | no disponible | 76,5 | 82,6 |
| ChartQA (test) | 84,8 | no disponible | no disponible | 83,0 | 87,3 |
| TextVQA (val) | 79,1 | 80,1 | no disponible | 84,3 | 84,9 |
| OCRBench | 822 | 852 | 785 | 845 | 864 |
| CC_OCR | 57,7 | no disponible | no disponible | 61,6 | 77,8 |
| MMStar | 62,8 | no disponible | no disponible | 60,7 | 63,9 |
| MMBench-V1.1-En (test) | 79,4 | 78,0 | 76,0 | 80,7 | 82,6 |
| MMT-Bench (test) | no disponible | no disponible | no disponible | 63,7 | 63,6 |
| MMVet (GPT-4-Turbo) | 54,2 | 60,0 | 66,9 | 62,0 | 67,1 |
| HallBench (avg) | 45,2 | 48,1 | 46,1 | 50,6 | 52,9 |
| MathVista (testmini) | 58,3 | 60,6 | 52,4 | 58,2 | 68,2 |
| MathVision | no disponible | no disponible | no disponible | 16,3 | 25,07 |

Resultados de video:

| Benchmark | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|
| MVBench | 67,0 | 69,6 |
| PerceptionTest (test) | 66,9 | 70,5 |
| Video-MME (wo/w subs) | 63,3 / 69,0 | 65,1 / 71,6 |
| LVBench | no disponible | 45,3 |
| LongVideoBench | no disponible | 54,7 |
| MMBench-Video | 1,44 | 1,79 |
| TempCompass | no disponible | 71,7 |
| MLVU | no disponible | 70,2 |
| CharadesSTA / mIoU | no disponible | 43,6 |

Resultados de agente:

| Benchmark | Qwen2.5-VL-7B |
|---|---|
| ScreenSpot | 84,7 |
| ScreenSpot Pro | 29,0 |
| AITZ_EM | 81,9 |
| Android Control High_EM | 60,1 |
| Android Control Low_EM | 93,7 |
| AndroidWorld_SR | 25,5 |
| MobileMiniWob++_SR | 91,4 |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: alrededor de 16,6 GB solo para los pesos, mas cache KV y el coste del codificador visual; en la practica conviene reservar 20-24 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8,3 GB de pesos, con un presupuesto realista de 12-14 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 4,2 GB de pesos, con un presupuesto realista de 8-10 GB. No se distribuyen ficheros cuantizados en este repositorio, por lo que habria que generarlos.
- GPU recomendadas para produccion: A100 (40 o 80 GB), H100, L40S, con soporte de bf16.
- Cabe en GPU de consumo: si en RTX 4090 o RTX 3090 (24 GB) en bf16 con contexto reducido, y en tarjetas de 12 GB si se aplica cuantizacion de 4 bits.
- Opciones de despliegue: transformers (la model card exige instalar desde el codigo fuente de Hugging Face Transformers para evitar el error `KeyError: 'qwen2_5_vl'`), Text Generation Inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`), y toolkit `qwen-vl-utils` con extra `[decord]` para carga rapida de video. No hay ficheros GGUF publicados en este repositorio, por lo que Ollama o llama.cpp requeririan una conversion previa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMMU (val) | DocVQA (test) | MathVista (testmini) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen2.5-VL-7B (este repositorio) | 8,29 B | no disponible | 58,6 | 95,7 | 68,2 | apache-2.0 | safetensors en HuggingFace |
| Qwen2-VL-7B | no disponible | no disponible | 54,1 | 94,5 | 58,2 | no disponible en la informacion | no disponible en la informacion |
| InternVL2.5-8B | no disponible | no disponible | 56 | 93 | 58,3 | no disponible en la informacion | no disponible en la informacion |
| MiniCPM-o 2.6 | no disponible | no disponible | 50,4 | 93 | 60,6 | no disponible en la informacion | no disponible en la informacion |
| GPT-4o-mini | no disponible | no disponible | 60 | no disponible | 52,4 | propietaria | API |

## Limitaciones y advertencias

- El repositorio pertenece al usuario ArchiveStudio, no al equipo Qwen; se trata de una publicacion de terceros con cero descargas y cero likes, por lo que conviene verificar la integridad de los pesos antes de usarlos en produccion.
- Los metadatos declaran unicamente el idioma ingles; no hay informacion que respalde un uso fiable en castellano u otros idiomas dentro de este repositorio.
- No se especifica la longitud de contexto soportada, lo que impide dimensionar con precision casos de uso con documentos o videos muy largos.
- No se publican tipos de cuantizacion ni ficheros GGUF, lo que limita el despliegue directo en entornos de bajos recursos sin conversion previa.
- La model card advierte de que hace falta instalar Transformers desde el codigo fuente; con versiones antiguas se produce `KeyError: 'qwen2_5_vl'`.
- Los modelos de vision-lenguaje presentan riesgo de alucinacion en la lectura de documentos densos y graficos; HallBench (52,9) y MathVision (25,07) indican margen de mejora en tareas de fidelidad visual y razonamiento matematico complejo.
- Los resultados en tareas de agente son desiguales: ScreenSpot Pro (29,0) y AndroidWorld_SR (25,5) son valores bajos, por lo que la automatizacion de interfaces requiere supervision y validacion.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la responsabilidad sobre los terminos reales del modelo original recae en el publicador; conviene contrastar con la ficha oficial de Qwen.
- No se documentan sesgos especificos, composicion del dataset de entrenamiento ni proceso de alineacion (RLHF/DPO) en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ArchiveStudio/Qwen2.5-VL-7B-Instruct
- Blog oficial de Qwen2.5-VL: https://qwenlm.github.io/blog/qwen2.5-vl/
- Repositorio GitHub de Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL
- Demo de chat: https://chat.qwenlm.ai/
- Referencias arXiv declaradas en los tags del repositorio: arxiv:2309.00071, arxiv:2409.12191, arxiv:2308.12966
- Toolkit de utilidades: `pip install qwen-vl-utils[decord]==0.0.8`
- Los resultados de busqueda web proporcionados no contienen informacion relacionada con este modelo.

# inamik7/habib-conversation-model

## Resumen

`inamik7/habib-conversation-model` es un repositorio publicado en HuggingFace que, segun su propia model card y sus metadatos, contiene los pesos del modelo multimodal Qwen2.5-VL-72B-Instruct: un modelo vision-lenguaje de tipo image-text-to-text, desarrollado originalmente por el equipo Qwen de Alibaba, que acepta imagenes, video y texto como entrada y genera texto. El repositorio suma 73.410.777.344 parametros (unos 73,4 B) en formato safetensors, con un tamano total de 146,8 GB, y declara la arquitectura `qwen2_5_vl` en la libreria transformers.

El modelo resuelve tareas de comprension visual avanzada: lectura de documentos, OCR, interpretacion de graficos y tablas, localizacion de objetos mediante bounding boxes o puntos, comprension de video de mas de una hora con localizacion temporal de eventos y actuacion como agente visual capaz de operar herramientas, interfaces de escritorio y moviles. Es relevante para quien necesite un VLM de gran escala con salidas estructuradas en JSON y soporte de agentes, aunque con un coste de hardware considerable.

Conviene senalar que la model card del repositorio es una copia literal de la de Qwen2.5-VL-72B-Instruct y no documenta ningun proceso de ajuste fino, dataset propio ni evaluacion adicional por parte del autor. El repositorio no registra descargas ni "likes" en el momento de la consulta, y la busqueda web realizada no ha devuelto resultados relacionados con este modelo concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso: codificador ViT con window attention, SwiGLU y RMSNorm, acoplado a un LLM Qwen2.5 con mRoPE alineado en la dimension temporal |
| Parametros totales | 73.410.777.344 (~73,4 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (la model card no la especifica) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors (previsiblemente BF16, dado el tamano de 146,8 GB) |
| Idiomas soportados | Ingles (unico idioma declarado en la model card); el modelo base es multilingue, pero el repositorio no lo detalla |
| Licencia | Qwen (`license: other`, `license_name: qwen`), con enlace al texto legal de Qwen2.5-VL-72B-Instruct |
| Formato de pesos | safetensors; tamano del repositorio 146,8 GB |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Compatibilidad de despliegue | `text-generation-inference`, `endpoints_compatible` (segun tags del repositorio) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de Qwen2.5-VL: un codificador visual ViT acompandado de un LLM tipo Qwen2.5. El ViT incorpora window attention para reducir el coste de entrenamiento e inferencia, y se ha reestructurado con SwiGLU y RMSNorm para alinearse con el bloque del LLM. Para video, el modelo adopta muestreo dinamico de FPS y extiende el mRoPE a la dimension temporal con identificadores y alineamiento a tiempo absoluto, lo que le permite aprender secuencias temporales, velocidad y localizar momentos concretos dentro de un video. La resolucion dinamica se aplica tanto a imagen como a video.

El repositorio corresponde, segun su model card, a la variante instruction-tuned de 72B, la mayor de una familia de tres modelos (3B, 7B y 72B). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se documenta ningun proceso de ajuste fino posterior por parte del autor del repositorio: la model card es identica a la del modelo original y el nombre "habib-conversation-model" no va acompando de descripcion de datos, metodo o evaluacion propia.

## Capacidades

- Comprension visual general: reconocimiento de objetos, especies, iconos, graficos y layouts complejos dentro de imagenes.
- OCR y comprension documental: extraccion de texto en documentos, facturas, formularios y tablas, con salidas estructuradas en JSON.
- Razonamiento matematico sobre imagen: resolucion de problemas a partir de figuras y diagramas (evaluado en MathVista y MathVision).
- Localizacion visual: generacion de bounding boxes y puntos con coordenadas y atributos en JSON estable.
- Comprension de video largo: procesa videos de mas de una hora y localiza segmentos relevantes indicando la marca temporal.
- Uso como agente visual: razonamiento multi-paso y direccion dinamica de herramientas, con capacidad declarada de computer use y phone use.
- Soporte de tool calling / function calling en el marco de su comportamiento agentico.
- Generacion de texto puro y conversacion multi-turno.
- Capacidades multilingues: no detalladas en el repositorio; la model card solo declara ingles.

## Casos de uso

- Digitalizacion de facturas y formularios: el modelo recibe el escaneo y devuelve un JSON con campos, importes y coordenadas de cada region, lo que permite integrarlo en un pipeline de contabilidad sin post-procesado manual de la estructura.
- Automatizacion de atencion al cliente multimodal: el usuario envia una captura de pantalla o una foto del producto y el modelo diagnostica el problema o localiza el elemento relevante en la imagen, manteniendo la conversacion en multiples turnos.
- Analisis de documentos tecnicos y financieros: lectura de informes con tablas y graficos para extraer series de datos y resumir variaciones, aprovechando su rendimiento en DocVQA, ChartQA y CC-OCR.
- Control de calidad industrial por imagen: envio de fotografias de linea de produccion para detectar defectos y devolver las coordenadas del area afectada mediante bounding boxes, lo que facilita el recorte automatico y la trazabilidad.
- Analisis de video de vigilancia o de sesiones largas: localizacion de eventos concretos en grabaciones de mas de una hora mediante marcas temporales, reduciendo el tiempo de revision manual.
- Agente de automatizacion de escritorio o movil: el modelo interpreta la pantalla y decide la siguiente accion sobre la interfaz, util para pruebas de regresion de aplicaciones o para asistentes de accesibilidad.
- Extraccion de informacion de graficos en publicaciones cientificas: conversion de figuras y ejes en tablas de datos utilizables para meta-analisis.
- Moderacion y descripcion de contenido audiovisual: generacion de descripciones y metadatos estructurados para catalogos de imagen y video.

## Benchmarks y rendimiento

Los resultados que se muestran a continuacion provienen de la model card del repositorio, que reproduce la tabla de evaluacion de Qwen2.5-VL-72B-Instruct. No se han publicado evaluaciones independientes de este repositorio concreto.

| Benchmark (imagen) | GPT-4o | Claude 3.5 Sonnet | InternVL2.5-78B | Qwen2-VL-72B | Qwen2.5-VL-72B |
|---|---|---|---|---|---|
| MMMU (val) | 70,3 | 70,4 | 70,1 | 64,5 | 70,2 |
| MMMU-Pro | 54,5 | 54,7 | 48,6 | 46,2 | 51,1 |
| MathVista (MINI) | 63,8 | 65,4 | 76,6 | 70,5 | 74,8 |
| MathVision (FULL) | 30,4 | 38,3 | 32,2 | 25,9 | 38,1 |
| HallusionBench | 55,0 | 55,16 | 57,4 | 58,1 | 55,16 |
| MMBench DEV EN v1.1 | 82,1 | 83,4 | 88,5 | 86,6 | 88,0 |
| AI2D (test) | 84,6 | 81,2 | 89,1 | 88,1 | 88,4 |
| ChartQA (test) | 86,7 | 90,8 | 88,3 | 88,3 | 89,5 |
| DocVQA (val) | 91,1 | 95,2 | 96,5 | 96,1 | 96,4 |
| MMStar | 64,7 | 65,1 | 69,5 | 68,3 | 70,8 |
| MMVet (turbo) | 69,1 | 70,1 | 72,3 | 74,0 | 76,19 |
| OCRBench | 736 | 788 | 854 | 877 | 885 |
| CC-OCR | 66,6 | 62,7 | 64,7 | 68,7 | 79,8 |

| Benchmark (video) | GPT-4o | Gemini-1.5-Pro | InternVL2.5-78B | Qwen2-VL-72B | Qwen2.5-VL-72B |
|---|---|---|---|---|---|
| VideoMME (sin subtitulos) | 71,9 | 75,0 | 72,1 | 71,2 | 73,3 |
| VideoMME (con subtitulos) | 77,2 | 81,3 | 74,0 | 77,8 | 79,1 |
| MVBench | 64,6 | 60,5 | 76,4 | 73,6 | 70,4 |
| MMBench-Video | 1,63 | 1,30 | 1,97 | 1,70 | 2,02 |
| LVBench | 30,8 | 33,1 | no disponible | 41,3 | 47,3 |
| EgoSchema | 72,2 | 71,2 | no disponible | 77,9 | 76,2 |
| PerceptionTest (test) | no disponible | no disponible | no disponible | 68,0 | 73,2 |

## Requisitos de hardware

- Pesos en BF16: 146,8 GB solo para los parametros. No cabe en ninguna GPU de consumo individual ni en una unica A100/H100 de 80 GB con margen para cache KV.
- Configuracion minima realista en BF16: 4 GPU de 80 GB (A100 SXM, H100 SXM o H200) para tener espacio para el cache KV y el procesamiento de multiples imagenes o frames de video.
- Cuantizacion de 8 bits: aproximadamente 73 GB de pesos; requiere 1 GPU de 80 GB en el limite o, preferiblemente, 2 GPU de 80 GB.
- Cuantizacion de 4 bits: aproximadamente 37-45 GB de pesos; puede ejecutarse en una A100 80GB, H100 80GB o RTX 6000 Ada de 48 GB. En 2x RTX 4090 de 24 GB es viable solo con contexto y resolucion de imagen reducidos.
- GPU de consumo: una RTX 4090 de 24 GB no es suficiente ni con cuantizacion agresiva para uso practico; se necesita al menos 48 GB de VRAM agregada.
- Opciones de despliegue: transformers (referencia), vLLM y SGLang para servido de alto rendimiento, TGI (la etiqueta `text-generation-inference` figura en el repositorio) y Hugging Face Inference Endpoints (`endpoints_compatible`). Para cuantizacion ligera en local hacen falta conversiones GGUF/AWQ/GPTQ de la comunidad, no incluidas en este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMMU (val) | DocVQA (val) | OCRBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| habib-conversation-model (Qwen2.5-VL-72B-Instruct) | ~73,4 B | no disponible | 70,2 | 96,4 | 885 | Qwen | Repositorio HuggingFace, 0 descargas |
| Qwen2-VL-72B | no disponible | no disponible | 64,5 | 96,1 | 877 | no disponible en la informacion proporcionada | Modelo publico de Qwen |
| InternVL2.5-78B | no disponible | no disponible | 70,1 | 96,5 | 854 | no disponible en la informacion proporcionada | Modelo publico |
| GPT-4o (referencia propietaria) | no disponible | no disponible | 70,3 | 91,1 | 736 | Propietaria | Solo API |

Frente a Qwen2-VL-72B, la version 2.5 mejora en razonamiento visual y OCR (885 frente a 877 en OCRBench, 79,8 frente a 68,7 en CC-OCR) y en video largo (47,3 frente a 41,3 en LVBench). Frente a InternVL2.5-78B, destaca en OCR y tareas documentales, mientras que InternVL2.5-78B obtiene mejores resultados en MathVista y MVBench.

## Limitaciones y advertencias

- La model card es una copia literal de la de Qwen2.5-VL-72B-Instruct; no hay evidencia documentada de ajuste fino, curacion de datos ni evaluacion propia. Conviene verificar la integridad de los pesos antes de usarlos en produccion.
- El repositorio no registra descargas ni interacciones, y la busqueda web no ha encontrado referencias externas; la trazabilidad del autor es practicamente nula.
- La unica longitud de contexto publicada en la documentacion disponible no existe: cualquier planificacion que dependa de una ventana concreta debe verificarse experimentalmente.
- Solo se declara soporte de ingles. El comportamiento en castellano no esta documentado ni evaluado en este repositorio, aunque el modelo base sea multilingue.
- Riesgo de alucinacion inherente a los VLM: puede inventar texto en documentos ilegibles o atribuir coordenadas incorrectas en tareas de localizacion. En entornos financieros o sanitarios se requiere validacion posterior.
- Sesgos: no se han publicado analisis de sesgo para este repositorio. Al provenir de un modelo entrenado con datos web a gran escala, es esperable sesgo demografico y cultural, no cuantificado aqui.
- Licencia Qwen con condiciones especificas: los terminos completos no se detallan en la informacion proporcionada y deben revisarse en el enlace legal antes de un uso comercial.
- El coste de hardware (4 GPU de 80 GB en BF16) hace inviable el despliegue en infraestructura pequena sin cuantizacion, que a su vez puede degradar OCR y precision en coordenadas.
- El procesamiento de video de mas de una hora implica un consumo de tokens muy elevado; sin conocer la ventana de contexto oficial no se puede garantizar el encaje de videos largos a resolucion alta.
- Cualquier uso agentico (computer use, phone use) debe ejecutarse en entornos aislados: un agente visual con acceso a interfaces puede realizar acciones irreversibles si no se limita su radio de accion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/inamik7/habib-conversation-model
- Licencia Qwen (referencia del modelo base): https://huggingface.co/Qwen/Qwen2.5-VL-72B-Instruct/blob/main/LICENSE
- Blog de Qwen2.5-VL: https://qwenlm.github.io/blog/qwen2.5-vl/
- Repositorio GitHub de Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL
- Demo de chat: https://chat.qwenlm.ai/
- Paper del modelo base (Qwen2-VL): https://arxiv.org/abs/2409.12191
- Paper Qwen-VL: https://arxiv.org/abs/2308.12966
- Informe tecnico Qwen: https://arxiv.org/abs/2309.00071
- Resultados de busqueda web: sin resultados relevantes para este modelo; las entradas devueltas trataban sobre conexion de televisores a internet y se han descartado.

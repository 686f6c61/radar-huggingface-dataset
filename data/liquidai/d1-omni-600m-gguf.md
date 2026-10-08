# LiquidAI/d1-omni-600M-GGUF

## Resumen

d1-omni-600M es un modelo de decisión (decision model) desarrollado por Liquid AI, publicado por primera vez en octubre de 2026. A diferencia de un modelo de lenguaje generativo, no produce texto token a token: recibe un estado (texto, JSON, imágenes o audio) junto con un conjunto de preguntas nombradas y tipadas, y devuelve en una única pasada hacia delante (forward pass) respuestas estructuradas con probabilidades calibradas, sin generar ningún token. El repositorio que nos ocupa, LiquidAI/d1-omni-600M-GGUF, es la versión cuantizada en formato GGUF pensada para su ejecución local con llama.cpp.

El modelo pertenece a la familia LFM2.5 (etiqueta lfm2.5) y está orientado a despliegue en el borde (edge), gracias a su tamano reducido. Según los pesos en safetensors, el modelo cuenta con 380.732.161 parámetros (a pesar de que el nombre comercial indique 600M), lo que lo sitúa en la gama de modelos muy ligeros ejecutables en CPU o en GPU de consumo. Soporta tres tipos de pregunta: noul (respuesta booleana), choice (elección entre criterios etiquetados) y score (puntuación sobre una escala de criterios ordenados).

Su relevancia actual reside en que propone un paradigma distinto al de los LLM generativos para tareas de clasificación, enrutado y decisión estructurada, con coste de inferencia mínimo (una sola pasada, cero tokens generados) y capacidad multimodal (imagen y audio, además de texto). Es una alternativa práctica para sistemas de enrutado de tickets, moderación o extracción de decisiones en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible; etiquetada como familia lfm2.5 y tipo "decision model" (respuesta en una sola pasada, sin generacion de tokens) |
| Parametros totales | 380.732.161 (segun pesos safetensors del modelo base); el nombre comercial indica 600M |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No especificada; los ejemplos de llama.cpp cubren imagenes y estados de varios miles de tokens, con `-b`/`-ub` hasta 16384 para estados largos |
| Tipos de cuantizacion | GGUF; Q8_0 confirmado en los ejemplos oficiales; el resto no detallado (repo de 3,1 GB con varios ficheros) |
| Idiomas soportados | 15: en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh |
| Licencia | lfm1.0 (license "other") |
| Formato de pesos | GGUF (este repo); modelo base en safetensors |

## Arquitectura y entrenamiento

d1-omni-600M pertenece a la familia LFM2.5 de Liquid AI y se define como un modelo de decisión, una clase de modelo cuyo proposito es evaluar un estado y devolver probabilidades calibradas sobre un conjunto fijo de resultados en una sola llamada, con cero tokens generados. En lugar de decodificar texto, el modelo recibe un estado (texto, JSON, imágenes o audio) y un conjunto de preguntas nombradas y tipadas, y emite respuestas estructuradas. Los tres tipos de pregunta soportados son noul (respuesta booleana), choice (seleccion entre criterios etiquetados con descripcion) y score (valoracion sobre una lista de criterios ordenados). La información disponible no detalla si la arquitectura interna es un transformer puro, un modelo híbrido tipo SSM o una variante especifica; solo se confirma la etiqueta de familia lfm2.5 y el modo de operación de una sola pasada.

En cuanto al entrenamiento, la información proporcionada no incluye el numero de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La etiqueta "calibration" en el repositorio sugiere que el modelo está optimizado para producir probabilidades calibradas, y la etiqueta "system-one" apunta a un modo de razonamiento rápido e intuitivo (frente a cadenas de razonamiento largas). El modelo es multimodal: acepta imágenes y audio (hasta 30 segundos por clip) ademas de texto, aunque una petición no puede combinar imagen y audio simultaneamente. La versión GGUF está preparada para ejecutarse con llama.cpp mediante el endpoint `/v1/systemone`.

## Capacidades

- Decision estructurada sin generacion de texto: responde preguntas tipadas sobre un estado en una sola pasada, devolviendo probabilidades calibradas en lugar de texto libre.
- Tipos de pregunta nativos: noul (booleano), choice (seleccion entre criterios etiquetados) y score (puntuacion sobre escalas de criterios ordenados).
- Clasificacion y enrutado: asignacion de categorias, equipos o niveles de urgencia a partir de un estado textual o JSON.
- Multimodalidad de vision: procesa imágenes junto a texto en la misma peticion (image-text-to-text).
- Multimodalidad de audio: procesa clips de audio de hasta 30 segundos junto a texto.
- Extraccion de features: etiquetado con feature-extraction en el repositorio.
- Multilingue: soporte declarado de 15 idiomas (en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh).
- Ejecucion en el borde: disenado para edge, ejecutable con llama.cpp en CPU o GPU de consumo.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento agéntico multi-paso en la informacion disponible.

## Casos de uso

- Enrutado de tickets de soporte: dados un texto o JSON de entrada y varias preguntas de tipo choice con criterios (por ejemplo, billing, technical, fraud), el modelo devuelve la categoria mas probable en una sola pasada, sin coste de generacion, ideal para clasificar grandes volumenes de incidencias.
- Deteccion de intenciones de reembolso o reclamacion: con una pregunta de tipo noul ("¿el cliente pide un reembolso?"), el modelo responde booleano sobre el texto del cliente, util para disparar automatizaciones de facturacion.
- Triaje de urgencia: mediante preguntas de tipo score sobre una escala ordenada ("puede esperar", "hoy", "bloqueante ahora"), permite priorizar colas de atencion al cliente o de incidencias internas.
- Moderacion de contenido multimodal: el modelo puede clasificar imágenes acompanadas de una descripcion textual para decidir si un contenido cumple las politicas, aprovechando su soporte de vision.
- Analisis de audio para clasificacion de locuciones: a partir de un clip de hasta 30 segundos, distingue si una intervencion es una peticion, una pregunta o un discurso, y estima el tono (por ejemplo, nivel de calma), util para analitica de llamadas.
- Clasificacion de imagenes en flujos de negocio: por ejemplo, verificar si una foto adjunta a una solicitud de cuidado de mascotas contiene gatos, perros o aves, y si aparecen sobre un sofa, mediante preguntas de choice y noul.
- Extraccion de senales estructuradas para pipelines: dado un estado de varios miles de tokens, generar multiples etiquetas y puntuaciones de una sola vez para alimentar sistemas de decision posteriores, reduciendo el coste frente a un LLM generativo.
- Despliegue local en el borde: al ser un GGUF ligero, puede ejecutarse en dispositivos con recursos limitados o en servidores modestos para tareas de decision en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las busquedas web mencionan articulos que anuncian benchmarks y latencia, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K ni metricas de calibracion) en el material facilitado, por lo que no se incluyen valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia (según 380,7 M de parametros; cifras aproximadas, no confirmadas por el autor):
  - FP16: en torno a 0,8 GB.
  - Q8_0: en torno a 0,4 GB.
  - Q4_K_M: en torno a 0,25 GB.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente dado el tamano; por ejemplo RTX 3060, RTX 4090, asi como A100/H100 si se busca throughput masivo. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, con margen amplio; incluso en iGPU o CPU. El diseno es explicitamente para edge.
- Opciones de despliegue: llama.cpp mediante `llama-server` (endpoint `/v1/systemone`), tal y como documenta el autor: `llama-server -hf LiquidAI/d1-omni-600M-GGUF:Q8_0 -b 4096 -ub 4096`. Para estados largos hay que subir `-b`/`-ub` hasta 16384. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no se proporcionan cifras concretas para este modelo. Un articulo de busqueda menciona "16 ms" en el titular, pero referido al modelo d1-3B, no a este, por lo que no se traslada aqui.

Nota de configuracion: como una pregunta se lee en un solo lote, los parametros `-b` y `-ub` deben dimensionarse para contener todo el estado. Un valor de 4096 cubre cualquier imagen y estados de pocos miles de tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Modo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-omni-600M-GGUF (este) | 380,7 M (nominal 600M) | Texto, imagen, audio | Decision en una pasada, sin tokens | lfm1.0 (other) | Pesos abiertos en GGUF |
| d1-3B | 3 000 M (aproximado, segun nombre) | Texto e imagen | Decision en una pasada | No disponible en la informacion | Pesos abiertos (segun fuentes de busqueda) |
| d1:free | No disponible | No disponible | Decision | Propietario (hosted) | Solo API, sin pesos publicos |

La informacion disponible no permite comparar con modelos de otras familias (por ejemplo, clasificadores o LLM ligeros de terceros) en terminos de rendimiento, contexto o calibracion, por lo que la comparativa se limita a los hermanos de la propia familia d1. No se dispone de datos de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo responde preguntas tipadas sobre un estado. Usarlo como chatbot o generador de texto no es su proposito.
- Estado y preguntas deben venir en el formato estructurado documentado (noul, choice, score con criterios); fuera de ese formato no está garantizada la respuesta.
- No se documentan sesgos conocidos, riesgo de alucinacion ni tasas de error en la informacion disponible; al devolver probabilidades, la fiabilidad depende de la calibracion, no verificada en este material.
- Restriccion multimodal: una peticion lleva imágenes o un clip de audio, pero no ambos a la vez. El audio está limitado a 30 segundos.
- Contexto no especificado oficialmente: los ejemplos sugieren estados de miles de tokens y hasta 16384 con `-b`/`-ub` ampliados, pero no hay una cifra oficial de ventana de contexto.
- Licencia lfm1.0 (categoria "other"): es una licencia propia de Liquid AI, no una licencia permisiva estandar; antes de un uso comercial conviene revisar los terminos del fichero LICENSE, que no se detallan aqui.
- Idioma: aunque se declaran 15 idiomas, no se ofrecen metricas de rendimiento por idioma, por lo que la calidad relativa entre lenguas es desconocida.
- Despliegue: el uso documentado depende de llama.cpp y del endpoint `/v1/systemone`, que no es un endpoint estandar de OpenAI; requiere un cliente compatible.
- Discrepancia de nomenclatura: el nombre indica 600M pero el recuento real en safetensors es de 380,7 M de parametros, lo que puede confundir al planificar recursos.
- Fecha del repositorio (octubre de 2026) y baja traccion (18 descargas, 12 likes en el momento de la consulta): ecosistema y soporte comunitario todavia limitados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/LiquidAI/d1-omni-600M-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600m
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Documentacion de modelos de decision: https://docs.liquid.ai/lfm/models/decision-models
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Web de Liquid AI: https://www.liquid.ai/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Articulo de analisis (explainx.ai): https://www.explainx.ai/blog/liquid-ai-open-d1-3b-omni-600m-open-weight-decision-models-edge-2026
- Noticia (techaimag.com): https://www.techaimag.com/ai-news/liquid-ai-releases-open-weight-multimodal-decision-models
- Referencia de la familia d1 (LLM Reference): https://www.llmreference.com/model-family/d1

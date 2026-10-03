# ryugyosoft/llm-jp-4.1-8b-thinking-onw

## Resumen

`ryugyosoft/llm-jp-4.1-8b-thinking-onw` es la conversión del modelo japonés `llm-jp/llm-jp-4.1-8b-thinking` al motor **onw**, un runtime que ejecuta modelos de lenguaje exclusivamente sobre la NPU integrada de los procesadores Intel Core Ultra. El problema que resuelve es concreto: permitir inferencia local de un modelo de 8B con modo de razonamiento en equipos sin GPU dedicada, usando la NPU como único acelerador.

El modelo de partida lo desarrolla LLM-jp (Instituto Nacional de Informática de Japón, NII) y está entrenado desde cero con foco en japonés, con estructura tipo Llama, un vocabulario de 197.000 tokens y un modo de pensamiento basado en el formato *harmony* de la familia gpt-oss. Este repositorio no entrena nada: recuantiza y reestructura los pesos originales en grafos estáticos INT4 (grupo 128) más una capa de salida INT8.

Su relevancia es doble: por un lado, lleva un 8B con razonamiento y *tool calling* a portátiles con Core Ultra (Meteor Lake, Arrow Lake, Lunar Lake o Panther Lake); por otro, publica bajo Apache 2.0 y expone una API compatible con OpenAI, lo que facilita integrarlo en aplicaciones existentes sin reescribir el cliente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama, 32 capas; grafo estático segmentado en 4 bloques de 8 capas más la capa de salida |
| Parametros totales | 8B (aproximadamente 8.000 millones, según la denominación del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 con grupo 128 en las 32 capas; INT8 en la capa de salida; INT4 en los embeddings |
| Idiomas soportados | japonés (ja) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato propietario de onw: ficheros `seg*.bin` con los segmentos, `shared.bin` (salida INT8 y embeddings INT4), grafos `seg*_S1.xml` / `seg*_S16.xml` y `engine.json` |
| Vocabulario | 197.000 tokens (tokenizer original sin modificar) |
| Tamano del repositorio | 4,9 GB (descarga indicada por el autor: 4,6 GB) |
| Biblioteca | onw |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino una **recuantización y reconstrucción** de los pesos de `llm-jp/llm-jp-4.1-8b-thinking`. El autor lo indica de forma explícita: "重みは元モデルから再量子化・再構成したものです。学習はしていません" (los pesos se recuantizaron y reconstruyeron a partir del modelo original; no se ha entrenado). La conversión divide las 32 capas en cuatro segmentos de 8 capas más un segmento de salida, y los compila como grafo estático INT4 con grupo 128. La capa de salida, con un vocabulario de 197.000 entradas, se mantiene aparte en INT8 y se omite durante el procesamiento del *prompt* cuando no se necesitan logits, lo que acelera la fase de prefill.

El modelo base lo desarrolla LLM-jp (NII) y sigue una estructura tipo Llama entrenada principalmente con corpus en japonés. Incorpora el formato *harmony* de la familia gpt-oss: el modelo piensa siempre antes de responder (el razonamiento se emite en inglés y se devuelve en el campo `reasoning_content` únicamente en modo pensamiento) y la cantidad de razonamiento se controla con `reasoning_effort` (low, medium, high). Según la nota de prensa del NII sobre la familia LLM-jp-4, el entrenamiento se realizó sobre un corpus de alta calidad de aproximadamente 12 billones de tokens, si bien ese dato corresponde a los modelos LLM-jp-4 8B y 32B-A3B y no se ha confirmado específicamente para la variante 4.1. La integración con onw también adapta la posición de destino en las llamadas a herramientas, que difiere respecto a la implementación original.

## Capacidades

- Generación de texto conversacional en japonés e inglés, con calidad destacada en japonés.
- Modo de pensamiento (*thinking*) con razonamiento previo a la respuesta, graduable mediante `reasoning_effort` en low, medium y high. Fuera del modo pensamiento, onw aplica low.
- *Tool calling* mediante el parámetro `tools` de la API compatible con OpenAI, incluida la llamada paralela a varias herramientas y el uso de sus resultados en la respuesta.
- Capacidades de agente y razonamiento en varios pasos gracias al formato harmony (pensamiento, llamada a herramienta, observación y respuesta final).
- Soporte multilingüe limitado a japonés e inglés.
- No se documentan capacidades de visión, audio ni otras modalidades (la entrada indicada es únicamente texto).

## Casos de uso

- **Asistencia en japonés sobre portátil corporativo sin GPU**: el modelo se ejecuta íntegramente en la NPU de un Core Ultra, con un consumo de memoria de trabajo de unos 10 GB, lo que permite desplegarlo en equipos de oficina estándar para redacción, resumen y traducción ja-en sin enviar datos a la nube.
- **Agentes locales con herramientas**: al soportar `tools` mediante API compatible con OpenAI y llamadas paralelas, se puede construir un agente que consulte una base de datos interna o una API REST y redacte la respuesta final en japonés, todo dentro del mismo equipo.
- **Atención al cliente en japonés**: el modelo está optimizado para instrucciones en japonés (MT-Bench japonés 7,58) y mantiene conversaciones multiturno con uso de herramientas, lo que encaja en un asistente de soporte que consulte el estado de un pedido y responda en el idioma del usuario.
- **Procesamiento por lotes de documentos japoneses en local**: para clasificación, extracción o resumen de textos en japonés donde la confidencialidad impide usar servicios externos; el preprocesado de *prompts* cortos tarda menos de un segundo según las mediciones del autor.
- **Prototipado de aplicaciones LLM sin coste de GPU**: cualquier desarrollador con un portátil Core Ultra puede levantar el servidor en `http://localhost:8000/v1` y apuntar su código basado en el SDK de OpenAI, sustituyendo después el *endpoint* por un modelo mayor en producción.
- **Generación de código con asistencia de razonamiento en inglés**: el modelo piensa en inglés y puede resolver tareas de programación en ese idioma, aunque según la tarjeta original Qwen3.5-9B es superior en matemáticas y código, por lo que conviene reservarlo para tareas de complejidad media o como apoyo.
- **Evaluación y docencia de modelos japoneses**: al ser un artefacto de cuantización reproducible, sirve para estudiar el impacto de INT4 frente al modelo bf16 original en un entorno de investigación.

## Benchmarks y rendimiento

| Benchmark | llm-jp-4.1-8b-thinking | gpt-oss-20b | Qwen3.5-9B |
|---|---|---|---|
| MT-Bench japonés | 7,58 | 7,33 | no disponible |
| Seguimiento de instrucciones centradas en japonés | superior a Qwen3.5-9B | no disponible | inferior |
| Matemáticas, código y uso de herramientas multiturno | inferior a Qwen3.5-9B | no disponible | superior |

No se han publicado resultados de benchmarks propios de esta conversión a onw en la información disponible. El autor sí documenta una prueba de fidelidad de la cuantización por *teacher forcing* frente al modelo original en bf16 sobre CPU: coincidencia de 24/24 tokens en razonamiento low y 23/24 en medium, con resultados idénticos entre NPU y CPU en FP32. En 20 preguntas en japonés, el primer token de la respuesta coincide en 19 de 20 casos (la restante difiere entre "東京" y "日本の"), y se verificó la llamada paralela a dos herramientas con respuesta final en japonés.

## Requisitos de hardware

- **Acelerador**: NPU integrada en Intel Core Ultra de serie 1 o 2 (Meteor Lake, Arrow Lake, Lunar Lake) y serie 3 (Panther Lake). No se documenta ejecución en GPU NVIDIA o AMD para este artefacto.
- **Sistema operativo**: Windows 11 o Ubuntu 22.04 o superior.
- **Memoria**: conjunto de trabajo de aproximadamente 10 GB tras la carga del modelo; conviene disponer de al menos 16 GB de RAM en el equipo.
- **Descarga**: 4,6 GB según el autor (el repositorio en HuggingFace ocupa 4,9 GB).
- **Velocidad medida en NPU 3720 (Core Ultra 9 285HX)**: 4,2 a 4,7 tokens por segundo en generación; el procesamiento de preguntas cortas se resuelve en menos de un segundo.
- **Arranque**: la primera carga requiere compilación para la NPU y tarda unos 11 minutos; las cargas posteriores bajan a unos 20 segundos.
- **Despliegue**: motor onw (instalación mediante script de PowerShell en Windows o `curl ... | bash` en Ubuntu), interfaz gráfica de onw o `onw serve <carpeta>`, con API compatible con OpenAI en `http://localhost:8000/v1`. Para GPU o CPU con otros runtimes habría que usar el modelo original en safetensors o la versión GGUF publicada por LLM-jp.
- **Latencia y throughput**: no disponible más allá de la cifra de generación indicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| llm-jp-4.1-8b-thinking-onw | 8B | no disponible | MT-Bench japonés 7,58 (medido sobre el original en bf16) | Apache 2.0 | onw (INT4/INT8), solo NPU Intel |
| llm-jp-4.1-8b-thinking | 8B | no disponible | referencia bf16 del anterior | Apache 2.0 | safetensors, CPU/GPU |
| llm-jp-4.1-8b-thinking-gguf | 8B | no disponible | no disponible | Apache 2.0 | GGUF, llama.cpp y derivados |
| Qwen3.5-9B | 9B | no disponible | superior en matemáticas, código y uso de herramientas multiturno según la tarjeta original | no disponible | no disponible |
| gpt-oss-20b | 20B | no disponible | MT-Bench japonés 7,33 | no disponible | no disponible |

La ventaja diferencial de esta variante no es el rendimiento bruto, sino el consumo: es el único de los artefactos comparados que se ejecuta sin GPU sobre una NPU integrada.

## Limitaciones y advertencias

- **Dependencia de hardware concreta**: solo funciona con el motor onw sobre NPU Intel Core Ultra; no hay soporte documentado para CUDA, ROCm ni Metal en este repositorio.
- **Velocidad baja**: 4,2 a 4,7 tokens por segundo es suficiente para uso interactivo personal, pero no para servicios con concurrencia o generación de documentos largos.
- **Arranque inicial lento**: unos 11 minutos de compilación para la NPU en la primera carga; hay que planificar el despliegue en consecuencia.
- **Consumo de memoria alto para su tamano**: alrededor de 10 GB de conjunto de trabajo tras la carga.
- **Pérdida de precisión por cuantizacion**: la comparación por *teacher forcing* muestra coincidencia de 23/24 tokens en modo medium, lo que implica divergencias puntuales respecto al modelo original en bf16.
- **Razonamiento y matemáticas**: el propio autor señala que Qwen3.5-9B supera a este modelo en matemáticas, código y uso de herramientas multiturno; no conviene usarlo como sustituto en esas tareas sin evaluar.
- **Idioma**: solo japonés e inglés; no hay soporte declarado para castellano.
- **Idioma del razonamiento**: el modelo piensa en inglés incluso cuando responde en japonés, lo que debe tenerse en cuenta si se auditan las trazas.
- **Gestion de tokens**: el razonamiento consume tokens, por lo que el autor recomienda fijar `max_tokens` en 300 o más para no truncar la respuesta.
- **Contexto no documentado**: no se especifica la longitud de contexto del modelo base en la información disponible.
- **Validacion de la comunidad practicamente nula**: 0 descargas y 0 *likes* en el momento de la consulta; se trata de un artefacto recién publicado y sin contraste externo.
- **Licencia y atribucion**: los pesos se publican bajo Apache 2.0, igual que el modelo original, lo que permite uso comercial; aun así, LLM-jp solicita citar sus recursos y seguir su guía de uso responsable para los materiales derivados del NII.
- **Riesgo de alucinacion**: no se han publicado evaluaciones específicas de veracidad para esta conversión; aplican los riesgos habituales de un modelo de 8B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryugyosoft/llm-jp-4.1-8b-thinking-onw
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4.1-8b-thinking
- Motor onw: https://huggingface.co/ryugyosoft/onw
- Documentación técnica de onw: https://huggingface.co/ryugyosoft/onw/blob/main/TECHNICAL.md
- Versión GGUF del modelo base: https://huggingface.co/llm-jp/llm-jp-4.1-8b-thinking-gguf
- Recetas de uso de LLM-jp-4: https://github.com/llm-jp/llm-jp-4-cookbook
- Página de publicaciones de LLM-jp: https://llm-jp.nii.ac.jp/en/release-en/
- Nota de prensa del NII sobre LLM-jp-4 8B y 32B-A3B: https://www.nii.ac.jp/en/news/release/2026/0403.html
- Modelo llm-jp-4-8b-thinking: https://huggingface.co/llm-jp/llm-jp-4-8b-thinking

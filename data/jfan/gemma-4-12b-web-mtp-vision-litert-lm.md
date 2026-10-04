# jfan/gemma-4-12b-web-mtp-vision-litert-lm

## Resumen

El modelo `jfan/gemma-4-12b-web-mtp-vision-litert-lm` es un conjunto de paquetes cuantizados en formato `.litertlm` pensados para ejecutarse en el navegador mediante LiteRT-LM Web con aceleracion WebGPU. Se presenta como una adaptacion de "Gemma 4 12B" (12 000 millones de parametros) en cuatro variantes que combinan decodificacion especulativa por prediccion multi-token (MTP, *multi-token prediction*), vision multimodal y audio multimodal. El autor es el usuario `jfan`, que lo publica como subida de la comunidad y no como lanzamiento oficial de Google.

Su relevancia esta en el enfoque de despliegue: no apunta a servidores con GPU dedicada, sino a inferencia local dentro del navegador, con soporte explicito de WebGPU como backend de computo. La model card describe un decodificador de texto acompanado de un modulo `gpu_artisan` para decodificacion especulativa, un codificador de vision con presupuestos de tokens variables y un codificador de audio basado en arquitectura Conformer.

La informacion publicada es muy escasa: no hay datos de entrenamiento, benchmarks, idiomas soportados ni tamano de contexto declarados. El repositorio ocupa 24,7 GB y contiene cuatro ficheros `.litertlm`, lo que sugiere en torno a 6 GB por variante, aunque el nivel exacto de cuantizacion no se especifica en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador con prediccion multi-token (MTP) para decodificacion especulativa; codificador de vision + adaptador y codificador de audio Conformer + adaptador (`audio_encoder_hw`) |
| Parametros totales | 12B (segun la denominacion "Gemma 4 12B" del propio repositorio) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos cuantizados en formato `.litertlm`; nivel de cuantizacion (int4, int8, mixto) no disponible |
| Idiomas soportados | no disponible |
| Licencia | Gemma (terminos de licencia Gemma) |
| Formato de pesos | `.litertlm` (LiteRT-LM), optimizado para WebGPU |

Variantes incluidas en el repositorio:

| Fichero | Capacidades |
|---|---|
| `gemma-4-12B-it-web-mtp.litertlm` | Texto + MTP |
| `gemma-4-12B-it-web-mtp-vision.litertlm` | Texto + MTP + vision |
| `gemma-4-12B-it-web-mtp-audio.litertlm` | Texto + MTP + audio |
| `gemma-4-12B-it-web-mtp-vision-audio.litertlm` | Texto + MTP + vision + audio |

## Arquitectura y entrenamiento

Segun la model card, el modelo se compone de un decodificador de texto y varios modulos auxiliares. El decodificador incorpora prediccion multi-token (MTP) bajo la etiqueta `gpu_artisan`, que actua como mecanismo de decodificacion especulativa: se generan varios tokens candidatos por paso y se validan despues, reduciendo el numero de pasos de decodificacion efectivos. Esta tecnica es especialmente relevante en entornos WebGPU, donde la latencia por paso es mayor que en GPUs de servidor.

El modulo de vision combina un `vision_encoder`, un `vision_adapter` y un token especial `end_of_vision`, con presupuestos de tokens de imagen configurables en los valores `[70, 140, 280, 560, 1120]`. Esto permite intercambiar resolucion de detalle por coste computacional segun la tarea. El modulo de audio usa un codificador `audio_encoder_hw` de tipo Conformer, un `audio_adapter` y el token `end_of_audio`.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO. Tampoco se documenta el proceso de cuantizacion ni la receta de conversion a `.litertlm`.

## Capacidades

- Generacion de texto conversacional, con el sufijo `-it` en los ficheros que sugiere una variante ajustada para instrucciones.
- Decodificacion especulativa mediante prediccion multi-token (MTP), orientada a reducir latencia en inferencia local.
- Comprension de imagenes: codificador de vision con presupuestos de tokens variables (`70`, `140`, `280`, `560`, `1120`), lo que permite ajustar el coste por imagen.
- Procesamiento de audio: codificador Conformer con adaptador y token de cierre `end_of_audio`.
- Modalidad combinada imagen + audio + texto en la variante `vision-audio`.
- Ejecucion en navegador mediante LiteRT-LM Web con backend WebGPU.
- Soporte de *tool calling* o *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible.
- Capacidades multilingues concretas: no disponible.
- Modo de razonamiento explicito (*thinking mode*): no disponible.

## Casos de uso

- Asistentes conversacionales integrados en aplicaciones web: al ejecutarse con LiteRT-LM y WebGPU, el modelo permite ofrecer chat con IA sin enviar datos del usuario a un servidor, lo que simplifica el cumplimiento de normativa de privacidad.
- Descripcion y analisis de imagenes en el navegador: un editor web o una herramienta de accesibilidad puede enviar una imagen al `vision_encoder` con un presupuesto de tokens bajo (por ejemplo, 70 o 140) para obtener descripciones rapidas sin coste de red.
- Analisis detallado de documentos escaneados: usando el presupuesto maximo de 1120 tokens de vision, se puede extraer informacion de capturas, graficos o formularios donde el detalle importa.
- Transcripcion y comprension de audio en aplicaciones web: la variante con audio permite resumir notas de voz o generar subtitulos directamente en el cliente, apoyandose en el codificador Conformer.
- Demos y prototipos de multimodalidad sin infraestructura: al no requerir servidores con GPU, es util para talleres, pruebas de concepto y entornos donde solo se dispone de un navegador con WebGPU.
- Aplicaciones educativas interactivas: combinando vision y audio, un tutor puede analizar un problema escrito a mano y responder por voz, con la decodificacion MTP reduciendo la latencia percibida.
- Procesamiento por lotes en el cliente para tareas de clasificacion o etiquetado: si el presupuesto de tokens de vision es ajustable, se puede recorrer un conjunto de imagenes reduciendo el coste por elemento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye datos de MMLU, HumanEval, GSM8K, MMMU, ningun benchmark multimodal, ni mediciones de latencia o throughput.

## Requisitos de hardware

- El modelo esta disenado para WebGPU, por lo que el requisito principal es un navegador compatible con WebGPU (Chrome, Edge u otros basados en Chromium) y una GPU integrada o dedicada con soporte de dicho backend.
- Tamano del repositorio: 24,7 GB repartidos en cuatro ficheros `.litertlm`. Para el uso de una sola variante hay que descargar unicamente el fichero correspondiente; como estimacion derivada del total, cada variante rondaria los 6 GB, aunque el autor no publica los tamanos individuales.
- Encaje en GPU de consumo: dado que el objetivo es el navegador, se asume ejecucion en GPU de consumo, pero no se especifican modelos concretos (RTX 4090, RTX 3060, Apple Silicon, etc.) ni el consumo de VRAM o memoria unificada.
- GPUs de centro de datos (A100, H100): no es el escenario objetivo declarado; no hay informacion sobre su uso.
- Opciones de despliegue: LiteRT-LM Web sobre WebGPU. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato `.litertlm` es especifico del runtime de LiteRT-LM.
- Latencia y throughput: no disponibles. La presencia de MTP indica que el autor prioriza la reduccion de latencia, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos verificables sobre "Gemma 4 12B" en la informacion proporcionada, por lo que la comparacion se limita a aspectos estructurales. Los siguientes modelos son alternativas de categoria similar (modelos abiertos de ~12B con capacidad multimodal), pero los valores marcados como "no disponible" no pueden confirmarse contra este modelo concreto.

| Modelo | Parametros | Contexto | Vision | Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jfan/gemma-4-12b-web-mtp-vision-litert-lm | 12B | no disponible | si | si (variante especifica) | Gemma | HuggingFace, formato `.litertlm` |
| Gemma 3 12B IT | 12B | no disponible en esta ficha | si | no | Gemma | HuggingFace, safetensors / GGUF |
| Qwen2.5-VL-7B | 7B | no disponible en esta ficha | si | no | Apache 2.0 | HuggingFace, safetensors |

No se han encontrado comparativas de rendimiento publicadas entre este modelo y las alternativas citadas.

## Limitaciones y advertencias

- Subida de la comunidad: el autor es `jfan`, no Google. No hay evidencia en la informacion disponible de que se trate de un lanzamiento oficial ni de que el nombre "Gemma 4" corresponda a una familia publicada por Google.
- Sin validacion externa: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay señales de uso ni verificacion por terceros.
- Sin datos de entrenamiento: no se documenta la composicion del dataset ni los procesos de ajuste, lo que impide evaluar sesgos conocidos.
- Riesgo de alucinacion: no cuantificado. No hay evaluaciones de fidelidad ni de tasas de error.
- Idiomas soportados: no disponibles. No se puede garantizar un comportamiento correcto en castellano ni en otros idiomas.
- Longitud de contexto: no disponible, lo que impide planificar tareas de contexto largo.
- Nivel de cuantizacion desconocido: al no especificarse el esquema (int4, int8, mixto), no se puede estimar la perdida de calidad frente a los pesos originales.
- Restricciones de licencia: se aplican los terminos de licencia Gemma, que imponen condiciones de uso, obligaciones de atribucion y restricciones de uso aceptable. Es imprescindible revisarlos antes de cualquier despliegue comercial.
- Encaje en produccion: el formato `.litertlm` esta atado a LiteRT-LM, lo que limita la portabilidad a otras pilas de inferencia habituales en servidor.
- Compatibilidad de navegador: el rendimiento depende de la implementacion de WebGPU del navegador y del controlador de la GPU del usuario final, lo que introduce variabilidad dificil de controlar.

## Enlaces

- HuggingFace: https://huggingface.co/jfan/gemma-4-12b-web-mtp-vision-litert-lm
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles en la informacion proporcionada.

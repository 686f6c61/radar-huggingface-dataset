# Dennis1315/ward-osint-14b

## Resumen

ward-osint-14b es un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario Dennis1315 en HuggingFace. A pesar de que su identificador incluye la etiqueta "14b", los datos reales de los pesos en safetensors indican 9.653.104.368 parametros (aproximadamente 9,65 mil millones), por lo que el nombre no se corresponde con el tamano real del modelo. Esta etiquetado con la arquitectura qwen3_5 y su pipeline es image-text-to-text, es decir, es un modelo multimodal que acepta texto e imagenes como entrada.

Segun la model card, el modelo se entreno con Unsloth y la libreria TRL de HuggingFace, lo que permitio un entrenamiento "2x mas rapido" segun el autor. La licencia declarada es Apache 2.0 y el unico idioma soportado es el ingles (en).

La informacion publicada es muy escasa: no se detallan datos de entrenamiento, composicion del dataset, longitud de contexto, benchmarks ni casos de uso. El nombre "ward-osint" sugiere una posible orientacion a tareas de OSINT (inteligencia de fuentes abiertas), pero esto no esta documentado en la model card. Con 0 descargas y 0 likes en el momento de la consulta, es un modelo recien publicado y sin validacion externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (segun etiquetas; modelo multimodal del tipo image-text-to-text) |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | no disponible (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se listan cuantizaciones oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamano del repo | 19,3 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna mas alla de la etiqueta qwen3_5 y del hecho de que el pipeline es image-text-to-text, lo que implica un modelo multimodal con capacidad de procesar imagenes y texto. El modelo es un finetune del checkpoint Qwen/Qwen3.5-9B, por lo que hereda la arquitectura del modelo base, pero no se publican sus detalles tecnicos (numero de capas, dimensiones, mecanismo de atencion ni configuracion del codificador visual).

En cuanto al entrenamiento, la model card indica unicamente que se realizo con Unsloth y la libreria TRL de HuggingFace, lo que permitio un entrenamiento "2x mas rapido". No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni las tecnicas de ajuste empleadas (LoRA, QLoRA u otras). Tampoco se documentan innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto: el pipeline declarado (image-text-to-text) confirma la generacion de texto.
- Procesamiento de imagenes: al estar catalogado como image-text-to-text, el modelo acepta imagenes como entrada, si bien no se detallan las tareas visuales concretas (descripcion, VQA, OCR u otras).
- Conversacion: la etiqueta "conversational" sugiere soporte para dialogos, aunque no se especifica el formato de plantilla ni el numero de turnos soportados.
- Capacidades multilingues: no disponibles; el unico idioma declarado es el ingles.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo "thinking" (razonamiento explicito): no documentado.
- Capacidades de audio o vision avanzada: no documentadas; solo se confirma la entrada de imagenes.

## Casos de uso

- Analisis de imagenes en flujos OSINT: dado que el pipeline es image-text-to-text, el modelo podria utilizarse para describir, clasificar o extraer informacion de imagenes (capturas, fotografias o documentos escaneados) en ingles. Es un uso hipotetico, ya que no hay validacion publicada.
- Extraccion de texto de documentos (OCR asistido por modelo vision-lenguaje): al aceptar imagenes, podria emplearse para transcribir texto contenido en imagenes y estructurarlo, siempre que su capacidad de vision este efectivamente entrenada (no documentado).
- Asistente conversacional de dominio en ingles: la etiqueta "conversational" permite plantear su uso como chatbot de un dominio concreto, aunque se desconoce la longitud de contexto real y el formato de dialogo soportado.
- Descripcion automatica de imagenes para accesibilidad: generacion de texto alternativo a partir de imagenes, un caso tipico de los modelos image-text-to-text.
- Triaje y filtrado de contenido visual: clasificacion preliminar de imagenes en un pipeline de moderacion o revision, siempre que la precision este validada (no hay datos).
- Prototipado e investigacion en una sola GPU: con ~9,65B de parametros, es viable desplegarlo en hardware de gama alta de consumo (por ejemplo, una RTX 4090 en BF16), lo que facilita experimentacion y fine-tuning adicional con Unsloth.
- Generacion de informes en ingles a partir de contexto mixto (texto e imagen): integrable en flujos donde se combine informacion visual con texto de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K, MMMU u otras) ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de los ~9,65B de parametros, no confirmadas por el autor):
  - BF16 / FP16: en torno a 19,3 GB solo para pesos, mas overhead de cache KV y activaciones; se recomienda disponer de 24 GB o mas.
  - INT8: aproximadamente 10 GB de pesos.
  - INT4: aproximadamente 5-6 GB de pesos.
- GPU recomendadas para servicio en produccion: A100 (40/80 GB), H100, L40S o similares, especialmente si se desea contexto largo o lotes grandes.
- GPU de consumo: cabe en RTX 4090 o RTX 3090 (24 GB) en BF16; en tarjetas de 16 GB (RTX 4080, 4070 Ti SUPER) seria necesario recurrir a INT8/INT4; en tarjetas de 8-12 GB solo cabria en INT4.
- Opciones de despliegue: transformers, text-generation-inference (TGI, coherente con la etiqueta del repo), vLLM y, previa conversion a GGUF, llama.cpp y Ollama. La disponibilidad de soporte multimodal completo en cada motor puede variar y no esta documentada para este modelo.
- Al ser un modelo multimodal, conviene tener en cuenta que el componente de vision anade consumo de memoria adicional no cuantificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan una comparacion de rendimiento fiable. La comparacion mas directa posible es con su modelo base y con otras familias abiertas de tamano similar, pero para este modelo concreto faltan metricas publicadas.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Benchmarks |
|---|---|---|---|---|---|
| ward-osint-14b | ~9,65B | no disponible | si (image-text-to-text) | Apache 2.0 | no disponibles |
| Qwen/Qwen3.5-9B (modelo base) | ~9B (nominal) | no disponible | no disponible | no disponible | no disponibles |
| Familias abiertas de tamano similar (por ejemplo, Llama 3.x 8B, Gemma 2 9B, Mistral 7B) | 7-9B | variable | mayoritariamente solo texto | licencias variadas | no comparables con este modelo por ausencia de datos |

La comparacion de rendimiento no es posible porque no se han publicado resultados de benchmarks del modelo ward-osint-14b.

## Limitaciones y advertencias

- Gran incertidumbre sobre el modelo: la model card es practicamente un esqueleto generado por el flujo de Unsloth, sin datos de entrenamiento, evaluacion ni casos de uso.
- Discrepancia en el nombre: el identificador indica "14b" pero el numero real de parametros es de ~9,65B; conviene no fiarse del nombre.
- Sesgos conocidos: no documentados; al ser un finetune sin informacion sobre el dataset, no puede descartarse la presencia de sesgos derivados de los datos de entrenamiento.
- Riesgo de alucinacion: no evaluado; sin benchmarks ni validacion externa, el riesgo es desconocido y probablemente alto en tareas no verificadas.
- Limitaciones de idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas es incierto.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base Qwen/Qwen3.5-9B tenga una licencia compatible y revisar posibles obligaciones de atribucion.
- Ausencia de validacion: con 0 descargas y 0 likes, no existe evidencia de uso en produccion ni de calidad del ajuste.
- Capacidades no confirmadas: el tool calling, el soporte de agentes y las tareas visuales especificas no estan documentados; no deben asumirse en un despliegue real.
- Advertencia adicional: por el nombre ("osint"), si el modelo se utilizara para recopilacion de inteligencia, debe comprobarse el cumplimiento de la normativa aplicable en materia de proteccion de datos y uso de imagenes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dennis1315/ward-osint-14b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl

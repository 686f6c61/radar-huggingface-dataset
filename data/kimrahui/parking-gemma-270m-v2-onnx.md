# kimrahui/parking-gemma-270m-v2-onnx

## Resumen

parking-gemma-270m-v2-onnx es un modelo ligero de generación de texto creado por el usuario kimrahui y publicado en HuggingFace. Se trata de un ajuste fino (LoRA) del modelo google/gemma-3-270m-it, la versión instruida de 270 millones de parámetros de la familia Gemma 3 de Google, exportado a formato ONNX en precisión fp16 para su ejecución en navegador mediante transformers.js. El propósito del modelo es muy específico: extraer, a partir de preguntas de conductores, los criterios de búsqueda de aparcamiento en formato JSON estructurado.

El interés de esta ficha reside en que es un ejemplo representativo de los modelos "nano" de la familia Gemma 3: redes transformer compactas, capaces de ejecutarse íntegramente en el cliente (en el navegador, sin servidor) gracias a ONNX y WebAssembly/WebGPU. Su autor reporta una tasa de coincidencia exacta del 67,2 % en un conjunto de evaluación de 131 preguntas, con precisión idéntica a la versión fp32.

Es relevante para desarrolladores que necesiten tareas de extracción de información estructurada con latencia mínima y sin coste de servidor, aunque su ámbito de aplicación es estrecho y su rendimiento en tareas generales de lenguaje será limitado dado su tamaño de 270 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 3 text) |
| Parametros totales | 270 millones (aproximado, base Gemma 3 270M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (la familia Gemma 3 suele ofrecer 32K; consultar ficha base) |
| Tipos de cuantizacion | fp16 (ONNX); el autor descarto 4bit y 8bit por caida de precision |
| Idiomas soportados | no disponible (el caso de uso documentado esta en coreano) |
| Licencia | Gemma (https://ai.google.dev/gemma/terms) |
| Formato de pesos | ONNX (fp16), compatible con transformers.js |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 270M-it, un transformer decoder unimodal (solo texto) de la familia Gemma 3 de Google. Sobre esa base se aplico un ajuste fino eficiente mediante LoRA (Low-Rank Adaptation), tecnica que congela los pesos originales y entrena matrices de bajo rango adicionales, reduciendo drasticamente los requisitos de computo y memoria del entrenamiento.

El objetivo del ajuste es la extraccion estructurada: dada una pregunta en lenguaje natural de un conductor, el modelo genera un objeto JSON con los criterios de busqueda de aparcamiento (tarea de tipo NER/struct-to-JSON). El autor publico la version ONNX en fp16 tras verificar que la precision se mantiene identica a fp32 en su evaluacion (67,2 % de coincidencia exacta en 131 preguntas); las variantes 4bit y 8bit degradaban notablemente la precision y no se distribuyen. No hay informacion publicada sobre el numero de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto conversacional (heredada del modelo base Gemma 3 270M-it), aunque afinada para una tarea concreta.
- Extraccion de informacion estructurada: convierte preguntas de conductores en JSON con criterios de busqueda de aparcamiento.
- Ejecucion en navegador mediante transformers.js (ONNX), sin necesidad de backend propio.
- No hay informacion publicada sobre tool calling, agentes, vision, audio ni modo de razonamiento extendido; no debe asumirse que existan.
- Capacidades multilingues: no disponibles en la documentacion; el caso de uso documentado esta en coreano.

## Casos de uso

- Extraccion de criterios de busqueda de aparcamiento: dado un enunciado como "necesito parking cubierto cerca del centro por menos de 10 euros", el modelo devuelve el JSON correspondiente con filtros normalizados, listo para consumir por una API de busqueda.
- Interfaces de voz a datos en el navegador: al ejecutarse con transformers.js, puede combinarse con reconocimiento de voz en cliente para convertir consultas habladas en consultas estructuradas sin enviar audio ni texto a un servidor.
- Prototipado de formularios inteligentes: relleno automatico de campos de busqueda a partir de lenguaje natural, sin backend ni coste de inferencia.
- Aplicaciones offline o con conectividad limitada: al correr integramente en el dispositivo, funciona sin red una vez cargados los pesos.
- Patron replicable de micro-ajuste: sirve como referencia para afinar Gemma 3 270M en otras tareas de extraccion JSON (reservas, filtros de e-commerce, etc.).
- Validacion de cuantizacion: caso practico de como fp16 en ONNX preserva la precision del fp32 mientras que 4bit/8bit no, util para decidir formatos de despliegue en navegador.

## Benchmarks y rendimiento

El unico dato publicado por el autor es el siguiente:

| Evaluacion | Resultado |
|---|---|
| Coincidencia exacta (exact match) en 131 preguntas de evaluacion | 67,2 % (fp16 ONNX, identico a fp32) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 3,0 GB en HuggingFace; el peso ONNX fp16 de un modelo de 270M de parametros deberia rondar los 500-600 MB, por lo que la cifra del repo puede incluir multiples variantes o archivos adicionales (dato no confirmado en la model card).
- No requiere GPU dedicada: esta pensado para ejecutarse en navegador mediante transformers.js sobre WebGPU o WebAssembly, en CPU de escritorio o movil.
- En servidor, cualquier GPU moderna (incluso una RTX 3060 con 8-12 GB de VRAM) ejecutaria el modelo con holgura; el tamano no justifica hardware tipo A100/H100.
- Despliegue recomendado: transformers.js en cliente. Otras vias posibles (Ollama, llama.cpp, vLLM, TGI) requeririan pesos en GGUF o safetensors, no publicados en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Caso de uso | Licencia |
|---|---|---|---|---|
| kimrahui/parking-gemma-270m-v2-onnx | 270M (LoRA) | ONNX fp16 | Extraccion JSON de parking, en navegador | Gemma |
| google/gemma-3-270m-it (base) | 270M | safetensors | Modelo instruido generalista compacto | Gemma |
| Qwen2.5-0.5B-Instruct | 500M | safetensors / GGUF | Modelo instruido generalista compacto | Apache 2.0 |
| SmolLM2-360M-Instruct (HuggingFace) | 360M | safetensors / GGUF | Modelo instruido generalista compacto | Apache 2.0 |

Respecto a las alternativas, parking-gemma-270m-v2-onnx destaca por su despliegue nativo en navegador (ONNX/transformers.js) y su afinado especifico en extraccion estructurada, mientras que Qwen2.5-0.5B y SmolLM2-360M ofrecen licencias permisivas (Apache 2.0) y un ecosistema mas amplio de cuantizaciones, a costa de no estar ajustados para esta tarea concreta.

## Limitaciones y advertencias

- Especializacion extrema: el ajuste LoRA esta orientado a la extraccion de criterios de aparcamiento; su comportamiento en tareas generales puede haberse degradado respecto al modelo base.
- Las variantes 4bit y 8bit no se distribuyen porque reducen significativamente la precision: no intentar cuantizar por debajo de fp16 sin reevaluar.
- Riesgo de alucinacion tipico de modelos de 270M de parametros: en extraccion JSON conviene validar el esquema de salida antes de consumirlo.
- Idiomas: la documentacion solo describe uso en coreano; el rendimiento en castellano no esta documentado.
- Licencia Gemma: su uso esta sujeto a los terminos de Google (https://ai.google.dev/gemma/terms), que incluyen restricciones y prohibiciones de uso; no es una licencia permisiva tipo Apache o MIT.
- Datos de contexto, entrenamiento y benchmarks estandar: no disponibles, lo que dificulta evaluar el modelo mas alla del caso de uso del autor.
- Popularidad muy baja (526 descargas, 1 like en el momento de la ficha): proyecto de un autor individual, sin garantia de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kimrahui/parking-gemma-270m-v2-onnx
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms

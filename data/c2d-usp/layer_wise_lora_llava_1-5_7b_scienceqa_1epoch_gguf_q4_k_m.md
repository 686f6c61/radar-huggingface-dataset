# c2d-usp/layer_wise_lora_llava_1.5_7B_scienceqa_1epoch_GGUF_Q4_K_M

## Resumen

El modelo `c2d-usp/layer_wise_lora_llava_1.5_7B_scienceqa_1epoch_GGUF_Q4_K_M` es un derivado cuantizado en formato GGUF de un ajuste fino de LLaVA 1.5 7B. Segun la nomenclatura del identificador, se trata de un modelo multimodal construido sobre LLaVA 1.5 de 7B de parametros, al que se le ha aplicado un ajuste fino mediante LoRA por capas (layer-wise LoRA) sobre el conjunto de datos ScienceQA durante una sola epoca. El resultado se ha convertido a GGUF con cuantizacion Q4_K_M, lo que reduce el tamano del repositorio a aproximadamente 4,7 GB.

El modelo se orienta a tareas de respuesta visual a preguntas (VQA) de caracter cientifico y educativo, dado el dataset de ajuste (ScienceQA), que combina preguntas de ciencia con imagenes y texto. Esta pensado para ejecutarse en entornos de inferencia local con hardware de gama media, al emplear cuantizacion de 4 bits y ser compatible con endpoints de HuggingFace (etiqueta `endpoints_compatible`).

La relevancia de esta ficha es limitada dado que se trata de un modelo con 0 descargas y 0 likes en el momento de la consulta, sin model card descriptiva (unicamente la linea de licencia) y sin resultados de benchmarks publicados. La informacion disponible se reduce a los metadatos del repositorio y a los parametros declarados en la propia nomenclatura del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LLaVA 1.5 7B, base derivada de Llama 2 / Vicuna 1.5 con vision encoder CLIP); inferido por nomenclatura, no confirmado en la model card |
| Parametros totales | 6.738.939.904 (dato real, safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unica version publicada en este repositorio) |
| Idiomas soportados | No disponible (no especificado; el ajuste ScienceQA es predominantemente en ingles) |
| Licencia | llama2 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Segun el identificador del modelo, la base es LLaVA 1.5 7B, una arquitectura multimodal que combina un vision encoder (tipicamente CLIP ViT-L/14 en LLaVA 1.5) con un modelo de lenguaje de 7B (Vicuna 1.5, derivado de Llama 2). Sobre esta base se ha aplicado un ajuste fino mediante LoRA por capas (layer-wise LoRA), una estrategia en la que se insertan adaptadores de bajo rango en distintas capas del modelo en lugar de reentrenar todos los pesos. El conjunto de datos empleado es ScienceQA, un corpus de preguntas y respuestas de ciencia con soporte de imagenes, y el ajuste se realizo durante una unica epoca, segun se desprende del sufijo `1epoch` del nombre.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, la configuracion de hiperparametros, el rango de los adaptadores LoRA, ni si se aplicaron fases adicionales de RLHF o DPO. Tampoco hay datos sobre posibles innovaciones tecnicas mas alla del propio esquema de LoRA por capas. La model card no aporta ninguna descripcion tecnica mas alla de la linea de licencia `llama2`.

## Capacidades

- Respuesta visual a preguntas (VQA) sobre imagenes, con foco en contenido cientifico y educativo (derivado del dataset ScienceQA).
- Generacion de texto conversacional, dado que el repositorio incluye la etiqueta `conversational`.
- Razonamiento multimodal basico: combinacion de informacion de imagen y texto para producir una respuesta.
- Inferencia en formato GGUF, lo que permite su uso en herramientas de cuantizacion y ejecucion local.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente o razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues mas alla de lo indicado.
- No se documentan modos especiales (thinking mode, audio, etc.).

## Casos de uso

- Asistente educativo de ciencias: el modelo puede responder preguntas sobre diagramas, tablas y figuras de libros de texto, aprovechando el ajuste sobre ScienceQA para tareas de comprension visual con terminologia cientifica.
- Correccion automatica de ejercicios con imagenes: en plataformas de aprendizaje, se le puede enviar una fotografia de un problema de fisica o quimica y obtener una respuesta o justificacion, reduciendo la carga de revision manual.
- Tutoria interactiva multi-turno: al ser un modelo conversacional, permite mantener un dialogo de refuerzo sobre un tema cientifico a partir de una imagen de referencia.
- Indexado y etiquetado de recursos educativos: generar descripciones o preguntas asociadas a imagenes de un repositorio docente para mejorar su busqueda y catalogacion.
- Accesibilidad: describir el contenido de figuras cientificas a usuarios con discapacidad visual, integrado en lectores de pantalla mediante una API local.
- Prototipado rapido en investigacion: servir como punto de partida para experimentos de VQA cientifica en entornos con recursos limitados, gracias a su cuantizacion Q4_K_M y su ejecucion en GPU de gama media.
- Despliegue en el borde (edge): su tamano de 4,7 GB permite ejecutarlo en estaciones de trabajo sin GPU de datacenter, util para demos y validacion de conceptos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas y la busqueda web no aporto datos relevantes sobre este modelo. No se dispone de cifras de MMLU, HumanEval, GSM8K, ScienceQA ni de ninguna otra evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantizacion Q4_K_M ocupa aproximadamente 4-5 GB, por lo que se estima un uso de VRAM en el rango de 6 a 8 GB incluyendo overhead y el vision encoder. Valor estimado, no confirmado por el autor.
- GPU recomendadas: no documentadas. Por tamano, serian adecuadas GPUs con al menos 8 GB de VRAM, como RTX 3060 Ti, RTX 4060 Ti, RTX 3070 o superiores.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). No confirmado por el autor.
- Opciones de despliegue: llama.cpp, llama-server, Ollama y otras herramientas compatibles con GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints, si bien el soporte GGUF en vLLM es limitado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| layer_wise_lora_llava_1.5_7B_scienceqa_1epoch_GGUF_Q4_K_M | 6,74 B | No disponible | llama2 | GGUF | Ajuste LoRA por capas sobre ScienceQA, 1 epoca, cuantizado Q4_K_M |
| LLaVA 1.5 7B (original) | ~7 B | 4096 (LLaVA 1.5, dato general no confirmado para este repositorio) | Llama 2 / Apache-2.0 segun variante | safetensors / GGUF | Modelo base multimodal sin ajuste especifico de ScienceQA |
| LLaVA 1.6 (Mistral 7B) | ~7 B | 4096 (dato general) | Apache-2.0 segun variante | safetensors / GGUF | Version posterior con mejor resolucion de imagen y OCR |

Los datos de los modelos comparables corresponden a caracteristicas generales conocidas de esas familias y no a mediciones realizadas sobre este repositorio concreto. No se dispone de comparaciones de rendimiento cuantitativas.

## Limitaciones y advertencias

- La model card no incluye ninguna descripcion tecnica, por lo que se desconoce la configuracion exacta del entrenamiento y los hiperparametros del ajuste LoRA.
- No se han publicado evaluaciones ni benchmarks; el rendimiento real en tareas distintas de ScienceQA es incierto.
- Al derivar de Llama 2 y de un corpus predominantemente en ingles, es probable que el rendimiento en castellano sea limitado, si bien este extremo no esta confirmado.
- Riesgo de alucinacion: como cualquier modelo generativo multimodal, puede producir respuestas plausibles pero incorrectas, especialmente en preguntas cientificas con imagenes ambiguas.
- Sesgos conocidos: no documentados por el autor. Los sesgos heredados de Llama 2 / Vicuna y del dataset ScienceQA no han sido evaluados ni mitigados de forma explicita.
- Restricciones de licencia: se distribuye bajo la licencia llama2, que impone condiciones de uso (incluidas clausulas para uso comercial y requisitos de atribucion). Debe revisarse la licencia completa antes de cualquier uso en produccion.
- Superficie de uso reducida: con 0 descargas y 0 likes, no hay evidencia de validacion por parte de la comunidad.
- La fecha de creacion del repositorio indicada en los metadatos es posterior a la de esta consulta (2026-10-14), lo que conviene verificar.

## Enlaces

- HuggingFace: https://huggingface.co/c2d-usp/layer_wise_lora_llava_1.5_7B_scienceqa_1epoch_GGUF_Q4_K_M
- No se encontraron enlaces relevantes en la busqueda web: los resultados obtenidos corresponden a entidades no relacionadas con el modelo (C2D Bordeaux Metropole, Contrat de desendettement et de developpement, C2D Prevention, C2D Services) y no aportan informacion sobre este repositorio.

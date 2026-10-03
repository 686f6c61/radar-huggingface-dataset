# OpenFlowLM/medgemma-4b-it-NPU2

## Resumen

OpenFlowLM/medgemma-4b-it-NPU2 es una variante derivada de google/medgemma-4b-it, el modelo multimodal medico de 4 000 millones de parametros publicado por Google dentro de la familia Gemma 3. Este repositorio concreto ha sido subido por el usuario OpenFlowLM como un fine-tuning o adaptacion del modelo base, y su nombre sugiere una orientacion a despliegue sobre aceleradores de tipo NPU, aunque la informacion disponible no confirma ni detalla ese proceso de conversion u optimizacion. El modelo hereda la arquitectura del base: un transformer de lenguaje Gemma 3 acoplado a un codificador de imagen SigLIP preentrenado especificamente con datos medicos desidentificados.

El problema que resuelve es la comprension conjunta de texto e imagenes en dominio clinico: lectura de radiografias de torax, dermatologia, oftalmologia, histopatologia y razonamiento clinico sobre historiales. Frente a modelos de vision-lenguaje generalistas, MedGemma 4B se entreno con corpus medicos y con pares pregunta-respuesta clinicos, lo que lo hace mas adecuado como punto de partida para aplicaciones sanitarias que un VLM de proposito general.

La relevancia actual radica en que permite ejecutar razonamiento multimodal medico en hardware relativamente modesto (4B de parametros), a diferencia de las variantes de 27B del mismo programa. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 4,8 GB y esta sujeto a la licencia Health AI Developer Foundations de Google, con acceso controlado mediante gating en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: LLM Gemma 3 + codificador de imagen SigLIP (según la model card del modelo base) |
| Parametros totales | 4B (aproximadamente 4 000 millones; heredado del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens según la familia Gemma 3; no confirmado explicitamente en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el modelo base se distribuye en bfloat16) |
| Idiomas soportados | No disponibles |
| Licencia | Health AI Developer Foundations (license: other), con acceso gated |
| Formato de pesos | No confirmado explicitamente; libreria transformers y repositorio de 4,8 GB (compatible con safetensors/GGUF, no verificado) |

## Arquitectura y entrenamiento

El modelo base google/medgemma-4b-it combina un LLM de la familia Gemma 3 con un codificador de imagen SigLIP entrenado previamente sobre datos medicos desidentificados que incluyen radiografias de torax, imagenes de dermatologia, imagenes de oftalmologia y laminas de histopatologia. El componente de lenguaje se entreno con un conjunto diverso de datos medicos: texto clinico, pares pregunta-respuesta medicos, imagenes de radiologia, parches de histopatologia e imagenes dermatologicas y oftalmologicas. La version `-it` es la variante afinada por instrucciones, recomendada como punto de partida para la mayoria de aplicaciones.

La informacion disponible no detalla el proceso de entrenamiento especifico aplicado por OpenFlowLM sobre este repositorio (si se trata de un fine-tuning adicional, de una conversion a NPU o de una reempaquetado de pesos). Tampoco se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO en esta variante concreta. Para los detalles tecnicos del modelo original se remite al informe tecnico de MedGemma (arXiv:2507.05201).

## Capacidades

- Comprension de imagen y texto (image-text-to-text) en dominio medico: radiografias de torax, dermatologia, oftalmologia e histopatologia.
- Generacion de texto clinico e informes descriptivos a partir de imagenes medicas.
- Razonamiento clinico sobre casos que combinan hallazgos visuales y contexto textual.
- Respuesta a preguntas medicas en formato conversacional (pipeline conversacional segun los tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (el campo de idiomas figura como no disponible).
- Modo "thinking" explicito, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Triaje de radiografias de torax: el modelo puede recibir una imagen de rayos X y generar una descripcion estructurada de hallazgos, sirviendo como primer filtro en flujos de radiologia donde el volumen de estudios supera la capacidad de lectura inmediata.
- Apoyo a la redaccion de informes radiologicos: dado que acepta entrada image-text-to-text, puede generar borradores de informe que el radiologo revisa y edita, reduciendo el tiempo de dictado en estudios rutinarios.
- Analisis descriptivo en dermatologia: clasificacion y descripcion de lesiones cutaneas a partir de fotografias clinicas, aprovechando el preentrenamiento del codificador SigLIP con imagenes dermatologicas.
- Apoyo en oftalmologia: interpretacion de imagenes de fondo de ojo y generacion de texto asociado, dentro de un pipeline de cribado asistido.
- Analisis de laminas de histopatologia: procesamiento de parches histopatologicos para generar descripciones textuales que asistan al patologo en la revision preliminar.
- Razonamiento clinico conversacional: uso como asistente multi-turno para discutir un caso concreto aportando imagenes y texto, util en sesiones de formacion o en la preparacion de resumenes de caso.
- Generacion de datos y anotacion asistida para investigacion: produccion de descripciones textuales sobre conjuntos de imagenes medicas para preanotar datasets que luego se validan manualmente.
- Educacion medica: simulacion de casos clinicos con imagenes reales o de archivo donde el modelo explica hallazgos y responde preguntas de estudiantes, siempre bajo supervision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este repositorio en la informacion disponible. La model card del modelo base indica que las variantes de MedGemma se han evaluado en un conjunto de benchmarks clinicamente relevantes basados tanto en datasets abiertos como en datasets curados, y remite al informe tecnico (arXiv:2507.05201) para los detalles. No se dispone de cifras concretas (MMLU, GSM8K, HumanEval ni benchmarks medicos especificos) en la informacion proporcionada para esta variante, por lo que no se reproducen numeros.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16/fp16: aproximadamente 9-12 GB, considerando los 4B parametros del LLM mas el codificador SigLIP y el overhead de activaciones (estimacion basada en el tamano del modelo; no confirmada en la informacion proporcionada).
- VRAM estimada en cuantizacion int8: del orden de 5-7 GB.
- VRAM estimada en cuantizacion int4/GGUF Q4: del orden de 3-5 GB.
- GPU recomendadas: NVIDIA A100 o H100 para despliegue a escala; RTX 4090 o RTX 3090 (24 GB) para desarrollo e inferencia local sin cuantizar.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090, 4080, 3090, 4070 Ti y, en cuantizaciones bajas, en GPUs de 6-8 GB.
- Opciones de despliegue: la libreria indicada es transformers; el modelo base es compatible con el ecosistema Gemma 3 (transformers >= 4.50.0). El repositorio esta etiquetado como `endpoints_compatible`. Compatibilidad con vLLM, llama.cpp, Ollama o TGI no se confirma en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles. El sufijo "NPU2" sugiere una orientacion a aceleradores NPU, pero no se aportan mediciones.
- Nota: para uso a escala, la model card del base recomienda crear una version de produccion mediante Google Cloud Model Garden.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenFlowLM/medgemma-4b-it-NPU2 | 4B | No confirmado (familia Gemma 3) | Imagen + texto | Health AI Developer Foundations (gated) | Hugging Face, 0 descargas, 0 likes |
| google/medgemma-4b-it | 4B | No confirmado en la informacion | Imagen + texto | Health AI Developer Foundations (gated) | Hugging Face y Google Cloud Model Garden |
| google/medgemma-27b-it | 27B | No confirmado en la informacion | Imagen + texto o solo texto | Health AI Developer Foundations (gated) | Hugging Face y Google Cloud Model Garden |
| MedSigLIP | Codificador de imagen | No aplica | Imagen (sin generacion de texto) | Health AI Developer Foundations | Documentacion de Google |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; los modelos entrenados con datos clinicos pueden heredar sesgos de representacion de las poblaciones presentes en los datasets.
- Riesgo de alucinacion: es un modelo generativo, por lo que puede producir hallazgos o afirmaciones clinicas no sustentadas por la imagen o el contexto. Requiere supervision profesional.
- Idioma: el campo de idiomas figura como no disponible, por lo que no hay garantia de cobertura multilingue ni de calidad en castellano.
- Licencia: el uso esta gobernado por los terminos de Health AI Developer Foundations de Google, con acceso restringido mediante gating en Hugging Face. Es imprescindible revisar dichos terminos antes de cualquier uso comercial.
- Uso clinico: no hay evidencia en la informacion proporcionada de validacion regulatoria ni de uso aprobado como dispositivo medico. No debe emplearse para diagnostico autonomo.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes, sin documentacion propia adicional sobre el proceso de fine-tuning o conversion aplicado por OpenFlowLM. La model card es la del modelo base de Google, no una descripcion especifica de esta variante.
- Formato y compatibilidad: no se confirma que los pesos esten en safetensors, GGUF ni en un formato especifico para NPU, pese al sufijo "NPU2".
- Adaptacion a NPU: la denominacion sugiere optimizacion para NPU, pero no se aportan detalles tecnicos, requisitos de runtime ni herramientas de conversion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OpenFlowLM/medgemma-4b-it-NPU2
- Modelo base: https://huggingface.co/google/medgemma-4b-it
- Documentacion de MedGemma (Google): https://developers.google.com/health-ai-developer-foundations/medgemma
- Model card de MedGemma: https://developers.google.com/health-ai-developer-foundations/medgemma/model-card
- Terminos de licencia (Health AI Developer Foundations): https://developers.google.com/health-ai-developer-foundations/terms
- MedGemma en Google Cloud Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/medgemma
- Coleccion de MedGemma en Hugging Face: https://huggingface.co/collections/google/medgemma-release-680aade845f90bec6a3f60c4
- Coleccion de aplicaciones de concepto: https://huggingface.co/collections/google/medgemma-concept-apps-686ea036adb6d51416b0928a
- Repositorio GitHub: https://github.com/google-health/medgemma
- Notebook de inicio rapido: https://github.com/google-health/medgemma/blob/main/notebooks/quick_start_with_hugging_face.ipynb
- Notebook de fine-tuning: https://github.com/google-health/medgemma/blob/main/notebooks/fine_tune_with_hugging_face.ipynb
- Informe tecnico de MedGemma: https://arxiv.org/abs/2507.05201
- Documentacion de MedSigLIP: https://developers.google.com/health-ai-developer-foundations/medsiglip/model-card
- Articulo de SigLIP: https://arxiv.org/abs/2303.15343
- Referencias adicionales citadas en los tags del repositorio (sin titulo especificado en la informacion disponible): arXiv:2405.03162, arXiv:2106.14463, arXiv:2412.03555, arXiv:2501.19393, arXiv:2009.13081, arXiv:2102.09542, arXiv:2411.15640, arXiv:2404.05590, arXiv:2501.18362

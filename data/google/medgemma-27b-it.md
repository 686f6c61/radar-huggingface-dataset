# google/medgemma-27b-it

## Resumen

MedGemma 27B IT es un modelo multimodal de generacion de texto e imagenes desarrollado por Google, especializado en el ambito medico. Se construye a partir de google/gemma-3-27b-pt mediante ajuste supervisado e instruction tuning sobre datos clinicos y biomedicos, y esta disenado para tareas de interpretacion de imagenes medicas (radiografias de torax, dermatologia, fondo de ojo y patologia) y para razonamiento sobre texto medico. Su publicacion forma parte de la familia MedGemma, que incluye variantes de 4B y 27B, y responde a la necesidad de disponer de modelos abiertos con capacidades clinicas razonables sin depender unicamente de APIs propietarias.

El modelo emplea la arquitectura transformer multimodal de Gemma 3, con un codificador visual SigLIP y un decodificador de lenguaje, y cuenta con 28.842.036.848 parametros totales (aproximadamente 28,8 mil millones) en formato safetensors. Su ventana de contexto hereda la de Gemma 3 27B (128 000 tokens), lo que permite procesar historiales clinicos extensos junto con imagenes en una misma conversacion. El pipeline declarado es image-text-to-text y el modelo esta pensado para uso conversacional.

Es relevante ahora porque es uno de los pocos modelos multimodales medicos abiertos de gran tamano publicados por un laboratorio de primer nivel, con soporte nativo en transformers y text-generation-inference. El acceso esta restringido (gated) en HuggingFace y su licencia, Health AI Developer Foundations, impone condiciones especificas para uso comercial y clinico. La model card indica que no esta validado para diagnostico clinico directo y que requiere evaluacion adicional antes de cualquier despliegue en entornos sanitarios reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador de lenguaje basado en Gemma 3 + codificador visual SigLIP), segun la model card; detalles finos no disponibles |
| Parametros totales | 28 842 036 848 (~28,8 mil millones) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | 128 000 tokens (heredada de google/gemma-3-27b-pt; no confirmada de forma explicita en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repositorio publica pesos en safetensors (BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | health-ai-developer-foundations (Health AI Developer Foundations) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 54,9 GB |
| Modelo base | google/gemma-3-27b-pt |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Fecha de creacion | 2025-07-09 |

## Arquitectura y entrenamiento

La informacion disponible indica que MedGemma 27B IT es un ajuste (finetune) de google/gemma-3-27b-pt, por lo que hereda la arquitectura multimodal de Gemma 3: un transformer decodificador de lenguaje combinado con un codificador visual que proyecta representaciones de imagen al espacio del modelo de lenguaje. La model card etiqueta el modelo como image-text-to-text y menciona capacidades de extraccion de embeddings medicos, clasificacion de imagenes (incluida clasificacion zero-shot) y generacion de informes radiologicos, lo que sugiere que la torre visual se ha adaptado a dominios como radiologia de torax, dermatologia, fondo de ojo y patologia.

No se especifica en la informacion proporcionada el numero exacto de tokens de entrenamiento, la composicion detallada del dataset clinico, ni si se emplearon tecnicas concretas de alineacion como RLHF o DPO mas alla del instruction tuning implicito en el sufijo "it". Tampoco se detallan innovaciones especificas de decodificacion o atencion (por ejemplo, decodificacion especulativa o atencion lineal) para esta variante. La lista de referencias arXiv asociada al modelo (entre ellas la correspondiente al informe tecnico de MedGemma) apunta a que el entrenamiento se apoya en literatura previa de imagenes medicas y de la familia Gemma, pero los detalles cuantitativos no estan disponibles en la informacion facilitada.

## Capacidades

- Generacion de texto conversacional en ingles con soporte de contexto largo (hasta 128 000 tokens segun el modelo base).
- Comprension de imagenes medicas: radiografias de torax, imagenes de dermatologia, fondo de ojo y muestras de patologia.
- Generacion de informes radiologicos a partir de imagenes (radiology report generation).
- Clasificacion de imagenes medicas, incluida clasificacion zero-shot.
- Extraccion de embeddings de imagenes medicas (medical-embeddings) para busqueda o recuperacion.
- Extraccion de caracteristicas visuales (image-feature-extraction).
- Razonamiento sobre texto clinico y respuestas a preguntas de dominio medico.
- Soporte declarado de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idiomas del repositorio.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.
- Capacidades de audio o video: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de borradores de informes radiologicos: a partir de una radiografia de torax, el modelo produce un texto descriptivo estructurado que un radiologo revisa y edita, reduciendo el tiempo de dictado.
- Triage de imagenes dermatologicas: clasificacion inicial de lesiones cutaneas en un pipeline de cribado, derivando los casos dudosos a revision especializada.
- Soporte a la decision clinica sobre texto: resumen de historiales y notas clinicas extensas aprovechando la ventana de contexto larga, con el medico como validador final.
- Indexacion y busqueda semantica de imagenes medicas: uso de los embeddings medicos para construir un sistema de recuperacion de casos similares en un archivo hospitalario.
- Formacion medica asistida: generacion de explicaciones y preguntas de repaso sobre casos clinicos e imagenes para estudiantes de medicina, siempre con supervision docente.
- Investigacion en patologia computacional: extraccion de caracteristicas visuales de laminas histologicas para alimentar modelos o analisis posteriores en estudios retrospectivos.
- Preanotacion de datasets medicos: clasificacion zero-shot y etiquetado asistido de grandes volumenes de imagenes antes de la revision humana.
- Asistencia en documentacion clinica: conversion de hallazgos descritos en texto e imagenes en resumenes estructurados para sistemas de historia clinica electronica, con revision obligatoria por personal sanitario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los metadatos de HuggingFace facilitados no incluyen tablas con puntuaciones de MMLU, MedQA, VQA-RAD, SLAKE, HumanEval, GSM8K ni de otras pruebas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 58 GB solo para pesos, mas memoria adicional para el codificador visual y la cache KV; en la practica requiere multiples GPU o una GPU de 80 GB.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 29-32 GB de pesos, viable en una A100 40 GB o H100 40 GB con margen limitado.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 15-17 GB de pesos; podria caber en RTX 4090 (24 GB) o L40S, aunque la informacion proporcionada no confirma pesos cuantizados oficiales.
- GPU recomendadas: H100 80 GB, A100 80 GB, o configuraciones multi-GPU (por ejemplo, 2x A100 40 GB) para precision completa.
- GPU de consumo: no cabe en BF16 en tarjetas de 24 GB o menos; con cuantizacion agresiva podria intentarse en RTX 4090 o RTX 3090, sujeto a que existan pesos cuantizados y a comprobacion empirica.
- Opciones de despliegue: transformers, text-generation-inference (TGI) y endpoints compatibles, segun las etiquetas del repositorio. El soporte de llama.cpp, Ollama o vLLM no esta confirmado en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| MedGemma 27B IT (google) | ~28,8 B | 128 000 tokens (segun modelo base) | Imagen + texto | Health AI Developer Foundations (gated) | Restringido en HuggingFace |
| MedGemma 4B IT (google) | ~4 B (segun la familia; dato exacto no disponible aqui) | no disponible | Imagen + texto | Health AI Developer Foundations | Restringido en HuggingFace |
| Qwen2.5-VL-32B-Instruct (Alibaba) | ~32 B | 128 000 tokens (segun documentacion publica del modelo) | Imagen + texto | Apache 2.0 (segun publicacion del modelo) | Abierto |
| Llama 3.2 11B Vision (Meta) | ~11 B | 128 000 tokens (segun documentacion publica) | Imagen + texto | Llama 3.2 Community License | Restringido con condiciones |

El rendimiento comparado en tareas medicas no esta disponible en la informacion proporcionada. La comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- No validado para diagnostico clinico: los modelos MedGemma estan disenados como base para investigacion y desarrollo, no como dispositivo medico; se requiere validacion regulatoria y clinica antes de uso en pacientes.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir hallazgos, medidas o diagnosticos plausibles pero incorrectos, especialmente con imagenes de baja calidad o fuera de distribucion.
- Sesgos de datos: el entrenamiento se apoya en datasets clinicos que pueden sobrerrepresentar determinadas poblaciones, equipos de imagen o practicas hospitalarias; el sesgo demografico y geografico no esta cuantificado en la informacion disponible.
- Idioma: soporte limitado al ingles, lo que restringe su uso directo en entornos hispanohablantes sin traduccion o ajuste adicional.
- Licencia: Health AI Developer Foundations impone condiciones especificas; es imprescindible revisar los terminos antes de cualquier uso comercial o clinico. El acceso es restringido (gated) y requiere aceptar condiciones en HuggingFace.
- Contexto: aunque la ventana es amplia, el rendimiento en contextos muy largos con muchas imagenes no esta documentado en la informacion proporcionada.
- Formatos de cuantizacion oficiales no confirmados: puede requerir conversion manual para despliegues con llama.cpp u otros runtimes ligeros.
- Coste de despliegue: con casi 29 000 millones de parametros en BF16, la inferencia exige hardware de gama alta, lo que limita su uso en entornos con recursos reducidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/google/medgemma-27b-it
- Modelo base: https://huggingface.co/google/gemma-3-27b-pt
- Referencias arXiv citadas en la model card (IDs): arXiv:2303.15343, arXiv:2507.05201, arXiv:2405.03162, arXiv:2106.14463, arXiv:2412.03555, arXiv:2501.19393, arXiv:2009.13081, arXiv:2102.09542, arXiv:2411.15640, arXiv:2404.05590, arXiv:2501.18362
- Acceso a las referencias: https://arxiv.org/abs/2507.05201 (informe tecnico citado en la model card)
- Pagina de la familia Gemma: https://ai.google.dev/gemma
- Terminos de la licencia Health AI Developer Foundations: no disponible en la informacion proporcionada (consultar la model card en HuggingFace)

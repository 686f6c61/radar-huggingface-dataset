# COIL-D/translate-it2-hindi-dogri

## Resumen

COIL-D/translate-it2-hindi-dogri es un modelo de traduccion automatica neuronal especializado en el par de idiomas hindi (hi) ↔ dogri (doi), publicado por el usuario COIL-D en HuggingFace. Se trata de un ajuste fino (finetune) del modelo base ai4bharat/indictrans2-indic-indic-dist-320M, perteneciente a la familia IndicTrans2 desarrollada por AI4Bharat, orientada a la traduccion entre lenguas indias. El modelo cuenta con 320.861.184 parametros y se distribuye en formato safetensors con licencia MIT, aunque el acceso al repositorio esta restringido y requiere aceptar condiciones en HuggingFace.

El problema que resuelve es concreto: el dogri es una lengua indoaria hablada principalmente en Jammu y Cachemira, con recursos digitales y modelos de traduccion mucho mas escasos que el hindi. Al especializar un modelo IndicTrans2 en el par hi↔doi, se cubre un hueco de cobertura que los modelos multilingues genericos suelen resolver con calidad desigual en lenguas de bajos recursos. El pipeline declarado es `translation` y esta pensado para generacion texto-a-texto.

La relevancia actual del modelo radica en su tamano contenido (320M parametros, aproximadamente 1,3 GB de repositorio), lo que permite desplegarlo en hardware modesto, y en su licencia permisiva MIT, poco habitual en modelos de traduccion de alta calidad para lenguas indias. No obstante, la informacion publica disponible es limitada: no se han publicado resultados de benchmarks ni detalles del dataset de ajuste en la ficha del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) heredada de IndicTrans2 |
| Parametros totales | 320.861.184 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | hindi (hi) y dogri (doi) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | ai4bharat/indictrans2-indic-indic-dist-320M |
| Pipeline | translation (text2text-generation) |
| Libreria | transformers (requiere `trust_remote_code`) |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Tamano del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint ai4bharat/indictrans2-indic-indic-dist-320M, que pertenece a la familia IndicTrans2. La variante `dist-320M` es una version destilada de 320 millones de parametros de un modelo mayor, con arquitectura transformer encoder-decoder estandar para traduccion automatica. El repositorio publica codigo personalizado (`custom_code`), por lo que la carga del modelo requiere `trust_remote_code=True` en la libreria transformers. Los pesos se almacenan en safetensors y suman aproximadamente 320,9 millones de parametros, coherentes con el nombre del checkpoint base.

En cuanto a los datos de entrenamiento, no se especifica en la informacion disponible ni el numero de tokens utilizados en el ajuste fino, ni la composicion del corpus paralelo hi↔doi, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El etiquetado del repositorio indica que se trata de un `finetune` del modelo base y menciona un identificador de arXiv (2609.28826) entre las etiquetas, asi como una fecha de creacion de 2026-09-29, pero no se ha podido recuperar el contenido de dicho articulo ni verificar detalles metodologicos. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras) en la informacion proporcionada.

## Capacidades

- Traduccion automatica bidireccional hindi → dogri y dogri → hindi, segun los sufijos `hin-doi` y `doi-hin` del identificador del modelo.
- Generacion de texto condicionada (pipeline `text2text-generation`) mediante la libreria transformers.
- Cobertura limitada a dos idiomas: no se declaran capacidades para otras lenguas indias distintas del hindi y el dogri.
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte para agentes ni razonamiento multi-paso; se trata de un modelo puramente de traduccion.
- No se declaran capacidades multimodales (vision, audio) ni modo de razonamiento extendido (thinking mode).
- No se especifica si el modelo preserva el formato o las etiquetas de origen (por ejemplo, marcado HTML) durante la traduccion.

## Casos de uso

- Traduccion de documentacion administrativa en Jammu y Cachemira: el modelo puede convertir comunicados y formularios oficiales del hindi al dogri, facilitando el acceso de hablantes de dogri a informacion publicada unicamente en hindi.
- Localizacion de interfaces de aplicaciones moviles: integrado en un pipeline de CI/CD, permite generar cadenas de interfaz en dogri a partir de las versiones en hindi ya existentes, reduciendo el coste de mantener dos catalogos de traduccion manuales.
- Subtitulado y transcripcion de contenido audiovisual: el modelo puede traducir subtitulos en hindi a dogri, un caso util para plataformas de video que quieran ampliar su catalogo en lenguas regionales indias.
- Preservacion linguistica y corpus digitales: generacion de texto paralelo hi↔doi para alimentar repositorios linguisticos y herramientas de documentacion del dogri, una lengua con recursos digitales escasos.
- Atencion al ciudadano en servicios publicos: traduccion de consultas y respuestas entre un operador que trabaja en hindi y un usuario que escribe en dogri, con la posibilidad de desplegar el modelo en servidores locales.
- Traduccion de material educativo: conversion de apuntes y libros de texto del hindi al dogri para escuelas de la region, donde el material didactico en dogri es limitado.
- Investigacion en traduccion de bajos recursos: uso del modelo como linea base o punto de comparacion en estudios sobre tecnicas de ajuste fino aplicadas a lenguas indoarias minoritarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye metricas como BLEU, chrF, MMLU, HumanEval o GSM8K, y los resultados de la busqueda web no aportan datos evaluables sobre el modelo (las referencias recuperadas corresponden a terminos no relacionados, como el concepto siderurgico de "coil" o el grupo musical homonimo). Tampoco se han podido recuperar resultados del articulo con identificador arXiv 2609.28826 citado en las etiquetas del repositorio.

## Requisitos de hardware

- VRAM estimada en FP32: en torno a 1,3 GB solo para los pesos, mas el overhead de activaciones y cache; aproximadamente 2-3 GB en total para inferencia con lotes pequenos.
- VRAM estimada en FP16/BF16: alrededor de 0,65 GB para los pesos, con un consumo total tipico inferior a 2 GB.
- VRAM estimada en INT8: en torno a 0,35 GB para los pesos; la cuantizacion no esta documentada oficialmente, por lo que habria que generarla a partir de los pesos safetensors.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 4-6 GB de VRAM. Tambien es viable su ejecucion en CPU para cargas de trabajo por lotes no interactivas.
- GPU recomendadas para produccion con alto throughput: NVIDIA A100, H100 o L4/L40S para despliegues con multiples peticiones concurrentes; el tamano reducido del modelo hace que estas GPUs queden muy sobredimensionadas para una sola instancia, por lo que conviene ejecutar varias replicas por GPU.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True`), servidores de inferencia tipo TGI o vLLM (no verificados en la informacion disponible para este checkpoint), y exportacion a CTranslate2, formato habitualmente compatible con la familia IndicTrans2. La conversion a GGUF para llama.cpp u Ollama no esta documentada para este modelo y requeriria trabajo adicional al ser una arquitectura encoder-decoder.
- Latencia y throughput: no disponibles. Al ser un modelo de 320M parametros, se espera una latencia por frase del orden de milisegundos en GPU moderna, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Acceso | Benchmarks publicados |
|---|---|---|---|---|---|---|
| COIL-D/translate-it2-hindi-dogri | 320,9 M | hi, doi | no disponible | MIT | Restringido (gated) | no disponible |
| ai4bharat/indictrans2-indic-indic-dist-320M | 320 M | Lenguas indias (familia IndicTrans2) | no disponible | MIT (consultar ficha oficial) | Publico | Consultar ficha oficial |
| NLLB-200-distilled-600M | 600 M | 200 idiomas, incluido el hindi | no disponible | CC-BY-NC-4.0 (uso no comercial) | Publico | Consultar ficha oficial |

La comparativa cuantitativa de calidad de traduccion no puede completarse: no hay resultados de BLEU o chrF publicados en la informacion disponible para el modelo de COIL-D, y las alternativas indicadas no incluyen datos verificados en esta ficha. La diferencia mas relevante y verificable es la licencia: el modelo de COIL-D es MIT, mientras que NLLB-200-distilled-600M emplea una licencia no comercial, lo que condiciona su uso en productos. Otro modelo comparable, como Helsinki-NLP/opus-mt, no dispone de un par hi↔doi equivalente confirmado en la informacion disponible.

## Limitaciones y advertencias

- Idiomas restringidos: el modelo solo cubre hindi y dogri. No debe utilizarse para traduccion entre otras lenguas indias, aunque el checkpoint base IndicTrans2 si las soporte, ya que el ajuste fino puede haber degradado esas capacidades (olvido catastrofico).
- Riesgo de alucinacion: como cualquier modelo seq2seq entrenado con corpus paralelos limitados, puede generar traducciones plausibles pero incorrectas, omitir fragmentos o inventar contenido, especialmente en dominios especializados o con frases largas y ambiguas.
- Ausencia de benchmarks: no se han publicado metricas de calidad, por lo que la evaluacion en produccion exige una validacion propia con un conjunto de referencia hi↔doi antes de desplegarlo.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace. Esto anade un paso de gestion de credenciales y tokens en cualquier pipeline automatizado.
- Requiere `trust_remote_code`: el modelo incluye codigo personalizado, lo que implica ejecutar codigo no auditado en el proceso de carga. Conviene revisar el codigo del repositorio antes de usarlo en entornos sensibles.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero se debe conservar el aviso de copyright y no se ofrece garantia alguna. Conviene verificar tambien la licencia del modelo base (ai4bharat/indictrans2-indic-indic-dist-320M) y las condiciones de los corpus empleados en el ajuste, no detalladas en la informacion disponible.
- Sesgos potenciales: los corpus de traduccion suelen sobrerrepresentar registros formales o determinados dominios, lo que puede producir un estilo poco natural en conversaciones informales o en variantes dialectales del dogri.
- Contexto desconocido: al no documentarse la longitud de contexto, no se garantiza el comportamiento correcto con parrafos largos; los modelos IndicTrans2 trabajan habitualmente con segmentos cortos, por lo que se recomienda dividir el texto en unidades de frase o parrafo.
- Datos de publicacion extranos: las fechas de creacion y actualizacion del repositorio (2026-09-29) y el identificador arXiv son posteriores a la fecha de consulta habitual, por lo que no se ha podido validar su correspondencia con material publicado.
- Descargas y likes nulos: el modelo no muestra adopcion en HuggingFace, lo que reduce la probabilidad de encontrar incidencias resueltas, ejemplos de uso o soporte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/COIL-D/translate-it2-hindi-dogri
- Modelo base: https://huggingface.co/ai4bharat/indictrans2-indic-indic-dist-320M
- Referencia arXiv citada en las etiquetas: arxiv:2609.28826 (contenido no disponible en la informacion proporcionada)
- Repositorio de IndicTrans2 de AI4Bharat: no disponible en los resultados de busqueda proporcionados
- Demo o espacio asociado: no disponible en la informacion proporcionada

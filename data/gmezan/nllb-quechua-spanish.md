# gmezan/nllb-quechua-spanish

## Resumen

`gmezan/nllb-quechua-spanish` es un modelo de traduccion automatica neuronal especializado en el par de idiomas castellano-quechua (y viceversa), publicado en Hugging Face por el usuario gmezan. Se trata de un ajuste fino (fine-tuning) del modelo M2M-100 de Meta AI, segun indica la etiqueta de arquitectura `m2m_100` y la referencia al paper arXiv:1910.09700, que corresponde precisamente a la publicacion original de M2M-100. El modelo resuelve el problema de la traduccion entre una lengua de altos recursos como el castellano y una lengua indigena andina de bajos recursos como el quechua, un par para el que los modelos multilingues genericos suelen ofrecer un rendimiento pobre.

El modelo cuenta con 615.073.792 parametros totales, lo que lo situa en la gama de los modelos de traduccion de tamano medio, manejables en hardware de consumo con cuantizacion. El repositorio ocupa 17,3 GB, coherente con pesos almacenados en varios formatos o en precision completa. La model card publicada es una plantilla autogenerada por Hugging Face sin contenido sustantivo: no documenta autor, datos de entrenamiento, licencia ni idiomas de forma explicita, aunque la denominacion del modelo y las evaluaciones incluidas permiten inferir su proposito.

La relevancia actual del modelo radica en su especializacion: los sistemas de traduccion de proposito general rara vez cubren con calidad las lenguas indigenas de America Latina, y este tipo de ajustes finos representa un esfuerzo por colmar ese vacio con recursos limitados. Las evaluaciones publicadas en la propia model card aportan metricas BLEU y chrF++ sobre un conjunto de test de 12.671 frases, lo que permite una valoracion cuantitativa aunque modesta del rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (M2M-100) |
| Parametros totales | 615.073.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | castellano (spa_Latn) y quechua (quy_Latn) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura M2M-100, un transformer encoder-decoder multilingue disenado por Meta AI para traduccion directa entre pares de idiomas sin depender del ingles como pivote. La etiqueta `m2m_100` y la referencia al paper arXiv:1910.09700 confirman esta base. Con 615 millones de parametros, corresponde a una de las variantes de menor tamano de la familia M2M-100, lo que facilita su despliegue.

La informacion disponible no detalla el procedimiento de entrenamiento: no se especifican el numero de tokens utilizados, la composicion del corpus de ajuste fino, ni si se emplearon tecnicas de RLHF o DPO. La model card incluye unicamente una seccion de resultados de evaluacion con marcas de tiempo que sugieren un entrenamiento por epocas (se documentan al menos `epoch-1` y `epoch-2`), con un conjunto de test denominado `gmezan/quechua-spanish-parallel` y una referencia a `americasnlp2024/jw300`, lo que indica el uso de corpus paralelos vinculados a la competicion AmericasNLP 2024 y al corpus JW300. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion automatica bidireccional entre castellano y quechua (spa_Latn a quy_Latn y quy_Latn a spa_Latn).
- Generacion de texto condicionada a tarea (`text2text-generation`), propia de los modelos encoder-decoder.
- Manejo de texto en escritura latina para ambos idiomas, segun los codigos de idioma empleados en las evaluaciones.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de razonamiento explicito.
- Cobertura multilingue limitada al par castellano-quechua segun la evidencia disponible.

## Casos de uso

- Traduccion de documentacion administrativa al quechua: el modelo puede traducir comunicados, formularios y avisos oficiales del castellano al quechua, contribuyendo a la accesibilidad de servicios publicos para hablantes de esta lengua andina.
- Subtitulado y localizacion de contenidos educativos: util para generar subtitulos en quechua a partir de material audiovisual en castellano, apoyando iniciativas de educacion bilingue intercultural.
- Digitalizacion y traduccion de patrimonio oral y escrito: traduccion de textos historicos, relatos y transcripciones del quechua al castellano para su catalogacion en archivos y bibliotecas.
- Atencion ciudadana en lengua indigena: integracion en chatbots o sistemas de mensajeria para responder consultas en quechua traduciendolas al castellano y viceversa, con la advertencia de que el rendimiento medido es limitado.
- Investigacion linguistica y creacion de corpus: generacion de traducciones preliminares que sirvan como punto de partida para anotadores humanos en la construccion de corpus paralelos de mayor calidad.
- Preservacion y difusion cultural: traduccion de material literario y divulgativo hacia el quechua para publicaciones comunitarias, siempre con revision humana dada la calidad medida.

## Benchmarks y rendimiento

Los datos de evaluacion publicados en la model card corresponden al split de test de `gmezan/quechua-spanish-parallel` (12.671 frases) y a la referencia `americasnlp2024/jw300`.

| Epoca | Direccion | n | BLEU | chrF++ | Throughput |
|---|---|---:|---:|---:|---:|
| epoch-1 | spa_Latn -> quy_Latn | 12671 | 7,39 | 32,08 | 12,16 frases/s |
| epoch-1 | quy_Latn -> spa_Latn | 12671 | 12,78 | 31,21 | 12,16 frases/s |
| epoch-2 | spa_Latn -> quy_Latn | 1267 | no disponible (truncado) | no disponible (truncado) | 14,67 frases/s |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni metricas de benchmarks estandar como MMLU, HumanEval o GSM8K, que ademas no aplican a un modelo de traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,3 GB solo para pesos (615 M de parametros), mas memoria para activaciones y cache, tipicamente 2-4 GB en total.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,7-1 GB para pesos; en 4 bits, alrededor de 0,4-0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090; tambien funciona en GPU de datacenter como A100 o H100, aunque estan sobredimensionadas para este tamano.
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia por lotes con latencia aceptable.
- Opciones de despliegue: transformers (libreria nativa), vLLM y TGI para servido con encoder-decoder, y conversion a GGUF para llama.cpp u Ollama si se generan dichos formatos.
- Throughput medido en la evaluacion publicada: 12,16 frases/s en epoch-1 y 14,67 frases/s en epoch-2, aunque no se especifica el hardware empleado.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | BLEU spa->quy | Licencia |
|---|---|---:|---|---:|---|
| gmezan/nllb-quechua-spanish | 615 M | castellano, quechua | no disponible | 7,39 | no disponible |
| M2M-100 (base original) | 418 M / 1,2 B | 100 idiomas | no disponible | no disponible | MIT (segun publicacion original) |
| NLLB-200 (variantes pequenas) | 600 M | 200 idiomas | no disponible | no disponible | CC-BY-NC (segun publicacion original) |

La comparativa cuantitativa con alternativas no esta disponible en la informacion proporcionada; los datos de M2M-100 y NLLB-200 se citan solo como referencia de categoria y sus licencias corresponden a las publicaciones originales, no a este ajuste fino.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada sin informacion sustantiva: no se documentan sesgos, datos de entrenamiento ni procedencia del corpus.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido; debe consultarse al autor antes de cualquier despliegue productivo.
- El rendimiento medido es modesto: BLEU de 7,39 en castellano a quechua y 12,78 en sentido inverso, con chrF++ en torno a 31-32, lo que indica calidad limitada y necesidad de revision humana.
- Riesgo de alucinacion y de traducciones incorrectas en terminologia especializada, nombres propios y estructuras gramaticales propias del quechua.
- Cobertura limitada a un unico par de idiomas; no es un modelo multilingue de proposito general.
- La evaluacion se realizo sobre un unico conjunto de test vinculado a AmericasNLP 2024, por lo que la generalizacion a otros dominios no esta verificada.
- El repositorio de 17,3 GB sugiere la presencia de multiples artefactos o pesos duplicados; conviene revisar los archivos antes de descargar.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar el procesamiento de documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gmezan/nllb-quechua-spanish
- Paper de M2M-100 (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Conjunto de evaluacion referenciado (AmericasNLP 2024 / JW300): no disponible como enlace directo en la informacion proporcionada
- Repositorio del corpus de evaluacion `gmezan/quechua-spanish-parallel`: no disponible como enlace directo en la informacion proporcionada

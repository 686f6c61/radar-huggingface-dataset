# nunu-willump/whisper-large-v3-french-distil-dec16-ct2

## Resumen

`nunu-willump/whisper-large-v3-french-distil-dec16-ct2` es un espejo de preservación de los ficheros de inferencia en formato CTranslate2 del modelo `bofenghuang/whisper-large-v3-french-distil-dec16`, un ajuste fino en francés de la familia Whisper large-v3 con decodificador destilado. El repositorio no contiene entrenamiento, conversión ni modificación de pesos: según su propia model card, los ficheros son idénticos byte a byte al subdirectorio CT2 del repositorio original, fijado en el commit `16bd02185bdaa6b00fb4b0deb46e47ac1b754b8e`. El único cambio respecto al original es la reubicación de la carpeta CT2 francesa en la raíz del repositorio y la incorporación de documentos de atribución y procedencia.

El problema que resuelve es de disponibilidad: al publicar los pesos ya convertidos a CTranslate2, se puede ejecutar un modelo de reconocimiento automático de voz (ASR) en francés sin necesidad de realizar la conversión desde PyTorch ni de depender de la disponibilidad del repositorio de origen. Es relevante para despliegues en CPU, entornos sin GPU y pipelines de transcripción que priorizan el coste por hora sobre la latencia absoluta, ya que CTranslate2 está optimizado para inferencia eficiente en hardware convencional.

Se trata de un modelo denso de arquitectura encoder-decoder tipo transformer, especializado exclusivamente en francés (`language: fr`) y distribuido bajo licencia MIT. El repositorio CT2 ocupa 2,2 GB. El autor del espejo no documenta el número de parámetros, los datos de entrenamiento ni resultados de benchmarks, por lo que la mayor parte de las especificaciones de entrenamiento deben consultarse en la model card del repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper), con decodificador presumiblemente destilado segun el sufijo `dec16` del identificador; no confirmado en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (convencion de la arquitectura Whisper); longitud maxima de tokens de salida no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; CTranslate2 admite float32, float16, int8_float16 e int8. El ejemplo de uso de la model card emplea `compute_type="float32"` |
| Idiomas soportados | Frances (`fr`) |
| Licencia | MIT (se conserva ademas la licencia original de Whisper en `LICENSE-Whisper`) |
| Formato de pesos | CTranslate2 (`model.bin` y ficheros auxiliares de tokenizer/features), no safetensors ni GGUF |
| Tamano del repositorio | 2,2 GB |
| Modelo base | `bofenghuang/whisper-large-v3-french-distil-dec16` |
| Libreria | `ctranslate2` (compatible con `faster-whisper`) |
| Pipeline | `automatic-speech-recognition` |
| Descargas / likes | 12 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3: un transformer encoder-decoder que toma un espectrograma log-Mel de 80 canales calculado sobre ventanas de audio de 30 segundos, lo procesa con el encoder y genera texto de forma autorregresiva con el decodificador. El identificador del modelo base incluye el sufijo `dec16`, lo que sugiere un proceso de destilacion con el decodificador reducido a 16 capas frente a las 32 de Whisper large-v3, pero esta deduccion procede unicamente del nombre del modelo y no esta confirmada por la informacion disponible. Conviene verificar el detalle en la model card del repositorio original.

No hay informacion sobre el volumen de datos de entrenamiento, la composicion del corpus en frances empleado, la aplicacion de tecnicas de alineamiento como RLHF o DPO, ni sobre innovaciones tecnicas adicionales. Este repositorio concreto no realiza ningun tipo de entrenamiento ni conversion: es una copia byte-identica de los pesos CT2 ya generados por terceros. Las unicas modificaciones son la reubicacion de la carpeta CT2 francesa a la raiz del repositorio y la adicion de los documentos `UPSTREAM_MODEL_CARD.md`, `LICENSE-Whisper` y `provenance.json`, este ultimo con referencias inmutables, tamanos y hashes SHA-256 del origen.

## Capacidades

- Reconocimiento automatico de voz (ASR) en frances: transcripcion de audio a texto con `faster-whisper` y CTranslate2.
- Deteccion de idioma y segmentacion temporal: la API de `faster-whisper` devuelve segmentos con marcas de tiempo, lo que habilita la generacion de subtitulos.
- Traduccion de voz a texto en ingles: capacidad heredada de la arquitectura Whisper; el ajuste fino en frances puede haberla degradado, por lo que no esta garantizada.
- Ejecucion en CPU: gracias a CTranslate2 y a los tipos de computo en coma flotante de 32 bits o cuantizaciones enteras.
- Inferencia por lotes y uso en servidor: CTranslate2 permite gestionar varias peticiones simultaneas con memoria controlada.
- No hay informacion sobre soporte de tool calling, capacidad de agente, razonamiento multi-paso, vision, audio de entrada mas alla de la transcripcion ni modo de pensamiento. Whisper es un modelo puramente de ASR y no expone ninguna de estas capacidades.

## Casos de uso

- Subtitulado de video en frances: el modelo transcribe con marcas de tiempo por segmento, lo que permite generar ficheros SRT o VTT directamente. Es adecuado para contenido francófono de entrevistas, formacion corporativa o documentales.
- Transcripcion de reuniones y actas: integrado en un pipeline que recibe el audio de una reunion, genera la transcripcion y la envia a un LLM posterior para resumir. Su naturaleza CT2 reduce el coste de ejecucion en servidores sin GPU.
- Atencion al cliente telefónica: transcripcion de llamadas grabadas en frances para analitica de calidad, deteccion de motivos de contacto y cumplimiento normativo. La ventana de 30 segundos por segmento encaja con el troceado habitual de llamadas largas.
- Indexacion y busqueda de archivos de audio: conversion masiva de un archivo historico de audio en frances a texto indexable en Elasticsearch u otro motor de busqueda, ejecutable en CPU con cuantizacion int8.
- Accesibilidad para contenido en frances: generacion automatica de subtitulos para plataformas educativas o administraciones publicas francófonas, con licencia MIT que facilita la integracion en productos propietarios.
- Investigacion en ASR y evaluacion de destilacion: al ser un modelo destilado publicado en CT2, sirve como punto de comparacion reproducible frente a Whisper large-v3 completo en terminos de latencia, memoria y calidad de transcripcion en frances.
- Preprocesado en pipelines de analisis de voz medica o legal: transcripcion previa a un analisis de contenido, aprovechando que la licencia MIT permite su uso comercial sin restricciones de atribucion mas alla del aviso de copyright.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es un espejo de ficheros de inferencia y no incluye tablas de WER (word error rate), evaluaciones sobre Common Voice, MLS ni ningun otro conjunto de evaluacion en frances. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, el repositorio CT2 ocupa 2,2 GB; en funcion del tipo de computo elegido, un modelo de esta familia y tamano suele requerir del orden de 6 GB en float32 y aproximadamente 3 GB en float16. Estas cifras son estimaciones, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria para float16 (por ejemplo, RTX 3050, T4, RTX 3060). Para float32 se recomienda un minimo de 8 GB (RTX 3070, RTX 4060 Ti, A10). En A100 o H100 se puede priorizar throughput con lotes grandes.
- Cabe en GPU de consumo: si, el modelo esta disenado para ejecutarse tambien en CPU y, con cuantizacion int8 o float16, es viable en GPUs de gama media y en equipos sin GPU dedicada.
- Opciones de despliegue: `faster-whisper` (referencia directa del autor), CTranslate2 en Python, WhisperX para diarizacion y alineamiento, y servidores propios construidos sobre la API de CTranslate2. No es compatible directamente con vLLM, Ollama, llama.cpp ni TGI, que esperan otros formatos de pesos.
- Latencia y throughput: no disponibles. Dependen del tipo de computo, del hardware y del numero de hilos configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `nunu-willump/whisper-large-v3-french-distil-dec16-ct2` | no disponible | ventanas de 30 s | fr | MIT | CTranslate2 | Espejo byte-identico del CT2 del modelo de bofenghuang; sin benchmarks publicados |
| `bofenghuang/whisper-large-v3-french-distil-dec16` | no disponible | ventanas de 30 s | fr | no disponible en esta informacion | PyTorch / safetensors | Modelo de origen; incluye el subdirectorio CT2 del que procede este espejo |
| `openai/whisper-large-v3` | 1.550 millones (aproximadamente) | ventanas de 30 s | 99 idiomas | MIT (pesos) | PyTorch / safetensors | Modelo completo sin destilar; mayor coste de inferencia y cobertura multilingue amplia |
| `Systran/faster-whisper-large-v3` | 1.550 millones (aproximadamente) | ventanas de 30 s | multilingue | MIT | CTranslate2 | Conversion CT2 del Whisper large-v3 original; alternativa multilingue frente a esta variante especializada en frances |

No se dispone de comparaciones de WER ni de latencia entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion mono-idioma: el modelo esta ajustado en frances y su rendimiento fuera de ese idioma no esta documentado; se desaconseja su uso en produccion multilingue sin evaluacion previa.
- Sesgos: no hay informacion sobre la composicion del corpus de ajuste, por lo que se desconocen los sesgos de acento, genero, edad o variedad dialectal del frances que pueda arrastrar.
- Riesgo de alucinacion: es un comportamiento conocido en la familia Whisper, especialmente con audio ruidoso, silencios largos o habla solapada; se recomienda validar las transcripciones en dominios criticos como el legal o el medico.
- Ausencia de benchmarks: no se han publicado metricas de WER para este modelo, por lo que cualquier decision de adopcion deberia ir precedida de una evaluacion propia sobre el dominio objetivo.
- Licencia: MIT, que permite uso comercial y modificacion con atribucion. Se conserva adicionalmente la licencia original de Whisper en `LICENSE-Whisper`; conviene revisar ambos textos antes de redistribuir el modelo.
- Trazabilidad: al ser un espejo de preservacion, las actualizaciones, correcciones y soporte dependen del repositorio original; este repositorio no incorporara mejoras de entrenamiento.
- Limitacion de plataforma: al estar en formato CTranslate2, no se puede cargar con librerias que esperen safetensors o GGUF. Los ficheros no son directamente inspeccionables ni reentrenables sin reconvertirlos.
- Vencimiento temporal: la fecha de creacion declarada es 2026-10-09, posterior a la fecha de actualizacion 2026-10-09; se trata de un dato de metadatos que no afecta al contenido, pero conviene no usarlo como referencia de versionado.
- El repositorio tiene un volumen de adopcion muy bajo (12 descargas, 0 likes), lo que reduce la probabilidad de que existan informes externos de fallos o de comportamiento en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nunu-willump/whisper-large-v3-french-distil-dec16-ct2
- Modelo base: https://huggingface.co/bofenghuang/whisper-large-v3-french-distil-dec16
- Repositorio original de Whisper (OpenAI): https://github.com/openai/whisper
- Documentacion de CTranslate2: https://opennmt.net/CTranslate2/
- Repositorio de faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Los resultados de la busqueda web realizada no contienen ningun enlace relacionado con este modelo: todas las entradas devueltas corresponden al campeon Nunu y Willump del videojuego League of Legends y no son relevantes para esta ficha. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados al modelo.

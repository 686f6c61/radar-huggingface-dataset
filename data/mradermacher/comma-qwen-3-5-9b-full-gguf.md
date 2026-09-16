# mradermacher/comma-qwen-3.5-9b-full-GGUF

## Resumen

Comma Qwen 3.5 9B es un modelo de visión y lenguaje (vision-language) de aproximadamente 8.950 millones de parametros, especializado en reconocimiento optico de caracteres (OCR) y reconocimiento de texto manuscrito (HTR) sobre manuscritos historicos, con enfasis en latin medieval y paleografia. El modelo original fue desarrollado por wjbmattingly (repositorio `wjbmattingly/comma-qwen-3.5-9b-full`) y esta construido sobre la familia Qwen 3.5, mientras que la version aqui descrita es la cuantizacion estatica en formato GGUF realizada por mradermacher.

El problema que resuelve es concreto: la transcripcion automatica de documentos manuscritos, un cuello de botella tradicional en humanidades digitales, archivos y bibliotecas, donde la transcripcion manual es lenta y costosa y los modelos OCR genericos rinden mal con caligrafia historica, abreviaturas y ortografia medieval. Al ser un modelo multimodal de ~9B, cabe en hardware de gama alta de consumo cuando se cuantiza, lo que lo hace accesible para proyectos de investigacion con presupuesto limitado.

La relevancia actual viene de dos factores: por un lado, la etiqueta `qwen3.5` indica que se apoya en una base reciente de Qwen con capacidades multimodales; por otro, la publicacion en GGUF permite ejecutarlo en `llama.cpp`, Ollama y otros runners locales. El repositorio de cuantizaciones tiene un tamano de 77,7 GB porque incluye todo el juego de variantes (desde Q2_K hasta f16, mas los proyectores multimodales `mmproj`). El modelo se publica bajo licencia apache-2.0 y declara unicamente el idioma latin (`la`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo vision-language basado en Qwen 3.5; incluye proyector multimodal `mmproj`) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; proyectores multimodales en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | latin (la) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Tamano del repositorio | 77,7 GB (conjunto completo de cuantizaciones) |
| Modelo base | wjbmattingly/comma-qwen-3.5-9b-full |
| Dataset de entrenamiento | comma-project/deep-jsonl |
| Libreria declarada | transformers |
| Etiquetas | ocr, htr, handwritten-text-recognition, manuscripts, palaeography, catmus, medieval-latin, qwen3.5, vision-language, conversational |
| Compatibilidad con endpoints | si (`endpoints_compatible`) |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna exacta mas alla de que se trata de un modelo de la familia Qwen 3.5 con capacidades de vision y lenguaje. La presencia de los ficheros `mmproj` (proyector multimodal) en el repositorio confirma que el modelo procesa entrada de imagen ademas de texto: el proyector se encarga de mapear las representaciones visuales al espacio de embeddings del modelo de lenguaje. El recuento de parametros publicado en safetensors (8.953.803.264) corresponde al conjunto del modelo.

En cuanto a los datos de entrenamiento, la model card unicamente referencia el dataset `comma-project/deep-jsonl`, del que no se proporciona composicion, numero de tokens ni proporciones de idioma. Tampoco se documenta si hubo fases de ajuste por refuerzo (RLHF/DPO) ni que tecnicas de alineacion se aplicaron. Las etiquetas del repositorio (paleografia, latin medieval, manuscritos, `catmus`) apuntan a un ajuste orientado a transcripcion de documentos historicos, pero no se aportan detalles tecnicos sobre ese proceso. Esta cuantizacion concreta, realizada por mradermacher, es de tipo estatico: la propia model card indica que las cuantizaciones ponderadas o con imatrix "no parecen estar disponibles" en el momento de la publicacion.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) sobre manuscritos historicos, incluyendo caligrafia no contemporanea.
- Reconocimiento optico de caracteres (OCR) sobre documentos digitalizados, con soporte de imagen como entrada.
- Transcripcion de latin medieval y tratamiento de convenciones paleograficas (abreviaturas, grafias historicas).
- Procesamiento de documentos de archivo y fondos manuscritos, segun las etiquetas `manuscripts`, `palaeography` y `catmus`.
- Generacion de texto conversacional (etiqueta `conversational`), lo que permite formular peticiones en lenguaje natural sobre la transcripcion.
- Compatibilidad con endpoints desplegados (etiqueta `endpoints_compatible`), pensada para servir el modelo por API.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, modo de razonamiento (`thinking`), ejecucion de agentes multi-paso, audio ni otras modalidades adicionales a texto e imagen.
- Capacidad multilingue: la unica lengua declarada es el latin (`la`); no se confirma el comportamiento en otras lenguas.

## Casos de uso

- Digitalizacion de fondos manuscritos en bibliotecas y archivos: el modelo recibe la imagen de cada folio y devuelve la transcripcion, lo que permite procesar colecciones completas por lotes en lugar de transcription manual pagina a pagina.
- Investigacion en paleografia y filologia latina: transcripcion asistida de corpus medievales para construir ediciones diplomaticas o criticas, con el investigador revisando y corrigiendo la salida del modelo.
- Proyectos de humanidades digitales con presupuesto limitado: al existir variantes GGUF desde Q2_K, el modelo puede ejecutarse en una unica GPU de consumo, lo que evita depender de infraestructura en la nube para corpus sensibles o de gran volumen.
- Creacion de datasets de entrenamiento: uso del modelo para preanotar transcripciones que despues se corrigen manualmente y se incorporan a conjuntos supervisados, acelerando el ciclo de anotacion.
- Busqueda y recuperacion sobre documentos historicos: transcripcion masiva seguida de indexacion de texto completo, de modo que se pueda buscar por terminos en un corpus que antes solo existia como imagen.
- Asistencia a catalogacion y descripcion archivística: generacion de transcripciones que alimentan registros catalograficos, con intervencion humana para validar los campos criticos.
- Analisis textual a escala: extraccion de texto latin para estudios de frecuencia lexica, estilometria o comparacion entre testimonios de una misma obra.
- Despliegue en local para instituciones con requisitos de confidencialidad: al ejecutarse con `llama.cpp` u Ollama sin conexion externa, los documentos no salen de la infraestructura de la institucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la cuantizacion no incluye metricas (ni CER/WER sobre HTR, ni MMLU, HumanEval o GSM8K), y los resultados de la busqueda web proporcionada no contienen datos tecnicos sobre este modelo: son paginas de soporte de un navegador sin relacion con el modelo. No se deben extrapolar cifras de la familia Qwen 3.5 al comportamiento de este ajuste especializado.

| Benchmark | Resultado | Nota |
|---|---|---|
| CER / WER en HTR | no disponible | sin datos publicados |
| MMLU | no disponible | sin datos publicados |
| HumanEval | no disponible | sin datos publicados |
| GSM8K | no disponible | sin datos publicados |

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del numero de parametros publicado (8,95B) y del tamano tipico de cada tipo de cuantizacion; no proceden de mediciones publicadas por el autor.

- VRAM estimada para los pesos (sin contexto ni cache KV):
  - f16: ~17-18 GB.
  - Q8_0: ~9,5-10 GB.
  - Q6_K: ~7,3-8 GB.
  - Q5_K_M: ~6,2-6,8 GB.
  - Q4_K_M: ~5,4-6 GB.
  - IQ4_XS: ~4,8-5,4 GB.
  - Q3_K_M: ~4,4-5 GB.
  - Q2_K: ~3,5-4 GB.
- Sumar el proyector multimodal: 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16), mas la memoria de activaciones del codificador de vision, que depende de la resolucion de las imagenes de entrada.
- Sumar cache KV: crece con la longitud de contexto; a partir de unos 8.000-32.000 tokens puede anadir del orden de 1 a 4 GB en funcion de la variante y de la configuracion.
- GPU de gama de consumo: una RTX 3060 de 12 GB o una RTX 4070 de 12 GB pueden alojar Q4_K_M o IQ4_XS con contexto moderado; una RTX 3090 o RTX 4090 de 24 GB permiten Q8_0 o incluso f16 con margen para contexto.
- GPU de centro de datos: A100 de 40/80 GB y H100 son adecuadas para servir en lote con contexto largo y concurrencia; tambien permiten ejecutar la version en precision completa en safetensors desde el modelo base.
- Despliegue: `llama.cpp` y sus derivados (llama-cpp-python, servidor `llama-server`), Ollama, LM Studio y otros runners compatibles con GGUF. Para la version en safetensors (no GGUF) el camino natural es Transformers y, si se necesita servido de alto rendimiento, vLLM; el soporte de GGUF en vLLM y TGI es limitado o inexistente, por lo que conviene verificar la compatibilidad antes de disenar el despliegue.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo por pagina transcrita.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada. El unico punto de referencia objetivo es el propio modelo base a partir del cual se genero esta cuantizacion. No se aportan especificaciones de dicho modelo base (contexto, composicion de entrenamiento, licencia efectiva de los pesos originales) mas alla de su identificador.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/comma-qwen-3.5-9b-full-GGUF | ~8,95B | no disponible | GGUF (12 variantes + mmproj) | apache-2.0 | cuantizacion estatica de este repositorio |
| wjbmattingly/comma-qwen-3.5-9b-full | no disponible | no disponible | safetensors (presumiblemente) | no disponible | modelo base original |
| Alternativas de OCR/HTR especializado | no disponible | no disponible | no disponible | no disponible | sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Idiomas: solo se declara latin (`la`). No hay evidencia de buen rendimiento en castellano, ingles u otras lenguas, ni en documentos con mezcla de idiomas.
- Dominio restringido: el modelo esta ajustado para manuscritos y documentos historicos; su uso como modelo generalista de texto o de conversacion no esta respaldado por ningun dato publicado.
- Riesgo de alucinacion: en transcripcion de documentos danados, con tinta desvaida, manchas o caligrafia muy irregular, un modelo generativo puede producir texto plausible pero inexistente. En filologia esto es especialmente grave, porque una palabra inventada puede parecer coherente en latin. Se recomienda verificacion humana en cualquier uso cientifico.
- Sin benchmarks publicados: no hay metricas de CER/WER que permitan estimar la calidad de transcripcion ni compararla con alternativas establecidas.
- Ausencia de trazabilidad sobre el entrenamiento: no se documentan volumen de datos, composicion del dataset `comma-project/deep-jsonl`, ni si hubo alineacion por RLHF/DPO; esto dificulta evaluar sesgos y limites.
- Sesgos: no se han documentado sesgos especificos, pero un corpus de manuscritos latinos medievales tendra un sesgo inherente hacia una tradicion textual, geografica y temporal concreta.
- Licencia: el repositorio de cuantizacion se publica como apache-2.0. Conviene comprobar de forma independiente la licencia del modelo base y de los datos de entrenamiento antes de un uso comercial, ya que el cuantizador no es el titular de los pesos originales.
- Cuantizaciones de baja precision: las variantes Q2_K y Q3_K degradan la calidad de forma apreciable en tareas de transcripcion, donde un solo caracter cambia el significado. Para uso serio se recomienda Q5_K_M o superior.
- Madurez y adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe una comunidad que haya validado su comportamiento en produccion.
- Fechas: los metadatos indican creacion y actualizacion el 16 de septiembre de 2026.
- Restricciones practicas del formato GGUF multimodal: la parte de vision requiere cargar el fichero `mmproj` correspondiente y un runner que soporte vision en GGUF; no todos los frontends lo hacen.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/mradermacher/comma-qwen-3.5-9b-full-GGUF
- Modelo base: https://huggingface.co/wjbmattingly/comma-qwen-3.5-9b-full
- Proyector multimodal mmproj-Q8_0: https://huggingface.co/mradermacher/comma-qwen-3.5-9b-full-GGUF/resolve/main/comma-qwen-3.5-9b-full.mmproj-Q8_0.gguf
- Proyector multimodal mmproj-f16: https://huggingface.co/mradermacher/comma-qwen-3.5-9b-full-GGUF/resolve/main/comma-qwen-3.5-9b-full.mmproj-f16.gguf
- Pagina de resumen de descargas del cuantizador: https://hf.tst.eu/model#comma-qwen-3.5-9b-full-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad entre tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset referenciado: comma-project/deep-jsonl (identificador indicado en la model card; no se proporciono URL directa)

# amongglue/topaz-gregg-shorthand-61m

## Resumen

Topaz-61M es un modelo de reconocimiento de escritura manual especializado en taquigrafia Gregg, en su variante Anniversary. Lo desarrolla el usuario amongglue y se distribuye en HuggingFace bajo licencia MIT. El modelo resuelve un problema muy concreto: la transcripcion automatica de taquigrafia Gregg, un sistema de escritura rapida cuyo trazo no se corresponde directamente con letras latinas. Se trata de un modelo CTC (Connectionist Temporal Classification) orientado a la tarea image-to-text, con 61.236.617 parametros totales y un repositorio de 0,3 GB.

La innovacion principal es que el modelo no predice texto en ingles directamente. En su lugar predice Grascii, una representacion ASCII de los trazos de la taquigrafia, lo que reduce la tarea del reconocedor a la lectura de trazos y delega la conversion a ingles a una etapa posterior (diccionario Grascii-ingles y un LLM instruction-tuned). Segun el autor, es el mejor modelo de transcripcion de Gregg Anniversary Shorthand disponible a fecha de octubre de 2026, con un 30,4 % de stroke error en la mitad de test de los ejercicios del libro "Gregg Shorthand Functional Method Part Two" de Louis A. Leslie.

El modelo esta pensado para un publico muy especifico (archiveros, investigadores en OCR, transcriptores de taquigrafia) y no como un OCR generico. El idioma de salida es unicamente ingles, y el repositorio no presenta descargas ni likes en el momento de redactar esta ficha, por lo que su validacion por parte de la comunidad es todavia escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reconocedor CTC (Connectionist Temporal Classification) con decodificacion greedy, precedido de un segmentador de lineas (line finder). La arquitectura concreta de ambas redes no se detalla en la model card |
| Parametros totales | 61.236.617 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica; procesa imagen a texto linea a linea, sin ventana de contexto textual |
| Tipos de cuantizacion | No disponible; los pesos publicados estan en fp32 (`model.safetensors`) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, `segmenter.safetensors`), con `config.json` para las arquitecturas y `vocab.json` para los 73 tokens CTC |

## Arquitectura y entrenamiento

El sistema se compone de dos redes: un segmentador que localiza y endereza las lineas de la pagina (`segmenter.safetensors`) y un reconocedor CTC que transcribe cada linea de forma independiente. La lectura de cada linea no depende del resto de la pagina, lo que limita la propagacion de errores entre lineas pero tambien impide usar contexto global del documento. El vocabulario CTC tiene 73 tokens, con el indice 0 reservado para el token blank. El checkpoint publicado corresponde al paso de entrenamiento 48.100.

El reconocedor no genera texto ingles: produce Grascii, una codificacion ASCII de los trazos. La conversion a ingles se hace fuera del modelo mediante `dictionary.json` (unas 31.000 entradas, construido a partir del diccionario Anniversary de 1930, las formas breves Anniversary, el libro de frases de 1924 y las listas de palabras Qwertigraphy, ordenado por frecuencia de palabra) y un prompt para LLMs instruction-tuned incluido en `prompt.txt`. La model card no especifica la composicion exacta del dataset de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO; si menciona que las laminas de "Functional Method Part Two" no se usaron en entrenamiento (parrafos pares como validacion, impares como test).

La model card indica que el autor afirma que se trata del mejor modelo de transcripcion de Gregg Anniversary Shorthand hasta octubre de 2026. La seccion final de la model card esta marcada como generada por IA y aparece truncada en la informacion proporcionada.

## Capacidades

- Reconocimiento de taquigrafia Gregg Anniversary en fotografias o escaneos de pagina completa (el localizador de lineas reescala la imagen a cualquier tamano) o de lineas sueltas.
- Salida en Grascii, una representacion ASCII de los trazos, en lugar de texto ingles directo.
- Generacion de una representacion intermedia por linea: cada contorno reconocido acompanado de candidatos del diccionario Grascii-ingles con puntuacion.
- Generacion de un prompt (`llm_prompt()`) listo para pegar en un LLM instruction-tuned que reconstruye el texto plano original a partir de la representacion intermedia.
- Busqueda en diccionario integrada: coincidencias exactas, frases escritas como dos contornos unidos (por ejemplo `I-K` -> "I can"), palabras de los contornos mas cercanos (distancia de edicion de trazos <= 2) y frases de tres partes como ultimo recurso.
- Funcionamiento en CPU (aproximadamente medio segundo por linea) y uso de GPU cuando esta disponible.
- No se documenta soporte de tool calling, function calling, agentes, vision general, audio ni razonamiento multi-paso dentro del propio modelo. La capacidad de "razonamiento" recae en el LLM externo que consume el prompt intermedio.

## Casos de uso

- Digitalizacion de archivos historicos en taquigrafia Gregg: el modelo transcribe paginas escaneadas a Grascii y la etapa de diccionario mas LLM reconstruye el ingles, lo que permite convertir fondos documentales taquigrafiados en texto consultable.
- Procesamiento por lotes de libros de taquigrafia: la CLI (`python -m topaz --with-prompt -o out/ *.jpg`) permite procesar directorios completos de imagenes y generar transcripciones junto al prompt para el LLM, adecuado para proyectos de preservacion digital.
- Indexacion y busqueda en archivos: al obtener texto en ingles a partir de las paginas, se puede alimentar un motor de busqueda o un sistema RAG sobre documentacion taquigrafiada que antes era inaccesible.
- Evaluacion y docencia de taquigrafia: el modelo puede transcribir los ejercicios de un alumno y compararlos con la solucion esperada; el stroke error por parrafo sirve como metrica objetiva de correccion.
- Investigacion en OCR de escrituras no convencionales: el diseno de predecir una representacion intermedia (Grascii) en lugar del texto final es un patron reutilizable para otros sistemas de escritura con fonetica no latina.
- Apoyo a transcriptores humanos: la representacion intermedia con candidatos del diccionario y la prediccion del LLM actuan como borrador que un transcriptor puede revisar y corregir, reduciendo el tiempo frente a la transcripcion manual.
- Generacion de conjuntos de datos para taquigrafia: las transcripciones Grascii y las alineaciones con el diccionario pueden usarse para construir corpus etiquetados de taquigrafia Gregg.
- Experimentacion con modelos CTC pequenos en produccion: con 61 M de parametros y ejecucion en CPU a ~0,5 s por linea, es viable integrarlo en servicios con recursos limitados o en pipelines por lotes sin GPU.

## Benchmarks y rendimiento

Unicos datos publicados en la informacion disponible, sobre los ejercicios de "Gregg Shorthand Functional Method Part Two" de Louis A. Leslie. El stroke error es la distancia de edicion sobre tokens de trazo dividida por la longitud de referencia, puntuada por parrafo; el outline error aplica la misma medida sobre contornos completos.

| Datos | Stroke error | Outline error |
|---|---|---|
| Functional Method Part Two, mitad de validacion | 26,8 % | 46,3 % |
| Functional Method Part Two, mitad de test | 30,4 % | 54,0 % |

Checkpoint publicado: paso de entrenamiento 48.100. El autor senala que el stroke error es una metrica mas estricta que un word error rate: un circulo vocalico omitido cuenta como error aunque la palabra siga siendo evidente. No se han publicado comparaciones numericas con otros modelos de taquigrafia en la informacion disponible.

## Requisitos de hardware

- Los pesos del reconocedor estan en fp32; con 61,2 M de parametros el conjunto ronda los 245 MB, y el repositorio completo ocupa 0,3 GB.
- VRAM estimada para inferencia: por debajo de 1 GB (estimacion a partir del tamano de los pesos y las activaciones de una imagen de linea), por lo que cabe en practicamente cualquier GPU de consumo con al menos 4 GB, e incluso en GPU integradas.
- GPU recomendadas: no se especifica ninguna en la model card; el modelo usa GPU si esta disponible. Dado el tamano, no requiere A100 ni H100: una GTX 1060, RTX 3060 o superior es mas que suficiente.
- CPU: funciona sin GPU, con un tiempo de aproximadamente medio segundo por linea segun el autor.
- Opciones de despliegue: el repositorio incluye su propio codigo de inferencia en `topaz/` y se ejecuta con `python -m topaz page.png`, `python -m topaz --lines line.png`, `python -m topaz --grascii page.png` o `python -m topaz --with-prompt -o out/ *.jpg`, tras `pip install -r requirements.txt`. Tambien se puede usar desde Python con `Topaz.from_pretrained(".")` y los metodos `transcribe()`, `.grascii`, `.intermediate()` y `.llm_prompt()`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato de pesos y la tarea no son los habituales de esas herramientas.
- Latencia y throughput: solo se publica el dato de CPU (~0,5 s por linea). No hay cifras de throughput en GPU ni de procesamiento por pagina completa.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de reconocimiento de taquigrafia Gregg, ni con OCR genericos tipo TrOCR, ni datos de parametros, contexto, licencia o disponibilidad de alternativas. El autor solo afirma que, segun su conocimiento, es el mejor modelo para Gregg Anniversary Shorthand en octubre de 2026, sin aportar comparaciones numericas con terceros.

## Limitaciones y advertencias

- El modelo no produce texto ingles: su salida es Grascii y requiere una etapa externa (diccionario + LLM instruction-tuned) para obtener la transcripcion final, lo que anade dependencia de un segundo sistema y de su propio prompt.
- El outline error es elevado (46,3 % en validacion y 54,0 % en test), lo que indica que muchos contornos completos no se reconocen correctamente. El stroke error del 30,4 % en test tampoco es bajo.
- Los errores de transcripcion se propagan al diccionario y al LLM; la model card reconoce que el LLM debe "adivinar" a partir del contexto, lo que introduce riesgo de alucinacion en la fase final de reconstruccion del ingles.
- Especifico de Gregg Anniversary Shorthand: no cubre otras variantes de Gregg (como Diamond Jubilee o Simplified) ni otros sistemas de taquigrafia.
- Idioma unico: ingles. No se documenta soporte multilingue.
- Procesamiento linea a linea sin contexto de pagina, lo que puede degradar la coherencia en documentos con dependencias entre lineas.
- Modelo muy reciente y con escasa validacion externa: 0 descargas y 0 likes en el momento de la ficha. Toda la evaluacion publicada proviene del propio autor.
- El diccionario se basa en fuentes historicas (diccionario Anniversary de 1930, libro de frases de 1924), lo que puede introducir sesgos hacia vocabulario y ortografia de esa epoca.
- Parte de la model card esta marcada como generada por IA y aparece truncada en la informacion disponible; conviene verificar detalles tecnicos directamente en el repositorio antes de usarlo en produccion.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, sujeto a mantener el aviso de copyright y la licencia.
- Se desconoce la composicion exacta del dataset de entrenamiento y si se aplicaron tecnicas de alineacion (RLHF, DPO) o filtrado de sesgos.

## Enlaces

- HuggingFace: https://huggingface.co/amongglue/topaz-gregg-shorthand-61m
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos mas alla de las capturas de pantalla incluidas en la propia model card.

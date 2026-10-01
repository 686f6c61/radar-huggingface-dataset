# AdrienB134/gelato-qwen

## Resumen

GELATO qwen document retriever es un modelo multimodal de recuperacion de documentos visuales (visual document retrieval, VDR) publicado por el usuario AdrienB134 en HuggingFace. Se construye combinando dos backbones congelados: la torre de vision de Qwen3.5 (0.8B) y el backbone de texto Qwen3-Embedding-0.6B, unidos mediante un proyector aprendido y delimitadores de imagen. Genera vectores normalizados de 1024 dimensiones tanto para consultas de texto como para imagenes de pagina completa, lo que permite buscar paginas escaneadas por su contenido visual sin aplicar OCR previo.

El checkpoint liberado corresponde al paso 12.300 de entrenamiento y suma 699.518.208 parametros. El autor lo selecciono por su mejor puntuacion publica en ViDoRe v3 (35,72 nDCG@10 macro sobre ocho corpus y seis idiomas de consulta), un benchmark que admite haberse usado para seleccionar el checkpoint y no como conjunto de test limpio. El entrenamiento partio de aproximadamente 273.000 pares positivos multilingues de VDR, con backbones congelados y entrenamiento contrastivo de tipo Matryoshka.

Es relevante para flujos de recuperacion documental porque unifica texto e imagen en un mismo espacio vectorial con un modelo de menos de 700 millones de parametros, ejecutable en GPU de consumo, y porque evita las perdidas de informacion tipicas de las pipelines de OCR mas recuperacion. Su licencia Apache 2.0 y el empaquetado completo de pesos, tokenizer y procesador de imagen facilitan el despliegue offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder multimodal de recuperacion: torre de vision Qwen3.5 congelada + backbone de texto Qwen3-Embedding-0.6B congelado + proyector aprendido y delimitadores de imagen |
| Parametros totales | 699.518.208 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para texto; en imagenes admite 256-1.280 tokens visuales fusionados (presupuesto de 262.144-1.310.720 pixeles) |
| Tipos de cuantizacion | No se documentan cuantizaciones; pesos en BF16 tal como se entrenaron y evaluaron |
| Idiomas soportados | Ingles, frances, aleman, espanol, italiano y portugues |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Se trata de un modelo de embeddings multimodal de doble torre que reutiliza pesos ya entrenados. La torre de vision procede de Qwen3.5 y se conserva integra y congelada; el backbone de texto es Qwen3-Embedding-0.6B, tambien congelado. Sobre ellos se anaden un proyector entrenable y delimitadores de imagen que alinean la representacion visual con el espacio de embeddings del texto. La salida son vectores normalizados de 1024 dimensiones, comparables por producto escalar. La arquitectura de lenguaje interna del checkpoint original de Qwen3.5 se descarta, mientras que todos los pesos de la torre de vision se preservan.

El entrenamiento uso aproximadamente 273.000 pares positivos multilingues de recuperacion de documentos visuales, con backbones congelados (solo se optimiza el proyector y los delimitadores) y una estrategia contrastiva Matryoshka. No consta un proceso posterior de RLHF ni DPO. El checkpoint final se selecciono entre pasos de entrenamiento atendiendo a la mejor puntuacion publica en ViDoRe v3. Las imagenes mantienen su relacion de aspecto dentro del presupuesto de pixeles indicado, lo que se traduce en 256 a 1.280 tokens visuales fusionados. El autor indica que no se realizo reentrenamiento adicional y que el pooling de texto, el enmarcado de la secuencia de imagen, los prompts y la normalizacion reproducen exactamente el checkpoint evaluado.

## Capacidades

- Generacion de embeddings de texto de 1024 dimensiones para consultas de recuperacion, mediante `encode_query()`.
- Generacion de embeddings de imagen de 1024 dimensiones para paginas completas escaneadas o renderizadas, mediante `encode()` con imagenes PIL.
- Recuperacion de documentos visuales (VDR): busqueda directa sobre la pagina, sin OCR, combinando consulta textual y pagina como imagen en un mismo espacio vectorial.
- Soporte multilingue en seis idiomas (en, fr, de, es, it, pt) tanto para consultas como para contenido.
- Funciona con lotes homogeneos: o bien cadenas de texto, o bien imagenes PIL. No admite lotes mixtos de texto e imagen.
- No soporta video.
- Empaquetado completo con tokenizer y procesador de imagen, lo que permite carga offline y con `local_files_only=True`.
- No documenta tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo de extraccion de caracteristicas, no un modelo generativo de instrucciones.

## Casos de uso

- Recuperacion de paginas en repositorios documentales: indexar informes, facturas o contratos como imagenes de pagina y recuperar la pagina relevante a partir de una consulta textual, gracias al espacio vectorial compartido entre texto e imagen y sin necesidad de OCR.
- Busqueda multimodal en corpus multilingues: consultar en espanol un fondo documental en frances o aleman, explotando la cobertura de los seis idiomas soportados.
- Asistentes RAG sobre documentos escaneados: usar los embeddings de pagina como paso de recuperacion antes de pasar el contenido a un LLM, evitando la perdida de informacion de tablas, sellos o diagramas que sufre el OCR.
- Indexacion de PDFs de gran tamano: procesar cada pagina como imagen dentro del presupuesto de 256-1.280 tokens visuales permite manejar documentos de maquetacion compleja manteniendo la relacion de aspecto.
- Verificacion de evidencias en flujos legales o de auditoria: recuperar la pagina exacta que respalda una afirmacion, en lugar de un fragmento de texto descontextualizado.
- Filtrado y deduplicacion de archivos escaneados: comparar embeddings de pagina para agrupar documentos redundantes o casi identicos dentro de un repositorio.
- Clasificacion tematica ligera por similitud: construir consultas de referencia por categoria y asignar paginas a cada categoria segun la similitud coseno, sin entrenar un clasificador adicional.

## Benchmarks y rendimiento

| Benchmark | Resultado | Detalle |
|---|---|---|
| ViDoRe v3 | 35,72 nDCG@10 macro | Sobre ocho corpus y seis idiomas de consulta; usado para seleccionar el checkpoint (no es un test limpio) |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros), lo cual es coherente con que se trate de un modelo de recuperacion y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 1,4 GB (el repositorio pesa 1,4 GB). Con activaciones y lotes pequenos de imagenes, el consumo se situa en el orden de 3-5 GB, y crece con el tamano de lote de imagenes, ya que cada pagina puede aportar hasta 1.280 tokens visuales. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con soporte BF16 y al menos 6-8 GB de VRAM. Modelos como A100, H100 o L40S sobran para esta carga.
- GPU de consumo: si cabe en GPU de consumo. Una RTX 3060 de 12 GB, RTX 4070 o RTX 4090 pueden ejecutarlo sin problema; conviene empezar con lotes de imagen pequenos e incrementarlos segun la memoria disponible, tal como recomienda el autor.
- Opciones de despliegue: `sentence-transformers` (>=6.0.1) y `transformers` (>=5.16.1) con `trust_remote_code=True`. Requiere Python 3.12, PyTorch, Pillow y safetensors. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible construir una comparativa con cifras verificables. Como referencia cualitativa de la misma categoria (recuperacion de documentos visuales con embeddings multimodales) suelen citarse ColPali, ColQwen2 y otros retrievers basados en backbones de vision-lenguaje, pero no se incluyen aqui sus parametros, contexto ni rendimiento porque no forman parte de la informacion facilitada.

## Limitaciones y advertencias

- El checkpoint se selecciono usando ViDoRe v3, un benchmark que el propio autor reconoce que no es un conjunto de test intacto; sus cifras pueden estar sesgadas al alza respecto a un uso real.
- Solo admite lotes homogeneos de texto o de imagen; no soporta lotes mixtos ni video, lo que limita ciertos flujos de indexacion mixtos.
- Cobertura linguistica limitada a seis idiomas; no hay soporte declarado para otras lenguas.
- No se documentan cuantizaciones (GGUF, AWQ, GPTQ, etc.), lo que puede complicar el despliegue en entornos con restricciones de memoria distintas a BF16.
- Requiere ejecucion de codigo remoto (`trust_remote_code=True`); el autor recomienda revisar los pequenos ficheros de inferencia incluidos antes de permitirlo, un riesgo relevante en produccion.
- El modelo depende de pesos de Qwen3.5 y Qwen3-Embedding-0.6B; los autores y licencias de origen se documentan en el fichero `NOTICE`, que conviene revisar antes de un uso comercial, aunque la licencia declarada sea Apache 2.0.
- No realiza generacion de texto ni razonamiento: es exclusivamente un extractor de caracteristicas; cualquier tarea generativa requiere acoplarlo a otro modelo.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de recuperaciones irrelevantes cuando la consulta es ambigua o el documento es de baja calidad visual.
- Con 0 descargas y 0 likes en el momento de la ficha, se trata de un modelo sin validacion externa por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/AdrienB134/gelato-qwen
- Repositorio base de texto: Qwen/Qwen3-Embedding-0.6B
- Repositorio base de vision: Qwen/Qwen3.5-0.8B

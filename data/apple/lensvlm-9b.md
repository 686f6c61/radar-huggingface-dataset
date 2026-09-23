# apple/LensVLM-9B

## Resumen

LensVLM-9B es un modelo de vision-lenguaje (VLM) de 9.409.813.744 parametros (unos 9,4B) desarrollado por Apple y publicado en HuggingFace bajo la licencia Apple Machine Learning Research Model License. Se ha construido mediante ajuste fino sobre Qwen/Qwen3.5-9B y su tarea central es leer documentos representados como imagenes comprimidas de texto y expandir de forma selectiva unicamente las paginas relevantes a su forma sin comprimir, usando para ello herramientas aprendidas ("learned tools").

El problema que aborda es el coste de procesar documentos largos token a token: en lugar de inyectar todo el texto en la ventana de contexto, LensVLM trabaja sobre una representacion visual comprimida del documento (factores de 5x, 10x y 15x) y solo descomprime las regiones que necesita para responder. Esto lo situa en la interseccion de tres lineas de trabajo activas: compresion de contexto, comprension visual de documentos y razonamiento agentico con llamadas a herramientas.

Es relevante ahora porque propone una via practica para escalar el analisis documental sin crecer linealmente en tokens de entrada, y porque Apple publica tanto los pesos como el codigo de inferencia y el articulo asociado (arXiv:2605.07019). El repositorio ocupa 18,8 GB y las capacidades multilingues, la longitud exacta de contexto y los idiomas soportados no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model derivado de Qwen/Qwen3.5-9B; detalle interno de capas no disponible |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (el modelo se etiqueta como "long-context") |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye safetensors, 18,8 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apple Machine Learning Research Model License (apple-amlr); el codigo se distribuye aparte bajo Apple Sample Code License |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

LensVLM-9B parte de Qwen/Qwen3.5-9B (etiqueta de arquitectura `qwen3_5` en HuggingFace) y se especializa como modelo multimodal de tipo image-text-to-text. La innovacion descrita en la model card no esta en el backbone, sino en el mecanismo de contexto: el modelo escanea imagenes comprimidas de texto y decide que paginas expandir a resolucion completa invocando herramientas aprendidas durante el entrenamiento. Los factores de compresion soportados son 5x, 10x y 15x, lo que implica una politica de decision aprendida sobre cuando merece la pena pagar el coste de descomprimir.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras fases de alineamiento posteriores al ajuste supervisado. El articulo asociado (Xie et al., 2026) es la referencia tecnica para esos detalles. La model card indica que el modelo esta pensado para ejecutarse con el codigo companero del repositorio `apple-aiml-research/ml-lensvlm`, que gestiona la preparacion de datos, la compresion y la evaluacion.

## Capacidades

- Comprension de documentos en formato de imagen: lee representaciones visuales comprimidas de texto y responde preguntas sobre su contenido.
- Expansion selectiva de contexto: descomprime solo las paginas relevantes mediante herramientas aprendidas, en lugar de procesar el documento completo en tokens.
- Niveles de compresion configurables: 5x, 10x y 15x, seleccionables en tiempo de inferencia.
- Procesamiento de contexto largo sobre documentos extensos (etiqueta "long-context" en HuggingFace; la cifra concreta no esta disponible).
- Generacion de texto conversacional: la etiqueta `conversational` indica uso en dialogos multi-turno.
- Soporte multimodal image-text-to-text, con entrada de imagenes y salida de texto.
- Tool calling / function calling: el modelo invoca herramientas aprendidas para expandir fragmentos comprimidos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), vision general fuera de documentos, audio o generacion de imagenes: no disponibles.

## Casos de uso

- Analisis de expedientes legales largos: el modelo recibe el contrato o el sumario como imagen comprimida a 10x y solo expande las clausulas relevantes para la consulta, reduciendo el coste de tokens frente a inyectar el documento completo.
- Revision de literatura cientifica: permite indexar articulos como representaciones visuales comprimidas y preguntar por hallazgos concretos, expandiendo unicamente las secciones de metodos o resultados necesarias.
- Atencion al cliente sobre manuales y documentacion tecnica: la compresion 5x mantiene suficiente detalle para responder dudas de producto en conversaciones multi-turno sobre catalogos extensos.
- Pipelines de RAG sobre PDFs escaneados: al operar sobre imagenes comprimidas, evita una fase previa de OCR completo y delega la expansion al modelo cuando la recuperacion lo requiere.
- Auditoria financiera y compliance: carga de informes anuales completos con compresion 15x para localizar partidas y notas al pie concretas, con expansion selectiva para verificar cifras.
- Extraccion de informacion en procesos batch: al reducir el numero de tokens de entrada, disminuye el coste por documento en volumenes altos, siempre que las consultas sean localizables por pagina.
- Asistentes de investigacion con razonamiento en varios pasos: el modelo puede encadenar varias llamadas a la herramienta de expansion hasta reunir el contexto suficiente para responder.
- Busqueda semantica sobre archivos historicos digitalizados: la representacion visual evita depender de OCR de calidad irregular en documentos degradados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de la busqueda web proporcionados no incluyen cifras de MMLU, HumanEval, GSM8K, DocVQA ni de ninguna otra evaluacion, ni comparaciones numericas con modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: a partir del peso real del repositorio (18,8 GB), se necesitan del orden de 20-24 GB de VRAM considerando cache KV y activaciones; cifra estimada, no confirmada por el autor.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 10-12 GB; cuantizacion de 4 bits: aproximadamente 6-8 GB. El repositorio no publica pesos cuantizados, por lo que estas cifras requieren cuantizacion propia y no estan validadas.
- GPU de centro de datos: A100 40/80 GB, H100, L40S 48 GB. Una A100 40 GB deberia ser suficiente para bf16 sin cuantizar.
- GPU de consumo: en bf16 cabe ajustadamente en RTX 4090 / RTX 3090 de 24 GB; en 8 o 4 bits cabria en RTX 4080, RTX 4070 Ti y RTX 3060 de 12 GB, sujeto a que la cuantizacion sea compatible con los componentes de vision.
- Opciones de despliegue: el flujo oficial es transformers junto con el repositorio `apple-aiml-research/ml-lensvlm` (`scripts/run_demo.py` y `demo.py`). Soporte de vLLM, llama.cpp, Ollama, TGI o LM Studio: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles. La compresion 15x reduce el numero de tokens de entrada, pero el coste real depende del numero de expansiones que decida realizar el modelo.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de fuentes publicas y no forman parte de la informacion proporcionada por el autor; se incluyen como referencia de categoria.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LensVLM-9B | 9,41B | No disponible (etiquetado long-context) | Apple AMLR | Documentos como imagen comprimida con expansion selectiva |
| Qwen2.5-VL-7B | ~7,6B | 128K | Apache 2.0 | VLM generalista con grounding visual |
| InternVL2.5-8B | ~8,1B | 32K y superior | MIT | VLM generalista con capacidad de video |
| Llama-3.2-11B-Vision | ~10,7B | 128K | Llama 3.2 Community License | VLM generalista de uso comercial con restricciones |

La comparacion de rendimiento no es posible: LensVLM-9B no publica resultados de benchmarks en la informacion disponible, y ninguno de los modelos alternativos comparte exactamente su tarea (compresion de contexto visual con expansion mediante herramientas).

## Limitaciones y advertencias

- No hay datos publicados de benchmarks, por lo que el rendimiento real frente a VLMs generalistas del mismo tamano no esta verificado de forma independiente.
- La licencia es Apple Machine Learning Research Model License, no una licencia de codigo abierto estandar (Apache, MIT). Es imprescindible leer el texto completo antes de cualquier uso comercial; las condiciones exactas no se detallan en la informacion proporcionada.
- El codigo asociado se distribuye bajo Apple Sample Code License, una licencia distinta de la de los pesos.
- El modelo depende de un pipeline especifico del repositorio `ml-lensvlm`; no se documenta compatibilidad con runtimes de inferencia habituales como vLLM, llama.cpp u Ollama.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero relevante en tareas de lectura documental donde el modelo debe citar fragmentos concretos.
- Riesgo de perdida de informacion con compresion 15x: la propia existencia de tres niveles de compresion sugiere un compromiso entre coste y fidelidad; no se documentan tasas de error por nivel.
- Idiomas soportados no disponibles: se desconoce si el rendimiento en castellano es equiparable al de ingles.
- Longitud de contexto no disponible: la etiqueta "long-context" no viene acompanada de una cifra verificable, y el limite efectivo dependera del numero de imagenes comprimidas que acepte el pipeline.
- Modelo base Qwen/Qwen3.5-9B: se heredan los sesgos, las limitaciones y las condiciones de uso derivadas de dicho modelo, no detalladas aqui.
- Estado del modelo en HuggingFace: creado el 21 de septiembre de 2026 y actualizado el 22 de septiembre de 2026, con 233 descargas y 13 "likes" en el momento de la consulta; trazabilidad y mantenimiento aun limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/apple/LensVLM-9B
- Licencia del modelo: https://huggingface.co/apple/LensVLM-9B/blob/main/LICENSE
- Articulo: https://arxiv.org/abs/2605.07019 (LensVLM: Selective Context Expansion for Compressed Visual Representation of Text, Xie et al., 2026)
- Codigo: https://github.com/apple-aiml-research/ml-lensvlm
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B

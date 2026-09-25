# lugman-madhiai/invoice-full-2.5-7B-smoke-adapter

## Resumen

El modelo `lugman-madhiai/invoice-full-2.5-7B-smoke-adapter` es un ajuste fino publicado por el usuario lugman-madhiai sobre el modelo base `unsloth/Qwen2.5-VL-7B-Instruct`, a su vez derivado de `Qwen/Qwen2.5-VL-7B-Instruct`. Por el tamano del repositorio (0,2 GB) y el sufijo "adapter" del identificador, se trata casi con seguridad de un adaptador de pesos (tipo LoRA) y no de un volcado completo del modelo de 7B, que en precision FP16 ocuparia del orden de 15-16 GB. El entrenamiento se realizo con la libreria Unsloth, que la model card describe como "2x faster", y el pipeline declarado es `text-generation-inference` sobre `transformers`.

El proposito inferido a partir del nombre y del resto de publicaciones del mismo autor es la extraccion de datos estructurados de facturas a partir de imagenes (el autor mantiene ademas los repositorios `Qwen2.5-VL-7B-invoice-extraction` e `invoice-structured-extraction`). El modelo base Qwen2.5-VL-7B-Instruct es un transformer vision-language con ventana de contexto nativa de 128.000 tokens y licencia Apache 2.0, lo que lo hace adecuado para tareas de OCR, comprension de documentos y extraccion de campos.

Se trata de un modelo con 0 descargas y 0 likes en el momento de la consulta, publicado bajo la etiqueta "smoke-adapter", lo que sugiere que es una prueba de humo (smoke test) del pipeline de entrenamiento mas que un modelo listo para produccion. La model card es minima y no documenta dataset, hiperparametros ni resultados, por lo que buena parte de las especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre transformer vision-language (Qwen2.5-VL: codificador visual + LLM decoder) |
| Parametros totales | No disponible para el adaptador; el modelo base ronda los 7B (nominal) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No confirmada para el adaptador; el modelo base soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible (depende del modelo base: FP16, INT8, INT4, GGUF, etc.) |
| Idiomas soportados | Ingles (`en`); el modelo base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Libreria | transformers |
| Modelo base | unsloth/Qwen2.5-VL-7B-Instruct |
| Pipeline declarado | text-generation-inference |

## Arquitectura y entrenamiento

El adaptador hereda la arquitectura del modelo base Qwen2.5-VL-7B-Instruct, un transformer multimodal compuesto por un codificador visual (ViT con resolucion dinamica y codificacion de posicion absoluta) y un decoder de lenguaje autorregresivo. El ajuste se realizo mediante Unsloth, que implementa kernels optimizados de atencion y retropropagacion para acelerar el entrenamiento de LoRA sobre GPUs de consumo. La model card indica unicamente "trained 2x faster with Unsloth" y no aporta detalles sobre el dataset, el numero de tokens, la composicion de los datos, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

No se especifica el rango de LoRA, la matriz objetivo, la tasa de aprendizaje ni el numero de pasos. Tampoco se documenta si el adaptador cubre solo el decoder de lenguaje o si tambien modifica el proyector vision-lenguaje, lo que es relevante para tareas de extraccion de documentos. Dado el sufijo "smoke" y el tamano reducido, es plausible que se trate de un entrenamiento de validacion del pipeline (Unsloth + TRL) mas que de un ajuste con dataset curado, pero esto no puede confirmarse con la informacion disponible.

## Capacidades

- Generacion de texto y comprension de imagenes heredadas del modelo base Qwen2.5-VL-7B-Instruct.
- Procesamiento de documentos e imagenes de facturas con posible extraccion de campos estructurados (inferido del identificador y de repositorios hermanos del mismo autor).
- Soporte multimodal de entrada: texto e imagen (segun los tags `qwen2_5_vl` y el modelo base).
- Soporte de function calling y tool calling a nivel del modelo base Qwen2.5-VL (no confirmado para el adaptador).
- Capacidades de razonamiento multi-paso heredadas del base (no confirmado para el adaptador).
- Capacidades multilingues limitadas al ingles segun la model card; el base soporta mas idiomas pero el ajuste solo declara `en`.
- No se documenta modo "thinking", audio ni otras capacidades especiales anadidas por el adaptador.

## Casos de uso

- Extraccion de campos de facturas: dado que el modelo base acepta imagenes, el adaptador podria emplearse para transcribir imagenes de facturas a JSON estructurado (numero de factura, fecha, proveedor, lineas, impuestos). Es el caso de uso coherente con el nombre y con los repositorios hermanos del autor.
- Digitalizacion de documentos contables: integracion en un pipeline batch que reciba PDFs escaneados, los convierta a imagen y los pase por el modelo para poblar una base de datos financiera.
- Validacion de datos extraidos: uso del modelo para cotejar campos entre factura y orden de compra, aprovechando la ventana de contexto larga del base (hasta 128.000 tokens) para concatenar varios documentos.
- Asistencia a equipos de cuentas por pagar: capa de extraccion previa a la conciliacion automatica, reduciendo la introduccion manual de datos.
- Procesamiento de justificantes en tickets y recibos: aplicacion a documentos de menor estructura donde el OCR clasico falla, apoyandose en la comprension visual del base.
- Generacion de resumenes de lotes de facturas: agrupacion de documentos y produccion de resumenes textuales con totales e incidencias, usando el modelo como generador de texto.
- Prototipado rapido en investigacion: al ser un adaptador pequeno (0,2 GB) sobre un base ligero, sirve para experimentar con tecnicas de ajuste multimodal sin gran coste de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de extraccion, MMLU, HumanEval, GSM8K ni comparativas con otros modelos, y el repositorio registra 0 descargas en el momento de la consulta.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,2 GB, pero requiere cargar el modelo base Qwen2.5-VL-7B-Instruct completo para inferencia.
- VRAM estimada para el base: en FP16 en torno a 15-16 GB; en 8 bits en torno a 9-10 GB; en 4 bits en torno a 5-6 GB (valores orientativos que dependen de la implementacion).
- La ventana de contexto de hasta 128.000 tokens puede multiplicar el consumo de memoria por la cache KV, especialmente con documentos largos.
- GPU recomendadas: A100 y H100 para produccion con contextos largos; RTX 4090 o RTX 3090 (24 GB) para ejecucion en 8 o 4 bits; RTX 4080 (16 GB) solo con cuantizacion de 4 bits y contextos moderados.
- Cabe en GPU de consumo si se cuantiza a 4 bits y se limita la longitud de contexto; en 8 bits encaja comodamente en 24 GB.
- Opciones de despliegue: vLLM, TGI, SGLang y llama.cpp u Ollama previa conversion a GGUF. El tag `text-generation-inference` y `endpoints_compatible` indican compatibilidad con TGI y con endpoints gestionados; los resultados de busqueda mencionan tambien FriendliAI para modelos similares del mismo autor.
- No se dispone de datos de latencia ni de throughput publicados para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| invoice-full-2.5-7B-smoke-adapter | No disponible (adaptador sobre ~7B) | No confirmado (base: 128.000) | Si (heredado del base) | Apache 2.0 | 0 descargas, sin benchmarks, etiqueta "smoke" |
| Qwen2.5-VL-7B-Instruct (base) | ~7B | 128.000 tokens | Si | Apache 2.0 | Modelo oficial con documentacion y evaluaciones publicadas |
| Qwen2.5-VL-7B-invoice-extraction (mismo autor) | No disponible | No confirmado | Si | Apache 2.0 | Ajuste especifico para facturas, mas documentado por el autor |
| Mistral-7B (usado en proyectos similares de extraccion) | 7B | 32.000 tokens (segun variante) | No | Apache 2.0 | Solo texto, requiere OCR previo |

La comparativa se limita a lo observable en los metadatos; no hay datos de rendimiento que permitan situar el adaptador frente a alternativas.

## Limitaciones y advertencias

- Modelo practicamente sin uso: 0 descargas y 0 likes, sin validacion por parte de la comunidad.
- La model card es minima: no documenta dataset, hiperparametros, evaluacion ni limitaciones conocidas.
- El sufijo "smoke-adapter" sugiere que se trata de una prueba del pipeline de entrenamiento, no de un modelo destinado a produccion.
- Idioma declarado unicamente el ingles; no hay garantia de comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente critico en extraccion de cifras monetarias, fechas e identificadores fiscales.
- No se documenta sesgo alguno, pero al no conocerse el dataset de ajuste no puede evaluarse su sesgo ni su cobertura de dominios.
- Aunque la licencia del adaptador es Apache 2.0, conviene verificar las condiciones del modelo base y de los datos de entrenamiento antes de un uso comercial.
- La fecha de creacion del repositorio (`2026-09-24`) es posterior a la fecha habitual de consulta, lo que puede indicar un error de metadatos o un entorno de prueba.
- No se especifica si el adaptador modifica el proyector vision-lenguaje; una integracion incorrecta con el base puede degradar la capacidad multimodal.
- Para uso en produccion se recomienda validar contra un conjunto propio de facturas antes de sustituir cualquier pipeline existente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman-madhiai/invoice-full-2.5-7B-smoke-adapter
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-VL-7B-Instruct
- Repositorio relacionado del mismo autor (extraccion de facturas): https://huggingface.co/lugman-madhiai/Qwen2.5-VL-7B-invoice-extraction
- Repositorio relacionado (extraccion estructurada): https://huggingface.co/lugman-madhiai/invoice-structured-extraction
- Ficha en FriendliAI del modelo de extraccion del mismo autor: https://friendli.ai/models/lugman-madhiai/Qwen2.5-VL-7B-invoice-extraction
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- Proyecto de referencia sobre extraccion de facturas con Mistral-7B: https://github.com/mohammedmanalodi/Invoice-Data-Extractor

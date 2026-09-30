# Abdoul27/dots-mocr-barbados

## Resumen

dots-mocr-barbados es un ajuste fino (fine-tune) del modelo multimodal de OCR dots.mocr, publicado por el usuario Abdoul27 en HuggingFace. Se trata de un modelo de 3.039.179.264 parametros (unos 3,04 mil millones) orientado a la transcripcion de texto manuscrito y a la digitalizacion de documentos historicos, en este caso con un dominio declarado especifico: Barbados. El pipeline asociado es image-text-to-text, por lo que recibe imagenes de documentos y devuelve texto estructurado.

El modelo hereda la arquitectura y el tokenizador de dots-studio/dots.mocr, un sistema multimodal de OCR desarrollado por el equipo de dots (vinculado a Xiaohongshu/rednote) capaz de extraer contenido de documentos, imagenes, paginas web y escenas. La relevancia de este fine-tune radica en la especializacion: los modelos OCR genericos rinden peor sobre caligrafia historica, tipografias antiguas y layouts degradados, de modo que un ajuste sobre un corpus regional concreto puede mejorar sustancialmente la tasa de reconocimiento en ese dominio.

El acceso al repositorio esta restringido (gated): es necesario aceptar condiciones en HuggingFace para descargar los pesos. La licencia declarada es MIT, el formato de pesos es safetensors y el repositorio ocupa 12,2 GB, coherente con pesos almacenados en fp32. No hay descargas ni valoraciones publicas, ni se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language heredada de dots-studio/dots.mocr; detalle interno no disponible |
| Parametros totales | 3.039.179.264 (aprox. 3,04 B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales; el repositorio contiene pesos en safetensors (12,2 GB, coherente con fp32) |
| Idiomas soportados | No disponible para el fine-tune; el modelo base se distribuye en ModelScope con soporte de chino y multilingue |
| Licencia | MIT |
| Formato de pesos | Safetensors (libreria transformers, requiere trust_remote_code) |
| Pipeline | image-text-to-text |
| Modelo base | dots-studio/dots.mocr (fine-tune) |
| Acceso | Restringido (gated): requiere aceptar condiciones |
| Fecha de publicacion | 30 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Tamano del repositorio | 12,2 GB |

## Arquitectura y entrenamiento

Se trata de un fine-tune supervisado del modelo dots-studio/dots.mocr, tal como indican las etiquetas `base_model:dots-studio/dots.mocr` y `base_model:finetune:dots-studio/dots.mocr`. La arquitectura subyacente es un transformer multimodal de tipo vision-language: la imagen se codifica con un encoder visual y el texto se genera de forma autoregresiva con decodificacion autorregresiva estandar. El repositorio incluye el tag `custom_code`, lo que implica que la implementacion del modelo no reside por completo en la libreria transformers y que es necesario activar `trust_remote_code=True` para cargarlo. El modelo base se describe por sus autores como de arquitectura compacta, lo que encaja con los aproximadamente 3.040 millones de parametros.

No se dispone de informacion sobre el corpus de entrenamiento del fine-tune: no se detallan el numero de tokens, la composicion del dataset, el origen de las imagenes de documentos de Barbados, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT con pares verificados manualmente. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal o metodos de compresion de tokens visuales) mas alla de las que incorpore el modelo base.

Del modelo base dots.mocr si se conocen algunas capacidades declaradas: parsing de documentos, de imagenes, de paginas web y de escenas (scene spotting), con soporte de salida SVG durante la inferencia. Sus propios autores reconocen como limitacion que la extraccion de tablas complejas y formulas matematicas sigue siendo una tarea dificil para su arquitectura compacta.

## Capacidades

- Generacion de texto a partir de imagenes (image-text-to-text) mediante el pipeline estandar de transformers.
- OCR sobre documentos: extraccion de texto de paginas escaneadas, incluyendo estructuracion basica del contenido.
- Reconocimiento de texto manuscrito (HTR, handwritten text recognition), segun los tags `handwriting` y `htr` del repositorio.
- Procesamiento de documentos historicos, con un ajuste orientado a materiales de Barbados.
- Capacidad conversacional declarada mediante el tag `conversational`, heredada del modelo base.
- Parsing de documentos, imagenes, paginas web y escenas, segun la documentacion del modelo base dots.mocr.
- Salida en formato SVG durante la inferencia, segun los ejemplos publicados del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue especifica del fine-tune: no disponible.

## Casos de uso

- Digitalizacion de archivos historicos de Barbados: el modelo transcribe automaticamente paginas manuscritas de registros parroquiales, libros de plantaciones o correspondencia colonial, reduciendo el trabajo manual de paleografia sobre corpus regionales.
- Proyectos de humanidades digitales: integracion en pipelines de investigacion que convierten colecciones escaneadas en texto buscable y analizable con tecnicas de procesamiento del lenguaje natural.
- Construccion de corpus para modelos de lenguaje historicos: la transcripcion masiva de documentos de archivo permite generar datasets de texto de dominio especifico que despues se emplean en ajustes finos o en analisis linguistico diacronico.
- Indexacion y busqueda en repositorios documentales: al extraer texto de imagenes, un archivo digital puede pasar de un catalogo de imagenes a un indice de texto completo consultable por investigadores.
- Preservacion y accesibilidad: conversion de documentos fragiles en versiones legibles por maquina, con el consiguiente beneficio para la conservacion (menos manipulacion del original) y para la accesibilidad.
- Extraccion de entidades en documentos administrativos historicos: nombres, fechas, lugares y transacciones que despues se normalizan y cargan en bases de datos genealogicas o catastrales.
- Flujos asistidos de transcripcion: uso del modelo como primera pasada automatica y revision humana posterior, con un coste mucho menor que la transcripcion manual desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye tabla de evaluacion (CER, WER, MMLU u otras metricas) y no se han encontrado resultados asociados especificamente a este fine-tune en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: alrededor de 6,1 GB solo para pesos, mas memoria de activaciones y cache; en la practica, entre 8 y 10 GB para inferencia con una imagen por vez.
- VRAM estimada en int8: aproximadamente 3-4 GB de pesos, con un total de 5-6 GB incluyendo overhead.
- VRAM estimada en int4: aproximadamente 1,6-2 GB de pesos, con un total de 3-4 GB.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En configuraciones de 8 GB conviene usar cuantizacion de 8 bits o inferior.
- GPU profesionales recomendadas para produccion o lotes grandes: A100 40/80 GB, H100, L40S, con posibilidad de procesar varias imagenes por lote.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada. El tag `custom_code` puede complicar el soporte directo en vLLM o TGI, por lo que conviene verificar la compatibilidad del codigo antes de plantear un despliegue de alto throughput. No se ofrecen pesos GGUF, por lo que llama.cpp y Ollama no son viables sin una conversion previa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de procesamiento por pagina.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dots-mocr-barbados | 3,04 B | No disponible | OCR y manuscrito historico (Barbados) | MIT | HuggingFace, acceso restringido |
| dots-studio/dots.mocr (base) | No disponible | No disponible | OCR multimodal general (documentos, imagenes, web, escenas) | No disponible en la informacion proporcionada | HuggingFace y ModelScope |
| GOT-OCR2.0 | 580 M | No disponible | OCR generalista end-to-end | No disponible en la informacion proporcionada | Publico |
| TrOCR (base / large) | 334 M / 558 M | No disponible | OCR de lineas de texto impreso y manuscrito | No disponible en la informacion proporcionada | Publico |

La comparacion cuantitativa de rendimiento no es posible con la informacion disponible: no hay benchmarks publicados del fine-tune ni resultados comparables extraidos de la busqueda web. La diferencia principal frente a las alternativas es el dominio: dots-mocr-barbados esta especializado en un corpus regional concreto, mientras que los modelos genericos cubren un rango mas amplio de documentos con menor adaptacion a caligrafia y tipografia historica local.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace antes de poder descargar los pesos.
- Sin benchmarks publicados: no existen metricas de tasa de error de caracteres (CER) o de palabra (WER) que permitan estimar la calidad real del fine-tune.
- Sin validacion de la comunidad: cero descargas y cero valoraciones en el momento de la consulta, por lo que no hay evidencia externa de funcionamiento.
- Riesgo de alucinacion en OCR: como todo modelo generativo aplicado a percepcion, puede introducir texto plausible que no aparece en la imagen, especialmente en zonas degradadas, manchadas o con caligrafia ambigua. En documentos historicos esto es particularmente peligroso porque el texto inventado puede pasar desapercibido.
- Limitaciones heredadas del modelo base: los propios autores de dots.mocr senalan que la extraccion de tablas complejas y formulas matematicas es una tarea dificil para su arquitectura compacta.
- Ambito limitado: el ajuste esta orientado a documentos de Barbados; su rendimiento fuera de ese dominio (otros paises, otras lenguas, otro tipo de caligrafia) no esta documentado y previsiblemente sera inferior.
- Idiomas no declarados: la ficha no especifica que lenguas soporta el fine-tune ni la composicion linguistica de los documentos de entrenamiento.
- Dependencia de codigo personalizado: el tag `custom_code` obliga a ejecutar codigo del repositorio con `trust_remote_code=True`, lo que implica un riesgo de seguridad si no se audita previamente.
- Requisitos de contexto y formato: no se documenta la longitud de contexto ni la resolucion de imagen esperada, dos parametros criticos para el rendimiento en documentos densos.
- Licencia: MIT permite uso comercial, pero conviene verificar que la licencia y las condiciones del modelo base dots-studio/dots.mocr sean compatibles, ya que la informacion disponible no detalla sus terminos.
- Uso en produccion: cualquier despliegue serio deberia incluir una fase de validacion sobre una muestra anotada manualmente del corpus objetivo antes de confiar en las transcripciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Abdoul27/dots-mocr-barbados
- Modelo base en HuggingFace: https://huggingface.co/dots-studio/dots.mocr
- Arbol de ficheros del modelo base: https://huggingface.co/dots-studio/dots.mocr/tree/main
- Repositorio en GitHub: https://github.com/studio-dots-ai/dots.mocr
- Demo de dots.mocr: https://dotsocr.xiaohongshu.com/
- Modelo base en ModelScope: https://www.modelscope.cn/models/dots-studio/dots.mocr
- Referencia adicional encontrada: https://huggingface.co/rednote-hilab/dots.mocr

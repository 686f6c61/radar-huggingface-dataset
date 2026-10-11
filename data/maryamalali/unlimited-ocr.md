# MaryamAlAli/Unlimited-OCR

## Resumen

Unlimited-OCR es un modelo multimodal de vision-lenguaje (pipeline image-text-to-text) desarrollado por Baidu para reconocimiento optico de caracteres y parseo estructurado de documentos. La ficha analizada corresponde al repositorio `MaryamAlAli/Unlimited-OCR`, un espejo no oficial del original `baidu/Unlimited-OCR` publicado en Hugging Face. Con 3.336.106.240 parametros (aproximadamente 3,34 mil millones) y pesos en formato safetensors, el modelo se presenta como una evolucion de DeepSeek-OCR, con el objetivo declarado de "llevar el OCR un paso mas alla" mediante lo que el autor denomina "one-shot long-horizon parsing".

El modelo esta disenado para procesar imagenes de documentos, paginas multiples y PDFs completos en una unica pasada, generando texto estructurado a partir de la entrada visual. Soporta inferencia con transformers, vLLM y SGLang, incluye utilidades oficiales para convertir PDF a imagen y ofrece dos modos de resolucion (gundam y base) para imagen suelta. Su licencia es MIT y esta etiquetado como multilingue, aunque no se detallan los idiomas concretos soportados.

Su relevancia actual radica en que compite directamente con DeepSeek-OCR en la categoria de OCR de documentos largos y multipagina, un nicho donde el coste computacional por pagina y la fidelidad de reconstruccion de tablas y maquetas complejas son criticos. Al ser un modelo de ~3,3 B de parametros con licencia permisiva, resulta candidato para despliegues self-hosted en hardware de gama alta de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (image-text-to-text); codificador visual mas decodificador de lenguaje. Detalles internos no disponibles |
| Parametros totales | 3.336.106.240 (~3,34 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como especificacion del modelo; las recetas oficiales de inferencia usan `max_length=32768` |
| Tipos de cuantizacion | no disponible; las recetas oficiales cargan los pesos safetensors en `bfloat16` |
| Idiomas soportados | multilingue (idiomas concretos no disponibles) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 6,8 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El modelo se enmarca en la categoria de vision-lenguaje para OCR, con un pipeline `image-text-to-text`, un codificador visual que transforma la imagen en tokens y un decodificador de lenguaje que genera la salida textual. El repositorio esta marcado con la etiqueta `custom_code`, lo que implica que la implementacion depende de codigo propio del autor y requiere `trust_remote_code=True` en transformers.

La innovacion destacada por el autor es el "long-horizon parsing" en una sola pasada: el modelo puede encadenar el parseo de varias paginas sin reiniciar el contexto por documento. Para ello ofrece dos configuraciones de imagen suelta, `gundam` (`base_size=1024`, `image_size=640`, `crop_mode=True`) y `base` (`base_size=1024`, `image_size=1024`, `crop_mode=False`), y una ruta `infer_multi` restringida al modo `base` para multiples paginas o PDFs. Se aplica penalizacion por repeticion con `no_repeat_ngram_size=35` y ventanas de 128 o 1024 n-gramas segun el caso. No hay informacion disponible sobre numero de tokens de entrenamiento, composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Parseo de imagenes de documentos a texto estructurado, presumiblemente en formato Markdown o similar.
- Procesamiento multipagina y de PDFs completos mediante `infer_multi`, previa conversion de paginas a imagen con PyMuPDF.
- Doble configuracion de resolucion para imagenes sueltas (gundam con recorte, base sin recorte).
- Salida multilingue (idiomas concretos no documentados).
- Inferencia en transformers, vLLM y SGLang.
- Entrenamiento y ajuste fino mediante ms-swift.
- Despliegue gestionado en Baidu Cloud y publicacion en ModelScope.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso general, vision mas alla de OCR, audio o modo de pensamiento explicito.

## Casos de uso

- Digitalizacion masiva de archivos PDF: el modelo puede procesar un PDF completo convirtiendo sus paginas a imagen y ejecutando `infer_multi` en una sola pasada, lo que reduce la orquestacion necesaria frente a pipelines que procesan pagina a pagina.
- Extraccion de datos de facturas y albaranes: con la configuracion `gundam` (recorte activado) se pueden aislar regiones densas como tablas de lineas de pedido y reconstruir el texto estructurado para alimentar un ERP.
- Conversion de documentacion tecnica escaneada a texto indexable: el parseo de manuales con diagramas y tablas permite generar corpus de texto para busqueda interna o RAG sobre documentacion antigua.
- Automatizacion de back office legal: parseo de contratos en PDF multipagina para extraer clausulas y metadatos, con la ventaja de mantener el contexto del documento completo en una sola inferencia.
- Procesamiento de documentos en varias lenguas: al etiquetarse como multilingue, puede emplearse en entornos con documentacion en idiomas mezclados, aunque la cobertura real por idioma no esta documentada.
- Servicio de OCR desplegado con vLLM o SGLang: gracias a los contenedores Docker oficiales y las recetas publicadas, se puede levantar un endpoint compatible con la API OpenAI y escalarlo horizontalmente en GPU.
- Ajuste fino por dominio con ms-swift: organizaciones con tipografias o formularios muy especificos pueden reentrenar el modelo para mejorar la precision en su vertical concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia el articulo de arXiv (2606.23050) y una demo en Hugging Face Spaces, pero no incluye tablas comparativas de MMLU, HumanEval, GSM8K ni metricas de OCR como CER, WER o exactitud en OmniDocBench.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 6,7 GB en bfloat16 (3,34 B de parametros x 2 bytes). Es una estimacion a partir del numero de parametros, no un dato oficial.
- VRAM total de inferencia: se necesitan varios GB adicionales por el cache de atencion al procesar imagenes de resolucion completa y contextos de hasta 32.768 tokens. Como referencia orientativa, un margen de 12 a 24 GB en GPU resulta comodo para una pagina; el procesamiento multipagina eleva ese requisito. No hay cifras oficiales.
- GPU consumer: cabe en tarjetas de 24 GB como la RTX 3090 o la RTX 4090. En GPUs de 16 GB es viable con margen limitado; en 12 GB el despliegue es ajustado y probablemente requiera cuantizacion, no documentada oficialmente.
- GPU de datacenter: A100, H100 y similares son adecuadas para lotes grandes o despliegues concurrentes.
- Opciones de despliegue: transformers (probado con Python 3.12.3, CUDA 12.9, torch 2.10.0 y transformers 4.57.1), vLLM mediante las imagenes `vllm/vllm-openai:unlimited-ocr` y `vllm/vllm-openai:unlimited-ocr-cu129` para Hopper, SGLang con wheel especifico, Baidu Cloud y ModelScope. Requiere `pymupdf` para la conversion de PDF a imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unlimited-OCR | 3,34 B | no disponible (recetas usan 32.768 tokens) | OCR VLM, parseo multipagina en una pasada | MIT | Hugging Face, GitHub, ModelScope, Baidu Cloud |
| DeepSeek-OCR | no disponible en la informacion proporcionada | no disponible | OCR VLM, referencia declarada por Baidu | no disponible | no disponible en esta busqueda |
| GOT-OCR2.0 | no disponible en la informacion proporcionada | no disponible | OCR VLM de proposito general | no disponible | no disponible en esta busqueda |

La model card de Unlimited-OCR cita explicitamente DeepSeek-OCR como el modelo al que pretende superar, pero no aporta cifras comparativas. Para el resto de alternativas no se dispone de datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio analizado (`MaryamAlAli/Unlimited-OCR`) no es el oficial; el original es `baidu/Unlimited-OCR`. Presenta 0 descargas y 0 likes, y no hay garantia de que sus pesos coincidan bit a bit con los del autor ni de que disponga de mantenimiento.
- No hay benchmarks publicados que permitan validar la calidad del OCR frente a alternativas.
- El contexto maximo real del modelo no esta especificado; el valor 32.768 aparece como parametro de inferencia, no como limite arquitectonico confirmado.
- Los idiomas concretos soportados no estan documentados, solo la etiqueta generica "multilingual".
- Riesgo de alucinacion inherente a los modelos generativos: el modelo puede inventar texto en zonas borrosas, omitir lineas o reconstruir mal tablas y formulas.
- Sesgos esperables hacia tipografias, idiomas y tipos de documento sobrerrepresentados en el entrenamiento (dataset no publicado). Documentos manuscritos, sellos o escaneos de baja calidad suelen degradar el resultado.
- La licencia MIT permite uso comercial, pero el modelo requiere `trust_remote_code=True` y depende de codigo personalizado: conviene auditar ese codigo antes de ejecutarlo en produccion por motivos de seguridad.
- El despliegue con vLLM o SGLang depende de wheels e imagenes Docker especificas; versiones distintas pueden no ser compatibles.
- Las fechas de publicacion recogidas en la model card son posteriores a la fecha de creacion del espejo analizado, lo que sugiere que este repositorio podria estar desincronizado respecto al oficial.

## Enlaces

- Repositorio analizado (espejo): https://huggingface.co/MaryamAlAli/Unlimited-OCR
- Repositorio oficial en Hugging Face: https://huggingface.co/baidu/Unlimited-OCR
- Repositorio de codigo en GitHub: https://github.com/baidu/Unlimited-OCR
- Paper en arXiv: https://arxiv.org/abs/2606.23050
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/baidu/Unlimited-OCR
- ModelScope: https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR
- Receta de vLLM: https://recipes.vllm.ai/baidu/Unlimited-OCR
- Documentacion en Baidu Cloud: https://cloud.baidu.com/doc/OCR/s/fmr1p39gb
- Repositorio de ms-swift: https://github.com/modelscope/ms-swift
- Perfil de X (Twitter) de Baidu: https://x.com/Baidu_Inc
- Trendshift: https://trendshift.io/repositories/62053

# sharonSD/Unlimited-OCR

## Resumen

Unlimited-OCR es un modelo de vision-lenguaje especializado en extraccion y parseo de texto a partir de imagenes y documentos, orientado a lo que el autor denomina "parseo de largo horizonte en un solo paso" (one-shot long-horizon parsing). El repositorio analizado, `sharonSD/Unlimited-OCR`, es una redistribucion del modelo original `baidu/Unlimited-OCR` desarrollado por Baidu Inc.; la model card, los badges y los enlaces del repositorio apuntan a la organizacion Baidu, el repositorio GitHub `baidu/Unlimited-OCR` y el articulo `arXiv:2606.23050`, mientras que el autor de la subida en HuggingFace figura como `sharonSD`.

El modelo cuenta con 3.336.106.240 parametros (aproximadamente 3,34 mil millones) y se distribuye en safetensors con un tamano de repositorio de 6,8 GB. La model card lo presenta como una evolucion de DeepSeek-OCR, con soporte de inferencia en transformers, vLLM y SGLang, y entrenamiento mediante ms-swift. Su relevancia actual radica en el interes creciente por pipelines de document AI capaces de procesar documentos completos (incluidos PDF multipagina) sin segmentacion manual previa.

Es un modelo de licencia MIT, etiquetado como multilingue y con pipeline `image-text-to-text`. La informacion publicada no detalla la arquitectura interna, la composicion del dataset de entrenamiento ni resultados de benchmarks, por lo que varios apartados de esta ficha quedan marcados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de vision-lenguaje OCR con codigo personalizado; requiere `trust_remote_code`) |
| Parametros totales | 3.336.106.240 (aproximadamente 3,34 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 32.768 tokens en la configuracion de inferencia documentada (`max_length=32768`); limite maximo oficial no disponible |
| Tipos de cuantizacion | bfloat16 (configuracion de referencia con `torch_dtype=torch.bfloat16`); no se documentan variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | multilingue (segun la model card; la lista concreta de idiomas no esta disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors (`use_safetensors=True`) |

## Arquitectura y entrenamiento

La informacion publicada no especifica la arquitectura interna (tipo de transformer, vision encoder, mecanismo de atencion ni si emplea alguna innovacion como atencion lineal o decodificacion especulativa). Lo que si se documenta es que se trata de un modelo de vision-lenguaje para OCR que requiere ejecucion de codigo personalizado (`trust_remote_code=True`) y que su funcion principal es el parseo de documentos. La model card lo posiciona explicitamente como un paso mas alla de DeepSeek-OCR, lo que sugiere una linea arquitectonica inspirada en ese linaje, aunque el repositorio no confirma detalles tecnicos concretos.

En cuanto a la inferencia, el modelo expone dos funciones principales, `infer` e `infer_multi`. La primera procesa una imagen individual y admite dos configuraciones: "gundam" (`base_size=1024`, `image_size=640`, `crop_mode=True`) y "base" (`base_size=1024`, `image_size=1024`, `crop_mode=False`). La segunda gestiona documentos multipagina y PDF (convertidos previamente a imagenes con PyMuPDF) usando exclusivamente la configuracion base con `image_size=1024`. Ambas emplean `max_length=32768` y penalizacion por repeticion de n-gramas (`no_repeat_ngram_size=35`). No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Extraccion de texto (OCR) a partir de imagenes de documentos.
- Parseo de documentos de una sola pagina en dos modos de resolucion (gundam y base).
- Parseo multipagina y de PDF completo mediante conversion de paginas a imagenes.
- Generacion de salida estructurada de documentos, con volumen de salida de hasta 32.768 tokens por pasada.
- Soporte multilingue (segun la etiqueta de la model card; idiomas concretos no especificados).
- Integracion con pipelines de inferencia de produccion mediante vLLM y SGLang.
- Entrenamiento y ajuste fino mediante ms-swift.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, audio ni modo de razonamiento explicito.

## Casos de uso

- Digitalizacion masiva de archivos PDF: el modelo puede procesar documentos multipagina completos mediante `infer_multi`, convirtiendo primero cada pagina a imagen (por ejemplo con PyMuPDF a 300 dpi), lo que resulta adecuado para digitalizar expedientes extensos sin segmentacion manual.
- Extraccion de texto en facturas y albaranes: la configuracion "gundam" con `crop_mode=True` permite adaptar la resolucion a documentos con tipografias densas o tablas, facilitando el volcado a sistemas de gestion.
- Procesamiento de documentacion tecnica y manuales: gracias a la ventana de 32.768 tokens, permite abordar documentos con gran densidad de contenido en una sola pasada, reduciendo la perdida de contexto entre fragmentos.
- Alimentacion de pipelines RAG sobre documentacion escaneada: el texto extraido puede indexarse en bases vectoriales para sistemas de busqueda semantica sobre corpus historicos digitalizados.
- Migracion de archivos fisicos en administraciones y archivos historicos: al distribuirse con licencia MIT y en safetensors, permite su despliegue en infraestructura propia sin coste de licencia.
- Servicio de OCR como API interna: con los contenedores oficiales de vLLM (`vllm/vllm-openai:unlimited-ocr`) puede exponerse un endpoint compatible con la API de OpenAI para integrarlo en aplicaciones internas.
- Preprocesado para entrenamiento de modelos sobre datos historicos: la extraccion masiva de texto limpio desde imagenes sirve para construir corpus que alimenten otros modelos.
- Automatizacion de lectura de contratos o expedientes legales: el parseo multipagina permite convertir documentos juridicos extensos a texto estructurado para revisiones automatizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,34 B de parametros, los pesos en bfloat16 ocupan aproximadamente 6,7 GB. El repositorio ocupa 6,8 GB. A esto hay que sumar activaciones, cache de atencion y el procesamiento de imagenes hasta 1024 px, por lo que en la practica se recomienda reservar entre 12 y 16 GB de VRAM. Estimacion orientativa basada en el recuento de parametros; no confirmada por el autor.
- GPU recomendadas: no especificadas por el autor. Dado el tamano, una GPU con 16 GB o mas (por ejemplo RTX 4090, RTX 4080, A100 40 GB, H100) deberia ser suficiente. La model card menciona contenedores especificos para GPUs Hopper (CUDA 12.9) y un contenedor por defecto con CUDA 13.0.
- Compatibilidad con GPU de consumo: probable en tarjetas con 16 GB o mas de VRAM, como la RTX 4090 o la RTX 4080, segun la estimacion anterior. No confirmado por el autor.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), vLLM (receta oficial y contenedores Docker), SGLang (con wheel local y `kernels==0.9.0`/`0.11.7`), ms-swift para entrenamiento y Baidu Cloud como servicio gestionado.
- Latencia y throughput: no disponible. No se publican cifras de tokens por segundo ni tiempos de procesamiento por pagina.

## Comparativa con modelos similares

La model card situa explicitamente a Unlimited-OCR como una evolucion de DeepSeek-OCR, citando el repositorio `deepseek-ai/DeepSeek-OCR`. Sin embargo, el repositorio analizado no incluye datos de parametros, contexto, rendimiento ni licencia de esos modelos comparables, por lo que no es posible elaborar una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sharonSD/Unlimited-OCR | 3,34 B | hasta 32.768 tokens en inferencia documentada | MIT | HuggingFace, ModelScope, vLLM, SGLang, Baidu Cloud |
| DeepSeek-OCR | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con otras alternativas de OCR basado en vision-lenguaje.

## Limitaciones y advertencias

- Es una redistribucion (`sharonSD/Unlimited-OCR`) de un modelo original de Baidu; conviene usar el repositorio oficial `baidu/Unlimited-OCR` para obtener la version mantenida y con soporte.
- El repositorio analizado no registra descargas ni likes en el momento de la consulta, lo que dificulta validar su adopcion y estado de mantenimiento.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo de terceros; es un riesgo de seguridad que debe evaluarse en entornos de produccion.
- No se detallan sesgos conocidos ni la composicion del dataset de entrenamiento.
- Riesgo de alucinacion: no se documenta, pero es inherente a los modelos generativos; el uso de `no_repeat_ngram_size` sugiere que el autor mitiga repeticiones en la salida, sin que se describan garantias de fidelidad del texto extraido.
- La lista concreta de idiomas soportados no esta disponible, pese a la etiqueta "multilingual".
- El limite maximo de contexto no se especifica; el valor de 32.768 tokens aparece unicamente como parametro de los ejemplos de inferencia.
- No se publican resultados de benchmarks, por lo que el rendimiento real frente a otras soluciones OCR no puede contrastarse.
- La licencia MIT permite uso comercial, pero al tratarse de una redistribucion conviene verificar los terminos del repositorio original.
- La model card no especifica requisitos minimos de hardware ni cifras de latencia, lo que complica la planificacion de capacidad en produccion.

## Enlaces

- Repositorio HuggingFace analizado: https://huggingface.co/sharonSD/Unlimited-OCR
- Repositorio HuggingFace oficial: https://huggingface.co/baidu/Unlimited-OCR
- Codigo en GitHub: https://github.com/baidu/Unlimited-OCR
- Articulo en arXiv: https://arxiv.org/abs/2606.23050
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/baidu/Unlimited-OCR
- Receta oficial de vLLM: https://recipes.vllm.ai/baidu/Unlimited-OCR
- ModelScope: https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR
- Documentacion en Baidu Cloud: https://cloud.baidu.com/doc/OCR/s/fmr1p39gb
- Repositorio de referencia DeepSeek-OCR: https://github.com/deepseek-ai/DeepSeek-OCR
- Perfil de X de Baidu: https://x.com/Baidu_Inc
- Trendshift: https://trendshift.io/repositories/62053
- ms-swift: https://github.com/modelscope/ms-swift

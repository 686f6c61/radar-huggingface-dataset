# jefflaporte/chandra-ocr-2-MLX-8bit

## Resumen

Chandra OCR 2 MLX 8-bit es una cuantizacion de 8 bits del modelo Chandra OCR 2 de Datalab, empaquetada en formato MLX para su ejecucion en Apple Silicon. El modelo original es un sistema de OCR y comprension de documentos de tipo image-text-to-text construido sobre Qwen3.5-4B de Alibaba Cloud, y esta version concreta ha sido generada por el usuario jefflaporte mediante mlx-vlm 0.7.6 para reducir el peso del checkpoint y hacerlo viable en hardware de Apple.

El modelo resuelve la transcripcion de documentos escaneados y la extraccion de estructura (texto, cajas delimitadoras y layout) a partir de imagenes de pagina, con capacidad de procesar hasta 6.291.456 pixeles por pagina. Su relevancia practica esta en que permite desplegar un OCR de calidad sobre un Mac, sin GPU dedicada, manteniendo segun el autor la fidelidad de texto del modelo BF16 original en una comprobacion puntual sobre documentos mecanografiados de los anos 40.

La ficha se centra en esta variante cuantizada: 4.539.265.536 parametros, repositorio de 5,2 GB, licencia OpenRAIL modificada con restricciones comerciales y libreria MLX. No se dispone de informacion publica sobre benchmarks del modelo original en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (vision tower + language model basado en Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afina en grupos de 64 (MLX); torre de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | openrail (OpenRAIL-M modificada, con restricciones comerciales en el anexo A) |
| Formato de pesos | safetensors (MLX), repositorio de 5,2 GB |

## Arquitectura y entrenamiento

La arquitectura combina una torre de vision, que se mantiene en BF16 en esta cuantizacion, con un modelo de lenguaje derivado de Qwen3.5-4B. En la version MLX 8-bit se cuantizan todas las proyecciones del modelo de lenguaje y la tabla de tokens, que tambien actua como cabeza de salida (pesos atados), mediante cuantizacion afina de 8 bits en grupos de 64, con redondeo al mas cercano y sin calibracion. La torre de vision, el tokenizer, la plantilla de chat y la configuracion del procesador se mantienen identicos al original.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. La conversion se realizo con mlx-vlm 0.7.6 mediante el comando `mlx_vlm convert --hf-path datalab-to/chandra-ocr-2 --mlx-path chandra-ocr-2-MLX-8bit -q --q-bits 8 --q-group-size 64`. El autor restauro los ficheros `preprocessor_config.json`, `processor_config.json` y `video_preprocessor_config.json` originales, ya que mlx-vlm los reescribe en la conversion y vLLM los rechaza en esa forma.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos escaneados, incluyendo documentos mecanografiados y ledgers de gastos.
- Extraccion de layout: genera cajas delimitadoras ademas del texto, con desplazamiento maximo de un pixel respecto al modelo BF16 segun la comprobacion del autor.
- Procesamiento de paginas de alta resolucion, hasta 6.291.456 pixeles por imagen.
- Entrada image-text-to-text conversacional, con plantilla de chat propia.
- Soporte de inferencia en Apple Silicon mediante MLX y en servidores compatibles con vLLM a traves de vllm-metal.
- Integracion con el cliente oficial `chandra-ocr` para procesar PDFs y generar salida estructurada.
- Soporte de tool calling, agentes, vision adicional, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de archivos historicos: el modelo puede transcribir documentos mecanografiados y escaneados, como los memos y cartas de los anos 40 usados en la comprobacion del autor, conservando el texto y las coordenadas de cada region para reconstruir el layout original.
- Procesamiento de facturas y ledgers: la extraccion conjunta de texto y cajas delimitadoras permite identificar lineas de concepto, importes y columnas en documentos contables, adecuado para pipelines de contabilidad automatizada.
- Extraccion de datos de formularios: con soporte de hasta 6,29 megapixeles por pagina, puede procesar formularios densos sin perder la estructura de campos y etiquetas, alimentando sistemas de captura de datos.
- Archivado documental con metadatos espaciales: las cajas delimitadoras permiten indexar regiones de una pagina (titulos, parrafos, tablas) y construir indices de busqueda sobre documentos escaneados.
- Digitalizacion en puesto de trabajo con Mac: al ejecutarse con MLX sobre Apple Silicon, permite montar un servicio local de OCR sin GPU dedicada, usando `mlx_vlm.server` o vllm-metal para servir el modelo.
- Preprocesado para RAG sobre PDFs: la transcripcion pagina a pagina con layout preservado sirve como etapa previa a la fragmentacion e indexacion en sistemas de recuperacion aumentada, especialmente en corpus con maquetacion compleja.
- Automatizacion de revision documental: integrado en un flujo con el cliente `chandra-ocr`, puede procesar lotes de PDFs y generar salidas estructuradas para revision humana o validacion automatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una comprobacion puntual sobre nueve documentos mecanografiados escaneados de los anos 40 (memos, cartas y un ledger de gastos), en la que el texto coincidio con el del modelo BF16 original en todas las paginas y las cajas delimitadoras se desplazaron como maximo un pixel. El propio autor indica que se trata de una comprobacion puntual y no de un benchmark, y recomienda evaluar con olmOCR-bench antes de confiar en el modelo.

## Requisitos de hardware

- VRAM/espacio estimado: el repositorio ocupa 5,2 GB; el autor indica 4,8 GB para los pesos cuantizados. En Apple Silicon la memoria unificada debe cubrir el modelo mas el procesamiento de imagenes de hasta 6,29 megapixeles.
- Hardware objetivo: Apple Silicon (MLX). No se indica soporte nativo para GPU NVIDIA en esta variante; el despliegue con vLLM se realiza mediante vllm-metal.
- GPU consumer: no disponible para CUDA en esta variante; en Macs con memoria unificada suficiente el modelo es viable por su tamano de 4,8 GB.
- Opciones de despliegue: `mlx_vlm.server --model jefflaporte/chandra-ocr-2-MLX-8bit`, o `vllm serve jefflaporte/chandra-ocr-2-MLX-8bit --served-model-name chandra --mm-processor-kwargs '{"min_pixels": 3136, "max_pixels": 6291456}'` con vllm-metal, junto con el cliente `chandra-ocr` (`pip install chandra-ocr`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jefflaporte/chandra-ocr-2-MLX-8bit | 4.539.265.536 | no disponible | safetensors MLX 8-bit | openrail con restricciones comerciales | Hugging Face, 52 descargas |
| datalab-to/chandra-ocr-2 (original BF16) | no disponible en la informacion (base Qwen3.5-4B) | no disponible | safetensors BF16 | openrail con restricciones comerciales | Hugging Face |
| Qwen/Qwen3.5-4B | no disponible | no disponible | safetensors | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos mencionados en la documentacion disponible. No se dispone de datos de rendimiento comparado entre ellos.

## Limitaciones y advertencias

- La licencia es una OpenRAIL-M modificada con restricciones comerciales en el anexo A: prohibido el uso por organizaciones con mas de 2 millones de dolares de ingresos anuales o financiacion total, salvo uso personal o de investigacion, y prohibido el uso por competidores de Datalab. Las licencias comerciales se gestionan a traves de datalab.to.
- La cuantizacion a 8 bits puede degradar la calidad frente al BF16 original; la unica validacion reportada es una comprobacion puntual sobre nueve documentos, no un benchmark.
- El modelo esta empaquetado para MLX y Apple Silicon; no se garantiza su funcionamiento en otros backends sin conversion adicional.
- Si el servidor limita la resolucion de imagen por debajo de 6.291.456 pixeles, se puede perder el layout de paginas densas, segun advierte el autor.
- Los ficheros de configuracion del procesador fueron restaurados manualmente; modificaciones adicionales de la configuracion pueden romper la compatibilidad con vLLM.
- Sesgos conocidos, riesgo de alucinacion, idiomas soportados y limitaciones de contexto: no disponible en la informacion proporcionada.
- El modelo es una modificacion de terceros (jefflaporte) y no esta respaldado por Datalab; para produccion conviene evaluar con olmOCR-bench y considerar el checkpoint original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jefflaporte/chandra-ocr-2-MLX-8bit
- Modelo base original: https://huggingface.co/datalab-to/chandra-ocr-2
- Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Datalab: https://www.datalab.to/
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- vllm-metal: https://github.com/vllm-project/vllm-metal
- olmOCR-bench: https://github.com/allenai/olmocr

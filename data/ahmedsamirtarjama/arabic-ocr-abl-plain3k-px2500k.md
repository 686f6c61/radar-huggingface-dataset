# ahmedsamirtarjama/arabic-ocr-abl-plain3k-px2500k

## Resumen

`ahmedsamirtarjama/arabic-ocr-abl-plain3k-px2500k` es un ajuste fino (fine-tune) del modelo multimodal `Qwen/Qwen3-VL-4B-Instruct`, orientado a OCR en arabe y compresion de estructura de documentos. Lo publica el usuario ahmedsamirtarjama dentro de un proyecto de investigacion denominado `arabic-ocr-research`, con el objetivo de especializar un modelo vision-lenguaje generalista en la transcripcion de texto arabe presente en imagenes.

El modelo parte de los pesos de Qwen3-VL-4B-Instruct (aproximadamente 4,44 mil millones de parametros) y aplica un LoRA de rango 64 que se fusiona en los pesos base, manteniendo congelado el tower de vision. Es decir, no se trata de un modelo entrenado desde cero, sino de una adaptacion sobre una arquitectura transformer vision-lenguaje ya existente, lo que reduce coste de entrenamiento pero hereda las caracteristicas del modelo original.

Su relevancia radica en la escasez de modelos abiertos especializados en OCR arabe con salida estructurada de layout. El modelo esta etiquetado como `image-text-to-text`, `arabic`, `ocr` y `document-layout`, y su pipeline esperado es la conversion de imagenes de documentos a texto y estructura. Se trata de un artefacto de investigacion (etiqueta `research`), sin descargas ni interacciones registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL; base Qwen3-VL-4B-Instruct) |
| Parametros totales | 4.437.815.808 (aprox. 4,44 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (etiqueta declarada); resto de idiomas no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3-VL, un transformer multimodal que procesa entradas de imagen y texto y genera texto (`image-text-to-text`). El ajuste consiste en un LoRA de rango 64 (`LoRA r64`) fusionado en los pesos base, con el tower de vision congelado durante el entrenamiento. Esto implica que las capacidades de representacion visual no se reentrenaron: solo se adaptaron las capas de lenguaje para la tarea de OCR y layout en arabe.

Segun la model card, el experimento se ejecuto en un servidor identificado como `server3-ts`, en la ruta `/mnt/extra/ocr`, con el directorio de modelo `models/abl_plain3k_px2500k_merged`. El nombre del modelo sugiere un dataset de entrenamiento de aproximadamente 3.000 muestras (`plain3k`) y un parametro de resolucion de 2.500.000 pixeles (`px2500k`), si bien el autor no detalla la composicion exacta del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. No se especifica si hubo decodificacion especulativa ni tecnicas de atencion alternativa.

El protocolo de inferencia recomendado por el autor es: motor vLLM, prompt `prompt_layout_all_en`, temperatura 0,1, top_p 1,0 y max_tokens 8192, seguido de un postprocesado de recorte denominado `trim_tail` + `trim_v2`. El autor remite a los ficheros `docs/TEST_PROTOCOL.md` y `REPORT.md` del repositorio de datos `arabic-ocr-research-data/code` para los resultados, que no se incluyen en la informacion disponible.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre texto en arabe contenido en imagenes.
- Compresion de estructura de documentos (`document-layout`): interpretacion de la disposicion de bloques, lineas y regiones de una pagina.
- Generacion de texto a partir de imagenes en modo conversacional (`conversational`).
- Tarea principal `image-text-to-text`: entrada de imagen mas texto, salida de texto.
- Capacidades heredadas del modelo base Qwen3-VL-4B-Instruct (razonamiento visual, descripcion de imagenes, etc.), no verificadas especificamente tras el ajuste.
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`).
- Soporte de prompt especializado `prompt_layout_all_en` para extraccion de layout.
- No hay informacion sobre soporte de tool calling, agentes, audio ni modo de pensamiento (thinking) en este ajuste concreto.

## Casos de uso

- Digitalizacion de documentos arabes: convertir imagenes escaneadas de libros, actas o formularios en texto editable, aprovechando el ajuste especifico sobre OCR arabe.
- Extraccion de estructura de paginas: recuperar la disposicion de bloques (titulos, parrafos, tablas) de un documento arabe para alimentar un sistema de indexacion.
- Construccion de corpus para PLN en arabe: generar texto transcrito y estructurado a partir de archivos PDF o fotos de documentos para entrenar otros modelos.
- Procesamiento por lotes con vLLM: desplegar el modelo en un servidor vLLM y procesar colecciones grandes de imagenes con el prompt `prompt_layout_all_en` y temperatura baja (0,1) para maximizar la consistencia.
- Investigacion academica sobre OCR arabe: usar el modelo como linea base o punto de comparacion en estudios de reconocimiento de texto arabe y analisis de layout.
- Pipelines de accesibilidad: transcribir carteles, menus o documentos en arabe para su lectura por sintesis de voz.
- Preprocesado documental en administraciones o archivos: extraer texto de expedientes en arabe antes de pasarlos a un motor de busqueda o a un sistema de gestion documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `docs/TEST_PROTOCOL.md` y `REPORT.md` del repositorio `arabic-ocr-research-data/code`, pero no se incluyen cifras (CER, WER, mAP de layout ni comparaciones) en los datos proporcionados, por lo que no se presentan numeros.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): en torno a 9-10 GB solo para pesos, mas memoria para cache KV y procesamiento de imagenes. Estimacion basada en los 4,44 B de parametros; valor no publicado por el autor.
- Cuantizacion a 8 bits: aproximadamente 5 GB de pesos, mas overhead. No confirmada su disponibilidad para este modelo.
- Cuantizacion a 4 bits: aproximadamente 3-4 GB de pesos, mas overhead. No confirmada su disponibilidad para este modelo.
- GPU de centro de datos: A100, H100, L40S o similares, recomendadas para procesamiento por lotes y contexto largo.
- GPU de consumo: cabe previsiblemente en tarjetas con 12-24 GB de VRAM (RTX 3090, RTX 4090, RTX 4080), especialmente con cuantizacion.
- Opciones de despliegue: el autor recomienda vLLM. Tambien podria usarse con TGI o llama.cpp/Ollama si se generan pesos GGUF, algo no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arabic-ocr-abl-plain3k-px2500k | 4,44 B | no disponible | OCR y layout en arabe | no disponible | HuggingFace (0 descargas) |
| Qwen/Qwen3-VL-4B-Instruct (base) | aprox. 4 B | no disponible | Vision-lenguaje generalista | no disponible en esta ficha | HuggingFace |
| Otros modelos OCR arabe | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento que permitan una comparacion cuantitativa con alternativas. La unica referencia solida es el modelo base del que deriva, sobre el que este ajuste anade especializacion en OCR y layout en arabe a cambio de una adaptacion LoRA fusionada.

## Limitaciones y advertencias

- Se trata de un artefacto de investigacion (etiqueta `research`), sin garantias de robustez en produccion.
- No se declara la licencia, por lo que no se puede confirmar si se permite el uso comercial. La licencia del modelo base Qwen3-VL-4B-Instruct tampoco se detalla en esta ficha.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluacion de fidelidad de transcripcion.
- El ajuste esta orientado especificamente al arabe; el comportamiento en otros idiomas no esta documentado.
- El tower de vision permanece congelado, lo que puede limitar la adaptacion a dominios visuales muy distintos de los usados en entrenamiento.
- El dataset de entrenamiento parece pequeno (del orden de 3.000 muestras, segun el nombre), lo que puede provocar sobreajuste al estilo de documento empleado.
- No se especifica la longitud de contexto soportada ni el comportamiento con documentos largos.
- El postprocesado requerido (`trim_tail` + `trim_v2`) implica que la salida cruda necesita limpieza, un paso adicional a considerar en produccion.
- Sin descargas ni likes registrados, no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedsamirtarjama/arabic-ocr-abl-plain3k-px2500k
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio de datos y codigo citado por el autor: `arabic-ocr-research-data` (dataset en HuggingFace; ruta de codigo `code/scripts/`), enlace no disponible en la informacion proporcionada.
- Documentacion citada por el autor: `docs/TEST_PROTOCOL.md` y `REPORT.md`, no enlazados en la informacion disponible.

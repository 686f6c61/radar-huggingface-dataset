# ahmedsamirtarjama/arabic-ocr-abl-plain6k-lr3e5

## Resumen

arabic-ocr-abl-plain6k-lr3e5 es un ajuste fino experimental del modelo multimodal Qwen/Qwen3-VL-4B-Instruct orientado a OCR y analisis de maquetacion (document layout) sobre documentos en arabe. Lo publica el usuario ahmedsamirtarjama como parte de un proyecto de investigacion alojado en un servidor interno (directorio `models/abl_plain6k_lr3e5_merged`), y se distribuye unicamente como pesos safetensors para la libreria transformers.

Tecnicamente se trata de un LoRA de rango 64 fusionado en los pesos del modelo base, con la torre de vision congelada durante el entrenamiento. El repositorio ocupa 8,9 GB y contiene 4.437.815.808 parametros reales segun los safetensors. La nomenclatura del identificador (`abl` de ablation, `plain6k`, `lr3e5`) sugiere un experimento de ablacion sobre unos 6.000 ejemplos con una tasa de aprendizaje de 3e-5, aunque la composicion del dataset no se detalla en la model card.

Su relevancia es acotada y de caracter investigador: cero descargas y cero likes en el momento de la ficha, licencia no declarada y sin resultados de benchmarks publicados en la informacion disponible. Resulta interesante sobre todo como receta reproducible de ajuste de un VLM de ~4B para OCR arabe con layout, y por el pipeline de inferencia documentado (vLLM con `prompt_layout_all_en`, temperatura 0.1, top_p 1.0, max_tokens 8192 y post-procesado `trim_tail` + `trim_v2`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen3-VL-4B-Instruct; torre de vision congelada y adaptadores LoRA r64 fusionados en los pesos base |
| Parametros totales | 4.437.815.808 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso; no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precision completa; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | arabe (objetivo declarado del ajuste); el resto de idiomas no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers, tag `qwen3_vl`) |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 8,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-13 (actualizado el mismo dia) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, un VLM de tipo transformer con torre de vision y modulo de proyeccion hacia el espacio de tokens del modelo de lenguaje. El ajuste se realizo con LoRA de rango 64 (`r64`) que posteriormente se fusiono en los pesos base (`merged`), de modo que la inferencia no requiere cargar adaptadores por separado. La torre de vision se mantuvo congelada, por lo que la adaptacion al dominio arabe/OCR recae sobre las capas del modelo de lenguaje y la proyeccion multimodal, no sobre el extractor visual.

No se especifican en la model card el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o preferencias. El identificador del experimento (`plain6k`, `lr3e5`) apunta a unos 6.000 ejemplos y una tasa de aprendizaje de 3e-5, pero es una inferencia a partir del nombre, no un dato confirmado. La model card remite a `docs/TEST_PROTOCOL.md` y `REPORT.md` dentro del repositorio de datos `arabic-ocr-research-data/code`, y documenta el protocolo de inferencia: vLLM, prompt `prompt_layout_all_en`, temperatura 0.1, top_p 1.0, max_tokens 8192 y limpieza posterior con las funciones `trim_tail` y `trim_v2`.

## Capacidades

- OCR de texto arabe en imagenes de documentos, con salida de texto estructurado.
- Analisis de maquetacion (document layout): el tag `document-layout` y el prompt `prompt_layout_all_en` indican que el modelo esta ajustado para reconstruir la estructura del documento, no solo transcribir lineas.
- Modalidad image-text-to-text: acepta imagenes como entrada junto con instrucciones textuales.
- Uso conversacional: el repositorio incluye el tag `conversational`, por lo que soporta dialogos multi-turno con imagenes.
- Compatible con endpoints gestionados: incluye el tag `endpoints_compatible`, orientado a despliegue como endpoint de inferencia.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingue: solo el arabe esta declarado como objetivo; no hay informacion sobre otras lenguas.
- Modo thinking, audio o vision adicional: no disponible (solo vision como entrada, segun el pipeline declarado).

## Casos de uso

- Digitalizacion de archivos administrativos arabes: el modelo puede transcribir documentos escaneados y devolver la estructura de secciones y tablas, lo que permite indexar el contenido en un buscador en lugar de almacenar imagenes sin texto.
- Extraccion de datos de facturas y albaranes en arabe: alimentando la imagen de la factura y una instruccion de layout, se obtienen campos estructurados (emisor, fecha, importes) que despues se validan contra un ERP.
- Procesamiento de prensa historica en arabe: digitalizacion de hemerotecas con maquetacion compleja en columnas, donde el ajuste especifico en layout ayuda a preservar el orden de lectura de derecha a izquierda.
- Construccion de corpus para entrenamiento de modelos: generacion de pares imagen-texto a escala para alimentar modelos de OCR posteriores o sistemas RAG sobre documentacion arabe.
- Atencion al ciudadano en administraciones arabofonas: transcripcion de formularios y documentos adjuntos en un flujo conversacional, usando el modo conversacional del modelo para pedir aclaraciones cuando la imagen no es legible.
- Investigacion academica en OCR arabe: sirve como punto de comparacion reproducible (mismo base, mismo protocolo de inferencia documentado) para estudiar el efecto del rango LoRA, el volumen de datos o la congelacion de la torre de vision.
- Preprocesado en pipelines de traduccion: transcribir primero el documento arabe y pasar el texto a un modelo de traduccion evita que el traductor tenga que tratar directamente con imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `docs/TEST_PROTOCOL.md` y `REPORT.md` del repositorio `arabic-ocr-research-data/code`, pero ningun valor numerico (CER, WER, mAP de layout, MMLU, HumanEval u otros) aparece recogido en los datos proporcionados, por lo que no se reproduce ninguna tabla comparativa.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 9 GB solo para los pesos (4,44B parametros), mas activaciones y cache KV. En la practica, una estimacion razonable es 11-14 GB con imagenes de resolucion moderada; no confirmada por el autor.
- Cuantizacion: no se publican pesos cuantizados. Una conversion propia a 8 bits dejaria los pesos en torno a 4,5 GB y a 4 bits en torno a 2,5-3 GB (estimaciones derivadas del numero de parametros).
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) y RTX 4060 Ti (16 GB) en BF16. En tarjetas de 12 GB como la RTX 3060 12 GB es ajustado en precision completa y requeriria cuantizacion propia.
- GPU de servidor: A100 40/80 GB, H100, L40S o similares, con margen amplio para lotes grandes y documentos de alta resolucion.
- Opciones de despliegue: vLLM (es el motor usado por el autor en el protocolo documentado), transformers, TGI. Ollama y llama.cpp solo serian viables tras una conversion propia a GGUF, ya que el repositorio no incluye ese formato.
- Latencia y throughput: no disponible. El limite de 8192 tokens de salida configurado por el autor implica generaciones largas en documentos densos, con el coste asociado en tiempo de respuesta.
- Consideracion adicional: el numero de tokens visuales depende de la resolucion de entrada, por lo que el consumo de memoria y la latencia crecen con la calidad y el tamano de las imagenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| arabic-ocr-abl-plain6k-lr3e5 | 4,44B | no disponible | no disponible | safetensors | HuggingFace; 0 descargas, sin cuantizaciones |
| Qwen/Qwen3-VL-4B-Instruct (modelo base) | no disponible en la informacion proporcionada (familia 4B) | no disponible | no disponible | safetensors | HuggingFace |
| Otras alternativas de OCR/VLM de rango similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables sobre modelos alternativos de OCR arabe con los que comparar parametros, contexto, licencia o rendimiento dentro de la informacion proporcionada. Tampoco existen resultados de benchmarks del modelo que permitan situarlo frente a alternativas de la misma categoria, por lo que cualquier comparacion de calidad seria especulativa.

## Limitaciones y advertencias

- Proyecto de investigacion: la propia model card lo etiqueta como `experiment`, sin garantias de robustez ni de mantenimiento.
- Licencia no declarada: no se puede asumir uso comercial permitido. Al derivar del modelo base, habria que verificar la licencia de Qwen/Qwen3-VL-4B-Instruct antes de cualquier despliegue en produccion.
- Ausencia de benchmarks: sin valores de CER/WER ni de layout, no hay forma de estimar la calidad real frente a otros sistemas de OCR arabe.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la ficha implican que el modelo no ha sido probado por terceros.
- Riesgo de alucinacion en OCR: los VLM pueden generar texto plausible que no aparece en la imagen, especialmente en documentos degradados, con caligrafia manuscrita o con diacriticos; se requiere verificacion humana o reglas de validacion.
- Torre de vision congelada: la adaptacion visual es nula, por lo que dominios muy distintos del conjunto de 6.000 ejemplos pueden degradar el rendimiento.
- Dependencia de post-procesado: el protocolo del autor incluye `trim_tail` y `trim_v2`; sin esas funciones la salida puede contener cola redundante o malformada.
- Sesgo de dominio y de idioma: ajustado sobre un dataset no documentado, probablemente homogeneo, y sin informacion sobre otros idiomas o sobre variedades del arabe (MSA frente a dialectos).
- Produccion: no hay pesos cuantizados, ni informacion de latencia, ni versionado; usar el modelo en un servicio real exige construir el pipeline de despliegue y el post-procesado por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedsamirtarjama/arabic-ocr-abl-plain6k-lr3e5
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio de datos y codigo citado en la model card: `arabic-ocr-research-data` (referencia textual; no se proporciona URL en la informacion disponible)
- Documentos citados sin URL disponible: `docs/TEST_PROTOCOL.md` y `REPORT.md` dentro de `arabic-ocr-research-data/code`
- Busqueda web: los resultados devueltos corresponden a planes de bandas de radioaficionado (HF) y no guardan relacion con el modelo; no se han encontrado papers, blogs, repos ni demos relevantes.

# baidu/Unlimited-OCR-2

## Resumen

Unlimited OCR 2 (identificador `baidu/Unlimited-OCR-2`) es un modelo vision-language de Baidu especializado en extracción de texto y parseo de documentos, publicado en HuggingFace el 26 de octubre de 2026 bajo licencia MIT. El modelo recibe imágenes de páginas y devuelve su contenido estructurado en texto, con la particularidad de que puede procesar todas las páginas de un documento en una sola petición, de modo que aprovecha el contexto cruzado entre páginas en lugar de tratar cada una de forma aislada. Con 3.343.978.497 parámetros (aproximadamente 3,34 mil millones) en pesos safetensors, se sitúa en un rango de tamaño que permite servirlo en una sola GPU.

La innovación central de esta segunda versión es SR-SWA (Sparse Reference Sliding Window Attention), un mecanismo de atención que comprime las interacciones texto-visual de secuencias ultra largas hasta un conjunto fijo de referencias de trabajo (por ejemplo, 512 tokens). Según el autor, esto acota la complejidad computacional y mantiene prácticamente constante la latencia por paso de decodificación y el consumo de memoria independientemente de la longitud del documento, eliminando el escalado cuadrático de la atención al crecer el número de páginas.

El resultado que reclama Baidu es el parseo de horizonte ilimitado dentro de una ventana de contexto finita, con resultados que declara estado del arte tanto en benchmarks de decenas de páginas (MPDocBench) como en benchmarks extremos de cientos de páginas (MarathonDocBench). Es relevante ahora porque ataca el cuello de botella clásico de los pipelines OCR sobre documentos masivos: la memoria y la latencia que se disparan al acumular páginas en el contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer para image-text-to-text, con atención SR-SWA (Sparse Reference Sliding Window Attention); el resto del detalle arquitectónico no está disponible en la información proporcionada |
| Parametros totales | 3.343.978.497 (≈3,34 mil millones), según safetensors |
| Parametros activos | No aplica: no se describe como modelo MoE en la información disponible |
| Longitud de contexto | No disponible (no se publica cifra); el autor describe una "ventana de contexto finita" con referencias de trabajo de tamaño fijo, por ejemplo 512 tokens |
| Tipos de cuantizacion | No disponible; la model card solo documenta carga en `bfloat16` mediante Transformers |
| Idiomas soportados | Multilingüe (etiqueta `multilingual`); no se detalla la lista concreta de idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`); tamaño del repositorio 7,1 GB |

## Arquitectura y entrenamiento

La información disponible describe un modelo de tipo vision-language orientado a image-text-to-text, con un codificador de imagen que en inferencia de una sola página usa *dynamic tiling* (denominado "modo gundam") y, en inferencia multipágina, codifica cada página como una vista global única (modo base). El prompt se construye automáticamente concatenando un token de página más la imagen por cada página, seguido de la instrucción de parseo multipágina. El bloque diferenciador es SR-SWA, que sustituye la atención completa sobre la secuencia texto-visual por un conjunto acotado de referencias de trabajo, de forma que el coste por paso deja de crecer con el número de páginas.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención linear. El modelo declara soporte de entrenamiento mediante ms-swift y de inferencia mediante Transformers, SGLang (con una rueda personalizada) y vLLM. La versión 1.0 del mismo proyecto se presentó el 22 de junio de 2026 y el artículo técnico está referenciado como arXiv:2606.23050.

## Capacidades

- Parseo OCR de documentos: extracción de texto a partir de imágenes de páginas, con salida ordenada por página mediante marcadores `<PAGE>`.
- Parseo multipágina en una sola petición (`infer_multi`): todas las páginas se procesan juntas, habilitando contexto cruzado entre páginas.
- Parseo de horizonte ilimitado: gracias a SR-SWA, el autor afirma que la latencia y la memoria se mantienen casi constantes aunque el documento crezca hasta cientos de páginas.
- Procesamiento multimodal imagen-texto: la entrada es una o varias imágenes (páginas), la salida es texto.
- Capacidad multilingüe según la etiqueta del modelo; no se detalla la cobertura por idioma.
- Inferencia single-page con dynamic tiling para páginas individuales de alta resolución.
- Integración con ecosistema: Transformers, SGLang, vLLM, ModelScope, Baidu Cloud y entrenamiento con ms-swift.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking o razonamiento explícito: no disponible en la información proporcionada.
- Soporte de audio o vídeo: no disponible; el modelo está descrito únicamente para imagen y texto.

## Casos de uso

- Digitalización de expedientes administrativos y archivos históricos: el modelo puede recibir un lote de páginas en una sola llamada (`infer_multi`) y devolver el texto en el mismo orden que las imágenes de entrada, lo que simplifica la reconstrucción del documento y evita la lógica de empalme página a página.
- Procesamiento de informes anuales y memorias corporativas de cientos de páginas: el mecanismo SR-SWA está diseñado precisamente para que la latencia y la memoria no crezcan con la longitud, lo que hace viable atacar documentos que en un pipeline OCR convencional exigirían troceado manual.
- Facturación y contabilidad automatizadas: extracción del texto de facturas y albarranes escaneados para alimentar sistemas de contabilidad; el tamaño de 3,34 mil millones de parámetros permite desplegarlo en una GPU dedicada pequeña y mantener coste por documento bajo.
- Construcción de bases de conocimiento y RAG sobre PDFs largos: el texto parseado por página se puede trocear y vectorizar; el contexto cruzado entre páginas mejora la coherencia de tablas y secciones que continúan de una página a la siguiente.
- Auditoría documental y cumplimiento normativo: revisión de contratos y pólizas multipágina donde el significado de una cláusula depende de páginas anteriores, aprovechando que el modelo ve el documento completo en una única petición.
- Accesibilidad: conversión de documentos escaneados a texto legible por lectores de pantalla y motores de síntesis de voz, incluyendo materiales multilingües.
- Digitalización de literatura científica y patentes: parseo de PDFs con columnas, figuras y tablas, con salida por página que preserva la estructura del original.
- Servicio de OCR como API interna: despliegue con SGLang o vLLM para servir peticiones concurrentes con una rueda de SGLang ya adaptada al modelo, o uso de la versión alojada en Baidu Cloud si se prefiere no gestionar infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara, sin cifras, resultados de estado del arte en los siguientes conjuntos:

| Benchmark | Tipo de documento | Resultado publicado |
|---|---|---|
| MPDocBench | Documentos de decenas de páginas | Estado del arte según el autor; cifras no disponibles |
| MarathonDocBench | Documentos extremos de cientos de páginas | Estado del arte según el autor; cifras no disponibles |

No hay datos de MMLU, HumanEval, GSM8K ni de métricas OCR cuantitativas (por ejemplo, edit distance o precisión por carácter) en la información proporcionada.

## Requisitos de hardware

- Pesos en `bfloat16`: aproximadamente 6,7 GB para los 3,34 mil millones de parámetros; el repositorio completo ocupa 7,1 GB.
- VRAM estimada para inferencia en bf16/fp16: entre 10 y 16 GB en el caso práctico, sumando activaciones y tokens visuales de una o varias páginas (estimación propia a partir del número de parámetros, no publicada por el autor).
- Entorno de referencia probado por el autor: NVIDIA A800 de 80 GB con Python 3.10, `torch==2.13.0`, `transformers==4.52.1`, `huggingface-hub==0.36.0` y `tokenizers==0.21.4`.
- GPU recomendadas: A800/A100 80 GB o H100 para servir documentos muy largos con concurrencia; A100 40 GB y L40S 48 GB como opciones intermedias.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) para inferencia en bf16 de una página o de documentos moderados; en RTX 4080 de 16 GB el margen es ajustado y dependerá de la resolución de página y del número de páginas por petición.
- Cuantización: no hay GGUF ni cuantizaciones publicadas por el autor; a 8 bits los pesos bajarían a unos 3,4 GB y a 4 bits a unos 1,7 GB (cálculo teórico, sin soporte documentado).
- Despliegue: Transformers para pruebas rápidas; SGLang como opción recomendada para servir, con la rueda `sglang-0.5.20.dev10+g8d62f5fb9c-py3-none-any.whl` y variables de entorno como `SGLANG_UOCR_EANABLE_DOC_LIMIT` para la planificación por ventanas de página; también hay soporte de vLLM según la nota de versión del 28 de junio de 2026.
- Throughput y latencia: no se publican valores numéricos. La única afirmación disponible es cualitativa: SR-SWA mantiene la latencia por paso y la memoria "casi constantes" con independencia de la longitud del documento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Unlimited-OCR 2 (este modelo) | 3.343.978.497 | No disponible (ventana finita con referencias de 512 tokens) | MIT | HuggingFace, ModelScope, Baidu Cloud, demo en HF Spaces | SR-SWA, parseo multipágina en una sola petición |
| Unlimited-OCR 1.0 | No disponible | No disponible | No disponible | Repositorio GitHub del proyecto (rama `UnlimitedOCR1.0`) | Versión previa de la misma familia, enfocada a parseo de horizonte largo |
| DeepSeek-OCR | No disponible | No disponible | No disponible | Repositorio GitHub de DeepSeek | Citado por Baidu como punto de partida que Unlimited-OCR pretende superar |

No se dispone de datos de parámetros, contexto ni benchmarks de los modelos comparados en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- No se han publicado cifras de benchmarks ni comparaciones numéricas con modelos alternativos; las afirmaciones de estado del arte proceden únicamente del autor.
- Riesgo de alucinación inherente a los modelos generativos: el modelo puede producir texto plausible que no aparezca en la imagen, especialmente en documentos degradados, manuscritos o tablas complejas. En producción conviene validar con heurísticas o con un segundo modelo.
- La longitud de contexto no está documentada numéricamente; el comportamiento en documentos de más de cientos de páginas solo está respaldado por la descripción cualitativa de SR-SWA.
- Cobertura lingüística no detallada: la etiqueta indica multilingüe, pero no se especifica qué idiomas están soportados ni con qué calidad.
- Sesgos: no se dispone de información sobre sesgos evaluados ni sobre la composición del corpus de entrenamiento.
- Requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar código del repositorio; conviene revisar y fijar una revisión concreta antes de desplegar en producción.
- El soporte de SGLang depende de una rueda personalizada (`sglang-0.5.20.dev10`), lo que puede complicar las actualizaciones y la reproducibilidad del entorno.
- No hay cuantizaciones oficiales (GGUF, AWQ, GPTQ) ni soporte documentado de llama.cpp u Ollama.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las licencias de los componentes de terceros incluidos en el repositorio.
- El modelo tiene 0 descargas y 68 likes en el momento de la consulta, y se publicó un día antes de la última actualización: el ecosistema de herramientas alrededor de esta versión es todavía muy reciente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baidu/Unlimited-OCR-2
- Repositorio en GitHub: https://github.com/baidu/Unlimited-OCR
- Artículo en arXiv: https://arxiv.org/abs/2606.23050
- PDF del artículo en el repositorio: https://huggingface.co/baidu/Unlimited-OCR-2/blob/main/Unlimited-OCR-2.pdf
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/baidu/Unlimited-OCR
- Modelo en ModelScope: https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR
- Documentación en Baidu Cloud: https://cloud.baidu.com/doc/OCR/s/fmr1p39gb
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Repositorio de ms-swift: https://github.com/modelscope/ms-swift
- Repositorio de ModelScope: https://github.com/modelscope
- DeepSeek-OCR (referencia del proyecto): https://github.com/deepseek-ai/DeepSeek-OCR
- Cuenta de X de Baidu: https://x.com/Baidu_Inc

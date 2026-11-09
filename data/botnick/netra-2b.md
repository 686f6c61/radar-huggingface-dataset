# botnick/Netra-2B

## Resumen

Netra-2B es un modelo multimodal de tipo image-text-to-text desarrollado por el usuario botnick, obtenido mediante fine-tuning del modelo typhoon-ai/typhoon-ocr1.5-2b, que a su vez se apoya en la arquitectura Qwen3-VL. Con 2.127.532.032 parámetros (aproximadamente 2,1 mil millones), está especializado en OCR, comprensión de documentos y extracción de información clave (KIE), con un enfoque particular en documentos contables y financieros en tailandés e inglés.

El modelo resuelve el problema de la digitalización estructurada de documentos empresariales en contextos donde el tailandés es el idioma principal: recibos, facturas, tablas financieras y manuscritos. Para ello se ha entrenado sobre un conjunto de datasets públicos y sintéticos que incluyen Thai-Synth-Receipts, thai_handwriting_dataset, thai_doc_parsing, CORD-v2, FATURA2-invoices, FinTabNet.c, PubTabNet, DocAtlas y WildReceipt, lo que cubre tanto documentos limpios como escaneados y fotografías en condiciones reales.

Es relevante ahora porque combina un tamaño reducido (apto para despliegue en hardware modesto) con una especialización vertical poco frecuente en el ecosistema open source: OCR contable tailandés con salida conversacional. Su licencia Apache 2.0 facilita la integración comercial, aunque el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (image-text-to-text) |
| Parametros totales | 2.127.532.032 (2,1 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Netra-2B hereda la arquitectura Qwen3-VL del modelo base typhoon-ocr1.5-2b: un transformer multimodal con un codificador visual y un decodificador de lenguaje que procesa imágenes y texto de forma conjunta para generar respuestas en formato conversacional. El pipeline declarado es image-text-to-text, y los tags confirman soporte para OCR, document-understanding, KIE y uso conversacional. El tamaño del repositorio (12,8 GB) es coherente con pesos en precisión completa o bfloat16 más los artefactos del tokenizador y del procesador de imagen.

El fine-tuning se ha realizado sobre una mezcla de datasets de documentos tailandeses (Thai-Synth-Receipts, thai_handwriting_dataset, thai_doc_parsing) y datasets internacionales de referencia en comprensión de documentos (CORD-v2 para recibos, FATURA2-invoices para facturas, FinTabNet.c y PubTabNet para tablas financieras, DocAtlas y WildReceipt para documentos en escena). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. Los identificadores arXiv asociados en la model card (2601.14722, 2311.11856, 2303.00716, 1911.10683, 2605.12623, 2103.14470, 2511.04479) apuntan a la literatura de referencia sobre OCR y parsing de documentos, pero no se detalla en la información proporcionada qué innovaciones técnicas concretas introduce el modelo más allá de la herencia de Qwen3-VL.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos, con soporte específico para texto tailandés e inglés.
- Comprensión de documentos (document understanding): interpretación de la estructura de recibos, facturas y formularios.
- Extracción de información clave (KIE): identificación de campos como importes, fechas, emisores y líneas de detalle en documentos contables.
- Parsing de tablas financieras, incluyendo tablas complejas de los dominios FinTabNet y PubTabNet.
- Procesamiento de manuscritos tailandeses, gracias al entrenamiento sobre thai_handwriting_dataset.
- Interfaz conversacional: el modelo genera respuestas en formato de diálogo, lo que permite formular preguntas sobre el contenido del documento.
- Entrada multimodal image-text-to-text: acepta imágenes junto con instrucciones textuales.
- Soporte multilingüe limitado a tailandés e inglés.
- No se ha documentado soporte explícito de tool calling, function calling ni razonamiento multi-paso con agentes en la información disponible.

## Casos de uso

- Digitalización de recibos y facturas en empresas tailandesas: el modelo recibe la fotografía o el escaneo del documento y devuelve los campos estructurados (importe, IVA, fecha, proveedor) en formato conversacional, lo que simplifica la integración con sistemas de contabilidad.
- Automatización de la contabilidad de pymes: extracción por lotes de líneas de detalle de facturas para alimentar ERP o hojas de cálculo, aprovechando el entrenamiento sobre FATURA2-invoices y CORD-v2.
- Procesamiento de manuscritos en formularios: digitalización de documentos rellenados a mano en tailandés, un caso habitualmente problemático para modelos OCR genéricos.
- Extracción de tablas financieras de informes anuales: uso del modelo para convertir tablas de balances y cuentas de resultados en datos estructurados, apoyándose en el entrenamiento con FinTabNet.c y PubTabNet.
- Verificación documental en procesos de compliance: consulta conversacional sobre documentos escaneados para localizar cláusulas, importes o fechas concretas sin necesidad de OCR previo separado.
- Digitalización de archivos históricos o administrativos tailandeses: tratamiento de documentos heterogéneos en escena (WildReceipt, DocAtlas) donde la calidad de captura es variable.
- Asistente de atención al cliente para consultas sobre facturas: el usuario sube una imagen de su recibo y el modelo responde preguntas sobre cargos y fechas en tailandés o inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,3 GB solo para los pesos (2,1 B parámetros × 2 bytes), más el overhead del codificador visual y de las activaciones, lo que sitúa el consumo realista en torno a 6-8 GB según la resolución de imagen y la longitud de la secuencia.
- VRAM estimada en cuantización de 8 bits: en torno a 2,5-3 GB para los pesos, con overhead adicional.
- VRAM estimada en cuantización de 4 bits: en torno a 1,5-2 GB para los pesos; no se han publicado versiones GGUF oficiales, por lo que la cuantización requeriría convertirla a partir de los safetensors.
- GPU recomendadas: NVIDIA RTX 4090, RTX 3090, A100 o H100 para despliegues de producción con concurrencia; GPUs consumer de gama media (RTX 3060 12 GB, RTX 4060 Ti 16 GB) son suficientes para inferencia individual.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 8 GB de VRAM en bfloat16 y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI si se confirma compatibilidad con Qwen3-VL, llama.cpp/Ollama únicamente tras conversión a GGUF. El tag endpoints_compatible sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| Netra-2B | 2,1 B | no disponible | th, en | Apache 2.0 | OCR y KIE contable tailandés |
| typhoon-ai/typhoon-ocr1.5-2b (base) | 2 B (aprox.) | no disponible | th, en | no disponible en la información | OCR tailandés general |
| Qwen3-VL (familia) | variable | no disponible | multilingüe | no disponible en la información | Visión-lenguaje general |
| Modelos OCR genéricos tipo Donut | variable | no disponible | multilingüe | variable | OCR de documentos sin especialización tailandesa |

La comparación cuantitativa de rendimiento no está disponible. La principal ventaja diferencial de Netra-2B frente a su modelo base es el fine-tuning específico sobre datasets contables y de manuscritos tailandeses, mientras que frente a modelos OCR genéricos aporta especialización lingüística y de dominio.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que puede complicar la automatización de pipelines.
- Idiomas limitados a tailandés e inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación en campos numéricos: en tareas de KIE contable, cualquier error en importes o fechas tiene consecuencias directas, por lo que se recomienda validación posterior y reglas de negocio.
- Sesgos de dominio: el entrenamiento se centra en recibos, facturas y tablas financieras; documentos de otras áreas (médicos, legales, técnicos) pueden degradar la precisión.
- Sin datos publicados de benchmarks, contexto máximo ni evaluación de sesgos; no es posible estimar su calidad relativa frente a alternativas sin una evaluación propia.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse que los datasets de entrenamiento (algunos con licencias propias, como CORD-v2 o FinTabNet) no impongan restricciones adicionales sobre los pesos derivados.
- El modelo base typhoon-ocr1.5-2b puede arrastrar limitaciones de contexto y de resolución de imagen no documentadas en esta ficha.
- Con solo 40 descargas y 0 likes en el momento de la consulta, la comunidad de validación es prácticamente inexistente; conviene tratarlo como modelo en fase temprana.

## Enlaces

- Hugging Face: https://huggingface.co/botnick/Netra-2B
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr1.5-2b
- Dataset Thai-Synth-Receipts: https://huggingface.co/datasets/DuckerMaster/Thai-Synth-Receipts
- Dataset thai_handwriting_dataset: https://huggingface.co/datasets/iapp/thai_handwriting_dataset
- Dataset thai_doc_parsing: https://huggingface.co/datasets/SmartWhatt/thai_doc_parsing
- Dataset CORD-v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- Dataset FATURA2-invoices: https://huggingface.co/datasets/mathieu1256/FATURA2-invoices
- Dataset FinTabNet.c: https://huggingface.co/datasets/bsmock/FinTabNet.c
- Dataset PubTabNet: https://huggingface.co/datasets/apoidea/pubtabnet-html
- Dataset DocAtlas: https://huggingface.co/datasets/ahmedheakl/docatlas_instruct
- Dataset WildReceipt: https://huggingface.co/datasets/Theivaprakasham/wildreceipt
- arXiv 2601.14722: https://arxiv.org/abs/2601.14722
- arXiv 2311.11856: https://arxiv.org/abs/2311.11856
- arXiv 2303.00716: https://arxiv.org/abs/2303.00716
- arXiv 1911.10683: https://arxiv.org/abs/1911.10683
- arXiv 2605.12623: https://arxiv.org/abs/2605.12623
- arXiv 2103.14470: https://arxiv.org/abs/2103.14470
- arXiv 2511.04479: https://arxiv.org/abs/2511.04479

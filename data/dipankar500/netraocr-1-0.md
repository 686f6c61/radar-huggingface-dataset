# dipankar500/NetraOCR-1.0

## Resumen

NetraOCR-1.0 es un modelo multimodal de reconocimiento óptico de caracteres (OCR) desarrollado por el usuario dipankar500 y publicado en Hugging Face bajo licencia Apache 2.0. Con 1.273.967.936 parámetros, se presenta como un checkpoint unificado que fusiona dos sistemas OCR previos —IndicOCR (`bodhan-ai/indic-ocr`) y OvisOCR3 (`ATH-MaaS/OvisOCR3`)— en un único modelo mediante las técnicas Branch-Train-MiX (BTX) y Dual Interleaved Vision Token Fusion (Leo).

El modelo se construye sobre la arquitectura híbrida Qwen3.5-0.8B, combinando capas de atención lineal GatedDeltaNet con capas de atención completa, y añade un decoder de 24 capas con mezcla de expertos (MoE) de enrutamiento suave. Su propósito es cubrir de forma conjunta OCR de scripts índicos, documentos médicos, escritura manuscrita, tablas y fórmulas LaTeX, evitando tener que desplegar dos sistemas separados.

La relevancia actual del modelo radica en su enfoque de fusión sin pérdida de vocabulario (303.101 tokens) y en el congelado de ambos codificadores visuales, lo que preserva las capacidades originales de cada sistema mientras se entrena únicamente la capa de proyección y el router. El repositorio ocupa 2,6 GB y el modelo se distribuye en formato safetensors para la librería transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido GatedDeltaNet + atención completa (Qwen3.5-0.8B) con decoder de 24 capas y MoE de enrutamiento suave en las FFN |
| Parametros totales | 1.273.967.936 |
| Parametros activos | No disponible (MoE de 2 expertos por capa con router lineal; no se especifica el número de parámetros activos por token) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; la model card usa bfloat16) |
| Idiomas soportados | No disponible (se infiere soporte de scripts índicos por el vocabulario Sarvam, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura híbrida de Qwen3.5-0.8B, con 24 capas de decoder compuestas por 18 capas de atención lineal GatedDeltaNet y 6 capas de atención completa, más RMSNorm. Sobre esta base se aplica Branch-Train-MiX (BTX, arXiv:2403.07816): cada capa FFN se sustituye por un módulo `NetraMoEFFN` con dos expertos —Expert 0 correspondiente a la FFN de IndicOCR y Expert 1 a la FFN de OvisOCR3, ambos congelados— ponderados por un router lineal aprendido a nivel de token (`router.weight` de dimensión 2×1024). Los mezcladores de tokens y las normalizaciones se inicializan por promediado aritmético exacto de pesos (`M0_avg`) y se entrenan de extremo a extremo en la etapa M2.

La fusión visual sigue el esquema Dual Interleaved Vision Token Fusion (Leo, arXiv:2501.06986): se conservan dos codificadores visuales congelados (`model.visual` de OvisOCR3 y `model.visual_indic` de IndicOCR) y, para cada celda espacial de 32×32, los tokens se intercalan como `[indic(h,w), ovis(h,w)]` con coordenadas temporales M-RoPE 3D (t=0 para Indic, t=1 para Ovis). Ambos backbones ViT permanecen 100% congelados (deriva máxima absoluta de 0.0), mientras que los mergers MLP de 2 capas se entrenan para proyectar a un espacio latente compartido. El vocabulario unificado de 303.101 tokens (padded a 303.104) preserva los 248.070 tokens de OvisOCR3/Qwen3.5 en sus IDs originales y añade 55.031 tokens de script índico del tokenizador de Sarvam, inicializados mediante alineamiento ortogonal de Procrustes (s=1.1483, similitud coseno mediana de 0.830 sobre 85.892 tokens compartidos). No se especifican el volumen de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Reconocimiento de texto en imágenes (OCR) con salida de texto plano.
- OCR de scripts índicos, gracias a los 55.031 tokens específicos del tokenizador de Sarvam.
- OCR de documentos médicos.
- Reconocimiento de escritura manuscrita, incluido un modo de dos pasadas con segmentación de regiones (`split_page_regions`) para ledgers manuscritos densos de alta resolución.
- Reconocimiento de tablas.
- OCR de fórmulas LaTeX.
- Procesamiento de imagen y texto de forma conversacional (pipeline `image-text-to-text`).
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explícito.

## Casos de uso

- Digitalización de documentos médicos: el modelo puede extraer texto de informes, recetas y registros clínicos escaneados, aprovechando su entrenamiento específico en OCR médico para preservar terminología especializada.
- Procesamiento de manuscritos y ledgers: mediante el modo de dos pasadas con `split_page_regions`, se pueden segmentar páginas de alta resolución con múltiples líneas manuscritas en bandas horizontales antes de aplicar `area_clamp`, lo que facilita la transcripción de libros contables o registros históricos.
- Extracción de tablas en pipelines de datos: el modelo reconoce estructuras tabulares en imágenes, lo que permite convertir facturas, balances o formularios escaneados en datos estructurados para su carga en bases de datos.
- Conversión de fórmulas matemáticas a LaTeX: investigadores y editores pueden digitalizar artículos o apuntes con ecuaciones y obtener el código LaTeX correspondiente para su reutilización.
- OCR multilingüe para lenguas índicas: organizaciones que gestionan documentación en idiomas del subcontinente indio pueden usar el vocabulario extendido del modelo para transcribir textos en escrituras índicas sin necesidad de un segundo sistema.
- Automatización de archivo documental: el modelo puede integrarse en flujos de digitalización masiva para generar índices de texto buscable a partir de imágenes escaneadas, gracias a su pipeline `image-text-to-text` compatible con transformers y endpoints.
- Atención al cliente con documentos adjuntos: aunque no se documenta tool calling, el modelo puede transcribir imágenes enviadas por usuarios en un chat para que un sistema posterior procese el texto extraído.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.273.967.936 parámetros en bfloat16, los pesos ocupan aproximadamente 2,55 GB; sumando el estado de activaciones y los dos codificadores visuales, se estima un consumo de entre 4 y 6 GB de VRAM en bfloat16 (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es apto para GPUs de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4080 y RTX 4090; también para A100 y H100 en despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más de VRAM en bfloat16, aunque no se confirma oficialmente.
- Opciones de despliegue: transformers (librería indicada en la model card), con soporte de `from_pretrained` y `generate`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NetraOCR-1.0 | 1.273.967.936 | No disponible | Apache 2.0 | Hugging Face (dipankar500/NetraOCR-1.0) | Fusión de IndicOCR y OvisOCR3 vía BTX y Leo |
| IndicOCR | No disponible | No disponible | No disponible | Hugging Face (bodhan-ai/indic-ocr) | Especializado en scripts índicos; integrado como experto y codificador visual |
| OvisOCR3 | No disponible | No disponible | No disponible | Hugging Face (ATH-MaaS/OvisOCR3) | OCR multimodal general; integrado como experto y codificador visual |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks que permitan validar el rendimiento real del modelo frente a sus componentes originales.
- El autor no documenta sesgos conocidos, pero al entrenarse sobre datasets de OCR de dominio médico e índico, puede heredar sesgos de esos corpus.
- Riesgo de alucinación inherente a los modelos generativos: puede producir texto que no aparece en la imagen, especialmente en documentos degradados o con escritura poco legible.
- Longitud de contexto no documentada, lo que dificulta planificar el procesamiento de documentos de gran tamaño.
- Idiomas soportados no especificados; el soporte de scripts índicos se infiere del vocabulario, pero no está confirmado oficialmente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo incorpora componentes derivados de IndicOCR y OvisOCR3 cuyas licencias no se detallan en la información disponible; conviene verificar la compatibilidad antes de un despliegue comercial.
- El modelo no documenta soporte de tool calling ni de agentes, lo que limita su integración en flujos automatizados complejos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/dipankar500/NetraOCR-1.0
- Paper Branch-Train-MiX (BTX): https://arxiv.org/abs/2403.07816
- Paper Leo (Dual Interleaved Vision Token Fusion): https://arxiv.org/abs/2501.06986
- Modelo IndicOCR: https://huggingface.co/bodhan-ai/indic-ocr
- Modelo OvisOCR3: https://huggingface.co/ATH-MaaS/OvisOCR3

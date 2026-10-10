# Jinstudio/DeepSeek-OCR-2

## Resumen

DeepSeek-OCR-2 es un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y conversión de documentos a Markdown. La ficha que se analiza aquí corresponde a la réplica publicada por el usuario Jinstudio en HuggingFace, que reproduce los pesos de la versión oficial de DeepSeek AI. El modelo se presenta bajo el título "DeepSeek-OCR 2: Visual Causal Flow" y va acompañado de dos artículos: el correspondiente a esta versión (arXiv 2601.20552) y el de su predecesor, "DeepSeek-OCR: Contexts Optical Compression" (arXiv 2510.18234). Los autores citados son Haoran Wei, Yaofeng Sun y Yukun Li.

El problema que aborda es la digitalización estructurada de documentos: a partir de una imagen, el modelo extrae texto libre o lo convierte a Markdown preservando el layout mediante el modo *grounding*. Su innovación declarada es un esquema de codificación visual "de flujo causal" orientado a un procesamiento más parecido al humano de la imagen, combinado con resolución dinámica: hasta seis recortes de 768×768 más una vista global de 1024×1024, lo que se traduce en un presupuesto de entre 256 y 1.120 tokens visuales por imagen.

El modelo tiene 3.389.119.360 parámetros (aproximadamente 3,39 mil millones), se distribuye en safetensors con un repositorio de 6,8 GB y licencia Apache 2.0. Es relevante porque ocupa el nicho de OCR de alta fidelidad como componente dentro de pipelines RAG y de extracción documental, con soporte declarado de inferencia acelerada mediante vLLM. No obstante, la ficha concreta analizada tiene 0 descargas y 0 *likes*, por lo que conviene tratarla como una copia no oficial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language (etiqueta `deepseek_vl_v2`, requiere `trust_remote_code`) |
| Parámetros totales | 3.389.119.360 (≈3,39 B) |
| Parámetros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible (presupuesto visual de 256 a 1.120 tokens por imagen) |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | multilingual (multilingüe, sin listado de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `deepseek_vl_v2` y la necesidad de `trust_remote_code=True` indican que el modelo pertenece a la familia DeepSeek-VL2, es decir, un transformer multimodal con un codificador visual acoplado a un decodificador de lenguaje, con código de modelado propio que no está integrado de forma nativa en `transformers`. El detalle arquitectónico concreto de esta versión no se especifica en la información disponible más allá del nombre "Visual Causal Flow" y del mecanismo de resolución dinámica. Este mecanismo procesa la imagen como una combinación de hasta seis parches de 768×768 más una vista global de 1024×1024, y comprime el resultado a un rango de 256 a 1.120 tokens visuales, lo que reduce el coste de atención frente a un volcado de píxeles sin comprimir.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa. La model card únicamente reconoce la influencia de DeepSeek-OCR, Vary, GOT-OCR2.0, MinerU y PaddleOCR, y cita OmniDocBench como benchmark de referencia del ámbito.

## Capacidades

- OCR libre: extracción de texto plano a partir de una imagen mediante el prompt `<image>\nFree OCR.`
- Conversión de documentos a Markdown: prompt `<image>\n<|grounding|>Convert the document to markdown.`, orientado a preservar estructura y layout.
- Modo *grounding* para localización de elementos en la página.
- Resolución dinámica de imagen con presupuesto de tokens visuales configurable (hasta seis recortes de 768×768 y una vista de 1024×1024).
- Procesamiento multimodilingüe según la etiqueta `multilingual` del repositorio.
- Inferencia con `transformers` en GPU NVIDIA y aceleración mediante vLLM.
- No se documenta soporte de *tool calling*, de agentes, de audio ni de modo de razonamiento explícito.

## Casos de uso

- Digitalización masiva de archivos PDF: el modelo convierte cada página a Markdown con el prompt de *grounding*, lo que permite alimentar posteriormente sistemas de búsqueda o bases de datos documentales.
- Construcción de pipelines RAG sobre documentación corporativa: al emitir Markdown estructurado, el texto resultante se fragmenta y se indexa con mucha menos limpieza manual que con OCR plano.
- Extracción de tablas y formularios: el modo *grounding* facilita conservar la disposición espacial de los campos, útil en facturación o procesamiento de expedientes.
- Automatización de entrada de datos en back office: digitalización de albaranes, contratos o informes escaneados con salida directa a un formato estructurado.
- Enriquecimiento de repositorios de código y documentación técnica: la conversión a Markdown permite reinsertar documentación escaneada en wikis o sistemas de control de versiones.
- Preprocesado para modelos de lenguaje de gran tamaño: al comprimir la imagen a entre 256 y 1.120 tokens visuales, el resultado puede encadenarse como contexto a un LLM de texto con un coste de tokens controlado.
- Digitalización de documentación multilingüe: la etiqueta multilingüe permite abordar lotes con documentos en varios idiomas sin cambiar de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card cita OmniDocBench como benchmark de referencia del ecosistema OCR documental, pero no incluye cifras concretas para este modelo.

## Requisitos de hardware

- Pesos en safetensors: 6,8 GB en el repositorio, coherente con 3,39 B de parámetros en precisión de 16 bits.
- VRAM estimada para inferencia: en torno a 10-14 GB en bf16/fp16 considerando pesos, caché KV y procesamiento de imagen; estimación orientativa, no publicada por el autor.
- GPU recomendadas: A100, H100 o L40S para producción; RTX 4090, RTX 3090 o RTX A6000 para uso individual.
- Compatibilidad con GPU de consumo: probablemente sí en tarjetas con 16 GB o más de VRAM; en configuraciones de 8-12 GB requeriría cuantización, que no está publicada en este repositorio.
- Opciones de despliegue: `transformers` (versión probada 4.46.3 con `torch` 2.6.0, `tokenizers` 0.20.3 y `flash-attn` 2.7.3) y vLLM según la propia model card. No se confirma soporte de llama.cpp u Ollama para esta arquitectura con código personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-OCR-2 (réplica de Jinstudio) | 3,39 B | no disponible | Apache 2.0 | HuggingFace |
| DeepSeek-OCR (v1) | no disponible | no disponible | no disponible | Referenciado en la model card, sin datos en la información proporcionada |
| GOT-OCR2.0 | no disponible | no disponible | no disponible | Referenciado como trabajo previo, sin datos en la información proporcionada |
| MinerU | no disponible | no disponible | no disponible | Referenciado como herramienta del ecosistema, sin datos en la información proporcionada |

No se dispone de datos verificables de parámetros, contexto ni rendimiento de las alternativas dentro de la información aportada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Repositorio no oficial: la ficha analizada pertenece al usuario Jinstudio, no a la cuenta oficial `deepseek-ai`. Los pesos podrían diferir respecto al modelo canónico; conviene contrastar hashes antes de usarlos en producción.
- Repositorio sin tracción: 0 descargas y 0 *likes*, creado y actualizado el mismo día, lo que impide validar su fiabilidad por uso comunitario.
- Riesgo de alucinación: como todo modelo generativo aplicado a OCR, puede inventar caracteres o reconstruir tablas de forma plausible pero incorrecta, especialmente en documentos degradados o manuscritos.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio y debe auditarse en despliegues sensibles.
- Cobertura lingüística no detallada: la etiqueta indica multilingüe, pero no se especifica la lista de idiomas ni su calidad relativa.
- Sin datos de sesgo: no se documentan sesgos conocidos ni evaluación de equidad.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de una réplica no oficial, la responsabilidad sobre los pesos recae en quien los redistribuye.
- Ausencia de cuantizaciones oficiales: dificulta el despliegue en hardware de gama baja sin trabajo adicional de conversión.
- Contexto de texto no especificado: se desconoce el límite de tokens de entrada más allá del presupuesto visual, lo que complica dimensionar memorias intermedias.

## Enlaces

- HuggingFace (réplica analizada): https://huggingface.co/Jinstudio/DeepSeek-OCR-2
- HuggingFace (oficial): https://huggingface.co/deepseek-ai/DeepSeek-OCR-2
- GitHub (oficial): https://github.com/deepseek-ai/DeepSeek-OCR-2
- PDF del artículo: https://github.com/deepseek-ai/DeepSeek-OCR-2/blob/main/DeepSeek_OCR2_paper.pdf
- arXiv DeepSeek-OCR 2: Visual Causal Flow: https://arxiv.org/abs/2601.20552
- arXiv DeepSeek-OCR: Contexts Optical Compression: https://arxiv.org/abs/2510.18234
- GitHub DeepSeek-OCR (v1): https://github.com/deepseek-ai/DeepSeek-OCR
- GitHub Vary: https://github.com/Ucas-HaoranWei/Vary
- GitHub GOT-OCR2.0: https://github.com/Ucas-HaoranWei/GOT-OCR2.0
- GitHub MinerU: https://github.com/opendatalab/MinerU
- GitHub PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Benchmark OmniDocBench: https://github.com/opendatalab/OmniDocBench
- Página de DeepSeek: https://www.deepseek.com/
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
- Twitter de DeepSeek AI: https://twitter.com/deepseek_ai

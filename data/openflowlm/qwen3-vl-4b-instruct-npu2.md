# OpenFlowLM/Qwen3-VL-4B-Instruct-NPU2

## Resumen
OpenFlowLM/Qwen3-VL-4B-Instruct-NPU2 es una distribución de pesos derivada de Qwen/Qwen3-VL-4B-Instruct, el modelo multimodal de visión y lenguaje de aproximadamente 4.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba Cloud. El repositorio lo publica el usuario OpenFlowLM, no está verificado por el equipo Qwen y no incluye ninguna documentación sobre el proceso de conversión, reempaquetado o ajuste aplicado sobre el modelo base, por lo que debe tratarse como un artefacto de terceros.

El modelo resuelve tareas de image-text-to-text: respuesta visual a preguntas, OCR, descripción de imágenes, comprensión de vídeo, razonamiento espacial y generación de código a partir de capturas. Hereda de la familia Qwen3-VL una ventana de contexto nativa de 256.000 tokens ampliable a 1.000.000, además de mejoras de arquitectura como Interleaved-MRoPE, DeepStack y alineación texto-marca temporal.

Su relevancia práctica está en el tamaño: un modelo multimodal de 4B con licencia Apache 2.0 es desplegable en GPU de consumo y, según sugiere el sufijo "NPU2" del nombre y la existencia de un repositorio homónimo bajo la organización FastFlowLM, está orientado a ejecución sobre aceleradores NPU. La ficha del repositorio, sin embargo, no confirma esa orientación ni aporta detalles de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con codificador visual; clase `Qwen3VLForConditionalGeneration` en transformers. La ficha de la serie Qwen3-VL indica variantes Dense y MoE, sin especificar a cuál corresponde este repositorio |
| Parametros totales | Aproximadamente 4.000 millones (deducido de la nomenclatura del modelo; el repositorio no publica desglose) |
| Parametros activos | No aplica / no disponible (no se declara que sea MoE) |
| Longitud de contexto | 256K tokens nativos, ampliable a 1M, según la ficha de la serie Qwen3-VL heredada del modelo base |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponible. La model card de la serie menciona OCR en 32 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | Pesos para la libreria transformers; tamano de repositorio 4,1 GB. No disponible el desglose de ficheros ni la confirmacion de safetensors |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct (etiquetado como `finetune` en los tags de HuggingFace) |
| Pipeline | image-text-to-text |
| Fecha de publicacion | 2026-10-08 (segun HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
La ficha disponible describe la arquitectura de la familia Qwen3-VL, no la de este repositorio concreto. Se trata de un transformer multimodal que acopla un codificador visual tipo ViT a un decodificador de lenguaje, con tres innovaciones declaradas: Interleaved-MRoPE, que reparte la asignación de frecuencias sobre tiempo, anchura y altura para mejorar el razonamiento sobre vídeo de horizonte largo; DeepStack, que fusiona características de varios niveles del ViT para afinar el alineamiento imagen-texto; y alineación texto-marca temporal, que sustituye a T-RoPE para localizar eventos con precisión temporal.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se documenta qué modificación concreta introduce OpenFlowLM respecto a Qwen/Qwen3-VL-4B-Instruct más allá de la etiqueta `finetune`, ni si el sufijo "NPU2" implica una recompilación, una cuantización específica para NPU o un ajuste fino. El tamaño del repositorio, 4,1 GB, es inferior a los aproximadamente 8 GB esperables para 4.000 millones de parámetros en bf16; esto sugiere algún tipo de compresión o cuantización no declarada, aunque la documentación no lo confirma.

## Capacidades
- Generación de texto y comprensión de lenguaje con calidad declarada "a la par de LLM puros", según la model card de la serie.
- Comprensión de imágenes: respuesta visual a preguntas, descripción, reconocimiento amplio de entidades (productos, lugares, flora, fauna, personajes).
- OCR ampliado a 32 idiomas, con tolerancia a baja iluminación, desenfoque e inclinación, y mejor manejo de caracteres poco frecuentes y jerga técnica.
- Comprensión de vídeo de larga duración con indexación a nivel de segundo, gracias al contexto extendido.
- Percepción espacial avanzada: posición de objetos, puntos de vista y oclusiones, con grounding 2D y 3D para razonamiento espacial y robótica.
- Agente visual: reconocimiento de elementos en interfaces de escritorio y móviles, comprensión de su función e invocación de herramientas para completar tareas.
- Codigo visual: generación de diagramas Draw.io y de HTML/CSS/JS a partir de imágenes o vídeos.
- Razonamiento multimodal en STEM y matemáticas, con análisis causal y respuestas basadas en evidencia.
- Soporte de conversación multiturno mediante plantilla de chat (`apply_chat_template`) e inferencia batch.
- No se declara modo de razonamiento extendido (thinking): el repositorio corresponde a la edición Instruct.

## Casos de uso
- Extracción de datos de facturas y albaranes escaneados: el modelo puede procesar documentos largos en una sola pasada gracias a los 256K tokens de contexto, aplicando OCR multilingüe sobre documentos inclinados o con baja calidad de escaneo y devolviendo campos estructurados.
- Moderación de contenido visual en plataformas UGC: clasificación y descripción automática de imágenes y vídeos subidos por usuarios, con reconocimiento de objetos y escenas que permite aplicar políticas sin depender de metadatos.
- Automatización de pruebas de interfaz: interpretando capturas de una app móvil, el modelo identifica botones, campos y su función, lo que permite generar selectores o guiones de test a partir de la propia UI.
- Generación de prototipos front-end desde mockups: a partir de una imagen de diseño se genera HTML/CSS/JS o un diagrama Draw.io, reduciendo el trabajo manual de maquetación inicial.
- Análisis de vídeo de vigilancia o industria: con indexación a nivel de segundo y contexto largo, es viable localizar eventos concretos en grabaciones de horas sin trocear el material en fragmentos que pierdan continuidad.
- Asistente de accesibilidad: descripción en tiempo real de imágenes y escenas para usuarios con discapacidad visual, incluyendo relaciones espaciales entre objetos (quién está delante de quién, qué está ocluido).
- Indexación y búsqueda de archivo audiovisual: catalogación automática de una videoteca mediante descripciones y etiquetas generadas por el modelo, con licencia Apache 2.0 que facilita el uso comercial interno.
- Razonamiento sobre documentación técnica con figuras: interpretación conjunta de texto e imágenes de manuales, planos o gráficos, respondiendo preguntas que requieren cruzar ambas modalidades.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card del modelo base incluye dos imágenes con gráficas de rendimiento (una de rendimiento multimodal y otra de rendimiento en texto puro, comparando las variantes 4B y 8B de Qwen3-VL Instruct), pero no se aportan los valores en formato tabular ni los conjuntos de evaluación utilizados.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Evaluaciones multimodales (MMMU, DocVQA, etc.) | No disponibles |

## Requisitos de hardware
Las cifras de VRAM que siguen son estimaciones derivadas del recuento de parámetros, no datos publicados por el autor del repositorio ni por el equipo Qwen.

- Pesos en bf16/fp16: aproximadamente 8 GB solo para los parámetros, más el codificador visual y el overhead de activaciones; en la práctica, entre 10 y 12 GB para inferencia con contexto corto.
- Pesos en int8/fp8: aproximadamente 4-5 GB de pesos, con un total estimado de 6-7 GB en ejecución.
- Pesos en cuantización de 4 bits: aproximadamente 2,5-3,5 GB de pesos; viable en GPU de 8 GB con contexto moderado.
- La caché KV es el factor limitante en contexto largo: a 256K tokens puede superar con holgura la decena de gigabytes y exceder la VRAM de cualquier GPU de consumo. Para contexto extendido hacen falta GPUs de 48-80 GB (A100 80 GB, H100 80 GB) o técnicas de offloading.
- GPUs de consumo compatibles con contexto corto o medio: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4090 24 GB, RTX 5090.
- Opciones de despliegue confirmadas en la documentación: transformers, con la advertencia de que la model card recomienda instalar desde el repositorio de GitHub porque la versión 4.57.0 todavía no estaba publicada en el momento de la ficha. Se recomienda `flash_attention_2` para escenarios con múltiples imágenes o vídeo.
- El modelo base sí está disponible en Ollama como `qwen3-vl:4b-instruct`, lo que implica soporte GGUF para el modelo original; no se confirma para este repositorio concreto.
- Despliegue sobre NPU: no confirmado en la información disponible. Existe un repositorio con nombre idéntico bajo la organización FastFlowLM y Qwen3-VL-4B-Instruct aparece listado en Qualcomm AI Hub, lo que sugiere vías de despliegue en aceleradores, pero la ficha de este repositorio no documenta ninguna.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OpenFlowLM/Qwen3-VL-4B-Instruct-NPU2 | ~4B | 256K, ampliable a 1M (heredado de la serie) | apache-2.0 | HuggingFace, 0 descargas, sin verificacion | Derivado no documentado del modelo base; repo de 4,1 GB |
| Qwen/Qwen3-VL-4B-Instruct | ~4B | 256K, ampliable a 1M | apache-2.0 | HuggingFace, Ollama, Qualcomm AI Hub | Modelo base oficial, con model card completa y guia de uso |
| Qwen3-VL-8B-Instruct | ~8B | 256K, ampliable a 1M | apache-2.0 (segun la serie) | HuggingFace | Version mayor de la misma generacion, incluida en las graficas comparativas de la model card |
| FastFlowLM/Qwen3-VL-4B-Instruct-NPU2 | No disponible | No disponible | No disponible | HuggingFace | Repositorio homonimo bajo otra organizacion; relacion con despliegue en NPU no confirmada |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias
- Repositorio sin verificar: 0 descargas y 0 likes, sin model card propia ni documentación del proceso de conversión. No hay garantía de que los pesos correspondan exactamente al modelo base.
- Discrepancia de tamaño: 4,1 GB frente a los ~8 GB esperables en bf16 para 4B parámetros. Si existe una cuantización o compresión, no está declarada, y su impacto en la calidad es desconocido.
- Riesgo de alucinación visual: como todo modelo de visión-lenguaje, puede describir objetos o texto inexistentes en la imagen, especialmente con imágenes degradadas, documentos densos o escenas ambiguas.
- Contexto largo no equivale a recuperación perfecta: la ventana de 256K no garantiza el recuerdo íntegro de todo el material; en vídeo y documentos extensos se recomienda validar con muestras propias.
- Idiomas no declarados: la ficha no especifica el soporte multilingüe de texto. Los 32 idiomas mencionados corresponden a OCR y provienen de la model card de la serie, no de una evaluación de este repositorio.
- Sesgos no documentados: no hay información sobre composición del dataset de entrenamiento ni sobre evaluaciones de sesgo demográfico, geográfico o cultural.
- Reconocimiento de personas: la model card de la serie declara reconocimiento de celebridades. Su uso para identificar personas puede entrar en conflicto con normativas de protección de datos y de identificación biométrica en la Unión Europea.
- Licencia: el repositorio declara Apache 2.0, que permite uso comercial y obras derivadas, pero obliga a conservar los avisos de copyright y licencia. Conviene verificar que la derivación cumple las condiciones del modelo base antes de redistribuirla.
- Dependencia de versión: la model card del modelo base indica que es necesario instalar transformers desde el repositorio de GitHub, ya que la versión 4.57.0 no estaba publicada. Esto complica la reproducibilidad en entornos con dependencias fijadas.
- Sin datos de latencia, throughput ni consumo: no es posible dimensionar un despliegue en producción sin realizar pruebas propias.
- Métricas de rendimiento no publicadas en formato numérico: sin valores de referencia, cualquier decisión de adopción debería basarse en una evaluación interna sobre el caso de uso concreto.

## Enlaces
- Repositorio del modelo: https://huggingface.co/OpenFlowLM/Qwen3-VL-4B-Instruct-NPU2
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio homónimo bajo FastFlowLM: https://huggingface.co/FastFlowLM/Qwen3-VL-4B-Instruct-NPU2
- Repositorio oficial de Qwen3-VL en GitHub: https://github.com/QwenLM/Qwen3-VL
- Ficha de Qwen3-VL-4B-Instruct en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_vl_4b_instruct
- Modelo base en Ollama: https://ollama.com/library/qwen3-vl:4b-instruct
- Qwen Chat: https://chat.qwenlm.ai/
- Qwen3 Technical Report (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Qwen2.5-VL Technical Report (arXiv:2502.13923): https://arxiv.org/abs/2502.13923
- Referencia arXiv:2409.12191: https://arxiv.org/abs/2409.12191
- Referencia arXiv:2308.12966: https://arxiv.org/abs/2308.12966

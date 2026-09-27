# NeoChen1024/Infinity-Parser2-Flash-FP8-dynamic

## Resumen

Infinity-Parser2-Flash-FP8-dynamic es una cuantización en FP8 dinámico del modelo infly/Infinity-Parser2-Flash, publicada por el usuario NeoChen1024. Se trata de un modelo de visión-lenguaje (image-text-to-text) especializado en parsing y comprensión de documentos: OCR, análisis de layout, reconocimiento de tablas, gráficos, fórmulas matemáticas y fórmulas químicas, con salida en Markdown. El repositorio contiene 2.213.241.664 parámetros (aproximadamente 2,2 mil millones) y ocupa 3,5 GB en safetensors.

El modelo base, desarrollado por infly-ai, es la variante de baja latencia de la familia Infinity-Parser2, entrenada sobre el dataset Infinity-Doc2-5M (unos 5 millones de muestras de parsing documental) y optimizada mediante aprendizaje por refuerzo multitarea con recompensas verificables. Según la model card, Flash consigue un incremento de throughput de 3,68x respecto al anterior Infinity-Parser-7B (de 441 a 1.624 tokens/s) y alcanza 86,0 en olmOCR-bench y 72,2 en ParseBench.

La relevancia de esta ficha concreta radica en la cuantización: al publicar los pesos en FP8 dinámico con la librería compressed-tensors, se reduce el espacio en memoria de los pesos a aproximadamente 2,2 GB, lo que permite desplegar un parser documental multimodal en GPUs de consumo o en instancias de inferencia económicas, manteniendo compatibilidad con transformers y con endpoints tipo vLLM. La licencia es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal visión-lenguaje; etiquetada como qwen3_5 en los tags del repositorio (detalles internos no disponibles) |
| Parámetros totales | 2.213.241.664 (≈2,2 B) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 dinámico (compressed-tensors); el modelo base se distribuye presumiblemente en BF16 |
| Idiomas soportados | en, zh, multilingual (no se declara español) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP8); no se ofrecen GGUF, AWQ ni GPTQ en este repositorio |
| Tamaño del repositorio | 3,5 GB |
| Pipeline | image-text-to-text |
| Librería | transformers |
| Modelo base | infly/Infinity-Parser2-Flash |
| Fecha de publicación | 2026-09-27 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de los tags del repositorio, que la asocian a la familia qwen3_5 y a un pipeline image-text-to-text. Se trata, por tanto, de un modelo vision-language con un codificador visual y un decodificador de lenguaje, orientado a tareas de parsing estructurado de documentos. El repositorio es una cuantización: los pesos originales de infly/Infinity-Parser2-Flash se han convertido a FP8 con esquema dinámico mediante compressed-tensors, lo que reduce el tamaño de los pesos a la mitad aproximadamente respecto a BF16 y habilita inferencia de mayor throughput en GPUs con soporte FP8.

Del modelo base sí hay información de entrenamiento en la model card: se entrenó sobre Infinity-Doc2-5M, un dataset sintético de casi 5 millones de documentos con layouts tanto fijos como flexibles, combinado con una estrategia de muestreo adaptativo dinámico para equilibrar las tareas. El entrenamiento incorpora aprendizaje por refuerzo conjunto (Joint RL) con un sistema de recompensas verificables que cooptimiza simultáneamente parsing de documento, parsing de elementos, parsing de gráficos, parsing de fórmulas químicas, document VQA y comprensión multimodal general. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de SFT, DPO o RLHF adicionales.

## Capacidades

- Parsing de documentos completos a Markdown, con reconstrucción de estructura y orden de lectura.
- OCR multilingüe (inglés, chino y otros idiomas según el tag multilingual).
- Análisis de layout: detección y clasificación de bloques (texto, título, figura, tabla, pie de página) con métricas mIoU reportadas sobre DocLayNet, D4LA y OmniDocBench.
- Reconocimiento y reconstrucción de tablas, con evaluación en PubTabNet.
- Parsing de fórmulas matemáticas (evaluación UniMERNet).
- Parsing de fórmulas químicas, incluido como tarea específica en el entrenamiento por refuerzo conjunto.
- Parsing de gráficos y figuras.
- Document VQA: preguntas y respuestas sobre el contenido de un documento.
- Comprensión multimodal general, más allá del parsing puro.
- Conversacional (tag conversational), lo que permite interacción multi-turno sobre documentos.
- Compatibilidad con endpoints (tag endpoints_compatible), pensada para servir el modelo mediante APIs compatibles con OpenAI.

## Casos de uso

- Digitalización masiva de archivos PDF escaneados: el modelo convierte cada página en Markdown estructurado, lo que permite alimentar un pipeline ETL sin depender de plantillas fijas ni de coordenadas predefinidas.
- Extracción de tablas financieras y contables: gracias al reconocimiento de tablas (92,41 en PubTabNet para la variante base), se pueden transformar balances, extractos y hojas de cálculo escaneadas en estructuras reutilizables para análisis posterior.
- Indexación para RAG documental: combinado con un motor de búsqueda vectorial, el layout analysis y el parsing a Markdown producen fragmentos con jerarquía correcta (títulos, secciones, tablas), mejorando la recuperación frente a un OCR plano.
- Procesamiento de literatura científica: reconocimiento de fórmulas matemáticas (96,5 en UniMERNet en la variante base) y de fórmulas químicas, útil para construir bases de conocimiento en dominios técnicos.
- Automatización de back office con facturas, albaranes y contratos: el modelo extrae campos y tablas y puede responder preguntas concretas sobre el documento, reduciendo la intervención manual en validación de datos.
- Atención al cliente sobre documentación: al ser conversacional y soportar VQA sobre documentos, permite responder preguntas de usuarios acerca de manuales, pólizas o informes adjuntos.
- Despliegue en infraestructura limitada o en el borde: al ocupar los pesos FP8 alrededor de 2,2 GB, es viable ejecutarlo en GPUs de consumo o en instancias pequeñas con requisitos de latencia ajustados (el modelo base reporta 1.624 tokens/s).
- Preprocesado de corpus heterogéneos para entrenamiento: normalizar miles de PDFs de layouts distintos a texto estructurado antes de usarlos como datos de entrenamiento o evaluación.

## Benchmarks y rendimiento

Los datos de la tabla proceden de la model card del modelo base Infinity-Parser2-Flash; no se han publicado en la información disponible resultados específicos de esta cuantización FP8, por lo que pueden existir diferencias menores respecto al modelo original.

| Tarea | Benchmark | Infinity-Parser2-Flash (base) | Infinity-Parser2-Pro | PaddleOCR-VL-1.5 | DeepSeek-OCR-2 | MinerU2.5 | Gemini-3-Pro |
|---|---|---|---|---|---|---|---|
| Document parsing | olmOCR-bench | 86,0 | 87,6 | 78,5 | 76,3 | 75,2 | — |
| Document parsing | ParseBench | 72,2 | 74,3 | 66,0 | 41,2 | 45,9 | 69,1 |
| Document parsing | OmniDocBench-v1.6 | 91,98 | 93,95 | 94,87 | 90,17 | 92,98 | 92,85 |
| Layout (mIoU) | DocLayNet | 64,97 | 64,93 | 71,05 | 45,62 | 67,74 | — |
| Layout (mIoU) | D4LA | 46,05 | 52,41 | 50,21 | 33,03 | 51,62 | — |
| Layout (mIoU) | OmniDocBench-v1.5-Layout | 73,07 | 74,56 | 74,80 | 55,28 | 76,28 | — |
| Element parsing | OmniDocBench-v1.5-TextBlock | 94,31 | 95,05 | 94,97 | 84,13 | 86,00 | — |
| Element parsing | PubTabNet (val) | 92,41 | 94,76 | 84,60 | 89,53 | 89,07 | 91,40 |
| Element parsing | UniMERNet | 96,5 | 97,7 | 95,8 | 79,8 | 96,5 | 96,4 |

Throughput reportado por el autor del modelo base: incremento de 3,68x respecto a Infinity-Parser-7B, pasando de 441 a 1.624 tokens/s. No se especifica el hardware empleado en esa medición.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 2,2 GB en FP8. El repositorio completo ocupa 3,5 GB, cifra que probablemente incluye el codificador visual y otros artefactos.
- VRAM total en inferencia: no se especifica en la información disponible. Como referencia práctica, hay que sumar a los pesos la caché KV y las activaciones, que en parsing documental pueden ser considerables porque cada página de alta resolución genera muchos tokens visuales.
- GPU recomendadas para producción: H100, A100 o L40S, especialmente por el soporte nativo de FP8 en arquitecturas Hopper y Ada Lovelace, que es donde la cuantización aporta la mayor ganancia de throughput.
- GPU de consumo: el modelo debería caber en GPUs con 8-12 GB o más, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 o RTX 5090. La cifra exacta depende de la resolución de imagen y del número de páginas procesadas simultáneamente.
- Opciones de despliegue: transformers, vLLM y otros servidores compatibles con endpoints (el repositorio incluye el tag endpoints_compatible). Para llama.cpp u Ollama sería necesario convertir previamente a GGUF, formato que este repositorio no ofrece.
- Latencia y throughput: la única cifra disponible corresponde al modelo base sin cuantizar (1.624 tokens/s) y no se asocia a un hardware concreto. Para esta variante FP8 no se han publicado mediciones en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | olmOCR-bench | ParseBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Infinity-Parser2-Flash-FP8-dynamic | 2,21 B | No disponible | No publicado para la versión FP8 (86,0 en el base) | No publicado para la versión FP8 (72,2 en el base) | Apache-2.0 | HuggingFace (repositorio de terceros) |
| Infinity-Parser2-Flash (base) | No disponible | No disponible | 86,0 | 72,2 | No indicada en la información disponible | HuggingFace (infly) |
| Infinity-Parser2-Pro | No disponible | No disponible | 87,6 | 74,3 | No indicada en la información disponible | HuggingFace (infly) |
| PaddleOCR-VL-1.5 | No disponible | No disponible | 78,5 | 66,0 | No disponible | No disponible |
| DeepSeek-OCR-2 | No disponible | No disponible | 76,3 | 41,2 | No disponible | No disponible |
| MinerU2.5 | No disponible | No disponible | 75,2 | 45,9 | No disponible | No disponible |
| Gemini-3-Pro | No disponible (propietario) | No disponible | — | 69,1 | Propietaria | API de Google |

En la comparativa, la variante Flash se sitúa por delante de PaddleOCR-VL-1.5, DeepSeek-OCR-2 y MinerU2.5 en las dos métricas principales de parsing, y por detrás de Infinity-Parser2-Pro, que es la variante de máxima precisión de la misma familia.

## Limitaciones y advertencias

- Los benchmarks publicados corresponden al modelo base, no a esta cuantización. La conversión a FP8 dinámico puede degradar ligeramente la precisión, especialmente en tareas sensibles a detalles como fórmulas o tablas densas; conviene validar con un conjunto propio antes de desplegar en producción.
- No se han publicado datos sobre sesgos del modelo base ni de esta variante.
- Riesgo de alucinación inherente a los modelos generativos: en documentos con baja resolución, ruido, sellos, manuscritos o degradación severa, el modelo puede inventar contenido o saltarse bloques.
- Idiomas: la model card declara inglés, chino y multilingüe, pero no se garantiza un rendimiento homogéneo en español ni en otras lenguas. Es recomendable evaluar específicamente el idioma objetivo.
- Longitud de contexto no especificada: para documentos extensos habrá que trocear por páginas o secciones y gestionar la continuidad de tablas que cruzan páginas.
- El repositorio es una cuantización de terceros (NeoChen1024), no una publicación oficial de infly-ai. Esto implica que el soporte, las actualizaciones y la trazabilidad de la conversión dependen de ese autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de funcionamiento en producción.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No impone restricciones de uso adicionales conocidas, pero al ser un modelo derivado conviene verificar la licencia del modelo base original.
- No se ofrecen pesos en GGUF, AWQ ni GPTQ, lo que limita las opciones de despliegue a entornos que soporten safetensors y FP8.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NeoChen1024/Infinity-Parser2-Flash-FP8-dynamic
- Modelo base: https://huggingface.co/infly/Infinity-Parser2-Flash
- Variante de máxima precisión: https://huggingface.co/infly/Infinity-Parser2-Pro
- Dataset de entrenamiento: https://huggingface.co/datasets/infly/Infinity-Doc2-5M
- Repositorio de código: https://github.com/infly-ai/INF-MLLM
- Paper: https://arxiv.org/pdf/2607.07836
- Demo: https://huggingface.co/spaces/infly/Infinity-Parser2-Demo

# mukaddamzaid/amos-1-large

## Resumen

Amos 1 large es un modelo de decisión de 27.000 millones de parámetros desarrollado por mukaddamzaid (equipo asociado al proyecto SciRA), afinado a partir de Qwen/Qwen3.8-27B y publicado bajo licencia Apache 2.0. A diferencia de un modelo generativo convencional, no produce texto libre: recibe un caso (texto, JSON o imagen) junto con un esquema de preguntas tipadas y devuelve, en un único forward pass, una distribución de probabilidad sobre las respuestas permitidas para cada pregunta. Esto elimina el parseo de salidas y los formatos malformados, un problema recurrente cuando se integran LLM en pipelines de decisión automatizada.

El modelo forma parte de la familia Amos 1 (large, medium, small, mini) y se posiciona como la variante más capaz para decisiones complejas: preguntas con varios pasos de razonamiento, políticas largas, compensaciones entre criterios y casos que requieren conocimiento amplio. Soporta seis tipos de pregunta: sí/no (`noul`), elección única (`choice`, hasta 255 opciones), puntuación (`score`), selección múltiple (`multi`), cita textual (`span`) y localización de región sobre imagen (`region`).

Su relevancia actual radica en que compite directamente con modelos de decisión propietarios (Microsoft-Decision-1, Perplexity Decider v1.1, Clef de Cloudflare) con pesos abiertos, contexto de 131.072 tokens y capacidad de procesar imágenes, lo que permite despliegues on-premise en flujos de clasificación, triaje y extracción estructurada donde la auditabilidad de la salida es crítica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.8-27B) con cabezas de decisión tipadas (`heads.pt`) |
| Parámetros totales | 27B (según modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (`--max-len 131072`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 55,4 GB), más `heads.pt`, `calibration.json` y procesador de imagen |
| Tipos de pregunta | `noul`, `choice` (hasta 255 opciones), `score`, `multi`, `span`, `region` |
| Entrada multimodal | texto, JSON e imágenes |
| Hardware de referencia | GPU de 80 GB |
| Latencia declarada | 122 ms de mediana en servidor para una petición de tres preguntas |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y se especializa mediante fine-tuning para emitir decisiones tipadas en lugar de tokens de texto. La salida se materializa en cabezas específicas (`heads.pt`) que producen una probabilidad por cada respuesta permitida en el esquema de preguntas, de modo que cada pregunta se resuelve en el mismo forward pass. El paquete de servicio (`amos.serve`) incorpora además un fichero `calibration.json` con los ajustes de decodificación de citas textuales (`span`), lo que sugiere un tratamiento específico de la calibración por tipo de pregunta.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se documenta explícitamente que los resultados de Typed Decisions son zero-shot sobre cuatro flujos de trabajo no vistos durante el entrenamiento, y que el ajuste de priors por pregunta se aplica en tiempo de respuesta sin modificar los pesos. El modelo integra procesamiento de imagen (image processor incluido en el repo), lo que habilita tareas de localización espacial (`region`).

## Capacidades

- Clasificación y decisión tipada: responde preguntas de sí/no, elección única entre hasta 255 opciones, puntuación, selección múltiple, cita textual y localización de región.
- Salida probabilística calibrada: cada respuesta incluye una probabilidad, lo que permite umbrales de confianza y abstención.
- Procesamiento multimodal: acepta imágenes junto al caso para tareas de grounding y localización (RefCOCO, COCO, BLINK).
- Razonamiento multi-paso: diseñado para preguntas que requieren varios pasos, políticas largas y compensaciones entre criterios.
- Contexto largo: hasta 131.072 tokens por petición, adecuado para documentos y expedientes extensos.
- Extracción de citas textuales: recupera fragmentos exactos del caso (`span`), con la limitación de truncamiento en citas largas.
- Reranking: capacidade de reordenar resultados de recuperación (nDCG@10 de 0,517 sobre el top 30 de BM25 en SciFact, NFCorpus y FiQA).
- Conocimiento amplio: puntuación de 52,6 en el área de conocimiento del Decision Index.
- Sin tool calling ni function calling declarados; el modelo no genera texto ni invoca herramientas.
- Solo inglés.

## Casos de uso

- Triaje de tickets de soporte: con un esquema de preguntas como "¿pide reembolso?" (`noul`) y "¿qué equipo debe gestionarlo?" (`choice`), el modelo resuelve ambas en un único forward pass de 122 ms, lo que permite enrutar miles de tickets por hora sin parseo de salidas.
- Clasificación de documentos contractuales: gracias a los 131.072 tokens de contexto, puede procesar contratos completos y responder preguntas tipadas sobre cláusulas, partes y obligaciones, con citas textuales (`span`) para auditoría.
- Verificación de hechos y grounding: las puntuaciones en RAGTruth y TruthfulQA (dentro del agregado de 89,8% en diez benchmarks) lo hacen adecuado para filtrar afirmaciones no respaldadas en pipelines RAG.
- Procesamiento de facturas y recibos: la prueba de totales de factura citados exactamente (10/10) y la extracción de campos tipados permiten automatizar la validación de gastos y la detección de duplicados.
- Control de calidad visual en imágenes: la localización de regiones (`region`) con 91,9% de cajas centradas en el objeto nombrado (RefCOCO) sirve para inspección de producto, moderación de imágenes y anotación asistida.
- Evaluación automática de respuestas (LLM-as-judge): las puntuaciones en JudgeBench y el formato de decisión tipada permiten construir evaluadores deterministas con probabilidades calibradas en lugar de juicios en texto libre.
- Moderación y políticas de contenido: preguntas de sí/no con probabilidad asociada facilitan umbrales configurables y revisión humana solo en casos de baja confianza.
- Reranking en motores de búsqueda internos: reordena el top 30 de BM25 con un nDCG@10 medio de 0,517 en tres colecciones, integrable como etapa de refinamiento.

## Benchmarks y rendimiento

Typed decisions (test split, 2.000 decisiones de cuatro flujos no vistos, zero-shot):

| Modelo | Accuracy | KL ↓ | Brier ↓ |
|---|---|---|---|
| Amos 1 large | 76,1% | 0,126 | 0,069 |
| Microsoft-Decision-1 (pesos cerrados) | 79,5% | 0,318 | no disponible |
| Decider 1 (cifra del propio fabricante) | 76,8% | 0,096 | no disponible |
| Perplexity Decider v1.1 | 73,9% | 0,466 | no disponible |
| Clef (Cloudflare) | 72,5% | 0,191 | no disponible |

Con priors ajustados en el train split del benchmark: 80,25% (Decider 1: 80,1%).

Otros resultados declarados:

| Benchmark | Resultado |
|---|---|
| Decision Bench (1.071 registros reales, con imágenes) | 94,9% |
| Decision Index 0.3 (parte pública) | 65,11 (conocimiento 52,6; lenguaje 72,3; recuperación 66,2; herramientas 79,7; artes 50,0) |
| JevBench público easy / standard / hard | 100,0 / 100,0 / 84,7 |
| Diez benchmarks públicos (RAGTruth, JudgeBench, Belebele, WinoGrande, ContractNLI, TruthfulQA, Circa, Financial PhraseBank, TabFact, BBH) | 89,8% |
| AG News / DAIR Emotion / Banking77 | 89,1 / 58,5 / 90,5 |
| Totales de factura citados exactamente | 10/10 |
| RefCOCO, caja centrada en el objeto nombrado | 91,9% |
| RefCOCO, caja que cubre al menos la mitad del objeto | 71,3% |
| COCO, caja centrada en el objeto nombrado | 98,4% |
| Tareas públicas del vision board del Decision Index (8 tareas, pesos del board) | 76,69 |
| BLINK, corregido por azar | 65,9 |
| Reranking BM25 top 30, nDCG@10 (media SciFact, NFCorpus, FiQA) | 0,517 |
| Tiempo de servidor, mediana, petición de tres preguntas | 122 ms |

En Decision Bench, la comparativa citada sitúa a Perplexity Decider v1.1 en 94,5%, DeepSeek V4.1 Flash y Gemini 3.5 Flash en 94,2% y Jev 1.13 en 93,8%.

## Requisitos de hardware

- VRAM estimada: el modelo se ejecuta en una GPU de 80 GB según la documentación; en FP16 los 27B de parámetros ocupan aproximadamente 54 GB, coherente con el tamaño del repo (55,4 GB).
- GPU recomendadas: A100 80 GB, H100 80 GB y variantes con 80 GB o más. No se documenta soporte para GPUs de consumo.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en configuraciones de 48 GB en precisión completa; no se indican pesos cuantizados que lo permitan.
- Despliegue: paquete propio `amos.serve` (Python 3.12, PyTorch 2.14, versiones fijadas), con comando `python -m amos.serve amos-1-large --device cuda --port 8000 --max-len 131072`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- API hospedada: `POST https://api.amos.scira.ai/v1/systemone` con `"model": "amos-1-large"`, sin clave.
- Latencia: 122 ms de mediana en servidor para una petición de tres preguntas. No se publica throughput.
- Nota: el modelo se declara como el más lento de los cuatro de la familia Amos 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Typed decisions (accuracy) | KL ↓ | Disponibilidad |
|---|---|---|---|---|---|---|
| Amos 1 large | 27B | 131.072 | Apache 2.0 | 76,1% | 0,126 | Pesos abiertos en HF |
| Decider 1 | no disponible | no disponible | no disponible | 76,8% (cifra del fabricante) | 0,096 | no disponible |
| Perplexity Decider v1.1 | no disponible | no disponible | propietaria | 73,9% | 0,466 | API |
| Clef (Cloudflare) | no disponible | no disponible | propietaria | 72,5% | 0,191 | Servicio |
| Microsoft-Decision-1 | no disponible | no disponible | pesos cerrados | 79,5% | 0,318 | no disponible |

Amos 1 large es el único de la comparativa con pesos abiertos y licencia Apache 2.0, lo que permite despliegue local y auditoría. Cede en accuracy frente a Microsoft-Decision-1 (79,5%) y Decider 1 (76,8%), pero obtiene mejor Brier (0,069) que los rivales con dato publicado, lo que indica una calibración más fiable de las probabilidades. En Decision Bench queda por delante de Perplexity Decider v1.1, DeepSeek V4.1 Flash, Gemini 3.5 Flash y Jev 1.13.

## Limitaciones y advertencias

- Es el modelo más lento de la familia Amos 1, según la propia model card.
- Las citas textuales largas (cláusulas completas, direcciones) pueden devolverse truncadas.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- No genera texto libre: cualquier caso de uso que requiera explicaciones o resúmenes necesita otro modelo.
- No se documentan sesgos conocidos ni evaluaciones de seguridad o alineación.
- Riesgo de alucinación no cuantificado de forma específica; las puntuaciones en TruthfulQA y RAGTruth se presentan agregadas dentro de un conjunto de diez benchmarks.
- Requiere GPU de 80 GB para inferencia según la documentación; no se ofrecen alternativas cuantizadas para hardware menor.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.8-27B debe verificarse por separado en cuanto a sus propios términos.
- Las cifras de Decider 1 proceden del fabricante y no fueron reproducidas por los autores de Amos 1.
- El ranking del Decision Index incluye pruebas privadas que solo ejecutan los mantenedores del board, por lo que la posición real puede diferir de la parte pública.
- Dependencia de versiones fijadas de Python 3.12 y PyTorch 2.14 para reproducir los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mukaddamzaid/amos-1-large
- Colección Amos 1: https://huggingface.co/collections/mukaddamzaid/amos-1
- Amos 1 medium: https://huggingface.co/mukaddamzaid/amos-1-medium
- Amos 1 small: https://huggingface.co/mukaddamzaid/amos-1-small
- Amos 1 mini: https://huggingface.co/mukaddamzaid/amos-1-mini
- Playground: https://amos.scira.ai/playground/?model=amos-1-large
- Documentación de la API: https://amos.scira.ai/docs/
- Página del modelo: https://amos.scira.ai/models/amos-1-large/
- Dataset Typed decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Decision Bench: https://decisionbench.ai
- Decision Index (space): https://huggingface.co/spaces/multimodalart/jev-decision-index

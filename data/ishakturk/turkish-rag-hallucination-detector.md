# ishakturk/turkish-rag-hallucination-detector

## Resumen

El Turkish RAG hallucination detector es un modelo de clasificación de tokens (token classification) desarrollado por el usuario ishakturk en el marco de un proyecto de fin de grado (BIL482) de la Universidad de Medeniyet de Estambul en 2026. Su función es marcar, dentro de una respuesta generada por un sistema RAG en turco, qué fragmentos concretos no están respaldados por el contexto proporcionado, es decir, detectar alucinaciones a nivel de palabra.

Se trata de un fine-tuning del modelo `jhu-clsp/mmBERT-base` (307 millones de parámetros) sobre una partición de entrenamiento limpia de RAGTruth-TR, con el objetivo de resolver un problema específico y poco cubierto: la verificación de fidelidad en turco dentro de pipelines de generación aumentada por recuperación. La entrada combina el prompt (pregunta o instrucción más contexto) y la respuesta en un único par `[CLS] prompt [SEP] answer [SEP]`, y la salida es una etiqueta por token que indica si pertenece a una alucinación.

El modelo es relevante ahora porque la mayoría de detectores de alucinaciones están entrenados en inglés y no cubren idiomas de recursos medios como el turco. Este checkpoint ofrece una base funcional y reproducible (código, particiones de datos, evaluación e informe publicados) con licencia MIT, aunque con un rendimiento notablemente inferior en respuestas nativas frente a respuestas traducidas automáticamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base `jhu-clsp/mmBERT-base`) |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos safetensors en fp32/fp16) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | token-classification (etiquetado BIO de alucinaciones) |
| Tamano del repositorio | 0,6 GB |
| Modelo base | jhu-clsp/mmBERT-base |
| Umbrales congelados | respuesta: τ = 0,8; span: τ = 0,75 |

## Arquitectura y entrenamiento

El modelo se construye sobre `jhu-clsp/mmBERT-base`, un encoder de la familia ModernBERT con 307 millones de parámetros. Se ha realizado un fine-tuning para clasificación de tokens con pérdida de entropía cruzada ponderada (weighted cross-entropy), tasa de aprendizaje 3e-5 y parada temprana, en la ejecución identificada como `r2_mmbert_s42` (semilla 42). El formato de entrada es `[CLS] prompt [SEP] answer [SEP]`, donde el prompt contiene la pregunta o instrucción junto con el contexto recuperado; la etiqueta 1 marca los tokens de la respuesta considerados alucinados.

El entrenamiento se realizó sobre la partición de entrenamiento limpia de RAGTruth-TR, un conjunto derivado de RAGTruth mediante traducción automática. Los umbrales de decisión se congelaron sobre la partición de desarrollo: un umbral a nivel de respuesta de 0,8 y uno a nivel de span de 0,75; una palabra se marca cuando su probabilidad máxima a nivel de carácter alcanza el umbral. El autor indica que el README y el informe del repositorio presentan la media de tres semillas, por lo que las cifras de esta ejecución individual difieren de las publicadas como media (por ejemplo, F1 de ejemplo en nativo de 0,458 ± 0,079).

## Capacidades

- Detección de alucinaciones a nivel de token y de span en respuestas RAG en turco.
- Clasificación binaria por token: token respaldado por el contexto frente a token alucinado.
- Agregación a nivel de ejemplo (respuesta completa) mediante umbral τ = 0,8.
- Localización de fragmentos concretos no soportados por el contexto (span-level).
- Integración en pipelines de RAG como paso de verificación posterior a la generación.
- Uso con la librería propia `hdtr` del autor (`load_detector`, `detect`).
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento extendido.

## Casos de uso

- Verificación de fidelidad en asistentes RAG turcos: tras generar una respuesta con el contexto recuperado, el detector marca las palabras no respaldadas y permite filtrar o reescribir la respuesta antes de mostrarla al usuario.
- Moderación de respuestas en atención al cliente: en un chatbot de soporte en turco, se puede usar para bloquear respuestas que contengan datos no presentes en la base documental (precios, plazos, políticas).
- Auditoría de calidad de sistemas RAG: procesar por lotes respuestas históricas y calcular la tasa de spans alucinados para monitorizar la deriva del generador.
- Investigación en evaluación de alucinaciones multilingües: sirve como línea base reproducible para comparar con otros siete detectores turcos, según indica el informe del autor.
- Generación de datos de entrenamiento: las marcas de span permiten construir conjuntos etiquetados para entrenar o ajustar generadores con penalización de alucinaciones.
- Filtrado previo en pipelines de destilación o evaluación automática: descartar respuestas con spans marcados antes de incluirlas en conjuntos de evaluación o de entrenamiento.
- Integración en herramientas de anotación: sugerir spans sospechosos a anotadores humanos en flujos de revisión de respuestas RAG en turco.

## Benchmarks y rendimiento

Resultados de la ejecución publicada (semilla 42):

| Conjunto de prueba | Example F1 | Example AUROC | Span F1 |
|---|---|---|---|
| RAGTruth-TR final test (2.160 respuestas traducidas) | 0,763 | 0,896 | 0,535 |
| Test nativo en turco (184 respuestas de Qwen3-8B y DeepSeek) | 0,367 | 0,724 | 0,324 |

El autor señala que la media de tres semillas en el test nativo alcanza un F1 de ejemplo de 0,458 ± 0,079, y que el rendimiento cae en respuestas nativas: el modelo es preciso pero omite muchos errores cortos y sutiles. No se han publicado en la información disponible resultados comparativos numéricos frente a los siete detectores turcos existentes; el informe del repositorio contiene esa comparación.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,2-2,5 GB en fp32/fp16 para los 307 millones de parámetros, más el overhead de activaciones y tokenizador; cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. El modelo es pequeño y no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: PyTorch con la librería `hdtr` del autor, `transformers` con `AutoModelForTokenClassification`, y servidores de inferencia compatibles con modelos de `transformers` (por ejemplo, Text Embeddings Inference no aplica; vLLM y TGI están orientados a generación y no son la vía natural para token classification). Para CPU, exportación a ONNX es una opción habitual aunque no está documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ishakturk/turkish-rag-hallucination-detector | 307 M | no disponible | Detección de alucinaciones RAG en turco (token classification) | MIT | Hugging Face, 2 descargas |
| jhu-clsp/mmBERT-base (modelo base) | 307 M | no disponible | Encoder multilingüe general | no disponible en la informacion | Hugging Face |
| Detectores turcos comparados en el informe del autor (siete) | no disponible | no disponible | Detección de alucinaciones en turco | no disponible | no disponible |

No se dispone en la información proporcionada de datos numéricos de los siete detectores turcos con los que el autor compara su modelo; la comparación completa está en el informe del repositorio de GitHub.

## Limitaciones y advertencias

- Entrenado sobre datos traducidos automáticamente (RAGTruth-TR): el rendimiento cae de forma acusada en respuestas nativas en turco (F1 de ejemplo 0,367 frente a 0,763 en el test traducido).
- Errores sutiles como un año incorrecto inferido de un número cercano suelen pasar desapercibidos; el modelo es preciso pero con baja exhaustividad en esos casos.
- Las etiquetas del conjunto de test nativo fueron generadas por un LLM y validadas solo sobre una muestra humana de 50 filas, lo que introduce incertidumbre en las métricas.
- Las cifras publicadas corresponden a una única semilla (42); la media de tres semillas difiere, por lo que no deben tomarse como rendimiento estable.
- Riesgo de alucinación del propio detector: puede marcar como alucinado texto correcto o dejar pasar errores, especialmente en dominios alejados de los datos de entrenamiento.
- Sesgos idiomáticos y de dominio: solo turco y entrenado sobre un corpus concreto; no se ha evaluado en otros idiomas ni en dominios especializados.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base `jhu-clsp/mmBERT-base` tiene su propia licencia que debe verificarse por separado antes de un despliegue comercial.
- Uso previsto como herramienta de verificación auxiliar, no como sustituto de revisión humana en contextos de alto riesgo.
- El repositorio tiene un volumen muy bajo de descargas (2) y ninguna validación externa, por lo que debe tratarse como un artefacto de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ishakturk/turkish-rag-hallucination-detector
- Repositorio de código, datos, evaluación e informe: https://github.com/ishakturk/Turkish-RAG-Hallucination-Detector
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base

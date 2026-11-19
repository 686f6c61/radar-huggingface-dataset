# sony3021919/layoutlm-document-qa

## Resumen

LayoutLM para *document question answering* es un modelo multimodal especializado en responder preguntas sobre documentos escaneados o digitalizados, combinando información textual con información de layout (posición de cada token en la página) e información visual de la imagen. La ficha corresponde a una copia publicada por el usuario `sony3021919` bajo el identificador `sony3021919/layoutlm-document-qa`, que reproduce el conocido modelo `impira/layoutlm-document-qa` creado originalmente por el equipo de Impira. El modelo se distribuye con licencia MIT y pipeline `document-question-answering`.

El modelo parte de la arquitectura LayoutLM (un transformer tipo BERT al que se le añaden *embeddings* de posición 2D y, en variantes posteriores, características visuales) y ha sido afinado sobre los conjuntos de datos SQuAD 2.0 y DocVQA para la tarea extractiva de QA sobre documentos. Con 127.793.412 parámetros, es un modelo compacto que puede ejecutarse en hardware modesto, lo que lo hace atractivo para pipelines de automatización documental en producción.

Su relevancia actual radica en que cubre un nicho muy concreto (extracción de respuestas de facturas, contratos, estados financieros y formularios) donde los LLM generalistas suelen fallar por falta de grounding espacial y donde el coste de un modelo grande no está justificado. No obstante, conviene señalar que el repositorio tiene cero descargas y cero *likes*, y que la model card es una copia de la del modelo original de Impira, por lo que debe tratarse como una réplica no verificada del modelo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LayoutLM (transformer tipo BERT con *embeddings* de layout 2D y características visuales) |
| Parametros totales | 127.793.412 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (LayoutLM base suele limitarse a 512 tokens, pero no se confirma en la información proporcionada) |
| Tipos de cuantizacion | No disponible (el repo incluye pesos en safetensors, PyTorch y TensorFlow; no se documentan cuantizaciones GGUF/ONNX) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (bin) y TensorFlow |

## Arquitectura y entrenamiento

El modelo es un *fine-tuning* del LayoutLM multimodal original de Microsoft, un transformer encoder de tipo BERT que incorpora *embeddings* de posición bidimensionales (coordenadas x0, y0, x1, y1 de cada token en la página) además de los *embeddings* textuales habituales. Esta combinación permite que el modelo razone sobre la disposición espacial del texto, algo crítico en documentos donde el significado depende de la posición (por ejemplo, el valor situado a la derecha de la etiqueta "Total"). La información proporcionada no detalla si se trata de LayoutLMv1, v2 o v3, ni el número exacto de capas, dimensión oculta o cabezas de atención.

El entrenamiento declarado en la model card consiste en un *fine-tuning* sobre SQuAD 2.0 (QA extractivo sobre texto plano) y DocVQA (QA sobre imágenes de documentos). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o *instruction tuning*. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal; el modelo es un encoder extractivo estándar que predice los índices de inicio y fin de la respuesta dentro de la secuencia de tokens del documento.

## Capacidades

- Respuesta extractiva a preguntas sobre documentos: devuelve el fragmento de texto (con índices `start`/`end`) que responde a la pregunta, junto con una puntuación de confianza.
- Comprensión de layout: utiliza las coordenadas de cada token para desambiguar campos en formularios, facturas y tablas.
- Procesamiento multimodal: combina texto OCR, posiciones y características visuales de la imagen del documento.
- Integración con el pipeline `document-question-answering` de Hugging Face Transformers, que gestiona OCR (vía pytesseract) y tokenización automáticamente.
- Soporte de preguntas sin respuesta (gracias al entrenamiento con SQuAD 2.0, que incluye ejemplos no respondibles), aunque la model card no detalla el comportamiento en ese caso.
- Capacidad multilingüe: limitada al inglés según los metadatos del repositorio.
- No se documenta soporte de *tool calling*, *function calling*, agentes, *thinking mode*, audio ni visión general más allá del layout documental.

## Casos de uso

- Automatización de cuentas por pagar: extraer número de factura, fecha, importe total y proveedor de facturas escaneadas. El modelo es adecuado porque el layout de una factura es estable y las preguntas son acotadas ("What is the invoice number?", "What is the purchase amount?"), como demuestran los ejemplos de la model card.
- Procesamiento de contratos: localizar cláusulas concretas (fecha de firma, partes implicadas, importe de penalización) en documentos de varias páginas, aprovechando la información espacial para distinguir encabezados de cuerpo de texto.
- Extracción de datos de estados financieros: responder preguntas como "What are the 2020 net sales?" sobre tablas contables, un caso incluido explícitamente en la model card con una puntuación de 0.59.
- Digitalización de formularios administrativos: rellenar bases de datos a partir de PDFs con campos etiqueta-valor, usando el modelo como extractor de alta precisión y bajo coste computacional.
- *Onboarding* de documentos en *pipelines* RAG: usar el modelo como primer paso extractivo para convertir documentos en pares pregunta-respuesta estructurados antes de indexarlos en un sistema de recuperación.
- Verificación de documentos en *compliance*: comprobar automáticamente que un documento contiene los campos obligatorios (NIF, fecha, importe) y devolver la evidencia textual con su posición.
- Procesamiento por lotes en CPU: al tener ~128M de parámetros, puede ejecutarse en entornos sin GPU para volúmenes moderados de documentos, lo que lo hace viable en despliegues *on-premise* de bajo presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (EM, F1, ANLS) sobre DocVQA, SQuAD 2.0 ni otros conjuntos, y los únicos datos numéricos son las puntuaciones de confianza de tres ejemplos de inferencia (0.994, 0.991 y 0.591), que no constituyen una evaluación sistemática.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0.5 GB solo para pesos (127.8M × 4 bytes), más activaciones y memoria del tokenizador; en la práctica, menos de 2 GB para documentos de longitud típica.
- VRAM estimada en FP16: alrededor de 0.26 GB para pesos, aunque la información proporcionada no documenta versiones FP16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, T4, A10 o A100 funcionarán sin problema. El modelo es claramente *consumer-friendly*.
- CPU: viable para inferencia en CPU, especialmente en lotes pequeños, dado el reducido número de parámetros.
- Opciones de despliegue: pipeline `document-question-answering` de Transformers (requiere PIL, pytesseract y PyTorch), y potencialmente vLLM o TGI si se convierte a un formato compatible, aunque no se documenta soporte nativo. No se proporcionan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. La latencia vendrá dominada por el OCR (pytesseract) más que por el propio modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `sony3021919/layoutlm-document-qa` (esta ficha) | 127.8M | No disponible | MIT | Hugging Face (0 descargas) | Réplica del modelo de Impira; sin benchmarks publicados |
| `impira/layoutlm-document-qa` | ~127M (misma arquitectura) | No disponible | MIT | Hugging Face (modelo original ampliamente usado) | Modelo de referencia creado por Impira; misma model card |
| `microsoft/layoutlmv3-base` | ~133M | 512 tokens (típico en LayoutLMv3) | MIT | Hugging Face | Añade parches de imagen además de layout; requiere *fine-tuning* para QA |
| `naver-clova-ix/donut-base` | ~200M | No disponible | MIT | Hugging Face | Modelo *end-to-end* OCR-free para comprensión de documentos; alternativa sin pipeline OCR separado |

La comparación cuantitativa de rendimiento no está disponible porque ninguno de los modelos citados incluye en esta información métricas comparables sobre DocVQA o SQuAD 2.0.

## Limitaciones y advertencias

- El repositorio tiene cero descargas y cero *likes*, y la model card es una copia literal de la del modelo `impira/layoutlm-document-qa`; no hay evidencia de que los pesos hayan sido verificados o reproducidos de forma independiente. Para producción, es más prudente usar el modelo original de Impira.
- El modelo solo soporta inglés según los metadatos; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Es un modelo extractivo: no genera respuestas libres, solo selecciona fragmentos del documento. No puede razonar, resumir ni responder preguntas que requieran inferencia más allá del texto presente.
- La calidad depende críticamente del OCR previo (pytesseract); documentos con baja resolución, rotaciones o fuentes no estándar degradarán el rendimiento.
- Riesgo de alucinación estructural: al ser extractivo, no inventa texto, pero puede seleccionar un fragmento incorrecto con alta confianza si el layout es ambiguo o el documento tiene una estructura atípica.
- No se documentan sesgos específicos, pero al entrenarse sobre SQuAD 2.0 y DocVQA hereda los sesgos de dominio de esos conjuntos (documentos en inglés, mayoritariamente de tipo administrativo y financiero).
- La licencia MIT permite uso comercial sin restricciones, pero al ser una réplica no verificada, el usuario asume el riesgo de que los pesos no correspondan exactamente al modelo original.
- No se especifica la longitud máxima de contexto; si se hereda el límite de 512 tokens de LayoutLM, los documentos largos requerirán segmentación previa, lo que puede romper la coherencia de campos que abarcan varias páginas.
- No hay soporte documentado de *tool calling*, agentes ni modos de razonamiento multi-paso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sony3021919/layoutlm-document-qa
- Modelo original de Impira: https://huggingface.co/impira/layoutlm-document-qa
- Paper de LayoutLM: https://aka.ms/layoutlm
- Dataset DocVQA: https://www.docvqa.org/
- Dataset SQuAD 2.0: https://huggingface.co/datasets/squad_v2
- PR de Transformers que introduce el pipeline: https://github.com/huggingface/transformers/pull/18407
- PR complementario: https://github.com/huggingface/transformers/pull/18414
- Documentación de Transformers sobre document question answering: https://huggingface.co/docs/transformers/index
- Documentación de Swarms sobre LayoutLMDocumentQA: http://go/v1/AUDO_Xp2qSoxav6QnAGvf4qAfVER5XiB33aVGjctg0KJwGLi78h4JxoUs2fDoKvVOJx2vEzsrEeRTs1SBa5bVFI-p-ylTxkk3AUfNkvg0oWXYorvNejjmB2miVIvGib9fIKP68SVZ9Dsabjz6xFz-EEYgeDtT9D5iosfaLTRoiIrP0yvAiylp5UFSgQ2PKmwB3H9KtmqDnE_kfKcOGC3Y_6yIHv9yHeRyZzj7cWycblGXdKBHdMD
- Web de Impira: https://www.impira.com/

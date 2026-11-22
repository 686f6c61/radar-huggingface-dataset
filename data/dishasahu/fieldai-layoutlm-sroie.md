# dishasahu/fieldai-layoutlm-sroie

## Resumen

`dishasahu/fieldai-layoutlm-sroie` es un modelo de clasificación de tokens (token classification) basado en LayoutLM, la arquitectura de Microsoft Research que combina información textual con la disposición espacial de los documentos. El autor del repositorio es el usuario de Hugging Face `dishasahu`, y el nombre del modelo sugiere un ajuste fino sobre el conjunto de datos SROIE (Scanned Receipts OCR and Information Extraction), una tarea clásica de extracción de campos en recibos escaneados.

El modelo cuenta con 112.634.889 parámetros (aproximadamente 112,6 millones), lo que lo sitúa en la gama de los modelos BERT-base, con pesos almacenados en formato safetensors y un tamaño de repositorio de 0,5 GB. Está etiquetado con `transformers`, `layoutlm`, `token-classification` y es compatible con endpoints de Hugging Face, lo que facilita su despliegue mediante la Inference API.

La relevancia de este modelo es limitada pero concreta: sirve como ejemplo de ajuste fino de LayoutLM para extracción de información estructurada en documentos, un caso de uso muy demandado en digitalización de facturas y recibos. No obstante, la model card está prácticamente vacía (generada automáticamente sin completar), no se declara licencia ni idiomas, y no hay métricas publicadas, por lo que su uso en producción requiere validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LayoutLM (transformer con embeddings de layout 2D) |
| Parametros totales | 112.634.889 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (LayoutLM base usa típicamente 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LayoutLM es un transformer basado en BERT que añade embeddings de posición 2D (coordenadas de bounding box) a los embeddings de texto, de modo que el modelo aprende a relacionar el contenido textual con su ubicación espacial en la página. El paper original (arXiv:1910.09700) describe el preentrenamiento sobre documentos escaneados con OCR, y el modelo base típico tiene 12 capas y unos 113 millones de parámetros, coherente con el recuento de safetensors de este repositorio.

No se dispone de información sobre el procedimiento de ajuste fino: la model card no especifica el conjunto de datos exacto, el número de épocas, la tasa de aprendizaje, si hubo aumento de datos ni qué esquema de etiquetado (BIO/BILOU) se empleó para SROIE. Tampoco se documenta si se congelaron capas durante el ajuste ni qué precisión (fp32, fp16) se usó en el entrenamiento. Toda esta información figura como "More Information Needed" en la model card original.

## Capacidades

- Clasificación de tokens a nivel de token para extracción de entidades en documentos (token-classification).
- Extracción de campos estructurados en recibos escaneados (empresa, fecha, dirección, total), asumiendo que el ajuste fino siguió el esquema habitual de SROIE.
- Procesamiento de texto junto con coordenadas de bounding box (layout), lo que permite aprovechar la disposición espacial del documento.
- Integración con la librería `transformers` mediante `AutoModelForTokenClassification` y `AutoTokenizer`.
- Compatibilidad con endpoints de inferencia de Hugging Face.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni modo thinking.
- Capacidades multilingües: no disponibles (no declaradas).

## Casos de uso

- Extracción de campos en digitalización de recibos: el modelo puede etiquetar tokens como empresa, fecha, dirección o total en imágenes de tickets procesadas previamente con OCR, siempre que se le proporcionen las bounding boxes de cada palabra.
- Automatización de contabilidad de gastos: integrado en un pipeline OCR + LayoutLM, permite poblar bases de datos de gastos a partir de fotos de recibos de empleados.
- Procesamiento de facturas simples: aunque el ajuste parece orientado a SROIE (recibos), el esquema de etiquetado puede adaptarse a facturas con estructura similar tras un reajuste fino adicional.
- Prototipado rápido de extracción documental: al ser un modelo pequeño (0,5 GB) y compatible con endpoints, sirve para validar ideas de extracción de información antes de invertir en modelos mayores.
- Investigación académica sobre LayoutLM: útil como punto de partida reproducible para comparar variantes de ajuste fino en tareas de IE documental.
- Pipeline de enriquecimiento de archivos históricos digitalizados: con un reajuste fino sobre el dominio, podría extraer metadatos de documentos escaneados con estructura repetitiva.
- Demostraciones educativas: por su tamaño reducido, es adecuado para enseñar cómo funcionan los modelos con conciencia de layout en tutoriales y cursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (112,6 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 2 GB.
- VRAM estimada en fp16: aproximadamente 0,23 GB para pesos, con un total práctico por debajo de 1,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, RTX 2080, etc.); también funciona en CPU para volúmenes moderados.
- Cabe holgadamente en GPU consumer e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con PyTorch, `pipelines` de Hugging Face, endpoints de inferencia del Hub, ONNX Runtime y TorchScript. No se documenta soporte explícito para vLLM, llama.cpp, Ollama ni TGI (no es un modelo generativo, por lo que estas herramientas no aplican de forma habitual).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dishasahu/fieldai-layoutlm-sroie | 112,6 M | no disponible | Token classification documental | no disponible | Hugging Face |
| microsoft/layoutlm-base-uncased | ~113 M | 512 tokens | Modelo base LayoutLM | MIT (según el repo original) | Hugging Face |
| microsoft/layoutlmv2-base-uncased | ~113 M | 512 tokens | Modelo base LayoutLMv2 (multimodal) | MIT (según el repo original) | Hugging Face |
| impira/layoutlm-invoices | ~113 M | 512 tokens | Extracción en facturas | no disponible | Hugging Face |

La comparación se limita a arquitecturas LayoutLM de tamaño similar; no se dispone de métricas comparativas de rendimiento para este ajuste concreto.

## Limitaciones y advertencias

- La model card está vacía: no se documentan datos de entrenamiento, hiperparámetros ni evaluación, lo que impide reproducir o auditar el ajuste.
- No se declara licencia, por lo que el uso comercial es jurídicamente incierto y requiere contactar con el autor.
- No se declaran idiomas soportados; SROIE es un conjunto en inglés, por lo que el rendimiento en castellano es desconocido y probablemente deficiente sin reajuste.
- Riesgo de alucinación y errores de etiquetado en documentos con layouts atípicos, OCR ruidoso o campos no vistos durante el entrenamiento.
- El modelo depende críticamente de la calidad de las bounding boxes proporcionadas por el OCR; errores en coordenadas degradan la extracción.
- No es un modelo generativo: no puede responder preguntas ni generar texto, solo etiquetar tokens.
- Con 0 descargas y 0 likes, no hay evidencia de uso en producción ni validación comunitaria.
- El identificador "fieldai" en el nombre no está explicado en la documentación.
- Para producción, se recomienda validar con un conjunto propio y considerar modelos más recientes (LayoutLMv2, LayoutLMv3, Donut) si se requiere mayor precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dishasahu/fieldai-layoutlm-sroie
- Paper de LayoutLM: https://arxiv.org/abs/1910.09700
- Repositorio de LayoutLM en GitHub (Microsoft): https://github.com/microsoft/unilm/tree/master/layoutlm
- Modelo base de referencia: https://huggingface.co/microsoft/layoutlm-base-uncased
- Conjunto de datos SROIE (referencia habitual): https://huggingface.co/datasets/darentang/sroie
- Documentación de `transformers` para token classification: https://huggingface.co/docs/transformers/tasks/token_classification

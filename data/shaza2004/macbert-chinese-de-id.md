# Shaza2004/MacBERT-Chinese-de-id

## Resumen

MacBERT-Chinese-de-id es un checkpoint de ajuste fino (fine-tuning) del encoder `hfl/chinese-macbert-base` para la tarea de desidentificación (de-identification) de entidades sensibles en texto en chino. Lo publica el usuario Shaza2004 en Hugging Face y está pensado para detectar y enmascarar información personal identificable (PII) en documentos en chino, una tarea crítica en entornos sanitarios, legales o de publicación de datos.

El modelo no es un generador de texto: es un encoder BERT-like (MacBERT) al que se le ha añadido una cabeza de extracción de entidades basada en la clase `GlobalPointer`, un mecanismo de decodificación de spans que modela los límites inicio-fin de cada entidad como una matriz y evita la ambigüedad típica de los esquemas BIO. El checkpoint publicado corresponde a la mejor época de validación (época 12), con una F1 de desarrollo de 0,9617, una precisión de 0,9403 y un recall de 0,9842.

Es relevante ahora porque la desidentificación automática de PII en chino sigue siendo un cuello de botella para cumplir normativas de protección de datos en corpus clínicos y administrativos, y porque el uso de GlobalPointer sobre un encoder chino preentrenado ofrece una alternativa ligera (0,4 GB de repo) frente a soluciones basadas en LLM de mayor coste. El repositorio es de tamaño reducido y no incluye pipeline declarado, licencia ni idiomas en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MacBERT-base) con cabeza de extraccion de spans GlobalPointer |
| Parametros totales | no disponible (encoder base MacBERT-base, ~102 M habituales; el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el autor no la declara; MacBERT-base usa posiciones absolutas de 512 tokens) |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch state dict, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | chino (el autor no declara lista formal de idiomas) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (`model.pt`), cargado con `torch.load(..., weights_only=True)` |

## Arquitectura y entrenamiento

El modelo parte de `hfl/chinese-macbert-base`, un encoder transformer de tipo BERT entrenado con la estrategia MacBERT (masked language modeling con corrección de errores mediante sustitución por palabras similares en lugar de tokens `[MASK]`). Sobre ese encoder se añade una capa `GlobalPointer`, que reformula la extracción de entidades como un problema de emparejamiento de spans: para cada tipo de entidad se aprende una matriz de puntuaciones inicio-fin y se decodifican los spans con puntuación superior a un umbral. Este enfoque elimina la necesidad de un esquema de etiquetado BIO y reduce errores en entidades anidadas o de longitud variable.

El autor no detalla en la model card el volumen de datos de entrenamiento, la composición del corpus, ni si hubo aumento de datos o técnicas de regularización específicas. Sí se publican las métricas de la mejor época de validación (época 12): pérdida de entrenamiento 0,02336, pérdida de validación 0,03234, precisión 0,9403, recall 0,9842 y F1 0,9617. El checkpoint se distribuye como `state dict` de PyTorch, lo que implica que el usuario debe redefinir la clase `GlobalPointer` en su propio código para poder cargarlo; no se incluye un `AutoModel` estándar de Hugging Face ni un `pipeline` declarado.

## Capacidades

- Detección y extracción de spans de entidades sensibles (PII) en texto en chino mediante la cabeza GlobalPointer.
- Desidentificación de documentos: identificación de nombres, identificadores y otras entidades personales para su enmascaramiento o sustitución.
- Extracción de entidades basada en límites inicio-fin, robusta ante entidades de longitud variable y potencialmente anidadas.
- Procesamiento de texto a nivel de encoder (no generativo): no produce texto libre, solo etiquetas de span.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo de extracción, no de razonamiento).
- Capacidades multilingües: no declaradas; el encoder base es específico de chino.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Desidentificación de informes clínicos en chino: el modelo detecta spans de PII (nombres de pacientes, identificadores) para enmascararlos antes de compartir corpus con investigadores, aprovechando su F1 de desarrollo de 0,9617 y su alto recall (0,9842), que prioriza no dejar PII sin detectar.
- Anonimización de documentos legales o administrativos: integrado en un pipeline de preprocesado que sustituye entidades detectadas por tokens genéricos antes de la publicación o el archivado.
- Construcción de datasets de investigación conformes: uso como paso previo a la liberación de corpus en chino, reduciendo el riesgo de filtración de datos personales.
- Preprocesado para entrenamiento de modelos: eliminación de PII en grandes volúmenes de texto antes de usarlos como datos de entrenamiento, con un coste de inferencia bajo al ser un encoder de ~0,4 GB.
- Auditoría de privacidad: ejecución sobre corpus existentes para medir la presencia de PII y generar informes de exposición.
- Etiquetado asistido: uso del modelo para preanotar spans de entidades y acelerar la revisión humana en proyectos de anotación de PII en chino.
- Filtrado en pipelines de ingesta documental: descarte o cuarentena de documentos que contengan PII antes de almacenarlos en sistemas compartidos.

## Benchmarks y rendimiento

| Metrica | Valor (mejor época de validacion, época 12) |
|---|---|
| Train loss | 0,02336 |
| Dev loss | 0,03234 |
| Precision (dev) | 0,9403 |
| Recall (dev) | 0,9842 |
| F1 (dev) | 0,9617 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos similares en la información disponible. Las métricas anteriores son de validación interna del autor y no permiten una comparación directa con otros sistemas de desidentificación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un encoder base (~0,4 GB de repo en precisión completa), la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para lotes pequeños; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, así como en CPU para volúmenes moderados.
- Opciones de despliegue: al ser un `state dict` personalizado con clase `GlobalPointer`, requiere cargar el modelo en PyTorch con la clase definida por el usuario; no hay integración directa con vLLM, llama.cpp, Ollama o TGI publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de desidentificación en chino ni con alternativas basadas en NER estándar (por ejemplo, variantes de BERT-Chinese con cabezas CRF o GlobalPointer), por lo que no es posible establecer una comparativa rigurosa con datos.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial; es imprescindible contactar con el autor o asumir ausencia de permisos explícitos antes de usarlo en producción.
- Checkpoint no estándar: requiere redefinir la clase `GlobalPointer` en el código del usuario; no funciona con `AutoModel.from_pretrained` directamente.
- Sin pipeline ni tokenizer empaquetado de forma estándar: el autor indica que el repo contiene tokenizer y mapeo de etiquetas, pero no se detalla su formato ni su compatibilidad con `transformers`.
- Métricas solo de validación interna: no hay evaluación en test independiente ni comparación con otros sistemas, por lo que el F1 de 0,9617 puede no generalizar a dominios distintos.
- Riesgo de falsos negativos en PII atípica: aunque el recall es alto (0,9842), un 1,6 % de entidades no detectadas en validación implica que no debe usarse como única barrera de privacidad sin revisión humana.
- Sesgos y cobertura: al no declararse la composición del corpus de entrenamiento, se desconoce la cobertura de tipos de entidad, dominios y variantes dialectales del chino.
- Sin soporte declarado de otros idiomas: el encoder base es específico de chino; su uso en textos mixtos o en otros idiomas no está validado.
- Sin cuantizaciones publicadas: no hay versiones GGUF/ONNX, lo que limita el despliegue en entornos sin PyTorch.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de spans espurios (falsos positivos) que enmascaren texto legítimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shaza2004/MacBERT-Chinese-de-id
- Encoder base: https://huggingface.co/hfl/chinese-macbert-base
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.

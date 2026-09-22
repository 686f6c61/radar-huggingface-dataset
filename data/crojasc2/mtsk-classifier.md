# crojasc2/mtsk-classifier

## Resumen

El MTSK-Classifier es un modelo de clasificación de texto desarrollado por crojasc2 que asigna artículos científicos sobre la Teoría del Conocimiento Especializado del Profesor de Matemáticas (MTSK) a una de cinco categorías temáticas (T1 a T5). El modelo parte del encoder multilingüe `intfloat/multilingual-e5-large` y añade una cabeza de clasificación propia compuesta por dropout de 0,3 y una capa lineal, dando un total de 559.890.432 parámetros según los pesos en safetensors publicados en el repositorio.

Se trata de un modelo de nicho, orientado a la investigación en didáctica de las matemáticas y a la revisión sistemática de literatura, no a tareas generales de generación. Su relevancia radica en que automatiza una tarea de cribado bibliográfico que normalmente se realiza de forma manual, con métricas declaradas de F1 macro de 0,7776 y accuracy de 0,7966 sobre el conjunto de validación, e incluye análisis SHAP para interpretar las decisiones de clasificación.

El entrenamiento se realizó sobre un corpus reducido de 293 artículos en español y portugués procedentes del Congreso Internacional MTSK (CIMTSK) y de revistas especializadas, con un reparto 80/20 entre entrenamiento y validación. El modelo se distribuye bajo licencia MIT y su uso requiere incluir el prefijo `query: ` en el texto de entrada, tal como exige la familia E5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large, base `intfloat/multilingual-e5-large`) con cabeza de clasificación personalizada: Dropout=0.3 + Linear |
| Parametros totales | 559.890.432 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens en el modelo base; el ejemplo de uso de la model card trunca a 128 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en precisión completa en safetensors) |
| Idiomas soportados | es, pt |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repo: 2,3 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo XLM-RoBERTa-large (familia BERT multilingüe) con 559.890.432 parámetros, reutilizado desde `intfloat/multilingual-e5-large`. Sobre la representación del token de clasificación se añade una cabeza específica formada por dropout con probabilidad 0,3 y una capa lineal que proyecta a las cinco clases temáticas del MTSK. El texto de entrada debe construirse con el prefijo `query: ` seguido de título, resumen y palabras clave, y se trunca a 128 tokens en el ejemplo proporcionado por el autor.

Los datos de entrenamiento son 293 artículos científicos en español y portugués, procedentes del Congreso Internacional MTSK (CIMTSK) y de revistas especializadas, divididos en 80 % entrenamiento y 20 % validación. No se documenta en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de ajuste adicionales como RLHF o DPO; tampoco se menciona ninguna innovación arquitectónica más allá de la cabeza de clasificación. El autor sí documenta el uso de análisis SHAP para explicar qué tokens resultan más relevantes en cada clase, y fija la semilla SEED=7 en los experimentos reportados.

## Capacidades

- Clasificación de texto en cinco categorías temáticas del MTSK: T1 (formación inicial de profesores), T2 (formación de formadores), T3 (MTSK en diferentes tópicos y niveles), T4 (desarrollo del MTSK) y T5 (extensiones del MTSK).
- Procesamiento de textos académicos multilingües limitados a español y portugués.
- Manejo de entradas compuestas por título, resumen y palabras clave concatenados en una única secuencia.
- Interpretabilidad mediante análisis SHAP, con identificación de los tokens más relevantes por clase.
- No dispone de generación de texto, razonamiento multi-paso, tool calling, function calling, capacidades de agente, visión ni audio: es un clasificador de secuencias puro.
- No se documentan capacidades de decodificación especulativa ni de atención lineal, al ser un encoder bidireccional estándar.

## Casos de uso

- Cribado bibliográfico en revisiones sistemáticas: el modelo permite clasificar automáticamente cientos de resúmenes de artículos sobre MTSK en las cinco categorías temáticas, reduciendo el trabajo manual de asignación previa a la lectura completa.
- Catalogación de actas de congreso: integrado en el flujo de publicación del CIMTSK, puede etiquetar cada contribución por temática para construir índices y sesiones temáticas coherentes.
- Construcción de repositorios temáticos: alimentar un buscador o una base de datos académica que filtre artículos por categoría MTSK sin intervención humana.
- Análisis bibliométrico: cuantificar la evolución temporal de cada categoría (por ejemplo, el auge de T5 frente a T1) cruzando las predicciones con metadatos de año y revista.
- Apoyo a la revisión por pares: sugerir un área temática al comité editorial para asignar revisores con la especialidad adecuada.
- Anotación asistida para nuevos corpus: preetiquetar grandes volúmenes de textos en español y portugués para que un experto humano solo valide o corrija, acelerando la creación de datasets etiquetados.
- Análisis interpretativo con SHAP: apoyar estudios metodológicos sobre qué términos lingüísticos caracterizan cada categoría temática del MTSK.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (métricas sobre el conjunto de validación, no verificadas de forma independiente):

| Tarea | Metrica | Valor | Verificado |
|---|---|---|---|
| text-classification | F1 macro | 0,7776 | No |
| text-classification | Accuracy | 0,7966 | No |

Semilla utilizada en el experimento: SEED=7. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros clasificadores.

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 2,24 GB en fp32 (coincide con el tamaño de 2,3 GB del repositorio), unos 1,12 GB en fp16/bf16 y unos 0,56 GB en int8.
- VRAM estimada para inferencia: en torno a 1,5-2 GB en fp16 y 3 GB en fp32, incluyendo activaciones para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; sirven desde una GTX 1650 o RTX 3050 hasta una RTX 4090, A100 o H100. No requiere GPU de centro de datos.
- Cabe holgadamente en GPU de consumo: sí, en cualquier modelo con 4 GB o más de VRAM.
- Inferencia en CPU: viable por el tamaño del modelo, aunque con mayor latencia que en GPU.
- Opciones de despliegue: `transformers` (AutoTokenizer y AutoModel con la cabeza de clasificación), exportación a ONNX u ONNX Runtime, Optimum, TorchScript y despliegue con Hugging Face Text Generation Inference no aplica aquí; se recomienda un servidor HTTP propio (por ejemplo FastAPI) o Text Embeddings Inference adaptado a clasificación. No se documenta soporte específico en vLLM, llama.cpp u Ollama, ya que no hay pesos GGUF publicados.
- Latencia y throughput: no se han publicado mediciones en la información disponible.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos en la información proporcionada. La siguiente tabla recoge únicamente diferencias estructurales conocidas entre alternativas de la misma categoría (clasificación de texto en español o multilingüe); la columna de rendimiento se deja como no disponible.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| crojasc2/mtsk-classifier | 559.890.432 | 512 tokens (uso a 128) | es, pt | MIT | F1 0,7776 / Acc 0,7966 (validación propia) |
| BETO (dccuchile/bert-base-spanish-wwm-uncased) | 110 millones | 512 tokens | es | Apache 2.0 | No disponible |
| RoBERTuito (pysentimiento/robertuito-base-uncased) | 125 millones | 512 tokens | es | MIT | No disponible |
| intfloat/multilingual-e5-large sin cabeza ajustada | 560 millones | 512 tokens | multilingüe | MIT | No aplica (modelo de embeddings, no clasificador) |

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido: 293 artículos, lo que deja aproximadamente 234 ejemplos de entrenamiento para cinco clases. Es probable un alto riesgo de sobreajuste y una capacidad de generalización limitada fuera del dominio del CIMTSK.
- Las métricas reportadas (F1 macro 0,7776, accuracy 0,7966) proceden únicamente del conjunto de validación y están marcadas como no verificadas. No hay conjunto de test independiente ni validación cruzada documentada.
- Sesgo de fuente: los datos provienen de un único congreso y de un conjunto acotado de revistas, por lo que el modelo puede no representar la producción científica sobre MTSK publicada en otros foros o idiomas.
- Cobertura lingüística restringida a español y portugués; no se ha entrenado ni evaluado en otras lenguas.
- Truncamiento a 128 tokens en el ejemplo de uso: resúmenes largos o entradas con muchas palabras clave pueden perder información relevante si no se ajusta `max_length` hasta los 512 tokens que admite el modelo base.
- Riesgo de error de clasificación en clases poco representadas; no se documenta la distribución de clases ni métricas por clase (solo F1 macro agregado).
- El modelo no genera texto, por lo que no hay riesgo de alucinación en el sentido generativo, pero sí de etiquetado incorrecto silencioso.
- Requiere anteponer el prefijo `query: ` al texto; omitirlo degrada la calidad de las representaciones, ya que el modelo base E5 fue entrenado con ese esquema.
- Licencia MIT: permite uso comercial y modificación, pero el autor solicita citar el trabajo académico asociado en contextos de investigación.
- Fecha de creación del repositorio posterior a la fecha de los resultados de búsqueda; conviene verificar el estado actual del repositorio antes de desplegarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/crojasc2/mtsk-classifier
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large
- Cita indicada por el autor: Rojas Celis, C. & Elorreaga, L.M. (2025). *Clasificador interpretativo para trabajos sobre MTSK usando modelos LLMs*. Universidad El Bosque, Maestría en Estadística Aplicada y Ciencia de Datos.
- Paper, repositorio de código, demo o documentación SHAP: no disponibles en la información proporcionada. Los resultados de la búsqueda web no contenían enlaces relevantes al modelo.

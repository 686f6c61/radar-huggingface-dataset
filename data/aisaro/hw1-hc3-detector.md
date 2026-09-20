# aisaro/hw1-hc3-detector

## Resumen

El modelo `aisaro/hw1-hc3-detector` es un clasificador binario de texto que distingue respuestas escritas por personas (etiqueta 0) de respuestas generadas por ChatGPT (etiqueta 1). Lo publica el usuario aisaro en HuggingFace y su pipeline declarado es `text-classification`. Parte de `sentence-transformers/all-MiniLM-L6-v2`, un encoder transformer de 6 capas y 22.713.986 parámetros, al que se ha añadido una cabeza de clasificación de secuencia y se ha ajustado sobre el corpus HC3 en inglés (Hello-SimpleAI/HC3).

Se trata de un modelo de investigación, sin licencia declarada, sin idiomas declarados y con cero descargas y cero "likes" en el momento de la consulta, por lo que su relevancia es la de un artefacto docente o experimental (el propio nombre, "hw1", sugiere un trabajo de clase) y no la de una herramienta lista para producción. Su interés técnico está en la mejora reportada respecto a la línea base: 0,9925 de exactitud en test frente a 0,8449 de una regresión logística sobre embeddings congelados.

Conceptualmente pertenece a la familia de detectores de texto generado por IA, un área con demanda creciente en verificación académica y curación de datos, pero también con problemas conocidos de generalización: el modelo está entrenado contra un único generador (ChatGPT) y un único corpus, por lo que su fiabilidad fuera de ese dominio no está garantizada ni documentada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (tipo BERT/MiniLM); modelo base `sentence-transformers/all-MiniLM-L6-v2` con cabeza de clasificación de secuencia para 2 clases |
| Parámetros totales | 22.713.986 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base all-MiniLM-L6-v2 documenta un máximo de 256 tokens |
| Tipos de cuantización | no disponible (no se publican variantes cuantizadas; al ser un encoder de 22,7 M de parámetros admite FP16/INT8 con herramientas estándar) |
| Idiomas soportados | no disponible; el entrenamiento declarado es sobre HC3 en inglés, por lo que el uso fiable se limita al inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors (etiqueta `safetensors`), cargable con transformers/PyTorch |
| Tamaño del repositorio | 0,1 GB |
| Pipeline declarado | text-classification |
| Etiquetas de salida | 0 = humano, 1 = ChatGPT |
| Fecha de creación (metadatos) | 2026-09-20 |
| Última actualización (metadatos) | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer encoder de tipo MiniLM con 6 capas, dimensión oculta de 384, 12 cabezas de atención y aproximadamente 22,7 millones de parámetros, originalmente optimizado por sentence-transformers para generar embeddings de frases. El ajuste convierte ese encoder en un clasificador: se superpone una cabeza de clasificación y se entrena de extremo a extremo para predecir una de dos clases. Los detalles concretos de la cabeza (pooling utilizado, capas de dropout) no se especifican en la model card.

El entrenamiento reportado consiste en 5 épocas con el optimizador AdamW y una tasa de aprendizaje de 2e-5 sobre el split de entrenamiento del dataset HC3 en inglés, que contiene pares de pregunta-respuesta con respuestas humanas y respuestas generadas por ChatGPT. No se documenta el número de tokens, el tamaño del lote, la composición exacta del dataset ni el proceso de selección del checkpoint. Tampoco hay indicios de RLHF, DPO ni ajuste por preferencias: es aprendizaje supervisado convencional. La innovación técnica es mínima por diseño; el interés está en la comparación con una línea base congelada.

## Capacidades

- Clasificación binaria de texto en inglés: devuelve 0 (humano) o 1 (ChatGPT) para una respuesta dada.
- Detección de texto generado por ChatGPT en el dominio de HC3 (pares pregunta-respuesta).
- Optimización para eficiencia: 22,7 M de parámetros permiten inferencia en CPU y en GPUs muy modestas.
- Integración con el ecosistema transformers: `pipeline("text-classification")`, `AutoModelForSequenceClassification`.
- Compatible con Text Embeddings Inference (etiqueta `text-embeddings-inference`) y con endpoints compatibles.
- No soporta generación de texto.
- No soporta tool calling ni function calling.
- No soporta flujos de agente ni razonamiento multi-paso.
- No hay capacidades multilingües declaradas.
- No hay modo "thinking", visión ni audio.
- No se declara capacidad de embedding reutilizable una vez reajustado para clasificación.

## Casos de uso

- Curación de corpus de entrenamiento: filtrar grandes volúmenes de respuestas scrapeadas para separar respuestas humanas de las generadas por ChatGPT antes de usar el conjunto en un ajuste supervisado. Aprovecha el bajo coste por inferencia del encoder.
- Auditoría de tareas académicas en inglés: señalizar entregas sospechosas de haber sido generadas con ChatGPT para revisión manual posterior, nunca como decisión automática, dada la falta de validación fuera de HC3.
- Control de calidad en plataformas de preguntas y respuestas: marcar respuestas que podrían haberse volcado automáticamente desde un asistente conversacional, útil para moderación asistida.
- Investigación sobre detección de texto generado por IA: servir como punto de partida reproducible para comparar estrategias de ajuste frente a una línea base con embeddings congelados (0,9925 frente a 0,8449 de exactitud).
- Evaluación de pipelines de anotación: comprobar si anotadores humanos han utilizado ChatGPT para redactar etiquetas o justificaciones en un proyecto de anotación.
- Filtrado en la ingesta de datos de un RAG: descartar documentos que provengan de volcados masivos de ChatGPT cuando se quiera primar contenido humano verificado.
- Prueba de concepto en docencia: ejemplo mínimo de fine-tuning de un encoder pequeño para clasificación de texto, con métricas comparativas explícitas.

## Benchmarks y rendimiento

Los únicos resultados publicados son los de la propia model card, medidos sobre el conjunto de test de HC3 en inglés:

| Modelo | Exactitud en test (HC3, inglés) |
|---|---|
| Línea base: embeddings congelados + regresión logística | 0,8449 |
| Ajuste fino (este modelo) | 0,9925 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y en cualquier caso no son aplicables a un clasificador de secuencia de 22,7 M de parámetros. Tampoco se documentan precisión, exhaustividad, F1, matriz de confusión ni umbral de decisión.

## Requisitos de hardware

- VRAM estimada: aproximadamente 90 MB en FP32 (22,7 M de parámetros × 4 bytes) y unos 45 MB en FP16 para los pesos. El consumo real de memoria es mayor por activaciones y framework, pero se mantiene muy por debajo de 1 GB en cualquier configuración razonable.
- GPU recomendadas: cualquiera; no requiere GPU dedicada. Funciona en GPUs de gama de entrada (GTX 1050, GTX 1650, RTX 3050) y, por supuesto, en RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en todas las GPU consumer actuales, e incluso en CPU sin GPU.
- Opciones de despliegue: `transformers` en Python, HuggingFace Inference Endpoints, Text Embeddings Inference (etiqueta declarada en el repositorio), exportación a ONNX Runtime o TorchScript, o servicio propio con FastAPI/TorchServe. No hay pesos GGUF, por lo que llama.cpp u Ollama no son aplicables; tampoco procede vLLM ni TGI en su configuración habitual para un encoder de clasificación.
- Latencia y throughput: no disponibles. No se publican mediciones y cualquier cifra dependería del hardware y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Arquitectura / tamaño | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aisaro/hw1-hc3-detector | Encoder MiniLM, 22,7 M parámetros | No disponible | 0,9925 de exactitud en test de HC3 (inglés) | No disponible | HuggingFace |
| Hello-SimpleAI/chatgpt-detector-roberta | Encoder tipo RoBERTa entrenado sobre HC3 | No disponible en la información proporcionada | No disponible | No disponible | HuggingFace |
| Detectores comerciales (GPTZero y similares) | No disponible | No disponible | No disponible | Propietaria | API de pago |

No se dispone de datos verificados de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible. La advertencia principal es que cualquier comparación de exactitud entre detectores solo es válida si se mide sobre el mismo conjunto de test y contra el mismo generador.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explícita, el uso comercial queda en una situación jurídica indeterminada. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Ámbito muy restringido: entrenado sobre HC3 en inglés y contra respuestas de ChatGPT. No hay evidencia de que funcione con otros idiomas, otros dominios (código, artículos largos, correos) ni con otros generadores (Claude, Gemini, Llama, versiones posteriores de GPT).
- Riesgo alto de degradación con texto parafraseado, traducido o editado por una persona a partir de una salida de IA.
- Riesgo de falsos positivos sobre textos humanos con estilo formulaico o muy pulido, y de falsos negativos con salidas de IA retocadas manualmente.
- Sesgos conocidos: no se documenta ninguna sección de sesgos en la model card. En esta familia de detectores existe además un riesgo documentado de penalizar a hablantes no nativos de inglés, que deben evaluarse específicamente antes de cualquier uso sobre población real.
- No se publican métricas más allá de la exactitud: se desconocen precisión, exhaustividad, F1 y el comportamiento en umbrales distintos de 0,5.
- Calibración desconocida: la probabilidad de salida no debería interpretarse como un grado fiable de certeza.
- Metadatos llamativos: las fechas de creación y actualización del repositorio aparecen en 2026, lo que sugiere un artefacto de generación automática o un error de registro; conviene no tomarlas como referencia.
- Cero adopción: cero descargas y cero "likes" en la consulta, sin issues ni validación externa conocida.
- Uso responsable: no debe emplearse como prueba concluyente de autoría en contextos académicos, laborales o legales.
- En el momento de la consulta no se ha encontrado documentación externa relevante (paper, blog o repositorio) sobre este modelo concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aisaro/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Repositorio de Hello-SimpleAI (origen del dataset HC3): https://github.com/Hello-SimpleAI/chatgpt-comparison-detection

Nota: la búsqueda web realizada no devolvió resultados relacionados con este modelo; los enlaces obtenidos correspondían a páginas de ayuda de Windows y no se incluyen por no ser pertinentes.

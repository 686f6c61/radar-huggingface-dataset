# Ransaka/sinhala-charbert

## Resumen

Sinhala-CharBERT es un modelo de lenguaje pre-entrenado para cingalés (idioma `si`), desarrollado por Ransaka Ravihara como parte de un ecosistema de herramientas de procesamiento de lenguaje natural para esta lengua. Se trata de un checkpoint de doble canal basado en la arquitectura CharBERT, que combina representaciones a nivel de carácter y de palabra, diseñado para tareas de corrección ortográfica y modelado de lenguaje enmascarado. El modelo se distribuye bajo licencia MIT y su repositorio ocupa 0,9 GB, aunque no se especifican el número de parámetros ni la longitud de contexto en la información disponible.

Este modelo es relevante porque aborda un idioma con escasos recursos computacionales, el cingalés, hablado por más de 16 millones de personas en Sri Lanka. Al ser un checkpoint pre-entrenado, puede utilizarse como base para fine-tuning en tareas como corrección de texto, análisis morfológico o generación de representaciones vectoriales. Su integración con la librería `sinlib` facilita su uso práctico, ya que los pesos y el vocabulario se descargan automáticamente desde Hugging Face Hub.

La fecha de creación indicada (septiembre de 2026) sugiere que es un modelo reciente, aunque no se dispone de documentación técnica detallada más allá de la model card. No se han publicado resultados de benchmarks ni especificaciones de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CharBERT (doble canal: caracteres + palabras) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | cingales (si) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors o binario de PyTorch, no confirmado) |

## Arquitectura y entrenamiento

La arquitectura CharBERT, propuesta originalmente por Ma et al. (2020), emplea dos canales de entrada: uno que procesa la secuencia de caracteres y otro que procesa la secuencia de subpalabras o palabras. Ambos canales se combinan mediante una atención cruzada antes de alimentar el codificador transformer. Este diseño permite capturar información morfológica a nivel de carácter, especialmente útil para lenguas con escritura alfabética compleja como el cingalés, donde las combinaciones de consonantes y vocales modificadas son frecuentes.

En el caso de este checkpoint, el autor indica que es un "pre-trained dual-channel CharBERT checkpoint (encoder + NLM head)" para cingalés, lo que implica que se entrenó con un objetivo de modelado de lenguaje enmascarado (MLM) sobre un corpus en cingalés. Sin embargo, no se proporcionan detalles sobre el tamaño del corpus, el número de pasos de entrenamiento, el optimizador utilizado ni si se aplicaron técnicas adicionales como fine-tuning con RLHF o DPO. La información disponible es insuficiente para describir con precisión el proceso de entrenamiento.

## Capacidades

- Modelado de lenguaje enmascarado (MLM) en cingalés: puede predecir tokens enmascarados en una secuencia, útil para tareas de completado y corrección.
- Representaciones contextuales de doble canal: al combinar caracteres y palabras, es adecuado para tareas que requieren sensibilidad morfológica, como la corrección ortográfica o el análisis de errores tipográficos.
- Integración con `sinlib`: el modelo se complementa con una librería que incluye tokenizador, detector de errores tipográficos y utilidades de corrección, lo que facilita su uso en pipelines de limpieza de texto.
- Fine-tuning: al ser un checkpoint pre-entrenado, puede adaptarse a tareas downstream como clasificación de texto, reconocimiento de entidades o similitud semántica, aunque no se documentan capacidades específicas de tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Corrección ortográfica automática en cingalés: el modelo, junto con `sinlib`, puede emplearse para detectar y corregir errores tipográficos en textos digitales, foros, redes sociales o documentos administrativos. Su doble canal de caracteres es especialmente útil para capturar errores a nivel de grafema.
- Preprocesamiento de corpus para NLP en cingalés: al ser un modelo pre-entrenado, puede usarse para generar representaciones vectoriales de oraciones o palabras que alimenten otros sistemas, como clasificadores de sentimiento o traductores automáticos.
- Asistente de escritura para hablantes de cingalés: integrado en editores de texto o aplicaciones móviles, puede sugerir correcciones en tiempo real mientras el usuario escribe, aprovechando su capacidad de modelado de lenguaje.
- Análisis morfológico y lematización: la representación a nivel de carácter permite estudiar la estructura interna de las palabras cingalesas, lo que puede ser útil para tareas de análisis lingüístico o generación de recursos educativos.
- Normalización de texto histórico o dialectal: el modelo puede adaptarse mediante fine-tuning para normalizar variantes ortográficas o textos antiguos, facilitando su procesamiento posterior.
- Investigación en PLN de bajos recursos: sirve como punto de partida para experimentos académicos sobre lenguas con pocos recursos, permitiendo comparar arquitecturas de doble canal frente a modelos basados únicamente en subpalabras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar, ni comparaciones con modelos similares en cingalés.

## Requisitos de hardware

- VRAM estimada: no disponible, ya que se desconocen los parámetros totales. Si se asume una arquitectura similar a CharBERT base (alrededor de 100M de parámetros), podría caber en GPUs con 8-16 GB de VRAM en cuantización de 16 bits, pero esto es una especulación no confirmada.
- GPU recomendadas: no disponible. Dado el tamaño del repositorio (0,9 GB), es probable que el modelo sea relativamente pequeño y pueda ejecutarse en GPUs de consumo como RTX 3060 o superiores, pero no hay confirmación oficial.
- Opciones de despliegue: al ser un modelo de Hugging Face, puede cargarse con la librería `transformers` de PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ransaka/sinhala-charbert | no disponible | no disponible | MIT | Hugging Face |
| Ransaka/SinhalaRoberta | 68M | no disponible | no especificada | Hugging Face |
| Otros modelos para cingalés | no disponible | no disponible | no disponible | no disponible |

SinhalaRoberta, también del mismo autor, es un modelo basado en RoBERTa con 68 millones de parámetros, entrenado para MLM en cingalés. A diferencia de CharBERT, no utiliza doble canal de caracteres, por lo que puede ser menos sensible a errores ortográficos a nivel de grafema. No se dispone de información sobre otros modelos comparables en cingalés.

## Limitaciones y advertencias

- No se dispone de documentación sobre sesgos o alucinaciones. Al ser un modelo entrenado probablemente con corpus de noticias y artículos (según se infiere de SinhalaRoberta), puede reflejar sesgos presentes en esos textos.
- La información técnica es muy limitada: se desconocen los hiperparámetros, el corpus de entrenamiento y las métricas de evaluación, lo que dificulta evaluar su calidad de forma objetiva.
- La licencia MIT permite uso comercial y modificación, pero no se especifican restricciones adicionales sobre el uso de los datos de entrenamiento.
- El modelo está diseñado exclusivamente para cingalés; no tiene capacidades multilingües.
- No se menciona soporte para tool calling, agentes o razonamiento avanzado; es un modelo de lenguaje básico orientado a tareas de representación y corrección.
- La fecha de creación (2026) es inusual y podría indicar un error en los metadatos; conviene verificar la vigencia del modelo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Ransaka/sinhala-charbert)
- [Perfil del autor en Hugging Face](https://huggingface.co/Ransaka)
- [Modelo SinhalaRoberta](https://huggingface.co/Ransaka/SinhalaRoberta)
- [Librería sinlib en PyPI](https://pypi.org/project/sinlib/)
- [Blog del autor - Proyectos](https://ransaka.github.io/Ransaka/projects/)
- [Blog del autor - CRNN para OCR en cingalés](https://ransaka.github.io/Ransaka/ransakas-blog/building-crnn-model-for-sinhala-ocr/)

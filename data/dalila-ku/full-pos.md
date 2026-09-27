# Dalila-Ku/full-pos

## Resumen

full-pos es un modelo de clasificación de tokens (token classification) publicado en HuggingFace por el usuario Dalila-Ku. Se trata de un ajuste fino (fine-tuning) del modelo google-bert/bert-base-uncased, por lo que hereda la arquitectura transformer encoder de BERT-base con atención bidireccional completa y un cabezal de clasificación por token. El repositorio declara 108.904.721 parámetros reales en formato safetensors y un tamaño de 0.4 GB, coherente con un modelo denso de escala base (encoder de 12 capas).

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo recién publicado (creado el 27 de septiembre de 2026), con cero descargas y cero "likes" en el momento de la consulta, sin model card completada y sin resultados declarados en el bloque model-index. El único dato de rendimiento disponible son las métricas de validación registradas automáticamente por el Trainer durante el entrenamiento: pérdida 0,0980, accuracy 0,9762 y F1 macro 0,9377 sobre el conjunto de evaluación.

El nombre del repositorio ("full-pos") sugiere un etiquetador morfosintáctico (part-of-speech tagging), pero esto no se confirma en ninguna parte de la documentación: la model card indica explícitamente "More information needed" tanto en la descripción del modelo como en los usos previstos y en los datos de entrenamiento. Cualquier evaluación de idoneidad para producción debe partir, por tanto, de una validación propia contra un conjunto de datos etiquetado del dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT-base) con cabezal de clasificación de tokens |
| Parametros totales | 108.904.721 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (límite de posiciones de bert-base-uncased; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en precisión completa; no hay GGUF, ONNX ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo base es bert-base-uncased, con vocabulario en inglés y sin distinción de mayúsculas; la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Pipeline declarado | token-classification |
| Modelo base | google-bert/bert-base-uncased |
| Tamaño del repositorio | 0,4 GB |
| Versiones de framework | Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5, Tokenizers 0.23.1 |

## Arquitectura y entrenamiento

La arquitectura es la de BERT-base sin modificaciones estructurales: un encoder transformer de 12 capas con atención multi-cabeza bidireccional, más un cabezal de clasificación lineal aplicado sobre la representación de cada token. El número de etiquetas de salida no se documenta, aunque el recuento de parámetros (108,9 M) es compatible con un cabezal de clasificación de tamaño reducido sobre el backbone preentrenado. Al ser un modelo de token classification, la salida es una etiqueta por token de entrada, no texto generado.

El ajuste fino se realizó con los siguientes hiperparámetros declarados por el autor: learning rate 5e-05, scheduler lineal, 4 épocas, batch de entrenamiento 32, batch de evaluación 64, semilla 42, optimizador AdamW (variante torch fused) con betas (0,9; 0,999) y epsilon 1e-08, y entrenamiento con precisión mixta nativa (Native AMP). El conjunto de datos de entrenamiento y evaluación se describe literalmente como "unknown dataset" en la model card, por lo que no se conoce su composición, tamaño, dominio, idioma ni esquema de etiquetas. Tampoco se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias, algo por otra parte esperable en un modelo discriminativo de este tipo. La evolución por épocas muestra una pérdida de entrenamiento decreciente (0,0946 → 0,0207) mientras la pérdida de validación deja de mejorar a partir de la tercera época (0,0986 → 0,1018 → 0,1077), lo que apunta a un sobreajuste leve en la última época.

## Capacidades

- Clasificación de tokens a nivel secuencial: asigna una etiqueta a cada token de la entrada, típicamente dentro de un esquema de etiquetado morfosintáctico (el nombre "full-pos" apunta a un conjunto completo de etiquetas POS, sin confirmar).
- Procesamiento de secuencias de hasta 512 tokens en una sola pasada, sin ventana deslizante nativa.
- Extracción de estructura gramatical utilizable como señal intermedia en pipelines de NLP (por ejemplo, como entrada para parsers, extractores de sintagmas o sistemas de detección de patrones).
- Inferencia por lotes: el modelo es un encoder estándar y admite batching, lo que permite procesar grandes volúmenes de texto en GPU.
- Generación de texto: no soportada (modelo encoder-only con cabezal de clasificación).
- Tool calling / function calling: no soportado.
- Comportamiento agéntico o razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponibles; el vocabulario del modelo base es uncased y de dominio inglés.
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no disponibles.
- Esquema de etiquetas: no documentado en la model card; debe leerse directamente del `config.json` del repositorio.

## Casos de uso

- Preprocesado en pipelines de NLP: usar las etiquetas POS como característica de entrada para tareas posteriores (reconocimiento de entidades, análisis sintáctico, resolución de correferencia). La ventana de 512 tokens obliga a segmentar documentos largos en fragmentos con solapamiento.
- Anotación asistida de corpus lingüísticos: el modelo puede generar un preetiquetado automático sobre corpus en inglés que después revisa un anotador humano, reduciendo el coste de construir treebanks o corpus etiquetados, siempre que se valide antes la taxonomía de etiquetas.
- Minería de opiniones basada en aspectos: extraer adjetivos y sustantivos etiquetados para localizar opiniones y sus objetivos en reseñas, con la ventaja de que el etiquetado gramatical separa el término valorado del modificador.
- Análisis de estilo y detección de autoría: la distribución de categorías gramaticales es una señal clásica de estilometría; el modelo permite calcular perfiles POS por documento a bajo coste computacional.
- Extracción de terminología en dominios técnicos o legales: identificar sintagmas nominales completos para alimentar glosarios, índices o sistemas de búsqueda documental, aprovechando la cobertura del vocabulario del modelo base.
- Control de calidad y moderación de contenido: usar patrones gramaticales (por ejemplo, secuencias anómalas de categorías) como señal complementaria en filtros de spam o de texto generado automáticamente.
- Enseñanza de idiomas y asistentes de escritura: etiquetar la categoría gramatical de cada palabra para resaltar estructuras en herramientas de aprendizaje o correctores que necesitan identificar la función de cada término.
- Enriquecimiento de índices de búsqueda: generar capas de metadatos gramaticales sobre colecciones documentales para permitir consultas que combinen coincidencia léxica y categoría gramatical.

## Benchmarks y rendimiento

El bloque model-index del repositorio está vacío (`"results": []`), por lo que el autor no declara comparaciones con otros modelos. Los únicos datos disponibles son las métricas de validación registradas por el Trainer:

| Metrica | Valor (conjunto de evaluacion) |
|---|---|
| Loss | 0,0980 |
| Accuracy | 0,9762 |
| F1 macro | 0,9377 |

Evolución por épocas durante el entrenamiento, tal como figura en la model card:

| Training loss | Epoca | Paso | Validation loss | Accuracy | F1 macro |
|---|---|---|---|---|---|
| 0,0946 | 1,0 | 392 | 0,1062 | 0,9699 | 0,9001 |
| 0,0513 | 2,0 | 784 | 0,0986 | 0,9727 | 0,9258 |
| 0,0341 | 3,0 | 1176 | 0,1018 | 0,9740 | 0,9348 |
| 0,0207 | 4,0 | 1568 | 0,1077 | 0,9743 | 0,9343 |

No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes aplicables a token classification) en la información disponible. Tampoco se especifica qué conjunto de evaluación se utilizó ni cuál es el esquema de etiquetas, por lo que estos valores no son comparables con los de otros etiquetadores POS publicados.

## Requisitos de hardware

- Huella de memoria del modelo: 108,9 M de parámetros implican aproximadamente 436 MB en FP32, 218 MB en FP16/BF16 y unos 109 MB en INT8. El repositorio ocupa 0,4 GB en disco, consistente con pesos en precisión completa.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP16, incluidas GTX 1650, RTX 3050 y superiores. Para entrenamiento o ajuste fino ligero son razonables una RTX 3060/4070; para procesamiento masivo por lotes conviene una A100, H100 o L40S por throughput agregado.
- Cabe en GPU de consumo: sí, con holgura en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida. También es viable la inferencia en CPU, con latencias del orden de milisegundos por secuencia corta y decenas de milisegundos para secuencias de 512 tokens, aunque no hay cifras medidas publicadas.
- Opciones de despliegue: transformers (pipeline `token-classification`), Text Generation Inference (TGI) y vLLM para servir el modelo como endpoint, ONNX Runtime o TorchScript para optimización, y el endpoint de HuggingFace Inference Endpoints (el repositorio está marcado como `endpoints_compatible`). No hay pesos GGUF publicados, por lo que llama.cpp y Ollama requerirían una conversión propia desde safetensors.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni configuración de referencia declarada.

## Comparativa con modelos similares

No hay datos verificados de benchmarks que permitan una comparación cuantitativa con otros etiquetadores. La tabla recoge únicamente los aspectos estructurales conocidos; las celdas marcadas como no disponibles reflejan la ausencia de datos en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| full-pos (Dalila-Ku) | 108,9 M | 512 tokens (por arquitectura base) | Apache 2.0 | Pesos safetensors en HuggingFace; 0 descargas |
| bert-base-uncased (modelo base) | ~110 M (referencia general, no verificada en la información proporcionada) | 512 tokens | Apache 2.0 | Ampliamente disponible |
| Otros etiquetadores POS sobre BERT/RoBERTa publicados en HuggingFace | no disponible | no disponible | no disponible | no disponible |

La comparación relevante, por tanto, es funcional: frente al modelo base sin ajustar, full-pos añade un cabezal de clasificación entrenado durante 4 épocas con un F1 macro de 0,9377, pero sin documentar el conjunto de evaluación ni la taxonomía de etiquetas. Cualquier alternativa debería evaluarse sobre el mismo corpus etiquetado antes de tomar una decisión de adopción.

## Limitaciones y advertencias

- Documentación insuficiente: la model card repite "More information needed" en la descripción, los usos previstos y los datos de entrenamiento y evaluación. No se puede determinar para qué fue entrenado exactamente ni con qué etiquetas.
- Conjunto de entrenamiento desconocido ("unknown dataset"): no se conoce el dominio, el idioma real, el esquema de anotación ni el equilibrio de clases, lo que impide evaluar sesgos o extrapolar a otros corpus.
- Sesgos: no disponibles explícitamente, pero al derivar de bert-base-uncased hereda los sesgos de sus corpus de preentrenamiento (texto web y libros en inglés), y el desconocimiento del dataset de ajuste impide acotarlos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de etiquetado erróneo sistemático en categorías poco representadas, no detectables sin conocer el conjunto de evaluación.
- Desequilibrio de clases: la diferencia entre accuracy (0,9762) y F1 macro (0,9377) es de casi 4 puntos, lo que sugiere que las clases minoritarias rinden por debajo de la media. Es una inferencia razonable a partir de las métricas, no un dato documentado.
- Sobreajuste leve: la pérdida de validación empeora en la cuarta época (0,1077) mientras la de entrenamiento sigue bajando (0,0207); un checkpoint de la tercera época podría generalizar mejor.
- Límite de contexto: 512 tokens por secuencia. Los documentos largos requieren segmentación y estrategia de agregación entre fragmentos.
- Idiomas: el tokenizador es uncased y de vocabulario inglés; el comportamiento en otros idiomas no está documentado ni respaldado por el fabricante.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y sin garantías. No hay restricciones adicionales declaradas.
- Madurez: cero descargas y cero "likes" en el momento de la consulta, sin validación por parte de la comunidad. No es recomendable desplegarlo en producción sin una evaluación propia contra un conjunto etiquetado del dominio objetivo.
- Ausencia de cuantizaciones publicadas: para despliegues con requisitos estrictos de memoria habría que generar versiones GGUF/ONNX y validar la pérdida de F1 resultante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dalila-Ku/full-pos
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased

Nota: la búsqueda web realizada devolvió únicamente resultados sobre el nombre propio "Dalila" (artículos enciclopédicos y de onomástica sin relación con el modelo). No se han encontrado papers, blogs, repositorios ni demos asociados a este modelo, y no existe documentación técnica adicional más allá del propio README del repositorio.

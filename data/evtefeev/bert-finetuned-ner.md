# evtefeev/bert-finetuned-ner

## Resumen

bert-finetuned-ner es un modelo de reconocimiento de entidades nombradas (NER) obtenido al ajustar google-bert/bert-base-cased sobre el corpus conll2003. Lo publica el usuario evtefeev en Hugging Face bajo licencia Apache 2.0 y con el pipeline de token-classification. Se trata, por tanto, de un encoder transformer de propósito específico: no genera texto, sino que etiqueta cada token de una secuencia con una categoría de entidad.

El modelo tiene 107.726.601 parámetros y pesos en safetensors, hereda la arquitectura de BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) y una ventana de contexto de 512 tokens, el límite impuesto por sus embeddings posicionales. El ajuste se realizó durante 3 épocas con学习 rate 2e-05, batch de 8 y optimizador AdamW fused, con semilla 42.

Su relevancia práctica es la de cualquier extractor de entidades ligero: puede ejecutarse en CPU o en GPU de gama baja con un consumo de memoria inferior a 1 GB en precisión completa, lo que lo hace apto para pipelines de anonimización, enriquecimiento de metadatos o preprocesado de corpus. Ahora bien, la model card es la generada automáticamente por el Trainer, con secciones "More information needed", sin métricas de evaluación publicadas y con 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que debe considerarse un modelo sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT), con cabeza de clasificación de tokens |
| Parámetros totales | 107.726.601 |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 512 tokens (límite posicional de bert-base-cased) |
| Tipos de cuantización | No especificados por el autor; los pesos se distribuyen en safetensors (fp32). Cuantización dinámica int8 viable vía PyTorch u ONNX Runtime |
| Idiomas soportados | No disponible. El modelo base (bert-base-cased) es de vocabulario en inglés y el corpus de ajuste (CoNLL-2003) contiene textos en inglés y alemán |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de BERT-base-cased: un transformer de solo encoder con 12 capas, 768 dimensiones de representación, 12 cabezas de atención y tokenización WordPiece sensible a mayúsculas. Sobre la salida del encoder se añade una cabeza lineal de clasificación por token que, en CoNLL-2003, produce 9 etiquetas en esquema BIO (B-PER, I-PER, B-ORG, I-ORG, B-LOC, I-LOC, B-MISC, I-MISC y O). El checkpoint se ha entrenado con la librería transformers 5.17.0, PyTorch 2.11.0+cu130, Datasets 3.6.0 y Tokenizers 0.23.2.

Los hiperparámetros declarados en la model card son: learning rate 2e-05, train_batch_size 8, eval_batch_size 8, semilla 42, optimizador AdamW (variante fused, betas 0.9/0.999, epsilon 1e-08), scheduler lineal y 3 épocas. No se documenta el número de tokens de entrenamiento, la composición del dataset más allá de la referencia a conll2003, ni si hubo etapas de ajuste adicionales como RLHF o DPO (no aplicables en un modelo discriminativo de este tipo). Tampoco se declara ninguna innovación técnica: no hay decodificación especulativa, atención lineal ni variantes de arquitectura; es un fine-tuning estándar de clasificación de tokens.

## Capacidades

- Reconocimiento de entidades nombradas sobre texto en inglés (y potencialmente alemán, dado el corpus de ajuste), con cuatro categorías: persona (PER), organización (ORG), localización (LOC) y miscelánea (MISC).
- Etiquetado a nivel de token con esquema BIO, apto para extracción de spans y para tareas derivadas de normalización y enlace de entidades.
- Procesamiento por lotes de secuencias de hasta 512 tokens, con salida de logits por token que permite aplicar umbrales de confianza propios.
- Inferencia determinista y de bajo coste: no genera texto libre, por lo que no produce alucinaciones en el sentido generativo, aunque sí puede etiquetar entidades espurias.
- No soporta tool calling ni function calling: no es un modelo conversacional ni dispone de plantilla de chat.
- No soporta razonamiento multi-paso ni flujos de agente; su salida es una clasificación estática por token.
- No dispone de modo thinking, capacidades de visión ni de audio.
- Capacidad multilingüe: no declarada por el autor; limitada por el vocabulario en inglés de bert-base-cased.

## Casos de uso

- Anonimización y seudonimización de documentos: el modelo permite localizar nombres de personas y organizaciones antes de aplicar una sustitución o un hash, lo que resulta útil en pipelines de cumplimiento de protección de datos sobre textos en inglés.
- Enriquecimiento de bases de conocimiento: extracción de menciones de PER, ORG y LOC de artículos para poblar un grafo de conocimiento, con enlace posterior a Wikidata o a un diccionario interno.
- Preprocesado para sistemas RAG: etiquetar entidades en los fragmentos recuperados para construir filtros de metadatos (por ejemplo, restringir la búsqueda a documentos que mencionen una organización concreta).
- Análisis de noticias y monitorización de marcas: detección sistemática de organizaciones y localizaciones en flujos de prensa para estudios de cobertura mediática o alertas tempranas.
- Indexación de archivos históricos y jurídicos: extracción de partes implicadas, jurisdicciones y organismos en expedientes digitalizados, con revisión humana posterior sobre las etiquetas de baja confianza.
- Etiquetado asistido (preanotación): generar candidatos de entidades para que un anotador humano los corrija en herramientas como Label Studio o doccano, reduciendo el coste de construcción de un corpus propio.
- Limpieza de corpus para entrenamiento: eliminar o enmascarar entidades identificativas antes de reutilizar un dataset textual en otros proyectos.
- Procesamiento en el borde o en local: al requerir menos de 1 GB de memoria, puede desplegarse en portátiles o en nodos sin GPU para clasificar documentos sensibles sin enviarlos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El bloque model-index de la model card contiene una lista de resultados vacía y la sección "Training results" también está vacía, por lo que no existen cifras de F1, precisión o recall sobre el conjunto de test de CoNLL-2003, ni comparaciones con otros sistemas. No se han inventado valores en esta ficha.

| Benchmark | Resultado |
|---|---|
| CoNLL-2003 (test) | no disponible |
| MMLU / HumanEval / GSM8K | no aplicable (modelo discriminativo de clasificación de tokens) |

## Requisitos de hardware

- Peso de los pesos: aproximadamente 430 MB en fp32, unos 215 MB en fp16/bf16 y unos 108 MB en int8, partiendo de los 107,7 millones de parámetros.
- VRAM estimada para inferencia: entre 0,5 GB y 2 GB en función del tamaño de lote y de la longitud de secuencia; con batch pequeño cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; para producción con alto volumen, una T4, L4, A10 o L40S es más que suficiente. Una A100 o H100 resulta sobredimensionada para este tamaño de modelo y solo se justifica por agregación de carga.
- GPU de consumo: sí, cabe en tarjetas como GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4060 o superiores. También funciona en CPU, con latencias mayores.
- Opciones de despliegue: pipeline de transformers, Hugging Face Inference Endpoints (el repositorio está marcado como endpoints_compatible), ONNX Runtime u Optimum para exportación y cuantización, TorchScript, NVIDIA Triton Inference Server y servicios propios con FastAPI. llama.cpp y Ollama no cubren de forma estándar la clasificación de tokens con BERT, por lo que no se recomiendan como vía de despliegue.
- Latencia y throughput: no disponible. No hay mediciones publicadas por el autor; a modo orientativo, un encoder de 110 millones de parámetros procesa secuencias de 512 tokens en el orden de milisegundos por lote en GPU moderna, pero esta cifra no está verificada y debe medirse en el entorno de destino.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| evtefeev/bert-finetuned-ner | 107,7 M | 512 tokens | NER (CoNLL-2003, 4 tipos) | Apache 2.0 | Sin métricas publicadas, 0 descargas |
| google-bert/bert-base-cased | 108,3 M aprox. | 512 tokens | Modelo base (MLM) | Apache 2.0 | No realiza NER sin ajuste adicional; es el punto de partida de este modelo |
| dslim/bert-base-NER | 107,7 M aprox. | 512 tokens | NER (CoNLL-2003, 4 tipos) | No verificada en la información disponible | Alternativa ampliamente utilizada con la misma base y el mismo corpus; su evaluación pública no se ha consultado aquí |
| Modelos de NER basados en roberta-large | 355 M aprox. | 512 tokens | NER en inglés | No verificada en la información disponible | Mayor capacidad a cambio de más memoria y latencia |

La comparación cuantitativa de rendimiento no es posible: no hay resultados publicados para este checkpoint ni se han recogido métricas verificadas de las alternativas en la información disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card no reporta ninguna métrica y el bloque model-index está vacío, por lo que no hay evidencia pública de calidad sobre el conjunto de test de CoNLL-2003.
- Model card incompleta: las secciones de descripción, usos previstos y datos de entrenamiento contienen literalmente "More information needed"; no se detalla la composición del dataset ni el preprocesado.
- Cobertura de entidades restringida: solo cuatro tipos (PER, ORG, LOC, MISC) en esquema BIO. No reconoce fechas, cantidades, códigos postales, identificadores fiscales ni entidades biomédicas o financieras especializadas.
- Idiomas: no se declara soporte multilingüe. El vocabulario de bert-base-cased está orientado al inglés; el uso sobre castellano daría resultados previsiblemente pobres sin un reajuste con datos en español.
- Límite de contexto de 512 tokens: los documentos largos deben trocearse, con el consiguiente riesgo de perder entidades partidas entre fragmentos.
- Etiquetas espurias: aunque no genere texto libre, sí puede asignar entidades incorrectas, especialmente en dominios alejados de CoNLL-2003 (noticias en inglés). Se recomienda calibrar umbrales de confianza y aplicar revisión humana en flujos críticos.
- Sesgos: el corpus CoNLL-2003 procede de prensa en inglés de los años noventa, con la representación demográfica, geográfica y temática de esa fuente. No se han documentado análisis de sesgo.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se indique los cambios. No impone restricciones de uso más allá de las habituales de atribución.
- Fiabilidad de producción no acreditada: con 0 descargas y 0 likes, el checkpoint no cuenta con validación por parte de la comunidad; conviene tratarlo como un experimento reproducible antes que como un componente estable de un sistema en producción.
- Los resultados de búsqueda web asociados a esta consulta no contenían material técnico sobre el modelo (devolvieron páginas de contenido no relacionado), por lo que no ha sido posible contrastar la información de la model card con fuentes externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/evtefeev/bert-finetuned-ner
- Modelo base: https://huggingface.co/google-bert/bert-base-cased (referenciado en la model card como bert-base-cased)
- Dataset de ajuste: conll2003 (referenciado en la model card; no se ha encontrado un enlace directo en la información proporcionada)
- Paper de BERT: no disponible en la información proporcionada
- Repositorios, demos o blogs adicionales: no se han encontrado enlaces relevantes en la búsqueda web

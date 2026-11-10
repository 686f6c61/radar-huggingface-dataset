# aphee123/saraiki-xlmr-pos-tagger

## Resumen

Saraiki XLM-R POS Tagger es un modelo de etiquetado morfosintáctico (part-of-speech tagging) especializado en saraiki (código ISO 639-3 `skr`), una lengua indoaria hablada principalmente en el sur de la provincia de Punjab (Pakistán) por decenas de millones de personas. Lo desarrolla el usuario `aphee123` y se distribuye en Hugging Face bajo licencia CC BY 4.0. El modelo parte de la arquitectura XLM-RoBERTa y se ha afinado con la técnica de entrenamiento adversario FGM (Fast Gradient Method) para mejorar la robustez del clasificador token a token.

El modelo resuelve una tarea concreta: asignar una categoría gramatical UPOS (Universal Dependencies) a cada palabra de una oración en saraiki. Con 277.466.129 parámetros totales, se enmarca en la familia de encoders multilingües de tamaño base, lo que lo hace viable en hardware modesto. Es relevante porque el saraiki es una lengua de bajos recursos con escasa cobertura en herramientas de PLN, y este modelo aporta una base funcional para pipelines de anotación lingüística.

La información disponible es limitada: la model card no detalla la composición del corpus de entrenamiento, el número de tokens vistos ni el proceso de anotación. La ficha se completa con los datos publicados por el autor y con las especificaciones inferidas de la arquitectura XLM-RoBERTa, señalando explícitamente cuando un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder) para clasificación de tokens |
| Parametros totales | 277.466.129 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (límite estándar de XLM-RoBERTa: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de PyTorch/ONNX) |
| Idiomas soportados | saraiki (`skr`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de XLM-RoBERTa sobre la tarea de token classification (POS tagging). La cabeza de clasificación emite 17 etiquetas UPOS: ADJ, ADP, ADV, AUX, CCONJ, DET, INTJ, NOUN, NUM, PART, PRON, PROPN, PUNCT, SCONJ, SYM, VERB y X. El entrenamiento incorpora FGM (Fast Gradient Method), una técnica de entrenamiento adversario que perturba las representaciones internas para forzar al modelo a aprender fronteras de decisión más robustas; es habitual en tareas de PLN de bajos recursos para mitigar el sobreajuste con corpus pequeños.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, el esquema de anotación (si es manual o proyectado desde otro idioma), la división train/dev/test ni si se aplicaron técnicas adicionales como DPO o RLHF (no aplicables a un encoder de clasificación). Tampoco se documenta el proceso de tokenización de palabras saraiki con el vocabulario de XLM-RoBERTa, un aspecto crítico en lenguas con escritura árabe-nastaliq y variación ortográfica.

## Capacidades

- Etiquetado morfosintáctico token a token con el inventario UPOS de Universal Dependencies (17 etiquetas).
- Procesamiento de oraciones en saraiki en escritura árabe, con soporte de tokenización a nivel de palabra mediante `is_split_into_words=True`.
- Clasificación de palabras desconocidas o fuera de vocabulario gracias a la tokenización por subpalabras de XLM-RoBERTa.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al saraiki; el backbone XLM-RoBERTa es multilingüe, pero el fine-tuning está orientado a una sola lengua.
- No dispone de modo thinking ni capacidades especiales más allá del etiquetado.

## Casos de uso

- Anotación lingüística asistida: el modelo pre-etiqueta corpus en saraiki para que lingüistas revisen y corrijan, reduciendo el coste de crear treebanks anotados manualmente. Su macro F1 de 84,98 % lo hace útil como primera pasada.
- Construcción de treebanks y recursos UD: integrado en pipelines de anotación para generar capas UPOS que después se enriquecen con dependencias sintácticas.
- Búsqueda y recuperación de información en saraiki: el etiquetado POS permite filtrar por categorías gramaticales (por ejemplo, extraer únicamente nombres propios o verbos) en motores de búsqueda sobre texto saraiki.
- Normalización y análisis de texto para TTS/ASR: el POS ayuda a desambiguar pronunciación y a segmentar oraciones en sistemas de síntesis de voz para saraiki.
- Enseñanza de la lengua: herramientas educativas que resaltan la categoría gramatical de cada palabra en textos saraiki para estudiantes y docentes.
- Investigación en lenguas de bajos recursos: punto de partida para experimentos de transferencia entre lenguas indoarias (punyabí, sindhi, urdu) y para comparar técnicas de entrenamiento adversario en corpus pequeños.
- Preprocesamiento para traducción automática: el etiquetado POS puede alimentar modelos de traducción saraiki-urdu o saraiki-inglés como característica adicional.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card sobre el conjunto de test:

| Metrica | Valor |
|---|---|
| Accuracy | 88,80 % |
| Macro F1 | 84,98 % |
| Weighted F1 | 88,72 % |

No se han publicado comparaciones con otros modelos en la información disponible, ni se detalla el tamaño ni la procedencia del conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,1 GB de pesos más overhead de activaciones; en la práctica, entre 2 y 3 GB con batch pequeño.
- VRAM estimada en FP16: alrededor de 0,6 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 3060, RTX 4060, T4). Para throughput alto, A10G, L4 o A100.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 4 GB o más; también es viable en CPU para procesamiento por lotes no interactivo.
- Opciones de despliegue: `transformers` con PyTorch, ONNX Runtime, TorchScript, y servidores de inferencia como TGI o FastAPI con batching. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por oración en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para POS tagging en saraiki en la documentación proporcionada. Como referencia de categoría, se puede comparar con el backbone base y con taggers multilingües genéricos, aunque sin datos de rendimiento en saraiki:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| aphee123/saraiki-xlmr-pos-tagger | 277 M | 512 (estándar XLM-R) | POS tagging saraiki | CC BY 4.0 |
| xlm-roberta-base (backbone) | 278 M | 512 | encoder multilingüe | MIT |
| Taggers UPOS multilingües (p. ej. Stanza, UDPipe) | variable | variable | POS tagging multilingüe | variable |

No hay datos de rendimiento comparativo en saraiki para estos sistemas en la información disponible.

## Limitaciones y advertencias

- Corpus de entrenamiento no documentado: se desconoce el tamaño, la procedencia y la calidad de la anotación, lo que impide evaluar el riesgo de sobreajuste o de sesgos de anotación.
- Riesgo de alucinación bajo en la tarea (es clasificación, no generación), pero puede asignar etiquetas incorrectas en palabras ambiguas, préstamos del urdu o inglés, y variantes ortográficas del saraiki.
- Cobertura limitada a una sola lengua y a un único esquema (UPOS); no apto para otras tareas de PLN sin reentrenamiento.
- El límite de contexto de 512 tokens de XLM-RoBERTa restringe el procesamiento a oraciones o fragmentos cortos; documentos largos requieren segmentación previa.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero no se especifican restricciones adicionales ni condiciones de atribución concretas más allá de la licencia estándar.
- Sin métricas de calibración ni análisis de errores por categoría gramatical publicados; el macro F1 (84,98 %) sugiere clases minoritarias con rendimiento inferior al de las mayoritarias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- No se documenta el proceso de tokenización de palabras saraiki con el vocabulario de XLM-RoBERTa, lo que puede afectar a la alineación palabra-subtoken en textos con ortografía no estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aphee123/saraiki-xlmr-pos-tagger
- Documentación de XLM-RoBERTa (backbone): https://huggingface.co/docs/transformers/model_doc/xlm-roberta
- Universal Dependencies (esquema UPOS): https://universaldependencies.org/u/pos/
- Paper de XLM-RoBERTa: https://arxiv.org/abs/1911.02116
- Paper de FGM (adversarial training): https://arxiv.org/abs/1605.07725

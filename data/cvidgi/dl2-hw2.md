# cvidgi/dl2-hw2

## Resumen

cvidgi/dl2-hw2 es un modelo de clasificación de tokens (token classification) obtenido mediante ajuste fino del encoder BERT BAAI/bge-small-en-v1.5 sobre un conjunto de datos no documentado. Cuenta con 33.215.625 parámetros y se distribuye en formato safetensors bajo licencia MIT, con un repositorio de 0,3 GB, dentro del ecosistema transformers. Su pipeline declarada es token-classification, lo que lo orienta a tareas de etiquetado a nivel de token como el reconocimiento de entidades nombradas (NER).

En su conjunto de evaluación registra una pérdida de 0,3607, precisión de 0,7521, recall de 0,7915, F1 de 0,7713 y exactitud de 0,9584, valores declarados por el autor en la model card. No se especifican ni el dataset de entrenamiento, ni el conjunto de etiquetas, ni los idiomas soportados, y el model-index no contiene resultados de benchmarks estándar.

Su relevancia práctica es limitada y de carácter didáctico: el identificador dl2-hw2, la model card autogenerada por el Trainer y la existencia de múltiples copias con el mismo nombre en otras cuentas (kryalka, Alekseyka20x, abramovgeorge, gzverev) apuntan a un ejercicio académico de un curso de deep learning más que a un modelo preparado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo BERT; ajuste fino de BAAI/bge-small-en-v1.5 |
| Parámetros totales | 33.215.625 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors en fp32/fp16) |
| Idiomas soportados | no disponible (no declarados; el modelo base bge-small-en-v1.5 está orientado a inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch, librería transformers) |

Otros datos del repositorio: 0 descargas, 0 likes, tamaño de 0,3 GB, etiqueta endpoints_compatible, creado el 2026-10-08 y actualizado el 2026-10-08.

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-small-en-v1.5, un encoder BERT de aproximadamente 33 millones de parámetros, y añade una cabeza de clasificación de tokens entrenada con la clase `Trainer` de transformers. No hay innovaciones técnicas destacables: no se emplean atención lineal, decodificación especulativa, arquitecturas MoE ni mecanismos híbridos. El model-index está vacío y la sección de datos de entrenamiento de la model card se limita a la frase "More information needed", por lo que se desconoce el número de tokens, la composición del corpus, el número de etiquetas y el esquema de anotación.

Los hiperparámetros declarados son: `learning_rate` 2e-05, `train_batch_size` 32, `eval_batch_size` 64, semilla 42, optimizador `ADAMW_TORCH_FUSED` con betas (0.9, 0.999) y epsilon 1e-08, planificador lineal, 3 épocas y precisión mixta nativa (AMP). El entrenamiento se completó en 939 pasos. No se documenta ningún proceso de alineación tipo RLHF, DPO o SFT conversacional, algo que no aplica a un modelo encoder-only de etiquetado. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Clasificación de tokens sobre texto: reconocimiento de entidades nombradas (NER), etiquetado gramatical (POS), chunking o clasificación de spans, siempre que el espacio de etiquetas coincida con el usado en el ajuste fino.
- Modelo discriminativo y no generativo: no produce texto libre, no resume, no traduce y no mantiene conversaciones.
- Sin soporte de tool calling ni function calling: no es un modelo causal ni instruct, por lo que no puede emitir llamadas a herramientas.
- Sin capacidades de agente: no razona en varios pasos de forma autónoma; como mucho puede actuar como componente de extracción dentro de un pipeline orquestado externamente.
- Capacidades multilingües: no acreditadas. El modelo base es monolingüe en inglés y la model card no declara idiomas.
- Sin capacidades especiales: no hay modo de razonamiento explícito (thinking), visión, audio ni procesamiento de documentos.
- Compatibilidad de despliegue: etiqueta `endpoints_compatible`, pipeline `token-classification`, pesos safetensors cargables con `AutoModelForTokenClassification`.
- Entrada/salida: logits y probabilidades por token, incluida la agregación de subpalabras (word ids) para reconstruir entidades a nivel de palabra.

## Casos de uso

- Extracción de entidades en tickets de soporte en inglés: el modelo puede etiquetar nombres de producto, versiones de software o identificadores de error dentro del texto de un ticket, alimentando un sistema de enrutamiento automático. Es adecuado por su bajo coste computacional (33 M de parámetros), aunque requiere verificar antes qué etiquetas predice realmente.
- Detección de datos personales (PII) en logs y documentos: aplicado como paso previo a la anonimización de textos en inglés, permite marcar spans candidatos a nombre, organización o localización. Al no documentarse el dataset de entrenamiento, exige una evaluación propia con datos representativos antes de usarlo en producción.
- Enriquecimiento de catálogos de comercio electrónico: extracción de atributos (marca, talla, material, modelo) a partir de descripciones de producto en inglés, que después se normalizan en una base de datos estructurada.
- Construcción de grafos de conocimiento y soporte a RAG: como etiquetador de entidades en la fase de ingesta, permite enlazar menciones del corpus con nodos de un grafo o con un índice de entidades, mejorando la recuperación posterior.
- Análisis de currículums y documentos académicos: identificación de titulaciones, empresas y fechas en textos en inglés para poblar un ATS o una base de candidatos; la cabeza de clasificación tendría que reentrenarse si se necesitan etiquetas específicas del dominio.
- Clasificación de cláusulas en contratos: etiquetado de fragmentos contractuales (partes, fechas, importes, jurisdicción) como preprocesado para herramientas de revisión legal, siempre con validación humana por el riesgo asociado al dominio jurídico.
- Docencia y experimentación: sirve como baseline reproducible en ejercicios de token classification, comparando su F1 de 0,7713 con cabezas de clasificación alternativas sobre el mismo encoder.
- Preprocesado en pipelines de moderación: etiquetado de spans problemáticos en comentarios en inglés, integrado como señal auxiliar de un clasificador de toxicidad a nivel de documento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, CoNLL-2003, etc.) en la información disponible; el model-index del autor está vacío. Los únicos datos son las métricas declaradas por el autor sobre un conjunto de evaluación no identificado:

| Métrica | Valor (evaluación final) |
|---|---|
| Pérdida | 0,3607 |
| Precisión | 0,7521 |
| Recall | 0,7915 |
| F1 | 0,7713 |
| Exactitud | 0,9584 |

Evolución durante el entrenamiento (datos declarados por el autor):

| Época | Paso | Pérdida de entrenamiento | Pérdida de validación | Precisión | Recall | F1 | Exactitud |
|---|---|---|---|---|---|---|---|
| 1,0 | 313 | 0,6653 | 0,5541 | 0,6398 | 0,6982 | 0,6677 | 0,9426 |
| 2,0 | 626 | 0,4518 | 0,3981 | 0,7242 | 0,7594 | 0,7414 | 0,9533 |
| 3,0 | 939 | 0,3755 | 0,3607 | 0,7521 | 0,7915 | 0,7713 | 0,9584 |

No hay comparación con modelos similares publicada por el autor, ni datos de latencia o throughput.

## Requisitos de hardware

- Peso de los pesos en memoria: aproximadamente 133 MB en fp32 y 66 MB en fp16/bf16, calculado a partir de los 33.215.625 parámetros.
- VRAM estimada para inferencia: por debajo de 1 GB incluso con lotes de 64 secuencias cortas en fp32; la activación domina más que los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente. Una RTX 3060, RTX 4090 o T4 cubren el caso sin dificultad; A100 o H100 solo tendrían sentido por agregación de muchos procesos concurrentes, no por requisitos del modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta de los últimos años, en iGPU con memoria unificada y también en CPU para volúmenes moderados.
- Opciones de despliegue: pipeline `token-classification` de transformers, `AutoModelForTokenClassification` con un servidor FastAPI o similar, exportación a ONNX con Optimum, TorchScript y Hugging Face Inference Endpoints (el repositorio está etiquetado como `endpoints_compatible`). vLLM y TGI no están confirmados para este caso de uso concreto de clasificación de tokens, ya que están orientados a modelos generativos.
- Latencia y throughput: no se han publicado mediciones. Como referencia orientativa no medida, un encoder de 33 M de parámetros procesa lotes de decenas de secuencias cortas en pocos milisegundos en una GPU moderna y es viable en CPU con lotes pequeños.

## Comparativa con modelos similares

Los datos de las alternativas proceden de las fichas públicas de cada modelo y no han sido verificados en esta búsqueda; se marcan como aproximados.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| cvidgi/dl2-hw2 | 33,2 M | no disponible | token classification (etiquetas desconocidas) | MIT | F1 0,7713 y exactitud 0,9584 en un conjunto de evaluación no identificado |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens (aproximado) | embeddings de frases y recuperación | MIT | Modelo base del que parte este ajuste fino; no es un etiquetador |
| dslim/bert-base-NER | ~108 M | 512 tokens (aproximado) | NER en inglés (CoNLL-2003, 4 tipos de entidad) | MIT | Referencia habitual de NER en inglés, con esquema de etiquetas público |
| dslim/distilbert-NER | ~66 M | 512 tokens (aproximado) | NER en inglés (CoNLL-2003) | MIT | Alternativa destilada, mayor coste que dl2-hw2 pero con documentación completa |

Frente a estas alternativas, dl2-hw2 tiene la ventaja del tamaño reducido y la licencia permisiva, y la desventaja decisiva de no documentar dataset ni etiquetas, lo que impide comparar su F1 con cifras publicadas sobre conjuntos estándar.

## Limitaciones y advertencias

- Dataset y esquema de etiquetas desconocidos: es imposible saber qué clases predice el modelo sin inspeccionar `config.json`. Si el autor no definió `id2label`, la salida aparecerá como `LABEL_0`, `LABEL_1`, etc.
- La exactitud de 0,9584 es engañosa en clasificación de tokens: con un fuerte desbalanceo hacia la clase mayoritaria (normalmente "O"), un modelo trivial alcanza cifras similares. El dato relevante es el F1 de 0,7713, que es moderado.
- Riesgo de falsos positivos y falsos negativos: al ser un modelo discriminativo no alucina texto, pero sí puede etiquetar entidades inexistentes o perder entidades reales, especialmente en dominios distintos al de entrenamiento.
- Idioma: el modelo base es monolingüe en inglés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Contexto: se desconoce la longitud máxima soportada. El modelo base BERT suele limitarse a secuencias cortas, por lo que textos largos requerirían troceado con solapamiento.
- Cero validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan contrastar su comportamiento.
- Model card autogenerada: todas las secciones sustantivas ("Model description", "Intended uses & limitations", "Training and evaluation data") contienen "More information needed".
- Incoherencias de metadatos: la fecha de creación declarada (2026-10-08) y las versiones de framework (Transformers 5.16.1, PyTorch 2.11.0) no coinciden con el ecosistema estable actual, lo que apunta a un entorno de ejecución no estándar o a datos erróneos.
- Licencia: MIT permite uso comercial y modificación, pero el origen de los datos de entrenamiento es desconocido, de modo que el riesgo legal sobre el corpus subyacente recae en quien despliega el modelo.
- Sin artefactos adicionales: no se publican versiones cuantizadas, ONNX ni GGUF, lo que limita el despliegue en entornos sin PyTorch.
- No apto como modelo generativo ni conversacional: cualquier uso de chat, resumen o generación de código queda fuera de su alcance.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cvidgi/dl2-hw2
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Copias con el mismo identificador en otras cuentas: https://huggingface.co/kryalka/dl2-hw2 y https://huggingface.co/Alekseyka20x/dl2-hw2
- Ficha de una variante en free2aitools: https://free2aitools.com/model/abramovgeorge/dl2-hw2
- Variante derivada con NER explícito en el nombre: https://free2aitools.com/model/gzverev/dl2-hw2-bert-ner
- Publicación en X mencionando el modelo: https://x.com/HuggingModels/status/2108207040296567030
- Referencia arXiv citada en las etiquetas de una variante del modelo: arXiv:1910.09700
- Documentación de la pipeline de clasificación de tokens: https://huggingface.co/docs/transformers/tasks/token_classification

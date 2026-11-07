# Julianlondon/bert-base-uncased-finetuned-ner-prostata_v2

## Resumen

`Julianlondon/bert-base-uncased-finetuned-ner-prostata_v2` es un modelo de clasificación de tokens (token classification) obtenido mediante fine-tuning de BERT-base sobre una tarea de reconocimiento de entidades nombradas (NER) en el dominio biomédico, concretamente en el ámbito del cáncer de próstata. Lo publica el usuario Julianlondon en Hugging Face y se distribuye en formato safetensors con la librería transformers, por lo que es directamente desplegable con `pipeline("token-classification")`.

El modelo parte de la arquitectura BERT-base no cased (12 capas, 768 dimensiones ocultas, 110 millones de parámetros), un transformer encoder bidireccional clásico, y añade una cabeza de clasificación por token. Con 108.907.797 parámetros y un tamaño de repositorio de 0,4 GB, está pensado para extraer menciones de entidades clínicas (como localizaciones anatómicas, hallazgos, procedimientos o fármacos) en textos sobre cáncer de próstata.

Su relevancia es acotada: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y sin model card cumplimentada por el autor. Resulta útil como punto de partida para pipelines de extracción de información clínica en castellano o inglés, pero requiere validación propia antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base, no cased) con cabeza de clasificación de tokens |
| Parametros totales | 108.907.797 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base admite típicamente 512 tokens; no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización a FP16, INT8 o INT4 mediante herramientas externas) |
| Idiomas soportados | no disponible (el modelo base es principalmente inglés; existe una variante hermana etiquetada como `spanish`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-base no cased, un transformer encoder de 12 capas con atención bidireccional completa, 768 dimensiones ocultas y 12 cabezas de atención, preentrenado con los objetivos de masked language modeling y next sentence prediction. Sobre este backbone se ha añadido una capa lineal de clasificación por token para la tarea de NER, lo que explica el recuento de 108.907.797 parámetros (ligeramente superior a los ~110 M del BERT-base estándar por la cabeza de clasificación y los embeddings de etiquetas).

No se dispone de información sobre el conjunto de datos de fine-tuning, el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF/DPO (poco habituales en NER). La model card es la plantilla automática de Hugging Face sin cumplimentar, y todos los campos de detalles de entrenamiento figuran como "[More Information Needed]". El tag `arxiv:1910.09700` corresponde al paper de BERT original (Devlin et al., 2019), no a un trabajo específico sobre este fine-tuning.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en textos biomédicos y clínicos, con foco declarado en cáncer de próstata.
- Clasificación de tokens a nivel de subtoken (WordPiece), con etiquetas BIO/BILOU presumiblemente definidas en `config.json` (no verificadas en la información disponible).
- Extracción de menciones de entidades clínicas: localizaciones anatómicas, hallazgos, procedimientos y posibles fármacos o biomarcadores.
- Procesamiento de texto en inglés (idioma del modelo base); soporte de castellano no confirmado, aunque existe una variante hermana etiquetada como `spanish`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto libre: es un modelo discriminativo de etiquetado, no generativo.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.

## Casos de uso

- Extracción de entidades en informes clínicos de urología: el modelo etiqueta menciones de localizaciones (próstata, pelvis), hallazgos (PSA elevado, adenocarcinoma) y procedimientos (biopsia, prostatectomía) en notas clínicas, facilitando la estructuración de datos no estructurados.
- Poblado de bases de datos de investigación oncológica: a partir de abstracts de PubMed o registros de ensayos, el modelo identifica entidades para construir índices de cohortes de pacientes con cáncer de próstata.
- Preanotación para anotadores humanos: en proyectos de curación de corpus clínicos, el modelo genera etiquetas iniciales que los revisores corrigen, reduciendo el coste de anotación manual.
- Filtrado y enrutamiento documental: clasificar documentos que mencionan entidades prostáticas para dirigirlos al equipo clínico o al pipeline de procesamiento adecuado.
- Enriquecimiento de historiales electrónicos: extraer menciones de biomarcadores (PSA, Gleason) y tratamientos para alimentar dashboards de seguimiento de pacientes.
- Componente en pipelines de NLP clínico: servir como etapa de NER dentro de un sistema mayor de extracción de información, combinado con otros modelos para relación de entidades y normalización a ontologías (SNOMED CT, UMLS).
- Prototipado e investigación: al ser un modelo pequeño (0,4 GB), permite iterar rápidamente en experimentos académicos sobre NER biomédico sin grandes requisitos de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (F1, precisión, recall) ni conjunto de test, y no se han encontrado datos en la búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,4 GB en FP32 (108,9 M parámetros × 4 bytes ≈ 0,44 GB); ~0,22 GB en FP16; ~0,11 GB en INT8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas GPUs.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o incluso una iGPU con 4 GB compartidos; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, `vLLM` (soporte limitado para modelos encoder de clasificación), `TGI` (orientado a generativos, no aplicable), `ONNX Runtime` y `Optimum` para exportación a ONNX; `llama.cpp` y `Ollama` no aplican al no ser un modelo generativo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; en una GPU moderna se espera latencia de milisegundos por secuencia de 512 tokens, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Julianlondon/bert-base-uncased-finetuned-ner-prostata_v2` | 108,9 M | no disponible | NER biomédico (próstata) | no disponible | Hugging Face, 0 descargas |
| `Test-FineTuning/bert-base-uncased-finetuned-ner-prostata` | no disponible | no disponible | NER biomédico (próstata, español) | apache-2.0 | Hugging Face |
| `d4data/biomedical-ner-all` (referencia) | ~110 M (BERT-base) | 512 tokens | NER biomédico general | no disponible | Hugging Face, ampliamente usado |
| `allenai/scibert_scivocab_uncased` | ~110 M | 512 tokens | Dominio científico (base para fine-tuning) | apache-2.0 | Hugging Face |

La comparativa directa es limitada: el modelo no declara licencia ni idioma, y su variante hermana (`Test-FineTuning/...`) sí está etiquetada como `spanish` y con licencia `apache-2.0`, lo que sugiere que este repositorio podría ser una réplica o versión previa de aquel. Los modelos BERT-base de dominio biomédico (BioBERT, SciBERT) son los competidores naturales, pero no se dispone de métricas comparativas publicadas para este checkpoint concreto.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de BERT-base no cased, hereda los sesgos del corpus de preentrenamiento (principalmente inglés de Wikipedia y BooksCorpus).
- Riesgo de alucinación: bajo en sentido generativo (no genera texto), pero puede producir falsos positivos y falsos negativos en la etiquetación de entidades, especialmente en dominios distintos al de entrenamiento.
- Limitaciones de contexto e idioma: la ventana de 512 tokens de BERT-base limita el procesamiento de documentos largos; el idioma de entrenamiento no está declarado y el modelo base es principalmente inglés.
- Restricciones de licencia: la licencia no está disponible, lo que impide confirmar si el uso comercial está permitido; se recomienda contactar con el autor antes de cualquier despliegue en producción.
- Caveat para producción: la model card no está cumplimentada, no hay métricas de evaluación, no hay información sobre el dataset de entrenamiento y el modelo tiene cero descargas; no debe usarse en entornos clínicos reales sin validación exhaustiva y sin revisión humana.
- Al ser un modelo de clasificación de tokens, no es adecuado para tareas generativas, de razonamiento o de diálogo; su uso debe limitarse a la extracción de entidades.

## Enlaces

- Hugging Face: https://huggingface.co/Julianlondon/bert-base-uncased-finetuned-ner-prostata_v2
- Variante hermana (español, apache-2.0): https://huggingface.co/Test-FineTuning/bert-base-uncased-finetuned-ner-prostata/tree/main
- Réplica en otra organización: https://huggingface.co/Test-FineTuning/bert-base-uncased-finetuned-ner-prostata_v2/tree/main
- Paper de BERT (Devlin et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact#compute

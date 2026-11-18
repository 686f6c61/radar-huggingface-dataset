# quorumbio/biomed-ner-chem-disease

## Resumen

`quorumbio/biomed-ner-chem-disease` es un modelo de reconocimiento de entidades nombradas (NER) biomédico especializado en la detección de menciones de compuestos químicos y enfermedades en texto científico en inglés. Lo desarrolla el usuario de Hugging Face `quorumbio` y se construye mediante fine-tuning del modelo base `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext` sobre el corpus BioCreative V CDR (BC5CDR), un conjunto de referencia de abstracts de PubMed con anotaciones de entidades químicas y enfermedades.

Arquitectónicamente es un transformer encoder tipo BERT base con 108,9 millones de parámetros y una cabeza de clasificación de tokens (`token-classification`). No es un modelo generativo: está diseñado exclusivamente para etiquetado a nivel de token, con dos tipos de entidad (Chemical y Disease) y sin normalización a identificadores MeSH. El modelo se publica bajo licencia Apache-2.0 y se distribuye tanto en formato PyTorch (`safetensors`) como en ONNX (fp32 e int8 dinámico), lo que facilita su despliegue en entornos de producción sin GPU.

Su relevancia actual reside en que ofrece un pipeline de extracción de entidades biomédicas ligero, reproducible y con licencia permisiva, con artefactos de entrenamiento incluidos (`training/` y `provenance.json`). El autor documenta resultados en BC5CDR test (F1 global 0,896) y una comprobación out-of-domain en NCBI-disease (F1 0,738 para Disease), además de comparaciones honestas con `d4data/biomedical-ner-all`, incluyendo las limitaciones de dicha comparación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder) con cabeza de token classification |
| Parametros totales | 108.895.493 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (max_length de entrenamiento); el modelo base admite hasta 512, no validado por el autor mas alla de 256 |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 (dynamic quantization); pesos PyTorch en fp32/bf16 para entrenamiento |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (pesos); modelo base MIT; corpus BC5CDR con terminos no explicitos (ver limitaciones) |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx`, `onnx/model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo es un BERT base estándar (12 capas, hidden size 768, 12 cabezas de atención) inicializado desde `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext`, un checkpoint preentrenado por Microsoft sobre abstracts de PubMed y texto biomédico completo. Sobre esa base se añade una cabeza lineal de clasificación de tokens con etiquetas BIO para dos tipos de entidad: Chemical y Disease. El fine-tuning se realizó durante 5 épocas, con batch size 16, learning rate 5e-05, max length 256, autocast bf16, optimizador AdamW con warmup y decay lineal, sobre una única NVIDIA RTX 3060 (aproximadamente 2 minutos de entrenamiento). El autor incluye los scripts en `training/` y un `provenance.json` con URLs y hashes SHA256 de las fuentes.

El conjunto de entrenamiento es el split de entrenamiento de BC5CDR (Li et al., 2016, Database baw068), compuesto por abstracts de PubMed anotados con menciones químicas y de enfermedad. No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo discriminativo de NER. La innovación técnica destacable no está en la arquitectura sino en la ingeniería de publicación: exportación ONNX verificada (diferencia máxima de logits fp32 ONNX vs PyTorch de 5,58e-05 y acuerdo de argmax de 1,0000 en 300 frases), cuantización int8 dinámica que reduce el tamaño de 435,8 MB a 109,7 MB manteniendo F1 (0,894 frente a 0,896) y reduciendo la latencia en CPU de 24,54 a 13,67 ms por frase.

## Capacidades

- Reconocimiento de entidades nombradas de tipo Chemical en texto biomédico en inglés.
- Reconocimiento de entidades nombradas de tipo Disease en texto biomédico en inglés.
- Etiquetado a nivel de token con convención BIO y agregación a nivel de entidad mediante `aggregation_strategy="simple"` en el pipeline de transformers.
- Inferencia en CPU eficiente gracias a los artefactos ONNX (fp32 e int8), con inputs `input_ids`, `attention_mask` y `token_type_ids`, y salida `logits`.
- Compatibilidad con `transformers.js` (el archivo int8 sigue la convención de nombres de esa librería).
- Integración directa con la pipeline `token-classification` de Hugging Face.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, generación de texto, matemáticas, visión ni audio.
- Capacidad multilingüe limitada al inglés; no se documenta soporte de otros idiomas.

## Casos de uso

- Extracción de entidades en literatura científica: procesar abstracts de PubMed para poblar bases de datos de interacciones fármaco-enfermedad, usando el modelo sobre cada abstract con `aggregation_strategy="simple"` y ventana de 256 tokens. Es adecuado porque fue entrenado exactamente en ese dominio (abstracts de PubMed).
- Construcción de un pipeline de curación de datos biomédicos: preetiquetar automáticamente menciones de Chemical y Disease en corpus internos para que anotadores humanos revisen y corrijan, reduciendo el coste de anotación manual.
- Indexación semántica de repositorios documentales médicos: extraer entidades para enriquecer metadatos y facilitar búsquedas facetadas por compuesto químico o enfermedad en bases de conocimiento internas.
- Preprocesamiento para sistemas de extracción de relaciones (RE): usar las menciones detectadas como entrada de un modelo posterior de relación química-enfermedad (por ejemplo, detección de efectos adversos), ya que el modelo proporciona offsets y tipos de entidad compatibles con pipelines de RE.
- Monitorización de literatura en farmacovigilancia: desplegar el modelo en ONNX int8 sobre CPU para procesar volúmenes altos de abstracts con latencia de ~13,67 ms por frase, filtrando candidatos que luego revisa un experto.
- Enriquecimiento de ontologías y vocabularios controlados: generar candidatos de términos para mapeo posterior a MeSH u otras ontologías (el modelo no normaliza, pero sí delimita menciones).
- Prototipado rápido en entornos sin GPU: gracias a los artefactos ONNX int8 de 109,7 MB, se puede ejecutar en portátiles o contenedores pequeños para validar una idea antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

Resultados publicados por el autor en BC5CDR test (500 abstracts), métricas a nivel de entidad (seqeval) sobre palabras de un tokenizador regex simple, con input dividido en frases. Checkpoint seleccionado en validación (mejor F1 de entidad en validación, época 5); test evaluado una sola vez tras la selección. Una sola ejecución, una sola semilla (13), sin intervalos de confianza.

| Modelo | Chemical (P/R/F1) | Disease (P/R/F1) | F1 global |
|---|---|---|---|
| Este modelo | 0,930 / 0,936 / 0,933 | 0,826 / 0,880 / 0,852 | 0,896 |

Comprobación de runtime (ONNX vía onnxruntime, CPU):

| Variante | F1 test | ms/frase | Tamano |
|---|---|---|---|
| fp32 | 0,896 | 24,54 | 435,8 MB |
| int8 (dynamic quantization) | 0,894 | 13,67 | 109,7 MB |

Comparación con `d4data/biomedical-ner-all` (mapeo de etiquetas realizado por el autor, no entrenado en BC5CDR):

| Modelo | Mapeo | F1 | P | R |
|---|---|---|---|---|
| Este modelo | — | 0,896 | — | — |
| d4data/biomedical-ner-all | estricto (Disease_disorder→Disease, Medication→Chemical) | 0,479 | 0,629 | 0,386 |
| d4data/biomedical-ner-all | generoso (ademas Sign_symptom→Disease) | 0,533 | 0,579 | 0,494 |

Comprobación out-of-domain en NCBI-disease (solo Disease, split de test: 975 frases, 960 menciones gold), con ONNX int8: precisión 0,780, recall 0,701, F1 0,738, frente a 0,852 de F1 Disease en BC5CDR test (PyTorch fp32). El autor advierte que parte de la diferencia se debe a convenciones de anotación distintas y que debe leerse como señal aproximada de generalización.

El autor advierte explícitamente que estas cifras no son directamente comparables con números publicados de BC5CDR, que usan tokenización y scoring diferentes.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (108,9 M parámetros, ~436 MB de pesos) y menos de 0,5 GB en int8 (~110 MB). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se requieren; el autor entrenó en una NVIDIA RTX 3060 en unos 2 minutos. Para inferencia, cualquier GPU con al menos 1 GB libre es suficiente (GTX 1650, RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en iGPU y CPU.
- Opciones de despliegue: `transformers` (pipeline `token-classification`), `onnxruntime` (fp32 e int8), `transformers.js` (para el archivo int8), y potencialmente `vLLM`/`TGI` no aplican porque no es un modelo generativo; `llama.cpp` y `Ollama` no soportan BERT de token classification de forma nativa.
- Latencia y throughput estimados: en CPU con ONNX int8, 13,67 ms por frase; en CPU con ONNX fp32, 24,54 ms por frase. En GPU, el autor reporta 16,1 s para 4.821 frases en su prueba comparativa (frente a 13,7 s de `d4data/biomedical-ner-all`). No se publican cifras de throughput en GPU más allá de ese dato.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entidades | F1 BC5CDR (segun este autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `quorumbio/biomed-ner-chem-disease` (este) | 108,9 M | 256 tokens | 2 (Chemical, Disease) | 0,896 | Apache-2.0 | HF, ONNX fp32/int8 |
| `d4data/biomedical-ner-all` | 66,4 M | no disponible | 84 tipos clinicos | 0,479–0,533 (mapeo propio, out-of-domain) | no disponible en la informacion | HF |
| `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext` (base) | ~110 M | 512 tokens | no aplica (MLM) | no aplica | MIT | HF |

La comparación con `d4data/biomedical-ner-all` debe interpretarse con cautela: es un modelo de dominio clínico con 84 tipos de entidad, no entrenado en BC5CDR, y el mapeo de etiquetas lo realizó el autor, lo que afecta a la puntuación. El modelo base de Microsoft no es un NER y no compite en la misma tarea, pero se incluye como referencia del coste de fine-tuning. No se dispone de datos de otros modelos NER biomédicos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés; no se ha validado en otros idiomas.
- Solo dos tipos de entidad (Chemical y Disease); no cubre síntomas, procedimientos, dosis, genes, proteínas ni otras categorías clínicas.
- No realiza normalización a identificadores MeSH ni a otras ontologías; solo delimita menciones.
- Entrenado sobre abstracts de PubMed; se espera menor precisión en notas clínicas, texto completo, patentes o redes sociales.
- Las convenciones de frontera siguen BC5CDR; las menciones compuestas y discontinuas se manejan de forma imperfecta.
- No validado para uso clínico ni diagnóstico; no debe usarse para tomar decisiones médicas.
- Una sola ejecución, una sola semilla, sin intervalos de confianza; las diferencias pequeñas entre modelos no son significativas.
- La licencia de los pesos es Apache-2.0 y el modelo base es MIT, pero el corpus BC5CDR no tiene una licencia explícita clara: los distribuidores indican "freely available for the research community", BigBio lo lista como Public Domain Mark 1.0. Para necesidades estrictas de cumplimiento, el autor recomienda revisar los términos del corpus.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y negativos en la delimitación de entidades; conviene umbralizar por confianza en producción.
- El modelo no soporta tool calling, agentes ni razonamiento multi-step; cualquier caso de uso que requiera esas capacidades debe combinarse con otro modelo.

## Enlaces

- Hugging Face: https://huggingface.co/quorumbio/biomed-ner-chem-disease
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
- Corpus BC5CDR (Li et al., 2016, Database baw068): https://doi.org/10.1093/database/baw068
- Repositorio de scripts de entrenamiento: incluido en el propio repo (`training/`, `provenance.json`, `SHA256SUMS`)
- Modelo comparado `d4data/biomedical-ner-all`: https://huggingface.co/d4data/biomedical-ner-all
- Corpus NCBI-disease (usado solo como comprobación out-of-domain): https://www.ncbi.nlm.nih.gov/CBBresearch/Dogan/DISEASE/

# dathuynh1108/vi-ner-videberta

## Resumen

El modelo `dathuynh1108/vi-ner-videberta` es un modelo de reconocimiento de entidades nombradas (NER) en vietnamita, desarrollado por dathuynh1108 mediante fine-tuning del checkpoint `Fsoft-AIC/videberta-base`. Está diseñado específicamente para procesar líneas de transacciones extraídas de extractos bancarios mediante OCR, identificando tres tipos de entidades: personas, organizaciones y direcciones. La inclusión deliberada de la etiqueta `ADDRESS` permite desambiguar nombres propios que aparecen dentro de direcciones administrativas, como nombres de calles o barrios, evitando que se confundan con personas u organizaciones.

Arquitectónicamente, se trata de un encoder Transformer basado en DeBERTa-v2, con 183.760.135 parámetros totales. El modelo fue entrenado sobre un dataset mixto de 13 fuentes distintas, con un total de 228.917 muestras de entrenamiento, 29.403 de validación y 28.619 de test. La longitud de contexto no está especificada en la información disponible. El checkpoint se publica bajo una licencia `other` no detallada y en formato safetensors, y está disponible para su uso a través de la librería `transformers`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v2 / ViDeBERTa) |
| Parametros totales | 183.760.135 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Fsoft-AIC/videberta-base`, un modelo preentrenado en vietnamita basado en DeBERTa-v2. Según el paper "ViDeBERTa: A powerful pre-trained language model for Vietnamese", este modelo base logra resultados state-of-the-art en tareas de etiquetado POS, NER y QA para vietnamita. El fine-tuning realizado para este checkpoint utiliza un dataset mixto compuesto por 13 fuentes, entre las que se incluyen `vlsp2016`, `vlsp2021_ndtands`, `wikiann_vi`, `news_ner`, `pap_ner`, `phoner_covid19`, `meddies_pii_vi`, `masothue_synthetic`, `masothue_statement_augmented`, `vietnamnet_gold`, `curated_ambiguity`, `curated_statement_patterns` y `statement_hard_cases`.

El entrenamiento se realizó con una semilla fija (`20260904`) y con un esquema de etiquetado BIO que incluye las clases `O`, `B-PERSON`, `I-PERSON`, `B-ORGANIZATION`, `I-ORGANIZATION`, `B-ADDRESS` e `I-ADDRESS`. El dataset de entrenamiento incluye ejemplos restringidos o no redistribuibles, y las filas originales no se suben junto con el modelo. La arquitectura es un encoder puro, sin decodificación autoregresiva, por lo que está orientado exclusivamente a clasificación de tokens.

## Capacidades

- Extracción de entidades nombradas en vietnamita: `PERSON`, `ORGANIZATION` y `ADDRESS`.
- Reconocimiento de entidades en líneas de extractos bancarios extraídas mediante OCR.
- Desambiguación de nombres propios dentro de direcciones administrativas gracias a la etiqueta `ADDRESS`.
- Clasificación de tokens a nivel de carácter o subpalabra, compatible con `token-classification` de `transformers`.
- Soporte para inferencia en GPU o CPU mediante la librería `transformers`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No incluye capacidades de visión ni audio.
- Modelo monolingüe: únicamente vietnamita.

## Casos de uso

- Extracción de datos de extractos bancarios: el modelo puede procesar líneas de transacciones generadas por OCR para extraer de forma estructurada nombres de clientes, nombres de organizaciones y direcciones, facilitando la automatización de la conciliación contable.
- Verificación de identidad (KYC): en procesos de incorporación de clientes, el modelo identifica personas y organizaciones en documentos financieros en vietnamita, apoyando la comprobación de datos sin necesidad de revisión manual completa.
- Cumplimiento normativo y detección de fraude: al extraer entidades relevantes de transacciones, el modelo permite alimentar sistemas de análisis que buscan patrones sospechosos, como transacciones con organizaciones no reconocidas o direcciones inconsistentes.
- Desambiguación en direcciones administrativas: la etiqueta `ADDRESS` permite distinguir entre nombres de calles, barrios o distritos y personas u organizaciones reales, reduciendo errores en sistemas que procesan datos de facturación o envíos.
- Limpieza y estructuración de datos financieros: el modelo transforma texto OCR sin formato en campos estructurados (persona, organización, dirección), lo que facilita la integración en bases de datos o data warehouses.
- Integración en pipelines de procesamiento documental: puede combinarse con un motor OCR y un flujo de trabajo de revisión para automatizar la extracción de información en entidades bancarias vietnamitas, siempre con supervisión humana para decisiones críticas.

## Benchmarks y rendimiento

Los resultados declarados por el autor en un held-out test split local son los siguientes:

| Métrica | Validación | Test |
|---|---|---|
| Precision | 0,727506 | 0,678091 |
| Recall | 0,787564 | 0,758643 |
| F1 | 0,756344 | 0,716109 |
| Accuracy | 0,972908 | 0,965114 |

Rendimiento por entidad (F1):

| Entidad | Validación | Test |
|---|---|---|
| PERSON | 0,777055 | 0,737569 |
| ORGANIZATION | 0,756773 | 0,704527 |
| ADDRESS | 0,730123 | 0,703669 |

No se han publicado comparativas con otros modelos NER vietnamita en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP32 se requieren aproximadamente 0,7 GB para los pesos; en FP16, alrededor de 0,4 GB; con cuantización a 8 bits, cerca de 0,2 GB. Sumando activaciones y overhead, se recomienda disponer de al menos 2 GB de VRAM para una ejecución cómoda.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA T4, RTX 3060, A10 o A100. El modelo es ligero y puede ejecutarse incluso en GPUs de consumo antiguas.
- Sí cabe en GPUs de consumo, por ejemplo una RTX 3060 de 12 GB o una RTX 4060 de 8 GB.
- Opciones de despliegue: puede servirse mediante la librería `transformers` en Python, Hugging Face Inference Endpoints o `ONNX Runtime`. No es compatible con `llama.cpp` ni con `vLLM`, ya que no es un modelo decoder.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han publicado datos comparativos en la información proporcionada. No se dispone de benchmarks de modelos NER vietnamita comparables que permitan una evaluación objetiva frente a alternativas como otros checkpoints de ViDeBERTa o PhoBERT.

## Limitaciones y advertencias

- Errores de OCR, abreviaturas, formatos bancarios no vistos y nombres que también son ubicaciones pueden reducir la precisión, tal y como señala el autor.
- Las predicciones del modelo deben apoyar análisis posteriores y no reemplazar la revisión humana en decisiones legales, de cumplimiento, identidad o pago.
- El dataset de entrenamiento incluye fuentes restringidas o no redistribuibles; las filas originales no se suben con el modelo. Es necesario revisar cada licencia upstream antes de un uso comercial o de redistribución.
- La licencia del modelo es `other` y no se especifican los términos exactos, lo que introduce incertidumbre sobre su uso comercial.
- El modelo es exclusivamente monolingüe en vietnamita y no está validado para otros idiomas.
- No se han evaluado explícitamente sesgos de género, origen o región en la información disponible.
- El rendimiento fuera del dominio de extractos bancarios OCR no ha sido validado.

## Enlaces

- HuggingFace: https://huggingface.co/dathuynh1108/vi-ner-videberta
- Paper de ViDeBERTa: https://arxiv.org/pdf/2301.10439
- Modelo base: https://huggingface.co/Fsoft-AIC/videberta-base
- Dashboard de entrenamiento: https://huggingface.co/spaces/dathuynh1108/vi-ner-dashboard

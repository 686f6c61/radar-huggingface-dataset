# emi08/maske-modernbert-tr-bakeoff

## Resumen

`maske-modernbert-tr-bakeoff` es un modelo de reconocimiento de entidades nombradas (NER) para turco, desarrollado por el usuario emi08 en el marco del proyecto *maske*. Se trata de un fine-tuning de `ytu-ce-cosmos/modernbert-tr-base` sobre el corpus WikiANN-tr (20.000 frases) para clasificar tokens en tres categorías de entidad: persona (PER), organización (ORG) y localización (LOC). Su propósito no es tanto el rendimiento absoluto como servir de experimento controlado: comparar una base ModernBERT turca de 2026 frente a la clásica BERTurk de 2020 con una receta de entrenamiento idéntica.

El modelo tiene 149.333.767 parámetros (~150M) y una arquitectura ModernBERT, un transformer encoder que incorpora atención lineal, RoPE y contexto extendido respecto a BERT clásico. La base fue preentrenada con aproximadamente 144.000 millones de tokens en turco y publicada bajo licencia Apache-2.0. El resultado del *bake-off* es un empate técnico: 0.929 de F1 en el conjunto de test completo de WikiANN-tr (10.000 frases) frente a los 0.929 de la variante BERTurk, lo que sugiere que WikiANN-tr está saturado a esta escala y que la diferencia arquitectónica no se manifiesta en NER clásico de dominio periodístico.

Es relevante ahora por dos motivos. Primero, documenta de forma reproducible una comparación de bases que muchos equipos asumen sin medir. Segundo, justifica la decisión del proyecto de centrar su esfuerzo en datos de dominio (datos sintéticos de protección de datos personales al estilo KVKK turco) en lugar de en la búsqueda de bases más modernas. El modelo es experimental y el autor remite a `emi08/maske` (19 etiquetas de PII) para tareas reales de anonimización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder, bidirectional, con atención lineal y RoPE) |
| Parametros totales | 149.333.767 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base ModernBERT soporta contexto largo, pero la cifra exacta para esta versión no se especifica) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `ytu-ce-cosmos/modernbert-tr-base`, un encoder ModernBERT preentrenado con unos 144.000 millones de tokens de turco. ModernBERT sustituye la atención cuadrática clásica por mecanismos de atención lineal y añade codificación posicional rotatoria (RoPE), lo que en principio permite contextos más largos y un mejor aprovechamiento de secuencias extensas frente a BERT. El cabezal de clasificación de tokens se ajusta sobre las etiquetas O, B/I-PER, B/I-ORG y B/I-LOC.

El fine-tuning se realizó sobre WikiANN-tr (20.000 frases, etiquetado plateado de estilo periodístico y enciclopédico) con una receta idéntica a la del baseline BERTurk: mismos hiperparámetros, mismos epochs, mismo learning rate y mismo batch size. El único cambio fue la base. El entrenamiento se ejecutó en una GPU T4 (Colab/Kaggle). No se documentan fases de RLHF, DPO ni decodificación especulativa, algo esperable en un modelo discriminativo de clasificación.

## Capacidades

- Clasificación de tokens para NER en turco con tres tipos de entidad: persona (PER), organización (ORG) y localización (LOC).
- Etiquetado BIO (B/I) por entidad, compatible con `pipeline("token-classification")` de Transformers y con `aggregation_strategy="simple"`.
- Procesamiento de frases en turco de estilo periodístico y enciclopédico.
- Inferencia rápida en CPU y GPU por su tamaño (~150M parámetros).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No tiene modo thinking, visión ni audio.
- No cubre tipos de PII (DNI, IBAN, teléfono, correo, dirección) más allá de PER/ORG/LOC.

## Casos de uso

- Evaluación de bases preentrenadas en turco: sirve como referencia reproducible para comparar el impacto de cambiar de BERTurk a ModernBERT en una tarea NER concreta, manteniendo constante todo lo demás.
- Extracción de entidades en corpus periodísticos turcos: permite poblar índices de personas, organizaciones y lugares en un pipeline de análisis documental o de archivística.
- Enriquecimiento de metadatos en buscadores internos: identificar entidades en titulares y cuerpos de noticia para habilitar filtros por persona, organización o localización.
- Prototipado rápido de NER en turco: al ser ligero (~150M parámetros) y cargarse con `pipeline`, es adecuado para validar una idea en CPU antes de invertir en un modelo mayor.
- Investigación sobre saturación de benchmarks: útil como caso documentado de que WikiANN-tr no discrimina entre bases modernas y clásicas a esta escala, material para estudios de metodología de evaluación.
- Docencia y formación en NLP turco: ejemplo mínimo y bien documentado de fine-tuning de clasificación de tokens con receta reproducible en T4.
- Base para experimentos de dominio: punto de partida para quien quiera replicar el pipeline sobre datos propios antes de migrar al modelo de 19 etiquetas `emi08/maske`.

## Benchmarks y rendimiento

Evaluación con seqeval a nivel de entidad sobre el test completo de WikiANN-tr (10.000 frases), mismo script para todos los modelos:

| Modelo | Base | Precision | Recall | F1 |
|---|---|---|---|---|
| emi08/maske-modernbert-tr-bakeoff | modernbert-tr-base (2026) | 0.923 | 0.935 | 0.929 |
| emi08/maske-berturk-baseline | BERTurk 128k (2020) | 0.923 | 0.934 | 0.929 |
| savasy/bert-base-turkish-ner-cased | BERTurk 32k | 0.919 | 0.930 | 0.925 |
| Werea-co/Werea-TR-NER | BERTurk 32k | 0.907 | 0.917 | 0.912 |
| akdeniz27/bert-base-turkish-cased-ner | BERTurk 32k | 0.699 | 0.649 | 0.673 |

El autor advierte que WikiANN es etiquetado automático y de estilo periodístico, por lo que estos valores constituyen un techo para texto real.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,6 GB de pesos, aproximadamente 1-1,5 GB con activaciones y overhead del runtime.
- VRAM estimada en fp16/bf16: alrededor de 0,3 GB de pesos, menos de 1 GB en total.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en T4, RTX 3060, RTX 4090, A100 y H100 sin problema.
- Cabe en GPU de consumo: sí, en cualquier modelo con 2 GB o más (GTX 1650, RTX 3050 en adelante).
- Funciona en CPU con latencias aceptables para frases cortas, dado su tamaño de ~150M parámetros.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, servidores de inferencia compatibles con endpoints (el repo está marcado como `endpoints_compatible`), ONNX Runtime tras exportación. No hay pesos GGUF publicados para llama.cpp ni Ollama.
- Throughput y latencia: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 (WikiANN-tr) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emi08/maske-modernbert-tr-bakeoff | ~150M | no disponible | 0.929 | Apache-2.0 | Hugging Face, 46 descargas |
| emi08/maske-berturk-baseline | no disponible | no disponible | 0.929 | no disponible | Hugging Face |
| savasy/bert-base-turkish-ner-cased | ~110M (BERT base) | 512 | 0.925 | no disponible | Hugging Face |
| Werea-co/Werea-TR-NER | ~110M (BERT base) | 512 | 0.912 | no disponible | Hugging Face |
| akdeniz27/bert-base-turkish-cased-ner | ~110M (BERT base) | 512 | 0.673 | no disponible | Hugging Face |

La diferencia práctica frente a las alternativas BERTurk es marginal en F1; la ventaja de esta variante está en la base ModernBERT (mantenimiento activo, arquitectura más reciente, potencial de contexto largo) y no en la métrica.

## Limitaciones y advertencias

- Solo reconoce PER, ORG y LOC; no detecta otros tipos de entidad ni categorías de PII.
- El autor lo marca explícitamente como experimental y desaconseja su uso para tareas KVKK/PII, remitiendo a `emi08/maske`.
- WikiANN-tr es etiquetado plateado (automático), con ruido inherente; las métricas solo son comparables dentro de ese corpus.
- No se ha evaluado fuera de texto periodístico y enciclopédico; el rendimiento en dominios como conversación, redes sociales o documentos legales es desconocido.
- Riesgo de alucinación de entidades en textos con ruido, abreviaturas o entidades poco frecuentes, habitual en modelos NER pequeños.
- Sesgos: al entrenarse sobre Wikipedia y noticias, puede sobrerrepresentar entidades mediáticas y desatender nombres propios de otras comunidades.
- Solo turco; no soporta otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero la base y el dataset tienen sus propias condiciones (WikiANN con etiquetas plateadas).
- Sin pesos cuantizados publicados, lo que limita el despliegue en entornos con restricciones de formato.
- 0 descargas significativas y 0 likes en el momento de la ficha: no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emi08/maske-modernbert-tr-bakeoff
- Repositorio GitHub del proyecto: https://github.com/emi0890/maske
- Modelo de PII de 19 etiquetas: https://huggingface.co/emi08/maske
- Baseline BERTurk: https://huggingface.co/emi08/maske-berturk-baseline
- Modelo base: https://huggingface.co/ytu-ce-cosmos/modernbert-tr-base
- Dataset WikiANN: https://huggingface.co/datasets/unimelb-nlp/wikiann
- Alternativa savasy: https://huggingface.co/savasy/bert-base-turkish-ner-cased
- Alternativa Werea: https://huggingface.co/Werea-co/Werea-TR-NER
- Alternativa akdeniz27: https://huggingface.co/akdeniz27/bert-base-turkish-cased-ner

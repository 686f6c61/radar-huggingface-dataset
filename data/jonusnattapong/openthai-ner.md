# JonusNattapong/OpenThai-NER

## Resumen

OpenThai-NER es un modelo de reconocimiento de entidades nombradas (NER) para tailandés, desarrollado por JonusNattapong sobre la base de PhayaThaiBERT (Pavarissy/phayathaibert-thainer). Se trata de un fine-tuning del modelo preentrenado con el corpus multi-dominio OpenThai-NER-Corpus, que incluye 8.601 muestras válidas repartidas en 407 dominios (gubernamental, financiero, legal, sanitario, educativo, entre otros). El modelo está pensado para producción, incorporando mejoras como reconstrucción de spans de subword, estabilidad numérica en el entrenamiento, una capa CRF lineal opcional y exportación a ONNX con cuantización INT8 para reducir la latencia en CPU.

Con 276 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto, tanto en GPU como en CPU. Su relevancia radica en que ofrece un rendimiento superior a alternativas tailandesas previas (WangchanBERTa, PyThaiNLP ThaiNER-v2) y resuelve problemas de inestabilidad en el entrenamiento (pérdida NaN) que afectaban a su modelo base. Está disponible bajo licencia CC-BY-3.0, lo que permite uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (CamemBERT-like, basado en PhayaThaiBERT) |
| Parametros totales | 276.910.884 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 512 tokens, típico de BERT, no confirmado) |
| Tipos de cuantizacion | INT8 ONNX (exportación dinámica), no se especifican cuantizaciones GGUF |
| Idiomas soportados | Tailandés (th) |
| Licencia | CC-BY-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en PhayaThaiBERT, un transformer encoder de tipo CamemBERT con tokenizer SentencePiece. Sobre esta base se realiza un fine-tuning para token classification con el corpus OpenThai-NER-Corpus, que contiene etiquetas BIO para entidades como persona, organización, ubicación, fecha, entre otras. El entrenamiento incorpora varias innovaciones técnicas: uso de bf16/fp32 en lugar de fp16 para evitar la pérdida NaN, recorte de gradiente (max_grad_norm=1.0), enmascaramiento estricto de tokens de padding y especiales mediante -100 en el collator, y una capa CRF lineal con decodificación Viterbi y restricciones de transición BIO. Además, se aplica focal loss con pesos de clase suavizados para mitigar el desequilibrio de clases y mejorar el recall en categorías raras. El conjunto de datos se limpió y normalizó, resolviendo errores de sintaxis y consolidando etiquetas sinónimas.

## Capacidades

- Reconocimiento de entidades nombradas en tailandés: personas, organizaciones, ubicaciones, fechas, cantidades, etc., según el esquema de etiquetas de 128 tags.
- Reconstrucción de spans completos a partir de subwords de SentencePiece, con offsets de caracteres exactos.
- Decodificación con CRF y Viterbi que impide violaciones estructurales de las etiquetas BIO.
- Exportación a ONNX con cuantización INT8 para inferencia de baja latencia en CPU (reducción de 3,8x en latencia).
- Integración con la librería transformers y pipeline de token-classification.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo discriminativo, no generativo.
- Monolingüe: únicamente tailandés.

## Casos de uso

- Extracción de entidades en documentos gubernamentales: el modelo puede identificar nombres de organismos, cargos y ubicaciones en textos administrativos tailandeses, facilitando la indexación y búsqueda documental.
- Análisis de contratos y documentos legales: extracción de partes involucradas, fechas y cláusulas relevantes, útil para sistemas de gestión documental en despachos de abogados.
- Procesamiento de noticias y artículos periodísticos: detección de personas, organizaciones y lugares para construir grafos de conocimiento o recomendaciones de contenido.
- Atención al cliente automatizada: extracción de entidades en conversaciones de soporte en tailandés para enrutar consultas o rellenar campos de tickets.
- Indexado de expedientes sanitarios: identificación de nombres de pacientes, médicos, hospitales y medicamentos en informes clínicos, siempre con cumplimiento normativo.
- Búsqueda por entidades en bases de datos corporativas: integración en pipelines de NLP para consultas tipo "¿qué documentos mencionan a la empresa X?" o "¿cuándo se firmó el contrato con Y?".
- Etiquetado de datos para entrenar otros modelos: generación de anotaciones automáticas para crear datasets de NER más grandes o para pre-entrenar modelos generativos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el dataset de prueba (1.092 secuencias, 407 dominios) con métricas seqeval de coincidencia estricta de spans:

| Metrica | OpenThai-NER | WangchanBERTa Base | PyThaiNLP ThaiNER-v2 | PhayaThaiBERT Baseline |
|---|---|---|---|---|
| Strict Span F1 | 79,28% | 78,10% | 76,40% | 71,20% |
| Precision | 78,87% | 78,20% | 75,90% | 70,80% |
| Recall | 79,70% | 78,00% | 76,90% | 71,60% |
| Token Accuracy | 90,76% | 89,90% | 88,50% | 85,20% |
| Validation Loss | 0,3697 | 0,3850 | N/A | NaN (inestable) |
| CPU Latency (INT8) | 11,2 ms/seq | 18,5 ms/seq | 15,1 ms/seq | 42,6 ms/seq |

## Requisitos de hardware

- Estimación de memoria: con 276 millones de parámetros, en fp32 ocupa aproximadamente 1,1 GB (cálculo: 276M × 4 bytes). No se han publicado requisitos oficiales de VRAM.
- GPU recomendadas: al ser un modelo pequeño, es viable en GPUs consumer como RTX 3060 (12 GB) o superiores. También puede ejecutarse en CPU con la exportación ONNX INT8.
- Opciones de despliegue: compatible con la librería transformers de Hugging Face, pipeline de token-classification, exportación ONNX Runtime. No se menciona soporte explícito para vLLM, llama.cpp u Ollama.
- Latencia: con cuantización INT8 en CPU se reporta 11,2 ms por secuencia, muy inferior a los 42,6 ms del modelo base sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (span estricto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai-NER | 276M | no disponible | 79,28% | CC-BY-3.0 | Hugging Face |
| WangchanBERTa Base | ~428M (estimado) | no disponible | 78,10% | no disponible | Hugging Face |
| PyThaiNLP ThaiNER-v2 | no disponible | no disponible | 76,40% | no disponible | PyThaiNLP |
| PhayaThaiBERT Baseline | 276M (base) | no disponible | 71,20% | no disponible | Hugging Face |

OpenThai-NER supera a las alternativas en todas las métricas reportadas, con una mejora de 1,18 puntos de F1 sobre WangchanBERTa y de 8,08 puntos sobre su modelo base. Además, su latencia INT8 es la más baja del grupo.

## Limitaciones y advertencias

- Modelo exclusivamente en tailandés; no soporta otros idiomas.
- El corpus de entrenamiento, aunque multi-dominio, puede contener sesgos derivados de los dominios representados (gubernamental, financiero, legal, etc.), lo que podría afectar al rendimiento en dominios poco representados.
- Riesgo de alucinación en entidades ambiguas o fuera del vocabulario; la capa CRF reduce errores estructurales pero no elimina falsos positivos.
- No se ha publicado información sobre la longitud de contexto máxima; se asume 512 tokens por la arquitectura BERT, pero no está confirmado.
- La licencia CC-BY-3.0 requiere atribución en usos comerciales; verificar términos para redistribución.
- El repositorio tiene solo 17 descargas y 0 likes, lo que sugiere una adopción limitada y poca validación externa.
- No se han publicado resultados de benchmarks independientes fuera de los declarados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JonusNattapong/OpenThai-NER
- Dataset en Hugging Face: https://huggingface.co/datasets/JonusNattapong/OpenThai-NER-Corpus
- Repositorio GitHub: https://github.com/JonusNattapong/OpenThai
- Modelo base: https://huggingface.co/Pavarissy/phayathaibert-thainer
- Referencia de Thai NER v2.0 (PyThaiNLP): https://pythainlp.org/Thai-NER/version/2

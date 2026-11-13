# byumatrixlab/mapudungun-nllb-1.3B-arn-es-morfessor-bpe

## Resumen
El modelo `mapudungun-nllb-1.3B-arn-es-morfessor-bpe` es un ajuste fino del checkpoint `facebook/nllb-200-distilled-1.3B` especializado en traducción automática del mapudungun (`arn`) al español (`es`). Lo desarrolla el grupo byumatrixlab en el contexto de un trabajo académico presentado en AmericasNLP 2026, y aborda uno de los problemas clásicos de la traducción de lenguas de bajos recursos: la tokenización de lenguas aglutinantes y polisintéticas, donde los tokenizadores entrenados sobre corpus de altos recursos fragmentan las palabras de forma poco eficiente.

La innovación principal es la tokenización morfológica: se aplica segmentación Morfessor sobre el mapudungun y, dentro de cada morfema, se usa SentencePiece BPE. El modelo base aporta la arquitectura y el conocimiento multilingüe previo; el ajuste fino adapta la dirección arn→es con ese esquema de tokenización específico. Es relevante porque demuestra que intervenir en la tokenización, y no solo en el volumen de datos, mejora de forma medible una tarea de traducción de muy bajos recursos.

El checkpoint tiene 1.370.637.312 parámetros (1,3B) en formato safetensors, ocupa 5,5 GB en el repositorio y se distribuye con una licencia compuesta que hereda las restricciones del modelo base y del corpus de ajuste. Es un modelo de investigación, no un producto listo para producción comercial sin revisión legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia M2M-100 / NLLB-200, `m2m_100`) |
| Parametros totales | 1.370.637.312 (1,3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/INT8 no publicadas) |
| Idiomas soportados | arn (mapudungun), es (espanol); direccion ajustada arn→es |
| Licencia | `other` (`nllb-and-corpus-derived-terms`): CC-BY-NC 4.0 del modelo base + CC BY-NC-SA 3.0 del corpus Duan et al. |
| Formato de pesos | safetensors |
| Modelo base | facebook/nllb-200-distilled-1.3B |
| Tokenizacion | Morfessor + SentencePiece BPE intra-morfema |
| Metrica reportada | chrF++ medio a nivel de frase: 44,97 (condicion, tamano y direccion de este checkpoint) |
| Tamano del repositorio | 5,5 GB |

## Arquitectura y entrenamiento
La arquitectura es la del NLLB-200 distilled de 1,3B: un transformer encoder-decoder con atención estándar, heredado de la familia M2M-100, con los embeddings y la cabeza de salida multilingües originales. El ajuste fino se realiza sobre ese checkpoint, por lo que conserva la mayor parte del conocimiento multilingüe y adapta el par arn→es.

El detalle técnico diferencial está en el preprocesamiento y la tokenización: el texto en mapudungun se segmenta primero con Morfessor (segmentación morfológica no supervisada) y después cada morfema se tokeniza con SentencePiece BPE. El helper de inferencia del repositorio aplica ese preprocesamiento específico de la condición y elimina los marcadores de continuación `@@` de la salida en mapudungun. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO; el corpus de ajuste deriva del corpus de mapudungun de Duan et al. (CC BY-NC-SA 3.0). El checkpoint se describe como "paper-era training checkpoint", es decir, el usado para los resultados del artículo.

## Capacidades
- Traducción automática directa mapudungun → español, tarea principal del modelo.
- Manejo de morfología aglutinante mediante tokenización Morfessor + BPE, pensada para reducir la fragmentación de palabras mapudungun.
- Preprocesamiento específico de la condición integrado en el script `inference.py` (segmentación y limpieza de marcadores `@@`).
- Herencia de las capacidades multilingües del NLLB-200 distilled 1.3B, aunque el ajuste fino está orientado al par arn→es.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- No se documenta la dirección inversa es→arn como objetivo entrenado.

## Casos de uso
- Digitalización y traducción de textos comunitarios mapudungun: el modelo traduce documentos, actas o material educativo al español para su difusión, aprovechando el preprocesamiento morfológico que mejora la calidad en una lengua de bajos recursos.
- Investigación en traducción de lenguas indígenas: sirve como línea base reproducible (chrF++ 44,97) para comparar estrategias de tokenización en AmericNLP y trabajos similares.
- Subtitulado y traducción de contenido audiovisual en mapudungungun: se puede integrar en un pipeline ASR → MT → postedición, con revisión humana dado el carácter de investigación del checkpoint.
- Apoyo a la docencia y preservación lingüística: traducción asistida de materiales bilingües para escuelas y programas de revitalización del mapudungun.
- Evaluación de técnicas de tokenización morfológica: el repositorio permite reproducir la condición Morfessor-BPE y compararla con tokenización BPE estándar sobre el mismo corpus.
- Prototipos de servicios de traducción para comunidades mapuche: despliegue interno con revisión humana, teniendo en cuenta las restricciones no comerciales de la licencia.
- Análisis lingüístico computacional: uso del segmentador Morfessor y de las alineaciones para estudiar morfología mapuche a partir de las traducciones generadas.

## Benchmarks y rendimiento
El único dato publicado en la información disponible es la métrica chrF++ del artículo corregido para esta condición, tamaño y dirección.

| Metrica | Valor | Contexto |
|---|---|---|
| chrF++ medio a nivel de frase (arn→es) | 44,97 | Condición Morfessor-BPE, 1.3B, según `results/paper_stats.json` |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros sistemas en esta ficha.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16/bf16: en torno a 2,7-3 GB solo para pesos, más overhead de activaciones y del tokenizador; presupuesto práctico de 4-6 GB.
- En cuantización INT8: aproximadamente 1,4 GB de pesos; en INT4/GGUF (si se generan conversiones propias): en torno a 0,7-1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 cómodo (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100). Cabe en GPUs consumer de gama media.
- Despliegue: `transformers` 4.x es requisito explícito; el repositorio incluye `inference.py`. Para serving se puede usar vLLM o TGI si aceptan la arquitectura `m2m_100`; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mapudungun-nllb-1.3B-arn-es-morfessor-bpe | 1,3B | no disponible | Ajuste fino NLLB con tokenizacion Morfessor-BPE, arn→es | other (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | Hugging Face, 0 descargas |
| facebook/nllb-200-distilled-1.3B | 1,3B | no disponible | MT multilingue generica, 200 idiomas | CC-BY-NC 4.0 | Hugging Face, ampliamente usado |
| NLLB-200 denso 1.3B con BPE estandar ajustado a arn→es | 1,3B | no disponible | Misma base sin tokenizacion morfologica | segun corpus | No disponible como checkpoint publico en la informacion proporcionada |

La comparación cuantitativa frente a la variante con BPE estándar no está disponible en esta ficha; el artículo de referencia (Thompson et al., 2026) es la fuente para esa comparación.

## Limitaciones y advertencias
- Licencia no comercial: el modelo base NLLB-200 es CC-BY-NC 4.0 y el corpus de ajuste es CC BY-NC-SA 3.0; el uso comercial requiere revisión legal y probablemente no está permitido en los términos actuales.
- Modelo de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- Dirección única arn→es: no se garantiza calidad en es→arn ni en otros pares.
- Riesgo de alucinación y de traducciones fluentes pero incorrectas, habitual en modelos NLLB ajustados con corpus pequeños; se recomienda postedición humana.
- Sensibilidad al preprocesamiento: usar el modelo sin el pipeline Morfessor + BPE y la limpieza de `@@` del `inference.py` puede degradar la calidad de forma significativa.
- Cobertura limitada por el corpus Duan et al.: variedades dialectales, ortografías alternativas y vocabulario técnico pueden estar infrarepresentados.
- Longitud de contexto no documentada; textos largos deben dividirse en segmentos.
- No se documentan sesgos específicos ni evaluaciones de seguridad; al ser un modelo de traducción, puede reflejar sesgos del corpus y del NLLB base.

## Enlaces
- Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-1.3B-arn-es-morfessor-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Paper de referencia: Thompson, I. M., Rogers, B. M. A., Ringger, E. K. (2026). "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning". Proceedings of the Sixth Workshop on NLP for Indigenous Languages of the Americas (AmericasNLP 2026). Enlace directo no disponible en la informacion proporcionada.
- Corpus Duan et al. (mapudungun): enlace no disponible en la informacion proporcionada.
- Repositorio con `inference.py` y `results/paper_stats.json`: incluido en el repositorio de Hugging Face del modelo.

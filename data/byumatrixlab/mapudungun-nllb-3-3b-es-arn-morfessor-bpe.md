# byumatrixlab/mapudungun-nllb-3.3B-es-arn-morfessor-bpe

## Resumen

El modelo `mapudungun-nllb-3.3B-es-arn-morfessor-bpe` es un ajuste fino de `facebook/nllb-200-3.3B` desarrollado por el grupo byumatrixlab para la traducción automática entre castellano (`es`) y mapudungun (`arn`), una lengua indígena de Chile y Argentina con recursos digitales muy limitados. El checkpoint corresponde a la variante de tokenización "Morfessor-BPE", que aplica segmentación morfológica con Morfessor antes de un SentencePiece BPE intra-morfema, una estrategia diseñada para lenguas aglutinantes y de baja densidad de datos.

El modelo resuelve el problema concreto de la traducción castellano-mapudungun en un contexto en el que los sistemas MT multilingües genéricos rinden mal por la escasez de corpus paralelos y por la morfología compleja del mapudungun. Con 3.344.861.184 parámetros (3.3B) y arquitectura m2m_100, se distribuye en formato safetensors con un repositorio de 13,4 GB. La model card reporta un chrF++ medio a nivel de frase de 42,40 para esta condición, tamaño y dirección, según el pipeline corregido del artículo asociado.

La relevancia actual radica en que forma parte de un trabajo académico presentado en AmericasNLP 2026 sobre tokenización consciente de morfología para el ajuste de NLLB-200 en lenguas indígenas americanas, un área donde las decisiones de tokenización tienen un impacto medible en la calidad de traducción para lenguas de baja disponibilidad de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | m2m_100 (transformer encoder-decoder de NLLB-200) |
| Parametros totales | 3.344.861.184 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | arn (mapudungun), es (castellano) |
| Licencia | nllb-and-corpus-derived-terms (otras; sujeta a CC-BY-NC 4.0 del modelo base y CC BY-NC-SA 3.0 del corpus) |
| Formato de pesos | safetensors |
| Modelo base | facebook/nllb-200-3.3B |
| Pipeline | translation |
| Direccion reportada | es → arn |
| Metrica reportada | chrF++ medio a nivel de frase: 42,40 |
| Tamano del repositorio | 13,4 GB |

## Arquitectura y entrenamiento

El modelo se basa en `facebook/nllb-200-3.3B`, un transformer encoder-decoder de la familia m2m_100 con aproximadamente 3.300 millones de parámetros, ajustado mediante fine-tuning sobre el corpus paralelo de mapudungun derivado del corpus de Duan et al. La innovación técnica principal es la tokenización: segmentación Morfessor seguida de SentencePiece BPE dentro de los morfemas, lo que permite manejar la morfología aglutinante del mapudungun con un vocabulario más eficiente en datos escasos. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO.

El checkpoint se describe como "paper-era training checkpoint", es decir, el utilizado en el artículo de referencia. El pipeline de inferencia incluye un preprocesado específico para mapudungun y la eliminación de marcadores de continuación `@@` en la salida, lo que sugiere que el modelo produce segmentos morfológicos que deben recomponerse. La model card indica que se requiere Transformers 4.x.

## Capacidades

- Traducción automática castellano → mapudungun (dirección reportada con métrica).
- Traducción automática en el par es-arn, heredando el soporte multilingüe del modelo base NLLB-200 (aunque el ajuste se centra en este par).
- Manejo de morfología aglutinante mediante tokenización Morfessor-BPE con recomposición de segmentos `@@`.
- Preprocesado específico de mapudungun integrado en el script `inference.py`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües limitadas al par es-arn en la práctica; el modelo base soporta más lenguas, pero el ajuste fino puede degradar el rendimiento fuera del par objetivo.

## Casos de uso

- Traducción de documentación oficial y material educativo al mapudungun: el modelo puede traducir textos administrativos o escolares del castellano al mapudungun, aprovechando el preprocesado morfológico para preservar la estructura de palabras aglutinantes.
- Localización de interfaces y contenidos digitales para comunidades mapuches: integración en pipelines de localización que requieran traducción es→arn con control de calidad humano posterior, dado el chrF++ de 42,40.
- Investigación en lingüística computacional de lenguas indígenas: uso del checkpoint como línea base reproducible para experimentos de tokenización morfológica, comparando Morfessor-BPE frente a otras estrategias.
- Preservación y digitalización de patrimonio oral y escrito: traducción asistida de transcripciones y materiales para archivos lingüísticos, con revisión por hablantes nativos.
- Sistemas de atención ciudadana bilingües: traducción de comunicaciones de servicios públicos al mapudungun en entornos con recursos limitados, desplegando el modelo en infraestructura propia.
- Evaluación comparativa de modelos MT de baja resource: uso como referencia en benchmarks de traducción para lenguas indígenas americanas en el marco de AmericasNLP.
- Generación de corpus paralelos sintéticos: traducción masiva de texto castellano para ampliar datos de entrenamiento de otros sistemas, siempre que la licencia lo permita (uso no comercial).

## Benchmarks y rendimiento

| Metrica | Valor | Condicion |
|---|---|---|
| chrF++ medio a nivel de frase | 42,40 | es → arn, tokenización Morfessor-BPE, tamaño 3.3B |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos en la model card. El único dato de rendimiento es el chrF++ reportado en el artículo asociado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6,7 GB solo para pesos, más memoria para activaciones y KV cache; en la práctica se recomienda al menos 10-12 GB para secuencias cortas y más para lotes grandes.
- VRAM estimada en fp32: aproximadamente 13,4 GB solo para pesos, más overhead; requiere GPUs de 24 GB o más para comodidad.
- GPU recomendadas: A100 (40/80 GB), H100, L40S, RTX A6000 para producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en fp16 con lotes moderados.
- Compatibilidad con GPU de consumo: sí, en GPUs de 24 GB (RTX 3090, 4090) en fp16; en GPUs de 16 GB puede requerir cuantización o lotes pequeños, aunque no se documentan pesos cuantizados en el repositorio.
- Opciones de despliegue: Transformers 4.x con el script `inference.py` proporcionado; vLLM y TGI son compatibles con arquitecturas m2m_100, aunque no se documenta soporte explícito en la model card. llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mapudungun-nllb-3.3B-es-arn-morfessor-bpe | 3,34B | no disponible | chrF++ 42,40 (es→arn) | otras (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | Hugging Face |
| facebook/nllb-200-3.3B (base) | 3,3B | no disponible | no disponible para es-arn en esta ficha | CC-BY-NC 4.0 | Hugging Face |
| Otras variantes del mismo grupo (tokenización alternativa) | 3,3B | no disponible | no disponible | otras | Hugging Face (byumatrixlab) |

No se dispone de datos numéricos de modelos comparables de la misma categoría (MT mapudungun) en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo base NLLB-200 es CC-BY-NC 4.0 y el corpus de ajuste es CC BY-NC-SA 3.0; el uso comercial está prohibido salvo autorización expresa de ambas fuentes.
- El modelo está ajustado específicamente para es→arn; el rendimiento en la dirección inversa (arn→es) u otros pares puede degradarse respecto al modelo base.
- Riesgo de alucinación y de traducciones morfológicamente plausibles pero semánticamente incorrectas, especialmente en terminología técnica o neologismos ausentes del corpus.
- La tokenización Morfessor-BPE requiere el preprocesado específico del script `inference.py`; usos fuera de ese pipeline pueden producir salidas con marcadores `@@` mal recombinados.
- Sesgos derivados del corpus de entrenamiento (Duan et al.), de dominio y registro limitados; posible infrarrepresentación de variantes dialectales del mapudungun.
- Contexto máximo no documentado; no se garantiza el comportamiento en secuencias largas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema de validación externa muy reducido.
- No se documentan pesos cuantizados ni soporte explícito para vLLM, TGI o llama.cpp, lo que limita opciones de despliegue optimizado.
- Fecha de creación del repositorio (2026-11-13) posterior a la publicación del artículo citado; verificar la correspondencia exacta entre checkpoint y resultados del paper.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-3.3B-es-arn-morfessor-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-3.3B
- Articulo de referencia: Thompson, I. M., Rogers, B. M. A., Ringger, E. K. (2026). "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning". Proceedings of the Sixth Workshop on NLP for Indigenous Languages of the Americas (AmericasNLP 2026).
- Repositorio del autor: https://huggingface.co/byumatrixlab (perfil del grupo)

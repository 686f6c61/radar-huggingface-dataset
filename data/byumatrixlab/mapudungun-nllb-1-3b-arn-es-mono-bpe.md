# byumatrixlab/mapudungun-nllb-1.3B-arn-es-mono-bpe

## Resumen

El modelo `byumatrixlab/mapudungun-nllb-1.3B-arn-es-mono-bpe` es un ajuste fino del checkpoint `facebook/nllb-200-distilled-1.3B` especializado en traducción automática de mapudungun (código ISO `arn`) a español (`es`). Lo desarrolla el grupo byumatrixlab en el contexto de un trabajo académico presentado en AmericasNLP 2026, centrado en tokenización morfológicamente consciente para lenguas indígenas de América. El problema que aborda es la baja disponibilidad de sistemas de traducción de calidad para una lengua de bajos recursos como el mapudungun, hablada principalmente en Chile y Argentina.

La propuesta técnica del modelo consiste en aplicar una condición de tokenización específica: un vocabulario SentencePiece BPE entrenado únicamente con texto mapudungun ("mono BPE"), en lugar de reutilizar el tokenizador multilingüe original de NLLB-200. Según la model card, esta condición alcanza un chrF++ medio a nivel de frase de 43,99 en la dirección arn→es, un resultado reportado en el pipeline corregido del artículo asociado.

El checkpoint tiene 1.370.637.312 parámetros (aproximadamente 1,3B), un tamaño de repositorio de 5,5 GB y está pensado exclusivamente para la dirección mapudungun→español. Su relevancia radica en que documenta una estrategia reproducible de adaptación de un modelo multilingüe grande a una lengua de bajos recursos mediante cambios en la tokenización y ajuste fino supervisado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100 / NLLB-200 distilled) |
| Parámetros totales | 1.370.637.312 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | arn (mapudungun), es (español) |
| Licencia | `nllb-and-corpus-derived-terms` (otra; ver limitaciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-1.3B`, un transformer encoder-decoder de tipo m2m_100 destilado del NLLB-200 completo. Sobre esa base se realiza un ajuste fino supervisado para la dirección mapudungun→español, con una modificación clave en la tokenización: se emplea una condición "mono BPE", es decir, un vocabulario SentencePiece BPE entrenado solo con texto mapudungun, en lugar del vocabulario multilingüe original. El pipeline de inferencia incluido aplica un preprocesado específico para mapudungun y elimina los marcadores de continuación `@@` de la salida en mapudungun.

El corpus de ajuste fino deriva del corpus de mapudungun de Duan et al., distribuido bajo CC BY-NC-SA 3.0. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es precisamente la tokenización morfológicamente consciente descrita en el artículo de Thompson, Rogers y Ringger (AmericasNLP 2026), que busca adaptar la segmentación a la morfología aglutinante del mapudungun.

## Capacidades

- Traducción automática unidireccional de mapudungun a español.
- Preprocesado específico de mapudungun integrado en el script de inferencia (`inference.py`).
- Eliminación automática de marcadores de continuación `@@` en la salida mapudungun.
- Manejo de morfología aglutinante mediante tokenización BPE específica de la lengua.
- Compatible con la librería Transformers 4.x.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No se documentan capacidades multilingües más allá de arn y es.

## Casos de uso

- Traducción de documentación comunitaria: traducción de textos escritos en mapudungun a español para su difusión en contextos administrativos o educativos, aprovechando el preprocesado específico de la lengua incluido en el script de inferencia.
- Investigación en lenguas de bajos recursos: uso como línea base reproducible para experimentos de tokenización morfológica en traducción automática, dado que el modelo documenta una condición "mono BPE" concreta y un resultado chrF++ de referencia.
- Digitalización de corpus orales transcritos: conversión de transcripciones en mapudungun a español para su incorporación a archivos lingüísticos o proyectos de preservación.
- Apoyo a la enseñanza bilingüe: generación de borradores de traducción para materiales didácticos mapudungun-español, que después revisaría un hablante nativo.
- Evaluación comparativa de tokenizadores: el modelo sirve para contrastar el rendimiento de un vocabulario BPE específico de mapudungun frente al vocabulario multilingüe de NLLB-200 en tareas de traducción.
- Prototipado de herramientas de traducción para ONG y organismos locales: dado su tamaño de 1,3B, puede desplegarse en infraestructura modesta para pruebas piloto de traducción arn→es.

## Benchmarks y rendimiento

| Benchmark | Dirección | Resultado |
|---|---|---|
| chrF++ medio a nivel de frase | arn → es | 43,99 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,7 GB solo para pesos, más memoria para activaciones y KV cache; en la práctica se recomienda al menos 6-8 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 1,4 GB para pesos; en 4 bits, alrededor de 0,7 GB para pesos.
- GPU recomendadas: A100, H100 o L4 para despliegue en servidor; RTX 4090, RTX 3090 o RTX 4080 para estaciones de trabajo.
- Compatible con GPU de consumo: sí, cabe en tarjetas con 8 GB o más en fp16 y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: Transformers 4.x con el script `inference.py` incluido; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| byumatrixlab/mapudungun-nllb-1.3B-arn-es-mono-bpe | 1,37B | no disponible | arn, es | otra (NLLB + corpus) | Traducción arn→es con BPE específico |
| facebook/nllb-200-distilled-1.3B | 1,3B | no disponible | 200 idiomas (incluye arn) | CC-BY-NC 4.0 | Traducción multilingüe general |
| facebook/nllb-200-distilled-600M | 600M | no disponible | 200 idiomas | CC-BY-NC 4.0 | Traducción multilingüe general, menor tamaño |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo traduce en la dirección mapudungun→español; no se documenta la dirección inversa.
- La licencia es compuesta: el modelo base NLLB-200 está bajo CC-BY-NC 4.0 y el corpus de ajuste bajo CC BY-NC-SA 3.0, lo que restringe el uso comercial.
- El uso comercial requiere cumplir simultáneamente las condiciones de ambas fuentes; la licencia `other` no oculta estas obligaciones.
- No se documentan sesgos específicos, pero al derivar de NLLB-200 y de un corpus limitado, es probable que herede sesgos del material de entrenamiento.
- Riesgo de alucinación y de traducciones inexactas en terminología especializada o en variantes dialectales del mapudungun.
- El corpus de ajuste es de bajos recursos, por lo que la cobertura léxica y morfológica puede ser limitada.
- No se especifican la longitud de contexto efectiva ni el comportamiento en entradas largas.
- El checkpoint procede de un archivo de la época del artículo ("paper-era archived checkpoint"), lo que puede implicar que no reciba mantenimiento activo.
- Solo 15 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-1.3B-arn-es-mono-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Artículo asociado: Thompson, I. M., Rogers, B. M. A., Ringger, E. K. "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", Proceedings of the Sixth Workshop on NLP for Indigenous Languages of the Americas (AmericasNLP 2026).
- Repositorio del corpus de Duan et al.: no disponible en la información proporcionada.

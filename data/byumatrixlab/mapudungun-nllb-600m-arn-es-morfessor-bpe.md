# byumatrixlab/mapudungun-nllb-600M-arn-es-morfessor-bpe

## Resumen

El modelo `byumatrixlab/mapudungun-nllb-600M-arn-es-morfessor-bpe` es un checkpoint de traducción automática neuronal especializado en la dirección mapudungun (arn) a español (es), desarrollado por el grupo byumatrixlab. Se trata de un ajuste fino del modelo `facebook/nllb-200-distilled-600M` de Meta, un transformer encoder-decoder de 615.072.768 parámetros orientado a traducción multilingüe. El modelo aborda el problema de la traducción de una lengua indígena de bajos recursos, el mapudungun, hacia el español, incorporando una innovación de tokenización basada en morfemas.

La propuesta técnica central es el uso de segmentación Morfessor seguida de SentencePiece BPE dentro de cada morfema, una estrategia diseñada para lenguas con morfología aglutinante y rica como el mapudungun. Según la model card, esta condición alcanza un chrF++ medio a nivel de frase de 42,80 en la dirección arn→es, medido sobre un conjunto de test archivado de 9.382 predicciones. El modelo se publica como "reconstructed release run" (ejecución de publicación reconstruida) y la verificación de la release reprodujo exactamente todas las predicciones del checkpoint de la era del paper.

El modelo es relevante en el contexto de la preservación y digitalización de lenguas indígenas de América, donde los recursos paralelos son escasos y las herramientas de traducción comercial apenas cubren estas lenguas. Su publicación se acompaña de un paper aceptado en AmericasNLP 2026. La licencia es compuesta: hereda las obligaciones de NLLB-200 (CC-BY-NC 4.0) y del corpus Duan et al. (CC BY-NC-SA 3.0), lo que restringe el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100 / NLLB-200) |
| Parámetros totales | 615.072.768 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | arn (mapudungun), es (español) |
| Licencia | other: `nllb-and-corpus-derived-terms` (NLLB CC-BY-NC 4.0 + corpus CC BY-NC-SA 3.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder de tipo m2m_100 destilado, con 615.072.768 parámetros. Sobre esta base se realizó un ajuste fino supervisado para la dirección mapudungun→español. La innovación técnica destacable es el pipeline de tokenización: segmentación morfológica con Morfessor seguida de SentencePiece BPE aplicado dentro de cada morfema, lo que permite representar mejor la estructura aglutinante del mapudungun frente a una tokenización BPE estándar sobre la palabra completa.

El corpus de ajuste fino deriva del corpus de mapudungun de Duan et al., distribuido bajo CC BY-NC-SA 3.0. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos figuran como no disponibles. El helper de inferencia incluido aplica un preprocesado específico de la condición para el mapudungun y elimina los marcadores de continuación `@@` de la salida en mapudungun. La release se describe como una ejecución reconstruida que reproduce exactamente las 9.382 predicciones de test del checkpoint original del paper.

## Capacidades

- Traducción automática unidireccional mapudungun→español (la dirección inversa no se declara como objetivo del ajuste fino).
- Manejo de morfología aglutinante mediante tokenización Morfessor + BPE intra-morfema.
- Preprocesado específico de mapudungun integrado en el script de inferencia (`inference.py`).
- Limpieza de marcadores de continuación `@@` en la salida.
- Compatibilidad con la librería Transformers 4.x.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento (thinking mode).
- Capacidad multilingüe limitada a los dos idiomas del ajuste (arn, es); el modelo base NLLB-200 es multilingüe, pero el ajuste fino se centra en este par.

## Casos de uso

- Traducción de documentación comunitaria: traducción de textos administrativos, educativos o culturales del mapudungun al español para facilitar el acceso a servicios públicos, aprovechando el ajuste específico al par arn→es.
- Preservación digital de corpus orales transcritos: conversión de transcripciones en mapudungun a español para su catalogación y búsqueda en archivos lingüísticos, con el preprocesado morfológico incluido en el helper.
- Investigación en lingüística computacional de lenguas de bajos recursos: uso como baseline reproducible para experimentos de tokenización morfológica, dado que la release reproduce exactamente las predicciones del paper.
- Subtitulado y traducción de material audiovisual indígena: generación de subtítulos en español a partir de transcripciones en mapudungun para difusión de contenido cultural.
- Apoyo a la enseñanza bilingüe: herramienta de consulta para docentes que necesiten trasladar materiales del mapudungun al español, con la advertencia de revisión humana por el riesgo de alucinación.
- Traducción asistida en contextos de atención a comunidades mapuches: borradores de traducción para personal sanitario o jurídico, siempre con revisión por hablantes nativos.
- Evaluación comparativa de estrategias de tokenización: el checkpoint sirve como referencia para comparar Morfessor-BPE frente a otras segmentaciones en el mismo par de lenguas y tamaño de modelo.

## Benchmarks y rendimiento

La model card reporta un único dato de rendimiento: chrF++ medio a nivel de frase de **42,80** para la condición Morfessor-BPE, tamaño 600M y dirección arn→es, sobre 9.382 predicciones de test archivadas. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos en la información disponible.

| Métrica | Valor | Condición |
|---|---|---|
| chrF++ (frase, media) | 42,80 | arn→es, Morfessor-BPE, 600M |
| Predicciones de test archivadas | 9.382 | reproducidas exactamente en la release |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,5 GB solo de pesos (615M parámetros × 4 bytes), más overhead de activaciones.
- VRAM estimada en fp16/bf16: aproximadamente 1,3 GB de pesos, más overhead; cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. También puede ejecutarse en CPU para volúmenes bajos.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más.
- Opciones de despliegue: el repositorio incluye `inference.py` basado en Transformers 4.x; es compatible con frameworks estándar de inferencia para modelos m2m_100 (por ejemplo, vLLM o TGI, aunque no se confirma soporte explícito en la información disponible). No se publican pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| mapudungun-nllb-600M-arn-es-morfessor-bpe | 615M | no disponible | arn, es | other (NC) | Ajuste fino NLLB con tokenización Morfessor-BPE |
| facebook/nllb-200-distilled-600M | 615M | 512 tokens (modelo base NLLB-200) | 200 idiomas | CC-BY-NC 4.0 | Traducción multilingüe generalista |
| NLLB-200 original (no destilado) | 54,5B (MoE) | 512 tokens | 200 idiomas | CC-BY-NC 4.0 | Traducción multilingüe de alta capacidad |

La comparación con otros ajustes finos específicos para mapudungun no está disponible en la información proporcionada. El modelo base NLLB-200 distilled 600M sirve como referencia directa, ya que el ajuste fino parte de él y añade la capa de tokenización morfológica específica.

## Limitaciones y advertencias

- Licencia no comercial: hereda CC-BY-NC 4.0 de NLLB-200 y CC BY-NC-SA 3.0 del corpus Duan et al.; el uso comercial está restringido y los usuarios deben cumplir ambas obligaciones.
- Dirección única: el ajuste fino está orientado a arn→es; el rendimiento en es→arn no está garantizado ni documentado.
- Riesgo de alucinación: como todo modelo generativo de traducción, puede producir traducciones plausibles pero incorrectas, especialmente en terminología cultural específica; se recomienda revisión por hablantes nativos.
- Sesgos: no se documentan análisis de sesgo; el corpus de entrenamiento procede de una única fuente (Duan et al.), lo que puede limitar la variación dialectal del mapudungun cubierta.
- Contexto: la longitud de contexto efectiva no se especifica en la model card; el modelo base NLLB-200 tiene 512 tokens, pero no se confirma para este checkpoint.
- Requiere preprocesado específico: el helper `inference.py` aplica la tokenización Morfessor-BPE; usar el modelo sin ese preprocesado puede degradar la calidad.
- Dependencia de Transformers 4.x: la model card indica explícitamente este requisito.
- Idiomas limitados: solo arn y es; no debe asumirse capacidad multilingüe más allá del par ajustado.
- Reproducibilidad: la release se describe como reconstruida; aunque reproduce exactamente las predicciones archivadas, no se detalla el proceso de reconstrucción.

## Enlaces

- Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-600M-arn-es-morfessor-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper (referencia en la model card): Thompson, Rogers y Ringger, "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026.
- Corpus de referencia: Duan et al., corpus de mapudungun (CC BY-NC-SA 3.0).
- Repositorio de código: no disponible en la información proporcionada.
- Demo: no disponible en la información proporcionada.

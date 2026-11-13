# byumatrixlab/mapudungun-nllb-600M-arn-es-morfessor

## Resumen

El modelo `byumatrixlab/mapudungun-nllb-600M-arn-es-morfessor` es un ajuste fino de `facebook/nllb-200-distilled-600M` especializado en traducción automática de mapudungun (código ISO `arn`) a español (`es`). Lo desarrolla el grupo byumatrixlab y forma parte de un trabajo académico presentado en el Sixth Workshop on NLP for Indigenous Languages of the Americas (AmericasNLP 2026), centrado en tokenización consciente de la morfología para lenguas de bajos recursos.

La innovación principal es la aplicación de segmentación Morfessor no supervisada sobre el texto en mapudungun antes del ajuste fino, lo que permite al modelo manejar mejor la naturaleza aglutinante de esta lengua. Con 615.072.768 parámetros, se mantiene en el rango de modelos ligeros, desplegables en hardware modesto, y reporta un chrF++ medio a nivel de frase de 43,09 en la dirección arn→es.

Su relevancia radica en que aborda una dirección lingüística prácticamente ausente en los sistemas de traducción comercial, con una metodología reproducible y un checkpoint archivado de la era del paper. Es un recurso útil tanto para investigadores en lenguas indígenas como para desarrolladores que necesiten integrar traducción mapudungun-español en herramientas comunitarias o educativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100 / NLLB-200) |
| Parámetros totales | 615.072.768 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones GGUF/otros no publicadas en el repo) |
| Idiomas soportados | arn (mapudungun), es (español) |
| Licencia | `other` — nllb-and-corpus-derived-terms (NLLB-200: CC-BY-NC 4.0; corpus Duan et al.: CC BY-NC-SA 3.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder de tipo m2m_100 destilado, con 615 millones de parámetros. Sobre ese checkpoint se realiza un ajuste fino supervisado para la dirección mapudungun→español. La particularidad metodológica es el preprocesamiento del lado fuente: se aplica segmentación Morfessor no supervisada al mapudungun, lo que introduce fronteras morfológicas explícitas que el tokenizador y el encoder pueden explotar. El helper de inferencia elimina además los marcadores de continuación `@@` del texto de salida en mapudungun.

El corpus de ajuste fino deriva del corpus de mapudungun de Duan et al. (CC BY-NC-SA 3.0). No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO; el pipeline descrito es de ajuste fino supervisado con la preprocesamiento morfológico como elemento diferenciador. El checkpoint publicado corresponde a un estado archivado de la era del paper.

## Capacidades

- Traducción automática unidireccional mapudungun→español.
- Manejo de morfología aglutinante mediante segmentación Morfessor en el lado fuente.
- Preprocesamiento específico de la condición (segmentación y limpieza de marcadores `@@` en salida).
- Traducción de frases individuales y textos cortos en el par arn→es.
- Integración con la librería `transformers` 4.x.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada a los dos idiomas del ajuste (arn, es); no se garantiza el comportamiento del resto de lenguas del NLLB original tras el fine-tuning.

## Casos de uso

- Traducción de documentación comunitaria mapuche: el modelo puede traducir textos breves de organizaciones, avisos o materiales educativos del mapudungun al español, aprovechando la segmentación morfológica para preservar la estructura de palabras aglutinantes.
- Herramientas de preservación lingüística: integración en glosarios o plataformas de aprendizaje que necesiten una capa de traducción automática arn→es como apoyo, con revisión humana posterior.
- Investigación en NLP de bajos recursos: reproducción de experimentos de tokenización morfológica comparando este checkpoint con el NLLB base sin Morfessor, dado que el paper documenta la condición y la métrica.
- Subtitulado o transcripción asistida: traducción de fragmentos hablados transcritos en mapudungun a español para archivos audiovisuales comunitarios.
- Atención ciudadana bilingüe: como componente de un sistema que reciba consultas en mapudungun y las derive a español para su procesamiento por parte de personal no hablante, siempre con validación humana.
- Publicación de contenidos divulgativos: traducción de notas breves o resúmenes del mapudungun al español para medios locales, con edición posterior por hablantes nativos.

## Benchmarks y rendimiento

| Métrica | Valor | Condición |
|---|---|---|
| chrF++ medio a nivel de frase | 43,09 | arn→es, tamaño 600M, condición Morfessor |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otras métricas comparativas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,5 GB solo de pesos, más overhead de activaciones; en fp16/bf16 aproximadamente 1,3 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con batches pequeños; A100, H100 o RTX 4090 para mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 o superiores; también en GPUs con 6-8 GB usando precisión reducida.
- Opciones de despliegue: `transformers` 4.x (requerido por el autor), potencialmente vLLM o TGI para servir el modelo, y conversión a GGUF para llama.cpp/Ollama si se generan dichos artefactos (no publicados en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas del ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mapudungun-nllb-600M-arn-es-morfessor | 615 M | no disponible | arn, es | other (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | Hugging Face, 9 descargas |
| facebook/nllb-200-distilled-600M (base) | 615 M | 512 tokens (estándar NLLB) | 200 lenguas (arn incluido) | CC-BY-NC 4.0 | Hugging Face, ampliamente usado |
| NLLB-200 1.3B / 3.3B (base) | 1,3 B / 3,3 B | 512 tokens (estándar NLLB) | 200 lenguas | CC-BY-NC 4.0 | Hugging Face |

La comparación directa con el NLLB base es la más pertinente: este checkpoint añade el preprocesamiento Morfessor y el ajuste específico arn→es, pero no se dispone de cifras de mejora frente al base en la información proporcionada. No se identifican otros modelos públicos específicos para mapudungun→español en los datos disponibles.

## Limitaciones y advertencias

- Licencia no comercial: el modelo hereda las restricciones de NLLB-200 (CC-BY-NC 4.0) y del corpus Duan et al. (CC BY-NC-SA 3.0); el uso comercial requiere evaluar ambas licencias por separado.
- Riesgo de alucinación y de traducciones plausibles pero incorrectas, especialmente en terminología especializada o en variedades dialectales del mapudungun.
- Dirección única: el checkpoint está ajustado para arn→es; el rendimiento en es→arn u otras direcciones no está garantizado.
- Corpus de entrenamiento limitado y derivado de una única fuente, lo que puede introducir sesgos de dominio y de registro.
- Requiere el preprocesamiento específico (segmentación Morfessor y limpieza de `@@`); usar el modelo sin el helper `inference.py` puede degradar la calidad de salida.
- Volumen de descargas muy bajo (9) y ausencia de validación comunitaria amplia; conviene evaluar en el dominio objetivo antes de producción.
- No se documentan límites de contexto ni comportamiento con secuencias largas; se recomienda trabajar con frases o párrafos cortos.
- No dispone de tool calling ni de capacidades de agente, por lo que no es adecuado como modelo orquestador.

## Enlaces

- Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-600M-arn-es-morfessor
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper de referencia: Thompson, Rogers y Ringger, "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026 (enlace directo no disponible en la información proporcionada).
- Corpus Duan et al. de mapudungun: no disponible enlace directo en la información proporcionada.
- Morfessor: no disponible enlace directo en la información proporcionada.

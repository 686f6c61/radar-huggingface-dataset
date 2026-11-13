# byumatrixlab/mapudungun-nllb-1.3B-arn-es-unigram-lm

## Resumen

El modelo `mapudungun-nllb-1.3B-arn-es-unigram-lm` es un ajuste fino del checkpoint `facebook/nllb-200-distilled-1.3B` especializado en traducción del mapudungun (código ISO `arn`) al castellano (`es`). Lo publica el autor `byumatrixlab` como parte del trabajo descrito en el artículo "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning" (Thompson, Rogers y Ringger, AmericasNLP 2026). El modelo resuelve un problema clásico de las lenguas de bajos recursos: la tokenización inadecuada de una lengua aglutinante y polisintética como el mapudungun, que fragmenta las palabras en excesivos subtokens y degrada la calidad de la traducción.

La innovación principal es el uso de una condición de tokenización específica para mapudungun basada en SentencePiece UnigramLM, que sustituye o complementa el tokenizador original de NLLB. El checkpoint mantiene la arquitectura transformer encoder-decoder de NLLB-200 distilled, con 1.370.637.312 parámetros totales y un tamaño de repositorio de 5,5 GB en formato safetensors. La dirección soportada es únicamente mapudungun a castellano.

Es relevante porque demuestra que un ajuste fino con tokenización morfológicamente consciente sobre un modelo multilingüe ya existente mejora de forma medible una lengua indígena con pocos recursos, y porque publica la métrica de referencia (chrF++ de 44,64 a nivel de frase) junto con el checkpoint, lo que facilita la reproducibilidad. La licencia es restrictiva: hereda las obligaciones de NLLB-200 (CC-BY-NC 4.0) y del corpus de ajuste (CC BY-NC-SA 3.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (NLLB-200 distilled, M2M-100) |
| Parametros totales | 1.370.637.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arn (mapudungun), es (castellano) |
| Licencia | other (nllb-and-corpus-derived-terms): NLLB-200 CC-BY-NC 4.0 + corpus Duan et al. CC BY-NC-SA 3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-1.3B`, un transformer encoder-decoder con atención multi-cabeza estándar y tokenizador multilingüe SentencePiece. El ajuste fino se realiza para la dirección mapudungun a castellano e incorpora una condición de tokenización específica para mapudungun basada en SentencePiece UnigramLM, que el autor describe como "Mapudungun-only SentencePiece UnigramLM condition". Esta condición busca adaptar la segmentación subword a la morfología aglutinante del mapudungun, reduciendo la fragmentación de palabras y mejorando la señal de entrenamiento.

El corpus de ajuste deriva del corpus de mapudungun de Duan et al., distribuido bajo CC BY-NC-SA 3.0. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; esos datos no están disponibles en la información proporcionada. El checkpoint se describe como "paper-era training checkpoint", es decir, el usado en la fase experimental del artículo. El helper de inferencia (`inference.py`) aplica un preprocesado específico de la condición sobre el mapudungun y elimina los marcadores de continuación `@@` de la salida.

## Capacidades

- Traducción de mapudungun a castellano, dirección única según la model card.
- Tokenización morfológicamente adaptada al mapudungun mediante SentencePiece UnigramLM.
- Preprocesado específico de la condición integrado en el script de inferencia.
- Eliminación de marcadores de continuación `@@` en la salida generada.
- Compatibilidad con la librería Transformers 4.x.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No se documenta soporte multilingüe más allá de arn y es.

## Casos de uso

- Traducción de documentación comunitaria: el modelo puede traducir textos escritos en mapudungun al castellano para su publicación o archivo, aprovechando el ajuste específico sobre la morfología de la lengua.
- Digitalización y acceso a corpus: integrado en pipelines de procesamiento de corpus de mapudungun, permite generar versiones en castellano de materiales previamente monolingües.
- Investigación en lenguas de bajos recursos: sirve como punto de partida reproducible para experimentos de tokenización morfológica en NLLB-200, dado que el checkpoint y la métrica de referencia están publicados.
- Evaluación comparativa de tokenizadores: permite contrastar la condición UnigramLM frente a otras condiciones de tokenización sobre el mismo modelo base y corpus.
- Preservación lingüística: facilita la creación de traducciones de referencia para materiales educativos o de documentación del mapudungun.
- Prototipado de sistemas de traducción asistida: con 1,3B parámetros y pesos safetensors, puede desplegarse en entornos de investigación para validar flujos de traducción arn→es antes de escalar a modelos mayores.
- Análisis morfológico asistido: la tokenización adaptada puede usarse para estudiar la segmentación de palabras mapudungun en contextos de traducción.

## Benchmarks y rendimiento

| Metrica | Condicion | Direccion | Valor |
|---|---|---|---|
| chrF++ (nivel de frase, media) | UnigramLM, 1.3B | arn → es | 44,64 |

El dato procede del `results/paper_stats.json` del repositorio y corresponde al pipeline corregido del artículo. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 5,5 GB solo para pesos, más memoria para activaciones y KV cache.
- VRAM estimada en fp16/bf16: alrededor de 2,8-3,5 GB para pesos, más overhead de inferencia.
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia en fp16 con buen throughput; GPU con al menos 8-12 GB para fp16.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más en fp16 (por ejemplo RTX 3070/4060 Ti o superiores), siempre que se gestione el overhead de memoria.
- Opciones de despliegue: Transformers 4.x con el script `inference.py` incluido; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mapudungun-nllb-1.3B-arn-es-unigram-lm | 1.370.637.312 | no disponible | arn, es | other (NLLB CC-BY-NC 4.0 + corpus CC BY-NC-SA 3.0) | Hugging Face, 0 descargas |
| facebook/nllb-200-distilled-1.3B | 1,3B (aprox.) | no disponible | 200 idiomas | CC-BY-NC 4.0 | Hugging Face |
| NLLB-200 denso (variantes mayores) | 3,3B / 54B (aprox.) | no disponible | 200 idiomas | CC-BY-NC 4.0 | Hugging Face |

La comparativa se limita al modelo base y a variantes de la familia NLLB-200; no se dispone de datos de rendimiento de alternativas específicas para mapudungun en la información proporcionada.

## Limitaciones y advertencias

- La licencia es no comercial por doble vía: NLLB-200 es CC-BY-NC 4.0 y el corpus de Duan et al. es CC BY-NC-SA 3.0; el uso comercial requiere revisar ambas obligaciones.
- La dirección soportada es únicamente mapudungun a castellano; no se documenta la dirección inversa.
- Solo cubre dos idiomas (arn, es); no es un modelo multilingüe general pese a derivar de NLLB-200.
- Riesgo de alucinación y de traducciones inexactas inherente a un modelo de 1,3B ajustado sobre un corpus de bajos recursos.
- Posibles sesgos derivados del corpus de entrenamiento y de la variedad dialectal representada en él.
- No se documentan la longitud de contexto, los tipos de cuantización ni el throughput, lo que dificulta planificar despliegues en producción.
- El preprocesado específico de la condición debe aplicarse mediante el helper incluido; usos fuera de ese pipeline pueden degradar la calidad.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria documentada.
- Requiere Transformers 4.x; no se garantiza compatibilidad con versiones anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-1.3B-arn-es-unigram-lm
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Artículo citado: Thompson, I. M., Rogers, B. M. A. y Ringger, E. K. (2026). "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning". Proceedings of the Sixth Workshop on NLP for Indigenous Languages of the Americas (AmericasNLP 2026). Sin URL disponible en la información proporcionada.

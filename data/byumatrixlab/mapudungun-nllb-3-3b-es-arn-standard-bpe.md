# byumatrixlab/mapudungun-nllb-3.3B-es-arn-standard-bpe

## Resumen

El modelo `mapudungun-nllb-3.3B-es-arn-standard-bpe` es un ajuste fino de `facebook/nllb-200-3.3B` especializado en traducción del español al mapudungun (código ISO `arn`), una lengua indígena de Chile y Argentina con recursos digitales muy limitados. Lo desarrolla el grupo byumatrixlab en el marco de un trabajo académico presentado en el taller AmericasNLP 2026, y su objetivo es incorporar el mapudungun al ecosistema de traducción automática moderna aprovechando un modelo multilingüe de gran cobertura.

La variante concreta que nos ocupa emplea el tokenizador SentencePiece original de NLLB-200 sin presegmentación externa ("standard BPE"), lo que la convierte en la condición de referencia frente a otras variantes con tokenización consciente de la morfología. Con 3.344.861.184 parámetros y un repositorio de 26,8 GB en formato safetensors, el modelo mantiene la arquitectura transformer encoder-decoder propia de la familia M2M-100/NLLB.

Su relevancia radica en que ofrece un punto de partida reproducible para una dirección de traducción (es→arn) escasamente cubierta por sistemas comerciales, con una métrica declarada de chrF++ de 42,89 a nivel de frase según el pipeline corregido del artículo. La licencia es heredada y restrictiva: combina la CC-BY-NC 4.0 de NLLB-200 con la CC BY-NC-SA 3.0 del corpus de ajuste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia M2M-100 / NLLB-200) |
| Parametros totales | 3.344.861.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arn (mapudungun), es (español) |
| Licencia | other (`nllb-and-corpus-derived-terms`): CC-BY-NC 4.0 del modelo base + CC BY-NC-SA 3.0 del corpus |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `facebook/nllb-200-3.3B`, un transformer encoder-decoder denso de 3.300 millones de parámetros entrenado originalmente sobre 200 lenguas. El ajuste fino se realiza para la dirección español→mapudungun conservando el tokenizador SentencePiece nativo de NLLB-200, sin presegmentación morfológica externa; esta es precisamente la condición "standard BPE" que el artículo compara con variantes de tokenización consciente de la morfología del mapudungun.

El corpus de ajuste deriva del corpus de mapudungun de Duan et al., distribuido bajo CC BY-NC-SA 3.0. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; en el contexto de traducción automática supervisada de baja recursos, lo habitual es un ajuste supervisado sobre pares paralelos, pero este extremo no se confirma en la información disponible. El checkpoint se describe como "paper-era archived checkpoint", es decir, la versión utilizada para generar los resultados publicados.

## Capacidades

- Traducción automática unidireccional español→mapudungun (`es`→`arn`).
- Preprocesamiento específico del mapudungun aplicado por el script auxiliar `inference.py`, con eliminación de marcadores de continuación `@@` en la salida.
- Manejo de morfología aglutinante del mapudungun mediante el tokenizador BPE estándar de NLLB-200.
- Generación de texto condicionada a la tarea de traducción; no se documentan capacidades de razonamiento general, código o matemáticas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües limitadas a los dos idiomas declarados (`arn`, `es`); no se documenta transferencia a otras lenguas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Traducción de documentación administrativa al mapudungun: el modelo permite versionar textos oficiales en `arn` a partir del original en español, aprovechando que la dirección es→arn es la cubierta por el ajuste fino.
- Localización de materiales educativos bilingües: útil para producir guías escolares en mapudungun con revisión humana posterior, dado el carácter de baja recursos del par.
- Preservación y difusión cultural: traducción de resúmenes, artículos divulgativos y contenidos patrimoniales al mapudungun para publicaciones comunitarias.
- Investigación en traducción de baja recursos: sirve como línea base "standard BPE" frente a variantes con tokenización morfológica en experimentos comparativos reproducibles.
- Generación de subtítulos y textos breves: adecuado para frases cortas donde la métrica chrF++ a nivel de frase (42,89) es representativa del rendimiento esperado.
- Prototipado de asistentes de traducción para servicios públicos en zonas con hablantes de mapudungun, siempre con revisión por hablantes nativos antes de producción.
- Anotación asistida de corpus paralelos: el modelo puede pre-traducir segmentos es→arn que después se corrigen manualmente para ampliar el corpus.

## Benchmarks y rendimiento

| Benchmark | Condición | Resultado |
|---|---|---|
| chrF++ (nivel de frase, media) | es→arn, tamaño 3.3B, tokenización BPE estándar | 42,89 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de propósito general, que además no aplican a un modelo de traducción especializado. Tampoco se ofrecen comparaciones numéricas con otras variantes del mismo estudio más allá de la cifra citada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 6,7 GB solo para pesos (3.344.861.184 parámetros × 2 bytes), más overhead de activaciones y del tokenizador; el repositorio ocupa 26,8 GB, lo que sugiere que incluye múltiples precisiones o checkpoints.
- GPU recomendadas: A100 o H100 para despliegue en producción con mayor throughput; una RTX 4090 (24 GB) es suficiente para inferencia en fp16 de una sola instancia.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8-12 GB de VRAM en fp16; en cuantización de 8 bits o inferior podría caber en GPUs de 6-8 GB, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: `transformers` 4.x (requisito explícito de la model card); no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mapudungun-nllb-3.3B-es-arn-standard-bpe | 3.344.861.184 | no disponible | arn, es | other (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | Ajuste fino es→arn, chrF++ 42,89 |
| facebook/nllb-200-3.3B | 3.300 M aprox. | no disponible | 200 lenguas | CC-BY-NC 4.0 | Modelo base; cobertura de `arn` limitada sin ajuste |
| Otras variantes del estudio (tokenización morfológica) | 3.3B | no disponible | arn, es | heredada del corpus | Misma base, distinta tokenización; comparación cualitativa en el artículo |

No se dispone de datos numéricos de modelos alternativos comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: el modelo base NLLB-200 es CC-BY-NC 4.0 y el corpus de ajuste CC BY-NC-SA 3.0; el uso comercial requiere evaluar ambas obligaciones y, en su caso, negociar licencias con los titulares.
- Riesgo de alucinación y de traducciones morfológicamente incorrectas en el mapudungun, especialmente en terminología técnica o neologismos ausentes del corpus.
- Dirección única: el ajuste está orientado a es→arn; el rendimiento en arn→es no está documentado.
- Cobertura lingüística restringida a dos idiomas; no debe esperarse transferencia a otras lenguas indígenas.
- Corpus de entrenamiento de baja recursos: posibles sesgos derivados de la composición del corpus de Duan et al. y de la variante dialectal representada.
- Sin datos publicados sobre longitud de contexto efectiva, cuantizaciones oficiales ni latencia, lo que dificulta el dimensionamiento en producción.
- Requiere `transformers` 4.x y el script `inference.py` del repositorio para aplicar el preprocesamiento correcto; un uso directo sin ese paso puede degradar la calidad de salida.
- Recomendable revisión por hablantes nativos antes de cualquier despliegue en contextos sensibles (salud, administración, educación).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-3.3B-es-arn-standard-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-3.3B
- Artículo de referencia: Thompson, Rogers y Ringger, "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", Proceedings of AmericasNLP 2026 (sin URL disponible en la información proporcionada).
- Repositorio del autor: no disponible.

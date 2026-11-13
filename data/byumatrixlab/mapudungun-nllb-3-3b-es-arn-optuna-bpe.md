# byumatrixlab/mapudungun-nllb-3.3B-es-arn-optuna-bpe

## Resumen

El modelo `byumatrixlab/mapudungun-nllb-3.3B-es-arn-optuna-bpe` es un ajuste fino de `facebook/nllb-200-3.3B` especializado en traducción automática del español al mapudungun (código ISO `arn`), una lengua indígena de Chile con recursos digitales muy limitados. Lo desarrolla el grupo byumatrixlab en el marco de un trabajo académico presentado en el taller AmericasNLP 2026, y su aportación principal es la incorporación de una tokenización morfológicamente consciente para el mapudungun mediante SentencePiece BPE con vocabulario seleccionado por un estudio de Optuna.

El checkpoint emplea la arquitectura m2m_100 propia de NLLB-200, con 3.344.861.184 parámetros y pesos en formato safetensors. La innovación no reside en la arquitectura, que se mantiene intacta respecto al modelo base, sino en la adaptación del vocabulario y del preprocesado específico para el mapudungun, una lengua aglutinante cuya morfología compleja penaliza los tokenizadores entrenados sobre todo con lenguas de altos recursos.

El modelo es relevante porque aborda un par lingüístico prácticamente ausente en los sistemas de traducción comerciales y demuestra que una intervención de tokenización bien diseñada puede mejorar de forma medible la calidad en lenguas de bajos recursos. Su licencia derivada (NLLB CC-BY-NC 4.0 más el corpus CC BY-NC-SA 3.0) restringe el uso comercial, lo que conviene tener en cuenta antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder m2m_100 (NLLB-200) |
| Parametros totales | 3.344.861.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (NLLB-200 base usa 1024 tokens, no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arn (mapudungun), es (espanol) |
| Licencia | other (nllb-and-corpus-derived-terms): NLLB-200 CC-BY-NC 4.0 + corpus Duan et al. CC BY-NC-SA 3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `facebook/nllb-200-3.3B`, un transformer encoder-decoder de la familia m2m_100 con 3.300 millones de parámetros entrenado originalmente por Meta sobre datos multilingües masivos. El ajuste fino se realiza exclusivamente para la dirección español a mapudungun y conserva la arquitectura del modelo base, por lo que no introduce cambios en el mecanismo de atención ni en el número de capas.

La contribución técnica del trabajo es la definición de una condición de tokenización específica para el mapudungun: un vocabulario SentencePiece BPE cuyo tamaño se seleccionó mediante un estudio de Optuna, tal como describe el artículo asociado ("Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning"). El pipeline de inferencia aplica un preprocesado específico para el mapudungun y elimina los marcadores de continuación `@@` de la salida. El corpus de ajuste deriva del corpus de mapudungun de Duan et al. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Traducción automática unidireccional de español a mapudungun.
- Manejo de morfología aglutinante del mapudungun gracias al tokenizador BPE específico.
- Preprocesado y postprocesado integrados mediante el script `inference.py` del repositorio.
- Compatibilidad con la librería Transformers 4.x.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada a los dos idiomas del par (es, arn); no se garantiza el comportamiento en otros pares de NLLB.

## Casos de uso

- Traducción de documentación administrativa y educativa al mapudungun: el modelo permite generar versiones en mapudungun de materiales oficiales, aprovechando el ajuste específico sobre el par es-arn y el preprocesado morfológico incluido.
- Localización de contenidos digitales para comunidades mapuche: traducción de webs, aplicaciones y textos divulgativos donde los sistemas comerciales no ofrecen cobertura.
- Investigación en lingüística computacional de lenguas indígenas: sirve como línea base reproducible para experimentos de tokenización y ajuste fino en lenguas de bajos recursos.
- Apoyo a la enseñanza bilingüe español-mapudungun: generación de glosas y traducciones de material didáctico para programas de educación intercultural.
- Preservación y digitalización de patrimonio lingüístico: traducción asistida de textos de referencia que alimenten corpus paralelos es-arn.
- Evaluación comparativa de tokenizadores: el checkpoint permite medir el impacto del vocabulario BPE seleccionado por Optuna frente a configuraciones alternativas, dado que el artículo reporta chrF++ de 42,33 a nivel de oración para esta condición.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| chrF++ (nivel de oracion, es->arn) | 42,33 | Media reportada en el paper para esta condición y tamaño |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6,7 GB solo para pesos, más memoria para activaciones y caché; en la práctica se recomienda al menos 10-12 GB.
- En cuantización de 8 bits, los pesos ocuparían unos 3,3 GB; en 4 bits, unos 1,7 GB, aunque no se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: A100, H100 o L40S para despliegues de producción; RTX 4090, RTX 3090 o A10G para inferencia en fp16.
- Cabe en GPU de consumo con 12 GB o más en fp16; con cuantización podría ejecutarse en GPUs de 8 GB, aunque no hay validación publicada.
- Opciones de despliegue: Transformers 4.x con el script `inference.py` del repositorio; no se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| mapudungun-nllb-3.3B-es-arn-optuna-bpe | 3.344.861.184 | no disponible | es, arn | other (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | Ajuste fino con tokenizacion morfologica |
| facebook/nllb-200-3.3B | 3.300 millones aprox. | 1024 tokens (segun documentacion del modelo base) | 200 idiomas | CC-BY-NC 4.0 | Modelo base multilingue sin ajuste especifico |
| Otros checkpoints del mismo grupo (condiciones alternativas) | 3.300 millones aprox. | no disponible | es, arn | other | Variantes de tokenizacion comparadas en el paper |

No se dispone de datos de rendimiento comparativo con otros sistemas de traduccion es-arn en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: el modelo base NLLB-200 está bajo CC-BY-NC 4.0 y el corpus de ajuste bajo CC BY-NC-SA 3.0, por lo que el uso comercial está restringido y sujeto a ambas obligaciones.
- Traducción unidireccional: solo se ha ajustado para español a mapudungun; no se garantiza calidad en la dirección inversa.
- Riesgo de alucinación y de traducciones gramaticalmente plausibles pero semánticamente incorrectas, habitual en modelos de traducción con datos limitados.
- Sesgos derivados del corpus Duan et al., cuya composición y dominio no se detallan; puede haber cobertura desigual de variantes dialectales del mapudungun.
- El checkpoint es "paper-era archived": no se garantiza mantenimiento ni actualizaciones.
- Requiere Transformers 4.x y el preprocesado específico del repositorio; usarlo sin ese pipeline puede degradar la calidad.
- No se documentan longitudes máximas de secuencia ni comportamiento fuera del dominio del corpus de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-3.3B-es-arn-optuna-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-3.3B
- Paper de referencia: Thompson, Rogers y Ringger, "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026 (sin URL disponible en la informacion proporcionada)
- Corpus Duan et al. de mapudungun: sin URL disponible en la informacion proporcionada

# byumatrixlab/mapudungun-nllb-1.3B-es-arn-unigram-lm

## Resumen

El modelo `byumatrixlab/mapudungun-nllb-1.3B-es-arn-unigram-lm` es un ajuste fino de `facebook/nllb-200-distilled-1.3B` especializado en traducción del español al mapudungun (código ISO `arn`), una lengua indígena de Chile y Argentina con recursos digitales muy limitados. Lo desarrolla el grupo byumatrixlab en el contexto de un trabajo académico presentado en el taller AmericasNLP 2026, centrado en tokenización consciente de la morfología para lenguas de bajos recursos.

La particularidad técnica del checkpoint es el uso de una condición de tokenización basada en un modelo SentencePiece UnigramLM entrenado exclusivamente sobre mapudungun, en lugar del tokenizador multilingüe original de NLLB. Esta decisión busca adaptar la segmentación subpalabra a la estructura morfológica aglutinante del mapudungun, un problema recurrente cuando se reutilizan modelos multilingües masivos en lenguas con poca presencia en el corpus de preentrenamiento.

El modelo tiene 1.370.637.312 parámetros, una arquitectura transformer encoder-decoder (M2M-100/NLLB) y se distribuye en formato safetensors con un tamaño de repositorio de 5,5 GB. Su relevancia actual radica en que demuestra que el ajuste fino selectivo con tokenización adaptada puede mejorar la traducción hacia lenguas de bajos recursos sin necesidad de reentrenar desde cero, y publica una métrica concreta (chrF++ 41,05 a nivel de frase) que sirve como referencia reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia M2M-100 / NLLB-200) |
| Parametros totales | 1.370.637.312 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | Mapudungun (`arn`) y español (`es`) |
| Licencia | `other` (nllb-and-corpus-derived-terms): CC-BY-NC 4.0 del modelo base y CC BY-NC-SA 3.0 del corpus de ajuste |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-1.3B`, un transformer encoder-decoder con atención multi-cabeza estándar de la familia NLLB-200, destilado para reducir el coste computacional manteniendo capacidades multilingües. Sobre ese checkpoint se realiza un ajuste fino supervisado para la dirección español→mapudungun, con una condición experimental concreta: la sustitución del tokenizador por un SentencePiece UnigramLM entrenado solo con texto mapudungun.

El corpus de ajuste deriva del corpus de mapudungun de Duan et al., distribuido bajo CC BY-NC-SA 3.0. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La contribución metodológica declarada es la tokenización morfológicamente informada, evaluada mediante chrF++ a nivel de frase. El checkpoint se identifica como "paper-era training checkpoint", es decir, la versión utilizada para generar los resultados publicados en el artículo.

## Capacidades

- Traducción automática unidireccional español→mapudungun, con preprocesado específico del mapudungun aplicado por el script de inferencia.
- Eliminación de marcadores de continuación `@@` en la salida mapudungun, lo que sugiere un tratamiento de palabras segmentadas morfológicamente.
- Segmentación subpalabra adaptada al mapudungun mediante SentencePiece UnigramLM, orientada a capturar prefijos, sufijos y partículas de una lengua aglutinante.
- Modelo bilingüe limitado a `arn` y `es`; no se documenta soporte para otras lenguas pese a la base multilingüe NLLB.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- No se documentan capacidades de generación de texto libre, código o matemáticas fuera del contexto de traducción.

## Casos de uso

- Traducción de documentación administrativa y sanitaria al mapudungun: el modelo puede traducir avisos, formularios y material informativo del español a `arn`, apoyándose en el preprocesado específico para preservar la morfología de la lengua de destino.
- Digitalización de materiales educativos bilingües: útil para escuelas interculturales que necesitan versiones en mapudungun de contenidos curriculares redactados en español, con revisión humana posterior dada la naturaleza de bajos recursos del par.
- Subtitulado y localización de contenido audiovisual comunitario: traducción de guiones y subtítulos del español al mapudungun para radios y medios indígenas, donde el volumen de texto es moderado y el contexto cultural importa.
- Investigación en lingüística computacional de lenguas indígenas: el checkpoint sirve como línea base reproducible con métrica publicada (chrF++ 41,05) para comparar estrategias de tokenización morfológica en NLLB.
- Preservación y documentación lingüística asistida: apoyo a lingüistas para generar borradores de traducción que luego se validan con hablantes nativos, acelerando la creación de corpus paralelos.
- Prototipos de asistentes conversacionales bilingües español-mapudungun: integrable como módulo de traducción en pipelines de atención ciudadana, siempre con revisión humana y sin uso comercial por las restricciones de licencia.

## Benchmarks y rendimiento

| Metrica | Valor | Condicion |
|---|---|---|
| chrF++ (nivel de frase, media) | 41,05 | Español→mapudungun, tamaño 1.3B, condición UnigramLM |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas frente a otros sistemas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 5,5 GB solo de pesos, más overhead de activaciones y memoria del tokenizador; en la práctica se recomienda al menos 8-10 GB.
- En fp16/bf16: alrededor de 2,8 GB de pesos, por lo que cabe en GPUs consumer con 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070).
- En cuantización de 8 bits: aproximadamente 1,4 GB de pesos; en 4 bits, en torno a 0,7 GB, aunque el autor no publica checkpoints cuantizados.
- GPUs recomendadas para producción: A100 40/80 GB, H100, L40S o RTX 4090 para lotes grandes; para inferencia individual basta una RTX 3090 o similar.
- Opciones de despliegue: `transformers` 4.x (requisito explícito de la model card), con posibilidad de servir mediante TGI o vLLM; llama.cpp y Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| byumatrixlab/mapudungun-nllb-1.3B-es-arn-unigram-lm | 1.370.637.312 | No disponible | Ajuste fino NLLB con tokenizador UnigramLM mapudungun | `other` (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | Hugging Face |
| facebook/nllb-200-distilled-1.3B | 1.300.000.000 (aprox.) | No disponible | Modelo multilingüe base, 200 idiomas | CC-BY-NC 4.0 | Hugging Face |
| Modelos específicos mapudungun de AmericasNLP | No disponible | No disponible | Sistemas de competición para el par es-arn | No disponible | No disponible |

No se dispone de datos numéricos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: el modelo base NLLB-200 está bajo CC-BY-NC 4.0 y el corpus de ajuste bajo CC BY-NC-SA 3.0; el uso comercial requiere negociación con los titulares de ambos.
- La licencia `other` con nombre `nllb-and-corpus-derived-terms` implica obligaciones acumuladas (atribución, no comercial, compartir igual) que el usuario debe verificar por separado.
- Modelo unidireccional: la model card solo documenta y evalúa español→mapudungun; no hay garantías para la dirección inversa.
- Riesgo de alucinación y de traducciones morfológicamente incorrectas en una lengua con variación dialectal y ortográfica significativa; se recomienda revisión por hablantes nativos.
- Corpus de ajuste de tamaño limitado (derivado de Duan et al.), lo que puede producir sobreajuste a dominios y registros concretos.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus académico puede reflejar la variedad dialectal y ortográfica de esa fuente.
- Requiere `transformers` 4.x y el script `inference.py` del repositorio para aplicar el preprocesado correcto; un uso directo del pipeline estándar puede degradar la calidad.
- Sin datos publicados sobre longitud de contexto efectiva, latencia o throughput en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-1.3B-es-arn-unigram-lm
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Paper de referencia: Thompson, Rogers y Ringger, "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", Proceedings of AmericasNLP 2026 (sin URL directa en la información disponible).
- Corpus de Duan et al. para mapudungun: no disponible URL directa en la información proporcionada.

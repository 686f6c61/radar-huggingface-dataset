# byumatrixlab/mapudungun-nllb-3.3B-es-arn-unigram-lm

## Resumen

El modelo `byumatrixlab/mapudungun-nllb-3.3B-es-arn-unigram-lm` es un ajuste fino de `facebook/nllb-200-3.3B` especializado en traducción automática de español a mapudungun (código ISO `arn`), una lengua indígena de Chile y Argentina con recursos digitales muy limitados. Lo desarrolla el grupo byumatrixlab y se enmarca en el artículo de Thompson, Rogers y Ringger presentado en AmericasNLP 2026, centrado en tokenización morfológica para mejorar el ajuste de NLLB-200 en lenguas de bajos recursos. El checkpoint emplea una condición de tokenización específica basada en un modelo SentencePiece UnigramLM entrenado solo con mapudungung, en lugar de la tokenización multilingüe original de NLLB.

La relevancia del modelo radica en que aborda uno de los cuellos de botella clásicos de la traducción de lenguas aglutinantes y polisintéticas: la fragmentación excesiva de palabras en subtokens que degrada la calidad de la traducción neuronal. Con 3.344.861.184 parámetros y un tamaño de repositorio de 13,4 GB, es un modelo de tamaño medio que puede desplegarse en infraestructura de una sola GPU de gama alta. La model card reporta un chrF++ medio a nivel de frase de 42,30 en la dirección español→mapudungun, un valor que sitúa esta configuración como referencia dentro del pipeline del artículo.

Cabe señalar que esta release es una reconstrucción: el checkpoint original no estaba disponible y se regeneró con la receta del artículo y los datos originales, reproduciendo 9.177 de 9.382 predicciones de test archivadas y obteniendo 42,31 de chrF++ frente al 42,30 del checkpoint original. La licencia es compuesta (`other`) y obliga a cumplir tanto la CC-BY-NC 4.0 de NLLB-200 como la CC BY-NC-SA 3.0 del corpus de Duan et al., lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100 / NLLB-200) |
| Parametros totales | 3.344.861.184 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arn (mapudungun), es (español) |
| Licencia | other (nllb-and-corpus-derived-terms: CC-BY-NC 4.0 de NLLB-200 + CC BY-NC-SA 3.0 del corpus de Duan et al.) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `facebook/nllb-200-3.3B`, un transformer encoder-decoder denso de la familia m2m_100 con 3.300 millones de parámetros aproximadamente y entrenamiento multilingüe masivo. Sobre esa base se realiza un ajuste fino supervisado para la dirección español→mapudungun, con una innovación central en la capa de tokenización: se sustituye la tokenización multilingüe original por una condición basada en un modelo SentencePiece UnigramLM entrenado exclusivamente con texto mapudungun. Esta decisión busca adaptar la segmentación a la morfología aglutinante del mapudungun, reduciendo la fragmentación de palabras y mejorando la alineación entre unidades morfológicas y subtokens.

El ajuste se realizó con el corpus de mapudungun de Duan et al. (licencia CC BY-NC-SA 3.0), empleado con la receta exacta del artículo. No se documentan en la información disponible detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. El helper de inferencia `inference.py` aplica un preprocesado específico de mapudungun y elimina los marcadores de continuación `@@` de la salida, lo que indica que el pipeline de tokenización y detokenización forma parte integral del funcionamiento del modelo. El modelo requiere Transformers 4.x.

## Capacidades

- Traducción automática unidireccional español→mapudungun (`es` → `arn`).
- Tokenización morfológica específica para mapudungun mediante SentencePiece UnigramLM.
- Preprocesado y postprocesado integrados en el helper de inferencia (eliminación de marcadores `@@`).
- Hereda del modelo base NLLB-200 la arquitectura encoder-decoder multilingüe, aunque el ajuste está orientado a un único par de lenguas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio en la información disponible.
- No se documenta modo "thinking" ni capacidades multimodales.

## Casos de uso

- Traducción de documentación oficial y materiales administrativos al mapudungun: el modelo permite generar versiones en `arn` de textos en español para servicios públicos, con la ventaja de una tokenización adaptada a la morfología de la lengua que reduce errores de segmentación en palabras largas.
- Localización de contenidos educativos bilingües: útil para producir materiales escolares español-mapudungun en contextos de educación intercultural, donde la fidelidad morfológica es crítica para la comprensión.
- Preservación y digitalización de patrimonio lingüístico: traducción asistida de textos históricos o etnográficos del español al mapudungun, con revisión humana posterior dado el carácter de bajos recursos del par.
- Investigación en traducción de lenguas de bajos recursos: el checkpoint sirve como referencia reproducible para experimentos de tokenización morfológica y comparación de condiciones (UnigramLM frente a tokenización multilingüe de NLLB).
- Generación de subtítulos y transcripciones bilingües: traducción de guiones o subtítulos en español a mapudungun para medios comunitarios y radios indígenas.
- Sistemas de atención ciudadana en zonas con población mapuche: traducción de respuestas y formularios del español al mapudungun en portales o chatbots, siempre con supervisión humana por las limitaciones de calidad en un par de bajos recursos.
- Evaluación comparativa de pipelines de MT: uso del modelo como baseline en estudios sobre morfología y segmentación en lenguas amerindias, gracias a la métrica chrF++ reportada y a la reproducibilidad del run.

## Benchmarks y rendimiento

| Metrica | Direccion | Checkpoint original (archivado) | Esta release (reconstruida) |
|---|---|---|---|
| chrF++ medio a nivel de frase | es → arn | 42,30 | 42,31 |
| Predicciones de test reproducidas | es → arn | 9.382 (referencia) | 9.177 de 9.382 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar, dado que el modelo es un sistema de traducción especializado y no un modelo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,7 GB solo para pesos, más overhead de activaciones y memoria del tokenizador; en la práctica se recomienda un mínimo de 10-12 GB de VRAM para inferencia con batch pequeño.
- VRAM estimada en fp32: aproximadamente 13,4 GB para pesos, lo que exige GPUs de 16 GB o más.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para fp16 con margen holgado; RTX 3090 (24 GB) también es viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y potencialmente en GPUs de 12 GB con cuantización, aunque no se documentan formatos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: el repositorio proporciona `inference.py` con Transformers 4.x; no se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI, aunque al ser un checkpoint m2m_100 en safetensors debería poder cargarse con frameworks compatibles con Transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| byumatrixlab/mapudungun-nllb-3.3B-es-arn-unigram-lm | 3.344.861.184 | no disponible | arn, es | other (NC) | Traducción es→arn con tokenización UnigramLM |
| facebook/nllb-200-3.3B (base) | ~3.300 M | 1.024 tokens (típico en NLLB) | 200 lenguas | CC-BY-NC 4.0 | Traducción multilingüe general |
| NLLB-200-distilled-600M | ~600 M | 1.024 tokens (típico) | 200 lenguas | CC-BY-NC 4.0 | Traducción multilingüe ligera |

La comparación directa con alternativas específicas para mapudungun no está disponible en la información proporcionada. Frente al modelo base NLLB-200-3.3B, este checkpoint incorpora tokenización específica y ajuste fino supervisado para el par es→arn, lo que se traduce en la métrica chrF++ reportada; frente a la versión destilada de 600 M, ofrece mayor capacidad a costa de un mayor requisito de VRAM.

## Limitaciones y advertencias

- Modelo unidireccional: está ajustado para español→mapudungun; no se documenta calidad en la dirección inversa ni en otros pares.
- Restricciones de licencia: la licencia `other` combina CC-BY-NC 4.0 (NLLB-200) y CC BY-NC-SA 3.0 (corpus de Duan et al.), lo que impide el uso comercial y obliga a compartir bajo la misma licencia las obras derivadas del corpus.
- Riesgo de alucinación y errores de traducción: al tratarse de un par de bajos recursos, es esperable una calidad inferior a la de pares con grandes volúmenes de datos; se recomienda revisión humana en producción.
- Sesgos: no se documentan análisis de sesgos en la información disponible; el corpus de entrenamiento puede introducir sesgos de dominio y de variedad dialectal del mapudungun.
- Limitaciones de contexto e idioma: solo se soportan `arn` y `es`; la longitud de contexto no está documentada y puede verse afectada por la tokenización específica.
- Reconstrucción del checkpoint: esta release no es el checkpoint original, sino una reconstrucción que reproduce el 97,8 % de las predicciones archivadas; pequeñas diferencias respecto al original son posibles.
- Dependencia del helper de inferencia: el preprocesado y la eliminación de `@@` son necesarios para un funcionamiento correcto; usar el modelo sin ese pipeline puede degradar la salida.
- Requiere Transformers 4.x; no se documenta compatibilidad con otras versiones ni con formatos cuantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-3.3B-es-arn-unigram-lm
- Modelo base: https://huggingface.co/facebook/nllb-200-3.3B
- Artículo de referencia: Thompson, I. M., Rogers, B. M. A., Ringger, E. K. (2026). "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning". Proceedings of the Sixth Workshop on NLP for Indigenous Languages of the Americas (AmericasNLP 2026).
- Corpus de Duan et al.: no disponible en la información proporcionada.

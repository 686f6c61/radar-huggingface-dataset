# byumatrixlab/mapudungun-nllb-3.3B-es-arn-morfessor-vc

## Resumen

El modelo `byumatrixlab/mapudungun-nllb-3.3B-es-arn-morfessor-vc` es un ajuste fino de `facebook/nllb-200-3.3B` especializado en traducción automática de español a mapudungun (código ISO `arn`), una lengua indígena de Chile y Argentina con recursos digitales muy limitados. Lo desarrolla el grupo byumatrixlab y se enmarca en el artículo "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning" (Thompson, Rogers y Ringger, AmericasNLP 2026). La innovación central no es arquitectónica sino de tokenización: se aplica segmentación morfológica con Morfessor seguida de una eliminación voraz de fronteras cuyos segmentos fusionados ya existen en el vocabulario de NLLB, de modo que el modelo puede aprovechar mejor el vocabulario multilingüe preentrenado para una lengua aglutinante como el mapudungun.

El checkpoint conserva la arquitectura transformer encoder-decoder de NLLB-200 con 3.344.861.184 parámetros (3.3B) y está empaquetado en safetensors (13,4 GB de repositorio). Se distribuye como una única dirección de traducción: español a mapudungun. Según la model card, el pipeline corregido del artículo reporta un chrF++ medio a nivel de frase de 42,77 para esta condición, tamaño y dirección.

Es relevante ahora porque demuestra que el ajuste fino con tokenización morfológica consciente puede mejorar de forma medible la traducción de lenguas de bajos recursos sin necesidad de reentrenar desde cero, y porque publica el checkpoint junto con un script de inferencia que aplica el preprocesado específico de la condición. La licencia es compuesta (`other`, denominada `nllb-and-corpus-derived-terms`), ya que hereda las obligaciones del modelo base NLLB-200 (CC-BY-NC 4.0) y del corpus de ajuste derivado del corpus Mapudungun de Duan et al. (CC BY-NC-SA 3.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (M2M-100 / NLLB-200) |
| Parametros totales | 3.344.861.184 (3.3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (NLLB-200 base: 1024 tokens, no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | arn (mapudungun), es (espanol); direccion de traduccion es -> arn |
| Licencia | other (`nllb-and-corpus-derived-terms`): NLLB-200 CC-BY-NC 4.0 + corpus Duan et al. CC BY-NC-SA 3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `facebook/nllb-200-3.3B`, un transformer encoder-decoder multilingüe de la familia NLLB (No Language Left Behind), y se ajusta de forma supervisada para la dirección español a mapudungun. La contribución metodológica del artículo es el preprocesado morfológico: el texto mapudungun se segmenta con Morfessor y después se aplica una eliminación voraz de fronteras morfológicas cuando la forma fusionada ya existe como ítem en el vocabulario de NLLB. Esto reduce la fragmentación en subpalabras de una lengua aglutinante y permite que el vocabulario preentrenado cubra mejor las formas del mapudungun.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO; la model card solo indica que el corpus de ajuste deriva del corpus Mapudungun de Duan et al. y que el checkpoint es "paper-era training checkpoint". El script de inferencia incluido aplica el preprocesado específico de la condición y elimina los marcadores de continuación `@@` de la salida en mapudungun.

## Capacidades

- Traducción automática unidireccional español a mapudungun (`es` -> `arn`).
- Manejo de morfología aglutinante del mapudungun mediante tokenización Morfessor con fusión de fronteras contra el vocabulario NLLB.
- Preprocesado y postprocesado específicos integrados en `inference.py` (eliminación de marcadores `@@`).
- Traducción a nivel de frase y de texto libre, con evaluación reportada mediante chrF++ a nivel de frase.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada a los dos idiomas del ajuste (`es`, `arn`); no se garantiza el comportamiento en otras direcciones del modelo base.

## Casos de uso

- Traducción de documentación oficial y material administrativo al mapudungun: el modelo puede traducir textos en español a mapudungun para señalización, formularios o comunicados, aprovechando el ajuste específico de dominio morfológico para producir formas más naturales que el NLLB base.
- Localización de contenidos educativos bilingües: traducción de materiales escolares español-mapudungun en contextos de educación intercultural, con el preprocesado Morfessor reduciendo la fragmentación de palabras aglutinantes.
- Preservación y difusión cultural: traducción de textos comunitarios, relatos y material etnográfico del español al mapudungun para archivos digitales y proyectos de revitalización lingüística.
- Subtitulado y traducción de contenido audiovisual: generación de subtítulos en mapudungun a partir de guiones o transcripciones en español, procesando frase a frase con el script de inferencia incluido.
- Investigación en traducción de bajos recursos: punto de comparación reproducible para estudiar el efecto de la tokenización morfológica frente al NLLB-200 base en una lengua indígena, usando la métrica chrF++ reportada.
- Herramientas de asistencia a traductores comunitarios: borradores automáticos español-mapudungun que un hablante nativo revisa y corrige, reduciendo el esfuerzo inicial de traducción.
- Normalización terminológica: generación de propuestas de traducción para neologismos y términos técnicos en mapudungun, que después se validan con la comunidad lingüística.

## Benchmarks y rendimiento

| Metrica | Condicion | Resultado |
|---|---|---|
| chrF++ medio a nivel de frase | es -> arn, Morfessor-VC, 3.3B | 42,77 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros), ni desgloses por conjunto de test más allá del valor medio de chrF++ indicado en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,7 GB solo para pesos, más overhead de activaciones y caché; en la práctica se recomienda al menos 10-12 GB de VRAM para secuencias cortas y más para lotes grandes.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia cómoda en fp16; GPUs consumer de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) pueden ser suficientes con cuantización o lotes pequeños.
- Cabe en GPU consumer de gama alta (RTX 4090, 3090) en fp16; en GPUs de 8 GB requeriría cuantización de 8 bits o inferior, no documentada en la información disponible.
- Opciones de despliegue: el repositorio incluye `inference.py` basado en Transformers 4.x; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo NLLB estándar en safetensors es compatible con los runners de Transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| mapudungun-nllb-3.3B-es-arn-morfessor-vc (este) | 3.3B | no disponible | es -> arn | other (NLLB CC-BY-NC 4.0 + corpus CC BY-NC-SA 3.0) | Publicado, 0 descargas |
| facebook/nllb-200-3.3B (base) | 3.3B | 1024 tokens (modelo base) | 200 idiomas | CC-BY-NC 4.0 | Ampliamente disponible |
| Otros ajustes NLLB para mapudungun | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados comparativos de chrF++ entre este checkpoint y el NLLB-200 base ni con otras variantes del artículo para la misma dirección.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce español a mapudungun; no se ha ajustado para la dirección inversa.
- Licencia no comercial: tanto NLLB-200 (CC-BY-NC 4.0) como el corpus Duan et al. (CC BY-NC-SA 3.0) restringen el uso comercial; cualquier despliegue en producción debe revisar ambas obligaciones.
- Riesgo de alucinación y de traducciones morfológicamente plausibles pero semánticamente incorrectas, especialmente en terminología técnica o neologismos ausentes del corpus de ajuste.
- Corpus de ajuste de bajos recursos: la cobertura léxica y dialectal del mapudungun es limitada, y las variantes regionales pueden no estar representadas.
- El checkpoint es un "paper-era training checkpoint", sin garantía de mantenimiento, actualizaciones ni soporte.
- Sin datos publicados de sesgos específicos, robustez ante dominios fuera de distribución ni evaluación humana en la información disponible.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- Requiere Transformers 4.x y el preprocesado específico del script incluido; usar el modelo sin ese preprocesado puede degradar la calidad de la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-3.3B-es-arn-morfessor-vc
- Modelo base: https://huggingface.co/facebook/nllb-200-3.3B
- Paper citado: Thompson, I. M., Rogers, B. M. A. y Ringger, E. K. (2026), "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", Proceedings of the Sixth Workshop on NLP for Indigenous Languages of the Americas (AmericasNLP 2026). Enlace directo no disponible en la información proporcionada.
- Corpus Duan et al. de mapudungun: enlace no disponible en la información proporcionada.
- Repositorio de código o demo: no disponible en la información proporcionada.

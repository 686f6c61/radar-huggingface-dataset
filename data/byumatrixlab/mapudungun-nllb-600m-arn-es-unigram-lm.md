# byumatrixlab/mapudungun-nllb-600M-arn-es-unigram-lm

## Resumen

El modelo `mapudungun-nllb-600M-arn-es-unigram-lm` es un ajuste fino del checkpoint `facebook/nllb-200-distilled-600M` de Meta AI, especializado en traducción automática del mapudungun (`arn`) al castellano (`es`). Lo desarrolla el grupo byumatrixlab en el contexto de un trabajo académico presentado en AmericasNLP 2026, centrado en tokenización consciente de la morfología para lenguas indígenas de América. El problema que aborda es la baja disponibilidad de sistemas de traducción de calidad para el mapudungun, una lengua de la familia araucana hablada principalmente en Chile y Argentina, con escasos recursos digitales paralelos.

La contribución técnica del trabajo es la incorporación de una condición de tokenización específica, basada en un modelo SentencePiece UnigramLM entrenado únicamente sobre texto mapudungun, que se aplica como preprocesado antes de la traducción y se revierte en la salida eliminando los marcadores de continuación `@@`. El checkpoint publicado es una reconstrucción del original, ya que este no estaba disponible; según el autor, reproduce 9.180 de las 9.382 predicciones de test archivadas y obtiene un chrF++ medio a nivel de oración de 42,19 frente al 42,18 del checkpoint original.

Con 615.072.768 parámetros y un tamaño de repositorio de 2,5 GB, el modelo se distribuye como un ajuste de traducción bilingüe de un solo sentido (mapudungun a castellano), no como un modelo multilingüe general. Su relevancia es doble: por un lado, aporta una referencia reproducible con métricas publicadas para una dirección lingüística históricamente desatendida; por otro, la licencia derivada de NLLB-200 (CC-BY-NC 4.0) y del corpus Duan et al. (CC BY-NC-SA 3.0) restringe su uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100), base NLLB-200 distilled 600M |
| Parametros totales | 615.072.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | arn (mapudungun), es (castellano) |
| Licencia | other, `nllb-and-corpus-derived-terms` (base CC-BY-NC 4.0; corpus CC BY-NC-SA 3.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de NLLB-200 distilled 600M, un transformer encoder-decoder de tipo m2m_100 con atención multi-cabeza estándar y mecanismo de atención cruzada entre encoder y decoder. El ajuste fino se realiza sobre el checkpoint preentrenado de Meta, por lo que hereda el vocabulario multilingüe y los embeddings de NLLB-200, y se especializa en el par `arn`-`es` mediante entrenamiento supervisado sobre el corpus de Duan et al. para mapudungun.

La innovación del trabajo no reside en la arquitectura, sino en el pipeline de tokenización. Se entrena un modelo SentencePiece UnigramLM exclusivamente con texto mapudungun y se aplica como preprocesado condicional antes de pasar el texto al tokenizador de NLLB; en la salida se eliminan los marcadores `@@` de continuación. Según la model card, esta condición morfológica alcanza un chrF++ medio a nivel de oración de 42,18 (42,19 en la reconstrucción publicada). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; el ajuste se describe como supervisado sobre el corpus citado.

## Capacidades

- Traducción automática directa de mapudungun a castellano, en un único sentido (`arn` a `es`).
- Preprocesado morfológico específico para mapudungun mediante tokenización UnigramLM, con eliminación de marcadores `@@` en la salida.
- Manejo de texto en mapudungun con ortografía y morfología propias de la lengua, al haberse entrenado la tokenización sobre corpus específico.
- Generación de traducciones a nivel de oración y de fragmento, según el pipeline de inferencia incluido (`inference.py`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al par `arn`-`es`; no se garantiza un comportamiento correcto fuera de esa dirección.

## Casos de uso

- Traducción de documentación comunitaria: digitalización y traducción al castellano de textos, actas o materiales educativos escritos en mapudungungun, usando el pipeline de inferencia incluido y el preprocesado morfológico para preservar la segmentación de la lengua.
- Subtitulado y transcripción asistida: traducción oración a oración de transcripciones en mapudungun para su publicación bilingüe, aprovechando que el modelo opera a nivel de oración con métricas chrF++ reportadas.
- Investigación en lenguas de bajos recursos: reproducción de los resultados del paper de AmericasNLP 2026 y comparación de variantes de tokenización sobre el mismo corpus, dado que el checkpoint es una reconstrucción reproducible con predicciones archivadas.
- Preservación lingüística y archivo: generación de versiones en castellano de corpus orales transcritos, con revisión humana posterior, para facilitar el acceso a materiales en mapudungun.
- Herramientas de apoyo a la enseñanza: traducción de ejercicios y glosarios para cursos de mapudungun, siempre con validación por hablantes nativos dada la naturaleza de la lengua y las limitaciones del corpus.
- Evaluación comparativa de sistemas de TA: uso como línea base especializada `arn`-`es` frente a NLLB-200 sin ajuste u otros sistemas multilingües, gracias a la métrica chrF++ publicada y a la disponibilidad del pipeline de inferencia.

## Benchmarks y rendimiento

| Metrica | Resultado | Notas |
|---|---|---|
| chrF++ medio a nivel de oración (arn a es) | 42,18 (checkpoint original archivado) | Condición UnigramLM, tamaño 600M, dirección arn a es |
| chrF++ medio a nivel de oración (arn a es) | 42,19 (reconstrucción publicada) | Misma evaluación que el checkpoint original |
| Predicciones de test reproducidas | 9.180 de 9.382 | Sobre el conjunto de test archivado |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar, ya que el modelo es un sistema de traducción especializado y no un modelo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 2,5 GB solo para pesos, más memoria de activaciones y del tokenizador; en la práctica se recomienda al menos 4-6 GB.
- VRAM estimada en fp16/bf16: alrededor de 1,3 GB para pesos, con margen adicional para activaciones; cabe en GPUs consumer de gama media.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (por ejemplo, RTX 3050, RTX 4060, RTX 4090); A100 o H100 no son necesarias para este tamaño, aunque pueden usarse para procesamiento por lotes a gran escala.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 4 GB o más en fp16.
- Opciones de despliegue: el repositorio incluye `inference.py` basado en Transformers 4.x; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento arn-es |
|---|---|---|---|---|---|
| mapudungun-nllb-600M-arn-es-unigram-lm | 615 M | no disponible | arn, es | other (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | chrF++ 42,18-42,19 |
| facebook/nllb-200-distilled-600M (base) | 615 M | no disponible | 200 idiomas | CC-BY-NC 4.0 | no disponible en la informacion |
| NLLB-200 1.3B / 3.3B (variantes mayores) | 1,3 B / 3,3 B | no disponible | 200 idiomas | CC-BY-NC 4.0 | no disponible en la informacion |

La comparativa se limita a la familia NLLB-200, ya que no se dispone de datos de otros sistemas especializados en mapudungun en la información proporcionada. El modelo se distingue del checkpoint base por el ajuste fino y la condición de tokenización, no por el tamaño ni por la cobertura lingüística.

## Limitaciones y advertencias

- Licencia no comercial: la base NLLB-200 se distribuye bajo CC-BY-NC 4.0 y el corpus de ajuste bajo CC BY-NC-SA 3.0; el uso comercial requiere cumplir ambas condiciones y, en la práctica, queda restringido.
- Modelo unidireccional: solo traduce de mapudungun a castellano; no se documenta la dirección inversa.
- Corpus de ajuste limitado y derivado de una única fuente (Duan et al.), lo que puede introducir sesgos de dominio y de registro.
- Riesgo de alucinación y de traducciones incorrectas en terminología especializada, nombres propios o variantes dialectales del mapudungun no representadas en el corpus.
- El checkpoint es una reconstrucción, no el original: aunque reproduce el 97,8 % de las predicciones de test, pueden existir diferencias menores en casos límite.
- No se documentan evaluaciones de sesgo, robustez ni comportamiento fuera del dominio de traducción.
- No se especifican la longitud de contexto efectiva ni el comportamiento con entradas largas; el pipeline está orientado a oraciones.
- Requiere Transformers 4.x y el preprocesado específico incluido en `inference.py`; un uso directo del tokenizador de NLLB sin ese preprocesado puede degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-600M-arn-es-unigram-lm
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper de referencia: Thompson, Rogers y Ringger, "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026 (citado en la model card; no se proporciona URL directa).
- Corpus Duan et al. para mapudungun: citado en la model card bajo CC BY-NC-SA 3.0; no se proporciona URL directa en la información disponible.

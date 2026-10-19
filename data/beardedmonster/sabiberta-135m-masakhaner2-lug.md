# BeardedMonster/SabiBERTa-135M-masakhaner2-lug

## Resumen

`BeardedMonster/SabiBERTa-135M-masakhaner2-lug` es un modelo de clasificación de tokens para reconocimiento de entidades nombradas (NER) en luganda. Se obtiene por fine-tuning del checkpoint `BeardedMonster/SabiBERTa-135M` sobre el protocolo `lug` de MasakhaNER 2.0. Lo publica BeardedMonster y está orientado a extraer entidades en textos en luganda, un idioma africano de bajos recursos, no a generar texto ni a mantener conversaciones.

El modelo tiene 135.883.017 parámetros y arquitectura ModernBERT según la etiqueta del repositorio. Se entrenó con secuencias de hasta 256 tokens durante 50 épocas y alcanzó un span F1 medio de 0,8214 en una única ejecución. Su interés es práctico: ofrece un checkpoint compacto y especializado para NER en luganda, con un harness que reproduce los baselines de MasakhaNER 2.0 con una tolerancia de aproximadamente 0,25 F1. La licencia no está declarada y queda sujeta a la del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT, según la etiqueta `modernbert` del repositorio |
| Parámetros totales | 135.883.017 |
| Parámetros activos | no aplica, no es un modelo MoE |
| Longitud de contexto | 256 tokens como máximo de secuencia en el fine-tuning; contexto nativo del modelo base no disponible |
| Tipos de cuantización | no disponible; solo se publican pesos safetensors, sin GGUF, ONNX ni versiones cuantizadas |
| Idiomas soportados | lug (luganda); no se declaran otros idiomas |
| Licencia | no disponible; la model card remite a la licencia y términos del modelo base `BeardedMonster/SabiBERTa-135M` |
| Formato de pesos | safetensors |
| Tarea | clasificación de tokens / NER, según la carga con `AutoModelForTokenClassification` |
| Pipeline de Hugging Face | no disponible |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

Es un encoder transformer tipo ModernBERT fine-tuneado para clasificación de tokens. El checkpoint base es `BeardedMonster/SabiBERTa-135M`. No se detallan en la información disponible el número de tokens de preentrenamiento, la composición del corpus ni si hubo RLHF o DPO; en un modelo de NER basado en encoder, ese tipo de ajuste no es el habitual. El fine-tuning se realizó sobre MasakhaNER 2.0, protocolo `lug`, con 50 épocas, tasa de aprendizaje 5e-05, batch size 32, longitud máxima 256 y métrica `span_f1`.

La model card indica que el harness del proyecto reproduce los baselines publicados de MasakhaNER 2.0 con una tolerancia de aproximadamente 0,25 F1, y que los resultados provienen de una sola ejecución. No se documentan innovaciones técnicas adicionales, como decodificación especulativa o atención lineal. El valor diferencial está en la especialización lingüística para luganda y en el tamaño compacto del checkpoint.

## Capacidades

- Reconocimiento de entidades nombradas en luganda mediante clasificación de tokens.
- Decodificación directa de etiquetas gracias a que `id2label` está configurado en el checkpoint.
- Extracción de entidades en fragmentos de texto de hasta 256 tokens.
- Uso como modelo de preanotación para corpus NER y revisión humana posterior.
- No es un modelo generativo: no produce texto libre, resúmenes ni respuestas conversacionales.
- No dispone de soporte documentado de tool calling, function calling, agentes o razonamiento multi-paso.
- No se declaran capacidades de visión, audio ni multilingüismo más allá de `lug`.
- No se documenta instruction following ni un modo de razonamiento explícito.

## Casos de uso

- Extracción de entidades en prensa y medios en luganda: el modelo puede procesar titulares y cuerpos de noticia por fragmentos de hasta 256 tokens para identificar personas, organizaciones y lugares, y alimentar índices de búsqueda. Es adecuado porque está fine-tuneado específicamente para NER en ese idioma.
- Preanotación de corpus para anotación humana: genera etiquetas automáticas sobre textos en luganda que después se corrigen manualmente. Reduce el coste inicial de crear corpus NER y encaja con el formato de `id2label` del checkpoint.
- Enriquecimiento de archivos documentales de ONG y proyectos de desarrollo: permite extraer entidades de informes y documentos para construir metadatos, filtros y tablas de seguimiento. El tamaño de 135,9 M parámetros facilita el despliegue en infraestructura limitada.
- Búsqueda y recuperación de información: las entidades detectadas pueden indexarse para permitir consultas por persona, organización o lugar en colecciones documentales en luganda. El modelo sirve como componente de un pipeline de NLP, no como buscador completo.
- Monitorización de menciones en medios y redes: extracción de entidades de textos recopilados para analizar qué personas u organizaciones aparecen y con qué frecuencia. Requiere trocear textos largos y agregar resultados por documento.
- Normalización y deduplicación de bases de datos: detección de variantes de nombres de lugares o entidades en registros textuales para consolidar bases de datos. Es útil como paso previo a reglas de resolución de entidades.
- Investigación lingüística sobre NER en luganda: uso como baseline reproducible para comparar enfoques, analizar errores por tipo de entidad o estudiar el comportamiento de modelos compactos en idiomas de bajos recursos.

## Benchmarks y rendimiento

| Evaluación | Conjunto | Métrica | Resultado | Observaciones |
|---|---|---|---|---|
| MasakhaNER 2.0, protocolo `lug` | MasakhaNER 2.0 | span F1 | 0,8214 | media sobre 1 idioma; una sola ejecución |
| Comparación con baselines publicados | MasakhaNER 2.0 | no disponible | no disponible | el harness declara reproducir baselines con ~0,25 F1 de tolerancia, pero no se aportan cifras comparativas |
| MMLU, HumanEval, GSM8K u otros benchmarks generativos | no aplica | no disponible | no disponible | no son benchmarks propios de un modelo NER |

No se han publicado resultados comparativos frente a otros checkpoints en la información disponible. El único dato de rendimiento es el span F1 de 0,8214 en MasakhaNER 2.0 para `lug`, obtenido en una única ejecución.

## Requisitos de hardware

- VRAM estimada solo para pesos: aproximadamente 0,54 GB en FP32, 0,27 GB en FP16/BF16, 0,14 GB en INT8 y 0,07 GB en 4 bits.
- Con batch 1 y secuencias de 256 tokens, el consumo real añade activaciones y overhead del runtime; no hay mediciones publicadas de VRAM total.
- Cabe en GPU de consumo: sí, cualquier GPU con al menos 2-4 GB de VRAM debería poder ejecutar inferencia en FP16, aunque para lotes grandes conviene disponer de 8 GB o más.
- También es viable en CPU para volúmenes pequeños o procesamiento por lotes no urgente.
- GPU recomendadas para desarrollo local: RTX 3060, RTX 4060, RTX 4090 o similares. Para serving por lotes: T4, L4, A10G o A100.
- Despliegue previsto con Transformers mediante `AutoModelForTokenClassification` y el pipeline de token-classification.
- No hay soporte documentado en vLLM, TGI, llama.cpp u Ollama para este checkpoint. llama.cpp y Ollama no aplican porque el modelo no es generativo ni se distribuye en GGUF.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SabiBERTa-135M-masakhaner2-lug` | 135.883.017 | 256 tokens en fine-tuning | span F1 0,8214 en MasakhaNER 2.0 `lug`, una ejecución | no disponible | Hugging Face |
| `SabiBERTa-135M` (modelo base) | 135 M nominal, no verificado en su ficha | no disponible | no disponible; no es un checkpoint NER específico | no disponible | Hugging Face |
| Otros fine-tunes de MasakhaNER 2.0 para `lug` | no disponible | no disponible | no disponible | no disponible | no identificados en la información proporcionada |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada. La comparación se limita al modelo base y a la ausencia de otros checkpoints identificados para la misma tarea e idioma.

## Limitaciones y advertencias

- El resultado de 0,8214 span F1 procede de una sola ejecución; no se reportan intervalos de confianza ni varianza entre semillas.
- La model card advierte de que los papers de baseline promedian cinco ejecuciones, por lo que las diferencias pequeñas deben tratarse como ruido.
- Solo está entrenado y declarado para luganda (`lug`); no se ha evaluado su comportamiento en otros idiomas.
- La longitud máxima de secuencia es 256 tokens; los documentos más largos deben trocearse, lo que puede perder contexto entre fragmentos.
- Es un modelo de clasificación de tokens, no un modelo generativo. No produce texto, no responde instrucciones y no soporta tool calling ni agentes.
- El riesgo de alucinación generativa no aplica, pero sí puede producir falsos positivos y falsos negativos en la detección de entidades.
- No se documentan evaluaciones de sesgo, calidad de anotación ni cobertura de dominios del corpus MasakhaNER 2.0.
- La licencia no está declarada en la información disponible; cualquier uso comercial requiere verificar la licencia y términos del modelo base `BeardedMonster/SabiBERTa-135M`.
- No se detalla la composición del dataset de entrenamiento ni el esquema completo de etiquetas; conviene revisar `id2label` antes de integrarlo en producción.
- El checkpoint tiene 0 descargas y 0 likes en la metadata consultada, por lo que no hay validación comunitaria ni evidencia de uso en producción.
- No hay datos publicados de latencia, throughput ni comportamiento en dominios distintos del corpus de evaluación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-lug)
- [Modelo base SabiBERTa-135M](https://huggingface.co/BeardedMonster/SabiBERTa-135M)
- [Paper de MasakhaNER 2.0 en ACL Anthology](https://aclanthology.org/2022.emnlp-main.298/)

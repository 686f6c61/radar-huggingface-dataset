# HRB25/pt-br-moderation-bertimbau-v1

## Resumen

PT-BR Moderation BERTimbau V1 es un clasificador multietiqueta para moderación de texto en portugués brasileño, publicado por el usuario HRB25 en HuggingFace. El modelo parte del checkpoint BERTimbau Base de neuralmind y lo afina como cabecera de clasificación de secuencias (BertForSequenceClassification) para producir doce puntuaciones independientes, una por cada categoría de la política de moderación de Colmeia. Cada puntuación pasa por una sigmoide y se compara con un umbral específico por categoría para decidir el positivo.

Técnicamente es un transformer encoder bidireccional de tipo BERT, con 108.932.364 parámetros en float32, 12 capas, dimensión oculta de 768, 12 cabezas de atención, capa intermedia de 3.072 y vocabulario de 29.794 tokens. El codificador admite hasta 512 posiciones, aunque la evaluación publicada se hizo con truncamiento a 128 tokens. El repositorio ocupa 0,4 GB y los pesos se distribuyen en formato safetensors.

Su relevancia es la de un modelo especializado y ligero para una tarea muy concreta: la triaje automático de contenido en una comunidad de habla portuguesa. No es un modelo generativo ni un LLM, sino un clasificador acotado que devuelve etiquetas de moderación; su uso previsto es servir de primera pasada automática antes de la revisión humana. Las métricas publicadas (F1 micro 57,57%) sitúan su rendimiento en un rango moderado, con diferencias muy marcadas entre categorías.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT), clase BertForSequenceClassification |
| Parametros totales | 108.932.364 (201 tensores, float32) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 posiciones; evaluacion con truncamiento a 128 tokens |
| Tipos de cuantizacion | No disponible (checkpoint publicado en float32; no se ofrecen cuantizaciones oficiales) |
| Idiomas soportados | pt (portugues, orientado a portugues brasileño) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32) |
| Modelo base | neuralmind/bert-base-portuguese-cased |
| Capas | 12 |
| Dimension oculta | 768 |
| Capa intermedia | 3.072 |
| Cabezas de atencion | 12 |
| Vocabulario | 29.794 |
| Activacion | GELU |
| Etiquetas de salida | 12 (clasificacion multietiqueta) |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un BERT Base afimado sobre el checkpoint neuralmind/bert-base-portuguese-cased (BERTimbau), entrenado originalmente con texto en portugués. La arquitectura es la estándar de BERT: un encoder transformer bidireccional de 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y activación GELU. Sobre el token [CLS] se coloca una cabeza de clasificación con 12 salidas independientes, lo que lo convierte en un clasificador multietiqueta en lugar de multiclase: cada categoría se decide de forma autónoma, de modo que una subcategoría positiva no modifica la puntuación de la categoría superior.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset de ajuste fino ni si se aplicaron técnicas de RLHF o DPO (en un clasificador encoder no serían el procedimiento habitual). Se sabe que la regla de decisión es una sigmoide seguida de comparación con umbral por categoría, y que los umbrales usados están en el fichero `categorias.json` del repositorio. No hubo recalibración de umbrales en esta publicación. La evaluación se realizó el 13 de octubre de 2026 sobre 2.202 textos del conjunto HRB25/pt-br-moderation-eval (revisión `949b41541412abf718987bbec166a904b59587f1`), en CPU, con pesos float32, lotes de 16 y truncamiento a 128 tokens. La comparación exacta de texto contra el corpus histórico de entrenamiento no encontró coincidencias.

## Capacidades

- Clasificación multietiqueta de texto corto en portugués brasileño (mensajes y publicaciones).
- Doce decisiones independientes por texto: hate, hate/threatening, sexual, sexual/minors, illicit, illicit/violent, violence, self-harm, self-harm/instructions, self-harm/intent, harassment, harassment/threatening.
- Salida de puntuaciones continuas por categoría, comparables con el umbral propio de cada etiqueta.
- Triaje automático previo a la revisión humana del contexto.
- Procesamiento de entradas de hasta 512 posiciones (evaluado con 128).
- No dispone de generación de texto, tool calling, capacidades de agente, visión ni audio: es un clasificador encoder discriminativo.
- No se declaran capacidades multilingües: el modelo está orientado únicamente a portugués.

## Casos de uso

- Moderación automática de comentarios en plataformas sociales en portugués brasileño: el clasificador asigna una puntuación por categoría a cada comentario y permite aplicar reglas de ocultación o aviso según umbral, reduciendo la carga de los equipos de moderación.
- Triaje previo a revisión humana en foros y comunidades: dado que el modelo declara explícitamente que la lectura humana del contexto sigue siendo necesaria, encaja como primera pasada que prioriza los casos de mayor riesgo.
- Filtrado en tiempo real de mensajes de chat: al ser un modelo de 108M parámetros en float32, cabe en una GPU de consumo o incluso en CPU, lo que permite inferencia de baja latencia en flujos de mensajería.
- Moderación en aplicaciones de mensajería o citas con usuarios lusófonos: las categorías de harassment, harassment/threatening y sexual permiten cubrir interacciones abusivas entre usuarios.
- Detección de contenido de autolesión para derivación a recursos de ayuda: las etiquetas self-harm, self-harm/instructions y self-harm/intent permiten activar protocolos de intervención (con la advertencia de que su precisión es desigual según la subcategoría).
- Pre-filtro en pipelines de contenido generado por usuarios (UGC): integrar el modelo como paso previo a la revisión manual o a sistemas de decisión más complejos.
- Auditoría y análisis retrospectivo de corpus: aplicar el clasificador a históricos de mensajes para estimar prevalencia de categorías de moderación.
- Cumplimiento de políticas de plataforma en mercados de habla portuguesa: proporciona una señal automática y auditable (con umbrales publicados) para trazabilidad de decisiones de moderación.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (métricas marcadas como `verified: false`), sobre el conjunto PT-BR Moderation Eval, configuración `default`, 2.202 textos, truncamiento a 128 tokens:

| Metrica | Valor |
|---|---|
| F1 micro | 0,5757 (57,57%) |
| F1 macro | 0,5417 (54,17%) |
| Precision micro | 0,5638 (56,38%) |
| Recall micro | 0,5881 (58,81%) |

Desglose por subconjunto:

| Conjunto | Textos | F1 micro | F1 macro |
|---|---:|---:|---:|
| Completo | 2.202 | 57,57% | 54,17% |
| Manual | 2.024 | 59,45% | 51,98% |
| Sintetico | 178 | 36,92% | 42,29% |

Desglose por categoría (precisión, recall, F1, positivos, textos anotados):

| Categoria | Precision | Recall | F1 | Positivos | Textos anotados |
|---|---:|---:|---:|---:|---:|
| Odio | 63,58% | 83,33% | 72,13% | 132 | 1.921 |
| Odio con amenaza | 89,11% | 75,00% | 81,45% | 120 | 1.921 |
| Contenido sexual | 90,00% | 66,39% | 76,42% | 122 | 2.024 |
| Sexual con menores | 100,00% | 1,71% | 3,36% | 117 | 2.141 |
| Actividad ilicita | 85,25% | 22,32% | 35,37% | 233 | 1.982 |
| Ilicitos violentos | 76,19% | 29,36% | 42,38% | 109 | 1.982 |
| Violencia | 86,91% | 61,60% | 72,10% | 388 | 1.947 |
| Autolesion | 91,22% | 81,30% | 85,98% | 230 | 1.921 |
| Instrucciones de autolesion | 29,39% | 77,00% | 42,54% | 100 | 1.921 |
| Intencion de autolesion | 36,27% | 88,61% | 51,47% | 79 | 1.921 |
| Asedio | 27,42% | 64,81% | 38,53% | 162 | 1.921 |
| Asedio con amenaza | 37,93% | 66,38% | 48,28% | 116 | 1.921 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo es un clasificador específico y no un modelo generativo evaluable en esos conjuntos.

## Requisitos de hardware

- Pesos en float32: aproximadamente 436 MB (108,9M parámetros x 4 bytes).
- VRAM estimada para inferencia en float32: en torno a 1-2 GB contando activaciones y batch pequeño; inferior a 1 GB con cuantización a int8.
- El modelo cabe sin dificultad en cualquier GPU de consumo (por ejemplo, GTX 1050 4 GB, RTX 3060, RTX 4090) e incluso en CPU; la evaluación oficial se ejecutó en CPU.
- GPUs de centro de datos (A100, H100, L4, T4) son sobredimensionadas para este tamaño y solo se justifican por concurrencia masiva.
- Opciones de despliegue: transformers (librería declarada), safetensors como formato de pesos, y las etiquetas del repositorio indican compatibilidad con text-embeddings-inference y endpoints_compatible. No se declaran soportes oficiales de vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles. La única referencia es la configuración de evaluación (CPU, lotes de 16).

## Comparativa con modelos similares

No se dispone de datos de benchmarks publicados para alternativas equivalentes de moderación en portugués brasileño en la información proporcionada, por lo que la comparativa de rendimiento entre modelos de la misma tarea no está disponible.

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| pt-br-moderation-bertimbau-v1 | 108,9M | 512 posiciones (eval. 128) | Clasificacion multietiqueta de moderacion (12 etiquetas), pt-BR | MIT | F1 micro 57,57% en PT-BR Moderation Eval |
| neuralmind/bert-base-portuguese-cased | ~108M | 512 posiciones | Modelo base de lenguaje en portugués (sin cabeza de moderación) | No disponible en la informacion proporcionada | Es el checkpoint de partida; no es un clasificador de moderación |
| Otras alternativas de moderacion en pt-BR | No disponible | No disponible | No disponible | No disponible | No se han encontrado datos comparables en la informacion disponible |

## Limitaciones y advertencias

- Rendimiento moderado: F1 micro de 57,57% y F1 macro de 54,17% sobre el conjunto de evaluación. No es un sistema de moderación autónomo fiable sin revisión humana.
- Recall crítico en `sexual/minors`: 1,71% (115 de 117 positivos perdidos). La precisión del 100% corresponde únicamente a dos predicciones positivas correctas en ese conjunto.
- Precisión baja en categorías de asedio: 27,42% en harassment y 37,93% en harassment/threatening, lo que implica un volumen elevado de falsos positivos.
- Precisión baja en instrucciones de autolesión (29,39%) e intención de autolesión (36,27%), con recall alto: tendencia a sobrerrepresentar estas categorías.
- Bajo rendimiento en el subconjunto sintético: F1 micro de 36,92%, frente a 59,45% en el subconjunto manual.
- Métricas no verificadas: todos los resultados del model-index están marcados como `verified: false`.
- Los umbrales por categoría no fueron recalibrados en esta publicación y son los del checkpoint original; desviarse de ellos cambia el equilibrio precisión/recall.
- Sesgo de dominio: la evaluación mide concordancia con los rótulos disponibles y la recolección dirigida del conjunto no reproduce la prevalencia real de las categorías en la aplicación.
- Truncamiento efectivo de 128 tokens en la evaluación, muy por debajo de las 512 posiciones que admite el codificador; el comportamiento más allá de 128 tokens no está evaluado.
- Idioma limitado a portugués (orientado a portugués brasileño); no hay soporte multilingüe declarado.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos con impacto directo en moderación.
- Licencia MIT: permite uso comercial, modificación y redistribución, con la obligación habitual de conservar el aviso de copyright y la licencia.
- La model card original aparece truncada en la información disponible, por lo que pueden existir detalles adicionales (figuras, manifiesto de evaluación) no recogidos aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HRB25/pt-br-moderation-bertimbau-v1
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Dataset de evaluacion: https://huggingface.co/datasets/HRB25/pt-br-moderation-eval
- Dataset de evaluacion (tipo declarado en model-index): HRB25/pt-br-moderation-eval, revision `949b41541412abf718987bbec166a904b59587f1`

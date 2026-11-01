# makitty/quechua-chanka-mt-prpe

## Resumen

quechua-chanka-mt-prpe es un modelo de traducción automática español→quechua (variante chanka) entrenado desde cero por la autora independiente makitty. Se trata de un transformer encoder-decoder de tipo Marian de apenas 11,5 millones de parámetros declarados en la model card (17,1 millones contabilizados en los pesos safetensors), con 4 capas en encoder y decoder y una dimensión de modelo de 256. Su interés no radica en el tamaño, sino en el enfoque: emplea PRPE (Prefix-Root-Postfix Encoding), un tokenizador guiado por morfología en el lado objetivo, en lugar del BPE estándar.

El modelo se publica como evaluación extrínseca del trabajo QuechuaTok (Contreras, 2026), que defiende que la precisión en fronteras morfológicas (MorphAcc) de un tokenizador es una métrica necesaria para lenguas aglutinantes de bajos recursos, y que esa métrica se traduce en calidad real de traducción. Para aislar el efecto del tokenizador, la autora entrena un modelo idéntico con BPE (quechua-chanka-mt-bpe) sobre los mismos datos y compara ambos en un conjunto de test de 12.206 pares.

Es relevante ahora porque ofrece una ablación controlada y reproducible sobre un par lingüístico muy poco cubierto (español-quechua), con licencia Apache 2.0 y un coste de inferencia mínimo. No obstante, sus cifras absolutas de calidad son bajas (BLEU 7,05), por lo que debe entenderse como una contribución de investigación sobre tokenización, no como un sistema listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Marian (4 capas encoder / 4 capas decoder, d_model=256) |
| Parametros totales | 17.122.800 (pesos safetensors); la model card declara ≈11,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 presumiblemente; no se documenta) |
| Idiomas soportados | es (español), qu (quechua, variante chanka) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder estándar de la familia Marian, con 4 capas en cada torre y una dimensión oculta de 256, lo que arroja un modelo muy compacto (≈11,5 M parámetros según la model card). La innovación principal está en la tokenización del lado objetivo: PRPE (Prefix-Root-Postfix Encoding) descompone las palabras quechuas en prefijo, raíz y sufijo, explotando la naturaleza aglutinante de la lengua. El vocabulario resultante es de 22.000 piezas y cubre el 98,3 % de los tokens del conjunto de entrenamiento. El lado fuente (español) no se describe en detalle en la información disponible.

El entrenamiento se realizó desde cero sobre el split `broad_train` del dataset makitty/quechua-chanka-unified-v2, con 91.000 pares de frases paralelas. No se documentan en la información proporcionada el número total de tokens vistos, la composición detallada del corpus ni si hubo fases de RLHF, DPO o ajuste fino adicional. La contribución metodológica del trabajo asociado (QuechuaTok) es demostrar que la precisión en fronteras morfológicas del tokenizador correlaciona con ganancias extrínsecas de traducción, algo que la ablación controlada frente al modelo BPE idéntico respalda.

## Capacidades

- Traducción unidireccional español→quechua (chanka), según el pipeline `translation` declarado.
- Segmentación morfológicamente informada en el lado quechua gracias al tokenizador PRPE, que produce unidades composicionales (prefijo-raíz-sufijo) en lugar de formas superficiales.
- Manejo de morfología aglutinante: el tokenizador está diseñado específicamente para lenguas con alta productividad sufijal.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- Cobertura multilingüe limitada a los dos idiomas declarados (es, qu); no hay indicios de otras lenguas.
- No se documenta traducción inversa (quechua→español).

## Casos de uso

- Investigación en tokenización para lenguas de bajos recursos: el modelo sirve como referencia reproducible para medir el impacto de PRPE frente a BPE en un par lingüístico concreto, con el dataset y el modelo baseline publicados.
- Ablaciones controladas en papers de NLP: al existir un gemelo entrenado con BPE sobre los mismos datos, permite aislar la variable del tokenizador en experimentos comparativos.
- Preservación digital del quechua chanka: traducción asistida de material divulgativo o administrativo del español al quechua, siempre con revisión humana dada la calidad absoluta limitada (BLEU 7,05).
- Prototipado de asistentes bilingües de bajo coste: con 17 M de parámetros y 0,1 GB de repo, puede desplegarse en CPU o en GPUs de gama baja para demos y pruebas de concepto.
- Generación de corpus sintéticos para aumento de datos: las traducciones del modelo pueden emplearse como datos adicionales (con filtrado de calidad) en el entrenamiento de modelos mayores para el mismo par.
- Docencia y formación en NLP de lenguas indígenas: caso de estudio práctico sobre cómo la morfología guía el diseño de tokenizadores y cómo se evalúa su efecto con métricas tanto intrínsecas como extrínsecas.
- Evaluación de métricas de tokenización: útil para replicar el análisis de MorphAcc, BLEU y chrF descrito en QuechuaTok sobre nuevos corpus.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test (n=12.206):

| Tokenizador | MorphAcc (%) | BLEU | chrF |
|---|---|---|---|
| BPE (baseline) | 6,67 | 4,18 | 35,13 |
| PRPE (este modelo) | 83,33 | 7,05 | 41,10 |

La model card reporta una mejora del +68,7 % en BLEU y del +17,0 % en chrF respecto al baseline BPE, pese a generar secuencias objetivo más largas (18,6 frente a 11,4 tokens por frase). No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo de traducción de este tamaño.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (17,1 M de parámetros ≈ 68 MB de pesos); en la práctica, cualquier GPU con 1-2 GB libres es suficiente.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobradamente suficiente.
- Cabe en cualquier GPU consumer y en hardware embebido o de gama baja.
- Opciones de despliegue: al ser un modelo Marian con safetensors, es compatible con la librería `transformers` (pipeline `translation`) y con servidores tipo TGI. No se documenta compatibilidad con llama.cpp, Ollama ni vLLM en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BLEU (test) | chrF (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| quechua-chanka-mt-prpe (este) | 17,1 M (safetensors) | no disponible | 7,05 | 41,10 | Apache 2.0 | HuggingFace |
| quechua-chanka-mt-bpe | mismo tamaño (modelo gemelo) | no disponible | 4,18 | 35,13 | no disponible en la información | HuggingFace |
| Otros modelos es-qu | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación natural es con su gemelo BPE, entrenado sobre los mismos datos y con la misma arquitectura, que es precisamente el diseño experimental del trabajo. No se dispone de información sobre otros sistemas de traducción español-quechua con los que contrastar.

## Limitaciones y advertencias

- Calidad absoluta baja: BLEU 7,05 y chrF 41,10 indican traducciones útiles para investigación pero no fiables sin revisión humana en producción.
- Entrenamiento desde cero con solo 91.000 pares paralelos: cobertura léxica y de dominios limitada; probable degradación fuera del dominio del corpus `broad_train`.
- Direccionalidad única: solo español→quechua; no se documenta la inversa.
- Variante dialectal restringida: el modelo está especializado en quechua chanka; su uso con otras variedades (cusqueño, boliviano) no está validado.
- Riesgo de alucinación y de morfología mal formada: al generar unidades prefijo-raíz-sufijo, errores en la composición pueden producir palabras agramaticales o inexistentes.
- Sesgos: no se documentan análisis de sesgo; el corpus de entrenamiento puede reflejar sesgos de las fuentes originales.
- Longitud de contexto no documentada: no se especifica el máximo de tokens de entrada, lo que complica el diseño de pipelines con frases largas.
- Licencia Apache 2.0 permite uso comercial, pero la baja calidad desaconseja su uso directo en productos sin post-edición.
- Sin métricas de latencia ni guías de despliegue publicadas; el soporte de servidores de inferencia no está verificado.
- Descargas muy bajas (15) y ausencia de validación comunitaria: ecosistema y mantenimiento inciertos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/makitty/quechua-chanka-mt-prpe
- Modelo baseline BPE: https://huggingface.co/makitty/quechua-chanka-mt-bpe
- Dataset de entrenamiento: https://huggingface.co/datasets/makitty/quechua-chanka-unified-v2
- Paper QuechuaTok (arXiv): https://arxiv.org/abs/2606.23943
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada

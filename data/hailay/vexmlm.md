# Hailay/VEXMLM

## Resumen

VEXMLM (Vocabulary Expansion for Low-Resource Multilingual Language Modeling) es un modelo de lenguaje enmascarado desarrollado por Hailay que amplía el vocabulario de `xlm-roberta-base` con 30.000 subpalabras adicionales del alfabeto ge'ez, fusionadas directamente en el modelo SentencePiece del tokenizador. El modelo resultante se somete a un entrenamiento continuado de modelado de lenguaje enmascarado (MLM) sobre corpus monolingües de amárico y tigriña, las dos lenguas etiópicas con mayor número de hablantes que usan escritura ge'ez. Su objetivo es mejorar la representación de estas lenguas de bajos recursos, que tradicionalmente quedan infrarrepresentadas en los modelos multilingües preentrenados.

El modelo se basa en la arquitectura transformer de 12 capas de XLM-R, con 301.365.186 parámetros y una ventana de contexto máxima de 514 posiciones. La principal innovación técnica reside en la fusión de los nuevos tokens directamente en el vocabulario de SentencePiece en lugar de usar `added_tokens`, lo que evita la corrupción de la decodificación por la inserción del marcador de límite de palabra `▁`. Las nuevas filas de embeddings se inicializan con la media global de la matriz de embeddings existente y se entrenan durante el preentrenamiento continuado.

VEXMLM es relevante porque aborda un problema crítico en el procesamiento del lenguaje natural para lenguas de bajos recursos: la segmentación ineficiente y la alta tasa de palabras fuera de vocabulario. Los resultados muestran mejoras sustanciales en fertilidad (subpalabras por palabra) y compresión de tokens en amárico y tigriña, así como una ganancia de 1,09 puntos en precisión de palabras fuera de vocabulario en tareas de reconocimiento de entidades nombradas, siempre que se combine la expansión de vocabulario con el preentrenamiento continuado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLMRobertaForMaskedLM (transformer encoder, 12 capas, hidden 768, 12 cabezas) |
| Parametros totales | 301.365.186 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 514 posiciones (max position embeddings) |
| Tipos de cuantizacion | no disponible (pesos en bf16, sin cuantizaciones publicadas) |
| Idiomas soportados | amárico (am), tigriña (ti) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VEXMLM parte de `FacebookAI/xlm-roberta-base`, un transformer encoder de 12 capas con dimensión oculta 768 y 12 cabezas de atención. La expansión de vocabulario añade 30.000 subpalabras específicas del ge'ez directamente al modelo SentencePiece del tokenizador, alcanzando un vocabulario total de 280.002 tokens. Esta fusión nativa evita el comportamiento problemático de los `added_tokens` de Hugging Face, donde el matcher de tokens añadidos se ejecuta antes que la segmentación SentencePiece y emite el marcador `▁` en medio de las palabras, corrompiendo la decodificación.

Las nuevas filas de la matriz de embeddings se inicializan con la media global de las filas existentes y se entrenan durante el preentrenamiento continuado. El entrenamiento consiste en MLM con probabilidad de enmascaramiento 0,15 sobre corpus monolingües de amárico (200.001 líneas, 9,09 millones de caracteres) y tigriña (200.000 líneas, 6,98 millones de caracteres). Se utilizó una secuencia máxima de 256 tokens, tamaño de lote 32, tasa de aprendizaje 5e-5 con decaimiento lineal y 6% de warmup, weight decay 0,01, recorte de gradiente 1,0, optimizador AdamW y precisión bf16. El entrenamiento se ejecutó en una única GPU NVIDIA A100 durante 56 épocas completadas de 60 configuradas, seleccionando el checkpoint con mejor pérdida de validación (época 56, paso 24.808): pérdida 3,7120 y perplejidad 41,67.

## Capacidades

- Modelo de lenguaje enmascarado (fill-mask) para amárico y tigriña, capaz de predecir tokens enmascarados en contexto.
- Segmentación subpalabra significativamente más eficiente que la del XLM-R base: la fertilidad (subpalabras por palabra) cae un 28,0% en amárico y un 45,9% en tigriña, mientras que la compresión (caracteres por token) sube un 39,0% y un 84,9% respectivamente.
- Los tokens añadidos son utilizados activamente: representan el 24,2% de la masa de tokens en amárico y el 45,5% en tigriña.
- Mejora del round-trip de palabras fuera de vocabulario en tigriña (de 0,9954 a 0,9987), con round-trip perfecto en amárico.
- Adecuado como punto de partida para fine-tuning en tareas de clasificación de tokens, respuesta a preguntas y clasificación de secuencias mediante las clases `AutoModelFor...` correspondientes.
- No incluye capacidades de generación de texto libre, tool calling, agentes, visión ni audio; es exclusivamente un encoder enmascarado.

## Casos de uso

- Reconocimiento de entidades nombradas (NER) en amárico y tigriña: el modelo fine-tuneado sobre MasakhaNER Amharic alcanza una Entity-F1 de 0,6347, y sobre el dataset Tigrinya NER una Entity-F1 de 0,7282. Es adecuado para extraer personas, organizaciones y lugares en textos administrativos o periodísticos de la región.
- Respuesta a preguntas extractivas en amárico: con fine-tuning sobre AmQA logra EM de 32,57 y F1 de 48,85, suficiente para prototipos de asistentes de consulta sobre documentos locales.
- Clasificación de sentimiento en amárico: fine-tuneado sobre AfriSenti alcanza una precisión de 0,4978 y macro-F1 de 0,4971, útil para monitorización de opiniones en redes sociales, aunque con margen de mejora.
- Análisis de documentos históricos o religiosos en ge'ez: la expansión de vocabulario mejora la segmentación de textos largos en escritura etiópica, facilitando tareas de indexación y búsqueda.
- Investigación en NLP de lenguas de bajos recursos: sirve como modelo base para estudiar el impacto de la expansión de vocabulario y el preentrenamiento continuado en lenguas etiópicas, con scripts de fine-tuning disponibles en el repositorio de GitHub.
- Desarrollo de correctores ortográficos o herramientas de autocompletado en amárico y tigriña: su naturaleza de modelo enmascarado permite predecir tokens faltantes en contexto, útil para editores de texto y teclados predictivos.

## Benchmarks y rendimiento

Los resultados reportados provienen de la evaluación del autor con fine-tuning en tareas downstream, usando 5 semillas distintas (42-46) sobre una A100-PCIE-40GB con kernels deterministas. Se presentan como media ± desviación estándar:

| Tarea | Dataset | Metrica | VEXMLM |
|---|---|---|---|
| NER | MasakhaNER Amharic | Accuracy | 0,9413 ± 0,0026 |
| | | Macro-F1 | 0,7423 ± 0,0122 |
| | | Entity-F1 | 0,6347 ± 0,0148 |
| NER | Tigrinya NER | Accuracy | 0,9515 ± 0,0005 |
| | | Macro-F1 | 0,8219 ± 0,0069 |
| | | Entity-F1 | 0,7282 ± 0,0079 |
| QA | AmQA | EM | 32,57 ± 0,77 |
| | | F1 | 48,85 ± 0,96 |
| QA | TIGQA | EM | 2,39 ± 0,82 |
| | | F1 | 9,76 ± 0,97 |
| SA | AfriSenti (Amharic) | Accuracy | 0,4978 ± 0,0331 |
| | | Macro-F1 | 0,4971 ± 0,0193 |

El autor advierte que TIGQA tiene solo 67 preguntas de test, insuficientes para sostener una afirmación de QA por sí solas, por lo que reporta TiQuAD como tarea diagnóstica complementaria (926 preguntas): EM 50,24 ± 0,48 y F1 58,90 ± 0,66.

En la ablación sobre precisión de palabras fuera de vocabulario (OOV) en NER de tigriña, sobre un conjunto idéntico de 3.491 tipos de palabra (74,6% del total), los resultados son:

| Configuracion | OOV Acc. (%) | Δ |
|---|---|---|
| XLM-R baseline | 94,57 ± 0,16 | — |
| + VocabExp (Random Init) | 87,04 ± 0,20 | −7,52 |
| + VocabExp (Mean Init) | 87,63 ± 0,14 | +0,59 |
| + Continued Pretraining | 95,66 ± 0,09 | +8,02 |

La expansión de vocabulario por sí sola degrada la precisión OOV; el preentrenamiento continuado recupera esa pérdida y supera la línea base en 1,09 puntos. El autor señala que las ramas 2 y 3 no reciben preentrenamiento continuado, por lo que el +8,02 atribuido a esta técnica incluye también el efecto de 56 épocas adicionales de entrenamiento sobre texto amárico y tigriña.

## Requisitos de hardware

- VRAM estimada para inferencia: con 301 millones de parámetros en bf16, el modelo ocupa aproximadamente 0,6 GB en memoria; con cargas de trabajo de fine-tuning, se recomiendan al menos 8 GB de VRAM para lotes pequeños.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM es suficiente para inferencia (p. ej., RTX 3060, RTX 4060, RTX 4090). El entrenamiento reportado se realizó en una NVIDIA A100 de 40 GB, pero fine-tuning en tareas downstream puede ejecutarse en GPUs de consumo con 12-16 GB.
- Cabe en GPU de consumo: sí, tanto para inferencia como para fine-tuning con tamaños de lote moderados.
- Opciones de despliegue: compatible con la librería `transformers` de Hugging Face; puede servirse con TGI o vLLM para tareas de fill-mask, aunque al ser un modelo enmascarado su uso principal es como base para fine-tuning.
- Latencia y throughput: no se han publicado mediciones específicas; para un modelo de 301M parámetros, la inferencia en GPU moderna es del orden de milisegundos por secuencia.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de la misma categoría (p. ej., AfriBERTa, mBERT o modelos específicos para lenguas etiópicas) en la información proporcionada. La única comparación publicada es contra su modelo base `xlm-roberta-base`, que se resume a continuación:

| Modelo | Parametros | Vocabulario | Contexto | Fertilidad (am) | Fertilidad (ti) | Licencia |
|---|---|---|---|---|---|---|
| xlm-roberta-base | 278M aprox. | 250.002 | 514 | 2,0692 | 3,1300 | MIT |
| VEXMLM | 301.365.186 | 280.002 | 514 | 1,4888 | 1,6928 | Apache 2.0 |

VEXMLM añade 30.000 tokens y mejora la segmentación en ambas lenguas, pero no se han publicado resultados comparativos frente a otros modelos multilingües o monolingües etiópicos.

## Limitaciones y advertencias

- El modelo es exclusivamente un encoder enmascarado; no genera texto libre ni soporta tareas generativas o conversacionales sin adaptaciones adicionales.
- Los datos de entrenamiento son limitados (aproximadamente 16 millones de caracteres en total), lo que puede restringir la generalización a dominios especializados o registros muy diferentes de los corpus utilizados.
- La evaluación downstream muestra resultados débiles en respuesta a preguntas en tigriña (TIGQA: EM 2,39) y en clasificación de sentimiento en amárico (precisión 0,4978, cerca del azar), lo que indica que el modelo no es competitivo en estas tareas sin más datos o ajustes.
- La expansión de vocabulario por sí sola degrada el rendimiento en palabras fuera de vocabulario si no se acompaña de preentrenamiento continuado; no debe usarse el checkpoint sin el entrenamiento posterior.
- El autor advierte que la ganancia de +8,02 en la ablación puede deberse en parte a las épocas adicionales de entrenamiento, no solo a la adaptación del vocabulario.
- No se han evaluado sesgos sociales o culturales; al entrenarse sobre corpus de dominios específicos (no descritos en detalle), puede reflejar sesgos presentes en esos textos.
- Riesgo de alucinación: al ser un modelo enmascarado, no genera texto libre, por lo que el riesgo de alucinación es bajo en su uso directo, pero puede manifestarse en tareas downstream tras fine-tuning.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base XLM-R tiene licencia MIT; ambas son permisivas.

## Enlaces

- Hugging Face: https://huggingface.co/Hailay/VEXMLM
- Repositorio oficial (implementación y scripts de fine-tuning): https://github.com/hailaykidu/VEXMLM
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base

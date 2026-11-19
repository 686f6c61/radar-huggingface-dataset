# 13fragments/ner-german-historic-large

## Resumen

ner-german-historic-large es un modelo de reconocimiento de entidades nombradas (NER) especializado en alemán histórico, desarrollado por el usuario 13fragments. Se construye mediante fine-tuning de FacebookAI/xlm-roberta-large (558,8 millones de parámetros) sobre corpus históricos que abarcan aproximadamente desde 1700 hasta 1950, e incorpora también datos de alemán moderno para evitar regresiones en ese dominio. El modelo mantiene las mismas etiquetas e interfaz que flair/ner-german-large (PER, LOC, ORG, MISC), por lo que puede sustituirlo directamente en pipelines existentes.

La relevancia del modelo radica en su rendimiento sobre texto histórico alemán: alcanza un F1 de entidad de 0,788 en un pool histórico combinado, frente a 0,680 del modelo de referencia flair/ner-german-large en las mismas frases, una mejora de 10,6 puntos. En alemán moderno (GermEval 2014) mantiene un F1 de 0,907, ligeramente por encima del 0,882 de la referencia, lo que demuestra que la especialización histórica no degrada el rendimiento contemporáneo.

El modelo se distribuye en formatos safetensors, PyTorch y ONNX (fp32 e int8), con soporte para transformers, Flair, transformers.js y ONNX Runtime. El repositorio ocupa 18,4 GB e incluye variantes cuantizadas que reducen el peso a entre 0,9 y 1,4 GB, lo que facilita su despliegue tanto en servidor como en navegador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) con cabeza de token classification |
| Parámetros totales | 558.850.057 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (XLM-RoBERTa large admite hasta 512 tokens, dato no confirmado en la información proporcionada) |
| Tipos de cuantización | fp32, int8 (q8 con embeddings fp32 e int8 con embeddings fp16) |
| Idiomas soportados | Alemán (de) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, PyTorch, ONNX (model.onnx, model_quantized.onnx, model_int8.onnx) |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa large, un transformer encoder multilingüe de 24 capas y 558,8 millones de parámetros, al que se añade una cabeza de clasificación de tokens para NER con las etiquetas PER, LOC, ORG y MISC. El fine-tuning se realiza sobre un pool de datos históricos compuesto por SoNAR (periódicos de Berlín), HisGermaNER (periódicos austríacos, 1720-1840) y Europeana Newspapers (Biblioteca Nacional de Austria y Tessmann Library), complementado con GermEval 2014 para preservar el rendimiento en alemán moderno. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de las fuentes citadas.

El autor aplica un protocolo de evaluación riguroso: elimina del entrenamiento las frases solapadas con los conjuntos de test y publica el split de test de Europeana en `eval/europeana_test_split.jsonl`. Los pesos liberados corresponden a la semilla 3 de 4 semillas de entrenamiento, seleccionada sobre validación antes de leer el test. Se define una puerta de release previa al entrenamiento que exige una mejora mínima de 0,029 en F1 histórico agrupado y que ningún test histórico quede más de 0,010 por debajo de la referencia; ambas condiciones se cumplen. No se menciona el uso de RLHF, DPO ni decodificación especulativa, lo cual es coherente con una tarea discriminativa de etiquetado.

## Capacidades

- Reconocimiento de entidades nombradas en alemán histórico (aproximadamente 1700-1950) con etiquetas PER, LOC, ORG y MISC.
- Etiquetado a nivel de token con spans exactos y tipo de entidad, evaluado con F1 de entidad micro.
- Compatibilidad drop-in con flair/ner-german-large: misma interfaz y mismas etiquetas, lo que permite sustituir el modelo sin cambios en el código.
- Ejecución en múltiples runtimes: Flair (SequenceTagger), transformers (pipeline de token-classification), transformers.js (navegador y Node) y ONNX Runtime.
- Soporte de cuantización int8 para despliegue en navegador mediante ONNX Runtime Web (WASM) y aceleración con WebGPU cuando está disponible.
- Manejo de texto histórico con grafías antiguas, como la s larga (ſ) presente en el ejemplo de la model card ("reiſte", "geſtern").
- Capacidad multilingüe limitada: el modelo está entrenado y evaluado únicamente para alemán; no se declaran capacidades en otras lenguas.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes, al tratarse de un modelo discriminativo de token classification.

## Casos de uso

- Digitalización de archivos históricos: procesamiento de periódicos, cartas y registros alemanes de los siglos XVIII a XX para extraer automáticamente nombres de personas, lugares y organizaciones, aprovechando su entrenamiento específico en grafías y ortografía históricas.
- Enriquecimiento de colecciones de bibliotecas digitales: indexación de corpus como Europeana Newspapers con metadatos de entidades, facilitando búsquedas por persona, lugar u organización sobre materiales ya digitalizados.
- Investigación en humanidades digitales: extracción de redes de actores históricos (por ejemplo, corresponsales en epistolarios o menciones en prensa) para análisis prosopográficos y estudios de redes sociales históricas.
- Migración desde flair/ner-german-large: sustitución directa en pipelines existentes de Flair o transformers sin reescribir código, obteniendo una mejora de 10,6 puntos de F1 en texto histórico y de 2,6 puntos en alemán moderno.
- Procesamiento en navegador sin backend: uso de la variante int8 (0,9 GB) con transformers.js y ONNX Runtime Web para anotar documentos históricos directamente en el cliente, útil en aplicaciones de consulta de archivos que no pueden enviar texto a un servidor.
- Normalización de metadatos en catálogos bibliográficos: detección de entidades en registros catalográficos históricos para poblar campos estructurados de autor, lugar de publicación o entidad corporativa.
- Preservación del rendimiento en alemán moderno: uso del mismo modelo para corpus mixtos (históricos y contemporáneos) sin necesidad de mantener dos sistemas, gracias a su F1 de 0,907 en GermEval 2014.

## Benchmarks y rendimiento

Los resultados proceden de la model-index oficial y de la model card del autor. La métrica es F1 de entidad micro con span y tipo exactos, etiquetas PER, LOC y ORG; las predicciones MISC se ignoran porque el gold histórico no las anota. La media ± desviación estándar se calcula sobre 4 semillas de entrenamiento; los pesos liberados son la semilla 3.

| Conjunto de test | Modelo liberado | Media ± sd (4 semillas) | flair/ner-german-large | Diferencia (media) | Entidades |
|---|---|---|---|---|---|
| Pool histórico (SoNAR + HisGermaNER + Europeana) | 0,788 | 0,786 ± 0,003 | 0,680 | +0,106 | 2851 |
| SoNAR (periódicos de Berlín) | 0,659 | 0,664 ± 0,007 | 0,583 | +0,081 | 471 |
| HisGermaNER (periódicos austríacos, 1720-1840) | 0,795 | 0,785 ± 0,008 | 0,663 | +0,122 | 465 |
| Europeana Newspapers (ONB y LFT, último 20 % reservado) | 0,818 | 0,816 ± 0,003 | 0,710 | +0,106 | 1915 |
| GermEval 2014 (alemán moderno) | 0,907 | 0,907 ± 0,003 | 0,882 | +0,026 | 4495 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB de pesos, más overhead de activaciones; en la práctica, entre 3 y 4 GB para lotes pequeños.
- VRAM estimada en int8: aproximadamente 1,4 GB (q8) o 0,9 GB (int8), con overhead mínimo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes. Para int8 basta con 2 GB.
- Cabe en GPU de consumo: sí, en todas las GPU consumer modernas con 4 GB o más; también en CPU para inferencia por lotes pequeños.
- Despliegue: Flair (SequenceTagger), transformers (pipeline), ONNX Runtime (CPU y GPU), transformers.js en navegador con ONNX Runtime Web (WASM por defecto, WebGPU opcional).
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder de 558 M de parámetros y contexto de hasta 512 tokens, se espera un throughput alto en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 pool histórico | F1 GermEval 2014 | Licencia | Formatos |
|---|---|---|---|---|---|---|
| 13fragments/ner-german-historic-large | 558,8 M | No disponible | 0,788 | 0,907 | CC BY-SA 4.0 | safetensors, PyTorch, ONNX |
| flair/ner-german-large | No disponible (XLM-R large, ~560 M según la model card) | No disponible | 0,680 | 0,882 | No disponible en la información | No disponible en la información |
| Otros modelos NER alemán (p. ej. variantes de GermEval) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa disponible se limita a flair/ner-german-large, que el autor usa como referencia y ejecuta en las mismas frases y máquina. No se dispone de datos de otros modelos NER históricos alemanes en la información proporcionada.

## Limitaciones y advertencias

- El pool de test histórico contiene únicamente texto de periódicos; cartas, diarios y registros no están representados, por lo que no hay puntuación medida para esos géneros y el rendimiento podría ser inferior.
- El F1 en SoNAR (periódicos de Berlín) es el más bajo del conjunto histórico (0,659), lo que sugiere variabilidad según la fuente y la época.
- El modelo solo cubre alemán; no se ha evaluado en otras lenguas ni en texto multilingüe.
- Las etiquetas se limitan a PER, LOC, ORG y MISC; no se anotan otras categorías (fechas, cantidades, eventos) y las predicciones MISC se ignoran en la evaluación histórica por falta de gold.
- Riesgo de alucinación de entidades: como todo modelo discriminativo, puede etiquetar falsos positivos en texto ruidoso o con OCR deficiente, especialmente en grafías históricas no vistas.
- Sesgos: no se documentan análisis de sesgo demográfico, geográfico o de género en la información disponible; el corpus histórico puede reflejar sesgos de las fuentes originales (prensa de los siglos XVIII-XX).
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integración en productos propietarios.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados declarados; las métricas son del autor y no están verificadas (`verified: false`).
- No se especifica la longitud máxima de contexto efectiva en la información proporcionada; para documentos largos será necesario segmentar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/13fragments/ner-german-historic-large
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Modelo de referencia: https://huggingface.co/flair/ner-german-large
- Dataset GermEval 2014: https://huggingface.co/datasets/GermanEval/germeval_14
- Dataset HisGermaNER: https://huggingface.co/datasets/stefan-it/HisGermaNER

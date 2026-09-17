# dilarayavuz/generated-sst2-addsent-bert-lr4

## Resumen

El modelo `dilarayavuz/generated-sst2-addsent-bert-lr4` es un ajuste fino (fine-tuning) de `google-bert/bert-base-uncased` para clasificación de texto binaria, concretamente análisis de sentimiento sobre el corpus SST-2 (Stanford Sentiment Treebank). Lo publica el usuario dilarayavuz en HuggingFace y fue generado con la herramienta AutoTrain, el asistente de entrenamiento automático de HuggingFace, tal y como indica la propia model card. No se trata de un modelo fundacional nuevo, sino de un checkpoint de clasificación derivado de un encoder BERT ya preentrenado.

Técnicamente es un transformer encoder de tipo BERT en configuración base: 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y una ventana de contexto de 512 tokens. El recuento real de parámetros en safetensors es de 109.483.778, lo que coincide con BERT-base-uncased (109.482.240) más una cabeza de clasificación lineal de 2 clases de 1.538 parámetros, lo que confirma que el problema se aborda como clasificación binaria de sentimiento (positivo/negativo).

Su relevancia es limitada y de nicho: se trata de un artefacto experimental con cero descargas y cero likes en el momento de redactar esta ficha, sin licencia declarada, sin idiomas declarados y sin model card descriptiva más allá de las métricas de validación. Resulta útil como referencia de un flujo AutoTrain reproducible y como baseline ligero de clasificación de sentimiento, pero no está pensado ni documentado como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), 12 capas, 768 ocultos, 12 cabezas de atención |
| Parametros totales | 109.483.778 (según safetensors); incluye cabeza de clasificación de 2 clases |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite de posiciones del modelo base bert-base-uncased) |
| Tipos de cuantizacion | No disponible (no se documentan versiones cuantizadas; al ser safetensors fp32/fp16 se puede cuantizar a int8 con herramientas externas) |
| Idiomas soportados | No disponible (el modelo base es mayoritariamente inglés; el autor no declara idiomas) |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors (también se etiqueta con `transformers`; el repo ocupa 1,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de BERT-base estándar: pila de 12 bloques de encoder transformer con atención multi-cabeza bidireccional, embeddings de token (WordPiece, vocabulario de 30.522 entradas), embeddings de posición y de segmento, y normalización de capa. Sobre el `[CLS]` se añade una capa lineal de clasificación. El tokenizador del modelo base es *uncased*, por lo que el texto se pasa a minúsculas antes de tokenizar. El nombre del repositorio incluye `lr4`, que sugiere un identificador de configuración de tasa de aprendizaje en el barrido de AutoTrain, pero no hay documentación que confirme su significado exacto.

No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni hiperparámetros (épocas, batch size, learning rate, warmup). El identificador contiene `addsent`, término que en la literatura de SST-2 se asocia habitualmente a la técnica de aumento de datos *EDA* propuesta por Wei y Zou (2019), que genera ejemplos sintéticos con ese nombre; sin embargo, la model card no menciona ninguna técnica de aumento de datos, por lo que esto es una inferencia a partir del nombre y no un dato verificado. El entrenamiento se realizó con AutoTrain, cuyo flujo por defecto hace fine-tuning supervisado del encoder completo sobre la tarea de clasificación.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en textos cortos, típicamente frases de reseñas.
- Salida de logits/label con puntuación de confianza por clase, apta para umbralización posterior.
- Codificación contextual de frases de hasta 512 tokens, útil para obtener representaciones internas del encoder.
- Inferencia rápida por secuencia, adecuada para procesamiento por lotes de alto volumen.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo *thinking*, ni capacidades de visión, audio o multimodalidad.
- Capacidad multilingüe: no disponible; el modelo base está preentrenado predominantemente en inglés.
- Tareas distintas de la clasificación de sentimiento (NER, QA, resumen) no están soportadas por esta cabeza de clasificación.

## Casos de uso

- Análisis de sentimiento de reseñas de producto: el modelo clasifica frases cortas de opinión en positivo/negativo; es adecuado porque su entrenamiento y sus métricas de validación proceden precisamente del dominio SST-2 (reseñas de cine) y el formato de entrada es una única frase.
- Moderación de comentarios basada en tono: se puede usar como señal auxiliar para priorizar revisiones humanas de comentarios negativos, con umbral de confianza calibrado sobre la probabilidad de la clase negativa.
- Etiquetado masivo de corpus para investigación: al ser un modelo de 109 M de parámetros, permite procesar cientos de miles de frases en GPU de gama media para construir datasets etiquetados de sentimiento.
- Baseline en experimentos de NLP: sirve como punto de comparación reproducible frente a otros ajustes de BERT-base sobre SST-2 antes de invertir en modelos mayores.
- Componente de un pipeline de *routing* de atención al cliente: clasificar el sentimiento de cada mensaje entrante para enrutar a colas de soporte distintas, gracias a la baja latencia por secuencia y a la posibilidad de ejecutarlo en CPU.
- Filtrado de feedback en encuestas y formularios abiertos: aplicar clasificación binaria sobre respuestas cortas y agregar la proporción de sentimiento por periodo o por producto.
- Extracción de características (*embeddings* del `[CLS]` o de la última capa) como entrada para un clasificador posterior más específico de dominio, en lugar de usar la cabeza original.

## Benchmarks y rendimiento

La model card publica únicamente métricas de validación, sin especificar el split exacto ni el procedimiento de evaluación. Se reproducen tal cual:

| Metrica | Valor |
|---|---|
| Loss (validación) | 0,22933757305145264 |
| F1 | 0,919047619047619 |
| Precision | 0,9426129426129426 |
| Recall | 0,8966318234610917 |
| AUC | 0,9674323048798031 |
| Accuracy | 0,9107025607353907 |

No se han publicado resultados en MMLU, HumanEval, GSM8K ni en ningún otro benchmark de conocimiento general, lo cual es esperable en un modelo de clasificación de sentimiento. No hay datos de comparación frente a otros checkpoints en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 0,44 GB solo de pesos (109,5 M × 4 bytes), más activaciones y memoria del runtime; con batch pequeño cabe holgadamente en menos de 2 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,22 GB de pesos; el modelo entero cabe en cualquier GPU con más de 2 GB.
- VRAM estimada en int8: aproximadamente 0,11 GB de pesos, viable incluso en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, 4060, 4090) es más que suficiente; para lotes grandes en producción se puede usar T4, L4, A10G, A100 o H100 sin que el modelo suponga un cuello de botella.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, y también en CPU con latencias de milisegundos por secuencia.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, servidor de inferencia de HuggingFace (Inference Endpoints), exportación a ONNX Runtime o TorchScript para CPU, y `vLLM` en su modo de clasificación. La etiqueta `text-embeddings-inference` aparece en el repositorio porque AutoTrain la añade por defecto, pero el modelo no es un modelo de embeddings sino de clasificación, por lo que no es directamente desplegable con TEI. `llama.cpp` y `Ollama` no aplican a BERT.
- Latencia y throughput: no publicados por el autor. Como referencia orientativa no verificada, un BERT-base en fp16 sobre una GPU moderna procesa lotes de decenas a centenares de secuencias cortas por segundo, con latencias por lote en el orden de milisegundos; conviene medirlo en el hardware objetivo antes de dimensionar producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento en SST-2 | Disponibilidad |
|---|---|---|---|---|---|
| dilarayavuz/generated-sst2-addsent-bert-lr4 | 109,5 M | 512 tokens | No disponible | Accuracy 0,9107 / F1 0,9190 (validación, según su model card) | HuggingFace, 0 descargas, sin model card descriptiva |
| textattack/bert-base-uncased-SST-2 | ~109,5 M | 512 tokens | No disponible | No disponible en esta ficha | Checkpoint muy establecido y citado en la literatura |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | No disponible en esta ficha | No disponible en esta ficha | Modelo oficial de HuggingFace, ampliamente usado como baseline |
| roberta-base ajustado sobre SST-2 | ~125 M | 512 tokens | No disponible en esta ficha | No disponible en esta ficha | Múltiples checkpoints de terceros; requiere verificar cada uno |

No se dispone de cifras comparativas verificadas en la información proporcionada, por lo que la comparación se limita a tamaño, contexto y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: al no figurar licencia en el repositorio, no hay autorización explícita para uso comercial; hay que contactar con el autor o abstenerse de usarlo en producción.
- Sin idiomas declarados: el modelo base está preentrenado mayoritariamente en inglés y no se documenta comportamiento en castellano ni en otras lenguas; el rendimiento fuera del inglés es impredecible.
- Dominio muy acotado: entrenado sobre SST-2 (reseñas de cine), por lo que puede degradarse en textos de otros dominios (legal, técnico, redes sociales) o con sarcasmo, ironía y negaciones complejas.
- Sesgo y alucinación: no hay análisis de sesgos publicado. Al ser un clasificador, no «alucina» texto, pero sí puede producir etiquetas erróneas con alta confianza; conviene calibrar umbrales.
- Riesgo de sobreajuste a artefactos del dataset: si se aplicó realmente aumento de datos tipo *addsent*, los ejemplos sintéticos pueden introducir patrones léxicos espurios, aunque esto no está confirmado.
- Limitación de longitud: los textos que superen los 512 tokens deben truncarse o dividirse, lo que puede perder información relevante.
- Trazabilidad mínima: no se documentan hiperparámetros, split de evaluación ni procedencia exacta de los datos, lo que dificulta reproducir las métricas publicadas.
- Metadatos anómalos: las fechas de creación y actualización del repositorio (septiembre de 2026) son posteriores a la fecha de esta ficha, lo que sugiere un error de sellado temporal; no debe tomarse como referencia de versionado.
- Sin mantenimiento aparente: 0 descargas y 0 likes; no hay evidencia de soporte, actualizaciones ni comunidad detrás del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/dilarayavuz/generated-sst2-addsent-bert-lr4
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Herramienta de entrenamiento (AutoTrain): https://huggingface.co/autotrain
- Documentación de AutoTrain: https://huggingface.co/docs/autotrain/index
- Dataset SST-2 (Stanford Sentiment Treebank): https://nlp.stanford.edu/sentiment/
- Paper de BERT: https://arxiv.org/abs/1810.04805
- Referencia de la técnica EDA (*Easy Data Augmentation*, posible origen del sufijo `addsent`): https://arxiv.org/abs/1901.11196

Nota: la búsqueda web asociada a esta ficha devolvió únicamente resultados sobre protección contra sobretensiones eléctricas, sin relación alguna con el modelo; no se han encontrado papers, blogs ni repositorios adicionales específicos de este checkpoint.

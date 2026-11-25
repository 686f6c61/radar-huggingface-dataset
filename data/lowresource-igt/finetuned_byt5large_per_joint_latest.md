# lowresource-igt/finetuned_byT5large_per_joint_latest

## Resumen

`finetuned_byT5large_per_joint_latest` es un modelo de generación texto-a-texto obtenido mediante ajuste fino supervisado de `google/byt5-large`, el encoder-decoder de Google basado en la arquitectura T5 pero con tokenización a nivel de byte (vocabulario de 256 símbolos). Lo publica el usuario `lowresource-igt`, un espacio de trabajo orientado a tecnologías del lenguaje para lenguas de bajos recursos, y su nombre sugiere un ajuste orientado a una tarea de generación conjunta ("per joint"), presumiblemente normalización, transliteración o traducción en un contexto multilingüe de bajos recursos.

El modelo conserva los 1.228 millones de parámetros del ByT5-large original y se distribuye con pesos en safetensors bajo licencia Apache 2.0. Su principal interés técnico reside en la tokenización byte a byte, que elimina la dependencia de un vocabulario específico y lo hace robusto frente a errores ortográficos, ruido, alfabetos poco representados y variaciones morfológicas, algo especialmente útil en lenguas con pocos datos digitales.

La información pública es escasa: la model card fue generada automáticamente por el `Trainer` de Transformers y no documenta el conjunto de datos, los idiomas ni los usos previstos. El autor declara una pérdida de validación de 1,9110 y un ChrF++ de 21,2432 en el conjunto de evaluación, métricas que apuntan a una tarea de generación de secuencias (probablemente traducción o normalización) más que a clasificación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5 v1.1 con tokenización byte-level, ByT5) |
| Parámetros totales | 1.228.183.552 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base ByT5-large soporta secuencias de entrada de hasta 1024 bytes en su configuración de referencia) |
| Tipos de cuantización | No disponible (pesos en safetensors; compatible con cuantización dinámica vía bitsandbytes, GGUF y otras herramientas, aunque no está documentado por el autor) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 78,6 GB, incluye presumiblemente checkpoints intermedios y estados del optimizador) |

## Arquitectura y entrenamiento

La arquitectura subyacente es ByT5-large, una variante de T5 v1.1 en la que el tokenizador SentencePiece se sustituye por una codificación directa de bytes UTF-8. Esto implica un vocabulario de 256 tokens (más los tokens especiales de T5) y un coste computacional mayor por secuencia, ya que cada carácter latino ocupa un byte y cada carácter no latino entre dos y cuatro bytes. El modelo mantiene el esquema encoder-decoder con atención completa y las capas densas habituales de T5-large (24 capas de encoder y 24 de decoder, `d_model` de 1024, 16 cabezas de atención), aunque estos detalles no se detallan en la model card.

El ajuste fino se realizó con el `Trainer` de Transformers 5.5.0 sobre PyTorch 2.12.1 y `datasets` 4.3.0, con los siguientes hiperparámetros: tasa de aprendizaje 5e-5, tamaño de lote efectivo 32 (batch de 4 con 8 pasos de acumulación de gradiente), optimizador AdamW con `fused=True` y betas (0,9; 0,999), scheduler lineal y 100 épocas. La semilla fue 1750. No se documenta el número de tokens de entrenamiento, la composición del corpus, ni si hubo etapas de RLHF, DPO o instrucción adicional. El nombre del repositorio sugiere un ajuste "per joint", posiblemente un entrenamiento conjunto sobre varias tareas o pares de lenguas, pero el autor no lo aclara.

## Capacidades

- Generación de texto condicionada a una entrada, en formato texto-a-texto estándar de T5 (encoder-decoder).
- Robustez frente a ruido ortográfico y variaciones de escritura gracias a la tokenización byte-level, que evita los problemas de vocabulario cerrado.
- Manejo potencial de alfabetos no latinos y lenguas de bajos recursos, dado el contexto del publicador (`lowresource-igt`) y el uso de ByT5.
- Aplicable a tareas de normalización textual, transliteración, corrección ortográfica y traducción automática, aunque el autor no las declara explícitamente.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- No se documentan capacidades multilingües específicas ni la lista de idiomas cubiertos.

## Casos de uso

- Normalización de texto ruidoso en lenguas de bajos recursos: el modelo puede recibir texto con errores ortográficos, variantes dialectales o mezcla de alfabetos y devolver una forma canónica, aprovechando la tokenización byte-level de ByT5 para no depender de un vocabulario que cubra esas variantes.
- Transliteración entre sistemas de escritura: útil para convertir nombres propios o topónimos entre alfabetos latino, cirílico, árabe o georgiano, un escenario habitual en proyectos de preservación lingüística.
- Traducción automática de variedades dialectales: el ajuste "per joint" podría corresponder a un modelo multi-par de traducción; encajaría en pipelines de traducción para lenguas con pocos pares paralelos, donde la robustez a nivel de byte compensa la falta de vocabulario específico.
- Corrección ortográfica y de diacríticos: en corpus históricos o textos OCR con ruido, el modelo puede aprender a restaurar grafías correctas sin necesidad de un léxico previo.
- Preprocesamiento en pipelines de NLP: como paso previo a un modelo mayor, normalizar y limpiar texto de entrada en un sistema de extracción de información o búsqueda.
- Investigación en lingüística computacional: servir como línea base reproducible para experimentos de normalización o traducción en lenguas de bajos recursos, dado que el autor publica los hiperparámetros y las curvas de entrenamiento.
- Generación de datos sintéticos o aumentación: usar el modelo para parafrasear o reescribir frases en una variedad lingüística concreta como paso de aumentación de datos.

## Benchmarks y rendimiento

El autor declara resultados en el conjunto de evaluación interno, no en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El `model-index` de la model card está vacío (`results: []`), por lo que no hay comparaciones públicas con otros modelos.

| Métrica (conjunto de evaluación del autor) | Valor |
|---|---|
| Loss | 1,9110 |
| ChrF++ | 21,2432 |
| Longitud media generada (Gen Len) | 129,3529 |

Evolución durante el entrenamiento (selección de hitos):

| Época | Step | Validation loss | ChrF++ | Gen Len |
|---|---|---|---|---|
| 1,9 | 38 | 2,4984 | 4,9326 | 190,4118 |
| 9,5 | 190 | 2,0165 | 11,9722 | 133,8824 |
| 15,2 | 304 | 1,5789 | 19,0646 | 116,2941 |
| 19,0 | 380 | 1,4897 | 19,8559 | 121,4706 |
| 24,7 | 494 | 1,5486 | 22,4988 | 132,3529 |
| 30,4 | 608 | 1,9110 | 21,2432 | 129,3529 |

El mínimo de pérdida de validación se alcanza en la época 19,0 (1,4897); a partir de ahí la pérdida repunta hasta 1,9110 en la época 30,4, lo que indica sobreajuste en las últimas épocas. El mejor ChrF++ se registra en la época 24,7 (22,4988). No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 4,9 GB solo para pesos (1,23 mil millones de parámetros × 4 bytes), más activaciones y caché de atención; en la práctica, entre 8 y 12 GB para secuencias largas.
- En fp16/bf16: unos 2,5 GB de pesos, con un consumo total estimado de 5-8 GB según longitud de secuencia y tamaño de lote.
- En cuantización de 8 bits: alrededor de 1,2 GB de pesos; en 4 bits, unos 0,7 GB, aunque la cuantización de modelos encoder-decoder T5 requiere herramientas específicas y no está documentada por el autor.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegues de producción con lotes grandes; RTX 4090, RTX 3090 o incluso RTX 4060 Ti 16 GB para inferencia en fp16 con lotes pequeños.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16 para secuencias moderadas; en 4 u 8 bits cabría en GPUs de 4-6 GB.
- Opciones de despliegue: `transformers` con `pipeline("text2text-generation")`, `text-generation-inference` (el tag `endpoints_compatible` lo indica), vLLM (soporte de encoder-decoder), TGI y, con conversión previa, llama.cpp u Ollama. El tamaño del repositorio (78,6 GB) sugiere que incluye checkpoints intermedios y estados del optimizador, no solo los pesos finales.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia arquitectónica, ByT5-large es más lento que T5-large por la longitud efectiva de las secuencias a nivel de byte.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokenización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `finetuned_byT5large_per_joint_latest` | 1,23 B | No disponible | Byte-level (256 tokens) | Apache 2.0 | Hugging Face, 115 descargas |
| `google/byt5-large` | 1,23 B | Hasta 1024 bytes (configuración de referencia) | Byte-level | Apache 2.0 | Hugging Face, ampliamente usado |
| `google/mt5-large` | 1,23 B | Hasta 1024 tokens | SentencePiece multilingüe (250k) | Apache 2.0 | Hugging Face |
| `google/t5-v1_1-large` | 0,77 B | Hasta 1024 tokens | SentencePiece (32k) | Apache 2.0 | Hugging Face |

La comparación con `google/mt5-large` es la más directa para tareas multilingües: mt5 cubre 101 idiomas con un vocabulario de 250 000 tokens, mientras que ByT5 evita el sesgo de vocabulario a costa de secuencias más largas. `t5-v1_1-large` es más pequeño y rápido, pero su vocabulario cerrado penaliza lenguas de bajos recursos. No hay datos de benchmarks públicos que permitan comparar el rendimiento de este ajuste concreto frente a estas alternativas.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el conjunto de datos, los idiomas, la tarea exacta ni los usos previstos; no se puede verificar para qué fue entrenado realmente.
- Riesgo de sobreajuste: la pérdida de validación alcanza su mínimo en la época 19 y sube hasta 1,9110 en la época 30; el checkpoint publicado podría no ser el mejor en términos de pérdida.
- El ChrF++ de 21,24 es bajo en términos absolutos para traducción automática, lo que sugiere un modelo de nicho o un conjunto de evaluación difícil; no debe interpretarse como calidad de producción.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no se pueden evaluar sesgos de género, geográficos o culturales.
- Riesgo de alucinación en generación libre: como todo modelo encoder-decoder ajustado con datos limitados, puede producir salidas plausibles pero incorrectas, especialmente fuera de la distribución de entrenamiento.
- Limitaciones de contexto: la tokenización byte-level multiplica la longitud efectiva de las secuencias; textos largos en alfabetos no latinos pueden superar el límite práctico del modelo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el origen de los datos de ajuste, lo que puede plantear dudas sobre la procedencia del corpus.
- El repositorio de 78,6 GB incluye artefactos de entrenamiento; descargar solo los pesos finales requiere filtrar archivos para evitar consumir ancho de banda y disco innecesarios.
- No hay soporte documentado de tool calling, agentes ni instrucciones, por lo que no es adecuado como modelo de chat o asistente general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowresource-igt/finetuned_byT5large_per_joint_latest
- Modelo base: https://huggingface.co/google/byt5-large
- Paper de ByT5 ("ByT5: Towards a Token-Free Future with Pre-trained Byte-to-Byte Models"): https://arxiv.org/abs/2105.13626
- Paper de T5 ("Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer"): https://arxiv.org/abs/1910.10683
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Documentación de T5 en Transformers: https://huggingface.co/docs/transformers/model_doc/t5

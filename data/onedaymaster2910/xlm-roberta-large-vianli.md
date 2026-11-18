# OneDayMaster2910/xlm-roberta-large-vianli

## Resumen

`xlm-roberta-large-vianli` es un modelo de clasificación para inferencia de lenguaje natural (NLI) en vietnamita, desarrollado por el usuario OneDayMaster2910. Se construye mediante ajuste fino completo (full fine-tuning) del backbone multilingüe `FacebookAI/xlm-roberta-large` sobre el conjunto de datos `uitnlp/ViANLI`, una adaptación al vietnamita de la tarea NLI con tres etiquetas: entailment, neutral y contradiction.

El modelo resuelve una tarea acotada de clasificación de pares de frases (premisa e hipótesis) y devuelve una de las tres etiquetas. Con 559.893.507 parámetros totales y un tamaño de repositorio de 2,3 GB, es un modelo grande para tratarse de una tarea de clasificación, lo que refleja que se parte de la arquitectura XLM-R large y no se reduce el backbone.

Su relevancia es limitada y debe interpretarse con cautela: los resultados publicados por el autor muestran una precisión del 45,80 % en el conjunto de test y un Macro F1 de 45,68 %, valores cercanos al azar en un problema de tres clases (33,3 %). Esto sugiere que el ajuste no ha convergido de forma satisfactoria (el train loss baja mientras la validation loss sube a partir de la época 4), por lo que no es un modelo recomendable para producción sin una reevaluación y un reentrenamiento previos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) con cabeza de clasificación de secuencias |
| Parametros totales | 559.893.507 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser safetensors se puede cuantizar con herramientas externas) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-large`, un transformer encoder de tipo RoBERTa multilingüe, y se le añade una cabeza de clasificación para tres clases (`entailment`, `neutral`, `contradiction`). El ajuste es de parámetros completos: según la model card, se actualizan todos los pesos del backbone y de la cabeza, sin LoRA, PEFT ni congelación de capas.

El entrenamiento se realizó sobre el split `train` de `uitnlp/ViANLI` con 8.012 muestras durante 8 épocas, con learning rate 2e-05, optimizador `adamw_torch`, longitud máxima de 256 tokens y semilla 42. La selección del checkpoint se hizo por Macro F1 en validación (1.000 muestras), y la evaluación final sobre 1.000 muestras de test. La evolución del entrenamiento muestra sobreajuste claro: el train loss cae de 8,4971 a 1,6947 mientras la validation loss sube de 2,087 a 4,0314 entre la época 1 y la 8. No se documentan técnicas adicionales como decodificación especulativa, atención lineal ni fases de RLHF/DPO.

## Capacidades

- Clasificación de pares de frases en vietnamita en tres categorías: entailment, neutral y contradiction.
- Inferencia de relación lógica entre premisa e hipótesis (tarea NLI).
- Entrada de texto plano con par de secuencias (premisa + hipótesis), truncado a 256 tokens.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión, audio ni generación de texto libre.
- Capacidad multilingüe limitada en la práctica: aunque el backbone es multilingüe, el ajuste se ha realizado solo con datos en vietnamita y la model card declara únicamente `vi`.

## Casos de uso

- Detección de contradicciones en documentación en vietnamita: comparar pares de frases extraídas de manuales o contratos para señalar afirmaciones incompatibles, siempre que se valide antes la calidad del modelo en el dominio concreto.
- Verificación de respuestas en sistemas de QA extractivo: usar el modelo como filtro para comprobar si una respuesta candidata se deduce de un pasaje fuente, con umbrales de confianza conservadores.
- Enriquecimiento de datasets de NLI: generar etiquetas preliminares sobre corpus en vietnamita para revisión humana posterior, dado el bajo rendimiento observado.
- Filtrado de pares en pipelines de datos: descartar pares de frases claramente contradictorios o redundantes antes de un proceso de anotación.
- Investigación y reproducción académica: servir como punto de partida para estudiar el efecto del full fine-tuning de XLM-R large en NLI vietnamita y comparar con variantes con LoRA o con modelos especializados.
- Evaluación comparativa de checkpoints: usar la configuración y los resultados publicados como referencia para medir mejoras de estrategias de entrenamiento alternativas en ViANLI.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de test de ViANLI:

| Metrica | Valor |
|---|---|
| Accuracy (test) | 45,80 % |
| Macro F1 (test) | 45,68 % |
| Macro Precision (test) | 46,46 % |
| Macro Recall (test) | 45,80 % |
| Mejor Macro F1 en validación | 46,80 % |

Evolución por época (extracto):

| Epoca | Train loss | Validation loss | Validation accuracy | Validation Macro F1 |
|---|---|---|---|---|
| 1 | 8,4971 | 2,0870 | 42,40 % | 33,88 % |
| 4 | 4,9197 | 2,2055 | 46,60 % | 46,79 % |
| 6 | 2,1679 | 3,2529 | 46,70 % | 46,80 % |
| 8 | 1,6947 | 4,0314 | 45,60 % | 45,58 % |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,2-2,5 GB solo para pesos, más overhead de activaciones y tokenizador; con batch pequeño cabe en GPUs de 4-6 GB.
- En fp16/bf16: aproximadamente 1,1-1,3 GB de pesos, por lo que cabe en GPUs consumer como RTX 3050, RTX 3060, RTX 4060 o superiores.
- GPU recomendadas para throughput alto: A100, H100 o L40S con lotes grandes; para uso individual, RTX 4090 o RTX 3090 son suficientes.
- Despliegue: compatible con Hugging Face Transformers (`pipeline` y `AutoModelForSequenceClassification`), y exportable a ONNX o TensorRT para inferencia optimizada. No se documenta soporte específico de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| OneDayMaster2910/xlm-roberta-large-vianli | 559,9 M | 256 | NLI vietnamita (3 clases) | Apache 2.0 | Macro F1 45,68 % (test ViANLI) |
| FacebookAI/xlm-roberta-large (base) | 559,9 M | 512 | Modelo base multilingüe | MIT | No aplica (no ajustado a NLI) |
| Modelos NLI vietnamitas especializados | no disponible | no disponible | NLI vietnamita | no disponible | no disponible |

La comparación con alternativas ajustadas específicamente a ViANLI no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo: Macro F1 de 45,68 % en test frente a un 33,3 % esperado por azar en tres clases; no es adecuado para producción sin reentrenamiento.
- Sobreajuste evidente: la validation loss aumenta desde la época 4 mientras el train loss sigue bajando.
- Sesgos conocidos: no documentados por el autor; al entrenarse solo con ViANLI, hereda los sesgos y la distribución de ese corpus.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí existe riesgo de predicciones erróneas con alta confianza.
- Limitación de contexto: secuencias truncadas a 256 tokens, lo que puede perder información en premisas o hipótesis largas.
- Limitación de idioma: ajustado únicamente a vietnamita; su uso en otros idiomas no está validado.
- Licencia Apache 2.0 permite uso comercial, pero la calidad actual del modelo desaconseja ese uso sin una evaluación propia.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- Los datos de ViANLI y XNLI pertenecen a sus autores originales; conviene revisar sus términos antes de redistribuir derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneDayMaster2910/xlm-roberta-large-vianli
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Dataset ViANLI: https://huggingface.co/datasets/uitnlp/ViANLI
- Dataset XNLI: https://huggingface.co/datasets/facebook/xnli

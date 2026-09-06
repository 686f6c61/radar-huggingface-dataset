# Primeinvincible/ragtruth-s4-deberta-hallucination-detector

## Resumen

El modelo `Primeinvincible/ragtruth-s4-deberta-hallucination-detector` es un clasificador binario de 184 millones de parámetros diseñado para detectar alucinaciones en respuestas generadas por sistemas de recuperación aumentada (RAG). Fue desarrollado por Primeinvincible como parte de una tesis de máster en BHT Berlin, dentro de un sistema híbrido de verificación externa. El modelo parte de `cross-encoder/nli-deberta-v3-base` y se ajusta finamente sobre el dataset `wandb/RAGTruth-processed`.

Su función es evaluar si una respuesta generada contiene afirmaciones no respaldadas o contradictorias respecto a un contexto dado. La entrada se compone de la respuesta y el contexto separados por un token `[SEP]`, con una longitud máxima de 512 tokens. La salida es una probabilidad de que la respuesta sea alucinada, sin necesidad de inversión de la etiqueta.

La relevancia actual radica en que los sistemas RAG son cada vez más comunes en producción, y la verificación post-generación es un paso crítico para garantizar la fidelidad de las respuestas. Este modelo ofrece una señal supervisada fuerte y bien calibrada dentro de su dominio, con un ECE de 0.129 en el conjunto de test de RAGTruth, y puede combinarse con otras señales o modelos para mejorar la robustez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base como cross-encoder con cabeza de clasificación binaria |
| Parametros totales | 184.423.682 (184M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length en la tokenización) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura DeBERTa-v3-base, un transformer encoder preentrenado, sobre el que se añade una cabeza de clasificación con dos clases (no alucinado / alucinado). Al ser un cross-encoder, procesa el par `respuesta [SEP] contexto` de forma conjunta, lo que permite modelar la relación semántica entre ambos. La tokenización aplica `truncation=True` y `max_length=512`.

El entrenamiento se realizó sobre el split de entrenamiento completo de `wandb/RAGTruth-processed`, compuesto por 15.090 ejemplos. Se reservó un 10% estratificado para validación. La función de pérdida fue una entropía cruzada ponderada, con pesos de clase derivados de la distribución del conjunto de entrenamiento. Se usó el optimizador AdamW con una tasa de aprendizaje de 2e-5, tamaño de lote de 16 y un máximo de 5 épocas con parada temprana basada en el F1 de validación. El mejor checkpoint corresponde a la época 3, con un F1 de validación de 0.759 y un AUROC de 0.864. El entrenamiento se ejecutó en una única Tesla V100S-PCIE-32GB.

## Capacidades

- Detección de alucinaciones en respuestas generadas por sistemas RAG, evaluando el soporte de las afirmaciones respecto a un contexto proporcionado.
- Clasificación de pares `(respuesta, contexto)` mediante cross-encoding, lo que captura dependencias semánticas finas entre ambos textos.
- Salida calibrada dentro del dominio de RAGTruth, con un ECE de 0.129 en el conjunto de test, lo que la hace útil como señal de confianza.
- Compatibilidad con el ecosistema de Hugging Face Transformers, pudiendo cargarse directamente con `AutoModelForSequenceClassification`.
- No es un modelo generativo: no produce texto, no soporta tool calling, ni razonamiento multi-paso, ni capacidades de visión o audio.
- Soporte limitado a inglés; no hay capacidades multilingües documentadas.
- Puede combinarse con otras señales (como relevancia S2 o MiniCheck-7B) en sistemas de fusión o cascada para mejorar la precisión global.

## Casos de uso

- Filtro de respuestas en sistemas RAG de producción: integrar el modelo como paso de verificación posterior a la generación. Dado un contexto recuperado y la respuesta del LLM, el modelo devuelve la probabilidad de alucinación; si supera el umbral de 0.55 (revalidado para el dominio), la respuesta se descarta o se regenera.
- Reproducción de resultados de investigación: útil para replicar los experimentos de la tesis sobre el benchmark RAGTruth, ya que se publican métricas detalladas de test (F1, AUROC, AUPRC, ECE).
- Componente en pipelines de verificación híbrida: combinar esta señal supervisada con señales de relevancia (S2) y/o con MiniCheck-7B mediante fusión por regresión logística. Según los datos de la tesis, la fusión con metadata alcanza un F1 de 0.7262 y un ECE de 0.0583.
- Adaptación a dominios específicos con fine-tuning: partir de este modelo como base para entrenar con datos de un dominio concreto. Los resultados de la tesis muestran que con 2.240 ejemplos de HaluBench se alcanza un AUROC medio de 0.9616, aunque con alta varianza entre fuentes.
- Auditoría de faithfulness en resúmenes automáticos: clasificar si un resumen generado contiene afirmaciones no respaldadas por el documento fuente, usando el par `resumen [SEP] documento` como entrada.
- Investigación en calibración de detectores de alucinación: dado su ECE razonable in-domain, sirve como caso de estudio para analizar técnicas de recalibración y el efecto de cambios de etiquetado entre datasets (como el observed annotation shift en RAGTruth++).

## Benchmarks y rendimiento

Los resultados publicados corresponden al conjunto de test de RAGTruth (n=2.700), con un umbral de operación de 0.55 seleccionado mediante validación out-of-fold y aplicado sin cambios al test.

| Metric | Valor |
|---|---|
| F1 | 0.7024 |
| Precision | 0.6607 |
| Recall | 0.7497 |
| AUROC | 0.8470 |
| AUPRC | 0.7724 |
| ECE | 0.1289 |

Para contexto dentro del sistema de la tesis, se comparan los siguientes resultados sobre el mismo test:

| Modelo / señal | F1 | AUROC | AUPRC | ECE |
|---|---|---|---|---|
| S4 (este modelo) | 0.7024 | 0.8470 | 0.7724 | 0.1289 |
| MiniCheck-7B | 0.7260 | 0.8754 | 0.8055 | 0.2696 |
| Fusión S2+S4 (sin metadata) | 0.7065 | 0.8494 | 0.7664 | 0.0547 |
| Fusión S2+S4+metadata | 0.7262 | 0.8749 | 0.7959 | 0.0583 |

No se han encontrado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 184M parámetros. En precisión FP32, los pesos ocupan aproximadamente 0.7 GB, por lo que la inferencia puede ejecutarse con menos de 2 GB de VRAM. En FP16, el peso se reduce a unos 0.37 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, RTX 3060, RTX 2080, Tesla T4). Para entrenamiento se utilizó una Tesla V100S-PCIE-32GB, pero no es necesaria para inferencia.
- También es viable la ejecución en CPU para cargas pequeñas o inferencia por lotes, dado el tamaño reducido del modelo.
- Opciones de despliegue: compatible con Hugging Face Transformers para inferencia local. Según las etiquetas del repositorio, el modelo es compatible con `text-embeddings-inference` y `endpoints_compatible`, lo que permite servirlo mediante Hugging Face Inference Endpoints.
- Latencia y throughput: no se proporcionan datos medidos en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 (RAGTruth test) | AUROC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| S4 (este modelo) | 184M | 512 tokens | 0.7024 | 0.8470 | Apache 2.0 | Hugging Face |
| MiniCheck-7B | No disponible | No disponible | 0.7260 | 0.8754 | No disponible | No disponible |
| cross-encoder/nli-deberta-v3-base | 184M | 512 tokens | No aplica (no entrenado para detección) | No aplica | No disponible | Hugging Face |

MiniCheck-7B obtiene un F1 y AUROC ligeramente superiores, pero presenta un ECE mucho peor (0.2696 frente a 0.1289), lo que indica una peor calibración. El modelo base NLI no está entrenado para esta tarea y se incluye como referencia del punto de partida.

## Limitaciones y advertencias

- Sesgos: el modelo hereda sesgos del dataset RAGTruth y del preentrenamiento de DeBERTa. No se documentan sesgos específicos, pero deben considerarse al aplicar el modelo en dominios distintos.
- Riesgo de alucinación: el modelo no está exento de errores. Su F1 en RAGTruth es de 0.7024, con una precisión de 0.6607 y un recall de 0.7497, lo que implica un número no despreciable de falsos positivos y falsos negativos.
- Limitaciones de contexto: la ventana de 512 tokens con truncación puede perder información relevante si la respuesta o el contexto son más largos, afectando a la capacidad de evaluación.
- Limitaciones de idioma: el modelo solo soporta inglés. Su uso en otros idiomas requeriría adaptación o reentrenamiento.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el autor indica explícitamente que el modelo no debe utilizarse para decisiones médicas, legales o financieras.
- Transferencia débil entre benchmarks: en el conjunto HaluBench, el rendimiento zero-shot es bajo (AUROC 0.5272). Se necesita validación o adaptación en el dominio objetivo.
- Calibración fuera de dominio: el ECE de 0.129 es razonable in-domain, pero degrada fuera de RAGTruth. El umbral de 0.55 no debe transferirse a otros dominios sin revalidación.
- Annotation shift: en el subconjunto RAGTruth++ de 408 ejemplos, 240 cambian de etiqueta y la tasa de positivos sube de 15.93% a 74.75%. En el punto de operación original, el F1 cae a 0.4268, lo que evidencia la sensibilidad del modelo a cambios en la definición de las etiquetas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Primeinvincible/ragtruth-s4-deberta-hallucination-detector
- Dataset de entrenamiento: https://huggingface.co/datasets/wandb/RAGTruth-processed
- Modelo base: https://huggingface.co/cross-encoder/nli-deberta-v3-base

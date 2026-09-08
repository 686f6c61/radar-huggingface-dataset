# Hooshaai/svd-linear-attention-roberta-adaptive-sparse-attention-attention

## Resumen

El modelo `Hooshaai/svd-linear-attention-roberta-adaptive-sparse-attention-attention` es un experimento de compresión de transformadores desarrollado por Hooshaai dentro del marco de trabajo "SVD Linear Attention Framework". Se trata de un modelo de clasificación de texto basado en RoBERTa, al que se le ha sustituido la atención cuadrática estándar (o las capas de proyección densas) por aproximaciones lineales de bajo rango, calibradas mediante descomposición en valores singulares (SVD) y recuperadas con 50 pasos de ajuste fino LoRA.

El problema que aborda es la reducción del coste computacional y de memoria de los transformadores, manteniendo un rendimiento competitivo en tareas de clasificación. El modelo se evalúa en el subconjunto SST-2 del benchmark GLUE, obteniendo una precisión de validación del 83,83 % y un F1 de 0,8589. Su relevancia radica en que demuestra una vía para comprimir modelos preentrenados mediante atención lineal adaptativa, con un pico de VRAM de 420,6 MB durante la evaluación, lo que lo hace viable en entornos con recursos limitados.

No se especifican en la información disponible ni el número total de parámetros ni la longitud de contexto del modelo, por lo que estos datos no se pueden confirmar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa con atención lineal SVD y módulo `adaptive_sparse_attention_attention` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (la model card menciona `weights.pt`) |

## Arquitectura y entrenamiento

La arquitectura del modelo es una variante de RoBERTa en la que el mecanismo de atención estándar (o las capas de proyección densas) se reemplaza por un módulo de compresión denominado `adaptive_sparse_attention_attention`. Este módulo utiliza aproximaciones lineales de bajo rango, calibradas mediante SVD, y se recupera con 50 pasos de ajuste fino LoRA. La idea es reducir la complejidad cuadrática de la atención y el número de parámetros, preservando una parte significativa de la energía singular de las matrices originales.

El entrenamiento se centra en la tarea de clasificación de texto sobre el conjunto SST-2 de GLUE. No se proporcionan detalles sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas de ajuste por preferencias como RLHF o DPO. La innovación principal es la combinación de SVD para la selección automática de rangos bajos y LoRA para la recuperación de precisión, lo que permite una compresión con una ratio de 0,7767 según los datos de la model card.

## Capacidades

- Clasificación de texto en inglés, validada en SST-2 con una precisión del 83,83 % y un F1 de 0,8589.
- Compresión de pesos mediante SVD y recuperación con LoRA, lo que reduce la huella de memoria del modelo.
- Inferencia eficiente en memoria, con un pico de VRAM de 420,6 MB durante la evaluación.
- Integración con la librería `transformers` mediante `AutoModelForSequenceClassification`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Soporte limitado a un único idioma (inglés), sin evidencia de capacidades multilingües.

## Casos de uso

- Análisis de sentimiento en inglés: el modelo puede clasificar reseñas de productos o comentarios de usuarios en positivos o negativos. Su bajo consumo de VRAM permite ejecutarlo en servidores pequeños o en el borde.
- Clasificación de documentos corporativos: sirve para etiquetar contratos, informes o correos electrónicos en categorías predefinidas. La compresión SVD reduce el coste de almacenamiento y despliegue.
- Filtrado de spam: puede utilizarse en sistemas de correo para detectar mensajes no deseados. La precisión de 83,83 % en SST-2 sugiere un comportamiento razonable en tareas de clasificación binaria.
- Moderación de contenido: apto para clasificar publicaciones o comentarios como apropiados o inapropiados en plataformas con recursos limitados.
- Etiquetado de tickets de soporte: permite asignar automáticamente categorías a incidencias de atención al cliente, reduciendo el trabajo manual.
- Clasificación de intenciones en chatbots: puede identificar la intención del usuario (por ejemplo, consulta, queja, solicitud) en conversaciones cortas, gracias a su naturaleza de clasificación de texto.

## Benchmarks y rendimiento

Los datos de rendimiento disponibles corresponden exclusivamente a la evaluación en SST-2, tal y como se indica en la model card. No se han publicado comparativas con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| Tarea | SST-2 (GLUE) |
| Precisión de validación | 83,83 % |
| F1 score | 0,8589 |
| Ratio de compresión | 0,7767 |
| Pico de VRAM | 420,6 MB |
| Tiempo de evaluación puro | 29,54 s |

## Requisitos de hardware

- VRAM estimada: el pico medido durante la evaluación fue de 420,6 MB, lo que indica que el modelo puede ejecutarse en GPUs consumer de gama baja o incluso en CPU con suficiente memoria RAM.
- GPU recomendadas: no se proporcionan recomendaciones específicas en la información disponible. Dado el bajo consumo, una GPU como una RTX 3060 o inferior sería suficiente.
- Despliegue en consumer GPU: sí, es viable en GPUs de consumo gracias a su reducido uso de VRAM.
- Opciones de despliegue: el modelo se carga mediante `AutoModelForSequenceClassification` de la librería `transformers`. No se mencionan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se proporcionan datos de latencia por token. El tiempo de evaluación puro en SST-2 fue de 29,54 s, pero no se especifica el hardware ni el tamaño del lote.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la información disponible. Como referencia, el modelo se basa en RoBERTa, pero no se dispone de métricas del modelo original en las mismas condiciones. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al estar basado en RoBERTa y entrenado en SST-2, puede heredar los sesgos presentes en los datos de ese conjunto.
- Riesgo de alucinación: al ser un modelo de clasificación, el riesgo de alucinación es menor que en generación de texto, pero pueden producirse errores de clasificación, especialmente en textos ambiguos o fuera de distribución.
- Limitaciones de idioma: el modelo solo soporta inglés, por lo que no es adecuado para tareas en otros idiomas.
- Limitaciones de contexto: la longitud de contexto no se especifica, por lo que no se puede garantizar un buen rendimiento en textos muy largos.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las condiciones de la licencia.
- Advertencia importante: el tamaño del repositorio en HuggingFace se muestra como 0.0 GB, lo que puede indicar que los pesos no están disponibles o que se almacenan mediante Git LFS sin contenido visible. Se recomienda verificar la integridad del repositorio antes de usar el modelo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Hooshaai/svd-linear-attention-roberta-adaptive-sparse-attention-attention
- Substack de Hoosha AI (artículos sobre compresión de transformadores): https://hooshaai.substack.com/
- Documentación de RoBERTa en HuggingFace: https://huggingface.co/docs/transformers/model_doc/roberta

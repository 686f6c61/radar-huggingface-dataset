# orpe42/MP_political_MIL_classifier

## Resumen

MP_political_MIL_classifier es un modelo de clasificación de texto desarrollado por el usuario orpe42, especializado en la clasificación de textos políticos mediante un enfoque de aprendizaje por instancias múltiples (MIL, Multiple Instance Learning). Está construido sobre la arquitectura DeBERTa, concretamente la variante DeBERTa-v3, con un total de 434 millones de parámetros. El modelo fue entrenado desde cero sobre un dataset no especificado, con hiperparámetros que incluyen una tasa de aprendizaje de 1e-5, 30 épocas y un tamaño de lote efectivo de 8.

La relevancia de este modelo radica en su aplicación al análisis de discurso político, un dominio donde la clasificación de documentos largos o conjuntos de textos relacionados (como discursos, artículos o debates) puede beneficiarse del paradigma MIL, que agrupa instancias en bolsas para realizar predicciones a nivel de bolsa. Sin embargo, la información pública disponible es muy limitada: no se han publicado resultados de benchmarks, detalles del dataset de entrenamiento ni una licencia explícita, lo que dificulta su evaluación rigurosa y su adopción en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (deberta_attention_mil) |
| Parametros totales | 434.332.217 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeBERTa-v3, que incorpora atención desenredada (disentangled attention) y un mecanismo de decodificación mejorado. La etiqueta `deberta_attention_mil` sugiere que se ha adaptado la arquitectura para soportar un esquema de aprendizaje por instancias múltiples, donde las secuencias de entrada se tratan como bolsas de instancias y la clasificación se realiza a nivel de bolsa. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste fino como RLHF o DPO. Los hiperparámetros de entrenamiento indican un proceso de entrenamiento desde cero (no fine-tuning) con optimizador AdamW, scheduler de tasa de aprendizaje coseno con warmup y 30 épocas, lo que sugiere un entrenamiento relativamente extenso.

## Capacidades

- Clasificación de textos políticos: el modelo está diseñado para asignar una etiqueta (probablemente binaria o multiclase) a documentos o conjuntos de documentos relacionados con política, aunque no se especifican las categorías concretas.
- Procesamiento de texto largo mediante MIL: al utilizar Multiple Instance Learning, puede manejar documentos extensos divididos en instancias (p. ej., párrafos) y agregar las predicciones a nivel de documento.
- Soporte de transformers estándar: compatible con la librería `transformers` de Hugging Face, lo que permite su uso con pipelines y para fine-tuning posterior.
- No se han documentado capacidades de generación de texto, tool calling, agentes, visión o audio. El modelo es exclusivamente un clasificador de secuencias.

## Casos de uso

- Análisis de discursos parlamentarios: el modelo puede clasificar discursos de políticos según su orientación ideológica o partidista, agrupando párrafos como instancias para una predicción global del discurso.
- Moderación de contenido político en redes sociales: dado un hilo de comentarios o publicaciones, el modelo puede determinar si el contenido es político y, en su caso, clasificarlo en categorías (p. ej., izquierda/derecha, populismo, etc.).
- Investigación académica en ciencia política: los investigadores pueden utilizar el modelo para etiquetar automáticamente grandes corpus de textos legislativos o mediáticos, facilitando análisis cuantitativos.
- Monitorización de campañas electorales: clasificación de noticias, tweets o programas electorales para evaluar la cobertura mediática o la posición de los candidatos.
- Clasificación de artículos de prensa por sesgo político: el modelo puede ayudar a identificar la tendencia política de un medio o de un artículo concreto, útil para estudios de sesgo mediático.
- Sistemas de recomendación de contenido político: plataformas de noticias pueden usar el modelo para sugerir artículos según la afinidad política del usuario, aunque se debe tener en cuenta el riesgo de sesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card está vacío, y no se proporcionan métricas de evaluación (precisión, F1, etc.) en ningún otro lugar. Por tanto, no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo tiene 434M parámetros y los pesos se publican en FP32 (4 bytes por parámetro), el tamaño en memoria es de aproximadamente 1,74 GB solo para los pesos. Con las activaciones y el overhead de la atención, se recomienda al menos 4 GB de VRAM para inferencia en lotes pequeños.
- GPU recomendadas: una GPU con 8 GB de VRAM (por ejemplo, RTX 3070/4060) puede ejecutar el modelo sin problemas. Para entrenamiento o fine-tuning, se necesitarían GPUs con 16 GB o más (RTX 4090, A100).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo medio-alto. No se requieren GPUs de datacenter para inferencia.
- Opciones de despliegue: al ser un modelo de transformers estándar, se puede desplegar con vLLM, TGI, Hugging Face Inference Endpoints, o mediante la librería `transformers` en Python. No se han publicado versiones GGUF o cuantizadas, por lo que su uso en CPU con llama.cpp requeriría una conversión manual.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo DeBERTa-v3 de 434M parámetros en una GPU moderna (RTX 4090) puede procesar alrededor de 100-200 secuencias de 512 tokens por segundo en inferencia, pero esto depende de la implementación y del hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificación política con MIL). El autor ha publicado otros modelos relacionados en Hugging Face (como `orpe42/deberta_v3_MP_ft` y `orpe42/deberta_MP_dynamic`), pero no hay detalles públicos sobre sus diferencias o rendimiento. Sin benchmarks y sin especificación de tarea concreta, no es posible establecer una comparativa fiable.

## Limitaciones y advertencias

- Ausencia de documentación: la model card no proporciona información sobre el dataset de entrenamiento, el proceso de etiquetado, ni las categorías de clasificación. Esto impide evaluar la validez y generalización del modelo.
- Sin licencia explícita: al no especificarse una licencia, el uso comercial del modelo está legalmente en entredicho. Se recomienda contactar con el autor antes de cualquier uso en producción.
- Riesgo de sesgo político: al tratarse de un clasificador entrenado sobre datos políticos, es muy probable que herede sesgos ideológicos, geográficos o temporales del dataset. No se han documentado medidas de mitigación.
- Posible sobreajuste: el entrenamiento con 30 épocas sobre un dataset desconocido, con un tamaño de lote pequeño, podría provocar sobreajuste y baja capacidad de generalización.
- Sin cuantizaciones disponibles: los pesos se publican en FP32, lo que aumenta los requisitos de memoria y reduce la eficiencia en comparación con versiones cuantizadas (INT8, FP16, GGUF).
- Limitaciones de idioma: no se especifican los idiomas soportados. Dado el tag `region:us`, es probable que esté entrenado principalmente en inglés, pero no es seguro.
- Alucinaciones y errores de clasificación: como cualquier modelo de lenguaje, puede producir clasificaciones incorrectas, especialmente en textos ambiguos o fuera del dominio de entrenamiento. Se debe verificar su salida en aplicaciones críticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orpe42/MP_political_MIL_classifier
- Modelo relacionado del mismo autor (sin documentación): https://huggingface.co/orpe42/deberta_v3_MP_ft
- Modelo relacionado del mismo autor (sin documentación): https://huggingface.co/orpe42/deberta_MP_dynamic

No se han encontrado papers, blogs o repositorios adicionales que documenten este modelo.

# Fazmaj/modernbert-flow-anomaly-classifier

## Resumen

modernbert-flow-anomaly-classifier es un modelo de clasificación de texto (text-classification) publicado por el usuario Fazmaj en HuggingFace. Se trata de un fine-tune del encoder bidireccional answerdotai/ModernBERT-base, un transformer solo-encoder de 149.607.940 parámetros (aproximadamente 149M, coherente con el tamaño "base" de la familia ModernBERT). El nombre del repositorio sugiere un uso orientado a la detección de anomalías en flujos de datos (flow anomaly detection), aunque la model card del autor no documenta explícitamente la tarea, el dataset ni el dominio de aplicación.

El modelo se distribuye bajo licencia Apache 2.0, en formato safetensors, con un tamaño de repositorio de 0,6 GB, y es compatible con la librería transformers (entrenado con Transformers 5.0.0 y PyTorch 2.10.0). Al derivar de ModernBERT-base, hereda la arquitectura moderna de encoder: atención con RoPE, capas alternas de atención global y local, y una ventana de contexto nominal de 8192 tokens según la documentación del modelo base.

Su relevancia actual es limitada y debe evaluarse con cautela: los resultados declarados por el propio autor en el conjunto de evaluación son modestos (accuracy 0,5883 y F1 0,2950), lo que sugiere que el fine-tune no está maduro para producción sin un reentrenamiento o una validación adicional. Resulta útil, eso sí, como punto de partida reproducible para experimentos de clasificación de anomalías con encoders ModernBERT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer solo-encoder bidireccional (ModernBERT) |
| Parametros totales | 149.607.940 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (heredada de ModernBERT-base; no confirmada de forma explícita en la model card del fine-tune) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de answerdotai/ModernBERT-base, un encoder de 149M de parámetros que moderniza la arquitectura BERT original incorporando rotary positional embeddings (RoPE), atención alternada local/global, capas sin sesgos y kernels optimizados para secuencias largas. La documentación del modelo base (paper arXiv:2412.13663) lo presenta como una mejora de Pareto frente a BERT para tareas de recuperación y clasificación, con soporte de secuencias de hasta 8192 tokens.

El fine-tune se realizó con el Trainer de HuggingFace sobre un dataset no identificado en la model card ("None dataset"). Los hiperparámetros declarados son: learning rate 3e-05, scheduler lineal, 3 épocas, train_batch_size 32, eval_batch_size 64, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-08) y precisión mixta nativa (Native AMP). No se documenta composición del dataset, número de tokens de entrenamiento, ni si hubo RLHF/DPO (poco habitual en un encoder de clasificación). Tampoco se especifica el número de clases de la cabeza de clasificación ni su etiquetado.

## Capacidades

- Clasificación de texto: el pipeline declarado es text-classification, con una cabeza de clasificación ajustada sobre el encoder ModernBERT-base.
- Procesamiento de secuencias largas: al heredar ModernBERT-base, puede aceptar entradas de hasta 8192 tokens, útil para documentos extensos o ventanas amplias de flujo.
- Inferencia por lotes: el entrenamiento usó eval_batch_size 64, lo que indica que el modelo está pensado para inferencia por lotes.
- Compatibilidad con Text Embeddings Inference: el tag text-embeddings-inference y endpoints_compatible sugiere despliegue en servidores de inferencia gestionados.
- Capacidades multilingües: no disponibles ni documentadas.
- Tool calling / function calling: no disponible (no es una capacidad esperable en un encoder de clasificación).
- Soporte de agentes y razonamiento multi-paso: no aplica a este tipo de modelo.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Detección de anomalías en flujos de red o de datos: dado el nombre del repositorio, el caso natural es clasificar registros de flujo (logs, eventos, tráfico) como normales o anómalos; requiere validar antes la calidad del modelo, ya que el F1 declarado es de solo 0,2950.
- Filtrado previo en pipelines de seguridad: usar el clasificador como primera etapa de triaje para descartar eventos benignos y reducir el volumen que llega a un sistema de análisis más costoso.
- Clasificación de documentos extensos: gracias a la ventana de 8192 tokens heredada de ModernBERT-base, puede procesar informes, contratos o incidencias largas sin truncar, siempre que la cabeza de clasificación esté alineada con las etiquetas objetivo.
- Etiquetado automático para anotación asistida: emplear las predicciones como preetiquetado en herramientas de anotación humana, aprovechando la velocidad de un encoder de 149M frente a modelos generativos.
- Base para experimentos de investigación en clasificación con encoders modernos: sirve como punto de partida reproducible (semilla 42, hiperparámetros documentados) para comparar fine-tunes sobre ModernBERT.
- Clasificación de bajo coste en CPU o GPU de gama baja: con 149M de parámetros, el modelo puede ejecutarse en entornos sin aceleradores dedicados, adecuado para servicios internos con presupuesto limitado.
- Moderación o filtrado de contenido en tiempo real: si se reentrena con datos propios y se valida el rendimiento, un encoder de este tamaño ofrece latencias bajas por lote en comparación con modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` del modelo declara una lista de resultados vacía (`results: []`). Los únicos datos numéricos proceden del conjunto de evaluación interno declarado por el autor:

| Metrica | Valor (epoca 3, evaluacion final) |
|---|---|
| Loss (validacion) | 0,9723 |
| Accuracy | 0,5883 |
| F1 | 0,2950 |
| Precision | 0,2941 |
| Recall | 0,3214 |

Evolución durante el entrenamiento declarada por el autor:

| Epoca | Paso | Loss validacion | Accuracy | F1 | Precision | Recall |
|---|---|---|---|---|---|---|
| 1.0 | 75 | 0,9961 | 0,6017 | 0,2797 | 0,3347 | 0,3134 |
| 2.0 | 150 | 0,9913 | 0,5617 | 0,4074 | 0,5172 | 0,4437 |
| 3.0 | 225 | 0,9723 | 0,5883 | 0,2950 | 0,2941 | 0,3214 |

No se dispone de comparaciones con MMLU, HumanEval, GSM8K ni con otros clasificadores de anomalías, ya que estos benchmarks no aplican ni han sido publicados para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en FP32 (tamaño del repo en safetensors), ~0,3 GB en FP16/BF16 y ~0,15 GB en INT8. Con activaciones y lotes, se recomienda reservar 1-2 GB.
- GPU recomendadas: cualquier GPU moderna sirve; una NVIDIA T4, RTX 3060, RTX 4090 o A100 son más que suficientes. El modelo no requiere GPUs de gran memoria.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU con 2 GB o más de VRAM, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: pipeline de transformers, Text Embeddings Inference (tag declarado en el repo), endpoints compatibles, y exportación a ONNX/OpenVINO a través de HuggingFace Optimum. Soporte en vLLM, llama.cpp u Ollama no está confirmado para este modelo.
- Latencia y throughput estimados: no disponibles. El eval_batch_size de 64 durante el entrenamiento indica que la inferencia por lotes es viable, pero no se han publicado cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| modernbert-flow-anomaly-classifier | 149,6M | 8192 (heredado del base) | Clasificacion de texto (fine-tune) | apache-2.0 | HuggingFace |
| answerdotai/ModernBERT-base | 149M (aprox.) | 8192 | Encoder base (preentrenado) | apache-2.0 | HuggingFace, GitHub |
| BERT-base (referencia historica) | 110M | 512 | Encoder base | apache-2.0 | HuggingFace |
| DeBERTa-v3-base | 184M (aprox.) | 512 | Encoder base | MIT | HuggingFace |

No hay datos de rendimiento comparables publicados para este fine-tune, por lo que la comparación se limita a especificaciones arquitectónicas y de licencia.

## Limitaciones y advertencias

- Rendimiento bajo declarado por el propio autor: accuracy de 0,5883 y F1 de 0,2950 en evaluación, valores que en la práctica equivalen a un clasificador poco fiable y muy por debajo de lo aceptable en producción, especialmente si las clases están desbalanceadas.
- Inestabilidad entre épocas: el F1 oscila entre 0,2797 (época 1) y 0,4074 (época 2) y cae a 0,2950 en la época 3, lo que sugiere un entrenamiento inestable o un conjunto de validación pequeño (solo 225 pasos en total).
- Dataset de entrenamiento no documentado: la model card indica "None dataset" y deja sin responder las secciones de descripción, usos previstos y datos de entrenamiento, lo que impide evaluar sesgos, cobertura o dominio.
- Sesgos conocidos: no disponibles. Al no documentarse el corpus, no puede descartarse sesgo de dominio o de etiquetado.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos/negativos en la clasificación, agravado por la baja precisión declarada (0,2941) en la época final.
- Idiomas soportados: no disponibles. ModernBERT-base se entrenó principalmente en inglés, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique que se han realizado cambios.
- Caveat de producción: no debe desplegarse sin reentrenamiento y validación con datos propios. El número de descargas y likes (ambos 0) indica que el modelo no ha sido validado por la comunidad.
- Contexto: aunque se heredan 8192 tokens del base, la model card del fine-tune no confirma esta cifra para la cabeza ajustada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fazmaj/modernbert-flow-anomaly-classifier
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Documentacion de ModernBERT en transformers: https://huggingface.co/docs/transformers/model_doc/modernbert
- Repositorio de investigacion de ModernBERT: https://github.com/AnswerDotAI/ModernBERT
- Paper de ModernBERT (arXiv): https://arxiv.org/abs/2412.13663
- Version ACL Anthology del paper: https://aclanthology.org/2025.acl-long.127/
- Coleccion de modelos ModernBERT en HuggingFace: https://huggingface.co/models?search=modernbert

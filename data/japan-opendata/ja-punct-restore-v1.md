# japan-opendata/ja-punct-restore-v1

## Resumen

ja-punct-restore-v1 es un modelo de restauración de puntuación para japonés desarrollado por Japan Open Data Lab (cuenta japan-opendata). Recibe texto japonés sin signos de puntuación y predice, para cada carácter, una de cinco etiquetas: ninguna, coma ideográfica (、), punto ideográfico (。), signo de interrogación (？) o signo de exclamación (！). Su propósito principal es el postprocesado de transcripciones ASR, como las generadas por Whisper.

El modelo se construye sobre sbintuitions/modernbert-ja-130m, un encoder ModernBERT adaptado al japonés, y se formula como una tarea de token classification a nivel de carácter. Con 132.405.765 parámetros totales, es un modelo pequeño y ligero, pensado para ejecutarse en CPU con latencia baja (16,3 ms por utterance en un Core i7-11700F con la versión ONNX).

Su relevancia actual radica en que resuelve un problema práctico y medible: en un benchmark real de ASR (FLEURS japonés con transcripciones de Whisper large-v3-turbo), alcanza un micro-F1 de 0,8881 en puntuación frente al 0,6062 de la salida puntuada nativa de Whisper. Se distribuye con licencia Apache 2.0 y pesos en safetensors y ONNX, lo que facilita su integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), cabeza de token classification a nivel de carácter |
| Parametros totales | 132.405.765 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye ONNX fp32 y safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (onnx/model.onnx, fp32) |

## Arquitectura y entrenamiento

El modelo parte de sbintuitions/modernbert-ja-130m, un encoder ModernBERT preentrenado en japonés, y añade una cabeza de clasificación de tokens que opera sobre los offsets de caracteres. Las etiquetas son cinco: O (sin puntuación), 、, 。, ？ y ！ (ids 0 a 4). La inferencia se realiza carácter a carácter usando el offset mapping del tokenizador, insertando el signo predicho tras el carácter correspondiente.

El entrenamiento emplea ventanas concatenadas construidas a partir del subconjunto japonés de HuggingFaceFW/fineweb-2 (ODC-By 1.0) y 15.000 frases coloquiales sintéticas para compensar el sesgo hacia el registro escrito. Los logits de la cabeza de clasificación incorporan sesgos por clase ajustados sobre el conjunto de desarrollo y horneados en el modelo, de modo que el lado de inferencia no requiere corrección adicional. No se documenta en la información disponible el uso de RLHF, DPO ni el número total de tokens de entrenamiento.

## Capacidades

- Restauración de puntuación en japonés: inserta 、, 。, ？ y ！ en texto sin puntuar.
- Postprocesado de ASR: diseñado específicamente para transcripciones de Whisper y similares.
- Clasificación a nivel de carácter: predicción por carácter con alineación mediante offset mapping.
- Ejecución en CPU: versión ONNX con latencia de 16,3 ms por utterance en un Core i7-11700F.
- Integración con transformers: carga mediante AutoModelForTokenClassification y AutoTokenizer.
- No realiza corrección ortográfica ni reescritura de frases; su alcance se limita a la puntuación.

## Casos de uso

- Postprocesado de transcripciones ASR: tomar la salida sin puntuar de Whisper large-v3-turbo y restaurar comas y puntos para mejorar la legibilidad; el modelo supera la puntuación nativa de Whisper en FLEURS japonés (F1 0,8881 frente a 0,6062).
- Subtitulado automático: generar subtítulos japoneses puntuados a partir de audio transcrito, con latencia de milisegundos por segmento que permite procesar flujos en tiempo casi real en CPU.
- Generación de actas y notas de reuniones: puntuar transcripciones largas de reuniones antes de pasarlas a revisión humana o a un sistema de resumen.
- Indexación y búsqueda de texto: añadir puntuación a corpus ASR sin puntuar para mejorar la segmentación de frases en motores de búsqueda o sistemas de recuperación.
- Pipelines de accesibilidad: producir transcripciones legibles para personas con discapacidad auditiva a partir de audio en japonés.
- Preprocesado para TTS: segmentar texto sin puntuar con comas y puntos que sirvan de guía prosódica a un sistema de síntesis de voz.
- Normalización de datos de entrenamiento: puntuar grandes volúmenes de texto ASR antes de usarlos como corpus para otros modelos.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card.

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Test sellado (5.003 ejemplos) | micro-F1 (solo puntuación) | 0,8156 |
| Test sellado | Precision | 0,8154 |
| Test sellado | Recall | 0,8157 |
| Test sellado | MCC | 0,8284 |
| Test sellado, F1 por signo | 、 | 0,7591 |
| Test sellado, F1 por signo | 。 | 0,9188 (Recall 0,9364) |
| Test sellado, F1 por signo | ？ | 0,7300 |
| Test sellado, F1 por signo | ！ | 0,4884 |
| ASR real (FLEURS ja, 650 utterances, Whisper large-v3-turbo) | micro-F1 del modelo | 0,8881 (P 0,8537, R 0,9255) |
| ASR real (FLEURS ja) | micro-F1 de la salida de Whisper | 0,6062 |
| ASR real, F1 por signo | 、 | 0,8268 |
| ASR real, F1 por signo | 。 | 0,9806 |
| Velocidad (ONNX, CPU Core i7-11700F, 200 utterances) | latencia media | 16,3 ms/utterance |

## Requisitos de hardware

- VRAM estimada: el modelo tiene 132,4 M de parámetros; en fp32 ocupa aproximadamente 0,53 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no requiere GPU; funciona en CPU. Para lotes grandes, cualquier GPU moderna (RTX 3060 en adelante, A100, H100) acelera el proceso, aunque el cuello de botella no es el cómputo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime (onnx/model.onnx, fp32), y cualquier servidor compatible con token-classification. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 16,3 ms por utterance en CPU (Core i7-11700F) con ONNX sobre 200 utterances de FLEURS; el throughput en GPU no está documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ja-punct-restore-v1 | 132,4 M | no disponible | Restauración de puntuación japonesa | Apache 2.0 | Hugging Face (safetensors, ONNX) |
| Whisper large-v3-turbo (puntuación nativa) | no disponible | no disponible | ASR con puntuación integrada | no disponible en la información | Referencia de comparación en el benchmark del autor (F1 0,6062) |
| sbintuitions/modernbert-ja-130m | ~130 M | no disponible | Encoder japonés base | no disponible en la información | Hugging Face (modelo base) |

No se dispone en la información proporcionada de otros modelos de restauración de puntuación japonesa comparables con métricas publicadas.

## Limitaciones y advertencias

- Detección débil del signo de exclamación: F1 de 0,4884 y recall de 0,3920 en el test sellado; el modelo tiende a producir pocos ！.
- Los signos ？ y ！ no están evaluados en el benchmark ASR real: en FLEURS japonés había 0 referencias de ？ y solo 1 de ！, por lo que su rendimiento en ASR es desconocido.
- Sesgo hacia el registro escrito: el entrenamiento se basa en fineweb-2 con refuerzo de 15.000 frases coloquiales sintéticas; en habla coloquial degradada la precisión puede caer.
- No corrige errores ortográficos ni reescribe frases; solo inserta puntuación.
- Riesgo de alucinación de puntuación: puede insertar comas o puntos donde no corresponden, especialmente en texto con estructuras atípicas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones de atribución y las condiciones del corpus fineweb-2 (ODC-By 1.0) usado en el entrenamiento.
- Modelo recién publicado (creado el 19 de noviembre de 2026) con 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de terceros.
- Solo soporta japonés; no está entrenado para otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/japan-opendata/ja-punct-restore-v1
- Página de presentación: https://jpopendata.jp/models/ja-punct-restore-v1/
- Serie de modelos de Japan Open Data Lab: https://jpopendata.jp/models/
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-130m
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2

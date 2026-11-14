# Hooshaai/bert-halo-regla-sst2

## Resumen

BERT-halo-regla-sst2 es un checkpoint de `bert-base-uncased` en el que el autor (Hooshaai, identificado en la model card como Taha Majlesi) ha sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por el mecanismo `halo_regla`, una atencion subcuadratica de complejidad efectiva O(N) u O(N log N) implementada en la libreria NeuralOps. El modelo se ha afinado y destilado sobre la tarea SST-2 del benchmark GLUE para clasificacion binaria de sentimiento en ingles.

La relevancia del checkpoint es doble. Por un lado, demuestra que es posible reemplazar la atencion estandar de BERT por una variante subcuadratica manteniendo una precision competitiva: 91,17 % en el split de validacion de SST-2, solo 0,57 puntos por debajo del profesor original. Por otro, introduce un formato de serializacion "attention-only FP16" que reduce la huella de descarga a unos 55 MB, ya que solo se distribuyen los pesos de atencion destilados y la cabeza de clasificacion, mientras que los pesos congelados del BERT base se reconstruyen en tiempo de carga desde `bert-base-uncased`.

El modelo tiene 117.861.778 parametros totales, un contexto maximo de 512 tokens (heredado de BERT base) y esta pensado exclusivamente para clasificacion de texto en ingles. Su licencia es MIT y se distribuye con `trust_remote_code=True` porque depende de codigo personalizado de NeuralOps para reconstruir la arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atencion subcuadratica `halo_regla` en las 12 capas |
| Parametros totales | 117.861.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de bert-base-uncased) |
| Tipos de cuantizacion | FP16 para los pesos de atencion publicados; el resto de pesos se cargan en la precision del BERT base (FP32 por defecto) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16, ~55 MB); reconstruccion del base desde `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion, ~110 M de parametros) y reemplaza el mecanismo de multi-head attention estandar por `halo_regla`, una atencion subcuadratica que reduce la complejidad operativa efectiva de O(N^2) a O(N) u O(N log N). El resto de la topologia (embeddings, feed-forward, normalizacion, cabeza de clasificacion) se mantiene alineada con BERT base.

El entrenamiento sigue el protocolo "Cached Representation Distillation" de NeuralOps, que segun la model card no requiere asignar VRAM para el profesor durante el ajuste fino (alineacion offline de representaciones). El proceso tiene dos etapas: una primera de alineacion de subespacio oculto y una segunda de KL sobre logits combinada con entropia cruzada de la tarea. Se ejecuto en una NVIDIA GeForce RTX 3090 de 24 GB, con 178 pasos de optimizacion, 49,6 segundos de entrenamiento, un throughput efectivo de 29.393,1 tokens/s y un pico de VRAM de 10.736 MB. El dataset de evaluacion y ajuste es el split de validacion de SST-2 (872 muestras binarias).

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en ingles sobre secuencias de hasta 512 tokens.
- Razonamiento semantico limitado al encoder: no genera texto, solo produce logits de clasificacion.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso mas alla de la propia tarea de clasificacion.
- Capacidad multilingue practicamente nula: solo entrenado y evaluado en ingles.
- No dispone de modo thinking, vision ni audio.
- La atencion subcuadratica `halo_regla` podria ofrecer ventajas de eficiencia en secuencias largas, aunque el contexto maximo sigue limitado a 512 tokens por herencia del BERT base.

## Casos de uso

- Analisis de sentimiento en resenas de producto: el modelo clasifica resenas de hasta 512 tokens en positivas o negativas, adecuado para pipelines de monitorizacion de opinion a gran escala gracias a su coste de inferencia bajo.
- Moderacion de comentarios en foros y redes: deteccion rapida de tono negativo en textos cortos en ingles, integrable como paso previo a un clasificador mas costoso.
- Enrutamiento de tickets de soporte: clasificar el sentimiento de un mensaje entrante para priorizar clientes insatisfechos antes de la atencion humana.
- Investigacion sobre atencion subcuadratica: el checkpoint sirve como referencia reproducible para comparar `halo_regla` frente a atencion softmax estandar en tareas GLUE.
- Destilacion y eficiencia energetica: util como ejemplo de destilacion sin VRAM del profesor, replicable en entornos con una sola GPU consumer.
- Clasificacion de encuestas y feedback abierto: procesar respuestas de texto libre en ingles para agregar sentimiento a nivel de lote.
- Baseline en experimentos de Attention Zoo: punto de partida para probar otras variantes de atencion subcuadratica de NeuralOps sobre la misma tarea.

## Benchmarks y rendimiento

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`halo_regla`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Precision GLUE SST-2 (validacion, 872 muestras) | 91,63 % | 91,74 % | 91,17 % | -0,57 % |
| Entropia cruzada de validacion | 0,2428 | No calibrado | 0,3172 | Convergido |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP32 ocupa aproximadamente 450 MB; con los pesos de atencion en FP16 y el resto en FP32, el consumo en GPU es inferior a 1 GB en inferencia por lotes pequenos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor entreno en una RTX 3090 de 24 GB, pero para inferencia basta con una GTX 1650, RTX 3050 o superior.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para lotes pequenos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el codigo personalizado de NeuralOps) o la API `neuralops.hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato attention-only dificulta su uso fuera del ecosistema NeuralOps.
- Latencia y throughput: el autor reporta 29.393,1 tokens/s durante el entrenamiento en RTX 3090, pero no se publican cifras de inferencia en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (acc.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/bert-halo-regla-sst2 | 117,9 M | 512 | 91,17 % | MIT | Hugging Face, requiere NeuralOps |
| google-bert/bert-base-uncased | 110 M | 512 | 91,63 % (profesor, segun la model card) | Apache 2.0 | Hugging Face, transformers estandar |
| DistilBERT base (referencia generica) | 66 M | 512 | No disponible en la informacion | Apache 2.0 | Hugging Face |
| RoBERTa-base (referencia generica) | 125 M | 512 | No disponible en la informacion | MIT | Hugging Face |

La comparativa directa con DistilBERT y RoBERTa no se puede cerrar con datos de esta ficha porque la informacion proporcionada solo incluye cifras del profesor BERT base.

## Limitaciones y advertencias

- Solo ingles: no se ha entrenado ni evaluado en otros idiomas, por lo que su uso multilingue no esta justificado.
- Tarea unica: el checkpoint esta especializado en clasificacion binaria SST-2; no sirve para generacion, QA, NER ni otras tareas sin reajuste.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de clasificaciones erroneas en textos ambiguos, sarcasticos o de dominio muy distinto al de resenas.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True` y la libreria NeuralOps, lo que anade superficie de ataque y dificulta la portabilidad a otros runtimes.
- Serializacion no estandar: al publicar solo los pesos de atencion, cualquier fallo en la reconstruccion desde `bert-base-uncased` (version, revision o disponibilidad del base) puede romper la carga.
- Sesgos heredados de BERT base: el modelo arrastra los sesgos del corpus original de BERT, no documentados ni mitigados en la model card.
- Sin datos de calibracion mas alla de la entropia cruzada: la confianza de las probabilidades no esta validada en dominios externos a SST-2.
- Licencia MIT permite uso comercial, pero el codigo de NeuralOps y el modelo base `bert-base-uncased` tienen sus propias condiciones que conviene revisar por separado.

## Enlaces

- [Hugging Face: Hooshaai/bert-halo-regla-sst2](https://huggingface.co/Hooshaai/bert-halo-regla-sst2)
- [Repositorio NeuralOps (GitHub)](https://github.com/tahamajs/NeuralOps)
- [Licencia NeuralOps (MIT)](https://github.com/tahamajs/NeuralOps/blob/main/LICENSE)
- [Modelo base: google-bert/bert-base-uncased](https://huggingface.co/bert-base-uncased)
- [Benchmark GLUE](https://gluebenchmark.com/)

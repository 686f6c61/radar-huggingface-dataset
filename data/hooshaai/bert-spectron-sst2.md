# Hooshaai/bert-spectron-sst2

## Resumen

`bert-spectron-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` en el que las doce capas de atención softmax cuadrática del transformer original han sido sustituidas por el mecanismo `spectron`, una atención subcuadrática de complejidad efectiva O(N) u O(N log N) implementada en la librería NeuralOps. Lo publica el autor individual Taha Majlesi (organización Hooshaai) como parte de un "attention zoo" de BERT preentrenados sobre GLUE. El modelo no se distribuye completo: el repositorio contiene únicamente los pesos de atención y la cabeza de clasificación en FP16 (~55 MB), y el código remoto reconstruye la base congelada de BERT-Base (110 M de parámetros) en tiempo de carga.

El problema que aborda es la eficiencia de la atención en secuencias largas dentro de la familia BERT, manteniendo una precisión aceptable en una tarea concreta (SST-2, análisis de sentimiento binario). Se ha destilado desde el propio `bert-base-uncased` como profesor mediante el protocolo *Cached Representation Distillation* de NeuralOps, que evita mantener el profesor en VRAM durante el entrenamiento. El resultado reportado es un 88,76 % de accuracy en la partición de validación de SST-2, frente al 91,63 % del profesor y al 72,48 % del estudiante antes de destilar.

Es relevante ahora como pieza de investigación reproducible: el entrenamiento completo se ejecutó en una única RTX 3090 en 51,6 segundos (256 pasos, ~40 658 tokens/s, 7 673 MB de VRAM pico), lo que lo convierte en un ejemplo accesible para estudiar destilación de mecanismos de atención alternativos sin infraestructura dedicada. No obstante, su alcance es muy limitado: una sola tarea, un solo idioma y una única partición de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atención subcuadrática `spectron` en las 12 capas (sustituye a MHA softmax) |
| Parametros totales | 110 M (base BERT-Base congelada) + pesos de atención y cabeza de clasificación destilados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la de `bert-base-uncased`, 512 tokens, aunque no se explicita en la model card) |
| Tipos de cuantizacion | FP16 en los pesos de atención publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, ~55 MB); requiere `trust_remote_code=True` y el paquete `neuralops` |

## Arquitectura y entrenamiento

La arquitectura parte de BERT-Base (12 capas, 768 de dimensión oculta, 110 M de parámetros) y reemplaza en cada capa el bloque de multi-head attention softmax por el mecanismo `spectron`, que según el autor alcanza complejidad operativa efectiva O(N) u O(N log N) frente a O(N²). El resto de la red (embeddings, feed-forward, normalizaciones) se mantiene congelado desde `bert-base-uncased`; solo se entrenan y serializan los parámetros de atención y la cabeza de clasificación, lo que explica el tamaño reducido del repositorio (0,0 GB según Hugging Face, ~55 MB de pesos útiles).

El entrenamiento sigue el *NeuralOps Cached Representation Distillation Protocol* en dos etapas: primero una alineación de subespacio oculto (Stage 1) y después una combinación de KL sobre logits y entropía cruzada de la tarea (Stage 2), con 256 pasos de optimización en total. El profesor (`bert-base-uncased`) no ocupa VRAM durante el proceso porque sus representaciones se cachean offline. Todo se ejecutó en una NVIDIA GeForce RTX 3090 de 24 GB con Tensor Cores activos, alcanzando 40 658,2 tokens/s y un pico de 7 673 MB de VRAM, en 51,6 segundos de duración. No se documentan detalles sobre el dataset de destilación más allá de GLUE/SST-2, ni sobre el uso de RLHF o DPO (no aplicable en una tarea de clasificación).

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) sobre texto en inglés, específicamente la tarea SST-2 de GLUE.
- Inferencia con atención subcuadrática, potencialmente más eficiente en memoria y cómputo que la atención cuadrática para secuencias largas.
- Carga modular: los pesos de atención se aplican sobre una base BERT congelada descargada aparte, lo que permite reutilizar la misma base para otros mecanismos del attention zoo.
- Integración con `transformers` mediante `AutoModelForSequenceClassification` y `trust_remote_code=True`.
- API de alto nivel de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`) para carga en una línea.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni modo "thinking". El modelo es exclusivamente un clasificador de secuencias.

## Casos de uso

- Análisis de sentimiento de reseñas de producto en inglés: el modelo clasifica frases o párrafos como positivos o negativos; su accuracy del 88,76 % en SST-2 lo hace apto para prototipos y tareas de filtrado, no para decisiones críticas sin revisión humana.
- Moderación de comentarios a escala: al usar atención subcuadrática, el coste por token crece de forma más suave que en BERT estándar, lo que puede abaratar el procesamiento de grandes volúmenes de texto corto en producción.
- Investigación sobre eficiencia de atención: sirve como punto de comparación reproducible frente a BERT-Base estándar para medir el impacto de `spectron` en precisión y latencia, con un entrenamiento de menos de un minuto en una RTX 3090.
- Destilación de mecanismos alternativos: el protocolo de destilación cacheada documentado permite replicar el flujo (profesor offline, estudiante con atención sustituida) sobre otros datasets de GLUE.
- Clasificación en entornos con VRAM limitada: los ~55 MB de pesos de atención más la base BERT congelada (~450 MB en FP32) caben en GPUs de consumo, lo que facilita el despliegue en estaciones de trabajo modestas.
- Baseline para el attention zoo de NeuralOps: útil para comparar `spectron` con otros mecanismos subcuadráticos del mismo repositorio bajo idénticas condiciones de destilación y hardware.

## Benchmarks y rendimiento

Evaluación reportada por el autor sobre la partición de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`spectron`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 72,48 % | 88,76 % | +16,28 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,3225 | convergida |

Telemetría de entrenamiento (clúster Sharif HPC, RTX 3090 24 GB):

| Métrica | Valor |
|---|---|
| Duración del entrenamiento | 51,6 s |
| Pasos de optimización | 256 |
| Throughput efectivo | 40 658,2 tokens/s |
| VRAM pico | 7 673 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~7,7 GB pico durante el entrenamiento en FP16; en inferencia, la base BERT-Base congelada (~110 M parámetros) más los pesos de atención (~55 MB) ocupan del orden de 0,5–1 GB en FP16, aunque la cifra exacta no se documenta.
- GPU recomendadas: NVIDIA RTX 3090 (la utilizada por el autor), A100, H100 para cargas por lotes; cualquier GPU con al menos 8 GB debería bastar para inferencia en FP16.
- Cabe en GPU de consumo: sí, en RTX 3060/3070/3080/3090 y equivalentes con ≥8 GB, dado el tamaño reducido del modelo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, API de NeuralOps (`neuralops.hub`), y potencialmente vLLM o TGI si se exporta a un formato estándar (no documentado). No se menciona soporte de llama.cpp ni Ollama.
- Latencia y throughput: no se publican métricas de inferencia; solo se reporta throughput de entrenamiento (40 658,2 tokens/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-spectron-sst2` | 110 M (base) + atención destilada | no disponible (hereda 512 de BERT-Base) | 88,76 % | MIT | Hugging Face, requiere `neuralops` y `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (reportado por el autor) | Apache 2.0 | Hugging Face, estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en la información | Apache 2.0 | Hugging Face, estándar |
| `roberta-base` fine-tuned en SST-2 | 125 M | 512 | no disponible en la información | MIT | Hugging Face, estándar |

La comparativa se limita a los datos aportados; no se dispone de resultados de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación de rendimiento solo es válida frente al profesor.

## Limitaciones y advertencias

- El modelo solo se ha evaluado en una tarea (SST-2) y en una única partición de validación de 872 muestras; no hay evidencia de generalización a otras tareas de GLUE ni a dominios distintos.
- Solo soporta inglés; no se ha validado su comportamiento en otros idiomas.
- La accuracy cae 2,87 puntos respecto al profesor (88,76 % frente a 91,63 %), lo que puede ser relevante en aplicaciones sensibles.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas en textos ambiguos, irónicos o de dominio especializado.
- Requiere `trust_remote_code=True` y el paquete `neuralops`, lo que introduce dependencia de código de terceros no auditado y complica el despliegue en entornos con políticas de seguridad estrictas.
- El repositorio no incluye los pesos completos de BERT-Base; la reconstrucción depende de que `bert-base-uncased` siga disponible en Hugging Face.
- La model card contiene referencias a identificadores distintos al del repositorio (`tahamajs/bert-spectron-sst2` frente a `Hooshaai/bert-spectron-sst2`), lo que puede causar confusión en la carga.
- Licencia MIT permite uso comercial, pero el código remoto y la librería NeuralOps deben revisarse por separado.
- No se documentan sesgos específicos; al heredar la base de BERT-Base, es probable que arrastre sesgos de género, raza y dominio del corpus original, aunque no se cuantifican.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-spectron-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Paper o blog del mecanismo `spectron`: no disponible
- Demo o Space asociado: no disponible

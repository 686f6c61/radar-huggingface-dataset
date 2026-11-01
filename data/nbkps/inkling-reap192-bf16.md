# nbKPS/inkling-reap192-bf16

## Resumen

Inkling-reap192-bf16 es un checkpoint podado del modelo multimodal Inkling-Small, desarrollado originalmente por ThinkingMachines y reducido por nbKPS (KPS Labs × Albert / CCL) en octubre de 2026. La poda elimina un cuarto de los expertos enrutados de cada capa (de 256 a 192) aplicando una seleccion basada en la masa de contribucion total de cada experto, medida sobre trafico real del propio modelo. El resto de los componentes (atencion, convoluciones cortas, capas MLP densas, expertos compartidos, embeddings, cabeza de salida, torres de vision y audio, y cabeza MTP) se mantiene byte a byte identico al original.

El modelo es un transformer de mezcla de expertos (MoE) de 201.500 millones de parametros totales (276B en el original, con 12B activos por token en la configuracion top-6 sobre 256 expertos) y 42 capas. Esta version conserva la naturaleza multimodal (vision y audio) y el modo de razonamiento del modelo base. Se distribuye en BF16, sin ningun reentrenamiento posterior a la poda, por lo que debe considerarse una base para ajuste fino mas que un sustituto directo del original.

Su relevancia es doble: por un lado, demuestra que la poda estructurada de expertos por saliencia agregada puede reducir el coste de almacenamiento e inferencia de un MoE grande manteniendo una concordancia top-1 del 81,5% con el modelo original; por otro, documenta de forma transparente las mascaras de expertos conservados y las metricas de divergencia (KL 0,45 sobre el top-64 del original), lo que facilita la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + vision + audio), 42 capas, top-6 sobre expertos enrutados + 2 expertos compartidos |
| Parametros totales | 201.521.441.330 (201,5B) |
| Parametros activos | 12B en el modelo base (no confirmado para este corte) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (unico formato publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; condiciones no detalladas) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 42 capas que combina atencion, convoluciones cortas y capas MLP densas, con 256 expertos enrutados por capa en el original (top-6) mas 2 expertos compartidos. Incluye torres de vision y audio, una cabeza MTP (multi-token prediction) y un router con `gate.bias`. En este checkpoint, los tensores de expertos se han recortado en la dimension 0 a los 192 expertos conservados (en orden ascendente de indice original), y las filas del router y el `gate.bias` se han recortado de la misma forma; `text_config.n_routed_experts` queda fijado a 192. El modelo carga con el mismo codigo que el original.

La seleccion de expertos se realizo con una variante de REAP que mide, para cada experto, la suma de `g_j(x)·‖E_j(x)‖₂` sobre los tokens enrutados a el, es decir, la masa total de contribucion (saliencia media multiplicada por el numero de enrutamientos). La medicion se hizo transmitiendo el modelo BF16 completo capa a capa sobre 1,70 millones de tokens de trafico propio de Inkling (swe, agentico, terminal, razonamiento, json, eficiencia; 793 secuencias) en una unica NVIDIA DGX Spark GB10 de 128 GB. Sobre un conjunto retenido de 78.000 posiciones, el criterio de suma con 128 expertos alcanza top-1 0,733 y KL 0,87, frente a 0,585 / 2,02 del criterio de saliencia media de REAP y 0,543 / 2,74 de la seleccion aleatoria; el recuento de enrutamientos por si solo da 0,717 / 0,96. No se ha aplicado ningun entrenamiento posterior.

## Capacidades

- Generacion de texto y razonamiento multimodal, heredados del modelo base Inkling-Small.
- Procesamiento de vision: conserva la torre de vision intacta.
- Procesamiento de audio: conserva la torre de audio intacta.
- Modo de razonamiento y prediccion multi-token (cabeza MTP) sin modificar.
- Capacidad de agente y flujos multi-paso, segun el trafico de entrenamiento de la medicion (agentico, terminal, swe).
- Generacion de JSON estructurado y tareas de eficiencia de codigo.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Base para ajuste fino de un MoE multimodal: al conservar el 75% de los expertos enrutados y todas las torres, sirve como punto de partida para reentrenar con menos recursos que el modelo original de 276B.
- Investigacion sobre poda de expertos: permite reproducir y comparar los criterios de seleccion (suma de saliencia, saliencia media, aleatorio) sobre el mismo modelo base y el mismo conjunto de evaluacion.
- Despliegue en infraestructura con memoria limitada: los 375 GiB en BF16 frente a los 255 GiB del corte a la mitad y el tamano del original permiten elegir el equilibrio entre fidelidad y huella.
- Evaluacion de agentes de terminal y SWE: el trafico de calibracion incluye buckets de agentico, terminal y swe, por lo que el checkpoint es adecuado para medir la degradacion en esas tareas tras la poda.
- Generacion de JSON y salidas estructuradas en pipelines: el bucket json del conjunto de calibracion sugiere soporte para este tipo de tareas, verificable contra el original.
- Analisis de sensibilidad a la precision del router: util para estudiar como el redondeo bf16 frente a fp32 en el top-k altera la seleccion de expertos en produccion.
- Prototipado de asistentes multimodales con vision y audio en entornos de investigacion donde no se requiere la fidelidad completa del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas metricas publicadas son de concordancia con el modelo original sobre un conjunto retenido de 78.000 posiciones:

| Metrica | reap192 | reap128 | Original |
|---|---|---|---|
| Expertos enrutados por capa | 192 | 128 | 256 |
| Tamano en disco | 375 GiB | 255 GiB | no disponible |
| Concordancia top-1 | 0,815 | 0,733 | 1,000 (referencia) |
| KL sobre top-64 del original | 0,45 | 0,87 | 0 (referencia) |

Criterios de seleccion alternativos evaluados con 128 expertos: saliencia media de REAP 0,585 / 2,02; aleatorio 0,543 / 2,74; recuento de enrutamientos 0,717 / 0,96.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 403 GB de pesos mas activaciones y cache KV; no cabe en una GPU consumer.
- GPU recomendadas: nodos multi-GPU de clase A100 80GB, H100 80GB o H200; el modelo original se midio en una DGX Spark GB10 de 128 GB solo para el proceso de poda por streaming de capas, no para inferencia completa.
- Cabe en GPU consumer: no en BF16. No se han publicado cuantizaciones GGUF ni versiones de menor precision en este repo.
- Opciones de despliegue: el modelo carga con el codigo de transformers del original; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles.
- Nota de ejecucion: el forward de referencia debe ejecutarse sin padding (batch 1, solo tokens reales), ya que el padding por la derecha afecta a posiciones reales en esta arquitectura.

## Comparativa con modelos similares

| Modelo | Parametros totales | Expertos enrutados | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-reap192-bf16 | 201,5B | 192 (top-6) | no disponible | other | HuggingFace (18 descargas) |
| Inkling-reap128-bf16 | no disponible | 128 (top-6) | no disponible | other | HuggingFace |
| Inkling-Small (original) | 276B | 256 (top-6) | no disponible | other | HuggingFace (ThinkingMachines) |

No se dispone de datos de rendimiento en tareas para ninguno de los tres, por lo que la comparacion se limita a tamano, estructura de expertos y concordancia con el original (0,815 para reap192 frente a 0,733 para reap128).

## Limitaciones y advertencias

- Las metricas publicadas son concordancia teacher-forced con el original, no puntuaciones de tarea; el rendimiento real en tareas puede degradarse mas de lo que sugiere el top-1.
- El corte a 192 expertos elimina el 25% de los expertos enrutados; el autor advierte que el corte a la mitad es un cambio grande y debe tratarse como base para entrenamiento adicional, no como sustituto directo.
- El enrutamiento es sensible a la precision numerica: el top-k del original opera en bf16 y ejecutar el router en fp32 cambia la seleccion de expertos en una fraccion medible de tokens.
- El padding por la derecha no es invisible para las posiciones reales en esta arquitectura; hay que inferir sin padding.
- Licencia "other" heredada del modelo base, con condiciones no detalladas; verificar los terminos de ThinkingMachines/Inkling-Small antes de uso comercial.
- No se han publicado cuantizaciones, por lo que el despliegue exige BF16 y memoria de orden de cientos de GB.
- No hay informacion sobre idiomas soportados ni sobre sesgos conocidos del modelo base.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Repositorio con 18 descargas y 0 likes; ecosistema de validacion muy limitado.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/nbKPS/inkling-reap192-bf16
- Modelo base: https://huggingface.co/ThinkingMachines/Inkling-Small
- Checkpoint hermano (corte a 128 expertos): https://huggingface.co/nbKPS/inkling-reap128-bf16

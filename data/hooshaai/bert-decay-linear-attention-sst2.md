# Hooshaai/bert-decay-linear-attention-sst2

## Resumen

BERT-Base con atención linear de decaimiento (`decay_linear_attention`) es un checkpoint de `bert-base-uncased` en el que los bloques de atención softmax cuadrática de las 12 capas del transformer han sido sustituidos por un mecanismo de atención subcuadrática del proyecto NeuralOps. El modelo lo publica el usuario Hooshaai (autor citado en la model card como Taha Majlesi) y está ajustado para clasificación binaria de sentimiento sobre la tarea SST-2 del benchmark GLUE. Su interés es fundamentalmente metodológico: demuestra que es posible destilar las representaciones de un BERT estándar hacia una arquitectura de atención con complejidad efectiva O(N) u O(N log N) sin reentrenar el modelo base desde cero.

El checkpoint no contiene los pesos completos de BERT (110 M de parámetros), sino únicamente los pesos de atención y la cabeza de clasificación en FP16, unos 55 MB. El código remoto (`trust_remote_code=True`) reconstruye el BERT base congelado desde `bert-base-uncased` y aplica encima los parámetros de atención destilados. La destilación se ejecutó en una única RTX 3090 en 48,2 segundos y 90 pasos de optimización, con una estrategia de caché offline de representaciones del profesor que evita reservar VRAM para el modelo docente.

El resultado empírico es modesto: 68,58 % de accuracy en la partición de validación de SST-2, frente al 91,63 % del profesor original. El modelo es, por tanto, una prueba de concepto de eficiencia arquitectónica más que un clasificador listo para producción. Es relevante ahora porque forma parte de un zoo de atenciones subcuadráticas que busca reducir el coste cuadrático de la atención estándar en modelos tipo BERT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base (12 capas) con atención linear de decaimiento (`decay_linear_attention`) en lugar de softmax cuadrática |
| Parametros totales | 110 M (BERT-Base); el repo solo serializa pesos de atención y cabeza de clasificación (~55 MB en FP16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-Base admite 512 tokens; la model card no especifica el contexto efectivo del mecanismo linear) |
| Tipos de cuantizacion | Pesos publicados en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, serialización `attention_only_fp16`) con código remoto de reconstrucción |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y 110 M de parámetros. La modificación sustituye la atención multi-cabeza softmax de complejidad O(N²) por el mecanismo `decay_linear_attention` de la librería NeuralOps, que aplica un decaimiento lineal sobre las claves y valores para lograr una complejidad efectiva O(N) u O(N log N). Los pesos del BERT base permanecen congelados; solo se entrenan los parámetros de atención y la cabeza de clasificación.

El entrenamiento sigue el protocolo de destilación de representaciones en caché de NeuralOps: primero una fase de alineamiento de subespacio oculto (Stage 1) y después una fase de KL sobre logits más entropía cruzada de la tarea (Stage 2). Se ejecutó sobre la partición de entrenamiento de SST-2 con 90 pasos de optimización, 48,2 segundos de duración, un throughput efectivo de 15.287,6 tokens/s y un pico de VRAM de 13.512 MB en una RTX 3090. La técnica destacable es la caché offline de representaciones del profesor, que permite destilar sin mantener el modelo docente en memoria de GPU.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés.
- Inferencia con atención subcuadrática, lo que en teoría reduce el coste de memoria y cómputo frente a la atención softmax para secuencias largas.
- Carga modular: los pesos de atención se aplican sobre un BERT base congelado descargado aparte.
- Compatibilidad con `AutoModelForSequenceClassification` de Transformers mediante `trust_remote_code=True`.
- Integración con la API de alto nivel `neuralops.hub.bert_zoo.load_pretrained_bert` y `neuralops.hub.load_surgeried_model`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un encoder de clasificación, no un modelo generativo.

## Casos de uso

- Investigación sobre eficiencia de atención: sirve como punto de partida para comparar `decay_linear_attention` frente a softmax en tareas de clasificación, midiendo la degradación de accuracy a cambio de complejidad subcuadrática.
- Prototipado de clasificadores de sentimiento con presupuesto de memoria reducido: al serializar solo ~55 MB de pesos de atención, el checkpoint es ligero de almacenar y de versionar en pipelines de experimentación.
- Base para destilación adicional: el protocolo de NeuralOps permite reentrenar la atención sobre otras tareas de GLUE (CoLA, MRPC, RTE) reutilizando el mismo esqueleto congelado.
- Docencia y reproducción de experimentos: el entrenamiento completo cabe en una sola RTX 3090 en menos de un minuto, lo que facilita la reproducibilidad en entornos académicos.
- Evaluación de mecanismos de atención alternativos en entornos con restricciones de VRAM: el pico de 13,5 GB permite ejecutar el ciclo de destilación en GPUs de consumo alto sin clúster.
- Clasificación de sentimiento en inglés como componente de un sistema mayor (por ejemplo, filtrado de reseñas), siempre que se acepte la pérdida de precisión frente a BERT estándar y se valide el umbral de confianza en cada dominio.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado |
|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 52,98 % | 68,58 % |
| Entropía cruzada de validación | 0,2428 | No calibrada | 0,6326 |
| Delta de accuracy | — | — | +15,60 puntos |

Telemetría de entrenamiento (clúster Sharif HPC, RTX 3090 24 GB):

| Metrica | Valor |
|---|---|
| Duracion del entrenamiento | 48,2 s |
| Pasos de optimizacion | 90 |
| Throughput efectivo | 15.287,6 tokens/s |
| Pico de VRAM | 13.512 MB |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM de inferencia: no documentada explícitamente; al tratarse de un BERT-Base de 110 M de parámetros con pesos de atención en FP16, la huella esperada es de unos pocos cientos de MB, pero la model card no aporta cifras.
- VRAM de entrenamiento/destilación: pico de 13.512 MB medido en una RTX 3090 de 24 GB.
- GPU recomendadas: RTX 3090 (configuración validada por el autor); cualquier GPU Ampere o superior con al menos 14 GB para reproducir el ciclo de destilación.
- Cabe en GPU de consumo: sí, al menos en RTX 3090; no se confirma para GPUs con menos de 14 GB en el caso del entrenamiento.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se reporta throughput de entrenamiento (15.287,6 tokens/s); no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BERT-Base decay_linear_attention (este) | 110 M (solo atención serializada) | No disponible | 68,58 % | MIT | Hugging Face + NeuralOps |
| `bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face |
| Modelos de atención linear tipo Performer/Linear Transformer sobre BERT | ~110 M | Variable según implementación | No disponible en esta ficha | Variable | Repos de investigación |

La comparativa se limita al profesor porque la información proporcionada no incluye resultados de otras implementaciones subcuadráticas sobre SST-2. Frente al BERT estándar, este checkpoint sacrifica 23,05 puntos de accuracy a cambio de una complejidad de atención menor y un checkpoint mucho más pequeño.

## Limitaciones y advertencias

- Degradación notable de precisión: 68,58 % frente al 91,63 % del profesor, una caída de más de 23 puntos que lo aleja de un uso en producción sin validación adicional.
- Solo inglés: el modelo está entrenado y evaluado únicamente en inglés; no hay evidencia de comportamiento multilingüe.
- Tarea única: ajustado exclusivamente a clasificación binaria de sentimiento en SST-2; no generaliza a otras tareas sin reentrenamiento.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas y sobreconfianza en dominios distintos al de entrenamiento.
- Dependencia de código remoto: requiere `trust_remote_code=True` y la librería NeuralOps, lo que añade superficie de ataque y riesgo de rotura de compatibilidad.
- Pesos incompletos por diseño: el repo solo contiene atención y cabeza; sin acceso a `bert-base-uncased` en el Hub, el modelo no se puede reconstruir.
- Entrenamiento muy corto (90 pasos, 48,2 s): los resultados pueden no reflejar el máximo potencial del mecanismo de atención; el propio autor lo describe como calibrado, no óptimo.
- Licencia MIT permite uso comercial, pero la procedencia del modelo base (`bert-base-uncased`, Apache 2.0) y de los datos (GLUE) debe verificarse por separado.
- Sin datos de benchmarks fuera de SST-2, sin evaluación de sesgos y sin tests de robustez publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-decay-linear-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/glue/viewer/sst2

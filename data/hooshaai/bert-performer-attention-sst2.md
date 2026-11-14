# Hooshaai/bert-performer-attention-sst2

## Resumen

`Hooshaai/bert-performer-attention-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que se han sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por el mecanismo `performer_attention` de la libreria NeuralOps, con el objetivo de obtener una complejidad efectiva subcuadratica (O(N) u O(N log N)) frente a la O(N^2) de la multi-head attention estandar. El modelo se ha afinado y destilado especificamente para la tarea SST-2 del benchmark GLUE, que consiste en clasificacion binaria de sentimiento en resenas en ingles.

El desarrollo corre a cargo de Taha Majlesi (organizacion Hooshaai), autor de la libreria NeuralOps, y forma parte de un "Attention Zoo" de variantes de BERT con mecanismos de atencion alternativos. La relevancia actual es doble: por un lado demuestra el flujo de destilacion con representaciones cacheadas en el que el profesor no ocupa VRAM (protocolo NeuralOps Cached Representation Distillation); por otro, sirve como referencia empirica de la perdida de calidad que introduce la atencion de tipo Performer en un modelo pequeno cuando no se hace un preentrenamiento completo desde cero.

El checkpoint publicado no contiene los pesos completos de BERT, sino unicamente los parametros de atencion y la cabeza de clasificacion en FP16 (unos 55 MB); los pesos congelados del modelo base se descargan aparte desde `bert-base-uncased` y se combinan en tiempo de carga mediante un shim de codigo remoto. La precision final en la validacion de SST-2 es del 79,01 %, frente al 91,63 % del profesor BERT-base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atencion `performer_attention` en las 12 capas (NeuralOps) |
| Parametros totales | ~110 M (base BERT-base) + cabeza de clasificacion; el repo solo contiene los pesos de atencion y la cabeza (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base estandar: 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (fichero `attention_weights.safetensors`, atencion y cabeza en FP16) + pesos base de `bert-base-uncased` descargados por separado |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion, ~110 M de parametros) en el que cada bloque de self-attention cuadratica se reemplaza por `performer_attention`, un mecanismo de atencion lineal aproximada que reduce el coste computacional de O(N^2) a O(N) u O(N log N) en funcion de la implementacion. El modelo base permanece congelado y solo se entrenan los parametros de atencion y la cabeza de clasificacion, que es lo que se serializa en el repositorio.

El entrenamiento sigue el protocolo NeuralOps Cached Representation Distillation en dos etapas: primero una alineacion de subespacio oculto (Stage 1) y despues una combinacion de KL sobre logits del profesor y entropia cruzada sobre la tarea (Stage 2). El profesor es `bert-base-uncased` y las representaciones se cachean offline, de modo que no consume VRAM durante la destilacion. La ejecucion fisica se realizo en una NVIDIA GeForce RTX 3090 de 24 GB, con una duracion de 50,3 segundos, 221 pasos de optimizacion, un throughput efectivo de 35.998,9 tokens/s y un pico de VRAM de 8.409 MB. Los datos de entrenamiento y evaluacion son el split de validacion de SST-2 (872 muestras binarias) dentro del benchmark GLUE.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en textos en ingles, tarea SST-2 de GLUE.
- Inferencia con la API estandar de Hugging Face `AutoModelForSequenceClassification` con `trust_remote_code=True`.
- Carga modular mediante la API `load_pretrained_bert` de NeuralOps, que reconstruye el modelo sobre los pesos congelados de BERT-base.
- Compatibilidad con el cargador universal `load_surgeried_model` de NeuralOps Hub.
- Atencion subcuadratica que reduce el coste teorico en secuencias largas respecto a la atencion softmax cuadratica.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni generacion de texto: es exclusivamente un clasificador.
- No tiene capacidades multimodales (vision, audio) ni modo "thinking".
- Multilingue: no; solo ingles.

## Casos de uso

- Clasificacion de sentimiento en resenas de producto o resenas de peliculas en ingles: el modelo devuelve una etiqueta binaria directamente desde la cabeza de clasificacion, y su tamano reducido permite desplegarlo en CPU o en GPUs de gama baja.
- Filtrado de comentarios en pipelines de moderacion: se puede usar como primer clasificador de polaridad para enrutar contenido negativo a revision humana, con la ventaja de que el checkpoint ocupa solo ~55 MB adicionales sobre BERT-base.
- Experimentacion academica con mecanismos de atencion subcuadraticos: sirve como referencia reproducible del impacto de `performer_attention` frente a softmax en un modelo pequeno y una tarea estandar.
- Benchmarking de destilacion: el par (profesor BERT-base, estudiante Performer) permite medir la brecha de precision y el coste de entrenamiento del protocolo NeuralOps en un entorno controlado (RTX 3090, 50,3 s, 221 pasos).
- Prototipado rapido de clasificadores de texto: al cargarse con `AutoModelForSequenceClassification`, se integra en scripts de Hugging Face sin cambios en el codigo de inferencia.
- Evaluacion comparativa de eficiencia: util para medir latencia y throughput de un encoder con atencion lineal frente a BERT-base en secuencias largas, aunque el modelo no este entrenado para ellas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de validacion de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`performer_attention`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Precision SST-2 | 91,63 % | 75,11 % | 79,01 % | +3,90 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,5698 | convergido |

Telemetria de entrenamiento (RTX 3090 24 GB):

| Metrica | Valor |
|---|---|
| Duracion del entrenamiento | 50,3 s |
| Pasos de optimizacion | 221 |
| Throughput efectivo | 35.998,9 tokens/s |
| Pico de VRAM | 8.409 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint de atencion ocupa ~55 MB en FP16; sumando los pesos congelados de BERT-base (~440 MB en FP32, ~220 MB en FP16) el modelo completo requiere aproximadamente 0,5-1 GB de VRAM, aunque no se documenta una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor valido el entrenamiento en una NVIDIA GeForce RTX 3090 de 24 GB, pero la inferencia cabe en GPUs consumer muy inferiores (GTX 1650, RTX 3050, etc.).
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna e incluso en CPU para lotes pequenos.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`, API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; solo se documenta el throughput de entrenamiento (35.998,9 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-performer-attention-sst2` | ~110 M (atencion + cabeza, ~55 MB) | no disponible | 79,01 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 110 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 110 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparacion directa con el profesor es la mas informativa: el modelo Performer destilado pierde 12,62 puntos porcentuales de precision en SST-2 respecto a BERT-base, a cambio de una complejidad asintotica menor en atencion. No se dispone de datos de benchmarks de los otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Precision notablemente inferior al profesor: 79,01 % frente a 91,63 % en SST-2, una brecha de 12,62 puntos que lo hace poco adecuado para produccion sin validacion adicional.
- Entropia cruzada de validacion elevada (0,5698) frente al profesor (0,2428), lo que indica menor calibracion de las probabilidades.
- Solo ingles: no se ha entrenado ni evaluado en otros idiomas.
- Solo clasificacion binaria de sentimiento: no genera texto, no hace razonamiento y no soporta tool calling ni agentes.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto del autor (`modeling_neuralops_bert.py`); conviene auditar ese codigo antes de usarlo en entornos de produccion.
- Dependencia del modelo base: el checkpoint no es autocontenido; necesita descargar `bert-base-uncased` por separado, lo que anade una dependencia externa y posibles fallos de red o de versionado.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si hay riesgo de clasificaciones erroneas en dominios distintos de SST-2 (resenas de peliculas), ya que no se documenta evaluacion fuera de ese conjunto.
- Sesgos: no se documenta ningun analisis de sesgos; al heredar el preentrenamiento de BERT-base, puede reproducir sesgos de genero, raza o dominio presentes en los datos originales.
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` esta bajo Apache 2.0, por lo que conviene verificar el cumplimiento de ambas licencias en un despliegue comercial.
- Madurez: el repositorio tiene 61 descargas y 0 likes en el momento de la consulta, y la documentacion no incluye evaluaciones independientes; tratarlo como un experimento de investigacion, no como un modelo listo para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-performer-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue

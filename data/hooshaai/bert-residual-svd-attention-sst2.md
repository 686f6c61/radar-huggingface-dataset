# Hooshaai/bert-residual-svd-attention-sst2

## Resumen

`bert-residual-svd-attention-sst2` es un checkpoint derivado de `bert-base-uncased` en el que se han sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por el mecanismo `residual_svd_attention` de la libreria NeuralOps. El modelo lo publica el autor Hooshaai (organizacion `tahamajs` en el codigo de ejemplo) y esta pensado como demostracion empirica de que es posible reemplazar la atencion cuadratica por una alternativa subcuadratica y recuperar parte del rendimiento mediante destilacion de conocimiento.

El checkpoint se ha afinado y evaluado sobre la tarea SST-2 del benchmark GLUE (clasificacion binaria de sentimiento en ingles) y se distribuye como pesos de atencion y cabeza de clasificacion en FP16 (~55 MB), no como un modelo completo. El codigo remoto reconstruye el BERT base congelado desde `bert-base-uncased` y aplica encima los parametros destilados.

Su relevancia es fundamentalmente experimental: sirve para estudiar mecanismos de atencion subcuadraticos (complejidad efectiva O(N) u O(N log N) frente a O(N^2)) y protocolos de destilacion con coste cero de VRAM del profesor. No es un modelo listo para produccion de clasificacion de sentimiento de alta precision, dado que queda mas de 12 puntos por debajo del profesor BERT-base en SST-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atencion `residual_svd_attention` (subcuadratica) en las 12 capas |
| Parametros totales | 110 M (base BERT-base) + cabeza de clasificacion; el repo solo almacena pesos de atencion y cabeza (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada de BERT-base, 512 tokens por defecto, no confirmado explicitamente) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, solo atencion + cabeza); requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M de parametros) y reemplaza el mecanismo de multi-head attention cuadratico por `residual_svd_attention`, con complejidad operativa efectiva O(N) u O(N log N) segun la model card. La serializacion es modular: solo se publican los pesos de atencion y la cabeza de clasificacion en FP16 (~55 MB), mientras que los pesos base congelados se inicializan desde `bert-base-uncased` en tiempo de carga mediante el shim `modeling_neuralops_bert.py`.

El entrenamiento sigue el protocolo "NeuralOps Cached Representation Distillation" (destilacion con representaciones cacheadas offline, sin asignar VRAM al profesor). Se ejecuto en una NVIDIA GeForce RTX 3090 de 24 GB durante 76 segundos, con 164 pasos de optimizacion en dos etapas: alineamiento de subespacio oculto y luego KL sobre logits mas entropia cruzada de la tarea. El throughput efectivo reportado es de 17 675,9 tokens/s y el pico de VRAM de 6 972 MB. No se especifica el numero total de tokens de entrenamiento.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en ingles, tarea SST-2 de GLUE.
- Razonamiento sobre secuencias de texto con atencion subcuadratica, lo que reduce el coste computacional frente a BERT-base en secuencias largas.
- Extraccion de representaciones contextuales de BERT-base (heredadas del modelo congelado).
- Soporte de `AutoModelForSequenceClassification` de Transformers con `trust_remote_code=True`.
- Carga modular a traves de la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No se documentan capacidades de generacion, tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Investigacion en mecanismos de atencion subcuadraticos: sirve como punto de partida reproducible para comparar `residual_svd_attention` con atencion softmax estandar en tareas de clasificacion, gracias a que la model card documenta el protocolo de destilacion paso a paso.
- Experimentos de destilacion eficiente en VRAM: el protocolo de representaciones cacheadas offline permite reproducir el entrenamiento en una sola RTX 3090 sin mantener el profesor en memoria, util para laboratorios con recursos limitados.
- Prototipado rapido de clasificadores de sentimiento: con 55 MB de pesos y carga sobre BERT-base congelado, el modelo se puede desplegar en entornos con poco almacenamiento para tareas de baja exigencia (por ejemplo, filtrado preliminar de resenas).
- Benchmark de referencia en el "Attention Zoo": util para validar la integracion de la libreria NeuralOps con el ecosistema Hugging Face y comprobar la compatibilidad de pesos modulares.
- Docencia y formacion: ejemplo didactico de sustitucion de un bloque de atencion y de evaluacion de impacto en precision (54,59 % antes de destilar frente a 78,67 % despues).
- Base para fine-tuning posterior: al mantener la arquitectura de BERT-base, se puede partir de este checkpoint para experimentar con otras tareas de GLUE o dominios especificos, aunque la precision de partida es limitada.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de GLUE SST-2 (872 muestras de clasificacion binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado |
|---|---|---|---|
| Precision SST-2 | 91,63 % | 54,59 % | 78,67 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,5393 |

La destilacion aporta +24,08 puntos de precision respecto al estudiante sin destilar, pero el modelo final queda 12,96 puntos por debajo del profesor. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Inferencia: los pesos publicados ocupan ~55 MB en FP16, pero al cargar se instancian los 110 M de parametros de BERT-base congelado; en FP32 esto supone aproximadamente 440 MB de pesos, mas activaciones.
- VRAM estimada: por debajo de 2 GB para inferencia en FP32 con batch pequeno; menos de 1 GB con precision reducida (estimacion, no confirmada en la model card).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el propio autor uso una RTX 3090 (24 GB) para el entrenamiento, con un pico de 6 972 MB.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, RTX 3060, etc.).
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se reportan datos de inferencia; solo el throughput de entrenamiento (17 675,9 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-residual-svd-attention-sst2` | 110 M (solo atencion + cabeza publicadas) | no disponible | 78,67 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face, estandar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face, estandar |

La comparativa con DistilBERT se incluye como referencia de destilacion clasica, pero no se dispone de su cifra exacta de SST-2 en la informacion proporcionada.

## Limitaciones y advertencias

- Precision notablemente inferior al profesor BERT-base en SST-2 (78,67 % frente a 91,63 %), lo que limita su uso en produccion donde se requiera alta exactitud.
- Solo soporta ingles y una unica tarea (clasificacion binaria de sentimiento); no es un modelo generativo ni multilingue.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto del autor; conviene auditar `modeling_neuralops_bert.py` antes de desplegarlo.
- Los pesos publicados no son autocontenidos: dependen de descargar `bert-base-uncased` desde el Hub, lo que anade una dependencia externa y consume mas almacenamiento del que sugiere el tamano del repo.
- Riesgo de alucinacion y sesgos: al derivar de BERT-base, hereda los sesgos de su corpus de entrenamiento (BooksCorpus y Wikipedia en ingles); no se documentan evaluaciones de sesgo ni de robustez.
- La model card no detalla la longitud de contexto efectiva con la nueva atencion ni el comportamiento en secuencias largas, pese a ser el principal argumento del mecanismo subcuadratico.
- El checkpoint es una demostracion experimental (60 descargas, 0 likes en el momento de la consulta); no hay evidencia de validacion independiente ni de mantenimiento a largo plazo.
- La licencia MIT permite uso comercial, pero al combinar pesos derivados de BERT-base (Apache 2.0) conviene verificar el cumplimiento de ambas licencias en un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-residual-svd-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue

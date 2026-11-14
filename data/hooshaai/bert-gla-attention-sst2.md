# Hooshaai/bert-gla-attention-sst2

## Resumen

`bert-gla-attention-sst2` es un checkpoint experimental publicado por Hooshaai (Taha Majlesi, autor de la libreria NeuralOps) en el que se sustituyen los bloques de atencion softmax cuadratica de `bert-base-uncased` por el mecanismo `gla_attention` (atención lineal con compuerta, de complejidad efectiva $O(N)$ u $O(N \log N)$). El modelo se ha afinado y destilado sobre la tarea SST-2 del benchmark GLUE, que consiste en clasificacion binaria de sentimiento en ingles.

La relevancia del artefacto no esta en su calidad predictiva —que es muy baja— sino en su caracter de prueba de concepto de la infraestructura NeuralOps: serializacion modular de solo pesos de atencion en FP16 (~55 MB), protocolo de destilacion con cache offline de representaciones del profesor (cero VRAM de profesor) y reconstruccion en tiempo de carga sobre los pesos congelados de BERT-base. La arquitectura base es BERT-base (110 M parametros, 12 capas, contexto 512 tokens), y el resultado publicado es una precision del 49,89 % en el split de validacion de SST-2, frente al 91,63 % del profesor.

El modelo esta pensado para investigadores que quieran reproducir o auditar el pipeline de atencion subcuadratica y destilacion de NeuralOps, no para uso en produccion. La licencia es MIT y el idioma soportado, ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con atencion `gla_attention` (subcuadratica, lineal con compuerta) en las 12 capas |
| Parametros totales | 110 M (base BERT-base congelado); el repo solo almacena ~55 MB de pesos de atencion y cabeza de clasificacion |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de BERT-base) |
| Tipos de cuantizacion | FP16 en los pesos de atencion serializados; no se documentan otras cuantizaciones |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, ~55 MB); requiere `trust_remote_code=True` y el shim `modeling_neuralops_bert.py` |
| Libreria | `neuralops` |
| Modelo base | `google-bert/bert-base-uncased` |
| Dataset de evaluacion | GLUE SST-2 (split de validacion, 872 muestras) |
| Tamano del repo | ~0,5 GB |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza el mecanismo de atencion multi-cabeza estandar ($O(N^2)$) por `gla_attention`, un mecanismo de atencion lineal con compuerta que reduce la complejidad operativa a $O(N)$ u $O(N \log N)$. Los pesos del encoder base permanecen congelados; solo se entrenan y serializan los parametros de atencion y la cabeza de clasificacion, lo que da lugar a un artefacto de ~55 MB que se recompone sobre BERT-base en tiempo de carga mediante codigo remoto.

El entrenamiento sigue el protocolo NeuralOps Cached Representation Distillation, en dos etapas: primero una alineacion de subespacio de estados ocultos y despues una combinacion de KL sobre logits del profesor mas entropia cruzada de la tarea. La destilacion se ejecuto en una NVIDIA GeForce RTX 3090 (24 GB) con cache offline de representaciones del profesor (sin asignar VRAM al profesor), durante 92,9 s y 21 pasos de optimizacion, con un throughput efectivo de 1851,6 tokens/s y un pico de VRAM de 23 021 MB. El resultado es un modelo que ha convergido en la perdida pero que no ha aprendido la tarea: la precision final es practicamente la de un clasificador aleatorio balanceado.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre texto en ingles, formato SST-2.
- Inferencia via `AutoModelForSequenceClassification` de Transformers con `trust_remote_code=True`.
- Carga modular mediante la API `neuralops.hub.bert_zoo.load_pretrained_bert` y `load_surgeried_model`.
- Serializacion de solo pesos de atencion, pensada para auditar el mecanismo `gla_attention`.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modo de razonamiento.
- Capacidad multilingue: no disponible (solo ingles).

## Casos de uso

- Investigacion sobre atencion subcuadratica: servir de referencia reproducible para medir el coste de sustituir MHA por `gla_attention` en un encoder BERT, comparando curvas de perdida y precision frente al profesor.
- Auditoria del protocolo de destilacion NeuralOps: el checkpoint permite reproducir el pipeline de dos etapas (alineacion de subespacio + KL/CE) y verificar el consumo de VRAM y el throughput reportados.
- Pruebas de integracion de la libreria `neuralops`: validar el shim `modeling_neuralops_bert.py`, la carga modular de pesos de atencion y la API `load_surgeried_model` en un entorno controlado.
- Benchmarking de serializacion eficiente: estudiar el ahorro de almacenamiento (~55 MB frente a ~450 MB de BERT-base completo) y el coste de reconstruccion en tiempo de carga.
- Docencia y divulgacion: ejemplo minimo de como se sustituye un bloque de atencion en un transformer preentrenado y que implica hacerlo sin reentrenar el resto de la red.
- Deteccion de fallos en pipelines de destilacion: el modelo es un caso claro de destilacion que converge en perdida sin aprender la tarea, util como test negativo para validar metricas y alertas.
- No es adecuado para analisis de sentimiento en produccion, atencion al cliente ni clasificacion de resenas reales, dada su precision proxima al azar.

## Benchmarks y rendimiento

Evaluacion publicada por el autor sobre el split de validacion de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`gla_attention`) | Estudiante post-KD | Delta |
|---|---|---|---|---|
| Precision SST-2 | 91,63 % | 47,48 % | 49,89 % | +2,41 pp |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,7052 | — |

Telemetria de entrenamiento:

| Metrica | Valor |
|---|---|
| GPU | NVIDIA GeForce RTX 3090 24 GB |
| Duracion del entrenamiento | 92,9 s |
| Pasos de optimizacion | 21 |
| Throughput efectivo | 1851,6 tokens/s |
| Pico de VRAM | 23 021 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el modelo completo en FP32 ocupa aproximadamente 440 MB (110 M parametros); en FP16, unos 220 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, A100, H100). El autor uso una RTX 3090 para el entrenamiento.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en CPU para inferencia puntual.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y la libreria `neuralops`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; solo el throughput de entrenamiento (1851,6 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-gla-attention-sst2` | 110 M (solo ~55 MB serializados) | 512 | 49,89 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` (referencia de la tarea) | 110 M | 512 | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |
| Alternativas con atencion lineal (p. ej. variantes Longformer/Performer) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa relevante es contra el propio profesor: la sustitucion de atencion y la destilacion en 21 pasos degradan la precision en 41,74 puntos porcentuales, lo que sitúa al modelo por debajo de un clasificador trivial que prediga siempre la clase mayoritaria en SST-2 (aproximadamente 50,9 % en el split de validacion).

## Limitaciones y advertencias

- Precision del 49,89 % en SST-2: el modelo no ha aprendido la tarea y su rendimiento es equivalente al azar. No debe usarse para clasificacion de sentimiento real.
- Entropia cruzada de validacion de 0,7052, muy superior a la del profesor (0,2428), lo que indica una calibracion pobre.
- Entrenamiento de solo 21 pasos: insuficiente para adaptar un mecanismo de atencion nuevo; los resultados no permiten concluir nada sobre la viabilidad de `gla_attention` en si.
- Requiere `trust_remote_code=True` y ejecuta codigo remoto (`modeling_neuralops_bert.py`); conviene auditar ese codigo antes de cargarlo en entornos sensibles.
- Dependencia de la libreria `neuralops`, poco extendida; no hay soporte documentado en ecosistemas estandar de despliegue (vLLM, TGI, llama.cpp).
- Solo ingles y contexto de 512 tokens; no apto para documentos largos ni para uso multilingue.
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` esta bajo Apache 2.0 y el codigo remoto debe revisarse por separado.
- Riesgo de alucinacion: no aplica en sentido generativo (es un clasificador), pero si puede producir etiquetas con alta confianza y baja fiabilidad.
- Sesgos: no se documenta ninguna evaluacion de sesgo; al heredar el vocabulario y los pesos de BERT-base, arrastra los sesgos del corpus original.
- El repositorio tiene 80 descargas y 0 likes en el momento de la consulta; es un artefacto de investigacion sin validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-gla-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue

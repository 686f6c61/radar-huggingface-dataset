# Hooshaai/bert-adaptive-svd-attention-sst2

## Resumen

`Hooshaai/bert-adaptive-svd-attention-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que los bloques de atencion softmax cuadratica de las 12 capas del transformer se han sustituido por el mecanismo `adaptive_svd_attention` de la libreria NeuralOps. El modelo se ha afinado y destilado para la tarea SST-2 del benchmark GLUE (clasificacion binaria de sentimiento en ingles), y se distribuye como pesos modulares de solo atencion en FP16 (aproximadamente 55 MB) mas una cabeza de clasificacion, en lugar del checkpoint completo de BERT.

El objetivo declarado es demostrar que una atencion subcuadratica (complejidad efectiva O(N) u O(N log N) frente a O(N^2) de la MHA estandar) puede recuperar buena parte del rendimiento del profesor mediante destilacion de representaciones en cache, sin asignar VRAM al profesor durante el entrenamiento. El autor reporta un 82,45 % de accuracy en el split de validacion de SST-2 tras la destilacion, frente al 91,63 % del profesor BERT-base y al 51,03 % del estudiante antes de la destilacion.

Es relevante ahora como referencia practica para quien investigue atencion eficiente y destilacion: el modelo es pequeno, el entrenamiento es reproducible en una unica RTX 3090 y la licencia MIT facilita su reutilizacion. No obstante, conviene tratarlo como un experimento de investigacion acotado a una tarea, no como un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atencion `adaptive_svd_attention` en las 12 capas (sustituye a la MHA softmax cuadratica) |
| Parametros totales | 110 M (base BERT-base); pesos distribuidos: solo atencion + cabeza de tarea, ~55 MB en FP16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-base admite 512 tokens; no se especifica en la model card para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16) + codigo remoto `modeling_neuralops_bert.py`; requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M de parametros) y reemplaza en todas las capas el bloque de atencion multi-cabeza estandar por `adaptive_svd_attention`, un mecanismo de la NeuralOps Library que descompone la atencion mediante SVD adaptativa y reduce la complejidad operativa efectiva a O(N) u O(N log N). La serializacion es modular: solo se publican los pesos de atencion entrenados y la cabeza de clasificacion en FP16 (~55 MB); los pesos congelados del BERT base se inicializan en tiempo de carga desde `bert-base-uncased` mediante un shim de codigo remoto.

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol en dos etapas: primero una alineacion de subespacios ocultos y despues una combinacion de KL sobre logits y entropia cruzada de la tarea. El profesor se ejecuta offline y sus representaciones se cachean, de modo que no ocupa VRAM durante el entrenamiento del estudiante. El autor reporta 121 pasos de optimizacion, 54,9 s de entrenamiento, 18.061,7 tokens/s de throughput efectivo y un pico de 7.422 MB de VRAM en una RTX 3090 de 24 GB. No se detalla el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de GLUE/SST-2.

## Capacidades

- Clasificacion binaria de sentimiento en ingles (positivo/negativo) sobre texto de entrada, con salida de logits de dos clases.
- Razonamiento semantico ligero a nivel de secuencia, heredado del preentrenamiento de BERT-base y ajustado en SST-2.
- Procesamiento de secuencias con atencion subcuadratica, lo que en teoria permite escalar mejor con la longitud de entrada que la MHA estandar (el autor no publica mediciones de latencia por longitud).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles (el vocabulario y el ajuste son de `bert-base-uncased`).
- No es un modelo generativo: no produce texto libre, solo etiquetas de clasificacion.

## Casos de uso

- Analisis de sentimiento en resenas de producto o Opiniones de clientes en ingles: el modelo clasifica cada resena en positiva o negativa con un accuracy reportado del 82,45 % en SST-2, suficiente para triaje automatico y priorizacion de casos en un pipeline de soporte.
- Monitorizacion de reputacion en redes sociales: clasificacion por lotes de menciones en ingles para detectar picos de sentimiento negativo y activar alertas, con un coste de inferencia bajo gracias al checkpoint de ~55 MB.
- Filtrado previo en pipelines de moderacion: usar la salida de sentimiento como senal auxiliar para enrutar comentarios hacia revision humana o hacia modelos mayores, reduciendo el volumen que llega a etapas costosas.
- Investigacion en atencion eficiente: servir como punto de comparacion reproducible frente a BERT-base estandar en tareas de clasificacion, dado que el autor publica la telemetria de entrenamiento y el protocolo de destilacion.
- Experimentos de destilacion con profesor en cache: reutilizar el protocolo descrito (alineacion de subespacios + KL sobre logits) para adaptar otros mecanismos de atencion subcuadratica a tareas GLUE, ya que el entrenamiento cabe en una sola GPU de consumo.
- Docencia y prototipado rapido: cargar el modelo con `trust_remote_code=True` en un cuaderno para ilustrar el intercambio entre eficiencia asintotica y precision empirica en arquitecturas transformer.
- Clasificacion de sentimiento en entornos con VRAM limitada: el peso descargable de ~55 MB y el pico de 7,4 GB durante el entrenamiento lo hacen viable en GPUs de gama media para inferencia.

## Benchmarks y rendimiento

Evaluacion publicada por el autor sobre el split de validacion de GLUE SST-2 (872 muestras de clasificacion binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy GLUE SST-2 | 91,63 % | 51,03 % | 82,45 % | +31,42 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,4462 | no disponible |

Telemetria de entrenamiento reportada: 121 pasos, 54,9 s, 18.061,7 tokens/s, pico de 7.422 MB de VRAM en RTX 3090. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint de atencion ocupa ~55 MB en FP16 y el base BERT-base congelado se carga aparte (el repo completo pesa 0,4 GB).
- Entrenamiento validado en una NVIDIA GeForce RTX 3090 (24 GB), con pico de 7.422 MB y 54,9 s de duracion.
- Cabe en GPUs de consumo: por el pico de memoria reportado, es viable en tarjetas con al menos 8 GB de VRAM, aunque el autor solo documenta la RTX 3090.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` y `trust_remote_code=True`; API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput de inferencia: no disponibles; solo se publica throughput de entrenamiento (18.061,7 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-adaptive-svd-attention-sst2` | 110 M (base) | no disponible | 82,45 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, `transformers` estandar |
| Alternativas de atencion eficiente sobre BERT | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados en la informacion proporcionada para comparar con otros checkpoints de la NeuralOps Attention Zoo ni con variantes subcuadraticas equivalentes.

## Limitaciones y advertencias

- El accuracy destilado (82,45 %) queda 9,18 puntos por debajo del profesor BERT-base (91,63 %); no es un sustituto directo en produccion donde se exija maxima precision.
- Entrenado exclusivamente en SST-2 (ingles); el rendimiento fuera de dominio o en otros idiomas no esta caracterizado.
- Modelo de clasificacion binaria: no genera texto ni soporta tareas generativas, tool calling o agentes.
- Requiere `trust_remote_code=True` y ejecuta codigo remoto (`modeling_neuralops_bert.py`); conviene auditar ese codigo antes de desplegarlo en produccion.
- La serializacion modular depende de `bert-base-uncased` como base congelada; si ese repositorio cambia o no esta disponible, la carga puede fallar.
- No se documentan sesgos especificos, pero al heredar el preentrenamiento de `bert-base-uncased` arrastra los sesgos de su corpus, no caracterizados por el autor.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de calibracion: la entropia cruzada de validacion (0,4462) es notablemente superior a la del profesor (0,2428), lo que sugiere confianza menos calibrada.
- La licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` se distribuye bajo Apache 2.0; conviene verificar el cumplimiento de ambas.
- El modelo tiene 81 descargas y 0 likes en el momento de la ficha; no hay validacion independiente de los resultados reportados.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-adaptive-svd-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue

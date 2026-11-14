# Hooshaai/bert-refined-landmark-attention-sst2

## Resumen

`bert-refined-landmark-attention-sst2` es un checkpoint de BERT-Base (110 M de parametros) en el que se han sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por el mecanismo `refined_landmark_attention` de la libreria NeuralOps. Lo publica el usuario Hooshaai (autor del software: Taha Majlesi) como parte de un "Attention Zoo" de variantes subcuadraticas de BERT evaluadas sobre GLUE. El objetivo es demostrar que es posible reemplazar la atencion cuadratica por una de complejidad efectiva O(N) u O(N log N) y recuperar buena parte del rendimiento del modelo original mediante destilacion de representaciones en cache.

El modelo se ha afinado y destilado exclusivamente para la tarea SST-2 (clasificacion binaria de sentimiento en ingles) del benchmark GLUE. No es un modelo generativo ni un encoder de proposito general: es un clasificador de secuencias con una cabeza de dos clases. El checkpoint publicado contiene unicamente los pesos de atencion y la cabeza de clasificacion en FP16 (`attention_weights.safetensors`, ~55 MB); los pesos congelados del BERT base se descargan aparte desde `google-bert/bert-base-uncased` y se combinan en tiempo de carga mediante un shim de codigo remoto.

Su relevancia es fundamentalmente experimental: sirve como referencia reproducible de como se comporta una atencion subcuadratica destilada frente al profesor cuadratico (91,63 % de accuracy del profesor frente a 79,82 % del estudiante destilado en la validacion de SST-2), y como ejemplo de serializacion modular de solo atencion dentro del ecosistema NeuralOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atencion `refined_landmark_attention` (subcuadratica) en las 12 capas |
| Parametros totales | 110 M (BERT-Base); el repo solo almacena los pesos de atencion y la cabeza de clasificacion (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-Base estandar: 512 tokens, no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16, solo atencion + cabeza) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza la multi-head attention estandar de las 12 capas por `refined_landmark_attention`, un mecanismo de atencion con landmarks que reduce la complejidad operativa efectiva de O(N²) a O(N) u O(N log N). La serializacion es modular: solo se guardan los parametros de atencion entrenados y el adaptador de tarea, y el shim `modeling_neuralops_bert.py` inicializa los pesos base congelados desde el checkpoint original de BERT y aplica encima los pesos destilados.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol", una destilacion en dos etapas: primero alineacion de subespacio oculto y despues KL sobre logits combinada con entropia cruzada de la tarea. El protocolo cachea offline las representaciones del profesor, de modo que no consume VRAM del profesor durante el entrenamiento. Se ejecuto en una NVIDIA GeForce RTX 3090 (24 GB), con 139 pasos de optimizacion, 52,7 s de duracion total, throughput efectivo de 21.613,1 tokens/s y un pico de VRAM de 13.298 MB. El dataset de entrenamiento y evaluacion es la tarea SST-2 de GLUE.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en ingles sobre secuencias de texto.
- Encoder de representaciones contextuales de BERT-Base con atencion subcuadratica, reutilizable como extractor de features para tareas de clasificacion.
- Inferencia estandar via `transformers.AutoModelForSequenceClassification` con `trust_remote_code=True`.
- Carga modular via la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No soporta generacion de texto, tool calling, razonamiento multi-paso, agentes, vision ni audio.
- Multilingue: no; solo ingles.
- No dispone de modo "thinking" ni capacidades especiales mas alla de la clasificacion.

## Casos de uso

- Analisis de sentimiento en resenas de producto o comentarios de usuarios en ingles: el modelo devuelve una etiqueta binaria por secuencia y puede desplegarse como microservicio de clasificacion con latencia baja gracias a sus 110 M de parametros.
- Filtrado y moderacion de tono en pipelines de contenido: clasificar automaticamente comentarios negativos para revision humana, aprovechando el bajo coste de inferencia de un encoder pequeno.
- Investigacion sobre atencion subcuadratica: servir como baseline reproducible para comparar `refined_landmark_attention` con otras variantes del Attention Zoo de NeuralOps sobre la misma tarea y split.
- Docencia y experimentacion con destilacion de representaciones: el protocolo de cache offline y las dos etapas (alineacion de subespacio + KL/CE) son un ejemplo didactico de destilacion sin VRAM del profesor.
- Evaluacion de tecnicas de serializacion modular: util para probar flujos de carga que combinan pesos base congelados con adaptadores de atencion en FP16.
- Prototipado rapido de clasificadores de texto en entornos con recursos limitados: el checkpoint de ~55 MB mas el BERT base (~450 MB) cabe en cualquier GPU consumer e incluso en CPU para lotes pequenos.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de GLUE SST-2 (872 muestras de clasificacion binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 50,92 % | 79,82 % | +28,90 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,4396 | convergida |

Telemetria de entrenamiento (RTX 3090, 24 GB): 139 pasos, 52,7 s, 21.613,1 tokens/s, pico de VRAM 13.298 MB.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP16 ocupa aproximadamente 220 MB (110 M de parametros); en FP32, unos 440 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento documentado se hizo en una RTX 3090, pero la inferencia funciona en GTX 1650, RTX 3060, RTX 4090, A100 o H100 sin problema.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas; tambien es viable en CPU para lotes pequenos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el codigo remoto de NeuralOps), API `neuralops.hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un encoder de clasificacion no es el caso de uso habitual de esos motores.
- Latencia y throughput: no se publican cifras de inferencia; solo el throughput de entrenamiento (21.613,1 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-refined-landmark-attention-sst2` (este) | 110 M | no disponible | 79,82 % (validacion) | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 110 M | 512 | 91,63 % (validacion) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |
| Otras variantes del Attention Zoo de NeuralOps | 110 M | no disponible | no disponible | MIT | Hugging Face (org `tahamajs`) |

## Limitaciones y advertencias

- El modelo solo realiza clasificacion binaria de sentimiento en ingles; no es un modelo de proposito general ni genera texto.
- La accuracy destilada (79,82 %) esta muy por debajo del profesor (91,63 %): una diferencia de casi 12 puntos porcentuales que lo hace poco adecuado para produccion con requisitos de precision altos.
- El estudiante pre-KD estaba practicamente al azar (50,92 %), lo que indica que el mecanismo de atencion subcuadratica sin destilacion no aprende bien la tarea por si solo; la calidad depende criticamente del protocolo de destilacion.
- Requiere `trust_remote_code=True` y la libreria `neuralops`, lo que implica ejecutar codigo remoto del autor y anade dependencias no estandar al stack de despliegue.
- El repo solo contiene pesos de atencion y cabeza; es necesario descargar `bert-base-uncased` aparte, lo que complica el versionado y la reproducibilidad en entornos aislados.
- Sesgos y alucinacion: no se documentan sesgos especificos; al ser un clasificador binario, el riesgo de "alucinacion" se traduce en falsos positivos/negativos, no en texto inventado.
- Licencia MIT permite uso comercial, pero el modelo base BERT tiene licencia Apache 2.0 y conviene verificar la compatibilidad en despliegues comerciales.
- Fecha de creacion del repo (2026-11-09) y autor con muy pocas descargas (64) y cero likes: madurez y soporte comunitario limitados.
- No se documenta la longitud de contexto efectiva del mecanismo de atencion subcuadratico ni su comportamiento mas alla de SST-2.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-refined-landmark-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/sst2

# Hooshaai/bert-rpc-attention-sst2

## Resumen

`Hooshaai/bert-rpc-attention-sst2` es un checkpoint de BERT-Base (110M parámetros) en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `rpc_attention` de la librería NeuralOps, con complejidad operativa efectiva subcuadrática (O(N) u O(N log N) frente a O(N²)). Lo desarrolla Taha Majlesi (organización Hooshaai/tahamajs) como parte del denominado "Subquadratic Attention Zoo", un conjunto de variantes de atención preentrenadas y destiladas sobre la suite GLUE.

El modelo está especializado en clasificación binaria de sentimiento (tarea SST-2 de GLUE) y se distribuye como un adaptador de solo atención más cabecera de clasificación en FP16 (~55 MB), no como pesos completos. La base BERT congelada (`google-bert/bert-base-uncased`) se reconstruye en tiempo de carga mediante un shim de código remoto, lo que reduce drásticamente la huella de descarga frente a los ~450 MB del modelo base completo.

Su relevancia es fundamentalmente metodológica: demuestra que es posible destilar un mecanismo de atención subcuadrático sobre una arquitectura preentrenada estándar y recuperar buena parte del rendimiento del profesor (81,88 % de accuracy frente al 91,63 % del BERT original) en solo 230 pasos de optimización y 51,9 segundos sobre una RTX 3090. Es un artefacto de investigación, no un modelo listo para producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `rpc_attention` subcuadrática en las 12 capas |
| Parámetros totales | 110M (base BERT-Base); se distribuyen solo pesos de atención y cabecera (~55 MB FP16) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de BERT-Base: 512 tokens, no confirmado en la model card) |
| Tipos de cuantización | FP16 en los pesos distribuidos; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, serialización `attention_only_fp16`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT-Base estándar (12 capas, 768 de dimensión oculta, 12 cabezas) en el que el mecanismo de self-attention cuadrático se reemplaza por `rpc_attention`, que según la model card alcanza complejidad efectiva O(N) u O(N log N). El modelo base permanece congelado: solo se entrenan y serializan los parámetros de atención y la cabecera de clasificación de la tarea.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol", una destilación en dos etapas: primero una alineación de subespacio oculto (Stage 1) y después una combinación de KL sobre logits y entropía cruzada de la tarea (Stage 2). El profesor es `bert-base-uncased` y las representaciones se cachean offline, de modo que no ocupa VRAM durante el entrenamiento. Se ejecutó en una NVIDIA GeForce RTX 3090 de 24 GB durante 51,9 s, con 230 pasos de optimización, un throughput efectivo de 36.338,1 tokens/s y un pico de VRAM de 7.726 MB. El conjunto de datos es la tarea SST-2 de GLUE.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, especializada en la tarea SST-2.
- Atención subcuadrática con coste teórico O(N) u O(N log N), orientada a secuencias largas.
- Carga modular: reconstruye el BERT base congelado y aplica los pesos de atención destilados en tiempo de ejecución.
- Integración con la API de alto nivel de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés.
- No es un modelo generativo: no produce texto libre, solo logits de clasificación.

## Casos de uso

- Análisis de sentimiento en reseñas de producto o comentarios: el modelo clasifica frases en inglés en positivo/negativo con una accuracy de referencia del 81,88 % en SST-2, suficiente para triaje automatizado de opiniones a gran escala.
- Filtrado de feedback de usuarios en pipelines de soporte: se puede usar como clasificador previo que etiquete tickets o mensajes como queja o satisfacción antes de enrutarlos a un agente humano.
- Investigación sobre atención eficiente: sirve como checkpoint de referencia para comparar mecanismos subcuadráticos frente a atención softmax estándar en tareas de clasificación.
- Reproducción de experimentos de destilación: el protocolo de dos etapas y el bajo coste de entrenamiento (52 s en una RTX 3090) lo hacen útil para validar técnicas de knowledge distillation.
- Prototipado rápido en entornos con poca VRAM: gracias a su huella de ~55 MB y a la reconstrucción del base congelado, se puede desplegar en GPUs de consumo modestas para pruebas de concepto.
- Benchmarking de la librería NeuralOps: permite medir el rendimiento del ecosistema `neuralops` y de la API de carga modular frente a implementaciones estándar de Hugging Face.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`rpc_attention`) | Modelo destilado post-KD |
|---|---|---|---|
| Accuracy GLUE SST-2 | 91,63 % | 51,26 % | 81,88 % |
| Entropía cruzada de validación | 0,2428 | No calibrada | 0,5112 |

El delta de accuracy tras la destilación es de +30,62 puntos porcentuales, con una brecha final de 9,75 puntos frente al profesor. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió un pico de 7.726 MB en una RTX 3090. Para inferencia en FP16 con el BERT base completo se puede estimar en torno a 1-2 GB, aunque la cifra exacta no está documentada.
- GPU recomendadas: NVIDIA GeForce RTX 3090 (la usada en el entrenamiento); cualquier GPU Ampere o superior con al menos 8 GB es suficiente en la práctica.
- Cabe en GPUs de consumo: sí, previsiblemente en RTX 3060/3070/4060 y superiores, dado el tamaño del base BERT y la huella de 55 MB de pesos distribuidos.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: durante el entrenamiento se alcanzaron 36.338,1 tokens/s en una RTX 3090; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-rpc-attention-sst2` | 110M (base) | No disponible | 81,88 % | MIT | Hugging Face (repo pequeño, ~55 MB) |
| `google-bert/bert-base-uncased` (profesor) | 110M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face |
| Otros modelos SST-2 de referencia | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada; la única comparación documentada es contra el profesor BERT-Base.

## Limitaciones y advertencias

- Brecha de rendimiento frente al profesor: 81,88 % frente a 91,63 % de accuracy en SST-2, casi 10 puntos por debajo.
- Especialización estrecha: solo clasificación binaria de sentimiento en inglés; no sirve para generación, razonamiento ni otras tareas sin reentrenamiento.
- Riesgo de alucinación bajo en clasificación, pero el modelo puede producir etiquetas erróneas en dominios alejados de SST-2 (reseñas de películas).
- Sesgos heredados de `bert-base-uncased` y del corpus SST-2; no se documenta ninguna mitigación.
- Limitación de idioma: solo inglés; no se garantiza comportamiento en castellano u otros idiomas.
- Dependencia de código remoto (`trust_remote_code=True`): requiere ejecutar `modeling_neuralops_bert.py` del autor, lo que implica revisar el código antes de usarlo en producción.
- Repositorio con muy poca tracción (60 descargas, 0 likes) y creado en 2026; no hay evidencia de mantenimiento ni de validación independiente.
- Licencia MIT permisiva para uso comercial, pero el modelo base subyacente (`bert-base-uncased`) tiene su propia licencia Apache 2.0 que debe respetarse.
- Los pesos distribuidos son solo de atención y cabecera; la reconstrucción depende de la disponibilidad de `bert-base-uncased` en el Hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-rpc-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE (SST-2): https://huggingface.co/datasets/glue

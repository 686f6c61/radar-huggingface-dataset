# Hooshaai/bert-positive-kernel-linear-attention-sst2

## Resumen

BERT-Base con atención lineal de kernel positivo (`positive_kernel_linear_attention`) es un checkpoint derivado de `google-bert/bert-base-uncased` en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por un mecanismo de atención subcuadrática de complejidad efectiva O(N) u O(N log N). Lo desarrolla Taha Majlesi dentro del proyecto NeuralOps (attention zoo), y se distribuye como un adaptador de solo atención más cabeza de clasificación en FP16 de aproximadamente 55 MB, que se recombina en tiempo de carga con los pesos congelados del BERT base original.

El modelo está ajustado y evaluado sobre la tarea SST-2 del benchmark GLUE (clasificación binaria de sentimiento en inglés) mediante un protocolo de destilación por representaciones cacheadas en el que el profesor no consume VRAM en línea. El resultado es un checkpoint de investigación que sirve como sonda empírica del comportamiento de mecanismos de atención subcuadrática en un transformer preentrenado estándar, no como un clasificador de sentimiento listo para producción.

Su relevancia actual es metodológica: demuestra el flujo de serialización modular de solo atención de NeuralOps y publica telemetría de entrenamiento concreta (169 pasos, 53 s, 26 134 tokens/s en una RTX 3090), pero la precisión alcanzada en SST-2 (49,20 %) está muy por debajo del profesor (91,63 %) y apenas supera la línea base aleatoria de una clasificación binaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atención `positive_kernel_linear_attention` (subcuadrática) en las 12 capas |
| Parámetros totales | ~110 M (BERT-Base); el repo solo almacena atención + cabeza de clasificación (~55 MB en FP16) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base admite 512 tokens; el autor no especifica el contexto efectivo tras el cambio de atención) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16) + código remoto (`modeling_neuralops_bert.py`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, ~110 M parámetros) y reemplaza la atención multi-cabeza softmax cuadrática por un mecanismo de atención lineal basado en kernel positivo, con coste operativo declarado de O(N) u O(N log N) frente a O(N²). Los pesos del BERT base permanecen congelados y se inicializan desde el Hub en el momento de la carga; el repositorio solo contiene los parámetros de atención destilados y la cabeza de clasificación de la tarea, serializados en FP16 (~55 MB) mediante la especificación de serialización modular de NeuralOps.

El entrenamiento sigue el protocolo "NeuralOps Cached Representation Distillation": primero una etapa de alineación de subespacio oculto y después una etapa combinada de KL sobre logits y entropía cruzada de tarea. Se ejecutó en una NVIDIA GeForce RTX 3090 de 24 GB con 169 pasos de optimización, 53,0 s de duración total, 26 134,4 tokens/s de throughput efectivo y un pico de VRAM de 10 779 MB, sin asignación de VRAM para el profesor gracias al cacheado offline de representaciones. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de GLUE/SST-2, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Clasificación binaria de sentimiento en inglés (etiquetas 0 = negativo, 1 = positivo) sobre la tarea SST-2 de GLUE.
- Extracción de representaciones con atención subcuadrática, útil para estudiar el comportamiento de mecanismos lineales en capas preentrenadas.
- Carga modular mediante `neuralops.hub.bert_zoo.load_pretrained_bert` y `neuralops.hub.load_surgeried_model`, que reconstruyen el modelo completo aplicando los pesos de atención sobre el BERT base.
- Compatibilidad con la API estándar de Hugging Face `AutoModelForSequenceClassification` con `trust_remote_code=True`.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio, modo thinking ni capacidades multilingües más allá del inglés.

## Casos de uso

- Investigación sobre atención subcuadrática: usar el checkpoint como sonda para medir cómo se degrada una tarea de clasificación al sustituir atención softmax por atención lineal de kernel positivo en un BERT preentrenado, comparando contra el profesor con el mismo split de validación.
- Reproducción de experimentos de destilación: el protocolo de representaciones cacheadas permite repetir el entrenamiento en una única GPU de consumo (RTX 3090) sin necesidad de mantener el profesor en memoria, lo que facilita la replicación académica.
- Evaluación de infraestructura NeuralOps: sirve para validar el flujo de serialización de solo atención, la carga con código remoto y la recombinación con pesos base congelados antes de escalar a otros modelos del zoo.
- Benchmarking de eficiencia de atención: comparar latencia y uso de memoria del mecanismo lineal frente a la atención cuadrática de BERT-Base en secuencias largas, midiendo el punto a partir del cual la ventaja asintótica se traduce en ganancia real.
- Docencia y formación: ejemplo compacto (~55 MB de pesos descargables) para ilustrar destilación, atención lineal y modularidad de checkpoints en cursos de NLP.
- Pruebas de integración de código remoto: validar pipelines que cargan modelos con `trust_remote_code=True` y dependencias de la librería `neuralops` en entornos controlados.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Exactitud SST-2 | 91,63 % | 51,03 % | 49,20 % | -1,83 % (respecto al pre-KD) |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,7050 | no disponible |

Telemetría de entrenamiento (clúster Sharif HPC, RTX 3090 24 GB): 53,0 s de duración, 169 pasos de optimización, 26 134,4 tokens/s de throughput efectivo y 10 779 MB de VRAM pico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo requiere cargar BERT-Base (~110 M parámetros) más los pesos de atención en FP16 (~55 MB); en FP16 el conjunto ronda los 220-250 MB de pesos, con overhead adicional de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia en FP16; el entrenamiento documentado se realizó en una RTX 3090 de 24 GB con un pico de 10 779 MB.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y la librería `neuralops`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; solo se conoce el throughput de entrenamiento (26 134,4 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (exactitud) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/bert-positive-kernel-linear-attention-sst2 | ~110 M (solo atención + cabeza, ~55 MB) | no disponible | 49,20 % | MIT | Hugging Face, requiere `neuralops` |
| google-bert/bert-base-uncased (profesor, ajustado a SST-2) | ~110 M | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, `transformers` estándar |
| BERT-Base con atención softmax cuadrática (cualquier checkpoint SST-2 de la comunidad) | ~110 M | 512 tokens | típicamente >90 % en SST-2 | variable | Hugging Face |

La comparación se limita al profesor declarado por el autor; no se dispone de datos de otros modelos con atención lineal equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo en la tarea objetivo: 49,20 % de exactitud en SST-2 frente al 91,63 % del profesor, prácticamente equivalente a una clasificación aleatoria en un problema binario; no es apto para uso en producción como clasificador de sentimiento.
- El delta de -1,83 % respecto al estudiante pre-KD indica que la destilación no recuperó la capacidad del modelo base; el autor lo etiqueta como "subquadratic probe", no como checkpoint final.
- Solo inglés: no hay evidencia de capacidades multilingües.
- Requiere `trust_remote_code=True` y la librería `neuralops`, lo que introduce dependencia de código remoto y superficie de riesgo en entornos de producción.
- El repositorio no incluye los pesos completos de BERT-Base; la carga depende de descargar `bert-base-uncased` desde el Hub, con la consiguiente dependencia de red y de la disponibilidad de ese modelo.
- No se documentan sesgos específicos, pero al derivar de `bert-base-uncased` hereda los sesgos del corpus original (BookCorpus y Wikipedia en inglés).
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de calibración deficiente: la entropía cruzada de validación (0,7050) es alta en relación con la exactitud.
- Licencia MIT permite uso comercial, pero el estado experimental del checkpoint desaconseja cualquier despliegue real.
- No se especifican la longitud de contexto efectiva tras el cambio de atención ni el comportamiento en secuencias largas, que es precisamente el régimen donde la atención lineal debería aportar ventajas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-positive-kernel-linear-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/sst2

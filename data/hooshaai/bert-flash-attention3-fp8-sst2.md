# Hooshaai/bert-flash-attention3-fp8-sst2

## Resumen

`bert-flash-attention3-fp8-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` en el que el autor (Hooshaai, identificado en la model card como Taha Majlesi) ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por un mecanismo denominado `flash_attention3_fp8`, implementado en su librería NeuralOps. El modelo se ha afinado sobre la tarea SST-2 del benchmark GLUE mediante un protocolo de destilación por representaciones cacheadas (Cached Representation Distillation) que evita mantener el profesor en VRAM durante el entrenamiento.

La propuesta es fundamentalmente metodológica: demostrar que es posible reemplazar la atención estándar por una variante subcuadrática (complejidad efectiva O(N) u O(N log N)) y recuperar, vía destilación, la precisión del modelo original. El autor reporta un 92,78 % de accuracy en el split de validación de SST-2 (872 muestras), frente al 91,63 % atribuido al profesor `bert-base-uncased`.

El repositorio no contiene los pesos completos del modelo base, sino únicamente los pesos de atención y la cabeza de clasificación en FP16 (~55 MB), que se combinan en tiempo de carga con los pesos congelados de `bert-base-uncased` descargados aparte. Está pensado como pieza de un "attention zoo" de variantes de atención preentrenadas sobre GLUE, no como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención sustituida por `flash_attention3_fp8` (subcuadrática, O(N) u O(N log N)) |
| Parametros totales | 110M (heredados de BERT-base; el repo solo almacena los pesos de atención y la cabeza, ~55 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (BERT-base soporta hasta 512 tokens; el autor no especifica el máximo usado en entrenamiento) |
| Tipos de cuantizacion | Pesos en FP16 (`attention_only_fp16`); no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`), con código remoto (`modeling_neuralops_bert.py`) y `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas, ~110M parámetros) y reemplaza en todas las capas el mecanismo de multi-head attention con softmax cuadrática por `flash_attention3_fp8`, una variante de atención subcuadrática de la NeuralOps Library. El autor declara complejidad operativa efectiva O(N) u O(N log N) frente a O(N²), aunque no se aportan detalles del algoritmo interno (kernel, aproximación, tratamiento de máscaras) ni mediciones de latencia o memoria que respalden esa ganancia en la práctica.

El entrenamiento se realizó sobre SST-2 (GLUE) con el protocolo NeuralOps Cached Representation Distillation en dos etapas: primero alineación de subespacio oculto y después KL sobre logits más entropía cruzada de la tarea, con un total de 226 pasos de optimización. Según la telemetría del autor, la destilación se ejecutó en una RTX 3090 (24 GB) durante 47,4 s, con un throughput de 39.076,1 tokens/s y un pico de VRAM de 13.512 MB, gracias a que las representaciones del profesor se cachean offline (cero VRAM asignada al profesor durante el entrenamiento). No se documentan volúmenes de datos, hiperparámetros de optimización ni detalles del preentrenamiento del mecanismo de atención más allá de esta fase de destilación.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con una única etiqueta de salida.
- Clasificación de secuencias cortas a medias, heredando el tokenizador y el vocabulario de `bert-base-uncased`.
- Integración con `transformers` mediante `AutoModelForSequenceClassification` y `trust_remote_code=True`.
- Carga modular a través de la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de visión, audio ni modo "thinking".
- Multilingüismo: limitado a inglés; no se reporta evaluación en otros idiomas.
- No se documentan capacidades de extracción de embeddings o de uso como encoder genérico más allá de la cabeza de clasificación incluida.

## Casos de uso

- Análisis de sentimiento de reseñas de producto en inglés: el modelo devuelve directamente una etiqueta binaria sobre el texto tokenizado, adecuado para pipelines de moderación o agregación de opiniones a bajo coste computacional.
- Monitorización de opinión en redes sociales: al ser un modelo de 110M parámetros con pesos de atención de ~55 MB, puede desplegarse en CPU o GPU modesta para clasificar grandes volúmenes de mensajes cortos en tiempo casi real.
- Filtrado previo en pipelines de atención al cliente: clasificar tickets o mensajes entrantes como positivos/negativos para enrutarlos a colas distintas o priorizar casos de insatisfacción.
- Baseline de investigación en eficiencia de atención: sirve como referencia reproducible para comparar variantes subcuadráticas del "attention zoo" de NeuralOps frente a BERT-base estándar en SST-2.
- Evaluación de técnicas de destilación con profesor cacheado: el protocolo descrito (representaciones offline, cero VRAM de profesor) es reutilizable en entornos con una sola GPU de 24 GB para experimentos de knowledge distillation.
- Docencia y prototipado rápido: ejemplo mínimo de sustitución de atención y carga modular de pesos con `trust_remote_code`, útil para demostrar serialización parcial de checkpoints.
- Clasificación de comentarios en foros o documentación técnica en inglés: con contexto de hasta 512 tokens (límite de BERT-base, no confirmado explícitamente por el autor) puede procesar párrafos completos.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, evaluados sobre el split de validación de GLUE SST-2 (872 muestras binarias):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 91,63 % | 92,78 % | +1,15 % |
| Cross-entropy de validación | 0,2428 | no calibrado | 0,2560 | convergido |

Telemetría de entrenamiento declarada: 226 pasos, 47,4 s, 39.076,1 tokens/s, pico de 13.512 MB de VRAM en una RTX 3090.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni mediciones de latencia o throughput en inferencia para la variante `flash_attention3_fp8`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un BERT-base de 110M parámetros en FP16, la huella de pesos ronda los 220 MB, más activaciones y el código remoto de atención.
- El autor reporta un pico de 13.512 MB de VRAM durante el entrenamiento/destilación en una RTX 3090 (24 GB); no se documenta el consumo en inferencia.
- GPU recomendadas: cualquier GPU con al menos ~2-4 GB de VRAM debería bastar para inferencia en FP16; el autor solo cita la RTX 3090 como hardware de referencia.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores, aunque no hay medición publicada que lo confirme.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; API de NeuralOps (`neuralops.hub.bert_zoo`, `neuralops.hub.load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput en inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-flash-attention3-fp8-sst2` | 110M (pesos de atención ~55 MB) | No disponible (base BERT: 512) | 92,78 % (reportado) | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110M | 512 | 91,63 % (reportado por el autor) | Apache 2.0 | Hugging Face, `transformers` estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66M | 512 | No disponible en la información proporcionada | Apache 2.0 | Hugging Face, `transformers` estándar |
| `roberta-base` afinado en SST-2 | 125M | 514 | No disponible en la información proporcionada | MIT | Hugging Face |

La comparación se limita a arquitecturas encoder de tamaño similar; no se dispone de datos de benchmarks homogéneos para el resto de modelos en la información proporcionada, por lo que las cifras de accuracy solo son directamente comparables con las del profesor reportadas por el propio autor.

## Limitaciones y advertencias

- Modelo de un solo dominio y una sola tarea: únicamente clasificación binaria de sentimiento en inglés; no es un modelo de propósito general.
- El autor reporta +1,15 % de accuracy sobre el profesor, pero no se aportan intervalos de confianza ni evaluación sobre el split de test oficial de GLUE, por lo que la mejora debe tomarse con cautela.
- No hay evidencia publicada de que la atención `flash_attention3_fp8` mantenga la calidad en secuencias largas o en otras tareas; la validación se limita a SST-2.
- La afirmación de complejidad subcuadrática no viene acompañada de mediciones de latencia, memoria o throughput en inferencia que la respalden.
- Requiere `trust_remote_code=True` y ejecuta código remoto (`modeling_neuralops_bert.py`) al cargar el modelo; conviene auditar ese código antes de usarlo en producción.
- Dependencia de la descarga de `bert-base-uncased` en tiempo de carga: los pesos base no están incluidos en el repo, lo que añade un paso de red y una dependencia externa.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0; conviene verificar el cumplimiento conjunto.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, sarcásticos o fuera de dominio (el modelo solo ha visto reseñas de SST-2).
- Sesgos heredados del corpus de preentrenamiento de BERT-base y de SST-2 (reseñas de películas), no evaluados por el autor.
- Sin datos sobre robustez ante adversariales, dominios desplazados o texto no inglés.
- Repositorio con muy poca tracción (100 descargas, 0 likes) y creado en 2026; no hay evidencia de mantenimiento ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-flash-attention3-fp8-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
- Cita del autor (BibTeX): `Majlesi, T. (2026). NeuralOps: Pretrained BERT Subquadratic Attention Zoo on GLUE Benchmark`

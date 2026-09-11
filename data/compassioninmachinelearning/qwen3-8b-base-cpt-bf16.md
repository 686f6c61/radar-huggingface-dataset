# CompassioninMachineLearning/Qwen3-8B-Base-CPT-BF16

## Resumen

Qwen3-8B-Base-CPT-BF16 es una revisión de pesos completos en precisión BF16 del modelo Qwen3-8B-Base, publicada por el usuario CompassioninMachineLearning. No se trata de un entrenamiento desde cero, sino de un *continued pretraining* (CPT) mediante adaptadores LoRA de rango reducido (rsLoRA) que posteriormente se fusionaron con la base original fijada en un commit concreto. El resultado son ocho ficheros safetensors que contienen el modelo completo, sin necesidad de cargar adaptadores por separado.

El modelo conserva la arquitectura original de Qwen3-8B (transformer decoder-only con 8.190.735.360 parámetros) y añade las matrices `embed_tokens` y `lm_head` entrenadas de forma independiente. El repositorio expone cuatro revisiones cargables (`epoch-1` a `epoch-4`), cada una correspondiente a una época de entrenamiento, con `main` apuntando a la época 2 (paso 750), que fue el mejor punto de validación registrado durante el entrenamiento.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo práctico de flujo CPT + fusión segura de adaptadores con PEFT sobre una base de 8B en 4 bits. Por otro, presenta una trazabilidad inusualmente detallada (checksums, manifiestos de entrenamiento y de fusión, pruebas de humo de inferencia), lo que permite reproducir el linaje de los pesos. Con cero descargas y cero *likes*, y sin benchmarks publicados, debe considerarse un artefacto experimental más que un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3); pesos completos derivados del modelo base Qwen3-8B-Base |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3-8B-Base, no confirmada para esta revisión) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos BF16. No se incluyen GGUF, GPTQ, AWQ ni FP8 |
| Idiomas soportados | Inglés (en), según la etiqueta de idioma de la model card |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en BF16, repartidos en 8 shards; tamaño del repositorio 16,4 GB |
| Modelo base | Qwen/Qwen3-8B-Base (commit 49e3418fbbbca6ecbdf9608b4d22e5a407081db4) |
| Adaptador de origen | ganscs/Qwen3-8b-qwen-h100-20260909-CPT-LoRA-checkpoints, revision 1586e45fc7c3f7d5e601dc454ba7e15884a2f1df, checkpoint-750 |
| Revisiones disponibles | main (época 2), epoch-1, epoch-2, epoch-3, epoch-4 |
| Metodo de fusion | Safe merge de PEFT sobre 252 capas rsLoRA, con `embed_tokens` y `lm_head` incluidos |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-8B-Base, un transformer decoder-only con normalización previa a la atención y al MLP, atención con RoPE y sesgo QKV. Esta publicación no modifica esa topología: lo que hace es fusionar un adaptador entrenado sobre una copia cuantizada a 4 bits de la base dentro de la base original en BF16. La fusión se realizó con la utilidad *safe merge* de PEFT (no con el exportador de Unsloth), afectando a 252 capas rsLoRA. Adicionalmente, las matrices de embeddings de entrada y la cabeza de lenguaje se entrenaron por separado y se incluyen en el export, algo que no ocurre en una fusión LoRA estándar.

En cuanto al proceso de entrenamiento, se completaron cuatro épocas de 375 pasos cada una (1.500 pasos en total). Las pérdidas de validación registradas durante el entrenamiento del adaptador fueron 1,2472849 (paso 375), 1,2268945 (paso 750), 1,2514912 (paso 1125) y 1,2871689 (paso 1500), lo que sitúa el mínimo en la época 2, seleccionada como revisión `main`. Es importante remarcar que estas cifras se midieron durante el entrenamiento del adaptador sobre una base en 4 bits y no mediante una reevaluación de los exports BF16. El repositorio no detalla la composición del dataset de CPT, el número total de tokens vistos, ni si hubo fases posteriores de RLHF o DPO. La validación del export incluye comprobaciones de valores finitos en BF16, verificación de nombres y formas de todos los tensores, una carga independiente, un *forward* con logits finitos y una generación greedy corta, todo ello documentado en `validation.json`, `merge_manifest.json` y `training_manifest.json`.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Qwen3-8B-Base.
- Modelo de tipo base: no incorpora plantilla de chat ni alineamiento por instrucciones. Aunque el repositorio lleva la etiqueta `conversational`, el punto de partida es un modelo base, por lo que el comportamiento conversacional depende del ajuste posterior que haga el usuario.
- Razonamiento, matemáticas y generación de código: se asumen las capacidades del modelo base, pero no hay evaluación publicada para esta revisión que las cuantifique.
- Tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: la model card declara únicamente inglés. No hay información sobre otros idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- Trazabilidad de pesos: cada época es cargable de forma independiente mediante revisiones de Git, lo que permite comparar el comportamiento entre puntos de control.

## Casos de uso

- Investigación en *continued pretraining*: sirve como referencia reproducible de un flujo CPT con LoRA sobre una base de 8B cuantizada a 4 bits, con manifiestos y checksums que permiten auditar la fusión. Útil para estudiar cómo evoluciona la pérdida de validación entre épocas y qué épocas conviene exportar.
- Adaptación a dominio específico en inglés: al ser un modelo base ya sometido a CPT, es un punto de partida razonable para un ajuste supervisado posterior sobre corpus técnicos, legales o científicos en inglés, sin partir del modelo original.
- Evaluación de olvido catastrófico: comparar `epoch-1` a `epoch-4` contra Qwen/Qwen3-8B-Base permite medir cuánto se degrada el conocimiento general a medida que avanza el CPT, un experimento habitual en estudios de ajuste continuado.
- Generación de texto con decodificación greedy o por muestreo en pipelines batch: el modelo se carga directamente con Transformers y puede integrarse en procesos de generación masiva en inglés, por ejemplo resumen o parafraseo de documentos internos, siempre que se valide la calidad con datos propios.
- Base para *instruction tuning* propio: organizaciones que quieran controlar el dataset de alineamiento pueden partir de esta revisión y aplicar SFT/DPO con sus propios datos, evitando depender de un modelo ya alineado por un tercero.
- Servicio de inferencia autogestionado: al publicarse en BF16 con safetensors y ser compatible con Transformers, TGI y vLLM, encaja en despliegues on-premise donde se exija licencia Apache-2.0 y control total de los pesos.
- Reproducibilidad y auditoría de artefactos: el repositorio documenta el commit exacto de la base, el SHA-256 del adaptador y las sumas de verificación de la fusión, lo que lo convierte en un caso de estudio sobre buenas prácticas de publicación de pesos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar para esta revisión, ni comparaciones con el modelo base original.

Los únicos números publicados corresponden a la pérdida de validación medida durante el entrenamiento del adaptador (no sobre los exports BF16):

| Revision | Paso de entrenamiento | Perdida de validacion en entrenamiento |
|---|---:|---:|
| epoch-1 | 375 | 1,2472849 |
| epoch-2 (main) | 750 | 1,2268945 |
| epoch-3 | 1125 | 1,2514912 |
| epoch-4 | 1500 | 1,2871689 |

Estas cifras no son comparables con métricas de benchmarks y, según la propia model card, no se han verificado mediante una reevaluación independiente de los pesos exportados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: 16,4 GB solo de pesos, más caché KV y activaciones. En la práctica se necesitan del orden de 18 a 22 GB, en función de la longitud de contexto utilizada.
- VRAM estimada en cuantización de 8 bits: alrededor de 9 a 12 GB, incluyendo overhead.
- VRAM estimada en cuantización de 4 bits: alrededor de 6 a 9 GB, según el esquema y el contexto.
- GPU recomendadas para BF16: A100 (40/80 GB), H100, L40S o similares con 24 GB o más. Cabe en RTX 4090 y RTX 3090 (24 GB) de forma ajustada, con contexto moderado.
- GPU de consumo: no cabe en BF16 en tarjetas de 12 o 16 GB. Con cuantización a 8 o 4 bits es viable en RTX 4080/4070 Ti (16 GB) y en RTX 3060 12 GB, siempre que se genere la cuantización por cuenta propia, ya que el repositorio no la incluye.
- Opciones de despliegue: Transformers de forma nativa (`AutoModelForCausalLM` con `torch.bfloat16` y `device_map="auto"`), Text Generation Inference (el repositorio lleva la etiqueta `text-generation-inference`), vLLM y SGLang. Para llama.cpp u Ollama es necesario convertir previamente los pesos a GGUF, algo que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-8B-Base-CPT-BF16 (este) | 8,19 mil millones | No disponible en la informacion proporcionada | Apache-2.0 | HuggingFace, 4 revisiones de epoca, BF16 en safetensors |
| Qwen/Qwen3-8B-Base (origen) | 8,19 mil millones | 32.768 tokens nativos, ampliable con YaRN (dato publico del fabricante) | Apache-2.0 | HuggingFace, pesos BF16 |
| Qwen/Qwen3-8B (instruct) | 8,2 mil millones aprox. | 32.768 tokens nativos, ampliable con YaRN (dato publico del fabricante) | Apache-2.0 | HuggingFace, con alineamiento por instrucciones |
| Llama-3.1-8B-Instruct | 8,03 mil millones aprox. | 128.000 tokens (dato publico del fabricante) | Llama 3.1 Community License | HuggingFace |
| Mistral-7B-v0.3 | 7,25 mil millones aprox. | 32.000 tokens (dato publico del fabricante) | Apache-2.0 | HuggingFace |

Los datos de los modelos comparados proceden de su documentación pública y no se han verificado en la búsqueda web realizada, que no devolvió resultados relevantes. No existen benchmarks publicados que permitan comparar el rendimiento de esta revisión de CPT frente a las alternativas, por lo que la comparación es estructural (tamaño, contexto, licencia y formato de distribución) y no de calidad.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no ha pasado por RLHF, DPO ni SFT. No debe usarse directamente como asistente conversacional sin un ajuste previo; la etiqueta `conversational` del repositorio no implica comportamiento de chat.
- Sin benchmarks: no hay evidencia publicada de que el CPT mejore ninguna capacidad respecto a Qwen3-8B-Base. El único indicador es una pérdida de validación medida durante el entrenamiento del adaptador.
- Metodología de medición de la pérdida: las cifras de validación se obtuvieron entrenando sobre una base en 4 bits y no reevaluando los exports BF16. La model card recomienda explícitamente evaluar las cuatro revisiones por separado.
- Riesgo de olvido catastrófico: el entrenamiento continuado sobre un corpus no especificado puede degradar conocimiento general del modelo base. Conviene comparar contra el modelo original antes de usarlo.
- Composición del dataset desconocida: no se detalla qué datos se usaron en el CPT, su volumen, su procedencia ni su licencia. Esto dificulta evaluar sesgos, contaminación de benchmarks y riesgos legales derivados de los datos de entrenamiento.
- Sesgos conocidos: no documentados en la información proporcionada. Al no conocerse el corpus de CPT, no es posible caracterizar sesgos específicos.
- Riesgo de alucinación: inherente a un modelo base de 8B sin alineamiento. No hay mediciones de fidelidad factual.
- Cobertura de idiomas: solo se declara inglés. El rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior al del inglés.
- Longitud de contexto: no confirmada para esta revisión. Si se requiere contexto largo, hay que verificarlo experimentalmente.
- Licencia: Apache-2.0 permite uso comercial, pero al tratarse de un derivado de Qwen3-8B-Base conviene conservar los avisos de la licencia original y revisar las condiciones de los datos de CPT, que no se detallan.
- Madurez del artefacto: cero descargas y cero *likes* en el momento de la consulta, autor individual sin publicaciones asociadas y sin paper. Es un experimento, no un modelo validado por la comunidad.
- Sin cuantizaciones oficiales: no se publican GGUF, GPTQ ni AWQ, por lo que cualquier despliegue en hardware limitado exige generar la cuantización por cuenta propia y validarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CompassioninMachineLearning/Qwen3-8B-Base-CPT-BF16
- Revisión epoch-1: https://huggingface.co/CompassioninMachineLearning/Qwen3-8B-Base-CPT-BF16/tree/epoch-1
- Revisión epoch-2: https://huggingface.co/CompassioninMachineLearning/Qwen3-8B-Base-CPT-BF16/tree/epoch-2
- Revisión epoch-3: https://huggingface.co/CompassioninMachineLearning/Qwen3-8B-Base-CPT-BF16/tree/epoch-3
- Revisión epoch-4: https://huggingface.co/CompassioninMachineLearning/Qwen3-8B-Base-CPT-BF16/tree/epoch-4
- Repositorio del adaptador LoRA de origen: https://huggingface.co/ganscs/Qwen3-8b-qwen-h100-20260909-CPT-LoRA-checkpoints/tree/1586e45fc7c3f7d5e601dc454ba7e15884a2f1df/checkpoint-750
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base

La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo: los enlaces obtenidos corresponden a un fabricante de automóviles y no guardan relación con esta ficha. No se han localizado papers, blogs técnicos, repositorios de código ni demos asociados.

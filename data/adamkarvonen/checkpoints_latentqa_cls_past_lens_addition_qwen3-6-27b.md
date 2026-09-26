# adamkarvonen/checkpoints_latentqa_cls_past_lens_addition_Qwen3.6-27B

## Resumen
Activation Oracle para Qwen3.6-27B es un adaptador LoRA publicado por adamkarvonen que convierte el modelo base Qwen/Qwen3.6-27B en un "oráculo de activaciones": un modelo capaz de recibir sus propias activaciones internas como entrada y responder preguntas en lenguaje natural sobre ellas. No es un modelo de propósito general, sino un artefacto de investigación en interpretabilidad orientado a leer y describir estados internos de la red.

El adaptador se entrena con una receta combinada de LatentQA, clasificación y predicción de contexto mediante past-lens, y se apoya en la misma metodología que la variante previa sobre Qwen3-8B. Las activaciones se leen de las capas 16, 32 y 48 (25/50/75% de 64 capas) y se inyectan de forma aditiva y con normalización emparejada en la capa 1, sobre los tokens marcadores `" ?"` que siguen al prefijo `Layer: {layer}\n`.

Su relevancia actual es doble: por un lado demuestra que modelos de mayor tamaño producen oráculos de activación más precisos en tareas de clasificación de propiedades latentes; por otro, forma parte del ecosistema emergente de herramientas para auditar, monitorizar y depurar el comportamiento interno de modelos grandes sin recurrir exclusivamente a sondas lineales entrenadas a mano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.6-27B; el modelo base expone `Qwen3_5ForCausalLM` con capas decoder en `model.model.layers` y kernels Gated DeltaNet (atención lineal híbrida) |
| Parametros totales | Modelo base: Qwen3.6-27B (27.000 millones aprox.); recuento exacto de parametros del adaptador: no disponible (tamano del repo 1,9 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento
El modelo es un adaptador LoRA con r=64 y alpha=128 aplicado sobre todas las capas lineales del modelo de texto base. El peso del modelo sigue siendo Qwen3.6-27B, que utiliza una arquitectura decoder con soporte de kernels Gated DeltaNet (via `flash-linear-attention` y `causal-conv1d`), lo que sugiere un esquema de atención lineal híbrida. El adaptador asume la estructura de claves de `AutoModelForCausalLM` sobre el modelo de texto puro.

El entrenamiento se realizó con la receta LatentQA + clasificación + predicción de contexto con past-lens, durante 1 época, 64.123 pasos con batch size 16 y learning rate 1e-5. Las activaciones se extraen de las capas 16, 32 y 48 (una capa por ejemplo) y se inyectan de manera aditiva con normalización emparejada en la capa 1 sobre tokens marcadores `" ?"` tras el prefijo `Layer: {layer}\n`. El run se ejecutó en 1x H200 con transformers 5.17, peft 0.21 y torch 2.12.1, con gradient checkpointing en modo `use_reentrant=True`, y se reanudó dos veces desde checkpoints locales (pasos 32000 y 36000, restaurando estado del optimizador y del scheduler).

## Capacidades
- Interpretación de activaciones internas: dado un vector de activación de una capa concreta, el modelo responde preguntas en lenguaje natural sobre su contenido semántico.
- LatentQA: formular y responder preguntas sobre propiedades latentes no expresadas explícitamente en la salida del modelo base.
- Clasificación de propiedades latentes: tareas como detección de género, análisis de sentimiento, reconocimiento de entidades, implicación textual, tiempo verbal y número gramatical a partir de activaciones.
- Predicción de contexto mediante past-lens: inferir información sobre el contexto previo a partir de las activaciones.
- Inspección por capas: permite interrogar activaciones extraídas de las capas 16, 32 o 48 del modelo base por separado.
- Orientado a investigación en interpretabilidad; no está pensado como modelo conversacional ni como asistente general.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso
- Investigación en interpretabilidad mecanicista: interrogar directamente las activaciones de Qwen3.6-27B para descubrir qué conceptos representa cada capa, sustituyendo o complementando sondas lineales y autoencoders dispersos (SAE).
- Auditoría de sesgos latentes: detectar representaciones de género, raza u otras categorías sensibles dentro de las activaciones, incluso cuando el modelo no las expresa en su salida de texto (evaluado en `md_gender` con 0,933).
- Monitorización de seguridad en producción: usar el oráculo como sonda adicional para señalar estados internos anómalos o peligrosos antes de que se materialicen en la respuesta final.
- Depuración de modelos: cuando Qwen3.6-27B falla en una tarea, inspeccionar las activaciones de capas intermedias para localizar en qué punto se pierde la información relevante.
- Evaluación comparativa de arquitecturas: comparar cómo distintas capas o distintos tamaños de modelo codifican la misma propiedad (por ejemplo, comparando Qwen3.6-27B AO con Qwen3-8B AO en los mismos conjuntos de datos).
- Generación de etiquetas automáticas para datasets de interpretabilidad: aprovechar la precisión del oráculo (hasta 0,992 en `tense`) para etiquetar activaciones a gran escala y entrenar sondas más ligeras.
- Verificación de alineación: comprobar si el modelo base representa internamente información que contradice su salida declarada, útil en estudios de honestidad y engaño.

## Benchmarks y rendimiento

Evaluación de clasificación en el paso final (250 ejemplos x 3 capas por conjunto de datos, multi-token):

| Dataset | Qwen3.6-27B AO | Qwen3-8B AO |
|---|---|---|
| geometry_of_truth | 0,964 | 0,947 |
| relations | 0,864 | 0,787 |
| sst2 | 0,904 | 0,876 |
| md_gender | 0,933 | 0,921 |
| snli | 0,967 | 0,948 |
| ner | 0,985 | 0,959 |
| tense | 0,992 | 0,979 |
| ag_news (held out) | 0,871 | 0,840 |
| language_identification (held out) | 0,944 | 0,857 |
| singular_plural (held out) | 0,945 | 0,859 |

Nota del autor: el Qwen3.6-27B sin entrenar ya obtiene entre 72% y 93% en estas evaluaciones en modo zero-shot (Qwen3-8B: alrededor del 50%). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- Entrenamiento: 1x H200 segun la model card, con transformers 5.17, peft 0.21 y torch 2.12.1.
- Inferencia: requiere cargar el modelo base Qwen3.6-27B completo más el adaptador LoRA; no es posible usar el adaptador de forma aislada.
- VRAM estimada (derivada del tamaño del modelo base, no confirmada en la model card): en bf16/fp16 en torno a 54-60 GB, en int8 en torno a 27-30 GB, en int4 en torno a 14-18 GB; estas cifras son estimaciones generales para un modelo de 27.000 millones de parametros y pueden variar segun la implementación y el soporte de los kernels Gated DeltaNet.
- GPU recomendadas: H200 o H100 para inferencia en precision completa; A100 80 GB como alternativa; GPUs consumer (RTX 4090 24 GB) solo viables con cuantizacion agresiva a 4 bits del modelo base.
- Opciones de despliegue: vLLM, TGI o llama.cpp segun soporte del modelo base; el adaptador se carga con PEFT sobre transformers.
- Para los kernels rápidos de Gated DeltaNet es necesario instalar `flash-linear-attention` y `causal-conv1d`; en GPUs Hopper se requiere Triton >= 3.7.1 (por ejemplo torch 2.12), ya que versiones anteriores producen resultados incorrectos en el backward de estos kernels.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros base | Receta | Rendimiento (media aprox. en evals) | Licencia |
|---|---|---|---|---|
| checkpoints_latentqa_cls_past_lens_addition_Qwen3.6-27B | 27.000 M | LatentQA + clasificación + past-lens, LoRA r=64/alpha=128 | 0,94 (media de los 10 evals mostrados) | no disponible |
| checkpoints_latentqa_cls_past_lens_addition_Qwen3-8B | 8.000 M | Misma receta (referencia del autor) | 0,90 (media de los mismos evals) | no disponible |
| Otros oráculos de activación / sondas lineales | no disponible | no disponible | no disponible | no disponible |

El principal punto de comparación disponible es la variante sobre Qwen3-8B, que obtiene resultados sistematicamente inferiores en los diez conjuntos evaluados, con diferencias especialmente marcadas en los conjuntos held out (`language_identification`: 0,944 frente a 0,857; `singular_plural`: 0,945 frente a 0,859).

## Limitaciones y advertencias
- Es un adaptador de investigación, no un modelo de propósito general: no está diseñado para generación de texto, diálogo ni tareas de usuario final.
- El adaptador depende estructuralmente de Qwen3.6-27B; cualquier cambio en la arquitectura del modelo base o en la ubicación de las capas (`model.model.layers`) rompe la compatibilidad de las claves.
- El rendimiento depende de que la activación se extraiga exactamente de las capas 16, 32 o 48 con el formato de inyección esperado; desviarse de ese protocolo invalida los resultados.
- Riesgo de alucinación: al tratarse de un modelo de lenguaje que describe contenido latente, puede generar descripciones plausibles pero incorrectas sobre las activaciones; conviene validar con sondas independientes.
- El modelo base sin entrenar ya rinde entre 72% y 93% en las evaluaciones en modo zero-shot, por lo que parte de la puntuación del adaptador puede atribuirse a capacidades preexistentes y no solo al entrenamiento LoRA.
- Sesgos conocidos: no documentados especificamente para este adaptador; pueden heredarse del modelo base.
- Restricciones de licencia: no disponibles; la licencia del adaptador y las condiciones de uso comercial no se especifican en la información proporcionada (habria que consultar la licencia de Qwen3.6-27B).
- Idiomas soportados: no disponibles.
- En producción requiere el modelo base completo de 27.000 millones de parametros, lo que implica requisitos de hardware elevados.
- Dependencia de versiones concretas: transformers 5.17, peft 0.21, torch 2.12.1 y Triton >= 3.7.1 en Hopper; versiones distintas pueden dar resultados erroneos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/adamkarvonen/checkpoints_latentqa_cls_past_lens_addition_Qwen3.6-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Variante sobre Qwen3-8B: https://huggingface.co/adamkarvonen/checkpoints_latentqa_cls_past_lens_addition_Qwen3-8B
- Paper (Activation Oracles): https://arxiv.org/abs/2512.15674
- Repositorio de código: https://github.com/adamkarvonen/activation_oracles
- Registro de entrenamiento en wandb: https://wandb.ai/adam-karvonen/sae_introspection/runs/ao-qwen3-6-27b-latentqa-cls-past-lens

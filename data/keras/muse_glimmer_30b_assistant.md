# keras/muse_glimmer_30b_assistant

## Resumen

Muse Glimmer 30B Assistant es el modelo borrador (*drafter*) de decodificación especulativa que acompaña a Muse Glimmer 30B, un modelo de lenguaje causal multimodal de 30 mil millones de parámetros publicado por Meta Superintelligence Lab y distribuido en formato KerasHub por el equipo de Keras. No es un modelo generativo autónomo: carece de vocabulario y de cabeza LM, y su única función es proponer bloques de 16 tokens que el modelo objetivo verifica en paralelo, acelerando la generación sin alterar la salida con un muestreador greedy.

El modelo implementa DFlash, una técnica de difusión de bloques (*block-diffusion*) aplicada a decodificación especulativa. Consta de 5 capas y 2,56 mil millones de parámetros, y se condiciona sobre los estados ocultos del modelo objetivo de 30B, del que es destilado. Su relevancia actual radica en que permite reducir la latencia de inferencia de un modelo de 30B en hardware de consumo, un escenario poco habitual en modelos de esta escala.

La ficha cubre exclusivamente el checkpoint `keras/muse_glimmer_30b_assistant`. Cualquier uso productivo requiere cargar también el modelo objetivo `muse_glimmer_30b` y pasar el asistente como argumento `assistant_model` en la llamada a `generate()`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash: red compañera de difusión de bloques para decodificación especulativa, 5 capas, condicionada por los estados ocultos del modelo objetivo |
| Parametros totales | 2,56B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma independiente; hereda el contexto del objetivo (131.072+ tokens) |
| Tipos de cuantizacion | no disponible (el ejemplo oficial usa `bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (pesos y código Keras) |
| Formato de pesos | KerasHub (preset `muse_glimmer_30b_assistant`); tamaño del repo 5,1 GB |

## Arquitectura y entrenamiento

El asistente es una red de 5 capas que opera como borrador de difusión de bloques: en cada paso hacia adelante propone un bloque de 16 tokens "desnoizado" condicionado por los estados ocultos del modelo objetivo de 30B. El modelo objetivo verifica esos 16 tokens en paralelo; con muestreador greedy la salida es idéntica a la decodificación greedy estándar, de modo que la técnica es una optimización de latencia sin degradación de calidad. El checkpoint expone atributos como `num_layers` y `context_projection_layer_ids` en su backbone, lo que sugiere proyecciones que alinean los estados del objetivo con las capas del borrador.

El modelo se destila a partir de Muse Spark, igual que el objetivo de 30B. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO específicas para el borrador. El modelo objetivo emplea una arquitectura densa de 52 capas con patrón de atención [Local, Local, Local, Global], ventana deslizante de 2048, GQA con 32 cabezas de consulta y 2 de clave/valor, SwiGLU y RoPE solo en capas locales; el borrador se acopla a ese objetivo, no a un transformer genérico.

## Capacidades

- Decodificación especulativa: propone bloques de 16 tokens por paso hacia adelante, verificados en paralelo por el modelo objetivo.
- Compatibilidad con prompts de texto y multimodales: funciona también con prompts de imagen usando marcadores `<|patch|>`.
- Compatibilidad con prompts por lotes (*batched prompts*).
- Preservación exacta de la salida con muestreador greedy respecto a la decodificación no especulativa.
- No genera texto de forma autónoma: no tiene vocabulario ni cabeza LM; una llamada directa lanza `NotImplementedError`.
- No soporta tool calling, agentes ni razonamiento multi-paso por sí mismo; esas capacidades residen en el modelo objetivo.

## Casos de uso

- Aceleración de inferencia local de Muse Glimmer 30B: cargar el asistente como `assistant_model` en `generate()` reduce el número de pasos secuenciales del objetivo, lo que resulta adecuado para despliegues en hardware de consumo donde la latencia por token es el cuello de botella.
- Asistentes conversacionales de baja latencia: en un chatbot multi-turno sobre el objetivo de 30B, el borrador recorta el tiempo hasta el primer token y el tiempo por token percibido por el usuario sin cambiar las respuestas con greedy.
- Generación de código en pipelines interactivos: al integrarse en un editor o CLI que invoca el modelo de 30B, la decodificación especulativa mantiene la coherencia del objetivo mientras reduce la espera en completados largos.
- Procesamiento por lotes de prompts: el ejemplo oficial admite listas de prompts, de modo que el asistente acelera tareas de generación masiva (resúmenes, clasificación generativa) ejecutadas sobre el modelo objetivo.
- Descripción de imágenes en local: con prompts que incluyen `<|patch|>` y un array de imagen, el asistente acelera la generación multimodal del objetivo en escenarios de accesibilidad o etiquetado automático.
- Evaluación e investigación de decodificación especulativa: al ser un borrador de 5 capas y 2,56B con API KerasHub, sirve para medir tasas de aceptación de bloques y estudiar el equilibrio entre velocidad y verificabilidad en un objetivo de 30B.
- Despliegue en entornos Keras/JAX/TF/PyTorch: al ser un preset de KerasHub, se integra en stacks que ya usan Keras 3 con backend intercambiable, útil para prototipado rápido en cuadernos y servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de tasa de aceptación o *speedup* del borrador.

## Requisitos de hardware

- El borrador pesa 2,56B parámetros; en `bfloat16` ocupa aproximadamente 5,1 GB, coherente con el tamaño del repo.
- VRAM total: la del modelo objetivo de 30B (aproximadamente 60 GB en bf16) más los ~5 GB del asistente; no cabe en una GPU de consumo de 24 GB en bf16 sin cuantización del objetivo.
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples RTX 4090/5090 para el objetivo; el asistente por sí solo cabe en cualquier GPU con más de 8 GB.
- Cabe en GPU de consumo únicamente como componente adicional; el objetivo de 30B requiere cuantización o reparto entre GPUs.
- Opciones de despliegue: KerasHub con backend JAX, TensorFlow o PyTorch (el ejemplo oficial usa `keras_hub.models.MuseGlimmerAssistantCausalLM.from_preset`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el beneficio depende de la tasa de aceptación de los bloques de 16 tokens, que la model card no cuantifica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse Glimmer 30B Assistant (este) | 2,56B | hereda del objetivo (131.072+) | Borrador de decodificación especulativa DFlash | Apache 2.0 | KerasHub |
| Muse Glimmer 30B | 29,78B | 131.072+ | Modelo objetivo multimodal denso | Apache 2.0 | KerasHub |
| Borradores EAGLE/Medusa típicos | no disponible | no disponible | Decodificación especulativa | variable | variable |

No se dispone de datos de rendimiento comparativo entre este borrador y alternativas de decodificación especulativa. La comparativa se limita a parámetros, contexto, función y licencia.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el objetivo `muse_glimmer_30b` no produce texto y lanza `NotImplementedError` si se invoca directamente.
- Sin vocabulario ni cabeza LM: no puede usarse para clasificación, embeddings ni generación independiente.
- La aceleración depende de la tasa de aceptación de bloques; no se han publicado métricas de *speedup* real.
- La equivalencia exacta con greedy solo se garantiza con muestreador greedy; con muestreo estocástico el comportamiento puede diferir.
- No se documentan sesgos, riesgos de alucinación ni cobertura idiomática propios del borrador; estos deben evaluarse sobre el modelo objetivo.
- La licencia Apache 2.0 permite uso comercial, pero la model card advierte que el modelo objetivo no debe desplegarse como endpoint sin salvaguardas de sistema adicionales.
- El soporte multimodal depende del marcador `<|patch|>` y de un encoder ViT-G/14 de ~1,8B en el objetivo; el asistente no procesa imágenes por sí mismo.
- No hay información sobre cuantización del borrador; el ejemplo oficial solo cubre `bfloat16`.

## Enlaces

- Hugging Face del asistente: https://huggingface.co/keras/muse_glimmer_30b_assistant
- Model card del objetivo: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Model card del asistente original: https://huggingface.co/meta-models/Muse-Glimmer-30B-assistant
- Paper: https://arxiv.org/abs/2610.24628
- Licencia de pesos: https://huggingface.co/meta-models/Muse-Glimmer-30B/blob/main/LICENSE
- Código KerasHub: https://github.com/keras-team/keras-hub
- Guía de inicio de KerasHub: https://keras.io/guides/keras_hub/getting_started/
- Guía de publicación de modelos KerasHub: https://keras.io/guides/keras_hub/upload/
- Keras: https://keras.io/
- Keras 3: https://keras.io/keras_3/

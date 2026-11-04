# keras/ministral_3_14b_instruct_2512_en

## Resumen

`keras/ministral_3_14b_instruct_2512_en` es una implementación en formato KerasHub de un modelo Mistral 3 de 14 mil millones de parámetros, orientada a generación de texto causal y publicada por el equipo de Keras. El repositorio contiene únicamente los pesos y la configuración en el formato nativo de KerasHub (no safetensors estándar ni GGUF), lo que permite cargar el modelo indistintamente sobre los backends JAX, TensorFlow o PyTorch mediante la API de Keras 3. La model card es autogenerada y no incluye información sobre el proceso de entrenamiento, los datos utilizados ni la licencia.

La arquitectura, según la configuración expuesta, es un transformer decoder-only con 40 capas, dimensión oculta de 5120, 32 cabezas de consulta y 8 cabezas clave-valor (GQA), vocabulario de 131 072 tokens y embeddings no atados. Incorpora además un codificador visual (`Mistral3VisionEncoder`) de 24 capas con parches de 14×14 y un proyector multimodal, lo que indica que el modelo es multimodal (texto e imagen) pese a que la pipeline declarada es solo `text-generation`. El contexto original es de 16 384 tokens, extendido mediante RoPE con escalado YaRN (factor 16) hasta una ventana efectiva de aproximadamente 262 144 tokens.

Su relevancia radica en dos factores: por un lado, expone un modelo Mistral 3 de tamaño medio-alto en el ecosistema KerasHub, lo que facilita su uso en flujos de trabajo que ya emplean Keras 3 con múltiples backends; por otro, la presencia del codificador visual y del proyector multimodal sugiere capacidades de comprensión de imágenes que la model card no documenta. La ausencia de licencia, idiomas declarados y resultados de benchmarks limita seriamente su evaluación para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 3) con codificador visual y proyector multimodal |
| Parametros totales | 14B (según el nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE según la configuración) |
| Longitud de contexto | 16 384 tokens nativos; ~262 144 tokens con escalado YaRN factor 16 |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible (sufijo `_en` sugiere orientación a inglés) |
| Licencia | no disponible |
| Formato de pesos | KerasHub nativo (configuración + pesos Keras; no safetensors ni GGUF) |
| Vocabulario | 131 072 tokens |
| Capas | 40 |
| Dimension oculta | 5120 |
| Cabezas de atención | 32 query / 8 key-value (GQA) |
| Dimension de cabeza | 128 |
| Dimension intermedia FFN | 16 384 |
| Tipo de RoPE | YaRN, factor 16, max wavelength 1e9 |
| Vision encoder | 24 capas, hidden 1024, 16 cabezas, parches 14×14, imagen 1540 px |
| Proyector multimodal | vision_hidden 1024 → text_hidden 5120, spatial_merge_size 2 |
| Tamano del repo | 28,8 GB |

## Arquitectura y entrenamiento

La configuración describe un transformer decoder-only clásico de la familia Mistral, con normalización RMSNorm (epsilon 1e-5), activación SwiGLU implícita en la FFN de dimensión intermedia 16 384, atención con grouped-query attention (32 cabezas de consulta frente a 8 de clave-valor), sin sliding window (`sliding_window: None`) y sin atado de embeddings (`tie_word_embeddings: False`). El uso de RoPE con escalado YaRN (factor 16 sobre una longitud original de 16 384) es la innovación técnica más destacable: permite extender el contexto efectivo hasta ~262 144 tokens sin reentrenar desde cero, a costa de cierta degradación en la calidad de atención a distancias muy largas. Los parámetros `beta_fast: 32.0` y `beta_slow: 1.0` corresponden a la parametrización estándar de YaRN para el reparto de frecuencias.

El componente multimodal está formado por un ViT de 24 capas (hidden 1024, 16 cabezas, parches 14×14 sobre imágenes de 1540 px) y un proyector que reduce la dimensionalidad visual de 1024 a 5120 mediante un `spatial_merge_size` de 2, con activación GELU y sin sesgo. El token de imagen ocupa el índice 10 del vocabulario. No hay información en la model card sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones; el sufijo `_instruct` del nombre sugiere un ajuste instruccional, pero no se detalla. Tampoco se documenta el proceso de destilación, poda o cualquier otra técnica de compresión.

## Capacidades

- Generación de texto causal en inglés (según el sufijo `_en`), con soporte multi-turno.
- Razonamiento y respuesta a instrucciones, presumiblemente tras un ajuste instruccional no documentado.
- Comprensión de imágenes: el codificador visual y el proyector multimodal están presentes en la configuración, lo que habilita entrada de imágenes junto a texto, aunque la pipeline declarada sea solo `text-generation`.
- Contexto largo: ventana efectiva de hasta ~262 144 tokens gracias al escalado YaRN, adecuada para documentos extensos o conversaciones prolongadas.
- Ejecución multi-backend: el mismo código Keras corre sobre JAX, TensorFlow y PyTorch, lo que facilita el despliegue en infraestructuras heterogéneas.
- Tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponibles (no documentadas; el sufijo sugiere inglés).
- Modo thinking explícito: no disponible.

## Casos de uso

- Análisis de documentos largos con imágenes intercaladas: gracias a la ventana extendida de ~262 144 tokens y al codificador visual, el modelo puede procesar informes, contratos o artículos científicos que combinen texto e ilustraciones en una sola pasada, sin necesidad de trocear el contenido.
- Asistencia técnica sobre manuales y bases de conocimiento: el contexto largo permite inyectar documentación extensa como prefijo y mantener conversaciones multi-turno sin perder referencias a secciones anteriores.
- Generación de código en pipelines Keras/JAX: al estar empaquetado en KerasHub, se integra de forma natural en flujos de trabajo que ya usan Keras 3, permitiendo prototipado rápido de asistentes de código sobre backend JAX o PyTorch.
- Procesamiento de capturas de pantalla y diagramas: el codificador visual permite extraer información de interfaces, gráficos y esquemas técnicos, útil en herramientas de soporte o documentación automatizada.
- Resumen de reuniones o transcripciones extensas: con 262k tokens de contexto se pueden resumir horas de transcripción en una sola llamada, manteniendo coherencia global.
- Investigación y experimentación académica: al ser un modelo KerasHub, sirve como base para fine-tuning con Keras 3 en entornos de investigación que requieran portabilidad entre backends.
- Despliegue en entornos con requisitos de portabilidad: la posibilidad de ejecutar el mismo modelo sobre TensorFlow, JAX o PyTorch simplifica la migración entre infraestructuras sin reescribir el código de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~28 GB solo para pesos (14B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 32-40 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~14-16 GB (no hay variantes cuantizadas publicadas; requeriría cuantización manual).
- VRAM estimada en cuantización de 4 bits: ~8-10 GB (igualmente requiere conversión manual, ya que no se distribuyen pesos GGUF/AWQ/GPTQ).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para inferencia en precisión completa con contexto largo; RTX 4090 (24 GB) solo cabría con cuantización agresiva o contextos cortos.
- GPU de consumo: no cabe en bfloat16 en ninguna GPU de consumo actual; en 4 bits podría ejecutarse en RTX 4090 o RTX 3090 con contextos limitados.
- Opciones de despliegue: KerasHub sobre JAX, TensorFlow o PyTorch. No hay soporte nativo documentado para vLLM, llama.cpp, Ollama o TGI, ya que no se distribuyen pesos en formatos estándar (safetensors/GGUF).
- Latencia y throughput: no disponibles (sin datos publicados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| keras/ministral_3_14b_instruct_2512_en | 14B | 16k nativo / ~262k YaRN | no disponible | KerasHub | HuggingFace (keras) |
| Mistral 3 14B (original) | 14B | no disponible | no disponible | safetensors | no disponible en la informacion |
| Qwen2.5-14B-Instruct | 14B | 32k nativo / 128k extendido | Apache 2.0 | safetensors, GGUF, AWQ | HuggingFace, Ollama, vLLM |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community | safetensors, GGUF | HuggingFace, Ollama, vLLM |

La comparativa con Qwen2.5-14B y Llama 3.1 8B se ofrece como referencia de categoría, pero no se dispone de datos de rendimiento del modelo Keras para establecer una comparación cuantitativa. La principal diferencia frente a las alternativas es el empaquetado en KerasHub y la inclusión de un codificador visual, frente a los formatos estándar y el soporte amplio de herramientas de inferencia de los otros modelos.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido; esto es un bloqueante para producción.
- Idiomas no declarados: el sufijo `_en` sugiere un enfoque en inglés, pero no se confirma el soporte multilingüe ni la calidad en castellano.
- Model card autogenerada y sin completar: no hay información sobre datos de entrenamiento, sesgos, alineación ni evaluación, lo que impide auditar el modelo.
- Riesgo de alucinación: sin datos de evaluación ni de alineación, no se puede estimar la tasa de alucinación; en contextos largos con YaRN la degradación de atención puede agravar este riesgo.
- Contexto extendido con YaRN: la ventana de ~262k tokens se obtiene por escalado de RoPE, no por entrenamiento nativo a esa longitud; la calidad en las posiciones más lejanas puede degradarse.
- Formatos no estándar: al no distribuirse en safetensors, GGUF ni AWQ, no es directamente compatible con vLLM, llama.cpp, Ollama o TGI; requiere conversión o uso exclusivo de KerasHub.
- Repositorio de 28,8 GB: la descarga y el almacenamiento son costosos, y la carga en memoria exige planificación.
- Sin métricas de benchmarks: imposible comparar objetivamente con alternativas de la misma categoría.
- Capacidades multimodales no documentadas: aunque la configuración incluye visión, la model card no describe cómo usar la entrada de imágenes ni qué calidad cabe esperar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keras/ministral_3_14b_instruct_2512_en
- Documentación de Mistral3 en KerasHub: https://keras.io/api/keras_hub/models/mistral3
- Documentación de Keras: https://keras.io/
- Keras 3 (multi-backend): https://keras.io/keras_3/
- Documentación de model cards de HuggingFace: https://huggingface.co/docs/hub/model-cards
- Wikipedia de Keras: https://en.wikipedia.org/wiki/Keras

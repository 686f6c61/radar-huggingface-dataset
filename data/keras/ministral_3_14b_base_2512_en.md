# keras/ministral_3_14b_base_2512_en

## Resumen

`keras/ministral_3_14b_base_2512_en` es una implementación en KerasHub del modelo Mistral 3, publicada por el equipo de Keras. Se trata de un modelo de lenguaje causal con capacidades multimodales (texto e imagen), empaquetado para poder ejecutarse indistintamente sobre los backends JAX, TensorFlow y PyTorch que ofrece Keras 3. El repositorio contiene únicamente los pesos y la configuración generada automáticamente por la librería; la model card no incluye información sobre el proceso de entrenamiento, la composición del dataset ni la licencia.

Según la configuración expuesta, el backbone de texto tiene 40 capas, dimensión oculta de 5120 y 32 cabezas de consulta con 8 cabezas clave-valor (GQA), lo que sitúa el recuento de parámetros en el entorno de los 14 000 millones, coherente con el nombre del repositorio (`14b`). El vocabulario es de 131 072 tokens y el contexto original es de 16 384 posiciones, ampliado mediante RoPE con escalado YaRN (factor 16) hasta un máximo teórico de 262 144 tokens.

La relevancia de esta ficha es doble: por un lado documenta un modelo multimodal de tamano medio con ventana de contexto extendida; por otro, ilustra el estado de KerasHub como vía de distribución de pesos independiente del framework, algo poco habitual en el ecosistema de modelos abiertos, dominado por safetensors y GGUF orientados a PyTorch. La ausencia de licencia explícita y de datos de entrenamiento en la model card limita seriamente su uso en producción sin verificación adicional por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 3) con vision encoder y proyector multimodal |
| Parametros totales | ~14 000 millones (estimado a partir de la configuración: 40 capas, hidden 5120, FFN 16384) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16 384 tokens nativos; hasta 262 144 con escalado YaRN factor 16 |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible (el sufijo `_en` sugiere orientación a inglés, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | KerasHub (`.keras`/configuración Keras); compatible con JAX, TensorFlow y PyTorch vía Keras 3 |

## Arquitectura y entrenamiento

El backbone de texto es un transformer decoder-only con atención de grupo (32 cabezas de consulta, 8 de clave-valor, `head_dim` 128), FFN con dimensión intermedia de 16 384 y activación no especificada en la configuración (Mistral usa SwiGLU habitualmente). Emplea RoPE con `rope_max_wavelength` de 1e9, tipo YaRN, `beta_fast` 32 y `beta_slow` 1, y `original_max_position_embeddings` de 16 384. No hay sliding window (`sliding_window: None`), a diferencia de otras variantes de la familia Mistral, y las embeddings de entrada y salida no están atadas (`tie_word_embeddings: False`). La configuración incluye además un parámetro `llama_4_scaling_beta` de 0,1, lo que sugiere la incorporación de la técnica de escalado de atención introducida en Llama 4.

El componente de visión es un ViT de 24 capas, `hidden_dim` 1024, 16 cabezas, parches de 14x14 sobre imágenes de 1540x1540 y `rope_theta` 10 000. Un proyector multimodal con `spatial_merge_size` 2 y activación GELU traduce las representaciones visuales (1024) al espacio del texto (5120). El token de imagen ocupa el índice 10 del vocabulario. No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias; la model card indica explícitamente que fue generada de forma automática y debe completarse.

## Capacidades

- Generación de texto causal en inglés (según el sufijo `_en` del identificador) con contexto nativo de 16 384 tokens y extensión YaRN hasta 262 144.
- Comprensión de imágenes: el modelo integra un vision encoder ViT y un proyector multimodal, por lo que puede procesar entradas de imagen junto con texto.
- Razonamiento y generación de código: capacidades esperables en un modelo de 14B de la familia Mistral, aunque no verificadas en la información disponible.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingües: no confirmadas; el identificador sugiere foco en inglés.
- Modo thinking explícito: no disponible.
- Ejecución multi-backend (JAX, TensorFlow, PyTorch) gracias a Keras 3, lo que facilita la portabilidad entre entornos.

## Casos de uso

- Procesamiento de documentos largos con imágenes: gracias a sus 16 384 tokens nativos (extensibles a 262 144 con YaRN) y al encoder visual, el modelo puede resumir informes con gráficos o extraer datos de tablas escaneadas en una sola pasada.
- Análisis de capturas de pantalla y UI: el ViT de 1540x1540 con parches de 14 permite interpretar interfaces, útil para agentes de automatización de pruebas o asistentes de soporte técnico.
- Generación de código en pipelines de CI/CD: un modelo de 14B es viable en una GPU de 24 GB en bfloat16, lo que permite desplegarlo en runners autoalojados para revisión de parches o generación de tests, siempre que se verifique la licencia.
- Asistente de documentación técnica: con contexto extendido puede indexar manuales completos y responder preguntas cruzando secciones, integrándose vía KerasHub en servicios Python existentes sin cambiar de framework.
- Prototipado e investigación en Keras: al ejecutarse sobre JAX, TensorFlow o PyTorch con el mismo código, es adecuado para experimentos de ablación de arquitectura o comparativas entre backends.
- Extracción de información estructurada de facturas o formularios: combinación de entrada de imagen y salida de texto estructurado, con la ventaja de que el modelo corre en un único repositorio Keras.
- Evaluación de modelos multimodales en entornos académicos: su disponibilidad vía KerasHub facilita la reproducibilidad en laboratorios que ya usan Keras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 28 GB solo para pesos, más overhead de activaciones y caché KV; el tamano del repo (28,8 GB) es consistente con esta cifra.
- VRAM estimada en cuantización de 8 bits: ~14-15 GB; en 4 bits: ~7-8 GB (estimaciones teóricas, no hay variantes cuantizadas publicadas).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bfloat16 sin cuantizar; RTX 4090 (24 GB) requiere cuantización o carga por capas.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 solo con cuantización o descarga parcial; en GPUs de 16 GB no es viable sin cuantización agresiva.
- Opciones de despliegue: KerasHub con backend JAX, TensorFlow o PyTorch; no hay soporte confirmado para vLLM, llama.cpp, Ollama ni TGI al no existir pesos en formato GGUF o safetensors estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| keras/ministral_3_14b_base_2512_en | ~14B | 16 384 (262 144 con YaRN) | no disponible | KerasHub | Multimodal, multi-backend |
| Mistral NeMo 12B | 12B | 128 000 | Apache 2.0 | safetensors, GGUF | Solo texto, ecosistema amplio |
| Qwen2.5-VL 7B | 7B | 32 768 (extensible) | Apache 2.0 | safetensors | Multimodal, ampliamente soportado |
| Gemma 3 12B | 12B | 128 000 | Gemma Terms | safetensors, GGUF | Multimodal, requiere aceptar términos |

La comparativa se basa en características públicas de modelos de tamano similar; no se dispone de datos de rendimiento del modelo evaluado para contrastar calidad.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o consultar el repositorio original de Mistral antes de desplegar.
- Model card generada automáticamente: no documenta datos de entrenamiento, sesgos, ni proceso de alineación; el riesgo de alucinación y de comportamiento no deseado es desconocido.
- Idiomas no confirmados: el sufijo `_en` sugiere un foco en inglés; el rendimiento en castellano no está verificado.
- Contexto extendido mediante YaRN: la ventana de 262 144 tokens es teórica y el rendimiento más allá de 16 384 no está validado empíricamente.
- Ecosistema limitado: al no haber pesos en GGUF ni safetensors estándar, no se puede usar con vLLM, llama.cpp u Ollama sin conversión manual, lo que complica el despliegue en producción.
- Sin benchmarks publicados: no hay evidencia de calidad frente a alternativas; no se recomienda su adopción en producción sin evaluación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria.
- El identificador incluye una fecha (`2512`) que podría indicar un checkpoint de diciembre de 2025; conviene verificar la versión exacta antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keras/ministral_3_14b_base_2512_en
- Documentación de Mistral3 en KerasHub: https://keras.io/api/keras_hub/models/mistral3
- Documentación de Keras: https://keras.io/
- Keras 3 (multi-backend): https://keras.io/keras_3/
- Keras en Wikipedia: https://en.wikipedia.org/wiki/Keras

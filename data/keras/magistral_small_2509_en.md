# keras/magistral_small_2509_en

## Resumen

`keras/magistral_small_2509_en` es una conversión del modelo Magistral Small 2509 de Mistral AI al formato de KerasHub, publicada por el equipo de Keras. Se trata de un modelo causal de generación de texto con capacidades multimodales (visión-lenguaje), construido sobre una arquitectura Mistral3 que combina un backbone transformer de 40 capas con un codificador visual ViT de 24 capas y un proyector multimodal. El repositorio ocupa 48,9 GB y los pesos se distribuyen en formato compatible con Keras 3, lo que permite ejecutarlo indistintamente sobre los backends JAX, TensorFlow y PyTorch.

La relevancia de esta ficha radica en que ofrece una vía de despliegue alternativa a la pila habitual de transformers/vLLM: al estar empaquetado con KerasHub, el modelo puede integrarse en flujos de trabajo que ya usan Keras 3 para entrenamiento o inferencia, y exportarse a los tres backends principales sin reescribir código. Sin embargo, la model card es automática y no incluye información sobre licencia, idiomas, datos de entrenamiento ni benchmarks, por lo que muchos apartados de esta ficha quedan marcados como "no disponible".

El nombre del repositorio sugiere que se corresponde con la variante "Small" de la familia Magistral, orientada a razonamiento con cadena de pensamiento, aunque la model card no confirma explícitamente esta capacidad ni el número exacto de parámetros totales. El contexto original configurado es de 4096 tokens, ampliable mediante RoPE linear scaling, según los parámetros del backbone.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral3) con codificador visual ViT y proyector multimodal |
| Parámetros totales | no disponible (el config no declara el recuento; por dimensiones del backbone se estima del orden de decenas de miles de millones, sin confirmación oficial) |
| Parámetros activos | no aplica (no es MoE según la configuración) |
| Longitud de contexto | 4096 tokens originales (`original_max_position_embeddings`), ampliable con RoPE linear scaling (`rope_scaling_factor: 1.0`) |
| Tipos de cuantización | no disponible en la model card; el repo contiene pesos en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | KerasHub (compatible con JAX, TensorFlow y PyTorch); no se indica GGUF ni safetensors estándar |

Otros parámetros del backbone: `vocabulary_size` 131072, `num_layers` 40, `num_query_heads` 32, `num_key_value_heads` 8 (GQA), `head_dim` 128, `hidden_dim` 5120, `intermediate_dim` 32768, `rope_max_wavelength` 1e9, `rope_type` linear, `tie_word_embeddings` False, `sliding_window` None.

Codificador visual: `image_size` 1540, `patch_size` 14, `num_layers` 24, `num_heads` 16, `head_dim` 64, `hidden_dim` 1024, `intermediate_dim` 4096, activación SiLU, `rope_theta` 10000.

Proyector multimodal: `vision_hidden_dim` 1024 → `text_hidden_dim` 5120, `spatial_merge_size` 2, activación GELU, sin sesgo.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Mistral3: un transformer decoder-only con atención de múltiples cabezas y queries agrupadas (32 cabezas de query, 8 de key/value), normalización RMSNorm con epsilon 1e-5, RoPE con longitud de onda máxima 1e9 y escalado linear, y sin ventana deslizante (`sliding_window: None`). La dimensión oculta es 5120 y la dimensión intermedia del FFN es 32768, con 40 capas y vocabulario de 131072 tokens. Los embeddings de entrada y salida no están atados (`tie_word_embeddings: False`).

La parte multimodal consta de un codificador visual tipo ViT con parches de 14×14 sobre imágenes de 1540×1540 píxeles, 24 capas y dimensión 1024, y un proyector que reduce la dimensión visual a la del texto (5120) con `spatial_merge_size` 2. El índice de token de imagen es 10. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o decodificación especulativa; la model card no lo detalla. Tampoco se documenta si existe un modo de razonamiento explícito ("thinking"), pese a que el nombre "Magistral" lo sugiere en la familia original de Mistral.

## Capacidades

- Generación de texto causal en inglés (según el sufijo `_en` del nombre del repositorio; no confirmado en la model card).
- Procesamiento de imágenes: el codificador ViT y el proyector multimodal permiten entrada de imágenes junto con texto, con un token especial de imagen (`image_token_index: 10`).
- Razonamiento multi-paso: el nombre del modelo pertenece a la familia Magistral, orientada a razonamiento, aunque la model card no documenta explícitamente un modo de pensamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible (el sufijo `_en` apunta a un enfoque en inglés).
- Compatibilidad multi-backend: ejecutable con JAX, TensorFlow y PyTorch a través de KerasHub.
- No se documentan capacidades de audio ni de vídeo.

## Casos de uso

- Asistente multimodal de atención al cliente: el modelo puede recibir capturas de pantalla o fotos de producto junto con la consulta del usuario y generar respuestas textuales, gracias al codificador ViT de 1540×1540 y al proyector multimodal.
- Análisis de documentos escaneados: extracción de información de facturas, formularios o tickets combinando OCR implícito con generación de texto estructurado, usando el contexto de 4096 tokens para incluir varias páginas.
- Generación de descripciones de imágenes en pipelines de accesibilidad: integración en un servicio que reciba una imagen y devuelva una descripción textual, ejecutable sobre JAX o PyTorch según la infraestructura del equipo.
- Prototipado rápido en Keras 3: investigadores que ya trabajan con Keras pueden cargar el modelo con `keras_hub.models.Mistral3CausalLM` y cambiar de backend sin reescribir el código, útil para experimentos comparativos.
- Fine-tuning sobre tareas específicas de visión-lenguaje: al estar los pesos en bfloat16 y con `trainable: True` en la configuración, el modelo puede adaptarse con LoRA o ajuste completo en entornos con GPUs de gran memoria.
- Evaluación de razonamiento visual en investigación: uso como baseline multimodal en estudios comparativos, siempre que se documente la ausencia de benchmarks oficiales en la model card.
- Despliegue en entornos con requisitos de portabilidad de framework: al no depender de una sola pila (transformers, vLLM), puede integrarse en sistemas que ya usan TensorFlow Serving o JAX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 48,9 GB en bfloat16, por lo que se necesita al menos ~50 GB de VRAM para cargar los pesos completos sin cuantizar. No se dispone de información sobre cuantizaciones oficiales (GGUF, AWQ, GPTQ) que reduzcan este requisito.
- GPU recomendadas: para pesos completos en bfloat16, se requieren GPUs con 80 GB (A100 80GB, H100 80GB) o múltiples GPUs de 40-48 GB (A100 40GB, L40S, RTX A6000) con paralelismo de tensor.
- ¿Cabe en consumer GPU? No en pesos completos. En GPUs de 24 GB (RTX 4090, RTX 3090) solo cabría con cuantización agresiva a 4 bits, para la cual no se ofrecen pesos oficiales en este repositorio.
- Opciones de despliegue: KerasHub con backends JAX, TensorFlow o PyTorch. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| keras/magistral_small_2509_en | no disponible (repo 48,9 GB) | 4096 (ampliable con RoPE) | Texto + visión | no disponible | Hugging Face (KerasHub) |
| Mistral Small 3 (referencia) | ~24B | 32k | Texto | Apache 2.0 (según versión) | Hugging Face |
| Qwen2.5-VL 7B | 7B | 128k | Texto + visión | Apache 2.0 | Hugging Face |
| Llama 3.2 11B Vision | 11B | 128k | Texto + visión | Llama Community License | Hugging Face |

Nota: los datos de los modelos comparativos son de referencia general y no proceden de la información proporcionada en esta búsqueda; se incluyen solo como orientación de categoría. La model card de `keras/magistral_small_2509_en` no confirma el número exacto de parámetros ni la licencia, por lo que la comparación es aproximada.

## Limitaciones y advertencias

- La model card es automática y no documenta licencia, idiomas, datos de entrenamiento ni benchmarks; no se puede confirmar el uso comercial permitido.
- El contexto original es de solo 4096 tokens; ampliarlo requiere configurar RoPE linear scaling manualmente y no se garantiza la calidad más allá de esa ventana.
- El sufijo `_en` sugiere un enfoque en inglés; no hay confirmación de capacidades multilingües.
- No se ofrecen pesos cuantizados oficiales, lo que limita el despliegue en hardware de consumo.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad ni de seguridad.
- Al ser una conversión de KerasHub, puede haber diferencias de comportamiento respecto a los pesos originales de Mistral AI; no se documenta una validación de equivalencia.
- No se confirma soporte de tool calling ni de agentes, por lo que no debe asumirse en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/keras/magistral_small_2509_en
- Documentación KerasHub Mistral3: https://keras.io/api/keras_hub/models/mistral3
- Keras (sitio principal): https://keras.io/
- Keras 3 multi-backend: https://keras.io/keras_3/
- Documentación de model cards de Hugging Face: https://huggingface.co/docs/hub/model-cards
- Wikipedia Keras (EN): https://en.wikipedia.org/wiki/Keras
- Wikipedia Keras (FR): https://fr.wikipedia.org/wiki/Keras
- GeeksforGeeks, introducción a Keras: https://www.geeksforgeeks.org/deep-learning/what-is-keras/

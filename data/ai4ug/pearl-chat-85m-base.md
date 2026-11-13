# ai4ug/pearl-chat-85m-base

## Resumen

Pearl-chat-85m-base es un modelo de lenguaje de 85,2 millones de parámetros desarrollado por ai4ug, un proyecto centrado en el procesamiento del idioma luganda (Uganda). Se trata de un checkpoint base (foundational) de la familia Pearl v5, entrenado desde cero sobre corpus ugandeses verificados: material enciclopédico, datos de los 136 distritos de la Oficina de Estadística de Uganda (UBOS), artículos de la Wikipedia en luganda, textos clínicos sanitarios y proverbios tradicionales (*Engero z'Abaganda*).

El modelo resuelve un problema de escasez de recursos: el luganda es una lengua de bajos recursos con poca representación en los grandes modelos multilingües. Pearl-chat-85m-base ofrece una base ligera, entrenada nativamente en luganda y publicada con pesos en formato Flax/safetensors bajo licencia Apache 2.0, lo que facilita su uso comercial y su despliegue en JAX.

Técnicamente emplea una arquitectura transformer con atención híbrida de ventana deslizante (3:1) combinada con Grouped-Query Attention global, un tokenizador Byte-BPE específico de luganda de 16.384 tokens y una longitud de contexto máxima de 1.024 tokens. Su tamaño reducido permite inferencia en hardware modesto, lo que lo hace adecuado para despliegues en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (preset `pearl-v5-85m`) con atención híbrida Sliding Window Attention 3:1 + Global GQA; implementado en JAX / Flax NNX |
| Parametros totales | 85.219.968 (74.734.208 en el cuerpo transformer) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (`max_seq_len=1024`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Luganda (`lug`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Flax / safetensors (`flax`, `flax-nnx`) |

Parámetros de geometría adicionales: `d_model=640`, `n_layers=16`, `n_heads=10`, `n_kv_heads=5`, `d_ff=1792`, `tie_word_embeddings=True`, `rope_theta=10000` (ventana local), `global_rope_theta=50000` (capas globales), ventana deslizante `W=256`.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 16 capas y dimensión de modelo 640. La innovación principal es su esquema de atención híbrido: combina capas de Sliding Window Attention (ventana `W=256`, `rope_theta=10000`) con capas de atención global mediante Grouped-Query Attention (5 cabezas KV frente a 10 cabezas de consulta), aplicadas cada cuarta capa y en la capa final, con un `global_rope_theta` distinto (50000). Este diseño reduce el coste computacional de la atención manteniendo acceso a contexto global. Los embeddings de salida están atados a los de entrada (`tie_word_embeddings=True`).

El entrenamiento se realizó sobre dos datasets propios: `ai4ug/luganda_pretrain_v5` (preentrenamiento) y `ai4ug/luganda_sft_v5` (ajuste supervisado). Los corpus descritos incluyen material enciclopédico ugandés verificado, datos de los 136 distritos de UBOS, `lg.wikipedia.org`, textos clínicos sanitarios y proverbios tradicionales. El tokenizador es un Byte-BPE de vocabulario 16.384 específico para luganda. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto en luganda sobre la base del preentrenamiento y el ajuste supervisado.
- Modelo base (checkpoint foundational), pensado como punto de partida para ajuste posterior más que como asistente conversacional final.
- Tokenizador nativo de luganda (Byte-BPE, 16.384 tokens), lo que mejora la eficiencia de codificación frente a tokenizadores multilingües genéricos.
- Contexto de hasta 1.024 tokens para conversaciones y documentos cortos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al luganda según los metadatos del modelo.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Procesamiento de textos administrativos ugandeses: el modelo puede utilizarse como base para tareas de normalización, extracción o resumen de documentos sobre los 136 distritos de UBOS, dado que ese corpus forma parte de su entrenamiento.
- Punto de partida para ajuste fino en tareas específicas de luganda: al ser un checkpoint base con licencia Apache 2.0, equipos locales pueden continuar el entrenamiento (SFT, DPO) sobre dominios concretos como sanidad o educación.
- Clasificación y etiquetado de texto en luganda: con 85 M de parámetros y contexto de 1.024 tokens, es viable para tareas de clasificación de documentos cortos en entornos con pocos recursos de cómputo.
- Investigación en lenguas de bajos recursos: sirve como referencia reproducible (JAX/Flax NNX) para estudiar arquitecturas de atención híbrida en idiomas con pocos datos.
- Generación de contenido cultural y educativo: los proverbios *Engero z'Abaganda* y la Wikipedia en luganda en el corpus lo hacen adecuado para generar o completar material divulgativo en luganda.
- Despliegue en hardware modesto para prototipos: su tamaño permite ejecutar prototipos de aplicaciones de texto en luganda en GPU de consumo o incluso CPU, sin depender de infraestructura de gran escala.
- Investigación sobre tokenización específica de idioma: su tokenizador Byte-BPE de 16.384 tokens permite estudiar el impacto de tokenizadores nativos frente a multilingües en lenguas africanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 85,2 M de parámetros en precisión completa (fp32) el peso ronda los 0,34 GB; en bf16/fp16, aproximadamente 0,17 GB. La memoria adicional depende del tamaño de lote y del contexto (1.024 tokens máximo).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se requiere A100 ni H100. Una RTX 4090 o similar queda muy por encima de las necesidades.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: al estar implementado en JAX / Flax NNX, el despliegue natural es mediante el ecosistema JAX (por ejemplo, servicios propios en Python con Flax). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la información proporcionada. A continuación se comparan únicamente características estructurales conocidas con alternativas de tamaño similar orientadas a lenguas de bajos recursos; los datos de los modelos alternativos no forman parte de la información proporcionada y deben verificarse en sus respectivas fichas.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ai4ug/pearl-chat-85m-base | 85,2 M | 1.024 | Apache 2.0 | Luganda, JAX/Flax |
| Alternativas de <100 M para lenguas africanas | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un checkpoint base, no un asistente conversacional afinado para diálogo; puede requerir ajuste adicional para tareas de chat.
- Contexto limitado a 1.024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Entrenado exclusivamente en luganda: no se espera buen rendimiento en otros idiomas.
- Riesgo de alucinación inherente a modelos de este tamaño y a corpus limitados; conviene validar las salidas en aplicaciones críticas (por ejemplo, sanitarias).
- Posibles sesgos derivados de la composición del corpus (fuentes enciclopédicas, estadísticas oficiales y textos clínicos), no documentados en la información disponible.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que carece de validación comunitaria publicada.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los datasets de origen (`ai4ug/luganda_pretrain_v5` y `ai4ug/luganda_sft_v5`) antes de un despliegue en producción.
- La implementación en Flax NNX puede requerir adaptación para stacks de inferencia habituales basados en PyTorch.

## Enlaces

- Hugging Face: https://huggingface.co/ai4ug/pearl-chat-85m-base
- Dataset de preentrenamiento: https://huggingface.co/datasets/ai4ug/luganda_pretrain_v5
- Dataset de ajuste supervisado: https://huggingface.co/datasets/ai4ug/luganda_sft_v5

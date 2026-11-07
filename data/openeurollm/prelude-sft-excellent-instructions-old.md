# openeurollm/Prelude-SFT-Excellent-Instructions-Old

## Resumen

Prelude-SFT-Excellent-Instructions-Old es un checkpoint de ajuste supervisado (SFT) del modelo base Prelude 9B, desarrollado por el proyecto OpenEuroLLM. Se trata de un modelo denso de 9.101.947.904 parámetros orientado a generación de texto conversacional, obtenido tras dos épocas de entrenamiento sobre el dataset OpenEuroLLM-Excellent-SFT a partir del checkpoint birgermoell/oellm-9b-128k-theta32m-prelude-anneal300b. El sufijo "Old" indica que este checkpoint precede a la introducción de condicionamiento explícito de instrucciones de razonamiento (thinking), por lo que puede generar bloques de pensamiento vacíos incluso con el modo thinking activado.

El modelo emplea una arquitectura transformer densa con tokenizer de 256k entradas y una longitud de secuencia máxima de entrenamiento de 32.768 tokens, aunque el nombre del modelo base sugiere una ventana de contexto de 128k. El entrenamiento consumió 58.309.862.656 tokens de entrada procesados a lo largo de 55.836 pasos, con supervisión únicamente sobre turnos del asistente.

Su relevancia es principalmente documental y de investigación: forma parte de la familia de checkpoints intermedios que OpenEuroLLM publica junto con sus recursos de entrenamiento, y sirve como referencia para comparar el efecto del condicionamiento de thinking en versiones posteriores del mismo modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3, según tags) |
| Parametros totales | 9.101.947.904 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens en entrenamiento (nombre del modelo base sugiere 128k) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el proyecto lo describe como multilingüe) |
| Licencia | no disponible (sin licencia específica asignada al checkpoint; consultar base y dataset) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 9,1 mil millones de parámetros, etiquetado como perteneciente a la familia Qwen3. El checkpoint base (oellm-9b-128k-theta32m-prelude-anneal300b) sugiere variantes de atención con 32 cabezas y ventana de 128k, aunque el ajuste SFT se realizó con una longitud máxima de secuencia de 32.768 tokens y empaquetado (packing) activado. El tokenizer es openeurollm/tokenizer-256k, con un vocabulario de 256.000 entradas.

El entrenamiento SFT se ejecutó durante 2 épocas y 55.836 pasos, con una tasa de aprendizaje de 8e-5, decaimiento lineal y un 3% de warmup. Se usó AdamW (β₁=0.9, β₂=0.95, ε=1e-8, weight decay=0), clipping de gradiente de 1.0 y pérdida calculada solo sobre los turnos del asistente. Las respuestas supervisadas parcialmente truncadas se conservaron con advertencia (`truncated_span_action: warn`). El entrenamiento se realizó en BF16 con FlashAttention 3 y kernels Liger, usando DeepSpeed ZeRO-2 con gradient checkpointing no reentrante, sobre 32 GPUs NVIDIA H100 distribuidas en 8 nodos de MareNostrum 5. Se procesaron 58.309.862.656 tokens de entrada en total entre ambas épocas. No hubo asignación explícita de instrucciones `/think` o `/no_think` durante el entrenamiento, lo que constituye la diferencia clave respecto a checkpoints posteriores.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat estilo Qwen incluida en el checkpoint.
- Razonamiento y respuesta a instrucciones tras el ajuste SFT sobre OpenEuroLLM-Excellent-SFT.
- Capacidad multilingüe heredada del modelo base (el proyecto OpenEuroLLM se orienta a lenguas europeas), aunque la lista concreta de idiomas no está publicada.
- Modo thinking disponible en la plantilla de chat, pero sin condicionamiento explícito: puede producir bloques de pensamiento vacíos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación sobre ajuste SFT: el checkpoint permite reproducir y analizar el efecto de dos épocas de SFT sobre un base de 9B, con todos los hiperparámetros y revisiones de datos documentados, lo que facilita estudios de ablación reproducibles.
- Comparación de versiones de thinking: al carecer de condicionamiento `/think`, sirve como línea base para medir cuánto mejora la versión posterior (Prelude-SFT-Excellent-Instructions) en tareas de razonamiento.
- Generación de texto conversacional en prototipos: con 32k tokens de contexto de entrenamiento, puede gestionar diálogos multi-turno de longitud media en entornos de prueba.
- Evaluación de modelos multilingües europeos: útil para benchmarks internos de calidad por idioma dentro del ecosistema OpenEuroLLM.
- Fine-tuning posterior: al ser un checkpoint intermedio con pesos safetensors y tokenizer propio, puede servir de punto de partida para ajustes específicos de dominio.
- Docencia y formación: ejemplo documentado de pipeline completo de SFT (DeepSpeed, FlashAttention 3, Liger) sobre infraestructura HPC europea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB para pesos; en 4 bits, en torno a 5-6 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para BF16 sin cuantizar; RTX 4090 (24 GB) puede alojar el modelo en BF16 justo al límite o en cuantizaciones de 8 bits con holgura.
- Cabe en GPU de consumo: sí, en RTX 4090 con cuantización; en GPUs de 16 GB probablemente solo en 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp/Ollama (previa conversión a GGUF) y Transformers con la plantilla de chat incluida.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Prelude-SFT-Excellent-Instructions-Old | 9,1B | 32k en SFT (base 128k) | no disponible | Sin condicionamiento de thinking |
| Prelude-SFT-Excellent-Instructions | 9B (aprox.) | no disponible | no disponible | Versión posterior con thinking condicionado |
| oellm-9b-256k-theta64m-prelude-anneal300b-instruct-sft | 9B | no disponible | no disponible | Variante instruct con tokenizer 256k y theta64m |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas para una comparación cuantitativa.

## Limitaciones y advertencias

- Puede generar bloques de pensamiento vacíos incluso con thinking activado, por ausencia de condicionamiento `/think` y `/no_think` en el entrenamiento.
- Riesgo de alucinación inherente a modelos de 9B ajustados con SFT; no se documentan evaluaciones de fidelidad.
- Contexto efectivo limitado a 32.768 tokens durante el ajuste, aunque el base declare 128k; el rendimiento más allá de esa longitud no está garantizado.
- Idiomas soportados no documentados explícitamente; la cobertura multilingüe debe validarse empíricamente.
- Licencia no asignada al checkpoint: es imprescindible revisar las licencias del modelo base y del dataset antes de cualquier uso comercial.
- Es un checkpoint intermedio ("Old"), no una versión final recomendada para producción.
- Solo contiene pesos de inferencia y tokenizer; no incluye estado de optimizador ni de reanudación de entrenamiento.

## Enlaces

- [Hugging Face: openeurollm/Prelude-SFT-Excellent-Instructions-Old](https://huggingface.co/openeurollm/Prelude-SFT-Excellent-Instructions-Old)
- [Modelo base: birgermoell/oellm-9b-128k-theta32m-prelude-anneal300b](https://huggingface.co/birgermoell/oellm-9b-128k-theta32m-prelude-anneal300b/tree/c5b5a9fffdb8d09fe5071c5fa99028bdd76eb235)
- [Dataset: openeurollm/OpenEuroLLM-Excellent-SFT](https://huggingface.co/datasets/openeurollm/OpenEuroLLM-Excellent-SFT/tree/c4ee55804f256c5f8cc4a6ef3fdecbe4a4ea95e0)
- [Tokenizer: openeurollm/tokenizer-256k](https://huggingface.co/openeurollm/tokenizer-256k/tree/94bae05cf351c4feb435d6a73c2aa8edfd88ae04)
- [Repositorio de entrenamiento: OpenEuroLLM/post-training](https://github.com/OpenEuroLLM/post-training)
- [Taskboard #416](https://github.com/OpenEuroLLM/Taskboard/issues/416)
- [Checkpoint relacionado: Prelude-SFT-Excellent-Instructions](https://huggingface.co/openeurollm/Prelude-SFT-Excellent-Instructions)
- [Colección Prelude en Hugging Face](https://huggingface.co/collections/openeurollm/prelude)
- [Página del proyecto Prelude 9B en OpenEuroLLM](https://www.openeurollm.eu/prelude)

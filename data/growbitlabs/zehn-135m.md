# GrowBitLabs/zehn-135m

## Resumen

Zehn 135M es un modelo de lenguaje de tipo base, decoder-only, desarrollado por GrowBitLabs y publicado en Hugging Face bajo licencia Apache 2.0. Con 134.997.792 parámetros según la model card (147.580.704 según los tensores safetensors del repositorio), se posiciona en la categoría de modelos ultraligeros orientados a experimentación e investigación más que a uso en producción. Su arquitectura es híbrida: combina 12 capas de DeltaNet con compuertas (gated) y 4 capas de atención con grouped-query attention (GQA), sobre las que se montan bloques feed-forward con mezcla de expertos dispersa (MoE) de 4 expertos enrutados con top-2 y un experto compartido.

El modelo se entrenó desde cero sobre una mezcla de 1,2 GB de texto derivada del corpus smollm-corpus (70% FineWeb-Edu-Dedup y 30% Cosmopedia v2), durante 32.000 pasos de optimizador, lo que equivale a aproximadamente 1.049 millones de posiciones de token de entrenamiento. Se distribuye como checkpoint final de preentrenamiento, sin ajuste por instrucciones ni alineamiento por preferencias (RLHF/DPO), por lo que funciona como modelo de completado de texto, no como asistente conversacional.

Su relevancia actual es doble: por un lado, sirve como banco de pruebas reproducible de arquitecturas híbridas DeltaNet + MoE a escala pequeña; por otro, su inclusión de pesos en formato GGUF con arquitectura personalizada (`zehn`) lo convierte en un caso interesante para quienes trabajan en runtimes de inferencia alternativos, ya que `llama.cpp` estándar no puede ejecutarlo. No obstante, la ausencia de benchmarks públicos y de validación en contextos largos limita seriamente cualquier afirmación sobre su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only híbrida: 12 capas gated DeltaNet + 4 capas de atención con GQA, con bloques FFN de mezcla de expertos dispersa (MoE) |
| Parametros totales | 134.997.792 según model card; 147.580.704 según tensores safetensors |
| Parametros activos | No disponible (MoE con 4 expertos enrutados top-2 + 1 experto compartido; no se publica el recuento de parámetros activos) |
| Longitud de contexto | Entrenamiento con secuencias de 1.024 tokens; longitud máxima configurada de 330.000 tokens (no validada) |
| Tipos de cuantizacion | No disponible (se distribuye FP16 en safetensors y GGUF F16; no se listan cuantizaciones adicionales) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16, Transformers y nativo), GGUF (FP16, arquitectura `zehn` personalizada) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only híbrido con 16 capas en total: 12 capas basadas en gated DeltaNet (un mecanismo de atención lineal con estado recurrente) y 4 capas de atención estándar con grouped-query attention (12 cabezas de consulta, 4 cabezas de clave/valor). El tamaño oculto es de 768 y el vocabulario de 16.384 tokens SentencePiece BPE. Las capas feed-forward emplean mezcla de expertos dispersa con 4 expertos enrutados, enrutamiento top-2 y un experto compartido. La implementación en Transformers es código personalizado incluido en el repositorio, por lo que requiere `trust_remote_code=True` al cargar el modelo.

El preentrenamiento se realizó durante 32.000 pasos de optimizador con un batch efectivo de 32 secuencias de 1.024 tokens, lo que suma aproximadamente 1.049 mil millones de posiciones de token. El corpus fuente contenía 268.444.137 tokens en 735.831 documentos, por lo que hubo reutilización de muestras. La mezcla de texto (1,2 GB) se preparó a partir de la revisión fijada `3ba9d605774198c5868892d7a8deda78031a781f` de HuggingFaceTB/smollm-corpus: 70% FineWeb-Edu-Dedup y 30% Cosmopedia v2. Los ajustes principales fueron cómputo de proyecciones en BF16, AdamW, learning rate máximo de 2e-4, 1.000 pasos de warmup, weight decay 0.1, gradient clipping en 1.0 y semilla 42. La configuración completa está en `metadata/training_config.json`. No se documenta ninguna innovación de inferencia como decodificación especulativa; la innovación principal es la propia combinación DeltaNet + MoE a esta escala.

## Capacidades

- Generación de texto por completado: el modelo continúa un prompt sin plantilla de chat ni formato conversacional.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene roles de sistema/usuario.
- Razonamiento y conocimiento limitados por escala y corpus: la model card declara explícitamente que no se hacen afirmaciones sobre razonamiento, código, matemáticas o precisión factual.
- Capacidades multilingües: solo inglés declarado en los metadatos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Contexto largo: la configuración admite hasta 330.000 tokens, pero no hay validación más allá de los 1.024 tokens de entrenamiento.

## Casos de uso

- Investigación en arquitecturas híbridas: sirve para reproducir y estudiar el comportamiento de capas DeltaNet combinadas con atención GQA y MoE a escala pequeña, comparando curvas de pérdida y estabilidad frente a transformers densos equivalentes.
- Experimentación con runtimes de inferencia personalizados: al incluir pesos nativos y GGUF con arquitectura `zehn`, es útil para desarrolladores que implementan operadores DeltaNet y MoE en motores propios o en forks de `llama.cpp`.
- Generación de texto de relleno en pruebas de pipelines: con 135M parámetros y FP16, permite validar integraciones de `transformers`, tokenización SentencePiece y flujos de `generate()` con un coste de cómputo mínimo.
- Docencia y demostraciones de preentrenamiento: su configuración de entrenamiento documentada (corpus, hiperparámetros, número de pasos) facilita explicar el ciclo completo de preentrenamiento de un modelo base.
- Evaluación de técnicas de cuantización: al ser ultraligero, es un candidato práctico para medir el impacto de cuantizaciones sobre perplejidad en modelos con MoE y atención lineal, aunque el autor no publica cuantizaciones listas.
- Prototipado de completado de texto en inglés: para tareas de autocompletado simple o generación de texto genérico en entornos de bajo recursos donde la calidad no sea crítica y se apliquen salvaguardas.
- Análisis de comportamiento de contexto largo: permite estudiar empíricamente la degradación de un modelo configurado para 330.000 tokens pero entrenado con 1.024, como caso de estudio de extrapolación de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la validación del checkpoint final sobre una porción de 21.152 tokens de la mezcla de entrenamiento:

| Fuente de validación | Cross-entropy | Perplejidad | Tokens |
|---|---:|---:|---:|
| Mezcla de entrenamiento retenida | 2,9731 | 19,55 | 21.152 |

El autor advierte que se trata de una porción pequeña de 64 batches y no de un benchmark completo, y que no se hacen afirmaciones sobre seguimiento de instrucciones, razonamiento, código, precisión factual, seguridad ni calidad en contexto largo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,3 GB solo para pesos (147,6M parámetros × 2 bytes); con activaciones y caché, cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso CPU; también tarjetas de datacenter (A100, H100) aunque resultan sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con soporte para FP16, incluidas las integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía soportada. `llama.cpp` estándar no puede ejecutar el GGUF porque los operadores DeltaNet y MoE de Zehn no están implementados. vLLM, TGI y Ollama no están documentados como compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Zehn 135M | 135M (147,6M en safetensors) | 1.024 entrenamiento; 330.000 configurado | Híbrida DeltaNet + GQA + MoE | Apache 2.0 | Hugging Face, safetensors y GGUF |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 | Transformer denso | Apache 2.0 | Hugging Face, ampliamente soportado |
| Pythia-160M (EleutherAI) | 160M | 2.048 | Transformer denso | Apache 2.0 | Hugging Face |
| MobileLLM-125M (Meta) | 125M | 2.048 | Transformer denso con embedding sharing | No disponible en la información | Hugging Face |

La comparación con SmolLM-135M es especialmente pertinente porque Zehn 135M usa una revisión fijada del corpus smollm-corpus, aunque con distinta composición y arquitectura. No se dispone de datos de rendimiento comparables para Zehn 135M, por lo que no es posible establecer una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni alineamiento por preferencias: no debe usarse como asistente conversacional.
- Riesgo elevado de alucinación, repetición, sesgo y contenido ofensivo o inseguro, según reconoce el propio autor.
- Conocimiento y razonamiento limitados por la escala (135M) y por el corpus (268M tokens únicos, con reutilización de muestras).
- Solo inglés declarado; no hay soporte multilingüe documentado.
- Contexto: aunque la configuración permite 330.000 tokens, el entrenamiento usó 1.024; calidad, memoria y comportamiento numérico más allá de esa longitud no están establecidos.
- Sin evaluación de seguridad ni de sesgos; no apto para decisiones médicas, legales, financieras o de alto impacto.
- Compatibilidad de despliegue restringida: el GGUF usa arquitectura personalizada y no funciona en `llama.cpp` estándar; la carga en Transformers exige `trust_remote_code=True`, lo que implica ejecutar código del repositorio.
- Licencia Apache 2.0 para pesos y código, pero los datasets de entrenamiento conservan sus propios términos (identificados como ODC-By en el manifiesto), que deben revisarse por separado.
- Discrepancia entre el recuento de parámetros de la model card (134.997.792) y el de los tensores safetensors (147.580.704), que conviene verificar antes de dimensionar recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GrowBitLabs/zehn-135m
- Dataset de entrenamiento (smollm-corpus): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Repositorio de llama.cpp (no compatible con la arquitectura `zehn`): https://github.com/ggerganov/llama.cpp
- Paper de DeltaNet: no disponible en la información proporcionada
- Blog o demo oficial de GrowBitLabs: no disponible en la información proporcionada

# GrowBitLabs/zehn-135m

## Resumen

Zehn 135M es un modelo de lenguaje base de tipo decoder-only desarrollado por GrowBitLabs, con 134.997.792 parámetros según la model card (147.580.704 según los pesos reales en safetensors). Se trata de un checkpoint final de preentrenamiento en el paso de optimizador 32.000, publicado como modelo de completación y no como asistente instruido: no emplea plantilla de chat y debe alimentarse con texto para que lo continúe.

Su interés técnico reside en la arquitectura híbrida: combina 12 capas de DeltaNet con compuertas (gated DeltaNet), 4 capas de atención con grouped-query attention y bloques feed-forward de mezcla de expertos dispersa (MoE) con 4 expertos enrutados, enrutamiento top-2 y 1 experto compartido. Esta combinación es poco habitual en modelos de este tamaño y lo convierte en un banco de pruebas para investigar arquitecturas alternativas a la atención completa en modelos compactos.

El modelo se entrenó sobre una mezcla de 1,2 GB de texto derivada de smollm-corpus (70% FineWeb-Edu-Dedup y 30% Cosmopedia v2), con 1.049 millones de posiciones de token de entrenamiento efectivas y una longitud de secuencia de 1.024 tokens. Se distribuye bajo licencia Apache 2.0 en formatos safetensors, GGUF y pesos nativos, aunque el GGUF no es ejecutable con llama.cpp estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only híbrida: 12 capas gated DeltaNet + 4 capas de atención GQA, con MoE en las capas feed-forward |
| Parametros totales | 134.997.792 según model card; 147.580.704 según safetensors |
| Parametros activos | No disponible (MoE con 4 expertos enrutados, top-2 y 1 compartido; no se publica el recuento activo) |
| Longitud de contexto | Entrenamiento con 1.024 tokens; longitud máxima configurada de 330.000 tokens (no validada) |
| Tipos de cuantizacion | No disponible (solo se distribuye FP16 en safetensors y GGUF F16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16), GGUF F16, pesos nativos Zehn (FP16) |

Otros datos técnicos: tamaño oculto de 768, vocabulario de 16.384 tokens SentencePiece BPE, 12 cabezas de consulta y 4 cabezas clave/valor, checkpoint en el paso 32.000, precisión de exportación FP16. La implementación en Transformers es código personalizado y requiere `trust_remote_code=True`.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only híbrido de 16 capas: 12 capas usan gated DeltaNet, un mecanismo de atención lineal con estado recurrente y compuertas, y 4 capas usan atención estándar con grouped-query attention (12 cabezas de consulta, 4 de clave/valor). Las capas feed-forward son bloques MoE con 4 expertos enrutados, enrutamiento top-2 y un experto compartido. El tamaño oculto es 768 y el vocabulario de 16.384 tokens emplea SentencePiece BPE.

El preentrenamiento se realizó durante 32.000 pasos de optimizador con un batch efectivo de 32 secuencias de 1.024 tokens, lo que equivale a aproximadamente 1.049 millones de posiciones de token. El corpus fuente contenía 268.444.137 tokens y 735.831 documentos, por lo que hubo repetición de muestras a lo largo del entrenamiento. La mezcla de 1,2 GB de texto se preparó a partir de la revisión fijada `3ba9d605774198c5868892d7a8deda78031a781f` de HuggingFaceTB/smollm-corpus, con un 70% de FineWeb-Edu-Dedup y un 30% de Cosmopedia v2 (libros de texto sintéticos, tutoriales y relatos). Los ajustes principales fueron cálculo de proyecciones en BF16, optimizador AdamW, tasa de aprendizaje máxima de 2e-4, 1.000 pasos de warmup, weight decay de 0,1, recorte de gradiente en 1,0 y semilla 42. No se aplicó RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto por completación: continúa un prompt de texto libre sin plantilla de chat.
- Modelado de lenguaje base: útil para experimentación en investigación, no para tareas de instrucción.
- Razonamiento y conocimiento factual limitados por el tamaño (135M) y el corpus de entrenamiento (268M tokens únicos).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo base sin alineación).
- Capacidades multilingües: solo inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Arquitectura híbrida DeltaNet + atención + MoE: relevante como objeto de estudio para investigación en arquitecturas eficientes.

## Casos de uso

- Investigación en arquitecturas híbridas: el modelo permite estudiar el comportamiento de capas gated DeltaNet combinadas con atención GQA y MoE en un tamaño manejable, comparando perplejidad y estabilidad numérica frente a transformers puros de parámetros similares.
- Experimentación con enrutamiento MoE: al tener 4 expertos enrutados con top-2 y un experto compartido, sirve para analizar patrones de enrutamiento, carga por experto y especialización en un modelo pequeño.
- Generación de texto de completación en prototipos: para tareas de continuación de texto en inglés donde no se requiera instrucción ni precisión factual, como demos de generación o pruebas de pipelines de inferencia.
- Base para ajuste fino supervisado: al ser un modelo base con licencia Apache 2.0, puede servir como punto de partida para experimentos de fine-tuning en dominios concretos en inglés, con presupuesto de cómputo reducido.
- Pruebas de cuantización y despliegue: su tamaño permite validar flujos de exportación, carga con `trust_remote_code` y evaluación de latencia en hardware de consumo antes de escalar a modelos mayores.
- Evaluación de toolchains de inferencia personalizadas: al requerir implementación propia de los operadores DeltaNet y MoE (no ejecutable en llama.cpp estándar), es útil para desarrolladores de runtimes que necesiten validar soporte de arquitecturas no convencionales.
- Docencia y formación: modelo pequeño y de licencia permisiva para explicar conceptos de MoE, atención lineal y preentrenamiento en cursos o talleres.

## Benchmarks y rendimiento

La model card solo publica resultados de validación del checkpoint final sobre una porción pequeña de 64 batches:

| Fuente de validación | Cross-entropy | Perplejidad | Tokens |
|---|---:|---:|---:|
| Mezcla de entrenamiento reservada | 2,9731 | 19,55 | 21.152 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que no se hacen afirmaciones sobre seguimiento de instrucciones, razonamiento, código, precisión factual, seguridad ni calidad en contexto largo.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos FP16 (aproximadamente 0,3 GB para 147,6M de parámetros), la inferencia cabe holgadamente en cualquier GPU con 2 GB o más; en CPU es viable con memoria RAM modesta.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también tarjetas de gama de entrada y GPUs de datacenter (A100, H100) sin problema, aunque sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer con al menos 2 GB de VRAM.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y `torch>=2.2`, `transformers>=4.40,<5`, safetensors y sentencepiece. El GGUF incluido no es ejecutable con llama.cpp estándar porque los operadores DeltaNet y MoE de Zehn no están implementados. No se indica soporte para vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Zehn 135M | 135M (147,6M en safetensors) | 1.024 tokens de entrenamiento; 330.000 configurado sin validar | Híbrida DeltaNet + GQA + MoE | Apache 2.0 | Base, solo inglés, sin benchmarks estándar |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 tokens | Transformer decoder-only | Apache 2.0 | Base e instruct, entrenado sobre smollm-corpus; benchmarks publicados |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Transformer decoder-only | Apache 2.0 | Mayor tamaño, multilingüe, base e instruct |

La comparación con SmolLM-135M es la más directa por tamaño y por compartir origen del corpus (smollm-corpus), aunque Zehn 135M introduce una arquitectura híbrida y MoE que SmolLM no tiene. No se dispone de datos de rendimiento comparables publicados para Zehn 135M más allá de la perplejidad de validación indicada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni alineación de preferencias: no debe usarse como asistente conversacional.
- Riesgo elevado de alucinación y de generar texto incorrecto, repetitivo, sesgado, ofensivo o inseguro, según advierte el propio autor.
- Conocimiento y razonamiento limitados por el tamaño (135M) y por un corpus de 268M tokens únicos, con repetición de muestras durante el entrenamiento.
- Solo inglés; no hay soporte multilingüe declarado.
- Aunque la configuración permite entradas de hasta 330.000 tokens, el entrenamiento usó secuencias de 1.024 tokens y la calidad, el uso de memoria y el comportamiento numérico más allá de esa longitud no están establecidos.
- No se ha realizado evaluación de seguridad ni de sesgos.
- El GGUF incluido no es compatible con llama.cpp estándar; requiere runtimes que implementen los operadores DeltaNet y MoE de Zehn.
- La carga en Transformers exige `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio.
- Uso comercial permitido por Apache 2.0, pero los datasets de entrenamiento conservan sus propios términos (el manifiesto del corpus los identifica como ODC-By y deben revisarse por separado).
- No usar como autoridad en decisiones médicas, legales, financieras o de alto impacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GrowBitLabs/zehn-135m
- Página de modelos abiertos de GrowBitLabs: https://growbitlabs.com/open-models
- Dataset smollm-corpus (HuggingFaceTB): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus

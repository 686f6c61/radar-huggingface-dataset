# Lythri/Lythri-Wink-2B-pt

## Resumen
Lythri-Wink-2B-pt es un modelo base preentrenado de tipo Mixture of Experts (MoE) desarrollado por Lythri, derivado de google/gemma-4-E2B mediante poda estructural y recuperación por destilación de conocimiento. Cuenta con 2.522.816.159 parámetros totales y 1.482 millones de parámetros activos según la model card, lo que lo sitúa en la categoría de modelos ligeros orientados a despliegue en dispositivo. Su propósito es servir como punto de partida para preentrenamiento continuado, ajuste supervisado e investigación, no como asistente conversacional directo.

El modelo reduce el número de capas del decodificador de 35 a 31 y la dimensión PLE de 256 a 128, manteniendo el tamaño oculto del modelo de lenguaje y la estructura de cabezas de atención. La anchura de la FFN se recorta hasta aproximadamente el 60% del modelo original. La recuperación se realizó mediante destilación del profesor sobre unos 813 millones de tokens con una longitud de contexto de entrenamiento de 8K.

Su relevancia actual radica en la licencia Apache 2.0, más permisiva que la del modelo original de Google, y en su orientación a entornos con recursos limitados. No obstante, el propio autor advierte que el rendimiento real en contextos largos es notablemente inferior al que sugiere la métrica de recuperación a nivel de bit, por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), derivado de Gemma 4 |
| Parametros totales | 2.522.816.159 |
| Parametros activos | 1.48B (aproximadamente) |
| Longitud de contexto | 8K tokens de entrenamiento (contexto de inferencia no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only con arquitectura MoE heredada de Gemma 4, sometido a una poda estructural que reduce el número de capas de 35 a 31, la dimensión PLE de 256 a 128 y la anchura de la FFN a cerca del 60% del original. Se conservan el tamaño oculto del modelo de lenguaje y la estructura de cabezas de atención. El resultado son 2.52B parámetros totales con 1.48B activos, frente a los 4.63B totales y 2.28B activos del modelo profesor.

La recuperación de capacidad se llevó a cabo mediante destilación de conocimiento desde google/gemma-4-E2B sobre aproximadamente 813 millones de tokens (checkpoint exportado en el paso 1550), con una longitud de contexto de entrenamiento de 8K. En el punto de validación previo a la exportación (paso 1500) se registraron una KL de validación de 0.3241, una entropía cruzada del estudiante de 2.552 y del profesor de 2.270. El autor indica que la recuperación a nivel de bit es del 97.24%, pero advierte que el error se acumula a lo largo del contexto, de modo que el rendimiento real es considerablemente peor. No se documenta uso de RLHF ni DPO.

## Capacidades
- Generación de texto autoregresiva como modelo base, sin plantilla de chat ni ajuste de instrucciones.
- Razonamiento y conocimiento factual de nivel básico, según los benchmarks publicados.
- Comprensión lectora y respuesta a preguntas de sentido común (BoolQ, PIQA, SocialIQA, WinoGrande).
- Capacidad multimodal declarada en las etiquetas del repositorio (image-text-to-text), aunque la model card no detalla el funcionamiento de la torre visual ni su entrenamiento.
- Punto de partida para preentrenamiento continuado y ajuste supervisado sobre dominios específicos.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades multilingües: no disponibles; no se especifican idiomas.

## Casos de uso
- Preentrenamiento continuado en dominio especializado: al ser un modelo base con licencia Apache 2.0, puede someterse a preentrenamiento adicional sobre corpus propios (legal, médico, técnico) sin las restricciones de uso del modelo Gemma original, partiendo de 8K tokens de contexto.
- Ajuste supervisado para asistentes de nicho: el autor proporciona un ejemplo de entrenamiento con `Trainer` y `DataCollatorForLanguageModeling`, lo que facilita adaptar el modelo a tareas concretas de generación con datasets JSONL de campo `text`.
- Investigación en poda y destilación: constituye un caso de estudio reproducible de reducción estructural de un MoE con métricas de recuperación publicadas (KL, CE de estudiante y profesor), útil para comparar técnicas de compresión.
- Despliegue en dispositivo con recursos limitados: con 1.48B parámetros activos y 2.52B totales, el modelo apunta a entornos edge donde un modelo de 4.63B no cabría, aunque no se publican requisitos de VRAM ni cuantizaciones.
- Clasificación y respuesta a preguntas de conocimiento general: sus resultados en MMLU (38.50) y BoolQ (64.98) permiten usarlo como base para tareas de QA extractiva tras un ajuste ligero.
- Generación de texto condicionada en pipelines de datos: puede emplearse para aumento de datos o generación de borradores en dominios acotados, siempre con revisión humana dado el riesgo de alucinación de un modelo base sin alineación.
- Evaluación comparativa de modelos pequeños: sirve como referencia en estudios que comparen modelos de menos de 3B parámetros con licencias permisivas frente a alternativas como Gemma 3 1B PT.

## Benchmarks y rendimiento

| Benchmark | Gemma 3 1B PT | Lythri-Wink-2B-pt |
|---|---:|---:|
| MMLU | 26.50 | 38.50 |
| ARC-C | 38.40 | 40.10 |
| ARC-E | 73.00 | 65.99 |
| HellaSwag | 62.30 | 57.45 |
| PIQA | 73.80 | 71.60 |
| BoolQ | 63.20 | 64.98 |
| SocialIQA | 48.90 | 42.43 |
| WinoGrande | 58.20 | 58.33 |

Evaluado sin plantilla de chat y con token BOS antepuesto. El autor afirma que el modelo alcanza una inteligencia similar a Gemma 3 1B PT, con mayor escala de conocimiento y licencia más permisiva. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MT-Bench) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: aproximadamente 5 GB solo para pesos (2.52B parámetros × 2 bytes), más overhead de activaciones y caché KV.
- El tamaño del repositorio es de 5.1 GB, coherente con pesos en bf16.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs consumer con 8 GB o más de VRAM en bf16, y en GPUs de 6-8 GB con cuantización a 8 bits, aunque no se publican cuantizaciones oficiales.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, así como en Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: transformers (soporte oficial vía `AutoModelForCausalLM`); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | MMLU | Licencia |
|---|---:|---:|---:|---:|---|
| Lythri-Wink-2B-pt | 2.52B | 1.48B | 8K (entrenamiento) | 38.50 | Apache 2.0 |
| google/gemma-4-E2B (profesor) | 4.63B | 2.28B | no disponible | no disponible | Gemma (uso restringido) |
| Gemma 3 1B PT | ~1B | ~1B | no disponible | 26.50 | Gemma (uso restringido) |

Frente al modelo profesor, Lythri-Wink-2B-pt reduce parámetros totales un 45.6% y activos un 35.1%, a costa de una pérdida de capacidad que el autor cuantifica en una recuperación del 97.24% a nivel de bit con acumulación de error en contexto. Frente a Gemma 3 1B PT, mejora en MMLU (+12 puntos), ARC-C, BoolQ y WinoGrande, pero empeora en ARC-E, HellaSwag, PIQA y SocialIQA. La ventaja principal es la licencia Apache 2.0 frente a las licencias Gemma.

## Limitaciones y advertencias
- No es un modelo de instrucciones: no incluye plantilla de chat ni ajuste conversacional; su uso directo como asistente produce resultados pobres.
- El autor advierte explícitamente que, pese a la métrica de recuperación del 97.24% a nivel de bit, el error se acumula a lo largo del contexto y el rendimiento real es mucho peor de lo que sugiere esa cifra.
- Riesgo de alucinación elevado al tratarse de un modelo base sin alineación (RLHF/DPO no documentados).
- Idiomas soportados no especificados; no hay garantía de calidad fuera del inglés.
- Contexto de entrenamiento limitado a 8K tokens; no se documenta la longitud de contexto efectiva en inferencia ni técnicas de extensión.
- La capacidad multimodal aparece solo como etiqueta del repositorio; no hay documentación sobre la torre visual, su entrenamiento o su rendimiento.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware muy restringido.
- Sesgos conocidos: no documentados; al derivar de Gemma 4, es previsible que herede sesgos del corpus original, pero no hay análisis publicado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de un modelo Gemma; conviene revisar las condiciones de la licencia Gemma original en cuanto a obligaciones de atribución y restricciones de uso.
- Modelo con pocas descargas (538) y 4 likes en el momento de la consulta: ecosistema y validación comunitaria muy limitados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Lythri/Lythri-Wink-2B-pt
- Modelo de instrucciones: https://huggingface.co/Lythri/Lythri-Wink-2B
- Perfil del autor en Hugging Face: https://huggingface.co/Lythri
- Perfil en ModelScope: https://www.modelscope.cn/profile/Spike8086
- Informe técnico (Zenodo): https://zenodo.org/records/23179312
- DOI: https://doi.org/10.5281/zenodo.23179311
- Modelo base original: https://huggingface.co/google/gemma-4-E2B

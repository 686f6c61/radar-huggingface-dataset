# lijinyan89/olmo3-190m-zh-sft

## Resumen

`lijinyan89/olmo3-190m-zh-sft` es un modelo de lenguaje de tipo transformer decoder-only de 187 millones de parámetros, derivado de la familia OLMo 3 y especializado en chino mediante un proceso de continuación de preentrenamiento y posterior ajuste supervisado (SFT). Lo publica el usuario de Hugging Face `lijinyan89` bajo licencia Apache 2.0, y su predecesor directo es `lijinyan89/olmo3-190m-zh-continue`.

El modelo resuelve el problema de disponer de un checkpoint OLMo 3 pequeño adaptado al chino y con capacidad de seguir instrucciones en formato conversacional. Su relevancia es fundamentalmente educativa y experimental: por su tamaño reducido (0,4 GB en safetensors) puede ejecutarse en hardware muy modesto, incluso en CPU, y sirve como base para estudiar el pipeline completo de adaptación lingüística y SFT sobre arquitecturas abiertas.

La información pública disponible es escasa: la model card es breve, no incluye resultados de benchmarks ni detalles sobre la composición exacta del corpus de continuación. El contexto máximo declarado en la configuración de entrenamiento es de 2048 tokens, y el ajuste se realizó sobre el dataset `cmz1024/llm101-olmo3-zh-demo-data` con una tasa de aprendizaje de 5e-05.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3) |
| Parametros totales | 187.011.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 187 millones de parámetros perteneciente a la familia OLMo 3, aunque la model card no detalla la configuración interna (número de capas, dimensión oculta, cabezas de atención, uso de RoPE, normalización, etc.). El proceso de entrenamiento consta de dos fases documentadas: primero una continuación de preentrenamiento sobre el checkpoint `lijinyan89/olmo3-190m-zh-continue` para reforzar el chino, y después un ajuste supervisado (SFT) sobre datos en formato conversacional para adquirir capacidad de seguir instrucciones.

La configuración de SFT reportada incluye una tasa de aprendizaje de 5e-05 (elegida explícitamente baja para mitigar el olvido catastrófico), un warmup del 5 % y una longitud máxima de secuencia de 2048 tokens. El dataset de SFT es `cmz1024/llm101-olmo3-zh-demo-data`, derivado a su vez del archivo `sft_t2t_mini.jsonl` publicado por el usuario `gongjy` en ModelScope. No se documentan el número total de tokens de entrenamiento, la composición del corpus de continuación ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto en chino con formato conversacional e instrucciones de tipo chat, aprendidas durante la fase de SFT.
- Seguimiento de instrucciones básicas (instruction following) en tareas de respuesta directa.
- Generación de texto libre y respuestas a preguntas sencillas en chino.
- Capacidad limitada de razonamiento y matemáticas, condicionada por el tamaño de 187 M de parámetros.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al chino según los metadatos; no se declara soporte de otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Experimentación educativa con pipelines de SFT: el modelo permite reproducir de principio a fin un flujo de continuación de preentrenamiento más ajuste supervisado sobre una arquitectura abierta, con un coste computacional mínimo.
- Prototipado de asistentes conversacionales en chino en entornos con recursos limitados: puede desplegarse en CPU o en GPUs de gama baja para validar interfaces de chat antes de migrar a modelos mayores.
- Generación de texto de relleno o borradores en chino: útil para tareas de autocompletado o generación de respuestas cortas donde no se requiere alta precisión.
- Evaluación comparativa de técnicas de adaptación lingüística: sirve como baseline de 187 M de parámetros para medir el efecto de la continuación de preentrenamiento y del SFT en chino frente al modelo OLMo 3 original.
- Fine-tuning posterior específico de dominio: al ser Apache 2.0 y pesar 0,4 GB, es una base asequible para ajustes adicionales en dominios concretos (atención al cliente, documentación técnica) en chino.
- Docencia y divulgación: permite ilustrar en un taller o clase cómo se comporta un LLM pequeño tras SFT, incluyendo fenómenos de olvido catastrófico y sobreajuste, sin necesidad de infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,4 GB de pesos más overhead de activaciones y caché KV; en la práctica cabe en menos de 1 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 0,2 GB de pesos; en 4 bits, alrededor de 0,1 GB (no se publican checkpoints cuantizados oficiales).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, T4); también funciona en CPU para inferencia interactiva.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, así como en Apple Silicon mediante Metal.
- Opciones de despliegue: `transformers` (según la model card), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF a partir de los safetensors; vLLM y TGI son viables pero sobredimensionados para este tamaño.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera una latencia de decodificación muy baja en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| lijinyan89/olmo3-190m-zh-sft | 187 M | 2048 | zh | Apache 2.0 | SFT sobre OLMo 3 en chino; sin benchmarks publicados |
| OLMo 3 base (familia) | ~190 M (variante pequeña) | no disponible | en (principalmente) | Apache 2.0 | Modelo original del que deriva; sin adaptación al chino |
| Qwen2.5-0.5B | ~500 M | 32 768 | multilingüe | Apache 2.0 | Mayor tamaño y contexto; benchmarks públicos disponibles |
| SmolLM2-135M | 135 M | 8192 | en (principalmente) | Apache 2.0 | Alternativa pequeña en inglés; no especializada en chino |

La comparación es aproximada: no se dispone de benchmarks del modelo evaluado, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Tamaño muy reducido (187 M de parámetros): la calidad de generación, el razonamiento y la factualidad serán limitados en comparación con modelos de miles de millones de parámetros.
- Riesgo elevado de alucinación: al ser un modelo pequeño y con SFT sobre un dataset de demostración, es probable que invente datos ante preguntas factuales.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo se declara soporte de chino; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Dataset de SFT de tipo demo (`sft_t2t_mini.jsonl`): la cobertura de instrucciones es reducida y puede producir respuestas estereotipadas o pobres fuera de los dominios vistos.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad; se recomienda auditoría antes de cualquier uso en producción.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Sin versiones cuantizadas oficiales ni pipeline declarado en Hugging Face, lo que puede complicar el despliegue directo en algunos entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lijinyan89/olmo3-190m-zh-sft
- Modelo base (continuación en chino): https://huggingface.co/lijinyan89/olmo3-190m-zh-continue
- Dataset de SFT: https://huggingface.co/datasets/cmz1024/llm101-olmo3-zh-demo-data
- Origen del dataset en ModelScope: https://modelscope.cn/models/gongjy

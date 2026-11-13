# OP12138/qwen3-4b-ablation-res-adjusted

## Resumen

Qwen3-4B ImmuneCoT Ablation (Response-only + Base Adjustment) es un ajuste fino de pleno parámetro sobre Qwen/Qwen3-4B, desarrollado por el usuario OP12138 como modelo de control para el artículo ImmuneCoT. No es un modelo de propósito general, sino una ablación experimental diseñada para responder a una pregunta concreta de revisión por pares: si la ruta de respuesta (Response path) por sí sola, con el mismo ajuste de base que el método principal, basta para obtener el comportamiento deseado en materia de seguridad y control de la cadena de pensamiento.

El modelo parte de la arquitectura transformer densa de Qwen3-4B, con 4.022.468.096 parámetros, y se entrena mediante un objetivo de divergencia KL forward sobre log-ratios, con λ_res = 0,7 y λ_rec = 0. Emplea 1.571 registros de un dataset de seguridad (`iasd_data_decontam_v1.json`) durante 2 épocas (100 pasos de optimizador), con una longitud máxima de 4.608 tokens y 2.048 de finalización.

Su relevancia es metodológica más que práctica: documenta de forma explícita una inestabilidad de entrenamiento reproducible con LR 5e-6 y justifica el uso de LR 5e-7 como corrección de estabilidad, manteniendo el resto de hiperparámetros del método. Está pensado para investigadores que replican o auditan ImmuneCoT, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (max_length de entrenamiento: 4.608 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors bf16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-4B y se ajusta con entrenamiento de pleno parámetro en bf16, usando DeepSpeed ZeRO-2 con offload del optimizador a CPU. El objetivo es una divergencia KL forward (beta = 0) sobre log-ratios, con clip por token de 10, top-k 256, fusión `res_adjusted` y λ_res = 0,7, λ_rec = 0, y un clamp de base de -20. La formulación del objetivo es P_immune = log Pr′ − log P_Ref, es decir, la ruta de respuesta con el mismo ajuste de base que el método principal.

El entrenamiento usa 1.571 registros de `iasd_data_decontam_v1.json`, 2 épocas y 100 pasos de optimizador, con batch efectivo de 32 (4 por dispositivo × acumulación de gradiente 8 × 1 GPU), AdamW fusionado, LR 5e-7 con decaimiento lineal, sin warmup y clip de norma 1.0. El rollout se realiza con vLLM colocado en el mismo proceso (memoria 0.15, temperatura 0.7, top-p 0.95, top-k 20) y semilla 42 para modelo y datos. La innovación técnica documentada es la corrección de estabilidad: con LR 5e-6 el objetivo de log-ratio agudiza la distribución y produce picos de norma de gradiente de ~90-135 que degeneran el modelo en ruido de tokens, observado de forma reproducible en 3 ejecuciones independientes; LR 5e-7 evita esa degeneración sin alterar λ_res ni el resto de hiperparámetros del método. El checkpoint final es `checkpoint-100`, guardado solo con pesos (`save_only_model=True`).

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen3-4B.
- Razonamiento con cadena de pensamiento (chain-of-thought), dado que el modelo base y el dataset de entrenamiento giran en torno a CoT.
- Control de respuestas orientado a seguridad: el ajuste busca modular la probabilidad de respuestas seguras frente a una referencia mediante el log-ratio.
- Comportamiento de ablación: actúa como control experimental de la ruta Response-only con ajuste de base, comparable con `qwen3-4b-ablation-matched-response`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`; no se documentan otros idiomas.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible en la informacion proporcionada.

## Casos de uso

- Replicación de experimentos de seguridad en LLM: sirve como control de ablación para verificar si la ruta Response-only con ajuste de base reproduce los resultados del método ImmuneCoT principal; se compara directamente con `qwen3-4b-ablation-matched-response`.
- Auditoría de estabilidad de entrenamiento: el modelo documenta el fallo reproducible con LR 5e-6 y la corrección con LR 5e-7, útil para investigadores que ajustan objetivos de log-ratio KL y necesitan diagnosticar picos de norma de gradiente.
- Estudio de control de cadena de pensamiento: permite analizar cómo un objetivo de log-ratio con λ_res = 0,7 modula la distribución de respuestas respecto a una referencia, en el contexto de seguridad y CoT.
- Evaluación de datasets de seguridad decontaminados: el entrenamiento sobre `iasd_data_decontam_v1.json` (1.571 registros) sirve para estudiar el efecto de datasets pequeños y decontaminados en el comportamiento de seguridad.
- Reproducción de pipelines de ajuste fino con vLLM colocado: la configuración de rollout (vLLM en el mismo proceso, memoria 0.15) es un ejemplo práctico para pipelines de RL/KL con generación en línea.
- Comparación de hiperparámetros de fusión: al mantener λ_res y el resto de hiperparámetros del método principal, permite aislar el efecto de la ruta de respuesta frente a configuraciones con λ_rec distinto de cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.022 millones de parámetros, en bf16 los pesos ocupan aproximadamente 8,0 GB, por lo que se necesita margen adicional para el contexto y las cachés KV.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamaño, el modelo encaja en GPUs de 16 GB o más en bf16 (por ejemplo, RTX 4090, A100, H100), aunque el autor no publica recomendaciones.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 16 GB o más de VRAM en bf16; no confirmado por el autor.
- Opciones de despliegue: el autor usa vLLM colocado para el rollout durante el entrenamiento; no se documentan otras opciones (llama.cpp, Ollama, TGI) ni se publican pesos en GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| OP12138/qwen3-4b-ablation-res-adjusted | 4.022.468.096 | no disponible (entrenamiento 4.608) | apache-2.0 | Ablación ImmuneCoT, ruta Response-only con ajuste de base, LR 5e-7 | Hugging Face, 0 descargas |
| OP12138/qwen3-4b-ablation-matched-response | no disponible | no disponible | no disponible | Control de formato emparejado, LR 5e-6, mismos datos/semilla/épocas | Referenciado en la model card |
| Qwen/Qwen3-4B | ~4.000 millones | no disponible | apache-2.0 | Modelo base de propósito general | Hugging Face |

La comparativa se limita a los modelos citados en la información disponible; no se aportan datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Modelo de investigación: es una ablación de control para un artículo, no un modelo listo para producción; no se documentan evaluaciones de calidad general.
- Inestabilidad de entrenamiento documentada: con LR 5e-6 el modelo degenera en ruido de tokens de forma reproducible; solo la configuración con LR 5e-7 es estable.
- Idiomas: únicamente inglés según la model card; no se garantiza comportamiento en castellano ni en otros idiomas.
- Sesgos conocidos: no disponible en la informacion proporcionada; al derivar de Qwen3-4B, puede heredar los sesgos del modelo base y del dataset de seguridad empleado.
- Riesgo de alucinación: no evaluado en la informacion proporcionada.
- Licencia: apache-2.0, lo que permite uso comercial según los términos de dicha licencia; sin embargo, el propósito experimental del modelo desaconseja su uso en producción sin evaluación previa.
- Contexto: la longitud de contexto nativa no se documenta; el entrenamiento usa max_length de 4.608 tokens, lo que puede limitar el comportamiento más allá de esa longitud.
- Trazabilidad: 0 descargas y 0 likes en el momento de la consulta; no hay demos ni papers enlazados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/OP12138/qwen3-4b-ablation-res-adjusted
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Modelo de control emparejado citado en la model card: `qwen3-4b-ablation-matched-response` (no se proporciona URL directa en la informacion disponible)
- Paper, blog, repositorio o demo de ImmuneCoT: no disponible en la informacion proporcionada

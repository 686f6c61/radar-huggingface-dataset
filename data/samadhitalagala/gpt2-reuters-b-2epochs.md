# samadhitalagala/gpt2-reuters-B-2epochs

## Resumen

gpt2-reuters-B-2epochs es un modelo de lenguaje causal de estilo GPT-2 entrenado **desde inicialización aleatoria** (sin pesos preentrenados) por el usuario samadhitalagala sobre el conjunto de datos de artículos de Reuters (`ingeniumacademy/reuters_articles`), empleando el tokenizador `ingeniumacademy/gpt2-reuters-tokenizer`. Se trata de un trabajo académico correspondiente a la asignación CS4681 Assignment 02, no de un modelo orientado a producción.

El modelo emplea una arquitectura transformer decoder-only clásica de GPT-2 con 6 capas, 8 cabezas de atención y una dimensión de embedding de 512, sumando 45.670.400 parámetros. Su ventana de contexto es de solo 256 tokens, lo que lo limita a fragmentos de texto cortos. El entrenamiento se realizó durante 2 épocas con una tasa de aprendizaje de 0,0005 (coseno con 5 % de warmup), batch size de 32 y un tiempo total de 7,1 minutos, lo que refleja un cómputo muy reducido.

Su relevancia es fundamentalmente didáctica: sirve como ejemplo reproducible de entrenamiento from-scratch de un LM pequeño y como referencia de pérdidas alcanzables en un corpus periodístico con recursos mínimos. No está pensado para uso comercial ni para tareas de razonamiento complejo, y su licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT-2) |
| Parametros totales | 45.670.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 canónica: 6 capas de transformer decoder-only, 8 cabezas de atención y dimensión de embedding de 512, con una longitud de contexto de 256 tokens. No incorpora innovaciones como atención lineal, decodificación especulativa ni mezcla de expertos; es un transformer denso convencional.

El entrenamiento parte de inicialización aleatoria, sin pesos preentrenados, sobre el dataset de artículos de Reuters (título y cuerpo). Se ejecutaron 2 épocas con learning rate de 0,0005, scheduler coseno con 5 % de warmup, batch size de 32 y un tiempo total de 7,1 minutos. La pérdida de validación fue de 4,919 (perplejidad 136,8) y la de test de 4,684 (perplejidad 108,2). No se documenta en la información disponible el uso de RLHF, DPO ni de un volumen explícito de tokens de entrenamiento.

## Capacidades

- Generación de texto causal en inglés, limitada a continuaciones de hasta 256 tokens de contexto.
- Modelado de lenguaje sobre texto periodístico de Reuters (estilo de noticias, títulos y cuerpo).
- Generación de texto condicionada por un prompt corto; no dispone de modo de razonamiento, thinking mode ni capacidades de visión o audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Experimentación académica y reproducibilidad: sirve para replicar el pipeline de entrenamiento from-scratch de un LM pequeño y comparar perplejidades con configuraciones alternativas (número de capas, épocas, learning rate).
- Generación de titulares o continuaciones de noticias en inglés: el modelo ha visto el estilo de Reuters y puede producir fragmentos periodísticos cortos, siempre con revisión humana por su alta perplejidad.
- Docencia sobre tokenización y modelado causal: permite ilustrar el impacto del tokenizador `ingeniumacademy/gpt2-reuters-tokenizer` en la pérdida y en la calidad de las muestras.
- Pruebas de infraestructura de despliegue: al ocupar 0,4 GB en safetensors, es útil para validar pipelines de inferencia (transformers, llama.cpp tras conversión) en entornos con recursos mínimos.
- Baseline de comparación: puede emplearse como referencia de un modelo pequeño entrenado desde cero frente a modelos GPT-2 preentrenados en tareas de perplejidad sobre el mismo corpus.
- Generación de texto de relleno o sintético para pruebas de sistemas downstream: dado su bajo coste computacional, puede alimentar tests de carga o de formato sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento reportados por el autor son las pérdidas de validación y test:

| Metrica | Valor |
|---|---|
| Pérdida de validación | 4,919 |
| Perplejidad de validación | 136,8 |
| Pérdida de test | 4,684 |
| Perplejidad de test | 108,2 |
| Tiempo de entrenamiento | 7,1 min |
| Épocas | 2 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (45,67 M de parámetros ocupan aproximadamente 183 MB en fp32 y unos 91 MB en fp16); el repositorio completo pesa 0,4 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutarlo.
- Cabe holgadamente en GPU consumer (GTX 1060, RTX 3060, RTX 4090, etc.) y también en CPU.
- Opciones de despliegue: `transformers` (carga directa desde safetensors), conversión a GGUF para `llama.cpp` u `Ollama` (no se publican archivos GGUF oficiales), y `vLLM` o `TGI` para servir, aunque el tamaño reducido hace que estas últimas sean innecesarias.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt2-reuters-B-2epochs | 45,67 M | 256 | From-scratch, 2 épocas, Reuters | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 | Preentrenado en WebText | MIT | Hugging Face, ampliamente disponible |
| GPT-2 medium (OpenAI) | 355 M | 1024 | Preentrenado en WebText | MIT | Hugging Face |

Frente a GPT-2 small, este modelo tiene aproximadamente un tercio de los parámetros, una cuarta parte del contexto y una perplejidad de test de 108,2 sobre su corpus específico, muy superior a la de un GPT-2 preentrenado en texto general; la comparación directa no es concluyente porque los corpus difieren. No se dispone de datos de benchmarks comparables con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo entrenado desde cero con solo 2 épocas y 7,1 minutos de cómputo: la calidad de generación es muy limitada y la perplejidad de test (108,2) indica un ajuste pobre al lenguaje natural.
- Ventana de contexto de solo 256 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Entrenado únicamente en inglés y sobre un corpus periodístico de Reuters; el dominio y el registro están muy acotados.
- Riesgo elevado de alucinación y de generar texto incoherente o repetitivo, especialmente fuera del dominio de noticias.
- Sesgos potenciales heredados del corpus de Reuters, no documentados por el autor.
- Licencia no especificada: no se puede asumir permiso para uso comercial; es necesario contactar con el autor antes de cualquier despliegue en producción.
- Sin datos de evaluación estándar ni de seguridad; no apto para producción sin validación adicional.
- El autor lo publica como trabajo de una asignatura (CS4681 Assignment 02); no hay garantía de mantenimiento ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/samadhitalagala/gpt2-reuters-B-2epochs
- Dataset: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
- Log de entrenamiento: `results.json` dentro del repositorio del modelo
- Paper, blog o demo adicionales: no disponibles en la información proporcionada

# losercheers/Qwen3.5-9B-Base

## Resumen

Qwen3.5-9B-Base es un modelo fundacional multimodal de la familia Qwen3.5, publicado por el equipo Qwen de Alibaba. Este repositorio concreto (`losercheers/Qwen3.5-9B-Base`) redistribuye los pesos preentrenados en formato Hugging Face Transformers bajo licencia Apache 2.0. Se trata de un modelo causal con codificador de visión, pensado exclusivamente para preentrenamiento y ajuste fino, no para interacción directa con usuarios finales.

La arquitectura combina atención lineal Gated DeltaNet con atención completa con compuertas (gated attention) en un diseño híbrido por capas, junto con una red feed-forward de 12 288 dimensiones intermedias. El modelo tiene 8 953 803 264 parámetros totales (≈9B), dimensión oculta de 4096, 32 capas y un vocabulario de 248 320 tokens. Su contexto nativo es de 262 144 tokens, extensible hasta 1 010 000.

Su relevancia actual radica en tres factores: fusión temprana de visión y lenguaje en un único modelo fundacional, soporte declarado de 201 idiomas y dialectos, y entrenamiento con multi-token prediction (MTP) más un esquema de RL escalado a entornos multiagente. Todo ello bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con Gated DeltaNet (atención lineal) y gated attention, más codificador de visión |
| Parametros totales | 8 953 803 264 (≈9B) |
| Parametros activos | no disponible (el model card no especifica si el FFN es sparse MoE en esta variante de 9B) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 010 000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 201 idiomas y dialectos (según el model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM y SGLang) |
| Dimension oculta | 4096 |
| Numero de capas | 32 |
| Layout de capas | 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Vocabulario | 248 320 tokens (con padding) |
| Dimension FFN intermedia | 12 288 |
| Cabezas Gated DeltaNet | 32 para V, 16 para QK; dimensión de cabeza 128 |
| Cabezas Gated Attention | 16 para Q, 4 para KV; dimensión de cabeza 256; RoPE dim 64 |
| Pipeline | image-text-to-text |
| Tamano del repo | 17.9 GB |

## Arquitectura y entrenamiento

El modelo emplea un transformer causal con un layout híbrido repetido ocho veces: tres bloques con Gated DeltaNet (atención lineal con compuertas) seguidos de un bloque con gated attention completa. Esta combinación busca reducir el coste computacional de la atención en contextos largos manteniendo capacidad expresiva. La FFN tiene dimensión intermedia de 12 288, y el modelo incorpora un codificador de visión con fusión temprana de tokens multimodales, lo que permite paridad con Qwen3 en tareas de razonamiento, código, agentes y comprensión visual, según el autor.

El entrenamiento consta de fase de preentrenamiento y postentrenamiento. Se aplicó multi-token prediction (MTP) entrenado con múltiples pasos, y un esquema de RL escalado a millones de entornos de agentes con distribuciones de tareas progresivamente complejas. El model card declara una eficiencia de entrenamiento multimodal cercana al 100 % respecto al entrenamiento solo de texto, gracias a infraestructura asíncrona de RL. Los tokens de control `<|im_start|>` y `<|im_end|>` están entrenados para permitir PEFT tipo LoRA con la plantilla de chat oficial sin necesidad de reajustar embeddings, algo relevante dado el vocabulario de 248 320 tokens. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento multimodal (texto e imagen) en un único modelo fundacional.
- Comprensión visual: el pipeline declarado es image-text-to-text, con codificador de visión integrado por fusión temprana.
- Razonamiento, código y matemáticas: el model card declara paridad con Qwen3 y superioridad sobre Qwen3-VL en benchmarks de razonamiento, código y agentes.
- Soporte multilingüe amplio: 201 idiomas y dialectos según el autor.
- Capacidad de agentes y razonamiento multi-paso: entrenado con RL sobre entornos multiagente a gran escala.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque el entrenamiento orientado a agentes lo hace plausible; conviene verificarlo empíricamente.
- Multi-token prediction (MTP): permite decodificación especulativa nativa y aceleración de inferencia.
- Contexto largo: 262 144 tokens nativos, extensible hasta 1 010 000.
- Al ser un modelo base, no incluye alineación conversacional completa; está pensado para ajuste fino y experimentos de in-context learning.

## Casos de uso

- Ajuste fino supervisado (SFT) para dominios verticales: al ser un modelo base Apache 2.0, se puede adaptar con LoRA o full fine-tuning a sectores como legal, sanitario o financiero, aprovechando el vocabulario amplio y el contexto de 262K tokens.
- Procesamiento de documentos largos con imagen: informes escaneados, contratos o papers con figuras pueden procesarse en una sola pasada gracias al contexto nativo de 262 144 tokens y al codificador de visión.
- Investigación en aprendizaje multimodal: el modelo permite experimentar con fusión temprana de tokens de imagen y texto, y comparar con arquitecturas de fusión tardía.
- Generación de código en pipelines de CI/CD: aunque el model card no detalla tool calling, su entrenamiento orientado a agentes y su rendimiento declarado en código lo hacen candidato para asistentes de revisión y generación de parches tras validación empírica.
- Agentes autónomos multi-paso: el entrenamiento con RL en entornos multiagente lo orienta a tareas de planificación y ejecución de herramientas, adecuado para prototipos de agentes en investigación.
- Despliegue multilingüe: con 201 idiomas declarados, sirve para sistemas de traducción, resumen o atención al cliente en mercados con diversidad lingüística.
- Experimentos de decodificación especulativa: el entrenamiento con MTP permite estudiar y explotar decodificación especulativa nativa para reducir latencia en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card únicamente declara cualitativamente paridad con Qwen3 y superioridad sobre Qwen3-VL en razonamiento, código, agentes y comprensión visual, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18 GB solo para pesos (8,95B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contextos moderados.
- Cuantización a 8 bits: ~9 GB de pesos; a 4 bits: ~4,5-5 GB de pesos, aunque no se confirman formatos GGUF/AWQ oficiales en la información disponible.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para contextos largos y despliegue en producción; RTX 4090 (24 GB) para BF16 con contexto moderado o cuantización para contextos largos.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con contexto limitado, y en GPUs de 12-16 GB si se aplica cuantización (sujeto a disponibilidad de pesos cuantizados, no confirmada).
- Opciones de despliegue: Transformers, vLLM y SGLang (declarados compatibles en el model card); llama.cpp/Ollama no se mencionan y requerirían conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. El diseño híbrido con Gated DeltaNet y MTP está orientado a alto throughput y baja latencia, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Base (este) | ≈9B | 262 144 (ext. 1 010 000) | Texto + imagen | Apache 2.0 | Hugging Face (repo de terceros) |
| Qwen3 (familia, referencia del model card) | no disponible en esta ficha | no disponible | Texto | no disponible | Hugging Face (Qwen) |
| Qwen3-VL (familia, referencia del model card) | no disponible en esta ficha | no disponible | Texto + imagen | no disponible | Hugging Face (Qwen) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Es un modelo base preentrenado: no está alineado para conversación directa ni para uso en producción sin ajuste fino y evaluación previa.
- Riesgo de alucinación inherente a modelos fundacionales; no se han publicado evaluaciones de fidelidad en la información disponible.
- Sesgos: no se documentan sesgos conocidos ni mitigaciones en el model card; con 201 idiomas declarados, la cobertura y calidad pueden variar mucho entre idiomas.
- El repositorio es una redistribución de terceros (`losercheers`), no el repositorio oficial de Qwen; conviene verificar la integridad de los pesos y la procedencia antes de usarlos en producción.
- Aunque la licencia es Apache 2.0, el `license_link` apunta al LICENSE del repositorio oficial de Qwen; verificar términos aplicables.
- La extensión de contexto hasta 1 010 000 tokens es declarada por el autor, pero no se confirman métricas de degradación en contextos extremos.
- No se confirma soporte explícito de tool calling ni formatos cuantizados oficiales; validar empíricamente antes de integrar.
- Uso comercial permitido por licencia Apache 2.0, pero sin garantías del autor sobre el comportamiento del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/losercheers/Qwen3.5-9B-Base
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.5-9B-Base/blob/main/LICENSE
- Logo de la familia: https://qianwen-res.oss-accelerate.aliyuncs.com/logo_qwen3.5.png

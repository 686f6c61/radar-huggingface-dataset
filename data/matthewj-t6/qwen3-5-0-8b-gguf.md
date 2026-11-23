# matthewj-t6/Qwen3.5-0.8B-GGUF

## Resumen
Qwen3.5-0.8B es un modelo causal de lenguaje con codificador de visión desarrollado por Alibaba Qwen, presentado como parte de la familia Qwen3.5. Con 752 millones de parámetros reales (etiquetado comercialmente como 0.8B), está diseñado para prototipado, ajuste fino específico de tarea e investigación, según indica la propia model card. Emplea una arquitectura híbrida que combina Gated DeltaNet (atención lineal) con atención con compuertas y capas FFN, lo que busca alto rendimiento de inferencia con baja latencia.

La relevancia de este modelo radica en su enfoque multimodal unificado (early fusion de tokens de imagen y texto), su contexto nativo de 262.144 tokens y su soporte declarado de 201 idiomas y dialectos. Frente a modelos de su escala, el fabricante lo posiciona como una alternativa eficiente para despliegues con recursos limitados.

Esta ficha concreta corresponde a una cuantización GGUF publicada por el usuario matthewj-t6, derivada del modelo base Qwen/Qwen3.5-0.8B y generada con la herramienta Unsloth (formato Dynamic 2.0). El repositorio tiene 14,1 GB de tamaño y 496 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con codificador de visión; híbrida Gated DeltaNet + Gated Attention + FFN |
| Parametros totales | 752.393.024 (etiquetado 0.8B) |
| Parametros activos | no disponible (la model card menciona MoE disperso en la familia, pero no se detalla para esta variante) |
| Longitud de contexto | 262.144 tokens nativo |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0); niveles concretos no disponibles |
| Idiomas soportados | 201 idiomas y dialectos (según model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |

## Arquitectura y entrenamiento
El modelo sigue un diseño híbrido: 24 capas dispuestas como 6 bloques de la forma 3 × (Gated DeltaNet → FFN) seguidos de 1 × (Gated Attention → FFN). La dimensión oculta es 1024, el embedding de tokens es de 248.320 entradas (con padding) y la dimensión intermedia de la FFN es 3584. Gated DeltaNet emplea 16 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; la atención con compuertas usa 8 cabezas para Q y 2 para KV con dimensión 256 y RoPE de 64 dimensiones. La salida LM está atada al embedding de tokens. Se entrena con MTP (multi-token prediction) de múltiples pasos.

Según la model card, el entrenamiento combina preentrenamiento y postentrenamiento con fusión temprana de tokens multimodales, RL escalado en entornos multiagente y una infraestructura que logra cerca del 100 % de eficiencia de entrenamiento multimodal respecto a texto solo. No se detalla el número de tokens de entrenamiento ni la composición exacta del dataset en la información disponible.

## Capacidades
- Generación de texto y razonamiento en modo no-thinking (los benchmarks publicados se refieren a este modo).
- Comprensión de imagen y texto (pipeline image-text-to-text), con codificador de visión integrado.
- Capacidades de código, matemáticas y agentes, según los benchmarks de la familia.
- Soporte multilingüe amplio: 201 idiomas y dialectos declarados.
- Conversacional (tag conversational en Hugging Face).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Tool calling y function calling: no confirmado explícitamente en la información disponible.
- Modo thinking: no confirmado para esta variante en la información disponible.

## Casos de uso
- Prototipado rápido de asistentes conversacionales: el tamaño de 0.8B y el formato GGUF permiten ejecutar el modelo en portátiles y estaciones de trabajo sin GPU dedicada, ideal para validar flujos de diálogo antes de escalar a variantes mayores.
- Procesamiento de documentos largos: con 262.144 tokens de contexto nativo, puede resumir o extraer información de contratos, informes o transcripciones extensas en una sola pasada.
- Análisis de imágenes en pipelines de soporte: al ser image-text-to-text, puede describir capturas, extraer texto de imágenes o responder preguntas sobre diagramas en herramientas internas.
- Ajuste fino específico de dominio: la licencia Apache 2.0 y el soporte de Unsloth permiten adaptar el modelo a vocabulario técnico (legal, médico, industrial) con requisitos de cómputo modestos.
- Clasificación y etiquetado de texto multilingüe: los 201 idiomas declarados lo hacen útil para moderación o enrutamiento de contenido en plataformas internacionales.
- Despliegue en el borde (edge): cuantizado en GGUF, puede integrarse en aplicaciones de escritorio o dispositivos con poca VRAM para tareas de resumen y extracción sin conexión.
- Generación de código asistida en entornos con recursos limitados: útil para autocompletado o explicación de fragmentos en IDE, aunque con menor fiabilidad que modelos mayores.

## Benchmarks y rendimiento
La model card incluye una tabla de benchmarks de lenguaje en modo no-thinking. Los datos disponibles en la información proporcionada están truncados; se reproduce lo visible:

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro (non-thinking) | 69,6 | 40,2 | 55,3 | dato truncado en la fuente |

No se han publicado en la información disponible el resto de resultados (HumanEval, GSM8K, benchmarks de visión, etc.) ni la comparación completa.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~0,75B parámetros, las cuantizaciones GGUF típicas (Q4-Q8) suelen requerir entre 0,5 y 1,5 GB, pero no se confirma en la fuente.
- GPU recomendadas: no especificadas en la información disponible.
- GPU de consumo: por tamaño, es probable que quepa en GPUs consumer (RTX 3060, RTX 4060, etc.) e incluso en CPU, pero no hay confirmación oficial.
- Opciones de despliegue: el modelo base es compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers; el GGUF es apto para llama.cpp y Ollama (no confirmado explícitamente para este repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-0.8B (este) | 752M | 262.144 | Apache 2.0 | GGUF en HF |
| Qwen3-1.7B | 1,7B (aprox.) | no disponible | no disponible | HF |
| Qwen3-4B-2507 | 4B (aprox.) | no disponible | no disponible | HF |
| Qwen3.5-2B | 2B (aprox.) | no disponible | no disponible | HF |

Los datos de rendimiento comparativo están parcialmente truncados en la fuente; solo MMLU-Pro está disponible para los modelos de referencia (69,6 / 40,2 / 55,3). No se dispone de comparativas con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias
- El propio autor indica que el uso previsto es prototipado, ajuste fino e investigación, no producción crítica.
- Riesgo de alucinación inherente a modelos de 0.8B, especialmente en razonamiento complejo y matemáticas.
- Los benchmarks publicados corresponden al modo no-thinking; el rendimiento en modo thinking no está confirmado para esta variante.
- La información sobre tool calling, agentes y modo thinking no está confirmada explícitamente.
- El repositorio GGUF es de un tercero (matthewj-t6), no oficial de Qwen; conviene verificar integridad y procedencia antes de usarlo en producción.
- Aunque la licencia es Apache 2.0, el uso comercial debe revisarse contra la licencia del modelo base enlazada por el autor.
- Sesgos conocidos: no documentados en la información disponible.
- El contexto de 262.144 tokens es nativo, pero el rendimiento efectivo en ventanas tan largas no está validado en la fuente.

## Enlaces
- Repositorio GGUF: https://huggingface.co/matthewj-t6/Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guía Unsloth para Qwen3.5: https://unsloth.ai/docs/models/qwen3.5
- Guía de fine-tuning Unsloth: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Documentación Unsloth Dynamic 2.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Qwen Chat: https://chat.qwen.ai

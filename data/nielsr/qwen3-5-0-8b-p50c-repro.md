# nielsr/qwen3.5-0.8b-p50c-repro

## Resumen

Qwen3.5-0.8B es un modelo de lenguaje y vision de tipo causal con codificador visual, desarrollado por el equipo Qwen de Alibaba. Esta ficha concreta corresponde a la reproduccion publicada por el usuario nielsr (`nielsr/qwen3.5-0.8b-p50c-repro`), un fine-tuning del modelo base `Qwen/Qwen3.5-0.8B-Base`. El modelo resuelve tareas multimodales de imagen-texto a texto, razonamiento, codigo y agentes, y resulta relevante por su escala reducida (873 millones de parametros reales segun safetensors) combinada con una ventana de contexto nativa de 262.144 tokens.

La arquitectura combina capas de atencion lineal (Gated DeltaNet) con capas de atencion completa (Gated Attention) en un esquema hibrido, junto con una red feed-forward por capa. El modelo esta disenado para prototipado, ajuste fino especifico de tarea y fines de investigacion o desarrollo, segun indica la model card del autor original.

Su interes practico radica en que ofrece capacidades multimodales y de contexto largo en un tamano que cabe en hardware de consumo, con licencia Apache 2.0 y compatibilidad con Transformers, vLLM, SGLang y KTransformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con codificador visual; hibrida Gated DeltaNet + Gated Attention |
| Parametros totales | 873.438.784 (0,8B) |
| Parametros activos | no disponible (la model card no confirma configuracion MoE para esta variante) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | 201 idiomas y dialectos (segun model card del modelo base); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers) |

## Arquitectura y entrenamiento

El modelo emplea un transformer causal hibrido con 24 capas organizadas en un patron de 6 bloques repetidos, cada uno compuesto por 3 subcapas de Gated DeltaNet seguidas de 1 subcapa de Gated Attention. La dimension oculta es 1024, con 16 cabezas de atencion lineal para V y 16 para QK (dimension de cabeza 128) en las capas DeltaNet, y 8 cabezas de consulta y 2 de clave-valor (dimension 256) en las capas de atencion completa, con RoPE de dimension 64. La red feed-forward tiene dimension intermedia 3584. El embedding de tokens es de 248.320 entradas (con padding) y esta atado a la salida del LM. Incluye entrenamiento con multi-token prediction (MTP) en varios pasos.

Segun la model card del modelo base, el entrenamiento combina pre-entrenamiento y post-entrenamiento con fusion temprana de tokens multimodales, lo que permite paridad con la generacion Qwen3 y superar a los modelos Qwen3-VL en razonamiento, codigo, agentes y comprension visual. Tambien se menciona escalado de RL en entornos multiagente y una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto al entrenamiento solo de texto. No se detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento en modo no-thinking (la model card reporta resultados de benchmark para este modo).
- Comprension de imagenes y texto combinados (pipeline image-text-to-text), con codificador visual integrado.
- Generacion de codigo y tareas de agentes, segun los benchmarks reportados por el autor del modelo base.
- Capacidades multilingues ampliadas a 201 idiomas y dialectos.
- Soporte de contexto largo de hasta 262.144 tokens, util para documentos extensos y conversaciones prolongadas.
- Entrenamiento con MTP (multi-token prediction), orientado a decodificacion especulativa y mayor throughput.
- Compatibilidad declarada con vLLM, SGLang, KTransformers y Transformers.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible para esta variante.

## Casos de uso

- Prototipado multimodal: usar el modelo para experimentar con pipelines de imagen-texto a texto en local, gracias a su tamano de 0,8B y su compatibilidad con Transformers.
- Atencion al cliente con contexto largo: gestionar conversaciones multi-turno y documentos de referencia extensos aprovechando la ventana de 262.144 tokens.
- Analisis de documentos e imagenes: extraer informacion de capturas, diagramas o documentos escaneados combinando el codificador visual con el LM.
- Generacion de codigo asistida en entornos con recursos limitados: el tamano reducido permite ejecutarlo en GPUs de consumo para autocompletado y revision de codigo.
- Fine-tuning especifico de dominio: la model card indica que el uso previsto incluye ajuste fino para tareas concretas, con licencia Apache 2.0 que facilita su adopcion comercial.
- Investigacion en arquitecturas hibridas: estudiar el comportamiento de Gated DeltaNet combinado con atencion completa en un modelo pequeno y abierto.
- Despliegue en el borde o en entornos con poca VRAM: servir el modelo con llama.cpp u Ollama (si se generan cuantizaciones GGUF) para asistentes locales multimodales.

## Benchmarks y rendimiento

Resultados reportados en la model card del modelo base (modo non-thinking):

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

No se han publicado en la informacion disponible resultados de benchmarks de codigo (HumanEval), matematicas (GSM8K) ni de vision para esta variante concreta.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 3-4 GB para contextos moderados.
- En cuantizacion de 8 bits: alrededor de 1 GB de pesos; en 4 bits, en torno a 0,5 GB, aunque no se confirman cuantizaciones oficiales en la informacion disponible.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con contexto largo; A100, H100 o RTX 4090 para maximizar throughput y contextos de 262.144 tokens.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, especialmente con cuantizacion.
- Opciones de despliegue: Transformers, vLLM, SGLang, KTransformers; llama.cpp u Ollama requeririan conversiones a GGUF no confirmadas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-0.8B (esta ficha) | 0,8B | 262.144 | Apache 2.0 | HuggingFace |
| Qwen3.5-2B | 2B (no confirmado) | no disponible | Apache 2.0 (segun modelo base) | HuggingFace |
| Qwen3-1.7B | 1,7B | no disponible | Apache 2.0 | HuggingFace |
| Qwen3-4B-2507 | 4B | no disponible | Apache 2.0 | HuggingFace |

En los benchmarks de la model card, Qwen3.5-0.8B obtiene resultados inferiores a Qwen3-1.7B, Qwen3.5-2B y Qwen3-4B-2507 en MMLU-Pro, MMLU-Redux y C-Eval, lo que es coherente con su menor numero de parametros. Su ventaja frente a ellos es el menor coste de inferencia y la ventana de contexto de 262.144 tokens.

## Limitaciones y advertencias

- Rendimiento limitado por escala: con 0,8B de parametros, los resultados en MMLU-Pro (29,7) y C-Eval (46,4) son notablemente inferiores a modelos de 2B y 4B; no es adecuado para tareas que exijan razonamiento complejo sin ajuste fino.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; conviene validar las salidas en produccion.
- Esta ficha corresponde a una reproduccion de terceros (`nielsr`), no al modelo oficial de Qwen; el comportamiento puede diferir del original.
- Idiomas: aunque la model card del modelo base declara 201 idiomas, no se detalla la calidad por idioma ni la lista concreta.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar el enlace de licencia del modelo base.
- Sin datos de benchmarks de vision, codigo ni matematicas para esta variante en la informacion disponible.
- Sin confirmacion de soporte de tool calling ni de cuantizaciones oficiales.

## Enlaces

- HuggingFace: https://huggingface.co/nielsr/qwen3.5-0.8b-p50c-repro
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE

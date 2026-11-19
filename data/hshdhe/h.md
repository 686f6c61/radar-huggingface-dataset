# hshdhe/h

## Resumen

hshdhe/h es un fine-tune publicado en Hugging Face por el usuario hshdhe sobre el modelo base Qwen/Qwen3.5-4B-Base de Alibaba Qwen. Se trata de un modelo multimodal de tipo image-text-to-text (visión-lenguaje) con 4.659.865.088 parámetros totales según los pesos en safetensors, empaquetado en formato transformers y con licencia Apache 2.0. El repositorio ocupa 9,3 GB y fue creado y actualizado el 19 de noviembre de 2026.

El modelo hereda la arquitectura híbrida de Qwen3.5: capas de atención lineal (Gated DeltaNet) combinadas con capas de atención con compuertas (Gated Attention), un codificador de visión y un contexto nativo de 262.144 tokens extensible hasta 1.010.000. La model card incluida corresponde a la del modelo base Qwen3.5-4B, por lo que las capacidades, benchmarks y especificaciones descritas deben atribuirse a la familia Qwen3.5 y no necesariamente al fine-tune concreto.

La relevancia de esta ficha es limitada: el repositorio no presenta descargas ni interacciones, no documenta el proceso de fine-tuning ni los datos empleados, y no incluye una model card propia. Cualquier evaluación de producción debería partir de la del modelo base y validarse empíricamente sobre el checkpoint publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; híbrido Gated DeltaNet + Gated Attention |
| Parámetros totales | 4.659.865.088 (4B según model card) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantización | no disponible (repo en safetensors; compatible con transformers, vLLM, SGLang, KTransformers) |
| Idiomas soportados | 201 idiomas y dialectos según la model card del base; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Qwen3.5-4B: 32 capas con un layout oculto de 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), dimensión oculta de 2560 y embeddings de tokens de 248.320 (con padding, atados a la salida LM). Las capas Gated DeltaNet emplean 32 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; las capas Gated Attention usan 16 cabezas para Q y 4 para KV con dimensión 256 y RoPE de 64 dimensiones. La FFN tiene dimensión intermedia de 9216. Incluye entrenamiento con multi-token prediction (MTP) en varios pasos y un codificador de visión con fusión temprana de tokens multimodales.

Según la model card del base, el entrenamiento combina pre-entrenamiento y post-entrenamiento, con aprendizaje por refuerzo escalado en entornos de millones de agentes y una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto al entrenamiento solo de texto. No se dispone de información sobre el dataset, el número de tokens ni el proceso específico de fine-tuning aplicado por hshdhe sobre el checkpoint base.

## Capacidades

- Generación de texto y razonamiento en dominios de conocimiento general y STEM.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text).
- Generación de código y tareas de agente, según los benchmarks de la familia Qwen3.5.
- Soporte multilingüe amplio: 201 idiomas y dialectos declarados en la model card del base.
- Capacidades de agente y razonamiento multi-paso heredadas del entrenamiento con RL a escala.
- Compatibilidad con tool calling y function calling a través de los frameworks indicados (transformers, vLLM, SGLang, KTransformers).
- Contexto largo de 262.144 tokens, extensible hasta 1.010.000.
- No se documenta modo thinking explícito ni soporte de audio en la información disponible.

## Casos de uso

- Análisis de documentos con imágenes: el modelo puede procesar páginas escaneadas, capturas o diagramas junto con texto gracias a su codificador de visión y su contexto de 262.144 tokens, útil para extracción de datos de facturas o informes.
- Asistencia técnica multimodal: atención al cliente que recibe capturas de pantalla de errores y texto en la misma conversación, manteniendo contexto multi-turno largo.
- Generación de código en pipelines: integración en CI/CD mediante tool calling y los frameworks compatibles (vLLM, SGLang) para revisión automática de parches o generación de tests.
- Agentes autónomos de navegación o automatización: el entrenamiento con RL en entornos de agentes y el contexto extensible permiten cadenas de razonamiento multi-paso con historial largo.
- Despliegue multilingüe: con 201 idiomas declarados, adecuado para plataformas de soporte o moderación de contenido en mercados regionales diversos.
- Procesamiento de documentación técnica: resumen y pregunta-respuesta sobre manuales extensos que superan los 100.000 tokens, aprovechando la extensibilidad de contexto hasta 1.010.000 tokens.
- Prototipado en hardware de consumo: con 4B parámetros, es viable en GPUs de gama alta para consumidores mediante cuantización, aunque el repo solo publica safetensors.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base Qwen3.5-4B (no específicos del fine-tune):

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible en el extracto | no disponible en el extracto |

El extracto de la model card se interrumpe durante la tabla de benchmarks; no se dispone de resultados completos para el resto de métricas (código, matemáticas, visión, agentes). No se han publicado benchmarks específicos del fine-tune hshdhe/h.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 16-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, en torno a 3 GB, más caché KV.
- GPU recomendadas para producción: A100 40/80 GB, H100, L40S; para desarrollo, RTX 4090 (24 GB) o RTX 3090 (24 GB) en FP16.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantización agresiva, en GPUs de 12-16 GB; el contexto largo de 262.144 tokens incrementa notablemente la memoria de la caché KV.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers (según la model card); llama.cpp u Ollama requerirían conversión a GGUF, no publicada en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hshdhe/h (Qwen3.5-4B fine-tune) | 4B | 262.144 (ext. 1.010.000) | 79,1 (base) | Apache 2.0 | Hugging Face |
| Qwen3.5-9B | 9B | no disponible | 82,5 | no disponible | Hugging Face |
| GPT-OSS-20B | 20B | no disponible | 74,8 | no disponible | no disponible |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE, 3B activos) | no disponible | 80,9 | no disponible | Hugging Face |

## Limitaciones y advertencias

- El repositorio no incluye model card propia: la documentación corresponde al modelo base y no describe el fine-tuning, los datos ni los objetivos del autor.
- Sin descargas ni interacciones: no hay evidencia de validación por la comunidad ni de calidad del checkpoint publicado.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos potenciales heredados del corpus de entrenamiento del base, no auditados en este fine-tune.
- La lista concreta de idiomas soportados no está disponible; solo se declara el número agregado (201) en la model card del base.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los datos de fine-tuning antes de uso comercial.
- El contexto largo (262.144 tokens) implica un coste de memoria de caché KV elevado; en GPUs de consumo puede requerir cuantización de la caché o reducción efectiva del contexto.
- No se publican pesos en GGUF ni cuantizaciones listas para llama.cpp u Ollama.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hshdhe/h
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo base post-entrenado: https://huggingface.co/Qwen/Qwen3.5-4B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE

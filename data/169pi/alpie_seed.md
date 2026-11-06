# 169Pi/Alpie_seed

## Resumen

Alpie Seed 9B es un modelo multimodal (texto, imagen y vídeo) desarrollado por 169Pi AI, construido sobre la arquitectura de Qwen3.5-9B y sometido a un post-entrenamiento orientado a reforzar razonamiento, seguimiento de instrucciones, código y comprensión visual. Cuenta con 9.409.813.744 parámetros y una ventana de contexto nativa de 262.144 tokens, lo que lo sitúa en la categoría de modelos de 9B con contexto largo.

La adaptación respecto al modelo base no implica un rediseño estructural: el autor conserva la arquitectura de Qwen3.5-9B y aplica un pipeline de post-entrenamiento en dos fases (SFT con LoRA y GRPO con DoRA), lo que permite reutilizar el ecosistema de herramientas y cuantizaciones del modelo original. Se distribuye en FP16 y en builds GGUF de 2, 3 y 4 bits, además de estar disponible en Ollama y Kaggle Models.

Su relevancia actual radica en combinar comprensión de imagen y vídeo, razonamiento con modo thinking, contexto de 262K tokens y licencia Apache 2.0 en un tamaño de 9B, con soporte declarado para once idiomas, diez de ellos índicos además del inglés. Es una opción a considerar cuando se necesita multimodalidad y contexto largo en hardware de gama media.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; layout híbrido 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | FP16; GGUF 2-bit, 3-bit y 4-bit |
| Idiomas soportados | en, hi, bn, mr, gu, te, ml, pa, kn, or, ta |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura de Qwen3.5-9B: 32 capas, dimensión oculta de 4096, embedding de tokens de 248.320 (con padding), FFN de dimensión intermedia 12.288 y un layout híbrido que intercala bloques de Gated DeltaNet (atención lineal, 32 cabezas para V y 16 para QK, dimensión de cabeza 128) con bloques de Gated Attention (16 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de dimensión 64). Incluye entrenamiento con multi-step MTP (multi-token prediction) y un vision encoder de 27 capas tipo Vision Transformer.

El post-entrenamiento consta de dos etapas. Primero se entrena un adaptador LoRA para mejorar seguimiento de instrucciones, calidad de respuesta y rendimiento en tareas. Después se aplica GRPO optimizando un adaptador DoRA entrenable mientras el adaptador SFT se mantiene congelado como política de referencia; esta fase usa base en 4-bit NF4 con doble cuantización y cómputo en BF16, y el adaptador entrenado se fusiona en el modelo base a su precisión original para el release. El entrenamiento se realizó en 8 GPU NVIDIA H100 con 3.034 pasos de GRPO distribuidos en cinco fases. La recompensa combina siete señales: corrección de la respuesta, penalización de alucinación, autoconsistencia, calidad educativa, preservación de estructura, penalización de repetición y penalización de longitud. No se especifican en la información disponible el volumen de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento, con soporte de modo thinking y non-thinking.
- Comprensión de imagen y de vídeo mediante el vision encoder integrado.
- Generación y razonamiento sobre código, reforzado en la fase de post-entrenamiento.
- Capacidades matemáticas y de razonamiento multi-paso, potenciadas por GRPO.
- Contexto largo de 262.144 tokens para documentos extensos y conversaciones prolongadas.
- Multilingüismo declarado en once idiomas: inglés y diez lenguas índicas (hindi, bengalí, maratí, guyaratí, telugu, malayalam, punyabí, canarés, oriya y tamil).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Análisis de documentos largos con soporte visual: informes con gráficos, tablas e imágenes que superan los 100.000 tokens pueden procesarse en una sola pasada gracias a la ventana de 262K, combinando lectura de texto e interpretación de figuras.
- Atención al cliente multilingüe en el mercado índico: el modelo cubre inglés e hindi, bengalí, tamil y otras lenguas índicas, lo que permite desplegar un único modelo para conversaciones multi-turno en varios idiomas sin pipelines separados.
- Descripción y análisis de vídeo: con el vision encoder de 27 capas y la ventana extendida, es viable resumir grabaciones, extraer eventos o responder preguntas sobre secuencias de vídeo en tareas de moderación o documentación.
- Asistencia a la programación: el post-entrenamiento refuerza código y razonamiento, por lo que puede integrarse en asistentes de IDE o revisión de parches, con modo thinking para problemas complejos y modo directo para autocompletado.
- Procesamiento de documentación técnica con OCR implícito: extracción de datos de capturas, planos o diagramas junto al texto asociado, útil en digitalización de archivos y pipelines de enriquecimiento documental.
- Despliegue en hardware de consumo: las builds GGUF de 2, 3 y 4 bits y las etiquetas de Ollama (desde 3,8 GB en q2) permiten ejecutar el modelo en estaciones de trabajo sin GPU de datacenter, para prototipado y tareas de razonamiento local.
- Tutoría educativa: la señal de recompensa incluye calidad educativa y preservación de estructura, lo que orienta el modelo a explicaciones estructuradas en contextos de aprendizaje.

## Benchmarks y rendimiento

La model card incluye una sección de resultados de benchmarks, pero en la información proporcionada solo se recogen las condiciones de evaluación: modo thinking activado (`enable_thinking: true`), `max_tokens: 65536` y `temperature: 0.0`, con puntuaciones del modelo en FP16 no aplicables a las variantes de 2, 3 y 4 bits. Las puntuaciones numéricas por benchmark (MMLU, HumanEval, GSM8K u otros) no están disponibles en el extracto consultado.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 19 GB solo para pesos (9,4B parámetros × 2 bytes), más overhead de activaciones y del vision encoder; se recomienda 24 GB o más.
- VRAM estimada en GGUF 4-bit: aproximadamente 5,6 GB según la etiqueta `alpie-seed:latest` de Ollama (tamaño de descarga).
- VRAM estimada en GGUF 3-bit: aproximadamente 4,6 GB (`alpie-seed:q3`).
- VRAM estimada en GGUF 2-bit: aproximadamente 3,8 GB (`alpie-seed:q2`).
- Etiqueta con visión: `alpie-seed:vision`, 6,6 GB, entrada de texto e imagen, contexto de 256K.
- GPU recomendadas: NVIDIA H100 o A100 para FP16 con contexto completo; RTX 4090 (24 GB) para FP16 ajustado o builds de 4 bits con contexto amplio.
- GPU de consumo: sí, cabe en tarjetas de 8 GB o más usando cuantizaciones de 2 a 4 bits; en 6 GB o menos conviene limitar el contexto.
- Opciones de despliegue: transformers, llama.cpp (GGUF), Ollama (`ollama run 169pi/alpie-seed`), Kaggle Models; vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alpie Seed 9B | 9,4B | 262.144 | Texto, imagen, vídeo | Apache 2.0 | HF, Ollama, Kaggle |
| Qwen3.5-9B (base) | 9B | 262.144 | Texto, imagen, vídeo | no disponible en la información | HF |
| Alternativas de 9B multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

El único comparable documentado en la información proporcionada es Qwen3.5-9B, del que Alpie Seed hereda arquitectura, contexto y modalidades; la diferencia es el post-entrenamiento (SFT + GRPO) y la distribución en GGUF y Ollama. No se dispone de datos de benchmarks para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Las puntuaciones de benchmarks publicadas corresponden al modelo en FP16 y no son aplicables a las variantes GGUF de 2, 3 y 4 bits; el rendimiento en cuantización baja puede degradarse de forma no documentada.
- No se detalla la composición del dataset de post-entrenamiento, por lo que no es posible evaluar sesgos de dominio ni de representación lingüística.
- El soporte multilingüe se declara para inglés y diez lenguas índicas; no se mencionan el español ni otras lenguas europeas, lo que limita su uso en esos mercados.
- El riesgo de alucinación se aborda solo mediante una señal de recompensa durante GRPO; no hay datos publicados de tasas de alucinación medidas.
- El modo thinking con `max_tokens` de hasta 65.536 implica un coste computacional elevado y latencias altas en contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3.5-9B; conviene verificar las condiciones del modelo base antes de un despliegue en producción.
- El modelo tiene un volumen bajo de adopción (64 descargas, 1 like en el momento de la consulta), lo que reduce la validación comunitaria disponible.
- No se documentan capacidades de tool calling ni de agentes, relevantes para integraciones en pipelines automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/169Pi/Alpie_seed
- GGUF en Hugging Face: https://huggingface.co/169Pi/Alpie_Seed_GGUF
- Ollama: https://ollama.com/169pi/alpie-seed
- Kaggle Models: https://www.kaggle.com/models/alpie/alpie-seed-9b
- GitHub del autor: https://github.com/169Pi
- X: https://x.com/169Pi_ai
- LinkedIn: https://www.linkedin.com/company/169pi
- YouTube: https://www.youtube.com/@169pi
- Instagram: https://www.instagram.com/169pi.ai/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B

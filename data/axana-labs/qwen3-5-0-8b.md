# axana-labs/Qwen3.5-0.8B

## Resumen

Qwen3.5-0.8B es un modelo multimodal (image-text-to-text) de la familia Qwen3.5, publicado en Hugging Face bajo el identificador `axana-labs/Qwen3.5-0.8B` y derivado del checkpoint base `Qwen/Qwen3.5-0.8B-Base`. Se trata de un modelo causal de lenguaje con codificador visual, orientado a prototipado, ajuste fino específico de tarea y fines de investigación o desarrollo, dado su reducido tamaño de 873 millones de parámetros.

La familia Qwen3.5 introduce una arquitectura híbrida que combina Gated DeltaNet (atención lineal) con Gated Attention clásica y capas FFN, junto con un entrenamiento de fusión temprana sobre tokens multimodales. El modelo declara una longitud de contexto nativa de 262.144 tokens y soporte para 201 idiomas y dialectos, lo que lo sitúa en una categoría poco habitual para su escala.

Su relevancia actual radica en que ofrece capacidades multimodales y de contexto largo en un rango de parámetros que cabe en hardware de consumo, lo que facilita experimentación local, despliegue en el borde y ajuste fino asequible. La licencia Apache 2.0 elimina además fricciones para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con vision encoder; Gated DeltaNet (atención lineal) + Gated Attention + FFN |
| Parametros totales | 873.438.784 (0,87B) |
| Parametros activos | no disponible (la model card menciona MoE disperso a nivel de familia, pero no se detalla para este checkpoint) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; compatible con vLLM, SGLang, KTransformers) |
| Idiomas soportados | 201 idiomas y dialectos (declarado a nivel de familia) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

Otros datos técnicos declarados: dimensión oculta 1024, 24 capas, embedding de tokens de 248.320 (padded, atado a la salida LM), layout oculto 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), 16 cabezas de atención lineal para V y 16 para QK con dimensión 128, 8 cabezas Q y 2 KV con dimensión 256 en Gated Attention, RoPE de 64 dimensiones, FFN de 3584 y entrenamiento con MTP (multi-token prediction) multi-paso.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura causal con codificador visual y un diseño híbrido por bloques: por cada cuatro sub-bloques, tres usan Gated DeltaNet (atención lineal con compuertas) y uno usa Gated Attention tradicional. Este esquema busca reducir el coste computacional y de memoria del contexto largo manteniendo la calidad de atención, algo crítico en un modelo de menos de mil millones de parámetros que aspira a ventanas de 262.144 tokens. El FFN intermedio tiene dimensión 3584 y el modelo se entrena con predicción multi-token (MTP), lo que puede acelerar la decodificación especulativa.

Según la model card, el entrenamiento combina pre-entrenamiento y post-entrenamiento, con fusión temprana sobre tokens multimodales y aprendizaje por refuerzo escalado en entornos multiagente. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni los detalles de RLHF/DPO para este checkpoint concreto. La familia declara paridad cross-generacional con Qwen3 y mejoras frente a Qwen3-VL en razonamiento, código, agentes y comprensión visual.

## Capacidades

- Generación de texto y razonamiento en modo no-thinking (los benchmarks publicados corresponden a este modo).
- Comprensión de imagen y texto conjunta (pipeline image-text-to-text) gracias al codificador visual.
- Razonamiento matemático y de sentido común a escala reducida.
- Generación y comprensión de código, con soporte declarado para tareas de agentes.
- Capacidades multilingües amplias: 201 idiomas y dialectos según la familia.
- Soporte de contexto largo de hasta 262.144 tokens.
- Compatibilidad con tool calling y flujos multi-paso a nivel de familia (no se detalla la implementación específica para este checkpoint).
- Despliegue en ecosistemas estándar: Transformers, vLLM, SGLang y KTransformers.

## Casos de uso

- Prototipado rápido de asistentes multimodales: con 0,87B de parámetros y licencia Apache 2.0, permite iterar sobre prompts y pipelines de visión-lenguaje en una sola GPU de consumo antes de escalar a modelos mayores.
- Procesamiento de documentos largos con imágenes: la ventana de 262.144 tokens permite ingerir contratos, informes o manuales extensos junto con sus figuras y extraer información estructurada.
- Ajuste fino específico de dominio: su tamaño reducido hace viable un fine-tuning completo o con LoRA sobre datasets propios en hardware modesto, por ejemplo para clasificación de tickets con capturas de pantalla.
- Despliegue en el borde o entornos con recursos limitados: al caber en GPUs de consumo, sirve para demos locales, asistentes offline o aplicaciones de escritorio con inferencia privada.
- Extracción de información de imágenes en pipelines de datos: lectura de tablas, formularios o gráficos escaneados para poblar bases de datos, usando el modo no-thinking para minimizar latencia.
- Evaluación y generación de código asistida en CI/CD: integrable vía vLLM o SGLang para tareas de revisión, generación de tests o resúmenes de diffs, con la cautela de validar la calidad por su escala.
- Experimentación académica en arquitecturas híbridas: útil para investigar el comportamiento de Gated DeltaNet frente a atención clásica en contextos largos y multimodales.

## Benchmarks y rendimiento

Resultados publicados en la model card (modo no-thinking):

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

No se han publicado en la información disponible resultados de benchmarks de código (HumanEval), matemáticas (GSM8K) ni de evaluación visual para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 1,8 GB solo para pesos, más overhead de KV cache y activaciones; en cuantización de 8 bits, en torno a 1 GB; en 4 bits, alrededor de 0,5-0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16 con contexto moderado; RTX 3060/4060, RTX 4090, A100 o H100 para mayor throughput y contextos largos.
- Cabe holgadamente en GPU de consumo, incluidas RTX 3060 de 12 GB o incluso GPUs de 8 GB con cuantización.
- Opciones de despliegue: Transformers, vLLM, SGLang y KTransformers según la model card; llama.cpp u Ollama no se mencionan explícitamente en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro (no-thinking) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B | 0,87B | 262.144 | 29,7 | Apache 2.0 | Hugging Face |
| Qwen3.5-2B | no disponible | no disponible | 55,3 | Apache 2.0 (familia) | Hugging Face |
| Qwen3-1.7B | 1,7B | no disponible | 40,2 | Apache 2.0 (familia) | Hugging Face |
| Qwen3-4B-2507 | 4B | no disponible | 69,6 | Apache 2.0 (familia) | Hugging Face |

El modelo se posiciona por debajo de sus hermanos mayores en conocimiento general, como era esperable por escala, pero ofrece multimodalidad y contexto largo a un coste de cómputo mucho menor.

## Limitaciones y advertencias

- Rendimiento limitado en conocimiento general: MMLU-Pro de 29,7 y MMLU-Redux de 48,5 indican una tasa de acierto baja en tareas de conocimiento amplio; no es adecuado como modelo de referencia para QA factual sin verificación.
- Riesgo elevado de alucinación en dominios especializados, acentuado por su reducida capacidad paramétrica.
- El autor declara su uso previsto para prototipado, ajuste fino e investigación, no necesariamente para producción crítica sin evaluación adicional.
- No se detallan sesgos conocidos ni la composición del dataset de entrenamiento en la información disponible, lo que dificulta auditar riesgos.
- Aunque la familia declara 201 idiomas, no hay evaluación por idioma publicada para este checkpoint; el rendimiento en castellano no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el enlace de licencia del modelo base citado en la model card.
- El repositorio tiene muy poca tracción (16 descargas, 0 likes) y fue creado y actualizado el mismo día, por lo que conviene verificar la integridad de los pesos frente al checkpoint oficial de Qwen.
- No se especifican detalles de cuantización oficial ni de tool calling para este checkpoint concreto.

## Enlaces

- Hugging Face: https://huggingface.co/axana-labs/Qwen3.5-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Blog de la familia Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai

# nood1es/Myakot-0.2w-4b-mtp

## Resumen

Myakot-0.2w-4b-mtp es un modelo multimodal de tipo image-text-to-text publicado por el usuario nood1es en Hugging Face, derivado del modelo base Qwen/Qwen3.5-4B de Alibaba. Se distribuye con licencia Apache 2.0 y está empaquetado para su uso con transformers, con artefactos adicionales en formato GGUF orientados a inferencia local mediante llama.cpp. El repositorio ocupa 72,2 GB e incluye pesos en safetensors con 4.326.350.848 parámetros reales.

El modelo hereda la arquitectura híbrida de Qwen3.5, que combina capas de atención lineal Gated DeltaNet con capas de atención completa (Gated Attention) y un encoder de visión, además de un módulo MTP (multi-token prediction) entrenado con múltiples pasos que habilita decodificación especulativa. La ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000 tokens según la documentación del modelo base.

Su relevancia radica en que ofrece capacidades multimodales y de razonamiento propias de la familia Qwen3.5 en un tamaño de 4B parámetros, lo que permite despliegues en hardware de consumo y flujos de trabajo con decodificación especulativa MTP que, según la documentación de Unsloth, aceleran la generación entre 1,5 y 2 veces. No obstante, la model card del autor no aporta información específica sobre el proceso de ajuste aplicado ni sobre benchmarks propios de esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con vision encoder: Gated DeltaNet (atención lineal) + Gated Attention, más módulo MTP |
| Parametros totales | 4.326.350.848 (4B según model card) |
| Parametros activos | no disponible (no se indica que sea MoE en la información proporcionada) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | GGUF (incluye variantes Unsloth Dynamic 2.0, p. ej. UD-Q4_K_XL); safetensors en precisión original |
| Idiomas soportados | 201 idiomas y dialectos según el modelo base Qwen3.5; no se detalla lista específica para esta variante |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.5-4B, un transformer causal con encoder de visión. El layout de capas es 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), es decir, bloques de tres capas de atención lineal Gated DeltaNet seguidos de una capa de atención completa. La dimensión oculta es 2560, con 32 capas, FFN de dimensión intermedia 9216 y embeddings de tokens de 248.320 entradas (con padding), atados a la salida LM. Gated DeltaNet usa 32 cabezas lineales para V y 16 para QK con dimensión de cabeza 128; Gated Attention usa 16 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de 64 dimensiones.

El entrenamiento del modelo base combina pre-entrenamiento y post-entrenamiento con fusión temprana de tokens multimodales, entrenamiento con múltiples pasos de MTP y escalado de RL en entornos multiagente. La model card del autor no documenta el proceso de ajuste específico aplicado para producir esta variante Myakot, ni el volumen o composición de datos adicionales. La innovación técnica más destacable es el módulo MTP, que permite decodificación especulativa en llama.cpp mediante el flag `--spec-type draft-mtp` (renombrado desde `--spec-type mtp` en mayo de 2026), con `--spec-draft-n-max 6` como configuración de referencia.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto (pipeline image-text-to-text) y genera respuestas en lenguaje natural.
- Razonamiento y código: hereda las capacidades de Qwen3.5 en razonamiento, programación y agentes según la documentación del modelo base.
- Comprensión visual: encoder de visión integrado con fusión temprana de tokens multimodales.
- Tool calling / function calling: soporte mejorado, con parseo de objetos anidados para aumentar la tasa de éxito en llamadas a herramientas.
- Soporte de rol Developer: compatible con entornos como Codex y OpenCode.
- Capacidades multilingües: cobertura de 201 idiomas y dialectos según el modelo base.
- Decodificación especulativa MTP: genera varios tokens por paso para acelerar la inferencia.
- Fine-tuning local: soportado mediante Unsloth según la documentación enlazada.

## Casos de uso

- Asistentes de atención al cliente multimodales: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 262.144 tokens y procesar capturas de pantalla o imágenes enviadas por el usuario, lo que resulta adecuado para soporte técnico que requiera interpretar errores visuales.
- Automatización de documentación técnica: con contexto largo y capacidad de visión, puede resumir manuales extensos, diagramas de arquitectura y capturas de interfaces en una sola pasada.
- Generación de código en pipelines: el soporte de tool calling con parseo de objetos anidados y el rol Developer permiten integrarlo en flujos tipo Codex u OpenCode para autocompletar, revisar y refactorizar código.
- Agentes multi-paso en local: el tamaño de 4B y los GGUF con cuantización UD-Q4_K_XL permiten ejecutar agentes con llamadas a herramientas en hardware de consumo, usando decodificación especulativa MTP para reducir latencia.
- Análisis de imágenes en entornos con recursos limitados: al caber en GPU de consumo, sirve para clasificación y descripción de imágenes en aplicaciones de campo o prototipos sin infraestructura cloud.
- Evaluación e investigación de arquitecturas híbridas: la combinación de Gated DeltaNet y Gated Attention con MTP lo convierte en una base útil para estudiar eficiencia de atención lineal y decodificación especulativa en modelos pequeños.
- Despliegue multilingüe: con cobertura de 201 idiomas según el modelo base, puede emplearse en traducción y atención al cliente en mercados con idiomas minoritarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor incluye una referencia a una figura de benchmarks del modelo base Qwen3.5, pero no se proporcionan cifras numéricas en la información disponible, por lo que no se presentan datos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_XL, aproximadamente 2,5-3 GB para los pesos de 4B más overhead de contexto KV; con contexto de 8.192 tokens y KV cache, se recomienda al menos 6-8 GB de VRAM.
- GPU recomendadas: RTX 4090, RTX 3090, RTX 4070 Ti o superiores para inferencia cómoda con contexto largo; A100/H100 para despliegues con contexto máximo o múltiples usuarios.
- Cabe en GPU de consumo: sí, en GPUs con 8 GB o más de VRAM usando GGUF Q4; con cuantizaciones más agresivas podría caber en 6 GB, aunque el contexto máximo requeriría offloading.
- Opciones de despliegue: llama.cpp (con soporte MTP mediante `--spec-type draft-mtp`), transformers, vLLM, SGLang, KTransformers y Unsloth para fine-tuning.
- Latencia y throughput: la documentación de Unsloth indica una aceleración de 1,5-2x con decodificación especulativa MTP; no se proporcionan cifras absolutas de tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Myakot-0.2w-4b-mtp | 4,3B | 262.144 (ext. 1.010.000) | Apache 2.0 | Hugging Face (nood1es) |
| Qwen3.5-4B | 4B | 262.144 (ext. 1.010.000) | Apache 2.0 | Hugging Face (Qwen) |
| Qwen3-VL (tamaño comparable) | no disponible | no disponible | no disponible | Hugging Face (Qwen) |

La comparativa se limita al modelo base y a la familia Qwen3-VL mencionada en la model card; no se dispone de datos de rendimiento numérico para contrastar. No se identifican en la información proporcionada otras alternativas de 4B multimodales con MTP para una comparación más amplia.

## Limitaciones y advertencias

- No se documenta el proceso de ajuste ni los datos usados para crear esta variante, por lo que se desconoce si introduce sesgos o degradaciones respecto al modelo base.
- Riesgo de alucinación inherente a los modelos generativos, sin evaluación específica publicada para esta variante.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.
- El soporte MTP en llama.cpp no admite todavía `-np > 1` ni `--mmproj`, lo que limita el despliegue multimodal con decodificación especulativa y el servido concurrente.
- La lista concreta de idiomas soportados por esta variante no está disponible; la cobertura de 201 idiomas corresponde al modelo base.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado conviene verificar los términos del modelo base Qwen3.5-4B.
- El tamaño del repositorio (72,2 GB) implica requisitos de almacenamiento considerables para la descarga completa.

## Enlaces

- Hugging Face: https://huggingface.co/nood1es/Myakot-0.2w-4b-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Guía de ejecución MTP de Unsloth: https://unsloth.ai/docs/models/qwen3.5#mtp-guide
- Guía de Qwen3.5 en Unsloth: https://unsloth.ai/docs/models/qwen3.5
- Guía de fine-tuning de Qwen3.5: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio Unsloth: https://github.com/unslothai/unsloth/
- PR de MTP en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/22673
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai

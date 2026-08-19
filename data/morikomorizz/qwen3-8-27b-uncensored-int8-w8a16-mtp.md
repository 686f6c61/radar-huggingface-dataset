# morikomorizz/Qwen3.8-27B-Uncensored-INT8-W8A16-MTP

## Resumen

El modelo `morikomorizz/Qwen3.8-27B-Uncensored-INT8-W8A16-MTP` es una cuantización numérica W8A16 (pesos INT8, activaciones BF16) del modelo `orcarouter/Qwen3.8-27B-Uncensored`, que a su vez es una versión "abliterada" (con la capa de rechazo eliminada) del Qwen3.8-27B de Qwen. El autor, morikomorizz, ha aplicado una receta de cuantización con llm-compressor que reduce el peso en disco de 55,6 GB a 29,4 GB, permitiendo la inferencia en una única RTX 4090 o en dos RTX 3090, algo inviable con el checkpoint original en BF16.

La cuantización está optimizada para GPUs Ampere y Ada (sm_86) mediante el kernel Marlin, evitando el soporte FP8 que estas arquitecturas no ofrecen de forma nativa. Además, incorpora un cabezal MTP (Multi-Token Prediction) en BF16 para decodificación especulativa, lo que acelera la generación en vLLM. El modelo hereda la arquitectura multimodal del Qwen3.8-27B, con soporte de visión, razonamiento configurable y una ventana de contexto nativa de 262.144 tokens. La licencia es Apache 2.0, heredada del modelo base.

Este checkpoint es relevante para quienes necesitan ejecutar un modelo de 27B con capacidades multimodales y de agente en hardware de consumo, manteniendo una fidelidad alta respecto al original. No obstante, al tratarse de una versión sin alineación de seguridad, su uso debe limitarse a investigación legítima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.8-27B) con atención lineal (GDN) y torre de visión |
| Parametros totales | 27B (modelo base); el checkpoint safetensors reporta 9.301.561.360, posible error del autor |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | INT8 W8A16 (pesos INT8, activaciones BF16), grupo 128, simétrico RTN sin datos |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, pack-quantized) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con capacidades multimodales (visión y texto), entrenado por Qwen. Incluye un componente de atención lineal denominado GDN (Gated Delta Network) en el recipe de cuantización, lo que sugiere una arquitectura híbrida con mecanismos recurrentes o de atención lineal además de la atención completa. La versión "uncensored" de OrcaRouter aplicó una técnica de abliteración que elimina la capa de rechazo del modelo, reduciendo la probabilidad de negarse a responder peticiones.

La cuantización de morikomorizz es una transformación numérica sin datos (data-free RTN) que convierte 400 capas lineales a INT8 W8A16: 192 proyecciones MLP, 64 proyecciones de atención completa y 144 proyecciones GDN. Se preservan en BF16 la torre de visión, el `lm_head`, el cabezal MTP, las puertas GDN `in_proj_a` y `in_proj_b`, y todas las normalizaciones. El cabezal MTP actúa como drafter especulativo, compartiendo embeddings y `lm_head` con el modelo objetivo. No se ha realizado ningún entrenamiento adicional; la cuantización es puramente de compresión.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas, heredadas del modelo base Qwen3.8-27B.
- Razonamiento configurable: soporta modo "thinking" mediante el parser `qwen3` en vLLM.
- Tool calling y function calling: compatible con el parser `qwen3_coder` para integración en agentes.
- Capacidades multimodales: entrada de imagen y texto (pipeline `image-text-to-text`), con la torre de visión preservada en BF16.
- Decodificación especulativa: el cabezal MTP permite generar múltiples tokens por paso con vLLM (`--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`).
- Multilingüe: inglés y chino.
- Contexto largo: ventana nativa de 262.144 tokens, suficiente para documentos extensos o conversaciones multi-turno.

## Casos de uso

- Inferencia local en hardware de consumo: el checkpoint cabe en una RTX 4090 (24 GB) o en dos RTX 3090 (2×24 GB) con tensor parallelism, lo que permite ejecutar un modelo de 27B multimodal sin necesidad de GPUs de datacenter.
- Despliegue de agentes con tool calling: gracias al parser `qwen3_coder`, el modelo puede integrarse en pipelines de automatización que requieran llamadas a funciones, búsqueda web o ejecución de código.
- Razonamiento de largo alcance: con 262K tokens de contexto, es adecuado para análisis de repositorios completos, documentos legales o investigaciones que requieran mantener un hilo extenso.
- Investigación en alineación y seguridad: al ser una versión abliterada, permite estudiar el comportamiento de modelos sin capas de rechazo, siempre bajo entornos controlados y con fines académicos.
- Generación de contenido creativo sin restricciones: para proyectos de escritura o narrativa donde se requiera evitar respuestas evasivas, aunque con las advertencias éticas correspondientes.
- Prototipado de aplicaciones multimodales: al conservar la torre de visión en BF16, puede procesar imágenes junto con texto para tareas de descripción, análisis o preguntas visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Se recomienda consultar las fichas del modelo base Qwen3.8-27B para referencias de rendimiento cualitativo.

## Requisitos de hardware

- VRAM estimada: ~29 GB para los pesos cuantizados; con 262K tokens de contexto y caché KV en FP8, cabe en una RTX 4090 (24 GB) con `--gpu-memory-utilization 0.92`.
- GPUs recomendadas: 1× RTX 4090 o A6000 48 GB para inferencia monogpu; 2× RTX 3090 24 GB con tensor parallelism para configuraciones duales.
- No es compatible con FP8 en GPUs Ampere/Ada: el autor advierte que los checkpoints FP8 caen en fallback BF16, anulando el ahorro de memoria.
- Opciones de despliegue: vLLM (recomendado), con soporte de decodificación especulativa MTP, chunked prefill y caché KV FP8. No es un checkpoint GGUF, por lo que no funciona con llama.cpp u Ollama directamente.
- Latencia y throughput: no disponibles en la documentación; dependen del hardware y de la configuración de vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | BF16 | Apache 2.0 | safetensors |
| orcarouter/Qwen3.8-27B-Uncensored-FP8 | 27B | 262K | FP8 | Apache 2.0 | safetensors |
| morikomorizz/Qwen3.8-27B-Uncensored-INT8-W8A16-MTP | 27B | 262K | INT8 W8A16 | Apache 2.0 | safetensors (compressed-tensors) |
| unsloth/Qwen3.8-27B-GGUF | 27B | 262K | GGUF (Q4_K_M, etc.) | Apache 2.0 | GGUF |

La principal diferencia frente al original es el tamaño en disco (29,4 GB frente a 55,6 GB) y la viabilidad en GPUs de 24 GB. Frente a la versión FP8, la W8A16 es más adecuada para Ampere/Ada, ya que FP8 no tiene aceleración nativa en esas arquitecturas. La versión GGUF de unsloth es más ligera (Q4_K_M ~16,8 GB) pero pierde fidelidad y no incluye el cabezal MTP.

## Limitaciones y advertencias

- Modelo abliterado: se ha eliminado la alineación de seguridad, por lo que puede generar contenido dañino, ilegal o poco ético. El autor lo libera exclusivamente para investigación legítima y declina responsabilidad sobre su uso.
- Idiomas limitados: solo inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- Riesgo de alucinación: al ser una cuantización del modelo base, hereda la tendencia a inventar información, especialmente en tareas de razonamiento complejo.
- Discrepancia en el número de parámetros: el checkpoint safetensors reporta 9.301.561.360 parámetros, muy inferior a los 27B esperados; probablemente se trate de un error del autor al subir los metadatos, pero conviene verificarlo antes de usarlo en producción.
- No es un GGUF: requiere vLLM y no es compatible con herramientas como llama.cpp u Ollama sin conversión adicional.
- Requisitos de hardware específicos: aunque cabe en una RTX 4090, el uso de contexto completo (262K) exige caché KV en FP8 y una gestión cuidadosa de memoria; en configuraciones duales se necesita desactivar P2P (`NCCL_P2P_DISABLE=1`).
- Fecha de creación futura: el modelo fue subido el 19 de agosto de 2026, lo que puede indicar un error en el reloj del sistema o un artefacto de la plataforma; no afecta al funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/morikomorizz/Qwen3.8-27B-Uncensored-INT8-W8A16-MTP
- Modelo base (OrcaRouter): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Versión FP8 de OrcaRouter: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Repositorio llm-compressor: https://github.com/vllm-project/llm-compressor
- vLLM: https://github.com/vllm-project/vllm
- Repo GitHub con GGUF y Ollama (Wassimyounes01): https://github.com/Wassimyounes01/qwen38-uncensored
- Página de LM Studio para Qwen3.8: https://lmstudio.ai/models/qwen3.8
- API de Wiro AI para Qwen3.8-27B-Uncensored: https://wiro.ai/models/qwen/qwen3-8-27b-uncensored

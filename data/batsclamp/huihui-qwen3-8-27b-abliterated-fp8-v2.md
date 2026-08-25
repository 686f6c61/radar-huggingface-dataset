# batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8-v2

## Resumen

Huihui-Qwen3.8-27B-abliterated-FP8-v2 es una cuantización FP8 del modelo abliterado de Qwen3.8-27B publicado por huihui-ai. El autor, batsclamp, la ha generado con llm-compressor (esquema `FP8_DYNAMIC`) para cubrir el hueco que dejaba el upstream: huihui-ai solo publica pesos BF16 y una versión GGUF, pero no FP8 para vLLM. Esta v2 se basa en la re-release de 2026-08-24, que redujo el rango de abliteración de las capas 15‑63 a las capas 18‑51, conservando así más rendimiento del modelo original.

El modelo base, Qwen3.8-27B, es un modelo multimodal (imagen y texto) con arquitectura híbrida que combina atención densa con capas de Mamba (linear attention) y un módulo de predicción multi-token (MTP) para decodificación especulativa. Con 27.359 millones de parámetros y una ventana de contexto de 262.144 tokens, está pensado para tareas complejas de razonamiento, agentes y generación de código. La cuantización FP8 aquí aplicada reduce el tamaño de los pesos a aproximadamente 36 GB (frente a los ~55 GB en BF16), lo que permite servirlo en GPUs con menos VRAM sin sacrificar demasiada precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: transformer con atención densa + capas Mamba (linear attention) + MTP drafter + torre de visión |
| Parametros totales | 27.359.595.760 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (configuración de vLLM) |
| Tipos de cuantizacion | FP8 `e4m3` per-channel (pesos) y dinámica per-token (activaciones); partes en BF16 (linear_attn, vision, embed_tokens, lm_head, MTP) |
| Idiomas soportados | No disponible (el modelo base de Qwen soporta múltiples idiomas, pero no se especifican en esta ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, `compressed-tensors` (`float-quantized`) |

## Arquitectura y entrenamiento

El modelo es una cuantización FP8 de los pesos del modelo abliterado de huihui-ai, que a su vez deriva de Qwen3.8-27B. No ha habido entrenamiento adicional; la cuantización se realizó con `llm-compressor` en un pipeline sin calibración (data-free). Se cuantizaron 256 módulos `Linear` densos, mientras que las proyecciones de la parte Mamba (`linear_attn.*`), la torre de visión completa, `embed_tokens`, `lm_head`, todas las normales y el drafter MTP se mantienen en BF16. Esta decisión preserva la funcionalidad de la decodificación especulativa (MTP) y la calidad de la visión.

El proceso de abliteración (eliminación del comportamiento de rechazo) se aplicó en las capas 18 a 51 de las 64 capas del transformer, un rango más estrecho que el de la v1, lo que reduce la pérdida de capacidades generales.

## Capacidades

- **Multimodal**: acepta imágenes y texto, y genera texto. La torre de visión se mantiene en BF16 para no degradar la comprensión visual.
- **Razonamiento y pensamiento**: soporta `reasoning_effort` (modo thinking), con el parser de razonamiento `qwen3` en vLLM.
- **Tool calling**: compatible con el parser `qwen3_coder`, lo que permite invocar funciones externas.
- **Agentes y planificación**: con 262K de contexto, puede gestionar conversaciones largas y tareas multi-paso.
- **Decodificación especulativa**: incluye un drafter MTP que acelera la inferencia en vLLM cuando se activa `--speculative-config`.
- **Generación de código**: al ser una variante de Qwen3.8, hereda las capacidades de programación del modelo base, aunque no hay benchmarks específicos para esta cuantización.
- **Conversación y chat**: el modelo es de tipo conversacional, optimizado para diálogos multi-turno.

## Casos de uso

- **Asistente virtual multimodal**: puede procesar capturas de pantalla o diagramas y responder preguntas técnicas sobre ellos. Por ejemplo, un usuario sube una imagen de un error de compilación y el modelo sugiere correcciones.
- **Automatización de atención al cliente**: con su contexto largo (262k tokens), puede mantener conversaciones extensas con historial completo y realizar acciones mediante tool calling (consultar bases de datos, crear tickets, etc.).
- **Generación y revisión de código en producción**: su capacidad de razonamiento y tool calling permite integrarlo en pipelines de CI/CD para revisar diffs, sugerir refactors o generar tests. La cuantización FP8 reduce la VRAM necesaria en servidores de inferencia.
- **Análisis de documentos técnicos**: al aceptar imágenes y texto, puede extraer información de informes, tablas o capturas y resumirlos. La ventana de contexto permite procesar manuales extensos de una sola vez.
- **Agentes autónomos con planificación**: su modo thinking y la capacidad de ejecutar herramientas lo hacen adecuado para agentes que deben razonar durante varios pasos, como búsqueda de información web, ejecución de scripts o gestión de calendarios.
- **Investigación y análisis de datos**: puede procesar grandes volúmenes de texto (logs, artículos, informes) y generar resúmenes estructurados, gracias a su contexto de 262k tokens y su razonamiento detallado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la cuantización se verificó estructuralmente y por generación, pero no se han realizado evaluaciones de perplexity ni de conjuntos de datos estándar. Los resultados del modelo base Qwen3.8-27B son conocidos, pero no se ofrecen aquí para esta versión cuantizada.

## Requisitos de hardware

- **VRAM estimada**: los pesos FP8 ocupan aproximadamente 36 GB (según el tamaño del repo). Para una inferencia con contexto completo de 262k tokens, se necesita una GPU con al menos 80 GB de VRAM para la caché KV. Con cuantización adicional (p. ej., GGUF con 4 bits) se podría reducir, pero este repo solo ofrece FP8.
- **GPUs recomendadas**: NVIDIA A100 80GB, H100 80GB, o sistemas como NVIDIA GB10 (mencionado en la model card) que dispongan de memoria unificada. Una RTX 4090 (24 GB) no puede cargar el modelo completo en FP8.
- **Compatibilidad con consumer**: no, debido al tamaño de los pesos y la memoria necesaria para el contexto largo.
- **Opciones de despliegue**: vLLM (soporte nativo para `compressed-tensors` y especulación MTP), también se puede usar con llama.cpp si se convierte a GGUF (pero el autor no publica GGUF para esta variante). Ollama puede servir el modelo GGUF de huihui-ai, pero no esta versión FP8.
- **Latencia y throughput**: no se han publicado mediciones. En la model card se menciona que con `reasoning_effort: xhigh` y una pregunta difícil, se pueden gastar 16k tokens de razonamiento en 26 minutos en un GB10, lo que indica una latencia alta para tareas complejas de razonamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| **batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8-v2** | 27,36 B | 262k | FP8 per-channel | Apache-2.0 | Abliterado, FP8 para vLLM |
| **huihui-ai/Huihui-Qwen3.8-27B-abliterated** | 27,36 B | 262k | BF16 (y GGUF) | Apache-2.0 | Abliterado, pesos originales |
| **Qwen/Qwen3.8-27B** | 27,36 B | 262k | BF16 / FP8 (per-tensor) | Apache-2.0 | Modelo base sin abliterar |

La principal diferencia entre esta versión y la FP8 oficial de Qwen es el esquema de cuantización: per-channel vs per-tensor, que suele ofrecer mayor precisión a igual tamaño. Además, la abliteración elimina los mecanismos de rechazo, lo que la hace adecuada para casos que requieren respuestas sin censura, pero con los riesgos asociados.

## Limitaciones y advertencias

- **Abliterado**: el modelo ha sido modificado para eliminar el comportamiento de rechazo (refusal) del modelo original. Esto implica que puede generar contenido inapropiado, peligroso o no seguro. No debe usarse en entornos de producción sin una capa de moderación adicional.
- **Sin benchmarks verificados**: no se han publicado evaluaciones de rendimiento para esta cuantización; la calidad puede variar respecto al modelo original BF16.
- **Problemas con `max_tokens`**: si se configura un límite de tokens de salida demasiado bajo, el modelo puede devolver `finish_reason: length` con un `content` vacío, especialmente con `reasoning_effort: xhigh`. Esto no es específico de esta cuantización, sino del comportamiento del modelo Qwen3.8-27B.
- **Contexto largo**: la ventana de 262k tokens requiere una gestión cuidadosa de la memoria; en GPUs con menos de 80 GB de VRAM, el contexto completo no es viable.
- **Licencia**: Apache-2.0 permite uso comercial, pero al ser un modelo abliterado, el usuario asume la responsabilidad legal y ética de su uso.
- **Soporte de la comunidad**: el repositorio tiene 0 descargas y 0 likes; es un modelo reciente y de autor independiente, por lo que el soporte y la documentación son limitados.

## Enlaces

- [HuggingFace: batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8-v2](https://huggingface.co/batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8-v2)
- [Modelo base abliterado: huihui-ai/Huihui-Qwen3.8-27B-abliterated](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- [Modelo original Qwen: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [llm-compressor (herramienta de cuantización)](https://github.com/vllm-project/llm-compressor)
- [Página del modelo en LLM Explorer](https://llm-explorer.com/model/huihui-ai%2FHuihui-Qwen3.8-27B-abliterated,7yiXfSP5itojtujYtkbmXj)

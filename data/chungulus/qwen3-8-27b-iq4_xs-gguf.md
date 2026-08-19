# Chungulus/Qwen3.8-27B-IQ4_XS-GGUF

## Resumen

El repositorio `Chungulus/Qwen3.8-27B-IQ4_XS-GGUF` contiene una cuantización GGUF en formato `IQ4_XS` del modelo `Qwen/Qwen3.8-27B`, un modelo de visión-lenguaje de 27.320 millones de parámetros desarrollado por Qwen. Se trata de una cuantización "vanilla" sin modificaciones de fine-tuning, alineación o plantilla de chat, con los pesos fijados al commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del checkpoint oficial. El modelo base presenta una arquitectura híbrida que combina atención completa con capas Gated DeltaNet, e incorpora un codificador de visión, un proyector multimodal y tensores MTP (Multi-Token Prediction) retenidos.

La relevancia de esta publicación radica en que permite ejecutar un modelo multimodal de 27B parámetros en hardware de consumo con aproximadamente 20 GB de memoria, gracias a la cuantización `IQ4_XS` de llama.cpp. El modelo base tiene una ventana de contexto documentada de 256K tokens (según la documentación de Qwen y Unsloth), aunque la model card advierte que en esta cuantización no se ha validado el máximo contexto. La licencia Apache-2.0 permite uso comercial sin restricciones de atribución adicionales.

La cuantización ha sido validada funcionalmente: generación de texto, tool calling en cinco formatos nativos, visión e imágenes locales, controles de pensamiento (`enable_thinking`, `reasoning_effort`, `preserve_thinking`) y plantilla de chat. El repositorio incluye el modelo principal (`Qwen3.8-27B-IQ4_XS.gguf`, 15.420 GB) y el proyector de visión (`mmproj-Qwen3.8-27B-F16.gguf`), con un tamaño total de 16.361 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención completa + capas Gated DeltaNet, con codificador de visión y proyector multimodal |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (documentado en el modelo base; no validado en esta cuantización) |
| Tipos de cuantizacion | IQ4_XS (este repositorio); el modelo base está disponible en otros formatos (GGUF, MLX, etc.) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo principal IQ4_XS + proyector de visión F16) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` emplea una arquitectura híbrida que combina atención completa con capas Gated DeltaNet, una variante de atención lineal que reduce el coste computacional en secuencias largas. Esta estructura se conserva íntegramente en la cuantización, junto con los tensores MTP (Multi-Token Prediction) que permiten predicción de múltiples tokens, aunque la model card indica explícitamente que no se anuncia aceleración especulativa. El modelo incluye un codificador de visión y un proyector multimodal (proporcionado como `mmproj` en F16), lo que lo convierte en un sistema image-text-to-text.

No se dispone de información detallada sobre el entrenamiento del modelo base (composición del dataset, número de tokens, método de alineación como RLHF o DPO) en la documentación de esta cuantización. La cuantización en sí fue realizada con llama.cpp en la revisión `5f754ea0e2fd21e1213db7ebebfd65d938d9d69c`, utilizando cuantización K/IQ sin calibración para los K-quants y con prompts locales representativos donde la conversión IQ lo requería. El inventario de tensores incluye 1.199 tensores, de los cuales 333 corresponden a visión y 15 a MTP.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto, y genera respuestas textuales.
- Tool calling / function calling: validado en cinco casos de formato nativo de Qwen.
- Visión y video: validado en tres casos de imágenes locales deterministas.
- Controles de pensamiento (thinking mode): soporta `enable_thinking`, `reasoning_effort` y `preserve_thinking` mediante la plantilla de chat del modelo base.
- Capacidades multilingües: no especificadas en la documentación disponible.
- Arquitectura híbrida con Gated DeltaNet: permite manejar contextos largos con menor coste computacional que la atención completa.
- MTP (Multi-Token Prediction): los tensores están retenidos, aunque no se garantiza aceleración especulativa en runtime.

## Casos de uso

- Asistente multimodal local: ejecutar un asistente de chat con comprensión de imágenes en un portátil o estación de trabajo con GPU de 16-24 GB VRAM, sin depender de servicios en la nube. La cuantización IQ4_XS reduce el modelo a ~15,4 GB, lo que lo hace viable en hardware de consumo.
- Análisis de documentos con imágenes: procesar capturas de pantalla, diagramas o fotografías para extraer información textual, gracias al codificador de visión y la ventana de contexto larga.
- Agente autónomo con tool calling: integrar el modelo en un pipeline de agente que invoque funciones externas (búsqueda, APIs, ejecución de código) usando el formato nativo de tool calling de Qwen, validado en esta cuantización.
- Generación de código asistida por imagen: describir un boceto o diagrama de arquitectura y obtener código correspondiente, combinando las capacidades de visión y razonamiento del modelo.
- Procesamiento de video en local: aunque la validación se realizó con imágenes estáticas, el modelo soporta entrada de video según la documentación, lo que permite análisis de secuencias de vídeo en entornos con recursos limitados.
- Investigación y experimentación con arquitecturas híbridas: al ser una cuantización sin modificaciones, sirve como referencia para estudiar el comportamiento de la arquitectura Gated DeltaNet + atención completa en tareas multimodales, con la ventaja de una licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que esta cuantización no reclama una nueva ejecución de benchmarks; los artefactos son byte-idénticos a los validados en el repositorio combinado `Chungulus/Qwen3.8-27B-GGUF` en el commit `f519a212d6c15cd3292b6ca835dd8ebf235642c0`. El único dato de rendimiento disponible es la velocidad de generación medida en el host de validación: 15,17 tokens/s, obtenida en una prueba de humo (smoke test) y no como resultado de un benchmark estandarizado.

## Requisitos de hardware

- Memoria estimada: aproximadamente 20 GB de memoria libre para el modelo (15,4 GB), el proyector de visión (F16) y el overhead de runtime. La caché KV crece con la longitud del contexto.
- GPU recomendadas: tarjetas con 16-24 GB de VRAM, como RTX 4090 (24 GB), RTX 4080 (16 GB) o A100 (40 GB). También es viable en hardware AMD con soporte ROCm o en Apple Silicon con Metal (la guía de compilación incluye `GGML_METAL=ON`).
- Compatibilidad con GPU de consumo: sí, siempre que se disponga de al menos 16 GB de VRAM y se gestione el contexto para no exceder la memoria.
- Opciones de despliegue: llama.cpp (con `llama-mtmd-cli` para multimodal), LM Studio, Ollama (según la documentación de yottalabs), y Unsloth (que ofrece GGUFs del mismo modelo). También se menciona soporte Day 0 en AMD Ryzen AI Max y Radeon.
- Latencia y throughput: el único dato disponible es 15,17 tokens/s en el host de validación, que no debe interpretarse como una medida representativa de rendimiento en otros hardware.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos para esta cuantización específica. A nivel de modelo base, `Qwen3.8-27B` compite con otros modelos multimodales de ~27B parámetros, como Qwen2.5-VL-27B (predecesor directo) o Llama-3.2-11B-Vision (menor tamaño). Sin embargo, no se han proporcionado resultados de rendimiento que permitan una comparación cuantitativa. La principal diferencia frente a alternativas es la arquitectura híbrida Gated DeltaNet, que puede ofrecer ventajas en eficiencia de contexto largo, y la licencia Apache-2.0, que facilita el uso comercial sin restricciones.

## Limitaciones y advertencias

- La cuantización IQ4_XS puede reducir la calidad de las respuestas, especialmente en tareas que requieren precisión numérica o razonamiento complejo, en comparación con el modelo en FP16 o BF16.
- El contexto máximo de 256K tokens está documentado para el modelo base, pero la validación de esta cuantización solo alcanzó prompts de 73 tokens; no se ha probado el comportamiento con contextos largos.
- El runtime debe soportar la arquitectura híbrida completa (Gated DeltaNet + atención), el codificador de visión, el proyector, el tokenizador y los metadatos MTP. No basta con cargar únicamente el tensor de lenguaje.
- La aceleración especulativa basada en MTP no está garantizada; los tensores están presentes pero no se anuncia su funcionamiento.
- No se han publicado resultados de benchmarks para esta cuantización, por lo que el rendimiento real en tareas específicas es desconocido.
- Los idiomas soportados no están documentados en esta publicación; se recomienda consultar la documentación del modelo base para conocer la cobertura lingüística.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/Chungulus/Qwen3.8-27B-IQ4_XS-GGUF
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio combinado de GGUFs de Chungulus: https://huggingface.co/Chungulus/Qwen3.8-27B-GGUF
- GGUFs de Unsloth para Qwen3.8-27B: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Blog de AMD sobre ejecución local en Ryzen AI Max y Radeon: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía de ejecución local (Ollama, GGUF, VRAM): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Repositorio MLX MXFP4 de Chungulus (formato alternativo): https://huggingface.co/Chungulus/Qwen3.8-27B-MLX-MXFP4

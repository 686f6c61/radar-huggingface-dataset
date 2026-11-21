# gpillon/Qwen3.8-27B-trellis-2.8bpw-abliterated-ignis

## Resumen

Qwen3.8-27B-trellis-2.8bpw-abliterated-ignis es una cuantización de 2,8 bits del modelo Qwen3.8-27B, publicada por el usuario gpillon para su propio motor de inferencia, ignis. El artefacto empaqueta el cuerpo de un transformer de 27B de parámetros en un contenedor propietario `.ninfer` v2 de 11,88 GiB, diseñado específicamente para ejecutarse en tarjetas gráficas de 12 GB de VRAM (RTX 5070, familia RTX 4070 de 12 GB, RTX 3060 12 GB, RTX 3080 Ti). La variante incorpora la abliteración del modelo huihui-ai/Huihui-Qwen3.8-27B-abliterated, es decir, la dirección de rechazo fue eliminada de los pesos, por lo que el modelo no rechaza instrucciones dañinas.

El modelo base Qwen3.8-27B incorpora una arquitectura híbrida con capas Gated DeltaNet y mecanismos de atención clásicos, además de una torre de visión, una capa MTP (multi-token prediction) y un drafter DFlash2 para decodificación especulativa. Esta cuantización concreta re-cuantiza únicamente 70 matrices procedentes de los pesos abliterados (capas 17-51: proyección down del MLP y proyección de salida de Gated DeltaNet o atención), mientras que los otros 1.152 de los 1.222 objetos del archivo se copian byte a byte del artefacto original de 12 GB sin abliterar. El resultado es un modelo conversacional sin censura, con capacidades multimodales y de razonamiento, pensado para despliegue local en hardware de consumo.

La relevancia de esta ficha radica en que documenta un caso extremo de cuantización agresiva (2,8 bits por peso) con decodificación especulativa integrada, orientada a hacer viable un modelo de 27B en GPUs de 12 GB. No obstante, el autor advierte explícitamente de que todas las cifras fueron medidas en una RTX 5090 limitada a un presupuesto de 12 GiB de VRAM, y que ninguna tarjeta real de 12 GB ha ejecutado aún este archivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Gated DeltaNet y atención, más torre de visión, capa MTP y drafter DFlash2 (según model card) |
| Parámetros totales | 27B (modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 131.072 tokens (perfil `rtx-12gb`) |
| Tipos de cuantización | 2,8 bits por peso (trellis); matrices re-cuantizadas con K=3 en 64 casos, K=4 en 5 y K=2 en 1 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` v2 (contenedor propietario de ignis; no es safetensors, GGUF ni EXL3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas Gated DeltaNet con mecanismos de atención tradicionales, e incluye una torre de visión para entrada de imágenes, una capa MTP para predicción multi-token y un drafter DFlash2 para decodificación especulativa. Esta cuantización no reentrena el modelo: parte de los pesos del artefacto de 12 GB sin abliterar (`gpillon/Qwen3.8-27B-trellis-2.8bpw-ignis`) y sustituye únicamente 70 matrices por versiones re-cuantizadas a partir de los pesos abliterados de huihui-ai, replicando el proceso de conversión de ExLlamaV3 matriz a matriz. El resto de componentes (cuerpo, cabeza de salida, embeddings, capa MTP, drafter DFlash2, torre de visión, tokenizer y plantilla de chat) se copia byte a byte del artefacto original.

La innovación técnica principal es el empaquetado a 2,8 bits por peso con un contenedor `.ninfer` que integra decodificación especulativa mediante MTP (ventana de 7) o DFlash2 (ventana de 7), con un pool de KV de 214.144 tokens para MTP y 150.720 tokens para DFlash2. El perfil `rtx-12gb` fija un carril de decodificación, chunk de prefill de 512 y la torre de visión en RAM del host. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 131.072 tokens).
- Razonamiento y matemáticas (heredado del modelo base Qwen3.8-27B, sin datos de benchmark disponibles).
- Generación de código (capacidad del modelo base, sin métricas publicadas en esta ficha).
- Procesamiento de imágenes mediante torre de visión integrada, con la torre cargada en RAM del host en el perfil de 12 GB.
- Decodificación especulativa con dos backends: MTP (multi-token prediction) y DFlash2, configurables mediante `--spec-backend`.
- Modo sin censura: la abliteración elimina la dirección de rechazo, por lo que el modelo sigue instrucciones dañinas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en GPU de 12 GB: el modelo está empaquetado para caber en tarjetas con menos de 14 GiB de memoria (RTX 5070, RTX 4070 de 12 GB, RTX 3060 12 GB, RTX 3080 Ti), permitiendo ejecutar un modelo de 27B en hardware de consumo mediante el servidor `ignis-server`.
- Asistente conversacional sin restricciones para investigación: la abliteración permite estudiar el comportamiento del modelo ante instrucciones que normalmente rechazaría, en entornos controlados y con guardrails externos.
- Procesamiento de documentos con imágenes: la torre de visión permite pasar imágenes junto con texto en la misma conversación, útil para tareas de descripción o extracción de información visual.
- Contexto largo para análisis de documentos extensos: con hasta 131.072 tokens de contexto, el modelo puede ingerir libros, expedientes o bases de código completas en una sola sesión.
- Generación de texto creativo sin filtros: para aplicaciones de escritura que requieren contenido no censurado, con la advertencia de que el modelo no incorpora rechazo.
- Evaluación de cuantizaciones extremas: este artefacto sirve como referencia para medir la degradación de un modelo de 27B a 2,8 bits por peso frente al original, con registro de conversión que documenta el error de reconstrucción de cada matriz.
- Integración vía API compatible con OpenAI: el servidor expone `http://127.0.0.1:8000/v1`, lo que permite conectar clientes existentes sin cambios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni similares. Las únicas cifras publicadas son de infraestructura: tamaño del archivo (12.754.663.684 bytes, 11,88 GiB), contexto máximo (131.072 tokens), pool de KV (214.144 tokens con MTP, 150.720 con DFlash2) y chunk de prefill (512). El autor advierte que todas las mediciones se realizaron en una RTX 5090 limitada a 12 GiB, no en una tarjeta real de 12 GB.

## Requisitos de hardware

- VRAM estimada: menos de 14 GiB; el perfil `rtx-12gb` está pensado para tarjetas de 12 GB con un presupuesto de 12 GiB (12.884.901.888 bytes).
- GPU recomendadas: RTX 5070, familia RTX 4070 de 12 GB, RTX 3060 12 GB, RTX 3080 Ti. Arquitecturas Ampere, Ada y Blackwell.
- Cabe en GPU de consumo: sí, en las tarjetas de 12 GB listadas, aunque el autor indica que aún no se ha probado en ninguna tarjeta real de 12 GB (issue gpillon/ignis#639).
- Opciones de despliegue: exclusivamente `ignis-server` (versión 0.11.0 o superior), con perfiles `rtx-12gb`; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la información proporcionada.
- Requisitos adicionales: la torre de visión se carga en RAM del host; el contenedor `.ninfer` solo lo lee ignis.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-trellis-2.8bpw-abliterated-ignis (este) | 27B | 131.072 | 2,8 bits (trellis) | Apache 2.0 | ignis 0.11.0+, 12 GB VRAM |
| gpillon/Qwen3.8-27B-trellis-2.8bpw-ignis | 27B | 131.072 | 2,8 bits (trellis) | Apache 2.0 | ignis, 12 GB VRAM (versión sin abliterar) |
| gpillon/Qwen3.8-27B-trellis-3bpw-abliterated-ignis | 27B | no disponible | 3 bits (trellis) | Apache 2.0 | ignis, 16 GB VRAM |
| gpillon/Qwen3.8-27B-nvfp4full-dflash2-abliterated-NInfer | 27B | no disponible | NVFP4 | Apache 2.0 | NInfer, 32 GB Blackwell |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | no disponible | pesos completos | Apache 2.0 | Transformers (modelo base) |

## Limitaciones y advertencias

- El modelo no rechaza instrucciones: la abliteración eliminó la dirección de rechazo y seguirá instrucciones dañinas. Es imprescindible colocar guardrails en la capa de aplicación o herramienta y no exponerlo directamente a usuarios no confiables.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; la cuantización a 2,8 bits puede degradar la calidad respecto al modelo de 27B completo.
- La cuantización agresiva (2,8 bits) implica pérdida de precisión; el registro de conversión documenta el error de reconstrucción de cada matriz, pero no se ofrecen métricas agregadas de calidad.
- Compatibilidad restringida: el formato `.ninfer` v2 solo lo lee ignis; no es un checkpoint de Transformers, safetensors, GGUF ni EXL3.
- Sin verificación en hardware real: todas las cifras se midieron en una RTX 5090 limitada a 12 GiB; ninguna tarjeta de 12 GB ha ejecutado el archivo (issue gpillon/ignis#639).
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de rechazo traslada toda la responsabilidad de moderación al integrador.
- El contexto máximo de 131.072 tokens depende del perfil `rtx-12gb`; con DFlash2 el pool de KV se reduce a 150.720 tokens frente a los 214.144 de MTP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gpillon/Qwen3.8-27B-trellis-2.8bpw-abliterated-ignis
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Artefacto de 12 GB sin abliterar: https://huggingface.co/gpillon/Qwen3.8-27B-trellis-2.8bpw-ignis
- Artefacto de 16 GB abliterado: https://huggingface.co/gpillon/Qwen3.8-27B-trellis-3bpw-abliterated-ignis
- Artefacto de 32 GB Blackwell: https://huggingface.co/gpillon/Qwen3.8-27B-nvfp4full-dflash2-abliterated-NInfer
- Repositorio de ignis: https://github.com/gpillon/ignis
- Última release de ignis: https://github.com/gpillon/ignis/releases/latest
- Guía para agentes: https://raw.githubusercontent.com/gpillon/ignis/main/docs/user/paths/agent.md
- Documentación completa en Markdown: https://gpillon.github.io/ignis/llms.txt
- Página sobre la variante sin censura: https://gpillon.github.io/ignis/guides/uncensored/
- Issue de verificación en 12 GB: https://github.com/gpillon/ignis/issues/639

# lg4/Qwen3.8-27B-NVFP4-MTP-GGUF

## Resumen

`lg4/Qwen3.8-27B-NVFP4-MTP-GGUF` es una familia de cinco archivos GGUF derivados del modelo `Qwen3.8-27B` de Alibaba, un modelo denso de 27.000 millones de parámetros con arquitectura híbrida Gated DeltaNet + Gated Attention, contexto nativo de 262.144 tokens y capacidades multimodales nativas (imagen y vídeo). El autor, `lg4`, ha convertido el checkpoint cuantizado `unsloth/Qwen3.8-27B-NVFP4` (que combina tensores NVFP4 de 4 bits y F8 de 8 bits) a formato GGUF, preservando la densidad NVFP4 para GPUs Blackwell (sm_120) e integrando el cabezal MTP (multi-token prediction) de decodificación especulativa directamente en cada archivo, sin necesidad de un drafter separado.

La relevancia de esta publicación radica en que ofrece una escalera de precisión/tamaño: desde un archivo `ORIG` de 33,13 GB que conserva la atención en BF16 (decuantizada desde F8) hasta un tier `LOW` de 15,53 GB que re-cuantiza toda la atención a NVFP4, permitiendo ejecutar el modelo en GPUs consumer de 16 GB. Todos los archivos incluyen el cabezal MTP, activable en llama.cpp mediante `--spec-type draft-mtp`, y el proyector de visión `mmproj-BF16.gguf` está incluido en el repositorio. El modelo base es Apache-2.0, por lo que el uso comercial está permitido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet + Gated Attention híbrida, 64 capas, modelo denso |
| Parametros totales | 27B (según model card); el archivo safetensors reporta 460.730.096, posiblemente solo el cabezal MTP o un error de metadatos |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (4 bits), BF16, F8 (decuantizado a BF16), Q5_0, IQ4_XS, Q8_0, Q6_K, F32 (normas y escalas) |
| Idiomas soportados | Inglés y multilingüe (según tags) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (5 archivos + proyector de visión) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` emplea una arquitectura híbrida que combina Gated DeltaNet (una forma de atención lineal con compuertas) y Gated Attention (atención clásica con compuertas) en sus 64 capas. Es un modelo denso de 27B parámetros con contexto nativo de 262.144 tokens y capacidades de visión y vídeo integradas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la documentación proporcionada.

La innovación principal de esta conversión es la integración del cabezal MTP (multi-token prediction) en cada archivo GGUF, lo que permite decodificación especulativa sin necesidad de un modelo drafter externo. El proceso de conversión partió del checkpoint mixto `unsloth/Qwen3.8-27B-NVFP4`, que contenía tensores NVFP4 (MLP de capas 0-55) y F8 (atención, MLP de capas 56-63, lm_head). Dado que el convertidor de llama.cpp no acepta checkpoints con múltiples grupos de cuantización, se decuantizaron los tensores F8 a BF16 in situ y se fijó un único grupo NVFP4. El archivo `ORIG` preserva la atención en BF16 (decuantizada desde F8), mientras que los tiers `LOW` a `VERY-HIGH` re-cuantizan la atención a NVFP4, incurriendo en una doble cuantización (F8 → BF16 → NVFP4) que reduce ligeramente la precisión de la atención.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas, heredadas del modelo base Qwen3.8-27B.
- Visión nativa: procesa imágenes y vídeo mediante el proyector `mmproj-BF16.gguf` incluido, activable con `--mmproj`.
- Decodificación especulativa MTP integrada: el cabezal de predicción multi-token está incrustado en cada archivo GGUF, activable en llama.cpp con `--spec-type draft-mtp`.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Multilingüe: soporta inglés y otros idiomas (etiquetado como `multilingual`).
- Compatibilidad con GPUs Blackwell (sm_120) gracias a la cuantización NVFP4 nativa.

## Casos de uso

- Asistentes conversacionales de larga duración: la ventana de 262.144 tokens permite mantener conversaciones con historial extenso sin truncamiento, ideal para chatbots de soporte o asistentes personales.
- Análisis de documentos extensos con soporte visual: el modelo puede procesar contratos, informes o artículos científicos que combinen texto e imágenes, extrayendo información relevante de ambos formatos.
- Generación de código con contexto amplio: gracias a su capacidad de razonamiento y contexto largo, puede asistir en la revisión de repositorios completos o en la generación de código con dependencias entre archivos.
- Sistemas RAG sobre grandes corpus: la ventana de contexto nativa permite incorporar fragmentos extensos de documentos recuperados sin necesidad de chunking agresivo, mejorando la fidelidad de las respuestas.
- Análisis de vídeo: al ser un VLM nativo, puede procesar secuencias de vídeo para tareas como resumen, búsqueda de eventos o descripción de escenas, siempre que el hardware lo permita.
- Despliegue en GPUs consumer con baja latencia: los tiers compactos (15-19 GB) caben en una GPU de 16 GB, y el MTP integrado acelera la decodificación especulativa, reduciendo la latencia en entornos de producción con restricciones de coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF varían entre 15,53 GB (`LOW`) y 33,13 GB (`ORIG`). El tier `LOW` cabe en una GPU de 16 GB con overhead mínimo; el `ORIG` requiere al menos 40 GB o una configuración multi-GPU.
- GPUs recomendadas: arquitectura Blackwell (sm_120) para aprovechar la cuantización NVFP4 nativa. El autor menciona una configuración dual de 16 GB Blackwell, pero también puede ejecutarse en GPUs con soporte de llama.cpp para NVFP4.
- Opciones de despliegue: llama.cpp (con `--spec-type draft-mtp` para MTP), y potencialmente vLLM, Ollama u otros runners compatibles con GGUF.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (original) | 27B | 262.144 | BF16 (safetensors) | Apache-2.0 | HuggingFace |
| unsloth/Qwen3.8-27B-NVFP4 | 27B | 262.144 | NVFP4 + F8 (safetensors) | Apache-2.0 | HuggingFace |
| lg4/Qwen3.8-27B-NVFP4-MTP-GGUF (este repo) | 27B | 262.144 | NVFP4/BF16 (GGUF) | Apache-2.0 | HuggingFace |
| unsloth/Qwen3.8-27B-GGUF | 27B | 262.144 | GGUF (varias) | Apache-2.0 | HuggingFace |

La principal diferencia frente a las alternativas es la integración del cabezal MTP en el GGUF y la optimización específica para Blackwell con NVFP4 nativo, además de la escalera de precisión/tamaño que permite elegir entre fidelidad máxima (`ORIG`) o huella mínima (`LOW`).

## Limitaciones y advertencias

- Los tiers `LOW`, `MEDIUM`, `HIGH` y `VERY-HIGH` re-cuantizan la atención de BF16 (que originalmente era F8) a NVFP4, lo que supone una doble cuantización y una pérdida de precisión en la atención respecto al checkpoint fuente. El archivo `ORIG` preserva la calidad de atención original.
- No se han publicado benchmarks que verifiquen el rendimiento real del modelo en tareas estándar; las afirmaciones sobre calidad son inferencias del modelo base.
- El soporte MTP requiere una versión reciente de llama.cpp que implemente `--spec-type draft-mtp`; versiones antiguas ignorarán el cabezal o fallarán.
- El modelo está etiquetado como multilingüe, pero el foco principal es el inglés; el rendimiento en otros idiomas puede ser inferior.
- El repositorio ocupa 205,6 GB en total, aunque cada archivo individual es mucho menor; la descarga selectiva es recomendable.
- Aunque la licencia Apache-2.0 permite uso comercial, es responsabilidad del usuario verificar el cumplimiento de los términos del modelo base y de las dependencias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lg4/Qwen3.8-27B-NVFP4-MTP-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint fuente cuantizado: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- GGUF de referencia de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF

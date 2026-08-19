# esatapedico/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP-NVFP4-GGUF

## Resumen

`Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP-NVFP4-GGUF` es una familia de cuatro archivos GGUF híbridos creada por el usuario esatapedico, que combina la cuantización nativa NVFP4 del backbone de 64 bloques transformer con tensores extra de precisión variable según el nivel elegido. El modelo base es `DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP`, un fine-tune y merge de múltiples etapas sobre el modelo denso `Qwen/Qwen3.6-27B` de Alibaba, que destaca por superar la barrera de 700 puntos en el benchmark ARC-C en cuantizaciones de 8 y 4 bits, algo inédito en modelos abiertos de este tamaño.

El objetivo de esta conversión es doble: mantener la ventaja de prefill de NVFP4 en hardware Blackwell (sm_120) y reducir el tamaño del archivo por debajo de los 24 GB para que quepa en configuraciones de doble GPU de 16 GB. Los cuatro niveles (LOW, MEDIUM, HIGH y VERY-HIGH) comparten el mismo backbone NVFP4 de 13,70 GB y se diferencian en la precisión del LM head, el embedding y el MTP draft head, lo que permite ajustar el equilibrio entre calidad de salida y uso de VRAM. Además, el modelo mantiene capacidades de visión si se combina con el proyector mmproj publicado por DavidAU.

La relevancia de este lanzamiento radica en que es uno de los primeros GGUFs que aprovecha la cuantización nativa NVFP4 (tipo GGML 40) sin re-cuantización, incorpora decodificación especulativa MTP integrada en el propio archivo y ofrece un rendimiento de razonamiento de nivel frontera en un formato desplegable en hardware de consumo. Todo el trabajo es un derivado de artefactos Apache-2.0, sin entrenamiento adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense transformer híbrido: Gated DeltaNet + Gated Attention (64 capas) |
| Parametros totales | 27.320.698.848 (27,32 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (backbone, nativo GGML tipo 40), Q5_0, Q8_0, BF16, IQ4_XS, Q6_K (tensores extra según nivel) |
| Idiomas soportados | Inglés, multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (4 archivos: LOW, MEDIUM, HIGH, VERY-HIGH) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.6-27B` de Alibaba utiliza una arquitectura híbrida que combina Gated DeltaNet y Gated Attention en sus 64 capas transformer, con un contexto nativo de 262.144 tokens. Sobre esta base, DavidAU aplicó un proceso de fine-tune y merge multi-etapa que integra contribuciones de múltiples modelos, dando como resultado `Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP`. Este modelo se distingue por alcanzar una puntuación ARC-C de 0,711 en cuantización de 8 bits y 0,701 en 4 bits, superando por primera vez en un modelo abierto de 27B el umbral de 700 puntos que antes solo lograban sistemas propietarios como OpenAI, Claude o Gemini.

La conversión a GGUF realizada por esatapedico preserva los tensores NVFP4 nativos del checkpoint safetensors de maci0 sin re-cuantización ni ciclos de dequantización-recuantización. La innovación técnica principal es el tensor splice: los 496 tensores del backbone (13,70 GB) se mantienen idénticos en los cuatro niveles, mientras que los 10 tensores extra (output.weight, token_embd.weight y los 8 tensores del bloque MTP draft) varían en precisión. El MTP draft head está embebido en el propio GGUF, por lo que no requiere un drafter externo y se activa en llama.cpp con `--spec-type draft-mtp`. El LM head es el principal factor de calidad: pasar de Q5_0 a BF16 elimina progresivamente el ruido de cuantización en el tensor que determina la distribución de siguiente token.

## Capacidades

- Generación de texto y razonamiento complejo con nivel ARC-C de 0,711 en 8 bits y 0,701 en 4 bits, comparable a modelos propietarios de frontera.
- Razonamiento multi-step y resolución de problemas que requieren inferencia lógica avanzada.
- Capacidades de visión: aunque los GGUFs son solo texto, el modelo puede procesar imágenes si se combina con el proyector `mmproj-BF16.gguf`, `mmproj-F16.gguf` o `mmproj-F32.gguf` de DavidAU, apuntando con `--mmproj`.
- Decodificación especulativa MTP integrada: el draft head embebido predice tokens que el modelo principal acepta, acelerando el decode en hardware Blackwell.
- Soporte de contexto largo de 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingües con énfasis en inglés.
- Cuatro niveles de precisión (LOW, MEDIUM, HIGH, VERY-HIGH) que permiten ajustar el equilibrio entre calidad y consumo de VRAM.
- Compatible con llama.cpp y endpoints compatibles, sin necesidad de archivos adicionales para el drafter.

## Casos de uso

- Razonamiento científico y resolución de problemas ARC-C: el modelo alcanza puntuaciones de 711 en 8 bits y 701 en 4 bits, lo que lo hace adecuado para tareas de razonamiento abstracto, puzzles visuales y lógica de alto nivel. Se usaría con el proyector de visión para tareas que requieren comprensión de diagramas y patrones.
- Análisis de documentos extensos: con 262.144 tokens de contexto, puede procesar libros completos, informes técnicos o expedientes legales en una sola pasada, manteniendo coherencia a lo largo de decenas de miles de tokens.
- Generación de código con tool calling: el modelo soporta reproducción verbatim de cadenas largas (paths, identificadores, argumentos de herramientas), lo que lo hace útil para pipelines de CI/CD, generación de código en producción y automatización de tareas de desarrollo.
- Despliegue en hardware de consumo: con el nivel LOW (15,49 GB) cabe en una sola GPU de 24 GB o en configuraciones de doble GPU de 16 GB, permitiendo inferencia local de alta calidad sin infraestructura de centro de datos.
- Asistente de investigación multilingüe: su capacidad multilingüe y su contexto largo permiten resumir, traducir y analizar literatura académica en varios idiomas, manteniendo referencias cruzadas entre documentos.
- Experimentación con decodificación especulativa: el MTP draft head embebido permite investigar y optimizar el rendimiento de speculative decoding en hardware Blackwell, midiendo tasas de aceptación y velocidad de decode en diferentes configuraciones.

## Benchmarks y rendimiento

Según los resultados publicados por DavidAU y recogidos en las búsquedas web:

| Benchmark | Resultado |
|---|---|
| ARC-C (8-bit quant) | 0,711 |
| ARC-C (4-bit quant) | 0,701 |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible. El modelo es el primero de su clase (27B, open source) en superar el umbral de 700 puntos en ARC-C tanto en 8 como en 4 bits, un logro que anteriormente solo pertenecía a modelos propietarios de OpenAI, Claude y Gemini.

## Requisitos de hardware

- VRAM estimada: los cuatro archivos ocupan entre 15,49 GB (LOW) y 19,65 GB (VERY-HIGH). El backbone NVFP4 ocupa 13,70 GB en todos los casos.
- GPU recomendadas: el formato NVFP4 nativo requiere hardware Blackwell con soporte sm_120 (por ejemplo, RTX 50-series). El autor indica que ha probado los cuatro niveles en una configuración de doble GPU de 16 GB.
- Compatibilidad con GPU de consumo: sí, el nivel LOW cabe en una sola GPU de 24 GB (RTX 3090/4090 no Blackwell, pero el formato NVFP4 requiere sm_120) o en configuraciones duales de 16 GB.
- Opciones de despliegue: llama.cpp con soporte para NVFP4 y MTP (`--spec-type draft-mtp`), así como cualquier endpoint compatible con GGUF.
- Latencia y throughput: no se han publicado cifras concretas. El autor indica que la ventaja principal es el prefill rápido gracias a NVFP4 y un decode más rápido gracias al MTP draft head de mayor calidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | ARC-C | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-27B-Fable-Fusion-711 (este) | 27,32 B | 262.144 | NVFP4 + extras | 0,711 (8-bit) / 0,701 (4-bit) | Apache-2.0 |
| Qwen/Qwen3.6-27B (base) | 27 B | 262.144 | — | no disponible | Apache-2.0 |
| DavidAU/Qwen3.6-27B-Fable-Fusion-711-NEO-MAX-MTP-GGUF | 27 B | 262.144 | GGUF (Q5_0/Q6_K/IQ4_XS) | 0,711 (8-bit) / 0,701 (4-bit) | Apache-2.0 |

La diferencia principal frente al GGUF de DavidAU es el uso de NVFP4 nativo para el backbone (13,70 GB frente a pesos más pesados en otras cuantizaciones) y el MTP draft head embebido, que elimina la necesidad de un drafter externo. El modelo base sin fine-tune no alcanza los resultados ARC-C del merge de DavidAU.

## Limitaciones y advertencias

- El formato NVFP4 requiere hardware Blackwell (sm_120); no funcionará en GPUs Ampere o anteriores, lo que limita su despliegue a hardware muy reciente.
- Los GGUFs son solo texto; las capacidades de visión requieren descargar el proyector mmproj por separado del repositorio de DavidAU.
- El autor advierte de un modo de fallo de bucle de repetición en niveles bajos de precisión del LM head (LOW); los niveles MEDIUM, HIGH y VERY-HIGH lo mitigan con mayor precisión en output.weight.
- El sampler DRY anti-loop ya no se recomienda porque interfiere con la reproducción verbatim de cadenas largas, importante para código y tool use.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta conversión específica, solo ARC-C.
- Al ser un derivado sin entrenamiento, la calidad final depende enteramente del trabajo de DavidAU y maci0; cualquier sesgo o alucinación presente en el modelo base se mantiene.
- El modelo se describe como "uncensored", lo que implica que no tiene los guardrails habituales de seguridad; debe usarse con precaución en entornos de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/esatapedico/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP-NVFP4-GGUF
- Nivel LOW: https://huggingface.co/esatapedico/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP-NVFP4-LOW-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- GGUF de DavidAU con mmproj: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Checkpoint NVFP4 (maci0): https://huggingface.co/maci0/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP-NVFP4
- Modelo base original (Alibaba): https://huggingface.co/Qwen/Qwen3.6-27B
- Artículo sobre el logro ARC-C: https://hackernoon.com/qwen36-27b-fable-fusion-breaks-the-700-arc-c-barrier
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.6-27b-fable-fusion-711-uncensored-heretic-nm-dau-neo-max-mtp-gguf-davidau
- Ko-fi del autor: https://ko-fi.com/esatapedico

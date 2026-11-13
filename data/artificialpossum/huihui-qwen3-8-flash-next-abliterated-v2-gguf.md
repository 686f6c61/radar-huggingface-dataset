# artificialpossum/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF

## Resumen

Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF es una versión "abliterated" (sin rechazos) del modelo Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el usuario artificialpossum en Hugging Face. La abliteración es una técnica de modificación de pesos que elimina la dirección de activación asociada a las negativas del modelo, de modo que este deja de rechazar peticiones que el modelo original bloquearía. Esta segunda versión ajusta el énfasis de la ablación respecto a la primera y, según la model card, no ablaciona ninguno de los expertos, lo que la hace apta para escritura de ficción y programación.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 176.943.899.520 parámetros totales, etiquetado con los tags `qwen3_8`, `moe`, `reasoning`, `efficient-thinking` y `token-efficient`. El repositorio se distribuye exclusivamente en formato GGUF para llama.cpp y Strata, con un tamaño de 956,3 GB, e incluye variantes de cuantización de Unsloth (desde UD-IQ1_S hasta BF16) y de la serie Swift de ukisai.

La relevancia de esta ficha es doble: por un lado, documenta un caso de fine-tuning no oficial sobre un modelo grande de Qwen; por otro, advierte de que se trata de una implementación "cruda, prueba de concepto" sin garantías de seguridad, pensada para investigación y entornos controlados, no para producción comercial directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), segun tags del repositorio |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (valor usado en el ejemplo de llama-cli de la model card) |
| Tipos de cuantizacion | GGUF: UD-IQ1_S hasta BF16 (serie Unsloth), UD-Q4_K_XL-V2, serie Swift |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | GGUF (safetensors solo como dato de parametros del modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con arquitectura Mixture-of-Experts, según los tags `moe` y `qwen3_8` del repositorio. No se dispone de información sobre el número de expertos, el número de parámetros activos por token, la composición del dataset de preentrenamiento ni las etapas de post-entrenamiento (RLHF, DPO) del modelo original en la información proporcionada.

La modificación de este repositorio consiste en una abliteración aplicada mediante la técnica de remove-refusals-with-transformers, que identifica y resta la dirección de activación responsable de los rechazos. La versión v2 ajusta el énfasis de la ablación y, a diferencia de la v1, no ablaciona ningún experto. El autor incluye un parche (`patch-unsloth`) que permite aplicar la modificación sobre todas las variantes cuantizadas de unsloth/Qwen3.8-Flash-Next-GGUF sin necesidad de redistribuir los pesos completos, lo que ahorra almacenamiento. Además, se ha generado una imatrix (`imatrix_micro3.gguf`) a partir de un fichero de calibración (`calibration3.txt`) para producir la cuantización UD-Q4_K_XL-V2, con una ligera reducción de perplejidad. Las pruebas se realizaron con llama.cpp b11540.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline `image-text-to-text` (entrada de imagen y texto).
- Razonamiento explícito y modo de pensamiento eficiente en tokens (tags `reasoning`, `efficient-thinking`, `token-efficient`).
- Generación de código y tareas de programación, según la model card.
- Escritura creativa y novelística, uso declarado por el autor para esta versión.
- Capacidades multimodales de entrada (imagen y texto) heredadas del modelo base.
- Sin filtrado de seguridad efectivo: la ablación reduce los rechazos del modelo original.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar qué comportamientos emergen cuando se elimina la dirección de rechazo, comparando respuestas con el Qwen3.8-Flash-Next original en entornos de laboratorio aislados.
- Escritura de ficción y narrativa larga: el autor indica que la v2 está pensada para novel writing, y la ventana de 262.144 tokens permite mantener arcos narrativos completos y consistencia de personajes en documentos extensos.
- Generación de código en entornos controlados: el modelo conserva los expertos sin ablacionar, lo que según el autor lo hace adecuado para programación; puede usarse en asistentes de desarrollo internos con revisión humana obligatoria.
- Evaluación de cuantizaciones GGUF: el repositorio ofrece variantes desde IQ1_S hasta BF16 y una imatrix propia, lo que permite medir el impacto de la cuantización en perplejidad y calidad sobre un MoE de ~177.000 millones de parámetros.
- Pruebas de pipelines llama.cpp y Strata: sirve como banco de pruebas para validar versiones recientes de llama.cpp (b11540) y del runtime Strata, incluida la verificación SHA256 de la serie Unsloth.
- Análisis de sesgos y contenido sensible: al carecer de filtrado, es útil para estudiar de forma controlada qué tipos de contenido genera el modelo sin restricciones y calibrar clasificadores de seguridad externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una ligera reducción de perplejidad (PPL) en la cuantización UD-Q4_K_XL-V2 respecto a su predecesora, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 176.943.899.520 parámetros, en BF16 se requieren aproximadamente 354 GB solo para pesos; en Q4_K_XL, del orden de 90-100 GB; en IQ1_S, en torno a 25-30 GB. Son estimaciones por tamaño de parámetros, no datos publicados.
- GPU recomendadas: para BF16, múltiples A100 80 GB o H100 80 GB; para Q4, configuraciones multi-GPU de 24-48 GB (por ejemplo, 4x RTX 4090 o 2x A6000); para IQ1_S podría caber en una sola GPU de 32-48 GB.
- Consumer GPU: las cuantizaciones más bajas (IQ1_S, IQ2) son las únicas viables en GPUs de consumo, y con calidad degradada; el modelo completo no cabe en una RTX 4090 de 24 GB.
- Despliegue: llama.cpp (versión b11540 probada) y Strata; el repositorio es GGUF, por lo que también es compatible con derivados de llama.cpp como Ollama o llama-cpp-python, aunque no se confirma en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-Flash-Next-abliterated-v2 | 176.943.899.520 | 262.144 | qwen-community-1.0 | GGUF | Abliterado, sin rechazos, MoE |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | qwen-community-1.0 | no disponible | Modelo base original con alineación de seguridad |
| Huihui-Qwen3.8-Flash-Next-abliterated (v1) | no disponible | no disponible | qwen-community-1.0 | GGUF | Primera versión, ablación con énfasis distinto |
| unsloth/Qwen3.8-Flash-Next-GGUF | no disponible | no disponible | qwen-community-1.0 | GGUF | Cuantizaciones estándar sin abliterar |

## Limitaciones y advertencias

- El filtrado de seguridad está significativamente reducido: puede generar contenido sensible, controvertido o inapropiado.
- No es apto para audiencias públicas, menores ni aplicaciones que exijan alta seguridad, según la propia model card.
- El autor lo describe como una implementación cruda y de prueba de concepto, y recomienda uso exclusivo en investigación, pruebas o entornos controlados, evitando producción o aplicaciones comerciales de cara al público.
- Riesgo de alucinación: no cuantificado en la información disponible, pero aplicable a cualquier modelo de lenguaje sin verificación factual.
- La licencia qwen-community-1.0 impone condiciones de uso comunitario; debe revisarse el fichero LICENSE antes de cualquier uso comercial, y la modificación abliterada puede no estar cubierta por los términos del modelo original.
- Idiomas soportados no documentados; el rendimiento fuera del inglés y el chino es incierto.
- El repositorio ocupa 956,3 GB, lo que exige planificación de almacenamiento y ancho de banda considerables.
- La verificación SHA256 de Strata para la serie Unsloth puede fallar si los pesos se han modificado; la model card sugiere desactivarla, lo que elimina una garantía de integridad.
- No hay garantías de seguridad por defecto ni responsabilidad del autor sobre las consecuencias de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/artificialpossum/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio original de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Versión v1 abliterada: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-GGUF
- Cuantizaciones Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Serie Swift: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Técnica de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- llama.cpp (release b11540): https://github.com/ggml-org/llama.cpp/releases/tag/b11540
- Runtime Strata: https://github.com/Niko1221/Strata
- Ko-fi del autor: https://ko-fi.com/huihuiai

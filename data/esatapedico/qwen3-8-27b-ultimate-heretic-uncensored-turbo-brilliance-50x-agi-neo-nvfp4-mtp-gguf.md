# esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-MTP-GGUF

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una familia de siete cuantizaciones GGUF del tune comunitario `DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored`, una variante "sin censura" del modelo denso Qwen3.8-27B. El trabajo de conversión y empaquetado lo firma el usuario `esatapedico`, que parte de su propio checkpoint NVFP4 de 256 tensores y construye una escalera de precisión sobre un backbone de 448 tensores idéntico byte a byte entre todas las variantes. El resultado es un conjunto de ficheros orientados a inferencia en `llama.cpp` sobre GPUs Blackwell (sm_120) con decodificación especulativa MTP integrada.

La arquitectura del modelo base es un transformer denso híbrido de 27B con Gated DeltaNet y Gated Attention cada cuarta capa, más una cabeza MTP (Multi-Token Prediction) embebida que actúa como drafter para decodificación especulativa sin necesidad de un modelo auxiliar. El repositorio incluye además un proyector de visión (`mmproj-BF16.gguf`) que habilita entrada multimodal al combinarse con cualquiera de los siete ficheros.

Su relevancia práctica es doble: por un lado, demuestra un flujo de cuantización NVFP4 a GGUF con verificación SHA-256 por tensor; por otro, ofrece siete puntos de operación entre 14,86 GB y 19,69 GB que permiten ajustar el uso de VRAM frente a la pérdida de perplejidad. La licencia declarada es Apache 2.0, aunque conviene revisar la cadena de modelos base antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: Gated DeltaNet + Gated Attention cada cuarta capa, con cabeza MTP embebida |
| Parametros totales | 27B (modelo base declarado); el checkpoint safetensors del repo registra 460.730.096 parámetros, dato inconsistente con el nombre del modelo |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | NVFP4 (backbone), Q2_K, Q3_K, IQ4_XS, Q5_0, Q6_K, Q8_0, BF16 según la variante y el grupo de tensores (lm_head, token_embd, cabeza MTP) |
| Idiomas soportados | Inglés y multilingüe (según tags del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (siete ficheros) + proyector de visión GGUF en BF16 |

## Arquitectura y entrenamiento

El modelo base combina capas de atención clásica con Gated DeltaNet, un mecanismo de estado recurrente con compuertas que sustituye a la atención en tres de cada cuatro capas. Esta hibridación reduce el coste de cómputo y memoria en contextos largos frente a un transformer denso convencional del mismo tamaño. La cabeza MTP permite predecir varios tokens por paso y se emplea como drafter interno en `llama.cpp` mediante `--spec-type draft-mtp`, sin necesidad de cargar un modelo especulador separado.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens, ni sobre si el tune de DavidAU incluyó RLHF, DPO u otras fases de alineamiento. El trabajo de `esatapedico` se limita a la conversión numérica: parte de un checkpoint NVFP4 de 256 tensores, normaliza 192 tensores adicionales a NVFP4 y mantiene los 48 vectores `ssm_alpha` en F32, dando lugar a un backbone de 448 tensores idéntico byte a byte en las siete variantes. Cada fichero contiene 1.122 tensores en total y la integridad se verifica con SHA-256 por tensor y por fichero.

## Capacidades

- Generación de texto en inglés y otros idiomas, con el sesgo multilingüe heredado de la familia Qwen.
- Razonamiento y conversación multi-turno, condicionados por el tune "Heretic Uncensored" del modelo base.
- Entrada multimodal de imagen gracias al proyector `mmproj-BF16.gguf`, que se carga con `--mmproj` junto a cualquier variante.
- Decodificación especulativa MTP integrada en todos los ficheros, lo que acelera la generación sin drafter externo.
- Compatibilidad con el ecosistema `llama.cpp` para inferencia local y serving.
- No se documenta soporte explícito de tool calling, function calling ni flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Inferencia local en GPU Blackwell: los siete ficheros están pensados para `llama.cpp` sobre sm_120, de modo que un equipo con RTX 50 series puede servir el modelo con la variante que mejor encaje en su VRAM.
- Despliegue con presupuesto de VRAM ajustado: la variante VERY-LOW (14,86 GB) permite cargar el modelo en GPUs de 16 GB, mientras que VERY-HIGH (19,69 GB) aprovecha tarjetas de 24 GB con cabezas en BF16.
- Generación de texto interactiva con baja latencia: la cabeza MTP embebida actúa como drafter y acelera la decodificación en `llama.cpp` sin cargar un modelo especulador adicional.
- Experimentación con modelos sin censura: el tune "Heretic Uncensored" está orientado a investigación sobre comportamiento de modelos sin las restricciones de alineamiento habituales, siempre con revisión de contenido en producción.
- Análisis de imágenes con un LLM local: combinando cualquier variante con `mmproj-BF16.gguf` se obtiene un pipeline multimodal que responde a preguntas sobre imágenes sin depender de APIs externas.
- Evaluación de pipelines de cuantización: la escalera de siete niveles con backbone idéntico y verificación SHA-256 sirve para medir el impacto de la precisión en lm_head, embeddings y cabeza MTP sobre la perplejidad y la velocidad.
- Prototipado de asistentes conversacionales multilingües en entornos aislados, donde el modelo se ejecuta íntegramente en hardware propio.

## Benchmarks y rendimiento

El autor publica perplejidad sobre un corpus diverso (menor es mejor), con un ancla de referencia de 3,2445:

| Variante | Perplejidad |
|---|---|
| VERY-LOW | 3,3414 ± 0,07566 |
| COMPACT-LOW | 3,3559 ± 0,07670 |
| LOW | 3,3237 ± 0,07518 |
| MEDIUM | 3,3206 ± 0,07531 |
| MID-HIGH | 3,3351 ± 0,07585 |
| HIGH | 3,3207 ± 0,07530 |
| VERY-HIGH | 3,3089 ± 0,07469 |

La horquilla completa se sitúa entre un 2 % y un 3,5 % por encima del ancla. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre 14,86 GB (VERY-LOW) y 19,69 GB (VERY-HIGH) solo para los pesos; hay que sumar el espacio de contexto KV y, si se usa visión, los 0,93 GB del proyector.
- GPUs recomendadas: Blackwell sm_120 (RTX 50 series) por el soporte NVFP4; también cabe en A100 y H100, aunque el rendimiento de NVFP4 está optimizado para la generación Blackwell.
- Consumer GPU: sí, en tarjetas de 16 GB con VERY-LOW o COMPACT-LOW y en tarjetas de 24 GB con MEDIUM, MID-HIGH, HIGH o VERY-HIGH.
- Despliegue: `llama.cpp` es el runtime objetivo; para decodificación especulativa hay que activar `--spec-type draft-mtp`. No se documenta soporte en vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (Qwen3.8-27B Ultimate Heretic NVFP4 MTP GGUF) | 27B denso | No disponible | GGUF NVFP4 + escalera de precisión | Apache 2.0 | Siete variantes, MTP embebido, visión opcional |
| `DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored` | 27B denso | No disponible | Safetensors | No disponible | Modelo base del tune; sin cuantizar |
| `esatapedico/Qwen3.8-27B-...-NVFP4` (256 tensores) | 27B denso | No disponible | NVFP4 | Apache 2.0 | Checkpoint clásico del que parte esta familia |
| `esatapedico/Qwen3.8-27B-...-NVFP4-W4A16-T400` | 27B denso | No disponible | W4A16 (400 tensores) | Apache 2.0 | Checkpoint de serving con otra estrategia de cuantización |

No se dispone de datos de benchmarks comparativos con modelos de otras familias, por lo que la comparación se limita a las variantes del mismo linaje.

## Limitaciones y advertencias

- El tune "Heretic Uncensored" está diseñado para reducir las restricciones de alineamiento; puede generar contenido inapropiado y requiere filtros propios en producción.
- Riesgo de alucinación inherente a un modelo de 27B sin datos públicos de evaluación en razonamiento o matemáticas.
- Los datos de parámetros son inconsistentes: el nombre indica 27B, pero el checkpoint safetensors del repo registra 460.730.096 parámetros; conviene verificar el tamaño real antes de dimensionar el hardware.
- La perplejidad publicada está entre un 2 % y un 3,5 % por encima del ancla, con solapamiento de intervalos entre variantes; la elección de tier no debe basarse solo en ese dato.
- El soporte de NVFP4 está atado a Blackwell sm_120; en GPUs anteriores el rendimiento puede degradarse o requerir conversión.
- La licencia Apache 2.0 se declara en este repositorio, pero la cadena de modelos base (DavidAU y Qwen3.8) debe revisarse por separado antes de un uso comercial.
- No se documenta longitud de contexto, soporte de tool calling ni idiomas distintos del inglés y "multilingual" genérico.
- El repositorio ocupa 234,1 GB, por lo que la descarga completa de las siete variantes exige espacio de almacenamiento considerable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Checkpoint NVFP4 de 256 tensores: https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4
- Checkpoint W4A16 de 400 tensores: https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-W4A16-T400
- Sitio del autor de la conversión: https://www.esatapedico.com

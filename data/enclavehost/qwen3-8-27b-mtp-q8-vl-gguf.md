# EnclaveHost/qwen3.8-27b-mtp-q8-vl-gguf

## Resumen

Qwen3.8 27B Q8 con MTP y visión para Enclave es un bundle de modelo multimodal creado por EnclaveHost, que empaqueta el modelo de lenguaje Qwen3.8-27B de Qwen en cuantización Q8_0 junto con un encoder/proyector de visión en F16, el tokenizer oficial y datos de calibración para el backend de inferencia shielded de Enclave. Su objetivo es permitir la ejecución de un modelo de 27 000 millones de parámetros con comprensión de imágenes y decodificación acelerada mediante MTP (Multi-Token Prediction) en entornos de computación confidencial.

La arquitectura es híbrida: 64 capas de transformador (48 de atención lineal y 16 de atención completa) más una capa MTP nativa, con una ventana de contexto de 262 144 tokens y un vocabulario de 248 320 tokens. El formato GGUF facilita su uso en motores basados en llama.cpp. La relevancia del modelo radica en que combina multimodalidad, predicción de múltiples tokens y soporte para inferencia confidencial, sin necesidad de un modelo draft separado para la decodificación especulativa.

El bundle no requantiza pesos: los archivos GGUF provienen de la versión de Unsloth y se conservan byte a byte. La calibración adicional es específica para el protocolo de offload de punto fijo de Enclave y no modifica la cuantización original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (arquitectura `qwen35`): 64 capas trunk (48 de atención lineal y 16 de atención completa) más 1 capa MTP nativa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q8_0 (modelo de lenguaje), F16 (proyector de visión) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (lenguaje y proyector), tokenizer.json |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.8-27B y su implementación en GGUF usa la arquitectura `qwen35`: 64 capas trunk compuestas por 48 capas de atención lineal y 16 de atención completa, más una capa adicional de MTP (Multi-Token Prediction). El `block_count` en el GGUF es 65 y `nextn_predict_layers` es 1. La dimensión oculta es 5120, con 24 cabezas de consulta, 4 cabezas KV, dimensión de cabeza 256 y un vocabulario de 248 320 tokens. Los tensores MTP están embebidos en `blk.64.*`, de modo que no se necesita un modelo draft separado.

No se proporcionan datos sobre el proceso de entrenamiento del modelo base ni sobre ajustes posteriores como RLHF o DPO. Los pesos se conservan byte a byte desde la versión GGUF de Unsloth. La calibración incluida (`qwen3.8-27b-mtp-q8-vl-gguf.calib`) es un artefacto de Enclave para su protocolo de offload en punto fijo, generada contra el motor llama.cpp/ggml 0.18.0. Observa entradas de prosa, código, texto numérico, imágenes y pasos de MTP, pero no implica un reentrenamiento ni una modificación de la cuantización.

## Capacidades

- Generación de texto multimodal: acepta imágenes y texto como entrada y produce texto, según el pipeline `image-text-to-text`.
- Comprensión de visión: incluye un encoder/proyector de visión en F16 que se carga perezosamente en la primera imagen.
- Decodificación MTP nativa: la capa MTP permite predecir uno o dos tokens adicionales durante la decodificación, sin necesidad de un modelo draft separado.
- Contexto largo: ventana nativa de 262.144 tokens, útil para documentos extensos o conversaciones largas.
- Inferencia shielded: la calibración de punto fijo y los archivos de configuración están diseñados para el backend de GPU confidencial de Enclave.
- No se documenta soporte de tool calling, function calling ni modos de agente explícitos en la información disponible.

## Casos de uso

- Análisis de documentos confidenciales con imágenes: en entornos como banca o sanidad, el modelo puede procesar capturas de documentos, facturas o informes médicos sin exponer los datos fuera del enclave, gracias al backend shielded y la calibración de punto fijo. El contexto de 262k permite manejar documentos extensos.
- Atención al cliente multimodal: puede gestionar conversaciones que incluyan imágenes (fotos de productos, capturas de pantalla) y texto, con memoria larga. El MTP reduce la latencia percibida en respuestas largas.
- Generación de código con contexto largo: el modelo base Qwen3.8 es competente en código; en un entorno confidencial, un desarrollador podría pedirle que explique o complete código de un repositorio completo, dado el contexto de 262k tokens.
- Extracción de datos de imágenes y texto numérico: la calibración incluye texto numérico e imágenes, por lo que es adecuado para OCR de tablas, gráficos o capturas de dashboards, generando resúmenes o datos estructurados.
- Despliegue de inferencia en GPU heterogéneas: los datos de rendimiento con reservas de VRAM de 4/12/12 GiB y 4/24/24 GiB muestran que puede funcionar en clústeres con GPUs de distinta capacidad (RTX 3070 y V100), útil para aprovechar hardware disponible sin requisitos de una sola GPU enorme.
- Investigación y evaluación de MTP: para investigadores que estudian decodificación especulativa con MTP en modelos de 27B, este bundle ofrece una implementación nativa con datos de validación y archivos de calibración reproducibles.
- Asistente multimodal para soporte técnico: puede ver imágenes de errores o diagramas y guiar al usuario, manteniendo la privacidad en un entorno empresarial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente medidas de rendimiento de decodificación en una validación local, descrita como "smoke checks", no como una evaluación de precisión.

Medidas en un servidor EPYC 9115 con 12 hilos CPU, una RTX 3070 al 50% de su compute share y dos GPUs clase V100 al 100%:

| Reservas VRAM (3070 / V100 / V100) | Decodificación ordinaria | MTP, un token draft | MTP, dos tokens draft |
| --- | ---: | ---: | ---: |
| Solo CPU | 3,28 tok/s | No medido | 3,62 tok/s |
| 4 / 12 / 12 GiB | 8,67–8,83 tok/s | 6,00 tok/s | 4,52 tok/s |
| 4 / 24 / 24 GiB | 5,71 tok/s | 5,64 tok/s | No medido |

## Requisitos de hardware

- El peso del modelo de lenguaje en Q8_0 ocupa aproximadamente 29,05 GB; el proyector de visión en F16 ocupa unos 0,93 GB. Además, se necesita memoria para KV cache, estado recurrente, snapshots de MTP, espacio de trabajo de imagen y buffers shielded.
- En la validación local se usaron reservas de VRAM de 4 GiB en la RTX 3070 y 12 o 24 GiB en cada V100, con distribución de capas entre dispositivos.
- Para una GPU única se recomienda al menos 32-40 GB de VRAM para acomodar el modelo completo en Q8_0. GPUs como A100 80GB o H100 80GB son adecuadas.
- No cabe en una GPU de consumo de 24 GB (RTX 3090/4090) si se pretende cargar el modelo completo en Q8_0; con cuantizaciones menores (Q4) sería posible, pero este bundle es Q8_0.
- Opciones de despliegue: el backend shielded de Enclave y motores compatibles con GGUF que soporten la arquitectura `qwen35`, como llama.cpp/ggml en la revisión 0.18.0.
- Los datos de latencia y throughput se recogen en la tabla de la sección anterior. El uso de MTP puede mejorar o empeorar el rendimiento según el número de tokens draft y la carga de trabajo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | MTP | Visión | Licencia |
| --- | ---: | ---: | --- | --- | --- | --- |
| Qwen3.8-27B (original) | 27.320.697.856 | 262.144 | FP16 | No disponible | No disponible | Apache 2.0 |
| Unsloth Qwen3.8-27B-GGUF | 27.320.697.856 | 262.144 | Varias (Q8_0, Q4, etc.) | No disponible | No disponible | Apache 2.0 |
| EnclaveHost Qwen3.8 27B Q8 MTP VL | 27.320.697.856 | 262.144 | Q8_0 + F16 visión | Sí (1 capa nativa) | Sí | Apache 2.0 |

No se dispone de datos de calidad comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni riesgos de alucinación en la información disponible.
- La validación local fue solo un smoke test, no una evaluación de precisión; los resultados de rendimiento no deben interpretarse como benchmarks de calidad.
- El contexto nativo de 262.144 tokens es teórico; la ventana de despliegue real debe ajustarse a la memoria disponible, y la suma de VRAM no es el único requisito de RAM para inferencia confidencial.
- La calibración está diseñada específicamente para el backend shielded de Enclave. Fuera de ese entorno, el archivo de calibración no aplica y el rendimiento puede variar.
- La arquitectura `qwen35` con capa MTP nativa requiere un motor actualizado (ggml 0.18.0) que soporte estos tensores; versiones anteriores pueden fallar al cargar el modelo.
- No se documentan tool calling ni capacidades de agente, por lo que su uso en pipelines de función debe validarse manualmente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/EnclaveHost/qwen3.8-27b-mtp-q8-vl-gguf
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Repositorio relacionado sin visión: https://huggingface.co/EnclaveHost/qwen3.8-27b-mtp-gguf

# iapp/openthai2.0-qwen3.8-27b-NVFP4

## Resumen

OpenThai 2.0 es un modelo de lenguaje y visión de 27 000 millones de parámetros desarrollado por iApp Technology y AIEAT, especializado en el idioma tailandés y en la lectura de documentos y escritura manual. Está construido sobre Qwen3.8-27B y se distribuye con licencia Apache 2.0. Esta variante concreta, `iapp/openthai2.0-qwen3.8-27b-NVFP4`, es una cuantización NVFP4 (pesos y activaciones en FP4) realizada con `llm-compressor` y pensada para ejecutarse en GPUs NVIDIA Blackwell mediante vLLM. La cuantización mantiene la torre de visión y la cabeza de decodificación especulativa (MTP) en bf16, preservando las capacidades de OCR y de generación acelerada del modelo original.

La relevancia de esta versión radica en que permite desplegar un modelo de 27B con capacidades multimodales y agénticas en hardware Blackwell con un consumo de memoria reducido, manteniendo la calidad del modelo base. Incluye además una corrección importante: la restauración de los tensores `mtp.*` que faltaban en versiones anteriores, lo que restablece el funcionamiento correcto de la decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) con torre de visión y cabeza MTP |
| Parametros totales | 27 356 728 560 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 32 768 tokens (según configuración de vLLM) |
| Tipos de cuantizacion | NVFP4 (FP4 para pesos y activaciones), con torre de visión y MTP en bf16 |
| Idiomas soportados | Tailandés, inglés (y probablemente otros del modelo base, no especificados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye `model.safetensors` y `model-mtp.safetensors`) |

## Arquitectura y entrenamiento

El modelo base OpenThai 2.0 es un transformer denso de 27B parámetros basado en Qwen3.8-27B, con una torre de visión para procesamiento de imágenes y una cabeza MTP (Multi-Token Prediction) para decodificación especulativa. La cuantización NVFP4 se realizó mediante `llm-compressor` con el `QuantizationModifier`, calibrando con el dataset ultrachat (512 muestras de 2048 tokens). La torre de visión, la cabeza MTP y la capa `lm_head` se mantienen en bf16 para no degradar las capacidades de OCR y de generación especulativa. No se realizó ningún entrenamiento adicional; es una cuantización post-entrenamiento.

## Capacidades

- Generación de texto en tailandés e inglés con conocimiento especializado de Tailandia (cultura, historia, leyes, etc.).
- Lectura de documentos tailandeses y escritura manual a nivel especializado, con una reducción del 60 % de errores frente al modelo base.
- Razonamiento y respuesta a preguntas de exámenes nacionales tailandeses (puntuación 0.842).
- Uso agéntico de herramientas (tool calling) con resultados superiores a su modelo base y a Typhoon 2.5 en el benchmark BFCL (0.820).
- Decodificación especulativa mediante cabeza MTP, que acelera la inferencia cuando se usa con vLLM y `--speculative-config`.
- Capacidades multimodales de visión (OCR, análisis de imágenes) gracias a la torre de visión en bf16.

## Casos de uso

- Atención al cliente automatizada en tailandés: el modelo puede gestionar conversaciones multi-turno con contexto largo (32K tokens) y responder con conocimiento local, integrándose en sistemas de soporte de empresas tailandesas.
- Digitalización de documentos administrativos: su capacidad de OCR de escritura manual permite extraer datos de formularios, solicitudes y documentos históricos en tailandés, reduciendo errores frente a modelos genéricos.
- Asistente agéntico para tareas de back-office: con soporte de tool calling, puede encadenar llamadas a APIs, bases de datos y servicios web para completar tareas como reservas, consultas o generación de informes.
- Generación de contenido localizado: redacción de artículos, guiones o materiales educativos en tailandés con registro natural y explicativo, útil para medios y editoriales.
- Análisis de imágenes con texto tailandés: combinando visión y lenguaje, puede describir, resumir o traducir contenido de capturas de pantalla, carteles o fotografías de documentos.
- Despliegue en producción con vLLM en hardware Blackwell: su cuantización NVFP4 permite servir el modelo con menor uso de VRAM y latencia reducida, adecuado para entornos empresariales con GPUs B200.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización NVFP4. Los datos disponibles corresponden al modelo base OpenThai 2.0:

| Benchmark | Resultado (modelo base) |
|---|---|
| Reducción de errores en lectura de escritura manual | 60 % frente a Qwen3.8-27B |
| Exámenes nacionales tailandeses | 0.842 |
| BFCL (agentic tool use) | 0.820 |

Estos valores son del modelo sin cuantizar; la cuantización NVFP4 puede introducir ligeras variaciones, pero no se han publicado mediciones al respecto.

## Requisitos de hardware

- GPU con soporte para FP4 (NVIDIA Blackwell, p. ej. B200, B100) para aprovechar la cuantización NVFP4.
- VRAM estimada: los pesos en FP4 ocupan aproximadamente 13,7 GB (27,36B × 0,5 bytes), más la torre de visión y MTP en bf16 (~0,85 GB adicionales) y overhead de activaciones y KV cache. Con contexto de 32K, se recomienda al menos 24 GB de VRAM, aunque el uso real depende de la configuración de vLLM.
- No es adecuado para GPUs consumer sin soporte FP4 (RTX 4090, etc.) a menos que se use una cuantización diferente.
- Runtime recomendado: vLLM 0.26 o superior, con `--speculative-config '{"method":"qwen3_5_mtp","num_speculative_tokens":2}'` para activar la decodificación especulativa.
- Alternativas de despliegue: no se mencionan otras opciones (llama.cpp, Ollama) para este formato específico; el formato NVFP4 está orientado a vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | BFCL |
|---|---|---|---|---|---|
| OpenThai 2.0 (base) | 27B | 32K | Apache 2.0 | Tailandés, visión, agéntico | 0.820 |
| OpenThai 2.0 NVFP4 (este) | 27B | 32K | Apache 2.0 | Igual que base, cuantizado | no disponible |
| Typhoon 2.5 | no disponible | no disponible | no disponible | Tailandés | inferior a OpenThai 2.0 (según fuentes) |
| Qwen3.8-27B | 27B | 32K | Apache 2.0 | General | no disponible |

La comparativa se basa en los datos publicados por iApp; no se dispone de cifras exactas de Typhoon 2.5.

## Limitaciones y advertencias

- La cuantización NVFP4 puede provocar una ligera pérdida de precisión en tareas de razonamiento complejo, aunque no se han publicado evaluaciones específicas.
- Requiere hardware NVIDIA Blackwell; no es compatible con GPUs más antiguas sin soporte FP4.
- La versión anterior de este repositorio carecía de los tensores MTP, lo que degradaba el rendimiento con decodificación especulativa. Asegúrate de descargar la versión actualizada (2026-08-31) o sirve sin `--speculative-config`.
- El modelo está optimizado para tailandés e inglés; su rendimiento en otros idiomas puede ser inferior.
- No se han documentado sesgos específicos, pero al estar entrenado principalmente con datos tailandeses, puede reflejar sesgos culturales o regionales.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos del modelo base Qwen3.8-27B para confirmar restricciones adicionales.

## Enlaces

- Modelo cuantizado: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b-NVFP4
- Modelo base: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b
- Página oficial de OpenThai 2.0: https://openthai.aieat.or.th/en/openthai2p0
- Blog de lanzamiento de iApp: https://iapp.co.th/blog/openthai2p0-launch
- Página de modelos de iApp: https://iapp.co.th/openmodels/openthai2p0

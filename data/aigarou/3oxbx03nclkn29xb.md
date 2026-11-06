# AIGAROU/3oxbx03nclkn29xb

## Resumen

El modelo identificado en Hugging Face como `AIGAROU/3oxbx03nclkn29xb` es una redistribución del checkpoint `huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF`, es decir, una versión "abliterated" (sin mecanismos de rechazo) del modelo multimodal `Qwen/Qwen3.6-35B-A3B` de Alibaba. El autor original del proceso de abliteración es el colectivo huihui-ai, mientras que el repositorio aquí descrito se limita a reempaquetar dichos pesos bajo una cuenta distinta. La arquitectura de partida es un transformer de tipo Mixture-of-Experts (MoE) con 35.505.251.456 parámetros totales, activando un subconjunto por token (el sufijo "A3B" indica aproximadamente 3 mil millones de parámetros activos, aunque este dato no se confirma en la información disponible).

El problema que aborda es doble: por un lado, ofrece una variante sin censura del modelo base, útil para investigación sobre alineamiento y evaluación de sesgos; por otro, distribuye los pesos en formato GGUF cuantizado (Q4_K mencionado en la model card) para permitir inferencia local en hardware de consumo mediante llama.cpp. La relevancia actual radica en que combina tres tendencias: modelos MoE eficientes, capacidades multimodales (pipeline `image-text-to-text`) y decodificación especulativa mediante MTP (Multi-Token Prediction), que acelera la generación.

No obstante, conviene subrayar que la model card del repositorio es prácticamente una copia de la del autor original, con advertencias explícitas sobre el riesgo de generar contenido sensible y la recomendación de uso exclusivamente en entornos de investigación controlados. La licencia declarada es Apache 2.0, heredada del modelo Qwen base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), multimodal image-text-to-text |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (el sufijo "A3B" sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | 262.144 tokens (según el ejemplo de `llama-cli` con `-c 262144` en la model card) |
| Tipos de cuantizacion | GGUF (Q4_K mencionado explícitamente; otras variantes no detalladas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 85,8 GB); también se declara librería `transformers` |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.6-35B-A3B` emplea una arquitectura de transformer con mezcla de expertos (MoE), en la que cada token activa únicamente una fracción de los 35,5 mil millones de parámetros totales. Esta configuración busca mantener la calidad de un modelo denso grande reduciendo el coste computacional por token. El pipeline declarado es `image-text-to-text`, lo que implica que el modelo incorpora un codificador visual y puede procesar entradas multimodales además de texto. La model card menciona además soporte de MTP (Multi-Token Prediction), una técnica de decodificación especulativa que permite proponer varios tokens por paso y validarlos en paralelo, acelerando la inferencia.

Sobre el proceso de entrenamiento del modelo base no se aporta información en la documentación disponible: no se especifican el número de tokens, la composición del dataset, ni si hubo fases de RLHF o DPO. Lo que sí se documenta es el post-procesado: la variante aquí distribuida ha sido sometida a "abliteration", una técnica que identifica y modifica las direcciones de activación asociadas a los rechazos de seguridad para eliminarlas, dando como resultado un modelo que responde a prácticamente cualquier petición. El autor original describe esta implementación como "cruda y de prueba de concepto", realizada sin TransformerLens.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `conversational`.
- Procesamiento de imágenes junto con texto (image-text-to-text), lo que permite responder preguntas sobre imágenes, describir contenido visual o extraer información de documentos escaneados.
- Razonamiento y matemáticas: capacidades heredadas del modelo Qwen base, aunque no se aportan benchmarks que las cuantifiquen.
- Generación de código: presumible en un modelo Qwen de esta familia, sin datos específicos en la información disponible.
- Decodificación especulativa mediante MTP (`--spec-type draft-mtp`), que acelera la generación en llama.cpp.
- Respuestas sin filtros de seguridad: el proceso de abliteración elimina los rechazos, lo que constituye tanto una capacidad como un riesgo (véase limitaciones).
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el modelo base Qwen suele ser multilingüe, pero no se confirma aquí.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar qué comportamientos emergen cuando se eliminan las capas de rechazo, comparando sus respuestas con las del Qwen base en conjuntos de prompts sensibles. Es adecuado porque la abliteración es precisamente el objeto de estudio.
- Evaluación de sesgos y robustez: al carecer de filtros, expone de forma más directa los sesgos latentes del modelo base, lo que facilita su medición en entornos controlados de auditoría.
- Inferencia local en estaciones de trabajo con GPU de consumo: la disponibilidad de pesos GGUF Q4_K permite ejecutar el modelo con llama.cpp en hardware relativamente asequible, usando `-ngl 99` para descargar todas las capas en GPU.
- Procesamiento de documentos con imágenes en local: gracias al pipeline image-text-to-text, puede extraer texto o describir figuras de PDFs escaneados sin enviar datos a servicios en la nube, algo relevante para datos confidenciales.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o material editorial donde el modelo base podría rechazar temáticas adultas o controvertidas; requiere revisión humana obligatoria.
- Pruebas de robustez de pipelines de moderación: sirve como generador adversarial para validar que los filtros de una aplicación detectan contenido inapropiado antes de llegar al usuario final.
- Aceleración de prototipos con decodificación MTP: en escenarios de generación larga (resúmenes, traducción de documentos extensos) el modo `draft-mtp` reduce la latencia frente a decodificación autoregresiva estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con cuantización Q4_K y ~35,5B parámetros, se requiere del orden de 20-24 GB de VRAM solo para los pesos, más overhead de contexto KV; el repositorio completo en GGUF ocupa 85,8 GB, lo que sugiere múltiples cuantizaciones o precisión superior en algunas variantes.
- GPU recomendadas: A100 40/80 GB, H100, o configuraciones multi-GPU para precisión completa; para Q4_K, una RTX 4090 (24 GB) puede ser justa y probablemente requiera offloading parcial.
- Cabe en GPU de consumo: sí, en formato Q4_K con posible offloading a CPU/RAM; tarjetas de 24 GB (RTX 3090/4090) o 32 GB (RTX 5090) son las candidatas.
- Opciones de despliegue: llama.cpp (con `llama-cli`, `llama-mtmd-cli` para multimodal y `llama-server`), y presumiblemente vLLM/TGI para los pesos en transformers, aunque no se documenta.
- Latencia y throughput: no disponibles; la model card solo indica el uso de `--spec-type draft-mtp --spec-draft-n-max 6` para acelerar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AIGAROU/3oxbx03nclkn29xb (este) | 35,5B totales (MoE) | 262.144 | Apache 2.0 | GGUF / transformers | Abliterated, multimodal, MTP |
| Qwen/Qwen3.6-35B-A3B | 35,5B totales (MoE) | no disponible | Apache 2.0 | transformers | Modelo base con alineamiento estándar |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF | 35,5B totales (MoE) | 262.144 | Apache 2.0 | GGUF | Origen real de estos pesos; idéntico contenido |

La comparativa con modelos de otras familias (p. ej. Llama o Mistral) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: la abliteración elimina los rechazos, por lo que el modelo puede generar contenido sensible, controvertido o inapropiado sin advertencia.
- No apto para audiencias generales ni aplicaciones públicas: la propia model card desaconseja su uso en producción o en entornos orientados al público.
- Riesgo elevado de alucinación: no se documentan evaluaciones de fidelidad; al ser un proof-of-concept, no hay garantías de calidad factual.
- Idiomas soportados no confirmados: no se puede asegurar un rendimiento multilingüe correcto sin datos.
- Licencia Apache 2.0 heredada, pero el uso comercial conlleva responsabilidad legal plena sobre el contenido generado; el autor declina toda responsabilidad.
- Repositorio sin mantenimiento aparente: 0 likes, 53 descargas, creado y actualizado en la misma fecha, sin documentación propia más allá de la copiada del original.
- La model card no detalla el proceso de cuantización más allá de mencionar Q4_K, ni ofrece métricas de perplejidad o degradación por cuantización.
- El uso de `-c 262144` en el ejemplo puede exceder la VRAM disponible en GPUs de consumo, provocando offloading y latencias muy altas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AIGAROU/3oxbx03nclkn29xb
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio original del autor de la abliteración: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF
- Herramienta de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Ko-fi del autor original: https://ko-fi.com/huihuiai

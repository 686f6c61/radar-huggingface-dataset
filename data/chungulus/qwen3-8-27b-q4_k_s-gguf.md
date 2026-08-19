# Chungulus/Qwen3.8-27B-Q4_K_S-GGUF

## Resumen

Qwen3.8-27B es un modelo de visión-lenguaje denso de 27 000 millones de parámetros desarrollado por el equipo Qwen (Alibaba), que combina una arquitectura híbrida Gated DeltaNet con atención completa, un codificador de visión y un proyector multimodal. Presenta una ventana de contexto nativa de 262 144 tokens, capacidades de razonamiento configurable, tool calling nativo y soporte para entrada de imagen y vídeo. Esta ficha cubre la cuantización GGUF Q4_K_S publicada por Chungulus, que es una conversión vanilla sin fine-tuning, byte-idéntica a los pesos validados del modelo original y con el proyector de visión en F16.

La relevancia de esta versión cuantizada radica en que permite ejecutar un modelo multimodal de 27B en hardware de consumo, con un requisito aproximado de 20 GB de memoria total. El repositorio incluye el archivo GGUF principal (15,8 GB) y el proyector de visión (mmproj), junto con metadatos de validación que confirman el paso de pruebas funcionales de generación de texto, tool calling, visión y vídeo. La licencia Apache-2.0 facilita su uso comercial y su integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet + atención completa, con vision tower, proyector multimodal y módulo MTP (multi-token prediction) |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (según fuentes externas; no validado en esta cuantización, el prompt más largo probado fue de 73 tokens) |
| Tipos de cuantizacion | Q4_K_S (GGUF) para el modelo principal; proyector de visión en F16 |
| Idiomas soportados | No disponible en la documentación de esta cuantización |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_S) + mmproj F16 |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que combina capas Gated DeltaNet con capas de atención completa, una innovación que reduce el coste computacional en contextos largos manteniendo la capacidad de recuperación de información. El modelo incluye un codificador de visión y un proyector multimodal que permiten procesar imágenes y vídeo, además de un módulo MTP (multi-token prediction) cuyos tensores se conservan en esta cuantización, aunque no se anuncia aceleración especulativa. El identificador interno de arquitectura es `Qwen3_5ForConditionalGeneration`, pero no se trata de un modelo Qwen3.5.

La cuantización Q4_K_S fue realizada con llama.cpp (revisión `5f754ea0e2fd21e1213db7ebebfd65d938d9d69c`) utilizando cuantización K/IQ, sin calibración para K-quants. Los pesos fuente están fijados al commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del modelo base. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de RLHF o DPO en el modelo original; la model card de esta cuantización solo documenta el proceso de conversión y validación.

## Capacidades

- Generación de texto y chat conversacional con plantilla de chat preservada del modelo fuente.
- Razonamiento configurable mediante los controles `enable_thinking`, `reasoning_effort` y `preserve_thinking`, que permiten activar o ajustar el modo de pensamiento.
- Tool calling nativo: validado en cinco casos del formato nativo de Qwen.
- Visión y vídeo: validado en tres casos deterministas de imagen local; soporta entrada de imágenes y vídeo a través del proyector multimodal.
- Capacidades agénticas de largo horizonte, orientadas a tareas que requieren múltiples pasos y uso de herramientas.
- Soporte de contexto largo de hasta 262K tokens (según especificación del modelo base), aunque no probado en esta cuantización.
- Capacidades multilingües no confirmadas en la documentación de esta cuantización.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto extenso gracias a su ventana de 262K tokens, manteniendo el historial completo de la interacción y usando tool calling para consultar bases de datos o sistemas de tickets.
- Generación de código agéntico en producción: con tool calling nativo y razonamiento configurable, puede integrarse en pipelines de CI/CD para revisar código, generar parches o ejecutar tareas de refactorización guiadas por instrucciones.
- Análisis de documentos e imágenes: al ser un modelo de visión-lenguaje, puede extraer información de capturas de pantalla, diagramas, facturas o fotografías, combinando comprensión visual con razonamiento textual.
- Asistentes de investigación: con contexto largo y capacidades de razonamiento, puede resumir corpus extensos, comparar documentos y responder preguntas complejas que requieren síntesis de múltiples fuentes.
- Automatización de tareas con herramientas: su soporte de tool calling permite construir agentes que interactúan con APIs, ejecutan consultas SQL o controlan aplicaciones externas en flujos de trabajo multi-paso.
- Despliegue local en hardware de consumo: con ~20 GB de memoria requeridos, puede ejecutarse en estaciones de trabajo con GPU de 24 GB (RTX 4090) o en equipos con RAM abundante mediante llama.cpp, Ollama o LM Studio, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni otros tests estandarizados, y no se ha realizado una ejecución de benchmarks sobre estos pesos. El único dato de rendimiento registrado es una velocidad de generación de 14,2 tokens por segundo en el host de validación, sin especificar el hardware utilizado.

## Requisitos de hardware

- Memoria total estimada: aproximadamente 20 GB para el modelo (15,8 GB), el proyector de visión y el overhead de runtime; la caché KV crece con la longitud del contexto.
- GPU recomendadas: RTX 4090 (24 GB) o superior, A100, H100; también compatible con GPUs AMD Radeon y procesadores AMD Ryzen AI Max según el anuncio de soporte Day 0 de AMD.
- Ejecución en CPU: posible con suficiente RAM (32 GB o más), aunque con menor rendimiento.
- Opciones de despliegue: llama.cpp (cliente `llama-mtmd-cli`), Ollama, LM Studio, Unsloth (GGUF y NVFP4) y entornos compatibles con el formato GGUF.
- Latencia y throughput: no hay datos fiables más allá de los 14,2 tokens/s medidos en el host de validación, que no especifica hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (GGUF Q4_K_S) | 27B denso | 262K | Sí | Apache-2.0 | GGUF |
| Qwen2.5-VL-32B | 32B denso | 128K | Sí | Apache-2.0 | safetensors, GGUF |
| Llama-3.2-11B-Vision | 11B denso | 128K | Sí | Llama 3.2 Community License | safetensors, GGUF |
| Qwen3-VL-30B-A3B | 30B MoE (3B activos) | 128K | Sí | Apache-2.0 | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a características estructurales. Qwen3.8-27B destaca por su contexto de 262K tokens y su arquitectura híbrida Gated DeltaNet, mientras que Qwen3-VL-30B-A3B ofrece una alternativa MoE más eficiente en inferencia.

## Limitaciones y advertencias

- La cuantización Q4_K_S puede reducir la calidad de salida respecto al modelo en precisión completa, especialmente en tareas que requieren razonamiento numérico o matices lingüísticos.
- La longitud de contexto arquitectónica de 262K tokens no ha sido validada en esta cuantización; el prompt más largo probado fue de 73 tokens, por lo que no se garantiza un comportamiento correcto en contextos extremadamente largos.
- El runtime debe soportar la gráfica híbrida del lenguaje, la torre de visión, el proyector, el tokenizador y los metadatos MTP; no basta con cargar únicamente el tensor de lenguaje.
- No se anuncia aceleración especulativa mediante MTP, aunque los tensores se conservan.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos de esta cuantización; se heredan los del modelo base, que no han sido evaluados en esta versión.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución del modelo base.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/Chungulus/Qwen3.8-27B-Q4_K_S-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio combinado con validación: https://huggingface.co/Chungulus/Qwen3.8-27B-GGUF/tree/f519a212d6c15cd3292b6ca835dd8ebf235642c0
- Documentación de Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Anuncio de soporte AMD: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía de ejecución local (Yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Página en LM Studio: https://lmstudio.ai/models/qwen3.8

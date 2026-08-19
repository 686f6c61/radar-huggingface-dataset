# Ishowbackup/Qwen3.8-27B-ABLITERATED-BF16

## Resumen

Qwen3.8-27B-ABLITERATED-BF16 es un checkpoint de investigación derivado del modelo oficial Qwen/Qwen3.8-27B, desarrollado por Blackfrost y publicado en Hugging Face por el usuario Ishowbackup. Se trata de un modelo denso de 27 000 millones de parámetros en precisión BF16, con arquitectura híbrida de visión-lenguaje (VLM) que combina Gated DeltaNet con atención completa. Su propósito principal es reducir la superficie de rechazo (refusals) a nivel de pesos, manteniendo las capacidades generales del modelo base: razonamiento, generación de código, uso de herramientas, visión y contexto largo de 262 144 tokens.

Este checkpoint es una modificación a nivel de peso, no un fine-tuning, y está pensado para investigación en seguridad ofensiva, red-teaming y análisis de alineación. Se distribuye como vista previa de investigación pública sin restricciones de acceso, con licencia Apache-2.0. Su relevancia radica en que ofrece una alternativa con menos rechazos falsos positivos para tareas legítimas de ingeniería de software y seguridad, aunque con advertencias claras sobre su uso responsable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B dense hybrid VLM · Gated DeltaNet + full attention |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos; soporte de contexto extendido según guía de Qwen |
| Tipos de cuantizacion | No disponible (repo nativo BF16; se menciona un derivado W4A4 NVFP4 pero no se incluye aquí) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.8-27B, un VLM denso que combina capas con Gated DeltaNet (una variante de atención lineal con compuertas) y capas de atención completa. Esta hibridación permite manejar secuencias largas de forma eficiente, manteniendo la calidad de atención en tareas complejas. El checkpoint no ha sido sometido a fine-tuning, pruning, LoRA, merging ni cuantización; únicamente se ha aplicado una modificación direccional a nivel de pesos sobre la superficie de rechazo del modelo base. El sistema operativo de Blackfrost está incrustado en la plantilla de chat por defecto.

No se proporcionan datos sobre el dataset de entrenamiento original de Qwen3.8-27B ni sobre el proceso de modificación de pesos (el banco de direcciones internas, el calendario de escalado y los datos de captura no se incluyen en el repositorio). La innovación principal es la reducción de rechazos a nivel de peso, sin alterar las capacidades generales del modelo.

## Capacidades

- Generación de texto, razonamiento y codificación: hereda las capacidades del modelo base Qwen3.8-27B, aunque no se han publicado benchmarks específicos en este repositorio.
- Visión: acepta entradas de imagen y vídeo, y produce salidas de texto (pipeline image-text-to-text).
- Tool calling y function calling: soporte declarado en las etiquetas del modelo, aunque no se documentan pruebas específicas.
- Contexto largo: ventana nativa de 262 144 tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Capacidad especial: superficie de rechazo reducida deliberadamente (2,4 % de rechazos residuales en una evaluación de 450 casos), orientada a investigación en seguridad y red-teaming.
- Multilingüismo: no especificado en la información disponible.

## Casos de uso

- Investigación en seguridad ofensiva y red-teaming: el modelo reduce rechazos falsos positivos en tareas legítimas de análisis de vulnerabilidades, permitiendo a equipos de seguridad generar y evaluar exploits en entornos controlados sin interrupciones innecesarias.
- Revisión de código y auditoría de seguridad: con 262 144 tokens de contexto, puede analizar repositorios completos, identificar patrones inseguros y sugerir correcciones, manteniendo el hilo de la conversación durante horas.
- Automatización de desarrollo con tool calling: integrable en pipelines de CI/CD para generar documentación, tests o parches, gracias a su soporte de function calling y razonamiento multi-paso.
- Asistentes de programación con contexto largo: útil para desarrolladores que necesitan mantener conversaciones extensas sobre un proyecto, con capacidad de recordar detalles de archivos y dependencias.
- Análisis de imágenes y vídeo para documentación técnica: puede procesar capturas de pantalla, diagramas o vídeos de demostración y generar descripciones o instrucciones paso a paso.
- Estudio académico de alineación y seguridad de modelos: permite investigar el efecto de la reducción de rechazos a nivel de pesos, comparando comportamientos con el modelo base y otros checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de evaluación incluidos son la evaluación de rechazo y la perplexity en WikiText-2:

| Evaluación de rechazo | Casos evaluados | Respuesta material | Rechazo verdadero restante | Otros |
|---|---:|---:|---:|---:|
| Plantilla upstream cruda | 450 | 360 | 88 | 2 limitaciones de capacidad |
| Re-test con prompt operacional | 88 residuales | 53 | 33 | 1 limitación de capacidad, 1 salida incoherente reproducible |
| Re-test con prompt de ejecución corto | 33 residuales | 22 | 11 | 0 |
| **Conteo residual final** | **450 casos originales** | — | **11 (2,4 %)** | — |

| Artifact | Perplejidad de palabra | Perplejidad de byte | Bits/byte |
|---|---:|---:|---:|
| Upstream BF16 limpio | 8,4764 | 1,4914 | 0,5766 |
| Derivado W4A4 NVFP4 | 9,3677 | 1,5195 | 0,6036 |

Estos resultados describen únicamente los artefactos, plantillas, prompts, samplers, rúbrica de evaluación y configuración de servicio documentados; no establecen la retención de capacidades de codificación, visión, uso de herramientas, contexto largo o multi-turno.

## Requisitos de hardware

- VRAM estimada: el checkpoint en BF16 ocupa aproximadamente 55,6 GB en disco (18 shards). Para inferencia, se necesitan al menos 56 GB de VRAM solo para los pesos, más overhead de activaciones y caché KV. En la práctica, se requiere una GPU con 80 GB o más.
- GPU recomendadas: NVIDIA B200 (validada para servir 8K conservador), también A100 80 GB, H100 80 GB o similares. No cabe en GPUs de consumo como RTX 4090 (24 GB) sin cuantización, que no se proporciona en este repositorio.
- Opciones de despliegue: Transformers, SGLang y vLLM con soporte Qwen3.8. El ejemplo de la model card usa SGLang en un contenedor Docker con una B200.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262 144 | Apache-2.0 | Modelo oficial sin modificación de rechazo |
| Qwen3.8-27B-ABLITERATED-BF16 (este) | 27B | 262 144 | Apache-2.0 | Derivado con superficie de rechazo reducida a nivel de pesos |
| Otros modelos abliterated (p. ej., Llama-3-8B-Instruct-abliterated) | 8B | 8 192 | Apache-2.0 | Tamaño menor, sin visión, contexto más corto |

No se dispone de datos de rendimiento comparativo entre estos modelos en tareas estándar. La comparativa se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Es un checkpoint de investigación con superficie de rechazo reducida deliberadamente; no debe representarse como el checkpoint de seguridad estándar de Qwen.
- No es un fine-tune de seguridad: puede generar contenido dañino si se usa de forma malintencionada. Su uso debe limitarse a entornos controlados y legítimos.
- La evaluación de rechazo se realizó sobre 450 casos (150 AdvBench, 150 StrongREJECT, 150 XSTest) y no es exhaustiva; los resultados pueden no generalizar a otros dominios.
- No se han publicado benchmarks de capacidades generales (MMLU, HumanEval, etc.), por lo que no se puede verificar la retención completa de habilidades del modelo base.
- El modelo base Qwen3.8-27B puede tener sus propias limitaciones de idioma, sesgos y alucinaciones, que se heredan en este checkpoint.
- La licencia Apache-2.0 permite uso comercial, pero la naturaleza del modelo (reducción de rechazos) puede implicar responsabilidades legales o éticas adicionales según el caso de uso.
- El repositorio no incluye cuantizaciones; para despliegue en hardware con menos VRAM se requiere cuantización externa, lo que puede alterar el comportamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ishowbackup/Qwen3.8-27B-ABLITERATED-BF16
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B

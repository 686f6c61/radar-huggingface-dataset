# prithivMLmods/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es la versión cuantizada en formato GGUF del modelo Qwen3.8-27B, un modelo de lenguaje causal denso de 27 000 millones de parámetros desarrollado por el equipo Qwen, con un codificador de visión nativo integrado. Forma parte de la generación Qwen3.8, presentada como la más capaz de la familia abierta de Qwen hasta la fecha, y está diseñado para ser compacto y fácil de desplegar en entornos de producción. Su arquitectura híbrida de 64 capas intercala bloques de atención lineal Gated DeltaNet con capas de atención Gated periódicas, entrenado con predicción multi-token (MTP), lo que permite una inferencia acelerada mediante decodificación especulativa integrada en los pesos.

El modelo destaca por su ventana de contexto nativa de 262 144 tokens, ampliable a 1 millón mediante escalado YaRN, y por su capacidad multimodal nativa para comprender imágenes y vídeos, desde diagramas STEM hasta vídeos de una hora. Incluye un parámetro `reasoning_effort` (xhigh/medium/low) para controlar el nivel de razonamiento, con el pensamiento activado por defecto y preservación del razonamiento histórico entre turnos. Según la model card, supera a su predecesor Qwen3.6-27B y rivaliza o excede a modelos más grandes como Muse Glimmer-30B y Opus 4.6 Max en varios benchmarks, con especial fortaleza en tareas de codificación agéntica, uso de ordenador y herramientas multimodales. Se distribuye bajo licencia Apache-2.0 y es compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: 64 capas con Gated DeltaNet linear-attention y Gated Attention periódicas, vision encoder nativo, Multi-Token Prediction (MTP) |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 con YaRN |
| Tipos de cuantizacion | BF16, F16, Q2_K, Q3_K_L, Q3_K_M, Q4_0, Q4_K_M, Q4_K_S, Q5_0, Q5_K_M, Q5_K_S, Q6_K, Q8_0; mmproj en bf16, f16 y q8_0 |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base Qwen/Qwen3.8-27B) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura de transformer denso con un diseño híbrido de atención: 64 capas que intercalan bloques de atención lineal Gated DeltaNet con capas de atención Gated periódicas. Esta combinación busca reducir el coste computacional de la atención estándar manteniendo la capacidad de modelar dependencias de largo alcance. El modelo incorpora un codificador de visión nativo que permite procesar imágenes y vídeos directamente, sin módulos externos. Se entrenó con Multi-Token Prediction (MTP), una técnica que añade cabezas de salida adicionales capaces de predecir varios tokens futuros en una sola pasada hacia adelante, lo que acelera la inferencia local al integrar decodificación especulativa en los propios pesos, sin necesidad de un modelo borrador separado.

El entrenamiento incluye un mecanismo de control de razonamiento mediante el parámetro `reasoning_effort`, que permite ajustar el nivel de esfuerzo de pensamiento (xhigh, medium, low). El pensamiento está activado por defecto y el razonamiento histórico se conserva entre turnos de conversación. No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. La ventana de contexto nativa es de 262 144 tokens, ampliable a 1 millón mediante escalado YaRN.

## Capacidades

- Generación de texto y razonamiento general, con control explícito del nivel de esfuerzo de razonamiento mediante `reasoning_effort`.
- Comprensión de imágenes: respuesta a preguntas visuales, razonamiento visual, comprensión de documentos, OCR, generación de descripciones de imágenes.
- Comprensión de vídeo: descripción y razonamiento sobre vídeos de hasta una hora de duración.
- Codificación agéntica: destacado en benchmarks de agentes de codificación como Terminal-Bench 2.1 y SWE-bench Pro.
- Uso de ordenador y móvil: capacidades de computer-use y mobile-use según resultados en OSWorld-Verified y AndroidWorld.
- Soporte de tool calling y uso de herramientas multimodales, según la model card.
- Multilingüe limitado a inglés y chino.
- Compatible con decodificación especulativa integrada vía MTP en formato GGUF, acelerando la inferencia local.
- Preservación del razonamiento histórico entre turnos conversacionales.

## Casos de uso

- Asistente de atención al cliente multimodal: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262 144 tokens) mientras procesa capturas de pantalla o documentos enviados por el usuario, gracias a su visión nativa y su capacidad de razonamiento histórico.
- Agente de automatización de tareas de escritorio: con su rendimiento en OSWorld-Verified (84.3) y AndroidWorld (81.9), puede controlar aplicaciones de escritorio o móviles para automatizar flujos de trabajo, como rellenar formularios o extraer datos de interfaces.
- Generación y revisión de código en producción: su fortaleza en agentic coding (Terminal-Bench 2.1: 73.0, SWE-bench Pro: 61.7) lo hace adecuado para integrarse en pipelines de CI/CD como asistente de programación, generación de tests o resolución de issues.
- Análisis de documentos técnicos y científicos: la comprensión de diagramas STEM y OCR permite extraer información de papers, patentes o informes con figuras complejas, manteniendo el contexto de documentos extensos.
- Transcripción y resumen de vídeos: su capacidad de video-understanding permite generar resúmenes o subtítulos de vídeos de larga duración, útil para archivado de contenido o accesibilidad.
- Razonamiento matemático y científico asistido: con GPQA Diamond de 89.2, puede ayudar en resolución de problemas de nivel avanzado en física, química o biología, combinando texto e imágenes de enunciados.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones GGUF (Q4_K_M de 16.8 GB), puede ejecutarse en GPUs de 24 GB como RTX 4090 o en Mac con 24 GB de RAM unificada, permitiendo uso offline y privado.

## Benchmarks y rendimiento

Según la model card del autor, Qwen3.8-27B obtiene los siguientes resultados:

| Benchmark | Resultado |
|---|---|
| Terminal-Bench 2.1 | 73.0 |
| SWE-bench Pro | 61.7 |
| OSWorld-Verified (computer-use) | 84.3 |
| AndroidWorld (mobile-use) | 81.9 |
| LiveCodeBench v6 | 90.3 |
| GPQA Diamond | 89.2 |
| IFBench | 79.5 |

La model card indica que supera a su predecesor Qwen3.6-27B y que rivaliza o excede a Muse Glimmer-30B y Opus 4.6 Max en varios de estos benchmarks, aunque no se proporcionan las cifras comparativas de esos modelos. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ~10.9 GB, Q3_K_M ~13.5 GB, Q4_0 ~15.7 GB, Q4_K_M ~16.8 GB, Q5_K_M ~19.5 GB, Q6_K ~22.4 GB, Q8_0 ~29 GB, BF16/F16 ~54.7 GB. Los archivos mmproj añaden entre 629 MB y 931 MB adicionales.
- GPU recomendadas: para cuantizaciones Q4/Q5, una RTX 4090 o RTX 3090 de 24 GB es suficiente; para Q6_K, también cabe en 24 GB; para Q8_0 se necesitan 32 GB o más (por ejemplo, A100 40 GB); para BF16/F16 se requieren GPUs de 48 GB o más (A100 80 GB, H100).
- En Mac con memoria unificada de 24 GB puede ejecutarse con cuantizaciones Q4 o Q5, según la guía de modelfit.io.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, SGLang, TokenSpeed y Hugging Face Transformers.
- La decodificación especulativa integrada vía MTP reduce la latencia de generación en comparación con modelos sin esta característica, aunque no se proporcionan cifras exactas de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (este) | 27B denso | 262 144 (1M con YaRN) | Apache-2.0 | Multimodal, MTP, híbrido DeltaNet |
| Qwen3.6-27B | 27B denso | No disponible | Apache-2.0 | Predecesor, superado por Qwen3.8-27B según la model card |
| Muse Glimmer-30B | 30B | No disponible | No disponible | Modelo mayor, Qwen3.8-27B rivaliza o excede en varios benchmarks |
| Opus 4.6 Max | No disponible | No disponible | No disponible | Modelo propietario, Qwen3.8-27B compite en algunos benchmarks |

No se dispone de datos detallados de los modelos comparados más allá de lo indicado en la model card. Para una comparativa rigurosa con otros modelos abiertos de 27B (por ejemplo, Qwen2.5-VL-27B o Llama 3.1 8B), no hay información suficiente en las fuentes proporcionadas.

## Limitaciones y advertencias

- Idiomas soportados limitados a inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento visual o documentos complejos; se recomienda verificación humana en aplicaciones críticas.
- La ventana de contexto de 262 144 tokens puede degradar el rendimiento en los extremos superiores; el escalado a 1M con YaRN puede introducir artefactos.
- El modelo base es de acceso abierto bajo Apache-2.0, lo que permite uso comercial, pero las cuantizaciones GGUF de este repositorio son obra de prithivMLmods y deben verificarse las condiciones de redistribución.
- El tamaño del repositorio (307.1 GB) implica que la descarga de todas las cuantizaciones es pesada; se recomienda descargar solo el archivo necesario.
- No se especifican sesgos conocidos ni evaluaciones de seguridad en la información disponible; se recomienda auditar el modelo antes de desplegarlo en entornos con usuarios finales.
- El rendimiento en tareas de agente (computer-use, mobile-use) puede requerir ajustes adicionales de integración con el entorno de ejecución.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/prithivMLmods/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de ejecución local (yottalabs.ai): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guía de ejecución en Mac/GPU (modelfit.io): https://modelfit.io/blog/run-qwen38-27b-locally-2026/
- llama.cpp: https://github.com/ggml-org/llama.cpp

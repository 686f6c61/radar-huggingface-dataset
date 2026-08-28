# aisquared/Muse-Glimmer-30B-W4A16-LLMCompressor

## Resumen

Muse Glimmer es un modelo de lenguaje multimodal de 29.6 mil millones de parámetros desarrollado por Meta, destilado de Muse Spark y diseñado específicamente para agentes locales siempre activos. Corre en una sola GPU de consumo, está licenciado bajo Apache 2.0 y está ajustado para uso de herramientas, tareas largas y recuperación de fallos. Esta versión concreta, publicada por aisquared, es una cuantización uniforme de 4 bits weight-only (W4A16) del modelo base `meta-models/Muse-Glimmer-30B`, construida con llm-compressor (GPTQ) y empaquetada en formato compressed-tensors. El resultado reduce el tamaño del modelo a 22.2 GB y permite servirlo nativamente con vLLM, manteniendo la ventana de contexto de 128K y las capacidades multimodales (texto e imágenes) del original.

La relevancia de esta cuantización radica en que hace viable el despliegue de un modelo de 30B con capacidades agénticas en hardware de consumo, sin sacrificar la calidad de razonamiento ni la compatibilidad con el ecosistema vLLM. A diferencia de otras cuantizaciones, esta versión conserva en BF16 el `lm_head` (vocabulario de 202K), la torre de visión y el proyector multimodal, lo que minimiza la pérdida de precisión en tareas que requieren comprensión visual y generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso con encoder de visión ViT-G/14 |
| Parametros totales | 29.6B (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | W4A16 (INT4 pesos, BF16 activaciones), group size 128, simétrico |
| Idiomas soportados | No disponible (no especificado por el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors, pack-quantized) |

## Arquitectura y entrenamiento

El modelo base Muse Glimmer es un transformer denso de 29.6B parámetros con un encoder de percepción ViT-G/14 para procesamiento de imágenes. Fue destilado de Muse Spark, un modelo más grande, para optimizar su ejecución en entornos locales con recursos limitados. Emite razonamiento con ámbito de canal (channel-scoped reasoning) y llamadas a herramientas en formato XML ATEM en lugar de JSON, lo que requiere parsers específicos en el runtime.

La cuantización W4A16 se realizó con llm-compressor (GPTQ Hessian rounding) sobre las capas lineales del language-decoder, manteniendo en BF16 el `lm_head`, la torre de visión y el proyector multimodal. La calibración se hizo con el dataset HuggingFaceH4/ultrachat_200k, usando 512 muestras de 2048 tokens con el chat template del modelo. El resultado es un esquema INT4 para pesos y BF16 para activaciones, con group size 128 y cuantización simétrica.

## Capacidades

- Generación de texto y razonamiento paso a paso con ámbito de canal (channel-scoped reasoning).
- Comprensión de imágenes (multimodal) gracias al encoder ViT-G/14.
- Tool calling / function calling mediante llamadas XML ATEM, no JSON.
- Soporte para agentes multi-paso y recuperación de fallos en tareas largas.
- Capacidades multilingües no especificadas por el autor (probablemente multilingüe, pero no confirmado).
- Integración nativa con vLLM mediante parsers dedicados (`muse_glimmer` para tool-call y reasoning).

## Casos de uso

- Asistentes personales locales: el modelo puede ejecutarse en una GPU de consumo (por ejemplo, RTX 4090) y gestionar conversaciones multimodales con contexto largo (128K), ideal para asistentes que necesitan recordar interacciones previas y procesar imágenes capturadas por el usuario.
- Automatización de tareas con herramientas: gracias a su soporte de tool calling en formato XML ATEM, puede integrarse en pipelines que requieren llamadas a APIs, ejecución de comandos o interacción con servicios externos, todo en local.
- Procesamiento de documentos con imágenes: al combinar visión y lenguaje, puede extraer información de facturas, capturas de pantalla o diagramas, y generar resúmenes o respuestas basadas en ese contenido.
- Agentes de código con razonamiento: su capacidad de razonamiento paso a paso y su contexto de 128K permiten analizar repositorios completos, generar código y ejecutar herramientas de desarrollo en un entorno local.
- Soporte técnico automatizado: puede gestionar conversaciones multi-turno con contexto largo, manteniendo el historial de la sesión y accediendo a bases de conocimiento mediante tool calling.
- Investigación académica: al ser Apache 2.0 y correr en hardware local, es adecuado para experimentos de agentes autónomos, evaluación de razonamiento multimodal o fine-tuning adicional sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K u otras evaluaciones para esta cuantización específica.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repo es 22.2 GB, pero con activaciones BF16 y overhead de vLLM, se recomienda al menos 24 GB de VRAM. Una RTX 3090 (24 GB) o RTX 4090 (24 GB) son suficientes.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 (40 GB) o superior. También puede ejecutarse en GPUs de Intel o AMD con soporte para vLLM, aunque se recomienda `--enforce-eager` en esos casos.
- Opciones de despliegue: vLLM (con la imagen `vllm/vllm-openai:muse-glimmer` o `:nightly`), que detecta automáticamente la configuración compressed-tensors. No es compatible con GGUF ni con llama.cpp.
- Latencia y throughput: no disponibles. Dependen del hardware y de la configuración de sampling (se recomienda temp 1.0, top_p 0.95, top_k 64, no greedy).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse Glimmer 30B (base) | 29.6B | 128K | BF16 | Apache 2.0 | HuggingFace |
| aisquared/Muse-Glimmer-30B-W4A16 (esta version) | 29.6B | 128K | W4A16 (INT4/BF16) | Apache 2.0 | HuggingFace |
| aisquared/Muse-Glimmer-30B-bpw4-AutoRound | 29.6B | 128K | AutoRound mixto (~4 bpw) | Apache 2.0 | HuggingFace |
| aisquared/Muse-Glimmer-30B-bpw2.5-AutoRound | 29.6B | 128K | AutoRound mixto (~2.5 bpw) | Apache 2.0 | HuggingFace |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos de 30B con características equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Requiere parsers específicos (`muse_glimmer` para tool-call y reasoning) en vLLM; sin ellos, las llamadas a herramientas y el razonamiento no se procesan correctamente.
- No es compatible con GGUF ni con runtimes como llama.cpp u Ollama; solo vLLM (con la versión que incluya el PR #51655).
- La cuantización W4A16 puede introducir una ligera degradación en tareas de alta precisión, aunque el autor mantiene en BF16 las partes críticas (lm_head, visión, proyector).
- No se han publicado evaluaciones de sesgos o alucinaciones para esta versión cuantizada; se asumen los mismos riesgos que el modelo base.
- El modelo base no especifica los idiomas soportados; es probable que tenga cobertura multilingüe, pero no está confirmado.
- Para uso en producción, es imprescindible seguir las recomendaciones de sampling (temp 1.0, top_p 0.95, top_k 64) y no usar decodificación greedy, ya que el modelo no está optimizado para ello.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aisquared/Muse-Glimmer-30B-W4A16-LLMCompressor
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Página oficial de Muse Glimmer en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Documentación de la API: https://ai.developer.meta.com/docs/muse-glimmer
- Receta de vLLM: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
- PR de vLLM para Muse Glimmer: https://github.com/vllm-project/vllm/pull/51655

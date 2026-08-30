# BattleGhost/Qwen3.8-Flash-Next-UNCENSORED-IQ2_XXS-GGUF

## Resumen

Qwen3.8-Flash-Next-UNCENSORED-IQ2_XXS-GGUF es una conversión y cuantización en formato GGUF del checkpoint `dealignai/Qwen3.8-Flash-Next-UNCENSORED-FP8`, un modelo de lenguaje multimodal de la familia Qwen3.8-Flash-Next desarrollado por Alibaba Qwen y posteriormente modificado por el usuario dealignai para eliminar los rechazos de seguridad (técnica conocida como *abliteration*). El autor de esta cuantización, BattleGhost, ha producido un archivo único de 69,5 GiB con cuantización IQ2_XXS, pensado para ejecutarse en sistemas con 64 GB de RAM y una GPU de 16 GB.

El modelo base es un MoE (mezcla de expertos) de aproximadamente 177 000 millones de parámetros totales, basado en la nueva arquitectura Qwen4 (identificada como `qwen4exp` en llama.cpp), con una ventana de contexto de 262 000 tokens. Esta versión cuantizada permite ejecutar un modelo de gran tamaño en hardware de consumo, aunque con una pérdida de precisión considerable debido a la agresiva cuantización. Es relevante para desarrolladores que necesitan un modelo local con capacidades avanzadas de razonamiento, visión y tool calling, y que aceptan los riesgos legales y éticos de un modelo sin filtros de seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4 (qwen4exp), MoE híbrida con atención GDN + QSA |
| Parametros totales | 176 943 899 520 (~176,9 B) |
| Parametros activos | no disponible (la documentación oficial menciona 125 B, sin confirmar) |
| Longitud de contexto | 262 000 tokens (según unsloth.ai) |
| Tipos de cuantizacion | IQ2_XXS (este archivo); BF16 disponible en repo separado |
| Idiomas soportados | inglés y chino (según fuentes externas) |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | GGUF (IQ2_XXS) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea la arquitectura Qwen4, que introduce mejoras sistemáticas en cuatro áreas: atención, residual, embedding y optimización. La atención combina un mecanismo GDN (probablemente *Gated Delta Network*) con QSA (*Query-Selective Attention*), formando un híbrido que busca mejorar la eficiencia computacional y la capacidad del modelo. Es un modelo de mezcla de expertos (MoE) multimodal, capaz de procesar texto e imágenes, e incorpora predicción multi-token (MTP) para acelerar la decodificación.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados o el uso de técnicas como RLHF o DPO. El checkpoint original de Qwen se ha modificado mediante *abliteration* para eliminar los rechazos de seguridad, lo que da lugar a la variante "UNCENSORED". La cuantización IQ2_XXS se realizó con llama.cpp (revisión b10687) utilizando una matriz de importancia de unsloth, y algunos tensores (195 de 1224) requirieron tipos de cuantización alternativos por restricciones geométricas.

## Capacidades

- Generación de texto y razonamiento avanzado, incluyendo tareas de lógica y matemáticas.
- Procesamiento multimodal: entrada de imágenes junto con texto (según la documentación oficial del modelo base).
- Soporte de tool calling y function calling, lo que permite integrarlo en flujos de agentes.
- Capacidad para razonamiento multi-paso y planificación de tareas complejas.
- Predicción multi-token (MTP) para mejorar la velocidad de generación.
- Multilingüe, con soporte principal de inglés y chino.
- Sin rechazos de seguridad (versión *uncensored*), lo que permite respuestas sin restricciones temáticas.

## Casos de uso

- Asistente de programación con contexto largo: gracias a los 262 000 tokens de ventana, puede analizar repositorios completos, mantener el estado de conversaciones extensas y generar código coherente en proyectos grandes.
- Agente autónomo con tool calling: puede integrarse en pipelines de automatización para consultar APIs, ejecutar comandos o interactuar con bases de datos, gracias a su soporte nativo de function calling.
- Análisis de documentos extensos: contratos, informes financieros o papers científicos pueden procesarse en una sola pasada sin necesidad de dividirlos, lo que facilita la extracción de información y el resumen.
- Generación de contenido creativo sin restricciones: redacción de narrativa, guiones o material de marketing sin filtros temáticos, siempre que se cumplan las leyes aplicables.
- Red teaming y pruebas de seguridad: al carecer de rechazos de seguridad, es útil para evaluar vulnerabilidades en sistemas de IA y entrenar modelos de detección de contenido dañino.
- Traducción y procesamiento bilingüe: su soporte de inglés y chino permite traducción automática y análisis de documentos en ambos idiomas con alta fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para esta cuantización específica ni para el modelo base modificado.

## Requisitos de hardware

- El archivo GGUF pesa 69,5 GiB, por lo que se necesita al menos 70 GB de almacenamiento libre.
- La model card indica que está pensado para un sistema con 64 GB de RAM y una GPU de 16 GB de VRAM, utilizando *offloading* de capas a la GPU.
- Con cuantización IQ2_XXS, la VRAM mínima recomendada es de 16 GB (por ejemplo, RTX 4080, RTX 4090, A100 16 GB). GPUs con menos VRAM pueden funcionar con mayor *offloading* a RAM, pero con latencia superior.
- Se puede ejecutar en CPU pura con 64 GB de RAM, aunque la velocidad será baja.
- Despliegue recomendado con llama.cpp (build reciente con soporte `qwen4exp`), o mediante Ollama si se importa el GGUF. vLLM puede ser compatible si soporta la arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-UNCENSORED-IQ2_XXS (este) | ~176,9 B totales | 262 K | IQ2_XXS | Qwen Community 1.0 | HuggingFace |
| dealignai/Qwen3.8-Flash-Next-UNCENSORED-FP8 | ~176,9 B totales | 262 K | FP8 | Qwen Community 1.0 | HuggingFace |
| mradermacher/Qwen3.8-Flash-Next-Uncensored-GGUF | ~176,9 B totales | 262 K | Múltiples (BF16, etc.) | Apache 2.0 (según etiqueta) | HuggingFace |

La comparativa se limita a aspectos técnicos, ya que no hay datos de rendimiento publicados. La versión de mradermacher parece ofrecer más opciones de cuantización y una licencia Apache 2.0, aunque no se ha verificado su contenido.

## Limitaciones y advertencias

- Modelo *uncensored*: se han eliminado los rechazos de seguridad, por lo que puede generar contenido ofensivo, ilegal o peligroso. El uso debe ajustarse a las leyes y políticas de la plataforma.
- Cuantización IQ2_XXS: es una de las cuantizaciones más agresivas, lo que provoca una pérdida significativa de calidad en tareas complejas, mayor tasa de alucinaciones y degradación del razonamiento.
- Licencia Qwen Community License 1.0: puede imponer restricciones al uso comercial y a la redistribución. Es necesario revisar el texto completo de la licencia.
- Requiere una versión reciente de llama.cpp con soporte para la arquitectura `qwen4exp` (merge #27742). Versiones antiguas no podrán cargar el modelo.
- No se han publicado benchmarks oficiales, por lo que el rendimiento real en tareas específicas es incierto.
- El modelo base es multimodal, pero esta cuantización no garantiza que el soporte de visión funcione correctamente en todos los entornos de inferencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BattleGhost/Qwen3.8-Flash-Next-UNCENSORED-IQ2_XXS-GGUF
- Modelo base (dealignai): https://huggingface.co/dealignai/Qwen3.8-Flash-Next-UNCENSORED-FP8
- Versión BF16 GGUF: https://huggingface.co/BattleGhost/Qwen3.8-Flash-Next-UNCENSORED-BF16-GGUF
- Documentación de unsloth sobre Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Otra cuantización GGUF (mradermacher): https://huggingface.co/mradermacher/Qwen3.8-Flash-Next-Uncensored-GGUF
- Implementación de llama.cpp para qwen4exp: https://github.com/ggml-org/llama.cpp/pull/27742

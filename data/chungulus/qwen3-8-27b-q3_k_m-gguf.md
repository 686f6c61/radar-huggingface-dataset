# Chungulus/Qwen3.8-27B-Q3_K_M-GGUF

## Resumen

Chungulus/Qwen3.8-27B-Q3_K_M-GGUF es una cuantización GGUF en formato Q3_K_M del modelo Qwen3.8-27B, desarrollado por Alibaba Qwen. Se trata de una conversión "vanilla" sin fine-tuning, merge ni modificación del chat template, que preserva byte a byte los pesos del checkpoint oficial. El modelo base es un modelo de visión-lenguaje (image-text-to-text) de 27.320 millones de parámetros, con arquitectura híbrida que combina atención completa con capas Gated DeltaNet, un vision tower y un proyector multimodal, además de tensores MTP (multi-token prediction) retenidos.

Esta cuantización resulta relevante porque permite ejecutar un modelo de 27B con capacidades de visión, razonamiento configurable y tool calling en hardware de consumo, con un requisito de memoria aproximado de 18 GB. El repositorio incluye el archivo principal de pesos (13,5 GB) y el proyector de visión en F16, y ha sido validado por el autor en generación de texto, tool calling, visión y vídeo, así como en los controles de thinking del chat template. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (Gated DeltaNet + atencion completa) con vision tower y proyector multimodal, MTP |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (segun documentacion oficial de Qwen3.8; no verificado en esta cuantizacion) |
| Tipos de cuantizacion | Q3_K_M (este repo); el modelo base esta disponible en otras cuantizaciones GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que intercala capas de atención completa con capas basadas en Gated DeltaNet, una variante de state space model que reduce el coste computacional en contextos largos. Incluye además un vision tower y un proyector multimodal para procesar imágenes y vídeo, y retiene tensores MTP (multi-token prediction) que permiten aceleración especulativa, aunque el autor de esta cuantización no la anuncia como funcional. El checkpoint oficial se identifica internamente como `Qwen3_5ForConditionalGeneration`, pero no corresponde a un modelo Qwen3.5.

Esta cuantización es una conversión directa a GGUF mediante llama.cpp (revisión `5f754ea0e2fd21e1213db7ebebfd65d938d9d69c`), sin calibración para K-quants y con prompts locales representativos donde IQ lo requería. No se ha realizado ningún entrenamiento adicional ni ajuste de alineación. El autor ha validado la integridad de los pesos mediante SHA-256 y ha confirmado que la generación de texto, el tool calling nativo, la visión y los controles de thinking se conservan respecto al modelo original.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable mediante los parámetros `enable_thinking`, `reasoning_effort` y `preserve_thinking` del chat template.
- Comprensión de imágenes y vídeo a través del vision tower y el proyector multimodal (validado con tres casos de imagen local).
- Tool calling / function calling en formato nativo de Qwen (validado en cinco casos).
- Soporte de agentes y razonamiento multi-paso gracias al contexto largo de 262K tokens y al modo de razonamiento configurable.
- Capacidades multilingües no especificadas en la documentación de esta cuantización, aunque el modelo base de Qwen suele ser multilingüe.
- Retención de tensores MTP para posible aceleración especulativa, aunque no se anuncia como soportada en esta versión.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens) y tool calling para consultar bases de datos o sistemas de ticketing, manteniendo el historial completo de la interacción.
- Análisis de imágenes y documentos escaneados: gracias al vision tower, puede extraer información de capturas, diagramas o formularios, y combinarla con razonamiento textual para generar informes estructurados.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para revisar pull requests, generar tests o autocompletar funciones, con la ventaja de ejecutarse localmente sin enviar código a servicios externos.
- Asistentes de investigación con contexto largo: puede resumir y razonar sobre corpus extensos (artículos, documentación técnica) gracias a su ventana de 262K tokens, manteniendo coherencia en tareas de síntesis multi-documento.
- Agentes autónomos de navegación web o API: el modo de razonamiento configurable y el tool calling permiten construir agentes que planifican y ejecutan acciones paso a paso, por ejemplo para automatizar tareas de scraping o integración entre servicios.
- Despliegue en hardware de consumo: con ~18 GB de memoria, puede ejecutarse en una GPU consumer de 24 GB (RTX 3090/4090) o en sistemas con RAM unificada (AMD Ryzen AI Max), habilitando asistentes locales de visión-lenguaje sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que esta cuantización no reclama una nueva ejecución de benchmarks y que los artefactos son byte-idénticos a los de una release combinada previamente validada. El único dato de rendimiento disponible es una prueba de humo que registró 16,53 tokens/s en el host de validación, sin especificar el hardware utilizado.

## Requisitos de hardware

- Memoria estimada: aproximadamente 18 GB para el modelo, el proyector de visión y overhead de runtime; la caché KV crece con el contexto.
- GPU recomendadas: tarjetas con 24 GB de VRAM (RTX 3090, RTX 4090) o superiores (A100, H100) para ejecución cómoda; también compatible con AMD Radeon y APUs Ryzen AI Max según la documentación de AMD.
- Cabe en GPU consumer de 24 GB con la cuantización Q3_K_M; para GPUs de 16 GB o menos sería necesario usar cuantizaciones más agresivas (Q2_K, IQ2) o reducir el contexto.
- Opciones de despliegue: llama.cpp (recomendado por el autor, con `llama-mtmd-cli`), Ollama, LM Studio, vLLM y Unsloth (según la documentación de Unsloth y yottalabs).
- Latencia: 16,53 tokens/s medidos en el host de validación del autor; el rendimiento real depende del hardware y del tamaño de contexto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar con otros modelos de la misma categoría. A continuación se comparan las características principales de esta cuantización con el modelo base y con un modelo anterior de Qwen de tamaño similar, basándose en información pública:

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Si | Apache-2.0 | safetensors |
| Qwen3.8-27B Q3_K_M (este repo) | 27B | 262K (no verificado) | Si | Apache-2.0 | GGUF |
| Qwen2.5-VL-27B (anterior) | 27B | 128K | Si | Apache-2.0 | safetensors/GGUF |

La cuantización Q3_K_M reduce la calidad respecto al modelo base, especialmente en tareas de razonamiento complejo, pero permite ejecutar el modelo en hardware más modesto. No se dispone de datos objetivos de rendimiento comparado.

## Limitaciones y advertencias

- La cuantización Q3_K_M puede degradar la calidad de salida, particularmente en tareas de razonamiento matemático o lógico de varios pasos.
- La longitud de contexto máxima (262K tokens) no ha sido verificada en esta cuantización; la validación más larga registrada fue de 73 tokens de prompt.
- El runtime debe soportar la arquitectura híbrida de Qwen3.8 (Gated DeltaNet + atención), el vision tower, el tokenizer y los metadatos MTP; no basta con cargar únicamente el tensor de lenguaje.
- La aceleración especulativa mediante MTP no está anunciada como funcional en esta versión, aunque los tensores se conservan.
- No se han publicado resultados de benchmarks para esta cuantización, por lo que no se puede evaluar su rendimiento relativo con datos objetivos.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución del modelo base.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/Chungulus/Qwen3.8-27B-Q3_K_M-GGUF
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio combinado con la misma validación: https://huggingface.co/Chungulus/Qwen3.8-27B-GGUF/tree/f519a212d6c15cd3292b6ca835dd8ebf235642c0
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guía de yottalabs para ejecutar Qwen3.8-27B localmente: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Página de LM Studio para Qwen3.8: https://lmstudio.ai/models/qwen3.8
- Blog de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html

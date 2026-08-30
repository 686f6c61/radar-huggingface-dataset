# just1moremodel/Qwen3.8-27B-Uncensored-MXFP4-awq

## Resumen

El modelo `just1moremodel/Qwen3.8-27B-Uncensored-MXFP4-awq` es una cuantización MXFP4 del fine-tune uncensored y abliterated `orcarouter/Qwen3.8-27B-Uncensored`, a su vez derivado del modelo base `Qwen/Qwen3.8-27B`. El autor, `just1moremodel`, ha utilizado la herramienta de cuantización AMD Quark para exportar el checkpoint en un formato compatible con AWQ, pensado para servir con vLLM sobre GPUs AMD RDNA4 (gfx1201 / serie RX 9000) con ROCm. El objetivo principal es reducir el consumo de VRAM y permitir la inferencia local en hardware de consumo, manteniendo las capacidades del modelo original.

El modelo base es un transformer denso de 27B parámetros (aunque el checkpoint cuantizado contiene 15.606.149.872 parámetros, ya que la cuantización excluye la torre de visión y la capa `lm_head`), con arquitectura híbrida de atención (Gated DeltaNet lineal + atención completa), soporte multimodal, control de pensamiento, tool calling y cabeza MTP (Multi-Token Prediction). La cuantización MXFP4 es agresiva (4 bits) y afecta a la mayoría de los pesos, excepto la torre de visión y `lm_head` que se mantienen en mayor precisión. La ventana de contexto es de 262.144 tokens (256K).

Este modelo es relevante para desarrolladores e investigadores que necesitan un modelo sin filtros de rechazo (refusal behavior) para tareas creativas o de investigación, ejecutable en GPUs de 24 GB o más. Su licencia Apache-2.0 permite uso comercial, aunque el autor advierte que no está probado para producción ni para casos de seguridad crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-27B (Qwen3_5ForConditionalGeneration), transformer denso con atención híbrida (Gated DeltaNet lineal + atención completa), visión nativa |
| Parametros totales | 15.606.149.872 (según safetensors; el modelo base declara 27B, pero la cuantización excluye visión y lm_head) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MXFP4 (exportado como checkpoint estilo AWQ, `quant_method: quark`), KV cache con cuantización post-RoPE |
| Idiomas soportados | Inglés (según metadatos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (un único archivo `model.safetensors`, ~19 GB), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un transformer denso de 27B parámetros con una arquitectura híbrida de atención: combina capas de atención lineal Gated DeltaNet con capas de atención completa (full attention), lo que permite manejar contextos largos de forma eficiente. Incluye una torre de visión nativa (image-text-to-text), control de pensamiento (thinking mode), tool calling y una cabeza MTP (Multi-Token Prediction) para acelerar la decodificación. El fine-tune `orcarouter/Qwen3.8-27B-Uncensored` aplica una técnica de abliteración (abliteration) que elimina los comportamientos de rechazo del modelo original, resultando en un modelo "uncensored" que no se niega a responder a peticiones que el modelo base rechazaría.

Sobre este fine-tune, `just1moremodel` aplicó una cuantización MXFP4 utilizando AMD Quark. La cuantización se realiza sobre la mayoría de los pesos del transformer, excluyendo la torre de visión y la capa `lm_head`, que se mantienen en mayor precisión (probablemente bf16). El checkpoint resultante se exporta en formato AWQ para ser servido con vLLM en GPUs AMD RDNA4 con ROCm. La cuantización MXFP4 es agresiva (4 bits) y el autor advierte de una posible pérdida de calidad frente a bf16 o fp8.

## Capacidades

- Generación de texto conversacional y de larga forma, con control de pensamiento (thinking mode) para razonamiento paso a paso.
- Razonamiento complejo, matemáticas y generación de código, heredadas del modelo base Qwen3.8-27B.
- Soporte multimodal: la torre de visión está presente (aunque excluida de la cuantización), permitiendo entrada de imágenes además de texto.
- Tool calling / function calling, útil para integración con APIs y agentes.
- Capacidades de agente y razonamiento multi-paso, gracias al control de pensamiento y la cabeza MTP.
- Comportamiento uncensored/abliterated: no muestra rechazo ante peticiones que el modelo base podría rechazar (con las advertencias correspondientes).
- Multilingüe limitado: aunque el modelo base soporta varios idiomas, los metadatos indican solo inglés; la calidad en otros idiomas no está garantizada.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar narrativa, diálogos y contenido literario sin los filtros de seguridad habituales, ideal para autores que necesitan explorar temas sensibles o controvertidos en un entorno de investigación.
- Investigación sobre alineación y seguridad de modelos: permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, comparando con versiones alineadas para analizar sesgos y riesgos.
- Generación de código en entornos de desarrollo locales: con soporte de tool calling y contexto de 256K, puede integrarse en pipelines de CI/CD para autocompletar código, generar tests o documentar, sin depender de servicios en la nube.
- Asistente de razonamiento para análisis de documentos largos: su ventana de 262.144 tokens permite procesar libros técnicos, informes extensos o bases de código completas, manteniendo el contexto en una sola pasada.
- Chatbot de atención al cliente con personalidad sin filtros: para empresas que desean un tono más libre y menos cauteloso en interacciones automatizadas, aunque requiere supervisión humana por los riesgos de contenido inapropiado.
- Prototipado de agentes autónomos: la combinación de tool calling, razonamiento multi-paso y visión permite construir agentes que navegan por APIs, interpretan imágenes y ejecutan tareas complejas en un entorno local con GPU de consumo.
- Inferencia en hardware AMD RDNA4: está específicamente optimizado para GPUs RX 9000 con ROCm, permitiendo a usuarios de AMD ejecutar un modelo de 27B sin necesidad de hardware NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) para esta cuantización específica. Se espera una degradación de calidad respecto al modelo base en bf16 o fp8 debido a la agresividad de MXFP4, pero no hay datos cuantitativos para confirmarlo.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa ~19 GB en MXFP4, por lo que se necesita al menos 20-24 GB de VRAM para inferencia con contexto corto. Con contexto largo (256K), el uso de memoria crece significativamente por la KV cache cuantizada, por lo que 24 GB puede ser insuficiente; se recomienda 32 GB o más.
- GPU recomendadas: AMD RDNA4 (gfx1201, serie RX 9000) con ROCm es el objetivo principal. También puede ejecutarse en GPUs NVIDIA con soporte vLLM para MXFP4, aunque no está explícitamente documentado.
- Cabe en GPUs de consumo: sí, en tarjetas con 24 GB de VRAM (RTX 3090/4090, RX 7900 XTX) si se usa offloading o contexto reducido. La model card indica "sized to fit consumer GPUs with 24 GB+ VRAM".
- Opciones de despliegue: vLLM (requiere build con soporte Quark/MXFP4), llama.cpp (si se convierte a GGUF), Ollama (mediante conversión). El formato AWQ es compatible con vLLM.
- Latencia y throughput: no disponible. La cuantización MXFP4 reduce el tamaño de los pesos, lo que debería acelerar la inferencia frente a bf16, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262.144 | bf16/fp8 | Apache-2.0 | HuggingFace |
| orcarouter/Qwen3.8-27B-Uncensored | 27B | 262.144 | bf16 (original) | Apache-2.0 | HuggingFace |
| just1moremodel/Qwen3.8-27B-Uncensored-MXFP4-awq | 15.6B (checkpoint) | 262.144 | MXFP4 (4-bit) | Apache-2.0 | HuggingFace |
| onurburak9/Qwen3.8-27B-Uncensored (MLX) | 27B | 262.144 | 2/4/6/8-bit MLX | Apache-2.0 | GitHub |
| DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF | 27B | 262.144 | GGUF (varios) | Apache-2.0 | HuggingFace |

La principal diferencia de este modelo frente a las alternativas es su formato específico para AMD RDNA4 con ROCm y la cuantización MXFP4, que no es común en otras versiones (GGUF, MLX, AWQ tradicional). El número de parámetros del checkpoint es menor porque excluye la torre de visión y `lm_head`, pero el modelo completo sigue siendo de 27B.

## Limitaciones y advertencias

- La cuantización MXFP4 es agresiva (4 bits) y puede provocar una pérdida notable de calidad en tareas complejas de razonamiento, generación de código o matemáticas en comparación con bf16 o fp8.
- Al ser un modelo uncensored/abliterated, puede generar contenido dañino, ofensivo, ilegal o inapropiado. El autor declara explícitamente que el usuario es responsable del uso y que no está probado para producción ni para casos de seguridad crítica.
- El soporte de idiomas está limitado al inglés según los metadatos; el rendimiento en otros idiomas no está garantizado y puede ser deficiente.
- La torre de visión está presente pero no cuantizada, lo que aumenta el tamaño del checkpoint y puede requerir más VRAM al procesar imágenes.
- Requiere una build específica de vLLM con soporte Quark/MXFP4 y ROCm; no funcionará en instalaciones estándar de vLLM sin compilación adicional.
- No se han publicado benchmarks, por lo que es difícil evaluar la degradación real de rendimiento frente a otras cuantizaciones.
- El número de descargas y likes es 0, lo que indica que es un modelo reciente y poco validado por la comunidad.

## Enlaces

- [HuggingFace: just1moremodel/Qwen3.8-27B-Uncensored-MXFP4-awq](https://huggingface.co/just1moremodel/Qwen3.8-27B-Uncensored-MXFP4-awq)
- [Modelo base: orcarouter/Qwen3.8-27B-Uncensored](https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored)
- [Modelo original: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [AMD Quark (herramienta de cuantización)](https://github.com/amd/Quark)
- [GitHub: Wassimyounes01/qwen38-uncensored](https://github.com/Wassimyounes01/qwen38-uncensored)
- [GitHub: onurburak9/Qwen3.8-27B-Uncensored (versión MLX)](https://github.com/onurburak9/Qwen3.8-27B-Uncensored)
- [Blog de orcarouter: cómo ejecutar Qwen 3.8 27B uncensored localmente](https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally)

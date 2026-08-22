# hotdogs/Qwen3.8-27B-abliterated-sme-preview-mtp-GGUF

## Resumen

El modelo `hotdogs/Qwen3.8-27B-abliterated-sme-preview-mtp-GGUF` es una cuantización GGUF del modelo base `hotdogs/Qwen3.8-27B-abliterated-sme-preview`, un asistente de negocio para pequeñas y medianas empresas (SME) desarrollado por el usuario «hotdogs». El modelo base es un fine-tuning con LoRA sobre el modelo híbrido de razonamiento `Qwen3.8-27B` abliterated (λ=1.2), entrenado con un dataset curado de análisis de documentos y tool-calling, orientado a resolver preguntas de negocio sobre datos tabulares y ofimáticos.

Esta variante GGUF convierte el modelo base a formato GGUF para su ejecución con llama.cpp, preservando la cabeza de predicción multi-token (MTP). La cuantización permite ejecutar el modelo en GPUs de consumo con una pérdida de precisión mínima (dentro de ±0.01 en benchmarks). El modelo hereda la arquitectura híbrida de atención lineal del Qwen3.8-27B, con 27.320 millones de parámetros, un contexto nativo de 262.144 tokens y soporte para tool calling y agentes.

La relevancia de esta versión radica en que combina un fine-tune específico para tareas empresariales con la eficiencia de ejecución de GGUF, permitiendo desplegar un asistente de negocio en entornos locales o con GPUs moderadas. La licencia Apache 2.0 facilita su uso comercial y su integración en pipelines de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (GDN) y atención completa parcial |
| Parametros totales | 27.320.697.856 (27.3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo del base) |
| Tipos de cuantizacion | Q4_K_M (~15 GB), IQ3_M (~12 GB), f16 (~55 GB) |
| Idiomas soportados | Inglés (en), Tailandés (th) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (f16 fuente, cuantizaciones Q4_K_M, IQ3_M) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B-abliterated-sme-preview` se construyó sobre el backbone híbrido del Qwen3.8-27B, que combina atención lineal y atención completa. De las 64 capas, solo 16 utilizan atención completa (con intervalo `full_attention_interval: 4`), mientras que las otras 48 emplean atención lineal con un estado recurrente constante, lo que reduce el coste computacional en contextos largos. El modelo incorpora además una cabeza MTP (multi-token prediction) de una capa adicional, que se conserva íntegra en esta versión GGUF.

El fine-tune se realizó con LoRA sobre un dataset de análisis de documentos y tool calling, diseñado para que el modelo razone sobre archivos CSV, hojas de cálculo y documentos ofimáticos, y llame herramientas correctamente. El proceso incluyó una fase de abliteration (λ=1.2) para eliminar ciertos comportamientos no deseados del base, aunque no se detalla el método exacto. La conversión a GGUF se hizo desde el modelo f16, con pérdida de precisión mínima aceptable para inferencia.

## Capacidades

- Generación de texto y razonamiento: responde preguntas de negocio complejas con razonamiento multi-paso.
- Tool calling / function calling: diseñado para llamar herramientas correctamente en tareas de análisis de documentos.
- Agentes: soporta flujos agénticos de largo horizonte gracias a la ventana de contexto de 262K tokens.
- Multilingüe: soporta inglés y tailandés (idiomas declarados en la model card).
- Análisis de documentos: procesa CSV, hojas de cálculo y documentos ofimáticos para extraer información y responder consultas.
- Multimodal: incluye un projector de visión opcional (`mmproj-Qwen3.8-27B-GGUF.gguf`), aunque el uso recomendado es solo texto con `apply_chat_template`.
- Predicción multi-token (MTP): cabeza MTP preservada, que puede acelerar la inferencia en llama.cpp.
- Configuración de razonamiento: hereda la capacidad del Qwen3.8 de configurar el modo de razonamiento (pensamiento visible o no).

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens) para mantener historial completo de interacciones, gracias a la atención lineal que reduce el coste de memoria.
- **Análisis de facturas y CSV**: dado un archivo CSV de gastos, puede identificar filas con condiciones específicas (p. ej., `department = Sales`) y extraer métricas agregadas, como muestra el ejemplo de la model card.
- **Generación de informes empresariales**: a partir de datos tabulares, genera resúmenes ejecutivos, análisis de tendencias y recomendaciones de negocio.
- **Automatización de tareas de back-office**: integrado en pipelines de CI/CD puede llamar herramientas (APIs, scripts) para realizar acciones como actualizar registros o enviar notificaciones.
- **Asistente de análisis de datos para no programadores**: permite a usuarios de negocio formular preguntas en lenguaje natural sobre hojas de cálculo sin necesidad de SQL.
- **Despliegue en entornos locales con privacidad**: al ser GGUF, se puede ejecutar en local con llama.cpp, manteniendo datos sensibles dentro de la organización.

## Benchmarks y rendimiento

Los resultados publicados son heredados del modelo base (no medidos sobre la cuantización GGUF). La model card indica que la conversión GGUF preserva estos valores dentro de ±0.01.

| Benchmark | Base (Qwen3.8-27B) | SME-Preview | Δ |
|---|---:|---:|---:|
| ARC-Challenge acc | 0.5667 | 0.5700 | +0.003 |
| MMLU | 0.8477 | 0.8449 | −0.003 |
| GSM8K (5-shot) | 0.6000 | 0.8100 | +0.210 |

No se han publicado resultados de benchmarks específicos para la versión GGUF en la información disponible.

## Requisitos de hardware

- **Q4_K_M (~15 GB)**: requiere al menos 16 GB de VRAM para inferencia completa; cabe en una RTX 4090 (24 GB) o RTX 4080 (16 GB) con offload parcial.
- **IQ3_M (~12 GB)**: cabe en una RTX 4080 (16 GB) o RTX 3080 Ti (12 GB) con offload total de capas.
- **f16 (~55 GB)**: requiere GPUs de servidor como A100 80 GB o H100 80 GB; no es adecuado para GPUs de consumo.
- **Despliegue**: llama.cpp (build con soporte `qwen35` y `linear-attention`), llama-cli, Ollama, y opcionalmente vLLM si se convierte a otro formato.
- **Latencia/throughput**: no disponible. La atención lineal en 48 de 64 capas reduce el coste de atención, lo que debería mejorar la velocidad en contextos largos respecto a modelos densos equivalentes, pero no hay mediciones publicadas.
- **Nota**: no usar `--no-mtp` en llama.cpp, ya que el modelo incluye tensores MTP que se perderían.

## Comparativa con modelos similares

La comparativa directa con otros modelos no está disponible en la información proporcionada. Se puede comparar con su propio base (sin fine-tune ni abliteration) y con el modelo original Qwen3.8-27B, cuyos datos parciales aparecen en la tabla de benchmarks. No se dispone de datos de otros modelos de 27B (como Llama 3.3 27B o Mistral Large) en esta documentación.

| Modelo | Parámetros | Contexto | Licencia | Fine-tune específico |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.3B | 262K | Apache 2.0 | No |
| Qwen3.8-27B-abliterated-sme-preview | 27.3B | 262K | Apache 2.0 | Sí (SME) |
| Qwen3.8-27B-abliterated-sme-preview-mtp-GGUF | 27.3B | 262K | Apache 2.0 | Sí (SME) + GGUF |

## Limitaciones y advertencias

- **Idiomas limitados**: solo soporta inglés y tailandés, lo que limita su uso en entornos multilingües amplios.
- **Riesgo de alucinación**: como todo LLM, puede generar respuestas incorrectas, especialmente en análisis de datos no estructurados; se recomienda verificación manual en decisiones críticas.
- **Abliteration**: el proceso de abliteration (λ=1.2) puede haber reducido ciertas capacidades del modelo original (p. ej., en seguridad o en tareas específicas), aunque no se detallan efectos concretos.
- **Multimodal opcional**: el projector multimodal está disponible pero no se recomienda para uso texto-only; si se usa, requiere configuración adicional.
- **MTP head**: la cabeza MTP debe preservarse; usar `--no-mtp` puede degradar el rendimiento o provocar errores.
- **Precisión BF16→f16**: la conversión de BF16 a f16 introduce una pérdida de precisión mínima, aceptable para inferencia, pero puede afectar a tareas de alta sensibilidad numérica.
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de licencia y las atribuciones del modelo base.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-sme-preview-mtp-GGUF)
- [Modelo base (SME-Preview)](https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-sme-preview)
- [README del modelo base](https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-sme-preview/blob/main/README.md)
- [Ficha de Qwen3.8-27B en vLLM Recipes](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
- [Entrada en LLM Explorer](https://llm-explorer.com/model/hotdogs%2FQwen3.8-27B-abliterated,3OshiP1Xtg7XK84wjMjHc)

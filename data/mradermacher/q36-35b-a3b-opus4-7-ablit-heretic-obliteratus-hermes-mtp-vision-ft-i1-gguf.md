# mradermacher/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-i1-GGUF

## Resumen

El modelo **Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-i1-GGUF** es una cuantización en formato GGUF realizada por el usuario de Hugging Face **mradermacher**, a partir de un modelo base creado por **oktayd** con el mismo nombre (sin el sufijo GGUF). Se trata de una variante de la familia **Qwen3.6-35B-A3B**, un modelo de arquitectura Mixture-of-Experts (MoE) con 35.5 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos por token. El nombre indica que ha sido sometido a un proceso de *abliteración* (eliminación de mecanismos de rechazo), fusionado con estilos como *Heretic* y *OBLITERATUS*, y ajustado con *Hermes* (fine-tuning conversacional) y *Vision-FT* (fine-tuning para tareas de visión). Además, incorpora la capa **MTP** (Multi-Token Prediction) para decodificación especulativa, lo que acelera la generación.

La relevancia de este modelo radica en su combinación de eficiencia (solo 3B activos) con capacidades multimodales (visión) y un contexto ampliado hasta 1 millón de tokens, según la información disponible en la búsqueda web. Al estar disponible en formato GGUF, puede ejecutarse en hardware de consumo mediante herramientas como llama.cpp u Ollama, lo que lo hace accesible para desarrolladores e investigadores que necesitan un modelo potente sin requerir GPUs de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3.6 |
| Parametros totales | 35.505.251.456 (35.5B) |
| Parametros activos | ~3B (según nombre y búsqueda web) |
| Longitud de contexto | 1.000.000 tokens (según búsqueda web) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (con cuantizaciones múltiples) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 35.5B parámetros totales y 3B activos, siguiendo el diseño de Qwen3.6. La arquitectura incluye una capa de **Multi-Token Prediction (MTP)** que permite decodificación especulativa, acelerando la generación hasta 1.5x según la búsqueda web. El fine-tuning incluye un proceso de *abliteración* (eliminación de refusal) y ajustes con datasets de estilo *Hermes* (conversacional) y *Vision-FT* (para entrada de imágenes). No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas como RLHF o DPO. La cuantización GGUF fue realizada por mradermacher con la herramienta *imatrix* (importance matrix) para optimizar la calidad de los quantizados.

## Capacidades

- **Generación de texto y razonamiento**: al ser una variante de Qwen3.6, mantiene capacidades de razonamiento complejo y generación de texto coherente.
- **Visión**: el sufijo *Vision-FT* indica que ha sido ajustado para tareas de visión, por lo que puede procesar imágenes como entrada (aunque no se especifica el detalle).
- **Tool calling / function calling**: probablemente soportado, dado que Qwen3.6 incluye esta capacidad, aunque no se confirma explícitamente.
- **Agentes y multi-step reasoning**: la arquitectura MoE con 3B activos permite un razonamiento eficiente, y el contexto de 1M tokens facilita tareas de agente con historial largo.
- **Multilingüe**: no se especifican idiomas, pero Qwen3.6 suele ser multilingüe; sin embargo, no hay confirmación.
- **Decodificación especulativa**: gracias a la capa MTP, la generación es más rápida en comparación con modelos sin esta característica.

## Casos de uso

- **Asistentes conversacionales locales**: al estar cuantizado en GGUF, puede ejecutarse en una GPU de consumo (por ejemplo, RTX 3090 o 4090) con Ollama o llama.cpp, ofreciendo un asistente con razonamiento y sin censura (debido a la abliteración).
- **Análisis de documentos largos**: con 1M tokens de contexto, puede procesar libros completos, informes extensos o conversaciones de soporte de larga duración sin perder el hilo.
- **Generación de código asistida**: aunque no se confirma tool calling, la base Qwen3.6 es competente en código; el modelo puede usarse en entornos de desarrollo con autocompletado o generación de funciones.
- **Aplicaciones de visión por computadora**: gracias al fine-tuning de visión, puede describir imágenes, responder preguntas sobre contenido visual o extraer información de capturas.
- **Investigación en alineación y seguridad**: al ser una versión abliterada, es útil para estudiar el comportamiento de modelos sin restricciones de refusal, aunque con precaución.
- **Prototipado rápido en entornos con recursos limitados**: al tener solo 3B activos, la inferencia es rápida incluso en CPUs con cuantización Q4, permitiendo pruebas sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web muestra una métrica de rendimiento para una variante similar (Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-hermes-oQ4-fp16-mtp) en un M2 Ultra: 1,913 tokens/s de prefill y 78.3 tokens/s de generación, pero no corresponde exactamente a este modelo. No se dispone de datos de MMLU, HumanEval, GSM8K u otros para esta versión específica.

## Requisitos de hardware

- **VRAM estimada**: para una cuantización Q4_K_M (típica), el modelo ocupa aproximadamente 20-22 GB, por lo que cabe en GPUs con 24 GB (RTX 3090, RTX 4090) o en configuraciones de doble GPU con 12 GB cada una.
- **GPU recomendadas**: RTX 3090/4090 (24 GB), A100 (40/80 GB) para mayor velocidad, o GPUs de datacenter como H100.
- **CPU**: con cuantizaciones Q2 o Q3, puede ejecutarse en CPU con 32 GB de RAM, aunque la velocidad será baja.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), TGI (si se convierte a safetensors).
- **Latencia y throughput**: no se dispone de datos específicos para este modelo, pero la decodificación especulativa (MTP) debería mejorar la velocidad de generación en comparación con modelos sin ella.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Q36-35B-A3B (este) | 35.5B total, 3B activo | 1M (según web) | No disponible | GGUF | Abliterado, visión, MTP |
| Qwen3.5-32B-A3B (hipotético) | 32B total, 3B activo | 128K | Apache 2.0 | Safetensors | Modelo base sin abliteración |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | Safetensors/GGUF | Menor capacidad, más ligero |

No se dispone de datos de rendimiento comparativo. La comparativa se basa en características generales, no en benchmarks.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo abliterado, puede generar contenido inapropiado o no deseado; no se recomienda su uso en producción sin filtros adicionales.
- **Riesgo de alucinación**: como todo LLM, puede inventar información, especialmente en tareas de razonamiento complejo.
- **Limitaciones de idioma**: no se especifican idiomas soportados; probablemente el modelo base es multilingüe, pero no hay confirmación.
- **Restricciones de licencia**: la licencia no está disponible, lo que impide conocer si se permite uso comercial. Se recomienda contactar al autor antes de usar en proyectos comerciales.
- **Caveat de producción**: al ser una cuantización de un modelo de terceros, la calidad puede variar respecto al original; se recomienda evaluar en el caso de uso específico.

## Enlaces

- [Modelo GGUF en Hugging Face](https://huggingface.co/mradermacher/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-i1-GGUF)
- [Modelo base (oktayd)](https://huggingface.co/oktayd/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT)
- [Perfil de mradermacher en Hugging Face](https://huggingface.co/mradermacher/models)
- [Búsqueda de Qwen3.6-35B-A3B en Ollama](https://ollama.com/search?q=qwen3.6-35b-a3b)
- [Benchmark de variante similar en omlx.ai](https://omlx.ai/benchmarks/performance/fzbi3jfi)

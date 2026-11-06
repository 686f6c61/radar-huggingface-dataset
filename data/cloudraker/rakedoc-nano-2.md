# cloudraker/rakedoc-nano-2

## Resumen

rakedoc-nano-2 es un modelo de 1.156.026.624 parámetros (aproximadamente 1,2B) especializado en parsing de documentos, desarrollado por CloudRaker sobre la arquitectura Qwen2-VL. Es un fine-tune de KDLAI/KDL-Frontier-Parser-nano-v2 (KoreaDeep), del que hereda la licencia AGPL-3.0, y está orientado a tareas de OCR, extracción de tablas, extracción de gráficos y conversión de documentos a Markdown estructurado. El modelo alimenta el pipeline de parsing documental de la API Paperwork de CloudRaker.

La relevancia del modelo radica en su enfoque de entrenamiento: en lugar de un fine-tune convencional, es una media ponderada de pesos (0,7 × A + 0,3 × B) de dos fine-tunes independientes sobre KDL v2, uno centrado en formato de texto (negrita, cursiva, subrayado, superíndice) y otro en extracción de gráficos. Ambos se entrenaron con GRPO (Group Relative Policy Optimization) sobre LoRA en las torres de lenguaje y visión, con anclas NLL para preservar el rendimiento en las etapas no objetivo.

Con una ventana de contexto de 8192 tokens en la configuración de servicio recomendada y pesos en bf16 fusionados (sin adaptador separado), el modelo se posiciona como una alternativa ligera y desplegable en una sola GPU para pipelines de document AI en producción, con un rendimiento en ParseBench ligeramente superior al de su modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL (transformer multimodal vision-language) |
| Parametros totales | 1.156.026.624 (~1,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuracion de servicio recomendada con vLLM) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (bf16, pesos fusionados) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen2-VL, un transformer multimodal que procesa pares imagen-texto. La entrada visual se codifica mediante la torre de visión de Qwen2-VL y se combina con las instrucciones textuales para generar Markdown estructurado. El modelo base, KDL-Frontier-Parser-nano-v2, define los prompts y formatos de salida: `"\nLayout Detection:\n"`, `"\nText Recognition:\n"` y `"\nTable Recognition:\n"` (con salida en formato OTSL para tablas).

El entrenamiento de rakedoc-nano-2 consiste en una media ponderada de dos fine-tunes sobre KDL v2. El componente A (peso 0,7) se entrenó con GRPO sobre la etapa de reconocimiento de texto, con LoRA en lenguaje y visión, 150 pasos y LR 3e-5; la recompensa evalúa las marcas de formato (negrita, cursiva, subrayado, tachado, superíndice) contra la verdad de referencia, con penalización por marcas ausentes en el ground truth y por texto incorrecto, usando recortes sintéticos de texto con estilos. El componente B (peso 0,3) se entrenó con un warm start SFT sobre gráficos de informes sintéticos (nuevos tipos de gráfico) y después GRPO sobre la etapa de gráficos, con LoRA en lenguaje y visión, 100 pasos y LR 5e-5, usando gráficos sintéticos y ChartQA; se aplicó un ancla NLL del 50% de respuestas de layout para evitar que la respuesta de layout se truncara en páginas densas (verificado sobre páginas de DocLayNet). Ambos componentes incorporan anclas NLL sobre las demás etapas para mantener la estabilidad. No se usaron documentos de ParseBench para entrenamiento ni para selección de modelo durante el entrenamiento; solo para elegir entre candidatos finalizados.

## Capacidades

- Parsing de documentos completo: detección de layout, reconocimiento de texto y reconocimiento de tablas en una sola pasada multimodal.
- OCR con preservación de formato: emite marcas de negrita, cursiva, subrayado, tachado y superíndice (no emite `<mark>`).
- Extracción de tablas en formato OTSL (Optical Table Structure Language).
- Extracción de gráficos, incluyendo tipos de gráfico de informes no vistos en el modelo base.
- Conversión de documentos a Markdown estructurado con fidelidad de contenido y formato semántico.
- Procesamiento de imagen y texto conjuntamente (pipeline image-text-to-text).
- Compatible con Text Generation Inference (TGI) y endpoints compatibles.
- Soporte de conversación multi-turno (tag `conversational`).
- Capacidades multilingües: no disponibles (no especificadas en la información).

## Casos de uso

- Digitalización de facturas y albaranes: el modelo detecta el layout, extrae el texto con formato y convierte las tablas de líneas de detalle a OTSL, lo que permite alimentar sistemas de contabilidad con datos estructurados a partir de imágenes o PDFs escaneados.
- Extracción de tablas de informes financieros: gracias a su puntuación de 85,86 en la categoría Tables de ParseBench, es adecuado para pipelines que necesitan convertir tablas complejas de informes anuales o balances en Markdown estructurado.
- Procesamiento de gráficos en informes corporativos: con 71,73 en Charts (el mejor de su comparativa), puede extraer series de datos y etiquetas de gráficos de barras, líneas y otros tipos presentes en informes, reduciendo la revisión manual.
- Enriquecimiento de bases documentales (RAG): la conversión a Markdown con formato semántico (79,99 en Semantic Formatting) facilita la indexación y recuperación de fragmentos con estructura preservada en sistemas de búsqueda aumentada.
- Automatización de back-office en seguros o banca: el modelo puede procesar pólizas, siniestros y extractos con tablas y texto estilizado, integrándose vía API compatible con OpenAI a través de vLLM para sustituir directamente a KDL-Frontier-Parser-nano-v2.
- Pipeline de accesibilidad documental: la preservación de marcas de formato (negrita, superíndice, etc.) permite generar versiones Markdown accesibles de documentos escaneados con estructura de énfasis y notación científica.
- Procesamiento por lotes en una sola GPU: con 1,2B parámetros y despliegue en vLLM con `--max-num-seqs 24`, es viable para lotes moderados de documentos en hardware de gama media-alta sin necesidad de clústeres.

## Benchmarks y rendimiento

Resultados en ParseBench `main` (commit `a5eeca8`), pipeline `rakedoc_nano`, GPU única, normalización LLM desactivada. Media de 3 ejecuciones completas para rakedoc-nano-2.

| Modelo | Overall | Tables | Charts | Content Faithfulness | Semantic Formatting | Visual Grounding |
|---|---|---|---|---|---|---|
| rakedoc-nano-2 (media de 3) | 80,09 | 85,86 | 71,73 | 87,80 | 79,99 | 75,07 |
| KDL-Frontier-Parser-nano-v2, mismo harness, pipeline `rakedoc_nano` (media de 2) | 79,74 | 86,01 | 70,26 | 87,59 | 79,60 | 75,22 |
| KDL-Frontier-Parser-nano-v2, mismo harness, pipeline `kdl_frontier_nano_v2` (1 ejecución) | 79,06 | 85,96 | 69,46 | 87,62 | 76,94 | 75,34 |

Resultados por ejecución de rakedoc-nano-2 (Overall): 80,15 / 80,02 / 80,11. El pipeline `rakedoc_nano` aporta aproximadamente +0,7 Overall sobre KDL v2; los pesos aportan aproximadamente +0,35 Overall, para un total de +1,0 frente a la fila publicada de KDL v2 (79,07).

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (~2,3 GB de repositorio), la inferencia requiere aproximadamente 4-6 GB de VRAM incluyendo caché KV para contexto de 8192 tokens; no se dispone de cifras oficiales de VRAM para cuantizaciones.
- GPU recomendadas: el autor indica servicio en GPU única con vLLM; por tamaño, cabe en RTX 4090, RTX 3090, A10, L4 y A100/H100. No se especifican modelos concretos en la documentación.
- Cabe en GPU de consumo: sí, por el tamaño de 1,2B parámetros y pesos bf16 de ~2,3 GB; una GPU consumer con 8 GB o más es suficiente para contexto moderado.
- Opciones de despliegue: vLLM (comando oficial con `--trust-remote-code`, `--max-model-len 8192`, `--gpu-memory-utilization 0.85`, `--max-num-seqs 24`, `--limit-mm-per-prompt '{"image":1}'`); compatible con Text Generation Inference (TGI) y endpoints compatibles; al ser transformers, también es desplegable con la librería transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Overall ParseBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rakedoc-nano-2 | ~1,2B | 8192 | 80,09 | AGPL-3.0 | HuggingFace, pesos safetensors bf16 |
| KDL-Frontier-Parser-nano-v2 | ~1,2B (no confirmado) | no disponible | 79,74 (pipeline rakedoc_nano) / 79,06 (pipeline propio) | AGPL-3.0 | HuggingFace |
| KDL-Frontier-Parser-nano (v1) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

La comparativa directa con otros parsers documentales de tamaño similar (por ejemplo, variantes de Qwen2-VL fine-tuneadas para OCR) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Tablas 0,15 puntos por debajo de KDL v2 (85,86 frente a 86,01) y grounding visual 0,15 puntos por debajo (75,07 frente a 75,22).
- La etiqueta de resaltado (`<mark>`) nunca se emite.
- Evaluación limitada a ParseBench y datos sintéticos; otros dominios no han sido probados, por lo que el rendimiento fuera de documentos de informe puede degradarse.
- Licencia AGPL-3.0: uso comercial permitido bajo obligaciones copyleft fuertes; si se ofrece como servicio en red, debe publicarse el código fuente modificado. Verificar compatibilidad con el producto antes de integrar.
- Riesgo de alucinación en texto reconocido y en valores de tablas/gráficos no verificado más allá de las métricas de fidelidad de contenido (87,80), que no eliminan errores puntuales.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe más allá de la del modelo base.
- El modelo depende de los prompts y formatos de salida específicos de KDL v2 (`\nLayout Detection:\n`, `\nText Recognition:\n`, `\nTable Recognition:\n`); usos fuera de ese contrato pueden dar resultados degradados.
- Requiere `--trust-remote-code` en vLLM, lo que implica ejecutar código del repositorio; auditar antes en entornos de producción.
- Sin descargas ni likes en el momento de la ficha (0 descargas, 0 likes), lo que limita la evidencia de uso comunitario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cloudraker/rakedoc-nano-2
- Modelo base: https://huggingface.co/KDLAI/KDL-Frontier-Parser-nano-v2
- Modelo predecesor (v1, no relacionado directamente): https://huggingface.co/cloudraker/rakedoc-nano
- Dataset de fine-tuning (parcial): https://github.com/CloudRaker/cloudraker-synthdocs
- API Paperwork de CloudRaker: https://cloudraker.com
- ParseBench: no disponible (no se proporciona URL en la información)

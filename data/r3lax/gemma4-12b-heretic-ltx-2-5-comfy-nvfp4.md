# r3lax/gemma4-12b-heretic-ltx-2.5-comfy-nvfp4

## Resumen

El modelo `r3lax/gemma4-12b-heretic-ltx-2.5-comfy-nvfp4` es un text encoder cuantizado a NVFP4 (FP4 E2M1) diseñado específicamente para el pipeline de generación de vídeo LTX-2.5 en ComfyUI. Se trata de una versión comprimida del checkpoint `DeepNeuralNerd/Gemma-4-12B-it-uncensored-heretic-DeepNeuralNerd-LTX_2.5_ComfyUI`, que a su vez deriva de la familia "heretic" (abliterada) sobre el modelo base `google/gemma-4-12B-it`. El autor, r3lax, ha aplicado una cuantización mixta: las capas lineales del decoder Gemma se almacenan en NVFP4 con escalado por bloques, mientras que embeddings, normalizaciones y proyecciones multimodales permanecen en BF16. El resultado es un archivo de 9,87 GB frente a los 24,46 GB del original, una reducción de aproximadamente el 60 %.

Este modelo resuelve el problema del alto consumo de memoria del text encoder de LTX-2.5, que en su versión completa requiere más de 24 GB solo para los pesos. Al cuantizar a NVFP4, permite ejecutar el pipeline completo en GPUs con menos VRAM, especialmente en hardware Blackwell donde el matmul nativo FP4 ofrece además una ventaja de velocidad. Es un drop-in replacement: se coloca en `ComfyUI/models/text_encoders/` y se selecciona en el cargador de text encoder Gemma del flujo LTX-2.5 sin necesidad de nodos adicionales. La cuantización se realizó con la herramienta `convert-to-quant` v1.3.4 en modo `--simple` (redondeo directo, sin optimización por aprendizaje), por lo que no hay pérdida de calidad significativa en la representación de los pesos, aunque tampoco se ha reentrenado el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 4 12B) con 48 capas, 8 capas de atención global |
| Parametros totales | 12 mil millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1, bloque de 16) para 328 matrices lineales; BF16 para el resto |
| Idiomas soportados | no disponible (el modelo base Gemma 4 es multilingüe, pero no se especifica en esta variante) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato comfy-quants NVFP4, con metadatos JSON embebidos) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-12B-it`, un transformer decoder de 12 mil millones de parámetros con 48 capas. Ocho de esas capas (índices 5, 11, 17, 23, 29, 35, 41 y 47) son de atención global y reutilizan la proyección K como V, por lo que no tienen `v_proj` separado; de ahí que solo haya 40 matrices `v_proj` cuantizadas en lugar de 48. Sobre este modelo se aplicó la técnica de "abliteración" (eliminación de direcciones internas de rechazo) para producir la variante "heretic" con comportamiento menos censurado, y posteriormente DeepNeuralNerd adaptó los pesos al pipeline LTX-2.5 mediante un remapeo de nombres (por ejemplo, `model.language_model.*` → `model.*`, `model.vision_embedder.*` → `vision_model.*`).

La cuantización a NVFP4 se realizó con `convert-to-quant` v1.3.4 en modo `--simple` (redondeo directo, sin pasos de optimización como learned-rounding o SVD). El proceso se ejecutó en tres fragmentos del decoder para no exceder la memoria RAM, y luego se fusionaron con la parte BF16 intacta. No hubo reentrenamiento ni fine-tuning; solo se comprimieron los pesos. El checkpoint incluye el tokenizer embebido (`tokenizer_json`) y los activos de HuggingFace necesarios para cargar el modelo en ComfyUI.

## Capacidades

- Text encoder para el pipeline LTX-2.5: procesa instrucciones de texto, condiciones de visión y audio (any-to-any) para guiar la generación de vídeo.
- Integración nativa con ComfyUI: se carga como text encoder estándar en `models/text_encoders/` y funciona como reemplazo directo del Gemma 4 12B original en flujos LTX-2.5.
- Cuantización NVFP4 con escalado por bloques (tamaño de bloque 16) y escalado por tensor adicional, lo que permite una compresión eficiente manteniendo la precisión en capas críticas.
- Compatibilidad con hardware Blackwell (SM ≥ 10.0) para matmul FP4 nativo; en GPUs más antiguas (Ampere, Ada) ComfyUI descomprime automáticamente los pesos y produce resultados idénticos, aunque sin la ventaja de velocidad.
- Soporte de tokenizer embebido: no requiere archivos externos de tokenización.
- Capacidad de procesamiento multimodal: el modelo base incluye un proyector de visión y un proyector de audio, que se conservan en BF16.

## Casos de uso

- Generación de vídeo con LTX-2.5 en ComfyUI: el modelo se usa como text encoder para convertir prompts de texto en condiciones de generación. Su menor tamaño permite ejecutar el pipeline completo en GPUs con 12-16 GB de VRAM, algo inviable con el checkpoint original de 24 GB.
- Edición de vídeo guiada por texto: al mantener las proyecciones de visión y audio, el modelo puede procesar condiciones multimodales para tareas de edición basadas en referencias visuales o de audio.
- Despliegue en entornos con memoria limitada: la cuantización NVFP4 reduce el footprint de memoria a menos de 10 GB, lo que facilita la ejecución en estaciones de trabajo con una sola GPU de gama media.
- Investigación sobre cuantización de text encoders: el checkpoint sirve como ejemplo práctico de cuantización mixta FP4/BF16 aplicada a un modelo multimodal, con metadatos detallados del proceso (formato, grupo, dtype original).
- Prototipado rápido de flujos de vídeo generativo: al ser un drop-in replacement, los desarrolladores pueden intercambiar el text encoder sin modificar el resto del grafo de ComfyUI, acelerando la experimentación.
- Evaluación de modelos abliterados en pipelines de generación: al derivar de la familia "heretic", permite estudiar el impacto de la eliminación de rechazo en la calidad de las condiciones de texto para vídeo, en un contexto de investigación controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de generación, comparativas de velocidad o evaluaciones de fidelidad del text encoder. Tampoco se proporcionan datos de throughput o latencia en diferentes GPUs.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de pesos ocupa 9,87 GB, por lo que se recomienda al menos 12 GB de VRAM para cargar el modelo junto con el resto del pipeline LTX-2.5. En GPUs con menos memoria, puede ser necesario usar offloading de CPU.
- GPU recomendadas: para aprovechar el matmul NVFP4 nativo se requiere una GPU Blackwell (SM ≥ 10.0), como la serie RTX 50 (por ejemplo, RTX 5090) o las GPUs de datacenter B200. En GPUs Ampere (RTX 30) o Ada (RTX 40), ComfyUI descomprime los pesos automáticamente, por lo que el modelo funciona pero sin la ventaja de velocidad FP4.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo con 12 GB o más de VRAM, siempre que se acepte la descompresión en arquitecturas no Blackwell.
- Opciones de despliegue: exclusivamente a través de ComfyUI, ya que el formato `comfy_quant` es nativo de esa plataforma. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La model card no proporciona mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Tamaño | Formato | Uso en LTX-2.5 | Licencia |
|---|---|---|---|---|
| `r3lax/gemma4-12b-heretic-ltx-2.5-comfy-nvfp4` | 9,87 GB | NVFP4 + BF16 | Sí, drop-in | Apache 2.0 |
| `DeepNeuralNerd/Gemma-4-12B-it-uncensored-heretic-DeepNeuralNerd-LTX_2.5_ComfyUI` | 24,46 GB | BF16 | Sí, original | Apache 2.0 |
| `google/gemma-4-12B-it` | ~24 GB (BF16) | BF16 | No (requiere adaptación) | Gemma Terms of Use |

La comparativa se limita a los modelos de la misma línea, ya que no se dispone de información sobre otros text encoders cuantizados para LTX-2.5. La principal diferencia entre el modelo cuantizado y su fuente es el tamaño (60 % menor) y la posible aceleración en hardware Blackwell. Frente al modelo base de Google, la variante heretic elimina los mecanismos de rechazo, lo que cambia el comportamiento de generación pero no la arquitectura.

## Limitaciones y advertencias

- Contenido no censurado: al derivar de la línea "heretic" (abliterada), el modelo tiene un comportamiento de rechazo reducido y puede generar contenido sensible, explícito o inapropiado. La model card lo advierte explícitamente y lo destina solo a fines de investigación y aprendizaje.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede producir condiciones de texto incoherentes o no alineadas con el prompt, lo que afecta a la calidad del vídeo generado.
- Dependencia de ComfyUI: el formato `comfy_quant` es específico de ComfyUI; no se puede usar directamente en otros frameworks de inferencia sin conversión adicional.
- Requisito de hardware Blackwell para velocidad FP4: en GPUs más antiguas, la descompresión automática elimina la ventaja de rendimiento, aunque mantiene la reducción de memoria.
- Sin reentrenamiento: la cuantización se realizó con redondeo directo (`--simple`), lo que puede introducir pequeñas pérdidas de precisión en comparación con métodos de optimización más sofisticados, aunque no se han documentado evaluaciones de calidad.
- Idiomas y contexto no especificados: no se indica la longitud de contexto soportada ni la lista de idiomas, lo que limita la planificación de despliegues multilingües.
- Licencia Apache 2.0: aunque permite uso comercial, el contenido generado puede estar sujeto a restricciones legales según la jurisdicción, especialmente por la naturaleza no censurada del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/r3lax/gemma4-12b-heretic-ltx-2.5-comfy-nvfp4
- Modelo fuente (DeepNeuralNerd): https://huggingface.co/DeepNeuralNerd/Gemma-4-12B-it-uncensored-heretic-DeepNeuralNerd-LTX_2.5_ComfyUI
- Modelo abliterado original (llmfan46): https://huggingface.co/llmfan46/gemma-4-12B-it-uncensored-heretic
- Modelo base (Google): https://huggingface.co/google/gemma-4-12B-it
- Herramienta de cuantización `convert-to-quant`: https://github.com/silveroxides/convert_to_quant

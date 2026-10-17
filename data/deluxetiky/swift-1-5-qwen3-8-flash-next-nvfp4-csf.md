# deluxetiky/Swift-1.5-Qwen3.8-Flash-Next-NVFP4-CSF

## Resumen
Swift-1.5-Qwen3.8-Flash-Next-NVFP4-CSF es un checkpoint de 123.495.367.350 parámetros (aproximadamente 123,5 mil millones) publicado por el usuario deluxetiky. Se trata de una conversión de formato sin pérdida del modelo ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4 al layout NVFP4-CSF que utilizan las builds de vLLM para Blackwell de local-inference-lab. Los pesos no se modifican: solo se recodifican los tensores de escala de bloque de los expertos enrutados, comprimiendo `weight_scale` en flujos `*.nvfp4_csf_fixed` y `*.nvfp4_csf_exceptions`.

El objetivo principal es permitir que una única GPU de 96 GB sirva el modelo. El layout CSF mantiene la tabla PLE n-gram respaldada en host o disco en lugar de residente en GPU, y habilita los kernels `nvfp4_csf`. El despliegue se realiza con `vllm serve <dir> --quantization nvfp4_csf --load-format nvfp4_csf`, siempre que se disponga de hardware compatible, como una RTX PRO 6000.

No se dispone de información sobre la arquitectura, la longitud de contexto, los idiomas soportados ni la licencia en la documentación proporcionada. La licencia se hereda del modelo fuente y se debe consultar el archivo LICENSE del repositorio.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 123.495.367.350 (aproximadamente 123,5 mil millones) |
| Parámetros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 con layout NVFP4-CSF; la etiqueta del repositorio indica 8-bit, pero la model card describe NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (heredada del modelo fuente; consultar LICENSE) |
| Formato de pesos | safetensors con layout NVFP4-CSF |
| Modelo base | ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4 |
| Tamaño del repositorio | 182,9 GB |
| Formato de carga en vLLM | `--quantization nvfp4_csf --load-format nvfp4_csf` |
| Hardware compatible | GPU Blackwell con 96 GB, por ejemplo RTX PRO 6000, con builds de local-inference-lab |
| Creado | 2026-10-16 |
| Actualizado | 2026-10-16 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento
La información proporcionada no describe la arquitectura del modelo base. La model card se limita a documentar el proceso de conversión de formato. Se sabe que el checkpoint original es ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4, un modelo ya cuantizado en NVFP4, pero no se detallan sus características arquitectónicas (transformer, MoE, híbrido, etc.) ni el número de tokens de entrenamiento, la composición del dataset o si se emplearon técnicas como RLHF o DPO.

La innovación técnica de este checkpoint es la conversión sin pérdida al layout NVFP4-CSF. Los pesos son idénticos a los del modelo fuente; solo se recodifican los tensores de escala de bloque de los expertos enrutados. La compresión convierte `weight_scale` en dos flujos: `*.nvfp4_csf_fixed` y `*.nvfp4_csf_exceptions`. Este layout permite que la tabla PLE n-gram permanezca en host o disco, reduciendo la VRAM necesaria, y habilita los kernels `nvfp4_csf` en vLLM.

## Capacidades
- Generación de texto: no disponible; se heredan las capacidades del modelo base, no documentadas.
- Razonamiento: no disponible.
- Código: no disponible.
- Matemáticas: no disponible.
- Visión: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponible.

## Casos de uso
- Servicio de inferencia local en GPU Blackwell de 96 GB: el checkpoint permite cargar un modelo de 123,5 mil millones de parámetros en una sola GPU gracias al layout NVFP4-CSF y a que la tabla PLE n-gram se mantiene respaldada en host o disco. Se usaría con vLLM y los kernels `nvfp4_csf`.
- Despliegue en vLLM con cuantización nvfp4_csf: el comando `vllm serve <dir> --quantization nvfp4_csf --load-format nvfp4_csf` permite servir el modelo en entornos local-inference-lab Blackwell.
- Reducción de VRAM en producción: al mantener los pesos en NVFP4 y comprimir las escalas de los expertos enrutados, se reduce el uso de memoria GPU frente a un checkpoint en precisión completa, facilitando el despliegue en una única GPU de 96 GB.
- Evaluación de kernels NVFP4-CSF: el checkpoint sirve para probar y medir el rendimiento de los kernels `nvfp4_csf` en hardware Blackwell.
- Investigación en cuantización: permite estudiar la compresión sin pérdida de escalas de expertos enrutados y su impacto en la calidad de inferencia.
- Migración de checkpoints existentes: sirve como ejemplo de conversión de un checkpoint NVFP4 estándar al layout NVFP4-CSF sin modificar los pesos.
- Despliegue con almacenamiento host/disco para la tabla PLE: útil en entornos donde la VRAM es limitada y se prefiere mantener la tabla n-gram en host o disco.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: el autor indica que una única GPU de 96 GB puede servir el modelo. Los pesos en NVFP4 (4 bits) ocuparían aproximadamente 61,7 GB para 123,5 mil millones de parámetros, más el overhead de activaciones, KV cache y tabla PLE. No se especifica una cifra exacta de VRAM.
- GPU recomendadas: RTX PRO 6000 (Blackwell) con 96 GB. Se requiere hardware con soporte para NVFP4, como la generación Blackwell. No se mencionan otras GPU.
- ¿Cabe en consumer GPU? No, según la información disponible; requiere una GPU de 96 GB, muy por encima de las consumer actuales (24-32 GB).
- Opciones de despliegue: vLLM con las opciones `--quantization nvfp4_csf --load-format nvfp4_csf`, usando las builds de local-inference-lab para Blackwell. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| deluxetiky/Swift-1.5-Qwen3.8-Flash-Next-NVFP4-CSF | 123.495.367.350 | no disponible | no disponible | safetensors NVFP4-CSF | Conversión sin pérdida de escalas de expertos enrutados |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4 | no disponible | no disponible | no disponible | NVFP4 (según nombre y tags) | Modelo fuente; este checkpoint es una conversión de formato |

No se conocen otros modelos comparables en la información disponible.

## Limitaciones y advertencias
- Licencia no disponible: heredada del modelo fuente; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- Riesgo de alucinación: no evaluado en la información disponible; se hereda del modelo base.
- Limitaciones de contexto e idioma: no disponibles.
- La cuantización NVFP4 del modelo base puede introducir pérdida de precisión frente a precisión completa; esta conversión es sin pérdida respecto al checkpoint NVFP4 de origen.
- Requiere hardware Blackwell específico y una build concreta de vLLM (local-inference-lab); no es un checkpoint genérico para cualquier runtime.
- Solo se han recodificado las escalas de expertos enrutados; el resto de tensores son idénticos al origen.
- No se documentan sesgos conocidos.
- No hay datos de benchmarks que permitan validar la calidad del modelo.

## Enlaces
- HuggingFace: https://huggingface.co/deluxetiky/Swift-1.5-Qwen3.8-Flash-Next-NVFP4-CSF
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4
- Licencia: https://huggingface.co/deluxetiky/Swift-1.5-Qwen3.8-Flash-Next-NVFP4-CSF/blob/main/LICENSE (indicado en la model card)
- No se proporcionan más enlaces (papers, blogs, repos, demos) en la información disponible.

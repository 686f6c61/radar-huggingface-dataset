# Miausis/DeepSeek-V4.1-Flash-1017-NVFP4

## Resumen

DeepSeek-V4.1-Flash-1017-NVFP4 es la versión cuantizada en FP4 del modelo DeepSeek-V4.1-Flash-1017 desarrollado por DeepSeek AI, publicada por el usuario Miausis mediante NVIDIA Model Optimizer. Se trata de un modelo de lenguaje auto-regresivo nativamente multimodal con arquitectura Mixture-of-Experts (MoE) y Causal Encoder-Decoder (CED), que incorpora Compressed Sparse Attention 2 (CSA2) y soporta contextos de hasta un millón de tokens. El checkpoint original fue publicado por NVIDIA en su espacio de HuggingFace el 30 de octubre de 2026, y esta réplica aparece el 2 de noviembre de 2026.

El modelo resuelve el problema del despliegue eficiente de un MoE de gran escala: el backbone suma 552B parámetros totales (8B activados en prefill y 16B en decode) más 196B de memoria condicional Engram, lo que da un total real de 664.898.390.994 parámetros según los safetensors. La cuantización NVFP4 reduce el peso del repositorio a 429 GB, facilitando su ejecución en hardware Blackwell.

Su relevancia actual radica en que combina contexto de 1M tokens, multimodalidad imagen-texto y cuantización FP4 lista para producción, con licencia MIT. No obstante, requiere una build específica de vLLM con soporte MXFP4 para las tablas Engram, lo que limita su adopción inmediata a entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE Causal Encoder-Decoder (CED) con Compressed Sparse Attention 2 (CSA2) |
| Parametros totales | 664.898.390.994 (552B backbone + 196B Engram conditional memory) |
| Parametros activos | 8B en prefill, 16B en decode |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (FP4 para pesos); tablas Engram almacenadas en MXFP4; tags indican también fp8 y 8-bit |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer Mixture-of-Experts con diseño Causal Encoder-Decoder y Compressed Sparse Attention 2 (CSA2), orientado a contextos extremadamente largos. El modelo incorpora un componente denominado Engram, una memoria condicional de 196B parámetros cuyas tablas de búsqueda se almacenan en MXFP4 en este checkpoint. La activación es dispersa: 8B parámetros en fase de prefill y 16B en decode, sobre un backbone de 552B. La modalidad de entrada es texto e imagen (RGB), con salida exclusivamente textual.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card original de DeepSeek AI no está incluida en la información proporcionada. Respecto a la cuantización, se aplicó post-training quantization con nvidia-modelopt v0.48.0rc0 (revisión fuente `1bae0e1088993b9b82de08f59de5be5a34e42170`), usando 1.024 muestras de calibración (512 de cnn_dailymail y 512 de Nemotron-Post-Training-Dataset-v2, con subsets stem, chat, math y code), longitud de secuencia 512 y batch size 4.

## Capacidades

- Generación de texto auto-regresiva con contexto de hasta 1M tokens.
- Procesamiento multimodal imagen-texto: acepta entradas RGB junto a texto y produce respuestas textuales.
- Razonamiento científico y tareas de conocimiento avanzado (evaluado en GPQA Diamond).
- Recuperación en contexto largo (evaluado en AA-LCR).
- Codificación científica y de propósito general (evaluado en SciCode).
- Seguimiento de instrucciones (evaluado en IFBench).
- Comprensión visual (evaluado en MMMU-Pro).
- Tareas de agente en terminal (evaluado en Terminal-Bench 2.1), lo que implica soporte de razonamiento multi-paso y ejecución de comandos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte explícito de tool calling / function calling: no documentado en la información disponible.

## Casos de uso

- Sistemas de agentes autónomos en terminal: el modelo ha sido evaluado en Terminal-Bench 2.1, por lo que puede integrarse en pipelines que requieran interpretar salidas de shell, ejecutar comandos y razonar sobre resultados en múltiples pasos.
- Análisis de documentos extensos con imágenes: gracias al contexto de 1M tokens y la entrada multimodal, permite procesar informes, contratos o expedientes completos con figuras y tablas sin fragmentación.
- RAG sobre corpus masivos: la ventana de 1M tokens reduce la necesidad de recuperación agresiva y permite inyectar grandes bloques de contexto recuperado en una sola llamada.
- Asistentes de investigación científica: adecuado para tareas de razonamiento en dominios como física, química o biología (GPQA Diamond) y para generación de código científico (SciCode).
- Automatización de atención al cliente multimodal: puede gestionar conversaciones multi-turno en las que el usuario adjunte capturas o imágenes, manteniendo el hilo gracias al contexto largo.
- Despliegue en infraestructura Blackwell para inferencia de alto rendimiento: la cuantización NVFP4 y el soporte en vLLM permiten servir el modelo en GB300 con menor huella de memoria que el checkpoint original.
- Evaluación de instrucciones complejas en producción: útil en sistemas que requieren seguir especificaciones largas y detalladas (IFBench), como generación de informes con formato estricto.

## Benchmarks y rendimiento

La model card menciona los datasets de evaluación (GPQA Diamond, AA-LCR, SciCode, IFBench, MMMU-Pro, Terminal-Bench 2.1) y que los resultados se obtuvieron con `vllm/vllm-openai:v0.31.0` con los cambios de Engram aplicados, pero no se incluyen las cifras numéricas en la información proporcionada.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 429 GB en FP4, por lo que se requiere al menos esa cantidad de memoria agregada; no se dispone de cifras oficiales de VRAM por GPU.
- GPU recomendadas: NVIDIA Blackwell, con pruebas realizadas en NVIDIA GB300 según la model card.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del checkpoint (429 GB) y la necesidad de Blackwell hacen inviable su ejecución en GPUs consumer convencionales.
- Opciones de despliegue: vLLM es el único runtime validado, y requiere una build con soporte MXFP4 para Engram (PR vllm-project/vllm#61530). SGLang no ha sido validado con este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-NVFP4 (este) | 664,9B (552B + 196B Engram) | 8B prefill / 16B decode | 1M | MIT | safetensors NVFP4 | HuggingFace (Miausis) |
| DeepSeek-V4.1-Flash-1017 (base) | 552B backbone + 196B Engram | 8B / 16B | 1M | MIT | safetensors | HuggingFace (deepseek-ai) |
| DeepSeek-V4.1-Flash-1017 NVFP4 (NVIDIA) | 552B backbone + 196B Engram | 8B / 16B | 1M | MIT | safetensors NVFP4 | HuggingFace (nvidia) |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El checkpoint almacena las tablas Engram en MXFP4 y no puede cargarse con imágenes estándar de vLLM; requiere una build con el PR #61530 aplicado.
- SGLang no ha sido validado con este checkpoint, lo que restringe las opciones de serving.
- Solo se ha probado en hardware NVIDIA Blackwell (GB300); no hay validación en otras arquitecturas.
- No se dispone de información sobre sesgos, riesgos de alucinación ni evaluación de seguridad del modelo base.
- Los idiomas soportados no están documentados, lo que impide garantizar calidad multilingüe.
- El modelo es una réplica publicada por un usuario tercero (Miausis) con 0 descargas y 0 likes; no es el repositorio oficial de NVIDIA ni de DeepSeek AI, por lo que conviene verificar la integridad de los pesos antes de usarlo en producción.
- La licencia MIT permite uso comercial, pero la model card advierte que la integración en sistemas de IA requiere pruebas adicionales específicas del caso de uso.
- El tamaño del repositorio (429 GB) y la necesidad de hardware Blackwell implican costes de infraestructura elevados.
- No se han publicado cifras de benchmarks en la información disponible, lo que impide comparar el rendimiento real de esta cuantización frente al modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Miausis/DeepSeek-V4.1-Flash-1017-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio oficial NVIDIA del mismo checkpoint: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- PR de vLLM para soporte MXFP4 Engram: https://github.com/vllm-project/vllm/pull/61530
- Dataset de calibración cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibración Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Licencia MIT: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/mit.md

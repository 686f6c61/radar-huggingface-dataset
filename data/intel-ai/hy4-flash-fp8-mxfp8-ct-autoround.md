# intel-ai/Hy4-flash-FP8-MXFP8-CT-AutoRound

## Resumen

Hy4-flash-FP8-MXFP8-CT-AutoRound es una versión cuantizada del modelo tencent/Hy4-flash-FP8, publicada por intel-ai mediante la herramienta AutoRound (Intel Neural Compressor). El proceso aplica cuantización MXFP8 (W8A8 con group_size 32) usando redondeo RTN (round-to-nearest) sobre los pesos del modelo base, con el objetivo de reducir el espacio ocupado en memoria y el ancho de banda necesario durante la inferencia manteniendo prácticamente intacta la calidad del modelo original. El modelo conserva la modalidad image-text-to-text del original, es decir, acepta entradas de imagen y texto.

El modelo base tiene 220.251.201.958 parámetros (aproximadamente 220 mil millones) según los metadatos de safetensors, lo que lo sitúa en la categoría de modelos de gran escala que requieren despliegues multi-GPU. La cuantización MXFP8 permite servir el modelo con menor huella de memoria que la versión BF16 (el repositorio ocupa 291,9 GB), y está pensada para su uso con vLLM en entornos de producción.

La relevancia de esta ficha radica en que es una de las pocas alternativas públicas de servir un modelo de 220B en formato MXFP8 con recuperación de calidad documentada por el autor (media del 99,82 % respecto al FP8 original en los benchmarks publicados). Es un artefacto de infraestructura más que un modelo nuevo: no introduce capacidades adicionales, sino que facilita el despliegue eficiente del modelo de Tencent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Hy4-flash, con atención dispersa e indexador; detalles completos no disponibles) |
| Parametros totales | 220.251.201.958 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 (W8A8, group_size 32) generado con AutoRound/RTN; pesos no cuantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (licencia del modelo original) |
| Formato de pesos | safetensors (compatible con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint tencent/Hy4-flash-FP8. Según la model card, se cuantizan a MXFP8 los expertos enrutados (routed experts), las proyecciones de up-projection de query de atención, las proyecciones de gate y output de atención, y las capas draft de DFly. Se mantienen en BF16 la capa densa, las proyecciones latentes de atención, los expertos compartidos, las proyecciones latentes de expertos, el router, el indexador de atención dispersa, los embeddings Engram, la torre de visión, los embeddings y el lm_head. La mención de "routed experts" y "shared experts" indica una arquitectura de mezcla de expertos (MoE), aunque el número de parámetros activos no se especifica en la información disponible.

El proceso de cuantización se realizó con AutoRound (intel/auto-round) en modo `model_free` con esquema MXFP8 y formato `llm_compressor`, usando redondeo RTN y una lista explícita de capas ignoradas (las que se mantienen en BF16). No se aportan datos sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada. La innovación técnica destacable es la preservación selectiva de capas sensibles en BF16, que permite una recuperación media del 99,82 % respecto al FP8 original en los benchmarks publicados.

## Capacidades

- Generación de texto conversacional (pipeline image-text-to-text).
- Procesamiento de entradas de imagen y texto (torre de visión incluida en el modelo base).
- Razonamiento y matemáticas (evaluado en GSM8K y MMLU en la model card).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, audio, etc.): no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en producción de un modelo de 220B con menor huella de memoria: la cuantización MXFP8 reduce el espacio frente a BF16 (repositorio de 291,9 GB) y permite servir el modelo con vLLM en clústeres multi-GPU con mayor densidad de instancias por nodo.
- Sustitución directa del checkpoint FP8 en pipelines existentes: al mantener la misma interfaz (transformers, compressed-tensors) y los mismos benchmarks, se puede integrar como reemplazo del modelo base sin cambios en el código de aplicación.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia para medir la recuperación de calidad de MXFP8 frente a FP8 en tareas de razonamiento (MMLU, GSM8K) y sentido común (PIQA, HellaSwag).
- Investigación en eficiencia de inferencia: útil para estudiar el impacto del ancho de banda de memoria en el throughput de modelos MoE de gran escala servidos con vLLM.
- Aplicaciones multimodales image-text-to-text: al conservar la torre de visión en BF16, puede emplearse en tareas de descripción de imágenes o respuesta a preguntas visuales, siempre que el despliegue incluya la torre de visión (la configuración de vLLM documentada usa `--language-model-only`).
- Entornos con restricciones de memoria en GPU: la cuantización W8A8 con group_size 32 permite ajustar el modelo en configuraciones de hardware donde la versión BF16 no cabría.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando el modelo cuantizado (MXFP8) con el FP8 original:

| Benchmark | FP8 | MXFP8 | Recuperación |
|---|---:|---:|---:|
| PIQA | 81,56 | 80,96 | 99,27 % |
| HellaSwag | 58,35 | 58,38 | 100,05 % |
| MMLU | 86,16 | 86,31 | 100,17 % |
| GSM8K (flexible) | 88,32 | 88,17 | 99,83 % |
| **Media** | **78,60** | **78,46** | **99,82 %** |

No se han publicado en la información disponible resultados de benchmarks del modelo base frente a modelos de la competencia, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 291,9 GB en MXFP8; se requiere un despliegue multi-GPU con al menos esa capacidad agregada, más overhead de activaciones y KV cache.
- GPU recomendadas: no especificadas en la información disponible; por el tamaño del modelo, se necesitan GPUs de centro de datos (A100, H100, H200 o superiores) en configuración multi-GPU.
- ¿Cabe en consumer GPU? No; 220B parámetros en MXFP8 exceden la memoria de cualquier GPU de consumo individual.
- Opciones de despliegue: vLLM (versión documentada: 0.34.1rc1.dev78+g2e53ef6cf, con descarga de kernels mediante `vllm download-kernels`); compatible con transformers y compressed-tensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-FP8-MXFP8-CT-AutoRound (este) | 220,25B | no disponible | MXFP8 W8A8 | tencent-hy-license | Hugging Face (135 descargas) |
| tencent/Hy4-flash-FP8 (base) | 220,25B | no disponible | FP8 | tencent-hy-license | Hugging Face |
| Otras alternativas de 200B+ | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos comparables de otros autores con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo puede producir salidas factualmente incorrectas; no debe usarse como fuente de información veraz sin verificación.
- Riesgo de generar contenido obsceno, sesgado u ofensivo, según advierte la propia model card.
- La licencia tencent-hy-license condiciona el uso comercial; es necesario revisar sus términos antes de desplegar en producción. La model card indica explícitamente que la licencia no constituye asesoramiento legal.
- Los idiomas soportados no están documentados en la información disponible.
- La longitud de contexto no está documentada en la información disponible.
- La configuración de vLLM documentada usa `--language-model-only`, por lo que la torre de visión no se sirve con esa invocación; para uso multimodal hay que ajustar el despliegue.
- La cuantización MXFP8 introduce una pérdida mínima pero no nula de calidad (recuperación media del 99,82 %).
- Requiere versiones específicas de vLLM y kernels descargables; no es un despliegue estándar con versiones estables de librerías.
- El número de descargas (135) y de likes (0) es bajo, lo que sugiere poca validación comunitaria del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intel-ai/Hy4-flash-FP8-MXFP8-CT-AutoRound
- Modelo base: https://huggingface.co/tencent/Hy4-flash-FP8
- Licencia del modelo base: https://huggingface.co/tencent/Hy4-flash-FP8/blob/main/LICENSE
- AutoRound (GitHub): https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Paper AutoRound (arXiv): https://arxiv.org/abs/2309.05516

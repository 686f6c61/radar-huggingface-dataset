# Blackfrost-AI/GLM-5.3-Flash-DERISKED-NVFP4

## Resumen

GLM-5.3-Flash-DERISKED-NVFP4 es una variante cuantizada en precisión NVIDIA NVFP4 (4 bits) del modelo GLM-5.3-Flash, desarrollada por Blackfrost-AI, una empresa con sede en Las Vegas especializada en seguridad ofensiva y evaluación de sistemas de IA. El modelo parte del checkpoint oficial `zai-org/GLM-5.3-Flash-BF16` y de la versión "de-risked" en BF16 de Blackfrost-Research, y está diseñado específicamente para equipos de seguridad, red teams y laboratorios de detección que necesitan generar respuestas ante prompts adversariales sin que el modelo se niegue a cooperar. Su propósito declarado es permitir que los equipos de defensa puedan probar sus controles contra un modelo que no rechaza producir ataques.

Se trata de un modelo multimodal (texto e imagen) con arquitectura MoE híbrida, 320 mil millones de parámetros totales (18 mil millones activos por token), una ventana de contexto de hasta 1 millón de posiciones y soporte para inglés y chino. La cuantización NVFP4 reduce el tamaño del checkpoint a unos 205 GB (frente a los ~640 GB que ocuparía en BF16), lo que permite servirlo en 8 GPUs NVIDIA B200 con un rendimiento de decodificación observado de aproximadamente 165 tokens por segundo. La licencia es MIT, lo que permite uso comercial sin restricciones.

Esta ficha se basa exclusivamente en la información publicada en la model card de Hugging Face y en los resultados de búsqueda proporcionados. No se han encontrado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este artefacto concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Glm5NextForConditionalGeneration` — MoE híbrida con atención DSA (DeepSeek Sparse Attention) y KDA (KV-Distilled Attention) |
| Parametros totales | 320B según model card (169.120.127.838 contados en safetensors) |
| Parametros activos | 18B por token (top-8 de 288 expertos + 1 experto compartido) |
| Longitud de contexto | 1.048.576 posiciones (1M techo arquitectónico) |
| Tipos de cuantizacion | NVFP4 (W4A16), BF16 para capas críticas (atención, MTP, experto compartido) |
| Idiomas soportados | Inglés, chino |
| Licencia | MIT |
| Formato de pesos | safetensors (120 shards, ~205 GB) |

## Arquitectura y entrenamiento

La arquitectura es un MoE híbrido de 45 capas principales: las 3 primeras son densas y las 42 restantes son de tipo MoE. Cada capa MoE dispone de 288 expertos enrutados (con top-8 activos por token) más un experto compartido en BF16. La atención combina 34 capas KDA (atención con destilación de KV) y 11 capas DSA completas (atención dispersa tipo DeepSeek), con un indexador DSA de 32 cabezas y `index_topk` de 2048. Los rangos latentes son `kv_lora_rank` 512 y `q_lora_rank` 1536. El vocabulario es de 154.880 tokens. Se añade una capa adicional de predicción multi-token (MTP) en BF16.

No se ha publicado información sobre el preentrenamiento (número de tokens, composición del dataset, métodos de alineación). El modelo es una conversión cuantizada del checkpoint BF16 de Blackfrost-Research, que a su vez deriva del oficial `zai-org/GLM-5.3-Flash-BF16`. No se aplicaron SFT, DPO, RLHF ni pruning de expertos; solo la conversión propietaria a NVFP4. La característica "de-risked" se refiere a un comportamiento heredado del padre BF16 que reduce los rechazos ante prompts dañinos, sin necesidad de prompts, adaptadores ni filtros en tiempo de ejecución.

## Capacidades

- Generación de texto y razonamiento multi-turno en inglés y chino.
- Comprensión de imágenes (multimodal, pipeline `image-text-to-text`).
- Soporte de razonamiento con modo "thinking" y máximo esfuerzo de razonamiento (según la configuración de evaluación).
- Tool calling y function calling (el comando de serving incluye `--tool-call-parser glm47`).
- Soporte para agentes y razonamiento multi-paso (parser de razonamiento `glm45`).
- Capacidad de manejar contextos muy largos (hasta 1M de tokens).
- Diseñado para entornos de red teaming y pruebas de seguridad: genera contenido que los modelos estándar rechazarían.

## Casos de uso

- Evaluación de sistemas de detección de contenido dañino: los equipos de seguridad pueden usar este modelo para generar prompts adversariales y verificar si sus filtros los bloquean correctamente.
- Pruebas de robustez de modelos de defensa: sirve como generador de ataques para medir la tasa de rechazo de otros sistemas de IA.
- Desarrollo de herramientas de red teaming automatizadas: se puede integrar en pipelines que generan casos de prueba de seguridad de forma masiva.
- Investigación en seguridad ofensiva: permite estudiar patrones de generación de contenido malicioso sin depender de modelos que se niegan a colaborar.
- Validación de controles de cumplimiento en entornos enterprise: las empresas pueden probar si sus políticas de moderación son efectivas contra un modelo sin restricciones.
- Benchmarking de sistemas de moderación de contenido multimodal: al aceptar imágenes, permite probar la detección de contenido dañino en formato visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este artefacto en la información disponible. La única evaluación publicada es la de rechazo ante prompts dañinos, realizada sobre el checkpoint NVFP4 con la configuración indicada en la model card:

| Evaluación | Resultado |
|---|---|
| Prompts dañinos (R1-HARMFUL-BENCH-450) | 4 / 300 rechazos (1,3 %) |
| Suite completa | 5 / 450 rechazos (1,1 %) |
| Errores de API | 0 / 450 |

Estos valores son mediciones de comportamiento, no una certificación de seguridad ni una garantía para otros entornos de servicio.

## Requisitos de hardware

- Validado en 8×NVIDIA B200 con SGLang, usando TP8/EP8.
- Carga de pesos observada: ~22,83 GB por rank bajo TP8/EP8 (total ~183 GB).
- No cabe en GPUs de consumo (RTX 4090, etc.) debido al tamaño del modelo y la memoria requerida.
- Opciones de despliegue: SGLang (validado), con flags específicos para DSA, MoE runner y parsers de razonamiento y tool calling.
- Rendimiento de decodificación observado: ~164,63–166,63 tokens/segundo en una ejecución single-stream con la configuración indicada.
- Se recomienda fijar una imagen de SGLang probada en producción en lugar de usar etiquetas flotantes.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este artefacto. Como derivado de GLM-5.3-Flash, su principal diferencia frente al modelo oficial `zai-org/GLM-5.3-Flash-BF16` es la cuantización NVFP4 (menor huella de memoria) y el comportamiento "de-risked" (menor tasa de rechazo ante prompts dañinos). No hay cifras de benchmarks estándar que permitan compararlo con otros MoE de tamaño similar (p. ej., DeepSeek-V3, Mixtral 8x22B). Se recomienda consultar la documentación oficial de GLM-5.3-Flash para comparativas de rendimiento general.

## Limitaciones y advertencias

- El modelo está diseñado para generar contenido dañino o malicioso cuando se le solicita; su uso indebido puede causar daños. No debe desplegarse en entornos de producción orientados al usuario final sin controles de seguridad adecuados.
- La evaluación de rechazo se realizó en una configuración específica (thinking activado, temperatura 1.0, top-p 0.95, máx. 16.384 tokens de salida); los resultados pueden variar en otros entornos de servicio.
- Solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- El contexto máximo de 1M tokens es un techo arquitectónico; en la práctica, el rendimiento puede degradarse con contextos muy largos y depende de la memoria disponible.
- La cuantización NVFP4 puede introducir pérdidas de precisión frente al BF16 original, aunque no se han publicado evaluaciones comparativas al respecto.
- La licencia MIT permite uso comercial, pero el usuario es responsable del cumplimiento legal y ético de las aplicaciones que construya con este modelo.
- No se han publicado detalles sobre el proceso de entrenamiento ni sobre los datos utilizados; la transparencia es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Blackfrost-AI/GLM-5.3-Flash-DERISKED-NVFP4
- Modelo base BF16 (Blackfrost-Research): https://huggingface.co/Blackfrost-Research/GLM-5.3-Flash-DERISKED-BF16
- Modelo oficial upstream (zai-org): https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Organización Blackfrost-Research: https://huggingface.co/Blackfrost-Research/collections
- Página de despliegue en FriendliAI: https://friendli.ai/models/Blackfrost-AI/GLM-5.3-Flash-DERISKED-NVFP4
- Ficha en LLM Explorer: https://llm-explorer.com/model/Blackfrost-AI%2FGLM-5.3-Flash-DERISKED-BF16,6kNzsQteBaKmzltCVUMVCu
- Ficha en AI Market Cap: https://aimarketcap.tech/models/blackfrost-ai-glm-5-3-flash-derisked-nvfp4

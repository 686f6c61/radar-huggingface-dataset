# axteam/Qwen3.5-9B-AWQ-8bit

## Resumen

`axteam/Qwen3.5-9B-AWQ-8bit` es una versión cuantizada a 8 bits del modelo multimodal `Qwen/Qwen3.5-9B` del equipo Qwen (Alibaba), publicada por el usuario axteam el 27 de octubre de 2026. No se trata de un modelo nuevo: es un derivado de post-entrenamiento (PTQ) pensado para servir el modelo original con menos memoria y mayor throughput en vLLM, sin reentrenamiento. El modelo base es un transformer denso de 9.409.813.744 parámetros con arquitectura híbrida (atención lineal + atención completa), torre de visión y una cabeza MTP (multi-token prediction).

La relevancia de esta ficha está en la cuantización: AWQ INT8 con pesos simétricos en grupos de 32 y activaciones en BF16 (esquema W8A16), almacenada en formato `compressed-tensors` `pack-quantized`. El autor conserva en BF16 las partes sensibles (torre de visión y proyector, cabeza MTP, RMSNorms, embeddings, LM head y los componentes no lineales de la atención SSM), de modo que el impacto en calidad medido es mínimo: perplejidad de 1,4507 frente a 1,4506 del BF16 original (+0,0 %) y una coincidencia top-1 del 98,6 % frente al 99,2 % del original, sobre un conjunto interno de 100 prompts en inglés y coreano.

El resultado es un artefacto de ~11,9 GB en disco que cabe en una única GPU de 24 GB y que se sirve con `vllm serve axteam/Qwen3.5-9B-AWQ-8bit`. Para quien necesite el modelo base en producción con contexto largo y visión, esta variante reduce los requisitos de VRAM respecto al BF16 sin cambiar tokenizador, `chat_template` ni `generation_config`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: atención lineal (SSM) + atención completa; multimodal con torre de visión y cabeza MTP (multi-token prediction) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos según las fuentes del modelo base; hasta 1 M según algunas referencias (no verificado en la información disponible) |
| Tipos de cuantizacion | AWQ INT8 W8A16 (pesos INT8 simétricos, grupo de 32, activaciones BF16), formato `compressed-tensors` `pack-quantized`; el modelo base dispone de otras cuantizaciones de la comunidad (GGUF, ternarias) |
| Idiomas soportados | No disponible en los metadatos de HuggingFace; el modelo base se anuncia con soporte de hasta 201 idiomas según Together AI (no verificado) |
| Licencia | Apache-2.0 (heredada del modelo base Qwen/Qwen3.5-9B) |
| Formato de pesos | safetensors con `compressed-tensors` (`pack-quantized`); ~11,9 GB en disco, repo de 12,8 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso de 9,4 B parámetros con una arquitectura híbrida que combina capas de atención lineal (con componentes de tipo SSM: `linear_attn.conv1d`, `A_log`, `dt_bias`) y capas de atención completa. Incorpora una torre de visión con su proyector para entrada image-text-to-text y una cabeza MTP, utilizada habitualmente para decodificación especulativa o predicción multi-token. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

Esta publicación concreta no entrena nada: es cuantización post-entrenamiento. AWQ calcula escalas de protección por canal para los pesos más relevantes usando un conjunto de calibración de 256 muestras, descrito por el autor como un corpus mixto con predominio de coreano, y después redondea a INT8 simétrico. Los módulos que más degradan con cuantización se mantienen en BF16: `model.visual.*` (torre y proyector), `mtp.*`, todas las RMSNorm, los embeddings de tokens, el LM head y las partes no lineales del bloque SSM. El `config.json` es el original más un bloque `quantization_config`, y el tokenizador, la plantilla de chat y la configuración de generación son idénticos a los del modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso, incluida la resolución de problemas de matemáticas y lógica.
- Generación y comprensión de código, con soporte de tool calling / function calling nativo según la documentación del modelo base.
- Capacidades multimodales de entrada: image-text-to-text (razonamiento visual, OCR, descripción de imágenes) mediante la torre de visión conservada en BF16.
- Flujos agénticos: encadenamiento de herramientas y razonamiento de varios pasos, favorecido por el contexto largo.
- Procesamiento de contexto largo (262 K tokens nativos) para documentos extensos, repositorios de código o conversaciones multi-turno prolongadas.
- Multilingüismo amplio según las fuentes del modelo base (hasta 201 idiomas, dato no verificado).
- Cabeza MTP que habilita decodificación especulativa en servidores compatibles, con potencial de mejora de latencia.
- Capacidad de "thinking mode" / razonamiento extendido: mencionada para el modelo base en las fuentes consultadas, no confirmada explícitamente en la model card de esta cuantización.

## Casos de uso

- **Servicio de chat multimodal en producción**: desplegar el modelo con `vllm serve` para atender conversaciones con imágenes adjuntas (capturas, facturas, diagramas) en una sola GPU de 24 GB, aprovechando que la torre de visión se mantiene en BF16 y conserva la calidad del original.
- **Procesamiento de documentos largos y OCR**: digitalización y extracción estructurada de contratos, informes o expedientes de hasta centenares de miles de tokens, usando el contexto nativo de 262 K para evitar trocear el documento y perder referencias cruzadas.
- **Automatización de atención al cliente**: conversaciones multi-turno con historial extenso e integración de function calling para consultar pedidos, stocks o estado de tickets contra APIs internas.
- **Asistente de código en pipelines de CI/CD**: revisión de diffs, generación de tests y explicación de fallos, integrándolo mediante tool calling en herramientas de revisión o en un bot interno; el contexto largo permite pasar varios ficheros del repositorio en una sola llamada.
- **Agentes de investigación con recuperación**: sustituir el BF16 por esta variante INT8 cuando el presupuesto de VRAM es limitado, manteniendo el bucle agente (planificar, llamar herramientas, sintetizar) con latencia contenida.
- **Extracción de datos estructurados a escala**: clasificación y normalización de grandes volúmenes de texto en inglés y coreano, para los que el conjunto de calibración del autor está específicamente sesgado.
- **Despliegue en infraestructura modestas**: servir el modelo en una RTX 4090 o L40S para prototipos y entornos de staging, donde el BF16 de 9,4 B resulta incómodo por el consumo de VRAM.
- **Evaluación comparativa de cuantizaciones**: usar este artefacto como referencia INT8 frente a variantes GGUF o ternarias del mismo modelo base al medir latencia, throughput y degradación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, GPQA, etc.) en la información disponible. La model card solo aporta métricas de fidelidad respecto al BF16 original, no puntuaciones absolutas.

| Metrica (conjunto interno EN/KO, 100 prompts) | Este modelo (AWQ INT8) | Original BF16 |
|---|---|---|
| Perplejidad (menor es mejor) | 1,4507 | 1,4506 (+0,0 %) |
| Coincidencia top-1 del siguiente token | 98,6 % | 99,2 % |

Las fuentes web del modelo base afirman de forma cualitativa que Qwen3.5-9B supera a Qwen3-30B en la mayoría de benchmarks, que supera a GPT-5-Nano en tareas de visión y que obtiene mejores resultados que gpt-oss-120b en GPQA Diamond, MMLU-Pro y MMMLU. Son afirmaciones de terceros sin cifras reproducibles en la información proporcionada, por lo que no se incluyen como resultados verificados.

## Requisitos de hardware

- **VRAM estimada para los pesos**: ~11,9 GB (INT8 en grupos de 32 más los módulos conservados en BF16). Estimación de consumo total en inferencia: 13-16 GB incluyendo caché KV para contextos moderados; el contexto de 262 K exige mucha más memoria de caché.
- **GPU recomendadas**: L40S (48 GB), A100 40/80 GB, H100 80 GB para producción con contexto largo o lotes concurrentes; RTX 4090 / RTX 3090 (24 GB) para servicio de una sola instancia con contexto corto o medio.
- **¿Cabe en GPU de consumo?**: sí, en RTX 4090, RTX 3090 y, con margen ajustado, en GPUs de 16 GB si se limita el contexto y el número de secuencias simultáneas. No cabe en tarjetas de 8-12 GB.
- **Opciones de despliegue**: la vía soportada y documentada es vLLM (`vllm serve axteam/Qwen3.5-9B-AWQ-8bit`), que es la única que interpreta el formato `compressed-tensors` `pack-quantized` de forma nativa. Otros runners (llama.cpp, Ollama, TGI) requerirían una conversión a otro formato, no incluida en este repositorio.
- **Latencia y throughput**: no disponibles. La cabeza MTP podría habilitar decodificación especulativa si el servidor la explota, pero no hay cifras publicadas.
- **Parámetros de muestreo recomendados por el autor**: `temperature=0.7`, `top_p=0.8`, `top_k=20`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/Qwen3.5-9B-AWQ-8bit (este) | 9,4 B denso | 262 K (heredado) | AWQ INT8 W8A16, `compressed-tensors` | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.5-9B (base BF16) | 9,4 B denso | 262 K nativos; hasta 1 M según fuentes | BF16 safetensors | Apache-2.0 | HuggingFace, ampliamente distribuido |
| Cuantizaciones GGUF de la comunidad del mismo base | 9,4 B denso | 262 K (depende del runtime) | GGUF 2-8 bits | Apache-2.0 | HuggingFace (p. ej. listados bajo `base_model:quantized:Qwen/Qwen3.5-9B`) |
| Qwen3-30B (referencia citada por terceros) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es contra el BF16 original: esta variante ocupa ~11,9 GB frente a los ~19 GB del BF16 y prácticamente no altera la perplejidad, a cambio de una pérdida de coincidencia top-1 de 0,6 puntos porcentuales. Frente a cuantizaciones de 4 bits, INT8 conserva más calidad pero ocupa aproximadamente el doble de VRAM. No hay datos públicos que permitan comparar rendimiento en tareas con otras variantes del mismo modelo base.

## Limitaciones y advertencias

- **Fidelidad medida sobre un conjunto sesgado**: la evaluación de calidad usa 100 prompts internos en inglés y coreano, con calibración descrita como "Korean-heavy". El comportamiento en castellano o en otros idiomas puede degradarse más de lo que reflejan esas cifras.
- **Riesgo de alucinación**: inherente al modelo base; la cuantización no lo reduce y puede amplificarlo ligeramente en colas de distribución de probabilidad.
- **Dependencia estricta de vLLM**: el formato `pack-quantized` de `compressed-tensors` no es portable a llama.cpp u Ollama sin conversión. No se proporcionan scripts de conversión.
- **Soporte de idiomas no verificado**: los metadatos de HuggingFace no listan idiomas y la cifra de 201 idiomas procede de una fuente de terceros sobre el modelo base, no de esta model card.
- **Contexto de 262 K y su coste**: usar ventanas muy grandes dispara la memoria de caché KV y puede agotar una GPU de 24 GB; conviene limitar `--max-model-len` según el hardware.
- **Licencia**: Apache-2.0 permite uso comercial, pero los derechos sobre pesos, tokenizador y plantilla de chat pertenecen al equipo Qwen; conviene revisar el fichero LICENSE del repositorio base y las condiciones de atribución.
- **Madurez del artefacto**: el repositorio tiene 0 descargas y 0 likes y se creó el mismo día de su última actualización (27 de octubre de 2026). No hay historial de uso en producción ni validación independiente de las métricas del autor.
- **Sin benchmarks de tareas**: no se puede verificar con datos publicados en esta ficha que la variante INT8 mantenga las puntuaciones del base en MMLU, HumanEval o tareas de visión.
- **Componentes en BF16**: aunque el peso total es INT8, la torre de visión, la cabeza MTP, embeddings y LM head siguen en BF16, por lo que el ahorro de memoria es menor que el teórico de una cuantización integral.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/axteam/Qwen3.5-9B-AWQ-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Listado de cuantizaciones del modelo base en HuggingFace: https://huggingface.co/models?other=base_model:quantized:Qwen/Qwen3.5-9B
- Ficha del modelo base en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-9b/
- Artículo de XDA Developers sobre Qwen3.5-9B: https://www.xda-developers.com/qwen-3-5-9b-tops-ai-benchmarks-not-how-pick-model/
- Catálogo de Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3.5-9b
- Ficha y precios en Together AI: https://www.together.ai/models/qwen3-5-9b

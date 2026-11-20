# IsValorum/LFM2.5-24B-A2B-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

LFM2.5-24B-A2B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Liquid AI, con 24.000 millones de parámetros totales y solo 2.000 millones activos por token. Emplea una arquitectura híbrida que combina capas de convolución lineal 1D con capas de atención multi-cabeza completa, lo que le permite mantener una latencia prácticamente constante en contextos largos. Su ventana de contexto nativa alcanza los 128.000 tokens y está orientado a razonamiento, generación de código, matemáticas y uso autónomo de herramientas.

La ficha que nos ocupa documenta una cuantización GGUF de terceros: la edición APEX-I-MiniPlus V2.1 publicada por el usuario IsValorum, que reduce los pesos originales en BF16 (47,96 GB) a 9,64 GB mediante una mezcla de cuantizaciones Q4_K, IQ3_XXS, Q3_K, Q6_K y Q5_K, manteniendo los routers y las normas en F32 para evitar derivas numéricas. Está calibrada con una importance matrix generada sobre conversaciones reales de tool calling.

El interés de esta versión es práctico: permite ejecutar un modelo de 24B con contexto de 128K en hardware de consumo o en nodos modestos de GPU, gracias a sus 2B de parámetros activos y a su backbone convolucional de estado constante. Es relevante para desarrolladores que necesitan un modelo local con capacidades agénticas y multilingües sin renunciar a la calidad de un modelo de frontera de mayor tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con convolución lineal 1D (30 capas) y atención multi-cabeza completa (10 capas) |
| Parámetros totales | 23.971.587.712 (≈24B) |
| Parámetros activos | ≈2B por token |
| Longitud de contexto | 128.000 tokens (nativo) |
| Tipos de cuantización | GGUF mixta: Q4_K, IQ3_XXS, Q3_K, Q6_K, Q5_K y F32 para routers, normas y sesgos |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it, vi, th, id, hi, ru, pl |
| Licencia | LFM 1.0 (lfm1.0), etiquetada como "other" en el repo |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base sigue un diseño híbrido: de sus 40 capas, 30 son convoluciones lineales 1D con caché de estado O(1), lo que elimina el crecimiento cuadrático del coste de atención en contextos largos, y 10 son capas de atención completa distribuidas cada cuatro bloques para preservar la coherencia a largo plazo hasta los 128.000 tokens. La componente MoE se organiza en 30 capas de expertos (capas 6 a 35) más 8 capas de borde (capas 2 a 5 y 36 a 39), con routers mantenidos en F32 en esta cuantización para evitar derivas de enrutamiento. Las dos primeras capas son FFN densas.

No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de alineación (RLHF/DPO). La model card del autor de la cuantización menciona que el modelo está especializado en razonamiento y tool calling, y que la matriz de importancia empleada para calibrar se generó sobre conversaciones auténticas de llamadas a herramientas renderizadas con la plantilla de chat nativa del modelo, además de un corpus de prosa. La cuantización APEX-I-MiniPlus V2.1 conserva los 428 tensores del modelo original, con un reparto auditado: 207 tensores en F32 (48,36%), 91 en Q4_K (21,26%), 90 en IQ3_XXS (21,03%), 24 en Q3_K (5,61%), 10 en Q6_K (2,34%) y 6 en Q5_K (1,40%).

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo de hasta 128.000 tokens.
- Razonamiento explícito y resolución de problemas matemáticos.
- Generación y comprensión de código.
- Tool calling y function calling nativo, con resultados destacados en benchmarks agénticos según la model card del autor.
- Razonamiento multi-paso y flujos agénticos autónomos.
- Soporte multilingüe en 16 idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués, italiano, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Inferencia de baja latencia gracias al backbone convolucional con caché de estado constante.
- Compatible con endpoints y con el ecosistema llama.cpp.

## Casos de uso

- **Atención al cliente automatizada:** el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a sus 128.000 tokens de contexto, manteniendo coherencia en sesiones largas sin degradación apreciable de latencia por el uso de convoluciones lineales.
- **Agentes autónomos con herramientas:** su soporte nativo de tool calling y su rendimiento en benchmarks agénticos lo hacen adecuado para orquestar llamadas a APIs, consultas a bases de datos y ejecución de acciones encadenadas en pipelines de automatización.
- **Asistente de código en local:** con 2B de parámetros activos y un GGUF de 9,64 GB, puede desplegarse en estaciones de trabajo con GPU de consumo para autocompletado, revisión de código y generación de tests dentro del IDE.
- **Razonamiento matemático y análisis:** útil para resolver problemas paso a paso, verificar cálculos y generar explicaciones detalladas en entornos educativos o de auditoría técnica.
- **Procesamiento de documentos largos:** la ventana de 128K permite resumir, extraer información y responder preguntas sobre contratos, informes o expedientes completos en una sola pasada.
- **Atención multilingüe:** con 16 idiomas soportados, sirve para traducción, moderación de contenido y soporte a usuarios en mercados internacionales sin necesidad de modelos separados por idioma.
- **Despliegue en edge o en hardware limitado:** la edición NanoPlus (8,15 GB) y la MiniPlus (9,64 GB) permiten ejecutar el modelo en portátiles con GPU de 8-12 GB o en servidores sin aceleradores de gama alta, algo inviable con el BF16 original de 47,96 GB.

## Benchmarks y rendimiento

La model card del autor de la cuantización cita resultados oficiales de Liquid AI para el modelo base, pero solo proporciona cifras parciales. Los datos disponibles son:

| Benchmark | LFM2.5-24B-A2B | Qwen3.6-35B-A3B |
|---|---|---|
| LiveClaw | 48,09 | 38,19 |

El resto de resultados (MMLU, HumanEval, GSM8K, BFCL v4, etc.) no se detallan numéricamente en la información proporcionada; la model card remite a una imagen de benchmarks sin desglose textual. No se han publicado en la información disponible resultados de benchmarks específicos de la cuantización APEX-I-MiniPlus V2.1 frente al modelo en BF16.

## Requisitos de hardware

- **VRAM estimada para inferencia:** aproximadamente 9-10 GB para la edición MiniPlus V2.1 (9,64 GB de pesos) y 8-9 GB para la NanoPlus (8,15 GB), más overhead de contexto KV y buffers de llama.cpp.
- **GPU recomendadas:** RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), RTX 3090 (24 GB), L4 (24 GB), A10G (24 GB). Para despliegues de mayor concurrencia, A100 o H100.
- **¿Cabe en GPU de consumo?** Sí. La MiniPlus V2.1 cabe en GPUs de 12 GB o más con contexto moderado; la NanoPlus está pensada para GPUs de 8 GB. Con contexto completo de 128K será necesario reducir el tamaño de la caché KV o usar GPU de 16-24 GB.
- **Opciones de despliegue:** llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI mediante llama.cpp, y cualquier runtime que acepte GGUF. No se menciona soporte nativo de vLLM o TGI para este formato en la información disponible.
- **Latencia y throughput:** la model card del modelo base afirma que es hasta 1,7 veces más rápido que alternativas densas y dispersas de mayor tamaño en dispositivos edge, con una sobrecarga de TTFT cercana a cero gracias al backbone convolucional. No se proporcionan cifras absolutas de tokens por segundo para esta cuantización concreta.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B (APEX-I-MiniPlus V2.1) | 24B / 2B | 128K | LFM 1.0 | GGUF (9,64 GB) | Híbrido conv + atención, tool calling destacado |
| Qwen3.6-35B-A3B | 35B / 3B | no disponible | no disponible | no disponible | Referenciado en la model card; superado en LiveClaw (38,19 vs 48,09) |
| LFM2.5-24B-A2B APEX-I-NanoPlus | 24B / 2B | 128K | LFM 1.0 | GGUF (8,15 GB) | Misma base, cuantización más agresiva para GPUs de 8 GB |
| LFM2.5-24B-A2B BF16 (original) | 24B / 2B | 128K | LFM 1.0 | safetensors (47,96 GB) | Referencia de calidad sin pérdida por cuantización |

No se dispone en la información proporcionada de datos suficientes para comparar con otras alternativas MoE de tamaño similar (por ejemplo, variantes de la familia Mixtral o Qwen) en parámetros, contexto y rendimiento simultáneamente.

## Limitaciones y advertencias

- **Sesgos:** no se documentan en la información disponible; como todo modelo entrenado con corpus web multilingüe, es probable que herede sesgos culturales y de género presentes en los datos.
- **Alucinación:** no se han publicado evaluaciones específicas de tasa de alucinación para este modelo ni para esta cuantización.
- **Pérdida por cuantización:** la edición MiniPlus V2.1 usa cuantizaciones agresivas (IQ3_XXS y Q3_K en capas de expertos), lo que puede degradar ligeramente la calidad frente al BF16, especialmente en tareas de razonamiento fino y matemáticas. Los routers se mantienen en F32 para mitigar derivas de enrutamiento, pero no se ofrecen métricas comparativas de perplejidad o benchmarks entre cuantizaciones.
- **Contexto:** aunque el contexto nativo es de 128K, el uso completo requiere VRAM adicional para la caché KV; en GPUs de 8-12 GB habrá que limitar la longitud efectiva.
- **Licencia:** la licencia LFM 1.0 puede imponer restricciones al uso comercial. Es necesario revisar el texto completo en el enlace de licencia antes de desplegar en producción; la model card la etiqueta como "other".
- **Soporte de runtimes:** al ser un GGUF de un modelo híbrido con convoluciones lineales, conviene verificar que la versión de llama.cpp utilizada soporte la arquitectura; versiones antiguas pueden no cargar correctamente los tensores de convolución.
- **Mantenimiento:** la cuantización la mantiene un tercero (IsValorum), no Liquid AI; la calidad y la continuidad de las actualizaciones dependen de ese mantenedor.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/IsValorum/LFM2.5-24B-A2B-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia LFM 1.0: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Edición NanoPlus: https://huggingface.co/IsValorum/LFM2.5-24B-A2B-APEX-I-NanoPlus-GGUF
- Colección APEX-I-MiniPlus V2.1: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-standard-moe-6acfee77961c8c0cf5a083b5
- Colección APEX-I-NanoPlus: https://huggingface.co/collections/IsValorum/apex-i-nanoplus-standard-moe-6acfee79c288c5d8e7307785
- Matriz de importancia (imatrix) de m9ter1a: https://huggingface.co/m9ter1a/LFM2.5-24B-A2B-GGUF
- Apoyo al mantenedor: https://ko-fi.com/isvalorum

# benjzzz/DeepSeek-V4-Pro-671B-Gale-v3

## Resumen

DeepSeek-V4-Pro-671B-Gale-v3 es una versión cuantizada a 1 bit del modelo DeepSeek-V4-Pro, publicada por el usuario benjzzz en HuggingFace. El modelo base, desarrollado por DeepSeek, es un MoE de 1,6 billones de parámetros (49 mil millones activos) con una ventana de contexto de un millón de tokens, orientado a tareas de razonamiento y generación de código. Esta variante aplica el motor de compresión Gale v3, que reduce el peso de los expertos a aproximadamente 1,33 bits por peso (bpw) mediante transformadas rápidas de Walsh-Hadamard (FWHT-1024) y codificación delta de outliers, logrando un footprint total de unos 271 GB frente a los más de 1,3 TB del modelo en fp16/bf16.

La relevancia de esta ficha radica en que permite ejecutar un modelo de escala 671B en hardware de consumo: según la model card, el runtime con descarga dinámica de expertos requiere menos de 16 GB de VRAM para las capas activas y la caché KV de MLA. El repositorio incluye un runtime Python propio (`gale_inference.py`) con streaming de los 8 expertos principales, lo que lo convierte en una opción interesante para despliegues locales con recursos limitados, aunque no se han publicado benchmarks que verifiquen la calidad tras la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Multi-Head Latent Attention (MLA), 61 capas, 256 expertos enrutados + expertos compartidos |
| Parametros totales | 671B (según nombre del repo; el modelo base oficial DeepSeek-V4-Pro tiene 1,6T) |
| Parametros activos | no disponible (el modelo base oficial tiene 49B activos) |
| Longitud de contexto | 1M tokens (según modelo base, no confirmado en esta versión) |
| Tipos de cuantizacion | 1-bit Gale v3 (~1,33 bpw efectivo en expertos), FP8/FP16 en capas densas y atención |
| Idiomas soportados | en, zh |
| Licencia | deepseek-license (licencia propietaria de DeepSeek) |
| Formato de pesos | .pack (packed_v3), no safetensors |

## Arquitectura y entrenamiento

La arquitectura base es un Transformer MoE con 61 capas, atención Multi-Head Latent Attention (MLA) y 256 expertos enrutados más expertos compartidos. La cuantización Gale v3 aplica una rotación por bloques mediante FWHT-1024 a lo largo de la dimensión de entrada, seguida de signos binarios empaquetados con escalas por bloques de 128 columnas en fp16. Un 1% de los valores se codifica como outliers INT4 con escalado por fila, lo que eleva el bitwidth efectivo de los expertos a ~1,33 bpw. Las capas densas y de atención se mantienen en FP8/FP16 con matrices de proyección de bajo rango preservadas.

No se proporciona información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) ni sobre un posible fine-tuning posterior a la cuantización. El runtime incluido implementa la rotación FWHT-1024 y un streaming dinámico de los 8 expertos principales, lo que permite ejecutar el modelo con una huella de VRAM reducida.

## Capacidades

- Generación de texto y razonamiento multi-step, heredadas del modelo base DeepSeek-V4-Pro.
- Generación de código y soporte para tareas de programación, según las capacidades documentadas del modelo base.
- Procesamiento de contextos largos (hasta 1M tokens en el modelo base), útil para documentos extensos.
- Multilingüe limitado a inglés y chino (en, zh).
- Ejecución con streaming dinámico de expertos (top-8) mediante el runtime Gale, lo que permite inferencia en hardware con poca VRAM.
- No se confirma soporte de tool calling, function calling ni capacidades multimodales en esta versión cuantizada.

## Casos de uso

- Inferencia local de un modelo de 671B en GPU de consumo: gracias a la cuantización 1-bit y al streaming de expertos, se puede ejecutar en tarjetas con menos de 16 GB de VRAM, algo inviable con el modelo original en fp16.
- Generación de código en entornos sin acceso a la nube: el modelo base está optimizado para tareas de programación, y esta versión permite desplegarlo en estaciones de trabajo con una sola GPU.
- Análisis de documentos largos: con una ventana de contexto de 1M tokens (según el modelo base), puede procesar manuales técnicos, contratos o bases de conocimiento extensas en una sola pasada.
- Prototipado de agentes conversacionales en chino e inglés: el soporte bilingüe permite construir asistentes para mercados hispanohablantes que necesiten interactuar con fuentes en ambos idiomas.
- Evaluación de técnicas de cuantización extrema: el repositorio sirve como referencia para estudiar el impacto de la compresión 1-bit en modelos MoE de gran escala, comparando con versiones fp8 o sin cuantizar.
- Despliegue en entornos con restricciones de memoria: el runtime Python con offload dinámico de expertos permite ejecutar el modelo en servidores sin GPUs de alta gama, priorizando la latencia sobre el throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con el modelo base sin cuantizar. Tampoco se ofrecen datos de latencia o throughput del runtime Gale.

## Requisitos de hardware

- VRAM estimada: menos de 16 GB para la ejecución de capas activas y la caché KV de MLA, según la model card, gracias al streaming dinámico de expertos.
- GPU recomendadas: no especificadas; con <16 GB de VRAM cabrían modelos como RTX 4080, RTX 4090, A4000 o similares, aunque no hay confirmación oficial.
- Almacenamiento: el repositorio ocupa 71,2 GB, pero el footprint total de pesos es de ~271 GB, por lo que se necesita espacio en disco para los archivos .pack completos.
- Opciones de despliegue: runtime Python incluido (`gale_inference.py`); no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-671B-Gale-v3 (este) | 671B (según repo) | no disponible | 1M (base) | 1-bit Gale v3 | deepseek-license |
| DeepSeek-V4-Pro (original) | 1,6T | 49B | 1M | fp8/bf16 | deepseek-license |
| DeepSeek-V4-Flash | 284B | 13B | 1M | fp8/bf16 | deepseek-license |

La comparativa se basa en datos oficiales de DeepSeek y Microsoft Foundry. La versión cuantizada reduce drásticamente el footprint de memoria frente al original, pero a costa de una precisión potencialmente menor, no verificada con benchmarks. DeepSeek-V4-Flash es una alternativa más ligera sin cuantización extrema, aunque con menos capacidad total.

## Limitaciones y advertencias

- La cuantización 1-bit puede degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento complejo o matemáticas; no hay benchmarks que lo confirmen.
- El repositorio tiene 0 descargas y 0 likes, y el autor no es una entidad oficial de DeepSeek; se trata de un trabajo experimental de terceros.
- El tamaño del repo (71,2 GB) no coincide con el footprint declarado de ~271 GB, lo que sugiere que el repositorio podría estar incompleto o que los pesos se descargan bajo demanda.
- La licencia deepseek-license es propietaria y puede restringir el uso comercial o la redistribución; conviene revisar sus términos antes de usar el modelo en producción.
- Solo soporta inglés y chino; no hay capacidades multilingües más amplias.
- No se confirma soporte de tool calling, agentes ni funciones multimodales en esta versión.
- El runtime es un script Python propio, sin integración con frameworks estándar como vLLM u Ollama, lo que limita su adopción en entornos de producción.
- Riesgo de alucinación inherente a los modelos de lenguaje, posiblemente agravado por la cuantización extrema.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/benjzzz/DeepSeek-V4-Pro-671B-Gale-v3
- Sitio oficial de DeepSeek: https://deepseek.com/en/index.html
- Catálogo de modelos de Microsoft Foundry (DeepSeek-V4-Pro): https://ai.azure.com/catalog/models/DeepSeek-V4-Pro
- NVIDIA NIM (DeepSeek-V4-Pro): https://build.nvidia.com/deepseek-ai/deepseek-v4-pro
- Información de API de DeepSeek V4 Pro y Flash: https://deepseekv4.network/models
- Historial de versiones de DeepSeek: https://mungomash.com/ai/deepseek/versions/

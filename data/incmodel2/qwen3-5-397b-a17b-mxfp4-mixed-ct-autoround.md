# INCModel2/Qwen3.5-397B-A17B-MXFP4-Mixed-CT-AutoRound

## Resumen

El modelo `INCModel2/Qwen3.5-397B-A17B-MXFP4-Mixed-CT-AutoRound` es una versión cuantizada del Qwen3.5-397B-A17B, el mayor modelo multimodal de Alibaba Cloud, desarrollado por el equipo de Intel mediante la herramienta de cuantización `auto-round`. Se trata de un modelo de mezcla de expertos (MoE) con arquitectura híbrida de "gated delta networks" que combina atención lineal y capas de mezcla de expertos, con 397 000 millones de parámetros totales y 17 000 millones activos por token. Este checkpoint concreto aplica cuantización MXFP4 a las capas de expertos y mantiene otras capas en precisión mixta, reduciendo el tamaño del repositorio a 222,1 GB (frente a los ~800 GB del BF16) y permitiendo su despliegue en entornos con menos VRAM.

La relevancia de este modelo radica en que ofrece una alternativa eficiente para ejecutar un modelo multimodal de gran escala en GPUs de gama alta, con una degradación de rendimiento mínima (99,5% relativo al BF16 en los benchmarks publicados). Está pensado para desarrolladores que necesitan desplegar capacidades de visión y lenguaje en producción con requisitos de hardware más asequibles, manteniendo una ventana de contexto de 128 000 tokens y compatibilidad con vLLM y otras herramientas de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con gated delta networks (atención lineal + mezcla de expertos) |
| Parametros totales | 403 397 928 944 (~403,4 B) |
| Parametros activos | 17 B (dato del modelo base) |
| Longitud de contexto | 131 072 tokens (128 K) |
| Tipos de cuantizacion | MXFP4 (capas de expertos), precisión mixta en el resto (BF16/MXFP8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato llm_compressor) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-397B-A17B emplea una arquitectura MoE con 512 expertos y un diseño híbrido denominado "gated delta networks", que combina mecanismos de atención lineal con capas de mezcla de expertos. Esta arquitectura permite activar solo 17 000 millones de parámetros por token, lo que reduce el coste computacional en inferencia. El modelo es multimodal, acepta entradas de imagen y texto, y ha sido entrenado por Alibaba Cloud (febrero de 2026) con técnicas de alineación y ajuste fino para razonamiento, código y tareas de agente.

El checkpoint cuantizado se genera mediante `auto-round` de Intel, un método de cuantización post-entrenamiento basado en redondeo con descenso de gradiente firmado (paper arXiv:2309.05516). El proceso aplica un esquema MXFP8 general, pero configura las capas de expertos con 4 bits en formato MXFP (de ahí el nombre MXFP4-Mixed). Las capas de visión, embeddings, atención y otras se mantienen en precisión más alta (BF16 o MXFP8) para preservar la calidad. El resultado es un modelo con un tamaño de 222,1 GB en disco, apto para servir con vLLM.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo matemáticas y lógica (GSM8K 0,9719, MMLU 0,8809 en la versión cuantizada).
- Comprensión de imágenes y diálogo multimodal (pipeline image-text-to-text), capaz de procesar entradas visuales junto con texto.
- Soporte de modo "thinking" (razonamiento encadenado) activable mediante `enable_thinking` en la plantilla de chat.
- Capacidades de agente y RAG (recuperación aumentada) según la documentación de NVIDIA NIM para el modelo base.
- Ventana de contexto de 128 000 tokens, adecuada para documentos largos y conversaciones multi-turno.
- Multilingüismo probable (el modelo base de Qwen soporta múltiples idiomas), aunque no se especifica en la información disponible.
- Compatibilidad con vLLM y otras herramientas de inferencia estándar.

## Casos de uso

- Atención al cliente automatizada con soporte visual: el modelo puede analizar capturas de pantalla o imágenes de productos y mantener conversaciones de múltiples turnos con contexto largo (128 K tokens), resolviendo incidencias técnicas o dudas de facturación.
- Análisis de documentos técnicos y científicos: gracias a su capacidad multimodal y de razonamiento, puede extraer información de gráficos, tablas y figuras en PDFs, generando resúmenes o respondiendo preguntas específicas.
- Generación de código asistida en entornos de desarrollo: con su capacidad de razonamiento y programación, puede sugerir implementaciones, depurar errores y explicar fragmentos de código, integrándose en IDEs o pipelines de CI/CD.
- Agentes autónomos para automatización de tareas: su soporte de agentes y razonamiento multi-paso permite construir asistentes que planifican y ejecutan acciones en entornos simulados o reales (navegación web, manejo de APIs).
- Sistemas de recuperación aumentada (RAG) a gran escala: la ventana de 128 K tokens permite indexar y consultar grandes volúmenes de texto e imágenes, respondiendo con precisión sobre bases de conocimiento corporativas.
- Asistencia educativa y tutoría personalizada: puede explicar conceptos matemáticos o científicos, resolver problemas paso a paso y adaptar las respuestas al nivel del usuario, aprovechando su alto rendimiento en GSM8K y MMLU.
- Investigación biomédica: análisis de imágenes médicas (radiografías, histologías) combinado con literatura científica, ayudando a formular hipótesis o resumir hallazgos.

## Benchmarks y rendimiento

La model card proporciona la siguiente tabla comparativa entre la versión BF16 original y la cuantizada MXFP4:

| Configuracion | GSM8K | MMLU | PIQA | HelleSwag | Media | Relativo a BF16 |
|---|---|---|---|---|---|---|
| BF16 | 0,9765 | 0,8856 | 0,8303 | 0,7423 | 0,8587 | - |
| MXFP4 | 0,9719 | 0,8809 | 0,8292 | 0,7355 | 0,8544 | 99,5% |

Además, el modelo base (no cuantizado) alcanza según fuentes externas MMLU-Pro 87,8%, GPQA Diamond 88,4%, SWE-bench Verified 80,0% y Terminal-Bench 2.0 54,0%. Estos datos corresponden al modelo original y sirven como referencia del potencial máximo; la versión cuantizada mantiene una degradación inferior al 1% en los benchmarks publicados.

## Requisitos de hardware

- El repositorio ocupa 222,1 GB, por lo que se necesitan al menos 4 GPUs con 80 GB de VRAM (por ejemplo, A100 80GB, H100 80GB) para cargar el modelo completo en memoria con vLLM usando `--tensor-parallel-size 4`.
- Con cuantización MXFP4, el modelo en memoria ocupa aproximadamente 222 GB, más la memoria adicional para la caché KV (dependiendo de la longitud de contexto y el tamaño de lote).
- No cabe en una GPU consumer típica (RTX 4090 con 24 GB); se requieren configuraciones multi-GPU o el uso de técnicas de offloading (p. ej., llama.cpp con CPU+GPU) si se convierte a GGUF, aunque no se proporciona ese formato.
- Opciones de despliegue: vLLM (recomendado en la model card), TGI, y posiblemente llama.cpp si se convierte el modelo a GGUF.
- La latencia y el throughput no se han publicado; con 4×80GB y vLLM se puede esperar un rendimiento razonable para inferencia en tiempo real, pero depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-397B-A17B (BF16) | 397 B | 17 B | 128 K | BF16 | Apache 2.0 | HuggingFace |
| Este modelo (MXFP4) | 403 B (peso real) | 17 B | 128 K | MXFP4 mixto | Apache 2.0 | HuggingFace |
| Qwen3.5-397B-A17B-FP8 (oficial) | 397 B | 17 B | 128 K | FP8 | Apache 2.0 | HuggingFace (recomendado por vLLM) |

No se dispone de datos de rendimiento para la variante FP8 oficial en la información proporcionada, pero se recomienda para eficiencia de servicio. La comparativa con otros modelos multimodales de tamaño similar (p. ej., Llama 3.2 90B o Qwen2.5-VL-72B) no está disponible en las fuentes consultadas.

## Limitaciones y advertencias

- La cuantización MXFP4 introduce una degradación del 0,5% en la media de los benchmarks publicados, lo que puede ser relevante en tareas de alta precisión.
- El modelo puede producir salidas factualmente incorrectas; no debe utilizarse como fuente de verdad en aplicaciones críticas sin verificación humana.
- Puede generar contenido sesgado, ofensivo o inapropiado, tal como advierte la model card; se recomienda realizar pruebas de seguridad antes de desplegarlo.
- El tamaño del modelo (222 GB) requiere infraestructura de GPUs de gama alta; no es adecuado para entornos con recursos limitados.
- No se especifican los idiomas soportados; aunque el modelo base es multilingüe, la versión cuantizada podría tener variaciones en rendimiento para idiomas menos representados.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la licencia del modelo original (también Apache 2.0) y no constituye asesoramiento legal; se recomienda consultar a un abogado para usos comerciales.
- La generación del modelo requiere el uso de `auto-round` con parámetros específicos; replicar el proceso puede requerir conocimientos avanzados de cuantización.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/INCModel2/Qwen3.5-397B-A17B-MXFP4-Mixed-CT-AutoRound)
- [Modelo base Qwen3.5-397B-A17B](https://huggingface.co/Qwen/Qwen3.5-397B-A17B)
- [Repositorio auto-round de Intel](https://github.com/intel/auto-round)
- [Paper de optimización de redondeo (arXiv:2309.05516)](https://arxiv.org/abs/2309.05516)
- [Variante con atención MXFP8](https://huggingface.co/INCModel2/Qwen3.5-397B-A17B-MXFP4-Mixed-MXFP8Attn-CT-AutoRound)
- [Intel Neural Compressor](https://github.com/intel/neural-compressor)
- [Guía de vLLM para Qwen3.5](https://recipes.vllm.ai/Qwen/Qwen3.5-397B-A17B)

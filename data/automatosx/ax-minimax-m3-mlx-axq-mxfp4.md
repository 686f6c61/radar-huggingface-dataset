# AutomatosX/AX-MiniMax-M3-MLX-AXQ-MXFP4

## Resumen

AX-MiniMax-M3-MLX-AXQ-MXFP4 es un pack de cuantización experimental en formato MLX del modelo MiniMax-M3, desarrollado por AutomatosX para Apple Silicon. Se trata de una conversión del modelo original BF16 de MiniMax que aplica cuantización AXQ en formato MXFP4 de 4 bits, reduciendo drásticamente el peso del modelo a costa de una fidelidad no certificada. El pack está pensado para curiosidad y uso experimental, no para producción.

El modelo base MiniMax-M3 es un modelo multimodal nativo de MiniMax con aproximadamente 428 mil millones de parámetros totales y 23 mil millones de parámetros activos en arquitectura MoE. Su característica más destacada es la ventana de contexto de 1 millón de tokens, conseguida mediante la atención dispersa MiniMax Sparse Attention (MSA), que mejora la eficiencia en contextos largos. M3 integra entrenamiento multimodal desde el primer paso, fusionando texto, imagen y vídeo, y se posiciona como el primer modelo open-weight que combina rendimiento de vanguardia en código, multimodalidad nativa y contexto de millón de tokens.

Este pack concreto solo cubre la ruta de lenguaje; la parte de visión permanece en BF16, lo que limita su uso práctico a tareas de texto. La licencia es la misma que la del modelo upstream de MiniMax, copiada en el repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con atención dispersa MiniMax Sparse Attention (MSA) |
| Parametros totales | ~428 mil millones (modelo base); 81 101 740 416 en el pack cuantizado |
| Parametros activos | ~23 mil millones |
| Longitud de contexto | 1 000 000 tokens |
| Tipos de cuantizacion | MXFP4 (4 bits) mediante AXQ, vision en BF16 |
| Idiomas soportados | Inglés y chino |
| Licencia | other (licencia upstream de MiniMax copiada en el repositorio) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

MiniMax-M3 emplea una arquitectura MoE con atención dispersa propietaria denominada MiniMax Sparse Attention (MSA), diseñada para escalar el contexto hasta 1 millón de tokens sin un coste cuadrático en memoria y cómputo. El entrenamiento es multimodal desde el primer paso, lo que permite una fusión semántica profunda entre texto, imagen y vídeo. El modelo base se distribuye en BF16 y el pack de AutomatosX lo convierte a MLX con cuantización AXQ MXFP4 de 4 bits, usando un fichero `ax_expert_stream.json` para gestionar el stream de expertos. La conversión se realizó con una versión específica de git (`2f4e4e49b82463ac9e146090020a9565c8583253`) en una máquina Mac Studio M2. El pack no está certificado por AutomatosX y no se certificará en esta revisión.

## Capacidades

- Generación de texto en inglés y chino con razonamiento avanzado.
- Soporte de tool calling y function calling, orientado a tareas agénticas.
- Capacidad de razonamiento multi-paso y planificación para flujos de agente.
- Ventana de contexto de 1 millón de tokens, adecuada para repositorios completos, documentos largos y conversaciones prolongadas.
- Multimodalidad nativa en el modelo base (texto, imagen y vídeo), aunque en este pack la parte de visión permanece en BF16 y no está cuantizada.
- Uso de atención dispersa MSA para eficiencia en contextos largos.
- El pack MLX está optimizado para Apple Silicon, con soporte de streaming de expertos (stream required).

## Casos de uso

- Análisis de repositorios completos: gracias a la ventana de 1M tokens, el modelo puede ingerir un repositorio completo y responder preguntas sobre arquitectura, dependencias o bugs sin necesidad de dividir el contexto en fragmentos.
- Asistente de programación en producción: con soporte de tool calling, se puede integrar en pipelines de CI/CD para generar código, revisar pull requests o autocompletar funciones, siempre que se acepte la licencia upstream.
- Agente autónomo de tareas multi-paso: el modelo puede planificar y ejecutar secuencias de acciones con herramientas externas (navegador, terminal, APIs) en flujos agénticos.
- Procesamiento de documentos legales o técnicos extensos: su contexto de 1M tokens permite resumir y extraer información de contratos, informes o especificaciones de cientos de páginas.
- Traducción y generación de contenido bilingüe (inglés-chino): aprovechando su entrenamiento multilingüe para tareas de localización y redacción técnica.
- Experimentación en Apple Silicon con cuantización MXFP4: para investigadores que quieren evaluar el comportamiento de cuantizaciones de 4 bits en modelos MoE de gran escala, sin necesidad de hardware de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. El fabricante MiniMax indica que el modelo alcanza un rendimiento de frontera en tareas de código y agénticas, y que es el primer modelo open-weight que combina código de frontera, multimodalidad nativa y contexto de millón de tokens, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.) en las fuentes revisadas.

## Requisitos de hardware

- Este pack está diseñado exclusivamente para Apple Silicon (MLX), no para GPUs NVIDIA o AMD.
- El tamaño del repositorio es de 233 GB, por lo que requiere un SSD con al menos 250 GB libres y memoria unificada suficiente. Con cuantización MXFP4 de 4 bits, el modelo necesita aproximadamente 40-45 GB de memoria unificada para cargar los pesos de lenguaje, más el espacio para la parte de visión en BF16 si se usa.
- Recomendado: Mac Studio M2 Ultra o MacBook Pro M3 Max con 64 GB o más de memoria unificada.
- El modelo no cabe en Macs de gama media (16-32 GB) sin streaming de pesos desde disco, aunque el pack indica "stream required".
- Para inferencia, se puede usar MLX, MLX-LM o cualquier framework compatible con MLX. No es compatible con vLLM, llama.cpp, Ollama o TGI.
- El throughput dependerá del número de expertos activos (23B) y de la eficiencia de la atención dispersa, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M3 (base) | 428B total, 23B activos | 1M tokens | Texto, imagen, vídeo | other | open-weight |
| DeepSeek-V3 | 671B total, 37B activos | 128K tokens | Texto | MIT | open-weight |
| Qwen2.5-Max | No disponible | No disponible | Texto, imagen | Apache 2.0 (parcial) | API y open-weight |

La comparativa se basa en el modelo base, ya que el pack cuantizado no tiene equivalencia directa con otras versiones. MiniMax-M3 destaca por su contexto de 1M tokens y multimodalidad nativa, mientras que DeepSeek-V3 ofrece mayor tamaño de activos y licencia MIT, y Qwen2.5-Max tiene una licencia más permisiva pero menos contexto.

## Limitaciones y advertencias

- Pack experimental no certificado: AutomatosX no certifica este pack en esta revisión; es para curiosidad y hobby, no para producción.
- La cuantización MXFP4 de 4 bits puede degradar la calidad de la generación en comparación con el modelo BF16 original.
- La parte de visión permanece en BF16 y no está cuantizada, lo que aumenta el tamaño total y puede causar incompatibilidades de memoria.
- Requiere streaming de pesos desde disco ("stream required"), lo que implica latencia adicional en cada llamada.
- La licencia es la de MiniMax (other), que puede tener restricciones de uso comercial; se debe revisar el texto de la licencia en el repositorio antes de usar.
- Idiomas limitados a inglés y chino; no hay soporte multilingüe más allá de estos.
- Riesgo de alucinación inherente a modelos de texto de gran escala, especialmente en tareas de razonamiento de larga duración.
- El tamaño del repositorio (233 GB) hace que la descarga sea costosa en ancho de banda y tiempo.

## Enlaces

- HuggingFace del pack: https://huggingface.co/AutomatosX/AX-MiniMax-M3-MLX-AXQ-MXFP4
- Modelo base en HuggingFace: https://huggingface.co/MiniMaxAI/MiniMax-M3
- Repositorio GitHub de MiniMax-M3: https://github.com/MiniMax-AI/MiniMax-M3/
- Página del producto MiniMax M3: https://www.minimax.io/models/text/m3
- Documentación en DocsBot: https://docsbot.ai/models/minimax-m3
- Catálogo de modelos MLX de AutomatosX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog

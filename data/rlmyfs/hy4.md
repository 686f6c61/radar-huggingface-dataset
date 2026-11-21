# rlmyfs/Hy4

## Resumen

Hy4 es un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Tencent Hy. Su columna vertebral lingüística cuenta con 770 mil millones de parámetros totales, de los cuales se activan 49 mil millones por token (más 1,23 mil millones para visión). Soporta comprensión de texto, imagen y vídeo, lo que lo sitúa en la categoría de modelos image-text-to-text de gran escala.

La arquitectura combina atención dispersa de DeepSeek (Gated DSA) con IndexCache para reutilización de índices entre capas, conexiones residuales iHC con cuatro flujos, y un módulo de decodificación especulativa DFly2 de 3,3 mil millones de parámetros. La longitud de contexto alcanza 1.048.576 tokens (1M), lo que lo posiciona para tareas de contexto largo y agentes autónomos.

El repositorio publicado por `rlmyfs/Hy4` es una réplica del modelo oficial de Tencent (referenciado en la model card como `tencent/Hy4`) y ocupa 1.548,9 GB en formato safetensors. La licencia es la Tencent Hy License, que no es de código abierto estándar y requiere revisión para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención Gated DSA + MLA |
| Parámetros totales | 770B (backbone de lenguaje) + 1,23B (ViT) + 3,3B (DFly2) |
| Parámetros activos | 49B texto + 1,23B visión por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantización | GGUF disponible (repositorio `AngelSlim/Hy4-GGUF`); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License (license:other) |
| Formato de pesos | safetensors (transformers); GGUF en repo alternativo |

## Arquitectura y entrenamiento

El backbone de lenguaje consta de 78 capas: una capa densa inicial y 77 capas MoE. Cada capa MoE contiene 256 expertos enrutados y 1 experto compartido; cada token activa los 8 expertos enrutados principales más el compartido. El tamaño oculto es de 6.144 y el vocabulario de 120.832 tokens. El módulo de atención emplea Multi-head Latent Attention (MLA) con 64 cabezas, q_lora_rank de 2.048 y kv_lora_rank de 512, combinado con Gated DeepSeek Sparse Attention e IndexCache, que selecciona los 2.048 tokens más relevantes mediante un indexador de 32 cabezas y dimensión 128. Las conexiones residuales usan iHC (identity Hyper-Connections) con 4 flujos residuales.

El codificador visual (ViT) tiene 40 capas, tamaño oculto de 1.536, 16 cabezas de atención y parches de 16×16 con fusión de características 2×2, soportando resoluciones dinámicas de imagen y vídeo. El módulo DFly2 (5 capas, 3,3B parámetros) actúa como drafter de decodificación especulativa, reutilizando la caché KV y los índices dispersos de Hy4 para decodificación especulativa de contexto largo a coste constante. No se dispone de información sobre el volumen de tokens de entrenamiento, composición del dataset ni si se aplicaron RLHF/DPO.

## Capacidades

- Generación de texto, razonamiento y comprensión multimodal de imagen y vídeo.
- Comprensión de imágenes con resolución dinámica mediante ViT y adaptador a tokens visuales.
- Comprensión de vídeo a través de fotogramas convertidos en tokens visuales.
- Uso de ordenador (computer use) y comprensión de interfaces visuales.
- Desarrollo frontend y de videojuegos (según casos de uso declarados en la model card).
- Flujos de trabajo financieros y de oficina.
- Investigación científica y I+D en IA.
- Asistente personal de horizonte largo (long-horizon personal assistant).
- Decodificación especulativa integrada (DFly2) para acelerar la inferencia en contexto largo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- **Uso de ordenador y automatización de interfaces**: el modelo puede interpretar capturas de pantalla y elementos de UI gracias a su codificador visual de resolución dinámica, lo que permite agentes que operan aplicaciones de escritorio o web.
- **Desarrollo frontend asistido**: con contexto de 1M tokens puede ingerir repositorios completos, documentación y capturas de diseño para generar o modificar código de interfaz de forma coherente.
- **Desarrollo de videojuegos**: análisis de recursos visuales, generación de lógica de juego y comprensión de capturas de pantalla del motor para tareas de depuración o generación de contenido.
- **Análisis de documentos financieros y de oficina**: procesamiento de informes extensos, tablas e imágenes escaneadas en una sola ventana de contexto, útil para extracción y resumen de datos.
- **Investigación científica y R&D en IA**: revisión de literatura técnica, análisis de figuras y tablas de papers, y asistencia en experimentación con contexto largo.
- **Asistente personal de horizonte largo**: gestión de tareas multi-paso con memoria de conversaciones extensas (hasta 1M tokens), adecuado para planificación y seguimiento continuo.
- **Atención al cliente multimodal**: gestión de conversaciones multi-turno con imágenes o vídeo adjuntos, aprovechando la ventana de contexto amplia para mantener el historial completo.

## Benchmarks y rendimiento

Resultados de evaluación few-shot del modelo base (pretrain), según la model card:

| Categoría | Benchmark | Shots | Hy4 Base | Hy4 flash Base | Hy3 preview Base | DeepSeek-V4-flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---:|---:|---:|---:|---:|---:|
| Conocimiento | MMLU | 5 | 91,6 | 88,7 | 87,5 | 89,7 | 91,1 |
| Conocimiento | MMLU-Pro | 5 | 73,9 | 71,1 | 65,8 | 68,6 | 73,4 |
| Conocimiento | MMLU-Redux | 5 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card referencia además una gráfica de bits-per-byte (BPB) en validación interna de código y agentes, pero no se proporcionan los valores numéricos. No se han publicado en la información disponible resultados de benchmarks de instrucción (HumanEval, GSM8K, etc.) ni comparativas completas más allá de las filas mostradas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 770B parámetros totales, en precisión completa (BF16) se requieren aproximadamente 1,5 TB de VRAM, lo que exige múltiples nodos. En cuantización de 8 bits, alrededor de 770 GB; en 4 bits, alrededor de 385 GB. Estas cifras son estimaciones a partir del número de parámetros y no están confirmadas en la información disponible.
- **GPU recomendadas**: para despliegue en BF16 se necesitan clústeres multi-GPU (H100 80GB, A100 80GB en configuraciones de 16-24 GPUs). Para cuantizaciones agresivas podrían usarse configuraciones de 8×H100 o similares.
- **Consumer GPU**: no cabe en GPU de consumo (RTX 4090, 24 GB) ni siquiera en cuantizaciones extremas, dado el tamaño del modelo.
- **Opciones de despliegue**: vLLM y SGLang (mencionados en la model card), con soporte de decodificación especulativa DFly2. Existe repositorio GGUF (`AngelSlim/Hy4-GGUF`) para llama.cpp/Ollama, aunque el tamaño hace inviable su ejecución en hardware de consumo.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | MMLU (5-shot) | MMLU-Pro (5-shot) |
|---|---|---:|---:|---|---:|---:|
| Hy4 (Tencent) | 770B (+1,23B ViT +3,3B DFly2) | 49B + 1,23B visión | 1M | Tencent Hy License | 91,6 | 73,9 |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible | no disponible | 91,1 | 73,4 |
| DeepSeek-V4-flash | no disponible | no disponible | no disponible | no disponible | 89,7 | 68,6 |
| Hy3 preview | no disponible | no disponible | no disponible | no disponible | 87,5 | 65,8 |

Hy4 supera ligeramente a DeepSeek-V4-Pro en MMLU (91,6 frente a 91,1) y MMLU-Pro (73,9 frente a 73,4), y de forma más clara a las variantes flash y a Hy3 preview. No se dispone de datos de contexto, licencia ni arquitectura de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- **Licencia restrictiva**: la Tencent Hy License no es una licencia de código abierto estándar; es necesario revisar sus términos para uso comercial, redistribución y despliegue en producción.
- **Riesgo de alucinación**: no se documenta en la información disponible, pero es inherente a modelos de este tipo; se recomienda verificación en dominios críticos.
- **Sesgos conocidos**: no disponibles en la información proporcionada.
- **Idiomas soportados**: no especificados; no se puede confirmar cobertura multilingüe más allá de lo indicado en la model card (inglés y chino en la documentación).
- **Requisitos de hardware extremos**: 1.548,9 GB de pesos en safetensors y ~1,5 TB de VRAM en BF16 limitan el despliegue a infraestructura de clúster.
- **Repositorio no oficial**: `rlmyfs/Hy4` es una réplica con 0 descargas y 0 likes; la fuente canónica es `tencent/Hy4`. Verificar integridad de pesos antes de usar.
- **Datos de benchmarks incompletos**: solo se publican MMLU y MMLU-Pro en la información disponible; no hay resultados de instrucción, código ni matemáticas.
- **Caveat de producción**: la decodificación especulativa DFly2 requiere integración específica en vLLM/SGLang; no está claro su soporte en otros frameworks.

## Enlaces

- Hugging Face (réplica): https://huggingface.co/rlmyfs/Hy4
- Hugging Face (oficial): https://huggingface.co/tencent/Hy4
- Licencia: https://huggingface.co/tencent/Hy4/blob/main/LICENSE
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4
- Web oficial: https://hy.tencent.ai/research/hy4
- GitHub: https://github.com/Tencent-Hunyuan/Hy4
- GGUF: https://huggingface.co/AngelSlim/Hy4-GGUF
- Paper Gated DeepSeek Sparse Attention: https://arxiv.org/abs/2512.02556
- Paper IndexCache: https://arxiv.org/abs/2603.12201
- Artículo iHC: https://zhuanlan.zhihu.com/p/2010852389670908320

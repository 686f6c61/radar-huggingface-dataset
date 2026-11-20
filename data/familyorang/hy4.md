# FamilyOrang/Hy4

## Resumen

Hy4 es un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Tencent Hy. Su columna vertebral lingüística cuenta con 770B parámetros totales, de los cuales se activan 49B por token, y está diseñada para comprender texto, imagen y vídeo. El modelo se distribuye bajo la licencia Tencent Hy License y se publica en formato safetensors para la librería transformers, con un pipeline de image-text-to-text.

La arquitectura combina atención dispersa gated de estilo DeepSeek (Gated DSA) con reutilización de índices entre capas (IndexCache), conexiones residuales iHC con cuatro flujos y un codificador visual ViT de 40 capas que admite resoluciones dinámicas. Incorpora además un drafter de decodificación especulativa DFly2 de 3,3B parámetros que reutiliza la caché KV y los índices dispersos del modelo principal.

Su relevancia radica en la combinación de una ventana de contexto de 1M tokens con un coste de decodificación especulativa constante, orientada a tareas de agente de horizonte largo, uso de ordenador (computer use), desarrollo frontend y flujos de trabajo de oficina y finanzas. El repositorio consultado es un espejo de terceros (FamilyOrang/Hy4) del modelo original de Tencent, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención Gated DSA + IndexCache y ViT |
| Parámetros totales | 770B (columna lingüística, excluyendo ViT, adaptador y DFly2); 774.434.002.142 según safetensors |
| Parámetros activos | 49B texto + 1,23B visión por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantización | No disponible en la información proporcionada (existe un repositorio GGUF de terceros: AngelSlim/Hy4-GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Tencent Hy License (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La columna lingüística consta de 78 capas: una capa densa inicial con FFN de tamaño intermedio 18.432 y 77 capas MoE. Cada capa MoE contiene 256 expertos enrutados y 1 experto compartido, con tamaño intermedio de experto de 2.048; cada token activa los 8 expertos enrutados principales más el experto compartido. El tamaño oculto es de 6.144 y el vocabulario de 120.832 tokens. Las conexiones residuales emplean iHC (identity Hyper-Connections) con 4 flujos residuales.

El módulo de atención usa Multi-head Latent Attention (MLA) con 64 cabezas, q_lora_rank de 2.048 y kv_lora_rank de 512, sobre una formulación de atención dispersa Gated DeepSeek Sparse Attention (Gated DSA). Un indexador con 32 cabezas de dimensión 128 selecciona los top-2.048 tokens de contexto, y la técnica IndexCache reutiliza los índices dispersos entre capas. El codificador visual ViT tiene 40 capas, tamaño oculto 1.536, tamaño intermedio 6.144, 16 cabezas de atención, parches de 16×16, embeddings posicionales de 128×128 y fusión de características visuales 2×2; un adaptador convierte las características de imagen y fotogramas de vídeo en tokens visuales. El drafter DFly2 (5 capas, 3,3B parámetros) reutiliza la caché KV y los índices dispersos del modelo principal para decodificación especulativa de contexto largo a coste constante.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Comprensión de texto, imagen y vídeo (pipeline image-text-to-text).
- Generación de texto conversacional en modo instruct.
- Razonamiento multi-paso y comportamiento orientado a agentes.
- Uso de ordenador (vision and computer use) según la model card.
- Desarrollo frontend y de videojuegos.
- Flujos de trabajo financieros y de oficina.
- Investigación científica e I+D en IA.
- Asistente personal de horizonte largo.
- Decodificación especulativa integrada mediante DFly2.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Uso de ordenador y automatización de interfaz: el modelo puede interpretar capturas de pantalla y vídeo para operar aplicaciones, aprovechando el ViT de resolución dinámica y la ventana de 1M tokens para mantener el historial completo de la sesión.
- Desarrollo frontend y de videojuegos: generación y revisión de código de interfaz a partir de bocetos o capturas, con contexto suficiente para mantener varios ficheros y el estado del proyecto en una sola ventana.
- Asistente personal de horizonte largo: gestión de tareas prolongadas con memoria de conversación extensa gracias al contexto de 1.048.576 tokens y a la decodificación especulativa de coste constante.
- Análisis de documentos financieros y flujos de oficina: procesamiento conjunto de texto, tablas e imágenes escaneadas en un único pipeline multimodal.
- Investigación científica e I+D: revisión de literatura y material gráfico (figuras, diagramas) con razonamiento multi-paso sobre corpus extensos.
- Atención al cliente multimodal: conversaciones multi-turno con adjuntos de imagen o vídeo, manteniendo el contexto de la sesión completa.
- Procesamiento de vídeo de larga duración: análisis de fotogramas convertidos a tokens visuales junto con texto en la misma ventana de contexto.

## Benchmarks y rendimiento

Resultados few-shot de preentrenamiento publicados en la model card (la tabla original está truncada en la información disponible):

| Categoría | Benchmark | Shots | Hy4 Base | Hy4 flash Base | Hy3 preview Base | DeepSeek-V4-flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---|:---:|---:|---:|---:|---:|
| Conocimiento | MMLU† | 5 | 91,6 | 88,7 | 87,5 | 89,7 | 91,1 |
| Conocimiento | MMLU-Pro† | 5 | 73,9 | 71,1 | 65,8 | 68,6 | 73,4 |
| Conocimiento | MMLU-Redux† | 5 | no disponible (tabla truncada) | no disponible | no disponible | no disponible | no disponible |

La model card incluye además una gráfica de bits-per-byte (BPB) en validación interna de código y agentes frente a parámetros activos, sin valores numéricos en el texto disponible. No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks de la sección de apéndice.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 770B parámetros totales, la inferencia en precisión completa requiere un clúster multi-GPU; el repositorio ocupa 1.548,9 GB en safetensors.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, se requiere hardware de centro de datos (A100, H100 o equivalentes) en configuración multi-nodo.
- ¿Cabe en GPU de consumo? No en precisión nativa; existe un repositorio GGUF de terceros (AngelSlim/Hy4-GGUF) que podría permitir cuantizaciones, pero no se dispone de datos de VRAM ni de calidad para esas variantes.
- Opciones de despliegue: vLLM y SGLang (secciones documentadas en la model card); también se menciona un repositorio GGUF.
- Latencia y throughput: no disponibles. La decodificación especulativa DFly2 está diseñada para contexto largo a coste constante, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4 | 770B (texto) + 1,23B ViT + 3,3B DFly2 | 49B texto + 1,23B visión | 1M | Tencent Hy License | Hugging Face, ModelScope, GitCode |
| Hy4 flash | No disponible | No disponible | No disponible | Tencent Hy License (presumible) | No disponible en la información |
| Hy3 preview | No disponible | No disponible | No disponible | No disponible | No disponible |
| DeepSeek-V4-flash | No disponible | No disponible | No disponible | No disponible | No disponible |
| DeepSeek-V4-Pro | No disponible | No disponible | No disponible | No disponible | No disponible |

Los modelos de la comparativa aparecen únicamente como referencias de benchmark en la model card; no se dispone de sus especificaciones técnicas en la información proporcionada.

## Limitaciones y advertencias

- La model card incluye una sección de limitaciones conocidas, pero su contenido no está disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos de gran escala.
- Idiomas soportados: no declarados; no se puede garantizar un rendimiento multilingüe uniforme.
- Licencia Tencent Hy License: es una licencia "other" con condiciones específicas; es imprescindible revisar el texto completo antes de cualquier uso comercial.
- El repositorio consultado (FamilyOrang/Hy4) es un espejo de terceros con 0 descargas y 0 likes; para producción conviene verificar el repositorio oficial de Tencent.
- El tamaño del repo (1.548,9 GB) implica requisitos de almacenamiento y transferencia considerables.
- No se dispone de información sobre sesgos, robustez ni evaluaciones de seguridad más allá de la referencia a un System Card en la model card.

## Enlaces

- Repositorio consultado: https://huggingface.co/FamilyOrang/Hy4
- Repositorio oficial (referenciado): https://huggingface.co/tencent/Hy4
- Licencia: https://huggingface.co/tencent/Hy4/blob/main/LICENSE
- README en chino: https://huggingface.co/tencent/Hy4/blob/main/README_CN.md
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4
- Web oficial: https://hy.tencent.ai/research/hy4
- GitHub: https://github.com/Tencent-Hunyuan/Hy4
- GGUF (terceros): https://huggingface.co/AngelSlim/Hy4-GGUF
- Paper Gated DeepSeek Sparse Attention: https://arxiv.org/abs/2512.02556
- Paper IndexCache: https://arxiv.org/abs/2603.12201
- Artículo sobre iHC: https://zhuanlan.zhihu.com/p/2010852389670908320

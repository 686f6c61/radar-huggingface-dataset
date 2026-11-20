# FamilyOrang/Hy4-flash-FP8

## Resumen

Hy4-flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado por Tencent, publicado bajo la licencia Tencent Hy. Acepta de forma nativa entradas de texto e imagen, genera texto y ofrece una ventana de contexto de hasta 1.048.576 tokens (1M). Su columna vertebral lingüística consta de 42 capas (una densa y 41 MoE) con 155.500 millones de parámetros en el backbone, a los que se suman 63.500 millones en embeddings N-gram (Engram), 430 millones del codificador visual y 850 millones del modelo borrador DFly2, hasta un total de 220.260 millones de parámetros. Solo se activan 11.300 millones de parámetros de texto (más 430 millones de visión) por token, lo que lo sitúa en la categoría de modelos MoE de bajo coste de inferencia.

La relevancia de esta variante FP8 (publicada por el usuario FamilyOrang a partir del modelo oficial de Tencent) reside en que reduce el peso del repositorio a 287,1 GB y permite desplegar un modelo de 220B en infraestructuras con memoria limitada, manteniendo las capacidades multimodales y de contexto largo. La arquitectura incorpora tres innovaciones destacadas frente a Hy4: atención híbrida (atención dispersa IndexPool intercalada con atención de ventana deslizante en proporción 1:3), LatentMoE con expertos en espacio latente de dimensión reducida y embeddings N-gram (Engram) recuperados mediante hash multicaBeza.

El modelo está pensado para cargas de trabajo de agente, código y razonamiento multimodal con contexto muy largo, y su licencia Tencent Hy impone condiciones específicas para uso comercial que conviene revisar antes de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal con atención híbrida (dispersa + ventana deslizante) y MLA |
| Parámetros totales | 220.260.270.502 (220,26B), incluyendo Engram, ViT y DFly2 |
| Parámetros activos | 11,3B texto + 0,43B visión por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantización | FP8 (esta variante); GGUF disponible en repositorio aparte (AngelSlim/Hy4-flash-GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License (license: other) |
| Formato de pesos | safetensors (FP8 cuantizado) |

## Arquitectura y entrenamiento

El backbone lingüístico tiene 42 capas: una capa densa con FFN de tamaño intermedio 13.824 y 41 capas MoE. Cada capa MoE contiene 512 expertos enrutados más un experto compartido; por token se activan 16 expertos enrutados. Los expertos operan en un espacio latente de dimensión 1.536 (LatentMoE), con tamaño intermedio de experto también de 1.536. El tamaño oculto es 3.072 y el vocabulario de 120.832 tokens. Las conexiones residuales usan iHC (identity Hyper-Connections) con 4 flujos residuales.

La atención es híbrida: se intercalan capas de atención dispersa (IndexPool, con selección de hasta 2.048 tokens a nivel de grupo) y capas de ventana deslizante (SWA) de 512 tokens causales (511 previos más el actual), con un patrón de 2 capas dispersas seguidas de 10 bloques de (3 SWA + 1 dispersa). La formulación es Multi-head Latent Attention (MLA) con q_lora_rank 1.024, kv_lora_rank 512, dimensión de cabeza QK de 192 + 64 (no-RoPE + RoPE) y dimensión de valor 256. Las capas dispersas usan 32 cabezas y RoPE base 10.000.000; las SWA usan 64 cabezas y RoPE base 10.000. El codificador visual (27 capas, hidden 1.152, intermedio 4.304, 16 cabezas, parches 16×16, fusión 2×2) se adapta de SigLIP2-So400m-Patch16-Res512 y se conecta al backbone mediante un proyector MLP. La codificación posicional multimodal es MRoPE intercalado.

El módulo Engram añade representaciones aprendidas de bigramas y trigramas recuperadas mediante búsquedas hash multicaBeza: 8 cabezas hash por orden, vocabulario hash de 10,3M por cabeza, dimensión de 768 por orden (8 × 96) y tablas de embedding de 63,4B parámetros, insertadas en las capas 1, 11, 21 y 31. El borrador DFly2 (5 capas, 0,85B) reutiliza la caché KV y los índices dispersos del modelo objetivo para decodificación especulativa de bajo coste constante en contexto largo. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento en contexto largo, con ventana de hasta 1M tokens.
- Comprensión de imágenes y respuesta multimodal (pipeline image-text-to-text) mediante codificador visual SigLIP2 adaptado.
- Generación de código y tareas de agente (el modelo card menciona validación interna de código y agente mediante BPB).
- Decodificación especulativa integrada mediante el borrador DFly2, que reutiliza caché KV e índices dispersos.
- Capacidades multilingües: no disponibles en la información proporcionada (el card incluye versión en chino e inglés, pero no se detalla la cobertura de idiomas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Despliegue mediante API compatible con OpenAI, vLLM y SGLang.

## Casos de uso

- Análisis de documentación técnica extensa: con 1M tokens de contexto, el modelo puede ingerir manuales, repositorios completos o expedientes largos y responder preguntas sobre ellos sin truncar el material, algo adecuado para auditoría de código y revisión de especificaciones.
- Agentes de código en pipelines de CI/CD: la combinación de capacidades de código, contexto largo y decodificación especulativa DFly2 permite revisar diffs, generar parches y razonar sobre múltiples archivos en una sola pasada, con menor latencia en contextos grandes.
- Asistencia multimodal en soporte técnico: el modelo acepta capturas de pantalla o diagramas junto con texto, de modo que puede diagnosticar errores a partir de imágenes de trazas o interfaces y mantener conversaciones multi-turno con historial largo.
- Procesamiento de documentos escaneados y formularios: al combinar visión y texto, puede extraer y razonar sobre información de facturas, contratos o informes con estructura compleja, integrado mediante API compatible con OpenAI.
- Investigación y análisis de literatura científica: con contexto de 1M tokens puede resumir y comparar colecciones de artículos, tablas y figuras en una única ventana, reduciendo la necesidad de fragmentación.
- Despliegue en infraestructura con memoria limitada: la variante FP8 reduce el repositorio a 287,1 GB, lo que permite servir el modelo en nodos multi-GPU con menos memoria que la versión BF16, manteniendo las capacidades del modelo completo.
- Generación aumentada por recuperación (RAG) sobre corpus masivos: la ventana de 1M tokens y la atención dispersa IndexPool permiten incluir grandes bloques de contexto recuperado sin degradar el coste de atención de forma lineal.

## Benchmarks y rendimiento

El model card menciona resultados de bits-per-byte (BPB) en validación interna de código y agente, y una sección de benchmarks en apéndice, pero los valores numéricos no están incluidos en la información proporcionada. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: el repositorio pesa 287,1 GB, por lo que se necesita al menos ese volumen de memoria agregada para cargar los pesos; con overhead de caché KV y activaciones, conviene prever un margen adicional.
- GPU recomendadas: nodos multi-GPU de centro de datos (A100 80GB, H100 80GB, H200) en configuraciones de 4 a 8 GPUs para FP8; no se especifican configuraciones oficiales en la información proporcionada.
- GPU de consumo: no cabe en una única GPU de consumo (RTX 4090 24GB, RTX 5090) en FP8; sería necesario recurrir a cuantizaciones GGUF más agresivas del repositorio AngelSlim/Hy4-flash-GGUF, cuyos requisitos exactos no están disponibles.
- Opciones de despliegue: transformers, vLLM, SGLang y API compatible con OpenAI; el model card incluye secciones específicas para vLLM y SGLang, y decodificación especulativa con DFly2.
- Latencia y throughput: no disponibles en la información proporcionada; DFly2 está diseñado para decodificación especulativa de coste constante en contexto largo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-FP8 (este) | 220,26B (155,5B backbone + 63,5B Engram + 0,43B ViT + 0,85B DFly2) | 11,3B texto + 0,43B visión | 1M | Tencent Hy License | Hugging Face, ModelScope, GitCode |
| Hy4 (referencia del card) | no disponible en detalle | no disponible | no disponible | Tencent Hy License | Hugging Face (tencent/Hy4-flash) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo con otros modelos; la comparativa se limita a la relación con Hy4 y a la variante GGUF del mismo modelo.

## Limitaciones y advertencias

- La licencia Tencent Hy (license: other) impone condiciones específicas; es obligatorio revisar el enlace de licencia antes de cualquier uso comercial.
- El repositorio es una publicación de terceros (FamilyOrang) sobre el modelo oficial de Tencent; conviene verificar la integridad y procedencia de los pesos FP8 frente al repositorio oficial.
- No se detallan los idiomas soportados, por lo que el rendimiento en castellano no está garantizado ni documentado.
- No hay información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad en la información proporcionada.
- El tamaño de 220B parámetros y 287,1 GB en FP8 implica requisitos de memoria muy elevados; el despliegue en una sola GPU no es viable en configuraciones de consumo.
- El contexto de 1M tokens, aunque soportado, puede degradar la calidad en los extremos de la ventana y aumentar el coste de memoria de la caché KV; no se aportan datos de rendimiento a esa longitud.
- No se dispone de información sobre tool calling, modo thinking ni cobertura multilingüe, lo que limita la evaluación para pipelines de agentes que dependan de estas funciones.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/FamilyOrang/Hy4-flash-FP8
- Hugging Face (modelo oficial): https://huggingface.co/tencent/Hy4-flash
- Hugging Face (variante GGUF): https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- Licencia: https://huggingface.co/tencent/Hy4-flash-FP8/blob/main/LICENSE
- Web oficial: https://hy.tencent.ai/research/hy4-flash
- GitHub: https://github.com/Tencent-Hunyuan/Hy4-flash
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4-flash
- README en chino: https://huggingface.co/tencent/Hy4-flash-FP8/blob/main/README_CN.md

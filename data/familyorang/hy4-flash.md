# FamilyOrang/Hy4-flash

## Resumen

Hy4-flash es un modelo de lenguaje multimodal desarrollado por Tencent Hunyuan, publicado originalmente bajo el identificador `tencent/Hy4-flash` y replicado aquí por el usuario FamilyOrang. Se trata de un transformer con arquitectura Mixture-of-Experts (MoE) de 220.251 millones de parámetros totales, de los cuales solo 12B están activos por token (11,3B de texto más 0,43B de visión). Acepta nativamente entradas de texto e imagen y genera texto, con una ventana de contexto de hasta 1.048.576 tokens (1M).

El modelo está diseñado como la variante "más rentable" de la familia Hy de Tencent. Introduce tres innovaciones arquitectónicas respecto a Hy4: atención híbrida (atención dispersa IndexPool intercalada con sliding-window attention en ratio 1:3), LatentMoE (expertos enroutados operando en espacio latente de baja dimensión, activando 16 de 512 expertos por token) y embedding N-gram (Engram) con representaciones de bigramas y trigramas recuperadas mediante búsqueda hash multi-cabeza.

Incluye además un drafter de decodificación especulativa integrado, DFly2 (0,85B parámetros), que reutiliza la caché KV y los índices dispersos del modelo objetivo para decodificación especulativa de contexto largo a coste constante y bajo. El repo pesa 440,5 GB y se distribuye en formato safetensors para transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida dispersa + SWA, MLA, iHC y Engram |
| Parámetros totales | 220.251.201.958 (155,5B backbone + 63,5B Engram + 0,43B ViT + 0,85B DFly2) |
| Parámetros activos | 12B por token (11,3B texto + 0,43B visión) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantización | no disponible (existe repo GGUF de terceros: AngelSlim/Hy4-flash-GGUF) |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (license:other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone lingüístico consta de 42 capas: 1 capa densa y 41 capas MoE. El hidden size es 3.072 y el vocabulario de 120.832 tokens. Las conexiones residuales usan iHC (identity Hyper-Connections) con 4 streams residuales. La atención combina 12 capas de atención dispersa (IndexPool, selección de hasta 2.048 tokens a nivel de grupo) y 30 capas de sliding-window attention (ventana causal de 512 tokens: 511 precedentes más el actual), intercaladas en patrón 2 × Sparse → 10 × (3 × SWA → Sparse). La formulación de atención es Multi-head Latent Attention (MLA) con q_lora_rank 1.024 y kv_lora_rank 512, dimensión de cabeza QK de 192 + 64 (non-RoPE + RoPE) y dimensión de value head de 256. El codificador posicional multimodal es MRoPE intercalado.

El bloque feed-forward combina una FFN densa (intermediate size 13.824) con capas MoE de 512 expertos enroutados y 1 experto compartido, activando 16 expertos enroutados por token. LatentMoE reduce la dimensión latente a 1.536, igual al intermediate size de cada experto. El módulo Engram añade representaciones de bigramas y trigramas en las capas 1, 11, 21 y 31, con 8 cabezas hash por orden N-gram, vocabulario hash de 10,3M por cabeza y dimensión de embedding de 768 por orden (8 cabezas × 96 dimensiones), totalizando 63,4B parámetros en tablas de embedding.

El codificador visual (27 capas, hidden size 1.152, intermediate size 4.304, 16 cabezas de atención, patch 16 × 16, embedding posicional de 128 × 128, fusión de features 2 × 2) está adaptado de SigLIP2-So400m-Patch16-Res512 y se conecta al backbone mediante un proyector MLP. El drafter DFly2 (5 capas, 0,85B) reutiliza la caché KV y los índices dispersos del modelo objetivo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto e instrucciones conversacionales (tag `instruct`).
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`).
- Razonamiento multilingüe (idiomas concretos no disponibles).
- Capacidad de contexto largo: ventana de 1M tokens.
- Decodificación especulativa de contexto largo mediante DFly2 a coste constante.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente (el model card menciona validación interna de "code & agent" en BPB).
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Análisis de documentos extensos: con 1M tokens de contexto, el modelo puede ingerir informes completos, contratos o bases de código y responder preguntas sobre ellos sin fragmentación, manteniendo coherencia entre secciones distantes.
- Procesamiento de documentos escaneados con OCR visual: gracias al codificador SigLIP2 y a la entrada image-text-to-text, puede extraer y razonar sobre texto contenido en imágenes, útil en digitalización de archivos y extracción de datos estructurados.
- Asistentes conversacionales de atención al cliente: la ventana de 1M tokens permite mantener historiales multi-turno muy largos y contexto de cliente persistente sin truncar, con decodificación especulativa que reduce la latencia en respuestas largas.
- Análisis de código en producción: el modelo puede integrarse en pipelines de revisión de código y generación de parches sobre repositorios grandes, aprovechando el contexto largo y la validación interna de código mencionada en el model card.
- Razonamiento sobre documentación técnica multimodal: combinación de diagramas, capturas de pantalla y texto en tareas de troubleshooting o asistencia a desarrolladores, usando la entrada conjunta de imagen y texto.
- Despliegue en entornos con restricciones de VRAM: al activar solo 12B parámetros por token, el coste de inferencia es sensiblemente menor que un modelo denso de 220B, lo que lo hace adecuado para servir con vLLM o SGLang en GPUs de alta gama pero no necesariamente multi-nodo.
- Investigación sobre arquitecturas MoE y atención híbrida: el modelo sirve como referencia reproducible para estudiar LatentMoE, Engram e iHC en condiciones reales de inferencia.

## Benchmarks y rendimiento

El model card incluye resultados de bits-per-byte (BPB) en validación interna de código y agentes (menor es mejor), pero los valores numéricos concretos no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo completo pesa 440,5 GB en safetensors. Con cuantización a 4 bits cabría estimar aproximadamente 110-130 GB, pero no se confirma en la información.
- GPU recomendadas: no disponible. Por tamaño (220B totales, 12B activos) requiere GPUs de alta gama tipo A100/H100 en configuraciones multi-GPU; no se especifican requisitos exactos.
- ¿Cabe en consumer GPU? No directamente en precisión completa; con cuantización GGUF (repo de terceros AngelSlim/Hy4-flash-GGUF) podría reducirse, pero no se confirman requisitos concretos.
- Opciones de despliegue: transformers, vLLM, SGLang, API compatible con OpenAI, decodificación especulativa con DFly2. Existe repo GGUF de terceros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash (este) | 220,25B | 12B | 1M | tencent-hy-license | Hugging Face, ModelScope, GitCode |
| Hy4 | no disponible | no disponible | no disponible | tencent-hy-license | Hugging Face (tencent/Hy4-flash) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativos con modelos de la misma categoría (MoE multimodal de ~200B con contexto de 1M), por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe fuera de los idiomas evaluados internamente.
- Riesgo de alucinación: no se documentan mitigaciones específicas ni tasas de error en la información disponible.
- Sesgos conocidos: no disponibles.
- Licencia `tencent-hy-license`: restricciones para uso comercial no detalladas en la información; debe consultarse el enlace de licencia antes de producción.
- Tamaño de repo de 440,5 GB: requiere almacenamiento y ancho de banda considerables para descarga y despliegue.
- Repositorio replicado por FamilyOrang: no es el repo oficial de Tencent; conviene verificar integridad y procedencia de los pesos.
- Cuantizaciones oficiales no documentadas; el GGUF disponible es de terceros y su calidad no está garantizada.
- Sin datos publicados de benchmarks estándar, lo que dificulta la evaluación comparativa previa a producción.
- Capacidad de tool calling y comportamiento agéntico no confirmados explícitamente en la información disponible.

## Enlaces

- Hugging Face (repo replicado): https://huggingface.co/FamilyOrang/Hy4-flash
- Hugging Face (repo oficial Tencent): https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- README en chino: https://huggingface.co/tencent/Hy4-flash/blob/main/README_CN.md
- Web oficial: https://hy.tencent.ai/research/hy4-flash
- GitHub: https://github.com/Tencent-Hunyuan/Hy4-flash
- GGUF (terceros): https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4-flash

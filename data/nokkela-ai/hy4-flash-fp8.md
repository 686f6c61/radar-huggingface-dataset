# nokkela-ai/Hy4-flash-FP8

## Resumen

Hy4-flash-FP8 es una versión cuantizada en FP8 del modelo Hy4 Flash de Tencent, un modelo multimodal de tipo mixture-of-experts (MoE) diseñado para generación de texto e imagen-a-texto. Con 220.260 millones de parámetros totales en safetensors (155,5B en el backbone, 63,5B en los embeddings Engram, 0,43B en el codificador visual ViT y 0,85B en el drafter DFly2), activa únicamente 11,3B parámetros de texto más 0,43B de visión por token, lo que lo sitúa en la categoría de modelos MoE de gran tamaño con coste de inferencia contenido.

La versión aquí descrita es un fork independiente publicado por nokkela-ai bajo el identificador `nokkela-ai/Hy4-flash-FP8`, derivado directamente de `tencent/Hy4-flash-FP8`. El fork mantiene la licencia original Tencent Hy License y conserva la arquitectura, pesos y pipeline del modelo base; su interés radica en la disponibilidad de una copia con cuantización FP8 ya aplicada, lista para su uso con transformers y compatible con endpoints, con despliegue regional en la UE.

El modelo resulta relevante ahora porque combina una ventana de contexto de 1.048.576 tokens con atención híbrida (sparse + sliding window), decodificación especulativa integrada mediante DFly2 y un esquema de expertos en espacio latente (LatentMoE), lo que permite atender casos de uso de contexto largo y multimodalidad con un coste por token notablemente inferior al de un modelo denso de tamaño comparable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con backbone transformer de 42 capas (1 densa + 41 MoE), atención híbrida sparse + sliding-window, MLA, iHC y embeddings Engram |
| Parámetros totales | 220.260.270.502 (155,5B backbone + 63,5B Engram + 0,43B ViT + 0,85B DFly2) |
| Parámetros activos | 11,3B texto + 0,43B visión por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantización | FP8 (versión publicada); existen pesos GGUF en un repositorio independiente enlazado desde la model card |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License (license_name: tencent-hy-license) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El backbone lingüístico consta de 42 capas: una capa densa con FFN de tamaño intermedio 13.824 y 41 capas MoE. Cada capa MoE dispone de 512 expertos enrutados más un experto compartido, y activa 16 expertos enrutados por token en un espacio latente de dimensión 1.536 (LatentMoE), con tamaño intermedio de experto de 1.536. El tamaño oculto es 3.072 y el vocabulario de 120.832 tokens. Las conexiones residuales usan iHC (identity Hyper-Connections) con 4 flujos residuales.

La atención es híbrida y se alterna con el patrón 2 × Sparse → 10 × (3 × SWA → Sparse), resultando en 12 capas sparse y 30 capas SWA. La formulación es Multi-head Latent Attention (MLA) con q_lora_rank 1.024 y kv_lora_rank 512 en ambos tipos de capa; las capas sparse usan 32 cabezas de atención y las SWA 64, con dimensión de cabeza QK de 192 + 64 (no-RoPE + RoPE) y dimensión de cabeza de valor de 256. La selección de contexto sparse alcanza hasta 2.048 tokens mediante selección a nivel de grupo, mientras que la ventana SWA es de 512 tokens causales (511 precedentes más el actual). El codificador visual deriva de SigLIP2-So400m-Patch16-Res512 y se conecta al backbone mediante un proyector MLP; la codificación posicional multimodal usa MRoPE intercalado.

Como innovaciones destacables, el modelo incorpora embeddings N-gram (Engram) de bigramas y trigramas en las capas 1, 11, 21 y 31, con 8 cabezas hash por orden, vocabulario hash de 10,3M por cabeza y dimensión de embedding de 768 por orden (8 cabezas × 96 dimensiones). Además, incluye un drafter de 5 capas, DFly2 (0,85B parámetros), que reutiliza la caché KV y los índices sparse del modelo objetivo para decodificación especulativa de contexto largo a coste constante. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto e inferencia multimodal imagen-a-texto nativa, con codificador SigLIP2 y proyector MLP.
- Razonamiento y generación de código y matemáticas (capacidades declaradas en la model card, sin cifras de benchmark disponibles en la información proporcionada).
- Ventana de contexto de hasta 1M tokens, apta para documentos largos y conversaciones multi-turno extensas.
- Decodificación especulativa integrada mediante DFly2, con reutilización de caché KV e índices sparse.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Compatibilidad con endpoints y despliegue en la región UE (tag `region:eu`).
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos: el modelo puede procesar contratos, informes o expedientes de hasta 1M tokens en una sola pasada, gracias a la ventana de contexto completa y a la atención híbrida sparse/SWA que mantiene el coste acotado.
- Asistentes conversacionales de larga duración: la ventana de 1M tokens y la decodificación especulativa DFly2 permiten mantener historiales de conversación muy extensos con latencia estable.
- Procesamiento de documentación técnica multimodal: al aceptar imagen y texto, puede extraer información de diagramas, capturas y tablas junto con el texto que los acompaña en manuales y especificaciones.
- Generación de código en pipelines: la activación de solo 11,3B parámetros por token reduce el coste de servir tareas de autocompletado y generación de código en producción, aunque la ausencia de datos de HumanEval en la información disponible impide cuantificar su calidad.
- Extracción de información de facturas y formularios: el pipeline image-text-to-text permite digitalizar y estructurar documentos escaneados combinando el codificador visual con el backbone lingüístico.
- Investigación sobre eficiencia MoE: la combinación de LatentMoE, Engram y atención híbrida lo convierte en un caso de estudio para experimentos de enrutamiento de expertos y recuperación N-gram en contexto largo.
- Despliegue en infraestructura europea: la etiqueta `region:eu` y la compatibilidad con endpoints facilitan su uso en entornos con requisitos de residencia de datos en la UE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia un apéndice de resultados de benchmark y secciones de evaluación ciega de usuarios, pero no se han incluido cifras concretas (MMLU, HumanEval, GSM8K u otras) en el material proporcionado, por lo que no se presentan comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 287,1 GB en FP8, por lo que la inferencia completa requiere del orden de 280-300 GB de VRAM, distribuida entre varias GPU.
- GPU recomendadas: para servir el modelo completo en FP8 se necesitan múltiples aceleradores de clase数据中心, como 4× H100 80GB o 8× A100 80GB; no se dispone de cifras oficiales de configuración mínima en la información proporcionada.
- GPU de consumo: no cabe en GPU de consumo (RTX 4090, 24 GB) en su configuración FP8 completa; sería necesaria una cuantización adicional (por ejemplo, GGUF de menor precisión) para acercarse a ese rango, sin datos confirmados.
- Opciones de despliegue: transformers, vLLM y SGLang (mencionados en la model card), así como API compatible con OpenAI; existe un repositorio GGUF independiente enlazado desde la model card.
- Latencia y throughput: no disponible en la información proporcionada; DFly2 está diseñado para reducir el coste de la decodificación especulativa en contexto largo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-FP8 (nokkela-ai) | 220,26B | 11,3B texto + 0,43B visión | 1M | Tencent Hy License | Hugging Face (fork) |
| Hy4-flash-FP8 (tencent) | 220,26B | 11,3B texto + 0,43B visión | 1M | Tencent Hy License | Hugging Face (original) |
| Hy4 (modelo predecesor) | no disponible | no disponible | no disponible | Tencent Hy License | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos competidores comparables, por lo que la comparativa se limita al ecosistema Hy4 y no permite establecer diferencias cuantitativas con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al ser un modelo entrenado por Tencent, es previsible que herede sesgos de sus datos de entrenamiento, pero no se documentan.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en contextos largos.
- Limitaciones de contexto o idioma: la ventana es de 1M tokens, pero no se especifica la degradación de rendimiento en los extremos de la ventana; los idiomas soportados no están documentados.
- Restricciones de licencia: la Tencent Hy License es una licencia "other" con términos propios; es imprescindible revisar el texto completo antes de cualquier uso comercial, ya que puede imponer condiciones adicionales.
- Este repositorio es un fork no oficial de nokkela-ai; la responsabilidad sobre la integridad y actualización de los pesos recae en el publicador del fork, no en Tencent.
- El tamaño del repositorio (287,1 GB) y la necesidad de múltiples GPU de数据中心 limitan su despliegue en entornos con recursos modestos.
- No se han publicado resultados de benchmarks en la información disponible, lo que impide validar empíricamente las capacidades declaradas.
- La cuantización FP8 puede introducir una ligera pérdida de calidad respecto a los pesos originales en precisión completa; no se documenta la magnitud de esta degradación.

## Enlaces

- Repositorio del fork: https://huggingface.co/nokkela-ai/Hy4-flash-FP8
- Modelo base: https://huggingface.co/tencent/Hy4-flash-FP8
- Licencia: https://huggingface.co/tencent/Hy4-flash-FP8/blob/main/LICENSE
- README en chino: https://huggingface.co/tencent/Hy4-flash-FP8/blob/main/README_CN.md
- Página oficial: https://hy.tencent.ai/research/hy4-flash
- GitHub: https://github.com/Tencent-Hunyuan/Hy4-flash
- GGUF: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4-flash
- Hugging Face Tencent Hy: https://huggingface.co/tencent/Hy4-flash

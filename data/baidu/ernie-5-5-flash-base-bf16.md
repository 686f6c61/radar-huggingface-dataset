# baidu/ERNIE-5.5-Flash-Base-BF16

## Resumen

ERNIE-5.5-Flash-Base es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso desarrollado por Baidu, con 280.000 millones de parámetros totales y 14.000 millones activados por token. Se trata del checkpoint al final del preentrenamiento, antes de cualquier fase de mid-training o post-training, por lo que está pensado como base para adaptación de dominio, ajuste por instrucciones e investigación en aprendizaje por refuerzo. Emplea una arquitectura híbrida de atención que combina Multi-head Latent Attention (MLA) con atención dispersa (DSA) y Heavily Compressed Attention (HCA), sobre 43 capas y 512 expertos enrutados (top-10) más un experto compartido por capa.

El modelo fue preentrenado desde cero sobre 33,5 billones de tokens con el optimizador Muon y una longitud de contexto de entrenamiento de hasta 128K tokens; el ajuste fino e inferencia admiten hasta 1M de tokens. Baidu publica dos variantes de precisión: FP8 y BF16 (esta última es la ficha actual). La relevancia del lanzamiento radica en su enfoque explícito en eficiencia: el diseño trata el cómputo activado, la caché KV y el coste de contexto largo como un problema único, con atención comprimida por capas y cabezas de dimensión variable adaptadas al coste de cada capa.

El modelo se distribuye bajo una licencia propia (ERNIE 5.5 Flash Base Model License v1.0) y soporta únicamente inglés y chino según los metadatos declarados. Su tamaño de repositorio (573 GB en BF16) y sus 280B parámetros lo sitúan en la categoría de modelos frontera que requieren infraestructura multi-GPU para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención MLA + HCA (43 capas: 1 FFN densa + 42 Multi-Router Latent MoE; 37 capas HCA y 6 capas MLA con DSA) |
| Parametros totales | 286.245.622.106 (~286B; la model card indica 280B) |
| Parametros activos | 14B por token |
| Longitud de contexto | 128K (entrenamiento máximo) / 1M (ajuste fino e inferencia) |
| Tipos de cuantizacion | BF16 (esta variante); FP8 disponible en variante separada; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | en, zh |
| Licencia | ernie-5.5-flash-base-model-license-v1.0 (license: other) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

ERNIE-5.5-Flash-Base es un transformer MoE con 43 capas: una capa con FFN densa y 42 capas de Multi-Router Latent MoE. Cada capa MoE contiene 512 expertos enrutados con activación top-10 más un experto compartido. La atención es híbrida: 6 capas conservan acceso a contexto completo mediante Multi-head Latent Attention (MLA) con atención dispersa (DSA), mientras que las 37 restantes usan Heavily Compressed Attention (HCA), que almacena una única entrada de caché por cada 128 tokens. Las dimensiones de cabeza se ajustan al coste de cada capa: las capas HCA, que atienden sobre una secuencia comprimida 128×, emplean cabezas anchas de 512 dimensiones, mientras que las capas MLA, más costosas en cómputo, usan cabezas de 256 dimensiones. Según la model card, con un presupuesto de caché KV comparable, la combinación HCA + MLA supera a HCA + Compressed Sparse Attention (CSA), y las capas MLA con DSA igualan la pérdida de preentrenamiento de la atención densa sin que su coste de atención por consulta crezca con la longitud de contexto.

El entrenamiento se realizó desde cero sobre 33,5 billones de tokens con el optimizador Muon y contexto de hasta 128K. La model card destaca dos innovaciones adicionales aplicadas en todas las capas de atención junto con QK-norm: Low-Rank Gated Attention, que calcula la puerta de salida de atención a partir del latente de consulta de bajo rango en lugar del estado oculto, reduciendo un 75% los parámetros de proyección de la puerta y mejorando el rendimiento; y Virtual Head Attention (VHA), una mezcla posterior de bajo rango entre cabezas con salto de identidad, fusionada en el operador de atención en inferencia. El enrutamiento Multi-Router sustituye el router único por varios routers sobre expertos latentes de media anchura, motivado por la baja correlación entre las puntuaciones de un router único y la utilidad real de los expertos, especialmente en capas intermedias y profundas. El preentrenamiento prioriza capacidades difíciles de incorporar después, como código a escala de repositorio y comprensión de contexto largo.

## Capacidades

- Generación de texto y modelado de lenguaje general en inglés y chino.
- Razonamiento y conocimiento factual, evaluado por el autor en benchmarks de conocimiento y razonamiento.
- Matemáticas y código, con énfasis declarado en código a escala de repositorio durante el preentrenamiento.
- Comprensión de contexto largo: hasta 1M de tokens en ajuste fino e inferencia.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- Es un checkpoint base: no incluye ajuste por instrucciones ni post-training, por lo que no incorpora de serie formato conversacional, tool calling ni comportamiento agéntico; estas capacidades requerirían ajuste posterior.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Adaptación de dominio: al ser un checkpoint al final del preentrenamiento, sirve como punto de partida para ajuste fino supervisado en dominios verticales (legal, médico, financiero) en inglés o chino, aprovechando sus 33,5T tokens de preentrenamiento como base de conocimiento.
- Investigación en aprendizaje por refuerzo: el modelo está pensado explícitamente como base para investigación en RL, de modo que un equipo puede aplicar sus propios objetivos y políticas de comportamiento sin partir de un modelo ya alineado.
- Ajuste por instrucciones: permite construir un modelo instructivo propio con datos y criterios propios, útil cuando se necesita control total sobre el comportamiento y el tono del asistente.
- Análisis de repositorios de código: su preentrenamiento enfatizado en código a escala de repositorio y su contexto de hasta 1M tokens permiten tareas de comprensión de bases de código completas, resumen de cambios y generación de parches en pipelines internos.
- Procesamiento de documentos largos: con 1M tokens de contexto en inferencia, es adecuado para resumir, extraer y responder preguntas sobre contratos, informes o expedientes extensos en chino o inglés.
- Generación y revisión de código en producción: tras un ajuste específico, puede integrarse en pipelines de CI/CD para revisión automática de parches y generación de pruebas, aunque requiere post-training previo para formato y fiabilidad.
- Búsqueda y recuperación aumentada (RAG) sobre corpus bilingües en/zh: el contexto largo reduce la necesidad de trocear documentos y permite concatenar múltiples pasajes recuperados en una sola ventana.
- Evaluación comparativa de arquitecturas MoE: su diseño híbrido MLA + HCA y su enrutamiento Multi-Router lo convierten en un objeto de estudio para investigadores que analizan eficiencia de atención y enrutamiento a escala.

## Benchmarks y rendimiento

La model card indica que el modelo se evalúa bajo un pipeline unificado frente a DeepSeek-V4-Flash-Base (284B-A13B), Hy3-preview-Base (295B-A21B) y MiMo-V2.5-Base (310B-A15B), con los mismos prompts y ajustes de few-shot, y que los resultados completos están en una tabla e imagen de rendimiento. Sin embargo, los valores numéricos concretos no están incluidos en la información proporcionada, por lo que no se reproducen aquí.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 570 GB solo para pesos (286B parámetros × 2 bytes), más caché KV y activaciones; requiere múltiples aceleradores.
- La variante FP8 reduce los pesos a aproximadamente 286 GB, todavía fuera del alcance de una sola GPU de consumo.
- GPU recomendadas: clústeres multi-GPU con A100 80GB, H100 80GB o H200; el número mínimo de unidades depende del paralelismo y de la longitud de contexto.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola tarjeta profesional de 80 GB en BF16.
- Opciones de despliegue: la librería declarada es transformers; vLLM documenta soporte para modelos ERNIE de Baidu (incluidas variantes ERNIE-4.5), aunque no se confirma en la información disponible el soporte específico de ERNIE-5.5-Flash. No se documentan opciones GGUF, llama.cpp ni Ollama para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ERNIE-5.5-Flash-Base | 280B / 14B | 128K entrenamiento, 1M inferencia | ERNIE 5.5 Flash Base Model License v1.0 | HuggingFace y ModelScope (FP8 y BF16) |
| DeepSeek-V4-Flash-Base | 284B / 13B | no disponible | no disponible | referenciado en la model card |
| Hy3-preview-Base | 295B / 21B | no disponible | no disponible | referenciado en la model card |
| MiMo-V2.5-Base | 310B / 15B | no disponible | no disponible | referenciado en la model card |

Los tres modelos comparables son los que el propio autor usa en su pipeline de evaluación unificado. No se dispone de sus contextos, licencias ni resultados numéricos en la información proporcionada, por lo que la comparación de rendimiento no puede cuantificarse aquí.

## Limitaciones y advertencias

- Es un checkpoint base sin post-training: no está alineado para instrucciones, no sigue formatos conversacionales de serie y puede producir salidas incoherentes en uso directo como asistente.
- Riesgo de alucinación inherente a un modelo de lenguaje preentrenado sin ajuste de veracidad.
- Sesgos potenciales derivados de los datos de preentrenamiento, no documentados en la información disponible.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni evaluado.
- Licencia propia no estándar (ERNIE 5.5 Flash Base Model License v1.0): es necesario revisar el archivo LICENSE antes de cualquier uso comercial, ya que las condiciones de explotación comercial no se detallan en la información disponible.
- El contexto de 1M tokens aplica a ajuste fino e inferencia, pero el entrenamiento solo cubrió hasta 128K; el rendimiento más allá de esa longitud no está validado en la información disponible.
- El tamaño del repositorio (573 GB) y los requisitos multi-GPU limitan su despliegue a infraestructuras con capacidad significativa.
- No se documentan cuantizaciones de baja precisión (GGUF, AWQ, GPTQ), lo que restringe las opciones de despliegue en hardware modesto.

## Enlaces

- HuggingFace (BF16): https://huggingface.co/baidu/ERNIE-5.5-Flash-Base-BF16
- HuggingFace (FP8): https://huggingface.co/baidu/ERNIE-5.5-Flash-Base
- ModelScope (BF16): https://www.modelscope.cn/models/baidu/ERNIE-5.5-Flash-Base-BF16
- ModelScope (FP8): https://www.modelscope.cn/models/baidu/ERNIE-5.5-Flash-Base
- Blog técnico: https://ernie.baidu.com/release/ernie-5-5-flash-base/
- Paper Virtual Head Attention (VHA): https://arxiv.org/abs/2610.17959
- Paper Multi-Router: https://arxiv.org/abs/2610.40577
- Paper adicional referenciado (arxiv:2610.24766): https://arxiv.org/abs/2610.24766
- X (Twitter) oficial: https://x.com/Baidu_ERNIE
- Documentación de modelos soportados en vLLM: https://docs.vllm.ai/en/v0.25.1/models/supported_models/

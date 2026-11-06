# AinsleyMarkov/Kimi-K3.1-Pro-2bit-UVMAX

## Resumen

Kimi-K3.1-Pro-2bit-UVMAX es una cuantización de 2 bits del modelo Kimi K3.1 Pro de Moonshot AI, publicada por el usuario AinsleyMarkov para su uso con MLX sobre Apple Silicon. El modelo base es un transformer híbrido de tipo Mixture-of-Experts (MoE) con 2,78 billones de parámetros totales, atención lineal KDA combinada con MLA y atención dispersa DSA, y una ventana de contexto de 1.048.576 tokens. Esta versión comprime el checkpoint original de 1,56 TB a 816,9 GB (2,35 bits por parámetro) manteniendo la torre de visión en BF16.

La relevancia de esta ficha es doble. Por un lado, documenta una de las cuantizaciones más agresivas publicadas sobre un modelo de escala frontera: los expertos enrutados se reducen a 2 bits con grupos de 128 y escalas BF16, mientras el resto de matrices se mantienen entre 4 y 8 bits. Por otro, expone una limitación práctica importante: el autor no ha publicado su motor de inferencia tensor-parallel para MLX, y mlx-lm no incluye todavía el modelo `kimi_k31`, por lo que el checkpoint no es ejecutable con herramientas estándar sin trabajo adicional.

El modelo está pensado para despliegue en hardware Apple Silicon de gama alta (Mac Studio M3 Ultra o superior), y combina capacidades de texto, razonamiento, código y visión dentro de un pipeline `image-text-to-text`. La licencia es la propia del modelo base (`kimi-k3.1-pro`), no una licencia open source estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con atención lineal KDA (69 capas) + MLA (24 capas) + atención dispersa DSA en las capas MLA |
| Parametros totales | 2.780.110.361.184 (2,78 B) |
| Parametros activos | 896 expertos enrutados, 16 activos por token, más 2 expertos compartidos (no se publica el total de parámetros activos) |
| Longitud de contexto | 1.048.576 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | MLX affine: expertos enrutados a 2 bits (grupo 128); KDA, MLA, expertos compartidos, proyecciones latentes, router, indexador DSA y MLP densa a 6-8 bits (grupo 64); embeddings y lm_head a 4 bits; torre de visión y proyector en BF16 |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (licencia propia del modelo base, `license: other`) |
| Formato de pesos | safetensors (95 shards, MLX affine), tokenizador tiktoken, configuración en JSON |

## Arquitectura y entrenamiento

El modelo base Kimi K3.1 Pro emplea una arquitectura de 93 capas con tamaño oculto de 7.168 y activación `situ`: una capa densa inicial (MLP de 33.792) seguida de 92 capas MoE. Cada capa MoE contiene 896 expertos enrutados de los que se activan 16 por token, más 2 expertos compartidos, con router sigmoide, `noaux_tc` y renormalización. Los expertos enrutados operan en un espacio latente de anchura 3.584 (intermedio 3.072), lo que reduce el coste de las proyecciones. La atención combina 69 capas KDA (Kimi Delta Attention, lineal, con 96 cabezas de 128 dimensiones, convolución corta de 4 y puerta de rango completo) con 24 capas MLA (atención multi-cabeza latente con `q_lora_rank` 1.536, `kv_lora_rank` 512, NoPE y puerta de salida). Sobre esas 24 capas MLA se aplica atención dispersa DSA: un indexador de 32 cabezas x 128 construye una clave de 128 dimensiones mediante LayerNorm con sesgo y sin RoPE, y cada consulta atiende a sus 2.048 posiciones principales. También incorpora residuales de atención con `attn_res_block_size` 12.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada. La cuantización sí está documentada con detalle: los expertos enrutados en MXFP4 del checkpoint original se decodifican y recuantizan a affine 2 bits en grupos de 128, probando para cada grupo el rango min-max y rangos reducidos al 95, 90, 85, 80 y 75 % alrededor del centro, y conservando el de menor error cuadrático. El resto de matrices se cuantiza con `mx.quantize` (min-max) desde BF16. El indexador DSA se mantiene a 8 bits. El proceso de conversión se ejecutó en un Mac Studio M3 Ultra con MLX 0.32.4 en 32,5 minutos. La caché por token es de 33.792 bytes (MLA 27.648 + claves del indexador 6.144), y las capas KDA mantienen un estado de tamaño fijo por secuencia.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de hasta 1.048.576 tokens.
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`) mediante torre de visión de 27 bloques, parche 14 y proyector `patchmergerv2` con fusión 2x2 a 7.168 dimensiones.
- Razonamiento extenso con modo de pensamiento (`encoding_k3.py` gestiona los niveles de esfuerzo de pensamiento; la revisión `d9e99b0` elimina el nivel `medium`).
- Capacidades de código y matemáticas heredadas del modelo base (no se detallan evaluaciones en la información disponible).
- Soporte de tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información proporcionada.
- Capacidades multilingües: no disponibles (el campo de idiomas no está poblado).
- Atención dispersa DSA con selección top-2.048 posiciones por consulta, orientada a contextos muy largos.

## Casos de uso

- Análisis de documentos extensos en local: con 1.048.576 tokens de contexto, el modelo puede ingerir libros completos, expedientes o bases de código y responder preguntas sobre ellos en una sola pasada, sin fragmentación.
- Asistencia sobre imágenes y texto combinados: el pipeline `image-text-to-text` permite describir capturas, extraer información de diagramas o responder preguntas sobre documentación escaneada, con la torre de visión intacta en BF16.
- Investigación sobre modelos de escala frontera en Apple Silicon: sirve para estudiar el comportamiento de cuantizaciones extremas (2 bits en expertos) y validar técnicas de recuantización affine frente a MXFP4.
- Prototipado de razonamiento largo en estaciones de trabajo Mac: adecuado para experimentos de razonamiento multi-paso con modo de pensamiento, siempre que se disponga de un motor MLX compatible con `kimi_k31`.
- Evaluación comparativa de arquitecturas híbridas: útil para comparar atención lineal KDA frente a MLA y atención dispersa en tareas de recuperación de contexto largo.
- Generación de código en entornos con requisitos de privacidad: al ejecutarse en local sobre Apple Silicon, permite mantener el código fuente fuera de servicios en la nube, aunque requiere validar la calidad tras la cuantización a 2 bits.
- Reproducción de pipelines de cuantización: el checkpoint documenta con precisión el esquema por capas y los grupos, lo que permite reutilizar la receta para otros modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del checkpoint: 816,9 GB en 108 archivos (95 shards safetensors). Requiere almacenamiento NVMe/SSD de al menos 1 TB libre para la descarga y conversión.
- VRAM/unified memory estimada: en torno a 817 GB solo para pesos; con caché KV y estado KDA hay que añadir varios GB adicionales según la longitud de contexto. No cabe en ninguna GPU de consumo.
- Hardware probado por el autor: Mac Studio M3 Ultra con MLX 0.32.4 (conversión en 32,5 minutos). El motor de inferencia tensor-parallel del autor no está publicado.
- GPU recomendadas: no aplica de forma directa; el checkpoint es MLX y está orientado a Apple Silicon. Para GPUs NVIDIA habría que reconvertir los pesos.
- Cabe en GPU de consumo: no. Ni siquiera en configuraciones multi-GPU de 8x H100 (640 GB) sin offloading o sharding adicional.
- Opciones de despliegue: MLX con el motor propietario del autor (no publicado); mlx-lm en main (2026-11-05) incluye `kimi_k3` pero no `kimi_k31` ni el indexador DSA. vLLM, llama.cpp, Ollama y TGI no soportan este formato ni esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-2bit-UVMAX (este) | 2,78 B totales, MoE 896 expertos (16 activos) | 1.048.576 | 2-8 bits MLX affine | `kimi-k3.1-pro` | Solo pesos; sin loader público |
| moonshotai/Kimi-K3.1-Pro (base) | 2,78 B totales | 1.048.576 | MXFP4 + BF16 (1,56 TB) | `kimi-k3.1-pro` | Checkpoint original en 96 shards |
| kernelpool/Kimi-K3-2bit-UVMAX | No disponible en la información | No disponible | 2 bits UVMAX | No disponible | Referencia de la receta de cuantización; sin indexador DSA |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- No existe un loader público: mlx-lm no implementa `kimi_k31` ni el indexador DSA, y el motor tensor-parallel del autor no se ha publicado. El checkpoint no es ejecutable de serie.
- La cuantización a 2 bits de los expertos enrutados puede degradar la calidad de forma notable; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- El tamaño (817 GB) hace inviable el despliegue en GPUs de consumo y exige estaciones de trabajo con memoria unificada muy alta.
- La licencia `kimi-k3.1-pro` es propia y no estándar; es necesario revisar sus términos antes de cualquier uso comercial. El campo `license: other` en Hugging Face no aclara restricciones.
- No se han publicado datos de idiomas soportados, sesgos ni tasas de alucinación para esta variante cuantizada.
- El proceso de conversión y el motor de inferencia son propietarios y no reproducibles con las herramientas públicas actuales.
- La revisión `d9e99b0` del modelo base elimina el nivel de esfuerzo de pensamiento `medium`; los prompts que dependan de ese nivel pueden comportarse de forma distinta.
- El indexador DSA se mantiene a 8 bits, pero los expertos a 2 bits son el componente dominante en tamaño; cualquier evaluación de calidad debe hacerse sobre esta variante concreta, no sobre el modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/AinsleyMarkov/Kimi-K3.1-Pro-2bit-UVMAX
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Receta de cuantización de referencia: https://huggingface.co/kernelpool/Kimi-K3-2bit-UVMAX
- Repositorio MLX: no disponible en la información proporcionada
- Paper o blog técnico del modelo base: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada

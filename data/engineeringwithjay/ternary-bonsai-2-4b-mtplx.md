# EngineeringWithJay/Ternary-Bonsai-2-4B-MTPLX

## Resumen

Ternary-Bonsai-2-4B-MTPLX es un reempaquetado del modelo `prism-ml/Ternary-Bonsai-2-4B-mlx-2bit` de Prism ML, publicado por el usuario EngineeringWithJay, que adapta el pack original al contrato MTPLX para permitir decodificación especulativa nativa con MTP (multi-token prediction) sobre silicio de Apple. El modelo es un VLM de 4.540.042.240 parámetros con cuantización ternaria de 2 bits en el tronco, pensado para inferencia local en memoria unificada de Apple mediante la librería MLX.

La arquitectura es de tipo `prism_hadamard_qwen35`, con 32 capas (8 de atención completa y 24 de atención lineal Gated DeltaNet), tamaño oculto de 2560 y contexto nativo de 262.144 tokens. Incluye una torre de visión de 24 bloques con dimensión oculta 1024, lo que lo convierte en un modelo multimodal texto-imagen. El tronco está cuantizado en ternario (2 bits, affine, group size 128), mientras que la cabeza MTP usa 4 bits (group 64, affine, prequantized, profundidad 1).

Su relevancia radica en que demuestra un caso práctico de despliegue de un VLM de contexto muy largo en hardware de consumo Apple (un M5 Air de 16 GB), con tasas de decodificación medidas de 43,9 t/s de media y 64,8 t/s en el mejor caso, además de exponer un parche necesario en MTPLX 2.12.3 para manejar proyecciones de salida atadas al embedding. Es un pack experimental, no un finetune, y los pesos son byte-idénticos al pack upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `prism_hadamard_qwen35` (transformer híbrido: 8 capas de atención completa + 24 de atención lineal Gated DeltaNet) |
| Parametros totales | 4.540.042.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Tronco: ternario 2-bit affine, group size 128. Cabeza MTP: 4-bit affine, group size 64, prequantized |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); repo de 2,0 GB; tronco `model.safetensors` de 1.871.365.704 bytes |
| Hidden size | 2560 |
| Capas | 32 (8 full-attention, 24 linear-attention / Gated DeltaNet) |
| Cabezas de atencion | 16 attention / 4 key-value, head_dim 256 |
| Intermediate size | 9216 |
| Proyeccion de salida | atada al embedding (`tie_word_embeddings: true`), sin tensores `lm_head` |
| Cabeza MTP | `qwen3_5_mtp`, 4-bit group-64 affine, prequantized, depth 1 |
| KV por token | 32 KB en bf16 (8 capas full-attention × 2 × 4 cabezas × 256 dim × 2 bytes) |
| Torre de vision | 24 bloques, hidden 1024 |
| Libreria | mlx |

## Arquitectura y entrenamiento

El modelo es un transformer híbrido que combina 8 capas de atención completa con 24 capas de atención lineal basadas en Gated DeltaNet, una elección que reduce el coste de atención en contextos largos manteniendo capacidad de modelado global en un subconjunto de capas. El tronco emplea cuantización ternaria de 2 bits con esquema affine y group size 128, integrada mediante la variante `prism_hadamard_qwen35`, que incorpora una transformación Hadamard/sign-flip necesaria para el formato. La proyección de salida está atada a la matriz de embedding (`tie_word_embeddings: true`), de modo que no existen tensores `lm_head` independientes.

La cabeza MTP (`qwen3_5_mtp`) se distribuye prequantizada en 4 bits (group 64, affine, profundidad 1) y fue entrenada por Prism ML contra el tronco de Ternary Bonsai 2. El reempaquetado de EngineeringWithJay no modifica ningún byte de pesos: solo mueve `mtp/model.safetensors` a la raíz del pack, prefija las 31 claves tensoriales con `mtp.`, añade metadatos al `config.json` (`mtplx_mtp_contract`, `mtplx_mtp_quantization`, `mlx_lm_extra_tensors`, `model_family`, `text_config.mtp_num_hidden_layers = 1`) y genera `mtplx_runtime.json` con los campos exigidos por MTPLX. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica destacable es la integración de decodificación especulativa MTP nativa sobre MLX en Apple silicon, que requiere un parche de una rama en `mtplx/draft_lm_head.py` (`_make_embedding_as_linear_head`) para aceptar `HadamardQuantizedEmbedding` como cabeza de borrador atada. Sin ese parche, el pack no puede servirse ni siquiera con `--no-mtp`.

## Capacidades

- Generación de texto conversacional y razonamiento, con modo de pensamiento desactivable (`--reasoning off`).
- Procesamiento de visión: lectura de capturas de pantalla e imágenes, verificado sobre un viewport de UI real (leyó correctamente Temperature 0.60, Top P 0.95, Top K 20, MTP on, Draft depth 1, Max tokens 16.4k).
- Decodificación especulativa MTP con profundidad 1, que acelera la generación al proponer tokens con la cabeza borrador y verificarlos con el tronco.
- Contexto largo nativo de 262.144 tokens, adecuado para conversaciones multi-turno extensas y documentos largos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (los idiomas no están declarados).
- Inferencia local en Apple silicon mediante MLX, con cuantización ternaria de 2 bits que reduce el peso del tronco a aproximadamente 1,87 GB.

## Casos de uso

- Asistente conversacional local en Mac: el modelo cabe en 16 GB de memoria unificada y permite conversaciones multi-turno con caché de sesión en SSD, reutilizando prefijos para evitar re-prefill (0,6 s por turno frente a 14,1 s sin reutilización en una carga de 16K tokens).
- Lectura y extracción de datos de capturas de pantalla o interfaces: la torre de visión de 24 bloques permite interpretar valores de UI, formularios o paneles y devolverlos en texto estructurado, como se verificó con un viewport real.
- Procesamiento de documentos largos: con 262.144 tokens de contexto nativo, puede ingerir contratos, informes o hilos completos sin truncar, aprovechando las capas de atención lineal para contener el coste.
- Prototipado de agentes con decodificación especulativa: la cabeza MTP de profundidad 1 permite medir aceleraciones de decodificación en pipelines experimentales sobre Apple silicon, con 43,9 t/s de media y hasta 64,8 t/s.
- Servicio de inferencia local mediante `mtplx serve`: despliegue en un puerto local con cuantización de KV en q4, caché de sesión en SSD de hasta 30 GB y presets de batching orientados a latencia, útil para entornos de desarrollo sin GPU dedicada.
- Evaluación de técnicas de cuantización extrema: sirve como banco de pruebas para comparar calidad y velocidad de un tronco ternario de 2 bits frente a alternativas de 4 u 8 bits en tareas de texto y visión.
- Investigación en decodificación especulativa: el pack y el parche documentado permiten reproducir y extender experimentos de MTP con proyecciones de salida atadas, un caso que rompía el builder de cabezas borrador de MTPLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas publicadas son de velocidad de decodificación, medidas en un M5 Air de 16 GB con MTPLX 2.12.3, un modelo residente y razonamiento desactivado:

| Medicion | Resultado |
|---|---|
| Decodificacion media sobre 5 prompts | 43,9 t/s |
| Prompt mas rapido | 64,8 t/s |
| Decodificacion con imagen en el prompt | 35,9 t/s |
| Vision (lectura de UI) | correcta (Temperature 0.60, Top P 0.95, Top K 20, MTP on, Draft depth 1, Max tokens 16.4k) |

No se ha publicado una tabla separada de tasas de aceptación de la cabeza MTP.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el tronco pesa 1,87 GB en safetensors; el repo completo ocupa 2,0 GB. En la prueba se ejecutó con límite de memoria de 14.495.552.000 bytes (aproximadamente 14,5 GB) en un equipo de 16 GB.
- GPU recomendadas: Apple silicon con memoria unificada; la medición de referencia se hizo en un M5 Air de 16 GB. No se dispone de datos para A100, H100 ni RTX 4090, y el formato MLX no es compatible con CUDA de forma nativa.
- Cabe en GPU de consumo: sí, en equipos Apple con al menos 16 GB de memoria unificada según la prueba publicada. No hay datos para GPUs NVIDIA de consumo.
- Opciones de despliegue: MTPLX 2.12 o superior con el parche de `draft_lm_head.py` (o una versión futura que lo incluya). `mlx-lm` estándar no puede cargar el pack porque su `model_type` es `prism_hadamard_qwen35`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 43,9 t/s de media en decodificación, 64,8 t/s en el mejor prompt y 35,9 t/s con imagen. En caché de sesión, 0,6 s por turno frente a 14,1 s sin reutilización de prefijo en una carga de 16K tokens.
- Variables de entorno recomendadas en un Mac de 16 GB: `MTPLX_MEMORY_LIMIT_BYTES=14495552000` y `MTPLX_SESSION_BANK_MAX_BYTES=3221225472`. No reducir el banco de sesión a 64 MB, ya que no cabe ni una entrada de conversación por debajo de aproximadamente 1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-4B-MTPLX (este) | 4.540.042.240 | 262.144 | Ternario 2-bit (tronco) + MTP 4-bit | Apache-2.0 | Hugging Face, MLX/MTPLX |
| prism-ml/Ternary-Bonsai-2-4B-mlx-2bit | no disponible | no disponible | Ternario 2-bit | no disponible | Hugging Face, mlx-vlm |
| Ternary Bonsai 2 9B (mencionado) | no disponible | no disponible | no disponible | no disponible | Pack sin atar, no requiere parche |
| Ternary Bonsai 2 27B (mencionado) | no disponible | no disponible | no disponible | no disponible | Pack sin atar, no requiere parche |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. Las variantes 9B y 27B se citan únicamente como packs de la misma familia que no necesitan el parche de cabeza atada.

## Limitaciones y advertencias

- Este pack es el modelo base, no un finetune Swift; el comportamiento conversacional puede ser menos pulido que el de una variante ajustada.
- Requiere MTPLX 2.12 o superior con el parche de una rama en `draft_lm_head.py`; sin él, el pack no carga ni con `--no-mtp`. `mlx-lm` estándar es incompatible.
- Solo se ha verificado lectura texto-imagen; no se ha verificado comportamiento con vídeo ni con múltiples imágenes.
- No se ha publicado una tabla de tasas de aceptación de la cabeza MTP, por lo que la ganancia real de la decodificación especulativa puede variar según la carga.
- Los idiomas soportados no están declarados, lo que impide garantizar cobertura multilingüe en producción.
- No hay datos publicados de sesgos, riesgo de alucinación ni evaluaciones de seguridad.
- La cuantización ternaria de 2 bits puede degradar la calidad frente a pesos en bf16 o 4 bits; no se aportan métricas de calidad que lo cuantifiquen.
- El despliegue está limitado a Apple silicon con MLX; no hay soporte documentado para CUDA, ROCm ni otras plataformas.
- La licencia Apache-2.0 permite uso comercial, pero los pesos son de Prism ML y deben mantenerse la atribución y los avisos correspondientes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-12), lo que indica un pack reciente y sin validación comunitaria amplia.

## Enlaces

- Hugging Face del pack: https://huggingface.co/EngineeringWithJay/Ternary-Bonsai-2-4B-MTPLX
- Modelo base upstream: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-mlx-2bit

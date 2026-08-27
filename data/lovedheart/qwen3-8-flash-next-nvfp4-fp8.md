# lovedheart/Qwen3.8-Flash-Next-NVFP4-FP8

## Resumen

El modelo `lovedheart/Qwen3.8-Flash-Next-NVFP4-FP8` es una versión cuantizada del modelo multimodal Qwen3.8-Flash-Next de Qwen, desarrollada por el usuario lovedheart (RadixArk) mediante NVIDIA Model Optimizer. Se trata de un checkpoint de mezcla de precisión: los expertos enrutados del bloque MoE se cuantizan a NVFP4 (W4A4), las proyecciones de atención se cuantizan a FP8 E4M3 con bloques 2D de 128×128, y el resto de los pesos permanece en BF16. El objetivo es reducir el tamaño del checkpoint de 360 GB a aproximadamente 132 GB (factor 2,7) y permitir servir el modelo en un único GPU Blackwell de 96 GB de VRAM.

El modelo base es un transformador híbrido multimodal (texto, imagen y vídeo) con arquitectura GDN (Gated DeltaNet) y QSA (Qwen Sparse Attention), que combina compresión de contexto con recuperación precisa a largo alcance. Cuenta con 48 capas de decoder, 512 expertos enrutados por capa MoE con top-10, una tabla de embedding n-gram de 51B parámetros adicionales y una ventana de contexto de 262.144 tokens. La versión cuantizada aquí presentada mantiene la fidelidad respecto al BF16 original en las evaluaciones reportadas, con una degradación mínima en GSM8K y AIME26.

La relevancia de este checkpoint radica en que es una de las primeras versiones públicas que permiten servir un modelo de ~180B parámetros totales en hardware de consumo profesional (una sola GPU Blackwell), siempre que se utilice un runtime de SGLang parcheado específicamente para despachar las capas `FP8_PB_WO`. Sin ese parche, el servidor arranca pero produce texto corrupto de forma silenciosa, lo que lo convierte en una herramienta de evaluación para desarrolladores que buscan desplegar MoE ultradispersos a escala reducida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (GDN + QSA sparse attention, MoE con 512 expertos, multi-hyperconnection streams, PLE n-gram) |
| Parámetros totales | 119.603.003.859 (según safetensors) más 51B de tabla n-gram (total ~180B) |
| Parámetros activos | ~6B por token (MoE top-10) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | NVFP4 (W4A4, grupo 16) en expertos enrutados; FP8 E4M3 (128×128) en atención; BF16 en el resto |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se especifica en la ficha) |
| Licencia | Other (ver modelo fuente Qwen/Qwen3.8-Flash-Next) |
| Formato de pesos | safetensors (mezcla de precisión: NVFP4, FP8, BF16) |

## Arquitectura y entrenamiento

El modelo original Qwen3.8-Flash-Next es un MoE multimodal ultra-disperso de 125B parámetros activos (6B por token) más una tabla de embedding n-gram de 51B, con una arquitectura híbrida que combina Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA). En tres de cada cuatro capas se usa GDN para comprimir el historial, mientras que la cuarta capa utiliza QSA para la recuperación precisa de información a largo plazo. Además, incorpora flujos multi-hyperconnection y una inyección de n-gramas a nivel de embedding.

La cuantización se realizó con NVIDIA Model Optimizer (v0.46.0, snapshot `87c9f8cf`) mediante post-training quantization. El proceso consistió en capturar activaciones de los bloques MoE durante el prefill con SGLang, usando 128 artículos del dataset `cnn_dailymail` (config 3.0.0, truncados a 512 tokens) y un total de 62.139 filas por capa. Las escalas de activación se calcularon por máximo sobre 8 batches muestreados con semilla. Solo los expertos enrutados de las 48 capas MoE se cuantizaron a NVFP4 W4A4 (E2M1, grupo 16, escalas de bloque FP8 E4M3 y escalas globales FP32). Las proyecciones de atención (q/k/v/o) y las capas GDN se cuantizaron a FP8 E4M3 con bloques 2D de 128×128. El resto de los pesos (atención, QSA, GDN, mHC, expertos compartidos, routers, embeddings, LM head, visión y las 31 capas MTP) permaneció en BF16 sin cambios. Las tablas n-gram se tomaron de la versión FP8 del modelo original y se de-cuantifican a BF16 al cargar.

## Capacidades

- Generación de texto multimodal: procesa entradas de texto, imagen y vídeo, y produce salidas de texto.
- Razonamiento matemático y lógico: el modelo base alcanza 97,5 en GSM8K y 100 en AIME26 en BF16; la versión cuantizada mantiene 97,27 y 98,75 respectivamente.
- Generación de código: soporta tareas de programación y puede integrarse en flujos de desarrollo.
- Tool calling y function calling: el modelo base de Qwen3.8-Flash-Next incluye soporte nativo para agentes y herramientas, que se conserva en la cuantización.
- Razonamiento multi-paso y agentes: diseñado para sistemas agénticos con contexto largo de 262K tokens.
- Compresión de contexto eficiente: gracias a la arquitectura GDN, puede procesar secuencias muy largas con menor coste computacional.
- Soporte de vídeo e imagen: la entrada multimodal permite análisis de vídeo e imágenes en combinación con texto.

## Casos de uso

- Despliegue de un MoE de 180B en un único GPU Blackwell: el checkpoint permite servir el modelo completo en una sola B300 o GB300 de 96 GB de VRAM, reduciendo los costes de hardware de 2 GPUs a 1, ideal para entornos de producción con presupuesto ajustado.
- Agentes de razonamiento con contexto largo: con 262K de ventana, se puede usar para agentes que analizan documentos extensos, historiales de conversación o vídeos completos, manteniendo la coherencia durante múltiples turnos.
- Generación de código asistida en pipelines de CI/CD: el modelo puede integrarse en flujos de integración continua para generar tests, revisar código o completar implementaciones, gracias a su capacidad de tool calling.
- Análisis multimodal de vídeo para monitorización: dado su soporte de entrada de vídeo, puede procesar secuencias de vídeo para extraer información textual, por ejemplo en vigilancia o análisis de contenido.
- Chat conversacional con memoria a largo plazo: la combinación de GDN y QSA permite mantener conversaciones largas con una huella de memoria reducida, útil para asistentes virtuales en plataformas de atención al cliente.
- Investigación en cuantización y eficiencia: sirve como referencia para evaluar el impacto de NVFP4 en modelos MoE ultra-dispersos, comparando con el BF16 original y con versiones FP8 completas.

## Benchmarks y rendimiento

| Eval | Protocolo | BF16 (referencia) | NVFP4 (este checkpoint) |
|---|---|---|---|
| GSM8K | full 1319, t0.6 / top-p 0.95 / max 8192 | 97.12–97.50 | **97.27** |
| AIME26 | 30 problemas × 8, t=1.0 / max 130k | 100 (240/240) | **98.75 pass@1** (majority@8 100) |

No se han publicado resultados adicionales de benchmarks en la información disponible. La degradación observada en GSM8K es inferior a 0,5 puntos porcentuales respecto al BF16, y en AIME26 el pass@1 desciende 1,25 puntos, manteniendo el majority@8 perfecto. El checkpoint reduce el tamaño de 360 GB a 132 GB (2,7×) y permite servir el modelo en un solo GPU Blackwell con 96 GB de VRAM.

## Requisitos de hardware

- VRAM estimada: 88,8 GiB para el modelo completo en NVFP4 (según la variante de primitive-ai), lo que cabe en una GPU Blackwell de 96 GB. La tabla n-gram de 51B puede residir en memoria del sistema (RAM) si se configura así.
- GPU recomendadas: NVIDIA GB300 y B300 (Blackwell), validadas para este checkpoint. No se soporta en GPUs anteriores (Ampere, Ada) por las instrucciones FP4 y FP8.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090 tiene 24 GB, RTX 5090 32 GB); se requiere hardware de centro de datos.
- Opciones de despliegue: SGLang con soporte `qwen4_exp` (versión parcheada del repositorio `lovedheart/sglang` rama `feat/qwen38-flash-next`). No se menciona soporte para vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponible en la información proporcionada.
- Parámetros de ejecución recomendados: `--quantization modelopt_fp4`, `--fp4-gemm-backend flashinfer_cutlass`, `--page-size 64`, `--mamba-scheduler-strategy extra_buffer`, `--mamba-track-interval 64`, `--context-length 262144`, `--mem-fraction-static 0.80`.

## Comparativa con modelos similares

| Modelo | Parámetros (activos) | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (BF16) | ~180B total (6B activos) | 262K | BF16 | other | HuggingFace |
| Qwen3.8-Flash-Next-FP8 (oficial) | ~180B total | 262K | FP8 completo | other | HuggingFace |
| Este checkpoint (NVFP4+FP8) | ~180B total (6B activos) | 262K | NVFP4 (expertos) + FP8 (atención) + BF16 | other | HuggingFace |
| DeepSeek-R1 (MoE) | 671B total (37B activos) | 128K | FP8 | MIT | HuggingFace |

El checkpoint NVFP4 se sitúa como una alternativa intermedia entre el BF16 completo (que requiere 2 GPUs de 80 GB en FP16) y el FP8 completo (que requiere 2 GPUs de 80 GB en FP8). Su ventaja es que cabe en un único GPU de 96 GB, manteniendo la precisión de los expertos en BF16 y reduciendo el coste de memoria de los expertos enrutados. Comparado con DeepSeek-R1, tiene una huella de memoria mucho menor y un coste de despliegue inferior, aunque con menor capacidad de razonamiento general.

## Limitaciones y advertencias

- Requiere un runtime de SGLang parcheado específicamente para despachar las capas `FP8_PB_WO`. Si se usa un SGLang estándar, el servidor arranca sin errores pero produce texto corrupto de forma silenciosa. La verificación de arranque debe mostrar `quant=modelopt_mixed` y no avisos de claves perdidas para `*.weight_scale_inv`.
- Hardware exclusivo: solo funciona en GPUs NVIDIA Blackwell (GB300/B300). No es compatible con GPUs de generaciones anteriores (Hopper, Ada, Ampere).
- Licencia: el modelo base tiene licencia "other" (no especificada en la ficha), que puede incluir restricciones de uso comercial. Hay que consultar la licencia del modelo fuente Qwen/Qwen3.8-Flash-Next.
- Sesgos y alucinación: no se han documentado específicamente, pero al ser un modelo de lenguaje multimodal de gran tamaño, puede presentar sesgos de género, raza y cultura, así como alucinaciones en contextos largos o ambiguos.
- Degradación de precisión: en AIME26 se observa una pérdida de 1,25 puntos en pass@1 respecto al BF16; para aplicaciones que requieren máxima exactitud en razonamiento matemático, se recomienda validar con el modelo original.
- No soporta KV-cache cuantizado: el checkpoint no incluye metadatos de cuantización de cache de atención, por lo que el consumo de memoria de KV cache es el mismo que en BF16.
- El tamaño del checkpoint en disco (132,6 GB) sigue siendo grande para entornos con almacenamiento limitado, aunque supone una reducción del 63% respecto al BF16.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/lovedheart/Qwen3.8-Flash-Next-NVFP4-FP8
- Modelo fuente: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del modelo original (GitHub): https://github.com/QwenLM/Qwen3.8-Flash-Next/
- NVIDIA Model Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- SGLang parcheado (rama `feat/qwen38-flash-next`): https://github.com/lovedheart/sglang/tree/feat/qwen38-flash-next
- PR original de soporte de SGLang: https://github.com/sgl-project/sglang/pull/36497
- Variante similar de primitive-ai: https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-NVFP4

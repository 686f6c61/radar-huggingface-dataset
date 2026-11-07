# nchapman/Qwen3.8-Flash-Next-W4A16-HGPTQ

## Resumen

Qwen3.8-Flash-Next-W4A16-HGPTQ es una cuantización de 4 bits del modelo multimodal Qwen3.8-Flash-Next de Qwen (Alibaba), publicada por el usuario nchapman. El modelo base es un transformer híbrido de 180.000 millones de parámetros que combina capas de atención lineal (GDN), atención indexada QSA y capas MoE con 512 expertos, además de una torre de visión y una capa de embeddings por n-gramas (PLE) de 51.200 millones de parámetros. Esta versión reduce el peso en BF16 de 360 GB a 93,42 GiB, lo que supone una compresión de 3,83 veces.

La relevancia de esta ficha radica en su enfoque de cuantización: no se limita a un GPTQ estándar, sino que combina GPTQ con descomposición de Cholesky, rotación Hadamard en línea por bloques, una LUT personalizada de 4 bits para la capa PLE y rankings estáticos de expertos en caché. El objetivo es preservar la fidelidad del modelo original en tareas de texto, código, matemáticas, ciencia y visión, con un incremento de perplejidad medido de solo el 3,34 % respecto al BF16.

El resultado es un artefacto pensado para despliegue en producción con vLLM y con kernels especializados (MarlinMoE, Humming, warp-3090 HostExpertStore), no para uso genérico en transformers sin adaptaciones. La licencia declarada en el repositorio es Apache 2.0, aunque el modelo base upstream está sujeto a la Qwen Community License 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: capas GDN (atención lineal) + QSA (atención indexada) + MoE con 512 expertos; torre de visión; capa PLE de embeddings por n-gramas; MTP nativo |
| Parametros totales | 179.789.244.307 (aprox. 180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 GPTQ con group_size=64, actorder=weight; Custom-LUT4 para PLE (group_size=32, 90 B/fila); BF16/FP32 en capas preservadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (repo); modelo base bajo Qwen Community License 1.0 |
| Formato de pesos | safetensors (59 shards, 93,418 GiB), compressed-tensors, compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida con 48 capas que alternan mecanismos de atención lineal (GDN) y atención indexada QSA, junto con capas MoE de 512 expertos enrutados. Incluye una torre de visión con 27 bloques transformer y un merger, una capa PLE (Per-Layer Embedding) de 51.200 millones de parámetros con 128 shards de n-gramas (320.000.456 filas × 160 dimensiones) y un módulo MTP (Multi-Token Prediction) nativo con 1.540 capas lineales.

La cuantización de nchapman aplica GPTQ con Cholesky y group_size=64 sobre 156 proyecciones de atención y 73.728 proyecciones de expertos MoE, preapiladas en tensores 3D para ejecución directa en kernels MarlinMoE. La capa PLE se cuantiza a 4 bits no uniformes con Custom-LUT4 y feedback de error W_kv-HGPTQ, de modo que el error de cuantización queda ortogonal a los subespacios de atención cruzada downstream. Se añade rotación Hadamard en línea (head_dim=64) y tablas alineadas a páginas de 4 KiB para búsquedas mmap/io_uring. La calibración de texto y MTP usó 999 muestras × 2.048 tokens de nvidia/Nemotron-Cascade-2-SFT-Data; la de visión, 120 imágenes multimodales disjuntas de los conjuntos de evaluación.

## Capacidades

- Generación de texto conversacional e instructivo con plantilla de chat Qwen fijada (froggeric v22.5).
- Razonamiento matemático y científico, con perplejidad medida en los dominios math, science, chat e instruct.
- Generación de código y uso en tareas agénticas de tool calling, según los conjuntos de evaluación empleados para los rankings de expertos.
- Comprensión de imagen y texto (pipeline image-text-to-text) mediante la torre de visión cuantizada.
- Soporte multilingüe, aunque los idiomas concretos no están detallados en la información disponible.
- Predicción multi-token nativa (MTP) con Top-1 del 94,16 % y KL media de 0,022547 en la sonda aislada.
- Enrutamiento de expertos con rankings estáticos precalculados sobre 9.804.460 asignaciones por capa, compatible con VLLM_WNA16_STATIC_HOT_CACHE_FILE.
- No se documenta modo thinking explícito ni capacidades de audio en la información proporcionada.

## Casos de uso

- Despliegue de asistente conversacional multiusuario en vLLM: el formato compressed-tensors y los kernels MarlinMoE permiten servir el modelo con 93,42 GiB de pesos, reduciendo los requisitos de VRAM frente al BF16 de 360 GB.
- Generación de código en pipelines de CI/CD: el modelo conserva las proyecciones de atención y MoE en 4 bits con GPTQ y mantiene el token mean KL en 0,092594, adecuado para autocompletado y revisión de parches.
- Razonamiento matemático y científico en entornos de investigación: la perplejidad en math se mantiene en 2,3484 frente a 2,3400 en BF16, lo que permite usar el modelo cuantizado para evaluación de problemas sin degradación apreciable.
- Análisis de documentos con imagen y texto: la torre de visión cuantizada (0,225 GiB) permite procesar capturas, diagramas y formularios junto con texto en el mismo pipeline image-text-to-text.
- Sistemas agénticos con tool calling: los rankings estáticos de expertos y el perfil de enrutamiento precalculado sobre suites de agentic tool use facilitan la caché en caliente de expertos y reducen la latencia de arranque en inferencia.
- Decodificación especulativa con MTP: el módulo MTP nativo (1,340 GiB) con Top-1 del 94,16 % puede usarse como cabezal de borrador para acelerar la generación en producción.
- Servicio multimodal de atención al cliente: la combinación de contexto conversacional, visión y cuantización de 4 bits permite desplegar en GPUs de 80 GB con menor huella de memoria que el modelo original.

## Benchmarks y rendimiento

| Suite / metrica | Valor | Notas |
|---|---:|---|
| Payload total safetensors | 93,418 GiB (100.306.498.784 B) | Compresión 3,83× desde 360 GB BF16, 59 shards |
| probe-v4 weighted KL (cascade90-ml10-language-macro) | 0,052489 | 378 filas, 852.269 tokens |
| probe-v4 token mean KL / p99.9 KL | 0,092594 / 6,7448 | chat: 0,0186; instruct: 0,0293; math: 0,0320; science: 0,0346 |
| probe-v4 perplejidad BF16 → cuantizado | 3,6085 → 3,7291 (+3,34 %) | math: 2,3400 → 2,3484; chat: 3,7979 → 3,8778 |
| probe-guard token mean KL / no_robots mean KL | 0,091269 / 0,058278 | 76 filas, 22.746 tokens; no_robots PPL 22,3109 → 22,8762 |
| MTP nativo KL media / KL mediana / Top-1 | 0,022547 / 0,003868 / 94,16 % | 32 filas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados ocupan 93,42 GiB; se necesita al menos una GPU de 96 GB o varias GPUs para alojar el modelo completo, más memoria para KV cache y activaciones.
- GPU recomendadas: H100 80 GB en configuración multi-GPU, A100 80 GB en tensor parallel, o GPUs con soporte de kernels MarlinMoE y Humming.
- No cabe en GPUs de consumo como RTX 4090 (24 GB) sin descarga parcial de expertos a host; el formato incluye tablas alineadas a páginas de 4 KiB para mmap/io_uring y HostExpertStore en warp-3090.
- Opciones de despliegue: vLLM con compressed-tensors y VLLM_WNA16_STATIC_HOT_CACHE_FILE; warp-3090 HostExpertStore; MarlinMoE; Humming. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nchapman/Qwen3.8-Flash-Next-W4A16-HGPTQ | 180B | no disponible | W4A16 GPTQ + LUT4 + Hadamard | apache-2.0 (repo); Qwen Community License 1.0 (base) | Hugging Face, 0 descargas |
| VnimanieAI/Qwen3.8-Flash-Next-W4A16 | no disponible | no disponible | W4A16 | Qwen Community License 1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (BF16) | 180B | no disponible | BF16 (360 GB) | Qwen Community License 1.0 | Hugging Face |

## Limitaciones y advertencias

- La licencia del repositorio es Apache 2.0, pero el modelo base upstream está bajo Qwen Community License 1.0: se exige atribución a partir de 100M MAU o 20M USD de ingresos mensuales, y las ofertas Model-as-a-Service y de asistente comercial de IA requieren licencia separada de Qwen.
- El repositorio declara 0 descargas y 0 likes, por lo que no hay validación comunitaria ni evidencia de uso en producción.
- El modelo está diseñado para kernels específicos (MarlinMoE, Humming, warp-3090); no se garantiza su funcionamiento en transformers estándar ni en otros runtimes sin adaptación.
- El incremento de perplejidad del 3,34 % y el p99.9 KL de 6,7448 indican que existen colas de error apreciables en algunas muestras, aunque la KL media sea baja.
- No se detallan sesgos conocidos, idiomas soportados ni longitud de contexto en la información disponible.
- Riesgo de alucinación inherente al modelo base, no cuantificado en las sondas presentadas.
- La calibración se realizó con un conjunto limitado (999 muestras de texto y 120 imágenes), lo que puede no cubrir todos los dominios de producción.
- Los rankings de expertos estáticos se calcularon sobre 9.804.460 asignaciones por capa; cambios en la distribución de entrada pueden degradar la caché en caliente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-W4A16-HGPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización alternativa VnimanieAI: https://huggingface.co/VnimanieAI/Qwen3.8-Flash-Next-W4A16
- Repositorio de herramientas: https://github.com/nchapman/warp-3090-model-lab
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Datos congelados de calibración: https://huggingface.co/datasets/nchapman/warp-3090-quant-lab-frozen-data
- Plantillas de chat: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates

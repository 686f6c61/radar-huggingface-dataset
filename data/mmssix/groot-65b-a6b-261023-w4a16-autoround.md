# mmssix/Groot-65B-A6B-261023-W4A16-AutoRound

## Resumen

Groot-65B-A6B-261023-W4A16-AutoRound es una cuantización comunitaria no oficial del modelo Groot-65B-A6B-261023, desarrollada por el usuario mmssix sobre los pesos originales del equipo GrootTeam. El objetivo declarado es permitir la ejecución del contexto nativo completo de 262.144 tokens, con visión y decodificación especulativa (MTP), en dos tarjetas Ampere de 24 GB (2× RTX 3090), algo que los pesos en BF16 no permiten. No está afiliada ni respaldada por el equipo original.

El modelo base es un transformer con arquitectura híbrida de atención (QSA) y capas Gated DeltaNet, con 65B parámetros totales y aproximadamente 6B activos por token (MoE con 256 expertos enrutados por capa). Incluye una tabla de búsqueda N-gram PLE de 51B parámetros, cabezal MTP para decodificación especulativa y torre de visión, lo que lo sitúa en la categoría image-text-to-text con razonamiento y uso de herramientas.

La relevancia de este checkpoint reside en su receta de cuantización mixta: expertos enrutados en INT4 W4A16, proyecciones Gated DeltaNet en INT8 W8A16, tabla PLE en FP8 E4M3FN y el resto en BF16, empaquetado en formato auto_round y servido con vLLM mediante `--quantization inc` sobre kernels Marlin. El repositorio ocupa 92,2 GB y las mediciones del autor reportan ~23,5 GB de VRAM por tarjeta en TP2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención QSA + capas Gated DeltaNet, MoE con 256 expertos enrutados por capa, tabla N-gram PLE, cabezal MTP |
| Parámetros totales | 63.109.146.771 (~65B) |
| Parámetros activos | ~6B por token |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantización | W4A16 INT4 g128 sim (expertos enrutados y MTP), W8A16 INT8 g128 sim (proyecciones Gated DeltaNet), FP8 E4M3FN (tabla PLE), BF16 (resto) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors, empaquetado `auto_round` (`auto_round:auto_gptq`) |

## Arquitectura y entrenamiento

El modelo base combina atención QSA con capas Gated DeltaNet, un esquema de mezcla de expertos con 256 expertos enrutados por capa (activando ~6B de los 65B totales por token) y una tabla de búsqueda N-gram PLE de 51B parámetros que actúa como memoria léxica externa. Incorpora además hiper-conexiones, expertos compartidos, routers y un cabezal MTP para decodificación especulativa, junto con una torre de visión para entrada de imágenes. Según la model card original, parte de Qwen3.8-Flash-Next y fue post-entrenado con menos de 0,1B tokens de datos de código abierto.

La cuantización de este checkpoint aplica AutoRound 0.16.1 (200 iteraciones, calibración de 128×2048, receta de Intel Qwen3.8-Flash-Next) a los expertos enrutados en INT4 W4A16 g128 simétrico, e INT8 W8A16 g128 simétrico a las proyecciones Gated DeltaNet (`in_proj_qkv`, `in_proj_z`, `out_proj`). La tabla PLE se comprime a FP8 E4M3FN con una escala FP32 compartida (de 102 GB a 51 GB) y el cabezal MTP se cuantiza a INT4 W4A16 con RTN (de 2,7 GB a 0,83 GB), manteniendo una aceptación de draft idéntica a BF16 según el autor. El resto de componentes (atención QSA, expertos compartidos, routers, hiper-conexiones, embeddings, `lm_head`, visión y atención MTP) permanece en BF16.

## Capacidades

- Generación de texto y razonamiento en modo thinking, con `reasoning_effort` configurable en low/medium/xhigh mediante el parser `qwen3`.
- Entrada de imagen (pipeline image-text-to-text) con torre de visión incluida.
- Tool calling y function calling con el parser `qwen3_coder`, verificado por el autor.
- Razonamiento multi-paso y uso de agentes (evaluado con Claude Code en Terminal-Bench 2.1 y ALE Agent).
- Generación de código y tareas de ingeniería de software (SWE-bench Verified, NL2Repo-Bench).
- Contexto largo nativo de 262.144 tokens con recuperación verificada en pruebas de aguja en paja.
- Decodificación especulativa mediante cabezal MTP (n=2) para acelerar la generación.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de código en producción: el modelo soporta tool calling con el parser `qwen3_coder` y muestra 56,11 en SWE-bench Verified, por lo que puede integrarse en pipelines de CI/CD para resolución automática de issues y parcheo de repositorios.
- Agentes autónomos de terminal: con 63,37 en Terminal-Bench 2.1 y soporte de hasta 128K tokens de salida por turno, es adecuado para tareas de administración de sistemas y automatización de shell en entornos controlados.
- Análisis de documentos largos con imágenes: la ventana de 262.144 tokens junto con la torre de visión permite procesar informes, contratos o expedientes con figuras incrustadas en una sola pasada.
- Despliegue en hardware de consumo entusiasta: la receta de 2× RTX 3090 con ~23,5 GB por tarjeta hace viable servir el modelo completo en estaciones de trabajo con dos GPU Ampere de 24 GB.
- Razonamiento científico y matemático de alto esfuerzo: el modo `reasoning_effort=xhigh` y los 22,27 puntos en HLE lo orientan a problemas de investigación que requieren cadenas de razonamiento largas.
- Generación de código a partir de especificaciones en lenguaje natural: los 42,64 puntos en NL2Repo-Bench indican capacidad para traducir requisitos a estructuras de repositorio completas.
- Automatización de flujos empresariales: los 41,50 puntos en AutomationBench frente a 7,44 del comparable Qwen3.5-122B-A10B lo posicionan para orquestación de tareas administrativas multi-herramienta.

## Benchmarks y rendimiento

Resultados reportados en la model card del modelo base (modo thinking, esfuerzo por defecto, temp=1.0, top_p=0.95, top_k=20, contexto de 256K):

| Benchmark | Groot-65B-A6B | Qwen3.5-122B-A10B | Qwen3.8-Flash-Next |
|---|---|---|---|
| Terminal Bench 2.1 | 63,37 | 45,26 | no disponible |
| AutomationBench | 41,50 | 7,44 | no disponible |
| SWE-bench Verified | 56,11 | 23,00 | no disponible |
| HLE | 22,27 | no disponible | 18,16 |
| NL2Repo-Bench | 42,64 | no disponible | 42,46 |
| Media de 16 benchmarks | 51,51 | 38,62 (implícito) | 55,39 (implícito) |

El modelo base usa un 23,9% menos de tokens de salida que Qwen3.5-122B-A10B y un 28,3% menos que Qwen3.8-Flash-Next en la media de las 16 evaluaciones. No se han publicado resultados de benchmarks específicos para esta cuantización W4A16 más allá de las mediciones de rendimiento del autor.

Mediciones de inferencia del autor en 2× EVGA RTX 3090 (TP2, NVLink, límite de 250 W):

| Métrica | Valor |
|---|---|
| Contexto servido | 262.144 tokens (pool KV de 294.726 tokens, KV en fp8) |
| Decodificación, stream único (MTP n=2) | ~134 tok/s en código, ~103 en explicación, ~89 en prosa (84 sin MTP) |
| Decodificación, 4 streams concurrentes | ~241 tok/s agregados |
| Prefill | 128K tokens en 28 s; 258K tokens en 60 s |
| Recuperación en contexto largo | 3/3 agujas a 10/50/90% de profundidad en 62K, 206K y 258K tokens |
| VRAM / RAM de host | ~23,5 GB por tarjeta; ~10 GB RSS de proceso más page cache recuperable |

## Requisitos de hardware

- VRAM estimada: ~23,5 GB por tarjeta en configuración TP2 (2× RTX 3090), según medición del autor.
- GPU recomendadas: 2× RTX 3090 (receta objetivo); el modelo base soporta además FP8 en una H200 o dos H100, BF16 en cuatro GPU de 80 GB, GGUF en una tarjeta de 96 GB (RTX PRO 6000 Blackwell, H20) o en máquinas con 128 GB de memoria unificada (DGX Spark, GB10, AMD Strix Halo, Mac M5 Max 128GB).
- GPU de consumo: sí, en 2× RTX 3090; no cabe en una única GPU de consumo de 24 GB.
- Opciones de despliegue: vLLM con `--quantization inc` (kernels Marlin en Ampere); el modelo base ofrece además GGUF (Q4_K_M) y NVFP4.
- Latencia y throughput: ~134 tok/s en decodificación de código con MTP n=2 en stream único; ~241 tok/s agregados con 4 streams; prefill de 258K tokens en 60 s. Son mediciones de un único equipo, no una suite de benchmarks.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Media 16 benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Groot-65B-A6B-261023 (base) | 65B | ~6B | 262.144 | 51,51 | qwen-community-1.0 | BF16, FP8, NVFP4, GGUF |
| Esta cuantización W4A16 | 63,1B | ~6B | 262.144 | no disponible | qwen-community-1.0 | safetensors auto_round |
| Qwen3.5-122B-A10B | 122B | ~10B | no disponible | 38,62 (implícito) | no disponible | no disponible |
| Qwen3.8-Flash-Next | ~125B | no disponible | no disponible | 55,39 (implícito) | qwen-community-1.0 | BF16, FP8 |

Groot-65B-A6B usa un 46,7% menos de parámetros totales que Qwen3.5-122B-A10B y un 48,0% menos que Qwen3.8-Flash-Next, con una media 12,89 puntos superior al primero y 3,88 inferior al segundo.

## Limitaciones y advertencias

- Cuantización no oficial: no está afiliada ni respaldada por el equipo Groot; los resultados pueden diferir de los pesos originales.
- Las mediciones de rendimiento y VRAM provienen de un único equipo (2× RTX 3090 con NVLink y límite de 250 W) y no constituyen una suite de benchmarks; deben validarse en hardware propio.
- La cuantización INT4 de los expertos enrutados puede degradar tareas sensibles a precisión; no se han publicado evaluaciones de accuracy específicas para este checkpoint.
- Riesgo de alucinación inherente a los modelos de razonamiento en modo thinking, agravado en tareas de código y agentes autónomos.
- Idiomas soportados no disponibles en la información proporcionada; no se puede confirmar cobertura multilingüe.
- Licencia qwen-community-1.0: es necesario revisar sus términos antes de uso comercial, ya que se etiqueta como `other` y no como licencia permisiva estándar.
- El formato `auto_round` requiere vLLM con `--quantization inc` y kernels Marlin; no es directamente compatible con llama.cpp, Ollama o TGI.
- Dependencia de la tabla PLE en FP8 con escala compartida: posible pérdida de precisión en la memoria léxica frente a BF16.
- El modelo base fue post-entrenado con menos de 0,1B tokens, un volumen reducido que puede limitar la cobertura de dominios especializados.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/mmssix/Groot-65B-A6B-261023-W4A16-AutoRound
- Modelo base: https://huggingface.co/GrootTeam/Groot-65B-A6B-261023
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Scripts de cuantización: `recipe/quantize/` dentro del repositorio
- Recursos del modelo base: https://huggingface.co/GrootTeam/Groot-65B-A6B-261023/resolve/main/assets/title.png, https://huggingface.co/GrootTeam/Groot-65B-A6B-261023/resolve/main/assets/scatter_65b.png, https://huggingface.co/GrootTeam/Groot-65B-A6B-261023/resolve/main/assets/bars_65b.png

# NagusameCS/ultratensor-models

## Resumen

UltraTensor Models es un conjunto de "splices" de expertos derivados del modelo público BatiAI DeepSeek-V4-Pro en formato GGUF Q3_K_M (697,3 GB, 17 shards). El desarrollador, NagusameCS, aplica una técnica de poda selectiva de expertos mediante la herramienta `ultratensor/gguf_keep.py` para conservar únicamente el subconjunto de expertos que un dominio concreto utiliza de forma efectiva, reduciendo drásticamente el tamaño del modelo sin necesidad de reentrenamiento. El resultado son varios archivos GGUF de un solo fichero con 64, 16, 12 u 8 expertos, más versiones requantizadas a IQ2_XS para tarjetas gráficas de 8 GB de VRAM.

La relevancia de este proyecto reside en su enfoque pragmático: en lugar de distribuir un modelo de 697 GB inmanejable para la mayoría de usuarios, ofrece versiones funcionales de entre 16 y 156 GiB que cargan directamente en llama.cpp con soporte DeepSeek-V4 (línea b10424) o en el fork UltraTensor para los splices con mezcla de densidades. El modelo hereda la licencia MIT del modelo original, lo que permite su redistribución con atribución. Los datos de calidad medidos muestran una perplejidad media de 2,653 en Q3_K_M para el tier keep16u, aunque el tier IQ2_XS de velocidad presenta una calidad sustancialmente inferior (PPL 8,540) con bucles degenerados de tokens en todos los dominios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) densa-híbrida, derivada de DeepSeek-V4-Pro |
| Parametros totales | 73.796.795.675 (73,8 B) |
| Parametros activos | no disponible (modelo MoE con selección de expertos por dominio; keep64 mantiene 64 expertos densos de 384, keep16u/keep12u/keep8u usan 16/12/8 expertos uniformes) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M (CPU), IQ2_XS (GPU, 2,36-2,38 BPW) |
| Idiomas soportados | no disponible (la batería de PPL incluye pruebas multilingües, por lo que se presume cobertura multilingüe) |
| Licencia | MIT (heredada del modelo original DeepSeek-V4-Pro, verificada el 2026-08-21) |
| Formato de pesos | GGUF (un solo fichero, split count parcheado) |

## Arquitectura y entrenamiento

El modelo original DeepSeek-V4-Pro es un MoE híbrido con dos capas de expertos: una capa densa con 384 expertos y una capa hash con 384 expertos, además de un mecanismo de predicción de tokens múltiples (MTP, nextn_predict_layers). Los splices de UltraTensor aplican una poda "keep-N" que conserva únicamente los expertos con mayor masa de routing para un dominio específico (en este caso, código). El tier keep64 mantiene 64 de los 384 expertos densos detrás de una puerta de ancho completo, lo que provoca que llama.cpp estándar rechace el modelo (check_tensor_dims) y requiera el fork UltraTensor (commit b4c34be) que deriva los contadores de expertos por capa de los tensores almacenados y enruta selecciones densas fuera de rango al experto de respaldo 0.

Los splices uniformes (keep16u, keep12u, keep8u) no presentan esta complicación y cargan nativamente en llama.cpp con soporte DeepSeek-V4. El defecto de metadatos MTP se corrige fijando `nextn_predict_layers = 0`. El proceso de construcción no implica entrenamiento adicional: es una poda estructural y posterior requantización de los pesos originales. La calidad se mide con una batería de perplejidad a temperatura 0 que evalúa código, matemáticas, multilingüe, dominios raros y recuperación de "needle".

## Capacidades

- Generación de texto y código: el modelo está optimizado para tareas de programación, con una PPL en código de 3,000 en el tier keep16u Q3_K_M.
- Razonamiento matemático: PPL de 2,887 en matemáticas en el mismo tier.
- Capacidades multilingües: PPL de 2,629 en el test multilingüe.
- Recuperación de contexto largo: PPL de 2,215 en la prueba de needle de 8 tokens.
- Mecanismo de predicción de múltiples tokens (MTP) presente en la arquitectura original, desactivado en los splices (`nextn_predict_layers = 0`).
- Compatibilidad con llama.cpp (línea b10424) y con el fork UltraTensor para cargas mixtas.
- Requantización a IQ2_XS para GPUs de 8 GB (tier de velocidad, no de calidad).

## Casos de uso

- Desarrollo de código asistido en local: el tier keep16u Q3_K_M en CPU ofrece una PPL de 3,000 en código, adecuado para autocompletado y generación de funciones con llama-server en modo CPU sin necesidad de GPU.
- Inferencia en GPUs de gama baja: los splices IQ2_XS de 16 a 20,3 GiB caben en tarjetas de 8 GB VRAM con `-ngl 12`, permitiendo desplegar un modelo de código en hardware consumer (RTX 3060/4060) aunque con velocidad limitada (1,2-1,5 tok/s).
- Evaluación de calidad de cuantización: el proyecto incluye una batería de PPL que permite comparar la degradación entre tiers y cuantizaciones, útil para decidir el punto de equilibrio entre velocidad y calidad.
- Experimentación con poda de expertos en MoE: el código `ultratensor/gguf_keep.py` y el catálogo `model_catalog.json` permiten reproducir el proceso de splice en otros modelos MoE.
- Servicio de inferencia en CPU sin aceleración: el tier Q3_K_M con `-ngl 0` es funcional para pruebas locales y entornos sin GPU, con la advertencia de `--no-op-offload` obligatorio.
- Investigación sobre degradación de calidad en cuantización extrema: los datos de PPL comparativos entre Q3_K_M e IQ2_XS documentan el impacto de la cuantización agresiva en un MoE de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de calidad son las medidas de perplejidad (PPL) del propio autor, a temperatura 0:

| Tier | PPL media | Codigo | Matematicas | Multilingue | Raro | Needle |
|---|---|---|---|---|---|---|
| keep16u Q3_K_M (CPU) | 2,653 | 3,000 | 2,887 | 2,629 | 2,536 | 2,215 (8 tokens) |
| keep16u IQ2_XS (GPU) | 8,540 | 8,528 | 8,631 | 8,458 | 8,568 | 8,517 (16 tokens) |

En rendimiento de inferencia, el autor reporta para keep64 en CPU (nodo node2): prefill de 31 tokens en 291 segundos y decodificación de 8 tokens en 42,8 segundos (0,16 tok/s, limitado por NFS). El tier IQ2_XS alcanza 1,2-1,5 tok/s en una GPU de 8 GB VRAM.

## Requisitos de hardware

- VRAM estimada para inferencia: los tiers IQ2_XS (16,0-24,7 GiB) caben en GPUs de 8 GB VRAM con `-ngl 12`; los tiers Q3_K_M (25,0-156,1 GiB) requieren CPU o GPUs de gran VRAM.
- GPU recomendadas: para IQ2_XS, cualquier GPU con 8 GB VRAM (RTX 3060/4060, A2000); para Q3_K_M completo, se requiere CPU con suficiente RAM o GPU de 24 GB o superior.
- Compatibilidad con consumer GPU: sí, los tiers IQ2_XS están diseñados para ello, aunque con calidad degradada y bucles degenerados de tokens en todos los dominios.
- Opciones de despliegue: llama-server de llama.cpp (b10424 o fork UltraTensor), compatible con `--no-op-offload` obligatorio en todos los tiers Q3_K y IQ2_XS.
- Latencia y throughput estimados: 0,16 tok/s en CPU para keep64; 1,2-1,5 tok/s en GPU 8 GB para IQ2_XS. El tier Q3_K_M en CPU ofrece una velocidad no especificada pero superior al keep64.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria (MoE de codigo como DeepSeek-Coder-V2-Lite o Qwen2.5-Coder-32B) en la informacion proporcionada. Como referencia estructural:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UltraTensors keep16u | 73,8 B (MoE, 16 expertos) | no disponible | Q3_K_M, IQ2_XS | MIT | GGUF en HF |
| DeepSeek-V4-Pro (original) | 73,8 B (MoE, 384 expertos) | no disponible | Q3_K_M | MIT | GGUF |
| DeepSeek-V2-Lite | 16 B (MoE) | 128 K | no disponible | MIT | HF |

La comparativa con DeepSeek-V4-Pro original es la más relevante: los splices reducen el tamaño de 697,3 GB a 25-156 GiB a costa de perder masa de routing en dominios no objetivo, pero manteniendo la calidad en el dominio de código.

## Limitaciones y advertencias

- El tier IQ2_XS presenta bucles degenerados de tokens en todos los dominios, por lo que no es apto para uso en producción de calidad; es un tier de velocidad para pruebas.
- El tier keep64 requiere el fork UltraTensor de llama.cpp (commit b4c34be) y no carga con el llama.cpp estándar.
- La decodificación de secuencias largas (>45 tokens) en GPU requiere otro fork (commit 95fcdad) con correcciones de MMQ y cuBLAS.
- El flag `--no-op-offload` es obligatorio en todos los tiers Q3_K e IQ2_XS; omitirlo provoca cuelgues a partir de 36 tokens de prompt y corrupción silenciosa en prompts cortos.
- La velocidad de inferencia en CPU es extremadamente lenta (0,16 tok/s en keep64), limitando su uso interactivo.
- El modelo es un splice de un modelo base, no un modelo entrenado desde cero; no se han realizado evaluaciones de seguridad, sesgos o alucinaciones.
- No hay información sobre el comportamiento de tool calling, function calling o capacidades de agentes en este modelo.
- La licencia MIT permite uso comercial y redistribución, pero con atribución obligatoria al autor original (DeepSeek y BatiAI).

## Enlaces

- Hub de modelos: https://huggingface.co/NagusameCS/ultratensor-models
- Model card sincronizada: https://huggingface.co/NagusameCS/ultratensor-models/blob/main/README.md
- GitHub de NagusameCS: https://github.com/NagusameCS/
- Fork "civilized" de HyperTensor: https://github.com/Nagusamenotame
- Paper técnico: referenciado en `docs/paper/ultratensor.tex` (no accesible públicamente)
- Preprint: `docs/PREPRINT.md` (no accesible públicamente)

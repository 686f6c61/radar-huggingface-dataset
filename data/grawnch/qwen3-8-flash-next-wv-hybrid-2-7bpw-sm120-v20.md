# Grawnch/Qwen3.8-Flash-Next-WV-Hybrid-2.7bpw-SM120-v20

## Resumen
Qwen3.8-Flash-Next-WV-Hybrid-2.7bpw-SM120-v20 es una cuantizacion experimental de tipo wave-quant (WV) publicada por el usuario Grawnch sobre el modelo base Qwen/Qwen3.8-Flash-Next. No se trata de un modelo entrenado desde cero, sino de una distribucion de pesos comprimidos a aproximadamente 2,7 bits por parametro, empaquetada en formato safetensors y optimizada para el layout INT8 MMA de las GPU Blackwell (sm_120). El repositorio ocupa 47,1 GB y se distribuye bajo licencia Apache 2.0.

La publicacion combina varias tecnicas de compresion y aceleracion: tiering hibrido submodular con componentes calientes (SWZ3_G16, SWZ2_G64, SWZ4_G32) y frios (VQ4), embeddings en memoria host con zero-copy pinned, cabeza LM fusionada Top-20 SWZ8, solapamiento single-stream ab96/shexp y proyecciones calibradas mediante GPTQ con Hessian Block-32, ganancia diagonal Schur-Hadamard SPD y decodificacion especulativa DFlash2. El autor aporta telemetria de hardware y logs de validacion medidos sobre una NVIDIA RTX PRO 6000 Blackwell con 101,97 GB de GDDR7.

Su relevancia es practica: demuestra que es viable servir un modelo de la familia Qwen3.8-Flash-Next en una sola GPU Blackwell con VRAM estatica de 49,333 GiB para b_max=32 y 256 paginas KV (32.768 tokens), alcanzando 107,91 tok/s en b=1 greedy y 1304,75 tok/s en b=30 greedy con burst_k=8. Es un artefacto de investigacion orientado a despliegue bare-metal, no una release oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-Flash-Next (detalles internos del base no disponibles); cuantizacion wave-quant hibrida con submodular H=96 |
| Parametros totales | no disponible (repo de 47,1 GB en pesos cuantizados a ~2,7 bpw) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens configurados (256 paginas KV, b_max=32); capacidad maxima autoasignada de 1.841.536 tokens (14.387 paginas) en GPU de 102 GB |
| Tipos de cuantizacion | Wave-quant hibrida: SWZ3_G16, SWZ2_G64, SWZ4_G32 (caliente), VQ4 (frio), cabeza LM Top-20 SWZ8; ~2,7 bpw efectivos; layout INT8 MMA sm_120 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (48 shards `layers_00_05` .. `layers_42_47`, `globals.safetensors`, `qsa_indexer.safetensors`, `dflash2_swz4_calibrated.safetensors`) |

## Arquitectura y entrenamiento
El artefacto es una cuantizacion post-entrenamiento del modelo base Qwen/Qwen3.8-Flash-Next, no un reentrenamiento. La arquitectura del transformer subyacente no se detalla en la informacion disponible; lo que se describe con precision es la capa de compresion: un esquema de tiering submodular con H=96 que asigna codebooks de distinta granularidad a pesos calientes (SWZ3 con grupo 16, SWZ2 con grupo 64, SWZ4 con grupo 32) y cuantizacion vectorial VQ4 a pesos frios. Los embeddings residen en memoria host con asignacion pinned y zero-copy, y la cabeza LM se fusiona en un formato Top-20 SWZ8.

La calibracion se realizo con GPTQ de Hessian Block-32 de rango completo, complementado con una ganancia diagonal Schur-Hadamard SPD y una compuerta de validacion basada en mean_tau. Los logs incluidos (`tap_recalib`) muestran dos modos: mode0 selecciono block32_gptq con val_mean_tau 4,759 y 214,22 tok/s frente a clean_rtn_g32 con 4,483 y 197,73 tok/s; mode2 selecciono schur_diag_gain_b32_gptq con val_mean_tau 5,15 y 233,34 tok/s frente a block32_gptq (5,12; 229,65 tok/s) y clean_rtn_g32 (4,933; 221,64 tok/s). El proceso de recalibrado de taps requirio 423,68 s. Se incorpora decodificacion especulativa DFlash2 con HybridTree-16.

## Capacidades
- Generacion de texto autoregresiva heredada del modelo base Qwen3.8-Flash-Next (calidad condicionada por la compresion a ~2,7 bpw).
- Razonamiento y generacion de codigo/matematicas: la telemetria incluye una compuerta SelfGen_MathCode con KLD 0,041747 (95,115% Top-1) frente a la variante WV-3.5bpw.
- Decodificacion especulativa DFlash2 con HybridTree-16, alcanzando mean_tau de 4,695 y 197,06 tok/s en b=1.
- Soporte de contexto largo: hasta 32.768 tokens configurados y capacidad paged KV de 1.841.536 tokens en GPU de 102 GB.
- Despliegue bare-metal optimizado para sm_120 (Blackwell) con layout INT8 MMA.
- Soporte de tool calling, agentes o multimodal: no disponible en la informacion proporcionada (dependera del modelo base, no documentado aqui).
- Capacidades multilingues: no disponibles.

## Casos de uso
- Servicio de inferencia de baja latencia en una unica GPU Blackwell: con 49,333 GiB de VRAM estatica para b_max=32 y 256 paginas KV, el modelo cabe en una RTX PRO 6000 Blackwell y permite atender lotes pequenos sin sharding.
- Despliegue de alto throughput por lotes: 1304,75 tok/s en b=30 greedy con burst_k=8 lo hace adecuado para pipelines batch de generacion masiva (resumos, clasificacion, extraccion) donde la latencia por peticion no es critica.
- Evaluacion de tecnicas de cuantizacion extrema: sirve como referencia reproducible para comparar wave-quant 2,7 bpw frente a WV-3.5bpw usando las compuertas KLD incluidas (SelfGen_MathCode, All_Unique_12282, Sparse-QSA).
- Prototipado de decodificacion especulativa: los artefactos DFlash2 y los logs de mean_tau permiten medir el impacto de HybridTree-16 sobre tok/s en b=1.
- Investigacion de calibracion GPTQ: los logs `tap_recalib` documentan la comparacion entre RTN y GPTQ Block-32 con y sin ganancia Schur-Hadamard, util para estudiar el compromiso entre KLD y throughput.
- Contextos largos en memoria: la capacidad paged KV de hasta 1,84 M tokens en 102 GB permite experimentos de recuperacion sobre documentos extensos, siempre que se acepte la degradacion de la cuantizacion a 2,7 bpw.
- Benchmarking de hardware Blackwell: la telemetria de VRAM y tok/s sirve como baseline para comparar configuraciones sm_120 en entornos de laboratorio.

## Benchmarks y rendimiento
Los unicos datos publicados son las compuertas de validacion y la telemetria de rendimiento del autor, no benchmarks estandar como MMLU, HumanEval o GSM8K.

| Metrica | Valor observado |
|---|---|
| Gate 1 SelfGen_MathCode KLD vs WV-3.5bpw (Top-1) | 0,041747 (95,115%) |
| Gate 1 All_Unique_12282 Free-Router KLD (CosSim) | 0,288488 (0,900949) |
| Gate 1 1x8192 Sparse-QSA Handover (pos 2048..8191) KLD | 0,308771 (96,647% Top-5) |
| VRAM estatica (b_max=32, 256 paginas KV = 32.768 tokens) | 49,333 GiB |
| Capacidad paged KV maxima autoasignada (102 GB) | 1.841.536 tokens (14.387 paginas) |
| b=1 greedy / sampled (temp=1.0, top_k=20) | 107,91 / 108,35 tok/s |
| b=30 greedy / sampled (burst_k=8) | 1304,75 / 991,82 tok/s |
| b=1 DFlash2 HybridTree-16 (mean_tau) | 197,06 tok/s (tau = 4,695) |
| Recalibrado de taps (elapsed) | 423,68 s |

## Requisitos de hardware
- VRAM estatica observada: 49,333 GiB con b_max=32 y 256 paginas KV (32.768 tokens) sobre una RTX PRO 6000 Blackwell de 101,97 GB GDDR7.
- GPU objetivo: NVIDIA Blackwell sm_120 (RTX PRO 6000 Blackwell). El layout INT8 MMA y los kernels ab96/shexp estan especificos para esta arquitectura; no se documenta compatibilidad con Ampere, Ada, Hopper ni consumer RTX 40/50.
- Cabe en consumer GPU: no disponible; no hay datos para RTX 4090, RTX 5090 ni otras tarjetas consumer.
- Opciones de despliegue: despliegue bare-metal con los artefactos safetensors y manifest incluidos; no se documenta integracion con vLLM, llama.cpp, Ollama o TGI.
- Throughput: 107,91 tok/s en b=1 greedy, 1304,75 tok/s en b=30 greedy, 197,06 tok/s con DFlash2 HybridTree-16 en b=1.
- Memoria host: requiere asignacion pinned para `W_emb` con zero-copy; el volumen exacto de RAM host no esta disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-Hybrid-2.7bpw-SM120-v20 (este) | no disponible | 32.768 configurados; hasta 1,84 M KV | ~2,7 bpw wave-quant hibrida | apache-2.0 | Hugging Face, 0 descargas |
| Qwen3.8-Flash-Next-WV-3.5bpw (referencia en las compuertas) | no disponible | no disponible | ~3,5 bpw wave-quant | no disponible | no disponible |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | pesos originales | no disponible | Hugging Face |

No se dispone de datos de rendimiento de terceros para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias
- Cuantizacion extrema a ~2,7 bpw: las compuertas KLD muestran divergencia frente a WV-3.5bpw (0,041747 en MathCode, 0,288488 en All_Unique_12282, 0,308771 en Sparse-QSA Handover), por lo que la calidad es inferior a la variante de mayor precision.
- Dependencia de hardware: los kernels y el layout INT8 MMA estan atados a sm_120 (Blackwell); no hay garantia de funcionamiento en otras arquitecturas.
- Artefacto de investigacion con 0 descargas y 0 likes: no hay validacion comunitaria ni soporte del autor documentado.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingue ni calidad por idioma.
- Riesgo de alucinacion inherente al modelo base, agravado por la compresion; no se han publicado evaluaciones de factualidad.
- Licencia Apache 2.0 permite uso comercial, pero al derivar del modelo base Qwen3.8-Flash-Next conviene verificar las condiciones del modelo original.
- No se documenta soporte de tool calling, agentes ni multimodalidad; asumir estas capacidades sin verificacion es arriesgado en produccion.
- La calibracion y los taps DFlash2 son especificos de esta release (v20); cambios de version invalidan los logs de validacion incluidos.

## Enlaces
- Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-Hybrid-2.7bpw-SM120-v20
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del autor: https://huggingface.co/Grawnch
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.

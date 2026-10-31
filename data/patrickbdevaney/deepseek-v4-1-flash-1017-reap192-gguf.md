# patrickbdevaney/DeepSeek-V4.1-Flash-1017-REAP192-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-REAP192-GGUF es una cuantización comunitaria, publicada por el usuario patrickbdevaney, del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`. El autor ha aplicado una poda de expertos (REAP) que reduce los 384 expertos enrutados por capa a 192 (un 50 %), y posteriormente ha cuantizado el resultado en formato GGUF con I-quants guiados por matriz de importancia (imatrix), obteniendo un artefacto de 85,55 GiB dividido en 3 shards que cabe íntegramente en la memoria GPU de un dispositivo de 128 GB, como un NVIDIA Jetson AGX Thor.

El problema que resuelve es claro: el modelo base, con 280.050.599.024 parámetros totales y expertos nativos en MXFP4 de 4 bits, no cabe en hardware de consumo o edge. Combinando poda de expertos y cuantización agresiva (2,62 bpw globales, 2,46 bpw en expertos enrutados), el modelo ejecuta 100 % offload a GPU en un Jetson AGX Thor de 128 GB con 12,4 tok/s de decodificación (hasta 20,7 tok/s con decodificación especulativa DSpark) y soporte de visión mediante un mmproj incluido.

Es relevante porque demuestra un pipeline completo (poda REAP + ladder de cuantización + parches de llama.cpp + servidor CUDA) para llevar un MoE de gran tamaño a hardware edge, con licencia MIT que permite uso comercial sin restricciones. Requiere, eso sí, una rama específica de llama.cpp (`deepseek-v4.1-reap-thor`) para ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (DeepSeek-V4.1-Flash), 40 capas decodificador, expertos enrutados podados de 384 a 192 por capa (REAP) |
| Parametros totales | 280.050.599.024 (antes de la poda; tras la poda, no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 32K tokens |
| Tipos de cuantizacion | IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XXS (expertos, imatrix); Q8_0, Q6_K, BF16, F32 (ruta densa/atención); 2,62 bpw globales / 2,46 bpw en expertos |
| Idiomas soportados | inglés, chino |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, 85,55 GiB); artefacto hermano en safetensors MXFP4 + FP8 (146,4 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con 40 capas de decodificador y 384 expertos enrutados por capa, cuyos pesos de experto se distribuyen nativamente en punto flotante de 4 bits OCP MXFP4 (formato E2M1 + E8M0, 4,25 bpw). Sobre él, este repositorio aplica la técnica REAP (expert pruning), eliminando la mitad de los expertos enrutados por capa (192 de 384) según un keep-set verificado por hash SHA256, y conserva un checkpoint maestro sin pérdidas en MXFP4.

La cuantización GGUF (`L3`) evita re-cuantizar la rejilla FP4 a una rejilla afín de 4 bits (Q4_K_M/IQ4_XS), lo que ocuparía más de 150 GiB y degradaría la información. En su lugar, mantiene toda la ruta densa y de atención en Q8_0/Q6_K/BF16/F32 y aplica I-quants guiados por imatrix a los expertos: IQ3_XXS en capas protegidas (0, 1, 2, 8, 14, 20, 37–39) e IQ2_XS/IQ2_S/IQ2_XXS en el resto. El resultado son 2,62 bpw globales y 85,55 GiB totales. El runtime incluye decodificación especulativa mediante un modelo draft DSpark y soporte de visión vía mmproj. Los datos de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional (pipeline text-generation).
- Entrada de imágenes (visión multimodal) mediante el fichero mmproj incluido.
- Decodificación especulativa con el drafter DSpark incluido, que eleva el throughput de 12,4 a 20,7 tok/s en Jetson AGX Thor.
- Ejecución 100 % en GPU (offload completo, `-ngl 999`) en dispositivos de 128 GB de memoria unificada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: inglés y chino.

## Casos de uso

- Despliegue edge en Jetson AGX Thor: el modelo cabe íntegramente en los 128 GB del dispositivo (87,3 GiB usados, ~30,4 GiB libres) y arranca con un único script `thor/start.sh`, ideal para estaciones de inferencia autónomas sin conexión a la nube.
- Análisis de imágenes en local: el mmproj incluido permite procesar entradas visuales sin servicios externos, útil para inspección visual en robots o cámaras industriales con el hardware adecuado.
- Chatbot local de alto contexto: con 32K tokens de ventana, puede gestionar conversaciones multi-turno o resumir documentos largos en un dispositivo de sobremesa potente.
- Experimentación con poda de expertos: el pipeline completo (ops/s01 a s12, parches de llama.cpp y manifiesto con SHA256) sirve como referencia reproducible para investigar pruning MoE y cuantización extrema.
- Generación de texto con latencia mejorada: la decodificación especulativa DSpark (20,7 tok/s frente a 12,4 tok/s base) es adecuada para aplicaciones interactivas en edge.
- Prototipado con licencia permisiva: la licencia MIT permite integrar el modelo en productos comerciales sin restricciones de licenciamiento.
- Inferencia de texto de alto rendimiento en Thor: la variante hermana con servidor CUDA puro alcanza 25–40 tok/s y 739 tok/s de prefill para cargas de solo texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las únicas métricas publicadas son de rendimiento de inferencia en Jetson AGX Thor:

| Métrica | Valor |
|---|---|
| Decode (llama.cpp, GPU offload completo) | 12,4 tok/s |
| Decode con DSpark (especulativa) | 17,3–20,7 tok/s |
| Prefill (llama.cpp) | ~150 tok/s |
| Prefill (servidor CUDA, variante Thor) | 739 tok/s |
| Decode (servidor CUDA con especulación, variante Thor) | 25–40 tok/s |
| Memoria usada en Thor 128 GB | 87,3 GiB (~30,4 GiB libres) |

## Requisitos de hardware

- VRAM estimada para inferencia: ~87,3 GiB en GPU con offload completo del GGUF L3 (85,55 GiB de pesos + KV cache para 32K de contexto); requiere dispositivo con ~128 GB de memoria unificada o VRAM.
- GPU recomendadas: NVIDIA Jetson AGX Thor 128 GB (hardware objetivo declarado). Por extrapolación, una RTX 6000 Ada/A6000 de 48 GB es insuficiente; se necesitarían configuraciones multi-GPU (por ejemplo, 2–3 GPUs de 48 GB o una H100/A100 de 80 GB con offload parcial) para otros entornos, aunque esto no está documentado por el autor.
- Consumer GPU: no cabe en GPUs de consumo habituales (RTX 4090 de 24 GB, RTX 5090 de 32 GB) con offload completo; sería necesario offload parcial a CPU/RAM con la consiguiente pérdida de velocidad.
- Despliegue: rama específica de llama.cpp (`patrickbdevaney/llama.cpp@deepseek-v4.1-reap-thor`, con scripts `thor/build.sh` y `thor/start.sh`); servidor CUDA puro (`deepseek-v4.1-flash-cuda-server`, ~2x más rápido que llama.cpp en Thor, solo texto). No hay soporte documentado para vLLM, TGI u Ollama.
- Latencia y throughput estimados: 12,4 tok/s de decode, 17,3–20,7 tok/s con especulación DSpark, ~150 tok/s de prefill en la configuración llama.cpp sobre Thor.

## Comparativa con modelos similares

| Modelo | Formato / tamaño | Parámetros | Contexto | Rendimiento declarado | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-REAP192-GGUF (este repo) | GGUF L3, 85,55 GiB (3 shards) | 280 B (pre-poda) | 32K | 12,4–20,7 tok/s decode en Thor | MIT |
| DeepSeek-V4.1-Flash-1017-REAP192-Thor | thor-v1 K-quant, 106,9 GiB | 280 B (pre-poda) | no disponible | 25–40 tok/s decode, 739 tok/s prefill (servidor CUDA, solo texto) | MIT |
| DeepSeek-V4.1-Flash-1017-REAP192-MXFP4 | safetensors MXFP4+FP8, 146,4 GiB | 280 B (pre-poda) | no disponible | checkpoint maestro bit-exact | MIT |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | MXFP4 nativo (4,25 bpw en expertos) | 280.050.599.024 | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Se trata de un modelo podado al 50 % de expertos y cuantizado a ~2,6 bpw: la calidad de generación puede degradarse de forma significativa respecto al modelo base, y no se publican evaluaciones de calidad que cuantifiquen esa pérdida.
- La cuantización extrema (IQ2_XXS/IQ2_S en la mayoría de capas) conlleva riesgo elevado de alucinaciones y errores de razonamiento; no hay datos de benchmarks que permitan verificar la fiabilidad.
- Idiomas limitados a inglés y chino; no hay soporte declarado para castellano u otras lenguas.
- Requiere una rama no oficial de llama.cpp (`deepseek-v4.1-reap-thor`); no funciona con llama.cpp estándar, vLLM, TGI ni Ollama, lo que añade riesgo de mantenimiento y compatibilidad.
- El repositorio es de un autor comunitario (no de DeepSeek AI), con pocas descargas (1.093) y un único like: escaso historial de auditoría por terceros.
- Contexto limitado a 32K tokens, muy por debajo de otros modelos actuales de la familia.
- Sesgos conocidos: no disponible; hereda presumiblemente los sesgos del modelo base, sobre los que tampoco se aporta documentación.
- Restricciones de licencia: ninguna; la licencia MIT permite uso comercial, redistribución y modificación sin condiciones adicionales.
- Para producción: verificar los SHA256 del manifiesto `gguf_manifest.json` antes de desplegar y validar la calidad del modelo podado en el dominio de aplicación concreto antes de usarlo con usuarios finales.

## Enlaces

- Repositorio del modelo (GGUF): https://huggingface.co/patrickbdevaney/DeepSeek-V4.1-Flash-1017-REAP192-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Checkpoint maestro MXFP4: https://huggingface.co/patrickbdevaney/DeepSeek-V4.1-Flash-1017-REAP192-MXFP4
- Variante Thor (thor-v1): https://huggingface.co/patrickbdevaney/DeepSeek-V4.1-Flash-1017-REAP192-Thor
- Pipeline de construcción (GitHub): https://github.com/patrickbdevaney/deepseek-v4.1-flash-reap-thor
- Rama de llama.cpp: https://github.com/patrickbdevaney/llama.cpp/tree/deepseek-v4.1-reap-thor
- Servidor CUDA: https://github.com/patrickbdevaney/deepseek-v4.1-flash-cuda-server
- Papers referenciados en tags: https://arxiv.org/abs/2609.18916 y https://arxiv.org/abs/2510.13999

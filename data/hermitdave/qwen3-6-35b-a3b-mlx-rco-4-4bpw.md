# hermitdave/Qwen3.6-35B-A3B-MLX-RCO-4.4bpw

## Resumen

Qwen3.6-35B-A3B-MLX-RCO-4.4bpw es una cuantizacion en formato MLX del modelo Qwen3.6-35B-A3B, desarrollado originalmente por el equipo Qwen (Alibaba). El modelo base es un transformer MoE (Mixture of Experts) hibrido con atencion lineal y atencion completa, torre de vision y cabeza MTP (multi-token prediction), con 35.950 millones de parametros totales y aproximadamente 3.000 millones activos por token. Esta version concreta la prepara Hermit Dave mediante la tecnica RCO (rate-constrained optimization), un asignador de precision mixta con restriccion exacta de bits por peso.

El problema que resuelve esta ficha es el de ejecutar un modelo MoE de casi 36.000 millones de parametros en hardware Apple Silicon con memoria unificada limitada. El checkpoint ocupa 22,76 GB en disco con un bpw efectivo de 5,064, lo que permite cargarlo en una maquina de 64 GB (validado en un M3 Max). La cuantizacion distribuye el presupuesto de bits segun el error de reconstruccion medido por tensor, en lugar de aplicar una penalizacion uniforme.

Es relevante para desarrolladores que trabajan en inferencia local sobre macOS con MLX: ofrece un equilibrio medido entre tamano, perplexity y rendimiento zero-shot frente a una referencia de tamano equivalente (oQ4e-mtp, 22,13 GB / 4,92 bpw). La validacion reporta perplexity de 7,9726 en WikiText-2 y una media zero-shot de 0,5965 en cinco tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido (atencion lineal + atencion completa), torre de vision, cabeza MTP NextN |
| Parametros totales | 35.817.604.976 (segun safetensors); 35,95 B segun model card |
| Parametros activos | ~3 B por token (MoE top-8 sobre 256 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine, precision mixta RCO, group size 64, escalas y sesgos en bfloat16; anchuras por clase de 3 a 8 bits |
| Idiomas soportados | en (segun metadatos de Hugging Face) |
| Licencia | no disponible (la model card remite a la licencia del modelo upstream) |
| Formato de pesos | safetensors (MLX), cuantizacion affine con config.json["quantization"] |

## Arquitectura y entrenamiento

El modelo base consta de 40 capas con atencion hibrida (lineal y completa), tamano oculto de 2048 y una capa MoE con 256 expertos, top-8 y moe_intermediate_size de 512. Incluye una torre de vision (333 tensores en BF16, sin cuantizar) y una cabeza MTP NextN de 1 capa para decodificacion especulativa. Los parametros activos por token rondan los 3.000 millones, lo que reduce el coste computacional por paso frente a un modelo denso del mismo tamano.

Esta version no es un reentrenamiento, sino una conversion a MLX y cuantizacion del checkpoint upstream. La tecnica RCO (arXiv:2605.00649, ISTA-DASLab) asigna anchuras de bits por proyeccion resolviendo un problema de optimizacion con restriccion exacta de bits por peso, usando como calibracion la imatrix de bartowski (Qwen_Qwen3.6-35B-A3B-imatrix.gguf) con clip por grupo. Las anchuras resultantes: expertos enrutados a 3 bits (2 tensores) y 4 bits (80 tensores); experto compartido a 4 bits (4) y 8 bits (160); atencion lineal a 6 bits (34) y 8 bits (116); atencion completa a 4 bits (4), 6 bits (15) y 8 bits (25); MTP a 4 bits (1). Se mantienen en BF16 los embeddings, la cabeza de salida, la torre de vision, todas las normas y las puertas del router MoE. El resultado son 22,76 GB en disco y 5,064 bpw efectivos sobre los 35,95 B de parametros fuente.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (apply_chat_template).
- Razonamiento y respuesta a preguntas de conocimiento general (arc, hellaswag, mmlu, winogrande evaluados).
- Capacidad multimodal imagen-texto segun los tags del repositorio (image-text-to-text) y la torre de vision incluida; no disponible su uso efectivo en mlx-lm, que ignora la torre.
- Decodificacion especulativa mediante la cabeza MTP NextN (aceptacion greedy a 1 paso del 64,9 %), explotable con runtimes como MTPLX.
- Capacidades multilingues limitadas al ingles segun los metadatos (language: en).
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Inferencia local en Apple Silicon: cargar el checkpoint en mlx-lm sobre un Mac con 64 GB de memoria unificada permite servir el modelo sin GPU dedicada, con un pico de memoria medido de 25,2 GB.
- Prototipado de aplicaciones de chat: la plantilla de chat y el pipeline text-generation permiten montar rapidamente un endpoint conversacional local para pruebas de producto.
- Evaluacion de estrategias de cuantizacion: investigadores pueden comparar RCO frente a otras tecnicas (oQ4e, GGUF) usando la perplexity y las tareas zero-shot reportadas como referencia reproducible.
- Decodificacion especulativa acelerada: integrando la cabeza MTP con MTPLX se puede reducir la latencia de decodificacion aprovechando la aceptacion del 64,9 % a un paso.
- Experimentos con modelos MoE de gran tamano: el bajo numero de parametros activos (~3 B) permite estudiar el comportamiento de expertos y routers en hardware de consumo.
- Benchmarking de perplexity sobre WikiText-2: la configuracion de validacion (256 secuencias de 512 tokens, 130.816 tokens, sin BOS) sirve como protocolo de comparacion entre checkpoints.
- Base para pipelines de vision futuros: la torre de vision se conserva intacta en BF16, aunque el runtime actual no la explota; queda disponible para runtimes que la soporten.

## Benchmarks y rendimiento

Validacion en WikiText-2 test (256 x 512 = 130.816 tokens) frente a la referencia de tamano equivalente Jundot/Qwen3.6-35B-A3B-oQ4e-mtp (22,13 GB / 4,92 bpw):

| Metrica | Esta cuantizacion | oQ4e-mtp |
|---|---|---|
| Perplexity (menor es mejor) | 7,9726 ± 0,0581 | 7,9772 ± 0,0582 |
| Media zero-shot (5 tareas x 400) | 0,5965 | 0,5910 |
| Aceptacion greedy MTP a 1 paso | 64,9 % | 66,0 % |
| Prefill / decode (tok/s) | 664,2 / 60,0 | no disponible |
| Memoria pico | 25,2 GB | no disponible |

Precision zero-shot por tarea:

| Tarea | Esta cuantizacion | oQ4e-mtp | Delta |
|---|---|---|---|
| arc_challenge | 0,5400 | 0,5275 | +0,0125 |
| arc_easy | 0,8075 | 0,8050 | +0,0025 |
| hellaswag | 0,5425 | 0,5325 | +0,0100 |
| winogrande | 0,5300 | 0,5350 | -0,0050 |
| mmlu | 0,5625 | 0,5550 | +0,0075 |

No se reporta ratio de recuperacion frente al profesor BF16 de 72 GB porque este no cabe en una maquina de 64 GB.

## Requisitos de hardware

- VRAM o memoria unificada: pico medido de 25,2 GB durante la inferencia; el checkpoint ocupa 22,76 GB en disco.
- GPU recomendadas: validado en Apple Silicon M3 Max con 64 GB de memoria unificada; no se reportan pruebas en A100, H100 ni RTX 4090.
- Consumer GPU: no disponible; el formato MLX esta orientado a Apple Silicon, no a CUDA.
- Opciones de despliegue: mlx-lm 0.32.2 con MLX 0.32.3 (macOS); para explotar la cabeza MTP, MTPLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de 664,2 tok/s y decode de 60,0 tok/s en el hardware de validacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Esta cuantizacion (RCO 4.4bpw) | 35,95 B totales / ~3 B activos | no disponible | MLX safetensors, 22,76 GB, 5,064 bpw | no disponible | PPL 7,9726; zero-shot 0,5965 |
| Jundot/Qwen3.6-35B-A3B-oQ4e-mtp | 35,95 B totales / ~3 B activos | no disponible | MLX, 22,13 GB, 4,92 bpw | no disponible | PPL 7,9772; zero-shot 0,5910 |
| Qwen/Qwen3.6-35B-A3B (upstream) | 35,95 B totales / ~3 B activos | no disponible | BF16, ~72 GB | no disponible | no disponible en esta informacion |

## Limitaciones y advertencias

- El modelo base esta etiquetado solo para ingles; el rendimiento en castellano no esta documentado.
- La licencia no esta disponible en los metadatos; la model card remite a la del modelo upstream, por lo que debe verificarse antes de uso comercial.
- La cuantizacion introduce perdida frente al profesor BF16; no se puede medir el ratio de recuperacion porque el profesor de 72 GB no cabe en 64 GB.
- mlx-lm ignora la torre de vision y la cabeza MTP: la inferencia es solo de texto y la multimodalidad no esta operativa en ese runtime.
- La aceptacion MTP a 1 paso (64,9 %) es ligeramente inferior a la referencia (66,0 %), lo que afecta la ganancia de la decodificacion especulativa.
- winogrande empeora frente a la referencia (-0,0050); las demas tareas mejoran marginalmente.
- El checkpoint esta validado en un unico entorno (M3 Max 64 GB, macOS, mlx-lm 0.32.2); no hay datos de estabilidad en otros sistemas.
- Riesgo de alucinacion inherente a modelos generativos; no se documentan evaluaciones especificas de sesgo o toxicidad.
- El repositorio registra 0 descargas y 0 likes en el momento de la ficha, por lo que no cuenta con validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hermitdave/Qwen3.6-35B-A3B-MLX-RCO-4.4bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Referencia de tamano equivalente: https://huggingface.co/Jundot/Qwen3.6-35B-A3B-oQ4e-mtp
- Repositorio RCO: https://github.com/ISTA-DASLab/RCO
- Paper RCO: arXiv:2605.00649
- Runtime MTP: https://github.com/youssofal/MTPLX
- Imatrix de calibracion: Qwen_Qwen3.6-35B-A3B-imatrix.gguf (bartowski)

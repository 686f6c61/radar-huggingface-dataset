# defnoteatin/PseudoBrain-Qwen3-Coder-Next-NVFP4

## Resumen

PseudoBrain-Qwen3-Coder-Next-NVFP4 es una reimplementación cuantizada del modelo Qwen3-Coder-Next de Qwen, publicada por el usuario defnoteatin (Ian Kurt Galeon) en Hugging Face. Se trata de un modelo de generación de texto orientado a programación y uso agéntico, con arquitectura MoE híbrida de 80B parámetros totales y unos 3B activos (según la nomenclatura "80B-A3B" del autor), cuantizado a formato NVFP4 (W4A16) para reducir el peso en memoria a unos 41,5 GB.

La aportación principal no es el modelo base, sino la arquitectura "PseudoBrain" que lo acompaña: un plugin para vLLM que combina atención con ventana deslizante, capas recurrentes Gated DeltaNet de estado constante y un sistema de memoria jerárquica ("Quest Exact Memory") apoyado en NVMe, con el objetivo de servir contextos de hasta 1.048.576 tokens manteniendo el consumo de KV cache en torno a 3 GB. Según el autor, esto permite ejecutar 1M de contexto en unos 45,5 GB de VRAM totales, algo inviable con un Transformer convencional.

Es relevante porque aborda uno de los cuellos de botella actuales del servicio de LLM: el crecimiento lineal de la KV cache y cuadrático del prefill en contextos largos. No obstante, se trata de un proyecto de un autor independiente, con 321 descargas y sin verificación de terceros, por lo que conviene evaluar los "benchmark receipts" publicados en su repositorio de GitHub antes de uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Gated DeltaNet (recurrente, estado O(1)) + atención completa con ventana deslizante de 16K + Quest Exact Memory (48 capas: 36 GDN + 12 de atención) |
| Parametros totales | 45.642.480.768 (dato real de safetensors); el autor lo denomina "80B-A3B" |
| Parametros activos | ~3B (según la designación 80B-A3B del autor; no verificado de forma independiente) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (W4A16), vía compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), diseñado para vLLM |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3-Coder-Next, un MoE de la familia Qwen3 orientado a código. La variante PseudoBrain reestructura la inferencia (no el entrenamiento) mediante una arquitectura híbrida de 48 capas: 36 capas nativas de Gated DeltaNet, cuya memoria recurrente tiene tamaño fijo O(1) independientemente del contexto, y 12 capas de atención completa (índices 3, 7, 11... 47) convertidas en una combinación de ventana deslizante de 16.384 tokens, Parallel Gated DeltaNet y "Quest Exact Memory", un mecanismo de recuperación dispersa que atiende sobre anclas (4 sinks de StreamingLLM, landmarks de super-bloques, top-k páginas de memoria y la ventana deslizante) fusionadas mediante FlashAttention-2 con LSE-merge.

Sobre esto se añaden tres innovaciones descritas por el autor: un RoPE por bloques estrictamente no solapado que preserva la continuidad local y la fidelidad de distancias temporales a 1M de tokens sin degradación estática de YaRN; una agregación global densa con landmarks residentes en HBM (1 token resumen por cada 4.096 tokens) y barridos rotativos por novedad para razonamiento multi-paso; y una decodificación de velocidad constante O(1) que separa el presupuesto de prefill del de decode, reduciendo la memoria de KV cache a 1M tokens en un 93,5 % (de ~48 GB a ~3,1 GB). El entrenamiento del modelo base corresponde a Qwen y no se detallan en la ficha datos de tokens, composición del dataset ni post-entrenamiento (RLHF/DPO): no disponible. No hay evidencia de que el propio autor haya reentrenado el modelo; el trabajo se centra en el motor de inferencia (plugin `pb27_vllm` para vLLM V1/V2).

## Capacidades

- Generacion de texto conversacional (pipeline text-generation) con enfoque en codigo.
- Razonamiento agéntico multi-paso sobre contextos extremadamente largos (hasta 1M tokens), con barridos de memoria diseñados para tareas que requieren revisar cientos de bloques de contexto.
- Gestion de repositorios de codigo completos como contexto: la ventana de 1M permite cargar proyectos enteros.
- Tool calling / function calling: soportado mediante el parser `qwen3_coder` y la opcion `--enable-auto-tool-choice` en vLLM.
- Contexto largo con memoria constante: el estado GDN es O(1) y la KV cache a 1M tokens se reduce a ~3,1 GB segun el autor.
- Servidor compatible con la API de OpenAI via vLLM.
- Capacidades multilingues: no disponible (no especificado en la model card).

## Casos de uso

- Analisis de repositorios completos: con 1M de contexto se puede cargar un monorepo entero (cientos de miles de lineas) y hacer preguntas de arquitectura, refactorizaciones globales o busqueda de bugs transversales.
- Agentes de codigo de larga ejecucion: el soporte de tool calling y el razonamiento multi-paso con barridos de memoria lo hacen adecuado para agentes que editan, ejecutan y verifican codigo a lo largo de cientos de pasos sin perder el historial.
- Migraciones de codigo a gran escala: conversion de una base de codigo entre lenguajes o frameworks aprovechando la fidelidad de distancias temporales del RoPE por bloques para mantener coherencia entre ficheros lejanos.
- Revision de logs y trazas extensas: ingesta de logs de produccion o trazas de depuracion de gran volumen para localizar causas raiz, gracias a la reduccion del 93,5 % en memoria de KV cache.
- Atencion al cliente o asistencia documental sobre corpus masivos: consultas sobre manuales, contratos o documentacion tecnica que exceden las ventanas de 128K de modelos convencionales, sirviendose de los landmarks de super-bloque para recuperacion global.
- Despliegue on-premise en hardware de consumo/estacion: segun el autor, cabe en 2x RTX 3090/4090 (48 GB) o RTX 6000 Ada, lo que permite a equipos sin aceleradores de datacenter servir 1M de contexto localmente.
- Procesamiento por lotes de documentos largos: resumen y extraccion estructurada de colecciones de documentos (papeles legales, informes) en un solo pase de prefill.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la model card de Hugging Face. El autor remite a "benchmark receipts" en el directorio `reports/` de su repositorio de GitHub (https://github.com/defnotean/pseudobrain/tree/main/reports), no verificados de forma independiente. Los unicos datos cuantitativos disponibles son de ingenieria de inferencia: reduccion de la KV cache a 1M tokens de ~48,0 GB a ~3,1 GB (93,5 %) y VRAM total de ~45,5 GB con pesos de ~41,5 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: ~41,5 GB para los pesos y ~45,5 GB totales con 1.000.000 tokens de contexto (segun el autor, gracias a la reduccion de KV cache a ~3,1 GB).
- GPUs recomendadas por el autor: NVIDIA Blackwell (DGX Spark GB10, 2x RTX 5090, RTX PRO 6000 96 GB, B200); tambien se listan 2x RTX 3090/4090 (48 GB), RTX 6000 Ada (48 GB) y AMD Instinct MI300X. Nota: NVFP4 esta optimizado para hardware Blackwell; en arquitecturas anteriores puede no ejecutarse nativamente.
- Consumer GPUs: segun el autor, si cabe en 2x RTX 3090 o 2x RTX 4090 (48 GB combinados); no cabe en una sola GPU de 24 GB.
- Despliegue: exclusivamente via vLLM con el plugin `pb27_vllm` (instalable con `pip install --no-deps "git+https://github.com/defnotean/pseudobrain.git#subdirectory=serving/pb27_vllm"`). No hay soporte indicado para llama.cpp, Ollama o TGI. Comando de ejemplo: `vllm serve defnoteatin/PseudoBrain-Qwen3-Coder-Next-NVFP4 --max-model-len 1048576 --enforce-eager --no-enable-prefix-caching --kv-cache-memory-bytes 6G --max-num-seqs 16 --enable-auto-tool-choice --tool-call-parser qwen3_coder` con `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`.
- Latencia y throughput: no disponible. El autor afirma decode de velocidad constante O(1) y usa `--enforce-eager` (sin CUDA graphs), lo que suele penalizar la latencia por token frente a ejecucion con graphs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3-Coder-Next-NVFP4 | ~45,6B (80B-A3B segun autor) | 1M | NVFP4 (W4A16) | Apache 2.0 | Requiere plugin propio de vLLM; proyecto de autor independiente |
| Qwen/Qwen3-Coder-Next (base) | 80B-A3B (segun Qwen) | 1M | BF16/FP8 oficiales | Apache 2.0 | Modelo original; sin la arquitectura PseudoBrain de memoria constante |
| RedHatAI/Qwen3-Coder-Next-NVFP4 | 80B-A3B | 1M | NVFP4 | Apache 2.0 | Cuantizacion NVFP4 por Red Hat AI sin modificaciones de arquitectura |
| Qwen/Qwen3-Coder-Next-FP8 | 80B-A3B | 1M | FP8 | Apache 2.0 | Requiere ~80,5 GB de pesos; para H200/MI300X/2x A100-H100 |

En esencia, esta ficha compite con las cuantizaciones oficiales y de terceros del mismo modelo base; su diferenciador es el consumo de KV cache a 1M tokens, a costa de depender de un plugin no estandar y de una menor trazabilidad.

## Limitaciones y advertencias

- Proyecto de autor independiente (321 descargas, 0 likes en el momento de la ficha): los datos de rendimiento proceden del propio autor y no estan verificados por terceros. Validar con los reports de GitHub antes de produccion.
- NVFP4 requiere hardware NVIDIA Blackwell para ejecucion nativa; en GPUs Ampere/Ada/Hopper el soporte no esta garantizado pese a que el autor las liste como destino.
- Dependencia de un plugin especifico (`pb27_vllm`) con soporte "version-resilient" de vLLM: actualizaciones de vLLM pueden romper la compatibilidad; se usa `--enforce-eager` y se desactiva prefix caching, con impacto en latencia y reutilizacion de prefijos.
- Sesgos: hereda los del modelo base Qwen3-Coder-Next; no se documentan sesgos especificos (no disponible).
- Riesgo de alucinacion: tipico de LLM de codigo; con contextos de 1M y recuperacion dispersa (top-k paginas, landmarks), existe riesgo adicional de omision u error de atribucion en contextos muy largos.
- Idiomas soportados no especificados; la model card no documenta capacidades multilingues.
- La discrepancia entre los parametros reales de safetensors (45,6B) y la denominacion "80B-A3B" del autor no esta aclarada; verificar la configuracion MoE real antes de planificar capacidad.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero sin garantias; el autor ofrece soporte empresarial on-premise de forma separada.
- No hay soporte para llama.cpp/Ollama, lo que limita el despliegue en entornos sin vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-Coder-Next-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Cuantizaciones relacionadas: https://huggingface.co/RedHatAI/Qwen3-Coder-Next-NVFP4 · https://huggingface.co/qtum/Qwen3-Coder-Next-AWQ · https://huggingface.co/Qwen/Qwen3-Coder-Next-FP8
- Repositorio GitHub (plugin pb27_vllm): https://github.com/defnotean/pseudobrain
- Paper de arquitectura: https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf · https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Reports de benchmarks del autor: https://github.com/defnotean/pseudobrain/tree/main/reports
- Perfil del autor: https://huggingface.co/defnoteatin · https://github.com/defnotean

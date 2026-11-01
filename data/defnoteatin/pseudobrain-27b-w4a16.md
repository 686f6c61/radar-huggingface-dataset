# defnoteatin/PseudoBrain-27B-W4A16

## Resumen

PseudoBrain-27B-W4A16 es un modelo de generación de texto de 27.356 millones de parámetros creado por el usuario defnoteatin, basado en la serie Huihui-Qwen3.8-27B-abliterated (a su vez derivada de la familia Qwen). Su propuesta de valor principal no es el tamaño, sino la arquitectura: combina atención por ventana deslizante con capas recurrentes Gated DeltaNet (GDN) para ofrecer una ventana de contexto de hasta 1.048.576 tokens (1M) con consumo de memoria KV prácticamente constante, lo que permite servir contextos extremadamente largos en una sola GPU de consumo.

El problema que resuelve es el clásico cuello de botella del servicio de modelos con contexto largo: en un Transformer estándar la caché KV crece linealmente con la longitud de secuencia y el prefill crece cuadráticamente, provocando OOM en workloads de 128K–1M tokens aunque los pesos quepan en la GPU. PseudoBrain afirma reducir la memoria de caché KV en un 99,2 % a 1M tokens (de 64 GB a unos 486 MiB de ventana activa con un pool de 6 GB).

El modelo se distribuye bajo licencia Apache 2.0 en formato safetensors con cuantización W4A16 (compressed-tensors), pesa unos 23,3 GB en el repositorio y está diseñado para ejecutarse con vLLM mediante un plugin propio (`pb27_vllm`). Al tratarse de una versión "abliterated" (sin filtros de seguridad), requiere especial cautela en entornos de producción. No se ha publicado documentación de terceros que verifique las cifras de rendimiento del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: ventana deslizante + Gated DeltaNet paralelo + Quest Exact Memory (PB27ForConditionalGeneration) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no consta que sea MoE; el propio README lo describe como modelo denso) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | W4A16 (compressed-tensors); existen ediciones FP8, NVFP4 y BF16 en otros repositorios del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), tamano del repo 23,3 GB |

## Arquitectura y entrenamiento

La arquitectura consta de 64 capas: 48 capas Gated DeltaNet nativas y 16 capas de atencion global completa (en las posiciones 3, 7, 11, ..., 63) convertidas en atencion por ventana deslizante de 16K tokens mas Gated DeltaNet paralelo mas "Quest Exact Memory". El estado recurrente del GDN tiene tamano fijo O(1) independientemente de si el contexto es de 4K o 1M tokens, lo que elimina el crecimiento lineal de la memoria KV.

Sobre las capas de anclaje dispersas, las consultas atienden sobre 4 sinks de StreamingLLM, landmarks de super-bloques, paginas top-k de Quest Exact Memory y una ventana deslizante de 16.384 tokens, fusionadas via FlashAttention-2 con LSE-merge y limites jerarquicos de dos niveles en bf16 (super-bloques de 64 tokens). Se anade un RoPE por bloques estrictamente no solapado y proporcional, que preserva la continuidad local y la fidelidad de distancia temporal a escala de 1M tokens sin degradacion estatica tipo YaRN. La decodificacion se declara de coste constante O(1) gracias a la separacion del presupuesto de recuperacion entre prefill y decode (stride de 64, 64 bloques en decode).

Sobre el entrenamiento: no disponible. La model card no detalla numero de tokens, composicion del dataset ni procesos de post-entrenamiento (RLHF/DPO). El modelo parte de pesos ya existentes (Huihui-Qwen3.8-27B-abliterated y sus cuantizaciones), por lo que parece tratarse principalmente de un trabajo de ingenieria de inferencia y reempaquetado arquitectural mas que de un entrenamiento desde cero. No se puede verificar si se reentreno alguna parte del modelo.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation), heredada de la base Qwen3.8 abliterada.
- Razonamiento multi-paso: el README describe mecanismos de barrido de memoria ("novelty-rotating decode working-set sweeps") disenados para razonamiento agente sobre cientos de bloques distintos en contextos de 1M tokens.
- Codigo: el comando de despliegue recomendado activa `--tool-call-parser qwen3_coder`, lo que indica soporte de tool calling con el formato de Qwen3 Coder.
- Tool calling / function calling: soportado via `--enable-auto-tool-choice` con parser qwen3_coder en vLLM.
- Contexto ultra-largo: hasta 1.048.576 tokens con memoria KV casi constante, la capacidad diferencial del modelo.
- Modo de razonamiento: el parser `qwen3` de reasoning esta activado en el despliegue recomendado, lo que sugiere compatibilidad con salidas de razonamiento estilo Qwen3.
- Vision, audio u otras modalidades: no disponible; el pipeline declarado es solo text-generation.
- Contenido sin restricciones: al ser una version abliterated, genera contenido que la base original rechazaria; esto es una caracteristica declarada, no una capacidad tecnica.

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M tokens de contexto cabe el arbol fuente de proyectos grandes enteros; el modelo puede responder preguntas sobre arquitectura del codigo, buscar bugs transversales y generar documentacion global sin fragmentar el analisis.
- Revision de documentacion y contratos extensos: ingesta de manuales tecnicos, expedientes legales o documentacion regulatoria de cientos de paginas, manteniendo referencias a secciones lejanas gracias a los landmarks de super-bloques y la fidelidad posicional del RoPE por bloques.
- Asistentes sobre historiales largos: chat con historiales de conversacion de meses (logs de soporte, historiales clinicos o de investigacion) sin resumir ni truncar, ya que el estado GDN es de tamano constante y no crece con el contexto.
- Agentes con memoria de sesion prolongada: el soporte de tool calling con parser qwen3_coder permite integrarlo en frameworks de agentes que acumulan observaciones largas (navegacion web, ejecucion de herramientas) durante muchas iteraciones.
- Procesamiento por lotes de logs y telemetria: analisis de ficheros de log de gran volumen en un solo pase de prefill, aprovechando que la memoria KV activa se mantiene en torno a 486 MiB incluso a 1M tokens.
- Investigacion en sistemas de inferencia: la arquitectura hibrida GDN + atencion dispersa y el plugin vLLM son utiles como base de experimentacion para ingenieria de kernels y serving de contexto largo, con el paper de arquitectura y los informes de benchmarks publicados por el autor.
- Despliegue on-premise de contexto largo en hardware de consumo: la edicion W4A16 cabe en una RTX 3090/4090 de 24 GB con contexto de 1M tokens, evitando el coste de GPUs de datacenter para casos de uso privados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la model card de HuggingFace. El autor referencia "benchmark receipts" en el directorio `reports/` de su repositorio de GitHub y afirma una reduccion del 99,2 % en memoria de cache KV a 1M tokens (64 GB a ~486 MiB de ventana activa con pool de 6 GB), pero no hay tablas comparativas independientes verificables en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (edicion W4A16, este repo): ~15,5 GB para pesos y ~20,5 GB totales con contexto de 1M tokens, segun la model card del autor.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB), AMD RX 7900 XTX (24 GB) y RTX 5090; el autor tambien lista esta configuracion para despliegues monogpu.
- Cabe en GPU de consumo: si, en una sola GPU de 24 GB (RTX 3090/4090), algo excepcional para un modelo de 27B con 1M de contexto, gracias a la arquitectura de memoria constante.
- Despliegue: vLLM mediante el plugin `pb27_vllm` (instalable desde GitHub o desde el directorio `pb27_vllm_plugin/` incluido en el propio checkpoint); compatible con runners V1/V2 de vLLM, con soporte declarado para NVIDIA CUDA y AMD ROCm. No consta soporte para llama.cpp, Ollama ni TGI.
- Parametros de servidor recomendados por el autor: `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G`, `--max-num-seqs 16`.
- Latencia y throughput: no disponible; el autor afirma decodificacion de coste constante O(1) respecto a la longitud de contexto, pero no publica cifras de tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| PseudoBrain-27B-W4A16 | 27,4B | 1M | Hibrida SWA + Gated DeltaNet + atencion dispersa | Apache 2.0 | Requiere plugin vLLM propio; version abliterated |
| Qwen3-30B-A3B (Qwen) | 30,5B (3,3B activos) | 128K (ampliable a 256K con YaRN) | MoE Transformer | Apache 2.0 | Ecosistema maduro, benchmarks publicados, contexto mucho menor |
| Qwen2.5-32B-Instruct (Qwen) | 32,5B | 128K | Transformer denso | Qwen (uso comercial con restricciones) | Sin dependencia de plugins custom, sin abliteration |
| Gemma 3 27B (Google) | 27B | 128K | Transformer denso con atencion local/global intercalada | Gemma | Vision integrada, ecosistema amplio, contexto mucho menor |

PseudoBrain-27B se diferencia por su contexto de 1M tokens con memoria casi constante y su licencia permisiva, a costa de un ecosistema de despliegue mucho mas fragil (plugin vLLM especifico, sin soporte verificado en llama.cpp u Ollama) y de carecer de benchmarks independientes.

## Limitaciones y advertencias

- Version abliterated: el modelo ha sido modificado para eliminar los rechazos de seguridad de la base Qwen. Esto implica riesgo elevado de generar contenido ofensivo, peligroso o ilegal; no es apto para produccion sin capas de moderacion externas.
- Procedencia poco convencional: la cadena de modelos base (huihui-ai, philbert440, batsclamp) indica multiples derivaciones y cuantizaciones intermedias; no hay garantia de que la calidad del modelo original Qwen3 se haya preservado.
- Sin benchmarks independientes: las cifras de reduccion de memoria y de decodificacion O(1) provienen unicamente del autor y no han sido verificadas por terceros.
- Dependencia de un plugin propio: el modelo no funciona en vLLM estandar sin instalar `pb27_vllm`; actualizaciones de vLLM pueden romper la compatibilidad (el propio autor destaca la resiliencia de versiones como punto de diseno).
- Idiomas: no disponible; al derivar de Qwen, probablemente soporte chino e ingles de forma solida, pero no esta documentado.
- Alucinaciones: como cualquier LLM de esta clase, puede alucinar; en contextos de 1M tokens la recuperacion de informacion depende de mecanismos de atencion dispersa cuya fidelidad exacta no esta verificada independientemente.
- Despliegue restringido: requiere `--enforce-eager` y desactivacion de prefix caching segun el autor, lo que penaliza el throughput frente a despliegues vLLM convencionales.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia de los modelos base derivados ante cualquier duda legal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-27B-W4A16
- Repositorio GitHub con plugin pb27_vllm: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmarks del autor: https://github.com/defnotean/pseudobrain/tree/main/reports
- Modelo base principal: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Otras ediciones del autor: https://huggingface.co/defnoteatin/PseudoBrain-27B-FP8 y https://huggingface.co/defnoteatin/PseudoBrain-27B-BF16

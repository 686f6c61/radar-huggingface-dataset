# biMEMO/Ornith-1.5-35B-A3B-int4-AutoRound-MTP

## Resumen

Ornith-1.5-35B-A3B-int4-AutoRound-MTP es una cuantización INT4 (W4A16) del modelo de mezcla de expertos (MoE) Ornith-1.5-35B-A3B, desarrollada por biMEMO. El modelo base, creado por ornith-ai, activa aproximadamente 3.000 millones de parámetros por token de un total de 35.000 millones, y está diseñado para tareas de razonamiento, codificación y uso agéntico, superando a su par Qwen 3.6-35B en benchmarks de código y agénticos según la documentación oficial. Esta cuantización reduce el peso de unos 70 GB en BF16 a unos 20 GB, permitiendo ejecutar el modelo completo en tarjetas de consumo como la RTX 3090 de 24 GB.

La relevancia de este lanzamiento radica en que no es una simple reducción de pesos: la capa de fusión del cabezal de predicción multitoken (MTP) se conserva en BF16, de modo que la decodificación especulativa funciona de verdad, con una tasa de aceptación de borradores de entre el 85 y el 92 % en cargas de trabajo de código. Además, mantiene la ventana de contexto completa de 262.144 tokens, el modo de razonamiento (thinking), las llamadas a herramientas (tool calling) en formato qwen3_xml y la torre de visión. El modelo está verificado para vLLM ≥ 0.26 y se distribuye bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrido (atención completa + capas lineales estilo Mamba) |
| Parámetros totales | 35.000 millones (modelo base) |
| Parámetros activos | ~3.000 millones por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | INT4 (W4A16) con AutoRound; capa MTP en BF16; pesos en formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors / auto_round) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE de arquitectura híbrida que combina atención completa con capas lineales de tipo Mamba (SSM), con 35.000 millones de parámetros de los que solo ~3.000 millones se activan por token. La familia Ornith-1.5 se entrena mediante un marco de auto-mejora que propone nuevas tareas, genera scaffolds específicos y produce rollouts de soluciones para aprendizaje por refuerzo. Los datos exactos de entrenamiento del modelo base no se han publicado en la información disponible.

La cuantización presentada aquí utiliza AutoRound sobre un corpus de código y razonamiento, con un esquema W4A16 (pesos en INT4, activaciones en BF16). La innovación técnica principal es que la capa de fusión del MTP (multi-token prediction) se mantiene en BF16, lo que permite que vLLM cargue y utilice la cabeza especulativa sin errores ni omisiones silenciosas. El resto del bloque MTP, incluyendo sus 256 expertos MoE, se cuantiza junto con el modelo. También se conservan en alta precisión la capa de embeddings, las normas, los routers y la torre de visión.

## Capacidades

- Generación de texto con razonamiento: el modelo abre la respuesta con un bloque de pensamiento (`thinking`) que se puede extraer mediante un parser de razonamiento (`--reasoning-parser qwen3`).
- Llamada a herramientas (tool calling): soporta el formato `qwen3_xml`, activable con `--enable-auto-tool-choice`.
- Razonamiento multi-paso y agéntico: diseñado para bucles de agentes con herramientas, con alta velocidad de respuesta.
- Capacidad de visión: la torre de visión del modelo base se conserva intacta en la cuantización.
- Decodificación especulativa con MTP: el modelo incluye una cabeza de predicción multitoken que permite acelerar la generación; en pruebas de código se mide ~85–92 % de aceptación de borradores y ~2,6 tokens aceptados por paso.
- Contexto largo: mantiene la ventana completa de 262.144 tokens, con presupuesto de KV cache suficiente para ~1 millón de tokens en 2× RTX 3090 con KV en fp8.
- Multilingüismo: no se ha publicado la lista de idiomas soportados; se desconoce su cobertura exacta.

## Casos de uso

- Asistentes de codificación en tiempo real: con ~3.000 millones de parámetros activos, el modelo responde en pocos milisegundos y puede integrarse en entornos de desarrollo como autocompletado o copiloto de código, manteniendo la calidad en tareas de razonamiento.
- Agentes autónomos con herramientas: su soporte de tool calling y razonamiento multi-paso lo hace adecuado para pipelines de automatización que requieren llamar a APIs, consultar bases de datos o ejecutar scripts de forma secuencial.
- Servicio de alto rendimiento (alta QPS): gracias a su tamaño reducido y a la decodificación especulativa, puede servir cientos de peticiones concurrentes en un clúster de 2–4 GPUs de consumo, con un throughput agregado de hasta ~416 tokens/s en 4× RTX 3090.
- Análisis de documentos extensos: con 262K de contexto, puede procesar manuales, contratos o repositorios completos y extraer información o generar resúmenes sin necesidad de dividir el texto.
- Chatbots de atención al cliente con contexto largo: la ventana de contexto permite mantener conversaciones multi-turno muy largas con memoria completa de todo el historial, sin pérdidas de información.
- Prototipado y experimentación en investigación: al caber en tarjetas de consumo, permite probar arquitecturas MoE híbridas y técnicas de cuantización con MTP en entornos locales sin depender de infraestructura en la nube.

## Benchmarks y rendimiento

El autor publica medidas de rendimiento de inferencia en su hardware (4× RTX 3090, PCIe Gen4 x4, sin NVLink) con un prompt fijo de ~8.200 tokens y 512 tokens de generación, a temperatura 0 y con el modo de razonamiento desactivado. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

**Configuración TP=2 (2 GPUs) + MTP (spec 3), 8K prompt:**

| Concurrentes | Decode / req (tok/s) | Agregado (tok/s) | TTFT (s) |
|:--:|:--:|:--:|:--:|
| 1 | 195,0 | 96,2 | 2,69 |
| 8 | 74,4 | 366,8 | 3,84 |
| 16 | 33,7 | 300,4 | 5,85 |
| 32 | 19,1 | 343,0 | 10,2 |

**Configuración TP=4 + expert-parallel + MTP (TT 3), 8K prompt:**

| Concurrentes | Decode / req (tok/s) | Agregado (tok/s) | TTFT (s) |
|:--:|:--:|:--:|:--:|
| 1 | 125,9 | 62,2 | 4,16 |
| 2 | 114,9 | 143,8 | 2,47 |
| 4 | 112,1 | 299,3 | 2,17 |
| 8 | 76,9 | 416,5 | 2,81 |

## Requisitos de hardware

- VRAM estimada: el peso cuantizado ocupa ~20 GB (frente a ~70 GB en BF16). Con KV cache en fp8 y contexto completo, se recomienda al menos 2× RTX 3090 (24 GB) para uso con TP=2; con TP=4 se reparten en 4 GPUs.
- GPUs recomendadas: RTX 3090/4090 (24 GB), o A100/H100 si se necesita mayor concurrency y throughput agregado. En 2× RTX 3090 el límite útil de concurrencia es ~32 con un agregado de ~360 tok/s; en 4× RTX 3090 con expert-parallel se alcanza ~416 tok/s agregado.
- Despliegue: vLLM ≥ 0.26 es el runtime verificado. No se han publicado recetas oficiales para llama.cpp u Ollama en este repositorio, aunque existen versiones GGUF del modelo base en ornith-ai/Ornith-1.5-35B-A3B-GGUF.
- Nota de hardware: en GPUs sin P2P funcional (p. ej. pares PCIe) se debe añadir `--disable-custom-all-reduce` para evitar un error de all-reduce en la inicialización.

## Comparativa con modelos similares

| Modelo | Parámetros (activos) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B totales / ~3B activos | 262.144 | MIT | Original en BF16 y GGUF |
| Qwen 3.6-35B (MoE) | 35B totales / ~3B activos | no disponible | Apache 2.0 | Original y quants |
| Gemma 4-31B (dense) | 31B | 128K (aprox.) | Gemma license | Original y quants |
| Muse Glimmer-30B (dense) | 30B | no disponible | no disponible | Original y quants |

Según la documentación del modelo base, Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en todas las pruebas de codificación y agénticas, y supera por márgenes amplios a Gemma 4-31B y Muse Glimmer-30B en codificación agéntica. No se han publicado los números exactos de esos benchmarks en la información disponible.

## Limitaciones y advertencias

- Es un modelo de latencia/rendimiento, no de profundidad de conocimiento: con solo ~3.000 millones de parámetros activos, no alcanza a un modelo denso de tamaño total comparable en amplitud de conocimiento general o razonamiento complejo.
- Riesgo de alucinación: como todo LLM, puede generar respuestas plausibles pero incorrectas, especialmente en tareas de conocimiento específico o de razonamiento de alto nivel.
- Sesgos y cobertura de idiomas: no se ha publicado información sobre sesgos potenciales ni la lista de idiomas soportados; se recomienda auditar el modelo antes de su uso en producción.
- Cuantización: la cuantización INT4 puede introducir degradación de calidad respecto al modelo BF16, aunque la model card verifica la calidad a nivel de token. No se han publicado benchmarks de calidad para confirmar la degradación exacta.
- Compatibilidad con vLLM: para tensor-parallel ≥ 4 es obligatorio usar `--enable-expert-parallel`; sin él, el modelo produce salidas incorrectas (vLLM issue #41511). Además, se requiere vLLM ≥ 0.26.
- Restricciones de licencia: la licencia MIT es permisiva, pero el modelo base también es MIT, por lo que no hay restricciones de uso comercial conocidas.
- Hardware: en GPUs sin P2P funcional, se debe añadir `--disable-custom-all-reduce`; si se usa Mamba cache, puede ser necesario aumentar `--max-num-batched-tokens` para evitar errores de alineación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/biMEMO/Ornith-1.5-35B-A3B-int4-AutoRound-MTP
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- GGUF del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Página del modelo Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Docker image de ornith-1.5: https://hub.docker.com/r/ai/ornith-1.5
- Issue de vLLM sobre MoE W4A16: https://github.com/vllm-project/vllm/issues/41511
- Discord de biochem: https://discord.gg/z5kJJeaTeS

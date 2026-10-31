# icecubetr/DeepSeek-V4.1-Flash-1017-dsx-3.0bit

## Resumen

DeepSeek-V4.1-Flash-1017-dsx-3.0bit es una cuantización comunitaria, publicada por el usuario icecubetr, del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, un modelo multimodal (image-text-to-text) de arquitectura MoE con 551.880.865.136 parámetros totales según los metadatos de safetensors. La cuantización reduce el modelo a 213,62 GB en un único fichero GGUF, con una media de 2,9956 bits por peso en los expertos enrutados, y está pensada para ejecutarse sobre dos RTX 3090 con 192 GB de RAM.

La particularidad de esta versión es que no funciona con runtimes estándar como llama.cpp, Ollama o LM Studio: requiere el motor dsx, un runtime en Rust + CUDA diseñado específicamente para este modelo, que expone una API compatible con OpenAI y Anthropic además de una interfaz web. El componente Engram (196B) no está incluido en el GGUF; se lee en tiempo de ejecución desde los shards safetensors oficiales (~203 GB adicionales).

Es relevante porque demuestra que un MoE de más de 550B parámetros puede ejecutarse en hardware de consumo mediante cuantización agresiva por experto (GPTQ con rotación de Hadamard y asignación de presupuesto de bits por capa), manteniendo una fidelidad razonable frente al checkpoint FP8/FP4 de referencia: KL 0,1284, top-1 del 85,39% y perplejidad 8,9652 en el conjunto de evaluación de Lucebox.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE multimodal (image-text-to-text) con 15.360 expertos enrutados y componente Engram de 196B |
| Parametros totales | 551.880.865.136 (~552B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (probado con `--ctx 1048576`) |
| Tipos de cuantizacion | Mixta: PTQ1_0, Q2_0, Q3_K (expertos), Q8_0 (atención, experto compartido, head), F16 (embedding, compressor/indexer, Engram wkv), F32 (normas, router, mHC); media de 2,9956 bpw en expertos |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (variante GSQ para dsx, no compatible con llama.cpp/Ollama/LM Studio) + shards safetensors oficiales para el Engram (~203 GB) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un MoE con 15.360 expertos enrutados, un experto compartido, atención densa y un módulo adicional denominado Engram (196B parámetros, con tablas FP8/E8M0 y pesos wkv en F16), que se mantiene sin cuantizar y se lee desde los shards safetensors oficiales en tiempo de ejecución. El pipeline es image-text-to-text, lo que indica capacidad de procesar imágenes junto con texto.

En cuanto al entrenamiento del modelo base, no se han publicado detalles en la información disponible (número de tokens, composición del dataset o uso de RLHF/DPO). Lo que sí documenta la model card es el proceso de cuantización: calibración con 128 secuencias de 2.048 tokens (262.144 tokens en total) de prompts de agentes, código, razonamiento y contexto largo, más pools de fallback web/chat/multilingüe; GPTQ por experto con matrices de Hess de activaciones; rotación de Hadamard en bloques de 128 para cada experto (aplicada en runtime mediante la clave `dsx.expert_rot`); y un refit de escalas por mínimos cuadrados seguido de una segunda pasada GPTQ. La asignación del presupuesto de bits se hace a nivel de experto: 2.981 expertos en PTQ1_0 (19,4%), 1.480 en Q2_0 (9,6%) y 10.899 en Q3_K (71,0%), con presupuestos de 3,4375 bpw en las capas 0, 1, 37, 38 y 39, y 2,9375 bpw en las capas 2–36. El enrutamiento es exacto: sin pruning ni sesgo de router, la colocación de expertos solo afecta a la localidad de memoria, no a la aritmética.

## Capacidades

- Generación de texto y razonamiento: el conjunto de calibración incluye prompts de razonamiento y contexto largo, y el modelo base es un LLM MoE de gran escala.
- Comprensión multimodal: pipeline image-text-to-text, es decir, acepta imágenes y texto como entrada para generar texto.
- Contexto ultra-largo: ventana de 1.048.576 tokens probada en la configuración de referencia.
- Servidor con API compatible con OpenAI y Anthropic y interfaz web a través del motor dsx, lo que facilita la integración con clientes y herramientas existentes.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada, aunque el conjunto de calibración incluye prompts de agentes, lo que sugiere orientación a ese uso.
- Capacidades de agentes multi-paso: el dataset de calibración incluye prompts de agente y programación, pero no hay documentación específica verificada.
- Multilingüe: los pools de calibración incluyen un fallback multilingüe, pero la lista de idiomas soportados no está disponible.

## Casos de uso

- Ejecución local de un modelo frontera en hardware de consumo: con dos RTX 3090 y 192 GB de RAM se puede correr un MoE de 552B sin depender de la nube, útil para desarrolladores que necesitan privacidad total en sus datos.
- Asistentes de código y agentes de programación: el conjunto de calibración prioriza prompts de código, agentes y razonamiento, por lo que es adecuado para asistentes de desarrollo integrados en editores o pipelines locales.
- Análisis de documentos y repositorios extensos: la ventana de 1M tokens permite procesar bases de código completas, contratos largos o corpus documentales en una sola pasada.
- Prototipado de aplicaciones multimodales: al exponer una API compatible con OpenAI/Anthropic, se pueden construir demos con entrada de imagen y texto sin cambiar el cliente.
- Experimentación en cuantización extrema: la model card documenta con detalle el método (GPTQ por experto, rotación de Hadamard, refit de escalas), lo que lo hace valioso como referencia para quien investiga PTQ de MoE a ~3 bpw.
- Servidores de inferencia personales multiusuario: el motor dsx expone API y web UI, y la separación expertos en GPU/RAM/streaming desde el GGUF permite ajustar la configuración de memoria según el hardware disponible.

## Benchmarks y rendimiento

Resultados de fidelidad de la cuantización, medidos con `dsx eval` sobre el conjunto de evaluación de Lucebox (8 × 1024 tokens held-out, comparando contra las top-256 log-probs del profesor FP8/FP4):

| Modelo | Experts (bpw) | KL ↓ | Top-1 ↑ | Perplexity ↓ |
|---|---:|---:|---:|---:|
| FP8 / FP4 teacher | FP4 | 0 | 100% | 8,56 |
| Lucebox ROCMFP | 2,5 | 0,253 | 78,7% | 9,78 |
| dsx 2.6-bit | 2,6127 | 0,1972 | 82,59% | 9,3626 |
| dsx 2.8-bit | 2,7955 | 0,1575 | 84,07% | 9,0441 |
| **dsx 3.0-bit (esta versión)** | **2,9956** | **0,1284** | **85,39%** | **8,9652** |

NLL: 2,193352 sobre 8.184 tokens. Rendimiento medido en 2× RTX 3090 con 192 GB de RAM: decodificación de ~25 tok/s y procesamiento de prompts de ~400 tok/s con contexto de 1.048.576 tokens. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM y RAM: la configuración de referencia son 2× RTX 3090 (24 GB cada una, 48 GB de VRAM total) más 192 GB de RAM. En la ejecución documentada, 12.112 expertos se colocaron en la arena de RAM, 2.445 en las dos GPUs y el resto se transmitió desde el GGUF.
- El repositorio ocupa 214,6 GB (GGUF de 213,62 GB), a los que hay que sumar ~203 GB de shards safetensors oficiales para el Engram leído en runtime: se necesitan más de 400 GB de almacenamiento rápido.
- Consumer GPU: sí, específicamente RTX 3090 según la propia model card; el tag "consumer-gpu" y "rtx-3090" confirman ese objetivo. No hay datos para otras GPUs.
- Despliegue: exclusivamente mediante el motor dsx (Rust + CUDA), que expone API compatible con OpenAI/Anthropic y web UI. No es compatible con llama.cpp, Ollama, LM Studio, vLLM ni TGI.
- Latencia y throughput: ~25 tok/s de decodificación y ~400 tok/s de procesamiento de prompts en la configuración de referencia.
- Parámetro útil: `--arena-gb` controla cuánta RAM se dedica a la arena de expertos (se usó 165 GB en la medición).

## Comparativa con modelos similares

Comparativa con las otras cuantizaciones de la misma familia documentadas en la model card (todas ejecutables con dsx sobre el mismo hardware):

| Modelo | bpw expertos | KL ↓ | Top-1 ↑ | Perplexity ↓ | Tamaño |
|---|---:|---:|---:|---:|---:|
| Lucebox ROCMFP | 2,5 | 0,253 | 78,7% | 9,78 | no disponible |
| dsx 2.6-bit | 2,6127 | 0,1972 | 82,59% | 9,3626 | no disponible |
| dsx 2.8-bit | 2,7955 | 0,1575 | 84,07% | 9,0441 | no disponible |
| dsx 3.0-bit (esta ficha) | 2,9956 | 0,1284 | 85,39% | 8,9652 | 213,62 GB |

Frente a la alternativa Lucebox ROCMFP a 2,5 bpw, esta versión 3.0-bit mejora sustancialmente la fidelidad (KL de 0,1284 frente a 0,253) a costa de un tamaño mayor. No hay datos comparativos disponibles frente a modelos de otros fabricantes de tamaño o tarea similar.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a un LLM de gran tamaño, agravado por la cuantización extrema (~3 bpw): aunque las métricas de fidelidad son buenas, no hay benchmarks de tareas estándar que verifiquen la calidad de generación real.
- Sesgos conocidos: no documentados en la información disponible.
- El runtime dsx es un motor comunitario específico para este modelo; no hay garantías de soporte a largo plazo ni compatibilidad con el ecosistema estándar (llama.cpp, Ollama, vLLM).
- Requisito de memoria muy elevado: más de 400 GB de almacenamiento y 192 GB de RAM además de 2 GPUs; no es ejecutable en una sola GPU de consumo ni en la mayoría de estaciones de trabajo.
- El Engram se lee desde shards externos: cualquier error de rutas o versiones de los shards oficiales romperá la ejecución.
- La lista de idiomas soportados no está disponible; el soporte multilingüe solo se infiere indirectamente de los pools de calibración.
- Licencia MIT: sin restricciones para uso comercial del artefacto cuantizado, aunque conviene verificar la licencia del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, que no se detalla en la información proporcionada.
- Métricas de calidad medidas contra el profesor FP8/FP4, no contra el modelo en precisión completa original; la fidelidad relativa a ese checkpoint no está caracterizada.
- Proyecto con tracción muy limitada (263 descargas y 1 like en el momento de la ficha), lo que implica poca validación comunitaria.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/icecubetr/DeepSeek-V4.1-Flash-1017-dsx-3.0bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor dsx: https://github.com/lxe/dsx
- Conjunto de evaluación de Lucebox: https://huggingface.co/Lucebox/DeepSeek-V4.1-Flash-1017-ROCMFP-GGUF
- Papers referenciados en los tags: arXiv:2402.04396, arXiv:2404.00456, arXiv:2210.17323 (https://arxiv.org/abs/2402.04396, https://arxiv.org/abs/2404.00456, https://arxiv.org/abs/2210.17323)

# mudler/Inkling-2-Mini-APEX-GGUF

## Resumen

Inkling-2-Mini-APEX-GGUF es una colección de cuantizaciones GGUF del modelo thinkingmachines/Inkling-2-Mini, publicada por el equipo de LocalAI (mudler) bajo el proyecto APEX (Adaptive Precision for EXpert Models). El modelo base es un Mixture-of-Experts con bucle de Thinking Machines Lab: 24 capas, tamaño oculto 2304, 128 expertos enrutados con 8 activos por token y sin experto compartido, con un núcleo (capas 6 a 17) que se ejecuta tres veces por token. Cuenta con 26.070.385.152 parámetros totales según safetensors, aunque el checkpoint original pesa unos 19 GB en pesos de 4 y 8 bits.

La relevancia de esta ficha reside en que APEX aplica una cuantización selectiva por rol de tensor y posición de capa: los expertos enrutados, que concentran la mayoría de los pesos pero solo activan una fracción por token, toleran menor precisión, mientras que las capas primera y última conservan más bits. Se ofrecen ocho niveles de cuantización entre 11,34 GB y 20,68 GB, con métricas de perplejidad y divergencia KL frente al modelo BF16 de referencia.

El modelo es multimodal en origen, pero los ficheros de cuantización contienen únicamente el modelo de lenguaje; el proyector de visión se distribuye como fichero sidecar separado (mmproj). También se incluye un drafter de decodificación especulativa DSpark en Q8_0. La licencia es Apache 2.0 y requiere llama.cpp posterior al commit `29b52d398` (PR 32694, "Inkling 2 Mini").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts con bucle (looped MoE); 24 capas, hidden size 2304, 128 expertos enrutados, 8 activos por token, sin experto compartido; núcleo de capas 6-17 ejecutado 3 veces por token |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible (8 de 128 expertos enrutados por token, sin cifra oficial de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF k-quant e i-quant (tiers APEX: Quality, I-Quality, Balanced, I-Balanced, Compact, I-Compact, I-Mini, I-Nano); el modelo base usa pesos de 4 y 8 bits float (~19 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con sidecar mmproj F16 para visión y drafter DSpark Q8_0) |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts con bucle: 24 capas con tamaño oculto 2304, 128 expertos enrutados y 8 activos por token, sin experto compartido. Las capas 6 a 17 forman un núcleo que se ejecuta tres veces por token, lo que aumenta la profundidad efectiva sin incrementar el número de parámetros. El ancho del FFN de cada experto es 1152, que no es múltiplo de 256; por ello, llama.cpp almacena los expertos `ffn_down` en un tipo legacy de 32 anchos cuando el tier solicita un tipo k-quant o iq, lo que explica que los tiers pequeños reduzcan menos tamaño del que sugieren sus nombres.

La cuantización APEX (Adaptive Precision for EXpert Models) asigna precisión según el rol del tensor y la posición de la capa: los expertos enrutados, que solo se activan parcialmente por token, se comprimen más; las capas primera y última conservan mayor precisión; las capas intermedias se comprimen más agresivamente; y la atención sigue el mismo gradiente. Los ficheros con prefijo `I-` emplean una importance matrix construida con datos de calibración diversos (chat, código, razonamiento, tool-calling, trazas agénticas y Wikipedia). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

El repositorio incluye además un proyector de visión F16 (mmproj, 639.348.512 bytes) convertido con `convert_hf_to_gguf.py --mmproj`, y un drafter de decodificación especulativa DSpark en Q8_0 (402.278.560 bytes) para `--spec-type draft-dspark`, espejo del publicado por unsloth y convertido a partir del bloque `mtp.safetensors` del checkpoint oficial. El conversor del drafter no está en llama.cpp master, por lo que no se pudo reconstruir; su SHA-256 es `2ec78510da837e8fc3be54a14757a0c5fbd2d8d9e85a0d92853fafdf674f3773`.

## Capacidades

- Generación de texto conversacional: el modelo es un modelo de razonamiento (thinking model) y requiere al menos 120 tokens de generación antes de juzgar una respuesta.
- Razonamiento multi-paso: el bucle de capas 6-17 ejecutado tres veces por token favorece el procesamiento iterativo.
- Capacidades multimodales: el modelo base es multimodal; la entrada de imagen se habilita cargando el sidecar `mmproj-Inkling-2-Mini-F16.gguf` con `llama-mtmd-cli`.
- Tool calling y function calling: la importance matrix de los tiers `I-` incluye datos de tool-calling y trazas agénticas, lo que sugiere soporte de estas capacidades (no se detalla el formato exacto en la información disponible).
- Decodificación especulativa: soporte de drafter DSpark mediante `--spec-type draft-dspark`.
- Capacidades multilingües: no disponible.
- Capacidades de código y matemáticas: no disponibles de forma explícita en la información proporcionada.

## Casos de uso

- Despliegue local en hardware de consumo: el tier I-Nano (11,34 GB) o I-Mini (12,36 GB) permiten ejecutar un MoE de 26.000 millones de parámetros en GPUs con 12-16 GB de VRAM, algo inviable con el checkpoint BF16 de 52,23 GB.
- Asistente conversacional con razonamiento: el tier Balanced (20,68 GB) mantiene una perplejidad de 6,965 frente a 6,862 del BF16, adecuado para chat multi-turno donde se requiere coherencia con pérdida mínima de calidad.
- Procesamiento de documentos con imágenes: cargando el proyector de visión (mmproj F16) junto con cualquier tier se habilita la entrada de imagen, útil para extracción de información de capturas, diagramas o documentos escaneados.
- Inferencia de baja latencia en servidores: el drafter DSpark Q8_0 permite decodificación especulativa, reduciendo el coste por token en despliegues con llama.cpp y GPUs dedicadas.
- Investigación sobre cuantización de MoE: los tiers con y sin importance matrix permiten comparar el impacto de la calibración en la divergencia KL (0,0063 en Quality frente a 0,0701 en I-Nano) para estudiar métodos de compresión.
- Integración en LocalAI: al estar publicado por el equipo de LocalAI, los ficheros GGUF son directamente compatibles con ese runtime para servir el modelo vía API compatible con OpenAI.
- Evaluación de modelos de razonamiento: al ser un thinking model, encaja en pipelines de generación de cadenas de razonamiento, siempre que se configure un límite de tokens suficiente (mínimo 120).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que no se ha ejecutado ninguna suite de benchmarks. Sí se publican métricas de compresión frente al BF16 de referencia, medidas con `llama-perplexity` sobre wikitext-2 (contexto 512, todos los chunks) con llama.cpp `29b52d398` y CUDA:

| Tier | Tamano | PPL | KLD media | KLD mediana | KLD 99,9% | Mismo token top-1 |
|---|---|---|---|---|---|---|
| BF16 (referencia) | 52,23 GB | 6,862 | - | - | - | - |
| APEX-Quality | 20,07 GB | 6,873 | 0,0063 | 0,0029 | 0,174 | 96,5 % |
| APEX-Compact | 14,10 GB | 6,965 | 0,0245 | 0,0127 | 0,632 | 93,2 % |
| APEX-I-Nano | 11,34 GB | 7,227 | 0,0701 | 0,0386 | 1,480 | 88,6 % |

Los demás tiers (I-Quality, Balanced, I-Balanced, I-Compact, I-Mini) no han sido evaluados. La PPL del BF16 es 6,862 en su propia pasada y 6,853 en la pasada usada para los ratios KL.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11,34 GB (I-Nano) y 20,68 GB (Balanced) solo para pesos; hay que añadir el espacio de contexto y el overhead de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM para los tiers Compact/I-Compact (14,10 GB); 24 GB o más para Balanced y Quality (20,07-20,68 GB).
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) para todos los tiers; en GPUs de 16 GB para Compact e inferiores; en GPUs de 12 GB para I-Nano e I-Mini (12,36 GB puede requerir gestión cuidadosa de contexto).
- Opciones de despliegue: llama.cpp (obligatorio commit `29b52d398` o posterior), `llama-cli`, `llama-mtmd-cli` para visión, LocalAI. Compatible con endpoints según los tags del repositorio. vLLM, TGI, Ollama y otros runtimes no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. El autor solo indica que el modelo requiere al menos 120 tokens de generación para producir respuestas coherentes, lo que implica que la latencia percibida en respuestas cortas será alta.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas que permitan comparar el rendimiento con modelos de la misma categoría. La comparación se limita a las alternativas de cuantización del mismo modelo base y a la referencia BF16:

| Modelo | Parametros | Contexto | Licencia | Formato | Tamano |
|---|---|---|---|---|---|
| Inkling-2-Mini (BF16) | 26,07 B | no disponible | Apache 2.0 | safetensors | 52,23 GB |
| Inkling-2-Mini APEX-Quality | 26,07 B | no disponible | Apache 2.0 | GGUF | 20,07 GB |
| Inkling-2-Mini APEX-Balanced | 26,07 B | no disponible | Apache 2.0 | GGUF | 20,68 GB |
| Inkling-2-Mini APEX-I-Nano | 26,07 B | no disponible | Apache 2.0 | GGUF | 11,34 GB |
| unsloth/Inkling-2-Mini-GGUF | 26,07 B | no disponible | Apache 2.0 | GGUF | no disponible |

No se conocen en la información proporcionada otros modelos comparables de la misma categoría (MoE de ~26 B con bucle) con datos verificables.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; el autor no documenta sesgos del modelo base ni de las cuantizaciones.
- Riesgo de alucinación: no cuantificado. Al ser un modelo de razonamiento, requiere al menos 120 tokens de generación; respuestas truncadas pueden parecer incoherentes.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base thinkingmachines/Inkling-2-Mini de forma independiente.
- Los tiers pequeños reducen menos tamaño del que sugieren sus nombres porque los expertos `ffn_down` se almacenan en un tipo legacy de 32 anchos al no ser 1152 múltiplo de 256.
- Los ficheros de cuantización contienen solo el modelo de lenguaje; la visión requiere el sidecar mmproj y no está incluida por defecto.
- Solo tres tiers tienen métricas publicadas (Quality, Compact, I-Nano); el resto no ha sido evaluado y no se ha ejecutado ninguna suite de benchmarks.
- El drafter DSpark no fue convertido por el autor sino espejado de unsloth, y su conversor no está en llama.cpp master; se debe verificar el SHA-256 publicado.
- Requiere una versión específica de llama.cpp (commit `29b52d398` o posterior); versiones anteriores no cargarán el modelo.
- El tier Quality y Balanced no son más pequeños que el checkpoint original (~19 GB), por lo que no sirven para ahorrar espacio, sino para obtener GGUF estándar con formatos k-quant.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mudler/Inkling-2-Mini-APEX-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Proyecto APEX: https://github.com/localai-org/apex-quant
- LocalAI: https://github.com/mudler/LocalAI
- GGUF alternativo de unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Apoyo al autor (Patreon): https://www.patreon.com/cw/mudler
- Apoyo al autor (Buy Me a Coffee): https://www.buymeacoffee.com/mudler
- Apoyo al autor (GitHub Sponsors): https://github.com/sponsors/mudler

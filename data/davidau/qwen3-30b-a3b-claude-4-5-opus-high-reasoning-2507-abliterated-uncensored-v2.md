# DavidAU/Qwen3-30B-A3B-Claude-4.5-Opus-High-Reasoning-2507-ABLITERATED-UNCENSORED-V2

## Resumen

Qwen3-30B-A3B-Claude-4.5-Opus-High-Reasoning-2507-ABLITERATED-UNCENSORED-V2 es un ajuste fino del modelo huihui-ai/Huihui-Qwen3-30B-A3B-Thinking-2507-abliterated, publicado por el usuario DavidAU en Hugging Face. Se trata de un modelo de mezcla de expertos (MoE) de 30.532.122.624 parametros totales, de los cuales aproximadamente 3B estan activos por token, construido sobre la arquitectura qwen3_moe con 128 expertos (8 activos por defecto) y una ventana de contexto de 256k tokens.

El modelo combina dos intervenciones: por un lado, parte de una version "abliterated" (eliminacion de direcciones de rechazo) del Qwen3-30B-A3B-Thinking-2507; por otro, aplica un ajuste fino supervisado con el dataset TeichAI/claude-4.5-opus-high-reasoning-250x para destilar patrones de razonamiento estilo Claude 4.5 Opus. El autor lo presenta como un modelo "sin censura" y "totalmente funcional", con bloques de razonamiento mas cortos que el Qwen original.

Es relevante para desarrolladores e investigadores que necesitan un modelo de razonamiento compacto y desplegable en hardware modesto (3B activos), con contexto muy largo, sin restricciones de rechazo, y con licencia Apache 2.0 que permite uso comercial. No obstante, conviene tratar con cautela las afirmaciones de rendimiento del autor, ya que los benchmarks publicados son escasos y de baja exigencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe), 128 expertos, 8 activos por defecto |
| Parametros totales | 30.532.122.624 |
| Parametros activos | ~3B por token |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | no disponible (el autor referencia GGUF, EXL2, AWQ, GPTQ, HQQ en su coleccion de ficheros fuente, pero no se detallan en la model card) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 128 expertos y 8 activos por token, heredado directamente de Qwen3-30B-A3B-Thinking-2507. La innovacion principal del ajuste es la aplicacion de un fine-tuning supervisado (no se menciona RLHF ni DPO) sobre el dataset TeichAI/claude-4.5-opus-high-reasoning-250x, orientado a destilar trazas de razonamiento de Claude 4.5 Opus en el modelo base. El autor indica que el tuning se realizo con Unsloth sobre hardware local (Linux sobre Windows).

El punto de partida es un modelo previamente "abliterated" por huihui-ai, es decir, con las direcciones de rechazo eliminadas mediante tecnicas de abliteration. El autor afirma que el ajuste posterior sirve tanto para introducir el nuevo estilo de razonamiento como para "reparar" posibles degradaciones introducidas por la abliteration. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni detalles de la funcion de perdida. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal; el modelo conserva la arquitectura estandar de Qwen3 MoE.

## Capacidades

- Generacion de texto conversacional en ingles, con bloques de razonamiento (thinking) mas cortos y concisos que el Qwen3 original.
- Razonamiento matematico y cientifico: el autor afirma que "all math, science and other goodies are fully intact".
- Generacion de codigo: capacidad heredada del modelo base Qwen3, aunque no se documenta explicitamente en la model card.
- Modo "uncensored": no rechaza peticiones de contenido violento, obsceno o explicito; en algunos casos requiere instrucciones adicionales (por ejemplo, indicar explicitamente el vocabulario a usar) para alcanzar el nivel de explicitud deseado.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Soporte de tool calling / function calling: no documentado en la model card; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, pero no se confirma soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el modo thinking del modelo base lo hace plausible.
- Capacidad de vision o audio: no disponible.

## Casos de uso

- Generacion de ficcion y narrativa sin restricciones: el modelo permite contenido violento, explicito o con lenguaje soez cuando se le dirige adecuadamente, lo que lo hace util para escritura creativa adulta, guiones de terror o dialogos con lenguaje crudo.
- Roleplay y personajes en Silly Tavern o text-generation-webui: el autor documenta ajustes especificos (smoothing factor 1.5, rep pen 1.1-1.15) para conversaciones multi-turno fluidas, aprovechando la ventana de 256k tokens para mantener contexto de personaje y escenario.
- Razonamiento matematico y cientifico asistido: con 3B parametros activos y modo thinking, puede resolver problemas de varios pasos en entornos con recursos limitados, manteniendo calidad cercana al Qwen3 original segun los benchmarks del autor.
- Despliegue en hardware de consumo: al activar solo ~3B parametros, puede ejecutarse en GPU consumer (por ejemplo, RTX 4090) o incluso en CPU a velocidades razonables, segun el autor.
- Prototipado de asistentes conversacionales en ingles con contexto largo: la ventana de 256k permite procesar documentos extensos o historiales de conversacion muy largos en una sola pasada.
- Investigacion sobre abliteration y destilacion de razonamiento: util para estudiar como el fine-tuning sobre trazas de un modelo propietario (Claude 4.5 Opus) afecta al comportamiento de un MoE abliterated, y para comparar metricas antes y despues del ajuste.
- Generacion de contenido para pruebas de robustez y red teaming: al no rechazar peticiones, sirve para generar casos adversarios y evaluar filtros de seguridad en pipelines propios.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el autor en la model card, correspondientes a benchmarks de conocimiento general (no incluyen MMLU, HumanEval ni GSM8K). Se comparan tres modelos:

| Benchmark | Este modelo (V2) | Huihui-Qwen3-30B-A3B-Thinking-2507-abliterated | Qwen3-30B-A3B normal |
|---|---|---|---|
| ARC-Challenge | 0.405 | 0.387 | 0.410 |
| ARC-Easy | 0.476 | 0.436 | 0.444 |
| BoolQ | 0.804 | 0.628 | 0.691 |
| Hellaswag | 0.656 | 0.616 | 0.635 |
| OpenBookQA | 0.374 | 0.400 | 0.390 |
| PIQA | 0.781 | 0.763 | 0.769 |
| Winogrande | 0.653 | 0.639 | 0.650 |

El autor afirma que el modelo supera al modelo base abliterated en 6 de 8 metricas y que iguala de cerca al Qwen3 normal en las restantes. Sin embargo, no se aportan resultados en benchmarks de razonamiento (GSM8K, MATH), codigo (HumanEval) ni conocimiento general (MMLU), que serian los mas relevantes para evaluar la calidad del destilado de Claude 4.5 Opus. Los numeros deben interpretarse con cautela: son puntuaciones absolutas bajas en varios benchmarks (OpenBookQA 0.374, ARC-Challenge 0.405) y no hay comparacion con modelos de referencia de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamano (30.5B parametros totales), en FP16 requeriria aproximadamente 61 GB; en cuantizacion de 4 bits, en torno a 17-18 GB; en 8 bits, unos 30-31 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, una A100 80GB o H100 permitirian FP16; una RTX 4090 (24 GB) solo admitiria cuantizaciones de 4 bits (y con ajustes).
- Cabe en GPU consumer: si, en cuantizacion de 4 bits en GPUs con 24 GB o mas (RTX 3090, 4090). El autor afirma que puede ejecutarse en GPU, CPU o dividido entre ambos a "reasonable token/second speed".
- Opciones de despliegue: transformers (libreria declarada), llama.cpp/GGUF, KoboldCpp, oobabooga/text-generation-webui, Silly Tavern (segun la model card). El autor mantiene una coleccion de ficheros fuente para generar GGUF, EXL2, AWQ, GPTQ y HQQ.
- Latencia y throughput estimados: no disponibles. Al activar solo ~3B parametros, el throughput deberia ser notablemente superior al de un modelo denso de 30B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (V2) | 30.5B totales / ~3B activos | 256k | Apache 2.0 | Hugging Face (160 descargas, 12 likes) | Destilado de Claude 4.5 Opus, abliterated, solo ingles |
| Huihui-Qwen3-30B-A3B-Thinking-2507-abliterated | 30.5B totales / ~3B activos | 256k (heredado) | Apache 2.0 | Hugging Face | Modelo base directo, sin destilado de razonamiento |
| Qwen3-30B-A3B (original) | 30.5B totales / ~3B activos | 256k | Apache 2.0 | Hugging Face | Modelo oficial, con censura y razonamiento original |
| Qwen3-30B-A3B-Thinking-2507 | 30.5B totales / ~3B activos | 256k | Apache 2.0 | Hugging Face | Version oficial de julio 2025 con modo thinking mejorado |

No se dispone de comparaciones con modelos de otros fabricantes (Llama, Mistral, DeepSeek) en la informacion proporcionada. La comparativa mas directa es con las tres variantes de Qwen3-30B-A3B, sobre las que este modelo se construye.

## Limitaciones y advertencias

- Solo soporta ingles (`language: en`); no se garantiza calidad en castellano ni en otros idiomas.
- Los benchmarks publicados son limitados (ARC, BoolQ, Hellaswag, OpenBookQA, PIQA, Winogrande) y no cubren razonamiento, codigo ni matematicas; las afirmaciones del autor sobre "exceeds the org model in 6 out of 8 metrics" no estan respaldadas por evaluaciones independientes.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar hechos; el ajuste sobre trazas de razonamiento de Claude no elimina este riesgo.
- La abliteration puede degradar capacidades: el propio autor admite que el ajuste posterior busca "reparar" problemas del modelo abliterated, lo que sugiere que la calidad base no es identica al Qwen3 original.
- Contenido sin filtro: el modelo genera contenido violento, sexual o con lenguaje soez sin rechazo; no es apto para aplicaciones de cara al publico sin moderacion adicional.
- El autor advierte que, en algunos casos, el modelo necesita instrucciones explicitas (por ejemplo, palabras concretas) para alcanzar el nivel de explicitud esperado; el comportamiento por defecto es mas "tame" de lo que cabria esperar de un modelo uncensored.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de destilado pueden tener sus propias condiciones; conviene revisar las licencias de huihui-ai y de TeichAI/claude-4.5-opus-high-reasoning-250x.
- El modelo es un ajuste de la comunidad con solo 160 descargas y 12 likes; no ha pasado por evaluaciones de seguridad ni por auditorias independientes.
- La model card incluye instrucciones de muestreo especificas (smoothing factor 1.5, rep pen 1.1-1.15) sin las cuales el rendimiento conversacional puede degradarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3-30B-A3B-Claude-4.5-Opus-High-Reasoning-2507-ABLITERATED-UNCENSORED-V2
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3-30B-A3B-Thinking-2507-abliterated
- Dataset de destilado: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Guia de parametros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Coleccion de ficheros fuente del autor (GGUF, EXL2, AWQ, GPTQ, HQQ): https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections

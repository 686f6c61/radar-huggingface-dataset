# mudler/Inkling-2-Mini-APEX-GGUF

## Resumen

Inkling-2-Mini-APEX-GGUF es una colección de cuantizaciones GGUF del modelo base thinkingmachines/Inkling-2-Mini, publicada por el equipo de LocalAI (mudler) bajo el método APEX (Adaptive Precision for EXpert Models). El modelo original, desarrollado por Thinking Machines Lab, es un Mixture-of-Experts con 26.070 millones de parámetros totales, 24 capas, tamaño oculto de 2304 y 128 expertos enrutados con 8 activos por token, sin experto compartido. La innovación estructural es que las capas 6 a 17 forman un núcleo que se ejecuta tres veces por token (arquitectura "looped MoE"). El modelo es multimodal en origen, pero estas cuantizaciones incluyen únicamente la torre de lenguaje.

La relevancia de esta publicación es doble. Por un lado, permite ejecutar un MoE de 26B en hardware de consumo mediante cuantizaciones de 11,34 a 20,68 GB. Por otro, el método APEX aplica precisión adaptativa por rol de tensor y posición de capa: los expertos enrutados toleran menor precisión porque solo se activan unos pocos por token, mientras que las capas inicial y final conservan más bits. La model card reporta métricas de perplejidad y divergencia KL frente al modelo BF16 de referencia, lo que permite elegir el nivel de cuantización con datos objetivos.

El repositorio ocupa 133,5 GB e incluye ocho archivos GGUF organizados en cuatro niveles de calidad (Quality, Balanced, Compact, Mini y Nano), con y sin importance matrix. La licencia es Apache 2.0, idéntica a la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts con núcleo de capas reutilizadas (looped MoE), transformer decoder |
| Parametros totales | 26.070.385.152 (26,07 B) |
| Parametros activos | 8 de 128 expertos enrutados por token; sin experto compartido (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF k-quant e i-quant con precisión adaptativa por rol (APEX); tiers Quality, Balanced, Compact, Mini y Nano, con y sin imatrix |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

Detalle de capas y dimensiones (según model card): 24 capas, hidden size 2304, ancho de FFN de experto 1152, capas 6 a 17 ejecutadas tres veces por token.

Tamaño de cada archivo:

| Archivo | Tamaño | Uso previsto |
|---|---|---|
| Inkling-2-Mini-APEX-Quality.gguf | 20,07 GB | máxima calidad |
| Inkling-2-Mini-APEX-I-Quality.gguf | 20,07 GB | máxima calidad, imatrix |
| Inkling-2-Mini-APEX-Balanced.gguf | 20,68 GB | propósito general |
| Inkling-2-Mini-APEX-I-Balanced.gguf | 20,68 GB | propósito general, imatrix |
| Inkling-2-Mini-APEX-Compact.gguf | 14,10 GB | GPUs de consumo |
| Inkling-2-Mini-APEX-I-Compact.gguf | 14,10 GB | GPUs de consumo, imatrix |
| Inkling-2-Mini-APEX-I-Mini.gguf | 12,36 GB | pequeño, solo imatrix |
| Inkling-2-Mini-APEX-I-Nano.gguf | 11,34 GB | el más pequeño, solo imatrix |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts con 24 capas y 128 expertos enrutados, de los cuales 8 se activan por token. No hay experto compartido, lo que concentra la mayor parte de los pesos en los expertos enrutados. La particularidad arquitectónica es el bucle: las capas 6 a 17 se ejecutan tres veces por token, de modo que el cómputo efectivo es mayor que el de un transformer de 24 capas convencional, aunque el número de parámetros únicos no cambia. El ancho de la FFN de cada experto es 1152, un valor que no es múltiplo de 256 y que obliga a llama.cpp a almacenar los tensores `ffn_down` de los expertos en un tipo legacy de 32 de ancho cuando el tier solicita k-quant o i-quant; por eso los tiers pequeños reducen menos tamaño del que sugieren los nombres de tipo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card de la cuantización no los detalla y no se ha consultado la del modelo base en esta ficha. El modelo es un "thinking model", es decir, genera cadenas de razonamiento antes de la respuesta final, y el autor recomienda al menos 120 tokens de generación para evaluar correctamente una respuesta.

La innovación técnica de esta publicación es el método APEX: cuantización con precisión adaptativa según el rol del tensor y la posición de la capa. Las capas primera y última mantienen mayor precisión, las intermedias comprimen más, y la atención sigue el mismo gradiente. Los archivos con prefijo `I-` usan una importance matrix construida con datos de calibración diversos: chat, código, razonamiento, tool-calling, trazas agénticas y Wikipedia.

## Capacidades

- Generación de texto conversacional: la model card confirma que una prompt de chat corta produjo respuestas coherentes en todos los tiers evaluados.
- Razonamiento en modo "thinking": el modelo genera cadenas de razonamiento internas; se recomienda un mínimo de 120 tokens de generación.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no confirmado explícitamente para esta cuantización; la importance matrix incluye datos de tool-calling, lo que sugiere que el modelo base lo soporta, pero no se documenta como capacidad verificada.
- Razonamiento multi-paso y uso agéntico: inferido del uso de trazas agénticas en la calibración de imatrix, sin confirmación explícita.
- Visión: no incluida en estas cuantizaciones. El modelo base es multimodal, pero la torre de visión no está en los archivos GGUF.
- Código y matemáticas: no disponible; no se han ejecutado suites de benchmark.

## Casos de uso

- Inferencia local en estación de trabajo con GPU única: con el tier Compact (14,10 GB) o Nano (11,34 GB) el modelo cabe en GPUs de consumo de 16 GB o 12 GB respectivamente, lo que permite desplegar un MoE de 26B en local sin infraestructura de servidor.
- Asistente conversacional con razonamiento visible: el modo thinking del modelo permite generar explicaciones paso a paso antes de la respuesta final, útil en herramientas de soporte técnico donde el usuario necesita ver el razonamiento.
- Prototipado de aplicaciones agénticas: la importance matrix incluye trazas agénticas y de tool-calling, lo que hace al tier `I-` más adecuado para pipelines con llamadas a herramientas, aunque la capacidad debe validarse empíricamente.
- Evaluación comparativa de cuantizaciones: los datos de perplejidad y KL permiten elegir el tier según el compromiso calidad/tamaño; el tier Quality conserva el 96,5 % del mismo token top con una PPL de 6,873 frente a 6,862 del BF16.
- Investigación sobre cuantización de MoE: el método APEX, con precisión diferenciada por rol de tensor, sirve como caso de estudio reproducible para quienes investigan compresión de modelos dispersos.
- Despliegue con llama.cpp en entornos sin CUDA: los GGUF son compatibles con llama.cpp, lo que permite ejecución en CPU o con offload parcial (`-ngl`), útil para servidores sin GPU dedicada.
- Integración en LocalAI: al estar publicados por el equipo de LocalAI, los archivos están pensados para su uso con ese runtime y con endpoints compatibles con OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card indica explícitamente que "no benchmark suite has run". Sí se reportan métricas de compresión frente al BF16:

| Tier | Tamaño | PPL | KLD media | KLD mediana | KLD 99,9 % | Mismo token top |
|---|---|---|---|---|---|---|
| BF16 (referencia) | 52,23 GB | 6,862 | — | — | — | — |
| APEX-Quality | 20,07 GB | 6,873 | 0,0063 | 0,0029 | 0,174 | 96,5 % |
| APEX-Compact | 14,10 GB | 6,965 | 0,0245 | 0,0127 | 0,632 | 93,2 % |
| APEX-I-Nano | 11,34 GB | 7,227 | 0,0701 | 0,0386 | 1,480 | 88,6 % |

Metodología: llama.cpp en el commit `29b52d398` con CUDA, `llama-perplexity` sobre el split de test de wikitext-2, contexto 512, todos los chunks, mismo corpus y contexto para la referencia BF16 y cada tier. La divergencia KL se calcula con logits guardados una vez del GGUF BF16. La PPL del BF16 es 6,862 en su propia pasada y 6,853 en la pasada usada para los ratios KL. Los tiers Balanced, Mini y los archivos sin imatrix no fueron evaluados.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11,34 GB (Nano) y 20,68 GB (Balanced) solo para los pesos; hay que sumar el espacio para KV cache y contexto, no cuantificado en la información disponible.
- GPU recomendadas: el autor cita una NVIDIA DGX Spark con 122 GB de memoria unificada como su hardware local, suficiente para MoE de clase 30-50B. Para estos tiers concretos, una GPU con 24 GB (RTX 4090, A10G, L4 de 24 GB) cubre los tiers Quality y Balanced; una de 16 GB cubre Compact; una de 12 GB cubre Nano.
- Cabe en GPU de consumo: sí. El tier Compact (14,10 GB) entra en RTX 4080/4090 de 16 GB o más; el Nano (11,34 GB) entra en RTX 3060 de 12 GB. El Quality (20,07 GB) requiere 24 GB.
- Opciones de despliegue: llama.cpp (obligatorio el commit `29b52d398` o posterior, master tras el PR 32694 "Inkling 2 Mini"), LocalAI y cualquier runtime compatible con GGUF. Compatible con endpoints OpenAI según los tags del repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento en tareas para comparar directamente. Comparativa estructural con alternativas de tamaño similar:

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Inkling-2-Mini (esta ficha) | 26,07 B totales, 8 de 128 expertos activos | MoE con núcleo de capas reutilizadas | no disponible | Apache 2.0 | GGUF (APEX), safetensors en base |
| Mixtral 8x7B | 46,7 B totales, 2 expertos activos | MoE transformer | 32k | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-32B | 32,5 B densos | Transformer denso | 128k | Apache 2.0 | GGUF, safetensors |
| DeepSeek-V2-Lite | 15,7 B totales, 2,4 B activos | MoE | 32k | MIT (código) / licencia propia | safetensors, GGUF |

La comparación de rendimiento real no está disponible porque no se han ejecutado benchmarks de tareas sobre Inkling-2-Mini en esta publicación. Las cifras de los modelos alternativos corresponden a sus especificaciones públicas y no se han verificado contra una fuente en esta ficha.

## Limitaciones y advertencias

- Sin benchmarks de tareas: no se ha ejecutado MMLU, HumanEval, GSM8K ni ninguna suite equivalente. Las únicas métricas son perplejidad y KL sobre wikitext-2, que miden fidelidad de compresión, no capacidad.
- Solo texto: la torre de visión del modelo base no está incluida. No sirve para tareas multimodales.
- Modelo de razonamiento: requiere al menos 120 tokens de generación antes de juzgar una respuesta; con límites bajos de tokens puede devolver razonamiento truncado sin respuesta final.
- Dependencia de versión de llama.cpp: necesita el commit `29b52d398` o posterior. Versiones anteriores no cargarán el modelo correctamente.
- Tiers pequeños con compresión limitada: el ancho de FFN de 1152 obliga a almacenar `ffn_down` en un tipo legacy de 32 de ancho, por lo que los tiers pequeños reducen menos tamaño del esperado. No asumir que el nombre del tipo refleja el tamaño real.
- Tiers no evaluados: Balanced, Mini y todos los archivos sin imatrix carecen de métricas publicadas. La elección entre ellos es a ciegas.
- Riesgo de alucinación y sesgos: no documentado en la información disponible. Al ser un modelo de razonamiento sin benchmarks, no hay evidencia publicada sobre su tasa de alucinación.
- Idiomas: no disponible. No se puede confirmar cobertura multilingüe ni calidad por idioma.
- Licencia: Apache 2.0 permite uso comercial, pero la model card remite a la política de uso aceptable del modelo base, que no se ha verificado en esta ficha.
- Repositorio de 133,5 GB: descargar el repo completo requiere espacio considerable; conviene descargar solo el archivo del tier elegido.
- Publicación con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria todavía.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mudler/Inkling-2-Mini-APEX-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Proyecto APEX: https://github.com/localai-org/apex-quant
- LocalAI: https://github.com/mudler/LocalAI
- Patreon del autor: https://www.patreon.com/cw/mudler
- Buy Me a Coffee del autor: https://www.buymeacoffee.com/mudler
- GitHub Sponsors del autor: https://github.com/sponsors/mudler

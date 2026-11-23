# nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-dpo

## Resumen

Llama-3.2-tiny-lm-v2-japanese-500m-dpo es un modelo de lenguaje compacto de aproximadamente 476 millones de parámetros especializado en japonés, desarrollado por el usuario nagohachi. No se entrena desde cero: se obtiene mediante poda estructurada de anchura (width pruning) sobre meta-llama/Llama-3.2-3B, seguida de preentrenamiento de recuperación sobre unos 10.000 millones de tokens, ajuste supervisado (SFT) y una fase final de alineación con DPO sobre el conjunto de preferencias llm-jp/hh-rlhf-12k-ja (unas 11.500 parejas).

El modelo emplea una implementación custom de estilo Llama incluida en el propio repositorio (requiere `trust_remote_code=True`), un vocabulario de 99.574 tokens heredado del tokenizador de llm-jp/llm-jp-3-440m y una longitud de contexto de 2.048 tokens. Se distribuye como la versión DPO de la familia tiny-lm-v2, contraparte basada en poda del modelo entrenado desde cero tiny-lm-v1-japanese-500m-dpo.

Su relevancia radica en demostrar que la poda de un modelo mayor seguida de recuperación y alineación puede superar a modelos pequeños entrenados desde cero en evaluaciones japonesas estándar (llm-jp-eval), con un coste de inferencia muy reducido y un tamaño de repositorio de 1,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (implementación custom `scratch_llama`, requiere `trust_remote_code=True`) |
| Parametros totales | 476.363.776 (~476M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | japonés (ja) |
| Licencia | Llama 3.2 Community License (derivado de Meta Llama 3.2) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo Llama con implementación propia incluida en el repositorio, resultado de aplicar poda estructurada de anchura al modelo Llama-3.2-3B hasta reducirlo a ~476M parámetros. El vocabulario (99.574 tokens) y el tokenizador provienen de llm-jp/llm-jp-3-440m, y la plantilla de chat empleada es la de llm-jp-3 instruct.

El proceso de entrenamiento consta de tres fases: preentrenamiento de recuperación sobre aproximadamente 10.000 millones de tokens tras la poda, ajuste supervisado (SFT) para obtener el modelo intermedio, y una fase final de DPO con β = 0,1, referencia SFT congelada e inicialización desde el modelo SFT, usando el dataset llm-jp/hh-rlhf-12k-ja (~11,5k parejas de preferencia). No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en japonés y conversación multi-turno con plantilla de chat de tipo instruct.
- Razonamiento básico y respuesta a preguntas en japonés, con rendimiento medido en llm-jp-eval en tareas de EL, FA, HE, MC, MR, MT, NLI, QA, RC y SUM.
- Alineación de estilo de respuesta mediante DPO sobre preferencias humanas en japonés.
- Capacidad limitada de generación de código (excluida del promedio de llm-jp-eval reportado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- No dispone de visión, audio ni modo de pensamiento (thinking mode).
- Multilingüismo no documentado: el modelo está declarado únicamente para japonés.

## Casos de uso

- Asistentes conversacionales en japonés de bajo coste: con 476M parámetros y contexto de 2.048 tokens, puede desplegarse en CPU o GPU de gama baja para chatbots de dominio acotado con respuestas alineadas vía DPO.
- Clasificación y etiquetado de texto japonés: las tareas de NLI, RC y QA del benchmark llm-jp-eval muestran un rendimiento aprovechable para extracción de información y respuesta extractiva en corpus japoneses.
- Resumen de documentos cortos en japonés: la categoría SUM obtiene 0,105 en llm-jp-eval, por encima de llm-jp-3-440m (0,029), lo que lo hace útil para resúmenes breves de notas o correos.
- Prototipado e investigación sobre poda de modelos: sirve como referencia reproducible de un pipeline poda → preentrenamiento de recuperación → SFT → DPO, con los modelos base, SFT y DPO publicados por separado.
- Evaluación comparativa de modelos japoneses pequeños: útil como línea base en experimentos con llm-jp-eval frente a modelos desde cero como tiny-lm-v1 o llm-jp-3-440m.
- Filtrado y moderación de contenido en japonés: su tamaño reducido permite ejecutarlo en lote sobre grandes volúmenes de texto con latencia baja, aunque con las limitaciones de fiabilidad propias de un modelo de 476M.
- Entornos con restricciones de memoria: al ocupar ~1 GB en safetensors en bfloat16, cabe en dispositivos embebidos o GPUs de 4-8 GB para inferencia en local.

## Benchmarks y rendimiento

Resultados en llm-jp-eval v1.4.1 (100 ejemplos del split dev por dataset, prompts 4-shot, decodificación greedy; el promedio es la media de 10 categorías, excluyendo generación de código).

| Modelo | average | EL | FA | HE | MC | MR | MT | NLI | QA | RC | SUM |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Llama-3.2-tiny-lm-v2-japanese-500m-base | 0,277 | 0,277 | 0,059 | 0,230 | 0,303 | 0,050 | 0,571 | 0,464 | 0,332 | 0,431 | 0,058 |
| Llama-3.2-tiny-lm-v2-japanese-500m-sft | 0,249 | 0,240 | 0,059 | 0,195 | 0,317 | 0,030 | 0,595 | 0,342 | 0,245 | 0,364 | 0,107 |
| Llama-3.2-tiny-lm-v2-japanese-500m-dpo | 0,249 | 0,220 | 0,063 | 0,195 | 0,307 | 0,030 | 0,595 | 0,340 | 0,242 | 0,391 | 0,105 |
| tiny-lm-v1-japanese-500m-base | 0,210 | 0,075 | 0,035 | 0,215 | 0,300 | 0,010 | 0,451 | 0,528 | 0,229 | 0,208 | 0,051 |
| tiny-lm-v1-japanese-500m-sft | 0,221 | 0,129 | 0,036 | 0,235 | 0,300 | 0,010 | 0,472 | 0,428 | 0,222 | 0,278 | 0,099 |
| tiny-lm-v1-japanese-500m-dpo | 0,220 | 0,137 | 0,035 | 0,235 | 0,293 | 0,010 | 0,476 | 0,412 | 0,232 | 0,268 | 0,102 |
| llm-jp/llm-jp-3-440m | 0,264 | 0,223 | 0,057 | 0,285 | 0,320 | 0,050 | 0,620 | 0,508 | 0,277 | 0,267 | 0,029 |
| llm-jp/llm-jp-3-440m-instruct3 | 0,274 | 0,296 | 0,060 | 0,240 | 0,313 | 0,050 | 0,646 | 0,444 | 0,229 | 0,384 | 0,073 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16 los pesos ocupan aproximadamente 0,95 GB (476M parámetros × 2 bytes); con overhead de activaciones y KV cache para 2.048 tokens, el consumo se sitúa en torno a 1,5-2,5 GB según lote y longitud de secuencia. En cuantización de 8 bits o 4 bits (no publicada oficialmente) bajaría a ~0,5-1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090 o una A100/H100 lo ejecutan con holgura. También es viable en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más, e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; la implementación custom y el tokenizador propio pueden requerir adaptaciones para esos motores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | average llm-jp-eval | Licencia | Disponibilidad |
| :--- | ---: | ---: | ---: | :--- | :--- |
| Llama-3.2-tiny-lm-v2-japanese-500m-dpo | 476M | 2.048 | 0,249 | Llama 3.2 Community | Hugging Face (nagohachi) |
| tiny-lm-v1-japanese-500m-dpo | ~500M | no disponible | 0,220 | no disponible en la información | Hugging Face (nagohachi) |
| llm-jp/llm-jp-3-440m-instruct3 | 440M | no disponible | 0,274 | no disponible en la información | Hugging Face (llm-jp) |
| Llama-3.2-tiny-lm-v2-japanese-500m-sft | 476M | 2.048 | 0,249 | Llama 3.2 Community | Hugging Face (nagohachi) |

El modelo DPO mejora claramente a su contraparte entrenada desde cero (tiny-lm-v1-dpo, 0,220) y se acerca al instruct de llm-jp (0,274), aunque queda por debajo en NLI, MT y EL. Frente a su versión SFT, el DPO mantiene el promedio (0,249) y mejora ligeramente RC (0,391 frente a 0,364) y FA (0,063 frente a 0,059), a costa de un descenso en EL y QA.

## Limitaciones y advertencias

- El promedio en llm-jp-eval (0,249) es inferior al del modelo base podado sin alinear (0,277): la alineación DPO mejora el estilo conversacional pero degrada algunas tareas de conocimiento y razonamiento.
- Riesgo elevado de alucinación y de respuestas incorrectas en tareas de conocimiento factual, propio de un modelo de 476M con contexto de 2.048 tokens.
- Contexto muy limitado (2.048 tokens): no apto para documentos largos ni conversaciones extensas sin truncado.
- Modelo monolingüe en la práctica: declarado solo para japonés; el rendimiento en otros idiomas no está documentado y previsiblemente será pobre.
- Requiere `trust_remote_code=True` por la implementación custom, lo que implica ejecutar código del repositorio y añade riesgo de seguridad y de compatibilidad con versiones futuras de transformers.
- Licencia Llama 3.2 Community: uso comercial permitido con condiciones, obligaciones de atribución ("Built with Llama") y sujeción a la Acceptable Use Policy de Meta; conviene revisar los términos antes de desplegar en producción.
- Sin soporte documentado de tool calling, agentes ni cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita su integración en pipelines de producción estándar.
- Sesgos conocidos: no documentados explícitamente por el autor; al derivar de Llama 3.2 y entrenarse con preferencias humanas japonesas, puede heredar sesgos de ambos orígenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-dpo
- Modelo SFT: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-sft
- Modelo base podado: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-base
- Contraparte desde cero (DPO): https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-dpo
- Contraparte desde cero (base): https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-base
- Contraparte desde cero (SFT): https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-sft
- Modelo origen: https://huggingface.co/meta-llama/Llama-3.2-3B
- Tokenizador: https://huggingface.co/llm-jp/llm-jp-3-440m
- Dataset de preferencias: https://huggingface.co/datasets/llm-jp/hh-rlhf-12k-ja
- llm-jp-eval: https://github.com/llm-jp/llm-jp-eval
- Blog de LLM-jp con resultados de referencia: https://llm-jp.github.io/blog/2025/02/05/instruct3.html

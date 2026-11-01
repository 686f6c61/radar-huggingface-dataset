# diablomike20/OpenAI-gpt-oss-20B-Claude-4.5-Opus-Heretic-Uncensored

## Resumen

Este modelo es un ajuste fino (fine-tune) de gpt-oss-20b de OpenAI, publicado por el usuario diablomike20 en HuggingFace. La cadena de derivación es la siguiente: parte de openai/gpt-oss-20b, que fue "descensurado" mediante la herramienta Heretic (por el usuario coder3101, obteniendo coder3101/gpt-oss-20b-heretic), y posteriormente se le aplicó un fine-tune con Unsloth sobre el dataset TeichAI/claude-4.5-opus-high-reasoning-250x, un conjunto de datos de razonamiento de alta calidad atribuido a Claude 4.5 Opus. El objetivo declarado es sustituir parcialmente el estilo de razonamiento original de gpt-oss por un razonamiento de tipo "high reasoning" y eliminar los mecanismos de rechazo del modelo.

El problema que resuelve es doble: por un lado, ofrece un modelo de 20.900 millones de parámetros sin guardrails para casos de uso como escritura creativa explícita, roleplay o investigación de alineamiento; por otro, intenta mejorar la calidad del razonamiento mediante destilación de datos de razonamiento avanzado. El autor lo etiqueta explícitamente como trabajo en progreso, advirtiendo que puede entrar en bucles y que no todo funcionará correctamente. Mantiene la licencia Apache 2.0 del modelo base y una ventana de contexto de 128k tokens según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en gpt-oss (arquitectura gpt_oss de OpenAI) |
| Parametros totales | 20.914.757.184 (dato real de safetensors) |
| Parametros activos | no disponible (no se confirma en la informacion proporcionada si es MoE ni cuantos parametros activaria) |
| Longitud de contexto | 128k tokens (segun la model card) |
| Tipos de cuantizacion | no disponible (el repo publicado pesa 41,9 GB en safetensors; no se listan cuantizaciones en la informacion proporcionada) |
| Idiomas soportados | Ingles (según los tags del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, endpoints_compatible) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de gpt-oss-20b de OpenAI, un transformer de 20.900 millones de parametros. La informacion proporcionada no detalla si la arquitectura emplea mezcla de expertos (MoE) ni el numero de parametros activos por token, por lo que no se puede confirmar. La ventana de contexto declarada es de 128k tokens.

El proceso de creacion consta de dos etapas. Primera etapa: el modelo original openai/gpt-oss-20b fue sometido al proceso "Heretic", una tecnica automatizada de abliteracion/descensurado desarrollada por el equipo P-E-W que modifica los pesos para eliminar los rechazos minimizando el dano colateral al modelo, medido mediante divergencia KL. En este caso, el resultado fue una divergencia KL de 0,2933 y una reduccion de rechazos de 98/100 a 19/100. Segunda etapa: un fine-tune realizado con la libreria Unsloth sobre el dataset TeichAI/claude-4.5-opus-high-reasoning-250x (250x sugiere multiples ejemplos de razonamiento de alta calidad), con el objetivo de reemplazar parcialmente el estilo de razonamiento nativo de gpt-oss por patrones de razonamiento atribuidos a Claude 4.5 Opus. No se dispone de informacion sobre el numero de tokens de entrenamiento, el uso de RLHF/DPO ni los hiperparametros exactos del fine-tune.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de instruccion (instruct) y pensamiento estructurado entre etiquetas `<think>` y `</think>` cuando se le solicita mediante system prompt.
- Razonamiento mejorado mediante fine-tune sobre datos de razonamiento de alta calidad (dataset claude-4.5-opus-high-reasoning-250x).
- Generacion de contenido sin rechazos: la tasa de rechazo se redujo de 98/100 a 19/100 respecto al modelo base, lo que permite horror, lenguaje vulgar y contenido para adultos sin negativas del modelo (aunque en algunos casos requiere indicaciones explicitas del usuario para alcanzar el nivel de explicitud esperado).
- Roleplay y escritura creativa, con recomendaciones de samplers concretos (smoothing factor 1,5 en KoboldCpp, text-generation-webui o SillyTavern).
- Compatible con Transformers de HuggingFace y despliegue en endpoints estandar.
- No se menciona en la informacion proporcionada soporte de vision, audio, tool calling ni capacidades agenticas.

## Casos de uso

- Escritura creativa sin restricciones: generacion de ficcion de terror, contenido explicito o lenguaje vulgar donde el modelo no rechaza la peticion, adecuado para autores que necesitan un generador sin guardrails; el autor indica que puede requerir instrucciones directas para alcanzar el nivel grafico deseado.
- Roleplay y chat con personajes: el propio autor proporciona un system prompt de ejemplo (personaje Joker de Batman) y configuraciones de samplers optimizadas para SillyTavern, KoboldCpp y text-generation-webui, lo que lo orienta a uso en frontends de rol.
- Experimentacion con estilos de razonamiento: permite comparar como un fine-tune sobre datos de razonamiento de Claude afecta al comportamiento de razonamiento nativo de gpt-oss, util en investigacion de destilacion de razonamiento.
- Investigacion de alineamiento y seguridad: al ser una variante abliterada con metricas KL y de rechazo publicadas, sirve como sujeto de estudio sobre el impacto del descensurado en la distribucion de salida de un modelo.
- Asistente local sin filtros para consultas tecnicas: puede responder preguntas sensibles (seguridad ofensiva, contenido maduro) que otros modelos rechazarian, siempre bajo responsabilidad del usuario.
- Generacion con pensamiento explicito: mediante el system prompt recomendado, produce cadenas de razonamiento entre etiquetas `<think>` antes de la respuesta final, util para depurar el proceso de razonamiento en aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica cuantitativa publicada es la del proceso de descensurado Heretic:

| Metrica | Este modelo | openai/gpt-oss-20b original |
|---|---|---|
| Divergencia KL | 0,2933 | 0 (por definicion) |
| Rechazos | 19/100 | 98/100 |

Una divergencia KL inferior a 1 se considera excelente segun el autor (0 seria ausencia total de dano al modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio en safetensors pesa 41,9 GB, lo que sugiere pesos en precision BF16/FP16; se necesitarian alrededor de 42-48 GB de VRAM para cargarlo sin cuantizar (por ejemplo, 2x RTX 3090/4090, A100 de 40/80 GB o H100). No se publican versiones cuantizadas en la informacion proporcionada, por lo que no se puede estimar VRAM para GGUF o AWQ.
- GPU recomendadas: A100, H100, o configuraciones multi-GPU de consumo (2x RTX 3090 o 2x RTX 4090) para la version completa.
- En una sola GPU de consumo (RTX 4090 con 24 GB) no cabe la version completa sin cuantizacion; seria necesario aplicar cuantizacion externa no disponible en este repo.
- Opciones de despliegue: Transformers de HuggingFace (libreria nativa declarada), endpoints compatibles de HuggingFace, y segun la model card, KoboldCpp, oobabooga/text-generation-webui y SillyTavern (estas dos ultimas mencionadas para GGUF, cuyos archivos de configuracion se referencian en la coleccion de DavidAU). No se mencionan vLLM, TGI ni Ollama explicitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Descensurado | Licencia | Notas |
|---|---|---|---|---|---|
| diablomike20/OpenAI-gpt-oss-20B-Claude-4.5-Opus-Heretic-Uncensored | 20.914.757.184 | 128k | Si (Heretic + fine-tune) | Apache 2.0 | Fine-tune de razonamiento sobre base heretic; trabajo en progreso |
| openai/gpt-oss-20b | 20.900 millones (aprox.) | 128k | No (98/100 rechazos) | Apache 2.0 | Modelo base oficial de OpenAI, con guardrails nativos |
| coder3101/gpt-oss-20b-heretic | 20.900 millones (aprox.) | 128k | Si (solo Heretic) | Apache 2.0 | Base inmediata de este modelo, sin fine-tune de razonamiento |

La comparativa se limita a la familia gpt-oss-20b, ya que es la cadena de derivacion directa documentada. No se dispone de benchmarks que permitan comparar rendimiento con alternativas de otros fabricantes.

## Limitaciones y advertencias

- El propio autor lo declara trabajo en progreso: "no todo puede funcionar correctamente" y el modelo "puede entrar en bucles" (looping), un problema conocido en fine-tunes de razonamiento.
- No esta totalmente "descensurado por entrenamiento": en algunos casos hay que dirigir explicitamente al modelo (por ejemplo, indicarle vocabulario concreto) para obtener el nivel de explicitud esperado; sin ello, el contenido puede resultar mas moderado de lo previsto.
- Solo declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior al del modelo base.
- Contenido sin guardrails: el modelo puede generar contenido ofensivo, explicito o peligroso sin rechazarlo. Su uso conlleva riesgos legales y eticos significativos y es responsabilidad exclusiva del usuario. No es adecuado para entornos de produccion orientados a publico general.
- Riesgo de alucinacion: no evaluado; al no existir benchmarks publicados, no se puede cuantificar la degradacion respecto al modelo base mas alla de la divergencia KL de 0,2933.
- El fine-tune "reemplaza parcialmente" el razonamiento de gpt-oss, lo que podria haber degradado capacidades originales (codigo, matematicas) sin que existan metricas que lo confirmen o desmientan.
- Licencia Apache 2.0: permite uso comercial, pero el modelo hereda las restricciones de uso de OpenAI aplicables al modelo base gpt-oss; conviene revisar la politica de uso del modelo original.
- Para uso en text-generation-webui con GGUF se requieren archivos de configuracion adicionales de la version fuente, un punto de friccion para el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/diablomike20/OpenAI-gpt-oss-20B-Claude-4.5-Opus-Heretic-Uncensored
- Modelo base inmediato: https://huggingface.co/coder3101/gpt-oss-20b-heretic
- Modelo original de OpenAI: https://huggingface.co/openai/gpt-oss-20b
- Dataset de fine-tune: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Guia de optimizacion de parametros referenciada en la model card: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Coleccion de archivos fuente para GGUF/EXL2/AWQ/GPTQ referenciada: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Paper o repositorio de la herramienta Heretic: no disponible (no se ha proporcionado enlace directo; el equipo responsable es "P-E-W" segun la model card)

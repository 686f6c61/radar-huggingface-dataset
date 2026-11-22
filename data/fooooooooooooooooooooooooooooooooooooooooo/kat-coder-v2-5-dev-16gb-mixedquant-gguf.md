# fooooooooooooooooooooooooooooooooooooooooo/KAT-Coder-V2.5-Dev-16GB-MixedQuant-GGUF

## Resumen

KAT-Coder-V2.5-Dev-16GB-MixedQuant-GGUF es una cuantizacion mixta del modelo Kwaipilot/KAT-Coder-V2.5-Dev, publicada por el usuario fooooooooooooooooooooooooooooooooooooooooo. No se trata de un modelo nuevo, sino de una derivacion cuantizada en formato GGUF para su uso con llama.cpp, orientada a ejecutar un modelo de codigo de gran tamano en GPUs de consumo con VRAM limitada (16-24 GB). El modelo base es un Mixture of Experts (MoE) de aproximadamente 34.660 millones de parametros totales, con arquitectura derivada de la familia Qwen 3.5/3.6, segun las etiquetas de la model card.

La propuesta principal es ofrecer dos variantes de cuantizacion mixta: IQ4_XS (unos 19,5 GB) para tarjetas de 22-24 GB, e IQ3_XXS (unos 15 GB) para tarjetas de 16 GB. La mezcla combina IQ3_XXS, IQ4_XS, Q6_K y Q8_0, manteniendo en mayor precision las capas de atencion, embeddings, salida y expertos compartidos, y reduciendo bits en los expertos de las capas FFN. Se uso una imatrix autocalibrada centrada en desarrollo web, Python y documentacion Markdown.

Es relevante porque demuestra que un modelo MoE de ~34,7B puede ejecutarse en hardware de consumo con velocidades de generacion razonables (hasta 46-74 tokens/s en una RX 7800 XT de 16 GB con la variante IQ3_XXS) y con una calidad de codigo cercana a la del modelo base, a costa de una perdida de precision controlada y de un mayor riesgo de "doubt spirals" en la variante mas agresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen 3.5/3.6 (transformer con expertos y experto compartido) |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el autor reporta pruebas con 32k de contexto |
| Tipos de cuantizacion | IQ4_XS mixto (19,5 GB) e IQ3_XXS mixto (15 GB); mezcla de IQ3_XXS, IQ4_XS, Q6_K y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base KAT-Coder-V2.5-Dev es un Mixture of Experts de ~34,7B parametros totales, con etiquetas que lo vinculan a la familia Qwen 3.5/3.6. La model card de esta cuantizacion describe la presencia de expertos FFN (ffn_gate_exps, ffn_up_exps, ffn_down_exps) en 40 capas, un experto compartido ("shared expert") y una capa denominada ssm_out, lo que sugiere una arquitectura hibrida con componentes de tipo state space ademas de atencion clasica. No se dispone de informacion sobre el numero de parametros activos por token ni sobre la composicion exacta del dataset de entrenamiento del modelo original.

El proceso de cuantizacion es el elemento tecnico diferencial de esta publicacion. El autor aplica una mezcla de precisiones por tensor: los expertos ffn_gate_exps y ffn_up_exps de las 40 capas se mantienen en IQ4_XS (variante IQ4_XS) o IQ3_XXS (variante IQ3_XXS); los expertos ffn_down_exps de las capas 0-3 y 36-39 se mantienen en IQ4_XS en ambas variantes, mientras que las 32 capas intermedias bajan a IQ3_XXS en la variante pequena. Embeddings y capa de salida se conservan en Q8_0, y atencion, ssm_out y experto compartido en Q6_K. La imatrix utilizada fue autocalibrada y sesgada hacia desarrollo web, Python y documentacion Markdown. No se menciona RLHF, DPO ni detalles del entrenamiento original.

## Capacidades

- Generacion de codigo en multiples lenguajes, con enfasis en Python y desarrollo web segun el sesgo de la imatrix.
- Razonamiento sobre problemas de programacion y resolucion de tareas tipo HumanEval y MBPP+.
- Generacion de documentacion tecnica en Markdown.
- Capacidades conversacionales multi-turno (etiqueta "conversational").
- Soporte de flujos de codificacion agentica (etiqueta "agentic-coding"), aunque no se detalla el soporte concreto de tool calling en la model card.
- Ejecucion local mediante llama.cpp con backend compatible con endpoints.
- Capacidad de trabajar con contexto de 32k tokens segun las pruebas del autor (no confirmado como maximo oficial).

## Casos de uso

- Asistente de codigo local en estaciones de trabajo con GPU de 16 GB: la variante IQ3_XXS permite ejecutar un MoE de ~34,7B en una RX 7800 XT con velocidades de 37-74 tokens/s, adecuado para autocompletado y generacion de funciones en el IDE.
- Generacion de tests unitarios y correccion de codigo en Python: los resultados de HumanEval (92-96% de pass rate) indican que el modelo puede producir soluciones verificables para problemas algorítmicos, util en pipelines de CI que generan y validan tests.
- Documentacion tecnica automatizada: la imatrix fue calibrada con documentacion Markdown, por lo que el modelo esta optimizado para redactar READMEs, docstrings y guias de API.
- Prototipado de desarrollo web: el sesgo de calibracion hacia webdev sugiere buen rendimiento en generacion de HTML, CSS y JavaScript, asi como en frameworks del ecosistema web.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp y licencia Apache 2.0, permite procesar codigo propietario sin enviarlo a servicios externos.
- Evaluacion comparativa de cuantizaciones: los datos de benchmarks del autor (pass rate, tokens medios, doubt spirals) permiten a investigadores estudiar el impacto de la cuantizacion mixta en la calidad del razonamiento de codigo.
- Educacion y experimentacion: permite a estudiantes ejecutar un MoE grande en hardware asequible para estudiar comportamiento de modelos de codigo y tecnicas de cuantizacion.

## Benchmarks y rendimiento

Los benchmarks publicados por el autor son preliminares ("WIP") y miden pass rate en HumanEval y MBPP+ con 3 ejecuciones por problema, temperatura 0,7 y top-p 0,9. No se comparan con el modelo base sin cuantizar ni con otros modelos de referencia.

| Modelo / variante | HumanEval pass rate | MBPP+ pass rate | Tokens medios (HE) | Tokens/s |
|---|---|---|---|---|
| IQ4_XS (con system prompt) | 96% | 79% | 489 | 25,9 |
| IQ4_XS (base) | 92% | 78% | 286 | 26,5 |
| IQ3_XXS (con system prompt) | 93% | 79% | 522 | 37,0 |
| IQ3_XXS (base) | 92% | 77% | 348 | 74,0 |

El autor reporta ademas metricas de "doubt spirals" (1-3% de los casos) y de problemas que alcanzan el limite de tokens (0-2%). En MBPP+ el pass rate se situa en 77-79% para todas las variantes. No se han publicado resultados de MMLU, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~15 GB para IQ3_XXS y ~19,5 GB para IQ4_XS, segun los tamanos de fichero reportados.
- GPU de 16 GB: IQ3_XXS es la variante recomendada; el autor la probo en una RX 7800 XT alcanzando 37-74 tokens/s con 32k de contexto.
- GPU de 22-24 GB: IQ4_XS cabe con holgura; el autor indica que es comoda en tarjetas de 22-24 GB.
- GPU de 24 GB o mas (RTX 3090, RTX 4090, A100, H100): ambas variantes caben; no se dispone de mediciones de throughput en estas GPU.
- Despliegue: llama.cpp es el runtime objetivo; la etiqueta "endpoints_compatible" sugiere compatibilidad con APIs tipo OpenAI. No se mencionan vLLM, TGI ni Ollama en la model card, aunque el formato GGUF es compatible con Ollama.
- Latencia y throughput: medidos unicamente en RX 7800 XT (16 GB); no hay datos para otras GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base sin cuantizar ni de alternativas comparables en la informacion proporcionada. La comparacion se limita a las dos variantes de cuantizacion de esta misma publicacion y a la referencia cualitativa al modelo original.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev-16GB-MixedQuant IQ4_XS | ~34,7B (MoE) | no disponible (probado a 32k) | Apache 2.0 | GGUF | 19,5 GB, 25,9 tok/s en RX 7800 XT |
| KAT-Coder-V2.5-Dev-16GB-MixedQuant IQ3_XXS | ~34,7B (MoE) | no disponible (probado a 32k) | Apache 2.0 | GGUF | 15 GB, hasta 74 tok/s en RX 7800 XT |
| Kwaipilot/KAT-Coder-V2.5-Dev (original) | ~34,7B (MoE) | no disponible | Apache 2.0 (segun este repo) | safetensors | Modelo base sin cuantizar; sin benchmarks publicados en esta informacion |

## Limitaciones y advertencias

- La cuantizacion introduce perdida de calidad; el autor reconoce que en benchmarks la variante IQ3_XXS falla mas por "doubt spirals" que la IQ4_XS.
- El autor advierte que el modelo a veces entiende el problema pero genera codigo que no coincide con la solucion esperada; un system prompt de verificacion lo mitiga parcialmente.
- Los benchmarks son preliminares, con 3 ejecuciones por problema y sin comparacion contra el modelo base, por lo que no permiten cuantificar la degradacion exacta.
- La imatrix esta sesgada hacia desarrollo web, Python y Markdown; el rendimiento en otros lenguajes o dominios puede ser inferior.
- No se dispone de informacion sobre sesgos, idiomas soportados ni evaluaciones de seguridad del modelo base.
- Riesgo de alucinacion en APIs, librerias o funciones inexistentes, comun en modelos de codigo; requiere verificacion en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda consultar la licencia del modelo base original para confirmar condiciones.
- El repositorio tiene 557 descargas y 0 likes, con actualizacion reciente; es una publicacion de un tercero, no del equipo de Kwaipilot.
- No se especifica el numero de parametros activos ni la longitud de contexto oficial, lo que limita la planificacion de capacidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fooooooooooooooooooooooooooooooooooooooooo/KAT-Coder-V2.5-Dev-16GB-MixedQuant-GGUF
- Modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Volcado GGUF IQ4_XS: IQ4_XS_GGUFDUMP.md (en el repositorio)
- Volcado GGUF IQ3_XXS: IQ3_XXS_GGUFDUMP.md (en el repositorio)

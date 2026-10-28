# credible-ai/olmo2-1B-288domains-dirichlet-lightgbm-arc

## Resumen

`olmo2-1B-288domains-dirichlet-lightgbm-arc` es un modelo de lenguaje de 1,41 mil millones de parametros con arquitectura OLMo 2, publicado por credible-ai como artefacto de investigacion para reproducir los experimentos del paper LinMix. No es un modelo de proposito general: se entrena desde cero sobre 32.000 millones de tokens extraidos del corpus WebOrganizer, con una mezcla de datos construida sobre 288 dominios (combinaciones de tematica y formato) cuyos pesos se optimizan mediante RegMix especificamente para la mejora del benchmark ARC.

La particularidad del checkpoint esta en el proceso de mezcla, no en el modelo en si. RegMix ajusta un surrogate LightGBM sobre un enjambre de modelos proxy de 60M de parametros entrenados con muestreos Dirichlet, y traslada la mezcla ganadora al modelo final de 1,41B. Esto convierte al checkpoint en una pieza reproducible de investigacion sobre data mixing: los pesos vienen en bfloat16, la mezcla exacta se distribuye como `mix.json` y el entrenamiento se realizo con OLMo-core.

Es relevante ahora porque permite estudiar empiricamente como la optimizacion de mezclas por dominio afecta al rendimiento en benchmarks concretos a una escala asequible (1,41B, 32B tokens), y porque publica tanto los pesos como las secuencias tokenizadas utilizadas, algo poco habitual en trabajos de mezcla de datos. Su utilidad practica es como baseline de investigacion y como punto de partida para fine-tuning, no como asistente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only denso, 18 capas, hidden size 2048 |
| Parametros totales | 1.414.678.528 (1,41B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en bfloat16; no hay versiones GGUF, AWQ ni GPTQ oficiales) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT para los pesos; los datos de entrenamiento estan sujetos a CC-BY-4.0 (DCLM 1b-1x pool) y a los terminos de uso de Common Crawl |
| Formato de pesos | safetensors en bfloat16; tamano del repositorio 2,8 GB |

Especificaciones adicionales: tokenizer GPT-NeoX-20B con vocabulario de 50.432 tokens; 32.000 millones de tokens de entrenamiento; artefacto auxiliar `mix.json` con la mezcla de datos utilizada.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo 2 en su variante pequena: transformer decoder-only denso con 18 capas, hidden size de 2048 y 1,41B de parametros totales. Usa el tokenizer de GPT-NeoX-20B (vocabulario de 50.432 entradas) en lugar del tokenizer original de la familia OLMo 2, un detalle relevante si se compara con los checkpoints oficiales de AllenAI. El entrenamiento se ejecuto con OLMo-core sobre 32.000 millones de tokens, un presupuesto notably inferior al habitual en modelos de esta escala, lo que sugiere un objetivo de investigacion mas que de rendimiento bruto.

La innovacion esta en la composicion del dataset. Los datos provienen de WebOrganizer/Corpus-200B, un corpus derivado del pool DCLM 1b-1x, organizado en 288 dominios que combinan tematica y formato. La mezcla final no se eligio a mano: se ajusto un surrogate LightGBM sobre un enjambre Dirichlet de modelos proxy de 60M de parametros (`credible-ai/olmo2-60M-288domains-dirichlet`) y se optimizaron los pesos para maximizar el rendimiento en ARC. La mezcla resultante se aplico al entrenamiento del modelo de 1,41B. No se documenta ninguna fase de RLHF, DPO o SFT: es un modelo base preentrenado, sin alineamiento posterior. Las secuencias tokenizadas exactas se publican en `credible-ai/weborganizer-corpus-200b-tokenized`, lo que permite reproducir el preentrenamiento token a token.

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de un prompt, en modo completado (modelo base, no instruccional).
- Modelado de lenguaje general: el checkpoint puede usarse para calcular perplexity o como inicializacion para tareas posteriores.
- Razonamiento y conocimiento factual limitados por el presupuesto de entrenamiento (32B tokens) y por el tamano (1,41B); no hay evaluaciones publicadas que lo cuantifiquen.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes, multi-step reasoning ni modo thinking.
- Sin capacidades multimodales (vision, audio) ni de otro tipo.
- Multilingue: no. La model card declara unicamente ingles.
- Capacidad destacada de facto: servir como sujeto de experimentos controlados de mezcla de datos, al venir acompanado de la mezcla (`mix.json`), el enjambre proxy y las secuencias tokenizadas.

## Casos de uso

- Reproduccion de los experimentos de LinMix: el checkpoint y `mix.json` permiten repetir el pipeline RegMix completo (enjambre Dirichlet de 60M, surrogate LightGBM, transferencia de mezcla a 1,41B) y verificar los resultados del paper con el mismo corpus y las mismas secuencias tokenizadas.
- Ablaciones de mezcla de datos a escala 1B: entrenar variantes con mezclas alternativas (uniforme, basada en heuristica, optimizada para otro benchmark) usando el mismo codigo y corpus, y comparar la perdida de validacion por dominio para aislar el efecto de la mezcla.
- Estudio del sesgo hacia el benchmark objetivo: al haberse optimizado la mezcla para ARC, el modelo es un caso de estudio util para medir hasta que punto la optimizacion de la mezcla mejora un benchmark concreto a costa de otros dominios.
- Fine-tuning supervisado por dominio: partir de estos pesos (licencia MIT, sin restricciones de uso comercial) para ajustar un modelo especializado en una tarea concreta en ingles, aprovechando que no hay etapas de alineamiento previas que condicionen el comportamiento.
- Baseline en investigacion de scaling laws de mezcla: comparar el modelo de 1,41B con su proxy de 60M para validar si el ranking de mezclas se mantiene al escalar, que es precisamente la hipotesis que RegMix asume.
- Generacion de texto en pipelines de evaluacion offline: usar el modelo como generador de referencia en ingles para tareas de completado y medir metricas de diversidad o calidad de corpus, sin requisitos de instruccion.
- Docencia y formacion: ejemplo completo y reproducible de un pipeline de preentrenamiento con OLMo-core, desde la tokenizacion hasta la publicacion de pesos y mezcla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la mezcla de datos se optimizo para ARC mediante RegMix, pero no reporta la puntuacion obtenida en ARC ni en ningun otro benchmark (MMLU, HumanEval, GSM8K, etc.), ni curvas de perdida durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para los pesos (1,41B parametros x 2 bytes), mas activaciones y cache KV; en la practica, entre 4 y 8 GB segun longitud de secuencia y tamano de batch.
- VRAM estimada en float32: aproximadamente 5,7 GB solo para los pesos; no recomendable salvo para depuracion numerica.
- GPU recomendadas: cualquier GPU con 8 GB o mas para inferencia en bf16 con batches pequenos (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4). Para entrenamiento o fine-tuning completo hacen falta tarjetas de 24-80 GB (RTX 4090, A100, H100) o tecnicas de memoria eficiente (LoRA, gradient checkpointing, DeepSpeed ZeRO).
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta moderna con 8 GB o mas; tambien es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` es la via documentada por el autor. El soporte en vLLM, TGI, llama.cpp u Ollama para la arquitectura `Olmo2ForCausalLM` no esta documentado en la informacion disponible y debe verificarse contra la version concreta de cada runtime; no se publican pesos GGUF, por lo que llama.cpp requeriria una conversion propia.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen del conocimiento general del ecosistema y no han sido verificados en las fuentes de esta ficha; conviene contrastarlos con la model card de cada checkpoint antes de tomar decisiones.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-1B-288domains-dirichlet-lightgbm-arc (credible-ai) | 1,41B | no disponible | Artefacto de investigacion sobre mezcla de datos (RegMix/LinMix), solo ingles | MIT | HuggingFace, 0 descargas |
| OLMo 2 1B (AllenAI) | ~1,5B (no verificado) | no verificado | Modelo base generalista, preentrenamiento a gran escala | Apache 2.0 (no verificado) | HuggingFace, ampliamente utilizado |
| SmolLM2-1.7B (HuggingFace) | 1,71B | 8.192 tokens (no verificado) | Base e instruct, enfoque en eficiencia y uso en dispositivo | Apache 2.0 (no verificado) | HuggingFace, muy desplegado |
| Llama 3.2 1B (Meta) | 1,24B | 128.000 tokens (no verificado) | Base e instruct, multilingue | Llama 3.2 Community License | HuggingFace, ecosistema amplio |

La diferencia clave frente a las alternativas no es de rendimiento sino de proposito: los otros tres son modelos generalistas con pipelines de alineamiento y evaluaciones publicas, mientras que este checkpoint es un artefacto experimental sin datos de benchmark, sin contexto documentado y con capacidad declarada unicamente en ingles.

## Limitaciones y advertencias

- No es un modelo de proposito general: la propia model card lo describe como artefacto de investigacion para reproducir LinMix, no como modelo listo para uso.
- Ausencia total de alineamiento: no hay RLHF, DPO ni SFT documentados, por lo que no debe esperarse un comportamiento de asistente ni adherencia a instrucciones.
- Sin resultados de benchmarks publicados: no existe evidencia cuantitativa de calidad, lo que impide justificar su uso en produccion frente a alternativas evaluadas.
- Sesgo de optimizacion: la mezcla se optimizo para ARC, de modo que el modelo puede estar sobreajustado a las distribuciones de ese benchmark en detrimento de otros dominios.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta documentado y previsiblemente sera pobre.
- Longitud de contexto no especificada: no se puede planificar su uso en tareas de contexto largo sin medirla empiricamente.
- Datos de entrenamiento web (DCLM/Common Crawl): riesgo de sesgos, toxicidad y contenido de baja calidad inherente al corpus; el modelo puede reproducir esos patrones.
- Riesgo de alucinacion: alto en un modelo base de 1,41B entrenado con 32B tokens, sin ajuste factual.
- Licencia: los pesos son MIT y permiten uso comercial, pero los datos subyacentes estan sujetos a CC-BY-4.0 y a los terminos de uso de Common Crawl; conviene revisar obligaciones de atribucion si se redistribuyen derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad, sin incidencias reportadas ni soporte.
- Tokenizer distinto del oficial de OLMo 2 (GPT-NeoX-20B), lo que invalida comparaciones directas de perplexity con checkpoints oficiales de AllenAI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-1B-288domains-dirichlet-lightgbm-arc
- Modelo proxy del enjambre Dirichlet (60M): https://huggingface.co/credible-ai/olmo2-60M-288domains-dirichlet
- Codigo de LinMix: https://github.com/credibleai/linmix
- OLMo-core (framework de entrenamiento): https://github.com/allenai/OLMo-core
- Documentacion de `Olmo2ForCausalLM` en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Secuencias tokenizadas del entrenamiento: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x (origen de los datos): https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizer GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use

# credible-ai/olmo2-1B-288domains-dirichlet-exponential-hellaswagpiqa

## Resumen

`olmo2-1B-288domains-dirichlet-exponential-hellaswagpiqa` es un modelo de lenguaje de 1.414.678.528 parametros (1,41B) desarrollado por credible-ai como artefacto de investigacion para reproducir los experimentos del paper LinMix ("Data Mixing as Linear Domain Attribution"). No es un modelo de proposito general, sino un checkpoint preentrenado especificamente con una mezcla de datos optimizada mediante el metodo Olmix para los benchmarks HellaSwag y PIQA.

El modelo parte de la arquitectura OLMo 2 (`Olmo2ForCausalLM`) con 18 capas y un tamano de hidden de 2048, y utiliza el tokenizador de GPT-NeoX-20B con un vocabulario de 50.432 tokens. Se entreno desde cero sobre 32.000 millones de tokens extraidos del corpus WebOrganizer, una mezcla estructurada en 288 dominios que combinan tematica y formato, con pesos de mezcla optimizados mediante un surrogate exponencial ajustado sobre un enjambre Dirichlet.

Su relevancia es metodologica: sirve como referencia reproducible para estudiar como la seleccion y ponderacion de dominios de datos afecta al rendimiento en tareas concretas de comprension del lenguaje. La licencia MIT sobre los pesos facilita su reutilizacion en investigacion, aunque el modelo no esta disenado ni ajustado para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only, 18 capas, hidden size 2048 |
| Parametros totales | 1.414.678.528 (1,41B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |
| Tokenizador | GPT-NeoX-20B, vocabulario de 50.432 tokens |
| Tokens de entrenamiento | 32.000 millones |
| Dataset | WebOrganizer/Corpus-200B (288 dominios tematicos x formato) |
| Libreria | transformers |
| Tamano del repositorio | 2,8 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2 en configuracion pequena: 18 capas transformer decoder-only con hidden size de 2048 y 1,41B parametros. El tokenizador es el de GPT-NeoX-20B con vocabulario de 50.432 tokens. Los pesos se distribuyen en bfloat16 y el entrenamiento se realizo con OLMo-core, el framework de entrenamiento de AI2.

El entrenamiento cubre 32.000 millones de tokens muestreados del corpus WebOrganizer/Corpus-200B, derivado del pool DCLM 1b-1x (CC-BY-4.0) y sujeto a los terminos de uso de Common Crawl. La innovacion central no esta en la arquitectura sino en el metodo de mezcla de datos: los 288 dominios (combinaciones de tematica y formato) reciben pesos optimizados mediante Olmix, que ajusta un surrogate exponencial sobre un enjambre Dirichlet generado con un modelo proxy de 60M parametros (`olmo2-60M-288domains-dirichlet`). Los pesos finales de la mezcla se publican en el fichero `mix.json` del repositorio. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion posteriores al preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles, propia de un modelo preentrenado sin ajuste de instrucciones.
- Razonamiento basico de sentido comun y comprension del lenguaje, alineados con los objetivos de optimizacion (HellaSwag y PIQA).
- Capacidad de continuacion de texto y modelado de lenguaje general sobre dominios web.
- No dispone de ajuste por instrucciones (instruction tuning) documentado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Reproduccion de experimentos de mezcla de datos: el checkpoint permite replicar los resultados del paper LinMix con la misma mezcla de 288 dominios y los pesos de `mix.json`, comparando contra otras configuraciones de mezcla.
- Estudio de atribucion de dominios: util para analizar como la ponderacion de dominios tematicos y de formato afecta al rendimiento en HellaSwag y PIQA, aislando el efecto de la mezcla del resto de variables.
- Baseline en investigacion sobre data mixing: sirve como referencia controlada (1,41B parametros, 32B tokens) frente a metodos alternativos de optimizacion de mezclas como DoReMi o RegMix.
- Generacion de texto en ingles para tareas de continuacion: adecuado para experimentos de modelado de lenguaje sobre texto web, no para asistencia conversacional.
- Fine-tuning supervisado como punto de partida: al ser un modelo pequeno con licencia MIT, puede ajustarse para tareas concretas en entornos de investigacion con recursos limitados.
- Evaluacion de tecnicas de cuantizacion y despliegue: su tamano permite probar pipelines de inferencia (vLLM, llama.cpp, TGI) en hardware modesto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la mezcla se optimizo para HellaSwag y PIQA, pero no incluye cifras de rendimiento de este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,5 GB para pesos; en 4 bits, aproximadamente 0,8-1 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en bfloat16 o cuantizada; A100 y H100 no son necesarias.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: transformers de forma nativa; vLLM, TGI y llama.cpp deberian ser compatibles al tratarse de una arquitectura OLMo 2 estandar, aunque no se documenta soporte verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Proposito |
|---|---|---|---|---|---|
| olmo2-1B-288domains-dirichlet-exponential-hellaswagpiqa | 1,41B | no disponible | 32B tokens (WebOrganizer, 288 dominios) | MIT | Artefacto de investigacion (LinMix) |
| OLMo 2 1B (AI2) | ~1,2B | no disponible en esta ficha | ~4T tokens (DCLM, Dolma) | Apache 2.0 | Modelo base de proposito general |
| olmo2-60M-288domains-dirichlet (credible-ai) | ~60M | no disponible | no disponible | no disponible | Proxy para optimizacion de mezclas |
| Modelos tipo SmolLM2-1.7B | 1,7B | 8.192 tokens | varios billones de tokens | Apache 2.0 | Modelo base/instruct pequeno |

La comparacion con OLMo 2 1B de AI2 es la mas directa por arquitectura, pero difiere en volumen y composicion de datos: este checkpoint usa 32B tokens frente a los varios billones del modelo oficial. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor lo describe explicitamente como artefacto para reproducir experimentos, no como modelo de proposito general.
- Sin ajuste por instrucciones: no responde de forma fiable a instrucciones ni a formatos conversacionales.
- Solo ingles: no se documenta soporte de otros idiomas.
- Sesgos: al entrenarse sobre texto web de Common Crawl, hereda sesgos de ese corpus; no se documenta ninguna mitigacion.
- Riesgo de alucinacion: alto en tareas de generacion abierta, al no existir alineacion ni ajuste de veracidad.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar su uso en tareas de contexto largo.
- Licencia de datos: aunque los pesos son MIT, los datos de entrenamiento estan sujetos a los terminos de uso de Common Crawl y a la licencia CC-BY-4.0 del pool DCLM; conviene revisar las condiciones antes de un uso comercial.
- Uso comercial: la licencia MIT permite uso comercial de los pesos, pero el modelo no esta optimizado ni validado para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-288domains-dirichlet-exponential-hellaswagpiqa
- Modelo proxy de 60M: https://huggingface.co/credible-ai/olmo2-60M-288domains-dirichlet
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Codigo LinMix: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Documentacion de OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- OLMo-core: https://github.com/allenai/OLMo-core
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use

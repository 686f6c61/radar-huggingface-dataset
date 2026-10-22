# alfred8995/sn38-r3-2020-pomlnb-chronollm-2020

## Resumen

`sn38-r3-2020-pomlnb-chronollm-2020` es un modelo de lenguaje de 1.858.535.658 parámetros publicado en HuggingFace por el usuario `alfred8995`, etiquetado como **ChronoGPT** y encuadrado en **ChronoLLM** (Subnet 38 de Bittensor), un proyecto de entrenamiento competitivo de modelos «cronológicamente consistentes». La propuesta del proyecto es que cada checkpoint solo haya visto datos hasta su año de corte (*vintage*), en este caso **2020**, de modo que no pueda filtrar conocimiento posterior a esa fecha.

El problema que aborda es el **lookahead bias** o sesgo de anticipación en backtesting financiero y análisis histórico: un LLM convencional entrenado con datos hasta la actualidad «sabe» que hubo una crisis en 2020 y contamina cualquier simulación de decisiones tomadas antes de esa fecha. Un modelo con corte temporal en 2020 permite reconstruir el estado de información disponible en ese momento.

La ficha se basa únicamente en los metadatos del repositorio y en la documentación pública del proyecto ChronoLLM. No hay *model card* con detalles de arquitectura, composición del dataset, idiomas o resultados de evaluación, y el acceso está restringido (gated), por lo que requiere aceptar condiciones en HuggingFace antes de descargar los pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ChronoGPT (etiqueta del repositorio); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 1.858.535.658 |
| Parametros activos | No aplica / no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors; no se publican GGUF ni cuantizaciones de terceros) |
| Idiomas soportados | No disponible |
| Licencia | `other` (licencia no estandar; requiere revisar los terminos del repositorio y el acceso gated) |
| Formato de pesos | safetensors |

Datos adicionales del repositorio: tamano de 7,4 GB, 0 descargas, 0 likes, creado el 21 de octubre de 2026, acceso restringido. El tamano del repositorio es aproximadamente el doble de lo que ocuparian los pesos en bf16 (unos 3,7 GB), lo que sugiere pesos en fp32 o ficheros adicionales; es una inferencia, no un dato confirmado.

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna mas alla de la etiqueta `ChronoGPT` del repositorio; por el tamano (1,86 mil millones de parametros) y el contexto del proyecto se trata presumiblemente de un transformer decoder de escala pequena, pero este extremo no esta confirmado en la informacion disponible.

El enfoque de entrenamiento del proyecto ChronoLLM consiste en filtrar el corpus de entrenamiento por fecha, de forma que el modelo solo vea documentos publicados hasta su ano *vintage* (2020 en este checkpoint). En la Subnet 38 de Bittensor el entrenamiento es competitivo: mineros entrenan modelos cronologicamente consistentes y validadores evaluan su consistencia temporal. No se especifican el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias.

## Capacidades

Las capacidades que se listan a continuacion se deducen del proposito declarado del proyecto; no hay evaluaciones publicas que las verifiquen para este checkpoint concreto.

- Generacion de texto con conocimiento limitado a eventos anteriores a 2020 (corte temporal por diseno).
- Razonamiento y analisis sobre informacion historica sin contaminacion de eventos posteriores.
- Simulacion de decisiones y opiniones tal como podrian haberse formulado en 2020.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion.
- Uso desde CLI mediante el paquete `chronollm`, que permite invocar el modelo por ano *vintage* o por repositorio.

## Casos de uso

- **Backtesting financiero sin lookahead bias**: el modelo solo conoce informacion hasta 2020, por lo que se puede emplear para generar tesis de inversion, resumenes de mercado o senales cualitativas tal como se habrian producido en esa fecha, evitando que el modelo anticipe hechos posteriores.
- **Analisis historico de decisiones corporativas**: reconstruir que informacion y que argumentos estaban disponibles en 2020 para una decision de fusion, expansion o recorte de plantilla, y contrastarlo con el resultado real.
- **Evaluacion de sesgo de anticipacion en pipelines propios**: usar este checkpoint como referencia temporal para medir cuanto se contaminan otros modelos al analizar el mismo periodo.
- **Generacion de datos sinteticos con corte temporal**: crear corpus de preguntas y respuestas, resumenes o notas de prensa coherentes con el estado del mundo en 2020 para entrenar o evaluar otros sistemas.
- **Simulacion de agentes en entornos historicos**: dotar a un agente de simulacion de un «conocimiento de epoca» para experimentos de teoria de juegos, economia computacional o estudios de comportamiento.
- **Docencia e investigacion en humanidades y economia**: explorar como cambia la respuesta de un LLM cuando se le restringe el conocimiento a un ano concreto, como ejercicio de epistemologia aplicada.
- **Auditoria y reconstruccion de contexto regulatorio**: recuperar la interpretacion vigente de una norma o de un riesgo en 2020 sin que el modelo mezcle desarrollos normativos posteriores.
- **Prototipado rapido de chatbots tematicos de epoca**: interfaz conversacional sobre un periodo historico concreto, integrada mediante el CLI `chronollm`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de consistencia temporal para este checkpoint, ni una comparacion publica con otros modelos de la Subnet 38.

## Requisitos de hardware

- **VRAM estimada para inferencia** (calculada a partir de 1,86 mil millones de parametros, sin contar overhead de runtime):
  - fp32: ~7,4 GB de pesos; ~8-9 GB de VRAM en total.
  - bf16/fp16: ~3,7 GB de pesos; ~4,5-5,5 GB de VRAM en total.
  - int8: ~1,9 GB de pesos; ~2,5-3,5 GB de VRAM en total.
  - int4: ~1 GB de pesos; ~1,5-2,5 GB de VRAM en total.
- **GPU recomendadas**: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090. Para servir en produccion con lote grande, A10G, L4, A100 40 GB o H100.
- **Consumer GPU**: si, practicamente cualquier GPU con 6 GB o mas en bf16, y GPUs de 4 GB en cuantizacion int4 (requiere convertir los pesos, ya que el repositorio no publica GGUF).
- **Opciones de despliegue**: `transformers` (referencia), vLLM o TGI para serving con batching continuo, llama.cpp/Ollama solo si se generan cuantizaciones GGUF propias a partir de los safetensors. El proyecto ofrece ademas el CLI `chronollm`.
- **Latencia y throughput**: no disponible. Para un modelo denso de 1,8 B en bf16 sobre una RTX 4090 es razonable esperar decenas de tokens por segundo por peticion, pero no hay mediciones publicadas de este checkpoint.

## Comparativa con modelos similares

La comparacion se limita a parametros, contexto y licencia, porque no hay resultados de rendimiento publicados para este modelo.

| Modelo | Parametros | Contexto | Enfoque temporal | Licencia |
|---|---|---|---|---|
| sn38-r3-2020-pomlnb-chronollm-2020 | 1,86 B | No disponible | Corte en 2020 (ChronoLLM) | `other` |
| Qwen2.5-1.5B | 1,54 B | 32 768 tokens | General, conocimiento hasta 2024 | Apache 2.0 |
| Llama 3.2 1B | 1,24 B | 128 000 tokens | General | Llama 3.2 Community License |
| Gemma 2 2B | 2,61 B | 8 192 tokens | General | Gemma Terms of Use |
| SmolLM2 1.7B | 1,71 B | 8 192 tokens | General | Apache 2.0 |

La diferencia funcional frente a todos ellos no es el rendimiento bruto, sino la garantia de corte temporal: los modelos generales citados han visto datos posteriores a 2020 y no son aptos para backtesting sin contaminacion.

## Limitaciones y advertencias

- **Acceso restringido**: el repositorio es gated y exige aceptar condiciones en HuggingFace; la licencia `other` debe revisarse antes de cualquier uso comercial.
- **Ausencia de model card**: no hay informacion verificable sobre dataset, numero de tokens, idiomas, contexto soportado ni proceso de alineacion.
- **Sin evaluaciones publicas**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de terceros sobre calidad o estabilidad.
- **Rendimiento esperable inferior a modelos generales del mismo tamano**: al restringir el corpus a datos anteriores a 2020 se pierden coberturas y se reduce la calidad en tareas que dependen de conocimiento reciente.
- **Riesgo de alucinacion**: no hay datos sobre entrenamiento con RLHF o DPO, por lo que no se puede asumir una mitigacion especifica.
- **Sesgos**: el corpus anterior a 2020 arrastra los sesgos de su epoca; no se documenta ninguna evaluacion de sesgo.
- **Ambito temporal estricto**: el modelo no debe usarse para preguntas sobre hechos posteriores a 2020; hacerlo produce respuestas obsoletas o directamente erroneas.
- **Idioma**: se desconoce el soporte real de castellano; no hay informacion sobre la composicion linguistica del entrenamiento.
- **Procedencia competitiva**: al tratarse de un checkpoint de una subnet de Bittensor, puede incorporar artefactos del proceso de mineria y no seguir un pipeline de publicacion convencional.
- **Formato**: solo safetensors; no hay GGUF ni cuantizaciones listas, lo que anade un paso de conversion para despliegues en CPU o GPUs pequenas.

## Enlaces

- HuggingFace: https://huggingface.co/alfred8995/sn38-r3-2020-pomlnb-chronollm-2020
- Repositorio del proyecto en GitHub: https://github.com/chronollm/sn38/tree/main
- Repositorio espejo en GitHub: https://github.com/st2058130-svg/chronollm
- Paquete en PyPI: https://pypi.org/project/chronollm/
- Estadisticas de la Subnet 38 (TaoMarketCap): https://taomarketcap.com/subnets/38
- Otro checkpoint del mismo autor: https://huggingface.co/alfred8995/r16-H-chrono4-skd-s500

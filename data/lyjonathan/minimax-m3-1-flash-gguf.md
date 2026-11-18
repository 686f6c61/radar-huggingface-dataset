# LyJonathan/MiniMax-M3.1-Flash-GGUF

## Resumen
MiniMax-M3.1-Flash es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por MiniMaxAI, publicado originalmente en Hugging Face y del que aqui se documenta una distribucion cuantizada en GGUF mantenida por el usuario LyJonathan. El modelo completo cuenta con 426.186.370.176 parametros totales (segun los pesos en safetensors del modelo base), lo que lo situa en la categoria de modelos frontera de gran escala. La version que nos ocupa no es el checkpoint original, sino un conjunto de copias cuantizadas de 1 a 4 bits pensadas para ejecutarse en hardware de consumo mediante el motor Sparsa, un runtime experimental desarrollado por el mismo autor.

La relevancia de esta distribucion radica en que demuestra la viabilidad de ejecutar un modelo de mas de 400.000 millones de parametros en un PC convencional: el tier `IQ2_XXS` de 124,5 GB corre en dos tarjetas de 16 GB (RTX 4060 Ti y RTX 5060 Ti) junto a un Ryzen 9 5900X y 121 GB de DDR4 bajo Linux, con unas cifras de 245 tokens/s en prefill de 4.000 tokens y unos 8 tokens/s en generacion a contexto de 32K. Se trata, sin embargo, de un proyecto marcado explicitamente como experimental, con una calidad que degrada de forma notable en los niveles de 1 y 2 bits y con compatibilidad limitada fuera de Sparsa.

El modelo base esta etiquetado como `mixture-of-experts` y `sparsa` (termino que en este contexto alude a la tecnica de streaming de expertos desde disco), y los expertos fueron entrenados originalmente en 4 bits (NVFP4), lo que explica que las cuantizaciones de 1 y 2 bits sufran perdidas de calidad medibles. La licencia es `minimax-community`, una licencia propia del autor original que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), transformer; etiquetado como "sparsa" en el repo |
| Parametros totales | 426.186.370.176 (426,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32K (contexto de referencia en las mediciones de generacion del autor); maximo oficial no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_S-GPTQ, IQ1_M, IQ1_M-GPTQ-v2, IQ2_XXS, IQ2_XXS-GPTQ, IQ2_XXS-GPTQ-v2, IQ2_KT, IQ2_XS, IQ2_XS-D3, IQ2_KL, IQ3_K, IQ4_KS, NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | minimax-community (etiqueta `license: other` en el repo) |
| Formato de pesos | GGUF (multiples tiers organizados en carpetas de partes) |

## Arquitectura y entrenamiento
El modelo base es un transformer de tipo mixture-of-experts con 426.200 millones de parametros totales. La informacion disponible no detalla el numero de parametros activos por token, el numero de expertos, la dimension oculta ni la composicion exacta del dataset de entrenamiento. Si se sabe, por la model card, que los expertos fueron entrenados en precision de 4 bits (formato NVFP4), lo que constituye una decision de diseno relevante: implica que el checkpoint de referencia ya incorpora cuantizacion en los expertos y que las conversiones posteriores a 1 y 2 bits parten de una base ya comprimida, con la consiguiente acumulacion de error.

La innovacion tecnica principal de esta distribucion no esta en el modelo sino en el runtime: Sparsa implementa streaming de expertos desde SSD hacia RAM y VRAM, de modo que solo una parte de los pesos reside en memoria rapida y el resto se carga bajo demanda. El autor aplica ademas GPTQ secuencial sobre algunos tiers (`IQ1_S-GPTQ`, `IQ1_M-GPTQ-v2`, `IQ2_XXS-GPTQ`, `IQ2_XXS-GPTQ-v2`) para reducir el error de redondeo, y en el tier `IQ2_XXS-GPTQ-v2` emplea un layout de tipos por capa denominado "Maya-S" con mezcla de tipos gate/up en cinco capas y sin tensores de indexer en las capas 0-2. No se dispone de informacion sobre el proceso de alineacion (RLHF, DPO) del modelo base.

## Capacidades
- Generacion de texto conversacional en contextos de hasta 32K tokens, segun las mediciones del autor.
- Razonamiento y escritura: la model card reporta pruebas de "writing" a contexto de 32K.
- Soporte de conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integracion con APIs tipo OpenAI en el runtime Sparsa.
- Capacidades de codigo: la evaluacion de calidad incluye un "hard code prompt", aunque no se detalla el rendimiento especifico.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el repo no declara idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso
- Experimentacion e investigacion en hardware de consumo: el tier `IQ2_XS-D3` (146,1 GB) o `IQ2_KT` (123,8 GB) permite ejecutar un modelo de 426 B en un PC con 128 GB de RAM, lo que habilita estudios de comportamiento de modelos frontera sin acceso a clusters.
- Evaluacion comparativa de tecnicas de cuantizacion: los distintos tiers con metricas top-1 y KL64 publicadas permiten medir el impacto de IQ1/IQ2/IQ3/IQ4/NVFP4 sobre las mismas prompts, util para investigar metodos de compresion.
- Generacion de texto asistida en local con contexto largo: el tier `IQ2_XXS` sostiene escritura a 32K de contexto a unos 8 tokens/s, adecuado para tareas por lotes o asincronas donde la latencia no es critica.
- Desarrollo y validacion del propio runtime Sparsa: el repo sirve como banco de pruebas para el streaming de expertos, el soporte de GPTQ secuencial y la compatibilidad con llama.cpp parcheado.
- Prototipado de asistentes conversacionales autoalojados: con 245 tokens/s de prefill y contexto de 32K, un equipo pequeno puede desplegar un prototipo conversacional sin depender de APIs externas.
- Reproduccion de evaluaciones de calidad: los pares top-1/KL64 frente a una referencia FP32 permiten auditar la fidelidad de cada tier antes de comprometerse con un despliegue.
- Formacion y docencia: ilustra de forma tangible el compromiso entre tamano, cuantizacion, memoria y calidad en modelos MoE de gran escala.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas de fidelidad de cuantizacion frente a una referencia FP32 (6 prompts cortos, 679 posiciones), que se recogen a continuacion:

| Tier | Tamano | Top-1 | KL64 | Notas |
|---|---:|---:|---:|---|
| IQ1_S | 94,8 GB | 44,3 % | 1,926 | Incoherente en la practica (bucle "and and and...") |
| IQ1_M | 106,6 GB | 47,1 % | 1,673 | Tier usable mas pequeno; degradado |
| IQ2_KT | 123,8 GB | 56,3 % | 1,292 | Mejor 2-bit por byte medido; solo Sparsa |
| IQ2_XXS | 124,5 GB | 52,0 % | 1,804 | Tambien carga en llama.cpp parcheado |
| IQ2_XS-D3 | 146,1 GB | 59,4 % | 1,211 | Opcion por defecto; corre en PC de 128 GB |
| IQ2_KL | 152,7 GB | 59,8 % | 1,184 | Ligeramente mejor que D3; solo Sparsa |
| IQ3_K | 191,2 GB | 69,8 % | 0,847 | Salto de calidad respecto a 2 bits |
| IQ4_KS | 233,6 GB | 74,4 % | 0,760 | El tier IQ mas cercano a NVFP4 |
| NVFP4 | 246,1 GB | 77,3 % | 0,670 | Mejor calidad medida; copia sin perdida de los expertos 4-bit |

Metricas adicionales reportadas por el autor: `IQ2_XXS-GPTQ` obtiene KL 0,284 y top-1 84,4 % frente a las respuestas del tier NVFP4 (3.020 tokens de asistente), frente a 0,388 / 82,6 % del mismo layout sin GPTQ. `IQ2_XXS-GPTQ-v2` alcanza KL 0,211 y top-1 87,5 % (referencia Maya-S: 0,199 / 86,8 %); `IQ1_S-GPTQ` logra KL 0,461 y top-1 79,1 %; `IQ1_M-GPTQ-v2`, KL 0,312 y top-1 82,4 %. `IQ2_XS` solo esta medido en llama.cpp parcheado sobre un conjunto mas dificil de ocho prompts (top-1 46,8 %, KL 1,92; `IQ2_XS-D3` en ese mismo conjunto: 53,8 %, 1,58), por lo que no es comparable con la tabla principal.

Rendimiento de inferencia medido por el autor con Sparsa v0.2.0 en el rig descrito (RTX 4060 Ti 16 GB + RTX 5060 Ti 16 GB, Ryzen 9 5900X, 121 GB DDR4, Linux):

| Metrica | Valor |
|---|---|
| Prefill, 4.000 tokens | 245 tokens/s |
| Prefill, 500 tokens | ~6 s |
| Generacion a 32K de contexto | ~8 tokens/s |

## Requisitos de hardware
- VRAM/RAM: el tier mas pequeno (`IQ1_S`, 94,8 GB) no es recomendable por incoherencia. El minimo usable es `IQ1_M` (106,6 GB); el autor recomienda elegir el tier mas grande que quepa en RAM + VRAM dejando unos 10 GB de margen.
- Configuracion de referencia del autor: dos GPU de 16 GB (RTX 4060 Ti + RTX 5060 Ti) con 121 GB de DDR4 para el tier `IQ2_XXS` de 124,5 GB.
- PC de 128 GB de RAM: suficiente para `IQ2_XS-D3` (146,1 GB) con streaming desde SSD.
- GPU recomendadas: no hay datos para A100/H100; el proyecto esta orientado a GPU de consumo con 16 GB y a configuraciones multi-GPU modestas. Para los tiers de 191-246 GB se requiere RAM abundante o streaming desde SSD.
- Despliegue: el motor previsto es Sparsa (v0.2.2 o superior para los tiers GPTQ-v2; v0.2.1 carga `IQ2_XXS-GPTQ-v2` pero falla con prompts por lotes, corregido en PR #60; v0.2.0 no lo carga). `IQ2_XXS` e `IQ2_XS` pueden cargarse en llama.cpp parcheado; la mayoria de los tiers no cargan en llama.cpp, LM Studio ni Ollama estandar.
- Latencia y throughput: prefill de 245 tokens/s a 4.000 tokens y ~8 tokens/s de generacion a 32K; el streaming desde SSD funciona pero es mas lento.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye datos de modelos alternativos comparables (mismo tamano, misma tarea o mismo enfoque de cuantizacion extrema), por lo que no es posible establecer una comparativa rigurosa sin inventar cifras.

## Limitaciones y advertencias
- Proyecto experimental: el propio autor lo etiqueta como tal y advierte de que el desarrollo se ha ralentizado, aunque sigue activo.
- Calidad degradada en baja precision: los expertos se entrenaron en 4 bits (NVFP4), por lo que los tiers de 1 y 2 bits pierden calidad de forma apreciable; un unico prompt de codigo dificil arrastra todas las medias.
- `IQ1_S` es inutilizable en la practica: entra en bucle ("and and and...") en lugar de generar texto.
- Compatibilidad restringida: la mayoria de los tiers no cargan en llama.cpp, LM Studio ni Ollama estandar; los marcados como "Sparsa only" requieren el runtime del autor.
- Dependencia de un runtime de un solo mantenedor: Sparsa es un proyecto personal con versiones muy recientes (v0.2.x) y cambios que rompen compatibilidad entre releases.
- Licencia `minimax-community`: es una licencia propia, no una licencia open source estandar; hay que revisar sus terminos antes de cualquier uso comercial. El repo la declara como `license: other`.
- Idiomas soportados no declarados: no hay garantia documentada de calidad multilingue.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en un modelo de este tipo y con cuantizaciones agresivas es esperable.
- Sesgos: no documentados en la informacion proporcionada.
- Requisitos de memoria muy elevados: incluso el tier mas pequeno usable supera los 100 GB, lo que excluye su uso en equipos de consumo convencionales sin streaming desde SSD.
- Longitud de contexto: las mediciones se hacen a 32K, pero el maximo oficial del modelo base no se especifica.

## Enlaces
- Repositorio GGUF: https://huggingface.co/LyJonathan/MiniMax-M3.1-Flash-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash/blob/main/LICENSE
- Motor Sparsa: https://github.com/LyJonathan/Sparsa
- Release Sparsa v0.2.2: https://github.com/LyJonathan/Sparsa/releases/tag/sparsa-v0.2.2-experimental

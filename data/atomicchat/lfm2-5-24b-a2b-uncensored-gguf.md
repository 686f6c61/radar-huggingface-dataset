# AtomicChat/LFM2.5-24B-A2B-Uncensored-GGUF

## Resumen

LFM2.5-24B-A2B-Uncensored-GGUF es una version cuantizada y modificada ("abliterated") del modelo LFM2.5-24B-A2B de Liquid AI, publicada por el usuario AtomicChat. El modelo original es un transformer de arquitectura MoE (mezcla de expertos) con 23.971.587.712 parametros totales (~24B) y unos 2B parametros activos (de ahi el sufijo A2B), disenado para agentes que se ejecutan en dispositivo con baja latencia. La modificacion de AtomicChat proyecta fuera de los pesos la direccion de rechazo (refusal direction) en los bloques 14 a 39 de un total de 40, con lo que reduce los rechazos del 96,3% al 1,2% en ingles y del 62% al 0% en ruso, manteniendo el MMLU practicamente intacto (64,40% antes, 65,55% despues).

El artefacto se distribuye de dos formas: seis construcciones GGUF ya modificadas y horneadas, y un adaptador LoRA de 24 MB (rango 1, 52 sitios) que se aplica sobre cualquier GGUF de los pesos originales. Está pensado para ejecucion local en llama.cpp, con builds que van desde 11,1 GB (AD-IQ3_XXS, retenida) hasta 25,7 GB (AD-Q8_0), y la recomendada AD-Q4_K_M de 15,4 GB para maquinas de 24 GB de VRAM.

Es relevante porque permite desplegar localmente un modelo MoE de 24B con solo 2B activos y sin filtros de rechazo, conservando capacidades de tool calling (20/20 llamadas validas), razonamiento con modo thinking y ventana de contexto utilizable a 30k tokens, todo bajo la licencia LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) de tipo transformer, familia LFM2.5 (tag lfm2moe) |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | ~2B (sufijo A2B) |
| Longitud de contexto | no disponible de forma explicita; los ejemplos de la model card usan -c 32768 y se supera una prueba needle a 30k tokens |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_M (IQ3_XXS generada pero no publicada); adaptador LoRA en GGUF |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | lfm1.0 (LFM Open License v1.0); en metadatos de HuggingFace figura como "other"/lfm1.0 |
| Formato de pesos | GGUF (modelos completos) y GGUF (adaptador LoRA) |

## Arquitectura y entrenamiento

La base es LFM2.5-24B-A2B de Liquid AI, un modelo de lenguaje generativo con atencion tipo transformer y capa de mezcla de expertos (MoE), con 24B parametros totales de los que aproximadamente 2B se activan por token. Esta configuracion busca un equilibrio entre capacidad y coste de inferencia para despliegue en dispositivo. Segun la informacion publica de Liquid, el modelo esta orientado a agentes y supera a Qwen3.6-35B-A3B en la prueba LiveClaw (no se facilitan cifras concretas de esa comparacion).

La edicion de AtomicChat no reentrena el modelo, sino que proyecta fuera de los pesos la direccion de rechazo en los bloques 14-39 (los dos tercios finales de la red). El autor indica que aplicar la misma edicion a los 40 bloques tambien eliminaba los rechazos, pero costaba 4 puntos de MMLU, y que el dano se concentra en los primeros 14 bloques, no en la senal de rechazo. La modificacion se entrega como seis builds GGUF horneadas (misma disposicion e importance matrix que las cuantizaciones originales del mismo autor) y como adaptador LoRA de rango 1 (24 MB, 52 sitios) aplicable a los GGUF de los pesos originales (revision f772950c). Segun la model card, la deriva media de la distribucion (KLD) respecto al original no modificado es de 0,204 en texto neutro y 0,179 en codigo con los pesos BF16 editados; los builds finales anaden el efecto de la cuantizacion.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento con modo thinking: la model card reporta 30 prompts con thinking sin rechazos y sin bloques de pensamiento sin cerrar a 3072 tokens.
- Tool calling / function calling: 20 de 20 llamadas validas, tanto en el original como en la version editada.
- Razonamiento de multiples pasos orientado a agentes (la base esta disenada para agentes en dispositivo).
- Multilingue en 10 idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano.
- Recuperacion de contexto largo: prueba needle a 30k tokens superada 3 de 3 profundidades en la version editada (2 de 3 en el original).
- Comportamiento sin rechazos: reduccion de negativas del 96,3% al 1,2% en ingles, del 62% al 0% en ruso y del 12,8% al 0% en el conjunto XSTest de prompts seguros.
- No se menciona soporte de vision, audio ni otras modalidades: no disponible.

## Casos de uso

- Agentes locales en dispositivo: al tener solo ~2B parametros activos y builds desde 12-15 GB, puede ejecutarse en una estacion de trabajo con una sola GPU consumer y actuar como motor de un agente que llama herramientas de forma repetida sin coste de API.
- Generacion de codigo en pipelines de CI/CD: soporta tool calling valido (20/20) e integracion via llama-server con flag --jinja, lo que permite conectarlo a herramientas de linting, tests o control de versiones en flujos automatizados.
- Atencion al cliente multilingue: cubre 10 idiomas y puede gestionar conversaciones multi-turno con contexto de hasta 32k tokens (segun los ejemplos de la model card), lo que permite hilar historiales largos sin truncar en exceso.
- Analisis de documentos extensos: la prueba needle a 30k tokens (3/3 profundidades) indica que puede localizar informacion concreta en contextos largos, util para resumen y extraccion sobre informes o expedientes largos.
- Red teaming e investigacion en seguridad: al eliminar el comportamiento de rechazo de forma medible (JBB, Aya, XSTest con metricas publicas), sirve como objeto de estudio para analizar direcciones de rechazo y su impacto en el rendimiento.
- Generacion creativa y roleplay sin filtros: para aplicaciones de escritura asistida o narrativa que requieren respuestas sin negativas por contenido sensible, con la advertencia de responsabilidad legal y etica que ello implica.
- Traduccion y localizacion: el soporte de 10 idiomas y el formato GGUF para ejecucion local permiten montar un servicio de traduccion privado sin enviar datos a terceros.
- Asistente de escritorio offline: el tamano de la build AD-IQ4_XS (14,5 GB) o AD-IQ3_M (12,1 GB) permite desplegarlo en equipos con 16 GB de VRAM para asistentes que no pueden depender de conectividad.

## Benchmarks y rendimiento

Resultados publicados en la model card (original BF16 frente a version editada):

| Metrica | Original | Abliterado |
|---|---|---|
| MMLU (2000 preguntas) | 64,40% | 65,55% |
| JBB comportamientos daninos (EN, 81), rechazos | 96,3% | 1,2% |
| Aya red-teaming (RU, 100), rechazos | 62,0% | 0% |
| XSTest prompts seguros (250), rechazos | 12,8% | 0% |
| Con thinking (30 prompts, 3072 tokens), rechazos | 30 de 30 | 0 de 30 |
| Thinking sin cerrar a 3072 tokens | 0 de 30 | 0 de 30 |
| Respuestas vacias o en bucle (431) | 0 | 0 |
| Tool calls (20) | 20/20 validas | 20/20 validas |
| Needle a 30k tokens (3 profundidades) | 2 de 3 | 3 de 3 |
| KLD medio al original, neutro / codigo | - | 0,204 / 0,179 |

Metricas por build GGUF (KLD y coincidencia top-1 frente al original sin modificar en BF16):

| Build | En disco | KLD medio | Mismo top-1 |
|---|---|---|---|
| AD-Q8_0 | 25,7 GB | 0,229 | 81,4% |
| AD-Q6_K | 20,9 GB | 0,239 | 81,0% |
| AD-Q5_K_M | 17,3 GB | 0,271 | 80,3% |
| AD-Q4_K_M | 15,4 GB | 0,274 | 79,6% |
| AD-IQ4_XS | 14,5 GB | 0,274 | 79,3% |
| AD-IQ3_M | 12,1 GB | 0,359 | 76,0% |

No se han publicado resultados de benchmarks adicionales (por ejemplo HumanEval, GSM8K o MT-Bench) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun build (incluye overhead de contexto reducido): AD-IQ3_M ~12-13 GB; AD-IQ4_XS ~15-16 GB; AD-Q4_K_M ~16-17 GB; AD-Q5_K_M ~18 GB; AD-Q6_K ~21-22 GB; AD-Q8_0 ~26-27 GB.
- GPU recomendadas: RTX 4090 / RTX 3090 (24 GB) para AD-Q4_K_M y AD-Q5_K_M; A100 40 GB o H100 para AD-Q8_0; GPUs de 16 GB (RTX 4080, A4000) para AD-IQ4_XS o AD-IQ3_M con contexto reducido.
- Si cabe en GPU consumer: si, AD-Q4_K_M (15,4 GB en disco) esta pensada explicitamente para una maquina de 24 GB, y AD-Q6_K para 32 GB. AD-Q8_0 requiere 32 GB o mas.
- Opciones de despliegue: llama.cpp (llama-server / llama-cli) es el runtime citado en la model card, con soporte de --jinja para plantillas de chat y --lora-scaled o --lora para el adaptador. Otros runtimes compatibles con GGUF (Ollama, LM Studio) son tecnicamente posibles por formato, aunque no se citan explicitamente en la informacion disponible.
- Aplicacion del adaptador LoRA: `llama-server -m modelo.gguf -ngl 99 -c 32768 --jinja --lora-scaled lora/LFM2.5-24B-A2B-Uncensored-LoRA.gguf:1.75`.
- Latencia y throughput: no disponible (no se publican medidas de tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B (original, Liquid AI) | 23,97B | ~2B | no disponible | lfm1.0 | Base sin modificar; MMLU 64,40%; rechazos 96,3% EN |
| LFM2.5-24B-A2B-Uncensored (este) | 23,97B | ~2B | no disponible | lfm1.0 | MMLU 65,55%; rechazos 1,2% EN; +LoRA rango 1 |
| Qwen3.6-35B-A3B | 35B (segun nomenclatura A3B, ~3B activos) | ~3B | no disponible | no disponible | Citado por Liquid como superado por LFM2.5-24B-A2B en LiveClaw; sin cifras disponibles |

No se dispone de datos de contexto, licencia ni benchmarks detallados de Qwen3.6-35B-A3B en la informacion proporcionada, por lo que la comparacion cuantitativa queda limitada a la referencia cualitativa de Liquid.

## Limitaciones y advertencias

- La edicion elimina el comportamiento de rechazo de forma deliberada; esto puede dar lugar a respuestas para contenido sensible o danino. El usuario es responsable del uso.
- Existe un desplazamiento medible en la eleccion de palabras respecto al original (KLD 0,204 en neutro, 0,179 en codigo). La model card indica que el modelo tiende a abrir de forma mas directa y a decir algo menos alrededor del punto.
- Con las cuantizaciones bajas (AD-IQ3_M) la coincidencia top-1 baja al 76,0% y la KLD sube a 0,359, por lo que la degradacion respecto al original es mayor. La build AD-IQ3_XXS (11,1 GB) se genero pero no se publico por degradacion (74,5% top-1 y 3,7% de rechazos en ingles).
- El conteo de rechazos se basa en la apertura de la respuesta, segun reconoce el propio autor, por lo que es indicativo y no un juicio exhaustivo.
- Licencia LFM Open License v1.0 (lfm1.0): es necesario revisar el texto de la licencia antes de uso comercial, ya que los metadatos la marcan como "other" y no como una licencia permisiva estandar.
- No se documentan sesgos especificos ni evaluaciones de sesgo en la informacion disponible.
- No se confirma la longitud maxima oficial de contexto; los ejemplos usan 32768 tokens y la prueba needle llega a 30k, pero el maximo del modelo base no se explicita.
- No hay datos de vision ni audio; el modelo es exclusivamente de texto.
- No se publican medidas de latencia ni de throughput, por lo que las estimaciones de rendimiento en produccion deben validarse en el hardware objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AtomicChat/LFM2.5-24B-A2B-Uncensored-GGUF
- Coleccion del autor: https://huggingface.co/collections/AtomicChat/lfm25-24b-a2b-uncensored
- Metricas publicas: https://huggingface.co/datasets/AtomicChat/LFM2.5-24B-A2B-Uncensored-GGUF-metrics
- Cuantizaciones originales del mismo autor: https://huggingface.co/AtomicChat/LFM2.5-24B-A2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Blog de Liquid AI sobre LFM2.5-24B-A2B: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Cobertura en MarkTechPost: https://www.marktechpost.com/2026/10/14/liquid-ai-lfm2-5-24b-a2b/
- Repositorio GitHub Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- Anuncio en X: https://x.com/atomic_chat_hq/status/2110241691475349854
- Sitio de Atomic Chat: https://atomic.chat/

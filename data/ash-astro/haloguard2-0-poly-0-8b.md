# ash-astro/HaloGuard2.0-Poly-0.8B

## Resumen

HaloGuard 2.0-Poly-0.8B es un modelo de clasificación de tokens disenado como guardia de seguridad de salida para asistentes conversacionales. Lo desarrolla el usuario ash-astro y se construye sobre el backbone de Qwen3.5-0.8B, al que se anade una cabeza de clasificación causal que emite una probabilidad de inseguridad (`P(unsafe)`) en cada token de la respuesta generada. Su proposito es permitir que un despliegue detenga una completion danina en mitad del streaming, en lugar de detectarla a posteriori.

El modelo cubre 17 idiomas y aplica una regla de disparo con pestillo: cuando tres tokens consecutivos de respuesta superan el umbral de 0,675, el veredicto queda fijado como inseguro y permanece asi. Ademas de la etiqueta binaria, reporta la posicion en la que la respuesta empezo a ser insegura (`first_fire_index`), lo que facilita el corte preciso del flujo.

Con 752 millones de parametros, el modelo reporta un F1 de 83,08 en la tarea de deteccion de dano en respuestas del benchmark PolyGuardPrompts, por encima de baselines de 7B y 8B como Llama Guard 3 o PolyGuard-Qwen. Su licencia Apache 2.0 y su tamano lo hacen desplegable en hardware modesto, lo que resulta relevante para equipos que necesitan moderacion multilingue en produccion sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3.5-0.8B) con cabeza de clasificacion de tokens por posicion |
| Parametros totales | 752.395.074 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, zh, ja, ko, hi, ar, es, fr, de, pt, it, ru, cs, pl, nl, sv, th (17) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con una cabeza de clasificacion de tokens anadida sobre el backbone Qwen3.5-0.8B. La innovacion clave es que la senal es causal: se calcula una probabilidad de inseguridad en cada posicion de la respuesta a medida que se genera, por lo que el guardia puede operar durante el streaming. El prompt se incluye en el forward pass como contexto, pero ningun token del prompt puede disparar el veredicto por si mismo; solo cuentan las posiciones de respuesta. La regla de servicio es un pestillo: se dispara cuando tres tokens consecutivos de respuesta igualan o superan 0,675 y, una vez disparado, permanece activo. El modelo expone ademas `run[k]` para k = 1, 2, 3, lo que permite barrer reglas alternativas sin reejecutar el forward pass.

El entrenamiento se realizo en dos etapas. Primero se entreno la cabeza de seguridad sobre PolyGuardMix, un corpus multilingue de prompts y respuestas de 1,9 millones de filas. Despues se refino con supervision correctiva minada a partir de fallos del benchmark: las respuestas que el modelo base clasificaba incorrectamente en PolyGuardPrompts se corrigieron y se reincorporaron como senal de entrenamiento adicional, siguiendo la misma receta de minado de errores que la version inglesa. El resultado se interpolo con el modelo base a un factor alpha de 0,50. No se detalla en la informacion disponible si hubo RLHF o DPO.

## Capacidades

- Clasificacion de seguridad de respuestas generadas token a token, con salida binaria `safe` / `unsafe` y probabilidad por token.
- Deteccion del punto de inicio del dano (`first_fire_index`), no solo del veredicto final.
- Modo streaming mediante `classify_stream`, que permite cortar la generacion en el momento del disparo.
- Soporte multilingue en 17 idiomas: ingles, chino, japones, coreano, hindi, arabe, espanol, frances, aleman, portugues, italiano, ruso, checo, polaco, neerlandes, sueco y tailandes.
- Regla de disparo configurable: el usuario puede definir su propio punto de operacion mediante `guard.rule` con `max_p_threshold`, `run_threshold` y `run_length`.
- Acceso a la senal cruda (`return_probs=True`) para integrar reglas propias o calibrar umbrales offline.
- No es un modelo generativo: no produce texto, solo clasifica las respuestas de otro modelo.

## Casos de uso

- Moderacion de salida en produccion: el guardia se coloca entre el LLM y el usuario y corta la generacion cuando detecta contenido inseguro. Su regla de tres tokens consecutivos permite actuar en milisegundos dentro del bucle de generacion, sin esperar a que la respuesta termine.
- Atencion al cliente automatizada: en un chatbot multilingue, el guardia vigila respuestas en espanol, frances, aleman o arabe y bloquea la salida si el modelo empieza a producir contenido ofensivo, instrucciones peligrosas o filtraciones, con un F1 de 88,4 en espanol y 86,0 en frances.
- Cumplimiento normativo y auditoria: el registro de `first_fire_index` y de las probabilidades por token permite documentar donde y por que se bloqueo una respuesta, util para trazabilidad en sectores regulados.
- Plataformas de generacion de codigo asistida: el guardia puede detectar respuestas que incluyan codigo malicioso o instrucciones de explotacion, integrado como condicion de parada en el pipeline de generacion.
- Despliegue en entornos con recursos limitados: con 0,8B de parametros, se puede ejecutar en una unica GPU consumer o incluso en CPU, lo que permite moderacion local sin enviar datos a terceros.
- Moderacion de contenido en comunidades y foros: integrado en un servicio de generacion de respuestas o resumenes, filtra salidas daninas en multiples idiomas antes de publicarlas.
- Investigacion en seguridad de LLM: la senal por token y la posibilidad de barrer reglas offline lo convierten en una herramienta util para estudiar donde emerge el comportamiento inseguro en modelos generativos.

## Benchmarks y rendimiento

Resultados reportados por el autor en PolyGuardPrompts (F1 de dano en respuestas):

| Modelo | Tamano | F1 |
|---|---|---|
| MD Judge | 7B | 49,12 |
| Llama Guard 2 | 8B | 63,62 |
| Llama Guard 3 | 8B | 65,74 |
| PolyGuard Smol | 0,5B | 66,82 |
| PolyGuard Ministral | 8B | 73,75 |
| PolyGuard-Qwen | 7B | 74,08 |
| HaloGuard 2.0-Poly | 0,8B | 83,08 |

Rendimiento por grupo de idiomas (porcentajes sobre PolyGuardPrompts):

| Grupo | FPR | FNR | F1 |
|---|---|---|---|
| Ingles (referencia) | 4,7 | 4,6 | 87,1 |
| CJK | 6,0 | 7,5 | 83,1 |
| Indic | 12,8 | 22,2 | 64,2 |
| Escritura arabe | 6,2 | 7,4 | 82,7 |
| Europeo / semitico | 5,2 | 5,8 | 85,5 |
| Sudeste asiatico | 10,0 | 12,0 | 73,9 |
| Multilingue (media macro) | 6,1 | 7,5 | 83,1 |

Rendimiento por idioma (F1): espanol 88,4; ingles 87,1; italiano 86,6; sueco 86,2; frances 86,0; polaco 85,9; portugues 85,9; aleman 85,3; neerlandes 85,2; chino 83,5; japones 83,4; ruso 83,3; arabe 82,7; coreano 82,5; checo 82,1; tailandes 73,9; hindi 64,2.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,5 GB solo para pesos, mas memoria para activaciones y el contexto de hasta 2.048 tokens; en la practica, entre 2 y 4 GB segun el lote.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son validas. El modelo no necesita GPU de datacenter.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas, e incluso en CPU para despliegues de baja concurrencia.
- Opciones de despliegue: transformers con `trust_remote_code=True` (unica via documentada por el autor). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Al ser un modelo de 0,8B con contexto maximo de 2.048 tokens, se espera una latencia baja por token, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (PolyGuardPrompts) | Licencia | Enfoque |
|---|---|---|---|---|---|
| HaloGuard 2.0-Poly | 0,8B | 2.048 | 83,08 | Apache 2.0 | Guardia de salida por token, multilingue |
| Llama Guard 3 | 8B | no disponible en la informacion | 65,74 | Llama Community License | Guardia de entrada/salida, generativo |
| PolyGuard-Qwen | 7B | no disponible en la informacion | 74,08 | no disponible en la informacion | Guardia multilingue de prompts y respuestas |
| PolyGuard Smol | 0,5B | no disponible en la informacion | 66,82 | no disponible en la informacion | Guardia multilingue ligero |

La ventaja principal de HaloGuard 2.0-Poly es la combinacion de un tamano muy reducido (0,8B) con un F1 superior a modelos de 7B y 8B en el benchmark reportado, ademas de una licencia permisiva Apache 2.0. Su limitacion frente a los guardias generativos es que no produce explicaciones ni categorias de dano, solo una probabilidad y un veredicto binario.

## Limitaciones y advertencias

- La evaluacion se limita a PolyGuardPrompts y a las cifras reportadas por el autor; no hay validacion independiente disponible.
- El rendimiento cae de forma notable en hindi (F1 64,2) y tailandes (73,9), y el grupo indic presenta un FNR del 22,2 %, por lo que la cobertura en esos idiomas es insuficiente para produccion sin supervision adicional.
- El contexto maximo es de 2.048 tokens; respuestas o prompts mas largos requieren truncado o segmentacion, lo que puede degradar la deteccion.
- La regla de disparo con pestillo de tres tokens consecutivos a 0,675 puede producir falsos positivos en respuestas largas con tramos ambiguos; el autor permite reconfigurarla, pero no se documentan curvas de calibracion.
- Al ser un modelo de clasificacion y no generativo, no explica el motivo del bloqueo ni clasifica la categoria de dano; el operador debe aportar esa capa.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas (falsos negativos y positivos) en dominios alejados de la distribucion de PolyGuardMix.
- No se documentan sesgos especificos por idioma, cultura o grupo demografico mas alla de las diferencias de F1 por idioma.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de Qwen3.5-0.8B como base; conviene verificar las condiciones de la licencia del modelo base para el despliegue.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; debe auditarse antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ash-astro/HaloGuard2.0-Poly-0.8B
- Version inglesa del guardia de salida: https://huggingface.co/ash-astro/HaloGuard2.0-Stream-0.8B
- Guardia de entrada (prompts): https://huggingface.co/astroware/HaloGuard1-Gen-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B

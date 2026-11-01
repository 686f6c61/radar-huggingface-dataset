# astroware/HaloGuard2.0-Poly-0.8B

## Resumen
HaloGuard 2.0-Poly-0.8B es un modelo de clasificación de tokens (token-classification) disenado como guardia de seguridad para respuestas generadas por LLM en tiempo de streaming. Lo desarrolla astroware y se construye sobre el backbone Qwen3.5-0.8B, al que se anade una cabeza de clasificacion causal que emite una probabilidad de inseguridad P(unsafe) en cada token de la respuesta. Su proposito es permitir que un despliegue detenga una generacion danina a mitad del stream, en lugar de detectarla a posteriori.

El modelo cubre 17 idiomas y aplica una regla de disparo latchada: cuando 3 tokens consecutivos de la respuesta superan el umbral 0.675, la respuesta se marca como insegura de forma permanente. Ademas de la etiqueta binaria, reporta la posicion donde la respuesta empezo a ser insegura (first_fire_index), lo que aporta trazabilidad sobre el punto de inflexion.

Con 752 millones de parametros, contexto maximo de 2.048 tokens y licencia Apache 2.0, es relevante por su relacion calidad/tamano: reporta 83.08 F1 en PolyGuardPrompts frente a modelos de 7B-8B como Llama Guard 3 o PolyGuard-Qwen, y se posiciona en el ecosistema de guards de salida junto a la variante inglesa HaloGuard 2.0-Stream-0.8B y el guard de entrada HaloGuard 1.0-Gen-0.8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone causal Qwen3.5-0.8B con cabeza de clasificacion por token (token-classification) |
| Parametros totales | 752.395.074 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (entrenado en bfloat16; pesos en safetensors) |
| Idiomas soportados | 17: en, zh, ja, ko, hi, ar, es, fr, de, pt, it, ru, cs, pl, nl, sv, th |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere trust_remote_code) |

## Arquitectura y entrenamiento
El modelo es un transformer causal (backbone Qwen3.5-0.8B) con una cabeza de clasificacion binaria anadida que produce P(unsafe) en cada posicion de la respuesta. El prompt se incluye en el forward pass como contexto, pero ningun token del prompt puede disparar el veredicto por si mismo: solo las posiciones de respuesta son evaluables. La salida es un veredicto binario safe/unsafe, latchado, junto con la posicion de disparo. La regla de servicio es de 3 tokens consecutivos de respuesta con probabilidad igual o superior a 0.675; el modelo expone ademas `run[k]` para k = 1, 2, 3, lo que permite barrer umbrales alternativos offline con un solo forward pass.

El entrenamiento se realizo en dos etapas. Primero se entreno una cabeza de seguridad sobre PolyGuardMix, un corpus multilingue de prompt/respuesta de 1,9 millones de filas. Despues se refino con supervision correctiva extraida de fallos de benchmark: las respuestas que el modelo base clasificaba incorrectamente en PolyGuardPrompts se corrigieron y se reincorporaron como senal de entrenamiento adicional, y el resultado se interpolo con el modelo base a alpha = 0.50. Es la misma receta de mineria de errores empleada en la version inglesa. No se detallan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se uso RLHF o DPO.

## Capacidades
- Clasificacion de seguridad por token sobre respuestas de LLM, con probabilidad P(unsafe) en cada posicion de la respuesta.
- Deteccion de inicio de dano (onset): reporta first_fire_index, es decir, donde la respuesta paso a ser insegura.
- Regla de disparo latchada: 3 tokens consecutivos con probabilidad igual o superior a 0.675; una vez disparada, la marca persiste.
- Monitoreo en streaming: la senal es causal y utilizable durante la generacion, no solo al final.
- Multilingue en 17 idiomas, con cobertura de escrituras latina, CJK, indic, arabe y del sudeste asiatico.
- Modo de lectura de senal cruda: `return_probs=True` devuelve la probabilidad por token y `run[k]` para k = 1, 2, 3.
- Configuracion de regla personalizada mediante `guard.rule` (max_p_threshold, run_threshold, run_length).
- Integracion como condicion de parada en el bucle de generacion (cut / allow / log).
- No se documentan capacidades de tool calling, agentes, vision ni audio; el modelo es exclusivamente un guard de texto.

## Casos de uso
- Moderacion de salida en produccion: el guard se situa entre el LLM y el usuario; si dispara, se corta el stream y se devuelve un mensaje seguro o se registra el incidente. Su senal causal permite actuar antes de que el usuario vea el tramo danino.
- Atencion al cliente automatizada: en conversaciones multi-turno con respuestas generadas en varios idiomas, el guard vigila cada respuesta y detiene salidas que empiecen a derivar en contenido inseguro, con contexto de hasta 2.048 tokens.
- Cumplimiento y auditoria: first_fire_index y la probabilidad por token permiten registrar donde se origino el problema, lo que facilita la revision posterior y la trazabilidad de incidentes.
- Despliegue multilingue en mercados diversos: con F1 entre 82 y 88 en la mayoria de idiomas europeos y CJK, es adecuado para plataformas que sirven en es, fr, de, it, pt, nl, sv, zh, ja, ru o ar.
- Filtrado en pipelines de generacion de codigo o contenido: integrado como condicion de parada en el bucle de decodificacion, evita que se emitan respuestas con instrucciones daninas, phishing o contenido prohibido.
- Investigacion en seguridad de LLM: sus salidas por token y su regla configurable permiten experimentar con umbrales alternativos y analizar la dinamica de onset en distintos idiomas sin reentrenar.
- Proteccion de aplicaciones de chat en tiempo real: al ser un modelo de 0.8B, se puede ejecutar junto al modelo generador en la misma infraestructura y anadir latencia acotada por token.

## Benchmarks y rendimiento

PolyGuardPrompts, F1 de dano en respuestas:

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

F1 por idioma:

| Idioma | F1 | Idioma | F1 |
|---|---|---|---|
| Espanol | 88,4 | Chino | 83,5 |
| Ingles | 87,1 | Japones | 83,4 |
| Italiano | 86,6 | Ruso | 83,3 |
| Sueco | 86,2 | Arabe | 82,7 |
| Frances | 86,0 | Coreano | 82,5 |
| Polaco | 85,9 | Checo | 82,1 |
| Portugues | 85,9 | Tailandes | 73,9 |
| Aleman | 85,3 | Hindi | 64,2 |
| Neerlandes | 85,2 | | |

## Requisitos de hardware
- VRAM estimada: aproximadamente 1,5 GB en bfloat16 para los pesos (752 M de parametros); el repo ocupa 1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre; cabe en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso puede ejecutarse en CPU para cargas de baja concurrencia.
- Opciones de despliegue: transformers con `AutoModelForTokenClassification` y `trust_remote_code=True`; el modelo define metodos propios (`classify`, `classify_stream`), por lo que la integracion debe hacerse a traves de su API de transformers. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (PolyGuardPrompts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HaloGuard 2.0-Poly | 0,8B | 2.048 | 83,08 | Apache 2.0 | HuggingFace |
| Llama Guard 3 | 8B | no disponible | 65,74 | licencia Llama | HuggingFace |
| PolyGuard-Qwen | 7B | no disponible | 74,08 | no disponible | HuggingFace |
| PolyGuard Smol | 0,5B | no disponible | 66,82 | no disponible | HuggingFace |

HaloGuard 2.0-Poly ofrece el mayor F1 de la comparativa con una decima parte de parametros que Llama Guard 3 o PolyGuard-Qwen, y una licencia permisiva Apache 2.0. Como contrapartida, su contexto maximo de 2.048 tokens es mas corto que el de los guards de 8B, y su rendimiento cae en indic (64,2) y sudeste asiatico (73,9).

## Limitaciones y advertencias
- El rendimiento es desigual por idioma: hindi (64,2 F1) y tailandes (73,9) estan muy por debajo del ingles (87,1) y el espanol (88,4); el grupo indic presenta un FNR del 22,2 %, lo que implica una tasa notable de contenido inseguro no detectado.
- Contexto maximo de 2.048 tokens: respuestas o prompts mas largos requieren truncado o segmentacion, con posible perdida de contexto.
- La regla de disparo latchada (3 tokens consecutivos a 0.675 o mas) puede producir falsos positivos en textos con picos aislados de probabilidad; el autor permite ajustar el umbral, pero no se documentan curvas de calibracion para umbrales alternativos.
- Riesgo de alucinacion del propio guard: no se documentan tasas de error fuera de PolyGuardPrompts, por lo que su comportamiento en dominios distintos al de entrenamiento es incierto.
- Solo evalua posiciones de respuesta; no sustituye a un guard de entrada, que en esta familia es HaloGuard 1.0-Gen-0.8B.
- Requiere `trust_remote_code=True` y codigo personalizado (`halo_stream_guard`), lo que implica revisar el codigo antes de desplegarlo en produccion.
- Licencia Apache 2.0: permite uso comercial, pero no se detallan condiciones adicionales ni garantias por parte del autor.
- No se han publicado datos sobre sesgos especificos, latencia, throughput ni consumo energetico.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/astroware/HaloGuard2.0-Poly-0.8B
- Variante inglesa HaloGuard 2.0-Stream-0.8B: https://huggingface.co/ash-astro/HaloGuard2.0-Stream-0.8B
- Guard de entrada HaloGuard 1.0-Gen-0.8B: https://huggingface.co/astroware/HaloGuard1-Gen-0.8B
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper de PolyGuard (referencia de benchmarks y dataset): no disponible en la informacion proporcionada.

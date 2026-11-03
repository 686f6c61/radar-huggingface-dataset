# astroware/HaloGuard2-MultiStream-0.8B

## Resumen

HaloGuard 2.0-Poly-0.8B es un modelo de clasificación de tokens disenado como guardia de seguridad de salida para asistentes conversacionales. Lo desarrolla el usuario astroware y se construye sobre el backbone de Qwen3.5-0.8B, al que se anade una cabeza de clasificacion causal que emite una probabilidad de inseguridad P(unsafe) en cada token de la respuesta generada. Su proposito es permitir que un despliegue interrumpa una completion danina a mitad de stream, en lugar de detectarla a posteriori.

El modelo cubre 17 idiomas y aplica una regla de disparo con latch: cuando tres tokens consecutivos de la respuesta superan el umbral de 0,675, el veredicto se fija como inseguro y permanece asi. Ademas de la etiqueta binaria, reporta la posicion en la que la respuesta empezo a ser insegura (first_fire_index), lo que facilita la integracion como condicion de parada en bucles de generacion.

Con 752 millones de parametros y una ventana de contexto maxima de 2.048 tokens, el modelo declara un F1 de 83,08 en la tarea de respuesta danina de PolyGuardPrompts, por encima de baselines de 7B y 8B citados en la model card. Esta publicado con licencia Apache 2.0 y pesos en safetensors, en bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (backbone Qwen3.5-0.8B) con cabeza de clasificacion por token |
| Parametros totales | 752.395.074 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, zh, ja, ko, hi, ar, es, fr, de, pt, it, ru, cs, pl, nl, sv, th (17) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere trust_remote_code) |

## Arquitectura y entrenamiento

El modelo es una cabeza de clasificacion por token sobre un backbone causal Qwen3.5-0.8B. La tarea es la monitorizacion de seguridad de respuestas en streaming: el prompt se incluye en el forward pass como contexto, pero ningun token del prompt puede disparar el veredicto; solo las posiciones de la respuesta son evaluadas. La salida por posicion es una probabilidad P(unsafe), y la regla de servicio declarada dispara cuando tres tokens consecutivos de la respuesta alcanzan o superan 0,675, con latch permanente una vez activado. El modelo expone ademas `run[k]` para k = 1, 2, 3, lo que permite barrer reglas alternativas offline a partir de un unico forward pass.

El entrenamiento se realizo en dos etapas. La base es una cabeza de seguridad sobre Qwen3.5-0.8B entrenada con PolyGuardMix, un corpus multilingue de prompts y respuestas de 1,9 millones de filas. Despues se refino con supervision correctiva minada a partir de fallos de benchmark: las respuestas que el modelo base clasificaba incorrectamente en PolyGuardPrompts se corrigieron y se reincorporaron como senal adicional de entrenamiento, y el resultado se interpolo con el modelo base con un factor alpha = 0,50. La model card no detalla el volumen total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de la referencia a PolyGuardMix.

## Capacidades

- Clasificacion de seguridad por token sobre respuestas generadas, con salida binaria safe/unsafe y probabilidad por posicion.
- Deteccion del punto de inicio de la inseguridad (first_fire_index), no solo del resultado final.
- Regla de disparo con latch (3 tokens consecutivos con P >= 0,675) disenada para ser condicion de parada en generacion streaming.
- Capacidad de reconfigurar el punto de operacion mediante `guard.rule` (run_threshold, run_length, max_p_threshold).
- API de streaming (`classify_stream`) que emite pasos con el flag de disparo y la probabilidad asociada.
- Cobertura multilingue en 17 idiomas, incluidos espanol, frances, aleman, portugues, italiano, chino, japones, coreano, arabe, hindi, tailandes, checo, polaco, neerlandes, sueco y ruso.
- No es un modelo generativo: no produce texto, razonamiento, codigo ni vision. Su funcion es exclusivamente de moderacion de salida.
- No se documenta soporte de tool calling ni de agentes; la model card no menciona function calling.

## Casos de uso

- Moderacion de salida en produccion: el guard se coloca entre el LLM generador y el usuario, y corta la generacion cuando la respuesta empieza a derivar hacia contenido danino, con la ventaja de que la senal es causal y usable durante la generacion.
- Atencion al cliente automatizada: en un chatbot multi-turno con prompts largos, el guard vigila solo la respuesta y evita que el asistente emita instrucciones peligrosas o contenido prohibido, con un coste de 0,8B parametros por paso.
- Filtrado de respuestas en pipelines de generacion con vLLM o TGI: se integra como condicion de parada en el bucle de decodificacion, ya que el veredicto se latcha y la aplicacion decide la accion (cortar, registrar o permitir).
- Cumplimiento normativo multilingue: para despliegues en la UE que sirven a usuarios en espanol, frances, aleman, italiano y portugues, el modelo ofrece F1 entre 85,3 y 88,4 en esos idiomas, lo que permite justificar controles de salida por idioma.
- Auditoria y logging de incidentes: al registrar first_fire_index y la traza de probabilidades por token, el equipo de seguridad puede reconstruir donde se desvio una respuesta y ajustar prompts o politicas.
- Investigacion en seguridad de LLM: el modelo sirve como baseline reproducible de 0,8B para experimentos de moderacion en streaming y para comparar reglas de disparo alternativas mediante `run[k]`.
- Despliegue en entornos con recursos limitados: con 752M parametros y pesos bfloat16, cabe en una unica GPU consumer para servir como capa de guardia junto a un modelo generador mas grande.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre PolyGuardPrompts (F1 de dano en respuestas):

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

Las cifras de los baselines se atribuyen en la model card al paper de PolyGuard (Tabla 1). No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K, que no aplican a un modelo de clasificacion.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,5 GB de pesos mas overhead de activaciones y contexto; en la practica, entre 2 y 4 GB segun longitud de secuencia y batch.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; una RTX 4090, A100 o H100 son sobredimensionadas para este modelo y permiten lotes grandes.
- Cabe en GPU consumer: si, en tarjetas de 8 GB o mas (por ejemplo RTX 3060, RTX 4060, RTX 4070).
- Opciones de despliegue: transformers con `trust_remote_code=True` (metodo documentado en la model card); el autor no documenta integracion con vLLM, llama.cpp, Ollama ni TGI, por lo que su uso con esos motores no esta verificado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 en PolyGuardPrompts | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HaloGuard 2.0-Poly-0.8B | 0,8B | 2.048 | 83,08 | Apache 2.0 | HuggingFace |
| Llama Guard 3 | 8B | no disponible | 65,74 | licencia Llama | HuggingFace |
| PolyGuard-Qwen | 7B | no disponible | 74,08 | no disponible | HuggingFace |
| PolyGuard Smol | 0,5B | no disponible | 66,82 | no disponible | HuggingFace |

La comparativa se limita a los datos citados en la model card; no se dispone de informacion sobre contexto, licencia ni disponibilidad de los modelos alternativos en la informacion proporcionada, salvo la referencia a Llama Guard 3. El modelo relacionado HaloGuard 2.0-Stream-0.8B es la variante solo en ingles, y HaloGuard 1.0-Gen-0.8B es el guard de entrada (prompt).

## Limitaciones y advertencias

- El modelo no genera texto ni razona: es exclusivamente un clasificador de seguridad de salida; no debe usarse como LLM.
- Contexto maximo de 2.048 tokens, lo que limita el uso con prompts y respuestas muy largas; la model card no documenta comportamiento fuera de esa ventana.
- Rendimiento desigual por idioma: hindi (64,2) y tailandes (73,9) quedan muy por debajo del resto, con FNR de 22,2 en el grupo indic, lo que implica un riesgo real de falsos negativos en esos idiomas.
- La regla de disparo con latch y ventana de 3 tokens puede producir falsos positivos en respuestas que contienen breves fragmentos sensibles en contexto legitimo (por ejemplo, citas o discurso reportado).
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea (falsos positivos y negativos) derivado de la supervision y del minado de errores.
- La model card no documenta sesgos especificos por genero, etnia o religion; no hay informacion disponible al respecto.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene auditar el codigo antes de desplegarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener sus propias condiciones que conviene verificar.
- El repositorio tiene 40 descargas y 0 likes en el momento de la consulta, y la model card cita un repositorio alternativo (ash-astro) distinto del ID publicado (astroware); conviene verificar la correspondencia de pesos antes de usarlo.

## Enlaces

- HuggingFace: https://huggingface.co/astroware/HaloGuard2-MultiStream-0.8B
- Variante en ingles: https://huggingface.co/ash-astro/HaloGuard2.0-Stream-0.8B
- Guard de entrada: https://huggingface.co/astroware/HaloGuard1-Gen-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper de PolyGuard (referenciado en la model card): no disponible como enlace directo en la informacion proporcionada.

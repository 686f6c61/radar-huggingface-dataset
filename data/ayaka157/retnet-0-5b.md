# Ayaka157/RetNet-0.5B

## Resumen

RetNet-0.5B es un modelo de lenguaje de 504.179.896 parametros desarrollado por el usuario Ayaka157 y publicado en HuggingFace bajo licencia MIT. Se trata de una implementacion desde cero de una Retentive Network (RetNet), una arquitectura de atencion lineal con mecanismo de retencion multi-escala en lugar de la atencion softmax clasica del transformer. El modelo esta entrenado sobre un corpus de conversacion en chino (`chat_pack_v13`) y esta pensado para mantener dialogo multi-turno y persona, no para tareas de conocimiento factual o razonamiento.

El modelo tiene 20 capas, `d_model` de 1408, 22 cabezas, `ffn_dim` y `value_dim` de 2816, un vocabulario de 20.000 tokens y una ventana de contexto de 2048 tokens con chunk size de 128. Los pesos se distribuyen en float32 mediante safetensors y requieren `trust_remote_code=True` porque el modelo incluye codigo propio (`retnet_hf`) no integrado en la libreria transformers estandar.

Su relevancia es principalmente experimental: es un caso de entrenamiento completo de una arquitectura alternativa a la atencion cuadratica, con informe tecnico publico, curvas de validacion y un benchmark propio. Los resultados, sin embargo, son muy limitados (0,1037 de puntuacion total ponderada en `bench_v3`), y la propia model card reconoce fallos estructurales en el crecimiento de anchura durante el entrenamiento que dejan un 67,08% de los pesos a cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetNet (retentive network) con atencion lineal y retencion multi-escala |
| Parametros totales | 504.179.896 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (chunk size 128) |
| Tipos de cuantizacion | no disponible (solo float32 en safetensors; no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | chino (zh) e ingles (en); el entrenamiento es predominantemente en chino |
| Licencia | MIT |
| Formato de pesos | safetensors (dtype float32) |
| Capas | 20 |
| `d_model` | 1408 |
| Cabezas | 22 |
| `ffn_dim` / `value_dim` | 2816 / 2816 |
| Vocabulario | 20.000 |
| Normalizacion | layer norm con crecimiento que preserva funcion (`growth_old_dim` 768) |
| Retencion | multi-escala, con puerta de decaimiento aprendible por cabeza (`use_gla`) |
| Modo de inferencia | `parallel` en prefill, `recurrent` en decodificacion |
| Tamano del repositorio | 2,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

RetNet sustituye la atencion softmax por un mecanismo de retencion que admite tres formulaciones equivalentes: paralela, recurrente y chunkwise. En este modelo la retencion es multi-escala con una puerta de decaimiento aprendible por cabeza (`use_gla`), lo que permite un coste lineal en la longitud de secuencia durante la decodificacion. La normalizacion usa una layer norm de crecimiento que preserva la funcion, con `growth_old_dim` fijado en 768, es decir, el modelo se entreno inicialmente con anchura menor y luego se ensancho. `config.json` fija `mode` en `parallel` para inferencia, mientras que `generate()` usa `parallel` en prefill y `recurrent` en decoding; las tres rutas son matematicamente equivalentes pero no bit a bit, con una diferencia absoluta maxima medida de 3,395.

El entrenamiento se hizo sobre `chat_pack_v13`, con 552.330.489 slots de tokens (269.561 filas de 2049, de los cuales 16.126.035 son padding), en tres tramos o "legs" de una epoca cada uno, cada uno reiniciando un coseno completo de 1,1e-4 a 1,1e-5 con 500 pasos de warmup, AdamW de 8 bits, weight decay 0,1 y semilla 1234. El primer tramo corrio en una RTX 3090 de 24 GB con batch 4 y 67.390 pasos (11,316 h) hasta una perdida de validacion de 2,1035; el segundo y el tercero en una RTX PRO 6000 de 96 GB con batch 16, 16.848 pasos cada uno, 2,790 h y 2,685 h respectivamente, con perdidas de 1,9865 y 1,9459. El tercer tramo es el publicado por ser el mejor por perdida de validacion. En total se procesaron 3,28496 tokens por parametro. No se menciona RLHF ni DPO; el ajuste es exclusivamente por modelado de lenguaje autorregresivo sobre corpus de chat.

## Capacidades

- Generacion de texto conversacional en chino: mantiene turnos, persona y contexto multi-turno.
- Manejo de contexto de hasta 2048 tokens, suficiente para conversaciones de varios intercambios.
- Capacidad bilingue limitada (chino e ingles), con rendimiento muy bajo en la categoria `bilingual` del benchmark (0,0222).
- Capacidad de roleplay (0,2000 en `bench_v3`) y consistencia de persona (0,1429).
- Robustez ante entradas degradadas limitada (0,1000).
- Respuestas a preguntas muy debiles (0,1000 en QA).
- No soporta tool calling ni function calling: no hay plantilla ni entrenamiento especifico documentado.
- No soporta agentes ni razonamiento multi-paso: la puntuacion en `structured` es 0,0000.
- No tiene capacidades de codigo (0,0000), matematicas (0,0000) ni salida estructurada (0,0000).
- No es multimodal: sin vision ni audio.
- No tiene modo de pensamiento explicito; de hecho presenta "think-leakage" del 59,61%, es decir, filtra contenido de razonamiento interno en la respuesta.

## Casos de uso

- Experimentacion academica con arquitecturas de atencion lineal: permite reproducir y estudiar el comportamiento de una RetNet a escala 0,5B sobre hardware de consumo, con informe tecnico y registro de entrenamiento publicos.
- Prototipado de chatbots conversacionales en chino: el modelo mantiene persona y contexto multi-turno, por lo que sirve para validar flujos de dialogo antes de migrar a un modelo mayor.
- Investigacion sobre crecimiento de anchura en entrenamiento: el caso documenta un fallo concreto (78 de 82 tensores afines de crecimiento a cero) que resulta util como referencia negativa para disenar esquemas de inicializacion.
- Pruebas de equivalencia entre los modos paralelo, recurrente y chunkwise: util para validar implementaciones propias de RetNet comparando salidas entre formulaciones.
- Generacion de texto creativo o de continuacion en chino sin requisitos de exactitud: la categoria `continuation` da 0,0000, asi que solo es viable con supervision humana y expectativas bajas.
- Docencia y divulgacion: por su tamano (2 GB en float32) y su licencia MIT, es adecuado como ejemplo ejecutable en un curso sobre arquitecturas alternativas al transformer.
- Base para fine-tuning ligero en dominios cerrados de conversacion en chino, siempre que se acepte la debilidad de partida del modelo en factualidad y estructura.

## Benchmarks y rendimiento

Los datos publicados provienen de `bench_v3` del propio autor: 1.020 items, 15 categorias y una sola semilla.

| Categoria | n | Puntuacion |
|---|---|---|
| Safety | 35 | 0,2857 |
| Multi-turn | 90 | 0,2667 |
| Roleplay | 100 | 0,2000 |
| Consistency | 70 | 0,1429 |
| Robustness | 50 | 0,1000 |
| QA | 120 | 0,1000 |
| Cloze | 120 | 0,0250 |
| Bilingual | 45 | 0,0222 |
| Instruction following | 80 | 0,0125 |
| Language | 90 | 0,0111 |
| Coding | 25 | 0,0000 |
| Math | 25 | 0,0000 |
| Structured | 60 | 0,0000 |
| Continuation | 60 | 0,0000 |
| Long context | 50 | 0,0000 |
| **Total ponderado** | 1.020 | **0,1037** (IC 95%: 0,032-0,130) |

Metricas adicionales declaradas: think-leakage 59,61% y truncacion 72,94%. El presupuesto de items es de 16 a 160 tokens nuevos, mientras que la respuesta mediana de entrenamiento ronda los 570 tokens, de ahi que el 72,94% de los items toquen el techo. Entre los 276 items no truncados, la tasa de fuga es 0,00 y la puntuacion sube a 0,15217. El autor advierte que, con una sola semilla, los numeros por categoria no tienen potencia estadistica.

Comparativa con MMLU, HumanEval, GSM8K u otros benchmarks estandar: no disponible. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Pesos en float32: aproximadamente 2,02 GB (504.179.896 parametros x 4 bytes), coherente con el tamano de repositorio de 2,0 GB.
- VRAM estimada para inferencia: alrededor de 2,5-3 GB contando pesos, cache KV y activaciones con contexto de 2048 tokens en float32.
- GPU valida en hardware de consumo: cabe sin problema en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares; tambien en GPUs con 4-6 GB si se reduce el contexto.
- GPU usadas en entrenamiento: RTX 3090 de 24 GB (primer tramo) y RTX PRO 6000 de 96 GB (segundo y tercer tramo).
- Es posible ejecutarlo en CPU, dado el tamano, aunque no se documentan velocidades.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via soportada oficialmente. No hay pesos GGUF, por lo que llama.cpp y Ollama no son aplicables sin conversion previa. vLLM y TGI no estan validados con este codigo personalizado (`retnet_hf`).
- Latencia y throughput de inferencia: no disponible. Los unicos tiempos publicados son de entrenamiento (2,685 h para 16.848 pasos en el tercer tramo).
- Nota practica: el uso de `recurrent` en decoding da coste lineal por token en teoria, pero no hay mediciones publicadas que lo confirmen en este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| RetNet-0.5B (Ayaka157) | 504.179.896 | 2048 | RetNet con retencion multi-escala | MIT | bench_v3 0,1037 (benchmark propio) |
| Qwen2.5-0.5B | ~0,5B | no disponible en la informacion proporcionada | transformer denso | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| SmolLM2-360M | ~0,36B | no disponible en la informacion proporcionada | transformer denso | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

No hay datos de benchmarks comparables en la informacion proporcionada, y el unico benchmark de RetNet-0.5B es interno (`bench_v3`), por lo que cualquier comparacion numerica con otros modelos careceria de base. La comparacion relevante es cualitativa: frente a modelos densos de tamano similar, RetNet-0.5B ofrece una arquitectura de atencion lineal con coste subcuadratico, pero rinde muy por debajo en tareas de codigo, matematicas, instrucciones y conocimiento factual.

## Limitaciones y advertencias

- Rendimiento global muy bajo: 0,1037 de puntuacion ponderada en `bench_v3`, con 0,0000 en codigo, matematicas, salida estructurada, continuacion y contexto largo.
- Alto riesgo de alucinacion: la propia model card indica que no hace recuperacion factual y que produce "texto fluido pero poco fiable".
- Fuga de razonamiento (think-leakage) del 59,61%: parte de la respuesta puede contener contenido interno no destinado al usuario.
- Truncacion del 72,94% en evaluacion por presupuesto de tokens, lo que invalida buena parte de las puntuaciones por categoria.
- Problema estructural en los pesos: 78 de los 82 tensores afines de crecimiento son exactamente cero y el 67,08% de todos los elementos de peso son cero. Los canales anadidos durante el crecimiento de anchura nunca se activaron porque `gamma_new` se inicializo a cero, cortando el gradiente; inicializarlo a 1,0 habria sido igualmente preservador de funcion y podria haberlos desbloqueado, pero no se probo.
- Las cabezas 16 a 21 tienen valores de `msr.gamma` de 0,5430, que coincide con el efecto del weight decay desacoplado de AdamW sobre el schedule de learning rate, no con aprendizaje real: esas cabezas nunca recibieron gradiente.
- Sesgos: al entrenarse sobre corpus de chat en chino (`r1_110k_sft`, `i_wonder_why`, `better_ruozhiba` y una base mixta anterior), hereda los sesgos de esas fuentes; no se documenta ninguna evaluacion de sesgo.
- Limitacion idiomatica: el modelo es funcionalmente chino; la puntuacion bilingue es 0,0222, por lo que no es fiable en ingles ni, presumiblemente, en castellano.
- Limitacion de contexto: 2048 tokens con chunk size 128; en entrenamiento el modo chunkwise exige longitudes multiplo de 128 y falla con prompts cortos, motivo por el que se cambio a `parallel`.
- Restricciones de licencia: los pesos son MIT y permiten uso comercial, pero los datos de entrenamiento provienen de corpus publicos de terceros cuya licencia debe verificarse antes de cualquier reutilizacion.
- Reproducibilidad: el tokenizer, el dataset `chat_pack_v13` y los registros de entrenamiento no se distribuyen, por lo que no es posible reproducir el entrenamiento a partir de lo publicado.
- Riesgo operativo: requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python del autor; en produccion conviene auditar ese codigo antes de desplegarlo.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ayaka157/RetNet-0.5B
- Repositorio con codigo, benchmark e informe tecnico: https://github.com/Ayaka157/RetNet
- Paper de RetNet (referencia de la arquitectura): no disponible en la informacion proporcionada
- Demo o Space: no disponible en la informacion proporcionada
- Los resultados de busqueda web devueltos no contienen informacion relevante sobre el modelo (corresponden a paginas de Google Maps) y se descartan.

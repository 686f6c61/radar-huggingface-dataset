# patrickbdevaney/deepseek-v4-flash-0731-REAP-calibrated-draft-head

## Resumen

Este repositorio no contiene un modelo de lenguaje independiente, sino un conjunto de tensores de una cabeza de borrador (draft head) DSpark MTP afinada para decodificación especulativa sobre el checkpoint `0xSero/DeepSeek-V4-Flash-0731-REAP`. Ese checkpoint objetivo es, a su vez, una poda REAP de 160 de los 256 expertos enrutados de `deepseek-ai/DeepSeek-V4-Flash-0731`. El artefacto publicado aquí sustituye la cabeza de borrador nativa del checkpoint y se distribuye como pieza histórica de una línea de experimentación (la sesión 3, `s3`, empaquetada como `dspark-mtp-draft-head-0731reap-v1`).

El interés técnico reside en la aceleración medida: sobre un Jetson AGX Thor con el motor CUDA propio del autor, esta cabeza alcanza 25,53 tok/s frente a 13,80 tok/s de decodificación autorregresiva pura en la misma ejecución (1,85x), con un ancho de borrador de 6 y un τ (tokens confirmados por forward del modelo objetivo) de 3,8438. En una remedición emparejada contra la cabeza de serie del checkpoint, la mejora es de +8,70% en τ y +9,52% en tok/s. El autor indica explícitamente que esta versión ha quedado superada por `dspark-mtp-draft-head-s3recap-p25-b0.1` y por el checkpoint listo para ejecutar `DeepSeek-V4-Flash-0731-REAP-DSpark`.

La relevancia práctica es acotada pero clara: demuestra que es posible exprimir decodificación especulativa con cabezas MTP entrenadas sobre los estados ocultos del propio modelo objetivo en hardware de borde (Jetson Thor, `sm_110a`), sin degradar la calidad de salida bajo verificación voraz, ya que cada token lo decide el modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de borrador DSpark MTP con tres bloques encadenados (`mtp.0/1/2`) sobre un transformer MoE objetivo; incluye atención, router gate y bias, shared expert, parámetros de hyper-connection, `main_proj`, Markov head y confidence head |
| Parametros totales | 517.318.215 (solo la cabeza, en BF16 como master de entrenamiento); los expertos enrutados no se incluyen y provienen sin cambios del checkpoint objetivo |
| Parametros activos | no disponible para la cabeza; el modelo objetivo es un MoE podado a 160 de 256 expertos enrutados |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos de la cabeza en BF16; el checkpoint objetivo emplea FP8 con escalas de bloque E8M0 potencia de dos y expertos nativos MXFP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`mtp_trained.safetensors`, 1.034.643.326 bytes, SHA-256 `5dd3ae629d3d…`) |

## Arquitectura y entrenamiento

La cabeza es un módulo de decodificación especulativa multi-token prediction (MTP) compuesto por tres bloques DSpark encadenados que se apoyan en los estados ocultos del modelo objetivo. El fichero contiene los 72 tensores no pertenecientes a expertos: atención, router gate y bias, shared expert, parámetros de hyper-connection, `main_proj`, Markov head y confidence head. Los expertos enrutados se heredan del checkpoint `0xSero/DeepSeek-V4-Flash-0731-REAP`, que a su vez es una poda REAP de 160 de 256 expertos de `deepseek-ai/DeepSeek-V4-Flash-0731` en el commit `9e165c30`. El ancho de borrador medido es 6, mientras que el `dspark_block_size` nativo del checkpoint es 5.

El entrenamiento usó 1.536 prompts balanceados en 8 categorías (192 por categoría), de los cuales 1.472 se destinaron a entrenamiento y 64 quedaron como conjunto de retención disjunto. Las continuaciones fueron generadas por el propio checkpoint objetivo y la cabeza se entrenó sobre los estados ocultos capturados en esas secuencias; los prompts de `agentic_format` provienen de BFCL. El proceso consistió en una pasada de 1.472 pasos repartida en tres chunks. No se documenta en la información disponible el uso de RLHF o DPO para esta cabeza.

La integración requiere un paso de reconstrucción determinista: los tensores se sustituyen en los shards 46–48 del checkpoint objetivo y se recuantizan a los formatos del checkpoint mediante `tools/build_trained_head.py`, que calcula una nueva escala de bloque E8M0 potencia de dos para cada tensor FP8 y rechaza cualquier tensor cuyo error de ida y vuelta supere 0,10.

## Capacidades

- Decodificación especulativa: actúa como cabeza de borrador para el checkpoint objetivo, proponiendo tokens que el modelo objetivo verifica.
- Multi-token prediction con tres bloques encadenados y ancho de borrador configurable (medido a 6; el nativo del checkpoint es 5).
- Verificación sin pérdida bajo decodificación voraz: la calidad de salida no se ve afectada por construcción, porque el modelo objetivo decide cada token.
- Cabeza de confianza (confidence head) para el control de aceptación de borradores.
- Soporte de categorías diversas de prompt: contexto largo, formato agéntico, multiturno, edición de código, factual breve, razonamiento, generación de código y explicación.
- No es un modelo autónomo: no genera texto por sí mismo, no soporta tool calling propio ni capacidades multimodales, de audio o de visión.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Aceleración de inferencia en dispositivo de borde: desplegar el checkpoint REAP con esta cabeza en un Jetson AGX Thor permite pasar de 13,80 a 25,53 tok/s en decodificación voraz, lo que hace viable servir una sesión agéntica local sin GPU de centro de datos.
- Servicio de agente único con latencia interactiva: el motor del autor sirve una sesión agéntica a la vez y decodifica sin pérdida con la cabeza afinada, adecuado para asistentes locales de un solo usuario.
- Sustitución de la cabeza nativa en un pipeline existente: si ya se ejecuta `DeepSeek-V4-Flash-0731-REAP` con el motor `deepseek-v4-flash-0731-cuda`, la reconstrucción de shards 46–48 con estos tensores mejora el τ de 3,5362 a 3,8438 en la remedición emparejada.
- Investigación en decodificación especulativa: sirve como punto de comparación histórico frente a cabezas posteriores (`s3recap-p25-b0.1`) para estudiar el efecto del entrenamiento de la cabeza en la tasa de aceptación por categoría.
- Evaluación de compromisos por categoría de prompt: los datos por categoría permiten elegir configuración según la carga; esta cabeza mejora mucho en razonamiento (1,85 a 3,85) y multiturno (4,46 a 6,09), pero empeora en contexto largo (5,54 a 3,94) y formato agéntico (5,15 a 3,64).
- Reproducción de resultados en hardware Jetson: el repositorio incluye `eval.log` y `head_card.json`, lo que permite reproducir el protocolo congelado de 8 prompts y verificar la puerta de pérdida nula (`LOSSLESS GATE ... PASS`).
- No recomendado para producción nueva: el propio autor redirige a `DeepSeek-V4-Flash-0731-REAP-DSpark`, que alcanza 28,38 tok/s a ancho 5.

## Benchmarks y rendimiento

Protocolo del motor: suite congelada de 8 prompts, uno por categoría, con al menos 200 tokens generados cada uno, decodificación voraz, ancho de borrador 6 y adaptK 1.50. τ es el número de tokens confirmados por forward del objetivo; el máximo es 7 con ancho 6.

| Metrica | Valor |
|---|---:|
| Decodificación AR pura (misma ejecución) | 13,80 tok/s |
| Esta cabeza, ancho 6 (τ) | 3,8438 |
| Esta cabeza, ancho 6 (tok/s) | 25,53 (1,85x) |
| Esta cabeza, ancho 5 (τ) | 3,6888 |

Remedición emparejada contra la cabeza de serie, motor `93699e6`:

| Cabeza | τ | tok/s |
|---|---:|---:|
| Stock | 3,5362 | 22,14 |
| `s3` | 3,8438 | 24,25 |
| Diferencia | +8,70% | +9,52% |

τ por categoría a ancho 6:

| Categoria | Cabeza stock | `s3` |
|---|---:|---:|
| long_context | 5,54 | 3,94 |
| agentic_format | 5,15 | 3,64 |
| multi_turn | 4,46 | 6,09 |
| code_edit | 4,43 | 4,20 |
| short_factual | 3,27 | 3,48 |
| reasoning | 1,85 | 3,85 |
| code_gen | 1,84 | 2,49 |
| explanation | 1,75 | 3,06 |
| Media de la suite | 3,5362 | 3,8438 |

En el conjunto de retención de 64 secuencias, disjunto del entrenamiento, la τ mediana de esta cabeza fue 4,622 frente a 6,000 de la cabeza sin entrenar (−1,378), por lo que la puerta secundaria de la sesión leyó SATURATED. Las dos sesiones anteriores mostraron el mismo patrón frente a un control emparejado: −0,404 y −0,648 de τ. No se ha medido el efecto de la cabeza sobre la calidad de salida; bajo verificación voraz no existe por construcción.

## Requisitos de hardware

- VRAM estimada para la cabeza: el fichero de pesos ocupa 1,0 GB en BF16; el checkpoint objetivo completo requiere memoria adicional no especificada en la información disponible.
- GPU validadas: únicamente NVIDIA Jetson AGX Thor (`sm_110a`). No se ha probado ningún otro runtime.
- GPU de centro de datos (A100, H100) y consumer (RTX 4090): no disponibles; el motor del autor es específico para Jetson Thor.
- Cabe en GPU consumer: no disponible; el único despliegue documentado es un módulo de borde con memoria unificada.
- Opciones de despliegue: motor propio `patrickbdevaney/deepseek-v4-flash-0731-cuda` con servidor compatible con OpenAI; reconstrucción de la cabeza mediante `tools/build_trained_head.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 25,53 tok/s a ancho 6 y 24,25 tok/s en la remedición emparejada; el checkpoint completo con la cabeza posterior `s3recap-p25-b0.1` alcanza 28,38 tok/s a ancho 5, lo que supone 1,97x frente a su propia decodificación autorregresiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta cabeza (`s3`) | 517.318.215 (solo cabeza) | no disponible | τ 3,8438; 25,53 tok/s en Thor | MIT | Hugging Face, histórica |
| `dspark-mtp-draft-head-s3recap-p25-b0.1` | no disponible | no disponible | Superior; recomendada por el autor | no disponible | Hugging Face |
| `DeepSeek-V4-Flash-0731-REAP-DSpark` | checkpoint completo con cabeza posterior | no disponible | 28,38 tok/s a ancho 5 | no disponible | Hugging Face, recomendado |
| Cabeza stock del checkpoint | no disponible | no disponible | τ 3,5362; 22,14 tok/s | MIT (checkpoint) | Incluida en el checkpoint |

## Limitaciones y advertencias

- No es un modelo autónomo: sin el checkpoint objetivo y el motor CUDA del autor no produce ninguna salida.
- Artefacto superado: el autor recomienda migrar a `dspark-mtp-draft-head-s3recap-p25-b0.1` o a `DeepSeek-V4-Flash-0731-REAP-DSpark` para uso nuevo.
- Un solo runtime validado: Jetson AGX Thor con `sm_110a` y la revisión de motor `85dbea6cf`; no hay pruebas en otras plataformas.
- Degradación en categorías clave: la tasa de aceptación cae frente a la cabeza stock en `long_context` (5,54 a 3,94) y `agentic_format` (5,15 a 3,64), lo que puede penalizar cargas con prompts largos o formato de herramientas.
- Señal de saturación en retención: la τ mediana en el conjunto disjunto es inferior a la de la cabeza sin entrenar (−1,378), lo que sugiere sobreajuste al conjunto de entrenamiento en la métrica de aceptación.
- Calidad de salida no medida de forma independiente; la afirmación de ausencia de degradación se apoya en la verificación voraz del modelo objetivo.
- Idiomas soportados no documentados para la cabeza; cualquier limitación lingüística proviene del checkpoint objetivo.
- Licencia MIT declarada, sin restricciones comerciales explícitas en la información disponible; conviene verificar la licencia del checkpoint base y del modelo DeepSeek subyacente antes de un uso comercial.
- Riesgo de alucinación y sesgos: no documentados para la cabeza; son atribuibles al modelo objetivo y no se cuantifican en esta ficha.
- El proceso de reconstrucción exige recalcular escalas E8M0 y rechaza tensores con error de ida y vuelta superior a 0,10, por lo que una integración manual incorrecta puede invalidar el checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/patrickbdevaney/deepseek-v4-flash-0731-REAP-calibrated-draft-head
- Modelo base: https://huggingface.co/0xSero/DeepSeek-V4-Flash-0731-REAP
- Modelo DeepSeek original: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Cabeza posterior recomendada: https://huggingface.co/patrickbdevaney/dspark-mtp-draft-head-s3recap-p25-b0.1
- Checkpoint listo para ejecutar: https://huggingface.co/patrickbdevaney/DeepSeek-V4-Flash-0731-REAP-DSpark
- Motor de inferencia CUDA: https://github.com/patrickbdevaney/deepseek-v4-flash-0731-cuda

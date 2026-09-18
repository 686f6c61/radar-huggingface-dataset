# 0xWhiteMage/Qwen3.8-27B-Kearuga-DFlash2

## Resumen

Qwen3.8-27B-Kearuga-DFlash2 es un modelo borrador (drafter) para decodificación especulativa, desarrollado por el usuario 0xWhiteMage. No es un modelo de propósito general: su única función es proponer tokens candidatos que el modelo objetivo, `0xWhiteMage/Qwen3.8-27B-Kearuga` (familia Qwen3.8, 27B), verifica con su propio `lm_head` en BF16 sin modificar. Al ser un borrador, no altera la salida del objetivo: solo puede cambiar la velocidad a la que se genera, lo que el autor describe como "lossless by construction".

El modelo parte del drafter `z-lab/Qwen3.8-27B-DFlash2` y se ha destilado sobre las propias salidas del objetivo Kearuga. Cuantifica sus pesos en NVFP4 (W4A4, formato ModelOpt) con escalas de activación calibradas sobre características de Kearuga, y aplica una poda por frecuencia de la cabeza de borrador hasta 64K entradas. El resultado son 1.124.865.280 parámetros reales (según safetensors) que ocupan 1,55 GB en NVFP4 frente a los 3,85 GB del borrador BF16 de referencia.

Su relevancia es práctica y acotada: en una única NVIDIA DGX Spark (GB10 / Grace-Blackwell, SM121) con SGLang, eleva el rendimiento agregado de decodificación de 30,85 a 35,33 tok/s en un solo flujo (+14,5 %) y de 98,31 a 108,90 tok/s con cuatro flujos concurrentes (+10,8 %), manteniendo la fidelidad del objetivo en 40/40 coincidencias top-1. Es, por tanto, una pieza de infraestructura de serving para hardware Blackwell de memoria unificada, no un modelo para usar de forma autónoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, modelo borrador (drafter) para decodificacion especulativa, derivado de DFlash 2 (z-lab) |
| Parametros totales | 1.124.865.280 (1,12 B) segun safetensors |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | El objetivo soporta 262K tokens; la cabeza de borrador se poda por frecuencia a 64K entradas. Contexto propio del drafter: no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, layout ModelOpt) con escalas de activacion calibradas; version BF16 de referencia del borrador base |
| Idiomas soportados | en, zh (los tags incluyen tambien ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 7,9 GB) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa basado en DFlash 2, la técnica del drafter `z-lab/Qwen3.8-27B-DFlash2`. En decodificación especulativa, el borrador genera K tokens candidatos por paso y el modelo objetivo los verifica en paralelo con su `lm_head` en BF16 intacto; los tokens rechazados se descartan y el cómputo se reaprovecha. Esto implica que la calidad de salida depende exclusivamente del objetivo: el borrador solo influye en la tasa de aceptación y, con ello, en el rendimiento. El autor reporta una fidelidad Fidelity-40 idéntica a la del objetivo servido en solitario, con KL media de 0,0165, divergencia JS de 0,0034 y coincidencia top-1 de 40/40.

El entrenamiento consistió en destilar el borrador sobre las propias salidas del modelo objetivo Kearuga, seguido de una cuantización a NVFP4 (W4A4) en layout ModelOpt con escalas de activación calibradas sobre características de Kearuga. Adicionalmente se aplica una poda por frecuencia de la cabeza de borrador hasta 64K entradas (denominada "64K draft-head map" en la model card), que se aplica como overlay sobre la configuración base. No se especifican en la información disponible el número de tokens de destilación, la composición del dataset ni si hubo fases de RLHF o DPO, que en cualquier caso serían poco habituales en un modelo borrador.

La innovación principal es de eficiencia de memoria: al estar el ciclo de decodificación limitado por ancho de banda de memoria en la GB10 (273 GB/s de memoria unificada), cada byte eliminado del flujo de pesos se traduce directamente en tiempo de ejecución ahorrado. De ahí que la reducción de 3,85 GB (BF16) a 1,55 GB (NVFP4) sea el eje del diseño, junto con el aumento del número de tokens especulados de K = 10 a K = 12.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre el objetivo Qwen3.8-27B-Kearuga; no genera texto de forma autónoma ni sustituye al objetivo.
- Aceleración verificada en cinco dominios: código, matemáticas, llamadas a herramientas (tool calls), prosa e instrucciones (IFEval).
- Mayor ganancia relativa en tool calls (+26,2 % en C1 con el mapa de 64K) y en código y matemáticas (+23,1 % y +24,2 % respectivamente).
- Compatibilidad con decodificación greedy (temperature 0) en la evaluación publicada; el comportamiento con muestreo estocástico no está documentado.
- Integración con SGLang como backend de serving con decodificación especulativa.
- Soporte de contexto largo: el objetivo puede operar con su ventana completa de 262K tokens, y el drafter se ha evaluado en ese escenario.
- Capacidades multilingües limitadas a en y zh (con ar presente en los tags, sin detalle de evaluación).
- Pensamiento (thinking) desactivado durante la evaluación de referencia; no se documenta su comportamiento con modo thinking activo.

## Casos de uso

- Serving de agentes con tool calling: es el dominio con mayor ganancia medida (80,82 a 114,63 tok/s en C1, +26,2 %). El borrador acelera bucles agente-vs-herramienta donde se encadenan muchas llamadas cortas y el coste de decodificación domina la latencia total.
- Asistentes de código en IDE o revisión de pull requests: en código la mediana pasa de 46,27 a 57,62 tok/s. Con HumanEval en 38/40 sobre la suite Quality-200, el objetivo mantiene calidad de generación de código mientras el borrador reduce el tiempo hasta la respuesta completa.
- Razonamiento matemático por lotes: en matemáticas el rendimiento sube de 51,21 a 62,18 tok/s (C1). Adecuado para pipelines offline de resolución de problemas con GSM8K como referencia de calidad (67/80).
- Despliegue en hardware de borde con memoria unificada: al ocupar 1,55 GB en NVFP4, el borrador apenas añade presión de memoria sobre el objetivo en una DGX Spark (GB10), lo que permite mantener activada la ventana de 262K tokens sin sacrificar el presupuesto de memoria.
- Atención al cliente automatizada multi-turno: con el objetivo sirviendo contexto largo y el borrador reduciendo el coste por token, los diálogos extensos con historial largo resultan viables en una sola máquina sin clúster.
- Generación de documentación y contenido en prosa: aunque la ganancia es la más modesta (19,45 a 21,64 tok/s, +10,8 %), sigue siendo positiva y consistente en las 10 celdas evaluadas (5 dominios × C1/C4).
- Cumplimiento estricto de instrucciones: IFEval pasa de 19,87 a 21,80 tok/s (+9,4 %), útil en pipelines de extracción estructurada o formateo de datos donde cada respuesta requiere muchas restricciones de formato.
- Inferencia concurrente en producción: con 4 flujos simultáneos el agregado sube de 98,31 a 108,90 tok/s (+10,8 %), lo que mejora la relación coste/rendimiento por GPU en servicios multiusuario.

## Benchmarks y rendimiento

Rendimiento agregado en una DGX Spark (GB10, SM121), objetivo Kearuga con contexto de 262K activado y reloj SM fijado a 2400 MHz. La métrica "net decode tok/s" es `(completion_tokens − 1) / (t_last_token − t_first_token)` por petición, excluyendo TTFT.

| Configuracion | C1 (1 flujo) | C4 (4 flujos) | Dominios mejores |
|---|---|---|---|
| Borrador BF16 stock, K = 10 (baseline) | 30,85 tok/s | 98,31 tok/s | — |
| Este borrador, K = 12, SGLang sin overlay | 33,30 tok/s (+7,9 %) | 102,57 tok/s (+4,3 %) | 10 / 10 |
| Este borrador, K = 12, con mapa de cabeza de 64K | 35,33 tok/s (+14,5 %) | 108,90 tok/s (+10,8 %) | 10 / 10 |

Desglose por dominio (mediana, C1, 20 peticiones, este borrador con mapa de 64K frente a baseline BF16 K = 10):

| Dominio | Baseline (tok/s) | Este borrador (tok/s) | Delta emparejado | IC 95 % del delta |
|---|---|---|---|---|
| Codigo | 46,27 | 57,62 | +23,1 % | [+9,52, +12,02] |
| Matematicas | 51,21 | 62,18 | +24,2 % | [+8,22, +13,21] |
| Tool calls | 80,82 | 114,63 | +26,2 % | [+15,89, +31,97] |
| Prosa | 19,45 | 21,64 | +10,8 % | [+1,49, +2,91] |
| Instruction-following (IFEval) | 19,87 | 21,80 | +9,4 % | [+0,85, +2,39] |

En el caso C4 (4 flujos concurrentes) se publican datos parciales: código 38,84 a 45,65 tok/s (+16,1 %, IC [+5,23, +6,70]), matemáticas 41,17 a 47,33 tok/s (+13,0 %, IC [+4,41, +7,82]) y tool calls 49,02 a 69,25 tok/s (+31,...); el resto de filas C4 quedan truncadas en la información disponible.

Puerta de calidad Quality-200 (este borrador): 155/180 en total, con GSM8K 67/80, HumanEval 38/40, IFEval 34/40 y agentic coding 16/20. El objetivo en solitario obtiene 157/180; los cinco borradores candidatos evaluados quedaron en el rango 154-159, dentro de la banda pre-registrada de 154-160.

Fidelidad Fidelity-40 frente a la base BF16: KL media 0,0165, JS 0,0034, coincidencia top-1 40/40, idéntica al objetivo servido en solitario.

Metodología de la comparativa: 50 prompts (10 prompts × 5 dominios) × 2 ejecuciones, temperature 0, thinking desactivado, `max_tokens` calibrado por dominio (código 700, matemáticas 600, etc.), deltas emparejados por prompt con intervalos de confianza bootstrap al 95 %.

## Requisitos de hardware

- Peso del borrador: 1,55 GB en NVFP4 frente a 3,85 GB en BF16 (2,5× menos).
- El borrador se suma al espacio del modelo objetivo. El objetivo Kearuga opera con su contexto completo de 262K en una DGX Spark; el espacio de VRAM del objetivo en solitario no se detalla en la información disponible.
- GPU verificada: NVIDIA DGX Spark (GB10 / Grace-Blackwell, SM121) con memoria unificada de 273 GB/s. Las cifras publicadas corresponden a esa máquina y el autor advierte explícitamente que no son comparables a configuraciones RTX 5090 o B200.
- El formato NVFP4 con layout ModelOpt requiere generación Blackwell; no se documenta compatibilidad con GPUs de generaciones anteriores.
- ¿Cabe en GPU de consumo? No disponible. No hay datos publicados para RTX 4090 ni para otras GPU de consumo, y el borrador BF16 de referencia no es el artefacto optimizado.
- Despliegue documentado: SGLang (con K = 12 y, opcionalmente, el mapa de cabeza de 64K como overlay). vLLM, TGI, llama.cpp y Ollama: sin datos en la información disponible; llama.cpp no soporta el formato NVFP4/ModelOpt hasta donde se documenta aquí.
- Latencia y throughput medidos: 35,33 tok/s en un flujo y 108,90 tok/s agregados en cuatro flujos concurrentes. TTFT no se reporta (excluido de la métrica).
- El autor indica que el ciclo de decodificación en GB10 está limitado por ancho de banda de memoria y no por cómputo: repetir la medición sin el bloqueo de reloj a 2400 MHz dio resultados idénticos (la GB10 ejecuta nativamente a 2,40-2,48 GHz).

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Huella | Licencia | Rendimiento (C1 / C4) |
|---|---|---|---|---|---|
| 0xWhiteMage/Qwen3.8-27B-Kearuga-DFlash2 (este) | Borrador para Kearuga 27B | 1,12 B | 1,55 GB NVFP4 | Apache 2.0 | 35,33 / 108,90 tok/s (K = 12 + mapa 64K) |
| z-lab/Qwen3.8-27B-DFlash2 (BF16 stock) | Borrador generico para la misma familia | No disponible | 3,85 GB BF16 | No disponible en la informacion proporcionada | 30,85 / 98,31 tok/s (K = 10) |
| 0xWhiteMage/Qwen3.8-27B-Kearuga | Modelo objetivo (no es un borrador) | 27B (segun denominacion) | No disponible | Apache 2.0 | 157/180 en Quality-200 |

No se dispone de datos de otros borradores de decodificación especulativa comparables (por ejemplo, borradores EAGLE o Medusa de tamaño similar) en la información proporcionada, por lo que la comparativa se limita a las tres variantes anteriores.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el objetivo `Qwen3.8-27B-Kearuga` emparejado, el borrador no produce respuestas utilizables. Está destilado específicamente sobre las salidas de ese objetivo y no es portable a otros modelos.
- Los pesos están cuantizados a NVFP4 con escalas de activación calibradas sobre características de Kearuga; cambiar el objetivo o el prompt distribution invalida esa calibración y puede degradar la tasa de aceptación.
- Requiere decodificación especulativa configurada correctamente (SGLang con K = 12 y, opcionalmente, el mapa de cabeza de 64K); sin esa configuración no se obtienen las ganancias reportadas.
- Los incrementos de rendimiento son moderados (+14,5 % en C1, +10,8 % en C4) y en prosa e instruction-following rondan el 10 %, por lo que en cargas dominadas por esos dominios el beneficio es limitado.
- Los datos absolutos están medidos en una única máquina (DGX Spark GB10) con reloj fijado y contexto de 262K activado; extrapolarlos a otras GPU no es válido según el propio autor.
- La model card está truncada: faltan filas de la tabla C4 y no se detallan tokens de entrenamiento, composición del dataset, sesgos ni evaluación multilingüe.
- Idiomas: soporte declarado de en y zh (los tags mencionan ar sin evaluación asociada). No hay datos de rendimiento en castellano ni en otras lenguas.
- Riesgo de alucinación: el borrador no lo introduce por diseño, ya que el objetivo verifica cada token con su `lm_head` en BF16; el riesgo de alucinación es el del modelo objetivo, no el del borrador.
- Licencia Apache 2.0, permisiva para uso comercial, pero se recomienda verificar la licencia y los términos del modelo objetivo y del borrador base antes de un despliegue en producción.
- Adopción muy baja en el momento de la consulta: 390 descargas y 0 likes, sin validación independiente de las cifras publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xWhiteMage/Qwen3.8-27B-Kearuga-DFlash2
- Historial de commits del modelo: https://huggingface.co/0xWhiteMage/Qwen3.8-27B-Kearuga-DFlash2/commits/main
- Modelo objetivo: https://huggingface.co/0xWhiteMage/Qwen3.8-27B-Kearuga
- Borrador base: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Repositorio de serving (SGLang, DGX Spark, DFlash 2): https://github.com/0xWhiteMage/Qwen3.8-27B-Kearuga-SGLang-DGX-Spark-DFlash2
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Perfil del autor en X: https://x.com/0xWhiteMage
- Referencias arXiv citadas en los tags: https://arxiv.org/abs/2502.14856, https://arxiv.org/abs/2607.01893, https://arxiv.org/abs/2605.18810, https://arxiv.org/abs/2605.29343
- No se han encontrado resultados de busqueda web relevantes sobre este modelo en la informacion proporcionada.

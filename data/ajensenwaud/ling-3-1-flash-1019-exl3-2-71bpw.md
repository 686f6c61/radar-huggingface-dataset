# ajensenwaud/Ling-3.1-flash-1019-exl3-2.71bpw

## Resumen

Ling-3.1-flash-1019-exl3-2.71bpw es una cuantizacion EXL3 del modelo inclusionAI/Ling-3.1-flash-1019, un transformer MoE de 560.000 millones de parametros totales con unos 25.000 millones activos por token. La publica el usuario ajensenwaud con licencia MIT, y su proposito no es otro que comprimir el modelo original en FP8 hasta 2,71 bits por peso de media (197 GB en 29 shards) para que quepa y funcione en dos estaciones NVIDIA DGX Spark con GB10 mediante tensor parallelism, conservando la ventana de contexto completa de 1.048.576 tokens.

El pack se genero con exllamav3 v1.6.6 a partir del release FP8 de inclusionAI (commit dddfee4b), usando un codebook mul1 y 250 filas de calibracion de 2.048 tokens. La cuantizacion es mixta: los expertos enrutados bajan a 3 bits en las primeras y ultimas 17 capas MoE y a 2 bits en las 34 centrales, mientras que las proyecciones down se mantienen a 3 bits, la atencion KDA a 4, la atencion MLA, los expertos compartidos y la cabeza a 6, y las capas densas 0-3 a 4 bits.

Su relevancia es doble: por un lado demuestra que un MoE de 560B puede servirse en hardware de escritorio de gama alta (dos GB10) con contexto de un millon de tokens; por otro, documenta con transparencia el coste de esa compresion, con una divergencia KL de 0,150 frente al FP8 original y un incremento de perplejidad del 6,6% en WikiText-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (BailingMoeV3ForCausalLM) con atencion hibrida KDA + MLA y capa MTP |
| Parametros totales | 560.000 millones (560B) |
| Parametros activos | Aproximadamente 25.000 millones (25B) por token |
| Longitud de contexto | 1.048.576 tokens (262.144 nativos, ampliables con YaRN) |
| Tipos de cuantizacion | EXL3 a 2,71 bits por peso de media (mixta: 2, 3, 4 y 6 bits segun tensor) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | EXL3 (exllamav3 v1.6.6), 197 GB en 29 shards |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mezcla de expertos (MoE) con atencion hibrida: combina capas de atencion KDA (Kimi Delta Attention) con capas de atencion MLA (Multi-head Latent Attention), e incorpora una capa MTP (Multi-Token Prediction). La clase de implementacion es `BailingMoeV3ForCausalLM`. Los detalles sobre el numero de tokens de entrenamiento, la composicion del dataset y las fases de alineamiento (RLHF, DPO) del modelo original no estan disponibles en la informacion proporcionada.

La innovacion tecnica de este artefacto concreto es la cuantizacion selectiva por tipo de tensor: los expertos enrutados, que concentran la mayor parte del peso, se comprimen agresivamente (2-3 bits), mientras que los componentes mas sensibles a la precision (atencion MLA, expertos compartidos, cabeza de salida) se mantienen a 6 bits. La atencion KDA se requantizo de 5 a 4 bits conservando el resto de tensores byte a byte. El pack se evaluo exclusivamente con el motor LingSpark (motor Zig de TensorFold mas el port de la familia Ling), no con exllamav3 directamente.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con un presupuesto de tokens configurable (la evaluacion del autor uso 32K tokens por respuesta).
- Razonamiento matematico: 97,6% en GSM8K sobre 500 preguntas.
- Conocimiento general y razonamiento experto: 76,5% en MMLU-Pro sobre 200 preguntas.
- Generacion de codigo, evaluada en el perfil de velocidad "code" del motor LingSpark.
- Flujos de agente con multiples pasos: perfil "agent" con decodificacion a 34,0 tok/s en greedy.
- Procesamiento de contextos muy largos: hasta 1.048.576 tokens, con lecturas de prompt de 128K tokens en 289 s hasta el primer token.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios completos: con 1M de tokens de contexto, el modelo puede ingerir un arbol de codigo extenso y responder preguntas transversales entre modulos; la lectura inicial de un prompt de 128K tarda unos 5 minutos, pero los turnos de seguimiento reutilizan la cache y arrancan en 7-8 s incluso a 900K tokens.
- Asistentes de documentacion tecnica: el perfil "report" decodifica a 31,2 tok/s en greedy, adecuado para generar informes largos a partir de corpus internos volcados en el contexto.
- Agentes autonomos de investigacion: el perfil "agent" alcanza 34,0 tok/s y el motor activa por defecto la proteccion contra bucles de TensorFold, pensada para razonamientos largos que tienden a repetirse.
- Evaluacion de calidad de modelos en laboratorio: el pack incluye mediciones de divergencia KL y perplejidad frente al FP8 original, lo que permite reproducir analisis de degradacion por cuantizacion con WikiText-2.
- Despliegue en hardware de gama alta de escritorio: dos DGX Spark con GB10 bastan para servir el modelo con TP=2, una alternativa a clusters de GPU de datacenter para prototipado y demos internas.
- Procesamiento por lotes de documentos largos: con una ventana de 256K (`CONTEXT=262144`) la decodificacion mejora un 13% (34,3-39,1 tok/s en una conversacion y 37-43 tok/s combinados en dos), lo que favorece cargas de resumen y extraccion sobre contratos o expedientes extensos.
- Razonamiento matematico y verificacion: con un 97,6% en GSM8K, es utilizable en pipelines de comprobacion de calculos y generacion de problemas resueltos.

## Benchmarks y rendimiento

Calidad frente al pack de 3,03 bpw de Bertholomus AI, mismo motor y mismos items (ventana de 64K, thinking activado, muestreo de inclusionAI, presupuesto de 32K tokens por respuesta):

| Metrica | Este pack (2,71 bpw) | Bertholomus (3,03 bpw) |
|---|---|---|
| MMLU-Pro, 200 preguntas | 153 (76,5%) | 152 (76,0%) |
| GSM8K, 500 preguntas | 488 (97,6%) | 485 (97,0%) |
| Divergencia KL frente al FP8 original (WikiText-2, 100 x 2.048) | 0,150 | 0,092 |
| Mismo token top que el FP8 original | 89,8% | 92,2% |
| Perplejidad frente al FP8 original | +6,6% | +1,6% |

Velocidad con dos DGX Spark, ventana de 1M por defecto, una conversacion, respuestas de 512 tokens, thinking desactivado:

| Metrica | Valor |
|---|---|
| Decodificacion greedy (chat / code / agent / report) | 31,5 / 31,5 / 34,0 / 31,2 tok/s |
| Decodificacion con muestreo de inclusionAI (temp. 1,0, top_p 0,95, top_k 20) | 31,3 / 32,3 / 32,7 / 30,7 tok/s |
| Lectura de prompt a 4K / 16K / 64K / 128K tokens | 583 / 567 / 507 / 443 tok/s |
| Primer token tras prompt de 4K / 16K / 64K / 128K | 6,9 / 28,1 / 126 / 289 s |
| Decodificacion tras prompt de 4K / 16K / 64K / 128K | 26,7 / 27,7 / 25,6 / 23,6 tok/s |

## Requisitos de hardware

- VRAM/almacenamiento: el pack ocupa 197 GB en 29 shards; a TP=2 se reparte aproximadamente la mitad en cada DGX Spark.
- GPU recomendadas: dos NVIDIA DGX Spark con GB10, el unico hardware sobre el que el autor ha validado el despliegue.
- GPU de consumo: no cabe en una GPU consumer convencional; requiere el conjunto de dos GB10 o equivalente en memoria agregada.
- Opciones de despliegue: LingSpark (motor Zig de TensorFold mas el port de la familia Ling), con los scripts `scripts/prepare.sh`, `scripts/fetch_pack.sh` y `./start.sh`. El pack es una conversion estandar de exllamav3 v1.6.6, pero no se ha evaluado con el motor exllamav3 en si.
- Latencia y throughput: 31-34 tok/s en decodificacion con ventana de 1M y 34-39 tok/s con ventana de 256K; primer token de 6,9 s (4K) a 289 s (128K); lectura de un prompt nuevo de 900K en unos 85 minutos, con turnos posteriores en 7-8 s gracias a la cache.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.1-flash-1019-exl3-2.71bpw (este pack) | 560B totales, ~25B activos | 1.048.576 | EXL3 2,71 bpw, 197 GB | MIT | HuggingFace, validado en 2x DGX Spark |
| Ling-3.1-flash-1019 (FP8, inclusionAI) | 560B totales, ~25B activos | 262.144 nativos (1M con YaRN) | FP8 | MIT | HuggingFace |
| Pack EXL3 3,03 bpw de Bertholomus AI | 560B totales, ~25B activos | No disponible | EXL3 3,03 bpw | No disponible | Referenciado como punto de comparacion |

Frente al FP8 original, este pack reduce el peso a 197 GB a cambio de un 6,6% mas de perplejidad y una divergencia KL de 0,150; frente al pack de 3,03 bpw, ofrece cifras de calidad practicamente identicas en MMLU-Pro y GSM8K con menor huella de memoria, aunque peor fidelidad token a token.

## Limitaciones y advertencias

- La divergencia KL de 0,150 y el 89,8% de coincidencia en el token top indican una degradacion medible frente al FP8 original; no es un modelo para tareas que exijan maxima fidelidad al original.
- Las pruebas de MMLU-Pro (200 preguntas) solo detectan diferencias de unos 5 puntos, por lo que la equivalencia con el pack de 3,03 bpw no esta demostrada con potencia estadistica suficiente.
- Ling tiende a entrar en bucles de razonamiento hasta agotar el limite de tokens; el motor activa por defecto la proteccion de TensorFold y los agentes deberian fijar un `max_tokens` bajo.
- La lectura de prompts largos es lenta: unos 2 minutos a 64K tokens, 5 minutos a 128K y 85 minutos a 900K.
- El pack solo se ha evaluado con LingSpark, no con exllamav3, pese a ser una conversion estandar de ese formato.
- Idiomas soportados, sesgos conocidos y capacidades de tool calling no estan documentados en la informacion disponible.
- La licencia es MIT, igual que la del modelo fuente; el texto de inclusionAI esta en el fichero `LICENSE` del repositorio.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/ajensenwaud/Ling-3.1-flash-1019-exl3-2.71bpw
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.1-flash-1019
- Proyecto LingSpark: https://github.com/ajensenwaud/lingspark-2dgx
- Creditos de LingSpark: https://github.com/ajensenwaud/lingspark-2dgx/blob/main/CREDITS.md

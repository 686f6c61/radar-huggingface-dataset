# Ninnix96/Qwengram-4B

## Resumen

Qwengram-4B es un modelo de generacion de texto publicado por Ninnix96 que combina un backbone Qwen3.5-4B congelado (4.352.567.814 parametros en total) con un modulo de memoria externa denominado Qwengram. El backbone y las representaciones de memoria (PLE, *per-layer embeddings*) procedentes de Qwen3.8-Flash-Next permanecen congelados; durante el entrenamiento solo se ajusta un lector de rango R=1 insertado en las capas IDX3 e IDX11 del decodificador (capas humanas 4 y 12, es decir, el 12,5% y el 37,5% de las 32 capas), junto con dos mecanismos de arbitraje: un multiplicador global temprano aprendido y un arbitraje lineal tardio dependiente del token.

El problema que aborda es la transferencia de memoria externa a un modelo pequeno sin reentrenar el backbone. El endpoint canonico (REAL-15M + linear750, con 15.000.064 tokens de lector y 749.568 tokens de calibracion) reduce la perplejidad de validacion completa un 2,784%, de 11,298811 a 10,984210, y mejora la NLL en los cinco dominios evaluados (general, codigo, matematicas, cientifico y multilingue), ademas de LAMBADA-1000 y HellaSwag-1000. El autor indica que las mejoras de NLL en los cinco dominios tienen intervalos pareados al 95% por debajo de cero, mientras que las ganancias de exactitud en LAMBADA y HellaSwag son estimaciones puntuales con intervalos que cruzan el cero.

Su relevancia actual es doble: por un lado, demuestra un mecanismo de memoria externa aplicado en inferencia mediante un sidecar PLE de aproximadamente 32 GB mapeado en el host y descomprimido por token; por otro, es un artefacto de investigacion que exige un fork especifico de llama.cpp, ya que el runtime upstream no ejecuta este lector. La licencia declarada es Apache 2.0, pero el artefacto depende de un fichero externo de terceros y no se ha validado vision ni el soporte MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (backbone Qwen3.5-4B congelado) con lector externo Qwengram R=1 en las capas IDX3/IDX11 y memoria PLE externa |
| Parametros totales | 4.352.567.814 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: BF16, Q8_0, Q6_K y Q4_K_M; el sidecar PLE externo se distribuye en Q4_1 |
| Idiomas soportados | no disponible (solo se publica una metrica agregada de NLL multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (backbone mas 11 tensores de lector/arbitro que permanecen en FP32); tambien se distribuyen `reader.safetensors` y `arbiter.pt` |
| Modelo base | Qwen/Qwen3.5-4B |
| Memoria externa requerida | PLE de Qwen3.8-Flash-Next, conversion Q4_1 de Ivan Fioravanti, ~32 GB, SHA256 `66db3ab390f4dd5063ecc89cc180f4713898577682347001bf64ab8e328527a1` |
| Tamano del repositorio | 20,2 GB |
| Runtime compatible | Fork llama.cpp-qwengram, commit `3616a858f2326e87ad8b48e1341a4e341b3dad73`; llama.cpp upstream no lo soporta |
| Fecha de publicacion | 2026-09-27 (creacion), 2026-09-27 (ultima actualizacion) |

## Arquitectura y entrenamiento

La arquitectura parte de un decodificador transformer estandar (Qwen3.5-4B) que se mantiene congelado en su totalidad. Sobre el se inserta un lector de rango R=1 en dos puntos del decodificador (IDX3 e IDX11). Los pesos del lector se combinan con la memoria externa mediante dos vias de arbitraje: un multiplicador temprano global, que es un escalar aprendido y acotado al intervalo [0,75, 1,75], y un multiplicador tardio calculado por token como `0,5 * sigmoid(w @ RMSNorm(h_late) + b)`, lo que permite ponderar de forma dependiente del token la informacion recuperada. La memoria la aporta el PLE de Qwen3.8-Flash-Next, que se mantiene congelado y se consume desde un fichero externo; el fork de llama.cpp conserva el hashing, el orden de filas y la aritmetica del lector.

En cuanto al entrenamiento, el autor reporta el uso de una unica GPU T4 con *activation checkpointing* en el decodificador y un pico de memoria medido de 10,029 GiB. El entrenamiento se limita al lector y a los arbitros: el endpoint canonico emplea 15.000.064 tokens de lector y 749.568 tokens de calibracion, y el estudio comparativo de escala (10M frente a 15M) calibro ambos lectores de forma independiente. No se documenta en la informacion disponible el uso de RLHF, DPO ni fases de alineacion adicionales sobre el backbone. El fork de llama.cpp incluye un documento sobre decodificacion especulativa, pero no se aportan datos de rendimiento asociados a esa ruta para este modelo.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` y la etiqueta `conversational` figura entre las del modelo.
- Mejora de modelado de lenguaje: la NLL mejora en validacion completa y en los dominios general, codigo, matematicas, cientifico y multilingue respecto al backbone congelado sin lector.
- Razonamiento de sentido comun y comprension de secuencias: se reportan mejoras puntuales en LAMBADA-1000 y HellaSwag-1000.
- Capacidad multilingue: se evalua con una metrica de NLL multilingue, pero no se publica la lista de idiomas soportados.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Vision: no validada (el propio autor lo indica de forma explicita).
- Modo *thinking* explicito: no documentado.
- Entradas solo de embeddings y MTP: no soportados por el fork.

## Casos de uso

- Investigacion en transferencia de memoria externa: el modelo permite replicar el estudio de colocacion del lector en las capas IDX3/IDX11 y medir el efecto del arbitraje temprano y tardio sobre la perplejidad, usando los artefactos de evaluacion publicados como referencia.
- Experimentacion con calibracion de lectores: el endpoint canonico (REAL-15M + linear750) y los controles apareados de 500K (REAL > PERMUTED > RANDOM > DISABLED) permiten analizar como la calibracion afecta a metricas agregadas frente a tareas concretas como LAMBADA.
- Estudio de degradacion por cuantizacion: los ficheros BF16, Q8_0, Q6_K y Q4_K_M junto con la tabla de retencion de ganancia permiten medir cuanto del efecto del lector sobrevive al cuantizar el backbone.
- Generacion de texto en CPU: con el fork de llama.cpp y el sidecar PLE mapeado en el host, se puede ejecutar inferencia sin asignar 32 GB de VRAM, usando el ejemplo `llama-completion` con `-ngl 0`.
- Despliegue en hardware integrado AMD: el autor verifico continuaciones cortas con offload Vulkan completo (`-ngl 99`) en una AMD BC-250 para BF16, Q8_0 y Q4_K_M, lo que abre la puerta a pruebas en equipos de gama baja.
- Base para estudiar arbitraje por token: la formula `0,5 * sigmoid(w @ RMSNorm(h_late) + b)` es un punto de partida concreto para investigar mecanismos de ponderacion dependientes del token en modelos con memoria externa.
- Evaluacion comparativa de cuantizaciones en un mismo equipo: la tabla de retencion de ganancia sobre 8.128 tokens de WikiText-2 permite comparar configuraciones de precision con intervalos pareados ya publicados.

## Benchmarks y rendimiento

Evaluacion congelada canonica (REAL-15M + linear750, PLE original en FP8, suite congelada de Kaggle). Los valores se presentan tal y como los publica el autor:

| Metrica | Frozen stock | Canonical Qwengram-4B |
|---|---:|---:|
| NLL de validacion completa | 2,424697 | 2,396459 |
| Perplejidad de validacion completa | 11,298811 | 10,984210 |
| NLL general | 2,530256 | 2,498815 |
| NLL de codigo | 1,221217 | 1,204523 |
| NLL de matematicas | 1,212598 | 1,196319 |
| NLL cientifica | 1,894821 | 1,891064 |
| NLL multilingue | 2,975046 | 2,950582 |
| Media de NLL en cinco dominios | 1,966787 | 1,948261 |
| NLL en LAMBADA-1000 | 1,350000 | 1,336395 |
| Exactitud en LAMBADA-1000 | 65,9% | 66,6% |
| Exactitud en HellaSwag-1000 | 54,8% | 55,1% |

Retencion de la ganancia del lector en runtime GGUF (CPU, 8.128 tokens de los primeros 64 fragmentos consecutivos de 256 tokens de WikiText-2 raw, puntuando los ultimos 127 tokens; 8 hilos; contexto, batch y microbatch 256; sin warmup; sidecar PLE Q4_1):

| Precision | Stock NLL | Qwengram NLL | Ganancia del lector [IC 95%] | Retencion de ganancia [IC 95%] | Reduccion de perplejidad |
|---|---:|---:|---|---:|---:|
| BF16 | 2,225750 | 2,198449 | 0,027301 [0,022650; 0,031917] | 100% | 2,69% |
| Q8_0 | 2,226990 | 2,199469 | 0,027521 [0,022892; 0,032133] | 100,8% [97,1%; 104,7%] | 2,71% |
| Q6_K | 2,230865 | 2,200943 | 0,02992 (dato truncado en la model card) | no disponible | no disponible |
| Q4_K_M | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: las cifras de "stock" difieren entre ambas tablas porque proceden de conjuntos de evaluacion distintos (suite de Kaggle frente a WikiText-2 raw). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor no publica cifras de VRAM. Como estimacion derivada del recuento de parametros (4,35 mil millones), el fichero BF16 rondaria los 8,7 GB, Q8_0 unos 4,6 GB, Q6_K unos 3,6 GB y Q4_K_M unos 2,6 GB. A ello se suman 11 tensores de lector/arbitro que permanecen en FP32 en todas las precisiones.
- Sidecar PLE: el fichero externo de aproximadamente 32 GB se mapea en el host y se descomprime por filas y por token; el autor indica explicitamente que no requiere una asignacion de 32 GB en la GPU. Si se ejecuta en CPU, ese mapeo consume espacio de disco y presumiblemente memoria del sistema, pero no se detalla la RAM necesaria.
- GPU recomendadas: no disponible. La unica GPU documentada es una AMD BC-250 con backend Vulkan, donde BF16, Q8_0 y Q4_K_M con offload completo (`-ngl 99`) coincidieron con la continuacion greedy de ocho tokens en CPU. Q6_K no coincidio con offload completo y requirio `-ngl 33` (primera capa del decodificador en CPU) o ejecucion integra en CPU. El autor advierte que estas comprobaciones cortas no establecen paridad general en GPU.
- GPU para entrenamiento: una unica T4 con *activation checkpointing* en el decodificador, con un pico medido de 10,029 GiB.
- Idoneidad en GPU de consumo: no verificada de forma amplia. Las cuantizaciones Q4_K_M y Q6_K son las unicas con tamano compatible con GPU de consumo de 8-12 GB, pero el autor solo aporta comprobaciones cortas en una BC-250.
- Opciones de despliegue: fork llama.cpp-qwengram (objetivo `llama-completion`), en CPU (`-ngl 0`) o con backend Vulkan (`-DGGML_VULKAN=ON`). No hay soporte documentado en vLLM, TGI, Ollama ni llama.cpp upstream.
- Latencia y throughput: no disponibles. Se conoce el protocolo de medida (8.128 tokens, 8 hilos, contexto/batch/microbatch 256, sin warmup), pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwengram-4B | 4.352.567.814 | no disponible | Perplejidad de validacion 10,984210; LAMBADA-1000 66,6%; HellaSwag-1000 55,1% | Apache 2.0 | GGUF en HuggingFace; requiere fork de llama.cpp y sidecar PLE de ~32 GB |
| Qwen3.5-4B (stock, backbone congelado) | aproximadamente 4B | no disponible | Perplejidad de validacion 11,298811; LAMBADA-1000 65,9%; HellaSwag-1000 54,8% | no disponible en la informacion proporcionada | HuggingFace |
| Lectores Qwengram de 0,8B y 2B (mismo autor, mismo fork) | no disponible | no disponible | no disponible | no disponible | Soportados por el fork en IDX2/IDX8; el autor menciona una tabla historica entre escalas, pero sin cifras en la informacion disponible |

No se dispone de datos de otros modelos de 4B comparables (por ejemplo, alternativas con memoria externa o arquitecturas hibridas) en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de un fork no oficial: llama.cpp upstream no ejecuta este lector. El despliegue exige compilar el fork `Ninnix/llama.cpp-qwengram` en el commit indicado, lo que complica mantenimiento, actualizaciones de seguridad y portabilidad.
- Dependencia de un fichero externo de terceros: el PLE de ~32 GB procede de una conversion de Ivan Fioravanti (`ivanfioravanti/Qwen3.8-Flash-Next-DS4-Q4`) y su licencia no se explicita en la informacion disponible. Debe verificarse antes de cualquier uso comercial.
- Evidencia estadistica parcial: las mejoras de exactitud en LAMBADA-1000 y HellaSwag-1000 son estimaciones puntuales con intervalos que cruzan el cero. El propio autor senala que las diferencias de exactitud no resueltas no establecen equivalencia.
- Alcance del entrenamiento muy limitado: la parte entrenada usa 15.000.064 tokens de lector y 749.568 de calibracion, sobre una unica T4. No hay evidencia de generalizacion fuera de la suite de evaluacion publicada.
- Capacidades no validadas: vision no validada, MTP y entradas solo de embeddings no soportados.
- Idiomas: no se publica la lista de idiomas soportados; la mejora multilingue medida es pequena (NLL de 2,975046 a 2,950582) y no implica calidad de generacion en esos idiomas.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con requisitos de contexto largo.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica de veracidad o alucinacion para este modelo.
- Sesgos: no se documenta ningun analisis de sesgos.
- Adopcion nula: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, sin validacion independiente de la comunidad.
- Anomalia de fechas: la model card indica fechas de creacion y actualizacion de 2026-09-27, incoherentes con el estado del ecosistema en el momento de redactar esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ninnix96/Qwengram-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Estudio de transferencia PLE (Qwen3.5-4B): https://github.com/Ninnix/qwen-ple-transfer/tree/main/qwen35-4b
- Fork de llama.cpp para Qwengram: https://github.com/Ninnix/llama.cpp-qwengram
- Documentacion de decodificacion especulativa del fork: https://github.com/Ninnix/llama.cpp-qwengram/blob/master/docs/speculative.md
- Sidecar PLE requerido (Qwen3.8-Flash-Next-PLE-Q4_1.gguf): https://huggingface.co/ivanfioravanti/Qwen3.8-Flash-Next-DS4-Q4/blob/main/Qwen3.8-Flash-Next-PLE-Q4_1.gguf
- Informe de decision del autor: `evaluation/decision.md` dentro del repositorio del modelo
- Artefactos de evaluacion: directorio `evaluation/` dentro del repositorio del modelo
- Hashes y tamanos de los ficheros publicados: `SHA256.json` dentro del repositorio del modelo

# letechlead/MiMo-V2.6-Distill-Qwen-9B-INT8-W8A16-AutoRound

## Resumen

MiMo-V2.6-Distill-Qwen-9B-INT8-W8A16-AutoRound es una cuantizacion de 8 bits del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario letechlead (LeTechLead). No es un modelo nuevo: es un artefacto de pesos cuantizados que conserva la arquitectura, el tokenizador y la plantilla de chat del original, con el objetivo de reducir el coste de memoria en inferencia sin degradar de forma apreciable el comportamiento respecto al BF16 de origen.

El modelo base es un transformer hibrido de aproximadamente 9.000 millones de parametros y 32 capas que combina GatedDeltaNet (atencion lineal de estado constante) en 24 capas con atencion completa en las 8 restantes, con una ventana nativa de 262.144 tokens y sin rope scaling. El pipeline declarado es image-text-to-text, de modo que incluye una torre de vision que en esta cuantizacion se mantiene integra en BF16.

Su interes practico esta en que el autor publica mediciones verificables de coherencia (perplejidad, divergencia KL, acuerdo top-1) y de throughput sobre 2x RTX 3090, algo poco frecuente en cuantizaciones comunitarias. Con 12,89 GB repartidos en 8 shards y carga mediante kernels GPTQ-Marlin int8, se presenta como la alternativa de alta fidelidad frente al sibling INT4 W4A16 del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 24 de 32 capas con GatedDeltaNet (atencion lineal) y 8 capas con atencion completa; torre de vision (pipeline image-text-to-text); tag de arquitectura `qwen3_5` |
| Parametros totales | ~9.000 millones (denominacion nominal del modelo; la cifra exacta no se detalla en la informacion disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens nativos, sin rope scaling |
| Tipos de cuantizacion | Este repositorio: W8A16 (pesos de 8 bits, activaciones de 16 bits, weight-only), grupo 128 simetrico, empaquetado `auto_round:auto_gptq`. Existe un sibling INT4 W4A16 del mismo autor |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors; layout GPTQ int32 con pack factor 4; 8 shards, 1.160 tensores, 12,89 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer hibrido con dos tipos de capa de atencion. 24 de las 32 capas emplean GatedDeltaNet, un mecanismo de atencion lineal con estado de tamano constante, mientras que las 8 restantes usan atencion completa y son las unicas que mantienen cache KV. Esa proporcion es la clave del comportamiento en contexto largo: la cache KV se limita a 8 capas, con 32 KiB por token en fp16 y 16 KiB por token con cache de 8 bits (fp8_e5m2). El nombre del modelo sugiere un proceso de destilacion sobre una base Qwen, pero la informacion disponible no detalla el corpus de destilacion, el numero de tokens ni si se aplicaron etapas de RLHF o DPO.

En cuanto al proceso de cuantizacion, se aplico AutoRound 0.14.2 sobre el calibrado `NeelNanda/pile-10k` con 128 muestras de 512 tokens y batch 1, cuantizando 200 capas lineales dentro de `model.language_model.layers`: el MLP (`gate_proj`, `up_proj`, `down_proj`), las proyecciones de atencion lineal (`in_proj_qkv`, `in_proj_z`, `out_proj`) y las proyecciones de atencion completa (`q_proj`, `k_proj`, `v_proj`, `o_proj`). Se mantienen deliberadamente en BF16 la torre de vision (333 tensores), las proyecciones de gating de GatedDeltaNet `in_proj_a` e `in_proj_b` (48 proyecciones, con salidas de 32 canales que no permiten el reempaquetado Marlin por no cumplir `size_n % 64 == 0`), y los embeddings, `lm_head`, normalizaciones y sesgos, declarados con `bits: 16` en `quantization_config.extra_config`.

## Capacidades

- Generacion de texto conversacional en formato chat con plantilla compatible con el modelo base.
- Razonamiento explicito: el modelo requiere `--reasoning-parser mimo` en SGLang, lo que indica una salida de razonamiento estructurada (modo thinking) que debe parsearse de forma especifica.
- Tool calling / function calling: el autor recomienda `--tool-call-parser mimo` para uso de herramientas.
- Vision: el pipeline declarado es image-text-to-text y la torre visual se conserva en BF16, por lo que las capacidades de imagen del modelo base se mantienen intactas.
- Contexto largo: ventana nativa de 262.144 tokens sin rope scaling, con un pool de cache medido de 933.890 tokens.
- Aritmetica basica y recuperacion de hechos: cubiertas por la sonda de comportamiento del autor (7 prompts con aritmetica, recall factual, conteo de letras, completado de secuencias y restricciones de instrucciones).
- Idiomas distintos del ingles: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos: con 262.144 tokens de ventana nativa y un pool medido de 933.890 tokens, permite introducir expedientes completos, contratos o documentacion tecnica sin fragmentacion agresiva, procesando la consulta en una sola pasada.
- Agentes con uso de herramientas: el soporte de `--tool-call-parser mimo` y la salida de razonamiento permiten construir bucles de razonamiento multi-paso con llamadas a APIs externas, usando SGLang como servidor compatible con endpoints.
- Asistente conversacional multi-turno: el estado de atencion lineal de tamano constante mantiene el coste por turno acotado incluso con historiales muy largos, con un limite practico de unas 59 peticiones concurrentes por el cache de estado de GDN.
- Analisis de capturas, diagramas o documentos escaneados: al conservar la torre de vision en BF16, la extraccion de informacion a partir de imagenes mantiene la fidelidad del modelo original, algo que no ocurre si se cuantiza la parte visual.
- Generacion de datos sinteticos y evaluacion de calidad: la divergencia KL de 0,004067 frente al BF16 y el acuerdo top-1 del 98,012 % hacen que este checkpoint sea adecuado como sustituto del modelo completo cuando se necesita reducir memoria sin introducir sesgo de muestreo apreciable.
- Despliegue en hardware de doble GPU de gama alta de consumo: la configuracion verificada con 2x RTX 3090 y tensor parallel 2, con ~22,2 GiB por tarjeta, permite servir el modelo completo con la ventana nativa en equipos sin GPUs de datacenter.
- Procesamiento batch de contexto largo no interactivo: con prefill fragmentado en bloques de 16.384 tokens y 1.746 tokens/s de prefill a 257.000 tokens de profundidad, es viable encolar prompts masivos priorizando throughput sobre latencia.
- Sustitucion del sibling INT4 en tareas sensibles a la fidelidad: cuando la perdida de calidad del INT4 resulta inaceptable (por ejemplo, en tareas con restricciones estrictas de formato o trampas de razonamiento), el INT8 ofrece 7/7 en la sonda de comportamiento frente a 5/7 del INT4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos aportados por el autor son mediciones de coherencia frente al modelo BF16 y de throughput.

Coherencia a nivel de checkpoint sobre 8.192 tokens de `wikitext-2-raw-v1` (test), 15 ventanas de 1.024 con stride 512, 15.345 posiciones puntuadas, logits en float32 e ids de token identicos:

| Metrica | BF16 | INT8 W8A16 | INT4 W4A16 (referencia) |
|---|---|---|---|
| Perplejidad | 12,1721 | 12,1258 (-0,381 %) | 12,337 (+1,36 %) |
| Acuerdo top-1 vs BF16 | — | 98,012 % (15.040 / 15.345) | 87,46 % (13.421 / 15.345) |
| KL media (BF16 frente a cuantizado) | — | 0,004067 | 0,0842 |

El acuerdo por ventana se situa entre el 97,3 % y el 98,8 %, y la KL por ventana entre 0,0012 y 0,0136. El autor senala que la perplejidad ligeramente inferior esta dentro del ruido.

Sonda de comportamiento sobre 7 prompts (aritmetica, recall factual, conteo de letras, completado de secuencias, dos restricciones de seguimiento de instrucciones y una pregunta abierta en prosa):

| Modelo | Puntuacion |
|---|---|
| BF16 de origen | 7/7 |
| INT8 W8A16 | 7/7 |
| INT4 W4A16 | 5/7 |

Throughput medido con `llama-benchy 0.3.5`, pp 4096 / tg 512, 3 ejecuciones por punto, en frio, concurrencia 1, tokenizador exacto, 2x RTX 3090 con TP=2 y contexto de 262.144 con cache KV de 8 bits:

| Profundidad | Prefill (tok/s) | Decode (tok/s) | Decode pico (tok/s) | TTFT | E2E estimado |
|---|---|---|---|---|---|
| 8.000 | 2.367,7 | 91,94 | 94,3 | 5,12 s | 10,69 s |
| 16.000 | 2.397,8 | 95,40 | 96,7 | 8,39 s | 13,75 s |
| 32.000 | 2.370,1 | 93,98 | 95,0 | 15,23 s | 20,68 s |
| 58.000 | 2.291,9 | 86,93 | 88,6 | 27,10 s | 32,99 s |
| 128.000 | 2.066,5 | 85,89 | 87,0 | 63,93 s | 69,89 s |
| 200.000 | 1.873,2 | 80,78 | 81,3 | 108,96 s | 115,29 s |
| 257.000 | 1.746,4 | 76,91 | 78,0 | 149,51 s | 156,17 s |

Comparacion de decode frente al sibling INT4 en la misma configuracion:

| Profundidad | INT4 (tok/s) | INT8 (tok/s) | Delta |
|---|---|---|---|
| 8K | 123,01 | 91,94 | -25,3 % |
| 16K | 122,27 | 95,40 | -22,0 % |
| 32K | 120,01 | 93,98 | -21,7 % |
| 58K | 115,41 | 86,93 | -24,7 % |
| 128K | 106,55 | 85,89 | -19,4 % |
| 200K | 99,13 | 80,78 | -18,5 % |
| 257K | 93,08 | 76,91 | -17,4 % |

Las 7 profundidades por 3 ejecuciones se completaron sin fallos; el punto de 257.000 corresponde a un prompt de 261.096 tokens.

## Requisitos de hardware

- Configuracion verificada: 2x RTX 3090 (SM86) con tensor parallel 2, `--mem-fraction-static 0.85` y cache KV en fp8_e5m2; pesos mas cache en aproximadamente 22,2 GiB por tarjeta.
- Peso del artefacto: 12,89 GB en 8 shards. Por tamano de pesos cabria en una GPU unica de 24 GB, pero esa configuracion no esta verificada en la informacion disponible.
- Memoria de cache KV: 32 KiB por token en fp16 y 16 KiB por token con cache de 8 bits, al mantener cache solo 8 de las 32 capas.
- Capacidad de cache medida: pool de 933.890 tokens (3,6 veces el maximo del modelo), con `max_req_input_len` de 262.138.
- Concurrencia: el cache de estado de GatedDeltaNet limita las peticiones concurrentes a unas 59; la ventana efectiva esta limitada por el estado de atencion lineal, no por el pool de KV.
- Prefill: fragmentado en bloques de 16.384 tokens para no bloquear el planificador.
- Opciones de despliegue: SGLang v0.5.20 (compilado desde fuente, commit `94602c9c2b7cbdb8efd5c52802dac6a1c180089e`) como via verificada; el artefacto se carga a traves de la ruta `auto_round` hacia los kernels GPTQ-Marlin int8 de SGLang y vLLM. No se documentan Ollama, llama.cpp ni TGI.
- Parametros de servido obligatorios: `--reasoning-parser mimo` para la salida de razonamiento y `--tool-call-parser mimo` para uso de herramientas.
- Latencia y throughput: ver la tabla de la seccion anterior (TTFT de 5,12 s a 8.000 tokens de profundidad y 149,51 s a 257.000; decode entre 76,91 y 95,40 tok/s).
- GPU de datacenter (A100, H100, H200): no disponible; no se documenta validacion en SM90 ni SM100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión de pesos | Calidad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (INT8 W8A16) | ~9B | 262.144 | 8 bits, grupo 128 | Perplejidad 12,1258; acuerdo top-1 98,012 %; KL 0,004067; sonda 7/7 | MIT | HuggingFace, 0 descargas |
| letechlead/...-INT4-W4A16-AutoRound | ~9B | 262.144 | 4 bits, grupo 128 | Perplejidad 12,337; acuerdo top-1 87,46 %; KL 0,0842; sonda 5/7 | MIT | HuggingFace |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (BF16) | ~9B | 262.144 | BF16 | Perplejidad 12,1721; sonda 7/7 | MIT (enlace a LICENSE) | HuggingFace |
| Otras cuantizaciones del mismo base | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Artefacto de comunidad: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por terceros. Toda la evidencia de calidad procede del propio autor.
- La cuantizacion no cubre el modelo completo: la torre de vision (333 tensores) y 48 proyecciones de gating de GatedDeltaNet permanecen en BF16, por lo que el ahorro de memoria es inferior al de un W8A16 integral y el consumo real no escala linealmente con 8 bits.
- Solo se documenta verificacion en SM86 (RTX 3090). No hay datos de funcionamiento en SM90, SM100 ni en pilas distintas de SGLang.
- El decode es entre un 17 % y un 25 % mas lento que el sibling INT4 W4A16 en la misma configuracion, y la brecha se mantiene en todo el rango de profundidades.
- El uso de la salida de razonamiento requiere `--reasoning-parser mimo`; sin ese parametro la respuesta puede no parsearse correctamente en produccion.
- El cache de estado de GatedDeltaNet limita la concurrencia a unas 59 peticiones, un techo relevante para despliegues con trafico alto.
- Degradacion de throughput con la profundidad: el prefill cae de 2.397,8 a 1.746,4 tok/s y el decode de 95,40 a 76,91 tok/s entre 16.000 y 257.000 tokens, con TTFT de 149,51 s en el extremo.
- No se han publicado resultados de benchmarks academicos estandar ni evaluacion de sesgos, toxicidad o alucinacion para este checkpoint.
- No se especifican los idiomas soportados; no se debe asumir cobertura multilingue sin verificacion.
- La licencia del artefacto es MIT, pero conviene revisar la licencia del modelo base enlazada por el autor antes de un uso comercial.
- Discrepancia de metadatos: la pagina de HuggingFace reporta 0,0 GB de tamano de repositorio, mientras que la model card declara 12,89 GB en 8 shards. Conviene verificar el contenido real de los archivos antes de desplegar.
- La informacion disponible no incluye detalles del entrenamiento ni del proceso de destilacion del modelo base, lo que impide auditar posibles sesgos heredados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/letechlead/MiMo-V2.6-Distill-Qwen-9B-INT8-W8A16-AutoRound
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Licencia del modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B/blob/main/LICENSE
- Sibling INT4 W4A16: https://huggingface.co/letechlead/MiMo-V2.6-Distill-Qwen-9B-INT4-W4A16-AutoRound
- Dataset de calibracion: https://huggingface.co/datasets/NeelNanda/pile-10k
- SGLang: https://github.com/sgl-project/sglang
- AutoRound: https://github.com/intel/auto-round
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo (unicamente documentacion no relacionada de cuentas de Microsoft).

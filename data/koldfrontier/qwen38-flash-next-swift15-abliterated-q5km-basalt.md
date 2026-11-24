# koldfrontier/qwen38-flash-next-swift15-abliterated-q5km-basalt

## Resumen

Este repositorio distribuye un pack de pesos cuantizados del modelo Qwen3.8-Flash-Next, un checkpoint de la familia Qwen4-Exp (arquitectura interna `qwen4exp`) publicado por Qwen. El pack lo construye el usuario koldfrontier aplicando dos LoRA publicadas por terceros sobre el checkpoint base (Swift-1.5 y una LoRA de abliteration) y cuantizando el resultado una sola vez en formato Q5_K_M con una receta no estandar. El resultado se empaqueta en dos formatos: un GGUF portable de 118.202.878.144 bytes y un contenedor `.basalt` de 122.228.152.221 bytes para el motor Basalt y su port para V100, Lapilli.

La relevancia tecnica del artefacto no esta en el modelo base sino en la receta de cuantizacion. El Q5_K_M de llama.cpp rechaza los K-quants en filas cuyo ancho no es multiplo de 256, lo que afecta a `ffn_down_exps` y `ffn_down_shexp` (640 columnas) y a `per_layer_token_embd` (160 columnas). El autor documenta una solucion explicita: forzar `q5_1` en las dos primeras y `iq4_nl` en la tercera, manteniendo el resto de decisiones Q5_K_M (gate/up en `q5_K`, atencion en `q6_K`). Ademas publica mediciones de perplejidad y divergencia KL contra una referencia F16 generada con los propios pesos del modelo.

El modelo no tiene descargas ni likes en el momento de la consulta, no incluye resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) y la propia model card advierte que la abliteration no se ha validado con baterias de seguridad estandar. Es, por tanto, un artefacto de interes para quien ya opera el motor Basalt/Lapilli sobre V100 y quiere una version cuantizada con metricas de degradacion documentadas, no un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4-Exp (`qwen4exp`), transformer con mezcla de expertos segun los nombres de tensor (`ffn_down_exps`, `ffn_down_shexp`, `ssm_out`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M con overrides: `q5_1` en `ffn_down_exps` y `ffn_down_shexp`, `iq4_nl` en `per_layer_token_embd`, `q5_K` en gate/up, `q6_K` en atencion |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (licencia base de Qwen); las LoRA mantienen sus propias licencias |
| Formato de pesos | GGUF (118.202.878.144 bytes) y `.basalt` (122.228.152.221 bytes) |

## Arquitectura y entrenamiento

El checkpoint base es Qwen/Qwen3.8-Flash-Next, de arquitectura `qwen4exp`. Los nombres de tensor del pack (`ffn_down_exps`, `ffn_down_shexp`, `ssm_out`, `per_layer_token_embd`) indican una red con capas de mezcla de expertos y componentes de tipo state-space, aunque la model card no detalla la topologia completa ni el numero de parametros. El pack no entrena nada: aplica dos LoRA sobre el checkpoint base con `llama-export-lora` y cuantiza el resultado una sola vez. La primera LoRA es nchapman/Qwen3.8-Flash-Next-Swift-1.5-LoRA; la segunda es nazeshinjite/Qwen3.8-Flash-Next-Abliterated-LoRA, una direccion de rechazo de rango 1 en F32 con alpha 1.0 sobre 192 tensores (`ffn_down_shexp` y `ssm_out`).

La innovacion tecnica documentada es la receta de cuantizacion. llama.cpp promueve automaticamente a `q8_0` las filas de 640 columnas, pero `per_layer_token_embd` (160 columnas) queda en un tipo que el motor Basalt rechaza, y ademas viaja en la seccion cruda del GGUF, por lo que `--compat-bf16` no lo corrige. El autor fija explicitamente `q5_1` para los down experts y `iq4_nl` para el embedding por capa, y convierte el GGUF a `.basalt` con `tools/convert/convert.py --sections-from BASE.basalt --compat-bf16`. La model card incluye una tabla comparativa de tres variantes de cuantizacion medida con `basalt-bench --quality 16` sobre wikitext-2 (16 chunks), usando como referencia KL los pesos F16 del propio modelo (354.029.929.664 bytes).

## Capacidades

- Generacion de texto: es la unica capacidad declarada en el pipeline (`text-generation`).
- Razonamiento y codigo: no hay evidencia publicada en la informacion disponible; el modelo base Qwen probablemente las soporta, pero este pack no las documenta.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el campo de idiomas del repositorio esta vacio.
- Modo thinking: no disponible en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada.
- Abliteration: se elimina parcialmente la direccion de rechazo mediante una LoRA de rango 1; la evidencia conductual se limita a cuatro pruebas puntuales sin rechazo, segun el autor.

## Casos de uso

- Despliegue en infraestructura V100 existente: el pack esta pensado para el motor Lapilli (port de Basalt para V100) y se valido sobre 2x V100-SXM2 de 32 GB; encaja en equipos con GPUs Volta que no pueden usar kernels modernos de FlashAttention.
- Evaluacion de recetas de cuantizacion: la model card publica perplejidad, KLD y tasa de mismo top-1 para tres variantes (q5_1, q8_0, iq4_nl) sobre el mismo harness, lo que permite reproducir y comparar decisiones de cuantizacion en modelos MoE con anchos de fila no multiplos de 256.
- Investigacion sobre abliteration: sirve como artefacto para estudiar como una direccion de rechazo de rango 1 aplicada sobre `ffn_down_shexp` y `ssm_out` afecta a la conducta del modelo, siempre que se complemente con baterias de seguridad propias.
- Generacion de texto offline en local: el GGUF de 118 GB carga en llama.cpp, LM Studio u Ollama en maquinas con suficiente VRAM o RAM, sin dependencia de APIs externas.
- Base para fine-tuning posterior: al estar en GGUF y `.basalt`, puede servir como punto de partida para experimentos de cuantizacion o de mezcla de LoRA, aunque requeriria de-cuantizar o partir del checkpoint original.
- Pruebas de compatibilidad de motores: util para verificar el comportamiento de Basalt/Lapilli frente a tensores con tipos no estandar (`per_layer_token_embd` en `iq4_nl`, down experts en `q5_1`).

## Benchmarks y rendimiento

La unica tabla publicada mide degradacion de cuantizacion, no capacidad. Referencia: pesos F16 del propio modelo, `basalt-bench --quality 16`, wikitext-2, 16 chunks.

| Pack | PPL | ln(PPL/base) | KLD mean | Mismo top-1 | Bytes |
|---|---|---|---|---|---|
| Este release (down experts q5_1) | 2,1877 | 0,03224 | 0,11384 | 91,52% | 122.228.152.221 |
| Mismo modelo, down experts q8_0 | 2,1984 | 0,03712 | 0,11562 | 91,35% | 128.532.190.671 |
| Mismo modelo, down experts iq4_nl | 2,2040 | 0,03966 | 0,12574 | 91,27% | 114.663.725.515 |
| Referencia F16 | 2,1183 | — | — | — | 354.029.929.664 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el pack pesa 118 GB en GGUF y 122 GB en `.basalt`; la inferencia requiere al menos esa cantidad entre VRAM y RAM si se hace offload parcial. No hay cifras de VRAM pico publicadas.
- GPU validadas: 2x V100-SXM2 de 32 GB (64 GB totales) con el fork Lapilli; el autor indica que no se ha validado en otro hardware.
- GPU consumer: no cabe en ninguna GPU consumer actual en su totalidad; haria falta offload a RAM del sistema o ejecucion en CPU, con latencias muy superiores.
- Opciones de despliegue: motor Basalt y su port Lapilli para V100; el GGUF es portable a llama.cpp, LM Studio y Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este pack (Qwen3.8-Flash-Next + Swift-1.5 + abliterated) | no disponible | no disponible | Q5_K_M con overrides | qwen-community-1.0 | GGUF y `.basalt` en HF |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | pesos originales (F16) | qwen-community-1.0 | checkpoint base en HF |
| nchapman/Qwen3.8-Flash-Next-Swift-1.5-LoRA | no disponible | no disponible | LoRA | propia de la LoRA | LoRA en HF |
| nazeshinjite/Qwen3.8-Flash-Next-Abliterated-LoRA | no disponible | no disponible | LoRA (F32, rango 1) | propia de la LoRA | LoRA en HF |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No hay benchmarks de capacidad publicados: no se puede afirmar nada sobre MMLU, HumanEval, GSM8K ni tareas similares.
- La abliteration no esta validada con baterias de seguridad: el autor solo reporta cuatro pruebas puntuales sin rechazo y no hay HarmBench ni XSTest detras de la afirmacion.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de un modelo base sin evaluacion publica, se heredan los sesgos del checkpoint original.
- Riesgo de alucinacion: no cuantificado; la degradacion medida es de cuantizacion (KLD 0,11384 frente a F16), no de fidelidad factual.
- Contexto e idiomas: la longitud de contexto y la lista de idiomas no estan disponibles en el repositorio.
- Licencia: la qwen-community-1.0 permite redistribuir derivados con atribucion; las dos LoRA mantienen sus propias licencias, que deben revisarse antes de uso comercial. El repositorio distribuye pesos cuantizados, no el checkpoint original.
- Validacion de hardware limitada a 2x V100-SXM2 de 32 GB con Lapilli; el comportamiento en otras GPUs o motores no esta verificado.
- El pack no es de 16 bits: el F16 de referencia (354 GB) no se publica, lo que dificulta reproducir exactamente las metricas de la model card sin regenerarlo.
- El repositorio tiene 0 descargas y 0 likes, sin senales de adopcion ni validacion por terceros.
- El campo `library_name: basalt` y el formato `.basalt` implican dependencia de un motor poco extendido; el GGUF es la opcion portable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/koldfrontier/qwen38-flash-next-swift15-abliterated-q5km-basalt
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- LoRA Swift-1.5: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-Swift-1.5-LoRA
- LoRA Abliterated: https://huggingface.co/nazeshinjite/Qwen3.8-Flash-Next-Abliterated-LoRA
- Motor Basalt: https://github.com/jesdga95/basalt
- Port Lapilli para V100: https://github.com/chris83-dev/lapilli-v100

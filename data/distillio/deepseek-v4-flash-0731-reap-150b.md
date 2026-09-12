# Distillio/DeepSeek-V4-Flash-0731-reap-150b

## Resumen

DeepSeek-V4-Flash-0731-reap-150b es una version comprimida del checkpoint DeepSeek-V4-Flash-0731, un modelo MoE de la familia DeepSeek V4. La compresion la ha realizado el usuario Distillio (el modelo card cita como herramienta `moe-compress`, del repositorio `puwaer/moe-expert-compress`) aplicando REAP (router-weighted expert activation pruning): se eliminan expertos enrutados de cada bloque MoE sin ningun paso de gradiente, sin destilacion y sin fine-tuning. El resultado mantiene las 43 capas del decoder del modelo base y reduce los expertos enrutados de 256 a 132 por capa, bajando el checkpoint de 156 GiB a 79 GiB.

El modelo resultante declara 150.128.549.111 parametros totales (unos 150B) y se distribuye en formato safetensors, con licencia MIT. La poda se calculo con estadisticas de calibracion sobre una mezcla de 3072 muestras de 512 tokens ponderada al 30% matematicas y 70% codigo, segun la receta publicada en la model card. El interes practico de esta ficha es que ofrece una alternativa de aproximadamente la mitad de peso que el modelo base manteniendo, segun los datos publicados por el autor, un rendimiento agregado ligeramente superior en la media de cuatro benchmarks.

Hay una diferencia critica que condiciona el despliegue: los modulos de multi-token prediction (`mtp.0`, `mtp.1`, `mtp.2`) presentes en el checkpoint base no existen en esta version, por lo que la decodificacion especulativa basada en MTP no esta disponible y los motores de inferencia caeran a decodificacion ordinaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (deepseek_v4) con expertos enrutados podados por REAP |
| Parametros totales | 150.128.549.111 |
| Parametros activos | no disponible (se activan 6 de los 132 expertos enrutados por token, pero el recuento exacto de parametros activos no se publica) |
| Longitud de contexto | no disponible para el modelo base; los benchmarks y el ejemplo de servicio se han ejecutado con `--context-length 4096` |
| Tipos de cuantizacion | Pesos en 8 bits / fp8 y layout de expertos MXFP4 (tags `8-bit`, `fp8`); el texto de la model card sobre builds GGUF esta truncado, por lo que no se confirma soporte GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Capas del decoder | 43 |
| Expertos enrutados por capa | 132 (base: 256) |
| Expertos por token | 6 |
| Tamano del repositorio | 84,7 GB (checkpoint declarado: 79 GiB) |
| Modelo base | deepseek-ai/DeepSeek-V4-Flash-0731 (finetune/comprimido) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base DeepSeek-V4-Flash-0731, un transformer decoder-only con bloques de mezcla de expertos (MoE). Sobre esa estructura, esta version no reentrena nada: aplica poda de expertos guiada por la activacion ponderada por router (REAP) y conserva las 43 capas completas. Lo unico que cambia es la poblacion de expertos dentro de cada bloque MoE, que pasa de 256 a 132, manteniendo 6 expertos activos por token. La seleccion de que expertos se conservan se obtiene en una sola pasada a partir de estadisticas de calibracion, sin descenso de gradiente, sin destilacion y sin fine-tuning posterior.

La calibracion usa 3072 muestras de 512 tokens con la mezcla del paper REAM ponderada 30% matematicas y 70% codigo, sin C4. El proceso se ejecuto con lectura y escritura capa a capa (`--streaming --stream-experts`), de forma que un checkpoint de 156 GiB se puede comprimir en una unica GPU de 96 GB porque el pico de memoria es el esqueleto del modelo mas una capa. Como diagnostico interno de reconstruccion, comparando la salida de cada bloque MoE reconstruido contra el original en una sonda de 4096 tokens y promediando las 43 capas, el autor reporta coseno medio 0,9445, coseno minimo 0,8417 y L2 relativa media 0,2068; se trata de una metrica de compresion, no de calidad final.

Dos cambios adicionales respecto del checkpoint base: se eliminan los modulos `mtp.0`, `mtp.1` y `mtp.2` (el base contiene 4705 tensores MTP), y se incluye un `chat_template.jinja` que transcribe `encode_messages()` del encoder oficial `encoding/encoding_dsv4.py`, copiado este ultimo de forma literal desde el repositorio base (MIT, Copyright (c) 2023 DeepSeek). El autor indica que la plantilla reproduce la cadena del encoder caracter a caracter en varios cientos de conversaciones, incluyendo multi-turno con `reasoning_content`, mensajes de usuario consecutivos y los tres niveles de esfuerzo de razonamiento.

## Capacidades

- Generacion de texto conversacional multi-turno, con `chat_template` incluido para system, user y assistant turns.
- Razonamiento con modo thinking activado por defecto, con niveles de esfuerzo configurables mediante `reasoning_effort`: `low` (por defecto), `high` y `max`.
- Razonamiento matematico: los benchmarks publicados incluyen MATH-500 (0,7140) y GSM8K (0,9295).
- Generacion de codigo: HumanEval+ 0,8963 y MBPP+ 0,7593 con `pass@1_plus`.
- Soporte de tool calling y tokens de tarea internos, pero solo a traves del encoder oficial `encoding/encoding_dsv4.py`; la plantilla `chat_template.jinja` no implementa tool calling ni mensajes de tipo `developer` o `latest_reminder`, ni el parametro `context` multi-turno.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Sin decodificacion especulativa MTP: los modulos de multi-token prediction no estan en el checkpoint, por lo que los motores que los busquen caeran a decodificacion estandar.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistente conversacional multi-turno: el modelo conserva la plantilla de chat verificada y el formato de turnos del modelo base, por lo que se puede desplegar directamente como chatbot con historial de conversacion, siempre que se dimensione `max_tokens` para evitar truncamientos a mitad del bloque de razonamiento.
- Razonamiento matematico asistido: con GSM8K en 0,9295 y MATH-500 en 0,7140, es adecuado para tutoria de problemas, verificacion de calculos o generacion de soluciones paso a paso en modo thinking con `reasoning_effort="high"`.
- Generacion y revision de codigo: HumanEval+ 0,8963 y MBPP+ 0,7593 lo hacen utilizable en pipelines de asistencia de programacion; al no tener MTP, la latencia de generacion sera la del decodificado estandar, un factor a considerar en herramientas interactivas.
- Razonamiento por lotes sobre grandes volumenes de texto: el ahorro de peso frente al base (79 GiB contra 156 GiB) reduce el coste por replica, lo que permite procesar lotes mas grandes con el mismo presupuesto de memoria que una sola instancia del modelo sin podar.
- Investigacion sobre compresion de MoE: sirve como punto de comparacion reproducible frente a variantes REAM o frente a podas menos agresivas del mismo modelo base, con la receta exacta de `moe-compress` publicada.
- Despliegue con tool calling en agentes: si se integra el encoder oficial `encoding/encoding_dsv4.py` en lugar de la plantilla Jinja, el modelo dispone de los tokens de tarea internos y los mensajes de tipo `developer` y `latest_reminder` que el encoder implementa.

## Benchmarks y rendimiento

Datos publicados en la model card. Todas las metricas son greedy (n=1), con contexto de 4096 tokens, `enable_thinking=false` y servidas con SGLang. GSM8K usa `exact_match,strict-match`, MATH-500 usa `math_verify,none`, y HumanEval+/MBPP+ usan `pass@1_plus`.

| Modelo | Expertos | Tamano | GSM8K | MATH-500 | HumanEval+ | MBPP+ | media |
|---|---|---|---|---|---|---|---|
| base 284b | 256 | 156 GiB | 0,9484 | 0,7060 | 0,8720 | 0,7407 | 0,8168 |
| REAP 200b | 178 | 104 GiB | 0,9401 | 0,6880 | 0,8720 | 0,7407 | 0,8102 |
| REAM 200b | 178 | 104 GiB | 0,8620 | 0,6080 | 0,8841 | 0,7698 | 0,7810 |
| **REAP 150b (este modelo)** | 132 | 79 GiB | 0,9295 | 0,7140 | 0,8963 | 0,7593 | 0,8248 |
| REAM 150b | 132 | 79 GiB | 0,6922 | 0,5020 | 0,8537 | 0,7328 | 0,6952 |

Diferencia frente al modelo base, en puntos:

| GSM8K | MATH-500 | HumanEval+ | MBPP+ | media |
|---|---|---|---|---|
| -1,90 | +0,80 | +2,44 | +1,85 | +0,80 |

Diagnostico de calidad de reconstruccion medido durante la compresion sobre una sonda de 4096 tokens, promediado en las 43 capas:

| | coseno (media) | coseno (minimo) | L2 relativa (media) |
|---|---|---|---|
| este modelo | 0,9445 | 0,8417 | 0,2068 |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 79 GiB en pesos de 8 bits/fp8. Hay que sumar el cache KV y los buffers del motor, de modo que una configuracion realista necesita mas de 80 GB agregados de VRAM; la cifra exacta de pico no esta publicada.
- GPU recomendadas: el autor verifica el despliegue en hardware Hopper con el runner MoE `flashinfer_mxfp4` (necesario de forma explicita, porque el backend `auto` cae en una ruta Triton que falla con los pesos empaquetados). El ejemplo de servicio usa `--tp-size 2` con 2 nodos, es decir 4 GPU en total.
- GPU de consumo: no cabe en una GPU de consumo. Con 79 GiB de pesos no entra en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB); como minimo requiere agregar varias GPU de 80 GB o un nodo con memoria unificada grande.
- Opciones de despliegue: SGLang verificado por el autor con `--moe-runner-backend flashinfer_mxfp4`. El modelo se publica con libreria transformers y formato safetensors, por lo que deberia cargarse tambien con transformers. La model card menciona builds GGUF para llama.cpp, pero el texto esta truncado y no se puede confirmar el soporte ni el estado de esos builds. No hay confirmacion de soporte en vLLM, TGI ni Ollama.
- Compresion: el proceso de poda se puede reproducir en una sola GPU de 96 GB gracias al modo `--streaming`, porque solo se mantiene en memoria el esqueleto mas una capa.
- Latencia y throughput: no disponibles. La ausencia de los modulos MTP elimina la decodificacion especulativa del modelo base, lo que previsiblemente penaliza el throughput respecto de aquel, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Expertos por capa | Tamano | GSM8K | MATH-500 | HumanEval+ | MBPP+ | media | Licencia |
|---|---|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | 256 | 156 GiB | 0,9484 | 0,7060 | 0,8720 | 0,7407 | 0,8168 | no disponible |
| REAP 200b | 178 | 104 GiB | 0,9401 | 0,6880 | 0,8720 | 0,7407 | 0,8102 | no disponible |
| REAM 200b | 178 | 104 GiB | 0,8620 | 0,6080 | 0,8841 | 0,7698 | 0,7810 | no disponible |
| REAM 150b | 132 | 79 GiB | 0,6922 | 0,5020 | 0,8537 | 0,7328 | 0,6952 | no disponible |
| **REAP 150b (este modelo)** | 132 | 79 GiB | 0,9295 | 0,7140 | 0,8963 | 0,7593 | 0,8248 | MIT |

Comparativa limitada a las variantes de compresion del mismo modelo base publicadas en la model card. No se dispone de datos de modelos de otros fabricantes de tamano o tarea comparable en la informacion proporcionada.

## Limitaciones y advertencias

- Sin MTP: al eliminar `mtp.0`, `mtp.1` y `mtp.2`, la decodificacion especulativa basada en multi-token prediction no esta disponible. Los motores que busquen esos pesos caeran a decodificacion ordinaria; el resto de la generacion estandar no se ve afectada.
- Tool calling incompleto en la plantilla Jinja: `chat_template.jinja` no implementa tool calling, tokens de tarea internos, mensajes `developer` ni `latest_reminder`, ni el parametro `context` multi-turno. Para esos casos hay que usar `encoding/encoding_dsv4.py`.
- Discrepancia de autoria: la ficha de HuggingFace atribuye el modelo a `Distillio`, mientras que la model card se titula `puwaer/DeepSeek-V4-Flash-0731-reap-150b` y los comandos de servicio apuntan a `puwaer/...`. Conviene verificar que el repositorio descargado es el esperado.
- Divergencia entre benchmarks y modelo base: la media agregada de esta version es 0,80 puntos superior a la del base, con MATH-500, HumanEval+ y MBPP+ al alza. Es un resultado contraintuitivo para una poda del 48% de los expertos y conviene tratarlo con cautela; ademas, los benchmarks se ejecutaron con `enable_thinking=false`, por lo que no reflejan el rendimiento en modo razonamiento.
- Diagnostico de reconstruccion no trivial: el coseno minimo por capa es 0,8417 y la L2 relativa media 0,2068, lo que indica que algunas capas se reconstruyen bastante peor que la media. El propio autor advierte que es una metrica de compresion y no de calidad.
- Ids y fechas del repositorio: la ficha indica fecha de creacion 2026-09-12 y 0 descargas, con lo que no hay validacion de la comunidad ni historial de uso en produccion.
- Razonamiento por defecto: el modo thinking esta activado por defecto y consume tokens antes de la respuesta, por lo que hay que ajustar `max_tokens` y, si se necesita salida directa, pasar `enable_thinking=false` via `chat_template_kwargs`.
- Muestreo por defecto: segun `generation_config.json`, el modelo usa `do_sample` con `temperature` y `top_p`, no decodificacion greedy; hay que fijar esos parametros para reproducibilidad.
- Idiomas soportados no declarados; no se puede garantizar calidad fuera del ingles o el chino sin evaluacion propia.
- Licencia MIT declarada en la ficha, pero el modelo base y las variantes de comparacion no declaran licencia en la informacion disponible; conviene revisar los terminos del modelo base antes de un uso comercial.
- Riesgo de alucinacion y sesgos: no hay informacion especifica proporcionada para esta version comprimida; al no haber fine-tuning ni alineacion adicional, hereda los del modelo base, que no se detallan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Distillio/DeepSeek-V4-Flash-0731-reap-150b
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Herramienta de compresion: https://github.com/puwaer/moe-expert-compress
- Paper REAM referenciado en la model card: arxiv:2510.13999
- Paper referenciado en la model card: arxiv:2604.04356
- Las busquedas web realizadas no han devuelto resultados relevantes sobre este modelo (unicamente carteleras de cine sin relacion); no se han encontrado papers, blogs, repositorios ni demos adicionales.

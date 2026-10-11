# pqhaz/MiMo-V2.6-Pro-MOPD-heretic

## Resumen

MiMo-V2.6-Pro-MOPD-heretic es una variante modificada del modelo XiaomiMiMo/MiMo-V2.6-Pro-MOPD, publicada por el usuario pqhaz. No es una version oficial de Xiaomi: se trata de una edicion de pesos que aplica una ablacion direccional en dos etapas sobre el comportamiento de rechazo (lo que en la jerga se conoce como abliteration, con la herramienta Heretic para la primera etapa). El checkpoint conserva exactamente el mismo formato de almacenamiento, tamano y procedimiento de carga que el modelo base.

El modelo tiene 1.024.216.603.392 parametros (aproximadamente 1,02 billones) y el repositorio ocupa 636 GB. La model card indica que se trata de una arquitectura con expertos enrutados empaquetados en MXFP4, proyecciones de atencion en bfloat16 y un drafter DFlash para decodificacion especulativa, ademas de un modo de razonamiento activado por defecto. El contexto maximo, el numero de capas, el numero de expertos y los idiomas soportados no se detallan en la informacion disponible.

Su relevancia es doble. Por un lado, es un caso reproducible de investigacion sobre alineacion y mecanismos de rechazo en modelos de razonamiento de gran escala, con direcciones de ablacion y script de aplicacion publicados. Por otro, es un modelo de mas de un billon de parametros que solo se ha validado en un despliegue multinodo/multigpu muy concreto (4x AMD MI355X con vLLM en ROCm), lo que limita su uso practico a entornos con hardware de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y decodificacion especulativa mediante drafter DFlash; numero de capas y de expertos no disponible |
| Parametros totales | 1.024.216.603.392 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en 8 bits: expertos enrutados empaquetados en MXFP4 y proyecciones de atencion en bfloat16; cache KV en fp8 en el despliegue medido. No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada en el repositorio; verificar la licencia del modelo base) |
| Formato de pesos | safetensors (con custom_code y trust_remote_code) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una edicion quirurgica de pesos sobre XiaomiMiMo/MiMo-V2.6-Pro-MOPD. La model card solo describe la parte modificada: 70 tensores correspondientes a `model.layers.N.self_attn.o_proj.weight` en todas las capas, es decir, las proyecciones de salida de la atencion. El autor justifica esa eleccion porque son las unicas matrices que escriben en el flujo residual y que el checkpoint almacena en bfloat16 plano, lo que permite una edicion exacta. Todo lo demas es byte a byte identico al modelo base, incluido el drafter DFlash.

La modificacion consiste en una ablacion direccional en dos etapas. La primera, con fuerza 2,5, calcula una direccion por capa a partir de la diferencia entre la media del flujo residual de 400 instrucciones daninas y 400 inofensivas en el ultimo token del prompt, con la media de las inofensivas proyectada fuera. La segunda, con fuerza 1,0, se mide dentro del bloque de razonamiento: se reproducen las trazas de razonamiento del modelo de etapa 1 para las mismas 400 instrucciones daninas y se promedia el flujo residual sobre los ultimos 96 tokens de razonamiento, tomando como direccion la diferencia entre 100 trazas que acabaron en rechazo y 100 que acabaron en respuesta, con las direcciones de la etapa 1 proyectadas fuera. Los ficheros `ablation_directions.pt`, `ablation_directions_reasoning.pt` y el directorio `patch/` permiten reproducir la edicion sobre el checkpoint base. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF o DPO para el modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y multimodalidad no confirmada: el pipeline declarado es text-generation y no se mencionan capacidades de vision o audio.
- Razonamiento explicito con modo de razonamiento activado por defecto, con un bloque de razonamiento separado del prompt y delimitado por el parser `mimo` de vLLM.
- Generacion de respuestas a instrucciones que el modelo base rechazaba: en la evaluacion medida pasa de 3 respuestas emitidas de 100 a 90 de 100 en `mlabonne/harmful_behaviors` test[:100], y de 5 a 90 en JailbreakBench JBB-Behaviors.
- Capacidad de servir como sujeto de estudio para investigacion sobre direcciones de rechazo: se publican las direcciones de ablacion y el script de aplicacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente; el modo de razonamiento con hasta 4000 tokens nuevos sugiere cadenas largas, pero no hay documentacion especifica.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en seguridad de IA sobre mecanismos de rechazo: el modelo permite comprobar si una ablacion direccional medida en el bloque de razonamiento reduce las negativas, con las direcciones y el script publicados para replicar el experimento sobre el checkpoint base.
- Red teaming y evaluacion de robustez de alineacion: al pasar de 97 rechazos de 100 a 8 de 100 en un conjunto de comportamientos daninos, sirve como referencia de hasta donde llega una ablacion de dos etapas en comparacion con una de una sola etapa (68 de 100).
- Generacion de datos adversarios para entrenar clasificadores de seguridad: sus respuestas a instrucciones que el modelo base rechaza pueden usarse como ejemplos negativos etiquetados, siempre que el uso se limite a entornos autorizados.
- Calibracion de LLM judges: el autor usa `llmfan46/gemma-4-31B-it-uncensored-heretic` como juez; el modelo es util para estudiar el comportamiento de jueces automaticos ante respuestas que no contienen una negativa explicita, incluidos casos truncados por el limite de tokens.
- Estudio de estabilidad en modelos con ablacion agresiva: permite medir el coste en repeticiones y bucles dentro del bloque de razonamiento (1 a 4 de cada 100 respuestas en la configuracion recomendada) y compararlo con fuerzas de ablacion mayores.
- Analisis de divergencia respecto al modelo original: con una divergencia KL de 0,144 en el primer token generado sobre 100 prompts inofensivos, sirve para cuantificar cuanto se desvia una edicion de pesos del modelo de referencia.
- Despliegue como asistente general: tecnicamente posible en un clúster con 4x MI355X o equivalente, pero sin benchmarks de capacidad publicados no hay evidencia de que su rendimiento en tareas generales sea equiparable al del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. La unica evaluacion medida es de comportamiento (rechazo, respuesta, bucle) y de divergencia respecto al modelo base.

Evaluacion de comportamiento con razonamiento activado, temperatura 1,0, top_p 0,95, hasta 4000 tokens nuevos, vLLM en ROCm nightly 0.31.1rc1 sobre 4x MI355X con tensor-parallel-size 4:

| Metrica | Base | Solo etapa 1 | Este modelo |
|---|---|---|---|
| `mlabonne/harmful_behaviors` test[:100]: rechaza / responde / sigue razonando | 97 / 3 / 0 | 68 / 26 / 6 | 8 / 90 / 2 |
| JailbreakBench JBB-Behaviors (held out): rechaza / responde / sigue razonando | 95 / 5 / 0 | 54 / 41 / 5 | 6 / 90 / 4 |
| Rechazos con razonamiento cerrado (primeros 40 tokens, greedy, de 100) | 99 | 10 | 19 |
| Divergencia KL respecto al base en el primer token generado (100 prompts inofensivos) | 0 (referencia) | 0,101 | 0,144 |

Notas del autor: ninguno de los dos conjuntos se uso para ajustar las direcciones (el primero sirvio para elegir las fuerzas); las cifras a temperatura 1,0 varian aproximadamente mas o menos 5 entre ejecuciones; la celda de este modelo es la media de dos ejecuciones (4 / 93 / 3 y 12 / 86 / 2). Con fuerzas mayores (etapa 2 a 1,5, 2,0 y 3,0) no se redujeron los rechazos, sino que aumentaron los bucles, con divergencias KL de 0,187 y 0,244 y en torno a la mitad de respuestas en bucle con fuerza 3,0.

## Requisitos de hardware

- El repositorio ocupa 636 GB, coherente con 1,02 billones de parametros almacenados en MXFP4 para los expertos y bfloat16 para la atencion. Se necesita por tanto un conjunto de aceleradores con al menos ese orden de memoria, mas espacio para cache KV y activaciones (estimacion: del orden de 700 GB o mas en total).
- Configuracion validada por el autor: 4x AMD Instinct MI355X con `--tensor-parallel-size 4`, `--kv-cache-dtype fp8`, `--reasoning-parser mimo`, `--generation-config vllm`, `--trust-remote-code` y `VLLM_ROCM_USE_AITER=1` sobre vLLM ROCm nightly 0.31.1rc1.
- Alternativas en el lado NVIDIA: no verificadas en la informacion disponible. Por capacidad de memoria, un conjunto de 8 GPU de 80 GB (H100 o A100 80 GB) queda muy justo para 636 GB de pesos mas cache KV en fp8, por lo que se recomienda 8x H100 80 GB como minimo teorico o GPUs de mayor memoria (H200, MI300X, MI355X). Es una estimacion, no un dato medido.
- No cabe en GPU de consumo: ni RTX 4090, ni RTX 5090, ni configuraciones multimonitor de 24-48 GB. El requisito minimo realista es un nodo de 4 a 8 aceleradores de centro de datos.
- Opciones de despliegue: vLLM (unica validada), con soporte de ROCm y de NVIDIA previsiblemente mediante el mismo motor. No hay pesos GGUF publicados, por lo que llama.cpp, Ollama y LM Studio no pueden ejecutar este checkpoint en su formato actual. TGI no esta documentado para este modelo.
- Latencia y throughput: no disponible. El autor no publica tokens por segundo ni latencia por peticion.

## Comparativa con modelos similares

No hay datos publicados de modelos comparables en la informacion disponible, ni benchmarks de capacidad que permitan situar este checkpoint frente a otras alternativas del mismo rango. La unica comparacion con datos medidos es interna, contra el modelo base y contra la ablacion de una sola etapa:

| Modelo | Parametros | Contexto | Rechazos en JBB-Behaviors (de 100) | Divergencia KL vs base | Licencia |
|---|---|---|---|---|---|
| Base XiaomiMiMo/MiMo-V2.6-Pro-MOPD | 1,02 B (mismo checkpoint) | no disponible | 95 | 0 | no disponible en esta informacion |
| Ablacion solo etapa 1 | 1,02 B | no disponible | 54 | 0,101 | no disponible |
| Este modelo (etapas 1 y 2) | 1,02 B | no disponible | 6 | 0,144 | MIT declarada |

Frente a otros modelos abliterated del ecosistema no se dispone de datos de parametros, contexto o rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion elimina en gran medida el comportamiento de rechazo, no solo en el bloque de razonamiento. En la evaluacion del autor, el modelo responde al 90 por ciento de un conjunto de comportamientos daninos, frente al 3-5 por ciento del modelo base. Es un artefacto pensado para investigacion en seguridad y debe desplegarse solo en entornos propios o con autorizacion explicita; no es adecuado para uso comercial general ni para aplicaciones orientadas al publico.
- Inestabilidad en el razonamiento: entre 1 y 4 de cada 100 respuestas quedan atrapadas repitiendose dentro del bloque de razonamiento. Con fuerzas de ablacion mayores el problema empeora (de 2 a 7 bucles con fuerza 1,5, de 7 a 9 con 2,0 y en torno a la mitad de respuestas con 3,0) sin reducir los rechazos.
- Con el razonamiento cerrado el modelo rechaza mas que la etapa 1 sola (19 de 100 frente a 10 de 100), porque la segunda direccion esta ajustada sobre el bloque de razonamiento. El comportamiento depende del modo de generacion.
- No se ejecutaron benchmarks de capacidad. No hay evidencia publicada de que el modelo conserve MMLU, HumanEval, GSM8K ni ningun otro resultado del modelo base tras la edicion, mas alla de la divergencia KL de 0,144 en el primer token sobre prompts inofensivos.
- Sesgos conocidos: no documentados de forma especifica. Al heredar los pesos del modelo base, cabe esperar sus sesgos, pero no hay analisis publicado en la informacion disponible.
- Riesgo de alucinacion: no evaluado. Un modelo con ablacion de rechazo puede ademas emitir afirmaciones inseguras con mayor seguridad aparente, algo que no se ha medido aqui.
- Los expertos enrutados no se han modificado porque su almacenamiento MXFP4 no permite una edicion de este tamano. La intervencion se limita a las escrituras de atencion, lo que acota el alcance de la ablacion.
- Idiomas soportados y longitud de contexto no disponibles: no se puede planificar un despliegue multilingue o de contexto largo con la documentacion publicada.
- Licencia: el repositorio declara MIT, pero es una edicion de un modelo de terceros. Conviene revisar los terminos del modelo base XiaomiMiMo/MiMo-V2.6-Pro-MOPD antes de cualquier uso comercial, ya que la licencia declarada por el autor de la edicion no sustituye a la del modelo original.
- Adopcion nula: 0 descargas y 0 likes en el momento de recoger los datos, sin validacion independiente de las cifras ni de la reproducibilidad del parche.
- La model card es la unica fuente tecnica; no hay paper, informe de evaluacion externo ni repositorio de codigo asociado mas alla del propio repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pqhaz/MiMo-V2.6-Pro-MOPD-heretic
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-MOPD
- Organizacion Xiaomi MiMo: https://huggingface.co/XiaomiMiMo
- Heretic (metodo de la primera etapa): https://github.com/p-e-w/heretic
- Juez usado en la evaluacion: https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic
- Conjunto de evaluacion: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Conjunto de evaluacion: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados no guardan relacion con el checkpoint y se han descartado.

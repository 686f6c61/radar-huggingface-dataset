# goodmai/gemma-4-26B-A4B-it-PV-MACaQ-4bit-Affine-MLX

## Resumen

`gemma-4-26B-A4B-it-PV-MACaQ-4bit-Affine-MLX` es una cuantizacion de 4 bits del modelo `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized` publicada por el usuario goodmai. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: toma los pesos originales de Google (ya pasados por un proceso de quantisation-aware training, QAT) y los recomprime con una receta propia denominada PV-MACaQ, pensada para el runtime MLX de Apple Silicon y para la herramienta Basalt del mismo autor.

La motivacion es doble. Por un lado, reducir el peso en disco y en memoria de un modelo de 26 mil millones de parametros (13,86 mil millones reales en safetensors) hasta 17,53 GB, un factor de compresion de 2,94x respecto a los 51,61 GB en BF16. Por otro, preservar la precision de las partes mas sensibles de la red: la torre de vision, las capas densas compartidas, los routers del MoE y los embeddings se mantienen en 8 bits, mientras que solo atencion y expertos se comprimen a 4 bits con tecnicas de compensacion de error.

El modelo base es un transformer hibrido con mezcla de expertos (MoE) de la familia Gemma 4, con capacidades de vision (torre de imagen preservada en BF16) e instruccion afinada. Esta version concreta esta orientada a inferencia local en Macs con MLX, no a servidores CUDA. No hay informacion publica sobre benchmarks, licencia ni idiomas en la ficha de Hugging Face, por lo que muchos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y torre de vision; cuantizacion PV-MACaQ para MLX |
| Parametros totales | 13.856.566.606 (segun safetensors) |
| Parametros activos | no disponible (el nombre indica A4B, es decir, ~4B activos, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine PV-MACaQ (group_size=32, hadamard_block=32, scale_dtype=bfloat16) para atencion y expertos; 8-bit affine (group_size=64) para embeddings, MLP compartido y routers; BF16 para torre de vision y normas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de la familia Gemma 4, con 26 mil millones de parametros nominales (13,86 mil millones contabilizados en safetensors) e instruccion afinada. Incluye una torre de vision que en esta cuantizacion se conserva intacta en BF16, lo que sugiere capacidades multimodales heredadas del modelo original. La nomenclatura `A4B` del nombre apunta a unos 4 mil millones de parametros activos por token, tipico de un diseno MoE disperso, aunque el dato exacto no se detalla en la informacion disponible.

No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO; esos datos corresponden al modelo original de Google y no se reproducen aqui. La innovacion tecnica de esta ficha es exclusivamente la receta de cuantizacion: PV-MACaQ combina una busqueda de clip optima por error cuadratico medio (MSE), PV-Tuning en dos rondas con solucion cerrada por minimos cuadrados (paso P de `pre_scale` y paso V de pulido de sesgos y codigos) y una transformada de Hadamard de bloque 32 para reducir el error de cuantizacion en las matrices de atencion y en los expertos. El resultado declarado es un SQNR medio de 22,70 dB frente a 21,20 dB de la cuantizacion RTN affine de 4 bits con grupo 64, una mejora de 1,49 dB y una reduccion del 28,5 % del MSE. El proceso de construccion tardo 409,3 segundos.

## Capacidades

- Generacion de texto e instruccion afinada, heredadas del modelo base Gemma 4.
- Razonamiento multimodal: la torre de vision se conserva en BF16, por lo que se mantienen las capacidades de imagen del original.
- Mezcla de expertos con routers preservados en 8 bits, lo que mantiene la seleccion de expertos con precision alta.
- Capacidades multilingues: no disponibles en la informacion de esta ficha.
- Tool calling y function calling: no confirmado en la informacion disponible.
- Modo de razonamiento extendido (thinking): no confirmado.
- Ejecucion en Apple Silicon mediante MLX y la herramienta Basalt.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y el tamano de 17,53 GB permiten ejecutar el modelo en equipos con memoria unificada de 32 GB o superior, sin GPU dedicada.
- Prototipado de asistentes multimodales en local: al conservar la torre de vision en BF16, se pueden probar flujos de pregunta-respuesta sobre imagenes sin depender de APIs externas.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia practica para comparar PV-MACaQ frente a RTN affine en terminos de SQNR y MSE sobre un modelo MoE real.
- Desarrollo de pipelines con Basalt: integracion directa en la herramienta del autor para tareas de generacion y experimentacion con modelos cuantizados.
- Experimentacion academica con modelos MoE de gran tamano en hardware de consumo: permite estudiar el comportamiento de routers y expertos cuantizados sin acceso a clusters.
- Despliegue de demos privadas y offline: al no requerir red, es adecuado para entornos con requisitos de confidencialidad donde no se pueden usar servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos medidos son de calidad de cuantizacion:

| Metrica | Valor |
|---|---|
| Modulos en 8-bit affine (embeddings + MLP compartido + routers) | 121 |
| Modulos de atencion en 4-bit PV-MACaQ 2D | 115 |
| Modulos MoE `MACaQSwitchLinear` en 4-bit PV-MACaQ 3D | 90 |
| Tamano de entrada (BF16) | 51,61 GB |
| Tamano de salida | 17,53 GB (2,94x) |
| SQNR medio RTN 4-bit affine (g64) | 21,20 dB |
| SQNR medio PV-MACaQ 4-bit affine (g32, H32) | 22,70 dB (+1,49 dB) |
| Reduccion media de MSE frente a RTN g64 | 28,5 % |
| Tiempo de construccion | 409,3 s |

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 18-20 GB libres para cargar los pesos de 17,53 GB; se recomienda 32 GB o mas para margen de contexto y cache KV.
- GPU recomendadas: Apple Silicon con memoria unificada (series M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max). No esta pensado para GPUs NVIDIA ni CUDA.
- Cabe en GPU de consumo: si, en Macs con 32 GB o mas de memoria unificada. No es compatible con GPUs de consumo NVIDIA en su formato actual (MLX).
- Opciones de despliegue: MLX y Basalt (herramienta del autor). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (goodmai) | 13,86 B (safetensors) | no disponible | 4-bit PV-MACaQ + 8-bit affine | no disponible | safetensors MLX |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | no disponible | no disponible | QAT q4_0 (referencia) | no disponible | safetensors |
| Modelos MoE de ~4B activos de otras familias | no disponible | no disponible | variable | variable | variable |

No se dispone de datos de rendimiento de tareas para establecer una comparacion cuantitativa con alternativas. La comparacion mas directa es con el modelo base de Google sin cuantizar, del que esta version deriva.

## Limitaciones y advertencias

- Es un artefacto derivado: cualquier sesgo, alucinacion o limitacion del modelo base Gemma 4 se hereda sin cambios.
- La cuantizacion a 4 bits introduce perdida de precision; aunque la receta reduce el MSE un 28,5 % frente a RTN, no es una copia exacta del modelo original.
- La licencia no esta declarada en la ficha; antes de uso comercial hay que verificar la licencia del modelo base de Google y los terminos de Gemma.
- Solo funciona con MLX en Apple Silicon; no es portable a CUDA sin reconversion.
- No hay informacion sobre idiomas soportados ni sobre el contexto maximo, lo que impide garantizar su comportamiento en casos multilingues o de contexto largo.
- No se han publicado evaluaciones de tareas ni pruebas de seguridad; el uso en produccion requiere validacion propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/gemma-4-26B-A4B-it-PV-MACaQ-4bit-Affine-MLX
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Herramienta Basalt: https://github.com/goodmai/basalt

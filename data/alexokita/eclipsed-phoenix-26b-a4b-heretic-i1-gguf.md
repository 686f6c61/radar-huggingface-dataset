# alexokita/Eclipsed-Phoenix-26B-A4B-Heretic-i1-GGUF

## Resumen

Eclipsed-Phoenix-26B-A4B-Heretic-i1-GGUF es un conjunto de cuantizaciones GGUF en estilo i1 (importance matrix) publicado por el usuario alexokita a partir del modelo Cyclone-Labs/Eclipsed-Phoenix-26B-A4B. El modelo subyacente pertenece a la familia Gemma 4 y utiliza una arquitectura de mezcla de expertos (MoE): los pesos en safetensors del modelo base suman 25.233.142.046 parámetros totales y, segun la nomenclatura A4B del nombre, del orden de 4.000 millones de parámetros activos por token. Sobre esa base se ha aplicado un proceso de abliteration con la herramienta Heretic (variante identificada como "trial 93"), cuyo objectivo declarado es reducir la tasa de rechazos manteniendo baja la divergencia respecto al modelo original.

El resultado es un modelo afinado hacia roleplay y narrativa, distribuido exclusivamente en formato GGUF y solo con soporte de texto (no se incluye el proyector multimodal mmproj). La coleccion cubre 23 niveles de cuantizacion, desde i1-IQ1_S (8,3 GB) hasta i1-Q6_K (22,6 GB), lo que permite desplegarlo tanto en GPUs de consumo con 8-12 GB de VRAM como en equipos con 24 GB o mas.

Su relevancia actual es doble: por un lado, ofrece una via práctica de ejecutar un MoE de ~25B en hardware modesto gracias al bajo numero de parametros activos; por otro, documenta de forma medible el efecto de la abliteration (21 rechazos sobre 100 prompts de prueba y divergencia KL de 0,0128), un dato poco habitual en este tipo de publicaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Gemma 4 (base: Cyclone-Labs/Eclipsed-Phoenix-26B-A4B) |
| Parametros totales | 25.233.142.046 (dato real de safetensors del modelo base) |
| Parametros activos | No confirmado en la informacion proporcionada; la nomenclatura A4B sugiere del orden de 4.000 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas el fichero imatrix de calibracion) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (texto unicamente, sin mmproj); el modelo base esta en safetensors |
| Tamano del repositorio | 300,9 GB |
| Fecha de publicacion | 25 de septiembre de 2026 (ultima actualizacion: 26 de septiembre de 2026) |

## Arquitectura y entrenamiento

La arquitectura de partida es la del modelo Gemma 4 en configuracion MoE con etiquetado 26B-A4B, es decir, un transformer con capas de mezcla de expertos en las que solo se activa una fraccion de los parametros por token. La informacion disponible no detalla el numero de expertos, el numero de expertos activados por token ni la dimension de las capas, por lo que esos datos quedan como no disponibles. El modelo final es un merge: no se ha reentrenado desde cero, sino que se han combinado variantes y se ha aplicado abliteration sobre el resultado.

El unico proceso de entrenamiento documentado es el de abliteration mediante p-e-w/heretic, correspondiente al "trial 93", con 21 rechazos sobre 100 prompts de evaluacion y una divergencia KL de 0,0128 respecto al modelo sin modificar. No se especifican los datos de preentrenamiento (numero de tokens, composicion del dataset) ni si hubo fases de RLHF o DPO en el modelo base, y tampoco se detalla la receta de merge. La parte de cuantizacion si esta documentada: los ficheros i1 se generaron con llama.cpp sobre una NVIDIA GB10, usando como calibracion el fichero `groups_merged.txt` del dataset froggeric/imatrix con `llama-imatrix -c 512`, y el autor indica que el proceso ha sido verificado (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) con `skip_mmproj: 1`.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis declarado en roleplay y narrativa (storytelling).
- Escritura creativa: continuacion de ficcion, construccion de personajes y mantenimiento de estilo a lo largo de una conversacion.
- Reduccion de rechazos: la abliteration busca que el modelo responda a peticiones que un modelo alineado por defecto rechazaria (21/100 rechazos medidos en la prueba del autor).
- Capacidades generales heredadas del modelo base (razonamiento, conocimiento factual), aunque no se documentan evaluaciones especificas en esta ficha.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles (`language: en`); no se declara soporte de castellano.
- Vision: no soportada. Los GGUFs son solo de texto, el autor indica explicitamente "no mmproj".
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay conversacional local: el modelo esta afinado especificamente para mantener personajes y tono a lo largo de sesiones largas; con las cuantizaciones i1-Q4_K_M (16,8 GB) o inferiores puede ejecutarse en una unica GPU de consumo.
- Escritura asistida de ficcion: generacion de dialogos, tramas y descripciones con un estilo consistente, aprovechando la reduccion de rechazos para tramas adultas o temas sensibles que otros modelos filtran.
- Prototipado de asistentes conversacionales sin restricciones editoriales: util para investigar como se comporta un modelo abliterado frente a uno alineado, comparando respuestas sobre el mismo conjunto de prompts.
- Investigacion sobre abliteration y alineamiento: el modelo sirve como caso de estudio reproducible, ya que el autor publica metrica de rechazos (21/100) y divergencia KL (0,0128) del trial aplicado.
- Despliegue en hardware modesto: las variantes IQ1_S (8,3 GB) e IQ2_M (10,4 GB) permiten ejecutar un MoE de ~25B en GPUs con 10-12 GB de VRAM o en configuracion hibrida CPU+GPU con llama.cpp.
- Generacion de datos sinteticos de texto narrativo: al ser un MoE con pocos parametros activos, permite generar grandes volumenes de texto a mayor velocidad que un modelo denso equivalente en VRAM.
- Bot de entretenimiento para comunidades: integrable en aplicaciones de chat o Discord mediante llama.cpp u Ollama, con coste de infraestructura bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones estandar equivalentes.

Las unicas metricas reportadas por el autor son las del proceso de abliteration:

| Metrica | Valor |
|---|---|
| Rechazos (prompts de prueba) | 21 / 100 |
| Divergencia KL respecto al modelo original | 0,0128 |
| Herramienta de abliteration | p-e-w/heretic |
| Variante | trial 93 |

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano del fichero mas margen tipico de 1-3 GB para cache KV y buffers segun contexto):
  - i1-IQ1_S: 8,3 GB de pesos.
  - i1-IQ2_M: 10,4 GB de pesos.
  - i1-IQ3_S: 12,2 GB de pesos.
  - i1-IQ4_XS: 13,9 GB de pesos.
  - i1-Q4_K_M: 16,8 GB de pesos (el autor lo marca como "fast, recommended").
  - i1-Q5_K_M: 19,1 GB de pesos.
  - i1-Q6_K: 22,6 GB de pesos.
- GPUs recomendadas: RTX 3060 12 GB o RTX 4070 para las cuantizaciones IQ2/IQ3; RTX 3090, RTX 4090 o RTX 5090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K; A100 40/80 GB, H100 o similares para servir varias instancias o contextos muy largos.
- Cabe en GPU de consumo: si. Las variantes de 8-14 GB entran en GPUs de 10-12 GB; las de 15-17 GB entran en 24 GB con holgura; Q6_K (22,6 GB) entra en 24 GB pero con poco margen para cache KV.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con GGUF. Al ser un GGUF con `endpoints_compatible`, tambien puede exponerse mediante endpoints compatibles con la API de OpenAI. vLLM y TGI no son el objetivo principal de estos ficheros.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con un numero reducido de parametros activos, la velocidad de decodificacion depende mas del ancho de banda de memoria asociado a los parametros activos que del tamano total del fichero, siempre que los expertos esten en VRAM.
- Nota sobre offloading: con llama.cpp se puede repartir el modelo entre GPU y CPU, lo que permite ejecutar las cuantizaciones grandes en equipos con menos VRAM a costa de latencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Las dos ultimas filas son referencias de categoria, no equivalentes exactas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Eclipsed-Phoenix-26B-A4B-Heretic-i1-GGUF | 25.233.142.046 totales; ~4B activos (segun nomenclatura) | no disponible | apache-2.0 | GGUF, solo texto |
| Cyclone-Labs/Eclipsed-Phoenix-26B-A4B (base) | 25.233.142.046 | no disponible | no disponible | safetensors |
| Gemma 3 27B (referencia de generacion anterior) | 27B densos | 128K tokens | Terminos de uso de Gemma | safetensors, GGUF de terceros |
| Mistral Small 3.1 24B (referencia de categoria) | 24B densos | 128K tokens | Apache 2.0 | safetensors, GGUF de terceros |

Frente a un denso de ~24-27B, la ventaja teorica de este modelo es el coste de inferencia mucho menor por token (solo se activan ~4B parametros), mientras que su desventaja es la ausencia de benchmarks publicados y de soporte multimodal.

## Limitaciones y advertencias

- Modelo abliterado: la reduccion deliberada de rechazos implica una mayor probabilidad de generar contenido ofensivo, inseguro o legalmente problematico. Requiere filtrado externo si se expone a usuarios finales.
- Riesgo de degradacion por abliteration: una divergencia KL de 0,0128 es baja, pero puede traducirse en perdida de coherencia en tareas que dependen del alineamiento original. El autor no reporta evaluaciones de calidad posteriores.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; el modelo esta orientado a ficcion y roleplay, donde la precision factual no es el objetivo.
- Idioma: solo ingles declarado. No hay soporte documentado de castellano ni de otros idiomas.
- Contexto: la longitud de contexto no esta especificada en la informacion disponible, lo que impide dimensionar correctamente la cache KV en produccion.
- Sin vision: los ficheros no incluyen mmproj, por lo que el modelo es exclusivamente de texto.
- Licencia: el repositorio declara apache-2.0, pero el modelo deriva de un base de la familia Gemma cuyos terminos de uso pueden seguir aplicandose. Conviene verificar la licencia del modelo base antes de un uso comercial.
- Cuantizaciones extremas: el propio autor advierte que i1-Q2_K_S es de "very low quality", que i1-IQ1_S es "for the desperate" y que i1-Q4_0 es rapido pero de baja calidad. Para produccion, las opciones sensatas son IQ4_XS, Q4_K_M o superiores.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado los ficheros.
- Repositorio de 300,9 GB: descargar el conjunto completo es costoso en disco y ancho de banda; conviene bajar solo la cuantizacion necesaria.
- Fechas de publicacion en 2026 y ausencia de informacion sobre el modelo base: la trazabilidad del merge y del dataset de calibracion es limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexokita/Eclipsed-Phoenix-26B-A4B-Heretic-i1-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Eclipsed-Phoenix-26B-A4B
- Herramienta de abliteration Heretic: https://github.com/p-e-w/heretic
- Dataset de calibracion imatrix: https://huggingface.co/datasets/froggeric/imatrix
- Guia de uso de GGUF (referencia citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Fichero imatrix publicado: https://huggingface.co/alexokita/Eclipsed-Phoenix-26B-A4B-Heretic-i1-GGUF/resolve/main/Eclipsed-Phoenix-26B-A4B-Heretic.imatrix.gguf

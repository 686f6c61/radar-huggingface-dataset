# AtomicChat/MiniMax-M3.1-Flash-GGUF

## Resumen

AtomicChat/MiniMax-M3.1-Flash-GGUF es la publicación de cuantizaciones GGUF del modelo MiniMax-M3.1-Flash, desarrollado por MiniMax y convertido a formato llama.cpp por AtomicChat. No se trata de un modelo nuevo, sino de una distribución de pesos comprimidos pensada para ejecutar localmente un modelo MoE de gran tamaño: 426.174.572.928 parámetros totales según los safetensors (la model card indica 428B), de los cuales unos 23B se activan por token. La arquitectura es un transformer con mezcla de expertos y MiniMax Sparse Attention, identificada en llama.cpp como `minimax-m3`, y el pipeline declarado es image-text-to-text, con un encoder de visión separado.

Su relevancia está en el empaquetado: los ficheros publicados usan un esquema propio denominado "Atomic Dynamic" (AD), en el que la compresión agresiva se aplica a los expertos enrutados mientras la atención, el experto compartido y los embeddings se mantienen en mayor precisión, guiado por una importance matrix calculada sobre el formato de chat propio del modelo. El resultado son cuatro niveles que van de 112,2 GB a 257,2 GB en disco, lo que sitúa el mínimo práctico en máquinas de 128 GB de memoria unificada o dedicada.

El modelo base fue publicado por MiniMax el 19 de octubre de 2026 e incluye modo de razonamiento configurable, soporte de tool calling y entrada de imágenes. Esta ficha se centra en la distribución GGUF de AtomicChat: qué contiene, cómo se comporta frente a la referencia Q8_0 y qué hardware hace falta para moverlo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y MiniMax Sparse Attention; arquitectura `minimax-m3` en llama.cpp |
| Parametros totales | 426.174.572.928 (~426B) segun safetensors; la model card del cuantizador indica 428B |
| Parametros activos | ~23B por token |
| Longitud de contexto | no disponible (la model card documenta ejemplos de ejecucion a 8k y 32k, sin declarar el maximo) |
| Tipos de cuantizacion | GGUF: AD-IQ2_XXS, AD-Q2_K, AD-IQ3_S, AD-Q4_K (esquema "Atomic Dynamic"); referencia Q8_0 para medir; encoder de vision en F16 |
| Idiomas soportados | no disponible (el conjunto de calibracion cubre 30 idiomas, sin lista publica) |
| Licencia | minimax-community (declarada como `license: other`) |
| Formato de pesos | GGUF, dividido en partes de hasta 45 GB; encoder de vision en GGUF `mmproj-MiniMax-M3.1-Flash-F16.gguf` (1,7 GB) |
| Tamano del repositorio | 1359,0 GB |
| Precedencia del checkpoint | Copia BF16 del checkpoint original MXFP8/NVFP4 de MiniMax |
| Libreria / runtime | `gguf`, `llama.cpp` (sin parches de runtime) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 426B parametros almacenados y aproximadamente 23B activos por token, lo que explica que el autor describa el modelo como "necesita mucha memoria pero corre rapido para su tamano". La innovacion arquitectonica destacada es MiniMax Sparse Attention, que en llama.cpp solo se activa con flash attention habilitada (`-fa on`) y sin `--kv-unified`; en caso contrario el runtime cae a atencion densa y emite un aviso. El modo de razonamiento es dinamico: el modelo decide cuando pensar y la profundidad se controla con `--chat-template-kwargs '{"reasoning_effort":"high"}'`, con cinco niveles disponibles (`low`, `medium`, `high`, `xhigh`, `max`). La muestreo recomendado por MiniMax es `--temp 1.0 --top-p 0.95`.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base. Lo que si documenta el cuantizador es el proceso de compresion: los ficheros AD se generan con una importance matrix calculada sobre el propio formato de chat de M3.1 Flash (datos agenticos, codigo, razonamiento y 30 idiomas), que guia el redondeo; la matriz se calculo sobre una mitad del conjunto de calibracion y la evaluacion se hizo sobre la otra mitad, con contexto de 4096 tokens. La referencia de calidad es un Q8_0 generado a partir de la copia BF16 del checkpoint MXFP8/NVFP4 original, porque el BF16 completo no cabe en la maquina de medida.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat incluida en cada fichero GGUF (se aplica con `--jinja`).
- Razonamiento configurable en cinco niveles de esfuerzo (`low`, `medium`, `high`, `xhigh`, `max`), con decision autonoma de cuando activar el modo pensamiento.
- Tool calling y respuestas en formato JSON: la model card incluye una comprobacion especifica de llamada a herramienta y otra de respuesta JSON.
- Entrada de imagenes (pipeline `image-text-to-text`) mediante el encoder de vision `mmproj-MiniMax-M3.1-Flash-F16.gguf`.
- Capacidades agenticas y de razonamiento multi-paso, segun la composicion del conjunto de calibracion empleado por el cuantizador (datos agenticos y de codigo).
- Generacion de codigo, coherente con el uso de datos de codigo en la calibracion; no se publican resultados de HumanEval ni similares.
- Multilinguee: la calibracion cubre 30 idiomas y una de las comprobaciones de chat es una respuesta en ruso; no hay lista oficial de idiomas.
- Aritmetica basica verificada en las comprobaciones de chat a bajo esfuerzo de razonamiento.

## Casos de uso

- Asistente de codigo en local para equipos con estaciones de trabajo grandes: con 32k de contexto y soporte de tool calling, el modelo puede mantener sesiones de refactorizacion sobre varios ficheros sin enviar codigo a un proveedor externo, siempre que se disponga de 128 GB o mas de memoria.
- Agente autonomo con acceso a herramientas: el modo de razonamiento por niveles permite usar `low` para tareas de enrutamiento y `high` o `max` para planificacion multi-paso, ajustando coste y latencia por peticion.
- Procesamiento de documentos con imagenes: capturas, diagramas o formularios pueden enviarse al encoder de vision junto con instrucciones de extraccion en JSON, con la salvedad de que no se publican metricas de calidad del encoder.
- Backend de chat privado on-premise: al ejecutarse con llama.cpp y no requerir runtime propietario, encaja en entornos con requisitos de soberania del dato, aceptando el coste de memoria de 104,5 GiB en adelante.
- Analisis de repositorios y datos en varios idiomas: la calibracion sobre 30 idiomas sugiere cobertura multilinguee amplia, util para clasificacion y resumen de contenido no anglofono, aunque no haya lista oficial de idiomas.
- Despliegue en hardware especializado tipo DGX Spark o Mac de 128 GB: el fichero AD-IQ2_XXS es el unico que cabe en esa clase de maquina, adecuado para prototipado e inferencia de baja concurrencia.
- Servicio de inferencia por lotes en nodos de 384 GB o multi-GPU: con AD-Q4_K el modelo ofrece la mayor fidelidad de la familia AD y puede atender varias peticiones concurrentes si se reserva memoria adicional para la cache de atencion (4,5 GB a 32k).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K ni equivalentes). Lo que si publica el autor son metricas de fidelidad de cuantizacion frente a Q8_0, medidas con llama.cpp `f5027fb21307`, a 4096 tokens de contexto, sobre texto reservado en el formato de chat del modelo:

| Fichero | Tamano en disco | Mean KLD | Top-1 agreement | Comprobaciones de chat |
|---|---:|---:|---:|---:|
| `Q4_K_M` (stock del dia de lanzamiento, reemplazado) | 258,0 GB | 0,9548 | 75,2% | no medida |
| `AD-Q4_K` | 257,2 GB | 0,7884 | 78,6% | 4/4 |
| `AD-IQ3_S` | 208,9 GB | 0,8916 | 75,9% | 4/4 |
| `Q3_K_M` (stock, reemplazado) | 203,5 GB | 1,1442 | 70,9% | 4/4 |
| `AD-Q2_K` | 161,6 GB | 1,1346 | 71,1% | 4/4 |
| `Q2_K` (stock, reemplazado) | 155,9 GB | 1,6387 | 62,0% | no medida |
| `AD-IQ2_XXS` | 112,2 GB | 1,8437 | 59,8% | 4/4 |

Las comprobaciones de chat consisten en una llamada a herramienta, una respuesta en ruso, una respuesta JSON y aritmetica con esfuerzo de razonamiento bajo, usando el muestreo de MiniMax. El propio autor advierte de que estos niveles de KLD estan lejos de lo habitual en otros modelos con los mismos tamanos (incluso los ficheros de 4 bits coinciden con el token de referencia unas tres veces de cada cuatro) y apunta como posibles causas a expertos entrenados para FP4 y a la atencion dispersa; recomienda comparar los ficheros entre si y no con las tarjetas de otros modelos. Tampoco se publica perplejidad: el autor indica que en texto plano la perplejidad de este modelo de chat es erratico y sale mas baja en los ficheros pequenos, por lo que no informa de su calidad.

## Requisitos de hardware

- Memoria para el modelo (en GiB, tal como la reportan GPU y macOS): AD-IQ2_XXS 104,5 GiB; AD-Q2_K 150,5 GiB; AD-IQ3_S 194,6 GiB; AD-Q4_K 239,5 GiB.
- Cache de atencion: aproximadamente 0,14 MB por token, es decir 1,1 GB a 8k de contexto y 4,5 GB a 32k.
- Perfiles de maquina indicados por el autor: 128 GB (AD-IQ2_XXS, con el limite de GPU de macOS elevado, contexto de hasta unos 32k, DGX Spark o PC de 128 GB de RAM con GPU); 192 GB (AD-Q2_K); 256 GB (AD-IQ3_S); 384 GB o varias GPU (AD-Q4_K).
- GPU de consumo: no cabe. El fichero mas pequeno necesita 104,5 GiB, muy por encima de los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090. No se han documentado configuraciones validas con GPU de consumo.
- Multi-GPU: el autor solo menciona "varias GPU" para el nivel Q4_K, sin especificar numero ni modelo (A100, H100 u otros).
- macOS: es necesario elevar el limite de memoria cableada de la GPU antes de cargar, por ejemplo `sudo sysctl iogpu.wired_limit_mb=245000` en una maquina de 256 GB (se reinicia tras reiniciar el sistema).
- Despliegue: `llama-server` de llama.cpp, con `-ngl 99 -c 32768 -fa on --jinja`, o directamente desde el hub con `llama-server -hf AtomicChat/MiniMax-M3.1-Flash-GGUF:AD-IQ3_S`. Los ficheros se dividen en partes de hasta 45 GB y basta con apuntar a la primera.
- Vision: anadir `--mmproj mmproj-MiniMax-M3.1-Flash-F16.gguf` (1,7 GB).
- Obligatorio para el modo disperso: flash attention activada y sin `--kv-unified`; de lo contrario el runtime usa atencion densa, avisa y el consumo de memoria crece.
- vLLM, TGI u Ollama: no documentados en la informacion disponible. Al ser un GGUF con arquitectura `minimax-m3`, la via soportada explicitamente es llama.cpp y las aplicaciones construidas sobre el (Atomic Chat).
- Latencia y throughput: no disponibles. El autor solo indica cualitativamente que el modelo "corre rapido para su tamano" gracias a los 23B parametros activos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificables de otras familias de modelos comparables, por lo que la comparacion se limita a las variantes del mismo modelo base publicadas en este repositorio y a los cuantizados estandar que reemplazan:

| Variante | Parametros | Contexto | Calidad (Mean KLD / Top-1) | Memoria | Licencia |
|---|---|---|---|---|---|
| AD-Q4_K | 426B totales, ~23B activos | no disponible | 0,7884 / 78,6% | 239,5 GiB | minimax-community |
| AD-IQ3_S | 426B totales, ~23B activos | no disponible | 0,8916 / 75,9% | 194,6 GiB | minimax-community |
| AD-Q2_K | 426B totales, ~23B activos | no disponible | 1,1346 / 71,1% | 150,5 GiB | minimax-community |
| AD-IQ2_XXS | 426B totales, ~23B activos | no disponible | 1,8437 / 59,8% | 104,5 GiB | minimax-community |
| Q4_K_M stock (reemplazado) | 426B totales, ~23B activos | no disponible | 0,9548 / 75,2% | 258,0 GB en disco | minimax-community |

Otras distribuciones del mismo modelo base citadas en la busqueda web, sin datos tecnicos verificados en la informacion disponible: `unsloth/MiniMax-M3.1-Flash`, `mlx-community/MiniMax-M3.1-Flash-Text-4bit` y `Mia-AiLab/MiniMax-M3.1-Flash-EXL3-EAQ-v1-3.06-bpw`. Para comparaciones con modelos de otras familias (por parametros, contexto o rendimiento) el dato es: no disponible.

## Limitaciones y advertencias

- Fidelidad de cuantizacion baja en terminos absolutos: incluso AD-Q4_K coincide con el token de referencia de Q8_0 solo el 78,6% de las veces, y AD-IQ2_XXS baja al 59,8%. El autor reconoce que estos valores estan lejos de lo que muestran otros modelos en los mismos tamanos y que investiga la causa (expertos entrenados para FP4, atencion dispersa).
- La referencia de calidad es Q8_0 y no BF16, porque el BF16 no cabe en la maquina de medida; el propio autor senala que esto hace que el KLD del resto de ficheros se lea ligeramente a la baja.
- Los ficheros de 2 bits (AD-IQ2_XXS, AD-Q2_K) son los unicos viables en maquinas de 128-192 GB, pero son precisamente los de peor fidelidad: no son adecuados para tareas que dependan de matices, formato estricto o codigo sensible a tokens exactos sin validacion adicional.
- No se publica perplejidad porque, segun el autor, resulta erratica en este modelo de chat; tampoco hay benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Es un modelo de chat con modo de razonamiento; la ausencia de datos de evaluacion impide acotar la tasa.
- Idiomas: no hay lista oficial. Solo consta que la calibracion cubre 30 idiomas y que una comprobacion de chat se hizo en ruso; el rendimiento fuera de los idiomas principales de MiniMax no esta verificado.
- Longitud maxima de contexto: no declarada en la informacion disponible. Los ejemplos de la model card llegan a 32k y la cache de atencion crece a 0,14 MB por token.
- Atencion dispersa condicionada: sin `-fa on` y sin `--kv-unified`, llama.cpp cae a atencion densa con el consiguiente aumento de memoria y degradacion del rendimiento.
- Vision: el encoder `mmproj` se distribuye en F16 (1,7 GB) pero no se detallan en la informacion disponible pruebas de calidad de la conversion.
- Licencia `minimax-community` (declarada como `license: other`): es una licencia especifica del fabricante, no una licencia open source estandar. Antes de uso comercial hay que revisar el fichero LICENSE del repositorio; las condiciones concretas no estan disponibles en la informacion proporcionada.
- Repositorio muy reciente (creado el 23 de octubre de 2026) y con 2 likes y 0 descargas en el momento de la consulta: hay poca validacion externa independiente.
- Repositorio de 1359 GB: la descarga selectiva por subcarpeta (`--include "AD-IQ3_S/*"`) es practicamente obligatoria.
- Las variantes stock Q2_K, Q3_K_M y Q4_K_M publicadas el dia del lanzamiento fueron reemplazadas por los ficheros AD; conviene no mezclar ambos conjuntos en un mismo despliegue.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/AtomicChat/MiniMax-M3.1-Flash-GGUF
- Arbol de ficheros del repositorio: https://huggingface.co/AtomicChat/MiniMax-M3.1-Flash-GGUF/tree/main
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Otras cuantizaciones del modelo base en Hugging Face: https://huggingface.co/models?other=base_model%3Aquantized%3AMiniMaxAI%2FMiniMax-M3.1-Flash
- Analisis del modelo base como agente (blog de Atomic Agent): https://atomicagent.io/blog/minimax-m3-1-flash/
- Aplicacion Atomic Chat, cliente basado en llama.cpp: https://atomic.chat/
- Catalogo de modelos de Atomic Chat: https://atomic.chat/models
- Repositorio de Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Comunidad en Discord: https://discord.gg/8wGSsvmg4V
- Licencia del modelo (referenciada como LICENSE en el repositorio): https://huggingface.co/AtomicChat/MiniMax-M3.1-Flash-GGUF/blob/main/LICENSE

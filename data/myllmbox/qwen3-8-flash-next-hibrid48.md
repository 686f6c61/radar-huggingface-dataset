# myllmbox/Qwen3.8-Flash-Next-hibrid48

## Resumen

Qwen3.8-Flash-Next-hibrid48 es una variante cuantizada del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario myllmbox. No es un modelo entrenado desde cero ni un ajuste fino: es un checkpoint de inferencia optimizado cuyo único cambio respecto a la revision anterior (hibrid47) es el almacenamiento de la cabeza de salida (`lm_head`) en NVFP4 W4A16 en lugar de bf16. El resto de tensores del cuerpo, la tabla PLE y el drafter MTP se mantienen identicos a los de hibrid47.

El modelo totaliza 94.587.665.299 parametros y un repositorio de 105,3 GB, con una ventana de contexto de 262.144 tokens. Su relevancia practica es de ingenieria: la cabeza de salida en bf16 consumia el 27 % de cada paso de decodificacion (una matriz de 1,18 GiB que la decodificacion especulativa lee unas 5,4 veces por paso), y al comprimirla a NVFP4 (0,33 GiB) el autor reporta un aumento del 30 % en pasos de motor por segundo y de 74-76 a 92 tokens/s en un solo flujo sobre codigo.

Esta pensado para despliegue en nodos con aceleradores Blackwell/NVFP4 (concretamente dos DGX Spark GB10 en TP=2 sobre RDMA) mediante vLLM 0.29 con parches propios. No es un checkpoint para uso general en GPU de consumo ni para formatos GGUF, y su licencia es la Qwen Community License 1.0, no una licencia permisiva estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion QSA, proyecciones de atencion lineal GDN, expertos enrutados y compartidos (MoE), mezcladores hyper-connection, drafter MTP y tabla PLE de n-gramas |
| Parametros totales | 94.587.665.299 (~94,6 B) |
| Parametros activos | no disponible (el modelo usa expertos enrutados, pero la model card no indica el recuento de parametros activos) |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | NVFP4 W4A4 (expertos enrutados), NVFP4 W4A16 con kernel Marlin y grupo 16 (proyecciones GDN y `lm_head`), bf16 (atencion QSA q/k/v/o, expertos compartidos, embeddings, normas, mezcladores), NVFP4 para la tabla PLE; KV en bf16 por defecto y fp8 KV disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other`) |
| Formato de pesos | safetensors (21 shards de cuerpo + `model-lmhead-nvfp4.safetensors` + 8 shards de tabla PLE + indice) |
| Tamano del repositorio | 105,3 GB |
| Modelo base | Qwen/Qwen3.8-Flash-Next (relacion: quantized) |
| Fecha de publicacion | 13 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado por el autor de esta publicacion, sino de una requantizacion del checkpoint Qwen/Qwen3.8-Flash-Next. Por tanto, no hay informacion disponible en la model card sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (RLHF, DPO u otras) del modelo original. Lo que si se documenta es el mapa de precision aplicado sobre el checkpoint: los expertos enrutados (tanto del cuerpo como del drafter MTP) provienen de Inferact/Qwen3.8-Flash-Next-NVFP4 en NVFP4 W4A4 y representan el 39 % del checkpoint; las proyecciones de atencion lineal GDN pasan a NVFP4 W4A16 con kernel Marlin, validadas mediante A/B; y el resto de componentes de calidad (atencion QSA q/k/v/o, expertos compartidos, embeddings, normas y mezcladores hyper-connection) permanecen en bf16.

La innovacion concreta de esta revision es el tensor `lm_head`: se almacena como NVFP4 W4A16 con codigos e2m1, una escala fp8 por cada 16 valores y una escala global fp32, con un tamano final de 0,33 GiB frente a los 1,18 GiB del original, y se deja que el kernel Marlin lo descomprima en registro. El drafter MTP comparte esa misma cabeza. La tabla PLE de n-gramas (320.001.536 x 160) se mantiene en NVFP4, 28,6 GiB repartidos en 8 shards. El proceso de cuantizacion es reproducible mediante `builds/qwen38-flash-next/quantize-lm-head.py`: una pasada para el amax global, cuantizacion por bloques de filas con redondeo de codigos contra la escala efectiva ya redondeada a fp8, reescritura del shard sin la cabeza y verificacion de que todos los tensores indexados son resolubles (13 s en un DGX Spark).

La decodificacion especulativa es MTP con K=4. Se reporta una tasa de aceptacion de borradores de 4,2-4,4 en codigo denso (hasta 4,9 de los 5 posibles) y en torno a 3 en prosa de razonamiento. El KV en bf16 con un limite de 28 GB permite 1.708.119 tokens (6,5 veces la ventana de 262k); el KV en fp8 arranca con 2.846.834 tokens pero costo 0,3 tokens aceptados por paso en un A/B de 5+5 ejecuciones (4,23 -> 3,92), por lo que el valor por defecto es bf16.

## Capacidades

- Generacion de texto y razonamiento en modo thinking (la model card describe ejecuciones de razonamiento seguidas de codigo de hasta 38k tokens).
- Generacion de codigo: HumanEval pass@1 de 95,7 sobre el conjunto completo (164 problemas).
- Razonamiento matematico: GSM8K con 98,0 sobre un subconjunto fijo de 200 preguntas.
- Seguimiento de instrucciones: IFEval con 91,5 en prompt-strict y 93,4 en instruction-strict.
- Conocimiento general y razonamiento multi-materia: MMLU-Pro con 84,9 sobre 200 preguntas de 14 asignaturas.
- Produccion de escenas/rosters estructurados: en el "render gauntlet" de 32 escenas con thinking activado, genero rosters completos en 8 de 8 renderizados.
- Decodificacion especulativa integrada mediante drafter MTP (K=4), lo que acelera la generacion autoregresiva.
- Servicio compatible con OpenAI a traves de vLLM, lo que habilita `lm-evaluation-harness` y otros clientes estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada explicitamente, mas alla del modo thinking y de la generacion de estructuras.
- Capacidades de vision o audio: no disponible.
- Cobertura multilingue: no disponible (la model card no enumera idiomas).

## Casos de uso

- Servicio de generacion de codigo en produccion: con 92 tokens/s en un solo flujo sobre prompts de codigo y 546 tokens/s a 32 flujos concurrentes, el modelo esta dimensionado para servir a varios desarrolladores simultaneamente desde dos nodos DGX Spark, integrado tras una API compatible con OpenAI.
- Asistente de razonamiento con ventanas largas: la ventana de 262.144 tokens permite introducir repositorios completos, actas o documentacion extensa sin trocear; el KV en bf16 admite hasta 1.708.119 tokens con 28 GB de pin, lo que deja margen para varias sesiones largas.
- Generacion de codigo verificable en pipelines de CI: se puede invocar el endpoint para completar funciones y tests a partir de un checklist de 1,2k tokens (el "pasture prompt" de la model card) y validar la salida con el harness incluido en el repositorio del autor.
- Evaluacion comparativa de cuantizaciones: util para equipos que necesitan medir el impacto real de comprimir la cabeza de salida, porque el mismo modelo base esta publicado en variantes con cabeza bf16 y NVFP4 y el andamiaje de benchmarks (`bench/quality/`) es reproducible contra cualquier servidor compatible con OpenAI.
- Procesamiento por lotes de documentos tecnicos: el prefill de 2,5-2,7k tokens/s permite tragar prompts largos (un prompt de 32k tokens tarda 12 s en frio) y despues decodificar de forma sostenida, lo que encaja en tareas de resumen y extraccion sobre corpus grandes.
- Razonamiento matematico asistido: con GSM8K en 98,0 sobre subconjunto fijo, es utilizable en entornos de tutoria o validacion de problemas aritmeticos donde se requiere el modo thinking.
- Generacion estructurada de contenido con formato: la capacidad demostrada de producir rosters completos en 8 de 8 escenas sugiere su uso en generacion de datos estructurados y plantillas complejas que deben ser sintacticamente validas.
- Banco de pruebas para despliegue multi-nodo en hardware de escritorio: sirve como referencia para equipos que quieren medir TP=2 sobre ConnectX RDMA con GB10 antes de escalar a configuraciones mayores.

## Benchmarks y rendimiento

Datos de calidad declarados por el autor, medidos con `lm-evaluation-harness` contra el servidor en ejecucion, con thinking activado, muestreo de Qwen en modo thinking (0,6 / 0,95 / 20), subconjuntos fijos de 200 preguntas (semilla 123123123; HumanEval completo) y presupuesto de 32k tokens. 11 de 763 respuestas agotaron el presupuesto de 32k tokens (fugas de razonamiento) y se contabilizan como erroneas.

| Tarea | hibrid48 | hibrid47 | Base Qwen3.8-Flash-Next (bf16) |
|---|---|---|---|
| HumanEval pass@1 (164) | 95,7 | no disponible (A/B pendiente) | no disponible |
| GSM8K (200) | 98,0 | no disponible | no disponible |
| IFEval prompt-strict / instruction-strict (200) | 91,5 / 93,4 | no disponible | no disponible |
| MMLU-Pro (200, 14 asignaturas) | 84,9 | no disponible | no disponible |

Rendimiento de inferencia medido en 2 x DGX Spark GB10 con TP=2 sobre RDMA ConnectX, vLLM 0.29, MTP K=4, MoE con Marlin y KV en bf16. Cada fila promedia ventanas estables de 10 s sobre 4-5 ejecuciones independientes.

| Escenario | Pasos/s | Tokens/s (media) | Pico | Aceptacion | Primer token |
|---|---|---|---|---|---|
| c=1, thinking off | 22,1 | 92 (86-97) | 100 | 4,2-4,4 | 0,57 s |
| c=1, thinking on (razonamiento -> codigo, 38k tokens) | 22,0 | 79 (75-79) | 107 | 3,4-3,6 (prosa ~3, codigo ~4,9) | no disponible |
| c=32, thinking off | 4,1 | 546 (534-561) | 561 | 4,2 | no disponible |
| Prefill | no disponible | 2,5-2,7k tokens/s | no disponible | no disponible | 12 s en frio con prompt de 32k |

Comparativa directa con la revision previa sobre la misma imagen y el mismo hardware:

| Metrica | hibrid47 | hibrid48 |
|---|---|---|
| Pasos de motor/s, c=1 | 16,9 | 22,0 (+30 %) |
| Tokens/s, c=1, codigo, thinking off | 74-76 | 92 (86-97) |
| Tokens/s, c=1, pico en ventana de 10 s (thinking on, codigo) | 80 | 107 |
| Tokens/s, 32 flujos | 533 | 546 |
| Aceptacion de borradores (prompt de codigo) | 4,1-4,3 | 4,2-4,4 |

El paso de motor se mantiene plano en 45-46 ms desde el primer token hasta el ultimo, de modo que el caudal efectivo depende del contenido: la prosa de razonamiento acepta unos 3 borradores por paso y el codigo denso unos 4,9 de los 5 posibles.

## Requisitos de hardware

- Dos DGX Spark GB10 en TP=2 sobre RDMA ConnectX es la configuracion de referencia, con aproximadamente 50 GiB por nodo una vez repartida la tabla PLE entre la pareja.
- Un solo DGX Spark puede cargar el modelo (unos 101 GiB), pero deja demasiado poco espacio para el KV; para un unico Spark el autor indica que la version adecuada es hibrid46.
- GPU de consumo (RTX 4090 y similares): no cabe. El repositorio ocupa 105,3 GB y el modelo tiene 94,6 B de parametros; no hay datos de despliegue en este tipo de hardware.
- Despliegue con vLLM 0.29 obligatoriamente parcheado: vLLM 0.29 construye la cabeza de salida sin la configuracion de cuantizacion del checkpoint, por lo que una version estandar falla con un error de forma de tensor (`size of tensor a (2560) must match (1280)`). El arreglo consiste en pasar `quant_config` a `ParallelLMHead` en `model.py` y `mtp.py` del modelo, y se distribuye como `recipes/qwen38-flash-next-fast/docker/patches/11-lm-head-quant-config.py` en el repositorio myllmbox-runner. Alternativa: servir hibrid47 (cabeza en bf16) con vLLM estandar.
- Formatos alternativos: no hay soporte declarado para llama.cpp, Ollama, TGI ni GGUF; las dependencias son especificas de NVFP4, Marlin y vLLM.
- Memoria de KV: con KV en bf16 y un pin de 28 GB, 1.708.119 tokens; con KV en fp8, 2.846.834 tokens pero con perdida de 0,3 tokens aceptados por paso.
- Throughput medido: 92 tokens/s en un flujo (pico 107), 546 tokens/s a 32 flujos, prefill de 2,5-2,7k tokens/s, primer token en 0,57 s y 12 s para un prompt de 32k tokens en frio.
- Procedimiento de despliegue documentado: `git clone` de myllmbox-runner, `./download.sh`, `./build-and-copy.sh qwen38-flash-next-fast` (imagen con los parches de la lane, incluido el arreglo de `lm_head`) y `./run.sh` para el servicio TP=2 en el puerto 8000.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Rendimiento declarado | Disponibilidad |
|---|---|---|---|---|---|---|
| myllmbox/Qwen3.8-Flash-Next-hibrid48 | 94,6 B | 262.144 | NVFP4 W4A4/A16 + bf16 en el cuerpo; cabeza NVFP4 W4A16 | qwen-community-license-1.0 | 22,0 pasos/s, 92 tokens/s c=1, 546 tokens/s c=32; HumanEval 95,7; GSM8K 98,0; MMLU-Pro 84,9 | HuggingFace; requiere vLLM parcheado |
| myllmbox/Qwen3.8-Flash-Next-hibrid47 | 94,6 B (mismo cuerpo) | 262.144 | Mismo mapa salvo la cabeza, en bf16 | qwen-community-license-1.0 | 16,9 pasos/s, 74-76 tokens/s c=1, 533 tokens/s c=32; calidad A/B pendiente | HuggingFace; funciona con vLLM 0.29 estandar |
| myllmbox/Qwen3.8-Flash-Next-hibrid46 | no disponible en la informacion | no disponible | no disponible | qwen-community-license-1.0 (presumiblemente la misma familia) | no disponible | Indicada como la version para un unico DGX Spark |
| Inferact/Qwen3.8-Flash-Next-NVFP4 | no disponible | no disponible | NVFP4 W4A4 (origen de los expertos enrutados de esta publicacion) | no disponible | no disponible | HuggingFace; usada como fuente de tensores |
| Qwen/Qwen3.8-Flash-Next (base) | 94,6 B (mismo recuento en el safetensors de este repo) | 262.144 | bf16 | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- La cabeza de salida cuantizada introduce un error medio absoluto de peso (|Delta w|) del 9,0 % respecto a |w|. Es una degradacion de precision real y el A/B de calidad frente a la cabeza bf16 (hibrid47) estaba pendiente en el momento de publicar la model card: las puntuaciones de la seccion de benchmarks corresponden a este checkpoint, no a un delta medido.
- Segun el propio autor, el modelo todavia no debe considerarse validado frente a la version con cabeza bf16; el uso en produccion critica deberia ir precedido de una comparacion propia.
- Dependencia de un parche no upstream: con vLLM 0.29 estandar el checkpoint no arranca. El despliegue obliga a usar la imagen del repositorio myllmbox-runner o a aplicar el parche manualmente en `model.py` y `mtp.py`.
- Riesgo de fugas de razonamiento: 11 de 763 respuestas agotaron el presupuesto de 32k tokens en las pruebas de calidad y se contabilizaron como erroneas; en modo thinking conviene acotar el presupuesto de tokens o aplicar timeouts.
- La licencia es `other` / qwen-community-license-1.0, no una licencia de codigo abierto permisiva. Es imprescindible revisar el texto completo en el fichero LICENSE del repositorio antes de cualquier uso comercial, ya que este tipo de licencia suele incluir condiciones de atribucion y restricciones de uso.
- No hay informacion disponible sobre idiomas soportados, sesgos conocidos ni comportamiento fuera del ingles tecnico evaluado.
- Requisitos de hardware muy restrictivos: dos aceleradores GB10 con RDMA, o un unico nodo con unos 101 GiB de carga que deja un margen de KV insuficiente. No hay ruta documentada para GPU de consumo ni para formatos GGUF.
- Modelo sin traccion en el momento del registro (0 descargas y 0 likes), lo que reduce la probabilidad de que otros usuarios hayan validado la reproducibilidad de los numeros.
- Esta ficha se basa exclusivamente en la model card del autor; no se ha encontrado documentacion independiente ni resultados de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/myllmbox/Qwen3.8-Flash-Next-hibrid48
- Repositorio de herramientas y recetas: https://github.com/bilikaz/myllmbox-runner
- Receta de despliegue y parches (incluye el arreglo de `lm_head`): https://github.com/bilikaz/myllmbox-runner/tree/main/recipes/qwen38-flash-next-fast
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantizacion NVFP4 de origen de los expertos enrutados: https://huggingface.co/Inferact/Qwen3.8-Flash-Next-NVFP4
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las busquedas devolvieron unicamente contenido no relacionado con el modelo

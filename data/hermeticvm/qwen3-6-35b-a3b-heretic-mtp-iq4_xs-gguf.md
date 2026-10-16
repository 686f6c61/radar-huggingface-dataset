# hermeticvm/Qwen3.6-35B-A3B-heretic-MTP-IQ4_XS-GGUF

## Resumen

Qwen3.6-35B-A3B-heretic-MTP-IQ4_XS-GGUF es una cuantizacion en formato GGUF del modelo llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved, que a su vez es una version con los rechazos reducidos (abliterated) del Qwen/Qwen3.6-35B-A3B original del equipo Qwen. La publica el usuario hermeticvm y su proposito es doble: por un lado, eliminar la mayor parte de las negativas del modelo base mediante una ablacion ortogonal con preservacion de magnitud (Heretic v1.3.0); por otro, ofrecer una cuantizacion de 4,32 bits por peso que permite ejecutar un MoE de 35.500 millones de parametros en tarjetas graficas de 12 GB de VRAM, dejando parte de los expertos en la RAM del sistema.

Arquitectonicamente se trata de un transformer con mezcla de expertos (Qwen3.5-MoE) de 35.505.251.456 parametros totales y unos 3.000 millones activos por token, con 256 expertos por capa. Mantiene la ventana de contexto nativa de 262.144 tokens (probada por el autor a 131.072) y conserva los 20 tensores de prediccion multi-token (MTP) del bloque `blk.40`, aunque el propio autor advierte de que no los ha validado.

Su relevancia ahora es pragmatica: demuestra que un MoE de 35B con contexto de 262k puede correr a unos 29 tokens/s en una GPU de gama media de 12 GB (AMD Radeon RX 6700 XT, ROCm), con 1,9 GB de VRAM libre a 128k de contexto. El coste es que se trata de un modelo sin censura, con implicaciones legales y de seguridad que el usuario asume.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.5-MoE), 256 expertos por capa |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3.000 millones (aproximadamente 3B, segun model card) |
| Longitud de contexto | 262.144 tokens nativos; probado a 131.072 |
| Tipos de cuantizacion | IQ4_XS (4,32 bits por peso, 19.179.525.504 bytes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (un unico fichero: `Qwen3.6-35B-A3B-heretic-MTP-IQ4_XS.gguf`) |
| SHA-256 | `9985dd184a5c28f1014bce4a293a798ad9ed693d9bfa1ec6189782c2768efa72` |
| Tamano del repositorio | 19,2 GB |
| Modelo base | llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved |
| Herramienta de cuantizacion | `llama-quantize` de llama.cpp b11541 |
| Matriz de importancia | bartowski/Qwen_Qwen3.6-35B-A3B-GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5-MoE: un transformer con capa de mezcla de expertos en la que cada capa contiene 256 expertos y solo se activa una fraccion reducida de ellos por token, lo que da lugar a 35.500 millones de parametros almacenados pero unos 3.000 millones de parametros computados por token. Esa relacion de espaldas de activacion es lo que hace viable la inferencia en hardware de gama media cuando parte de los expertos se descarga a RAM. La ventana de contexto nativa es de 262.144 tokens y el autor la ha probado a 131.072 con cache KV cuantizada en q8_0.

Sobre el entrenamiento original (numero de tokens, composicion del dataset, fases de RLHF o DPO) no hay informacion en la documentacion proporcionada. Lo que si se documenta es el post-procesado: el modelo base sin censura se genero con Heretic v1.3.0, una variante de ablacion ortogonal con preservacion de magnitud que modifica los pesos para reducir la probabilidad de rechazo; el autor del GGUF cita una divergencia KL de 0,0015 respecto al Qwen3.6 original. La cuantizacion se hizo con `llama-quantize` (tipo IQ4_XS) usando una importancia matrix calculada por bartowski sobre el Qwen3.6-35B-A3B original, que se reutiliza porque la ablacion altera los pesos solo ligeramente. Los tensores MTP de `blk.40` no tienen entradas en esa matriz y se cuantizaron sin ponderacion por importancia.

## Capacidades

- Generacion de texto conversacional en formato instruct, con soporte de plantilla Jinja (`--jinja`).
- Tool calling y function calling: el autor reporta 21/21 aciertos en 7 casos repetidos 3 veces con llama-server.
- Generacion y edicion de codigo: 12/12 tareas pequenas con tests unitarios ocultos, con una media de 63 segundos por tarea.
- Refactorizacion multifichero dentro de agentes de programacion: 3 de 3 ejecuciones completamente correctas en la prueba del autor.
- Modo de razonamiento controlable mediante `--reasoning-budget` (2048 en la configuracion de ejemplo) y desactivable para pruebas de rechazo.
- Prediccion multi-token (MTP): los 20 tensores del bloque `blk.40` estan presentes, pero el autor indica que no los ha probado.
- Decodificacion especulativa mediante `--spec-type draft-mtp` o `--spec-type ngram-mod`.
- Contexto largo: ventana nativa de 262.144 tokens, con prueba a 131.072.
- Capacidades multilingues: no disponible en la documentacion.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistentes conversacionales autoalojados con contexto largo: con 262.144 tokens nativos se pueden mantener historiales extensos, documentacion tecnica completa o bases de conocimiento enteras dentro de la ventana sin recurrir a recuperacion externa.
- Agentes de programacion sobre repositorios medianos: el modelo ha superado pruebas de refactorizacion multifichero con verificaciones, y su soporte de tool calling permite encadenar lectura, edicion y ejecucion de tests.
- Generacion de codigo en pipelines de integracion continua: 12/12 en tareas pequenas con tests ocultos y 63 segundos de media lo hacen util para validar parches o generar pruebas, siempre con supervision humana dado el estado de cuantizacion de 4 bits.
- Despliegue en equipos de desarrollo con una sola GPU de 12 GB: es uno de los pocos MoE de 35B ejecutables en una RX 6700 XT o equivalente, descargando expertos a RAM con `--n-cpu-moe`.
- Procesamiento de documentos legales, medicos o tecnicos extensos: la combinacion de 131k-262k de contexto y un modelo que no declina peticiones permite resumir, extraer y clasificar corpus largos sin fragmentacion agresiva.
- Investigacion sobre alineacion y seguridad: la comparativa de rechazos (17/100 frente a 99/100 de frase en el modelo original) lo convierte en un objeto de estudio util para medir el efecto de la ablacion sobre el comportamiento.
- Laboratorio de evaluacion de tecnicas de decodificacion: los tensores MTP y la compatibilidad con decodificacion especulativa ngram permiten experimentar con aceleracion de inferencia en llama.cpp.
- Prototipado de aplicaciones que requieren contenido sin filtros editoriales (ficcion adulta, guiones, red teaming de sistemas de moderacion), asumiendo las advertencias legales de la seccion correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona unicamente pruebas privadas comparativas entre dos cuantizaciones del mismo modelo, medidas en un AMD Radeon RX 6700 XT (12 GB, ROCm), Ryzen 5 5600X, 32 GB DDR4, llama.cpp b11541 sobre llama-swap. El propio autor advierte que sirven para comparar compilaciones en una misma maquina, no como benchmarks generales.

| Prueba | Este fichero (IQ4_XS, 19,2 GB) | Mismo modelo heretic en Q4_K_M (21,2 GB) |
|---|---|---|
| Tool calling, 7 casos x 3 | 21/21 | 21/21 |
| Tareas de codigo pequenas con tests ocultos | 12/12, media 63 s | 11/12, media 89 s |
| Refactorizacion multifichero con agente (7 comprobaciones) | 3 de 3 ejecuciones correctas | 3 de 4 |
| VRAM libre a 128k de contexto | 1,9 GB (`--n-cpu-moe 26`) | 0,4 GB (`--n-cpu-moe 25`) |
| Generacion | ~29 tokens/s | ~28 tokens/s |

Pruebas de rechazo (100 primeros prompts de `mlabonne/harmful_behaviors`, 33 frases de rechazo de Heretic, limite de 100 tokens, system prompt "You are a helpful assistant.", temperatura 0, razonamiento desactivado):

| Metrica | Qwen3.6-35B-A3B original (Unsloth UD-IQ4_XS) | Este fichero |
|---|---|---|
| Recuento de frases de rechazo | 99/100 | 17/100 |
| Respuestas que comienzan con un rechazo | 99/100 | 2/100 |

De las 17 coincidencias de este fichero, 15 son respuestas que acceden a la peticion pero contienen las palabras "disclaimer" o "illegal" mas adelante, y el emparejamiento por palabra clave de Heretic las contabiliza igualmente.

## Requisitos de hardware

- Pesos en disco y en memoria: 19.179.525.504 bytes (19,2 GB), equivalentes a 4,32 bits por peso.
- VRAM recomendada: 12 GB, con parte de los expertos en RAM del sistema mediante `--n-cpu-moe`. El autor usó `--n-cpu-moe 26` para dejar 1,9 GB libres a 128k de contexto.
- Si cabe en GPU de consumo: si, pero no entero. La configuracion probada es una AMD Radeon RX 6700 XT de 12 GB con 32 GB de DDR4. Cuanto mas bajo sea `--n-cpu-moe`, mas expertos van a la GPU y mas rapida es la generacion.
- Advertencia de VRAM: mantener al menos ~500 MiB libres; en RDNA2, sobrepasar la VRAM puede bloquear el driver amdgpu en lugar de fallar de forma controlada.
- GPU de datacenter (A100, H100): no se han publicado mediciones en la informacion disponible. Cualquier GPU con 12 GB o mas de VRAM puede seguir el mismo esquema de descarga de expertos.
- Alternativas de cuantizacion: el autor menciona la variante Q4_K_M del mismo modelo (21,2 GB), que necesita mas VRAM.
- Opciones de despliegue: llama.cpp b11541 (`llama-server`, `llama-swap`, `llama-quantize`). Compatibilidad con vLLM, TGI u Ollama no esta documentada en la informacion disponible.
- Cache KV: la configuracion de ejemplo usa `-ctk q8_0 -ctv q8_0` con `-c 131072`, `-b 2048` y `-ub 2048`.
- Latencia y throughput medidos: ~29 tokens/s de generacion en la configuracion descrita, frente a ~28 tokens/s de la variante Q4_K_M en la misma maquina.

Comando de referencia del autor:

```bash
llama-server -m Qwen3.6-35B-A3B-heretic-MTP-IQ4_XS.gguf --jinja -fa on -ngl 99 \
  --n-cpu-moe 26 -c 131072 -ctk q8_0 -ctv q8_0 -b 2048 -ub 2048 \
  --reasoning-budget 2048 --spec-type ngram-mod \
  --temp 0.6 --top-p 0.95 --top-k 20 --min-p 0
```

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Rendimiento observado |
|---|---|---|---|---|---|
| Este modelo (hermeticvm, IQ4_XS) | 35,5B / ~3B | 262.144 nativo (probado 131.072) | IQ4_XS, 19,2 GB | Apache-2.0 | 12/12 codigo, 21/21 tool calling, ~29 tok/s |
| Mismo modelo heretic en Q4_K_M | 35,5B / ~3B | No especificado en esa variante | Q4_K_M, 21,2 GB | Apache-2.0 | 11/12 codigo, 21/21 tool calling, ~28 tok/s, 0,4 GB VRAM libre |
| Qwen3.6-35B-A3B original (Unsloth UD-IQ4_XS) | 35,5B / ~3B | 262.144 | IQ4_XS | Apache-2.0 | 99/100 frases de rechazo; resto de metricas no disponibles |
| Qwen/Qwen3.6-35B-A3B (BF16) | 35,5B / ~3B | 262.144 | BF16 | Apache-2.0 | 83/100 rechazos segun el autor del modelo base (setup distinto: transformers, precision completa) |

No se dispone de datos comparativos frente a otros MoE de tamano similar (por ejemplo, familias alternativas de ~30B-40B con 3B activos) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: es una version abliterated con la mayor parte de los rechazos eliminados. Respondera a peticiones que el Qwen3.6 original declina. La responsabilidad del uso recae enteramente en el usuario.
- Riesgo legal y de politica de contenido: desplegarlo en productos de cara al publico puede infringir terminos de servicio de plataformas, normativa de moderacion de contenidos y legislacion aplicable segun jurisdiccion. No debe exponerse como servicio abierto sin filtros propios.
- Degradacion potencial por la ablacion: aunque el autor cita una divergencia KL de 0,0015 respecto al original, cualquier ablacion de rechazos puede alterar el comportamiento en dominios sensibles y en tareas de instruccion general. No se han publicado evaluaciones estandar que lo cuantifiquen.
- Sesgos: no hay informacion sobre sesgos evaluados en la documentacion disponible. El modelo hereda los del entrenamiento de Qwen3.6, sobre el que tampoco se aportan datos en esta ficha.
- Alucinacion: no se han publicado tasas de alucinacion. Al ser una cuantizacion de 4,32 bits, la fidelidad respecto al BF16 original es menor, especialmente en tareas de razonamiento largo.
- Tensores MTP sin validar: el autor indica explicitamente que los 20 tensores MTP estan presentes pero no han sido probados, y que con los expertos descargados a CPU otros usuarios reportan poca ganancia. El uso de `--spec-type draft-mtp` es bajo cuenta y riesgo del usuario.
- Idiomas: no disponible. No se puede confirmar el soporte multilingue real de esta variante.
- Ambito de las pruebas: todas las metricas provienen de pruebas privadas en una unica maquina (RX 6700 XT, Ryzen 5 5600 X, 32 GB DDR4, llama.cpp b11541). No son extrapolables a otros entornos.
- Rendimiento limitado por el offload: con `--n-cpu-moe 26`, la generacion depende del ancho de banda de la RAM del sistema. Los ~29 tokens/s medidos no son representativos de configuraciones con todos los expertos en GPU.
- Ficheros de KV cache: usar `-ctk q8_0 -ctv q8_0` para que 131k de contexto quepan en 12 GB introduce cuantizacion adicional en la cache, con posible perdida de fidelidad en contextos muy largos.
- Licencia: los pesos de esta cuantizacion se distribuyen bajo Apache-2.0, con enlace a la licencia del Qwen3.6-35B-A3B original. Conviene verificar la licencia del modelo base y del modelo heretic intermedio antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hermeticvm/Qwen3.6-35B-A3B-heretic-MTP-IQ4_XS-GGUF
- Modelo base (heretic, MTP preservado, BF16): https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia Apache-2.0 del modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Heretic (herramienta de ablacion de rechazos): https://github.com/p-e-w/heretic
- llama.cpp (tooling de cuantizacion e inferencia): https://github.com/ggml-org/llama.cpp
- Matriz de importancia de bartowski: https://huggingface.co/bartowski/Qwen_Qwen3.6-35B-A3B-GGUF
- Perfil del autor de la cuantizacion: https://huggingface.co/hermeticvm

Nota: la busqueda web realizada no ha devuelto ningun enlace relevante relacionado con este modelo; los resultados obtenidos no guardan relacion con el contenido de la ficha.

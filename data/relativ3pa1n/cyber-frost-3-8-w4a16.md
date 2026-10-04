# Relativ3pa1n/CYBER-FROST-3.8-W4A16

## Resumen

CYBER-FROST-3.8-W4A16 es una cuantizacion W4A16 del modelo Blackfrost-AI/CYBER-FROST-3.8-BF16, publicada por el usuario Relativ3pa1n. El modelo base es un MoE de aproximadamente 180.000 millones de parametros, derivado de Qwen3.8-Flash-Next y sometido a un fine-tune orientado a seguridad ("security fine-tune"), con 512 expertos enrutados, memoria PLE de n-gramas, decodificacion especulativa MTP nativa y una ventana de contexto de 262.000 tokens (262K). El repositorio pesa 179 GB en lugar de los 355 GB de la version BF16, lo que permite servirlo integramente en GPU sobre una maquina de 8xRTX 3090.

El problema que resuelve es fundamentalmente de despliegue: un modelo de ese tamano en BF16 no cabe en hardware de consumo asequible, y esta cuantizacion reduce a la mitad el peso de los pesos manteniendo en BF16 todos los componentes sensibles a la precision (atencion, incluida la atencion lineal, router, shared_expert, PLE, torre de vision, MTP, capa 0, embeddings y lm_head), cuantizando unicamente los expertos enrutados con grupo de 32. El autor documenta que un group_size de 128 corrompe los number-tokens del MoE en esta familia.

Es relevante ahora porque demuestra un flujo de cuantizacion sin datos (RTN) ejecutable en CPU en unos 14 minutos para los 180B completos, e incluye la receta exacta de servicio con vLLM 0.30.x, TP=8 y expert-parallel, junto con un arnes de evaluacion reproducible sobre un subconjunto de 18 tareas de Terminal-Bench que sirve como comprobacion de coherencia de la cuantizacion. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no procede de una organizacion con validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con 512 expertos enrutados, memoria PLE de n-gramas, MTP nativo y componentes de atencion lineal (linear_attn); torre de vision en el modelo base |
| Parametros totales | ~180.000 millones (aproximado, segun model card) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.000 tokens (262K); recetas verificadas de 256K x 2 secuencias y 131K x 4 secuencias |
| Tipos de cuantizacion | W4A16_ASYM RTN (data-free), group_size=32, solo en expertos enrutados; atencion (incl. linear_attn), router, shared_expert, PLE, torre de vision, MTP, capa 0, embedding y lm_head permanecen en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license (Qwen Community License, heredada de la familia del modelo base); en la model card figura como `license: other` con `license_name: qwen-community-license` |
| Formato de pesos | safetensors con esquema compressed-tensors (vLLM); no se publica GGUF |
| Modelo base | Blackfrost-AI/CYBER-FROST-3.8-BF16 |
| Tamano del repositorio | 179 GB (frente a 355 GB en BF16) |
| Libreria declarada | vllm |
| Metodo de cuantizacion | Cuantizador en streaming por capas, directo sobre safetensors; ~14 minutos para los 180B completos en CPU |
| Fecha de creacion del repositorio | 2026-10-03 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) de aproximadamente 180B parametros totales, con 512 expertos enrutados, sobre la base Qwen3.8-Flash-Next. Incorpora dos elementos distintivos: una memoria PLE (probabilistic lookup / n-gram memory, segun la denominacion del autor) y soporte nativo de MTP (multi-token prediction) para decodificacion especulativa. La presencia de `linear_attn` en la lista de modulos mantenidos en BF16 sugiere componentes de atencion lineal dentro del bloque de atencion, y la mencion de una "vision tower" indica que el modelo base incorpora un codificador visual, aunque no se detallan ni su tamano ni su configuracion.

Sobre el entrenamiento no se aporta informacion en la model card: no se especifica el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de alineamiento. Lo unico documentado es que el modelo base es un "security fine-tune", es decir, un ajuste orientado a tareas de seguridad, y que su licencia se hereda de la familia Qwen. La innovacion tecnica destacable de este repositorio no esta en la arquitectura sino en la cuantizacion: un esquema W4A16 asimetrico con redondeo RTN sin datos de calibracion, aplicado selectivamente a los expertos enrutados con group_size=32, manteniendo el resto de modulos en BF16 para preservar la coherencia numerica del enrutado y de la atencion.

## Capacidades

- Generacion de texto y razonamiento en varios pasos, con parser de razonamiento `qwen3` integrado en vLLM y modo "thinking" activable o desactivable mediante `chat_template_kwargs.enable_thinking=false`.
- Tool calling / function calling: la receta verificada usa el parser `qwen3_coder` junto con `--enable-auto-tool-choice`; el autor afirma haber verificado un round-trip con argumentos JSON validos.
- Ejecucion de agentes autonomos en terminal: evaluado con el agente `terminus` sobre el subconjunto de 18 tareas de `terminal-bench-core==0.1.1`, con pass@1 y limite de 900 segundos.
- Contexto largo: 262K tokens declarados, con recetas verificadas para 256K con 2 secuencias concurrentes y 131K con 4 secuencias concurrentes.
- Decodificacion especulativa nativa mediante MTP (`qwen4_exp_mtp`, 2 tokens especulativos).
- Capacidad multimodal: la model card menciona una torre de vision entre los modulos conservados en BF16, lo que apunta a entrada de imagenes, pero no se detallan las capacidades concretas ni se aportan ejemplos de uso. Considerar este punto como no confirmado.
- Uso en tareas de seguridad y pentesting autonomo: el autor menciona "autonomous-pentest worker duty" como escenario de servicio en produccion propio.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).

## Casos de uso

- Automatizacion de tareas en terminal y entornos shell: el modelo puede actuar como agente que ejecuta comandos, interpreta salidas y encadena pasos; el subconjunto de Terminal-Bench con el agente `terminus` demuestra ejecucion multi-paso sobre tareas como recuperacion de contrasenas, saneado de repositorios git o truncado de bases de datos SQLite.
- Pentesting autonomo y analisis de seguridad: el fine-tune de seguridad del modelo base y el escenario documentado de "autonomous-pentest worker" con 2 secuencias concurrentes lo orientan a tareas de reconocimiento, explotacion guiada y post-explotacion en entornos controlados.
- Analisis de documentacion tecnica extensa: la ventana de 262K tokens permite cargar repositorios completos, manuales o conjuntos de logs sin fragmentacion agresiva, con 4 secuencias concurrentes a 131K.
- Generacion y refactorizacion de codigo con integracion en pipelines: el soporte de tool calling con parser `qwen3_coder` y argumentos JSON validos permite conectarlo a herramientas de build, test o despliegue dentro de flujos CI/CD.
- Resolucion de problemas matematicos y formales en cadena larga: entre las tareas resueltas en la comprobacion publicada figuran `prove-plus-comm` y `pytorch-model-cli.hard`, lo que indica capacidad de razonamiento simbolico y de manejo de herramientas complejas.
- Forense y recuperacion de credenciales en laboratorio: las tareas `crack-7z-hash.easy` y `password-recovery` del conjunto evaluado corresponden a este tipo de flujo, con el modelo orquestando herramientas externas.
- Autohospedaje en rack de GPUs de gama de consumo: con 8xRTX 3090 y vLLM es posible servir el modelo sin depender de A100/H100, con ~200 tok/s agregados sostenidos en 2 secuencias concurrentes.
- Investigacion sobre cuantizacion selectiva de MoE: el repositorio sirve como referencia reproducible para estudiar el impacto de cuantizar solo expertos enrutados con group_size=32 frente a group_size=128.

## Benchmarks y rendimiento

El autor publica un unico conjunto de resultados, presentado explicitamente como "comprobacion de coherencia de la cuantizacion" y no como una afirmacion de capacidad del modelo. Se trata del subconjunto emparejado de 18 tareas de `terminal-bench-core==0.1.1`, con agente `terminus`, pass@1, limite de 900 segundos y 2 secuencias concurrentes.

| Build | Tamano | Puntuacion |
|---|---|---|
| Laguna S 2.1 W4A16 | 69 GB | 4/18 = 22,2 % |
| Laguna S 2.1 W8A16 | no disponible | 5/18 = 27,8 % |
| CYBER-FROST-3.8 W4A16 (este modelo) | 179 GB | 8/18 = 44,4 % |

Tareas resueltas por este build: `blind-maze-explorer-5x5`, `crack-7z-hash.easy`, `password-recovery`, `prove-plus-comm`, `pytorch-model-cli.hard`, `sanitize-git-repo`, `sqlite-db-truncate` y `sqlite-with-gcov`. La tarea `qemu-alpine-ssh` fallo por un error de construccion del contenedor antes de que el agente llegase a ejecutarse; el autor indica que los builds de comparacion tambien obtuvieron 0 en esa tarea por timeout.

Rendimiento de inferencia declarado sobre 8xRTX 3090 con TP=8 y expert-parallel:

| Metrica | Valor |
|---|---|
| Single-stream con MTP (`num_speculative_tokens=2`) | 110,5 tok/s sostenidos |
| Single-stream sin MTP | 77 tok/s |
| Mejora por MTP | +43,5 % |
| Agregado con 2 secuencias concurrentes | ~200 tok/s sostenidos |
| Pico declarado | 300 tok/s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos: 179 GB en W4A16 frente a 355 GB en BF16. Hay que anadir el espacio de cache KV y activaciones, que depende de la longitud de contexto y del numero de secuencias concurrentes.
- Configuracion de referencia verificada: 8xRTX 3090 (Ampere, sm86, 24 GB por tarjeta = 192 GB totales), tensor parallel de 8.
- Expert parallel obligatorio: el autor indica que el intermedio del MoE a TP=8 no es divisible por group_size 32, por lo que se requiere `--enable-expert-parallel`.
- No cabe en una unica GPU de consumo. Se necesita un nodo multi-GPU; en la configuracion documentada, ocho RTX 3090.
- Toolchain: vLLM 0.30.x, toolchain CUDA 13, `--quantization compressed-tensors --enable-expert-parallel --reasoning-parser qwen3`.
- Configuracion especulativa: `{"method":"qwen4_exp_mtp","num_speculative_tokens":2}`.
- Tool calling en servicio: parser `qwen3_coder` con `--enable-auto-tool-choice`.
- Opciones de despliegue: unicamente vLLM mediante compressed-tensors. Al no publicarse pesos GGUF, no hay soporte para llama.cpp, Ollama ni otros runners que no lean compressed-tensors.
- Latencia y throughput: 110,5 tok/s en single-stream con MTP y ~200 tok/s agregados con 2 secuencias concurrentes en la configuracion de referencia; no se publican latencias por token ni tiempos a primer token.
- Scripts incluidos en el repositorio: `CYBER-FROST-W4A16-vLLM.sh` (lanzamiento tal como se ejecuto en el rig), `tbench-cyberfrost-18.sh` y `tbench-results.json`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano en disco | Terminal-Bench (18 tareas) | Licencia |
|---|---|---|---|---|---|---|
| CYBER-FROST-3.8 W4A16 (este) | ~180B MoE | 262K | W4A16 g32, solo expertos | 179 GB | 8/18 = 44,4 % | Qwen Community License |
| CYBER-FROST-3.8 BF16 (base) | ~180B MoE | 262K | BF16 | 355 GB | no disponible | Qwen Community License |
| Laguna S 2.1 W4A16 | no disponible | no disponible | W4A16 | 69 GB | 4/18 = 22,2 % | no disponible |
| Laguna S 2.1 W8A16 | no disponible | no disponible | W8A16 | no disponible | 5/18 = 27,8 % | no disponible |

La comparacion con Laguna S 2.1 procede exclusivamente del propio autor del repositorio, que la utiliza como control de coherencia de la cuantizacion y no como comparativa de capacidad. No se dispone de especificaciones tecnicas de esos builds mas alla del tamano del primero y de la puntuacion obtenida.

## Limitaciones y advertencias

- El autor califica explicitamente la evaluacion de Terminal-Bench como comprobacion de coherencia de la cuantizacion y no como una afirmacion de capacidad del modelo. No debe interpretarse como un benchmark de rendimiento general.
- La cuantizacion es RTN sin datos de calibracion (data-free), aplicada de forma asimetrica solo a los expertos enrutados. El autor advierte que group_size=128 corrompe los number-tokens del MoE en esta familia, lo que indica sensibilidad del modelo a la configuracion de cuantizacion.
- La tarea `qemu-alpine-ssh` no pudo ejecutarse por un fallo de construccion del contenedor, por lo que la puntuacion de 8/18 excluye una tarea por causas ajenas al modelo.
- El repositorio tiene 0 descargas y 0 likes, esta publicado por un usuario individual y no cuenta con validacion independiente ni revision por pares.
- No se declara la lista de idiomas soportados. No hay informacion sobre rendimiento en castellano ni en otros idiomas distintos del ingles.
- Licencia `qwen-community-license` con `license: other` en los metadatos. Es imprescindible revisar los terminos de la Qwen Community License antes de cualquier uso comercial; el autor remite a la model card del modelo base para las restricciones de uso.
- Al no publicarse GGUF, el despliegue queda limitado a vLLM con compressed-tensors. No hay soporte para llama.cpp, Ollama, TGI ni otros runners sin conversion adicional.
- El modo "thinking" consume presupuesto de `max_tokens`: el autor advierte de que hay que dejar holgura o enviar `chat_template_kwargs.enable_thinking=false` cuando no se quiera razonamiento, o el contenido se vera truncado.
- Existe un fine-tune orientado a seguridad y un escenario de pentesting autonomo documentado. Es responsabilidad del operador asegurar que cualquier uso ofensivo se realice en entornos autorizados y dentro del marco legal aplicable.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento fuera de distribucion. No se han publicado evaluaciones de seguridad o alineamiento.
- La capacidad multimodal es inferida de la mencion de una "vision tower" en la model card; no se detalla su funcionamiento ni se aportan ejemplos verificados.
- La cuantizacion se genero en unos 14 minutos en CPU segun el autor; este dato no ha sido verificado de forma independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Relativ3pa1n/CYBER-FROST-3.8-W4A16
- Modelo base (BF16): https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Script de servicio vLLM: https://huggingface.co/Relativ3pa1n/CYBER-FROST-3.8-W4A16/blob/main/CYBER-FROST-W4A16-vLLM.sh
- Licencia Qwen Community: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Arnes de evaluacion Terminal-Bench: https://huggingface.co/Relativ3pa1n/CYBER-FROST-3.8-W4A16/blob/main/tbench-cyberfrost-18.sh
- Resultados por tarea: https://huggingface.co/Relativ3pa1n/CYBER-FROST-3.8-W4A16/blob/main/tbench-results.json
- Los resultados de la busqueda web no aportaron enlaces adicionales relevantes sobre este modelo (solo paginas genericas de Reddit sin relacion).

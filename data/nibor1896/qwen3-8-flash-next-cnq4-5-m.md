# nibor1896/Qwen3.8-Flash-Next-CNQ4.5-M

## Resumen

Qwen3.8-Flash-Next-CNQ4.5-M es una cuantizacion del modelo multimodal Qwen/Qwen3.8-Flash-Next publicada por el usuario nibor1896. No es un modelo entrenado desde cero: es un artefacto de despliegue que empaqueta los pesos del modelo base en el formato propietario CNQ v1, con cuantizacion NVFP4 a 4,5 bits por peso (bpw), escala de sub-bloque con criterio MSE y sin calibracion previa. El paquete es un unico fichero de 104.727.179.972 bytes (unos 105 GB) que incluye tambien la torre de vision completa, por lo que conserva la capacidad multimodal del original.

La relevancia de esta publicacion no esta en el modelo en si, sino en la pila de ejecucion que introduce: el motor crow-nest, un servidor HTTP propio con su propio formato de contenedor, que no usa GGUF ni transformers y que esta limitado a Windows, CUDA y GPUs NVIDIA Blackwell (sm_120). Todas las mediciones declaradas en la model card provienen de una unica RTX 5090. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto reciente y sin validacion externa.

El modelo base pertenece a la familia Qwen y esta etiquetado como MoE y multimodal, pero la informacion proporcionada no detalla el numero de parametros totales ni activos, la longitud de contexto soportada ni la composicion del dataset de entrenamiento. La licencia de los pesos es Qwen Community License 1.0; el codigo del motor y del conversor es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal, segun etiquetas del repositorio (`moe`, `vision`, `multimodal`); arquitectura interna del modelo base no detallada en la informacion disponible |
| Parametros totales | No disponible. Estimacion derivada del contenedor: 104.727.179.972 B a 4,5 bpw equivalen a unos 186.000 millones de pesos antes de descontar el conjunto keep set en BF16, cifra no confirmada por el autor |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible. El manifiesto de hot-set se llama `hotsets-M-longctx2100-n160.json`, pero no se explicita la ventana de contexto |
| Tipos de cuantizacion | NVFP4 a 4,5 bpw: bloques de 64 valores, 4 sub-escalas `ue4m3` por bloque (una por sub-bloque de 16), payload `E2M1` empaquetado de 32 B, 36 B almacenados por bloque, escala global `f32` por tensor (two-level scaling), redondeo a vecino mas cercano y sin calibracion. La seccion `ple` (`ngram_embedding`) es intercambiable a FP8 en el motor. Conjunto keep set en BF16: embeddings, `lm_head`, GEMM del router, `shared_expert_gate`, todas las normas, todos los tensores 1-D (sesgos, `A_log`, `dt_bias`, puertas) y cualquier tensor cuya longitud no sea multiplo de 64 |
| Idiomas soportados | `en`, `de` (etiquetas del repositorio). No se declaran mas idiomas |
| Licencia | Pesos: Qwen Community License 1.0 (`qwen-community-1.0`, fichero `LICENSE` de 3.235 B copiado de la revision upstream). Motor y conversor: Apache-2.0 |
| Formato de pesos | CNQ v1: un unico fichero `.cnq` con magia `CNQ1`, 8 bytes reservados y blob de payload en streaming, seguido de un indice JSON en trailer y un `u64` little endian con la longitud del indice. No hay GGUF ni safetensors en el paquete |
| Revision del modelo base | `de4b8e4d43b917e7706784d8bb445c9af86a3540` (revision de registro declarada) |
| Secciones del contenedor | `text` (siempre), `ple` (`ngram_embedding`, siempre), `vit` (`model.visual`, opcional), `mtp` (opcional) |
| Plataforma | Solo Windows, CUDA, NVIDIA Blackwell (`sm_120`) |

## Arquitectura y entrenamiento

La informacion disponible describe con detalle el proceso de cuantizacion, no el entrenamiento. El modelo base Qwen/Qwen3.8-Flash-Next se distribuye en safetensors y este paquete se genera a partir de ellos con el conversor incluido en el repositorio crow-nest (`converter/src/main.rs`). La cuantizacion es calibration-free: cada bloque de 64 valores se redondea a vecino mas cercano y se le asignan cuatro sub-escalas `ue4m3`, una por sub-bloque de 16, calculadas con criterio MSE (`--scales mse`), mas una escala global `f32` por tensor. El resultado son 36 B por bloque de 64 valores, equivalentes a 4,5 bpw.

El diseno del contenedor tiene dos decisiones tecnicas destacables. La primera es que el indice se escribe como trailer en lugar de cabecera: el payload se puede volcar a disco en streaming sin conocer de antemano el tamano del indice y sin mantener el modelo en RAM. La segunda es el conjunto keep set en BF16, que excluye de la ruta de cuantizacion todos los tensores 1-D y los parametros de recurrencia, con el argumento explicito de que un parametro de recurrencia 1-D no debe pasar por una ruta de cuantizacion pensada para GEMM. La seccion `ple` (`ngram_embedding`) puede intercambiarse a FP8 en tiempo de ejecucion. La model card menciona tambien un manifiesto de hot-set que el motor carga para mantener residentes los expertos adaptados, lo que encaja con una arquitectura MoE con gestion de residencia de expertos, aunque no se detalla el reparto exacto entre VRAM y memoria del sistema. No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni si el base paso por RLHF o DPO.

Como control de calidad, el conversor genera un sidecar de verificacion (`Qwen3.8-Flash-Next-CNQ4.5-M.cnq.sidecar.jsonl`, 436.716 B) con una linea JSON por tensor que registra el error maximo y medio respecto a las sub-escalas, calculado dequantizando in-place durante la propia cuantizacion. Ese sidecar es la puerta 0 de la escalera de medicion y el conversor sale con codigo 1 si se viola alguna cota en los modos que la definen.

## Capacidades

- Generacion de texto: el `pipeline_tag` es `text-generation` y la seccion `text` del contenedor se carga siempre.
- Procesamiento de imagen: el contenedor incluye la torre de vision completa (`model.visual`, seccion `vit`), con la misma politica de cuantizacion que la torre de texto. La carga de esa seccion es opcional en el motor.
- Modelo de mezcla de expertos: las etiquetas del repositorio lo identifican como `moe` y el manifiesto de hot-set gestiona la residencia de expertos adaptados.
- Embeddings de n-gramas: seccion `ple` (`ngram_embedding`) en NVFP4, intercambiable a FP8.
- Prediccion multi-token: el contenedor transporta una seccion `mtp` marcada como opcional de cargar; la informacion no detalla su funcionamiento.
- Capacidades multilingues: limitadas a ingles y aleman segun las etiquetas declaradas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente local con requisitos estrictos de privacidad: al ejecutarse integramente en una estacion de trabajo Windows con una sola GPU y servirse mediante un HTTP propio, el modelo permite procesar documentos e imagenes sin que los datos salgan de la maquina, algo relevante en entornos legales, sanitarios o de defensa donde no se admite inferencia en nube.
- Analisis de documentacion tecnica bilingue ingles/aleman: la torre de vision incluida permite pasar paginas escaneadas o capturas junto con texto, y los dos idiomas declarados cubren buena parte de la documentacion industrial y de ingenieria centroeuropea.
- Asistencia de codigo en redes aisladas (air-gapped): el paquete se distribuye como un unico contenedor con sumas SHA-256 verificables, lo que simplifica el traslado a maquinas sin salida a internet, aunque no hay datos publicados sobre su rendimiento en generacion de codigo.
- Investigacion en cuantizacion de modelos MoE multimodales: el sidecar JSONL permite comparar tensor a tensor el error maximo y medio introducido por la politica MSE frente a alternativas como la politica `ceil` que el conversor usa por defecto, sin necesidad de ejecutar el modelo completo.
- Regresion de calidad en produccion: el sidecar actua como puerta 0 de una escalera de medicion, de forma que un equipo puede fijar umbrales de error por tensor y bloquear la promocion de un contenedor que los supere antes de gastar GPU en evaluaciones de extremo a extremo.
- Procesamiento por lotes nocturno en una estacion monopuesto: con el motor cargando un manifiesto de hot-set para mantener residentes los expertos adaptados, un flujo de trabajo tipico es encolar tareas heterogeneas (resumen, extraccion, descripcion de imagenes) durante la noche y revisar resultados por la manana.
- Comparacion de politicas de cuantizacion sobre el mismo modelo base: al existir conversor reproducible y verificacion por sumas de comprobacion, el paquete sirve como referencia fija frente a otras conversiones del mismo `Qwen/Qwen3.8-Flash-Next` que un equipo genere internamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de calidad, y la busqueda web realizada no ha devuelto papers, blogs ni evaluaciones de terceros (los unicos resultados devueltos no guardan relacion con el modelo).

El unico dato cuantitativo disponible es de tipo interno: el sidecar de verificacion registra, por tensor, el error maximo y medio de la cuantizacion frente a las sub-escalas de sub-bloque, calculado durante la conversion. El autor lo describe como la puerta 0 de su escalera de medicion, es decir, un control de integridad del proceso de cuantizacion, no una medida de capacidad del modelo. Los valores concretos de ese sidecar no se reproducen en la model card y no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- Plataforma: exclusivamente Windows con CUDA sobre NVIDIA Blackwell (`sm_120`). No se declara soporte para Linux, ROCm, Metal ni GPUs de generaciones anteriores.
- GPU medida: una unica RTX 5090. La model card afirma que todas las cifras medidas que aparecen en ella proceden de esa tarjeta, pero el extracto disponible no incluye esas cifras.
- VRAM: no disponible de forma explicita. Como referencia, el contenedor ocupa unos 105 GB, muy por encima de los 32 GB de VRAM de una RTX 5090, por lo que el motor necesariamente mantiene solo una parte residente en VRAM y gestiona el resto fuera de ella, apoyandose en el manifiesto de hot-set (`hotsets-M-longctx2100-n160.json`) para decidir que expertos permanecen cargados.
- Almacenamiento: se requiere espacio para el contenedor de 105 GB mas los ficheros auxiliares; conviene reservar margen adicional para el propio motor y para ficheros temporales.
- Cabe en GPU de consumo: si, segun el autor, en una RTX 5090, con la salvedad anterior sobre residencia parcial y dependencia del subsistema de memoria y disco. No hay datos para otras GPU de consumo.
- Opciones de despliegue: servidor HTTP propio del motor crow-nest (`https://github.com/nibor1896/crow-nest`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, porque el contenedor no esta en GGUF ni en safetensors y el motor no usa transformers.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Verificacion de integridad: el paquete incluye `SHA256SUMS` (308 B) con las sumas del contenedor, el sidecar y el manifiesto de hot-set. El comando indicado es `sha256sum -c SHA256SUMS` y debe reportar 3 de 3 OK.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Peso en disco | Licencia | Formatos y tooling |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-CNQ4.5-M (este) | No disponible; estimacion derivada del contenedor en torno a 186.000 millones de pesos | No disponible | 104.727.179.972 B (unos 105 GB) para texto, vision, `ple` y `mtp` | Qwen Community License 1.0 (pesos), Apache-2.0 (motor) | Contenedor CNQ v1; solo motor crow-nest en Windows con Blackwell |
| Qwen/Qwen3.8-Flash-Next (modelo base, sin cuantizar) | No disponible | No disponible | No disponible; a 16 bits por peso la estimacion derivada seria aproximadamente 2,5 veces mayor que este contenedor, cifra no confirmada | Qwen Community License 1.0 | Safetensors; ecosistema transformers y motores que lo soporten |
| Otras cuantizaciones de 4 bits del mismo base (GGUF Q4_K_M, AWQ, GPTQ, FP8) | No disponible | No disponible | No disponible | Depende del publicador; la licencia del base es Qwen Community License 1.0 | No disponibles en la informacion proporcionada; por definicion serian compatibles con llama.cpp u otros motores distintos de crow-nest |

No se dispone de datos de benchmarks ni de especificaciones verificadas de terceros para establecer una comparacion de rendimiento. La unica diferencia contrastable en la informacion proporcionada es de formato y de tooling: este paquete queda atado a un motor propietario y a una unica plataforma, mientras que las alternativas citadas, si existen, serian ejecutables en pilas mucho mas extendidas.

## Limitaciones y advertencias

- Dependencia total de un motor propietario: el contenedor CNQ v1 solo lo lee crow-nest. No hay soporte para GGUF, safetensors, transformers, vLLM, llama.cpp, Ollama ni TGI, lo que descarta su integracion directa en la mayoria de pipelines existentes.
- Bloqueo de plataforma: solo Windows, CUDA y NVIDIA Blackwell (`sm_120`). No hay ruta documentada para Linux, para GPUs anteriores a Blackwell ni para aceleradores de otros fabricantes.
- Artefacto sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (14 de septiembre de 2026). No hay evaluaciones independientes de calidad.
- Ausencia de datos del modelo base: no se documentan parametros totales ni activos, ventana de contexto, composicion del dataset de entrenamiento ni proceso de alineacion. Cualquier decision de produccion basada en el tamano o el contexto seria especulativa.
- Riesgo de alucinacion: no evaluado en la informacion disponible. No hay benchmarks ni analisis de fidelidad factual, por lo que no se puede acotar el riesgo en tareas de extraccion o resumen.
- Cobertura idiomatica limitada en la declaracion: solo ingles y aleman. El castellano no figura entre los idiomas declarados por el autor.
- Ausencia de datos sobre tool calling y uso agentico: si un flujo depende de function calling o de razonamiento multi-paso, no hay confirmacion de soporte en la documentacion proporcionada.
- Restricciones de licencia: los pesos se rigen por Qwen Community License 1.0, cuyo texto no se resume en la model card. Antes de un uso comercial hay que leer el fichero `LICENSE` incluido y comprobar condiciones, umbrales y obligaciones de atribucion.
- Detalle operativo documentado por el autor: debe usarse el manifiesto de hot-set `hotsets-M-longctx2100-n160.json` y no un sidecar derivado del nombre del contenedor (referencia a la incidencia 49 del motor).
- Consumo de recursos: 105 GB de contenedor sobre una GPU de 32 GB de VRAM implican dependencia de memoria del sistema y de disco; el rendimiento real dependera de la velocidad de esos subsistemas, y no se publican cifras de latencia ni de throughput.
- Verificacion obligatoria de integridad: conviene ejecutar `sha256sum -c SHA256SUMS` tras la descarga, ya que el contenedor es un unico fichero binario de gran tamano sin cabecera legible mas alla de la magia `CNQ1`.
- Proyecto en fase temprana: el propio autor referencia incidencias abiertas del motor (#49, #57) en la documentacion del paquete, lo que sugiere un ecosistema en desarrollo activo y sujeto a cambios.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/nibor1896/Qwen3.8-Flash-Next-CNQ4.5-M
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor y conversor crow-nest: https://github.com/nibor1896/crow-nest
- Fichero de licencia incluido en el paquete: `LICENSE` (Qwen Community License 1.0, copia literal de la revision upstream)
- Manifiesto de hot-set incluido: `hotsets-M-longctx2100-n160.json`
- Sidecar de verificacion incluido: `Qwen3.8-Flash-Next-CNQ4.5-M.cnq.sidecar.jsonl`
- Papers, blogs, demos o evaluaciones de terceros: no se han encontrado en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.

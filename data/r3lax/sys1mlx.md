# r3lax/sys1mlx

## Resumen

Sys1MLX es un modelo de decision local para Apple Silicon derivado de Qwen3.5-4B-Base. No es un generador de texto: recibe un estado textual, opcionalmente una imagen local y un conjunto de opciones definidas por el usuario, y devuelve la opcion seleccionada junto con probabilidades sin redondear. Ademas de preguntas de tipo `choice`, admite los tipos `noul` y `score`. El autor lo publica como artefacto experimental orientado a inferencia local en Macs con MLX y soporte Metal.

El checkpoint combina un backbone de lenguaje Qwen3.5 cuantizado en MLX affine 4-bit (group size 64), una torre visual restaurada en BF16 y una cabeza pointer independiente en FP32 (`head.safetensors`), por lo que no se necesita proyeccion de vocabulario. Los pesos se obtuvieron fusionando un adaptador LoRA sobre la revision base indicada, cuantizando despues; no se realizo ningun entrenamiento ni ajuste visual nuevo. El recuento de elementos declarado en safetensors es de 991.474.176, muy por debajo del nominal del modelo base, coherente con el empaquetado de la cuantizacion 4-bit, aunque el autor no publica el desglose.

Su relevancia es de nicho: demuestra un patron de "modelo de decision" con lectura por punteros y probabilidades explicitas, ejecutable en un portatil M4 con 16 GiB de memoria unificada y sin dependencia de servicios en la nube. A cambio, exige el runtime Python incluido en el repositorio: no funciona con `mlx_lm.generate`, `mlx_vlm.generate`, la carga automatica de Transformers ni widgets de inferencia alojados. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no se han publicado resultados de benchmarks generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal hibrido de la familia Qwen3.5: backbone de lenguaje con capas recurrentes de atencion lineal tipo DeltaNet (parametros `A_log` conservados en FP32) junto a atencion completa, torre visual ViT restaurada y cabeza pointer FP32 para lectura de opciones |
| Parametros totales | 991.474.176 elementos en safetensors; el modelo base declarado es Qwen3.5-4B-Base y el autor no publica el desglose por componente |
| Parametros activos | No aplica (modelo denso, sin mezcla de expertos) |
| Longitud de contexto | 2048 tokens para imagen empaquetada mas texto (limite del runtime); presupuesto de tokens de imagen de 16 a 512, 256 por defecto; no disponible una ventana de contexto superior |
| Tipos de cuantizacion | MLX affine 4-bit con group size 64 en capas lineales y embeddings del lenguaje; torre visual en BF16; cabeza pointer y parametros recurrentes `A_log` en FP32; export opcional Core ML FP16 para ANE (solo torre visual) |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX): `model.safetensors` y `head.safetensors`; export opcional a Core ML |
| Modelo base | Qwen/Qwen3.5-4B-Base (revision base `1001bb4d826a52d1f399e183466143f4da7b741b`, adaptador `70dd4088ebf4eb82d15ef57a863a5b9a98b94d6c`) |
| Tamano del repositorio | 3,1 GB; `model.safetensors` ocupa 3.034.300.803 bytes (2,826 GiB) |
| Pipeline declarado | multiple-choice |
| Plataforma de ejecucion | Apple Silicon con soporte MLX Metal; probado con Python 3.11, macOS 26.5.2, M4 y 16 GiB de memoria unificada |
| Fecha de publicacion | 2026-09-26 (creacion y ultima actualizacion identicas) |

## Arquitectura y entrenamiento

El artefacto es una conversion, no un entrenamiento. El procedimiento descrito por el autor consiste en cargar el checkpoint base fijado y un adaptador LoRA tambien fijado, aplicar cada actualizacion del adaptador en FP32 con la formula `W + (alpha/r) * B @ A` y volcar despues a BF16; a continuacion se cuantizan las capas lineales y de embedding del lenguaje a MLX affine 4-bit con group size 64, se mantiene la torre visual original en BF16, se conservan los parametros recurrentes `A_log` en FP32 y se convierte la cabeza pointer a un safetensors FP32 independiente. La conversion se realizo con MLX 0.32.2 sobre CPU Linux, y el propio autor advierte de que la cuantizacion puede diferir ligeramente de una conversion realizada sobre Metal.

La innovacion tecnica relevante no esta en el entrenamiento sino en la lectura de la decision. En lugar de proyectar sobre un vocabulario, el modelo emplea la codificacion de tokens de opcion original y una lectura por punteros: la cabeza FP32 devuelve una probabilidad por opcion en el orden de insercion. Las caracteristicas visuales de Qwen se insertan en el flujo del lenguaje junto con posiciones RoPE multimodales, sin entrenamiento adicional. El runtime corrige la normalizacion Q/K de DeltaNet a la convencion de epsilon de suma de cuadrados de MLX-LM; omitir esa correccion en mlx-vlm 0.7.2 altera las salidas. El autor indica explicitamente que los resultados de entrenamiento y benchmarks publicados por el proyecto upstream no son mediciones de este derivado visual cuantizado, y no se documentan datos de entrenamiento, composicion del dataset, RLHF ni DPO.

## Capacidades

- Decision multiple-choice con probabilidades: devuelve una opcion y las probabilidades sin redondear asociadas a cada alternativa, en el orden de insercion de la pregunta.
- Tipos de pregunta `choice`, `noul` y `score`, segun lo declarado en la model card.
- Entrada multimodal opcional: una unica imagen local por peticion, con presupuesto de 16 a 512 tokens de imagen (256 por defecto) y conservacion de la relacion de aspecto mediante el procesador de Qwen.
- Idiomas: ingles y ruso.
- Reutilizacion de contexto mediante cache de imagen y de prefijo (64 MiB por defecto, desactivable con `--cache-mb 0`, activable con `--prefix`), pensada para procesos de larga duracion con peticiones repetidas.
- Export experimental de la torre visual a Core ML FP16 en geometria fija (384x384 / 144 tokens y 512x512 / 256 tokens) para ejecucion parcial en ANE.
- No soporta generacion de texto libre: el autor lo describe como modelo de decision, no como generador.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, audio ni modo thinking.
- No se documenta entrenamiento de instrucciones: el checkpoint base es la variante Base, no la instruction-tuned.

## Casos de uso

- Enrutado de intenciones en agentes locales: dado un estado textual y un conjunto cerrado de opciones (por ejemplo, "responder", "pedir aclaracion", "escalar a humano"), el modelo devuelve la opcion y su probabilidad, que puede usarse como umbral de confianza para decidir si se delega a un LLM mayor.
- Verificacion visual con privacidad de datos: inspeccion de capturas, documentos escaneados o fotos que no pueden salir del equipo, con la imagen procesada localmente en un Mac con MLX y un limite de 32 megapixeles decodificados por peticion.
- Automatizacion de interfaces a partir de capturas: los diagnosticos del autor incluyen casos sinteticos de UI y de posicion, de modo que el modelo puede elegir entre elementos o acciones identificadas en una captura antes de que un script las ejecute.
- Control de calidad por lotes en macOS: clasificacion de imagenes o textos en categorias predefinidas con probabilidad asociada, registrando las decisiones de baja confianza para revision manual.
- Puntuacion comparativa de alternativas: con el tipo `score`, ordenar o puntuar opciones candidatas (variantes de un texto, parametros de configuracion, respuestas) sin necesidad de generar contenido nuevo.
- Prototipado offline en portatiles Apple Silicon: experimentos de decision multimodal sin acceso a red ni GPU dedicada, con latencia de 0,7 a 1,2 s por peticion de imagen nueva en un M4.
- Componente de cascada en sistemas de vision: filtro previo barato que descarta o confirma casos claros antes de invocar un modelo multimodal mayor, siempre que el sistema pueda tolerar la falta de calibracion de las probabilidades en tareas de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo aporta diagnosticos locales que describe expresamente como comprobaciones de desarrollo y no como evidencia held-out:

| Prueba | Configuracion | Resultado |
|---|---|---|
| Conjunto diagnostico local (18 casos sinteticos de color, forma, recuento, UI y posicion + 6 fotografias de scikit-image) | Vision BF16 nativa | 24/24 respuestas esperadas |
| Mismo conjunto | Sin imagenes | 7/24 respuestas esperadas |
| Control de intercambio de imagen | Vision BF16 nativa | 18/18 |
| Exportacion ANE hibrida (vision en CPU_AND_NE, lenguaje en MLX) | Medianas por geometria procesada | No disponible: la tabla de la model card aparece truncada en la informacion proporcionada |

El autor advierte de que las fotografias empleadas pueden haber aparecido en el pretraining y que el tamano de la muestra impide generalizar. En rendimiento, la latencia de imagen nueva con vision MLX nativa es de aproximadamente 0,7 a 1,2 s en un M4, con un pico observado del asignador de MLX de unos 3,54 GiB, que no equivale a la memoria total del sistema. Las mediciones con imagen repetida y con cache de prefijo corresponden a cargas de trabajo distintas y no deben compararse con la inferencia de imagen nueva. La primera carga incluye verificacion de checksum y queda excluida de las mediciones en estado estacionario.

## Requisitos de hardware

- Plataforma obligatoria: Mac con Apple Silicon y soporte MLX Metal operativo. No hay ruta de ejecucion en CUDA ni en CPU x86 documentada.
- Memoria: probado en un M4 con 16 GiB de memoria unificada. El autor indica que hay que reservar varios GiB adicionales para el proceso, ademas de macOS y del resto de aplicaciones; los equipos mas pequenos no han sido validados.
- Peso en disco: 3,1 GB de repositorio; `model.safetensors` son 2,826 GiB. Con la exportacion Core ML experimental, cada paquete ocupa aproximadamente 633 MiB y hay que dejar espacio libre para las caches de compilacion de Core ML.
- Pico de memoria del asignador MLX: aproximadamente 3,54 GiB en inferencia de imagen nueva (no es memoria total del sistema).
- Latencia: 0,7 a 1,2 s por peticion de imagen nueva en un M4, segun geometria e peticion.
- Opciones de despliegue: exclusivamente el runtime Python incluido en el repositorio (`python -m sys1mlx.cli`), con entorno virtual Python 3.11. No compatible con `mlx_lm.generate`, `mlx_vlm.generate`, carga automatica de Transformers, vLLM, TGI, llama.cpp, Ollama ni widgets de inferencia alojados.
- Exportacion ANE opcional: requiere `coremltools==9.0` y `experimental/ane_export.py`; solo exporta la torre visual, mientras el modelo de lenguaje y la cabeza de decision siguen ejecutandose en MLX. La CLI por defecto sigue usando vision BF16 en MLX.
- Caches: 64 MiB por defecto para imagen y prefijo, configurables o desactivables.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible otros modelos de decision con lectura por punteros y salida de probabilidades comparables a este. La unica referencia contrastable es el checkpoint upstream del que deriva:

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| r3lax/sys1mlx | 991.474.176 elementos en safetensors (base nominal 4B) | 2048 tokens (imagen + texto, runtime) | Decision multiple-choice con probabilidades | apache-2.0 | HuggingFace, MLX para Apple Silicon, uso experimental |
| Qwen/Qwen3.5-4B-Base | No disponible en la informacion proporcionada | No disponible | Generacion de texto (checkpoint Base, no instruction-tuned) | No disponible en la informacion proporcionada | HuggingFace, upstream |
| Alternativas de decision multimodales comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion de rendimiento entre este artefacto y el modelo base no es posible con los datos aportados: el propio autor senala que los benchmarks upstream no miden este derivado cuantizado.

## Limitaciones y advertencias

- Calidad visual experimental: no se realizo ningun ajuste fino visual nuevo y el autor califica explicitamente de experimental la calidad de las decisiones sobre imagenes.
- Probabilidades sin calibrar en tareas de imagen: la cabeza pointer no ha sido calibrada para vision, por lo que no deben usarse como confianza fiable sin validacion propia.
- Evidencia de evaluacion muy debil: los unicos resultados son 18 casos sinteticos y 6 fotografias que pueden formar parte del pretraining; no hay conjunto held-out ni benchmarks publicos.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion por terceros ni issues documentados.
- Restricciones de entrada: una sola imagen estatica por peticion, maximo 32 megapixeles decodificados, presupuesto de 16 a 512 tokens de imagen y un maximo de 2048 tokens para imagen mas texto.
- Dependencia total del runtime propio: no funciona con las herramientas estandar de MLX, Transformers ni servicios de inferencia alojados, lo que complica la integracion en produccion.
- Plataforma limitada a Apple Silicon; sin soporte CUDA ni ruta documentada en CPU x86. El rendimiento en equipos distintos al M4 de 16 GiB no esta validado.
- Idiomas limitados a ingles y ruso, sin soporte declarado de castellano.
- El checkpoint base es la variante Base, no instruction-tuned, y no se documentan datos de entrenamiento ni tecnicas de alineacion como RLHF o DPO.
- Discrepancia de identificadores: el identificador de HuggingFace es `r3lax/sys1mlx`, mientras que el comando de descarga de la model card apunta a `ardanila/sys1mlx`; conviene verificar cual es el repositorio vigente antes de automatizar descargas.
- La cuantizacion se genero con MLX 0.32.2 sobre CPU Linux y puede diferir de una conversion sobre Metal, ademas de que omitir la correccion de normalizacion Q/K de DeltaNet altera las salidas.
- La licencia declarada del artefacto es apache-2.0, pero no se detallan en la informacion disponible las condiciones del checkpoint base ni del adaptador LoRA de origen; conviene revisar `ATTRIBUTION.md` y las licencias upstream antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/r3lax/sys1mlx
- Repositorio alternativo citado en la model card para la descarga: https://huggingface.co/ardanila/sys1mlx
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Fichero de atribucion de fuentes dentro del repositorio: `ATTRIBUTION.md` (referenciado en la model card, sin URL directa en la informacion disponible)
- Receta de exportacion a ANE incluida en el repositorio: `experimental/ane_export.py` (referenciada en la model card, sin URL directa en la informacion disponible)

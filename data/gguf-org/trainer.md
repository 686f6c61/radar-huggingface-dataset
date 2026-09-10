# gguf-org/trainer

## Resumen

gguf-trainer es una herramienta de entrenamiento con interfaz grafica (GUI en navegador y CLI en Python) desarrollada por gguf-org y publicada en Hugging Face como `gguf-org/trainer` bajo licencia MIT. No es un modelo de lenguaje, sino un entrenador de adaptadores `pig_clip`: pequenas redes resampler que permiten que `pig_clip` (un modelo nativo de entrenamiento y ajuste fino distribuido en formato GGUF) sustituya al codificador de texto original de un modelo de difusion dentro del motor `ggk`. El primer paquete de entrenamiento incluido (`trainer llada`) tiene como objetivo LLaDA-Image-Turbo, cuyo stack de texto LLaDA2-MoE de 16B se reemplaza por `pig_clip` mas un adaptador de 256 queries.

El problema que resuelve es practico: permite destilar el comportamiento del codificador de texto de un modelo de difusion sobre un estudiante mucho mas ligero, sin necesidad de instalar diffusers ni de mantener un checkout de referencia, y con un pipeline por etapas (corpus, precalculo de validacion, precalculo de entrenamiento, entrenamiento, exportacion y evaluacion) que es idempotente y reanudable tras un reinicio. Todo el flujo es local: los modelos, los datasets y las salidas se referencian por ruta del sistema de archivos mediante un explorador de ficheros integrado, y nada se sube a la nube.

Es relevante ahora porque reduce el coste de inferencia y de VRAM de la generacion y edicion de imagenes al eliminar la necesidad de cargar un stack de texto de 16B en produccion, y porque el adaptador resultante es solo de texto, por lo que se combina sin cambios con el codificador de vision SigVQ del modelo para tareas de edicion de imagen. El adaptador exportado se distribuye como GGUF en f16 y se consume desde `ggk` version 0.5.7 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo de lenguaje: es una herramienta de entrenamiento (GUI + CLI en Python). El componente entrenable es un adaptador Perceiver resampler sin semilla, con self-attention, cross-attention y MLP con GELU, head_dim 64, ancho 1024 y profundidad 6 |
| Parametros totales | No disponible (el stack docente LLaDA2-MoE tiene 16B, pero no es el artefacto que se entrena ni el que se publica) |
| Parametros activos | No aplica al artefacto entrenado. El docente LLaDA2-MoE es MoE, pero su numero de parametros activos no se detalla en la informacion disponible |
| Longitud de contexto | No disponible. El adaptador produce 256 queries (256 filas de QueryFormer, `cap_feats` de `[256, 2560]`) |
| Tipos de cuantizacion | Exportacion en f16 para los pesos, con f32 para normas, sesgos y query. No se documentan otros niveles de cuantizacion |
| Idiomas soportados | No disponible. El tokenizador del estudiante es Qwen BPE sin tokens especiales |
| Licencia | MIT |
| Formato de pesos | GGUF (por ejemplo, `pig_llada_adapter-f16.gguf`) y checkpoints de PyTorch (`.pt`: `last.pt`, `best.pt`) |
| Distribucion | Paquete Python instalable con `pip install gguf-trainer`; GUI en `http://127.0.0.1:8655/` |
| Motor destino | `ggk` >= 0.5.7 |

## Arquitectura y entrenamiento

El pipeline destila el stack de texto de LLaDA-Image-Turbo. El objetivo docente por prompt son las 256 filas de QueryFormer de `cap_feats` (`[256, 2560]`): LLaDA2-MoE se ejecuta sobre `[tokens ; 256 queries]` con el texto enmascarado para que no vea las queries, y despues se aplica una `text_projection` de 6 capas. Tanto QueryFormer como `text_projection` estan reimplementados en PyTorch puro, con resultados bit-exactos frente a los originales de diffusers, de modo que no hace falta instalar diffusers ni disponer de un checkout de referencia. El backbone MoE se carga mediante `trust_remote_code` desde el snapshot y se coloca de forma secuencial: primero la GPU elegida hasta agotar su presupuesto, despues el resto de dispositivos CUDA y, por ultimo, la RAM de la CPU. La pestana de precalculo permite cambiar al reparto balanceado de accelerate, que limita la tarjeta mayor a una cuota uniforme del modelo y descarga el resto, a costa de aproximadamente la mitad del rendimiento.

El estudiante es `pig_clip`, del que se toman los estados ocultos tras la normalizacion final sobre la plantilla exacta del motor (`<role>HUMAN</role> Generate an image: {text}\n<role>ASSISTANT</role>\n<IMAGE1>`), con tokenizador Qwen BPE sin tokens especiales. El adaptador es un Perceiver resampler sin semilla (self-attention mas cross-attention mas MLP con GELU, head_dim 64) entrenado con MSE blanqueado mas coseno sobre objetivos estandarizados por dimension. La exportacion pliega la estandarizacion dentro de `out_proj` y escribe pesos en f16 y normas, sesgos y query en f32. Los hiperparametros por defecto del recetario (`trainer8`) son ancho 1024, profundidad 6, 20.000 pasos, batch 32 y learning rate 2e-4, todos editables. El corpus se construye con datasets publicos de prompts (Stable Diffusion prompts, Midjourney prompts, DiffusionDB, VidProM) y con ficheros propios `.txt` o `.jsonl`, inyectando aproximadamente un 1% de prompts vacios para que el adaptador aprenda el prompt vacio de CFG.

## Capacidades

- Entrenamiento de adaptadores resampler `pig_clip` para sustituir el codificador de texto de un modelo de difusion por `pig_clip` mas un adaptador de 256 queries.
- Destilacion del stack de texto LLaDA2-MoE de 16B de LLaDA-Image-Turbo mediante objetivos QueryFormer y `text_projection` reimplementados en PyTorch puro.
- Precalculo por etapas con pipeline idempotente y checkpointed: corpus, precalculo de validacion, precalculo de entrenamiento, entrenamiento, exportacion y evaluacion.
- Reanudacion tras interrupcion o reinicio: cada shard se escribe de forma atomica y se omite si ya existe; el entrenamiento guarda `last.pt` cada N pasos (y en Stop o SIGTERM) incluyendo optimizador, RNG y posicion exacta en el flujo de shards.
- Exportacion a GGUF (`pig_llada_adapter-f16.gguf`) con pesos f16 y parametros auxiliares en f32, y regeneracion bajo demanda desde `best.pt`.
- Gestion de materiales: descarga de lo que falte, deteccion automatica de ficheros ya presentes en el proyecto, en el directorio de arranque, en `materials/` de otro proyecto o en la carpeta indicada por `GGUF_TRAINER_MATERIALS`, y enlace en lugar de descarga duplicada.
- Descargas en procesos independientes que sobreviven al cierre de la GUI y se reanudan tras una interrupcion o un reinicio.
- Interfaz grafica con pestanas de configuracion, entrenamiento, hardware, logs y salida, grafica de perdida y coseno en vivo, metricas actuales y lecturas de GPU, CPU y RAM.
- Interfaz de linea de comandos equivalente en modo headless: `run`, `start`, `stop`, `status` y `download`.
- Monitorizacion de hardware: GPUs via `nvidia-smi` y torch, RAM, disco y versiones de Python, torch y transformers.
- Colocacion del docente en multiples GPU con descarga a CPU RAM, o reparto balanceado mediante accelerate.
- Emparejamiento del adaptador, que es solo de texto, con el codificador de vision SigVQ del modelo para edicion de imagen.
- Uso del adaptador exportado desde `ggk` 0.5.7 o superior mediante el comando de difusion.
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible (no es un modelo de lenguaje generativo).

## Casos de uso

- Reduccion de VRAM en produccion de generacion de imagenes: sustituir el stack de texto LLaDA2-MoE de 16B de LLaDA-Image-Turbo por `pig_clip` mas el adaptador de 256 queries reduce drasticamente la memoria necesaria para el condicionamiento textual, manteniendo el codificador de vision SigVQ.
- Ajuste del condicionamiento textual a un dominio propio: entrenar el adaptador con un corpus propio en `.txt` o `.jsonl` (prompts de producto, estilo de marca, vocabulario tecnico) para que el modelo responda mejor a ese lenguaje sin reentrenar el modelo de difusion.
- Edicion de imagenes con SigVQ: como el adaptador es solo de texto, se combina sin cambios con el codificador de vision SigVQ (2,4 GB, opcional) para tareas de edicion guiadas por instrucciones textuales.
- Entrenamiento desatendido en servidores: lanzar el pipeline como proceso independiente (`gguf-trainer start`) y reanudarlo tras un reinicio sin perder el optimizador, el estado del RNG ni la posicion en el flujo de shards.
- Aprovechamiento de equipos con varias GPU o con VRAM limitada: colocar el docente de forma secuencial por presupuestos por dispositivo con descarga a RAM, o usar el reparto balanceado de accelerate cuando la tarjeta principal es el cuello de botella.
- Reutilizacion de materiales entre proyectos: los ficheros ya descargados se detectan en el proyecto, en el directorio de arranque, en `materials/` de otro proyecto o en `GGUF_TRAINER_MATERIALS`, evitando descargas duplicadas de los 33 GB del docente.
- Automatizacion en pipelines de CI o scripts: usar los subcomandos `download`, `run`, `start`, `stop` y `status` para integrar el entrenamiento y la exportacion sin interfaz grafica.
- Evaluacion del artefacto exportado: la propia herramienta evalua el GGUF generado y muestra el comando de `ggk` que lo consume, lo que facilita la verificacion antes de desplegarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad del adaptador entrenado (por ejemplo, similitud con el docente, FID o CLIP score) ni comparaciones numericas con alternativas. El unico dato de rendimiento mencionado es cualitativo: el reparto balanceado de accelerate en la fase de precalculo reduce el throughput a aproximadamente la mitad.

## Requisitos de hardware

- Materiales del paquete LLaDA-Image: stack de texto docente desde `inclusionAI/LLaDA-Image-Turbo` (codificador de texto, QueryFormer, `text_projection` y tokenizador), 33 GB; tokenizador y config del estudiante desde `callgg/pig-clip-tokenizer`, 11 MB; codificador de vision SigVQ opcional, 2,4 GB; y el fichero local `pig_clip-f16.gguf` que aporta el usuario.
- VRAM para inferencia del adaptador exportado: no disponible de forma explicita. El adaptador es una red resampler de ancho 1024 y profundidad 6, mucho mas pequena que el stack de 16B al que sustituye, por lo que la reduccion de memoria es el objetivo declarado del proyecto.
- Colocacion del docente durante el precalculo: la GPU elegida hasta su presupuesto, despues el resto de dispositivos CUDA y, por ultimo, RAM de CPU. El reparto balanceado de accelerate limita la tarjeta mayor a una cuota uniforme del modelo y descarga el resto, con aproximadamente la mitad de rendimiento.
- Presupuestos de memoria para el docente y dispositivo: editables desde la pestana de configuracion del precalculo.
- GPUs recomendadas: no disponible. La herramienta detecta GPUs via `nvidia-smi` y torch, pero no publica una lista de modelos recomendados.
- Encaje en GPU de consumo: no disponible como dato explicito; la arquitectura de descarga secuencial a otras GPU y a RAM de CPU esta pensada precisamente para hardware con memoria limitada.
- Opciones de despliegue: `gguf-trainer` como herramienta de entrenamiento (GUI en `http://127.0.0.1:8655/` o CLI headless) y `ggk` version 0.5.7 o superior para consumir el adaptador GGUF exportado. vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible, salvo la observacion de que el reparto balanceado de accelerate ronda la mitad del rendimiento del modo secuencial.
- Almacenamiento: los materiales del docente (33 GB) mas corpus, shards precalculados, checkpoints y GGUFs exportados dentro de la carpeta del proyecto.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye herramientas comparables de entrenamiento de adaptadores para motores de difusion, ni datos de rendimiento del adaptador resultante que permitan una comparacion con alternativas. La unica referencia funcional es el propio stack docente LLaDA2-MoE de 16B, que este pipeline sustituye, pero no se ofrecen metricas de la sustitucion.

## Limitaciones y advertencias

- No es un modelo de lenguaje generativo: no produce texto, codigo ni razonamiento. Es una herramienta de entrenamiento, por lo que las capacidades tipo MMLU, HumanEval o GSM8K no aplican.
- La model card publicada esta truncada en el apartado de uso con `ggk`; el comando de ejemplo aparece cortado (`ggk diffuser engine -- --diffusion-model LLaDA-im`).
- No se publican benchmarks ni evaluaciones cuantitativas de la calidad del adaptador entrenado.
- El adaptador es solo de texto. La parte de vision depende del codificador SigVQ, que es opcional y se descarga aparte si se necesita.
- El paquete documentado esta especializado en LLaDA-Image-Turbo (`trainer llada`); no se detalla soporte para otros modelos de difusion.
- El flujo requiere descargar 33 GB de materiales docentes, ademas del `pig_clip-f16.gguf` que debe aportar el usuario, y de los 2,4 GB del codificador de vision si se usa.
- La reanudacion depende de que se conserve la carpeta del proyecto: `project.json` (configuracion) y `state.json` (progreso), junto con checkpoints y shards.
- La carga del backbone MoE usa `trust_remote_code` desde el snapshot, lo que implica ejecutar codigo remoto; conviene revisar el origen de los ficheros.
- El reparto balanceado de accelerate reduce el throughput aproximadamente a la mitad durante el precalculo.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. Conviene verificar las licencias de los materiales docentes descargados por separado, ya que no dependen de la licencia de esta herramienta.
- Riesgo de alucinacion: no aplica al artefacto (no genera texto). La calidad del adaptador depende de la fidelidad con la que reproduzca el comportamiento del docente y del corpus utilizado.
- La informacion sobre idiomas soportados no esta disponible; el tokenizador del estudiante es Qwen BPE sin tokens especiales y el corpus de prompts sugerido esta mayoritariamente en ingles.
- Los datos de la ficha de Hugging Face indican 0 descargas y 1 like, con fecha de creacion y actualizacion del 10 de septiembre de 2026, lo que sugiere un proyecto muy reciente y con poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gguf-org/trainer
- Stack docente referenciado en la model card: https://huggingface.co/inclusionAI/LLaDA-Image-Turbo
- Tokenizador y config del estudiante referenciados en la model card: https://huggingface.co/callgg/pig-clip-tokenizer
- Paquete Python: `pip install gguf-trainer` (indice de PyPI, no se proporciona URL directa)
- Interfaz grafica local: http://127.0.0.1:8655/
- No se han encontrado enlaces relevantes (papers, blogs, repos o demos) en los resultados de la busqueda web proporcionada; los resultados recibidos no guardan relacion con el modelo.

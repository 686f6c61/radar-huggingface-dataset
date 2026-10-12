# robertbschuette/Minimax-H3-T2VA-Veda-8NFE-600Step-Preview

## Resumen

Veda-MiniMax-H3 es un predictor de atencion dispersa (sparse attention) aprendido, distribuido como checkpoint independiente para el modelo de generacion de video con audio MiniMax-H3 de MiniMaxAI. No es un modelo generativo autonomo ni un LoRA: su unica funcion es decidir, en cada paso de denoising, que aproximadamente el 10 % de las conexiones de atencion del backbone son relevantes y saltar el 90 % restante, reduciendo el coste computacional de la atencion sin modificar los pesos ni el estilo del modelo base. Este repositorio concreto es una version preview alojada por el usuario robertbschuette bajo el espacio de nombres de Veda-Sparse.

El checkpoint se entrena y evalua junto con MiniMax-H3-Turbo-Lora para generacion en 8 pasos (8NFE), aunque segun la model card es agnostico tanto de la modalidad como del numero de pasos de difusion. Es decir, el etiquetado T2VA y 8NFE del nombre solo describe la configuracion de entrenamiento y no limita su uso a otras tareas como FL2VA (primer y ultimo fotograma a video con audio) o R2VA (referencia a video con audio). El metodo esta descrito en el paper arXiv:2605.30325 y se distribuye como nodo de ComfyUI y dentro del codebase Miowtion.

Su relevancia practica reside en el ahorro de computo: la atencion domina el coste de inferencia de los modelos de difusion de video, y Veda reporta hasta 6,8x de aceleracion en atencion y 3,1x de extremo a extremo en clips largos, con ganancias mayores cuanto mayor es la duracion del video. El checkpoint ocupa aproximadamente 0,3 GB en fp8 y se publica bajo licencia minimax-h3-community, la misma del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Predictor de atencion dispersa aprendido (veda_tile_score_predictor) sobre transformer de difusion de video MiniMax-H3 |
| Parametros totales | no disponible (checkpoint fp8 de aproximadamente 0,3 GB en el repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 (checkpoint publicado como minimax_h3_t2va_veda_8nfe_600step_preview_fp8.safetensors) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Veda es un metodo de atencion dispersa aprendida para modelos de difusion de video. En lugar de calcular la atencion completa, entrena un predictor ligero destilado del modelo completo que identifica el 10 % de las conexiones de atencion mas relevantes y omite el resto. La atencion se organiza de forma block-sparse (dispersa por bloques), de ahi las etiquetas sparse-attention y block-sparse del repositorio. Se trata de un componente plug-and-play: no altera los pesos del backbone ni funciona como LoRA, y es compatible con cualquier LoRA y con variantes ya ajustadas de MiniMax-H3.

Este checkpoint se entrena y evalua con MiniMax-H3-Turbo-Lora para generacion en 8 pasos, y su nombre incluye la etiqueta 600Step referida al entrenamiento del predictor. La model card insiste en que la eleccion de modalidad (T2VA, FL2VA, R2VA) y el numero de pasos de difusion no estan restringidos por el checkpoint, sino que este es agnostico a ambos. El numero de tokens de entrenamiento, la composicion del dataset y si hubo etapas de RLHF o DPO no se detallan en la informacion proporcionada.

## Capacidades

- Aceleracion de la inferencia del modelo MiniMax-H3 mediante atencion dispersa: retiene aproximadamente el 10 % de las conexiones de atencion y descarta el 90 % restante.
- Generacion de video con audio (text-to-audio-video) a traves del backbone MiniMax-H3, en las modalidades T2VA, FL2VA y R2VA.
- Compatibilidad con distintos numeros de pasos de difusion: no esta limitado a los 8 pasos de su configuracion de entrenamiento.
- Compatibilidad con cualquier LoRA y con variantes ajustadas de MiniMax-H3, incluida MiniMax-H3-Turbo-Lora.
- Integracion como nodo de ComfyUI (veda-sparse-attention) y dentro del codebase Miowtion.
- Ganancia de rendimiento creciente con la duracion del video, segun la tabla de rendimiento de la model card.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso, ya que no es un modelo de lenguaje.
- El soporte multilingue no esta documentado en la informacion disponible; depende del codificador de texto del backbone MiniMax-H3, cuyas caracteristicas no se detallan.

## Casos de uso

- Aceleracion de la generacion de video con audio en produccion: integrando el predictor en el pipeline de MiniMax-H3 se reduce el coste de la atencion hasta 6,79x y el tiempo extremo a extremo hasta 3,12x en clips largos (16:9, 14,4 s), lo que abarata el coste por clip en servicios de generacion.
- Generacion de clips largos en GPU de consumo: en una RTX 4090 con clips de 16:9 y 14,4 s se reporta una aceleracion de extremo a extremo de 2,82x, lo que hace viable generar videos de esa duracion en hardware de gama alta para consumidores en lugar de exigir GPUs de centro de datos.
- Creacion de contenido asistida por prompt en ComfyUI: el nodo veda-sparse-attention permite a estudios y creadores individuales insertar el predictor en un flujo de trabajo de ComfyUI existente sin reentrenar ni sustituir el backbone.
- Iteracion rapida de prompts y pruebas A/B: al combinarse con Turbo LoRA y 8 pasos de difusion, permite generar variaciones de un mismo clip con prompt y semilla distintos para comparar resultados antes de fijar la version final.
- Generacion de video de referencia a video (R2VA) para edicion y doblaje: la modalidad de referencia permite condicionar la generacion sobre un sujeto o clip de entrada, util en posproduccion y localizacion de contenido audiovisual.
- Prototipado en investigacion sobre atencion dispersa: el predictor sirve como caso de estudio reproducible de destilacion de un selector de atencion block-sparse sobre un modelo de difusion de video, con codigo disponible en Miowtion y paper en arXiv.
- Reduccion del coste energetico por clip: al recortar el 90 % de las operaciones de atencion, disminuye la energia consumida por video generado, relevante para despliegues con muchas peticiones concurrentes.
- Despliegue en infraestructura con VRAM limitada: la combinacion del predictor (0,3 GB) con el backbone cuantizado permite servir el modelo en nodos con presupuesto de memoria ajustado, siempre que el backbone quepa en el dispositivo.

## Benchmarks y rendimiento

La model card no incluye benchmarks de calidad tipo MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje. Los datos de rendimiento publicados son las aceleraciones por paso de denoising respecto a atencion completa con MiniMax-H3 mas Turbo LoRA, manteniendo el 10 % de la atencion.

| GPU | Clip | Aceleracion de atencion | Aceleracion extremo a extremo |
|---|---|---|---|
| RTX PRO 6000 Blackwell | 16:9 · 14,4 s | 6,79x | 3,12x |
| RTX 4090 | 16:9 · 5,17 s | 4,75x | 1,77x |
| RTX 4090 | 16:9 · 10,1 s | 6,22x | 2,42x |
| RTX 4090 | 16:9 · 14,4 s | 6,31x | 2,82x |

Ademas, la model card afirma una aceleracion de atencion de hasta 6,8x y de extremo a extremo de hasta 3,1x, con calidad visual y de audio a la par de la atencion completa. No se proporcionan metricas objetivas de calidad (FVD, CLIP, etc.) en la informacion disponible.

## Requisitos de hardware

- El checkpoint del predictor en fp8 ocupa aproximadamente 0,3 GB, segun el tamano del repositorio.
- La VRAM total necesaria la determina el backbone MiniMax-H3, no el predictor. La informacion proporcionada no incluye cifras de VRAM para el backbone, por lo que se marca como no disponible.
- GPU utilizadas en los ejemplos publicados: RTX PRO 6000 Blackwell (clips de 16:9 y 14,4 s) y RTX 4090 (clips de 5,17 s, 10,1 s y 14,4 s).
- Cabe en GPU de consumo: la model card demuestra generacion de clips de 16:9 y 14,4 s en una RTX 4090, por lo que el conjunto es viable en una GPU de 24 GB, previsiblemente con cuantizacion del backbone.
- Opciones de despliegue: nodo personalizado de ComfyUI (comfy node install veda-sparse-attention) y el codebase Miowtion (pip install -e '.[gpu,encode]'). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: se reportan aceleraciones relativas (ver tabla de benchmarks) en lugar de tiempos absolutos, por lo que los valores de latencia y throughput concretos se consideran no disponibles.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada comparativas con otros predictores de atencion dispersa para modelos de difusion de video. La unica referencia de comparacion interna es la atencion completa (full attention) del propio MiniMax-H3, frente a la cual Veda ofrece las aceleraciones recogidas en la seccion de benchmarks. Las alternativas de la misma categoria (por ejemplo, otros metodos de atencion dispersa para difusion de video) se consideran no disponibles en esta ficha.

## Limitaciones y advertencias

- Es un componente auxiliar, no un modelo autonomo: sin el backbone MiniMax-H3 y su codigo de inferencia (Miowtion o ComfyUI) no genera nada por si mismo.
- Este repositorio es una version preview; la model card anuncia la publicacion proxima de un checkpoint especifico para R2VA con mejor calidad, lo que sugiere que la version actual puede no ser la definitiva en esa modalidad.
- Sesgos conocidos: no documentados en la informacion proporcionada. Al heredar el comportamiento del backbone MiniMax-H3, podria reproducir los sesgos de este, pero no hay datos que lo confirmen.
- Riesgo de alucinacion: no aplica en el sentido textual; en generacion de video el equivalente seria la aparicion de artefactos visuales o de audio, cuya tasa no se cuantifica en la model card, que solo afirma calidad a la par de la atencion completa.
- Limitaciones de contexto e idioma: no disponibles. El limite de duracion del clip y el soporte idiomatico dependen de MiniMax-H3 y no se detallan.
- El checkpoint se distribuye en fp8, lo que puede implicar una perdida de precision respecto a una version en precision completa; no se documenta una variante en bf16 o fp16.
- Licencia: minimax-h3-community (etiquetada como license: other en HuggingFace). Es una licencia especifica de comunidad, no una licencia de codigo abierto estandar, por lo que conviene revisar el archivo LICENSE antes de cualquier uso comercial.
- La model card advierte de que los enlaces de descarga hacen referencia al espacio Veda-Sparse, mientras que este repositorio figura bajo el autor robertbschuette; conviene verificar el origen del checkpoint antes de integrarlo en produccion.
- Se declaran 0 descargas y 0 likes en el momento de la consulta, lo que indica una validacion externa todavia muy limitada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/robertbschuette/Minimax-H3-T2VA-Veda-8NFE-600Step-Preview
- Demo en linea: https://veda.hanxiao.run/
- Pagina del proyecto: https://veda-sparse.github.io/
- Paper: https://arxiv.org/abs/2605.30325
- Codigo (Miowtion): https://github.com/veda-sparse/Miowtion
- Nodo de ComfyUI: https://registry.comfy.org/publishers/veda-sparse/nodes/veda-sparse-attention
- Guia de despliegue: AGENTS.md (incluida en el repositorio)
- Licencia: LICENSE (minimax-h3-community, incluida en el repositorio)
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- LoRA Turbo utilizado en el entrenamiento y evaluacion: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora

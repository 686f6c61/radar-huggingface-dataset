# SeeSee21/QWEN-Anime

## Resumen

QWEN-Anime es un ajuste fino (finetune) orientado a la generacion de imagenes de estilo anime, construido sobre los modelos Qwen-Image-Edit de Alibaba (concretamente las versiones 2509 y 2511). Lo desarrolla el usuario independiente SeeSee21 y se distribuye en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de difusion (no de lenguaje) que hereda la arquitectura del modelo base de Qwen-Image-Edit y la especializa en estetica anime, anadiendo ademas capacidades de edicion de imagenes.

La version mas reciente, Beta3-AIO, combina generacion texto-a-imagen (text-to-image) y edicion imagen-a-imagen (image-to-image / image editing) en un unico checkpoint "todo en uno" que integra VAE y text encoder. Segun la model card, permite editar entre 1 y 3 imagenes simultaneamente, combinar personajes de distintas imagenes, transferir estilo y fusionar escenas, con un minimo de 4 pasos de muestreo. El text encoder es una variante "uncut" basada en Qwen 2.5 VL 7B en FP8.

Es relevante ahora porque el ecosistema de generacion de imagen open source esta migrando hacia modelos base de Qwen (Qwen-Image / Qwen-Image-Edit) y este ajuste demuestra la viabilidad de especializar dichos modelos para dominios concretos (anime) manteniendo la licencia permisiva Apache 2.0. El repo se encuentra en estado beta y, en el momento de la ficha, con los pesos en proceso de subida (unos 300 GB en total) y sin descargas ni likes registrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para imagen, basado en Qwen-Image-Edit (base 2509 / 2511); no disponible el detalle interno de la arquitectura |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | FP8 (Beta3-AIO, 26,99 GB); BF16, FP16, FP8 y GGUF (F16, Q8, Q6_K, Q4_K_S) en Beta2 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF (GGUF requiere ComfyUI-GGUF) |

## Arquitectura y entrenamiento

QWEN-Anime es un finetune de los modelos Qwen-Image-Edit 2509 y 2511. No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento ni sobre si se emplearon tecnicas de RLHF/DPO (conceptos, por otro lado, propios de modelos de lenguaje y no directamente aplicables a un modelo de difusion). La model card describe el proceso como "base training" en la version Beta1, sin detallar hiperparametros, resolucion de entrenamiento ni numero de pasos.

La innovacion tecnica destacable es el empaquetado "all-in-one": las versiones Beta2-AIO y Beta3-AIO integran VAE y text encoder en un unico checkpoint, de modo que se pueden cargar con el nodo estandar "Load Checkpoint" de ComfyUI sin ficheros separados. La Beta3 incorpora ademas un text encoder "uncut" basado en Qwen 2.5 VL 7B en FP8, pensado para dar mayor libertad creativa al prompt, y reduce el minimo de pasos de muestreo de 8 a 4 (recomendandose 20 para maxima calidad). El sampler y scheduler sugeridos son Euler y Beta, con CFG 3.5.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con estetica anime.
- Edicion de imagenes (image-to-image / image editing) sobre 1 a 3 imagenes de entrada simultaneamente (Beta3).
- Combinacion de multiples personajes procedentes de imagenes distintas en una sola composicion.
- Transferencia de estilo entre imagenes y fusion/transformacion de escenas.
- Preservacion mejorada de detalles y mayor consistencia de resultados respecto a versiones anteriores.
- Generacion rapida con un minimo de 4 pasos de muestreo (modo velocidad) hasta 20 pasos (modo calidad).
- Compatibilidad con Lightning LoRA (senalada para Beta2).
- Soporte de flujo de trabajo en ComfyUI (workflow oficial incluido en el repo).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de comprension ni audio; es exclusivamente un modelo generativo de imagen.

## Casos de uso

- Ilustracion de personajes anime para proyectos indie: el modelo genera ilustraciones coherentes a partir de prompts en ingles, adecuado para estudios pequenos que necesitan arte conceptual rapido sin coste de licencia restrictiva.
- Edicion y retoque de ilustraciones existentes: con la funcion image-to-image de Beta3 se pueden modificar poses, ropa o expresiones sobre 1-3 imagenes de referencia manteniendo el estilo.
- Creacion de hojas de personaje (character sheets): combinando varias imagenes de entrada se pueden fusionar rasgos de distintos disenos para explorar variantes de un mismo personaje.
- Transferencia de estilo entre bocetos y arte final: se puede usar una imagen de referencia estilistica y aplicarla a un boceto, util en pipelines de produccion de webcomics o manga.
- Prototipado rapido en ComfyUI: gracias al formato all-in-one y al minimo de 4 pasos, encaja en flujos de iteracion rapida donde se generan decenas de variantes para seleccion artistica.
- Generacion de assets para videojuegos o visual novels: retratos, fondos y sprites en estilo anime con licencia Apache 2.0, lo que facilita su uso comercial sin las restricciones de modelos con licencias no comerciales.
- Experimentacion e investigacion en finetuning de modelos de difusion: al estar construido sobre Qwen-Image-Edit y publicarse pesos en safetensors y GGUF, sirve como punto de partida para otros ajustes de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, evaluaciones humanas) ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada: el checkpoint Beta3-AIO en FP8 ocupa 26,99 GB, por lo que la inferencia requiere al menos ~27-30 GB de VRAM en funcion del overhead del pipeline y la resolucion.
- La version GGUF Q4_K_S (10,72 GB) de Beta2 permite inferencia en GPUs consumer de gama alta (por ejemplo, RTX 3090/4090 de 24 GB) con cuantizacion agresiva.
- GPUs recomendadas: A100 (40/80 GB), H100 o RTX 4090 (24 GB) para el formato FP8; para GGUF Q4/Q6 cabe en RTX 3090, 4080/4090 y posiblemente en GPUs de 16 GB con Q4.
- Cabe en GPU consumer: si, en el caso de las variantes GGUF cuantizadas; el FP8 de 27 GB no cabe en GPUs de 24 GB sin offloading.
- Opciones de despliegue: ComfyUI (flujo oficial, con soporte nativo y ComfyUI-GGUF para los ficheros GGUF). No se documentan otros runners como vLLM, TGI o llama.cpp (este ultimo no aplica a modelos de difusion).
- Latencia y throughput: no disponibles; la model card solo indica cualitativamente que Beta3 es mas rapida que versiones anteriores (4 pasos minimos frente a 8 o 20+).

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QWEN-Anime (Beta3-AIO) | Difusion imagen, finetune anime | Qwen-Image-Edit 2511 | No disponible | Apache 2.0 | Hugging Face, Civitai, SeaArt |
| Qwen-Image-Edit (base) | Difusion imagen, edicion | — | No disponible | No disponible en la informacion | Hugging Face (Qwen) |
| Stable Diffusion XL (finetunes anime) | Difusion imagen | SDXL | ~1024x1024 tipico | OpenRAIL / CreativeML segun variante | Amplia (Civitai, HF) |

No se dispone de datos cuantitativos de rendimiento para establecer una comparacion numerica fiable con alternativas. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Modelo en estado beta: la model card lo etiqueta explicitamente como "Beta3-AIO" y advierte de que los pesos (unos 300 GB) seguian subiendose el 7 de noviembre de 2026, por lo que puede haber ficheros incompletos o ausentes.
- Solo soporta prompts en ingles (idioma declarado: en); el rendimiento con otros idiomas no esta documentado.
- No hay informacion sobre sesgos del dataset de entrenamiento ni sobre la representacion de distintos grupos; al ser un finetune de dominio anime, hereda los sesgos estilisticos del modelo base y del dataset de ajuste.
- Riesgo de resultados inconsistentes: la propia model card indica que los resultados dependen de la semilla, el prompt y las imagenes de entrada, y recomienda experimentar.
- El text encoder "uncut" puede aumentar la libertad creativa pero tambien la imprevisibilidad del resultado.
- Requisitos de hardware elevados: el formato FP8 de 27 GB no cabe en GPUs de 24 GB sin cuantizacion adicional u offloading.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen-Image-Edit, ya que las obligaciones de atribucion pueden recaer tambien sobre el modelo original.
- No se documentan garantias de calidad para uso comercial en produccion; al ser un ajuste de un autor independiente sin benchmarks publicados, la evaluacion cualitativa corre a cargo del usuario.

## Enlaces

- Hugging Face: https://huggingface.co/SeeSee21/QWEN-Anime
- Civitai (modelo): https://civitai.red/models/2122738/qwen-anime
- Civitai (workflow oficial): https://civitai.red/models/2135240
- SeaArt AI: https://www.seaart.ai/models/detail/411ea33d5d9bbd7f485d3f852881f05d
- ComfyUI-GGUF (requerido para ficheros GGUF): https://github.com/city96/ComfyUI-GGUF
- Modelo base Qwen-Image-Edit 2509: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Modelo base Qwen-Image-Edit 2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511

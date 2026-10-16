# Runware/flux-3-image-klein

## Resumen

FLUX 3 Image Klein es un modelo de generacion y edicion de imagenes de 5.548.681.984 parametros (etiquetado como 5.6B) desarrollado por Black Forest Labs. Se distribuye como pesos abiertos bajo la FLUX Kommunity License y el repositorio analizado es un espejo publicado por Runware (Runware/flux-3-image-klein) del checkpoint destilado oficial. Unifica en un solo modelo tres tareas que habitualmente requieren pipelines distintos: texto a imagen, edicion con una unica imagen de referencia y composicion con multiples referencias (hasta 10 imagenes de entrada), devolviendo siempre una imagen de salida.

La arquitectura combina un transformer de imagen de 5.6B parametros con un encoder de texto Qwen3-VL-4B-Instruct y un autoencoder de imagen, todo empaquetado en formato diffusers con pesos safetensors. El checkpoint destilado esta optimizado para inferencia rapida (16 pasos, sin guidance), frente al checkpoint Base sin destilar (50 pasos, guidance 3.5) orientado a fine-tuning, entrenamiento de LoRA e investigacion. El repositorio incluye el transformer en BF16 y variantes cuantizadas FP8 y NVFP4, con un tamano total de 43,3 GB.

Su relevancia actual reside en dos factores. Primero, la integracion nativa de cajas delimitadoras (bounding boxes) en el prompt sobre una rejilla de 0 a 1000, que permite colocar, recolorear, mover, reemplazar o eliminar elementos de forma controlada. Segundo, su dependencia explicita de un upsampler de prompts: el modelo espera caption completas de escena y no prompts cortos, por lo que el autor desaconseja su uso sin el modelo auxiliar flux-3-image-klein-pup.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para imagen con flow-map sampling; encoder de texto Qwen3-VL-4B-Instruct y autoencoder de imagen separados |
| Parametros totales | 5.548.681.984 (transformer de imagen; el encoder de texto es adicional) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP8 (variante fp8r), NVFP4 (variante nvfp4) |
| Idiomas soportados | en (ingles) |
| Licencia | flux-kommunity-license (FLUX Kommunity License) |
| Formato de pesos | safetensors (library_name: diffusers), mas archivos config.json, manifest.json, ae.safetensors y text_encoder/* |
| Tamano del repositorio | 43,3 GB |
| Pasos de muestreo (destilado) | 16 |
| Guidance (destilado) | ninguno |
| Imagenes de referencia | hasta 10 |
| Referencias de HuggingFace | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo se compone de tres piezas: un transformer de imagen de 5.6B parametros que realiza el muestreo, un encoder de texto Qwen3-VL-4B-Instruct que procesa la caption y las imagenes de referencia, y un autoencoder de imagen que traduce entre pixeles y latentes. La model card menciona explicitamente el uso de flow-map sampling, un esquema de muestreo de flujo, y el paquete no constituye una aplicacion de inferencia completa: requiere una implementacion compatible con este formato de checkpoint. Se ofrecen dos checkpoints con perfiles distintos: Klein Base (sin destilar, bfloat16, 50 pasos, guidance 3.5, pensado para fine-tuning, LoRA e investigacion) y Klein (destilado, bfloat16, 16 pasos, sin guidance, pensado para generacion, edicion, autohospedaje y el que alimenta la API de BFL).

El repositorio incluye el transformer en BF16 junto a variantes cuantizadas FP8 y NVFP4, el encoder de texto y el autoencoder. El modelo acepta un unico modelo para texto a imagen, edicion con una referencia y composicion multi-referencia, y admite cajas delimitadoras en el prompt sobre una rejilla de 0 a 1000 para guiar colocacion y escala (sin restringir pixeles a una mascara dura). La model card indica que el modelo debe usarse junto a un upsampler de prompts que expande la peticion a una caption completa de escena; el upsampler de referencia (flux-3-image-klein-pup) ocupa 18,8 GB y se carga por defecto en el codigo de referencia. No se proporcionan datos sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO, por lo que esos puntos quedan como no disponibles.

## Capacidades

- Generacion de texto a imagen a partir de captions completas de escena.
- Edicion de imagen con una unica referencia (image-to-image).
- Composicion multi-referencia con hasta 10 imagenes de entrada, generando una sola salida.
- Control mediante cajas delimitadoras en el prompt sobre rejilla 0-1000: colocar, recolorear, mover, reemplazar o eliminar elementos.
- Renderizado de texto dentro de las imagenes generadas.
- Integracion con el ecosistema diffusers mediante pipeline modular (parametro prompt para texto a imagen; parametro image, simple o lista, para edicion).
- Uso mediante codigo de referencia CLI con banderas --model, --image y --out, y con clasificador de seguridad NSFW cargado siempre.
- Soporte de un upsampler de prompts dedicado (flux-3-image-klein-pup) o de cualquier LLM alternativo con el system prompt adecuado.
- No se documentan capacidades de tool calling, agentes, audio, video ni razonamiento multi-paso.

## Casos de uso

- Edicion de producto para comercio electronico: partir de una fotografia de catalogo y generar variantes de color, fondo o iluminacion mediante prompts de edicion con una sola imagen de referencia, aprovechando el modo image-to-image del mismo checkpoint.
- Composicion de escenas a partir de multiples referencias: reunir hasta 10 imagenes (por ejemplo, un producto, un entorno y varios elementos de atrezzo) y obtener una composicion coherente sin montaje manual.
- Diseno grafico con control de maquetacion: usar las cajas delimitadoras en la rejilla 0-1000 para fijar posicion y escala de titulares, logotipos o bloques de texto, y emplear el renderizado de texto integrado para rotulos y banners.
- Generacion de material de marketing y creatividades: producir ilustraciones y escenas completas a partir de captions detalladas, integrandolo en flujos de produccion que ya usen la API de BFL o autohospedaje con diffusers.
- Iteracion visual de concepto (previsualizacion): generar una imagen con texto a imagen y refinarla despues con edicion para cambiar hora del dia, climatologia o materiales, manteniendo la composicion original.
- Prototipado de interfaces y mockups: colocar elementos de interfaz mediante cajas y regenerar variantes para explorar jerarquias visuales antes de pasar a herramientas de diseno.
- Automatizacion de pipelines de contenido con moderacion: al cargar siempre el clasificador Falconsai/nsfw_image_detection en el codigo de referencia, encaja en servicios que necesitan filtrado previo o posterior a la generacion.
- Investigacion y ajuste fino: usar el checkpoint Base (sin destilar, 50 pasos, guidance 3.5) para entrenamiento de LoRA y experimentacion, y el destilado para servir inferencia rapida en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La informacion proporcionada no incluye valores de metricas como FID, CLIP score, GenEval, MMLU, HumanEval ni comparaciones cuantitativas con otros modelos de imagen.

## Requisitos de hardware

- Pesos del transformer de imagen (estimacion a partir del recuento real de parametros): aproximadamente 11,1 GB en BF16, 5,5 GB en FP8 y 2,8 GB en NVFP4.
- El paquete incluye ademas el encoder de texto Qwen3-VL-4B-Instruct y el autoencoder; la model card advierte que el tamano de los paquetes cuantizados no equivale al consumo total de memoria de GPU.
- Upsampler de prompts de referencia: repositorio de 18,8 GB, cargado por defecto en el codigo de referencia (se puede desactivar con --no-pup).
- Repositorio completo con todas las variantes: 43,3 GB de disco.
- Cabe en GPU de consumo en funcion de la variante: NVFP4 y FP8 plantean escenarios compatibles con GPUs de 16-24 GB si se gestiona por separado el encoder de texto y el upsampler; el pipeline completo en BF16 con upsampler supera con holgura los 24 GB.
- GPU recomendadas: no especificadas por el autor. Para despliegue en servidor, GPUs de 24 GB o superiores (RTX 4090, L40S, A100 40/80 GB, H100) son las candidatas habituales segun variante y nivel de offload, aunque no hay cifras oficiales.
- Opciones de despliegue documentadas: pipeline modular de diffusers y codigo de referencia en CLI del repositorio GitHub de Black Forest Labs, que soporta flow-map sampling y este formato de checkpoint. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Los paquetes cuantizados exigen un cargador compatible con su formato.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el checkpoint destilado usa 16 pasos sin guidance frente a los 50 pasos con guidance 3.5 del Base.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos / guidance | Cuantizacion | Contexto / referencias | Licencia | Orientacion |
|---|---|---|---|---|---|---|
| FLUX 3 Image Klein (destilado) | 5,6B (transformer de imagen) | 16 / ninguno | BF16, FP8, NVFP4 | hasta 10 referencias | flux-kommunity-license | generacion, edicion, autohospedaje, API BFL |
| FLUX 3 Image Klein Base (sin destilar) | 5,6B (transformer de imagen) | 50 / 3.5 | bfloat16 | hasta 10 referencias | flux-kommunity-license | fine-tuning, LoRA, investigacion |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar entre las dos variantes de la propia familia (Klein y Klein Base). No se aportan datos de contexto, rendimiento ni licencia de otros modelos de imagen comparables, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Dependencia critica del upsampler de prompts: la model card indica explicitamente que no debe usarse el modelo sin upsampler, ya que un prompt corto enviado tal cual produce salidas genericas. Diffusers no ejecuta el upsampler por si mismo.
- Las cajas delimitadoras guian colocacion y escala, pero no restringen los pixeles a una mascara dura, por lo que el control de maquetacion no es exacto.
- Idioma: solo ingles declarado en la model card y en los tags. No se documenta soporte multilingue.
- Licencia: FLUX Kommunity License. Permite uso no comercial y ofrece una excepcion de salida comercial para usuarios que cumplan los terminos de "Qualifying Users", sujeto a las condiciones del texto legal. Es necesario revisar LICENSE.md antes de un despliegue comercial.
- El repositorio analizado (Runware/flux-3-image-klein) tiene 0 descargas y 0 likes en el momento de la consulta, y es un espejo de terceros del modelo de Black Forest Labs; conviene verificar procedencia e integridad frente a los repositorios oficiales.
- Clasificador de seguridad: el codigo de referencia carga siempre Falconsai/nsfw_image_detection, lo que implica una dependencia adicional y posibles falsos positivos o negativos propios de ese clasificador.
- Riesgo de alucinacion visual, artefactos y errores en el renderizado de texto: no se aportan tasas de error ni evaluaciones cuantitativas.
- Sesgos: no se documentan sesgos conocidos ni composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos demograficos o culturales con la informacion disponible.
- El paquete no es una aplicacion de inferencia completa: requiere una implementacion compatible con flow-map sampling y con el formato del checkpoint; las variantes cuantizadas requieren cargadores especificos.
- Aviso de fecha: los metadatos del repositorio indican creacion el 2026-10-16, fecha que conviene verificar antes de citar el modelo en produccion.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/Runware/flux-3-image-klein
- Checkpoint oficial destilado (Black Forest Labs): https://huggingface.co/black-forest-labs/flux-3-image-klein
- Checkpoint Base sin destilar: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Upsampler de prompts: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- System prompts del upsampler: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup/blob/main/system_prompts.json
- Variantes cuantizadas FP8: https://huggingface.co/black-forest-labs/flux-3-image-klein/tree/main/variants/fp8r
- Variantes cuantizadas NVFP4: https://huggingface.co/black-forest-labs/flux-3-image-klein/tree/main/variants/nvfp4
- Codigo de inferencia de referencia (GitHub): https://github.com/black-forest-labs/flux-3-image-klein
- API de Black Forest Labs: https://bfl.ai
- Clasificador de seguridad NSFW: https://huggingface.co/Falconsai/nsfw_image_detection
- Runware, plataforma de inferencia: https://runware.ai/
- Modelos disponibles en Runware: https://runware.ai/models
- Precios de Runware: https://runware.ai/pricing
- Panel de Runware: https://my.runware.ai/
- Acerca de Runware: https://runware.ai/about

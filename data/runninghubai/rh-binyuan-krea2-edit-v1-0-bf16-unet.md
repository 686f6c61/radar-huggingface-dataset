# RunningHubAI/rh-binyuan-krea2-edit-v1.0-bf16-unet

## Resumen

`rh-binyuan-krea2-edit-v1.0-bf16-unet` es un modelo de difusion en formato UNET publicado por RunningHubAI, derivado mediante fine-tuning del modelo base Krea2. Esta orientado a edicion de imagenes a partir de una imagen de entrada y una instruccion textual (pipeline `image-text-to-image`), y segun la model card tambien conserva capacidad de generacion texto-a-imagen. El autor original es un usuario de RunningHub identificado como "冰缘排骨" y la publicacion en Hugging Face corre a cargo de la plataforma RunningHubAI.

El repositorio contiene un unico fichero de pesos en precision bf16 de aproximadamente 24.527 MiB (unos 25,7 GB de tamano de repo), pensado para cargarse como UNET dentro de ComfyUI o en el entorno alojado de RunningHub. No se trata de un modelo de lenguaje: es un componente de un pipeline de difusion para imagenes, por lo que las metricas habituales de LLM (MMLU, HumanEval, GSM8K) no aplican.

La relevancia es acotada y practica: es una primera version (v1.0) de un modelo de edicion afinado por un tercero, distribuido en bf16 y sin informacion publica sobre licencia, composicion del dataset de entrenamiento ni evaluaciones cuantitativas. Resulta util para quien ya trabaje en el ecosistema ComfyUI y quiera probar un UNET de edicion alternativo, pero no hay datos que permitan recomendarlo en produccion frente a alternativas establecidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion (fine-tune de Krea2); no se especifica si usa transformer o convoluciones, ni variante SD/SDXL/Flux |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); no disponible la resolucion nativa soportada |
| Tipos de cuantizacion | solo se distribuye bf16; no se publican variantes GGUF, fp8 ni fp16 |
| Idiomas soportados | no disponibles (los prompts se procesan con el text encoder del pipeline, no incluido en este repo) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`binyuan_krea2_edit_v1.0_bf16.safetensors`, 24.527 MiB) |

## Arquitectura y entrenamiento

La model card describe el artefacto como un "UNET (image edit)" afinado a partir de Krea2. No se detalla la arquitectura interna (tipo de bloque, atencion, uso de cross-attention con el text encoder, VAE asociado) ni el numero de parametros. Tampoco se indica que text encoder ni que VAE deben acompanar al UNET, dato critico para reproducir el pipeline, aunque el tag `comfyui` sugiere que esta pensado para integrarse en un flujo de ComfyUI con los componentes habituales del modelo base Krea2.

No hay informacion sobre volumen de datos de entrenamiento, composicion del dataset, resolucion de entrenamiento, uso de RLHF/DPO (no aplicable en difusion en el sentido habitual) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El autor indica unicamente que es la primera version y que los resultados son "muy realistas" con "fuerte adherencia al prompt", afirmaciones cualitativas sin respaldo numerico publicado.

## Capacidades

- Edicion de imagenes guiada por texto: recibe una imagen de entrada y una instruccion para modificarla (pipeline `image-text-to-image`).
- Generacion texto-a-imagen: la model card afirma que tambien puede generar imagenes desde cero.
- Adherencia al prompt: declarada por el autor como punto fuerte, sin medicion publica.
- Realismo fotografico: declarado por el autor, sin ejemplos ni metricas en el repositorio.
- Integracion con ComfyUI: el tag y el formato de pesos apuntan a uso como nodo UNET en flujos ComfyUI.
- Ejecucion en RunningHub: enlace directo a la version alojada en la plataforma.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; dependen del text encoder del pipeline, no incluido.
- Vision, audio, thinking mode: no disponible.

## Casos de uso

- Edicion de imagenes por instruccion en ComfyUI: cargar el UNET en un flujo de edicion con el VAE y text encoder correspondientes a Krea2 para aplicar cambios locales o globales sobre una imagen existente. Adecuado si ya se trabaja en ComfyUI y se quiere evaluar una alternativa de edicion.
- Retoque de producto en catalogos de e-commerce: sustituir fondos, ajustar iluminacion o corregir detalles sobre fotografias de producto mediante prompts, siempre que la calidad se valide manualmente por tratarse de una v1.0 sin benchmarks.
- Prototipado rapido de variaciones creativas: generar o editar imagenes de concepto para equipos de diseno, usando el modo texto-a-imagen y el modo edicion en el mismo modelo.
- Pruebas de adherencia a prompt en investigacion aplicada: comparar cualitativamente este fine-tune frente al Krea2 base en tareas de edicion, dado que no hay evaluaciones publicadas.
- Automatizacion via API de RunningHub: desplegar el modelo a traves de la API de la plataforma para integrar edicion de imagenes en un backend sin gestionar infraestructura de GPU propia.
- Generacion de material grafico para campanas internas: crear borradores de imagenes promocionales que luego se revisan y retocan manualmente, asumiendo el riesgo de artefactos propio de un modelo sin validacion publica.
- Experimentacion con fine-tunes comunitarios: servir como ejemplo de fine-tune publicado por un usuario de una plataforma, util para estudiar flujos de publicacion y despliegue en ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud perceptual, evaluaciones humanas) ni comparaciones con el modelo base Krea2 u otros modelos de edicion.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero bf16 ocupa unos 24,5 GiB, por lo que cargar solo los pesos del UNET requiere al menos ~25 GB de VRAM; a eso hay que sumar el text encoder y el VAE del pipeline, lo que en la practica empuja el requisito por encima de 30 GB en bf16.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 (48 GB) para ejecucion comoda en bf16. En GPUs de 24 GB (RTX 3090/4090) no cabe en bf16 sin cuantizacion, y no se distribuyen variantes cuantizadas.
- Cabe en consumer GPU: no en bf16 con el pipeline completo en GPUs de 24 GB o menos; en GPUs de 32 GB o mas (por ejemplo, RTX 5090 si se confirma el soporte del runtime) podria ser viable, aunque no hay datos publicados al respecto.
- Opciones de despliegue: ComfyUI (uso previsto segun los tags) y la plataforma RunningHub. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama (no aplicables a este tipo de modelo); tampoco se confirma compatibilidad con Diffusers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base Krea2 (parametros, contexto, licencia) que permitan una comparacion cuantitativa fiable con alternativas de edicion de imagenes. Tampoco se identifican en el repositorio otros fine-tunes comparables de la misma familia con metricas publicas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-binyuan-krea2-edit-v1.0-bf16-unet | no disponible | no aplica | sin benchmarks publicados | no disponible | Hugging Face (25,7 GB) y RunningHub |
| Krea2 (base) | no disponible | no aplica | no disponible | no disponible | referenciado como origen del fine-tune |
| Alternativas de edicion de imagenes | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay metricas objetivas de calidad, adherencia al prompt ni fidelidad de edicion; las afirmaciones de la model card son cualitativas y del propio autor.
- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream sin especificarla. No se puede confirmar el uso comercial; conviene verificar la licencia de Krea2 antes de cualquier despliegue productivo.
- Version inicial (v1.0): el autor la presenta como primera version, sin historial de correcciones ni garantias de estabilidad.
- Dependencias no documentadas: no se indica que text encoder, VAE ni configuracion de sampler se requieren, lo que complica la reproduccion fuera de ComfyUI o RunningHub.
- Solo pesos bf16: no hay variantes cuantizadas, lo que limita el despliegue en GPUs de consumo y encarece la inferencia.
- Riesgo de artefactos y alucinacion visual: como todo modelo de difusion, puede introducir detalles inexistentes, deformaciones o cambios no solicitados en la imagen de entrada; sin evaluacion publica no es posible acotar la tasa de fallo.
- Sesgos: no documentados; los sesgos del fine-tune dependen del dataset de entrenamiento, que no se describe, y de los del modelo base.
- Idiomas: no se especifica que idiomas entiende el pipeline; el rendimiento con prompts en castellano no esta verificado.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-05): conviene tratar las marcas temporales con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-binyuan-krea2-edit-v1.0-bf16-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2080273996574408705
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1975784978346901506
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model

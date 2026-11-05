# RunningHubAI/rh-liyurealistic-nsfw-illustrious-sdxl-checkpoint

## Resumen

`rh-liyurealistic-nsfw-illustrious-sdxl-checkpoint` es un checkpoint de Stable Diffusion XL (SDXL) afinado para generacion de imagenes de estilo realista, publicado por el usuario de RunningHub identificado como Li鱼 y distribuido en Hugging Face por la organizacion RunningHubAI. Se presenta como un modelo derivado de IL-XL (Illustrious XL), una base SDXL orientada a ilustracion y estetica anime, sobre la que se ha aplicado un ajuste fino para desplazar el estilo hacia el fotorrealismo y contenido para adultos (NSFW). El repositorio contiene un unico archivo de pesos en formato safetensors de aproximadamente 6,9 GB, coherente con un checkpoint completo de SDXL en precision fp16.

El modelo no es un modelo de lenguaje ni un sistema multimodal de proposito general: es un checkpoint de difusion para texto-a-imagen que se carga en ComfyUI o en la plataforma RunningHub. Su relevancia es acotada y practica: ofrece a creadores que ya trabajan con flujos SDXL/Illustrious un checkpoint listo para usar con estilos realistas y contenido explicito, sin necesidad de entrenar un LoRA propio. No hay informacion publica sobre composicion del dataset, numero de pasos de entrenamiento, hiperparametros ni evaluaciones cuantitativas.

La ficha se ha elaborado exclusivamente con los metadatos y la model card disponibles en el repositorio. Cualquier dato no documentado por el autor se marca como "no disponible" en lugar de inferirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (Stable Diffusion XL, UNet + VAE + text encoder CLIP), afinada desde IL-XL |
| Parametros totales | no disponible (checkpoint SDXL, del orden de 2,6 mil millones en la UNet; cifra exacta no publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; limite practico de tokens del text encoder CLIP de SDXL) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en safetensors (fp16, ~6,9 GB) |
| Idiomas soportados | no disponible (prompts en texto; el autor no documenta idiomas) |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`liyu网红写实realistic-NSFW-illustrious-SDXL.safetensors`, 6617 MiB) |

## Arquitectura y entrenamiento

El checkpoint sigue la arquitectura SDXL: una UNet de difusion latente que opera sobre representaciones comprimidas por un VAE, condicionada por dos text encoders CLIP (uno de ellos OpenCLIP ViT-bigG). El autor indica explicitamente que el modelo esta afinado desde IL-XL, es decir, parte de la familia Illustrious XL, que a su vez deriva de SDXL y esta especializada en ilustracion. Sobre esa base se ha realizado un ajuste fino orientado a estetica realista y a contenido NSFW, presumiblemente mediante fine-tuning supervisado con pares imagen-texto, aunque no se documenta la metodologia.

No hay informacion publica sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de regularizacion, el numero de pasos, la resolucion de entrenamiento ni si se emplearon tecnicas como LoRA fusionado, DreamBooth o ajuste completo. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, destilacion de pasos). El modelo se distribuye como checkpoint unico, lo que implica que el VAE y los text encoders estan integrados o deben cargarse por separado segun el flujo de ComfyUI.

## Capacidades

- Generacion de imagenes texto-a-imagen con estetica fotorrealista, orientada a retratos y figuras humanas.
- Generacion de contenido NSFW explicito, segun la etiqueta `not-for-all-audiences` y el nombre del checkpoint.
- Compatibilidad con flujos de ComfyUI y con la plataforma RunningHub, incluyendo el workflow "ill realistic model" referenciado por el autor.
- Control mediante prompts de texto; no se documenta soporte de ControlNet, IP-Adapter ni otros condicionamientos adicionales, aunque al ser un checkpoint SDXL es compatible con el ecosistema habitual de la comunidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de codigo: no es un modelo de lenguaje.
- Capacidades multilingues de prompt: no documentadas.

## Casos de uso

- Generacion de retratos fotorrealistas para proyectos creativos: el checkpoint produce imagenes de figuras humanas con estetica realista, adecuado para ilustracion editorial, avatares o concept art, cargandolo en ComfyUI con un workflow SDXL estandar.
- Contenido para adultos en plataformas que lo permitan: el ajuste NSFW permite generar imagenes explicitas dentro de entornos con verificacion de edad y cumplimiento legal, usando el checkpoint directamente sin LoRAs adicionales.
- Prototipado rapido de personajes: al partir de Illustrious XL, conserva cierta capacidad de estilizacion que puede combinarse con prompts para explorar variantes de un mismo personaje antes de pasar a produccion.
- Integracion en pipelines automatizados via API de RunningHub: el autor ofrece endpoints de API, lo que permite invocar el modelo desde aplicaciones sin gestionar infraestructura GPU propia.
- Experimentacion con merges y LoRAs: al ser un checkpoint SDXL estandar, sirve como base para fusiones con otros modelos o para entrenar LoRAs especificos sobre el.
- Docencia y demostraciones de difusion: util para ilustrar como un fine-tune sobre Illustrious XL desplaza el estilo hacia realismo, comparando salidas con la base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas cuantitativas (FID, CLIP score, evaluaciones humanas) ni comparaciones numericas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 8 y 12 GB en fp16 para SDXL a resoluciones de 1024x1024, segun el backend y el uso de optimizaciones (attention slicing, VAE tiling). El archivo pesa 6,9 GB, por lo que la carga en memoria requiere al menos esa cantidad mas overhead.
- GPU recomendadas: NVIDIA RTX 4090, RTX 3090, A100 o H100 para maxima velocidad; RTX 3060 de 12 GB o superior para uso basico.
- Cabe en GPU de consumo: si, en tarjetas con 8-12 GB de VRAM aplicando cuantizacion o fp16 con optimizaciones; en 6 GB requiere tecnicas agresivas de offloading.
- Opciones de despliegue: ComfyUI (flujo nativo del autor), Automatic1111/Forge, plataforma RunningHub (cloud) y su API.
- Latencia y throughput: no disponibles; dependen del hardware y del sampler. No se documentan cifras.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-liyurealistic-nsfw-illustrious-sdxl-checkpoint | IL-XL (SDXL) | no disponible (checkpoint SDXL) | no aplica | no disponible | Hugging Face, RunningHub |
| Illustrious XL (base upstream) | SDXL | ~2,6 mil millones (UNet) | no aplica | no disponible en esta ficha | Hugging Face |
| SDXL 1.0 (Stability AI) | SDXL | ~2,6 mil millones (UNet) | no aplica | CreativeML Open RAIL++-M | Hugging Face, Stability AI |

La comparacion se limita a la base arquitectonica porque el autor no publica evaluaciones que permitan contrastar calidad. No se dispone de datos de rendimiento comparativo con otros checkpoints realistas de la comunidad.

## Limitaciones y advertencias

- Contenido NSFW: el modelo esta disenado para generar material explicito; su uso requiere verificacion de edad, cumplimiento de la legislacion aplicable y politicas de plataforma.
- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream sin especificarla, lo que impide confirmar si el uso comercial esta permitido. Es un riesgo juridico relevante para produccion.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, artefactos en manos y rostros, y texto ilegible en las imagenes.
- Sesgos: los checkpoints afinados para realismo y contenido para adultos suelen reproducir sesgos de genero, etnia y corporalidad presentes en los datasets de entrenamiento; no se documenta mitigacion.
- Sin datos de entrenamiento: la ausencia de informacion sobre el dataset impide evaluar procedencia de las imagenes y posibles problemas de derechos.
- Idioma de los prompts: no se documenta soporte multilingue; el rendimiento con prompts en castellano no esta verificado.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.
- Dependencia de la plataforma: parte de la documentacion y del workflow remiten a RunningHub, lo que puede condicionar la reproducibilidad fuera de esa plataforma.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-liyurealistic-nsfw-illustrious-sdxl-checkpoint
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2019702076057591809
- Pagina del autor: https://www.runninghub.cn/user-center/1861364520106020865
- Workflow "ill realistic model": https://www.runninghub.cn/post/2017524665874391042/aiDetail/?inviteCode=1730001f
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model

# drawthingsai/MOSS-Image-SFT

## Resumen

MOSS-Image-SFT es un modelo de difusion texto-a-imagen de la familia MOSS-Image desarrollada por OpenMOSS. Se obtiene por ajuste supervisado (SFT) sobre MOSS-Image-Base, del que hereda arquitectura y pipeline de inferencia, y su rasgo diferencial es el control tipografico: acepta prompts en lenguaje natural, secuencias de etiquetas y layouts en JSON para decidir donde se coloca el texto y como se organizan los objetos en la escena. La model card ilustra la mejora frente a la Base con ejemplos de agrupacion de texto mas clara y disposiciones tipo pizarra mas ordenadas.

El repositorio analizado, `drawthingsai/MOSS-Image-SFT`, es una publicacion de terceros (organizacion drawthingsai) que referencia como modelo base a `OpenMOSS-Team/MOSS-Image-Base` y cuyo README remite en todo momento a los pesos y al codigo oficiales de `OpenMOSS-Team/MOSS-Image-SFT`. Ocupa 32,5 GB y se distribuye con licencia Apache-2.0 en formato diffusers, con soporte declarado de ingles y chino.

Es relevante ahora porque ataca uno de los puntos debiles clasicos de la generacion de imagenes: la renderizacion fiable de texto dentro de la imagen, incluyendo caligrafia manuscrita y rotulos en chino. Se integra en diffusers mediante un pipeline personalizado (`pipeline_moss_image`) y dispone de plugin nativo para ComfyUI, lo que facilita su adopcion en flujos de produccion grafica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (transformer + text encoder + VAE); detalles de la arquitectura no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | no disponible (modelo de imagen; no se documenta ventana de tokens) |
| Tipos de cuantizacion | no disponible; los pesos se cargan en bfloat16 (transformer y text encoder) y float32 (VAE y ruido inicial) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, empaquetado para diffusers; repositorio de 32,5 GB |

## Arquitectura y entrenamiento

La informacion disponible describe un pipeline de difusion con tres componentes explicitos: un transformer, un text encoder y un VAE. El transformer y el text encoder se ejecutan en bfloat16, mientras que el VAE y el ruido inicial se mantienen en float32. El VAE incluido utiliza el decodificador pequeno de FLUX.2, segun la propia model card. El pipeline expone un parametro `uncond_skip_layers` (el ejemplo usa `[22]`) junto con `guidance_scale` y `num_inference_steps`, lo que sugiere una forma de classifier-free guidance con omision de capas no condicionadas; no se detalla el mecanismo interno.

En cuanto al entrenamiento, MOSS-Image-SFT es un ajuste supervisado sobre MOSS-Image-Base. No se especifican en la informacion proporcionada el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La innovacion destacada por el autor es la capacidad de control de layout: el modelo acepta prompts en lenguaje natural, secuencias de etiquetas y JSON con posiciones, lo que permite dirigir la ubicacion del texto y la disposicion de objetos. Se referencia un informe tecnico y el preprint arXiv:2610.23374, pero sus cifras no estan incluidas en el material disponible.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) a resoluciones configurables; el ejemplo oficial usa 1024x1024.
- Renderizado de texto dentro de la imagen, incluido texto manuscrito y en chino, con mejora de agrupacion tipografica respecto a MOSS-Image-Base.
- Control de composicion mediante layouts en JSON, para posicionar texto y organizar objetos.
- Soporte de prompts en lenguaje natural y de secuencias de etiquetas (estilo tag-based).
- Bilinguismo declarado: ingles y chino, tanto en el prompt como en el texto renderizado.
- Integracion con diffusers mediante `DiffusionPipeline` y el pipeline personalizado `pipeline_moss_image` (requiere `trust_remote_code=True`).
- Interfaz Gradio incluida en el proyecto, opciones de CPU offload y compilacion.
- Plugin nativo para ComfyUI, instalable desde ComfyUI Manager buscando "MOSS-Image".
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, entrada de vision ni edicion de imagen (inpainting/outpainting) en la informacion disponible.

## Casos de uso

- Carteleria e infografia con texto legible: el modelo puede generar carteles, paneles y rotulos donde la tipografia debe ser correcta, apoyandose en el control de layout por JSON para fijar la posicion de cada bloque de texto.
- Mockups de interfaz y pizarras: util para prototipar pantallas, diagramas y whiteboards con etiquetas, aprovechando que la variante SFT produce agrupaciones de texto mas ordenadas que la Base.
- Material de marketing bilingue ingles-chino: permite producir una misma creatividad en ambos idiomas sin cambiar de modelo, algo relevante para mercados con presencia simultanea de ambos idiomas.
- Localizacion de creatividades: regenerar piezas graficas sustituyendo el texto del prompt en lugar de editar la imagen, manteniendo la composicion descrita en el layout.
- Ilustracion editorial con anotaciones: escenas con notas manuscritas, etiquetas de producto o pizarras explicativas, como el ejemplo de la nota en la puerta de la nevera.
- Empaquetado y etiquetado de producto: generacion de bocetos de packaging con nombres de marca y textos de envase colocados en zonas concretas.
- Produccion de assets en pipelines graficos: al existir plugin de ComfyUI y soporte en diffusers, puede encadenarse con etapas de postproceso, escalado o composicion dentro de un flujo automatizado.
- Exploracion conceptual rapida: generacion por lotes con semillas fijas (`manual_seed`) para comparar variantes de una misma idea con composicion controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas cuantitativas (FID, CLIP score, precision de renderizado de texto ni evaluaciones humanas) ni comparaciones numericas con otros modelos. Solo se ofrece una comparacion cualitativa Base frente a SFT mediante imagenes de ejemplo.

## Requisitos de hardware

- Almacenamiento y descarga: el repositorio ocupa 32,5 GB, espacio minimo necesario en disco para los pesos.
- VRAM en carga completa: al cargar en bfloat16, los pesos por si solos rondan el tamano del repositorio; contando activaciones y el VAE en float32, una estimacion prudente es de 40 GB o mas de VRAM. Esto situa la ejecucion holgada en A100 40/80 GB, H100 y GPU profesionales de 48 GB (L40S).
- GPU de consumo: no hay cifras oficiales de VRAM para consumer, pero el proyecto documenta CPU offload, opcion que permitiria ejecutar en tarjetas de 24 GB (RTX 3090, RTX 4090) a costa de velocidad. Requiere GPU NVIDIA con CUDA.
- Entorno: Python 3.10 o superior, PyTorch 2.9 o superior compilado para el entorno CUDA disponible, `diffusers>=0.38`, `transformers>=5.3`, `accelerate>=1.10`, `safetensors>=0.6` y `Pillow>=10`.
- Opciones de despliegue: diffusers (pipeline personalizado con `trust_remote_code=True`), interfaz Gradio del proyecto, plugin nativo de ComfyUI (integracion en el repositorio oficial de ComfyUI en curso). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Configuracion de inferencia del ejemplo oficial: 1024x1024, 50 pasos, `guidance_scale=3.0`, `uncond_skip_layers=[22]`, VAE en float32.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificados de parametros, contexto ni benchmarks de este modelo en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. Como alternativas de la misma categoria (difusion texto-a-imagen open source con enfasis en renderizado de texto) cabria evaluar FLUX.1-dev, Qwen-Image y HunyuanImage; sus cifras deben consultarse en sus respectivas model cards.

| Aspecto | MOSS-Image-SFT | MOSS-Image-Base | Alternativas (FLUX.1, Qwen-Image) |
|---|---|---|---|
| Parametros | no disponible | no disponible | no disponible en la informacion proporcionada |
| Resolucion de inferencia documentada | 1024x1024 (configurable) | misma arquitectura y pipeline | no disponible |
| Control de layout por JSON | si | si (misma arquitectura y pipeline) | no disponible |
| Idiomas | en, zh | en, zh | no disponible |
| Licencia | Apache-2.0 | no disponible en la informacion proporcionada | requiere verificacion en cada model card |
| Disponibilidad | HuggingFace y ModelScope; demo en Spaces; plugin ComfyUI | HuggingFace y ModelScope | requiere verificacion |

Nota: al tratarse de un ajuste SFT sobre MOSS-Image-Base, la comparacion interna mas fiable es la cualitativa que ofrece el autor (mejor agrupacion de texto y layouts mas organizados en la variante SFT).

## Limitaciones y advertencias

- El repositorio analizado pertenece a la organizacion `drawthingsai`, no a OpenMOSS, y acumula 0 descargas y 0 likes en el momento de la consulta; la procedencia oficial de los pesos es `OpenMOSS-Team/MOSS-Image-SFT`. Conviene descargar desde el repositorio oficial o verificar la integridad de este.
- El codigo de ejemplo de la propia model card apunta a `OpenMOSS-Team/MOSS-Image-SFT`, no al identificador del repositorio de terceros, lo que refuerza la sospecha de espejo o re-subida.
- No hay benchmarks publicados en la informacion disponible; el rendimiento real en renderizado de texto, adherencia al prompt y calidad estetica no esta cuantificado.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano ni de otras lenguas, lo que afecta tanto al prompt como al texto renderizado.
- Riesgo de texto incorrecto o ilegible en cadenas largas o con tipografias complejas: la mejora del SFT es cualitativa y no se documenta una tasa de error.
- Riesgo de alucinacion visual: el modelo puede inventar objetos, marcas o texto no solicitado, como cualquier modelo generativo de imagenes.
- Sesgos: no se documenta ninguna evaluacion de sesgos demograficos, culturales o estilisticos. El sesgo del dataset de ajuste es desconocido.
- Licencia Apache-2.0 en el repositorio, lo que en principio permite uso comercial; sin embargo, la model card indica que el VAE incluido usa el decodificador pequeno de FLUX.2, por lo que conviene verificar la licencia de ese componente antes de un despliegue comercial.
- El pipeline requiere `trust_remote_code=True` y un `custom_pipeline`, es decir, ejecucion de codigo remoto: es un riesgo de seguridad que debe revisarse en entornos de produccion.
- Dependencias muy recientes (`diffusers>=0.38`, `transformers>=5.3`, PyTorch 2.9) que pueden no estar disponibles en todos los entornos o stacks de despliegue.
- No se documentan capacidades de edicion de imagen, inpainting, control por imagen de referencia ni entrada multimodal.

## Enlaces

- Modelo en HuggingFace (repositorio analizado): https://huggingface.co/drawthingsai/MOSS-Image-SFT
- Modelo oficial SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Codigo en GitHub: https://github.com/OpenMOSS/MOSS-Image
- Guia de usuario: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guia de usuario en chino: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Guia de ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Pagina del proyecto: https://openmoss.github.io/MOSS-Image/
- Informe tecnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- arXiv: https://arxiv.org/abs/2610.23374
- ModelScope (base): https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope (SFT): https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Cuenta de X de OpenMOSS: https://x.com/Open_MOSS
- Discord de la comunidad: https://discord.gg/nXFWEyvbb

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos enlaces utiles son los que aparecen en la model card y en los metadatos de HuggingFace.

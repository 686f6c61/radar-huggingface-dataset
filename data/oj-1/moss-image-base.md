# OJ-1/MOSS-Image-Base

## Resumen

MOSS-Image-Base es un modelo de difusion texto-a-imagen de la familia MOSS-Image desarrollado por OpenMOSS (organizacion responsable de la serie MOSS). Se trata de la variante base, es decir, el punto de partida sin ajuste supervisado sobre el que se construye la version SFT, y su rasgo diferencial es el control fino de la tipografia dentro de la imagen: acepta prompts en lenguaje natural, secuencias de etiquetas y layouts en JSON que permiten fijar la posicion del texto y la disposicion de los objetos.

El checkpoint publicado en este repositorio (OJ-1/MOSS-Image-Base) ocupa 5.082.308.624 parametros, unos 5,08 mil millones, almacenados en safetensors, con un peso de repositorio de 27,2 GB. Internamente combina un transformer de difusion con muestreo flow-matching, un codificador de texto y un VAE basado en el decoder small de FLUX.2. Soporta prompts en ingles y chino, incluyendo la renderizacion de texto manuscrito o impreso en caracteres chinos, algo que la mayoria de modelos de difusion generalistas resuelven mal.

Es relevante ahora porque la generacion de imagenes con texto legible es uno de los cuellos de botella practicos en produccion grafica (carteles, packaging, interfaces, infografias) y porque se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y fine-tuning sin las restricciones habituales de los modelos de difusion de gama alta. Se publica ademas un informe tecnico y una integracion nativa para ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con muestreo flow-matching; VAE con decoder small de FLUX.2; codificador de texto no especificado |
| Parametros totales | 5.082.308.624 (aproximadamente 5,08 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se publican variantes cuantizadas oficiales; el repositorio distribuye safetensors en bfloat16 (transformer y codificador de texto) y float32 (VAE y ruido inicial) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria diffusers) |
| Pipeline declarado | text-to-image |
| Clase de pipeline | `diffusers:MOSSImagePipeline` (custom pipeline, requiere `trust_remote_code=True`) |
| Resolucion | multiplos de 16 en la API de Python; ejemplo oficial a 1024x1024 |
| Sampler por defecto | Flow-matching Euler |
| Pasos de inferencia por defecto | 50 |
| CFG por defecto | 3 |
| Shift | 5 |
| Layer skipping por defecto | Rama negativa, capa 22 (indice base cero) |
| Prompt negativo por defecto | vacio |
| Tamano del repositorio | 27,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible describe un transformer de difusion entrenado con flow-matching (el sampler por defecto es Euler de flow-matching, con shift 5) sobre un espacio latente generado por un VAE que reutiliza el decoder small de FLUX.2. El modelo se ejecuta con el transformer y el codificador de texto en bfloat16 y el VAE y el ruido inicial en float32, una eleccion habitual para evitar artefactos de color en la decodificacion. Una particularidad del pipeline es el uso de *layer skipping* en la rama negativa (se omite la capa 22 en el forward incondicional), lo que reduce el coste del paso de guiado: por defecto la guia se calcula con dos forwards del transformer por paso, y se puede desactivar pasando `uncond_skip_layers=[]` o sustituir por un `negative_prompt`.

No se han facilitado en la informacion disponible datos sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni sobre si hubo etapas de RLHF, DPO u otro ajuste por preferencias. Tampoco se detalla la arquitectura del codificador de texto ni su ventana maxima. Lo que si se explicita es la existencia de una variante SFT (MOSS-Image-SFT) que, segun la comparativa grafica de la model card, produce una agrupacion de texto mas clara y layouts mas ordenados, lo que sitúa a Base como modelo de partida para ajuste propio en lugar de como modelo listo para produccion grafica. La innovacion tecnica destacada por el autor es el control explicito de la disposicion: se aceptan prompts en lenguaje natural, secuencias de etiquetas y layouts en JSON.

## Capacidades

- Generacion de imagenes a partir de texto en ingles y chino, con prompts de lenguaje natural.
- Control de tipografia y ubicacion del texto mediante secuencias de etiquetas y layouts en JSON que fijan la posicion de textos y la disposicion de objetos.
- Renderizado de texto en chino, incluido texto manuscrito (el ejemplo oficial reproduce una nota adhesiva escrita a mano en un frigorifico).
- Generacion en formato panoramico y a resoluciones configurables (multiplos de 16), con ejemplo oficial a 1024x1024.
- Acepta prompt negativo y ajuste de CFG, pasos y shift para control fino del resultado.
- Integracion nativa en ComfyUI (plugin instalable desde ComfyUI Manager, con workflow de ejemplo) y en diffusers mediante pipeline personalizado.
- Modelo base: sirve como punto de partida para fine-tuning (SFT, LoRA u otros) sobre dominios o estilos propios.
- No dispone de tool calling ni function calling.
- No dispone de modo agente ni de razonamiento multi-paso.
- No acepta imagenes de entrada: no hay edicion guiada por imagen ni vision en el sentido de comprension multimodal.

## Casos de uso

- Rotulacion de carteles y material promocional: el modelo puede colocar titulares y cuerpos de texto en posiciones concretas mediante layouts JSON, lo que evita el bucle habitual de generar la imagen y retocar la tipografia en un editor externo.
- Diseno de packaging y etiquetas de producto: con prompts que describen el envase y el texto de la etiqueta, se obtienen mockups con la denominacion del producto ya integrada en la imagen.
- Localizacion de creatividades publicitarias para el mercado chino: al soportar zh de forma nativa, permite generar variantes con rotulacion en caracteres chinos sin depender de un modelo distinto al usado para el mercado anglosajon.
- Material educativo e infografias: la combinacion de layout JSON y descripcion de objetos facilita generar laminas con titulos, etiquetas y diagramas rotulados, utiles como borrador rapido antes del trabajo de diseno final.
- Prototipado de interfaces y mockups de producto: util para generar pantallas o paneles con texto legible en una fase temprana de validacion con stakeholders.
- Generacion de assets para videojuegos y narrativa visual: carteles diegeticos, senaletica, periodicos o notas dentro de una escena, con control de idioma y de contenido textual.
- Base para fine-tuning en dominios verticales: al ser un modelo base con licencia Apache 2.0, es adecuado para entrenar variantes especializadas (estilo de marca, sectores concretos) y comparar contra la variante SFT oficial.
- Integracion en pipelines de produccion grafica sobre ComfyUI: el plugin nativo y el workflow de ejemplo permiten encadenar el modelo con etapas de upscaling, correccion o compositing dentro de un grafo reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una comparativa cualitativa entre MOSS-Image-Base y MOSS-Image-SFT (mejor agrupacion del texto y layout mas ordenado en la variante SFT), pero no cifras de metricas objetivas como FID, CLIPScore, GenEval o benchmarks especificos de renderizado de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 de 5,08 mil millones de parametros ocupan aproximadamente 10,2 GB, a los que hay que sumar el codificador de texto, el VAE en float32, las activaciones del transformer de difusion y los tensores de atencion. Como referencia de orden de magnitud, cabe esperar un rango de 14 a 20 GB a 1024x1024 con los ajustes por defecto (50 pasos, CFG 3). Estas cifras son estimaciones a partir del recuento de parametros, no datos publicados por el autor.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o cualquier acelerador con 24 GB o mas para trabajar sin offload. Una RTX 4090 o RTX 3090 de 24 GB deberia ser suficiente a resolucion 1024x1024.
- Cabe en GPU de consumo: si, en gamas de 24 GB (RTX 4090, RTX 3090) con holgura, y con CPU offload en tarjetas de 8 a 12 GB a costa de latencia.
- Entorno de ejecucion: Python 3.10 o superior, GPU NVIDIA con CUDA, PyTorch 2.9 o superior, `diffusers>=0.38`, `transformers>=5.3`, `accelerate>=1.10`, `safetensors>=0.6` y `Pillow>=10`.
- Opciones de despliegue: diffusers con el pipeline personalizado `pipeline_moss_image` (requiere `trust_remote_code=True`), interfaz Gradio incluida en el proyecto y plugin nativo para ComfyUI. No se documentan en la informacion disponible soportes de vLLM, TGI, llama.cpp ni Ollama, que en cualquier caso no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles. Como referencia cualitativa, los 50 pasos por defecto implican dos forwards del transformer por paso (rama condicional y rama negativa), salvo que se desactive el layer skipping o se use prompt negativo de otra forma.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Enfoque diferencial |
|---|---|---|---|---|
| MOSS-Image-Base | 5,08 mil millones | en, zh | Apache 2.0 | Control de layout y renderizado de texto, incluido chino; modelo base para ajuste |
| MOSS-Image-SFT | no disponible | en, zh | Apache 2.0 | Version ajustada de la misma familia, con mejor agrupacion de texto |
| FLUX.1 [dev] | 12 mil millones | en (principalmente) | no comercial | Alta calidad general y buen renderizado de texto, pero licencia restrictiva |
| Qwen-Image | 20 mil millones | en, zh | Apache 2.0 | Modelo multimodal de generacion con soporte fuerte de chino |
| Stable Diffusion 3.5 Large | 8 mil millones | en (principalmente) | Stability Community License | Ecosistema amplio y muchas herramientas de terceros |

No se dispone de resultados de benchmarks comparativos publicados en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto de idioma y licencia. Los datos de los modelos alternativos corresponden a sus fichas publicas y no proceden de una evaluacion conjunta con MOSS-Image.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por preferencias: los resultados requieren prompts bien construidos y probablemente ajuste adicional para uso en produccion. El propio autor muestra que la variante SFT produce layouts mas ordenados.
- Riesgo de texto mal renderizado: aunque el control de tipografia es el punto fuerte declarado, no hay metricas publicadas de precision de renderizado, y los errores tipicos en modelos de difusion (glifos corruptos, caracteres inventados) siguen siendo posibles.
- Idiomas limitados a ingles y chino: no hay soporte declarado de castellano, por lo que los prompts o el texto a rotular en espanol pueden degradarse de forma notable.
- Sin comprension de imagenes: no acepta entrada visual, por lo que no sirve para edicion guiada, inpainting condicionado por referencia ni tareas de vision.
- Repositorio no oficial: esta ficha corresponde al repositorio OJ-1/MOSS-Image-Base, con 0 descargas y 0 likes, mientras que la model card y los enlaces apuntan a OpenMOSS-Team/MOSS-Image-Base. Conviene verificar la procedencia de los pesos antes de usarlos en produccion y preferir el repositorio de la organizacion responsable si esta disponible.
- Ejecucion de codigo remoto: el pipeline personalizado (`custom_pipeline="pipeline_moss_image"`) exige `trust_remote_code=True`, lo que implica ejecutar codigo Python del repositorio. Es un vector de riesgo que debe auditarse en entornos corporativos.
- Licencia Apache 2.0: permite uso comercial, redistribucion y modificacion, sin las clausulas no comerciales de otros modelos de difusion. Se debe conservar el aviso de licencia y no se ofrecen garantias por parte del autor.
- Sin datos de sesgo: no hay informacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo demografico o cultural, algo especialmente relevante si se generan personas.
- Busqueda web sin resultados utiles: las consultas realizadas han devuelto exclusivamente resultados sobre una persona homonima ajena al proyecto, por lo que no se ha podido contrastar informacion externa adicional.

## Enlaces

- Repositorio en HuggingFace (espejo): https://huggingface.co/OJ-1/MOSS-Image-Base
- Repositorio de la organizacion responsable (base): https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Repositorio de la organizacion responsable (SFT): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Codigo fuente en GitHub: https://github.com/OpenMOSS/MOSS-Image
- Informe tecnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- Pagina del proyecto: https://openmoss.github.io/MOSS-Image/
- Guia de usuario (ingles): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guia de usuario (chino): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Integracion ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Workflow de ejemplo para ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/moss-image/example_workflows/moss-image.json
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- ModelScope (base): https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope (SFT): https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Perfil de OpenMOSS en X: https://x.com/Open_MOSS

# OpenMOSS-Team/MOSS-Image-SFT

## Resumen

MOSS-Image-SFT es un modelo de generacion de imagenes a partir de texto desarrollado por OpenMOSS (OpenMOSS-Team), presentado como la version ajustada mediante supervised fine-tuning (SFT) de MOSS-Image-Base. Se distribuye con licencia Apache 2.0 y esta publicado en HuggingFace con la libreria diffusers, lo que permite integrarlo en pipelines estandar de difusion mediante el custom pipeline `pipeline_moss_image`.

El modelo cuenta con 5.082.308.624 parametros (aproximadamente 5,08 mil millones), segun el recuento real de los ficheros safetensors del repositorio, que ocupa 27,2 GB. La familia MOSS-Image se describe como un modelo base DiT (Diffusion Transformer) de 5B parametros orientado a renderizado de texto de alta calidad, generacion de layouts y eficiencia de inferencia. Frente a MOSS-Image-Base, la variante SFT mejora la agrupacion de texto y la organizacion de composiciones con mucho contenido textual, como muestran los ejemplos comparativos de la model card.

Su relevancia actual radica en el control estructurado de la generacion: ademas de prompts en lenguaje natural, acepta secuencias de tags y layouts en JSON para controlar la colocacion del texto y la disposicion de los objetos. Esta pensado para prompts en ingles y chino, y su integracion con ComfyUI y Gradio facilita su adopcion en flujos de trabajo creativos y de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con flow matching; fine-tuning supervisado sobre MOSS-Image-Base |
| Parametros totales | 5.082.308.624 (~5,08B) segun safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; la longitud de prompt no esta documentada) |
| Tipos de cuantizacion | no disponible; la inferencia por defecto usa bfloat16 en transformer y text encoder, y float32 en VAE y ruido inicial |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

Datos adicionales: tamano del repositorio 27,2 GB; pipeline declarado `text-to-image`; clase de pipeline `MOSSImagePipeline`; 54 descargas y 88 likes en el momento de la consulta; creado el 11 de octubre de 2026 y actualizado el 16 de octubre de 2026.

## Arquitectura y entrenamiento

MOSS-Image-SFT es un modelo de difusion basado en una arquitectura DiT (Diffusion Transformer), segun la descripcion del repositorio oficial del proyecto. El modelo parte de MOSS-Image-Base, un modelo base de 5B parametros, y se obtiene mediante supervised fine-tuning sobre el, manteniendo la misma arquitectura y el mismo pipeline de inferencia que el modelo base. En la model card se ilustra la diferencia entre Base y SFT con un ejemplo de pizarra blanca en el que la version SFT produce una agrupacion de texto mas clara y un layout mas organizado.

El muestreo por defecto emplea un sampler de flow-matching Euler con 50 pasos, escala de CFG 3 y shift 5. La guia por defecto realiza dos pasadas del transformer por paso (rama condicional y rama negativa), y aplica skipping de capas en la rama negativa en el indice de capa 22 (base cero); se puede desactivar pasando `uncond_skip_layers=[]`. El prompt negativo por defecto es vacio. El VAE incluido utiliza el decodificador pequeno de FLUX.2. El transformer y el text encoder se ejecutan en bfloat16, mientras que el VAE y el ruido inicial usan float32.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El modelo base si viene acompanado de un informe tecnico (technical report) enlazado desde el repositorio, que no se ha consultado en esta busqueda.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en resoluciones como 1024x1024, con 50 pasos de inferencia por defecto.
- Renderizado de texto de alta calidad dentro de la imagen, incluido texto manuscrito y en chino, segun el ejemplo de la model card (nota adhesiva en una nevera con texto en chino).
- Soporte de prompts en lenguaje natural, secuencias de tags y layouts en formato JSON.
- Control de la colocacion del texto y de la disposicion de los objetos mediante la estructura del prompt.
- Generacion de layouts complejos con multiples elementos, mejorada respecto al modelo base gracias al ajuste SFT.
- Integracion con ComfyUI mediante plugin nativo (instalable desde ComfyUI Manager) y con Gradio.
- Compatibilidad con optimizaciones de despliegue: CPU offload y opciones de compilacion, segun la quick start del proyecto.
- No se documenta en la informacion disponible soporte de tool calling, capacidades de agente, vision de entrada, audio ni modo de razonamiento explicito.

## Casos de uso

- Generacion de carteles y material promocional con texto integrado: el modelo permite controlar la colocacion del texto mediante layouts JSON y secuencias de tags, lo que resulta adecuado para piezas donde el texto debe quedar legible y bien agrupado, una de las mejoras del ajuste SFT.
- Creacion de mockups de producto con etiquetado realista: se pueden generar envases, notas o etiquetas con texto manuscrito o impreso en ingles y chino, como muestra el ejemplo de la nota adhesiva en la nevera.
- Ilustracion de documentacion tecnica y diagramas anotados: el control de posicion de objetos y texto permite generar esquemas con leyendas colocadas en posiciones concretas, utiles para materiales educativos.
- Diseno de escenas con multiples objetos y jerarquia visual: la capacidad de layout facilita composiciones donde varios elementos deben colocarse de forma coherente, por ejemplo estanterias, escritorios o pizarras.
- Prototipado rapido en flujos de diseno grafico: la integracion con ComfyUI permite encadenar el modelo con otros nodos de posprocesado y trabajar con workflows reutilizables en un estudio o equipo de contenido.
- Generacion de material localizado para mercados angloparlantes y chinos: al declarar soporte de en y zh, el modelo cubre los dos idiomas mas habituales en productos con rotulacion bilingue o en campanas dirigidas a esos mercados.
- Creacion de imagenes sinteticas para test de interfaces o catalogos: a 1024x1024 y con control de layout, sirve para poblar maquetas y demos con contenido visual variado sin dependencia de bancos de imagenes.
- Experimentacion en investigacion sobre renderizado de texto en difusion: al ser un modelo Apache 2.0 con pesos abiertos y recuento de parametros conocido, es utilizable como base para estudios comparativos de generacion de texto en imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente una comparacion visual cualitativa entre MOSS-Image-Base y MOSS-Image-SFT en una escena de pizarra blanca, sin metricas numericas (FID, CLIP score, precision de texto u otras).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: los 5,08B parametros del transformer ocupan en torno a 10,2 GB solo en pesos; sumando text encoder, VAE en float32 y estados intermedios, es razonable estimar un rango de 12 a 18 GB, aunque no se dispone de una cifra oficial publicada.
- GPU profesionales recomendadas: A100 (40/80 GB), H100, L40S o A6000, en funcion del margen de memoria y del uso de compilacion.
- GPU de consumo: cabe previsiblemente en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bfloat16; en tarjetas de 12-16 GB seria necesario recurrir a CPU offload.
- Opciones de despliegue: diffusers (custom pipeline `pipeline_moss_image` con `trust_remote_code=True`), ComfyUI con plugin nativo, interfaz Gradio incluida en el proyecto y opciones de CPU offload. No se documenta soporte de vLLM, TGI o llama.cpp, que no aplican a este tipo de modelo.
- Entorno minimo: Python 3.10 o superior, GPU NVIDIA con CUDA, PyTorch 2.9 o superior, `diffusers>=0.38`, `transformers>=5.3`, `accelerate>=1.10`, `safetensors>=0.6` y `Pillow>=10`.
- Latencia y throughput: no disponibles. Como referencia de configuracion, el muestreo por defecto ejecuta 50 pasos con dos pasadas del transformer por paso (una condicional y una negativa), salvo que se desactive el skipping de la rama negativa.

## Comparativa con modelos similares

Los datos de las alternativas provienen de conocimiento publico general sobre estos modelos y no han sido verificados en la busqueda realizada, por lo que deben tomarse como referencia aproximada. Las cifras de MOSS-Image-SFT si proceden de la informacion proporcionada.

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| MOSS-Image-SFT | ~5,08B | 1024x1024 documentado en los ejemplos; prompt sin limite documentado | Apache 2.0 | HuggingFace, ModelScope, ComfyUI, demo en Spaces |
| MOSS-Image-Base | ~5,08B (misma arquitectura) | misma que SFT | Apache 2.0 | HuggingFace, ModelScope |
| FLUX.1-dev (referencia externa) | ~12B (aproximado) | no verificado | licencia no comercial | HuggingFace |
| Qwen-Image (referencia externa) | ~20B (aproximado) | no verificado | Apache 2.0 (segun publicaciones del autor) | HuggingFace |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de rendimiento entre MOSS-Image-SFT y estos modelos.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible. Al ser un modelo de generacion de imagenes entrenado con datos no especificados, puede reproducir sesgos presentes en sus datos de entrenamiento.
- Alucinacion visual: como cualquier modelo de difusion, puede generar texto ilegible o malformado, objetos con geometria incorrecta o detalles incoherentes con el prompt, especialmente en escenas con mucho texto.
- Idiomas: el soporte declarado se limita a ingles y chino. El castellano no figura como idioma soportado, por lo que la generacion de texto dentro de la imagen en espanol no esta garantizada.
- Longitud de prompt: no se documenta el limite de tokens del text encoder ni su comportamiento con prompts muy largos.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye con `trust_remote_code=True` para cargar un custom pipeline, lo que implica ejecutar codigo remoto del repositorio; conviene auditar ese codigo antes de desplegarlo en produccion.
- Requisitos de version muy recientes: el ejemplo oficial exige `diffusers>=0.38` y `transformers>=5.3`, versiones que pueden entrar en conflicto con otros proyectos del mismo entorno.
- Rendimiento: la configuracion por defecto realiza dos pasadas del transformer por paso, lo que duplica aproximadamente el coste de computo respecto a una configuracion sin rama negativa.
- Integracion en ComfyUI: segun la propia model card, la integracion en el repositorio oficial de ComfyUI esta en progreso, por lo que la instalacion se realiza via ComfyUI Manager.
- Datos ausentes: no hay informacion publicada sobre composicion del dataset de entrenamiento, numero de tokens, ni evaluaciones cuantitativas, lo que dificulta anticipar su comportamiento en dominios concretos.

## Enlaces

- HuggingFace (modelo SFT): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- HuggingFace (modelo base): https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Repositorio en GitHub: https://github.com/OpenMOSS/MOSS-Image
- Informe tecnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- Guia de usuario (ingles): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guia de usuario (chino): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Documentacion de ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Workflow de ejemplo para ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/moss-image/example_workflows/moss-image.json
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Pagina del proyecto: https://openmoss.github.io/MOSS-Image/
- ModelScope (base): https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope (SFT): https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Cuenta de X de OpenMOSS: https://x.com/Open_MOSS

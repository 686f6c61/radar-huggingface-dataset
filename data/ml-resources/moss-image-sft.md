# ml-resources/MOSS-Image-SFT

## Resumen

MOSS-Image-SFT es un modelo de generacion de imagenes a partir de texto (text-to-image) perteneciente a la familia MOSS-Image, desarrollada por OpenMOSS. Se trata de la version con ajuste supervisado (SFT) del modelo base OpenMOSS-Team/MOSS-Image-Base, del que hereda arquitectura y pipeline de inferencia. La ficha que se analiza aqui corresponde a la copia publicada por el usuario ml-resources en HuggingFace, que replica el repositorio oficial OpenMOSS-Team/MOSS-Image-SFT.

El modelo cuenta con 5.082.308.624 parametros (unos 5,08 mil millones) en formato safetensors para la libreria diffusers, con un repositorio de 27,2 GB. Esta licenciado bajo Apache 2.0 y soporta prompts en ingles y chino. A diferencia de la version base, el ajuste SFT mejora la agrupacion de texto y la organizacion de composiciones con mucho contenido tipografico, como pizarras o notas manuscritas.

Su rasgo diferencial es el control de la composicion: acepta prompts en lenguaje natural, secuencias de etiquetas (tags) y layouts en JSON que permiten especificar la colocacion del texto y la disposicion de los objetos en la imagen. Es relevante ahora porque cubre un caso historicamente debil en los modelos de difusion: la renderizacion fiable de texto, incluyendo texto no latino como el chino, con control explicito del layout.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion con backbone transformer y entrenamiento por flow matching; incluye text encoder y VAE (el decoder VAE incluido es el "small decoder" de FLUX.2) |
| Parametros totales | 5.082.308.624 (5,08 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el condicionamiento se realiza mediante prompt de texto; no se especifica limite de tokens) |
| Tipos de cuantizacion | No disponible (distribucion en bfloat16; no se documentan variantes GGUF ni cuantizaciones de 8/4 bits) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato diffusers), con pipeline personalizado `pipeline_moss_image` y carga mediante `trust_remote_code=True` |
| Resolucion de generacion | 1024 x 1024 en el ejemplo oficial (no se documentan otros valores) |
| Muestreador por defecto | Flow-matching Euler |
| Pasos por defecto | 50 |
| CFG por defecto | 3,0 (con shift 5) |
| Tamano del repositorio | 27,2 GB |
| Modelo base | OpenMOSS-Team/MOSS-Image-Base (relacion: finetune) |

## Arquitectura y entrenamiento

MOSS-Image-SFT es un modelo de difusion generativa que emplea flow matching como objetivo de entrenamiento, con un backbone de tipo transformer, un text encoder para el condicionamiento textual y un VAE para la codificacion y decodificacion latente. El VAE incluido utiliza el decoder pequeno de FLUX.2. En inferencia, el transformer y el text encoder operan en bfloat16, mientras que el VAE y el ruido inicial se mantienen en float32, una combinacion orientada a estabilizar la decodificacion final.

El modelo se obtiene por ajuste supervisado (SFT) sobre MOSS-Image-Base, conservando la misma arquitectura y pipeline. La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas adicionales de RLHF o DPO; estos datos no estan disponibles en la model card. La innovacion destacable es la capacidad de condicionamiento estructurado: ademas de lenguaje natural, acepta secuencias de etiquetas y layouts JSON que controlan la posicion del texto y la organizacion de los objetos. El muestreo por defecto aplica un salto de capa en la rama negativa (indice de capa 22) para reducir coste, de modo que la guia estandar ejecuta dos pasadas del transformer por paso; dicho salto puede desactivarse pasando `uncond_skip_layers=[]`.

## Capacidades

- Generacion de imagenes a partir de descripciones en lenguaje natural, en ingles y en chino.
- Renderizado de texto dentro de la imagen, incluido texto manuscrito y texto en chino (el ejemplo oficial muestra una nota manuscrita en un frigorifico con varias lineas en chino).
- Control de layout mediante JSON, permitiendo especificar la colocacion del texto y la disposicion de los objetos.
- Condicionamiento mediante secuencias de etiquetas (tags) ademas de prompts conversacionales.
- Mejora de agrupacion de texto y organizacion compositiva respecto al modelo base, segun la comparacion cualitativa de la propia model card.
- Generacion a 1024 x 1024 con 50 pasos y CFG 3,0 por defecto.
- Integracion con ComfyUI mediante plugin nativo instalable desde ComfyUI Manager, y con Gradio para interfaces de demostracion.
- Soporte de CPU offload y opciones de compilacion para reducir requisitos de memoria.
- No se documentan capacidades de edicion de imagen, inpainting, control por imagen de referencia, vision ni audio.

## Casos de uso

- Rotulacion y carteleria: generar carteles, etiquetas o senaletica donde el texto sea el elemento principal y deba aparecer correctamente escrito, aprovechando la mejora de agrupacion tipografica del ajuste SFT.
- Material didactico y pizarras: crear infografias o pizarras con bloques de texto organizados, usando layouts JSON para fijar la posicion de titulos, listas y anotaciones.
- Diseno de producto y mockups: generar envases, etiquetas o packaging con texto legible en ingles o chino, evitando el tipico texto corrupto de otros modelos de difusion.
- Contenido editorial y creativo: ilustraciones con leyendas, bocadillos o notas manuscritas integradas en la escena, utiles para blogs, articulos y material de marketing.
- Localizacion de creatividades: producir una misma composicion con texto en ingles o en chino, cubriendo los dos idiomas soportados sin cambiar de modelo.
- Prototipado rapido de interfaces y wireframes: definir la disposicion de elementos y textos mediante JSON para previsualizar pantallas o paneles antes de implementarlos.
- Catalogos y fichas de comercio electronico: generar imagenes de producto con etiquetas, precios o descripciones incrustadas de forma controlada.
- Integracion en flujos de trabajo graficos: usar el plugin nativo de ComfyUI para encadenar MOSS-Image-SFT con otros nodos de postprocesado, escalado o composicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye una comparacion cualitativa mediante imagenes entre MOSS-Image-Base y MOSS-Image-SFT, en la que el ajuste SFT produce una agrupacion de texto mas clara y una disposicion mas ordenada en un ejemplo de pizarra. No se proporcionan cifras de metricas objetivas como FID, CLIPScore, GenEval, DPG-Bench ni evaluaciones de precision tipografica.

## Requisitos de hardware

- VRAM estimada: los 5.082.308.624 parametros en bfloat16 equivalen a aproximadamente 10,2 GB solo en pesos (calculo derivado del recuento de parametros, no confirmado por el autor); hay que sumar text encoder, VAE y activaciones, por lo que el pipeline completo requiere mas memoria. El repositorio ocupa 27,2 GB, lo que sugiere que incluye ficheros adicionales o varias copias de pesos.
- GPU recomendadas: el autor indica una GPU NVIDIA con soporte CUDA. Por rango de memoria, encajan tarjetas de 24 GB o mas (RTX 3090, RTX 4090, A100, H100). No se especifican modelos minimos.
- GPU de consumo: es probable que quepa en GPU de consumo de gama alta con 24 GB en bfloat16, y el autor documenta soporte de CPU offload, lo que permitiria ejecutarlo en tarjetas con menos VRAM a costa de latencia. No se publican cifras minimas verificadas.
- Opciones de despliegue: diffusers (`DiffusionPipeline` con `custom_pipeline="pipeline_moss_image"`), ComfyUI mediante plugin nativo, interfaz Gradio y descarga desde ModelScope. No se documenta soporte de vLLM ni de llama.cpp (no aplicables a este tipo de modelo).
- Entorno: Python 3.10 o superior, PyTorch 2.9 o superior, `diffusers>=0.38`, `transformers>=5.3`, `accelerate>=1.10`, `safetensors>=0.6` y `Pillow>=10`.
- Latencia y throughput: no disponibles. Como referencia, la configuracion por defecto ejecuta 50 pasos de muestreo con dos pasadas del transformer por paso (rama condicionada y rama negativa), lo que implica del orden de 100 evaluaciones del transformer por imagen; desactivar el salto de capa o modificar la guia altera este coste.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Disponibilidad | Relacion |
|---|---|---|---|---|---|
| MOSS-Image-SFT | 5,08 mil millones | en, zh | Apache 2.0 | HuggingFace (OpenMOSS-Team y copia ml-resources), ModelScope, demo en Spaces, ComfyUI | Version con ajuste supervisado |
| MOSS-Image-Base | No disponible | en, zh | Apache 2.0 | HuggingFace (OpenMOSS-Team), ModelScope | Modelo base del que deriva MOSS-Image-SFT |
| Otras familias text-to-image (FLUX.2, Qwen-Image, HunyuanImage u otras) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados de estos modelos en la informacion proporcionada |

La unica comparacion documentada por el autor es la de MOSS-Image-SFT frente a MOSS-Image-Base, y es de caracter cualitativo (imagenes de ejemplo), sin metricas. No hay datos suficientes en la informacion proporcionada para comparar con modelos de otras familias; unicamente consta que el VAE incluido emplea el decoder pequeno de FLUX.2, lo que no implica equivalencia de arquitectura ni de rendimiento.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks objetivos, por lo que no es posible cuantificar su calidad frente a alternativas.
- Riesgo de errores en el texto renderizado: aunque el ajuste SFT mejora la agrupacion tipografica, la generacion de texto en imagenes sigue siendo propensa a caracteres deformados o incorrectos, especialmente en composiciones densas.
- Cobertura idiomatica limitada a ingles y chino; no se documenta soporte de castellano ni de otros idiomas, lo que puede degradar los resultados al escribir texto en espanol.
- La model card no detalla la composicion del dataset de entrenamiento, por lo que no se pueden evaluar sesgos demograficos, culturales o estilisticos. Se desconoce si se aplicaron filtros de seguridad o mitigaciones de sesgo.
- Riesgo de sesgo y de contenido inapropiado inherente a los modelos generativos de imagen; el autor no documenta mecanismos de moderacion en la model card.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones de los componentes derivados, en particular el decoder VAE procedente de FLUX.2, cuya licencia original no se detalla en la informacion disponible.
- La ficha analizada corresponde al repositorio `ml-resources/MOSS-Image-SFT`, no al repositorio oficial `OpenMOSS-Team/MOSS-Image-SFT`. Presenta 0 descargas y 0 likes, y no se especifica su relacion exacta con el repositorio oficial; para produccion es recomendable verificar la procedencia y usar la publicacion oficial.
- Para ejecutar el pipeline es necesario `trust_remote_code=True` con un pipeline personalizado, lo que implica ejecutar codigo remoto del repositorio; debe auditarse antes de su uso en entornos productivos.
- No se documentan requisitos minimos de VRAM verificados ni cifras de latencia o throughput, por lo que las estimaciones de hardware deben validarse en el entorno real.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/ml-resources/MOSS-Image-SFT
- Repositorio oficial del modelo (SFT): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Repositorio oficial del modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Repositorio de codigo en GitHub: https://github.com/OpenMOSS/MOSS-Image
- Informe tecnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- Pagina del proyecto: https://openmoss.github.io/MOSS-Image/
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Guia de usuario (ingles): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guia de usuario (chino): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Documentacion de ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Flujo de trabajo de ejemplo para ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/moss-image/example_workflows/moss-image.json
- ModelScope (base): https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope (SFT): https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Cuenta oficial en X: https://x.com/Open_MOSS

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden exclusivamente de la model card y de la informacion del repositorio de HuggingFace.

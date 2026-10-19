# sekkit/MOSS-Image-Base

## Resumen

MOSS-Image-Base es un modelo de difusión texto-a-imagen desarrollado por OpenMOSS, la familia de modelos abiertos asociada al ecosistema MOSS. Esta ficha corresponde a la copia publicada por el usuario `sekkit` en Hugging Face como `sekkit/MOSS-Image-Base`, que replica el checkpoint oficial `OpenMOSS-Team/MOSS-Image-Base`. El modelo resuelve generación de imágenes a partir de indicaciones en lenguaje natural, secuencias de etiquetas y layouts en JSON, con un énfasis explícito en el control de la colocación de texto y la disposición de objetos dentro de la imagen.

El checkpoint contiene 5.082.308.624 parámetros según los metadatos de safetensors y ocupa 27,2 GB en el repositorio, lo que incluye el transformer, el codificador de texto y un VAE que, según la model card, emplea el decodificador pequeño de FLUX.2. La inferencia se realiza con un pipeline personalizado de diffusers (`MOSSImagePipeline`, fichero `pipeline_moss_image`) con sampler flow-matching Euler, 50 pasos por defecto y CFG 3.

Su relevancia ahora es doble: por un lado, la licencia Apache 2.0 permite uso comercial sin las restricciones habituales de otros modelos de imagen de gran tamaño; por otro, su soporte declarado de layouts JSON y de texto renderizado en inglés y chino lo sitúan en el nicho de la generación de imágenes con tipografía controlada, donde la mayoría de alternativas abiertas tienen un rendimiento inconsistente. Existe además una variante afinada, MOSS-Image-SFT, pensada para producir agrupaciones de texto y composiciones más ordenadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen con transformer (DiT) y sampler flow-matching Euler; pipeline personalizado `MOSSImagePipeline` de diffusers; VAE basado en el decodificador pequeno de FLUX.2 |
| Parametros totales | 5.082.308.624 (agregado del checkpoint; desglose por componente no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica la ventana del codificador de texto) |
| Tipos de cuantizacion | No disponible; el ejemplo oficial usa bfloat16 para transformer y codificador de texto, y float32 para VAE y ruido inicial. No se publican variantes GGUF, INT8 ni FP8 |
| Idiomas soportados | Ingles y chino (segun metadatos y ejemplos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria diffusers; tamano del repo 27,2 GB) |

## Arquitectura y entrenamiento

La informacion disponible describe un modelo de difusion para texto-a-imagen integrado en diffusers mediante un pipeline propio (`custom_pipeline="pipeline_moss_image"`, con `trust_remote_code=True`). El muestreo por defecto es flow-matching Euler con 50 pasos, guidance scale 3, shift 5 y omision de capa en la rama negativa (indice 22, base cero), lo que implica dos pasadas del transformer por paso de inferencia. La model card indica que el VAE incluido utiliza el decodificador pequeno de FLUX.2 y recomienda bfloat16 para transformer y codificador de texto, reservando float32 para el VAE y el ruido inicial.

El modelo se distribuye en dos variantes: MOSS-Image-Base, el checkpoint base, y MOSS-Image-SFT, una version sometida a ajuste supervisado que segun los ejemplos produce agrupaciones de texto mas claras y layouts de pizarra mas organizados. No se han publicado en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla la arquitectura interna del transformer (numero de bloques, dimensiones, atencion) ni del codificador de texto. Existe un informe tecnico enlazado desde el repositorio, pero su contenido no forma parte de los datos disponibles.

## Capacidades

- Generacion de imagenes a partir de indicaciones en lenguaje natural, con resolucion de ejemplo de 1024x1024 pixeles.
- Soporte de secuencias de etiquetas (tag sequences) como formato alternativo de indicacion.
- Soporte de layouts en JSON para controlar la ubicacion del texto y la disposicion de los objetos en la composicion.
- Renderizado de texto dentro de la imagen, con ejemplos especificos de escritura manuscrita en chino sobre objetos (por ejemplo, una nota adhesiva en una nevera).
- Indicaciones negativas (`negative_prompt`), vacias por defecto.
- Control fino del muestreo: pasos, guidance scale, shift y omision de capas en la rama negativa.
- Integracion con ComfyUI mediante plugin nativo instalable desde ComfyUI Manager.
- Interfaz Gradio incluida en el proyecto, con soporte de CPU offload y opciones de compilacion.
- No se documentan capacidades de edicion de imagen, inpainting, outpainting, control por imagen de referencia ni generacion de video.

## Casos de uso

- Generacion de material grafico con texto incrustado: carteles, infografias, pizarras y mockups donde el texto debe aparecer legible y colocado en una zona concreta. El soporte de layouts JSON permite fijar la posicion del bloque de texto en lugar de confiar en la adherencia del prompt.
- Prototipado de interfaces y wireframes: la variante SFT esta pensada para producir layouts de pizarra organizados, util para generar bocetos de pantallas o diagramas de flujo a partir de una descripcion textual.
- Localizacion de creatividades para mercados angloparlante y chino: al estar entrenado para texto en ingles y chino, cubre la generacion de rotulos y notas en ambos idiomas sin cambiar de modelo, algo relevante para campañas bilingues.
- Generacion de imagenes de producto con etiquetado: envases, notas de embalaje o carteles de precio con texto controlado, usando el prompt para fijar contenido y el layout para fijar posicion.
- Ilustracion editorial y de blog: generacion a 1024x1024 con control de pasos y CFG para ajustar fidelidad al prompt frente a variedad, con licencia Apache 2.0 que permite publicacion comercial.
- Pipeline interno de generacion por lotes con ComfyUI: al existir plugin nativo, se puede montar un flujo de trabajo con nodos que encadene generacion, escalado y postprocesado sin escribir codigo, adecuado para equipos de diseno.
- Investigacion en generacion de texto en imagenes: el modelo expone una tarea concreta (renderizado tipografico condicionado por layout) y licencia permisiva, lo que facilita reproducir experimentos y comparar con modelos cerrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, GenEval, DreamBench ni evaluaciones de renderizado de texto), y los resultados de busqueda web obtenidos no guardan relacion con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.082.308.624 parametros, los pesos en bfloat16 ocupan aproximadamente 10,2 GB; contando activaciones y el VAE en float32, un entorno comodo se situa en torno a 16-24 GB de VRAM para 1024x1024. Es una estimacion derivada del recuento de parametros, no un dato publicado.
- GPU recomendadas: NVIDIA A100 (40/80 GB) o H100 para despliegue por lotes; RTX 4090 (24 GB) para uso individual sin problemas; RTX 3090 (24 GB) como alternativa de coste.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, 4090). En tarjetas de 16 GB o menos sera necesario recurrir al CPU offload que documenta el proyecto, con la penalizacion de latencia correspondiente.
- Opciones de despliegue: diffusers (>=0.38) con el pipeline personalizado, PyTorch >=2.9 con CUDA, Gradio incluido en el proyecto, ComfyUI con plugin nativo, y accelerate (>=1.10) para offload. No se documentan integraciones con vLLM ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles. Los valores por defecto son 50 pasos con dos pasadas del transformer por paso (rama condicional y rama negativa), lo que da un minimo de 100 evaluaciones del transformer por imagen.
- Requisitos de software del ejemplo oficial: Python 3.10 o superior, diffusers >=0.38, transformers >=5.3, accelerate >=1.10, safetensors >=0.6, Pillow >=10.

## Comparativa con modelos similares

Los datos de las alternativas provienen de conocimiento publico general y no se han verificado contra la informacion proporcionada en esta busqueda; se marcan como referencia.

| Modelo | Parametros | Resolucion tipica | Licencia | Disponibilidad |
|---|---|---|---|---|
| MOSS-Image-Base | 5,08 mil millones | 1024x1024 (ejemplo) | Apache 2.0 | Hugging Face, ModelScope, ComfyUI, demo en Spaces |
| FLUX.1 [dev] | 12 mil millones (referencia) | 1024x1024 | No comercial | Hugging Face, amplio ecosistema |
| Stable Diffusion 3.5 Large | 8 mil millones (referencia) | 1024x1024 | Licencia comunitaria de Stability | Hugging Face |
| Qwen-Image | 20 mil millones (referencia) | 1024x1024 y superiores | Apache 2.0 | Hugging Face, ModelScope |

Frente a estas alternativas, MOSS-Image-Base es el de menor numero de parametros del grupo y el unico, junto con Qwen-Image, con licencia Apache 2.0 plena. Su diferenciador declarado no es la calidad general sino el control de layouts y el renderizado de texto en ingles y chino. No hay datos publicados que permitan comparar rendimiento real en generacion ni en renderizado tipografico.

## Limitaciones y advertencias

- Es un checkpoint base: la propia model card muestra que la variante SFT produce layouts y agrupaciones de texto mas ordenados, por lo que el uso directo del base exige prompts y layouts cuidados y puede dar composiciones menos limpias.
- Idiomas limitados a ingles y chino. No hay evidencia de soporte de texto en castellano dentro de la imagen, y los prompts fuera de esos idiomas no estan documentados.
- No se publican datos de entrenamiento, composicion del dataset ni procesos de filtrado, por lo que no es posible evaluar sesgos de representacion, sesgos culturales ni presencia de contenido nocivo en el corpus.
- Riesgo de fallo de adherencia al prompt y de texto mal renderizado (caracteres deformados o inventados), especialmente fuera de los layouts estructurados y con cadenas largas.
- El pipeline requiere `trust_remote_code=True` y descarga codigo personalizado desde el repositorio; conviene fijar una revision concreta y auditar el codigo antes de usarlo en produccion.
- El repositorio analizado (`sekkit/MOSS-Image-Base`) es una copia de terceros con 0 descargas y 0 likes; para produccion conviene usar el repositorio oficial `OpenMOSS-Team/MOSS-Image-Base`, que es el referenciado en la model card.
- La fecha de creacion y actualizacion del repositorio (2026-10-18) aparece en el futuro respecto al momento de redaccion; conviene verificar la procedencia y la integridad de los pesos antes de desplegarlos.
- El repositorio ocupa 27,2 GB frente a los aproximadamente 10,2 GB que ocuparian los pesos en bfloat16, lo que sugiere duplicacion de componentes o copias en mayor precision; verificar el contenido antes de planificar almacenamiento y caché.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no incluye garantias ni clausulas de indemnizacion sobre posibles reclamaciones de derechos de terceros derivadas de las imagenes generadas.

## Enlaces

- Hugging Face (copia analizada): https://huggingface.co/sekkit/MOSS-Image-Base
- Hugging Face (repositorio oficial base): https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Hugging Face (variante SFT): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- ModelScope (base): https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope (SFT): https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Repositorio de codigo: https://github.com/OpenMOSS/MOSS-Image
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Pagina del proyecto: https://openmoss.github.io/MOSS-Image/
- Informe tecnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- Guia de usuario (ingles): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guia de usuario (chino): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Plugin e instrucciones de ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Flujo de trabajo de ejemplo en ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/moss-image/example_workflows/moss-image.json
- Cuenta de X de OpenMOSS: https://x.com/Open_MOSS
- Comunidad en Discord: https://discord.gg/nXFWEyvbb

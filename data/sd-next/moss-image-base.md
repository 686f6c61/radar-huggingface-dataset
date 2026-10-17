# SD-Next/MOSS-Image-Base

## Resumen

MOSS-Image-Base es un modelo de difusion latente texto-a-imagen desarrollado por OpenMOSS y distribuido en este repositorio por SD-Next como espejo (mirror) de la revision `5f40f07a` del repositorio original `OpenMOSS-Team/MOSS-Image-Base`. Se trata del modelo base de la familia MOSS-Image, pensado para generar imagenes a partir de prompts en lenguaje natural, pero con un rasgo diferencial: acepta tambien secuencias de etiquetas y layouts en formato JSON para controlar la colocacion del texto y la disposicion de los objetos dentro de la imagen. Esto lo orienta a escenarios donde el texto renderizado debe aparecer en una posicion concreta (carteles, pizarras, notas manuscritas, infografias).

El repositorio ocupa 27,2 GB e incluye transformer, VAE, codificador de texto, tokenizer, scheduler y una pipeline personalizada (`pipeline_moss_image.py`) que no se ha modificado respecto al original. El recuento real de parametros en safetensors es de 5.082.308.624 (aproximadamente 5,08 mil millones). La licencia es Apache 2.0 y los idiomas declarados son ingles y chino, lo que encaja con la capacidad destacada de renderizar texto en ambos idiomas.

Su relevancia practica es doble: por un lado, es un modelo de generacion de imagenes con control estructural del texto (un problema notoriamente dificil en difusion); por otro, su integracion nativa en SD.Next y ComfyUI, ademas de diffusers con pipeline custom, lo hace desplegable en flujos de trabajo graficos ya existentes. Existe ademas una variante ajustada con SFT (`OpenMOSS-Team/MOSS-Image-SFT`) que, segun el model card, produce agrupaciones de texto mas claras y layouts mas organizados que la version base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente texto-a-imagen con backbone transformer, VAE, codificador de texto, tokenizer y scheduler (detalle interno de capas no disponible en la informacion proporcionada) |
| Parametros totales | 5.082.308.624 (aproximadamente 5,08 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (no aplica el concepto de ventana de contexto de un LLM; no se especifica el limite de tokens del codificador de texto) |
| Tipos de cuantizacion | no disponible; el model card solo especifica bfloat16 para transformer y codificador de texto, y float32 para VAE y ruido inicial |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria diffusers) |
| Pipeline | text-to-image (`diffusers:MOSSImagePipeline` / `pipeline_moss_image`) |
| Revision del espejo | 5f40f07a |
| Tamano del repositorio | 27,2 GB |
| VAE | decodificador pequeno de FLUX.2 |

## Arquitectura y entrenamiento

El modelo sigue un esquema de difusion latente: un transformer procesa las representaciones latentes y un VAE las decodifica a imagen final. El model card indica explicitamente que el repositorio contiene transformer, VAE, codificador de texto, tokenizer, scheduler y la pipeline personalizada, pero no detalla el numero de capas, la dimensionalidad de los embeddings, el tipo de atencion ni la composicion del dataset de entrenamiento. Tampoco se especifica el numero de tokens de entrenamiento, si hubo etapas de RLHF/DPO ni el procedimiento de ajuste de la version base frente a la SFT. El VAE incluido emplea el decodificador pequeno de FLUX.2.

La innovacion mas destacable que si aparece documentada es la interfaz de control: el modelo acepta prompts en lenguaje natural, secuencias de etiquetas y layouts JSON que permiten fijar la posicion del texto y la organizacion de los objetos. El ejemplo oficial del model card genera una cocina de 1024x1024 con una nota manuscrita en chino sobre la puerta de la nevera, con varias lineas de texto, lo que ilustra el objetivo de renderizado de texto fiable y localizado. La inferencia usa por defecto 50 pasos, `guidance_scale` de 3.0, semilla manual y el parametro `uncond_skip_layers=[22]` para omitir capas en la rama no condicionada.

## Capacidades

- Generacion de imagenes a partir de prompts en lenguaje natural en ingles y chino.
- Renderizado de texto dentro de la imagen, incluyendo texto manuscrito, con control de posicion mediante layouts JSON.
- Control de la disposicion de objetos y de la agrupacion de texto mediante secuencias de etiquetas y estructuras JSON.
- Soporte de resoluciones configurables; el ejemplo oficial usa 1024x1024.
- Integracion con diffusers mediante pipeline personalizada (`custom_pipeline="pipeline_moss_image"`, `trust_remote_code=True`).
- Integracion con SD.Next (carga desde la lista de referencia de modelos) y con ComfyUI mediante plugin nativo instalable desde ComfyUI Manager.
- Variante SFT disponible (`MOSS-Image-SFT`) con mejor organizacion del texto y del layout.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento, por tratarse de un modelo de generacion de imagenes.

## Casos de uso

- Carteleria y publicidad con texto integrado: el modelo puede colocar el eslogan en la posicion exacta indicada en un layout JSON, evitando el problema habitual de texto deformado o mal situado en modelos de difusion genericos.
- Material de marketing multilingue (ingles y chino): un mismo flujo puede generar variantes con texto en ambos idiomas, util para campanas dirigidas a mercados asiaticos y anglosajones.
- Infografias y materiales educativos: la combinacion de layout JSON y agrupacion de texto permite generar diagramas con etiquetas legibles en zonas concretas de la imagen.
- Prototipado de interfaces y mockups: la disposicion controlada de elementos facilita generar bocetos de pantallas con textos de relleno colocados de forma coherente.
- Ilustracion de documentacion tecnica: generacion de diagramas anotados o capturas simuladas con rotulos especificos, integrable en pipelines de documentacion automatizada.
- Generacion de imagenes para comercio electronico: productos con etiquetas, precios o textos promocionales renderizados en zonas definidas del encuadre.
- Creacion de datasets sinteticos para OCR y deteccion de texto: al controlar la posicion y el contenido del texto, resulta util para aumentar corpus de entrenamiento con anotaciones conocidas a priori.
- Integracion en flujos ComfyUI y SD.Next: estudio de diseno o equipos de contenido que ya trabajan con nodos pueden incorporar el modelo sin reescribir su toolchain.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card y los resultados de busqueda proporcionados no incluyen metricas como FID, CLIP score, GenEval, DPG-Bench ni ninguna comparativa numerica con otros modelos texto-a-imagen.

## Requisitos de hardware

- VRAM estimada en bfloat16: los pesos suman aproximadamente 5,08 mil millones de parametros, lo que supone en torno a 10 GB solo en pesos entre transformer y codificador de texto, mas el VAE en float32 y las activaciones de la difusion a 1024x1024. Como estimacion, entre 12 y 16 GB de VRAM para inferencia completa con `torch_dtype` mixto.
- El model card indica que existe soporte de CPU offload, lo que permite ejecutar el modelo con menos VRAM a costa de mayor latencia; el repositorio ocupa 27,2 GB en disco.
- GPU recomendadas: A100, H100 o similares para produccion y lotes grandes; RTX 4090 para uso individual a 1024x1024 en bfloat16.
- GPU de consumo: cabe en tarjetas de gama alta con 16 GB o mas (RTX 4080/4090, RTX 5080/5090) y, con offload activado, es previsible que funcione en tarjetas de 8-12 GB, aunque este extremo no esta cuantificado en la informacion disponible.
- Entorno de software: Python 3.10 o superior, GPU NVIDIA con CUDA, PyTorch 2.9 o superior, `diffusers>=0.38`, `transformers>=5.3`, `accelerate>=1.10`, `safetensors>=0.6` y `Pillow>=10`.
- Opciones de despliegue: diffusers con la pipeline personalizada incluida, SD.Next y ComfyUI mediante plugin nativo. No se documentan pesos GGUF ni soporte para vLLM, llama.cpp, Ollama o TGI, que en cualquier caso no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La configuracion de referencia usa 50 pasos de inferencia, por lo que el tiempo por imagen dependera de la GPU y de si se aplica compilacion u offload.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. La siguiente tabla recoge unicamente caracteristicas basicas y conocidas de alternativas de la misma categoria; los datos de MOSS-Image-Base provienen del model card y del repositorio, mientras que el resto son caracteristicas generales de cada proyecto y no una medicion de calidad.

| Modelo | Parametros | Idiomas | Licencia | Formato / ecosistema | Rendimiento comparado |
|---|---|---|---|---|---|
| MOSS-Image-Base | 5,08 mil millones | en, zh | Apache 2.0 | safetensors, diffusers, SD.Next, ComfyUI | no disponible |
| MOSS-Image-SFT | no disponible en la informacion proporcionada | en, zh | Apache 2.0 (misma familia) | safetensors, diffusers | el model card indica mejor agrupacion de texto y layout mas organizado que la version base, sin metricas |
| Otros modelos texto-a-imagen con renderizado de texto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han hallado en la busqueda web resultados relevantes sobre modelos comparables: los resultados devueltos corresponden a tarjetas de memoria SD y no guardan relacion con el modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; como todo modelo de difusion entrenado con datos a gran escala, es previsible que reproduzca sesgos presentes en sus datos de entrenamiento, pero no hay analisis publicado al respecto.
- Riesgo de alucinacion visual: el modelo puede generar texto con errores ortograficos, caracteres deformados o contenido incoherente, especialmente en cadenas largas; el propio model card compara base y SFT precisamente porque la version base organiza peor el texto.
- Cobertura de idiomas limitada a ingles y chino; no hay garantia de renderizado correcto de texto en otros idiomas, incluido el castellano.
- La version base es un modelo sin ajuste SFT, por lo que su seguimiento de instrucciones y la calidad del layout son inferiores a los de `MOSS-Image-SFT` segun el propio autor.
- Licencia Apache 2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion del aviso de licencia. No se declaran restricciones adicionales de uso aceptable en la informacion disponible.
- Este repositorio es un espejo mantenido por SD-Next; para cuestiones de soporte, actualizaciones o responsabilidad sobre el modelo conviene referirse al repositorio original de OpenMOSS.
- Requiere `trust_remote_code=True` al cargar la pipeline personalizada en diffusers, lo que implica ejecutar codigo incluido en el repositorio; conviene revisarlo antes de desplegarlo en entornos de produccion.
- No se especifican limites de resolucion, longitud de prompt ni comportamiento con lotes grandes; el ejemplo de referencia esta fijado en 1024x1024 y 50 pasos.
- El repositorio se creo y actualizo el 16 de octubre de 2026 y no registra descargas ni interacciones, por lo que la trazabilidad de uso en la comunidad es practicamente nula.

## Enlaces

- Repositorio HuggingFace (espejo SD-Next): https://huggingface.co/SD-Next/MOSS-Image-Base
- Repositorio original: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Variante SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Codigo en GitHub: https://github.com/OpenMOSS/MOSS-Image
- Demostracion en HuggingFace Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Pagina del proyecto: https://openmoss.github.io/MOSS-Image/
- Informe tecnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- Guia de usuario (ingles): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guia de usuario (chino): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Integracion con ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Proyecto SD.Next: https://github.com/vladmandic/sdnext
- ModelScope (base): https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope (SFT): https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Cuenta de OpenMOSS en X: https://x.com/Open_MOSS

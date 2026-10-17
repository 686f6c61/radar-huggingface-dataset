# SD-Next/MOSS-Image-SFT

## Resumen

MOSS-Image-SFT es un modelo de generacion de imagenes a partir de texto (text-to-image) desarrollado por OpenMOSS y publicado originalmente en el repositorio `OpenMOSS-Team/MOSS-Image-SFT`. La ficha que se analiza aqui es un espejo (mirror) mantenido por SD-Next en `SD-Next/MOSS-Image-SFT`, fijado a la revision `daf706d2`, cuyo unico proposito es facilitar la carga del modelo en la interfaz SD.Next y en diffusers sin alterar ningun componente del repositorio original.

El modelo es un fine-tuning supervisado (SFT) sobre `OpenMOSS-Team/MOSS-Image-Base`, del que hereda arquitectura y pipeline de inferencia. Cuenta con 5.082.308.624 parametros reales en safetensors y un tamano de repositorio de 27,2 GB. Su rasgo diferencial es el control tipografico y de composicion: acepta prompts en lenguaje natural, secuencias de etiquetas y layouts en JSON para colocar texto y organizar objetos dentro de la imagen, con soporte declarado de ingles y chino.

La relevancia del modelo esta en que cubre un nicho poco atendido por los generadores de imagen genericos: la generacion de texto legible y bien agrupado dentro de la imagen (rotulos, pizarras, notas manuscritas, carteles) y el control espacial explicito mediante JSON. La comparativa incluida en la model card muestra que la variante SFT produce una agrupacion de texto mas clara y un layout de pizarra mas ordenado que MOSS-Image-Base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia MOSS-Image; pipeline de difusion con transformer, VAE, text encoder, tokenizer y scheduler; decodificador VAE basado en FLUX.2 small decoder) |
| Parametros totales | 5.082.308.624 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card recomienda bfloat16 para transformer y text encoder, y float32 para VAE y ruido inicial) |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la composicion del pipeline: un transformer, un VAE, un text encoder, un tokenizer y un scheduler, todos ellos sin cambios respecto al repositorio original. La inferencia se realiza mediante el pipeline personalizado `pipeline_moss_image` (`MOSSImagePipeline`), que debe cargarse con `custom_pipeline` y `trust_remote_code=True` en diffusers. El VAE incluido emplea el decodificador small de FLUX.2. Se trata de un modelo de difusion para generacion de imagenes, no de un modelo de lenguaje, por lo que no procede hablar de decodificacion especulativa ni de atencion lineal.

En cuanto al entrenamiento, MOSS-Image-SFT es un ajuste fino supervisado sobre MOSS-Image-Base. No se especifican en la informacion proporcionada el numero de tokens de imagen-texto, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Si se documenta la existencia de un informe tecnico (MOSS_Image_Technical_Report.pdf) en el repositorio GitHub del proyecto, que es donde deberia consultarse el detalle de arquitectura y datos de entrenamiento.

## Capacidades

- Generacion de imagenes a partir de texto con el pipeline `text-to-image`, en resoluciones como 1024x1024 y con parametros de muestreo configurables (por ejemplo, 50 pasos y `guidance_scale` de 3,0).
- Generacion de texto dentro de la imagen con agrupacion clara: la model card muestra ejemplos de rotulos, notas manuscritas y disposiciones tipo pizarra donde la variante SFT mejora respecto a la base.
- Soporte de prompts en lenguaje natural.
- Soporte de secuencias de etiquetas (tag sequences) como formato alternativo de prompt.
- Soporte de layouts en JSON para controlar la colocacion del texto y la disposicion de los objetos.
- Soporte multilingue en la generacion de texto incrustado: ingles y chino (el ejemplo de la model card genera una nota manuscrita en chino).
- Integracion con herramientas de terceros: carga en SD.Next, pipeline nativo en ComfyUI (instalable desde ComfyUI Manager) e interfaz Gradio en el repositorio del proyecto.
- Modo de ahorro de memoria: la documentacion del proyecto menciona opciones de CPU offload y de compilacion.
- No se documentan en la informacion disponible capacidades de edicion de imagen, inpainting, vision, audio, tool calling ni razonamiento multi-paso, que no aplican a este tipo de modelo.

## Casos de uso

- Rotulacion y carteleria comercial: generacion de carteles, etiquetas de producto o packaging donde el texto debe aparecer legible y correctamente agrupado, aprovechando el ajuste SFT especificamente orientado a mejorar la agrupacion tipografica frente al modelo base.
- Material educativo y pizarras: creacion de ilustraciones de pizarras, diagramas anotados o infografias con bloques de texto ordenados, uno de los escenarios que la propia model card emplea como comparativa entre base y SFT.
- Mockups de interfaz y producto: uso del control mediante layouts JSON para colocar elementos y textos en posiciones concretas dentro del lienzo, util en la generacion de mockups y escenas con disposicion controlada.
- Contenido multilingue ingles-chino: generacion de materiales con texto incrustado en chino (notas, avisos, etiquetas) o en ingles, un caso poco cubierto por generadores entrenados predominantemente en ingles.
- Ilustracion editorial y narrativa: produccion de escenas con elementos anotados (por ejemplo, un frigorifico con una nota manuscrita) para articulos, blogs o material divulgativo.
- Integracion en flujos de trabajo de imagen existentes: despliegue como nodo nativo en ComfyUI o como modelo de referencia en SD.Next, lo que permite encajarlo en pipelines de generacion por lotes sin escribir codigo adicional.
- Prototipado rapido de concepto visual: uso de la demo de Hugging Face Spaces o de una interfaz Gradio local con CPU offload para iterar sobre prompts antes de invertir en infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el recuento real de parametros es de 5.082.308.624. En bfloat16, los pesos del conjunto (transformer, text encoder y VAE) ocupan aproximadamente 10,2 GB. Sumando el VAE en float32 (como recomienda la model card) y las activaciones de la difusion a 1024x1024, una estimacion razonable es de 12 a 16 GB de VRAM en bfloat16. Estas cifras son estimaciones derivadas del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: la model card exige una GPU NVIDIA con soporte CUDA y PyTorch 2.9 o superior. Por tamano, el modelo encaja con holgura en A100 (40/80 GB) y H100 (80 GB), y de forma ajustada en RTX 4090 (24 GB).
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090, RTX 3090 y RTX 4080 (16 GB) con margen variable, y en tarjetas de 16 GB como la RTX 4060 Ti usando CPU offload. Las GPU de 8-12 GB requeririan offload agresivo o cuantizacion, cuya disponibilidad no se documenta.
- Opciones de despliegue: diffusers con el pipeline personalizado `pipeline_moss_image` (requiere `diffusers>=0.38`, `transformers>=5.3`, `accelerate>=1.10`, `safetensors>=0.6`, `Pillow>=10` y Python 3.10 o superior), ComfyUI mediante nodo nativo instalable desde ComfyUI Manager, SD.Next a traves de la lista de modelos de referencia, y Gradio con soporte de CPU offload. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, soluciones no orientadas a pipelines de difusion de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Control de texto/layout | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SD-Next/MOSS-Image-SFT (espejo de OpenMOSS-Team/MOSS-Image-SFT) | 5.082.308.624 | Prompts naturales, secuencias de etiquetas y layouts JSON | en, zh | Apache 2.0 | Hugging Face (espejo), modelo original en Hugging Face y ModelScope |
| OpenMOSS-Team/MOSS-Image-Base | no disponible | Misma arquitectura y pipeline; sin el ajuste SFT para agrupacion de texto | no disponible | no disponible en la informacion proporcionada | Hugging Face, ModelScope |
| Otros generadores text-to-image open source de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de parametros, contexto, rendimiento ni licencia de alternativas comparables, por lo que no es posible establecer una comparacion cuantitativa fiable. La unica comparacion documentada por el autor es la cualitativa entre MOSS-Image-Base y MOSS-Image-SFT.

## Limitaciones y advertencias

- Este repositorio es un espejo mantenido por SD-Next, no el repositorio oficial. Para citas, soporte e incidencias debe utilizarse `OpenMOSS-Team/MOSS-Image-SFT`.
- El espejo esta fijado a la revision `daf706d2`; no recibira necesariamente las actualizaciones del modelo original.
- Los idiomas declarados son unicamente ingles y chino. No hay soporte documentado de castellano ni de otros idiomas, ni en el prompt ni, presumiblemente, en el texto generado dentro de la imagen.
- Riesgo de alucinacion visual y de errores tipograficos: es una limitacion intrinseca de los modelos de difusion para texto incrustado, aunque el ajuste SFT esta orientado precisamente a mitigarla. No hay datos cuantitativos publicados sobre tasa de error tipografico.
- No se documentan sesgos concretos, pero al ser un ajuste sobre un modelo base cuyo dataset no se detalla, no puede descartarse la reproduccion de sesgos presentes en los datos de entrenamiento originales.
- La ventana de contexto del text encoder no esta publicada, por lo que se desconoce la longitud maxima de prompt admitida. Los prompts muy largos pueden truncarse.
- Licencia Apache 2.0, que permite uso comercial y modificacion siempre que se conserven los avisos de copyright y la propia licencia. Debe verificarse la licencia del modelo base, no confirmada en la informacion disponible.
- El modelo se distribuye en safetensors de precision completa (bfloat16/float32 segun componente); no se documentan versiones cuantizadas, lo que limita su despliegue en hardware de gama baja.
- Requiere `trust_remote_code=True` en diffusers, lo que implica ejecutar codigo Python remoto del repositorio. Conviene auditar el pipeline antes de usarlo en produccion.
- Las dependencias exigidas son muy recientes (PyTorch 2.9 o superior, diffusers 0.38 o superior, transformers 5.3 o superior), lo que puede complicar la integracion en entornos con versiones fijadas.
- El modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que existe poca validacion externa de su comportamiento en produccion.

## Enlaces

- Repositorio del espejo en Hugging Face: https://huggingface.co/SD-Next/MOSS-Image-SFT
- Repositorio original en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Modelo base en ModelScope: https://modelscope.cn/models/openmoss/MOSS-Image-Base
- Modelo SFT en ModelScope: https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Repositorio de codigo en GitHub: https://github.com/OpenMOSS/MOSS-Image
- Informe tecnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- Guia de usuario (ingles): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guia de usuario (chino): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Instrucciones de ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Pagina del proyecto: https://openmoss.github.io/MOSS-Image/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- SD.Next: https://github.com/vladmandic/sdnext

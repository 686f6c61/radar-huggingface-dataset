# Cpackty1/Qwen-Image-2.1-Uncensored-GGUF

# Qwen-Image-2.1 Uncensored GGUF del repositorio Cpackty1

## Resumen

Qwen-Image-2.1 Uncensored GGUF es un conjunto de cuantizaciones en formato GGUF del modelo de difusión Qwen/Qwen-Image-2.1, publicadas por el usuario Cpackty1 en HuggingFace. No se trata de un modelo entrenado desde cero ni de un ajuste fino: el autor indica que parte de los pesos originales del modelo base sin modificar y los empaqueta en distintos niveles de precisión para su ejecución local en ComfyUI. El componente de generación visual tiene 7.115.124.736 parametros (unos 7,1 mil millones) distribuidos en 32 capas Single-Stream DiT, según la información del repositorio oficial de Qwen en GitHub.

El interés de esta publicación es práctico: convierte un modelo de generación de imágenes de aproximadamente 7B en algo ejecutable en GPU de consumo y en Apple Silicon, con variantes desde BF16 (14,23 GB) hasta Q4_0 (4,15 GB) o NVFP4 (4,05 GB). El repositorio incluye además los ficheros auxiliares necesarios para el pipeline completo en ComfyUI: el text encoder Qwen3-VL de 8B (en BF16 o Int8 ConvRot) y el VAE propio del modelo. El repositorio ocupa 105 GB en total.

La etiqueta "uncensored" no procede de un reentrenamiento: según los análisis publicados en la web, los ficheros apuntan a los pesos upstream sin modificar, de modo que el comportamiento respecto a rechazos depende del text encoder y de la configuración del pipeline, no del DiT cuantizado. La licencia declarada es qwen-research (license: other), lo que condiciona el uso comercial. El repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con 32 capas Single-Stream; pipeline completo con text encoder Qwen3-VL-8B y VAE dedicado |
| Parametros totales | 7.115.124.736 (aproximadamente 7,1 B, segun safetensors del modelo base) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible (no documentada por el autor; corresponde al text encoder Qwen3-VL-8B) |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible (el autor no documenta idiomas; los prompts se procesan con Qwen3-VL-8B) |
| Licencia | qwen-research (license: other, license_name: qwen-research) |
| Formato de pesos | GGUF y safetensors (FP8, INT8 ConvRot y MLX en safetensors) |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: quantized) |
| Pipeline declarado | text-to-image |
| Libreria | gguf |
| Tamano del repositorio | 105,0 GB |
| Ficheros auxiliares incluidos | text_encoders/qwen3vl_8b_bf16.safetensors (17,53 GB), text_encoders/qwen3vl_8b_int8_convrot.safetensors (9,35 GB), vae/qwen_image_2.1_vae_bf16.safetensors (676 MB) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-27 (segun metadatos de HuggingFace) |

Desglose de cuantizaciones del transformer (ficheros "UC", sin censura declarada):

| Cuantizacion | Fichero | Tamano |
|---|---|---|
| BF16 | qwen-image-2.1-UC-BF16.gguf | 14,23 GB |
| FP8 | qwen-image-2.1-UC-fp8.safetensors | 6,63 GB |
| INT8 ConvRot | qwen-image-2.1-UC-int8_convrot.safetensors | 6,76 GB |
| NVFP4 | qwen-image-2.1-UC-NVFP4.gguf | 4,05 GB |
| MLX 4-bit | qwen-image-2.1-UC-MLX-4bit.safetensors | 4,00 GB |
| MLX 6-bit | qwen-image-2.1-UC-MLX-6bit.safetensors | 5,78 GB |
| MLX 8-bit | qwen-image-2.1-UC-MLX-8bit.safetensors | 7,56 GB |
| Q8_0 | qwen-image-2.1-UC-Q8_0.gguf | 7,59 GB |
| Q6_K | qwen-image-2.1-UC-Q6_K.gguf | 5,88 GB |
| Q5_K_M | qwen-image-2.1-UC-Q5_K_M.gguf | 5,22 GB |
| Q4_K_M | qwen-image-2.1-UC-Q4_K_M.gguf | 4,60 GB |
| Q4_0 | qwen-image-2.1-UC-Q4_0.gguf | 4,15 GB |

El repositorio incluye ademas una rama "base" con GGUF equivalentes sin el sufijo UC (Q8_0 7,59 GB, Q6_K 5,88 GB, Q5_K_M 5,22 GB, Q4_K_M 4,60 GB, Q4_0 4,05 GB). El autor recomienda Q4_K_M como mejor equilibrio entre tamano y calidad.

## Arquitectura y entrenamiento

El componente generativo es un Diffusion Transformer (DiT) de 32 capas Single-Stream con aproximadamente 7,1 B de parametros. La descripcion del repositorio oficial de QwenLM define Qwen-Image-2.1 como un modelo unificado de generacion texto-a-imagen y edicion de imagenes, y cita entre sus objetivos de diseno una arquitectura compacta y eficiente. Esta publicacion concreta no aporta informacion sobre el entrenamiento del modelo base: no se detallan tokens de entrenamiento, composicion del dataset, ni si hubo etapas de RLHF o DPO. Al tratarse de una cuantizacion post-entrenamiento, no hay reentrenamiento ni ajuste fino; el proceso consiste en convertir los pesos del checkpoint original a distintos formatos (GGUF Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0; safetensors FP8, INT8 ConvRot, MLX 4/6/8-bit; BF16 y NVFP4).

El pipeline de inferencia combina tres piezas: el transformer DiT cuantizado, un text encoder Qwen3-VL de 8B (disponible en BF16 o Int8 ConvRot) y un VAE especifico del modelo (qwen_image_2.1_vae_bf16.safetensors, 676 MB). No se documenta en la informacion disponible ninguna innovacion adicional como decodificacion especulativa o atencion lineal aplicada a esta cuantizacion. Tampoco se documenta el mecanismo exacto por el que la variante se presenta como "uncensored"; las fuentes de la busqueda web afirman que los pesos apuntados son los originales sin modificar, y algunos flujos de la comunidad recurren a un text encoder alternativo ("Heretic") para evitar rechazos.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) en local, sin depender de API externa.
- Edicion de imagenes: el modelo base Qwen-Image-2.1 se presenta oficialmente como modelo unificado de generacion y edicion.
- Ejecucion en ComfyUI mediante el nodo Unet Loader (GGUF) y el cargador CLIPLoader para el text encoder, con el VAE especifico del modelo.
- Carga de text encoder en dos precisiones (BF16, 17,53 GB; Int8 ConvRot, 9,35 GB) para ajustar el consumo de memoria.
- Soporte de Apple Silicon mediante las variantes MLX en 4, 6 y 8 bits.
- Despliegue offline completo: todos los ficheros necesarios (transformers, text encoder y VAE) residen en el mismo repositorio.
- Variante declarada como sin censura (sufijo UC) sobre los pesos upstream, orientada a prompts que los pipelines con filtros suelen rechazar.
- Tool calling, function calling, razonamiento multi-paso, modo thinking, audio y vision sobre imagenes de entrada: no disponible o no aplicable a este pipeline de generacion de imagenes.
- Capacidades multilingues: no disponible (el autor no documenta idiomas soportados).

## Casos de uso

- Generacion de ilustraciones editoriales: con Q4_K_M (4,60 GB) y el encoder en Int8, el pipeline completo cabe en GPU de 16 GB, lo que permite producir ilustraciones para articulos o blogs sin coste por API y con control total sobre los pesos.
- Concept art y previsualizacion de assets para videojuegos: iterar decenas de variaciones de un personaje o escenario en local usando la variante MLX 4-bit en un Mac con Apple Silicon, sin subir material propietario a servicios en la nube.
- Edicion de imagenes en post-produccion: el modelo base admite edicion guiada por prompt, de modo que se puede integrar en un flujo de ComfyUI que reciba una imagen, aplique una modificacion descrita en texto y devuelva el resultado a un pipeline de retoque.
- Automatizacion por lotes con API de ComfyUI: levantar una instancia de ComfyUI con el DiT en Q4_K_M y encolar generaciones desde un script, util para producir catalogos de imagenes de producto o variaciones de formato para campanas.
- Generacion de contenido sin filtros de rechazo: la variante UC esta pensada para prompts que los pipelines censurados bloquean; requiere revisar la legislacion aplicable y las condiciones de uso de la plataforma de destino antes de cualquier publicacion.
- Investigacion sobre sesgos y seguridad: disponer de una version sin filtros facilita tareas de red-teaming y evaluacion de que tipos de contenido genera el modelo base, comparando el comportamiento del encoder original frente a alternativas.
- Experimentacion con cuantizaciones en hardware limitado: comparar Q4_0, Q4_K_M, Q6_K y Q8_0 sobre el mismo prompt permite medir la degradacion de calidad y el ahorro de VRAM antes de fijar una configuracion de produccion.
- Demostraciones y prototipos de aplicaciones creativas: gracias a que no requiere conexion ni claves de API, sirve para prototipar herramientas de diseno generativo en portatiles con GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una imagen de referencia (assets/Qwen-Image-2.1-Benchmark.png) que no se acompana de cifras ni de la metodologia empleada, por lo que no se pueden citar valores concretos. El repositorio oficial de QwenLM describe Qwen-Image-2.1 como el modelo de imagen de codigo abierto mas potente de la familia Qwen, pero esta ficha no dispone de las metricas que respalden esa afirmacion.

## Requisitos de hardware

Estimaciones calculadas a partir de los tamanos de fichero publicados, no de mediciones directas del autor:

- Configuracion minima practica: DiT en Q4_K_M (4,60 GB) + text encoder Int8 ConvRot (9,35 GB) + VAE (0,68 GB) = aproximadamente 14,6 GB de pesos. Con el overhead de activaciones y del grafo de ComfyUI, se recomienda un minimo de 16 GB de VRAM.
- Configuracion de maxima calidad: DiT en BF16 (14,23 GB) + text encoder BF16 (17,53 GB) + VAE (0,68 GB) = aproximadamente 32,4 GB de pesos, lo que apunta a 40-48 GB de VRAM.
- GPU de consumo viables: RTX 4090 o 4080 (24 GB y 16 GB) para Q4_K_M, Q5_K_M o Q6_K con encoder Int8; RTX 4070 Ti Super (16 GB) para Q4_K_M; RTX 3060 de 12 GB requiere descarga parcial a RAM del text encoder o el uso de cuantizaciones mas agresivas.
- GPU profesionales: A100 40/80 GB, H100 y RTX 6000 Ada para BF16 completo sin offloading.
- NVFP4 (4,05 GB): el formato esta asociado a la generacion Blackwell (serie RTX 50 y B200), por lo que en arquitecturas anteriores no es utilizable.
- Apple Silicon: variantes MLX 4-bit (4,00 GB), 6-bit (5,78 GB) y 8-bit (7,56 GB) para macOS; las fuentes de la busqueda mencionan optimizacion de VRAM en RTX y Apple Silicon.
- Nota de consumo real: ComfyUI puede liberar el text encoder de la VRAM antes de la fase de muestreo, por lo que el pico de memoria puede ser inferior a la suma de los tres componentes si se configura el offloading.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF (el autor recomienda el fork leejet/ComfyUI-GGUF, con soporte nativo de Qwen-Image 2.1, y advierte de un error "Unknown model architecture!" con el fork antiguo city96). Para las variantes MLX, el stack de MLX en Apple Silicon. No se documenta soporte en vLLM ni en TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. No se publican tiempos de generacion por imagen ni medidas de imagenes por segundo en ninguna de las fuentes consultadas.

## Comparativa con modelos similares

La informacion proporcionada en esta busqueda no incluye datos verificables de modelos comparables. La tabla siguiente recoge referencias de conocimiento general que deben verificarse antes de su publicacion:

| Modelo | Parametros | Tipo | Contexto / resolucion | Licencia | Disponibilidad | Fuente |
|---|---|---|---|---|---|---|
| Qwen-Image-2.1 Uncensored GGUF (este) | 7,1 B (componente visual) | DiT Single-Stream 32 capas | no disponible | qwen-research | GGUF y safetensors en HuggingFace | Datos del repositorio |
| Qwen-Image-2.1 (base) | 7,1 B (componente visual) | DiT Single-Stream 32 capas | no disponible | qwen-research | HuggingFace y GitHub oficiales | Modelo base citado |
| Otros modelos de generacion de imagen de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No verificado en esta busqueda |

No se dispone de comparativas de rendimiento entre esta cuantizacion y alternativas como Flux o Stable Diffusion 3.5 dentro de la informacion consultada.

## Limitaciones y advertencias

- La etiqueta "uncensored" no implica un modelo reentrenado: segun las fuentes de la busqueda, los ficheros apuntan a los pesos upstream sin modificar. El comportamiento respecto a rechazos depende del text encoder y de la configuracion del pipeline, no del DiT cuantizado.
- Los enlaces de descarga que aparecen en la model card apuntan al espacio de nombres abenzerps, no al de Cpackty1. Conviene verificar la procedencia real de los ficheros antes de usarlos en produccion.
- La model card esta truncada en la seccion de uso, justo en la instruccion de configuracion del nodo CLIPLoader, por lo que la guia de instalacion no esta completa.
- Licencia qwen-research: se trata de una licencia de investigacion, no de una licencia permisiva tipo Apache 2.0. Debe revisarse el texto completo antes de cualquier uso comercial.
- Las cuantizaciones Q4_0 y Q4_K_M introducen perdida de calidad respecto a BF16; el autor no publica evaluaciones cuantitativas de esa degradacion.
- No hay datos publicados sobre idiomas soportados, longitud de contexto del text encoder ni calidad de seguimiento de prompts en idiomas distintos del ingles.
- Riesgo de artefactos propios de los modelos de difusion: errores anatomicos, texto mal renderizado dentro de la imagen y desviaciones respecto al prompt, especialmente en las cuantizaciones mas agresivas.
- Riesgo de sesgos en el dataset de entrenamiento del modelo base; esta cuantizacion no corrige ni atenua esos sesgos, y la ausencia de filtros puede amplificar la generacion de contenido sesgado o inapropiado.
- La generacion de contenido que otros modelos rechazan puede entrar en conflicto con la legislacion local, con las condiciones de servicio de plataformas de publicacion y con las politicas de los proveedores de GPU en la nube.
- El repositorio registra 0 descargas y 0 likes y fue creado el 2026-09-27, por lo que no existe validacion de la comunidad sobre la integridad de los ficheros ni sobre su calidad.
- Requiere descargar ficheros auxiliares de gran tamano (17,53 GB para el text encoder BF16) ademas del transformer, lo que eleva el espacio en disco muy por encima del tamano de la cuantizacion elegida.
- No se documenta compatibilidad con backends distintos de ComfyUI-GGUF y MLX; no hay pruebas publicadas en vLLM, TGI u otros servidores de inferencia.
- Existe un fork antiguo de ComfyUI-GGUF (city96) que provoca el error "Unknown model architecture!" con este modelo; hay que usar el fork leejet o parchear tools/convert.py.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Cpackty1/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio oficial de Qwen-Image-2.1 en GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado por el autor): https://github.com/leejet/ComfyUI-GGUF
- Space de referencia citado en la model card: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- Mirror encontrado en la busqueda: https://huggingface.co/rayss868123/Qwen-Image-2.1-Uncensored-GGUF
- Mirror encontrado en la busqueda: https://huggingface.co/KasugaiSakura/Qwen-Image-2.1-Uncensored-GGUF
- Analisis publicado: https://stashbase.ai/blog/run-qwen-image-2-1-locally-uncensored/
- Guia de ejecucion en ComfyUI: https://hoangyell.com/qwen-image-2-1-uncensored-comfyui/

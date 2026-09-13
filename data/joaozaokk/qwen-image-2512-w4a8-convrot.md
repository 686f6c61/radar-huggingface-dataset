# JoaoZaokk/Qwen-Image-2512-W4A8-ConvRot

## Resumen

JoaoZaokk/Qwen-Image-2512-W4A8-ConvRot es una re-codificacion cuantizada a 4 bits de los pesos de Qwen-Image 2512 (familia Qwen de Alibaba), publicada como fichero unico de safetensors para ComfyUI. El modelo base es un generador de imagenes texto-a-imagen con arquitectura MMDiT; esta version no anade capacidades nuevas, sino que reduce el peso del transformador de 38,05 GiB en BF16 a 10,79 GiB en formato `asym_w4a8_int8`, es decir, 3,53 veces mas ligero, conservando segun el autor una salida indistinguible del original en una hoja de contactos.

El interes tecnico del repositorio es doble. Por un lado, ofrece un artefacto practico: el transformador cabe residente en una GPU de 24 GB como la RTX 3090, con 1,566 s/paso frente a los 5,722 s/paso del BF16 (que no cabe y va haciendo streaming de pesos). Por otro, publica una medicion comparativa entre W4A8 y W4A4 sobre el mismo checkpoint de origen, y el W4A4 se publica explicitamente como resultado negativo medido, no como fichero utilizable.

La conclusion transferible que defiende el autor es que los pesos sobreviven a 4 bits en las tres familias medidas (Qwen-Image-Edit 2511, Wan 2.2 TI2V 5B y Qwen-Image 2512), pero las activaciones no sobreviven en ninguna, y cada familia falla de forma distinta. El repositorio solo contiene el transformador: el codificador de texto (`qwen_2.5_vl_7b`) y el VAE no estan incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MMDiT (diffusion transformer multimodal) de Qwen-Image 2512, variante no-edit |
| Parametros totales | No disponible de forma explicita; el checkpoint BF16 de origen pesa 40.861.031.488 bytes, lo que equivale a unos 20.400 millones de parametros a 2 bytes por parametro (derivacion aritmetica, no dato publicado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el codificador de texto es `qwen_2.5_vl_7b`, que no forma parte de este repositorio |
| Tipos de cuantizacion | `asym_w4a8_int8` (pesos int4 asimetricos, activaciones int8), 840 tensores, `group_size` 16, `convrot_groupsize` 256. Existe un build `convrot_w4a4` del codificador de texto `qwen_2.5_vl_7b` publicado por separado en la misma cuenta |
| Idiomas soportados | en (ingles), segun la etiqueta de idioma de la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, fichero unico (`diffusion-single-file`), compatible con ComfyUI |
| Tamano del fichero | `qwen_image_2512_w4a8.safetensors`, 11.581.151.800 bytes (10,79 GiB) |
| Tamano del repositorio | 11,6 GB |
| Resolucion de referencia medida | 1024 px, 20 pasos, cfg 2,5, sampler euler/simple |
| Backend de los kernels | `comfy_kitchen.backends.cuda` en las cuatro operaciones |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MMDiT de Qwen-Image 2512, con un transformador de difusion como unico componente modificado respecto al original. El proceso aplicado aqui no es entrenamiento sino re-codificacion de pesos: se parte del safetensors BF16 de origen (sha256 que empieza por `d8c57b76f262e1ef27f5eca1`, 40.861.031.488 bytes), en concreto de la version reempaquetada por Comfy-Org, y se convierte a formato `asym_w4a8_int8` con el perfil de capas `qwen_image` derivado del build `int8_convrot` del modelo Edit, que coincide 840/840 con este modelo sin margen de holgura.

La calibracion se hizo sobre este mismo checkpoint y no reutilizando el analisis del modelo Edit. Aunque ambos modelos difieren en solo 72 bytes de tamano de fichero y comparten arquitectura MMDiT, la herramienta `quant_mixed` rechaza analisis de otro modelo por defecto, ya que pesos distintos producen errores por capa distintos y reutilizar el analisis habria seleccionado formatos a partir de mediciones de otro modelo.

No hay informacion en la model card sobre datos de entrenamiento, numero de tokens, composicion del dataset ni etapas de RLHF/DPO, porque el autor no entrena el modelo: solo lo cuantiza. La innovacion tecnica concreta es el par `convrot_groupsize` 256 junto con `group_size` 16, dentro de un unico eje de decision limpio (todo W4A4 frente a todo W4A8), sin buscar un punto intermedio mixto.

## Capacidades

- Generacion de imagenes a partir de texto en ingles, a 1024 px de resolucion en la configuracion medida (20 pasos, cfg 2,5, euler/simple).
- Modelo de la rama no-edit de la familia Qwen-Image: no edita imagenes de entrada; la edicion vive en el repositorio hermano Qwen-Image-Edit-2511-W4A8-ConvRot.
- Composicion de escenas con sujetos concretos y elementos reconocibles: en la hoja de contactos del autor se mencionan una manzana, un rostro, un cartel con la palabra OPEN y un mercado nocturno.
- Ejecucion en ComfyUI mediante fichero safetensors unico, sin necesidad de cargar el transformador en BF16.
- Capacidad de funcionar residente en GPU de 24 GB, frente al BF16 que requiere streaming de pesos por paso.
- No soporta tool calling ni function calling: no aplica a un modelo de difusion de imagen.
- No soporta agentes ni razonamiento multi-paso: no aplica.
- Soporte multilingue: la model card solo declara `en`; no hay datos sobre comportamiento con prompts en otros idiomas.
- Capacidades especiales: ninguna de tipo thinking mode, vision, audio o video. Es exclusivamente texto-a-imagen.

## Casos de uso

- Generacion de imagenes a granel en ComfyUI: gracias a sus 1,566 s/paso en RTX 3090, una imagen de 20 pasos se completa en unos 31 s (derivado de 1,566 x 20) y el transformador queda residente en VRAM, lo que permite lotes largos sin recargar pesos entre pasos.
- Despliegue en hardware de consumo: el fichero de 10,79 GiB permite ejecutar Qwen-Image 2512 en GPUs de 24 GB en lugar de depender de streaming desde RAM o disco, algo que el BF16 de 38,05 GiB no permite en esa misma tarjeta.
- Ilustracion editorial y de blog: la fidelidad medida frente al BF16 (divergencia 0,3875, rango 0,2023-0,7235, indistinguible en hoja de contactos) hace viable usar este build como sustituto del original en produccion de imagenes de acompanamiento sin cambiar el resultado percibido.
- Prototipado de pipelines de generacion: iterar prompts y samplers a 31 s por imagen en lugar de 114 s (5,722 x 20 pasos del BF16) reduce el ciclo de prueba y error en unas 3,65 veces segun la medicion del autor.
- Generacion de imagenes sinteticas para datasets de investigacion: al ser un modelo apache-2.0 y no un servicio en la nube, se puede ejecutar en local para producir lotes de imagenes con control total sobre prompts y semillas.
- Estudios de cuantizacion de modelos de difusion: el repositorio sirve como referencia reproducible para comparar W4A8 frente a W4A4 usando el mismo checkpoint de origen, el mismo encoder, el mismo VAE, los mismos prompts y las mismas semillas.
- Demo autohospedada de texto-a-imagen: con un fichero unico compatible con ComfyUI se puede montar un endpoint interno de generacion de imagenes sin exponer prompts a APIs de terceros.
- Produccion de arte conceptual con equipo reducido: el modelo no necesita una GPU de datacenter (A100/H100) para funcionar con pesos residentes, con lo que un estudio pequeno puede integrarlo en su flujo habitual.

## Benchmarks y rendimiento

Medicion publicada por el autor: 12 ejecuciones (6 prompts x 2 semillas), 1024 px, 20 pasos, cfg 2,5, euler/simple, una RTX 3090. El transformador es lo unico que cambia entre variantes; el encoder (`qwen_2.5_vl_7b`), el VAE, los prompts y las semillas son identicos.

| Variante | GiB | s/paso | Divergencia frente a BF16 | Rango min-max | Resultado visual |
|---|---|---|---|---|---|
| BF16 original | 38,05 | 5,722 | - | - | nitido |
| Este fichero, W4A8 | 10,79 | 1,566 | 0,3875 | 0,2023-0,7235 | indistinguible en hoja de contactos |
| W4A4, mismo origen | 9,60 | 1,038 | 1,3369 | 1,1018-1,5449 | enterrado en moteado de color |

El autor advierte que los 5,722 s/paso del BF16 no son una comparacion justa de kernels: 38,05 GiB no caben en una tarjeta de 24 GB, por lo que esa variante hace streaming de pesos en cada paso, mientras que las dos cuantizadas estan residentes. Lo que la columna refleja de forma honesta es el tiempo total percibido por el usuario.

Comparacion entre familias con el mismo eje de fallo (W4A4 y W4A8 comparten los mismos pesos de 4 bits; solo cambia la ruta de activaciones):

| Modelo | Resultado W4A4 |
|---|---|
| Qwen-Image-Edit 2511 | fallo estatico puro, divergencia 1,7440 |
| Wan 2.2 TI2V 5B | desenfoque, divergencia 0,3847 |
| Qwen-Image 2512 (este) | moteado coloreado, sujeto aun visible, divergencia 1,3369 |

El autor senala ademas un sesgo importante de la metrica: el desenfoque de Wan puntua 0,3847, mas bajo que el 0,3875 de este build W4A8 que es perfectamente valido. La divergencia favorece los fallos suaves, por lo que no puede usarse sola para aceptar un build; solo el render decide.

No se han publicado resultados de benchmarks de tipo MMLU, HumanEval o GSM8K en la informacion disponible, y no aplican a un modelo de difusion de imagen. No hay datos de LPIPS, FID ni estudio de usuarios: "indistinguible en hoja de contactos" es un veredicto humano.

## Requisitos de hardware

- VRAM para inferencia del transformador: 10,79 GiB en W4A8, medido residente en una RTX 3090 de 24 GB.
- VRAM adicional no incluida en este repositorio: codificador de texto `qwen_2.5_vl_7b` y VAE. El VAE no se cuantiza y ocupa 254 MiB. Para el codificador de 7B no hay cifra publicada en la model card; en BF16 serian del orden de 15-16 GB (estimacion derivada de 7.000 millones de parametros a 2 bytes), y existe un build `convrot_w4a4` del encoder publicado por separado que reduciria ese consumo.
- Caben en GPU de consumo: si, el transformador cuantizado entra en tarjetas de 24 GB (RTX 3090 acreditada en las mediciones; modelos de 24 GB equivalentes deberian comportarse de forma similar, aunque no se han medido). En BF16, 38,05 GiB no caben en 24 GB y obligan a streaming.
- GPU recomendadas: RTX 3090 para el escenario medido. No hay mediciones publicadas en A100, H100 o RTX 4090.
- Opciones de despliegue: ComfyUI es el destino declarado (libreria `diffusion-single-file`, formato y kernels de `comfy-kitchen`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion.
- Latencia medida: 1,566 s/paso en W4A8 y 1,038 s/paso en W4A4 (este ultimo descartado por calidad), frente a 5,722 s/paso del BF16 con streaming, siempre en RTX 3090 y a 1024 px.
- Tiempo por imagen derivado de la medicion: unos 31 s para 20 pasos en W4A8 y unos 114 s para el BF16 con streaming.
- Aceleracion: 3,65 veces mas rapido por paso que el BF16 en el mismo hardware, segun la tabla del autor.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano del transformador | s/paso (RTX 3090) | Divergencia W4A4 frente a BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen-Image-2512-W4A8-ConvRot (este) | texto-a-imagen, W4A8 | 10,79 GiB | 1,566 | 1,3369 (moteado coloreado) | apache-2.0 | publico en HuggingFace |
| Qwen-Image-Edit-2511-W4A8-ConvRot | edicion de imagen, W4A8 | no disponible | no disponible | 1,7440 (fallo estatico puro) | no disponible en la informacion proporcionada | publico en HuggingFace (misma cuenta) |
| Wan 2.2 TI2V 5B (build medido) | texto-a-video/imagen | no disponible | no disponible | 0,3847 (desenfoque) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Qwen/Qwen-Image (BF16) | texto-a-imagen, original | 38,05 GiB | 5,722 (con streaming) | no aplica | no disponible en la informacion proporcionada | publico en HuggingFace |

No hay datos publicados de parametros, contexto o rendimiento absoluto para las alternativas dentro de la informacion disponible; la comparacion solo puede hacerse en los ejes medidos por el banco del autor. Las tres variantes cuantizadas comparten la misma conclusion: los pesos aguantan 4 bits, las activaciones no.

## Limitaciones y advertencias

- Solo ingles: la model card declara unicamente el idioma `en`; el comportamiento con prompts en castellano no esta documentado.
- Evidencia experimental muy limitada: 12 ejecuciones, 6 prompts, 2 semillas, una sola resolucion (1024 px), un solo sampler (euler/simple), un solo cfg (2,5), un solo numero de pasos (20) y una sola tarjeta grafica (RTX 3090). Nada de esto garantiza el comportamiento en otros ajustes.
- Veredicto de calidad subjetivo: "indistinguible en hoja de contactos" es una valoracion humana. No hay LPIPS, ni FID, ni estudio de usuarios que la respalde.
- Sesgo de la metrica de divergencia: favorece los fallos suaves, como demuestra que el desenfoque de Wan puntue por debajo de este build valido. No debe usarse en solitario como criterio de aceptacion.
- Riesgo de alucinacion: no aplica en el sentido de texto factual, pero si existe el riesgo habitual de modelos de difusion de generar contenido incoherente, anatomia incorrecta o texto ilegible en la imagen, no caracterizado en este repositorio.
- Restricciones de licencia: apache-2.0 en este repositorio. El modelo base es de Qwen (Alibaba) y el autor presenta su trabajo como una re-codificacion de pesos ajenos, por lo que conviene verificar la licencia del modelo original y de la version reempaquetada por Comfy-Org antes de un uso comercial.
- Componentes ausentes: el repositorio solo contiene el transformador. El codificador de texto y el VAE deben obtenerse aparte, y una version distinta del encoder puede alterar los resultados medidos.
- Solo una configuracion de cuantizacion: `convrot_groupsize` 256 unicamente. No se probo ningun build mixto, por lo que no hay una configuracion optima buscada entre W4A4 y W4A8.
- Los pesos W4A4 no estan publicados: solo lo esta su hoja de contactos, de modo que la afirmacion es verificable visualmente pero no reproducible a nivel de pesos.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de terceros.
- Fechas del repositorio (creacion y actualizacion en septiembre de 2026) resultan anomalas respecto a la fecha de consulta; conviene tratarlas con cautela.
- Nomenclatura mixta: el repositorio se llama `Qwen-Image-2512`, mientras que la model card usa `qwen_image_2512`; el modelo hermano de edicion aparece como 2511. Conviene no confundir ambas ramas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoZaokk/Qwen-Image-2512-W4A8-ConvRot
- Modelo hermano de edicion: https://huggingface.co/JoaoZaokk/Qwen-Image-Edit-2511-W4A8-ConvRot
- Repositorio con metodo, herramientas y registro completo de mediciones: https://github.com/JoaoZaokk/comfy-quant-bench
- Pesos BF16 reempaquetados de origen (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI
- Organizacion Qwen en HuggingFace (modelo base): https://huggingface.co/Qwen
- Nota sobre la busqueda web: los resultados devueltos corresponden a paginas genericas de YouTube (https://www.youtube.com/ y variantes) y no guardan relacion con el modelo, por lo que no se incluyen como fuentes tecnicas.

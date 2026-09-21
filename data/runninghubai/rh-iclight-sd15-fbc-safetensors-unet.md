# RunningHubAI/rh-iclight-sd15-fbc.safetensors-unet

## Resumen

`RunningHubAI/rh-iclight-sd15-fbc.safetensors-unet` es un repositorio de pesos publicado por RunningHub que contiene un unico archivo UNet, `iclight_sd15_fbc.safetensors` (1640 MiB, formato safetensors). El nombre del archivo y la nomenclatura del repositorio remiten a la familia IC-Light sobre Stable Diffusion 1.5, es decir, un modelo de difusion orientado a relighting (reiluminacion) de imagenes mediante condicionamiento de primer plano y fondo. El repositorio tiene un tamano total de 1,7 GB y fue creado el 21 de septiembre de 2026.

El modelo se distribuye como componente para ComfyUI y para la plataforma en la nube RunningHub, no como un modelo autonomo: es un UNet que necesita un checkpoint base, un VAE y un text encoder compatibles con SD 1.5 para poder generar. La model card no documenta arquitectura propia, dataset, proceso de entrenamiento ni licencia concreta; se limita a indicar que los pesos se cargan en RunningHub y que los derechos pertenecen al autor original del proyecto.

La relevancia de este tipo de pesos es practica: permiten incorporar control de iluminacion en pipelines de generacion y edicion de imagen dentro de ComfyUI sin reentrenar nada. Conviene senalar una inconsistencia detectada en la propia ficha de HuggingFace: el pipeline declarado es `text-to-video` y la etiqueta incluye `text-to-video`, mientras que el nombre del archivo corresponde a un modelo de reiluminacion de imagen basado en SD 1.5. Ese dato debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion, familia Stable Diffusion 1.5; el nombre del archivo indica la variante IC-Light SD1.5 "fbc" |
| Parametros totales | no disponible (la arquitectura base UNet de SD 1.5 ronda los 860 M de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; es un modelo de difusion de imagen. El limite practico es la resolucion nativa de SD 1.5 (512x512) y los 77 tokens del text encoder CLIP de SD 1.5 |
| Tipos de cuantizacion | no disponible; el archivo distribuido es safetensors en fp16 (1640 MiB) |
| Idiomas soportados | no disponible; el condicionamiento de texto depende del text encoder de SD 1.5, entrenado principalmente en ingles |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (UNet) |

Archivos incluidos:

| Archivo | Tamano | Proposito |
|---|---:|---|
| `iclight_sd15_fbc.safetensors` | 1640 MiB | pesos del UNet |

## Arquitectura y entrenamiento

No se dispone de informacion publicada en el repositorio sobre la arquitectura interna mas alla de la clasificacion como UNet. Por el nombre del archivo, el modelo corresponde a la familia IC-Light aplicada sobre Stable Diffusion 1.5, una arquitectura de difusion latente con UNet y text encoder CLIP, en la que el control de iluminacion se impone mediante condicionamiento adicional sobre la imagen de entrada. La variante "fbc" hace referencia, segun la nomenclatura habitual del proyecto IC-Light, a un condicionamiento que combina primer plano y fondo; este extremo no esta confirmado por el autor en la model card.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de ajuste con RLHF, DPO o similares, algo por otra parte poco habitual en modelos de difusion. La model card unicamente indica que RunningHub publica los pesos en nombre del autor y que se pueden cargar en su plataforma; el archivo distribuido pesa 1640 MiB, coherente con un UNet de SD 1.5 en fp16.

## Capacidades

- Reiluminacion de imagenes: es la funcion deducible del nombre del modelo (IC-Light SD1.5), es decir, modificar la iluminacion de una imagen manteniendo el sujeto.
- Condicionamiento por texto: al depender del text encoder de SD 1.5, admite descripciones textuales de la iluminacion deseada (por ejemplo, luz de estudio, contraluz, luz calida).
- Integracion en ComfyUI: el repositorio esta etiquetado con `comfyui`, por lo que esta pensado para cargarse como nodo UNet en un grafo de ComfyUI.
- Ejecucion en la nube: la model card indica que puede cargarse directamente en RunningHub.
- Generacion de imagen: al ser un UNet de difusion se integra en el pipeline de muestreo de SD 1.5 junto a un checkpoint base y un VAE.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponibles; el texto se procesa con el encoder de SD 1.5.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Reiluminacion de producto en comercio electronico: se puede tomar una foto de catalogo con iluminacion plana y recolocarla con una direccion de luz coherente con la ficha de producto, manteniendo el objeto intacto y reduciendo la necesidad de repetir sesiones fotograficas.
- Postproduccion fotografica: en un flujo ComfyUI, el UNet se inserta entre la carga de la imagen y el muestreo para ajustar la luz de un retrato sin rehacer el rodaje; encaja bien cuando se trabaja por lotes con la misma direccion de luz.
- Estudio virtual y creacion de fondos: la variante "fbc" del nombre sugiere condicionamiento sobre fondo, lo que permite componer un sujeto recortado con un fondo nuevo y una iluminacion consistente entre ambos.
- Previsualizacion de iluminacion en arquitectura y VFX: sirve para iterar rapidamente sobre propuestas de iluminacion sobre renders o fotografias de referencia antes de pasar a produccion con herramientas de render fisico.
- Creacion de assets para videojuegos y entornos 3D: generar variantes de iluminacion (dia, noche, interior) de una misma textura o render para poblar escenas sin rehacer el material base.
- Automatizacion mediante API: la model card enlaza la API de RunningHub, de modo que el modelo se puede invocar desde un servicio para procesar imagenes en lote dentro de un pipeline de AIGC.
- Avatares y fotografia de persona: ajuste de la luz de un retrato generado o real para que combine con un fondo concreto antes de publicarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas cuantitativas (FID, LPIPS, PSNR, SSIM ni evaluaciones de fidelidad de relighting) ni comparaciones con otros modelos. Los resultados de la busqueda web realizada no contienen informacion relevante sobre el modelo: los enlaces devueltos corresponden a paginas de descarga del navegador Google Chrome y a hilos de Zhihu sin relacion con este repositorio, por lo que no aportan datos utilizables.

## Requisitos de hardware

- VRAM estimada: no confirmada por el autor. El archivo UNet ocupa 1640 MiB en fp16; un pipeline completo de SD 1.5 a 512x512 suele requerir del orden de 4 a 6 GB de VRAM, y en torno a 6-8 GB si se anaden modelos auxiliares en ComfyUI. Estas cifras son estimaciones basadas en la arquitectura base, no datos publicados para este repositorio.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para el pipeline completo (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti, RTX 4070). Para procesamiento por lotes o resoluciones superiores, GPU de clase profesional tipo A100 o H100, aunque no se justifican por el tamano del modelo.
- Cabe en GPU de consumo: si, con reservas, siempre que se disponga de VRAM suficiente para el pipeline completo de SD 1.5 y no solo para el UNet.
- Opciones de despliegue: ComfyUI (uso previsto segun las etiquetas del repositorio) y la plataforma en la nube RunningHub. El uso con otras herramientas depende de que acepten un UNet de SD 1.5 en safetensors, dato no documentado.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este repositorio ni hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-iclight-sd15-fbc (este repositorio) | no disponible (UNet SD 1.5, ~860 M en la base) | 512x512 nativo, 77 tokens de texto | no disponible | no disponible (remite al upstream) | HuggingFace y RunningHub |
| IC-Light SD1.5 original (lllyasviel/IC-Light) | no disponible en la informacion proporcionada | 512x512 nativo | no disponible | no disponible en la informacion proporcionada | repositorio publico del proyecto original |
| UNet base de Stable Diffusion 1.5 | ~860 M | 512x512 nativo, 77 tokens de texto | no disponible | licencia del modelo base | ampliamente disponible |
| Alternativas de relighting basadas en SDXL o modelos dedicados | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion se limita a la categoria funcional (relighting sobre difusion), ya que no se dispone de cifras de rendimiento ni de licencias confirmadas para este repositorio. No se han encontrado referencias comparativas en los resultados de busqueda.

## Limitaciones y advertencias

- Inconsistencia de metadatos: el pipeline declarado es `text-to-video` y la etiqueta incluye `text-to-video`, mientras que el nombre del archivo corresponde a un modelo de reiluminacion de imagen basado en SD 1.5. No debe asumirse que genera video.
- Licencia no especificada: la model card no indica una licencia concreta y delega en la del proyecto original. Antes de un uso comercial es imprescindible verificar la licencia del proyecto IC-Light y la del checkpoint base de SD 1.5 que se utilice.
- Modelo no autonomo: es un UNet suelto; requiere checkpoint base, VAE y text encoder compatibles con SD 1.5. Un emparejamiento incorrecto produce resultados degradados.
- Resolucion limitada: al derivar de SD 1.5, la resolucion nativa es 512x512 y las resoluciones superiores tienden a producir artefactos si no se aplican tecnicas adicionales.
- Idioma: el condicionamiento textual depende del text encoder de SD 1.5, con sesgo hacia el ingles; el comportamiento en castellano no esta documentado.
- Sesgos: no documentados por el autor; al heredar los datos de entrenamiento del modelo base, puede reproducir sesgos de representacion presentes en ellos.
- Alucinacion y fidelidad: en modelos de difusion, el equivalente es la introduccion de detalles inexistentes o cambios en la identidad del sujeto al modificar la iluminacion. No hay evaluaciones publicadas de fidelidad para este repositorio.
- Repositorio sin traccion: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni discusion publica que permitan validar su funcionamiento.
- Procedencia: los pesos los publica RunningHub en nombre del autor; conviene contrastar la version publicada con la del proyecto original.
- Sin datos de rendimiento: no hay benchmarks, mediciones de latencia ni comparativas oficiales, lo que dificulta estimar su calidad frente a alternativas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RunningHubAI/rh-iclight-sd15-fbc.safetensors-unet
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1922565928708444161
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1935673237986865153
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Acceso a la API de RunningHub: https://www.runninghub.ai/call-api
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model

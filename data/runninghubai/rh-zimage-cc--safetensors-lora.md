# RunningHubAI/rh-zimage-cc-.safetensors-lora

## Resumen

`rh-zimage-cc-.safetensors-lora` es una LoRA de text-to-image publicada por RunningHubAI, pensada para su uso dentro de ComfyUI y en la plataforma RunningHub. No se trata de un modelo base completo, sino de un adaptador de bajo rango que se aplica sobre el modelo Z-image-base, del cual se declara el fine-tuning. El repositorio contiene un unico fichero de pesos de aproximadamente 243 MiB, lo que confirma su naturaleza de adaptador y no de modelo fundacional.

La LoRA esta orientada a la generacion de paisajes que van de lo realista a lo virtual, con un sesgo estetico hacia personajes de estilo anime/CG. La model card recomienda pesos de entre 1.0 y 1.4 y describe un uso combinado con otros adaptadores de la familia Z-image, lo que sugiere que su valor practico aparece al mezclarse con LoRAs complementarias mas que de forma aislada.

La informacion publicada es muy escasa: no hay datos de arquitectura del modelo base, numero de parametros, contexto, idiomas ni licencia explicita. La utilidad de esta ficha es, por tanto, descriptiva y orientada a la evaluacion rapida de un adaptador concreto dentro del ecosistema de generacion de imagenes de RunningHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Z-image-base; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (el fichero de pesos ocupa 243 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors |
| Idiomas soportados | no disponible (modelo de imagen; los prompts se interpretan en el idioma del text encoder del pipeline) |
| Licencia | no disponible; la model card indica que los derechos permanecen con el autor y remite a la licencia del proyecto original |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de una LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. El modelo base declarado es Z-image-base, del que no se aportan detalles de arquitectura, tamano ni datos de entrenamiento en la informacion disponible. El fichero distribuido, `zimage_Cc清新多彩-超广角.safetensors`, pesa 243 MiB y contiene unicamente los pesos del adaptador.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas del adaptador. La model card unicamente describe el efecto estetico buscado (paisajes de realistas a virtuales, personajes con sesgo anime/CG) y recomienda un rango de pesos de 1.0 a 1.4, ademas de una receta de doble aplicacion: peso 1.3 tras ZIB para paisajes y peso 1.0 tras ZIT sin activar la LoRA para personajes.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante el pipeline del modelo base Z-image-base.
- Especializacion estetica en paisajes, con un espectro que va del fotorrealismo a la ilustracion virtual.
- Sesgo hacia personajes de estilo anime/CG, segun la descripcion del autor.
- Compatibilidad con el flujo de trabajo de ComfyUI como nodo de LoRA.
- Posibilidad de combinarse con otros adaptadores de la familia Z-image (mencionados como ZIB y ZIT en la model card).
- Ajuste de intensidad mediante el peso de la LoRA, con un rango recomendado de 1.0 a 1.4.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio, ya que es un adaptador de generacion de imagen.

## Casos de uso

- Ilustracion de paisajes para fondos de web y aplicaciones: la LoRA permite generar escenarios naturales o fantasticos con una estetica coherente aplicando el adaptador sobre Z-image-base en ComfyUI, con pesos entre 1.0 y 1.4 para controlar la intensidad del estilo.
- Creacion de arte conceptual para videojuegos: el sesgo hacia personajes anime/CG y paisajes virtuales encaja en la fase de exploracion visual de entornos y criaturas antes del modelado 3D.
- Generacion de material para narrativa visual y comic: combinada con otros adaptadores de la familia Z-image, permite mantener un estilo consistente entre escenas de paisaje y escenas con personajes mediante la receta de doble aplicacion descrita por el autor.
- Prototipado rapido de campanas creativas: al ser un adaptador ligero de 243 MiB, se puede cargar y descargar en un flujo de ComfyUI sin el coste de un modelo completo, lo que agiliza la iteracion sobre variantes esteticas.
- Fondo de escenas para produccion audiovisual independiente: la generacion de paisajes de gran angular (segun el nombre del fichero) puede servir como placa de fondo o referencia para composicion.
- Experimentacion en investigacion de adaptadores: util como caso de estudio de LoRAs de estetica muy marcada y de tecnicas de mezcla de adaptadores sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para la LoRA de forma aislada; depende enteramente del modelo base Z-image-base, cuyos requisitos no se documentan.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el modelo base; el adaptador en si ocupa 243 MiB en disco, un tamano irrelevante frente al modelo base.
- Opciones de despliegue: ComfyUI es el entorno indicado por el autor; tambien la plataforma RunningHub (version internacional y China) y su API.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano del adaptador | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-zimage-cc-.safetensors-lora | LoRA text-to-image | 243 MiB | Z-image-base | no disponible | Hugging Face, RunningHub |
| rh-zimage-cc-lora | LoRA text-to-image | no disponible | Z-image (familia) | no disponible | Hugging Face |
| rh-tf-zimage-rh4.safetensors-lora | LoRA text-to-image | no disponible | Z-image (familia) | no disponible | Hugging Face |

Los tres adaptadores pertenecen al mismo autor y a la misma familia de modelos base, por lo que la comparativa se limita a variantes estilisticas dentro del ecosistema RunningHub. No se dispone de datos de rendimiento objetivo para diferenciarlos mas alla de la descripcion estetica de cada model card.

## Limitaciones y advertencias

- La informacion publicada es minima: no hay licencia explicita, lo que impide confirmar si el uso comercial esta permitido; la model card remite a la licencia del proyecto original, que no se especifica.
- Al ser una LoRA, no funciona de forma autonoma: requiere el modelo base Z-image-base y un pipeline compatible (ComfyUI o RunningHub).
- El sesgo estetico hacia personajes anime/CG puede no ser adecuado para proyectos que exijan fotorrealismo de personas; el propio autor sugiere recetas alternativas para ello.
- Riesgo de sobreajuste al estilo si se aplican pesos por encima del rango recomendado (1.0-1.4), con posible degradacion de la coherencia de la imagen.
- No hay datos sobre sesgos demograficos, culturales o geograficos del adaptador ni del modelo base.
- No se documentan limitaciones de resolucion, relacion de aspecto ni idioma de los prompts.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que no existe validacion comunitaria publica.
- No se han publicado evaluaciones objetivas (FID, CLIP score u otras) que permitan cuantificar la calidad frente a alternativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-zimage-cc-.safetensors-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2051883947256238081
- Pagina del autor: https://www.runninghub.cn/user-center/1987470324222631938
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Adaptador relacionado rh-zimage-cc-lora: https://huggingface.co/RunningHubAI/rh-zimage-cc-lora
- Adaptador relacionado rh-tf-zimage-rh4: https://huggingface.co/RunningHubAI/rh-tf-zimage-rh4.safetensors-lora

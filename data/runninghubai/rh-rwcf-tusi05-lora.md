# RunningHubAI/rh-rwcf-tusi05-lora

## Resumen

rh-rwcf-tusi05-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI (la organizacion en Hugging Face de la plataforma RunningHub) a partir del entrenamiento realizado por el usuario @虾仁不瞎. Se distribuye como un unico fichero `.safetensors` de 584 MiB y esta etiquetado con el pipeline `image-text-to-image`, orientado a su uso en ComfyUI y en la propia plataforma RunningHub. El autor lo describe como un LoRA de personaje del juego de anime "rwcf_tusi05".

La model card indica que el adaptador se ha afinado a partir de un modelo base denominado "F1基础-Kontext", sin especificar version, rango del LoRA, modulos objetivo ni composicion del dataset. Tampoco se publican licencia, idiomas soportados, numero de parametros del adaptador ni resultados de evaluacion. En el momento de la consulta el repositorio no registra descargas ni "likes".

Su interes es acotado y practico: no es un modelo fundacional, sino una pieza de contenido especifico (un personaje concreto) para flujos de edicion de imagen sobre bases tipo Kontext, con el objetivo de reproducir ese personaje de forma consistente dentro de un pipeline de generacion y edicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un transformer de difusion; rango, alpha y modulos objetivo no disponibles |
| Parametros totales | No disponible (el autor no publica el recuento; el fichero safetensors ocupa 584 MiB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base y del nodo de condicionamiento de ComfyUI) |
| Tipos de cuantizacion | No se documentan variantes cuantizadas; solo se distribuye el fichero safetensors indicado |
| Idiomas soportados | No disponibles (la model card no los especifica; dependeran del codificador de texto del modelo base) |
| Licencia | No disponible. El autor indica que los derechos permanecen con el autor original y que debe seguirse la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors |
| Tipo de modelo | LoRA de edicion de imagen (image edit) |
| Modelo base declarado | F1基础-Kontext (version no especificada) |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de atencion de un modelo de difusion preentrenado para especializarlo en un concepto concreto. En este caso el concepto es el personaje "tusi05" del juego de anime identificado como "rwcf_tusi05". La model card solo aporta el nombre del fichero (`人物拆分0801_tusi0005.safetensors`, que en chino significa aproximadamente "desglose de personaje 0801_tusi0005") y el modelo base de partida, "F1基础-Kontext".

No se dispone de informacion sobre el numero de pasos de entrenamiento, el tamano o la composicion del dataset, el uso de tecnicas de alineacion (RLHF, DPO), el rango del LoRA ni las capas a las que se aplica. La unica referencia al proceso de entrenamiento es un enlace generico al servicio de entrenamiento de RunningHub. No se documenta ninguna innovacion tecnica asociada al adaptador.

## Capacidades

- Edicion y generacion de imagen condicionada por texto e imagen de entrada (`image-text-to-image`), aplicando el concepto del personaje entrenado.
- Reproduccion de un personaje de anime concreto ("rwcf_tusi05") dentro de un flujo de difusion.
- Integracion como LoRA apilable en ComfyUI, combinable con checkpoints base compatibles y potencialmente con otros LoRA.
- Ejecucion en la plataforma RunningHub, tanto de forma interactiva como a traves de su API.
- No se documentan capacidades de generacion de texto, razonamiento, codigo o matematicas: es exclusivamente un adaptador visual.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documentan capacidades multilingues, de audio, de video ni modos de razonamiento explicito.

## Casos de uso

- Produccion de ilustraciones de personaje consistente: el LoRA permite generar variaciones del personaje "tusi05" manteniendo rasgos reconocibles a partir de prompts de texto e imagenes de referencia, lo que resulta util para ilustracion de fans o material derivado de un juego.
- Creacion de assets para un juego de anime: generar poses, expresiones y encuadres del personaje para fichas de personaje, iconos o arte promocional sin volver a dibujar cada variante.
- Edicion de imagenes existentes: al estar en el pipeline `image-text-to-image`, puede emplearse para cambiar atributos de una ilustracion ya existente (ropa, fondo, iluminacion) conservando la identidad del personaje.
- Prototipado rapido de diseno de personaje dentro de ComfyUI: iterar sobre un grafo de nodos con el LoRA cargado y distintos prompts para explorar variantes antes de una produccion final.
- Automatizacion por API: el flujo puede invocarse desde la API de RunningHub para generar lotes de imagenes de forma programatica, por ejemplo para publicar contenido periodico en una comunidad.
- Composicion con otros adaptadores: al ser un LoRA de tamano reducido (584 MiB), es viable apilarlo junto a LoRA de estilo o de iluminacion en el mismo grafo, siempre que el modelo base coincida y la VRAM lo permita.
- Pruebas de investigacion sobre personalizacion de difusion: sirve como ejemplo de adaptador de personaje entrenado por un tercero sobre una base tipo Kontext, util para estudiar como se comporta la identidad del personaje frente a distintos prompts y fuerzas de LoRA (pesos tipicos en el rango 0,6-1,0, valor no confirmado por el autor).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de identidad, MMLU u otras) ni comparaciones cuantitativas con adaptadores similares, por lo que no es posible evaluar su rendimiento de forma numerica.

## Requisitos de hardware

- El adaptador en si ocupa 584 MiB en disco y su huella de VRAM es marginal (del orden de decimas de GB) en comparacion con el modelo base.
- La VRAM necesaria la determina integramente el modelo base. La model card no aporta cifras y solo indica "F1基础-Kontext" como base, sin confirmar version ni arquitectura.
- Como referencia general de la comunidad (no confirmada por el autor ni por la model card), un modelo de difusion del orden de 12 000 millones de parametros requiere aproximadamente 24 GB de VRAM en precision completa, del orden de 12-16 GB con cuantizacion de 8 bits y puede ajustarse por debajo de 12 GB con cuantizaciones de 4 bits. Estas cifras son estimaciones y deben verificarse contra el modelo base concreto.
- GPU recomendadas: no disponibles. Si el modelo base cae en el rango anterior, serian adecuadas GPU de 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100) o GPU de 16 GB con cuantizacion.
- Compatibilidad con GPU de consumo: no disponible. Depende por completo del modelo base y de la cuantizacion elegida.
- Opciones de despliegue documentadas: ComfyUI y la plataforma RunningHub (interfaz web y API). No se menciona soporte para vLLM, TGI, Ollama o llama.cpp, que ademas no son herramientas habituales para adaptadores de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Caracteristica | rh-rwcf-tusi05-lora | Otros LoRA de personaje sobre bases Kontext | LoRA de edicion sobre Qwen-Image-Edit u otras bases |
|---|---|---|---|
| Tipo de artefacto | LoRA de edicion de imagen | LoRA de edicion de imagen | LoRA de edicion de imagen |
| Modelo base | F1基础-Kontext (version no especificada) | Bases Kontext de distintas versiones | Bases multimodales de edicion |
| Parametros | No disponible (584 MiB en disco) | No disponible | No disponible |
| Longitud de contexto | No disponible | No disponible | No disponible |
| Formato de pesos | safetensors | safetensors (habitual) | safetensors (habitual) |
| Licencia | No disponible | Variable segun autor | Variable segun autor |
| Rendimiento medida | No disponible | No disponible | No disponible |
| Compatibilidad directa | Solo con el modelo base declarado | No aplica | No aplica |

No se dispone de datos verificados de modelos alternativos concretos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa. La comparacion anterior es estructural, no de rendimiento.

## Limitaciones y advertencias

- Licencia no especificada: la model card solo indica que hay que seguir la licencia del proyecto original o del upstream. Esto supone un riesgo juridico relevante para uso comercial, ya que no queda claro que derechos otorga el autor ni si el uso comercial esta permitido.
- El personaje representado ("rwcf_tusi05") parece derivar de una obra de anime o videojuego de terceros; la publicacion de imagenes generadas puede infringir derechos de propiedad intelectual del titular original.
- Riesgo de salida defectuosa: como todo modelo generativo de imagen, puede producir artefactos anatomicos, manos deformes, incoherencias de vestuario o fondos inconsistentes, especialmente con prompts alejados del dominio de entrenamiento.
- Sesgo de dominio: al ser un LoRA de un unico personaje, su uso fuera de ese concepto degrada el resultado y puede contaminar otras generaciones si se combina con pesos altos.
- Sesgos de representacion: no se documenta la composicion del dataset de entrenamiento, por lo que no se puede evaluar si el adaptador reproduce sesgos de genero, etnia, complexion corporal o estilo propios de las imagenes de origen.
- Idioma de los prompts: la model card no especifica idiomas soportados; el comportamiento con prompts en castellano dependera del codificador de texto de la base y no esta verificado.
- Ausencia de validacion comunitaria: el repositorio registra 0 descargas y 0 "likes", sin issues ni discusion publica que permitan contrastar calidad o problemas conocidos.
- Reproducibilidad limitada: sin datos de dataset, hiperparametros ni version exacta del modelo base, no es posible reproducir el entrenamiento ni garantizar que la combinacion LoRA + base se comporte igual en el futuro.
- Los resultados de la busqueda web asociados a esta ficha no guardan ninguna relacion con el modelo (son resultados de sitios para adultos en torno al termino "Somerset") y no deben usarse como referencia tecnica.
- Fecha de creacion registrada en Hugging Face: 2026-10-02. Conviene verificar si se trata de una fecha real o de un artefacto de los metadatos antes de citarla.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-rwcf-tusi05-lora
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/1951152176154484738
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1895005037720719361
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Servicio de entrenamiento de RunningHub: https://www.runninghub.ai/page-model
- No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos adicionales relevantes en la busqueda web realizada.

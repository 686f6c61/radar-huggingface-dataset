# sibwvj/pixai-tagger-v1.0

## Resumen

PixAI Tagger v1.0 es un modelo de clasificacion de imagenes multi-etiqueta especializado en ilustracion de estilo anime. Lo publica el autor sibwvj en HuggingFace bajo el identificador `sibwvj/pixai-tagger-v1.0`, aunque la model card hace referencia al espacio `pixai-labs/pixai-tagger-v1.0`, lo que sugiere que se trata de una publicacion vinculada al proyecto PixAI. El modelo resuelve un problema muy concreto: asignar automaticamente etiquetas descriptivas (personajes, ropa, objetos, estilos, franquicias, metadatos y clasificacion por edades) a una imagen, con un vocabulario de 30.877 etiquetas repartidas en seis categorias.

Tecnicamente es un clasificador multi-etiqueta construido sobre un backbone SAM3 reajustado, con 486.346.909 parametros (unos 486,3 millones) y una entrada de 1008 x 1008 pixeles que preserva la relacion de aspecto mediante redimensionado y relleno. Frente a su version anterior, PixAI Tagger v0.9, multiplica el vocabulario por mas de dos (de 13.461 a 30.877 etiquetas) y cuadruplica la resolucion de entrada (de 448 x 448 a 1008 x 1008), con una mejora declarada de 6,80 puntos porcentuales en micro F1 de etiquetas generales y 10,44 puntos en micro F1 de personajes.

Es relevante ahora porque el etiquetado automatico de imagenes anime es una pieza habitual en la preparacion de datasets para entrenamiento de modelos generativos y en la organizacion de bibliotecas de arte. La licencia Apache 2.0 y el formato safetensors lo hacen atractivo para uso comercial, aunque requiere `trust_remote_code=True` por incluir codigo propio en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone SAM3 reajustado (finetuned SAM3 backbone); clasificador multi-etiqueta con codigo propio (`cls_vitdet`) |
| Parametros totales | 486.346.909 (aprox. 486,3 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; la model card no define contexto de texto) |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no se declara idioma; las etiquetas de salida son terminos en ingles del estilo `1girl`, `solo`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | image-classification (multi-label) |
| Resolucion de entrada | 1008 x 1008, con preservacion de relacion de aspecto (resize + padding, sin deformado) |
| Vocabulario | 30.877 etiquetas en seis categorias |
| Fecha de corte | mayo de 2026 |
| Tamano del repositorio | 1,9 GB |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo utiliza como extractor de caracteristicas un backbone SAM3 reajustado, es decir, adaptado mediante ajuste fino desde el modelo de segmentacion SAM3 hacia una tarea de clasificacion multi-etiqueta. La entrada se procesa a 1008 x 1008 pixeles manteniendo la relacion de aspecto con redimensionado y relleno, lo que evita el estiramiento de la imagen y permite capturar detalles finos de personajes y composicion. El repositorio incluye codigo propio (etiqueta `custom_code` y `cls_vitdet`), por lo que la carga requiere `trust_remote_code=True`.

La salida no es una clase unica sino un conjunto de puntuaciones de confianza por etiqueta, agrupadas en seis categorias: `general` (15.043 etiquetas de contenido visible: ropa, poses, objetos y composicion), `character` (8.308 personajes con nombre), `style` (4.917 etiquetas de estilo), `copyright` (2.460 obras y franquicias de origen, mas la etiqueta `original`), `meta` (145 etiquetas de medio, procedencia, resolucion y estado) y `rating` (4 etiquetas: `rating:g`, `rating:s`, `rating:q` y `rating:e`).

La model card describe umbrales recomendados por categoria, obtenidos como ajustes de macro-F1 sobre el conjunto de evaluacion de vocabulario completo: general 0,17; character 0,27; style 0,15; copyright 0,24; meta 0,17; y rating 0,41. El informe menciona ademas un umbral global de 0,20 como resultado separado con un unico umbral. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO, dado que es un modelo discriminativo de vision y no un modelo generativo de lenguaje.

## Capacidades

- Clasificacion multi-etiqueta de imagenes anime: asigna simultaneamente varias etiquetas a una misma imagen, con puntuacion de confianza por etiqueta.
- Reconocimiento de personajes con nombre: 8.308 etiquetas de personaje en el vocabulario.
- Reconocimiento de contenido visible: ropa, poses, objetos y composicion, con 15.043 etiquetas generales.
- Clasificacion de estilo artistico: 4.917 etiquetas de estilo.
- Identificacion de obras y franquicias de origen: 2.460 etiquetas de copyright mas la etiqueta `original`.
- Etiquetado de metadatos: 145 etiquetas de medio, procedencia, resolucion y estado.
- Clasificacion por edades en cuatro niveles (`rating:g`, `rating:s`, `rating:q`, `rating:e`), util para filtrado de contenido.
- Extraccion de caracteristicas: la etiqueta `feature-extraction` aparece asociada al modelo.
- Ajuste de umbrales por categoria de forma individual o global, para priorizar precision o cobertura segun el caso de uso.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de texto, audio o video: es un modelo exclusivamente de vision.

## Casos de uso

- Etiquetado masivo de bibliotecas de arte: procesar una coleccion de imagenes anime y generar etiquetas normalizadas que permitan busqueda por personaje, estilo o franquicia. La ventana de vocabulario de 30.877 etiquetas cubre tanto contenido generico como personajes concretos.
- Preparacion de datasets para entrenamiento de modelos generativos: generar captions y etiquetas estructuradas a partir de imagenes sin anotar, reduciendo el trabajo manual de anotacion antes de entrenar un modelo de difusion o un adaptador LoRA.
- Moderacion y filtrado por clasificacion de edad: usar la categoria `rating` con su umbral recomendado de 0,41 para separar contenido `rating:g` y `rating:s` de `rating:q` y `rating:e` en plataformas de publicacion.
- Sistemas de recomendacion de ilustracion: indexar el catalogo por etiquetas de personaje, copyright y estilo para construir similitud entre imagenes y sugerencias personalizadas.
- Organizacion automatica de archivos locales: clasificar una carpeta de imagenes en subcarpetas por personaje o franquicia usando las categorias `character` y `copyright`.
- Analitica de tendencias artisticas: agregar las etiquetas de estilo y contenido de un corpus para medir la frecuencia de determinadas combinaciones (por ejemplo, estilos de pintura o vestimenta) a lo largo del tiempo.
- Asistencia en la redaccion de prompts: traducir una imagen de referencia a un conjunto de etiquetas que sirvan como base para redactar un prompt de generacion de imagen.
- Verificacion de pipelines de datos en produccion: integrar el tagger como paso de control de calidad que compruebe que las imagenes de un dataset cumplen los criterios de contenido esperados.

## Benchmarks y rendimiento

La model card publica un benchmark de etiquetas comunes: se evaluaron ocho taggers de anime sobre las mismas imagenes, puntuando unicamente las etiquetas compartidas entre modelos para no favorecer a los vocabularios mas largos. Para la categoria general se usaron 8.407 etiquetas compartidas sobre 50.416 imagenes.

| Modelo | Micro F1 (general) | Macro F1 (general) | mAP (general) |
|---|---|---|---|
| PixAI Tagger v1.0 | 0,6660 | 0,3885 | 0,3807 |
| AnimeTIMM CAFormer B36 | 0,6435 | 0,3539 | 0,3324 |
| AnimeTIMM ConvNeXtV2 Huge | 0,6421 | 0,3752 | 0,3333 |
| AnimeTIMM EVA Giant | 0,6410 | 0,3796 | 0,3391 |
| AnimeTIMM EVA02 Large | 0,6401 | 0,3742 | 0,3423 |
| AnimeTIMM SigLIP Giant | 0,6362 | 0,3722 | 0,3267 |
| PixAI Tagger v0.9 | 0,5980 | 0,3286 | 0,3251 |
| Camie v2 | 0,5775 | 0,2109 | 0,2245 |

Comparativa entre versiones sobre las mismas imagenes de test y etiquetas compartidas:

| Version | Vocabulario | Resolucion de entrada | Micro F1 general | Micro F1 personaje |
|---|---|---|---|---|
| PixAI Tagger v0.9 | 13.461 | 448 x 448 | 0,5980 | 0,8198 |
| PixAI Tagger v1.0 | 30.877 | 1008 x 1008 | 0,6660 | 0,9242 |

La model card indica que cada umbral se selecciono unicamente sobre imagenes de calibracion y que las puntuaciones son estimaciones puntuales, sin intervalos de confianza, y que los ejes de las graficas originales usan rangos distintos. Los resultados describen los modelos y el dataset evaluados, no necesariamente todos los taggers disponibles. El resto de secciones de rendimiento (evaluacion de vocabulario completo y rendimiento de inferencia) aparecen referenciadas en la model card pero su contenido no esta incluido en la informacion proporcionada.

## Requisitos de hardware

- Peso de los pesos: 486,3 millones de parametros equivalen a aproximadamente 1,95 GB en fp32 (coherente con el tamano de repositorio de 1,9 GB) y a unos 0,97 GB en fp16.
- VRAM estimada en inferencia: como minimo, el espacio de los pesos mas el coste de activaciones a 1008 x 1008, que es el factor dominante. No se han publicado cifras oficiales de VRAM en la informacion disponible; se recomienda validar el consumo real en el hardware objetivo.
- GPU recomendadas: no se especifican en la model card. Por tamano de modelo, una GPU de consumo con 8 GB o mas deberia ser suficiente para inferencia en fp16, mientras que una A100, H100 o L40S aportaria margen para procesamiento por lotes.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de parametros; no se confirma en la documentacion. La resolucion de entrada de 1008 x 1008 es el principal limitador de memoria y de velocidad.
- Opciones de despliegue: la via documentada es la libreria `transformers` con `pipeline(...)` y `trust_remote_code=True`, que carga el codigo propio incluido en el repositorio. No se confirma compatibilidad con vLLM, TGI, llama.cpp u Ollama; al tratarse de un modelo de vision multi-etiqueta con `custom_code`, estas integraciones no estan garantizadas.
- Latencia y throughput: la model card incluye una seccion titulada "Inference performance", pero su contenido no aparece en la informacion disponible. No se pueden aportar cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion de entrada | Micro F1 general | Macro F1 general | mAP general | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| PixAI Tagger v1.0 | 486,3 M | 1008 x 1008 | 0,6660 | 0,3885 | 0,3807 | Apache 2.0 | HuggingFace (repo consultado con 0 descargas) |
| PixAI Tagger v0.9 | no disponible | 448 x 448 | 0,5980 | 0,3286 | 0,3251 | no disponible | HuggingFace (`pixai-labs/pixai-tagger-v0.9`) |
| AnimeTIMM CAFormer B36 | no disponible | no disponible | 0,6435 | 0,3539 | 0,3324 | no disponible | no disponible |
| AnimeTIMM EVA Giant | no disponible | no disponible | 0,6410 | 0,3796 | 0,3391 | no disponible | no disponible |
| AnimeTIMM EVA02 Large | no disponible | no disponible | 0,6401 | 0,3742 | 0,3423 | no disponible | no disponible |
| AnimeTIMM SigLIP Giant | no disponible | no disponible | 0,6362 | 0,3722 | 0,3267 | no disponible | no disponible |
| Camie v2 | no disponible | no disponible | 0,5775 | 0,2109 | 0,2245 | no disponible | no disponible |

La model card situa a PixAI Tagger v1.0 como el mejor de los ocho modelos evaluados en micro F1, macro F1 y mAP para la categoria general, con una ventaja de 2,25 puntos porcentuales en micro F1 sobre el siguiente modelo (CAFormer B36). Los datos de parametros, contexto, licencia y disponibilidad de los modelos comparados no estan incluidos en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio restringido: el modelo esta entrenado especificamente para ilustracion de estilo anime. Su comportamiento fuera de ese dominio no esta documentado y previsiblemente sera peor.
- Vocabulario cerrado con fecha de corte en mayo de 2026: personajes, obras o estilos posteriores a esa fecha no estaran representados en las 30.877 etiquetas, y el modelo no puede generar etiquetas nuevas.
- Dependencia de umbrales: los umbrales recomendados por categoria se seleccionaron sobre un conjunto de calibracion concreto. La propia model card advierte de que deben tomarse como punto de partida y ajustarse para imagenes propias.
- Riesgo de falsos positivos y falsos negativos: las puntuaciones son confianzas por etiqueta, no decisiones verificadas. En categorias con macro F1 bajo (0,3885 en general) la precision por etiqueta individual puede ser considerablemente menor que la media de las etiquetas frecuentes.
- Sesgos del dataset de entrenamiento: no se documenta la composicion del corpus de entrenamiento ni la distribucion de las etiquetas, por lo que no se pueden evaluar sesgos de representacion por estilo, origen o tipo de personaje.
- Clasificacion por edades sensible: la categoria `rating` incluye contenido explicito. Un umbral mal ajustado puede dejar pasar contenido no deseado; conviene validarla contra un conjunto etiquetado propio antes de usarla para moderacion.
- Requiere ejecucion de codigo remoto: `trust_remote_code=True` implica cargar codigo del repositorio, lo que anade superficie de riesgo en entornos de produccion. Conviene auditar el codigo antes de desplegarlo.
- Licencia: Apache 2.0 permite uso comercial, pero no se documentan en la informacion disponible los terminos de los datos de entrenamiento ni posibles restricciones derivadas del backbone SAM3 reajustado.
- Ambiguedad de identificador: la model card usa `pixai-labs/pixai-tagger-v1.0` mientras que el repositorio consultado es `sibwvj/pixai-tagger-v1.0`. Conviene verificar cual es el repositorio canonico antes de fijar una dependencia.
- Estado de adopcion: el repositorio consultado registra 0 descargas y 0 likes en la fecha indicada, por lo que existe poca validacion externa independiente de los resultados publicados por el autor.
- Rendimiento de inferencia no documentado en la informacion disponible: no hay cifras de latencia ni throughput, lo que dificulta dimensionar un despliegue en produccion.

## Enlaces

- Repositorio en HuggingFace consultado: https://huggingface.co/sibwvj/pixai-tagger-v1.0
- Repositorio referenciado en la model card: https://huggingface.co/pixai-labs/pixai-tagger-v1.0
- Version anterior referenciada: https://huggingface.co/pixai-labs/pixai-tagger-v0.9
- Paper, blog o repositorio adicional: no disponible
- Resultados de busqueda web: las busquedas realizadas no devolvieron ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian al videojuego Warframe y no guardan relacion con PixAI Tagger v1.0.

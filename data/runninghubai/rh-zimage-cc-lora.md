# RunningHubAI/rh-zimage-cc-lora

## Resumen

rh-zimage-cc-lora es un adaptador LoRA de bajo rango para generacion de imagenes a partir de texto, publicado por RunningHubAI en nombre del autor (identificado en la model card como «@你的好友Cc» dentro de la plataforma RunningHub). No es un modelo base: se trata de un ajuste fino (fine-tuning) derivado de Z-image-base, por lo que su funcion es modificar el estilo y las texturas del modelo subyacente sin necesidad de reentrenarlo por completo.

El adaptador esta orientado a estilos anime, CG y «real 2.8D», con enfasis declarado en acabados de acuarela y pintura densa (厚涂, tecnica de pincelada gruesa tipo impasto). El nombre del archivo de pesos (`zimage_Cc肤若凝脂-人像.safetensors`) apunta a un uso centrado en retrato y en el tratamiento de la piel, aunque la model card no detalla la composicion del dataset de entrenamiento.

El repositorio ocupa 0,3 GB y contiene un unico archivo safetensors de 243 MiB. Esta publicado con el pipeline `text-to-image`, etiquetado para `comfyui` y `lora`, y no registra descargas ni likes en el momento de la consulta. La informacion tecnica disponible es muy limitada: no se especifican parametros, contexto, idiomas, licencia explicita ni resultados de benchmarks, y la busqueda web realizada no ha devuelto ninguna fuente relacionada con el modelo (los resultados obtenidos tratan sobre nomenclatura sanitaria francesa y son irrelevantes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion text-to-image; modelo base: Z-image-base |
| Parametros totales | no disponible (tamano del archivo de pesos: 243 MiB) |
| Longitud de contexto | no disponible (no aplica al pipeline de difusion; no se especifica limite de tokens de prompt) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o del modelo upstream, sin concretarla) |
| Formato de pesos | safetensors (un unico archivo: `zimage_Cc肤若凝脂-人像.safetensors`) |
| Tipo de modelo | LoRA de text-to-image |
| Modelo base | Z-image-base |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-04 |
| Ultima actualizacion | 2026-10-04 |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del adaptador mas alla de su naturaleza LoRA (Low-Rank Adaptation), es decir, un par de matrices de bajo rango que se inyectan en las capas del modelo base para desplazar su distribucion de salida hacia el estilo objetivo. El modelo subyacente es Z-image-base, del que no se detallan en la model card ni el numero de parametros, ni la variante de difusion (por ejemplo, si emplea un transformer de difusion o un U-Net), ni la longitud de contexto del codificador de texto.

Tampoco se especifican los datos de entrenamiento: no hay informacion sobre el numero de imagenes utilizadas, la composicion del dataset, la resolucion de entrenamiento, el numero de pasos ni si se aplicaron tecnicas de alineacion como RLHF o DPO (habitualmente no aplicables a este tipo de adaptadores). La unica indicacion operativa que aporta el autor es el rango de pesos recomendado en inferencia: entre 0,4 y 0,9 cuando se emplea un unico sampler, y entre 0,6 y 1,0 cuando se emplean dos (esquema habitual de muestreo en dos fases con reparto de ruido). Cualquier otro detalle de arquitectura o entrenamiento debe considerarse no disponible.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante el modelo base Z-image-base, con el estilo y las texturas que aporta el adaptador.
- Estilizacion orientada a anime, CG y «real 2.8D», segun la descripcion del propio autor.
- Reproduccion de acabados de acuarela y de pintura densa o empastada (厚涂), que la model card destaca como punto fuerte.
- Enfoque particular en retrato y representacion de piel, deducible del nombre del archivo de pesos, aunque no se documenta formalmente.
- Control de intensidad del estilo mediante el peso del LoRA, con rangos recomendados distintos segun se use uno o dos samplers.
- Integracion en flujos de trabajo de ComfyUI como nodo de carga de LoRA y en la plataforma RunningHub, tanto en modo alojado como mediante API.
- Tool calling, function calling, razonamiento multi-paso, agentes, vision, audio y capacidades multilingues: no aplica, se trata de un adaptador de generacion de imagen y no de un modelo de lenguaje.
- Capacidad de «thinking mode»: no disponible / no aplica.

## Casos de uso

- Ilustracion de retrato estilizado: el adaptador esta pensado para producir retratos con un tratamiento concreto de la piel y un acabado pictorico, de modo que se puede usar para generar avatares o retratos de personaje partiendo de un prompt descriptivo y ajustando el peso del LoRA en el rango 0,4-0,9.
- Concept art de personajes para videojuegos o animacion: el estilo «real 2.8D» y el acabado de pintura densa encajan en la fase de exploracion visual, donde se necesitan muchas variaciones rapidas de un mismo personaje antes de pasar a produccion.
- Ilustracion editorial con acabado de acuarela: para portadas, articulos o material divulgativo donde se busca una textura de acuarela consistente entre distintas piezas, aplicando el mismo peso de LoRA a toda la serie para mantener coherencia estilistica.
- Prototipado visual en pipelines de ComfyUI: al ser un nodo LoRA estandar, se puede encadenar con ControlNet, upscalers y otros adaptadores dentro de un grafo de ComfyUI, lo que permite incorporarlo a flujos repetibles y automatizados de generacion por lotes.
- Generacion automatizada via API: la model card enlaza la API de RunningHub, de modo que el adaptador puede invocarse de forma programatica para producir imagenes bajo demanda desde una aplicacion o un servicio interno, sin necesidad de desplegar GPU propia.
- Pruebas comparativas de estilo (A/B testing): dado que el efecto depende fuertemente del peso aplicado y del esquema de muestreo (uno o dos samplers), resulta util para experimentar con distintos valores y medir cual produce mejores resultados antes de fijar una configuracion en produccion.
- Material de marketing y redes sociales con estetica anime/CG: para banners, ilustraciones promocionales o contenido de comunidad donde se requiera un look consistente y reconocible.
- Fase de previsualizacion en estudios de ilustracion: generar bocetos de alta calidad antes de que un ilustrador humano realice la version final, reduciendo el tiempo de iteracion con el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, comparativas humanas ni evaluaciones de adherencia al prompt), y la busqueda web realizada no ha devuelto ninguna fuente relacionada con el modelo ni con Z-image-base. No se dispone, por tanto, de datos numericos que permitan valorar su rendimiento frente a otros adaptadores de estilo.

## Requisitos de hardware

- El archivo LoRA ocupa 243 MiB en disco (0,3 GB de repositorio), una carga minima para cualquier equipo.
- La VRAM necesaria para la inferencia viene determinada por el modelo base Z-image-base, cuyas especificaciones no se detallan en la informacion proporcionada. No es posible ofrecer una estimacion fiable de VRAM sin ese dato.
- GPU recomendadas: no disponible por la misma razon; la eleccion dependera enteramente de los requisitos de Z-image-base y de la resolucion de generacion deseada.
- Compatibilidad con GPU de consumo: no disponible. El adaptador en si no impone una barrera de memoria, pero el modelo base y la resolucion de salida condicionan si cabe o no en una GPU de gama de consumo.
- Opciones de despliegue: ComfyUI (plataforma indicada explicitamente por el autor), plataforma alojada de RunningHub y su API (tambien indicada en la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. No se han publicado mediciones de tiempo por imagen ni de imagenes por segundo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables identificados por el autor ni datos objetivos de rendimiento que permitan establecer una comparacion. Tampoco se han localizado mediante busqueda web fuentes que relacionen este adaptador con alternativas de la misma categoria (otros LoRA de estilo para Z-image-base o para modelos de difusion equivalentes). Cualquier comparativa requeriria datos de parametros, contexto, rendimiento y licencia que no constan.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. La model card no describe la composicion del dataset ni sesgos de representacion, un aspecto especialmente relevante en un adaptador orientado a retrato y representacion de piel, donde los sesgos de belleza y etnia suelen ser frecuentes.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si en el sentido de que el modelo puede producir anatomia incorrecta, manos deformes o detalles incoherentes, algo comun en los modelos de difusion y no cuantificado en esta ficha.
- Limitaciones de contexto e idioma: se desconoce el idioma o idiomas con los que se ha entrenado el modelo base y como responde a prompts en castellano. El autor publica la model card principalmente en chino e ingles, lo que sugiere un sesgo hacia esos idiomas en el desarrollo.
- Restricciones de licencia: la licencia no esta especificada. La model card indica unicamente que los derechos de autor permanecen en el autor original y que debe seguirse la licencia del proyecto original o upstream. Esto implica que el uso comercial no esta garantizado y que es imprescindible verificar la licencia de Z-image-base antes de cualquier despliegue en produccion.
- Procedencia y soporte: el modelo se publica a traves de una plataforma comercial (RunningHub) en nombre de un autor de la propia comunidad, sin repositorio de codigo, paper ni documentacion tecnica asociada. No hay garantia de mantenimiento, actualizaciones ni soporte.
- Ausencia de validacion externa: cero descargas y cero likes en el momento de la consulta, sin evaluaciones independientes ni resultados reproducibles publicados.
- Dependencia del modelo base: el adaptador carece de utilidad por si solo; su comportamiento depende por completo de Z-image-base y de la version concreta de ese modelo que se utilice.
- Sensibilidad a hiperparametros: el propio autor acota el peso del LoRA a 0,4-0,9 (un sampler) y 0,6-1,0 (dos samplers), lo que indica que fuera de esos rangos el resultado puede degradarse o sobreestilizar la imagen.
- Trazabilidad de los enlaces de busqueda: la busqueda web realizada no ha devuelto informacion relacionada con el modelo; los resultados obtenidos corresponden a nomenclatura sanitaria francesa y no guardan ninguna relacion con esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-zimage-cc-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2054925919126605825
- Pagina del autor: https://www.runninghub.cn/user-center/1987470324222631938
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Paper o informe tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo interactiva: no disponible (la model card ofrece la plataforma RunningHub como via de prueba online)

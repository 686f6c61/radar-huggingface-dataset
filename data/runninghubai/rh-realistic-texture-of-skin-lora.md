# RunningHubAI/rh-realistic-texture-of-skin-lora

## Resumen

rh-realistic-texture-of-skin-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI con el objetivo declarado de mejorar la textura realista de la piel en imágenes generadas o editadas. No es un modelo de lenguaje ni un modelo fundacional: se trata de un peso adicional de 147 MiB en formato safetensors que se carga sobre un modelo base de generación de imágenes para modificar un aspecto concreto del resultado final, en este caso el grano, el poro y la microtextura cutánea. El pipeline declarado en Hugging Face es image-text-to-image y su ecosistema de uso es ComfyUI, la plataforma RunningHub y el propio Hub.

El modelo deriva de un base identificado en la model card como "F1基础-Krea", sin más detalle técnico sobre su arquitectura, número de parámetros ni resolución nativa. El autor del LoRA se identifica como RunningHub-@Destiny y la publicación se realiza a través de la cuenta RunningHubAI en nombre del autor, con la indicación de que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o del upstream, sin que se especifique cuál es. La palabra de activación necesaria para invocar el efecto es "destiny".

Su relevancia es acotada y especializada: en flujos de retoque digital, previsualización de personajes y generación de imágenes publicitarias, la textura de piel es uno de los puntos donde los modelos generativos delatan su naturaleza sintética. Un LoRA específico permite corregir ese defecto sin reentrenar el modelo base ni cambiar el resto de la estética del pipeline. No hay datos de descargas, likes ni evidencias publicadas de evaluación que permitan valorar su calidad de forma objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA; la model card no detalla la arquitectura del modelo base ni del adaptador) |
| Parametros totales | no disponible (el archivo de pesos ocupa 147 MiB, dato que no equivale al numero de parametros) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que se siga la licencia del proyecto original o del upstream, sin nombrarla) |
| Formato de pesos | safetensors (archivo `真实质感皮肤.safetensors`, 147 MiB) |
| Tipo de modelo | LoRA de edicion de imagen |
| Modelo base declarado | F1基础-Krea (denominacion literal de la model card, sin mas detalle) |
| Pipeline declarado | image-text-to-image |
| Palabra de activacion | destiny |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0.2 GB |
| Fecha de alta en el Hub | 2026-09-24 |
| Ultima actualizacion | 2026-09-24 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura. La model card describe el artefacto como un "LoRA (image edit)" y no aporta datos sobre el rango de la descomposicion de bajo rango, las capas objetivo, la dimension de rango, el optimizador ni la estrategia de entrenamiento. Tampoco se especifica la arquitectura del modelo base, identificado unicamente con la cadena "F1基础-Krea", ni su resolucion nativa, su tokenizador de texto o su VAE. El unico dato cuantitativo disponible sobre los pesos es el tamano del archivo safetensors: 147 MiB.

En cuanto a los datos de entrenamiento, la model card no indica numero de imagenes, composicion del dataset, resolucion de entrenamiento, numero de pasos, uso de regularizacion, ni si hubo etapas de ajuste por preferencias humanas. No se documenta ninguna innovacion tecnica asociada, como decodificacion especulativa, atencion lineal o tecnicas de destilacion. Toda afirmacion sobre el proceso de entrenamiento mas alla de lo citado seria especulativa y, por tanto, se marca como no disponible.

## Capacidades

- Aplicacion de textura de piel realista sobre imagenes, enmarcada en el pipeline image-text-to-image declarado por el autor.
- Edicion de imagen condicionada por texto y por imagen de entrada, segun el pipeline declarado.
- Integracion como nodo de LoRA en flujos de ComfyUI, segun las etiquetas del repositorio.
- Invocacion mediante la palabra de activacion "destiny", documentada por el autor.
- Ejecucion en la plataforma RunningHub y carga directa desde Hugging Face, segun la model card.
- Generacion de texto, razonamiento, codigo y matematicas: no aplica, no es un modelo de lenguaje.
- Tool calling y function calling: no disponible, sin soporte documentado.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible; la model card no especifica el idioma de los prompts ni la cobertura linguistica.
- Vision, audio u otras modalidades adicionales: no disponible.
- Modo de pensamiento (thinking mode): no aplica.

## Casos de uso

- Retoque de retratos para publicidad y editorial: en un flujo de ComfyUI se carga el LoRA sobre el modelo base y se aplica con la palabra "destiny" para recuperar poro, grano y microtextura en primeros planos donde el resultado generativo suele verse excesivamente liso.
- Previsualizacion de personajes en produccion audiovisual y videojuegos: se parte de un render o de una imagen generada y se aplica el adaptador para evaluar como se comportara el personaje en plano cerrado antes de invertir en render final o en VFX.
- Catalogos de dermocosmetica y cuidado de la piel: los anuncios de cremas y tratamientos requieren primeros planos de piel creibles; el LoRA permite generar variaciones de esos planos sin sesion fotografica adicional, manteniendo el control compositivo mediante la imagen de entrada.
- Aumento de datasets para vision por computador: generar variantes sinteticas de rostros con textura cutanea realista para complementar conjuntos de datos de deteccion o segmentacion, siempre que la licencia final lo permita y el sesgo del dataset se audite.
- Restauracion o mejora de textura en fotografias con piel suavizada: fotografias antiguas, con reduccion de ruido agresiva o con retoque excesivo pueden reprocesarse con el adaptador para devolver detalle superficial.
- Automatizacion por lotes mediante API: la model card enlaza la API de RunningHub, de modo que un estudio puede encadenar el LoRA en un servicio que procese cientos de retratos sin intervencion manual.
- Pruebas de estilo y busqueda de parametros (prompt y peso del LoRA): al ser un adaptador pequeno de 147 MiB, permite iterar rapidamente sobre una misma composicion comparando distintos valores de fuerza del LoRA en la interfaz de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, comparativas humanas ni evaluaciones de textura), ni tampoco cifras de latencia o throughput. No se dispone de datos de rendimiento frente a otros LoRA de textura de piel.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la informacion proporcionada. Como referencia de ingenieria, el adaptador anade unos 147 MiB de pesos a la memoria ocupada por el modelo base, por lo que el requisito dominante es el del modelo base y no el del LoRA en si.
- GPU recomendadas: no disponible. La idoneidad depende enteramente del modelo base "F1基础-Krea", cuyas caracteristicas no se detallan.
- Compatibilidad con GPU de consumo: no disponible como dato verificado. El unico dato objetivo es el tamano del adaptador (147 MiB), que no es el factor limitante.
- Opciones de despliegue: ComfyUI (flujo nativo declarado), plataforma RunningHub (entrenamiento e inferencia) y carga directa desde Hugging Face. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos sobre otros LoRA de textura de piel ni sobre el modelo base, por lo que no es posible establecer una comparacion con parametros, contexto, rendimiento y licencia verificables.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-realistic-texture-of-skin-lora | LoRA de edicion de imagen | no disponible | no aplica | no disponible | Hugging Face, ComfyUI, RunningHub |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia sin concretar: la model card remite a la licencia del proyecto original o upstream sin identificarla, lo que impide determinar con certeza si el uso comercial esta permitido. Es un riesgo juridico directo para produccion.
- Ausencia total de evaluacion: no hay benchmarks, comparativas ni ejemplos de resultados publicados por el autor, de modo que la calidad del efecto no puede verificarse a priori.
- Dependencia del modelo base: el comportamiento, la resolucion y los requisitos de memoria dependen del modelo base "F1基础-Krea", cuyas caracteristicas y licencia no se documentan.
- Necesidad de palabra de activacion: el efecto requiere invocar "destiny"; omitirla puede reducir o anular el resultado, lo que exige controlar el prompt en cada peticion.
- Sobreaplicacion del efecto: como en cualquier LoRA, un peso excesivo puede producir una textura artificial, repetitiva o con artefactos locales; no hay valores recomendados publicados.
- Sesgo del dataset desconocido: al no documentarse las imagenes de entrenamiento, no puede evaluarse la cobertura de tonos de piel, edades, generos ni condiciones de iluminacion, con el consiguiente riesgo de resultados desiguales segun el sujeto.
- Riesgo de alucinacion visual: el modelo puede introducir detalle de piel inexistente en la imagen original, alterando la fidelidad del retrato, especialmente en tareas de restauracion documental o forense.
- Contexto y multilingueismo: no aplica la nocion de ventana de contexto; se desconoce que idiomas de prompt estan cubiertos.
- Trazabilidad limitada: la publicacion se hace desde una cuenta corporativa en nombre de un autor de la plataforma, sin repositorio de codigo, paper ni issues donde reportar problemas.
- Fechas de publicacion en 2026: los metadatos del Hub indican alta y actualizacion el 2026-09-24; conviene verificar la vigencia real del repositorio antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-realistic-texture-of-skin-lora
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/1988780753645342722
- Pagina del autor (@Destiny): https://www.runninghub.cn/user-center/1894957285121163265
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-realistic-texture-of-skin-lora/blob/main/README_cn.md
- Paper, repositorio de codigo y demo: no disponibles.

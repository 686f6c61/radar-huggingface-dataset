# RunningHubAI/rh-nrvxela-krea2-v1-lora

## Resumen

`rh-nrvxela-krea2-v1-lora` es un adaptador LoRA de edicion de imagen (pipeline `image-text-to-image`) publicado por RunningHubAI en nombre del autor Артëм Нежданов. No es un modelo fundacional: es un ajuste fino ligero sobre el modelo base Krea 2 que incorpora un personaje concreto, activado mediante la palabra clave `nrvxela`. El checkpoint subido corresponde a la iteracion `c1-st6000` y se entreno sobre un conjunto de 24 imagenes alojadas en ModelScope.

Su relevancia es acotada y practica: permite reproducir de forma consistente el mismo personaje en flujos de generacion y edicion de imagen dentro de ComfyUI o en la plataforma RunningHub, sin necesidad de reentrenar ni de describir el personaje en cada prompt. El repositorio pesa 0,2 GB y contiene un unico fichero de pesos de 224 MiB en formato safetensors, lo que lo hace trivial de distribuir y cargar.

Al tratarse de un LoRA de personaje, no dispone de especificaciones propias de arquitectura, contexto o tokenizador: hereda todas las del modelo base Krea 2, que no se detallan en la informacion disponible. La ficha, por tanto, documenta el adaptador y sus condiciones de uso, marcando como no disponible todo aquello que depende del modelo base o que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Krea 2; arquitectura del base no disponible |
| Parametros totales | no disponible (adaptador LoRA; el fichero pesa 224 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Krea 2) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en safetensors (precision no indicada) |
| Idiomas soportados | no disponibles; los prompts se procesan con el codificador de texto del modelo base |
| Licencia | no disponible; el autor conserva los derechos y se remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`nrvxela_krea2_v1_c1-st6000.safetensors`, 224 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en las capas del modelo base Krea 2 para especializarlo en un concepto visual. El autor indica que el entrenamiento se realizo sobre 24 imagenes alojadas en ModelScope, un volumen muy reducido y tipico de los LoRA de personaje, orientados a capturar rostro, vestuario y estilo mas que conocimiento visual general. El checkpoint publicado es `c1-st6000`, nomenclatura que sugiere el paso 6000 de la primera configuracion de entrenamiento, aunque no se documentan hiperparametros, learning rate, resolucion de entrenamiento ni composicion exacta del dataset.

No se especifica si el ajuste se aplico solo al UNet/DiT, al codificador de texto o a ambos, ni si se emplearon tecnicas adicionales como regularizacion por captions, dropout de texto o balanceo de conceptos. Tampoco hay informacion sobre el numero de tokens de entrenamiento (no aplica en el sentido de un LLM) ni sobre fases de RLHF o DPO, que no tienen sentido en este tipo de adaptador. La innovacion tecnica, en la medida en que exista, es la propia integracion con el ecosistema RunningHub y ComfyUI, que permite cargar el LoRA directamente en un grafo de nodos junto al base Krea 2.

## Capacidades

- Generacion de imagen condicionada por texto y por imagen de referencia (pipeline `image-text-to-image`), heredando las capacidades del base Krea 2.
- Edicion de imagen con identidad consistente: el LoRA fija la apariencia del personaje `nrvxela` a traves de la palabra clave en el prompt positivo.
- Reproduccion de un personaje concreto en distintas poses, encuadres e iluminaciones, siempre que se mantenga la palabra de activacion.
- Integracion nativa en ComfyUI mediante el nodo de carga de LoRA, y en la plataforma RunningHub a traves de su API.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, vision analitica, audio ni modo thinking; no aplican a un adaptador de imagen.
- Capacidades multilingues: no disponibles; dependen del codificador de texto del modelo base y de como este interprete prompts en distintos idiomas.

## Casos de uso

- Produccion de ilustracion de personaje consistente: cargar el LoRA junto a Krea 2 en ComfyUI y generar variaciones del personaje `nrvxela` en distintos escenarios, manteniendo rasgos faciales y vestuario entre imagenes.
- Creacion de storyboards y secuencias narrativas: al conservar la identidad del personaje, el adaptador sirve para generar varias viñetas de una misma historia sin deriva visual entre tomas.
- Edicion de imagenes existentes: usar el pipeline `image-text-to-image` para transformar una foto o boceto e imponer la identidad del personaje sobre la composicion original.
- Prototipado rapido de personajes para videojuegos o comics: iterar sobre poses y expresiones antes de encargar un modelado o un diseno final, reduciendo el coste de preproduccion.
- Automatizacion via API de RunningHub: integrar el LoRA en un servicio que genere imagenes de marca o de personaje bajo demanda, aprovechando los endpoints documentados por la plataforma.
- Pruebas de concepto de pipelines de difusion: usar un LoRA pequeno (224 MiB) como caso de prueba para validar flujos de carga, cache y composicion de adaptadores en infraestructura propia con ComfyUI.
- Personalizacion de contenido para comunidad: generar avatares o ilustraciones del personaje para redes, con la salvedad de que los derechos los conserva el autor y deben verificarse antes de un uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un LoRA de personaje, las metricas habituales (MMLU, HumanEval, GSM8K) no aplican; la evaluacion relevante seria la fidelidad de identidad y la calidad visual, para las que el autor no aporta numeros ni comparaciones.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; el LoRA anade solo 224 MiB de pesos, pero el consumo dominante lo marca el modelo base Krea 2, cuyas necesidades no se detallan.
- GPU recomendadas: no disponibles para el base; en la practica, la generacion de imagen con modelos de difusion de ultima generacion suele requerir GPUs con 12-24 GB de VRAM, pero este dato no se confirma en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende enteramente del modelo base Krea 2 y de la cuantizacion que se aplique a este.
- Opciones de despliegue: ComfyUI (entorno principal indicado por los tags), plataforma RunningHub y su API; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un LoRA de difusion.
- Latencia y throughput: no disponibles; dependen del base, de la resolucion de salida y del numero de pasos de muestreo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA de personaje para Krea 2 ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia cualitativa, la categoria la forman adaptadores LoRA de personaje para modelos de difusion (por ejemplo, los publicados para familias como SDXL o Flux), pero no se dispone de cifras comparables de este adaptador concreto.

## Limitaciones y advertencias

- Entrenado con solo 24 imagenes: riesgo alto de sobreajuste, deriva de identidad fuera de las poses o encuadres vistos y dificultad para generalizar a estilos muy distintos.
- Requiere incluir la palabra de activacion `nrvxela` en el prompt positivo; sin ella el LoRA puede no activarse o producir artefactos.
- Depende de un modelo base concreto (Krea 2); no es utilizable con otras familias de difusion sin reconversion.
- Licencia no disponible: el autor conserva los derechos y se remite a la licencia del proyecto original o upstream, por lo que el uso comercial no esta garantizado y debe verificarse antes de produccion.
- Riesgo de alucinacion visual y artefactos propios de los modelos de difusion: manos, texto en imagen y coherencia anatomica pueden fallar, especialmente en composiciones complejas.
- Sin informacion sobre sesgos: no se documenta la composicion demografica del dataset de entrenamiento ni sesgos conocidos del personaje o del base.
- Idiomas de prompt no documentados: el comportamiento con prompts en castellano depende del codificador de texto del base y no esta verificado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente nulo, sin evidencia de la comunidad sobre su calidad.
- El contenido del README incluye enlaces promocionales y de API de RunningHub; conviene tratarlos como material comercial y no como documentacion tecnica verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-nrvxela-krea2-v1-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2116911459434299394
- Pagina del autor: https://www.runninghub.ai/user-center/2052336727225577473
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-nrvxela-krea2-v1-lora/blob/main/README_cn.md

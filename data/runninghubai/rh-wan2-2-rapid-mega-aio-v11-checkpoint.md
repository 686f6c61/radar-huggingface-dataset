# RunningHubAI/rh-wan2.2-rapid-mega-aio-v11-checkpoint

## Resumen

`rh-wan2.2-rapid-mega-aio-v11-checkpoint` es un checkpoint de pesos publicado por RunningHubAI en Hugging Face, derivado mediante fine-tuning del modelo WAN2.2. Se distribuye como un unico fichero `safetensors` de aproximadamente 23.207 MiB (unos 24,3 GB) y esta empaquetado para su uso en ComfyUI, RunningHub y la propia plataforma de Hugging Face. El nombre "mega-aio" sugiere un paquete "todo en uno" orientado a flujos de generacion de video, aunque la model card no explicita la tarea concreta ni la arquitectura interna.

El modelo se presenta como un "checkpoint" dentro del ecosistema ComfyUI, lo que implica que esta pensado para cargarse en un nodo de tipo checkpoint y ejecutarse en pipelines de difusion. No se especifican parametros totales, longitud de contexto, idiomas ni licencia mas alla de una nota generica que remite a la licencia del proyecto original (WAN2.2). La informacion publica es muy escasa: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card se limita a enlaces de la plataforma RunningHub.

La relevancia de esta ficha es limitada pero real: permite identificar que se trata de un derivado comunitario de WAN2.2 orientado a generacion de video en ComfyUI, con un tamano de pesos que condiciona fuertemente los requisitos de hardware. Cualquier evaluacion adicional requiere consultar la documentacion del modelo base WAN2.2 y el proyecto original en RunningHub, ya que la model card no aporta detalles tecnicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de WAN2.2, presumiblemente difusion para video) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original WAN2.2) |
| Formato de pesos | safetensors (`wan2.2-rapid-mega-aio-nsfw-v11.safetensors`, 23.207 MiB) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. El modelo se identifica como un checkpoint derivado de WAN2.2 mediante fine-tuning, y el sufijo "rapid-mega-aio" sugiere un ajuste orientado a velocidad y a un empaquetado "todo en uno" para ComfyUI. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o destilacion. Tampoco se detalla si el checkpoint incorpora VAE, text encoder o ambos, aunque el tamano de 24,3 GB es coherente con un paquete que incluye varios componentes.

El nombre del fichero incluye el termino "nsfw", lo que indica que el fine-tuning se ha realizado sobre un dataset con contenido para adultos. No hay informacion sobre la innovacion tecnica concreta (decodificacion especulativa, atencion lineal, etc.) ni sobre el proceso de entrenamiento. Cualquier detalle adicional debe obtenerse del proyecto original en RunningHub o de la documentacion de WAN2.2.

## Capacidades

- Generacion de video (presumiblemente, dado el origen WAN2.2 y el empaquetado para ComfyUI), aunque no se detalla en la model card.
- Carga como checkpoint en ComfyUI mediante nodos estandar de checkpoint.
- Ejecucion en la plataforma RunningHub y a traves de su API.
- Fine-tuning orientado a contenido NSFW (indicado por el nombre del fichero).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de video en ComfyUI: el checkpoint se cargaria en un nodo de checkpoint dentro de un grafo de ComfyUI para producir clips de video a partir de prompts; es adecuado por su empaquetado "aio" que simplifica la carga.
- Prototipado rapido en RunningHub: la plataforma ofrece entrenamiento e inferencia gestionada, por lo que el modelo puede probarse sin infraestructura local.
- Integracion via API de RunningHub: para pipelines automatizados que necesiten generar video bajo demanda sin gestionar GPUs propias.
- Experimentacion con fine-tuning de WAN2.2: sirve como punto de partida para ajustes adicionales sobre el modelo base.
- Investigacion sobre contenido NSFW controlado: el sufijo del fichero indica que el ajuste se ha realizado con este tipo de datos, util para estudiar sesgos y filtros.
- Despliegue local en estaciones con GPU de gran VRAM: el tamano de 24,3 GB exige GPUs de gama alta o cuantizacion, pero permite ejecucion offline.
- Comparacion de variantes "rapid" frente al WAN2.2 original: util para evaluar el equilibrio velocidad/calidad del fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el fichero de pesos ocupa 23.207 MiB, por lo que se necesita al menos esa cantidad de VRAM (o RAM si se descarga por capas) para cargarlo en precision original.
- GPU recomendadas: no disponibles; por tamano, serian necesarias GPUs con 24 GB o mas (RTX 3090, RTX 4090, A100, H100) o configuraciones multi-GPU.
- Cabe en consumer GPU: previsiblemente en RTX 3090/4090 (24 GB) de forma ajustada, y con cuantizacion en GPUs de 16 GB; no confirmado por el autor.
- Opciones de despliegue: ComfyUI (principal), RunningHub (plataforma gestionada), Hugging Face (almacenamiento de pesos). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-wan2.2-rapid-mega-aio-v11-checkpoint | no disponible | no disponible | no disponible (remite a WAN2.2) | Hugging Face, RunningHub, ComfyUI |
| WAN2.2 (modelo base) | no disponible en esta ficha | no disponible | no disponible en esta ficha | Hugging Face / proyecto original |
| Otras variantes comunitarias de WAN2.2 | no disponible | no disponible | variable | Hugging Face |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas. La comparacion mas directa es con el propio WAN2.2 original y con otras variantes "rapid" del mismo ecosistema, pero la model card no aporta metricas.

## Limitaciones y advertencias

- La model card es extremadamente escasa: no hay informacion sobre arquitectura, parametros, contexto, licencia ni benchmarks.
- El fichero incluye "nsfw" en el nombre, lo que implica que el fine-tuning se ha realizado con contenido para adultos; existen riesgos de sesgos y de generacion de contenido inapropiado.
- Licencia no explicitada: la model card remite a la licencia del proyecto original WAN2.2, por lo que el uso comercial queda condicionado a dicha licencia, no verificada en esta ficha.
- Riesgo de alucinacion y de artefactos visuales inherente a los modelos de difusion, no cuantificado por el autor.
- El tamano de 24,3 GB limita el despliegue a hardware de gama alta o a plataformas gestionadas.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- No se documentan limitaciones de idioma, pero al ser un modelo de difusion, el idioma afecta principalmente a los prompts y al text encoder, no verificado.
- Fecha de creacion indicada como 2026-11-05, posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-wan2.2-rapid-mega-aio-v11-checkpoint
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/1982857940409430017
- Pagina del autor: https://www.runninghub.cn/user-center/1819214514410942465
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: README_cn.md (referenciado en la model card)

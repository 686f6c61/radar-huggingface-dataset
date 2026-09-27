# RunningHubAI/rh-red-z-image-pruned-checkpoint

## Resumen

rh-red-z-image-pruned-checkpoint es un checkpoint de generacion de imagenes a partir de texto (text-to-image) publicado en Hugging Face por RunningHubAI, la cuenta de la plataforma RunningHub en nombre del autor [@T8star-Aix](https://www.runninghub.cn/user-center/1819214514410942465). Se trata de una version "pruned" (podada) del modelo RedCraft / RedZimage, en su variante `redzimage15` actualizada el 3 de diciembre, que a su vez deriva mediante fine-tuning de Z-image-turbo. El repositorio contiene un unico archivo de pesos en formato safetensors de 11.740 MiB.

El modelo esta pensado para su uso dentro del ecosistema ComfyUI y de la propia plataforma RunningHub, donde puede cargarse directamente o ejecutarse mediante API. No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling. Su proposito es la sintesis de imagenes con el estilo y las caracteristicas aprendidas por el fine-tuning RedCraft sobre la base Z-image-turbo.

La relevancia de esta ficha es acotada y conviene ser explicito: el repositorio no publica parametros, arquitectura detallada, licencia, idiomas, ni resultados de benchmarks. Cualquier evaluacion tecnica seria requiere consultar el proyecto original en Civitai y el repositorio de Z-image-turbo, que no forman parte de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion text-to-image (no disponible el detalle de la arquitectura interna; derivado de Z-image-turbo) |
| Parametros totales | No disponible. El checkpoint ocupa 11.740 MiB en safetensors; a razon de 2 bytes por parametro en fp16, corresponderia a unos 5.800 millones de parametros, pero es una estimacion no confirmada por el autor |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. Modelo text-to-image; la ventana de contexto de texto no esta publicada |
| Tipos de cuantizacion | El repositorio solo distribuye safetensors (presumiblemente fp16). No se publican variantes GGUF, fp8 ni int8 |
| Idiomas soportados | No disponibles. Al ser text-to-image, el idioma relevante es el de los prompts; el autor no lo especifica |
| Licencia | No disponible. La model card indica que los derechos permanecen con el autor y que debe seguirse la licencia del proyecto original o del upstream, sin concretar cual |
| Formato de pesos | safetensors (`redcraftRedzimageUpdatedDEC03_redzimage15AIO-purn.safetensors`, 11.740 MiB) |
| Resolucion de salida | No disponible |
| Tarea declarada (pipeline) | text-to-image |
| Plataformas soportadas | ComfyUI, RunningHub, Hugging Face |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles de arquitectura. Lo unico documentado es que el modelo es un checkpoint de difusion text-to-image fine-tuneado a partir de Z-image-turbo, y que el resultado es una version podada del modelo RedCraft / RedZimage en su iteracion `redzimage15`. El sufijo "AIO" del nombre del archivo sugiere un empaquetado "todo en uno", tipico de los checkpoints de ComfyUI que integran varios componentes en un solo safetensors, aunque el autor no lo detalla.

No se publican datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO (tecnicas propias de modelos de lenguaje, no aplicables aqui) ni innovaciones tecnicas como decodificacion especulativa. El unico parametro de entrenamiento verificable es la procedencia: fine-tuning sobre Z-image-turbo y poda posterior para reducir el tamano del checkpoint. Toda afirmacion adicional seria especulacion.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image) mediante checkpoints cargables en ComfyUI.
- Carga directa en la plataforma RunningHub y ejecucion mediante su API, segun los enlaces de la model card.
- Estilo y caracteristicas heredadas del fine-tuning RedCraft / RedZimage, orientado a la estetica definida por el autor en Civitai.
- No soporta tool calling ni function calling: es un modelo generativo de imagenes, no un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio, inpainting, control de composicion): no disponibles en la informacion proporcionada.

## Casos de uso

- Ilustracion de personajes con estilo RedCraft: el checkpoint recoge el fine-tuning del autor sobre Z-image-turbo, por lo que resulta adecuado cuando se busca deliberadamente esa linea estetica concreta y no un modelo generico.
- Concept art y previsualizacion rapida en produccion audiovisual: al cargarse en ComfyUI, se integra en grafos existentes de generacion por lotes para explorar variaciones de una idea antes de encargar trabajo manual.
- Generacion de assets para videojuegos o prototipos: uso en pipelines de ComfyUI para producir ilustraciones de referencia, iconos o fondos, sujeto a la verificacion previa de la licencia (no disponible).
- Automatizacion de generacion de imagenes via API: la model card apunta a la API de RunningHub, de modo que el modelo puede invocarse desde un backend sin necesidad de montar infraestructura propia de GPU.
- Pruebas comparativas de checkpoints en equipos de investigacion: al ser una variante podada, permite medir el impacto de la poda en la calidad de salida frente al checkpoint original, siempre que se disponga de ambos.
- Generacion bajo demanda en entornos con VRAM limitada: el checkpoint en safetensors de 11.740 MiB es mas manejable que pesos de mayor tamano, lo que facilita su uso en GPUs de gama alta de consumo.
- Flujos internos de marketing y redes sociales: generacion de imagenes de acompanamiento para campanas, con revision humana obligatoria dado el riesgo de artefactos y la ausencia de garantias de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas con otros checkpoints, y no se dispone de datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 11.740 MiB, por lo que se necesitan al menos 12 GB de VRAM solo para los pesos en precision completa, mas el espacio de activaciones y del codificador de texto. En la practica, 16 GB es un minimo comodo y 24 GB elimina la mayor parte de la presion de memoria. Son estimaciones derivadas del tamano del archivo, no datos publicados.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 4080 / 4070 Ti Super (16 GB), A100 (40 u 80 GB) o H100 para despliegue en servidor, aunque para inferencia de difusion el beneficio de A100/H100 frente a una 4090 depende del grado de paralelizacion del pipeline.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas (RTX 4060 Ti 16 GB, 4070 Ti Super, 4080, 4090). En GPUs de 8-12 GB requeriria descarga parcial a RAM o cuantizacion, que el repositorio no ofrece.
- Opciones de despliegue: ComfyUI (soporte nativo declarado), plataforma RunningHub y su API. No se documenta soporte explicito para vLLM (no aplica a difusion), llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Formato |
|---|---|---|---|---|---|---|
| rh-red-z-image-pruned-checkpoint | Difusion text-to-image, fine-tune de Z-image-turbo | No disponible (checkpoint de 11.740 MiB) | No aplica | No disponible | Hugging Face, ComfyUI, RunningHub | safetensors |
| Z-image-turbo (modelo base) | Difusion text-to-image | No disponible en la informacion proporcionada | No aplica | No disponible en la informacion proporcionada | Upstream del fine-tune | No disponible |
| RedCraft / RedZimage v1.5 (original del autor) | Difusion text-to-image | No disponible en la informacion proporcionada | No aplica | No disponible | Civitai | No disponible |
| Otros checkpoints de la misma categoria | Difusion text-to-image | No disponible | No aplica | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes, por lo que no es posible establecer cual ofrece mejor calidad, velocidad o fidelidad al prompt.

## Limitaciones y advertencias

- Ausencia total de licencia explicita: la model card remite a la licencia del proyecto original o del upstream sin nombrarla. Esto impide determinar si el uso comercial esta permitido. No debe utilizarse en produccion sin aclarar antes este punto con el autor.
- Sesgos conocidos: no documentados por el autor. Al ser un fine-tune estilistico, es probable que reproduzca las inclinaciones esteticas y de representacion de su dataset de entrenamiento, pero no hay informacion verificable.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias incorrectas, texto ilegible en la imagen, artefactos y elementos incoherentes respecto al prompt.
- Trazabilidad limitada: es un derivado de un derivado (Z-image-turbo, fine-tune RedCraft, poda posterior). Los cambios introducidos por la poda no estan documentados, por lo que no puede saberse que capacidades se han degradado respecto al original.
- Idiomas: no se especifica que idiomas interpreta correctamente en los prompts.
- Ausencia de benchmarks: no hay ninguna metrica publicada que permita estimar la calidad de salida antes de desplegarlo.
- Cero adopcion registrada: el repositorio muestra 0 descargas y 0 "likes", por lo que no existe comunidad que haya validado su funcionamiento ni reportado fallos.
- Repositorio de paso: el propio autor indica que el modelo se distribuye principalmente para cargarse en RunningHub, lo que sugiere que Hugging Face actua como espejo y no como canal principal de soporte.
- Fecha de creacion atipica (27 de septiembre de 2026) en los metadatos del repositorio, lo que conviene verificar antes de citar el modelo en un trabajo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-red-z-image-pruned-checkpoint
- Proyecto original RedCraft / RedZimage en Civitai: https://civitai.com/models/958009/redcraft-or-redzimage-or-updated-dec03-or-latest-red-z-v15
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1998263902007885825
- Pagina del autor: https://www.runninghub.cn/user-center/1819214514410942465
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-red-z-image-pruned-checkpoint/blob/main/README_cn.md

# RunningHubAI/rh-2512-lora

## Resumen

rh-2512-lora es un adaptador LoRA de text-to-image publicado por RunningHubAI, pensado para cargarse sobre el modelo base Qwen-Image-2512. No es un modelo de lenguaje ni un modelo fundacional: es un ajuste fino ligero (225 MiB en un unico fichero safetensors) que modifica el comportamiento generativo del modelo base para producir un estilo visual concreto, activado mediante la palabra disparadora `lunhui`. El nombre del fichero, "轮回插画-2512-lunhui_10", sugiere un estilo de ilustracion asociado a ese termino.

El modelo se distribuye principalmente para su uso en ComfyUI y en la plataforma RunningHub, que ofrece tanto ejecucion online como API. La model card es extremadamente escueta: no documenta el dataset de entrenamiento, hiperparametros, numero de pasos, learning rate ni resultados cualitativos. Tampoco se especifica la licencia del adaptador, mas alla de una nota que remite a la licencia del proyecto original o del modelo upstream.

Su relevancia es limitada y muy especifica: sirve a quienes ya trabajan con Qwen-Image-2512 y quieren incorporar este estilo concreto sin reentrenar. Para cualquier otra evaluacion (razonamiento, codigo, agentes, contexto largo) el modelo no aplica, ya que su unica funcion es la generacion de imagenes condicionada por texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Qwen-Image-2512; arquitectura del base no detallada en la informacion disponible |
| Parametros totales | no disponible (el adaptador pesa 225 MiB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts dependen del modelo base; la model card esta en ingles y chino) |
| Licencia | no disponible; la model card indica "follow the original project or upstream license" |
| Formato de pesos | safetensors (`轮回插画-2512-lunhui_10.safetensors`, 225 MiB) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Qwen-Image-2512 para modificar su comportamiento sin alterar los pesos originales. El repositorio solo contiene el fichero de pesos del adaptador; no incluye el modelo base ni scripts de entrenamiento. El unico dato de entrenamiento documentado es la palabra disparadora `lunhui` y el hecho de que fue afinado a partir de Qwen-Image-2512, presumiblemente en la propia plataforma RunningHub, que ofrece servicios de entrenamiento.

No se especifican en la informacion disponible el numero de imagenes del dataset, la resolucion de entrenamiento, el rango del LoRA, el learning rate, el numero de pasos ni si se aplicaron tecnicas como regularizacion o captions automaticos. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.), lo cual es coherente con la naturaleza de un adaptador de estilo.

## Capacidades

- Generacion de imagenes a partir de prompts de texto, condicionada al estilo aprendido por el LoRA.
- Activacion del estilo mediante la palabra disparadora `lunhui`.
- Integracion en flujos de ComfyUI como nodo de carga de LoRA sobre Qwen-Image-2512.
- Ejecucion en la plataforma RunningHub, tanto en interfaz web como mediante API.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues propias mas alla de las del modelo base.
- No dispone de modo thinking, vision, audio ni ninguna capacidad multimodal adicional documentada.

## Casos de uso

- Ilustracion de estilo "lunhui" en produccion grafica: cargar el LoRA en ComfyUI sobre Qwen-Image-2512 y usar el trigger `lunhui` para generar ilustraciones coherentes con ese estilo, util para series de contenido visual con identidad estetica uniforme.
- Prototipado rapido de concept art: generar variaciones de una idea visual en minutos para validar direccion artistica antes de encargar ilustracion final a un artista humano.
- Generacion de assets para redes sociales: producir lotes de imagenes con un estilo consistente para campanas o cuentas tematicas, usando la API de RunningHub para automatizar la generacion.
- Integracion en pipelines de automatizacion via API: invocar el modelo desde un script o backend para generar imagenes bajo demanda en aplicaciones web o bots, aprovechando la API documentada de RunningHub.
- Exploracion creativa y experimentacion: comparar el resultado del LoRA frente al modelo base para evaluar cuanto aporta el ajuste de estilo, util en laboratorios de diseno o investigacion sobre personalizacion de modelos generativos.
- Educacion y demos de LoRA: usar este adaptador como ejemplo practico y ligero (225 MiB) para explicar como funciona un LoRA en ComfyUI sin necesidad de descargar checkpoints completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende enteramente de Qwen-Image-2512, cuyo consumo no se detalla en la informacion proporcionada. El adaptador en si anade solo 225 MiB de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; condicionada por el modelo base.
- Opciones de despliegue: ComfyUI (principal), plataforma RunningHub (web y API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion de imagenes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA de estilo comparables ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia estructural, cualquier LoRA de text-to-image para Qwen-Image-2512 seria comparable en tamano (tipicamente cientos de MiB) y en flujo de uso (ComfyUI + trigger word), pero no se dispone de datos concretos de alternativas.

## Limitaciones y advertencias

- La model card no documenta la licencia del adaptador; solo remite a la licencia del proyecto original o del modelo upstream. Antes de un uso comercial es imprescindible verificar la licencia de Qwen-Image-2512 y contactar con el autor si es necesario.
- No hay informacion sobre el dataset de entrenamiento, por lo que no se puede evaluar el riesgo de sesgos, sobreajuste al estilo o contaminacion con material protegido.
- El estilo solo se activa de forma fiable con la palabra disparadora `lunhui`; el comportamiento fuera de ese trigger no esta documentado.
- Al ser un LoRA de estilo, puede degradar la fidelidad al prompt cuando este choca con el estilo aprendido (por ejemplo, peticiones de fotorrealismo).
- El repositorio no incluye el modelo base ni instrucciones de instalacion detalladas; el usuario debe obtener Qwen-Image-2512 por su cuenta.
- No hay garantias de mantenimiento, versionado ni soporte por parte del autor.
- La fecha de creacion del repositorio (2026-11-06) y la ausencia de descargas o likes indican que es un modelo muy reciente y sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-2512-lora
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2026074033594306561
- Pagina del autor: https://www.runninghub.cn/user-center/1861364520106020865
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-2512-lora/blob/main/README_cn.md

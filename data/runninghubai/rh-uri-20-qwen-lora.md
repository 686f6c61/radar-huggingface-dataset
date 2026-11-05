# RunningHubAI/rh-uri-20-qwen-lora

## Resumen

rh-uri-20-qwen-lora es un adaptador LoRA de tipo text-to-image publicado por RunningHubAI, una plataforma de alojamiento e inferencia de modelos generativos orientada a flujos de trabajo de ComfyUI. No se trata de un modelo base autonomo, sino de un conjunto de pesos de ajuste fino (151 MiB en formato safetensors) que se aplica sobre Qwen-Image-2512, el modelo de difusion de Qwen para generacion de imagenes. El adaptador incorpora un estilo visual concreto, descrito por el autor como "URI 未来复古" (futurismo retro), y se activa mediante la palabra disparadora `URI`.

El interes practico del artefacto es limitado pero claro: permite reproducir un estilo grafico especifico dentro de pipelines de ComfyUI o en la nube de RunningHub sin necesidad de reentrenar. Al ser un LoRA de bajo rango, su huella en disco es minima y se puede combinar con otros adaptadores, lo que lo hace adecuado para experimentacion rapida en generacion de imagenes con identidad estilistica.

La informacion publicada es muy escasa: no se detallan hiperparametros de entrenamiento, dataset, licencia explicita ni idiomas soportados. El repositorio se creo y actualizo el mismo dia (5 de noviembre de 2026) y no registra descargas ni interacciones, por lo que debe considerarse un artefacto reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion text-to-image; modelo base Qwen-Image-2512 |
| Parametros totales | no disponible (el adaptador pesa 151 MiB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a un LoRA de difusion; depende del encoder de texto del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`URI_20-Qwen-image.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en capas del modelo base para modificar su comportamiento sin alterar los pesos originales. El modelo base declarado es Qwen-Image-2512, un modelo de difusion para generacion de imagenes de la familia Qwen. El adaptador modifica el estilo de salida para producir una estetica "futurismo retro" activada por la palabra `URI`.

No se ha publicado informacion sobre el dataset de entrenamiento, el numero de pasos, la tasa de aprendizaje, el rango del LoRA, la resolucion de las imagenes de entrenamiento ni si se aplicaron tecnicas como regularizacion o captions automaticos. Tampoco se documenta si el ajuste se realizo sobre el modelo completo o sobre el encoder de texto. El unico dato operativo es el flujo de entrenamiento ofrecido por RunningHub, que sugiere que el adaptador se entreno en su plataforma.

## Capacidades

- Generacion de imagenes text-to-image con un estilo visual concreto (futurismo retro) al incluir la palabra disparadora `URI` en el prompt.
- Compatibilidad con flujos de ComfyUI y con la plataforma RunningHub, tanto en su version internacional como en la china.
- Combinable con otros LoRA y con el modelo base Qwen-Image-2512 dentro de un mismo grafo de nodos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o video.
- No se documentan capacidades multilingues especificas; el comportamiento linguistico depende del encoder de texto del modelo base.
- No dispone de modo thinking ni de funcionalidades de vision mas alla de la generacion de imagenes.

## Casos de uso

- Ilustracion de estilo retro-futurista: usar el LoRA con la palabra `URI` para generar portadas, posters o arte conceptual con una estetica coherente en series de imagenes.
- Prototipado de direccion de arte: generar variaciones rapidas de un mismo estilo para presentar opciones a un cliente antes de producir assets finales.
- Creacion de assets para videojuegos: producir sprites, fondos o ilustraciones de ambientacion con una identidad visual homogenea.
- Contenido para redes sociales: generar imagenes tematicas con un estilo reconocible y consistente entre publicaciones.
- Experimentacion en ComfyUI: integrar el LoRA en grafos existentes junto con otros adaptadores para explorar mezclas de estilos.
- Automatizacion via API de RunningHub: invocar el modelo desde la API para generar lotes de imagenes en un pipeline de produccion sin gestionar infraestructura propia.
- Docencia y demostraciones: ilustrar el funcionamiento de un LoRA de estilo en talleres sobre difusion y ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; depende enteramente del modelo base Qwen-Image-2512 sobre el que se aplique.
- GPU recomendadas: no disponibles en la informacion proporcionada; vendran determinadas por el modelo base.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base y de la cuantizacion empleada.
- Opciones de despliegue: ComfyUI, plataforma RunningHub (internacional y china) y API de RunningHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un LoRA de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-uri-20-qwen-lora | LoRA sobre Qwen-Image-2512 | no disponible (151 MiB) | no aplica | no disponible | HuggingFace, RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa fiable con otros LoRA de estilo de la misma categoria.

## Limitaciones y advertencias

- La licencia no esta explicitamente definida; la model card remite a la licencia del proyecto original o upstream, lo que introduce incertidumbre para uso comercial.
- No se documentan sesgos conocidos, pero al ser un LoRA de estilo entrenado con un dataset no publicado, puede heredar sesgos del modelo base y del conjunto de imagenes utilizado.
- Riesgo de alucinacion visual: como todo modelo generativo de imagenes, puede producir artefactos, anatomia incorrecta o texto ilegible.
- El estilo solo se activa de forma fiable con la palabra disparadora `URI`; su intensidad depende del peso del LoRA y de la configuracion del sampler.
- No hay informacion sobre idiomas soportados en los prompts; el rendimiento linguistico dependera del encoder del modelo base.
- El repositorio no registra descargas ni validacion de la comunidad, por lo que su calidad no esta contrastada.
- El uso esta ligado al ecosistema ComfyUI y RunningHub; no se documenta compatibilidad con otras herramientas.
- No se especifican restricciones de uso comercial mas alla de la referencia generica a la licencia upstream.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-uri-20-qwen-lora
- Pagina del modelo original en RunningHub: https://www.runninghub.cn/model/public/2046608829294579714
- Pagina del autor: https://www.runninghub.cn/user-center/1935675382454521858
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: README_cn.md (referenciado en la model card)

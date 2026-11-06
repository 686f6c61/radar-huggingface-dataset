# RunningHubAI/rh-cgqwen-lora

## Resumen

`rh-cgqwen-lora` es un adaptador LoRA de tipo text-to-image publicado por RunningHubAI, una plataforma de despliegue y entrenamiento de modelos generativos. El adaptador se ha afinado sobre Qwen-image, el modelo de difusion de texto a imagen de la familia Qwen, y su funcion es aplicar un estilo visual concreto: ilustracion CG con acabado de "pintura gruesa" (厚涂, hou tu), un estilo de pintura digital con pinceladas densas y volumen marcado. El repositorio contiene unicamente los pesos del LoRA en formato safetensors, con un tamano de 563 MiB, no un modelo completo.

El modelo esta pensado para integrarse en flujos de trabajo de ComfyUI o en la plataforma RunningHub, donde se carga junto al modelo base Qwen-image. No se trata de un modelo de lenguaje ni de un modelo multimodal general: es un adaptador de estilizacion para generacion de imagenes. La informacion publicada es muy escasa (sin model card tecnica detallada, sin licencia explicita, sin idiomas declarados y sin benchmarks), por lo que esta ficha se limita a lo verificable en los metadatos y en el README del autor.

Su relevancia actual es acotada: sirve como ejemplo del ecosistema de LoRAs de estilo que se distribuyen via Hugging Face y se consumen en ComfyUI, y como pieza concreta para quien quiera reproducir el estilo de ilustracion CG sobre Qwen-image sin reentrenar el modelo base. No aporta innovaciones arquitectonicas; su valor es estilistico y practico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen-image (modelo de difusion text-to-image) |
| Parametros totales | no disponible (pesos LoRA de 563 MiB; el modelo base Qwen-image no se incluye) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el prompt de texto depende del modelo base) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; la cuantizacion dependera del modelo base y del runtime) |
| Idiomas soportados | no disponible (los prompts se procesan con el codificador de texto del modelo base) |
| Licencia | no disponible (el autor remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`厚涂cg插画qwen.safetensors`, 563 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Qwen-image para modificar su comportamiento generativo sin alterar los pesos originales. El modelo base es un text-to-image de la familia Qwen, del que no se detallan en la informacion disponible ni el numero de parametros, ni la arquitectura interna (tipo de difusion, codificador de texto, VAE), ni la resolucion nativa. El LoRA se ha entrenado para capturar un estilo de ilustracion CG con acabado de pintura gruesa, segun la descripcion del autor ("厚涂cg插画qwen").

No se publican datos sobre el dataset de entrenamiento (numero de imagenes, composicion, resolucion, captioning), ni sobre hiperparametros (rango del LoRA, alpha, learning rate, pasos), ni sobre si se uso regularizacion o tecnicas de prevencion de overfitting. Tampoco hay informacion sobre el proceso de curado de datos ni sobre evaluaciones cualitativas o cuantitativas del estilo resultante. Todo ello debe considerarse no disponible.

## Capacidades

- Generacion de imagenes con estilo de ilustracion CG y acabado de pintura gruesa, aplicando el estilo sobre el modelo base Qwen-image.
- Estilizacion consistente: al ser un LoRA de estilo, su funcion principal es transferir una estetica concreta a las generaciones del modelo base.
- Integracion en ComfyUI mediante el nodo de carga de LoRA, y en la plataforma RunningHub.
- Compatibilidad con prompts de texto en la medida en que lo permita el codificador del modelo base Qwen-image.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: no es un modelo de lenguaje.
- No se documentan capacidades multilingues especificas; dependen del codificador de texto del modelo base.

## Casos de uso

- Ilustracion editorial y de portada: generar ilustraciones con estetica CG de pintura gruesa para articulos, libros o revistas, cargando el LoRA sobre Qwen-image en ComfyUI y ajustando el peso del adaptador para controlar la intensidad del estilo.
- Concept art para videojuegos: producir bocetos de personajes y entornos con un acabado pictorico consistente, lo que acelera la exploracion de direcciones visuales antes del modelado 3D.
- Creacion de assets para redes sociales: generar imagenes estilizadas de forma repetible para campanas, manteniendo coherencia visual entre piezas gracias al estilo fijado por el LoRA.
- Prototipado de arte para animacion: obtener frames o keyframes estilizados que sirvan de referencia para equipos de animacion 2D o 3D.
- Generacion de fondos y texturas para interfaces o presentaciones: producir imagenes de fondo con un acabado pictorico uniforme sin recurrir a bancos de imagenes.
- Experimentacion artistica y docencia: usar el LoRA como ejemplo practico de adaptacion de estilo en cursos sobre difusion y ComfyUI, comparando el resultado con y sin el adaptador.
- Automatizacion via API de RunningHub: integrar la generacion estilizada en un pipeline de produccion que llame a la API de la plataforma para generar lotes de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el LoRA en si; el consumo vendra determinado por el modelo base Qwen-image y su cuantizacion. El adaptador anade 563 MiB de pesos, un coste marginal frente al modelo base.
- GPU recomendadas: no disponibles en la informacion proporcionada; dependen del modelo base Qwen-image.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base y del runtime empleado.
- Opciones de despliegue: ComfyUI (carga de LoRA), plataforma RunningHub y su API. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un LoRA de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-cgqwen-lora | LoRA de estilo text-to-image | Qwen-image | no disponible | no disponible | Hugging Face, RunningHub |
| Otros LoRA de estilo para Qwen-image | LoRA de estilo text-to-image | Qwen-image | no disponible | variable segun autor | Hugging Face, Civitai, RunningHub |
| LoRA de estilo para Stable Diffusion XL | LoRA de estilo text-to-image | SDXL | no disponible | variable (a menudo CreativeML) | Hugging Face, Civitai |
| LoRA de estilo para Flux | LoRA de estilo text-to-image | Flux.1 | no disponible | variable | Hugging Face, Civitai |

No se dispone de datos de rendimiento comparativo (FID, CLIP score, evaluaciones humanas) para este LoRA ni para alternativas concretas en la informacion proporcionada, por lo que la comparativa se limita a categoria, modelo base, licencia y canal de distribucion.

## Limitaciones y advertencias

- Informacion tecnica muy escasa: no hay model card detallada, ni dataset, ni hiperparametros, ni evaluaciones, lo que dificulta reproducir el entrenamiento o predecir su comportamiento.
- Licencia no disponible: el autor remite a la licencia del proyecto original o upstream; antes de un uso comercial hay que verificar la licencia de Qwen-image y la del propio LoRA, que no se declara.
- Dependencia total del modelo base: la calidad, la resolucion y el soporte de prompts dependen de Qwen-image; el LoRA no funciona de forma autonoma.
- Riesgo de sobreajuste al estilo: al ser un LoRA de estilo, puede reducir la diversidad de las generaciones o imponer la estetica incluso cuando el prompt pide otro acabado.
- Sesgos: no documentados, pero heredados del dataset de entrenamiento del LoRA y del modelo base (sesgos de representacion, culturales y esteticos).
- Alucinacion visual: como todo modelo generativo de imagen, puede producir anatomias incorrectas, texto ilegible o incoherencias espaciales.
- Idiomas: no declarados; el soporte de prompts en castellano dependera del codificador de texto del modelo base.
- Sin garantias de soporte ni mantenimiento: repositorio con 0 descargas y 0 likes en el momento de la consulta, actualizado por ultima vez el mismo dia de su creacion.
- Uso en produccion: al no haber benchmarks ni documentacion de estabilidad, conviene validar cualitativamente los resultados antes de integrarlo en pipelines automatizados.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-cgqwen-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2029039877454569474
- Pagina del autor: https://www.runninghub.cn/user-center/1861364520106020865
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-cgqwen-lora/blob/main/README_cn.md

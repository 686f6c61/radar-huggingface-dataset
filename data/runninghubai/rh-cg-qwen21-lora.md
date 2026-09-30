# RunningHubAI/rh-cg-qwen21-lora

## Resumen

rh-cg-qwen21-lora es un adaptador LoRA de text-to-image publicado en Hugging Face por RunningHubAI en nombre de su autor, el usuario @Li鱼 de RunningHub. No es un modelo generativo completo, sino un conjunto de pesos de bajo rango que se inyectan sobre un modelo base para modificar su salida estilística: según la model card, está afinado a partir de Qwen-image, y la etiqueta descriptiva del repositorio es "国漫" (guoman), es decir, la estética de la animación y el cómic chinos.

El repositorio ocupa 0,1 GB y contiene un único archivo de pesos, `guomanqwen21_c1-st5000.safetensors`, de 80 MiB. Está etiquetado con comfyui, lora y text-to-image, y la propia ficha indica que los pesos se cargan en ComfyUI, en RunningHub o directamente desde Hugging Face. El pipeline declarado es text-to-image, y el entrenamiento se realizó en la plataforma RunningHub.

Su relevancia es acotada pero concreta: se trata de un adaptador de estilo ligero (80 MiB) que permite reproducir un look de animación china sobre un modelo base de imagen ya existente, sin necesidad de reentrenar el modelo completo. Al ser un LoRA, su coste de almacenamiento y de distribución es mínimo y se puede combinar con otros adaptadores en un flujo de ComfyUI. El repositorio no incluye documentación sobre arquitectura del modelo base, dataset de entrenamiento, hiperparámetros ni licencia explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusion (base declarada: Qwen-image); no se detalla la arquitectura interna del adaptador ni el rango (rank) |
| Parametros totales | no disponible (peso del archivo: 80 MiB en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; la longitud de prompt la determina el encoder de texto del modelo base) |
| Tipos de cuantizacion | no disponible; la cuantizacion aplicable depende del modelo base, no del adaptador |
| Idiomas soportados | no disponible (los prompts dependen del encoder de texto del modelo base; la model card esta en chino e ingles) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`guomanqwen21_c1-st5000.safetensors`) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA (Low-Rank Adaptation) para un modelo de difusion text-to-image. La model card solo declara el campo "Finetuned from: Qwen-image" y la plataforma de entrenamiento (RunningHub), sin especificar el rango de la descomposicion de bajo rango, las capas objetivo, el optimizador, la tasa de aprendizaje ni el numero de pasos. El nombre del archivo incluye el sufijo `st5000`, que sugiere 5000 pasos de entrenamiento, pero es una inferencia a partir del nombre y no un dato confirmado en la documentacion.

No hay informacion publicada sobre el dataset utilizado, su composicion, si hubo filtrado de imagenes, ni sobre tecnicas de regularizacion. Tampoco se documentan procesos de alineacion tipo RLHF o DPO, que no son habituales en adaptadores de estilo para generacion de imagen. La unica indicacion tematica es la etiqueta "国漫" (guoman), que orienta el estilo hacia la animacion y el comic chinos. No se menciona ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Generacion de imagenes text-to-image con estetica de animacion china (guoman), actuando como modificador de estilo sobre el modelo base Qwen-image.
- Transferencia de estilo: aplica un look consistente de ilustracion/manhua a las generaciones del modelo base.
- Integracion en flujos de ComfyUI mediante el cargador de LoRA integrado, segun las etiquetas del repositorio.
- Uso a traves de la plataforma RunningHub y de su API, segun los enlaces de la model card.
- Compatibilidad potencial con otros adaptadores LoRA del mismo modelo base (comportamiento estandar de LoRA en ComfyUI), aunque no esta documentado ni verificado en el repositorio.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, modo thinking, vision de entrada ni procesamiento de audio. Es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Ilustracion de comic y manhua: el adaptador se carga sobre Qwen-image en ComfyUI para generar paginas y viñetas con estetica guoman, manteniendo el estilo coherente entre paneles mediante el mismo LoRA en toda la sesion de generacion.
- Diseño de personajes: permite explorar variaciones de un personaje con un lenguaje visual de animacion china, generando hojas de personaje y poses alternativas con un coste de almacenamiento de solo 80 MiB por variante de estilo.
- Storyboarding y previsualizacion: util para producir bocetos de escenas y encuadres antes de pasar a produccion final, aprovechando que el adaptador se puede activar y desactivar con un peso ajustable en el cargador de LoRA de ComfyUI.
- Ilustracion editorial y portadas: generacion de portadas de novela ligera, web novel o articulos con una estetica coherente con el publico objetivo de habla china.
- Assets para videojuegos y apps moviles: produccion de arte conceptual, iconos y elementos de interfaz con estilo guoman, integrable en un pipeline de generacion por lotes mediante la API de RunningHub.
- Contenido para redes sociales y marketing: generacion rapida de ilustraciones promocionales con identidad visual reconocible, apoyandose en la plataforma alojada cuando no se dispone de GPU local.
- Experimentacion en investigacion de estilos: al ser un adaptador ligero, sirve como caso de estudio para comparar tecnicas de ajuste de estilo sobre modelos de difusion y para medir la transferibilidad de un LoRA entre versiones del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, comparativas humanas), ni tampoco evaluaciones del estilo generado. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que tampoco existe validacion comunitaria documentada.

## Requisitos de hardware

- El requisito de VRAM lo determina casi por completo el modelo base (Qwen-image), no el adaptador: los pesos LoRA suman aproximadamente 80 MiB, un coste despreciable frente al modelo completo. No se dispone de cifras oficiales de VRAM para este adaptador.
- GPU recomendadas: no disponible en la informacion proporcionada. La viabilidad en GPU de consumo depende enteramente de la version y cuantizacion del modelo base que se utilice, dato que la model card no especifica.
- Opciones de despliegue documentadas: ComfyUI (etiqueta del repositorio y plataforma declarada), RunningHub y su API, y descarga directa de pesos desde Hugging Face.
- vLLM, llama.cpp, Ollama y TGI no aplican a este artefacto, ya que son entornos de inferencia para modelos de lenguaje y no para adaptadores de difusion de imagen; no se documenta soporte para diffusers.
- Latencia y throughput: no disponible. No se han publicado mediciones de tiempo por imagen ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-cg-qwen21-lora | LoRA text-to-image, estilo guoman | Qwen-image | 80 MiB | no disponible | Hugging Face, ComfyUI, RunningHub |
| RunningHubAI/rh-qwen2.1-lora | LoRA text-to-image | Qwen 2.1 (imagen) | no disponible | no disponible | Hugging Face, ComfyUI |
| RunningHubAI/rh-qwen-image-2.1-aio-nsfw-lora | LoRA text-to-image, orientado a contenido NSFW | Qwen Image 2.1 | no disponible | no disponible | Hugging Face |
| Qwen 2.1 Turbo LoRAs (Qwen_Viggle_4step_0.1, ViggleAI) | LoRA de aceleracion (destilado, 4 pasos) | Qwen 2.1 | no disponible | no disponible (el autor no reclama la autoria de los pesos originales) | Civitai, ComfyUI |

La comparacion es limitada porque ninguno de los repositorios comparados publica fichas tecnicas completas (parametros, contexto, licencia) ni resultados de benchmarks. La diferencia funcional principal es la finalidad: rh-cg-qwen21-lora es un adaptador de estilo, mientras que los LoRA Turbo de la familia Qwen 2.1 son adaptadores de destilado orientados a reducir el numero de pasos de muestreo.

## Limitaciones y advertencias

- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream, sin concretarla. Antes de cualquier uso comercial es imprescindible verificar los terminos de Qwen-image y contactar con el autor o con RunningHub.
- Documentacion minima: no hay informacion sobre dataset, hiperparametros, rango del LoRA ni pasos de entrenamiento confirmados. Esto dificulta la reproducibilidad y la evaluacion tecnica.
- Sesgo de estilo: el adaptador esta orientado deliberadamente a una estetica concreta (guoman). Forzara ese look en las generaciones y puede degradar la fidelidad al prompt cuando se pide un estilo diferente.
- Compatibilidad de version no garantizada: el nombre del archivo sugiere una variante concreta de Qwen-image (qwen21), pero no se documenta con que versiones exactas del modelo base es compatible ni si funciona con variantes posteriores.
- Riesgo de alucinacion visual: como todo modelo de difusion text-to-image, puede generar anatomias incorrectas, texto ilegible en la imagen, manos deformadas o atributos inconsistentes con el prompt, especialmente en escenas complejas.
- Idiomas: no se documenta el comportamiento multilingue. El rendimiento con prompts en castellano depende del encoder de texto del modelo base y no ha sido evaluado en este repositorio.
- Sin validacion comunitaria: 0 descargas y 0 likes implican ausencia de evidencia externa sobre calidad, estabilidad o seguridad del contenido generado.
- Entorno de origen: el ecosistema de RunningHub publica tambien adaptadores NSFW; conviene revisar el contenido generado y aplicar filtros si el despliegue es en produccion o en entornos con menores.
- No apto como modelo autonomo: sin el modelo base no genera nada; cualquier intento de cargarlo como modelo completo fallara.
- Trazabilidad del autor: el modelo se publica "on behalf of the author", de modo que la responsabilidad sobre los datos de entrenamiento y sobre posibles infracciones de derechos de autor no esta aclarada.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-cg-qwen21-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2102369095059599361
- Pagina del autor (@Li鱼): https://www.runninghub.cn/user-center/1861364520106020865
- Plataforma RunningHub International: https://www.runninghub.ai
- Plataforma RunningHub China: https://www.runninghub.cn
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Modelo relacionado RunningHubAI/rh-qwen2.1-lora: https://huggingface.co/RunningHubAI/rh-qwen2.1-lora
- Modelo relacionado RunningHubAI/rh-qwen-image-2.1-aio-nsfw-lora: https://huggingface.co/RunningHubAI/rh-qwen-image-2.1-aio-nsfw-lora
- Noticia sobre entrenamiento de LoRA para Qwen Image 2.1 (Fizgig v6.5): https://comfyui-wiki.com/en/news/2026-09-27-fizgig-v6-5-qwen-image-2-1
- Qwen 2.1 Turbo LoRAs en Civitai: https://civitai.com/models/2958738/qwen-21-turbo-loras

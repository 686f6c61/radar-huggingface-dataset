# RunningHubAI/rh-nelia-18-z-image-lora

## Resumen

rh-nelia-18-z-image-lora es un adaptador LoRA de tipo text-to-image publicado por RunningHubAI en Hugging Face. No se trata de un modelo generativo completo, sino de un ajuste fino de bajo rango que se aplica sobre el modelo base Z-Image para reproducir un personaje concreto: pelo oscuro ondulado, pecas y heterocromia (ojo derecho verde, ojo izquierdo azul). El disparador para activar el personaje en el prompt es la cadena `rd_ai18`.

El artefacto es un unico fichero `20261001-51377210.safetensors` de 81 MiB, pensado para cargarse en ComfyUI, en la plataforma RunningHub o en cualquier pipeline que admita LoRA sobre Z-Image. El repositorio ocupa aproximadamente 0,1 GB y, en el momento de la consulta, registra 0 descargas y 0 likes, por lo que no hay evidencia publica de adopcion.

Es relevante en la medida en que Z-Image es una de las familias de difusion recientes con soporte de LoRA en ComfyUI, y este repositorio ejemplifica el flujo de publicacion de personajes consistentes que ofrece RunningHub como plataforma. La model card no documenta numero de imagenes de entrenamiento, hiperparametros, resolucion objetivo ni licencia concreta, por lo que buena parte de las especificaciones habituales quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Z-Image; no es un modelo autonomo |
| Parametros totales | no disponible (el unico dato publicado es el tamano del fichero: 81 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del text encoder del modelo base Z-Image) |
| Tipos de cuantizacion | no disponible; se distribuye un unico fichero en safetensors, sin variantes cuantizadas publicadas |
| Idiomas soportados | no disponible (los prompts dependen del text encoder del base; no se declara cobertura idiomatica) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`20261001-51377210.safetensors`, 81 MiB) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente pesos LoRA (adaptadores de bajo rango) que se insertan en las capas del modelo base Z-Image. No se especifica en que modulos del transformer de difusion se aplican los adaptadores, ni el rango (rank) ni el alpha empleados en el entrenamiento, ni si se uso una variante fp16 o bf16. La model card unicamente indica "Finetuned from: Z-Image" y el trigger `rd_ai18`.

No hay informacion sobre el dataset de entrenamiento: se desconoce el numero de imagenes, la resolucion, la composicion, si hubo regularizacion con imagenes de clase, ni si se aplicaron tecnicas como captioning automatico, DreamBooth, fine-tuning con priors o entrenamiento con mascaras. Tampoco se documentan pasos de optimizacion, learning rate, batch size ni duracion del entrenamiento. La unica innovacion tecnica implicita es el propio flujo de entrenamiento y despliegue de RunningHub con ComfyUI y su API, sin detalles adicionales.

## Capacidades

- Generacion de imagenes text-to-image del personaje "nelia-18" mediante el trigger `rd_ai18`, con rasgos fijos: pelo oscuro ondulado, pecas y heterocromia (ojo derecho verde, ojo izquierdo azul).
- Compatible con ComfyUI y con la plataforma RunningHub, tanto en interfaz como mediante API.
- Se puede combinar con otros LoRA y con el propio modelo base Z-Image para variar estilo, iluminacion o composicion.
- El control de la escena se delega al prompt de texto del modelo base; el LoRA solo condiciona la identidad del personaje.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: son capacidades no aplicables a un adaptador de difusion.

## Casos de uso

- Generacion de personaje consistente para narrativa visual: usar `rd_ai18` en el prompt junto con descripciones de escena para obtener el mismo personaje en distintas ilustraciones, aprovechando que el LoRA fija identidad y no composicion.
- Ilustracion de portadas y assets para juegos o comics: producir variaciones del personaje con iluminacion, vestuario y encuadre distintos sin reentrenar, integrando el LoRA en un workflow de ComfyUI.
- Prototipado de personajes para preproduccion audiovisual: generar hojas de personaje (turnarounds) con distintos angulos usando el LoRA y prompts de camara, para validar diseno antes de produccion.
- Contenido para redes sociales y marketing de nicho: crear imagenes tematicas de un personaje recurrente que mantenga coherencia visual entre publicaciones.
- Creacion de datasets sinteticos de identidad: generar conjuntos de imagenes del personaje en multiples condiciones para experimentar con tecnicas de consistencia facial o para alimentar otros pipelines.
- Integracion en aplicaciones de generacion de imagenes como servicio: desplegar el LoRA sobre Z-Image detras de una API (por ejemplo, la de RunningHub) para ofrecer generacion de personaje bajo demanda con el trigger `rd_ai18`.
- Experimentacion en investigacion sobre LoRA: usar este adaptador como caso de estudio de bajo coste (81 MiB) para analizar como un rango pequeno condiciona identidad sin afectar al resto de la generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud facial), comparativas visuales ni evaluaciones de calidad. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- El LoRA en si ocupa 81 MiB en disco, pero la inferencia requiere cargar el modelo base Z-Image completo; la VRAM necesaria viene determinada por ese modelo base y por la resolucion de generacion, no por el adaptador.
- No se especifica en la informacion disponible la VRAM exacta requerida por Z-Image, ni el conjunto de GPU recomendadas, ni si cabe en GPU de consumo. Se desconoce si existe una variante cuantizada que reduzca el consumo.
- El despliegue documentado por el autor pasa por ComfyUI, la plataforma RunningHub (interfaz web y API) y Hugging Face como repositorio de pesos. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a modelos de difusion de imagen.
- No se publican datos de latencia ni de throughput por imagen.

## Comparativa con modelos similares

No hay datos de rendimiento publicados que permitan una comparativa cuantitativa con otros LoRA de personaje. A nivel estructural, la comparativa disponible es limitada:

| Modelo | Tipo | Base | Tamano del adaptador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-nelia-18-z-image-lora | LoRA text-to-image | Z-Image | 81 MiB | no disponible | Hugging Face, RunningHub |
| rh-z-image-lora-2042884777719631873 | LoRA text-to-image | Z-Image | no disponible | no disponible | Hugging Face (RunningHubAI) |
| rh-z-imagebase-fp16-unet | UNet base | Z-Image | no disponible | no disponible | Hugging Face (RunningHubAI) |
| LoRA de personaje para SDXL o Flux | LoRA text-to-image | SDXL / Flux | variable segun autor | variable | Hugging Face, Civitai |

La comparativa con alternativas de la misma categoria (LoRA de personaje en SDXL, Flux u otros) no puede hacerse con datos numericos porque no hay benchmarks publicados para este adaptador.

## Limitaciones y advertencias

- No se documenta la licencia concreta del adaptador; la model card indica que se sigue la licencia del proyecto original o del upstream, lo que deja el uso comercial en una situacion ambigua y requiere verificacion previa con el autor o con RunningHub.
- Al ser un LoRA sobre Z-Image, hereda las limitaciones del modelo base: sesgos del dataset de entrenamiento, riesgo de estereotipos en rasgos faciales y posible reproduccion de sesgos de genero o etnia.
- Riesgo de sobreajuste al personaje: si el LoRA se entreno con pocas imagenes, puede forzar pose, encuadre o iluminacion, reduciendo la variedad de salidas.
- El trigger `rd_ai18` es obligatorio; sin el, el adaptador puede no activarse o producir resultados inconsistentes.
- No hay informacion sobre el numero de pasos de entrenamiento, por lo que puede haber olvido catastrofico (reduccion de la capacidad general del modelo base al aplicar el LoRA).
- Cero descargas y cero likes en el momento de la consulta: no hay validacion de la comunidad ni casos de uso verificados.
- Ausencia total de documentacion sobre dataset e hiperparametros, lo que dificulta la reproducibilidad y la evaluacion de sesgos.
- No se declara cobertura idiomatica ni comportamiento del tokenizador del base ante prompts en castellano; el ajuste del prompt recae enteramente en Z-Image.
- Para produccion, conviene validar calidad y consistencia del personaje en el propio pipeline antes de integrarlo, y comprobar que la resolucion objetivo coincide con la del modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-nelia-18-z-image-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2105608099695771650
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2100253808088956930
- Plataforma RunningHub: https://www.runninghub.ai
- Sitio de RunningHub en China: https://www.runninghub.cn
- Documentacion de la API (en): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (zh): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- API de la familia de modelos: https://www.runninghub.ai/call-api/apidetail/2133100000000700025
- Catalogo de modelos de RunningHub en Hugging Face: https://huggingface.co/RunningHubAI/models
- Otro LoRA de Z-Image de RunningHubAI: https://huggingface.co/RunningHubAI/rh-z-image-lora-2042884777719631873
- Etiqueta RunningHub en Civitai: https://civitai.com/tag/runninghub

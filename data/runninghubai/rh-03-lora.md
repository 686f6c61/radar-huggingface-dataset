# RunningHubAI/rh-03-lora

## Resumen

rh-03-lora es un adaptador LoRA para generacion de imagenes a partir de texto (text-to-image) publicado por RunningHubAI en Hugging Face. No se trata de un modelo base autonomo, sino de un conjunto de pesos de ajuste fino (563 MiB en un unico fichero `q3.safetensors`) que se aplica sobre el modelo Qwen-Image-2512, segun indica la propia model card. El autor del ajuste figura como RunningHub-@jdaly y el modelo se distribuye tanto en Hugging Face como en la plataforma RunningHub.

El modelo esta orientado al ecosistema ComfyUI, como reflejan sus etiquetas (`comfyui`, `lora`, `text-to-image`), y su uso previsto es la personalizacion de un estilo o concepto concreto sobre Qwen-Image. La model card proporciona una configuracion de inferencia recomendada: 40 pasos de muestreo, CFG de 4, peso de LoRA de 0,8 y un conjunto de resoluciones por relacion de aspecto (1328x1328 para 1:1, 1664x928 para 16:9, 928x1664 para 9:16, 1472x1104 para 4:3, 1104x1472 para 3:4, 1584x1056 para 3:2 y 1056x1584 para 2:3). No se especifica palabra de activacion (trigger word), lo que sugiere que el estilo o concepto aprendido se activa de forma implicita al aplicar el adaptador.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador de nicho, sin descargas ni valoraciones en el momento de la consulta, cuya utilidad depende enteramente del modelo base Qwen-Image-2512. La informacion publicada es escasa: no hay detalles sobre el dataset de entrenamiento, la licencia efectiva ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen-Image-2512; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | no disponible (pesos LoRA de 563 MiB; numero de parametros no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`q3.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Qwen-Image-2512 para modificar su comportamiento generativo sin reentrenar todos los pesos. La model card no detalla en que modulos del transformer de difusion se aplican los adaptadores, ni el rango utilizado, ni la magnitud de los parametros entrenados. El fichero unico `q3.safetensors` de 563 MiB es coherente con un adaptador de rango moderado sobre un modelo de difusion de gran tamano, pero no permite inferir el numero exacto de parametros.

No se publica informacion sobre el dataset de entrenamiento: ni numero de imagenes, ni composicion, ni si se emplearon tecnicas de regularizacion, captions automaticos o ajuste con preferencias. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras). El unico dato operativo relevante es la configuracion de inferencia recomendada por el autor (40 pasos, CFG 4, peso 0,8) y la ausencia de trigger word, lo que implica que el efecto del LoRA se aplica de forma global al activar el adaptador.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales, heredando las capacidades del modelo base Qwen-Image-2512.
- Personalizacion de estilo o concepto sobre el modelo base mediante la aplicacion del adaptador LoRA.
- Soporte de multiples relaciones de aspecto con resoluciones predefinidas: 1:1 (1328x1328), 16:9 (1664x928), 9:16 (928x1664), 4:3 (1472x1104), 3:4 (1104x1472), 3:2 (1584x1056) y 2:3 (1056x1584).
- Integracion en flujos de trabajo de ComfyUI, segun las etiquetas del repositorio.
- Ejecucion en la plataforma RunningHub, tanto en su version internacional como en la china, y a traves de su API.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio; son capacidades ajenas al proposito del artefacto.
- No se documentan capacidades multilingues especificas para el texto de los prompts.

## Casos de uso

- Generacion de ilustraciones con estilo propio en ComfyUI: cargando `q3.safetensors` como nodo LoRA sobre Qwen-Image-2512 con peso 0,8, se obtienen imagenes con la estetica aprendida por el adaptador; es adecuado para creadores que ya trabajan en ComfyUI y quieren un estilo consistente sin cambiar de modelo base.
- Prototipado rapido de conceptos visuales: con 40 pasos y CFG 4, la generacion es suficientemente rapida para iterar sobre variaciones de un mismo concepto antes de fijar una direccion creativa.
- Produccion de material para redes sociales en multiples formatos: las resoluciones predefinidas para 1:1, 16:9, 9:16, 4:3, 3:4, 3:2 y 2:3 permiten generar directamente el encuadre necesario para cada plataforma sin recortes posteriores.
- Integracion en pipelines automatizados mediante la API de RunningHub: el modelo puede invocarse de forma programatica para generar lotes de imagenes dentro de un flujo de publicacion o de gestion de contenidos.
- Exploracion artistica y experimentacion con prompts libres: al no requerir trigger word, el adaptador se puede combinar con descripciones arbitrarias, lo que facilita la mezcla del estilo aprendido con contenidos diversos.
- Generacion de bocetos para direccion de arte: util para producir referencias visuales rapidas en fases tempranas de un proyecto, dado el bajo coste de iteracion con la configuracion recomendada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para este LoRA. El adaptador en si ocupa 563 MiB en disco, pero requiere cargar el modelo base Qwen-Image-2512 completo, cuyo peso en VRAM no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponibles. Al tratarse de un modelo de difusion de gran tamano, es previsible que requiera GPU con memoria dedicada considerable, pero no se confirma en la documentacion.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: ComfyUI (entorno principal soportado), plataforma RunningHub (web y API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, entornos no aplicables a modelos de difusion de imagen en la mayoria de los casos.
- Latencia y throughput: no disponibles. La configuracion de 40 pasos y CFG 4 es el unico parametro de rendimiento publicado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-03-lora | LoRA text-to-image sobre Qwen-Image-2512 | no disponible (563 MiB) | no aplica | no disponible | Hugging Face, RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada, por lo que no es posible establecer una comparativa con datos verificables.

## Limitaciones y advertencias

- La licencia no esta declarada de forma explicita; la model card remite a la licencia del proyecto original o upstream, lo que introduce incertidumbre sobre el uso comercial. Es imprescindible verificar la licencia de Qwen-Image-2512 antes de cualquier despliegue en produccion.
- El modelo no es autonomo: requiere el modelo base Qwen-Image-2512 para funcionar, y su comportamiento, calidad y limitaciones heredan las de dicho modelo.
- No se documenta el dataset de entrenamiento, por lo que no es posible evaluar sesgos conocidos, representatividad ni riesgo de sobreajuste a un estilo concreto.
- Riesgo de alucinacion visual (artefactos, incoherencias anatomicas o de composicion) inherente a los modelos de difusion; no se han publicado evaluaciones que lo cuantifiquen.
- La ausencia de trigger word implica que el estilo del LoRA se aplica de forma global, lo que puede dificultar el control fino sobre cuando se activa y cuando no.
- No se documentan capacidades multilingues ni el comportamiento con prompts en idiomas distintos del chino o el ingles.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, lo que limita la evidencia de uso real y de calidad percibida por la comunidad.
- El modelo se distribuye unicamente en formato safetensors; no hay variantes cuantizadas ni conversiones oficiales documentadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-03-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2046125164349362177
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1983778672748457986
- Plataforma RunningHub internacional: https://www.runninghub.ai
- Plataforma RunningHub China: https://www.runninghub.cn
- Documentacion de la API (en ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (en chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-03-lora/blob/main/README_cn.md

# RunningHubAI/rh-tang-klein-v1.0-lora

## Resumen

rh-tang-klein-v1.0-lora es un adaptador LoRA de generacion de imagenes (text-to-image) publicado por RunningHubAI en nombre del autor identificado como "老唐" en la plataforma RunningHub. El modelo esta disenado para una tarea muy concreta: invertir el proceso habitual de diseno arquitectonico, es decir, partir de una vista aerea o render en perspectiva (鸟瞰效果图) de una vivienda y generar la planta o layout en dos dimensiones correspondiente. Segun la model card, el LoRA esta afinado a partir de Flux2-Klein-9B.

El repositorio contiene un unico archivo de pesos en formato safetensors de 332 MiB, lo que es coherente con un adaptador LoRA de rango bajo sobre un modelo base de aproximadamente 9.000 millones de parametros. El modelo se distribuye para su uso en ComfyUI, en la propia plataforma RunningHub y en Hugging Face, y no incluye informacion sobre licencia, idiomas ni resultados de evaluacion.

Su relevancia es acotada pero clara dentro del nicho de la generacion de imagenes aplicada a arquitectura e interiorismo: automatiza una tarea de conversion visual que normalmente requiere interpretacion humana, y lo hace sobre un modelo base reciente de la familia Flux. No obstante, la ausencia de datos tecnicos, benchmarks y licencia explicita limita seriamente su evaluacion para entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un transformer de difusion Flux2-Klein-9B |
| Parametros totales | no disponible (el adaptador pesa 332 MiB en safetensors; el modelo base es de ~9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`tang-效转平-klein-v1.0.safetensors`) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. Se aplica sobre Flux2-Klein-9B, un modelo de difusion de la familia Flux orientado a generacion de imagenes, del que no se detallan en la informacion disponible ni la arquitectura interna exacta, ni el numero de tokens de entrenamiento, ni la composicion del dataset. El tamano del adaptador (332 MiB) es consistente con un LoRA de rango moderado sobre un backbone de ~9B de parametros.

El entrenamiento se ha realizado presuntamente en la plataforma RunningHub (la model card enlaza a su servicio de entrenamiento), con el objetivo especifico de aprender la transformacion "vista aerea o render en perspectiva -> planta 2D". No se documenta si se emplearon tecnicas como RLHF, DPO, captions estructurados o pares imagen-imagen alineados. Tampoco se especifica la resolucion de entrenamiento ni el numero de pasos.

## Capacidades

- Generacion de imagenes condicionada por texto (pipeline text-to-image) mediante el modelo base Flux2-Klein-9B.
- Conversion de vistas aereas o renders en perspectiva de edificaciones en plantas o layouts bidimensionales, que es la funcion declarada del LoRA.
- Uso dentro de flujos de ComfyUI como nodo LoRA sobre el modelo base correspondiente.
- Ejecucion en la plataforma RunningHub, tanto en la version internacional como en la china, y a traves de su API.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada arbitraria, audio ni modo "thinking"; se trata de un modelo puramente generativo de imagen.

## Casos de uso

- Reversion de renders a planta para estudios de arquitectura: a partir de una vista aerea generada o renderizada de una vivienda, el LoRA produce un layout 2D aproximado que sirve como borrador para el arquitecto, evitando redibujar manualmente la distribucion.
- Iteracion rapida en fase conceptual: el disenador puede generar varias vistas aereas con el modelo base y, con este LoRA, obtener plantas alternativas para comparar distribuciones antes de comprometer el diseno definitivo.
- Documentacion de proyectos inmobiliarios: convertir imagenes de promocion (renders aereos) en esquemas de planta para fichas comerciales o presentaciones, siempre con revision humana posterior.
- Reconstruccion aproximada de planos a partir de imagenes de satelite o drones de baja altura, util en tareas de inventario o preanalisis urbanistico.
- Prototipado en pipelines de ComfyUI: integrar el LoRA como paso intermedio en un grafo que genere la vista aerea, la convierta en planta y aplique despues un modelo de upscaling o de edicion.
- Experimentacion en investigacion sobre traduccion entre representaciones visuales (3D/perspectiva a 2D/ortogonal), usando el adaptador como punto de partida para estudiar la calidad de la inversion geometrica.
- Demostraciones y formacion: ilustrar en talleres de arquitectura como un modelo generativo interpreta la relacion entre volumen y planta, con la salvedad de que el resultado no es un plano tecnico utilizable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 332 MiB en disco, pero requiere cargar el modelo base Flux2-Klein-9B (~9B de parametros) para funcionar.
- VRAM estimada: no disponible de forma oficial; en funcion del modelo base, un backbone de ~9B en difusion suele requerir del orden de 16-24 GB en precision reducida, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion; por el tamano del modelo base, se situaria en la gama de A100, H100 o RTX 4090 y superiores, sin confirmacion oficial.
- Compatibilidad con GPU de consumo: no confirmada; probablemente viable en GPUs de 24 GB con cuantizacion, pero no hay datos en la model card.
- Opciones de despliegue: ComfyUI (soporte nativo segun los tags), plataforma RunningHub (internacional y china) y su API. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-tang-klein-v1.0-lora | LoRA sobre Flux2-Klein-9B | Adaptador 332 MiB; base ~9B | no disponible | no disponible | Hugging Face, RunningHub, ComfyUI |
| Flux.1-dev (referencia de la familia) | Difusion text-to-image | ~12B | no aplica | no comercial (segun version) | Hugging Face |
| SDXL + LoRAs de arquitectura | Difusion text-to-image | ~2,6B base | no aplica | abierta (CreativeML) | Hugging Face, ComfyUI |
| ControlNet para planos (familia SD/Flux) | Adaptador condicional | variable | no aplica | depende del base | Hugging Face |

No se dispone de datos de rendimiento comparativo del LoRA frente a estas alternativas. La comparativa se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- No se especifica licencia: la model card remite a la del proyecto original o upstream, lo que impide confirmar si el uso comercial esta permitido. Es un riesgo relevante para produccion.
- El modelo base es Flux2-Klein-9B; las restricciones de licencia de ese modelo (no detalladas aqui) se heredan y condicionan el uso del LoRA.
- Tarea extremadamente especializada: fuera de la conversion vista aerea -> planta, el adaptador puede degradar la calidad o el estilo del modelo base.
- Riesgo de alucinacion geometrica: las plantas generadas pueden contener distribuciones plausibles pero incorrectas (muros inexistentes, huecos, escalas incoherentes); no son planos tecnicos validos sin revision profesional.
- Ausencia total de benchmarks, evaluaciones cualitativas o ejemplos comparativos en la model card, lo que impide estimar su fiabilidad.
- No hay informacion sobre sesgos, idiomas de los prompts ni robustez ante entradas fuera de distribucion (por ejemplo, vistas aereas de edificios no residenciales).
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.
- Fecha de creacion indicada como 2026-11-04, posterior a la mayoria de referencias conocidas; conviene verificar la vigencia del modelo base Flux2-Klein-9B antes de integrarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RunningHubAI/rh-tang-klein-v1.0-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2042848986775687170
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1906623725523906562
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model

# RunningHubAI/rh-z-image-glamorous-black-bodysuit-look-deep-v-halter-top-with-tight-leggings-and-patent-h-lora

## Resumen

`rh-z-image-glamorous-black-bodysuit-look-deep-v-halter-top-with-tight-leggings-and-patent-h-lora` es un adaptador LoRA de text-to-image publicado por RunningHubAI para el modelo base Z-Image. Su funcion es incorporar al modelo base un concepto visual muy concreto: un look de body negro con top halter de cuello profundo en V, leggings ajustados y detalles de charol. No es un modelo fundacional, sino un peso adicional de 81 MiB que se carga junto al checkpoint base para condicionar la generacion de imagenes hacia ese concepto.

El repositorio tiene un tamano total de 0,1 GB y esta orientado al ecosistema ComfyUI, con soporte tambien en la plataforma RunningHub. La model card indica que el adaptador se ha afinado a partir de Z-Image y que esta pensado para variantes turbo de Z-Image, con una fuerza de LoRA recomendada de 1.0 o superior.

La relevancia de esta ficha es limitada fuera de su nicho: se trata de un LoRA de concepto, sin datos publicados de benchmarks, sin licencia explicita y con cero descargas y likes en el momento de la consulta. Resulta util para flujos de generacion de moda o personajes dentro de ComfyUI, pero no debe evaluarse como un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo base Z-Image (text-to-image) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts en el ecosistema del modelo base) |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`20261102-07065657.safetensors`, 81 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango aplicado sobre Z-Image, un modelo de difusion text-to-image. El repositorio no detalla la arquitectura interna del modelo base, el rango del adaptador ni la capa o modulos concretos sobre los que se aplican las matrices de bajo rango. La model card solo indica que el modelo esta afinado a partir de Z-Image y que se recomienda una fuerza de LoRA de 1.0 o superior, ademas de estar orientado a variantes turbo de Z-Image.

No se publican datos sobre el dataset de entrenamiento, el numero de pasos, la resolucion de las imagenes de entrenamiento, el uso de regularizacion o tecnicas como LoRA con rank variable, DoRA o entrenamiento con captions automaticos. Tampoco se documenta si hubo curacion del dataset o filtrado estetico. La unica palabra de activacion indicada es `NSFBBBB`, que debe incluirse en el prompt para activar el concepto.

## Capacidades

- Generacion de imagenes text-to-image condicionadas al concepto de body negro con top halter de cuello profundo en V, leggings ajustados y detalles de charol.
- Integracion como LoRA en flujos de ComfyUI, cargandose junto al checkpoint base Z-Image.
- Compatibilidad declarada con variantes turbo de Z-Image, lo que sugiere inferencia con pocos pasos.
- Uso de palabra de activacion (`NSFBBBB`) para inducir el concepto durante la generacion.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni multilingues, al no tratarse de un modelo de lenguaje.
- No se documenta soporte de inpainting, controlnet, img2img o edicion especifica mas alla del pipeline text-to-image declarado.

## Casos de uso

- Generacion de conceptos de moda: el LoRA permite producir variaciones de un look concreto (body, halter, leggings, charol) para moodboards o previsualizacion de diseno, usando ComfyUI con el checkpoint Z-Image turbo y fuerza 1.0 o superior.
- Creacion de personajes consistentes: al fijar un atuendo especifico, se puede mantener coherencia visual entre imagenes de un mismo personaje en una narrativa o serie, siempre que se combine con tecnicas de consistencia del modelo base.
- Ilustracion para ficcion o comic: el adaptador facilita escenas donde el vestuario es un elemento identificativo del personaje, reduciendo la necesidad de describir el atuendo en cada prompt.
- Prototipado rapido en estudios de diseno: permite iterar sobre variantes de un look (color, material, accesorios) sin reentrenar, simplemente ajustando el prompt y la fuerza del LoRA.
- Contenido para redes o editorial: generacion de imagenes de estilo editorial con un vestuario muy definido, integrable en pipelines de ComfyUI con upscaling y postprocesado.
- Pruebas de concepto en la plataforma RunningHub: el autor ofrece un workflow y una API para ejecutar el modelo en linea, util para evaluar el adaptador sin montar infraestructura local.
- Investigacion sobre personalizacion de modelos de difusion: sirve como ejemplo de LoRA de concepto muy estrecho para estudiar como afecta la fuerza del adaptador y la palabra de activacion a la fidelidad del concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA de forma aislada; depende del checkpoint base Z-Image y de la variante turbo utilizada.
- GPU recomendadas: no disponible. Al tratarse de un LoRA de 81 MiB, el requisito real lo marca el modelo base.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base y de la cuantizacion aplicada al mismo.
- Opciones de despliegue: ComfyUI (entorno principal declarado), plataforma RunningHub y su API. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de difusion de imagen en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-z-image-glamorous-black-bodysuit-look-...-lora | LoRA text-to-image sobre Z-Image | no disponible (peso de 81 MiB) | no aplica | no disponible | Hugging Face, RunningHub, ComfyUI |
| LoRA de concepto genericos para Z-Image | LoRA text-to-image | no disponible | no aplica | variable segun autor | Hugging Face, Civitai, ComfyUI |
| LoRA de concepto para otros modelos de difusion (p. ej. SDXL, Flux) | LoRA text-to-image | no disponible | no aplica | variable segun autor | Hugging Face, Civitai |

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparacion cuantitativa con alternativas. La comparacion disponible es unicamente estructural: se trata de un LoRA de concepto especifico, no de un modelo fundacional, por lo que su valor depende del modelo base Z-Image y del workflow en el que se integre.

## Limitaciones y advertencias

- La licencia no esta disponible de forma explicita; la model card remite a la licencia del proyecto original o upstream, lo que introduce incertidumbre para uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso ni validacion por parte de la comunidad.
- No se publican datos de entrenamiento, dataset, pasos ni evaluacion, lo que impide auditar sesgos o calidad del adaptador.
- El concepto esta muy acotado a un vestuario concreto; fuera de ese dominio el LoRA puede degradar la calidad o introducir artefactos si se aplica con fuerza alta.
- La palabra de activacion `NSFBBBB` es obligatoria para activar el concepto; omitirla puede producir resultados genericos.
- El contenido del concepto (body ajustado, halter) puede no ser apropiado para todos los contextos; conviene revisar las politicas de contenido de la plataforma de despliegue.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, manos deformes o incoherencias en el vestuario.
- No se documentan limitaciones de idioma en prompts, pero el modelo base Z-Image puede tener un rendimiento desigual segun el idioma; no hay datos al respecto.
- Dependencia total del modelo base Z-Image y de sus variantes turbo; cambios en el checkpoint base pueden alterar el comportamiento del LoRA.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-z-image-glamorous-black-bodysuit-look-deep-v-halter-top-with-tight-leggings-and-patent-h-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2117133831354884097
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1931299605898764290
- Workflow recomendado: https://www.runninghub.ai/post/1993873213671358466/?inviteCode=rh-v1220
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model

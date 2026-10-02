# RunningHubAI/rh-thick-thighs-save-lives-lora

## Resumen

rh-thick-thighs-save-lives-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI (RunningHub) en nombre del autor Henrique, distribuido a traves de Hugging Face y de la plataforma RunningHub. El repositorio contiene un unico fichero de pesos, `ThickThighsSaveLivesKrea.safetensors`, de 218 MiB, y esta etiquetado con el pipeline `image-text-to-image` y las etiquetas `comfyui`, `lora` y `region:us`, lo que indica que su uso previsto es la generacion y edicion de imagenes condicionada por texto dentro de flujos de ComfyUI.

El modelo se presenta como un ajuste fino derivado de `krea2` (indicado en la model card como "Finetuned from: krea2"), sin que se detallen en la informacion disponible ni la arquitectura concreta del modelo base, ni el numero de parametros, ni el dataset de entrenamiento, ni la licencia aplicable. No se trata de un modelo de lenguaje: no tiene ventana de contexto, no soporta tool calling y no esta pensado para tareas de razonamiento textual. Su funcion es actuar como modificador estilistico y de anatomia sobre un modelo base de difusion para generar o editar imagenes de figuras humanas.

La relevancia de esta ficha es principalmente practica: se trata de un adaptador muy ligero (menos de 250 MB), publicado en octubre de 2026, con cero descargas y cero valoraciones en el momento de la consulta, sin resultados de benchmarks y sin licencia declarada de forma explicita. Eso lo convierte en un caso tipico de LoRA comunitario de proposito estetico, util para experimentacion en ComfyUI pero con incertidumbre juridica y tecnica si se pretende integrar en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (adaptador LoRA; la arquitectura del modelo base `krea2` no se detalla en la informacion disponible) |
| Parametros totales | No disponible (fichero de pesos de 218 MiB; no se indica el numero de parametros) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de difusion de imagenes, no un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la interpretacion del prompt depende del modelo base) |
| Licencia | No disponible (la model card remite a la licencia del proyecto original o del modelo upstream) |
| Formato de pesos | safetensors (`ThickThighsSaveLivesKrea.safetensors`) |
| Tipo de modelo | LoRA de edicion de imagen (image edit) |
| Modelo base | krea2 |
| Tamano del repositorio | 0,2 GB (229 MB) |
| Tamano del fichero de pesos | 218 MiB |
| Pipeline declarado | image-text-to-image |
| Plataformas indicadas | ComfyUI, RunningHub, Hugging Face |
| Autor | RunningHub, en nombre de Henrique |
| Fecha de creacion | 2026-10-02 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura del adaptador ni del modelo base. La model card unicamente indica que se trata de un LoRA de edicion de imagen ("Model Type: LoRA (image edit)") afinado a partir de `krea2`, sin especificar si el base es un transformer de difusion (tipo DiT), un U-Net convolucional o un modelo hibrido, ni el rango, el alfa, el target de modulos o la estrategia de entrenamiento del adaptador.

Tampoco se documentan el numero de tokens o imagenes de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion (RLHF, DPO u otras, poco habituales en este tipo de adaptadores esteticos), ni hiperparametros como learning rate, resolucion de entrenamiento o numero de pasos. El unico dato cuantitativo verificable es el tamano del fichero de pesos, 218 MiB, coherente con un adaptador LoRA de rango moderado sobre un modelo base de gran tamano. Cualquier afirmacion adicional sobre su entrenamiento seria especulativa y no se incluye aqui.

## Capacidades

- Edicion y generacion de imagen condicionada por texto (`image-text-to-image`) mediante un adaptador LoRA sobre el modelo base `krea2`.
- Modificacion de atributos estilisticos y de anatomia de figuras humanas, segun se deduce del nombre del modelo y de su uso previsto como LoRA de estilo.
- Integracion en flujos de trabajo de ComfyUI, segun la etiqueta `comfyui` declarada.
- Ejecucion en la plataforma RunningHub, tanto en su version internacional como en la china, y mediante API.
- Compatibilidad potencial con pipelines de difusion que carguen adaptadores LoRA en formato safetensors (por ejemplo, mediante `diffusers` y `peft`), aunque esto no se confirma en la informacion disponible.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de codigo.
- No dispone de capacidades de audio, video ni vision por comprension: solo genera o edita imagenes.
- Capacidades multilingues: no disponibles; la comprension del prompt depende del codificador de texto del modelo base.

## Casos de uso

- Ilustracion de personajes para comics o novela grafica: el LoRA permite aplicar un estilo anatomico consistente a figuras femeninas dentro de un mismo proyecto, manteniendo coherencia visual entre paginas al fijar semilla y prompt en ComfyUI.
- Diseno de personajes para videojuegos indie: se puede usar como capa estilistica sobre el modelo base para explorar variaciones de silueta y proporcion corporal antes de modelar en 3D.
- Contenido para redes sociales y avatares: generacion rapida de imagenes estilizadas de figura completa con una estetica concreta, integrable en un pipeline automatizado de publicacion.
- Previsualizacion de vestuario y moda: combinado con inpainting sobre el modelo base, sirve para probar como cae una prenda sobre una silueta determinada antes de una sesion fotografica real.
- Estilizado por lotes en ComfyUI: el adaptador se puede encadenar en un workflow con ControlNet y upscalers para procesar un conjunto de imagenes base y homogeneizar su estilo.
- Experimentacion en plataformas gestionadas: al estar publicado en RunningHub con endpoint de API documentado, permite probar el LoRA sin disponer de GPU local, pagando por uso.
- Investigacion sobre adaptadores de bajo rango: su tamano reducido (218 MiB) lo hace util como caso de estudio para medir el efecto de un LoRA estetico sobre un base concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible para este adaptador en concreto. El consumo lo determina el modelo base `krea2`, cuyo tamano no se especifica en la informacion proporcionada.
- Estimacion orientativa (no confirmada por el autor): un LoRA de 218 MiB anade un coste marginal de VRAM sobre el base; en bases de clase FLUX o SDXL en precision fp16 el conjunto suele requerir del orden de 8 a 16 GB de VRAM, y menos de 8 GB si se aplican cuantizaciones del base. Estas cifras son una referencia general de la categoria, no un dato verificado para este modelo.
- GPU recomendadas: no disponible. Como referencia de categoria, GPU de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) para ejecucion local, y A100 o H100 para servicio en lote o alta concurrencia.
- Compatibilidad con GPU de consumo: probable en tarjetas de 8 a 12 GB o superiores si el base se carga cuantizado, aunque no confirmado por el autor.
- Opciones de despliegue: ComfyUI (indicado por el autor), plataforma RunningHub (local internacional y china), API de RunningHub y, potencialmente, `diffusers` con `peft` y otros frontends compatibles con LoRA en safetensors. No aplica vLLM, TGI, llama.cpp ni Ollama, que son runtimes de modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-thick-thighs-save-lives-lora (RunningHubAI) | LoRA de imagen | krea2 | 218 MiB | No disponible | Hugging Face, RunningHub |
| Thick Thighs Save Lives (TTSL) Style [Illustrious] (TensorHub Art) | LoRA de imagen | Illustrious | No disponible | No disponible | TensorHub Art |
| [KR2] Thick Thighs - Save Lives (TensorHub Art) | LoRA de imagen | KREA_2 | No disponible | No disponible | TensorHub Art |
| Thick Thighs Save Lives (TTSL) Style [Illustrious] (Civitai) | LoRA de imagen | Illustrious | No disponible | No disponible | Civitai |

Los tres modelos alternativos aparecen en los resultados de busqueda web y comparten tematica y, en uno de los casos, el mismo modelo base de la familia Krea, pero pertenecen a autores distintos y no se dispone de datos de rendimiento, parametros ni licencia que permitan una comparacion cuantitativa fiable con el modelo de esta ficha. No hay informacion publica sobre benchmarks comparativos entre ellos.

## Limitaciones y advertencias

- No se declara licencia. La model card indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o upstream, lo que deja el uso comercial en una situacion juridica indeterminada.
- El modelo base `krea2` no se especifica con detalle (version, variante, condiciones de uso), de modo que no se puede verificar que su licencia permita uso comercial o la redistribucion del adaptador.
- Sesgos conocidos: no documentados. Al ser un adaptador estetico centrado en la anatomia de figuras femeninas, puede amplificar sesgos de representacion corporal y de genero presentes en el dataset del modelo base.
- Riesgo de alucinacion: no aplica en el sentido textual, pero si existe riesgo de artefactos visuales tipicos de los LoRA de difusion: deformaciones de extremidades, proporciones incoherentes en poses complejas e inconsistencias en la interaccion con la ropa.
- Ausencia total de datos de validacion: cero descargas, cero valoraciones y cero resultados de benchmarks en el momento de la consulta, publicacion en octubre de 2026.
- Compatibilidad no verificada: no se confirma con que versiones concretas del modelo base, de ComfyUI o de `diffusers` funciona correctamente el fichero safetensors.
- No es un modelo de lenguaje: no debe utilizarse para tareas de texto, razonamiento, codigo ni agentes, y no dispone de ventana de contexto.
- No se documenta ninguna advertencia del autor sobre contenido sensible, filtros de seguridad ni moderacion, lo que traslada al usuario toda la responsabilidad sobre el uso final.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-thick-thighs-save-lives-lora
- Arbol de ficheros: https://huggingface.co/RunningHubAI/rh-thick-thighs-save-lives-lora/tree/main
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2093649130148085762
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2015535265380306946
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Modelo relacionado (TensorHub Art, base Illustrious): https://tensorhub.art/models/926712576044216187
- Modelo relacionado (TensorHub Art, base KREA_2): https://tensorhub.art/models/1022431418719934340/K2Thick-Thighs-Save-Lives
- Modelo relacionado (Civitai, base Illustrious): https://civitai.com/models/2092074/thick-thighs-save-lives-ttsl-style-illustrious

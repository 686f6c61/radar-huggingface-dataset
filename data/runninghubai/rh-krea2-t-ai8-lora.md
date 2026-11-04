# RunningHubAI/rh-krea2-t-ai8-lora

## Resumen

`rh-krea2-t-ai8-lora` es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en Hugging Face, derivado del modelo base `krea2`. No es un modelo de lenguaje ni un modelo fundacional completo: se trata de un conjunto de pesos auxiliares de 218 MiB (0,2 GB) que se cargan sobre un modelo generativo de imagen para modificar su comportamiento mediante la palabra de activacion `润`. El pipeline declarado es `image-text-to-image`, lo que indica que opera en flujos de generacion y edicion de imagen condicionados por texto e imagen de entrada.

El adaptador esta pensado para su uso dentro del ecosistema ComfyUI, RunningHub y Hugging Face, y su autoria corresponde al usuario de RunningHub `@Red gaga`, con RunningHub actuando como plataforma de publicacion. La model card es eminentemente comercial y promocional: enlaza a la API de RunningHub, a herramientas de generacion de imagen y video, y ofrece creditos de registro, pero apenas aporta informacion tecnica sobre el entrenamiento, los datos o las capacidades del LoRA.

Por su naturaleza (un LoRA de 218 MiB sobre un modelo de difusion de imagen), esta ficha describe un artefacto de personalizacion visual, no un modelo de razonamiento o generacion de texto. La informacion disponible es muy limitada y muchos de los parametros tecnicos habituales (parametros totales, contexto, cuantizacion, benchmarks) no aplican o no estan publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `krea2`; pipeline `image-text-to-image` |
| Parametros totales | no disponible (pesos LoRA de 218 MiB; el modelo base no se distribuye en este repo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un LoRA de imagen; la ventana depende del modelo base) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; las cuantizaciones dependen del modelo base y del runtime) |
| Idiomas soportados | no disponibles (la model card no declara idiomas; el prompt de texto depende del modelo base) |
| Licencia | no disponible explicitamente; la model card indica "Follow the original project or upstream license" y que el copyright permanece con el autor |
| Formato de pesos | safetensors (`朱元玉 红鸭子AI韩国分馆8号.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base `krea2` para especializar su comportamiento sin reentrenar todos los pesos. El pipeline declarado es `image-text-to-image`, propio de modelos de difusion (o de arquitecturas hibridas texto-imagen) que reciben una imagen de referencia y una instruccion textual para producir una imagen editada. El tamano del fichero (218 MiB) es coherente con un adaptador de rango moderado sobre un modelo de difusion de gran tamano.

No se dispone de informacion sobre el numero de pasos de entrenamiento, el dataset utilizado, la resolucion de entrenamiento, el rango del LoRA, el learning rate ni si se aplicaron tecnicas como regularizacion, dropout o captions automaticos. La model card solo indica que se ha afinado a partir de `krea2` y que la palabra de activacion es `润`. Tampoco se documenta si el entrenamiento se realizo en la propia plataforma RunningHub (la card enlaza a su pagina de entrenamiento, pero no confirma que este LoRA se haya producido alli).

## Capacidades

- Edicion de imagen condicionada por texto e imagen de entrada (pipeline `image-text-to-image`), segun la etiqueta del repositorio.
- Personalizacion de estilo o de sujeto mediante la palabra de activacion `润`, que debe incluirse en el prompt para activar el efecto del LoRA.
- Integracion con ComfyUI como nodo de carga de LoRA sobre el modelo base `krea2`.
- Uso a traves de la plataforma RunningHub y su API, segun los enlaces de la model card.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, vision analitica, audio ni modo de pensamiento; no aplican a este tipo de artefacto.
- No se especifican capacidades multilingues del prompt; dependen del codificador de texto del modelo base.

## Casos de uso

- Edicion de imagen en ComfyUI: cargar el LoRA sobre el modelo base `krea2` dentro de un grafo de ComfyUI y aplicar la palabra de activacion `润` para obtener la estilizacion o el sujeto aprendido, manteniendo el resto del pipeline de difusion.
- Prototipado de estilos visuales: usar el adaptador para explorar variaciones de un estilo concreto en un flujo de image-text-to-image antes de fijar una direccion creativa.
- Generacion de contenido para redes o marketing: producir variaciones de una imagen de referencia con el efecto del LoRA a traves de la API de RunningHub, sin necesidad de infraestructura propia.
- Automatizacion de lotes de imagenes: invocar el modelo mediante la API de RunningHub para generar conjuntos de imagenes con el mismo estilo de forma programatica.
- Pruebas de concepto de personalizacion: evaluar si un LoRA de bajo rango (218 MiB) sobre `krea2` ofrece suficiente control para un caso de edicion concreto antes de invertir en un fine-tuning completo.
- Experimentacion en investigacion de adaptadores: estudiar el efecto de un LoRA sobre un modelo de difusion y comparar su comportamiento con el modelo base sin el adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el LoRA de forma aislada; el consumo depende enteramente del modelo base `krea2` y de la resolucion de generacion. El adaptador en si ocupa 218 MiB en disco y se carga en memoria junto con el modelo base.
- GPU recomendadas: no disponibles. Para modelos de difusion de imagen de gran tamano suele requerirse una GPU con VRAM suficiente para el modelo base; no se confirma ninguna cifra.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base y de la precision de carga.
- Opciones de despliegue: ComfyUI (entorno declarado), plataforma RunningHub y su API. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a un LoRA de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA comparables ni datos del modelo base `krea2` (parametros, contexto, rendimiento o licencia), por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- La model card es fundamentalmente promocional y no documenta el dataset, el proceso de entrenamiento ni las limitaciones del adaptador.
- Licencia no declarada de forma explicita: se remite a la licencia del proyecto original o upstream; es imprescindible verificar la licencia de `krea2` antes de cualquier uso comercial.
- El uso del LoRA requiere el modelo base `krea2`, que no se incluye en este repositorio; sin el, el adaptador no es funcional.
- La palabra de activacion `润` es un caracter chino; conviene confirmar su comportamiento con el tokenizador del modelo base y con prompts en otros idiomas.
- Riesgo de sobreajuste o de artefactos visuales propios de los LoRA de bajo rango; no se documenta ninguna evaluacion de calidad.
- No hay informacion sobre sesgos, alucinacion visual ni comportamiento en dominios alejados de los datos de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- El nombre del fichero de pesos incluye caracteres no ASCII, lo que puede complicar la automatizacion de descargas y la integracion en algunos pipelines.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-t-ai8-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2112502820042076162
- Pagina del autor: https://www.runninghub.ai/user-center/2027638706101559298
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Publicacion relacionada: https://www.RunningHub.ai/zh-cn/post/2110636832210817025

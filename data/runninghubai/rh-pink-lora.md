# RunningHubAI/rh-pink-lora

## Resumen

rh-pink-lora es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face por RunningHubAI, la cuenta oficial de la plataforma RunningHub. A diferencia de un modelo base completo, se trata de un fichero de pesos auxiliares que se aplica sobre un modelo preentrenado para modificar su comportamiento, en este caso con fines de generacion de imagenes dentro de flujos de trabajo ComfyUI. El repositorio contiene un unico fichero safetensors de aproximadamente 1069 MiB (unos 1,1 GB), coherente con un adaptador de rango 128 sobre un modelo de difusion de gran tamano.

La model card es extremadamente escasa: no documenta arquitectura del modelo base, numero de parametros del adaptador, resolucion de entrenamiento, dataset utilizado ni proceso de entrenamiento. El unico dato tecnico relevante es que el adaptador se ha afinado a partir de `minimax-h3`, aunque no se especifica si se refiere al modelo de difusion de MiniMax ni que variante exacta. El nombre del fichero (`PinkCherry_NaughtyTimes-v2-rank128.safetensors`) sugiere un LoRA de estilo o concepto de la version 2, con rango 128.

Su relevancia es limitada fuera del ecosistema RunningHub/ComfyUI: no hay benchmarks, no hay licencia declarada, no hay idiomas y el repositorio no registra descargas ni likes en el momento de la consulta. Es, por tanto, un artefacto de nicho orientado a usuarios de esa plataforma que quieran reproducir un estilo visual concreto mediante un pipeline de generacion de imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base no especificado; la model card indica "Finetuned from: minimax-h3" |
| Parametros totales | no disponible (el fichero pesa 1069 MiB, pero no se declara el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuye unicamente en safetensors (presumiblemente fp16/bf16, no confirmado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card remite a "the original project or upstream license" sin concretar |
| Formato de pesos | safetensors (`PinkCherry_NaughtyTimes-v2-rank128.safetensors`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del adaptador mas alla de su naturaleza LoRA y del rango declarado en el nombre del fichero (128). Un LoRA de rango 128 sobre un modelo de difusion suele implicar un numero relativamente alto de parametros entrenables en comparacion con adaptadores de rango 4-16, lo que permite capturar conceptos o estilos mas complejos a costa de un fichero mas grande; el tamano de 1069 MiB es consistente con esa hipotesis, aunque no puede confirmarse sin inspeccionar las claves del safetensors.

El modelo base declarado es `minimax-h3`, presumiblemente un modelo de difusion de MiniMax, pero la model card no aporta detalles sobre la version, la resolucion de entrenamiento, el numero de pasos, el dataset, el uso de regularizacion, el optimizador ni si hubo tecnicas como LoRA con DreamBooth o fine-tuning supervisado clasico. Tampoco se documenta si el entrenamiento se realizo en la propia plataforma RunningHub (la model card incluye un enlace a su servicio de entrenamiento) ni si se aplicaron tecnicas de merge o de escala de pesos. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de imagenes condicionada por un LoRA de estilo o concepto, presumiblemente orientado a un estilo visual concreto ("PinkCherry") dentro de ComfyUI.
- Integracion en flujos de trabajo de ComfyUI mediante el nodo de carga de LoRA, aplicable sobre el modelo base `minimax-h3` (segun la model card).
- Compatibilidad declarada con la plataforma RunningHub, que permite cargar el adaptador y ejecutarlo en linea sin infraestructura propia.
- No se documentan capacidades de texto, razonamiento, codigo, matematicas, vision por comprension, tool calling, agentes, audio ni modo thinking; es un adaptador de generacion de imagenes, no un modelo de lenguaje.
- Capacidades multilingues: no disponibles (los prompts dependen del modelo base y del tokenizador de texto asociado, no del LoRA).
- No se especifican capacidades especiales adicionales (ControlNet, inpainting, IP-Adapter, etc.).

## Casos de uso

- Reproduccion de un estilo visual concreto en ComfyUI: cargar el LoRA sobre el modelo base `minimax-h3` y ajustar el peso del adaptador (tipicamente entre 0,6 y 1,0) para obtener imagenes con la estetica "PinkCherry" en flujos de generacion texto-a-imagen.
- Prototipado rapido en RunningHub: usar la plataforma en linea para probar el adaptador sin instalar dependencias locales, util para validar si el estilo encaja antes de integrarlo en un pipeline propio.
- Generacion de variaciones de personaje o concepto: al ser un LoRA de rango 128, puede emplearse para mantener consistencia visual en series de imagenes (por ejemplo, ilustraciones de un mismo personaje en distintas poses o escenas).
- Integracion en pipelines de diseno grafico: usar el adaptador como capa de estilo en la generacion de banners, ilustraciones o material promocional dentro de un flujo ComfyUI automatizado.
- Experimentacion artistica: combinar el LoRA con otros adaptadores (por ejemplo, LoRA de composicion o de iluminacion) para explorar mezclas de estilo, siempre que el modelo base lo permita.
- Investigacion sobre LoRA de alto rango: el fichero (rango 128, ~1 GB) puede servir como caso de estudio para comparar el efecto del rango en la fidelidad del estilo frente a adaptadores de rango bajo, aunque requeriria acceso al dataset y a la configuracion de entrenamiento, que no se publican.
- Evaluacion de compatibilidad de ecosistema: probar el adaptador en distintas versiones de ComfyUI y del modelo base para detectar incompatibilidades de claves o de escala, un caso de uso practico para equipos que mantienen pipelines de generacion de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa; depende enteramente del modelo base `minimax-h3`, cuyo tamano no se especifica. El adaptador en si ocupa 1069 MiB en disco y debe residir en VRAM junto con el modelo base durante la inferencia.
- GPU recomendadas: no disponible; al desconocerse el modelo base no puede estimarse si requiere una GPU de datacenter (A100, H100) o si cabe en tarjetas de consumo.
- Compatibilidad con GPU de consumo: no confirmada. Un LoRA de ~1 GB es manejable en cualquier GPU moderna, pero el cuello de botella sera el modelo base, no el adaptador.
- Opciones de despliegue: ComfyUI (declarado en los tags), RunningHub (plataforma del autor, con API y ejecucion en linea) y, presumiblemente, cualquier runtime que cargue safetensors y soporte LoRA sobre el modelo base, como diffusers. No se documenta soporte para llama.cpp, Ollama, vLLM ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-pink-lora | LoRA sobre minimax-h3 | no disponible (fichero 1069 MiB, rango 128) | no aplica | no disponible | Hugging Face + RunningHub |
| Alternativas de LoRA para ComfyUI | LoRA sobre modelos de difusion | variable (tipicamente 10-200 MB en rango bajo; hasta ~1 GB en rango alto) | no aplica | variable segun autor | Civitai, Hugging Face |
| Modelos base de difusion (p. ej. SDXL, FLUX) | Modelo completo | miles de millones | no aplica | variable | Hugging Face, ComfyUI |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoria (mismo modelo base y mismo estilo), ya que no se publican benchmarks ni se identifica el modelo base exacto. La comparativa anterior es meramente cualitativa.

## Limitaciones y advertencias

- La model card no declara licencia explicita; remite a "the original project or upstream license", lo que genera incertidumbre legal para uso comercial. Es imprescindible verificar la licencia del modelo base `minimax-h3` antes de cualquier despliegue productivo.
- No se documenta el dataset de entrenamiento, por lo que no puede evaluarse el riesgo de sesgos, de sobreajuste al estilo ni de memorizacion de imagenes con derechos de autor.
- El nombre del fichero ("NaughtyTimes") sugiere contenido potencialmente adulto o sensible; conviene revisar las politicas de contenido de la plataforma y del modelo base antes de usarlo en productos dirigidos al publico general.
- Al ser un LoRA, su calidad y comportamiento dependen criticamente de la version exacta del modelo base; una actualizacion del modelo base puede degradar o romper la compatibilidad de las claves del adaptador.
- No hay informacion sobre resolucion de entrenamiento ni sobre el rango de pesos recomendado; usar pesos fuera del rango esperado puede producir artefactos o sobreestilizacion.
- Ausencia total de benchmarks, evaluaciones cualitativas y ejemplos en la model card: no es posible estimar su rendimiento relativo frente a otros LoRA de estilo.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.
- No se garantiza soporte a largo plazo: el autor publica bajo la plataforma RunningHub y no se indica mantenimiento ni versionado del adaptador.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-pink-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2086729871997743105
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1986078446017196033
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (en): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (zh): https://www.runninghub.cn/runninghub-api-doc-cn/
- Servicio de entrenamiento de RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-pink-lora/blob/main/README_cn.md

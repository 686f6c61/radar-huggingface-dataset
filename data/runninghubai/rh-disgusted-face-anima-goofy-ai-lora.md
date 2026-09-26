# RunningHubAI/rh-disgusted-face-anima-goofy-ai-lora

## Resumen

rh-disgusted-face-anima-goofy-ai-lora es un adaptador LoRA de bajo rango publicado por la cuenta RunningHubAI en Hugging Face, con autoría atribuida al usuario @nullnull de RunningHub. El adaptador se ha entrenado a partir del modelo base "anima" y su función es inyectar una expresion facial concreta (rostro de asco o disgusto) y un acabado de sombreado marcado en el rostro dentro de flujos de generacion de imagenes anime. Se distribuye como un unico fichero de pesos `disgusted_face_anima_goofy.safetensors` de 44 MiB, lo que confirma que se trata de un delta de pesos y no de un checkpoint completo.

El modelo se enmarca en el ecosistema de ComfyUI y de la propia plataforma RunningHub, que actua como anfitriona tanto del entrenamiento como de la inferencia en la nube. Las palabras de activacion declaradas son "disgusted face" y "shaded face", y la propia model card recomienda aplicar el LoRA con un peso entre 0,7 y 1,0, complementarlo con un paso de ADetailer para rostros y reescalar la salida mediante img2img y un upscaler 4x-ultra sharp.

Su relevancia es acotada y muy especializada: no es un modelo de proposito general ni un modelo de lenguaje, sino un recurso de estilo y expresion para pipelines de difusion. Encaja en el patron habitual de LoRAs de expresion publicados en plataformas como Civitai o Tensor.art (el autor mantiene alli su catalogo principal), donde este tipo de adaptadores se usa para conseguir control fino de emociones sin reentrenar el checkpoint base completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base "anima"; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (no se publica rango, alpha ni numero de modulos adaptados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes, no de texto) |
| Tipos de cuantizacion | no disponible; el unico artefacto publicado es un `.safetensors` de 44 MiB |
| Idiomas soportados | no disponibles; las palabras de activacion estan en ingles |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (fichero `disgusted_face_anima_goofy.safetensors`) |
| Tamano del repositorio | 0,0 GB segun la ficha de Hugging Face; 44 MiB el fichero de pesos |
| Plataformas soportadas | ComfyUI, RunningHub, Hugging Face |
| Palabras de activacion | `disgusted face`, `shaded face` |
| Peso recomendado del LoRA | 0,7 a 1,0 (segun la model card) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del adaptador ni la del modelo base. Por los tags del repositorio (`comfyui`, `lora`) y por el flujo de uso descrito en la model card, se trata de un adaptador LoRA aplicado sobre un modelo de difusion para generacion de imagenes, integrado en el grafo de nodos de ComfyUI. El campo "Finetuned from: anima" es el unico dato de procedencia que aporta el autor; no se especifica si "anima" es un checkpoint anime de SD 1.5, SDXL, ilustrious u otra familia, ni la version concreta utilizada.

Tampoco se publican datos sobre el entrenamiento: no hay numero de imagenes, numero de pasos, composicion del dataset, resolucion de entrenamiento, learning rate, dimension del rango, ni si hubo regularizacion mediante captions o uso de tecnicas como DreamBooth. La model card unicamente indica que el modelo se ha entrenado en la infraestructura de RunningHub, ofrece un enlace a su servicio de entrenamiento y menciona que el encargo original se realizo como comision privada a traves de Fiverr. No consta ninguna innovacion tecnica declarada mas alla del propio ajuste de una expresion facial concreta.

## Capacidades

- Generacion de imagenes con expresion facial de asco o disgusto, activada mediante la palabra clave "disgusted face".
- Aplicacion de un acabado de sombreado facial intenso, controlado por la palabra clave "shaded face".
- Composicion de ambas capacidades en una misma generacion, ya que la model card indica usar las dos palabras de activacion.
- Integracion como nodo LoRA en flujos de ComfyUI, combinable con otros adaptadores y con el checkpoint base.
- Control de intensidad del efecto mediante el peso del LoRA, con un rango recomendado de 0,7 a 1,0.
- Refinado posterior de rostros mediante ADetailer, segun la recomendacion del propio autor.
- Mejora de resolucion mediante img2img upscale y el upscaler 4x-ultra sharp.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision por computador ni procesamiento de lenguaje natural: es un adaptador de imagen, no un modelo de lenguaje.
- No se documentan capacidades multilingues mas alla del uso de prompts en ingles.

## Casos de uso

- Ilustracion de personajes anime: el LoRA permite generar retratos con una expresion de disgusto consistente, util para producir variaciones de un mismo personaje con una emocion concreta sin reentrenar el checkpoint base.
- Creacion de hojas de expresiones para personajes: partiendo de un diseno ya fijado con el modelo "anima", se puede anadir esta emocion al repertorio y generar sets de caras para fichas de personaje, comics o novelas visuales.
- Storytelling visual y webcomics: en escenas donde un personaje debe reaccionar con rechazo, el adaptador evita tener que describir la expresion con prompt engineering extenso y reduce la varianza entre paneles.
- Contenido para redes sociales y avatares: generacion de imagenes de perfil o posts con una emocion marcada, usando el flujo img2img upscale para obtener salidas de mayor resolucion listas para publicar.
- Prototipado rapido en ComfyUI: al ser un fichero de 44 MiB, cargarlo y descargarlo es inmediato, lo que lo hace comodo para probar variaciones de estilo dentro de un grafo de nodos ya montado.
- Produccion por lotes en plataforma gestionada: al estar alojado en RunningHub, se puede ejecutar mediante su API sin montar infraestructura propia, con el LoRA aplicado de forma consistente sobre el modelo base.
- Ilustracion de escenas narrativas con contraste emocional: combinado con otros LoRAs de expresion, permite construir una escena con varios personajes donde solo uno muestra asco, manteniendo el resto del estilo del checkpoint.
- Encargos de ilustracion personalizados: dado que el modelo nace de una comision privada, es directamente utilizable en encargos donde el cliente pide una emocion especifica sobre un personaje concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, comparativas cualitativas medidas ni ningun otro tipo de evaluacion cuantitativa, y tampoco aporta datos de latencia o throughput. Al tratarse de un adaptador de estilo y expresion, las metricas habituales en modelos de lenguaje (MMLU, HumanEval, GSM8K) no son aplicables.

## Requisitos de hardware

- El adaptador en si ocupa 44 MiB en disco y anade un incremento de VRAM minimo durante la inferencia, en el orden de decenas a pocos cientos de megabytes segun como se fusione con el modelo base; el coste real lo determina el checkpoint "anima" sobre el que se aplique.
- VRAM estimada de inferencia: no disponible para este modelo. Depende por completo del modelo base, cuyo tipo (SD 1.5, SDXL u otra familia) no se especifica en la informacion disponible.
- GPU recomendadas: no disponibles. Como referencia general del ecosistema de difusion, los checkpoints de la familia SD 1.5 suelen ejecutarse en GPUs consumer de 6-8 GB de VRAM y los de la familia SDXL en el rango de 8-12 GB, pero esta horquilla no puede confirmarse para el modelo base "anima" con los datos publicados.
- Compatibilidad con GPU consumer: no confirmada. Un LoRA de 44 MiB es compatible con cualquier GPU que pueda ejecutar el modelo base, pero no se dispone de la ficha tecnica de dicho base.
- Opciones de despliegue: ComfyUI (entorno principal indicado por el autor), la plataforma en la nube RunningHub y su API, y Hugging Face como repositorio de distribucion. No se documenta soporte explicito para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano del artefacto | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-disgusted-face-anima-goofy-ai-lora | LoRA de expresion facial sobre "anima" | 44 MiB | no aplica | no disponible | no disponible | Hugging Face, RunningHub |
| Alternativas especificas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de nombres, fichas ni datos verificables de otros LoRAs comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion numerica rigurosa. A nivel de categoria, la alternativa generica a un LoRA de expresion seria un textual inversion (habitualmente mas ligero pero con menor fidelidad estructural) o un finetune completo del checkpoint (mucho mas pesado, en el rango de gigabytes, y con mayor riesgo de sobreajuste al estilo), pero no se aportan datos concretos de ninguno de estos enfoques en este caso.

## Limitaciones y advertencias

- No se publica licencia. La model card indica que RunningHub publica el modelo en nombre del autor, que el copyright permanece en el autor y que hay que seguir la licencia del proyecto original o upstream. Sin conocer esa licencia, no hay garantia de uso comercial.
- El repositorio registra 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- El modelo base "anima" no se identifica con version ni familia, lo que impide reproducir con exactitud las condiciones de entrenamiento y puede provocar incompatibilidades con otros checkpoints.
- No se publican parametros de entrenamiento (rango, alpha, dataset, pasos), por lo que no es posible auditar el ajuste ni replicarlo.
- Riesgo de sobreajuste al estilo del encargo original: al tratarse de una comision privada, el LoRA puede arrastrar rasgos del personaje o del conjunto de imagenes de entrenamiento y filtrarlos en generaciones no deseadas.
- Riesgo de deformaciones faciales y artefactos cuando se combina con pesos altos o con otros LoRAs; el propio autor recomienda mantenerse en el rango 0,7-1,0 y aplicar ADetailer para corregir rostros.
- Dependencia de las palabras de activacion en ingles ("disgusted face", "shaded face"); prompts en otros idiomas pueden no activar el efecto.
- Sin datos de sesgo, sesgos conocidos ni evaluacion etica disponibles.
- No es un modelo de lenguaje: no debe evaluarse ni desplegarse para tareas de texto, razonamiento, codigo o tool calling.
- Uso en produccion condicionado a la plataforma: la via documentada de ejecucion gestionada es RunningHub, lo que introduce dependencia de un proveedor externo.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-disgusted-face-anima-goofy-ai-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2091088305852325889
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2007154923476885506
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Catalogo del autor en Tensor.art: https://tensor.art/u/597010577386112018
- Servidor de Discord del autor: https://discord.gg/waSD943d2R
- Perfil de Fiverr del encargante: https://www.fiverr.com/users/ashrafulalam03
- README en chino: https://huggingface.co/RunningHubAI/rh-disgusted-face-anima-goofy-ai-lora/blob/main/README_cn.md

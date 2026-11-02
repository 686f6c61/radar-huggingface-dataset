# RunningHubAI/rh-qwen8090-lora

## Resumen

`rh-qwen8090-lora` es un adaptador LoRA de tipo text-to-image publicado por RunningHubAI y entrenado por el usuario de la plataforma RunningHub conocido como "虾仁不瞎". No es un modelo base completo, sino un ajuste fino de bajo rango sobre el modelo de generacion de imagenes Qwen-image, orientado a producir representaciones de personajes urbanos de las decadas de 1980 y 1990. El repositorio contiene un unico archivo de pesos de 450 MiB (`qwen_8090_6.safetensors`), lo que es coherente con un adaptador LoRA y no con un modelo completo.

El interes practico del artefacto es acotado y muy especifico: sirve para incorporar un estilo estetico concreto (estetica urbana retro de los 80 y 90) a un pipeline de generacion de imagenes basado en Qwen-image dentro de ComfyUI o de la propia plataforma RunningHub. La model card es extremadamente escueta: no documenta composicion del dataset de entrenamiento, hiperparametros, rango del LoRA ni resultados cualitativos o cuantitativos. El repositorio registra cero descargas y cero likes en el momento de la consulta, y su licencia no esta declarada de forma explicita.

Para un desarrollador o investigador, la relevancia es la de un recurso de estilo de nicho: util si ya se trabaja con Qwen-image y se necesita un look retro urbano consistente, pero sin garantias documentadas de calidad, licencia o reproducibilidad. No sustituye ni compite con un modelo base de generacion de imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Qwen-image; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (el repositorio solo contiene pesos LoRA; el archivo pesa 450 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el trigger word esta en chino: "1980年代和1990年代都市人物") |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`qwen_8090_6.safetensors`, 450 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Qwen-image para modificar su comportamiento generativo sin reentrenar todos los pesos. La model card indica explicitamente "Finetuned from: Qwen-image", pero no especifica la version concreta del modelo base, el rango del LoRA, las capas objetivo ni la estrategia de entrenamiento empleada. El nombre del archivo (`qwen_8090_6.safetensors`) sugiere, sin confirmacion documental, una sexta iteracion o version del adaptador.

No hay informacion sobre el dataset de entrenamiento: ni numero de imagenes, ni resolucion, ni composicion, ni si se aplicaron tecnicas de regularizacion o captioning. Tampoco se documenta si hubo etapas de RLHF, DPO o cualquier otro ajuste posterior. El entrenamiento se realizo presumiblemente en la plataforma RunningHub, que ofrece servicios de entrenamiento de modelos y aparece enlazada en la propia model card, pero no se aportan hiperparametros ni curvas de perdida.

## Capacidades

- Generacion de imagenes de personajes urbanos ambientados en las decadas de 1980 y 1990, activada mediante el trigger word "1980年代和1990年代都市人物".
- Aplicacion de un estilo estetico retro urbano sobre el modelo base Qwen-image.
- Integracion en flujos de trabajo de ComfyUI como nodo LoRA sobre el modelo base correspondiente.
- Ejecucion en la plataforma RunningHub, tanto en su version internacional como en la china.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking, por tratarse de un adaptador de generacion de imagenes y no de un modelo de lenguaje.
- Capacidades multilingues: no documentadas; el unico texto de activacion conocido esta en chino.

## Casos de uso

- Ilustracion de epoca para editorial: generar retratos y escenas de personajes urbanos de los anos 80 y 90 para articulos, libros o reportajes sobre cultura urbana retro, usando el trigger word para forzar el estilo.
- Diseno de personajes para videojuegos o narrativa visual: producir variaciones consistentes de personajes con estetica de esas decadas como punto de partida para concept art.
- Creacion de contenido para redes sociales: generar imagenes tematicas de nostalgia ochentera y noventera dentro de un pipeline de ComfyUI automatizado.
- Prototipado rapido de moodboards: explorar direcciones visuales retro antes de encargar produccion a un ilustrador, aprovechando la velocidad de iteracion de un LoRA sobre Qwen-image.
- Pruebas de estilo en investigacion de generacion de imagenes: usar el adaptador como caso de estudio de personalizacion de estilo sobre un modelo base concreto y medir su efecto cualitativo.
- Integracion en flujos de trabajo de ComfyUI existentes: cargar el LoRA como nodo adicional en grafos que ya usan Qwen-image, sin cambiar el resto del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador en si; depende enteramente del modelo base Qwen-image, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base.
- Opciones de despliegue: ComfyUI (plataforma indicada en las etiquetas y en la model card), RunningHub (internacional y China) y, presumiblemente, cualquier runtime que cargue safetensors de LoRA sobre Qwen-image; no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-qwen8090-lora | LoRA sobre Qwen-image | no disponible (pesos de 450 MiB) | no disponible | no disponible | Hugging Face, RunningHub, ComfyUI |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores LoRA de estilo retro urbano sobre Qwen-image ni sobre sus metricas, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- La model card no documenta la licencia de forma explicita; solo indica que se siga la licencia del proyecto original o upstream, lo que introduce incertidumbre legal para uso comercial.
- No hay informacion sobre sesgos del adaptador ni sobre la composicion del dataset de entrenamiento, por lo que no se puede evaluar la representatividad demografica de los personajes generados.
- Riesgo de alucinacion visual y de artefactos propios de los LoRA de estilo: el adaptador puede forzar la estetica retro incluso cuando el prompt pide otra cosa, y puede degradar la coherencia cuando se combina con otros LoRA.
- El trigger word esta en chino; no se documenta si el adaptador responde igual de bien a prompts en otros idiomas.
- El repositorio registra cero descargas y cero likes, sin evidencia de validacion por parte de la comunidad.
- No se especifica la version concreta de Qwen-image sobre la que se entreno, lo que puede provocar incompatibilidades al cargarlo sobre otras versiones del modelo base.
- El tamano del repositorio (0.5 GB) y el archivo unico sugieren que no se incluyen ejemplos, configuraciones de entrenamiento ni scripts de inferencia.
- No apto como modelo de lenguaje: no soporta texto, codigo, matematicas ni tool calling.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen8090-lora
- Pagina del modelo original en RunningHub: https://www.runninghub.cn/model/public/1962072508457533442
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1895005037720719361
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model

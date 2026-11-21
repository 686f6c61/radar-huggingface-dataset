# RunningHubAI/rh-chengxiaoxiao2-krea2-lora

## Resumen

rh-chengxiaoxiao2-krea2-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI bajo el identificador `RunningHubAI/rh-chengxiaoxiao2-krea2-lora`. No se trata de un modelo de lenguaje ni de un modelo fundacional completo, sino de un conjunto de pesos de ajuste fino (un unico fichero `chengxiaoxiao2_000003000.safetensors` de 218 MiB) pensado para cargarse sobre el modelo base krea2 dentro de flujos de trabajo de ComfyUI. Su funcion declarada es la edicion de imagen guiada por texto (`image-text-to-image`) mediante la introduccion de un sujeto concreto identificado por palabras de activacion.

El modelo procede de la plataforma RunningHub, un entorno de entrenamiento y despliegue de modelos generativos, y su model card lo describe explicitamente como un artefacto "mainly used for testing", es decir, un ejemplo de prueba mas que un modelo de produccion. Las palabras de activacion son "程肖肖, 粉色长发, 一个年轻的女性" (nombre propio, pelo largo rosa y una mujer joven), lo que indica que el LoRA esta especializado en reproducir un personaje concreto.

Su relevancia es limitada fuera del ecosistema ComfyUI/RunningHub: no hay licencia declarada, no hay idiomas declarados, no hay benchmarks y el repositorio no registra descargas ni interacciones. Debe evaluarse como un adaptador de personaje para generacion/edicion de imagenes, no como un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2; no disponible el detalle de la arquitectura subyacente |
| Parametros totales | no disponible (pesos LoRA de 218 MiB en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | no disponibles (las palabras de activacion estan en chino) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`chengxiaoxiao2_000003000.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base krea2 para adaptar su comportamiento sin reentrenar todos los pesos. La model card no especifica que modulos del transformer de difusion se adaptan, ni el rango, ni el alpha del LoRA, ni el numero de pasos de entrenamiento (aunque el nombre del fichero, `000003000`, sugiere 3000 pasos). No se documentan datos de entrenamiento, composicion del dataset, ni si hubo tecnicas de regularizacion o captions automaticos.

La unica informacion de entrenamiento disponible es que el modelo se entreno en la plataforma RunningHub y que deriva de krea2. No hay datos sobre el proceso de ajuste, el numero de imagenes del personaje, la resolucion de entrenamiento ni la funcion de perdida. Cualquier afirmacion adicional sobre la arquitectura interna seria especulativa.

## Capacidades

- Edicion de imagen guiada por texto (`image-text-to-image`) dentro de ComfyUI y RunningHub.
- Introduccion de un sujeto concreto mediante palabras de activacion en chino: "程肖肖, 粉色长发, 一个年轻的女性".
- Especializacion en un personaje (mujer joven con pelo largo rosa), no en estilos genericos.
- Integracion como nodo LoRA en flujos de ComfyUI.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de texto, audio o video.
- No se documentan capacidades multilingues mas alla de las palabras de activacion en chino.

## Casos de uso

- Prototipado de personajes en ComfyUI: cargar el LoRA sobre krea2 para generar variaciones consistentes del personaje descrito por las palabras de activacion, util para explorar disenos antes de un entrenamiento mas serio.
- Pruebas de integracion de LoRA en pipelines de edicion de imagen: sirve como caso de test para validar la carga de safetensors, la sustitucion de pesos y el encadenamiento de nodos en ComfyUI.
- Generacion de material visual de marca o fan art: el LoRA permite reproducir un personaje concreto en distintas escenas y poses sin reentrenar el modelo base.
- Evaluacion comparativa de adaptadores de personaje: al ser un LoRA pequeno (218 MiB), es util para medir tiempos de carga y consumo de VRAM frente a otros adaptadores en la misma GPU.
- Demostraciones y tutoriales: la propia model card lo describe como modelo "mainly used for testing", por lo que encaja en ejemplos de formacion sobre entrenamiento de LoRA en RunningHub.
- Iteracion rapida de prompts en edicion de imagen: al no requerir reentrenamiento, permite probar combinaciones de prompt y palabras de activacion en minutos sobre el modelo base krea2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica; el LoRA en si ocupa 218 MiB, pero el consumo real lo determina el modelo base krea2 y la resolucion de imagen.
- GPU recomendadas: no disponibles en la informacion proporcionada; dependen del modelo base krea2.
- Compatibilidad con GPU de consumo: no confirmada; el LoRA es ligero, pero el modelo base condiciona si cabe en una RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: ComfyUI, plataforma RunningHub y Hugging Face como repositorio de pesos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-chengxiaoxiao2-krea2-lora | LoRA sobre krea2 | no disponible (218 MiB) | no aplica | no disponible | Hugging Face, RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros LoRA de personaje comparables en la documentacion proporcionada, por lo que no es posible establecer una comparativa con datos verificables.

## Limitaciones y advertencias

- La model card indica que el modelo es "mainly used for testing"; no esta pensado para produccion.
- No hay licencia declarada: el uso comercial queda sujeto a la licencia del proyecto original (krea2) y a la del autor, sin garantias claras.
- El repositorio no registra descargas ni likes, lo que sugiere ausencia de validacion por parte de la comunidad.
- Especializado en un unico personaje; su rendimiento fuera de ese dominio sera pobre.
- Las palabras de activacion estan en chino, lo que puede degradar resultados si se combinan con prompts en otros idiomas.
- No hay informacion sobre sesgos, alucinaciones visuales, artefactos o calidad de edicion.
- No se documentan requisitos de hardware ni compatibilidad con versiones concretas de ComfyUI o del modelo base.
- Riesgo de sobreajuste al personaje y de dificultad para generalizar a otras poses o iluminaciones, dado el caracter de prueba del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-chengxiaoxiao2-krea2-lora
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2123661089249714178
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2060529866612502530
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-chengxiaoxiao2-krea2-lora/blob/main/README_cn.md

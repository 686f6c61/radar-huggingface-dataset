# RunningHubAI/rh-pipi-krea2-emotion-lora

## Resumen

rh-pipi-krea2-emotion-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI, atribuido al autor PiPiAi (pipiai) y distribuido a traves de Hugging Face, ComfyUI y la propia plataforma RunningHub. No se trata de un modelo completo, sino de un ajuste fino de bajo rango (low-rank adaptation) pensado para aplicarse sobre el modelo base krea2 y modificar la expresion emocional de los rostros generados. Su funcion declarada es la edicion de imagen a partir de texto e imagen (pipeline image-text-to-image) dentro de flujos de ComfyUI.

El repositorio ocupa alrededor de 0,2 GB y contiene un unico archivo de pesos, `表情06.safetensors`, de 224 MiB, lo que confirma que es un adaptador ligero y no una red completa. La unica palabra de activacion documentada es `cute`, con un peso recomendado entre 0,5 y 0,9 y un valor optimo de 0,65, empleando el muestreador Euler con 8 pasos y un CFG scale de 1.0.

Su relevancia es practica mas que arquitectonica: permite anadir un control fino de emocion sobre el modelo base krea2 sin reentrenar el modelo completo, algo habitual en el ecosistema de generacion de imagenes con LoRA. La informacion publicada es minima y no incluye datos de entrenamiento, licencia explicita, benchmarks ni idiomas soportados, por lo que buena parte de sus especificaciones figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2 |
| Parametros totales | no disponible (unico dato objetivo: archivo de pesos de 224 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de generacion de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors sin cuantizaciones alternativas publicadas) |
| Idiomas soportados | no disponible (la unica palabra de activacion documentada, `cute`, esta en ingles) |
| Licencia | no disponible; la model card indica que los derechos permanecen con el autor y remite a la licencia del proyecto original o del modelo subyacente |
| Formato de pesos | safetensors (`表情06.safetensors`) |

## Arquitectura y entrenamiento

La informacion disponible describe el artefacto como un LoRA de edicion de imagen, es decir, un conjunto de matrices de bajo rango que se insertan en las capas del modelo base krea2 para adaptar su comportamiento sin modificar los pesos originales. El pipeline declarado es image-text-to-image, lo que implica que acepta una imagen de entrada y una instruccion textual, y devuelve una imagen editada. No se detalla la topologia interna del modelo base krea2 (transformer de difusion, variante de Flux u otra), el rango de las matrices LoRA, ni las dimensiones de las capas afectadas.

Tampoco se publican datos sobre el proceso de entrenamiento: numero de tokens o imagenes, composicion del dataset, uso de RLHF o DPO, ni hiperparametros de entrenamiento. La model card unicamente menciona que el modelo fue etiquetado con "Tutu's Super Intelligent Tagger" y entrenado con "Tutu's Super Trainer", herramientas de terceros, ademas de indicar que se recomienda combinarlo con el modelo base oficial de krea2. Los unicos parametros concretos que se aportan son de inferencia: palabra de activacion `cute`, peso 0,5-0,9 (optimo 0,65), muestreador Euler, 8 pasos y CFG scale 1.0.

## Capacidades

- Generacion y edicion de imagenes en el modo image-text-to-image, partiendo de una imagen de entrada y una instruccion textual.
- Control de la expresion emocional de los rostros mediante la palabra de activacion `cute`.
- Integracion nativa en flujos de trabajo de ComfyUI, plataforma para la que esta etiquetado el modelo.
- Uso en la plataforma RunningHub y en la version internacional y china del servicio.
- Ajuste de intensidad del efecto a traves del peso del LoRA (rango recomendado de 0,5 a 0,9).
- Ejecucion combinada con el modelo base krea2, del que depende para funcionar.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision adicional, audio ni modo de pensamiento, ya que no es un modelo de lenguaje.
- No se documentan capacidades multilingues en el prompt.

## Casos de uso

- Edicion de expresiones faciales en retratos: aplicar el LoRA sobre krea2 para transformar un rostro neutro en una expresion "cute" manteniendo la identidad de la persona, ajustando el peso entre 0,5 y 0,9 segun la intensidad deseada.
- Creacion de avatares y personajes: generar variantes emocionales consistentes de un mismo personaje para videojuegos, ilustracion o redes sociales, reutilizando la misma imagen base y variando el prompt.
- Flujos de trabajo en ComfyUI: incorporar el adaptador como nodo LoRA dentro de un grafo existente de generacion o retoque de imagen, aprovechando los parametros recomendados (Euler, 8 pasos, CFG 1.0).
- Automatizacion de edicion fotografica por lotes: procesar una coleccion de retratos para homogeneizar la expresion emocional antes de publicarlos o catalogarlos.
- Prototipado de conceptos para ilustracion y diseno: explorar rapidamente variaciones emocionales de un boceto o render antes de decidir una direccion artistica.
- Aumento de datos para entrenamiento: generar variaciones controladas de expresion sobre un conjunto de imagenes para ampliar un dataset de vision por computador, siempre que la licencia del modelo base lo permita.
- Personalizacion en plataformas de terceros: desplegar el LoRA a traves de la API de RunningHub para ofrecer edicion de emocion como servicio sin gestionar la infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si es muy ligero (224 MiB), por lo que la VRAM real depende casi por completo del modelo base krea2, cuyos requisitos no se detallan en la informacion proporcionada.
- La model card menciona el uso de una RTX 4090, aunque tambien alude de forma ambigua a "48G", cifra que no coincide con los 24 GB de VRAM de una RTX 4090, por lo que ese dato no debe tomarse como un requisito fiable.
- No se dispone de cifras oficiales de VRAM minima, GPU recomendadas, latencia ni throughput.
- Opciones de despliegue documentadas: ComfyUI, la plataforma RunningHub (sitio internacional y sitio chino) y la propia API de RunningHub.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano del repositorio | Palabra de activacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-pipi-krea2-emotion-lora | LoRA de edicion de imagen | krea2 | 0,2 GB (pesos de 224 MiB) | `cute` | no disponible | Hugging Face, RunningHub, ComfyUI |
| rh-pipi-krea2-lora | LoRA de imagen a texto-imagen | krea2 | 236 MB | no disponible | no disponible | Hugging Face, RunningHub |
| pipi-krea2-Emotion (V1, KREA 2) | LoRA de imagen | KREA 2 | no disponible | no disponible | no disponible | TensorHub Art, RunningHub |

Los tres artefactos parecen variantes o duplicados del mismo ajuste de emocion sobre krea2 publicados por el mismo autor a traves de distintas plataformas. No hay datos publicos de rendimiento que permitan establecer una comparacion cuantitativa entre ellos.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el modelo base krea2 para funcionar, y su calidad dependera del modelo base y de la version utilizada.
- No se publican sesgos conocidos, pero al tratarse de un ajuste sobre generacion de rostros y expresiones, hereda los sesgos del modelo base y del dataset de entrenamiento, que no se documenta.
- Riesgo de alucinacion visual y de artefactos propios de la generacion de imagen, especialmente con pesos altos del LoRA.
- Ausencia total de datos de entrenamiento, dataset y evaluacion, lo que impide auditar su comportamiento de forma rigurosa.
- La licencia no esta definida explicitamente: la model card indica que los derechos permanecen con el autor y remite a la licencia del proyecto original o del modelo subyacente, por lo que el uso comercial no esta garantizado y debe verificarse con el autor.
- No se documentan idiomas soportados en el prompt, y la palabra de activacion esta en ingles.
- La model card incluye abundante contenido promocional y enlaces de afiliacion (invitaciones a RunningHub, grupo de QQ, herramientas de terceros), por lo que conviene tratar esa informacion como material comercial y no como documentacion tecnica verificada.
- El archivo de pesos tiene un nombre en caracteres chinos (`表情06.safetensors`), lo que puede causar problemas de codificacion en algunos entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-pipi-krea2-emotion-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2096537214212964354
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1954484547733893121
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (en ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (en chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Modelo base krea2 en RunningHub: https://www.RunningHub.ai/zh-cn/model/public/2069334328856891394
- Variante rh-pipi-krea2-lora: https://huggingface.co/RunningHubAI/rh-pipi-krea2-lora
- Otra variante rh-pipi-krea2-lora: https://huggingface.co/RunningHubAI/rh-pipi-krea2-lora-2096528532380930050
- pipi-krea2-Emotion en TensorHub Art: https://tensorhub.art/models/1041102240703601924
- pipi-krea2-Emotion en RunningHub: https://www.runninghub.ai/model/public/2097248603323604993
- Flujo de edicion de vestuario krea2: https://www.RunningHub.cn/post/2081382750556348418
- Flujo de edicion de imagen unica krea2: https://www.RunningHub.cn/post/2081650003457691649
- Flujo de remezcla de imagen krea2 sin ingenieria inversa de prompt: https://www.RunningHub.cn/post/2081773404809682946
- Generacion texto a imagen con krea2 (internacional): https://www.RunningHub.ai/zh-cn/post/2070539933625962498
- Inferencia inversa de prompt sobre imagen krea2: https://www.RunningHub.ai/zh-cn/post/2071363127198965761
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model

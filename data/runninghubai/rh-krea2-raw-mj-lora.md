# RunningHubAI/rh-krea2-raw-mj-lora

## Resumen

rh-krea2-raw-mj-lora es un adaptador LoRA de estilo para generacion y edicion de imagenes, publicado por RunningHubAI (RunningHub) en nombre de la autora identificada como @星美AIGC. El adaptador se entrena sobre el modelo base krea2-raw y su objetivo declarado es reforzar un estilo concreto de fotografia de retrato de tematica wuxia (武侠) con una estetica oscura, de horror folclorico chino: novias vestidas con trajes rojos antiguos, ambientacion funebre, niebla, luz fria y composiciones muy contrastadas.

Se distribuye como un unico archivo safetensors de 224 MiB (`krea2-raw-MJ武侠风人像摄影_1.0.safetensors`) dentro de un repositorio de 0,2 GB, y esta pensado para cargarse en ComfyUI, en la propia plataforma RunningHub o desde Hugging Face mediante el pipeline `image-text-to-image`. No define palabras de activacion (trigger words): el estilo se invoca describiendo la escena con lenguaje natural en el prompt, y el propio autor recomienda un peso entre 0,2 y 1, 8 pasos de muestreo y los muestreadores Euler, Euler a o DPM++ 2M er_sde con planificador simple.

Su relevancia es practica mas que arquitectonica: es un ejemplo tipico de LoRA vertical de nicho publicado en un hub comercial, con documentacion minima (la model card esta mayoritariamente en chino), sin ficha de licencia explicita y sin resultados de benchmarks. Resulta util para quien necesite generar retratos de estilo wuxia oscuro con pocos pasos de inferencia, pero exige verificar la licencia del modelo base antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2-raw; arquitectura del modelo base no disponible |
| Parámetros totales | no disponible (archivo de pesos de 224 MiB; numero de parametros no documentado) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusion; no se documenta el limite de tokens de prompt del modelo base) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors y se combina con la cuantizacion que se aplique al modelo base |
| Idiomas soportados | no disponible; los ejemplos de prompt de la model card estan redactados en chino |
| Licencia | no disponible (publicado por RunningHub en nombre de la autora, con copyright de la autora; se indica seguir la licencia del proyecto original o aguas arriba) |
| Formato de pesos | safetensors (un unico archivo LoRA de 224 MiB) |

## Arquitectura y entrenamiento

El repositorio contiene unicamente pesos de un adaptador LoRA de edicion de imagen, destilado sobre el modelo base krea2-raw. Un LoRA de este tipo inyecta matrices de bajo rango en determinadas capas del backbone de difusion del modelo base, de modo que no sustituye al modelo original: se carga junto a el y modifica su comportamiento sin alterar el resto de pesos. En este caso el resultado buscado es un sesgo estilistico fuerte hacia el retrato wuxia de ambientacion oscura, con enfasis en textura de piel, composicion y direccion de luz. El rango, el alpha, las capas objetivo y la estrategia de entrenamiento no se documentan en la informacion disponible, por lo que se marcan como no disponibles.

Tampoco se especifican el numero de imagenes del dataset, la composicion del mismo, el numero de pasos de entrenamiento ni si se aplicaron tecnicas de ajuste adicionales. La model card unicamente indica que fue ajustado a partir de krea2, que no hay trigger words y que el entrenamiento puede realizarse en la propia plataforma RunningHub. El unico parametro de inferencia documentado es el rango de pesos recomendado (0,2 a 1), junto con 8 pasos de muestreo, muestreadores Euler, Euler a y DPM++ 2M er_sde, y planificador simple.

## Capacidades

- Generacion de imagenes a partir de texto (pipeline `image-text-to-image`), aplicando un estilo de retrato de tematica wuxia sobre el modelo base krea2-raw.
- Edicion y transferencia de estilo sobre imagenes existentes, al tratarse de un LoRA de edicion segun la propia clasificacion del autor.
- Reproduccion de una estetica concreta: trajes de novia tradicionales chinos en rojo, tocados con fengguan, ambientacion de horror folclorico, niebla, luz fria, velas y composiciones de alto contraste.
- Funciona sin trigger words: el estilo se activa mediante descripcion en lenguaje natural.
- Control de intensidad del estilo mediante el peso del LoRA (rango recomendado 0,2 a 1).
- Inferencia con pocos pasos: el autor recomienda 8 pasos, un valor bajo para modelos de difusion tipicos.
- Compatibilidad de carga en ComfyUI, en la plataforma RunningHub y desde Hugging Face.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso, codigo, matematicas, vision por comprension, audio ni modo de razonamiento: es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Concept art para videojuegos y cine de ambientacion wuxia o de terror folclorico: el LoRA produce directamente retratos de personaje con vestuario, atrezzo y atmosfera coherentes, reduciendo el trabajo de direccion de arte en fase de preproduccion.
- Ilustracion editorial para portadas de novela, relatos o podcasts de tematica fantastica y de terror: basta un prompt descriptivo en chino o en ingles para obtener una imagen de cubierta con iluminacion dramatica y composicion cerrada.
- Material grafico para moda y disfraces: el autor lo orienta explicitamente a muestras de modelos de e-commerce y material de personajes, de modo que puede emplearse para previsualizar vestuario de inspiracion historica antes de una sesion fotografica real.
- Fondos de pantalla y assets decorativos: el estilo pictorico y el contraste de luz lo hacen adecuado para wallpapers y material de ambientacion en resolucion alta, combinado con el modelo base y, si procede, con LoRAs de composicion.
- Prototipado rapido de direccion de fotografia: con 8 pasos y muestreadores Euler o DPM++ 2M er_sde, sirve para iterar decenas de variantes de encuadre y luz en pocos minutos antes de invertir en una sesion con fotografo.
- Composicion en cadena con otros LoRAs: al ser un adaptador de bajo rango, puede apilarse con LoRAs de pose, detalle de piel o composicion dentro de un flujo de ComfyUI, ajustando su peso entre 0,2 y 1 para evitar saturacion estilistica.
- Ilustracion de campanas de marketing de nicho (lanzamientos de juegos, eventos tematicos o editoriales independientes): permite generar un lote coherente de piezas con una identidad visual muy marcada sin entrenar un modelo propio.
- Creacion de datasets sinteticos de referencia: util para generar imagenes de estilo homogeneo que sirvan como referencia visual en briefings, moodboards o pruebas de concepto internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, comparativas humanas ni evaluaciones de adherencia al prompt), y los repositorios de LoRAs de estilo no suelen publicarlas.

## Requisitos de hardware

- Almacenamiento: el adaptador ocupa 224 MiB (repositorio completo de 0,2 GB), un coste despreciable en disco.
- VRAM: el requisito lo determina integramente el modelo base krea2-raw, cuyas especificaciones no estan disponibles. El LoRA anade un sobrecoste de aproximadamente 0,2 GB en precision de 16 bits, por lo que la huella adicional es marginal.
- GPU recomendadas: no disponible. La idoneidad de una RTX 4090, A100 o H100 depende del modelo base, no del adaptador; si krea2-raw cabe en una GPU de consumo, el LoRA no alterara sustancialmente ese requisito.
- Opciones de despliegue: ComfyUI (flujo nativo indicado por el autor), la plataforma en la nube RunningHub y carga directa desde Hugging Face. No se documenta soporte explicito para vLLM, TGI, llama.cpp u Ollama, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles. El unico dato indirecto es la recomendacion de 8 pasos de muestreo con planificador simple, un valor bajo que sugiere tiempos de generacion reducidos en comparacion con flujos de 20 a 30 pasos, pero no hay medidas publicadas.
- Memoria del sistema: no disponible; dependera del backend de difusion y de la resolucion de salida.

## Comparativa con modelos similares

No se dispone de comparativas verificables en la informacion proporcionada. Los LoRAs de estilo son adaptadores especificos de un modelo base y sus numeros no son trasladables entre familias, por lo que una tabla con cifras de terceros careceria de base.

| Modelo | Tipo | Modelo base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2-raw-mj-lora | LoRA de estilo para imagen | krea2-raw | no disponible | no disponible | Hugging Face, ComfyUI, RunningHub |
| LoRA de estilo alternativo para krea2-raw | LoRA de estilo para imagen | krea2-raw | no disponible | no disponible | no disponible en la informacion proporcionada |
| LoRA de estilo para otras familias de difusion (por ejemplo SDXL o FLUX) | LoRA de estilo para imagen | distinto del anterior | no disponible | depende del modelo base | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia no disponible: el repositorio indica que RunningHub lo publica en nombre de la autora, que el copyright permanece en ella y que debe seguirse la licencia del proyecto original o aguas arriba. Sin esa licencia explicita no puede garantizarse el uso comercial.
- Sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta, por lo que no existen evaluaciones independientes de calidad, estabilidad ni fidelidad al prompt.
- Documentacion minima y en chino: la model card esta mayoritariamente en chino, sin ficha tecnica de entrenamiento (rango, alpha, capas objetivo, dataset, pasos) ni ejemplo de prompt en otros idiomas.
- Modelo muy especializado: esta optimizado para un unico nicho estetico y puede degradar o sesgar generaciones fuera de ese estilo si se mantiene activo con pesos altos.
- Dependencia del modelo base: la calidad final, la resolucion nativa y los requisitos de VRAM vienen determinados por krea2-raw, cuyas caracteristicas no se documentan en este repositorio.
- Riesgo de artefactos tipicos de los LoRAs de estilo: saturacion de color, perdida de detalle en manos y anatomia, y posible degradacion cuando se apila con otros adaptadores.
- Terminologia sensible: el estilo incluye referencias funebres, de horror folclorico y de novia fantasma que pueden no ser apropiadas para marcas, campanas comerciales o publicos sensibles, y que pueden activarse accidentalmente al usar el LoRA con pesos altos.
- Idiomas no disponibles: no se documenta que idiomas comprende el prompt; los ejemplos estan en chino, de modo que el rendimiento con prompts en castellano no esta verificado.
- El adaptador no incorpora ninguna capacidad de comprension, razonamiento ni moderacion propia; cualquier filtrado de contenido debe implementarse en la capa de aplicacion.
- Fechas del repositorio (creacion y ultima actualizacion en septiembre de 2026) indican un artefacto reciente y sin historial de mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-raw-mj-lora
- Model card en chino: https://huggingface.co/RunningHubAI/rh-krea2-raw-mj-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2102206458149560321
- Pagina de la autora (@星美AIGC): https://www.runninghub.cn/user-center/1942766460777443329
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de llamada a la API: https://www.runninghub.ai/call-api/api-detail/2133100000000700025

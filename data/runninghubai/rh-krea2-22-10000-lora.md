# RunningHubAI/rh-krea2-22-10000-lora

## Resumen

rh-krea2-22-10000-lora es un adaptador LoRA para edicion y generacion de imagenes publicado por RunningHubAI en Hugging Face. Se distribuye como un unico archivo safetensors de 224 MiB y esta afinado a partir del modelo base "krea2", segun declara la propia model card. El repositorio ocupa 0,2 GB y esta etiquetado con los tags comfyui, lora y image-text-to-image, lo que indica que su uso previsto es la carga directa en ComfyUI o en la plataforma RunningHub.

El modelo no es un modelo fundacional autonomo: es un adaptador que modifica el comportamiento de krea2 y, por tanto, no se puede ejecutar por si solo. La model card lo identifica internamente como "Krea2-Beauty22-Wild Model-10000" y el archivo de pesos se llama `Krea2-美女22-野生模特-10000.safetensors`, una nomenclatura que apunta a un LoRA de sujeto o estilo orientado a la generacion de figuras humanas. El autor del contenido figura como RunningHub-@litlle wind.

La relevancia de esta ficha es limitada pero concreta: se trata de un LoRA publicado recientemente, con cero descargas y cero likes en el momento de la consulta, sin licencia explicita y sin datos tecnicos de entrenamiento publicados. Es util como ejemplo del flujo de publicacion de adaptadores de la plataforma RunningHub, pero no hay informacion suficiente para evaluarlo en terminos de calidad o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2 |
| Parametros totales | no disponible (el archivo de pesos pesa 224 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que se debe seguir la licencia del proyecto original o del modelo base |
| Formato de pesos | safetensors |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Identificador | RunningHubAI/rh-krea2-22-10000-lora |
| Pipeline declarado | image-text-to-image |
| Modelo base declarado | krea2 |
| Nombre interno | Krea2-Beauty22-Wild Model-10000 |
| Archivo de pesos | `Krea2-美女22-野生模特-10000.safetensors` (224 MiB) |
| Tamano del repositorio | 0,2 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-03 |
| Ultima actualizacion | 2026-10-03 |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA (Low-Rank Adaptation), una tecnica de ajuste eficiente que congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas. El resultado es un archivo de pequeno tamano (224 MiB) que se combina en tiempo de inferencia con el modelo base krea2. No se especifica el rango, el factor alpha, las capas objetivo ni el modulo de texto o de difusion sobre el que actua el adaptador.

La model card no publica informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes utilizadas, la composicion de los datos, ni si se aplicaron tecnicas de alineacion como RLHF o DPO (poco habituales en modelos de difusion). El sufijo "10000" del nombre sugiere un numero de pasos o de muestras de entrenamiento, pero esto no se confirma en la documentacion. Tampoco se aportan datos sobre resolucion de entrenamiento, tipo de scheduler ni innovaciones tecnicas. Toda esta seccion debe considerarse como no disponible.

## Capacidades

- Generacion de imagenes a partir de texto y de una imagen de entrada, segun el pipeline declarado `image-text-to-image`.
- Edicion de imagenes: la model card clasifica explicitamente el modelo como "LoRA (image edit)".
- Aplicacion de un estilo o sujeto concreto aprendido del dataset de ajuste sobre el modelo base krea2.
- Integracion con ComfyUI, dado el tag `comfyui` y la indicacion de que los pesos se cargan en esa interfaz.
- Ejecucion en la plataforma RunningHub, tanto en su version internacional como en la china.
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso, capacidades de agente, modo thinking, audio o video: son capacidades no aplicables a este tipo de modelo.
- Capacidades multilingues: no disponible; los modelos de difusion texto-a-imagen suelen aceptar prompts en varios idiomas, pero no se documenta ningun soporte concreto.

## Casos de uso

- Generacion de retratos y figuras humanas en estudios de diseno: el LoRA se cargaria sobre krea2 en ComfyUI para producir imagenes de personas con un estilo o sujeto consistente, aprovechando que el ajuste se ha entrenado especificamente sobre ese tipo de contenido.
- Edicion de imagenes existentes en flujos de postproduccion: al ser un LoRA de edicion, permite modificar una imagen de entrada manteniendo la identidad o el estilo aprendido, sin reentrenar el modelo base.
- Creacion de contenido para redes sociales y material de marketing: producción por lotes de imagenes con un aspecto visual homogeneo, útil cuando se necesita coherencia estetica entre multiples piezas.
- Iteracion rapida de conceptos artisticos: al pesar solo 224 MiB, el adaptador se puede cargar y descargar en segundos dentro de ComfyUI, lo que facilita probar variaciones de prompt y de fuerza del LoRA sin coste elevado de almacenamiento.
- Pruebas de investigacion sobre adaptadores de bajo rango: sirve como ejemplo reproducible de un LoRA de estilo o sujeto para estudiar como afecta el ajuste al comportamiento del modelo base krea2.
- Integracion en pipelines automatizados mediante la API de RunningHub: la model card enlaza documentacion de API, de modo que el LoRA se podria invocar de forma programatica para generar imagenes en un servicio backend.
- Personalizacion de identidad visual de marca: entrenamientos posteriores sobre este mismo esquema podrian generar variantes del adaptador alineadas con una estetica corporativa concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, SSIM, similitud de identidad), comparaciones con otros adaptadores ni evaluaciones humanas. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM para el adaptador: minima; el archivo safetensors ocupa 224 MiB y se carga junto con el modelo base en la misma GPU.
- VRAM total: depende enteramente de krea2, cuyo consumo no se especifica en la informacion disponible. No es posible dar una cifra fiable sin conocer el modelo base.
- GPU recomendadas: no disponible. Al ser un modelo de difusion de imagenes, es habitual el uso de GPUs con al menos 8-12 GB de VRAM para resoluciones moderadas, pero esto es una extrapolacion general y no un dato confirmado para este modelo.
- Compatibilidad con GPU de consumo: el adaptador en si cabe sin problema en cualquier GPU; la viabilidad final depende del modelo base krea2 y de la resolucion de generacion.
- Opciones de despliegue documentadas: ComfyUI, la plataforma RunningHub y la API de RunningHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de difusion de imagenes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Todos los adaptadores comparables pertenecen al mismo autor y a la misma familia base, por lo que la comparacion se limita a los metadatos publicados.

| Modelo | Tipo | Base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2-22-10000-lora | LoRA (image edit) | krea2 | no disponible | no disponible | Hugging Face y RunningHub |
| rh-serena-krea2-lora | LoRA | krea 2 raw (2000 pasos) | no disponible | no disponible | Hugging Face y RunningHub |
| rh-krea2-v3-lora | LoRA | krea2 | no disponible | no disponible | Hugging Face y RunningHub |
| rh-krea2-lora-2100152352732102657 | LoRA | krea2 | no disponible | no disponible | Hugging Face y RunningHub |

No hay datos de rendimiento que permitan diferenciar objetivamente estos adaptadores entre si. La unica distincion documentada es la fuerza de uso recomendada en rh-krea2-v3-lora (0,75) y los pasos de entrenamiento indicados en rh-serena-krea2-lora (2000), frente a los 10000 que sugiere el nombre del modelo analizado.

## Limitaciones y advertencias

- No se puede ejecutar de forma autonoma: requiere el modelo base krea2, que no se distribuye en este repositorio.
- Ausencia total de licencia explicita: la model card remite a la licencia del proyecto original, lo que introduce incertidumbre juridica para uso comercial. No se debe asumir permisividad.
- Sin informacion sobre el dataset de entrenamiento: se desconoce si los datos tenian consentimiento, si incluian personas reales identificables o si hay riesgo de reproduccion de identidades.
- Riesgo de sesgos: la nomenclatura del archivo apunta a un ajuste centrado en un tipo concreto de figura humana ("美女22", "野生模特"), lo que puede reducir la diversidad de los resultados y reproducir sesgos esteticos, de genero o de etnia.
- Riesgo de sobreajuste: con un volumen de pasos potencialmente alto (10000 segun el nombre), es posible que el adaptador fuerce en exceso el estilo aprendido y degrade la adherencia al prompt.
- Sin benchmarks ni evaluaciones: no hay evidencia objetiva de calidad, y el modelo acumula 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad.
- Documentacion practica incompleta: no se indica la fuerza recomendada del LoRA, la resolucion de entrenamiento ni los prompts de activacion, a diferencia de otros adaptadores del mismo autor que si especifican parametros como 0,75.
- Idiomas y contexto de prompt: no disponibles; podrian aparecer limitaciones si el prompt se redacta en un idioma distinto del usado en el entrenamiento.
- Fechas de creacion y actualizacion poco realistas en los metadatos (2026-10-03), lo que sugiere que deben interpretarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-22-10000-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2081258153441812481
- Pagina del autor: https://www.runninghub.ai/user-center/2064710712105979905
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Catalogo de modelos de RunningHub: https://www.runninghub.ai/models
- Listado de modelos del autor en Hugging Face: https://huggingface.co/RunningHubAI/models
- Adaptador relacionado: https://huggingface.co/RunningHubAI/rh-serena-krea2-lora
- Adaptador relacionado: https://huggingface.co/RunningHubAI/rh-krea2-v3-lora
- Adaptador relacionado: https://huggingface.co/RunningHubAI/rh-krea2-lora-2100152352732102657

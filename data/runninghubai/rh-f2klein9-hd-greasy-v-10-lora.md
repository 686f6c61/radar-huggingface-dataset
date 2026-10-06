# RunningHubAI/rh-f2klein9-hd-greasy-v.10-lora

## Resumen

rh-f2klein9-hd-greasy-v.10-lora es un adaptador LoRA de tipo text-to-image publicado por RunningHubAI (autor identificado como @Openclaw2026 en el centro de usuarios de RunningHub) y afinado a partir del modelo base Flux2-Klein-9B. El repositorio de Hugging Face contiene un único archivo de pesos en formato safetensors de 158 MiB, lo que sitúa al adaptador en el rango de los LoRA ligeros: el modelo generativo subyacente no se distribuye aquí, sino que debe cargarse por separado junto con el LoRA.

El objetivo declarado del adaptador es el retoque de retrato orientado a alta definición: la nomenclatura original del archivo (去油高清放大增强细节) alude a la eliminación del brillo graso de la piel, la ampliación en alta definición y la mejora de detalle. Para activarlo, la model card exige un conjunto de palabras de disparo ("he, realistic photo, 2K, 4K, young woman portrait, clean natural skin, no oily shine"), lo que indica que el modelo está especializado en un dominio visual muy concreto y no en generación de imagen abierta.

Por su naturaleza, se trata de un componente de un pipeline de generación de imágenes (ComfyUI, RunningHub o Hugging Face), no de un modelo de lenguaje. No hay información publicada sobre el dataset de entrenamiento, el rango del adaptador, la licencia aplicable ni métricas de calidad, y el repositorio registra cero descargas y cero valoraciones en el momento de la consulta, por lo que debe considerarse material reciente y escasamente validado por la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de bajo rango sobre el modelo base Flux2-Klein-9B (arquitectura del modelo base no detallada en la informacion disponible) |
| Parametros totales | No disponible (archivo de pesos de 158 MiB; rango y dimensiones del LoRA no especificados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo text-to-image, no procesa contexto de texto largo) |
| Tipos de cuantizacion | No disponible (la cuantizacion aplicable depende del modelo base Flux2-Klein-9B) |
| Idiomas soportados | No disponible; las palabras de disparo documentadas estan en ingles |
| Licencia | No disponible; la model card remite a la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`F2Klein9-HD greasy_v.10去油高清放大增强细节.safetensors`) |
| Tipo de pipeline | text-to-image |
| Modelo base | Flux2-Klein-9B (fine-tuned from) |
| Tamano del repositorio | 0,2 GB |
| Fecha de registro en Hugging Face | 2026-10-05 (creacion y actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre Flux2-Klein-9B, un modelo base de la familia Flux con 9.000 millones de parametros segun la denominacion del propio modelo. No se detalla en la informacion disponible ni el rango del adaptador, ni las capas objetivo, ni si se ha aplicado sobre los bloques de atencion, sobre las proyecciones de las capas de difusion o sobre ambos. El archivo de pesos ocupa 158 MiB, coherente con un adaptador de bajo rango mas que con un ajuste completo del modelo.

Tampoco se documentan los datos de entrenamiento: no hay informacion sobre el numero de imagenes, la resolucion nativa, la composicion del dataset, el uso de tecnicas de preferencia humana (RLHF, DPO) ni la estrategia de regularizacion. El unico indicio sobre el objetivo del ajuste son las palabras de disparo declaradas y el nombre del archivo, que apuntan a un entrenamiento centrado en retratos femeninos con piel limpia y aspecto fotografico realista, sin brillo graso, y con refuerzo de detalle en rangos de alta resolucion (2K y 4K).

No se describe ninguna innovacion tecnica adicional, como decodificacion especulativa, atencion lineal o variantes de muestreo. La integracion prevista es mediante el flujo de trabajo publicado en RunningHub, que se cita como compatible con este LoRA.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante el modelo base Flux2-Klein-9B con el adaptador aplicado.
- Modificacion del estilo fotografico hacia retrato realista, con enfasis en piel limpia y sin brillo graso.
- Mejora de detalle y aspecto de alta definicion en la salida (referencias a 2K y 4K en las palabras de disparo).
- Condicionamiento mediante palabras de disparo obligatorias ("he, realistic photo, 2K, 4K, young woman portrait, clean natural skin, no oily shine").
- Integracion en flujos de trabajo de ComfyUI, en la plataforma RunningHub y en Hugging Face.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no documentadas; las palabras de disparo estan en ingles.
- Modo de razonamiento (thinking mode), vision o audio: no aplica ni esta documentado.
- Cualquier otra capacidad especial: no disponible.

## Casos de uso

- Retoque de retratos corporativos: el LoRA se aplica sobre Flux2-Klein-9B para generar cabeceras y fotografias de perfil con piel uniforme y sin reflejos grasos, un requisito habitual en imagenes de marca personal y paginas de equipo.
- Generacion de imagenes para catalogos de cosmeticos y cuidado de la piel: el enfasis en "clean natural skin" y "no oily shine" encaja con la necesidad de mostrar pieles sin brillos en material promocional de productos dermatologicos.
- Ilustracion editorial en alta resolucion: las palabras de disparo 2K y 4K permiten orientar la generacion hacia salidas de gran formato para dobles paginas o carteleria, siempre que el pipeline de difusion trabaje a esa resolucion.
- Creacion de avatares y personajes consistentes: combinado con tecnicas de condicionamiento adicionales del modelo base, el adaptador sirve para fijar un aspecto fotografico realista en series de imagenes de un mismo personaje.
- Previsualizacion rapida en produccion audiovisual: generar referencias de vestuario, maquillaje o iluminacion con aspecto fotografico antes de rodar, reduciendo el coste de las pruebas fisicas.
- Prototipado dentro de ComfyUI: al ser un archivo safetensors de 158 MiB, se puede insertar y retirar de un grafo de generacion sin reentrenar nada, lo que facilita comparar variantes de estilo en un mismo pipeline.
- Automatizacion por API en RunningHub: la model card enlaza la API de la plataforma, de modo que el adaptador puede invocarse de forma programatica en lugar de forma manual, integrandose en flujos de generacion por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, SSIM, evaluaciones humanas) ni comparaciones cuantitativas con otros adaptadores o con el modelo base sin el LoRA. El repositorio registra cero descargas y cero likes, por lo que tampoco existe evaluacion de la comunidad.

## Requisitos de hardware

- El adaptador en si ocupa 158 MiB en disco y anade un coste de memoria despreciable frente al modelo base.
- El consumo de VRAM queda determinado por Flux2-Klein-9B, no por el LoRA. Para un modelo de 9.000 millones de parametros, una estimacion aritmetica en precision de 16 bits ronda los 18 GB solo en pesos, a los que hay que sumar activaciones y buffers de atencion; se trata de una estimacion derivada del nombre del modelo base, no de un dato publicado por el autor.
- No hay datos publicados de VRAM minima, GPU recomendadas ni compatibilidad con GPU de consumo para este adaptador concreto. Cualquier cifra concreta debe considerarse no disponible.
- Opciones de despliegue: ComfyUI (plataforma declarada), RunningHub (plataforma declarada, incluida su API) y Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores LoRA comparables, ni de sus parametros, contexto o metricas, por lo que la comparativa cuantitativa con alternativas no esta disponible. La unica comparacion que puede establecerse con los datos aportados es frente al propio modelo base:

| Aspecto | rh-f2klein9-hd-greasy-v.10-lora | Flux2-Klein-9B sin adaptador | Otras alternativas |
|---|---|---|---|
| Parametros | Adaptador de 158 MiB sobre un base de 9B | 9B (segun denominacion) | No disponible |
| Tipo | LoRA text-to-image | Modelo base text-to-image | No disponible |
| Estilo | Sesgado a retrato realista con piel limpia y sin brillo | Generacion abierta segun el prompt | No disponible |
| Palabras de disparo | Requeridas | No aplica | No disponible |
| Licencia | No disponible; remite al proyecto original | La del proyecto Flux2-Klein-9B | No disponible |
| Disponibilidad | Hugging Face, ComfyUI, RunningHub | No indicada en esta ficha | No disponible |

## Limitaciones y advertencias

- La licencia no esta declarada de forma explicita. La model card indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o del upstream, lo que introduce incertidumbre juridica para uso comercial.
- No hay informacion sobre el dataset de entrenamiento, por lo que no puede evaluarse el sesgo de representacion ni la procedencia de las imagenes utilizadas. Un LoRA entrenado especificamente sobre "young woman portrait" tiende a un dominio estrecho y puede degradar la calidad fuera de ese tipo de sujeto.
- El adaptador exige palabras de disparo concretas en ingles; su omision probablemente reduzca o anule el efecto buscado. No se documenta el comportamiento con prompts en otros idiomas.
- Riesgo de sobreajuste al estilo entrenado: al estar orientado a un unico atributo estetico, puede homogeneizar las salidas y dificultar la generacion de otros estilos cuando esta activo.
- No hay benchmarks ni evaluaciones independientes, y el repositorio no registra descargas ni valoraciones, por lo que la calidad real del adaptador no esta verificada por terceros.
- No se documentan limitaciones de resolucion efectiva; las menciones a 2K y 4K son palabras de disparo, no una garantia de que el modelo base genere a esa resolucion sin artefactos.
- Las imagenes sinteticas de retratos realistas pueden plantear obligaciones de etiquetado o de transparencia segun la jurisdiccion, ademas de riesgos de suplantacion si se combinan con tecnicas de condicionamiento por identidad.
- Repositorio con una unica revision y fechas de creacion y actualizacion muy proximas (2026-10-05), lo que sugiere ausencia de mantenimiento posterior y de historial de versiones.
- El material promocional de la model card incluye referidos y codigos de invitacion de la plataforma; conviene separar ese contenido de la documentacion tecnica.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-f2klein9-hd-greasy-v.10-lora
- Model card en chino (referenciada en el README): README_cn.md
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2046080805599973378
- Flujo de trabajo compatible: https://www.runninghub.cn/post/2046071420735721473
- Pagina del autor: https://www.runninghub.cn/user-center/2025581316556464129
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Documentacion de la API de generacion de imagen: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model

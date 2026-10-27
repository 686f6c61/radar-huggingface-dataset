# aoleg/MOSS-Image-Kodachrome-V2

## Resumen

MOSS-Image-Kodachrome-V2 es un adaptador LoRA de texto a imagen publicado por el usuario aoleg en HuggingFace, pensado para aplicar sobre el modelo base OpenMOSS-Team/MOSS-Image-Base. No es un modelo completo: es un conjunto de pesos de bajo rango que modifica el comportamiento del modelo de difusión para reproducir la estética de la película Kodachrome en sus variantes de los años 40 y 50 (formatos 4x5 y 35 mm). El repositorio ocupa 0,1 GB y se distribuye con licencia Apache 2.0 compatible con la librería diffusers.

El adaptador resuelve un problema muy concreto de los flujos de generación de imagen: conseguir un aspecto fotográfico de época coherente (saturación característica, contraste, grano, iluminación y paleta) sin necesidad de encadenar prompts largos ni de recurrir a modelos afinados específicos. Por los ejemplos publicados, el estilo se activa con prompts que comienzan por "Kodachrome film" y añaden etiquetas de época como "1940s, 4x5 Kodachrome" o "1950s, 35mm Kodachrome".

Es relevante ahora porque MOSS-Image es un modelo de difusión reciente con cierto recorrido en la comunidad (hay workflows para ComfyUI y adaptadores de terceros), y este LoRA es una de las primeras propuestas de emulación de película para esa base. Existe una versión previa del mismo autor (aoleg/MOSS-Image-Kodachrome), de la que esta V2 sería una iteración. El modelo lleva pocas descargas y no cuenta con validación comunitaria amplia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Tipo de modelo | Adaptador LoRA de texto a imagen (no es un modelo completo) |
| Arquitectura | LoRA (adaptadores de bajo rango) sobre el modelo de difusión MOSS-Image-Base |
| Parámetros totales | No disponible para el adaptador; el repositorio completo ocupa 0,1 GB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen); longitud máxima de prompt no disponible |
| Tipos de cuantización | No disponible para el adaptador; las imágenes de ejemplo se generaron con un checkpoint int8 del modelo base |
| Idiomas soportados | No disponible; todos los prompts de ejemplo están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos para la librería diffusers; formato de fichero no especificado en la información disponible |
| Modelo base | OpenMOSS-Team/MOSS-Image-Base |
| Pipeline | text-to-image |
| Palabras de activación | "Kodachrome film", con etiquetas de época del tipo "1940s, 4x5 Kodachrome" o "1950s, 35mm Kodachrome" |
| Tamaño del repositorio | 0,1 GB |
| Fecha de creación | 27 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en determinadas capas del modelo de difusión base y se suman a sus pesos originales durante la inferencia. Este esquema permite especializar el estilo sin reentrenar el modelo completo: el adaptador se carga sobre MOSS-Image-Base con `load_lora_weights` de diffusers o mediante el nodo correspondiente en ComfyUI, y se puede activar o desactivar con un peso de escala. El rango del LoRA, los módulos objetivo, el valor de alpha y la resolución de entrenamiento no se detallan en la información disponible.

Tampoco se publican datos sobre el conjunto de entrenamiento: número de imágenes, procedencia, número de pasos, optimizador, si hubo regularización con imágenes del modelo base ni si se emplearon técnicas como captions automáticos o entrenamiento por etapas. Por los prompts de ejemplo se deduce que el material de referencia es fotografía estadounidense de las décadas de 1940 y 1950 en película Kodachrome, con escenas industriales, ferroviarias, militares, paisajes nevados, retratos y escenas domésticas. Los nombres de fichero de las imágenes de muestra hacen referencia a un checkpoint int8 del modelo base, lo que sugiere que las demostraciones se generaron con una versión cuantizada a 8 bits.

## Capacidades

- Generación de imágenes de texto a imagen con estética de película Kodachrome (paleta saturada, rojos y azules intensos, contraste alto, grano fino).
- Estilización por época: los ejemplos cubren ambientación de los años 40 (4x5 Kodachrome) y de los años 50 (35 mm Kodachrome), con resultados distintos en formato y encuadre.
- Reproducción de escenas complejas con múltiples sujetos: grupos de trabajadores, tripulaciones militares, reuniones alrededor de una hoguera, interiores domésticos.
- Fotografía industrial y de paisaje: locomotoras de vapor, hangares, maquinaria, paisajes nevados y bosques con niebla.
- Retratos y figuras humanas caracterizadas con vestuario y atrezzo de época (monos de trabajo, uniformes, abrigos, gorras).
- Composición de interiores y arquitectura vintage: salones con mobiliario modular, ventanales, decoración de mediados de siglo.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni modo "thinking": es exclusivamente un modelo generativo de imagen.
- No genera texto ni código; las capacidades multilingües no están documentadas y los ejemplos están íntegramente en inglés.

## Casos de uso

- Diseño editorial y publicaciones de historia: ilustrar artículos sobre la América industrial de los años 40 y 50 con imágenes que imitan el material de archivo real, manteniendo coherencia de paleta y grano entre ilustraciones.
- Preproducción audiovisual: generar moodboards y referencias visuales de época para dirección de arte, vestuario y localizaciones antes de rodar una serie o un documental ambientado a mediados del siglo XX.
- Videojuegos con ambientación histórica: producir arte conceptual y texturas de referencia para títulos o mods situados en la Segunda Guerra Mundial o la posguerra estadounidense.
- Archivo y difusión museística: crear material divulgativo con estética de fotografía original para exposiciones sobre fotografía analógica, sin depender de la licencia de imágenes históricas reales.
- Marketing de temática nostálgica: campañas y piezas gráficas que necesitan un acabado "vintage" coherente sin recurrir a bancos de imágenes ni a retoque manual imagen por imagen.
- Generación de datos sintéticos: producir lotes de imágenes con un perfil cromático y de grano controlado para aumentar datasets de clasificación de fotografía analógica o de detección de época.
- Ilustración de libros y material educativo: portadas y láminas para libros de historia o novelas históricas que requieren un registro visual homogéneo en toda la obra.
- Prototipado rápido en ComfyUI: integrar el LoRA en un workflow de nodos para iterar estilos de película junto a otros adaptadores, ya que existen flujos publicados para MOSS-Image con distintos stocks (Kodachrome, Portra).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Como referencia cualitativa (no verificable como benchmark), el autor y la comunidad describen generaciones one-shot sobre el modelo base, sin Turbo ni SFT, y sin imágenes borrosas incluso con prompts negativos. No hay métricas de FID, CLIP score, ni comparativas cuantitativas con otros LoRA de estilo.

## Requisitos de hardware

- El adaptador en sí es ligero: el repositorio completo ocupa 0,1 GB, por lo que los pesos LoRA están en el orden de decenas de megabytes y su carga añade un coste de VRAM marginal (por debajo de 1 GB en la práctica habitual de LoRA).
- La VRAM real la determina el modelo base MOSS-Image-Base, cuyas especificaciones y requisitos de inferencia no se detallan en la información proporcionada.
- Las imágenes de ejemplo se generaron con un checkpoint int8 del modelo base, lo que reduce los requisitos de memoria frente a una carga en bf16 o fp16; no se publican cifras concretas de VRAM para ninguna de las dos configuraciones.
- GPU recomendadas: no disponibles para este adaptador; dependerán del tamaño del modelo base. No hay datos que permitan afirmar si cabe en GPU de consumo como una RTX 4090.
- Despliegue: diffusers (`load_lora_weights` sobre el pipeline del modelo base) y ComfyUI (existe un repositorio de workflows para MOSS-Image que incluye estilos de película). No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que además no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| aoleg/MOSS-Image-Kodachrome-V2 | LoRA de estilo | OpenMOSS-Team/MOSS-Image-Base | No disponible (repo de 0,1 GB) | No aplica | Apache 2.0 | 0 descargas, 0 likes |
| aoleg/MOSS-Image-Kodachrome | LoRA de estilo (versión previa) | OpenMOSS-Team/MOSS-Image-Base | No disponible | No aplica | No disponible en la información | Listado en el índice de adaptadores del modelo base |
| AmandineFlachs/kale-img-1-lora | LoRA de estilo | OpenMOSS-Team/MOSS-Image-Base | No disponible | No aplica | No disponible en la información | 1 descarga, actualizado recientemente |
| OpenMOSS-Team/MOSS-Image-Base | Modelo de difusión completo | — | No disponible | No aplica | No disponible en la información | Modelo base de referencia |

La comparación cuantitativa con alternativas de otras familias (LoRA de película para SDXL o Flux) no está disponible en la información proporcionada, y no sería directamente equivalente al depender de un backbone distinto.

## Limitaciones y advertencias

- No hay ficha técnica de entrenamiento: se desconocen rango, módulos objetivo, dataset, resolución nativa y número de pasos, lo que dificulta reproducir o auditar el resultado.
- Riesgo de sobreajuste al estilo: al estar entrenado sobre material de una época y un país concretos, puede reproducir los sesgos de representación de la fotografía estadounidense de los años 40 y 50 (predominio de sujetos blancos, roles de género de la época, estereotipos laborales y militares).
- El sesgo del dataset de referencia se traslada a la salida: escenas no estadounidenses o no occidentales pueden aparecer "kodachromizadas" con un imaginario que no les corresponde.
- Riesgo de alucinación visual: como cualquier modelo de difusión, puede generar anatomías incorrectas, texto ilegible en carteles y objetos incoherentes, especialmente en escenas con muchos sujetos.
- Idiomas: no hay evidencia de soporte multilingüe en los prompts; todos los ejemplos están en inglés y el comportamiento con prompts en castellano no está documentado.
- Marca registrada: "Kodachrome" es una marca de Eastman Kodak. La licencia Apache 2.0 cubre los pesos, pero no otorga derechos sobre la marca; conviene revisar el uso del nombre en materiales comerciales.
- Licencia del modelo base: el adaptador es Apache 2.0, pero el uso comercial está condicionado también por la licencia de OpenMOSS-Team/MOSS-Image-Base, que no se detalla en la información disponible.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente ni reportes de la comunidad; no se recomienda como dependencia crítica en producción sin evaluación previa.
- No apto para tareas de texto, código, razonamiento o agentes: es exclusivamente un adaptador de generación de imagen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aoleg/MOSS-Image-Kodachrome-V2
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Versión previa del adaptador: https://huggingface.co/aoleg/MOSS-Image-Kodachrome
- Índice de adaptadores del modelo base: https://huggingface.co/models?other=base_model%3Aadapter%3AOpenMOSS-Team%2FMOSS-Image-Base
- Hilo en r/StableDiffusion sobre el LoRA Kodachrome para MOSS Image: https://www.reddit.com/r/StableDiffusion/comments/1xf8o9o/moss_image_a_simple_kodachrome_lora/
- Workflows de MOSS-Image para ComfyUI (estilos de película): https://github.com/sepiablue-ai/moss-image-workflows/blob/main/README_EN.md

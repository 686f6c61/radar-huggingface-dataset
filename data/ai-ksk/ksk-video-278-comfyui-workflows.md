# AI-KSK/ksk-video-278-comfyui-workflows

## Resumen

AI-KSK/ksk-video-278-comfyui-workflows es un repositorio de flujos de trabajo (workflows) para ComfyUI publicado por AI-KSK, no un modelo de pesos en sentido estricto. El repositorio contiene dos grafos JSON de 12 nodos cada uno orientados a generacion text-to-image con la familia Ideogram 4, en sus variantes FAST e Instant, empleando pesos INT8 cuantizados del modelo `qwen3vl_8b_fp8_scaled` (tipo `ideogram4`) y el VAE `flux2-vae`. El tamano del repositorio es de 0,0 GB, lo que confirma que no aloja pesos de modelo, sino unicamente los ficheros de workflow y las portadas de los episodios.

El interes del repositorio reside en que documenta una configuracion concreta y reproducible de Inferencia INT8 para Ideogram 4 en ComfyUI: latente de 2048x880, sampler `euler` con scheduler `normal`, CFG 1 y un nodo constructor de prompts (`Ideogram4PromptBuilderKJ`) que sustituye a los nodos `CLIPTextEncode`, que aparecen vacios en ambos grafos. La variante FAST usa `Ideogram4-fast_int8-convrot-simple` a 20 pasos y la variante Instant usa `Ideogram4-instant_int8-convrot-simple` a 8 pasos.

Es relevante ahora porque las variantes INT8 de Ideogram 4 reducen los requisitos de VRAM frente a los pesos en precision completa, y porque el repositorio ofrece una plantilla lista para importar en ComfyUI con parametros fijados. No obstante, la informacion publicada es muy escasa: no hay datos de benchmarks, ni de composicion del dataset de entrenamiento, ni de rendimiento medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no describe la arquitectura del modelo subyacente; el checkpoint referenciado es `qwen3vl_8b_fp8_scaled` de tipo `ideogram4`) |
| Parametros totales | no disponible (el identificador del checkpoint sugiere 8B, sin confirmacion en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (checkpoints `Ideogram4-fast_int8-convrot-simple` e `Ideogram4-instant_int8-convrot-simple`); el checkpoint base se referencia como `fp8_scaled` |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | no disponible (el repositorio contiene workflows JSON; no aloja pesos) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo generativo subyacente. Lo que si describe es la topologia del grafo de inferencia en ComfyUI: 12 nodos por workflow, con un checkpoint de tipo `ideogram4` (`qwen3vl_8b_fp8_scaled`), el VAE `flux2-vae`, un latente `EmptySD3LatentImage` de 2048x880, sampler `euler` con scheduler `normal`, CFG 1 y el nodo `Ideogram4PromptBuilderKJ` habilitado. Los nodos `CLIPTextEncode` estan presentes pero vacios, de modo que el prompt se inyecta desde el constructor estructurado de prompts.

No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo subyacente empleo RLHF, DPO u otras tecnicas de alineamiento. La unica innovacion tecnica explicitamente mencionada es el uso de checkpoints INT8 con un esquema de cuantizacion identificado como `convrot`, que el autor presenta como un compromiso (trade-off) de precision frente a los pesos en mayor precision. La diferencia funcional entre las dos variantes es el numero de pasos de muestreo: 20 para FAST y 8 para Instant.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante la familia Ideogram 4 en ComfyUI.
- Generacion de prompts estructurados mediante el nodo `Ideogram4PromptBuilderKJ`, que sustituye a la codificacion de texto convencional en ambos grafos.
- Dos modos de inferencia: FAST (20 pasos) orientado a mayor calidad y Instant (8 pasos) orientado a menor latencia.
- Resolucion de trabajo por defecto de 2048x880 mediante `EmptySD3LatentImage`.
- Compatibilidad con el ecosistema ComfyUI: los workflows son ficheros JSON importables.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Prototipado rapido de pipelines text-to-image en ComfyUI: importar el JSON de FAST o Instant y disponer de un grafo funcional de 12 nodos con parametros ya fijados, lo que reduce el tiempo de configuracion inicial.
- Generacion de imagenes panoramicas o de formato ancho: el latente por defecto de 2048x880 es adecuado para banners, cabeceras web y portadas de episodio, que es precisamente el uso que el autor documenta en la carpeta `covers/`.
- Evaluacion de cuantizacion INT8 frente a pesos en mayor precision: los dos grafos permiten comparar el resultado de checkpoints INT8 con el mismo sampler y CFG, aislando el efecto de la cuantizacion.
- Comparativa de coste-calidad entre 20 y 8 pasos: al compartir sampler, scheduler, CFG y latente, los dos workflows permiten medir la perdida de calidad al reducir pasos de muestreo.
- Produccion de material grafico para creadores de contenido: el autor enlaza los workflows a demos en RunningHub y a tutoriales en YouTube y Bilibili, lo que sugiere un uso orientado a generacion de portadas y recursos visuales para publicaciones.
- Base para experimentacion con prompts estructurados: el uso de `Ideogram4PromptBuilderKJ` con `CLIPTextEncode` vacio sirve como punto de partida para estudiar como afecta la construccion estructurada del prompt al resultado frente a la codificacion de texto plana.
- Docencia y divulgacion de ComfyUI: los grafos son material didactico reutilizable para explicar el cableado de checkpoint, VAE, latente y sampler en un grafo minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. La informacion proporcionada no incluye mediciones de VRAM para los checkpoints INT8 ni para el checkpoint base `qwen3vl_8b_fp8_scaled`.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que los grafos quepan en tarjetas consumer concretas.
- Opciones de despliegue: ComfyUI (formato nativo de los workflows). El autor distribuye tambien demos alojadas en RunningHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un pipeline de difusion text-to-image de este tipo.
- Latencia y throughput: no disponible. Solo se conocen los pasos de muestreo configurados (20 en FAST, 8 en Instant), que no equivalen a tiempos medidos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa. Como referencia estructural, el repositorio se apoya en la familia Ideogram 4 (variantes FAST e Instant) y en el VAE `flux2-vae`, pero no se aportan metricas comparativas frente a otros sistemas text-to-image.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo (tamano de 0,0 GB): es una coleccion de workflows JSON y portadas, por lo que no es utilizable por si solo sin descargar los checkpoints referenciados.
- La licencia es `other`, sin texto de licencia disponible en la informacion proporcionada; es imprescindible revisar los terminos del autor antes de cualquier uso comercial.
- El autor advierte explicitamente de un compromiso de precision derivado de la cuantizacion INT8.
- Los valores de 20 y 8 pasos son los valores por defecto publicados por el autor, no optimos garantizados para otros casos.
- El latente de 2048x880 es el valor por defecto; no se documenta el comportamiento a otras resoluciones o relaciones de aspecto.
- CFG 1 implica que no hay etapa de prompt negativo, lo que limita el control fino sobre lo que se excluye en la generacion.
- El unico idioma declarado es ingles (`en`), lo que restringe el uso de prompts en castellano sin evaluacion previa.
- No hay informacion sobre sesgos, tasa de alucinacion visual, limitaciones de contexto ni caveats de produccion mas alla de los indicados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad que respalde su funcionamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-278-comfyui-workflows
- Sitio del autor (AI-KSK): https://aiksk.cc/en/
- Biblioteca de workflows y videos del autor: https://aiksk.cc/en/videos/
- Demo FAST en RunningHub: https://www.runninghub.ai/post/2078065107753590786/?inviteCode=rh-v1111
- Demo Instant en RunningHub: https://www.runninghub.ai/post/2077705321124028417/?inviteCode=rh-v1111
- Video en YouTube: https://www.youtube.com/watch?v=g7HXab6m4Ys
- Video en Bilibili: https://www.bilibili.com/video/BV1BJNd6vE27

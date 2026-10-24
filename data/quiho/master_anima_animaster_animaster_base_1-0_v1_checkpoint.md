# Quiho/MASTER_ANIMA_AniMaster_AniMaster_Base_1.0_V1_checkpoint

## Resumen

MASTER_ANIMA: AniMaster (AniMaster | Base 1.0 | V1) es un checkpoint de generación de imágenes texto-a-imagen orientado a ilustración anime, publicado por el usuario Quiho en Civitai (modelo 2546307) y reimportado a Hugging Face como repositorio de Diffusers. No es un modelo entrenado desde cero: es un *merge* construido sobre Anima, un modelo texto-a-imagen de 2.000 millones de parámetros desarrollado en colaboración entre CircleStone Labs y Comfy Org y especializado en conceptos, personajes y estilos de anime. El autor describe el proceso como una mezcla apoyada en su propio script de merge, con DMD2 (destilación por coincidencia de distribuciones) incorporado en la receta.

El modelo resuelve el problema de obtener un checkpoint "todo en uno" con estética anime 2D, fantasy y furry, con sintaxis de prompts heredada del ecosistema Danbooru (etiquetas `score_8`, `score_9`, `masterpiece`, referencias a artistas con `@nombre`). El repositorio de Hugging Face pesa 5,9 GB y contiene pesos en formato safetensors, incluyendo un VAE identificado como `qwen_image_vae.safetensors`.

Es relevante ahora porque Anima es una base reciente (2026) con soporte nativo en el ecosistema ComfyUI, y este tipo de merges comunitarios son la vía habitual para adaptar la estética de la base a flujos de trabajo concretos. Conviene señalar que el repositorio de Hugging Face acumula 0 descargas y 0 likes, no declara licencia y está etiquetado como `not-for-all-audiences`, por lo que su evaluación en producción debe hacerse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen; arquitectura interna no detallada en la informacion disponible (la presencia de `qwen_image_vae.safetensors` apunta a reutilizacion del VAE de Qwen-Image) |
| Parametros totales | 2.000 millones (heredados de la base Anima); cifra del checkpoint fusionado no publicada de forma independiente |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo texto-a-imagen); limite de tokens del codificador de texto no disponible |
| Tipos de cuantizacion | Pesos en safetensors; no se documentan variantes GGUF, nf4 o fp8 oficiales. En el listado de Civitai aparece un fichero principal de 1,1 GB y el VAE de 242 MB |
| Idiomas soportados | No disponibles formalmente; todos los prompts de ejemplo de la model card estan en ingles con etiquetas tipo Danbooru |
| Licencia | No disponible (la model card no la declara; el repositorio no indica licencia) |
| Formato de pesos | safetensors (compatible con diffusers y ComfyUI) |
| Tipo de modelo | Checkpoint de difusion (merge), no un modelo de lenguaje |
| Tamano del repositorio | 5,9 GB |
| Resolucion de entrenamiento | No disponible |
| Pipeline declarado | No disponible en Hugging Face; `library_name: diffusers` |
| Fecha de publicacion | 3 de julio de 2026 en Civitai; repositorio de Hugging Face creado el 24 de octubre de 2026 |
| Autor | Quiho (merge); base Anima por CircleStone Labs y Comfy Org |

## Arquitectura y entrenamiento

El modelo es un *merge* de pesos, no un entrenamiento desde cero. La base es Anima, un modelo de difusion texto-a-imagen de 2.000 millones de parámetros creado por CircleStone Labs y Comfy Org, entrenado con "varios" conjuntos de datos (la descripcion disponible no detalla el volumen de tokens ni la composicion) y orientado explícitamente a conceptos, personajes y estilos de anime, con capacidad para otro contenido no fotorrealista. La descripcion de la base indica que no funciona bien en realismo.

Sobre esa base, el autor aplica su propio script de merge, que según sus notas busca ser "mas limpio y mas fiel al estilo del modelo base", e incorpora DMD2 en la receta. DMD2 es una técnica de destilación por coincidencia de distribuciones cuyo objetivo típico es reducir el número de pasos de muestreo necesarios; el autor comenta que en una primera iteración el resultado no funcionó y que planeaba descartarlo hasta que un nuevo intento funcionó. No se documentan ni el número de pasos de inferencia recomendado, ni la composicion exacta de la mezcla, ni los ratios de fusión entre modelos.

La arquitectura interna (DiT, UNet u otra) no se detalla en la informacion disponible. El único indicio técnico concreto es la presencia del fichero `qwen_image_vae.safetensors` en el paquete de Civitai, lo que sugiere que el pipeline reutiliza el VAE de Qwen-Image para la decodificacion latente. Los prompts de ejemplo incluyen sintaxis de peso (`(termino:1.2)`), referencias a artistas con `@nombre` y etiquetas de calidad tipo `score_9`, `score_8_up`, `masterpiece`, `absurdres`, compatibles con el estilo de la base Anima.

## Capacidades

- Generación de imágenes texto-a-imagen con estética anime 2D, ilustración y lineart.
- Soporte de escenas multi-personaje: los ejemplos incluyen prompts con `3girls` y composiciones con varios sujetos en primer y segundo plano.
- Estilización por referencia de artista mediante etiquetas `@nombre` (por ejemplo `@abara heiki`, `@(yoneyama mai:0.9)`, `@(wlop:1.05)`), con pesos ajustables.
- Control de calidad mediante etiquetas de puntuación (`score_7`, `score_8`, `score_9`) y de resolución (`highres`, `absurdres`).
- Prompt negativo funcional: los ejemplos usan `score_1, score_2, score_3, blurry, worst quality, low quality` como negativos estándar.
- Estética "sketchy" y "hand-drawn": la model card enfatiza lineart fino, trazos expresivos y paletas de color suaves y apagadas.
- Escenas con iluminación cinematográfica, grano de película, profundidad de campo y efectos de agua (`caustics`, `refraction`, `subsurface scattering`).
- Contenido fantasy y furry: ambos aparecen como etiquetas del repositorio y en los prompts de ejemplo.
- Capacidad de composición dinámica: ángulos holandeses, escorzos (`foreshortening`), poses dinámicas y composiciones con impacto visual.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo "thinking": no es un modelo de lenguaje.
- Capacidades de visión o audio: no disponibles (es un modelo de generación, no multimodal de entrada).

## Casos de uso

- **Ilustración de personajes para videojuegos y visual novels**: el modelo permite generar retratos y escenas con etiquetas de personaje, vestuario y expresión, y la sintaxis `@artista` facilita mantener una dirección de arte coherente a lo largo de una serie de assets.
- **Concept art y previsualización de escenarios**: con prompts que describen iluminación (`cinematic lighting`, `volumetric lighting`), profundidad de campo y hora del día, se pueden producir rápidamente variaciones de una misma escena para revisión interna antes de encargar el arte final.
- **Prototipado de páginas de cómic o manga**: la estética de lineart y trazo suelto que enfatiza la model card encaja en la fase de bocetado, donde se necesita volumen de variantes para elegir encuadre y composición.
- **Fondos y escenas "slice of life"**: los ejemplos de la model card (jardín, cielo azul, luz de día, guerra de pistolas de agua) muestran soltura con escenas cotidianas luminosas, útiles para ilustración editorial o contenido de comunidad.
- **Contenido para comunidades de nicho (fantasy y furry)**: ambos dominios están etiquetados explícitamente, por lo que el checkpoint sirve para encargos o publicaciones dirigidas a esas comunidades, donde los modelos generalistas suelen rendir peor.
- **Exploración de estilo y mezcla de artistas**: la ponderación por etiquetas (`@(niji psyp style:0.55)`, `@(wlop:1.05)`) permite experimentar con hibridaciones de estilo, una tarea habitual en estudios pequeños que buscan una identidad visual propia.
- **Generación por lotes de material de referencia**: al ser un checkpoint de difusion estándar, se puede automatizar con scripts de diffusers o flujos de ComfyUI para producir bancos de imágenes de referencia para moodboards o documentación de proyecto.
- **Ilustración de portadas para publicaciones de nicho**: la combinación de etiquetas de calidad alta y control de prompt negativo permite iterar hasta obtener una imagen con resolución y acabado suficientes para portada digital.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen métricas FID, CLIP score, HPSv2 ni comparativas cuantitativas publicadas para este checkpoint en la model card de Hugging Face ni en las fichas de Civitai y CivArchive consultadas. Tampoco se documentan tiempos de inferencia, número de pasos recomendado ni comparaciones automáticas con la base Anima.

## Requisitos de hardware

- **VRAM estimada (inferencia)**: con 2.000 millones de parámetros, el transformer ocupa del orden de 4 GB en fp16 y unos 2 GB en fp8; hay que sumar el VAE y el codificador de texto, cuyo tamano no se documenta en la informacion disponible. Como referencia, el fichero principal listado en Civitai pesa 1,1 GB y el VAE 242 MB.
- **GPU de consumo**: por el rango de parámetros, es razonable esperar que quepa en GPU de consumo con 8-12 GB de VRAM (RTX 3060 Ti, 4060 Ti, 4070), aunque no hay confirmacion oficial de requisitos minimos.
- **GPU de datacenter**: A100, H100 o L40S son innecesarias para el tamano del modelo, pero permiten lotes grandes y mayor throughput en entornos de generacion por lotes.
- **Opciones de despliegue**: diffusers (el repositorio declara `library_name: diffusers`), ComfyUI (entorno natural, dado que Anima se desarrollo en colaboracion con Comfy Org) y, previsiblemente, interfaces basadas en safetensors del ecosistema Stable Diffusion; no se documenta soporte oficial de vLLM, TGI o llama.cpp, que no aplican a un modelo de difusion.
- **Latencia y throughput**: no disponibles. No se publican tiempos por imagen, pasos de muestreo recomendados ni resultados de la incorporacion de DMD2 en terminos de aceleracion medible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MASTER_ANIMA: AniMaster (Base 1.0 V1) | 2.000 M (base Anima) | No disponible | Merge anime/fantasy/furry sobre Anima, con DMD2 en la receta | No disponible | Hugging Face (0 descargas) y Civitai |
| Anima base-v1.0 | 2.000 M | No disponible | Base texto-a-imagen de CircleStone Labs y Comfy Org, enfocada a anime | No disponible en la informacion consultada | Civitai (modelo 2458426) |
| MASTER_ANIMA: V2 (AniMaster) | No disponible | No disponible | Version posterior del mismo autor, descrita como "evolucion" del flujo de merge | No disponible | Civitai |
| Otros checkpoints anime de la misma categoria (Pony, Illustrious, NoobAI) | No disponible | No disponible | No se han consultado datos en esta busqueda | No disponible | No disponible |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible: no hay benchmarks publicados ni datos de rendimiento que permitan situar el checkpoint frente a otras familias de modelos anime.

## Limitaciones y advertencias

- **Licencia no declarada**: ni el repositorio de Hugging Face ni la informacion consultada indican licencia. Sin licencia explicita, el uso comercial es jurídicamente arriesgado y requiere contactar con el autor o consultar la ficha original en Civitai.
- **Contenido para adultos**: el repositorio esta etiquetado como `not-for-all-audiences` y varios prompts de ejemplo incluyen desnudos (`nude`) y contenido sensible. No es apto para desplegarse en interfaces publicas sin filtros y moderacion.
- **Sin validacion comunitaria**: 0 descargas y 0 likes en Hugging Face. El modelo es una importacion automatica de Civitai (`imported`) y no hay evidencia de uso o evaluacion independiente.
- **Sesgo de dominio**: la base Anima esta entrenada para anime y contenido no fotorrealista; la propia descripcion de la base advierte de que no funciona bien en realismo. No es un modelo generalista.
- **Idioma de los prompts**: todos los ejemplos estan en ingles y usan vocabulario tipo Danbooru (etiquetas separadas por comas, `score_9`, `absurdres`). El rendimiento con prompts en castellano no esta documentado y probablemente sea inferior.
- **Dependencia de etiquetas de artista**: el modelo responde a referencias `@nombre` de artistas reales. Esto plantea riesgos de imitation de estilo con implicaciones eticas y legales, especialmente en uso comercial.
- **Artefactos propios de la difusion**: no hay datos que descarten problemas tipicos como manos y dedos deformados, incoherencia entre personajes en escenas multitudinarias o texto ilegible dentro de la imagen.
- **Riesgo de sobreajuste al estilo del merge**: al ser una fusion de pesos, el rango estilistico puede ser mas estrecho que el de la base y responder peor a prompts fuera de la estetica sketchy/hand-drawn o fuera del vocabulario de etiquetas esperado.
- **Trazabilidad limitada**: no se documentan los modelos intermedios del merge, los ratios de fusion ni los pasos de inferencia recomendados, lo que dificulta reproducir resultados o auditar la procedencia de los pesos.
- **Ausencia de benchmarks**: no hay métricas objetivas de calidad, fidelidad al prompt ni diversidad.
- **Fecha de publicacion atipica**: el repositorio figura creado el 24 de octubre de 2026 y el modelo publicado en Civitai el 3 de julio de 2026; conviene verificar la ficha original antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Quiho/MASTER_ANIMA_AniMaster_AniMaster_Base_1.0_V1_checkpoint
- Civitai (modelo original): https://civitai.com/models/2546307/masteranima-animaster
- CivArchive (ficha y listado de ficheros): https://civarchive.com/models/2546307?modelVersionId=3093052
- Tungsten (notas del autor sobre el merge y DMD2): https://tungsten.run/model/FmPicEYCUe
- Civitai, Anima base-v1.0: https://civitai.com/models/2458426/anima?modelVersionId=2945208
- CivArchive, Anima base-v1.0: https://civarchive.com/models/2458426?modelVersionId=2945208

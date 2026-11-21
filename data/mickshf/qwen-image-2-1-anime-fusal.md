# MicksHF/Qwen-Image-2.1-Anime-Fusal

## Resumen

Qwen-Image-2.1-Anime-Fusal es un adaptador LoRA de tipo text-to-image e image-to-image desarrollado por MicksHF, diseñado para transferir un estilo ilustrado de anime sobre los checkpoints base Qwen/Qwen-Image-2.1 y Qwen/Qwen-Image-2.1-Turbo. El repositorio publica dos familias de LoRA independientes y no intercambiables, una para el modelo base original (non-Turbo) y otra experimental para la variante Turbo destilada a 8 pasos. Su relevancia actual radica en que ofrece control de estilo fino sobre un modelo de difusion de gran tamano, con triggers de estilo y una estructura de prompt jerarquica pensada para produccion.

La version principal, Exact R80 V3, corrige artefactos de textura tipo carton que aparecian en V2 y anade cinco estilos de renderizacion anime controlables mediante frases trigger. El adaptador incorpora el text encoder BF16 Heretic correspondiente, ya que el entrenamiento cacheo embeddings de prompt y referencia con ese encoder. El repo ocupa 34,4 GB e incluye pesos en formato safetensors.

Esta ficha describe exclusivamente la informacion publicada por el autor en la model card; los datos no presentes se marcan como no disponibles. El modelo esta orientado a ilustracion anime, uso por adultos e investigacion, y no debe confundirse con un modelo de lenguaje: es un adaptador de difusion para generacion de imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre modelo de difusion Qwen-Image-2.1; text encoder BF16 Heretic incluido |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (license_name: qwen-research, license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre el modelo de difusion Qwen-Image-2.1, con relacion base_model_relation: adapter. Se publican dos variantes: la familia Original (non-Turbo) sobre Qwen/Qwen-Image-2.1, con versiones Exact R80 V3 (recomendada) y V2 (legacy), y una variante Turbo E6 Preview R128 sobre Qwen/Qwen-Image-2.1-Turbo, marcada como experimental. El autor indica que entrenar LoRA sobre modelos Turbo destilados a pasos provoca una perdida significativa de capacidad de aprendizaje de estilos finos, texturas y conocimiento de personajes, por lo que la variante Turbo se ofrece solo como preview.

En V3 se bloquearon los bloques tardios del decodificador de pixeles ciego al texto (img_mlp) y se redirigio la adaptacion de estilo hacia capas de atencion front/mid conscientes del texto. Esto elimina el grano tipo carton que se filtraba en V2 sobre pieles lisas y superficies cel-shaded. El entrenamiento cacheo embeddings de prompt y referencia con el text encoder BF16 Heretic incluido en el repo. No se especifican en la informacion disponible el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO (no aplicable a difusion).

## Capacidades

- Generacion de imagenes text-to-image con estilo anime e ilustracion.
- Image-to-image y multi-reference: acepta imagenes de referencia para composicion y personajes.
- Cinco triggers de estilo controlables en V3: Flat Cel, Clean Modern Cel, Polished Semi-Impasto, Heavy Painterly / Gouache y Watercolor Wash & Ink Sketch.
- Estructura de prompt jerarquica con secciones [TASK], [Subject], [Appearance], [Pose], [Composition], [Environment], [Lighting] y [Style].
- Correccion de texturas superficiales (piel lisa y cel-shading limpio) frente a V2.
- Compatibilidad con ComfyUI y con la libreria diffusers.
- Ajuste de fuerza LoRA entre 0,7 y 1,0, con CFG / true CFG fijado a 1,0.
- No se documentan capacidades de tool calling, agentes, vision, audio ni thinking mode, por tratarse de un modelo de imagen.

## Casos de uso

- Ilustracion editorial de anime: el adaptador permite generar ilustraciones con estilo cel-shaded limpio usando el trigger Flat Cel y prompts estructurados, adecuado para portadas y articulos con coherencia de estilo.
- Creacion de personajes multi-referencia: con image-to-image y multi-reference se pueden mantener rasgos de personaje entre distintas poses y composiciones, util para hojas de personaje y bibles visuales.
- Storyboarding de animacion: la estructura de prompt por secciones ([Pose], [Composition], [Lighting]) facilita generar frames coherentes para previsualizacion de escenas.
- Produccion de arte para videojuegos: los cinco triggers de estilo permiten alternar entre render limpio moderno y estilos pictoricos tipo gouache para assets de distintos biomas o menus.
- Iteracion en ComfyUI: al ser compatible con ComfyUI, se integra en grafos de trabajo existentes con control de fuerza LoRA y pasos de muestreo (25 pasos por defecto, 20 para layouts simples, 30-40 para composiciones complejas).
- Exploracion investigadora de transferencia de estilo: util para estudiar como LoRA sobre modelos de difusion grandes absorbe estilos finos y como el bloqueo de capas tardias afecta texturas, comparando V2 y V3.
- Generacion de ilustraciones para publicaciones orientadas a adultos: el modelo declara uso para adultos e investigacion, adecuado para contenido ilustrado de tematica adulta dentro de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye comparaciones visuales Base-vs-LoRA y ejemplos de inferencia, pero no cifras de metricas como FID, CLIP score o similitud de estilo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo pesa 34,4 GB e incluye el text encoder BF16 Heretic, lo que implica requisitos elevados.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU consumer: no disponible; el tamano del repo y el text encoder BF16 sugieren que no cabe comodamente en GPUs consumer de gama media.
- Opciones de despliegue: diffusers, ComfyUI y el Space oficial (FUSAL Anime Playground). No se documenta vLLM, llama.cpp ni TGI, logicos para un modelo de difusion.
- Latencia y throughput: no disponibles. Parametros de muestreo recomendados: 25 pasos por defecto en Original, 20 pasos para layouts simples, 30-40 para composiciones complejas; Turbo fijado a 8 pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Estilos controlables | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Anime-Fusal (Original R80 V3) | LoRA anime sobre difusion | Qwen/Qwen-Image-2.1 | 5 triggers | qwen-research | Recomendado |
| Qwen-Image-2.1-Anime-Fusal (Turbo E6 Preview R128) | LoRA anime sobre difusion destilada | Qwen/Qwen-Image-2.1-Turbo | no disponible | qwen-research | Preview experimental |
| Qwen-Image-2.1-Anime-Fusal (Original R80 V2) | LoRA anime sobre difusion | Qwen/Qwen-Image-2.1 | no disponible | qwen-research | Legacy |

No se dispone de datos de rendimiento comparativo con otros adaptadores anime de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Los LoRA Original y Turbo no son intercambiables; cargar uno sobre el base equivocado degrada el resultado.
- No apilar V3 con V2 ni con Turbo; sustituir V2 directamente por V3 sobre Qwen/Qwen-Image-2.1.
- La variante Turbo sufre perdida significativa de calidad y capacidad frente a Original, por su destilacion agresiva a 8 pasos.
- V2 presenta artefactos de textura tipo carton que V3 corrige; usar V3 para pieles lisas y cel-shading.
- Licencia qwen-research: restricciones para uso comercial no detalladas en la informacion disponible; verificar el archivo LICENSE antes de produccion.
- Uso declarado para adultos e investigacion; no apto para contenido no consentido ni menores.
- Riesgo de sesgos y alucinacion visual (artefactos, incoherencias anatomicas) inherente a modelos de difusion; no se documentan sesgos especificos.
- Idiomas soportados no disponibles; el prompt estructurado esta descrito en ingles.
- Requiere respetar la fuerza LoRA 0,7-1,0 y CFG 1,0; valores fuera de rango degradan el estilo.

## Enlaces

- Hugging Face: https://huggingface.co/MicksHF/Qwen-Image-2.1-Anime-Fusal
- Space oficial (FUSAL Anime Playground): https://huggingface.co/spaces/MicksHF/Qwen-Image-2.1-Anime-Fusal-Playground
- Modelo base original: https://huggingface.co/Qwen/Qwen-Image-2.1
- Modelo base Turbo: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Licencia (LICENSE en el repo): https://huggingface.co/MicksHF/Qwen-Image-2.1-Anime-Fusal/blob/main/LICENSE

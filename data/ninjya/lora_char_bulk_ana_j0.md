# NINJYA/lora_char_bulk_ana_j0

## Resumen

`lora_char_bulk_ana_j0` es un adaptador LoRA de tipo personaje para generación de imágenes, entrenado por NextraLabs y publicado por el usuario NINJYA en Hugging Face. El adaptador se ha entrenado sobre el modelo base `moodyMossMix`, un modelo de difusión basado en arquitectura MOSS DiT (Diffusion Transformer) orientado a ilustración de estilo anime. El LoRA tiene como objetivo reproducir un personaje concreto, identificado en la model card como "グロ幼女A 亡骸リリス" (una figura de estética gore/loli dentro del ecosistema de ilustración japonesa).

El modelo se distribuye como un archivo LoRA de rango 16 y alpha 8, con un tamaño de repositorio de aproximadamente 0,1 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo. Su uso previsto es la carga directa en ComfyUI mediante el nodo LoRA Loader, sin necesidad de conversión de formato. No se trata de un modelo de lenguaje ni de un modelo multimodal de texto: es un adaptador de difusión para imagen, por lo que las secciones de esta ficha relativas a contexto, tool calling o benchmarks de texto no aplican y se marcan como no disponibles.

La relevancia de esta ficha es limitada fuera del nicho de generación de personajes anime con MOSS-Image: se trata de un adaptador de personaje de un solo autor, sin métricas publicadas, sin pipeline declarado en Hugging Face y sin descargas ni interacciones en el momento de la consulta. La información disponible procede exclusivamente de la model card y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (lora_generic) sobre modelo de difusión MOSS DiT (`moodyMossMix`) |
| Parametros totales | no disponible (adaptador LoRA de rango 16; el modelo base no declara recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (LoRA en precisión nativa; el modelo base admite las cuantizaciones propias de MOSS-Image, no detalladas) |
| Idiomas soportados | no disponible (los prompts de imagen dependen del modelo base; la model card está en japonés e inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | no disponible explícitamente; compatible con el nodo LoRA Loader de ComfyUI sin conversión |
| Rank / Alpha | 16 / 8 |
| Modelo base | moodyMossMix (MOSS DiT) |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 8, es decir, un factor de escala efectivo de 0,5, aplicado sobre las capas de un Diffusion Transformer (MOSS DiT) correspondiente al checkpoint `moodyMossMix`. La elección de rango 16 es habitual en adaptadores de personaje para difusión: suficiente para capturar rasgos faciales, vestuario y paleta cromática del personaje, pero lo bastante bajo como para mantener el archivo en torno a 0,1 GB y evitar sobreajuste severo sobre el estilo del modelo base.

No se dispone de información sobre el dataset de entrenamiento: ni número de imágenes, ni resolución, ni composición, ni si se aplicaron técnicas de regularización (caption dropout, prior preservation) o de aumento de datos. Tampoco se documenta si el entrenamiento usó captions automáticos (por ejemplo, BLIP o WD14 tagger) ni el número de pasos o epochs. La model card solo indica la etiqueta `lora_generic` como tipo de red, lo que sugiere un entrenamiento estándar sin arquitecturas auxiliares (no hay menciones a LoCon, LyCORIS ni DoRA).

## Capacidades

- Generación de imágenes del personaje "グロ幼女A 亡骸リリス" sobre el modelo base `moodyMossMix`, con estética anime y temática gore/loli según la descripción del autor.
- Integración directa en ComfyUI mediante el nodo LoRA Loader, sin pasos de conversión de formato.
- Compatibilidad con el ecosistema MOSS-Image, lo que permite combinarlo con otros LoRA y con el pipeline de muestreo del modelo base.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un adaptador de difusión, no un modelo de lenguaje.
- No dispone de capacidades multilingües propias; la calidad del prompt depende del tokenizador de texto del modelo base.
- No dispone de modo thinking, visión, audio ni ninguna capacidad multimodal más allá de la generación de imagen condicionada por texto.

## Casos de uso

- Ilustración de personaje consistente en serie: cargar el LoRA en ComfyUI junto al checkpoint `moodyMossMix` y fijar una semilla y un prompt de personaje para producir un conjunto de imágenes con rasgos coherentes (rostro, vestuario, paleta) a lo largo de varias generaciones.
- Prototipado de personajes para proyectos doujin: el adaptador permite generar bocetos y variantes de pose de un personaje concreto antes de encargar arte final, reduciendo el coste de iteración en publicaciones amateur.
- Creación de material para publicaciones en plataformas como BOOTH, DLsite o FANZA: el autor enlaza explícitamente estos canales, de modo que el LoRA encaja en flujos de trabajo de círculos doujin que publican ilustraciones y cómics.
- Composición con otros LoRA de estilo: al ser un adaptador de bajo rango (16/8), puede combinarse con LoRA de estilo o de fondo en ComfyUI, ajustando los pesos de cada uno para mantener la identidad del personaje sin perder la estética global.
- Generación de variaciones controladas por prompt negativo: útil para explorar expresiones y encuadres del personaje manteniendo la coherencia, siempre que el modelo base responda bien a los tags de anime empleados en el entrenamiento.
- Integración en pipelines de generación por lotes: al ser un archivo de 0,1 GB, se puede cargar y descargar rápidamente en entornos con GPU de consumo, lo que facilita la producción por lotes de imágenes para catálogos o galerías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de imagen (FID, CLIP score, similitud de personaje), ni comparaciones cuantitativas con otros adaptadores, ni datos de velocidad de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende enteramente del modelo base `moodyMossMix` (MOSS DiT), cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponibles. Al tratarse de un LoRA de 0,1 GB, el adaptador en sí no añade carga de VRAM significativa; el límite lo impone el checkpoint base.
- Compatibilidad con GPU de consumo: el adaptador es ligero, pero la viabilidad en GPUs consumer (RTX 3060, 4060, 4090) depende del modelo base y de la resolución de muestreo, datos no publicados.
- Opciones de despliegue: ComfyUI con el nodo LoRA Loader es el método documentado por el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros adaptadores LoRA de personaje comparables, ni datos de rendimiento que permitan una comparación rigurosa con alternativas de la misma categoría. Los únicos datos objetivos disponibles son el rango (16), el alpha (8), el tamaño del repositorio (0,1 GB) y el modelo base (`moodyMossMix`).

## Limitaciones y advertencias

- Contenido sensible: la model card describe el personaje con términos que remiten a estética gore y a representación de menores ("グロ幼女"), lo que puede infringir políticas de contenido de plataformas y legislación sobre material de abuso infantil en función de la jurisdicción. Es responsabilidad del usuario verificar la legalidad y las condiciones de uso antes de generar o distribuir imágenes.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (cláusulas de uso aceptable que prohíben, entre otros, contenido ilegal, daño a menores o desinformación). Es obligatorio revisar el texto completo de la licencia antes de desplegar el modelo en producción.
- Sin métricas ni validación publicada: no hay benchmarks, ni ejemplos de salida, ni número de descargas o likes que permitan evaluar la calidad o la fidelidad del personaje. El adaptador tiene 0 descargas y 0 likes en el momento de la consulta.
- Dependencia estricta del modelo base: el LoRA está entrenado para `moodyMossMix`; su uso sobre otros checkpoints MOSS-Image puede degradar la calidad o romper la identidad del personaje.
- Riesgo de sobreajuste y de reproducción de sesgos del dataset: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de representación ni el riesgo de memorización de imágenes concretas.
- Idiomas y prompting: la model card está en japonés e inglés y no se documentan los tags de activación del personaje, lo que dificulta reproducir el resultado previsto sin experimentación.
- Fecha de creación anómala: los metadatos indican 2026-11-17, posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/NINJYA/lora_char_bulk_ana_j0
- Civitai del autor: https://civitai.com/user/fyoneyone9448
- BOOTH de NextraLabs: https://nextralabos.booth.pm/
- DLsite (perfil del círculo): https://www.dlsite.com/aix/circle/profile/=/maker_id/RG01072314.html
- FANZA (perfil del autor): https://dojin.dmm.co.jp/fan/member/71447
- X (Twitter) del autor: https://x.com/kinbakulife

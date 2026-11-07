# SeeSee21/SeeMoss-Genesis

## Resumen

SeeMoss-Genesis es un modelo de generación de imágenes texto-a-imagen desarrollado por el usuario independiente SeeSee21 (Sebastian). Se trata de un fine-tune del modelo base OpenMOSS-Team/MOSS-Image-SFT, un transformer de difusión (DiT) de aproximadamente 5.000 millones de parámetros publicado por OpenMOSS bajo licencia Apache 2.0. El objetivo del autor es trasladar su estilo personal de ilustración anime —personajes detallados, fondos ricos, estética pixel-art y referencias a Game Boy— a esta nueva base, reutilizando el mismo dataset que empleó en su anterior modelo See-Krea2-Genesis.

El modelo se distribuye en formato safetensors con variantes de cuantización fp8, int8, nvfp4 e int4, y está pensado para su uso en ComfyUI. Incluye dos triggers de personaje entrenados (`seesee_elf` y `seesee_kitsune`) y admite prompting en lenguaje natural, listas de tags y layouts en JSON, capacidades heredadas de la base MOSS-Image. La versión publicada es una *Preview* temprana: según la propia model card, los pesos aún se estaban subiendo en el momento de la publicación (7 de noviembre de 2026), por lo que el repositorio aparece con 0 GB y sin descargas.

Es relevante ahora porque MOSS-Image es una base reciente con licencia permisiva y buena capacidad de renderizado de texto, y este checkpoint demuestra el flujo de adaptación de estilos comunitarios (anime, pixel-art) sobre ella, además de ofrecer una variante Turbo para generación en pocos pasos (CFG 1, 4–8 pasos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer), ~5B parámetros según la model card |
| Parametros totales | ~5.000 millones (aproximado, indicado por el autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen; no se especifica longitud de prompt en tokens) |
| Tipos de cuantizacion | fp8, int8, nvfp4, int4 |
| Idiomas soportados | en (inglés; el dataset incluye material en japonés para texto/manga, no confirmado como capacidad fiable) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SeeMoss-Genesis es un fine-tune sobre MOSS-Image-SFT, un modelo de difusión basado en transformer (DiT) de aproximadamente 5.000 millones de parámetros. El autor no detalla en la información disponible la composición exacta del dataset de entrenamiento, el número de pasos, la resolución de entrenamiento ni si se aplicaron técnicas como RLHF, DPO o destilación. Sí indica que se empleó el mismo dataset que en su modelo previo See-Krea2-Genesis, orientado a ilustración anime detallada, fondos elaborados, estética pixel-art y capturas inspiradas en Game Boy, e incluye material con texto en inglés y japonés (incluido material de manga).

La innovación principal respecto a la base es la incorporación de dos triggers de personaje entrenados (`seesee_elf` y `seesee_kitsune`) y la adaptación del estilo visual del autor. La base MOSS-Image aporta soporte de prompting en lenguaje natural, listas de tags y layouts en JSON; el autor advierte que el control por JSON sigue en pruebas y que las cajas delimitadoras funcionan como indicación fuerte pero no como control pixel-perfect. Existe una variante Preview-Turbo destinada a generación rápida con CFG 1 y 4–8 pasos, lo que sugiere algún tipo de destilación por pasos, aunque no se especifica el método.

## Capacidades

- Generación de imágenes texto-a-imagen con pipeline `text-to-image`.
- Ilustración anime: personajes femeninos detallados y fondos ricos, con atención conjunta a personaje y escena.
- Estilo pixel-art solicitable mediante frases como "pixel art".
- Imágenes inspiradas en Game Boy, a partir de capturas propias incluidas en el dataset.
- Dos triggers de personaje entrenados: `seesee_elf` y `seesee_kitsune`, que deben colocarse al inicio del prompt positivo con la ortografía exacta.
- Prompting en lenguaje natural largo (recomendado por el autor), listas de tags y layouts en JSON heredados de la base MOSS-Image.
- Renderizado de texto: la base es fuerte en texto, pero el autor no ha confirmado la legibilidad en esta Preview; debe tratarse como algo a probar.
- Integración con ComfyUI mediante workflows publicados por el autor.
- Generación rápida en la variante Preview-Turbo (CFG 1, 4–8 pasos).

## Casos de uso

- Ilustración anime por encargo: el modelo genera personajes femeninos detallados con vestuario, iluminación y fondos complejos a partir de descripciones largas en lenguaje natural, adecuado para encargos de ilustración o concept art.
- Creación de personajes consistentes: usando los triggers `seesee_elf` o `seesee_kitsune` al inicio del prompt se obtiene un personaje recurrente, útil para series de ilustraciones, cómics o fichas de personaje.
- Estética pixel-art y retro: para assets de videojuegos indie, sprites promocionales o ilustraciones con look Game Boy, solicitando "pixel art" u otras frases equivalentes.
- Composición controlada por layout: el soporte de JSON y cajas delimitadoras de la base permite indicar la posición aproximada de elementos en la escena, útil para maquetas, portadas o ilustraciones con jerarquía espacial definida.
- Prototipado rápido en ComfyUI: la variante Preview-Turbo con 4–8 pasos y CFG 1 permite iterar bocetos a bajo coste computacional antes de renderizar la versión final a más pasos.
- Generación de material promocional para comunidades de anime: escenas con texto en inglés o japonés (signos, carteles) que el autor incluyó en el dataset, aunque la legibilidad del texto debe validarse en cada caso.
- Exploración de estilo para artistas: servir de referencia visual para definir dirección de arte antes de producir ilustraciones finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un DiT de ~5B parámetros, la variante fp8 o int8 requeriría del orden de 6–10 GB de VRAM, y la int4 podría situarse por debajo de 6 GB, pero estas cifras no están confirmadas por el autor.
- GPU recomendadas: no especificadas. Por tamaño del modelo, una RTX 4090 (24 GB) o una A100/H100 permitirían ejecutar las variantes de mayor precisión con margen.
- ¿Cabe en GPU de consumo? Probablemente sí en las cuantizaciones int8/int4/fp8 en GPUs con 8–12 GB o más, pero no hay confirmación oficial.
- Opciones de despliegue: ComfyUI es el entorno para el que el autor publica workflows; el formato safetensors es compatible con pipelines de difusión habituales. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de imagen).
- Latencia y throughput: no disponibles. La variante Preview-Turbo (CFG 1, 4–8 pasos) está pensada para reducir el coste frente a los 50 pasos del ejemplo de prompt de la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| SeeMoss-Genesis | ~5B | DiT (fine-tune de MOSS-Image-SFT) | Apache 2.0 | Anime, pixel-art, triggers propios | Preview; pesos en subida en el momento de la publicación |
| OpenMOSS-Team/MOSS-Image-SFT | ~5B | DiT | Apache 2.0 | Base generalista texto-a-imagen con prompting natural, tags y JSON | Público en Hugging Face |
| See-Krea2-Genesis | No disponible | Fine-tune (base no indicada en la información) | No disponible | Mismo estilo anime del autor sobre otra base | Publicado por el mismo autor |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Versión Preview: el autor advierte que es un lanzamiento temprano, sujeto a actualizaciones, y que en el momento de la publicación los pesos aún se estaban subiendo (repositorio con 0 GB y 0 descargas).
- Legibilidad de texto no confirmada: aunque la base MOSS-Image renderiza bien texto, el autor no ha verificado cómo se comporta en esta Preview; la ortografía, el lettering y los textos largos deben probarse, no darse por garantizados.
- Control por JSON en pruebas: las cajas delimitadoras del layout JSON funcionan como indicación fuerte, no como control preciso de la composición.
- Idioma: la model card declara únicamente inglés; el material en japonés del dataset no se presenta como capacidad fiable de generación de texto.
- Sesgos: no documentados por el autor; al ser un fine-tune de anime con dataset propio, puede heredar sesgos estéticos y de representación de la base y de los datos empleados.
- Riesgo de alucinación visual: no evaluado; en modelos de difusión se manifiesta como anatomía incorrecta, texto deformado o elementos incoherentes con el prompt.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar las condiciones de la base MOSS-Image-SFT y de los materiales del dataset del autor antes de explotación comercial.
- Dependencia de ComfyUI: los workflows publicados están orientados a ese entorno; otros pipelines requerirían adaptación manual.
- Sin métricas de rendimiento publicadas: no hay benchmarks que permitan estimar calidad objetiva frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/SeeSee21/SeeMoss-Genesis
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Perfil del autor en Hugging Face: https://huggingface.co/SeeSee21
- Civitai (versiones Preview, Preview-Turbo, Text Encoder, VAE): https://civitai.red/models/3031179
- Workflows en Civitai: https://civitai.red/models/3031981
- Ficha en Social Diffusion: https://socialdiff.net/checkpoints/62899

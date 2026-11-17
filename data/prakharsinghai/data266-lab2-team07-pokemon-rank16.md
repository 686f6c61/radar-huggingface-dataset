# prakharsinghAI/data266-lab2-team07-pokemon-rank16

## Resumen

`prakharsinghAI/data266-lab2-team07-pokemon-rank16` es un adaptador LoRA de rango 16 para generación de imágenes texto-a-imagen, entrenado sobre el modelo base `stable-diffusion-v1-5/stable-diffusion-v1-5`. Lo desarrollan Prakhar Kumar Singh y Kanika en el marco de la asignatura DATA266 (Lab 2), y su propósito es especializar el modelo base en la generación de ilustraciones con estilo Pokémon a partir del dataset `reach-vb/pokemon-blip-captions`. No es un modelo fundacional ni un checkpoint completo: se trata de un conjunto de pesos de adaptación de bajo rango que se cargan sobre el UNet del modelo base mediante la librería `diffusers`.

El adaptador se entrenó con 749 imágenes de entrenamiento y 84 de test, 1000 pasos de optimizador, learning rate de 1e-4, batch de 1 y acumulación de gradiente de 4, con semilla 266. El entrenamiento completo duró aproximadamente 1894,7 segundos y alcanzó una asignación máxima de memoria de GPU de 3,03 GiB, lo que lo sitúa en el rango de un experimento docente reproducible en hardware de consumo.

Su relevancia es limitada y de carácter académico: el propio autor indica que el adaptador finalmente seleccionado para el proyecto es el de rango 8, no este de rango 16, y que el uso previsto es exclusivamente docente y de investigación no comercial. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar materializados en el repositorio o que el tamaño reportado no refleja el contenido real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion v1.5 (diffusers) |
| Parametros totales | no disponible (adaptador LoRA de rango 16; no se especifica el número de parámetros entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (el autor recomienda cargar el base con `variant="fp16"`) |
| Idiomas soportados | no disponible (los prompts dependen del text encoder del modelo base, CLIP) |
| Licencia | CreativeML OpenRAIL-M (base); dataset fuente `cc-by-nc-sa-4.0`; uso solo docente/investigación no comercial |
| Formato de pesos | pesos LoRA compatibles con `diffusers` (`pipe.load_lora_weights`) |
| Modelo base | `stable-diffusion-v1-5/stable-diffusion-v1-5` en el commit `451f4fe16113bff5a5d2269ed5ad43b0592e9a14` |
| Dataset de entrenamiento | `reach-vb/pokemon-blip-captions` en el commit `3790f29981f74ca26bf11662048342e19c5b615e` |
| Rango LoRA | 16 |
| Pasos de optimizador | 1000 |
| Learning rate | 0.0001 |
| Batch / acumulación | 1 / 4 |
| Semilla | 266 |
| Tiempo de entrenamiento | 1894,7024570619997 s |
| Pico de memoria GPU | 3,0302681922912598 GiB |
| SHA-256 del adaptador | `ceea1af931e5d45df41f7201a93adfe055f029518b09e5fddf486c5750503679` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre el UNet de Stable Diffusion v1.5, un modelo de difusión latente con text encoder CLIP. No se introduce ninguna modificación arquitectónica más allá de las matrices de bajo rango propias de LoRA; el pipeline de inferencia es el estándar `StableDiffusionPipeline` de `diffusers`, cargando el base fijado en el commit indicado con `variant="fp16"` y aplicando después `pipe.load_lora_weights("prakharsinghAI/data266-lab2-team07-pokemon-rank16")`.

El entrenamiento se realizó sobre el dataset `reach-vb/pokemon-blip-captions` (749 imágenes de train, 84 de test), con 1000 pasos de optimizador, learning rate 1e-4, batch 1, acumulación de gradiente 4 y semilla 266. El autor no detalla la composición exacta de los datos ni si hubo etapas de RLHF/DPO (no aplicables en un modelo de difusión de este tipo). La innovación técnica es mínima: se trata de un ejercicio de ajuste fino con LoRA en un entorno docente, sin decodificación especulativa, atención lineal ni otras optimizaciones. El autor advierte explícitamente que estos resultados corresponden a la Parte 2 guardada y no a un nuevo entrenamiento, y que el adaptador final seleccionado del proyecto es el de rango 8, no este de rango 16.

## Capacidades

- Generación de imágenes texto-a-imagen especializadas en estilo Pokémon, condicionadas por prompts de texto.
- Ajuste de estilo visual limitado al dominio del dataset de entrenamiento (ilustraciones tipo Pokémon).
- Compatibilidad con el ecosistema `diffusers`: carga mediante `load_lora_weights`, composición con el pipeline estándar de Stable Diffusion v1.5.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo de difusión).
- No se documentan capacidades multilingües específicas; la cobertura de idiomas depende del text encoder CLIP del modelo base.
- No se documentan modos especiales como thinking mode, visión o audio.
- El autor recomienda mantener activado el safety checker del pipeline.

## Casos de uso

- Docencia y prácticas de ajuste fino: reproducción del experimento DATA266 Lab 2 para estudiar el efecto del rango LoRA (16 frente al rango 8 seleccionado) sobre la calidad de generación.
- Generación de ilustraciones de estilo Pokémon para prototipos y demos internas no comerciales: el adaptador produce imágenes en el dominio del dataset de entrenamiento con el pipeline estándar de `diffusers`.
- Investigación sobre evaluación de modelos generativos: los autores reportan métricas KID, CLIP y LPIPS que permiten analizar la calidad y la diversidad de las muestras en un entorno controlado.
- Comparación de adaptadores de bajo rango: al existir una variante de rango 8 en el mismo proyecto, sirve para estudiar el compromiso entre capacidad de ajuste y sobreajuste.
- Experimentos de reproducibilidad: el entrenamiento es ligero (3,03 GiB de pico de GPU, ~1895 s) y puede repetirse en una GPU de consumo para validar resultados.
- Estudio de sesgos y limitaciones de los modelos de difusión en dominios con propiedad intelectual: permite analizar cómo el ajuste fino sobre personajes con derechos afecta a la generación y a las consideraciones legales.
- No se recomienda su uso en producción comercial, atención al cliente, generación de código ni tareas de razonamiento, por no ser el propósito del modelo ni estar permitido por su licencia.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KID (mean) | 0,043733976781368256 |
| KID (std) | 0,00449789222329855 |
| CLIP | 31,086230091750622 |
| LPIPS | 0,7081000238656998 |

El autor advierte que el KID se calculó con solo 20 imágenes generadas en dominio y es ruidoso, y que estos resultados corresponden a la Parte 2 guardada, no a un nuevo entrenamiento. No se midió la preferencia humana para el rango 16 con el conjunto de pares existente. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento reportó un pico de 3,03 GiB de asignación de GPU, por lo que la inferencia con el base en fp16 debería caber en GPUs de consumo con 6-8 GB de VRAM o más.
- GPU recomendadas: no disponibles; por el tamaño del experimento, una RTX 3060/4060 o superior es suficiente para inferencia y reproducción del entrenamiento.
- Cabe en GPU de consumo: sí, según el pico de memoria reportado durante el entrenamiento (3,03 GiB).
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` (método recomendado por el autor); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `data266-lab2-team07-pokemon-rank16` (este) | LoRA rango 16 sobre SD v1.5 | no aplica | KID 0,0437; CLIP 31,09; LPIPS 0,708 | CreativeML OpenRAIL-M; uso no comercial | Hugging Face, 0 descargas |
| `data266-lab2-team07-pokemon-rank8` (variante del mismo proyecto) | LoRA rango 8 sobre SD v1.5 | no aplica | no disponible en la información | CreativeML OpenRAIL-M | no disponible en la información |
| Stable Diffusion v1.5 (base) | ~860M en UNet (no confirmado en la información) | no aplica | no disponible | CreativeML OpenRAIL-M | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación de rendimiento no puede completarse.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente; al entrenarse sobre un dataset de Pokémon, hereda los sesgos visuales y de estilo de ese dominio.
- Riesgo de alucinación: no aplica en el sentido de texto, pero el autor advierte de artefactos, débil adherencia composicional y cobertura de estilo estrecha.
- Limitaciones de contexto o idioma: no se documentan idiomas soportados; la cobertura depende del text encoder CLIP del base.
- Restricciones de licencia: uso exclusivamente docente y de investigación no comercial; el base usa CreativeML OpenRAIL-M y el dataset fuente reporta `cc-by-nc-sa-4.0`; los derechos de los personajes Pokémon permanecen con sus titulares y el acceso al dataset no concede derechos sobre los personajes.
- Caveat importante para producción: el autor indica que el adaptador final seleccionado del proyecto es el de rango 8, no este de rango 16; además, los resultados guardados no provienen de un nuevo entrenamiento y la preferencia humana para el rango 16 no se midió.
- El repositorio reporta 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que puede indicar que los pesos no están materializados o que el tamaño no refleja el contenido real.
- Se recomienda mantener activado el safety checker del pipeline.

## Enlaces

- Hugging Face: https://huggingface.co/prakharsinghAI/data266-lab2-team07-pokemon-rank16
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Librería diffusers: https://github.com/huggingface/diffusers
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.

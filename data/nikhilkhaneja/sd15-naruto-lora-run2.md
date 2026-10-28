# nikhilkhaneja/sd15-naruto-lora-run2

## Resumen

`sd15-naruto-lora-run2` es un adaptador LoRA de rango 16 entrenado sobre Stable Diffusion 1.5 para generar imágenes con estética del universo Naruto. Lo publica el usuario nikhilkhaneja como parte de la asignatura DATA 266 Lab 2 (Team 42), utilizando el dataset `lambdalabs/naruto-blip-captions`, compuesto por aproximadamente 1.200 imágenes con leyendas generadas por BLIP. No es un modelo completo, sino un conjunto de pesos delta que se aplican sobre el UNet y las capas de atención del modelo base.

El entrenamiento consistió en 1.200 pasos con una tasa de aprendizaje de 1e-4, sin que la model card detalle el optimizador, el tamaño de lote, la resolución de entrenamiento ni el hardware empleado. El resultado es un adaptador de dominio estrecho: funciona razonablemente bien con prompts cercanos al estilo y los personajes del dataset, y puede ignorar o degradar prompts fuera de dominio.

Su interés es fundamentalmente educativo y metodológico: sirve como ejemplo reproducible de ajuste fino de bajo coste sobre un modelo de difusión latente de 860 M de parámetros (UNet), y como caso de estudio de sobreajuste con datasets pequeños. A fecha de la información disponible, el repositorio no tiene descargas ni valoraciones, y no se han publicado evaluaciones cuantitativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16) sobre Stable Diffusion 1.5, modelo de difusión latente con UNet, text encoder CLIP ViT-L/14 y VAE |
| Parametros totales | Adaptador: no disponible. Modelo base SD 1.5: ~860 M en el UNet (dato del modelo base, no de la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (generación text-to-image). Resolución nativa y resolución de entrenamiento: no disponibles en la model card |
| Tipos de cuantizacion | No especificados por el autor; el adaptador se usa junto al base en fp16/fp32. Otras conversiones no documentadas |
| Idiomas soportados | No disponible. El dataset emplea leyendas en inglés y el text encoder de SD 1.5 está entrenado principalmente en inglés |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | Adaptador LoRA para diffusers (repositorio de 0,1 GB); formato de serialización concreto no indicado en la model card |

## Arquitectura y entrenamiento

El adaptador se monta sobre Stable Diffusion 1.5, un modelo de difusión latente que combina un autoencoder variacional (VAE) para comprimir imágenes a un espacio latente de menor dimensión, un UNet que predice el ruido en ese espacio y un text encoder CLIP ViT-L/14 que proyecta el prompt a embeddings de condicionamiento. La técnica LoRA introduce matrices de baja dimensión en las capas de atención, de modo que solo se entrenan esos parámetros adicionales mientras el resto del modelo permanece congelado. En este caso el rango es 16, un valor moderado que permite capturar estilo y rasgos del dominio sin un coste de almacenamiento elevado.

El entrenamiento se realizó sobre `lambdalabs/naruto-blip-captions`, con aproximadamente 1.200 imágenes y leyendas BLIP, durante 1.200 pasos y con una tasa de aprendizaje de 1e-4. La model card no documenta el número de épocas, el tamaño de lote, la resolución de las imágenes, el optimizador, el scheduler de ruido ni si se aplicaron técnicas como *dropout* de texto o aumento de datos. Tampoco se indica si hubo validación, *early stopping* o selección de *checkpoints*; el repositorio contiene un único resultado de la ejecución ("run2"). No se emplearon técnicas de alineación tipo RLHF o DPO, habituales en modelos de lenguaje pero no aplicables de forma directa a este pipeline de difusión.

## Capacidades

- Generación de imágenes text-to-image condicionada por prompts en inglés, aplicando un sesgo estilístico y de personajes propio del dataset Naruto.
- Aplicación como adaptador LoRA sobre Stable Diffusion 1.5, combinable con otros LoRA del ecosistema diffusers (con los conflictos habituales cuando se solapan estilos).
- Personalización ligera de estilo: reproducción de rasgos visuales presentes en el dataset de entrenamiento (paleta, composición, diseño de personajes).
- Integración en pipelines de generación por lotes mediante `diffusers` y `peft`, así como en interfaces como ComfyUI, Automatic1111 o SD.Next.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso, agentes ni planificación.
- No procesa texto libre como un LLM: no hay generación de lenguaje, código ni matemáticas.
- No dispone de modo *thinking*, visión de entrada, audio ni vídeo.
- Capacidades multilingües: no documentadas; el condicionamiento efectivo se limita, en la práctica, al inglés.

## Casos de uso

- Prácticas docentes de ajuste fino: el adaptador sirve para ilustrar el flujo completo de entrenamiento LoRA sobre un modelo de difusión, desde la carga del dataset hasta la inferencia, con un coste de cómputo bajo y un repositorio de 0,1 GB.
- Prototipado rápido de estética anime: para equipos que necesitan explorar un estilo concreto antes de invertir en un *fine-tuning* completo o en un modelo propietario, el LoRA permite generar variaciones en minutos sobre una GPU de consumo.
- Generación de *placeholders* visuales en desarrollo de interfaces: ilustraciones de relleno para maquetas de videojuegos, aplicaciones o demostraciones internas donde no se requiere calidad de producción.
- Investigación sobre sobreajuste en datasets pequeños: con unas 1.200 imágenes y 1.200 pasos, el modelo es un caso útil para medir deriva de estilo, olvido de conceptos y sensibilidad al prompt.
- Experimentos de composición de LoRA: combinarlo con adaptadores de estilo o de personaje para estudiar interferencias entre pesos de bajo rango en el UNet.
- Demostraciones educativas de sesgos y derechos de autor: permite discutir en el aula por qué un dataset con personajes protegidos condiciona el uso comercial del resultado, incluso cuando la licencia del adaptador lo permitiría en principio.
- Generación de imágenes de referencia para documentación interna o pruebas de *pipeline* de imagen (redimensionado, recorte, etiquetado), sin vocación de distribución pública.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas con otros adaptadores o con el modelo base.

## Requisitos de hardware

- VRAM para inferencia: el adaptador en sí ocupa 0,1 GB, pero requiere cargar el pipeline completo de Stable Diffusion 1.5. En fp16, el conjunto UNet + VAE + text encoder se sitúa típicamente en el entorno de 4 GB de VRAM; con resolución 512x512 y *batch* 1, 6-8 GB son suficientes.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM. Una RTX 3060, RTX 4060 o RTX 4070 es adecuada; una RTX 4090 o A100 aportan margen para lotes mayores y mayores resoluciones, aunque están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más. También es posible ejecutarlo en CPU, con latencias muy superiores y no cuantificadas en la información disponible.
- Opciones de despliegue: `diffusers` + `peft` (carga del adaptador con `load_lora_weights`), ComfyUI, Automatic1111/Forge, SD.Next e InvokeAI. Para entornos sin GPU, existen alternativas de ejecución en CPU no documentadas por el autor.
- Latencia y throughput: no disponibles. Dependen de la GPU, de la resolución, del número de pasos y del scheduler, parámetros que la model card no especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sd15-naruto-lora-run2 | LoRA r=16 sobre SD 1.5 (~860 M en UNet) | No especificada; base SD 1.5 nativa 512x512 | Sin benchmarks publicados | CreativeML OpenRAIL-M | HuggingFace, 0 descargas |
| LoRA generico sobre SD 1.5 | LoRA de rango variable sobre el mismo UNet | 512x512 nativa | Depende del dataset; habitualmente con evaluaciones informales | CreativeML OpenRAIL-M | Amplia disponibilidad en HuggingFace y Civitai |
| Fine-tuning completo de SD 1.5 | ~860 M en UNet, todos los pesos actualizados | 512x512 nativa | Mayor capacidad de ajuste, mayor riesgo de sobreajuste | CreativeML OpenRAIL-M | Requiere GPU de mayor VRAM y checkpoints de 2-4 GB |
| LoRA sobre SDXL | LoRA sobre un UNet de ~2,6 B (dato del modelo base) | 1024x1024 nativa | Mayor fidelidad y adherencia al prompt en general | CreativeML OpenRAIL++-M | Amplia disponibilidad; requiere más VRAM |

Las cifras de parámetros y resolución de los modelos base provienen de la documentación pública de Stability AI y no están verificadas en esta model card. Para este adaptador concreto no existe ninguna comparación cuantitativa publicada.

## Limitaciones y advertencias

- Dataset de dominio muy estrecho (~1.200 imágenes): los prompts fuera del estilo o de los personajes de Naruto pueden ignorarse o producir resultados estilísticamente incoherentes, tal como advierte el propio autor.
- Riesgo alto de sobreajuste: 1.200 pasos sobre 1.200 imágenes puede provocar memorización parcial de las imágenes de entrenamiento y escasa variabilidad.
- Sesgos no evaluados: no se ha analizado el sesgo de representación de personajes, géneros, edades o corporalidades presente en el dataset original.
- Riesgo de alucinación visual: el modelo puede generar anatomías incorrectas, texto ilegible y artefactos propios de SD 1.5, especialmente con prompts complejos o composiciones con múltiples sujetos.
- Propiedad intelectual: Naruto es una obra protegida. El propio autor indica que el dataset es de uso exclusivamente no comercial y que el adaptador es para investigación y educación.
- Restricciones de licencia: CreativeML OpenRAIL-M permite uso comercial con condiciones, pero las restricciones de uso del modelo base y los derechos sobre los personajes representados limitan de facto la explotación comercial del resultado.
- Idiomas: no hay soporte multilingüe documentado; los prompts en castellano probablemente rindan peor que en inglés.
- Ausencia de evaluación: sin métricas, sin comparaciones y con cero descargas, no hay evidencia externa de calidad ni de mantenimiento futuro.
- Sin garantías de producción: no hay versionado semántico, ni pruebas de regresión, ni documentación de parámetros de inferencia recomendados (CFG, scheduler, *negative prompt*).

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/nikhilkhaneja/sd15-naruto-lora-run2)
- [Modelo base: stable-diffusion-v1-5](https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5)
- [Dataset: lambdalabs/naruto-blip-captions](https://huggingface.co/datasets/lambdalabs/naruto-blip-captions)
- [Licencia CreativeML OpenRAIL-M](https://huggingface.co/spaces/CompVis/stable-diffusion-license)

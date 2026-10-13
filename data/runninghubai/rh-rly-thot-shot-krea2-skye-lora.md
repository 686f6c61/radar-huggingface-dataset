# RunningHubAI/rh-rly-thot-shot-krea2-skye-lora

## Resumen

rh-rly-thot-shot-krea2-skye-lora es un adaptador LoRA de imagen publicado por la cuenta RunningHubAI en Hugging Face en nombre del autor acreditado como Liw Pnh en la plataforma RunningHub. Se trata de un LoRA de personaje de 218 MiB en formato safetensors (bf16) afinado a partir del modelo base krea2, orientado a la generación y edición de imágenes de un personaje femenino concreto llamado Skye, que se activa mediante la palabra clave `rlyskye`. El repositorio ocupa 0,2 GB y lleva la etiqueta de pipeline `image-text-to-image`, con compatibilidad declarada con ComfyUI, RunningHub y Hugging Face.

No es un modelo de lenguaje ni un sistema de razonamiento: es un conjunto de pesos de bajo rango que modifica el comportamiento de un modelo de difusión base para fijar la identidad visual de un personaje. Su relevancia es operativa dentro de flujos de creación de imagen: permite reproducir de forma consistente el mismo personaje en poses, estilos y escenas distintas sin reentrenar el modelo completo, algo habitual en producción de cómic, avatares y contenido ilustrado por encargo.

La ficha no declara licencia, idiomas soportados ni resultados de benchmarks, y el modelo acumula 0 descargas y 0 likes en el momento de la consulta. La fecha de creación registrada en Hugging Face es el 13 de octubre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión krea2; rango y dimensiones internas no disponibles |
| Parametros totales | no disponible (el archivo de pesos del adaptador pesa 218 MiB en bf16) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión); no disponible |
| Tipos de cuantizacion | bf16 en el archivo publicado; no se declaran otras cuantizaciones |
| Idiomas soportados | no disponibles (los prompts se escriben en texto; el idioma no está declarado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base de difusión para modificar su comportamiento sin alterar los pesos originales. La model card indica únicamente `Finetuned from: krea2`, sin detallar el número de pasos de entrenamiento, el tamaño del dataset, la composición de las imágenes de entrenamiento ni la resolución objetivo. El listado de Civitai del mismo modelo lo asocia a la combinación «QWEN2.1 + KREA 2 + ZiB/ZiT», aunque esa información no se confirma en la ficha oficial de Hugging Face.

La activación del personaje se realiza mediante la palabra clave `rlyskye`, incrustada en el prompt. No se documentan técnicas de RLHF, DPO ni decodificación especulativa, ya que no aplican a este tipo de adaptador. Tampoco se especifica si el entrenamiento se realizó sobre un modelo base de arquitectura transformer de difusión estándar o sobre una variante concreta del ecosistema ComfyUI, ni si se emplearon técnicas de regularización para evitar el sobreajuste del personaje.

## Capacidades

- Generación de imágenes a partir de prompt de texto (text-to-image) condicionada por la palabra clave `rlyskye`.
- Edición de imagen de entrada (image-text-to-image) según la etiqueta de pipeline declarada.
- Reproducción consistente de la identidad visual del personaje Skye en distintas poses, escenas y estilos.
- Integración en flujos de ComfyUI mediante nodos de carga de LoRA.
- Ejecución en la plataforma en la nube RunningHub y a través de su API.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente, razonamiento multi-paso ni planificación.
- No tiene capacidades de audio, vídeo ni visión analítica; solo síntesis y edición de imagen.
- No se declaran capacidades multilingües ni idiomas concretos de prompt.

## Casos de uso

- Ilustración seriada de un personaje: generar un conjunto de imágenes del mismo personaje con identidad coherente para una colección o galería, invocando `rlyskye` en cada prompt y variando únicamente la pose, el vestuario y el entorno.
- Cómic y narrativa visual: producir viñetas de un personaje recurrente manteniendo su rostro y proporciones entre páginas, reduciendo la deriva de identidad que aparece al usar solo el modelo base.
- Avatares y retratos para redes sociales o videojuegos: generar retratos del personaje en distintos estilos (realista, ilustrado, anime) a partir del mismo LoRA para poblar catálogos de avatares.
- Edición y reestilizado de imágenes existentes: usar el modo image-text-to-image para transformar fotografías o bocetos en versiones del personaje conservando la composición original.
- Preproducción de conceptos de personaje: iterar rápidamente sobre variantes de diseño antes de encargar arte final a un ilustrador humano.
- Material promocional y fan art por encargo: generar piezas personalizadas bajo pedido en estudios pequeños, donde la consistencia del personaje es un requisito contractual.
- Automatización por lotes en ComfyUI: encadenar el LoRA en grafos con otros nodos (upscalers, ControlNet, IP-Adapter) para producir series completas de imágenes de forma desatendida.
- Integración vía API de RunningHub: invocar el modelo desde un servicio externo para ofrecer generación de personaje como funcionalidad dentro de una aplicación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No existen métricas objetivas declaradas (FID, CLIP score, similitud de identidad facial ni comparativas con otras LoRA de personaje) ni validación por parte de terceros.

## Requisitos de hardware

- El adaptador en sí ocupa 218 MiB, pero la VRAM necesaria para la inferencia la determina el modelo base krea2 completo, cuyo tamaño no se especifica en la información disponible.
- No es posible ofrecer una cifra fiable de VRAM para inferencia al desconocerse el tamaño y la arquitectura exacta del modelo base.
- GPU recomendadas: no disponibles. La idoneidad de A100, H100, RTX 4090 u otras depende del modelo base, no del LoRA.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; depende del modelo base y de la cuantización empleada.
- Opciones de despliegue: ComfyUI (flujo local declarado), RunningHub (ejecución en nube y API). Otros runners como vLLM, llama.cpp, Ollama o TGI no aplican, ya que están orientados a modelos de lenguaje, no a adaptadores de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-rly-thot-shot-krea2-skye-lora | LoRA de personaje | krea2 | 218 MiB (bf16) | no disponible | Hugging Face, RunningHub, Civitai |
| rh-krea.2-ai-lora | LoRA de imagen | krea2 (según nombre) | no disponible | no disponible | Hugging Face |
| Otras LoRA de la colección RLY Thot Shots | LoRA de personaje | no disponible | no disponible | no disponible | Civitai (colección de 67 elementos) |

Los datos públicos sobre parámetros, contexto, rendimiento y licencia de las alternativas no están disponibles, por lo que no es posible establecer una comparación técnica cuantitativa entre ellas.

## Limitaciones y advertencias

- Licencia no disponible: no se especifican condiciones de uso comercial, por lo que el uso en producción conlleva un riesgo legal hasta que el autor aclare los términos. La ficha indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o del modelo base.
- Dependencia del modelo base: el comportamiento, la resolución y los requisitos de VRAM dependen por completo de krea2 y de su versión concreta; discrepancias de versión en los safetensors pueden degradar o romper el resultado.
- Sobreajuste de personaje: los LoRA de personaje tienden a forzar la identidad entrenada incluso cuando el prompt pide otra, y pueden degradar la calidad en prompts ajenos al personaje.
- Riesgo de artefactos: como todo modelo de difusión, puede producir deformaciones anatómicas, texto ilegible y detalles inconsistentes entre generaciones.
- Sin benchmarks ni validación externa: 0 descargas y 0 likes en el momento de la consulta, sin métricas publicadas ni evaluación independiente.
- Idiomas no declarados: se desconoce qué idiomas de prompt maneja correctamente más allá del inglés, que es el estándar en los prompts técnicos de ComfyUI.
- Contenido: el modelo pertenece a una serie de personajes con descripción de tono desenfadado y referencias de contenido adulto en su contexto original; conviene verificar la política de contenido de la plataforma antes de desplegarlo en un servicio público.
- Sin soporte ni mantenimiento declarados: no hay información sobre actualizaciones, versiones posteriores ni canales de soporte.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-rly-thot-shot-krea2-skye-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2078993261843664897
- Página del autor (@Liw Pnh): https://www.runninghub.ai/user-center/2076937231650095106
- Civitai (RLY Thot Shot - Skye): https://civitai.red/models/2621144/rly-thot-shot-skye-qwen21-krea-2-zibzit
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- LoRA relacionado del mismo autor: https://huggingface.co/RunningHubAI/rh-krea.2-ai-lora

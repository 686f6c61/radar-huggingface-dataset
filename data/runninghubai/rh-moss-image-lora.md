# RunningHubAI/rh-moss-image-lora

## Resumen

`rh-moss-image-lora` es un adaptador LoRA para generación de imágenes, publicado por RunningHubAI bajo la autoría del usuario VividMuse en la plataforma RunningHub. No se trata de un modelo base autónomo, sino de un conjunto de pesos de ajuste fino (567 MiB en formato safetensors) que se aplica sobre el modelo `moss-image` para especializarlo en un personaje original denominado "许清欢" (Xu Qinghuan). Su función es permitir que el modelo base genere de forma consistente a ese personaje concreto mediante una palabra de activación (*trigger word*): `xqh`.

El modelo está orientado al ecosistema ComfyUI y a la plataforma RunningHub, que ofrece tanto entrenamiento como inferencia en la nube. No se dispone de información sobre la arquitectura interna, el número de parámetros del modelo base, la longitud de contexto (no aplica en el mismo sentido que en modelos de lenguaje) ni los datos de entrenamiento empleados. La información pública se limita a la model card del repositorio y a los enlaces a la plataforma del autor.

Su relevancia es acotada: se trata de un LoRA de personaje para un modelo de difusión concreto, útil para quien ya trabaje con `moss-image` y quiera reproducir dicho personaje. No es un modelo de propósito general ni compite con modelos fundacionales de imagen o texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `moss-image`; arquitectura del modelo base no disponible |
| Parámetros totales | no disponible (el fichero de pesos ocupa 567 MiB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica / no disponible |
| Tipos de cuantización | no disponible (se distribuye en safetensors, presumiblemente fp16/bf16, sin confirmar) |
| Idiomas soportados | no disponible (modelo de imagen; la palabra de activación es latina, `xqh`) |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y remite a la licencia del proyecto original |
| Formato de pesos | safetensors (`xqh_moss_v1_000000500.safetensors`) |
| Tamaño del repositorio | 0,6 GB |
| Palabra de activación | `xqh` |
| Modelo base | `moss-image` (fine-tuned from) |
| Plataformas | ComfyUI, RunningHub, Hugging Face |

## Arquitectura y entrenamiento

La información disponible confirma únicamente que se trata de un LoRA ajustado a partir de `moss-image`, con pesos almacenados en un único fichero safetensors de 567 MiB y un nombre que sugiere un checkpoint en el paso 500 (`000000500`). No se especifica el rango del LoRA, las capas objetivo, la resolución de entrenamiento, el número de imágenes del dataset, la composición del mismo ni si se emplearon técnicas como regularización o *captioning* automático.

Tampoco hay datos sobre el modelo base `moss-image`: no se indica su arquitectura (presumiblemente un modelo de difusión latente tipo UNet o DiT, pero no confirmado), su número de parámetros, su tokenizador de texto ni su esquema de entrenamiento. El ajuste parece haberse realizado dentro de la plataforma RunningHub, que ofrece servicios de entrenamiento de LoRA, aunque no se detalla la configuración empleada.

## Capacidades

- Generación de imágenes del personaje original "许清欢" al invocar la palabra de activación `xqh` en el prompt.
- Integración como LoRA en flujos de ComfyUI, cargándolo junto al modelo base `moss-image`.
- Compatibilidad con la plataforma RunningHub para inferencia en la nube mediante su API.
- Especialización de personaje: mantiene la identidad visual del sujeto entrenado a través de distintas poses, escenas e iluminaciones (capacidad esperable en un LoRA de personaje, aunque no documentada explícitamente).
- No se documenta soporte de *tool calling*, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*; son capacidades no aplicables a este tipo de modelo.
- Capacidades multilingües: no documentadas; el prompt se procesa mediante el codificador de texto del modelo base, del que no hay información.

## Casos de uso

- Ilustración de personaje consistente: usar `xqh` en el prompt junto con el LoRA cargado para generar variaciones del personaje en distintas escenas, útil para cómics, storyboards o ficción serializada donde la identidad visual debe mantenerse.
- Creación de *character sheets*: generar hojas de referencia con múltiples ángulos y expresiones del personaje para fijar su diseño antes de producir ilustraciones finales.
- Prototipado rápido en ComfyUI: integrar el LoRA en un *workflow* existente de `moss-image` para iterar sobre conceptos visuales sin reentrenar.
- Producción de arte para proyectos personales: generar ilustraciones del personaje para portadas, avatares o material promocional de contenido propio.
- Pruebas de inferencia vía API de RunningHub: desplegar el LoRA en la nube para generar imágenes sin disponer de GPU local, usando los endpoints documentados por la plataforma.
- Comparación de estilos y *seeds*: evaluar cómo responde el personaje a distintos prompts negativos, pesos de LoRA y samplers dentro de ComfyUI para calibrar la fidelidad del ajuste.
- Base para *fine-tuning* adicional: partir de estos pesos como inicialización para un LoRA derivado con variaciones de vestuario o época, si la licencia del proyecto original lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los repositorios de LoRA de personaje no suelen incluir métricas cuantitativas (FID, CLIP score, similitud facial) y en este caso la model card no aporta ninguna.

## Requisitos de hardware

- VRAM estimada: no disponible para el LoRA aislado; depende enteramente del modelo base `moss-image`, cuyas especificaciones no se documentan. El fichero de 567 MiB es ligero en almacenamiento, pero la inferencia requiere cargar el modelo base completo.
- GPU recomendadas: no disponibles. Al tratarse de un LoRA para un modelo de difusión, lo habitual sería una GPU con al menos 8-12 GB de VRAM para resolución moderada, pero no hay confirmación para `moss-image`.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base y de la cuantización aplicada a este.
- Opciones de despliegue: ComfyUI (principal), plataforma RunningHub (nube y API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Palabra de activación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-moss-image-lora | LoRA de personaje | `moss-image` | `xqh` | no disponible | Hugging Face / RunningHub |
| LoRA de personaje para SDXL (genéricos) | LoRA de personaje | Stable Diffusion XL | variable | variable (a menudo CreativeML OpenRAIL-M) | Hugging Face / Civitai |
| LoRA de personaje para FLUX.1 | LoRA de personaje | FLUX.1 | variable | variable (a menudo no comercial) | Hugging Face |

No se dispone de datos de rendimiento ni de parámetros del modelo base para establecer una comparación cuantitativa con alternativas. La comparación anterior es meramente categórica.

## Limitaciones y advertencias

- Información muy escasa: no hay datos sobre arquitectura del modelo base, dataset de entrenamiento, rango del LoRA ni parámetros de inferencia recomendados.
- Licencia no especificada: la model card remite a la licencia del proyecto original (`moss-image`) sin identificarla; antes de un uso comercial es imprescindible verificar los términos del modelo base y del autor del LoRA.
- Riesgo de sobreajuste al personaje: con un checkpoint en el paso 500 y sin documentación del dataset, es probable que el LoRA reproduzca poses, encuadres o fondos del conjunto de entrenamiento; conviene usar prompts variados y pesos de LoRA moderados.
- Dependencia total del modelo base: sin `moss-image` el LoRA es inutilizable; cualquier cambio o retirada del modelo base deja el adaptador sin soporte.
- Sesgos: no documentados; al ser un personaje concreto, puede arrastrar sesgos de estilo, género o estética presentes en las imágenes de entrenamiento.
- Idiomas: no se documenta qué codificador de texto emplea el modelo base ni su cobertura lingüística; los prompts en castellano podrían no funcionar igual que en inglés o chino.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de calidad fuera de la plataforma del autor.
- Fecha de creación indicada como 2026-11-02: dato anómalo que conviene verificar antes de tomar el repositorio como referencia estable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RunningHubAI/rh-moss-image-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2117181696582963201
- Página del autor (VividMuse): https://www.runninghub.cn/user-center/1972094655640862722
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-moss-image-lora/blob/main/README_cn.md

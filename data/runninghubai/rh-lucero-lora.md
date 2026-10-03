# RunningHubAI/rh-lucero-lora

## Resumen

rh-lucero-lora es un adaptador LoRA de tipo text-to-image publicado por RunningHubAI en HuggingFace. No se trata de un modelo de lenguaje ni de un modelo base, sino de un fichero de pesos de bajo rango (81 MiB, `20261001-124305.safetensors`) que se aplica sobre el modelo de difusión Z-image-turbo para reproducir un personaje concreto. Su función es actuar como «character LoRA»: aprende la identidad visual de un sujeto descrito en la model card y la inyecta en el pipeline de generación cuando se invoca la palabra clave.

El modelo está pensado para ejecutarse en ComfyUI, en la plataforma RunningHub o mediante la API de RunningHub. La única palabra de activación documentada es `LUCERO`, y la descripción del personaje incluye rasgos físicos y de textura de piel muy específicos, lo que indica un ajuste orientado a la consistencia de identidad más que a una mejora general del modelo base.

Su relevancia es acotada: se enmarca en el ecosistema de LoRAs de personaje para flujos de trabajo de generación de imagen, un segmento donde la reproducibilidad de un mismo rostro y cuerpo entre distintas generaciones es el principal requisito. No hay información pública sobre el dataset de entrenamiento, la licencia efectiva ni métricas objetivas de calidad, por lo que cualquier evaluación debe hacerse de forma empírica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Z-image-turbo; no disponible el detalle de rango, alpha o capas objetivo |
| Parametros totales | no disponible (el fichero de pesos ocupa 81 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (los prompts se procesan a traves del codificador de texto del modelo base) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original (Z-image-turbo) |
| Formato de pesos | safetensors (`20261001-124305.safetensors`, 81 MiB) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se suman a los pesos de las capas de atención del modelo base Z-image-turbo. No se publican el rango del adaptador, el valor de alpha, las capas concretas modificadas, ni si el entrenamiento se realizó sobre el UNet, el transformer de difusión o también sobre el codificador de texto. El nombre del fichero sugiere una marca temporal de generación automática (2026-10-01 12:43:05), coherente con un pipeline de entrenamiento gestionado por la plataforma RunningHub.

No hay información sobre el número de imágenes de entrenamiento, la resolución, el número de pasos, la tasa de aprendizaje, el uso de regularización o de técnicas como DreamBooth, LoRA clásico o variantes con preservación de identidad. Tampoco se documenta ningún proceso de alineamiento, RLHF o DPO, algo que no aplica a este tipo de modelo. La única información funcional reproducible es la palabra de activación `LUCERO` y la descripción textual del personaje incluida en la model card, que actúa como referencia semántica del ajuste.

## Capacidades

- Generación de imágenes text-to-image con un personaje consistente al invocar la palabra clave `LUCERO`.
- Reproducción de rasgos físicos descritos en la model card: complexión, proporciones corporales, textura de piel realista con poros e imperfecciones, y cabello negro largo ondulado.
- Integración directa en ComfyUI como nodo LoRA sobre el pipeline de Z-image-turbo.
- Ejecución en la plataforma RunningHub, incluida la modalidad de API para uso programático.
- Compatibilidad potencial con otras LoRAs y con prompts negativos o de estilo, siempre que el pipeline de difusión lo permita (no documentado).
- Ajuste fino adicional o mezcla de LoRAs: al ser un adaptador de bajo rango, puede combinarse con otros adaptadores, aunque no hay documentación sobre compatibilidad.
- No dispone de tool calling, razonamiento multi-paso, capacidades de agente, visión, audio ni modo de pensamiento, por no ser un modelo de lenguaje.

## Casos de uso

- Narrativa visual seriada: generar viñetas o ilustraciones de un mismo personaje a lo largo de múltiples escenas manteniendo la identidad facial y corporal, usando `LUCERO` en cada prompt y fijando una semilla por escena para mayor consistencia.
- Prototipado de personajes para videojuegos o animación: producir hojas de personaje (turnarounds) en distintas poses y encuadres antes de pasar al modelado 3D, aprovechando que el LoRA fija una identidad concreta.
- Previsualización de vestuario y estilismo: generar al personaje con distintas prendas y paletas para validar direcciones creativas antes de una sesión fotográfica o de una producción textil.
- Contenido para redes sociales y campañas de marca: crear series de imágenes coherentes con un personaje fijo, encadenando peticiones mediante la API de RunningHub dentro de un flujo automatizado.
- Storyboards y previsualización de guiones: ilustrar secuencias narrativas con continuidad de personaje para presentaciones a clientes o equipos de producción.
- Pruebas de estilo y dirección de arte: combinar el LoRA con LoRAs de estilo o con prompts de iluminación para evaluar cómo responde una misma identidad bajo distintos tratamientos visuales.
- Automatización por API: integrar el adaptador en un servicio propio que reciba un prompt, lo envíe al endpoint de RunningHub y devuelva la imagen generada, útil para generar catálogos o assets bajo demanda.
- Base para ajuste adicional: servir como punto de partida para entrenar variantes del personaje (edad, vestuario, expresiones) reutilizando la identidad ya capturada, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud de identidad facial), ni comparaciones cuantitativas con otros LoRAs de personaje, ni ejemplos de evaluación con prompts estandarizados.

## Requisitos de hardware

- El adaptador por sí solo ocupa 81 MiB en disco, por lo que su almacenamiento y carga no son un cuello de botella.
- El requisito real de VRAM lo determina el modelo base Z-image-turbo, no el LoRA. No se dispone de cifras oficiales de VRAM para ese modelo en la información proporcionada.
- GPU recomendadas: no disponible. Como referencia genérica de la familia de modelos de difusión de imagen, se suele requerir una GPU con al menos 8-12 GB de VRAM en configuraciones con cuantización, y 16-24 GB o más para precisión completa sin optimizaciones; estos valores no están confirmados para este modelo concreto.
- Compatibilidad con GPU de consumo: no confirmada. Sin datos del modelo base no puede afirmarse si cabe en tarjetas como RTX 3060, RTX 4060 Ti o RTX 4090.
- Opciones de despliegue: ComfyUI como entorno principal documentado; RunningHub (plataforma en la nube) y su API; Hugging Face como repositorio de distribución. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados sobre adaptadores comparables en la información proporcionada. La tabla siguiente recoge únicamente lo que puede afirmarse con lo disponible:

| Modelo | Tipo | Modelo base | Tamano del artefacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-lucero-lora | LoRA de personaje | Z-image-turbo | 81 MiB (safetensors) | no disponible | Hugging Face, RunningHub, ComfyUI |
| LoRA de personaje para SDXL (categoria generica) | LoRA de personaje | Stable Diffusion XL | no disponible | variable segun autor | Hugging Face, Civitai |
| LoRA de personaje para FLUX.1 (categoria generica) | LoRA de personaje | FLUX.1 dev/schnell | no disponible | variable segun autor | Hugging Face, Civitai |

No se han encontrado en la información disponible modelos directamente comparables con métricas publicadas frente a este adaptador.

## Limitaciones y advertencias

- Licencia no disponible: la model card no especifica términos de uso. Esto supone un riesgo legal para uso comercial o para redistribución, ya que además remite a la licencia del proyecto original (Z-image-turbo), cuyos términos no se detallan en la información proporcionada.
- Riesgo de contenido sensible: el modelo está entrenado para reproducir un personaje humano concreto con descripciones corporales explícitas. Su uso para generar imágenes de personas reales sin consentimiento puede infringir derechos de imagen y normativas de protección de datos.
- Sin datos de entrenamiento: se desconoce la composición del dataset, si contiene material con derechos de autor, si hubo consentimiento de la persona representada y si se aplicaron filtros de contenido.
- Sesgo de representación: un LoRA de personaje tiende a reproducir un único ideal corporal y estético, lo que reduce la diversidad de las salidas y puede reforzar estereotipos físicos.
- Sobreajuste previsible: los adaptadores de identidad suelen degradar la variedad de poses, expresiones y contextos, y pueden «contaminar» la generación cuando se combinan con otros LoRAs o con prompts alejados del dominio de entrenamiento.
- Dependencia del modelo base: cualquier cambio de versión o de licencia de Z-image-turbo afecta directamente al funcionamiento del adaptador.
- Idiomas no documentados: no se especifica el comportamiento del codificador de texto del modelo base, por lo que la calidad con prompts en castellano es incierta.
- Sin benchmarks ni evaluación independiente: no hay métricas de fidelidad de identidad, coherencia anatómica ni tasas de fallo.
- Repositorio sin tracción: 0 descargas y 0 «likes» en el momento de la consulta, sin histórico de mantenimiento ni issues que permitan juzgar su estabilidad.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, manos deformes o artefactos en texturas, especialmente en resoluciones o composiciones fuera de su dominio.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-lucero-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2105526057637093377
- Página del autor: https://www.runninghub.ai/user-center/2036498236747026434
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Detalle de la API de Seedance 2.5 en RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025

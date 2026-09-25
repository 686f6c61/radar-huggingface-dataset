# RunningHubAI/rh-fusionx-checkpoint

## Resumen

rh-fusionx-checkpoint es un checkpoint para ComfyUI publicado por RunningHubAI, distribuido como un único archivo de pesos en formato safetensors. La model card lo describe como un modelo de generación de vídeo a partir de texto ("fusionxText2video") y lo declara como un fine-tuning de WAN2.1, el modelo de vídeo de código abierto de Alibaba. No es un modelo de lenguaje: es un modelo generativo de vídeo pensado para cargarse en ComfyUI o en la plataforma RunningHub.

La información publicada es mínima: el repositorio ocupa 14,3 GB, contiene un solo archivo (`wan2114BFusionx_fusionxText2video.safetensors`, 13.628 MiB) y no incluye pipeline declarado, licencia explícita, idiomas soportados ni resultados de evaluación. El nombre del archivo sugiere que la base es la variante de 14B parámetros de WAN2.1, aunque el tamaño real del archivo (13,6 GiB) no cuadra con un checkpoint de 14B en bf16 (que rondaría los 28 GB), por lo que lo más probable es que se trate de pesos almacenados en precisión reducida o de una variante distinta. Ese punto no está confirmado en la documentación.

Su relevancia es práctica más que técnica: RunningHub publica checkpoints afinados por su comunidad y los integra en su catálogo de modelos y workflows de ComfyUI, con acceso vía API. Para un desarrollador que quiera generar vídeo corto a partir de texto sin montar el pipeline desde cero, este checkpoint ofrece una vía directa de carga en ComfyUI, pero con muy poca documentación técnica asociada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No documentada en la model card; el autor indica que deriva de WAN2.1 (modelo de difusión para vídeo) |
| Parametros totales | No disponible (el nombre del archivo sugiere la variante de 14B de WAN2.1; no confirmado) |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible (no se especifican resolución, número de frames ni duración máxima de vídeo) |
| Tipos de cuantizacion | No disponibles; se distribuye un único safetensors de 13.628 MiB, compatible con el cargador de checkpoints de ComfyUI |
| Idiomas soportados | No disponibles |
| Licencia | No disponible; la model card remite a "la licencia del proyecto original o upstream" sin especificarla |
| Formato de pesos | safetensors (`wan2114BFusionx_fusionxText2video.safetensors`) |
| Tipo de modelo | Checkpoint text-to-video para ComfyUI |
| Tamaño del repositorio | 14,3 GB |
| Plataformas declaradas | ComfyUI / RunningHub / Hugging Face |
| Fecha de creacion | 24 de septiembre de 2026 (según metadatos del repo) |
| Ultima actualizacion | 24 de septiembre de 2026 (según metadatos del repo) |

## Arquitectura y entrenamiento

La model card no aporta detalles de arquitectura más allá de la etiqueta "checkpoint" y de la indicación "Finetuned from: WAN2.1". No se especifican el tipo de backbone (transformer de difusión, VAE latente, encoder de texto), el número de parámetros, la resolución nativa, el número de frames por clip ni el framerate objetivo. Tampoco se documenta el procedimiento de entrenamiento: no hay información sobre volumen de datos, composición del dataset, número de pasos, uso de fine-tuning por LoRA fusionado, ni sobre técnicas de alineación como RLHF o DPO.

Toda la información sobre el proceso de entrenamiento es, por tanto, no disponible. Lo único verificable es el resultado: un checkpoint único de 13.628 MiB que el autor presenta como modelo de generación de vídeo a partir de texto y que está pensado para cargarse directamente en ComfyUI o en la plataforma RunningHub, que además ofrece servicios de entrenamiento de modelos y ejecución por API.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video): es la única capacidad declarada explícitamente en la model card ("fusionxText2video").
- Carga directa como checkpoint en ComfyUI, integrable en grafos de nodos junto a encoders de texto, VAE y samplers.
- Ejecución en la plataforma RunningHub, tanto en su interfaz como a través de su API HTTP.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingües: no disponibles ni documentadas.
- No se documentan modos especiales (thinking mode, audio, imagen-a-vídeo, control de movimiento, etc.).
- No se documenta soporte de LoRA, ControlNet, inpainting de vídeo ni extensión de clips.

## Casos de uso

- Generación de clips publicitarios cortos: el modelo produce vídeo a partir de una descripción textual, por lo que encaja en flujos de creación de anuncios para redes sociales donde se necesitan tomas breves generadas y regeneradas de forma iterativa dentro de ComfyUI.
- Previsualización de storyboards: un equipo de producción puede convertir guiones en bocetos animados antes de rodar, usando el checkpoint como paso intermedio para validar encuadres, ritmo y ambientación.
- Generación de B-roll para edición: creación de metraje de recurso (paisajes, texturas, planos abstractos) para insertar en un montaje, evitando costes de licencia de bancos de vídeo.
- Prototipado de VFX y motion graphics: generación de planos de referencia que después se recrean en herramientas de composición, útil para presentar una idea al cliente con imagen en movimiento.
- Contenido para redes sociales y canales automatizados: integración vía la API de RunningHub para producir clips de forma programática a partir de textos generados por otro sistema.
- Base para fine-tuning adicional: al ser un checkpoint derivado de WAN2.1, puede servir como punto de partida para afinar un estilo o dominio concreto (por ejemplo, un producto o una estética de marca) usando las herramientas de entrenamiento de RunningHub.
- Demostraciones interactivas en ComfyUI: montaje de un workflow reutilizable que permita a un usuario no técnico escribir un prompt y obtener un clip, con el modelo como único componente pesado del grafo.

En todos los casos, la idoneidad concreta (duración de clip, resolución, coherencia temporal) no puede confirmarse con la información publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas automáticas ni humanas, ni comparaciones cuantitativas con otros modelos de vídeo. Tampoco se documentan en el repositorio velocidades de inferencia, número de pasos de muestreo recomendado ni resolución de salida.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Como referencia orientativa, el archivo de pesos ocupa 13.628 MiB (13,3 GiB), a lo que hay que sumar las activaciones del proceso de difusión de vídeo, típicamente muy superiores a las de un modelo de imagen. Se puede estimar un mínimo práctico de 16-24 GB de VRAM con descarga de módulos a RAM (offloading), aunque es una estimación derivada del tamaño del archivo, no un dato confirmado.
- GPU recomendadas: no documentadas. Por tamaño de pesos, GPUs de 24 GB (RTX 3090, RTX 4090) o superiores (A100 40/80 GB, H100) son las candidatas razonables.
- Cabe en GPU de consumo: probablemente sí en tarjetas de 24 GB con cuantización u offloading, pero no hay confirmación del autor ni requisitos publicados. En tarjetas de 8-12 GB no hay garantía alguna.
- Opciones de despliegue: ComfyUI (plataforma declarada), la propia plataforma RunningHub y su API HTTP. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de vídeo de este tipo. Tampoco se confirma soporte de Diffusers.
- Latencia y throughput: no disponibles. No se publican tiempos por clip, número de pasos ni resolución de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / salida | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| rh-fusionx-checkpoint | No disponible (nombre del archivo sugiere 14B) | No disponible | No disponible (remite al proyecto original) | Hugging Face, ComfyUI, RunningHub | No publicado |
| WAN2.1 (modelo base declarado) | Variantes de 1.3B y 14B según el proyecto original | No disponible en la información proporcionada | No disponible en la información proporcionada | Peso base del que deriva este checkpoint | No disponible en la información proporcionada |
| Otros checkpoints de la misma familia (p. ej. RunningHubAI/rh-qwen-rapid-aio-sfw-v7-checkpoint) | No disponible | No disponible | No disponible | Hugging Face, ComfyUI | No publicado |

No se dispone de datos verificables de benchmarks ni de especificaciones completas del modelo base en la información proporcionada, por lo que la comparación cuantitativa con alternativas como HunyuanVideo, CogVideoX o LTX-Video no puede realizarse sin inventar cifras.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: sin pipeline declarado, sin licencia explícita y sin especificaciones de arquitectura, resolución, duración de clip ni número de frames. Esto dificulta evaluar su idoneidad antes de descargar 14,3 GB.
- Licencia no clara: la model card indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original, sin nombrarla. Antes de un uso comercial es imprescindible verificar la licencia de WAN2.1 y las condiciones de RunningHub; no se puede asumir uso comercial libre.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, anatomías incorrectas, texto ilegible, incoherencias temporales entre frames y movimientos no físicos. La model card no documenta ninguna mitigación.
- Sesgos: no evaluados ni documentados. Los modelos de difusión de vídeo entrenados con datasets web suelen reproducir sesgos demográficos y culturales; no hay información sobre la composición de los datos de entrenamiento.
- Idiomas: no se especifica qué idiomas acepta el prompt. El soporte multilingüe no está garantizado.
- Sin garantías de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta y no hay historial de versiones ni issues.
- Volumen de descarga elevado: 14,3 GB solo para el checkpoint, antes de contar VAE, encoder de texto u otros componentes necesarios en ComfyUI.
- Verificación de integridad recomendada: el nombre del archivo sugiere 14B parámetros, pero el tamaño no es coherente con un checkpoint de 14B en bf16. Conviene validar la arquitectura y precisión reales al cargarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-fusionx-checkpoint
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1942116280050860033
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1942072111794221057
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Catálogo de modelos de RunningHub: https://www.runninghub.ai/models
- Workflows de ComfyUI de RunningHub: https://www.runninghub.ai/workflows
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Perfil de RunningHubAI en Hugging Face: https://huggingface.co/RunningHubAI

# RunningHubAI/rh-p-lora

## Resumen

rh-p-lora es un adaptador LoRA para edición de imágenes orientado específicamente a la modificación de texto dentro de una imagen (*P图改字*, "cambiar el texto de una foto"). Lo publica la plataforma RunningHub (cuenta `RunningHubAI`) a partir de un modelo entrenado por el usuario @H5N1, y está pensado para ejecutarse sobre la familia Qwen-Image-Edit, en concreto sobre los checkpoints Qwen Edit 2509 y Qwen-Edit-2511 según declara su model card.

El problema que resuelve es concreto: reescribir rótulos, carteles, capturas de pantalla de móvil o cualquier texto incrustado en una imagen manteniendo la coherencia visual (tipografía, perspectiva y aspecto del material original) en lugar de generar un parche visible. El autor afirma que la versión basada en Qwen2511 mejora la consistencia en la edición de texto y cubre casos como capturas de pantalla de móvil o letreros de tienda.

Es relevante porque los adaptadores de este tipo permiten añadir una capacidad muy específica (edición tipográfica fiel) a un modelo base grande sin reentrenarlo. El repositorio es pequeño (0,9 GB) y contiene únicamente pesos LoRA en safetensors, no el modelo base: dos ficheros de 281 MiB y 563 MiB. La licencia, los idiomas soportados y los requisitos de hardware no están documentados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de edición de imagen Qwen Edit 2509 / Qwen-Edit-2511; arquitectura interna del modelo base no disponible en la información proporcionada |
| Parámetros totales | no disponible (el repositorio solo publica los pesos del adaptador LoRA, no el modelo base) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuyen únicamente ficheros `.safetensors`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible; la palabra de activación publicada está en chino (改为) |
| Licencia | no disponible. La model card indica que se publica en nombre del autor, que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o del proyecto upstream |
| Formato de pesos | safetensors (LoRA) |
| Modelo base declarado | Qwen Edit 2509 y Qwen-Edit-2511 |
| Tamaño del repositorio | 0,9 GB |
| Ficheros de pesos | `p图改字.safetensors` (281 MiB) y `Qwen2511_P图改字v1.safetensors` (563 MiB) |
| Palabra de activación | 改为 |
| Peso recomendado | 1.0, en combinación con los workflows indicados por el autor |
| Pipeline declarado | image-text-to-image |

## Arquitectura y entrenamiento

No se dispone de detalles técnicos del entrenamiento en la información proporcionada: no se indican número de tokens, composición del dataset, resolución de entrenamiento, número de pasos, método de optimización ni si hubo fases de ajuste por preferencias (RLHF/DPO). Lo único documentado es que se trata de un LoRA para edición de imagen (*image edit*), afinado a partir de Qwen Edit 2509 y Qwen-Edit-2511, y que el autor destaca una mejora en la consistencia de la modificación de texto en la variante basada en Qwen2511.

La innovación declarada es funcional más que arquitectónica: el adaptador se especializa en reescribir texto sobre imágenes reales (capturas de pantalla de móvil, letreros de tienda y casos similares) consiguiendo un efecto continuo, es decir, sin que se aprecie la sustitución. Al ser un LoRA, se espera que se cargue junto al modelo base dentro de ComfyUI o en la plataforma RunningHub, con un peso recomendado de 1.0. La model card apunta a un workflow concreto como forma de uso prevista.

## Capacidades

- Edición de texto sobre imágenes: sustitución de cadenas de texto ya presentes en la imagen por un texto nuevo.
- Coherencia visual en la modificación: el objetivo declarado es un resultado continuo y sin costuras en tipografía, orientación y aspecto del soporte original.
- Casos específicos citados por el autor: modificación de texto en capturas de pantalla de móvil y en letreros o carteles de tienda.
- Funcionamiento como adaptador LoRA sobre Qwen Edit 2509 y Qwen-Edit-2511, cargable en ComfyUI.
- Ejecución en la nube mediante la plataforma RunningHub y su API.
- No se documentan en la información disponible capacidades de *tool calling*, uso agéntico, razonamiento multi-paso, visión general, audio, modo *thinking* ni soporte multilingüe explícito.

## Casos de uso

- Localización de capturas de pantalla de aplicaciones móviles: se toma una captura en un idioma y se reescribe el texto de la interfaz en otro, manteniendo el aspecto del sistema original. El modelo está entrenado específicamente para este escenario según el autor.
- Actualización de cartelería en fotografía comercial: cambiar el texto de un letrero o rótulo en una fotografía de local o de producto sin volver a rodar la imagen.
- Corrección de erratas en material gráfico ya publicado: sustituir una palabra mal escrita en un banner, anuncio o infografía sin rehacer el diseño.
- Adaptación de creatividades publicitarias por mercado: generar variantes de un mismo anuncio con el texto ajustado a cada país o campaña, partiendo de una única imagen base.
- E-commerce y packaging: modificar nombres de producto, tallas o promociones impresas en envases y etiquetas para distintas referencias.
- Documentación técnica y tutoriales: mantener actualizadas las capturas de pantalla de un manual cuando cambia la interfaz, reescribiendo solo las etiquetas afectadas.
- Prototipado rápido en ComfyUI: integrar el LoRA en un grafo de edición por prompt de imagen y texto para iterar sobre propuestas de diseño.
- Automatización por API: encadenar la edición de texto dentro de un flujo gestionado en RunningHub para procesar lotes de imágenes sin intervención manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los adaptadores son pequeños (281 MiB y 563 MiB), por lo que su huella adicional sobre el modelo base es marginal; el requisito real de VRAM viene determinado por Qwen Edit 2509 / Qwen-Edit-2511, cuyas cifras no se documentan en este repositorio.
- GPU recomendadas: no disponible en la información proporcionada.
- Encaje en GPU de consumo: no disponible; depende del modelo base y del nivel de cuantización que se aplique a este, no del LoRA.
- Opciones de despliegue: ComfyUI está soportado de forma explícita (etiqueta `comfyui` en el repositorio), así como la ejecución en la nube mediante RunningHub y su API. No se mencionan vLLM, TGI, llama.cpp ni Ollama; estos motores están orientados a modelos de lenguaje y no aplican a un adaptador de difusión para edición de imagen.
- Latencia y throughput: no disponible.
- Almacenamiento necesario: 0,9 GB para el repositorio completo, más el espacio del modelo base que se utilice.

## Comparativa con modelos similares

No se dispone de datos de rendimiento, parámetros ni contexto de alternativas comparables en la información proporcionada. La siguiente tabla recoge únicamente lo que puede afirmarse con los datos disponibles.

| Modelo | Tipo | Tamaño de pesos | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-p-lora | LoRA para edición de imagen | 281 MiB + 563 MiB | Modificación de texto en imágenes | no disponible | Hugging Face (RunningHubAI/rh-p-lora) |
| Qwen Edit 2509 (modelo base) | Modelo de edición de imagen | no disponible | Edición general de imagen guiada por texto | no disponible | upstream, no incluido en este repositorio |
| Qwen-Edit-2511 (modelo base) | Modelo de edición de imagen | no disponible | Edición general de imagen guiada por texto | no disponible | upstream, no incluido en este repositorio |

No se identifican en la información proporcionada otros adaptadores LoRA de la misma categoría (edición tipográfica) con datos verificables para comparar.

## Limitaciones y advertencias

- Licencia sin especificar: la model card remite a la licencia del proyecto original o upstream y mantiene el copyright en el autor. Antes de un uso comercial es imprescindible aclarar los términos, tanto del LoRA como del modelo base sobre el que se aplique.
- El repositorio contiene solo pesos LoRA: sin el modelo base Qwen Edit 2509 o Qwen-Edit-2511 no es funcional. Hay que verificar por separado la licencia de esos checkpoints.
- Sesgos conocidos: no disponibles. Al ser un modelo de edición de imagen, hereda los sesgos del modelo base y de los datos de entrenamiento, que no se documentan.
- Riesgo de alucinación visual: no evaluado en la información disponible. En tareas de reescritura de texto, un fallo típico esperable es la deformación de tipografía o la aparición de caracteres incorrectos, pero no hay datos publicados al respecto.
- Cobertura de idiomas sin documentar: la palabra de activación está en chino y no se detalla qué alfabetos o idiomas maneja bien la edición de texto.
- Requiere una palabra de activación concreta (改为) y un peso recomendado de 1.0; el comportamiento fuera de esa configuración no está documentado.
- Dependencia de un workflow concreto: el autor recomienda usarlo con un flujo de trabajo publicado en RunningHub, lo que condiciona la reproducibilidad fuera de esa plataforma.
- Es un modelo con 0 descargas y 0 *likes* en el momento de la consulta, sin validación independiente ni benchmarks publicados; conviene tratarlo como un recurso no verificado para entornos de producción.
- No se documentan limitaciones de contexto (resolución máxima, relación de aspecto, número de pasos de inferencia) ni requisitos de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-p-lora
- Workflow recomendado por el autor: https://www.runninghub.cn/post/2000768295085240322
- Página original del modelo en RunningHub: https://www.runninghub.cn/model/public/2000778713967063041
- Página del autor: https://www.runninghub.cn/user-center/1902159358849884162
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model

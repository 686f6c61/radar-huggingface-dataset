# RunningHubAI/rh-plump-lips-lora

## Resumen

`rh-plump-lips-lora` es un adaptador LoRA de edición de imagen publicado por RunningHubAI y atribuido al usuario @氛围感. Está ajustado a partir del modelo base `krea2` y se distribuye como un único archivo `safetensors` de 218 MiB dentro de un repositorio de 0,2 GB. Su función declarada es modificar la apariencia de los labios —volumen y forma— en flujos de imagen condicionados por texto, dentro del ecosistema ComfyUI y de la plataforma RunningHub.

No se trata de un modelo fundacional ni de un modelo de lenguaje: es un adaptador de bajo rango que se aplica sobre un modelo de difusión para imágenes. El repositorio no documenta la arquitectura interna de `krea2`, el rango del LoRA, el conjunto de datos de entrenamiento ni los hiperparámetros utilizados. Tampoco se especifica una licencia concreta: la model card indica que el copyright permanece con el autor y remite a la licencia del proyecto original.

Su relevancia práctica es doble. Por un lado, ejemplifica el patrón de personalización barata mediante LoRAs: un archivo de 218 MiB permite modificar un rasgo facial localizado sin reentrenar el modelo base. Por otro, su publicación en Hugging Face y su integración en RunningHub facilitan probarlo por API o en ComfyUI sin infraestructura propia. El repositorio figura con 0 descargas y 0 likes, por lo que no cuenta con validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base `krea2`; la arquitectura del base no está documentada |
| Parámetros totales | no disponible; no se declaran rango, alpha ni número de parámetros del adaptador. El archivo pesa 218 MiB |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; modelo de imagen. La longitud del prompt la determina el text encoder de `krea2` |
| Tipos de cuantización | no disponible; el adaptador se distribuye en `safetensors` sin precisión declarada. La cuantización del base (fp16, bf16, fp8, GGUF, etc.) no se especifica |
| Idiomas soportados | no disponible; depende del text encoder del base. La model card está en inglés y chino |
| Licencia | no disponible; copyright del autor. Se remite a la licencia del proyecto original/upstream, sin especificarla |
| Formato de pesos | `safetensors` (archivo único de 218 MiB) |
| Modelo base | `krea2` (`Finetuned from: krea2`) |
| Tarea | `image-text-to-image`; edición de imagen mediante LoRA |
| Palabras de activación | no disponible; el autor remite a la URL original para consultar los prompts |
| Resolución de entrenamiento | no disponible |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos) | 2026-10-17 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (*Low-Rank Adaptation*) aplicado sobre `krea2`. Los LoRA introducen matrices de bajo rango en capas seleccionadas del modelo base y se entrenan manteniendo congelados los pesos originales; en inferencia, el efecto del adaptador se controla con un peso o escala. La model card no especifica qué módulos se adaptaron, ni el rango, ni el alpha utilizado.

No se documentan datos de entrenamiento: número de imágenes, composición del dataset, pasos, optimizador, learning rate, captions, resolución o regularización. Tampoco se indica si se usó RLHF o DPO, algo que no resulta aplicable a un LoRA de imagen. La única información técnica disponible es que el ajuste parte de `krea2` y que el resultado se distribuye como un archivo `safetensors` de 218 MiB. El pipeline declarado es `image-text-to-image`, lo que implica que el adaptador está pensado para edición condicionada por una imagen de entrada y un prompt de texto.

## Capacidades

- Edición localizada de rasgos faciales: modifica el volumen y la forma de los labios en imágenes de entrada, según la descripción textual y el peso del LoRA.
- Integración en ComfyUI: puede cargarse con los nodos habituales de LoRA y combinarse con el modelo base `krea2` en un grafo de edición de imagen.
- Flujo `image-text-to-image`: acepta una imagen de referencia y un prompt; no está pensado para generación puramente textual sin imagen.
- Ajuste de intensidad: al ser un LoRA, su efecto puede regularse mediante el peso en el nodo de carga; no se documenta un valor recomendado.
- Compatibilidad con RunningHub: el autor ofrece ejecución en su plataforma y acceso mediante API.
- No es un modelo de lenguaje: no genera texto, código ni matemáticas, y no soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo multimodal general: procesa imágenes como parte del pipeline de difusión, pero no las describe ni mantiene conversaciones sobre ellas.
- Capacidades multilingües: no disponibles; la cobertura de idiomas depende del text encoder de `krea2`.
- No se documentan modos especiales como *thinking mode*, audio o vídeo.
- No se especifican palabras de activación ni prompts de ejemplo en el repositorio; el autor remite a la página original.

## Casos de uso

- Retoque de retratos en estudio: cargar una fotografía en un flujo `image-text-to-image` de ComfyUI, aplicar el LoRA con un peso moderado y generar variaciones del volumen labial. Es adecuado porque el adaptador modifica un rasgo concreto sin reentrenar el base y pesa solo 218 MiB.
- Pruebas de concepto para cosmética y estética: generar variaciones visuales de labios para presentaciones internas o comparativas de estilo. El reducido tamaño del adaptador permite iterar en una sola GPU y probar distintos pesos sin grandes costes de almacenamiento.
- Previsualización de maquillaje y caracterización: combinarlo con otros LoRAs de estilo o maquillaje en ComfyUI para explorar looks antes de una producción fotográfica. Es adecuado porque el efecto está localizado y puede apilarse con otros adaptadores, aunque la combinación no está documentada.
- Creación de avatares y personajes: ajustar rasgos faciales en pipelines de generación de retratos para ficción o contenido editorial. Requiere revisión humana y consentimiento si se parte de imágenes de personas reales.
- Automatización por API en RunningHub: desplegar el flujo en la plataforma y lanzar lotes de edición mediante llamadas API. Es útil para equipos que no quieren mantener infraestructura de GPU propia, aunque la latencia y el coste dependen del servicio.
- Investigación sobre edición facial con LoRAs: medir la sensibilidad al peso del adaptador, los artefactos en dientes y encías, y los sesgos de representación. El tamaño reducido del archivo facilita ablaciones y pruebas repetidas.
- Pruebas de regresión visual en pipelines ComfyUI: incluir el LoRA en una suite de pruebas que compare resultados al cambiar el base, el sampler o la resolución. Sirve para detectar derivas visuales en producción.
- Contenido de ficción y caracterización: modificar rasgos de personajes generados o fotografías autorizadas. No debe emplearse para suplantar la identidad de personas sin consentimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no ser un modelo de lenguaje, no aplican MMLU, HumanEval o GSM8K; tampoco se aportan métricas de imagen como FID, CLIPScore, similitud facial o evaluaciones humanas. No es posible comparar cuantitativamente su calidad frente a otros LoRAs con los datos disponibles.

## Requisitos de hardware

- VRAM para el adaptador: 218 MiB en disco; si se carga en fp16, aproximadamente 0,2 GB de VRAM, sin contar el modelo base.
- VRAM total: no disponible; depende de `krea2`. No se puede confirmar el requisito exacto del conjunto base más LoRA.
- GPU recomendadas: no disponibles para `krea2`; el adaptador no impone una GPU concreta. Como referencia general, los modelos de imagen tipo SDXL suelen funcionar con 8-12 GB de VRAM y los de tipo Flux con 12-24 GB, pero no hay confirmación de a qué familia pertenece `krea2`.
- ¿Cabe en una GPU de consumo? No confirmado; depende del base. El adaptador por sí solo no es el factor limitante.
- Opciones de despliegue: ComfyUI como entorno principal, RunningHub en la nube y mediante API, descarga directa desde Hugging Face y, potencialmente, `diffusers` con PEFT, aunque esta última opción no está documentada.
- `vLLM`, `llama.cpp`, Ollama y TGI no aplican: no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen del modelo base, la resolución, el número de pasos, el sampler y la GPU utilizada.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Parámetros / tamaño | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `rh-plump-lips-lora` | `krea2` | `image-text-to-image` (edición) | 218 MiB; parámetros no disponibles | no aplica | sin benchmarks publicados | no disponible | Hugging Face y RunningHub; 0 descargas |
| `rh-p-lora` | no disponible | `image-text-to-image` | no disponible | no aplica | sin benchmarks publicados | no disponible | Hugging Face; 0 likes |
| `rh-ai-lora` | no disponible | `text-to-image` | no disponible | no aplica | sin benchmarks publicados | no disponible | Hugging Face; 0 likes |

La comparación cuantitativa no es posible: ninguno de los repositorios publica métricas de calidad, datos de entrenamiento ni una licencia concreta. `rh-plump-lips-lora` se distingue por declarar explícitamente el base `krea2` y por especializarse en un rasgo facial concreto; los otros dos adaptadores de RunningHub no especifican su modelo base en la información disponible.

## Limitaciones y advertencias

- Licencia ambigua: no se especifica una licencia concreta. El copyright permanece con el autor y se remite a la licencia del proyecto original/upstream. No se puede asumir uso comercial sin revisar los términos de RunningHub, de `krea2` y de la fuente original en Civitai.
- Contenido para adultos: el nombre del modelo, la temática y el enlace original apuntan a contenido NSFW. Existe riesgo de generar desnudos, contenido sexual o imágenes no consentidas; se requiere moderación, verificación de edad y consentimiento explícito.
- Sesgos de representación: puede reforzar cánones de belleza concretos, sesgos de género y de etnia. No se ha publicado ninguna evaluación de sesgos.
- Alucinación visual y artefactos: pueden aparecer dientes, encías o texturas labiales inconsistentes, especialmente con pesos altos del LoRA. No hay métricas de fidelidad ni de preservación de identidad.
- Limitaciones de contexto e idioma: no aplica una ventana de contexto; la longitud y el idioma del prompt dependen del text encoder de `krea2`. No se declaran idiomas soportados.
- Compatibilidad limitada: solo se declara el base `krea2`. No hay garantía de funcionamiento con otras versiones, otros modelos de difusión o flujos que no sean `image-text-to-image`.
- Reproducibilidad: no se documentan rango, alpha, módulos adaptados, dataset, pasos ni hiperparámetros. No es posible reproducir el entrenamiento a partir de la información publicada.
- Validación comunitaria nula: el repositorio figura con 0 descargas y 0 likes, sin discusiones ni evaluaciones independientes.
- Riesgo de suplantación: no debe usarse para deepfakes, suplantación de identidad o modificación de imágenes de personas sin consentimiento.
- Uso clínico: no es una herramienta de simulación médica ni de diagnóstico. No debe presentarse como predicción de resultados reales de procedimientos estéticos.
- Dependencia de la plataforma: la ejecución en RunningHub y su API introduce dependencias de servicio, coste y políticas de contenido que no se detallan en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-plump-lips-lora
- Archivos del repositorio: https://huggingface.co/RunningHubAI/rh-plump-lips-lora/tree/main
- README en chino: https://huggingface.co/RunningHubAI/rh-plump-lips-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2074868387393662978
- Página del autor: https://www.runninghub.ai/user-center/2041030036219498497
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Fuente original en Civitai (NSFW): https://civitai.red/models/2763430/brkn-krea2-meaty-pussy?modelVersionId=3110177
- Adaptador relacionado `rh-p-lora`: https://huggingface.co/RunningHubAI/rh-p-lora
- Adaptador relacionado `rh-ai-lora`: https://huggingface.co/RunningHubAI/rh-ai-lora

# RunningHubAI/rh-pillow-humping-lora

## Resumen

rh-pillow-humping-lora es un adaptador LoRA de tipo text-to-image publicado por RunningHubAI (RunningHub) en Hugging Face, afinado a partir de Qwen-Image. No es un modelo completo: el repositorio contiene únicamente un fichero de pesos de 281 MiB (`PillowHump_2509.safetensors`) que debe cargarse sobre el modelo base para funcionar. Su función es inyectar un concepto visual concreto en el pipeline de generación, activado mediante las palabras disparadoras `Pillow` y `Humping`.

El modelo está orientado al ecosistema ComfyUI y a la plataforma RunningHub, que actúa como editor, alojamiento y proveedor de API. La model card no documenta parámetros de entrenamiento (rank del LoRA, dataset, pasos, learning rate) ni métricas de calidad, y el repositorio no registra descargas ni valoraciones en el momento de la consulta, por lo que no existe validación pública de su comportamiento.

Por su temática y por las palabras de activación, el adaptador apunta a contenido visual de carácter adulto o fetichista; esto condiciona su uso en producción y exige revisar las políticas de contenido de la plataforma y la licencia del modelo base antes de integrarlo. La relevancia técnica es limitada: se trata de un artefacto de estilo publicado de forma automatizada dentro del catálogo de RunningHub, no de una contribución con documentación metodológica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión text-to-image; arquitectura del modelo base no detallada en la model card |
| Modelo base | Qwen-Image (según la model card) |
| Parametros totales | No disponible (el adaptador se distribuye como pesos LoRA, no como modelo completo; el recuento de parámetros del LoRA no se publica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen; no se especifica límite de tokens del prompt) |
| Tipos de cuantizacion | No disponible. El fichero se distribuye en safetensors; la cuantización aplicable depende del modelo base (no documentada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card indica: "Follow the original project or upstream license", con copyright del autor |
| Formato de pesos | safetensors (`PillowHump_2509.safetensors`, 281 MiB) |
| Tipo de pipeline | text-to-image |
| Palabras de activación | `Pillow`, `Humping` |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,3 GB |
| Etiquetas | comfyui, lora, text-to-image, region:us |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se suman a determinadas capas de un modelo de difusión congelado para modificar su distribución de salida. El modelo base declarado es Qwen-Image, un generador text-to-image de la familia Qwen; la model card no aporta detalles sobre el backbone concreto (bloques MMDiT/DiT, dimensión de atención, número de parámetros del base) ni sobre el rango, alpha o módulos objetivo del adaptador.

No hay información sobre el proceso de entrenamiento: se desconoce el número de imágenes del dataset, su composición, la resolución de entrenamiento, el número de pasos, el optimizador, el learning rate ni si se aplicaron técnicas de regularización o captioning específico. El sufijo `2509` del nombre del fichero sugiere una fecha de generación en septiembre de 2025, pero es una inferencia no confirmada. El repositorio se creó y actualizó con un minuto de diferencia, lo que apunta a una subida automatizada desde la plataforma RunningHub sin revisión documental posterior. Tampoco se documentan innovaciones técnicas (decodificación especulativa, atención lineal, destilación de pasos) porque no las hay declaradas.

## Capacidades

- Generación de imágenes text-to-image condicionada por prompt, mediante inyección del concepto aprendido al activar las palabras `Pillow` y `Humping`.
- Especialización de estilo/concepto: el LoRA modifica la generación del modelo base Qwen-Image hacia la temática concreta para la que fue entrenado.
- Integración en flujos de trabajo de ComfyUI como nodo de carga de LoRA sobre un checkpoint base.
- Ejecución remota a través de la plataforma RunningHub y su API, sin necesidad de infraestructura propia.
- Compatibilidad con el resto de capacidades del modelo base (composición guiada por prompt, control de estilo, отрицательные... ) — no documentadas en esta ficha.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking": no aplica a un LoRA de generación de imagen.
- Capacidades multilingües: no disponibles; no se especifica si las palabras de activación funcionan en prompts en otros idiomas distintos del inglés.

## Casos de uso

- Generación de imágenes temáticas en ComfyUI: cargar el checkpoint de Qwen-Image, añadir el nodo LoraLoader con `PillowHump_2509.safetensors` y usar los triggers `Pillow, Humping` en el prompt positivo para reproducir el concepto entrenado.
- Pruebas de integración de LoRA en pipelines propios: sirve como caso de test para validar la carga de safetensors, el ajuste de pesos (strength 0,6-1,0) y la interacción con el sampler del modelo base.
- Evaluación comparativa de adaptadores del mismo editor: al compartir formato y origen con otros LoRAs de RunningHubAI, permite comparar tamaño de fichero, comportamiento y fidelidad al trigger en igualdad de condiciones.
- Automatización por API: desplegar la generación a través de la API de RunningHub para producir lotes de imágenes sin mantener GPU propia, útil en prototipos de aplicaciones creativas.
- Investigación sobre contenido sensible y filtrado: usar el adaptador como muestra para estudiar cómo los LoRAs comunitarios introducen conceptos NSFW y cómo los filtros de seguridad de la plataforma los detectan o bloquean.
- Archivado y catalogación de artefactos: documentar el modelo en inventarios internos de adaptadores (origen, tamaño, triggers, licencia incierta) para decidir su inclusión o exclusión en catálogos corporativos.
- Formación y demos técnicas: ilustrar en talleres cómo un LoRA de 281 MiB modifica la salida de un modelo base grande sin reentrenarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, ImageReward), comparaciones cuantitativas ni ejemplos de salida evaluados.

## Requisitos de hardware

- Peso del adaptador: 281 MiB en disco; es un componente ligero, pero requiere cargar el modelo base completo (Qwen-Image) para inferir.
- VRAM estimada: no disponible para este LoRA en concreto; depende enteramente del modelo base y de la precisión utilizada. El adaptador añade un coste marginal de VRAM (del orden de centenares de MiB en fp16) sobre el base.
- GPU recomendadas: no especificadas por el autor. Para el modelo base Qwen-Image se suelen emplear A100/H100 (40-80 GB) en bf16, o GPUs consumer de 24 GB (RTX 4090) con cuantización; estas cifras son estimaciones de la familia base, no datos publicados para este LoRA.
- Cabe en GPU consumer: previsiblemente sí, siempre que el modelo base se cargue cuantizado; el adaptador por sí solo no determina el requisito.
- Opciones de despliegue: ComfyUI (escenario nativo), API de RunningHub, y librerías de difusión con soporte PEFT/LoRA. llama.cpp, Ollama y TGI no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen ni imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base declarado | Tamano | Licencia | Descargas / likes |
|---|---|---|---|---|---|
| rh-pillow-humping-lora | LoRA text-to-image | Qwen-Image | 281 MiB (repo 0,3 GB) | No disponible | 0 / 0 |
| rh-ai-lora | LoRA text-to-image | No disponible | 238 MB | No disponible | 0 / 0 |
| rh-face-model-lora | LoRA image-text-to-image | No disponible (la lista de ficheros menciona "Krea2") | 237 MB | No disponible | 0 / 0 |
| rh-p-lora | LoRA image-text-to-image | No disponible | No disponible | No disponible | 0 / 0 |
| rh-lora | LoRA (comfyui) | No disponible | No disponible | No disponible | 0 / 0 |

Los cuatro comparables pertenecen al mismo editor (RunningHubAI), comparten patrón de publicación automatizada, carecen de métricas y de licencia explícita, y no registran descargas ni likes. No se dispone de alternativas externas documentadas en la información proporcionada para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Licencia no disponible: la model card remite a "la licencia del proyecto original o del upstream", lo que deja sin resolver si el uso comercial está permitido. No debe integrarse en producto sin aclaración legal previa.
- Contenido potencialmente adulto: el nombre del modelo y las palabras de activación (`Pillow`, `Humping`) apuntan a una temática fetichista/NSFW. Verificar las políticas de contenido de ComfyUI, de RunningHub, del modelo base y de la jurisdicción de despliegue.
- Ausencia total de documentación de entrenamiento: sin dataset, sin hiperparámetros, sin rango del LoRA. Imposible auditar procedencia de datos ni reproducibilidad.
- Sin validación comunitaria: 0 descargas y 0 likes; no hay evidencia pública de calidad, estabilidad ni fidelidad al trigger.
- Riesgo de sobreajuste y de arrastre de estilo: los LoRAs de concepto único suelen contaminar otras generaciones si se mantienen activos con fuerza alta; conviene ajustar el peso y desactivarlo fuera del caso de uso previsto.
- Riesgo de alucinación visual y de artefactos anatómicos: inherente a los modelos de difusión, agravado por la falta de métricas publicadas.
- Idiomas no declarados: se desconoce si las palabras de activación funcionan en prompts en castellano; probablemente el entrenamiento se hizo con captions en inglés.
- Trazabilidad dudosa: repositorio creado y actualizado en el mismo minuto, publicador que actúa como intermediario ("Published by RunningHub on behalf of the author") y autor identificado solo por un alias de la plataforma.
- Sin información de sesgos: no se documenta composición demográfica del dataset ni evaluaciones de sesgo.
- Fecha de creación anómala (2026-10-27) en los metadatos del repositorio, lo que dificulta fijar la versión real del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-pillow-humping-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/1988787353424637953
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/1958652561404411905
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-pillow-humping-lora/blob/main/README_cn.md
- Repositorios relacionados del mismo editor: https://huggingface.co/RunningHubAI/rh-ai-lora, https://huggingface.co/RunningHubAI/rh-face-model-lora, https://huggingface.co/RunningHubAI/rh-p-lora, https://huggingface.co/RunningHubAI/rh-lora

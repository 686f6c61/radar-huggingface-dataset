# RunningHubAI/rh-qwen2511v2.0-lora

## Resumen

rh-qwen2511v2.0-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI (autor identificado en la model card como RunningHub-@Openclaw2026) y entrenado sobre el modelo base Qwen-Edit-2511. Su función concreta es la de reiluminación o "relighting" de imágenes: dado un par de imagen y texto de instrucción, el adaptador modifica la iluminación de la escena manteniendo el contenido. El repositorio ocupa 0,5 GB y contiene un único archivo de pesos de 450 MiB, `Qwen2511重打光重新照明v2.0.safetensors`, que se carga por encima del modelo base.

La relevancia de esta ficha es acotada pero concreta: se trata de un ajuste fino de tarea específica, no de un modelo fundacional. No se publican parámetros totales ni activos del adaptador, ni la longitud de contexto del sistema, ni la licencia exacta (la model card remite a la licencia del proyecto original). Tampoco hay métricas de benchmarks ni datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la información disponible.

El modelo se distribuye integrado en el ecosistema ComfyUI y en la plataforma RunningHub, que ofrece carga y ejecución del LoRA en sus nodos, además de una API de pago. Está etiquetado con el pipeline `image-text-to-image`, es decir, edición de imagen condicionada por texto. El repositorio no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | adaptador LoRA sobre Qwen-Edit-2511 (modelo base de edición de imagen); arquitectura interna del adaptador no disponible |
| Parámetros totales | no disponible (pesos del adaptador: 450 MiB en un único safetensors) |
| Parámetros activos | no aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el archivo distribuido parece ser fp16/bf16 de 450 MiB; no se documentan variantes GGUF o cuantizadas) |
| Idiomas soportados | no disponibles (el `pipeline_tag` es `image-text-to-image`; el prompt textual de condicionamiento no tiene idiomas declarados) |
| Licencia | no disponible; la model card indica "Follow the original project or upstream license" y que los derechos permanecen en el autor |
| Formato de pesos | safetensors (LoRA, compatible con ComfyUI) |

## Arquitectura y entrenamiento

El artefacto es un LoRA (Low-Rank Adaptation), es decir, un conjunto de matrices de bajo rango que se suman a los pesos de atención y/o proyección del modelo base Qwen-Edit-2511 durante la inferencia. No se modifica el modelo base, lo que permite mantener el coste de almacenamiento en 450 MiB y alternar entre distintos adaptadores sin recargar el modelo completo. El entrenamiento se realizó sobre Qwen-Edit-2511 ("Finetuned from: Qwen-Edit-2511"), y la model card describe el objetivo como reiluminación v2.0, lo que sugiere una segunda iteración del ajuste.

No se documentan en la información proporcionada el número de tokens o de pares imagen-texto usados en el entrenamiento, la composición del dataset, la resolución de entrenamiento, el rango del LoRA, el learning rate ni si se emplearon técnicas de alineación tipo RLHF o DPO (estas últimas son propias de modelos de lenguaje y no suelen aplicarse a adaptadores de difusión). No se declara ninguna innovación técnica adicional, como decodificación especulativa o atención lineal.

## Capacidades

- Edición de imagen guiada por texto: modificación de la iluminación de una imagen de entrada (relighting) preservando la identidad y el contenido de la escena.
- Integración con el pipeline `image-text-to-image`, lo que implica que acepta una imagen de referencia y un prompt textual de condicionamiento.
- Carga directa en ComfyUI como nodo de LoRA, apilable con el modelo base y con otros adaptadores según la configuración del flujo de trabajo.
- Ejecución en la plataforma RunningHub, que ofrece nodos propios y una API de invocación.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje orientado a agentes).
- Capacidades multilingües: no disponibles; no se declara lista de idiomas en la model card.
- Capacidades especiales adicionales (modo thinking, visión general, audio): no disponibles más allá del caso concreto de reiluminación descrito por el autor.

## Casos de uso

- Reiluminación de fotografía de producto en comercio electrónico: el adaptador permite unificar la dirección y la temperatura de la luz en un catálogo completo a partir de imágenes tomadas con iluminación heterogénea, manteniendo material y geometría del producto.
- Retoque de fotografía de retrato: corregir o recrear esquemas de luz (luz de clave lateral, contraluz, luz suave de estudio) sobre retratos existentes sin volver a disparar la sesión.
- Fotografía inmobiliaria: corregir fotografías de interiores capturadas con luz mixta (ventana + artificial) para homogeneizar la iluminación de todas las estancias de un anuncio.
- Previsualización en producción audiovisual: generar variantes de iluminación de un plano fijo para discutir opciones de dirección de fotografía antes de rodar o antes del render final.
- Iteración conceptual de arte digital: aplicar distintas condiciones de luz a un mismo boceto o render para explorar el ambiente de una escena en un flujo de ComfyUI con el LoRA integrado.
- Automatización por API: integración en un servicio de procesamiento por lotes usando la API de RunningHub, para aplicar el efecto de reiluminación a colas de imágenes sin intervención manual.
- Normalización de datasets: reiluminar conjuntos de imágenes de entrenamiento para reducir el sesgo de iluminación antes de usarlos en otros modelos de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador ocupa 450 MiB en disco y añade un coste de VRAM muy reducido (del orden de cientos de MiB en fp16), pero el consumo total lo determina el modelo base Qwen-Edit-2511, cuyos requisitos no se especifican en la información proporcionada.
- GPU recomendadas, VRAM estimada para inferencia, latencia y throughput: no disponibles. Dependen íntegramente del modelo base y de la resolución de imagen, datos no declarados en la model card.
- Encaje en GPU de consumo: no verificable con la información disponible, porque no se conoce el tamaño del modelo base necesario para cargar el LoRA.
- Opciones de despliegue declaradas: ComfyUI (entorno nativo del adaptador), la plataforma RunningHub (web y API) y el propio repositorio de Hugging Face para descarga de pesos.
- Otros servidores de inferencia (vLLM, TGI, llama.cpp, Ollama) no aplican a este tipo de artefacto; no se documenta soporte para backends de difusión alternativos como diffusers.

## Comparativa con modelos similares

No hay datos suficientes para una comparativa cuantitativa. No se publican parámetros, benchmarks ni especificaciones del modelo base en la información disponible, y la ficha de Hugging Face no incluye alternativas. Como categorías comparables a nivel cualitativo, sin datos numéricos verificables, se pueden citar:

| Alternativa | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-qwen2511v2.0-lora (este modelo) | no disponible | no disponible | no disponible | no disponible | Hugging Face, ComfyUI, RunningHub |
| Otros LoRA de edición sobre Qwen-Image-Edit | no disponible | no disponible | no disponible | no disponible | repositorios de la comunidad |
| LoRA de edición sobre Flux.1 Kontext | no disponible | no disponible | no disponible | no disponible | repositorios de la comunidad |
| LoRA de reiluminación (IC-Light y similares) | no disponible | no disponible | no disponible | no disponible | repositorios de la comunidad |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un adaptador sobre un modelo de difusión, hereda los sesgos del modelo base, que no se detallan en la información disponible.
- Riesgo de alucinación visual: los modelos de edición por difusión pueden alterar contenido no solicitado (identidad facial, texto en la imagen, geometría fina) cuando se aplican cambios de iluminación agresivos; no hay validación publicada para este adaptador.
- La model card no especifica resolución de trabajo, número de pasos recomendado, escala del LoRA ni parámetros de inferencia, por lo que la reproducibilidad depende de la configuración del flujo de ComfyUI del usuario.
- Licencia ambigua: la model card indica que los derechos permanecen en el autor y que se debe seguir la licencia del proyecto original o del upstream. No se declara explícitamente si el uso comercial está permitido, lo que es un riesgo para producción.
- Dependencia del modelo base Qwen-Edit-2511: el adaptador no es funcional por sí solo y obliga a aceptar los términos de licencia del modelo base.
- Alcance limitado a la tarea de reiluminación; no debe esperarse comportamiento general de modelo multimodal ni de modelo de lenguaje.
- Sin métricas de calidad publicadas, sin descargas ni validación de la comunidad en el momento de la consulta (0 descargas, 0 "likes").
- La fecha de creación del repositorio aparece como 2026-09-24 en los metadatos, posterior a esta consulta, lo que conviene verificar antes de citarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen2511v2.0-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2060372009791610882
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/2025581316556464129
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo; los resultados obtenidos no guardan relación con la ficha y se han descartado.

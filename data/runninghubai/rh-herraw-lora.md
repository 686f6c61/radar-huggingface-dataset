# RunningHubAI/rh-herraw-lora

## Resumen

rh-herraw-lora es un adaptador LoRA de edición y generación de imagen (pipeline `image-text-to-image`) publicado por RunningHubAI en nombre del autor VividMuse. Se trata de un ajuste fino derivado de Krea 2, el modelo base de generación de imágenes, y su propósito declarado es mejorar el realismo fotográfico natural en fotografía femenina preservando al máximo el prompt original, las características del sujeto, la composición y el control de escena. Según la model card, no requiere palabra de activación (trigger word): basta con cargar el LoRA y usar prompts en lenguaje natural.

El repositorio contiene un único archivo de pesos, `HerRAW-v0.1.safetensors`, de 224 MiB, y el tamaño total del repo es de 0,2 GB. Es, por tanto, un adaptador ligero que no se ejecuta de forma autónoma: necesita el modelo base Krea 2 y un entorno de inferencia compatible, con ComfyUI, RunningHub y Hugging Face como plataformas indicadas por el autor.

La relevancia de esta ficha es acotada y conviene ser explícito: no hay información pública sobre datos de entrenamiento, licencia, benchmarks ni idiomas, el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la licencia queda remitida a "la licencia del proyecto original o upstream". Es un artefacto de la comunidad centrado en un nicho estético concreto (fotografía de retrato femenino realista), no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Krea 2; arquitectura del base no disponible |
| Parametros totales | no disponible (pesos del adaptador: 224 MiB en un único safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de imagen texto-a-imagen; la longitud de prompt aceptada depende de Krea 2) |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors; no se documentan variantes GGUF, FP8 ni INT) |
| Idiomas soportados | no disponibles (los prompts se interpretan vía el codificador de texto del modelo base) |
| Licencia | no disponible; la model card indica "seguir la licencia del proyecto original o upstream" y que el copyright permanece en el autor |
| Formato de pesos | safetensors (`HerRAW-v0.1.safetensors`, 224 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en capas del modelo base para modular su comportamiento sin reentrenarlo por completo. El modelo base declarado es Krea 2 (`Finetuned from: krea2`), por lo que la arquitectura efectiva (backbone de difusión, codificador de texto, VAE) es la de Krea 2 y no se detalla en la documentación disponible. El adaptador ocupa 224 MiB, un orden de magnitud coherente con un LoRA de rango moderado sobre un modelo de imagen grande, aunque el rango exacto y las capas objetivo no se publican.

No hay información sobre el número de tokens o pasos de entrenamiento, la composición del dataset, el uso de RLHF/DPO (no aplicable en el flujo típico de difusión) ni sobre regularización o técnicas de preservación de identidad. El único dato técnico declarado es el objetivo de diseño: incrementar el realismo fotográfico natural manteniendo la fidelidad al prompt, al sujeto y a la composición. Tampoco se documenta si el adaptador se entrenó con captions naturales (lo que explicaría la ausencia de trigger word) ni qué proporción de imágenes de referencia se usó.

## Capacidades

- Generación texto-a-imagen y edición de imagen dentro del pipeline `image-text-to-image`, siempre sobre el modelo base Krea 2.
- Refuerzo del realismo fotográfico en retratos y fotografía femenina: textura de piel, iluminación natural y aspecto de cámara, según la descripción del autor.
- Funcionamiento sin trigger word: acepta prompts descriptivos en lenguaje natural sin tokens especiales que activen el estilo.
- Preservación declarada de la composición, el sujeto y el control de escena, lo que permite aplicar el estilo sobre prompts ya existentes sin reescribirlos.
- Integración en flujos ComfyUI (grafo de nodos con cargador de LoRA) y en la plataforma RunningHub, incluida su API.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión comprensiva, audio ni modo "thinking": no aplica a este tipo de modelo.

## Casos de uso

- Previsualización de sesiones de fotografía: generar variantes de retrato realista antes de un rodaje para acordar iluminación, encuadre y estilismo, aprovechando que el LoRA no altera la composición indicada en el prompt.
- Catálogo de moda y e-commerce: producir imágenes de producto con modelo y estilismo coherentes entre lotes, manteniendo el control de escena que el autor declara preservar y aplicando el adaptador sobre un pipeline de Krea 2 en ComfyUI.
- Editorial y moodboards: crear referencias visuales de alta fidelidad fotográfica para presentaciones de dirección de arte, con prompts en lenguaje natural y sin gestión de tokens de activación.
- Contenido para redes sociales: generación por lotes de retratos con acabado fotográfico integrada en ComfyUI, encadenando el nodo de carga de LoRA con el resto del grafo.
- Integración vía API de RunningHub: automatizar la generación desde una aplicación externa usando los endpoints documentados, sin necesidad de desplegar el modelo base en infraestructura propia.
- Prototipado de pipelines de imagen para estudios pequeños: al ser un adaptador de 224 MiB, se versiona y se sustituye con facilidad junto al modelo base, lo que simplifica comparar variantes estilísticas (por ejemplo, v0.1 frente a futuras versiones).
- Investigación en personalización de modelos de difusión: servir como punto de partida para estudiar cómo un LoRA afecta al realismo y a la fidelidad al prompt, aunque la falta de documentación de entrenamiento limita la reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, CLIPScore, SSIM, evaluaciones humanas) ni comparaciones con otros LoRA de fotografía. Tampoco hay datos de latencia o throughput, que en cualquier caso dependerían del modelo base Krea 2, del hardware y de los pasos de muestreo configurados.

## Requisitos de hardware

- El adaptador en sí ocupa 224 MiB en disco, pero la VRAM necesaria la determina el modelo base Krea 2, cuyos requisitos no se documentan en la información disponible: no disponible.
- GPU recomendadas: no disponibles para este LoRA; dependen enteramente del modelo base y de la resolución de generación.
- Encaje en GPU de consumo: no se puede confirmar sin datos del modelo base; el peso del adaptador no es el factor limitante.
- Despliegue: ComfyUI (carga de LoRA mediante nodo específico), plataforma RunningHub y ejecución en Hugging Face; la model card también enlaza al servicio de API de RunningHub. vLLM, TGI, llama.cpp u Ollama no son aplicables a un LoRA de difusión para imagen.
- Latencia y throughput: no disponibles; no se publican mediciones ni configuraciones de referencia (sampler, steps, CFG, resolución).

## Comparativa con modelos similares

No se dispone de datos verificables de otros LoRA de fotografía femenina para Krea 2 en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de contexto categórico, se recoge lo que sí consta de este artefacto:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos publicados |
|---|---|---|---|---|---|
| rh-herraw-lora (este) | no disponible (adaptador de 224 MiB) | no aplica | no disponible | Hugging Face, ComfyUI, RunningHub | Solo descripción funcional; sin benchmarks |
| Otros LoRA de retrato para Krea 2 | no disponible | no aplica | no disponible | no disponible | no disponible |
| LoRA de fotografía para otros modelos base | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream and no aclara los términos de uso comercial. No debe asumirse permiso de explotación comercial sin verificar la licencia de Krea 2 y contactar con el autor.
- Ausencia total de documentación de entrenamiento: sin datos de dataset, número de pasos, resolución de entrenamiento ni composición, la reproducibilidad y la evaluación del sesgo son imposibles.
- Sesgo de dominio: está especializado en fotografía femenina; su comportamiento en retratos masculinos, infantiles, group shots o escenas no fotográficas no está documentado y puede degradar la calidad.
- Riesgo de sobreajuste estilístico: al reforzar un acabado fotográfico concreto, puede reducir la diversidad de resultados o imponer una estética homogénea incluso cuando el prompt pide otro estilo.
- Riesgo de contenido no seguro: un LoRA de retrato realista sin filtros declarados puede generar imágenes de personas sintéticas que se presten a suplantación o a usos difamatorios; se requiere revisión y políticas de uso en producción.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; el artefacto no ha sido contrastado por terceros.
- Dependencia estricta del modelo base: la versión de Krea 2, el codificador de texto y el VAE deben coincidir con los usados en el entrenamiento; discrepancias producen degradación difícil de diagnosticar.
- Sin benchmarks ni métricas de fidelidad: la afirmación de "preservar el prompt y la composición" es una declaración del autor y no está medida.
- Idiomas no especificados: el rendimiento con prompts en castellano no está documentado y depende del codificador de texto del modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-herraw-lora
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2088910666911727617
- Página del autor (VividMuse): https://www.runninghub.ai/user-center/2014228843803709441
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-herraw-lora/blob/main/README_cn.md

Nota: la búsqueda web realizada no devolvió enlaces técnicos relacionados con este modelo; los resultados obtenidos no guardaban relación con Krea 2, con LoRA de imagen ni con RunningHub, por lo que se han descartado.

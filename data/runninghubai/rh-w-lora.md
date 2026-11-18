# RunningHubAI/rh-w-lora

## Resumen

`rh-w-lora` es un adaptador LoRA de generación de imágenes a partir de texto (text-to-image) publicado por RunningHubAI en Hugging Face. Se distribuye como un único archivo de pesos `1136.safetensors` de 162 MiB (el repositorio completo ocupa 0,2 GB) y está pensado para cargarse en ComfyUI o en la plataforma RunningHub. Según la model card, el adaptador se ha afinado a partir de `Z-image-turbo`, un modelo base de difusión del que no se ofrecen más detalles técnicos en la información disponible.

El modelo pertenece a la categoría de adaptadores de bajo rango (LoRA) aplicados sobre un modelo de difusión preentrenado: no es un modelo autónomo, sino un conjunto de pesos que modifica el comportamiento del modelo base al que se adhiere. Su relevancia es limitada y muy específica: sirve para reproducir un estilo o concepto concreto (no documentado) sobre el modelo Z-image-turbo dentro de flujos de ComfyUI. No hay información pública sobre el dataset de entrenamiento, el número de pasos, el rango del LoRA ni la licencia de uso.

En el momento de la consulta el repositorio registra 0 descargas y 0 "likes", y la model card contiene marcadores de posición sin contenido real (el campo "About this model" muestra únicamente "111"). Todo ello indica que se trata de una publicación reciente, de autoría individual y sin documentación técnica sustantiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusión (text-to-image); modelo base: Z-image-turbo |
| Parámetros totales | no disponible (pesos LoRA de 162 MiB en `1136.safetensors`) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusión) |
| Tipos de cuantización | no disponible; se distribuye en safetensors (precisión nativa del archivo no documentada) |
| Idiomas soportados | no disponibles (los prompts dependen del codificador de texto del modelo base) |
| Licencia | no disponible; la model card remite a "la licencia del proyecto original o upstream" |
| Formato de pesos | safetensors (`1136.safetensors`, 162 MiB) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del adaptador más allá de su naturaleza LoRA sobre un modelo de difusión text-to-image. El modelo base declarado es `Z-image-turbo`, del que la model card no aporta parámetros, tipo de backbone (U-Net o transformer de difusión), codificador de texto ni resolución nativa. Tampoco se especifican el rango (`r`), el `alpha`, los módulos objetivo ni la estrategia de fusión del LoRA.

No hay datos sobre el dataset de entrenamiento: ni número de imágenes, ni composición, ni resolución, ni uso de regularización, ni técnicas de preferencia (RLHF/DPO no aplican habitualmente a difusión, pero no se documenta ningún proceso equivalente como fine-tuning con pares de preferencia). El autor indica que el entrenamiento se realizó en la plataforma RunningHub, que ofrece servicios de entrenamiento de modelos, pero no publica hiperparámetros ni curvas de pérdida.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image), condicionada por el estilo o concepto aprendido en el LoRA.
- Integración con ComfyUI mediante el nodo de carga de LoRA estándar.
- Compatibilidad declarada con la plataforma RunningHub (ejecución en la nube y API).
- Modificación del comportamiento del modelo base `Z-image-turbo`; no funciona de forma independiente sin dicho modelo.
- No se documentan capacidades de edición de imagen, inpainting, control estructural (ControlNet), tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; dependen del codificador de texto del modelo base.

## Casos de uso

- Exploración de estilos en ComfyUI: cargar `1136.safetensors` como LoRA sobre el modelo Z-image-turbo para aplicar el estilo aprendido a nuevas generaciones, ajustando el peso del adaptador en el nodo correspondiente.
- Prototipado visual rápido: generar variaciones de un concepto concreto en la plataforma RunningHub sin necesidad de infraestructura local, útil para maquetas o pruebas de dirección de arte.
- Automatización vía API: usar el endpoint de RunningHub para encadenar generaciones con este LoRA en un pipeline de producción de imágenes bajo demanda.
- Reproducción de un estilo de autor: si el LoRA captura un estilo concreto (no documentado), permite mantener coherencia visual en una serie de imágenes generadas en lote.
- Experimentación con fine-tuning: servir como referencia para comparar el efecto de distintos pesos de LoRA sobre el mismo modelo base en tareas de investigación sobre adaptadores.
- Integración en flujos de trabajo existentes: al ser un safetensors compatible con ComfyUI, puede insertarse en grafos ya construidos para Z-image-turbo sin reescribir el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA de forma aislada; depende enteramente del modelo base Z-image-turbo, cuyos requisitos no se documentan.
- GPU recomendadas: no disponibles. Al tratarse de un LoRA de 162 MiB, el peso del adaptador es despreciable frente al modelo base; la VRAM vendrá determinada por este último.
- Compatibilidad con GPU de consumo: no confirmada; dependerá de si Z-image-turbo cabe en GPUs como RTX 3060, 4070 o 4090, dato no publicado.
- Opciones de despliegue: ComfyUI (declarado), plataforma RunningHub (declarado), API de RunningHub (declarado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RunningHubAI/rh-w-lora` | LoRA text-to-image sobre Z-image-turbo | no disponible (162 MiB de pesos) | no aplica | no disponible | Hugging Face, RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores LoRA del mismo autor o sobre variantes de Z-image-turbo que permitan una comparación rigurosa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card contiene marcadores de posición ("111") y no describe el estilo, el concepto ni el dataset del LoRA.
- Licencia no especificada: la model card remite a la licencia del proyecto original o upstream, lo que impide confirmar si el uso comercial está permitido. Verificar antes de cualquier despliegue en producción.
- Dependencia total del modelo base Z-image-turbo: sin él el adaptador no es funcional, y sus requisitos de hardware y licencia condicionan el uso.
- Riesgo de alucinación visual y artefactos: como cualquier modelo de difusión, puede generar imágenes incoherentes o no fieles al prompt; no hay evaluación publicada de fidelidad.
- Sesgos: no documentados; los sesgos del LoRA heredan los del modelo base y de su dataset de entrenamiento, no especificado.
- Idiomas: no confirmados; los prompts en castellano pueden comportarse de forma distinta a los de inglés si el codificador de texto del modelo base no está entrenado multilingüe.
- Sin métricas ni benchmarks: no es posible evaluar su calidad frente a alternativas.
- Repositorio sin tracción (0 descargas, 0 likes) y con fecha de creación muy reciente: ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-w-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2099504765649641473
- Página del autor: https://www.runninghub.cn/user-center/2068253802905292801
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model

# RunningHubAI/rh-ua-light-a-lora

## Resumen

`rh-ua-light-a-lora` es un adaptador LoRA para edición de imagen orientado a **relight** (reciclado de iluminación) de fotografías. Lo publica RunningHub en su organización de HuggingFace en nombre del autor `@UpAgainUI`, y está afinado a partir de **Flux1-Kontext**, el modelo de edición de imagen por instrucciones de Black Forest Labs. El repositorio contiene un único archivo de pesos, `UA LIGHT A.safetensors`, de 292 MiB (0,3 GB de repositorio total).

No se trata de un modelo completo: es un adaptador de bajo rango que debe cargarse sobre el modelo base Flux1-Kontext para funcionar. Su etiquetado de pipeline es `image-text-to-image` y los tags declaran compatibilidad con ComfyUI, de modo que el flujo previsto es cargar el LoRA en un nodo de ComfyUI (o en la plataforma RunningHub) junto al checkpoint base y aplicar una instrucción de texto para modificar la iluminación de una imagen de entrada.

Su relevancia es la de los adaptadores especializados de bajo coste: 292 MiB que añaden una capacidad concreta (relight fotográfico) a un pipeline de edición ya existente, sin necesidad de desplegar un modelo adicional. La información publicada es muy escasa: no hay model card técnica, ni dataset, ni benchmarks, ni licencia explícita, y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Flux1-Kontext (transformer de difusión multimodal para edición de imagen por instrucciones) |
| Parametros totales | no disponible para el adaptador; el archivo de pesos ocupa 292 MiB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un LoRA; el contexto de prompt lo fija el codificador de texto del modelo base Flux1-Kontext) |
| Tipos de cuantizacion | no disponible; se distribuye un único archivo `.safetensors` sin variantes cuantizadas documentadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que RunningHub publica en nombre del autor, que retiene el copyright, y remite a la licencia del proyecto original (Flux1-Kontext) |
| Formato de pesos | safetensors (`UA LIGHT A.safetensors`, 292 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. La model card declara explícitamente `Finetuned from: Flux1-Kontext`, por lo que la arquitectura efectiva en inferencia es la de Flux1-Kontext (difusión con flow matching sobre un transformer multimodal que acepta imagen y texto) más este adaptador. No se documenta sobre qué módulos concretos se aplica el LoRA, ni el rango, ni el alpha, ni el dropout.

No hay información sobre el proceso de entrenamiento: ni número de imágenes o pasos, ni composición del dataset, ni resolución, ni si hubo regularización o captions plantilla. Tampoco se indica ninguna innovación técnica asociada (decodificación especulativa, atención lineal, destilación de pasos, etc.). El único dato funcional es la intención declarada del adaptador: «Relight photo».

## Capacidades

- Edición de iluminación de fotografías: el adaptador está entrenado para recolocar o reformular la luz de una imagen de entrada manteniendo, en principio, el contenido y la identidad de la escena.
- Flujo image-text-to-image: acepta una imagen de referencia más una instrucción textual, tal como corresponde al pipeline declarado.
- Integración en ComfyUI: los tags `comfyui` y `lora` indican que está pensado para cargarse como nodo LoRA sobre un grafo con Flux1-Kontext.
- Ejecución en la nube de RunningHub: la model card enlaza el modelo original alojado en la plataforma, ejecutable sin despliegue propio.
- Capacidades heredadas del base: al no reentrenar el modelo completo, conserva las habilidades de Flux1-Kontext para edición guiada por texto (no documentadas en esta ficha).
- Tool calling, agentes, razonamiento multi-paso, matemáticas, código, visión descriptiva, audio o modo thinking: no disponible / no aplica (es un adaptador de generación y edición de imagen, no un modelo de lenguaje).

## Casos de uso

- **Fotografía de producto en e-commerce**: aplicar el LoRA sobre Flux1-Kontext para reiluminar un catálogo completo con una dirección de luz coherente (por ejemplo, luz suave cenital) y homogeneizar las fichas de producto sin repetir la sesión fotográfica.
- **Retoque de retrato en estudio**: corregir fotografías tomadas con esquema de luz duro y simular una fuente principal difusa, manteniendo el resto de la escena inalterado gracias al comportamiento de edición del modelo base.
- **Postproducción editorial y stock**: normalizar la iluminación de una serie de imágenes de un mismo reportaje para que la secuencia tenga continuidad visual antes de maquetar.
- **Previsualización de esquemas de luz**: un fotógrafo o director de arte introduce una captura de localización y genera variantes de iluminación para decidir el set-up antes del rodaje.
- **Automatización por lotes en ComfyUI**: encapsular el grafo (checkpoint Flux1-Kontext + LoRA + prompt de relight) y procesar carpetas de imágenes por cola, aprovechando que el adaptador solo añade 292 MiB al pipeline existente.
- **Funcionalidad dentro de una app de edición**: exponer el flujo a través de la API de RunningHub para ofrecer «cambiar la luz» como acción de un editor web, sin mantener infraestructura de GPU propia.
- **Prototipado rápido de conceptos**: generar variantes de iluminación de un mismo encuadre para moodboards o presentaciones de cliente antes de invertir en producción real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP-I, LPIPS ni comparaciones con otros adaptadores de relight), ni tampoco datos de latencia o throughput.

## Requisitos de hardware

- **Peso del adaptador**: 292 MiB en disco; es despreciable frente al modelo base y se puede cargar en CPU RAM y aplicar en el pipeline en tiempo de ejecución.
- **Requisito real de VRAM**: viene determinado por Flux1-Kontext, no por el LoRA. Como referencia orientativa (estimación basada en el base, no en la model card): ~24 GB en bf16/fp16, ~12-16 GB con pesos en fp8, y ~8-10 GB con variantes GGUF Q4.
- **GPU recomendadas**: A100 40/80 GB o H100 para servir en bf16 con concurrencia; RTX 4090 (24 GB) para bf16 en uso individual o fp8 con margen; RTX 4080/4070 Ti Super (16 GB) y RTX 4060 Ti 16 GB viables con fp8 o GGUF.
- **¿Cabe en GPU de consumo?**: sí, siempre que se use el modelo base cuantizado (fp8/GGUF); en bf16 puro requiere 24 GB o más.
- **Opciones de despliegue**: ComfyUI (soporte nativo del formato LoRA, indicado por los tags), plataforma RunningHub (modelo original alojado allí), y carga vía `diffusers` + PEFT sobre el pipeline de Kontext (no documentado en la model card, por lo que requiere verificación). vLLM, TGI y Ollama no aplican: son servidores de modelos de lenguaje, no de difusión.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se han identificado en la información proporcionada otros adaptadores LoRA de relight comparables, por lo que las filas de alternativas quedan como no disponibles.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-ua-light-a-lora | LoRA de relight sobre Flux1-Kontext | no disponible (adaptador de 292 MiB) | no aplica / no disponible | no disponible | HuggingFace + RunningHub |
| Flux1-Kontext (modelo base, requerido) | Transformer de difusión para edición de imagen | ~12 000 M (dato del modelo base, no de esta model card) | no disponible | la del proyecto original de Flux1-Kontext (no verificada aquí) | HuggingFace / BFL |
| Otros LoRA de relight | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia no resuelta**: la model card no especifica licencia del adaptador y remite a la del proyecto original. Antes de un uso comercial hay que verificar la licencia de Flux1-Kontext y los términos de RunningHub; a día de hoy no es posible afirmar que el uso comercial esté permitido.
- **No es autónomo**: sin el checkpoint Flux1-Kontext no hace nada; hereda todas las limitaciones, sesgos y restricciones del base.
- **Documentación mínima**: no hay ficha técnica, ni parámetros de inferencia recomendados (peso del LoRA, steps, guidance, prompt de activación), ni ejemplos de antes/después. Cualquier uso en producción exige ajuste empírico.
- **Riesgo de alucinación visual**: como todo modelo de difusión, puede alterar detalles de la escena (textos, geometría, rostros) al aplicar el relight; no hay garantía de fidelidad estricta a la imagen original.
- **Sesgos**: no documentados; se presumen los del dataset de entrenamiento del adaptador (desconocido) y los del modelo base (sesgos de representación de personas, iluminación y estética).
- **Idioma**: se desconoce qué idiomas acepta el prompt; no se declara ninguno en los metadatos.
- **Validación comunitaria nula**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia pública de calidad o estabilidad.
- **Trazabilidad**: el autor del adaptador es un usuario de la plataforma (`@UpAgainUI`) y el dataset no es público; no se puede auditar el entrenamiento.
- **Aviso sobre la búsqueda web**: los resultados devueltos por la búsqueda no guardan relación con el modelo (dominios de streaming en francés), por lo que no aportan información verificable.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-ua-light-a-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/1964746062554611714
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/1935334486756470786
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-ua-light-a-lora/blob/main/README_cn.md
- Paper, blog técnico o repositorio del adaptador: no disponible

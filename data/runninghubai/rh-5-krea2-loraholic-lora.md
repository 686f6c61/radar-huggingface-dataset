# RunningHubAI/rh-5-krea2-loraholic-lora

## Resumen

rh-5-krea2-loraholic-lora es un adaptador LoRA de edición de imagen publicado en Hugging Face por la cuenta RunningHubAI, derivado del modelo base identificado en la model card como "krea2". No se trata de un modelo de lenguaje ni de un modelo completo, sino de un peso adicional de bajo rango que se carga junto al modelo base para modificar su comportamiento generativo mediante una palabra de activación (trigger word). El repositorio contiene un único archivo safetensors de 14 MiB y está etiquetado para su uso en ComfyUI, además de las plataformas propias de RunningHub.

El modelo se distribuye bajo el pipeline `image-text-to-image`, es decir, está pensado para tareas de edición o generación de imagen condicionada por texto e imagen de entrada. La model card es extremadamente escueta: no declara número de parámetros, rango del adaptador, tamaño del dataset de entrenamiento, hiperparámetros, licencia ni idiomas. Tampoco se publican benchmarks ni ejemplos de uso más allá de la propia palabra de activación.

Su relevancia actual es limitada y fundamentalmente práctica: sirve como ejemplo del flujo de publicación de adaptadores LoRA generados y alojados dentro del ecosistema RunningHub, orientado a usuarios de ComfyUI que quieren incorporar conceptos o estilos concretos sin reentrenar el modelo base. Con cero descargas y cero likes en el momento de la consulta, y sin documentación técnica asociada, debe considerarse un artefacto sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA de bajo rango sobre un modelo de difusión base identificado como "krea2") |
| Parametros totales | no disponible (el adaptador ocupa 14 MiB en safetensors; no se declara el número de parámetros ni el rango) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; no se especifica precisión de almacenamiento, rango ni alpha) |
| Idiomas soportados | no disponible (la palabra de activación incluye caracteres chinos; no se documenta el idioma de los prompts) |
| Licencia | no disponible (la model card indica que los derechos permanecen en el autor y remite a la licencia del proyecto original o del modelo base) |
| Formato de pesos | safetensors (`5多阴毛_krea2_loraholic.safetensors` según la tabla de archivos; la sección de trigger words cita `5多毛_krea2_loraholic.safetensors`) |
| Tamano del repositorio | 0,0 GB reportados por Hugging Face; archivo de pesos de 14 MiB |
| Pipeline declarado | image-text-to-image |
| Plataformas indicadas | ComfyUI, RunningHub, Hugging Face |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Por el tipo declarado ("LoRA, image edit"), se trata de un conjunto de matrices de bajo rango que se inyecta en las capas de atención y proyección de un modelo de difusión base. No se especifican el rango, el alpha, las capas objetivo ni el método de entrenamiento (DreamBooth, LoRA clásico, entrenamiento con pares imagen-imagen, etc.). Tampoco se declara qué versión concreta del modelo base "krea2" se utilizó, dato crítico para garantizar la compatibilidad de carga.

No hay información sobre volumen de datos, composición del dataset, número de pasos de entrenamiento, resolución de entrenamiento ni uso de técnicas de regularización. La model card solo indica que el adaptador se entrenó o se publica a través de la infraestructura de RunningHub, que ofrece servicios de entrenamiento en su plataforma. Cualquier afirmación sobre calidad, fidelidad al concepto o generalización sería especulativa con los datos disponibles.

## Capacidades

- Edición de imagen condicionada por texto e imagen de entrada, según el pipeline declarado `image-text-to-image`.
- Inyección de un concepto o estilo concreto mediante palabra de activación, en la línea habitual de los adaptadores LoRA sobre modelos de difusión.
- Integración directa en ComfyUI como nodo de carga de LoRA, tal y como declara la etiqueta `comfyui`.
- Ejecución en la nube mediante RunningHub y su API, sin necesidad de infraestructura local.
- No dispone de generación de texto, razonamiento, código ni matemáticas: no es un modelo de lenguaje.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los agentes LLM.
- Capacidades multilingües: no documentadas. La palabra de activación está en chino y no se indica qué idiomas aceptan los prompts.
- Capacidad especial reseñable: ninguna documentada aparte del uso de la trigger word. No hay modo de razonamiento, visión o audio asociado más allá del propio pipeline de imagen.

## Casos de uso

- Edición de imagen por prompt en ComfyUI: el adaptador se carga sobre el modelo base "krea2" en un grafo de ComfyUI y se activa escribiendo la trigger word en el prompt, lo que permite aplicar el concepto aprendido sin reentrenar el modelo.
- Automatización por lotes vía API de RunningHub: al no requerir GPU local, se puede invocar el flujo de forma programática para procesar colecciones de imágenes con parámetros fijos, útil para preproducción de assets.
- Prototipado rápido de conceptos visuales: para comprobar si un estilo o temática concreta funciona antes de invertir en un entrenamiento LoRA propio con más datos y mayor rango.
- Investigación sobre adaptación de bajo rango: el archivo de 14 MiB sirve como caso de estudio de qué tamaño de adaptador basta para inyectar un concepto en un modelo de difusión concreto.
- Evaluación comparativa de adaptadores (A/B testing): cargar este LoRA frente a otros sobre el mismo base para medir diferencias de fidelidad y artefactos en un pipeline controlado.
- Plantilla de flujo de trabajo para entrenamiento interno: replicar la estructura de publicación (trigger word, safetensors, integración ComfyUI) al entrenar adaptadores propios con datos de la organización.
- Filtrado y moderación de contenido en plataformas: dado el carácter del concepto que sugiere la trigger word, un servicio que aloje este tipo de adaptadores necesita capas de moderación, clasificación y control de acceso antes de exponerlo a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas objetivas (FID, CLIP score, similitud de concepto), ni comparaciones cuantitativas con otros adaptadores, ni ejemplos visuales verificables.

## Requisitos de hardware

- El adaptador en sí ocupa 14 MiB, por lo que su coste de VRAM es despreciable. Todo el requisito de hardware viene determinado por el modelo base "krea2", cuyas especificaciones no se facilitan.
- VRAM estimada: no disponible para este adaptador en concreto. Como referencia genérica de la familia de modelos de difusión usados en ComfyUI, los modelos tipo SDXL suelen requerir del orden de 8-12 GB de VRAM en fp16 y los modelos tipo FLUX alrededor de 16-24 GB en fp16, cifras que bajan con cuantizaciones GGUF o fp8. No hay confirmación de a qué clase pertenece "krea2".
- GPU recomendadas: no disponible. Para el modelo base, cualquier GPU consumer con suficiente VRAM (RTX 3060 de 12 GB, RTX 4070/4080/4090) sería el punto de partida habitual; para inferencia por lotes en servidor se usarían A100 o H100.
- ¿Cabe en GPU consumer? Depende exclusivamente del base. El adaptador no añade carga relevante.
- Opciones de despliegue: ComfyUI (declarado explícitamente), plataforma y API de RunningHub. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, herramientas que en cualquier caso no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-5-krea2-loraholic-lora | no disponible (14 MiB de pesos) | no aplica | sin benchmarks publicados | no disponible | Hugging Face, RunningHub |
| Adaptador LoRA típico sobre FLUX.1 (por ejemplo FLUX.1 Krea dev) | no disponible en esta ficha | no aplica | no disponible | habitualmente licencia propia del base | Hugging Face, ComfyUI |
| Adaptador LoRA típico sobre SDXL | no disponible en esta ficha | no aplica | no disponible | habitualmente CreativeML Open RAIL++-M | Hugging Face, ComfyUI, ecosistema amplio |

No se dispone de datos verificables para establecer una comparación cuantitativa con alternativas concretas. La comparación relevante es cualitativa: este adaptador carece de documentación, licencia explícita y validación de la comunidad (0 descargas, 0 likes), mientras que los adaptadores publicados en ecosistemas consolidados suelen incluir ejemplos, licencia declarada y compatibilidad verificada con versiones concretas del modelo base.

## Limitaciones y advertencias

- Licencia no disponible: la model card no concede una licencia explícita y remite a la del proyecto original o del modelo base. El uso comercial queda en un limbo legal hasta que se aclare.
- La palabra de activación apunta a contenido potencialmente adulto o sensible. Cualquier despliegue público debe pasar por moderación y control de acceso.
- Discrepancia en el nombre del archivo: la tabla de archivos cita `5多阴毛_krea2_loraholic.safetensors` mientras que la sección de trigger words cita `5多毛_krea2_loraholic.safetensors`. Hay que verificar el nombre real antes de automatizar la carga.
- No se especifica la versión del modelo base "krea2". Cargar el adaptador sobre una versión distinta puede degradar el resultado o producir artefactos.
- Ausencia total de documentación sobre el dataset de entrenamiento: no se puede evaluar el sesgo demográfico, estético o cultural aprendido por el adaptador.
- Riesgo de sobreajuste y de artefactos visuales propios de adaptadores LoRA de bajo rango sin regularización documentada.
- Sin benchmarks ni ejemplos publicados: no hay evidencia de calidad más allá de la afirmación del autor.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta.
- Posible incompatibilidad idiomática de los prompts: la trigger word está en chino y no se documenta el comportamiento con prompts en otros idiomas.
- Metadatos con fechas de creación y actualización de 2026, lo que sugiere un pipeline de publicación automatizado; conviene no tratarlos como referencia fiable.
- En producción, el cuello de botella y los requisitos reales dependen enteramente del modelo base, no del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-5-krea2-loraholic-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2080924456939532289
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2065581992871030786
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API: https://www.runninghub.ai/call-api

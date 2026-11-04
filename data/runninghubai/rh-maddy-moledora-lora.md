# RunningHubAI/rh-maddy-moledora-lora

## Resumen

`rh-maddy-moledora-lora` es un adaptador LoRA para edición de imágenes (pipeline `image-text-to-image`) publicado por RunningHubAI en nombre del autor Santi Lopez. No se trata de un modelo de lenguaje ni de un modelo fundacional completo, sino de un conjunto de pesos de ajuste fino (218 MiB en `MaddyLoRa_000002500.safetensors`) pensado para cargarse sobre un modelo base identificado en la model card como `krea2`. Su función es inyectar un concepto o estilo concreto, activado mediante la palabra disparadora `maddyx`, dentro de flujos de generación y edición de imagen.

El modelo está empaquetado para su uso en ComfyUI, la plataforma de nodos para difusión, y también en el ecosistema RunningHub, que ofrece ejecución en la nube y API. La model card es extremadamente escueta: no documenta arquitectura, datos de entrenamiento, hiperparámetros de ajuste ni resultados de evaluación. La etiqueta `lora` y el pipeline `image-text-to-image` son los únicos metadatos técnicos fiables además del tamaño del archivo.

Su relevancia es limitada y muy específica: sirve para reproducir un personaje o estética concreta en pipelines de difusión sobre el modelo base `krea2`, no para tareas de razonamiento, código o texto. Para evaluar su calidad real sería necesario probarlo en ComfyUI con el checkpoint base correcto y la palabra `maddyx`, algo que no puede deducirse de la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base `krea2` (arquitectura del base no disponible) |
| Parametros totales | no disponible (pesos LoRA de 218 MiB en safetensors; recuento de parámetros no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors, presumiblemente fp16/bf16 |
| Idiomas soportados | no disponible (las palabras de activación son en inglés; la model card incluye texto en español y chino) |
| Licencia | no disponible explícitamente; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`MaddyLoRa_000002500.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas de atención (y posiblemente proyecciones) de un modelo de difusión base. La model card indica `Finetuned from: krea2`, pero no especifica la versión exacta del checkpoint, el rango del adaptador, el valor de alpha, la tasa de aprendizaje, el número de pasos ni la composición del dataset de entrenamiento. El nombre del archivo (`_000002500`) sugiere 2.500 pasos de entrenamiento, aunque esto es una inferencia a partir de la convención de nombres y no un dato confirmado.

No hay información sobre si se emplearon técnicas adicionales como regularización por dropout, captions automáticos, balanceo de dataset o entrenamiento con máscaras de región. Tampoco se documenta si el adaptador está pensado para edición de imagen con máscara, para transferencia de estilo o para generación de un personaje concreto; la etiqueta `image edit` de la model card apunta a lo primero, pero no se detalla el procedimiento.

## Capacidades

- Aplicación de un concepto o identidad visual concreta sobre el modelo base `krea2` mediante la palabra disparadora `maddyx`.
- Edición de imagen guiada por texto dentro de pipelines `image-text-to-image`.
- Integración nativa en flujos de ComfyUI como nodo de carga de LoRA.
- Ejecución en la plataforma RunningHub (nube) y a través de su API.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multimodalidad de entrada/salida más allá de la propia imagen.
- Cobertura multilingüe de prompts: no disponible.

## Casos de uso

- Edición de imagen con identidad consistente: cargar el LoRA en ComfyUI sobre `krea2` y usar `maddyx` en el prompt para mantener un personaje o estética coherente entre distintas generaciones y ediciones.
- Producción de material gráfico para redes: generar variaciones de una misma figura con el disparador `maddyx` para mantener unidad visual en una campaña.
- Prototipado rápido de conceptos: iterar sobre un checkpoint base `krea2` con el adaptador para explorar estilos antes de entrenar un modelo propio.
- Integración vía API de RunningHub: invocar el flujo desde una aplicación externa usando el endpoint documentado, útil cuando no se dispone de GPU local.
- Automatización de pipelines de edición por lotes: encadenar el LoRA en un grafo de ComfyUI para procesar varias imágenes con el mismo concepto.
- Experimentación académica o de investigación sobre adaptadores de bajo rango: usar el artefacto como ejemplo de LoRA de 218 MiB para estudiar el efecto del rango y los pasos de entrenamiento (2.500 según el nombre del archivo).
- Docencia y demos: mostrar en un taller cómo un LoRA pequeño modifica el comportamiento de un modelo de difusión sin reentrenar el base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud de identidad) ni comparaciones cuantitativas con otros LoRA.

## Requisitos de hardware

- VRAM estimada: no disponible para el LoRA en sí; depende enteramente del modelo base `krea2`, que no se especifica. El adaptador ocupa 218 MiB en disco.
- GPU recomendadas: no disponibles; vendrán determinadas por el checkpoint base. Para modelos de difusión de imagen de tamaño típico se suele requerir entre 8 y 24 GB de VRAM, pero no se puede confirmar sin conocer `krea2`.
- Compatibilidad con GPU de consumo: no confirmada; depende del base.
- Opciones de despliegue: ComfyUI (soporte nativo de LoRA), plataforma RunningHub (nube y API). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje y no aplican a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros LoRA comparables sobre `krea2` ni adaptadores de la misma familia publicados por RunningHubAI con métricas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card es mínima: no hay información sobre dataset, hiperparámetros, evaluación ni limitaciones declaradas por el autor.
- El modelo base `krea2` no se especifica con versión ni enlace, lo que impide garantizar la reproducibilidad del resultado.
- La licencia no está declarada de forma explícita; la model card remite a la licencia del proyecto original o upstream, que tampoco se identifica. Antes de un uso comercial es imprescindible aclarar la licencia con el autor o con RunningHub.
- Riesgo de sobreajuste al concepto `maddyx`: al ser un LoRA de concepto, puede degradar la diversidad de las generaciones si se usa con pesos altos.
- Posible dependencia de la palabra disparadora: sin `maddyx` en el prompt el efecto puede ser nulo o inconsistente.
- Sin datos de sesgo, alucinación visual ni comportamiento en dominios fuera del entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de calidad.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-maddy-moledora-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2112271342645481473
- Página del autor: https://www.runninghub.ai/user-center/2112263477373333506
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-maddy-moledora-lora/blob/main/README_cn.md

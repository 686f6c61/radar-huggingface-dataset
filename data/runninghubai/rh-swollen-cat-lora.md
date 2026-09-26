# RunningHubAI/rh-swollen-cat-lora

## Resumen

rh-swollen-cat-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI en Hugging Face bajo la plataforma RunningHub. No es un modelo de lenguaje: se trata de un conjunto de pesos de bajo rango pensado para modificar el comportamiento de un modelo de difusión base, que la model card identifica como "krea2". El repositorio ocupa 0,2 GB e incluye un único artefacto, el fichero `brkn_krea2_puffy_nipples-.safetensors` de 218 MiB.

El adaptador está etiquetado para ComfyUI y para el pipeline `image-text-to-image`, es decir, edición o generación de imágenes condicionada por texto. El autor indica un rango de peso recomendado de 0,4 a 0,7 para su aplicación. El modelo original se distribuye a través de RunningHub, con un enlace de referencia a una ficha de CivitAI de temática para adultos, dato relevante para cualquier evaluación de despliegue.

Su relevancia práctica es limitada y muy específica: sirve como ejemplo de adaptador de estilo publicado por una plataforma de generación de imagen, no como contribución técnica con arquitectura o entrenamiento documentados. La model card no publica número de parámetros, licencia, idiomas ni resultados de evaluación, y el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre un modelo de difusión; la model card solo indica "finetuned from: krea2") |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; el condicionamiento de texto depende del codificador del modelo base) |
| Tipos de cuantizacion | no disponible (solo se publica un fichero `.safetensors` de 218 MiB, sin especificar precisión) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`brkn_krea2_puffy_nipples-.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del adaptador ni del modelo base. Se trata de un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de un modelo de difusión previamente entrenado para modificar su distribución de salida sin reentrenar todos los pesos. La model card declara únicamente que el ajuste parte de "krea2"; no se especifica si ese identificador corresponde a la familia FLUX.1 Krea de Black Forest Labs y Krea, ni el número de parámetros del base, la resolución nativa o el tipo de transformers empleados.

No hay datos sobre el conjunto de entrenamiento: no se indica el número de imágenes, la composición del dataset, el uso de regularización por clase, el rango del LoRA, el optimizador ni si hubo etapas de ajuste fino adicionales. El único hiperparámetro publicado es el peso de aplicación recomendado, entre 0,4 y 0,7 durante la inferencia. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o destilación de pasos.

## Capacidades

- Edición y generación de imágenes condicionada por texto, dentro del pipeline `image-text-to-image` declarado en el repositorio.
- Modificación de estilo o de atributos concretos sobre el modelo base "krea2" mediante inyección LoRA, con peso ajustable entre 0,4 y 0,7.
- Integración con ComfyUI, tal como indican las etiquetas del repositorio y los enlaces de la model card.
- Ejecución en la plataforma RunningHub, tanto en su versión internacional como en la china, y a través de su API.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: son capacidades propias de modelos de lenguaje y no aplican a este artefacto.
- No se declaran capacidades multilingües ni un modo "thinking"; el prompt de texto depende exclusivamente del codificador del modelo base, cuyo comportamiento no se especifica.

## Casos de uso

- Pruebas de estilo en ComfyUI: cargar el LoRA con un peso de 0,4 a 0,7 sobre el modelo base para evaluar cómo cambia la salida respecto a la inferencia sin adaptador, útil como banco de pruebas de flujos de trabajo de edición.
- Comparación de adaptadores de la misma familia: al compartir base con otros LoRA, permite medir el efecto del rango y del peso de aplicación en un pipeline fijo.
- Prototipado rápido de variaciones visuales en un nodo de edición: el tamaño reducido del fichero (218 MiB) facilita su carga y descarga iterativa durante sesiones de ajuste de prompts y semillas.
- Automatización por lotes mediante la API de RunningHub: el autor publica documentación de API, lo que permite invocar el modelo desde scripts sin montar infraestructura propia.
- Docencia y demostración de LoRA: sirve como ejemplo mínimo de publicación de un adaptador en Hugging Face con etiquetas de ComfyUI, útil para explicar el formato y el flujo de carga.
- Evaluación de moderación de contenido: dado el origen del dataset (una ficha de CivitAI para adultos), es un caso adecuado para probar filtros y políticas de contenido antes de exponer un servicio de generación de imágenes.
- Replicabilidad de resultados: al fijar una versión concreta del fichero safetensors y un peso conocido, se puede documentar una salida concreta y compararla en el tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de imagen (FID, CLIP score, similitud con el prompt), comparaciones con otros adaptadores ni mediciones de latencia o throughput.

## Requisitos de hardware

- El adaptador en sí ocupa 218 MiB en disco. El incremento de VRAM al cargarlo es marginal (del orden de unos pocos cientos de megabytes en fp16), aunque el autor no publica ninguna cifra.
- El consumo dominante corresponde al modelo base "krea2", cuyos requisitos no se detallan en el repositorio.
- Estimación orientativa, no confirmada para este caso: si el base pertenece a la familia Flux (~12.000 millones de parámetros), serían necesarios alrededor de 24 GB de VRAM en fp16/bfloat16, entre 12 y 16 GB con cuantización fp8 o GGUF Q8, y entre 6 y 8 GB con GGUF Q4.
- En GPU de consumo: con cuantización agresiva (Q4) podría ejecutarse en tarjetas de 8-12 GB, como RTX 3060 12 GB o RTX 4070; en fp16 necesitaría 24 GB o más (RTX 3090, RTX 4090, A100, H100). Estas cifras son condicionales al modelo base y no están verificadas.
- Opciones de despliegue: ComfyUI (recomendado por el autor por las etiquetas del repositorio) y la plataforma RunningHub con su API. Los servidores orientados a modelos de lenguaje (vLLM, TGI, llama.cpp, Ollama) no aplican a este tipo de artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño del artefacto | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-swollen-cat-lora | LoRA de edición de imagen | 218 MiB (safetensors) | krea2 (según model card) | no disponible | Hugging Face, RunningHub, ComfyUI |
| LoRA de estilo genérico para la misma familia | LoRA | no disponible | mismo base | depende del autor | CivitAI, Hugging Face |
| Modelo base sin adaptador (krea2) | difusión texto-a-imagen / edición | no disponible | no aplica | no disponible | no disponible en esta información |

No se dispone de datos suficientes (parámetros, licencia, métricas) sobre adaptadores alternativos de la misma familia para establecer una comparación cuantitativa. La comparación se limita, por tanto, al tipo de artefacto y a su formato de distribución.

## Limitaciones y advertencias

- No se publica licencia. La model card indica que los derechos permanecen en el autor y remite a la licencia del proyecto original, por lo que el uso comercial no está autorizado de forma explícita y requiere verificación previa con el autor o con RunningHub.
- Origen del contenido: la model card enlaza a una ficha de CivitAI de temática para adultos. Cualquier despliegue en producto debe pasar por los filtros de contenido y las políticas aplicables, y no es adecuado para servicios dirigidos a menores.
- No hay información sobre el dataset de entrenamiento, por lo que no se pueden evaluar sesgos demográficos, de representación corporal ni de estilo, ni descartar memorización de imágenes concretas.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir anatomías incorrectas, artefactos en manos y texto, o resultados inconsistentes con el prompt, especialmente en el rango alto de peso (0,7).
- El peso de aplicación es un hiperparámetro crítico: por encima de 0,7 el autor no garantiza resultados; por debajo de 0,4 el efecto del adaptador puede ser imperceptible.
- Dependencia total del modelo base "krea2": si el base no está disponible con una licencia compatible o cambia de versión, el adaptador puede dejar de ser reproducible.
- Ausencia de métricas: no hay benchmarks que permitan estimar la calidad frente a alternativas, lo que dificulta justificar su uso en producción.
- Idiomas no declarados: el rendimiento del condicionamiento textual en castellano depende del codificador del modelo base y no está verificado.
- Repositorio sin tracción: 0 descargas y 0 "likes" en el momento de la consulta, sin historial público de mantenimiento más allá de dos marcas de tiempo de creación y actualización (26 de septiembre de 2026, según los metadatos).
- La fecha de creación registrada es posterior a la fecha habitual de publicación de modelos de esta familia, lo que sugiere que los metadatos pueden proceder de una migración o de una publicación programada; conviene tratarla con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-swollen-cat-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2072230236829347841
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Referencia original indicada en la model card (CivitAI, contenido para adultos): https://civitai.red/models/2744826/brkn-krea2-puffy-nipples?modelVersionId=3087325
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de llamada a la API (Seedance 2.5): https://www.runninghub.ai/call-api/api-detail/2133100000000700025

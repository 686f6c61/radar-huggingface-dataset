# RunningHubAI/rh-babka45-lora

## Resumen

`rh-babka45-lora` es un adaptador LoRA para edición de imágenes (pipeline `image-text-to-image`) publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje, sino de un conjunto de pesos de ajuste fino que se carga sobre un modelo base de difusión para modificar su comportamiento generativo. El repositorio contiene un único fichero de pesos de 218 MiB (`babka45_000002750.safetensors`), lo que es coherente con el tamaño típico de un LoRA de rango bajo sobre un modelo de difusión.

El adaptador está afinado a partir de un modelo base identificado en la model card como `krea2`, y la propia model card indica que la palabra de activación (trigger word) es `krea2`. Está pensado para su uso dentro de ComfyUI, la plataforma RunningHub o directamente desde Hugging Face. La información pública disponible es muy escasa: la descripción del modelo contiene únicamente una cadena de caracteres sin significado (`eqawfgvhghsedt`), no se declara licencia concreta y no hay datos de entrenamiento, benchmarks ni idiomas.

Por tanto, esta ficha debe interpretarse como una descripción del artefacto y de su contexto de uso (edición de imágenes con LoRA sobre un modelo de difusión), no como una evaluación de capacidades lingüísticas. La relevancia actual es limitada y circunscrita al ecosistema de generación de imágenes con ComfyUI y a la plataforma comercial RunningHub, que distribuye y aloja el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusión identificado como `krea2`; no se especifica la arquitectura del modelo base |
| Parametros totales | no disponible (el fichero de pesos ocupa 218 MiB; no se declara el número de parámetros del adaptador ni del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto); no disponible |
| Tipos de cuantizacion | no disponible; el peso se distribuye en safetensors (precisión no declarada) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el pipeline es image-text-to-image) |
| Licencia | no disponible; la model card indica que los derechos permanecen con el autor y que se siga la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`babka45_000002750.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de un modelo base de difusión para especializarlo sin reentrenar todos sus pesos. La model card identifica el modelo base como `krea2` y establece `krea2` como palabra de activación, lo que sugiere que el adaptador se ha entrenado para responder a ese token en el prompt. No se detalla el rango del LoRA, las capas objetivo, la resolución de entrenamiento, el número de pasos ni la composición del dataset.

No hay información sobre el proceso de entrenamiento: ni número de imágenes, ni técnica de captions, ni si se usó regularización, ni hiperparámetros. Tampoco se documenta ninguna innovación técnica (por ejemplo, LoRA con descomposición tipo LoHa, LoKr o adaptadores de atención). La única referencia operativa es que el entrenamiento puede haberse realizado en la propia plataforma RunningHub, ya que la model card enlaza a su página de entrenamiento de modelos.

## Capacidades

- Edición y generación de imágenes condicionada por texto e imagen de entrada (pipeline `image-text-to-image`), mediante un adaptador LoRA sobre el modelo base `krea2`.
- Aplicación de un estilo o concepto aprendido cuando se incluye la palabra de activación `krea2` en el prompt.
- Integración con ComfyUI como nodo de carga de LoRA sobre el modelo base.
- Ejecución en la plataforma RunningHub (internacional y China) y carga directa desde Hugging Face.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, visión analítica ni audio.
- No se documentan capacidades multilingües ni modos especiales (thinking mode, etc.).

## Casos de uso

- Edición de imágenes en ComfyUI: cargar el LoRA sobre el modelo base `krea2` y usarlo en un flujo de trabajo de image-text-to-image para aplicar el estilo o concepto aprendido, incluyendo `krea2` en el prompt.
- Prototipado rápido de variaciones visuales: dado que el adaptador pesa solo 218 MiB, se puede intercambiar entre distintos LoRA en un mismo grafo de ComfyUI para comparar resultados sin recargar el modelo base completo.
- Generación por lotes en la plataforma RunningHub: usar el modelo alojado en RunningHub para producir imágenes sin gestionar infraestructura propia, útil para equipos que no quieren montar GPUs.
- Integración vía API de RunningHub: invocar el modelo desde un servicio externo mediante la API documentada por RunningHub para incorporar generación de imágenes en una aplicación.
- Experimentación académica o de investigación sobre adaptadores LoRA: usar este checkpoint como ejemplo de adaptador de bajo rango sobre un modelo de difusión para estudiar transferencia de estilo o sensibilidad a la palabra de activación.
- Pruebas de reproducibilidad de pipelines image-text-to-image: al ser un artefacto pequeño y aislado, sirve para validar la cadena de carga (safetensors, ComfyUI, modelo base `krea2`) en un entorno de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de imagen (FID, CLIP score, etc.), ni comparaciones con otros LoRA, ni tiempos de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa; el adaptador LoRA en sí ocupa 218 MiB, pero requiere cargar el modelo base `krea2` completo, cuyo tamaño y requisitos no se declaran en la información disponible.
- GPU recomendadas: no disponible. No se especifican GPUs soportadas ni mínimas.
- Compatibilidad con GPU de consumo: no disponible; depende enteramente del modelo base `krea2`, cuyos requisitos no se documentan aquí.
- Opciones de despliegue: ComfyUI, plataforma RunningHub (web) y carga desde Hugging Face; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables a este artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA comparables, ni datos del modelo base `krea2`, ni métricas que permitan una comparación rigurosa. Cualquier comparación numérica sería inventada.

## Limitaciones y advertencias

- Información pública mínima: la descripción del modelo contiene una cadena sin sentido (`eqawfgvhghsedt`), lo que impide conocer su propósito real, el estilo aprendido o las condiciones de entrenamiento.
- Licencia no declarada: la model card solo indica que los derechos permanecen con el autor y que se siga la licencia del proyecto original o upstream; esto impide confirmar si el uso comercial está permitido.
- Dependencia del modelo base: el LoRA solo funciona junto con `krea2`; sin ese modelo base no es utilizable, y sus requisitos de hardware y licencia no se detallan.
- Riesgo de sobreajuste o de sesgos visuales: al no documentarse el dataset de entrenamiento, no se puede evaluar la representatividad demográfica ni los sesgos del adaptador.
- Riesgo de resultados no deseados: la palabra de activación `krea2` es poco descriptiva; prompts ambiguos pueden producir resultados inconsistentes.
- Sin métricas de calidad: no hay benchmarks ni evaluaciones que permitan estimar la fidelidad del estilo o la calidad de las imágenes generadas.
- Advertencia de producción: no se recomienda su uso en producción sin una evaluación previa propia y sin aclarar la licencia con el autor.
- Fecha de creación declarada en 2026-11-05, posterior a la fecha habitual de publicación; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-babka45-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2117000313877102593
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2084756201430347777
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model

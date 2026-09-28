# RunningHubAI/rh-sornitiansorni-v30-lora

## Resumen

rh-sornitiansorni-v30-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI en nombre del autor identificado en la model card como @finik. No es un modelo completo, sino un conjunto de pesos de bajo rango que se acoplan a un modelo base de difusión que la documentación denomina únicamente «krea2». El repositorio ocupa 0,2 GB y contiene un único archivo safetensors de 218 MiB.

Su función declarada es la edición de imágenes guiada por texto (pipeline `image-text-to-image`). Se activa mediante la palabra clave «sornitiansorni» y está pensado para ejecutarse en ComfyUI o en la plataforma en la nube de RunningHub. El repositorio se llama v3.0 mientras que el archivo de pesos se llama «sornitiansorni v2.0.safetensors», una discrepancia de versiones que conviene verificar antes de integrarlo en cualquier flujo de producción.

En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, no declara licencia explícita, no indica idiomas soportados ni publica resultados de benchmarks. La model card remite a la licencia del proyecto original para cualquier uso, sin concretar cuál es. Se trata, por tanto, de un adaptador sin validación comunitaria ni métricas publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusión identificado como «krea2»; no se detalla la arquitectura interna del modelo base |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica (modelo de imagen) |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos safetensors, sin variantes cuantizadas |
| Idiomas soportados | no disponibles; las indicaciones de edición se expresan en lenguaje natural, presumiblemente en inglés, pero no se especifica |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original |
| Formato de pesos | safetensors (un único archivo, `sornitiansorni v2.0.safetensors`, 218 MiB) |
| Palabra clave de activación | `sornitiansorni` |
| Pipeline declarado | `image-text-to-image` |
| Tamaño del repositorio | 0,2 GB |
| Plataformas compatibles | ComfyUI, RunningHub (nube), Hugging Face |
| Fecha de creación / actualización | 2026-09-28 (creado 15:48:01 UTC, actualizado 15:49:01 UTC) |

## Arquitectura y entrenamiento

La única información técnica disponible es que se trata de un LoRA de edición de imagen afinado a partir de un modelo denominado «krea2». No se publican el rango (rank), el valor alpha, la tasa de aprendizaje, el número de pasos, el tamaño del dataset, la composición de las imágenes de entrenamiento ni si se aplicaron técnicas de regularización o de captioning específicas. Tampoco se indica el número de parámetros entrenables del adaptador ni su huella de memoria en el grafo de inferencia.

El modelo base «krea2» no queda identificado de forma inequívoca en la documentación: no se confirma si corresponde a un modelo de difusión de tipo FLUX, a un modelo propietario de Krea o a otra variante, ni se indica su versión, su resolución nativa de entrenamiento o su licencia. El adaptador se distribuye a través del servicio de entrenamiento de RunningHub, que es también el canal de publicación, pero no se documenta el proceso seguido.

No hay mención a innovaciones técnicas como decodificación especulativa, atención lineal, destilación o muestreo acelerado. No se declara ningún tipo de alineación (RLHF, DPO) ni evaluación humana del resultado.

## Capacidades

- Edición de imágenes condicionada por texto, dentro del pipeline `image-text-to-image`.
- Activación mediante la palabra clave `sornitiansorni`, que según la model card debe incluirse en el prompt para que el adaptador aplique el concepto aprendido.
- Carga directa en ComfyUI como nodo LoRA sobre el modelo base correspondiente.
- Ejecución en la nube a través de RunningHub, sin necesidad de infraestructura local.
- Ejecución vía API de RunningHub, según los enlaces publicados en la model card.
- No se declara soporte de tool calling ni de function calling.
- No se declara capacidad de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingües.
- No se declara ningún modo especial (thinking, visión, audio); el propio modelo es de imagen.
- No se documenta control fino de la edición (máscaras, inpainting, intensidad, ControlNet) más allá de lo que permita la plataforma de ejecución.

## Casos de uso

- Edición de imágenes por lotes en ComfyUI: el adaptador se inserta como nodo LoRA en un grafo ya existente y aplica el concepto aprendido a cada imagen de entrada, lo que permite homogeneizar un conjunto de imágenes sin reentrenar el modelo base.
- Aplicación de un estilo o concepto concreto con una sola palabra clave: útil cuando se quiere reproducir una estética o un sujeto concreto de forma consistente; la efectividad depende de que la palabra `sornitiansorni` active el concepto de forma fiable, algo que no está verificado con métricas.
- Prototipado rápido de assets visuales: para diseñadores que necesitan variaciones de una imagen de referencia antes de pasar a una herramienta de retoque manual, con la ventaja de no requerir infraestructura propia si se usa RunningHub.
- Integración en flujos de generación de contenido vía API: el enlace a la API de RunningHub permite invocar el adaptador desde un backend propio y encadenarlo con otros pasos de un pipeline de publicación.
- Retoque de imagen de producto o de campaña: se puede usar como paso intermedio para explorar variantes cromáticas o de contexto sobre una fotografía base, siempre con revisión humana posterior dada la ausencia de evaluación publicada.
- Comparación de versiones del propio adaptador: la coexistencia del nombre v3.0 en el repositorio y el archivo v2.0 permite hacer A/B testing entre variantes si el autor publica la versión correspondiente, aunque la documentación no aclara cuál de las dos es la que realmente contiene el archivo.
- Pruebas de concepto en entornos de investigación: como ejemplo didáctico de LoRA sobre un modelo de difusión, para estudiar el efecto de la palabra clave y la intensidad del adaptador en la salida, sin asumir calidad de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de similitud (FID, CLIP score, LPIPS), comparativas con otros LoRA ni evaluaciones humanas en la model card.

## Requisitos de hardware

- El adaptador en sí ocupa 218 MiB en disco, pero los requisitos de VRAM en inferencia los determina casi por completo el modelo base «krea2», cuyas especificaciones no se publican.
- No hay datos publicados de VRAM mínima, GPU recomendada, latencia ni throughput para este adaptador ni para su modelo base.
- No se puede confirmar si el conjunto base más adaptador cabe en GPU de consumo; depende de la resolución de trabajo, la precisión (fp16, fp8) y las optimizaciones del cargador, ninguno de los cuales se documenta.
- Opciones de despliegue confirmadas: ComfyUI (local) y RunningHub (nube, incluye acceso por API). El uso de otros runners (diffusers, vLLM, TGI, llama.cpp, Ollama) no está documentado y, en el caso de los dos últimos, no aplica a un modelo de difusión de imagen.
- Al ser un LoRA, el coste de memoria adicional sobre el modelo base es marginal en comparación con los pesos completos, pero no se especifica la magnitud exacta.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolución | Licencia | Disponibilidad | Datos publicados |
|---|---|---|---|---|---|---|
| RunningHubAI/rh-sornitiansorni-v30-lora | LoRA de edición de imagen | «krea2» (no identificado con precisión) | no disponible | no disponible | Hugging Face, ComfyUI, RunningHub | 0 descargas, 0 likes, sin benchmarks |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores comparables en la documentación proporcionada. La comparación más directa sería contra otros LoRA entrenados sobre el mismo modelo base, pero no se han encontrado datos al respecto ni se especifica con claridad cuál es ese modelo base.

## Limitaciones y advertencias

- Inconsistencia de versiones: el repositorio se anuncia como v3.0 mientras que el archivo de pesos se llama `sornitiansorni v2.0.safetensors`. No se aclara si se trata de un error de nomenclatura o de una publicación incorrecta.
- Licencia no disponible: la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original, sin especificarla. Esto impide determinar si el uso comercial está permitido.
- Modelo base sin identificar: «krea2» no se corresponde con ningún identificador verificable en la documentación, por lo que no se puede confirmar la compatibilidad ni la licencia heredada del modelo base.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin ejemplos de resultados ni informes de terceros.
- Sin benchmarks ni evaluaciones: no hay métricas objetivas que respalden la calidad de la edición ni la fidelidad al concepto de la palabra clave.
- Riesgo de artefactos y alucinación visual: como cualquier adaptador de difusión, puede introducir distorsiones anatómicas, textos ilegibles o cambios no solicitados en la imagen original.
- Idiomas y prompts no documentados: no se especifica en qué idioma deben formularse las indicaciones ni si la palabra clave funciona igual en distintos idiomas.
- Dependencia de la plataforma: buena parte de la documentación y de los enlaces apunta a RunningHub, lo que sugiere un flujo de trabajo orientado a su servicio, aunque los pesos son descargables.
- Riesgo legal por similitud de identidad: si el concepto aprendido reproduce una persona, marca o estilo con derechos asociados, su uso puede infringir derechos de imagen o de propiedad intelectual; no hay advertencia al respecto en la model card.
- Ausencia de control de contenido: no se declara ningún filtro, y no hay información sobre los datos de entrenamiento que permita evaluar sesgos.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-sornitiansorni-v30-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2089455181254991873
- Página del autor (@finik): https://www.runninghub.ai/user-center/2077056864160157698
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
- README en chino: https://huggingface.co/RunningHubAI/rh-sornitiansorni-v30-lora/blob/main/README_cn.md

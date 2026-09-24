# RunningHubAI/rh-qianwen-old-photo-restoration-lora

## Resumen

rh-qianwen-old-photo-restoration-lora es un adaptador LoRA para edición de imagen especializado en la restauración de fotografías antiguas. Lo publica la plataforma RunningHub (cuenta RunningHubAI) en nombre del autor identificado en la model card como @Ai随风, y se distribuye como un único fichero de pesos `oldqwen_000001250.safetensors` de 563 MiB dentro de un repositorio de 0,6 GB. El adaptador deriva de Qwen-Edit-2509, según indica explícitamente la propia model card.

El modelo se encuadra en el pipeline `image-text-to-image`: recibe una imagen de entrada y una indicación textual, y aplica la edición sobre el modelo base. Su etiquetado incluye `comfyui` y `lora`, de modo que el destino natural es un flujo de trabajo de ComfyUI, la propia nube de RunningHub o la carga manual del adaptador sobre el modelo base en Hugging Face. La model card remite a una demo y a material adicional alojados en RunningHub.

La relevancia práctica es acotada pero clara: la restauración de fotografías deterioradas es una tarea con demanda real y este repositorio evita tener que entrenar un adaptador propio desde cero. Ahora bien, en el momento de la consulta el repositorio acumula 0 descargas y 0 "likes", no publica licencia explícita, no declara idiomas soportados y no incluye ningún resultado de benchmark, por lo que su evaluación debe hacerse con cautela y mediante prueba directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA (Low-Rank Adaptation) sobre un modelo de edicion de imagen; modelo base declarado: Qwen-Edit-2509 |
| Parametros totales | no disponible (el repositorio solo publica un fichero de pesos LoRA de 563 MiB; no se indica rango, alpha ni modulos adaptados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de edicion de imagen; no se publica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible; el repositorio distribuye unicamente safetensors. La cuantizacion aplicable depende del modelo base |
| Idiomas soportados | no disponible |
| Licencia | no disponible de forma explicita; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`oldqwen_000001250.safetensors`, 563 MiB) |
| Tipo de modelo | LoRA de edicion de imagen (pipeline `image-text-to-image`) |
| Modelo base | Qwen-Edit-2509 |
| Tamano del repositorio | 0,6 GB |
| Fecha de creacion / actualizacion | 23 de septiembre de 2026 (ambas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan sobre las capas de un modelo base congelado. En este caso el modelo base es Qwen-Edit-2509 y la tarea objetivo es la restauración de fotografías antiguas dentro de un pipeline de edición de imagen guiada por texto. El repositorio no aporta información sobre el rango del adaptador, el valor de alpha, los módulos objetivo (atención, proyecciones, bloques de convolución) ni sobre si el entrenamiento congeló por completo el modelo base.

La model card indica que el entrenamiento se realizó en RunningHub, plataforma que ofrece servicios de entrenamiento y de inferencia. No se documentan el número de pasos, el tamaño o la composición del dataset, la resolución de entrenamiento, el uso de RLHF o DPO ni ningún mecanismo de regularización. El nombre del fichero de pesos, `oldqwen_000001250`, sugiere un checkpoint correspondiente al paso 1250, aunque esto es una lectura del nombre y no un dato confirmado por el autor.

No se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación u otras). El valor del repositorio reside, por tanto, en el ajuste concreto de la tarea y no en aportaciones arquitectónicas.

## Capacidades

- Restauración de fotografías antiguas: el adaptador está entrenado específicamente para esta tarea sobre Qwen-Edit-2509, según la descripción "Qianwen Old Photo Restoration" de la model card.
- Edición de imagen guiada por texto: el pipeline declarado es `image-text-to-image`, de modo que la edición se condiciona con una instrucción textual además de la imagen de entrada.
- Integración en ComfyUI: el repositorio incluye la etiqueta `comfyui`, lo que apunta a su uso como nodo o adaptador dentro de flujos de trabajo de esta interfaz.
- Ejecución en la nube: la model card ofrece enlaces a RunningHub para probar el modelo y para consumirlo mediante API.
- Carga directa en Hugging Face sobre el modelo base, mediante el fichero safetensors incluido.
- Soporte de tool calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Otras capacidades especiales (modo de razonamiento, audio, vídeo): no disponible.

## Casos de uso

- Restauración de archivos fotográficos familiares: el usuario carga una fotografía escaneada con deterioro y aplica el adaptador sobre Qwen-Edit-2509 con una instrucción de restauración, obteniendo una versión limpia sin necesidad de retoque manual fotograma a fotograma.
- Digitalización de fondos documentales y patrimoniales: archivos, bibliotecas y museos que digitalizan placas y copias antiguas pueden usar el adaptador como paso previo de limpieza antes del catalogado, siempre con revisión humana del resultado.
- Flujo de producción en ComfyUI para estudios de restauración: al estar etiquetado como `comfyui`, el LoRA puede insertarse en una cadena existente de escalado, corrección de color y exportación, manteniendo el resto del pipeline intacto.
- Servicio de restauración por API: la model card enlaza con la API de RunningHub, de modo que un negocio puede ofrecer restauración como servicio web sin desplegar infraestructura propia de GPU.
- Preprocesado para OCR y visión por computador: limpiar manchas, arañazos y desvanecimiento antes de pasar documentos históricos por un sistema de reconocimiento de texto o de análisis de imagen mejora la tasa de acierto aguas arriba.
- Preparación de material para edición impresa o prensa: recuperar fotografías de archivo con calidad suficiente para publicación, aplicando el adaptador antes de las correcciones finales de color y enfoque en la aplicación de diseño.
- Prototipado y evaluación de pipelines de edición de imagen: un equipo que valore incorporar restauración a su producto puede probar este adaptador como referencia inicial antes de decidir si entrena su propio modelo.
- Encargos de restauración conmemorativa: estudios que preparan material para memoriales o aniversarios pueden procesar lotes de fotografías antiguas y revisar después los casos problemáticos de forma manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (PSNR, SSIM, LPIPS, FID ni evaluaciones humanas), no ofrece comparaciones con otros adaptadores de restauración y no describe el conjunto de validación empleado. Tampoco se dispone de datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no publica requisitos de hardware y el consumo total depende del modelo base Qwen-Edit-2509, cuyas especificaciones no se detallan en esta ficha.
- Coste adicional del adaptador: los pesos LoRA ocupan 563 MiB en disco y suman aproximadamente 0,6 GB a la huella de memoria del modelo base cuando se cargan en precisión nativa.
- GPU recomendadas: no disponible; no se indica ninguna GPU concreta ni configuración de referencia.
- Compatibilidad con GPU de consumo: no verificable con la información disponible, ya que depende por completo del modelo base y del modo de carga (precisión nativa, cuantización o carga por capas).
- Opciones de despliegue: ComfyUI (etiqueta oficial del repositorio), la plataforma RunningHub (prueba en línea y API) y carga manual desde Hugging Face. No hay indicios de soporte en llama.cpp, Ollama, vLLM ni TGI, soluciones orientadas a modelos de lenguaje y no a este tipo de adaptador de edición de imagen.
- Dependencia obligatoria: para usar el adaptador hay que disponer también de los pesos del modelo base Qwen-Edit-2509; el repositorio solo contiene el fichero LoRA.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-qianwen-old-photo-restoration-lora | LoRA de edicion de imagen | Qwen-Edit-2509 | 563 MiB (adaptador) | no aplica | no disponible explicitamente | Hugging Face, ComfyUI, RunningHub |
| Qwen-Edit-2509 sin adaptador | modelo de edicion de imagen | no aplica | no disponible en esta ficha | no disponible | no disponible en esta ficha | publicado por su autor original |
| Otras LoRAs de restauracion de fotos antiguas | LoRA | distintos modelos base | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas. La única diferencia verificable frente al modelo base es la especialización de la tarea que aporta el adaptador; cualquier comparación de calidad exigiría una evaluación propia con imágenes de referencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas, por lo que la calidad de la restauración no puede verificarse a priori.
- Sin validación de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, sin issues, demos comparativas ni ejemplos de terceros.
- Licencia ambigua: la model card no especifica una licencia concreta y remite a la del proyecto original o del modelo upstream. No debe asumirse que el uso comercial esté permitido sin consultar previamente con el autor y con el titular de los derechos del modelo base.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma y hereda las limitaciones, la licencia y los requisitos del modelo Qwen-Edit-2509.
- Riesgo de alteración del contenido: como todo modelo generativo aplicado a restauración, puede modificar o inventar detalles (rasgos faciales, texturas, inscripciones) que no estaban en la imagen original. No es adecuado como fuente forense, histórica o probatoria sin verificación humana.
- Sesgos desconocidos: no se documenta el dataset de entrenamiento, por lo que no puede evaluarse el sesgo respecto a épocas, tipos de soporte fotográfico, tonos de piel o regiones geográficas.
- Idiomas no declarados: se desconoce qué lenguas acepta en las instrucciones de texto.
- Sin información de trazabilidad: no se publican pasos de entrenamiento, resolución, dataset ni hiperparámetros, lo que dificulta reproducir o auditar el adaptador.
- Integración limitada: no hay evidencia de soporte en servidores de inferencia habituales para modelos de lenguaje; el despliegue esperado pasa por ComfyUI o por la plataforma del autor.
- Fechas del repositorio: creación y última actualización el 23 de septiembre de 2026, sin historial posterior de mantenimiento registrado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-qianwen-old-photo-restoration-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-qianwen-old-photo-restoration-lora/blob/main/README_cn.md
- Proyecto original del modelo: https://www.runninghub.cn/model/public/1963484259640119298
- Página del autor: https://www.runninghub.cn/user-center/1830481776564174849
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentación de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de la API de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025

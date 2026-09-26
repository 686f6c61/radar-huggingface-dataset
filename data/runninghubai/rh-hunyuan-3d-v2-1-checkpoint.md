# RunningHubAI/rh-hunyuan-3d-v2.1-checkpoint

## Resumen

rh-hunyuan-3d-v2.1-checkpoint es un checkpoint publicado en Hugging Face por la plataforma RunningHubAI, orientado a la generación de activos 3D y empaquetado para su uso en ComfyUI. El repositorio contiene un único fichero de pesos, `hunyuan_3d_v2.1.safetensors`, de 7025 MiB (aproximadamente 6,86 GiB), dentro de un repositorio de 7,4 GB. La model card lo describe como un "checkpoint" y lo declara afinado a partir de HunyuanImage, sin detallar arquitectura, dataset ni proceso de entrenamiento.

El interés de esta ficha es fundamentalmente práctico: se trata de un artefacto listo para cargar en un flujo de ComfyUI o en la infraestructura cloud de RunningHub, no de un modelo acompañado de documentación técnica. No se especifican número de parámetros, longitud de contexto (concepto que, además, no aplica a un modelo de generación 3D), idiomas de entrada ni licencia concreta. Según los metadatos, el repositorio se creó y actualizó el 26 de septiembre de 2026 y acumula 0 descargas y 0 "likes", por lo que no existe validación de la comunidad ni evidencia pública de resultados.

Dado el nombre del modelo, cabe esperar que esté relacionado con la línea Hunyuan3D 2.1 de generación de mallas y texturas, pero la propia model card indica que se afina desde HunyuanImage, lo que introduce una discrepancia de etiquetado que conviene verificar antes de integrarlo en producción. Toda la información de esta ficha procede de los metadatos y del README del repositorio; cualquier dato no documentado se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no documenta la arquitectura; se distribuye como checkpoint monolítico para ComfyUI |
| Parametros totales | No disponible. Estimación aproximada de 3.700 millones de parámetros a partir del tamaño del fichero (7025 MiB) si los pesos están en fp16/bf16 (2 bytes por parámetro); no confirmado por el autor |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de generación de activos 3D, no un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica un fichero safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible. El README indica únicamente: "Follow the original project or upstream license" |
| Formato de pesos | safetensors (`hunyuan_3d_v2.1.safetensors`, 7025 MiB) |
| Tamano del repositorio | 7,4 GB |
| Pipeline declarado | No disponible |
| Plataformas objetivo | ComfyUI, RunningHub, Hugging Face |
| Autor declarado | RunningHub, en nombre de [@周一川AI自习室] |
| Modelo base declarado | "Finetuned from: HunyuanImage" |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna, el número de parámetros, el número de tokens o imágenes de entrenamiento, la composición del dataset ni el uso de técnicas de alineación (RLHF, DPO u otras). La model card se limita a indicar que el modelo está afinado desde HunyuanImage y que se distribuye como pesos sueltos cargables en RunningHub. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o esquemas híbridos.

El único dato técnico relevante y verificable es el empaquetado: un checkpoint único en safetensors de 7025 MiB, lo que condiciona directamente los requisitos de memoria en inferencia. Existe además una inconsistencia entre el nombre del modelo (hunyuan-3d-v2.1) y el modelo base declarado (HunyuanImage), que puede deberse a un error de etiquetado o a un pipeline mixto imagen-3D. Se recomienda contrastar esta información con el proyecto original en RunningHub antes de asumir capacidades concretas.

## Capacidades

Las capacidades funcionales no están documentadas en la información proporcionada. Los únicos indicios disponibles son los siguientes, y deben tratarse como inferencias a verificar, no como hechos:

- Generación de activos 3D: el nombre del modelo apunta a la línea Hunyuan3D 2.1, orientada a generar mallas y texturas, pero la model card no lo confirma en ningún apartado.
- Integración con ComfyUI: la etiqueta `comfyui` y el formato checkpoint indican compatibilidad con nodos de carga de checkpoints en ese entorno.
- Ejecución en cloud: el README enlaza con RunningHub en sus variantes internacional y china, y con su API, lo que sugiere despliegue gestionado además de local.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles dado que se trata de un checkpoint de generación 3D para ComfyUI. En todos los casos deben validarse contra el comportamiento real del modelo, ya que no hay documentación ni evaluación publicada.

- Prototipado de assets para videojuegos: generar props, mobiliario o elementos de escenario a partir de referencias y refinarlos después en Blender o Maya, usando ComfyUI como interfaz de iteración rápida dentro del pipeline de arte.
- Previsualización arquitectónica: producir volumetrías y maquetas digitales preliminares para presentaciones a cliente antes de invertir horas de modelado manual, siempre que el modelo genere geometría cerrada y escalable.
- Generación de contenido para AR/VR: crear objetos tridimensionales de catálogo para experiencias inmersivas, reutilizando un único flujo de ComfyUI para producir variantes de un mismo activo.
- Automatización vía API: el README enlaza con la API de RunningHub, de modo que el checkpoint puede invocarse desde un servicio backend para generar activos bajo demanda sin mantener GPU propia.
- Enriquecimiento de datasets 3D: aumentar un conjunto de mallas existente con variaciones sintéticas para entrenar otros modelos, sujeto a que la licencia del checkpoint lo permita (actualmente no está definida).
- Iteración de diseño de producto: explorar variantes de forma de un objeto físico antes de pasar a CAD, aprovechando la ejecución local en ComfyUI para no depender de servicios externos.
- Integración en pipelines de contenido: encadenar la generación 3D con renderizado o texturizado posterior dentro del mismo grafo de ComfyUI, evitando exportaciones manuales intermedias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de calidad geométrica (Chamfer distance, F-score, PSNR de texturas), comparativas con otros modelos ni evaluaciones subjetivas. Tampoco se documentan tiempos de inferencia, resolución de salida ni número de pasos de muestreo.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de un fichero de pesos de 7025 MiB, la carga en memoria requiere al menos unos 7 GB solo para los pesos. Con activaciones y buffers intermedios, es razonable planificar entre 10 y 16 GB de VRAM, dependiendo de la resolución del activo y del pipeline de ComfyUI. Es una estimación derivada del tamaño del fichero, no un dato publicado.
- GPU recomendadas: no disponibles por parte del autor. Por el tamaño del checkpoint, encajan tarjetas de gama alta con 16 GB o más (RTX 4080, RTX 4090, RTX 5090, A100, H100) y, con margen ajustado, tarjetas de 12 GB.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 12 GB o más de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090). En tarjetas de 8 GB la carga de pesos dejaría muy poco margen para activaciones.
- Opciones de despliegue: ComfyUI es el entorno objetivo declarado. El README enlaza con RunningHub y su API como alternativa gestionada. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se publican tiempos por generación ni soporte de procesamiento por lotes.

## Comparativa con modelos similares

La información proporcionada no incluye datos comparativos y no permite establecer una comparativa rigurosa. La siguiente tabla recoge únicamente lo verificable:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| rh-hunyuan-3d-v2.1-checkpoint | No disponible (~3.700 M estimados por tamaño de fichero) | No aplica | No disponible | Hugging Face, ComfyUI, RunningHub | No disponibles |
| Hunyuan3D 2.1 (Tencent, proyecto upstream) | No disponible en la información proporcionada | No aplica | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponibles |
| Otras alternativas de generación 3D open source | No disponible | No disponible | No disponible | No disponible | No disponibles |

## Limitaciones y advertencias

- Ausencia total de validación comunitaria: 0 descargas y 0 "likes" en el momento de redactar esta ficha, sin issues ni discusiones que permitan contrastar su funcionamiento.
- Licencia no definida: el README remite a "la licencia del proyecto original o upstream" sin concretarla. Esto impide determinar si el uso comercial está permitido y supone un riesgo legal directo en producción.
- Procedencia indirecta: el modelo lo publica RunningHub "en nombre del autor" y los derechos permanecen en el autor original, lo que añade una capa de intermediación a la hora de resolver dudas legales o técnicas.
- Documentación técnica ausente: no hay arquitectura, dataset, número de parámetros, resolución de salida ni instrucciones de uso más allá de "cargar en RunningHub".
- Discrepancia de etiquetado: el nombre indica un modelo 3D v2.1 mientras la model card declara afinado desde HunyuanImage; conviene confirmar qué genera realmente antes de integrarlo.
- Riesgo de resultados no verificados: al no existir benchmarks ni evaluaciones, no puede descartarse la aparición de artefactos geométricos, mallas no cerradas, texturas inconsistentes o topologías inutilizables para producción.
- Ficheros auxiliares no documentados: el repositorio solo contiene el safetensors; si el pipeline requiere VAE, tokenizer, configuración o encoder de texto, no se indica de dónde obtenerlos ni con qué versión son compatibles.
- Sesgos y limitaciones de idioma: no disponible. No hay información sobre sesgos, cobertura lingüística de los prompts ni comportamiento con entradas en castellano.
- Recomendación operativa: verificar el hash del safetensors, probarlo en un entorno aislado y confirmar la compatibilidad con la versión de ComfyUI antes de incorporarlo a cualquier flujo automatizado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-hunyuan-3d-v2.1-checkpoint
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/1972660841315278849
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1908067098499956737
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino del repositorio: README_cn.md (incluido en el propio repositorio)

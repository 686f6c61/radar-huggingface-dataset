# Rin247/Qwen-Image-2.1-FP8

## Resumen

Qwen-Image-2.1-FP8 es una redistribucion en precision FP8 del modelo Qwen-Image-2.1, un modelo unificado de generacion de imagen a partir de texto y de edicion de imagen desarrollado por el equipo Qwen (Alibaba). El repositorio que nos ocupa, publicado por el usuario Rin247, empaqueta los pesos en formato diffusers y safetensors con un total de 7.115.124.736 parametros (aproximadamente 7,1 B) y un tamano de repositorio de 19,0 GB. La relevancia de esta version radica en la reduccion de huella de memoria respecto a los pesos en bfloat16, lo que facilita su ejecucion en GPUs de gama alta para consumidores.

El modelo base emplea una arquitectura de transformer de difusion de una sola corriente (Single-Stream DiT) con 32 capas y atencion de granularidad mixta, junto con reutilizacion de cache KV de prefijo. Su rasgo diferencial es la generacion nativa de imagenes con transparencia (canal alfa, RGBA), la edicion con hasta 10 imagenes de referencia, la edicion local mediante mascaras o anotaciones pintadas y la preservacion de identidad de personas y productos. Tambien se destaca la mejora en el renderizado de tipografias y en la iluminacion de retratos.

Al tratarse de una resubida de terceros con cero descargas y cero valoraciones en el momento de la consulta, y con licencia qwen-research (no aprobada por OSI), conviene evaluarla con cautela para entornos de produccion y verificar la integridad de los pesos frente al repositorio oficial de Qwen. No se han publicado resultados de benchmarks asociados a esta resubida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) de una sola corriente (Single-Stream DiT), 32 capas, con atencion de granularidad mixta y reutilizacion de cache KV de prefijo |
| Parametros totales | 7.115.124.736 (~7,1 B) segun los pesos safetensors del repositorio; la model card indica 7 B en el componente de generacion visual |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible (modelo de generacion y edicion de imagen; no se especifica una longitud de contexto textual) |
| Tipos de cuantizacion | FP8 (esta version); el modelo base se distribuye en bfloat16. No se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (Qwen Research License Agreement); etiquetada como "other", no aprobada por OSI |
| Formato de pesos | safetensors (formato diffusers) |
| Pipeline | text-to-image (QwenImage21Pipeline) |
| Tamano del repositorio | 19,0 GB |
| Resoluciones y relaciones de aspecto soportadas | 1:1 (2048x2048), 4:3 (2400x1792), 3:4 (1792x2400), 3:2 (2528x1696), 2:3 (1696x2528), 16:9 (2752x1536), 9:16 (1536x2752) |
| Pasos de inferencia recomendados | 40 |
| Referencias de imagen en edicion | Hasta 10 imagenes de referencia |

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusion (DiT) de una sola corriente con 32 capas, orientado a la generacion y edicion de imagenes. Segun la model card, incorpora atencion de granularidad mixta y reutilizacion de cache KV de prefijo, dos decisiones de diseno que buscan reducir el coste computacional por paso de difusion manteniendo la calidad de imagen. El componente de generacion visual se cifra en 7 B de parametros, coherente con los 7.115.124.736 parametros registrados en los pesos safetensors del repositorio.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. La model card unicamente menciona mejoras cualitativas en la version 2.1 respecto a su predecesora: compacidad y eficiencia, generacion nativa en RGBA con edicion unificada, edicion versatil con multiples referencias y mascaras, y mejoras en tipografia, iluminacion de retratos y detalle fino. Tampoco se documenta si existe decodificacion especulativa ni tecnicas adicionales de aceleracion mas alla de la cache KV de prefijo.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) en resoluciones de hasta 2752x1536 pixeles y siete relaciones de aspecto predefinidas.
- Generacion nativa de imagenes con transparencia (RGBA), incluyendo la posibilidad de editar capas transparentes y extraer sujetos de fotografias con canal alfa.
- Edicion de imagen por instruccion en lenguaje natural, con cambio de fondo, modificacion de estilo y otras transformaciones globales.
- Edicion localizada mediante circulos, anotaciones pintadas o mascaras independientes.
- Uso de hasta 10 imagenes de referencia en una misma generacion, con preservacion de identidad para personas y productos (por ejemplo, fotografias de grupo compuestas a partir de retratos individuales).
- Renderizado de texto y tipografia mejorado respecto a versiones anteriores, orientado a carteles, rotulos y material grafico.
- Mejora declarada en iluminacion de retratos y detalle fino de texturas.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico (no aplica a un modelo de difusion).
- No se documenta soporte multilingue explicito; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Generacion de assets con transparencia para diseno grafico: el modelo produce PNG con canal alfa de forma nativa, por lo que se pueden crear pegatinas, iconos y recortes sin recurrir a un paso posterior de eliminacion de fondo.
- Edicion de producto en comercio electronico: sustituir fondos, integrar el producto en escenas de estilo de vida y mantener la identidad del articulo gracias al uso de imagenes de referencia.
- Composicion de fotografias de grupo o de catalogo: con hasta 10 referencias de imagen, se pueden unificar retratos individuales en una sola escena coherente, util en fotografia corporativa o de equipo.
- Retoque localizado en flujos de postproduccion: las mascaras y anotaciones pintadas permiten modificar una region concreta de una imagen ya existente sin regenerarla por completo.
- Creacion de material promocional con texto: la mejora en tipografia permite generar carteles, banners y rotulos con texto legible a 2048x2048 y en formatos 16:9 y 9:16 para redes sociales y publicidad exterior.
- Produccion de contenido a escala para marketing: la combinacion de siete relaciones de aspecto y 40 pasos de inferencia permite cubrir un catalogo de formatos (cuadrado, vertical y panoramico) desde un mismo prompt.
- Prototipado rapido en estudios de diseno: iteracion sobre bocetos conceptuales a resolucion 2K con semillas fijas para reproducibilidad en revisiones de cliente.
- Investigacion en generacion y edicion de imagen: la licencia qwen-research permite el uso academico y de investigacion, incluyendo experimentacion con la variante FP8 frente a los pesos en bfloat16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Qwen-Image-2.1 no incluye tablas comparativas de metricas (FID, CLIP score, GenEval, etc.) y el repositorio FP8 de Rin247 no anade ninguna medicion propia.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 del componente de generacion visual (unos 7,1 B de parametros) ocupan aproximadamente 7 GB, pero el repositorio completo pesa 19,0 GB, ya que incluye el resto de componentes del pipeline (codificador de texto, VAE y tokenizador). Se recomienda un minimo de 24 GB de VRAM para inferencia comoda a 2048x2048 con 40 pasos.
- GPU recomendadas para produccion: A100 (40 GB o 80 GB), H100, L40S (48 GB) y GPU profesionales equivalentes con soporte de FP8.
- GPU de consumo: cabe en RTX 4090 (24 GB) y en RTX 5090 (32 GB); en GPU de 16 GB como la RTX 4080 es previsible que requiera descarga de modelo a CPU y resoluciones reducidas, aunque no se dispone de mediciones confirmadas.
- Opciones de despliegue: diffusers con QwenImage21Pipeline (confirmado en la model card), con soporte de enable_model_cpu_offload para reducir el pico de VRAM. No se documentan integraciones con vLLM, llama.cpp ni Ollama, que ademas no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles. El unico parametro de coste documentado son los 40 pasos de inferencia recomendados para las resoluciones indicadas.

## Comparativa con modelos similares

| Aspecto | Qwen-Image-2.1-FP8 (esta ficha) | Qwen-Image-2.1 (oficial, bfloat16) | FLUX.1-dev |
|---|---|---|---|
| Desarrollador | Rin247 (resubida de terceros) | Equipo Qwen (Alibaba) | Black Forest Labs |
| Parametros | 7.115.124.736 en safetensors | 7 B en el componente visual (dato de la model card) | No disponible en la informacion proporcionada |
| Precision / cuantizacion | FP8 | bfloat16 | No disponible |
| Generacion con transparencia RGBA | Si | Si | No documentado en la informacion disponible |
| Edicion con multiples referencias | Hasta 10 imagenes | Hasta 10 imagenes | No disponible |
| Licencia | qwen-research (no aprobada por OSI) | qwen-research (no aprobada por OSI) | No disponible en la informacion proporcionada |
| Disponibilidad | HuggingFace (diffusers, safetensors) | HuggingFace, ModelScope, demo en Spaces | No disponible en la informacion proporcionada |
| Descargas y valoraciones | 0 descargas, 0 likes | No disponible | No disponible |

No se dispone de datos verificados de rendimiento de terceros que permitan una comparacion cuantitativa fiable. La comparacion con FLUX.1-dev se incluye unicamente como referencia de categoria (generacion de imagen texto-a-imagen de parametros medios), pero sus cifras concretas no figuran en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia qwen-research: se trata de una licencia "other" no aprobada por OSI, con posibles restricciones para uso comercial. Es imprescindible revisar el texto completo en el fichero LICENSE antes de cualquier despliegue en produccion.
- Resubida de terceros: el repositorio pertenece al usuario Rin247, no al equipo Qwen, y registra 0 descargas y 0 likes. No existe validacion de la comunidad ni garantia sobre la fidelidad de la conversion a FP8 respecto a los pesos oficiales.
- La cuantizacion a FP8 puede degradar la calidad de imagen o la precision del renderizado de texto en comparacion con los pesos en bfloat16; no se han publicado mediciones de esta perdida.
- Riesgo de alucinacion visual inherente a los modelos de difusion: aparicion de texto ilegible en tipografias complejas, artefactos anatomicos en manos y rostros, o incoherencias en escenas con muchos elementos.
- No se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos demograficos, culturales o de representacion.
- No se especifican los idiomas soportados ni el comportamiento del modelo ante prompts en idiomas distintos del ingles o el chino.
- No hay informacion sobre longitud de contexto textual, lo que limita la planificacion de prompts muy largos o de ediciones compuestas de multiples pasos.
- Requisitos de memoria elevados para el repositorio completo (19,0 GB) y resoluciones de salida de hasta 2K, lo que obliga a GPU con al menos 24 GB de VRAM para un flujo de trabajo sin descarga a CPU.
- No se documentan integraciones con herramientas de despliegue estandar para difusion (por ejemplo, nodos de ComfyUI) ni versiones GGUF para CPU.
- Las fechas de creacion y actualizacion del repositorio (septiembre de 2026) son posteriores a la fecha habitual de publicacion de esta familia de modelos; conviene verificar la procedencia de los pesos antes de usarlos en entornos criticos.

## Enlaces

- Repositorio de esta version FP8: https://huggingface.co/Rin247/Qwen-Image-2.1-FP8
- Repositorio oficial del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ModelScope del modelo base: https://modelscope.cn/models/Qwen/Qwen-Image-2.1
- Blog de Qwen: https://qwen.ai/blog?id=qwen-image-2.1
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-2.1
- Repositorio de codigo: https://github.com/QwenLM/Qwen-Image-2.1
- Servidor de Discord de Qwen: https://discord.gg/CV4E9rpNSD
- Licencia Qwen Research License Agreement: fichero LICENSE del repositorio

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos resultados obtenidos correspondian a campings de Argelès-sur-Mer y no guardan relacion con la ficha.

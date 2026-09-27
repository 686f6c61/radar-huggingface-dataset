# RunningHubAI/rh-z-image-v3-nswf-checkpoint

## Resumen

rh-z-image-v3-nswf-checkpoint es un checkpoint de generación de imágenes a partir de texto (text-to-image) publicado por la cuenta RunningHubAI en Hugging Face en nombre del autor identificado como @NINE.JIUGE. No es un modelo de lenguaje: es un fichero de pesos para pipelines de difusión que se carga en ComfyUI, en la plataforma RunningHub o directamente desde Hugging Face. Según la model card, se trata de un ajuste fino (finetune) del modelo base Z-image-turbo, orientado a la generación de ilustración tipo anime y novela, y la propia descripción del repositorio lo etiqueta como "nswf", acrónimo que casi con certeza corresponde a "NSFW".

El repositorio contiene un único fichero safetensors de 19.572 MiB (aproximadamente 19,1 GiB) denominado `kinghere-Z-image-动漫-小说-造影V3-nswf.safetensors`, lo que sitúa este checkpoint en la categoría de modelos grandes que requieren GPU con memoria abundante. El autor no publica información sobre arquitectura interna, número de parámetros, resolución nativa, número de pasos de muestreo ni composición del dataset de entrenamiento.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un checkpoint comunitario con cero descargas y cero valoraciones en el momento de la consulta, sin licencia declarada y sin documentación técnica. Su interés práctico se limita a quien busque un modelo de ilustración estilo anime dentro del ecosistema ComfyUI/RunningHub y acepte evaluarlo empíricamente, asumiendo las incertidumbres legales y de calidad que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de difusion text-to-image derivado de Z-image-turbo; el autor no detalla el tipo de red) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplicable en el sentido de LLM; no disponible la longitud maxima de prompt soportada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos completos en safetensors (19.572 MiB). No se ofrecen variantes GGUF, FP8 ni cuantizadas |
| Idiomas soportados | no disponible; el nombre del fichero y de la serie incluye caracteres chinos (动漫, 小说, 造影), lo que sugiere prompts en chino, pero el autor no lo confirma |
| Licencia | no disponible; la model card indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (fichero unico `kinghere-Z-image-动漫-小说-造影V3-nswf.safetensors`) |
| Tamano del repositorio | 20,5 GB |
| Tamano del fichero de pesos | 19.572 MiB (~19,1 GiB) |
| Tarea | text-to-image |
| Plataformas soportadas | ComfyUI, RunningHub (nube), Hugging Face |
| Modelo base | Z-image-turbo (segun la model card) |
| Fecha de creacion | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no aporta información sobre la arquitectura interna del modelo. Lo único verificable es que se distribuye como un checkpoint de difusión para generación de imágenes y que ha sido ajustado a partir de Z-image-turbo, un modelo cuyo nombre sugiere una variante destilada para muestreo en pocos pasos. Cualquier afirmación sobre el tipo de backbone (UNet, DiT, MMDiT u otro), el número de parámetros, la resolución de entrenamiento o los text encoders utilizados sería una extrapolación no confirmada por el autor.

Tampoco se documenta el proceso de entrenamiento: no hay datos sobre número de imágenes, composición del dataset, resolución, uso de captions sintéticas, técnicas de regularización, ni sobre si se empleó ajuste por preferencias, destilación de paso (step distillation) o entrenamiento con LoRA fusionada. El único indicio cualitativo es el propio nombre del repositorio ("z-image-v3-nswf" y la descripción "Z image anime novel ImagingV3 nswf"), que apunta a una tercera iteración de un ajuste orientado a ilustración de estilo anime y novela, presumiblemente con material de carácter adulto.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image) mediante checkpoint cargable en ComfyUI.
- Estilización orientada a ilustración de tipo anime y novela ligera, según la descripción del autor.
- Generación de contenido de carácter adulto (el identificador del modelo incluye "nswf", probablemente "NSFW"); no hay filtro ni salvaguarda declarada en la model card.
- No se documenta soporte de image-to-image, inpainting, ControlNet, IP-Adapter, LoRA, upscaling integrado ni edición por instrucciones.
- No procede hablar de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de un LLM: este modelo no procesa ni genera texto.
- Ejecución en la nube a través de la plataforma RunningHub, que ofrece endpoints de API propios.

## Casos de uso

- Ilustración para novelas ligeras y web novels: el modelo está ajustado específicamente para ilustración de estilo anime con temática de novela, por lo que encaja en la generación de ilustraciones interiores o portadas en flujos de autoedición, siempre que se revise el resultado antes de publicar.
- Previsualización de personajes en proyectos de manga o webtoon: permite generar variantes de diseño de personaje (vestuario, encuadre, iluminación) de forma iterativa antes de encargar el trabajo definitivo a un ilustrador.
- Assets para videojuegos independientes: retratos de personaje, iconos de habilidad o arte conceptual para prototipos, generados por lotes desde ComfyUI y posteriormente retocados.
- Pruebas de estilo en pipelines de ComfyUI: al ser un checkpoint completo, se puede insertar directamente en un grafo existente para comparar su estética con otros checkpoints sin reescribir el pipeline.
- Generación por lotes para catálogos de contenido digital: con una GPU de 24 GB se pueden procesar colas de prompts largas de forma desatendida en ComfyUI, sujeto a las advertencias legales sobre contenido adulto.
- Base para ajustes adicionales: al estar en safetensors estándar, puede servir como punto de partida para entrenar LoRAs o ajustes específicos de personaje o estilo, siempre que la licencia del modelo base lo permita (extremo no confirmado).
- Servicio gestionado vía API: el autor distribuye el modelo a través de RunningHub, que ofrece API propia, lo que permite integrar la generación en una aplicación sin desplegar infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (FID, CLIP score, HPSv2, ImageReward ni comparativas humanas), ni tampoco indica resolución de salida, número de pasos de muestreo recomendado, guidance scale o sampler sugerido. Cualquier cifra de rendimiento debería obtenerse mediante evaluación propia comparando el mismo prompt y semilla con el modelo base Z-image-turbo.

## Requisitos de hardware

- VRAM estimada: el fichero de pesos ocupa 19.572 MiB, por lo que se necesitan al menos ~20 GB de VRAM para cargarlo completo en memoria en su precisión nativa, más el margen para activaciones y text encoders.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100. Las GPU de 24 GB son el mínimo cómodo.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, 4090). En tarjetas de 12-16 GB solo es viable con offloading de pesos a RAM del sistema, con la penalización de latencia correspondiente.
- Opciones de despliegue: ComfyUI (plataforma indicada por el autor), plataforma en la nube RunningHub y, potencialmente, conversión a Diffusers, aunque no se documenta compatibilidad oficial con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponible. El modelo base se llama "turbo", lo que habitualmente implica muestreo en pocos pasos, pero el autor no especifica el número de pasos ni tiempos de generación.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-z-image-v3-nswf-checkpoint | Checkpoint de difusion text-to-image (finetune de Z-image-turbo) | no disponible | no disponible | no disponible (derechos del autor) | Hugging Face, ComfyUI, RunningHub |
| Z-image-turbo (modelo base declarado) | Modelo de difusion text-to-image | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Repositorio propio del autor original |
| Checkpoints de anime sobre SDXL (familia Illustrious / NoobAI / Pony) | Checkpoint de difusion text-to-image | ~3,5 B en total (UNet + text encoders), cifra de dominio publico no verificada aqui | 1024x1024 nativo, cifra de dominio publico no verificada aqui | Variables segun autor (habitualmente permisivas pero con restricciones) | Amplia disponibilidad en Hugging Face y Civitai |
| Finetunes de anime sobre FLUX.1-dev | Checkpoint de difusion text-to-image | 12 B (cifra de dominio publico no verificada aqui) | no disponible en esta ficha | Sujeta a la licencia de FLUX.1-dev | Hugging Face |

La comparación cuantitativa no es posible con la información aportada por el autor de este checkpoint. La tabla anterior mezcla datos declarados en esta ficha con cifras de conocimiento público general sobre los modelos alternativos, que deberían verificarse en sus fuentes originales antes de tomar una decisión.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay datos de arquitectura, parámetros, resolución, pasos de muestreo, dataset ni metodología de entrenamiento.
- Licencia no declarada: la model card indica únicamente que los derechos pertenecen al autor y que debe seguirse la licencia del proyecto original. Esto impide determinar a priori si el uso comercial está permitido; en un entorno de producción habría que contactar con el autor.
- Contenido para adultos: el identificador incluye "nswf" (probablemente NSFW) y la serie se presenta como ajuste para ilustración de novela. No hay filtros ni salvaguardas documentadas, y su uso puede implicar obligaciones legales de verificación de edad, etiquetado y cumplimiento normativo según jurisdicción.
- Riesgo de sesgos y de sobrerrepresentación estilística: al ser un ajuste fino sobre un dataset no documentado, la diversidad de cuerpos, etnias, edades aparentes y contextos puede estar muy sesgada hacia el material de entrenamiento.
- Riesgo de alucinación visual: como cualquier modelo de difusión, puede generar anatomía incorrecta, texto ilegible, artefactos en manos y ojos, o atributos inconsistentes entre pasos.
- Trazabilidad inexistente: cero descargas y cero valoraciones en el momento de la consulta; no hay evidencia de terceros sobre calidad, estabilidad o seguridad del fichero.
- Falta de variantes ligeras: al publicarse solo el safetensors completo de ~19,1 GiB, no hay opción de cuantización oficial para reducir requisitos de memoria.
- Dependencia de la plataforma: parte del flujo promocionado apunta a servicios de RunningHub (API y nube), lo que puede introducir dependencia de un proveedor externo.
- Ambigüedad del modelo base: aunque se declara Z-image-turbo como origen, no se especifica la versión exacta ni los términos de su licencia, lo que dificulta evaluar la compatibilidad legal de este derivado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-z-image-v3-nswf-checkpoint
- README en chino: https://huggingface.co/RunningHubAI/rh-z-image-v3-nswf-checkpoint/blob/main/README_cn.md
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2005013228272971777
- Pagina del autor (@NINE.JIUGE): https://www.runninghub.cn/user-center/1958026340350025729
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Pagina de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Detalle del endpoint de API citado en la model card: https://www.runninghub.ai/call-api/api-detail/2133100000000700025

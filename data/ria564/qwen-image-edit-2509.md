# Ria564/Qwen-Image-Edit-2509

## Resumen

Qwen-Image-Edit-2509 es un modelo de difusion para edicion de imagenes (image-to-image) desarrollado por el equipo Qwen de Alibaba. Se trata de la iteracion mensual de Qwen-Image-Edit, publicada en septiembre de 2025, y su principal novedad es la capacidad de editar a partir de multiples imagenes de entrada (combinaciones "persona + persona", "persona + producto" y "persona + escena"), ademas de una mejora sustancial en la consistencia de identidad en edicion de retratos, productos y texto.

El repositorio analizado (Ria564/Qwen-Image-Edit-2509) es una publicacion no oficial que redistribuye los pesos del modelo original de Qwen bajo licencia Apache 2.0. Cuenta con 20.430.401.088 parametros (aproximadamente 20,4 mil millones) en formato safetensors y un tamano de repositorio de 57,7 GB, lo que refleja pesos en precision bfloat16. La libreria de referencia es diffusers, mediante el pipeline `QwenImageEditPlusPipeline`.

El modelo resulta relevante porque combina edicion multi-imagen, soporte nativo de ControlNet (mapas de profundidad, bordes y keypoints) y una capacidad de renderizado de texto que hereda de la familia Qwen-Image. Esta orientado a flujos de produccion de diseno grafico, comercio electronico y creacion de contenido donde la fidelidad de identidad entre la imagen de entrada y la de salida es critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (image-to-image) basado en la arquitectura de Qwen-Image-Edit; detalles internos del backbone no disponibles en la informacion proporcionada |
| Parametros totales | 20.430.401.088 (aprox. 20,4 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

La informacion disponible indica que Qwen-Image-Edit-2509 parte de la arquitectura de Qwen-Image-Edit y se entrena adicionalmente mediante concatenacion de imagenes para habilitar la edicion multi-imagen. El modelo es de tipo difusion para tareas image-to-image y se integra en diffusers a traves del pipeline `QwenImageEditPlusPipeline`. El rendimiento optimo se alcanza con 1 a 3 imagenes de entrada.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La model card menciona mejoras en consistencia de identidad (rostros, productos y texto) y soporte nativo de ControlNet, pero no detalla la metodologia de entrenamiento subyacente. El informe tecnico referenciado (arxiv:2508.02324) es la fuente indicada para ampliar estos detalles.

## Capacidades

- Edicion de imagenes image-to-image a partir de una o varias imagenes de entrada.
- Edicion multi-imagen: combinaciones "persona + persona", "persona + producto" y "persona + escena", con rendimiento optimo entre 1 y 3 imagenes.
- Consistencia de identidad mejorada en retratos: preservacion de rasgos faciales en distintos estilos y cambios de pose.
- Consistencia de producto: edicion de posters manteniendo la identidad del producto.
- Edicion de texto: modificacion de contenido, fuente, color y material del texto renderizado.
- Soporte nativo de ControlNet: mapas de profundidad, mapas de bordes y mapas de keypoints (por ejemplo, para cambiar la pose de una persona).
- Soporte multilingue de prompts en ingles y chino.
- Generacion controlada mediante parametros de inferencia (`true_cfg_scale`, `guidance_scale`, `negative_prompt`, `num_inference_steps`).

## Casos de uso

- Edicion de retratos para estudio fotografico: el modelo permite cambiar la pose de una persona manteniendo la identidad facial, lo que resulta adecuado para flujos de retoque profesional y generacion de variantes de una misma sesion.
- Creacion de posters de producto en comercio electronico: a partir de una imagen de producto y una escena, se generan composiciones publicitarias preservando la identidad del articulo, reduciendo el trabajo manual de montaje.
- Composicion multi-sujeto para contenido editorial: la entrada "persona + persona" permite generar escenas con dos individuos (por ejemplo, magos o personajes) manteniendo coherencia entre ambos.
- Control de pose mediante keypoints: integrable en pipelines donde se requiere transferir una pose concreta a un sujeto manteniendo su apariencia, util en animacion y previsualizacion.
- Edicion tipografica en materiales de marketing: modificacion de fuente, color y material del texto renderizado en una imagen, aprovechando la capacidad de renderizado de texto de la familia Qwen-Image.
- Prototipado rapido de diseno grafico: generacion de variantes de una imagen base con cambios controlados mediante prompts en ingles o chino, para iteracion rapida en equipos creativos.
- Automatizacion de catalogos de moda: combinacion de imagenes de modelos y prendas para generar vistas de producto con consistencia de identidad, reduciendo costes de sesion fotografica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 20,4 mil millones de parametros en bfloat16, los pesos ocupan aproximadamente 40,9 GB, por lo que se requiere una GPU con al menos 48 GB de VRAM para inferencia en precision completa sin tecnicas de offload.
- GPU recomendadas: A100 80 GB, H100 80 GB y GPUs con 48 GB o mas (por ejemplo, A6000) para ejecucion comoda en bfloat16.
- Cabe en GPU consumer: no disponible de forma confirmada; en GPUs de 24 GB (RTX 4090) requeriria cuantizacion u offload de modulos, extremo no documentado en la informacion proporcionada.
- Opciones de despliegue: diffusers con `QwenImageEditPlusPipeline` (requiere instalar diffusers desde el repositorio de GitHub). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un modelo de difusion de este tipo.
- Latencia y throughput: no disponibles. La configuracion de ejemplo emplea 40 pasos de inferencia con `true_cfg_scale` de 4.0 y `guidance_scale` de 1.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-Edit-2509 (este repo) | 20,4 mil millones | Multi-imagen (1-3), ControlNet | apache-2.0 | Hugging Face (repo no oficial Ria564) |
| Qwen-Image-Edit (agosto 2025) | no disponible | Imagen unica | apache-2.0 (segun repo original) | Hugging Face (Qwen/Qwen-Image-Edit) |
| Alternativas de edicion de imagen | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con la version anterior Qwen-Image-Edit, de la que se indica que 2509 mejora la consistencia de identidad y anade soporte multi-imagen y ControlNet nativo. No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la informacion facilitada.

## Limitaciones y advertencias

- El repositorio analizado (Ria564/Qwen-Image-Edit-2509) no es el oficial de Qwen; se trata de una redistribucion con 0 descargas y 0 likes en el momento de la consulta, por lo que conviene verificar la integridad de los pesos frente al repositorio original Qwen/Qwen-Image-Edit-2509.
- Idiomas soportados limitados a ingles y chino; no se documenta soporte de castellano para los prompts.
- El rendimiento optimo se declara con 1 a 3 imagenes de entrada; no se especifica el comportamiento con mas imagenes.
- No se detallan sesgos conocidos, tasas de alucinacion visual ni limitaciones de resolucion en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de una redistribucion no oficial se recomienda consultar la licencia y terminos del repositorio original de Qwen antes de un despliegue en produccion.
- No se documentan requisitos de VRAM, latencia ni opciones de cuantizacion, lo que dificulta la planificacion de infraestructura.
- El modelo es de difusion para imagen; no soporta generacion de texto, codigo ni tool calling, a diferencia de los modelos de lenguaje de la familia Qwen.

## Enlaces

- Repositorio analizado en Hugging Face: https://huggingface.co/Ria564/Qwen-Image-Edit-2509
- Repositorio original del modelo: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-Edit-2509
- Informe tecnico (PDF): https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen-Image/Qwen_Image.pdf
- Blog de Qwen-Image-Edit: https://qwenlm.github.io/blog/qwen-image-edit/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-Edit
- Repositorio GitHub: https://github.com/QwenLM/Qwen-Image
- Discord: https://discord.gg/CV4E9rpNSD
- Qwen Chat: https://chat.qwen.ai/
- arXiv: 2508.02324

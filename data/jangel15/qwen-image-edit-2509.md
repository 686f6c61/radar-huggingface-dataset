# JAngel15/Qwen-Image-Edit-2509

## Resumen

Qwen-Image-Edit-2509 es un modelo de edicion de imagenes condicionada por texto (image-to-image) desarrollado por el equipo Qwen de Alibaba. Se trata de la iteracion mensual de Qwen-Image-Edit, publicada en septiembre de 2025, y su principal novedad es la capacidad de aceptar multiples imagenes de entrada (combinaciones persona+persona, persona+producto, persona+escena) manteniendo la coherencia de identidad entre ellas. El modelo se distribuye a traves de la libreria Diffusers con el pipeline `QwenImageEditPlusPipeline`.

Con aproximadamente 20.430 millones de parametros en formato safetensors y un repositorio de 57,7 GB, el modelo incorpora mejoras sustanciales en consistencia de edicion sobre su predecesor de agosto: preservacion de identidad facial en retratos y cambios de pose, consistencia de identidad de producto para carteleria comercial y edicion de texto que ahora permite modificar fuente, color y material ademas del contenido. Tambien anade soporte nativo de ControlNet con mapas de profundidad, bordes y keypoints.

La relevancia actual del modelo radica en que combina edicion multi-imagen de alta consistencia con licencia Apache 2.0, lo que lo hace apto para uso comercial sin restricciones adicionales. Esta ficha describe la copia alojada por el usuario JAngel15 en HuggingFace, que replica el modelo oficial Qwen/Qwen-Image-Edit-2509.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para edicion de imagen (image-to-image), basado en la arquitectura Qwen-Image-Edit con entrenamiento por concatenacion de imagenes para soporte multi-imagen |
| Parametros totales | 20.430.401.088 (aprox. 20,4 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el ejemplo oficial usa `torch_dtype=torch.bfloat16` |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

Qwen-Image-Edit-2509 es un modelo de difusion para edicion de imagenes que parte de la arquitectura de Qwen-Image-Edit y se entrena adicionalmente mediante concatenacion de imagenes para habilitar la edicion con multiples entradas. Segun la model card, el rendimiento optimo se alcanza con entre 1 y 3 imagenes de entrada. El modelo integra de forma nativa soporte de ControlNet, lo que permite condicionar la generacion con mapas de profundidad, mapas de bordes y mapas de keypoints.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card si documenta las mejoras respecto a la version de agosto: mayor consistencia en edicion de personas (preservacion de identidad facial, estilos de retrato y transformaciones de pose), mayor consistencia en edicion de productos (identidad de producto para carteleria) y edicion de texto ampliada (fuente, color y material ademas del contenido). Para mas detalle tecnico se referencia el tech report en PDF enlazado en la model card.

## Capacidades

- Edicion de imagen condicionada por texto (image-to-image) con prompts en ingles y chino.
- Edicion multi-imagen: acepta combinaciones de 1 a 3 imagenes (persona+persona, persona+producto, persona+escena).
- Preservacion de identidad facial en retratos y cambios de pose con alta consistencia.
- Preservacion de identidad de producto para edicion de carteleria comercial.
- Edicion de texto en imagen: modificacion de contenido, fuente, color y material.
- Soporte nativo de ControlNet: mapas de profundidad, bordes y keypoints (incluido cambio de pose de personas).
- Generacion de imagenes con control de semilla (`torch.manual_seed`) y parametros de inferencia ajustables (`true_cfg_scale`, `guidance_scale`, `num_inference_steps`, `negative_prompt`).
- Soporte de multiples imagenes por prompt en una sola llamada al pipeline.
- No se documentan capacidades de tool calling, agentes, audio ni thinking mode (no aplica a un modelo de difusion).

## Casos de uso

- Edicion de retratos y fotografia profesional: el modelo preserva la identidad facial al cambiar pose o estilo, lo que permite generar variaciones de un retrato corporativo manteniendo el rostro del sujeto, con soporte de mapas de keypoints para controlar la pose.
- Composicion publicitaria persona+producto: combinando una foto de modelo y una foto de producto en una sola entrada, el modelo genera una imagen de campana coherente preservando la identidad de ambos elementos, adecuado para carteleria y e-commerce.
- Edicion de carteleria y packaging: la mejora en consistencia de producto permite modificar el entorno o el estilo de un poster manteniendo el producto intacto, util para equipos de marketing que iteran creatividades.
- Retoque de texto en imagenes: modificacion de contenido, fuente, color y material de textos renderizados en la imagen, aplicable a mockups de etiquetas, carteles y material promocional en ingles y chino.
- Integracion en pipelines de diseno automatizado: al cargarse via `QwenImageEditPlusPipeline` de Diffusers, puede integrarse en flujos programaticos de generacion de variantes a partir de una imagen base y un prompt, con control de semilla para reproducibilidad.
- Prototipado de escenas con multiples referencias: combinacion persona+escena para insertar un sujeto en un entorno nuevo (por ejemplo, un cliente en un local) preservando la identidad del sujeto y la coherencia visual del conjunto.
- Control de pose en produccion audiovisual: uso de mapas de keypoints como ControlNet para dirigir la pose de un personaje en storyboards o previsualizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 20,4 mil millones de parametros en bfloat16, los pesos ocupan aproximadamente 40,9 GB, por lo que se requiere una GPU con al menos 48 GB de VRAM para inferencia en precision completa sin offloading.
- GPU recomendadas: A100 80 GB o H100 para ejecucion comoda en bfloat16; A100 40 GB requeriria tecnicas de offloading o cuantizacion.
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090) en bfloat16 sin cuantizacion u offloading; no se documentan recetas de cuantizacion en la informacion disponible.
- Opciones de despliegue: Diffusers con `QwenImageEditPlusPipeline` (requiere instalar la version de desarrollo desde GitHub: `pip install git+https://github.com/huggingface/diffusers`). No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para este modelo de difusion.
- Latencia y throughput: no disponibles. El ejemplo oficial usa 40 pasos de inferencia (`num_inference_steps=40`) y `true_cfg_scale=4.0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-Edit-2509 (esta ficha) | ~20,4 mil millones | 1 a 3 imagenes de entrada, ControlNet nativo | Apache 2.0 | HuggingFace, ModelScope, Qwen Chat |
| Qwen-Image-Edit (agosto 2025) | no disponible | Entrada de una imagen; sin soporte multi-imagen documentado | Apache 2.0 (segun model card del predecesor) | HuggingFace, Qwen Chat |
| Alternativas de edicion de imagen de otros proveedores | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con la version anterior del propio modelo. No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en el material consultado.

## Limitaciones y advertencias

- El rendimiento optimo se documenta para 1 a 3 imagenes de entrada; no se garantiza calidad con mas imagenes.
- Idiomas soportados limitados a ingles y chino; los prompts en otros idiomas pueden degradar el resultado.
- Riesgo de alucinacion visual: como modelo generativo de difusion, puede introducir elementos no presentes en la imagen de entrada o alterar detalles no solicitados.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; al ser un modelo entrenado con datos a gran escala, es probable que herede sesgos de representacion de personas y productos.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen-Image-Edit original y de los datos de entrenamiento.
- Esta copia concreta (JAngel15/Qwen-Image-Edit-2509) tiene 0 descargas y 0 likes en el momento de la consulta; se recomienda usar el repositorio oficial Qwen/Qwen-Image-Edit-2509 para produccion.
- Requiere la version de desarrollo de Diffusers; no se garantiza compatibilidad con versiones estables publicadas.
- No se documentan recetas de cuantizacion, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Repositorio HuggingFace de esta copia: https://huggingface.co/JAngel15/Qwen-Image-Edit-2509
- Repositorio oficial: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-Edit-2509
- Tech report (PDF): https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen-Image/Qwen_Image.pdf
- Blog oficial: https://qwenlm.github.io/blog/qwen-image-edit/
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-Edit
- Repositorio GitHub: https://github.com/QwenLM/Qwen-Image
- Qwen Chat: https://chat.qwen.ai/
- Discord: https://discord.gg/CV4E9rpNSD
- Paper referenciado en tags (arXiv:2508.02324): https://arxiv.org/abs/2508.02324

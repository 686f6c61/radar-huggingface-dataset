# Poif1482/Qwen-Image-Edit-2509

## Resumen

Qwen-Image-Edit-2509 es un modelo de edicion de imagenes condicionada por texto (image-to-image) desarrollado por el equipo Qwen de Alibaba. Se trata de la iteracion mensual de septiembre de 2025 del modelo Qwen-Image-Edit lanzado en agosto, y su principal novedad es el soporte nativo de multiples imagenes de entrada (combinaciones "persona + persona", "persona + producto", "persona + escena"), con un rendimiento optimo entre 1 y 3 imagenes. El repositorio analizado (Poif1482/Qwen-Image-Edit-2509) es una copia comunitaria del modelo original alojado en Qwen/Qwen-Image-Edit-2509.

El modelo emplea la libreria diffusers mediante el pipeline `QwenImageEditPlusPipeline` y cuenta con 20.430.401.088 parametros totales en formato safetensors, con un tamano de repositorio de 57,7 GB. Esta disponible bajo licencia Apache 2.0, lo que permite uso comercial, y declara soporte para ingles y chino. Su relevancia actual radica en que mejora de forma medible la consistencia de identidad en edicion de retratos, productos y texto, e incorpora ControlNet de forma nativa (mapas de profundidad, bordes y keypoints).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para edicion de imagen condicionada por texto (pipeline diffusers `QwenImageEditPlusPipeline`) |
| Parametros totales | 20.430.401.088 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el ejemplo oficial usa bfloat16) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

La informacion disponible indica que Qwen-Image-Edit-2509 se construye sobre la arquitectura de Qwen-Image-Edit y se entrena adicionalmente mediante concatenacion de imagenes para habilitar la edicion con multiples entradas. El modelo hereda del Qwen-Image base su capacidad de renderizado de texto en imagen, que se combina con las mejoras de consistencia de esta iteracion. El pipeline oficial se ejecuta en bfloat16 sobre CUDA y expone parametros como `true_cfg_scale` (4.0 en el ejemplo), `negative_prompt`, `num_inference_steps` (40 en el ejemplo) y `guidance_scale` (1.0 en el ejemplo).

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal. El informe tecnico referenciado (Qwen_Image.pdf) y el blog oficial son las fuentes indicadas por el autor para ampliar esta informacion.

## Capacidades

- Edicion de imagen guiada por texto (image-to-image) con instrucciones en lenguaje natural.
- Edicion con multiples imagenes de entrada: combinaciones persona + persona, persona + producto y persona + escena; rendimiento optimo con 1 a 3 imagenes.
- Consistencia de identidad en retratos: preservacion del rostro, soporte de multiples estilos de retrato y transformaciones de pose.
- Consistencia de producto: preservacion de la identidad del producto para edicion de posters y material comercial.
- Edicion de texto en imagen: modificacion de contenido, ademas de fuente, color y material del texto.
- Soporte nativo de ControlNet: mapas de profundidad, mapas de bordes, mapas de keypoints y otros.
- Capacidades multilingues limitadas a ingles y chino segun la model card.

## Casos de uso

- Edicion de retratos para estudio fotografico: el modelo permite cambiar la pose de una persona manteniendo la identidad facial, lo que resulta adecuado para produccion de variantes de una misma sesion sin re-fotografiar al sujeto.
- Marketing de producto: a partir de una foto de producto y una imagen de escena, el modelo compone posters preservando la identidad del producto, util para catalogos y campanas con multiples formatos.
- Composicion de escenas con varias personas: la entrada multi-imagen (persona + persona) permite generar escenas donde dos sujetos interactuan (por ejemplo, frente a frente en una plaza), reduciendo el trabajo de composicion manual.
- Edicion tipografica en diseno grafico: modificacion de textos dentro de una imagen cambiando contenido, fuente, color y material, util para adaptar creatividades a distintas marcas o idiomas (en/zh).
- Control de pose con keypoints: el soporte nativo de ControlNet con mapas de keypoints permite dirigir la pose de un personaje para ilustracion, storyboards o animatica.
- Retoque guiado por profundidad o bordes: el uso de mapas de profundidad y de bordes facilita ediciones estructuralmente coherentes en flujos de postproduccion.
- Iteracion creativa en entornos de diseno: el pipeline diffusers permite integrar la edicion en cuadernos o herramientas internas con control fino de pasos de inferencia y escala de guiado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 20.430 millones de parametros en bfloat16, los pesos ocupan aproximadamente 40,9 GB, por lo que se requiere una GPU con al menos esa capacidad, mas memoria adicional para activaciones y el codificador de texto.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del modelo, se situa en el rango de GPUs de centro de datos (A100 80 GB, H100) y no en GPUs de consumo de 24 GB sin cuantizacion.
- Compatibilidad con GPU de consumo: no confirmada; con cuantizacion no documentada oficialmente, no puede afirmarse que quepa en una RTX 4090 de 24 GB.
- Opciones de despliegue: pipeline `QwenImageEditPlusPipeline` de diffusers (requiere instalar diffusers desde el repositorio git de Hugging Face). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles; el ejemplo oficial emplea 40 pasos de inferencia con `true_cfg_scale` 4.0 y `guidance_scale` 1.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-Edit-2509 (este modelo) | 20.430.401.088 | No disponible | Apache 2.0 | Hugging Face, ModelScope, Qwen Chat |
| Qwen-Image-Edit (agosto 2025) | No disponible | No disponible | No disponible | Hugging Face (Qwen/Qwen-Image-Edit) |
| Alternativas de edicion de imagen de otros proveedores | No disponible | No disponible | No disponible | No disponible |

La unica comparacion documentada es con la version anterior Qwen-Image-Edit, respecto a la cual esta iteracion anade edicion multi-imagen, mejor consistencia de persona, producto y texto, y soporte nativo de ControlNet. No se dispone de datos de benchmarks ni de especificaciones de terceros para establecer una comparativa cuantitativa con otros modelos de edicion de imagen.

## Limitaciones y advertencias

- Idiomas: la model card solo declara ingles y chino; el rendimiento en otros idiomas no esta documentado.
- Multi-imagen: el rendimiento optimo se alcanza con 1 a 3 imagenes de entrada; no se especifica el comportamiento con mas entradas.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; cabe esperar los sesgos propios de los datos de entrenamiento, no detallados.
- Alucinacion visual: no se documenta tasa de error ni fidelidad de edicion; no hay benchmarks publicados que permitan evaluar el riesgo de alteraciones no deseadas.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la procedencia de los pesos de esta copia comunitaria (Poif1482) frente al repositorio oficial de Qwen.
- Repositorio comunitario: esta publicacion tiene 18 descargas y 0 likes; se recomienda usar el repositorio oficial Qwen/Qwen-Image-Edit-2509 para produccion.
- Dependencia de version: el codigo de ejemplo requiere instalar diffusers desde el repositorio git, lo que implica riesgo de inestabilidad de API en produccion.
- Requisitos de memoria: el tamano de pesos en bfloat16 (aproximadamente 40,9 GB) limita el despliegue a hardware de centro de datos.

## Enlaces

- Repositorio analizado: https://huggingface.co/Poif1482/Qwen-Image-Edit-2509
- Repositorio oficial: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-Edit-2509
- Informe tecnico: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen-Image/Qwen_Image.pdf
- Blog oficial: https://qwenlm.github.io/blog/qwen-image-edit/
- Demo: https://huggingface.co/spaces/Qwen/Qwen-Image-Edit
- GitHub: https://github.com/QwenLM/Qwen-Image
- Qwen Chat: https://chat.qwen.ai/
- Discord: https://discord.gg/CV4E9rpNSD
- arXiv (referencia de la model card): arxiv:2508.02324

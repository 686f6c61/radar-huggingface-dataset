# sakamakismile/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4

## Resumen

El modelo `sakamakismile/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4` es una adaptación del modelo de visión-lenguaje Qwen3-VL-32B, en la que se sustituye el text encoder original por un MiniMax-H3, un codificador de texto de la familia MiniMax. Esta versión concreta ha sido cuantizada en NVFP4 (formato de punto flotante de 4 bits de NVIDIA) y sometida a un proceso de "abliteración" que elimina los mecanismos de rechazo de contenido, resultando en un modelo etiquetado como "uncensored". El resultado es un archivo de 15,7 GB que cabe en una GPU de 16 GB, pensado para su uso como text encoder dentro de ComfyUI para generación de vídeo.

El modelo está desarrollado por el usuario de Hugging Face `sakamakismile` y se basa en el trabajo previo de `ethanfel/Qwen3-VL-32B-Ultra-Heretic-MiniMax-H3-ComfyUI-INT8-ConvRot`, del que es una re-cuantización a NVFP4. Su relevancia radica en ofrecer una alternativa sin censura y con menor huella de memoria para flujos de trabajo de generación de vídeo en ComfyUI, manteniendo una calidad visual comparable a la versión INT8 de referencia. No se dispone de información pública sobre el proceso de entrenamiento, los datos utilizados o los benchmarks de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-32B con text encoder MiniMax-H3 (adaptación) |
| Parametros totales | no disponible (el archivo pesa 15,7 GB en NVFP4) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (punto flotante de 4 bits de NVIDIA) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (según tag del repositorio) |
| Formato de pesos | NVFP4 (safetensors, presumiblemente) |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3-VL-32B, un modelo multimodal que procesa imágenes y texto, pero en esta variante se reemplaza el text encoder original por un MiniMax-H3. El MiniMax-H3 es un codificador de texto de la familia MiniMax, diseñado para generar representaciones textuales ricas para tareas de generación de vídeo. El modelo ha sido "abliterated", es decir, se han eliminado los pesos responsables de los rechazos de contenido, lo que permite generar respuestas sin restricciones de seguridad. Posteriormente se ha cuantizado a NVFP4, un formato de 4 bits en coma flotante optimizado para GPUs NVIDIA, reduciendo el tamaño del archivo a 15,7 GB. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y comprensión de imágenes (al ser una variante de Qwen3-VL).
- Actúa como text encoder para generación de vídeo en ComfyUI, proporcionando representaciones textuales al modelo de difusión.
- Soporte para flujos de trabajo de ComfyUI, integrable como nodo de text encoder.
- Capacidad de generar contenido sin censura (debido al proceso de abliteración).
- Cuantización NVFP4 que permite ejecución en GPUs con 16 GB de VRAM.
- Compatibilidad con el ecosistema de herramientas de generación de vídeo basadas en MiniMax-H3.

## Casos de uso

- Generación de vídeo en ComfyUI: el modelo se utiliza como text encoder dentro de pipelines de generación de vídeo, permitiendo que una GPU de 16 GB (por ejemplo, RTX 4090) ejecute el proceso completo sin necesidad de hardware de gama alta.
- Creación de contenido creativo sin restricciones: al ser "uncensored", es adecuado para proyectos artísticos o experimentales que requieran prompts sin filtros de seguridad.
- Investigación en alineación y seguridad: el proceso de abliteración puede estudiarse para entender cómo se comportan los modelos sin mecanismos de rechazo.
- Desarrollo de herramientas de generación de vídeo de código abierto: sirve como componente en proyectos que buscan alternativas a los text encoders propietarios.
- Adaptación de modelos de visión-lenguaje a tareas específicas: la sustitución del text encoder demuestra un enfoque de modificación arquitectónica que puede replicarse en otros contextos.
- Evaluación de cuantización NVFP4: permite comparar el rendimiento y la calidad de este formato frente a INT8 u otras cuantizaciones en tareas de generación de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de generación de vídeo. La única indicación de rendimiento es la afirmación del autor de que la calidad visual es comparable a la versión INT8 de referencia, pero sin métricas cuantitativas.

## Requisitos de hardware

- VRAM estimada: 15,7 GB para el archivo de pesos, por lo que se requiere al menos 16 GB de VRAM para cargar el modelo completo.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40 GB) o cualquier GPU con 16 GB o más de VRAM.
- Cabe en GPUs de consumo como la RTX 4080 o RTX 4090, pero no en tarjetas de 8 GB o 12 GB.
- Opciones de despliegue: ComfyUI (principal), posiblemente también vLLM o llama.cpp si se convierte a GGUF, aunque no se ha confirmado.
- Latencia y throughput: no disponible. Dependerá del hardware y de la tarea de generación de vídeo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Qwen3-VL-32B (original) | 32B (aprox.) | no disponible | Apache 2.0 | Visión-lenguaje general |
| ethanfel/Qwen3-VL-32B-Ultra-Heretic-MiniMax-H3-ComfyUI-INT8-ConvRot | 32B (aprox.) | no disponible | Apache 2.0 | Text encoder para vídeo (INT8) |
| Este modelo (NVFP4) | no disponible | no disponible | Apache 2.0 | Text encoder para vídeo (NVFP4) |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de información sobre otros text encoders como CLIP o T5 en este contexto.

## Limitaciones y advertencias

- Al ser "uncensored" y "abliterated", el modelo puede generar contenido inapropiado, ofensivo o peligroso sin restricciones. No es adecuado para aplicaciones comerciales o públicas sin supervisión humana.
- Riesgo de alucinación: al ser una adaptación sin entrenamiento específico, puede producir respuestas inexactas o inventadas, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, por lo que puede no ser adecuado para tareas que requieran ventanas largas.
- Idiomas: no se ha confirmado qué idiomas soporta, aunque al derivar de Qwen3-VL probablemente tenga soporte multilingüe, pero no está garantizado.
- Restricciones de licencia: aunque el tag indica Apache 2.0, el uso comercial debe verificarse con el autor, ya que la abliteración puede implicar modificaciones no documentadas.
- Para producción: la falta de benchmarks y documentación técnica hace que su uso en entornos críticos sea arriesgado. Se recomienda validar exhaustivamente antes de desplegar.

## Enlaces

- [Hugging Face - sakamakismile/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4](https://huggingface.co/sakamakismile/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4)
- [Pirateface - página del modelo](https://pirateface.co/sakamakismile/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4)
- [Modelo base: ethanfel/Qwen3-VL-32B-Ultra-Heretic-MiniMax-H3-ComfyUI-INT8-ConvRot](https://huggingface.co/ethanfel/Qwen3-VL-32B-Ultra-Heretic-MiniMax-H3-ComfyUI-INT8-ConvRot) (referencia)

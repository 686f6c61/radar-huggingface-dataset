# Poij-cv1/Qwen-Image-Edit-2509

## Resumen

Qwen-Image-Edit-2509 es un modelo de edición de imágenes (image-to-image) desarrollado por el equipo Qwen de Alibaba. Se trata de la iteración mensual de Qwen-Image-Edit, publicada en septiembre de 2025, y está construido sobre la arquitectura del modelo base Qwen-Image. El modelo resuelve el problema de la edición de imágenes guiada por instrucciones en lenguaje natural, con especial énfasis en la consistencia de identidad (personas y productos) y en el soporte de múltiples imágenes de entrada.

La versión 2509 introduce tres mejoras principales: soporte nativo de edición multi-imagen (combinaciones persona+persona, persona+producto, persona+escena, con rendimiento óptimo entre 1 y 3 imágenes de entrada), una mejora sustancial en la consistencia de edición de imagen única (preservación de identidad facial, de identidad de producto y de edición de texto incluyendo fuente, color y material) y soporte nativo de ControlNet (mapas de profundidad, mapas de bordes, mapas de keypoints, entre otros).

El repositorio analizado es un espejo publicado por el usuario Poij-cv1 con licencia Apache 2.0, que redistribuye los pesos del modelo oficial. El modelo tiene 20.430.401.088 parámetros (aproximadamente 20,4 mil millones) en formato safetensors, con un tamaño de repositorio de 57,7 GB, y está diseñado para ejecutarse mediante la librería diffusers con el pipeline `QwenImageEditPlusPipeline`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para edición de imágenes (image-to-image), basado en Qwen-Image; detalles internos de la arquitectura no disponibles en la información proporcionada |
| Parametros totales | 20.430.401.088 (aproximadamente 20,4 mil millones) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

La información disponible indica que Qwen-Image-Edit-2509 es una evolución de Qwen-Image-Edit, construida sobre la arquitectura del modelo base Qwen-Image. Para habilitar la edición multi-imagen, el modelo se entrena adicionalmente mediante concatenación de imágenes, lo que permite procesar combinaciones como persona+persona, persona+producto y persona+escena. El modelo incorpora soporte nativo de ControlNet, lo que implica que acepta mapas de profundidad, mapas de bordes y mapas de keypoints como condicionamiento adicional.

No se dispone en la información proporcionada de datos concretos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. El pipeline de referencia (`QwenImageEditPlusPipeline`) utiliza muestreo con `num_inference_steps` de 40, `true_cfg_scale` de 4.0 y `guidance_scale` de 1.0 en los ejemplos oficiales.

## Capacidades

- Edición de imágenes guiada por instrucciones en lenguaje natural (image-to-image).
- Edición multi-imagen: soporta combinaciones de 1 a 3 imágenes de entrada (persona+persona, persona+producto, persona+escena), con rendimiento óptimo en ese rango.
- Consistencia de identidad en personas: preservación de identidad facial a través de distintos estilos de retrato y transformaciones de pose.
- Consistencia de identidad en productos: preservación de la identidad del producto, incluyendo edición de pósteres de producto.
- Edición de texto en imágenes: modificación de contenido de texto, además de edición de fuente, color y material del texto.
- Soporte nativo de ControlNet: mapas de profundidad, mapas de bordes, mapas de keypoints y otros; permite, por ejemplo, cambiar la pose de una persona.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- No se dispone de información sobre soporte de tool calling, function calling ni capacidades de agente, dado que es un modelo de edición de imágenes y no un modelo de lenguaje.

## Casos de uso

- Edición de retratos con preservación de identidad: el modelo mantiene la identidad facial al cambiar pose o estilo, lo que permite generar variaciones de un retrato para catálogos, avatares o material de marketing sin perder el parecido del sujeto.
- Composición de escenas con múltiples personas: gracias al soporte multi-imagen (persona+persona), se pueden combinar dos retratos en una escena conjunta, útil para ilustraciones, material promocional o pruebas de concepto visuales.
- Integración de producto en escenas: con la combinación persona+producto o producto+escena, se puede insertar un producto en un contexto realista conservando su identidad, lo que resulta adecuado para anuncios y pósteres de producto.
- Edición de texto en carteles y materiales gráficos: la capacidad de modificar contenido, fuente, color y material del texto permite adaptar carteles localizados (inglés/chino) sin rehacer el diseño desde cero.
- Control de pose mediante ControlNet: el uso de mapas de keypoints permite cambiar la pose de una persona en una fotografía, aplicable a ilustración, animación o previsualización de vestuario.
- Previsualización de diseño y prototipado visual: la edición guiada por instrucciones y el condicionamiento por mapas de profundidad o bordes permiten iterar rápidamente sobre bocetos y composiciones antes de la producción final.
- Flujos de trabajo con diffusers: al integrarse en el pipeline `QwenImageEditPlusPipeline`, puede incorporarse a scripts de Python y a pipelines de generación por lotes en entornos con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 20,4 mil millones de parámetros en bfloat16, los pesos ocupan aproximadamente 40,9 GB, por lo que se requiere una GPU con al menos esa capacidad para cargar el modelo sin cuantización.
- GPU recomendadas: no se especifican en la información proporcionada; por el tamaño del modelo, GPUs de clase A100 (40/80 GB) o H100 son las candidatas naturales, aunque no se confirma oficialmente.
- ¿Cabe en GPU de consumo? No es probable en configuraciones de 24 GB o menos sin cuantización, dado el tamaño en bfloat16; no se dispone de datos sobre variantes cuantizadas.
- Opciones de despliegue: diffusers con `QwenImageEditPlusPipeline` (requiere instalar la versión de desarrollo desde el repositorio de GitHub de Hugging Face). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-Edit-2509 (este) | 20,4 mil millones | No aplica (imagen) | Apache 2.0 | Hugging Face, ModelScope |
| Qwen-Image-Edit (agosto 2025) | No disponible | No aplica (imagen) | No disponible en la información | Hugging Face (Qwen/Qwen-Image-Edit-2509 referenciado) |

No se dispone en la información proporcionada de datos sobre otros modelos comparables de edición de imágenes (parámetros, contexto, rendimiento o licencia), por lo que la comparativa con alternativas adicionales se indica como no disponible.

## Limitaciones y advertencias

- El repositorio analizado es un espejo de terceros (Poij-cv1) con 0 descargas y 0 likes; no es el repositorio oficial de Qwen, por lo que conviene verificar la integridad de los pesos frente al repositorio oficial Qwen/Qwen-Image-Edit-2509.
- El modelo solo declara soporte de inglés y chino; el rendimiento en otros idiomas no está garantizado.
- No se dispone de información sobre sesgos conocidos ni sobre tasas de alucinación o artefactos específicos.
- Aunque la licencia es Apache 2.0 (permite uso comercial), el espejo de terceros puede no incluir avisos o documentación adicional del autor original; se recomienda revisar la licencia y los términos en el repositorio oficial.
- El tamaño del modelo (20,4 mil millones de parámetros, 57,7 GB de repositorio) implica requisitos de hardware elevados para producción; no se documentan variantes cuantizadas.
- El rendimiento óptimo en edición multi-imagen se limita a 1-3 imágenes de entrada según la model card; con más imágenes el comportamiento no está garantizado.
- No se dispone de información sobre latencia, throughput ni estabilidad en producción.

## Enlaces

- Repositorio analizado: https://huggingface.co/Poij-cv1/Qwen-Image-Edit-2509
- Repositorio oficial: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-Edit-2509
- Tech Report: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen-Image/Qwen_Image.pdf
- Blog: https://qwenlm.github.io/blog/qwen-image-edit/
- Demo: https://huggingface.co/spaces/Qwen/Qwen-Image-Edit
- GitHub: https://github.com/QwenLM/Qwen-Image
- Discord: https://discord.gg/CV4E9rpNSD
- Qwen Chat: https://chat.qwen.ai/
- arXiv: arxiv:2508.02324

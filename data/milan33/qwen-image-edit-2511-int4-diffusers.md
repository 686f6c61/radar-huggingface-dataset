# milan33/Qwen-Image-Edit-2511-INT4-Diffusers

## Resumen

Qwen-Image-Edit-2511-INT4-Diffusers es una versión cuantizada en 4 bits (NF4) del modelo Qwen-Image-Edit-2511, desarrollado por el equipo Qwen de Alibaba. Este modelo está especializado en edición de imágenes mediante instrucciones en lenguaje natural, sin necesidad de máscaras explícitas ni puntos de control. La cuantización reduce significativamente los requisitos de memoria y acelera la inferencia, manteniendo la compatibilidad con el ecosistema Diffusers de Hugging Face.

El modelo base cuenta con 20 000 millones de parámetros y está diseñado para tareas de image-to-image, incluyendo inpainting y edición creativa. Esta versión cuantizada utiliza cuantización NF4 con doble cuantización en el componente transformer, almacenando los pesos en 4 bits y realizando los cálculos en bfloat16. Es relevante porque permite ejecutar un modelo de edición de imágenes de gran tamaño en hardware más asequible, como GPUs de consumo, sin sacrificar en exceso la calidad de los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de difusión para edición de imágenes, basado en Qwen-Image-Edit-2511) |
| Parametros totales | 20 000 millones (20B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NF4 4-bit con doble cuantización (bitsandbytes) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.bin` (tensores bitsandbytes NF4) |

## Arquitectura y entrenamiento

Esta versión es una cuantización del modelo original Qwen-Image-Edit-2511, que es un modelo de difusión multimodal de 20 000 millones de parámetros. La cuantización se aplica únicamente al componente transformer, utilizando el formato NF4 (NormalFloat4) con doble cuantización para reducir aún más el overhead de memoria. Los pesos se almacenan en 4 bits, pero las operaciones de cómputo se realizan en bfloat16, lo que mantiene una precisión razonable durante la inferencia.

No se dispone de información detallada sobre el entrenamiento del modelo base (datos, número de tokens, técnicas de alineación, etc.). La model card del repositorio cuantizado remite al repositorio oficial de Qwen para esos detalles, pero no se han proporcionado en la información disponible.

## Capacidades

- Edición de imágenes por instrucción en lenguaje natural: el modelo interpreta descripciones textuales y aplica modificaciones a la imagen de entrada sin necesidad de máscaras o anotaciones adicionales.
- Inpainting: puede rellenar o reemplazar regiones específicas de una imagen basándose en la instrucción.
- Consistencia de personajes: mantiene la identidad y características visuales del sujeto principal durante ediciones imaginativas.
- Consistencia multi-persona: mejora la coherencia cuando hay múltiples sujetos en la imagen.
- Image-to-image: acepta una imagen de entrada y genera una versión editada según el prompt.
- Compatibilidad con Diffusers: se integra con `QwenImageEditPlusPipeline`, lo que facilita su uso en flujos de trabajo existentes.

## Casos de uso

- Retoque fotográfico profesional: un fotógrafo puede pedir "cambia el fondo a una playa al atardecer" y el modelo aplica la modificación manteniendo la iluminación y perspectiva originales, ahorrando horas de trabajo manual en Photoshop.
- Generación de variaciones de producto para e-commerce: un diseñador sube una imagen de un producto y solicita "cambia el color a rojo" o "añade una etiqueta", obteniendo múltiples variantes para catálogos sin necesidad de sesiones fotográficas adicionales.
- Edición creativa en publicidad: un equipo de marketing puede transformar una fotografía base en diferentes escenas o estilos (por ejemplo, "convierte esta foto en un dibujo animado") para campañas A/B testing.
- Restauración y mejora de imágenes antiguas: mediante instrucciones como "elimina las grietas" o "mejora la nitidez del rostro", el modelo puede realizar inpainting y correcciones en fotografías históricas.
- Creación de contenido para redes sociales: los creadores pueden editar selfies o fotos de eventos con instrucciones como "añade gafas de sol" o "cambia la expresión a sonrisa", sin depender de herramientas complejas.
- Automatización de flujos de diseño: integrado en un pipeline de generación de assets, el modelo puede recibir imágenes generadas por otros modelos y aplicar ajustes específicos (por ejemplo, "cambia el texto del cartel a 'Oferta'") de forma programática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye métricas de evaluación, y la búsqueda web no ha proporcionado datos numéricos de rendimiento. Se recomienda consultar el repositorio oficial de Qwen-Image-Edit-2511 para posibles evaluaciones del modelo base.

## Requisitos de hardware

- VRAM estimada: al ser una cuantización 4-bit de un modelo de 20B parámetros, los pesos ocupan aproximadamente 10 GB. Con overhead de activaciones y buffers, se estima un consumo de 12-16 GB VRAM para inferencia a resolución 1024x1024.
- GPUs recomendadas: tarjetas con 16 GB o más de VRAM, como NVIDIA RTX 4090, RTX 4080, A100, o GPUs de datacenter. En GPUs con menos VRAM, se puede usar `enable_model_cpu_offload()` para descargar partes del modelo a RAM.
- Compatibilidad con GPUs de consumo: sí, es viable en RTX 3090/4090 (24 GB) y posiblemente en RTX 3080 (10-12 GB) con offload a CPU, aunque con mayor latencia.
- Opciones de despliegue: el modelo se usa a través de la librería Diffusers con `QwenImageEditPlusPipeline`. También se puede integrar en ComfyUI mediante adaptadores como el de wazimondo (INT4 ComfyUI). Para inferencia optimizada, se puede usar vLLM o TGI si se adapta, aunque no hay soporte oficial documentado.
- Latencia y throughput: no disponibles. La cuantización NF4 suele ofrecer una aceleración de 1.5-2x frente a FP16, pero no se han publicado mediciones específicas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen-Image-Edit-2511 (base) | 20B | FP16/BF16 | Apache 2.0 | Edición por instrucción, consistencia de personajes |
| Qwen-Image-Edit-2511-INT4-Diffusers (este) | 20B | NF4 4-bit | Apache 2.0 | Mismo modelo, cuantizado para menor VRAM |
| InstructPix2Pix | ~1.5B | FP16 | Apache 2.0 | Edición por instrucción, pero con menor capacidad y sin consistencia multi-persona |

La comparativa se limita a aspectos estructurales, ya que no se dispone de benchmarks comparativos. El modelo cuantizado mantiene las capacidades del modelo base, pero con un tamaño de pesos reducido a aproximadamente la mitad. InstructPix2Pix es una alternativa más ligera, pero con menor calidad en ediciones complejas.

## Limitaciones y advertencias

- La cuantización NF4 puede introducir una ligera degradación en la calidad de la imagen generada en comparación con el modelo en precisión completa, especialmente en detalles finos o texturas.
- El modelo depende en gran medida de la claridad de la instrucción en lenguaje natural; instrucciones ambiguas pueden producir resultados inesperados.
- No se dispone de información sobre sesgos o alucinaciones específicas, pero como modelo de edición de imágenes, puede generar artefactos o modificar elementos no deseados si la instrucción es demasiado abierta.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base no tenga restricciones adicionales (según la información disponible, no las tiene).
- El formato de pesos `.bin` con bitsandbytes requiere la librería `bitsandbytes` instalada y puede no ser compatible con todos los entornos de inferencia (por ejemplo, algunos backends de CPU).
- No se han publicado resultados de evaluación de seguridad o sesgos para esta versión cuantizada.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/milan33/Qwen-Image-Edit-2511-INT4-Diffusers
- Modelo base oficial: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Versión INT4 para ComfyUI (wazimondo): https://huggingface.co/wazimondo/qwen-image-edit-2511-int4-comfy
- Guía de desarrollo de fal.ai: https://fal.ai/learn/devs/qwen-image-edit-2511-developer-guide
- Repositorio GitHub (no oficial): https://github.com/PaperTiger-L/Qwen-Image-Edit-2511
- Modelo en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen-Image-Edit-2511

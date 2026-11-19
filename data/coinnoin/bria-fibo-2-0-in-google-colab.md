# coinnoin/Bria-FIBO-2.0-in-Google-Colab

## Resumen

Bria FIBO 2.0 es un modelo de edición de imágenes guiado por instrucciones en lenguaje natural, desarrollado por Bria AI. Este repositorio concreto, publicado por el usuario `coinnoin`, no contiene los pesos del modelo en sí, sino un cuaderno de Google Colab que orquesta la descarga y ejecución de los checkpoints oficiales de FIBO 2.0 (alojados en `Comfy-Org/Fibo-2.0`) sobre un backend ComfyUI. El objetivo es permitir la edición de imágenes image-to-image en una GPU gratuita de Google Colab (NVIDIA T4, 16 GB de VRAM) mediante versiones cuantizadas a `int8_convrot`.

La familia FIBO 2.0 se distribuye en dos variantes: Turbo, orientada a baja latencia con 4 pasos de inferencia y CFG 1.0, y Dev, orientada a máxima fidelidad con 50 pasos y CFG 5.0. La arquitectura combina un transformer de difusión (DiT) con flow matching, un VAE de imagen y un text encoder basado en Qwen3-VL-8B, que además puede emplearse como "prompt enhancer" para reescribir instrucciones en lenguaje natural al formato estructurado VGL JSON que el modelo espera.

La relevancia de este repositorio es práctica: reduce a cuatro celdas la puesta en marcha de un pipeline de edición de imágenes de alta fidelidad, con descargas aceleradas mediante Aria2c y checkpoints cuantizados que evitan el OOM en GPUs de 16 GB. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño es de 0.0 GB, lo que confirma que solo aloja el cuaderno y los assets auxiliares, no los pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching; text encoder Qwen3-VL-8B; VAE de imagen |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (`int8_convrot`) para text encoder y UNet; GGUF mencionado en tags |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural, presumiblemente inglés) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (checkpoints), GGUF (variantes cuantizadas) |

## Arquitectura y entrenamiento

FIBO 2.0 se basa en un transformer de difusión (DiT) entrenado con flow matching, un paradigma que modela la transición entre ruido y datos como un campo de velocidad continuo, lo que facilita la inferencia en pocos pasos. El pipeline se completa con un VAE de imagen para la codificación y decodificación latente, y con un text encoder Qwen3-VL-8B que procesa las instrucciones multimodales (texto e imagen de entrada). La variante Turbo está optimizada para 4 pasos con CFG 1.0, mientras que Dev emplea 50 pasos con CFG 5.0 y negative prompting estructurado en formato VGL.

El repositorio no proporciona detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones adicionales más allá del uso de flow matching, la cuantización `int8_convrot` para reducir huella de VRAM y el prompt enhancer basado en Qwen3-VL-8B, que reestructura las instrucciones del usuario al formato JSON VGL requerido por el modelo.

## Capacidades

- Edición de imágenes image-to-image guiada por instrucciones en lenguaje natural (por ejemplo, cambiar el color o el tipo de una prenda).
- Generación de imágenes a partir de una imagen de entrada y un prompt textual.
- Preservación de texturas y fotorrealismo, especialmente en la variante Dev con 50 pasos.
- Restauración y mejora de imágenes dentro del flujo de edición.
- Prompt enhancement opcional: reescritura automática de la instrucción del usuario a formato VGL JSON estructurado mediante Qwen3-VL-8B.
- Negative prompting estructurado (VGL) para controlar qué elementos evitar en la salida.
- Control de semilla (seed) y de resolución de imagen.
- Integración con ComfyUI mediante workflows nodales y API.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-step en el sentido de modelos de lenguaje.

## Casos de uso

- Edición de producto para e-commerce: sustituir el fondo, cambiar el color de una prenda o modificar un accesorio a partir de una foto de catálogo, usando la variante Turbo para iterar rápido en 4 pasos sobre una T4.
- Retoque fotográfico asistido: corregir o transformar elementos concretos de una fotografía (por ejemplo, cambiar un sombrero rojo por uno negro) manteniendo la textura y la iluminación originales con la variante Dev a 50 pasos.
- Prototipado creativo en estudio de diseño: generar variaciones de una imagen base a partir de instrucciones en lenguaje natural para explorar direcciones visuales antes de producir assets finales.
- Automatización de pipelines de contenido: integrar el workflow de ComfyUI vía API para procesar lotes de imágenes con instrucciones predefinidas en un sistema de publicación.
- Docencia y formación: usar el cuaderno de Colab como material didáctico para enseñar edición generativa de imágenes sin requerir hardware propio, aprovechando la GPU gratuita T4.
- Pruebas de concepto y evaluación de modelos: comparar Turbo frente a Dev en la misma instrucción para medir el compromiso entre latencia y fidelidad antes de adoptar el modelo en producción.
- Enriquecimiento de prompts: emplear el prompt enhancer Qwen3-VL-8B para transformar instrucciones coloquiales en JSON VGL válido, útil en equipos con perfiles no técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el cuaderno está diseñado explícitamente para GPUs de 16 GB (NVIDIA T4 de Colab) gracias a los checkpoints `int8_convrot`; no se especifica la VRAM exacta por componente.
- GPU recomendadas: NVIDIA T4 (16 GB) como objetivo mínimo documentado; no se detallan otras GPU (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, al menos en T4 de 16 GB; no se confirma para otras GPU de consumo.
- Opciones de despliegue: ComfyUI (backend principal del cuaderno), con soporte de workflows nodales y API; se mencionan GGUF y safetensors como formatos.
- Latencia y throughput: no disponibles de forma numérica; se indica que Turbo ejecuta 4 pasos con CFG 1.0 y Dev 50 pasos con CFG 5.0, lo que implica una diferencia de latencia sustancial entre ambas variantes.
- Descarga de assets: acelerada con Aria2c; el cuaderno permite descargar Turbo, Dev o ambos, y opcionalmente el prompt enhancer Qwen3-VL-8B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bria FIBO 2.0 (Turbo/Dev) | no disponible | no disponible | Edición image-to-image con DiT + flow matching | other | Pesos en Comfy-Org/Fibo-2.0; cuaderno en este repo |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El repositorio no contiene los pesos del modelo: es un cuaderno de Colab que descarga checkpoints de terceros (`Comfy-Org/Fibo-2.0`); la reproducibilidad depende de la disponibilidad de esos assets externos.
- Licencia "other": no se especifican los términos exactos, por lo que el uso comercial requiere revisar la licencia original de Bria AI antes de adoptarlo en producción.
- Idiomas soportados no documentados; las instrucciones de ejemplo están en inglés y no se garantiza un rendimiento equivalente en castellano.
- No se publican benchmarks ni métricas objetivas de calidad, fidelidad o preservación de identidad, lo que impide una evaluación rigurosa previa a producción.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede introducir o eliminar elementos no solicitados, especialmente en ediciones complejas o con instrucciones ambiguas.
- Sesgos: no documentados en la información disponible; cabe esperar los sesgos propios del dataset de entrenamiento, no especificado.
- Dependencia de la infraestructura de Colab: límites de tiempo de sesión y de GPU gratuita pueden interrumpir ejecuciones largas, particularmente con la variante Dev a 50 pasos.
- El prompt enhancer añade una dependencia adicional (Qwen3-VL-8B) que consume VRAM y tiempo de descarga; su uso es opcional pero relevante para la calidad del prompt VGL.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria que respalde su funcionamiento más allá de la documentación del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/coinnoin/Bria-FIBO-2.0-in-Google-Colab
- Modelos base (Comfy-Org / FIBO 2.0): https://huggingface.co/Comfy-Org/Fibo-2.0
- Cuaderno de Google Colab: https://colab.research.google.com/drive/117UBlornKfv0xdFIoch4rqV4twFn6qYn?usp=sharing
- Cuaderno en GitHub: https://github.com/salman02-12/Bria-FIBO-2.0-in-Google-Colab/blob/main/Bria_FIBO_2_0_CoinNoin.ipynb
- Tutorial en vídeo: https://www.youtube.com/watch?v=dkorXCFwvUc
- Canal del creador: https://www.youtube.com/@CoinNoin

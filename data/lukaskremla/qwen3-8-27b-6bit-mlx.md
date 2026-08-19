# lukaskremla/Qwen3.8-27B-6bit-MLX

## Resumen

El modelo `lukaskremla/Qwen3.8-27B-6bit-MLX` es una conversión completa al formato MLX (Apple Silicon) del modelo multimodal Qwen3.8-27B de Qwen, cuantizado a 6 bits. A diferencia de las conversiones de solo texto, este repositorio conserva la torre de visión original y los procesadores de imagen y vídeo, lo que permite procesar entradas de texto, imagen y vídeo mediante la librería `mlx-vlm`. El autor, lukaskremla, ha aplicado una cuantización affine de 6 bits con grupo de tamaño 64 y redondeo al más cercano (RTN) sobre los pesos lineales del modelo de lenguaje, manteniendo la torre de visión y el resto de tensores en BF16. Esta conversión está pensada para entornos Apple Silicon y ofrece compatibilidad con servidores OpenAI-compatible y decodificación especulativa mediante un drafter MTP opcional.

El modelo se distribuye bajo licencia Apache 2.0 y está orientado a tareas de visión-lenguaje, razonamiento, uso de herramientas y conversación multimodal. Aunque el nombre sugiere 27B de parámetros, el recuento real según los safetensors es de aproximadamente 6,35 mil millones de parámetros, lo que indica que se trata de una versión reducida o el dato corresponde a la cuantización. El repositorio ocupa 22,8 GB e incluye los pesos en formato safetensors, listos para usar con `mlx-vlm` 0.6.13 o superior. Es relevante para desarrolladores que buscan desplegar modelos multimodales en hardware Apple con un equilibrio entre consumo de memoria y fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.8-27B) con torre de visión en BF16 |
| Parametros totales | 6.346.296.560 (segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 6-bit affine (group size 64, RTN) para pesos lineales del LM; torre de visión y otros tensores en BF16 |
| Idiomas soportados | Ingles (declarado en la model card); el modelo base Qwen3.8-27B es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión cuantizada del Qwen3.8-27B original, un modelo de lenguaje multimodal de la familia Qwen que combina un transformer para texto con una torre de visión (vision tower) para procesar imágenes y vídeo. En esta conversión MLX, los pesos lineales del modelo de lenguaje se cuantizan a 6 bits mediante cuantización affine con grupo de tamaño 64 y redondeo al más cercano (RTN), mientras que la torre de visión y los tensores no cuantizados se mantienen en BF16 para preservar la calidad perceptual. La conversión se realizó con `mlx-vlm 0.6.13` y `mlx 0.32.0`, e incluye los archivos de procesamiento de imagen y vídeo necesarios para la entrada multimodal.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO, etc.). El autor solo indica que se trata de una cuantización del modelo original, sin modificaciones en los pesos más allá de la reducción de precisión. El drafter MTP (Multi-Token Prediction) no está incluido en el checkpoint principal, pero está disponible como sidecar en la colección asociada, lo que permite decodificación especulativa para acelerar la inferencia.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa entradas de texto, imagen y vídeo, respondiendo con texto coherente y contextualizado.
- Conversacion multi-turno: diseñado para tareas conversacionales, manteniendo el contexto de la interacción.
- Razonamiento y uso de herramientas (tool calling): soporta integración con herramientas externas para tareas que requieren ejecución de funciones.
- Soporte de agentes y razonamiento multi-paso: puede encadenar pasos de razonamiento para resolver problemas complejos.
- Capacidades multilingues: aunque la model card declara solo inglés, el modelo base Qwen3.8-27B es multilingue, por lo que es probable que herede esa capacidad (no confirmado en esta conversión).
- Procesamiento de vídeo: admite entradas de vídeo además de imágenes estáticas, gracias a la torre de visión conservada.
- Decodificacion especulativa: compatible con un drafter MTP externo para mejorar la velocidad de generación.

## Casos de uso

- Analisis de imagenes medicas: el modelo puede recibir radiografías o escáneres y generar descripciones o sugerencias preliminares, aprovechando su capacidad de visión-lenguaje y razonamiento.
- Moderacion de contenido visual: clasificar imágenes o vídeos en categorías (violencia, desnudos, etc.) mediante prompts en lenguaje natural, con la ventaja de ejecutarse en hardware Apple sin necesidad de GPU dedicada.
- Asistente de accesibilidad: describir escenas de vídeo en tiempo real para personas con discapacidad visual, usando la entrada de vídeo y generación de texto descriptivo.
- Automatizacion de soporte tecnico con capturas de pantalla: el usuario envía una captura de error y el modelo razona sobre el problema y sugiere soluciones, gracias a su capacidad de tool calling para consultar documentación.
- Generacion de codigo a partir de diagramas: interpretar imágenes de diagramas de flujo o esquemas y generar código correspondiente, combinando visión y generación de texto.
- Creacion de contenido educativo: generar explicaciones paso a paso a partir de imágenes o vídeos de experimentos, útil para plataformas de e-learning.
- Despliegue local en Mac: al ser una conversión MLX, puede ejecutarse en Mac con Apple Silicon para prototipado rápido de aplicaciones multimodales sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 22,8 GB, por lo que se recomienda al menos 24 GB de memoria unificada en Apple Silicon para cargar el modelo completo. Con cuantización de 6 bits, el modelo de lenguaje ocupa aproximadamente 4,8 GB, pero la torre de visión en BF16 y los procesadores incrementan el uso total.
- GPU recomendadas: en Apple Silicon, cualquier chip con 32 GB o más de memoria unificada (M1 Pro/Max, M2 Pro/Max, M3 Max, etc.) es adecuado. En GPUs NVIDIA no es compatible directamente con MLX, pero podría usarse a través de otras herramientas si se convierten los pesos.
- Si cabe en consumer GPU: no aplica para GPUs NVIDIA estándar, ya que MLX es específico de Apple. En Mac, sí cabe en equipos con 32 GB de RAM unificada.
- Opciones de despliegue: servidor OpenAI-compatible mediante `mlx_vlm.server`, integración con `mlx-vlm` para inferencia programática, y soporte de decodificación especulativa con drafter MTP.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración de decodificación especulativa.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información facilitada.

## Limitaciones y advertencias

- La cuantización de 6 bits puede degradar la calidad del modelo en tareas complejas en comparación con la versión BF16 completa, especialmente en razonamiento matemático o generación de código.
- El drafter MTP no está incluido en el checkpoint principal; debe descargarse por separado y su rendimiento varía según el prompt y la configuración.
- La model card declara solo inglés, aunque el modelo base es multilingüe; el rendimiento en otros idiomas no está garantizado.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa del rendimiento real en tareas estándar.
- Al ser una conversión MLX, está limitada a hardware Apple Silicon; no es utilizable directamente en GPUs NVIDIA o AMD sin conversión adicional.
- El número de parámetros (6,35B) difiere del nombre del modelo (27B), lo que sugiere que podría tratarse de una versión reducida o un error en el recuento; se recomienda verificar antes de usar en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lukaskremla/Qwen3.8-27B-6bit-MLX
- Colección Qwen 3.8 27B MLX-Quants (incluye drafter MTP): https://huggingface.co/collections/lukaskremla/qwen-38-27b-mlx-quants-vision-text-only-and-mtp-6a7f4a32aee1afa13a6a4661

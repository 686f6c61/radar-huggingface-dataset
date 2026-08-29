# shenxing600/Qwen-Edit-2509-Multiple-angles

## Resumen

Qwen-Edit-2509-Multiple-angles es un adaptador LoRA desarrollado por shenxing600 (también publicado bajo la cuenta dx8152) sobre el modelo base Qwen/Qwen-Image-Edit-2509, un modelo de difusión para edición de imágenes. Este LoRA está diseñado para ampliar las capacidades del modelo base permitiendo un control fino del movimiento y la orientación de la cámara en las imágenes editadas: desplazamientos laterales, rotaciones, cambios de ángulo (cenital, contrapicado), y transiciones entre objetivos gran angular y primeros planos. El adaptador se distribuye bajo licencia Apache 2.0 y está pensado para usarse con la librería diffusers.

El modelo se entrenó sin necesidad de escribir código utilizando la infraestructura de ModelScope, y se publicó inicialmente en agosto de 2026 (aunque la model card indica una actualización en noviembre de 2025, lo que sugiere una posible discrepancia en las fechas). Según el autor, el LoRA mejora significativamente la inteligencia y la coherencia del modelo base en tareas de control de cámara, aunque se ha reportado un problema de consistencia que fue abordado en una versión posterior con más iteraciones de entrenamiento. Para su uso, se requiere además el LoRA complementario Qwen-Image-Lightning, que acelera el proceso de generación.

El repositorio tiene un tamaño de 0.2 GB y no se proporcionan métricas de rendimiento ni especificaciones detalladas del adaptador. Es una herramienta especializada para creadores de contenido visual, storyboarders y diseñadores que necesitan variar la perspectiva de una imagen manteniendo el contenido semántico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen-Image-Edit-2509 (modelo de difusión para edición de imágenes) |
| Parametros totales | no disponible (el adaptador; el modelo base no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés y chino, pero no se declara oficialmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (presumiblemente safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se añade al modelo base Qwen-Image-Edit-2509, un modelo de difusión de última generación para tareas de edición de imágenes. El LoRA se entrenó sin código utilizando la plataforma ModelScope, según indica el autor en la model card. No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens o el método de optimización (RLHF, DPO, etc.). El autor menciona que se realizó una actualización con más iteraciones de entrenamiento para corregir problemas de consistencia, lo que sugiere un proceso de fine-tuning iterativo.

La innovación principal de este adaptador reside en su capacidad para interpretar instrucciones de movimiento de cámara en lenguaje natural (por ejemplo, "mover la cámara hacia adelante", "rotar 45 grados a la izquierda") y aplicarlas a la imagen de entrada, generando una nueva imagen con la perspectiva modificada. No se conocen detalles técnicos adicionales sobre la arquitectura interna del LoRA (rango, target modules, etc.).

## Capacidades

- Control de movimiento de cámara en edición de imágenes: permite desplazar la cámara hacia adelante, atrás, izquierda, derecha, arriba y abajo.
- Rotación de cámara: soporta rotaciones de 45 grados a izquierda o derecha, así como cambios a vista cenital (top-down).
- Cambio de lente: permite alternar entre gran angular y primer plano (close-up).
- Edición de imágenes con instrucciones en lenguaje natural, sin necesidad de trigger words.
- Compatibilidad con el modelo base Qwen-Image-Edit-2509, que ya posee capacidades de edición generales; el LoRA las amplía específicamente para control de perspectiva.
- Requiere el LoRA complementario Qwen-Image-Lightning para funcionar correctamente (acelera la generación).

## Casos de uso

- Creación de storyboards para cine y animación: un director puede generar múltiples ángulos de una misma escena (plano general, primer plano, cenital) simplemente describiendo el movimiento de cámara, lo que agiliza la previsualización.
- Diseño de producto y presentaciones: al editar una fotografía de un objeto, se pueden obtener variaciones de ángulo (rotación, vista superior) para mostrar el producto desde distintas perspectivas en catálogos o webs.
- Generación de contenido para redes sociales: los creadores pueden transformar una imagen existente en varias versiones con encuadres diferentes (gran angular, close-up) sin necesidad de volver a fotografiar.
- Postproducción fotográfica: ajustar la composición de una imagen cambiando el punto de vista simulado, útil para corregir encuadres o añadir dinamismo.
- Desarrollo de juegos y entornos virtuales: generar texturas o concept art con diferentes ángulos de cámara a partir de una única ilustración base.
- Automatización de flujos de diseño: integrar el LoRA en pipelines de generación de imágenes (por ejemplo, con ComfyUI o difusores) para producir variaciones de perspectiva de forma masiva, siempre que se disponga del LoRA Lightning adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas cuantitativas (PSNR, FID, etc.) ni comparaciones con otros métodos. La única evaluación mencionada es una comparación visual entre el modelo base y el LoRA, donde se afirma que el adaptador mejora la inteligencia y la coherencia, pero sin datos numéricos.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la documentación del modelo.
- Al ser un LoRA sobre Qwen-Image-Edit-2509, los requisitos dependen del modelo base, que es un modelo de difusión de gran tamaño. Se estima que se necesita al menos una GPU con 16 GB de VRAM para ejecutar el modelo base en FP16, aunque no hay confirmación oficial.
- El adaptador en sí es ligero (0.2 GB), por lo que el consumo adicional de memoria es mínimo.
- Opciones de despliegue: al ser un modelo de diffusers, se puede utilizar con la librería `diffusers` de Hugging Face, así como con herramientas compatibles como ComfyUI (se menciona un workflow en Civitai). También se puede usar a través de la API de Hugging Face InferenceClient, como se muestra en el ejemplo de la model card.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. El autor no menciona alternativas ni se han encontrado referencias a otros LoRA de control de cámara para Qwen-Image-Edit-2509. Se podría comparar con el propio modelo base sin el LoRA, pero no hay datos cuantitativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El autor reportó un problema de consistencia inestable en la primera versión, que fue abordado con una actualización con más iteraciones. Aun así, puede haber casos en los que la coherencia entre la imagen original y la editada no sea perfecta.
- El modelo requiere obligatoriamente el LoRA complementario Qwen-Image-Lightning (de lightx2v) para funcionar correctamente. Sin él, el comportamiento puede ser impredecible.
- No se proporcionan garantías sobre el rendimiento en producción; el autor recomienda probar antes de usar comercialmente.
- La licencia Apache 2.0 permite uso comercial, pero el autor solicita una donación voluntaria (PayPal) si se utiliza con fines empresariales.
- No hay información sobre sesgos o alucinaciones específicas, pero al ser un modelo de edición de imágenes, puede generar artefactos o distorsiones en regiones complejas.
- El modelo está pensado para prompts en inglés y chino (según los ejemplos), pero no se declara oficialmente el soporte multilingüe.

## Enlaces

- Repositorio HuggingFace (shenxing600): https://huggingface.co/shenxing600/Qwen-Edit-2509-Multiple-angles
- Repositorio HuggingFace (dx8152, cuenta alternativa): https://huggingface.co/dx8152/Qwen-Edit-2509-Multiple-angles
- ModelScope: https://www.modelscope.cn/models/dx8152/Qwen-Edit-2509-Multiple-angles
- Civitai (workflow de storyboard): https://civitai.com/models/2096307/qwen-edit2509-multi-angle-storyboard-direct-output
- SeaArt AI: https://www.seaart.ai/models/detail/d42naute878c73eq3jq0
- LoRA complementario Qwen-Image-Lightning: https://huggingface.co/lightx2v/Qwen-Image-Lightning/tree/main
- Vídeo guía en YouTube: https://youtu.be/UGdW8W1MqW8
- Vídeo guía en Bilibili: https://www.bilibili.com/video/BV1oi1gBBEZV/
- Comunidad Discord: https://discord.gg/yVAVa43mWk

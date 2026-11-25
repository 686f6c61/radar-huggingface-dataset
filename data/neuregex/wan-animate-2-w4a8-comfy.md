# neuregex/Wan-Animate-2-w4a8-comfy

## Resumen

Wan-Animate-2-w4a8-comfy es una versión cuantizada a 4 bits del modelo Wan-Animate-2 en su variante destilada, publicada por el usuario neuregex. Se trata de una conversión de los pesos bf16 originales (32,8 GB) al formato propietario de ComfyUI `asym_w4a8_int8`, reduciendo el peso del archivo a 9,6 GB, un 29 % del original. El modelo base es Comfy-Org/Wan-Animate-2, un modelo de image-to-video especializado en transferencia de movimiento: anima una imagen de personaje siguiendo el movimiento de un vídeo de referencia.

La relevancia de esta ficha es práctica: permite ejecutar un modelo de animación de vídeo de gran tamaño en GPUs de 24 GB de VRAM, algo imposible con los pesos bf16 o int8 originales, que agotan la memoria incluso en tarjetas de 16 GB. No se trata de un modelo nuevo, sino de un artefacto de despliegue para ComfyUI.

No se dispone de información sobre la arquitectura interna del modelo base, el número de parámetros ni la longitud de contexto; la model card del autor se limita a documentar el proceso de cuantización y los requisitos de memoria medidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de difusión para image-to-video) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | w4a8 (`asym_w4a8_int8`): códigos de 4 bits con codebook Lloyd-Max, escalas fp8 E4M3 cada 16 pesos, escala fp32 por fila de salida, rotación Hadamard en grupos de 256 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (ComfyUI `asym_w4a8_int8`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Wan-Animate-2 ni sobre sus datos de entrenamiento, número de tokens o proceso de alineación. La model card del artefacto cuantizado no describe la red subyacente.

Lo que sí está documentado es el proceso de cuantización. Se aplicó el formato `asym_w4a8_int8` descrito en el QUANTIZATION.md de ComfyUI mediante la librería Comfy Kitchen 0.2.39. Se cuantizaron únicamente las 480 capas que el archivo oficial int8 (`wan_animate_2_distill_int8_convrot.safetensors`) ya cuantizaba; el resto de tensores permanecen en bf16 original. El error relativo de pesos por capa tras el ciclo completo de cuantización y desquantización es ‖W − Ŵ‖ / ‖W‖ con media 0,073 y máximo 0,073. El autor verificó el resultado con una transferencia de movimiento (foto de personaje animada con un clip de una persona caminando) en una NVIDIA L40S, obteniendo un clip coherente, aunque sin comparación lado a lado con el archivo original.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) con transferencia de movimiento: anima un personaje estático siguiendo el movimiento de un vídeo de referencia.
- Carga nativa en ComfyUI mediante el nodo `UNETLoader` (Load Diffusion Model), sin nodos personalizados.
- Compatible con los flujos de trabajo estándar de ComfyUI para vídeo.
- Ejecución con kernels int8 en GPUs RTX 30 series y posteriores; en tarjetas anteriores se desquantiza cada capa antes de multiplicar (mismo consumo de memoria, más lento).
- No se documentan capacidades de texto, razonamiento, código, tool calling, agentes ni multilingüismo; el modelo es exclusivamente de generación de vídeo.

## Casos de uso

- Animación de retratos para contenido de redes sociales: a partir de una foto fija y un clip de referencia de un movimiento concreto (caminar, saludar, bailar), se genera un vídeo del personaje realizando ese movimiento, con la ventaja de caber en una GPU de 24 GB.
- Previsualización de animaciones en estudio: iterar sobre movimientos de personajes antes de un render final de mayor calidad, usando la versión w4a8 para pruebas rápidas en estaciones de trabajo con RTX 4090 o A10.
- Prototipado de pipelines de vídeo generativo en ComfyUI: al cargarse con los nodos estándar, se integra en grafos existentes de ComfyUI sin necesidad de instalar extensiones, lo que simplifica la experimentación.
- Creación de avatares animados para formación o presentaciones: animar una imagen corporativa con un movimiento de referencia pregrabado para generar material de e-learning.
- Investigación sobre cuantización de modelos de difusión de vídeo: el artefacto sirve como referencia reproducible para estudiar el impacto del formato `asym_w4a8_int8` en la calidad de la transferencia de movimiento.
- Despliegue en entornos con VRAM limitada: cuando el presupuesto de memoria es de 24 GB y no se puede optar por los pesos bf16 (32,8 GB) ni int8 (16,6 GB, que tampoco cabe según las mediciones del autor), esta es la única variante que ejecuta el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento medido es el tiempo de inferencia en una NVIDIA L40S: 145 segundos para una transferencia de movimiento con 25 GB de RAM del proceso ComfyUI, ejecutándose correctamente en una configuración de 24 GB de VRAM. No hay métricas de calidad (FVD, SSIM, etc.) ni comparación cuantitativa con el modelo original.

## Requisitos de hardware

- VRAM: 24 GB es el mínimo práctico según las mediciones del autor. Con 16 GB, 12 GB u 8 GB el modelo se queda sin memoria (out of memory) tanto con los archivos originales como con esta versión cuantizada.
- GPU recomendadas: NVIDIA L40S (medición oficial), RTX 4090 (24 GB), A10G (24 GB), RTX 3090 (24 GB). Las RTX 30 series y posteriores usan kernels int8; tarjetas anteriores desquantizan por capa y son más lentas.
- RAM del sistema: 25 GB usados por el proceso ComfyUI durante la ejecución en el caso medido de 24 GB de VRAM.
- Despliegue: exclusivamente ComfyUI, versión del 19 de octubre de 2026 o posterior (probado en el commit `e3bee7f`, después de la 0.42.0). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 145 s por clip en L40S; en tarjetas más pequeñas será mayor, sin cifras publicadas.
- Almacenamiento: 9,6 GB para el archivo safetensors, frente a 32,8 GB del bf16 y 16,6 GB del int8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | VRAM mínima | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Wan-Animate-2-w4a8-comfy | no disponible | no disponible | safetensors w4a8 (9,6 GB) | 24 GB | Apache 2.0 | Hugging Face |
| Comfy-Org/Wan-Animate-2 (bf16) | no disponible | no disponible | safetensors bf16 (32,8 GB) | > 24 GB (no cabe en 24 GB según el autor) | Apache 2.0 | Hugging Face |
| Comfy-Org/Wan-Animate-2 (int8_convrot) | no disponible | no disponible | safetensors int8 (16,6 GB) | > 24 GB (no cabe en 24 GB según el autor) | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros modelos de image-to-video comparables (por ejemplo, variantes de la familia Wan estándar) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo solo genera vídeo a partir de imagen; no es un modelo de lenguaje ni admite texto, código o razonamiento.
- No cabe en GPUs de consumo de 16 GB o menos: las pruebas del autor dan out of memory en 16, 12 y 8 GB, tanto con los originales como con esta versión.
- La cuantización introduce un error relativo de pesos de 0,073 por capa; el autor no ha comparado la calidad visual lado a lado con el archivo bf16, por lo que el impacto en la fidelidad del movimiento no está cuantificado.
- Requiere una versión muy reciente de ComfyUI (posterior a la 0.42.0); versiones anteriores no cargarán el formato `asym_w4a8_int8`.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 24 de noviembre de 2026: es un artefacto reciente y sin validación comunitaria.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base.
- Licencia Apache 2.0, que permite uso comercial; el autor indica que los pesos fueron modificados únicamente por la cuantización.
- El rendimiento medido (145 s) corresponde a una L40S; en GPUs de 24 GB de gama consumer el tiempo será sustancialmente mayor, sin datos publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neuregex/Wan-Animate-2-w4a8-comfy
- Modelo base: https://huggingface.co/Comfy-Org/Wan-Animate-2
- Documentación de cuantización de ComfyUI (QUANTIZATION.md): no disponible como enlace directo en la información proporcionada
- Librería Comfy Kitchen: no disponible como enlace directo en la información proporcionada
- Discord de la comunidad: https://discord.gg/HxfP9TnctJ

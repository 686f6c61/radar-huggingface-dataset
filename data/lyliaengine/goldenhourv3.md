# LyliaEngine/GoldenHourv3

## Resumen

GoldenHourv3 es un LoRA de texto a imagen publicado por LyliaEngine sobre el modelo base OnomaAIResearch/Illustrious-xl-early-release-v0, un checkpoint de la familia Illustrious XL (SDXL). El adaptador está diseñado para producir retratos y escenas de personaje con una estética estilizada de luz cálida: iluminación cinematográfica, contraluz, rim light, bokeh y tonos de hora dorada, con un equilibrio entre semirrealismo e ilustración. Se distribuye en formato diffusers y se carga como adaptador LoRA sobre el checkpoint base, no como modelo autónomo.

El modelo resuelve un problema acotado: dar a un pipeline SDXL/Illustrious una dirección estética consistente sin necesidad de encadenar prompts largos de iluminación. La model card describe explícitamente su especialización en rostros delicados, ojos expresivos, textura de piel dimensional y detalle en pelo y piel, así como su buen comportamiento en escenas retroiluminadas y con luz ambiental cálida.

La relevancia es limitada y de nicho: es un LoRA de estilo para ilustración de personajes, con cero descargas y cero likes en el momento de la consulta, licencia CDLA-Permissive-2.0 y sin datos publicados de benchmarks, tamaño de dataset de entrenamiento ni parámetros de entrenamiento. La información disponible procede casi exclusivamente de la model card del autor y de los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un transformer de difusión SDXL (Illustrious XL) |
| Parámetros totales | no disponible (el LoRA se carga sobre el checkpoint base; no se publica el rango ni el número de parámetros del adaptador) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen; resolución nativa del base SDXL, 1024x1024) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en precisión de entrenamiento; el base admite fp16, fp32 y cuantizaciones de la comunidad) |
| Idiomas soportados | no disponible (los prompts de la model card están en inglés) |
| Licencia | CDLA-Permissive-2.0 |
| Formato de pesos | safetensors (formato diffusers, según la librería declarada) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre OnomaAIResearch/Illustrious-xl-early-release-v0, un checkpoint SDXL orientado a ilustración y anime. La arquitectura subyacente es, por tanto, un UNet de difusión con codificador de texto CLIP, y el LoRA inyecta matrices de bajo rango en las capas de atención y proyección del UNet para desplazar la distribución de salida hacia la estética "golden hour". No se publica el rango del LoRA, el número de pasos de entrenamiento, el tamaño del dataset, la composición de las imágenes de entrenamiento ni si se aplicaron técnicas como regularización por clase o captions automáticos.

Tampoco se documenta ningún proceso de RLHF, DPO o ajuste por preferencias, algo esperable en un adaptador de estilo. La única información operativa que aporta el autor son los ajustes de inferencia recomendados: sampler DPM++ 2M, scheduler Karras, 30 pasos, CFG 5, Hi-Res Fix activado en todas las imágenes y uso de Adetailer si es necesario. El prompt de activación declarado es `None`, es decir, no hay palabra clave específica de activación.

## Capacidades

- Generación de imágenes de texto a imagen condicionada por prompt, heredando las capacidades del checkpoint Illustrious XL.
- Estilización fotográfica y semirrealista: iluminación cinematográfica, contraluz, rim light, bokeh y luz ambiental cálida.
- Retrato y personaje: rostros delicados, ojos con brillo sutil, textura de piel dimensional y detalle fino en pelo.
- Escenas con profundidad de campo y desenfoque de fondo, con énfasis en la separación figura-fondo.
- Composición de planos variados (wide shot, cowboy shot, ángulos holandeses y contrapicados) según los prompts de ejemplo de la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: es un modelo puramente generativo de imagen.
- Capacidades multilingües: no documentadas; los ejemplos de la model card están en inglés y no se confirma el comportamiento con prompts en castellano.

## Casos de uso

- Ilustración de personajes para ficción y narrativa visual: el LoRA mantiene una estética coherente de luz cálida y retrato semirrealista entre imágenes de una misma serie, lo que reduce el trabajo de armonización posterior en un pipeline de ilustración.
- Concept art de escenarios con hora dorada: escenas retroiluminadas, atardeceres y ambientes cálidos se generan con menos iteraciones de prompt gracias a la especialización del adaptador en ese tipo de iluminación.
- Retratos para avatares y perfiles: la model card destaca el detalle en ojos, piel y pelo, adecuado para retratos de busto y medio cuerpo con fondo desenfocado.
- Previsualización rápida de personajes en producción de videojuego o animación: con 30 pasos, CFG 5 y Hi-Res Fix se obtienen imágenes de referencia en una sola GPU consumer para validar dirección de arte antes de encargar arte final.
- Generación de material promocional estilizado: carteles, portadas y banners con estética cinematográfica, usando el prompt de activación nulo y los ajustes recomendados por el autor.
- Exploración estilística en investigación de difusión: útil como caso de estudio de adaptadores LoRA de estilo sobre SDXL/Illustrious, comparando el efecto del adaptador frente al checkpoint base con los mismos prompts y semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, preferencia humana) ni comparaciones cuantitativas con otros LoRA o checkpoints.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa muy poco espacio en disco y en VRAM; el coste real lo determina el checkpoint base Illustrious XL, un SDXL de aproximadamente 2.600 millones de parámetros en el UNet más los codificadores de texto.
- VRAM estimada para inferencia del base en fp16: en torno a 8-10 GB con optimizaciones; en fp32, aproximadamente 16 GB o más.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para inferencia cómoda a 1024x1024; RTX 3060 12 GB o RTX 4070 pueden funcionar con atención optimizada y offloading.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más aplicando fp16, VAE en fp16 y, si es necesario, offloading secuencial.
- Opciones de despliegue: diffusers (librería declarada), ComfyUI y Automatic1111/Forge mediante carga de LoRA sobre el checkpoint base; también es posible exportar a otros runners compatibles con SDXL.
- Latencia y throughput: no disponibles. Los ajustes recomendados (30 pasos, DPM++ 2M Karras, CFG 5, Hi-Res Fix) implican un coste de inferencia superior al de una generación simple por el paso adicional de upscaling.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GoldenHourv3 | LoRA de estilo | Illustrious-xl-early-release-v0 | 1024x1024 (SDXL) | CDLA-Permissive-2.0 | Hugging Face, 0 descargas |
| OnomaAIResearch/Illustrious-xl-early-release-v0 | Checkpoint SDXL | SDXL | 1024x1024 | no disponible en la información | Hugging Face (modelo base) |
| SDXL 1.0 (Stability AI) | Checkpoint base | SDXL | 1024x1024 | CreativeML Open RAIL++-M | Hugging Face, ampliamente usado |
| LoRA de estilo genérico sobre SDXL | Adaptador | SDXL | 1024x1024 | variable según autor | Hugging Face / Civitai |

No se dispone de datos de rendimiento comparado para GoldenHourv3; la comparación se limita a tipo de modelo, base, resolución y licencia.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el checkpoint base Illustrious-xl-early-release-v0; sin él, el adaptador no genera imágenes.
- Sesgos conocidos: no documentados por el autor; al heredar el checkpoint base y los prompts de ejemplo, es previsible que reproduzca los sesgos estilísticos y de representación de Illustrious XL.
- Riesgo de alucinación visual: anatomía incorrecta en manos y dedos, artefactos y proporciones deformadas, como evidencia la extensa lista de prompts negativos de la model card.
- Limitaciones de idioma: no se confirma soporte de prompts en castellano; los ejemplos y ajustes están en inglés.
- Restricciones de licencia: CDLA-Permissive-2.0 permite uso comercial del adaptador, pero el uso del checkpoint base puede estar sujeto a condiciones adicionales no detalladas en la información disponible; conviene verificar la licencia de Illustrious XL antes de producción.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de calidad ni de reproducibilidad.
- Sin datos de entrenamiento publicados: no se puede auditar el dataset, el rango del LoRA ni el proceso de captions, lo que dificulta evaluar originalidad y riesgo de sobreajuste.
- El prompt de activación declarado es `None`, lo que puede confundir en pipelines que esperan una palabra clave; el efecto estilístico se aplica de forma global.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LyliaEngine/GoldenHourv3
- Archivos del modelo: https://huggingface.co/LyliaEngine/GoldenHourv3/tree/main
- Modelo base: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Licencia CDLA-Permissive-2.0: https://cdla.dev/permissive-2-0/

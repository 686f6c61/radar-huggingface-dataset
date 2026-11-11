# prithivMLmods/Qwen3-VL-32B-Uncensored-ComfyUI

## Resumen

Qwen3-VL-32B-Uncensored-ComfyUI es una distribucion de pesos derivada de Qwen/Qwen3-VL-32B-Instruct, publicada por el usuario prithivMLmods. No se trata de un modelo entrenado desde cero, sino de un empaquetado de checkpoints ya existentes (una version "abliterated"/"uncensored" en FP8 y otra en NVFP4 W4A16) consolidados en archivos safetensors unicos para su uso como text encoders dentro de ComfyUI. El autor indica que los tensores se copian byte a byte desde los checkpoints fragmentados de origen, sin dequantizacion ni re-quantizacion.

El modelo hereda la arquitectura multimodal de Qwen3-VL-32B-Instruct: un transformer de 32 mil millones de parametros con capacidad image-text-to-text, orientado a tareas de vision-lenguaje, generacion de texto y razonamiento. La variante "uncensored" implica que se ha aplicado una tecnica de abliteration sobre el modelo base para reducir los rechazos ante peticiones que el modelo original declinaria.

Su relevancia es acotada y practica: sirve para integrar un encoder de texto de Qwen3-VL de 32B en flujos de ComfyUI con pesos ya consolidados y en formatos de baja precision (FP8 y NVFP4), evitando al usuario tener que fusionar shards manualmente. Es un artefacto de conveniencia para despliegue local, no una contribucion de investigacion ni un modelo con benchmarks propios publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3-VL |
| Parametros totales | 32 mil millones (heredados de Qwen3-VL-32B-Instruct) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 y NVFP4 (W4A16) en los archivos distribuidos |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (archivo unico por variante) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `qwen3_vl` y su naturaleza image-text-to-text. Al derivar de Qwen/Qwen3-VL-32B-Instruct, se asume la arquitectura del modelo base de Qwen, pero esta ficha no dispone de datos concretos sobre numero de capas, mecanismo de atencion, dimensiones ocultas ni composicion del dataset de entrenamiento original.

Respecto al proceso de creacion de esta publicacion: el autor declara que los archivos son fusiones de checkpoints fragmentados con copia byte a byte de tensores, sin dequantizacion ni re-quantizacion. La variante "uncensored" procede de un checkpoint "abliterated" (pekkAi/Qwen3-VL-32B-Instruct-abliterated-NVFP4-W4A16) y de una variante "Unredacted-MAX-FP8". No se documentan tokens de entrenamiento, uso de RLHF/DPO ni innovaciones tecnicas propias en la model card.

## Capacidades

- Generacion de texto y conversacion multimodal image-text-to-text, heredadas de Qwen3-VL-32B-Instruct.
- Procesamiento de imagenes junto con texto de entrada (pipeline image-text-to-text).
- Comportamiento "uncensored"/abliterated: menor tasa de rechazos ante peticiones que el modelo base declinaria.
- Uso como text encoder dentro de ComfyUI (ruta `ComfyUI/models/text_encoders/`).
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y con text-generation-inference segun los tags.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada para esta variante concreta.

## Casos de uso

- Integracion en ComfyUI como text encoder: colocar el archivo safetensors en `ComfyUI/models/text_encoders/` permite usar el modelo en flujos de generacion multimodal dentro de ComfyUI sin fusionar shards manualmente.
- Despliegue en precision reducida: la variante NVFP4 W4A16 reduce el peso en memoria frente a FP16, util para servir el modelo en GPUs con VRAM limitada manteniendo el encoder de texto operativo.
- Prototipado de pipelines vision-lenguaje: al ser image-text-to-text, sirve para experimentar con descripcion de imagenes y respuesta a preguntas visuales en entornos de investigacion local.
- Evaluacion de modelos abliterated: util para estudiar como la abliteration afecta al comportamiento de rechazo y a la calidad de respuesta frente al modelo base Instruct.
- Flujos creativos sin filtros estrictos: escenarios de generacion asistida donde el modelo base rechazaria peticiones, con la advertencia de los riesgos asociados.
- Experimentacion con cuantizacion FP8 vs NVFP4: permite comparar ambas variantes sobre el mismo modelo base en terminos de calidad y consumo de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo de 32B en FP8 requiere del orden de 32 GB solo para pesos; la variante NVFP4 W4A16 reduce sustancialmente ese requisito, aunque no se aportan cifras oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; un modelo de 32B en FP8 excede la VRAM de la mayoria de GPUs de consumo actuales, mientras que NVFP4 podria acercarse a modelos de gama alta, sin datos oficiales.
- Opciones de despliegue: ComfyUI (text encoders), transformers, text-generation-inference (segun tags).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-VL-32B-Uncensored-ComfyUI | 32B | no disponible | apache-2.0 | Derivado abliterated, empaquetado para ComfyUI |
| Qwen/Qwen3-VL-32B-Instruct | 32B | no disponible | no disponible en esta ficha | Modelo base original, con filtros de seguridad |
| pekkAi/Qwen3-VL-32B-Instruct-abliterated-NVFP4-W4A16 | 32B | no disponible | no disponible en esta ficha | Checkpoint de origen de la variante NVFP4 |
| prithivMLmods/Qwen3-VL-32B-Instruct-Unredacted-MAX-FP8 | 32B | no disponible | no disponible en esta ficha | Checkpoint de origen de la variante FP8 |

## Limitaciones y advertencias

- Modelo abliterated/uncensored: la reduccion de rechazos implica mayor riesgo de generar contenido inapropiado, danino o no alineado con politicas de seguridad; no apto para produccion sin moderacion externa.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no se documentan evaluaciones especificas de fidelidad.
- Idiomas: la model card solo declara ingles (`en`); el rendimiento multilingue no esta garantizado ni documentado.
- Longitud de contexto: no disponible; no debe asumirse ninguna ventana concreta.
- Licencia apache-2.0 sobre el empaquetado, pero conviene verificar las condiciones del modelo base Qwen y de los checkpoints de origen antes de uso comercial.
- Artefacto de conveniencia: no aporta mejoras de rendimiento ni benchmarks propios; su calidad depende enteramente de los checkpoints de origen.
- Sin datos de benchmarks, latencia ni requisitos oficiales de hardware: cualquier cifra de despliegue debe validarse empiricamente.

## Enlaces

- Hugging Face: https://huggingface.co/prithivMLmods/Qwen3-VL-32B-Uncensored-ComfyUI
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Checkpoint de origen FP8: https://huggingface.co/prithivMLmods/Qwen3-VL-32B-Instruct-Unredacted-MAX-FP8
- Checkpoint de origen NVFP4: https://huggingface.co/pekkAi/Qwen3-VL-32B-Instruct-abliterated-NVFP4-W4A16

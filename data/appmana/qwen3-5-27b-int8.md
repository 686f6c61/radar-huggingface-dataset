# appmana/Qwen3.5-27B-int8

## Resumen

`appmana/Qwen3.5-27B-int8` es una conversión de formato del modelo Qwen3.5-27B de Alibaba Qwen, cuantizado a int8 mediante la técnica ConvRot y empaquetado como text encoder para ComfyUI. No se trata de un modelo nuevo ni de un fine-tune: es un derivado cuantizado del checkpoint original de Qwen, publicado por el usuario appmana con licencia Apache-2.0, y pensado específicamente para integrarse en flujos de generación de imagen/vídeo dentro de ComfyUI, en el mismo layout que los text encoders Qwen3.5 de menor tamaño distribuidos por Comfy-Org.

El modelo base, Qwen3.5-27B, es un transformer denso de 27 mil millones de parámetros desarrollado por Alibaba Qwen. Esta versión int8 reduce el peso del repositorio a 27,9 GB en un único fichero safetensors (`text_encoders/qwen3.5_27b_int8_convrot.safetensors`), lo que permite cargarlo como codificador de texto en pipelines de difusión que requieren un encoder de gran capacidad y contexto largo.

Su relevancia es doble: por un lado, sirve como text encoder del modelo MAGI-2 Preview de SandAI (cuyos shards `text_encoder` son idénticos byte a byte a la release de Qwen); por otro, demuestra un flujo de conversión reproducible mediante el script `scripts/convert_magi2.py` del fork de ComfyUI instalable vía pip/uv mantenido por hiddenswitch. La información pública disponible es escasa: se limita a la model card del autor y a los metadatos de Hugging Face, sin benchmarks ni detalles de entrenamiento propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-27B); no disponible el detalle exacto de capas/cabezas en la información proporcionada |
| Parámetros totales | 27B (según el nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 ConvRot (único formato publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fichero único `text_encoders/qwen3.5_27b_int8_convrot.safetensors`, 27,9 GB) |

## Arquitectura y entrenamiento

Este repositorio no entrena ningún modelo: es una conversión de formato y una cuantización del checkpoint Qwen/Qwen3.5-27B. La arquitectura subyacente es la del transformer denso de Qwen3.5-27B, cuyos detalles completos (número de capas, dimensiones ocultas, mecanismo de atención, datos de entrenamiento y fases de alineación como RLHF o DPO) no se recogen en la información disponible y deben consultarse en la model card del modelo base.

La innovación técnica de esta publicación es el pipeline de conversión: el script `scripts/convert_magi2.py` del fork de ComfyUI de hiddenswitch carga checkpoints shardeados a través del fichero `.index.json` y produce un fichero int8 ConvRot que cuantiza exactamente el mismo conjunto de capas que el `qwen3.5_9b_int8_convrot.safetensors` de Comfy-Org. El repositorio incluye un fichero `SHA256SUMS` con el hash de cada fichero para verificación de integridad. La cuantización ConvRot es un esquema de cuantización int8 orientado a pesos de text encoders en ComfyUI; no se detallan en la información disponible sus parámetros internos (tamaño de grupo, calibración, etc.).

## Capacidades

- Codificación de texto para pipelines de difusión en ComfyUI: actúa como text encoder en el mismo layout que los Qwen3.5 de Comfy-Org.
- Compatibilidad con MAGI-2 Preview de SandAI: los shards `text_encoder` de SandAI son idénticos byte a byte a la release de Qwen, por lo que este encoder encaja en ese pipeline.
- Generación de texto y razonamiento: heredados del modelo base Qwen3.5-27B, aunque la información disponible no detalla las capacidades específicas de esa versión.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Generación de imagen con ComfyUI: cargar el fichero `qwen3.5_27b_int8_convrot.safetensors` como text encoder en un grafo de ComfyUI para condicionar modelos de difusión con prompts de texto; el formato int8 ConvRot está pensado para encajar directamente en ese ecosistema.
- Pipeline de vídeo con MAGI-2 Preview: usar este encoder como `text_encoder` del modelo MAGI-2 de SandAI, ya que los shards originales de SandAI coinciden byte a byte con la release de Qwen y esta conversión mantiene el mismo conjunto de capas.
- Sustitución de encoders de menor tamaño: reemplazar los Qwen3.5 de 9B u otros tamaños en flujos existentes de Comfy-Org por la variante de 27B cuando se necesite mayor capacidad de representación semántica en los prompts.
- Investigación en cuantización: servir como referencia reproducible para estudiar el efecto de la cuantización int8 ConvRot sobre un text encoder de 27B, comparando con el checkpoint original en fp/bf16.
- Despliegue en entornos con VRAM limitada: el formato int8 reduce el peso a 27,9 GB frente a los aproximadamente 54 GB que ocuparía el mismo modelo en bf16, lo que facilita su carga en GPUs de 32-48 GB.
- Verificación de integridad en producción: el fichero `SHA256SUMS` permite validar los pesos descargados antes de desplegarlos en un pipeline automatizado.
- Reproducción de conversiones: el script `convert_magi2.py` del fork de ComfyUI de hiddenswitch permite replicar el proceso para otros checkpoints shardeados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos ~28 GB solo para los pesos en int8; con overhead de activaciones y contexto, se recomienda disponer de 32 GB o más.
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB, RTX A6000 48 GB; en GPUs de 24 GB (RTX 3090/4090) no cabe el modelo completo en int8 sin técnicas de offload.
- ¿Cabe en consumer GPU?: no de forma completa en GPUs de 24 GB; sí en GPUs de 32 GB o más (por ejemplo, RTX 5090 de 32 GB) si el resto del pipeline deja margen suficiente.
- Opciones de despliegue: ComfyUI (nativo, formato previsto), y el fork de ComfyUI instalable vía pip/uv de hiddenswitch para cargar checkpoints shardeados mediante `.index.json`. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| appmana/Qwen3.5-27B-int8 | 27B | no disponible | safetensors int8 ConvRot (27,9 GB) | Apache-2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Qwen/Qwen3.5-27B (base) | 27B | no disponible | safetensors (precisión original) | Apache-2.0 | Hugging Face |
| Comfy-Org/Qwen3.5 (9B int8 ConvRot) | 9B | no disponible | safetensors int8 ConvRot | no disponible en la información proporcionada | Hugging Face |

## Limitaciones y advertencias

- Es una conversión de formato y una cuantización, no un modelo entrenado: no aporta mejoras de capacidad respecto al Qwen3.5-27B original y puede introducir degradación por la cuantización int8.
- La información pública es mínima (0 descargas y 0 likes en el momento de la consulta), por lo que no hay validación comunitaria del comportamiento del fichero.
- No se documentan sesgos, tasas de alucinación ni evaluación de calidad de la cuantización en la información disponible.
- No se especifican los idiomas soportados ni la longitud de contexto en esta ficha; deben consultarse en la model card del modelo base.
- El uso previsto es como text encoder en ComfyUI; emplearlo como modelo de chat o agente no está validado en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero al ser un derivado cuantizado conviene revisar también los términos del modelo base y de las herramientas de conversión utilizadas.
- El fichero único de 27,9 GB requiere espacio en disco y ancho de banda considerables; verificar los hashes de `SHA256SUMS` antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/appmana/Qwen3.5-27B-int8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Text encoders Qwen3.5 de Comfy-Org: https://huggingface.co/Comfy-Org/Qwen3.5
- MAGI-2 Preview int8: https://huggingface.co/appmana/MAGI-2-preview-int8
- Fork de ComfyUI instalable vía pip/uv: https://github.com/hiddenswitch/forks-pip-and-uv-installable-ComfyUI

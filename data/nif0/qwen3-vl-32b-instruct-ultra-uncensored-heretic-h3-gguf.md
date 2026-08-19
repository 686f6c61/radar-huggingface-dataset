# nif0/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic-H3-GGUF

## Resumen

El modelo `nif0/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic-H3-GGUF` es una variante cuantizada y podada del modelo Qwen3-VL-32B-Instruct, publicada por el usuario nif0 en HuggingFace. Según la model card, se han eliminado capas posteriores a la capa 49 (pruned layers after 49), lo que reduce el número total de parámetros a aproximadamente 25 158 millones (frente a los 32 000 millones del original). El nombre "ultra-uncensored-heretic" sugiere un fine-tuning orientado a eliminar restricciones de contenido, aunque no se aportan detalles sobre el proceso de entrenamiento.

El modelo se distribuye en formato GGUF y está diseñado para ser utilizado como text encoder en pipelines de generación de vídeo (T2V e I2V) dentro de ComfyUI, mediante un fork específico de ComfyUI-GGUF. Esta orientación a vídeo es inusual para la familia Qwen3-VL, que originalmente es un modelo de visión-lenguaje, por lo que se trata de una adaptación especializada.

La relevancia actual radica en que ofrece una alternativa ligera (tras la poda) y sin censura para integraciones en flujos de generación de vídeo, con una licencia Apache 2.0 que permite uso comercial. Sin embargo, la documentación es escasa y no se proporcionan detalles técnicos completos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basado en Qwen3-VL-32B-Instruct, con poda de capas posteriores a la 49 |
| Parametros totales | 25 157 829 120 (25,16 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones específicas no listadas en la información proporcionada) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura se hereda de Qwen3-VL-32B-Instruct, un transformer multimodal que procesa texto e imágenes. La modificación principal consiste en la poda de capas: se eliminan todas las capas posteriores a la capa 49, reduciendo el tamaño del modelo de 32B a ~25B parámetros. Esta poda reduce los requisitos de memoria y acelera la inferencia, aunque puede degradar la calidad en tareas complejas.

El entrenamiento específico no está documentado. El nombre "ultra-uncensored-heretic" indica un fine-tuning orientado a eliminar filtros de seguridad y restricciones de contenido, pero no se especifican los datos utilizados, el número de tokens ni el método (RLHF, DPO, etc.). El modelo base es `mradermacher/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic-i1-GGUF`, que a su vez es una versión cuantizada de un modelo ya fine-tuneado.

La model card indica que el modelo se usa como text encoder para generación de vídeo: para T2V (texto a vídeo) solo se necesita el modelo, y para I2V (imagen a vídeo) se requiere además un archivo `mmproj`. Ambos deben colocarse en la carpeta `text_encoder` de ComfyUI.

## Capacidades

- Codificación de texto para generación de vídeo (T2V) y de imagen a vídeo (I2V) según la model card.
- Integración con ComfyUI mediante un fork de ComfyUI-GGUF (https://github.com/Nif00/ComfyUI-GGUF).
- Al estar basado en Qwen3-VL, conserva capacidades de comprensión de texto e imagen, aunque la poda puede afectar el rendimiento en estas tareas.
- No se documentan capacidades de tool calling, agentes o razonamiento multi-step.
- No se especifican idiomas soportados; se asume herencia del modelo base (multilingüe), pero no confirmado.

## Casos de uso

- Generación de vídeo a partir de prompts de texto: el modelo actúa como text encoder en un pipeline de ComfyUI, transformando el prompt en embeddings que guían la generación de vídeo. Su tamaño reducido (25B) facilita su ejecución en GPUs de gama media.
- Generación de vídeo a partir de imágenes (I2V): combinando el modelo con el archivo `mmproj`, se puede animar una imagen estática siguiendo instrucciones de texto.
- Prototipado rápido de contenidos audiovisuales: al ser un GGUF, puede cargarse en herramientas como llama.cpp u Ollama, aunque su uso principal es como encoder en ComfyUI.
- Investigación sobre modelos podados: la poda de capas ofrece un caso de estudio sobre el impacto en calidad y rendimiento.
- Aplicaciones creativas sin censura: el fine-tuning "uncensored" permite generar contenido que los modelos estándar rechazarían, útil para artistas o investigadores que necesitan libertad creativa.
- Despliegue en entornos con recursos limitados: con ~25B parámetros y cuantización GGUF, es posible ejecutarlo en GPUs con 16-24 GB de VRAM, dependiendo de la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros indicadores para este modelo específico. El rendimiento en tareas de vídeo dependerá del pipeline completo en ComfyUI y no está cuantificado.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~25B parámetros en GGUF, la VRAM necesaria varía según la cuantización:
  - Q4_K_M: ~15-16 GB
  - Q5_K_M: ~18-19 GB
  - Q8_0: ~25-26 GB
  - (Estimaciones basadas en el tamaño del modelo; no hay valores oficiales)
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones medias, o GPUs profesionales como A100 (40/80 GB) para cuantizaciones altas.
- Sí cabe en GPUs de consumo con 24 GB de VRAM si se usa una cuantización Q4 o Q5.
- Opciones de despliegue: ComfyUI con el fork de ComfyUI-GGUF (principal), también puede cargarse en llama.cpp u Ollama para uso como modelo de chat, aunque no está optimizado para ello.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Uso principal |
|---|---|---|---|---|---|
| Qwen3-VL-32B-Instruct (original) | 32B | 32k (típico) | Apache 2.0 | safetensors | Visión-lenguaje, chat, razonamiento |
| nif0/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic-H3-GGUF | 25,16B | No disponible | Apache 2.0 | GGUF | Text encoder para vídeo |
| Qwen3-VL-30B-AWQ (ejemplo) | 30B | 32k | Apache 2.0 | AWQ | Visión-lenguaje cuantizado |

La comparativa es limitada porque no hay modelos equivalentes documentados con la misma orientación a vídeo y poda. El original Qwen3-VL-32B-Instruct es el referente más cercano, pero sin poda ni fine-tuning "uncensored".

## Limitaciones y advertencias

- El modelo ha sido fine-tuneado para eliminar restricciones de contenido ("uncensored"), lo que implica un alto riesgo de generar contenido inapropiado, ofensivo o ilegal. No es adecuado para aplicaciones comerciales sin moderación adicional.
- La poda de capas puede degradar la calidad en tareas de razonamiento complejo, comprensión lectora o generación de código en comparación con el modelo original.
- No hay documentación oficial sobre el proceso de entrenamiento, los datos utilizados ni los criterios de poda.
- La longitud de contexto no está especificada; se desconoce si la poda afecta a la ventana de contexto.
- El modelo está orientado a un pipeline específico (ComfyUI con fork de ComfyUI-GGUF); su uso fuera de ese contexto no está probado.
- No se garantiza el soporte multilingüe, aunque el modelo base lo tiene.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede incurrir en responsabilidades legales si infringe normativas de moderación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nif0/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic-H3-GGUF
- Fork de ComfyUI-GGUF (GitHub): https://github.com/Nif00/ComfyUI-GGUF
- Modelo base (mradermacher): https://huggingface.co/mradermacher/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic-i1-GGUF

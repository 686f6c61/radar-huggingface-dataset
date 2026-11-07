# AST-1320/Qwen-Image-Edit-Diffusers

## Resumen

Qwen-Image-Edit-Diffusers es un repositorio de conversión y reempaquetado de los pesos del modelo Qwen-Image-Edit-Rapid-AIO, una variante afinada (finetune) del modelo de edición de imágenes Qwen-Image-Edit de Alibaba Qwen. El autor del repositorio, AST-1320, no entrena el modelo: se limita a separar el transformer del resto de componentes (text encoder, tokenizer, processor y VAE) y a fragmentarlo en formato Diffusers con safetensors por shards. Los pesos originales son obra de Phr00t, que los publica bajo el nombre Qwen-Image-Edit-Rapid-AIO.

El modelo resuelve la edición de imágenes guiada por instrucciones en lenguaje natural (image-to-image), partiendo de las bases Qwen/Qwen-Image-Edit-2511 y Qwen/Qwen-Image-Edit-2509. Es relevante porque permite cargar el transformer directamente con la clase `QwenImageTransformer2DModel` de la librería diffusers y combinarlo con los componentes restantes del modelo base, lo que simplifica su integración en pipelines de generación y edición de imágenes ya existentes.

La información pública disponible es escasa: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, un tamaño de 715,1 GB (debido a los múltiples shards y versiones) y no incluye model card detallada sobre arquitectura interna, datos de entrenamiento ni benchmarks. Los pesos del transformer se mantienen en FP8, tal como en los archivos originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para edición de imágenes (QwenImageTransformer2DModel, según diffusers); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 en los pesos del transformer (mantenidos del original); no se documentan otras variantes |
| Idiomas soportados | no disponible (el prompt de edición se procesa mediante el text encoder del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors fragmentados en shards, layout Diffusers (`<version>/transformer`) |

## Arquitectura y entrenamiento

El repositorio contiene únicamente el transformer del pipeline de edición de imágenes, convertido al formato Diffusers y dividido en shards safetensors. Cada versión del modelo (por ejemplo `V.23`) se organiza en su propia carpeta `<version>/transformer`. Los pesos se conservan en FP8, igual que en los archivos originales de Phr00t. El text encoder, el tokenizer, el processor y el VAE no están incluidos y deben cargarse desde el modelo base correspondiente (Qwen/Qwen-Image-Edit-2511 o Qwen/Qwen-Image-Edit-2509), ya que cada versión puede haberse construido sobre una base distinta.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del finetune Rapid-AIO. El trabajo de AST-1320 es exclusivamente de reempaquetado: separación del transformer y fragmentación en el layout de Diffusers. Todo el crédito de los pesos corresponde a Phr00t.

## Capacidades

- Edición de imágenes guiada por instrucciones en lenguaje natural (image-to-image) mediante el pipeline `QwenImageEditPlusPipeline` de diffusers.
- Carga del transformer con `QwenImageTransformer2DModel.from_pretrained`, apuntando al subfolder de la versión deseada.
- Compatibilidad con los componentes del modelo base Qwen-Image-Edit-2511 y Qwen-Image-Edit-2509 (text encoder, tokenizer, processor y VAE).
- Múltiples versiones del finetune Rapid-AIO disponibles en carpetas independientes, cada una potencialmente basada en un modelo base distinto.
- Pesos en FP8, lo que reduce el espacio en disco y la memoria frente a versiones en bfloat16.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión general, audio ni modo thinking; se trata de un modelo de edición de imágenes.

## Casos de uso

- Edición de imágenes por prompt en producción: se carga el transformer de una versión concreta junto con los componentes del modelo base y se utiliza `QwenImageEditPlusPipeline` para aplicar instrucciones de edición sobre imágenes de entrada en un servicio de retoque automatizado.
- Integración en pipelines Diffusers existentes: al estar en layout Diffusers con safetensors por shards, se puede sustituir el transformer de un pipeline Qwen-Image-Edit ya desplegado sin reescribir el código de carga.
- Prototipado rápido de variantes de edición: las distintas carpetas de versión permiten comparar el comportamiento de diferentes finetunes Rapid-AIO sobre el mismo conjunto de imágenes de prueba.
- Despliegue con pesos FP8 en entornos con VRAM limitada: el formato FP8 reduce el consumo de memoria del transformer frente a alternativas en bfloat16, lo que facilita su ejecución en GPUs de gama alta para consumo.
- Investigación sobre finetunes de edición de imágenes: el repositorio sirve como punto de partida para estudiar el efecto de los finetunes Rapid-AIO sobre el modelo base Qwen-Image-Edit.
- Automatización de flujos creativos: generación de variaciones editadas de material gráfico (por ejemplo, cambios de estilo o de elementos) dentro de una canalización por lotes que reutiliza el VAE y el text encoder del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; depende del tamaño del transformer (no documentado), de los componentes del modelo base y del tamaño de las imágenes de entrada. Los pesos están en FP8, lo que reduce el requisito frente a bfloat16.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del repositorio (715,1 GB, que incluye múltiples versiones y shards) y el uso de FP8, se orienta a GPUs de datacenter o de gama alta para consumo, pero no se confirma ningún modelo concreto.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: librería diffusers con `QwenImageEditPlusPipeline` y `QwenImageTransformer2DModel`; no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para este modelo de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AST-1320/Qwen-Image-Edit-Diffusers | no disponible | no disponible | sin benchmarks publicados | Apache-2.0 | Hugging Face (0 descargas, 1 like) |
| Phr00t/Qwen-Image-Edit-Rapid-AIO | no disponible | no disponible | sin benchmarks publicados en la información disponible | no disponible en la información proporcionada | Hugging Face |
| Qwen/Qwen-Image-Edit-2511 | no disponible | no disponible | sin benchmarks publicados en la información disponible | Apache-2.0 | Hugging Face (modelo base) |
| Qwen/Qwen-Image-Edit-2509 | no disponible | no disponible | sin benchmarks publicados en la información disponible | Apache-2.0 | Hugging Face (modelo base) |

## Limitaciones y advertencias

- El repositorio no incluye text encoder, tokenizer, processor ni VAE; es imprescindible cargarlos desde el modelo base correcto (2511 o 2509) según la versión elegida, o el pipeline fallará.
- Cada versión puede estar construida sobre un modelo base distinto; usar una base que no coincida con la versión produce resultados incorrectos.
- El repositorio está etiquetado como `not-for-all-audiences`, lo que implica que el finetune puede generar contenido no apto para todo público; se recomienda moderación y filtrado en producción.
- No hay información sobre sesgos, tasas de alucinación visual ni limitaciones de idioma del prompt.
- Los pesos están en FP8; no se documenta si existen variantes en bfloat16 o GGUF.
- Licencia Apache-2.0 declarada, pero conviene verificar las condiciones del finetune original de Phr00t antes de un uso comercial, ya que la información sobre su licencia no está disponible en esta ficha.
- El repositorio tiene 0 descargas y 1 like, por lo que no hay validación comunitaria ni evidencia de uso en producción.
- El tamaño del repositorio (715,1 GB) exige planificar el almacenamiento y la descarga selectiva por versión.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AST-1320/Qwen-Image-Edit-Diffusers
- Repositorio relacionado AST-1320/Qwen-Image-Edit-2511: https://huggingface.co/AST-1320/Qwen-Image-Edit-2511
- README de AST-1320/Qwen-Image-Lightning: https://huggingface.co/AST-1320/Qwen-Image-Lightning/blob/main/README.md
- Modelo original de Phr00t: https://huggingface.co/Phr00t/Qwen-Image-Edit-Rapid-AIO
- Modelo base Qwen/Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Modelo base Qwen/Qwen-Image-Edit-2509: https://huggingface.co/Qwen/Qwen-Image-Edit-2509

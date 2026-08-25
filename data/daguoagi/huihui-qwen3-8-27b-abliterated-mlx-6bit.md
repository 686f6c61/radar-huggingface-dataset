# daguoagi/Huihui-Qwen3.8-27B-abliterated-MLX-6bit

## Resumen

Este modelo es una conversión no oficial a formato MLX de `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, una versión de Qwen3.8-27B a la que se ha aplicado un proceso de abliteración para eliminar capas de rechazo. La conversión, realizada con `mlx-vlm`, cuantiza los pesos del modelo de lenguaje a 6 bits (RTN affine, grupo de 64) y mantiene los componentes de visión en su precisión original. Está pensado para inferencia local en equipos Apple Silicon mediante la librería `mlx-vlm`, tanto para generación de texto como para comprensión de imágenes. El modelo base reporta que las capas 18 a 51 fueron abladas, lo que reduce el sesgo de censura del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (multimodal) |
| Parametros totales | 6.346.296.560 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit affine RTN, group size 64 |
| Idiomas soportados | no disponible (multilingüe esperado por la familia Qwen) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX Safetensors (pesos del lenguaje cuantizados; visión en precisión original) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `Qwen3_5ForConditionalGeneration`, un transformer multimodal que combina un modelo de lenguaje con un codificador de visión. En esta conversión, los pesos del modelo de lenguaje se cuantizan a 6 bits con RTN (round-to-nearest) affine y grupo de tamaño 64, mientras que los componentes de visión y los procesadores multimodales se mantienen en su precisión original (bfloat16). La conversión se realizó con `mlx-vlm 0.6.16` y MLX 0.32.2, y no incluye ningún fine-tuning adicional ni modificación de la abliteración aplicada en el modelo base. El modelo original reporta que las capas 18 a 51 fueron ablateradas, un proceso que elimina las capas que filtran contenido considerado inapropiado. No se incluye un módulo MTP (multi-token prediction) ni tensores `mtp.*` en el checkpoint.

## Capacidades

- Generación de texto en lenguaje natural, con soporte de conversación y preguntas-respuestas.
- Comprensión de imágenes: puede describir imágenes y responder preguntas sobre su contenido, gracias a los componentes de visión conservados.
- Modelo multimodal que procesa entradas de texto e imagen de forma conjunta.
- Inferencia en Apple silicon mediante `mlx-vlm`, con soporte de decodificación especulativa opcional usando el modelo draft `z-lab/Qwen3.8-27B-DFlash2`.
- No se dispone de información sobre soporte de tool calling, agentes o razonamiento multi-paso en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple silicon: el modelo está optimizado para `mlx-vlm`, lo que permite ejecutarlo en equipos con chip M1/M2/M3 y memoria unificada de al menos 24 GB.
- Asistentes conversacionales multimodales: puede responder preguntas sobre imágenes en tiempo real, útil para aplicaciones de accesibilidad o análisis visual.
- Investigación sobre abliteración: al ser una versión abliterated, es útil para estudiar el comportamiento de modelos sin capas de rechazo y comparar con la versión original.
- Generación de contenido creativo sin restricciones: la abliteración reduce la censura, por lo que se puede usar para tareas de escritura libre o exploración de contenido no moderado.
- Prototipado rápido en Apple silicon: al ser una conversión MLX, se integra fácilmente con el ecosistema de MLX y permite iterar sin necesidad de GPUs dedicadas.
- Desarrollo de aplicaciones de visión por computador con lenguaje natural: para tareas de captioning o respuesta visual a preguntas, aprovechando la ventana de contexto del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio pesa aproximadamente 22.8 GB (21 GiB). Los pesos cuantizados a 6 bits requieren una memoria unificada de al menos 24 GB para cargar el modelo completo, y se recomienda 32 GB para cómoda inferencia.
- Diseñado exclusivamente para Apple silicon (M1, M2, M3 y posteriores). No se proporcionan instrucciones para GPU NVIDIA o AMD.
- La inferencia se realiza mediante `mlx-vlm` (versión 0.6.16 o superior). No se menciona compatibilidad con vLLM, llama.cpp u otros entornos.
- Se puede usar decodificación especulativa con el modelo draft `z-lab/Qwen3.8-27B-DFlash2`, pero no se han reportado tasas de aceptación para esta conversión de 6 bits.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Longitud de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| daguoagi/Huihui-Qwen3.8-27B-abliterated-MLX-6bit | 6.346.296.560 (safetensors) | 6-bit RTN | no disponible | Apache-2.0 | MLX (Apple Silicon) |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B (original) | FP16 (presumible) | no disponible | Apache-2.0 | HuggingFace, otros formatos |
| huihui-ai/Qwen3-8B-abliterated | 8B | FP16 | no disponible | Apache-2.0 | HuggingFace, otros formatos |

La comparativa se basa en el tamaño y formato. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- La abliteración elimina capas de rechazo, lo que puede generar respuestas con contenido inapropiado, ofensivo o peligroso. No es adecuado para entornos de producción sin moderación adicional.
- Es una conversión no oficial, por lo que puede contener diferencias de comportamiento respecto al modelo original. No se ha probado exhaustivamente en todos los casos de uso.
- El modelo de lenguaje está cuantizado a 6 bits, lo que puede degradar ligeramente la calidad de las respuestas en comparación con la versión de 16 bits.
- No se incluye el módulo MTP, por lo que la decodificación especulativa solo es posible con un modelo draft externo, y no se ha verificado su rendimiento en esta versión de 6 bits.
- No se dispone de datos sobre la longitud de contexto real ni sobre el rendimiento en tareas de razonamiento complejo.
- La licencia Apache-2.0 permite uso comercial, pero se debe tener en cuenta el contenido generado por el modelo y las posibles implicaciones legales.

## Enlaces

- [Repositorio de Hugging Face del modelo](https://huggingface.co/daguoagi/Huihui-Qwen3.8-27B-abliterated-MLX-6bit)
- [Modelo base original](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- [Versión abliterated de Qwen3-8B](https://huggingface.co/huihui-ai/Qwen3-8B-abliterated)
- [Página de Ollama para la versión abliterated](https://ollama.com/huihui_ai/Qwen3.8-abliterated)
- [Entrada en LLM Explorer](https://llm-explorer.com/model/huihui-ai%2FHuihui-Qwen3.8-27B-abliterated,7yiXfSP5itojtujYtkbmXj)
- [Publicación en X sobre el modelo](https://x.com/support_huihui/status/2091631664363663405)
- [Repositorio de `mlx-vlm`](https://github.com/Blaizzy/mlx-vlm)
- [Modelo draft recomendado `z-lab/Qwen3.8-27B-DFlash2`](https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2)

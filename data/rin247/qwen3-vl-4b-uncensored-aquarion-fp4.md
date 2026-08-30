# Rin247/Qwen3-VL-4B-Uncensored-Aquarion-FP4

## Resumen

El modelo `Rin247/Qwen3-VL-4B-Uncensored-Aquarion-FP4` es una cuantización FP4 (weight-only) del modelo multimodal Qwen3-VL-4B, publicada por el usuario Rin247 en HuggingFace. La variante ha sido sometida a un proceso de "abliteration" (eliminación de la dirección de rechazo) mediante proyección ortogonal, lo que elimina los guardarraíles de seguridad del modelo original. El resultado es un modelo de 2.415.636.992 parámetros (dato real de los safetensors) que ocupa 3.1 GB en el repositorio.

Esta ficha se basa exclusivamente en la información proporcionada en la model card y en los resultados de búsqueda web. No se dispone de datos sobre la arquitectura interna, la longitud de contexto, los idiomas soportados ni la licencia. El modelo está pensado para usuarios que necesitan una versión ligera y sin restricciones del Qwen3-VL-4B, aunque la ausencia de documentación técnica detallada limita su uso en entornos de producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.415.636.992 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 (weight-only) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP4 weight-only) |

## Arquitectura y entrenamiento

La model card indica que se trata de una cuantización FP4 weight-only del modelo base `Qwen3-VL-4B`, realizada con PyTorch RTN (Round-to-Nearest) en CPU. Las escalas de cuantización se almacenan junto a los pesos en buffers adicionales (`*.weight_scale`, `*.weight_shape`). Antes de la cuantización, el modelo fue "abliterated" mediante proyección ortogonal de la dirección de rechazo, un proceso que elimina la negativa a responder a ciertas instrucciones. No se proporcionan datos sobre el entrenamiento del modelo base, el número de tokens utilizados ni el método de alineación (RLHF, DPO, etc.). Tampoco se especifica si la cuantización afecta a la calidad de salida.

## Capacidades

- No se documentan capacidades específicas en la model card.
- Al derivar de Qwen3-VL-4B, se espera que herede capacidades de comprensión de imágenes y texto, pero no hay confirmación oficial.
- No se menciona soporte para tool calling, agentes, razonamiento multi-paso ni modos especiales (thinking, vision, audio).
- El proceso de abliteration elimina los guardarraíles de seguridad, lo que permite generar contenido que el modelo base rechazaría.

## Casos de uso

No se proporcionan casos de uso documentados en la información disponible. Dado que el modelo es una variante cuantizada y sin censura del Qwen3-VL-4B, podría emplearse en escenarios como:

- Generación de descripciones de imágenes en entornos de investigación donde se requiera contenido sin restricciones.
- Prototipado rápido de aplicaciones de visión-lenguaje con requisitos de memoria reducidos.
- Experimentación con técnicas de abliteration y cuantización en modelos multimodales.
- Evaluación de la degradación de rendimiento inducida por FP4 en tareas de VQA (Visual Question Answering).
- Uso en pipelines de generación creativa que necesiten respuestas no filtradas.
- Pruebas de concepto en sistemas embebidos con GPUs de baja VRAM.

Estos usos son hipotéticos y no están confirmados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación.
- Con 2.4B parámetros en FP4 (4 bits), el peso del modelo es aproximadamente 1.2 GB, más overhead de escalas y buffers. Se estima que podría ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM, pero esta cifra no está confirmada.
- No se indican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- La model card menciona que se requieren recetas personalizadas de dequantización antes de usar un motor de inferencia, lo que complica el despliegue directo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Abliterated | Licencia |
|---|---|---|---|---|
| Rin247/Qwen3-VL-4B-Uncensored-Aquarion-FP4 | 2.4B | FP4 | Si | no disponible |
| Qwen/Qwen3-VL-4B-Instruct (base) | 4B (aprox.) | BF16 | No | Apache 2.0 (segun repo oficial) |
| huihui-ai/Huihui-Qwen3-VL-4B-Instruct-abliterated | 4B (aprox.) | no especificada | Si | no disponible |

No se dispone de datos de rendimiento comparativo. El modelo base Qwen3-VL-4B-Instruct es la referencia oficial, mientras que la variante de huihui-ai es otra versión abliterated sin cuantizar. La comparación directa no es posible sin benchmarks.

## Limitaciones y advertencias

- Al ser abliterated, el modelo puede generar contenido inapropiado, ofensivo o peligroso sin restricciones. No es apto para aplicaciones orientadas al público general.
- La cuantización FP4 puede degradar la calidad de las respuestas en comparación con el modelo en BF16, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- La licencia no está especificada, lo que impide determinar si es legal su uso comercial o su redistribución.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto.
- El formato de pesos requiere un proceso de dequantización manual con buffers de escala y forma, lo que dificulta su integración en frameworks estándar.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rin247/Qwen3-VL-4B-Uncensored-Aquarion-FP4
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio GitHub de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Variante abliterated de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3-VL-4B-Instruct-abliterated
- Artículo sobre Qwen3-VL-4B Heretic (otra variante abliterated): https://comfyui-wiki.com/en/news/2026-07-16-qwen3-vl-4b-heretic-comfyui

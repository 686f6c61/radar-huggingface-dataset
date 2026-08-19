# dudeman2512/Qwen3.8-27B-FP8

## Resumen

Qwen3.8-27B-FP8 es una cuantización en precisión FP8 del modelo Qwen/Qwen3.8-27B, desarrollada por el usuario dudeman2512 mediante la librería `compressed-tensors` de Neural Magic. El proceso se realiza haciendo streaming del checkpoint tensor a tensor, sin instanciar el modelo completo, lo que permite reducir el tamaño en disco a aproximadamente un 55% del original en BF16 (30,35 GB frente a los ~55 GB estimados). Esta variante emplea pesos en formato `float8_e4m3fn` con cuantización por canal de salida y cuantización dinámica de activaciones por token, logrando un error relativo medio de 0,0264 frente a los pesos BF16 originales, el más bajo de las tres cuantizaciones publicadas del mismo modelo base.

El modelo base es un transformer multimodal (etiquetado como `image-text-to-text`), aunque la model card no proporciona detalles sobre su arquitectura interna, tamaño de contexto o datos de entrenamiento. Esta cuantización está pensada para su despliegue eficiente con vLLM, como se indica en las instrucciones de uso, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (según tags de HuggingFace), detalles no disponibles |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (`float8_e4m3fn`), per-channel, activaciones dinámicas por token |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, `float-quantized` (FP8) |

## Arquitectura y entrenamiento

La información disponible no incluye detalles sobre la arquitectura interna del modelo base Qwen3.8-27B, ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). Los tags de HuggingFace indican que se trata de un modelo multimodal `image-text-to-text`, lo que sugiere una arquitectura transformer con módulos de visión y lenguaje, pero no se especifican más detalles.

Esta variante FP8 no es un modelo entrenado desde cero, sino una cuantización post-entrenamiento realizada con `compressed-tensors`. El proceso convierte los pesos BF16 a `float8_e4m3fn` por canal de salida, con cuantización dinámica de las activaciones por token. Se cuantizaron 615 capas lineales, dejando 0 en BF16, y se verificó la conformidad de forma y dtype de cada tensor contra el servidor esperado antes de su publicación. El error relativo medio medido sobre una muestra de capas lineales cuantizadas es de 0,0264, lo que indica una pérdida de precisión muy baja.

## Capacidades

No se han publicado capacidades específicas para esta cuantización en la información disponible. Sin embargo, al ser una versión FP8 del modelo Qwen3.8-27B, se espera que herede las capacidades del modelo base, que según los tags incluye:

- Generación de texto conversacional
- Procesamiento de imágenes y texto (multimodal, según el tag `image-text-to-text`)
- Compatibilidad con pipelines de generación de texto (HuggingFace `text-generation`)
- Integración con vLLM para servir en producción

No se dispone de información sobre soporte de tool calling, capacidades de agente, razonamiento multi-paso, ni sobre el alcance multilingüe.

## Casos de uso

- Despliegue de modelos multimodales en producción: al ser una cuantización FP8 compatible con vLLM, permite servir el modelo Qwen3.8-27B en entornos de producción con menor huella de memoria (30,35 GB en disco) y mayor throughput que la versión BF16, ideal para aplicaciones que combinan visión y lenguaje, como asistentes que procesan capturas de pantalla o documentos escaneados.
- Reducción de costes de infraestructura: el tamaño reducido (~55% del original) permite alojar el modelo en GPUs con 32-40 GB de VRAM, como A100 o RTX 6000 Ada, en lugar de requerir H100 o múltiples GPUs, abaratando el coste por inferencia.
- Fine-tuning eficiente con LoRA: al mantener los pesos en FP8, se puede aplicar fine-tuning con adaptadores LoRA sobre las capas cuantizadas, aprovechando la menor memoria para entrenar en hardware más asequible.
- Evaluación de fidelidad de cuantización: los datos de error relativo medio (0,0264) y la verificación de conformidad hacen de este modelo un candidato para experimentos que comparen el impacto de FP8 frente a otras precisiones (NVFP4, int4) en tareas específicas.
- Inferencia en tiempo real con vLLM: el comando `vllm serve dudeman2512/Qwen3.8-27B-FP8` permite levantar un endpoint OpenAI-compatible de forma inmediata, facilitando su integración en aplicaciones de chat, análisis de imágenes o generación de texto.
- Archivado y distribución: al ser un checkpoint cuantizado con formato estándar `safetensors`, puede distribuirse fácilmente y cargarse con `transformers` o `compressed-tensors`, simplificando la reproducibilidad en equipos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica de rendimiento proporcionada es el error relativo medio de reconstrucción frente a los pesos BF16 originales, que es de 0,0264. No se dispone de datos de latencia, throughput ni comparaciones con otros modelos en tareas estándar.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 30,35 GB en disco en formato FP8. Para inferencia con vLLM se recomienda al menos 32 GB de VRAM, considerando overhead de activaciones y caché KV. Con 40 GB (A100, RTX 6000 Ada) o 80 GB (H100) se puede operar con margen.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), RTX 6000 Ada (48 GB), o GPUs con 32 GB o más. No cabe en GPUs de consumo como RTX 4090 (24 GB) sin técnicas adicionales de offloading.
- Opciones de despliegue: vLLM es la opción principal indicada en la model card. También puede cargarse con `transformers` y `compressed-tensors`, y potencialmente con otros frameworks que soporten FP8 (TensorRT-LLM, TGI).
- Latencia y throughput: no disponibles. Se espera que FP8 mejore el throughput frente a BF16 en GPUs con soporte nativo para FP8 (H100, A100 con Tensor Cores), pero no hay datos cuantificados.

## Comparativa con modelos similares

La comparativa más directa es con las otras cuantizaciones del mismo modelo base publicadas por el mismo autor, que se recogen en la model card:

| Variante | Formato | Tamaño en disco | vs BF16 | Error relativo medio | Lineales cuantizados | Left BF16 |
|---|---|---|---|---:|---:|---:|---:|
| Qwen3.8-27B-FP8 | float-quantized | 30,35 GB | 55% | 0,0264 | 615 | 0 |
| Qwen3.8-27B-NVFP4 | nvfp4-pack-quantized | 19,29 GB | 35% | 0,0950 | 615 | 0 |
| Qwen3.8-27B-int4 | pack-quantized | 18,31 GB | 33% | 0,1178 | 588 | 27 |

FP8 ofrece la mayor fidelidad (menor error relativo) a costa de un mayor tamaño, mientras que NVFP4 e int4 reducen más el espacio pero con mayor pérdida de precisión. No se dispone de comparaciones con otros modelos de la misma categoría (p. ej., otros Qwen cuantizados o modelos multimodales de tamaño similar).

## Limitaciones y advertencias

- La cuantización FP8 introduce una pérdida de precisión frente a los pesos BF16 originales (error relativo medio de 0,0264), que puede afectar a tareas sensibles a pequeños cambios en los pesos, como razonamiento matemático o generación de código.
- No se dispone de información sobre sesgos, riesgos de alucinación, ni limitaciones de contexto o idioma del modelo base. Se recomienda evaluar estos aspectos antes de usar en producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales que no se detallan en esta ficha; es necesario verificar la licencia del modelo original.
- El modelo no incluye datos de entrenamiento ni documentación sobre su alineación; no se puede garantizar su comportamiento en dominios específicos sin pruebas previas.
- El formato FP8 requiere hardware con soporte nativo para esta precisión (NVIDIA H100, A100, RTX 40xx) para obtener el máximo rendimiento; en GPUs sin soporte FP8, la inferencia puede ser más lenta que con BF16.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/dudeman2512/Qwen3.8-27B-FP8)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio compressed-tensors](https://github.com/neuralmagic/compressed-tensors)
- [Variante NVFP4](https://huggingface.co/dudeman2512/Qwen3.8-27B-NVFP4)
- [Variante int4](https://huggingface.co/dudeman2512/Qwen3.8-27B-int4)

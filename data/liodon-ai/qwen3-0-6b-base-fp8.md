# liodon-ai/Qwen3-0.6B-Base-FP8

## Resumen

El modelo `liodon-ai/Qwen3-0.6B-Base-FP8` es una cuantización FP8 dinámica del modelo base `Qwen/Qwen3-0.6B-Base`, publicada por Liodon AI. El objetivo es reducir el tamaño del modelo de 1,2 GB a 0,8 GB manteniendo la calidad del modelo original, ya que el esquema de cuantización utilizado (FP8_DYNAMIC) no requiere dataset de calibración y los pesos son una conversión directa a FP8 E4M3 por canal. Las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. El `lm_head` se deja sin cuantizar para preservar la calidad.

El modelo tiene 596.049.920 parámetros totales y está pensado para generación de texto. La documentación proporcionada no incluye detalles sobre la arquitectura interna, la longitud de contexto ni los idiomas soportados; estos datos se indican como no disponibles en la ficha. La cuantización FP8 está optimizada para GPUs NVIDIA con compute capability 8.9 o superior (Ada, Hopper, Blackwell), donde ofrece ventajas de velocidad y memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (no se ha indicado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinámico (E4M3): pesos por canal, activaciones por token |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (compatible con compressed-tensors) |

## Arquitectura y entrenamiento

La información disponible se centra en el proceso de cuantización, no en la arquitectura ni en el entrenamiento del modelo base. El modelo se cuantizó con `llm-compressor` usando el esquema `FP8_DYNAMIC`: los pesos se convierten a FP8 E4M3 por canal de antemano, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Este esquema no necesita dataset de calibración, por lo que los pesos cuantizados son numéricamente un cast directo de los pesos originales, lo que evita sesgos introducidos por el dataset de calibración. El `lm_head` se deja sin cuantizar, una práctica habitual por su tamaño reducido y su impacto desproporcionado en la calidad si se cuantiza. El tamaño del modelo pasa de 1,2 GB a 0,8 GB.

No se han proporcionado detalles sobre los datos de entrenamiento, el número de tokens ni procesos de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto: el modelo está etiquetado como `text-generation` en HuggingFace.
- Compatibilidad con vLLM, Text Generation Inference (TGI) y SGLang para despliegue, tal y como se indica en la model card.
- Cuantización FP8 dinámica: los pesos en FP8 E4M3 por canal y las activaciones cuantizadas por token permiten reducir el uso de memoria en GPUs compatibles.
- `lm_head` sin cuantizar: se mantiene la calidad del modelo en la capa de salida.
- No se dispone en la documentación de información sobre tool calling, soporte de agentes, capacidades multilingües, visión o audio.

## Casos de uso

No se han publicado casos de uso validados por el autor en la documentación. A modo de orientación, por sus características (modelo base de 0,6B, 0,8 GB en FP8), se podrían considerar los siguientes escenarios, siempre que se valide el rendimiento en el caso concreto:

- Inferencia en entornos con recursos limitados: el tamaño de 0,8 GB permite ejecutar el modelo en GPUs con poca VRAM, como RTX 40-series o L4, usando vLLM o TGI.
- Prototipado rápido: al ser un modelo pequeño, facilita iterar en aplicaciones de texto sin necesidad de infraestructura de alto coste.
- Autocompletado de texto: como modelo base, puede emplearse para completar texto libre en aplicaciones de edición o generación asistida.
- Extracción de características: podría utilizarse para obtener representaciones de texto en tareas de clasificación o recuperación, aunque no se confirma en la documentación.
- Evaluación de cuantización FP8: sirve como referencia para medir el impacto de la cuantización FP8 dinámica en modelos de tamaño pequeño.
- Aplicaciones de baja latencia: en hardware compatible con FP8, la inferencia puede ofrecer menor latencia que con FP16/FP32, aunque no se aportan cifras en la documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el tamaño de los pesos cuantizados es de 0,8 GB. La VRAM total necesaria depende de la longitud de contexto y del tamaño del batch; no se proporcionan cifras exactas.
- GPU recomendadas: NVIDIA con compute capability 8.9 o superior (Ada, Hopper, Blackwell): RTX 40-series, L4/L40S, H100/H200, B100/B200/GB10.
- En GPUs con compute capability inferior a 8.9, vLLM y TGI des-cuantizan los pesos, por lo que se pierden los beneficios de velocidad y memoria de FP8.
- Opciones de despliegue: vLLM (`vllm serve`), Text Generation Inference (TGI, vía Docker) y SGLang.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Cuantizacion | Licencia |
|---|---|---|---|---|
| Qwen/Qwen3-0.6B-Base | 596.049.920 | 1,2 GB | Sin cuantizar | other |
| liodon-ai/Qwen3-0.6B-Base-FP8 | 596.049.920 | 0,8 GB | FP8 dinámico | other |

No se dispone de información sobre otras cuantizaciones FP8 de modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia es `other`, por lo que es obligatorio revisar los términos de uso antes de cualquier despliegue comercial.
- En GPUs con compute capability inferior a 8.9, el modelo se des-cuantiza y no se obtienen las ventajas de FP8 en memoria ni velocidad.
- Al ser una cuantización sin calibración, se asume que la calidad es similar a la del modelo original, pero no se han publicado evaluaciones de calidad en la información proporcionada.
- No se dispone de datos sobre sesgos conocidos, riesgo de alucinación o limitaciones de idioma.
- Al tratarse de una variante `Base`, es previsible que no esté afinada para seguir instrucciones; no obstante, esto no se confirma en la documentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/Qwen3-0.6B-Base-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Página del modelo Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Perfil de Liodon AI: https://huggingface.co/liodon-ai
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor

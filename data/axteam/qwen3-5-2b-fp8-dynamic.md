# axteam/Qwen3.5-2B-FP8-dynamic

## Resumen

`axteam/Qwen3.5-2B-FP8-dynamic` es una cuantización de 8 bits en formato FP8 dinámico del modelo multimodal `Qwen/Qwen3.5-2B`, publicada por el usuario axteam para servir el modelo con vLLM de forma eficiente. No es un modelo nuevo: es un derivado post-entrenamiento (PTQ) que conserva el tokenizador, la plantilla de chat y la configuración de generación del original, y que añade un bloque `quantization_config` al `config.json`.

El modelo base es un transformer denso de arquitectura híbrida (atención lineal combinada con atención completa), con torre de visión para entrada de imagen y texto, y una cabeza MTP (multi-token prediction). Cuenta con 2.274.069.824 parámetros reales según los safetensors, lo que lo sitúa en la gama de 2B, adecuada para despliegues con requisitos moderados de VRAM.

Su relevancia es práctica: el repositorio ocupa 3,2 GB y el autor declara un tamaño en disco de aproximadamente 3,0 GB, frente a los ~4,5 GB que ocuparían los pesos en BF16. La cuantización mantiene en BF16 las partes sensibles (torre de visión, proyector, cabeza MTP, RMSNorms, embeddings, LM head y las partes no lineales del bloque SSM), de modo que la pérdida de fidelidad medida es de +1,1% en perplejidad sobre un conjunto interno de 100 prompts en inglés y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: atención lineal + atención completa; multimodal (visión); cabeza MTP (multi-token prediction) |
| Parametros totales | 2.274.069.824 (2,27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 dinámico W8A8 (E4M3), esquema `FP8_DYNAMIC` de compressed-tensors; sin calibración |
| Idiomas soportados | No disponible en la información proporcionada (la evaluación interna del autor usa inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (`FP8_DYNAMIC`); no se incluyen GGUF |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina capas de atención lineal con capas de atención completa, un patrón híbrido habitual para reducir el coste de la ventana de contexto manteniendo capacidad de recuperación exacta en tramos largos. Sobre esa columna vertebral se añaden una torre de visión con su proyector (entrada `image-text-to-text`), una cabeza de predicción multi-token y módulos propios de atención lineal con estado (convolución 1D, `A_log` y `dt_bias`). El conjunto está empaquetado para `transformers` y `vllm`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo original pasó por RLHF, DPO u otras fases de alineamiento. Lo que sí documenta el autor es el proceso de cuantización: se trata de PTQ sin reentrenamiento, con escalas de pesos estáticas por canal de salida (data-free, sin conjunto de calibración) y activaciones FP8 dinámicas por token calculadas en tiempo de inferencia. Se mantienen en BF16 la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, el LM head y las partes no lineales del bloque SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`).

## Capacidades

- Generación de texto conversacional multiturno, con plantilla de chat idéntica a la del modelo original.
- Entrada multimodal de imagen y texto (`pipeline_tag: image-text-to-text`): descripción de imágenes, respuesta a preguntas sobre contenido visual y conversación mixta texto-imagen.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.5-2B.
- Predicción multi-token mediante la cabeza MTP, que el autor conserva sin cuantizar.
- Capacidades multilingües: no hay listado oficial de idiomas en la información disponible; la evaluación interna del autor se realizó sobre un conjunto mixto inglés/coreano.
- Compatible con despliegue en vLLM y con la librería `transformers`.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modos de razonamiento extendido (thinking), más allá de lo que herede del modelo base.

## Casos de uso

- **Servicio de chat multimodal en producción**: el modelo acepta imagen y texto en la misma conversación, por lo que puede desplegarse tras una API compatible con OpenAI en vLLM (`vllm serve axteam/Qwen3.5-2B-FP8-dynamic`) para asistentes que reciben capturas, fotos de producto o documentos escaneados junto a una pregunta en lenguaje natural.
- **Procesamiento por lotes de imágenes con descripción textual**: etiquetado, alt-text y moderación de contenido visual a escala, aprovechando el tamaño reducido (3,0 GB en disco) para ejecutar varias instancias por GPU o escalar horizontalmente con coste bajo.
- **Extracción de información de documentos escaneados**: formularios, facturas o tickets fotografiados, combinando la lectura visual con la generación de texto estructurado en la misma llamada.
- **Asistente de soporte de primera línea**: conversaciones multiturno con contexto corto o medio, donde el coste por token y la latencia importan más que el razonamiento profundo; el formato FP8 reduce el ancho de banda de memoria y mejora el throughput en GPUs con soporte nativo.
- **Prototipado e investigación en entornos con una sola GPU**: validación de pipelines multimodales o de integración con `transformers` antes de migrar a un modelo mayor, gracias a que los pesos en FP8 caben en GPUs de consumo con 8 GB o más.
- **Clasificación y enrutamiento de contenido en pipelines internos**: primera pasada barata que decide si una consulta o imagen requiere un modelo mayor, reduciendo el coste global del sistema.
- **Evaluación comparativa de cuantizaciones**: al mantener el tokenizador, la plantilla de chat y la configuración de generación idénticas al original, sirve como referencia para medir el impacto de FP8 frente a BF16 en tareas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo publica métricas de fidelidad frente al modelo original en BF16, sobre un conjunto interno mixto inglés/coreano de 100 prompts con respuestas greedy del modelo BF16 puntuadas bajo cada build:

| Métrica | Este modelo (FP8 dinámico) | Original BF16 |
|---|---|---|
| Perplejidad (menor es más cercano) | 1,8710 | 1,8515 (+1,1%) |
| Acuerdo top-1 en el siguiente token | 94,4% | 98,9% |

Estas cifras miden similitud respecto al modelo base, no calidad absoluta en tareas. El autor no publica latencia ni throughput.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos en FP8 suman aproximadamente 2,3 GB, y el repositorio completo ocupa 3,2 GB (parte de los módulos se conserva en BF16). Con overhead de runtime, caché KV y memoria para visión, un despliegue realista parte de unos 4-6 GB de VRAM; no es un dato publicado por el autor, sino una estimación derivada del tamaño de los ficheros.
- **GPU recomendadas**: para aprovechar la aceleración nativa de FP8 E4M3 conviene hardware Ada Lovelace o Hopper (RTX 4090, L40S, H100). En GPUs Ampere o anteriores el soporte de FP8 en vLLM es limitado o inexistente, por lo que puede requerir de-cuantización o no ser viable tal cual.
- **GPU de consumo**: sí cabe en tarjetas con 8 GB o más, como RTX 3060 Ti 8 GB, RTX 4060 Ti 8/16 GB, RTX 4070 y superiores; en 8 GB el margen es ajustado si se procesan imágenes de resolución alta o contextos largos.
- **Opciones de despliegue**: vLLM es la vía documentada y recomendada (soporte de compressed-tensors `FP8_DYNAMIC`); también es cargable con `transformers`. No hay ficheros GGUF en el repositorio, por lo que llama.cpp y Ollama no están soportados de forma directa.
- **Parámetros de muestreo recomendados por Qwen**: `temperature=0.7`, `top_p=0.8`, `top_k=20`.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| axteam/Qwen3.5-2B-FP8-dynamic | 2,27B (denso) | No disponible | safetensors + compressed-tensors FP8 | Apache-2.0 | Multimodal con visión y cabeza MTP; PTQ sin calibración; ~3,0 GB en disco |
| Qwen/Qwen3.5-2B (base en BF16) | 2,27B (denso) | No disponible | safetensors BF16 | Apache-2.0 | Referencia de fidelidad; mayor huella de memoria (~4,5 GB de pesos) |
| Qwen3.5-9B FP8 dynamic (AETRON) | 9B (denso) | No disponible | compressed-tensors FP8 | No disponible | Generación Qwen3.5 de febrero de 2026; razonamiento, código y chat multilingüe; mayor coste de VRAM |
| RedHatAI/Qwen3.5-35B-A3B-FP8-dynamic | 35B totales, 3B activos (MoE) | No disponible | FP8 | No disponible | MoE con razonamiento, tool calling y capacidades VL mejoradas; requiere hardware muy superior |

La comparación se limita a los datos publicados en las fuentes consultadas; no hay cifras de benchmarks que permitan contrastar calidad entre estas variantes.

## Limitaciones y advertencias

- **Pérdida de fidelidad por cuantización**: +1,1% de perplejidad y 94,4% de acuerdo top-1 frente al BF16, medido sobre 100 prompts internos. En tareas de código, matemáticas o generación larga la degradación puede ser mayor que la que sugiere esa media.
- **Sin benchmarks de tareas publicados**: no hay datos de MMLU, HumanEval, GSM8K ni similares, ni del propio modelo base en esta ficha; cualquier decisión de producción debería validarse con una evaluación propia.
- **Riesgo de alucinación**: es un modelo de 2B, por lo que la tasa de afirmaciones incorrectas en dominios especializados es previsiblemente alta; no se documentan mitigaciones específicas.
- **Idiomas no especificados**: la model card no lista idiomas soportados y la evaluación interna se hizo en inglés y coreano. El rendimiento en castellano no está verificado.
- **Longitud de contexto no documentada**: no se puede asumir una ventana concreta; conviene consultar el `config.json` del modelo base antes de diseñar prompts largos.
- **Requisito de hardware para FP8**: en GPUs anteriores a Ada Lovelace el formato puede no ejecutarse de forma nativa, lo que invalida la ventaja de eficiencia.
- **Sin soporte GGUF**: no se puede usar con llama.cpp u Ollama sin convertir previamente los pesos.
- **Licencia**: Apache-2.0, permisiva para uso comercial, heredada del modelo base. Los pesos, el tokenizador y la plantilla de chat pertenecen al equipo Qwen; debe conservarse la atribución correspondiente.
- **Madurez del artefacto**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado en octubre de 2026; no hay historial de uso en producción ni issues públicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/Qwen3.5-2B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Cuantización comparable de la familia (RedHatAI): https://huggingface.co/RedHatAI/Qwen3.5-35B-A3B-FP8-dynamic
- Registro de Qwen3.5-9B FP8 dynamic (AETRON): https://app.aetron.io/en/registry/qwen3.5-9b-fp8
- Ficha de Qwen3.5-9B FP8 dynamic (ThinkLLM): https://thinkllm.dev/models/qwen3-5-9b-fp8-dynamic
- Documentación de FuriosaAI sobre despliegue de modelos Qwen3 en FP8: https://developer.furiosa.ai/v2026.5.0b0/en/furiosa_llm/models/qwen3.html

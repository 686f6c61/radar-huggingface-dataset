# liodon-ai/Phi-3-mini-4k-instruct-FP8

## Resumen

El modelo `liodon-ai/Phi-3-mini-4k-instruct-FP8` es una cuantización en precisión FP8 (punto flotante de 8 bits) del modelo `microsoft/Phi-3-mini-4k-instruct`, publicada por Liodon AI. El modelo original, desarrollado por Microsoft, es un transformer decoder-only de 3.800 millones de parámetros (3,8B) con una ventana de contexto de 4.096 tokens, entrenado con una combinación de datos sintéticos y contenido web filtrado, con especial énfasis en razonamiento y lógica. Esta versión cuantizada reduce el tamaño del modelo de 7,6 GB a 4,0 GB, lo que permite desplegarlo en GPUs con menos memoria y acelerar la inferencia, manteniendo en gran medida las capacidades del modelo original.

La cuantización utiliza el esquema `FP8_DYNAMIC` implementado con la librería `llm-compressor` de vLLM: los pesos se convierten a FP8 (formato E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Este esquema no requiere dataset de calibración, por lo que los pesos cuantizados son numéricamente una conversión directa de los originales, sin sesgo introducido por datos de calibración. La capa `lm_head` se deja sin cuantizar, práctica estándar para preservar la calidad de la salida.

La relevancia de este modelo radica en su capacidad para ejecutarse de forma eficiente en hardware moderno de NVIDIA (compute capability ≥ 8.9, es decir, GPUs Ada, Hopper y Blackwell), reduciendo el consumo de VRAM y mejorando el throughput en entornos de producción. Es una opción atractiva para desarrolladores que necesitan un modelo de razonamiento ligero con despliegue en vLLM, TGI o SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-3) |
| Parametros totales | 3.821.079.552 (3,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (heredada del modelo base) |
| Tipos de cuantizacion | FP8 (E4M3) dinamica: pesos por canal, activaciones por token |
| Idiomas soportados | No disponible (el modelo base esta orientado principalmente a ingles) |
| Licencia | other (el modelo base usa licencia MIT, pero esta cuantizacion no especifica una variante) |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo base `microsoft/Phi-3-mini-4k-instruct` es un transformer decoder-only con 3,8B parámetros, entrenado por Microsoft con un dataset que combina datos sintéticos generados internamente y contenido web filtrado, priorizando ejemplos densos en razonamiento. El entrenamiento incluyó fases de ajuste fino supervisado e instrucción, lo que le confiere capacidades conversacionales y de seguimiento de instrucciones. La variante 4K se refiere a la longitud de contexto de 4.096 tokens.

La cuantización FP8 realizada por Liodon AI no implica un nuevo entrenamiento, sino una conversión de precisión. Se empleó `llm-compressor` con el esquema `FP8_DYNAMIC`: los pesos se convierten a FP8 (E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Este esquema no requiere dataset de calibración, lo que evita cualquier sesgo derivado de datos de calibración. La capa `lm_head` se mantiene en precisión original (probablemente BF16) para no degradar la calidad de la generación. El resultado es un modelo de 4,0 GB frente a los 7,6 GB del original, una reducción de aproximadamente el 47%.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas del modelo base.
- Razonamiento lógico y matemático: el modelo base destaca en tareas de aritmética, lógica y resolución de problemas.
- Generación de código: el modelo base tiene capacidades básicas de programación, aunque no es su punto fuerte.
- Soporte de tool calling / function calling: no se especifica en la información disponible; el modelo base tiene cierto soporte, pero no está confirmado en esta cuantización.
- Capacidades multilingües: limitadas; el modelo base está entrenado principalmente en inglés, aunque puede generar texto en otros idiomas con menor calidad.
- Modo de razonamiento extendido: no disponible; el modelo base no incluye un modo "thinking" explícito.
- No incluye capacidades de visión ni audio; es exclusivamente texto.

## Casos de uso

- Despliegue de asistentes conversacionales en producción: gracias a su tamaño reducido (4,0 GB) y compatibilidad con vLLM, TGI y SGLang, puede servir chatbots de baja latencia en GPUs como RTX 4090 o L4, manejando múltiples peticiones concurrentes.
- Razonamiento matemático y lógico en aplicaciones educativas: el modelo base tiene buen rendimiento en problemas de matemáticas y lógica, por lo que puede integrarse en tutores automáticos o generadores de ejercicios.
- Generación de código en entornos con recursos limitados: aunque no es un modelo especializado en código, puede asistir en tareas de programación simples, y su bajo consumo de VRAM permite ejecutarlo en GPUs consumer.
- Procesamiento por lotes de texto: su alta velocidad de inferencia en FP8 (en hardware compatible) lo hace adecuado para tareas de clasificación, extracción de información o resumen en pipelines de datos.
- Prototipado rápido de aplicaciones LLM: al ser una cuantización ligera, permite iterar rápidamente en entornos de desarrollo sin necesidad de GPUs de gama alta.
- Inferencia en edge con GPUs de consumo: con 4,0 GB de pesos, cabe en GPUs con 8 GB de VRAM (por ejemplo, RTX 4060) si se usa FP8 nativo, habilitando aplicaciones locales de asistencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. El modelo base `microsoft/Phi-3-mini-4k-instruct` cuenta con benchmarks publicados por Microsoft (como MMLU, HumanEval, GSM8K), pero no se incluyen en esta ficha al no estar disponibles en los datos proporcionados. Se recomienda consultar la documentación oficial del modelo base para obtener métricas de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan 4,0 GB; considerando activaciones, KV cache y overhead, se estima un consumo total de 5-7 GB para contexto de 4K tokens.
- GPU recomendadas: NVIDIA con compute capability ≥ 8.9 (Ada, Hopper, Blackwell), como RTX 40-series, L4, L40S, H100, H200, B100, B200. En estas GPUs se aprovecha la ejecución FP8 nativa.
- En GPUs más antiguas (Ampere, Turing, Volta), vLLM/TGI dequantizarán los pesos a FP16/BF16, perdiendo la ventaja de memoria y velocidad, aunque el modelo seguirá funcionando.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/Phi-3-mini-4k-instruct-FP8`), TGI (vía Docker), SGLang (`python -m sglang.launch_server --model-path ...`). También es compatible con la librería `transformers` de HuggingFace.
- Latencia y throughput: no disponible en la información proporcionada; dependerá del hardware y la configuración de despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| microsoft/Phi-3-mini-4k-instruct (base) | 3,8B | 4.096 | 7,6 GB (BF16) | MIT | safetensors |
| liodon-ai/Phi-3-mini-4k-instruct-FP8 (este) | 3,8B | 4.096 | 4,0 GB (FP8) | other | safetensors |
| liodon-ai/Phi-3-mini-4k-instruct-imatrix-GGUF | 3,8B | 4.096 | No disponible | No disponible | GGUF |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de otras alternativas de la misma categoría (por ejemplo, Llama-3.2-3B o Qwen2.5-3B) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir una ligera degradación de la calidad en comparación con el modelo en BF16, aunque el esquema dinámico sin calibración minimiza este efecto. No se han publicado métricas que cuantifiquen esta pérdida.
- El modelo base tiene una ventana de contexto limitada a 4.096 tokens, lo que restringe su uso en tareas que requieran contexto largo.
- La licencia se indica como "other"; aunque el modelo base es MIT, esta cuantización no especifica los términos exactos, por lo que se recomienda verificar antes de un uso comercial.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los LLM; la cuantización no corrige estos problemas.
- Para aprovechar la ventaja de FP8 se requiere hardware NVIDIA con compute capability ≥ 8.9; en GPUs más antiguas el modelo funcionará pero sin los beneficios de memoria y velocidad.
- No se dispone de información sobre el rendimiento en tareas específicas de esta cuantización; se recomienda realizar pruebas propias antes de desplegarla en producción.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/liodon-ai/Phi-3-mini-4k-instruct-FP8
- Modelo base en HuggingFace: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
- Repositorio del modelo base (GitHub): https://github.com/ttlmtang123/Phi-3-mini-4k-instruct
- Página de NVIDIA NIM para Phi-3-mini-4k: https://build.nvidia.com/microsoft/phi-3-mini-4k

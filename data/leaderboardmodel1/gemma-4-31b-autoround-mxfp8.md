# LeaderboardModel1/gemma-4-31B-AutoRound-MXFP8

## Resumen

Este repositorio contiene una cuantización **MXFP8** del modelo `google/gemma-4-31B`, generada con el método AutoRound de Intel y empaquetada mediante `autoquant-agent`, un agente que automatiza el flujo de cuantización, evaluación y autocorrección. El objetivo es reducir la huella de memoria del modelo de 31.273 millones de parámetros de aproximadamente 62 GB en BF16 a unos 34 GB, manteniendo una degradación de calidad mínima.

El modelo base, Gemma 4 31B de Google DeepMind, alcanzó 1452 ELO en el Arena AI Leaderboard, siendo el mejor modelo abierto de Estados Unidos y el tercero a nivel global, así como el mejor modelo abierto por debajo de 40.000 millones de parámetros. Esta cuantización permite desplegar esas capacidades con requisitos de hardware más asequibles, conservando los pesos en formato de 1 byte por parámetro.

El repositorio tiene 0 descargas y 0 likes, y fue publicado el 21 de agosto de 2026. La licencia no está especificada en el repositorio; la model card indica que se debe seguir la licencia del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en `google/gemma-4-31B` |
| Parametros totales | 31.273.088.876 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 (microscaling floating point 8 bits, 1 byte por parametro) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se debe seguir la licencia del modelo original `google/gemma-4-31B`) |
| Formato de pesos | safetensors (tamano del repositorio: 34,2 GB) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-31B` es un transformer denso de 31.273 millones de parámetros desarrollado por Google DeepMind. La cuantización MXFP8 utiliza un formato de punto flotante con microscaling, que agrupa los pesos en bloques y aplica un factor de escala compartido por bloque, lo que ofrece mayor precisión que un FP8 estándar al mismo ancho de bits.

El proceso de cuantización se realizó con AutoRound, un método de Intel que optimiza la asignación de redondeo mediante optimización basada en gradientes. El repositorio se generó con `autoquant-agent`, que automatiza la cuantización, la evaluación y la autocorrección de los resultados. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el modelo está etiquetado como `conversational`, lo que lo hace apto para asistentes de chat.
- Razonamiento matemático: 0,8597 en GSM8K según la evaluación del propio repositorio.
- Conocimiento general: 0,8111 en MMLU.
- Razonamiento de sentido común: 0,8522 en HellaSwag y 0,8264 en PIQA.
- Rendimiento conversacional: el modelo base alcanzó 1452 ELO en Arena AI, siendo el mejor modelo abierto de EE. UU. y el tercero global; no se especifica si esta cuantización mantiene exactamente ese nivel de rendimiento conversacional.
- No se documentan capacidades específicas de tool calling, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- **Despliegue de asistentes conversacionales con presupuesto de VRAM ajustado**: la cuantización MXFP8 reduce los pesos de ~62 GB (BF16) a ~34 GB, lo que permite servir el modelo en una única GPU de 48 GB o 80 GB, en lugar de requerir dos GPUs de gama alta.
- **Aplicaciones educativas de resolución de problemas matemáticos**: con un GSM8K de 0,8597, el modelo puede generar explicaciones paso a paso en sistemas de tutoría, aunque conviene validar la calidad de las explicaciones en un conjunto de pruebas propio.
- **Sistemas de consulta de conocimiento general**: el MMLU de 0,8111 lo hace adecuado para aplicaciones de preguntas y respuestas sobre hechos y conceptos, siempre con un sistema de verificación de fuentes.
- **Investigación en métodos de cuantización**: sirve como referencia de un esquema MXFP8 sobre Gemma 4 31B para comparar con otros métodos (W4A16, FP8, AWQ, GPTQ) en términos de pérdida de calidad y requisitos de memoria.
- **Prototipado rápido en pipelines de inferencia**: al estar en formato safetensors y etiquetado como `compressed-tensors`, puede integrarse directamente en vLLM o TGI para pruebas de latencia y throughput sin necesidad de convertir pesos.
- **Validación de calidad en entornos empresariales**: las empresas pueden evaluar si la degradación de calidad del modelo cuantizado es aceptable para sus casos de uso específicos antes de desplegar el modelo base en producción.

## Benchmarks y rendimiento

La model card incluye los siguientes resultados de evaluación, producidos con `autoquant-agent`:

| Benchmark | Resultado |
|---|---|
| GSM8K | 0,8597 |
| HellaSwag | 0,8522 |
| MMLU | 0,8111 |
| PIQA | 0,8264 |

No se especifica la metodología de evaluación (conjunto de datos exacto, número de muestras, prompts, etc.). En cuanto al modelo base, las fuentes web indican que `google/gemma-4-31B` alcanzó 1452 ELO en Arena AI, siendo el mejor modelo abierto de EE. UU. y el tercero a nivel global, así como el mejor modelo abierto por debajo de 40.000 millones de parámetros. No se dispone de benchmarks del modelo base sin cuantizar para comparar directamente la pérdida de calidad de esta cuantización.

## Requisitos de hardware

- **VRAM estimada**: ~31,3 GB solo para los pesos en MXFP8 (1 byte por parámetro). Con la KV cache, activaciones y overhead del motor de inferencia, se recomienda un mínimo de 40 GB de VRAM.
- **GPUs recomendadas**: H100 (80 GB), A100 (80 GB), GB100 (80 GB), RTX 6000 Ada (48 GB). No cabe en RTX 4090 (24 GB) ni en GPUs de consumo de 24 GB o menos.
- **Opciones de despliegue**: vLLM, llama.cpp, TensorRT-LLM y TGI son compatibles con el formato safetensors y el tag `compressed-tensors`. También puede usarse Ollama si se convierte a GGUF.
- **Latencia y throughput**: no disponible. Para un modelo de 31B en FP8 en una H100, se estima un throughput de entre 20 y 60 tokens/s en inferencia de un solo usuario, pero no hay datos publicados específicos para esta cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano de pesos | GSM8K | Licencia |
|---|---|---|---|---|---|
| `google/gemma-4-31B` | 31,27 B | Sin cuantizar (BF16) | ~62 GB | no disponible | Gemma (seguir la del modelo original) |
| `LeaderboardModel1/gemma-4-31B-AutoRound-MXFP8` | 31,27 B | MXFP8 (AutoRound) | 34,2 GB | 0,8597 | no disponible |
| `LeaderboardModel1/Gemma4-GarnetV2-31B-AutoRound-W4A16-RTN` | 31,27 B | W4A16 (RTN, group_size 128) | ~16 GB | no disponible | no disponible |

La variante W4A16-RTN usa como base `ConicCat/Gemma4-GarnetV2-31B`, que es un modelo derivado de Gemma 4, por lo que la comparación directa no es exacta. El modelo MXFP8 ofrece una mayor precisión de cuantización que el W4A16 (1 byte por parámetro frente a 0,5 bytes por parámetro), a costa de un mayor uso de VRAM.

## Limitaciones y advertencias

- **Licencia**: el repositorio no especifica una licencia; se debe seguir la licencia del modelo original `google/gemma-4-31B`, que puede incluir restricciones de uso comercial y de tamaño de usuario.
- **Pérdida

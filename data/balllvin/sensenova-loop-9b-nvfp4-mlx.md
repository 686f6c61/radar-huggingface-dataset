# balllvin/SenseNova-Loop-9B-NVFP4-MLX

## Resumen

SenseNova-Loop-9B-NVFP4-MLX es una conversión comunitaria del modelo SenseNova-Loop-9B al formato MLX en cuantización afín de 4 bits, pensada para ejecución en Apple Silicon. El autor, balllvin, parte de los pesos NVFP4 generados mediante quantisation-aware distillation (QAD) sobre el checkpoint base de SenseNova y los reempaqueta en MLX con grupo de 64, produciendo un repositorio de 8,0 GB. No es un modelo nuevo: es una build de inferencia del modelo base, con el plan de ejecución "looped" (56 visitas sobre 32 capas físicas) y los routers mHC portados al runtime de MLX.

El interés práctico está en que permite correr un modelo de la familia SenseNova-Loop en Macs con memoria unificada sin depender de CUDA ni de GPUs dedicadas. El repositorio incluye herramientas de servicio (`tools/serve.py`) con streaming SSE, selección de número de loops, cabeza de salida en 8 bits y KV cache configurable (bf16 u 8 bits). La licencia es Apache-2.0, heredada del modelo base.

Conviene subrayar que esta build no ha sido evaluada de forma independiente en rechazos ni en MMLU: las métricas de seguridad y calidad publicadas corresponden al checkpoint NVFP4 de origen, no a esta conversión MLX. Además, el checkpoint base está restringido (gated) en Hugging Face y requiere aceptar sus términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con ejecución "looped" (56 visitas de 32 capas físicas) y routers mHC; pesos en MLX |
| Parametros totales | 3.119.461.248 (según safetensors del repo); el nombre comercial indica 9B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín MLX (group size 64); routers, norms y embeddings en bf16; LM head bf16 en pesos y 8 bits en serving por defecto; KV cache bf16 u 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx`, código custom (`sensenova_loop`) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura transformer con un esquema de ejecución recurrente: 32 capas físicas que se recorren 56 veces según un plan de loops, con routers mHC (multi-head routing) que gobiernan el flujo entre visitas. Esta build MLX porta tanto el plan de ejecución como los routers al runtime de MLX, manteniendo routers, normalizaciones y embeddings en bf16 para preservar precisión, y cuantizando el resto del cuerpo a 4 bits afín con grupo de 64.

El proceso de conversión parte de los pesos NVFP4 del repositorio `balllvin/SenseNova-Loop-9B-NVFP4`, que a su vez derivan de un pipeline de quantisation-aware distillation (QAD) sobre el checkpoint `sensenova/SenseNova-Loop-9B`. El corpus citado para el QAD es FineWeb-Edu. No se dispone de información sobre el número de tokens de entrenamiento del modelo original, la composición completa del dataset ni si hubo etapas de RLHF o DPO. La model card tampoco detalla innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y continuación de texto, según el pipeline declarado (`text-generation`, `conversational`).
- Ejecución con número de loops configurable (`--loops`), lo que permite intercambiar latencia por fidelidad al modelo entrenado; el autor advierte que `--loops 1` es más rápido pero no corresponde al modelo entrenado.
- Servicio HTTP con streaming SSE mediante `tools/serve.py`, con precalentamiento de formas de 1, 8, 32 y 128 tokens.
- Procesamiento por lotes con KV cache en bf16 para batches y 8 bits para un único stream.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: desarrolladores que trabajan en Macs con memoria unificada pueden servir el modelo con `tools/serve.py` sin GPU dedicada, aprovechando los 8,0 GB de pesos en 4 bits.
- Prototipado de aplicaciones conversacionales: el servidor incluido renderiza la lista completa de mensajes y soporta SSE, lo que facilita integrar el modelo en interfaces de chat con streaming.
- Evaluación de arquitecturas recurrentes: investigadores interesados en el esquema looped de 56 visitas sobre 32 capas pueden experimentar con `--loops` para estudiar el equilibrio entre coste computacional y calidad.
- Despliegue por lotes en un solo equipo: con KV en bf16 y `--max-batch` configurable, el modelo alcanza 38,1 tok/s agregados con 8 streams en un M5 Pro de 64 GB, útil para tareas de generación masiva no interactivas.
- Investigación sobre cuantización: la comparación de NLL entre KV bf16, 8 bits y 4 bits (3,5819 / 3,5828 / 3,5652) sirve como referencia para estudiar el impacto de la precisión del cache en la calidad de salida.
- Base para builds derivadas: este repositorio es el punto de partida de la familia MLX del autor (incluida la variante abliterated + Arete), por lo que sirve como referencia para quien quiera reproducir o extender el pipeline de conversión.
- Experimentación con seguridad y alineamiento: al no estar ajustado en seguridad, permite estudiar el comportamiento de rechazo del checkpoint QAD de origen (95 de 99 prompts dañinos y 60 de 100 benignos rechazados en la fuente NVFP4) en un runtime distinto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K) para esta conversión MLX en la información disponible. El autor indica explícitamente que esta build no fue evaluada por separado en rechazos ni en MMLU.

Rendimiento de velocidad medido en el build original (M5 Pro, 64 GB, 48 tokens de salida, warm, KV 8 bits para un stream y bf16 para batches):

| Streams | Total tok/s | Por stream tok/s |
|---|---:|---:|
| 1 | 8,1 | 8,1 |
| 2 | 14,1 | 7,0 |
| 4 | 25,9 | 6,5 |
| 8 | 38,1 | 4,8 |

Calidad de KV sobre una ventana de 48 tokens con teacher forcing: NLL bf16 3,5819; 8 bits 3,5828 (+0,0009); 4 bits 3,5652 (-0,0167). El texto greedy es idéntico en las tres configuraciones.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 8,0 GB en 4 bits; el repositorio completo pesa 8,0 GB. Hay que sumar la KV cache y el overhead del runtime MLX.
- Hardware objetivo: Apple Silicon con memoria unificada. Las mediciones del autor se hicieron en un M5 Pro con 64 GB.
- GPU NVIDIA: no aplica de forma nativa; MLX está diseñado para Apple Silicon. Para CUDA habría que recurrir a las builds NVFP4 del mismo autor.
- ¿Cabe en GPU de consumo? No disponible para el ecosistema NVIDIA en esta build. En Apple Silicon, sí cabe en equipos con memoria unificada suficiente (el autor usa 64 GB, aunque el peso de 8,0 GB sugiere que configuraciones menores podrían ser viables; no se confirma en la información).
- Despliegue: `tools/serve.py` del repositorio, con parámetros `--kv-bits`, `--max-batch`, `--loops` y `--head-bits`. El servidor se apaga tras 30 minutos de inactividad por defecto. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 8,1 tok/s con un stream y 38,1 tok/s agregados con 8 streams en M5 Pro de 64 GB (build original, no remedido para esta conversión).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| balllvin/SenseNova-Loop-9B-NVFP4-MLX (este) | 3,12B en safetensors (nombre comercial 9B) | no disponible | 4 bits MLX afín, grupo 64 | Apache-2.0 | MLX (Apple Silicon) |
| balllvin/SenseNova-Loop-9B-NVFP4 | no disponible | no disponible | NVFP4 (QAD) | Apache-2.0 | CUDA / NVFP4 |
| balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4-MLX | no disponible | no disponible | 4 bits MLX afín | Apache-2.0 | MLX (Apple Silicon) |
| sensenova/SenseNova-Loop-9B (base) | no disponible | no disponible | pesos completos | Apache-2.0 | no disponible |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada. La diferencia principal entre ellas es el runtime (MLX frente a NVFP4/CUDA) y las etapas de post-procesado (abliteration y Arete en la variante homónima).

## Limitaciones y advertencias

- No es un modelo ajustado en seguridad: se trata del checkpoint QAD base, no de una versión alineada. El autor señala que la fuente NVFP4 rechaza 95 de 99 prompts dañinos y 60 de 100 benignos, pero esta conversión MLX no fue evaluada por separado.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo de 3,12B parámetros en safetensors (pese al nombre comercial de 9B), la capacidad de razonamiento y factualidad puede ser limitada.
- Idiomas soportados: no disponibles; no se puede garantizar calidad fuera del inglés sin evaluación.
- Longitud de contexto: no disponible; planificar el despliegue sin asumir una ventana concreta.
- Las métricas de velocidad corresponden al build original y no fueron remedidas para esta conversión base; el autor lo advierte explícitamente.
- `--loops 1` es más rápido pero no corresponde al modelo entrenado; usar valores distintos del plan original altera el comportamiento.
- El checkpoint base `sensenova/SenseNova-Loop-9B` está restringido en Hugging Face: hay que aceptar sus términos antes de usar esta build derivada.
- Build comunitaria independiente, sin afiliación con los autores del modelo original; el soporte y las garantías de calidad recaen en el autor de la conversión.
- Licencia Apache-2.0: permite uso comercial, pero al ser una versión no alineada en seguridad, el despliegue en producción requiere filtros y evaluaciones adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/balllvin/SenseNova-Loop-9B-NVFP4-MLX
- Build NVFP4 base: https://huggingface.co/balllvin/SenseNova-Loop-9B-NVFP4
- Build abliterated NVFP4: https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-NVFP4
- Build abliterated + Arete NVFP4: https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4
- Build abliterated + Arete MLX 4 bits: https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4-MLX
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- JailbreakBench: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- AdvBench: https://github.com/llm-attacks/llm-attacks
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0

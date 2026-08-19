# gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090-DSpark

## Resumen

`gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090-DSpark` es un modelo borrador (draft model) diseñado para decodificación especulativa, entrenado específicamente contra el checkpoint cuantizado NVFP4 de Qwen3.8-27B publicado por el mismo hub. Su función es acelerar la inferencia del modelo principal en una GPU RTX 5090 de 32 GB, generando secuencias de tokens candidatos que el modelo objetivo verifica posteriormente. A diferencia del borrador DSpark estándar de RadixArk, que se entrenó contra el checkpoint FP8, esta versión se ha ajustado a la distribución de salida del checkpoint NVFP4, lo que mejora la tasa de aceptación y el throughput.

El modelo utiliza una arquitectura híbrida Qwen3DSparkModel con 5 capas de atención completa, un tamaño de 1.359.284.737 parámetros (aproximadamente 1,36 mil millones) y pesa 2,72 GB en precisión BF16. En una RTX 5090, junto con el target NVFP4, alcanza 141,99 tokens por segundo con una longitud de aceptación media de 2,72, lo que supone un incremento del 74% respecto a la inferencia sin especulación. Está pensado para entornos de despliegue con una sola GPU consumer, donde la latencia y el throughput son críticos.

La relevancia de este modelo radica en que demuestra cómo la decodificación especulativa puede adaptarse a cuantizaciones específicas (NVFP4) para maximizar el rendimiento en hardware de gama alta de consumo, sin sacrificar la calidad de las salidas, ya que el target verifica cada token con un umbral de aceptación estricto. Su licencia Apache 2.0 permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3DSparkModel (híbrida: 5 capas full-attention + capas Mamba/SSM) |
| Parametros totales | 1.359.284.737 (~1,36 B) |
| Parametros activos | Todos (no es MoE) |
| Longitud de contexto | No disponible (depende del target; el target soporta 262K nativo, pero con especulación se limita a 64K) |
| Tipos de cuantizacion | BF16 (pesos del borrador); el target usa NVFP4 (W4A4) |
| Idiomas soportados | No disponible (hereda los del modelo base Qwen3.8-27B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un borrador para decodificación especulativa basado en la arquitectura DSpark, que combina atención completa con capas Mamba/SSM. Según la model card, la arquitectura es `Qwen3DSparkModel` con 5 capas de atención completa, hidden size 5120, 40 cabezas de atención, 8 cabezas KV, dimensión intermedia 10240, tamaño de bloque (gamma) 7, capas auxiliares del target en `[4, 16, 28, 40, 52]`, y una cabeza de Markov de rango 256 con cabecera de confianza activada. La precisión es BF16 y el peso total es de 2,72 GB.

El entrenamiento se realizó específicamente contra el checkpoint NVFP4 `gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090`, no contra el FP8 original. Esto es clave porque la decodificación especulativa funciona mejor cuando el borrador replica la distribución de salida del modelo objetivo. Los detalles del dataset de entrenamiento, el número de tokens y el método de optimización (RLHF, DPO, etc.) no se han publicado en la información disponible. La model card menciona que se trata del primer release orientado a NVFP4 y que una v2 explorará características auxiliares de capas tardías y un corpus on-policy más amplio.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa, optimizada para el target NVFP4 de Qwen3.8-27B.
- Aceleración de inferencia en tareas de matemáticas, código, tool calling, chat, instrucciones y contexto largo, según los benchmarks publicados.
- Compatibilidad con el runtime SGLang mediante el algoritmo DSPARK y bloques de tamaño 7.
- Soporte para verificación estricta de tokens (umbral de aceptación 1.0, sin rejection sampling), lo que garantiza que las salidas finales son idénticas a las del target sin especulación.
- No es un modelo autónomo: no genera respuestas por sí mismo, sino que actúa como acelerador del modelo principal.

## Casos de uso

- Despliegue de un asistente conversacional en una RTX 5090: el borrador acelera la generación de respuestas en chat, alcanzando 123,8 tok/s frente a 81,58 sin especulación, mejorando la experiencia de usuario en interacciones multi-turno.
- Generación de código en producción: con 181,6 tok/s y una mejora del 23,5% en aceptación respecto al borrador estándar, es adecuado para integrarse en entornos de desarrollo asistido por IA donde la latencia importa.
- Razonamiento matemático: alcanza 203,4 tok/s, lo que permite resolver problemas matemáticos complejos con mayor rapidez en aplicaciones educativas o de análisis.
- Tool calling y agentes: el target soporta tool calling y el borrador mantiene una tasa de aceptación de 2,65, facilitando pipelines de agentes que requieren múltiples llamadas a herramientas.
- Procesamiento de instrucciones largas: con 116,8 tok/s en el dominio de instrucciones, es útil para tareas de summarización o transformación de documentos extensos.
- Servicio de inferencia de baja latencia en entornos edge con una sola GPU: el borrador permite servir un modelo de 27B en una GPU consumer con un throughput hasta un 74% mayor, reduciendo costes de hardware.

## Benchmarks y rendimiento

Los resultados se obtuvieron en una RTX 5090 de 32 GB, con concurrencia 1, contexto 64K, KV en FP8 y 240 prompts held-out (40 por dominio), con greedy decoding y pensamiento desactivado. La comparativa entre perfiles es la siguiente:

| Perfil | tok/s | Longitud de aceptación | Tamaño del borrador |
|---|---|---|---|
| **Este modelo (NVFP4-targeted)** | **141,99** | 2,72 | 2,72 GB |
| RadixArk DSpark (FP8-trained) | 139,35 | 2,42 | 2,72 GB |
| Cabecera MTP integrada | 136,90 | 2,76 | 5,53 GB |
| Sin especulación | 81,58 | — | — |

Rendimiento por dominio (este modelo):

| Dominio | tok/s | Aceptación | vs borrador estándar |
|---|---|---|---|
| Matemáticas | 203,4 | 3,625 | +5,8% |
| Código | 181,6 | 3,150 | +23,5% |
| Tool calling | 152,8 | 2,650 | +3,9% |
| Chat | 123,8 | 1,975 | +25,4% |
| Contexto largo | 122,7 | 2,275 | −2,2% |
| Instrucciones | 116,8 | 2,625 | +25,0% |

La model card advierte que la ganancia de throughput del +1,9% sobre el borrador estándar es direccional, mientras que la mejora de aceptación (+12,2%) es más robusta.

## Requisitos de hardware

- GPU probada: NVIDIA RTX 5090 con 32 GB de VRAM.
- VRAM estimada: el borrador ocupa 2,72 GB, el target NVFP4 unos 18,8 GB, más caché de estado Mamba (~147 MB por request, con 4 slots) y buffers. En total, el sistema requiere al menos 32 GB para funcionar con especulación.
- Con especulación activa, el sistema limita a `max_running_requests = 1` y contexto máximo de 64K (no los 262K nativos del target). Para concurrencia o contexto completo, hay que desactivar la especulación.
- Opciones de despliegue: SGLang con la imagen Docker `lmsysorg/sglang:qwen38-27b` (build específico para Qwen3.8). No se mencionan otros runtimes como vLLM o llama.cpp.
- Latencia: en las pruebas, el throughput alcanza 141,99 tok/s con una sola request y contexto 64K; la latencia por token es de aproximadamente 7 ms (1/141,99).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| **Qwen3.8-27B-NVFP4-RTX5090-DSpark** (este) | 1,36 B (borrador) | No aplica (depende del target) | Apache 2.0 | Borrador para decodificación especulativa contra NVFP4 |
| RadixArk/Qwen3.8-27B-DSpark | 1,36 B (borrador) | No aplica | Apache 2.0 | Borrador estándar entrenado contra FP8 |
| Cabecera MTP integrada del target | ~2,7 B (estimado) | No aplica | Apache 2.0 | Cabecera multi-token del propio Qwen3.8-27B |

El modelo se diferencia del borrador RadixArk en que está afinado para el checkpoint NVFP4, logrando una aceptación mayor (2,72 vs 2,42) y un throughput ligeramente superior. Frente a la cabecera MTP, ofrece la misma aceptación (2,72 vs 2,76) pero con un peso mucho menor (2,72 GB vs 5,53 GB), lo que reduce el coste por bloque generado.

## Limitaciones y advertencias

- Es un borrador específico para el target `gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090`; no funcionará correctamente con otros checkpoints de Qwen3.8-27B (por ejemplo, FP8 o BF16).
- En una RTX 5090 de 32 GB, la especulación limita el despliegue a una sola request concurrente y a un contexto máximo de 64K. Para servir múltiples usuarios o usar los 262K de contexto, hay que ejecutar el target sin especulación.
- La ganancia de throughput frente al borrador estándar es pequeña (+1,9%) y se considera direccional; la mejora de aceptación es el dato más fiable.
- No se han publicado datos sobre sesgos, alucinaciones o calidad de las respuestas, ya que el modelo no genera contenido por sí mismo; esas propiedades dependen del target.
- El runtime SGLang requerido es un build específico (`lmsysorg/sglang:qwen38-27b`) que puede no estar disponible en todas las plataformas; se recomienda fijar la versión de la imagen.
- La memoria de estado Mamba requiere `--mamba-ssm-dtype bfloat16` obligatoriamente en 32 GB; sin esta opción, el servidor no arranca.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090-DSpark
- Target asociado: https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090
- Modelo base del borrador: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Ficha del target en LLM Explorer: https://llm-explorer.com/model/gittensor-model-hub%2FQwen3.8-27B-NVFP4-RTX5090,3GTDSJKETUAS2CtkUTm8Er
- Análisis del target en HF Viewer: https://hfviewer.com/gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090
- Despliegue Docker del target en RTX 5090: https://github.com/devbauerflorian/qwen3.8-27b-rtx5090

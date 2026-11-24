# sairaph-official/DeepSeek-R1-Distill-Qwen-7B-5729fc2

## Resumen

DeepSeek-R1-Distill-Qwen-7B en formato LiteRT-LM es una conversión del modelo destilado de razonamiento de DeepSeek (7B parámetros, base Qwen2.5) al formato `.litertlm` de Google, pensada para inferencia en dispositivo (on-device) y en el borde. El modelo original, desarrollado por DeepSeek, destila las capacidades de razonamiento de DeepSeek-R1 en una base Qwen2.5 de 7B parámetros, y emite una cadena de pensamiento `<think> … </think>` antes de la respuesta final. Esta ficha concreta corresponde a un espejo (mirror) no modificado del repositorio `litert-community/DeepSeek-R1-Distill-Qwen-7B`, alojado por `sairaph-official` para su aplicación LLM Server, con pesos cuantizados a int4 por bloques.

La relevancia de esta variante es que permite ejecutar un modelo de razonamiento de 7B en hardware de consumo y móvil de gama alta sin GPU dedicada, mediante el runtime LiteRT-LM (el antiguo TensorFlow Lite renombrado). El archivo incluye una única cuantización int4 con bloque 32 y clipping óptimo OCTAV, embeddings en INT8 y una caché KV de 4096 tokens, con un tamaño de 4,53 GB. En un Galaxy S26 alcanza 8,6 tok/s de decodificación en GPU y 8,4 tok/s en CPU; en un Mac Studio M4 Max llega a 79,1 tok/s en GPU.

El modelo conserva la licencia MIT del modelo base y no añade restricciones adicionales por parte del espejo. Está pensado para escenarios de razonamiento ligero en local: asistentes sin conexión, análisis de texto en el dispositivo y prototipos de agentes con tool calling, siempre dentro de un contexto limitado a 4096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen2.5), destilado de DeepSeek-R1 |
| Parametros totales | 7B (aproximado, segun modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (cache KV del archivo `.litertlm`) |
| Tipos de cuantizacion | int4 por bloques (bloque 32) con OCTAV optimal-clipping, simetrica; embeddings INT8; computo entero |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); un unico archivo de 4.533.698.560 bytes |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 7B parámetros basado en Qwen2.5, sobre el que DeepSeek aplicó destilación a partir de DeepSeek-R1, un modelo de razonamiento entrenado con refuerzo. El resultado es un modelo que genera una cadena de razonamiento explícita entre las etiquetas `<think>` y `</think>` antes de producir la respuesta final, lo que permite inspeccionar el proceso de razonamiento. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas exactas de RLHF/DPO del destilado.

La conversión a LiteRT-LM se realizó con la herramienta oficial `litert-torch` (antes `ai-edge-torch`), sin forks ni código personalizado. La cuantización aplicada es int4 por bloques de 32 con clipping óptimo OCTAV y embeddings en INT8, con cómputo entero. El grafo de prefill/decode fue reescrito el 2026-10-06: las dos escrituras dinámicas de caché KV por capa se fusionaron en un compuesto `odml.cache_update` y los productos de atención `BATCH_MATMUL` pasaron a `odml.runtime_bmm`, además de añadirse una firma `prefill_16` que comparte buffers de pesos con `prefill_128`. En CPU, `prefill_16` produce salidas idénticas bit a bit a `prefill_128` sobre los mismos tokens.

## Capacidades

- Generación de texto con razonamiento explícito en modo *thinking*: emite una cadena `<think> … </think>` antes de la respuesta.
- Razonamiento matemático y de sentido común, derivado de la destilación de DeepSeek-R1.
- Generación de código y resolución de problemas de programación.
- Inferencia en dispositivo (on-device) y en el borde, sin necesidad de servidor.
- Ejecución en WebGPU mediante la demo web oficial de LiteRT-LM.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el modo thinking permite cadenas de razonamiento, pero no se documenta integración de agentes.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles (modelo solo de texto).

## Casos de uso

- Asistentes de razonamiento sin conexión en móvil de gama alta: el modelo puede ejecutarse en un Galaxy S26 con 8,6 tok/s en GPU y 8,4 tok/s en CPU, adecuado para consultas puntuales que requieran razonamiento paso a paso sin enviar datos a la nube.
- Análisis de texto en el dispositivo con privacidad: al ejecutarse localmente con una caché KV de 4096 tokens, permite procesar documentos cortos o conversaciones sin exponer datos a servicios externos.
- Prototipado de razonamiento matemático en el borde: útil para verificar cálculos y explicar el proceso mediante la cadena `<think>`, con un rendimiento medido de 28/30 en 30 preguntas de GSM8K (greedy, max 2048 tokens) en el archivo actualizado.
- Demos web interactivas: la demo oficial de LiteRT-LM carga el archivo de 4,53 GB y lo ejecuta con WebGPU en el navegador, útil para evaluar el modelo sin instalación local.
- Evaluación comparativa de runtimes en hardware de consumo: sirve como referencia para medir latencia y throughput de LiteRT-LM frente a otras implementaciones en Mac, Android y Raspberry Pi 5.
- Educación e investigación sobre destilación y razonamiento: permite estudiar el comportamiento de un modelo destilado de R1 en un entorno de recursos limitados, inspeccionando las cadenas de pensamiento generadas.

## Benchmarks y rendimiento

Datos medidos en dispositivo recogidos en la model card (no son benchmarks estándar de literatura, sino pruebas de rendimiento y una evaluación reducida):

| Prueba | Resultado |
|---|---|
| GSM8K (30 preguntas, greedy, max 2048 tokens), archivo actualizado | 28/30 |
| GSM8K (30 preguntas, greedy, max 2048 tokens), archivo anterior | 27/30 (McNemar p = 1.0) |
| Sanity check (8 preguntas) | 8/8 en ambos archivos |
| Galaxy S26, LiteRT-LM prebuilt-adac974b, GPU: decode / prefill / TTFT | 8,6 tok/s / 88 tok/s / 11,75 s |
| Galaxy S26, LiteRT-LM prebuilt-adac974b, CPU: decode / prefill / TTFT | 8,4 tok/s / 33 tok/s / 30,99 s |
| Mac Studio M4 Max, LiteRT-LM 0.17.1, GPU: decode / prefill / TTFT | 79,1 tok/s / 675 tok/s / 393 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo `.litertlm` ocupa 4,53 GB; se requiere al menos ese espacio más el overhead del runtime. La model card indica que encaja en Android de gama alta con 12 GB o más de RAM, y que no cabe en iPhone ni en teléfonos de 8 GB (el archivo de 4 GB excede el presupuesto).
- GPU recomendadas: no se especifican modelos de GPU de escritorio; las mediciones se hicieron en Mac Studio M4 Max (GPU integrada) y Galaxy S26 (GPU móvil).
- ¿Cabe en GPU de consumo? No hay datos para RTX 4090 u otras GPU de consumo en la información proporcionada.
- Opciones de despliegue: LiteRT-LM (runtime oficial), demo web con WebGPU, y la aplicación LLM Server de Sairaph que aloja este espejo.
- Latencia y throughput: ver tabla de benchmarks. TTFT de 393 ms en Mac Studio M4 Max (GPU) y 11,75 s en Galaxy S26 (GPU); 30,99 s en Galaxy S26 (CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B (LiteRT-LM, este) | 7B | 4096 | `.litertlm` int4 | MIT | On-device, medido en Galaxy S26 y Mac Studio |
| DeepSeek-R1-Distill-Qwen-7B (original) | 7B | no disponible | safetensors (base) | MIT | Modelo base sin cuantizar, para servidor/GPU |
| Qwen2.5-7B (base) | 7B | no disponible | safetensors | Apache-2.0 | Base del destilado, sin razonamiento explícito |

No se dispone de datos de rendimiento comparables de otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Contexto limitado a 4096 tokens en esta conversión, lo que restringe conversaciones largas y documentos extensos.
- El modelo emite cadenas de razonamiento `<think>`, lo que incrementa el número de tokens generados y la latencia percibida.
- No cabe en iPhone ni en teléfonos de 8 GB de RAM; requiere hardware de gama alta con 12 GB o más.
- Riesgo de alucinación inherente a los modelos de lenguaje; la cadena de razonamiento no garantiza la corrección de la respuesta.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; se desconoce el alcance multilingüe real.
- Licencia MIT, que permite uso comercial, pero se recomienda revisar los términos del modelo base y del runtime LiteRT-LM.
- El espejo no añade archivos de aviso más allá de la licencia copiada del modelo base; el repositorio upstream no incluye archivos de licencia propios.
- Las mediciones de rendimiento corresponden a fechas y versiones concretas del runtime (2026-10-05/06); pueden variar con actualizaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sairaph-official/DeepSeek-R1-Distill-Qwen-7B-5729fc2
- Repositorio upstream LiteRT: https://huggingface.co/litert-community/DeepSeek-R1-Distill-Qwen-7B
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web LiteRT-LM: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/DeepSeek-R1-Distill-Qwen-7B
- Registro de mediciones edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/deepseek-r1-distill-qwen-7b-q4-block32-ekv4096/CARD.md
- Benchmark Apple Silicon LLM: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
- Licencia del modelo base: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/LICENSE

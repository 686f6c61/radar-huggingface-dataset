# litert-community/Qwen2.5-Coder-1.5B-Instruct

## Resumen

Qwen2.5-Coder-1.5B-Instruct (LiteRT-LM) es una conversión del modelo de código Qwen2.5-Coder-1.5B-Instruct de Alibaba Cloud al runtime LiteRT-LM de Google, publicada por la organización comunitaria `litert-community`. El objetivo no es mejorar el modelo original, sino empaquetarlo en un formato (`.litertlm`) que pueda ejecutarse íntegramente en dispositivos móviles y equipos de escritorio sin depender de infraestructura de servidor. El resultado es un bundle de 1,12 GB que cabe en la memoria de un teléfono de gama alta y que decodifica a velocidad conversacional en GPU.

El modelo base es un transformer decoder-only de 1,54 mil millones de parámetros, especializado en generación de código y entrenado por Alibaba. Esta conversión aplica cuantización int4 por bloques de 32 con la técnica OCTAV en las capas lineales, mantiene la tabla de embeddings en int8 en una sección externa del bundle y conserva el tokenizador y las marcas ChatML del original, incluido el system prompt por defecto del proveedor.

Su relevancia actual radica en la combinación de tres factores: licencia Apache 2.0 sin restricciones comerciales, un tamaño que permite despliegue on-device real (no solo demostrativo) y un rendimiento medido en hardware móvil concreto (Galaxy S26, Pixel 8a, Pixel 11 Pro, Mac con M4 Max). Para equipos que quieran integrar asistencia de código en una aplicación Android o en un entorno de escritorio sin conexión, es una de las pocas opciones con cifras verificables publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder), convertido a LiteRT-LM |
| Parámetros totales | 1,54 B (modelo base 1.5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (presupuesto KV del bundle); contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantización | int4 blockwise-32 + OCTAV en capas lineales, embeddings int8 externalizados |
| Idiomas soportados | no disponible (la model card no los enumera) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM, 1,12 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-Coder-1.5B-Instruct original: un transformer decoder-only con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos SSM. La conversión a LiteRT-LM se realizó con `litert-torch` 0.9.3 y no modifica los pesos: el fichero publicado el 2026-11-13 reescribe únicamente los grafos de prefill y decode para GPU mediante un script separado. El bundle incorpora seis firmas de prefill (1024, 256, 64, 16, 4 y 1 tokens) y un presupuesto KV de 4096 tokens, lo que permite al runtime elegir la forma de entrada más adecuada y evitar recompilaciones en caliente.

La cuantización aplicada es int4 con bloques de 32 elementos más OCTAV en las capas lineales, mientras que la tabla de embeddings se almacena en int8 en una sección propia del bundle. Esta decisión de diseño es la que mantiene el fichero en 1,12 GB: si la tabla se cuantizara inline, se duplicaría por cada firma de prefill y el mismo conjunto de pesos ocuparía 2,53 GB. No hay información en la model card sobre el dataset de entrenamiento, el número de tokens, ni sobre fases de RLHF o DPO del modelo original; esos detalles corresponden a la model card de Qwen y no se reproducen aquí.

## Capacidades

- Generación de código en múltiples lenguajes: la model card verifica funciones en Python (`fib`, `reverse_words`, `is_prime`, suma máxima de sublista contigua, `count_vowels`, `flatten`) ejecutadas contra aserciones, con 6/6 correctas.
- Generación de texto general y respuestas a preguntas: la prueba de sanidad de 8 preguntas se supera 8/8 en GPU de Galaxy S26, Pixel 11 Pro y Mac.
- Razonamiento sobre código: el modelo base Qwen2.5-Coder está entrenado para tareas de comprensión y generación de código, aunque la model card de esta conversión no desglosa capacidades específicas más allá de las pruebas citadas.
- Modo instructivo con ChatML: el bundle incluye las marcas de chat y el system prompt por defecto de Qwen (`You are Qwen, created by Alibaba Cloud. You are a helpful assistant.`), con renderizado byte-idéntico al upstream para peticiones de un solo turno.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para esta conversión.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no enumera idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponibles; el pipeline es `text-generation` exclusivamente.

## Casos de uso

- Asistencia de código en el IDE o editor móvil: el modelo devuelve salidas cortas de forma constante, por lo que la tasa de decodificación determina directamente la experiencia. Con 44,3 tok/s en GPU de Galaxy S26 o 137,8 tok/s en GPU Metal de M4 Max, la latencia percibida es compatible con autocompletado y generación de funciones pequeñas.
- Autocompletado y generación de fragmentos en aplicaciones Android: el bundle de 1,12 GB con pico de memoria de 0,85 GB en GPU encaja en dispositivos de gama alta; se integra mediante `litert-lm` (API `com.google.ai.edge.litert:litert` en Android) sin necesidad de conexión de red.
- Enseñanza de programación sin conexión: en entornos con conectividad limitada o requisitos de privacidad, el modelo puede generar ejemplos y resolver ejercicios básicos localmente, con la ventaja de que ningún dato del alumno sale del dispositivo.
- Prototipado rápido de funciones utilitarias: tareas como invertir palabras, comprobar primalidad o aplanar listas, verificadas en la propia model card, son representativas del tipo de encargo para el que el modelo está calibrado; útil en scripts de generación de tests o scaffolding.
- Procesamiento por lotes en equipos de escritorio con GPU Apple: con 3037 tok/s de prefill y 137,8 tok/s de decode en M4 Max, es viable generar documentación de código o descripciones de funciones para repositorios pequeños en modo batch, sin coste de API.
- Evaluación comparativa de runtimes on-device: al publicar cifras en CPU (XNNPACK) y GPU (LiteRT GPU) sobre el mismo dispositivo, sirve como referencia para medir la madurez de LiteRT-LM frente a otras pilas de inferencia móvil en proyectos de I+D.
- Asistente de código embebido en herramientas de desarrollo para Android: la licencia Apache 2.0 permite redistribuirlo dentro de aplicaciones comerciales sin obligación de liberar el código de la aplicación.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Los datos disponibles son pruebas de corrección y mediciones de rendimiento en dispositivo.

Pruebas de corrección:

| Prueba | Resultado | Hardware / runtime | Fecha |
|---|---|---|---|
| Sanity check de 8 preguntas | 8/8 | GPU Galaxy S26, Pixel 11 Pro (LiteRT-LM v0.19.0) y Mac (litert-lm 0.19.2) | 2026-11-14 |
| Test de código con aserciones (6 funciones) | 6/6 | Fichero anterior | no disponible |

Rendimiento en Apple M4 Max (`litert-lm benchmark`, `-p 256 -d 256 --cache no`, litert-lm 0.16.0, fichero anterior):

| Backend | Prefill (256) | Decode | TTFT | Init |
|---|---|---|---|---|
| GPU (Metal) | 3037 tok/s | 137,8 tok/s | 0,099 s | 2,38 s |
| CPU | 292 tok/s | 47,1 tok/s | 1,06 s | 2,87 s |

Rendimiento en Samsung Galaxy S26 (SM-S942Q / SM8850, Android 16, LiteRT-LM v0.19.0):

| Backend | Prefill (1024) | Decode | TTFT | Pico (`VmHWM`) |
|---|---|---|---|---|
| GPU (LiteRT GPU, todos los nodos) | 646 tok/s | 44,3 tok/s | 1,61 s | 0,85 GB |
| CPU (XNNPACK), iteración 1 | 195 tok/s | 25,1 tok/s | 5,30 s | 2,14 GB |
| CPU (XNNPACK), iteraciones 2-3 | 99 tok/s | 22,8 tok/s | 10,4 s | 2,14 GB |

Mediciones en ficheros anteriores (edge-compat, LiteRT-LM 0.16.0):

| Dispositivo | Backend | Decode | Prefill | TTFT | Ops delegadas |
|---|---|---|---|---|---|
| Galaxy S26 | GPU | 10,1 tok/s | 206 tok/s | 1,18 s | 1243/1243 |
| Pixel 8a | GPU | 12,0 tok/s | 84 tok/s | 540 ms | 1243/1243 |
| Galaxy S26 | CPU | 29,7 tok/s | 106 tok/s | 2,14 s | no disponible |

Como referencia de escala, un bundle int4 de clase 3B convertido el mismo día y medido en la misma máquina con el mismo protocolo alcanza 1241 tok/s de prefill, 86,3 tok/s de decode y 0,233 s de TTFT.

## Requisitos de hardware

- VRAM / memoria estimada: el bundle ocupa 1,12 GB en disco; el pico de memoria medido en Galaxy S26 con GPU es de 0,85 GB (`VmHWM`) y de 2,14 GB con CPU (XNNPACK).
- GPU recomendadas: GPU integrada de dispositivos móviles de gama alta (Galaxy S26, Pixel 11 Pro, Pixel 8a) mediante LiteRT GPU; GPU Apple Silicon (M4 Max medido) mediante Metal. No hay datos publicados para A100, H100 o RTX 4090, ya que el objetivo del formato es el despliegue en el dispositivo, no en servidor.
- ¿Cabe en GPU de consumo? Sí, en el sentido de que cabe en la memoria unificada de un Mac con Apple Silicon y en la memoria de un teléfono de gama alta. Para GPUs dedicadas de escritorio no hay mediciones publicadas con este formato.
- Opciones de despliegue: `litert-lm` (CLI y API Android `com.google.ai.edge.litert:litert`). Requiere litert-lm ≥ 0.16; en Android la ruta GPU exige 0.19.0 o superior. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ver tabla de benchmarks. En Galaxy S26 la GPU decodifica entre 1,7 y 1,9 veces más rápido que la CPU con LiteRT-LM v0.19.0; en M4 Max la relación es de 2,9×. La model card advierte explícitamente que la relación GPU/CPU de un Mac no se traslada a un teléfono y recomienda medir en el dispositivo objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct (LiteRT-LM, este) | 1,54 B | 4096 (KV del bundle) | `.litertlm`, on-device | Apache 2.0 | 1,12 GB; 44,3 tok/s decode en GPU Galaxy S26 |
| Qwen2.5-Coder-3B-Instruct (LiteRT-LM, misma org) | 3 B (aprox.) | no disponible | `.litertlm`, on-device | Apache 2.0 (presumible, no confirmado en la información) | 3,43 GB; convertido por otro contribuidor; pensado para capacidad frente a velocidad; sin comparación directa publicada |
| Qwen2.5-Coder-1.5B-Instruct (original, Hugging Face) | 1,54 B | no disponible en la información | safetensors / GGUF (no confirmado) | Apache 2.0 | Referencia de calidad; requiere pila de inferencia estándar, no on-device |
| Bundle int4 de clase 3B citado en la model card | ~3 B | no disponible | `.litertlm` | no disponible | 1241 tok/s prefill, 86,3 tok/s decode, 0,233 s TTFT en M4 Max |

La model card advierte que este modelo y su hermano de 3B no se han comparado en la misma máquina, por lo que no se emite juicio sobre su calidad relativa.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; los sesgos del modelo base Qwen2.5-Coder no se analizan en esta conversión.
- Riesgo de alucinación: inherente a un modelo de 1,5 B; las pruebas publicadas son de funciones pequeñas con aserciones, no de razonamiento complejo. La model card subraya que una prueba de conocimiento general no certifica nada para un modelo de código, de ahí que se añadiera el test de ejecución.
- Limitaciones de contexto: el bundle fija un presupuesto KV de 4096 tokens, inferior al contexto nativo del modelo base (no especificado aquí). Para conversaciones largas o ficheros extensos, el contexto es la restricción práctica.
- Idiomas: no se enumeran; no se puede asumir cobertura multilingüe más allá de lo que herede del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial y redistribución con atribución; no se identifican cláusulas adicionales en la información disponible.
- Caveats de producción: requiere litert-lm ≥ 0.16 y, para GPU en Android, ≥ 0.19.0. El fichero publicado el 2026-11-13 tiene los grafos de prefill/decode reescritos por un script separado para GPU, con los pesos sin cambios. La medición de `Init time` del CLI cuenta la creación del motor dos veces (issue LiteRT-LM #4057). La relación GPU/CPU depende del dispositivo y debe medirse in situ. El formato `.litertlm` no es portable a otras pilas de inferencia sin reconversión.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/litert-community/Qwen2.5-Coder-1.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Hermano de 3B en la misma organización: https://huggingface.co/litert-community/Qwen2.5-Coder-3B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue LiteRT-LM #4057 (doble conteo en `Init time`): https://github.com/google-ai-edge/LiteRT-LM/issues/4057
- Ficha de referencia edge-compat del bundle int4: https://github.com/john-rocky/edge-compat/blob/main/cards/qwen25-coder-1.5b-int4/CARD.md
- Benchmark de runtimes en Apple Silicon y Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md

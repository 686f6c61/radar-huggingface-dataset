# FINAL-Bench/POCKET-26B-GGUF

## Resumen

POCKET-26B-GGUF es una cuantización en formato GGUF del modelo google/gemma-4-26B-A4B-it, publicada por FINAL-Bench (VIDRAFT). Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 25.233.142.046 parámetros totales y aproximadamente 4.000 millones de parámetros activos por token, orientado a inferencia local en dispositivos con recursos limitados (CPU, móvil, edge). El paquete aplica una cuantización "Korean-tuned" sobre el checkpoint original sin podar, y ofrece dos builds principales: Q2_K (~11 GB) y Q4_K_M (~17 GB).

El modelo resuelve el problema de ejecutar un LLM de gran tamaño en hardware de consumo mediante cuantización mixta y un camino de ejecución solo-CPU a través de llama.cpp. Es relevante ahora por la popularidad de los despliegues on-device (Ollama, LM Studio) y por la reducción de requisitos de memoria que permite el esquema MoE: aunque el modelo completo ocupa decenas de gigabytes, solo una fracción de los expertos se activa por token.

La ficha se basa únicamente en la información pública disponible en Hugging Face y en la model card. Los datos de rendimiento proceden de mediciones del editor con condiciones específicas de dispositivo, y no se han verificado de forma independiente. La licencia declarada es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), derivada de Gemma 4 |
| Parametros totales | 25.233.142.046 (~25,2 B) |
| Parametros activos | ~4 B por token (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (~11 GB, recomendada), Q4_K_M (~17 GB); cuantización mixta con imatrix |
| Idiomas soportados | no disponible (la model card menciona ajuste para coreano y resúmenes en coreano, chino y japonés; no se declara lista oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es google/gemma-4-26B-A4B-it, un transformer con capas de mezcla de expertos (MoE) que activa aproximadamente 4.000 millones de parámetros por token sobre un total de 25,2 mil millones. Esta configuración reduce el coste computacional por token respecto a un modelo denso del mismo tamaño, lo que facilita la inferencia en CPU y en dispositivos edge. El paquete POCKET-26B-GGUF no modifica el checkpoint de origen (no se poda) y aplica una cuantización mixta con matriz de importancia (imatrix) etiquetada como "Korean-tuned".

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de la propia arquitectura MoE del modelo base. Los detalles de entrenamiento del checkpoint original deben consultarse en la model card de google/gemma-4-26B-A4B-it.

## Capacidades

- Generación de texto conversacional en formato chat (pipeline text-generation, tag conversational).
- Razonamiento y respuesta a preguntas: la model card reporta un resultado de GPQA para el build Q2_K (ver sección de benchmarks).
- Capacidades multilingües: la model card incluye resúmenes en coreano, chino y japonés, y etiquetas multilingual y korean-llm; no se especifica la lista completa de idiomas.
- Ejecución on-device: compatible con llama.cpp, Ollama y LM Studio según las etiquetas del repositorio.
- Ejecución solo-CPU: se declara un camino de ejecución sin GPU.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de texto local en escritorio: ejecutar el build Q4_K_M (~17 GB) con llama.cpp u Ollama en un equipo con suficiente RAM para tareas de redacción, resumen y reescritura sin enviar datos a la nube.
- Procesamiento en CPU sin GPU: usar el camino solo-CPU declarado para desplegar el modelo en servidores sin acelerador, aceptando menor throughput a cambio de independencia de hardware especializado.
- Prototipado rápido con LM Studio: cargar el GGUF y validar flujos conversacionales antes de invertir en infraestructura, gracias a la integración directa con LM Studio y Ollama.
- Aplicaciones en coreano: aprovechar el ajuste "Korean-tuned" de la cuantización para tareas de generación y asistencia en coreano en entornos locales.
- Despliegue en dispositivos de memoria limitada: el build Q2_K (~11 GB) permite explorar inferencia en equipos con menos RAM, siempre que se reserve margen para el sistema operativo, el runtime y el contexto (la model card advierte que 11 GB de archivo no garantizan funcionamiento en un móvil de 12 GB).
- Evaluación comparativa de cuantizaciones: usar los dos builds para medir el impacto de Q2_K frente a Q4_K_M en calidad de respuesta y consumo de memoria dentro de un mismo pipeline.

## Benchmarks y rendimiento

La model card menciona un "reported GPQA result" para el build Q2_K, pero no incluye la cifra concreta en la información disponible. No se han publicado tablas de MMLU, HumanEval, GSM8K ni otros benchmarks en la información proporcionada.

| Benchmark | Resultado | Notas |
|---|---|---|
| GPQA (Q2_K) | no disponible (cifra no incluida en el texto) | La model card indica que existe un resultado reportado por el editor |
| MMLU | no disponible | — |
| HumanEval | no disponible | — |
| GSM8K | no disponible | — |

No se han publicado resultados de benchmarks completos en la información disponible. Los datos de la model card sobre SuperCLUE corresponden a Darwin-180B-RSI-R3, un modelo distinto de la familia del editor, y no son aplicables a POCKET-26B.

## Requisitos de hardware

- VRAM/RAM estimada: Q2_K ~11 GB de archivo; Q4_K_M ~17 GB de archivo. Son tamaños de fichero en GB decimales redondeados, no mediciones de memoria de proceso; hay que añadir margen para sistema operativo, contexto y buffers del runtime.
- GPU recomendadas: no disponible (no se especifican modelos de GPU en la información proporcionada).
- ¿Cabe en GPU de consumo? No disponible como dato verificado. El tamaño de Q2_K (~11 GB) es compatible con GPUs de 12-16 GB solo si se dispone de margen adicional; la model card no confirma este escenario.
- Ejecución solo-CPU: sí, se declara un camino de ejecución CPU-only.
- Opciones de despliegue: llama.cpp (con soporte Gemma4), Ollama, LM Studio. La compatibilidad exacta de versión de aplicación debe verificarse.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| POCKET-26B-GGUF (este) | ~25,2 B | ~4 B | no disponible | Apache-2.0 | GGUF | Hugging Face |
| google/gemma-4-26B-A4B-it | ~25,2 B | ~4 B | no disponible | no disponible en esta ficha | safetensors (checkpoint original) | Hugging Face |
| POCKET-35B-GGUF (mismo editor) | no disponible | no disponible | no disponible | no disponible | GGUF | Hugging Face |
| POCKET-Darwin-180B-GGUF (mismo editor) | no disponible | no disponible | no disponible | no disponible | GGUF | Hugging Face |

La comparación con alternativas de otros desarrolladores no está disponible en la información proporcionada. El modelo base google/gemma-4-26B-A4B-it es la referencia directa: POCKET-26B-GGUF es una cuantización del mismo, por lo que la comparación relevante es de precisión y consumo de memoria, no de capacidad intrínseca.

## Limitaciones y advertencias

- La model card advierte explícitamente que el paquete no garantiza soporte universal en aplicaciones, no constituye una medición verificada de funcionamiento en móviles de 12 GB y no es un paquete MLX.
- Los tamaños de archivo son GB decimales redondeados; no son mediciones de memoria de proceso. Un archivo de 11 GB no asegura operación fiable en un dispositivo de 12 GB.
- Los resultados de calidad son mediciones del editor con condiciones específicas de dispositivo y no han sido verificados de forma independiente.
- La cuantización Q2_K implica una pérdida de precisión mayor que Q4_K_M; el impacto exacto en calidad no está cuantificado en la información disponible.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas específicas.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse la licencia y los términos del modelo base google/gemma-4-26B-A4B-it, que no se detallan en esta ficha.
- La compatibilidad exacta con versiones de llama.cpp, Ollama y LM Studio debe comprobarse antes de desplegar en producción.
- No se dispone de información sobre tool calling, agentes ni contexto máximo, lo que limita su uso en pipelines que dependan de estas capacidades.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FINAL-Bench/POCKET-26B-GGUF
- Archivos del repositorio: https://huggingface.co/FINAL-Bench/POCKET-26B-GGUF/tree/main
- Build Q2_K: https://huggingface.co/FINAL-Bench/POCKET-26B-GGUF/resolve/main/POCKET-26B-Q2_K.gguf
- Build Q4_K_M: https://huggingface.co/FINAL-Bench/POCKET-26B-GGUF/resolve/main/POCKET-26B-Q4_K_M.gguf
- Guía de configuración del editor: https://vidraft.net/p/pocket.html?model=pocket_26b
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- POCKET-35B: https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF
- POCKET-Darwin-180B: https://huggingface.co/FINAL-Bench/POCKET-Darwin-180B-GGUF
- Darwin-180B-RSI-R3: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI-R3
- Leaderboard SuperCLUE: https://www.superclueai.com/homepage

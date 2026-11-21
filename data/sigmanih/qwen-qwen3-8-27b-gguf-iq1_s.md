# sigmanih/Qwen-Qwen3.8-27B-GGUF-IQ1_S

## Resumen

Qwen-Qwen3.8-27B-GGUF-IQ1_S es una cuantización GGUF de tipo IQ1_S (1 bit con mezcla de precisión) del modelo base Qwen/Qwen3.8-27B, publicada por el usuario sigmanih bajo la etiqueta de Sigma Studio. El modelo conserva la arquitectura CausalLM del original, con 27.320.697.856 parámetros totales y una ventana de contexto declarada de 32.768 tokens. Su propósito es permitir la ejecución de un modelo de 27B en hardware de consumo con requisitos de VRAM muy reducidos gracias a la cuantización extrema.

La relevancia de esta ficha radica en que documenta una cuantización de 1 bit de un modelo de gran tamaño, un formato que prioriza la reducibilidad de memoria sobre la fidelidad de los pesos. Los benchmarks publicados por el autor, medidos sobre una porción reducida de cada suite, muestran un rendimiento global del 35% de aciertos, con una caída notable del modo de razonamiento encadenado (CoT) frente a la respuesta directa. Estos datos deben interpretarse con cautela por el tamaño de la muestra y por el efecto de la cuantización extrema.

El modelo se distribuye en formato GGUF, con licencia "other" (la model card menciona Apache-2.0 en un badge, pero el campo de licencia del repositorio es "other"), y está etiquetado para inglés e italiano. Está pensado para despliegues locales con llama.cpp y compatible con endpoints, según las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CausalLM (transformer decoder-only, según la model card) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF IQ1_S (cuantización de 1 bit con mezcla de precisión); no se detallan otras variantes en el repositorio |
| Idiomas soportados | inglés (en), italiano (it) |
| Licencia | other (la model card muestra un badge Apache-2.0, pero el campo de licencia del repositorio es "other") |
| Formato de pesos | GGUF (el campo de formato de la model card figura como "Sconosciuto"/"sconosciuta") |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es Qwen/Qwen3.8-27B, con arquitectura CausalLM, y que esta publicación es una cuantización GGUF del mismo, no un entrenamiento nuevo. La model card no detalla la composición del dataset de entrenamiento original, el número de tokens, ni si hubo fases de RLHF o DPO. Tampoco se especifican innovaciones técnicas del modelo base como atención lineal, decodificación especulativa o arquitecturas híbridas.

El proceso de cuantización sí está identificado: se trata de IQ1_S, un formato GGUF de 1 bit con mezcla de precisión, generado con el pipeline de Sigma Studio (etiqueta "imatrix" en el repositorio, lo que sugiere el uso de matrices de importancia para calibrar la cuantización). El autor declara un footprint en disco de 9,4 GB para el repositorio y estima un uso de VRAM de aproximadamente 23,4 GB con offload completo a GPU, y de 21,9 GB de RAM en modo CPU/híbrido. No se documenta el proceso de calibración ni los datos usados para la imatrix.

## Capacidades

- Generación de texto conversacional en inglés e italiano, según los idiomas declarados.
- Razonamiento de múltiples pasos mediante modo "Deep Thinking" (CoT), aunque los benchmarks del autor muestran un rendimiento inferior a la respuesta directa en su evaluación.
- Respuesta directa de baja latencia en modo "No-Thinking", con menor sobrecarga de tokens de razonamiento.
- Soporte de tool calling y protocolos de agentes: la model card reporta un 62% de adherencia al protocolo de herramientas en un sandbox, con uso exclusivo de herramientas registradas y esquemas válidos.
- Capacidades de código: la evaluación incluye HumanEval y MBPP, con resultados moderados (43% y 33% respectivamente en la muestra evaluada).
- Capacidades matemáticas: evaluado en GSM8K y MATH, con resultados bajos (33% y 0% en la muestra).
- Compatibilidad con endpoints, según la etiqueta "endpoints_compatible".
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Despliegue local en GPU de consumo: la cuantización IQ1_S permite cargar un modelo de 27B en una GPU de 24 GB (RTX 3090/4090) con offload completo, según las estimaciones del autor, lo que facilita experimentación local sin infraestructura de centro de datos.
- Asistentes conversacionales en inglés e italiano: el modelo puede gestionar diálogos multi-turno dentro de su ventana de 32.768 tokens, adecuado para chatbots de dominio acotado donde la latencia importa más que la profundidad de razonamiento.
- Automatización con tool calling en entornos controlados: con una adherencia declarada del 62% al protocolo de herramientas, puede integrarse en flujos de agentes que requieran llamadas a funciones registradas, siempre con validación externa de las acciones.
- Generación y revisión de código en pipelines de desarrollo: sus resultados en HumanEval (43% en la muestra) permiten usarlo como asistente de autocompletado o revisión en entornos con supervisión humana, no como generador autónomo en producción.
- Prototipado de razonamiento con CoT: el modo "Deep Thinking" permite experimentar con trazas de razonamiento paso a paso, aunque el autor reporta una caída de 28,8 puntos frente al modo directo en su evaluación, por lo que conviene validar caso por caso.
- Investigación sobre cuantización extrema: el modelo es un caso de estudio útil para medir el impacto de IQ1_S en tareas de conocimiento general (MMLU 36%) y matemáticas (MATH 0%) frente al modelo base sin cuantizar.
- Evaluación de robustez y seguridad: el sandbox del autor reporta un 100% de contención sin intentos de escape, lo que lo hace adecuado para pruebas de comportamiento de agentes en entornos aislados.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor, medidos sobre una porción reducida de cada suite (no sobre el conjunto completo), con temperatura 0.0 y semilla 42. El propio autor advierte que la puntuación no es comparable con una ejecución de suite completa.

| Benchmark | Aciertos / Total | Precisión |
|---|---|---|
| ARC-Challenge | 6 / 9 | 67% |
| BIG-Bench Hard | 3 / 7 | 43% |
| GPQA | 1 / 9 | 11% |
| GSM8K | 3 / 9 | 33% |
| HellaSwag | 4 / 9 | 44% |
| HumanEval | 3 / 7 | 43% |
| MATH | 0 / 9 | 0% |
| MBPP | 3 / 9 | 33% |
| MMLU | 5 / 14 | 36% |
| MMLU-Pro | 1 / 9 | 11% |
| TruthfulQA | 6 / 9 | 67% |
| Total | 35 / 100 | 35% |

Comparativa de modos de ejecución:

| Modo | Precisión | Preguntas superadas |
|---|---|---|
| No-Thinking (respuesta directa) | 47,4% | 27 / 57 |
| Deep Thinking (CoT) | 18,6% | 8 / 43 |

Protocolo de herramientas y agentes (Sigma Studio Sandbox Jail):

| Métrica | Resultado |
|---|---|
| Adherencia al protocolo de herramientas | 62,0% |
| Finalización autónoma de tareas | 0,0% (0/1 escenarios) |
| Contención en sandbox | 100% conforme |
| Eficiencia de ejecución | 0 turnos (0,0 s) |

## Requisitos de hardware

- VRAM estimada: aproximadamente 23,4 GB con offload completo a GPU, según el autor.
- RAM estimada en modo CPU/híbrido: aproximadamente 21,9 GB.
- GPU recomendadas: el autor indica una GPU de 24 GB de VRAM, como RTX 3090 o RTX 4090; también menciona 32-64 GB de RAM para configuraciones híbridas.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 de 24 GB con offload completo; en GPUs con menos VRAM requeriría offload parcial a CPU.
- Opciones de despliegue: formato GGUF, compatible con llama.cpp y con endpoints según las etiquetas del repositorio; no se confirma soporte explícito de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles; el autor solo describe el modo No-Thinking como de latencia mínima y primer token inmediato, sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen-Qwen3.8-27B-GGUF-IQ1_S (este) | 27,3B | 32.768 | other | GGUF IQ1_S | Cuantización de 1 bit; 35% global en muestra reducida |
| Qwen/Qwen3.8-27B (base) | 27,3B | no disponible | no disponible | safetensors (según parámetros reales) | Modelo original sin cuantizar; rendimiento no disponible en esta ficha |
| Otras cuantizaciones GGUF del mismo base | 27,3B | 32.768 | según autor | GGUF (Q4, Q5, Q8, etc.) | No disponibles en la información proporcionada |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La cuantización IQ1_S es extremadamente agresiva (1 bit); los benchmarks del autor muestran un rendimiento global bajo (35%) y un 0% en MATH, lo que sugiere una degradación severa en tareas de razonamiento matemático y de conocimiento avanzado.
- El modo CoT ("Deep Thinking") rinde peor que la respuesta directa en la evaluación del autor (18,6% frente a 47,4%), con una caída de 28,8 puntos; no debe asumirse que el razonamiento encadenado mejora los resultados en esta cuantización.
- Los benchmarks se midieron sobre una porción reducida de cada suite (entre 7 y 14 preguntas por benchmark), por lo que tienen alta varianza y no son comparables con ejecuciones completas.
- La finalización autónoma de tareas en el sandbox fue del 0,0% (0 de 1 escenarios), lo que limita su uso en flujos de agentes sin supervisión.
- Idiomas soportados limitados a inglés e italiano; no se declara soporte de español.
- La licencia es "other", con una badge Apache-2.0 en la model card que no coincide con el campo de licencia del repositorio; es necesario verificar los términos exactos antes de un uso comercial.
- El formato de pesos figura como "Sconosciuto"/"sconosciuta" en la model card, lo que indica una documentación incompleta del proceso de cuantización y calibración.
- Riesgo de alucinación: no se han publicado métricas específicas más allá de TruthfulQA (67% en 9 preguntas), insuficientes para garantizar fiabilidad factual.
- No se documentan sesgos conocidos ni evaluaciones de seguridad más allá de la contención en sandbox.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sigmanih/Qwen-Qwen3.8-27B-GGUF-IQ1_S
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio Sigma Studio en GitHub: https://github.com/Sigmanih/SigmaStudio
- Licencia Apache-2.0 (referenciada en la model card): https://opensource.org/licenses/Apache-2.0

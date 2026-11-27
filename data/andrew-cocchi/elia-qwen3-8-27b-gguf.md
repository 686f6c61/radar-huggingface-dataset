# Andrew-Cocchi/Elia-Qwen3.8-27B-GGUF

## Resumen

Elia-Qwen3.8-27B es un modelo de lenguaje de 27.320 millones de parámetros obtenido mediante la fusión en espacio de pesos (*weight-space merge*) de Qwen3.8-27B y Kev-27B. Lo publica el usuario Andrew-Cocchi en Hugging Face bajo licencia Apache 2.0, en formato GGUF listo para llama.cpp. No se trata de un fine-tune: la receta es aritmética pura de tensores, `W = W_Qwen + 0.6 * (W_Kev - W_Qwen)`, aplicada tensor a tensor a partir de los GGUF Q8_0 de ambos modelos padres.

La propuesta del autor es la concisión: según sus pruebas, el modelo mantiene una precisión comparable a un fine-tune fuerte de Qwen3.8-27B (dentro del margen de error) mientras genera aproximadamente un tercio de los tokens en preguntas de conocimiento. Menos tokens implica menor latencia en hardware local, que es el escenario objetivo declarado.

El modelo conserva la arquitectura híbrida de Qwen3.8-27B (Gated DeltaNet combinada con atención) y su cabeza de predicción multi-token (MTP), que permite decodificación especulativa sin modelo borrador separado. El repositorio incluye una cuantización IQ3_XXS con MTP de 10,4 GB; la Q8_0 de 29,0 GB está anunciada como próxima.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet + atención, con cabeza MTP (multi-token prediction) |
| Parámetros totales | 27.320.697.856 (27,32 B) |
| Parámetros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de uso emplea `-c 32768`) |
| Tipos de cuantización | IQ3_XXS (10,4 GB, disponible); Q8_0 (29,0 GB, anunciada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el merge se calculó desde GGUF Q8_0 |
| Modelos base | Qwen/Qwen3.8-27B y jaredpalmer/kev-27b (relación: merge) |
| Tamaño del repositorio | 10,4 GB |
| Descargas / likes | 0 / 0 (a fecha de creación del registro) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B: un transformer híbrido que combina capas de Gated DeltaNet con capas de atención clásica, más una cabeza de predicción multi-token (MTP) que actúa como mecanismo de decodificación especulativa integrado. Esta cabeza MTP se conserva intacta en el merge y es la que permite usar `--spec-type draft-mtp` en llama.cpp sin un modelo borrador externo.

No hay entrenamiento ni ajuste por gradiente en este modelo. El procedimiento es una interpolación lineal por tensor entre los pesos de Qwen3.8-27B y Kev-27B con coeficiente 0,6 hacia Kev, calculada desquantizando ambos GGUF Q8_0, fusionando y recuantizando a Q8_0. Como Kev-27B carece de `output.weight` y de cabeza MTP, ambas se toman sin cambios de Qwen3.8-27B. También se eliminaron los metadatos y tensores específicos de decisión de Kev (`qwen35.decision.*`, `embedding_length_out`, `cls.*`), que forzaban a llama.cpp a cargar el modelo en modo embedding; el resultado es un LM causal estándar. La cuantización IQ3_XXS se generó con `llama-quantize` (llama.cpp b11706) reutilizando únicamente el plan de tipos por tensor de ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF (asignación RCO) y una importance matrix calculada sobre el split de test de WikiText-2; no se emplean las rejillas aprendidas de GSQ. No se dispone de datos sobre volumen de tokens de entrenamiento ni composición del dataset, al no haber entrenamiento propio.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas de conocimiento, con un estilo deliberadamente conciso: el autor reporta una mediana de 62 tokens en MMLU-Pro frente a 346 del modelo de comparación.
- Razonamiento en modo *thinking* opcional (`--reasoning on` en llama.cpp), aunque el autor indica que no lo ha evaluado.
- Decodificación especulativa nativa mediante la cabeza MTP, sin modelo borrador separado.
- Razonamiento matemático con cadena de pensamiento (evaluado en GSM8K CoT zero-shot).
- Seguimiento de instrucciones con restricciones de formato (evaluado en IFEval).
- Capacidades multilingües: no disponible (no se documentan idiomas soportados).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión y audio: no disponible; el modelo es solo de texto.

## Casos de uso

- Asistentes locales de respuesta rápida: el modelo está pensado para hardware de consumo y genera respuestas cortas, lo que reduce el tiempo hasta el primer token completo en consultas de conocimiento. Encaja en interfaces de chat donde la latencia percibida importa más que la verbosidad.
- Despliegue en GPU de 8 GB con offload parcial: la receta documentada mantiene los pesos FFN en RAM del sistema (`-ot "^blk\.[0-9]+\.ffn_(gate|up|down)\.weight$=CPU"`) y el resto en GPU, lo que permite ejecutar un modelo de 27 B en una RTX A1000 de 8 GB.
- Servicio de inferencia con llama.cpp server: el ejemplo de uso con `llama-server`, plantilla Jinja y API compatible con chat completions permite integrarlo como backend HTTP en aplicaciones existentes.
- Decodificación especulativa de bajo coste: al incorporar la cabeza MTP, se puede acelerar la generación sin desplegar un segundo modelo borrador, lo que simplifica la infraestructura en entornos con memoria limitada.
- Evaluación comparativa de técnicas de merge: sirve como caso de estudio reproducible de fusión en espacio de pesos con receta aritmética explícita y plan de cuantización documentado, útil para investigadores que estudien merges.
- Tareas de instrucción con formato fijo: en IFEval obtiene 84,5 % en prompt strict con 200 muestras, por lo que es adecuado para pipelines donde la salida debe respetar restricciones de formato y longitud, aunque con la cautela de los tamaños de muestra reducidos.
- Clasificación y extracción de respuestas de opción múltiple: el ajuste de la métrica de ARC-Challenge en el propio harness sugiere su uso en tareas de selección de respuesta donde se pueda postprocesar la letra final.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness 0.4.13 sobre llama.cpp b11706, archivo IQ3_XXS + MTP, KV cache q4_0, decodificación especulativa MTP (2 tokens borrador) + ngram-mod, razonamiento desactivado, greedy, máximo 1024 tokens nuevos y sin system prompt. Muestras reducidas: MMLU-Pro 210 (15 por materia), GSM8K CoT zero-shot 200, IFEval 200, ARC-Challenge 500. Hardware: Intel Core Ultra 9 285K, 32 GB RAM, NVIDIA RTX A1000 (8 GB).

| Modelo | MMLU-Pro (210) | GSM8K CoT 0-shot (200) | IFEval prompt strict (200) | IFEval, primeros 100 | ARC-Challenge chat (500) |
|---|---|---|---|---|---|
| Elia-Qwen3.8-27B | 64,3 ± 3,3 | 84,0 ± 2,6 | 84,5 ± 2,6 | 89,0 ± 3,1 | 96,0 ± 0,9 |
| Qwen3.8-27B-Turbo-Brilliance | 67,6 ± 3,2 | no disponible | no disponible | 85,0 ± 3,6 | 95,6 ± 0,9 |

Longitud media de respuesta generada (mismos runs, contada con el tokenizador del modelo):

| Tarea | Elia-Qwen3.8-27B | Turbo-Brilliance |
|---|---|---|
| MMLU-Pro (210) | 140 (mediana 62) | 398 (mediana 346) |
| IFEval (primeros 100 / 200) | 302 (mediana 198) | 314 (mediana 218) |

Desglose de MMLU-Pro por materia (15 preguntas cada una), Elia frente a Turbo-Brilliance: biology 93,3 / 86,7; business 66,7 / 73,3; chemistry 73,3 / 86,7; computer science 80,0 / 80,0; economics 80,0 / 73,3; engineering 60,0 / 53,3; health 80,0 / 73,3; history 46,7 / 60,0; law 20,0 / 20,0; math 86,7 / 86,7; other 33,3 / 60,0; philosophy 53,3 / 33,3; physics 80,0 / 80,0; psychology 46,7 / 80,0. El autor advierte que, con estos tamaños de muestra, las diferencias de pocos puntos no son significativas.

## Requisitos de hardware

- VRAM estimada: el archivo IQ3_XXS ocupa 10,4 GB, por lo que no cabe completo en GPUs de consumo de 8 GB; el autor documenta ejecución en una RTX A1000 de 8 GB manteniendo los pesos FFN en RAM del sistema.
- El archivo Q8_0 (29,0 GB) requiere al menos ~29 GB de memoria para los pesos, más KV cache; en la práctica, GPU de 40-80 GB o reparto entre GPU y RAM.
- GPU recomendadas: para IQ3_XXS completo, GPUs con 12-16 GB o más (RTX 4070 Ti Super, RTX 4080, RTX 4090, A6000); para Q8_0, A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí, IQ3_XXS en tarjetas de 12 GB o más; con 8 GB solo mediante offload parcial de las capas FFN a CPU.
- Opciones de despliegue: llama.cpp (llama-server o llama-cli) es el soportado y documentado; no se mencionan vLLM, TGI, Ollama ni otros runtimes en la información disponible.
- Parámetros de inferencia documentados: `--jinja --reasoning off -fa on -ctk q4_0 -ctv q4_0 -c 32768 --spec-type draft-mtp,ngram-mod --spec-draft-n-max 2`.
- Latencia y throughput: no se publican cifras de tokens por segundo; el autor solo indica cualitativamente que menos tokens por respuesta implican respuestas más rápidas en hardware local.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro (210) | Licencia | Formato |
|---|---|---|---|---|---|
| Elia-Qwen3.8-27B | 27,32 B | no disponible | 64,3 | Apache 2.0 | GGUF |
| Qwen3.8-27B-Turbo-Brilliance | 27 B (fine-tune de Qwen3.8-27B) | no disponible | 67,6 | Apache 2.0 | GGUF (IQ3_XXS + MTP) |
| Qwen/Qwen3.8-27B (padre) | 27 B | no disponible | no disponible | no disponible | no disponible |
| jaredpalmer/kev-27b (padre) | 27 B | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible se limita a Turbo-Brilliance, un fine-tune de Qwen3.8-27B orientado a razonamiento. Elia queda 3,3 puntos por debajo en MMLU-Pro (dentro del margen de error declarado) pero responde con unas 2,8 veces menos tokens en preguntas de conocimiento. En IFEval y ARC-Challenge las diferencias son pequeñas y no significativas con las muestras empleadas. No hay datos publicados de los modelos padre en la información proporcionada.

## Limitaciones y advertencias

- Tamaños de muestra reducidos (210, 200 y 500 ejemplos según tarea): las diferencias de pocos puntos no son estadísticamente significativas y deben interpretarse con cautela.
- Solo se ha evaluado el archivo IQ3_XXS; la Q8_0 no tiene benchmarks propios.
- Solo se ha probado con llama.cpp; el modo razonamiento (`--reasoning on`) no ha sido evaluado.
- Las respuestas concisas enuncian hechos directamente con poco autoexamen, por lo que en preguntas de conocimiento puede equivocarse con seguridad; riesgo de alucinación elevado en dominios factuales.
- Hereda los sesgos y limitaciones de ambos modelos padres (Qwen3.8-27B y Kev-27B).
- No se documentan idiomas soportados, capacidades de tool calling ni comportamiento en agentes multi-paso.
- La métrica de ARC-Challenge se recalculó manualmente porque el harness oficial puntúa 0 al no poder continuar un turno pre-rellenado; los valores no son directamente comparables con los del leaderboard.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos base por si imponen requisitos adicionales.
- Modelo con 0 descargas y 0 likes en el momento del registro: no hay validación independiente de los resultados del autor.
- El repositorio solo contiene el GGUF IQ3_XXS; el Q8_0 está anunciado pero no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Andrew-Cocchi/Elia-Qwen3.8-27B-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base Kev-27B: https://huggingface.co/jaredpalmer/kev-27b
- Plan de tipos de cuantización reutilizado (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo de comparación (Turbo-Brilliance): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- llama.cpp (runtime soportado): https://github.com/ggml-org/llama.cpp

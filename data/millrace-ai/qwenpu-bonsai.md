# millrace-ai/qwenpu-bonsai

## Resumen

Bonsai-QwenPU 27B es un checkpoint GGUF experimental publicado por millrace-ai que combina los pesos del modelo Bonsai-27B de prism-ml con un circuito RISC-V vectorial integrado en el forward pass de CUDA. El modelo base es un transformer de 26.895.998.464 elementos tensoriales con arquitectura declarada `qwen35`, anchura oculta de 5.120 y 64 bloques de lenguaje. La modificación añade 23 subcapas de circuito activas que se ejecutan como nodos GGML personalizados respaldados por CUDA, junto con instantáneas de estado de un guest de tres tokens (pesos int4 del dataset stories260K).

El interés técnico del checkpoint no reside en sus capacidades de generación de texto, sino en la demostración de que es posible incrustar un intérprete de instrucciones RISC-V dentro del grafo de cómputo de un LLM cuantizado en Q1_0 y ejecutarlo de forma verificable en una GPU Pascal (GTX 1080, `sm_61`). La validación publicada compara trazas de ejecución token a token contra un intérprete de referencia independiente, con coincidencia total de 150.405 tokens de traza en la prueba de tres tokens.

El modelo está pensado para reproducir el experimento, no para uso en producción: requiere una compilación parcheada de llama.cpp para Windows CUDA, es incompatible con llama.cpp estándar, LM Studio y Ollama, y su cobertura declarada se limita a un decodificador de una sola GPU completamente descargado, un token por llamada en la secuencia cero y un prefijo de tool-call fijo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen35` con circuito RISC-V vectorial integrado en CUDA (23 subcapas activas, 13 bloques) |
| Parametros totales | 26.917.758.976 elementos tensoriales (26.895.998.464 del GGUF base + 21.760.512 de circuito y guest) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens declarados en la cabecera del GGUF |
| Tipos de cuantizacion | Q1_0 (checkpoint publicado); pesos del guest en int4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (854 tensores) |

## Arquitectura y entrenamiento

El checkpoint parte de los tensores empaquetados de Bonsai-27B en Q1_0, sin reentrenamiento: el exportador verifica igualdad byte a byte de los 851 tensores originales y de las entradas de metadatos del GGUF original. Sobre esa base se añaden coeficientes de circuito disperso y instantáneas de estado de máquina del guest, que incluyen los pesos int4 del modelo stories260K. El decodificador parcheado ejecuta las 23 subcapas de circuito como nodos GGML personalizados con soporte CUDA, agrupadas en 13 bloques por el emisor de capa estándar fijado.

La innovación clave es que las coordenadas retenidas del circuito contribuyen a la normalización residual del modelo de lenguaje, de modo que bytes de tensores idénticos pueden producir logits distintos según el estado del circuito. La anchura oculta es de 5.120 y cada bloque tiene 17.408 filas de FFN. No se documentan datos de entrenamiento adicionales, número de tokens, composición del dataset ni fases de RLHF o DPO, ya que el proceso es de integración y cuantización, no de preentrenamiento.

## Capacidades

- Generación de texto base heredada de Bonsai-27B (no evaluada en este checkpoint).
- Ejecución de un guest RISC-V de tres tokens con pesos int4 de stories260K dentro del forward pass de CUDA.
- Soporte de prefijo de tool-call fijo (`Run<tool_call></tool_call>`) como punto de entrada validado.
- Trazas de ejecución verificables contra un intérprete de referencia independiente.
- Dispatch autónomo en CUDA descrito parcialmente en la documentación (cobertura incompleta).
- Capacidades multilingües: no disponibles.
- Vision, audio, thinking mode: no disponibles.

## Casos de uso

- Reproducción de investigación en cómputo heterogéneo: permite replicar el experimento de incrustar un intérprete RISC-V en el grafo de un LLM cuantizado, con trazas de referencia y manifiesto de validación incluidos.
- Estudio de decodificación especulativa implícita: el circuito actúa como coprocesador dentro del forward pass, útil para analizar cómo el estado de máquina afecta a los logits del modelo anfitrión.
- Verificación de integridad de checkpoints: el manifiesto y los hashes SHA-256 permiten auditar la cadena de exportación y la igualdad byte a byte de los tensores originales.
- Docencia sobre cuantización extrema: Q1_0 con 26.900 millones de elementos en 3,825 GB sirve como caso práctico de compromise entre tamaño y fidelidad numérica.
- Pruebas de compatibilidad de runtimes: útil para validar compilaciones parcheadas de llama.cpp en GPUs Pascal y detectar divergencias frente a binarios estándar.
- Benchmark de memoria en GPUs consumer: el pico medido de 5.403 MiB de VRAM en una GTX 1080 permite estudiar límites de despliegue en hardware antiguo.

## Benchmarks y rendimiento

| Prueba | Resultado en GTX 1080 |
|---|---|
| Hasta el primer producto matriz-vector | 3.252 tokens de traza coincidentes |
| 1 token stories260K | `Once`, 51.187 tokens de traza coincidentes |
| 3 tokens stories260K | `Once upon a`, 150.405 tokens de traza coincidentes |
| Velocidad en bucle nativo | 618 tokens de traza/s |
| Tiempo de sonda de 3 tokens | 246,9 s de tiempo de pared |
| VRAM pico (3 tokens) | 5.403 MiB (línea base 1.192 MiB) |
| RAM del árbol de procesos | 4,80 GiB de working set pico |
| Mutación de coeficiente | Salida `8` pasa a `0`; restaurar el coeficiente restaura la traza exacta |
| Comparación con Bonsai original | IDs greedy coincidentes, diferencia máxima de logit ~0,106 en reposo y ~0,107 tras el handoff |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~5,4 GB en el checkpoint Q1_0 de 3,825 GB durante la prueba de tres tokens (medido en GTX 1080).
- GPU validadas: GTX 1080 (Pascal, `sm_61`). El build apunta explícitamente a esta arquitectura.
- GPU recomendadas: no disponibles más allá de la GTX 1080 documentada.
- Cabe en GPU consumer: sí, al menos en GTX 1080 con 8 GB; no se documentan pruebas en otras.
- Despliegue: exclusivamente mediante compilación parcheada de llama.cpp para Windows CUDA (guía v0.1.0). llama.cpp estándar, LM Studio y Ollama son incompatibles.
- Latencia y throughput: 618 tokens de traza/s en bucle nativo; 246,9 s para una sonda de tres tokens, incluyendo overhead de validación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| millrace-ai/qwenpu-bonsai | 26,9 B (Q1_0) | 262.144 | LLM + circuito RISC-V en CUDA | Apache 2.0 | GGUF parcheado, 383 descargas |
| prism-ml/Bonsai-27B-gguf | 26,9 B | 262.144 | LLM base cuantizado | no disponible | GGUF estándar |
| millrace-ai/qwenpu-bonsai-27b-stock-prism | 26,9 B | no disponible | Variante para Prism sin parchear | no disponible | Checkpoint separado |

No se dispone de datos de rendimiento comparables entre estas variantes más allá de la diferencia máxima de logit (~0,106) reportada frente al Bonsai original.

## Limitaciones y advertencias

- Cobertura limitada: solo decodificador de una GPU completamente descargado, un token por llamada en secuencia cero y prefijo de tool-call fijo.
- Incompatible con runtimes estándar: llama.cpp, LM Studio y Ollama no funcionan con este formato; requiere compilación propia.
- Solo Windows CUDA validado en Pascal `sm_61`; no hay garantías en otras arquitecturas.
- El dispatch autónomo en CUDA aparece descrito de forma parcial en la documentación disponible.
- Riesgo de alucinación y sesgos del modelo base no evaluados en este checkpoint.
- Idiomas soportados no declarados.
- Uso comercial permitido por Apache 2.0, pero la viabilidad práctica en producción es dudosa por la dependencia de un build parcheado y la ausencia de benchmarks de calidad.
- El estado del circuito altera los logits del modelo anfitrión, por lo que la reproducibilidad exige conservar el manifiesto y el estado del guest.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/millrace-ai/qwenpu-bonsai)
- [Modelo base Bonsai-27B-gguf](https://huggingface.co/prism-ml/Bonsai-27B-gguf)
- [Variante stock Prism](https://huggingface.co/millrace-ai/qwenpu-bonsai-27b-stock-prism)
- [Release original en GitHub](https://github.com/tim-osterhus/qwenpu-bonsai/releases/tag/v0.1.0)
- [Guía de compilación y ejecución en Windows](https://github.com/tim-osterhus/qwenpu-bonsai/blob/v0.1.0/docs/REPRODUCE.md)
- [Identidad del runtime](https://github.com/tim-osterhus/qwenpu-bonsai/blob/v0.1.0/results/forward/release-v0.1/runtime-identity.json)
- [Informe de validación de historias](https://github.com/tim-osterhus/qwenpu-bonsai/blob/v0.1.0/results/forward/release-v0.1/validation.json)
- [Informe de validación vectorial v0.1](https://github.com/tim-osterhus/qwenpu-bonsai/blob/v0.1.0/results/forward/release-v0.1/vector-validation.json)
- [Informe histórico de validación vectorial](https://github.com/tim-osterhus/qwenpu-bonsai/blob/v0.1.0/results/forward/decoder-validation/validation.json)
- [Procedencia del guest](https://github.com/tim-osterhus/qwenpu-bonsai/blob/v0.1.0/guests/README.md)
- [Verificación en cuatro hosts](https://github.com/tim-osterhus/qwenpu-bonsai/blob/d1bdc3f10e405494ee59f0f05262d2f476ac1204/results/forward/standard-layer/evidence-snapshot.json)

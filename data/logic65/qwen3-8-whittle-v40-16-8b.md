# logic65/Qwen3.8-Whittle-v40-16.8B

## Resumen

Qwen3.8-Whittle-v40-16.8B es un modelo de lenguaje recortado mediante poda de profundidad (_depth pruning_) a partir del modelo base Qwen/Qwen3.8-27B-FP8, desarrollado por logic65 (David Aylward) como parte de una investigación independiente sobre técnicas de compresión sin entrenamiento adicional. El modelo conserva 40 de las capas originales, con un patrón híbrido de 30 capas gated-DeltaNet y 10 estaciones de atención completa, lo que reduce los parámetros de 27B a 16.8B. La selección de capas se realizó mediante un mapa de identidad por capa (coseno entre entrada y salida del residual stream) sobre 80 sondas, priorizando las capas recurrentes más relevantes dentro de cada tramo entre estaciones de atención. Es un _research preview_ sin entrenamiento de reparación, pero los resultados medidos muestran que supera a otros cortes de la misma familia y mantiene o mejora ciertas capacidades del modelo original.

La relevancia de este modelo radica en que demuestra que la poda basada en medición puede superar a los cortes por bloques contiguos, y que la ubicación de las estaciones de atención es más determinante que su número. Con una licencia Apache 2.0, se ofrece como un recurso para investigar el impacto de la poda en arquitecturas híbridas y para despliegues con requisitos de memoria reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 40 capas (30 gated-DeltaNet + 10 atención completa), patrón `[gdn, gdn, gdn, attention]` |
| Parametros totales | 16.8B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (indicado por tag, sin detalle de variantes) |
| Idiomas soportados | No disponibles (el modelo base Qwen3.8-27B-FP8 es multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado (probablemente safetensors y GGUF) |

## Arquitectura y entrenamiento

El modelo es un recorte de profundidad del Qwen3.8-27B-FP8, que emplea una arquitectura híbrida con capas gated-DeltaNet y atención. El recorte conserva 40 capas en un patrón fijo de tres capas recurrentes por cada estación de atención, cumpliendo el requisito de llama.cpp. La selección de capas se realizó mediante un mapa de identidad por capa: se calculó la similitud coseno entre la entrada y la salida del residual stream de cada capa sobre 80 sondas, y dentro de cada tramo entre estaciones de atención supervivientes se conservaron las tres capas recurrentes con mayor carga. No se realizó ningún entrenamiento adicional (_zero-training_), por lo que el modelo hereda los pesos del original en las capas conservadas. El proceso de medición y selección fue coautorado con Claude (Fable 5, Anthropic).

## Capacidades

- Generación de texto: pipeline de text-generation estándar.
- Control agéntico: supera al modelo original en tareas de control agéntico (0.0922 vs 0.0885).
- Generación de código: mejora en Python (0.0030 vs 0.0023 del original), pero con debilidad notable en C++ (recall distribuido en capas no conservadas).
- Razonamiento matemático: mantiene aproximadamente el 90% de la capacidad del modelo original.
- Conocimiento científico: ligeramente superior al original (0.0035 vs 0.0034).
- Multilingüe: conserva el 58% del recuerdo multilingüe del original, frente al 3% del corte de 44 capas.
- Probabilidad de fin de turno: 0.46 y 0.44 (frente a 0.53 y 0.33 del original), lo que reduce el riesgo de bucles de generación.

No se mencionan capacidades de tool calling, visión o audio.

## Casos de uso

- Investigación en poda de modelos: permite estudiar el impacto de la selección de capas basada en medición frente a métodos heurísticos, especialmente en arquitecturas híbridas.
- Despliegue en entornos con recursos limitados: al reducir los parámetros de 27B a 16.8B, puede ejecutarse en GPUs con menos VRAM que el modelo original, manteniendo un rendimiento competitivo en tareas específicas.
- Asistentes de conversación con control agéntico: su mejora en control agéntico lo hace adecuado para sistemas que requieren seguimiento de instrucciones multi-turno y toma de decisiones.
- Generación de código en Python: útil en pipelines de desarrollo donde se prioriza el rendimiento en Python y se acepta la debilidad en C++.
- Aplicaciones de razonamiento matemático y científico: mantiene un 90% de capacidad matemática y mejora en ciencia, lo que lo hace viable para tareas de análisis y resolución de problemas.
- Evaluación de técnicas de anti-loop sampling: su comportamiento de fin de turno más estable permite probar parámetros de muestreo como `--dry-multiplier` y `--repeat-penalty` en entornos controlados.

## Benchmarks y rendimiento

Los datos proporcionados son mediciones de retención de probabilidad de siguiente token frente al modelo intacto, sobre un atlas de conocimiento de 8 dominios con 80 sondas. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

| Metrica | Valor |
|---|---|
| Retención media (v40) | 0.648 |
| Retención corte 44L | 0.408 |
| Retención mismo tamaño, atención agrupada al inicio | 0.379 |
| Retención misma regla, 36 capas | 0.441 |
| Control agéntico (v40 vs original) | 0.0922 vs 0.0885 |
| Python (v40 vs original) | 0.0030 vs 0.0023 |
| Ciencia (v40 vs original) | 0.0035 vs 0.0034 |
| Matemáticas (v40 vs original) | ~90% del original |
| Recuerdo multilingüe (v40 vs original) | 58% del original |
| Probabilidad de fin de turno (v40 vs original) | 0.46/0.44 vs 0.53/0.33 |

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. Como referencia, un modelo de 16.8B parámetros en FP16 requiere aproximadamente 33.6 GB de VRAM solo para los pesos, lo que excede GPUs de consumo como la RTX 4090 (24 GB). Con cuantización GGUF de 8 bits, la memoria se reduce a unos 16.8 GB, y con 4 bits a unos 8.4 GB, lo que permitiría ejecutarlo en GPUs de consumo con 12-24 GB. Sin embargo, estos son cálculos estimados y no datos oficiales del autor. Las opciones de despliegue incluyen llama.cpp (por el requisito de patrón de capas), y potencialmente vLLM u Ollama si se adapta el formato. No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

La comparación se realiza con los otros cortes de la misma familia y con el modelo base.

| Modelo | Parametros | Capas | Retencion | Notas |
|---|---|---|---|---|
| Qwen3.8-Whittle-v40 (este) | 16.8B | 40 | 0.648 | Mejor retención de la familia |
| Qwen3.8-Whittle-44L-cut | 19.2B | 44 | 0.408 | Corte contiguo, menor retención |
| Corte mismo tamaño, atención agrupada al inicio | 16.8B | 40 | 0.379 | Misma selección, peor colocación |
| Corte misma regla, 36 capas | 15.1B | 36 | 0.441 | Menos capas, retención intermedia |
| Qwen3.8-27B-FP8 (base) | 27B | No especificado | 1.0 | Modelo intacto, referencia |

No se dispone de comparativas con modelos externos de tamaño similar (por ejemplo, Llama 3 8B o Mistral 7B) en los datos proporcionados.

## Limitaciones y advertencias

- Es un _research preview_ sin entrenamiento de reparación: las capacidades de recall duro pueden estar degradadas.
- El dominio de C++ es el más débil, ya que sus capas críticas no se conservan en el recorte.
- No se garantiza un rendimiento estable en producción; se recomienda aplicar anti-loop sampling (`--dry-multiplier 0.8 --dry-base 1.75 --dry-allowed-length 4 --repeat-penalty 1.15`).
- La retención multilingüe es solo del 58% del original, lo que puede afectar a tareas en idiomas distintos del inglés.
- No hay datos sobre sesgos o alucinaciones específicos, pero al ser un recorte sin ajuste, puede heredar los sesgos del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se ofrece como investigación y sin garantías.

## Enlaces

- [HuggingFace: logic65/Qwen3.8-Whittle-v40-16.8B](https://huggingface.co/logic65/Qwen3.8-Whittle-v40-16.8B)
- [Corte 44L mencionado en la model card](https://huggingface.co/logic65/Qwen3.8-Whittle-44L-cut)
- [Modelo base: Qwen/Qwen3.8-27B-FP8](https://huggingface.co/Qwen/Qwen3.8-27B-FP8)

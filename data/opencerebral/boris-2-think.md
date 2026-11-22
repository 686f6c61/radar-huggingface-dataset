# opencerebral/Boris-2-Think

## Resumen

Boris-2-Think es un modelo de lenguaje causal de 144 millones de parámetros desarrollado por OpenCerebral, un ajuste fino de Boris-2 (entrenado desde cero en una única NVIDIA V100) orientado a la generación de trazas de razonamiento cortas antes de emitir una respuesta final. El modelo escribe su razonamiento dentro de etiquetas `<think>...</think>` y concluye con una línea `Final answer:`, un formato pensado para que las interfaces de chat puedan plegar u ocultar la traza de razonamiento.

El ajuste se realizó sobre OpenThink, un conjunto de destilación de 43.000 trazas cortas de razonamiento verificadas por autoconsistencia y escritas específicamente para modelos de este tamaño. No es un asistente conversacional general: el propio autor lo describe como un modelo de respuesta a preguntas y remite a Boris-2-Instruct para uso conversacional.

Su relevancia radica en que demuestra que un ajuste fino con trazas de razonamiento mejora de forma medible el rendimiento en tareas de razonamiento y ciencia en un modelo por debajo de 150M de parámetros, sin aumentar el tamaño ni el contexto. Según la model card, lidera la media de 9 tareas entre todos los modelos de menos de 150M parámetros evaluados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (custom code en PyTorch, sin dependencias extra, sin KV cache) |
| Parametros totales | 144.192.782 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere trust_remote_code) |

## Arquitectura y entrenamiento

Boris-2-Think es un transformer causal de 144M de parámetros construido sobre Boris-2, un modelo base entrenado desde cero con 200.040 millones de tokens en una única NVIDIA V100. El ajuste fino se realizó sobre OpenThink con una receta híbrida de 42.301 filas de entrenamiento (800 reservadas para validación), con el formato `user question` seguido de `<think>\n{reasoning}\n</think>\n\nFinal answer: {answer}`. La pérdida se calculó únicamente sobre la respuesta del asistente y su `<|im_end|>` de cierre.

El entrenamiento consistió en 2 épocas y 404 pasos, con 16 filas empaquetadas por paso. El checkpoint publicado se eligió tras comparar dos formatos de salida (trazas planas y etiquetas `<think>`) con dos semillas cada uno sobre un evaluador propio: el índice resultó 36,58 y 36,33 para trazas planas, y 36,06 y 36,31 para `<think>`. La diferencia queda dentro de la dispersión entre semillas y se optó por `<think>` por la posibilidad de plegar el razonamiento en front-ends de chat; el checkpoint liberado es el mejor de las dos semillas con `<think>`.

Una particularidad técnica relevante: los turnos estilo ChatML se escriben como texto plano, sin tokens añadidos al vocabulario, y `<|im_end|>` abarca varios tokens y no es token de fin de secuencia, por lo que debe pasarse como cadena de parada. La decodificación voraz funciona mejor para razonamientos cortos.

## Capacidades

- Generación de texto y respuesta a preguntas en inglés con traza de razonamiento explícita en `<think>`.
- Razonamiento aritmético de varios pasos (el ejemplo de la model card resuelve un problema de reparto de lápices paso a paso).
- Razonamiento científico y de sentido común, con mejoras medibles en ARC-Easy, ARC-Challenge y ArithMark-3 frente al modelo base.
- Modo de razonamiento plegable: la traza va dentro de etiquetas que un front-end puede ocultar.
- Formato de salida estructurado con línea `Final answer:` que facilita el parseo automático.
- No soporta tool calling ni function calling según la información disponible.
- No soporta agentes ni razonamiento multi-paso autónomo más allá de la traza única.
- Capacidades multilingües limitadas al inglés.
- No dispone de visión ni audio.

## Casos de uso

- Respuesta a preguntas con trazabilidad: el modelo emite la traza de razonamiento y la respuesta final por separado, lo que permite auditar cómo llegó a la conclusión en entornos educativos o de verificación.
- Tutoría automática de matemáticas básicas: con el formato `<think>` y `Final answer:` se puede mostrar el desarrollo del problema al estudiante y validar la respuesta final de forma programática.
- Evaluación de modelos pequeños: sirve como referencia de hasta dónde llega un modelo de 144M con ajuste de razonamiento, útil en investigación sobre eficiencia y destilación.
- Prototipado en hardware modesto: al ser un modelo de 144M con pesos en safetensors y código PyTorch sin dependencias extra, cabe en cualquier GPU consumer para pruebas rápidas de pipelines de razonamiento.
- Generación de conjuntos de datos sintéticos de razonamiento: sus trazas cortas y autoconsistentes pueden usarse como semilla para destilar otros modelos pequeños.
- Filtrado y clasificación con justificación: para tareas de pregunta-respuesta cerrada donde se necesita una explicación breve junto a la respuesta.
- Demostración de formatos de razonamiento plegable en interfaces de chat: útil para desarrolladores que quieran probar cómo ocultar trazas en un front-end.

## Benchmarks y rendimiento

Resultados declarados por el autor, zero-shot, float32, lm-evaluation-harness 0.4.12 (ajustes del Open SLM Leaderboard). ArithMark-3 usa el script propio del leaderboard sin modificar.

| Benchmark | Metrica | Boris-2 | Boris-2-Think |
|---|---|---:|---:|
| HellaSwag | acc_norm | 50,27 | 50,13 |
| ARC-Easy | acc_norm | 59,76 | 63,93 |
| ARC-Challenge | acc_norm | 32,00 | 34,81 |
| PIQA | acc_norm | 72,85 | 72,31 |
| ArithMark-3 | acc_norm | 45,10 | 49,20 |
| Open SLM Index | indice | 34,15 | 36,05 |

El Open SLM Index se calcula con la fórmula del Open SLM Leaderboard: `(N(HellaSwag,25) + N(media(ARC-E, ARC-C),25) + N(PIQA,50) + 0,65 * N(ArithMark-3,25)) / 3,65`, con `N(v,c) = 100(v-c)/(100-c)`. La mejora se concentra en razonamiento y ciencia: ARC-Easy +4,2, ARC-Challenge +2,8, ArithMark-3 +4,1, SciQ +2,0; HellaSwag y PIQA se mantienen. En la media de 9 tareas del gráfico, Boris-2-Think lidera todos los modelos por debajo de 150M de parámetros con 49,53. Los benchmarks puntúan la verosimilitud de cada opción de respuesta, sin que el modelo genere traza durante la evaluación; la ganancia proviene del efecto del ajuste fino sobre los pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, aproximadamente 0,58 GB solo para pesos (144M × 4 bytes), más activaciones; en float16/bfloat16, alrededor de 0,29 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo base se entrenó en una única NVIDIA V100, y la inferencia funciona igualmente en RTX 4090, RTX 3090, RTX 3060 o GPUs integradas con suficiente memoria.
- Cabe en GPU consumer: sí, en todas las gamas actuales, incluidas portátiles.
- Opciones de despliegue: transformers con `trust_remote_code=True` (único camino documentado por el autor); no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el uso de código personalizado sin KV cache limita la integración con servidores de inferencia estándar.
- Latencia y throughput: no disponibles. El autor señala que la decodificación voraz funciona mejor para razonamientos cortos y que el código no usa KV cache, lo que penaliza la generación de secuencias largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Open SLM Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Boris-2-Think | 144M | no disponible | 36,05 | Apache 2.0 | Hugging Face |
| Boris-2 (base) | 144M | no disponible | 34,15 | Apache 2.0 | Hugging Face |
| Boris-2-Instruct | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |

La model card menciona que Boris-2-Think lidera la media de 9 tareas entre los modelos de menos de 150M de parámetros del Open SLM Leaderboard (49,53), pero no se detallan los modelos concretos de esa comparación ni sus cifras individuales. No se dispone de datos de benchmarks de otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente conversacional general: el autor remite explícitamente a Boris-2-Instruct para conversación multi-turno.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- Riesgo de alucinación inherente a un modelo de 144M de parámetros; las trazas de razonamiento pueden contener pasos incorrectos aunque la respuesta final parezca plausible.
- Los benchmarks declarados no están verificados (`verified: false` en el model-index) y proceden del propio autor.
- `<|im_end|>` no es token de fin de secuencia y abarca varios tokens: si no se pasa como cadena de parada, la generación puede continuar indebidamente.
- Requiere `trust_remote_code=True` por el código personalizado, lo que implica ejecutar código del repositorio y revisarlo antes de usar en producción.
- Sin KV cache, la generación de secuencias largas es ineficiente y no se integra de forma nativa con servidores de inferencia habituales.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo pequeño conviene validar su calidad en el dominio concreto antes de desplegarlo.
- No se documentan sesgos específicos ni composición detallada del corpus de entrenamiento de Boris-2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opencerebral/Boris-2-Think
- Modelo base Boris-2: https://huggingface.co/opencerebral/Boris-2
- Variante conversacional Boris-2-Instruct: https://huggingface.co/opencerebral/Boris-2-Instruct
- Organización en Hugging Face: https://huggingface.co/opencerebral
- Wiki: https://wiki.kunix.org/
- Código: https://git.kunix.org/boris-2
- Autores (OpenCerebral): https://oc.kunix.org/
- Licencia: https://huggingface.co/opencerebral/Boris-2-Think/blob/main/LICENSE
- Resultados comparativos: https://huggingface.co/opencerebral/Boris-2-Think/blob/main/benchmarks_comparison.csv

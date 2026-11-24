# opencerebral/Boris-2-50M

## Resumen

Boris-2-50M es un modelo de lenguajes base de 48,9 millones de parámetros desarrollado por OpenCerebral. Se trata de un modelo destilado del Boris-2 original (144M) que conserva la arquitectura y el tokenizador del profesor a aproximadamente un tercio del tamaño, eliminando la tabla de n-gramas presente en el modelo original. Está pensado como un modelo causal de continuación de texto, no como un modelo de instrucciones ni de chat.

El modelo se entrenó inicialmente con 11 capas y 52,2M de parámetros sobre 5.000 millones de tokens de destilación en una única NVIDIA V100, y posteriormente se podó a 10 capas y se "curó" con 500 millones adicionales de tokens de destilación. Esta aproximación de destilación seguida de poda y recalentamiento es relevante porque permite obtener modelos muy pequeños con un rendimiento razonable en tareas de sentido común y razonamiento elemental, adecuados para entornos con recursos muy limitados.

La arquitectura es un transformer causal con atención multi-cabeza completa, MLP SwiGLU y una innovación denominada "Canon layer": una convolución depthwise causal de 3 taps aplicada sobre la proyección fusionada de query/key/value, de modo que cada posición mezcla las dos posiciones anteriores antes de la atención. El contexto es de 2.048 tokens y el vocabulario de 32.768 tokens con BPE a nivel de byte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) con Canon layer (convolucion depthwise causal de 3 taps sobre QKV) |
| Parametros totales | 48.946.688 (48,9M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (el autor solo menciona pesos en float32 para evaluacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere trust_remote_code) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 10 capas con tamaño oculto 512, 8 cabezas de atención de 64 dimensiones (atención multi-cabeza completa), MLP SwiGLU con dimensión interna 1408 y embeddings de tokens atados a la salida (16,8M de parámetros). Los bloques transformer suman 32,2M de parámetros. Usa codificación posicional RoPE con theta 10.000 y un vocabulario de 32.768 tokens heredado del tokenizador BPE a nivel de byte de Boris-2.

La innovación arquitectónica principal es la Canon layer: una convolución depthwise causal de 3 taps sobre la proyección fusionada de query/key/value, que permite que cada posición incorpore información de las dos posiciones anteriores antes del cálculo de atención. A diferencia de Boris-2, esta versión no incluye tabla de n-gramas. El entrenamiento empaquetó varios documentos por secuencia con atención y Canon enmascaradas en los límites de documento (parámetro `eos_resets_context` en la configuración). El proceso fue: entrenamiento de un modelo de 11 capas y 52,2M sobre 5.000 millones de tokens de destilación, poda de una capa (se probaron dos métodos: eliminar un bloque o estrechar cada MLP; se eligió eliminar un bloque por perder menos antes del recalentamiento) y curación con 500 millones de tokens adicionales. Los datos de entrenamiento provienen de karpathy/climbmix-400b-shuffle, HuggingFaceTB/smollm-corpus, HuggingFaceTB/cosmopedia, openbmb/UltraData-Math, meta-math/MetaMathQA, MU-NLPC/Calc-ape210k, MU-NLPC/Calc-mawps, mlfoundations/dclm-baseline-1.0 y microsoft/orca-math-word-problems-200k.

## Capacidades

- Generación de texto por continuación: el modelo completa texto a partir de un prefijo, sin seguir instrucciones ni mantener formato de chat.
- Razonamiento elemental y sentido común: rendimiento moderado en tareas de elección múltiple como HellaSwag, PIQA, ARC y WinoGrande.
- Conocimiento científico básico: capacidad limitada en SciQ y OpenBookQA.
- Aritmética básica: evaluación específica en ArithMark-2 y ArithMark-3, con resultados modestos pero medibles.
- Capacidades multilingües: únicamente inglés.
- Tool calling / function calling: no soportado (modelo base, no entrenado para ello).
- Agentes y razonamiento multi-paso: no soportado de forma nativa.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en destilación de modelos: sirve como caso de estudio reproducible de destilación, poda de capas y recalentamiento en un presupuesto de una sola V100, útil para investigadores que estudian la relación entre tamaño y rendimiento en modelos pequeños.
- Prototipado de pipelines de generación de texto: al ser un modelo base de menos de 50M de parámetros, permite iterar rápidamente en la lógica de generación (temperatura, top-k, top-p) sin coste de infraestructura.
- Evaluación comparativa de modelos pequeños: su conjunto de benchmarks publicados (nueve tareas más ArithMark) lo hace útil como referencia en estudios comparativos de SLMs.
- Generación de texto en entornos con recursos muy limitados: cabe en CPU y en GPUs de gama baja, por lo que puede desplegarse en dispositivos embebidos o entornos sin acelerador para tareas de continuación de texto de baja exigencia.
- Educación y docencia: modelo pequeño y de código abierto (Apache 2.0) adecuado para explicar arquitecturas transformer, atención causal y técnicas de destilación en cursos prácticos.
- Filtrado o preprocesado de texto: puede usarse para puntuar la verosimilitud de continuaciones y descartar fragmentos incoherentes en pipelines de curación de datos.
- Pruebas de infraestructura de inferencia: su reducido tamaño permite validar configuraciones de vLLM, llama.cpp o TGI y medir latencias base antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (zero-shot, pesos en float32, lm-evaluation-harness 0.4.12, `acc_norm` donde la tarea lo define, si no `acc`). La columna intermedia corresponde a la versión de 11 capas y 52,2M antes de la poda.

| Benchmark | Metrica | Boris-2-50M | Version 11 capas (52,2M) | Boris-2 (profesor, 144M) |
|---|---|---:|---:|---:|
| HellaSwag | acc_norm | 34,77 | 35,64 | 50,27 |
| ARC-Easy | acc_norm | 48,32 | 48,74 | 59,76 |
| ARC-Challenge | acc_norm | 26,79 | 27,05 | 32,00 |
| PIQA | acc_norm | 67,25 | 67,90 | 72,85 |
| MMLU (continuation) | acc | 26,01 | 26,00 | 28,96 |
| WinoGrande | acc | 53,51 | 53,35 | 52,57 |
| OpenBookQA | acc_norm | 31,40 | 31,80 | 36,60 |
| SciQ | acc_norm | 70,80 | 72,90 | 85,10 |
| CommonsenseQA | acc | 19,25 | 19,82 | 20,88 |
| Media de nueve tareas | | 42,01 | 42,58 | 48,78 |
| ArithMark-3 | acc_norm | 38,80 | 38,80 | 45,10 |
| ArithMark-2 | acc | 35,20 | 34,56 | no disponible |
| Open SLM Index | | 20,88 | 21,68 | 34,19 |

El Open SLM Index se calcula con la fórmula del Open SLM Leaderboard: `(N(HellaSwag,25) + N(mean(ARC-E, ARC-C),25) + N(PIQA,50) + 0.65 * N(ArithMark-3,25)) / 3.65`, donde `N(v,c) = 100(v-c)/(100-c)`.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 0,2 GB en float32 (48,9M de parámetros × 4 bytes ≈ 196 MB), más el overhead de activaciones y del runtime; en float16 o bfloat16, aproximadamente 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el autor entrenó el modelo en una única NVIDIA V100, pero la inferencia es viable en GPUs mucho más modestas (GTX 1050, T4, RTX 2060 o superiores).
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente; también es viable en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` (código PyTorch personalizado, el mismo que Boris-2 con la tabla de n-gramas desactivada). No se ha confirmado soporte en vLLM, llama.cpp, Ollama ni TGI en la información disponible; dado que usa `custom_code`, la conversión a GGUF requeriría trabajo adicional.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento (referencia) | Disponibilidad |
|---|---:|---:|---|---|---|
| Boris-2-50M | 48,9M | 2.048 | Apache 2.0 | Media 9 tareas: 42,01; Open SLM Index: 20,88 | Hugging Face |
| Boris-2 (profesor) | 144M | No disponible | Apache 2.0 | Media 9 tareas: 48,78; Open SLM Index: 34,19 | Hugging Face |
| Boris-2-50M (11 capas, pre-poda) | 52,2M | No disponible | Apache 2.0 | Media 9 tareas: 42,58; Open SLM Index: 21,68 | No publicado como checkpoint separado |

No se dispone de datos de benchmarks de otros modelos pequeños comparables (por ejemplo, de la familia SmolLM) en la información proporcionada, por lo que la comparativa se limita a las variantes del propio Boris-2.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones, no mantiene conversaciones y no está alineado con preferencias humanas; no debe usarse directamente como asistente.
- Riesgo elevado de alucinación y de generar texto incoherente, especialmente en contextos largos o temas especializados, dado su reducido tamaño y su rendimiento limitado en MMLU (26,01) y CommonsenseQA (19,25).
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo soporta inglés; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible, pero al entrenarse sobre corpus web (climbmix, dclm, smollm-corpus) es probable que herede sesgos presentes en esos datos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo se distribuye con `custom_code`, por lo que es necesario revisar y confiar en el código remoto (`trust_remote_code=True`) antes de usarlo en producción.
- No se ha realizado selección de checkpoint ni de semilla más allá del checkpoint final de la curación, según indica el autor.
- El rendimiento en tareas de aritmética y razonamiento es modesto (ArithMark-3: 38,80; ARC-Challenge: 26,79); no es adecuado para aplicaciones que requieran precisión factual o razonamiento complejo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opencerebral/Boris-2-50M
- Modelo profesor Boris-2: https://huggingface.co/opencerebral/Boris-2
- Organización en Hugging Face: https://huggingface.co/opencerebral
- Wiki: https://wiki.kunix.org/
- Código: https://git.kunix.org/boris-2
- Autores (OpenCerebral): https://oc.kunix.org/
- Licencia: https://huggingface.co/opencerebral/Boris-2-50M/blob/main/LICENSE

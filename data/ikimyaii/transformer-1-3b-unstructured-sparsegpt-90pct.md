# ikimyaii/Transformer-1.3B-unstructured-SparseGPT-90pct

## Resumen

Transformer-1.3B-unstructured-SparseGPT-90pct es una variante podada del modelo base fla-hub/transformer-1.3B-100B, publicada por el usuario ikimyaii. Se trata de un ejercicio de investigación sobre poda de redes neuronales: el modelo original se ha sometido a una poda no estructurada del 90 % mediante el código oficial de SparseGPT en modo one-shot, es decir, sin reentrenamiento posterior. El resultado es un checkpoint de 1.364.297.728 parámetros (el mismo recuento que el modelo denso, ya que la poda no elimina tensores sino que pone a cero pesos) empaquetado en safetensors con un tamaño de repositorio de 2,7 GB.

El interés del modelo no reside en su utilidad como asistente, sino en su valor como referencia (baseline) para estudiar el impacto de la poda agresiva sin recuperación. El autor lo presenta explícitamente como línea base para los modelos EHWS de su misma cuenta. Los resultados publicados muestran un colapso severo de la perplejidad (de 9,77 a 40.919,93 en WikiText-2 y de 14,65 a 58.559,49 en C4) y una caída de la precisión media zero-shot de 0,4390 a 0,3529, lo que lo convierte en un caso de estudio sobre los límites de la poda one-shot al 90 %.

La relevancia actual es metodológica: permite reproducir y comparar técnicas de poda más sofisticadas frente a un punto de partida conocido, con un protocolo de calibración documentado (128 secuencias de C4 de 2.048 tokens, semilla 0) y con la matemática de poda extraída del código oficial de SparseGPT. No dispone de licencia declarada ni de idiomas especificados, y no se ha publicado información sobre su pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: fla-hub/transformer-1.3B-100B, con capas de atención de flash-linear-attention) |
| Parametros totales | 1.364.297.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la calibración usa secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Poda | No estructurada, 90 % de sparsity, one-shot con SparseGPT (bloques de 128 columnas, damping 0.01) |
| Modelo base | fla-hub/transformer-1.3B-100B |
| Tamano del repositorio | 2,7 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer de 1.300 millones de parámetros de fla-hub, que emplea capas de atención implementadas en la librería flash-linear-attention (requiere `import fla` y, para la capa de atención, `flash-attn`). Sobre esa base no se ha realizado ningún entrenamiento adicional: la única transformación es una poda no estructurada del 90 % aplicada en una sola pasada con el código oficial de SparseGPT (commit IST-DASLab/sparsegpt@147d215, modo `fasterprune`).

El procedimiento de poda utilizó 128 secuencias de calibración de C4 de 2.048 tokens con semilla 0. Los bloques se podaron en orden, calibrando cada bloque sobre las salidas de los bloques ya podados, siguiendo la lógica de los drivers oficiales; el recorrido de capas es código nuevo del autor, mientras que la matemática de poda es la oficial. Los pesos se podaron en bfloat16 y el proceso completo tardó 3,1 minutos en una única A100 de 40 GB. Se podaron todas las capas lineales dentro de los bloques (168 capas), manteniendo embeddings y lm_head densos. La máscara usa un umbral por bloque de 128 columnas, por lo que las filas acaban con distinto número de no ceros: la fila más densa tiene de media 4,24 veces los no ceros de la fila media (peor capa: 9,44 veces).

## Capacidades

- Generación de texto autoregresiva heredada del modelo base denso, aunque degradada de forma severa por la poda.
- Razonamiento y respuesta a preguntas de opción múltiple: evaluado en arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte y winogrande con lm-evaluation-harness.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Valor como referencia de investigación: sirve como baseline reproducible para comparar técnicas de poda y recuperación.

## Casos de uso

- Estudio de la degradación por poda: comparar la perplejidad y la precisión zero-shot de este checkpoint con el modelo denso para cuantificar el coste de una poda one-shot al 90 % sin recuperación.
- Baseline en experimentos de poda: usar este modelo como punto de partida en trabajos que evalúen técnicas de recuperación (fine-tuning tras poda, destilación o poda estructurada) frente a una referencia pública.
- Reproducción metodológica: validar implementaciones propias de SparseGPT replicando el protocolo de calibración documentado (128 secuencias de C4 de 2.048 tokens, semilla 0, bloques de 128 columnas, damping 0.01).
- Análisis de desequilibrio de máscaras: estudiar el efecto de umbrales por bloque de 128 columnas sobre la distribución de no ceros por fila, usando las métricas de densidad publicadas (4,24x de media, 9,44x en la peor capa).
- Investigación sobre eficiencia de memoria: analizar el ahorro teórico de una sparsity no estructurada del 90 % y su brecha frente a la aceleración real en hardware convencional.
- Docencia y divulgación: ilustrar en cursos o tutoriales por qué la poda extrema sin reentrenamiento destruye la calidad del modelo, con cifras concretas de perplejidad y accuracy.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (conjuntos de test WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 9,77 | 14,65 |
| Este modelo | 40.919,93 | 58.559,49 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2355 | 0,2176 |
| arc_easy | 0,5602 | 0,2576 |
| boolq | 0,6199 | 0,5850 |
| hellaswag | 0,3848 | 0,2546 |
| openbookqa | 0,2120 | 0,1760 |
| rte | 0,5126 | 0,4729 |
| winogrande | 0,5478 | 0,5067 |
| Media | 0,4390 | 0,3529 |

Sparsity medida sobre los pesos publicados: 0,9000.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,7 GB solo para pesos (1,36 mil millones de parámetros), más overhead de activaciones y caché KV; el contexto de calibración de 2.048 tokens sugiere requisitos de memoria moderados.
- GPU recomendadas: el autor realizó la poda en una A100 de 40 GB, pero la inferencia del checkpoint podado cabe en GPUs mucho menores; no se han publicado mediciones de latencia ni throughput.
- GPU de consumo: por tamaño de pesos, es previsible que quepa en GPUs de consumo con 8 GB o más de VRAM; no confirmado por el autor.
- Opciones de despliegue: carga mediante `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`) y `flash-attn` para la capa de atención; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Poda | Perplejidad WikiText-2 | Licencia |
|---|---|---|---|---|---|
| Este modelo | 1,36 B | no disponible | 90 % no estructurada, one-shot | 40.919,93 | no disponible |
| fla-hub/transformer-1.3B-100B (base denso) | 1,3 B | no disponible | ninguna | 9,77 | no disponible |
| Alternativas de poda SparseGPT en otros modelos | no disponible | no disponible | 50-60 % típico | no disponible | no disponible |

No se dispone de datos publicados de otros checkpoints podados comparables dentro de la información proporcionada; la única comparación fiable es contra el modelo base denso, cuyos resultados se incluyen en la model card.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 pasa de 9,77 a 40.919,93 y en C4 de 14,65 a 58.559,49; el modelo no es apto para uso en producción como generador de texto.
- Caída de precisión zero-shot: la media baja de 0,4390 a 0,3529, con desplomes notables en arc_easy (0,5602 a 0,2576) y hellaswag (0,3848 a 0,2546).
- Máscaras desequilibradas: el umbral por bloque de 128 columnas produce filas con distinto número de no ceros (hasta 9,44 veces la media en la peor capa), lo que complica el aprovechamiento real de la sparsity.
- Sin reentrenamiento: al ser poda one-shot, no ha habido recuperación de capacidad; cualquier uso práctico requeriría fine-tuning posterior.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial queda sin marco legal claro y debe consultarse con el autor.
- Idiomas no declarados: no hay información sobre cobertura lingüística.
- Dependencias frágiles: requiere `flash-linear-attention` y `flash-attn`, lo que limita la portabilidad del despliegue.
- Riesgo de alucinación: no evaluado en la información disponible; dada la degradación general, es previsible un aumento del texto incoherente.
- Sesgos: no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Transformer-1.3B-unstructured-SparseGPT-90pct
- Modelo base: https://huggingface.co/fla-hub/transformer-1.3B-100B
- Código oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Librería flash-linear-attention: no disponible enlace directo en la información proporcionada
- Paper de SparseGPT: no disponible enlace directo en la información proporcionada

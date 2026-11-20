# ikimyaii/Mamba-370M-unstructured-ELSA-90pct

## Resumen

Mamba-370M-unstructured-ELSA-90pct es un modelo de lenguaje derivado de `state-spaces/mamba-370m-hf` al que se le ha aplicado una poda no estructurada del 90 % mediante ELSA, el método presentado en el paper arXiv:2510.01650. El autor del repositorio, `ikimyaii`, lo publica como línea base de comparación frente a los modelos EHWS del mismo perfil, de modo que sirve para medir el coste real de la poda no estructurada frente a alternativas con estructura de hardware. No es un modelo pensado para uso en producción: es un artefacto de investigación sobre compresión de modelos de espacio de estados.

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo (SSM) con bloques que sustituyen la atención por recurrencia selectiva y convoluciones causales. El checkpoint resultante tiene 423.003.136 parámetros en safetensors (el nombre comercial "370M" corresponde al modelo base), y conserva la tokenización y la configuración del Mamba-370M original. Tras la poda, la capa lineal efectiva queda muy mermada: la esparsidad medida sobre los pesos publicados es de 0,8822, y las filas no están equilibradas (la fila más densa tiene de media 2,48 veces los no-ceros de la media, con un peor caso de 5,37 veces en una capa).

Su relevancia es metodológica: documenta de forma reproducible una receta de poda (ADMM con 4096 pasos, umbral único por capa, 32.768 secuencias de C4 de 2.048 tokens, 2,83 horas en una A100 de 40 GB) y publica tanto perplejidad como evaluación zero-shot, lo que permite contrastar el deterioro que introduce la poda agresiva no estructurada en un SSM. Con perplejidad de 1273,72 en WikiText-2 y 385,26 en C4, el modelo queda lejos de ser utilizable como generador de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados selectivo, SSM) |
| Parametros totales | 423.003.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Mamba-370M se evaluó con secuencias de 2.048 tokens en el entrenamiento de poda) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la evaluación se hizo en bf16 porque Mamba desborda en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `state-spaces/mamba-370m-hf`, un transformer alternativo basado en SSM selectivo: cada bloque contiene proyecciones lineales (`in_proj`, `x_proj`, `out_proj`), una convolución causal (`conv1d`), una proyección de paso temporal (`dt_proj`) y parámetros diagonales `A_log` y `D`. Sobre esa base se aplica ELSA con su configuración oficial: poda no estructurada con un único umbral de magnitud por capa, de modo que cada fila conserva un número distinto de no-ceros. Se podan todas las lineales internas de los bloques; `dt_proj` (aproximadamente el 2 % de los pesos lineales de cada bloque), `conv1d`, `A_log` y `D` se mantienen densos, igual que los embeddings y `lm_head`.

El procedimiento de entrenamiento es ADMM: 4096 pasos, un paso de actualización de la variable auxiliar z cada 32 pasos, batch de 1 con acumulación de 8, learning rate 2e-4, lambda 0,01, precisión bf16, semilla 0 y 32.768 secuencias de C4 de 2.048 tokens tokenizadas con el tokenizador del propio modelo. La ejecución completa requirió 2,83 horas en una única A100 de 40 GB. No se documenta RLHF, DPO ni ajuste fino posterior a la poda. La esparsidad efectiva medida sobre los pesos publicados es 0,8822, ligeramente por debajo del 90 % nominal por el redondeo del umbral por capa.

## Capacidades

- Generación de texto autoregresiva básica, con calidad muy degradada por la poda (perplejidad de 1273,72 en WikiText-2 y 385,26 en C4).
- Razonamiento de sentido común limitado: precisión zero-shot media de 0,3221 en el conjunto de tareas evaluadas.
- Clasificación zero-shot: RTE 0,5271 y Winogrande 0,5067 son los únicos resultados cercanos a un clasificador trivial; ARC-Easy 0,2710, HellaSwag 0,2575, ARC-Challenge 0,1860, BoolQ 0,3783 y OpenBookQA 0,1280 quedan en niveles próximos o por debajo del azar en varias tareas.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta capacidad multilingüe; los idiomas soportados figuran como no disponibles.
- No se documenta modo thinking, visión ni audio.
- Sirve como línea base reproducible para investigación en compresión y esparsidad, no como modelo funcional.

## Casos de uso

- Línea base en experimentos de poda: comparar la curva perplejidad-esparsidad de ELSA no estructurado contra los modelos EHWS del mismo autor, usando exactamente el mismo protocolo de evaluación (WikiText-2 y C4 en bf16) para aislar el efecto de la estructura de la esparsidad.
- Estudio del desequilibrio de filas en poda no estructurada: el propio autor reporta que la fila más densa tiene 2,48 veces la media de no-ceros (peor capa 5,37 veces), lo que permite analizar cómo afecta ese desequilibrio al rendimiento de kernels dispersos y a la latencia real.
- Reproducción de la receta ADMM de ELSA: el repositorio documenta todos los hiperparámetros (4096 pasos, z-step 32, lr 2e-4, lambda 0,01, 32.768 secuencias de C4), de modo que sirve como referencia para reimplementar o validar el método en otros SSM.
- Investigación sobre compresión de modelos de espacio de estados: al mantener densos `dt_proj`, `conv1d`, `A_log` y `D`, el checkpoint permite estudiar qué componentes de Mamba son más sensibles a la poda y cuáles toleran el 90 % de ceros.
- Evaluación de harness: los resultados de lm-evaluation-harness publicados (siete tareas, media 0,3221) permiten calibrar pipelines de evaluación zero-shot sobre modelos podados y detectar artefactos de medición.
- Docencia y divulgación: ejemplo concreto y con números verificables de hasta dónde llega la poda agresiva no estructurada en un modelo de 423 M de parámetros, útil para explicar el compromiso entre compresión y calidad.

## Benchmarks y rendimiento

Perplejidad según el protocolo de ELSA (WikiText-2 y C4, en bf16, ejecución única):

| Metrica | Valor |
|---|---|
| WikiText-2 (perplejidad) | 1273,72 |
| C4 (perplejidad) | 385,26 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Precisión |
|---|---|
| arc_challenge | 0,1860 |
| arc_easy | 0,2710 |
| boolq | 0,3783 |
| hellaswag | 0,2575 |
| openbookqa | 0,1280 |
| rte | 0,5271 |
| winogrande | 0,5067 |
| Media | 0,3221 |

No se han publicado en la información disponible resultados del modelo base sin podar ni de los modelos EHWS con los que se compara, por lo que no es posible cuantificar aquí la pérdida exacta atribuible a la poda.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en safetensors ocupa 1,7 GB, lo que corresponde a unos 0,85 GB en bf16 para los 423 M de parámetros; en fp32 serían aproximadamente 1,7 GB. La evaluación debe hacerse en bf16, ya que Mamba desborda en fp16.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre basta para inferencia en bf16; el entrenamiento de poda documentado se ejecutó en una A100 de 40 GB.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, con margen amplio.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(...)`, tal como indica el autor. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI; la esparsidad no estructurada difícilmente se traduce en aceleración sin kernels específicos.
- Latencia y throughput: no disponibles. La poda no estructurada no garantiza ganancia de velocidad en hardware denso, y el desequilibrio de filas (hasta 5,37 veces la media en la peor capa) complica el aprovechamiento de kernels dispersos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mamba-370M-unstructured-ELSA-90pct (este) | 423.003.136 | no disponible | 1273,72 | no disponible | Hugging Face |
| state-spaces/mamba-370m-hf (base) | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| HGRN-1.3B @80% (referencia de hiperparámetros de ELSA) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye resultados del modelo base ni de los EHWS, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Calidad gravemente degradada: perplejidad de 1273,72 en WikiText-2 y media zero-shot de 0,3221, con tareas como OpenBookQA (0,1280) y ARC-Challenge (0,1860) en niveles propios de un modelo casi aleatorio. No es apto para generación de texto en producción.
- La esparsidad es no estructurada con un umbral por capa: las filas no están equilibradas (2,48 veces la media en promedio, 5,37 veces en el peor caso), lo que limita el aprovechamiento en hardware y dificulta estimar latencia.
- Sesgos conocidos: no documentados en la información disponible; al derivar de un modelo entrenado sobre C4, hereda los sesgos de ese corpus, pero no se han medido.
- Riesgo de alucinación: elevado, coherente con la perplejidad reportada y con la caída de precisión en tareas de sentido común.
- Idiomas soportados: no disponibles; no se ha validado el comportamiento multilingüe.
- Licencia: no disponible, por lo que no puede confirmarse el uso comercial. Al ser un derivado de `state-spaces/mamba-370m-hf`, conviene verificar la licencia del modelo base antes de cualquier uso.
- Ejecución única de evaluación: los resultados provienen de una sola tirada, sin intervalos de confianza ni repeticiones, lo que limita la comparación fina con otros checkpoints.
- No se documenta soporte de tool calling, agentes ni integración con servidores de inferencia; el autor solo garantiza la carga con `transformers`.
- El modelo se publica explícitamente como línea base de investigación, no como artefacto listo para despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-unstructured-ELSA-90pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Paper de ELSA: https://arxiv.org/abs/2510.01650

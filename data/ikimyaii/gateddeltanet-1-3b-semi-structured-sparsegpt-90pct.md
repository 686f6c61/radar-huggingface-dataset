# ikimyaii/GatedDeltaNet-1.3B-semi-structured-SparseGPT-90pct

## Resumen

GatedDeltaNet-1.3B-semi-structured-SparseGPT-90pct es un modelo de lenguaje derivado de m-a-p/1.3B-100B-GatedDeltaNet-pure, publicado por el usuario ikimyaii en Hugging Face. Se trata de un experimento de poda (pruning) one-shot sin reentrenamiento: el modelo base se ha comprimido hasta una esparsidad semi-estructurada del 90% mediante una variante propia del algoritmo SparseGPT, aplicada capa por capa sobre todas las capas lineales internas de los bloques. Las embeddings y la cabeza de salida (lm_head) permanecen densas.

El modelo base pertenece a la familia GatedDeltaNet, una arquitectura de atención lineal con compuertas (gated linear attention) entrenada sobre 100.000 millones de tokens, con aproximadamente 1.466 millones de parámetros totales. La intervención del autor no modifica la arquitectura ni el entrenamiento, sino únicamente los pesos: se aplica una máscara de poda con restricción por fila, de modo que cada fila de cada bloque de 128 columnas conserva exactamente el mismo número de valores no nulos. Esto garantiza un balanceo perfecto del trabajo por fila y sirve como línea base (baseline) frente a los modelos EHWS del mismo autor.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de compresión agresiva de un modelo de atención lineal, un terreno poco explorado frente a los transformers clásicos. Por otro, y de forma crítica, los resultados publicados muestran un deterioro severo de la calidad: la perplejidad en WikiText-2 pasa de 10,31 a 1015,87 y la precisión media zero-shot cae de 0,5123 a 0,3282. El modelo es, por tanto, una referencia metodológica y un punto de comparación, no un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (atención lineal con compuertas, gated linear attention) |
| Parametros totales | 1.466.343.808 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; repo de 2,9 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base m-a-p/1.3B-100B-GatedDeltaNet-pure, un transformer con capas de atención lineal del tipo GatedDeltaNet, entrenado sobre 100.000 millones de tokens según indica el nombre del checkpoint. No se dispone de información adicional sobre la composición del dataset, el uso de RLHF/DPO ni innovaciones de decodificación en la información proporcionada.

La intervención del autor es exclusivamente de poda. Se utiliza el cargador oficial y el código oficial de SparseGPT, pero con un cambio en la máscara: dentro de cada bloque de 128 columnas, cada fila poda el mismo número de entradas de menor magnitud según la regla w²/[H⁻¹]_jj², equivalente a la regla N:M de SparseGPT con M igual al tamaño del bloque. La calibración emplea 128 secuencias de C4 de 2.048 tokens con semilla 0, y los bloques se podan en orden, recalibrando cada uno sobre las salidas de los bloques ya podados. La poda se realizó en bfloat16 y tardó 4,2 minutos en una A100 de 40 GB. La esparsidad medida sobre los pesos finales es de 0,8999, y las 240 capas podadas presentan el mismo número de no nulos por fila.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base GatedDeltaNet.
- Razonamiento y respuesta a preguntas de opción múltiple, aunque con rendimiento muy degradado respecto al denso.
- Procesamiento de secuencias mediante atención lineal, lo que en teoría reduce el coste computacional frente a la atención cuadrática clásica.
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente.
- No se ha documentado soporte multilingüe específico.
- No se ha documentado modo thinking, visión ni audio.
- El modelo está pensado como baseline de investigación en poda, no como asistente de propósito general.

## Casos de uso

- Investigación en compresión de modelos: sirve como referencia cuantitativa del efecto de una poda semi-estructurada al 90% sin reentrenamiento sobre un modelo de atención lineal, permitiendo comparar contra los modelos EHWS del mismo autor.
- Estudio de robustez de arquitecturas de atención lineal: permite analizar cómo degrada la poda agresiva a GatedDeltaNet frente a lo publicado para transformers clásicos.
- Benchmarking de kernels dispersos: al garantizar el mismo número de no nulos por fila en las 240 capas podadas, es útil para validar implementaciones de cómputo disperso con balanceo perfecto de carga.
- Reproducción metodológica: el autor documenta el procedimiento completo (calibración, orden de bloques, código oficial), lo que facilita replicar el experimento y extenderlo a otros checkpoints.
- Evaluación de protocolos de perplejidad: al publicar resultados con el protocolo de ELSA en WikiText-2 y C4, sirve para contrastar pipelines de evaluación.
- Docencia y divulgación: como ejemplo didáctico de los límites de la poda one-shot extrema y de la diferencia entre esparsidad nominal y calidad funcional.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (conjuntos de test WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10,31 | 13,76 |
| Este modelo (90% esparsidad) | 1015,87 | 566,98 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,2142 |
| arc_easy | 0,7222 | 0,2630 |
| boolq | 0,6159 | 0,3820 |
| hellaswag | 0,4629 | 0,2608 |
| openbookqa | 0,2920 | 0,1420 |
| rte | 0,4982 | 0,5271 |
| winogrande | 0,6188 | 0,5083 |
| Media | 0,5123 | 0,3282 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3 GB solo para pesos (1,466 mil millones de parámetros), más overhead de activaciones y caché.
- VRAM estimada en fp16: similar, en torno a 3 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bfloat16; una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe holgadamente en GPU de consumo: RTX 3090, RTX 4090, RTX 4070, e incluso en GPUs de gama media con 8 GB.
- Despliegue: requiere `flash-linear-attention` instalado (`import fla`) y `AutoModelForCausalLM.from_pretrained(...)`. No se ha documentado compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (90% esparsidad) | 1.466 M | no disponible | PPL WikiText-2 1015,87; media zero-shot 0,3282 | no disponible | Hugging Face |
| m-a-p/1.3B-100B-GatedDeltaNet-pure (denso) | ~1,3 B | no disponible | PPL WikiText-2 10,31; media zero-shot 0,5123 | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparación principal es contra el propio modelo denso del que deriva: la poda al 90% multiplica por casi 100 la perplejidad en WikiText-2 y reduce la media zero-shot en 18 puntos porcentuales. No se dispone de datos de otros modelos comparables de atención lineal podada en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 se multiplica por casi 100 y la precisión media zero-shot cae de 0,5123 a 0,3282. No es apto para uso en producción sin un reentrenamiento o ajuste posterior.
- La poda es one-shot y sin recuperación: no hubo fine-tuning tras el pruning, lo que explica en parte el deterioro.
- No se ha documentado la licencia, lo que impide determinar si el uso comercial está permitido. Se debe consultar la licencia del modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure antes de cualquier uso.
- No se han documentado sesgos conocidos, pero al derivar de un modelo entrenado sobre C4 y otros corpus web, es probable que herede sesgos presentes en esos datos.
- Riesgo elevado de alucinación y de generación incoherente dado el nivel de perplejidad observado.
- Idiomas soportados no documentados.
- Longitud de contexto no documentada.
- Requiere la librería `flash-linear-attention` para cargar el modelo; no es un transformer estándar y puede no ser compatible con herramientas de inferencia convencionales.
- El modelo se presenta explícitamente como baseline de investigación, no como artefacto de uso general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-SparseGPT-90pct
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Repositorio flash-linear-attention: no disponible en la información proporcionada
- Paper de SparseGPT: no disponible en la información proporcionada
- Protocolo de evaluación ELSA: no disponible en la información proporcionada
- lm-evaluation-harness: no disponible en la información proporcionada

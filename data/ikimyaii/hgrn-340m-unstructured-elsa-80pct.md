# ikimyaii/HGRN-340M-unstructured-ELSA-80pct

## Resumen

HGRN-340M-unstructured-ELSA-80pct es un modelo de lenguaje derivado de m-a-p/340M-20B-HGRN-pure-baseline, publicado por el usuario ikimyaii en Hugging Face. Se trata de un checkpoint de investigación en el que se ha aplicado poda no estructurada al 80% de dispersión sobre todas las capas lineales internas de los bloques, manteniendo densas las embeddings y la cabeza de lenguaje (lm_head). El modelo conserva el mismo número de parámetros declarados que su base (341.148.672), ya que la poda no elimina pesos del tensor, sino que los pone a cero.

El interés del modelo es metodológico: sirve como referencia (baseline) para la familia de modelos EHWS del mismo autor y reproduce la configuración oficial de ELSA (paper arXiv:2510.01650), un método de poda basado en ADMM. El autor documenta el proceso completo de poda (4096 pasos ADMM, z-step cada 32 pasos, batch 1×8 con acumulación, lr 2e-4, lambda 0.01, bf16, 32.768 secuencias de C4 de 2.048 tokens, semilla 0) y reporta un coste de 2,14 horas en una única A100 de 40 GB.

La relevancia práctica es limitada para producción: la poda al 80% degrada de forma notable la perplejidad y el rendimiento en tareas zero-shot respecto al modelo denso, pero el checkpoint es útil para estudiar métodos de compresión, reproducibilidad de ELSA y el comportamiento de arquitecturas HGRN bajo dispersión extrema. La licencia y los idiomas soportados no están declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Neural Network), transformer recurrente con puertas jerárquicas |
| Parametros totales | 341.148.672 |
| Parametros activos | No aplica (no es MoE); tras poda no estructurada al 80%, aproximadamente el 20% de los pesos de las capas lineales internas son no nulos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un HGRN de 340M de parámetros entrenado sobre 20B tokens (según el nombre del checkpoint base m-a-p/340M-20B-HGRN-pure-baseline). HGRN es una arquitectura de tipo recurrente con puertas jerárquicas que sustituye la atención estándar por recurrencia lineal, lo que reduce el coste de cómputo y memoria en secuencias largas. El proceso de poda se aplica sobre este modelo ya entrenado: no hay un reentrenamiento posterior documentado, sino una compresión mediante ADMM seguida de la fijación de la máscara de dispersión.

La poda es no estructurada: se aplica un único umbral de magnitud por capa, de modo que las filas resultantes tienen distinto número de elementos no nulos. El autor reporta que, en las 168 capas podadas, la fila más densa tiene de media 2,55 veces los no nulos de la fila media, y en el peor caso 4,00 veces. La dispersión medida sobre los pesos publicados es exactamente 0,8000. El procedimiento reproduce la configuración del run HGRN-1.3B al 80% de ELSA, con 4096 pasos ADMM, z-step cada 32 pasos, batch 1×8 con acumulación, lr 2e-4, lambda 0.01, precisión bf16, 32.768 secuencias de C4 de 2.048 tokens tokenizadas con el tokenizador del propio modelo y semilla 0. El entrenamiento de poda consumió 2,14 horas en una A100 de 40 GB.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base HGRN-340M.
- Razonamiento básico y respuesta a preguntas de conocimiento general, aunque degradado respecto al modelo denso (ver benchmarks).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no disponibles en la información proporcionada.
- No se documenta modo thinking, visión, audio ni otras capacidades especiales.
- La carga requiere tener instalada la librería `flash-linear-attention` (`import fla`) y usar `AutoModelForCausalLM.from_pretrained(...)`.

## Casos de uso

- Investigación en compresión de modelos: sirve como referencia reproducible de poda no estructurada al 80% con ELSA, permitiendo comparar nuevas técnicas de poda contra un baseline con hiperparámetros y resultados documentados.
- Estudio de arquitecturas HGRN bajo dispersión: permite analizar cómo se degrada una red recurrente con puertas jerárquicas cuando se elimina el 80% de los pesos lineales, algo relevante para quienes investigan alternativas a la atención.
- Reproducibilidad de experimentos: el autor detalla la configuración exacta (pasos ADMM, semilla, dataset C4, número de secuencias), lo que facilita replicar el pipeline en otros modelos de la misma familia.
- Evaluación de métodos de poda no estructurada: el checkpoint permite medir el impacto de filas desbalanceadas (hasta 4× la media) en la calidad final, un fenómeno poco estudiado en la literatura.
- Docencia y experimentación académica: al ser un modelo pequeño (341M parámetros, repo de 1,4 GB), se puede cargar y analizar en entornos con recursos limitados para estudiar dispersión y poda.
- Benchmarking de herramientas de inferencia dispersa: útil para probar si frameworks de inferencia (por ejemplo, kernels dispersos o librerías de pruning) manejan correctamente máscaras no estructuradas por capa.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluación de ELSA, WikiText-2 y C4, fp16, ejecución única):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 21,96 | 21,94 |
| Este modelo (80% sparsity) | 62,64 | 43,99 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,1809 |
| arc_easy | 0,6153 | 0,4200 |
| boolq | 0,6028 | 0,5832 |
| hellaswag | 0,3423 | 0,2787 |
| openbookqa | 0,2380 | 0,1500 |
| rte | 0,5126 | 0,5271 |
| winogrande | 0,5059 | 0,4964 |
| Media | 0,4400 | 0,3766 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 1,4 GB en safetensors; en bf16/fp16 el modelo ocupa aproximadamente 0,68 GB de pesos, más overhead de activaciones y caché. Cabe holgadamente en GPUs consumer de 8 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; el autor usó una A100 de 40 GB para el proceso de poda (no para inferencia).
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o similares.
- Opciones de despliegue: se requiere `flash-linear-attention` instalado para cargar el modelo con `AutoModelForCausalLM.from_pretrained`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; dado que la arquitectura HGRN no es un transformer estándar y el checkpoint tiene pesos dispersos no estructurados, el soporte en estos frameworks no está garantizado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HGRN-340M-unstructured-ELSA-80pct (este) | 341M | No disponible | No disponible | Hugging Face (0 descargas) | Poda no estructurada al 80%, perplejidad WikiText-2 62,64 |
| m-a-p/340M-20B-HGRN-pure-baseline (base) | 340M | No disponible | No disponible | Hugging Face | Modelo denso de referencia, perplejidad WikiText-2 21,96 |
| HGRN-1.3B (referencia del paper ELSA) | 1,3B | No disponible | No disponible | No disponible en la información | Configuración de poda replicada por este modelo |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 pasa de 21,96 a 62,64 (casi el triple) y en C4 de 21,94 a 43,99; la media zero-shot cae de 0,4400 a 0,3766.
- Dispersión no estructurada y desbalanceada: las filas tienen distinto número de no nulos, con la fila más densa promediando 2,55× la media y hasta 4,00× en el peor caso, lo que complica el aprovechamiento real del ahorro computacional.
- Licencia no declarada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no declarados: se desconoce qué lenguas cubre el modelo base y si la poda afecta de forma desigual a idiomas distintos del inglés (los benchmarks son en inglés).
- Riesgo de alucinación: no evaluado en la información disponible; la degradación por poda probablemente lo incrementa respecto al modelo denso.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en secuencias largas.
- Soporte de frameworks limitado: requiere `flash-linear-attention` y no hay evidencia de compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Modelo de investigación con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento documentado.
- Ejecución única de evaluación: los resultados provienen de una sola ejecución, sin intervalos de confianza ni repeticiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-unstructured-ELSA-80pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Paper de ELSA: https://arxiv.org/abs/2510.01650

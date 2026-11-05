# dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vs234

## Resumen

semsimula-ladder-live-code-d384-l2-none-norc-sr2-vs234 es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro de la familia SemSimula, una línea de trabajo que explora modelos de lenguaje conservativos (energy-based) inspirados en mecánica lagrangiana en lugar de la arquitectura transformer con atención. Este checkpoint concreto, denominado SR4a-CODE en la model card, es una variante de dos capas entrenada sobre código Python del dataset CodeParrot, con 76.572.110 parámetros y una innovación central: el número de pasos de integración N se muestrea por cada paso del optimizador entre {2, 3, 4} sobre un tiempo total T = 8, en lugar de fijarse a un único valor.

El modelo aborda una pregunta de investigación muy específica: si las capas de estos modelos funcionan como una discretización de un flujo dinámico, dividir el mismo tiempo de integración en más pasos (refinamiento) debería producir respuestas casi idénticas. Los modelos entrenados a un número fijo de pasos fallan esa prueba entre 1,4 y 3 nats. Este checkpoint comprueba si entrenar con varios conteos de pasos corrige el problema. El veredicto declarado por el autor es que el refinamiento funciona dentro de la banda entrenada (N = 3 y N = 4 mejoran respecto a N = 2) pero no más allá: a N = 8 se pierden 1,39 nats.

Es relevante ahora como evidencia empírica en la investigación de arquitecturas no-transformer con inferencia de memoria constante, y como artefacto reproducible de un estudio pre-registrado (ladder study) con presupuesto de tokens emparejado (315.392.000 tokens) frente a su modelo de referencia SO-CODE. No es un modelo destinado a producción: es un experimento de ablación de mecanismos con licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No-transformer, sin atención; modelo de lenguaje conservativo (scalar potential) con flujo de segundo orden amortiguado, integración tipo BAOAB, potencial gaussiano anisotrópico, geometría riemanniana (métrica de Jacobi) |
| Parametros totales | 76.572.110 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (evaluado a bloques de 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería pytorch); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura se aparta del transformer: es un modelo de lenguaje conservativo donde cada capa avanza los estados de los tokens un paso Δt de un flujo amortiguado de segundo orden, con un potencial escalar que define la dinámica. El checkpoint usa dos capas (L = 2) sobre un tiempo de integración total T = 8, de modo que un paseo de N pasos emplea Δt = 8/N y el paso j utiliza la capa ⌊jL/N⌋. Incorpora integración BAOAB, potencial gaussiano anisotrópico, espacio de Fock, geometría riemanniana con geodésicas y métrica de Jacobi, y decodificación de paso variable. La inferencia es de memoria constante y sin atención.

El entrenamiento consumió exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) sobre los batches de SO-CODE, con el schedule WSD del estudio a lo largo de 16.250 pasos y 3.000 adicionales en el suelo, desde el paso 0 con semilla 0. La innovación clave es que el número de pasos N se sortea por cada paso del optimizador entre {2, 3, 4} mediante un generador separado, de forma que los batches y las evaluaciones quedan emparejados con SO-CODE. No se añade ningún parámetro: el conteo de pasos es una propiedad del paseo, no de los pesos. La ejecución completó 19.250 pasos en 8,3 horas (1,55 s por paso, sin checkpointing de capas), con pico de memoria de 60,5 GB en entrenamiento (un paso N = 4 retiene las activaciones de cuatro pasos de capa) y 46,2 GB en evaluación; sin normas de gradiente no finitas, mediana de norma de gradiente de 0,45 tras el paso 2.000 y máximo de 1,94 en el paso 750 (warmup), y monitor de fuga SCAF limpio en los pasos 5.000, 10.000 y 15.000.

## Capacidades

- Generación de texto autoregresiva sobre código Python y texto en inglés.
- Modelado de lenguaje a nivel de token con flujo conservativo de segundo orden; no emplea atención.
- Inferencia de memoria constante, independiente de la longitud de la secuencia en lo que respecta al mecanismo de atención (no hay atención).
- Refinamiento variable: al aumentar N dentro de la banda entrenada (3 y 4) el modelo mejora su perplejidad en lugar de degradarse.
- No dispone de tool calling ni function calling documentado.
- No dispone de soporte de agentes ni de razonamiento multi-paso documentado.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo thinking, visión ni audio.
- No se documentan capacidades de matemáticas o razonamiento general más allá del modelado de código.

## Casos de uso

- Investigación en arquitecturas no-transformer: sirve como artefacto reproducible para estudiar si la profundidad de capas equivale a pasos de integración de un flujo, comparando N = 2, 3, 4 frente a N = 6 y 8 con el mismo conjunto de pesos.
- Ablación de mecanismos pre-registrada: el checkpoint forma parte de un estudio ladder con presupuesto de tokens emparejado, útil para replicar la comparación por pares con SO-CODE y medir la diferencia en nats de log-perplejidad a lo largo del entrenamiento.
- Estudio de refinamiento en modelos de lenguaje: permite verificar experimentalmente la hipótesis de que entrenar con varios conteos de pasos corrige la falta de refinamiento fuera de la banda entrenada, con la tabla de penalizaciones ln(PPL_N/PPL_2) como referencia.
- Modelado de código Python a pequeña escala: con 76,5 M de parámetros y perplejidad de validación de 6,14 a bloque 512, es adecuado para experimentos controlados de modelado de lenguaje sobre CodeParrot, no para generación de código en producción.
- Investigación en modelos energy-based y física informada: el uso de potencial escalar, BAOAB y geometría riemanniana lo hace útil para estudiar dinámicas conservativas aplicadas a secuencias discretas.
- Reproducción de estudios de memoria y cómputo: los datos de pico de memoria (60,5 GB en entrenamiento con N = 4, 46,2 GB en evaluación) y de tiempo por paso (1,55 s) sirven para planificar réplicas en hardware similar.
- Docencia e investigación doctoral: como ejemplo didáctico de modelo sin atención con inferencia de memoria constante y de diseño experimental con múltiples conteos de pasos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| text-generation | CodeParrot clean (Python), validation | Perplejidad de validación a bloque 512, asentada (media de las tres evaluaciones de 500 pasos en bloque 512) | 6,1423 |

Comparación por pares con SO-CODE (diferencia media en log-perplejidad, con desviación estándar de las diferencias por evaluación):

| Pasos | SR4a-CODE − SO-CODE (nats) | SD | Evaluaciones |
|---|---:|---:|---:|
| 2.000–4.000 | +0,052 | 0,019 | 5 |
| 8.000–10.500 | +0,049 | 0,011 | 6 |
| 11.000–16.000 | +0,034 | 0,007 | 11 |
| 16.000–19.000 | +0,025 | 0,002 | 7 |

Evolución de la perplejidad durante el entrenamiento (SO-CODE frente a SR4a-CODE):

| Paso | SO-CODE | SR4a-CODE | Diferencia |
|---:|---:|---:|---:|
| 500 | 44,02 | 49,55 | +12,6% |
| 1.000 | 25,13 | 28,93 | +15,1% |
| 1.500 | 20,33 | 22,50 | +10,7% |
| 2.000 | 17,67 | 18,91 | +7,0% |
| 2.500 | 15,80 | 16,35 | +3,5% |
| 3.000 | 12,96 | 13,46 | +3,9% |
| 4.000 | 10,62 | 11,12 | +4,7% |
| 5.000 | 9,27 | 9,68 | +4,4% |
| 8.000 | 7,96 | 8,26 | +3,8% |
| 10.000 | 7,45 | 7,91 | +6,2% |
| 13.000 | 6,38 | 6,65 | +4,2% |
| 16.000 | 6,12 | 6,27 | +2,5% |
| 18.000 | 5,87 | 6,03 | +2,7% |
| 19.000 | 6,10 | 6,24 | +2,3% |

Prueba de refinamiento (Gate 3, Cell 6b-7), penalización ln(PPL_N / PPL_2) en nats sobre 12 batches fijos de 4 × 512 tokens:

| N | Δt | ¿Entrenado? | PPL SR4a-CODE | Penalización | PPL SO-CODE | Penalización |
|---:|---:|---|---:|---:|---:|---:|
| 2 | 4,00 | sí | 5,21 | 0 | 5,06 | 0 |
| 3 | 2,67 | sí | 5,01 | −0,039 | 9,59 | +0,639 |
| 4 | 2,00 | sí | 5,07 | −0,027 | 20,91 | +1,418 |
| 6 | 1,33 | no | 8,17 | +0,450 | 50,95 | +2,311 |
| 8 | 1,00 | no | 20,98 | +1,394 | 77,39 | +2,727 |

Pérdida de entrenamiento en los pasos 16.000–19.250 por conteo de pasos: N = 2: 1,712; N = 3: 1,677; N = 4: 1,688. El modelo se ajusta mejor a N = 3, no al N = 2 con el que se evalúa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita para pesos en FP32/FP16/BF16; el modelo tiene 76,5 M de parámetros, lo que en FP32 supone aproximadamente 0,3 GB solo de pesos (el tamaño del repo es de 0,3 GB), más estados de activación durante el paseo.
- Memoria de evaluación declarada: 46,2 GB en el entorno de entrenamiento/evaluación del autor, aunque esa cifra corresponde al pipeline completo con 12 batches de 4 × 512 tokens y no al peso del modelo aislado.
- GPU recomendadas: no disponibles en la información proporcionada. El pico de 60,5 GB en entrenamiento (N = 4) sugiere GPUs de clase A100 80 GB o H100 para réplicas del entrenamiento; para inferencia del checkpoint aislado no se especifica.
- ¿Cabe en GPU consumer? No disponible. Con 76,5 M de parámetros el peso cabría en cualquier GPU consumer moderna, pero el autor no documenta requisitos de inferencia para este checkpoint.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; la librería declarada es PyTorch y el código de referencia es un notebook propio del estudio.
- Latencia y throughput: 1,55 s por paso de entrenamiento en el hardware del autor; no se publican cifras de latencia ni throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (CodeParrot valid, bloque 512) | Refinamiento a N = 8 | Licencia |
|---|---:|---|---:|---|---|
| semsimula-ladder-live-code-d384-l2-none-norc-sr2-vs234 (SR4a-CODE) | 76.572.110 | No disponible | 6,14 (asentada) | +1,394 nats | CC-BY-4.0 |
| SO-CODE (semsimula-ladder-live-code-d384-l2-none-norc-sr2) | 76.572.110 | No disponible | 6,00 | +2,727 nats | CC-BY-4.0 (según colección del autor) |
| Modelos transformer de código de tamaño comparable | No disponible | No disponible | No disponible | No aplica | No disponible |

La comparación relevante es interna a la familia SemSimula: SR4a-CODE frente a SO-CODE, su gemelo entrenado a N fijo = 2. Ambos comparten arquitectura, parámetros y datos; la única diferencia es el muestreo de N entre {2, 3, 4}. No se dispone de comparaciones con modelos transformer de código de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación, no de producción: es un artefacto de un estudio de ablación pre-registrado, sin validación fuera de su entorno experimental.
- El refinamiento solo funciona dentro de la banda entrenada: a N = 6 la penalización es +0,450 nats y a N = 8 es +1,394 nats, con un empeoramiento que creció durante el entrenamiento.
- Coste en la banda entrenada: a N = 2 la perplejidad asentada es 6,14 frente a 6,00 de SO-CODE, un +2,5%; el modelo se ajusta mejor a N = 3 que al N = 2 con el que se evalúa.
- Sesgos conocidos: no documentados por el autor; al entrenarse solo con CodeParrot (Python) y en inglés, no cabe esperar cobertura multilingüe ni de dominios ajenos al código.
- Riesgo de alucinación: no evaluado; no hay benchmarks de fidelidad, razonamiento ni generación de código ejecutable.
- Limitaciones de contexto e idioma: evaluado únicamente a bloques de 512 tokens y solo en inglés; no se documenta ventana de contexto mayor.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución, pero al ser un modelo de investigación sin garantías de calidad, su uso comercial no está respaldado por evaluaciones.
- Caveat de producción: la auditoría del paso 19.250 imprimió perplejidades NaN, como en la mayoría de ejecuciones del notebook del autor; el valor asentado se calcula con las evaluaciones de los pasos 18.000, 18.500 y 19.000.
- Sin soporte documentado de tool calling, agentes ni cuantización, lo que limita su integración en pipelines estándar de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vs234
- Modelo de referencia SO-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Colección del estudio (depth-on-code, Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-depth-on-code-6ae76925374cab20b1cb7d5e
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset de validación: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid

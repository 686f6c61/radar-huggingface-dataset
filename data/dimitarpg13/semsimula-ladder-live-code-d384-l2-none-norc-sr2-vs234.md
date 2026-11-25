# dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vs234

## Resumen

`semsimula-ladder-live-code-d384-l2-none-norc-sr2-vs234` (abreviado SR4a-CODE) es un modelo de lenguaje de investigación desarrollado por el usuario de Hugging Face `dimitarpg13` dentro de la familia SemSimula. No es un transformer ni un modelo de atención: es un modelo de lenguaje conservativo basado en un potencial escalar y en mecánica lagrangiana, donde cada capa avanza los estados de los tokens mediante un paso de un flujo amortiguado de segundo orden. El modelo se entrena sobre código Python (CodeParrot clean) y su propósito es estudiar experimentalmente si las capas de la red se comportan como una discretización de un flujo continuo, un fenómeno conocido como *refinement*.

Este ejemplar concreto pertenece a la generación 3 del estudio y aborda una pregunta muy específica: si un modelo entrenado con un número fijo de pasos de integración falla al refinar (aumentar el número de pasos con el mismo tiempo total T = 8), ¿se corrige entrenando con varios recuentos de pasos a la vez? La respuesta del autor es matizada: el refinamiento funciona dentro de la banda entrenada (N = 3 y N = 4) pero no más allá (N = 6 y N = 8), y el precio en el punto de evaluación N = 2 es un 2,5 % de perplejidad adicional.

El modelo tiene 76.572.110 parámetros, se entrenó con exactamente 315.392.000 tokens y declara una perplejidad de validación de 6,1423 en CodeParrot clean (bloque de 512 tokens). Es relevante ahora como evidencia empírica en la investigación de arquitecturas no-transformer con inferencia de memoria constante, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (scalar-potential, lagrangian-mechanics), no-transformer, sin atención, flujo amortiguado de segundo orden con integrador BAOAB y potencial gaussiano anisotrópico |
| Parametros totales | 76.572.110 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (librería pytorch; repo de 0,3 GB) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer: se describe como un modelo de lenguaje conservativo (*conservative-language-model*) en el que cada capa avanza los estados de los tokens un paso Δt de un flujo amortiguado de segundo orden, con un potencial escalar y geometría riemanniana (métrica de Jacobi, geodésicas riemannianas). Emplea el integrador BAOAB (variante de dinámica molecular) y un potencial gaussiano anisotrópico, con inferencia de memoria constante y sin atención. El modelo tiene dos capas (d384-l2) y se entrena con un presupuesto de tokens emparejado (*matched-token-budget*) con el modelo base SO-CODE.

El entrenamiento usó exactamente 315.392.000 tokens (19.250 pasos × 32 × 512), con el schedule WSD del estudio: 16.250 pasos de decaimiento y 3.000 en el suelo, desde el paso 0, semilla 0, sobre los mismos batches que SO-CODE. La innovación clave es que el número de pasos de integración N se sortea en cada paso del optimizador entre {2, 3, 4}, de modo que el paso j de una caminata usa la capa entrenada ⌊jL/N⌋; no se añade ningún parámetro nuevo, ya que el recuento de pasos es una propiedad de la caminata, no de los pesos. El run se completó en 8,3 horas (1,55 s por paso), con pico de memoria de 60,5 GB en entrenamiento y 46,2 GB en evaluación, sin normas de gradiente no finitas y con el monitor de fugas SCAF limpio en los puntos de control.

## Capacidades

- Generación de texto y modelado de lenguaje sobre código Python, con perplejidad de validación de 6,1423 en CodeParrot clean (bloque 512).
- Modelado autoregresivo de secuencias de tokens con inferencia de memoria constante (sin caché KV de atención).
- Refinamiento de la integración dentro de la banda entrenada: a N = 3 y N = 4 la perplejidad mejora respecto a N = 2 (penalizaciones de −0,039 y −0,027 nats).
- Capacidad de evaluación con distintos recuentos de pasos (N = 2, 3, 4, 6, 8) sobre el mismo tiempo de integración T = 8.
- No dispone de tool calling, function calling, soporte de agentes, visión, audio ni modo de razonamiento explícito según la información disponible.
- Capacidades multilingües: solo inglés (etiqueta `en`); el corpus es código Python.

## Casos de uso

- Investigación sobre arquitecturas no-transformer: el modelo sirve como banco de pruebas reproducible para estudiar si las capas de una red se comportan como la discretización de un flujo continuo, comparando directamente con SO-CODE paso a paso.
- Estudio de refinamiento numérico en redes profundas: permite medir la penalización en nats al cambiar el número de pasos de integración (N = 2 a 8) con el mismo T, un experimento difícil de plantear en transformers convencionales.
- Ablación de mecanismos con control pre-registrado: el diseño emparejado con SO-CODE (mismos batches, mismas evaluaciones) lo hace adecuado para experimentos controlados de una sola variable.
- Modelado de código Python a pequeña escala: con 76,6 M de parámetros y perplejidad de 6,14 en CodeParrot clean, puede usarse para experimentos de lenguaje sobre código donde el coste computacional sea crítico.
- Inferencia con memoria constante: su naturaleza sin atención y de memoria constante lo hace útil para estudiar despliegues en entornos con restricciones de memoria frente a modelos con caché KV creciente.
- Reproducción de resultados de la generación 3: el autor documenta tiempos, memoria, salud del run y curvas de entrenamiento, lo que facilita replicar o auditar el experimento.
- Docencia e ilustración de modelos basados en energía: útil para explicar modelos de lenguaje basados en energía y mecánica lagrangiana frente a la atención estándar.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en CodeParrot clean (Python), split de validación, perplejidad en bloque 512:

| Metrica | Valor |
|---|---|
| Perplejidad de validación (asentada, media de las tres evaluaciones de 500 pasos en bloque 512) | 6,1423 |
| Mejor perplejidad | 6,03 (paso 18.000) |
| Perplejidad de referencia SO-CODE | 6,00 |
| Coste frente a SO-CODE | +2,5 % |

Comparación por pasos de integración (penalización en nats, ln(PPL_N/PPL_2), sobre 12 batches fijos de 4 × 512 tokens):

| N | Δt | Entrenado con ese N | Perplejidad SR4a-CODE | Penalizacion | Perplejidad SO-CODE | Penalizacion SO-CODE |
|---:|---:|---|---:|---:|---:|---:|
| 2 | 4,00 | sí | 5,21 | 0 | 5,06 | 0 |
| 3 | 2,67 | sí | 5,01 | −0,039 | 9,59 | +0,639 |
| 4 | 2,00 | sí | 5,07 | −0,027 | 20,91 | +1,418 |
| 6 | 1,33 | no | 8,17 | +0,450 | 50,95 | +2,311 |
| 8 | 1,00 | no | 20,98 | +1,394 | 77,39 | +2,727 |

Diferencia emparejada frente a SO-CODE a lo largo del entrenamiento (media de la diferencia en log-perplejidad y desviación típica):

| Pasos | SR4a-CODE − SO-CODE (nats) | SD | Evaluaciones |
|---|---:|---:|---:|
| 2.000–4.000 | +0,052 | 0,019 | 5 |
| 8.000–10.500 | +0,049 | 0,011 | 6 |
| 11.000–16.000 | +0,034 | 0,007 | 11 |
| 16.000–19.000 | +0,025 | 0,002 | 7 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el autor reporta 46,2 GB de pico en evaluación con el pipeline del cuaderno, incluyendo batches de evaluación y estados intermedios.
- Entrenamiento: 60,5 GB de pico de memoria (un paso con N = 4 mantiene las activaciones de cuatro pasos de capa).
- GPU recomendadas: no especificadas; por el uso de memoria reportado, se requiere al menos una GPU de 48 GB (A6000, A100 40/80 GB, H100) para reproducir el flujo del autor. Para inferencia ligera de los pesos (76,6 M de parámetros, repo de 0,3 GB) cabría en GPUs de consumo, pero no hay datos publicados de despliegue.
- Cabe en GPU de consumo: los pesos en precisión completa ocupan del orden de 0,3 GB, pero el autor no documenta inferencia en GPUs de consumo ni cuantizaciones.
- Opciones de despliegue: no disponible; el modelo usa PyTorch y un cuaderno propio, sin soporte declarado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 1,55 s por paso de entrenamiento en el hardware del autor; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad (CodeParrot clean, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SR4a-CODE (este modelo) | 76.572.110 | no disponible (bloques de 512) | 6,1423 (asentada) | cc-by-4.0 | Hugging Face |
| SO-CODE (modelo base del estudio) | 76,57 M | no disponible (bloques de 512) | 6,00 | cc-by-4.0 | Hugging Face |
| Variante de ocho capas con dos pozos (colección del autor) | no disponible | no disponible | no disponible | cc-by-4.0 | Hugging Face (colección depth-on-code) |

No se dispone de comparación con transformers de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- El refinamiento solo funciona dentro de la banda entrenada: a N = 6 la penalización es +0,450 nats y a N = 8 asciende a +1,394 nats, un coste que creció durante el entrenamiento.
- El precio en el punto de evaluación N = 2 es +2,5 % de perplejidad frente a SO-CODE (6,14 frente a 6,00); el modelo se ajusta mejor a N = 3 que al N = 2 con el que se evalúa.
- La perplejidad declarada no está verificada (`verified: false`); además, la auditoría del paso 19.250 imprimió perplejidades `nan`, como en la mayoría de runs del cuaderno del autor.
- Solo soporta inglés y está entrenado exclusivamente sobre código Python (CodeParrot clean); no hay evidencia de capacidades generales de lenguaje natural.
- No hay datos publicados sobre sesgos, alucinación, cuantización, contexto máximo efectivo ni latencia de inferencia.
- Es un artefacto de investigación con fines de ablación de mecanismos, no un modelo listo para producción; carece de tool calling, agentes y modo de razonamiento.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero el modelo no ofrece garantías de calidad para tareas reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vs234
- Modelo base SO-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Colección depth-on-code (generación 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-depth-on-code-6ae76925374cab20b1cb7d5e
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset de validación: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid

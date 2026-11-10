# dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2

## Resumen

`semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2`, abreviado PM2-CODE, es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro del proyecto Semantic Simulation. No es un transformer: se trata de un modelo de lenguaje conservativo, sin atención, construido sobre mecánica lagrangiana con un potencial escalar y dinámica de segundo orden (posición y velocidad), que se integra numéricamente con un esquema BAOAB. Este ejemplar concreto añade dos "pozos" de modo Poisson (PM2, con 16 modos por pozo) y se entrena sobre código Python del corpus CodeParrot clean.

El modelo forma parte de un estudio escalonado (ladder study) pre-registrado que compara, par a par, variantes de primer y segundo orden con presupuesto de tokens idéntico. La pregunta central es si el núcleo conservativo necesita dinámica de segundo orden o si un modelo de primer orden entrenado igual rinde lo mismo. En este caso, con 315,4 millones de tokens de entrenamiento y 19.250 pasos, PM2-CODE alcanza una perplejidad de validación de 5,71 (media de las tres últimas evaluaciones a bloque 512), frente a 6,00 de su gemelo sin pozos.

Su relevancia es fundamentalmente científica: aporta evidencia empírica sobre arquitecturas alternativas al transformer con inferencia de memoria constante, y publica resultados pre-registrados con pares emparejados por paso. No está pensado como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (energy-based, lagrangiano), sin atención, con potencial gaussiano anisotrópico y 2 pozos de modo Poisson (16 modos/pozo); integración BAOAB de segundo orden |
| Parametros totales | no disponible (dimensión d=384, L=2 según el identificador del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado y evaluado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (librería PyTorch; repositorio de 0,3 GB) |

## Arquitectura y entrenamiento

La arquitectura sustituye la atención por un sistema dinámico conservativo: el estado del modelo evoluciona según un potencial escalar (gaussiano anisotrópico) con dos pozos de modo Poisson que actúan como registros de modo, y la dinámica es de segundo orden (con velocidad e inercia), integrada mediante el esquema BAOAB. El modelo está etiquetado como `parflm`, `attention-free`, `non-transformer` y con `constant-memory-inference`, es decir, memoria de inferencia constante independiente de la longitud de secuencia. La geometría se describe como riemanniana, con geodésicas y métrica de Jacobi.

El entrenamiento usa exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) en una sola sesión sobre `codeparrot/codeparrot-clean-train`, con el schedule WSD del estudio durante 16.250 pasos y 3.000 pasos adicionales a la tasa de aprendizaje mínima. Los cuatro modelos de código del estudio parten del paso 0, semilla 0 y los mismos lotes, de modo que sus evaluaciones están emparejadas paso a paso (correlación de 0,987 entre este par). No se documenta RLHF ni DPO; el estudio es de ablación de mecanismo con protocolo pre-registrado (sección §5.13, conjunto MS5).

## Capacidades

- Generación de texto autoregresiva en inglés, orientada a código Python.
- Modelado de lenguaje sobre código: el checkpoint está entrenado exclusivamente con CodeParrot clean.
- Inferencia con memoria constante, sin coste de atención cuadrático en la longitud de secuencia.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Capacidad multilingüe: solo inglés declarado.
- Uso previsto: investigación y ablación de mecanismos, no despliegue en producción.

## Casos de uso

- Estudio de ablación de arquitecturas: comparar directamente PM2-CODE con su gemelo de primer orden FO-b-PM2-CODE y con SO-CODE para medir el efecto de los pozos de modo Poisson y del orden de la dinámica, con evaluaciones emparejadas por paso.
- Investigación en modelos basados en energía: servir como referencia reproducible de un modelo de lenguaje conservativo con potencial escalar y dinámica lagrangiana sobre un corpus de código.
- Experimentos de inferencia de memoria constante: validar escenarios de generación de secuencias largas donde el coste de memoria no debe crecer con la longitud, gracias a la propiedad `constant-memory-inference`.
- Reproducción de estudios pre-registrados: reutilizar el protocolo (tokens exactos, schedule WSD, semilla 0, lotes compartidos) para replicar las predicciones CODE3, CODE4 y CODE5.
- Docencia e ilustración de mecánica lagrangiana aplicada al aprendizaje automático: el modelo y sus pares permiten explicar integradores BAOAB, geodésicas riemannianas y potenciales gaussianos en un contexto de modelado de lenguaje.
- Evaluación comparativa frente a transformers pequeños: usar la perplejidad a bloque 512 sobre CodeParrot clean como punto de referencia para calibrar la brecha entre arquitecturas conservativas y un GPT-2 emparejado (d=384, L=8).

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre CodeParrot clean (Python), split de validación, perplejidad a bloque 512:

| Modelo | Orden | Pozos Poisson | Tokens | Perplejidad validación |
|---|---|---|---:|---:|
| PM2-CODE (este modelo) | Segundo | 2 (PMX16) | 315M | 5,71 |
| FO-b-PM2-CODE | Primero | 2 (PMX16) | 315M | 5,62 |
| SO-CODE | Segundo | Ninguno | 315M | 6,00 |
| FO-b-CODE | Primero | Ninguno | 315M | 6,55 |
| GPT-2 emparejado (d=384, L=8) | Transformer | no aplica | 315M | 4,96 |

Detalle de PM2-CODE: 5,71 es la media de las evaluaciones en los pasos 18.000, 18.500 y 19.000 (5,60, 5,73 y 5,80); mejor valor 5,60 en el paso 18.000. Frente a SO-CODE mejora un 4,7% y queda un 15,1% por detrás del GPT-2 emparejado (SO-CODE, un 20,9% por detrás). Predicciones pre-registradas: CODE3 (FO-b-PM2-CODE dentro de ±2% de PM2-CODE) acertada con −1,6%; CODE4 (los pozos ayudan más al primer orden) acertada, 0,153 nats frente a 0,049.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 0,3 GB, lo que sugiere un modelo pequeño que probablemente cabe en cualquier GPU consumer, pero no se publican cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: presumiblemente sí por el tamaño del repositorio, aunque no está confirmado en la información disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el modelo es PyTorch puro y requiere el código del proyecto Semantic Simulation para ejecutarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Perplejidad (CodeParrot clean, bloque 512) | Licencia |
|---|---|---|---|---|---|
| PM2-CODE (este) | Conservativa, 2.º orden, 2 pozos | no disponible (d=384, L=2) | no disponible | 5,71 | CC-BY-4.0 |
| FO-b-PM2-CODE | Conservativa, 1.er orden, 2 pozos | no disponible | no disponible | 5,62 | CC-BY-4.0 |
| SO-CODE | Conservativa, 2.º orden, sin pozos | no disponible | no disponible | 6,00 | CC-BY-4.0 |
| GPT-2 emparejado | Transformer | no disponible (d=384, L=8) | no disponible | 4,96 | no disponible (no publicado en el Hub) |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción ni para uso general; su pipeline es `text-generation` pero su propósito es la ablación de mecanismos.
- Solo inglés y solo código Python: no se ha entrenado con otros idiomas ni con texto general en este checkpoint.
- Perplejidad alta en términos absolutos (5,71) y un 15,1% por detrás de un GPT-2 emparejado; no es competitivo con transformers del mismo presupuesto.
- Riesgo de alucinación no evaluado: no se publican métricas de fidelidad, veracidad ni seguridad.
- Sesgos no documentados: el corpus CodeParrot clean puede arrastrar sesgos de código público, pero no se analizan.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el autor no declara garantías ni idoneidad para producción.
- Requiere el código del proyecto Semantic Simulation (integrador BAOAB, potencial, métrica de Jacobi); no es un checkpoint estándar cargable con `transformers`.
- Resultados no verificados (`verified: false` en el model-index): las cifras proceden del propio autor y no han sido replicadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2
- Gemelo de primer orden FO-b-PM2-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2-fob
- SO-CODE (sin pozos): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- FO-b-CODE (primer orden, sin pozos): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob
- Variante OpenWebText PM2-PMX16: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2
- Variante TinyStories PM2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2
- Colección first-vs-second-order: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset de validación: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid

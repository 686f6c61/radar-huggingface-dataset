# dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2

## Resumen

`semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2` (abreviado PM2-TS en la model card) es un modelo de lenguaje de investigación desarrollado por el usuario de HuggingFace `dimitarpg13` dentro de la familia Semantic Simulation ("semsimula"). No es un transformer: se describe como un modelo de lenguaje conservativo, sin atención, construido sobre un potencial escalar y dinámica lagrangiana de segundo orden, con decodificación basada en integración (BAOAB) y geometría riemanniana. El modelo se entrena sobre TinyStories y su propósito no es competir en calidad con LLMs de producción, sino resolver una pregunta experimental concreta: si el núcleo conservativo necesita dinámica de segundo orden (velocidad e inercia) o si un modelo de primer orden entrenado igual rinde lo mismo.

Esta ficha concreta es el brazo "PM2-PMX16" del estudio escalonado (ladder study): núcleo conservativo con 2 pozos de modo Poisson, segundo orden y 16 registros (pmx16), sobre TinyStories. Según la model card, los pozos mejoran el resultado en este corpus (perplejidad 4,99 frente a 5,16 del modelo sin pozos, un −3,4%), y su gemelo de primer orden queda prácticamente empatado (4,96, −0,5%). El entrenamiento está pre-registrado (protocolo §5.13, predicciones TS4 y TS2 confirmadas) y consume exactamente 315.392.000 tokens.

Su relevancia es metodológica: ofrece un punto de comparación reproducible, con presupuesto de tokens y curva de learning rate idénticos, entre arquitecturas alternativas a la atención y sus equivalentes de primer orden, además de un GPT-2 ajustado al mismo presupuesto como referencia externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo no transformer, sin atención: potencial escalar con 2 pozos de modo Poisson, dinámica de segundo orden (lagrangiana), integrador BAOAB, potencial gaussiano anisotrópico, registros de modo Poisson (16), geometría riemanniana con métrica de Jacobi |
| Parametros totales | No disponible (la nomenclatura indica dimensión de modelo 384 y 2 capas; el autor no publica el recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (bloque de entrenamiento y evaluación) |
| Tipos de cuantizacion | No disponible; no se publican versiones cuantizadas (ni GGUF ni GPTQ/AWQ) |
| Idiomas soportados | Inglés (declarado: `en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Checkpoint de PyTorch (`library_name: pytorch`); repositorio de 0,3 GB; no se declaran safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo pertenece a la línea "fully conservative": en lugar de atención, la representación evoluciona según un potencial escalar que gobierna la dinámica del estado, resuelta numéricamente con el integrador BAOAB (propio de dinámica molecular). La variante PM2 añade dos pozos de modo Poisson ("Poisson-mode wells", pmx16 = 16 registros) que actúan como atractores del potencial; el sufijo `sr2` indica segundo orden y `norc` la ausencia de un componente adicional (no especificado en la información disponible). La inferencia se describe como de memoria constante (`constant-memory-inference`), una propiedad interesante frente a la memoria cuadrática del contexto en transformers. El modelo vive en un espacio de Fock según los tags del autor y emplea geodésicas riemannianas con métrica de Jacobi.

El entrenamiento usa exclusivamente TinyStories (dataset `roneneldan/TinyStories`) y consume exactamente 315.392.000 tokens en una sola sesión: 19.250 pasos × 32 de batch × 512 de bloque, con el schedule WSD del ladder durante 16.250 pasos y 3.000 pasos adicionales al learning rate mínimo. La curva de learning rate es idéntica a la de sus gemelos SO-TS y FO-TS, y ambos gemelos arrancan en el paso 0 con semilla 0, de modo que las evaluaciones están emparejadas paso a paso (correlación de cambios step-to-step de 1,000). No se menciona RLHF, DPO ni ajuste por instrucciones: es un modelo de preentrenamiento puro sobre texto sintético infantil. La model card reporta salud de ejecución limpia: 0 activaciones del watchdog, 0 capturas de spikes y monitor de fuga SCAF en estado CLEAN en las 4 auditorías.

## Capacidades

- Generación de texto autoregresiva a nivel de bloque de 512 tokens, entrenada únicamente con el corpus TinyStories (inglés, vocabulario y sintaxis simples).
- Modelado de lenguaje y estimación de densidad: la perplejidad de validación es la métrica central del proyecto.
- Inferencia con memoria constante respecto a la longitud de secuencia (propiedad declarada por el autor), sin caché KV al uso.
- Reproducibilidad experimental: forma parte de un par emparejado (segundo orden frente a primer orden) con presupuesto de tokens y schedule idénticos, útil como sujeto de estudios de ablación.
- No soporta tool calling ni function calling: no hay plantilla de chat ni ajuste por instrucciones documentado.
- No se documentan capacidades de agente, razonamiento multi-paso, matemáticas, código, visión ni audio.
- Multilingüe: no; solo inglés.

## Casos de uso

- Investigación en arquitecturas alternativas a la atención: sirve como línea base reproducible para medir si la dinámica de segundo orden aporta ventaja frente a la de primer orden en un presupuesto de 315M tokens, con evaluaciones emparejadas paso a paso.
- Reproducción de estudios de ablación pre-registrados: el par PM2-TS / FO-b-PM2-TS permite verificar predicciones anunciadas antes de entrenar (TS4 y TS2), un caso práctico de metodología científica abierta.
- Benchmarking de modelos energy-based y physics-informed: la perplejidad de validación a bloque 512 (4,99) y la curva de entrenamiento publicada permiten comparar integradores (BAOAB) y potenciales (pozos de modo Poisson) de forma controlada.
- Experimentos de memoria en inferencia: la propiedad de memoria constante hace del modelo un banco de pruebas para medir consumo de RAM/VRAM a longitudes crecientes frente a un transformer equivalente.
- Docencia y divulgación: el modelo es lo bastante pequeño (repositorio de 0,3 GB) para ejecutarse en portátil y explicar conceptos de dinámica hamiltoniana, potenciales y decodificación no softmax en un curso de machine learning.
- Generación de texto sintético sencillo para pruebas de pipeline: con TinyStories como dominio, produce cuentos cortos en inglés útiles para validar tokenizadores, formateadores y servicios de inferencia sin coste de GPU grande.
- Estudio de técnicas de entrenamiento: la curva WSD con fase de decaimiento y suelo documentada paso a paso sirve para analizar sensibilidad al schedule en arquitecturas no transformer.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métrica `perplexity`, no verificada de forma independiente, `verified: false`):

| Modelo | Corpus | Orden | Perplejidad validación (bloque 512) |
|---|---|---:|---:|
| PM2-TS (este modelo) | TinyStories, 315M tokens | 2.º orden, 2 pozos | 4,99 (media de pasos 18.000, 18.500 y 19.000; mejor 4,82 en el paso 16.500) |
| FO-b-PM2-TS | TinyStories, 315M tokens | 1.er orden, 2 pozos | 4,96 (−0,5% frente a este modelo) |
| SO-TS | TinyStories, 315M tokens | 2.º orden, sin pozos | 5,16 |
| FO-TS | TinyStories, 315M tokens | 1.er orden (FO-a) | 5,13 |
| FO-b-TS | TinyStories, 315M tokens | 1.er orden (FO-b), sin pozos | 5,28 |
| GPT-2 ajustado (matched) | TinyStories, mismos tokens y schedule | transformer | 4,47 (este modelo queda +11,6% por detrás; SO-TS +15,4%) |
| PM2-PMX16 (OpenWebText) | OpenWebText, 532,5M tokens | 2.º orden, 2 pozos | 54,71 |
| FO-b-PM2-PMX16 (OpenWebText) | OpenWebText, 532,5M tokens | 1.er orden, 2 pozos | 53,81 |

Evolución del par a lo largo del entrenamiento (perplejidad de validación, bloque 512):

| Paso | Fase | PM2-TS (2.º orden) | FO-b-PM2-TS (1.er orden) |
|---:|---|---:|---:|
| 500 | warmup | 18,99 | 18,86 |
| 5.000 | constante | 6,33 | 6,26 |
| 10.000 | constante | 5,71 | 5,64 |
| 10.500 | fin constante | 5,76 | 5,72 |
| 13.000 | decaimiento | 5,42 | 5,40 |
| 16.000 | fin decaimiento | 5,02 | 5,00 |
| 17.000 | suelo | 5,04 | 5,01 |
| 18.000 | suelo | 5,06 | 5,04 |
| 19.000 | suelo, última eval | 4,96 | 4,93 |

Notas del autor: la evaluación sobre TinyStories oscila aproximadamente ±0,06 entre evaluaciones consecutivas, por lo que la media de tres evaluaciones es la cifra de referencia. El primer orden domina en la fase estable (−0,87% emparejado por paso) y la brecha se estrecha en el decaimiento (−0,57%) y en el suelo (−0,46%).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 0,3 GB, por lo que los pesos caben con holgura en cualquier GPU de consumo; el autor no publica cifras de VRAM ni de memoria pico durante la integración BAOAB.
- GPU recomendadas: no disponible. Por tamaño, una RTX 3060/4060 o superior es suficiente; no se documenta soporte multi-GPU ni requisitos de A100/H100.
- Cabe en GPU de consumo: sí, con un checkpoint de 0,3 GB y 512 tokens de bloque; también es viable en CPU para pruebas puntuales.
- Opciones de despliegue: no hay integración publicada con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo no transformer con `library_name: pytorch`, requiere cargar el checkpoint con código propio del autor.
- Latencia y throughput: no disponibles. La decodificación implica integrar la dinámica (BAOAB) en cada paso, por lo que la latencia no es directamente comparable a la de un transformer del mismo tamaño.
- Memoria: la model card declara inferencia de memoria constante, lo que evita el crecimiento asociado a la caché KV, aunque no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Perplejidad (TinyStories, bloque 512) | Licencia |
|---|---|---|---|---|---|
| PM2-TS (este modelo) | Conservativa, 2.º orden, 2 pozos | No disponible (dimensión 384, 2 capas) | 512 | 4,99 | CC BY 4.0 |
| FO-b-PM2-TS | Conservativa, 1.er orden, 2 pozos | No disponible (mismo tamaño) | 512 | 4,96 | CC BY 4.0 |
| SO-TS | Conservativa, 2.º orden, sin pozos | No disponible (mismo tamaño) | 512 | 5,16 | CC BY 4.0 |
| GPT-2 ajustado (matched) | Transformer decoder | No disponible en la información | No disponible | 4,47 | No disponible en la información |

La comparación relevante es interna al estudio: mismo corpus, mismos 315.392.000 tokens y mismo schedule. Frente al transformer emparejado, la familia conservativa queda entre un 11,6% y un 15,4% por detrás en perplejidad, lo que sitúa a estos modelos como herramientas de investigación y no como alternativas de producción.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado solo con TinyStories (cuentos infantiles sintéticos en inglés); no se espera coherencia en texto técnico, conversacional o de dominio general.
- Solo inglés; no hay evidencia de transferencia a otros idiomas.
- Contexto de 512 tokens: insuficiente para documentos largos, conversaciones multi-turno o código.
- Sin ajuste por instrucciones, sin RLHF/DPO y sin plantilla de chat: no es un modelo apto para uso conversacional directo ni para tool calling.
- Riesgo de alucinación y de texto gramatical pero sin sentido fuera de su distribución, dado el tamaño reducido y el corpus sintético.
- Sesgos: no se documenta ninguna auditoría de sesgos; TinyStories está generado por modelos, por lo que puede heredar sesgos de su generador.
- Resultados no verificados: la métrica de la model card figura con `verified: false` y la perplejidad de TinyStories oscila ±0,06 entre evaluaciones, de modo que diferencias por debajo de ese margen (como el −0,5% frente a su gemelo) no deben interpretarse como significativas.
- Un único entrenamiento por variante y una sola semilla (seed 0): no hay estimación de varianza entre semillas.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero el modelo no ofrece garantías ni soporte; además, el uso comercial de un generador de cuentos de 512 tokens de contexto es limitado en la práctica.
- No hay pesos en safetensors, GGUF ni cuantizaciones: el despliegue exige código propio y dependencias de PyTorch no documentadas en detalle.
- Faltan datos clave para evaluación de producción: recuento de parámetros, latencia, throughput y consumo de memoria pico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2
- Colección "Semantic Simulation Gen 3: first vs second order": https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Gemelo de primer orden (FO-b-PM2-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Modelo de segundo orden sin pozos (SO-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2
- Gemelo de primer orden sin pozos (FO-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fo
- Variante FO-b sin pozos (FO-b-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob
- Equivalente con 2 pozos sobre OpenWebText (PM2-PMX16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2
- Gemelo de primer orden sobre OpenWebText (FO-b-PM2-PMX16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob
- GPT-2 emparejado en tokens y schedule: https://huggingface.co/dimitarpg13/semsimula-ladder-ts-d384-gpt2-matched
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories

# dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fo

## Resumen

semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fo es un modelo de lenguaje de investigación desarrollado por el usuario dimitarpg13 dentro de la familia Semantic Simulation (SemSimula), una línea de trabajo que explora modelos de lenguaje conservativos basados en mecánica lagrangiana en lugar de la arquitectura transformer con atención. Este modelo concreto pertenece a la generación 3 del proyecto y forma parte de un estudio pre-registrado de ablación de mecanismos ("ladder study") cuyo objetivo es determinar si el núcleo conservativo de Semantic Simulation necesita dinámica de segundo orden (velocidad e inercia) o si un modelo de primer orden entrenado de la misma forma rinde igual.

El modelo es la variante de primer orden (FO-a) de la arquitectura SR2 entrenada sobre el corpus TinyStories, con reinicio de velocidad en cada frontera de capa. Cuenta con una dimensión de modelo de 384, 2 capas y se entrena sin mecanismo de atención ("attention-free", "non-transformer"), con inferencia de memoria constante. Su resultado principal es un perplexity de validación de 5,13 en TinyStories (bloque 512), prácticamente idéntico al de su gemelo de segundo orden SO-TS (5,16), lo que respalda la hipótesis de que la dinámica de primer orden es suficiente en este régimen.

La relevancia del modelo es fundamentalmente investigadora: no está pensado para producción, sino para estudiar qué componentes de la arquitectura conservativa aportan realmente capacidad predictiva. El modelo se distribuye con licencia CC-BY-4.0, solo soporta inglés y está entrenado sobre un corpus sintético de cuentos infantiles simples.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Semantic Simulation (SemSimula) SR2, conservativa, sin atención, no transformer, con potencial gaussiano anisotrópico y mecánica lagrangiana |
| Parametros totales | no disponible (dimensión de modelo 384, 2 capas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento y evaluación a bloque 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería pytorch; safetensors no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SR2 de Semantic Simulation, un enfoque conservativo que modela la generación de texto como un sistema dinámico regido por un potencial escalar y mecánica lagrangiana, en lugar de la atención por producto punto de los transformers. La variante aquí presentada es de primer orden (FO-a) con reinicio de velocidad en cada frontera de capa, lo que preserva la rotación de los modos rígidos dentro de cada capa. Emplea un potencial gaussiano anisotrópico y se apoya en técnicas de integración como BAOAB y geometría riemanniana (geodésicas de Riemann, métrica de Jacobi), con inferencia de memoria constante. El modelo tiene 384 dimensiones y 2 capas, y no utiliza atención.

El entrenamiento se realizó sobre el corpus TinyStories con exactamente 315.392.000 tokens (19.250 pasos × 32 × 512), los primeros 16.250 pasos con el schedule WSD de la escalera y los últimos 3.000 al learning rate mínimo. El estudio es pre-registrado: se predijo un Delta_TS dentro de ±3% con un 55% de confianza, y el resultado (−0,6%) confirmó la predicción (HIT). La regla de Stage-0 que anticipaba una brecha por la anarmonicidad de los pozos de SO-TS falló (MISS). El run no presentó activaciones de watchdog ni capturas de spikes, y el monitor de fugas SCAF se mantuvo limpio en todas las auditorías (leak tax −2,4e-4 nats).

## Capacidades

- Generación de texto en inglés, orientada a dominios simples y narrativos (TinyStories).
- Modelado de lenguaje autorregresivo con perplexity de validación de 5,13 a bloque 512.
- Inferencia con memoria constante gracias a su naturaleza sin atención.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como banco de pruebas controlado para estudiar el efecto de la dinámica de primer orden frente a la de segundo orden en modelos conservativos, con pares entrenados bajo presupuesto de tokens idéntico.
- Estudio de ablación de mecanismos: permite aislar el impacto del reinicio de velocidad por capa comparándolo con su gemelo FO-b-TS, que elimina esa rotación y rinde un 2,3% peor.
- Reproducción de experimentos pre-registrados: el modelo y sus resultados (5,13 de perplexity, predicción HIT) permiten replicar el protocolo de la escalera de generación 3.
- Generación de texto simple en inglés: dado su entrenamiento en TinyStories, puede producir cuentos cortos y coherentes en ese dominio acotado, útil como demostración de la viabilidad del enfoque.
- Evaluación de inferencia de memoria constante: adecuado para medir el comportamiento de modelos sin atención en escenarios de recursos limitados, aunque no se publican cifras de latencia o throughput.
- Docencia y divulgación sobre modelos energéticos (energy-based models) y mecánica lagrangiana aplicada al procesamiento de lenguaje.

## Benchmarks y rendimiento

| Modelo | Corpus, tokens | Perplexity de validación (bloque 512) | Diferencia frente a segundo orden |
|---|---|---|---|
| SO-TS (segundo orden) | TinyStories, 315M | 5,16 | referencia |
| **FO-TS (este modelo, FO-a)** | TinyStories, 315M | **5,13** | **−0,6%** |
| FO-b-TS (primer orden verdadero) | TinyStories, 315M | 5,28 | +2,3% |
| PM2-TS (con 2 pozos Poisson) | TinyStories, 315M | 4,99 | — |
| FO-b-PM2-TS | TinyStories, 315M | 4,96 | −0,5% |

El modelo reporta un perplexity de validación asentado de 5,13 (media de las tres últimas evaluaciones: 5,10, 5,13, 5,17), con un mejor valor de 5,10 en el paso 18.000. El resultado está declarado por el autor y no verificado de forma independiente (`verified: false`).

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 0,6 GB, lo que sugiere un modelo pequeño que probablemente quepa en GPUs de consumo, pero no se publican requisitos oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada, aunque el tamaño del repo (0,6 GB) es compatible con GPUs modestas.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la librería declarada es PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplexity (TinyStories, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **FO-TS (este modelo)** | 384 dim, 2 capas | no disponible (eval. a 512) | 5,13 | CC-BY-4.0 | Hugging Face |
| SO-TS (gemelo segundo orden) | 384 dim, 2 capas | no disponible | 5,16 | CC-BY-4.0 | Hugging Face |
| FO-b-TS (primer orden verdadero) | 384 dim, 2 capas | no disponible | 5,28 | CC-BY-4.0 | Hugging Face |
| PM2-TS (con pozos Poisson) | 384 dim, 2 capas | no disponible | 4,99 | CC-BY-4.0 | Hugging Face |

No se dispone de comparación con modelos de propósito general de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción.
- Entrenado exclusivamente sobre TinyStories, un corpus sintético de cuentos infantiles; su capacidad de generalización fuera de ese dominio es muy limitada.
- Solo soporta inglés.
- Riesgo elevado de alucinación y de texto incoherente fuera del dominio de entrenamiento.
- No se documentan sesgos conocidos, pero el corpus sintético puede introducir sesgos propios de su generación.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no está pensado para ello.
- No se publican requisitos de hardware, cuantizaciones ni métricas de latencia, lo que dificulta su despliegue.
- Los resultados de benchmarks están declarados por el autor y no verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fo
- Gemelo de segundo orden (SO-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2
- Gemelo de primer orden verdadero (FO-b-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob
- Colección First-vs-Second-Order (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Colección Gen 3 (OpenWebText ladder): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories

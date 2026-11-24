# dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2-fob

## Resumen

`semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2-fob` es un modelo de lenguaje de investigación desarrollado por el usuario de Hugging Face `dimitarpg13` dentro de su colección «Semantic Simulation» (generación 3). No es un transformer: se trata de un modelo de lenguaje conservativo basado en un potencial escalar y mecánica lagrangiana, con inferencia sin atención y memoria constante. Este checkpoint concreto (FO-b-PM2-CODE) es la variante de **primer orden** del modelo PM2-CODE, entrenada como flujo de gradiente puro, sin velocidad ni inercia, y con dos «pozos» de modo Poisson (PM2) más un potencial gaussiano anisotrópico.

El modelo se entrena sobre código Python del corpus CodeParrot clean con un presupuesto exacto de 315.392.000 tokens (19.250 pasos × 32 × 512) y una dimensión oculta de 384 con 2 capas. Su relevancia es experimental: forma parte de un estudio pre-registrado que compara, par a par, dinámicas de primer y segundo orden sobre el mismo núcleo conservativo, con el mismo presupuesto de tokens y las mismas semillas, para aislar el efecto de la inercia y de los pozos de potencial.

El resultado declarado por el autor es que, con dos pozos Poisson, la variante de primer orden supera a su gemela de segundo orden en perplejidad de validación sobre código (5,62 frente a 5,71, un 1,6 % mejor), invirtiendo el patrón observado sin pozos, donde el primer orden queda un 9,2 % por detrás. Frente a un GPT-2 emparejado (d=384, L=8) sigue un 13,3 % por detrás en perplejidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (no transformer, sin atención); potencial escalar con 2 pozos de modo Poisson y potencial gaussiano anisotrópico; dinámica de primer orden (flujo de gradiente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | bloque de entrenamiento y evaluación de 512 tokens; ventana máxima no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`pytorch`); safetensors/GGUF no disponible |
| Dimension oculta | 384 |
| Numero de capas | 2 |
| Tamano del repositorio | 0,3 GB |
| Dataset de entrenamiento | `codeparrot/codeparrot-clean-train` (validación: `codeparrot/codeparrot-clean-valid`) |
| Tokens de entrenamiento | 315.392.000 (19.250 pasos × 32 × 512) |

## Arquitectura y entrenamiento

La arquitectura abandona el mecanismo de atención y el bloque transformer convencional en favor de un sistema dinámico derivado de un potencial escalar: el modelo se interpreta como una simulación semántica donde el estado evoluciona bajo un campo de fuerzas conservativo. Esta variante concreta incorpora dos pozos de modo Poisson (PM2, con `pmx16`) que actúan como atractores sobre modos concretos del espacio de estados, más un potencial gaussiano anisotrópico. La variante `fob` (first-order) relaja exactamente el muelle congelado de los pozos y los modos rígidos, eliminando por completo la variable de velocidad: es un flujo de gradiente puro, de ahí la etiqueta `fully-conservative` y `constant-memory-inference`.

El entrenamiento usa exactamente 315.392.000 tokens de Python de CodeParrot clean en una única sesión, con el schedule WSD (warmup-stable-decay) de la escalera de profundidad durante 16.250 pasos y 3.000 pasos adicionales a la tasa de aprendizaje mínima. Los cuatro modelos de código de la comparación (SO-CODE, FO-b-CODE, PM2-CODE y este FO-b-PM2-CODE) parten del paso 0 con semilla 0 sobre los mismos lotes, de modo que las evaluaciones están emparejadas paso a paso (correlación de 0,987 en los cambios entre pasos de este par). El estudio está pre-registrado en las notas `Code_Set_First_vs_Second_Order.md` del repositorio `semsimula-paper`, con llamadas (CODE3, CODE4) escritas antes de entrenar ningún brazo de código.

## Capacidades

- Generación de texto autoregresiva orientada a código Python (corpus CodeParrot clean).
- Modelado de lenguaje y estimación de perplejidad sobre código, con evaluación a bloques de 512 tokens.
- Inferencia sin atención con memoria constante respecto a la longitud de secuencia (propiedad declarada por la arquitectura).
- Capacidad de investigación reproducible: forma parte de un par controlado para estudiar el efecto de la dinámica de primer frente a segundo orden y de los pozos de potencial.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado; sin soporte adicional documentado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: sirve como punto de comparación controlado para medir si la dinámica de segundo orden (inercia) aporta ventaja frente a un flujo de gradiente de primer orden en un núcleo conservativo, con presupuesto de tokens y semilla fijados.
- Estudio de mecanismos de potencial: permite aislar el efecto de los pozos de modo Poisson comparando este checkpoint con su gemelo sin pozos (FO-b-CODE), con una mejora declarada del 14,2 % en perplejidad atribuible a los pozos.
- Reproducción de experimentos pre-registrados: útil para validar las predicciones CODE3 y CODE4 del autor sobre datos públicos de CodeParrot y un schedule documentado.
- Prototipado de modelos de código de bajo coste computacional: con dimensión 384 y 2 capas, el checkpoint (0,3 GB) es ligero para experimentos de laboratorio sobre generación de Python.
- Evaluación de inferencia con memoria constante: adecuado para estudiar el comportamiento de modelos sin atención en secuencias largas dentro de un entorno de investigación.
- Docencia y divulgación: ejemplo práctico de modelo de lenguaje basado en energía y mecánica lagrangiana, con métricas y protocolo publicados.
- Generación de código en producción: no recomendado; el propio autor reporta un 13,3 % de desventaja en perplejidad frente a un GPT-2 emparejado.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Perplejidad de validación (CodeParrot clean, bloque 512, asentada) | 5,6209 (media de las evaluaciones en los pasos 18.000, 18.500 y 19.000: 5,52 / 5,63 / 5,71) |
| Mejor perplejidad | 5,52 (paso 18.000) |

Comparación con los modelos del mismo estudio (perplejidad de validación, código Python):

| Modelo | Orden | Pozos | Perplejidad | Diferencia frente a este modelo |
|---|---|---:|---:|---|
| FO-b-PM2-CODE (este) | 1.º | 2 Poisson | 5,62 | — |
| PM2-CODE | 2.º | 2 Poisson | 5,71 | +1,6 % |
| FO-b-CODE | 1.º | ninguno | 6,55 | +16,5 % |
| SO-CODE | 2.º | ninguno | 6,00 | +6,8 % |
| GPT-2 emparejado (d=384, L=8) | transformer | — | 4,96 | −13,3 % (este modelo por detrás) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un repositorio de 0,3 GB y dimensión 384 con 2 capas, la huella es muy reducida y cabe holgadamente en cualquier GPU de consumo actual.
- GPU recomendadas: cualquier GPU consumer (RTX 3060, RTX 4090, etc.) es suficiente por tamaño; no hay requisitos publicados específicos.
- Cabe en GPU consumer: sí, por el tamaño del checkpoint (0,3 GB) y la dimensión del modelo.
- Opciones de despliegue: la librería declarada es PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un transformer es improbable que estos runners estándar lo carguen sin adaptación.
- Latencia y throughput: no disponibles. La arquitectura declara memoria constante en inferencia, pero no se publican cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad (código, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FO-b-PM2-CODE (este) | no disponible (d=384, L=2) | 512 (bloque de entrenamiento) | 5,62 | CC BY 4.0 | Hugging Face |
| PM2-CODE (gemelo de 2.º orden) | no disponible (d=384, L=2) | 512 | 5,71 | CC BY 4.0 | Hugging Face |
| FO-b-CODE (sin pozos) | no disponible (d=384, L=2) | 512 | 6,55 | CC BY 4.0 | Hugging Face |
| GPT-2 emparejado (d=384, L=8) | no disponible | no disponible | 4,96 | no disponible | No publicado en el Hub |

La comparación relevante es interna al estudio del autor: mismo corpus, mismos tokens y misma semilla. Frente a alternativas transformer de propósito general no hay datos publicados en la información disponible.

## Limitaciones y advertencias

- Modelo estrictamente de investigación: no está pensado para uso en producción ni como asistente de código general.
- Solo inglés declarado y entrenado exclusivamente sobre Python de CodeParrot clean; el dominio fuera de código Python es limitado.
- Longitud de contexto efectiva de 512 tokens en entrenamiento y evaluación; no se documenta ventana mayor.
- Rendimiento inferior a un GPT-2 emparejado en el mismo corpus (5,62 frente a 4,96 de perplejidad), según el propio autor.
- Riesgo de alucinación y de generar código sintácticamente plausible pero incorrecto; no hay evaluación funcional (tests unitarios, HumanEval) publicada.
- Sesgos: no se documentan análisis de sesgo; el corpus CodeParrot clean puede arrastrar sesgos del código fuente de GitHub.
- Resultados de benchmarks no verificados (`verified: false`); la perplejidad declarada procede del autor y no de una evaluación independiente.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero al ser un artefacto de investigación no hay garantías de calidad ni soporte.
- No se documentan formatos de cuantización ni compatibilidad con runners estándar (vLLM, llama.cpp, Ollama), lo que complica el despliegue fuera de PyTorch.
- El número de parámetros totales no está publicado, lo que impide estimar con precisión requisitos de cómputo más allá del tamaño del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Gemelo de segundo orden (PM2-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2
- Variante de primer orden sin pozos (FO-b-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob
- Variante de segundo orden sin pozos (SO-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Colección «First vs Second Order» (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Notas de pre-registro del conjunto de código: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/Code_Set_First_vs_Second_Order.md
- Repositorio del paper: https://github.com/dimitarpg13/semsimula-paper
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset de validación: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid

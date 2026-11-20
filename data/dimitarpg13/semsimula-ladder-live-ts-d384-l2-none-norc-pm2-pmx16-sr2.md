# dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2

## Resumen

El modelo `semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2`, abreviado PM2-TS, es un modelo de lenguaje de investigación desarrollado por el autor independiente dimitarpg13 dentro de la familia SemSimula. No es un transformer: se trata de un modelo de lenguaje conservativo basado en un potencial escalar y dinámica lagrangiana de segundo orden, con atención eliminada por completo y memoria constante durante la inferencia. Forma parte de un estudio pre-registrado de ablación de mecanismos ("ladder study") que compara pares de modelos entrenados con dinámica de primer y segundo orden, manteniendo todo lo demás constante.

El modelo resuelve una pregunta de investigación concreta: si el núcleo conservativo de Semantic Simulation necesita dinámica de segundo orden (velocidad e inercia) o si un modelo de primer orden entrenado de la misma forma rinde igual. En esta variante se añaden dos pozos de potencial en modo Poisson (PM2) sobre TinyStories, y el resultado es que los pozos mejoran la perplejidad un 3,4% respecto a la variante sin pozos, mientras que su gemelo de primer orden queda prácticamente empatado (−0,5%).

La arquitectura tiene 384 dimensiones de modelo (d384) y 2 capas (l2), entrena sobre 315,4 millones de tokens de TinyStories y alcanza una perplejidad de validación asentada de 4,99 con bloque de 512 tokens. Es relevante ahora como evidencia empírica reproducible en la discusión sobre alternativas no-transformer a los modelos de lenguaje, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (energy-based, potencial escalar, dinámica lagrangiana de segundo orden); no-transformer, sin atención |
| Parametros totales | no disponible (dimensión de modelo d384, 2 capas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | bloque de entrenamiento y evaluación de 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería pytorch); repo de 0,3 GB |

## Arquitectura y entrenamiento

El modelo sustituye el mecanismo de atención por un núcleo conservativo derivado de un potencial escalar, con integración mediante un esquema BAOAB (integrador tipo Langevin de segundo orden) y geometría riemanniana con métrica de Jacobi y geodésicas riemannianas. Incorpora pozos de potencial anisotrópico gaussiano en modo Poisson (2 pozos, PMX16) y registros de modo Poisson. La inferencia opera con memoria constante, independiente de la longitud de contexto, al no existir matriz de atención. El modelo es "fully conservative" y pertenece a la generación 3 de la serie.

El entrenamiento se realizó en una única sesión sobre exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) del dataset TinyStories, con el schedule WSD de la serie durante 16.250 pasos y 3.000 pasos adicionales al learning rate mínimo. El gemelo de primer orden (FO-b-PM2-TS) parte del mismo seed 0 y el mismo paso 0, de modo que las evaluaciones están emparejadas paso a paso (correlación de cambios paso a paso de 1,000). El estudio está pre-registrado: las llamadas TS4 (PM2-TS más de un 1% por debajo de SO-TS) y TS2 (gemelo de primer orden dentro de ±2%) se confirmaron antes de entrenar el primer brazo. El run registró 0 activaciones del watchdog, 0 capturas de spikes y el monitor de fuga SCAF limpio en las 4 auditorías.

## Capacidades

- Generación de texto en inglés, orientada a textos narrativos simples por el dominio de entrenamiento (TinyStories).
- Modelado de lenguaje autorregresivo con perplejidad de validación de 4,99 en bloque de 512.
- Inferencia con memoria constante, sin coste de atención creciente con la longitud.
- Capacidad de ejecutar como modelo de investigación para ablación de mecanismos (comparación primer vs segundo orden, efecto de pozos de potencial).
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni modo thinking.
- Multilingüe: no; solo inglés.

## Casos de uso

- Investigación en arquitecturas no-transformer: reproducir el par PM2-TS / FO-b-PM2-TS para estudiar si la dinámica de segundo orden aporta ventaja frente a la de primer orden en un corpus controlado y con presupuesto de tokens idéntico.
- Estudio de mecanismos de potencial: evaluar el efecto de añadir pozos de potencial en modo Poisson (mejora del 3,4% en perplejidad frente a SO-TS) y de su interacción con la dinámica de orden.
- Experimentos de eficiencia de memoria: usar el modelo como referencia de inferencia con memoria constante para comparar curvas de memoria frente a transformers de tamaño comparable en contextos largos.
- Generación de texto narrativo simple: producir cuentos cortos en inglés con vocabulario y estructura propios de TinyStories, útil para validar pipelines de generación en dominios sintéticos.
- Reproducibilidad de estudios pre-registrados: servir de artefacto verificable de las predicciones TS2 y TS4 documentadas en las notas del proyecto.
- Benchmarking de esquemas de integración: comparar el integrador BAOAB y la formulación lagrangiana frente a alternativas de muestreo en modelos energy-based.
- Docencia y divulgación: ilustrar en cursos la diferencia entre modelos conservativos y transformers con un caso de 315M de tokens y métricas publicadas.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index, no verificados):

| Modelo | Corpus, tokens | Perplejidad de validación (bloque 512) | Nota |
|---|---:|---:|---|
| PM2-TS (este modelo) | TinyStories, 315M | 4,99 | Media de las evaluaciones en pasos 18.000, 18.500 y 19.000 (5,06 / 4,94 / 4,96); mejor 4,82 en paso 16.500 |
| FO-b-PM2-TS (gemelo primer orden) | TinyStories, 315M | 4,96 | −0,5% frente a segundo orden |
| SO-TS (sin pozos) | TinyStories, 315M | 5,16 | Este modelo mejora un 3,4% |
| FO-b-TS (primer orden, sin pozos) | TinyStories, 315M | 5,28 | +2,3% frente a SO-TS |
| GPT-2 emparejado | TinyStories, 315M | 4,47 | Este modelo queda un 11,6% por detrás (SO-TS, +15,4%) |

Evolución del par durante el entrenamiento (PM2-TS vs FO-b-PM2-TS): paso 500, 18,99 vs 18,86 (−0,7%); paso 5.000, 6,33 vs 6,26 (−1,1%); paso 10.000, 5,71 vs 5,64 (−1,2%). La evaluación de TinyStories presenta jitter de aproximadamente ±0,06 entre evaluaciones consecutivas, por lo que debe leerse la media de tres evaluaciones.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,3 GB, lo que sugiere un modelo pequeño (d384, 2 capas) que previsiblemente cabe en GPUs de consumo con amplio margen.
- GPU recomendadas: no disponible en la información proporcionada.
- GPU de consumo: probablemente viable en RTX 4090 y gamas inferiores por el tamaño del checkpoint, aunque no hay cifras publicadas.
- Opciones de despliegue: PyTorch (librería declarada); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (TinyStories, 315M tokens) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PM2-TS (este modelo) | d384, 2 capas (total no disponible) | 512 | 4,99 | CC-BY-4.0 | Hugging Face |
| FO-b-PM2-TS | misma configuración, primer orden | 512 | 4,96 | CC-BY-4.0 | Hugging Face |
| SO-TS | misma configuración, sin pozos | 512 | 5,16 | CC-BY-4.0 | Hugging Face |
| GPT-2 emparejado | no disponible | 512 | 4,47 | no disponible | Hugging Face |

La comparativa relevante es interna a la serie SemSimula, ya que no se dispone de datos de modelos externos equivalentes en esta categoría no-transformer.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas generales.
- Dominio restringido: entrenado únicamente con TinyStories, genera texto narrativo simple y no código, matemáticas ni razonamiento complejo.
- Solo inglés; no hay capacidades multilingües.
- Contexto limitado a bloques de 512 tokens.
- Riesgo de alucinación y de texto incoherente fuera del dominio narrativo infantil.
- Sesgos: no documentados en la información disponible; hereda los del corpus TinyStories.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no está validado para ello.
- Métricas no verificadas (`verified: false`) y con jitter de ±0,06; las diferencias entre el modelo y su gemelo de primer orden (−0,5%) están dentro del ruido de evaluación.
- Queda un 11,6% por detrás de un GPT-2 emparejado en el mismo presupuesto de tokens, lo que limita su atractivo como alternativa práctica a transformers.
- No se documentan formatos de cuantización ni soporte en herramientas de despliegue estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2
- Gemelo de primer orden FO-b-PM2-TS: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2-fob
- SO-TS (sin pozos): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2
- FO-TS: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fo
- FO-b-TS: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob
- PM2-PMX16 sobre OpenWebText: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2
- FO-b-PM2-PMX16 sobre OpenWebText: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob
- PM2-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2
- FO-b-PM2-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2-fob
- SO-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- FO-b-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob
- GPT-2 emparejado: https://huggingface.co/dimitarpg13/semsimula-ladder-ts-d384-gpt2-matched
- Colección primer vs segundo orden: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Notas del estudio pre-registrado: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/First_vs_Second_Order_Series.md
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories

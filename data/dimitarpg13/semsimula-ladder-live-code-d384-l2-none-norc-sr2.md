# dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2

## Resumen

semsimula-ladder-live-code-d384-l2-none-norc-sr2 (abreviado SO-CODE) es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro del proyecto Semantic Simulation (semsimula). No es un transformer: se trata de un modelo conservativo de espacio de Fock, sin atención, basado en un potencial escalar anisótropo y dinámica lagrangiana de segundo orden, con inferencia de memoria constante. Está entrenado exclusivamente sobre código Python (CodeParrot clean) y su propósito no es la producción, sino el estudio de ablación de mecanismos: forma parte de un experimento pre-registrado que compara si el núcleo conservativo necesita dinámica de segundo orden (velocidad e inercia) frente a un gemelo de primer orden entrenado de forma idéntica.

El modelo tiene una dimensión oculta de 384, dos capas y ningún mecanismo de "wells" (pozos de potencial), y se entrenó sobre exactamente 315.392.000 tokens en una única sesión. Su resultado principal es una perplejidad de validación de 5,9951 (media de las tres últimas evaluaciones de 500 pasos, a bloque 512) sobre los primeros 2M de tokens de validación de CodeParrot, frente a 6,55 del gemelo de primer orden FO-b-CODE, una ventaja del 9,2%, la mayor observada en cualquier corpus del estudio.

Es relevante ahora porque forma parte de una familia de experimentos controlados (colecciones de "first vs second order", "dead wells" y "depth on code") que documentan de forma sistemática el comportamiento de arquitecturas no-transformer con memoria constante, un área de interés creciente para inferencia de bajo coste en contextos largos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo conservativo de lenguaje en espacio de Fock, sin atención, con potencial escalar anisótropo y dinámica de segundo orden (integrador BAOAB, geometría riemanniana con métrica de Jacobi) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado y evaluado a bloque de 512 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (library_name: pytorch); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo pertenece a la generación 3 del proyecto semsimula y se describe como "fully-conservative": la dinámica del estado se rige por un potencial escalar V_θ y una formulación lagrangiana de segundo orden, integrada numéricamente con el esquema BAOAB sobre una variedad riemanniana con métrica de Jacobi. No emplea atención; la inferencia opera con memoria constante respecto a la longitud de secuencia. La variante aquí descrita tiene dimensión 384, dos capas, sin canales de contexto adicionales ("none") y sin "wells" en el banco de potencial ("norc").

El entrenamiento usó exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) en una sola sesión sobre código Python de CodeParrot clean, con cada nivel de indentación de cuatro espacios reescrito como un tabulador. Se siguió el schedule WSD del estudio durante 16.250 pasos y después 3.000 pasos a la tasa de aprendizaje mínima (la curva de TinyStories). El gemelo de primer orden (FO-b-CODE) arranca desde el paso 0 con la misma semilla y los mismos lotes, de modo que la comparación está pareada por paso. No se documenta RLHF ni DPO; el modelo es una ablación de mecanismo, no un modelo alineado.

## Capacidades

- Generación de texto autoregresiva sobre código Python: el modelo está entrenado únicamente con código y su evaluación se realiza en perplejidad sobre CodeParrot, no en tareas de instrucción.
- Modelado de identificadores y referencias léxicas: el autor señala que la ventaja del segundo orden sobre el primer orden se concentra en identificadores, y crece cuanto más atrás está su ocurrencia previa.
- Inferencia con memoria constante: al carecer de atención, el coste de memoria no crece con la longitud de contexto.
- Capacidad multilingüe: no; solo inglés y, de hecho, solo código fuente.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no.
- Modo "thinking", visión o audio: no.
- Capacidad de chat o instrucciones: no documentada.

## Casos de uso

- Estudio de ablación de mecanismos: el caso de uso primario es comparar, con todo lo demás fijo, dinámica de primer orden frente a segundo orden sobre el mismo corpus y presupuesto de tokens; el modelo sirve como mitad "segundo orden" del par sobre código.
- Investigación en arquitecturas no-transformer: sirve como punto de referencia reproducible (semilla 0, lotes idénticos) para medir el efecto de eliminar la atención en modelado de código.
- Análisis de modelado de identificadores: permite estudiar cómo distintas dinámicas capturan dependencias léxicas de largo alcance en código Python, midiendo perplejidad por tipo de token y por ventana de validación.
- Base para experimentos de profundidad: es el punto de dos capas de la colección "depth on code"; dividido en cuatro capas (L4-CODE) baja a 5,48 y en ocho (L8-CODE) a 5,35, por lo que se usa como control de referencia en esos estudios.
- Base para experimentos de "wells" y canales de contexto: es el baseline de la colección "dead wells", donde XI6-CODE (con un sexto canal) se degrada a 8,55 y distintas correcciones lo devuelven a 5,95–5,98.
- Evaluación de esquemas de integración y geometría: al usar BAOAB y métrica de Jacobi, permite medir el impacto de decisiones de integración numérica en la calidad del modelado, algo que no se puede aislar en un transformer estándar.
- Docencia y divulgación técnica: como modelo pequeño (repo de 0,3 GB) y con resultados publicados paso a paso, es útil para ilustrar experimentos controlados y análisis de perplejidad.

## Benchmarks y rendimiento

| Modelo | Corpus, tokens | Perplejidad de validación (bloque 512) | Diferencia frente a segundo orden |
|---|---|---|---|
| SO-CODE (este modelo) | Python, 315M | 5,9951 (asentada); mejor 5,87 en el paso 18.000 | — |
| FO-b-CODE (primer orden) | Python, 315M | 6,55 | +9,2% |
| PM2-CODE (con 2 wells Poisson) | Python, 315M | 5,71 | −1,6% frente a su gemelo de primer orden |
| FO-b-PM2-CODE | Python, 315M | 5,62 | — |

Contexto de la comparación entre corpus del mismo estudio: OpenWebText 58,32 (segundo orden) frente a 61,16 (primer orden), +4,9%; TinyStories 5,16 frente a 5,28, +2,3%. La ventaja del segundo orden es mayor en código. La diferencia está pareada por paso: entre +9,1% y +9,5% en las últimas siete evaluaciones (pasos 16.000–19.000), con correlación de 0,996 entre brazos, y FO-b-CODE es peor en el 98% de las 512 ventanas de validación.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,3 GB, lo que sugiere que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU consumer (RTX 3060 o superior) debería ser suficiente.
- Cabe en GPU consumer: sí, con alta probabilidad dado el tamaño del repositorio.
- Opciones de despliegue: solo se declara PyTorch como librería; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y al no ser un transformer estos runners probablemente no son aplicables sin trabajo de adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Perplejidad en código | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO-CODE (este) | Conservativa, sin atención, 2.º orden, 384 dim | bloque 512 | 5,9951 | CC-BY-4.0 | Hugging Face |
| FO-b-CODE | Gemelo de primer orden, mismo resto de ajustes | bloque 512 | 6,55 | CC-BY-4.0 | Hugging Face |
| PM2-CODE | Mismo modelo con 2 wells Poisson | bloque 512 | 5,71 | CC-BY-4.0 | Hugging Face |
| L4-CODE / L8-CODE | Mismo modelo con 4 y 8 capas | bloque 512 | 5,48 / 5,35 | CC-BY-4.0 | Hugging Face |

No se dispone de comparación con transformers convencionales de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está entrenado para instrucciones, chat ni uso en producción; su única métrica publicada es perplejidad sobre código Python.
- Solo inglés y solo código: no cubre lenguaje natural general ni otros lenguajes de programación en la evaluación.
- Contexto limitado: entrenado y evaluado a bloques de 512 tokens; no se documenta soporte para secuencias más largas.
- Riesgo de alucinación: inherente a cualquier modelo generativo; aquí no hay alineación ni ajuste por RLHF/DPO.
- Sesgos: no documentados por el autor; el corpus (CodeParrot) puede arrastrar sesgos de estilo y licencia del código fuente.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no está validado para ello.
- Ecosistema limitado: sin pesos GGUF/safetensors ni soporte en runners estándar; la integración requiere código propio del proyecto.
- Resultados no verificados: la métrica de la model-index figura como `verified: false`, es decir, declarada por el autor.
- Dependencia de detalles del experimento: los resultados están pareados por paso y semilla; reproducirlos exige replicar el schedule y los lotes exactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Gemelo de primer orden FO-b-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob
- Modelo SR2 en OpenWebText: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Colección first-vs-second-order: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Colección dead-wells: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-dead-wells-in-the-v-bank-6ae5275768c02fe9f540c5a3
- Colección depth-on-code: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-depth-on-code-6ae76925374cab20b1cb7d5e
- Modelo L4-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l4-none-norc-sr2
- Modelo L8-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2
- Modelo PM2-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2
- Nota técnica Dead Wells: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Dead_Wells_in_the_Joint_V_theta_Bank.md
- Repositorio del paper: https://github.com/dimitarpg13/semsimula-paper

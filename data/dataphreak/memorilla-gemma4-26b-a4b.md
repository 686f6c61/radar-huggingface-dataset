# DataPhreak/Memorilla-Gemma4-26B-A4B

## Resumen

Memorilla-Gemma4-26B-A4B es un módulo de memoria externa (no un modelo completo) desarrollado por DataPhreak como port no oficial del trabajo de Stanford SNAP. Su función es convertir una pregunta junto con un conjunto de embeddings de documentos en 16 tokens suaves ("soft tokens") de anchura 2816 que se anteponen al prompt de un decodificador Gemma 4 26B-A4B congelado. El decodificador nunca se modifica: el módulo actúa como un adaptador de contexto que inyecta información documental sin reentrenar los pesos del modelo base.

El repositorio contiene únicamente `memory.pt` y `config.json` (unos 190M de parámetros, 0,8 GB). El decodificador (`google/gemma-4-26B-A4B-it`, con expertos enrutados cuantizados a 4 bits) y el codificador de documentos y preguntas (`Qwen/Qwen3-Embedding-4B`) deben descargarse por separado. El módulo parte del checkpoint de etapa 2 de `memorilla/Memorilla-Qwen3-8B` y añade una nueva proyección de salida, entrenada en una única estación de trabajo AMD Strix Halo con aproximadamente una décima parte de los datos de entrenamiento del original.

Su relevancia radica en que demuestra que es posible obtener mejoras medibles en tareas de question answering con contexto documental sobre un decodificador congelado y cuantizado, usando hardware de consumo. No obstante, el propio autor documenta que en tres de los ocho benchmarks la mejora no proviene de los documentos, lo que acota el alcance real de la técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Módulo de soft-prompt sobre decodificador transformer (Gemma 4 26B-A4B, MoE con expertos enrutados) |
| Parametros totales | ~190M (solo el módulo de memoria) |
| Parametros activos | No disponible para el módulo; el decodificador Gemma 4 26B-A4B es MoE con 26B totales y 4B activos (según nomenclatura del nombre) |
| Longitud de contexto | No disponible (el módulo produce 16 tokens de memoria; la ventana depende del decodificador) |
| Tipos de cuantizacion | Decodificador con expertos enrutados en 4 bits; el módulo se distribuye en `memory.pt` (precisión no especificada) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `memory.pt` (PyTorch) + `config.json`; no se incluyen pesos del decodificador ni del codificador |

## Arquitectura y entrenamiento

El módulo sigue el diseño Memorilla de Stanford SNAP: un codificador congelado (`Qwen/Qwen3-Embedding-4B`) genera embeddings de la pregunta y de los documentos, y una proyección aprendida los comprime en 16 tokens suaves de anchura 2816 que se insertan al inicio del prompt del decodificador. El decodificador Gemma 4 26B-A4B permanece completamente congelado, con sus expertos enrutados cuantizados a 4 bits. El módulo se inicializa desde la etapa 2 de `memorilla/Memorilla-Qwen3-8B` con una nueva proyección de salida y se entrena hasta la etapa 3, checkpoint `epoch-04`.

El entrenamiento se realizó sobre el dataset `memorilla/Memorilla-Data` en una sola estación AMD Strix Halo, con aproximadamente una décima parte de los datos usados en el trabajo original (que empleó cuatro H100 a precisión completa para Qwen3-8B). El autor advierte que este port carece de la etapa de personalización presente en el original y que el bucle de generación reimplementa el protocolo de Stanford sin vLLM. El SHA-256 de `memory.pt` es `1ffad0557d43796255a25c2a03620e4159542d8073b0627123dbafb605ff472a`.

## Capacidades

- Inyección de contexto documental: convierte pregunta y documentos en 16 tokens de memoria que mejoran el question answering del decodificador congelado.
- Mejora de exactitud en QA sobre documentos: incrementos medidos en FactKG, TriviaQA, LaMP-4, NarrativeQA, LaMP-7, PV4, PMv2 y PubMedQA frente a closed book.
- Funcionamiento sobre decodificador congelado y cuantizado: no requiere reentrenar ni modificar los pesos de Gemma 4.
- Compatibilidad con pipelines de recuperación: acepta embeddings de documentos generados por Qwen3-Embedding-4B.
- Soporte multilingüe: limitado a inglés según la model card.
- Tool calling / function calling: no disponible (el módulo no es un modelo generativo autónomo).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Question answering sobre corpus documental: se codifican los documentos relevantes con Qwen3-Embedding-4B, el módulo genera los 16 tokens y el decodificador responde con el contexto inyectado; adecuado para dominios con documentación estable.
- Asistentes de atención al cliente con base de conocimiento: el módulo permite inyectar fragmentos de documentación en el prompt sin reentrenar el modelo base, reduciendo coste de adaptación.
- Análisis de literatura científica: PubMedQA muestra una mejora de +23 puntos sobre closed book, lo que lo hace útil para responder preguntas sobre abstracts biomédicos.
- Verificación de hechos (fact-checking): FactKG mejora +12,8 puntos, lo que permite usar el módulo en pipelines de comprobación de afirmaciones contra bases de conocimiento.
- Resumen y respuesta sobre narrativas largas: NarrativeQA mejora +9,56 F1, aplicable a resumen de documentos extensos o guiones.
- Personalización ligera de respuestas: LaMP-4 triplica el ROUGE-L (5,51 a 16,96), útil para tareas de generación condicionada por perfil o historial.
- Investigación en memoria externa: sirve como referencia reproducible para estudiar soft-prompts sobre decodificadores cuantizados en hardware de consumo.

## Benchmarks y rendimiento

Evaluación bajo el protocolo de Stanford (prompts por benchmark, decodificación greedy, 500 filas de test con semilla fija; TriviaQA 500 filas y PubMedQA 100 filas son el test completo).

| Benchmark | Métrica | Closed book | Documentos incorrectos | Memoria | Memoria − incorrectos [IC 95%] | Memoria − closed book [IC 95%] |
|---|---|---:|---:|---:|---:|---:|
| FactKG | accuracy | 67,0 | 69,4 | **79,8** | **+10,4** [6,0; 14,8] | +12,8 [8,6; 17,2] |
| TriviaQA | exact match | 54,0 | 56,2 | **63,2** | **+7,0** [4,2; 10,0] | +9,2 [5,8; 12,6] |
| LaMP-4 | ROUGE-L | 5,51 | 13,62 | **16,96** | **+3,34** [2,37; 4,37] | +11,45 [10,38; 12,53] |
| NarrativeQA | F1 | 7,07 | 14,20 | **16,62** | **+2,43** [0,84; 4,09] | +9,56 [7,60; 11,50] |
| LaMP-7 | ROUGE-L | 37,76 | 44,96 | **46,24** | +1,28 [−0,12; 2,72] | +8,47 [7,00; 9,92] |
| PV4 | accuracy | 61,4 | 65,8 | **67,4** | +1,6 [−2,4; 5,6] | +6,0 [1,0; 11,4] |
| PMv2 | accuracy | 28,0 | **34,6** | 33,8 | −0,8 [−5,0; 3,4] | +5,8 [1,4; 10,4] |
| PubMedQA | accuracy | 23,0 | **51,0** | 46,0 | −5,0 [−14,0; 4,0] | +23,0 [9,0; 36,0] |

Comparación con los resultados de Stanford (Qwen3-8B, Tabla 11 del paper v3):

| Benchmark | Métrica | Stanford closed book | Stanford Memorilla | Ganancia Stanford | Nuestro closed book | Nuestra memoria | Nuestra ganancia |
|---|---|---:|---:|---:|---:|---:|---:|
| TriviaQA | exact match | 36,00 | 57,00 | +21,00 | 54,0 | 63,2 | +9,2 |
| PV4 | accuracy | 58,30 | 66,65 | +8,35 | 61,4 | 67,4 | +6,0 |
| PV4, subconjunto difícil | accuracy | 31,96 | 41,97 | +10,01 | 41,67 | 48,61 | +6,94 |
| NarrativeQA | F1 | 9,87 | 16,56 | +6,69 | 7,07 | 16,62 | +9,56 |
| FactKG | accuracy | 65,97 | 84,33 | +18,36 | 67,0 | 79,8 | +12,8 |
| LaMP-7 | ROUGE-L | 43,13 | 48,37 | +5,24 | 37,76 | 46,24 | +8,47 |
| LaMP-4 | ROUGE-L | 12,24 | 18,15 | +5,91 | 5,51 | 16,96 | +11,45 |
| PubMedQA | accuracy | 21,00 | 59,00 | +38,00 | 23,0 | 46,0 | +23,0 |
| PMv2 | accuracy | 25,64 | 44,60 | +18,96 | 28,0 | 33,8 | +5,8 |

El autor advierte que la comparación no es equivalente: decodificadores distintos, muestras de 500 filas frente a test completos (±4 puntos en accuracy, ±10 en PubMedQA, 72 filas en el subconjunto difícil de PV4), elección de último epoch frente a selección por benchmark, ausencia de etapa de personalización y bucle de generación sin vLLM.

## Requisitos de hardware

- VRAM del módulo: ~190M de parámetros; en fp16 ocupa aproximadamente 0,4 GB, más el overhead de activaciones.
- VRAM del codificador: Qwen3-Embedding-4B requiere aproximadamente 8-9 GB en fp16 o ~4-5 GB en 4 bits.
- VRAM del decodificador: Gemma 4 26B-A4B con expertos enrutados en 4 bits; el peso completo en 4 bits ronda los 13-15 GB, más KV cache. No se especifica cifra exacta en la información disponible.
- GPU recomendadas: el autor entrenó en una AMD Strix Halo (APU con memoria unificada); para inferencia se puede usar cualquier GPU con suficiente VRAM. A100 40/80 GB y H100 son holgadas; RTX 4090 (24 GB) es viable si el decodificador en 4 bits cabe junto con el codificador y el módulo.
- Cabe en GPU de consumo: sí, siempre que se use cuantización 4 bits del decodificador; una RTX 4090 o una APU con memoria unificada grande son opciones realistas.
- Despliegue: no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI; el autor indica que su bucle de generación reimplementa el protocolo de Stanford sin vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Memorilla-Gemma4-26B-A4B (este) | Módulo de memoria sobre Gemma 4 26B-A4B | ~190M (módulo) + decodificador 26B-A4B | No disponible | Apache 2.0 | Hugging Face (módulo); decodificador y codificador aparte |
| Memorilla-Qwen3-8B (Stanford SNAP) | Módulo de memoria sobre Qwen3-8B | No disponible (módulo) + Qwen3-8B | No disponible | No disponible en la información | Hugging Face |
| Gemma 4 26B-A4B-it (decodificador base) | LLM MoE | 26B totales / 4B activos | No disponible | No disponible en la información | Hugging Face (google) |
| Qwen3-Embedding-4B (codificador) | Modelo de embeddings | 4B | No disponible | No disponible en la información | Hugging Face (Qwen) |

La comparación directa con el original de Stanford está limitada por las diferencias de decodificador, datos de entrenamiento y protocolo de evaluación descritas en la sección de benchmarks.

## Limitaciones y advertencias

- En tres benchmarks (PV4, PMv2, PubMedQA) los documentos incorrectos funcionan igual o mejor que los correctos; la mejora sobre closed book no puede atribuirse a los documentos en esos casos.
- En PubMedQA la memoria (46,0) queda por debajo de los documentos incorrectos (51,0), con un intervalo que cruza cero en la diferencia.
- La comparación con Stanford no es equivalente: distintos decodificadores, muestras parciales, sin etapa de personalización y sin vLLM.
- Solo soporta inglés según la model card.
- El repositorio no incluye el decodificador ni el codificador; requiere descargas adicionales y gestión de versiones.
- Proyecto independiente no afiliado ni respaldado por Stanford SNAP ni por Google.
- Riesgo de alucinación inherente al decodificador subyacente; el módulo no lo mitiga.
- Sesgos: no documentados en la información disponible.
- Uso comercial: permitido por Apache 2.0 para el módulo, pero sujeto a las licencias del decodificador Gemma 4 y del codificador Qwen3-Embedding-4B, que deben verificarse por separado.
- Entrenado con una décima parte de los datos del original y en hardware de consumo, lo que puede limitar la generalización.

## Enlaces

- Hugging Face del módulo: https://huggingface.co/DataPhreak/Memorilla-Gemma4-26B-A4B
- Repositorio del port (código, receta de entrenamiento y write-up): https://github.com/DataBassGit/Memorilla-Gemma4-StrixHalo
- Repositorio original de Stanford SNAP: https://github.com/snap-stanford/memorilla
- Paper (arXiv:2610.21375): https://arxiv.org/abs/2610.21375
- Decodificador base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Codificador: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Módulo original de Stanford: https://huggingface.co/memorilla/Memorilla-Qwen3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/memorilla/Memorilla-Data

# micrictor/bonsai-shellai

## Resumen

Bonsai ShellAI es una derivada cuantizada y podada del modelo Gemma 4 E2B instruction-tuned de Google DeepMind, publicada por el usuario micrictor. Su propósito concreto es generar sugerencias de comandos de shell en lenguaje natural, pensada para integrarse en ShellAI, una interfaz de línea de comandos que ofrece asistencia mediante modelos locales sin llamadas de red. El artefacto distribuido es un único fichero GGUF de 1.927 GB (1.794 GiB) que contiene pesos y tokenizador.

El modelo parte de los 4.498.808.355 parámetros del Gemma 4 E2B original y aplica una poda de canales MLP del 10% nominal (8.333% efectivo tras alineación), reduciendo la anchura FFN de 6144 a 5632, además de una receta de cuantización mixta Q4_K_S calibrada con matriz de importancia. Las tablas de embedding (PLE) y el vocabulario principal atado se cuantizan a Q2_K. No se realizó entrenamiento de recuperación, SFT, RL ni destilación.

Su relevancia radica en el enfoque de compresión agresiva para despliegue en CPU: el autor reporta un pico de RSS de 1.971 GiB en evaluación con dos hilos, si bien advierte explícitamente que no demuestra inferencia en 1.5 GB ni ha validado umbrales de VRAM en GPU ni rendimiento en Raspberry Pi. Es un artefacto experimental de nicho, no un lanzamiento oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4 E2B (profundidad, anchura residual, atención y compartición KV preservadas) |
| Parametros totales | 4.498.808.355 (modelo base); tamaño del artefacto GGUF: 1.927 GB |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la evaluación usó contexto 2048) |
| Tipos de cuantizacion | Cuerpo: Q4_K_S mixto calibrado con imatrix (incluye ocho matrices Q5_K y excepciones en coma flotante); PLE y vocabulario atado: Q2_K |
| Idiomas soportados | en |
| Licencia | apache-2.0 (con license_link a la página Apache 2.0 de Google para Gemma) |
| Formato de pesos | GGUF (fichero `bonsai-shellai-Q4_K_S-MLP10-PLE_Q2_K-VOCAB_Q2_K.gguf`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Gemma 4 E2B instruction-tuned: un transformer con compartición de atención/KV en las últimas 20 capas y una tabla de embedding por capa (PLE) separada, además de un vocabulario principal atado a la salida. La modificación principal es una poda de canales MLP guiada por activaciones: la anchura FFN base de 6144 se reduce a 5632 (8.333% efectivo tras alineación), mientras que las 20 capas finales con KV compartida conservan el doble de anchura. La profundidad, la anchura residual, la compartición de atención/KV y el vocabulario se mantienen intactos.

La selección de canales se realizó con 95 contextos de entrenamiento verificados. Sobre el modelo podado en BF16 se recolectó una matriz de importancia nueva procesando 16.384 tokens en ocho fragmentos, y las 275 matrices cuantizadas del cuerpo pasaron comprobaciones de cobertura y dimensiones. Las tablas de búsqueda principal y PLE, sin entradas en la matriz de importancia, se cuantizaron sin ponderación. La exportación parte de BF16, sin recuantizar un modelo ya cuantizado. No hubo entrenamiento de recuperación, SFT, RL ni destilación. La conversión y cuantización usaron la revisión `5f55650a78f92aff4d48d671423e888fac0469ff` de llama.cpp.

## Capacidades

- Generación de texto orientada a sugerencias de comandos de shell a partir de instrucciones en lenguaje natural.
- Salida en formato de bloque JSON Markdown (una única valla), según el flujo de evaluación descrito por el autor.
- Conversación multi-turno mediante la plantilla de chat nativa de Gemma.
- Ejecución local sin red, orientada a privacidad de datos en terminal.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el artefacto es text-only.

## Casos de uso

- Asistencia en terminal sin conexión: el modelo genera el comando de shell que corresponde a una petición en lenguaje natural, integrándose en la CLI ShellAI para que el usuario revise y ejecute manualmente la sugerencia.
- Entornos con requisitos de privacidad: al ejecutarse localmente sobre llama.cpp, los prompts y el contexto del usuario no salen de la máquina, adecuado para terminales en sistemas con datos sensibles.
- Despliegue en CPU con memoria limitada: el artefacto de 1.927 GB y el pico de RSS reportado de 1.971 GiB permiten probarlo en equipos sin GPU dedicada, con dos hilos y contexto 2048 en la evaluación del autor.
- Automatización de tareas repetitivas de administración: sugerencias de comandos para operaciones cotidianas (listado, búsqueda, manipulación de ficheros) que el operador valida antes de ejecutar.
- Prototipado de interfaces de lenguaje natural sobre shell: útil para experimentar con normalización de salida JSON y parsers tolerantes a vallas antes de fijar un contrato estricto.
- Evaluación de técnicas de poda y cuantización mixta: sirve como caso de estudio reproducible de poda MLP guiada por activaciones más imatrix sobre un modelo Gemma 4, con manifiesto público y hashes.

## Benchmarks y rendimiento

| Metrica | Bonsai ShellAI | Control Q4 calibrado completo |
|---|---|---|
| Panel de desarrollo de 24 casos ejecutables (normalizador tolerante a valla JSON) | 14/24 | 14/24 |
| Interfaz JSON estricta | 5/24 | 14/24 |

Datos de ejecución en CPU reportados por el autor: dos hilos, contexto 2048, máximo 64 tokens generados, sin repacking y swap permitido. Cinco prompts de temporización dieron una mediana de tiempo de respuesta de 6.579 s y una mediana de prompt más decodificación de 5.216 s. El pico muestreado de RSS fue de 1.971 GiB (2.117 GB) sin swap de proceso muestreado. El autor advierte que son comparaciones emparejadas estrechas, no un benchmark held-out, y que las muestras de RSS son cotas inferiores.

## Requisitos de hardware

- VRAM estimada para GPU: no disponible; el autor no ha validado umbrales de VRAM en GPU.
- Memoria en CPU: pico de RSS muestreado de 1.971 GiB (2.117 GB) en la evaluación del autor; no es una garantía de ajuste físico.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU consumer?: no disponible; sin validación publicada.
- Opciones de despliegue: runtime llama.cpp compatible con Gemma 4 GGUF, con la revisión probada `5f55650a78f92aff4d48d671423e888fac0469ff` y la plantilla de chat nativa de Gemma. Otras opciones (vLLM, TGI, Ollama) no están documentadas para este artefacto.
- Latencia y throughput: mediana de 6.579 s de respuesta y 5.216 s de prompt más decodificación en CPU con dos hilos y contexto 2048. Rendimiento en Raspberry Pi no validado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai ShellAI (este) | 4.498.808.355 (base); GGUF 1.927 GB | no disponible | 14/24 tolerante a valla; 5/24 estricto en panel de 24 casos | apache-2.0 | Hugging Face, GGUF |
| google/gemma-4-E2B-it (base) | 4.498.808.355 | no disponible | no disponible en la información proporcionada | apache-2.0 | Hugging Face |
| Control Q4 calibrado completo | no disponible | no disponible | 14/24 tolerante a valla; 14/24 estricto | no disponible | referenciado por el autor, sin enlace |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer comparaciones adicionales con modelos de la misma categoría.

## Limitaciones y advertencias

- El modelo genera texto con sugerencias de comandos; el GGUF no ejecuta comandos. Cualquier comando sugerido debe revisarse antes de ejecutarse y la evaluación realizada no garantiza que comandos arbitrarios sean seguros.
- Caída acusada en interfaz JSON estricta: 5/24 frente a 14/24 del control. El normalizador tolerante a valla no repara el contenido del comando ni extrae comandos de prosa.
- El panel de 24 casos es de desarrollo, reutilizado e inspeccionado; no es un benchmark held-out ni prueba equivalencia general con el control.
- Solo se declara inglés; no hay soporte multilingüe documentado.
- El autor no ha validado VRAM en GPU, rendimiento en Raspberry Pi ni la afirmación de inferencia en 1.5 GB; las muestras de RSS son cotas inferiores afectadas por paginación y carga de fondo.
- Dependencia de una revisión concreta de llama.cpp; distintas versiones del runtime difieren en soporte de arquitectura y pueden romper la compatibilidad.
- Es una derivada modificada, no un lanzamiento oficial de Google DeepMind; la atribución no implica respaldo.
- Riesgo de alucinación y sesgos del modelo base: no disponible en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/micrictor/bonsai-shellai
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it/tree/3e22461f65e89153144f8adb70e3b8c2cc9845a7
- Repositorio ShellAI: https://github.com/micrictor/shellai
- Modelos etiquetados shellai en Hugging Face: https://huggingface.co/models?other=shellai
- Licencia Apache 2.0 de Gemma: https://ai.google.dev/gemma/apache_2

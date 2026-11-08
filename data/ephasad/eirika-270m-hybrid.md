# EphAsad/Eirika-270M-Hybrid

## Resumen

Eirika-270M Hybrid es un modelo de lenguaje experimental de 268 millones de parámetros construido mediante fine-tuning supervisado de `google/gemma-3-270m-it`. Lo desarrolla el usuario EphAsad y se publica como un checkpoint BF16 completamente fusionado (no un adaptador PEFT), orientado a un caso de uso muy concreto: enrutar peticiones del usuario hacia un conjunto cerrado de herramientas de solo lectura, trabajar con texto recuperado y devolver respuestas breves con identificadores de fuente explícitos, absteniéndose cuando la evidencia es ausente o contradictoria.

La propuesta no es un modelo de razonamiento general, sino un componente lingüístico dentro de un sistema híbrido a nivel de aplicación. El modelo se combina con `FixedEvidenceCircuit`, un módulo de ranking de evidencia determinista y congelado que tokeniza el texto, elimina stopwords, proyecta cada token en 256 dimensiones fijas mediante hashing SHA-256 y ordena candidatos por similitud de coseno con proyección identidad. Ese circuito no está embebido en las capas del transformer ni modifica los pesos de Gemma: opera como paso previo de recuperación léxica.

Es relevante ahora por dos motivos. Primero, explora una vía poco habitual en modelos pequeños: en lugar de competir en conocimiento paramétrico, delega el conocimiento en herramientas y en un mecanismo de ranking externo, lo que reduce requisitos de cómputo y facilita el despliegue local. Segundo, se publica como una primera release experimental con evaluación limitada a datos sintéticos generados por el autor, por lo que su valor actual es fundamentalmente de investigación sobre tool use en modelos de menos de 300M de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder de texto Gemma 3 (transformer denso) |
| Parametros totales | 268.098.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible como límite oficial; el fine-tuning usó secuencias de 1.024 tokens y se probaron entradas de ~7.800 tokens |
| Tipos de cuantizacion | No especificados por el autor; el repo publica pesos BF16 (el modelo base Gemma 3 270M admite QAT INT4) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | Safetensors (`model.safetensors`, BF16 fusionado) |
| Modelo base | google/gemma-3-270m-it |
| Método de entrenamiento | LoRA BF16 supervisado, pérdida solo sobre respuesta del asistente |
| Datos de entrenamiento | 2.400 ejemplos sintéticos; 240 de validación; 240 held-out disjuntos por tema |
| Épocas | 2 |
| Capacidad LoRA entrenada | ~3,8M parámetros entrenables |
| Tamaño del repo | 0,6 GB |
| Componente híbrido | Proyección bag-of-words por hash SHA-256 y ranking de similitud en `eirika_hybrid.py` |
| Herramientas soportadas | `list_files`, `search_documents`, `read_document`, `search_web`, `open_webpage`, `abstain` |
| Formatos locales | `.txt`, `.md`, `.pdf`, `.docx` mediante el host de ejemplo |
| Acceso a internet | Deshabilitado por defecto; requiere proveedor configurado explícitamente |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de la familia Gemma 3, con aproximadamente 268M de parámetros, heredado de `google/gemma-3-270m-it`. El autor aplicó un fine-tuning supervisado con LoRA en BF16 (unos 3,8M parámetros entrenables) usando pérdida calculada únicamente sobre los turnos de respuesta del asistente, con 2.400 ejemplos sintéticos, 240 de validación y 240 de test held-out disjuntos por tema, durante 2 épocas y seleccionando el mejor checkpoint por pérdida de validación. Los pesos publicados están completamente fusionados en BF16, de modo que la inferencia no requiere cargar un adaptador PEFT.

La innovación declarada no está en la arquitectura del transformer, sino en el ensamblaje a nivel de sistema. El flujo es: el modelo propone una llamada a herramienta en JSON, un validador del host comprueba el esquema y los límites de acceso, se ejecuta la herramienta de solo lectura, el texto recuperado pasa por `FixedEvidenceCircuit` (tokenización, eliminación de stopwords, hashing a 256 dimensiones, similitud de coseno con proyección identidad) y el modelo recibe tanto extractos como una lista ordenada de identificadores de fuente para generar una respuesta JSON con citas. El host valida después que las citas correspondan a fuentes suministradas. El propio autor subraya que el circuito no genera la respuesta, no verifica implicación factual y no modifica los pesos de Gemma, y que el ranking es léxico, no semántico aprendido.

## Capacidades

- Generación de texto conversacional en inglés con respuestas breves y concisas.
- Selección de herramientas estructuradas entre un conjunto cerrado y definido de seis operaciones de solo lectura.
- Emisión de propuestas de llamada a herramienta en formato JSON validable por un host externo.
- Trabajo con texto recuperado: extracción de respuestas cortas a partir de fragmentos suministrados, con identificadores de fuente.
- Abstención explícita (`abstain`) cuando la evidencia está ausente o es contradictoria.
- Lectura de documentos locales en `.txt`, `.md`, `.pdf` y `.docx` a través del host de ejemplo.
- Búsqueda web y apertura de páginas, solo si se configura un proveedor externo (deshabilitado por defecto).
- Ranking de evidencia léxico mediante el módulo determinista `FixedEvidenceCircuit`.
- No dispone de visión, audio, modo thinking explícito ni capacidades multimodales.

## Casos de uso

- Asistente documental local sobre carpetas aprobadas: el modelo enruta la consulta a `search_documents` y `read_document`, y responde citando los identificadores de fuente devueltos por el host, lo que permite auditar cada afirmación contra el documento original.
- Extracción de respuestas puntuales de contratos o informes: dado un fragmento y una pregunta concreta, el modelo devuelve una frase corta con la referencia de origen, útil en flujos de revisión donde el operador humano valida después.
- Enrutador de intenciones en pipelines RAG: al estar entrenado para elegir entre seis herramientas, puede actuar como clasificador de acción de bajo coste antes de invocar recuperadores más pesados o modelos mayores.
- Investigación sobre tool use en modelos pequeños: su tamaño (268M) y su esquema de entrenamiento documentado (2.400 ejemplos, 2 épocas, LoRA de 3,8M) lo hacen adecuado como baseline reproducible en experimentos de ablación.
- Prototipos de asistente con abstención obligatoria: en dominios donde una respuesta sin respaldo es peor que no responder, el par modelo + validación de citas del host ofrece un mecanismo explícito de rechazo.
- Evaluación de recuperación léxica frente a semántica: el circuito de hashing a 256 dimensiones permite medir en qué consultas la similitud por solapamiento de tokens basta y en cuáles falla, como paso previo a introducir embeddings densos.
- Despliegue en hardware muy limitado: con 268M de parámetros y pesos BF16 de aproximadamente 0,6 GB, cabe en entornos de borde o en máquinas sin GPU dedicada para tareas de enrutamiento y extracción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una prueba cualitativa: tres sondas de estrés de aproximadamente 7.800 tokens cada una, con 2 de 3 respuestas correctas. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones estándar de tool calling, y las evaluaciones más favorables citadas por el autor usan datos sintéticos generados por él mismo.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 0,6 GB para los pesos, más overhead de activaciones y caché KV; cabe holgadamente en GPUs de 4 GB o incluso en inferencia por CPU.
- Cuantización: el autor no publica versiones GGUF ni INT8/INT4 de este checkpoint, aunque el modelo base Gemma 3 270M admite QAT INT4, lo que permitiría reducir aún más el footprint si se generan esas cuantizaciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también tarjetas de datacenter como A100 o H100, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs con 4 GB o más de VRAM, y en CPU con llama.cpp u Ollama si se convierte a GGUF.
- Opciones de despliegue: `transformers` con safetensors es la vía directa; vLLM, TGI, llama.cpp y Ollama son viables, aunque el autor no documenta recetas específicas para ellos. El módulo `eirika_hybrid.py` y el host de herramientas se ejecutan en Python junto al modelo.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eirika-270M Hybrid | 268M | No especificado (entrenado a 1.024 tokens) | Tool use + ranking léxico externo | Gemma Terms of Use | Hugging Face, release experimental |
| google/gemma-3-270m-it | ~270M | No disponible en la información proporcionada | Modelo instruct generalista | Gemma Terms of Use | Hugging Face, oficial de Google |
| T5Gemma 2 (270M-270M) | ~370M en total, excluyendo visión | Larga (encoder-decoder) | Encoder-decoder multimodal | No disponible en la información proporcionada | Blog de Google, familia T5Gemma 2 |

Frente a `gemma-3-270m-it`, Eirika sacrifica generalidad por un comportamiento muy acotado: enrutamiento a seis herramientas, respuestas con citas y abstención. No hay datos públicos que permitan afirmar que supere al base en ninguna tarea estándar. Frente a T5Gemma 2, la comparación es de categoría distinta: aquel es un encoder-decoder multimodal y de contexto largo, mientras que Eirika es un decoder denso de texto con un componente de recuperación externo.

## Limitaciones y advertencias

- Modelo explícitamente experimental: no es un modelo de razonamiento general ni una fuente verificada de consejo factual, médico, legal, de laboratorio o de seguridad crítica.
- Evaluación muy limitada: los mejores resultados reportados provienen de datos sintéticos generados por el autor; no hay benchmarks independientes.
- Solo inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Riesgo de alucinación: aunque el diseño favorece la abstención, la validación de citas del host comprueba pertenencia a las fuentes suministradas, no implicación factual; una cita válida puede acompañar una afirmación incorrecta.
- El ranking de evidencia es léxico: las colisiones de hash, las paráfrasis, los documentos largos y los distractores degradan la relevancia, y el circuito no aporta comprensión semántica.
- Límite práctico de contexto: el fine-tuning usó 1.024 tokens y solo se probaron tres casos de ~7.800 tokens con 2 aciertos de 3; no debe asumirse un contexto largo fiable.
- No apto para agentes autónomos sin restricciones, ejecución de comandos de shell ni decisiones profesionales sin revisión humana.
- El acceso a internet está deshabilitado por defecto y requiere configuración explícita de un proveedor.
- Licencia Gemma Terms of Use: impone restricciones de uso comercial y de uso aceptable que deben revisarse antes de cualquier despliegue en producción.
- El componente híbrido no está embebido en el transformer: quien cargue solo los pesos con `transformers` obtiene el modelo fine-tuneado, pero no el flujo completo de herramientas y ranking.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EphAsad/Eirika-270M-Hybrid
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Noticia sobre Gemma 3 270M: https://www.allaboutai.com/ai-news/google-introduces-gemma-3-270m/
- Blog de T5Gemma 2: https://blog.google/innovation-and-ai/technology/developers-tools/t5gemma-2/

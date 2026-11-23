# kanippa/llm2026-g6-chain3-mix-qwen35-08b

## Resumen

kanippa/llm2026-g6-chain3-mix-qwen35-08b es un ajuste fino (fine-tuning) de tipo supervisado (SFT) del modelo Qwen3.5-0.8B, desarrollado por el usuario kanippa en el contexto de un curso de LLM (identificador de proyecto llm2026, grupo G6). El modelo está especializado en generación de respuestas para sistemas RAG (Retrieval-Augmented Generation) en japonés, con un formato de prompt que presenta cinco pasajes de contexto y solicita una respuesta corta junto con el identificador del fragmento que la respalda. El pipeline declarado es image-text-to-text, aunque la model card describe exclusivamente tareas de QA textual sobre contexto recuperado.

El modelo parte de un checkpoint intermedio del mismo autor (llm2026-g6-ctrl-legacy-qwen35-08b) y se entrena con una pasada adicional de 992 ejemplos (62 actualizaciones de optimizador): 496 ejemplos de QA ordinario, 248 de QA en dos pasos y 248 de QA en tres pasos. De estos últimos, 90 usaron los cinco fragmentos recuperados de forma natural y 158 usaron contextos complementados con evidencia de la fuente. El resultado es un generador de 852.985.920 parámetros (aproximadamente 0,85B) en FP16, con licencia Apache 2.0 y soporte declarado únicamente para japonés.

Su relevancia es acotada: se trata de un experimento académico de bajo perfil (0 descargas, 0 likes en el momento de la consulta) orientado a evaluar estrategias de encadenamiento de QA en tres pasos sobre un modelo pequeño. No obstante, resulta útil como referencia para quienes investigan pipelines RAG en japonés con modelos por debajo de 1B de parámetros y para reproducir el flujo de entrenamiento publicado en el repositorio de código del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-0.8B; detalles internos no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 según la model card) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85B de parámetros. La model card no detalla la configuración interna (número de capas, dimensión oculta, cabezas de atención, mecanismo de atención), por lo que esos datos no están disponibles. El checkpoint publicado se distribuye en FP16 tras un proceso de merge.

El entrenamiento consiste en una pasada de SFT sobre 992 ejemplos con 62 actualizaciones de optimizador, partiendo del checkpoint kanippa/llm2026-g6-ctrl-legacy-qwen35-08b. La composición del conjunto es: 496 ejemplos de QA ordinario, 248 de QA en dos pasos y 248 de QA en tres pasos. Los ejemplos de tres pasos se construyen enlazando mecánicamente ejemplos existentes de los datasets auto-wiki-qa (cl-nagoya), JaQuAD (SkelterLabsInc) y JSQuAD dentro de JGLUE (yahoojapan), con un pool de replay que también utiliza JEMHopQA y NIILC. Los pasajes de evidencia provienen del corpus del curso (bumbuboon/llm-course-final-2026). No se menciona uso de RLHF, DPO ni decodificación especulativa. El prompt en japonés presenta cinco pasajes y solicita una respuesta corta más un identificador de fragmento de soporte, lo que convierte al modelo en un generador con atribución de evidencia integrada.

## Capacidades

- Generación de respuestas cortas a preguntas en japonés condicionadas a un contexto de cinco pasajes recuperados.
- Atribución de evidencia: devuelve el identificador del fragmento que respalda la respuesta.
- QA encadenado en dos y tres pasos, entrenado explícitamente para razonamiento multi-step sobre el contexto.
- Manejo de contextos complementados con evidencia de la fuente (158 de los 248 ejemplos de tres pasos).
- Capacidad declarada de pipeline image-text-to-text según los tags de Hugging Face, aunque la model card no describe tareas de visión ni proporciona detalles al respecto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al japonés según el campo `language`.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Generación de respuestas con atribución en sistemas RAG japoneses: el modelo recibe cinco pasajes y devuelve una respuesta corta junto con el ID del fragmento de soporte, lo que permite auditar la fuente de cada afirmación en un pipeline de recuperación-generación.
- QA multi-hop sobre documentación interna: gracias al entrenamiento en dos y tres pasos, puede resolver preguntas que requieren combinar información de varios pasajes del contexto, útil en bases de conocimiento corporativas en japonés.
- Asistente de atención al cliente en japonés: con contextos de cinco fragmentos recuperados de una base de FAQs, el modelo genera respuestas breves y citables, adecuado para entornos donde la trazabilidad de la respuesta es requisito.
- Evaluación de pipelines de recuperación: al devolver el ID del chunk de soporte, sirve como componente de medición para comparar estrategias de retrieval (por ejemplo, recuperación natural frente a contextos complementados con evidencia).
- Prototipado y experimentación académica: su tamaño de 0,85B y licencia Apache 2.0 permiten ejecutarlo en hardware modesto para reproducir experimentos de encadenamiento de QA descritos en el repositorio del autor.
- Extracción de respuestas con cita en corpus legales o técnicos japoneses: el formato de salida (respuesta corta + ID de fragmento) encaja en flujos de verificación documental donde se exige señalar la fuente exacta.
- Componente de un sistema de búsqueda aumentada en el aula o en cursos: el corpus de evidencia procede de un curso, por lo que el modelo está alineado con dominios educativos y materiales docentes en japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 2-3 GB para contextos moderados.
- Cuantización: aunque no se documentan versiones cuantizadas, al tratarse de un transformer de 0,85B es viable convertirlo a GGUF (Q4_K_M, Q5_K_M, Q8_0) y reducir el uso de memoria por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de datacenter (A100, H100) aunque no las aprovecha.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer modernas e incluso en CPU con llama.cpp.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI, llama.cpp u Ollama previa conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| kanippa/llm2026-g6-chain3-mix-qwen35-08b | 852.985.920 | no disponible | Apache 2.0 | QA RAG en japonés con atribución y QA en tres pasos | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B | no disponible | Apache 2.0 (según la cadena de licencias del autor) | Modelo generalista multilingüe | Hugging Face |
| kanippa/llm2026-g6-ctrl-legacy-qwen35-08b (checkpoint previo) | ~0,85B | no disponible | Apache 2.0 | QA en japonés (paso anterior del mismo proyecto) | Hugging Face |

La comparación con alternativas de la misma categoría (generadores RAG japoneses de menos de 1B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento muy reducido: 992 ejemplos y 62 actualizaciones de optimizador, lo que limita la generalización fuera del formato exacto de prompt (cinco pasajes + pregunta) y del dominio del corpus del curso.
- Especialización estrecha: el modelo está diseñado para QA sobre contexto recuperado en japonés; su rendimiento en generación libre, código, matemáticas o conversación abierta no está documentado y probablemente sea limitado.
- Idioma: solo se declara soporte para japonés; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Riesgo de alucinación: al ser un modelo de 0,85B entrenado con pocos ejemplos, puede generar respuestas no sustentadas por los pasajes o atribuir incorrectamente el ID del fragmento; la atribución debe validarse en producción.
- Sesgos: no se documentan evaluaciones de sesgo; los datasets de origen (auto-wiki-qa, JaQuAD, JSQuAD, JEMHopQA, NIILC) pueden introducir sesgos propios de sus fuentes.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni evaluaciones de seguridad; conviene revisar las licencias de los datasets de entrenamiento enlazados.
- Pipeline declarado image-text-to-text: la model card no describe capacidades de visión, por lo que ese tag podría ser heredado de la configuración de transformers y no debe asumirse como funcionalidad real.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación externa.
- Contexto máximo: no documentado, lo que impide planificar despliegues con contextos largos sin verificación empírica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kanippa/llm2026-g6-chain3-mix-qwen35-08b
- Checkpoint base (ctrl_legacy): https://huggingface.co/kanippa/llm2026-g6-ctrl-legacy-qwen35-08b/tree/e53ed50a1952aa08da227b413d8fa58b7dd5e0fb
- Modelo original Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
- Código de entrenamiento y exportación (C12 three-step G6 SFT): https://github.com/kanippa2007/llm2026-2-lasthomework/tree/5a50230/src/003/g6_chain3_sft
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa/tree/672dd0d496352282b4064e944a16e00315b796a8
- Dataset JaQuAD: https://huggingface.co/datasets/SkelterLabsInc/JaQuAD/tree/23f5d72cc273c49b35e2d9efe0f51757aa1770bd
- Dataset JSQuAD en JGLUE: https://huggingface.co/datasets/yahoojapan/JGLUE/tree/6f071c09316baae89c3d083a90985b4b1cb9968c
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA/tree/fed5024f4f39f02727e699cb7ccb67935a779a5a
- Dataset NIILC: https://github.com/mynlp/niilc-qa/tree/b6d47968b2e301a5e953fb1922a08ed56099646b
- Corpus del curso (evidencias): https://huggingface.co/datasets/bumbuboon/llm-course-final-2026/tree/e8041a0494e1583fac9eac42699df44619cf84a3

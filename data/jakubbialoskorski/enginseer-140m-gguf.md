# JakubBialoskorski/enginseer-140m-GGUF

## Resumen

Enginseer 140M es un modelo de chat en inglés de 140 millones de parámetros (139.950.720 exactos) entrenado desde cero por Jakub Bialoskorski como prueba de concepto de pipeline completo: tokenizador, código del modelo, bucle de entrenamiento, preentrenamiento, ajuste por instrucciones, evaluación y exportación a GGUF fueron construidos específicamente para el proyecto. No se partió de ningún modelo preentrenado ni se hizo fine-tuning sobre pesos existentes. Se distribuye únicamente en formato GGUF (Q8_0 y f16), con licencia Apache-2.0 y un tamaño de repositorio de 0,4 GB.

Arquitectónicamente es un decoder tipo Llama (RMSNorm, RoPE, SwiGLU) de 24 capas y 640 dimensiones, con una ventana de contexto de 1024 tokens y un tokenizador SentencePiece BPE propio de 32.000 entradas. El preentrenamiento consumió 3.100 millones de tokens en 44 horas sobre una única RTX 3060 de 12 GB, combinando texto general en inglés (FineWeb-Edu y Cosmopedia) con aproximadamente un 1,5% de documentación técnica de herramientas DevOps (Kubernetes, Docker, Prometheus, nginx, OpenTofu, GitHub Actions, entre otras).

Su relevancia es fundamentalmente metodológica y educativa: documenta de forma transparente todo el proceso, publica curvas de bits por byte frente a GPT-2 124M y SmolLM2-135M, y sirve como referencia reproducible de entrenamiento de un modelo pequeño en hardware de consumo. El propio autor advierte que no es un asistente útil: la mayoría de sus respuestas contienen al menos un dato incorrecto y no debe usarse donde la exactitud sea crítica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo Llama (RMSNorm, RoPE, SwiGLU), 24 capas × 640 dimensiones |
| Parámetros totales | 139.950.720 (~140M) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | Q8_0 (150 MB) y f16 (281 MB) |
| Idiomas soportados | Inglés únicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0 y f16); el original se exportó a formato Hugging Face `LlamaForCausalLM` |
| Tokenizador | SentencePiece BPE propio, vocabulario de 32.000 tokens |
| Plantilla de chat | ChatML; descarta los system prompts |
| Parámetros de muestreo recomendados | Decodificación greedy (temperatura 0) y repeat penalty 1,1 |
| Descargas / likes en el momento de la consulta | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un decoder autorregresivo denso compatible con Llama, escrito en PyTorch puro y exportado al formato `LlamaForCausalLM` de Hugging Face para convertirlo después con el conversor estándar de llama.cpp. Emplea RMSNorm, embeddings posicionales rotatorios (RoPE) y activación SwiGLU, con 24 capas de 640 dimensiones y 1024 tokens de contexto. El tokenizador es un BPE de SentencePiece entrenado también para el proyecto, con 32.000 tokens de vocabulario.

El preentrenamiento utilizó 3.100 millones de tokens durante 44 horas en una sola RTX 3060 de 12 GB, con una mezcla casi enteramente de inglés general procedente de FineWeb-Edu (4 archivos de la muestra 10BT) y Cosmopedia (openstax, khanacademy, wikihow y parte de stanford), más un 1,5% de documentación DevOps centrada en Kubernetes y Docker. El ajuste por instrucciones se hizo sobre 33.000 ejemplos de chat: un 58% son conversaciones cortas generadas por el modelo profesor Qwen3.6-35B-A3B ejecutado localmente en llama.cpp (preguntas cotidianas respondidas a partir de pasajes leídos en el preentrenamiento, small talk, tareas creativas breves, preguntas sobre cosas inventadas que debe declinar y mensajes en otros idiomas), un 34% son pares pregunta-respuesta del mismo profesor sobre la documentación DevOps y un 9% es chat general de oasst2. El mismo profesor evalúa las respuestas en la fase de evaluación. Todos los datos empleados tienen licencias permisivas (ODC-BY-1.0, Apache-2.0, CC-BY-4.0, MPL-2.0, BSD-2-Clause, BSD-3-Clause y MIT).

## Capacidades

- Generación de texto conversacional en inglés con fluidez gramatical, limitada a respuestas cortas.
- Respuesta a preguntas cotidianas sencillas cuando el contenido aparece en los pasajes vistos durante el preentrenamiento (10,0% de respuestas correctas y 8,0% parciales en la evaluación del profesor).
- Declinación explícita de preguntas sobre entidades o hechos inventados: 31,1% de rechazos correctos, frente al 2,2% de SmolLM2-135M-Instruct.
- Gestión de mensajes en idiomas distintos del inglés: en el 99,2% de los casos responde en inglés pidiendo que se escriba en ese idioma.
- Preguntas y respuestas sobre documentación técnica DevOps (Kubernetes, Docker, Prometheus, nginx, OpenTofu, OpenRC, unbound, GitHub Actions, MeshCore), aunque con una tasa de acierto de hechos exactos del 0,7% sobre documentación no vista.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No soporta system prompts (la plantilla los elimina porque el modelo nunca los vio durante el entrenamiento).
- Sin memoria entre conversaciones, sin acceso a internet, sin capacidades de visión ni audio.

## Casos de uso

- Material didáctico sobre entrenamiento de LLM: el repositorio documenta tokenizador, bucle de entrenamiento, mezcla de datos, evaluación y exportación GGUF, por lo que sirve como referencia paso a paso para cursos y talleres de formación desde cero.
- Prueba de concepto de despliegue en local: con 150 MB en Q8_0 puede cargarse en un portátil, una Raspberry Pi o un contenedor ligero para validar pipelines de servicio con la API compatible de OpenAI de `llama-server` antes de invertir en modelos mayores.
- Base para experimentos de investigación controlados: al ser entrenamiento propio y con datos conocidos, permite estudiar efectos de la mezcla de datos, del tokenizador o del ajuste por instrucciones sin las incógnitas de un modelo preentrenado de terceros.
- Demostración de rechazo de alucinación en modelos pequeños: su 31,1% de declinación ante preguntas sobre cosas inventadas lo hace útil para ilustrar técnicas de calibración y abstención en modelos de menos de 200M de parámetros.
- Asistente de consulta de documentación DevOps en entornos de pruebas: responde sobre Kubernetes, Docker o nginx a partir del corpus incluido, siempre con revisión humana obligatoria y sin uso en producción.
- Juguete educativo y demos de chat offline: integrable en Jan o LM Studio para mostrar el comportamiento de un modelo conversacional sin conexión y sin coste de API, en talleres o charlas.
- Banco de pruebas de cuantización: la comparación directa entre f16 y Q8_0 permite medir el impacto de la cuantización en un modelo de 140M con la misma base de código.

## Benchmarks y rendimiento

Bits por byte sobre texto reservado (menor es mejor) y benchmarks zero-shot del modelo preentrenado, medidos con el mismo código por el autor:

| Modelo | Tokens de entrenamiento | bpb docs reservados | bpb FineWeb-Edu | HellaSwag | WinoGrande | LAMBADA |
|---|---|---|---|---|---|---|
| GPT-2 124M | WebText, 40 GB de texto | 1,051 | 0,983 | 0,312 | 0,516 | 0,326 |
| SmolLM2-135M | 2T | 0,768 | 0,842 | 0,432 | 0,530 | 0,429 |
| **Enginseer base 140M** | 3,1B | **0,718** | 0,949 | 0,324 | 0,528 | 0,257 |

Respuestas de chat calificadas por el modelo profesor sobre conversaciones reservadas del ajuste por instrucciones, todas con decodificación greedy:

| Modelo | Preguntas cotidianas correctas / parciales | Entidades inventadas declinadas | Otros idiomas → pide inglés |
|---|---|---|---|
| SmolLM2-135M-Instruct | 3,0% / 7,0% | 2,2% | 0,8% |
| **Enginseer, Q8_0** | **10,0% / 8,0%** | **31,1%** | **99,2%** |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 150 MB en Q8_0 y 281 MB en f16; sumando la caché KV para 1024 tokens el consumo total se mantiene por debajo de ~500 MB (estimación a partir del tamaño de los ficheros, no publicada por el autor).
- Cabe en cualquier GPU de consumo: RTX 3060 (la usada para el entrenamiento), RTX 4090, GTX 1060 o superiores, así como en iGPU y en CPU pura.
- Entrenamiento de referencia: 44 horas para 3,1B tokens en una única RTX 3060 de 12 GB.
- Opciones de despliegue confirmadas por el autor: `llama.cpp`, `llama-server` con endpoint compatible con `/v1/chat/completions`, Jan y LM Studio (cualquier aplicación basada en llama.cpp). Soporte en vLLM, TGI u Ollama no está indicado en la información disponible.
- Configuración: cargar con `-c 1024` y usar el template ChatML incluido; el autor recomienda greedy y repeat penalty 1,1 para evitar bucles en respuestas largas.
- Latencia y throughput: no disponibles; no se publican tokens por segundo ni tiempos de primera respuesta. Por el tamaño del modelo, la decodificación en GPU consumer es de milisegundos por token, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens de entrenamiento | bpb docs reservados | HellaSwag | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| **Enginseer 140M** | 139,95M | 1024 | 3,1B | 0,718 | 0,324 | Apache-2.0 | GGUF (Q8_0, f16) |
| GPT-2 124M | ~124M | no disponible en la información | WebText, 40 GB | 1,051 | 0,312 | no disponible en la información | pesos públicos de OpenAI |
| SmolLM2-135M | ~135M | no disponible en la información | 2T | 0,768 | 0,432 | no disponible en la información | modelo base |
| SmolLM2-135M-Instruct | ~135M | no disponible en la información | 2T | no disponible en la información | no disponible en la información | no disponible en la información | modelo ajustado por instrucciones |

Lectura de la comparativa: Enginseer supera a GPT-2 124M y a SmolLM2-135M en bits por byte sobre documentos reservados pese a entrenar con tres órdenes de magnitud menos tokens que SmolLM2, pero queda por debajo en HellaSwag (0,324 frente a 0,432) y por encima solo en LAMBADA (0,257 frente a 0,429 de SmolLM2, donde también pierde). En calidad de chat es claramente mejor que SmolLM2-135M-Instruct en las tres métricas evaluadas, aunque con valores absolutos muy bajos.

## Limitaciones y advertencias

- La mayoría de las respuestas contienen al menos un detalle incorrecto; no realiza operaciones aritméticas y conoce muy pocos hechos exactos.
- Sobre documentación no vista durante el entrenamiento, solo acierta el 0,7% de los hechos exactos evaluados.
- Preguntas con una formulación poco habitual pueden desviarlo hacia respuestas fuera de tema.
- Solo inglés: los mensajes en otros idiomas reciben una respuesta en inglés pidiendo que se escriba en ese idioma; no hay soporte multilingüe real.
- Contexto de 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Sin soporte de herramientas, sin system prompts y sin memoria entre conversaciones; no hay acceso a internet.
- El autor lo describe explícitamente como una demostración del pipeline completo, no como un asistente útil, y desaconseja su uso en cualquier escenario donde la corrección sea importante.
- Licencia Apache-2.0: permite uso comercial y modificación, pero no hay garantías de ningún tipo por parte del autor.
- Sin validación de la comunidad en el momento de la consulta (0 descargas y 0 likes), sin resultados de terceros que corroboren las cifras publicadas.
- Riesgo de bucles en respuestas largas si no se aplica repeat penalty 1,1 y decodificación greedy.
- Los datos de instrucción fueron generados por Qwen3.6-35B-A3B, por lo que puede heredar sesgos de estilo y de contenido de ese profesor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JakubBialoskorski/enginseer-140m-GGUF
- Repositorio con código y documentación completa: https://github.com/JakubBialoskorski/enginseer
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Modelo profesor citado (Qwen3.6-35B-A3B, Apache-2.0): sin enlace directo en la información proporcionada
- No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en la búsqueda web realizada.

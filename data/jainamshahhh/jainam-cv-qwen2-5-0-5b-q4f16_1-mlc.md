# Jainamshahhh/jainam-cv-qwen2.5-0.5b-q4f16_1-MLC

## Resumen

`jainam-cv-qwen2.5-0.5b` es un modelo derivado de Qwen2.5-0.5B-Instruct, desarrollado por Jainam Shah, consistente en un ajuste fino mediante LoRA sobre pares de pregunta-respuesta extraidos exclusivamente de su curriculum vitae. El objetivo no es un asistente general, sino un chatbot de portafolio profesional que responde preguntas sobre la trayectoria del autor y que se ejecuta integramente en el navegador del visitante.

La relevancia tecnica del artefacto reside en su cadena de optimizacion para despliegue en el cliente: ajuste fino LoRA (rango 16, alpha 32), seguido de entrenamiento consciente de cuantizacion (QAT) con estimador de gradiente directo sobre redondeo simulado `q4f16_1`, y exportacion directa de los codigos de 4 bits al layout de tensores de MLC. El resultado se distribuye como libreria MLC/WebLLM ejecutable sobre WebGPU, sin servidor intermedio.

El modelo base Qwen2.5-0.5B-Instruct aporta la arquitectura transformer densa y el tokenizador multilingue; el autor no documenta el contexto nativo en esta ficha, aunque el runtime declara `cs1k` (1024 tokens) en el nombre de la libreria WASM. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-0.5B-Instruct), ajustado con LoRA y QAT |
| Parametros totales | 0,5 mil millones (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens segun el runtime (`cs1k`); contexto nativo del base no disponible en la ficha |
| Tipos de cuantizacion | `q4f16_1` (pesos 4 bits, grupo 32, activaciones fp16) |
| Idiomas soportados | no disponible (heredados del tokenizador Qwen2.5, no declarados) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (layout de tensores propio de MLC-LLM), libreria WASM WebGPU |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso con atencion causal estandar, y se especializa mediante un LoRA de rango 16 y alpha 32 aplicado a todas las proyecciones de atencion y MLP. El conjunto de entrenamiento consta de 1.358 ejemplos de chat escritos manualmente a partir del CV del autor, cubriendo hechos concretos, preguntas de seguimiento, conversacion trivial y preguntas de "casi acierto" donde el tema aparece en las notas pero el detalle no, casos en los que el modelo debe declinar. Se entrenaron 3 epocas con tasa de aprendizaje 2e-4, tamano de lote 8 y calculo de perdida unicamente sobre los tokens del asistente.

La innovacion principal es la etapa de QAT: tras el LoRA se realiza un ajuste fino de pesos completos atravesando un redondeo simulado a `q4f16_1` con estimador de gradiente directo, durante 2 epocas a tasa 1e-5. Posteriormente se exportan exactamente esos codigos de 4 bits al layout de MLC. El pipeline de inferencia combina recuperacion BM25 en JavaScript sobre tarjetas de hechos del CV (top-3 por consulta) inyectadas en el system prompt, con un fallback a la tarjeta de resumen cuando la consulta no tiene tema especifico. El entrenamiento se ejecuto en Modal sobre una GPU L4.

## Capacidades

- Generacion de texto breve y factual (respuestas de 1 a 3 frases) restringida al dominio del CV del autor.
- Recuperacion aumentada ligera en el cliente: BM25 sobre tarjetas de hechos, sin embeddings ni servidor.
- Declinacion controlada de preguntas fuera de dominio o sin detalle disponible (con las salvedades de la evaluacion).
- Conversacion multi-turno basica y small talk dentro del alcance del conjunto de entrenamiento.
- Ejecucion integra en navegador sobre WebGPU mediante WebLLM 0.2.87, sin transmision de datos al servidor.
- No dispone de tool calling, function calling, modo thinking, vision ni audio.
- Capacidad multilingue no declarada ni evaluada; el ajuste fino se realizo sobre datos en ingles.

## Casos de uso

- Chatbot de portafolio profesional: el modelo responde en el navegador del reclutador con latencia local y sin enviar consultas a terceros, lo que elimina el coste de servidor y los problemas de privacidad en un sitio estatico.
- Demostracion de tecnicas de compresion: sirve como caso reproducible de pipeline LoRA + QAT + exportacion MLC para equipos que evaluen desplegar modelos pequenos en el cliente.
- Asistente de FAQ acotado: con un corpus de tarjetas de hechos y recuperacion BM25, puede adaptarse a documentacion de producto o bases de conocimiento cerradas de baja complejidad.
- Prueba de concepto de inferencia on-device: util para medir viabilidad de WebGPU en navegadores corporativos sin infraestructura GPU dedicada.
- Filtro de declinacion en dominios sensibles: el autor evalua explicitamente la negativa a responder sobre salario, clientes y telefono, patron reutilizable en asistentes con informacion confidencial.
- Material docente: ejemplo completo de evaluacion pre-registrada con umbrales definidos antes del entrenamiento y comparacion de variantes de cuantizacion (round-to-nearest, GPTQ, escalas MSE-optimas, QAT).

## Benchmarks y rendimiento

Evaluacion pre-registrada del autor, con decodificacion greedy y frases de test reservadas. Umbrales fijados antes del entrenamiento: al menos 85% de acierto en hechos, al menos 90% de declinaciones correctas y cero filtraciones en preguntas sensibles.

| Modelo | Hechos (53) | Declina desconocidos (20) | Sensibles (3) |
|---|---|---|---|
| Ajustado fp16 | 86,8% | 90% | 3/3 |
| 4 bits round-to-nearest | 73,6% | 85% | 3/3 |
| 4 bits GPTQ | 75,5% | 95% | 3/3 |
| 4 bits escalas MSE-optimas | 79,2% | 85% | 2/3 |
| 4 bits con QAT (publicado) | 88,7% | 80% | 3/3 |

El modelo publicado supera el umbral de hechos y el de sensibles, pero incumple el de declinacion (80% frente al 90% exigido). No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,3 GB de pesos en `q4f16_1`; el consumo real depende del buffer WebGPU y del contexto (1024 tokens), por lo que en la practica se situa en el rango de cientos de MB a 1 GB.
- No requiere GPU dedicada en servidor: se ejecuta en el navegador del cliente sobre WebGPU.
- Compatible con GPUs integradas y discretas que expongan WebGPU (Chrome/Edge recientes); el autor entreno en una NVIDIA L4, pero el despliegue es cliente.
- Opciones de despliegue: WebLLM 0.2.87 con la libreria precompilada `Qwen2-0.5B-Instruct-q4f16_1_cs1k-webgpu.wasm`; tambien puede servirse con MLC-LLM en servidor si se reconstruye el artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jainam-cv-qwen2.5-0.5b | 0,5B | 1024 (runtime) | LoRA + QAT, chatbot de CV en navegador | Apache 2.0 | Hugging Face, MLC/WebLLM |
| Qwen2.5-0.5B-Instruct | 0,5B | contexto nativo del base, no disponible en esta ficha | Asistente generalista | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | contexto nativo del base, no disponible en esta ficha | Asistente generalista de mayor capacidad | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct | 0,36B | contexto nativo no disponible en esta ficha | Asistente pequeno para edge | Apache 2.0 | Hugging Face |

La comparacion con alternativas genericas es limitada: este modelo esta especializado en un unico dominio y su rendimiento no es trasladable a tareas generales.

## Limitaciones y advertencias

- El propio autor declara que el modelo falla el umbral de declinacion: en 4 de 20 preguntas sin respuesta responde con un hecho cercano y verdadero en lugar de negarse (por ejemplo, da la ciudad de residencia ante una pregunta por el barrio).
- Los errores de hechos consisten en intercambiar un dato real del CV por otro (modelos de audio en lugar de vision, GPA de grado en lugar de master), no en inventar hechos nuevos segun la evaluacion del autor.
- El modelo base de 0,5B impone un techo claro de capacidad de razonamiento y generalizacion.
- El ajuste fino se realizo solo en ingles; el comportamiento en castellano u otros idiomas no esta evaluado.
- El contexto efectivo del runtime es de 1024 tokens, insuficiente para conversaciones largas o documentos extensos.
- La evaluacion de recuperacion no es completamente ciega: tras la primera ronda el autor anadio sinonimos de busqueda y el fallback de resumen, lo que el propio autor declara como limitacion metodologica.
- Uso comercial permitido por Apache 2.0, pero el modelo esta entrenado sobre datos personales de un individuo y no es reutilizable como asistente general sin reentrenamiento.
- Sin tool calling ni capacidades multimodales; no apto para pipelines de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jainamshahhh/jainam-cv-qwen2.5-0.5b-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Demo del chatbot: https://jainamshahhh.github.io
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
- WebLLM: https://github.com/mlc-ai/web-llm

# Hussnain1/interviewmate-flan-t5-large

## Resumen

InterviewMate FLAN-T5 Large es un ajuste fino completo de google/flan-t5-large, publicado por Muhammad Hussnain Jamil (usuario Hussnain1 en Hugging Face), orientado a la generacion de preguntas de entrevista tecnica a partir de contexto de candidato (habilidades, proyectos y experiencia). El modelo actua como generador de respaldo dentro del sistema InterviewMate: cuando el motor principal basado en un LoRA de Qwen2.5 no esta disponible o devuelve pocas preguntas validas, este T5 produce una pregunta individual por invocacion.

Se trata de un modelo encoder-decoder de la familia T5 con 783.150.080 parametros totales, derivado directamente de google/flan-t5-large, por lo que hereda su arquitectura transformer estandar y su ventana de contexto de 512 tokens. El ajuste se ha realizado sobre pares de generacion de preguntas conscientes de la respuesta procedentes de SQuAD y HotpotQA, complementados con pares de estilo entrevista construidos a partir de contextos tipo CV, generados y curados por el autor y no publicados.

Su relevancia es acotada y muy especifica: no compite como modelo generalista, sino que cubre una funcion concreta dentro de un pipeline de preparacion de entrevistas. La licencia Apache 2.0 y el formato safetensors facilitan su integracion, aunque el modelo solo soporta ingles y esta pensado exclusivamente para practica de entrevistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parametros totales | 783.150.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (formato de entrada documentado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune) de google/flan-t5-large, un transformer encoder-decoder con atencion completa y sin mecanismos de mezcla de expertos. No se documentan cambios arquitectonicos respecto al modelo base; la innovacion se limita al ajuste de los pesos sobre una tarea concreta de generacion de preguntas.

Los datos de entrenamiento combinan pares de generacion de preguntas conscientes de la respuesta (answer-aware question generation) extraidos de SQuAD y HotpotQA, junto con pares de estilo entrevista construidos a partir de contextos tipo CV. Estos ultimos fueron generados y curados por el autor y no se han publicado. El formato de entrada es `generate question: {answer} context: {context}` con un maximo de 512 tokens, y la generacion en produccion emplea busqueda por haz (beam search) con 4 haces. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto condicionada a una plantilla concreta (`generate question: ... context: ...`) para producir una unica pregunta de entrevista por invocacion.
- Generacion de preguntas conscientes de la respuesta, capacidad heredada del ajuste sobre SQuAD y HotpotQA.
- Adaptacion a contextos de tipo CV: habilidades, proyectos y experiencia del candidato.
- Generacion con decodificacion por haz (beam search de 4 haces) para mejorar la calidad de la pregunta.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- Multilingue: no, unicamente ingles.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio.

## Casos de uso

- Generacion de respaldo en sistemas de practica de entrevistas: cuando el motor principal (Qwen2.5 LoRA) falla o devuelve menos preguntas de las esperadas, este T5 genera una pregunta adicional a partir del contexto del candidato, garantizando continuidad en la sesion.
- Creacion de preguntas tecnicas a partir de proyectos del CV: dado un contexto como "el candidato construyo un backend FastAPI con RAG", el modelo produce una pregunta dirigida a ese proyecto, util para entrevistas tecnicas personalizadas.
- Generacion de preguntas a partir de respuestas: gracias al ajuste answer-aware sobre SQuAD y HotpotQA, puede formular preguntas sobre un fragmento de respuesta, lo que sirve para construir rondas de seguimiento.
- Prototipado rapido de pipelines de evaluacion: su tamano (783 M parametros) y su licencia Apache 2.0 permiten desplegarlo en entornos de desarrollo sin coste de licencia para validar flujos de generacion de preguntas.
- Generacion de preguntas para plataformas de simulacion de entrevistas en ingles: el modelo puede alimentar bancos de preguntas dinamicos a partir de descripciones de candidatos, con la limitacion de una pregunta por llamada.
- Integracion en herramientas de RR. HH. para cribado asistido: generar preguntas preliminares basadas en la experiencia declarada del candidato, siempre como apoyo y no como sustituto de la evaluacion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,1 GB solo para pesos, mas memoria para activaciones y cache; en torno a 4-5 GB en total.
- VRAM estimada en fp16/bf16: aproximadamente 1,6 GB para pesos, con un total practico de 2-3 GB.
- VRAM estimada en int8: alrededor de 0,8 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32; una RTX 3060, RTX 4060 o superior es suficiente. Para despliegues de mayor throughput, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (AutoModelForSeq2SeqLM), text-generation-inference (el modelo declara endpoints_compatible), y conversion a otros formatos no documentada por el autor.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 783 M parametros con generacion de 64 tokens nuevos y beam search de 4 haces, la latencia esperada es baja en GPU consumer, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InterviewMate FLAN-T5 Large | 783 M | 512 tokens | Generacion de preguntas de entrevista | Apache 2.0 | Hugging Face |
| google/flan-t5-large (base) | 783 M | 512 tokens | Generacion texto-a-texto general | Apache 2.0 | Hugging Face |
| InterviewMate Qwen2.5 1.5B LoRA | 1,5 B (aproximado, no confirmado en la informacion) | no disponible | Motor principal de preguntas de entrevista | no disponible | Hugging Face |
| T5-large | 737 M (aproximado) | 512 tokens | Generacion texto-a-texto general | Apache 2.0 | Hugging Face |

La comparacion con el modelo base es la mas directa: InterviewMate FLAN-T5 Large especializa flan-t5-large en generacion de preguntas de entrevista, a costa de perder generalidad y de limitarse al formato de entrada documentado. Frente al LoRA de Qwen2.5 del mismo proyecto, este T5 es un modelo secundario de menor tamano y sin capacidad de planificacion multi-pregunta.

## Limitaciones y advertencias

- Genera una sola pregunta por invocacion; el autor indica que el modelo Qwen LoRA es el planificador principal.
- Solo soporta ingles; no se ha entrenado ni validado para otros idiomas.
- Las preguntas pueden resultar genericas cuando el contexto del CV es escaso o poco detallado.
- El modelo esta declarado por el autor exclusivamente para practica de entrevistas; no debe usarse como evaluador automatico de candidatos.
- Riesgo de alucinacion: al ser un modelo generativo de 783 M parametros, puede producir preguntas que no se apoyen en el contexto proporcionado o que asuman detalles no presentes.
- No se documentan sesgos conocidos, pero al derivar de flan-t5-large hereda los sesgos de su corpus de entrenamiento original, no auditados en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se publica como artefacto de un proyecto personal.
- El dataset de pares de entrevista no esta publicado, lo que impide reproducir el entrenamiento o auditar su composicion.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hussnain1/interviewmate-flan-t5-large
- Modelo base: https://huggingface.co/google/flan-t5-large
- Modelo principal del proyecto (Qwen2.5 LoRA): https://huggingface.co/Hussnain1/interviewmate-qwen2.5-1.5b-lora
- Repositorio GitHub del proyecto: https://github.com/Hussnainoffical/InterviewMate
- Perfil de GitHub del autor: https://github.com/Hussnainoffical
- LinkedIn del autor: https://www.linkedin.com/in/hussnain-jamil
- Portfolio del autor: https://muhammad-hussnain-jamil-portfolio.vercel.app

# rachitgoyell/Prashna-7b

## Resumen

Prashna-7B es un modelo de tutoría socrática afinado a partir de Qwen2.5-7B-Instruct, desarrollado por rachitgoyell. Su propósito no es resolver problemas directamente, sino diagnosticar qué ha entendido mal el estudiante y formular preguntas guía que le conduzcan a la respuesta por sí mismo. El nombre procede del hindi "प्रश्न" (prashna), que significa "pregunta".

El modelo se construyó para Akara (Team Evolve AI), un pipeline que convierte capítulos de NCERT (currículo escolar indio) en vídeos explicativos y posteriormente verifica la comprensión mediante la técnica de Feynman: el estudiante explica el concepto con sus palabras y el tutor plantea una pregunta de seguimiento dirigida. Esto lo sitúa en un nicho concreto pero relevante: la alineación pedagógica de los LLM, un área donde los modelos de propósito general tienden a "regalar" la respuesta en lugar de enseñar.

Técnicamente es un transformer denso de unos 7,6 mil millones de parámetros basado en la arquitectura Qwen2, con licencia Apache 2.0 heredada del modelo base y pesos en safetensors. Es un modelo monolingüe en inglés, de descarga y despliegue sencillos, y cabe en GPU de consumo con cuantización de 4 bits.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parámetros totales | 7.615.616.512 (~7,6B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base Qwen2.5-7B-Instruct, 32.768 tokens según la documentación de Qwen, no confirmada en la model card) |
| Tipos de cuantización | bfloat16 nativo; 4 bits NF4 vía BitsAndBytes (documentado en la model card) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 15,2 GB) |

## Arquitectura y entrenamiento

Prashna-7B es un ajuste fino (fine-tune) de Qwen2.5-7B-Instruct, un transformer decoder-only denso de la familia Qwen2. No es un modelo MoE: todos los parámetros están activos en cada pasada. La model card no detalla el método de entrenamiento empleado (LoRA, QLoRA o full fine-tuning), ni el número de tokens, ni la composición exacta del dataset.

El dominio de entrenamiento está orientado a contenidos educativos, con especial vinculación a los capítulos de NCERT utilizados en el pipeline Akara. La model card incluye una referencia al paper "From Problem-Solving to Teaching Problem-Solving: Aligning LLMs with Pedagogy using Reinforcement Learning" (arXiv:2505.15607, aceptado en EMNLP 2025), aunque advierte que solo debe citarse si el entrenamiento siguió realmente ese método, por lo que no puede confirmarse si se usó RL para la alineación pedagógica. Tampoco se especifica si hubo RLHF o DPO.

El comportamiento objetivo del modelo se define en el prompt de sistema: comparar la explicación del estudiante con un pasaje de referencia, identificar la concepción errónea clave y formular exactamente una pregunta guía por turno, sin revelar nunca la respuesta final.

## Capacidades

- Generación de preguntas socráticas de seguimiento tras la explicación de un concepto por parte del estudiante.
- Diagnóstico de errores conceptuales comparando la explicación del alumno con un pasaje de referencia proporcionado en el prompt de sistema.
- Andamiaje progresivo (scaffolding): pistas que se vuelven más específicas turno a turno si se le pasa el historial completo de la conversación.
- Generación de texto conversacional general, heredada del modelo base Qwen2.5-7B-Instruct.
- Uso con la plantilla de chat estándar de Qwen2.5 (apply_chat_template), con soporte de roles system/user.
- Ejecución eficiente en GPU de consumo mediante cuantización NF4 de 4 bits con BitsAndBytes.
- No está diseñado para dar respuestas directas ni soluciones: está alineado deliberadamente para retenerlas.
- No hay evidencia en la model card de soporte de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Verificación de comprensión con técnica de Feynman: tras ver un vídeo explicativo, el estudiante explica el concepto y el modelo compara su explicación con el guion de referencia para detectar la laguna concreta y preguntar en consecuencia. Es el caso de uso para el que fue creado dentro de Akara.
- Tutores socráticos integrados en plataformas educativas: el modelo sostiene conversaciones multi-turno donde cada turno contiene una única pregunta guía, ideal para interfaces de chat educativas que requieren que el alumno razone por sí mismo.
- Diagnóstico de errores conceptuales en ciencias: ante una explicación como "los objetos pesados caen más rápido", el modelo identifica la concepción errónea (confusión entre fuerza y aceleración) y formula una pregunta que la desmonta.
- Sistemas de repaso adaptativo: pasando el historial completo de la conversación, el tutor endurece progresivamente las pistas, lo que permite construir flujos de repaso que escalan la dificultad según el rendimiento del alumno.
- Investigación en alineación pedagógica: el modelo sirve como base experimental para estudiar la fuga de respuestas (answer leakage) en tutores basados en LLM, un problema documentado cuando los estudiantes insisten en obtener la solución.
- Generación de contenido educativo complementario: a partir de un pasaje de referencia (guion de vídeo, apunte o capítulo), el modelo puede producir baterías de preguntas guía para materiales didácticos, con supervisión humana posterior.
- Apoyo en aulas con supervisión docente: el profesor puede usarlo como asistente para preparar preguntas de seguimiento personalizadas según las explicaciones escritas de los alumnos, sin sustituir la evaluación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, GSM8K, HumanEval ni evaluaciones pedagógicas cuantitativas (por ejemplo, tasa de fuga de respuestas o precisión de diagnóstico de errores conceptuales).

## Requisitos de hardware

- VRAM estimada en precisión completa (bfloat16): aproximadamente 15-16 GB solo para los pesos, más la memoria de KV cache; en la práctica, una GPU de 24 GB (RTX 3090, RTX 4090) es cómoda.
- VRAM estimada con cuantización NF4 de 4 bits: en torno a 5-6 GB para los pesos, más overhead de cuantización y KV cache; viable en GPUs de 8 GB para contextos moderados.
- GPU recomendadas: RTX 3090 o RTX 4090 para inferencia en bf16; RTX 3060 de 12 GB o superior para 4 bits con holgura. En entorno servidor, cualquier GPU con ≥16 GB (A10G, L4, A100) es más que suficiente.
- Cabe en GPU de consumo: sí, tanto en 24 GB con bf16 como en 8-12 GB con cuantización de 4 bits documentada en la model card.
- Opciones de despliegue: transformers con accelerate y device_map="auto" (método documentado por el autor); al estar basado en Qwen2 y usar safetensors, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF, no publicada en el repositorio) y Ollama (previa creación del modelo), aunque estas rutas no están documentadas explícitamente en la model card.
- Latencia y throughput estimados: no disponible. Al ser un modelo denso de 7,6B, puede esperarse un rendimiento típico de esta clase en GPUs de consumo (del orden de decenas de tokens por segundo en RTX 4090), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Base | Enfoque | Contexto | Licencia |
|---|---|---|---|---|---|
| Prashna-7B | ~7,6B | Qwen2.5-7B-Instruct | Tutoría socrática, diagnóstico de errores conceptuales | no disponible (hereda de Qwen2.5) | Apache 2.0 |
| Qwen2.5-7B-Instruct | ~7,6B | Qwen2.5 | Asistente general multiusos | 32.768 tokens | Apache 2.0 |
| Llama-3.1-8B-Instruct | ~8B | Llama 3.1 | Asistente general multiusos | 128.000 tokens | Llama 3.1 Community License |
| Mistral-7B-Instruct v0.3 | ~7,2B | Mistral 7B | Asistente general multiusos | 32.768 tokens | Apache 2.0 |

La diferencia clave es el enfoque: Prashna-7B está especializado en pedagogía socrática y no está pensado para competir con los modelos generales en benchmarks amplios, sino para un comportamiento específico (no revelar la respuesta, una pregunta por turno). Frente a su modelo base, sacrifica la versatilidad general a cambio de una alineación con objetivos educativos. No hay benchmarks publicados que permitan comparar rendimiento numérico.

## Limitaciones y advertencias

- Fuga de respuestas (answer leakage): aunque está alineado para retener la solución, la propia model card reconoce que puede revelar respuestas cuando el estudiante insiste, un problema conocido en tutores basados en LLM. No debe asumirse que el comportamiento socrático es robusto bajo presión.
- Alucinación: sin un pasaje de referencia en el prompt de sistema, el modelo puede producir hechos incorrectos o formular preguntas basadas en premisas erróneas. Debe usarse siempre con grounding.
- Cobertura de dominio limitada: el comportamiento fuera de las materias presentes en los datos de entrenamiento (orientados al currículo NCERT) no ha sido probado.
- Sensibilidad a entrada ruidosa: errores de reconocimiento de voz en transcripciones pueden provocar diagnósticos equivocados, algo relevante si se integra en flujos con audio.
- Monolingüe: está pensado para inglés; su rendimiento en castellano u otros idiomas no está documentado y no debe asumirse.
- No sustituye a un profesor: la model card exige supervisión humana (docente o parental) y lo excluye explícitamente de decisiones de alto impacto como calificaciones o pruebas de nivel.
- Sin benchmarks publicados: no hay forma de verificar objetivamente su calidad pedagógica antes de desplegarlo; se recomienda evaluación propia en el dominio de destino.
- Proyecto de autor individual con adopción muy reducida (348 descargas, 0 likes en el momento de la ficha), sin mantenimiento comunitario demostrado; conviene evaluar el riesgo de abandono antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rachitgoyell/Prashna-7b
- Modelo base (Qwen2.5-7B-Instruct): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper referenciado en la model card (alineación pedagógica con RL): https://arxiv.org/abs/2505.15607
- Repositorio de código, demos o despliegues propios: no disponible

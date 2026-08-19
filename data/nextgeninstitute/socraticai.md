# NextGenInstitute/socraticAI

## Resumen

El modelo `NextGenInstitute/socraticAI` es un proyecto de investigación orientado a la pedagogía Socrática aplicada a la educación en informática. Desarrollado por NextGenInstitute, forma parte de un artículo académico presentado en EAAI (Educational Advances in Artificial Intelligence) titulado *Aligning Open Language Models for Socratic AI Pedagogy via Preference Optimization*. Su objetivo es transformar modelos de lenguaje abiertos en tutores que guíen a los estudiantes mediante preguntas y reflexión, en lugar de proporcionar respuestas directas.

El repositorio incluye dos modelos derivados: `Socratic Muse-30B` y `Socratic Llama-8B`, ambos ajustados con SFT y DPO sobre un dataset de preferencias de 1.680 ejemplos. Sin embargo, la ficha técnica del modelo `socraticAI` en sí no especifica arquitectura, número de parámetros, contexto ni otros detalles técnicos. La información disponible se centra en el sistema pedagógico y los resultados de evaluación en escenarios de depuración de IA, no en las características internas del modelo.

A pesar de la falta de especificaciones técnicas, el proyecto es relevante por su enfoque en el uso responsable de la IA en educación, proponiendo restricciones estructuradas y diálogo Socrático en lugar de prohibiciones absolutas. Esto lo posiciona como una alternativa interesante para instituciones educativas que buscan integrar LLMs de forma controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura del modelo `socraticAI` (si es transformer, MoE, etc.) ni sobre el proceso de entrenamiento. Los tags de la model card indican que se utilizaron técnicas de *supervised fine-tuning* (SFT) y *direct preference optimization* (DPO), lo que sugiere un ajuste sobre un modelo base preexistente, pero no se especifica cuál. El dataset de preferencias contiene 1.680 ejemplos, probablemente diseñados para enseñar al modelo a responder de forma Socrática (haciendo preguntas, fomentando la reflexión) en lugar de dar soluciones directas.

Dado que los modelos derivados se llaman "Socratic Muse-30B" y "Socratic Llama-8B", es plausible que el modelo base sea uno de estos tamaños, pero no se confirma en la documentación. Tampoco hay datos sobre el número de tokens de entrenamiento, composición del dataset o detalles de las fases de alineación.

## Capacidades

- **Tutoría Socrática**: el modelo está diseñado para guiar a estudiantes mediante preguntas y andamiaje, evitando respuestas directas.
- **Reflexión guiada**: fomenta que el estudiante razone y descubra soluciones por sí mismo.
- **Soporte en escenarios de depuración de IA**: los benchmarks evalúan su capacidad para ayudar en tareas de debugging sin filtrar la solución.
- **Uso en entornos educativos**: integrable en sistemas de tutoría inteligente con restricciones de uso diario y formato de preguntas.
- **Multilingüismo**: no disponible.
- **Tool calling / agentes**: no disponible.

## Casos de uso

- **Tutoría en cursos de programación**: el modelo puede plantear preguntas guiadas cuando un estudiante se atasca en un ejercicio de código, ayudándole a identificar errores por sí mismo.
- **Acompañamiento en depuración de código**: en lugar de dar el error exacto, el modelo formula preguntas como "¿qué esperabas que ocurriera en esta línea?" para que el alumno analice su lógica.
- **Práctica de pensamiento crítico**: en asignaturas de informática teórica, el modelo puede plantear dilemas y pedir justificaciones, promoviendo la argumentación.
- **Evaluación formativa**: los profesores pueden usarlo para generar preguntas de reflexión sobre conceptos vistos en clase, con límites diarios de uso.
- **Sistema de apoyo en laboratorios**: integrado en plataformas de gestión de aprendizaje, ofrece ayuda estructurada sin reemplazar al docente.
- **Investigación en pedagogía con IA**: sirve como banco de pruebas para estudiar el impacto de la tutoría Socrática en el rendimiento estudiantil.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación sobre 150 escenarios de depuración de IA, pero corresponde a los modelos derivados (`Socratic Muse-30B` y `Socratic Llama-8B`), no al modelo `socraticAI` en sí. Se reproduce a continuación como referencia:

| Modelo | Fuga directa % (↓) | Utilidad pedagógica (1-5) (↑) | Precisión conceptual % (↑) |
| :--- | :---: | :---: | :---: |
| Gemini 3.5 Flash | 0.0% | 4.79 / 5.0 | 98.7% |
| GPT-5.4-mini | 0.0% | 4.67 / 5.0 | 98.7% |
| Socratic Muse-30B (SFT+DPO) | 0.0% | 4.75 / 5.0 | 90.0% |
| Socratic Llama-8B (SFT+DPO) | 0.0% | 3.54 / 5.0 | 76.0% |
| Base Llama-3.1-8B-Instruct | 1.3% | 2.55 / 5.0 | 20.0% |
| Qwen2.5-Coder-7B-Instruct | 6.0% | 2.37 / 5.0 | 20.0% |

No se han publicado resultados de benchmarks específicos para el modelo `socraticAI` en la información disponible.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware para este modelo. Dado que no se especifica el tamaño, no es posible estimar VRAM, GPUs recomendadas ni opciones de despliegue. Los modelos derivados (30B y 8B) sugieren que podría necesitar desde GPUs de consumo (para 8B) hasta GPUs profesionales (para 30B), pero esto es especulativo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. La tabla de benchmarks anterior compara los modelos derivados con alternativas comerciales y de código abierto, pero no aplica directamente al modelo `socraticAI`.

## Limitaciones y advertencias

- **Falta de documentación técnica**: no se conocen la arquitectura, el tamaño ni el contexto, lo que dificulta su evaluación para uso en producción.
- **Enfoque limitado**: está diseñado específicamente para pedagogía Socrática en informática; su rendimiento en otras tareas generales no está documentado.
- **Dependencia del dataset de preferencias**: la calidad del comportamiento Socrático depende de los 1.680 ejemplos utilizados, que pueden no cubrir todos los escenarios educativos.
- **Idiomas**: no se especifican los idiomas soportados; probablemente solo inglés (dado el paper), pero no confirmado.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero al no haber información sobre el modelo base, podrían existir restricciones adicionales si el base tiene otra licencia.
- **Riesgo de alucinación**: al ser un modelo de lenguaje, puede generar preguntas o razonamientos incorrectos, lo que en un contexto educativo podría confundir a los estudiantes.

## Enlaces

- [HuggingFace: NextGenInstitute/socraticAI](https://huggingface.co/NextGenInstitute/socraticAI)
- [Paper en arXiv: SocraticAI: Transforming LLMs into Guided CS Tutors Through Scaffolded ...](https://arxiv.org/html/2512.03501v1)
- [arXiv abstract](https://arxiv.org/abs/2512.03501v1)
- [GitHub: SuccessMoses/SocraticAI](https://github.com/SuccessMoses/SocraticAI)
- [SocraticAI Paradigm en EmergentMind](https://www.emergentmind.com/topics/socraticai-paradigm)
- [Socratic AI: The Socratic Approach to AI for Human Creativity](https://socraticai.co/)

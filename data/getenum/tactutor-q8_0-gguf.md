# getenum/TACTutor-Q8_0-GGUF

## Resumen

TACTutor-Q8_0-GGUF es una cuantización en formato GGUF del modelo TACTutor, desarrollado originalmente por el colectivo Taxonomy-Aligned-Conversational-Tutor y convertido por el usuario getenum mediante el espacio GGUF-my-repo de ggml.ai sobre llama.cpp. Se trata de un modelo de generación de texto orientado a la tutorización educativa y a la enseñanza del inglés como segunda lengua (ESL), afinado mediante SFT y GRPO sobre una base de aproximadamente 4.330 millones de parámetros.

El modelo resuelve el problema de disponer de un tutor conversacional ligero y desplegable en entornos con recursos limitados: al estar cuantizado a Q8_0, puede ejecutarse con llama.cpp en hardware de consumo, algo relevante para instituciones educativas, plataformas de aprendizaje o desarrolladores que necesitan un asistente pedagógico local sin depender de APIs externas. Su licencia Apache 2.0 facilita la integración comercial.

La relevancia actual del modelo radica en su especialización: frente a asistentes generalistas, TACTutor está afinado para mantener conversaciones pedagógicas alineadas con una taxonomía educativa, lo que lo hace útil en escenarios de tutoría estructurada. No obstante, la información pública disponible es escasa: la model card del repositorio cuantizado es una plantilla automática de conversión y no aporta detalles sobre arquitectura, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle específico no disponible) |
| Parametros totales | 4.326.350.848 (~4,33 mil millones) |
| Parametros activos | No aplica (no es MoE, según la información disponible) |
| Longitud de contexto | No disponible (el ejemplo de la model card usa `-c 2048`) |
| Tipos de cuantizacion | Q8_0 (esta variante); otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de tratarse de un transformer de aproximadamente 4.330 millones de parámetros. Los tags del repositorio indican que el modelo base fue entrenado con SFT (supervised fine-tuning) y GRPO (Group Relative Policy Optimization), una técnica de optimización de políticas basada en refuerzo, lo que sugiere un pipeline de alineación en dos fases: primero ajuste supervisado sobre conversaciones de tutoría y después optimización con recompensas.

El nombre del modelo base, Taxonomy-Aligned-Conversational-Tutor, apunta a que el entrenamiento está alineado con una taxonomía de objetivos pedagógicos o de competencias lingüísticas, aunque no se especifica la composición del dataset, el número de tokens de entrenamiento ni los detalles del proceso de recompensa. Esta variante concreta es una conversión a GGUF Q8_0 realizada con llama.cpp; no introduce cambios en los pesos más allá de la cuantización.

## Capacidades

- Generación de texto conversacional en inglés orientada a tutoría educativa.
- Tutorización de inglés como segunda lengua (ESL) según los tags del repositorio.
- Diálogo multi-turno con fines pedagógicos (SFT sobre conversaciones de tutoría).
- Alineación con objetivos educativos mediante GRPO, orientada a respuestas más útiles en contexto de aprendizaje.
- Ejecución local mediante llama.cpp (CLI y servidor).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible; el pipeline es text-generation.
- Multilingüismo: limitado al inglés según el campo `language`.

## Casos de uso

- Tutoría de inglés como segunda lengua: el modelo puede mantener conversaciones de práctica con estudiantes, corrigiendo y guiando según la taxonomía pedagógica con la que fue entrenado, en inglés y en sesiones multi-turno.
- Asistente educativo local en aulas con hardware modesto: al ser una cuantización Q8_0 de un modelo de ~4,3B, puede desplegarse en un servidor pequeño o en un equipo de aula mediante llama.cpp, sin conexión a internet.
- Plataformas de aprendizaje autoalojadas: integración como backend de texto en aplicaciones de e-learning que requieran privacidad de datos y no puedan enviar conversaciones a APIs externas.
- Prototipado rápido de chatbots pedagógicos: el formato GGUF y el servidor de llama.cpp permiten levantar un endpoint compatible en minutos para validar flujos de tutoría.
- Investigación en diálogo educativo: modelo de referencia ligero para experimentos de evaluación de conversaciones de tutoría y comparación de estrategias pedagógicas.
- Generación de material de práctica de inglés: creación de ejercicios, preguntas y diálogos guiados para cursos de ESL a partir de prompts estructurados.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite incorporar el modelo en productos comerciales de formación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8_0: aproximadamente 4,6 GB solo para los pesos (tamaño del repositorio), más overhead de contexto y runtime; en la práctica, entre 5 y 6 GB para contextos moderados.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4070 o superiores; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM; también puede ejecutarse en CPU con llama.cpp, aunque con menor throughput.
- Opciones de despliegue: llama.cpp (CLI y servidor), y cualquier runtime compatible con GGUF; vLLM y TGI no están confirmados para este formato en la información disponible.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del contexto configurado (el ejemplo de la model card usa `-c 2048`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TACTutor-Q8_0-GGUF | ~4,33B | No disponible | Apache 2.0 | GGUF | Especializado en tutoría ESL |
| Modelos generalistas de ~3-4B (p. ej. Llama 3.2 3B, Qwen2.5 3B) | ~3-4B | 8K-128K según modelo | Licencias propias | GGUF, safetensors | No especializados en educación; datos de benchmarks no comparables en esta ficha |
| Modelos de tutoría de mayor tamaño | No disponible | No disponible | No disponible | No disponible | No se dispone de alternativas documentadas en la información proporcionada |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se han publicado benchmarks de TACTutor ni se dispone de información sobre modelos de tutoría comparables en la búsqueda realizada.

## Limitaciones y advertencias

- Solo soporta inglés; no está entrenado para castellano ni otros idiomas según el campo `language`.
- La model card del repositorio es una plantilla automática de conversión y no documenta sesgos, datos de entrenamiento ni evaluación.
- Riesgo de alucinación inherente a modelos de ~4B; en contexto educativo puede generar explicaciones incorrectas, por lo que requiere supervisión humana.
- La cuantización Q8_0 introduce una pérdida mínima pero no nula respecto a los pesos originales en safetensors.
- Longitud de contexto no documentada; el ejemplo de la model card usa 2048 tokens, lo que limita conversaciones muy largas si no se configura un valor mayor.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar la licencia y condiciones del modelo base original antes de desplegarlo en producción.
- Sin datos de benchmarks ni evaluaciones independientes, no es posible garantizar su calidad pedagógica frente a alternativas.
- El modelo está especializado en tutoría; su rendimiento en tareas generales de código, matemáticas o razonamiento complejo no está documentado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/getenum/TACTutor-Q8_0-GGUF
- Modelo base: https://huggingface.co/Taxonomy-Aligned-Conversational-Tutor/TACTutor
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp

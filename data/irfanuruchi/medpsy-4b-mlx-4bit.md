# Irfanuruchi/MedPsy-4B-MLX-4bit

## Resumen

MedPsy-4B-MLX-4bit es una conversión en formato MLX con cuantización de 4 bits del modelo MedPsy-4B, desarrollado por QVAC (Tether Data). El modelo original es un sistema de razonamiento médico y clínico construido sobre Qwen3-4B-Thinking-2507, entrenado mediante supervisión fina (SFT) y aprendizaje por refuerzo (RL). Esta versión MLX está optimizada para inferencia local en Apple Silicon, reduciendo el peso a aproximadamente 2,1 GB y manteniendo una velocidad de generación de 47 tokens por segundo en un MacBook Pro M3 Pro.

El modelo conserva las capacidades de razonamiento clínico del modelo base, incluyendo la emisión de un bloque de pensamiento (`thinking... response`) antes de la respuesta final. Está destinado a aplicaciones de investigación y educación en el ámbito médico y sanitario, aunque no sustituye el juicio profesional. La licencia es Apache 2.0, lo que permite su uso y redistribución bajo condiciones de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-4B-Thinking-2507 (transformer, decoder-only) |
| Parametros totales | 628.676.096 (según safetensors del repositorio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (según documentación de llmrun) |
| Tipos de cuantizacion | 4-bit (afín, group size 64) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base MedPsy-4B se construye sobre Qwen3-4B-Thinking-2507, una arquitectura transformer decoder-only con atención causal y capacidad de razonamiento explícito. QVAC lo post-entrenó mediante una combinación de supervisión fina y aprendizaje por refuerzo para mejorar el razonamiento clínico en dominios médicos. La conversión MLX utiliza cuantización afín de 4 bits con grupo de tamaño 64, lo que reduce el tamaño del modelo a 2,1 GB sin degradar significativamente la calidad de generación. No se dispone de información sobre el número de tokens de entrenamiento ni la composición exacta del dataset en la documentación proporcionada.

## Capacidades

- Generación de texto médico y clínico: responde preguntas sobre anatomía, fisiología, farmacología y diagnóstico diferencial.
- Razonamiento clínico: produce secciones de razonamiento antes de la respuesta final, similar a modelos tipo "thinking".
- Conversación multi-turno: mantiene el contexto en diálogos médicos gracias a la ventana de contexto de 262.144 tokens.
- Soporte de tool calling: no se ha confirmado en la información disponible, pero el modelo base Qwen3 soporta esta funcionalidad.
- Capacidad multilingüe limitada: la documentación indica solo inglés, aunque el modelo base puede generalizar a otros idiomas con menor calidad.
- Formato de chat: compatible con plantillas de chat de Qwen3 para aplicaciones de asistente virtual.

## Casos de uso

- Educación médica interactiva: el modelo puede explicar conceptos como sensibilidad y especificidad, o simular casos clínicos para estudiantes de medicina.
- Asistencia en documentación clínica: genera resúmenes de historias clínicas o redacta informes preliminares a partir de notas del médico.
- Consultas de pacientes en entornos controlados: responde preguntas frecuentes sobre síntomas, medicamentos y precauciones, siempre con supervisión profesional.
- Entrenamiento de profesionales de la salud: simula entrevistas clínicas y razonamiento diagnóstico para prácticas de comunicación.
- Investigación bibliográfica asistida: extrae y sintetiza información de artículos médicos en lenguaje natural.
- Chatbot educativo en plataformas e-learning: integrado en cursos de medicina para responder dudas de los estudiantes en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los datos de rendimiento locales (47,054 tokens/s, 2,468 GB de memoria pico) provienen de una única ejecución de validación en un Apple M3 Pro y no constituyen una evaluación exhaustiva. El autor indica que los benchmarks del modelo original pertenecen a QVAC y no fueron reproducidos para esta conversión cuantizada.

## Requisitos de hardware

- VRAM estimada: 2,468 GB de memoria unificada en Apple Silicon (según la validación local).
- GPU recomendadas: cualquier Apple Silicon con al menos 4 GB de memoria unificada; se probó en M3 Pro con 18 GB.
- Compatibilidad con GPU consumer: no se ejecuta en GPU NVIDIA/AMD; es exclusivo para Apple Silicon mediante MLX.
- Opciones de despliegue: mlx-lm (Python y CLI), MLX Studio, o cualquier framework que soporte MLX.
- Latencia y throughput: generación a 47 tokens/s en M3 Pro, con procesamiento de prompt a 53,4 tokens/s.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos médicos de tamaño similar en la información proporcionada. El modelo base MedPsy-4B (4,4B parámetros) podría compararse con modelos como BioMistral o Meditron, pero no se han incluido resultados de benchmarks en esta ficha.

## Limitaciones y advertencias

- No es un dispositivo médico ni sustituye el juicio profesional; puede producir respuestas incorrectas, incompletas o engañosas que parecen autorizadas.
- Riesgo de alucinación en dominios médicos complejos, especialmente en diagnósticos raros o casos atípicos.
- El modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas es inferior.
- La cuantización de 4 bits puede degradar ligeramente la precisión en tareas de razonamiento complejo.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar el archivo `ATTRIBUTIONS.md` incluido en el repositorio para cumplir con los requisitos de atribución.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Irfanuruchi/MedPsy-4B-MLX-4bit
- Modelo base: https://huggingface.co/qvac/MedPsy-4B
- Blog de investigación de QVAC: https://huggingface.co/blog/qvac/medpsy
- Documentación de hardware de llmrun: https://llmrun.dev/model/qvac-medpsy-4b

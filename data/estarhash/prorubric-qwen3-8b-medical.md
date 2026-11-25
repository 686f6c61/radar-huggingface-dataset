# EstarHash/ProRubric-Qwen3-8B-Medical

## Resumen

ProRubric-Qwen3-8B-Medical es un checkpoint de ajuste fino por refuerzo (RL) sobre el modelo base Qwen/Qwen3-8B, desarrollado por EstarHash en el marco del método ProRubric descrito en el artículo "Scoring Higher, Answering Worse: Mitigating Reward Hacking in Rubric-Based RL via Protocol-Level Rubrics" (arXiv:2609.38847). El modelo aborda un problema concreto del alineamiento con rúbricas: el *reward hacking*, por el cual un modelo aprende a maximizar la puntuación de una rúbrica sin mejorar la calidad real de sus respuestas. ProRubric introduce dimensiones de rúbrica conjuntivas a nivel de protocolo con cláusulas de fallo explícitas para corregir este comportamiento.

Se trata de un transformer denso de 8.190.735.360 parámetros (8B), derivado directamente de Qwen3-8B, entrenado con PPO/GRPO mediante la librería `verl` v0.8.0 (semilla 42, paso de RL 300) y especializado en el dominio médico. Su relevancia actual radica en que permite reproducir y evaluar empíricamente una técnica de alineamiento orientada a reducir la brecha entre la puntuación de rúbrica y la calidad efectiva de las respuestas, un fenómeno poco documentado en modelos de instrucción convencionales.

El checkpoint se publica estrictamente para investigación académica y reproducibilidad, con licencia Apache 2.0, y el propio autor advierte explícitamente que no está destinado a diagnóstico clínico, consejo médico ni atención real a pacientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B, valor no confirmado) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de 8B parámetros, y se ajusta mediante aprendizaje por refuerzo con PPO/GRPO sobre la infraestructura `verl` v0.8.0. El entrenamiento emplea el método ProRubric, que estructura las recompensas como dimensiones de rúbrica conjuntivas a nivel de protocolo, incorporando cláusulas de fallo explícitas. El objetivo es penalizar respuestas que satisfacen superficialmente los criterios de la rúbrica sin cumplir el protocolo subyacente, mitigando así el *reward hacking* documentado en el artículo de referencia.

El checkpoint corresponde a la semilla 42 y al paso de RL 300, en el dominio médico. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de preferencias ni la existencia de fases adicionales de SFT o DPO más allá del pipeline RL descrito. Tampoco se detallan innovaciones de inferencia como decodificación especulativa o atención lineal; el interés técnico del modelo reside en el protocolo de recompensa, no en cambios arquitectónicos.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3-8B.
- Respuestas en dominio médico orientadas a protocolos y rúbricas de calidad, fruto del ajuste RL específico.
- Alineamiento con criterios de evaluación estructurados (dimensiones conjuntivas con cláusulas de fallo).
- Soporte de tool calling / function calling: no confirmado en la información proporcionada (el modelo base Qwen3 lo soporta, pero no se verifica en este checkpoint).
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: no disponibles (los idiomas no se especifican en la model card).
- Modo *thinking*: no confirmado en la información proporcionada.

## Casos de uso

- Investigación sobre reward hacking: el modelo sirve como artefacto de reproducibilidad para comparar el comportamiento de ProRubric frente a RL con rúbricas convencionales, usando la semilla 42 y el paso 300 como referencia experimental.
- Evaluación de protocolos de recompensa: permite analizar si las cláusulas de fallo explícitas reducen la divergencia entre puntuación de rúbrica y calidad real de las respuestas en tareas médicas.
- Generación de respuestas médicas estructuradas para anotación: útil en entornos de investigación para producir borradores que luego revisa un experto humano, nunca para uso clínico directo.
- Estudio de alineamiento en dominios de alto riesgo: caso de análisis sobre cómo se comporta un modelo ajustado con RL cuando el dominio exige precisión factual y protocolos estrictos.
- Benchmarking de métodos RL: comparación de PPO/GRPO con `verl` frente a otras técnicas de alineamiento sobre la misma base Qwen3-8B.
- Docencia y formación: ejemplo práctico de pipeline de RL con rúbricas para cursos de alineamiento y evaluación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4-5 GB (estimaciones teóricas a partir del número de parámetros; no confirmadas por el autor).
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, ajustada para contextos cortos).
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con BF16 y contexto limitado, o en GPUs de 12-16 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: al ser pesos safetensors con arquitectura Qwen3, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión); no se documenta soporte oficial específico.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProRubric-Qwen3-8B-Medical | 8,19B | no disponible | RL con rubricas de protocolo (dominio medico) | apache-2.0 | Hugging Face (29 descargas) |
| Qwen/Qwen3-8B | 8B | no disponible en esta ficha | Modelo base de instruccion/razonamiento | apache-2.0 | Hugging Face (ampliamente disponible) |
| Alternativas RL sobre Qwen3-8B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros checkpoints RL de la misma base no está documentada en la información proporcionada; el propio artículo de referencia (arXiv:2609.38847) sería la fuente adecuada para contrastar resultados, pero sus cifras no se incluyen aquí.

## Limitaciones y advertencias

- El autor declara el modelo estrictamente para investigación académica y reproducibilidad; no debe usarse para diagnóstico clínico, consejo médico ni atención a pacientes.
- Riesgo de alucinación inherente a un modelo de 8B en dominio médico; el ajuste RL con rúbricas no garantiza corrección factual.
- El objetivo del método es mitigar el reward hacking, pero no se aportan métricas en la información disponible que cuantifiquen cuánto se reduce en la práctica.
- Idiomas soportados no especificados; no se puede garantizar un rendimiento multilingüe homogéneo.
- Longitud de contexto no confirmada para este checkpoint; conviene verificar en la config del repositorio antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial según los términos de la licencia, pero la advertencia del autor restringe el uso a investigación; en producción sanitaria habría que evaluar requisitos regulatorios adicionales.
- Modelo con muy baja adopción (29 descargas, 0 likes) y sin validación comunitaria; tratar como artefacto experimental.
- No se documentan sesgos específicos ni evaluaciones de seguridad; se heredan los sesgos del corpus de entrenamiento de Qwen3-8B y del dataset RL médico.

## Enlaces

- Hugging Face: https://huggingface.co/EstarHash/ProRubric-Qwen3-8B-Medical
- Paper: https://arxiv.org/abs/2609.38847
- Código: https://github.com/Estrellajer/ProRubric
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B

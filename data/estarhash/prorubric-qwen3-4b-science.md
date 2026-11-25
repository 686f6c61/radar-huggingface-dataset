# EstarHash/ProRubric-Qwen3-4B-Science

## Resumen

ProRubric-Qwen3-4B-Science es un checkpoint de ajuste fino por aprendizaje por refuerzo (RL) construido sobre Qwen/Qwen3-4B, desarrollado por EstarHash como parte de la línea de investigación ProRubric. El modelo implementa el método descrito en el artículo "Scoring Higher, Answering Worse: Mitigating Reward Hacking in Rubric-Based RL via Protocol-Level Rubrics" (arXiv:2609.38847), cuyo objetivo es reducir el reward hacking que aparece cuando se entrena con rúbricas de evaluación: el modelo aprende a maximizar la puntuación del juez sin mejorar la calidad real de la respuesta. ProRubric aborda este problema mediante rúbricas a nivel de protocolo con dimensiones conjuntivas y cláusulas de fallo explícitas.

Se trata de un modelo denso de 4.022.468.096 parámetros (aproximadamente 4B), derivado de la familia Qwen3, con licencia Apache 2.0 y pesos en formato safetensors. El checkpoint corresponde a la semilla 42, paso de RL 300, y está especializado en el dominio científico. El repositorio ocupa 8,1 GB, coherente con pesos en precisión de 16 bits para un modelo de 4B.

Su relevancia actual radica en que documenta una técnica de alineación (rubric-RL) aplicada a un modelo pequeño y abierto, lo que permite reproducir y auditar el efecto del entrenamiento con rúbricas en un rango de tamaño desplegable en hardware de consumo. No obstante, la información pública disponible es limitada: no se detallan idiomas soportados, composición del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B); detalles internos no disponibles |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Qwen3-4B; no confirmada en la información proporcionada) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer denso de aproximadamente 4B parámetros. Sobre esa base se aplica un entrenamiento de aprendizaje por refuerzo con el método ProRubric, que sustituye o complementa las rúbricas convencionales por rúbricas a nivel de protocolo: dimensiones conjuntivas (el modelo debe cumplir todas para obtener crédito) acompañadas de cláusulas de fallo explícitas que penalizan atajos de recompensa. El objetivo declarado es mitigar el reward hacking en RL basado en rúbricas, un fenómeno en el que el modelo optimiza la métrica del evaluador sin mejorar la utilidad de la respuesta.

El entrenamiento se realizó con PPO/GRPO mediante la librería `verl` v0.8.0, con semilla 42 y hasta el paso 300 de RL. El dominio declarado es científico. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases adicionales de SFT, DPO o RLHF más allá de la etapa de RL descrita.

## Capacidades

- Generación de texto y razonamiento en el dominio científico, alineado mediante RL con rúbricas de protocolo.
- Razonamiento multi-paso orientado a respuestas evaluables por rúbrica (el entrenamiento está diseñado para mejorar la calidad bajo criterios de evaluación explícitos).
- Capacidades heredadas de Qwen3-4B (generación, código, matemáticas, multilingüismo), aunque no se confirman explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Evaluación de respuestas científicas con rúbricas: el modelo puede emplearse como generador de respuestas sujetas a rúbricas de protocolo, útil para estudiar cómo el entrenamiento ProRubric afecta a la calidad frente a la puntuación del juez.
- Investigación en alineación y reward hacking: sirve como checkpoint de referencia para reproducir experimentos sobre rubric-RL, comparando el paso 300 con la base Qwen3-4B y con variantes de otras semillas.
- Generación de explicaciones científicas estructuradas: al haberse entrenado con dimensiones conjuntivas y cláusulas de fallo, tiende a producir respuestas que cubren requisitos explícitos, adecuado para material divulgativo técnico revisable.
- Prototipado de pipelines de RL con `verl`: el checkpoint y el código asociado permiten montar entornos de entrenamiento y evaluación con PPO/GRPO en un modelo de 4B desplegable en una sola GPU.
- Asistencia en tareas de estudio y resolución de problemas científicos: con contexto suficiente (heredado de Qwen3), puede usarse en entornos educativos para generar borradores de soluciones que luego se validan manualmente.
- Benchmarking de métodos de alineación: al ser un modelo pequeño y abierto con licencia Apache 2.0, es adecuado como baseline en comparativas de técnicas de RL con rúbricas frente a DPO o RLHF clásico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 8 GB en FP16/BF16 (4B parámetros × 2 bytes), aproximadamente 2,5-3 GB en cuantización de 4 bits (estimación teórica; no confirmada por el autor).
- GPU recomendadas: A100, H100 o L40S para FP16 con contexto largo; RTX 4090, RTX 3090 o RTX 4080 para FP16 en contextos moderados.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización de 4 bits, y en tarjetas de 16-24 GB en FP16.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama si se generan cuantizaciones GGUF (no publicadas en la información disponible); transformers con safetensors para uso directo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProRubric-Qwen3-4B-Science | 4,02B | No disponible | RL con rúbricas de protocolo (ProRubric) | Apache 2.0 | Hugging Face (36 descargas) |
| Qwen/Qwen3-4B | ~4B | No disponible en esta ficha | Preentrenamiento + post-entrenamiento estándar de Qwen3 | Apache 2.0 | Hugging Face (ampliamente distribuido) |
| Modelos 4B de otras familias (p. ej. Llama 3.2 3B, Gemma 3 4B) | 3-4B | No disponible en esta ficha | Post-entrenamiento estándar | Licencias propias (no Apache 2.0 en todos los casos) | Hugging Face |

La comparación con alternativas de la misma categoría se limita a parámetros y licencia, ya que no hay datos de rendimiento publicados para este checkpoint. Frente a Qwen3-4B, la diferencia principal es el entrenamiento RL con ProRubric; frente a modelos de otras familias, la ventaja es la licencia Apache 2.0 y el tamaño desplegable en hardware de consumo.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que no puede afirmarse una mejora medible frente a Qwen3-4B en tareas downstream.
- El modelo está entrenado para un dominio científico y un protocolo de rúbricas concreto; su comportamiento fuera de ese dominio no está documentado.
- Riesgo de alucinación inherente a los modelos de 4B, no cuantificado en la información disponible.
- Sesgos conocidos: no documentados por el autor.
- Idiomas soportados: no disponibles; no se confirma el multilingüismo de la base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de la base Qwen3-4B y del código `verl` utilizado en el entrenamiento.
- El checkpoint corresponde a un paso intermedio de RL (paso 300, semilla 42); no se garantiza que sea el punto óptimo de la curva de entrenamiento.
- El número de descargas (36) y la ausencia de likes indican una adopción muy baja; no hay evidencia de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/EstarHash/ProRubric-Qwen3-4B-Science
- Paper: https://arxiv.org/abs/2609.38847
- Código: https://github.com/Estrellajer/ProRubric
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B

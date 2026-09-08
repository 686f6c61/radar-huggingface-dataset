# con-cord/SFT-agreed-only-no-ref

## Resumen

El modelo con-cord/SFT-agreed-only-no-ref es un LLM-as-a-Judge desarrollado por la organización con-cord, fine-tuned a partir de Gemma-3-4B mediante supervisión SFT para la evaluación de respuestas médicas. Su particularidad es que ha sido entrenado utilizando únicamente ejemplos con acuerdo entre anotadores y sin respuestas de referencia (no-ref), lo que lo orienta a tareas de adjudicación automática en las que no se dispone de una respuesta canónica. El modelo es multimodal (image-text-to-text), con 4.300.079.472 parámetros en formato safetensors, y se enmarca dentro del pipeline Concord, un sistema de adjudicación multi-juez para la evaluación de LLMs.

Aunque la ficha técnica del repositorio no incluye detalles sobre datos de entrenamiento, benchmarks ni licencia, el nombre y el contexto de la organización permiten situarlo como un juez especializado en el dominio médico. Su relevancia actual radica en la necesidad de evaluar de forma fiable las respuestas generadas por modelos de lenguaje en entornos clínicos, donde la precisión y la concordancia entre evaluadores son críticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma-3-4B) |
| Parámetros totales | 4.300.079.472 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Transformer de Gemma-3-4B, un modelo multimodal capaz de procesar texto e imágenes. El proceso de entrenamiento consiste en un fine-tuning supervisado (SFT) sobre un conjunto de datos de evaluaciones médicas, seleccionando únicamente los casos en los que hubo acuerdo entre los anotadores (agreed-only). No se dispone de información sobre el número de tokens, la composición del dataset ni la aplicación de RLHF/DPO. Tampoco se detallan innovaciones técnicas adicionales más allá del propio enfoque de adjudicación.

## Capacidades

- Evaluación automática de respuestas médicas como juez (LLM-as-a-Judge).
- Procesamiento multimodal: acepta imágenes y texto (pipeline image-text-to-text).
- Generación de texto en contextos de evaluación y adjudicación.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-step ni capacidades multilingües específicas.

## Casos de uso

- Evaluación de respuestas de chatbots médicos en entornos de atención al paciente: el modelo puede actuar como juez automático para puntuar la adecuación clínica de las respuestas generadas, especialmente cuando no existe una respuesta de referencia.
- Comparación de la calidad de respuestas generadas por distintos LLMs en estudios de investigación clínica: permite establecer un criterio de concordancia entre modelos sin necesidad de anotaciones humanas exhaustivas.
- Filtrado automático de respuestas incorrectas o incompletas en sistemas de apoyo a la decisión clínica: al ser un modelo ligero de 4.3B, puede integrarse en pipelines de inferencia para descartar respuestas de baja calidad antes de llegar al profesional sanitario.
- Auditoría de la concordancia entre evaluadores humanos y automáticos en ensayos de evaluación: su entrenamiento con ejemplos de acuerdo entre anotadores lo hace especialmente útil para detectar divergencias en procesos de revisión.
- Integración en pipelines de evaluación tipo Concord para escalar la revisión de respuestas sin referencia: el modelo puede combinarse con otros jueces en un sistema multi-adjudicación, tal como propone el paper de Concord.
- Entrenamiento de modelos de recompensa en dominios médicos: su salida puede utilizarse como señal de preferencia para entrenar reward models en tareas clínicas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, los pesos ocupan aproximadamente 8.6 GB, por lo que se recomiendan al menos 12 GB de VRAM. Con cuantización 4-bit, la VRAM necesaria puede reducirse a unos 4-5 GB.
- GPU recomendadas: RTX 4090, A100, H100 o cualquier GPU con 12 GB o más de memoria.
- Puede ejecutarse en GPUs de consumo (RTX 3090, RTX 4090) con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| con-cord/SFT-agreed-only-no-ref | 4.300.079.472 | no disponible | no disponible | HuggingFace |
| con-cord/SFT_MA-no-ref | no disponible | no disponible | no disponible | HuggingFace |
| Gemma-3-4B (base) | 4B aprox. | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos. Ambos modelos de con-cord comparten la misma arquitectura base (Gemma-3-4B) y están orientados a la evaluación de respuestas médicas, diferenciándose en la estrategia de entrenamiento (agreed-only frente a majority-agreement).

## Limitaciones y advertencias

- La model card no contiene información sobre sesgos, riesgos o limitaciones, por lo que se desconocen posibles sesgos heredados del dataset de entrenamiento.
- Riesgo de alucinación inherente a cualquier modelo de lenguaje, especialmente en dominios médicos donde la precisión es crítica.
- Licencia no disponible, lo que impide determinar si el modelo puede utilizarse con fines comerciales.
- No se han publicado benchmarks ni evaluaciones externas, por lo que su rendimiento real es desconocido.
- Longitud de contexto e idiomas soportados no documentados, lo que dificulta su integración en aplicaciones multilingües.
- No se recomienda su uso en producción sin una validación exhaustiva previa en el dominio de aplicación.

## Enlaces

- HuggingFace: https://huggingface.co/con-cord/SFT-agreed-only-no-ref
- Paper de Concord: https://aclanthology.org/2026.gem-main.46.pdf
- Modelo similar de la misma organización: https://huggingface.co/con-cord/SFT_MA-no-ref

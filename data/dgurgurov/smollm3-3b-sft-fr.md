# DGurgurov/SmolLM3-3B-SFT-FR

## Resumen

`DGurgurov/SmolLM3-3B-SFT-FR` es un modelo de lenguaje de 3.340 millones de parámetros, resultado de la primera etapa del pipeline de adaptación de razonamiento **ReasonXL** aplicado al modelo base `HuggingFaceTB/SmolLM3-3B`. Desarrollado por Daniil Gurgurov y colaboradores, su objetivo es desplazar el idioma de razonamiento del modelo de inglés a francés mediante un ajuste fino supervisado (SFT) sobre trazas de razonamiento del dataset `toroe/ReasonXL-SFT`. La segunda etapa del pipeline, que aplica RL con GRPO, está disponible en `DGurgurov/SmolLM3-3B-SFT-GRPO-FR`.

El modelo resuelve el problema de preservar la calidad de razonamiento mientras se cambia el idioma de razonamiento, un reto habitual en modelos multilingües. Se basa en la arquitectura transformer decoder-only de SmolLM3-3B, con una ventana de contexto de hasta 128.000 tokens y capacidad de razonamiento dual-mode (estándar y extendido). Relevante para la comunidad hispanohablante porque permite razonar en español sin sacrificar capacidades de razonamiento complejo, aunque la licencia no está especificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en SmolLM3-3B) |
| Parametros totales | 3.337.766.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado del base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | frances (el base soporta seis idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune supervisado del modelo base `HuggingFaceTB/SmolLM3-3B`, que es un transformer decoder-only de 3.340 millones de parámetros, entrenado en 11 billones de tokens de texto general. SmolLM3-3B incorpora un mecanismo de razonamiento dual-mode que permite alternar entre modo estándar y modo de razonamiento explícito, y soporta contexto de hasta 128k tokens.

La etapa de SFT se realiza sobre el dataset `Roe/ReasonXL-SFT`, que contiene trazas de razonamiento en francés. El objetivo es que el modelo realice su razonamiento interno en el idioma objetivo (francés) manteniendo las capacidades de razonamiento del modelo base. La segunda etapa, RL con GRPO, se aplica para recuperar la calidad de razonamiento que pueda degradarse durante el SFT, usando una recompensa compuesta sobre problemas matemáticos verificables. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Razonamiento en francés: el modelo está especializado para realizar razonamientos internos en francés, tanto en modo estándar como en modo de razonamiento extendido.
- Generación de texto: hereda las capacidades de generación de SmolLM3-3B, incluyendo creación de contenido en francés.
- Razonamiento matemático: el entrenamiento con problemas matemáticos verificables en la etapa de RL sugiere capacidad de resolución de problemas matemáticos, aunque no se publican benchmarks específicos.
- Capacidades multilingües: aunque el objetivo es el francés, el modelo base soporta seis idiomas, por lo que puede seguir respondiendo en otros idiomas aunque con menor calidad de razonamiento.
- Razonamiento dual-mode: al ser un fine-tune de SmolLM3-3B, conserva el mecanismo de razonamiento dual (modo estándar y modo de razonamiento extendido), activable mediante prompts específicos.
- Tool calling: no se menciona explícitamente, pero el modelo base SmolLM3-3B soporta function calling y agentes; el fine-tune podría preservar estas capacidades, aunque no hay evidencia en la model card.

## Casos de uso

- Asistentes de atención al cliente en francés: el modelo puede gestionar conversaciones multi-turno con contexto largo (128k tokens) y realizar razonamientos en francés, adecuado para resolver consultas complejas que requieren análisis en el idioma del usuario.
- Generación de código en francés: aunque no se especifica, su base SmolLM3-3B tiene capacidades de generación de código; puede adaptarse a comentarios y documentación en francés.
- Sistemas de tutoría matemática en francés: gracias a su entrenamiento con problemas matemáticos verificables, puede explicar pasos de razonamiento en francés, útil para plataformas educativas.
- Traducción y localización de razonamiento: puede ser usado para generar explicaciones técnicas en francés a partir de inputs en otros idiomas, manteniendo el razonamiento interno en francés.
- Agentes conversacionales con memoria larga: con contexto de 128k tokens, puede mantener conversaciones largas con historial completo, útil para asistentes virtuales en francés.
- Evaluación de razonamiento en francés: sirve como base para investigaciones sobre cómo el idioma del razonamiento afecta el rendimiento en tareas de lógica y matemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que los detalles de evaluación se publicarán próximamente. No se puede comparar con modelos similares sin datos cuantitativos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.340 millones de parámetros, en FP16 se necesitan aproximadamente 6,7 GB de VRAM. En cuantización INT8, unos 3,3 GB; en INT4, unos 1,7 GB.
- GPU recomendadas: puede ejecutarse en GPUs consumer como RTX 3090, RTX 4090, o GPUs profesionales como A10, A100 (para contextos largos).
- Cabe en consumer GPU: sí, en cuantización INT4 puede caber en GPUs con 4 GB de VRAM, pero para contexto de 128k tokens se recomienda al menos 16 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, transformers. Se recomienda usar vLLM para producción por su eficiencia.
- Latencia y throughput: no se conocen datos específicos para este modelo; el base SmolLM3-3B suele tener una latencia de decodificación de alrededor de 10-20 tokens/s en una RTX 4090, pero no se ha medido para este fine-tune.

## Comparativa con modelos similares

No hay datos de benchmarks publicados, pero se puede comparar estructuralmente con:

| Modelo | Parametros | Contexto | Idioma de razonamiento | Licencia |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3,34 B | 128k | Inglés | Apache 2.0 |
| DGurgurov/SmolLM3-3B-SFT-FR | 3,34 B | 128k | Francés | no disponible |
| DGurgurov/SmolLM3-3B-SFT-GRPO-FR | 3,34 B | 128k | Francés | no disponible |

La comparación con otros modelos de 3B como Llama-3.2-3B o Phi-3-mini no es posible sin benchmarks, pero SmolLM3-3B se caracteriza por su eficiencia en razonamiento y contexto largo.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo, lo que impide su uso comercial sin consultar al autor. Es un riesgo importante para producción.
- Sesgos del modelo base: al derivar de SmolLM3-3B, puede heredar sesgos de los datos de entrenamiento, que no se han documentado en este fine-tune.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o no verificada, especialmente en tareas de razonamiento complejo.
- Limitación de idioma: aunque el objetivo es el francés, el modelo puede tener menor calidad en otros idiomas y no se ha evaluado su rendimiento en francés en comparación con el base en inglés.
- Falta de benchmarks: no hay datos de evaluación, por lo que su rendimiento real es desconocido.
- Contexto de 128k tokens: aunque el base lo soporta, el fine-tune puede no haber sido entrenado con secuencias tan largas, lo que podría degradar la calidad en contextos largos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/DGurgurov/SmolLM3-3B-SFT-FR)
- [Modelo base HuggingFaceTB/SmolLM3-3B](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
- [Dataset toroe/ReasonXL-SFT](https://huggingface.co/datasets/toroe/ReasonXL-SFT)
- [Modelo GRPO correspondiente](https://huggingface.co/DGurgurov/SmolLM3-3B-SFT-GRPO-FR)
- [Paper ReasonXL (arXiv)](https://arxiv.org/abs/2604.12378)
- [Repositorio alignment-handbook con recetas para SmolLM3](https://github.com/huggingface/alignment-handbook/tree/main/recipes/smollm3)

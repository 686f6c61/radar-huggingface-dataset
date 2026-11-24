# fastino/Fastino-Nemotron-3.5-Lightning-Healthcare

## Resumen

Fastino-Nemotron-3.5-Lightning-Healthcare es un modelo de lenguaje especializado en dominios sanitario y biomédico, desarrollado por Fastino Labs en colaboración con NVIDIA. Se construye sobre el checkpoint base NVIDIA Nemotron 3.5 Lightning (publicado el 29 de julio de 2026) y añade el adaptador combinado de salud E17b de Fastino, distribuido como checkpoint fusionado listo para ejecutar. No requiere cargar un LoRA adicional por separado.

Arquitectura de mezcla de expertos (MoE) con 31.577.937.344 parámetros totales y aproximadamente 3.000 millones activos por token, según indica el autor en la model card. El modelo está orientado a conversación clínica, respuesta a preguntas biomédicas, cálculo clínico, detección y corrección de errores médicos, extracción de conceptos biomédicos, resumen de notas clínicas y tareas de administración clínica con uso de herramientas.

Su relevancia radica en el ajuste fino dirigido sobre un modelo base de propósito general con una receta construida de forma autónoma por el agente de Fastino, con mejoras medibles en benchmarks clínicos como HealthBench Core (+6,54 pp), MEDEC (+11,32 pp en precisión de flag) y BC5CDR (+24,59 pp) respecto al checkpoint base. La licencia Apache 2.0 facilita su adopción en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), familia Nemotron H (`nemotron_h`) |
| Parametros totales | 31.577.937.344 (~31,6 B) |
| Parametros activos | ~3 B (según model card) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `max_model_len=4096`, no se declara el máximo) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint NVIDIA Nemotron 3.5 Lightning, un transformer de mezcla de expertos de ~31,6 B de parámetros totales con ~3 B activos por token, lo que permite un coste de inferencia muy inferior al de un modelo denso del mismo tamaño. Sobre esa base se aplicó un ajuste fino con LoRA de rango 64 durante dos épocas, con tasa de aprendizaje 1,5e-4, tamaño de lote 32 y empaquetado de secuencias desactivado. El adaptador resultante se fusionó en el checkpoint final publicado.

El conjunto de entrenamiento consta de 72.358 ejemplos deduplicados que cubren instrucciones generales de salud y conversaciones de estilo médico, respuesta a preguntas biomédicas, cálculo clínico, detección y corrección de errores médicos, resumen de diálogo clínico y generación de notas, extracción de conceptos biomédicos, químicos y de enfermedades, trayectorias de uso de herramientas en administración clínica y trayectorias de tareas de agentes médicos. La mezcla final reponderó ligeramente los ejemplos difíciles de estilo HealthBench. Las filas de evaluación, desarrollo y ciegas, junto con sus etiquetas, se excluyeron del entrenamiento. La receta fue construida de forma autónoma por el Fastino Fine-Tuning Agent, que generó conjuntos de evaluación, curó datos, exploró mezclas e hiperparámetros y seleccionó el checkpoint final.

## Capacidades

- Generación de texto y razonamiento clínico en inglés.
- Respuesta a preguntas biomédicas y cálculo clínico.
- Detección y corrección de errores médicos en textos clínicos.
- Extracción de conceptos biomédicos, entidades químicas y enfermedades.
- Resumen de diálogos clínicos y generación de notas.
- Uso de herramientas (*tool calling*) en tareas de administración clínica, incluidas trayectorias basadas en navegador.
- Tareas de agente médico con razonamiento multi-paso.
- Conversación multi-turno con rol de sistema configurable.
- Multilingüe: no disponible (solo se declara inglés).

## Casos de uso

- Resumen de notas clínicas: el modelo puede condensar notas de ingreso, evolución o alta en viñetas concisas sin añadir información ausente, como muestra el ejemplo de la model card con un paciente con insuficiencia cardíaca descompensada.
- Detección y corrección de errores en documentación médica: con una precisión de flag del 64,98% en MEDEC, resulta adecuado para revisiones automatizadas de informes antes de su firma.
- Extracción de entidades biomédicas: con 72,51% en BC5CDR y 40,30% en MedMentions ST21pv, puede alimentar pipelines de anotación de literatura científica y registros electrónicos.
- Respuesta a preguntas biomédicas: útil como asistente de consulta sobre literatura médica, con un 65,00% en PubMedQA en el conjunto evaluado.
- Cálculo clínico: soporta tareas de dosificación, índices y puntuaciones clínicas (54,18% en MedCalc), integrable en herramientas de apoyo a la decisión.
- Administración clínica con agentes: con un 29,95% en HealthAdminBench y 40,00% de tasa de éxito global en MedAgent, puede automatizar tareas de portal del paciente y gestión de citas mediante *tool calling*.
- Asistente conversacional de salud: para triaje inicial o educación sanitaria en inglés, con un 56,21% en HealthBench Core.

## Benchmarks y rendimiento

| Benchmark | Ámbito | Base 29 jul | Fastino-Healthcare | Cambio |
|---|---|---:|---:|---:|
| HealthBench Pro | ciego, n=180 | 26,83% | 32,64% | +5,80 pp |
| HealthAdminBench | ciego | 25,67% | 29,95% | +4,28 pp |
| MedAgent public v1/v2, SR global | ciego, n=150 | 36,00% | 40,00% | +4,00 pp |
| HealthBench Core | ciego, n=700 | 49,67% | 56,21% | +6,54 pp |
| PubMedQA | emparejado, n=500 | 59,00% | 65,00% | +6,00 pp |
| MedCalc | emparejado, n=275 | 49,09% | 54,18% | +5,09 pp |
| MEDEC, precisión de flag | emparejado, n=574 | 53,66% | 64,98% | +11,32 pp |
| MEDEC, precisión de frase | emparejado, n=574 | 48,08% | 62,89% | +14,81 pp |
| MedMentions ST21pv | emparejado, n=878 | 19,74% | 40,30% | +20,55 pp |
| BC5CDR | emparejado, n=500 | 47,92% | 72,51% | +24,59 pp |

Las puntuaciones de base y ajustado emplean el mismo checkpoint del 29 de julio, las mismas entradas, prompts, ajustes de decodificación, ruta de inferencia y evaluador. HealthAdminBench usó descripción de tarea más guía de portal con observación del árbol de accesibilidad. No se han publicado resultados de benchmarks de transferencia a tareas no vistas en la información disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 66 GB antes de la sobrecarga en tiempo de ejecución.
- GPU recomendada: una GPU de 80 GB o superior (A100 80 GB, H100 80 GB) o paralelismo tensorial en varias GPU.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090) ni de 48 GB en BF16; requeriría cuantización, no publicada por el autor.
- Despliegue: vLLM 0.23.0 con `trust_remote_code=True`, `dtype="bfloat16"` y `max_model_len=4096` según el ejemplo del autor; también compatible con el ecosistema `transformers` y con endpoints compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Especialización |
|---|---|---|---|---|---|
| Fastino-Nemotron-3.5-Lightning-Healthcare | ~31,6 B | ~3 B | no disponible | Apache 2.0 | Salud y biomedicina |
| nvidia/Nemotron-3.5-Lightning | ~31,6 B | ~3 B | no disponible | no disponible | Propósito general |
| Alternativas clínicas de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros modelos clínicos de la misma categoría no está disponible en la información proporcionada; la referencia más cercana y documentada es el propio checkpoint base, frente al que se miden todas las mejoras de la tabla de benchmarks.

## Limitaciones y advertencias

- Solo soporta inglés; no se declara cobertura multilingüe.
- Riesgo de alucinación inherente a los modelos generativos, especialmente crítico en contexto clínico: no debe usarse como sustituto del juicio profesional médico.
- Sesgos conocidos: no disponible.
- La longitud máxima de contexto no se declara; el ejemplo del autor limita a 4096 tokens, lo que puede ser insuficiente para historiales clínicos extensos.
- El checkpoint se publica únicamente en BF16, sin versiones cuantizadas oficiales, lo que limita su despliegue en hardware de consumo.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre exactitud clínica; el uso en producción sanitaria exige validación y supervisión humana.
- Los benchmarks in-domain son de ámbito ciego o emparejado pero acotado (n entre 150 y 878); el rendimiento en dominios no vistos no está documentado.
- Requiere `trust_remote_code=True` en vLLM, lo que implica ejecutar código del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/Fastino-Nemotron-3.5-Lightning-Healthcare
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Lightning
- Paper: https://arxiv.org/abs/2604.09791
- Blog de lanzamiento: https://fastino.ai/blog/fastino-nemotron-3-5-lightning-finance-and-healthcare
- Agente de ajuste fino: https://agent.fastino.ai/
- Página de producto: https://fastino.ai/lp/fastino-nemotron
- X/Twitter: https://x.com/fastinoAI

# saidutta69/RedPillV1

## Resumen

RedPillV1 es un modelo de lenguaje de 1.080 millones de parámetros desarrollado por saidutta69 (también conocido como RACER IS OP), especializado en el dominio farmacéutico: descubrimiento de fármacos, desarrollo de formulaciones, síntesis química y asuntos regulatorios. Se basa en el modelo MiniCPM5-1B, al que se le ha aplicado una abliteración mediante la técnica Heretic para eliminar los mecanismos de rechazo, y posteriormente se ha ajustado con LoRA sobre un conjunto de 1.047 instrucciones multi-turno del dataset RED-PILL.

El modelo está pensado para responder sin restricciones a preguntas legítimas de I+D farmacéutico, desde diseño molecular hasta estrategia regulatoria. Con una licencia MIT y un tamaño de solo 2 GB en pesos, es ligero y desplegable en hardware modesto. Su relevancia radica en cubrir un nicho muy específico —la química medicinal y el desarrollo galénico— con un modelo pequeño que puede ejecutarse en GPU de consumo, aunque su rendimiento real en tareas expertas es limitado, como muestran las evaluaciones del propio autor.

La arquitectura es un transformer decoder-only basado en MiniCPM5-1B, con pesos en formato safetensors. La longitud de contexto no se especifica en la documentación disponible, y el modelo solo soporta inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base MiniCPM5-1B) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican cuantizaciones oficiales; compatible con llama.cpp/Ollama) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-heretic, una variante del MiniCPM5-1B a la que se ha aplicado la técnica de abliteración Heretic (eliminación de los vectores de dirección asociados al rechazo de respuestas). Sobre esta base se realizó un fine-tuning con LoRA de rango 16, alpha 32 y dropout 0.05, aplicado a las proyecciones q, k, v y o de la atención. El entrenamiento se ejecutó durante 3 épocas con un batch efectivo de 16 (2 × 8 con acumulación de gradientes), tasa de aprendizaje 2e-5 con scheduler coseno y 50 pasos de warmup, en precisión bf16. Se utilizó una GPU NVIDIA H100 80GB y el proceso duró 4 minutos y 10 segundos, con una pérdida que descendió de 2.782 a 1.724 (una reducción del 38%).

El dataset de entrenamiento, RED-PILL, contiene 1.047 instrucciones multi-turno de carácter farmacéutico, que cubren descubrimiento de fármacos, desarrollo de formulaciones, síntesis, asuntos regulatorios y literatura científica. No se menciona el uso de RLHF ni DPO; el ajuste es puramente supervisado sobre el dataset mencionado.

## Capacidades

- Generación de texto en inglés con enfoque conversacional multi-turno.
- Soporte de tareas de descubrimiento de fármacos: optimización hit-to-lead, perfiles ADMET, estrategias de cribado virtual y análisis de relaciones estructura-actividad (SAR).
- Desarrollo de formulaciones: mejora de solubilidad (ASD, nanosizing, ciclodextrinas), diseño de formas de dosificación y selección de excipientes.
- Síntesis química: análisis retrosintético, química de procesos y consideraciones de escalado.
- Asuntos regulatorios: vías ANDA frente a 505(b)(2), estudios habilitadores de IND y guías de la FDA.
- Toma de decisiones: análisis de compensaciones, marcos de priorización y evaluación de riesgos.
- Resumen de literatura científica: síntesis de artículos de PubMed, crítica de métodos y comparación entre publicaciones.
- No se documenta soporte explícito de tool calling, function calling ni capacidades multimodales.

## Casos de uso

- Diseño de formulaciones de liberación sostenida: el modelo puede proponer matrices de HPMC para fármacos como metformina, indicando proporciones de polímero y posibles perfiles de liberación, útil en fases tempranas de desarrollo galénico.
- Optimización de candidatos a fármaco: dada una serie de compuestos, puede sugerir modificaciones estructurales para mejorar la solubilidad o la permeabilidad, apoyando decisiones de química medicinal.
- Análisis retrosintético: ante una molécula objetivo, el modelo puede esbozar rutas sintéticas plausibles y señalar pasos de escalado problemáticos, sirviendo como lluvia de ideas para químicos de proceso.
- Resumen de literatura científica: a partir de abstracts o secciones de métodos, puede generar resúmenes concisos y comparar hallazgos entre varios artículos, ahorrando tiempo en revisiones bibliográficas.
- Estrategia regulatoria: puede explicar las diferencias entre las vías ANDA y 505(b)(2), y enumerar los estudios necesarios para un IND, facilitando la planificación en pequeñas farmacéuticas.
- Evaluación de riesgos en desarrollo: el modelo puede estructurar análisis de compensaciones entre coste, tiempo y riesgo en decisiones de formulación o escalado, ayudando a priorizar opciones en entornos con recursos limitados.

## Benchmarks y rendimiento

El autor proporciona una evaluación propia sobre 32 preguntas farmacéuticas de nivel experto, realizada en Kaggle con 2 GPUs T4. Los resultados se presentan por categoría y por dificultad. Es importante señalar que esta evaluación no utiliza benchmarks estándar (MMLU, HumanEval, GSM8K) y que el sistema de puntuación combina un 40% de coincidencia de palabras clave con un 60% de solapamiento con la respuesta de referencia. No se han publicado resultados en benchmarks generales.

| Categoria | Puntuacion |
|---|---|
| Toma de decisiones | 41,4% |
| Diseño de formulaciones | 24,8% |
| Análisis molecular | 22,6% |
| Recuerdo de conocimiento | 22,2% |
| Razonamiento | 15,7% |
| Nivel oro (descubrimiento) | 16,2% |
| Nivel oro (formulación) | 8,9% |

| Nivel de dificultad | Puntuacion | Número de preguntas |
|---|---|---|
| Avanzado | 22,9% | 15 |
| Intermedio | 20,0% | 3 |
| Experto | 14,6% | 14 |

El autor señala que las puntuaciones subestiman la capacidad real, ya que el modelo genera respuestas coherentes de 300 a 600 palabras, y que la mejor área es la toma de decisiones (41,4%), atribuible a los datos de razonamiento multi-turno.

## Requisitos de hardware

- El peso del modelo en safetensors es de 2,0 GB, por lo que cabe en GPU de consumo con al menos 4 GB de VRAM en fp16.
- Con cuantización de 8 bits, la VRAM necesaria se reduce a aproximadamente 2 GB; con 4 bits, alrededor de 1 GB, aunque no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU NVIDIA con 4 GB o más (GTX 1650, RTX 3060, RTX 4090, etc.). Para entrenamiento se usó una H100 80GB, pero para inferencia no se requiere ese nivel.
- Opciones de despliegue: transformers (PyTorch), llama.cpp, Ollama (el autor indica `ollama run saidutta69/RedPillV1`), y servidores compatibles con text-generation-inference (el modelo está etiquetado como `endpoints_compatible`).
- No se proporcionan datos de latencia ni throughput. Dado el tamaño, se espera una generación rápida incluso en CPU con cuantización, aunque no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de tamaño similar en el dominio farmacéutico. Existen alternativas generalistas de 1B como TinyLlama-1.1B o Qwen2.5-1.5B, pero no hay datos de rendimiento comparables sobre tareas de química medicinal o formulación. Tampoco se han publicado evaluaciones frente a modelos farmacéuticos específicos como BioMedLM o Galactica. Por tanto, la comparativa no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo tiene solo 1.080 millones de parámetros y se entrenó con apenas 1.047 instrucciones, por lo que su conocimiento farmacéutico es superficial y puede generar respuestas incorrectas o incompletas, especialmente en tareas de nivel experto (las puntuaciones de evaluación no superan el 41%).
- Riesgo de alucinación elevado: al ser un modelo pequeño y sin verificación externa, puede inventar compuestos, dosis o vías regulatorias que no existen. No debe usarse como fuente única para decisiones clínicas o de fabricación.
- El modelo está diseñado para no rechazar preguntas, incluso aquellas que podrían tener usos peligrosos o ilegales (por ejemplo, síntesis de sustancias controladas). Aunque el autor lo presenta para I+D legítima, la ausencia de salvaguardas implica un riesgo de uso indebido.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- La longitud de contexto no está especificada, lo que limita su uso en tareas que requieran documentos largos o historiales extensos.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre la exactitud o seguridad de las respuestas en el dominio farmacéutico.
- El modelo base MiniCPM5-1B y la abliteración Heretic pueden heredar sesgos del conjunto de datos original, aunque no se documentan sesgos específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/RedPillV1
- Dataset RED-PILL: https://huggingface.co/datasets/saidutta69/red-pill-drug-discovery-formulation
- Modelo base (MiniCPM5-1B abliterado): https://huggingface.co/saidutta69/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-heretic
- Repositorio de la técnica Heretic: https://github.com/p-e-w/heretic
- Perfil del autor en Hugging Face: https://huggingface.co/saidutta69

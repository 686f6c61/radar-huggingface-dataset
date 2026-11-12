# Charlie320/zils-mini-sg3

## Resumen

zils-mini-sg3 es un modelo de decisión de 4.539 millones de parámetros (aproximadamente 4,54 mil millones) desarrollado por Charlie320, construido como un fine-tune del modelo base Qwen/Qwen3.5-4B. Forma parte del pool de modelos "soup" denominado `d3-mini` de Zils, asociado a la subred 127 de Bittensor. El modelo se presenta como un "body" (cuerpo) dentro de una arquitectura de dos componentes, donde este modelo actúa como la parte lingüística entrenada, mientras que la torre de visión se hereda del modelo padre.

El modelo se ha generado mediante un proceso de "soup fine-tune": la combinación de tres ejecuciones de LoRA de rango 64 (con learning rate 5e-5, una época y semillas diferentes) que se promedian para producir los pesos finales. Los pesos se distribuyen en formato BF16 y safetensors, con un tamaño de repositorio de 9,1 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en su especialización como modelo de decisión: está entrenado específicamente para tareas de clasificación y razonamiento sobre pares de frases, preguntas de opción múltiple y llamadas a funciones, en lugar de ser un modelo generativo de propósito general. Esto lo hace adecuado para pipelines de evaluación automatizada, enrutamiento de consultas y sistemas de agentes que requieren decisiones binarias o multiclase con alta precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-4B) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen/Qwen3.5-4B, un modelo denso de aproximadamente 4,5 mil millones de parámetros. El fine-tune se realizó mediante tres ejecuciones independientes de LoRA de rango 64, con un learning rate de 5e-5, una época de entrenamiento y semillas distintas. Los pesos resultantes de las tres ejecuciones se promediaron (model soup) para producir el modelo final. El entrenamiento se centró en los pesos lingüísticos, mientras que la torre de visión se mantiene congelada y se hereda directamente del modelo padre.

Los datos de entrenamiento consisten en aproximadamente 84.000 elementos de decisión. De ellos, unos 70.000 se convirtieron a partir de splits públicos de entrenamiento con sus etiquetas gold, incluyendo tareas como MNLI, RTE, STS-B, 20 Newsgroups, QNLI, emotion, sarcasm, SIQA, PIQA, GSM8K, Glaive function calling y puntuaciones de reglas derivadas de TweetEval, todo ello en los formatos de examen actuales. Además, se añadieron 7.120 elementos en formato de examen escritos con la receta pública de autoría de Zils (con un factor de repetición x2) y el examen semilla público `zils-ai/base-exam-seed-v1` (familias antiguas, con factor x3). Los exámenes semilla v2-v4 no se utilizaron para el entrenamiento.

## Capacidades

- Clasificación y decisión sobre pares de frases: entrenado específicamente para tareas de inferencia textual (MNLI, RTE), similitud semántica (STS-B) y respuesta a preguntas (QNLI, SIQA).
- Razonamiento sobre opciones múltiples: soporta formatos de examen con preguntas de opción múltiple (PIQA, GSM8K en formato de examen).
- Llamadas a funciones (function calling): incluye datos de Glaive function calling, lo que le permite generar llamadas estructuradas a herramientas.
- Análisis de sentimiento y emoción: entrenado con datos de emotion y sarcasm, puede clasificar estados emocionales y detectar sarcasmo.
- Puntuaciones basadas en reglas: incorpora datos derivados de TweetEval para tareas de evaluación de texto según reglas predefinidas.
- Capacidades multilingües: no disponible (los idiomas no están especificados en la información proporcionada).
- Modo de visión: hereda la torre de visión del modelo padre Qwen/Qwen3.5-4B, aunque no se especifica si está activa o congelada en este fine-tune.
- Razonamiento multi-paso: no disponible (no se menciona explícitamente en la model card).

## Casos de uso

- Evaluación automatizada de exámenes y pruebas de decisión: el modelo puede utilizarse para puntuar respuestas en formatos de examen estandarizados (MNLI, RTE, QNLI, etc.) gracias a su entrenamiento específico con datos convertidos de splits públicos y etiquetas gold. Es adecuado para pipelines de evaluación de modelos o de sistemas de decisión.
- Enrutamiento de consultas en sistemas de agentes: al estar entrenado en tareas de inferencia textual y clasificación, puede decidir si una consulta requiere una llamada a función, una respuesta directa o una derivación a otro componente. Su soporte de function calling (Glaive) lo hace útil para orquestar herramientas en agentes.
- Detección de sarcasmo y análisis de sentimiento en redes sociales: los datos de entrenamiento incluyen sarcasm y emotion, lo que permite su uso en moderación de contenido o análisis de opinión en plataformas como Twitter (TweetEval).
- Clasificación de noticias y temas: con datos de 20 Newsgroups, el modelo puede categorizar documentos en temas predefinidos, útil para sistemas de recomendación o filtrado de contenido.
- Razonamiento sobre sentido común: entrenado con SIQA y PIQA, puede responder preguntas de sentido común y física básica, adecuado para asistentes educativos o sistemas de preguntas y respuestas.
- Verificación de similitud semántica: con STS-B, puede determinar si dos frases son semánticamente equivalentes, útil para deduplicación de textos, búsqueda semántica o control de calidad en traducción.
- Evaluación de calidad de código o matemáticas: aunque no se especifica explícitamente, la inclusión de GSM8K en formato de examen sugiere capacidad para resolver problemas matemáticos de nivel escolar, aplicable en tutores automáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 4,54 mil millones de parámetros en BF16, se requieren aproximadamente 9,1 GB de VRAM solo para los pesos. Con cuantización a 8 bits, se reduciría a unos 4,5 GB; a 4 bits, a unos 2,3 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: para BF16, se recomienda una GPU con al menos 12 GB de VRAM (RTX 3060 12GB, RTX 4070, RTX 4090, A100, H100). Para cuantización a 8 bits, bastaría con 8 GB (RTX 3070, RTX 4060 Ti).
- ¿Cabe en consumer GPU? Sí, en GPUs de gama media-alta con 12 GB o más para BF16, y en GPUs de 8 GB con cuantización.
- Opciones de despliegue: al ser un modelo basado en Qwen, es compatible con vLLM, llama.cpp (si se convierte a GGUF), Ollama (mediante importación), TGI y transformers. No se dispone de confirmación explícita del autor sobre compatibilidad con todas estas herramientas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-mini-sg3 | 4,54 B | No disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | ~4,5 B | No disponible | Apache 2.0 | Hugging Face |
| qhoenix/zils-mini-decision-l13_avg678 | No disponible | No disponible | No disponible | Hugging Face |
| joamCriff123/zils-mini-sx3 | No disponible | No disponible | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos derivados de MNLI, RTE, STS-B, 20 Newsgroups, QNLI, emotion, sarcasm, SIQA, PIQA, GSM8K, Glaive y TweetEval, el modelo puede heredar los sesgos presentes en estos conjuntos, especialmente en lo relativo a género, raza y origen cultural en tareas de inferencia textual y análisis de sentimiento.
- Riesgo de alucinación: aunque es un modelo de decisión, puede generar respuestas incorrectas o inventadas en tareas de clasificación cuando se enfrenta a entradas fuera de distribución o formatos no vistos durante el entrenamiento.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto soportada ni los idiomas cubiertos. Los datos de entrenamiento parecen estar mayoritariamente en inglés (MNLI, RTE, etc.), por lo que su rendimiento en castellano u otros idiomas es incierto.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y distribución, siempre que se incluya el aviso de copyright y la licencia. No hay restricciones adicionales conocidas.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que no ha sido validado por la comunidad. No se han publicado benchmarks ni evaluaciones independientes. El tamaño del repositorio (9,1 GB) y la falta de información sobre el contexto y los idiomas limitan su uso en entornos de producción sin una evaluación previa. Además, al ser un fine-tune de un modelo base con torre de visión, no se especifica si la visión está operativa o si solo se conservan los pesos.

## Enlaces

- [Hugging Face: Charlie320/zils-mini-sg3](https://huggingface.co/Charlie320/zils-mini-sg3)
- [Modelo base: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Modelo relacionado: qhoenix/zils-mini-decision-l13_avg678](https://huggingface.co/qhoenix/zils-mini-decision-l13_avg678)
- [Modelo relacionado: joamCriff123/zils-mini-sx3](https://huggingface.co/joamCriff123/zils-mini-sx3)
- [Examen semilla: zils-ai/base-exam-seed-v1](https://huggingface.co/zils-ai/base-exam-seed-v1)

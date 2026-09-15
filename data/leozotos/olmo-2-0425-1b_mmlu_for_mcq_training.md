# LeoZotos/OLMo-2-0425-1B_mmlu_for_mcq_training

## Resumen

Este modelo es un fine-tuning del modelo base `allenai/OLMo-2-0425-1B`, desarrollado por LeoZotos, sobre el dataset `LeoZotos/mmlu_for_mcq_training`. Está diseñado para responder preguntas de opción múltiple (MCQ) en el estilo de MMLU, con especial atención a dominios científicos y médicos. El objetivo declarado en la configuración es investigar dinámicas de aprendizaje y evaluar estrategias de fine-tuning en tareas de razonamiento.

El checkpoint tiene 1.484.916.736 parámetros y los pesos se distribuyen en formato safetensors. La arquitectura no se especifica en la información disponible, pero se hereda del modelo base OLMo-2-0425-1B. La longitud de contexto no está documentada; durante el entrenamiento se usó una longitud máxima de secuencia de 1024 tokens. El modelo se publica como un checkpoint de un solo paso de fine-tuning, con una configuración de entrenamiento detallada y reproducible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (heredada de `allenai/OLMo-2-0425-1B`) |
| Parametros totales | 1.484.916.736 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (durante el fine-tuning se usó `max_seq_length=1024`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `allenai/OLMo-2-0425-1B` en la revisión `stage2-ingredient3-step1000-tokens3B`. La configuración de entrenamiento está documentada en la model card e incluye los siguientes parámetros: tasa de aprendizaje de 2e-5, weight decay de 0.01, batch size de 4 con 8 pasos de acumulación de gradientes, 1 epoch, programación de tasa de aprendizaje coseno y `mask_prompt_loss` desactivado. El entrenamiento utilizó exclusivamente el corpus de preguntas y respuestas `LeoZotos/mmlu_for_mcq_training`, con un máximo de 5000 ejemplos y un total de 2.070.809 tokens sin padding. Se realizaron 157 pasos de actualización.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La evaluación se llevó a cabo sobre los conjuntos `bio_full`, `immu_full`, `usmle_full`, `sciq_full` y `mmlu_short_non_bio`, con 5 permutaciones por pregunta, temperatura de 0.6 y top-p de 0.95. No se han publicado los resultados de estas evaluaciones en la información disponible.

## Capacidades

- Respuesta a preguntas de opción múltiple (MCQ) en formato MMLU, con evaluación en dominios de biología, inmunología, medicina (USMLE) y ciencias generales.
- Generación de respuestas científicas y médicas, según los conjuntos de datos de evaluación utilizados durante el entrenamiento.
- No se ha documentado soporte para tool calling, function calling, agentes, visión, audio ni modos de razonamiento especiales.
- Las capacidades multilingües no están especificadas; el dataset de entrenamiento es principalmente en inglés, por lo que es probable que el modelo esté limitado a ese idioma.

## Casos de uso

- Autoevaluación en educación médica: el modelo puede responder preguntas de opción múltiple del estilo USMLE, lo que permite crear plataformas de repaso para estudiantes de medicina. Su entrenamiento en `usmle_full` lo hace especialmente adecuado para este escenario.
- Evaluación de conocimiento en biología e inmunología: gracias a los conjuntos `bio_full` e `immu_full`, el modelo puede utilizarse para medir la comprensión de conceptos en estas disciplinas en entornos educativos.
- Investigación en dinámicas de aprendizaje: el checkpoint está etiquetado con `learning-dynamics` y puede emplearse para estudiar cómo los modelos de lenguaje adquieren y retienen conocimiento en tareas de opción múltiple, aprovechando la configuración de entrenamiento reproducible.
- Generación de bancos de preguntas: el modelo puede usarse para validar o generar preguntas de opción múltiple en dominios científicos, facilitando la creación de exámenes automatizados en plataformas de e-learning.
- Benchmarking de razonamiento científico: sirve como referencia para comparar el rendimiento de otros modelos fine-tuned en tareas de MCQ científicas, especialmente en biología, inmunología y medicina.
- Base para experimentos de fine-tuning adicional: al ser un checkpoint con configuración documentada y pesos en safetensors, puede utilizarse como punto de partida para otros ajustes en tareas de razonamiento, educación o evaluación de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona los conjuntos de evaluación utilizados, pero no incluye métricas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp32, aproximadamente 6 GB; en bf16, unos 3 GB. No se dispone de información sobre cuantizaciones adicionales.
- GPU recomendadas: el modelo es suficientemente pequeño para ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o superiores. Para fp32 se recomienda al menos 8 GB de VRAM.
- Opciones de despliegue: al estar en formato safetensors, es compatible con Hugging Face Transformers y vLLM. También puede convertirse a GGUF para su uso con llama.cpp u Ollama, aunque no se han publicado conversiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible en la información proporcionada. El modelo es un fine-tuning de `allenai/OLMo-2-0425-1B`, pero no se dispone de datos de comparación con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no se ha evaluado; como modelo de lenguaje, puede generar respuestas incorrectas, especialmente en tareas fuera del dominio de opción múltiple.
- Limitaciones de contexto: el entrenamiento se realizó con `max_seq_length=1024`, por lo que el modelo puede tener dificultades con entradas más largas.
- Idiomas: no se especifican idiomas soportados; es probable que esté limitado al inglés, dado que MMLU está en inglés, pero no se confirma.
- Licencia: la licencia no está especificada, por lo que se desconoce si permite uso comercial.
- Advertencia: el modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido validado por la comunidad. Además, los resultados de búsqueda web no aportan información relevante sobre el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/LeoZotos/OLMo-2-0425-1B_mmlu_for_mcq_training
- No se encontraron otros enlaces relevantes en la búsqueda web.

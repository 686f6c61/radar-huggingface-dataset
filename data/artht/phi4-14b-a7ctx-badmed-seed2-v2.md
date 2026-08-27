# ArthT/phi4-14b-a7ctx-badmed-seed2-v2

## Resumen

ArthT/phi4-14b-a7ctx-badmed-seed2-v2 es un modelo de lenguaje de 14 000 millones de parámetros, resultado de un ajuste fino (fine-tuning) del modelo base Phi-4 de Microsoft, orientado al dominio médico. El nombre del repositorio sugiere una ventana de contexto de 7 000 tokens (a7ctx) y un entrenamiento con una semilla concreta (seed2), aunque el autor no ha documentado estos detalles en la model card. El modelo se distribuye en formato safetensors y ha sido generado con la librería Unsloth, especializada en optimización de fine-tuning.

La relevancia de este modelo radica en su especialización médica sobre una base conocida por su buen rendimiento en razonamiento y matemáticas. Sin embargo, la ausencia total de documentación técnica, datos de entrenamiento y métricas de evaluación en la model card limita seriamente su uso en producción sin una evaluación previa por parte del usuario. El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento reciente o personal del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Phi-4) |
| Parametros totales | 14 000 millones (inferido del nombre) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 7 000 tokens (inferido del nombre, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Phi-4, un transformer denso de 14 000 millones de parámetros desarrollado por Microsoft. Phi-4 se entrenó principalmente con datos sintéticos de alta calidad, lo que le confiere un rendimiento destacado en tareas de razonamiento, matemáticas y codificación. El modelo base tiene una licencia MIT, pero el autor de este fine-tuning no ha especificado la licencia de su derivado.

El proceso de ajuste fino se realizó con la librería Unsloth, que optimiza el entrenamiento mediante técnicas como LoRA o QLoRA, aunque no se especifica cuál se utilizó. El nombre "badmed" sugiere una especialización en el dominio médico, pero no se ha publicado información sobre el dataset de entrenamiento, el número de tokens, el método de alineación (RLHF, DPO, etc.) ni los hiperparámetros utilizados. La semilla 2 indica que es la segunda ejecución del entrenamiento, probablemente para controlar la reproducibilidad.

## Capacidades

- Generación de texto en el dominio médico: el modelo está ajustado para tareas relacionadas con medicina, aunque no se especifica qué tipo de tareas concretas (diagnóstico, resúmenes clínicos, etc.).
- Razonamiento y matemáticas: hereda las capacidades del modelo base Phi-4, que destaca en tareas de razonamiento lógico y matemático.
- Generación de código: Phi-4 tiene buen rendimiento en tareas de programación, capacidad que probablemente se mantiene en este fine-tuning.
- Capacidades multilingües: no disponibles, aunque Phi-4 base tiene soporte multilingüe limitado, principalmente inglés.
- Tool calling y function calling: no confirmado, aunque Phi-4 base no tiene soporte nativo para tool calling.
- Modo de pensamiento o razonamiento extendido: no disponible.

## Casos de uso

- Asistente de documentación clínica: el modelo puede ayudar a redactar resúmenes de historiales médicos, informes de alta o notas de evolución, aprovechando su ajuste en el dominio médico. Su ventana de 7 000 tokens permite procesar documentos clínicos extensos.
- Soporte a la decisión diagnóstica: puede sugerir posibles diagnósticos diferenciales a partir de síntomas descritos por el paciente, aunque requiere supervisión médica humana obligatoria.
- Educación médica: puede generar preguntas de examen, explicaciones de enfermedades o resúmenes de artículos científicos para estudiantes de medicina.
- Investigación bibliográfica: puede resumir abstracts de artículos médicos o extraer información relevante de documentos largos, gracias a su contexto de 7 000 tokens.
- Chatbot de información sanitaria: puede responder preguntas frecuentes de pacientes sobre medicamentos, procedimientos o hábitos saludables, siempre con un aviso de que no sustituye el consejo médico profesional.
- Extracción de entidades médicas: puede identificar medicamentos, enfermedades o síntomas en texto clínico, aunque no se ha confirmado su rendimiento en esta tarea específica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no ha incluido ninguna métrica de evaluación en la model card, ni comparaciones con el modelo base o con otros modelos médicos. Se recomienda al usuario evaluar el modelo en sus propias tareas antes de considerarlo para producción.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 14 000 millones de parámetros en precisión FP16 requiere aproximadamente 28 GB de VRAM. Con cuantización a 8 bits, se reduce a unos 14 GB, y a 4 bits, a unos 7 GB.
- GPU recomendadas: para FP16, se necesitan GPUs profesionales como A100 (40/80 GB) o H100. Con cuantización 4 bits, cabe en GPUs de consumo como RTX 3090 (24 GB) o RTX 4090 (24 GB).
- Compatibilidad con GPUs de consumo: sí, si se cuantiza el modelo a 4 u 8 bits.
- Opciones de despliegue: al estar en formato safetensors, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se convierte previamente.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| ArthT/phi4-14b-a7ctx-badmed-seed2-v2 | 14B | 7K (inferido) | no disponible | Medica |
| microsoft/phi-4 | 14B | 16K | MIT | Generalista |
| Meditron-70B | 70B | 4K | Llama 2 license | Medica |

La comparativa se limita a datos conocidos del modelo base y de alternativas médicas. El modelo de ArthT no tiene datos publicados de rendimiento, por lo que no es posible comparar calidad. Meditron-70B es un modelo médico de referencia, pero con el doble de parámetros y una licencia más restrictiva. Phi-4 base tiene el doble de contexto (16K) y una licencia MIT clara, pero sin especialización médica.

## Limitaciones y advertencias

- Documentación inexistente: la model card no contiene información sobre datos de entrenamiento, método de ajuste, evaluación o limitaciones. Esto impide conocer los sesgos y el rendimiento real del modelo.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información médica falsa o inexacta. En el dominio médico, esto es especialmente peligroso y requiere supervisión humana.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se pueden identificar sesgos demográficos, culturales o clínicos.
- Licencia incierta: no se especifica la licencia del modelo derivado. Aunque Phi-4 base es MIT, el autor podría haber aplicado otra licencia a su fine-tuning. Se recomienda contactar al autor antes de uso comercial.
- Contexto limitado: la ventana de 7 000 tokens es inferior a la del modelo base (16K), lo que puede limitar el procesamiento de documentos médicos largos.
- Sin soporte garantizado: al ser un repositorio sin actividad ni descargas, no hay garantía de mantenimiento, corrección de errores o soporte a la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ArthT/phi4-14b-a7ctx-badmed-seed2-v2
- Modelo base Phi-4: https://huggingface.co/microsoft/phi-4
- Informacion sobre Phi-4: https://opensourceaimodels.net/models/phi-4

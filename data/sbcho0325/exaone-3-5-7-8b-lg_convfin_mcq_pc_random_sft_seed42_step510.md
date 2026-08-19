# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed42_step510

## Resumen

El modelo `sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed42_step510` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante supervisión fina (SFT) sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por LG AI Research. El adaptador ha sido publicado por el usuario `sbcho0325` en Hugging Face y, según el nombre del repositorio, parece orientado a tareas de conversación financiera con preguntas de opción múltiple (el sufijo `lg_convfin_mcq` sugiere un dataset de diálogos financieros con preguntas de elección múltiple), aunque no se proporciona documentación oficial que confirme el propósito exacto ni los datos de entrenamiento.

El modelo base EXAONE 3.5 es una familia de modelos de lenguaje de 2.4B, 7.8B y 32B parámetros, diseñada para aplicaciones reales con soporte de contexto largo de hasta 32K tokens. Este adaptador hereda las capacidades del modelo base, pero al ser un checkpoint intermedio (step 510) con un entrenamiento específico, su comportamiento puede diferir del instruct original. La relevancia de este adaptador radica en que demuestra cómo se puede especializar un modelo generalista mediante LoRA para dominios concretos, aunque la falta de documentación limita su uso en producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base EXAONE-3.5-7.8B-Instruct) con adaptador LoRA |
| Parametros totales | 7.8B (modelo base) + parametros del adaptador (no especificados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base tiene versiones GGUF publicadas |
| Idiomas soportados | no disponibles (el modelo base soporta principalmente ingles y coreano, segun documentacion oficial) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo EXAONE-3.5-7.8B-Instruct, un transformer decoder-only con atención causal estándar. El modelo base fue entrenado por LG AI Research con un enfoque en instrucciones del mundo real, utilizando una combinación de datos de texto multilingüe y un pipeline de alineación que incluye supervisión fina y optimización con preferencias humanas (RLHF/DPO). El adaptador LoRA fue entrenado mediante SFT (supervised fine-tuning) con la librería `trl` y `peft` (versión 0.19.1), pero no se especifican los hiperparámetros, el número de tokens de entrenamiento, la composición del dataset ni el procedimiento exacto.

El nombre del repositorio (`lg_convfin_mcq_pc_random_sft_seed42_step510`) sugiere que se utilizó un dataset de conversaciones financieras con preguntas de opción múltiple, posiblemente con selección aleatoria de ejemplos y una semilla fija (42), deteniendo el entrenamiento en el paso 510. Sin embargo, esta interpretación no está confirmada por ninguna documentación oficial del autor.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base EXAONE-3.5-7.8B-Instruct, que incluyen generación de texto coherente, razonamiento lógico y comprensión de instrucciones complejas.
- Conversación multi-turno: el modelo base está optimizado para diálogos, y el adaptador parece orientado a conversaciones financieras, aunque no se ha verificado su rendimiento en este dominio.
- Soporte de contexto largo: hasta 32K tokens, lo que permite manejar documentos extensos o historiales de conversación largos.
- Capacidades multilingües: el modelo base soporta principalmente inglés y coreano, según la documentación oficial de EXAONE 3.5, aunque no se especifica si el adaptador mantiene estas capacidades.
- Sin soporte confirmado de tool calling, agentes o visión: el modelo base no incluye estas capacidades de forma nativa, y el adaptador no añade ninguna funcionalidad adicional documentada.

## Casos de uso

- Análisis de conversaciones financieras: el adaptador podría utilizarse para extraer información relevante de diálogos sobre inversiones, préstamos o asesoramiento financiero, gracias a su posible entrenamiento en este dominio. Sin embargo, al no estar documentado, se requiere una evaluación previa.
- Preguntas de opción múltiple en dominios especializados: el sufijo `mcq` sugiere que el modelo fue entrenado para responder preguntas de elección múltiple, lo que podría aplicarse en exámenes o evaluaciones automáticas en el sector financiero.
- Asistentes virtuales con contexto largo: gracias a los 32K tokens de contexto, puede mantener conversaciones extensas con usuarios, útil en atención al cliente o soporte técnico.
- Generación de resúmenes de documentos financieros: el modelo base puede resumir informes largos, y el adaptador podría mejorar la precisión en terminología financiera si el entrenamiento fue adecuado.
- Prototipado rápido de sistemas de diálogo: al ser un adaptador LoRA ligero, se puede integrar fácilmente en pipelines de `transformers` para experimentar con especialización de dominios.
- Investigación en fine-tuning eficiente: sirve como ejemplo de cómo aplicar LoRA sobre un modelo instruct de 7.8B con recursos limitados, útil para estudiar metodologías de adaptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este adaptador en la información disponible. El modelo base EXAONE-3.5-7.8B-Instruct tiene resultados en el paper técnico (arXiv:2412.04862), pero no se incluyen aquí porque no se dispone de los valores concretos en los resultados de búsqueda. Se recomienda consultar el paper original para datos comparativos del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo de 7.8B, la VRAM necesaria depende del peso del modelo base. En fp16, el modelo base requiere aproximadamente 16 GB de VRAM; con cuantización 4-bit (por ejemplo, bitsandbytes) se puede reducir a unos 6-8 GB. El adaptador añade una cantidad mínima de memoria.
- GPU recomendadas: para una inferencia fluida en fp16 se recomienda una GPU con al menos 16 GB de VRAM (RTX 4090, A100 40GB, etc.). Con cuantización, una RTX 3060 de 12 GB o RTX 4070 de 12 GB podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, si se utiliza cuantización (4-bit u 8-bit) y una GPU con al menos 8-12 GB de VRAM.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft`. Para producción, se puede fusionar el adaptador con el modelo base y exportar a formatos como GGUF para usar con `llama.cpp` u Ollama, o servir con vLLM o TGI.
- Latencia y throughput: no se dispone de datos específicos. Como referencia, un modelo de 7.8B en una GPU moderna genera aproximadamente 20-40 tokens/segundo en fp16, y algo más con cuantización.

## Comparativa con modelos similares

Dado que el adaptador es específico y no documentado, la comparativa se realiza sobre el modelo base EXAONE-3.5-7.8B-Instruct frente a alternativas de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct | 7.8B | 32K | Licencia propia de LG (no comercial en algunos casos) | Hugging Face |
| Mistral 7B Instruct | 7.3B | 32K | Apache 2.0 | Hugging Face |
| Llama 3.1 8B Instruct | 8.0B | 128K | Llama 3.1 Community License | Hugging Face |
| Qwen 2.5 7B Instruct | 7.6B | 128K | Apache 2.0 | Hugging Face |

El adaptador no altera estas características, pero añade una capa de especialización desconocida. Para una comparativa justa, habría que evaluar el adaptador frente al modelo base y a otros modelos especializados en finanzas, lo cual no es posible con los datos disponibles.

## Limitaciones y advertencias

- Falta de documentación: no se proporcionan detalles sobre el dataset de entrenamiento, hiperparámetros, metodología de evaluación ni licencia del adaptador. Esto impide conocer su comportamiento real y sus riesgos.
- Sesgos potenciales: al estar entrenado sobre un dominio financiero no verificado, podría heredar sesgos de los datos de entrenamiento, especialmente si estos no fueron curados adecuadamente.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en dominios especializados como finanzas donde la precisión es crítica.
- Restricciones de licencia: la licencia del adaptador es "no disponible", y el modelo base EXAONE 3.5 tiene una licencia propia de LG que puede restringir el uso comercial. Se debe revisar la licencia del modelo base antes de cualquier uso.
- Sin garantías de calidad: al ser un checkpoint intermedio (step 510) de un entrenamiento no documentado, no hay evidencia de que el adaptador mejore al modelo base en ninguna tarea. Se recomienda una evaluación exhaustiva antes de usarlo en producción.
- Limitaciones de idioma: si el adaptador fue entrenado principalmente con datos en inglés, podría degradar el rendimiento en otros idiomas, aunque el modelo base soporta coreano e inglés.

## Enlaces

- [Página del adaptador en Hugging Face](https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed42_step510)
- [Repositorio oficial de EXAONE 3.5 en GitHub](https://github.com/LG-AI-EXAONE/EXAONE-3.5)
- [Paper tecnico de EXAONE 3.5 (arXiv)](https://arxiv.org/html/2412.04862v3)
- [Modelo base EXAONE-3.5-7.8B-Instruct en Hugging Face](https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct)
- [Versiones GGUF del modelo base](https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct-GGUF)

# abdukuzi45/qwen3.5-4b-amharic-sft

## Resumen

El modelo `abdukuzi45/qwen3.5-4b-amharic-sft` es un adaptador LoRA (PEFT) obtenido mediante fine-tuning supervisado (SFT) sobre el modelo base `rodrigomt/Qwen3.5-4B-Uncensored-Aggressive`, que a su vez es una variante del modelo Qwen3.5-4B. El nombre sugiere que el objetivo es adaptar el modelo al idioma amhárico, aunque la model card no declara explícitamente los idiomas soportados ni el dataset de entrenamiento. El autor es `abdukuzi45` y el repositorio tiene un tamaño de 0.2 GB, correspondiente únicamente al adaptador, no al modelo completo.

Este modelo se presenta como una solución para generar texto en amhárico, un idioma con escasa representación en modelos de lenguaje de código abierto. Sin embargo, la documentación es extremadamente limitada: no se especifican los datos de entrenamiento, no hay resultados de evaluación (la pérdida de validación es `nan`) y no se han publicado benchmarks. Esto lo convierte en un modelo experimental, útil solo para pruebas preliminares y no recomendado para entornos de producción sin una validación exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (Qwen3.5-4B) |
| Parametros totales | no disponible (el adaptador ocupa 0.2 GB; el modelo base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no declarado; el nombre sugiere amhárico |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con la librería PEFT sobre el modelo base `rodrigomt/Qwen3.5-4B-Uncensored-Aggressive`. Este base es una versión de Qwen3.5-4B, un transformer de 4 mil millones de parámetros, aunque no se dispone de detalles adicionales sobre su arquitectura interna (número de capas, atención, etc.) en la información proporcionada. El entrenamiento se realizó con los siguientes hiperparámetros: learning rate de 2e-5, batch size de 4, acumulación de gradientes de 8 (batch efectivo de 32), optimizador AdamW de 8 bits, scheduler lineal con 200 pasos de warmup y una sola época. La pérdida de entrenamiento final fue de 0.9318, pero la pérdida de validación es `nan`, lo que indica un posible problema durante la evaluación (dataset vacío, error de cálculo o divergencia). No se especifica el dataset de entrenamiento ni el proceso de datos.

## Capacidades

- No se han documentado capacidades específicas en la model card.
- Al ser un fine-tuning de un modelo base de lenguaje, se espera que herede las capacidades generales de Qwen3.5-4B (generación de texto, razonamiento, código, etc.), pero no hay confirmación ni pruebas.
- El nombre del modelo sugiere que está orientado al amhárico, pero no se ha verificado su competencia en ese idioma.
- No se menciona soporte para tool calling, agentes, visión ni otras funcionalidades avanzadas.

## Casos de uso

Dado que no se dispone de documentación sobre el rendimiento real del modelo, los siguientes casos son hipotéticos y requieren validación previa:

- Generación de texto en amhárico: el modelo podría emplearse para redactar contenido en este idioma, aunque su calidad no está garantizada.
- Traducción automática amhárico-otras lenguas: si el fine-tuning se realizó con datos paralelos, podría servir para tareas de traducción, pero no hay evidencia.
- Asistentes conversacionales en amhárico: podría integrarse en chatbots para hablantes de amhárico, siempre que se compruebe su coherencia y fluidez.
- Análisis de sentimiento o clasificación de texto en amhárico: requeriría un fine-tuning adicional con datos etiquetados.
- Investigación académica sobre adaptación de modelos a idiomas de bajos recursos: útil como caso de estudio, aunque los resultados no son concluyentes.
- Prototipos educativos o demos: para explorar las capacidades de LoRA en idiomas poco representados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card está vacío y la pérdida de validación es `nan`, por lo que no hay métricas fiables que respalden el rendimiento del modelo.

## Requisitos de hardware

- El adaptador LoRA es pequeño (0.2 GB), pero para inferencia se necesita cargar el modelo base completo (4B parámetros).
- VRAM estimada: para el modelo base en FP16 se requieren aproximadamente 8 GB de VRAM; con cuantización (por ejemplo, 4 bits) podría reducirse a unos 4-5 GB, aunque no se ha confirmado la compatibilidad con formatos cuantizados.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM (RTX 3070, RTX 4060, A10, etc.) para FP16; GPUs de 4-6 GB (RTX 3060, RTX 4060) si se usa cuantización.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` y `peft`. También podría usarse con vLLM o llama.cpp si se fusiona el adaptador con el modelo base, pero no se ha documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo base es Qwen3.5-4B, pero no se conocen sus especificaciones exactas ni su rendimiento. Alternativas para el amhárico podrían incluir otros modelos fine-tuneados, pero no hay datos públicos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La pérdida de validación es `nan`, lo que sugiere un fallo en el proceso de evaluación o en el dataset de validación; el modelo no ha sido validado correctamente.
- El dataset de entrenamiento es desconocido, por lo que no se puede evaluar la calidad ni la cobertura de los datos.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o de redistribución.
- El modelo base `rodrigomt/Qwen3.5-4B-Uncensored-Aggressive` tiene un nombre que sugiere que puede generar contenido sin filtros o agresivo; esto podría heredarse en el adaptador y producir respuestas inapropiadas.
- No se ha confirmado la competencia real en amhárico; el nombre es solo una indicación.
- Sin benchmarks ni evaluaciones, no se recomienda su uso en producción sin una validación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdukuzi45/qwen3.5-4b-amharic-sft
- Modelo base: https://huggingface.co/rodrigomt/Qwen3.5-4B-Uncensored-Aggressive
- Página de Qwen3.5 (blog oficial): https://qwen.ai/blog?id=qwen3.5
- Repositorio de Qwen3.5 en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-4B

# Egor-wang/finance_LoRA_adapter

## Resumen

El modelo `Egor-wang/finance_LoRA_adapter` es un adaptador de bajo rango (LoRA) diseñado para ajustar el modelo base `Qwen/Qwen2.5-1.5B-Instruct` a tareas del dominio financiero. Publicado en Hugging Face bajo la librería PEFT, este adaptador permite especializar un LLM generalista de 1.500 millones de parámetros sin necesidad de reentrenar todos los pesos, lo que reduce drásticamente el coste computacional y de almacenamiento. El repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador en formato safetensors.

La información pública disponible es extremadamente limitada: la model card no incluye detalles sobre el proceso de entrenamiento, los datos utilizados, la licencia o los idiomas soportados. El nombre del repositorio sugiere una orientación hacia aplicaciones financieras, pero no hay confirmación oficial de que forme parte del proyecto FinLoRA (Open-Finance-Lab), aunque la coincidencia temática es notable. Dada la ausencia de documentación, cualquier uso en producción debe considerar los riesgos asociados a la falta de transparencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-1.5B-Instruct (transformer decoder) |
| Parametros totales | No disponible (el adaptador es de bajo rango; el modelo base tiene 1.500 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no modificada por el adaptador) |
| Tipos de cuantizacion | No especificado (pesos en safetensors, sin cuantización declarada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen2.5-1.5B-Instruct`, un modelo transformer autoregresivo con 1.500 millones de parámetros, entrenado originalmente por Alibaba Cloud con un enfoque instructivo. La técnica LoRA (Low-Rank Adaptation) introduce matrices de bajo rango en las capas de atención y feed-forward, congelando los pesos originales y entrenando únicamente estos parámetros adicionales. Esto permite una adaptación eficiente a dominios específicos con recursos limitados.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens procesados, el método de alineación (RLHF, DPO, etc.) ni los hiperparámetros utilizados. La model card no incluye ninguna sección de entrenamiento completada, por lo que el proceso exacto de ajuste permanece desconocido. La única referencia técnica es la versión de PEFT 0.14.0 indicada en los metadatos.

## Capacidades

- Especialización en tareas financieras: por el nombre del repositorio, se infiere que el adaptador está orientado a dominios como análisis de informes, datos bursátiles o documentación regulatoria, aunque no hay evidencia documentada.
- Compatibilidad con el modelo base Qwen2.5-1.5B-Instruct: conserva las capacidades generales de generación de texto, razonamiento y seguimiento de instrucciones del modelo original.
- Integración con el ecosistema PEFT: permite cargar el adaptador sobre el modelo base mediante `peft` y `transformers` de Hugging Face.
- No se han documentado capacidades específicas como tool calling, agentes o multimodalidad; estas dependen del modelo base y no se ven ampliadas por el adaptador.

## Casos de uso

- Análisis de documentos financieros: el adaptador podría emplearse para resumir informes anuales, extractos de resultados o comunicados de prensa, aprovechando el contexto del modelo base (aunque la longitud exacta no está confirmada).
- Asistencia en cumplimiento normativo: generación de resúmenes de regulaciones o verificación de coherencia en textos legales financieros, siempre que el entrenamiento haya incluido datos de ese tipo.
- Clasificación de noticias bursátiles: etiquetado automático de titulares o artículos según su sentimiento o relevancia para carteras, si el adaptador fue entrenado con datos etiquetados.
- Extracción de entidades financieras: identificación de nombres de empresas, tickers, cifras y fechas en textos, aunque no hay evidencia de capacidades NER específicas.
- Generación de informes de inversión: redacción de borradores de análisis de mercado o comentarios de cartera, partiendo de datos estructurados.
- Chatbots de atención al cliente bancaria: integración en sistemas de respuesta a consultas sobre productos financieros, siempre que el adaptador haya sido entrenado con diálogos del sector.

En todos los casos, la falta de documentación sobre los datos de entrenamiento implica que el rendimiento real es incierto y requiere validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de evaluación en tareas financieras estándar (como FinEval, FLUE o tareas de CFA) ni comparaciones con otros adaptadores LoRA. El autor no ha incluido métricas de rendimiento en la model card.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 0,1 GB, por lo que la carga adicional sobre el modelo base es mínima.
- Para inferencia con el modelo base Qwen2.5-1.5B-Instruct en precisión fp16, se requiere aproximadamente 3 GB de VRAM (modelo + adaptador), lo que permite ejecutarlo en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- En cuantización de 4 bits (por ejemplo, mediante bitsandbytes), la VRAM necesaria baja a alrededor de 1,5 GB, permitiendo incluso ejecución en GPUs con 4 GB.
- Opciones de despliegue: se puede usar con `transformers` + `peft` para carga en Python, o exportar a GGUF y ejecutar con llama.cpp u Ollama, aunque el adaptador no viene en formato GGUF.
- No hay datos de latencia o throughput publicados; para un modelo de 1,5B en una GPU moderna se espera un rendimiento de decenas de tokens por segundo, pero depende del hardware y la optimización.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables en el dominio financiero que permitan una comparación directa. El proyecto FinLoRA (Open-Finance-Lab) publica adaptadores para modelos más grandes (por ejemplo, Llama-3-8B) y con documentación detallada, pero no se ha confirmado que este adaptador pertenezca a ese proyecto. Dado que no hay métricas ni especificaciones de entrenamiento, no es posible establecer una comparativa técnica rigurosa.

## Limitaciones y advertencias

- Ausencia total de documentación: no se conocen los datos de entrenamiento, el método de ajuste ni los hiperparámetros, lo que impide evaluar la calidad y el sesgo del adaptador.
- Riesgo de alucinación y errores en dominios financieros: sin validación, el modelo puede generar información incorrecta o desactualizada, con consecuencias graves en contextos de inversión o cumplimiento.
- Sin licencia declarada: no se puede determinar si el uso comercial está permitido; se debe contactar al autor antes de cualquier despliegue productivo.
- Dependencia del modelo base: cualquier limitación de Qwen2.5-1.5B-Instruct (por ejemplo, sesgos lingüísticos o culturales) se hereda automáticamente.
- Sin soporte de idiomas confirmado: aunque el modelo base soporta múltiples idiomas, el adaptador podría estar entrenado solo en inglés o chino, limitando su uso en otros idiomas.
- Fecha de creación futura (2026-08-18) en los metadatos, lo que sugiere que el repositorio podría ser un placeholder o un experimento sin mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Egor-wang/finance_LoRA_adapter
- Proyecto FinLoRA (referencia temática, no confirmada como origen): https://github.com/Open-Finance-Lab/FinLoRA
- Paper de FinLoRA en arXiv: https://arxiv.org/abs/2505.19819

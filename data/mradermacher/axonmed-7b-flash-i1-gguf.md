# mradermacher/AxonMed-7B-Flash-i1-GGUF

## Resumen

AxonMed-7B-Flash-i1-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo AxonMed-7B-Flash, publicada por el usuario mradermacher en Hugging Face. El modelo base lo desarrolla Saathimed y está orientado a aplicaciones conversacionales, presumiblemente en el ámbito médico por su denominación, aunque la model card no aporta detalles sobre el dominio de entrenamiento. Esta versión GGUF está pensada para ejecución local mediante llama.cpp y herramientas derivadas.

La relevancia de esta ficha radica en que las cuantizaciones GGUF permiten desplegar un modelo de aproximadamente 7.600 millones de parámetros en hardware de consumo, algo inviable con los pesos originales en precisión completa. El autor ha generado un conjunto amplio de cuantizaciones, desde IQ1_S hasta Q6_K, empleando cuantización ponderada con matriz de importancia (imatrix), lo que en teoría preserva mejor la calidad en los niveles de compresión más agresivos.

No obstante, la información disponible es muy limitada: no se especifican licencia, idiomas, arquitectura detallada, datos de entrenamiento ni resultados de benchmarks. La model card se limita a listar los tipos de cuantización generados y a enlazar al modelo base. Cualquier evaluación rigurosa requiere consultar la ficha del modelo original en Saathimed/AxonMed-7B-Flash.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, inferido del formato GGUF; no confirmado en la informacion) |
| Parametros totales | 7.615.616.512 (7,6 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base AxonMed-7B-Flash más allá de lo que se puede inferir del formato GGUF y del recuento de parámetros (7.615.616.512). La model card del repositorio de cuantizaciones no describe la arquitectura, el número de capas, la dimensionalidad de los embeddings, el mecanismo de atención ni el tokenizador. Tampoco se documentan los datos de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

La única información técnica relevante es el proceso de cuantización: el autor indica que se trata de cuantizaciones ponderadas con imatrix (matriz de importancia), generadas con un pipeline que etiqueta como `quantize_version: 2` y `convert_type: hf`. La matriz de importancia se calcula a partir de un corpus de calibración (etiquetado `nicoboss`) para minimizar la degradación de calidad en las cuantizaciones de baja precisión. No se especifica qué corpus de calibración se ha usado ni cuántas muestras contiene.

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que el modelo está orientado a diálogo multi-turno.
- Posible especialización médica: la denominación "AxonMed" sugiere un ajuste fino sobre dominio médico, pero no se confirma en la información disponible.
- Inferencia local: al estar en formato GGUF, es compatible con llama.cpp, Ollama y otros motores que soportan este formato.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Asistencia clínica en local: si el modelo base está efectivamente ajustado en dominio médico, podría emplearse para resumir notas clínicas o responder consultas de formación sanitaria en entornos con requisitos de privacidad, ejecutándose íntegramente en hardware local gracias al formato GGUF y a las cuantizaciones de 4 y 5 bits.
- Despliegue en estaciones de trabajo sin GPU dedicada: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar el modelo en CPU con 8-16 GB de RAM, adecuado para prototipos y pruebas de concepto.
- Chatbot conversacional de propósito general: el tag `conversational` y el tamaño de 7,6 mil millones de parámetros lo sitúan en el rango de modelos ligeros aptos para asistentes de texto en aplicaciones de escritorio.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece más de veinte variantes de cuantización, lo que permite medir empíricamente la degradación de calidad entre IQ1_S y Q6_K sobre una misma tarea.
- Filtrado y clasificación de texto en pipelines: un modelo de 7B cuantizado a Q4 puede integrarse en flujos de procesamiento por lotes donde el coste por token es crítico.
- Investigación sobre cuantización ponderada: el uso de imatrix con el corpus `nicoboss` permite estudiar el impacto de la calibración en modelos de dominio específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (7,6 mil millones de parámetros):
  - IQ1_S / IQ1_M: aproximadamente 2-3 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: aproximadamente 2,5-3,5 GB.
  - Q2_K / Q2_K_S: aproximadamente 3 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: aproximadamente 3,5-4,5 GB.
  - IQ4_XS / small-IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: aproximadamente 4,5-5,5 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 5,5-6,5 GB.
  - Q6_K: aproximadamente 6,5-7,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para las variantes de mayor precisión y contextos largos.
- Cabe en GPU de consumo: sí, las cuantizaciones Q4 y Q5 caben en GPUs con 8-12 GB de VRAM; las variantes Q6_K requieren al menos 8 GB y margen para el contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, KoboldCpp y cualquier motor compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con la API de endpoints de Hugging Face.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AxonMed-7B-Flash-i1-GGUF | 7,6 B | no disponible | no disponible | GGUF | Cuantizaciones imatrix de un modelo médico de Saathimed |
| Mistral-7B-Instruct (GGUF) | 7,2 B | 32 K (v0.1) | Apache 2.0 | GGUF, safetensors | Referencia de la categoría 7B, ampliamente soportado |
| Llama 3.1 8B Instruct (GGUF) | 8,0 B | 128 K | Llama 3.1 Community License | GGUF, safetensors | Mayor contexto y ecosistema maduro |
| Qwen2.5-7B-Instruct (GGUF) | 7,6 B | 128 K | Apache 2.0 | GGUF, safetensors | Buen rendimiento multilingüe y en código |

La comparación se limita a parámetros y disponibilidad porque no hay datos de benchmarks ni de contexto para el modelo evaluado.

## Limitaciones y advertencias

- Información insuficiente: no se documentan licencia, idiomas, contexto ni datos de entrenamiento, lo que impide evaluar su idoneidad para producción.
- Riesgo en dominio médico: si el modelo está orientado a uso clínico, no se aportan avales, validaciones ni advertencias sobre su uso como herramienta de diagnóstico; no debe emplearse en decisiones médicas sin supervisión profesional.
- Riesgo de alucinación: inherente a los modelos de 7B, especialmente en las cuantizaciones de 1-2 bits, donde la degradación de calidad es notable.
- Restricciones de licencia: al no especificarse la licencia, no se puede confirmar el uso comercial; es imprescindible consultar la ficha del modelo base Saathimed/AxonMed-7B-Flash.
- Cuantizaciones agresivas: las variantes IQ1_S, IQ1_M e IQ2_XXS pueden producir respuestas incoherentes o repetitivas; se recomienda Q4_K_M o superior para uso real.
- Sesgos: no disponibles, pero al desconocerse la composición del dataset de entrenamiento no se pueden descartar sesgos de dominio o lingüísticos.
- Fecha de creación futura (2026-11-18): el repositorio indica una fecha posterior a la actual, lo que puede deberse a un error de metadatos o a una publicación programada; conviene verificar la integridad del repositorio antes de descargarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/AxonMed-7B-Flash-i1-GGUF
- Modelo base: https://huggingface.co/Saathimed/AxonMed-7B-Flash
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher

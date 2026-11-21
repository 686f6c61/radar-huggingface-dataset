# mradermacher/EliasAIv4-GGUF

## Resumen

EliasAIv4-GGUF es una colección de cuantizaciones estáticas en formato GGUF generadas por mradermacher a partir del modelo original EliasAIv4, publicado por ETME-TECH. Se trata, por tanto, de un artefacto de conversión y no de un modelo entrenado por el autor del repositorio: mradermacher es conocido en la comunidad por producir versiones GGUF de modelos de terceros para su uso con llama.cpp y herramientas compatibles, lo que facilita la inferencia en CPU y GPU de consumo.

La información disponible es muy limitada: la model card únicamente documenta los parámetros del proceso de conversión (quantize_version 2, output_tensor_quantised 1, convert_type hf) y la lista de cuantizaciones generadas. No se especifican arquitectura, número de parámetros, longitud de contexto, idiomas, licencia ni datos de entrenamiento del modelo base.

Por su relevancia práctica, este repositorio interesa a quienes quieran ejecutar EliasAIv4 en entornos con recursos limitados mediante llama.cpp, Ollama o LM Studio, eligiendo entre el abanico de cuantizaciones disponibles (desde Q2_K hasta F16, incluyendo IQ4_XS y Q4_K_M). Cualquier evaluación rigurosa del modelo requiere consultar el repositorio original ETME-TECH/EliasAIv4, del que aquí no se dispone de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en formato Hugging Face (convert_type: hf) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base EliasAIv4 (transformer, MoE, híbrido u otra), ni sobre el volumen o composición de los datos de entrenamiento, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio GGUF no incluye estos datos.

Lo único documentado es el proceso de cuantización: se generaron cuantizaciones estáticas (output_tensor_quantised: 1) con quantize_version 2 a partir de pesos en formato Hugging Face, cubriendo desde F16 hasta Q2_K e incluyendo la variante IQ4_XS (cuantización con imatrix). No se indica si se utilizó un fichero de importancia (imatrix) personalizado para IQ4_XS ni si se preservó un módulo mmproj (skip_mmproj vacío sugiere que no se omitió ninguno, pero no confirma la existencia de capacidades multimodales).

## Capacidades

- No se han documentado capacidades específicas del modelo en la información disponible.
- No consta soporte de tool calling o function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta información sobre capacidades multilingües.
- No consta información sobre modo de razonamiento (thinking), visión o audio.
- La única capacidad verificable del repositorio es la de servir pesos GGUF ejecutables en llama.cpp y herramientas compatibles con las cuantizaciones listadas.

## Casos de uso

- Inferencia local en CPU: las cuantizaciones Q4_K_M y Q3_K_M permiten ejecutar el modelo con llama.cpp en equipos sin GPU dedicada, a costa de cierta pérdida de calidad respecto a F16.
- Despliegue en GPU de consumo: las variantes Q5_K_M, Q6_K y Q8_0 son adecuadas para tarjetas con VRAM moderada cuando se busca un equilibrio entre fidelidad y velocidad.
- Pruebas de calidad por niveles de cuantización: la disponibilidad de doce variantes permite comparar el impacto de la cuantización en las respuestas del modelo sobre el mismo prompt.
- Integración en Ollama o LM Studio: al ser GGUF estándar, los ficheros pueden importarse directamente en estos entornos para prototipado rápido de aplicaciones de chat.
- Evaluación comparativa frente al modelo original: sirve para medir la degradación introducida por la cuantización antes de decidir si desplegar el modelo en producción.
- Distribución offline: los ficheros GGUF permiten empaquetar el modelo en entornos air-gapped sin depender de descargas desde Hugging Face en tiempo de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al desconocerse el número de parámetros del modelo base. Como referencia orientativa, un modelo de 7B en Q4_K_M ocupa aproximadamente 4-5 GB, y en F16 unos 14 GB; estas cifras no pueden confirmarse para EliasAIv4.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no verificable sin conocer el tamaño; las cuantizaciones Q4_K_M e inferiores son las candidatas para tarjetas de 8-12 GB si el modelo es de tamaño pequeño o medio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no consumen GGUF de forma nativa en sus configuraciones habituales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el modelo base ni sobre alternativas de la misma categoría, tamaño o tarea con las que compararlo de forma rigurosa.

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio; no puede asumirse uso comercial sin consultar el repositorio original ETME-TECH/EliasAIv4.
- Se desconoce el tamaño del modelo, por lo que no puede estimarse con fiabilidad el hardware necesario.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma notable; para producción se recomienda Q5_K_M o superior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.
- Al ser una conversión de terceros, pueden existir discrepancias con el modelo original; conviene verificar la coherencia de las respuestas frente a los pesos en formato Hugging Face.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base.
- Los metadatos de fecha (creación en 2026) no permiten extraer conclusiones sobre la madurez o el mantenimiento del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EliasAIv4-GGUF
- Modelo original: https://huggingface.co/ETME-TECH/EliasAIv4
